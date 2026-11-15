/**
 * Stickora.rs — porudžbine u Google Drive.
 *
 * Za svaku porudžbinu pravi se JEDAN folder u Drive-u, npr.
 *   "20261115-214640-ab12 — matke 67 (50 kom)"
 * a u njemu:
 *   - fajl sa dizajnom koji se štampa (slika/PDF/…)
 *   - porudzbina.txt sa svim podacima o porudžbini
 * Na mejl stiže isti tekst + link ka folderu. Google tabela se NE pravi.
 *
 * Deploy: Deploy -> New deployment -> Web app
 *   Execute as: Me  |  Who has access: Anyone
 * Kopiraj URL i nalepi ga u index.html u atribut data-endpoint na <form id="orderForm">.
 */

// ==== PODESAVANJA ====
var FOLDER_NAME = 'Stickora porudžbine';  // glavni folder u Drive-u (pravi se sam ako ne postoji)
var NOTIFY_EMAIL = '';                    // prazno = obaveštenje ide na mejl vlasnika skripte
var MAX_FILE_BYTES = 30 * 1024 * 1024;    // 30MB (sajt ograničava na 20MB)

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Prazan zahtev');
    }
    var data = JSON.parse(e.postData.contents);
    var now = new Date();
    var orderNo = Utilities.formatDate(now, 'Europe/Belgrade', 'yyyyMMdd-HHmmss') + '-' +
      Utilities.getUuid().slice(0, 4);

    var fileBytes = null;
    if (data.fajl && data.fajl.base64) {
      fileBytes = Utilities.base64Decode(data.fajl.base64);
      if (fileBytes.length > MAX_FILE_BYTES) {
        throw new Error('Fajl je veći od 30MB');
      }
    }

    var root = getFolder_();
    var orderFolder = root.createFolder(folderName_(data, orderNo));

    var fileUrl = '';
    if (fileBytes) {
      var blob = Utilities.newBlob(
        fileBytes,
        data.fajl.type || 'application/octet-stream',
        safeName_(data.fajl.name || 'dizajn')
      );
      fileUrl = orderFolder.createFile(blob).getUrl();
    }

    var text = orderText_(data, now, orderNo);
    orderFolder.createFile(Utilities.newBlob(text, 'text/plain', 'porudzbina.txt'));

    notify_(data, orderNo, text, orderFolder.getUrl(), fileUrl);

    return json_({
      ok: true,
      orderId: orderNo,
      folderUrl: orderFolder.getUrl(),
      fileUrl: fileUrl,
    });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

function doGet() {
  return json_({ ok: true, message: 'Stickora endpoint radi. Porudžbine se šalju POST zahtevom.' });
}

// ==== POMOĆNE FUNKCIJE ====

function getFolder_() {
  var folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(FOLDER_NAME);
}

function folderName_(data, orderNo) {
  var title = safeName_(data.ime || 'porudžbina');
  if (data.kolicina) title += ' (' + safeName_(data.kolicina) + ' kom)';
  return orderNo + ' — ' + title;
}

/** Tekst porudžbine — isti format kao porudzbina.txt. */
function orderText_(data, now, orderNo) {
  var jeGotovDizajn = String(data.tip || '').toLowerCase().indexOf('imam') === 0 ||
    String(data.tip || '').indexOf('svoj dizajn') !== -1;
  var napomena = (data.napomena || '').trim();
  var opis = jeGotovDizajn ? '-' : (napomena || '-');
  var nap = jeGotovDizajn ? (napomena || '-') : '-';
  var dimenzije = (data.sirina || '?') + ' x ' + (data.visina || '?') + ' cm';

  return [
    'STICKORA.RS — NOVA PORUDŽBINA',
    '================================',
    'Broj porudžbine: ' + orderNo,
    'Datum: ' + Utilities.formatDate(now, 'Europe/Belgrade', 'yyyy-MM-dd'),
    '',
    'KUPAC',
    'Ime i prezime: ' + (data.ime || '-'),
    'Email: ' + (data.email || '-'),
    'Telefon: ' + (data.telefon || '-'),
    'Adresa: ' + (data.adresa || '-'),
    '',
    'PORUDŽBINA',
    'Tip: ' + (jeGotovDizajn ? 'Kupac ima svoj dizajn' : 'Kupac traži izradu dizajna'),
    'Oblik: ' + (data.oblik || '-'),
    'Dimenzije: ' + dimenzije,
    'Količina: ' + (data.kolicina || '-'),
    'Materijal: ' + (data.materijal || '-'),
    '',
    'OPIS DIZAJNA / ZAHTEV',
    opis,
    '',
    'NAPOMENA',
    nap,
  ].join('\n');
}

function notify_(data, orderNo, text, folderUrl, fileUrl) {
  var to = NOTIFY_EMAIL || Session.getActiveUser().getEmail();
  if (!to) return;
  var body = text + '\n\nFolder: ' + folderUrl + '\nFajl: ' + (fileUrl || 'nije priložen');
  MailApp.sendEmail(to, 'Nova porudžbina — ' + (data.ime || orderNo) +
    (data.kolicina ? ' (' + data.kolicina + ' kom)' : ''), body);
}

function safeName_(text) {
  return String(text).replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
