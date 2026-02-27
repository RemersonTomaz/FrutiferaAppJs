const STORAGE_KEY = "abacaxi";
  //nome da chave que guarda as informações no navegador exemplo nome abacaxi, valor dark, para o tema ser salvo como escuro



  // aqui é criado um objeto para guardar todas as funções do html, assim eu não irei precisar usar getelementbyid direto
const el = {
  cards: document.getElementById("cards"),// aqui é onde os cards serão mostrados
  empty: document.getElementById("empty"),// aqui é a mensagem de vazio

  modal: document.getElementById("modalCadastro"),// aqui fica o modal de cadastro
  modalClose: document.getElementById("modalClose"),//botão de fechar o modal
  btnAdd: document.getElementById("btnAdd"),//botão de abrir o modal

  form: document.getElementById("formCadastro"),// formulário
  alert: document.getElementById("formAlert"),//alerta de erro do formulario

  nomePopular: document.getElementById("nomePopular"),//nome popular da fruta
  nomeCientifico: document.getElementById("nomeCientifico"),// nome cientifico da fruta
  producaoMedia: document.getElementById("producaoMedia"),//produção media da fruta
  dataPlantio: document.getElementById("dataPlantio"),// data de plantio da fruta
,0




  btnClearAll: document.getElementById("btnLimparTudo"),// botão  de limpar tudo = apagar todas as frutas salvas

  search: document.getElementById("searchInput"),// barra de pesquisa
  btnClearSearch: document.getElementById("btnLimparBusca"),// botão para limpar a barra de pesquisa

  toast: document.getElementById("toast"),// aqui é a caixinha que fica no canto
  toastMsg: document.getElementById("toastMsg"),// aqui é onde fica o texto de ok!
  toastClose: document.getElementById("toastClose"),//X botão de fechar

  kpiTotal: document.getElementById("kpiTotal"),// total de frutas
  kpiMedia: document.getElementById("kpiMedia"),// media das frutas
  kpiMaisRecente: document.getElementById("kpiMaisRecente"),//  ultima fruta colocada
};

let toastTimer = null; // tempo do toast definido como null

// função de ver a mensagem toast
function showToast(msg){
  el.toastMsg.textContent = msg; // aqui é onde coloca a mensagem
  el.toast.classList.add("show");// aqui mostra na tela, puramente html ate então
  if(toastTimer) clearTimeout(toastTimer);// se tiver um timer é cancelado
  toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2200);// aqui é adicionado um timer para que apos 2200 milisegundos ou 2.2 segundos ele suma
}

// função de mostrar erro na tela
function showError(msg){
  // aqui é a mensagem do erro
  el.alert.textContent = msg;
  //aqui basicamente é caso aconteça um erro ele manda pro HTML o show para habilitar
  el.alert.classList.add("show");
}

// basicamente ele remove a classe SHOW do html/css para fazer o erro sumir
function clearError(){
  // aqui ele limpa o alerta que anteriormente era uma mensagem
  el.alert.textContent = "";
  // aqui é onde ele remove a classe show
  el.alert.classList.remove("show");
}

//essa função serve para limpar o texto antes de jogar no html, ele troca os caracteres da esquerda pelos oque estão na direita
// exemplo :   < vira &lt, mas o porque? isso é justamente porque no html alguns caracteres ficam bugados e aparecem como codigo e não como escrita

function escapeHTML(str){
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
    // basicamente serve como uma substituição, para que o html não fique com os caracteres bugados
}

//função da data
function parseISODate(iso){
  
//essa função tenta validar e converter uma data no formato de ano, mes e dia : yyyy/ mm / dd :  years months days

//parte do codigo que aceita respectivamente 4 numeros 2 numeros 2 numeros  ( ano, mes e dia)
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());

  //se a data estiver errada, basicamente não bater com o padrão, ela retorna null
  if(!m) return null;
  //constante  que pega o ano 
  const y = Number(m[1]);
  //constante que pega o mes
  const mo = Number(m[2]);
  //constante que pega o dia
  const d = Number(m[3]);
  //cria a data em utc para não dar problema de fuso horario
  const date = new Date(Date.UTC(y, mo - 1, d));
  //checar para se certificar de que a data realmente existe, como o dia 31 de fevereiro que não existe
  if(date.getUTCFullYear() !== y || date.getUTCMonth() !== (mo - 1) || date.getUTCDate() !== d) return null;
  return date;
}


//função que transforma uma data iso em formato brasileiro dd/mm/aaaa dia mes ano

function formatBR(iso){

  const d = new Date(iso);
  //pega um numero unico e garante que vira 2, exemplo 2 vira 02
  const day = String(d.getUTCDate()).padStart(2, "0");
    // pega o mes e soma +1, porque o mes começa no 0
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  // aqui pega o ano, não é segredo já que é o unico que sobrou 
  const year = d.getUTCFullYear();
  //devolve no formato br ou famosamente conhecido brasil ou brazilian, vai que o caba é gringo
  return `${day}/${month}/${year}`;
}

//pega a data de hoje em utc sem as horas, somente ano mes e dia

function todayUTC(){
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

//calcula quantos meses se passaram durante as datas

function monthsBetween(startUTC, endUTC){
  let months =
    (endUTC.getUTCFullYear() - startUTC.getUTCFullYear()) * 12 +
    (endUTC.getUTCMonth() - startUTC.getUTCMonth());
    // se o mes final ainda não chegou, remove um mes
  if(endUTC.getUTCDate() < startUTC.getUTCDate()) months -= 1;
  // aqui não deixa ficar negativo
  return Math.max(0, months);
}



// aqui carrega a lista de plantas salvas no local storage
function loadList(){
  // pega a parte do texto bruto salvo, ele geralmente vem como string
  const raw = localStorage.getItem(STORAGE_KEY);
  // se não existir nada salvo retorna a lista vazia
  if(!raw) return [];
  
  try{
    const parsed = JSON.parse(raw);
// aqui tenta converter o json salvo para um array/objeto

// aqui se for array retorna, se não for, retorna vazio
    return Array.isArray(parsed) ? parsed : [];
  }catch{
    //se der erro no json retorna vazio
    return [];
  }
}

//salva lista no local storage e converte para json
function saveList(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}


// modal de cadastro

function openModal(){
  // limpa qualqr erro que estava aparecendo
  clearError();

  // função de abrir o modal
  el.modal.classList.add("open");
  // apos um tempo determinado, foca no primeiro campo
  setTimeout(() => el.nomePopular.focus(), 50);
}

// função de fechar o modal
function closeModal(){

  // remove a classe open, que faz com que feche
  el.modal.classList.remove("open");
}

// aqui fica tudo o que faz o modal abrir e fechar
function setupModal(){
  //clicar no botão abre o modal
  el.btnAdd.addEventListener("click", openModal);
  // clicar no botão fecha o modal
  el.modalClose.addEventListener("click", closeModal);

  // se clicar no fundo sem nada fecha o modal

  el.modal.addEventListener("click", (e) => {
    if(e.target === el.modal) closeModal();
  });

  // se apertar ESC o modal fecha
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && el.modal.classList.contains("open")) closeModal();
  });

  // botão cancelar também fecha o modal
  const cancel = document.getElementById("btnCancel");
  if(cancel) cancel.addEventListener("click", closeModal);
}


// função para atualizar o kpi, os kpis são as metricas
function updateKPIs(list){

  // mostra o total de itens cadastrados
  el.kpiTotal.textContent = String(list.length);


  // media da produção é calculada aqui
  const avg = list.length
    ? list.reduce((acc, i) => acc + Number(i.producaoMediaKg || 0), 0) / list.length
    : 0;
  el.kpiMedia.textContent = `${avg.toFixed(1)} kg`;


  // se tiver pelo menos um item, mostra o mais recente
  if(list.length){

    // aqui a lista é copiada ordenada por id decrescente e o primeiro é pego, pegado.
    const newest = [...list].sort((a,b) => b.id - a.id)[0];
    // coloca o nome popular se existir
    el.kpiMaisRecente.textContent = newest?.nomePopular || "-";

    // se não existir vira vazio mesmo, no caso -
  }else{
    el.kpiMaisRecente.textContent = "-";
  }
}

// aqui é uma função de render para desenhar os cards, puramente html
//term é a palavra para a busca ou alvo ( vou chamar carinhosamente de alvo )
function render(list, term=""){

  // contariner dos cars vai ser limpo com esse ""
  el.cards.innerHTML = "";
  // alvo de busca será em minusculo
  const q = term.trim().toLowerCase();
  
  //se existir uma busca, é filtrado por nome popular ou cientifico
  const filtered = q
    ? list.filter(i =>
        (i.nomePopular || "").toLowerCase().includes(q) ||
        (i.nomeCientifico || "").toLowerCase().includes(q)
      )
    : list;
    // se não tiver nada, aparece a mensagem de vazio

  el.empty.style.display = filtered.length === 0 ? "block" : "none";

  // data de hoje para calcular a idade
  const now = todayUTC();


  //ordena do mais recente para o mais antigo e cria os cards
  filtered.sort((a,b) => b.id - a.id).forEach(item => {

    // transforma a data do plantio em date
    const plantio = new Date(item.dataPlantioISO);
    // calcula a idade em meses
    const idade = monthsBetween(plantio, now);
// cria uma div (html)
    const div = document.createElement("div");
    div.className = "card pad plant-card";

    // aqui se monta um html
    //como sempre, utilizamos de escapeHTML para caso fique algo errado digitado ou alguem digitar algo miraculosamente errado

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
// aqui adiciona o card na tela
    el.cards.appendChild(div);
  });
}

// função que é chamada quando enviamos o formulário de cadastro
function onCreate(e){
  // impede a pagina de recarregar
  e.preventDefault();

  // limpa os erros
  clearError();

  // pega os valores dos inputs e tira os espaços extras
  const nomePopular = el.nomePopular.value.trim();
  const nomeCientifico = el.nomeCientifico.value.trim();
  const producao = el.producaoMedia.value.trim();
  const data = el.dataPlantio.value.trim(); // yyyy-mm-dd

  // se faltou algum local para digitar, mostra o erro de falta preencher

  if(!nomePopular || !nomeCientifico || !producao || !data){
    showError("Preencha todos os campos.");
    return;
  }

  //valida se o numero é ou não negativo

  const prod = Number(producao);
  if(!Number.isFinite(prod) || prod < 0){
    showError("Produção precisa ser um número válido (>= 0).");
    return;
  }

  // checa se a data é valida 

  const date = parseISODate(data);
  if(!date){
    showError("Escolha uma data válida.");
    return;
  }

//checa se a data é valida ( não pode por data futura)

  if(date > todayUTC()){
    showError("A data do plantio não pode ser no futuro.");
    return;
  }

  // lista atual carregada
  const list = loadList();
  // item novo adicionado
  list.push({
    id: Date.now(), // id unico que é baseado no horario atual
    nomePopular,
    nomeCientifico,
    producaoMediaKg: prod,
    dataPlantioISO: date.toISOString()
  });

  //salvo no local storage

  saveList(list);

  // limpa o formulario
  el.form.reset();

  // fecha o modal
  closeModal();

  // mostra a mensagem de salvo
  showToast("Salvo!");

  // atualiza os kpi
  updateKPIs(list);

//redesenha os cards
  render(list, el.search.value);
}

// função para excluir um cadastro por id
function onDelete(id){
  // pega a lista e remove o item que contiver o id colocado
  const list = loadList().filter(i => i.id !== id);
  //salva a lista
  saveList(list);
  //aparece a mensagem
  showToast("Removido.");
  // atualiza os kpi
  updateKPIs(list);
  // novamente atualiza o render
  render(list, el.search.value);
}

// função de apagar todos os cadastros
function onClearAll(){
  // perguntar antes né, vai que é sem querer que apaga
  const ok = confirm("Apagar todos os cadastros?");
// se não der ok, cancela
  if(!ok) return;

  // remove do loca storage
  localStorage.removeItem(STORAGE_KEY);
  // mensagem de deu certo
  showToast("Tudo limpo.");

  //atualiza o kpi e  o render novamente
  const list = [];
  updateKPIs(list);
  render(list, el.search.value);
}


//função que inicia o site quando abre
function init(){
  // configura os  eventos do modal
  setupModal();


// quando abrir o form chama o oncreate
  el.form.addEventListener("submit", onCreate);

  //evento no container dos cards ele delega o evento
  el.cards.addEventListener("click", (e) => {

    // procura o botão mais proximo com data action
    const btn = e.target.closest("button[data-action]");
    if(!btn) return;
    //se a ação for de delete deletar chama o ondelete com o id do botão
    if(btn.dataset.action === "delete") onDelete(Number(btn.dataset.id));
  });


// botão para apagar tudo
  el.btnClearAll.addEventListener("click", onClearAll);


  //quando digita na busca, atualiza os cards filtrando entre eles
  el.search.addEventListener("input", () => {
    render(loadList(), el.search.value);
  });
  
// botão que limpa a busca
  el.btnClearSearch.addEventListener("click", () => {
    el.search.value = "";
    render(loadList(), "");
  });


// botão de fechar o toast manualmente ( mensagem la)
  el.toastClose.addEventListener("click", () => el.toast.classList.remove("show"));


// quando abre o site carrega a lista salva e mostra na tela
  const list = loadList();
  updateKPIs(list);
  render(list);
}
// tudo só é iniciado pós carregamento no html
document.addEventListener("DOMContentLoaded", init);
