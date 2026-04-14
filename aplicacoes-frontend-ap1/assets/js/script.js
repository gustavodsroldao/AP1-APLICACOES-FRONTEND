const items = [];
let nextId = 1;
let lastApiUrl = "";

const studyForm = document.getElementById("study-form");
const studyInput = document.getElementById("study-input");
const feedback = document.getElementById("feedback");

const apiForm =
  document.getElementById("api-form") ||
  document.querySelector('form[action="api-form"]');
const apiUserIdInput = document.getElementById("api-user-id");
const apiFeedback = document.getElementById("api-feedback");
const statusMessage = document.getElementById("status-message");
const reloadButton = document.getElementById("reload-button");

const studyList = document.getElementById("study-list");
const emptyState = document.getElementById("empty-state");

function setFeedback(message, type = "") {
  feedback.textContent = message;
  feedback.className = "feedback";

  if (type) {
    feedback.classList.add(`feedback--${type}`);
  }
}

function setApiFeedback(message, type = "") {
  apiFeedback.textContent = message;
  apiFeedback.className = "feedback";

  if (type) {
    apiFeedback.classList.add(`feedback--${type}`);
  }
}

function setStatusMessage(message = "") {
  statusMessage.textContent = message;
  statusMessage.hidden = !message;
}

function updateEmptyState() {
  emptyState.hidden = items.length > 0;
}

function updateReloadButton() {
  reloadButton.textContent = "Recarregar ultima busca";
  reloadButton.disabled = !lastApiUrl;
}

function setApiLoading(isLoading) {
  const apiSubmitButton = apiForm?.querySelector('button[type="submit"]');

  if (apiSubmitButton) {
    apiSubmitButton.disabled = isLoading;
    apiSubmitButton.textContent = isLoading
      ? "Carregando..."
      : "Buscar sugestoes";
  }

  reloadButton.disabled = isLoading || !lastApiUrl;
  apiUserIdInput.disabled = isLoading;
}

function validateTitle(title) {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    return "O titulo nao pode ficar vazio.";
  }

  if (normalizedTitle.length < 3) {
    return "O titulo deve ter pelo menos 3 caracteres.";
  }

  return "";
}

function validateUserId(userId) {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    return "";
  }

  const parsedUserId = Number(normalizedUserId);
  const isInteger = Number.isInteger(parsedUserId);

  if (!isInteger || parsedUserId < 1 || parsedUserId > 10) {
    return "Informe um userId inteiro entre 1 e 10.";
  }

  return "";
}

function createStudyItem(item) {
  const li = document.createElement("li");
  li.className = "study-item";
  li.dataset.id = String(item.id);

  const content = document.createElement("div");
  content.className = "study-item__content";

  const title = document.createElement("p");
  title.className = "study-item__title";
  title.textContent = item.title;

  const meta = document.createElement("p");
  meta.className = "study-item__meta";
  meta.textContent =
    item.source === "api"
      ? `Sugestao da API | userId: ${item.userId} | status: ${
          item.completed ? "concluida" : "pendente"
        }`
      : "Item criado manualmente";

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "btn btn--danger";
  removeButton.dataset.action = "remove";
  removeButton.textContent = "Remover";

  content.append(title, meta);
  li.append(content, removeButton);

  return li;
}

function renderList() {
  studyList.replaceChildren();

  items.forEach((item) => {
    studyList.appendChild(createStudyItem(item));
  });

  updateEmptyState();
}

function addItem(item) {
  items.push(item);
  renderList();
}

function removeItem(itemId) {
  const index = items.findIndex((item) => item.id === itemId);

  if (index === -1) {
    return;
  }

  items.splice(index, 1);
  renderList();
}

function removeApiItems() {
  const manualItems = items.filter((item) => item.source === "manual");
  items.length = 0;
  items.push(...manualItems);
}

async function fetchSuggestions(url) {
  setApiLoading(true);
  setApiFeedback("");
  setStatusMessage("Carregando sugestoes da API...");

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Nao foi possivel carregar as sugestoes.");
    }

    const todos = await response.json();

    removeApiItems();

    todos.forEach((todo) => {
      items.push({
        id: nextId++,
        title: todo.title,
        source: "api",
        userId: todo.userId,
        completed: todo.completed,
      });
    });

    renderList();

    if (todos.length === 0) {
      setApiFeedback("Nenhuma sugestao encontrada para essa busca.", "error");
      setStatusMessage("Busca concluida sem resultados.");
      return;
    }

    setApiFeedback(`${todos.length} sugestao(oes) adicionada(s).`, "success");
    setStatusMessage("Sugestoes carregadas com sucesso.");
  } catch (error) {
    setApiFeedback(
      error instanceof Error
        ? error.message
        : "Ocorreu um erro inesperado ao buscar a API.",
      "error"
    );
    setStatusMessage("Falha ao carregar as sugestoes.");
  } finally {
    setApiLoading(false);
    updateReloadButton();
  }
}

function buildApiUrl(userId) {
  const baseUrl = "https://jsonplaceholder.typicode.com/todos";
  const normalizedUserId = userId.trim();

  return normalizedUserId
    ? `${baseUrl}?userId=${encodeURIComponent(normalizedUserId)}`
    : baseUrl;
}

studyForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = studyInput.value.trim();
  const validationMessage = validateTitle(title);

  if (validationMessage) {
    setFeedback(validationMessage, "error");
    return;
  }

  addItem({
    id: nextId++,
    title,
    source: "manual",
  });

  studyInput.value = "";
  setFeedback("Item adicionado com sucesso.", "success");
  studyInput.focus();
});

studyList.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.dataset.action !== "remove") {
    return;
  }

  const listItem = target.closest("li");

  if (!listItem) {
    return;
  }

  removeItem(Number(listItem.dataset.id));
  setStatusMessage("Item removido da lista.");
});

apiForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userId = apiUserIdInput.value.trim();
  const validationMessage = validateUserId(userId);

  if (validationMessage) {
    setApiFeedback(validationMessage, "error");
    setStatusMessage("");
    return;
  }

  lastApiUrl = buildApiUrl(userId);
  updateReloadButton();
  await fetchSuggestions(lastApiUrl);
});

reloadButton.addEventListener("click", async () => {
  if (!lastApiUrl) {
    setApiFeedback("Faca uma busca na API antes de recarregar.", "error");
    return;
  }

  await fetchSuggestions(lastApiUrl);
});

updateEmptyState();
updateReloadButton();
