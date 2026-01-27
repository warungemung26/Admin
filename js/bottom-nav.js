// ================= SCROLL + ACTION FUNCTIONS =================

// Scroll ke input produk utama dan fokus
function scrollToProductInput() {
  const el = document.getElementById("name");
  if(el) {
    el.scrollIntoView({behavior: "smooth", block: "center"});
    el.focus();
  }
}

// Scroll ke textarea JSON dan fokus
function scrollToJSON() {
  const el = document.getElementById("jsonInput");
  if(el) {
    el.scrollIntoView({behavior: "smooth", block: "center"});
    el.focus();
  }
}

// Scroll ke input GitHub token, fokus, dan langsung import
function scrollToGitHub() {
  const el = document.getElementById("githubToken");
  if(el) {
    el.scrollIntoView({behavior: "smooth", block: "center"});
    el.focus();

    // Jalankan import dari GitHub (fungsi yang sudah ada di script utama)
    if(typeof importFromRepo === "function") {
      setTimeout(() => { importFromRepo(); }, 300); 
      // delay 300ms supaya scroll + focus selesai dulu
    }
  }
}

document.querySelectorAll('#name, #price, #customCategory, #imageName').forEach(el => {
  el.addEventListener('focus', () => {
    setTimeout(() => {
      const yOffset = -60; // tinggi navbar
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }, 350); // delay supaya keyboard muncul dulu
  });
});

function scrollToProductInput() {
  // pastikan tab 'offline' aktif
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
  
  const tab = document.querySelector(".tab[data-tab='offline']");
  const content = document.getElementById("tab-offline");
  if(tab && content){
    tab.classList.add("active");
    content.classList.add("active");
  }

  // scroll & fokus
  const el = document.getElementById("name");
  if(el){
    el.scrollIntoView({behavior: "smooth", block: "center"});
    el.focus();
  }
}
