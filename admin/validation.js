(function () {
  var resumo = document.getElementById('km-validation-summary');
  var seletorDePublicacao = 'button';

  function chaveDoCampo(campo) {
    var propria = (campo.name || '') + ' ' + (campo.id || '');
    var rotulo = '';
    var atual = campo;
    for (var nivel = 0; atual && nivel < 5; nivel += 1, atual = atual.parentElement) {
      var label = atual.querySelector && atual.querySelector('label');
      if (label) { rotulo = label.textContent || ''; break; }
    }
    return (propria + ' ' + rotulo).toLowerCase();
  }

  function regraDoCampo(campo) {
    var chave = chaveDoCampo(campo);
    if (chave.indexOf('whatsappnumero') !== -1 || chave.indexOf('whatsapp (somente') !== -1) {
      return ['^55\\d{10,11}$', 'Use somente números, começando por 55. Ex.: 5554992530598.'];
    }
    if (chave.indexOf('whatsappexibicao') !== -1 || chave.indexOf('whatsapp exibido') !== -1) {
      return ['^\\(\\d{2}\\)\\s9\\s?\\d{4}-\\d{4}$', 'Use o formato (54) 9 9253-0598.'];
    }
    if (chave.indexOf('instagramurl') !== -1 || chave.indexOf('link do instagram') !== -1) {
      return ['^https://(www\\.)?instagram\\.com/.+', 'Informe o link completo do Instagram, começando por https://instagram.com/.'];
    }
    if (chave.indexOf('email') !== -1 || chave.indexOf('e-mail') !== -1) {
      return ['^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', 'Informe um e-mail válido.'];
    }
    if (chave.indexOf('link') !== -1 && (chave.indexOf('hotmart') !== -1 || chave.indexOf('pdf') !== -1)) {
      return ['^(https://|/|assets/).+', 'Informe um link completo ou um caminho válido para o PDF.'];
    }
    return null;
  }

  function mensagemExistente(campo) { return campo.parentElement && campo.parentElement.querySelector('.km-field-error'); }

  function validarCampo(campo) {
    var regra = regraDoCampo(campo); if (!regra || campo.disabled || campo.type === 'hidden') return true;
    var valido = new RegExp(regra[0]).test((campo.value || '').trim());
    var mensagem = mensagemExistente(campo);
    campo.classList.toggle('km-invalid', !valido);
    campo.setAttribute('aria-invalid', valido ? 'false' : 'true');
    if (!valido && !mensagem) {
      mensagem = document.createElement('div'); mensagem.className = 'km-field-error'; mensagem.textContent = regra[1];
      campo.insertAdjacentElement('afterend', mensagem);
    } else if (valido && mensagem) mensagem.remove();
    return valido;
  }

  function botoesDePublicacao() {
    return Array.from(document.querySelectorAll(seletorDePublicacao)).filter(function (botao) {
      return /^publicar(?:\s|$)/i.test((botao.textContent || '').trim()) && !botao.closest('.km-panel-actions');
    });
  }

  function validarTudo() {
    var campos = Array.from(document.querySelectorAll('input, textarea')).filter(function (campo) { return !!regraDoCampo(campo); });
    var invalidos = campos.filter(function (campo) { return !validarCampo(campo); });
    resumo.hidden = invalidos.length === 0;
    resumo.textContent = invalidos.length ? 'Há ' + invalidos.length + ' campo(s) com erro. Corrija os campos marcados para poder publicar.' : '';
    botoesDePublicacao().forEach(function (botao) {
      botao.disabled = invalidos.length > 0;
      botao.title = invalidos.length ? 'Corrija os campos marcados antes de publicar.' : '';
    });
  }

  document.addEventListener('focusout', function (evento) {
    if (evento.target.matches && evento.target.matches('input, textarea')) validarTudo();
  }, true);
  document.addEventListener('input', function (evento) {
    if (evento.target.matches && evento.target.matches('input, textarea') && evento.target.classList.contains('km-invalid')) validarTudo();
  }, true);
  new MutationObserver(validarTudo).observe(document.body, { childList: true, subtree: true });
  setTimeout(validarTudo, 600);
})();
