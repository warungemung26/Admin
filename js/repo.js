/* ============================================================
   REPO.JS — GitHub Import / Upload Handler
   Warung Emung — Atos
============================================================ */

/* ===========================
   CONFIG REPO
=========================== */
const owner  = "WarungEmung26";
const repo   = "WarungEmung";
const branch = "main";
const filePathProduk = "data/produk.json";
const filePathFlash  = "data/flash.json";


/* ===========================
   IMPORT PRODUK DARI REPO
=========================== */
async function importFromRepo() {
  const token = document.getElementById("githubToken")?.value.trim();
  if (!token) return alert("⚠️ Masukkan GitHub Token dulu!");

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePathProduk}?ref=${branch}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json"
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status} → ${errText}`);
    }

    const meta = await res.json();
    if (!meta.content) throw new Error("File tidak memiliki konten.");

    const decoded = new TextDecoder("utf-8")
      .decode(Uint8Array.from(atob(meta.content), c => c.charCodeAt(0)));

    const jsonData = JSON.parse(decoded);
    if (!Array.isArray(jsonData)) throw new Error("produk.json harus ARRAY.");

    window.products = jsonData.map(p => ({
      id: p.id || crypto.randomUUID(),
      name: p.name || "",
      slug: p.slug || "",
      price: Number(p.price || 0),
      category: p.category || "",
      img: p.img || p.image || ""
    }));

    saveLocal?.();
    renderTable?.();

    alert("✅ Produk berhasil diimport dari GitHub!");
  } catch (err) {
    console.error("IMPORT ERROR:", err);
    alert("❌ Error import: " + err.message);
  }
}


/* ===========================
   HELPER SLUG
=========================== */
function makeSlug(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}


/* ===========================
   UPLOAD PRODUK JSON
=========================== */
async function uploadJSONSimple() {
  try {
    if (!products || !products.length) {
      return alert("⚠️ Belum ada produk.");
    }

    const token = document.getElementById("githubToken")?.value.trim();
    if (!token) return alert("⚠️ Masukkan GitHub Token.");

    const normalized = products.map(p => {
      const name = p.name || "";
      const slug = p.slug?.trim() || makeSlug(name);

      return {
        name,
        slug,
        price: Number(p.price || p.price_normal || 0),
        img: p.img || "",
        category: p.category || ""
      };
    });

    if (!normalized.every(p => p.slug)) {
      return alert("❌ Semua produk harus punya nama.");
    }

    const content = JSON.stringify(normalized, null, 2);

    let sha = null;
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePathProduk}?ref=${branch}`,
        { headers: { Authorization: "token " + token } }
      );
      if (res.ok) sha = (await res.json()).sha;
    } catch {}

    const resUpload = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePathProduk}`,
      {
        method: "PUT",
        headers: { Authorization: "token " + token },
        body: JSON.stringify({
          message: sha ? "Update produk JSON" : "Add produk JSON",
          content: btoa(unescape(encodeURIComponent(content))),
          branch,
          sha: sha || undefined
        })
      }
    );

    if (!resUpload.ok) {
      throw new Error(await resUpload.text());
    }

    alert("✅ Produk berhasil diupload ke GitHub!");
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    alert("❌ Upload gagal: " + err.message);
  }
}


/* ===========================
   UPLOAD FLASH JSON
=========================== */
async function uploadFlashJSONSimple() {
  try {
    if (!flashProducts || !flashProducts.length) {
      return alert("⚠️ Belum ada Flash Sale.");
    }

    const token = document.getElementById("githubToken")?.value.trim();
    if (!token) return alert("⚠️ Masukkan GitHub Token.");

    const content = JSON.stringify(flashProducts, null, 2);

    let sha = null;
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePathFlash}?ref=${branch}`,
        { headers: { Authorization: "token " + token } }
      );
      if (res.ok) sha = (await res.json()).sha;
    } catch {}

    const resUpload = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePathFlash}`,
      {
        method: "PUT",
        headers: { Authorization: "token " + token },
        body: JSON.stringify({
          message: sha ? "Update flash.json" : "Add flash.json",
          content: btoa(unescape(encodeURIComponent(content))),
          branch,
          sha: sha || undefined
        })
      }
    );

    if (!resUpload.ok) throw new Error(await resUpload.text());

    alert("✅ Flash Sale berhasil diupload!");
  } catch (err) {
    console.error("UPLOAD FLASH ERROR:", err);
    alert("❌ Upload Flash gagal: " + err.message);
  }
}


/* ===========================
   LOAD FLASH DARI REPO
=========================== */
async function loadFlashFromRepoUnified() {
  try {
    const token = document.getElementById("githubToken")?.value.trim();
    if (!token) return alert("⚠ Masukkan GitHub Token dulu.");

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePathFlash}?ref=${branch}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data.content) throw new Error("File kosong");

    const decoded = new TextDecoder("utf-8")
      .decode(Uint8Array.from(atob(data.content), c => c.charCodeAt(0)));

    let json = JSON.parse(decoded);

    json = json.map(p => ({
      id: p.id || "flash-" + Date.now(),
      name: p.name || p.product || "",
      price_normal: Number(p.price_normal ?? p.price ?? 0),
      price_flash: Number(p.price_flash ?? p.flashPrice ?? 0),
      stock: Number(p.stock ?? 0),
      img: p.img || p.image || "",
      label: p.label || p.description || "",
      flash_until: p.flash_until || p.until || "",
      category: "flash"
    }));

    window.flashProducts = json;
    localStorage.setItem("flashProducts", JSON.stringify(json));

    renderFlashTable?.();

    alert("✅ Flash Sale berhasil dimuat!");
  } catch (err) {
    console.error("LOAD FLASH ERROR:", err);
    alert("❌ Gagal load Flash: " + err.message);
  }
}

// ================= EXPORT GLOBAL (SAFE MIGRATION) =================
window.uploadJSONSimple = uploadJSONSimple;
window.uploadFlashJSONSimple = uploadFlashJSONSimple;
window.loadFlashFromRepoUnified = loadFlashFromRepoUnified;
window.importFromRepo = importFromRepo;
