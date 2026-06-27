/* ============================================================
   DEBTS.JS — задолженность: фильтры по органу/клиенту, итоги
   ============================================================ */

(function () {
  const db = loadDB();

  const bodyFilter = document.getElementById('bodyFilter');
  const clientFilter = document.getElementById('clientFilter');

  BODIES.forEach(b => {
    const o = document.createElement('option'); o.value = b; o.textContent = b;
    bodyFilter.appendChild(o);
  });
  db.clients.forEach(c => {
    const o = document.createElement('option'); o.value = c.id; o.textContent = c.fio;
    clientFilter.appendChild(o);
  });

  const allRows = debtsDetailed(db);
  const overallDebt = db.cases.reduce((s, c) => s + caseDebt(db, c.id), 0);
  document.getElementById('totalDebtLabel').textContent = `Общий долг: ${fmtMoney(overallDebt)}`;

  function render() {
    const bd = bodyFilter.value;
    const cl = clientFilter.value;
    let rows = allRows;
    if (bd) rows = rows.filter(r => r.body === bd);
    if (cl) rows = rows.filter(r => r.client && r.client.id === cl);
    rows = [...rows].sort((a, b) => b.debt - a.debt);

    document.getElementById('rowCount').textContent = `${rows.length} запис${rows.length === 1 ? 'ь' : (rows.length>=2&&rows.length<=4?'и':'ей')}`;

    const body = document.getElementById('debtsBody');
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="6" class="tbl-empty">Нет записей по заданным условиям</td></tr>`;
    } else {
      body.innerHTML = rows.map(r => `
        <tr class="is-clickable" onclick="location.href='case.html?id=${r.caseId}'">
          <td>${r.body}</td>
          <td>${r.client ? r.client.fio : '—'}</td>
          <td class="num">${r.case.investigationNumber || r.case.courtNumber || '—'}</td>
          <td class="num">${fmtMoney(r.accrued)}</td>
          <td class="num is-paid">${fmtMoney(r.paid)}</td>
          <td class="num ${r.debt > 0 ? 'is-debt' : ''}">${fmtMoney(r.debt)}</td>
        </tr>`).join('');
    }

    const total = rows.reduce((s, r) => s + r.debt, 0);
    document.getElementById('grandTotal').textContent = fmtMoney(total);
  }

  bodyFilter.addEventListener('change', render);
  clientFilter.addEventListener('change', render);
  render();
})();
