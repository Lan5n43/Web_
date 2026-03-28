/* ── Flowers ── */
const fc = document.getElementById('flower-container');
function spawnFlower() {
  const f = document.createElement('div');
  f.className = 'flower';
  const size = 80 + Math.random() * 60;
  f.style.left   = Math.random() * window.innerWidth + 'px';
  f.style.width  = size + 'px';
  f.style.height = size + 'px';
  const dur = 5 + Math.random() * 5;
  f.style.animationDuration = dur + 's';
  fc.appendChild(f);
  setTimeout(() => f.remove(), dur * 1000);
}
setInterval(spawnFlower, 700);

/* ── Saved docs (localStorage) ── */
const STORAGE_KEY = 'myLetters_docs';

function getDocs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch(e) { return []; }
}
function saveDocs(docs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

function renderDocGrid() {
  const grid = document.getElementById('doc-grid');
  const docs  = getDocs();

  if (docs.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="big">📄</div>
        No documents yet — create one above!
      </div>`;
    return;
  }

  grid.innerHTML = '';
  docs.forEach((doc, i) => {
    const card = document.createElement('div');
    card.className = 'doc-card';
    card.innerHTML = `
      <div class="doc-preview-thumb">${doc.preview || 'Empty document'}</div>
      <div class="doc-card-footer">
        <div class="doc-icon">📄</div>
        <div class="doc-meta">
          <div class="doc-title">${esc(doc.title)}</div>
          <div class="doc-date">${doc.date || ''}</div>
        </div>
      </div>`;
    card.onclick = () => openSavedDoc(i);
    grid.appendChild(card);
  });
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

/* ── New doc modal ── */
function openNewDocModal() {
  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(() => document.getElementById('doc-name-input').focus(), 80);
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('doc-name-input').value = '';
}
function closeModalOnOverlay(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function createNewDoc() {
  const nameInput = document.getElementById('doc-name-input');
  const title = nameInput.value.trim() || 'Untitled document';

  const docs  = getDocs();
  const newId = Date.now();
  const now   = new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });

  docs.unshift({
    id:      newId,
    title:   title,
    content: '',
    preview: '',
    date:    'Created ' + now
  });
  saveDocs(docs);

  // Open the editor page for this new doc
  window.location.href = `doc_editor.html?id=${newId}&title=${encodeURIComponent(title)}`;
}

function openSavedDoc(idx) {
  const docs = getDocs();
  const doc  = docs[idx];
  if (!doc) return;
  window.location.href = `doc_editor.html?id=${doc.id}&title=${encodeURIComponent(doc.title)}`;
}

/* ── Init ── */
renderDocGrid();