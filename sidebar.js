// sidebar.js
(function () {
  const root = document.getElementById("sidebar-root");
  if (!root) return;

  const links = [
    { href: "index.html",               icon: "📊", label: "Main Dashboard" },
    { href: "software-dashboard.html",  icon: "💻", label: "Software Dashboard" },
    { href: "software-licenses.html",   icon: "🔑", label: "Licenses & Compliance" },
    { href: "inventory-list.html",      icon: "📋", label: "Inventory List" },
    { href: "scan.html",                icon: "📱", label: "QR Scan Device" },
    { href: "admin-console.html",       icon: "⚙️", label: "Admin Console" },
    { href: "export.html",              icon: "⬇️", label: "Export" },
    { href: "audits.html",              icon: "🕒", label: "Audits" },
    { href: "login.html",               icon: "🚪", label: "Logout" }
  ];

  // Current file name, e.g. "software-dashboard.html"
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  const navHtml = `
    <nav class="nav">
      ${links.map(link => {
        const isActive = current === link.href.toLowerCase();
        return `
          <a href="${link.href}" class="${isActive ? "active" : ""}">
            <span class="icon">${link.icon}</span>
            <span>${link.label}</span>
          </a>`;
      }).join("")}
    </nav>
  `;

  root.innerHTML = navHtml;
})();
