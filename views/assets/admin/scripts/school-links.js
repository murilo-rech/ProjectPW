import AuthGuard from "../../../_common/classes/AuthGuard.js";
import Users from "../../../_common/classes/Users.js";

async function start() {
  if (!await AuthGuard.protect([2])) return;
  const tbody = document.querySelector(".data-table tbody");
  if (!tbody) return;
  try {
    const response = await new Users().list();
    const teachers = response.data.filter((user) => Number(user.typeId) === 3);
    if (!teachers.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.textContent = "Nenhum professor associado a esta escola.";
      row.append(cell);
      tbody.replaceChildren(row);
      return;
    }
    tbody.replaceChildren(...teachers.map((teacher) => {
      const row = document.createElement("tr");
      for (const value of [
        teacher.name,
        teacher.email,
        teacher.specialization || "—",
        "Código da escola"
      ]) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      }
      const statusCell = document.createElement("td");
      const status = document.createElement("span");
      status.className = `chip ${teacher.active === 1 ? "chip-green" : "chip-warning"}`;
      status.textContent = teacher.active === 1 ? "Ativo" : "Inativo";
      statusCell.append(status);
      row.append(statusCell);
      return row;
    }));
  } catch (error) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "Não foi possível carregar os professores associados.";
    row.append(cell);
    tbody.replaceChildren(row);
    window.EduUI?.showToast(error.message, "error");
  }
}

start();
