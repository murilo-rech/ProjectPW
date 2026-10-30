import Appointments from "../../../_common/classes/Appointments.js";
import Availabilities from "../../../_common/classes/Availabilities.js";
import Subjects from "../../../_common/classes/Subjects.js";
import Availability from "../../../_common/classes/Availability.js";
import Users from "../../../_common/classes/Users.js";
import SessionStorage from "../../../_common/classes/SessionStorage.js";
import Notifications from "../../../_common/classes/Notifications.js";
import { createFormController } from "../../../_common/classes/FormController.js";

const appointmentService = new Appointments();
const availabilityService = new Availabilities();
const subjectService = new Subjects();
const sessionUser = new SessionStorage().getUser();

document.querySelectorAll(".sidebar-user-name").forEach((element) => {
  element.textContent = sessionUser?.name || "Minha conta";
});

const weekdayNames = ["", "Segunda-feira", "Terca-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sabado", "Domingo"];
const weekdayShort = ["", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
const statusLabels = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Recusado",
  completed: "Concluido",
  cancelled: "Cancelado"
};

function toast(message, type = "success") {
  window.EduUI?.showToast(message, type);
}

function setText(parent, selector, value) {
  const element = parent.querySelector(selector);
  if (element) element.textContent = value;
}

function formatTime(value) {
  return String(value || "").slice(0, 5);
}

function modalityLabel(value) {
  return Number(value) === 1 ? "Online" : "Presencial";
}

function setGridMessage(grid, message, isError = false) {
  grid.replaceChildren();
  const text = document.createElement("p");
  text.className = "appointment-empty";
  text.textContent = message;
  if (isError) text.setAttribute("role", "alert");
  grid.append(text);
}

function selectableCard(title, detail, onSelect) {
  const card = document.createElement("article");
  card.className = "selectable-card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  const heading = document.createElement("strong");
  heading.className = "selectable-card-title";
  heading.textContent = title;
  const caption = document.createElement("span");
  caption.className = "selectable-card-meta";
  caption.textContent = detail;
  card.append(heading, caption);
  card.addEventListener("click", onSelect);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  });
  return card;
}

function selectCard(grid, card) {
  grid.querySelectorAll(".selectable-card").forEach((item) => item.classList.remove("is-selected"));
  card.classList.add("is-selected");
}

async function initBookingFlow() {
  const flow = document.querySelector("[data-booking-flow]");
  if (!flow) return;

  const subjectGrid = flow.querySelector("[data-materia-grid]");
  const teacherGrid = flow.querySelector("[data-professor-grid]");
  const slotGrid = flow.querySelector("[data-horario-grid]");
  const modalitySummary = flow.querySelector("[data-modality-summary]");
  const imageInput = flow.querySelector("[data-appointment-image-input]");
  const imagePreview = flow.querySelector("[data-appointment-image-preview]");
  const confirmButton = flow.querySelector("[data-btn-confirm]");
  const selectedFiles = [];
  const previewUrls = [];
  const selection = { subjectId: null, teacherId: null, availability: null };
  let availabilities = [];

  const clearPreviews = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.length = 0;
    imagePreview?.replaceChildren();
  };

  function updateSummary() {
    const subject = availabilities.find((item) => item.subjectId === selection.subjectId);
    const availability = selection.availability;
    setText(flow, "[data-sum-materia]", subject?.subjectName || "—");
    setText(flow, "[data-sum-professor]", availability?.teacherName || "—");
    setText(flow, "[data-sum-horario]", availability
      ? `${weekdayNames[availability.weekday] || ""}, ${formatTime(availability.startTime)}–${formatTime(availability.endTime)}`
      : "—");
    setText(flow, "[data-sum-modalidade]", availability ? modalityLabel(availability.modality) : "—");
    if (modalitySummary) {
      modalitySummary.textContent = availability
        ? `${modalityLabel(availability.modality)} · ${availability.location || availability.meetingLink || "Local informado pelo professor"}`
        : "Escolha um horario para ver a modalidade cadastrada pelo professor.";
    }
  }

  function renderTeachers(subjectId) {
    const teachers = new Map();
    availabilities.filter((item) => item.subjectId === subjectId).forEach((item) => {
      if (!teachers.has(item.teacherId)) teachers.set(item.teacherId, item.teacherName);
    });
    teacherGrid.replaceChildren();
    if (teachers.size === 0) {
      setGridMessage(teacherGrid, "Nao ha professores com horarios livres para esta disciplina.");
      return;
    }
    teachers.forEach((name, teacherId) => {
      const related = availabilities.filter((item) => item.subjectId === subjectId && item.teacherId === teacherId);
      const card = selectableCard(name, `${related.length} horario(s) disponivel(is)`, () => {
        selection.teacherId = teacherId;
        selection.availability = null;
        selectCard(teacherGrid, card);
        updateSummary();
        renderSlots(subjectId, teacherId);
        flow.querySelector('[data-step-idx="3"]')?.classList.add("is-active");
      });
      teacherGrid.append(card);
    });
  }

  function renderSlots(subjectId, teacherId) {
    const slots = availabilities.filter((item) => item.subjectId === subjectId && item.teacherId === teacherId);
    slotGrid.replaceChildren();
    if (slots.length === 0) {
      setGridMessage(slotGrid, "Este professor nao possui horarios livres para a disciplina.");
      return;
    }
    slots.forEach((availability) => {
      const detail = `${weekdayNames[availability.weekday] || "Dia a combinar"} · ${formatTime(availability.startTime)}–${formatTime(availability.endTime)} · ${modalityLabel(availability.modality)} · ${availability.maxStudents - availability.bookedStudents} vaga(s)`;
      const card = selectableCard("Selecionar horario", detail, () => {
        selection.availability = availability;
        selectCard(slotGrid, card);
        updateSummary();
        flow.querySelector('[data-step-idx="4"]')?.classList.add("is-active");
        flow.querySelector('[data-step-idx="5"]')?.classList.add("is-active");
      });
      slotGrid.append(card);
    });
  }

  imageInput?.addEventListener("change", () => {
    clearPreviews();
    selectedFiles.length = 0;
    const files = Array.from(imageInput.files || []);
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (files.length > 20 || files.some((file) => !allowed.includes(file.type) || file.size > 5 * 1024 * 1024)) {
      imageInput.value = "";
      toast("Escolha ate 20 imagens JPEG, PNG, GIF ou WebP, com no maximo 5 MB cada.", "warning");
      return;
    }
    selectedFiles.push(...files);
    files.forEach((file) => {
      const img = document.createElement("img");
      img.alt = `Previa: ${file.name}`;
      const url = URL.createObjectURL(file);
      previewUrls.push(url);
      img.src = url;
      imagePreview?.append(img);
    });
  });

  confirmButton?.addEventListener("click", async () => {
    if (!selection.availability) {
      toast("Selecione um horario antes de confirmar.", "warning");
      return;
    }
    confirmButton.disabled = true;
    const originalText = confirmButton.textContent;
    confirmButton.textContent = "Enviando...";
    let createdAppointment = null;
    try {
      const notes = flow.querySelector('[name="reason"]')?.value?.trim() || "";
      const result = await appointmentService.create({
        availability_id: selection.availability.id,
        notes
      });
      createdAppointment = result.data;
      if (selectedFiles.length) {
        await appointmentService.uploadImages(createdAppointment.id, selectedFiles);
      }
      toast("Agendamento realizado com sucesso.", "success");
      window.setTimeout(() => { window.location.href = "agendamentos.html"; }, 900);
    } catch (error) {
      toast(createdAppointment
        ? `O agendamento foi salvo, mas as imagens nao foram associadas: ${error.message}`
        : error, "error");
    } finally {
      confirmButton.disabled = false;
      confirmButton.textContent = originalText;
    }
  });

  try {
    const response = await availabilityService.listForBooking();
    availabilities = response.data;
    subjectGrid.replaceChildren();
    if (availabilities.length === 0) {
      setGridMessage(subjectGrid, "Ainda nao existem horarios ativos com vagas na sua escola.");
      return;
    }

    const subjects = new Map();
    availabilities.forEach((item) => subjects.set(item.subjectId, item.subjectName));
    subjects.forEach((name, subjectId) => {
      const related = availabilities.filter((item) => item.subjectId === subjectId);
      const card = selectableCard(name, `${related.length} horario(s) livre(is)`, () => {
        selection.subjectId = subjectId;
        selection.teacherId = null;
        selection.availability = null;
        selectCard(subjectGrid, card);
        teacherGrid.replaceChildren();
        slotGrid.replaceChildren();
        setGridMessage(teacherGrid, "Escolha um professor.");
        setGridMessage(slotGrid, "Escolha um professor primeiro.");
        updateSummary();
        renderTeachers(subjectId);
        flow.querySelector('[data-step-idx="2"]')?.classList.add("is-active");
      });
      subjectGrid.append(card);
    });
  } catch (error) {
    setGridMessage(subjectGrid, error.message || "Nao foi possivel carregar os horarios.", true);
    toast(error, "error");
  }
}

function makeAppointmentCard(appointment, teacherView) {
  const card = document.createElement("li");
  card.className = "appointment-card";
  card.dataset.appointmentItem = "";
  card.dataset.status = appointment.status;
  card.dataset.id = appointment.id;

  const date = document.createElement("section");
  date.className = "appointment-date";
  const weekday = document.createElement("span");
  weekday.className = "day";
  weekday.textContent = weekdayShort[appointment.weekday] || "—";
  const time = document.createElement("span");
  time.className = "month";
  time.textContent = formatTime(appointment.startTime);
  date.append(weekday, time);

  const info = document.createElement("article");
  info.className = "appointment-info";
  const title = document.createElement("strong");
  title.className = "appointment-title";
  title.textContent = appointment.subjectName || "Atendimento";
  const participant = document.createElement("p");
  participant.className = "appointment-participant";
  participant.textContent = `${teacherView ? "Aluno" : "Professor"}: ${teacherView ? appointment.studentName : appointment.teacherName} · ${formatTime(appointment.startTime)}–${formatTime(appointment.endTime)}`;
  const meta = document.createElement("section");
  meta.className = "appointment-meta";
  const location = document.createElement("span");
  location.textContent = `📍 ${modalityLabel(appointment.modality)}: ${appointment.location || appointment.meetingLink || "Local a confirmar"}`;
  const notes = document.createElement("span");
  notes.textContent = appointment.notes ? `💬 Motivo: ${appointment.notes}` : "Sem observacao informada.";
  const status = document.createElement("span");
  const chip = document.createElement("span");
  chip.className = `chip ${appointment.status === "approved" ? "chip-green" : appointment.status === "pending" ? "chip-warning" : ""}`;
  chip.textContent = statusLabels[appointment.status] || "Status";
  status.append(chip);
  meta.append(location, notes, status);
  info.append(title, participant, meta);

  const actions = document.createElement("aside");
  actions.className = "appointment-actions";
  if (teacherView && appointment.status === "pending") {
    actions.append(
      actionButton("Aprovar", "approved", "btn btn-primary btn-sm"),
      actionButton("Recusar", "rejected", "btn btn-danger btn-sm")
    );
  } else if (teacherView && appointment.status === "approved") {
    actions.append(actionButton("Concluir", "completed", "btn btn-secondary btn-sm"));
  } else if (!teacherView && ["pending", "approved"].includes(appointment.status) && appointment.active === 1) {
    actions.append(actionButton("Cancelar", "cancel", "btn btn-danger btn-sm"));
  }

  card.append(date, info, actions);
  if (appointment.images.length) {
    const gallery = document.createElement("section");
    gallery.className = "appointment-image-gallery";
    gallery.setAttribute("aria-label", "Imagens anexadas ao agendamento");
    appointment.images.forEach((image) => {
      const img = document.createElement("img");
      img.alt = "Imagem anexada ao agendamento";
      img.dataset.appImage = String(image.id);
      img.addEventListener("click", () => window.open(img.src, "_blank", "noopener"));
      gallery.append(img);
    });
    card.append(gallery);
  }
  return card;
}

function actionButton(label, action, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.dataset.appointmentAction = action;
  return button;
}

async function loadAppointmentImages(list) {
  for (const image of list.querySelectorAll("[data-app-image]")) {
    try {
      const blob = await appointmentService.getImage(image.dataset.appImage);
      const url = URL.createObjectURL(blob);
      image.dataset.objectUrl = url;
      image.src = url;
    } catch (error) {
      image.alt = "Imagem indisponivel";
    }
  }
}

async function initAppointmentList() {
  const list = document.querySelector("[data-appointment-list]");
  if (!list) return;
  const teacherView = window.location.pathname.endsWith("atendimentos.html")
    || window.location.pathname.endsWith("professor-dashboard.html");
  const filter = document.querySelector("[data-appointment-filter]");
  let items = [];
  let selectedFilter = "all";

  const render = () => {
    list.querySelectorAll("[data-object-url]").forEach((image) => URL.revokeObjectURL(image.dataset.objectUrl));
    list.replaceChildren();
      const matching = items.filter((item) => selectedFilter === "all" || item.status === selectedFilter);
      const visible = list.hasAttribute("data-dashboard-appointments") ? matching.slice(0, 3) : matching;
    if (!visible.length) {
      const empty = document.createElement("li");
      empty.className = "appointment-empty";
      empty.textContent = selectedFilter === "all" ? "Nao ha agendamentos para exibir." : "Nao ha agendamentos neste status.";
      list.append(empty);
      return;
    }
    visible.forEach((item) => list.append(makeAppointmentCard(item, teacherView)));
    loadAppointmentImages(list);
  };

  filter?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    filter.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    selectedFilter = button.dataset.filter;
    render();
  });

  list.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-appointment-action]");
    if (!button) return;
    const id = Number(button.closest("[data-id]")?.dataset.id);
    const action = button.dataset.appointmentAction;
    if (!id) return;
    if (action === "cancel" && !window.confirm("Deseja cancelar este agendamento?")) return;
    if (action === "rejected" && !window.confirm("Deseja recusar este pedido de agendamento?")) return;
    button.disabled = true;
    try {
      if (action === "cancel") await appointmentService.remove(id);
      else await appointmentService.updateStatus(id, action);
      toast(action === "cancel" ? "Agendamento cancelado." : "Status do atendimento atualizado.", "success");
      await load();
    } catch (error) {
      button.disabled = false;
      toast(error, "error");
    }
  });

  async function load() {
    list.replaceChildren(Object.assign(document.createElement("li"), {
      className: "appointment-empty",
      textContent: "Carregando agendamentos…"
    }));
    try {
      const response = await appointmentService.list();
      items = response.data;
      render();
    } catch (error) {
      setGridMessage(list, error.message || "Nao foi possivel carregar os agendamentos.", true);
      toast(error, "error");
    }
  }
  load();
}

async function initSubjectManager() {
  const list = document.querySelector("[data-subject-list]");
  const form = document.querySelector("[data-subject-form]");
  if (!list || !form) return;

  const idInput = form.querySelector('[name="subject-id"]');
  const nameInput = form.querySelector('[name="subject-name"]');
  const title = document.querySelector("#subject-modal-title");
  let subjects = [];

  const render = () => {
    list.replaceChildren();
    if (!subjects.length) {
      setGridMessage(list, "Você ainda não cadastrou matérias.");
      return;
    }

    subjects.forEach((subject) => {
      const card = document.createElement("article");
      card.className = "availability-card";
      card.dataset.subjectId = subject.id;
      const header = document.createElement("header");
      header.className = "availability-header";
      const heading = document.createElement("h3");
      heading.className = "availability-title";
      heading.textContent = subject.name;
      const actions = document.createElement("section");
      actions.className = "availability-actions";
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "btn btn-ghost btn-sm";
      edit.dataset.subjectAction = "edit";
      edit.textContent = "Editar";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn btn-danger btn-sm";
      remove.dataset.subjectAction = "remove";
      remove.textContent = "Remover";
      actions.append(edit, remove);
      header.append(heading, actions);
      card.append(header);
      list.append(card);
    });
  };

  const load = async () => {
    try {
      const response = await subjectService.list();
      subjects = response.data.filter((subject) => subject.active === 1);
      render();
    } catch (error) {
      setGridMessage(list, "Não foi possível carregar suas matérias.", true);
      toast(error, "error");
    }
  };

  function fillForm(subject = null) {
    form.reset();
    idInput.value = subject?.id || "";
    nameInput.value = subject?.name || "";
    title.textContent = subject ? "Editar Matéria" : "Adicionar Matéria";
    window.EduUI?.openModal("modal-subject");
  }

  document.querySelector("[data-add-subject]")?.addEventListener("click", () => fillForm());
  list.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-subject-action]");
    const id = Number(button?.closest("[data-subject-id]")?.dataset.subjectId);
    const subject = subjects.find((item) => Number(item.id) === id);
    if (!button || !subject) return;
    if (button.dataset.subjectAction === "edit") {
      fillForm(subject);
      return;
    }
    if (!window.confirm(`Remover a matéria ${subject.name} da sua lista?`)) return;
    button.disabled = true;
    try {
      const response = await subjectService.remove(subject.id);
      toast(response.message || "Matéria removida.", "success");
      await load();
    } catch (error) {
      toast(error, "error");
    } finally {
      button.disabled = false;
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const id = idInput.value;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const response = id
        ? await subjectService.update(id, { name: nameInput.value.trim() })
        : await subjectService.create({ name: nameInput.value.trim() });
      toast(response.message || (id ? "Matéria atualizada." : "Matéria adicionada."), "success");
      window.EduUI?.closeModal("modal-subject");
      await load();
    } catch (error) {
      toast(error, "error");
    } finally {
      submit.disabled = false;
    }
  });

  await load();
}

async function initAvailabilityManager() {
  const list = document.querySelector("[data-availability-list]");
  const form = document.querySelector("[data-availability-form]");
  if (!list || !form) return;
  const controller = createFormController(form);
  const subjectSelect = form.querySelector('[name="subject"]');
  const modalitySelect = form.querySelector('[name="modality"]');
  const locationInput = form.querySelector('[name="location"]');
  const hiddenId = form.querySelector('[name="availability-id"]');
  let availabilities = [];

  const loadSubjects = async () => {
    const response = await subjectService.list();
    subjectSelect.replaceChildren(new Option("Selecione a disciplina", ""));
    response.data.filter((subject) => subject.active === 1).forEach((subject) => {
      subjectSelect.add(new Option(subject.name, subject.id));
    });
  };

  const render = () => {
    list.replaceChildren();
    if (!availabilities.length) {
      const empty = document.createElement("p");
      empty.className = "appointment-empty";
      empty.textContent = "Voce ainda nao cadastrou horarios.";
      list.append(empty);
      return;
    }
    availabilities.forEach((item) => {
      const card = document.createElement("article");
      card.className = "availability-card";
      card.dataset.availabilityId = item.id;
      const header = document.createElement("header");
      header.className = "availability-header";
      const titleSection = document.createElement("section");
      const title = document.createElement("h3");
      title.className = "availability-title";
      title.textContent = item.subjectName;
      const teacher = document.createElement("p");
      teacher.className = "availability-subject";
      teacher.textContent = `${item.bookedStudents}/${item.maxStudents} vagas ocupadas`;
      titleSection.append(title, teacher);
      const actions = document.createElement("section");
      actions.className = "availability-actions";
      const edit = actionButton("Editar", "edit-availability", "btn btn-ghost btn-icon");
      edit.setAttribute("aria-label", "Editar horario");
      const remove = actionButton("Excluir", "delete-availability", "btn btn-danger btn-icon");
      remove.setAttribute("aria-label", "Excluir horario");
      actions.append(edit, remove);
      header.append(titleSection, actions);
      const details = document.createElement("section");
      details.className = "availability-details";
      [
        `📅 ${weekdayNames[item.weekday] || "Dia a combinar"}`,
        `🕒 ${formatTime(item.startTime)}–${formatTime(item.endTime)}`,
        `👥 ${item.maxStudents} vagas`,
        `${item.modality === 1 ? "💻 Online" : "🏫 Presencial"} · ${item.meetingLink || item.location || "Sem local"}`
      ].forEach((text) => {
        const detail = document.createElement("span");
        detail.className = "availability-detail";
        detail.textContent = text;
        details.append(detail);
      });
      card.append(header, details);
      list.append(card);
    });
  };

  const load = async () => {
    const response = await availabilityService.list();
    availabilities = response.data;
    render();
  };

  document.querySelector("[data-add-availability]")?.addEventListener("click", async () => {
    try {
      await loadSubjects();
      form.reset();
      hiddenId.value = "";
      document.querySelector("#modal-title").textContent = "Novo horario";
      window.EduUI?.openModal("modal-availability");
    } catch (error) {
      toast(error, "error");
    }
  });

  modalitySelect?.addEventListener("change", () => {
    const online = Number(modalitySelect.value) === 1;
    locationInput.placeholder = online ? "https://meet.google.com/..." : "Sala, laboratorio ou endereco";
  });

  list.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-appointment-action]");
    if (!button) return;
    const id = Number(button.closest("[data-availability-id]")?.dataset.availabilityId);
    if (!id) return;
    const action = button.dataset.appointmentAction;
    if (action === "edit-availability") {
      const item = availabilities.find((availability) => availability.id === id);
      if (!item) return;
      try {
        await loadSubjects();
        hiddenId.value = item.id;
        subjectSelect.value = String(item.subjectId);
        form.querySelector('[name="weekday"]').value = String(item.weekday);
        form.querySelector('[name="slots"]').value = String(item.maxStudents);
        form.querySelector('[name="start-time"]').value = formatTime(item.startTime);
        form.querySelector('[name="end-time"]').value = formatTime(item.endTime);
        modalitySelect.value = String(item.modality);
        locationInput.value = item.meetingLink || item.location;
        modalitySelect.dispatchEvent(new Event("change"));
        document.querySelector("#modal-title").textContent = "Editar horario";
        window.EduUI?.openModal("modal-availability");
      } catch (error) {
        toast(error, "error");
      }
      return;
    }
    if (!window.confirm("Deseja excluir este horario?")) return;
    button.disabled = true;
    try {
      await availabilityService.remove(id);
      toast("Horario excluido.", "success");
      await load();
    } catch (error) {
      button.disabled = false;
      toast(error, "error");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = controller.read();
    const modality = Number(data.modality);
    const payload = new Availability({
      subject_id: Number(data.subject),
      modality,
      weekday: Number(data.weekday),
      start_time: data["start-time"],
      end_time: data["end-time"],
      max_students: Number(data.slots),
      location: modality === 2 ? data.location : "",
      meeting_link: modality === 1 ? data.location : ""
    });
    controller.setLoading(true, "Salvando...");
    try {
      if (hiddenId.value) await availabilityService.update(Number(hiddenId.value), payload);
      else await availabilityService.create(payload);
      window.EduUI?.closeModal("modal-availability");
      form.reset();
      hiddenId.value = "";
      toast("Horario salvo com sucesso.", "success");
      await load();
    } catch (error) {
      toast(error, "error");
    } finally {
      controller.setLoading(false);
    }
  });

  try {
    await load();
  } catch (error) {
    setGridMessage(list, error.message || "Nao foi possivel carregar os horarios.", true);
    toast(error, "error");
  }
}

async function initDashboard() {
  const list = document.querySelector("[data-dashboard-appointments]");
  if (!list) return;
  const session = new SessionStorage();
  const storedUser = session.getUser() || {};
  const teacherView = window.location.pathname.endsWith("professor-dashboard.html");
  const nameTarget = document.querySelector("[data-user-name]");

  if (!teacherView && Number(storedUser.type_id) === 3) {
    window.location.replace("professor-dashboard.html");
    return;
  }

  try {
    const userResponse = await new Users().findMe();
    const user = userResponse.data;
    if (nameTarget) nameTarget.textContent = user.name;

    const appointmentResponse = await appointmentService.list();
    const appointments = appointmentResponse.data;
    const metric = (name) => document.querySelector(`[data-dashboard-metric="${name}"]`);
    if (teacherView) {
      const availabilityResponse = await availabilityService.list();
      const availableSpaces = availabilityResponse.data.reduce(
        (total, item) => total + Math.max(0, item.maxStudents - item.bookedStudents), 0
      );
      if (metric("active")) metric("active").textContent = String(appointments.length);
      if (metric("slots")) metric("slots").textContent = String(availableSpaces);
      if (metric("pending")) metric("pending").textContent = String(appointments.filter((item) => item.status === "pending").length);
    } else {
      const next = [...appointments].sort((a, b) => (a.weekday - b.weekday) || a.startTime.localeCompare(b.startTime))[0];
      if (metric("next")) metric("next").textContent = next ? `${weekdayShort[next.weekday]} ${formatTime(next.startTime)}` : "—";
      setText(document, "[data-dashboard-detail='next']", next?.subjectName || "Sem agendamento ativo");
      if (metric("active")) metric("active").textContent = String(appointments.length);
      if (metric("school")) metric("school").textContent = user.schoolId ? "Vinculada" : "Sem vinculo";
    }
  } catch (error) {
    if (nameTarget) nameTarget.textContent = storedUser.name || "usuario";
    document.querySelectorAll("[data-dashboard-metric]").forEach((item) => {
      if (!item.textContent.trim()) item.textContent = "—";
    });
    toast(error, "error");
  }
}

async function initNotifications() {
  const list = document.querySelector("[data-notification-list]");
  if (!list) return;
  const service = new Notifications();

  const render = (items) => {
    list.replaceChildren();
    if (!items.length) {
      const empty = document.createElement("li");
      empty.className = "appointment-empty";
      empty.textContent = "Voce nao possui notificacoes.";
      list.append(empty);
      return;
    }
    items.forEach((item) => {
      const row = document.createElement("li");
      row.className = `notification-item${item.isRead ? "" : " is-unread"}`;
      row.dataset.notificationId = item.id;
      if (!item.isRead) {
        const dot = document.createElement("span");
        dot.className = "notification-dot";
        dot.setAttribute("aria-hidden", "true");
        row.append(dot);
      }
      const content = document.createElement("article");
      content.className = "notification-content";
      const title = document.createElement("strong");
      title.className = "notification-title";
      title.textContent = item.title;
      const message = document.createElement("p");
      message.className = "notification-text";
      message.textContent = item.message;
      const time = document.createElement("time");
      time.className = "notification-time";
      if (item.createdAt) {
        const date = new Date(item.createdAt.replace(" ", "T"));
        if (!Number.isNaN(date.getTime())) {
          time.dateTime = date.toISOString();
          time.textContent = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
        }
      }
      content.append(title, message, time);
      row.append(content);
      if (!item.isRead) {
        const mark = document.createElement("button");
        mark.type = "button";
        mark.className = "btn btn-ghost btn-sm";
        mark.dataset.markNotification = item.id;
        mark.textContent = "Marcar como lida";
        row.append(mark);
      }
      list.append(row);
    });
  };

  const load = async () => {
    list.replaceChildren(Object.assign(document.createElement("li"), {
      className: "appointment-empty",
      textContent: "Carregando notificacoes…"
    }));
    try {
      const response = await service.list();
      render(response.data);
    } catch (error) {
      setGridMessage(list, error.message || "Nao foi possivel carregar as notificacoes.", true);
      toast(error, "error");
    }
  };

  list.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-mark-notification]");
    if (!button) return;
    button.disabled = true;
    try {
      await service.markRead(Number(button.dataset.markNotification));
      await load();
    } catch (error) {
      button.disabled = false;
      toast(error, "error");
    }
  });

  document.querySelector("[data-mark-all-read]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await service.markAllRead();
      toast("Notificacoes marcadas como lidas.", "success");
      await load();
    } catch (error) {
      toast(error, "error");
    } finally {
      button.disabled = false;
    }
  });

  await load();
}

async function initializeApp() {
  await Promise.all([
    initBookingFlow(),
    initAppointmentList(),
    initSubjectManager(),
    initAvailabilityManager(),
    initDashboard(),
    initNotifications()
  ]);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
} else {
  initializeApp();
}
