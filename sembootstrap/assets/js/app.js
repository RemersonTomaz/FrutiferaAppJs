const STORAGE_KEY = "abacaxi";

const el = {
  cards: document.getElementById("cards"),
  empty: document.getElementById("empty"),

  modal: document.getElementById("modalCadastro"),
  modalClose: document.getElementById("modalClose"),
  btnAdd: document.getElementById("btnAdd"),

  form: document.getElementById("formCadastro"),
  alert: document.getElementById("formAlert"),

  nomePopular: document.getElementById("nomePopular"),
  nomeCientifico: document.getElementById("nomeCientifico"),
  producaoMedia: document.getElementById("producaoMedia"),
  dataPlantio: document.getElementById("dataPlantio"),

  btnClearAll: document.getElementById("btnLimparTudo"),

  search: document.getElementById("searchInput"),
  btnClearSearch: document.getElementById("btnLimparBusca"),

  toast: document.getElementById("toast"),
  toastMsg: document.getElementById("toastMsg"),
  toastClose: document.getElementById("toastClose"),

  kpiTotal: document.getElementById("kpiTotal"),
  kpiMedia: document.getElementById("kpiMedia"),
  kpiMaisRecente: document.getElementById("kpiMaisRecente"),
};

let toastTimer = null;

function showToast(msg){
  el.toastMsg.textContent = msg;
  el.toast.classList.add("show");
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2200);
}

function showError(msg){
  el.alert.textContent = msg;
  el.alert.classList.add("show");
}
function clearError(){
  el.alert.textContent = "";
  el.alert.classList.remove("show");
}

function escapeHTML(str){
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function parseISODate(iso){
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if(!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(Date.UTC(y, mo - 1, d));
  if(date.getUTCFullYear() !== y || date.getUTCMonth() !== (mo - 1) || date.getUTCDate() !== d) return null;
  return date;
}

function formatBR(iso){
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function todayUTC(){
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function monthsBetween(startUTC, endUTC){
  let months =
    (endUTC.getUTCFullYear() - startUTC.getUTCFullYear()) * 12 +
    (endUTC.getUTCMonth() - startUTC.getUTCMonth());
  if(endUTC.getUTCDate() < startUTC.getUTCDate()) months -= 1;
  return Math.max(0, months);
}


function loadList(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return [];
  try{
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  }catch{
    return [];
  }
}
function saveList(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}


function openModal(){
  clearError();
  el.modal.classList.add("open");
  setTimeout(() => el.nomePopular.focus(), 50);
}
function closeModal(){
  el.modal.classList.remove("open");
}
function setupModal(){
  el.btnAdd.addEventListener("click", openModal);
  el.modalClose.addEventListener("click", closeModal);

  el.modal.addEventListener("click", (e) => {
    if(e.target === el.modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && el.modal.classList.contains("open")) closeModal();
  });

  const cancel = document.getElementById("btnCancel");
  if(cancel) cancel.addEventListener("click", closeModal);
}


function updateKPIs(list){
  el.kpiTotal.textContent = String(list.length);

  const avg = list.length
    ? list.reduce((acc, i) => acc + Number(i.producaoMediaKg || 0), 0) / list.length
    : 0;
  el.kpiMedia.textContent = `${avg.toFixed(1)} kg`;

  if(list.length){
    const newest = [...list].sort((a,b) => b.id - a.id)[0];
    el.kpiMaisRecente.textContent = newest?.nomePopular || "-";
  }else{
    el.kpiMaisRecente.textContent = "-";
  }
}


function render(list, term=""){
  el.cards.innerHTML = "";
  const q = term.trim().toLowerCase();

  const filtered = q
    ? list.filter(i =>
        (i.nomePopular || "").toLowerCase().includes(q) ||
        (i.nomeCientifico || "").toLowerCase().includes(q)
      )
    : list;

  el.empty.style.display = filtered.length === 0 ? "block" : "none";

  const now = todayUTC();

  filtered.sort((a,b) => b.id - a.id).forEach(item => {
    const plantio = new Date(item.dataPlantioISO);
    const idade = monthsBetween(plantio, now);

    const div = document.createElement("div");
    div.className = "card pad plant-card";

    div.innerHTML = `
      <div class="head">
        <div>
          <h3>${escapeHTML(item.nomePopular)}</h3>
          <div class="sci">${escapeHTML(item.nomeCientifico)}</div>
        </div>
        <div class="badge">#${item.id}</div>
      </div>

      <div class="rows">
        <div class="row"><span>Produção/safra</span><strong>${Number(item.producaoMediaKg).toFixed(2)} kg</strong></div>
        <div class="row"><span>Plantio</span><strong>${formatBR(item.dataPlantioISO)}</strong></div>
        <div class="row"><span>Idade</span><strong>${idade} meses</strong></div>
      </div>

      <div class="card-footer">
        <button class="btn btn-danger" type="button" data-action="delete" data-id="${item.id}">Excluir</button>
      </div>
    `;

    el.cards.appendChild(div);
  });
}


function onCreate(e){
  e.preventDefault();
  clearError();

  const nomePopular = el.nomePopular.value.trim();
  const nomeCientifico = el.nomeCientifico.value.trim();
  const producao = el.producaoMedia.value.trim();
  const data = el.dataPlantio.value.trim(); // yyyy-mm-dd

  if(!nomePopular || !nomeCientifico || !producao || !data){
    showError("Preencha todos os campos.");
    return;
  }

  const prod = Number(producao);
  if(!Number.isFinite(prod) || prod < 0){
    showError("Produção precisa ser um número válido (>= 0).");
    return;
  }

  const date = parseISODate(data);
  if(!date){
    showError("Escolha uma data válida.");
    return;
  }

  if(date > todayUTC()){
    showError("A data do plantio não pode ser no futuro.");
    return;
  }

  const list = loadList();
  list.push({
    id: Date.now(),
    nomePopular,
    nomeCientifico,
    producaoMediaKg: prod,
    dataPlantioISO: date.toISOString()
  });

  saveList(list);
  el.form.reset();
  closeModal();

  showToast("Salvo!");
  updateKPIs(list);
  render(list, el.search.value);
}

function onDelete(id){
  const list = loadList().filter(i => i.id !== id);
  saveList(list);
  showToast("Removido.");
  updateKPIs(list);
  render(list, el.search.value);
}

function onClearAll(){
  const ok = confirm("Apagar todos os cadastros?");
  if(!ok) return;

  localStorage.removeItem(STORAGE_KEY);
  showToast("Tudo limpo.");
  const list = [];
  updateKPIs(list);
  render(list, el.search.value);
}

function init(){
  setupModal();

  el.form.addEventListener("submit", onCreate);

  el.cards.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if(!btn) return;
    if(btn.dataset.action === "delete") onDelete(Number(btn.dataset.id));
  });

  el.btnClearAll.addEventListener("click", onClearAll);

  el.search.addEventListener("input", () => {
    render(loadList(), el.search.value);
  });

  el.btnClearSearch.addEventListener("click", () => {
    el.search.value = "";
    render(loadList(), "");
  });

  el.toastClose.addEventListener("click", () => el.toast.classList.remove("show"));

  const list = loadList();
  updateKPIs(list);
  render(list);
}

document.addEventListener("DOMContentLoaded", init);
