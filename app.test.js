/**
 * @jest-environment jsdom
 */

/* Mocks */
global.Chart = class {
  constructor(ctx, cfg) {
    this.ctx = ctx;
    this.data = cfg.data;
    this.config = cfg;
  }
  update() {}
};

global.bootstrap = {
  Modal: class {
    constructor(el) { this.el = el; }
    static getInstance() { return { hide: () => {} }; }
  }
};

/* HTML mínimo */
document.body.innerHTML = `
  <div id="login-container">
    <form id="login-form">
      <input id="username" />
      <input id="password" />
      <div id="login-error" class="d-none">Error</div>
    </form>
  </div>
  <div id="dashboard-container" class="d-none">
    <span id="sidebar-username"></span>
    <ul id="menu"></ul>
    <div id="view-root"></div>
    <button id="logout-btn"></button>
    <input type="checkbox" id="darkModeSwitch" />
    <button id="sidebarToggle"></button>
    <aside id="sidebar"></aside>
    <main id="main-content"></main>
    <canvas id="nodeCanvas"></canvas>
    <button id="btnDownloadAll"></button>
    <textarea id="txtFileContent"></textarea>
    <button id="txtFileSave"></button>
  </div>
  <div id="txtFileModal"></div>
`;

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        feeds: [
          { created_at: "2025-10-28T12:00:00Z", field1: "10", field3: "25", field4: "60" },
          { created_at: "2025-10-28T12:01:00Z", field1: "11", field3: "26", field4: "61" },
        ],
      }),
  })
);

require("./app.js");

describe("Technology Server – final", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("Login correcto", () => {
    document.getElementById("username").value = "carmen";
    document.getElementById("password").value = "Carmen456";
    document.getElementById("login-form").dispatchEvent(new Event("submit"));
    expect(localStorage.getItem("user")).toBe("carmen");
    expect(document.getElementById("login-container").classList.contains("d-none")).toBe(true);
    expect(document.getElementById("dashboard-container").classList.contains("d-none")).toBe(false);
  });

  test("Login incorrecto muestra error", () => {
    document.getElementById("username").value = "carmen";
    document.getElementById("password").value = "wrong";
    document.getElementById("login-form").dispatchEvent(new Event("submit"));
    expect(document.getElementById("login-error").classList.contains("d-none")).toBe(false);
  });

  test("Menú sin datos-partners", () => {
    localStorage.setItem("user", "carmen");
    location.reload();
    const links = Array.from(document.querySelectorAll("#menu a")).map(a => a.dataset.target);
    expect(links).not.toContain("datos-partners");
  });

  test("Canvas de nodos conectados existe", () => {
    expect(document.getElementById("nodeCanvas")).toBeTruthy();
  });
});