/* Carrega os textos administráveis em content/site.json.
   O HTML mantém seus textos originais como fallback caso o arquivo não carregue. */
(async function carregarConteudo() {
  try {
    const resposta = await fetch('content/site.json', { cache: 'no-store' });
    if (!resposta.ok) throw new Error('Conteúdo indisponível');
    const conteudo = await resposta.json();

    document.querySelectorAll('[data-content]').forEach((elemento) => {
      const valor = elemento.dataset.content.split('.').reduce((objeto, chave) => objeto?.[chave], conteudo);
      if (typeof valor !== 'string') return;
      elemento.textContent = valor;
      if (elemento.dataset.contentMultiline === 'true') elemento.style.whiteSpace = 'pre-line';
    });
  } catch (erro) {
    console.warn('Os textos administráveis não puderam ser carregados.', erro);
  }
})();
