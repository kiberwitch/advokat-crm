/* ============================================================
   APP.JS — общие функции UI: навигация, модалки, тосты, шапка
   ============================================================ */

function initChrome() {
  highlightActiveNav();
  bindSidebarToggle();
  injectStatusStyles();
}

function highlightActiveNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('is-active', a.dataset.page === page);
  });
}

function bindSidebarToggle() {
  const btn = document.querySelector('.js-burger');
  const sidebar = document.querySelector('.sidebar');
  if (!btn || !sidebar) return;
  btn.addEventListener('click', () => sidebar.classList.toggle('is-open'));
}

/* единоразово создаём CSS-классы статусов из STATUS_META, чтобы не дублировать цвета в HTML */
function injectStatusStyles() {
  if (document.getElementById('status-style-injected')) return;
  const style = document.createElement('style');
  style.id = 'status-style-injected';
  let css = '';
  Object.entries(STATUS_META).forEach(([name, m]) => {
    const slug = statusSlug(name);
    css += `.seal--${slug}{--seal-color:${m.color};--seal-bg:${m.bg};--seal-text:${m.text};}\n`;
  });
  style.textContent = css;
  document.head.appendChild(style);
}

function statusSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

/* "Печать"-бейдж статуса — фирменный элемент интерфейса */
function statusSeal(name, opts) {
  opts = opts || {};
  const slug = statusSlug(name);
  const size = opts.small ? ' seal--sm' : '';
  return `<span class="seal seal--${slug}${size}"><span class="seal__ring"></span><span class="seal__label">${name}</span></span>`;
}

/* ---------- modal ---------- */
function openModal(html) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'activeModal';
  overlay.innerHTML = `<div class="modal-card">${html}</div>`;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
  document.addEventListener('keydown', escCloseModal);
}

function escCloseModal(e) {
  if (e.key === 'Escape') closeModal();
}

function closeModal() {
  const m = document.getElementById('activeModal');
  if (m) m.remove();
  document.removeEventListener('keydown', escCloseModal);
}

/* ---------- toast ---------- */
function toast(message) {
  let host = document.getElementById('toastHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toastHost';
    host.className = 'toast-host';
    document.body.appendChild(host);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  host.appendChild(t);
  setTimeout(() => t.classList.add('is-leaving'), 2200);
  setTimeout(() => t.remove(), 2600);
}

/* ---------- mock-скачивание файла ---------- */
function mockDownload(filename, content) {
  const blob = new Blob([content || `Мок-файл: ${filename}\nСформирован CRM (демо-данные).`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.addEventListener('DOMContentLoaded', initChrome);
