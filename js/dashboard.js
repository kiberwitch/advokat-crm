/* ============================================================
   DASHBOARD.JS — логика главной страницы
   ============================================================ */

(function () {
  const db = loadDB();

  document.getElementById('todayLabel').textContent = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  /* ---- KPI ---- */
  const activeCases = db.cases.filter(c => c.status !== 'Архив' && c.status !== 'Завершено').length;
  const totalDebt = db.cases.reduce((s, c) => s + caseDebt(db, c.id), 0);

  const now = new Date();
  const monthPrefix = now.toISOString().slice(0, 7);
  const paidThisMonth = db.payments
    .filter(p => p.status === 'Оплачено' && p.date.startsWith(monthPrefix))
    .reduce((s, p) => s + p.amount, 0);

  const applicationsCount = db.applications.length;

  const kpis = [
    { label: 'Активные дела', value: activeCases, hint: 'в работе / новые / ожидание' },
    { label: 'Общая задолженность', value: fmtMoney(totalDebt), hint: 'по всем делам', cls: totalDebt > 0 ? 'is-bad' : '' },
    { label: 'Оплачено за месяц', value: fmtMoney(paidThisMonth), hint: now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }), cls: 'is-good' },
    { label: 'Заявлений подано', value: applicationsCount, hint: 'за всё время' },
  ];

  document.getElementById('kpiGrid').innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-card__label">${k.label}</div>
      <div class="kpi-card__value ${k.cls || ''}">${k.value}</div>
      <div class="kpi-card__hint">${k.hint}</div>
    </div>
  `).join('');

  /* ---- последние дела ---- */
  const recent = [...db.cases].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const recentBody = document.getElementById('recentCasesBody');
  if (!recent.length) {
    recentBody.innerHTML = `<tr><td colspan="4" class="tbl-empty">Дел пока нет</td></tr>`;
  } else {
    recentBody.innerHTML = recent.map(c => {
      const row = caseRow(db, c);
      return `
        <tr class="is-clickable" onclick="location.href='case.html?id=${c.id}'">
          <td>${row.client ? row.client.fio : '—'}</td>
          <td class="num">${c.investigationNumber || c.courtNumber || '—'}</td>
          <td>${statusSeal(c.status, { small: true })}</td>
          <td class="num ${row.debt > 0 ? 'is-debt' : ''}">${fmtMoney(row.debt)}</td>
        </tr>`;
    }).join('');
  }

  /* ---- долг по органам ---- */
  const byBody = debtsByBody(db);
  document.getElementById('debtByBodyBody').innerHTML = byBody.map(r => `
    <tr>
      <td>${r.body}</td>
      <td class="num">${fmtMoney(r.accrued)}</td>
      <td class="num is-paid">${fmtMoney(r.paid)}</td>
      <td class="num ${r.debt > 0 ? 'is-debt' : ''}">${fmtMoney(r.debt)}</td>
    </tr>`).join('');

  /* ---- долг по клиентам ---- */
  const byClient = debtsByClient(db).sort((a, b) => b.debt - a.debt);
  const clientBody = document.getElementById('debtByClientBody');
  if (!byClient.length) {
    clientBody.innerHTML = `<tr><td colspan="4" class="tbl-empty">Нет данных по задолженности</td></tr>`;
  } else {
    clientBody.innerHTML = byClient.map(r => `
      <tr>
        <td>${r.client.fio}</td>
        <td class="num">${fmtMoney(r.accrued)}</td>
        <td class="num is-paid">${fmtMoney(r.paid)}</td>
        <td class="num ${r.debt > 0 ? 'is-debt' : ''}">${fmtMoney(r.debt)}</td>
      </tr>`).join('');
  }
})();
