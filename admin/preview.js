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

  var CopiaDoSite = createClass({
    aplicar: function () {
      if (!this.quadro || !this.quadro.contentDocument) return;
      try { aplicarConteudo(this.quadro.contentDocument, this.props.entry); } catch (erro) {}
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

  CMS.registerPreviewTemplate('conteudo-principal', CopiaDoSite);
})();
