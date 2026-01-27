/* ========================================
   PRODUK.JS
   Tabel produk & file picker
======================================== */

let renameTargetId = null;

// render ulang tabel produk
function renderTableProduk() {
  if (!window.tableBody) return;

  window.tableBody.innerHTML = '';

  window.products.forEach((p, idx) => {
    const tr = document.createElement('tr');
    tr.dataset.id = p.id;

    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${p.name || ''}</td>
      <td>${p.price || ''}</td>
      <td>${p.category || ''}</td>
      <td>
        ${p.img ? `<img src="${p.img}" width="50">` : ''}
        <button class="btn-upload">📁 Pilih File</button>
      </td>
      <td>
        <button class="btn-delete">🗑️ Hapus</button>
      </td>
    `;

    window.tableBody.appendChild(tr);

    // tombol upload file
    tr.querySelector('.btn-upload').addEventListener('click', () => {
      renameTargetId = p.id;
      window.filePicker.value = '';
      window.filePicker.click();
    });

    // tombol hapus
    tr.querySelector('.btn-delete').addEventListener('click', () => {
      window.products = window.products.filter(x => x.id !== p.id);
      saveLocal();
      renderTableProduk();
    });
  });
}

// file picker listener
window.filePicker?.addEventListener('change', (ev) => {
  if (!renameTargetId) return;
  const file = ev.target.files[0];
  if (!file) return;

  const idx = window.products.findIndex(p => p.id === renameTargetId);
  if (idx === -1) { 
    alert('Produk tidak ditemukan'); 
    renameTargetId = null;
    return; 
  }

  // pakai objectURL untuk preview, bisa diganti upload ke server
  window.products[idx].img = URL.createObjectURL(file);
  saveLocal();
  renderTableProduk();
  renameTargetId = null;
});

// override renderTable global supaya initRender pakai ini
window.renderTable = renderTableProduk;
