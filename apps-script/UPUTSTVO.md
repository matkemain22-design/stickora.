# Uputstvo — porudžbine u Google Drive (korak po korak)

Ovo se radi **jednom**. Traje oko 5–10 minuta. Posle toga više ne diraš Google,
samo objaviš sajt i porudžbine same dolaze.

Šta ti treba: samo Google nalog (Gmail) i sajt otvoren u drugom tabu.

---

## Deo 1 — Napravi skriptu

**Korak 1.** U browseru otvori: `script.google.com`

**Korak 2.** Ako te pita da izabereš nalog, izaberi svoj Gmail. Ako traži da
prihvatiš uslove, klikni **Accept** / **Prihvatam**.

**Korak 3.** Gore levo klikni dugme **+ New project** (Novi projekat).
Otvoriće se editor sa fajlom `Code.gs`.

**Korak 4.** U editoru ćeš videti neki tekst (`function myFunction() { ... }`).
Klikni unutra i obeleži **sve** — `Ctrl+A` (na Macu `Cmd+A`) — pa obriši (`Delete`).

**Korak 5.** Iz našeg projekta otvori fajl `apps-script/Code.gs`, obeleži sve
(`Ctrl+A`), kopiraj (`Ctrl+C`) i nalepi u Google editor (`Ctrl+V`).

**Korak 6.** Sačuvaj: `Ctrl+S` (na Macu `Cmd+S`) ili klikni ikonicu diskete gore.
Ako je tražilo ime projekta, nalepi u polje gore levo: `Stickora porudžbine`.

---

## Deo 2 — Objavi skriptu (deploy)

**Korak 7.** Gore desno klikni plavo dugme **Deploy** → pa **New deployment**.

**Korak 8.** Otvoriće se prozor. Klikni na zupčanik ⚙ pored **Select type** i
izaberi **Web app**.

**Korak 9.** Popuni tri polja:

| Polje | Šta izabereš |
|---|---|
| **Description** | upiši `Stickora` (nije obavezno) |
| **Execute as** | **Me** (tvoj mejl) — ovo je važno! |
| **Who has access** | **Anyone** — ovo je važno! |

> Zašto: *Execute as: Me* znači da se skripta izvršava kao ti i sme da snima u
> tvoj Drive. *Who has access: Anyone* znači da posetilac sajta sme da pošalje
> porudžbinu bez ikakvog naloga — ali ne može da čita tvoj Drive.

**Korak 10.** Klikni **Deploy**.

**Korak 11.** Pojaviće se **Authorize access** → klikni to i izaberi svoj Gmail.

**Korak 12.** Pojaviće se žuti/plavi ekran „Google hasn't verified this app".
To je normalno — skriptu si sam napravio.
Klikni **Advanced** (dole levo) → zatim **Go to Stickora porudžbine (unsafe)**.

**Korak 13.** Klikni **Allow** (Dozvoli). Ako traži još neku dozvolu, klikni
**Allow** i na njoj. Time si dozvolio svojoj skripti da snima fajlove u Drive,
pravi foldere i šalje ti mejl.

**Korak 14.** Sada se pojavi prozor **Web app** sa poljem **URL**, npr.
`https://script.google.com/macros/s/AKfy.../exec`.
Klikni **Copy** (Kopiraj) i nalepi negde kod sebe u beležnicu — trebaće ti u
koraku 17.

**Korak 15. Provera da skripta radi:** nalepi taj URL u novi tab u browseru i
klikni Enter. Treba da vidiš tekst:

```json
{"ok":true,"message":"Stickora endpoint radi. Porudžbine se šalju POST zahtevom."}
```

Ako to vidiš — Google strana je gotova. ✅

---

## Deo 3 — Ubaci URL u sajt

**Korak 16.** Otvori sajt u GitHub-u: `github.com/matkemain22-design/stickora`
i klikni na fajl **`index.html`**.

**Korak 17.** Gore desno klikni olovčicu (**Edit this file** / ikonica ✏).

**Korak 18.** Pritisni `Ctrl+F` i traži: `data-endpoint`

Naći ćeš liniju koja počinje ovako:

```html
<form id="orderForm" data-endpoint="" method="POST"
```

**Korak 19.** Nalepi svoj URL **između navodnika**:

```html
<form id="orderForm" data-endpoint="https://script.google.com/macros/s/AKfy.../exec" method="POST"
```

Pazi: URL ide unutar `" "`, bez razmaka, i `=` ostaje.

**Korak 20.** Klikni zeleno **Commit changes** → opet **Commit changes**.
Sačekaj minut-dva da se sajt osveži na `github.io` / tvom domenu.

---

## Deo 4 — Test (bitno, uradi ga)

**Korak 21.** Otvori sajt, skroluj do **Poručite nalepnice**.

**Korak 22.** Popuni formu sa probnim podacima. Kod **Fajl sa dizajnom** ubaci
bilo koju sliku sa telefona/računara. Klikni **Pošalji porudžbinu**.

**Korak 23.** Treba da se pojavi zeleno: „Hvala! Porudžbina je poslata…"
Ako se pojavi crveno — pogledaj „Ako zapne" niže.

**Korak 24.** Proveri gde je otišlo:
- **Google Drive** (`drive.google.com`) → folder **Stickora porudžbine** → unutra
  je novi podfolder, npr. `20261115-214640-ab12 — matke 67 (50 kom)`.
- U tom podfolderu su **fajl sa dizajnom** (onaj koji se štampa) i
  **porudzbina.txt** sa svim podacima (kupac, dimenzije, količina, opis, napomena).
- **Gmail** → stiže mejl „Nova porudžbina — …" (prvi možda u Spam/Neželjeno, pa
  ga označi kao „Nije spam").

Kad ovo proradi, sve buduće porudžbine dolaze same. 🎉

---

## Ako zapne

**„Forma trenutno nije dostupna."**
→ `data-endpoint` je još prazan u `index.html` (koraci 16–20), ili sajt još nije
osvežen posle commita. Sačekaj 1–2 minuta i osveži stranicu (`Ctrl+F5`).

**„Slanje nije uspelo. Pokušajte ponovo…"**
→ Najčešće: u Apps Script-u *Who has access* nije **Anyone**, ili u
`data-endpoint` fali deo URL-a, ili je URL iz **starog** deployment-a. Ponovi
korake 7–15 i nalepi novi URL.

**Promenio si nešto u skripti, a sajt se ponaša po starom**
→ U Apps Script-u: **Deploy → Manage deployments → olovčica (Edit) → Version:
New version → Deploy**. Google uvek koristi poslednju objavljenu verziju.

**„Fajl je veći od 20MB."**
→ Smanji sliku/PDF pre slanja (npr. sačuvaj kao JPG ili smanji rezoluciju).
Forma namerno ograničava na 20MB da slanje ne bi pucalo.

**Ne stiže mejl**
→ Proveri Spam. Ako i dalje nema, u `Code.gs` na vrhu postoji `NOTIFY_EMAIL` —
upiši tu svoj mejl u navodnike (`'tvoj@gmail.com'`), sačuvaj i uradi
**New version** (vidi gore). Porudžbine se u svakom slučaju snimaju u Drive i
folder, nezavisno od mejla.

**Hoćeš da menjaš ime foldera**
→ U `Code.gs` na vrhu: `FOLDER_NAME`. Posle izmene uradi
**New version**.

---

## Šta smeš da podeliš, a šta ne

- **URL iz koraka 14** je javan (u njemu je i u sajtu) — to je normalno, on
  služi da prima porudžbine. Nemoj ga lepiti po forumima, ali nije tajna.
- **Pristup tvom Drive-u** nije u tom URL-u i niko ga preko njega ne dobija.
- Ako ikada posumnjaš da neko zloupotrebljava URL: u Apps Script-u
  **Deploy → Manage deployments → Archive**, pa napravi novi deployment i
  nalepi novi URL u `index.html`.
