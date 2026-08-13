(function () {
  var repositorio = 'mraxlrose/profekaryne';
  var api = 'https://api.github.com/repos/' + repositorio + '/commits';
  var area = document.getElementById('history');

  function tokenDaSessao() {
    try {
      var salvo = localStorage.getItem('netlify-cms-user') || localStorage.getItem('decap-cms-user');
      var usuario = salvo && JSON.parse(salvo);
      return usuario && (usuario.token || usuario.access_token);
    } catch (erro) { return null; }
  }

  function requisicao(url, opcoes) {
    opcoes = opcoes || {}; opcoes.headers = opcoes.headers || {};
    opcoes.headers.Accept = 'application/vnd.github+json';
    var token = tokenDaSessao();
    if (token) opcoes.headers.Authorization = 'Bearer ' + token;
    return fetch(url, opcoes);
  }

  function usuarioAtual() {
    if (!tokenDaSessao()) return Promise.resolve(null);
    return requisicao('https://api.github.com/user').then(function (resposta) {
      return resposta.ok ? resposta.json() : null;
    }).catch(function () { return null; });
  }

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
    requisicao(api + '/' + commit.sha)
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

  function restaurarConteudo(botao, commit) {
    if (!confirm('Restaurar somente os arquivos de conteúdo desta versão? Isso criará uma nova publicação e não poderá ser desfeito pelo painel.')) return;
    botao.disabled = true; botao.textContent = 'Restaurando…';
    requisicao(api + '/' + commit.sha).then(function (resposta) {
      if (!resposta.ok) throw new Error(); return resposta.json();
    }).then(function (detalhe) {
      var arquivos = (detalhe.files || []).filter(function (arquivo) { return /^content\/.+\.json$/.test(arquivo.filename); });
      if (!arquivos.length) throw new Error('Sem arquivos de conteúdo');
      return Promise.all(arquivos.map(function (arquivo) {
        if (arquivo.status === 'removed') return { path: arquivo.filename, sha: null };
        var caminho = arquivo.filename.split('/').map(encodeURIComponent).join('/');
        return requisicao('https://api.github.com/repos/' + repositorio + '/contents/' + caminho + '?ref=' + commit.sha)
          .then(function (resposta) { if (!resposta.ok) throw new Error(); return resposta.json(); })
          .then(function (conteudo) {
            var binario = atob((conteudo.content || '').replace(/\n/g, ''));
            var bytes = Uint8Array.from(binario, function (caractere) { return caractere.charCodeAt(0); });
            return { path: arquivo.filename, mode: '100644', type: 'blob', content: new TextDecoder('utf-8').decode(bytes) };
          });
      }));
    }).then(function (arvore) {
      return requisicao('https://api.github.com/repos/' + repositorio + '/git/ref/heads/main').then(function (resposta) {
        if (!resposta.ok) throw new Error(); return resposta.json();
      }).then(function (referencia) { return { arvore: arvore, cabeca: referencia.object.sha }; });
    }).then(function (dados) {
      return requisicao('https://api.github.com/repos/' + repositorio + '/git/commits/' + dados.cabeca).then(function (resposta) {
        if (!resposta.ok) throw new Error(); return resposta.json();
      }).then(function (cabeca) { return { arvore: dados.arvore, cabeca: dados.cabeca, base: cabeca.tree.sha }; });
    }).then(function (dados) {
      return requisicao('https://api.github.com/repos/' + repositorio + '/git/trees', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_tree: dados.base, tree: dados.arvore })
      }).then(function (resposta) { if (!resposta.ok) throw new Error(); return resposta.json(); })
        .then(function (arvore) { return { cabeca: dados.cabeca, arvore: arvore.sha }; });
    }).then(function (dados) {
      return requisicao('https://api.github.com/repos/' + repositorio + '/git/commits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Restaura conteúdo da versão ' + commit.sha.slice(0, 7), tree: dados.arvore, parents: [dados.cabeca] })
      }).then(function (resposta) { if (!resposta.ok) throw new Error(); return resposta.json(); });
    }).then(function (novoCommit) {
      return requisicao('https://api.github.com/repos/' + repositorio + '/git/refs/heads/main', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sha: novoCommit.sha, force: false })
      });
    }).then(function (resposta) {
      if (!resposta.ok) throw new Error(); window.location.reload();
    }).catch(function () {
      botao.disabled = false; botao.textContent = 'Restaurar conteúdo desta versão';
      alert('Não foi possível restaurar. Atualize a página e tente novamente.');
    });
  }

  function criarCommit(commit, usuario) {
    var dados = commit.commit;
    var artigo = document.createElement('article'); artigo.className = 'commit';
    artigo.innerHTML = '<div class="commit-header"><h2>' + escapar(dados.message.split('\n')[0]) + '</h2><span class="meta">' + dataLocal(dados.author.date) + '</span></div>' +
      '<div class="meta">Por ' + escapar(dados.author.name) + ' · código ' + escapar(commit.sha.slice(0, 7)) + '</div>' +
      '<button type="button">Ver detalhes</button><div class="details" hidden></div>' +
      '<a class="external" href="' + escapar(commit.html_url) + '" target="_blank" rel="noopener">Abrir no GitHub ↗</a>';
    artigo.querySelector('button').addEventListener('click', function () { mostrarDetalhes(this, commit); });
    if (usuario && commit.author && commit.author.login === usuario.login) {
      var restaurar = document.createElement('button'); restaurar.type = 'button';
      restaurar.className = 'restore'; restaurar.textContent = 'Restaurar conteúdo desta versão';
      restaurar.addEventListener('click', function () { restaurarConteudo(this, commit); });
      artigo.insertBefore(restaurar, artigo.querySelector('.external'));
    }
    return artigo;
  }

  Promise.all([requisicao(api + '?sha=main&per_page=30').then(function (resposta) { if (!resposta.ok) throw new Error(); return resposta.json(); }), usuarioAtual()])
    .then(function (resultado) {
      var commits = resultado[0]; var usuario = resultado[1];
      area.className = ''; area.innerHTML = '';
      commits.forEach(function (commit) { area.appendChild(criarCommit(commit, usuario)); });
    })
    .catch(function () {
      area.textContent = 'Não foi possível carregar o histórico. Verifique sua conexão e tente atualizar a página.';
    });
})();
