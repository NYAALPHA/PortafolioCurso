(function () {
  const STORAGE_KEY = "trelloHybridState.v1";

  const COLUMNS = [
    { id: "backlog", title: "DO (Backlog)", description: "Ideas y pendientes" },
    { id: "todo", title: "DO IT", description: "Compromiso del sprint" },
    { id: "inprogress", title: "IN PROGRESS", description: "En ejecucion" },
    { id: "review", title: "REVIEW", description: "Validacion y pruebas" },
    { id: "done", title: "DONE", description: "Tareas completadas" },
  ];

  const STARTER_TASKS = [
    {
      title: "Terminar y cerrar el trabajo de grado/tesis",
      project: "Tesis",
      priority: "Alta",
      points: 8,
      column: "todo",
      description: "Cerrar entregables administrativos y academicos.",
    },
    {
      title: "Completar el anteproyecto de tesis",
      project: "Tesis",
      priority: "Alta",
      points: 5,
      column: "inprogress",
      description: "Definir objetivos, alcance y cronograma.",
    },
    {
      title: "Finalizar la aplicacion movil de navegacion del campus",
      project: "Navegacion",
      priority: "Alta",
      points: 8,
      column: "todo",
      description: "Concluir flujos principales y pruebas base.",
    },
    {
      title: "Completar navegacion indoor mediante codigos QR",
      project: "Navegacion",
      priority: "Media",
      points: 5,
      column: "backlog",
      description: "Implementar lectura, mapeo y rutas interiores.",
    },
    {
      title: "Completar navegacion outdoor mediante GPS",
      project: "Navegacion",
      priority: "Alta",
      points: 5,
      column: "backlog",
      description: "Ajustar precision y recalculo de rutas.",
    },
    {
      title: "Integrar PostgreSQL + PostGIS",
      project: "Navegacion",
      priority: "Alta",
      points: 8,
      column: "backlog",
      description: "Persistir geometria y consultas espaciales.",
    },
    {
      title: "Finalizar integracion de Leaflet/OpenStreetMap",
      project: "Navegacion",
      priority: "Media",
      points: 3,
      column: "review",
      description: "Revisar capas, marcadores y experiencia de mapa.",
    },
    {
      title: "Completar modelado de multiples pisos en QGIS",
      project: "Navegacion",
      priority: "Media",
      points: 5,
      column: "backlog",
      description: "Asegurar coherencia entre plantas y metadatos.",
    },
    {
      title: "Exportar capas de QGIS a GeoJSON",
      project: "Navegacion",
      priority: "Media",
      points: 3,
      column: "backlog",
      description: "Validar formato para consumo en frontend.",
    },
    {
      title: "Completar proyecto de mantenimiento hospitalario",
      project: "Hospitalario",
      priority: "Alta",
      points: 8,
      column: "inprogress",
      description: "Terminar alcance funcional y tecnico del mantenimiento.",
    },
    {
      title: "Clasificar requisitos por tipo de mantenimiento",
      project: "Hospitalario",
      priority: "Alta",
      points: 5,
      column: "todo",
      description: "Correctivo, perfectivo, adaptativo y preventivo.",
    },
    {
      title: "Aplicar ITIL al proyecto",
      project: "Hospitalario",
      priority: "Media",
      points: 5,
      column: "backlog",
      description: "Registrar procesos de incidentes y cambios.",
    },
    {
      title: "Aplicar metodo MoSCoW",
      project: "Hospitalario",
      priority: "Media",
      points: 3,
      column: "review",
      description: "Priorizar funcionalidades must/should/could/wont.",
    },
    {
      title: "Ejecutar pruebas de seguridad SQL Injection",
      project: "Hospitalario",
      priority: "Alta",
      points: 5,
      column: "todo",
      description: "Documentar hallazgos y remediaciones.",
    },
    {
      title: "Validar telefonos y correos",
      project: "Hospitalario",
      priority: "Media",
      points: 3,
      column: "backlog",
      description: "Ajustar reglas de validacion y mensajes de error.",
    },
    {
      title: "Integrar prefijos telefonicos internacionales",
      project: "Hospitalario",
      priority: "Media",
      points: 3,
      column: "backlog",
      description: "Consumir servicio de pais/codigo y validar formato.",
    },
    {
      title: "Resolver problemas Docker/MySQL",
      project: "Hospitalario",
      priority: "Alta",
      points: 8,
      column: "inprogress",
      description: "Estabilizar networking, volumenes y arranque.",
    },
    {
      title: "Configurar entorno final Docker Compose",
      project: "Hospitalario",
      priority: "Alta",
      points: 5,
      column: "todo",
      description: "Consolidar servicios, variables y dependencias.",
    },
    {
      title: "Completar documentacion final",
      project: "Hospitalario",
      priority: "Media",
      points: 3,
      column: "review",
      description: "Incluir arquitectura, manuales y decisiones clave.",
    },
    {
      title: "Preparar defensa/presentacion final",
      project: "Tesis",
      priority: "Alta",
      points: 8,
      column: "todo",
      description: "Construir guion, diapositivas y discurso final.",
    },
  ];

  const form = document.querySelector("#taskForm");
  const boardNode = document.querySelector("#board");
  const searchInput = document.querySelector("#searchInput");
  const columnSelect = document.querySelector("#column");
  const historyList = document.querySelector("#historyList");
  const trashList = document.querySelector("#trashList");
  const taskTemplate = document.querySelector("#taskTemplate");
  const taskModal = document.querySelector("#taskModal");
  const memoryModal = document.querySelector("#memoryModal");
  const openTaskModalBtn = document.querySelector("#openTaskModal");
  const openMemoryModalBtn = document.querySelector("#openMemoryModal");

  let state = loadState();

  function uid() {
    return "task-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function nowText() {
    return new Date().toLocaleString("es-CO", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function cloneTask(task) {
    return { ...task };
  }

  function seedTasks() {
    return STARTER_TASKS.map((task) => ({
      id: uid(),
      title: task.title,
      description: task.description,
      project: task.project,
      priority: task.priority,
      points: Number(task.points || 1),
      column: task.column,
      createdAt: nowText(),
      updatedAt: nowText(),
    }));
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          tasks: seedTasks(),
          history: [{ at: nowText(), message: "Tablero inicializado con tus tareas principales." }],
          trash: [],
          filter: "",
        };
      }
      const parsed = JSON.parse(raw);
      return {
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : seedTasks(),
        history: Array.isArray(parsed.history) ? parsed.history : [],
        trash: Array.isArray(parsed.trash) ? parsed.trash : [],
        filter: typeof parsed.filter === "string" ? parsed.filter : "",
      };
    } catch (error) {
      console.error("Error cargando estado", error);
      return {
        tasks: seedTasks(),
        history: [{ at: nowText(), message: "Se recupero tablero por error de lectura." }],
        trash: [],
        filter: "",
      };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function addHistory(message) {
    state.history.unshift({ at: nowText(), message });
    state.history = state.history.slice(0, 50);
  }

  function renderColumnOptions() {
    columnSelect.innerHTML = "";
    COLUMNS.forEach((column) => {
      const option = document.createElement("option");
      option.value = column.id;
      option.textContent = column.title;
      columnSelect.appendChild(option);
    });
  }

  function updateSummary() {
    const total = state.tasks.length;
    const done = state.tasks.filter((task) => task.column === "done").length;
    const percent = total ? Math.round((done / total) * 100) : 0;

    document.querySelector("#totalTasks").textContent = String(total);
    document.querySelector("#doneTasks").textContent = String(done);
    document.querySelector("#progressPercent").textContent = percent + "%";
  }

  function taskMatchFilter(task) {
    const text = state.filter.trim().toLowerCase();
    if (!text) return true;
    return [task.title, task.project, task.description].join(" ").toLowerCase().includes(text);
  }

  function renderBoard() {
    boardNode.innerHTML = "";

    COLUMNS.forEach((column) => {
      const tasks = state.tasks.filter((task) => task.column === column.id && taskMatchFilter(task));

      const colNode = document.createElement("section");
      colNode.className = "column";
      colNode.dataset.column = column.id;

      colNode.innerHTML = "<header><div><h3>" + column.title + "</h3><small>" + column.description + "</small></div><span class=\"column-count\">" + tasks.length + "</span></header>";

      const list = document.createElement("ul");
      list.className = "card-list";

      tasks.forEach((task) => {
        const card = buildTaskCard(task);
        const item = document.createElement("li");
        item.appendChild(card);
        list.appendChild(item);
      });

      colNode.appendChild(list);
      enableColumnDrop(colNode);
      boardNode.appendChild(colNode);
    });

    updateSummary();
    renderHistory();
    renderTrash();
  }

  function buildTaskCard(task) {
    const fragment = taskTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".task");
    card.dataset.id = task.id;

    fragment.querySelector(".task-title").textContent = task.title;
    fragment.querySelector(".task-desc").textContent = task.description || "Sin detalles";
    fragment.querySelector(".project-tag").textContent = task.project || "General";
    fragment.querySelector(".priority-tag").textContent = task.priority;
    fragment.querySelector(".points-tag").textContent = task.points + " pts";

    card.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/task-id", task.id);
      event.dataTransfer.effectAllowed = "move";
    });

    fragment.querySelector(".delete-btn").addEventListener("click", () => {
      deleteTask(task.id);
    });

    fragment.querySelector(".edit-btn").addEventListener("click", () => {
      editTask(task.id);
    });

    return fragment;
  }

  function enableColumnDrop(columnNode) {
    columnNode.addEventListener("dragover", (event) => {
      event.preventDefault();
      columnNode.classList.add("drag-target");
    });

    columnNode.addEventListener("dragleave", () => {
      columnNode.classList.remove("drag-target");
    });

    columnNode.addEventListener("drop", (event) => {
      event.preventDefault();
      columnNode.classList.remove("drag-target");
      const taskId = event.dataTransfer.getData("text/task-id");
      const targetColumn = columnNode.dataset.column;
      if (!taskId || !targetColumn) return;
      moveTask(taskId, targetColumn);
    });
  }

  function createTask(data) {
    const task = {
      id: uid(),
      title: data.title.trim(),
      description: data.description.trim(),
      project: data.project.trim() || "General",
      priority: data.priority,
      points: Number(data.points || 1),
      column: data.column,
      createdAt: nowText(),
      updatedAt: nowText(),
    };

    state.tasks.unshift(task);
    addHistory("Creaste: " + task.title + " en " + columnTitle(task.column) + ".");
    saveState();
    renderBoard();
  }

  function columnTitle(id) {
    const column = COLUMNS.find((item) => item.id === id);
    return column ? column.title : id;
  }

  function moveTask(taskId, targetColumn) {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task || task.column === targetColumn) return;

    const previous = columnTitle(task.column);
    task.column = targetColumn;
    task.updatedAt = nowText();
    addHistory("Moviste: " + task.title + " de " + previous + " a " + columnTitle(targetColumn) + ".");
    saveState();
    renderBoard();
  }

  function deleteTask(taskId) {
    const index = state.tasks.findIndex((item) => item.id === taskId);
    if (index < 0) return;

    const [removed] = state.tasks.splice(index, 1);
    state.trash.unshift({
      id: uid(),
      removedAt: nowText(),
      task: cloneTask(removed),
    });
    state.trash = state.trash.slice(0, 30);
    addHistory("Eliminaste: " + removed.title + ".");
    saveState();
    renderBoard();
  }

  function restoreTask(trashId) {
    const index = state.trash.findIndex((item) => item.id === trashId);
    if (index < 0) return;

    const [entry] = state.trash.splice(index, 1);
    entry.task.id = uid();
    entry.task.updatedAt = nowText();
    state.tasks.unshift(entry.task);
    addHistory("Restauraste: " + entry.task.title + ".");
    saveState();
    renderBoard();
  }

  function editTask(taskId) {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return;

    const title = prompt("Editar titulo", task.title);
    if (title === null) return;
    const project = prompt("Editar proyecto", task.project);
    if (project === null) return;
    const description = prompt("Editar detalle", task.description || "");
    if (description === null) return;

    task.title = title.trim() || task.title;
    task.project = project.trim() || "General";
    task.description = description.trim();
    task.updatedAt = nowText();

    addHistory("Editaste: " + task.title + ".");
    saveState();
    renderBoard();
  }

  function renderHistory() {
    historyList.innerHTML = "";
    const entries = state.history.length ? state.history : [{ at: nowText(), message: "Sin actividad todavia." }];
    entries.slice(0, 15).forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = "[" + entry.at + "] " + entry.message;
      historyList.appendChild(li);
    });
  }

  function renderTrash() {
    trashList.innerHTML = "";
    if (!state.trash.length) {
      const li = document.createElement("li");
      li.textContent = "No hay tareas eliminadas.";
      trashList.appendChild(li);
      return;
    }

    state.trash.slice(0, 10).forEach((entry) => {
      const li = document.createElement("li");
      li.className = "trash-item";
      const text = document.createElement("span");
      text.textContent = entry.task.title;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "restore-btn";
      button.textContent = "Restaurar";
      button.addEventListener("click", () => restoreTask(entry.id));

      li.append(text, button);
      trashList.appendChild(li);
    });
  }

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const title = (formData.get("title") || "").toString().trim();

    if (!title) return;

    createTask({
      title,
      description: (formData.get("description") || "").toString(),
      project: (formData.get("project") || "").toString(),
      priority: (formData.get("priority") || "Media").toString(),
      points: Number(formData.get("points") || 1),
      column: (formData.get("column") || "backlog").toString(),
    });

    form.reset();
    document.querySelector("#priority").value = "Media";
    document.querySelector("#points").value = "3";
    document.querySelector("#column").value = "backlog";
    closeModal(taskModal);
  });

  searchInput.addEventListener("input", () => {
    state.filter = searchInput.value;
    saveState();
    renderBoard();
  });

  document.querySelector("#resetBoard").addEventListener("click", () => {
    const confirmed = confirm("Se borraran los cambios y se restaurara el tablero inicial. Continuar?");
    if (!confirmed) return;
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    searchInput.value = "";
    renderBoard();
  });

  openTaskModalBtn.addEventListener("click", () => {
    openModal(taskModal);
    document.querySelector("#title").focus();
  });

  openMemoryModalBtn.addEventListener("click", () => {
    openModal(memoryModal);
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(document.querySelector("#" + button.dataset.closeModal));
    });
  });

  [taskModal, memoryModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeModal(taskModal);
    closeModal(memoryModal);
  });

  renderColumnOptions();
  searchInput.value = state.filter;
  renderBoard();
})();
