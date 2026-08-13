const githubAuthorizeUrl = 'https://github.com/login/oauth/authorize';
const githubTokenUrl = 'https://github.com/login/oauth/access_token';

function htmlMensagem(status, conteudo, origem) {
  const mensagem = `authorization:github:${status}:${JSON.stringify(conteudo)}`;
  return `<!doctype html><html><body><script>
    (function () {
      if (window.opener) window.opener.postMessage(${JSON.stringify(mensagem)}, ${JSON.stringify(origem)});
      window.close();
    })();
  </script><p>Você já pode fechar esta janela.</p></body></html>`;
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origem = env.ALLOWED_ORIGIN;

    if (!origem || !env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.STATE_SECRET) {
      return new Response('Configuração do CMS incompleta.', { status: 500 });
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
        return new Response(htmlMensagem('error', { error: erro || 'state inválido', provider: 'github' }, origem), { headers: { 'content-type': 'text/html; charset=utf-8' } });
      }
      const resposta = await fetch(githubTokenUrl, {
        method: 'POST',
        headers: { Accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code: url.searchParams.get('code'), state })
      });
      const dados = await resposta.json();
      const status = dados.access_token ? 'success' : 'error';
      const corpo = dados.access_token ? { token: dados.access_token, provider: 'github' } : { error: dados.error || 'falha ao autenticar', provider: 'github' };
      return new Response(htmlMensagem(status, corpo, origem), { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    return new Response('Não encontrado.', { status: 404 });
  }
};
