/* ============================================================
   SETTINGS.JS — тарифы, реквизиты, шаблон заявления
   ============================================================ */

(function () {
  let db = loadDB();

  function renderTariffs() {
    const list = [...db.tariffs].sort((a, b) => b.startDate.localeCompare(a.startDate) || a.type.localeCompare(b.type));
    const body = document.getElementById('tariffsBody');
    body.innerHTML = list.length ? list.map(t => `
      <tr>
        <td class="num">${fmtDate(t.startDate)}</td>
        <td>${t.type}</td>
        <td class="num">${fmtMoney(t.amount)}</td>
        <td><button class="btn btn-sm btn-ghost btn-danger" data-del-tariff="${t.id}">Удалить</button></td>
      </tr>
    `).join('') : `<tr><td colspan="4" class="tbl-empty">Тарифы не заданы</td></tr>`;
    body.querySelectorAll('[data-del-tariff]').forEach(btn => {
      btn.addEventListener('click', () => {
        db.tariffs = db.tariffs.filter(t => t.id !== btn.dataset.delTariff);
        saveDB(db); renderTariffs(); toast('Тариф удалён');
      });
    });
  }

  document.getElementById('addTariffBtn').addEventListener('click', () => {
    openModal(`
      <h3>Новый тариф</h3>
      <div class="field"><label>Действует с</label><input type="date" id="m_start" value="${new Date().toISOString().slice(0,10)}"></div>
      <div class="field"><label>Тип участия</label><select id="m_type">${PARTICIPATION_TYPES.map(t => `<option>${t}</option>`).join('')}</select></div>
      <div class="field"><label>Сумма</label><input type="number" id="m_amount" step="1" value="10000"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Отмена</button>
        <button class="btn btn-primary" id="m_save">Добавить</button>
      </div>
    `);
    document.getElementById('m_save').addEventListener('click', () => {
      db.tariffs.push({
        id: uid('t'),
        startDate: document.getElementById('m_start').value,
        type: document.getElementById('m_type').value,
        amount: parseFloat(document.getElementById('m_amount').value) || 0,
      });
      saveDB(db); closeModal(); renderTariffs(); toast('Тариф добавлен');
    });
  });

  /* реквизиты */
  function fillRequisites() {
    const r = db.settings.requisites;
    document.getElementById('r_org').value = r.orgName;
    document.getElementById('r_inn').value = r.inn;
    document.getElementById('r_account').value = r.account;
    document.getElementById('r_bank').value = r.bank;
    document.getElementById('r_address').value = r.address;
  }
  document.getElementById('saveRequisitesBtn').addEventListener('click', () => {
    db.settings.requisites = {
      orgName: document.getElementById('r_org').value.trim(),
      inn: document.getElementById('r_inn').value.trim(),
      account: document.getElementById('r_account').value.trim(),
      bank: document.getElementById('r_bank').value.trim(),
      address: document.getElementById('r_address').value.trim(),
    };
    saveDB(db); toast('Реквизиты сохранены');
  });

  /* шаблон заявления */
  function fillTemplate() {
    document.getElementById('r_template').value = db.settings.applicationTemplate;
  }
  document.getElementById('saveTemplateBtn').addEventListener('click', () => {
    db.settings.applicationTemplate = document.getElementById('r_template').value;
    saveDB(db); toast('Шаблон сохранён');
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    openModal(`
      <h3>Сбросить демо-данные?</h3>
      <p class="muted" style="font-size:13.5px;">Все изменения, внесённые в этом браузере, будут удалены и заменены исходным набором демо-данных.</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Отмена</button>
        <button class="btn btn-danger" id="confirmReset">Сбросить</button>
      </div>
    `);
    document.getElementById('confirmReset').addEventListener('click', () => {
      db = resetDB();
      closeModal();
      renderTariffs(); fillRequisites(); fillTemplate();
      toast('Демо-данные сброшены');
    });
  });

  renderTariffs();
  fillRequisites();
  fillTemplate();
})();
