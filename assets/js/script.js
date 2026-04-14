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

reloadButton.textContent = "Recarregar ultima busca";

function showMessage(element, message, type = "") {
  element.textContent = message;
  element.className = "feedback";

  if (type) {
    element.classList.add(`feedback--${type}`);
  }
}

function showStatus(message = "") {
  statusMessage.textContent = message;
  statusMessage.hidden = !message;
}

function updateEmptyState() {
  emptyState.hidden = studyList.children.length > 0;
}

function createStudyItem(title, source = "manual", userId = "", completed = false) {
  const li = document.createElement("li");
  li.className = "study-item";
  li.dataset.id = String(nextId++);
  li.dataset.source = source;

  const content = document.createElement("div");
  content.className = "study-item__content";

  const itemTitle = document.createElement("p");
  itemTitle.className = "study-item__title";
  itemTitle.textContent = title;

  const meta = document.createElement("p");
  meta.className = "study-item__meta";
  meta.textContent =
    source === "api"
      ? `Sugestao da API | userId: ${userId} | status: ${completed ? "concluida" : "pendente"}`
      : "Item criado manualmente";

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "btn btn--danger";
  removeButton.dataset.action = "remove";
  removeButton.textContent = "Remover";

  content.append(itemTitle, meta);
  li.append(content, removeButton);
  studyList.appendChild(li);
  updateEmptyState();
}

function removeApiItems() {
  const apiItems = studyList.querySelectorAll('li[data-source="api"]');

  apiItems.forEach((item) => {
    item.remove();
  });

  updateEmptyState();
}

function toggleApiLoading(isLoading) {
  const apiButton = apiForm?.querySelector('button[type="submit"]');

  if (apiButton) {
    apiButton.disabled = isLoading;
    apiButton.textContent = isLoading ? "Carregando..." : "Buscar sugestoes";
  }

  apiUserIdInput.disabled = isLoading;
  reloadButton.disabled = isLoading || !lastApiUrl;
}

function getApiUrl(userId) {
  const baseUrl = "https://jsonplaceholder.typicode.com/todos";
  return userId ? `${baseUrl}?userId=${userId}` : baseUrl;
}

async function loadSuggestions(url) {
  toggleApiLoading(true);
  showMessage(apiFeedback, "");
  showStatus("Carregando sugestoes da API...");

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Nao foi possivel carregar as sugestoes.");
    }

    const todos = await response.json();

    removeApiItems();

    todos.forEach((todo) => {
      createStudyItem(todo.title, "api", todo.userId, todo.completed);
    });

    if (todos.length === 0) {
      showMessage(apiFeedback, "Nenhuma sugestao encontrada para essa busca.", "error");
      showStatus("Busca concluida sem resultados.");
      return;
    }

    showMessage(apiFeedback, `${todos.length} sugestao(oes) adicionada(s).`, "success");
    showStatus("Sugestoes carregadas com sucesso.");
  } catch (error) {
    showMessage(
      apiFeedback,
      error instanceof Error
        ? error.message
        : "Ocorreu um erro inesperado ao buscar a API.",
      "error"
    );
    showStatus("Falha ao carregar as sugestoes.");
  } finally {
    toggleApiLoading(false);
  }
}

studyForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = studyInput.value.trim();

  if (!title) {
    showMessage(feedback, "O titulo nao pode ficar vazio.", "error");
    return;
  }

  if (title.length < 3) {
    showMessage(feedback, "O titulo deve ter pelo menos 3 caracteres.", "error");
    return;
  }

  createStudyItem(title);
  studyInput.value = "";
  showMessage(feedback, "Item adicionado com sucesso.", "success");
  studyInput.focus();
});

studyList.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement) || target.dataset.action !== "remove") {
    return;
  }

  const listItem = target.closest("li");

  if (!listItem) {
    return;
  }

  listItem.remove();
  updateEmptyState();
  showStatus("Item removido da lista.");
});

apiForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userId = apiUserIdInput.value.trim();

  if (userId) {
    const userIdNumber = Number(userId);

    if (!Number.isInteger(userIdNumber) || userIdNumber < 1 || userIdNumber > 10) {
      showMessage(apiFeedback, "Informe um userId inteiro entre 1 e 10.", "error");
      showStatus("");
      return;
    }
  }

  lastApiUrl = getApiUrl(userId);
  reloadButton.disabled = false;
  await loadSuggestions(lastApiUrl);
});

reloadButton.addEventListener("click", async () => {
  if (!lastApiUrl) {
    showMessage(apiFeedback, "Faca uma busca na API antes de recarregar.", "error");
    return;
  }

  await loadSuggestions(lastApiUrl);
});

updateEmptyState();
reloadButton.disabled = true;
