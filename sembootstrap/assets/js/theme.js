(function(){
  const KEY = "frutifera_theme_mode";
  //nome da chave que guarda as informações no navegador exemplo nome frutifera_theme_mode, valor dark, para o tema ser salvo como escuro
  const root = document.documentElement;
  // aqui se pega o elemento raiz do HTML, que é o <html>

  const btn = document.getElementById("themeToggle");
  // aqui fica o ID do botão do toggle dark mode


  // essa função faz o seguinte, set mode, basicamente ela diz que se o botão estiver pressionado, ele adiciona data-theme="dark" no HTML, então no CSS vira o tema escuro 
  function setMode(mode){
    if(mode === "dark") root.setAttribute("data-theme", "dark");
    // aqui diz que se não for o tema escuro, ele remove ou continua o tema claro como anteriormente 
    else root.removeAttribute("data-theme");
    // nesse local storage fica salvo o tema escolhido, como uma váriavel, basicamente como um true or false
    // aqui também "checa" o atributo aria-pressed, que é basicamente  o estado de alternância do botão, que informa se o botão  está em true ou false
    localStorage.setItem(KEY, mode);
    if(btn) btn.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
  }


  // mesma coisa, salvo o tema escolhido, se for dark, adiciona o setmode"dark" que deixa escuro se for light " light "  
  const saved = localStorage.getItem(KEY);
  if(saved === "dark") setMode("dark");
  else setMode("light");

  // quando clicar no botão, executa a função do tema escuro
  if(btn){
    btn.addEventListener("click", () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      //se for claro fica escuro, se for escuro fica claro pos o clique, justamente pela variável anterior dark e light
      setMode(isDark ? "light" : "dark");
    });
  }
})();