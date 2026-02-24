const STORAGE_KEY = "frutiferas";

const el = {
  cardsContainer: document.getElementById("cardsContainer"),
  emptyState: document.getElementById("emptyState"),

  formCadastro: document.getElementById("formCadastro"),
  formAlert: document.getElementById("formAlert"),

  nomePopular: document.getElementById("nomePopular"),
  nomeCientifico: document.getElementById("nomeCientifico"),
  producaoMedia: document.getElementById("producaoMedia"),
  dataPlantio: document.getElementById("dataPlantio"),

  btnLimparTudo: document.getElementById("btnLimparTudo"),
  searchInput: document.getElementById("searchInput"),
  btnLimparBusca: document.getElementById("btnLimparBusca"),

  toastEl: document.getElementById("appToast"),
  toastBody: document.getElementById("toastBody")
};

let toast;

/* ---- helpers basics  ---- */

function showToast(msg){
  if(!toast) toast = new bootstrap.Toast(el.toastEl, { delay: 2000 });
  el.toastBody.textContent = msg;
  toast.show();
}

function showError(msg){
  el.formAlert.textContent = msg;
  el.formAlert.classList.remove("d-none");
}

function clearError(){
  el.formAlert.textContent = "";
  el.formAlert.classList.add("d-none");
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

/* ---- armazenamento ---- */

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

/* ---- html  ---- */

function render(list, term=""){
  el.cardsContainer.innerHTML = "";
  const q = term.trim().toLowerCase();

  const filtered = q
    ? list.filter(i =>
        (i.nomePopular || "").toLowerCase().includes(q) ||
        (i.nomeCientifico || "").toLowerCase().includes(q)
      )
    : list;

  if(filtered.length === 0) el.emptyState.classList.remove("d-none");
  else el.emptyState.classList.add("d-none");

  const now = todayUTC();

  filtered.sort((a,b) => b.id - a.id).forEach(item => {
    const plantio = new Date(item.dataPlantioISO);
    const idade = monthsBetween(plantio, now);

    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    col.innerHTML = `
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div>
              <h5 class="fw-bold mb-1">${escapeHTML(item.nomePopular)}</h5>
              <div class="text-muted small">${escapeHTML(item.nomeCientifico)}</div>
            </div>
            <span class="badge text-bg-secondary">#${item.id}</span>
          </div>

          <hr>

          <ul class="list-group list-group-flush">
            <li class="list-group-item px-0 d-flex justify-content-between">
              <span class="text-muted">Produção/safra</span>
              <span class="fw-semibold">${Number(item.producaoMediaKg).toFixed(2)} Kg</span>
            </li>
            <li class="list-group-item px-0 d-flex justify-content-between">
              <span class="text-muted">Plantio</span>
              <span class="fw-semibold">${formatBR(item.dataPlantioISO)}</span>
            </li>
            <li class="list-group-item px-0 d-flex justify-content-between">
              <span class="text-muted">Idade</span>
              <span class="fw-semibold">${idade} meses</span>
            </li>
          </ul>
        </div>

        <div class="card-footer bg-white border-0 pt-0">
          <button class="btn btn-outline-danger w-100" data-action="delete" data-id="${item.id}" type="button">
            Excluir
          </button>
        </div>
      </div>
    `;

    el.cardsContainer.appendChild(col);
  });
}

/* ---- ações de erro ---- */

function onCreate(e){
  e.preventDefault();
  clearError();

  const nomePopular = el.nomePopular.value.trim();
  const nomeCientifico = el.nomeCientifico.value.trim();
  const producao = el.producaoMedia.value.trim();
  const data = el.dataPlantio.value.trim(); // agora vem yyyy-mm-dd

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

  const modalEl = document.getElementById("modalCadastro");
  bootstrap.Modal.getInstance(modalEl).hide();

  el.formCadastro.reset();
  showToast("Salvo!");
  render(list, el.searchInput.value);
}

function onDelete(id){
  const list = loadList().filter(i => i.id !== id);
  saveList(list);
  showToast("Removido.");
  render(list, el.searchInput.value);
}

function onClear(){
  const ok = confirm("Apagar todos os cadastros?");
  if(!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  showToast("Tudo limpo.");
  render([], el.searchInput.value);
}

/* ---- init ---- */

function init(){
  toast = new bootstrap.Toast(el.toastEl, { delay: 2000 });

  render(loadList());

  el.formCadastro.addEventListener("submit", onCreate);

  el.cardsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if(!btn) return;
    if(btn.dataset.action === "delete") onDelete(Number(btn.dataset.id));
  });

  el.btnLimparTudo.addEventListener("click", onClear);

  el.searchInput.addEventListener("input", () => {
    render(loadList(), el.searchInput.value);
  });

  el.btnLimparBusca.addEventListener("click", () => {
    el.searchInput.value = "";
    render(loadList(), "");
  });

  document.getElementById("modalCadastro").addEventListener("show.bs.modal", clearError);
}

document.addEventListener("DOMContentLoaded", init);
