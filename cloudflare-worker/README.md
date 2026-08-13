# Autenticação do painel CMS

Este Worker fornece exclusivamente o login OAuth entre o painel Decap CMS e o GitHub. Ele não hospeda o site: o site continua no GitHub Pages.

## Antes de publicar

1. Criar um OAuth App no GitHub em **Settings > Developer settings > OAuth Apps**.
2. Informar como callback: `https://SEU-WORKER.workers.dev/callback`.
3. Criar um Worker no Cloudflare com o nome desejado (por exemplo, `km-cms-auth`) e publicar o código de `src/index.js`. O arquivo `wrangler.toml` serve para publicação pela linha de comando, caso seja usada.
4. Configurar no Worker os segredos `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` e `STATE_SECRET` (uma senha aleatória longa), além da variável comum `ALLOWED_ORIGIN=https://kmcentrodeaprendizagem.com.br`.
5. Depois da publicação, copiar a URL pública do Worker e substituir a URL de exemplo em `admin/config.yml`, no campo `base_url`. Neste projeto, a URL atual é `https://km-cms-auth.mraxlrose.workers.dev`.
6. Publicar essas alterações no GitHub e abrir `https://kmcentrodeaprendizagem.com.br/admin/`. A Karyne deverá entrar com uma conta GitHub que tenha acesso de escrita ao repositório `mraxlrose/profekaryne`.

O Worker pede somente a permissão `public_repo`, suficiente para salvar alterações neste repositório público. O painel cria o commit automaticamente ao clicar em **Publicar**.

Nunca salvar chaves, client secret ou token do GitHub neste repositório.
