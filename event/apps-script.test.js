// Тесты логики apps-script.gs. Запуск: node --test event/apps-script.test.js
// Google-сервисы (таблица) здесь не участвуют, их проверяем руками по SETUP.md.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, 'apps-script.gs'), 'utf8'), script);
const { parseRegistration, allRequestsRow } = script;

const valid = {
  name: 'Анна Петрова',
  company: 'ООО «Ромашка»',
  phone: '+375 29 123-45-67',
  email: 'anna@example.com',
  cities: ['Солигорск', 'Слуцк'],
  topic: 'Как выйти на новые рынки',
  consent: true,
};

test('правильная заявка становится строкой для листа «Все заявки»', () => {
  const result = parseRegistration(JSON.stringify(valid));
  assert.equal(result.ok, true);
  const at = new Date('2026-11-01T09:30:00Z');
  assert.deepEqual(Array.from(allRequestsRow(result.registration, at)), [
    at,
    'Анна Петрова',
    'ООО «Ромашка»',
    '+375 29 123-45-67',
    'anna@example.com',
    'Солигорск, Слуцк',
    'Как выйти на новые рынки',
  ]);
});

for (const field of ['name', 'company', 'phone', 'email']) {
  test(`заявка без поля ${field} отклоняется`, () => {
    const result = parseRegistration(JSON.stringify({ ...valid, [field]: '  ' }));
    assert.equal(result.ok, false);
    assert.ok(result.error);
  });
}

const invalid = {
  'email без @': { email: 'anna.example.com' },
  'email без домена': { email: 'anna@' },
  'ни одного города': { cities: [] },
  'город не из списка': { cities: ['Минск'] },
  'нет согласия': { consent: false },
};
for (const [title, patch] of Object.entries(invalid)) {
  test(`отклоняется: ${title}`, () => {
    const result = parseRegistration(JSON.stringify({ ...valid, ...patch }));
    assert.equal(result.ok, false);
    assert.ok(result.error);
  });
}

test('отклоняется тело запроса, которое не JSON', () => {
  const result = parseRegistration('name=Анна');
  assert.equal(result.ok, false);
});

test('тема необязательна, лишние пробелы по краям убираются', () => {
  const result = parseRegistration(JSON.stringify({ ...valid, name: '  Анна Петрова ', topic: undefined }));
  assert.equal(result.ok, true);
  const row = allRequestsRow(result.registration, new Date());
  assert.equal(row[1], 'Анна Петрова');
  assert.equal(row[6], '');
});
