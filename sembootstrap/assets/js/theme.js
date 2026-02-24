(function(){
  const KEY = "frutifera_theme_mode";
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");

  function setMode(mode){
    if(mode === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    localStorage.setItem(KEY, mode);
    if(btn) btn.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
  }

  const saved = localStorage.getItem(KEY);
  if(saved === "dark") setMode("dark");
  else setMode("light");

  if(btn){
    btn.addEventListener("click", () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      setMode(isDark ? "light" : "dark");
    });
  }
})();