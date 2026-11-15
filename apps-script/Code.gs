/**
 * Stickora.rs — porudžbine u Google Drive.  VERZIJA 2 (folder + redni broj)
 *
 * Za svaku porudžbinu pravi se JEDAN folder u Drive-u, npr.
 *   "0001 — matke 67 (50 kom)"
 * a u njemu:
 *   - fajl sa dizajnom koji se štampa (slika/PDF/…)
 *   - porudzbina.txt sa svim podacima o porudžbini
 * Broj porudžbine je redni: prva ikada = 0001, druga = 0002, itd.
 * Na mejl stiže isti tekst + link ka folderu. Google tabela se NE pravi.
 *
 * Deploy: Deploy -> Manage deployments -> Edit -> Version: New version -> Deploy
 *   (Execute as: Me  |  Who has access: Anyone)
 * Provera verzije: otvori Web app URL u browseru — mora da piše "verzija": "2".
 */

// ==== PODESAVANJA ====
var FOLDER_NAME = 'Stickora porudžbine';  // glavni folder u Drive-u (pravi se sam ako ne postoji)
var NOTIFY_EMAIL = '';                    // prazno = obaveštenje ide na mejl vlasnika skripte
var MAX_FILE_BYTES = 30 * 1024 * 1024;    // 30MB (sajt ograničava na 20MB)
var COUNTER_PROP = 'brojPorudzbine';      // gde se pamti poslednji redni broj

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Prazan zahtev');
    }
    var data = JSON.parse(e.postData.contents);
    var now = new Date();

    var fileBytes = null;
    if (data.fajl && data.fajl.base64) {
      fileBytes = Utilities.base64Decode(data.fajl.base64);
      if (fileBytes.length > MAX_FILE_BYTES) {
        throw new Error('Fajl je veći od 30MB');
      }
    }

    var orderNo = nextOrderNo_();          // 0001, 0002, 0003…
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
      version: '2',
      orderNumber: orderNo,
      folderUrl: orderFolder.getUrl(),
      fileUrl: fileUrl,
    });
  } catch (err) {
    return json_({ ok: false, version: '2', error: String((err && err.message) || err) });
  }
}

function doGet() {
  return json_({
    ok: true,
    version: '2',
    message: 'Stickora endpoint radi (verzija 2 — folder po porudžbini, redni brojevi).',
  });
}

// ==== REDNI BROJ PORUDŽBINE ====

/** Sledeći redni broj; otporan na paralelne zahteve i na brisanje skript-property-ja. */
function nextOrderNo_() {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var props = PropertiesService.getScriptProperties();
    var sacuvano = Number(props.getProperty(COUNTER_PROP) || 0);
    var izFoldera = maxFolderNumber_();
    var sledeci = Math.max(sacuvano, izFoldera) + 1;
    props.setProperty(COUNTER_PROP, String(sledeci));
    return ('000' + sledeci).slice(-4);
  } finally {
    lock.releaseLock();
  }
}

/** Najveći broj koji već postoji u imenima foldera (da se ne bi ponovio). */
function maxFolderNumber_() {
  var max = 0;
  var it = DriveApp.getFoldersByName(FOLDER_NAME);
  if (!it.hasNext()) return 0;
  var children = it.next().getFolders();
  while (children.hasNext()) {
    var m = String(children.next().getName()).match(/^(\d+)/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max;
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
  MailApp.sendEmail(to, 'Nova porudžbina #' + orderNo + ' — ' + (data.ime || '') +
    (data.kolicina ? ' (' + data.kolicina + ' kom)' : ''), body);
}

function safeName_(text) {
  return String(text).replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
