const githubAuthorizeUrl = 'https://github.com/login/oauth/authorize';
const githubTokenUrl = 'https://github.com/login/oauth/access_token';
const githubRepositorioUrl = 'https://api.github.com/repos/mraxlrose/profekaryne';
const googleTokenUrl = 'https://oauth2.googleapis.com/token';
const googleAnalyticsUrl = 'https://analyticsdata.googleapis.com/v1beta/properties';
let tokenGoogleEmMemoria;

function htmlMensagem(status, conteudo) {
  const mensagem = `authorization:github:${status}:${JSON.stringify(conteudo)}`;
  return `<!doctype html><html><body><script>
    const responder = (evento) => {
      if (window.opener) window.opener.postMessage(${JSON.stringify(mensagem)}, evento.origin);
      window.removeEventListener('message', responder, false);
      window.close();
    };
    window.addEventListener('message', responder, false);
    if (window.opener) window.opener.postMessage('authorizing:github', '*');
  </script><p>Concluindo login...</p></body></html>`;
}

function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

async function assinar(texto, segredo) {
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64url(new Uint8Array(await crypto.subtle.sign('HMAC', chave, new TextEncoder().encode(texto))));
}

async function criarState(segredo) {
  const payload = `${Date.now()}.${crypto.randomUUID()}`;
  return `${payload}.${await assinar(payload, segredo)}`;
}

async function stateValido(state, segredo) {
  const partes = state?.split('.') || [];
  if (partes.length !== 3) return false;
  const payload = `${partes[0]}.${partes[1]}`;
  const assinatura = await assinar(payload, segredo);
  return assinatura === partes[2] && Date.now() - Number(partes[0]) < 10 * 60 * 1000;
}

function respostaJson(dados, status, origem) {
  return new Response(JSON.stringify(dados), { status: status || 200, headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': origem, 'access-control-allow-headers': 'authorization, content-type', 'access-control-allow-methods': 'GET, OPTIONS', 'cache-control': 'private, max-age=300' } });
}

function base64urlTexto(texto) {
  return base64url(new TextEncoder().encode(texto));
}

function bytesPem(chave) {
  const base64 = chave.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  return Uint8Array.from(atob(base64), caractere => caractere.charCodeAt(0));
}

async function tokenGoogle(env) {
  if (tokenGoogleEmMemoria && tokenGoogleEmMemoria.expiraEm > Date.now() + 60_000) return tokenGoogleEmMemoria.valor;
  const agora = Math.floor(Date.now() / 1000);
  const cabecalho = base64urlTexto(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const corpo = base64urlTexto(JSON.stringify({ iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL, scope: 'https://www.googleapis.com/auth/analytics.readonly', aud: googleTokenUrl, iat: agora, exp: agora + 3600 }));
  const chave = await crypto.subtle.importKey('pkcs8', bytesPem(env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const assinatura = base64url(new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', chave, new TextEncoder().encode(`${cabecalho}.${corpo}`))));
  const resposta = await fetch(googleTokenUrl, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${cabecalho}.${corpo}.${assinatura}` }) });
  if (!resposta.ok) throw new Error('Não foi possível autenticar na API do Google Analytics.');
  const dados = await resposta.json();
  tokenGoogleEmMemoria = { valor: dados.access_token, expiraEm: Date.now() + (dados.expires_in || 3600) * 1000 };
  return tokenGoogleEmMemoria.valor;
}

async function editorAutorizado(request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return false;
  const resposta = await fetch(githubRepositorioUrl, { headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' } });
  if (!resposta.ok) return false;
  const repositorio = await resposta.json();
  return Boolean(repositorio.permissions?.push || repositorio.permissions?.maintain || repositorio.permissions?.admin);
}

async function consultarGA4(env, token, metodo, corpo) {
  const resposta = await fetch(`${googleAnalyticsUrl}/${env.GA4_PROPERTY_ID}:${metodo}`, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(corpo) });
  if (!resposta.ok) throw new Error(`Consulta do Analytics indisponível (${resposta.status}).`);
  return resposta.json();
}

function consultaPadrao(dias, dimensions, metrics, limite, ordenar) {
  const corpo = { dateRanges: [{ startDate: `${dias}daysAgo`, endDate: 'today' }], dimensions: dimensions.map(name => ({ name })), metrics: metrics.map(name => ({ name })), limit: limite || 10 };
  if (ordenar) corpo.orderBys = [{ metric: { metricName: ordenar }, desc: true }];
  return corpo;
}

async function dadosAnalytics(env, dias) {
  const token = await tokenGoogle(env);
  const consultas = {
    resumo: consultaPadrao(dias, [], ['activeUsers', 'newUsers', 'sessions', 'screenPageViews', 'engagementRate', 'averageSessionDuration', 'keyEvents'], 1),
    evolucao: consultaPadrao(dias, ['date'], ['activeUsers', 'sessions', 'screenPageViews'], 100),
    geografia: consultaPadrao(dias, ['country', 'region', 'city'], ['activeUsers', 'sessions'], 12, 'activeUsers'),
    canais: consultaPadrao(dias, ['sessionDefaultChannelGroup'], ['sessions', 'activeUsers', 'keyEvents'], 10, 'sessions'),
    origem: consultaPadrao(dias, ['sessionSourceMedium'], ['sessions', 'activeUsers'], 10, 'sessions'),
    paginas: consultaPadrao(dias, ['pagePath'], ['screenPageViews', 'activeUsers', 'averageSessionDuration'], 10, 'screenPageViews'),
    dispositivos: consultaPadrao(dias, ['deviceCategory'], ['activeUsers', 'sessions'], 10, 'activeUsers'),
    eventos: consultaPadrao(dias, ['eventName'], ['eventCount', 'keyEvents'], 10, 'eventCount')
  };
  const nomes = Object.keys(consultas);
  const resultados = await Promise.all(nomes.map(async nome => {
    try { return [nome, await consultarGA4(env, token, 'runReport', consultas[nome])]; }
    catch (erro) { return [nome, { erro: erro.message }]; }
  }));
  let tempoReal;
  try { tempoReal = await consultarGA4(env, token, 'runRealtimeReport', { metrics: [{ name: 'activeUsers' }], dimensions: [{ name: 'country' }], limit: 8 }); }
  catch (erro) { tempoReal = { erro: erro.message }; }
  return { dias, geradoEm: new Date().toISOString(), relatorios: Object.fromEntries(resultados), tempoReal };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origem = env.ALLOWED_ORIGIN;

    if (!origem || !env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.STATE_SECRET) {
      return new Response('Configuração do CMS incompleta.', { status: 500 });
    }
    if (url.pathname === '/analytics' && request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'access-control-allow-origin': origem, 'access-control-allow-headers': 'authorization, content-type', 'access-control-allow-methods': 'GET, OPTIONS' } });
    if (url.pathname === '/analytics') {
      if (!await editorAutorizado(request)) return respostaJson({ error: 'Acesso não autorizado.' }, 401, origem);
      if (!env.GA4_PROPERTY_ID || !env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) return respostaJson({ error: 'Métricas ainda não configuradas.', setupRequired: true }, 503, origem);
      const dias = [7, 30, 90].includes(Number(url.searchParams.get('days'))) ? Number(url.searchParams.get('days')) : 30;
      try { return respostaJson(await dadosAnalytics(env, dias), 200, origem); }
      catch (erro) { return respostaJson({ error: erro.message }, 502, origem); }
    }
    if (url.pathname === '/') return new Response('Autenticação do CMS ativa.');

    if (url.pathname === '/auth') {
      const state = await criarState(env.STATE_SECRET);
      const login = new URL(githubAuthorizeUrl);
      login.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      login.searchParams.set('redirect_uri', `${url.origin}/callback`);
      login.searchParams.set('scope', 'public_repo');
      login.searchParams.set('state', state);
      return Response.redirect(login.toString(), 302);
    }

    if (url.pathname === '/callback') {
      const state = url.searchParams.get('state');
      const erro = url.searchParams.get('error');
      if (erro || !(await stateValido(state, env.STATE_SECRET))) {
        return new Response(htmlMensagem('error', { error: erro || 'state inválido', provider: 'github' }), { headers: { 'content-type': 'text/html; charset=utf-8' } });
      }
      const resposta = await fetch(githubTokenUrl, {
        method: 'POST',
        headers: { Accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code: url.searchParams.get('code'), state })
      });
      const dados = await resposta.json();
      const status = dados.access_token ? 'success' : 'error';
      const corpo = dados.access_token ? { token: dados.access_token, provider: 'github' } : { error: dados.error || 'falha ao autenticar', provider: 'github' };
      return new Response(htmlMensagem(status, corpo), { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    return new Response('Não encontrado.', { status: 404 });
  }
};
