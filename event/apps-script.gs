// «Деловой маршрут»: приём заявок со страницы ивента в Google Таблицу.
// Как развернуть — event/SETUP.md.

// Видна при открытии адреса веб-приложения: так понятно, какой код сейчас развёрнут.
// Меняем при каждом изменении скрипта.
var SCRIPT_VERSION = '2 — листы городов';

var CITIES =['Солигорск', 'Борисов', 'Молодечно', 'Слуцк'];
var REQUIRED_FIELDS = { name: 'ФИО', company: 'Название компании', phone: 'Номер телефона', email: 'Email' };
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var UNREADABLE = 'Заявка пришла в непонятном виде';

// Разбирает тело запроса со страницы и проверяет его так же, как проверяет форма.
// Возвращает { ok: true, registration } или { ok: false, error }.
function parseRegistration(body) {
  var data;
  try {
    data = JSON.parse(body);
  } catch (e) {
    return { ok: false, error: UNREADABLE };
  }
  if (!data || typeof data !== 'object') return { ok: false, error: UNREADABLE };

  var registration = {};
  for (var field in REQUIRED_FIELDS) {
    registration[field] = String(data[field] || '').trim();
    if (!registration[field]) return { ok: false, error: 'Не заполнено поле «' + REQUIRED_FIELDS[field] + '»' };
  }
  if (!EMAIL_PATTERN.test(registration.email)) return { ok: false, error: 'Email указан с ошибкой' };

  var cities = Array.isArray(data.cities) ? data.cities : [];
  registration.cities = CITIES.filter(function (city) { return cities.indexOf(city) !== -1; });
  if (!registration.cities.length || registration.cities.length !== cities.length) {
    return { ok: false, error: 'Выберите хотя бы один город из списка' };
  }
  if (data.consent !== true) return { ok: false, error: 'Нужно согласие на обработку персональных данных' };

  registration.topic = String(data.topic || '').trim();
  return { ok: true, registration: registration };
}

// Строка листа «Все заявки»: Дата и время | ФИО | Компания | Телефон | Email | Города | Тема.
function allRequestsRow(registration, receivedAt) {
  var r = registration;
  return [receivedAt, r.name, r.company, r.phone, r.email, r.cities.join(', '), r.topic];
}

// Строка листа города: Дата и время | ФИО | Компания | Телефон | Email | Тема.
function cityRow(registration, receivedAt) {
  var r = registration;
  return [receivedAt, r.name, r.company, r.phone, r.email, r.topic];
}

// values — содержимое своих колонок листа начиная с первой строки.
// Возвращает номер строки (с 1) сразу под последней, где заполнена хоть одна своя колонка.
// Колонки Ирины правее сюда не попадают, поэтому её пометки на выбор строки не влияют.
function rowAfterLastFilled(values) {
  for (var i = values.length - 1; i >= 0; i--) {
    var filled = values[i].some(function (cell) { return cell !== '' && cell !== null; });
    if (filled) return i + 2;
  }
  return 1;
}

// ---- Дальше работа с Google: автотестов нет, проверяем руками по SETUP.md ----

var ALL_REQUESTS_SHEET = 'Все заявки';
var ALL_REQUESTS_HEADER = ['Дата и время', 'ФИО', 'Компания', 'Телефон', 'Email', 'Города', 'Тема'];

// Страница отправляет заявку сюда: POST, тело — JSON строкой.
function doPost(e) {
  var result = parseRegistration(e && e.postData ? e.postData.contents : '');
  if (!result.ok) return jsonResponse({ ok: false, error: result.error });
  try {
    saveRegistration(result.registration, new Date());
  } catch (err) {
    console.error(err);
    return jsonResponse({ ok: false, error: 'Не удалось сохранить заявку, попробуйте ещё раз' });
  }
  return jsonResponse({ ok: true });
}

// Открыть адрес веб-приложения в браузере — быстрая проверка, что развёртывание живое.
function doGet() {
  return ContentService.createTextOutput('Скрипт «Деловой маршрут» работает. Заявки принимаются со страницы ивента. ' +
    'Версия кода: ' + SCRIPT_VERSION + '.');
}

var CITY_HEADER = ['Дата и время', 'ФИО', 'Компания', 'Телефон', 'Email', 'Тема'];

// Заявка ложится строкой на «Все заявки» и на лист каждого выбранного города.
// Блокировка: пока одна заявка ищет свободную строку и пишет, вторая ждёт,
// иначе обе нашли бы одну и ту же строку.
function saveRegistration(registration, receivedAt) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    writeRow(sheetWithHeader(ALL_REQUESTS_SHEET, ALL_REQUESTS_HEADER), allRequestsRow(registration, receivedAt));
    registration.cities.forEach(function (city) {
      writeRow(sheetWithHeader(city, CITY_HEADER), cityRow(registration, receivedAt));
    });
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

// Пишет только в первые row.length колонок, под последней заполненной строкой этих колонок.
// appendRow здесь не годится: он смотрит на весь лист, включая колонки Ирины справа.
function writeRow(sheet, row) {
  var lastRow = Math.max(sheet.getLastRow(), 1);
  var target = rowAfterLastFilled(sheet.getRange(1, 1, lastRow, row.length).getValues());
  if (target > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), target - sheet.getMaxRows());
  sheet.getRange(target, 1, 1, row.length).setValues([row.map(asPlainValue)]);
  sheet.getRange(target, 1).setNumberFormat('dd.MM.yyyy HH:mm');
}

function sheetWithHeader(name, header) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (!sheet.getRange(1, 1).getValue()) {
    sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Таблица считает формулой всё, что начинается с = + - @. Апостроф в начале
// оставляет значение текстом: «+375…» не превратится в число, «=…» — в формулу.
function asPlainValue(value) {
  return typeof value === 'string' && /^[=+\-@]/.test(value) ? "'" + value : value;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
