/* ===========================
   MAIN GLUE
=========================== */
const produkFlow = {
  imported: false,
  generated: false,
  published: false,
  lastCount: 0,
  lastSize: 0
};


let activeWorkflow = "produk";

function updateWorkflowUI(){
  const state = produkFlow;
  const steps = document.querySelectorAll(".workflow-bar span[data-step]");

  steps.forEach(el=>{
    const step = el.dataset.step;
    el.classList.remove("active","locked");

    if(step === "import"){
      el.classList.add("active");
    }

    if(step === "generate"){
      state.imported ? el.classList.add("active") : el.classList.add("locked");
    }

    if(step === "publish"){
      state.generated ? el.classList.add("active") : el.classList.add("locked");
    }

    if(step === "backup"){
      state.published ? el.classList.add("active") : el.classList.add("locked");
    }
  });

  lockProdukButtons();
}


document.addEventListener("DOMContentLoaded", () => {

  // ===== INIT =====
  products = products.map(p => ({ id: p.id || generateId(), ...p }));
  saveLocal();
  renderTable();
  if (typeof renderProductCards === 'function') renderProductCards();

  // ===== FILTER =====
  document.getElementById('searchInput')?.addEventListener('input', applyFilter);
  document.getElementById('filterCategory')?.addEventListener('change', applyFilter);
  document.getElementById('sortOption')?.addEventListener('change', applyFilter);

  // ===== DELETE ALL =====
  const deleteAllBtn = document.getElementById('deleteAllBtn');
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', () => {
      if (!products.length) return showToast('Daftar produk kosong');

      if (confirm('⚠️ Hapus semua produk? Tindakan ini tidak dapat dibatalkan.')) {
        products = [];
        saveLocal();
        renderTable();
        renderProductCards();
        showToast('✅ Semua produk dihapus');
      }
    });
  }

// ===== FILE PICKER =====
document.addEventListener("DOMContentLoaded", () => {
  const fp = document.getElementById('filePicker');

  if (fp && typeof onFilePickerChange === 'function') {
    fp.addEventListener('change', onFilePickerChange);
  }
});




  // ===== UPLOAD TABLE JSON =====
  document.getElementById('uploadTableJsonBtn')?.addEventListener('click', onUploadTableJson);

  // ===== MASS UPLOAD INIT =====
  if (typeof initMassUpload === 'function') initMassUpload();

  // ===== TOKEN UI =====
  if (typeof initTokenUI === 'function') initTokenUI();

  // ===== REPO FILE MANAGER =====
  if (typeof initRepoFileManager === 'function') initRepoFileManager();

  // ===== DOWNLOAD REPO =====
  document.getElementById('btnDownloadRepo')?.addEventListener('click', downloadRepoZip);
});


// ===== GLOBAL KEY FIX =====
document.addEventListener('keydown', ev => {
  if (ev.key === 'Enter' && ev.target?.classList.contains('editable')) {
    ev.preventDefault();
    ev.target.blur();
  }
});

document.addEventListener("DOMContentLoaded", () => {

  if (typeof initUploadGambarMassal === 'function') {
    initUploadGambarMassal();
  }

});

/* ==============================================
   RENDER TABLE
============================================== */
function renderTable() {
  const tbody = document.querySelector("#productTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  products.forEach((p, i) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${p.name}</td>
      <td>${p.price}</td>
      <td>${p.category}</td>
      <td><img src="${p.img}" width="40"></td>
      <td>
        <button class="btn-delete" data-id="${p.id}">Hapus</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      deleteProduct(btn.dataset.id);
    });
  });
}

/* ==============================================
   DELETE PRODUCT
============================================== */
function deleteProduct(id) {
  products = products.filter(p => p.id !== id);
  saveLocal();
  renderTable();
}

// ===== RENDER TABLE =====
function renderTable() {
  buildFilteredView();
  tableBody.innerHTML = '';
  filtered.forEach((p, idx) => {
    const fileName = (p.img || '').split('/').pop() || '';
    const row = document.createElement('tr');
    row.dataset.id = p.id;
    row.innerHTML = `
      <td>${idx + 1}</td>
      <td><span contenteditable="true" class="editable" data-field="name" data-id="${p.id}" onblur="onCellBlur(event)">${escapeText(p.name)}</span></td>
      <td><span contenteditable="true" class="editable" data-field="price" data-id="${p.id}" onblur="onCellBlur(event)">${escapeText(p.price)}</span></td>
      <td><span contenteditable="true" class="editable" data-field="category" data-id="${p.id}" onblur="onCellBlur(event)">${escapeText(p.category)}</span></td>
      <td style="display:flex;align-items:center;gap:8px;">
        <span contenteditable="true" class="editable" data-field="img" data-id="${p.id}" onblur="onCellBlur(event)">${escapeText(fileName)}</span>
        <button class="file-btn" title="Pilih file dari HP" onclick="triggerFilePicker('${p.id}')">📁</button>
      </td>
      <td>
        <button onclick="searchProductImage(${idx})">🔍</button>
        <button onclick="deleteById('${p.id}')">🗑️</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
  renderCategoryOptions();
}

// ===== EDIT CELL (GRID CARD) =====
function renderProductCards() {
  const grid = document.getElementById('productCards');
  if(!grid) return;
  grid.innerHTML = '';
  buildFilteredView();

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div class="name" contenteditable="true" 
           onblur="updateField('${p.id}','name',this.textContent)">${p.name}</div>

      <div class="price" contenteditable="true" 
           onblur="updateField('${p.id}','price',this.textContent)">${p.price}</div>

      <div class="category" contenteditable="true" 
           onblur="updateField('${p.id}','category',this.textContent)">${p.category}</div>

      <div class="actions">
        <button onclick="triggerFilePicker('${p.id}')">📁 Ganti Gambar</button>
        <button onclick="deleteById('${p.id}')">🗑️ Hapus</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ===== EDIT FIELD (GRID + TABLE) =====
function updateField(id, field, value) {
  const idx = products.findIndex(p => p.id === id); 
  if (idx === -1) return;

  if (field === 'price') {
    const num = Number(value.replace(/[^0-9]/g, ''));
    products[idx].price = num || 0;
  } else {
    if (field === 'name') {
  products[idx].name = value;
  // 🔒 slug TIDAK DIUBAH
} else {
  products[idx][field] = value;
}
  }

  saveLocal();
  renderTable();          // <-- WAJIB agar tombol tabel hidup
  renderProductCards();   // <-- agar card ikut update
}


// ===== TAMBAH PRODUK MANUAL ANTI-DOBEL + TOAST =====
function addProduct() {
  const n = document.getElementById('name').value.trim();
  const pr = Number(document.getElementById('price').value || 0);

  let c = document.getElementById('categorySelect').value.trim();
  if (c === 'custom') {
    c = document.getElementById('customCategory').value.trim();
  }

  const im = document.getElementById('imageName').value.trim();

  if (!n || !pr || !c || !im) {
    showToast('⚠️ Semua kolom harus diisi!');
    return;
  }

  const imgPath = 'images/' + sanitizeFileName(im);

  // cek produk sama persis (nama + kategori + harga + gambar)
  const idx = products.findIndex(p =>
    p.name.trim() === n &&
    p.category.trim() === c &&
    Number(p.price) === pr &&
    p.img.trim() === imgPath
  );

  if (idx !== -1) {
    // replace produk lama
    products[idx] = { id: products[idx].id, name: n, price: pr, category: c, img: imgPath };
    showToast(`✅ Produk "${n}" diupdate`);
  } else {
    // tambah produk baru
    products.push({
  id: generateId(),
  name: n,
  slug: makeSlug(n), // 🔒 DIBUAT SEKALI
  price: pr,
  category: c,
  img: imgPath
});

    showToast(`✅ Produk "${n}" ditambahkan`);
  }

  saveLocal();

  // reset form
  ['name', 'price', 'categorySelect', 'customCategory', 'imageName'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  document.getElementById('customCategory').style.display = 'none';
  renderTable();
  document.getElementById('name').focus();
}

// ===== TOGGLE CATEGORY CUSTOM =====
function toggleCustomCategory(select) {
  const customInput = document.getElementById('customCategory');
  if (select.value === 'custom') {
    customInput.style.display = 'inline-block';
    customInput.focus();
  } else {
    customInput.style.display = 'none';
  }
}

// ===== JSON IMPORT =====
function importJSON() {
  const ta = document.getElementById('jsonInput');
  if (!ta) return alert('Area JSON tidak ditemukan.');
  const text = ta.value.trim();
  if (!text) return alert('JSON kosong.');

  try {
    const arr = JSON.parse(text.replace(/'/g, '"'));
    if (!Array.isArray(arr)) return alert('Format harus array!');

    arr.forEach(p => {
      const name = (p.name || '').trim();
      const price = Number(p.price || 0);
      const category = (p.category || '').trim();
      const img = (p.img && typeof p.img === 'string') 
                  ? (p.img.includes('/') ? p.img : 'images/' + sanitizeFileName(p.img)) 
                  : '';

      if (!name || !price || !category || !img) return; // skip yg tidak lengkap

      // cek produk sama persis
      const idx = products.findIndex(prod =>
        prod.name.trim() === name &&
        prod.category.trim() === category &&
        Number(prod.price) === price &&
        prod.img.trim() === img
      );

      if (idx !== -1) {
        // replace produk lama
        products[idx] = { id: products[idx].id, name, price, category, img };
      } else {
        // tambah produk baru
        products.push({
  id: generateId(),
  name,
  slug: makeSlug(name), // fallback utk JSON lama
  price,
  category,
  img
});
      }
    });

    saveLocal();
    ta.value = '';
    renderTable();
    alert('✅ Data JSON berhasil diimport tanpa dobel!');
  } catch (err) {
    alert('❌ JSON tidak valid: ' + err);
  }
}

function clearJSONInput() {
  const input = document.getElementById('jsonInput');
  if (input) {
    input.value = ''; // kosongkan isi kolom teks
  }
}

// ===== GENERATE JSON + SCROLL + COPY =====
function clearJSONOutput() {
  if (!jsonOutput) return;
  jsonOutput.textContent = '[ Kosong ]';
  alert('✅ JSON berhasil dihapus!');
}

function downloadJSON() {
  if (!jsonOutput) return;
  const output = jsonOutput.textContent;
  if (!output || output === '[ Kosong ]') {
    alert('Tidak ada JSON untuk didownload.');
    return;
  }

  const blob = new Blob([output], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'produk.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function generateAndScrollJSON() {

  // ===== WORKFLOW CEGAT =====
  if (!products || products.length === 0) {
    showToast('⚠️ Belum ada produk yang bisa digenerate!');
    return;
  }

  // kalau admin belum import tapi data ada (dari localStorage),
  // kita anggap source sudah siap
  if (!produkFlow.imported && products.length > 0) {
    produkFlow.imported = true;
  }

  const formatted = products.map(p => ({
    name: p.name,
    slug: p.slug || makeSlug(p.name),
    price: Number(p.price || 0),
    img: p.img || '',
    category: p.category || '',
    tags: Array.isArray(p.tags) ? p.tags : []
  }));

  const jsonText = JSON.stringify(formatted, null, 2);

  if (jsonOutput) {
    jsonOutput.textContent = jsonText;
    jsonOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ===== COPY =====
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(jsonText)
      .then(() => showToast('✅ JSON berhasil digenerate & disalin!'))
      .catch(() => showToast('⚠️ JSON digenerate, copy manual jika perlu'));
  } else {
    showToast('⚠️ JSON digenerate (browser tidak support auto-copy)');
  }

  // ===== WORKFLOW MARKER =====
  const info = calcJSONInfo(jsonText);

  const changed =
    info.count !== produkFlow.lastCount ||
    info.size !== produkFlow.lastSize;

  produkFlow.generated = true;
  produkFlow.published = false;

  produkFlow.lastCount = info.count;
  produkFlow.lastSize = info.size;

  document.getElementById("produkFlowStatus").innerText =
    changed
      ? `🧬 JSON siap. Item: ${info.count}, Size: ${info.size} bytes.`
      : "⚠ Tidak ada perubahan dari data sebelumnya.";

  updateWorkflowUI();
}


// ===== EXPORT EXCEL =====
function exportToExcel() {
  if (!products || products.length === 0) { alert('Tidak ada produk untuk diexport!'); return; }
  let csv = 'No,Nama,Harga,Kategori,Gambar\n';
  products.forEach((p, idx) => {
    csv += `${idx+1},"${p.name}",${p.price},"${p.category}","${p.img}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'produk-warung-emung.csv';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// ===== FILE PICKER (RENAME & DOWNLOAD) =====
document.addEventListener("DOMContentLoaded", () => {
  if (!window.filePicker) window.filePicker = document.getElementById('filePicker');

  let renameTargetId = null;

  window.triggerFilePicker = function(productId) {
    renameTargetId = productId;
    window.filePicker.value = '';
    window.filePicker.click();
  };

  window.filePicker?.addEventListener('change', ev => {
    if (!renameTargetId) return;

    const f = ev.target.files[0];
    if (!f) return;

    const idx = window.products.findIndex(x => x.id === renameTargetId);
    if (idx === -1) {
      alert('Produk tidak ditemukan.');
      renameTargetId = null;
      return;
    }

    // Ambil nama file dari produk.json atau tabel
    const currentBase = (window.products[idx].img || '').split('/').pop() || f.name;
    const safeTarget = sanitizeFileName(currentBase);

    // Simpan path (tetap di memori) untuk produk
    const basePath = (window.products[idx].img?.lastIndexOf('/') >= 0)
      ? window.products[idx].img.substring(0, window.products[idx].img.lastIndexOf('/') + 1)
      : 'images/';

    // Buat file baru di memory dan trigger download
    const renamedFile = new File([f], safeTarget, { type: f.type });
    const url = URL.createObjectURL(renamedFile);

    const a = document.createElement('a');
    a.href = url;
    a.download = safeTarget;   // browser akan simpan di folder default / prompt jika setting aktif
    a.click();                  // langsung trigger
    URL.revokeObjectURL(url);   // bersihkan memory

    // update produk di array
    window.products[idx].img = basePath + safeTarget;
    saveLocal();
    renameTargetId = null;

    // render ulang tabel & card agar nama file update
    if (typeof renderTable === 'function') renderTable();
    if (typeof renderProductCards === 'function') renderProductCards();

    alert('✅ File baru tersimpan dengan nama: ' + safeTarget + '\n(Tersimpan di folder Download default browser)');
  });
});


// ===== HAPUS PRODUK BY ID =====
function deleteById(id) {
  if (!confirm("⚠️ Hapus produk ini?")) return;

  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) {
    alert("Produk tidak ditemukan!");
    return;
  }

  // Hapus dari array
  products.splice(idx, 1);

  // Simpan perubahan
  saveLocal();

  // Render ulang tabel & kartu
  renderTable();
  renderProductCards();

  showToast("🗑️ Produk berhasil dihapus!");
}

// ===== SEARCH IMAGE =====
function searchProductImage(index) {
  const data = filtered[index] || products[index];
  if (!data) return;
  const query = encodeURIComponent(data.name);
  const url = `https://www.google.com/search?tbm=isch&q=${query}`;
  window.open(url, '_blank');
}



// ===== COPY JSON =====
function copyJSON() {
  if (!jsonOutput) return;

  const text = jsonOutput.textContent;
  if (!text || text === '[ Kosong ]') {
    alert('Tidak ada JSON untuk disalin!');
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => alert('✅ JSON berhasil disalin ke clipboard!'))
      .catch(err => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    const ok = document.execCommand('copy');
    if (ok) alert('✅ JSON berhasil disalin ke clipboard!');
    else alert('❌ Gagal menyalin JSON.');
  } catch (err) {
    alert('❌ Browser tidak mendukung penyalinan otomatis.');
  }
  document.body.removeChild(ta);
}

document.addEventListener("DOMContentLoaded", ()=>{
  updateWorkflowUI();
});


function confirmPublish(){

  if (!produkFlow.generated) {
    showToast("⚠ Generate dulu sebelum upload");
    return;
  }

  if (!jsonOutput || !jsonOutput.textContent || jsonOutput.textContent === '[ Kosong ]') {
    showToast("⚠ JSON kosong, generate dulu");
    return;
  }

  uploadJSONSimple();

  // ✅ hanya publish saja
  produkFlow.published = true;

  document.getElementById("produkFlowStatus").innerText =
    "🚀 Produk berhasil dipublish. Kamu boleh backup.";

  updateWorkflowUI();
  lockProdukButtons();
}

window.confirmPublish = confirmPublish;


function lockProdukButtons(){
  const bGen  = document.querySelector(".nav-btn:nth-child(2)");
  const bPub  = document.querySelector(".nav-btn:nth-child(3)");
  const bBack = document.querySelector(".nav-btn:nth-child(4)");

  if(bGen)  bGen.disabled  = !produkFlow.imported;
  if(bPub)  bPub.disabled = !produkFlow.generated;
  if(bBack) bBack.disabled= !produkFlow.published;
}


document.addEventListener("DOMContentLoaded", ()=>{
  lockProdukButtons();
});

document.addEventListener("DOMContentLoaded", function () {

  const btnNav = document.getElementById("btnUploadProdukNav");
  if (btnNav) {
    btnNav.onclick = confirmPublish;
  }

});

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  const box   = document.getElementById("searchSuggest");
  const clear = document.getElementById("searchClear");

  if(!input || !box) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    box.innerHTML = "";

    clear.style.display = q ? "block" : "none";

    if(!q){
      box.style.display = "none";
      applyFilter();
      return;
    }

    const matches = products
      .filter(p =>
        p.name.toLowerCase()
          .split(' ')
          .some(w => w.startsWith(q))
      )
      .slice(0, 8);

    matches.forEach(p => {
      const div = document.createElement("div");
      div.textContent = p.name;
      div.onclick = () => {
        input.value = p.name;
        box.style.display = "none";
        applyFilter();
      };
      box.appendChild(div);
    });

    box.style.display = matches.length ? "block" : "none";
    applyFilter();
  });

  clear.onclick = () => {
    input.value = "";
    box.style.display = "none";
    clear.style.display = "none";
    applyFilter();
    input.focus();
  };

  document.addEventListener("click", e => {
    if(!e.target.closest(".search-wrap")){
      box.style.display = "none";
    }
  });
});
