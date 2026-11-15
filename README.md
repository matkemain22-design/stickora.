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

## Forma za porudžbinu (Google Drive)
GitHub Pages ne može sam da prima podatke iz forme, zato porudžbine ide preko Google
Apps Script-a: on radi kao mali server na tvom Google nalogu i snima svaku porudžbinu
u Drive — za svaku porudžbinu poseban folder sa fajlom koji se štampa i
`porudzbina.txt` sa svim podacima. Google tabela se ne pravi.

### Podešavanje (radi se jednom, ~5 minuta)
Detaljno, ekran po ekran: **[apps-script/UPUTSTVO.md](apps-script/UPUTSTVO.md)**.
Kratka verzija:
1. Otvori https://script.google.com → **New project** i obriši sve što piše u editoru.
2. Nalepi sadržaj fajla `apps-script/Code.gs` i sačuvaj (Ctrl+S).
3. **Deploy → New deployment** → izaberi tip **Web app**.
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
4. **Deploy** → **Authorize access** → izaberi svoj Google nalog → *Advanced* →
   *Go to ... (unsafe)* → **Allow**. (Upozorenje je normalno: skriptu si sam napravio.)
5. Kopiraj **Web app URL** (`https://script.google.com/macros/s/AKfy.../exec`).
6. U `index.html` nađi `<form id="orderForm" data-endpoint=""` i nalepi URL u
   `data-endpoint`, npr. `data-endpoint="https://script.google.com/macros/s/AKfy.../exec"`.

Posle toga: u tvom Drive-u se pravi folder **Stickora porudžbine** (sam, prvi put),
a unutra za svaku porudžbinu podfolder, npr.
`0001 — matke 67 (50 kom)`, u kome su:
- broj porudžbine je **redni** (prva ikada = `0001`, druga = `0002`…), ne random;
- **fajl sa dizajnom** koji se štampa (imе fajla kakvo je kupac poslao),
- **porudzbina.txt** — isti format kao `podaci-porudzbine.txt` (kupac, porudžbina,
  opis, napomena).

Na mejl ti stiže isti tekst + link ka tom folderu.

### Napomene
- Ako izmeniš `Code.gs`, moraš da uradiš **Deploy → Manage deployments → Edit →
  New version**, inače sajt i dalje koristi staru verziju.
- Web app URL je javan (mora da bude, jer ga koriste posetioci).
- Google dozvoljava uvoz do ~30MB; forma trenutno ograničava fajl na 20MB.
- Ako forma prijavi „Forma trenutno nije dostupna", `data-endpoint` je još prazan.
- Bez Apps Script-a može i Google Forms (upload fajla ide u Drive), ali tada forma
  izgleda kao Google formular, ne kao dizajn sajta.
