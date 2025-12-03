<!-- sidebar.js -->
<script>
(async function(){
  const root = document.getElementById("sidebar-root");
  if(!root) return;

  try{
    const resp = await fetch("sidebar.html", {cache:"no-cache"});
    if(!resp.ok){
      root.innerHTML = "<div style='color:#fecaca;font-size:.85rem;'>Sidebar failed to load.</div>";
      return;
    }
    const html = await resp.text();
    root.innerHTML = html;

    const path = location.pathname.split("/").pop() || "index.html";
    const links = root.querySelectorAll("a[href]");
    links.forEach(a=>{
      const href = a.getAttribute("href");
      if(href === path){
        a.classList.add("active");
      }
    });
  }catch(err){
    console.error("Sidebar error", err);
    root.innerHTML = "<div style='color:#fecaca;font-size:.85rem;'>Sidebar error.</div>";
  }
})();
</script>
