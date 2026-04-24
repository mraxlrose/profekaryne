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

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  Object.entries(mensagens).forEach(([id, msgs]) => {
    const campo = form.elements[id];
    if (campo) configurarValidacao(campo, msgs);
  });

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
        form.style.display = 'none';
        document.getElementById('form-success').style.display = 'block';
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
