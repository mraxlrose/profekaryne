document.getElementById('contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const errEl = document.getElementById('form-error');
  btn.textContent = '⏳ Enviando...';
  btn.disabled = true;
  errEl.style.display = 'none';
  const data = new FormData(this);
  try {
    const res = await fetch('https://formspree.io/f/SEU_ID_AQUI', {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      document.getElementById('contact-form').style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
    } else {
      throw new Error('Erro');
    }
  } catch {
    btn.textContent = '📩 Enviar mensagem';
    btn.disabled = false;
    errEl.style.display = 'block';
  }
});
