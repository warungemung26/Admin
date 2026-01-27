// ========== FIX: EVENT onCellBlur UNTUK UPDATE DATA TABEL ==========
function onCellBlur(ev) {
  const el = ev.target;
  if (!el) return;

  const id = el.dataset.id;
  const field = el.dataset.field;
  let value = el.textContent.trim();

  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return;

  // Normalisasi harga
  if (field === "price") {
    value = Number(value.replace(/[^0-9]/g, "")) || 0;
  }

  if (field === 'name') {
  products[idx].name = value;
  // 🔒 slug TIDAK DIUBAH
} else {
  products[idx][field] = value;
}

  saveLocal();
  renderTable();
  renderProductCards();
}

