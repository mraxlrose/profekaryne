# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Professional website for Profª Karyne Mignoni (KM Reforço Escolar) — a Portuguese language tutor based in Caxias do Sul, RS. The site is a **single self-contained HTML file** (`index.html`) with all CSS and JavaScript embedded inline. No build system, package manager, or external dependencies.

## Running the Site

Open `index.html` directly in a browser, or serve it with any static file server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

There is no build step, no `npm install`, and no compilation required.

## Architecture

Everything lives in `index.html` (~1370 lines):

- **Lines 1–68**: `<head>` — SEO meta tags, Schema.org JSON-LD structured data, Google Fonts import
- **Lines 69–640**: Embedded `<style>` block — all CSS, including CSS custom properties (color palette defined in `:root`), responsive media queries, and section-specific styles
- **Lines 641–1285**: HTML body with these sections (by `id`): `inicio` (hero/nav), `sobre`, `servicos`, `horarios`, `redacao`, `jogos`, `depoimentos`, `valores`, `contato`, and `<footer>`
- **Lines 1286–1313**: Inline `<script>` — async Formspree contact form submission handler

## Key Integration Points

**Formspree contact form**: The form posts to `https://formspree.io/f/SEU_ID_AQUI`. Replace `SEU_ID_AQUI` with the actual Formspree form ID to activate email delivery.

**WhatsApp links**: Purchase buttons in the `#jogos` section and the floating WhatsApp button use `wa.me/5554912854260` with pre-filled URL-encoded messages. When adding new game cards, follow the same pattern.

**Color palette** (CSS custom properties):
- `--verde`: #2D6A4F (primary brand green)
- `--verde-claro`: #52B788
- `--verde-palido`: #D8F3DC
- `--dourado`: #C9A84C (accent)
- `--creme`: #FDFAF4 (background)

## Cache-busting (obrigatório antes de todo commit)

Os imports de CSS e JS em `index.html` usam query strings de versão para forçar o navegador a baixar a versão atualizada. **Antes de criar qualquer commit**, incremente os números de versão:

- `assets/css/style.css?v=N` — linha 83
- `assets/js/main.js?v=N` — linha 751

Exemplo: se estava `?v=4`, mude para `?v=5`. Faça isso mesmo que o CSS ou JS não tenham sido alterados — o que importa é que o HTML mudou e o navegador precisa revalidar os assets.

## Deployment

The site is hosted on GitHub Pages at `https://mraxlrose.github.io/profekaryne/`. The canonical URL and Open Graph URLs reference this address — update them if the hosting location changes.
