(function () {
  var arquivos = ['site.json', 'agenda.json', 'contatos.json', 'marca.json', 'valores.json', 'jogos.json', 'agendamentos.json', 'notas-publicacao.json'];
  var status = document.getElementById('km-publish-status');
  status.hidden = true;

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
  verificarPublicacao();
  setInterval(verificarPublicacao, 30000);
})();
