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

function renderBars(selector, entries, formatValue, colors = []) {
  const container = document.querySelector(selector);
  if (!container) return;
  const labels = container.parentElement.querySelector(".chart-labels");
  const list = entries.slice(0, 6);
  if (!list.length) {
    container.textContent = "Não há dados para exibir.";
    labels?.replaceChildren();
    return;
  }
  const max = Math.max(...list.map(([, value]) => value), 1);
  container.replaceChildren(...list.map(([name, value], index) => {
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = `${value > 0 ? (value / max) * 100 : 0}%`;
    if (colors[index]) bar.style.background = colors[index];
    bar.title = `${name}: ${formatValue(value)}`;
    return bar;
  }));
  labels?.replaceChildren(...list.map(([name]) => {
    const label = document.createElement("span");
    label.className = "chart-label";
    label.textContent = name;
    return label;
  }));
}

async function start() {
  if (!await AuthGuard.protect([1])) return;
  try {
    const [schoolResponse, planResponse, userResponse] = await Promise.all([
      new Schools().list(),
      new Plans().list(),
      new Users().list()
    ]);
    const activeSchools = schoolResponse.data.filter((school) => school.active === 1);
    const users = userResponse.data.filter((user) => user.active === 1 && [3, 4].includes(Number(user.typeId)));
    const plans = planResponse.data;
    const counts = new Map();
    activeSchools.forEach((school) => counts.set(Number(school.planId), (counts.get(Number(school.planId)) || 0) + 1));
    const distribution = plans.map((plan) => [plan.name, counts.get(Number(plan.id)) || 0]);
    const monthlyRevenue = plans.map((plan) => [plan.name, (counts.get(Number(plan.id)) || 0) * Number(plan.price)]);
    const mrr = monthlyRevenue.reduce((sum, [, value]) => sum + value, 0);
    const arr = mrr * 12;
    const mostPopular = [...distribution].sort((a, b) => b[1] - a[1])[0];

    setMetric("ARR estimado", `R$ ${arr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Projeção pelo preço atual dos planos, sem histórico de cobrança");
    setMetric("Escolas ativas", String(activeSchools.length), `${schoolResponse.data.length} escolas cadastradas`);
    setMetric("Usuários ativos", String(users.length), "Alunos e professores ativos");
    document.querySelector("[data-global-plan-name]").textContent = mostPopular?.[0] || "—";
    document.querySelector("[data-global-plan-count]").textContent = `${mostPopular?.[1] || 0} escolas ativas`;
    renderBars("[data-global-revenue-by-plan]", monthlyRevenue.filter(([, value]) => value > 0), (value) => `R$ ${value.toFixed(2)}`);
    renderBars("[data-global-plan-counts]", distribution.filter(([, value]) => value > 0), (value) => `${value} escolas`, ["var(--color-green)", "var(--color-warning)", "var(--color-info)"]);
  } catch (error) {
    ["ARR estimado", "Escolas ativas", "Usuários ativos"].forEach((label) => {
      setMetric(label, "—", "Não foi possível carregar os dados.");
    });
    document.querySelector("[data-global-plan-name]").textContent = "—";
    document.querySelector("[data-global-plan-count]").textContent = "Não foi possível carregar os dados.";
    ["[data-global-revenue-by-plan]", "[data-global-plan-counts]"].forEach((selector) => {
      const container = document.querySelector(selector);
      if (container) {
        container.textContent = "Não foi possível carregar os dados.";
        container.parentElement.querySelector(".chart-labels")?.replaceChildren();
      }
    });
    window.EduUI?.showToast(error.message, "error");
  }
}

start();
