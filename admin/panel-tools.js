(function () {
  var arquivos = ['site.json', 'agenda.json', 'contatos.json', 'marca.json', 'valores.json', 'jogos.json', 'agendamentos.json', 'notas-publicacao.json'];
  var status = document.getElementById('km-publish-status');
  var listaRestauradaOriginal = false;
  status.hidden = true;

  function textoNormalizado(elemento) {
    return (elemento.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function botoesSalvar() {
    return Array.from(document.querySelectorAll('button')).filter(function (botao) {
      return textoNormalizado(botao) === 'salvar' && !botao.closest('.km-panel-actions');
    });
  }

  function liberarIndicadorRestaurado() {
    listaRestauradaOriginal = false;
    botoesSalvar().forEach(function (botao) {
      if (botao.dataset.kmRestauradoOriginal === 'true') {
        botao.disabled = false;
        botao.title = '';
        delete botao.dataset.kmRestauradoOriginal;
      }
    });
  }

  function limparIndicadorRestaurado() {
    if (!listaRestauradaOriginal) return;
    document.querySelectorAll('*').forEach(function (elemento) {
      if (elemento.children.length === 0 && textoNormalizado(elemento) === 'alteracoes nao salvas') {
        elemento.textContent = 'ALTERAÇÕES SALVAS';
        elemento.style.color = '#008000';
      }
    });
    botoesSalvar().forEach(function (botao) {
      botao.disabled = true;
      botao.title = 'A exclusão foi desfeita e a lista voltou ao conteúdo original.';
      botao.dataset.kmRestauradoOriginal = 'true';
    });
  }

  function baixarBackup() {
    var botao = document.getElementById('km-backup'); botao.disabled = true; botao.textContent = 'Preparando…';
    Promise.all(arquivos.map(function (arquivo) {
      return fetch('/content/' + arquivo, { cache: 'no-store' }).then(function (resposta) {
        if (!resposta.ok) throw new Error(); return resposta.json();
      }).then(function (conteudo) { return [arquivo, conteudo]; });
    })).then(function (dados) {
      var backup = { geradoEm: new Date().toISOString(), arquivos: Object.fromEntries(dados) };
      var arquivo = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      var link = document.createElement('a'); link.href = URL.createObjectURL(arquivo);
      link.download = 'backup-km-' + new Date().toISOString().slice(0, 10) + '.json'; link.click(); URL.revokeObjectURL(link.href);
    }).catch(function () { alert('Não foi possível gerar o backup. Tente novamente.'); })
      .finally(function () { botao.disabled = false; botao.textContent = 'Baixar backup'; });
  }

  function verificarPublicacao() {
    var cabecalhos = { Accept: 'application/vnd.github+json' };
    Promise.all([
      fetch('https://api.github.com/repos/mraxlrose/profekaryne/pages/builds/latest', { headers: cabecalhos }).then(function (resposta) { if (!resposta.ok) throw new Error(); return resposta.json(); }),
      fetch('https://api.github.com/repos/mraxlrose/profekaryne/commits/main', { headers: cabecalhos }).then(function (resposta) { if (!resposta.ok) throw new Error(); return resposta.json(); })
    ]).then(function (resultado) {
        var build = resultado[0]; var commitAtual = resultado[1];
        if (build.status === 'built' && build.commit === commitAtual.sha) {
          status.className = 'km-publish-status ok';
          status.textContent = 'Site publicado · atualização concluída.';
          status.hidden = false;
          setTimeout(function () { status.hidden = true; }, 8000);
        } else {
          status.className = 'km-publish-status wait';
          status.textContent = 'Publicação em andamento. O site ainda está recebendo a última alteração.';
          status.hidden = false;
        }
      }).catch(function () {
        status.hidden = true;
      });
  }

  document.getElementById('km-backup').addEventListener('click', baixarBackup);
  document.getElementById('km-discard').addEventListener('click', function () {
    if (confirm('Descartar as alterações ainda não salvas deste formulário? O último rascunho salvo continuará disponível.')) window.location.reload();
  });
  window.addEventListener('km-cms-lista-alterada', liberarIndicadorRestaurado);
  window.addEventListener('km-cms-lista-restaurada-original', function (evento) {
    if (!evento.detail || !evento.detail.limparIndicador) return;
    listaRestauradaOriginal = true;
    setTimeout(limparIndicadorRestaurado, 50);
  });
  document.addEventListener('input', liberarIndicadorRestaurado, true);
  new MutationObserver(limparIndicadorRestaurado).observe(document.body, { childList: true, subtree: true });
  verificarPublicacao();
  setInterval(verificarPublicacao, 30000);
})();
