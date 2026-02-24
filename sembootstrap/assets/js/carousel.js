(function(){
  const root = document.querySelector("[data-carousel]");
  if(!root) return;

  const track = root.querySelector(".carousel-track");
  const slides = Array.from(root.querySelectorAll(".slide"));
  const prev = root.querySelector("[data-prev]");
  const next = root.querySelector("[data-next]");
  const dotsWrap = root.querySelector(".carousel-dots");

  let idx = 0;
  let timer = null;

  function go(i){
    idx = (i + slides.length) % slides.length;
    track.style.transform = `translateX(${-idx * 100}%)`;
    if(dotsWrap){
      dotsWrap.querySelectorAll("button").forEach((b, n) => b.classList.toggle("active", n === idx));
    }
  }

  function start(){
    stop();
    timer = setInterval(() => go(idx + 1), 4500);
  }
  function stop(){
    if(timer) clearInterval(timer);
    timer = null;
  }

  if(dotsWrap){
    dotsWrap.innerHTML = slides.map((_, i) => `<button type="button" aria-label="Ir para slide ${i+1}" class="${i===0?'active':''}" data-dot="${i}"></button>`).join("");
    dotsWrap.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-dot]");
      if(!b) return;
      go(Number(b.dataset.dot));
      start();
    });
  }

  prev?.addEventListener("click", () => { go(idx - 1); start(); });
  next?.addEventListener("click", () => { go(idx + 1); start(); });

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);

  root.addEventListener("keydown", (e) => {
    if(e.key === "ArrowLeft") { go(idx - 1); start(); }
    if(e.key === "ArrowRight") { go(idx + 1); start(); }
  });

  go(0);
  start();
})();