/* ── URL params ── */
const params  = new URLSearchParams(window.location.search);
const docId   = params.get('id');
const docTitle = params.get('title') ? decodeURIComponent(params.get('title')) : 'Untitled document';

/* ── Storage ── */
const STORAGE_KEY = 'myLetters_docs';
function getDocs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch(e) { return []; }
}
function saveDocs(docs) { localStorage.setItem(STORAGE_KEY, JSON.stringify(docs)); }

function getThisDoc() {
  return getDocs().find(d => String(d.id) === String(docId));
}

/* ── Pages ── */
const BUFFER = 10;
let pages = [], activePage = null, pageCount = 0;

window.addEventListener('DOMContentLoaded', () => {
  // Set title
  const titleInput = document.getElementById('doc-title');
  const saved = getThisDoc();
  titleInput.value = (saved && saved.title) ? saved.title : docTitle;
  document.title = titleInput.value;

  addPage(true);

  // Load saved content
  if (saved && saved.content) {
    pages[0].innerHTML = saved.content;
  }

  document.addEventListener('selectionchange', syncToolbar);
  document.addEventListener('keydown', handleShortcuts);

  // Auto-save every 10s
  setInterval(saveDoc, 10000);
});

function addPage(isFirst = false) {
  pageCount++;
  const container = document.getElementById('page-container');
  const wrapper = document.createElement('div');
  wrapper.className = 'page-wrapper';

  const label = document.createElement('div');
  label.className   = 'page-number';
  label.textContent = 'Page ' + pageCount;

  const doc = document.createElement('div');
  doc.className       = 'document';
  doc.contentEditable = 'true';
  doc.spellcheck      = true;

  if (isFirst && !getThisDoc()?.content) {
    doc.innerHTML = '<p><br></p>';
  } else if (!isFirst) {
    doc.innerHTML = '<p><br></p>';
  }

  doc.addEventListener('focus', () => { activePage = doc; syncToolbar(); });
  doc.addEventListener('input', () => { checkOverflow(doc); syncToolbar(); markUnsaved(); });
  doc.addEventListener('keydown', () => setTimeout(() => checkOverflow(doc), 0));

  wrapper.appendChild(label);
  wrapper.appendChild(doc);
  container.appendChild(wrapper);
  pages.push(doc);
  activePage = doc;
  updateCounter();
  return doc;
}

function checkOverflow(pg) {
  const idx = pages.indexOf(pg);
  if (idx === -1) return;
  while (pg.scrollHeight > pg.clientHeight + BUFFER) {
    const last = pg.lastElementChild;
    if (!last || pg.children.length <= 1) break;
    const next = pages[idx + 1] || addPage();
    const sel  = window.getSelection();
    const inLast = sel && sel.rangeCount && last.contains(sel.getRangeAt(0).startContainer);
    next.insertBefore(last, next.firstChild);
    if (inLast) { placeCaretAt(next, 'start'); next.focus(); }
    checkOverflow(next);
  }
  updateCounter();
}

/* ── Save ── */
let saveTimeout = null;
function markUnsaved() {
  document.getElementById('autosave-note').textContent = 'Saving…';
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveDoc, 2000);
}

function saveDoc() {
  const title   = document.getElementById('doc-title').value.trim() || 'Untitled document';
  const content = pages.map(p => p.innerHTML).join('');
  const preview = pages[0] ? pages[0].innerText.slice(0, 200) : '';

  const docs = getDocs();
  const idx  = docs.findIndex(d => String(d.id) === String(docId));
  if (idx !== -1) {
    docs[idx].title   = title;
    docs[idx].content = content;
    docs[idx].preview = preview;
  }
  saveDocs(docs);
  document.title = title;
  document.getElementById('autosave-note').textContent = 'All changes saved';
}

function showSaved() {
  document.getElementById('autosave-note').textContent = '✓ Saved!';
  setTimeout(() => document.getElementById('autosave-note').textContent = 'All changes saved', 1500);
}

/* ── Toolbar ── */
function execCmd(cmd, val = null) {
  focusActive();
  document.execCommand(cmd, false, val);
  syncToolbar();
}
function toggleFmt(cmd) { execCmd(cmd); }
const alignMap = { justifyLeft:'left', justifyCenter:'center', justifyRight:'right', justifyFull:'full' };
function doAlign(cmd) {
  execCmd(cmd);
  Object.keys(alignMap).forEach(a => {
    const b = document.getElementById('btn-' + alignMap[a]);
    if (b) b.classList.remove('active');
  });
  const b = document.getElementById('btn-' + alignMap[cmd]);
  if (b) b.classList.add('active');
}
function applyFontSize(val) {
  const size = parseFloat(val);
  if (!size) return;
  focusActive();
  const sel = window.getSelection();
  if (sel && sel.rangeCount && !sel.isCollapsed) {
    try {
      const span = document.createElement('span');
      span.style.fontSize = size + 'pt';
      sel.getRangeAt(0).surroundContents(span);
    } catch(e) { fallbackSize(size); }
  } else { fallbackSize(size); }
  syncToolbar();
}
function fallbackSize(size) {
  document.execCommand('fontSize', false, '7');
  document.querySelectorAll('font[size="7"]').forEach(f => {
    f.removeAttribute('size');
    f.style.fontSize = size + 'pt';
  });
}
function changeFontSize(d) {
  const inp = document.getElementById('fontSize');
  let v = parseFloat(inp.value) || 12;
  v = Math.max(1, Math.min(200, v + d));
  inp.value = v;
  applyFontSize(v);
}
function syncToolbar() {
  ['bold','italic','underline'].forEach(cmd => {
    const btn = document.getElementById('btn-' + cmd);
    if (btn) btn.classList.toggle('active', document.queryCommandState(cmd));
  });
  const st = document.getElementById('btn-strike');
  if (st) st.classList.toggle('active', document.queryCommandState('strikeThrough'));
}
function handleShortcuts(e) {
  if (!e.ctrlKey && !e.metaKey) return;
  const map = { b:'bold', i:'italic', u:'underline', z:'undo', y:'redo', s:'save' };
  const cmd = map[e.key.toLowerCase()];
  if (!cmd) return;
  e.preventDefault();
  if (cmd === 'save') { saveDoc(); showSaved(); }
  else execCmd(cmd);
}
function focusActive() {
  const pg = activePage || pages[0];
  if (pg) { pg.focus(); activePage = pg; }
}
function placeCaretAt(el, pos) {
  el.focus();
  const r = document.createRange();
  if (pos === 'start') { r.setStart(el, 0); r.collapse(true); }
  const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
}
function updateCounter() {
  document.getElementById('page-counter').textContent =
    pageCount === 1 ? 'Page 1' : pageCount + ' pages';
}