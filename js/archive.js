/* ============================================================
   ARCHIVE.JS — архив завершённых дел
   ============================================================ */

(function () {
  let db = loadDB();
  const searchInput = document.getElementById('searchInput');

  function render() {
    const q = searchInput.value.trim().toLowerCase();
    let list = db.cases.filter(c => c.status === 'Архив');
    if (q) {
      list = list.filter(c => {
        const client = getClient(db, c.clientId);
        const hay = [client ? client.fio : '', c.investigationNumber, c.courtNumber].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }
    list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    document.getElementById('resultCount').textContent = `${list.length} дел в архиве`;

    const body = document.getElementById('archiveBody');
    if (!list.length) {
      body.innerHTML = `<tr><td colspan="6" class="tbl-empty">Архив пуст</td></tr>`;
      return;
    }
    body.innerHTML = list.map(c => {
      const row = caseRow(db, c);
      return `
        <tr>
          <td class="is-clickable" onclick="location.href='case.html?id=${c.id}'">${row.client ? row.client.fio : '—'}</td>
          <td class="num">${c.investigationNumber || c.courtNumber || '—'}</td>
          <td class="num">${fmtDate(c.createdAt)}</td>
          <td class="num">${fmtMoney(row.accrued)}</td>
          <td class="num ${row.debt > 0 ? 'is-debt' : ''}">${fmtMoney(row.debt)}</td>
          <td style="white-space:nowrap;">
            <button class="btn btn-sm btn-ghost" data-open="${c.id}">Открыть</button>
            <button class="btn btn-sm btn-brass" data-restore="${c.id}">В работу</button>
          </td>
        </tr>`;
    }).join('');

    body.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', (e) => {
      e.stopPropagation(); location.href = `case.html?id=${btn.dataset.open}`;
    }));
    body.querySelectorAll('[data-restore]').forEach(btn => btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const c = db.cases.find(x => x.id === btn.dataset.restore);
      c.status = 'В работе';
      addHistory(db, c.id, 'Статус', 'Дело возвращено из архива в работу.');
      saveDB(db);
      toast('Дело возвращено в работу');
      render();
    }));
  }

  searchInput.addEventListener('input', render);
  render();
})();
