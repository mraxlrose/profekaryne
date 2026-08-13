# KM Centro de Aprendizagem — Professora Karyne Mignoni

Site profissional da Professora Karyne Mignoni — Neuropsicopedagoga, Psicanalista e especialista em Língua Portuguesa, com atendimentos presenciais e online em Caxias do Sul – RS.

## Sobre o projeto

Site estático desenvolvido em HTML5, CSS3 e JavaScript puro, sem frameworks ou dependências externas. Estrutura organizada em arquivos separados para facilitar a manutenção.

## Estrutura de arquivos

```
profekaryne/
├── index.html              # Página principal
├── assets/
│   ├── css/
│   │   └── style.css       # Estilos (tema claro creme/dourado + tema escuro navy)
│   ├── js/
│   │   └── main.js         # Envio do formulário via Formspree
│   ├── img/
│   │   ├── logo_dourado.png  # Logo tema claro
│   │   ├── logo_preto.png    # Logo tema escuro
│   │   └── profekaryne.png   # Foto da professora
│   └── pdf/
│       └── quiz-substantivos-missao-gramatica.pdf  # Jogo gratuito
├── content/
│   └── site.json              # Textos principais editáveis pelo painel
├── admin/
│   ├── index.html             # Painel Decap CMS, acessível em /admin/
│   └── config.yml             # Campos exibidos no painel e integração GitHub
└── cloudflare-worker/
    └── src/index.js           # Login seguro do painel via GitHub OAuth
```

## Seções do site

- **Hero** — apresentação principal com badges e estatísticas
- **Sobre** — quem é Karyne Mignoni, formação e diferenciais
- **Serviços** — acompanhamento de aprendizagem, redação, psicanálise, orientação IC e avaliação diagnóstica gratuita
- **Redação** — método exclusivo, etapas e diferenciais
- **Horários** — disponibilidade de atendimento
- **Planos e valores** — do R$ 50 ao R$ 280–380, organizados por valor crescente
- **Jogos** — jogo gratuito para download + 3 jogos disponíveis na Hotmart
- **Contato** — formulário, WhatsApp, e-mail e localização

## Tecnologias

- HTML5, CSS3, JavaScript (vanilla)
- Google Fonts — Playfair Display + DM Sans
- [Formspree](https://formspree.io) — envio do formulário sem back-end
- [Hotmart](https://hotmart.com) — venda dos jogos educativos digitais

## Como rodar localmente

```bash
# Abra direto no navegador, ou sirva com Python:
python3 -m http.server 8080
# Acesse: http://localhost:8080
```

Não há etapa de build, npm install ou compilação.

## Painel de edição de conteúdo

Os textos principais das seções podem ser editados no painel `https://kmcentrodeaprendizagem.com.br/admin/`. Ele apresenta campos em português para Início, Sobre, Serviços, Redação, Horários, Valores, Jogos e Contato.

Ao abrir “Conteúdo das seções”, a editora pode usar a aba **Prévia** do painel para abrir uma cópia navegável do layout real do site antes de clicar em **Publicar**. Essa prévia é somente local no navegador: não cria commit e não altera o site público.

O painel salva as alterações no arquivo `content/site.json` do GitHub; em seguida, o GitHub Pages publica normalmente. Para que o login do painel funcione, é necessário concluir uma única vez a configuração do GitHub OAuth em um Cloudflare Worker. As instruções estão em [`cloudflare-worker/README.md`](cloudflare-worker/README.md).

Nunca coloque o Client Secret do GitHub ou qualquer token neste repositório.

## Ativar o formulário de contato

1. Crie uma conta em [formspree.io](https://formspree.io)
2. Crie um novo formulário e copie o ID gerado
3. Em `assets/js/main.js`, substitua `SEU_ID_AQUI` pelo ID obtido

## Hospedagem

O site está publicado no GitHub Pages:
**[kmcentrodeaprendizagem.com.br](https://kmcentrodeaprendizagem.com.br/)**

## Contato

- WhatsApp: (54) 9 9253-0598
- E-mail: km.centrodeaprendizagem@gmail.com
- Instagram: [@km.escutaeresultados](https://www.instagram.com/km.escutaeresultados/)
- Localização: Caxias do Sul – RS

---

© 2026 KM Centro de Aprendizagem — Professora Karyne Mignoni
