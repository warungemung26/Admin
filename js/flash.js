/* ============================================================
   FLASH SALE — DATA & STORAGE
============================================================ */
let flashProducts = JSON.parse(localStorage.getItem("flashProducts") || "[]");

function saveFlashLocal() {
  localStorage.setItem("flashProducts", JSON.stringify(flashProducts));
}

/* ============================================================
   RENDER TABLE FLASH (UPDATE: TAMBAH KOLOM IMG FILE)
============================================================ */
function renderFlashTable() {
  const tbody = document.querySelector("#flashTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  flashProducts.forEach((p, index) => {
    const fileName = (p.img || '').split('/').pop() || '';

    const tr = document.createElement("tr");
    tr.dataset.id = p.id;

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><span contenteditable="true" class="editable" data-field="name" data-id="${p.id}" onblur="flashCellBlur(event,'name',${index})">${p.name}</span></td>
      <td><span contenteditable="true" class="editable" data-field="price_normal" data-id="${p.id}" onblur="flashCellBlur(event,'price_normal',${index})">${p.price_normal}</span></td>
      <td><span contenteditable="true" class="editable" data-field="price_flash" data-id="${p.id}" onblur="flashCellBlur(event,'price_flash',${index})">${p.price_flash}</span></td>
      <td><span contenteditable="true" class="editable" data-field="stock" data-id="${p.id}" onblur="flashCellBlur(event,'stock',${index})">${p.stock}</span></td>
      <td style="display:flex;align-items:center;gap:6px;">
  <span contenteditable="true" class="editable" data-field="img" data-id="${p.id}" onblur="flashCellBlur(event,'img',${index})">${fileName}</span>
<button class="file-btn" onclick="triggerFilePickerFlash('${p.id}')">📁</button>
</td>
      <td class="label"><span contenteditable="true" class="editable" data-field="label" data-id="${p.id}" onblur="flashCellBlur(event,'label',${index})">${p.label}</span></td>
      <td><span contenteditable="true" class="editable" data-field="flash_until" data-id="${p.id}" onblur="flashCellBlur(event,'flash_until',${index})">${p.flash_until}</span></td>
      <td>
        <button onclick="searchProductImage(${index})">🔍</button>
        <button onclick="deleteFlash(${index})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}


// trigger file picker dari tombol tabel
function triggerFilePicker(productId) {
  renameTargetId = productId;
  filePicker.value = '';
  filePicker.click();
}

filePicker.addEventListener('change', ev => {
  if (!renameTargetId) return;
  const f = ev.target.files[0];
  if (!f) return;

  // cari di flashProducts, bukan products
  const idx = flashProducts.findIndex(x => x.id === renameTargetId);
  if (idx === -1) { 
    alert('Produk tidak ditemukan.'); 
    renameTargetId = null; 
    return; 
  }

  // pakai nama produk dari tabel untuk rename
  const productName = flashProducts[idx].name || 'unknown';
  const extension = f.name.split('.').pop(); // ambil ekstensi asli
  const safeName = sanitizeFileName(productName) + (extension ? '.' + extension : '');

  // ambil path lama jika ada
  const basePath = (flashProducts[idx].img?.lastIndexOf('/') >= 0) 
                   ? flashProducts[idx].img.substring(0, flashProducts[idx].img.lastIndexOf('/') + 1) 
                   : 'images/';

  const renamedFile = new File([f], safeName, { type: f.type });
  const url = URL.createObjectURL(renamedFile);

  // trigger download (opsional, bisa dihapus jika hanya ingin update tabel)
  const a = document.createElement('a'); 
  a.href = url; 
  a.download = safeName; 
  document.body.appendChild(a); 
  a.click(); 
  a.remove();
  URL.revokeObjectURL(url);

  // update tabel
  flashProducts[idx].img = basePath + safeName;
  saveFlashLocal(); 
  renameTargetId = null; 
  renderFlashTable(); // render ulang tabel flash

  alert('✅ File baru tersimpan dengan nama: ' + safeName);
});




/* ============================================================
   EDIT CELL (UPDATE UNTUK KOLOM IMG)
============================================================ */
function flashCellBlur(ev, field, index) {
  let val = ev.target.textContent.trim();

  if (["price_normal", "price_flash", "stock"].includes(field)) {
    val = Number(val.replace(/[^0-9]/g, "")) || 0;
  }

  // Jika edit kolom img, pastikan ada prefix 'images/'
  if (field === "img") {
    // hilangkan 'images/' dulu jika ada, lalu tambahkan lagi
    const fileName = val.replace(/^images[\\/]/, "");
    val = "images/" + fileName;
  }

  flashProducts[index][field] = val;
  saveFlashLocal();

  // Re-render agar tabel tetap tampil nama file saja
  if (field === "img") renderFlashTable();
}


/* ===== FILE PICKER FLASH ===== */
let renameTargetIdFlash = null;

function triggerFilePickerFlash(productId) {
  renameTargetIdFlash = productId;
  const fp = document.getElementById('filePicker'); // pakai input yg sama
  fp.value = '';
  fp.click();
}

// attach handler untuk tabel flash
document.addEventListener("DOMContentLoaded", () => {
  const fp = document.getElementById('filePicker');
  if (!fp) return;

  fp.addEventListener('change', ev => {
    if (!renameTargetIdFlash) return;

    const f = ev.target.files[0];
    if (!f) return;

    const idx = flashProducts.findIndex(x => x.id === renameTargetIdFlash);
    if (idx === -1) {
      alert('Flash product tidak ditemukan.');
      renameTargetIdFlash = null;
      return;
    }

    const productName = flashProducts[idx].name || 'unknown';
    const extension = f.name.split('.').pop();
    const safeName = sanitizeFileName(productName) + (extension ? '.' + extension : '');
    const basePath = (flashProducts[idx].img?.lastIndexOf('/') >= 0)
                     ? flashProducts[idx].img.substring(0, flashProducts[idx].img.lastIndexOf('/') + 1)
                     : 'images/';

    const renamedFile = new File([f], safeName, { type: f.type });
    const url = URL.createObjectURL(renamedFile);

    const a = document.createElement('a');
    a.href = url;
    a.download = safeName;
    a.click();
    URL.revokeObjectURL(url);

    flashProducts[idx].img = basePath + safeName;
    saveFlashLocal();
    renameTargetIdFlash = null;

    renderFlashTable();

    alert('✅ File baru tersimpan (flash): ' + safeName);
  });
});

/* ============================================================
   TAMBAH FLASH PRODUCT (PASTIKAN IMG DIAMBIL)
============================================================ */
function addFlashProduct() {
  const name   = flash_name.value.trim();
  const normal = Number(flash_price_normal.value);
  const flash  = Number(flash_price_flash.value);
  const stock  = Number(flash_stock.value);
  const img    = flash_img.value.trim(); // ← nama file gambar
  const label  = flash_label.value.trim();
  const until  = flash_until.value;

  if (!name || !normal || !flash || !until) {
    alert("⚠ Lengkapi semua field wajib!");
    return;
  }

  flashProducts.push({
    id: "flash-" + Date.now(),
    name,
    price_normal: normal,
    price_flash: flash,
    stock,
    img,           // ← simpan nama file
    label,
    flash_until: until,
    category: "flash"
  });

  saveFlashLocal();
  renderFlashTable();
}


/* ============================================================
   DELETE FLASH ITEM
============================================================ */
function deleteFlash(index) {
  const item = flashProducts[index];
  if (!item) return;

  const yakin = confirm(`Hapus flash sale "${item.name}"?`);
  if (!yakin) return;

  flashProducts.splice(index, 1);
  saveFlashLocal();
  renderFlashTable();
}

// ==============================================
//  MODAL KONFIRMASI HAPUS SEMUA FLASH SALE
// ==============================================
function openConfirmDeleteFlash() {
  const modal = document.getElementById("modalConfirm");
  const message = document.getElementById("modalMessage");
  const confirmBtn = document.getElementById("modalConfirmBtn");
  const cancelBtn = document.getElementById("modalCancel");

  if (!flashProducts.length) return showToast("⚠ Tidak ada flash sale untuk dihapus!");

  message.textContent = "⚠️ Yakin hapus SEMUA flash sale?";
  modal.style.display = "flex";

  // Hapus listener lama agar tidak menumpuk
  confirmBtn.onclick = () => {
    flashProducts = [];
    saveFlashLocal();
    renderFlashTable();
    modal.style.display = "none";
    showToast("🗑 Semua flash sale berhasil dihapus!");
  };

  cancelBtn.onclick = () => {
    modal.style.display = "none";
  };
}

/* ============================================================
   IMPORT FILE
============================================================ */
function isValidFlashArray(data) {
  if (!Array.isArray(data)) return false;

  return data.every(item =>
    item.id &&
    item.name &&
    typeof item.price_normal === "number" &&
    typeof item.price_flash === "number" &&
    typeof item.stock === "number" &&
    item.img &&
    item.label &&
    item.category === "flash" &&
    item.flash_until
  );
}

function importFlashFromFile() {
  const input = document.getElementById("flashFileInput");
  if (!input.files.length) return alert("⚠ Pilih file dahulu.");

  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const json = JSON.parse(event.target.result);

      if (!isValidFlashArray(json)) return alert("⚠ Format JSON Flash salah!");

      flashProducts = json;
      saveFlashLocal();
      renderFlashTable();
      alert("✔ Import berhasil!");

    } catch {
      alert("⚠ JSON tidak valid!");
    }
  };

  reader.readAsText(input.files[0]);
}

/* ============================================================
   IMPORT TEXT
============================================================ */
function importFlashFromText() {
  const text = document.getElementById("flashJsonText").value.trim();
  if (!text) return alert("⚠ Kolom kosong.");

  try {
    const json = JSON.parse(text);

    if (!isValidFlashArray(json)) return alert("⚠ Format JSON Flash salah!");

    flashProducts = json;
    saveFlashLocal();
    renderFlashTable();
    alert("✔ Import berhasil!");

  } catch {
    alert("⚠ JSON tidak valid!");
  }
}

function clearFlashJson() {
  document.getElementById("flashJsonText").value = "";
}

/* ============================================================
   GENERATE JSON FLASH
============================================================ */
function generateFlashJSON() {
  document.getElementById("flashJsonOutput").textContent =
    JSON.stringify(flashProducts, null, 2);
}

function generateAndScrollFlashJSON() {
  generateFlashJSON();
  document.getElementById("flashJsonOutput").scrollIntoView({ behavior: "smooth" });
}

function scrollToFlashJSON() {
  document.getElementById("flashJsonText").scrollIntoView({ behavior: "smooth" });
}

/* ============================================================
   LOAD FLASH FROM REPO
============================================================ */
async function loadFlashFromRepo() {
  try {
    const token = (document.getElementById("githubToken")?.value || "").trim();
    if (!token) return alert("⚠ Masukkan GitHub Token dulu.");

    const owner = "WarungEmung";
    const repo  = "database";
    const path  = "flash_products.json";

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const res = await fetch(url, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json"
      }
    });

    if (!res.ok) return alert("❌ Gagal mengambil flash_products.json!");

    const data = await res.json();
    const decoded = atob(data.content);
    const json = JSON.parse(decoded);

    flashProducts = json;
    saveFlashLocal();
    renderFlashTable();

    alert("✔ Flash Sale berhasil dimuat dari repo!");

  } catch (err) {
    console.error("ERROR LOAD FLASH:", err);
    alert("❌ Terjadi kesalahan saat memuat Flash dari repo.");
  }
}

/* ============================================================
   AUTO LOAD SAAT PERTAMA KALI MASUK
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  flashProducts = JSON.parse(localStorage.getItem("flashProducts") || "[]");
  renderFlashTable();
});

// Fungsi untuk memicu tombol Load Flash dari Repo
function triggerLoadFlash() {
  const btn = document.getElementById("btnLoadFlash");
  if (btn) btn.click();
}

function copyFlashJSON() {
  const output = document.getElementById("flashJsonOutput");
  if (!output || !output.textContent.trim()) {
    return showToast("⚠️ JSON kosong!");
  }

  navigator.clipboard.writeText(output.textContent)
    .then(() => {
      showToast("✔ JSON Flash berhasil dicopy!");
    })
    .catch(err => {
      console.error("ERROR copy JSON:", err);
      showToast("❌ Gagal menyalin JSON.");
    });
}

/* ============================================================
   DOWNLOAD FLASH JSON
============================================================ */
function downloadFlashJSON() {
  if (!flashProducts.length) return showToast("⚠ Tidak ada data Flash Sale untuk di-download!");

  const dataStr = JSON.stringify(flashProducts, null, 2); // format rapi
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "flash_products.json"; // nama file
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url); // bersihkan memory
  showToast("✔ File JSON Flash berhasil di-download!");
}

