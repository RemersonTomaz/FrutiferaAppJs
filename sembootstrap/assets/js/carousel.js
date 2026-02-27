(function(){
  // elemento principal do carrossel sendo pego
  const root = document.querySelector("[data-carousel]");

  // se não existir carrossel, o código para nesse trecho
  if(!root) return;


// aqui eu pego a div que contem todos os slides
  const track = root.querySelector(".carousel-track");
// aqui todos os slides são transformados em array
  const slides = Array.from(root.querySelectorAll(".slide"));
// botão de voltar
  const prev = root.querySelector("[data-prev]");
// botão de avnçar
  const next = root.querySelector("[data-next]");
// local dos pontinhos de clicar no carrossel
  const dotsWrap = root.querySelector(".carousel-dots");

  // indice do slide começa no 0
  let idx = 0;
  // variável que controla o tempo que é automatico
  let timer = null;

   // essa função faz o carrossel ir para um slide específico
  function go(i){
    // nessa parte eu faço um cálculo para não sair do limite, se passar do último, volta para o primeiro
    idx = (i + slides.length) % slides.length;

   //aqui eu movo o track usando translateX, cada slide ocupa 100% da largura ( mais por questão de css mesmo)

    track.style.transform = `translateX(${-idx * 100}%)`;
    // se existir bolinhas que são (dots), atualizo qual está ativa
    if(dotsWrap){
      dotsWrap.querySelectorAll("button").forEach((b, n) => b.classList.toggle("active", n === idx));
    }
  }

  //função que inicia o movimento do carrossel
  function start(){
    // qualquer timer existente é parado
    stop();
    // agora começo um timer que troca o slide a cada 4.5 segundos, aqui eu posso trocar o tempo de troca do slide
    timer = setInterval(() => go(idx + 1), 4500);
  }
  //aqui o movimento automatico para, basicamente é a função que freia ele 
  function stop(){
    //se existir timer, ele é limpo
    if(timer) clearInterval(timer);
    //e depois é setado valor null que é nulo
    timer = null;
  }

  // se as bolinhas anteriormente comentadas como dots existirem
  if(dotsWrap){
    //aqui as bolinhas são criadas conforme os slides, caso existam 4 imagens, 4 bolinhas, assim por diante
    dotsWrap.innerHTML = slides.map((_, i) => `<button type="button" aria-label="Ir para slide ${i+1}" class="${i===0?'active':''}" data-dot="${i}"></button>`).join("");
    // aqui é um evento de clique nas bolinhas
    dotsWrap.addEventListener("click", (e) => {
      // aqui eu pego a bolinha clicada
      const b = e.target.closest("button[data-dot]");
      if(!b) return;
      // e vou para a bolinha correspondente
      go(Number(b.dataset.dot));
      // e o movimento do carrosel é recomeçado
      start();
    });
  }

  //se o botão anterior existir, o evento é adicionado
  prev?.addEventListener("click", () => { go(idx - 1); start(); });
  // se o proximo botão existir, o evento  é adicionado
  next?.addEventListener("click", () => { go(idx + 1); start(); });
// quando o mouse é colocado em cima o carrossel para
  root.addEventListener("mouseenter", stop);
// quando o mouse sai, o carrossel continua
  root.addEventListener("mouseleave", start);

  //aqui adiciona um controle pelo teclado
  root.addEventListener("keydown", (e) => {
    //seta para esquerda para voltar
    if(e.key === "ArrowLeft") { go(idx - 1); start(); }
    // seta para a direita para avançar
    if(e.key === "ArrowRight") { go(idx + 1); start(); }
  });
// começamos no primeiro slide
  go(0);

// movimento iniciado
  start();
})();