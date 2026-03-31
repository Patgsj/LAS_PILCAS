# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static real estate marketing website for "Las Pilcas" — a luxury residential land development in San Fabián de Alico, Ñuble, Chile. Domain: https://laspilcas.cl

## Development

No build process. Open `index.html` directly or use a local server.

**VSCode Live Server** is configured on port 5502 (`.vscode/settings.json`).

**Deployment:** Pushing to `main` triggers automatic FTP deployment via GitHub Actions (`.github/workflows/main.yml`) to `/home3/qeccyjtv/public_html/`.

## Architecture

Single-page HTML/CSS/JS app — no framework, no bundler, no router.

| File | Purpose |
|------|---------|
| `index.html` | All page structure — 5 sections: `#inicio`, `#proyecto`, `#galeria`, `#ubicacion`, `#contacto` |
| `script.js` | All interactivity: mobile menu, gallery lightbox, lot tooltip system, contact form AJAX, scroll-spy, WhatsApp widget |
| `style.css` | Custom styles on top of Tailwind CDN — lot map states, navbar, lightbox, animations |
| `enviar.php` | Contact form backend — validates inputs, emails `contacto@laspilcas.cl`, returns JSON |

**Styling stack:** Tailwind CSS (CDN) + custom `style.css`. Font Awesome 6 (CDN). Google Fonts: Playfair Display (headings), Inter (body). Dark theme with emerald green accents.

## Interactive Lot Map

The property map in `#proyecto` is an SVG embedded in `index.html`. Each lot (`<path>` or `<polygon>`) has:
- A `data-lote` attribute identifying the lot number
- CSS classes driving color by status: `disponible`, `vendido`, `reservado`, `tramite`
- Hover tooltips rendered by JS in `script.js` (tooltip logic section) showing lot details and WhatsApp CTA for available lots

When adding or updating lots, both the SVG element and the lot data object in `script.js` must be updated.

## Gallery

Images and videos live in `assets/img/`. The lightbox in `script.js` handles keyboard navigation (arrow keys, Esc). The `browser-image-compression` npm package (`package.json`) is available for image optimization utilities but is not part of the build — import it manually if needed.
