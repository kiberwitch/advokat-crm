/* ============================================================
   DATA.JS — единый слой данных CRM (mock, без backend)
   Хранилище: localStorage (ключ ADVCRM_DB_V1)
   Все страницы подключают этот файл первым.
   ============================================================ */

const DB_KEY = 'ADVCRM_DB_V1';

const STATUS_META = {
  'Новое':               { color: '#9AA0AC', bg: '#F1F2F4', text: '#54565C' },
  'В работе':            { color: '#2D5DE0', bg: '#E8EEFD', text: '#2147B4' },
  'Ожидание оплаты':     { color: '#C97A1E', bg: '#FBEFDD', text: '#9A5B12' },
  'Есть задолженность': { color: '#C23B3B', bg: '#FBE6E6', text: '#9C2A2A' },
  'Завершено':           { color: '#2F8B4F', bg: '#E5F4EA', text: '#216B3A' },
  'Архив':               { color: '#5B5F6B', bg: '#E9E9EC', text: '#3C3E47' },
};
const STATUS_ORDER = ['Новое','В работе','Ожидание оплаты','Есть задолженность','Завершено','Архив'];
const ACTIVE_STATUSES = ['Новое','В работе','Ожидание оплаты','Есть задолженность'];
const BODIES = ['МВД', 'СК', 'Суд'];
const PARTICIPATION_TYPES = ['Допрос','Обыск/осмотр','Судебное заседание','Ознакомление с делом','Консультация','Апелляционное заседание'];
const COMPLEXITY_MULT = { 'Стандартное': 1, 'Сложное': 1.5, 'Особо сложное': 2 };

function seedData() {
  const clients = [
    { id: 'cl1', fio: 'Иванов Пётр Сергеевич', phone: '+7 901 111-22-33' },
    { id: 'cl2', fio: 'Смирнова Анна Викторовна', phone: '+7 902 222-33-44' },
    { id: 'cl3', fio: 'Ковалёв Дмитрий Олегович', phone: '+7 903 333-44-55' },
    { id: 'cl4', fio: 'Никитина Елена Павловна', phone: '+7 904 444-55-66' },
    { id: 'cl5', fio: 'Зайцев Артём Игоревич', phone: '+7 905 555-66-77' },
    { id: 'cl6', fio: 'Морозова Ольга Андреевна', phone: '+7 906 666-77-88' },
  ];

  const cases = [
    { id: 'case1', clientId: 'cl1', investigationNumber: '11801-22', courtNumber: '1-345/2024', appealNumber: '', status: 'В работе', comment: 'Дело по ст. 159 УК РФ.', createdAt: '2024-01-15' },
    { id: 'case2', clientId: 'cl2', investigationNumber: '11920-23', courtNumber: '1-118/2024', appealNumber: '22-901/2024', status: 'Есть задолженность', comment: 'Апелляция назначена.', createdAt: '2023-11-02' },
    { id: 'case3', clientId: 'cl3', investigationNumber: '12044-24', courtNumber: '', appealNumber: '', status: 'Новое', comment: 'Принято в производство.', createdAt: '2025-03-10' },
    { id: 'case4', clientId: 'cl4', investigationNumber: '11550-22', courtNumber: '1-077/2023', appealNumber: '', status: 'Завершено', comment: 'Приговор вступил в силу.', createdAt: '2022-09-21' },
    { id: 'case5', clientId: 'cl5', investigationNumber: '11890-23', courtNumber: '1-203/2024', appealNumber: '', status: 'Ожидание оплаты', comment: 'Ожидаем оплату по счёту.', createdAt: '2024-04-18' },
    { id: 'case6', clientId: 'cl6', investigationNumber: '10980-21', courtNumber: '1-012/2022', appealNumber: '22-450/2022', status: 'Архив', comment: 'Дело закрыто, материалы в архиве.', createdAt: '2021-06-01' },
  ];

  const participations = [
    { id: 'p1', caseId: 'case1', date: '2024-02-01', type: 'Допрос', complexity: 'Стандартное', body: 'МВД', amount: 8000 },
    { id: 'p2', caseId: 'case1', date: '2024-03-12', type: 'Судебное заседание', complexity: 'Сложное', body: 'Суд', amount: 18000 },
    { id: 'p3', caseId: 'case1', date: '2024-05-20', type: 'Судебное заседание', complexity: 'Стандартное', body: 'Суд', amount: 12000 },
    { id: 'p4', caseId: 'case2', date: '2023-11-10', type: 'Допрос', complexity: 'Стандартное', body: 'СК', amount: 8000 },
    { id: 'p5', caseId: 'case2', date: '2024-01-22', type: 'Судебное заседание', complexity: 'Особо сложное', body: 'Суд', amount: 24000 },
    { id: 'p6', caseId: 'case2', date: '2024-06-02', type: 'Апелляционное заседание', complexity: 'Сложное', body: 'Суд', amount: 18000 },
    { id: 'p7', caseId: 'case3', date: '2025-03-15', type: 'Ознакомление с делом', complexity: 'Стандартное', body: 'СК', amount: 6000 },
    { id: 'p8', caseId: 'case4', date: '2022-10-05', type: 'Судебное заседание', complexity: 'Стандартное', body: 'Суд', amount: 12000 },
    { id: 'p9', caseId: 'case4', date: '2023-01-19', type: 'Судебное заседание', complexity: 'Стандартное', body: 'Суд', amount: 12000 },
    { id: 'p10', caseId: 'case5', date: '2024-05-02', type: 'Обыск/осмотр', complexity: 'Сложное', body: 'МВД', amount: 13500 },
    { id: 'p11', caseId: 'case5', date: '2024-05-30', type: 'Судебное заседание', complexity: 'Стандартное', body: 'Суд', amount: 12000 },
    { id: 'p12', caseId: 'case6', date: '2021-07-14', type: 'Допрос', complexity: 'Стандартное', body: 'МВД', amount: 7000 },
    { id: 'p13', caseId: 'case6', date: '2022-02-01', type: 'Судебное заседание', complexity: 'Стандартное', body: 'Суд', amount: 11000 },
    { id: 'p14', caseId: 'case6', date: '2022-04-28', type: 'Апелляционное заседание', complexity: 'Стандартное', body: 'Суд', amount: 11000 },
  ];

  const payments = [
    { id: 'pay1', caseId: 'case1', body: 'Суд', amount: 18000, date: '2024-03-15', status: 'Оплачено' },
    { id: 'pay2', caseId: 'case1', body: 'МВД', amount: 8000, date: '2024-02-05', status: 'Оплачено' },
    { id: 'pay3', caseId: 'case2', body: 'СК', amount: 8000, date: '2023-11-15', status: 'Оплачено' },
    { id: 'pay4', caseId: 'case3', body: 'СК', amount: 0, date: '2025-03-15', status: 'Ожидание' },
    { id: 'pay5', caseId: 'case4', body: 'Суд', amount: 24000, date: '2023-02-01', status: 'Оплачено' },
    { id: 'pay6', caseId: 'case5', body: 'МВД', amount: 13500, date: '2024-05-10', status: 'Оплачено' },
    { id: 'pay7', caseId: 'case6', body: 'МВД', amount: 7000, date: '2021-07-20', status: 'Оплачено' },
    { id: 'pay8', caseId: 'case6', body: 'Суд', amount: 22000, date: '2022-05-10', status: 'Оплачено' },
  ];

  const applications = [
    { id: 'a1', caseId: 'case1', number: 'З-014/24', date: '2024-03-01', amount: 18000, status: 'Удовлетворено' },
    { id: 'a2', caseId: 'case2', number: 'З-039/23', date: '2023-11-12', amount: 8000, status: 'Удовлетворено' },
    { id: 'a3', caseId: 'case2', number: 'З-058/24', date: '2024-06-03', amount: 18000, status: 'Отправлено' },
    { id: 'a4', caseId: 'case5', number: 'З-061/24', date: '2024-05-31', amount: 12000, status: 'Черновик' },
  ];

  const files = [
    { id: 'f1', caseId: 'case1', name: 'Постановление_о_возбуждении.pdf', size: '482 КБ', uploadedAt: '2024-01-16' },
    { id: 'f2', caseId: 'case1', name: 'Соглашение_об_оказании_юр_помощи.docx', size: '88 КБ', uploadedAt: '2024-01-16' },
    { id: 'f3', caseId: 'case2', name: 'Апелляционная_жалоба.docx', size: '154 КБ', uploadedAt: '2024-06-01' },
  ];

  const history = [
    { id: 'h1', caseId: 'case1', date: '2024-01-15', type: 'Создание', text: 'Дело создано и принято в производство.' },
    { id: 'h2', caseId: 'case1', date: '2024-02-01', type: 'Участие', text: 'Добавлено участие: Допрос (МВД), 8 000 ₽.' },
    { id: 'h3', caseId: 'case1', date: '2024-02-05', type: 'Оплата', text: 'Зафиксирована оплата от МВД на сумму 8 000 ₽.' },
    { id: 'h4', caseId: 'case1', date: '2024-03-01', type: 'Заявление', text: 'Сформировано заявление З-014/24 на сумму 18 000 ₽.' },
    { id: 'h5', caseId: 'case1', date: '2024-03-15', type: 'Оплата', text: 'Зафиксирована оплата от Суда на сумму 18 000 ₽.' },
    { id: 'h6', caseId: 'case2', date: '2023-11-02', type: 'Создание', text: 'Дело создано и принято в производство.' },
    { id: 'h7', caseId: 'case2', date: '2024-06-02', type: 'Участие', text: 'Добавлено участие: Апелляционное заседание (Суд), 18 000 ₽.' },
    { id: 'h8', caseId: 'case2', date: '2024-06-03', type: 'Заявление', text: 'Сформировано заявление З-058/24 на сумму 18 000 ₽.' },
  ];

  const tariffs = [
    { id: 't1', startDate: '2021-01-01', type: 'Допрос', amount: 7000 },
    { id: 't2', startDate: '2021-01-01', type: 'Обыск/осмотр', amount: 9000 },
    { id: 't3', startDate: '2021-01-01', type: 'Судебное заседание', amount: 11000 },
    { id: 't4', startDate: '2021-01-01', type: 'Ознакомление с делом', amount: 6000 },
    { id: 't5', startDate: '2021-01-01', type: 'Консультация', amount: 4000 },
    { id: 't6', startDate: '2021-01-01', type: 'Апелляционное заседание', amount: 11000 },
    { id: 't7', startDate: '2024-01-01', type: 'Допрос', amount: 8000 },
    { id: 't8', startDate: '2024-01-01', type: 'Обыск/осмотр', amount: 9000 },
    { id: 't9', startDate: '2024-01-01', type: 'Судебное заседание', amount: 12000 },
  ];

  const settings = {
    requisites: {
      orgName: 'Адвокатский кабинет А.А. Адвокатова',
      inn: '770000000000',
      account: '40802810000000000000',
      bank: 'ПАО «Банк», БИК 044525000',
      address: 'г. Москва, ул. Юридическая, д. 1, оф. 12',
    },
    applicationTemplate:
`В [наименование органа]

ЗАЯВЛЕНИЕ
об оплате труда адвоката

Я, адвокат [ФИО адвоката], осуществляю защиту по назначению
по делу № [номер дела] в отношении [ФИО подозреваемого/обвиняемого].

В соответствии с постановлением прошу произвести оплату
труда адвоката за участие в деле в размере [сумма] рублей.

Реквизиты для перечисления:
[реквизиты]

Дата: [дата]
Подпись: ___________`,
  };

  return { clients, cases, participations, payments, applications, files, history, tariffs, settings };
}

function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const fresh = seedData();
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    const fresh = seedData();
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function resetDB() {
  localStorage.removeItem(DB_KEY);
  return loadDB();
}

/* ---------- helpers ---------- */

function uid(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}

function fmtMoney(n) {
  return (Math.round(n * 100) / 100).toLocaleString('ru-RU') + ' ₽';
}

function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function getClient(db, clientId) {
  return db.clients.find(c => c.id === clientId);
}

function getCaseParticipations(db, caseId) {
  return db.participations.filter(p => p.caseId === caseId).sort((a, b) => a.date.localeCompare(b.date));
}

function getCasePayments(db, caseId) {
  return db.payments.filter(p => p.caseId === caseId).sort((a, b) => a.date.localeCompare(b.date));
}

function getCaseApplications(db, caseId) {
  return db.applications.filter(a => a.caseId === caseId).sort((a, b) => a.date.localeCompare(b.date));
}

function getCaseFiles(db, caseId) {
  return db.files.filter(f => f.caseId === caseId);
}

function getCaseHistory(db, caseId) {
  return db.history.filter(h => h.caseId === caseId).sort((a, b) => b.date.localeCompare(a.date));
}

function caseAccrued(db, caseId) {
  return getCaseParticipations(db, caseId).reduce((s, p) => s + p.amount, 0);
}

function casePaid(db, caseId) {
  return getCasePayments(db, caseId)
    .filter(p => p.status === 'Оплачено')
    .reduce((s, p) => s + p.amount, 0);
}

function caseDebt(db, caseId) {
  return caseAccrued(db, caseId) - casePaid(db, caseId);
}

function caseRow(db, c) {
  const client = getClient(db, c.clientId);
  return {
    case: c,
    client,
    accrued: caseAccrued(db, c.id),
    paid: casePaid(db, c.id),
    debt: caseDebt(db, c.id),
  };
}

function tariffFor(db, type, dateIso) {
  const matches = db.tariffs
    .filter(t => t.type === type && t.startDate <= dateIso)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  return matches.length ? matches[0].amount : 0;
}

function addHistory(db, caseId, type, text) {
  db.history.push({ id: uid('h'), caseId, date: new Date().toISOString().slice(0, 10), type, text });
}

/* Группировка задолженности по органам / клиентам, по всем делам не в архиве (для дашборда/долгов) */
function debtsByBody(db) {
  const map = {};
  BODIES.forEach(b => map[b] = { accrued: 0, paid: 0 });
  db.cases.forEach(c => {
    getCaseParticipations(db, c.id).forEach(p => { map[p.body].accrued += p.amount; });
    getCasePayments(db, c.id).filter(p => p.status === 'Оплачено').forEach(p => { map[p.body].paid += p.amount; });
  });
  return BODIES.map(b => ({ body: b, accrued: map[b].accrued, paid: map[b].paid, debt: map[b].accrued - map[b].paid }));
}

function debtsByClient(db) {
  return db.clients.map(cl => {
    const clientCases = db.cases.filter(c => c.clientId === cl.id);
    const accrued = clientCases.reduce((s, c) => s + caseAccrued(db, c.id), 0);
    const paid = clientCases.reduce((s, c) => s + casePaid(db, c.id), 0);
    return { client: cl, accrued, paid, debt: accrued - paid };
  }).filter(r => r.accrued > 0);
}

/* Детальная таблица долгов: орган x клиент */
function debtsDetailed(db) {
  const rows = [];
  db.cases.forEach(c => {
    const client = getClient(db, c.clientId);
    BODIES.forEach(body => {
      const accrued = getCaseParticipations(db, c.id).filter(p => p.body === body).reduce((s, p) => s + p.amount, 0);
      const paid = getCasePayments(db, c.id).filter(p => p.body === body && p.status === 'Оплачено').reduce((s, p) => s + p.amount, 0);
      if (accrued > 0) {
        rows.push({ caseId: c.id, case: c, client, body, accrued, paid, debt: accrued - paid });
      }
    });
  });
  return rows;
}
