(function () {
  function normalizar(valor) {
    if (!valor) return valor;
    if (typeof valor.toJS === 'function') return valor.toJS();
    if (typeof valor.toArray === 'function') return valor.toArray().map(normalizar);
    if (typeof valor.toObject === 'function') {
      var objeto = valor.toObject();
      Object.keys(objeto).forEach(function (chave) { objeto[chave] = normalizar(objeto[chave]); });
      return objeto;
    }
    return valor;
  }

  function copiar(lista) {
    var normalizada = normalizar(lista);
    return Array.isArray(normalizada) ? normalizada.slice() : [];
  }

  function assinatura(valor) { return JSON.stringify(normalizar(valor)); }

  function avisarListaAlterada() {
    window.dispatchEvent(new CustomEvent('km-cms-lista-alterada'));
  }

  function avisarListaRestaurada(limparIndicador) {
    window.dispatchEvent(new CustomEvent('km-cms-lista-restaurada-original', {
      detail: { limparIndicador: !!limparIndicador }
    }));
  }

  function valorOriginal(componente) {
    if (!componente.state.valorOriginal) componente.setState({ valorOriginal: assinatura(componente.props.value) });
    return componente.state.valorOriginal || assinatura(componente.props.value);
  }

  function alterarLista(componente, valor, verificarOriginal, limparIndicador) {
    componente.props.onChange(valor);
    if (verificarOriginal && assinatura(valor) === valorOriginal(componente)) avisarListaRestaurada(limparIndicador);
    else avisarListaAlterada();
  }

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
    getInitialState: function () { return { ultimaExclusao: null, valorOriginal: assinatura(this.props.value) }; },
    alterar: function (indice, chave, valor) {
      var planos = copiar(this.props.value); planos[indice] = Object.assign({}, planos[indice], {}); planos[indice][chave] = valor; alterarLista(this, planos);
    },
    excluirPlano: function (indice) {
      var planos = copiar(this.props.value); var removido = planos[indice];
      if (!window.confirm('Excluir o plano “' + (removido.titulo || 'sem nome') + '”? Você poderá desfazer logo em seguida.')) return;
      planos.splice(indice, 1); alterarLista(this, planos);
      this.setState({ ultimaExclusao: { tipo: 'plano', indice: indice, valor: removido, mensagem: 'Plano removido. Ainda não foi publicado.' } });
    },
    excluirItem: function (planoIndice, itemIndice) {
      var planos = copiar(this.props.value); var plano = Object.assign({}, planos[planoIndice]); var itens = copiar(plano.itens); var removido = itens[itemIndice];
      if (!window.confirm('Excluir este item incluído? Você poderá desfazer logo em seguida.')) return;
      itens.splice(itemIndice, 1); plano.itens = itens; planos[planoIndice] = plano; alterarLista(this, planos);
      this.setState({ ultimaExclusao: { tipo: 'item', planoIndice: planoIndice, indice: itemIndice, valor: removido, mensagem: 'Item incluído removido. Ainda não foi publicado.' } });
    },
    desfazer: function () {
      var acao = this.state.ultimaExclusao; if (!acao) return; var planos = copiar(this.props.value);
      if (acao.tipo === 'plano') planos.splice(acao.indice, 0, acao.valor);
      else { var plano = Object.assign({}, planos[acao.planoIndice]); var itens = copiar(plano.itens); itens.splice(acao.indice, 0, acao.valor); plano.itens = itens; planos[acao.planoIndice] = plano; }
      alterarLista(this, planos, true, true); this.setState({ ultimaExclusao: null });
    },
    adicionarPlano: function () {
      var planos = copiar(this.props.value); planos.push({ icone: '📚', titulo: 'Novo plano', preco: '', periodo: '', itens: [] }); alterarLista(this, planos);
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
    getInitialState: function () { return { ultimaExclusao: null, valorOriginal: assinatura(this.props.value) }; },
    alterar: function (indice, chave, valor) { var jogos = copiar(this.props.value); jogos[indice] = Object.assign({}, jogos[indice], {}); jogos[indice][chave] = valor; alterarLista(this, jogos); },
    excluir: function (indice) {
      var jogos = copiar(this.props.value); var removido = jogos[indice];
      if (!window.confirm('Excluir o jogo “' + (removido.titulo || 'sem nome') + '”? Você poderá desfazer logo em seguida.')) return;
      jogos.splice(indice, 1); alterarLista(this, jogos); this.setState({ ultimaExclusao: { indice: indice, valor: removido, mensagem: 'Jogo removido. Ainda não foi publicado.' } });
    },
    desfazer: function () { var acao = this.state.ultimaExclusao; if (!acao) return; var jogos = copiar(this.props.value); jogos.splice(acao.indice, 0, acao.valor); alterarLista(this, jogos, true, true); this.setState({ ultimaExclusao: null }); },
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
        botao('Adicionar jogo', function () { var jogosNovos = copiar(self.props.value); jogosNovos.push({ emoji: '🎲', titulo: 'Novo jogo', nivel: '', descricao: '', preco: '', link: '', botao: 'Saiba mais', badge: '' }); alterarLista(self, jogosNovos); })
      );
    }
  });

  function listaSegura(configuracao) {
    return createClass({
      getInitialState: function () { return { ultimaExclusao: null, valorOriginal: assinatura(this.props.value) }; },
      alterar: function (indice, chave, valor) {
        var itens = copiar(this.props.value);
        if (configuracao.simples) itens[indice] = valor;
        else { itens[indice] = Object.assign({}, itens[indice], {}); itens[indice][chave] = valor; }
        alterarLista(this, itens);
      },
      excluir: function (indice) {
        var itens = copiar(this.props.value); var removido = itens[indice];
        if (!window.confirm('Excluir ' + configuracao.singular + '? Você poderá desfazer logo em seguida.')) return;
        itens.splice(indice, 1); alterarLista(this, itens);
        this.setState({ ultimaExclusao: { indice: indice, valor: removido, mensagem: configuracao.singular + ' removido. Ainda não foi publicado.' } });
      },
      desfazer: function () { var acao = this.state.ultimaExclusao; if (!acao) return; var itens = copiar(this.props.value); itens.splice(acao.indice, 0, acao.valor); alterarLista(this, itens, true, configuracao.limparIndicador); this.setState({ ultimaExclusao: null }); },
      adicionar: function () { var itens = copiar(this.props.value); itens.push(typeof configuracao.novo === 'function' ? configuracao.novo() : configuracao.novo); alterarLista(this, itens); },
      controle: function (item, indice, definicao) {
        var self = this; var valor = configuracao.simples ? item : item[definicao.nome];
        var aoMudar = function (novoValor) { self.alterar(indice, definicao.nome, novoValor); };
        if (definicao.tipo === 'boolean') return h('label', { style: { display: 'block', marginTop: '10px', fontWeight: '600', fontSize: '13px' } }, h('input', { type: 'checkbox', checked: !!valor, onChange: function (evento) { aoMudar(evento.target.checked); } }), ' ' + definicao.rotulo);
        if (definicao.opcoes) return h('label', { style: { display: 'block', marginTop: '10px', fontWeight: '600', fontSize: '13px' } }, definicao.rotulo, h('select', { value: valor || '', onChange: function (evento) { aoMudar(evento.target.value); }, style: { display: 'block', width: '100%', marginTop: '4px', padding: '8px' } }, definicao.opcoes.map(function (opcao) { return h('option', { key: opcao, value: opcao }, opcao); })));
        return campo(definicao.rotulo, valor, aoMudar, definicao.tipo === 'text' ? 'text' : undefined);
      },
      render: function () {
        var self = this; var itens = copiar(this.props.value);
        return h('div', { className: this.props.classNameWrapper, style: { maxWidth: '800px' } },
          h('p', { style: { color: '#526779', margin: '0 0 8px' } }, 'Exclusões pedem confirmação e podem ser desfeitas antes de publicar.'), painelDeDesfazer(this),
          itens.map(function (item, indice) {
            var titulo = configuracao.resumo ? configuracao.resumo(item) : configuracao.singular;
            return h('section', { key: indice, style: { border: '1px solid #cbd7df', borderRadius: '6px', padding: '12px', margin: '12px 0', background: '#fff' } },
              h('strong', {}, titulo), configuracao.campos.map(function (definicao) { return h('div', { key: definicao.nome }, self.controle(item, indice, definicao)); }), botao('Excluir', function () { self.excluir(indice); }, true)
            );
          }), botao(configuracao.adicionar, function () { self.adicionar(); })
        );
      }
    });
  }

  var ParagrafosSeguros = listaSegura({ singular: 'Parágrafo', adicionar: 'Adicionar parágrafo', simples: true, novo: '', resumo: function () { return 'Parágrafo'; }, campos: [{ nome: 'texto', rotulo: 'Texto do parágrafo', tipo: 'text' }] });
  var ServicosSeguros = listaSegura({ singular: 'Serviço', adicionar: 'Adicionar serviço', novo: function () { return { titulo: 'Novo serviço', descricao: '' }; }, resumo: function (item) { return item.titulo || 'Novo serviço'; }, campos: [{ nome: 'titulo', rotulo: 'Título' }, { nome: 'descricao', rotulo: 'Descrição', tipo: 'text' }] });
  var HorariosSeguros = listaSegura({ singular: 'Linha de horário', adicionar: 'Adicionar linha de horário', novo: function () { return { dia: '', manha: '', tarde: '', noite: '' }; }, resumo: function (item) { return item.dia || 'Nova linha'; }, campos: [{ nome: 'dia', rotulo: 'Dia' }, { nome: 'manha', rotulo: 'Manhã' }, { nome: 'tarde', rotulo: 'Tarde' }, { nome: 'noite', rotulo: 'Noite' }] });
  var AgendamentosSeguros = listaSegura({ singular: 'Agendamento', adicionar: 'Adicionar agendamento', limparIndicador: true, novo: function () { return { descricao: '', data: '', arquivo: 'content/site.json', campo: '', valor: '', ativo: true }; }, resumo: function (item) { return item.descricao || 'Novo agendamento'; }, campos: [{ nome: 'descricao', rotulo: 'Descrição da publicação' }, { nome: 'data', rotulo: 'Publicar em (ex.: 2026-09-01T09:00:00Z)' }, { nome: 'arquivo', rotulo: 'Arquivo a alterar', opcoes: ['content/site.json', 'content/agenda.json', 'content/contatos.json', 'content/valores.json', 'content/jogos.json'] }, { nome: 'campo', rotulo: 'Campo a alterar' }, { nome: 'valor', rotulo: 'Novo texto', tipo: 'text' }, { nome: 'ativo', rotulo: 'Ativo', tipo: 'boolean' }] });
  var NotasSeguras = listaSegura({ singular: 'Nota de publicação', adicionar: 'Adicionar nota', limparIndicador: true, novo: function () { return { data: new Date().toISOString(), descricao: '' }; }, resumo: function (item) { return item.descricao || 'Nova nota'; }, campos: [{ nome: 'data', rotulo: 'Data (ex.: 2026-09-01T09:00:00Z)' }, { nome: 'descricao', rotulo: 'O que foi alterado?', tipo: 'text' }] });

  CMS.registerWidget('planos-seguros', PlanosSeguros);
  CMS.registerWidget('jogos-seguros', JogosSeguros);
  CMS.registerWidget('paragrafos-seguros', ParagrafosSeguros);
  CMS.registerWidget('servicos-seguros', ServicosSeguros);
  CMS.registerWidget('horarios-seguros', HorariosSeguros);
  CMS.registerWidget('agendamentos-seguros', AgendamentosSeguros);
  CMS.registerWidget('notas-seguras', NotasSeguras);
})();
