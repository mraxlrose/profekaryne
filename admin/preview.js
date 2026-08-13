(function () {
  function ler(entry, caminho) {
    return caminho.split('.').reduce(function (objeto, chave) {
      return objeto && objeto.get ? objeto.get(chave) : undefined;
    }, entry.get('data'));
  }

  function aplicarConteudo(documento, entry) {
    documento.querySelectorAll('[data-content]').forEach(function (elemento) {
      var caminho = elemento.getAttribute('data-content');
      if (caminho.indexOf('gestao.') === 0) return;
      var valor = ler(entry, caminho);
      if (typeof valor !== 'string') return;
      elemento.textContent = valor;
    });
  }

  function aplicarDados(documento, janela, dados) {
    if (dados.hero) aplicarConteudo(documento, { get: function () { return { get: function (chave) { return dados[chave]; } }; } });
    if (dados.horarios) {
      var tabela = documento.querySelector('.schedule-table tbody');
      if (tabela) tabela.innerHTML = (dados.horarios.linhas || []).map(function (l) { return `<tr><td><strong>${l.dia}</strong></td><td>${l.manha}</td><td>${l.tarde}</td><td>${l.noite}</td></tr>`; }).join('');
    }
    if (dados.contato) {
      documento.querySelectorAll('[data-content^="gestao.contato."]').forEach(function (elemento) {
        var chave = elemento.getAttribute('data-content').split('.').pop(); var valor = dados.contato[chave];
        if (!valor) return; elemento.textContent = valor;
        if (chave === 'email') elemento.href = `mailto:${valor}`;
      });
    }
    if (dados.marca) documento.querySelectorAll('[data-content^="gestao.marca."]').forEach(function (elemento) {
      var chave = elemento.getAttribute('data-content').split('.').pop(); if (dados.marca[chave]) elemento.src = dados.marca[chave];
    });
    if (dados.itens && janela.renderizarCards) {
      janela.renderizarCards('.valores-grid', dados.itens, dados.itens[0] && dados.itens[0].emoji ? 'jogo' : 'valor');
    }
    if (dados.aviso && dados.aviso.ativo && dados.aviso.texto && !documento.querySelector('.site-alerta')) {
      var alerta = documento.createElement('div'); alerta.className = 'site-alerta'; alerta.textContent = dados.aviso.texto; documento.body.prepend(alerta);
    }
  }

  var CopiaDoSite = createClass({
    aplicar: function () {
      if (!this.quadro || !this.quadro.contentDocument) return;
      try {
        var dados = this.props.entry.get('data').toJS();
        if (dados.hero) aplicarConteudo(this.quadro.contentDocument, this.props.entry);
        else aplicarDados(this.quadro.contentDocument, this.quadro.contentWindow, dados);
      } catch (erro) {}
    },
    componentDidMount: function () { this.aplicar(); },
    componentDidUpdate: function () { this.aplicar(); },
    render: function () {
      var self = this;
      return h('div', { style: { height: '100vh', background: '#e8edf1', padding: '12px', boxSizing: 'border-box' } },
        h('div', { style: { color: '#34495e', fontFamily: 'Arial, sans-serif', fontSize: '13px', margin: '0 0 10px' } }, 'Prévia do site — as alterações abaixo ainda não foram publicadas.'),
        h('iframe', {
          src: '/',
          title: 'Prévia do site KM Centro de Aprendizagem',
          ref: function (elemento) { self.quadro = elemento; },
          onLoad: function () { self.aplicar(); setTimeout(function () { self.aplicar(); }, 300); },
          style: { width: '100%', height: 'calc(100% - 28px)', border: '1px solid #b8c4cc', background: '#fff', boxShadow: '0 3px 14px rgba(0,0,0,.18)' }
        })
      );
    }
  });

  ['conteudo-principal', 'agenda', 'dados-de-contato', 'fotos-e-logos', 'cards-de-valores', 'cards-de-jogos'].forEach(function (nome) {
    CMS.registerPreviewTemplate(nome, CopiaDoSite);
  });
})();
