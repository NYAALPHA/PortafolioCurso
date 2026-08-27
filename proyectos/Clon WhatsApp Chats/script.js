(function () {
  const DATA_URL = "data.json";

  const state = {
    chats: [],
    selectedId: null,
    activeFilter: "Todos",
    query: "",
  };

  const el = {
    filters: document.getElementById("filters"),
    chatList: document.getElementById("chatList"),
    searchInput: document.getElementById("searchInput"),
    chatTitle: document.getElementById("chatTitle"),
    chatStatus: document.getElementById("chatStatus"),
    chatPreview: document.getElementById("chatPreview"),
  };

  async function loadData() {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) {
      throw new Error("No se pudo cargar la data de chats");
    }
    return res.json();
  }

  function parseTimeScore(value) {
    const map = {
      Hoy: 5,
      Ayer: 4,
      miercoles: 3,
      martes: 2,
      lunes: 1,
    };

    if (map[value] !== undefined) return map[value];
    const hhmm = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value);
    if (hhmm) {
      return Number(hhmm[1]) * 60 + Number(hhmm[2]);
    }
    return 0;
  }

  function sortChats(list) {
    return [...list].sort((a, b) => {
      if (a.unread > 0 && b.unread === 0) return -1;
      if (b.unread > 0 && a.unread === 0) return 1;
      return parseTimeScore(b.time) - parseTimeScore(a.time);
    });
  }

  function getFilteredChats() {
    const q = state.query.trim().toLowerCase();
    let result = [...state.chats];

    if (state.activeFilter === "No leidos") {
      result = result.filter((chat) => chat.unread > 0);
    }
    if (state.activeFilter === "Favoritos") {
      result = result.filter((chat) => chat.favorite);
    }
    if (q) {
      result = result.filter((chat) => {
        return chat.name.toLowerCase().includes(q) || chat.message.toLowerCase().includes(q);
      });
    }

    return sortChats(result);
  }

  function rowTemplate(chat, index) {
    const activeClass = chat.id === state.selectedId ? "active" : "";
    const unreadNode = chat.unread > 0 ? `<span class=\"unread\">${chat.unread}</span>` : "";
    const favNode = chat.favorite ? '<span class="favorite">★</span>' : "";
    const onlineNode = chat.online ? '<span class="online-dot" aria-hidden="true"></span>' : "";

    return `
      <article class="chat-row ${activeClass}" style="--stagger:${index}" data-id="${chat.id}" role="listitem" aria-label="Chat con ${chat.name}">
        <div class="avatar">${chat.avatar}${onlineNode}</div>
        <div class="row-main">
          <h3>${chat.name}</h3>
          <p>${chat.message}</p>
        </div>
        <div class="row-meta">
          <span class="time">${chat.time}</span>
          ${unreadNode}
          ${favNode}
        </div>
      </article>
    `;
  }

  function animateRowLayout(previousPositions) {
    const rows = [...el.chatList.querySelectorAll(".chat-row")];

    rows.forEach((row) => {
      const id = Number(row.dataset.id);
      const oldTop = previousPositions.get(id);

      if (oldTop === undefined) {
        row.classList.add("entering");
        setTimeout(() => row.classList.remove("entering"), 460);
        return;
      }

      const newTop = row.getBoundingClientRect().top;
      const deltaY = oldTop - newTop;
      if (Math.abs(deltaY) < 1) return;

      row.style.transition = "none";
      row.style.transform = `translateY(${deltaY}px)`;
      requestAnimationFrame(() => {
        row.style.transition = "transform 380ms cubic-bezier(0.22, 0.61, 0.36, 1)";
        row.style.transform = "translateY(0)";
      });
    });
  }

  function renderFilters(filters) {
    el.filters.innerHTML = "";
    filters.forEach((name) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `filter-chip ${name === state.activeFilter ? "active" : ""}`;
      btn.textContent = name;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", String(name === state.activeFilter));
      btn.addEventListener("click", () => {
        state.activeFilter = name;
        render();
      });
      el.filters.appendChild(btn);
    });
  }

  function renderPreview(chat) {
    if (!chat) {
      el.chatTitle.textContent = "Selecciona un chat";
      el.chatStatus.textContent = "Haz clic en una fila para ver el cambio visual dinamico.";
      el.chatPreview.innerHTML = "";
      return;
    }

    el.chatTitle.textContent = chat.name;
    el.chatStatus.textContent = chat.online
      ? "en linea • actualizacion automatica activa"
      : "ultima conexion reciente";

    el.chatPreview.innerHTML = `
      <div class="bubble in">${chat.message}</div>
      <div class="bubble out">Listo. Esta interfaz actualiza estados de chat en tiempo real.</div>
      <div class="bubble in">Tip: usa No leidos o Favoritos para ver cambios visuales por fila.</div>
    `;
  }

  function render() {
    const previousPositions = new Map();
    [...el.chatList.querySelectorAll(".chat-row")].forEach((row) => {
      previousPositions.set(Number(row.dataset.id), row.getBoundingClientRect().top);
    });

    const visibleChats = getFilteredChats();
    el.chatList.innerHTML = visibleChats.map((chat, index) => rowTemplate(chat, index)).join("");

    animateRowLayout(previousPositions);

    document.querySelectorAll(".chat-row").forEach((row) => {
      row.addEventListener("click", () => {
        const id = Number(row.dataset.id);
        selectChat(id);
      });

      row.addEventListener("dblclick", () => {
        const id = Number(row.dataset.id);
        toggleFavorite(id);
      });
    });

    const selected = state.chats.find((chat) => chat.id === state.selectedId);
    renderPreview(selected);
    renderFilters(["Todos", "No leidos", "Favoritos"]);
  }

  function selectChat(id) {
    state.selectedId = id;
    const chat = state.chats.find((item) => item.id === id);
    if (chat) {
      chat.unread = 0;
      chat.time = "Hoy";
    }
    render();
  }

  function toggleFavorite(id) {
    const chat = state.chats.find((item) => item.id === id);
    if (!chat) return;
    chat.favorite = !chat.favorite;
    render();
  }

  function addVisualPulse(chatId) {
    const row = document.querySelector(`.chat-row[data-id=\"${chatId}\"]`);
    if (!row) return;
    row.classList.add("bump");
    setTimeout(() => row.classList.remove("bump"), 420);
  }

  function randomIncomingMessage() {
    const templates = [
      "Te paso el enlace en un minuto",
      "Ya revise el documento",
      "Nos vemos en la reunion",
      "Perfecto, gracias",
      "Me compartes el archivo final",
    ];

    const candidates = state.chats.filter((chat) => chat.id !== state.selectedId);
    if (candidates.length === 0) return;

    const target = candidates[Math.floor(Math.random() * candidates.length)];
    target.unread += 1;
    target.time = "Hoy";
    target.message = templates[Math.floor(Math.random() * templates.length)];

    render();
    addVisualPulse(target.id);
  }

  function setupEvents() {
    el.searchInput.addEventListener("input", (event) => {
      state.query = event.target.value;
      render();
    });

    document.getElementById("newChatBtn").addEventListener("click", () => {
      randomIncomingMessage();
    });
  }

  async function init() {
    try {
      const data = await loadData();
      state.chats = data.chats || [];
      state.selectedId = state.chats[0]?.id || null;
      setupEvents();
      render();

      // Simula actividad para mostrar cambios visuales en las filas.
      setInterval(randomIncomingMessage, 7000);
    } catch (error) {
      console.error(error);
      el.chatList.innerHTML = "<p style='padding:14px;color:#f8b4b4'>No se pudo cargar la interfaz de chats.</p>";
    }
  }

  init();
})();
