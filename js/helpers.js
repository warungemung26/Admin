/* ===========================
   HELPERS
=========================== */

/* ===== BUAT SLUG ===== */
function makeSlug(text = '') {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/* ===== GENERATE ID ===== */
function generateId() {
  return Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);
}

/* ===== SAVE LOCAL ===== */
function saveLocal() {
  localStorage.setItem('products', JSON.stringify(products));
}

/* ===== SANITIZE FILE ===== */
function sanitizeFileName(name) {
  return String(name || '').replace(/[:\/\\?%*|"<>]/g, '').trim();
}

/* ===== ESCAPE TEXT ===== */
function escapeText(s) { 
  return String(s == null ? '' : s); 
}

/* ==============================================
   LOCAL STORAGE
============================================== */
function saveLocal() {
  localStorage.setItem("products", JSON.stringify(products));
}

function calcJSONInfo(jsonText){
  try{
    return {
      count: JSON.parse(jsonText).length,
      size: new Blob([jsonText]).size
    };
  }catch{
    return {count:0,size:0};
  }
}


function sanitizeFileName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
}
