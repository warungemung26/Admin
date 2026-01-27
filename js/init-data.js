/* ===========================
   INIT DATA GLOBAL
=========================== */

// Pastikan variabel global ada
if (typeof window.products === 'undefined') {
  window.products = [];
}

if (typeof window.flashProducts === 'undefined') {
  window.flashProducts = [];
}

if (typeof window.filtered === 'undefined') {
  window.filtered = [];
}


/* ===========================
   LOAD PRODUCTS FROM LOCAL
=========================== */

if (!window.products.length) {
  try {
    const stored = JSON.parse(localStorage.getItem('products') || '[]');

    if (Array.isArray(stored)) {
      window.products = stored.map(p => ({
        id: p.id || generateId(),
        ...p
      }));
    }

  } catch (e) {
    console.warn('Gagal load products dari localStorage', e);
  }
}

// set filtered awal
window.filtered = [...window.products];


/* ===========================
   CACHE DOM DASAR
=========================== */

function cacheBaseDom() {
  window.tableBody = document.querySelector('#productTable tbody');
  window.filePicker = document.getElementById('filePicker');
  window.uploadBtn  = document.getElementById('uploadBtn');
  window.jsonOutput = document.getElementById('jsonOutput');
}


/* ===========================
   BIND EVENT
=========================== */

function bindInitEvents() {
  document.getElementById('btnUploadProduk')
    ?.addEventListener('click', uploadJSONSimple);

  document.getElementById('btnUploadFlash')
    ?.addEventListener('click', uploadFlashJSONSimple);

  document.getElementById('btnLoadFlash')
    ?.addEventListener('click', loadFlashFromRepoUnified);

  // tombol flash di atas tabel
  document.getElementById('btnLoadFlashTop')
    ?.addEventListener('click', loadFlashFromRepoUnified);
}


/* ===========================
   INIT RENDER
=========================== */

function initRender() {
  window.products = window.products.map(p => ({
    id: p.id || generateId(),
    ...p
  }));

  saveLocal();
  renderTable();
}


/* ===========================
   DOM READY
=========================== */

document.addEventListener("DOMContentLoaded", () => {
  cacheBaseDom();
  bindInitEvents();
  initRender();
});

/* ===========================
   CONFIG REPO
=========================== */

if (typeof window.owner === 'undefined') {
  window.owner = "WarungEmung26";
}

if (typeof window.repo === 'undefined') {
  window.repo = "WarungEmung";
}

if (typeof window.branch === 'undefined') {
  window.branch = "main";
}
