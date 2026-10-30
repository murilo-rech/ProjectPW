import AuthGuard from "../../../_common/classes/AuthGuard.js";
import Plans from "../../../_common/classes/Plans.js";
import Schools from "../../../_common/classes/Schools.js";
import Users from "../../../_common/classes/Users.js";

function setMetric(label, value, detail) {
  const card = [...document.querySelectorAll(".admin-metric")]
    .find((item) => item.querySelector(".admin-metric-label")?.textContent.trim() === label);
  if (!card) return;
  card.querySelector(".admin-metric-value").textContent = value;
  card.querySelector(".admin-metric-delta").textContent = detail;
}

function renderRecentSchools(schools, plans) {
  const list = document.querySelector("[data-global-recent-schools]");
  if (!list) return;
  const recent = [...schools].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 4);
  if (!recent.length) {
    const empty = document.createElement("li");
    empty.className = "request-card";
    empty.textContent = "Nenhuma escola cadastrada.";
    list.replaceChildren(empty);
    return;
  }
  const items = recent.map((school) => {
    const item = document.createElement("li");
    item.className = "request-card";
    item.style.alignItems = "center";
    const info = document.createElement("article");
    info.className = "request-info";
    info.style.display = "flex";
    info.style.alignItems = "center";
    info.style.gap = "var(--space-3)";
    const icon = document.createElement("span");
    icon.className = "school-icon";
    icon.textContent = "🏫";
    const detail = document.createElement("section");
    const name = document.createElement("strong");
    name.className = "request-name";
    name.textContent = school.name;
    const summary = document.createElement("p");
    summary.className = "request-meta";
    summary.style.margin = "0";
    const plan = plans.find((item) => Number(item.id) === Number(school.planId));
    summary.textContent = `Código: ${school.code} · Plano: ${plan?.name || "não identificado"}`;
    detail.append(name, summary);
    info.append(icon, detail);
    const status = document.createElement("span");
    status.className = `chip ${school.active === 1 ? "chip-green" : "chip-warning"}`;
    status.style.flexShrink = "0";
    status.textContent = school.active === 1 ? "Ativa" : "Inativa";
    item.append(info, status);
    return item;
  });
  list.replaceChildren(...items);
}

async function start() {
  if (!await AuthGuard.protect([1])) return;
  const chart = document.querySelector(".chart-area");
  const labels = document.querySelector(".chart-labels");
  if (chart) chart.replaceChildren(Object.assign(document.createElement("p"), {
    className: "appointment-empty",
    textContent: "O histórico mensal de faturamento não está disponível."
  }));
  labels?.replaceChildren();

  try {
    const [schoolResponse, planResponse, userResponse] = await Promise.all([
      new Schools().list(),
      new Plans().list(),
      new Users().list()
    ]);
    const schools = schoolResponse.data;
    const plans = planResponse.data;
    const users = userResponse.data;
    const activeSchools = schools.filter((school) => school.active === 1);
    const activeUsers = users.filter((user) => user.active === 1 && [3, 4].includes(Number(user.typeId)));
    const planCounts = new Map();
    let monthlyEstimate = 0;
    activeSchools.forEach((school) => {
      const plan = plans.find((item) => Number(item.id) === Number(school.planId));
      if (!plan) return;
      monthlyEstimate += Number(plan.price) || 0;
      planCounts.set(plan.id, (planCounts.get(plan.id) || 0) + 1);
    });
    const popularPlan = [...planCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    const popular = popularPlan ? plans.find((plan) => Number(plan.id) === Number(popularPlan[0])) : null;

    setMetric("Escolas Ativas", String(activeSchools.length), `${schools.length} escolas cadastradas`);
    setMetric("MRR (Mensal)", `R$ ${monthlyEstimate.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Estimativa pelo plano atual de cada escola");
    setMetric("Total Usuários", String(activeUsers.length), "Alunos e professores ativos");
    setMetric("Plano Mais Vendido", popular?.name || "—", `${popularPlan?.[1] || 0} escolas ativas`);
    renderRecentSchools(schools, plans);
  } catch (error) {
    ["Escolas Ativas", "MRR (Mensal)", "Total Usuários", "Plano Mais Vendido"].forEach((label) => {
      setMetric(label, "—", "Não foi possível carregar os dados.");
    });
    const list = document.querySelector("[data-global-recent-schools]");
    if (list) list.textContent = "Não foi possível carregar as escolas.";
    window.EduUI?.showToast(error.message, "error");
  }
}

start();
