# Contexto permanente do projeto — KM Centro de Aprendizagem

## Objetivo e escopo

Este repositório contém o site institucional da **Professora Karyne Mignoni**, do **KM Centro de Aprendizagem**, em Caxias do Sul/RS. O conteúdo apresenta serviços educacionais e de acompanhamento (Português, reforço escolar, redação ENEM/vestibular, escrita profissional, psicanálise, aulas online e orientação de iniciação científica), valores, horários, formas de contato e jogos educativos digitais.

O site está em produção no **GitHub Pages** com domínio próprio:

- Site e URL canônica: `https://kmcentrodeaprendizagem.com.br/`
- Repositório remoto: `git@github.com:mraxlrose/profekaryne.git`
- Branch de trabalho/publicação atual: `main`

Trate este como um site de produção: alterações de conteúdo, contatos, preços, horários, SEO e links externos devem ser confirmadas cuidadosamente e testadas antes de commit/push.

## Tecnologia

É um site estático, sem framework e sem back-end próprio:

- HTML5
- CSS3
- JavaScript puro (vanilla JS)
- Google Fonts: Playfair Display e DM Sans
- Formspree para envio do formulário
- Google Analytics e Google Search Console
- Hotmart para a venda de jogos digitais
- GitHub Pages para hospedagem

Não há `package.json`, npm, dependências instaláveis, build, compilação ou testes automatizados. Para visualizar localmente, abrir `index.html` no navegador ou executar:

```bash
python3 -m http.server 8080
```

e acessar `http://localhost:8080`.

## Estrutura atual (fonte de verdade)

```text
.
├── index.html                                  # Página principal e maior parte do conteúdo
├── obrigado.html                               # Página de sucesso do formulário
├── AGENTS.md                                   # Este contexto para novas sessões do Codex
├── README.md                                   # Documentação voltada ao projeto/usuário
├── CLAUDE.md                                   # Instruções legadas para Claude; contém dados desatualizados
├── CNAME                                       # Domínio próprio do GitHub Pages
├── robots.txt                                  # Permite indexação e aponta ao sitemap
├── sitemap.xml                                 # Sitemap do domínio próprio
├── google67576e4fbfc02c69.html                 # Verificação do Google Search Console
├── assets/
│   ├── css/style.css                            # Todos os estilos e responsividade
│   ├── js/main.js                               # Validação/máscara/envio do formulário
│   ├── img/
│   │   ├── logo_dourado.png                     # Logo do tema claro
│   │   ├── logo_preto.png                       # Logo do tema escuro
│   │   └── profekaryne.png                      # Imagem usada na hero e seção Sobre
│   └── pdf/
│       └── quiz-substantivos-missao-gramatica.pdf # Jogo gratuito para download
├── content/site.json                             # Textos administráveis pelo painel
├── admin/                                        # Interface/configuração do Decap CMS e histórico de alterações
├── cloudflare-worker/                             # Código do OAuth; segredos ficam apenas no Cloudflare
├── scripts/publicar-agendamentos.mjs               # Aplica alterações de conteúdo programadas
├── .github/workflows/publicar-agendamentos.yml     # Executa os agendamentos a cada 15 min
└── comprovantes/                                 # Arquivos locais não rastreados pelo Git; não publicar sem pedido explícito
```

## Arquitetura da página principal

`index.html` é a página única do site. O menu e links internos usam âncoras (`#id`) para navegar entre seções. A ordem relevante é:

1. `topbar` — mensagem institucional acima da navegação.
2. `nav` — navegação sticky no desktop; menu hambúrguer no mobile; logo, links, CTA e seletor de tema.
3. `#inicio` — hero, apresentação, CTA para WhatsApp, foto, formação e estatísticas.
4. `#sobre` — biografia, formação, diferenciais e abordagem.
5. `#servicos` — cards dos serviços e avaliação diagnóstica gratuita.
6. `#redacao` — metodologia de redação ENEM/vestibular.
7. `#horarios` — tabela de disponibilidade e informações de agendamento.
8. `#depoimentos` — bloco inteiro comentado no HTML; não aparece no site nem no menu.
9. `#valores` — cards de investimento/planos e CTAs de WhatsApp.
10. `#jogos` — PDF gratuito e jogos pagos com links da Hotmart.
11. `#contato` — formulário Formspree, WhatsApp, e-mail, localidade e Instagram.
12. `footer` — logo, links internos e copyright.
13. Botão flutuante de WhatsApp.

Há vários estilos inline no `index.html`. Para mudanças isoladas de conteúdo/layout já existente, preserve-os quando possível; para padrões reutilizáveis ou ajustes globais, prefira `assets/css/style.css`.

## CSS e identidade visual

O arquivo `assets/css/style.css` contém a aparência de todo o site, inclusive layout desktop/mobile, cards, tabela, formulário, rodapé, botão flutuante e página de agradecimento.

As variáveis de cor ficam no início do arquivo:

- tema claro: creme/dourado e azul profundo;
- tema escuro: definido por `[data-theme="dark"]`;
- variáveis principais: `--verde`, `--verde-claro`, `--verde-palido`, `--dourado`, `--creme`, `--texto`, `--texto-suave`, `--branco` e `--fundo-profundo`.

Apesar do nome histórico `--verde`, a cor de destaque atual é dourada (`#C9A84C`). Não presumir que o nome da variável descreve a cor visual.

A regra responsiva principal está em `@media (max-width: 768px)`: grades passam para uma coluna e a navegação vira menu expansível. A topbar/navegação não deve ganhar espaço em branco nem sobrepor a hero em telas pequenas; houve correções recentes nessa área.

O CSS é carregado no `index.html` como `assets/css/style.css?v=12`. Esse parâmetro é cache-busting: ao alterar e publicar CSS/HTML, incremente-o de maneira coerente antes do commit.

## JavaScript e interações

### Formulário de contato

O script externo `assets/js/main.js` é carregado com `defer` em `index.html` como `assets/js/main.js?v=11`.

Ele:

- define mensagens de validação para nome e e-mail;
- aplica máscara brasileira ao campo de telefone;
- envia os dados via `fetch` para o endpoint Formspree `https://formspree.io/f/xdabgenj`;
- redireciona ao sucesso para `/obrigado.html`;
- restaura o botão e exibe erro caso o envio falhe.

Não substituir o endpoint ou mudar os nomes dos campos (`nome`, `email`, `telefone`, `servico`, `mensagem`) sem confirmação, pois isso pode interromper o recebimento de contatos.

### Scripts inline no fim do `index.html`

1. Menu mobile: adiciona/remove a classe `open` no `nav` e atualiza `aria-expanded`.
2. Tema: alterna `data-theme` no elemento `<html>`, troca o ícone 🌙/☀️ e salva a preferência em `localStorage` com a chave `km-theme`.

### Painel de edição

O painel em `admin/` usa Decap CMS e permite que a editora modifique os textos principais do site em campos amigáveis, sem abrir o VS Code. Os dados ficam em `content/site.json`; `assets/js/content.js` os busca e substitui no HTML os elementos marcados com `data-content`. O texto que permanece no `index.html` é um fallback para falhas de carregamento.

O CMS ainda registra uma alteração no GitHub por trás do painel, pois o GitHub Pages precisa receber os arquivos atualizados — mas a editora não precisa criar o commit manualmente. Para o login no CMS funcionar, `admin/config.yml` precisa apontar para o Worker Cloudflare publicado; o código e o procedimento estão em `cloudflare-worker/`. Nunca commitar ou exibir `GITHUB_CLIENT_SECRET`, tokens ou `STATE_SECRET`.

O botão **Histórico** no topo do painel abre `admin/history.html`. Ele consulta a API pública do GitHub para listar os commits publicados e permite comparar, por arquivo, os trechos removidos ("Estava assim") e adicionados ("Ficou assim"). A restauração só é exibida para commits da conta GitHub conectada e cria um novo commit alterando exclusivamente arquivos `content/*.json`; nunca restaura código, configurações ou ativos.

O painel usa `publish_mode: editorial_workflow`: alterações salvas primeiro ficam como rascunho e só chegam à `main` quando a editora as publica. O menu **Rascunhos e agendamentos** permite programar a troca de um campo textual em data/hora definida; o GitHub Actions confere a cada 15 minutos. O menu **Registro de versões** serve para a editora anotar, antes de publicar, o motivo da alteração. No topo há links para o site publicado, histórico, backup JSON e um indicador do status do GitHub Pages.

`admin/preview.js` registra uma prévia customizada no Decap CMS para o arquivo `conteudo-principal`. Ela carrega uma cópia navegável da página inicial em um iframe e aplica os textos ainda não publicados; continua recomendável testar a versão publicada também em desktop/mobile.

## Imagens, downloads e integrações externas

- O logo dourado é mostrado no tema claro e o preto no tema escuro, pelas classes `logo-light` e `logo-dark`.
- `profekaryne.png` é reutilizado na hero e no bloco Sobre.
- O botão de download gratuito aponta para `assets/pdf/quiz-substantivos-missao-gramatica.pdf`.
- Os cards de jogos pagos usam URLs externas da Hotmart.
- CTAs de atendimento usam links `wa.me` com mensagens já preenchidas. Preserve a codificação da URL ao editar textos.
- O Instagram atual é `@km.escutaeresultados`.

## SEO, análise e publicação

O `<head>` de `index.html` contém:

- título, descrição, palavras-chave, canonical e metatags de robôs;
- Open Graph para compartilhamentos no WhatsApp, Facebook e Instagram;
- Twitter Card;
- geolocalização para Caxias do Sul/RS;
- Schema.org JSON-LD do tipo `EducationalOrganization`;
- verificação do Google Search Console;
- Google Analytics (`G-VDRF710GRQ`).

`robots.txt` permite rastreamento e aponta para `https://kmcentrodeaprendizagem.com.br/sitemap.xml`. Ao criar uma página pública relevante além da inicial, adicionar sua URL ao `sitemap.xml`; a página `obrigado.html` deve permanecer fora dos mecanismos de busca (`noindex, nofollow`).

O `CNAME` é essencial para o domínio próprio no GitHub Pages: não remover ou alterar sem solicitação explícita.

## Pontos de atenção já identificados

Antes de publicar qualquer alteração relacionada, revisar estes pontos:

- `CLAUDE.md` está desatualizado: afirma que CSS/JS são inline, traz paleta, URLs, telefone, Formspree e hospedagem antigos. Não usá-lo como fonte de verdade sem validação contra os arquivos atuais.

## Processo de trabalho recomendado

1. Para explicar, analisar ou revisar, não modificar arquivos sem pedido explícito.
2. Antes de editar, identificar se a mudança é de conteúdo (`index.html`), visual (`assets/css/style.css`), formulário (`assets/js/main.js`), SEO/publicação ou ativo em `assets/`.
3. Manter HTML semântico, textos em pt-BR, `alt` significativo nas imagens e atributos de acessibilidade existentes.
4. Testar no navegador em desktop e em largura mobile, sobretudo navegação, âncoras, tema, formulário, links de WhatsApp, download PDF e rodapé.
5. Se CSS ou JS for alterado e a mudança for enviada ao GitHub, aumentar respectivamente `?v=12` e/ou `?v=11` no `index.html` para evitar cache antigo. Se somente HTML mudar, avaliar se o cache dos assets é relevante antes de incrementá-los.
6. Conferir `git status` antes de commit; preservar alterações não relacionadas e nunca incluir `comprovantes/` sem autorização explícita.
7. Antes de commit/push, revisar URLs externas, dados de contato, horários, valores e o `README.md` quando a mudança afetar a documentação do projeto.

## Forma de comunicação preferida

O proprietário do projeto utiliza GitHub e Visual Studio Code. Ao explicar uma alteração, indicar de forma simples qual arquivo foi envolvido, o efeito no site e como validar/publicar. Evitar jargão desnecessário e nunca tratar uma publicação no GitHub Pages como concluída sem que o commit/push tenha sido solicitado ou realizado.
