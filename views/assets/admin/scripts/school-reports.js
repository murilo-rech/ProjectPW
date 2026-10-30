import Appointments from "../../../_common/classes/Appointments.js";
import AuthGuard from "../../../_common/classes/AuthGuard.js";

function setMetric(label, value, detail) {
  const card = [...document.querySelectorAll(".admin-metric")]
    .find((item) => item.querySelector(".admin-metric-label")?.textContent.trim() === label);
  if (!card) return;
  card.querySelector(".admin-metric-value").textContent = value;
  card.querySelector(".admin-metric-delta").textContent = detail;
}

function renderBars(container, entries, colors = []) {
  if (!container) return;
  const labels = container.parentElement.querySelector(".chart-labels");
  const visibleEntries = entries.slice(0, 4);
  if (!visibleEntries.length) {
    container.textContent = "Não há dados para este período.";
    labels?.replaceChildren();
    return;
  }
  const max = Math.max(...visibleEntries.map(([, value]) => value), 1);
  container.replaceChildren(...visibleEntries.map(([name, value], index) => {
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = `${value ? (value / max) * 100 : 0}%`;
    if (colors[index]) bar.style.background = colors[index];
    bar.title = `${name}: ${value}`;
    return bar;
  }));
  labels?.replaceChildren(...visibleEntries.map(([name]) => {
    const label = document.createElement("span");
    label.className = "chart-label";
    label.textContent = name;
    return label;
  }));
}

async function start() {
  if (!await AuthGuard.protect([2])) return;
  try {
    const appointments = (await new Appointments().list()).data;
    const completed = appointments.filter((item) => item.status === "completed").length;
    const pending = appointments.filter((item) => item.status === "pending").length;
    const subjects = new Map();
    appointments.forEach((item) => {
      const name = item.subjectName || "Sem matéria";
      subjects.set(name, (subjects.get(name) || 0) + 1);
    });
    const popular = [...subjects.entries()].sort((a, b) => b[1] - a[1])[0];
    const online = appointments.filter((item) => Number(item.modality) === 1).length;
    const inPerson = appointments.filter((item) => Number(item.modality) === 2).length;

    setMetric("Atendimentos concluídos", String(completed), `${completed} concluídos de ${appointments.length} registros`);
    setMetric("Avaliações registradas", "—", "O sistema não registra avaliações");
    setMetric("Agendamentos", String(appointments.length), `${pending} solicitações pendentes`);
    document.querySelector("[data-report-popular-subject]").textContent = popular?.[0] || "—";
    document.querySelector("[data-report-popular-count]").textContent = `${popular?.[1] || 0} agendamentos registrados`;
    renderBars(document.querySelector("[data-report-subjects]"), [...subjects.entries()].sort((a, b) => b[1] - a[1]));
    const total = online + inPerson;
    renderBars(document.querySelector("[data-report-modalities]"), total
      ? [["Online", Math.round((online / total) * 100)], ["Presencial", Math.round((inPerson / total) * 100)]]
      : [], ["var(--color-green)", "var(--color-text-3)"]);
  } catch (error) {
    ["Atendimentos concluídos", "Avaliações registradas", "Agendamentos"].forEach((label) => {
      setMetric(label, "—", "Não foi possível carregar os dados.");
    });
    document.querySelector("[data-report-popular-subject]").textContent = "—";
    document.querySelector("[data-report-popular-count]").textContent = "Não foi possível carregar os dados.";
    document.querySelectorAll("[data-report-subjects], [data-report-modalities]").forEach((container) => {
      container.textContent = "Não foi possível carregar os dados.";
      container.parentElement.querySelector(".chart-labels")?.replaceChildren();
    });
    window.EduUI?.showToast(error.message, "error");
  }
}

start();
