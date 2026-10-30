import AuthGuard from "../../../_common/classes/AuthGuard.js";
import SessionStorage from "../../../_common/classes/SessionStorage.js";
import Users from "../../../_common/classes/Users.js";

const session = new SessionStorage();
const page = document.querySelector("[data-page]")?.dataset.page;
const typeByPage = { alunos: 4, professores: 3, administradores: 2 };
const typeId = typeByPage[page];

function toastError(error) {
  window.EduUI?.showToast(error?.message || "Não foi possível concluir a operação.", "error");
}

function appendCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value || "—";
  row.append(cell);
}

async function start() {
  if (!typeId || !await AuthGuard.protect([2])) return;

  let currentUser;
  try {
    currentUser = session.getUser();
  } catch {
    return;
  }
  const service = new Users();
  const tbody = document.querySelector(".data-table tbody");
  const count = document.querySelector(".table-count");
  const search = document.querySelector("[data-table-search]");
  const form = document.querySelector("[data-user-form]");
  const password = form?.querySelector('[name="password"]');
  const department = form?.querySelector('[name="department"]');
  const title = document.querySelector("#modal-title");
  if (!tbody || !form || !count) return;

  let users = [];

  function filterRows() {
    const term = search?.value.trim().toLocaleLowerCase() || "";
    tbody.querySelectorAll("[data-searchable-row]").forEach((row) => {
      row.hidden = !row.textContent.toLocaleLowerCase().includes(term);
    });
  }

  function render(message = null) {
    tbody.replaceChildren();
    const matching = users.filter((user) => Number(user.typeId) === typeId);
    if (message || !matching.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.textContent = message || "Nenhum usuário cadastrado nesta categoria.";
      row.append(cell);
      tbody.append(row);
      count.textContent = message || "Nenhum registro encontrado";
      return;
    }

    matching.forEach((user) => {
      const row = document.createElement("tr");
      row.dataset.searchableRow = "";
      row.dataset.userId = String(user.id);
      appendCell(row, user.name);
      appendCell(row, user.email);
      if (typeId === 4) appendCell(row, user.registrationNumber);
      else if (typeId === 3) appendCell(row, user.specialization);
      else appendCell(row, "Administrador escolar");

      const statusCell = document.createElement("td");
      const status = document.createElement("span");
      status.className = `chip ${user.active === 1 ? "chip-green" : "chip-warning"}`;
      status.textContent = user.active === 1 ? "Ativo" : "Inativo";
      statusCell.append(status);
      row.append(statusCell);

      const actions = document.createElement("td");
      actions.style.textAlign = "right";
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "btn btn-ghost btn-sm";
      edit.dataset.userAction = "edit";
      edit.textContent = "Editar";
      actions.append(edit);

      if (Number(user.id) !== Number(currentUser?.id)) {
        const statusButton = document.createElement("button");
        statusButton.type = "button";
        statusButton.className = user.active === 1 ? "btn btn-danger btn-sm" : "btn btn-secondary btn-sm";
        statusButton.dataset.userAction = user.active === 1 ? "deactivate" : "activate";
        statusButton.textContent = user.active === 1 ? "Desativar" : "Ativar";
        actions.append(statusButton);
      }
      row.append(actions);
      tbody.append(row);
    });
    count.textContent = `Mostrando ${matching.length} ${typeId === 4 ? "alunos" : typeId === 3 ? "professores" : "administradores"}`;
    filterRows();
  }

  async function load() {
    render("Carregando usuários da escola…");
    try {
      const response = await service.list();
      users = response.data;
      render();
    } catch (error) {
      render("Não foi possível carregar os usuários da escola.");
      toastError(error);
    }
  }

  function fillForm(user = null) {
    form.reset();
    form.dataset.userId = user ? String(user.id) : "";
    form.elements.name.value = user?.name || "";
    form.elements.email.value = user?.email || "";
    if (department) department.value = user?.specialization || "";
    if (password) {
      password.value = "";
      password.required = !user;
      password.autocomplete = user ? "new-password" : "new-password";
    }
    if (department) department.required = !user;
    if (title) title.textContent = user ? "Editar usuário" : "Cadastrar usuário";
    window.EduUI?.openModal("modal-user");
  }

  async function changeStatus(user, active) {
    try {
      const response = active === 0
        ? await service.remove(user.id)
        : await service.updateById(user.id, { active: 1 });
      window.EduUI?.showToast(response?.message || (active ? "Usuário reativado." : "Usuário desativado."), "success");
      await load();
    } catch (error) {
      toastError(error);
    }
  }

  document.querySelector("[data-add-user]")?.addEventListener("click", () => fillForm());
  search?.addEventListener("input", filterRows);
  tbody.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-user-action]");
    const row = button?.closest("[data-user-id]");
    const user = users.find((item) => Number(item.id) === Number(row?.dataset.userId));
    if (!button || !user) return;
    if (button.dataset.userAction === "edit") fillForm(user);
    if (button.dataset.userAction === "deactivate") {
      if (window.confirm(`Desativar a conta de ${user.name}?`)) await changeStatus(user, 0);
    }
    if (button.dataset.userAction === "activate") await changeStatus(user, 1);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const id = form.dataset.userId;
    const values = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim()
    };
    if (department?.value.trim()) values.specialization = department.value.trim();
    if (!id) values.password = password?.value || "";

    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const response = id
        ? await service.updateById(id, values)
        : await service.createInSchool({ ...values, type_id: typeId });
      window.EduUI?.showToast(response?.message || "Usuário salvo com sucesso.", "success");
      window.EduUI?.closeModal("modal-user");
      await load();
    } catch (error) {
      toastError(error);
    } finally {
      submit.disabled = false;
    }
  });

  await load();
}

start();
