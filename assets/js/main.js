const mensagens = {
  nome:     { valueMissing: 'Por favor, informe seu nome completo.' },
  email:    { valueMissing: 'Por favor, informe seu e-mail.', typeMismatch: 'Digite um e-mail válido (ex: nome@email.com).' },
  telefone: { typeMismatch: 'Digite um telefone válido.' },
};

function configurarValidacao(campo, msgs) {
  function atualizar() {
    campo.setCustomValidity('');
    if (!campo.validity.valid) {
      if (campo.validity.valueMissing)  campo.setCustomValidity(msgs.valueMissing  || 'Campo obrigatório.');
      if (campo.validity.typeMismatch)  campo.setCustomValidity(msgs.typeMismatch  || 'Formato inválido.');
      if (campo.validity.tooShort)      campo.setCustomValidity(msgs.tooShort      || 'Muito curto.');
    }
  }
  campo.addEventListener('invalid', atualizar);
  campo.addEventListener('input',   () => { campo.setCustomValidity(''); });
}

function aplicarMascaraTelefone(campo) {
  campo.addEventListener('input', function () {
    let v = campo.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (v.length > 6) {
      v = v.replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d+)$/, '($1) $2');
    } else if (v.length > 0) {
      v = v.replace(/^(\d+)$/, '($1');
    }
    campo.value = v;
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  Object.entries(mensagens).forEach(([id, msgs]) => {
    const campo = form.elements[id];
    if (campo) configurarValidacao(campo, msgs);
  });

  const campoTel = form.elements['telefone'];
  if (campoTel) aplicarMascaraTelefone(campoTel);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn    = document.getElementById('submit-btn');
    const errEl  = document.getElementById('form-error');
    btn.textContent = '⏳ Enviando...';
    btn.disabled    = true;
    errEl.style.display = 'none';
    const data = new FormData(this);
    try {
      const res = await fetch('https://formspree.io/f/SEU_ID_AQUI', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        window.location.href = '/obrigado.html';
      } else {
        throw new Error('Erro');
      }
    } catch {
      btn.textContent = '📩 Enviar mensagem';
      btn.disabled    = false;
      errEl.style.display = 'block';
    }
  });
});
