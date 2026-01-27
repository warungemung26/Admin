/* ===========================
   MODAL HAPUS SEMUA PRODUK
=========================== */

// buka modal
function openConfirmDeleteAll() {
  const modal = document.getElementById("confirmModal");
  if (modal) modal.style.display = "flex";
}

// tutup modal
function closeConfirmDeleteAll() {
  const modal = document.getElementById("confirmModal");
  if (modal) modal.style.display = "none";
}

// hapus semua produk
function deleteAllProducts() {
  if (typeof products === "undefined") {
    alert("ERROR: Array 'products' tidak ditemukan!");
    return;
  }

  products.length = 0;

  if (typeof renderTable === "function") renderTable();
  if (typeof generateJSON === "function") generateJSON();

  closeConfirmDeleteAll();

  if (typeof showToast === "function") {
    showToast("Semua produk berhasil dihapus!");
  } else {
    alert("Semua produk berhasil dihapus!");
  }
}

// ===== FUNSI TOAST =====
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.pointerEvents = 'auto';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.pointerEvents = 'none';
  }, 3000); // tampil 3 detik
}


// ========== TOMBOL HAPUS SEMUA ==========
const deleteAllBtn = document.getElementById('deleteAllBtn');
if (deleteAllBtn) {
  deleteAllBtn.addEventListener('click', () => {
    if (!products.length) return showToast('Daftar produk kosong');

    if (confirm('⚠️ Hapus semua produk? Tindakan ini tidak dapat dibatalkan.')) {
      products = [];
      saveLocal();
      renderTable();        // <-- PENTING
      renderProductCards();
      showToast('✅ Semua produk dihapus');
    }
  });
}


// ========== FIX ENTER AGAR TIDAK BREAK LINE ==========
document.addEventListener('keydown', ev => {
  if (ev.key === 'Enter' && ev.target?.classList.contains('editable')) {
    ev.preventDefault();
    ev.target.blur();
  }
});



