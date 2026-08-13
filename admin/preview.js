(function () {
  function valor(entry, caminho, padrao) {
    return entry.getIn(['data'].concat(caminho), padrao || '');
  }

  function secao(titulo, selo, texto, filhos) {
    return h('section', { style: { padding: '34px 28px', background: '#f7efe4', borderBottom: '1px solid #ead9bd' } },
      h('div', { style: { color: '#b8922e', fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' } }, selo),
      h('h2', { style: { color: '#1c2a3a', fontFamily: 'Georgia, serif', fontSize: '28px', lineHeight: '1.2', margin: '0 0 12px' } }, titulo),
      texto ? h('p', { style: { color: '#7a6a58', fontSize: '15px', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-line' } }, texto) : null,
      filhos || null
    );
  }

  var PreviaDoSite = createClass({
    render: function () {
      var entry = this.props.entry;
      var heroTitulo = valor(entry, ['hero', 'titulo']);
      var heroDestaque = valor(entry, ['hero', 'destaque']);
      var heroComplemento = valor(entry, ['hero', 'complemento']);
      var servicos = valor(entry, ['servicos', 'itens'], []);
      var paragrafos = valor(entry, ['sobre', 'paragrafos'], []);

      return h('main', { style: { background: '#f0e6d8', color: '#1c2a3a', fontFamily: 'Arial, sans-serif', minHeight: '100vh' } },
        h('div', { style: { background: '#1a2740', color: '#f5f0e8', padding: '14px 28px', fontSize: '14px', fontWeight: '700' } }, 'Prévia — KM Centro de Aprendizagem'),
        h('section', { style: { padding: '52px 28px', background: '#f0e6d8' } },
          h('span', { style: { color: '#b8922e', fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' } }, valor(entry, ['hero', 'selo'])),
          h('h1', { style: { color: '#1c2a3a', fontFamily: 'Georgia, serif', fontSize: '39px', lineHeight: '1.15', margin: '18px 0' } },
            heroTitulo + ' ', h('em', { style: { color: '#b8922e' } }, heroDestaque), ' ' + heroComplemento
          ),
          h('p', { style: { color: '#7a6a58', fontSize: '16px', lineHeight: '1.75', whiteSpace: 'pre-line', margin: 0 } }, valor(entry, ['hero', 'descricao']))
        ),
        secao(
          valor(entry, ['sobre', 'titulo']) + ' — ' + valor(entry, ['sobre', 'subtitulo']),
          valor(entry, ['sobre', 'selo']),
          paragrafos && paragrafos.join ? paragrafos.join('\n\n') : ''
        ),
        secao(
          valor(entry, ['servicos', 'titulo']),
          valor(entry, ['servicos', 'selo']),
          valor(entry, ['servicos', 'descricao']),
          h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px', marginTop: '22px' } },
            servicos && servicos.map ? servicos.map(function (item, indice) {
              return h('article', { key: indice, style: { background: '#fffaf2', border: '1px solid #e6d5b9', borderRadius: '12px', padding: '16px' } },
                h('h3', { style: { color: '#1c2a3a', fontFamily: 'Georgia, serif', fontSize: '17px', margin: '0 0 8px' } }, item.get ? item.get('titulo') : item.titulo),
                h('p', { style: { color: '#7a6a58', fontSize: '13px', lineHeight: '1.6', margin: 0 } }, item.get ? item.get('descricao') : item.descricao)
              );
            }) : null
          )
        ),
        secao(valor(entry, ['redacao', 'titulo']), valor(entry, ['redacao', 'selo']), valor(entry, ['redacao', 'descricao'])),
        secao(valor(entry, ['horarios', 'titulo']), valor(entry, ['horarios', 'selo']), valor(entry, ['horarios', 'descricao'])),
        secao(valor(entry, ['valores', 'titulo']), valor(entry, ['valores', 'selo']), valor(entry, ['valores', 'descricao'])),
        secao(valor(entry, ['jogos', 'titulo']), valor(entry, ['jogos', 'selo']), valor(entry, ['jogos', 'descricao'])),
        secao(valor(entry, ['contato', 'titulo']), valor(entry, ['contato', 'selo']), valor(entry, ['contato', 'descricao']))
      );
    }
  });

  CMS.registerPreviewTemplate('conteudo-principal', PreviaDoSite);
})();
