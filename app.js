/**
 * Technology Server – Dashboard
 * @module app
 * GitHub Pages compatible (rutas relativas)
 */

(() => {
  "use strict";

  /* ---------- CONFIG ---------- */
  const CONFIG = {
    API_THINGSPEAK: "https://api.thingspeak.com/channels/3034575/feeds.json?results=10&api_key=MW7EED9XDLDQCQL7",
    USERS: {
      admin: "user",
      carmen: "Carmen456",
      andreina: "Andre789",
      miguel: "Miguel012",
      frandy: "Frandy345",
      reimy: "Reimy678",
    },
    LS_KEY: "ts_dashboard",
  };

  const CURRENT_VIEW_KEY = "ts_current_view";

  const state = {
    user: null,
    dark: localStorage.getItem("dark") === "true",
    sidebarCollapsed: localStorage.getItem("sidebar") === "true",
    charts: {},
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const saveLS = (key, val) => localStorage.setItem(key, JSON.stringify(val));
  const loadLS = (key, def = null) => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? def;
    } catch {
      return def;
    }
  };

  /* ---------- DATOS ---------- */
  const dataStore = loadLS(CONFIG.LS_KEY) || {
    usuarios: [
      {
        id: 1,
        nombre: "Administrador",
        rol: "Admin",
        correo: "admin@technologyserver.com",
        info: "Usuario principal (acceso total)",
        archivos: { "info.txt": "Información del administrador" },
        imagen: "",
      },
      {
        id: 2,
        nombre: "Carmen",
        rol: "Usuario",
        correo: "carmen@technologyserver.com",
        info: "Usuario Carmen (acceso restringido)",
        archivos: { "carmen.txt": "Notas de Carmen" },
        imagen: "https://via.placeholder.com/100",
      },
      {
        id: 3,
        nombre: "Andreina",
        rol: "Usuario",
        correo: "andreina@technologyserver.com",
        info: "Usuario Andreina (acceso restringido)",
        archivos: { "andreina.txt": "Notas de Andreina" },
        imagen: "https://via.placeholder.com/100",
      },
      {
        id: 4,
        nombre: "Miguel",
        rol: "Usuario",
        correo: "miguel@technologyserver.com",
        info: "Usuario Miguel (acceso restringido)",
        archivos: { "miguel.txt": "Notas de Miguel" },
        imagen: "https://via.placeholder.com/100",
      },
      {
        id: 5,
        nombre: "Frandy",
        rol: "Usuario",
        correo: "frandy@technologyserver.com",
        info: "Usuario Frandy (acceso restringido)",
        archivos: { "frandy.txt": "Notas de Frandy" },
        imagen: "https://via.placeholder.com/100",
      },
      {
        id: 6,
        nombre: "Reimy",
        rol: "Usuario",
        correo: "reimy@technologyserver.com",
        info: "Usuario Reimy (acceso restringido)",
        archivos: { "reimy.txt": "Notas de Reimy" },
        imagen: "https://via.placeholder.com/100",
      },
    ],
    bitacora: [],
    chip: [],
    data: [],
    "datos-partners": [],
    documentos: [],
    equipos: [],
    mantenimientos: [],
    security: [],
    monimar: [],
    registros: [],
  };

  /* ---------- LOGIN ---------- */
  $("#login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const user = $("#username").value.trim();
    const pass = $("#password").value;
    if (CONFIG.USERS[user] && CONFIG.USERS[user] === pass) {
      state.user = user;
      saveLS("user", user);
      $("#login-container").classList.add("d-none");
      $("#dashboard-container").classList.remove("d-none");
      $("#sidebar-username").textContent = user;
      filtrarMenu();
      loadView(loadLS(CURRENT_VIEW_KEY) || "dashboard");
    } else {
      $("#login-error").classList.remove("d-none");
    }
  });

  $("#logout-btn").addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem(CURRENT_VIEW_KEY);
    location.reload();
  });

  /* ---------- FILTRAR MENÚ ---------- */
  function filtrarMenu() {
    const PERMISOS = {
      admin: ["dashboard","usuarios","bitacora","chip","data","datos-partners","documentos","equipos","mantenimientos","security","registro"],
      carmen: ["dashboard","usuarios","bitacora","chip","data","datos-partners","documentos","equipos","mantenimientos","security","registro"],
      andreina: ["dashboard","registro"],
      miguel: ["dashboard","registro"],
      frandy: ["dashboard","registro"],
      reimy: ["dashboard","registro"],
    };

    const permitidas = PERMISOS[state.user] || [];
    const items = [
      { id: "dashboard", icon: "dashboard", label: "Inicio" },
      { id: "usuarios", icon: "account_circle", label: "Usuarios" },
      { id: "bitacora", icon: "book", label: "Bitácora" },
      { id: "chip", icon: "sim_card", label: "Chips" },
      { id: "data", icon: "gps_fixed", label: "Datos Satelitales" },
      { id: "datos-partners", icon: "send", label: "Datos Reenviados" },
      { id: "documentos", icon: "description", label: "Documentos" },
      { id: "equipos", icon: "devices", label: "Equipos" },
      { id: "mantenimientos", icon: "build", label: "Mantenimientos" },
      { id: "security", icon: "construction", label: "Servicios" },
      { id: "registro", icon: "water", label: "Registros" },
    ];

    const filtradas = items.filter(it => permitidas.includes(it.id));
    $("#menu").innerHTML = filtradas
      .map(
        (it) => `
      <li class="nav-item">
        <a class="nav-link d-flex align-items-center gap-2" data-target="${it.id}" href="#" role="tab">
          <span class="material-icons" aria-hidden="true">${it.icon}</span>
          <span class="nav-text">${it.label}</span>
        </a>
      </li>`
      )
      .join("");

    $("#menu").addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;
      e.preventDefault();
      $(".nav-link--active")?.classList.remove("nav-link--active");
      link.classList.add("nav-link--active");
      $("#breadcrumb").textContent = link.textContent;
      const target = link.dataset.target;
      saveLS(CURRENT_VIEW_KEY, target);
      (routes[target] ?? renderSection)(target);
    });
  }

  /* ---------- ROUTES ---------- */
  const routes = {
    dashboard: () =>
      ($("#view-root").innerHTML = `<h2 class="h4">Bienvenido, ${state.user}</h2><p class="text-muted">Seleccione una sección del menú.</p>`),
    registro: loadMonimar,
  };

  /* ---------- MONITOREO (colores rojo/azul + línea delgada) ---------- */
  async function loadMonimar() {
    $("#view-root").innerHTML = `
      <h2 class="h4 mb-3">Monitoreo IoT</h2>
      <div class="row g-3">
        <div class="col-md-6"><canvas id="chartNivel" aria-label="Nivel"></canvas></div>
        <div class="col-md-6"><canvas id="chartTemp" aria-label="Temperatura"></canvas></div>
        <div class="col-md-6"><canvas id="chartHum" aria-label="Humedad"></canvas></div>
        <div class="col-md-6">
          <div class="p-3 border rounded h-100">
            <h3 class="h6">Últimos registros</h3>
            <div id="registrosTxt" class="small overflow-auto" style="max-height:200px"></div>
            <button class="btn btn-sm btn-outline-primary mt-2" id="btnDownloadAll">Descargar CSV</button>
          </div>
        </div>
      </div>`;

    const ctx = (id) => $(id).getContext("2d");

    // Colores y grosor
    const rojo = "#ff002bff";
    const azul = "#ff0000ff";

    const baseOpt = {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { borderWidth: 1 } },
      plugins: { legend: { labels: { color: "#fff" } } }
    };

    // NIVEL → azul
    state.charts.nivel = new Chart(ctx("#chartNivel"), {
      type: "line",
      data: { labels: [], datasets: [{ label: "Nivel (cm)", data: [], tension: 0.3 }] },
      options: { ...baseOpt, scales: { x: { ticks: { color: azul }, grid: { color: "rgba(17, 0, 255, 1)" } }, y: { ticks: { color: azul }, grid: { color: "rgba(38, 0, 255, 1)" } } } },
      plugins: [{
        beforeDraw: (chart) => { chart.data.datasets[0].borderColor = rojo; chart.data.datasets[0].backgroundColor = "transparent"; }
      }]
    });

    // TEMP → rojo
    state.charts.temp = new Chart(ctx("#chartTemp"), {
      type: "line",
      data: { labels: [], datasets: [{ label: "Temp (°C)", data: [], tension: 0.3 }] },
      options: { ...baseOpt, scales: { x: { ticks: { color: azul }, grid: { color: "rgba(17, 0, 255, 1)" } }, y: { ticks: { color: azul }, grid: { color: "rgba(38, 0, 255, 1)" } } } },
      plugins: [{
        beforeDraw: (chart) => { chart.data.datasets[0].borderColor = azul; chart.data.datasets[0].backgroundColor = "transparent"; }
      }]
    });

    // HUMEDAD → rojo
    state.charts.hum = new Chart(ctx("#chartHum"), {
      type: "line",
      data: { labels: [], datasets: [{ label: "Humedad (%RH)", data: [], tension: 0.3 }] },
      options: { ...baseOpt, scales: { x: { ticks: { color: azul }, grid: { color: "rgba(17, 0, 255, 1)" } }, y: { ticks: { color: azul }, grid: { color: "rgba(38, 0, 255, 1)" } } } },
      plugins: [{
        beforeDraw: (chart) => { chart.data.datasets[0].borderColor = rojo; chart.data.datasets[0].backgroundColor = "transparent"; }
      }]
    });

    /* ---------- ACTUALIZAR DATOS ---------- */
    const fetchData = async () => {
      const res = await fetch(CONFIG.API_THINGSPEAK);
      const json = await res.json();
      const feeds = json.feeds ?? [];
      const labels = feeds.map((f) => f.created_at.slice(11, 19));
      const nivel = feeds.map((f) => +f.field1 || 0);
      const temp = feeds.map((f) => +f.field3 || 0);
      const hum = feeds.map((f) => +f.field4 || 0);

      ["nivel", "temp", "hum"].forEach((k, i) => {
        const chart = state.charts[k];
        chart.data.labels = labels;
        chart.data.datasets[0].data = [nivel, temp, hum][i];
        chart.update();
      });

      $("#registrosTxt").innerHTML = feeds
        .map(
          (f) =>
            `<div class="d-flex justify-content-between">
               <span>${f.created_at}</span>
               <span>N:${f.field1} T:${f.field3} H:${f.field4}</span>
             </div>`
        )
        .join("");
    };

    fetchData();
    setInterval(fetchData, 30_000);

    $("#btnDownloadAll").addEventListener("click", () => {
      const rows = [["hora", "nivel", "temp", "hum"]];
      state.charts.nivel.data.labels.forEach((_, i) => {
        rows.push([
          state.charts.nivel.data.labels[i],
          state.charts.nivel.data.datasets[0].data[i],
          state.charts.temp.data.datasets[0].data[i],
          state.charts.hum.data.datasets[0].data[i],
        ]);
      });
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `monimar_${new Date().toISOString()}.csv`,
      });
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  /* ---------- CRUD ---------- */
  window.addItem = function (section) {
    const newItem = {};
    const template = dataStore[section][0] || {};
    Object.keys(template).forEach((k) => {
      if (k === "archivos") newItem[k] = {};
      else if (k === "imagen") newItem[k] = "";
      else newItem[k] = "";
    });
    dataStore[section].push(newItem);
    saveLS(CONFIG.LS_KEY, dataStore);
    renderSection(section);
  };

  window.updateItem = function (section, index, key, value) {
    dataStore[section][index][key] = value;
    saveLS(CONFIG.LS_KEY, dataStore);
  };

  window.deleteItem = function (section, index) {
    if (confirm("¿Desea eliminar este registro?")) {
      dataStore[section].splice(index, 1);
      saveLS(CONFIG.LS_KEY, dataStore);
      renderSection(section);
    }
  };

  window.editItem = function (section, index) {
    const row = document.querySelector(`#table-${section} tbody tr:nth-child(${index + 1})`);
    if (!row) return;
    row.querySelectorAll("input").forEach((inp) => (inp.disabled = false));
    row.querySelectorAll("input")[0].focus();
  };

  window.toggleImage = function (section, index) {
    const img = document.getElementById(`img-${section}-${index}`);
    if (img) img.style.display = img.style.display === "none" ? "inline" : "none";
  };

  window.uploadImage = function (section, index) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = function () {
        dataStore[section][index].imagen = reader.result;
        saveLS(CONFIG.LS_KEY, dataStore);
        renderSection(section);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  window.createNewTxt = function (section, index) {
    const nombre = prompt("Nombre del nuevo archivo .txt (sin extensión):");
    if (!nombre || nombre.trim() === "") return;
    const file = nombre.trim() + ".txt";
    dataStore[section][index].archivos[file] = "";
    saveLS(CONFIG.LS_KEY, dataStore);
    renderSection(section);
    openTxtFile(section, index, file);
  };

  window.openTxtFile = function (section, index, file) {
    const content = dataStore[section][index].archivos[file];
    $("#txtFileContent").value = content;
    $("#txtFileSave").onclick = () => {
      dataStore[section][index].archivos[file] = $("#txtFileContent").value;
      saveLS(CONFIG.LS_KEY, dataStore);
      bootstrap.Modal.getInstance($("#txtFileModal")).hide();
      renderSection(section);
    };
    new bootstrap.Modal($("#txtFileModal")).show();
  };

  window.uploadTxtFile = function (section, index) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt";
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = function () {
        dataStore[section][index].archivos[file.name] = reader.result;
        saveLS(CONFIG.LS_KEY, dataStore);
        alert("Archivo cargado: " + file.name);
        renderSection(section);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  /* ---------- INIT ---------- */
  function initApp() {
    filtrarMenu();
    initCanvas();
    document.documentElement.setAttribute("data-bs-theme", state.dark ? "dark" : "light");
    $("#darkModeSwitch").checked = state.dark;
    $("#sidebar").classList.toggle("sidebar--collapsed", state.sidebarCollapsed);
    $("#main-content").classList.toggle("main--collapsed", state.sidebarCollapsed);
    loadView(loadLS(CURRENT_VIEW_KEY) || "dashboard");
  }

  const user = loadLS("user");
  if (user) {
    state.user = user;
    $("#login-container").classList.add("d-none");
    $("#dashboard-container").classList.remove("d-none");
    initApp();
  } else {
    $("#login-container").classList.remove("d-none");
  }
})();
