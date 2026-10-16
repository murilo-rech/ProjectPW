import AuthGuard from "../../../_common/classes/AuthGuard.js";
import { createFormController } from "../../../_common/classes/FormController.js";
import SessionStorage from "../../../_common/classes/SessionStorage.js";
import Users from "../../../_common/classes/Users.js";

const session = new SessionStorage();

function showError(error) {
  window.EduUI?.showToast(error, "error");
}

function profileName(typeId) {
  return ({ 1: "Administrador global", 2: "Administrador escolar", 3: "Professor", 4: "Aluno" })[typeId] || "Perfil desconhecido";
}

function addCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  row.append(cell);
  return cell;
}

async function start() {
  const currentUser = session.getUser();
  if (!session.getToken() || Number(currentUser?.type_id) !== 1) {
    window.location.replace("../public/login.html");
    return;
  }

  await AuthGuard.protect([1]);
  if (!session.getToken() || Number(session.getUser()?.type_id) !== 1) return;

  const usersService = new Users();
  const list = document.querySelector("[data-user-list]");
  const search = document.querySelector("[data-user-search]");
  const count = document.querySelector("[data-user-count]");
  const editForm = document.querySelector("[data-user-form]");
  const details = document.querySelector("[data-user-details]");
  const formController = createFormController(editForm);
  let users = [];

  function renderState(message) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = message;
    row.append(cell);
    list.replaceChildren(row);
    count.textContent = message;
  }

  function renderUsers() {
    if (!users.length) {
      renderState("Nenhum usuário encontrado.");
      return;
    }

    const rows = users.map((user) => {
      const row = document.createElement("tr");
      row.dataset.searchableRow = "";
      addCell(row, user.name);
      addCell(row, user.email);
      addCell(row, profileName(user.typeId));

      const statusCell = document.createElement("td");
      const status = document.createElement("span");
      status.className = `chip ${user.active === 1 ? "chip-green" : "chip-warning"}`;
      status.textContent = user.active === 1 ? "Ativo" : "Inativo";
      statusCell.append(status);
      row.append(statusCell);

      const actions = document.createElement("td");
      actions.style.textAlign = "right";
      actions.style.whiteSpace = "nowrap";
      for (const [action, label, className] of [
        ["view", "Consultar", "btn btn-ghost btn-sm"],
        ["edit", "Editar", "btn btn-ghost btn-sm"]
      ]) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = className;
        button.dataset.userAction = action;
        button.dataset.userId = user.id;
        button.textContent = label;
        actions.append(button);
      }

      const isCurrentUser = Number(user.id) === Number(currentUser.id);
      if (user.active === 1 && !isCurrentUser) {
        const deactivate = document.createElement("button");
        deactivate.type = "button";
        deactivate.className = "btn btn-danger btn-sm";
        deactivate.dataset.userAction = "deactivate";
        deactivate.dataset.userId = user.id;
        deactivate.textContent = "Desativar";
        actions.append(deactivate);
      }
      row.append(actions);
      return row;
    });

    list.replaceChildren(...rows);
    count.textContent = `Mostrando ${users.length} usuários`;
    filterUsers();
  }

  function filterUsers() {
    const term = search.value.trim().toLocaleLowerCase();
    list.querySelectorAll("[data-searchable-row]").forEach((row) => {
      row.hidden = !row.textContent.toLocaleLowerCase().includes(term);
    });
  }

  async function loadUsers() {
    renderState("Carregando usuários…");
    try {
      const response = await usersService.list();
      users = response.data;
      renderUsers();
    } catch (error) {
      renderState("Não foi possível carregar os usuários.");
      showError(error);
    }
  }

  function showUser(user) {
    const rows = [
      ["ID", user.id],
      ["Nome", user.name],
      ["E-mail", user.email],
      ["Perfil", profileName(user.typeId)],
      ["Escola vinculada", user.schoolId ?? "Sem escola"],
      ["Telefone", user.phone || "Não informado"],
      ["Status", user.active === 1 ? "Ativo" : "Inativo"]
    ];
    const definition = document.createElement("dl");
    for (const [label, value] of rows) {
      const term = document.createElement("dt");
      term.textContent = label;
      const description = document.createElement("dd");
      description.textContent = String(value);
      definition.append(term, description);
    }
    details.replaceChildren(definition);
    window.EduUI?.openModal("modal-user-details");
  }

  async function consultUser(id) {
    try {
      showUser((await usersService.find(id)).data);
    } catch (error) {
      showError(error);
    }
  }

  async function editUser(id) {
    try {
      const user = (await usersService.find(id)).data;
      formController.clear();
      editForm.elements.id.value = user.id;
      editForm.elements.name.value = user.name;
      editForm.elements.email.value = user.email;
      editForm.elements.phone.value = user.phone || "";
      window.EduUI?.openModal("modal-user-edit");
    } catch (error) {
      showError(error);
    }
  }

  async function deactivateUser(user) {
    if (Number(user.id) === Number(currentUser.id)) {
      window.EduUI?.showToast("Não é possível desativar a própria conta administrativa.", "warning");
      return;
    }
    if (!window.confirm(`Desativar a conta de ${user.name}?`)) return;

    try {
      const response = await usersService.remove(user.id);
      window.EduUI?.showToast(response, "warning");
      await loadUsers();
    } catch (error) {
      showError(error);
    }
  }

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-user-action]");
    if (!button) return;
    const user = users.find((item) => Number(item.id) === Number(button.dataset.userId));
    if (!user) return;

    if (button.dataset.userAction === "view") consultUser(user.id);
    if (button.dataset.userAction === "edit") editUser(user.id);
    if (button.dataset.userAction === "deactivate") deactivateUser(user);
  });

  search.addEventListener("input", filterUsers);

  editForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!editForm.reportValidity()) return;

    const values = formController.read();
    formController.setLoading(true, "Salvando…");
    try {
      const response = await usersService.updateById(values.id, {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim()
      });
      window.EduUI?.showToast(response, "success");
      window.EduUI?.closeModal("modal-user-edit");
      await loadUsers();
    } catch (error) {
      showError(error);
    } finally {
      formController.setLoading(false);
    }
  });

  await loadUsers();
}

start();
