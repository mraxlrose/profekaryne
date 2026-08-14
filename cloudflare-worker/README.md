# Autenticação do painel CMS

Este Worker fornece o login OAuth entre o painel Decap CMS e o GitHub e, quando configurado, uma rota protegida de leitura das métricas do Google Analytics 4. Ele não hospeda o site: o site continua no GitHub Pages.

## Antes de publicar

1. Criar um OAuth App no GitHub em **Settings > Developer settings > OAuth Apps**.
2. Informar como callback: `https://SEU-WORKER.workers.dev/callback`.
3. Criar um Worker no Cloudflare com o nome desejado (por exemplo, `km-cms-auth`) e publicar o código de `src/index.js`. O arquivo `wrangler.toml` serve para publicação pela linha de comando, caso seja usada.
4. Configurar no Worker os segredos `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` e `STATE_SECRET` (uma senha aleatória longa), além da variável comum `ALLOWED_ORIGIN=https://kmcentrodeaprendizagem.com.br`.
5. Depois da publicação, copiar a URL pública do Worker e substituir a URL de exemplo em `admin/config.yml`, no campo `base_url`. Neste projeto, a URL atual é `https://km-cms-auth.mraxlrose.workers.dev`.
6. Publicar essas alterações no GitHub e abrir `https://kmcentrodeaprendizagem.com.br/admin/`. A Karyne deverá entrar com uma conta GitHub que tenha acesso de escrita ao repositório `mraxlrose/profekaryne`.

O Worker pede somente a permissão `public_repo`, suficiente para salvar alterações neste repositório público. O painel cria o commit automaticamente ao clicar em **Publicar**.

Nunca salvar chaves, client secret ou token do GitHub neste repositório.

## Ativar Métricas do Google Analytics no painel

O painel em `admin/metrics.html` consulta `GET /analytics` neste Worker. Essa rota exige um token GitHub de uma pessoa que tenha permissão de escrita no repositório e não expõe as credenciais do Google ao navegador.

1. No Google Analytics, abrir **Administrador > Detalhes da propriedade** e copiar o **ID numérico da propriedade** (não é o identificador `G-...`).
2. No [Google Cloud Console](https://console.cloud.google.com/), criar ou escolher um projeto e ativar **Google Analytics Data API**.
3. Em **IAM e administrador > Contas de serviço**, criar uma conta de serviço. Criar uma chave JSON e anotar somente o `client_email` e o `private_key`.
4. No Google Analytics, em **Administrador > Gerenciamento de acesso à propriedade**, adicionar o `client_email` da conta de serviço com papel **Leitor**.
5. No Cloudflare, abrir o Worker `km-cms-auth` > **Configurações > Variáveis e segredos** e criar estes segredos:

   - `GA4_PROPERTY_ID`: ID numérico copiado no passo 1.
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: valor `client_email` da chave JSON.
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: valor inteiro de `private_key`, incluindo `-----BEGIN PRIVATE KEY-----` e quebras de linha.

6. Publicar novamente o código atualizado de `src/index.js` no Worker. Após isso, abrir `/admin/metrics.html` pelo botão **Métricas**.

Os dados são consultados diretamente na Google Analytics Data API, com leitura apenas. Cidades/regiões com pouco volume podem não aparecer por regras de privacidade do GA4.
