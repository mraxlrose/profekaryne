(function () {
  function copiar(lista) { return Array.isArray(lista) ? lista.slice() : []; }
  function campo(rotulo, valor, aoMudar, tipo) {
    return h('label', { style: { display: 'block', margin: '10px 0 0', fontWeight: '600', fontSize: '13px', color: '#34495e' } },
      rotulo,
      h(tipo === 'text' ? 'textarea' : 'input', {
        type: tipo === 'text' ? undefined : 'text', value: valor || '', onChange: function (evento) { aoMudar(evento.target.value); },
        style: { display: 'block', width: '100%', marginTop: '4px', padding: '8px', border: '1px solid #bcc9d4', borderRadius: '4px', font: '14px Arial, sans-serif', minHeight: tipo === 'text' ? '76px' : undefined }
      })
    );
  }

  function botao(texto, aoClicar, perigo) {
    return h('button', { type: 'button', onClick: aoClicar, style: { margin: '8px 8px 0 0', padding: '7px 10px', border: '0', borderRadius: '4px', color: '#fff', cursor: 'pointer', background: perigo ? '#b42318' : '#2469a8', font: '13px Arial, sans-serif' } }, texto);
  }

  function painelDeDesfazer(componente) {
    if (!componente.state.ultimaExclusao) return null;
    return h('div', { style: { margin: '10px 0', padding: '9px 10px', background: '#fff3cd', border: '1px solid #f0d56c', borderRadius: '4px', color: '#6d5400', font: '13px Arial, sans-serif' } },
      componente.state.ultimaExclusao.mensagem,
      botao('Desfazer', function () { componente.desfazer(); })
    );
  }

  var PlanosSeguros = createClass({
    getInitialState: function () { return { ultimaExclusao: null }; },
    alterar: function (indice, chave, valor) {
      var planos = copiar(this.props.value); planos[indice] = Object.assign({}, planos[indice], {}); planos[indice][chave] = valor; this.props.onChange(planos);
    },
    excluirPlano: function (indice) {
      var planos = copiar(this.props.value); var removido = planos[indice];
      if (!window.confirm('Excluir o plano “' + (removido.titulo || 'sem nome') + '”? Você poderá desfazer logo em seguida.')) return;
      planos.splice(indice, 1); this.props.onChange(planos);
      this.setState({ ultimaExclusao: { tipo: 'plano', indice: indice, valor: removido, mensagem: 'Plano removido. Ainda não foi publicado.' } });
    },
    excluirItem: function (planoIndice, itemIndice) {
      var planos = copiar(this.props.value); var plano = Object.assign({}, planos[planoIndice]); var itens = copiar(plano.itens); var removido = itens[itemIndice];
      if (!window.confirm('Excluir este item incluído? Você poderá desfazer logo em seguida.')) return;
      itens.splice(itemIndice, 1); plano.itens = itens; planos[planoIndice] = plano; this.props.onChange(planos);
      this.setState({ ultimaExclusao: { tipo: 'item', planoIndice: planoIndice, indice: itemIndice, valor: removido, mensagem: 'Item incluído removido. Ainda não foi publicado.' } });
    },
    desfazer: function () {
      var acao = this.state.ultimaExclusao; if (!acao) return; var planos = copiar(this.props.value);
      if (acao.tipo === 'plano') planos.splice(acao.indice, 0, acao.valor);
      else { var plano = Object.assign({}, planos[acao.planoIndice]); var itens = copiar(plano.itens); itens.splice(acao.indice, 0, acao.valor); plano.itens = itens; planos[acao.planoIndice] = plano; }
      this.props.onChange(planos); this.setState({ ultimaExclusao: null });
    },
    adicionarPlano: function () {
      var planos = copiar(this.props.value); planos.push({ icone: '📚', titulo: 'Novo plano', preco: '', periodo: '', itens: [] }); this.props.onChange(planos);
    },
    render: function () {
      var self = this; var planos = copiar(this.props.value);
      return h('div', { className: this.props.classNameWrapper, style: { maxWidth: '800px' } },
        h('p', { style: { color: '#526779', margin: '0 0 8px' } }, 'Exclusões pedem confirmação e podem ser desfeitas antes de publicar.'),
        painelDeDesfazer(this),
        planos.map(function (plano, indice) {
          var itens = copiar(plano.itens);
          return h('section', { key: indice, style: { border: '1px solid #cbd7df', borderRadius: '6px', padding: '12px', margin: '12px 0', background: '#fff' } },
            h('strong', {}, (plano.icone || '📚') + ' ' + (plano.titulo || 'Novo plano')),
            campo('Ícone', plano.icone, function (valor) { self.alterar(indice, 'icone', valor); }),
            campo('Nome do plano', plano.titulo, function (valor) { self.alterar(indice, 'titulo', valor); }),
            campo('Preço', plano.preco, function (valor) { self.alterar(indice, 'preco', valor); }),
            campo('Período', plano.periodo, function (valor) { self.alterar(indice, 'periodo', valor); }),
            h('div', { style: { marginTop: '12px', fontWeight: '600', fontSize: '13px' } }, 'Itens incluídos'),
            itens.map(function (item, itemIndice) {
              return h('div', { key: itemIndice, style: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' } },
                h('input', { type: 'text', value: item || '', onChange: function (evento) { var novos = copiar(itens); novos[itemIndice] = evento.target.value; self.alterar(indice, 'itens', novos); }, style: { flex: '1', padding: '7px', border: '1px solid #bcc9d4', borderRadius: '4px' } }),
                botao('Excluir item', function () { self.excluirItem(indice, itemIndice); }, true)
              );
            }),
            botao('Adicionar item', function () { var novos = copiar(itens); novos.push(''); self.alterar(indice, 'itens', novos); }),
            botao('Excluir plano', function () { self.excluirPlano(indice); }, true)
          );
        }),
        botao('Adicionar plano', function () { self.adicionarPlano(); })
      );
    }
  });

  var JogosSeguros = createClass({
    getInitialState: function () { return { ultimaExclusao: null }; },
    alterar: function (indice, chave, valor) { var jogos = copiar(this.props.value); jogos[indice] = Object.assign({}, jogos[indice], {}); jogos[indice][chave] = valor; this.props.onChange(jogos); },
    excluir: function (indice) {
      var jogos = copiar(this.props.value); var removido = jogos[indice];
      if (!window.confirm('Excluir o jogo “' + (removido.titulo || 'sem nome') + '”? Você poderá desfazer logo em seguida.')) return;
      jogos.splice(indice, 1); this.props.onChange(jogos); this.setState({ ultimaExclusao: { indice: indice, valor: removido, mensagem: 'Jogo removido. Ainda não foi publicado.' } });
    },
    desfazer: function () { var acao = this.state.ultimaExclusao; if (!acao) return; var jogos = copiar(this.props.value); jogos.splice(acao.indice, 0, acao.valor); this.props.onChange(jogos); this.setState({ ultimaExclusao: null }); },
    render: function () {
      var self = this; var jogos = copiar(this.props.value);
      return h('div', { className: this.props.classNameWrapper, style: { maxWidth: '800px' } },
        h('p', { style: { color: '#526779', margin: '0 0 8px' } }, 'Exclusões pedem confirmação e podem ser desfeitas antes de publicar.'), painelDeDesfazer(this),
        jogos.map(function (jogo, indice) {
          return h('section', { key: indice, style: { border: '1px solid #cbd7df', borderRadius: '6px', padding: '12px', margin: '12px 0', background: '#fff' } },
            h('strong', {}, (jogo.emoji || '🎲') + ' ' + (jogo.titulo || 'Novo jogo')),
            campo('Emoji', jogo.emoji, function (valor) { self.alterar(indice, 'emoji', valor); }),
            campo('Título', jogo.titulo, function (valor) { self.alterar(indice, 'titulo', valor); }),
            campo('Nível/indicação', jogo.nivel, function (valor) { self.alterar(indice, 'nivel', valor); }),
            campo('Descrição', jogo.descricao, function (valor) { self.alterar(indice, 'descricao', valor); }, 'text'),
            campo('Texto de preço', jogo.preco, function (valor) { self.alterar(indice, 'preco', valor); }),
            campo('Link do PDF ou Hotmart', jogo.link, function (valor) { self.alterar(indice, 'link', valor); }),
            campo('Texto do botão', jogo.botao, function (valor) { self.alterar(indice, 'botao', valor); }),
            campo('Selo', jogo.badge, function (valor) { self.alterar(indice, 'badge', valor); }),
            botao('Excluir jogo', function () { self.excluir(indice); }, true)
          );
        }),
        botao('Adicionar jogo', function () { var jogosNovos = copiar(self.props.value); jogosNovos.push({ emoji: '🎲', titulo: 'Novo jogo', nivel: '', descricao: '', preco: '', link: '', botao: 'Saiba mais', badge: '' }); self.props.onChange(jogosNovos); })
      );
    }
  });

  CMS.registerWidget('planos-seguros', PlanosSeguros);
  CMS.registerWidget('jogos-seguros', JogosSeguros);
})();
