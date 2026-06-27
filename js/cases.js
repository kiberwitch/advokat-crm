/* ============================================================
   CASES.JS — реестр дел: поиск, фильтры, создание дела
   ============================================================ */

(function () {
  let db = loadDB();

  const statusFilter = document.getElementById('statusFilter');
  const bodyFilter = document.getElementById('bodyFilter');
  const searchInput = document.getElementById('searchInput');

  ACTIVE_STATUSES.forEach(s => {
    const o = document.createElement('option');
    o.value = s; o.textContent = s;
    statusFilter.appendChild(o);
  });
  BODIES.forEach(b => {
    const o = document.createElement('option');
    o.value = b; o.textContent = b;
    bodyFilter.appendChild(o);
  });

  function caseBodies(c) {
    return new Set(getCaseParticipations(db, c.id).map(p => p.body));
  }

  function render() {
    const q = searchInput.value.trim().toLowerCase();
    const st = statusFilter.value;
    const bd = bodyFilter.value;

    let list = db.cases.filter(c => ACTIVE_STATUSES.includes(c.status));
    if (st) list = list.filter(c => c.status === st);
    if (bd) list = list.filter(c => caseBodies(c).has(bd));
    if (q) {
      list = list.filter(c => {
        const client = getClient(db, c.clientId);
        const hay = [
          client ? client.fio : '', c.investigationNumber, c.courtNumber, c.appealNumber
        ].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }
    list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    document.getElementById('resultCount').textContent = `${list.length} дел${plural(list.length)}`;

    const body = document.getElementById('casesBody');
    if (!list.length) {
      body.innerHTML = `<tr><td colspan="8" class="tbl-empty">Ничего не найдено — измените условия поиска или фильтры.</td></tr>`;
      return;
    }
    body.innerHTML = list.map(c => {
      const row = caseRow(db, c);
      return `
        <tr class="is-clickable" onclick="location.href='case.html?id=${c.id}'">
          <td>${row.client ? row.client.fio : '—'}</td>
          <td class="num">${c.investigationNumber || '—'}</td>
          <td class="num">${c.courtNumber || '—'}</td>
          <td class="num">${c.appealNumber || '—'}</td>
          <td>${statusSeal(c.status)}</td>
          <td class="num">${fmtMoney(row.accrued)}</td>
          <td class="num is-paid">${fmtMoney(row.paid)}</td>
          <td class="num ${row.debt > 0 ? 'is-debt' : ''}">${fmtMoney(row.debt)}</td>
        </tr>`;
    }).join('');
  }

  function plural(n) {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'о';
    if ([2,3,4].includes(mod10) && ![12,13,14].includes(mod100)) return 'а';
    return '';
  }

  searchInput.addEventListener('input', render);
  statusFilter.addEventListener('change', render);
  bodyFilter.addEventListener('change', render);

  /* ---- новое дело ---- */
  document.getElementById('newCaseBtn').addEventListener('click', () => {
    openModal(`
      <h3>Новое дело</h3>
      <div class="field">
        <label>ФИО клиента</label>
        <input type="text" id="f_fio" placeholder="Иванов Иван Иванович">
      </div>
      <div class="field">
        <label>Телефон</label>
        <input type="text" id="f_phone" placeholder="+7 900 000-00-00">
      </div>
      <div class="field">
        <label>Следственный номер</label>
        <input type="text" id="f_inv" placeholder="11801-22">
      </div>
      <div class="field">
        <label>Комментарий</label>
        <textarea id="f_comment" style="font-family:inherit;min-height:60px;"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Отмена</button>
        <button class="btn btn-primary" id="saveCaseBtn">Создать дело</button>
      </div>
    `);
    document.getElementById('saveCaseBtn').addEventListener('click', () => {
      const fio = document.getElementById('f_fio').value.trim();
      if (!fio) { toast('Укажите ФИО клиента'); return; }
      const clientId = uid('cl');
      db.clients.push({ id: clientId, fio, phone: document.getElementById('f_phone').value.trim() });
      const caseId = uid('case');
      const today = new Date().toISOString().slice(0, 10);
      db.cases.push({
        id: caseId, clientId,
        investigationNumber: document.getElementById('f_inv').value.trim(),
        courtNumber: '', appealNumber: '',
        status: 'Новое',
        comment: document.getElementById('f_comment').value.trim(),
        createdAt: today,
      });
      addHistory(db, caseId, 'Создание', 'Дело создано и принято в производство.');
      saveDB(db);
      closeModal();
      toast('Дело создано');
      location.href = `case.html?id=${caseId}`;
    });
  });

  render();
})();
