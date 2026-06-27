/* ============================================================
   COMPLETED.JS — завершённые дела
   ============================================================ */

(function () {
  let db = loadDB();
  const searchInput = document.getElementById('searchInput');

  function render() {
    const q = searchInput.value.trim().toLowerCase();
    let list = db.cases.filter(c => c.status === 'Завершено');
    if (q) {
      list = list.filter(c => {
        const client = getClient(db, c.clientId);
        const hay = [client ? client.fio : '', c.investigationNumber, c.courtNumber].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }
    list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    document.getElementById('resultCount').textContent = `${list.length} завершённых дел`;

    const body = document.getElementById('completedBody');
    if (!list.length) {
      body.innerHTML = `<tr><td colspan="6" class="tbl-empty">Завершённых дел пока нет</td></tr>`;
      return;
    }
    body.innerHTML = list.map(c => {
      const row = caseRow(db, c);
      return `
        <tr>
          <td class="is-clickable" onclick="location.href='case.html?id=${c.id}'">${row.client ? row.client.fio : '—'}</td>
          <td class="num">${c.investigationNumber || c.courtNumber || '—'}</td>
          <td class="num">${fmtMoney(row.accrued)}</td>
          <td class="num is-paid">${fmtMoney(row.paid)}</td>
          <td class="num ${row.debt > 0 ? 'is-debt' : ''}">${fmtMoney(row.debt)}</td>
          <td style="white-space:nowrap;">
            <button class="btn btn-sm btn-ghost" data-open="${c.id}">Открыть</button>
            <button class="btn btn-sm btn-ghost" data-reopen="${c.id}">В работу</button>
            <button class="btn btn-sm btn-brass" data-archive="${c.id}">В архив</button>
          </td>
        </tr>`;
    }).join('');

    body.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', (e) => {
      e.stopPropagation(); location.href = `case.html?id=${btn.dataset.open}`;
    }));
    body.querySelectorAll('[data-reopen]').forEach(btn => btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const c = db.cases.find(x => x.id === btn.dataset.reopen);
      c.status = 'В работе';
      addHistory(db, c.id, 'Статус', 'Дело возобновлено и возвращено в работу.');
      saveDB(db);
      toast('Дело возвращено в работу');
      render();
    }));
    body.querySelectorAll('[data-archive]').forEach(btn => btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const c = db.cases.find(x => x.id === btn.dataset.archive);
      c.status = 'Архив';
      addHistory(db, c.id, 'Статус', 'Завершённое дело перемещено в архив.');
      saveDB(db);
      toast('Дело перемещено в архив');
      render();
    }));
  }

  searchInput.addEventListener('input', render);
  render();
})();
