/* Carrega os textos administráveis em content/site.json.
   O HTML mantém seus textos originais como fallback caso o arquivo não carregue. */
(async function carregarConteudo() {
  try {
    const [siteResposta, agendaResposta, contatosResposta, marcaResposta, valoresResposta, jogosResposta] = await Promise.all([
      fetch('content/site.json', { cache: 'no-store' }),
      fetch('content/agenda.json', { cache: 'no-store' }),
      fetch('content/contatos.json', { cache: 'no-store' }),
      fetch('content/marca.json', { cache: 'no-store' }), fetch('content/valores.json', { cache: 'no-store' }), fetch('content/jogos.json', { cache: 'no-store' })
    ]);
    if (![siteResposta, agendaResposta, contatosResposta, marcaResposta, valoresResposta, jogosResposta].every(r => r.ok)) throw new Error('Conteúdo indisponível');
    const conteudo = { site: await siteResposta.json(), gestao: { ...await agendaResposta.json(), ...await contatosResposta.json(), ...await marcaResposta.json() }, valores: await valoresResposta.json(), jogos: await jogosResposta.json() };

    document.querySelectorAll('[data-content]').forEach((elemento) => {
      const caminho = elemento.dataset.content.includes('.') ? elemento.dataset.content : `site.${elemento.dataset.content}`;
      const valor = caminho.split('.').reduce((objeto, chave) => objeto?.[chave], conteudo);
      if (typeof valor !== 'string') return;
      if (elemento.dataset.contentAttribute) {
        elemento.setAttribute(elemento.dataset.contentAttribute, elemento.dataset.contentFormat === 'mailto' ? `mailto:${valor}` : valor);
        if (elemento.tagName !== 'IMG') elemento.textContent = valor;
      } else elemento.textContent = valor;
      if (elemento.dataset.contentMultiline === 'true') elemento.style.whiteSpace = 'pre-line';
    });

    const aviso = conteudo.gestao.aviso;
    if (aviso.ativo && aviso.texto) {
      const faixa = document.createElement('div');
      faixa.className = 'site-alerta';
      faixa.textContent = aviso.texto;
      document.body.prepend(faixa);
    }
    renderizarCards('.valores-grid', conteudo.valores.itens, 'valor');
    renderizarCards('.jogos-grid', conteudo.jogos.itens, 'jogo');
    const tabela = document.querySelector('.schedule-table tbody');
    if (tabela && conteudo.gestao.horarios.linhas?.length) tabela.innerHTML = conteudo.gestao.horarios.linhas.map(l => `<tr><td><strong>${l.dia}</strong></td><td>${l.manha}</td><td>${l.tarde}</td><td>${l.noite}</td></tr>`).join('');
  } catch (erro) {
    console.warn('Os textos administráveis não puderam ser carregados.', erro);
  }
})();

function renderizarCards(seletor, itens, tipo) {
  const area = document.querySelector(seletor); if (!area || !itens?.length) return;
  area.innerHTML = itens.map(item => tipo === 'valor' ? `<div class="valor-card"><div class="servico-icon" style="margin:0 auto .5rem">${item.icone}</div><h3>${item.titulo}</h3><div class="valor-preco">${item.preco}</div><div class="valor-periodo">${item.periodo}</div><ul class="valor-lista">${item.itens.map(t => `<li><span class="check">✓</span>${t}</li>`).join('')}</ul></div>` : `<div class="jogo-card"><div class="jogo-thumb">${item.emoji}<span class="jogo-badge-hotmart">${item.badge}</span></div><div class="jogo-body"><h3>${item.titulo}</h3><div class="jogo-nivel">${item.nivel}</div><p>${item.descricao}</p><div class="jogo-footer"><div class="jogo-preco"><span>${item.preco}</span></div><a href="${item.link}" target="_blank" class="btn-hotmart">${item.botao}</a></div></div></div>`).join('');
}
