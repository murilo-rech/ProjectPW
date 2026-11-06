import Plans from "../../../_common/classes/Plans.js";

const service = new Plans();
const list = document.querySelector("[data-public-plan-list]");
const comparison = document.querySelector("[data-plan-comparison]");
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function addText(parent, tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  parent.append(element);
  return element;
}

function limitLabel(value, noun) {
  return Number(value) === 0 ? "Ilimitado" : `Até ${value}`;
}

function legacyPlanKey(name) {
  const normalized = String(name).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized.includes("basico")) return "basico";
  if (normalized.includes("intermediario")) return "intermediario";
  if (normalized.includes("premium")) return "premium";
  return null;
}

function renderComparison(plans) {
  comparison.replaceChildren();
  const head = document.createElement("thead");
  const headingRow = document.createElement("tr");
  addText(headingRow, "th", "", "Recurso").scope = "col";
  plans.forEach((plan) => addText(headingRow, "th", "", plan.name).setAttribute("scope", "col"));
  head.append(headingRow);

  const body = document.createElement("tbody");
  const rows = [
    ["Mensalidade", (plan) => `${money.format(plan.price)}/mês`],
    ["Alunos", (plan) => `${limitLabel(plan.maxStudents, "alunos")} ${Number(plan.maxStudents) === 0 ? "" : "alunos"}`],
    ["Professores", (plan) => `${limitLabel(plan.maxTeachers, "professores")} ${Number(plan.maxTeachers) === 0 ? "" : "professores"}`]
  ];
  rows.forEach(([label, valueFor]) => {
    const row = document.createElement("tr");
    addText(row, "th", "", label).scope = "row";
    plans.forEach((plan) => addText(row, "td", "", valueFor(plan)));
    body.append(row);
  });
  comparison.append(head, body);
}

function renderPlans(plans) {
  list.replaceChildren();
  if (plans.length === 0) {
    addText(list, "p", "", "Não há planos ativos disponíveis no momento.").setAttribute("role", "status");
    comparison.replaceChildren();
    return;
  }

  plans.forEach((plan) => {
    const card = document.createElement("article");
    card.className = "plan-card";

    const header = document.createElement("header");
    header.className = "plan-header";
    addText(header, "p", "plan-name", plan.name);
    const price = document.createElement("section");
    price.className = "plan-price";
    addText(price, "strong", "", money.format(plan.price));
    addText(price, "span", "", "/mês");
    header.append(price);
    addText(header, "p", "plan-description", plan.description || "Plano para instituições de ensino.");
    card.append(header);

    const features = document.createElement("ul");
    features.className = "plan-features";
    features.setAttribute("aria-label", `Limites do plano ${plan.name}`);
    addText(features, "li", "plan-feature", `${limitLabel(plan.maxStudents, "alunos")} ${Number(plan.maxStudents) === 0 ? "alunos" : "alunos cadastrados"}`);
    addText(features, "li", "plan-feature", `${limitLabel(plan.maxTeachers, "professores")} ${Number(plan.maxTeachers) === 0 ? "professores" : "professores vinculados"}`);
    card.append(features);

    const link = addText(card, "a", "btn btn-primary w-full", "Contratar este plano");
    link.href = "criar-escola.html";
    const key = legacyPlanKey(plan.name);
    if (key) {
      const url = new URL(link.href, window.location.href);
      url.searchParams.set("plan", key);
      link.href = url.href;
    }
    list.append(card);
  });

  renderComparison(plans);
}

async function loadPlans() {
  try {
    const response = await service.listActive();
    renderPlans(response.data);
  } catch (error) {
    list.replaceChildren();
    addText(list, "p", "", error.message || "Não foi possível carregar os planos.").setAttribute("role", "alert");
    comparison.replaceChildren();
    window.EduUI?.showToast(error.message || "Não foi possível carregar os planos.", "error");
  }
}

loadPlans();
