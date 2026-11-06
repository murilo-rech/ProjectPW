import Appointments from "../../../_common/classes/Appointments.js";
import AuthGuard from "../../../_common/classes/AuthGuard.js";
import Availabilities from "../../../_common/classes/Availabilities.js";
import Users from "../../../_common/classes/Users.js";

function setMetric(label, value, detail) {
  const card = [...document.querySelectorAll(".admin-metric")]
    .find((item) => item.querySelector(".admin-metric-label")?.textContent.trim() === label);
  if (!card) return;
  card.querySelector(".admin-metric-value").textContent = value;
  card.querySelector(".admin-metric-delta").textContent = detail;
}

function renderLinkedTeachers(users) {
  const list = document.querySelector("[data-school-pending]");
  if (!list) return;
  const teachers = users.filter((user) => Number(user.typeId) === 3).slice(0, 3);
  if (!teachers.length) {
    const item = document.createElement("li");
    item.className = "request-card";
    item.textContent = "Nenhum professor vinculado à escola.";
    list.replaceChildren(item);
    return;
  }
  list.replaceChildren(...teachers.map((teacher) => {
    const item = document.createElement("li");
    item.className = "request-card";
    const info = document.createElement("article");
    info.className = "request-info";
    const name = document.createElement("strong");
    name.className = "request-name";
    name.textContent = teacher.name;
    const meta = document.createElement("p");
    meta.className = "request-meta";
    meta.textContent = `${teacher.specialization || "Professor"} · ${teacher.email}`;
    info.append(name, meta);
    const status = document.createElement("span");
    status.className = `chip ${teacher.active === 1 ? "chip-green" : "chip-warning"}`;
    status.textContent = teacher.active === 1 ? "Ativo" : "Inativo";
    item.append(info, status);
    return item;
  }));
}

function renderMonthlyAppointments(appointments) {
  const chart = document.querySelector("[data-school-monthly-chart]");
  const labels = document.querySelector(".chart-labels");
  if (!chart || !labels) return;
  const now = new Date();
  const months = Array.from({ length: 4 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 3 + index, 1);
    return { year: date.getFullYear(), month: date.getMonth(), label: date.toLocaleDateString("pt-BR", { month: "short" }) };
  });
  const counts = months.map(({ year, month }) => appointments.filter((appointment) => {
    if (!appointment.createdAt) return false;
    const createdAt = new Date(String(appointment.createdAt).replace(" ", "T"));
    return !Number.isNaN(createdAt.getTime()) && createdAt.getFullYear() === year && createdAt.getMonth() === month;
  }).length);
  if (!appointments.some((appointment) => appointment.createdAt)) {
    chart.textContent = "O histórico de datas não está disponível.";
    labels.replaceChildren();
    return;
  }
  const max = Math.max(...counts, 1);
  chart.replaceChildren(...counts.map((count, index) => {
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = `${Math.max(count ? (count / max) * 100 : 0, 0)}%`;
    bar.title = `${months[index].label}: ${count} atendimentos`;
    return bar;
  }));
  labels.replaceChildren(...months.map(({ label }) => {
    const span = document.createElement("span");
    span.className = "chart-label";
    span.textContent = label;
    return span;
  }));
}

async function start() {
  if (!await AuthGuard.protect([2])) return;
  try {
    const [userResponse, appointmentResponse, availabilityResponse] = await Promise.all([
      new Users().list(),
      new Appointments().list(),
      new Availabilities().list()
    ]);
    const users = userResponse.data;
    const students = users.filter((user) => Number(user.typeId) === 4 && user.active === 1).length;
    const teachers = users.filter((user) => Number(user.typeId) === 3 && user.active === 1).length;
    setMetric("Alunos", String(students), "Alunos ativos nesta escola");
    setMetric("Professores", String(teachers), "Professores ativos nesta escola");
    setMetric("Atendimentos", String(appointmentResponse.data.length), "Agendamentos registrados");
    setMetric("Disponibilidades Ativas", String(availabilityResponse.data.length), "Horários ativos publicados");
    renderLinkedTeachers(users);
    renderMonthlyAppointments(appointmentResponse.data);
  } catch (error) {
    ["Alunos", "Professores", "Atendimentos", "Disponibilidades Ativas"].forEach((label) => {
      setMetric(label, "—", "Não foi possível carregar os dados.");
    });
    const list = document.querySelector("[data-school-pending]");
    if (list) list.textContent = "Não foi possível carregar os usuários vinculados.";
    const chart = document.querySelector("[data-school-monthly-chart]");
    if (chart) chart.textContent = "Não foi possível carregar os atendimentos.";
    window.EduUI?.showToast(error.message, "error");
  }
}

start();
