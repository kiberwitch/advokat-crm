/* ============================================================
   CASE.JS — карточка дела
   ============================================================ */

(function () {
  let db = loadDB();
  const params = new URLSearchParams(location.search);
  const caseId = params.get('id');
  const kase = db.cases.find(c => c.id === caseId);

  if (!kase) {
    document.getElementById('caseContent').innerHTML = `<div class="empty-state">Дело не найдено. <a class="pill-link" href="cases.html">Вернуться в реестр</a></div>`;
    document.getElementById('caseTitle').textContent = 'Дело не найдено';
    return;
  }

  function persist() { saveDB(db); }

  function renderAll() {
    /* контекст навигации зависит от текущего статуса дела */
    const pageMap = { 'Архив': 'archive', 'Завершено': 'completed' };
    document.body.dataset.page = pageMap[kase.status] || 'active';
    highlightActiveNav();
    const crumbMap = {
      'archive':  { href: 'archive.html',   label: 'Архив' },
      'completed':{ href: 'completed.html', label: 'Завершённые дела' },
      'active':   { href: 'cases.html',     label: 'Активные дела' },
    };
    const crumb = crumbMap[document.body.dataset.page];
    const crumbLink = document.getElementById('breadcrumbLink');
    crumbLink.href = crumb.href;
    crumbLink.textContent = crumb.label;

    const client = getClient(db, kase.clientId);
    document.getElementById('caseTitle').textContent = client ? client.fio : 'Без имени';
    document.getElementById('caseStatusHead').innerHTML = statusSeal(kase.status);

    /* основная информация */
    document.getElementById('infoBlock').innerHTML = `
      <div><span>ФИО</span><span>${client ? client.fio : '—'}</span></div>
      <div><span>Телефон</span><span>${client && client.phone ? client.phone : '—'}</span></div>
      <div><span>Комментарий</span><span style="text-align:left;max-width:60%;font-weight:500;">${kase.comment || '—'}</span></div>
      <div><span>Дата создания</span><span>${fmtDate(kase.createdAt)}</span></div>
    `;

    /* номера дела */
    document.getElementById('numbersBlock').innerHTML = `
      <div><span>Следственный №</span><span>${kase.investigationNumber || '—'}</span></div>
      <div><span>Судебный №</span><span>${kase.courtNumber || '—'}</span></div>
      <div><span>Апелляционный №</span><span>${kase.appealNumber || '—'}</span></div>
    `;

    /* статус */
    document.getElementById('statusSwitch').innerHTML = STATUS_ORDER.map(s => `
      <button data-status="${s}" class="${s === kase.status ? 'is-current' : ''}">
        ${statusSeal(s, { small: true })}
      </button>
    `).join('');
    document.querySelectorAll('#statusSwitch button').forEach(btn => {
      btn.addEventListener('click', () => {
        const newStatus = btn.dataset.status;
        if (newStatus === kase.status) return;
        const old = kase.status;
        kase.status = newStatus;
        addHistory(db, kase.id, 'Статус', `Статус изменён: «${old}» → «${newStatus}».`);
        persist();
        renderAll();
        toast('Статус обновлён');
      });
    });

    /* участия */
    const parts = getCaseParticipations(db, kase.id);
    const pBody = document.getElementById('participationsBody');
    pBody.innerHTML = parts.length ? parts.map(p => `
      <tr>
        <td class="num">${fmtDate(p.date)}</td>
        <td>${p.type}</td>
        <td>${p.complexity}</td>
        <td>${p.body}</td>
        <td class="num">${COMPLEXITY_MULT[p.complexity]}×</td>
        <td class="num">${fmtMoney(p.amount)}</td>
        <td><button class="btn btn-sm btn-ghost btn-danger" data-del-part="${p.id}">Удалить</button></td>
      </tr>
    `).join('') : `<tr><td colspan="7" class="tbl-empty">Участий пока не добавлено</td></tr>`;
    pBody.querySelectorAll('[data-del-part]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.delPart;
        db.participations = db.participations.filter(p => p.id !== id);
        addHistory(db, kase.id, 'Участие', 'Запись об участии удалена.');
        persist(); renderAll(); toast('Участие удалено');
      });
    });

    /* финансы */
    const accrued = caseAccrued(db, kase.id);
    const paid = casePaid(db, kase.id);
    const debt = accrued - paid;
    document.getElementById('finAccrued').textContent = fmtMoney(accrued);
    document.getElementById('finPaid').textContent = fmtMoney(paid);
    document.getElementById('finDebt').textContent = fmtMoney(debt);
    document.getElementById('finDebt').classList.toggle('is-bad', debt > 0);

    const payments = getCasePayments(db, kase.id);
    document.getElementById('paymentsBody').innerHTML = payments.length ? payments.map(p => `
      <tr>
        <td class="num">${fmtDate(p.date)}</td>
        <td>${p.body}</td>
        <td class="num ${p.status === 'Оплачено' ? 'is-paid' : ''}">${fmtMoney(p.amount)}</td>
        <td>${statusPill(p.status)}</td>
      </tr>
    `).join('') : `<tr><td colspan="4" class="tbl-empty">Оплат пока нет</td></tr>`;

    /* заявления */
    const apps = getCaseApplications(db, kase.id);
    document.getElementById('applicationsBody').innerHTML = apps.length ? apps.map(a => `
      <tr>
        <td class="num">${a.number}</td>
        <td class="num">${fmtDate(a.date)}</td>
        <td class="num">${fmtMoney(a.amount)}</td>
        <td>${statusPill(a.status)}</td>
        <td>
          <button class="btn btn-sm btn-ghost" data-dl="${a.id}|docx">DOCX</button>
          <button class="btn btn-sm btn-ghost" data-dl="${a.id}|pdf">PDF</button>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="5" class="tbl-empty">Заявлений пока нет</td></tr>`;
    document.querySelectorAll('[data-dl]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [appId, ext] = btn.dataset.dl.split('|');
        const app = db.applications.find(a => a.id === appId);
        const client = getClient(db, kase.clientId);
        const content = renderApplicationText(db, kase, client, app);
        mockDownload(`Заявление_${app.number}.${ext}`, content);
        toast(`Файл «${ext.toUpperCase()}» сформирован (демо)`);
      });
    });

    /* файлы */
    const files = getCaseFiles(db, kase.id);
    const filesBlock = document.getElementById('filesBlock');
    filesBlock.innerHTML = files.length ? files.map(f => `
      <div class="file-row">
        <div class="file-row__name"><span class="file-row__icon">${(f.name.split('.').pop() || '?').slice(0,3).toUpperCase()}</span>${f.name}<span class="muted" style="font-size:11.5px;">${f.size || ''}</span></div>
        <button class="btn btn-sm btn-ghost btn-danger" data-del-file="${f.id}">×</button>
      </div>
    `).join('') : `<div class="empty-state">Файлы пока не загружены</div>`;
    filesBlock.querySelectorAll('[data-del-file]').forEach(btn => {
      btn.addEventListener('click', () => {
        db.files = db.files.filter(f => f.id !== btn.dataset.delFile);
        persist(); renderAll(); toast('Файл удалён');
      });
    });

    /* история */
    const hist = getCaseHistory(db, kase.id);
    document.getElementById('historyBlock').innerHTML = hist.length ? hist.map(h => `
      <div class="history-item">
        <div class="history-item__date">${fmtDate(h.date)}</div>
        <div><span class="history-item__type">${h.type}</span>${h.text}</div>
      </div>
    `).join('') : `<div class="empty-state">История пуста</div>`;
  }

  function statusPill(s) {
    const palette = {
      'Оплачено': STATUS_META['Завершено'], 'Ожидание': STATUS_META['Ожидание оплаты'], 'Частично': STATUS_META['Есть задолженность'],
      'Черновик': STATUS_META['Новое'], 'Отправлено': STATUS_META['В работе'], 'Удовлетворено': STATUS_META['Завершено'], 'Отклонено': STATUS_META['Есть задолженность'],
    };
    const m = palette[s] || STATUS_META['Новое'];
    return `<span class="seal seal--sm" style="--seal-color:${m.color};--seal-bg:${m.bg};--seal-text:${m.text};"><span class="seal__ring"></span><span class="seal__label">${s}</span></span>`;
  }

  function renderApplicationText(db, kase, client, app) {
    const tpl = db.settings.applicationTemplate;
    const r = db.settings.requisites;
    return tpl
      .replace('[наименование органа]', 'Следственный отдел / Суд')
      .replace('[ФИО адвоката]', r.orgName)
      .replace('[номер дела]', kase.investigationNumber || kase.courtNumber || '—')
      .replace('[ФИО подозреваемого/обвиняемого]', client ? client.fio : '—')
      .replace('[сумма]', app.amount.toLocaleString('ru-RU'))
      .replace('[реквизиты]', `${r.bank}, р/с ${r.account}, ИНН ${r.inn}, ${r.address}`)
      .replace('[дата]', fmtDate(app.date));
  }

  /* ---- редактирование основной информации ---- */
  document.getElementById('editInfoBtn').addEventListener('click', () => {
    const client = getClient(db, kase.clientId);
    openModal(`
      <h3>Основная информация</h3>
      <div class="field"><label>ФИО</label><input id="m_fio" value="${client ? client.fio : ''}"></div>
      <div class="field"><label>Телефон</label><input id="m_phone" value="${client && client.phone ? client.phone : ''}"></div>
      <div class="field"><label>Комментарий</label><textarea id="m_comment" style="font-family:inherit;min-height:70px;">${kase.comment || ''}</textarea></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Отмена</button>
        <button class="btn btn-primary" id="m_save">Сохранить</button>
      </div>
    `);
    document.getElementById('m_save').addEventListener('click', () => {
      if (client) {
        client.fio = document.getElementById('m_fio').value.trim() || client.fio;
        client.phone = document.getElementById('m_phone').value.trim();
      }
      kase.comment = document.getElementById('m_comment').value.trim();
      persist(); closeModal(); renderAll(); toast('Информация обновлена');
    });
  });

  /* ---- редактирование номеров ---- */
  document.getElementById('editNumbersBtn').addEventListener('click', () => {
    openModal(`
      <h3>Номера дела</h3>
      <div class="field"><label>Следственный №</label><input id="m_inv" value="${kase.investigationNumber || ''}"></div>
      <div class="field"><label>Судебный №</label><input id="m_court" value="${kase.courtNumber || ''}"></div>
      <div class="field"><label>Апелляционный №</label><input id="m_app" value="${kase.appealNumber || ''}"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Отмена</button>
        <button class="btn btn-primary" id="m_save_num">Сохранить</button>
      </div>
    `);
    document.getElementById('m_save_num').addEventListener('click', () => {
      kase.investigationNumber = document.getElementById('m_inv').value.trim();
      kase.courtNumber = document.getElementById('m_court').value.trim();
      kase.appealNumber = document.getElementById('m_app').value.trim();
      persist(); closeModal(); renderAll(); toast('Номера обновлены');
    });
  });

  /* ---- добавить участие ---- */
  document.getElementById('addParticipationBtn').addEventListener('click', () => {
    openModal(`
      <h3>Добавить участие</h3>
      <div class="field-row">
        <div class="field"><label>Дата</label><input type="date" id="m_date" value="${new Date().toISOString().slice(0,10)}"></div>
        <div class="field"><label>Орган</label>
          <select id="m_body">${BODIES.map(b => `<option>${b}</option>`).join('')}</select>
        </div>
      </div>
      <div class="field"><label>Тип участия</label>
        <select id="m_type">${PARTICIPATION_TYPES.map(t => `<option>${t}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Сложность</label>
        <select id="m_complexity">${Object.keys(COMPLEXITY_MULT).map(c => `<option>${c}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Сумма (рассчитывается автоматически, можно изменить)</label><input type="number" id="m_amount" step="1"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Отмена</button>
        <button class="btn btn-primary" id="m_save_part">Добавить</button>
      </div>
    `);
    const dateEl = document.getElementById('m_date');
    const typeEl = document.getElementById('m_type');
    const complexityEl = document.getElementById('m_complexity');
    const amountEl = document.getElementById('m_amount');

    function recalc() {
      const base = tariffFor(db, typeEl.value, dateEl.value);
      const mult = COMPLEXITY_MULT[complexityEl.value];
      amountEl.value = Math.round(base * mult);
    }
    [dateEl, typeEl, complexityEl].forEach(el => el.addEventListener('change', recalc));
    recalc();

    document.getElementById('m_save_part').addEventListener('click', () => {
      const amount = parseFloat(amountEl.value) || 0;
      const id = uid('p');
      db.participations.push({
        id, caseId: kase.id, date: dateEl.value, type: typeEl.value,
        complexity: complexityEl.value, body: document.getElementById('m_body').value, amount,
      });
      addHistory(db, kase.id, 'Участие', `Добавлено участие: ${typeEl.value} (${document.getElementById('m_body').value}), ${fmtMoney(amount)}.`);
      persist(); closeModal(); renderAll(); toast('Участие добавлено');
    });
  });

  /* ---- добавить оплату ---- */
  document.getElementById('addPaymentBtn').addEventListener('click', () => {
    openModal(`
      <h3>Добавить оплату</h3>
      <div class="field-row">
        <div class="field"><label>Дата</label><input type="date" id="m_pdate" value="${new Date().toISOString().slice(0,10)}"></div>
        <div class="field"><label>Орган</label><select id="m_pbody">${BODIES.map(b => `<option>${b}</option>`).join('')}</select></div>
      </div>
      <div class="field"><label>Сумма</label><input type="number" id="m_pamount" step="1" value="0"></div>
      <div class="field"><label>Статус</label>
        <select id="m_pstatus"><option>Оплачено</option><option>Ожидание</option><option>Частично</option></select>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Отмена</button>
        <button class="btn btn-primary" id="m_save_pay">Сохранить</button>
      </div>
    `);
    document.getElementById('m_save_pay').addEventListener('click', () => {
      const amount = parseFloat(document.getElementById('m_pamount').value) || 0;
      const status = document.getElementById('m_pstatus').value;
      db.payments.push({ id: uid('pay'), caseId: kase.id, body: document.getElementById('m_pbody').value, amount, date: document.getElementById('m_pdate').value, status });
      addHistory(db, kase.id, 'Оплата', `Зафиксирована оплата (${status}) на сумму ${fmtMoney(amount)}.`);
      persist(); closeModal(); renderAll(); toast('Оплата добавлена');
    });
  });

  /* ---- сформировать заявление ---- */
  document.getElementById('addApplicationBtn').addEventListener('click', () => {
    const debt = caseDebt(db, kase.id);
    openModal(`
      <h3>Сформировать заявление</h3>
      <div class="field"><label>Дата</label><input type="date" id="m_adate" value="${new Date().toISOString().slice(0,10)}"></div>
      <div class="field"><label>Сумма</label><input type="number" id="m_aamount" step="1" value="${Math.max(debt,0)}"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Отмена</button>
        <button class="btn btn-primary" id="m_save_app">Сформировать</button>
      </div>
    `);
    document.getElementById('m_save_app').addEventListener('click', () => {
      const amount = parseFloat(document.getElementById('m_aamount').value) || 0;
      const date = document.getElementById('m_adate').value;
      const number = `З-${String(db.applications.length + 1).padStart(3, '0')}/${date.slice(0,4).slice(-2)}`;
      const id = uid('a');
      db.applications.push({ id, caseId: kase.id, number, date, amount, status: 'Черновик' });
      addHistory(db, kase.id, 'Заявление', `Сформировано заявление ${number} на сумму ${fmtMoney(amount)}.`);
      persist(); closeModal(); renderAll(); toast('Заявление сформировано');
    });
  });

  /* ---- файлы (UI only) ---- */
  document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    db.files.push({ id: uid('f'), caseId: kase.id, name: file.name, size: Math.round(file.size/1024) + ' КБ', uploadedAt: new Date().toISOString().slice(0,10) });
    addHistory(db, kase.id, 'Файл', `Загружен файл «${file.name}».`);
    persist(); renderAll(); toast('Файл прикреплён к делу');
    e.target.value = '';
  });

  renderAll();
})();
