/* ===========================
   TAB SWITCH + NAV SWITCH
=========================== */

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {

      // reset active
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

      // aktifkan tab
      tab.classList.add("active");
      const target = document.getElementById("tab-" + tab.dataset.tab);
      if (target) target.classList.add("active");

      // switch bottom nav
      const navNormal = document.getElementById("bottom-nav-normal");
      const navFlash  = document.getElementById("bottom-nav-flash");

      if (!navNormal || !navFlash) return;

      if (tab.dataset.tab === "offline") {
        navNormal.style.display = "flex";
        navFlash.style.display = "none";
      } 
      else if (tab.dataset.tab === "flash") {
        navNormal.style.display = "none";
        navFlash.style.display = "flex";
      } 
      else {
        navNormal.style.display = "none";
        navFlash.style.display = "none";
      }
    });
  });
});

// ===== CATEGORY OPTIONS =====
function renderCategoryOptions() {
  const sel = document.getElementById('filterCategory');
  if (!sel) return;
  const currentValue = sel.value;
  const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
  sel.innerHTML = '<option value="">Semua</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
  sel.value = currentValue;
}

// ===== FILTER & SORT =====
function buildFilteredView() {
  const cat = document.getElementById('filterCategory')?.value || '';
  const sort = document.getElementById('sortOption')?.value || '';
  const search = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';

  let view = [...products];
  if (cat) view = view.filter(p => p.category === cat);
  if (search) view = view.filter(p => p.name.toLowerCase().includes(search));

  if (sort === 'nameAsc') view.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'nameDesc') view.sort((a, b) => b.name.localeCompare(a.name));
  else if (sort === 'priceLow') view.sort((a, b) => Number(a.price) - Number(b.price));
  else if (sort === 'priceHigh') view.sort((a, b) => Number(b.price) - Number(a.price));

  filtered = view;
}

// ===== FILTER EVENTS =====
function applyFilter() { renderTable(); }
function resetFilter() {
  document.getElementById('filterCategory').value = '';
  document.getElementById('sortOption').value = '';
  document.getElementById('searchInput').value = '';
  applyFilter();
}

document.getElementById('searchInput')?.addEventListener('input', applyFilter);
document.getElementById('filterCategory')?.addEventListener('change', applyFilter);
document.getElementById('sortOption')?.addEventListener('change', applyFilter);

function setWorkflow(type){
  activeWorkflow = type;
  updateWorkflowUI();
}

const workflow = document.querySelector(".workflow-wrap");

if (tab.dataset.tab === "offline") {
  navNormal.style.display = "flex";
  navFlash.style.display = "none";
  if (workflow) workflow.style.display = "block";
} 
else if (tab.dataset.tab === "flash") {
  navNormal.style.display = "none";
  navFlash.style.display = "flex";
  if (workflow) workflow.style.display = "none";
} 
else {
  navNormal.style.display = "none";
  navFlash.style.display = "none";
  if (workflow) workflow.style.display = "none";
}


function updateWorkflowUI(){
  const state = workflowState[activeWorkflow];
  const bar = document.querySelectorAll(".workflow-bar span[data-step]");

  bar.forEach(el=>{
    const step = el.dataset.step;
    el.classList.remove("active","locked");

    if(step === "import"){
      el.classList.add("active");
    }

    if(step === "generate"){
      if(state.imported) el.classList.add("active");
      else el.classList.add("locked");
    }

    if(step === "publish"){
      if(state.generated) el.classList.add("active");
      else el.classList.add("locked");
    }

    if(step === "backup"){
      if(state.published) el.classList.add("active");
      else el.classList.add("locked");
    }
  });
}



function toggleTopMenu(){
  const m = document.getElementById('topMenu');
  m.classList.toggle('hidden');
}

function switchTab(name){
  document.querySelectorAll('.tab-content').forEach(t=>{
    t.classList.remove('active');
  });

  const el = document.getElementById('tab-' + name);
  if(el) el.classList.add('active');

  document.getElementById('topMenu').classList.add('hidden');
}