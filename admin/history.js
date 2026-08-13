(function () {
  var repositorio = 'mraxlrose/profekaryne';
  var api = 'https://api.github.com/repos/' + repositorio + '/commits';
  var area = document.getElementById('history');

  function escapar(valor) {
    return String(valor || '').replace(/[&<>"']/g, function (caractere) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caractere];
    });
  }

  function dataLocal(valor) {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(valor));
  }

  function textoDoPatch(patch, sinal, cabecalho) {
    if (!patch) return 'O GitHub não disponibilizou o trecho desta alteração.';
    var linhas = patch.split('\n').filter(function (linha) {
      return linha.charAt(0) === sinal && linha.indexOf(cabecalho) !== 0;
    }).map(function (linha) { return linha.slice(1); });
    return linhas.length ? linhas.join('\n') : '(não houve linhas neste lado da alteração)';
  }

  function mostrarDetalhes(botao, commit) {
    var destino = botao.parentNode.querySelector('.details');
    if (destino.dataset.carregado === 'sim') { destino.hidden = !destino.hidden; botao.textContent = destino.hidden ? 'Ver detalhes' : 'Ocultar detalhes'; return; }
    destino.hidden = false; destino.textContent = 'Carregando comparação…';
    fetch(api + '/' + commit.sha, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (resposta) { if (!resposta.ok) throw new Error(); return resposta.json(); })
      .then(function (detalhe) {
        destino.dataset.carregado = 'sim'; botao.textContent = 'Ocultar detalhes';
        destino.innerHTML = (detalhe.files || []).map(function (arquivo) {
          var antes = textoDoPatch(arquivo.patch, '-', '---');
          var depois = textoDoPatch(arquivo.patch, '+', '+++');
          return '<section class="file"><div class="file-title">' + escapar(arquivo.filename) + '<small>+' + arquivo.additions + ' / −' + arquivo.deletions + '</small></div>' +
            '<div class="changes"><div class="change before"><h3>Estava assim</h3><pre>' + escapar(antes) + '</pre></div>' +
            '<div class="change after"><h3>Ficou assim</h3><pre>' + escapar(depois) + '</pre></div></div></section>';
        }).join('') || '<p>Nenhum arquivo alterado neste registro.</p>';
      }).catch(function () { destino.textContent = 'Não foi possível carregar os detalhes agora. Tente novamente em alguns instantes.'; });
  }

  function criarCommit(commit) {
    var dados = commit.commit;
    var artigo = document.createElement('article'); artigo.className = 'commit';
    artigo.innerHTML = '<div class="commit-header"><h2>' + escapar(dados.message.split('\n')[0]) + '</h2><span class="meta">' + dataLocal(dados.author.date) + '</span></div>' +
      '<div class="meta">Por ' + escapar(dados.author.name) + ' · código ' + escapar(commit.sha.slice(0, 7)) + '</div>' +
      '<button type="button">Ver detalhes</button><div class="details" hidden></div>' +
      '<a class="external" href="' + escapar(commit.html_url) + '" target="_blank" rel="noopener">Abrir no GitHub ↗</a>';
    artigo.querySelector('button').addEventListener('click', function () { mostrarDetalhes(this, commit); });
    return artigo;
  }

  fetch(api + '?sha=main&per_page=30', { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (resposta) { if (!resposta.ok) throw new Error(); return resposta.json(); })
    .then(function (commits) {
      area.className = ''; area.innerHTML = '';
      commits.forEach(function (commit) { area.appendChild(criarCommit(commit)); });
    })
    .catch(function () {
      area.textContent = 'Não foi possível carregar o histórico. Verifique sua conexão e tente atualizar a página.';
    });
})();
