/* ==============================================
   CONFIG REPO
============================================== */
const REPO_CONFIG = {
  owner: "WarungEmung26",
  repo: "WarungEmung",
  branch: "main",
  filePath: "data/produk.json"
};


/* ==============================================
   IMPORT PRODUK DARI REPO
============================================== */
async function importFromRepo() {
  const tokenInput = document.getElementById("githubToken");
  const token = tokenInput ? tokenInput.value.trim() : "";

  if (!token) {
    alert("⚠️ Masukkan GitHub Token dulu!");
    return;
  }

  try {
    const { owner, repo, branch, filePath } = REPO_CONFIG;

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

    const res = await fetch(url, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github+json"
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gagal ambil file (HTTP ${res.status}) → ${errText}`);
    }

    const meta = await res.json();
    if (!meta.content) throw new Error("File tidak memiliki konten.");

    const decoded = atob(meta.content.replace(/\n/g, ""));
    let jsonData;

    try {
      jsonData = JSON.parse(decoded);
    } catch (e) {
      throw new Error("Isi produk.json bukan JSON valid: " + e.message);
    }

    if (!Array.isArray(jsonData)) {
      throw new Error("Format produk.json harus ARRAY.");
    }

    products = jsonData.map(p => ({
      id: p.id || generateId(),
      name: p.name || "",
      slug: p.slug || "",
      price: Number(p.price || 0),
      category: p.category || "",
      img: p.img || p.image || "",
      tags: Array.isArray(p.tags) ? p.tags : []
    }));

    saveLocal();
    renderTable();

    alert("✅ Produk berhasil diimport dari GitHub!");
  } catch (err) {
    console.error("ERROR:", err);
    alert("❌ Error import: " + err.message);
  }
}


// ===== AMBIL DATA PRODUK DARI REPO GITHUB =====
async function loadProdukFromRepo() {
  const token = document.getElementById('githubToken').value.trim();
  if (!token) return alert('⚠️ Masukkan GitHub Token dulu.');

  const { owner, repo, branch, filePath } = REPO_CONFIG;

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Gagal ambil file (HTTP ${res.status}). ${text}`);
    }

    const meta = await res.json();
    if (!meta.content) throw new Error('File kosong atau format tidak valid di GitHub.');

    const decoded = atob(meta.content.replace(/\n/g, ''));
    let jsonData;
    try {
      jsonData = JSON.parse(decoded);
    } catch (err) {
      throw new Error('Isi produk.json bukan JSON valid: ' + err.message);
    }

    if (!Array.isArray(jsonData)) throw new Error('Format produk.json harus array produk ([])');

    products = jsonData.map(p => ({
      id: p.id || generateId(),
      name: p.name || "",
      slug: p.slug || "",
      price: Number(p.price || 0),
      category: p.category || "",
      img: p.img || p.image || "",
      tags: Array.isArray(p.tags) ? p.tags : []
    }));

    saveLocal();
renderTable();

// ===== WORKFLOW SUCCESS =====
produkFlow.imported = true;
produkFlow.generated = false;
produkFlow.published = false;

document.getElementById("produkFlowStatus").innerText =
  "✅ Produk berhasil di-import. Silakan edit lalu Generate JSON.";

updateWorkflowUI();

alert('✅ Data produk berhasil dimuat dari GitHub!');
} catch (err) {
  console.error('loadProdukFromRepo error:', err);
  alert('❌ Error ambil produk: ' + err.message);
}

}

// ===== UPLOAD TABLE JSON =====
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById('uploadTableJsonBtn');

  if (!btn) return;

  btn.addEventListener('click', () => {
    const log = document.getElementById('offlineLog');

    try {
      const table = document.getElementById('produkTable');
      const data = [];

      if (!table) throw new Error('Tabel tidak ditemukan');

      for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];

        data.push({
          nama: row.cells[0].innerText.trim(),
          harga: parseFloat(row.cells[1].innerText.trim()),
          kategori: row.cells[2].innerText.trim(),
        });
      }

      saveProdukOffline(data);

      if (log) {
        log.style.color = 'green';
        log.textContent = '✅ JSON dari tabel berhasil diupload!';
      }

    } catch (err) {
      if (log) {
        log.style.color = 'red';
        log.textContent = '❌ Error: ' + err.message;
      }
    }
  });
});
