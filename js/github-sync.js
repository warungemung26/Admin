/* ===========================
   GITHUB SYNC
=========================== */

/* ===== UPLOAD PRODUK JSON (UPGRADED) ===== */
async function uploadJSONSimple() {

  // ===== WORKFLOW CEGAT =====
  if (!products || products.length === 0) {
    showToast("⚠️ Tidak ada produk");
    return;
  }

  // kalau data ada tapi belum import (dari localStorage), anggap siap
  if (!produkFlow.imported && products.length > 0) {
    produkFlow.imported = true;
  }

  if (!produkFlow.generated) {
    showToast("⚠️ Generate dulu sebelum publish");
    return;
  }

  if (!jsonOutput || !jsonOutput.textContent || jsonOutput.textContent === '[ Kosong ]') {
    showToast("⚠️ JSON kosong, generate dulu");
    return;
  }

  try {
    const token = document.getElementById('githubToken')?.value.trim();
    if (!token) {
      showToast('⚠️ Masukkan GitHub Token');
      return;
    }

    // ===== NORMALIZE DATA =====
    const normalized = products.map(p => {
      const name = p.name || '';
      const slug = p.slug && p.slug.trim() ? p.slug : makeSlug(name);

      return {
        name,
        slug,
        price: Number(p.price || p.price_normal || 0),
        img: p.img || '',
        category: p.category || '',
        tags: Array.isArray(p.tags) ? p.tags : []
      };
    });

    if (!normalized.every(p => p.slug)) {
      showToast('❌ Gagal membuat slug');
      return;
    }

    const content = JSON.stringify(normalized, null, 2);

    // ===== UI LOADING =====
    document.getElementById("produkFlowStatus").innerText =
      "⏳ Upload produk ke GitHub...";

    const owner  = 'WarungEmung26';
    const repo   = 'WarungEmung';
    const path   = 'data/produk.json';
    const branch = 'main';

    let sha = null;

    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        { headers: { Authorization: 'token ' + token } }
      );
      if (res.ok) sha = (await res.json()).sha;
    } catch (e) {}

    const resUpload = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: { Authorization: 'token ' + token },
        body: JSON.stringify({
          message: sha ? 'Update produk JSON' : 'Add produk JSON',
          content: btoa(unescape(encodeURIComponent(content))),
          branch,
          sha: sha || undefined
        })
      }
    );

    if (!resUpload.ok) {
      throw new Error(await resUpload.text());
    }

    // ===== WORKFLOW SUCCESS =====
    produkFlow.imported  = true;
    produkFlow.generated = true;
    produkFlow.published = true;

    document.getElementById("produkFlowStatus").innerText =
      "🚀 Produk berhasil dipublish. Silakan Backup.";

    updateWorkflowUI();
    lockProdukButtons();

    showToast('✅ JSON produk berhasil diupload!');

  } catch (err) {
    console.error(err);
    showToast('❌ Upload gagal: ' + err.message);
  }
}


/* ===== UPLOAD FLASH ===== */
async function uploadFlashJSONSimple() {
  try {
    if (!flashProducts || flashProducts.length === 0)
      return alert('⚠️ Belum ada data Flash Sale!');

    const token = document.getElementById('githubToken').value.trim();
    if (!token) return alert('⚠️ Masukkan GitHub Token!');

    const content = JSON.stringify(flashProducts, null, 2);

    const owner = 'WarungEmung26';
    const repo  = 'WarungEmung';
    const path  = 'data/flash.json';
    const branch = 'main';

    let sha = null;
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        { headers: { Authorization: 'token ' + token } }
      );
      if (res.ok) sha = (await res.json()).sha;
    } catch(e){}

    const resUpload = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: { Authorization: 'token ' + token },
        body: JSON.stringify({
          message: sha ? 'Update flash.json' : 'Add flash.json',
          content: btoa(unescape(encodeURIComponent(content))),
          branch,
          sha: sha || undefined
        })
      }
    );

    if (!resUpload.ok) throw new Error(await resUpload.text());
    alert('✅ flash.json berhasil diupload!');
  } catch (err) {
    console.error(err);
    alert('❌ Upload Flash gagal: ' + err.message);
  }
}


/* ===== LOAD FLASH ===== */
async function loadFlashFromRepoUnified() {
  try {
    const token = (document.getElementById("githubToken")?.value || "").trim();
    if (!token) return alert("⚠ Masukkan GitHub Token dulu.");

    const owner = "WarungEmung26";
    const repo  = "WarungEmung";
    const path  = "data/flash.json";
    const branch = "main";

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      { headers: { Authorization: `token ${token}` } }
    );

    if (!res.ok) throw new Error("Gagal ambil file");

    const data = await res.json();
    const decoded = new TextDecoder("utf-8").decode(
      Uint8Array.from(atob(data.content), c => c.charCodeAt(0))
    );

    let json = JSON.parse(decoded);

    json = json.map(p => ({
      id: p.id || "flash-" + Date.now(),
      name: p.name || "",
      price_normal: Number(p.price_normal ?? p.price ?? 0),
      price_flash: Number(p.price_flash ?? 0),
      stock: Number(p.stock ?? 0),
      img: p.img || "",
      label: p.label || "",
      flash_until: p.flash_until || "",
      category: "flash"
    }));

    window.flashProducts = flashProducts = json;
    localStorage.setItem("flashProducts", JSON.stringify(json));

    if (typeof renderFlashTable === "function") renderFlashTable();

    alert("✅ Flash berhasil dimuat!");
  } catch (err) {
    console.error(err);
    alert("❌ Gagal load flash: " + err.message);
  }
}


/* ===== BUTTON HOOK ===== */
document.addEventListener("DOMContentLoaded", () => {
  
  document.getElementById('btnUploadFlash')?.addEventListener('click', uploadFlashJSONSimple);
  document.getElementById('btnLoadFlash')?.addEventListener('click', loadFlashFromRepoUnified);
});

function initUploadGambarMassal() {

  const filePicker = document.getElementById('filePicker');
  const previewArea = document.getElementById('previewArea');
  const uploadMassalBtn = document.getElementById('uploadMassalBtn');
  if (!filePicker || !uploadMassalBtn) return;

  let selectedFiles = [];

  filePicker.addEventListener('change', (e) => {
    const newFiles = Array.from(e.target.files);
    selectedFiles = selectedFiles.concat(newFiles);
    updatePreview();
  });

  function updatePreview() {
    previewArea.innerHTML = '';
    if (selectedFiles.length === 0) {
      previewArea.innerHTML = '<small class="muted">Belum ada gambar dipilih.</small>';
      return;
    }
    selectedFiles.forEach((file, index) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${URL.createObjectURL(file)}" class="thumb">
        <span>${file.name}</span>
        <button onclick="removeFile(${index})" class="remove-btn">❌</button>
      `;
      previewArea.appendChild(div);
    });
  }

  window.removeFile = (index) => {
    selectedFiles.splice(index, 1);
    updatePreview();
  };

  uploadMassalBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return alert('⚠️ Belum ada gambar yang dipilih!');
    const token = document.getElementById('githubToken').value.trim();
    if (!token) return alert('❌ Masukkan GitHub Token dulu.');

    const repoOwner = 'WarungEmung26';
    const repoName = 'WarungEmung';
    const imagePath = 'images';

    uploadMassalBtn.disabled = true;
    uploadMassalBtn.textContent = '⏳ Mengupload...';

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const content = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });

      const safeName = file.name.replace(/[:\/\\?%*|"<>]/g, '');
      const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imagePath}/${safeName}`;
      const message = `Upload ${safeName} via Admin WarungEmung`;

      try {
        const res = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message, content })
        });

        if (!res.ok) {
          const errorText = await res.text();
          alert(`Gagal upload ${safeName}\n${errorText}`);
        }
      } catch (err) {
        alert(`Terjadi error saat upload ${file.name}`);
      }

      uploadMassalBtn.textContent = `📤 ${i + 1}/${selectedFiles.length} diupload...`;
    }

    alert('✅ Semua gambar berhasil diupload!');
    selectedFiles = [];
    updatePreview();

    uploadMassalBtn.disabled = false;
    uploadMassalBtn.textContent = '🚀 Upload Gambar Massal';
  });

  updatePreview();
}

// ===== UPLOAD KE GITHUB (PASTI ADA SLUG) =====
async function uploadToGitHub() {
  if (!jsonOutput || !jsonOutput.textContent)
    return alert('⚠️ Tidak ada JSON untuk diupload!');

  const token = document.getElementById('githubToken').value.trim();
  if (!token) return alert('⚠️ Masukkan GitHub Token Anda!');

  const content = jsonOutput.textContent;

  // 🔒 WAJIB: pastikan JSON tidak kosong
  if (!content || content === '[ Kosong ]')
    return alert('⚠️ JSON kosong, tidak bisa diupload.');

  // 🔒 WAJIB: pastikan slug ADA
  if (!content.includes('"slug"')) {
    return alert('⚠️ JSON belum mengandung slug.\nKlik "Generate JSON" terlebih dahulu!');
  }

  const btn = uploadBtn;
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⏳ Mengunggah...';

  const owner  = 'WarungEmung26';
  const repo   = 'WarungEmung';
  const path   = 'data/produk.json';
  const branch = 'main';

  try {
    let sha = null;

    // cek apakah file sudah ada
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        {
          headers: {
            Authorization: 'token ' + token,
            Accept: 'application/vnd.github+json'
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        sha = data.sha;
      }
    } catch (e) {
      console.warn('File belum ada, akan dibuat baru.');
    }

    // upload file (PASTI dari jsonOutput)
    const resUpload = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: 'token ' + token,
          Accept: 'application/vnd.github+json'
        },
        body: JSON.stringify({
          message: sha ? 'Update produk JSON' : 'Add produk JSON',
          content: btoa(unescape(encodeURIComponent(content))),
          branch,
          sha: sha || undefined
        })
      }
    );

    if (!resUpload.ok) throw new Error('HTTP ' + resUpload.status);

    btn.textContent = '✅ Berhasil!';
    setTimeout(() => (btn.textContent = originalText), 2000);

    // ✅ ALERT SUKSES
    alert('✅ JSON produk (dengan slug) berhasil diupload ke GitHub!');

  } catch (err) {
    console.error(err);
    btn.textContent = '❌ Gagal Upload';
    setTimeout(() => (btn.textContent = originalText), 2000);
    alert('❌ Upload gagal: ' + err.message);
  } finally {
    btn.disabled = false;
  }
}

// ===== UPLOAD JSON SEDERHANA =====
async function uploadJSONSimple() {
  try {
    if (!jsonOutput || !jsonOutput.textContent || jsonOutput.textContent === '[ Kosong ]') {
      return alert('⚠️ Generate JSON dulu sebelum upload!');
    }

    // 🔒 pastikan slug benar-benar ada
    if (!jsonOutput.textContent.includes('"slug"')) {
      return alert('⚠️ JSON belum mengandung slug. Generate ulang!');
    }

    const token = document.getElementById('githubToken').value.trim();
    if (!token) return alert('⚠️ Masukkan GitHub Token!');

    const content = jsonOutput.textContent; // ✅ SAMA DENGAN DOWNLOAD

    const owner = 'WarungEmung26';
    const repo  = 'WarungEmung';
    const path  = 'data/produk.json';
    const branch = 'main';

    let sha = null;

    // cek apakah file sudah ada
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        { headers: { Authorization: 'token ' + token } }
      );
      if (res.ok) sha = (await res.json()).sha;
    } catch (_) {}

    // upload / update
    const resUpload = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: { Authorization: 'token ' + token },
        body: JSON.stringify({
          message: sha ? 'Update produk JSON' : 'Add produk JSON',
          content: btoa(unescape(encodeURIComponent(content))),
          branch,
          sha: sha || undefined
        })
      }
    );

    if (!resUpload.ok) {
      throw new Error('HTTP ' + resUpload.status);
    }

    alert('✅ JSON (PERSIS hasil generate & download) berhasil diupload!');
  } catch (err) {
    console.error(err);
    alert('❌ Upload gagal: ' + err.message);
  }
}

// ===== HAPUS FILE DARI GITHUB REPO =====
async function deleteFileFromGitHub(filePath) {
  const token = document.getElementById('githubToken').value.trim();
  if (!token) return alert('⚠️ Masukkan GitHub Token Anda terlebih dahulu.');

  const owner = 'WarungEmung26'; // ganti dengan username GitHub kamu
  const repo = 'WarungEmung';    // ganti dengan repo kamu
  const branch = 'main';         // biasanya "main" atau "master"

  if (!filePath) return alert('⚠️ Path file belum ditentukan.');
  if (!confirm(`Yakin ingin menghapus file:\n${filePath} ?`)) return;

  try {
    // Ambil SHA file
    const resMeta = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });
    if (!resMeta.ok) throw new Error('File tidak ditemukan atau token salah');
    const data = await resMeta.json();

    // Hapus file
    const resDel = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      method: 'DELETE',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
      },
      body: JSON.stringify({
        message: `Hapus file ${filePath} via Admin WarungEmung`,
        sha: data.sha,
        branch: branch
      })
    });

    if (resDel.ok) {
      alert(`✅ File berhasil dihapus: ${filePath}`);
    } else {
      const txt = await resDel.text();
      alert(`❌ Gagal menghapus file:\n${txt}`);
    }

  } catch (err) {
    alert('❌ Terjadi error: ' + err.message);
  }
}

function hapusFileRepo() {
  const path = document.getElementById('filePathDelete').value.trim();
  if (!path) return alert('Masukkan path file yang ingin dihapus!');
  deleteFileFromGitHub(path);
}

document.getElementById('loadFolder').addEventListener('click', async () => {
  const token = document.getElementById('githubToken').value.trim();
  const folderPath = document.getElementById('folderPath').value.trim();
  if (!token || !folderPath) return alert('Masukkan token dan folder path');

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}?ref=${branch}`, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const files = await res.json();
    const container = document.getElementById('fileList');
    container.innerHTML = '';
    if (files.length === 0) container.innerHTML = '<small>Folder kosong</small>';
    files.forEach(file => {
      const div = document.createElement('div');
      div.innerHTML = `<input type="checkbox" data-sha="${file.sha}" data-path="${file.path}"> ${file.name}`;
      container.appendChild(div);
    });
  } catch (err) {
    alert('❌ Gagal load folder: ' + err.message);
  }
});

document.getElementById('deleteAll').addEventListener('click', async () => {
  const token = document.getElementById('githubToken').value.trim();
  if (!token) return alert('Masukkan token');

  const checkboxes = document.querySelectorAll('#fileList input[type=checkbox]');
  if (checkboxes.length === 0) return alert('Folder kosong atau belum load');
  if (!confirm('⚠️ Hapus semua file di folder ini?')) return;

  for (const cb of checkboxes) {
    const path = cb.dataset.path;
    const sha  = cb.dataset.sha;
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: 'DELETE',
        headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' },
        body: JSON.stringify({ message: `Hapus ${path}`, sha, branch })
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error(`❌ Gagal hapus ${path}`, txt);
      }
    } catch (err) {
      console.error(`❌ Error hapus ${path}`, err);
    }
  }

  alert('✅ Semua file di folder dihapus');
  document.getElementById('fileList').innerHTML = '<small>Folder kosong</small>';
});

// === HAPUS FILE TERPILIH SAJA ===
document.getElementById("deleteSelected").addEventListener("click", async () => {
  const token = document.getElementById("githubToken").value.trim();
  if (!token) return alert("Masukkan GitHub Token dulu!");

  const selected = Array.from(document.querySelectorAll("#fileList input:checked"));
  if (selected.length === 0) return alert("Pilih dulu file yang ingin dihapus!");

  if (!confirm(`Yakin mau hapus ${selected.length} file terpilih?`)) return;

  const deleteBtn = document.getElementById("deleteSelected");
  deleteBtn.disabled = true;
  deleteBtn.textContent = "⏳ Menghapus...";

  try {
    for (const cb of selected) {
      const path = cb.dataset.path;
      const sha = cb.dataset.sha;

      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: "DELETE",
        headers: {
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github+json"
        },
        body: JSON.stringify({
          message: `Hapus file ${path}`,
          sha,
          branch
        })
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("❌ Gagal hapus", path, err);
      } else {
        console.log("✅ Berhasil hapus", path);
      }
    }

    alert("✅ File terpilih berhasil dihapus!");
    document.getElementById("loadFolder").click(); // reload daftar file otomatis
  } catch (err) {
    alert("❌ Terjadi kesalahan: " + err.message);
  } finally {
    deleteBtn.disabled = false;
    deleteBtn.textContent = "🗑️ Hapus Terpilih";
  }
});

//pushZip//
async function pushZipToGitHubSafe() {
  const token = document.getElementById('githubToken').value.trim();
  if (!token) return alert("⚠ Masukkan token GitHub!");

  const zipFile = document.getElementById("zipInputSafe").files[0];
  if (!zipFile) return alert("⚠ Pilih file ZIP dulu!");

  // Load JSZip jika belum
  if (!window.JSZip) await loadJSZip();

  const zip = await JSZip.loadAsync(zipFile);
  const fileEntries = Object.keys(zip.files);

  if (fileEntries.length === 0)
    return alert("❌ ZIP kosong atau format salah!");

  for (let path of fileEntries) {
    const file = zip.files[path];
    if (file.dir) continue; // skip folder kosong
    const content = await file.async("uint8array");

    // Upload ke GitHub
    try {
      await uploadFileGitHubSafe(path, content, token);
    } catch (err) {
      console.error("Upload gagal:", path, err);
      alert("❌ Upload gagal untuk file: " + path);
    }
  }

  alert("✅ Semua file dari ZIP berhasil di-push (images opsional, file lama tetap utuh)!");
}





// Versi baru pushZipToGitHubSafe dengan progress dan indikator file
async function pushZipToGitHubSafe() {
  const token = document.getElementById('githubToken').value.trim();
  if (!token) return alert("⚠ Masukkan token GitHub!");

  const zipFile = document.getElementById("zipInputSafe").files[0];
  if (!zipFile) return alert("⚠ Pilih file ZIP dulu!");

  if (!window.JSZip) await loadJSZip();

  const zip = await JSZip.loadAsync(zipFile);
  const fileEntries = Object.keys(zip.files);

  if (fileEntries.length === 0) return alert("❌ ZIP kosong atau format salah!");

  const statusDiv = document.getElementById("pushStatus");
  const progressBar = document.getElementById("pushProgress");
  progressBar.value = 0;
  statusDiv.innerHTML = "<strong>Mulai push file:</strong><br>";

  const filesToPush = fileEntries.filter(f => !zip.files[f].dir);
  const totalFiles = filesToPush.length;
  let doneFiles = 0;

  for (let path of filesToPush) {
    const file = zip.files[path];

    // Tampilkan file yang sedang diproses
    statusDiv.innerHTML += `📤 ${path} ...<br>`;
    statusDiv.scrollTop = statusDiv.scrollHeight; // scroll otomatis ke bawah

    const content = await file.async("uint8array");

    try {
      // Tetap memanggil fungsi push aman asli
      await uploadFileGitHubSafe(path, content, token);
      statusDiv.innerHTML += `✅ ${path} berhasil di-push<br>`;
    } catch (err) {
      console.error("Upload gagal:", path, err);
      statusDiv.innerHTML += `❌ ${path} gagal di-push<br>`;
    }

    doneFiles++;
    progressBar.value = Math.round((doneFiles / totalFiles) * 100);
  }

  statusDiv.innerHTML += "<strong>Semua file selesai!</strong>";
}

// Load JSZip dari CDN
function loadJSZip() {
  return new Promise(resolve => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js";
    s.onload = resolve;
    document.body.appendChild(s);
  });
}

// Upload file ke GitHub (aman, tidak hapus file lama)
async function uploadFileGitHubSafe(path, contentUint8, token) {
  const owner = "WarungEmung26"; // sesuaikan
  const repo  = "WarungEmung";   // sesuaikan
  const branch = "main";
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  // Cek SHA (update jika file ada, buat baru jika tidak ada)
  let sha = null;
  try {
    const resCheck = await fetch(url, { headers: { Authorization: "token " + token } });
    if (resCheck.ok) {
      const data = await resCheck.json();
      sha = data.sha;
    }
  } catch(e) {
    // Jika file belum ada, sha tetap null → buat baru
  }

  // Upload / update
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": "token " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: sha ? "Update file: " + path : "Add file: " + path,
      content: btoa(String.fromCharCode(...contentUint8)),
      branch,
      sha: sha || undefined
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} — ${text}`);
  }
}

// ==========================
// DOWNLOAD REPO ZIP DENGAN TOKEN
// ==========================
document.getElementById('btnDownloadRepo')?.addEventListener('click', async () => {
  const progress = document.getElementById('downloadProgress');
  const status = document.getElementById('downloadStatus');

  // ambil token dari localStorage (dari tab-token)
  const token = localStorage.getItem('githubToken');
  if (!token) {
    status.innerHTML = '❌ Token GitHub tidak ditemukan di localStorage.';
    return;
  }

  // URL repo (ganti sesuai repo kamu)
  const zipUrl = 'https://api.github.com/repos/warungemung26/WarungEmung/repo/zipball/main';

  status.innerHTML = 'Mengunduh repo...';
  progress.value = 0;

  try {
    const response = await fetch(zipUrl, {
      headers: { Authorization: `token ${token}` },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const contentLength = response.headers.get('Content-Length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (total) progress.value = (received / total) * 100;
    }

    const blob = new Blob(chunks, { type: 'application/zip' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'repo.zip';
    a.click();

    status.innerHTML = `✅ Download selesai.`;
    progress.value = 100;

  } catch (err) {
    status.innerHTML = `❌ Gagal download: ${err.message}`;
  }
});

// ==========================
// 🔹 UPLOAD GAMBAR MASSAL FIX FINAL
// ==========================
document.addEventListener('DOMContentLoaded', () => {

  const filePicker = document.getElementById('filePicker');
  const previewArea = document.getElementById('previewArea');
  const uploadMassalBtn = document.getElementById('uploadMassalBtn');
  if (!filePicker || !uploadMassalBtn) return; // jika elemen belum ada, hentikan saja (aman)

  let selectedFiles = [];

  // Saat user pilih gambar
  filePicker.addEventListener('change', (e) => {
    const newFiles = Array.from(e.target.files);
    selectedFiles = selectedFiles.concat(newFiles);
    updatePreview();
  });

  function updatePreview() {
    previewArea.innerHTML = '';
    if (selectedFiles.length === 0) {
      previewArea.innerHTML = '<small class="muted">Belum ada gambar dipilih.</small>';
      return;
    }
    selectedFiles.forEach((file, index) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${URL.createObjectURL(file)}" class="thumb">
        <span>${file.name}</span>
        <button onclick="removeFile(${index})" class="remove-btn">❌</button>
      `;
      previewArea.appendChild(div);
    });
  }

  window.removeFile = (index) => {
    selectedFiles.splice(index, 1);
    updatePreview();
  };

  uploadMassalBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return alert('⚠️ Belum ada gambar yang dipilih!');
    const token = document.getElementById('githubToken').value.trim();
    if (!token) return alert('❌ Masukkan GitHub Token dulu.');

    const repoOwner = 'WarungEmung26'; // ubah sesuai username GitHub kamu
    const repoName = 'WarungEmung';    // ubah sesuai repository kamu
    const imagePath = 'images';        // folder tujuan upload

    uploadMassalBtn.disabled = true;
    uploadMassalBtn.textContent = '⏳ Mengupload...';

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const content = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });

      const safeName = file.name.replace(/[:\/\\?%*|"<>]/g, '');
      const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imagePath}/${safeName}`;
      const message = `Upload ${safeName} via Admin WarungEmung`;

      try {
        const res = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message, content })
        });

        if (res.ok) {
          console.log(`✅ ${safeName} berhasil diupload`);
        } else {
          const errorText = await res.text();
          console.error(`❌ Gagal upload ${safeName}`, errorText);
          alert(`Gagal upload ${safeName}\n${errorText}`);
        }
      } catch (err) {
        console.error('Error upload', err);
        alert(`Terjadi error saat upload ${file.name}`);
      }

      // progress sederhana
      uploadMassalBtn.textContent = `📤 ${i + 1}/${selectedFiles.length} diupload...`;
    }

    alert('✅ Semua gambar berhasil diupload!');
    selectedFiles = [];
    updatePreview();

    uploadMassalBtn.disabled = false;
    uploadMassalBtn.textContent = '🚀 Upload Gambar Massal';
  });

  // tampil awal
  updatePreview();
});


/* ---------------------------
  Token helper: simpan & muat token
  - Menggunakan Web Crypto (AES-GCM) bila passphrase diberikan
  - Fallback menyimpan plain jika passphrase kosong dan user pilih simpan plain
----------------------------*/

// util: base64 <-> ArrayBuffer
function abToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str);
}
function base64ToAb(b64) {
  const str = atob(b64);
  const buf = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
  return buf.buffer;
}

// derive key from passphrase using PBKDF2
async function deriveKeyFromPassword(passphrase, saltBytes) {
  const enc = new TextEncoder();
  const passKey = await crypto.subtle.importKey('raw', enc.encode(passphrase), {name: 'PBKDF2'}, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations: 200000, hash: 'SHA-256' },
    passKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// encrypt token with passphrase -> returns object {ct, iv, salt} all base64
async function encryptTokenWithPassphrase(token, passphrase) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassword(passphrase, salt);
  const ctBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(token));
  return { ct: abToBase64(ctBuf), iv: abToBase64(iv), salt: abToBase64(salt) };
}

// decrypt token using passphrase + stored {ct, iv, salt}
async function decryptTokenWithPassphrase(obj, passphrase) {
  try {
    const iv = base64ToAb(obj.iv);
    const salt = base64ToAb(obj.salt);
    const key = await deriveKeyFromPassword(passphrase, new Uint8Array(salt));
    const ptBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(iv) }, key, base64ToAb(obj.ct));
    return new TextDecoder().decode(ptBuf);
  } catch (e) {
    throw new Error('Gagal dekripsi — passphrase mungkin salah');
  }
}

// storage keys
const TOKEN_STORE_KEY = 'we_token_store_v1';
const TOKEN_STORE_PLAIN_KEY = 'we_token_plain_v1';

// UI elements
const btnPaste = document.getElementById('btnPaste');
const btnSave = document.getElementById('btnSave');
const btnSavePlain = document.getElementById('btnSavePlain');
const btnUseStored = document.getElementById('btnUseStored');
const btnClearStored = document.getElementById('btnClearStored');
const tokenInput = document.getElementById('githubToken');
const passInput = document.getElementById('passphrase');

btnPaste?.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      tokenInput.value = text.trim();
      showToast('📋 Token dipaste dari clipboard');
    } else {
      alert('Clipboard kosong atau izin ditolak');
    }
  } catch (err) {
    alert('Gagal baca clipboard: ' + err.message);
  }
});

btnSave?.addEventListener('click', async () => {
  const token = tokenInput.value.trim();
  const pass = passInput.value;
  if (!token) return alert('Masukkan token dulu!');
  if (!pass) return alert('Masukkan passphrase untuk enkripsi (atau gunakan tombol simpan plain)');
  try {
    const obj = await encryptTokenWithPassphrase(token, pass);
    localStorage.setItem(TOKEN_STORE_KEY, JSON.stringify(obj));
    // remove plain if any
    localStorage.removeItem(TOKEN_STORE_PLAIN_KEY);
    showToast('🔒 Token disimpan terenkripsi');
  } catch (err) {
    alert('Gagal simpan: ' + err.message);
  }
});

btnSavePlain?.addEventListener('click', () => {
  const token = tokenInput.value.trim();
  if (!token) return alert('Masukkan token dulu!');
  if (!confirm('Token akan disimpan tanpa enkripsi di browser. Lanjutkan?')) return;
  localStorage.setItem(TOKEN_STORE_PLAIN_KEY, token);
  localStorage.removeItem(TOKEN_STORE_KEY);
  showToast('⚠️ Token disimpan plain (kurang aman)');
});

btnUseStored?.addEventListener('click', async () => {
  // prioritas: jika ada encrypted store, pakai itu, minta passphrase
  const encObjRaw = localStorage.getItem(TOKEN_STORE_KEY);
  const plain = localStorage.getItem(TOKEN_STORE_PLAIN_KEY);
  if (encObjRaw) {
    const pass = passInput.value;
    if (!pass) return alert('Masukkan passphrase untuk dekripsi token tersimpan.');
    try {
      const obj = JSON.parse(encObjRaw);
      const token = await decryptTokenWithPassphrase(obj, pass);
      tokenInput.value = token;
      showToast('🔓 Token didekripsi dan dimasukkan');
    } catch (err) {
      alert(err.message || 'Gagal dekripsi token. Pastikan passphrase benar.');
    }
  } else if (plain) {
    tokenInput.value = plain;
    showToast('🔑 Token plain dimasukkan');
  } else {
    alert('Belum ada token tersimpan.');
  }
});

btnClearStored?.addEventListener('click', () => {
  if (!confirm('Hapus token tersimpan dari browser?')) return;
  localStorage.removeItem(TOKEN_STORE_KEY);
  localStorage.removeItem(TOKEN_STORE_PLAIN_KEY);
  passInput.value = '';
  showToast('✅ Token tersimpan dihapus');
});

/* optional: auto-fill token input on load if plain store present (but not encrypted) */
window.addEventListener('load', () => {
  const plain = localStorage.getItem(TOKEN_STORE_PLAIN_KEY);
  if (plain) {
    // jangan auto-paste encrypted token without passphrase
    tokenInput.value = plain;
  }
});