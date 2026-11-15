# Stickora.rs — statički sajt

Obični HTML/CSS sajt, hostuje se direktno na GitHub Pages (bez build koraka).

## Struktura
- `index.html` — stranica
- `css/styles-BmY8BzJP.css` — stilovi (Tailwind build)
- `images/` — logo, hero slika, favicon i OG slika

Putanje u `index.html` su relativne (`css/...`, `images/...`), zato folderi moraju ostati ovako.

## Objava
1. Ubaci sve fajlove iz ovog foldera u koren repozitorijuma (zajedno sa `css/` i `images/`).
2. Settings → Pages → Deploy from a branch → `main` / `(root)`.

## Forma za porudžbinu
GitHub Pages ne može da prima podatke iz forme. U `index.html` zameni `VAS_FORM_ID`
(u `action="https://formspree.io/f/VAS_FORM_ID"`) ID-jem sa formspree.io.
Upload fajlova Formspree podržava samo na plaćenom planu.
