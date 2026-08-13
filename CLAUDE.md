# Instruções do projeto

Consulte primeiro `AGENTS.md`, que é a fonte de verdade atual deste repositório.

## Resumo

Site estático da Professora Karyne Mignoni, publicado em `https://kmcentrodeaprendizagem.com.br/` pelo GitHub Pages na branch `main`.

- Página e estrutura: `index.html`
- Estilos: `assets/css/style.css`
- Formulário: `assets/js/main.js` (Formspree já configurado)
- Conteúdo editável: `content/` e painel em `/admin/`
- Autenticação do painel: Cloudflare Worker em `cloudflare-worker/`; segredos permanecem somente no Cloudflare

Não existe etapa de build. Para testar localmente:

```bash
python3 -m http.server 8080
```

## Dados importantes

- WhatsApp: `(54) 9 9253-0598` / `5554992530598`
- E-mail: `km.centrodeaprendizagem@gmail.com`
- Não modificar `CNAME`, endpoint do Formspree ou segredos de autenticação sem confirmação.
- `comprovantes/` é privado e ignorado pelo Git.
