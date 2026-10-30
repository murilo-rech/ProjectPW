import Plans from "../../../_common/classes/Plans.js";

const service = new Plans();
const list = document.querySelector("[data-plan-list]");
const form = document.querySelector("[data-plan-form]");
const modalId = "modal-plan";
let plans = [];

function toast(message, type = "success") {
  window.EduUI?.showToast(message, type);
}

function addText(parent, tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  parent.append(element);
  return element;
}

function limitLabel(value, noun) {
  return Number(value) === 0 ? `${noun}: ilimitados` : `Até ${value} ${noun}`;
}

function render() {
  list.replaceChildren();
  if (plans.length === 0) {
    addText(list, "p", "appointment-empty", "Não há planos cadastrados.");
    return;
  }

  plans.forEach((plan) => {
    const card = document.createElement("article");
    card.className = "global-plan-card";
    card.dataset.planId = String(plan.id);

    const info = document.createElement("section");
    info.className = "global-plan-info";
    addText(info, "h3", "global-plan-name", plan.name);
    addText(info, "p", "global-plan-desc", plan.description || `${limitLabel(plan.maxStudents, "alunos")} / ${limitLabel(plan.maxTeachers, "professores")}`);
    addText(info, "span", "chip", plan.active ? "Ativo" : "Inativo");

    const price = addText(card, "strong", "global-plan-price", `${Number(plan.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/mês`);
    price.setAttribute("aria-label", `Preço mensal ${price.textContent}`);
    card.prepend(info);

    const actions = document.createElement("aside");
    actions.style.cssText = "display:flex;gap:var(--space-2);margin-left:var(--space-4);";
    const edit = addText(actions, "button", "btn btn-ghost btn-sm", "Editar");
    edit.type = "button";
    edit.dataset.editPlan = String(plan.id);
    const deactivate = addText(actions, "button", "btn btn-danger btn-sm", "Inativar");
    deactivate.type = "button";
    deactivate.dataset.deletePlan = String(plan.id);
    deactivate.disabled = !plan.active;
    card.append(actions);
    list.append(card);
  });
}

async function loadPlans() {
  list.replaceChildren();
  addText(list, "p", "appointment-empty", "Carregando planos…");
  try {
    const response = await service.list();
    plans = response.data;
    render();
  } catch (error) {
    list.replaceChildren();
    addText(list, "p", "appointment-empty", error.message || "Não foi possível carregar os planos.").setAttribute("role", "alert");
    toast(error.message || "Não foi possível carregar os planos.", "error");
  }
}

function openNewPlan() {
  form.reset();
  form.elements.namedItem("plan-id").value = "";
  form.elements.namedItem("active").value = "1";
  document.querySelector("#modal-title").textContent = "Criar Plano SaaS";
  window.EduUI?.openModal(modalId);
}

function editPlan(id) {
  const plan = plans.find((item) => item.id === Number(id));
  if (!plan) return;
  form.elements.namedItem("plan-id").value = String(plan.id);
  form.elements.namedItem("name").value = plan.name;
  form.elements.namedItem("description").value = plan.description;
  form.elements.namedItem("price").value = String(plan.price);
  form.elements.namedItem("limit-students").value = String(plan.maxStudents);
  form.elements.namedItem("limit-teachers").value = String(plan.maxTeachers);
  form.elements.namedItem("active").value = String(plan.active);
  document.querySelector("#modal-title").textContent = "Editar Plano SaaS";
  window.EduUI?.openModal(modalId);
}

document.querySelector("[data-add-plan]")?.addEventListener("click", openNewPlan);

list?.addEventListener("click", async (event) => {
  const edit = event.target.closest("[data-edit-plan]");
  if (edit) {
    editPlan(edit.dataset.editPlan);
    return;
  }

  const deactivate = event.target.closest("[data-delete-plan]");
  if (!deactivate || deactivate.disabled) return;
  const plan = plans.find((item) => item.id === Number(deactivate.dataset.deletePlan));
  if (!plan || !window.confirm(`Inativar o plano ${plan.name}?`)) return;

  deactivate.disabled = true;
  try {
    await service.remove(plan.id);
    toast("Plano inativado.", "warning");
    await loadPlans();
  } catch (error) {
    toast(error.message || "Não foi possível inativar o plano.", "error");
    deactivate.disabled = false;
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = form.querySelector('[type="submit"]');
  const originalText = submit.textContent;
  submit.disabled = true;
  submit.textContent = "Salvando…";

  const id = form.elements.namedItem("plan-id").value;
  const data = {
    name: form.elements.namedItem("name").value.trim(),
    description: form.elements.namedItem("description").value.trim(),
    price: Number(form.elements.namedItem("price").value),
    max_students: Number(form.elements.namedItem("limit-students").value),
    max_teachers: Number(form.elements.namedItem("limit-teachers").value),
    active: Number(form.elements.namedItem("active").value)
  };

  try {
    if (id) await service.update(id, data);
    else await service.create(data);
    window.EduUI?.closeModal(modalId);
    form.reset();
    toast(id ? "Plano atualizado." : "Plano criado.");
    await loadPlans();
  } catch (error) {
    toast(error.message || "Não foi possível salvar o plano.", "error");
  } finally {
    submit.disabled = false;
    submit.textContent = originalText;
  }
});

loadPlans();
