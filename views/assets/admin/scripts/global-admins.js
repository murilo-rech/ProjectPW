import AuthGuard from "../../../_common/classes/AuthGuard.js";
import SessionStorage from "../../../_common/classes/SessionStorage.js";
import Schools from "../../../_common/classes/Schools.js";
import Users from "../../../_common/classes/Users.js";

const session = new SessionStorage();

function toastError(error) {
  window.EduUI?.showToast(error?.message || "Não foi possível concluir a operação.", "error");
}

function addCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value || "—";
  row.append(cell);
}

async function start() {
  if (!await AuthGuard.protect([1])) return;
  let currentUser;
  try {
    currentUser = session.getUser();
  } catch {
    return;
  }

  const usersService = new Users();
  const schoolsService = new Schools();
  const tbody = document.querySelector(".data-table tbody");
  const count = document.querySelector(".table-count");
  const search = document.querySelector("[data-table-search]");
  const form = document.querySelector("[data-user-form]");
  const roleSelect = form?.querySelector('[name="role"]');
  const schoolSelect = form?.querySelector('[name="school_id"]');
  const schoolField = form?.querySelector("[data-admin-school-field]");
  const password = form?.querySelector('[name="password"]');
  const title = document.querySelector("#modal-title");
  if (!tbody || !form || !count || !roleSelect || !schoolSelect) return;

  let admins = [];
  let schools = [];

  function syncSchoolField() {
    const needsSchool = Number(roleSelect.value) === 2;
    schoolField.hidden = !needsSchool;
    schoolField.style.display = needsSchool ? "flex" : "none";
    schoolSelect.required = needsSchool;
  }

  function filterRows() {
    const term = search?.value.trim().toLocaleLowerCase() || "";
    tbody.querySelectorAll("[data-searchable-row]").forEach((row) => {
      row.hidden = !row.textContent.toLocaleLowerCase().includes(term);
    });
  }

  function render(message = null) {
    tbody.replaceChildren();
    if (message || admins.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.textContent = message || "Nenhum administrador cadastrado.";
      row.append(cell);
      tbody.append(row);
      count.textContent = message || "Nenhum registro encontrado";
      return;
    }

    admins.forEach((user) => {
      const row = document.createElement("tr");
      row.dataset.searchableRow = "";
      row.dataset.userId = String(user.id);
      addCell(row, user.name);
      addCell(row, user.email);
      addCell(row, Number(user.typeId) === 1 ? "Administrador global" : "Administrador escolar");

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
      edit.dataset.adminAction = "edit";
      edit.textContent = "Editar";
      actions.append(edit);
      if (Number(user.id) !== Number(currentUser?.id)) {
        const statusButton = document.createElement("button");
        statusButton.type = "button";
        statusButton.className = user.active === 1 ? "btn btn-danger btn-sm" : "btn btn-secondary btn-sm";
        statusButton.dataset.adminAction = user.active === 1 ? "deactivate" : "activate";
        statusButton.textContent = user.active === 1 ? "Desativar" : "Ativar";
        actions.append(statusButton);
      }
      row.append(actions);
      tbody.append(row);
    });
    count.textContent = `Mostrando ${admins.length} administradores`;
    filterRows();
  }

  async function load() {
    render("Carregando administradores…");
    try {
      const response = await usersService.list();
      admins = response.data.filter((user) => [1, 2].includes(Number(user.typeId)));
      render();
    } catch (error) {
      render("Não foi possível carregar os administradores.");
      toastError(error);
    }
  }

  function fillForm(user = null) {
    form.reset();
    form.dataset.userId = user ? String(user.id) : "";
    form.elements.name.value = user?.name || "";
    form.elements.email.value = user?.email || "";
    roleSelect.value = String(user?.typeId || 1);
    schoolSelect.replaceChildren(new Option("Selecione uma escola", ""));
    schools.forEach((school) => schoolSelect.add(new Option(`${school.name} (${school.code})`, school.id)));
    schoolSelect.value = user?.schoolId ? String(user.schoolId) : "";
    if (password) {
      password.value = "";
      password.required = !user;
      password.autocomplete = "new-password";
    }
    const isSelf = user && Number(user.id) === Number(currentUser?.id);
    roleSelect.disabled = Boolean(isSelf);
    schoolSelect.disabled = Boolean(isSelf);
    if (title) title.textContent = user ? "Editar administrador" : "Novo administrador";
    syncSchoolField();
    window.EduUI?.openModal("modal-user");
  }

  async function changeStatus(user, active) {
    if (Number(user.id) === Number(currentUser?.id)) {
      window.EduUI?.showToast("Não é possível desativar a própria conta administrativa.", "warning");
      return;
    }
    if (active === 0 && !window.confirm(`Desativar a conta de ${user.name}?`)) return;
    try {
      const response = active === 0
        ? await usersService.remove(user.id)
        : await usersService.updateById(user.id, { active: 1 });
      window.EduUI?.showToast(response?.message || (active ? "Administrador reativado." : "Administrador desativado."), "success");
      await load();
    } catch (error) {
      toastError(error);
    }
  }

  document.querySelector("[data-add-user]")?.addEventListener("click", () => fillForm());
  roleSelect.addEventListener("change", syncSchoolField);
  search?.addEventListener("input", filterRows);
  tbody.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-admin-action]");
    const user = admins.find((item) => Number(item.id) === Number(button?.closest("[data-user-id]")?.dataset.userId));
    if (!button || !user) return;
    if (button.dataset.adminAction === "edit") fillForm(user);
    if (button.dataset.adminAction === "deactivate") await changeStatus(user, 0);
    if (button.dataset.adminAction === "activate") await changeStatus(user, 1);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const role = Number(roleSelect.value);
    if (role === 2 && !schoolSelect.value) {
      window.EduUI?.showToast("Selecione a escola do administrador escolar.", "warning");
      return;
    }
    const id = form.dataset.userId;
    const values = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim()
    };
    const isSelf = id && Number(id) === Number(currentUser?.id);
    if (!isSelf) {
      values.type_id = role;
      values.school_id = role === 2 ? Number(schoolSelect.value) : null;
    }
    if (!id) values.password = password?.value || "";

    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const response = id
        ? await usersService.updateById(id, values)
        : await usersService.createAdmin(values);
      window.EduUI?.showToast(response?.message || "Administrador salvo com sucesso.", "success");
      window.EduUI?.closeModal("modal-user");
      await load();
    } catch (error) {
      toastError(error);
    } finally {
      submit.disabled = false;
    }
  });

  try {
    const response = await schoolsService.list();
    schools = response.data;
  } catch (error) {
    toastError(error);
  }
  await load();
}

start();
