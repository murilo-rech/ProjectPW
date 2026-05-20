const STORAGE_KEY = "eduScheduleFrontendStateV4";
const STATE_VERSION = 1;
const CURRENT_STUDENT = {
  id: "ana",
  name: "Ana Martins",
};
const CURRENT_TEACHER = {
  id: "joao",
  name: "Professor João",
};
const DAY_ORDER = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

let appState = loadState();
let selectedSubject = "";
let selectedTeacherId = "";
let selectedSlotId = "";
let editingSlotId = "";
let deletingSlotId = "";

function createInitialState() {
  return {
    version: STATE_VERSION,
    subjects: [
      "Matemática",
      "Física",
      "Programação Web",
      "Banco de Dados",
    ],
    teachers: [
      {
        id: "joao",
        name: "Professor João",
        subjects: ["Programação Web", "Banco de Dados"],
      },
      {
        id: "carlos",
        name: "Professor Carlos",
        subjects: ["Programação Web"],
      },
      {
        id: "camila",
        name: "Professora Camila",
        subjects: ["Física"],
      },
      {
        id: "renato",
        name: "Professor Renato",
        subjects: ["Matemática"],
      },
    ],
    availabilities: [
      {
        id: "slot-joao-web-1",
        teacherId: "joao",
        teacherName: "Professor João",
        subject: "Programação Web",
        day: "Terça",
        time: "14h às 15h",
        mode: "onsite",
        limit: 3,
        reserved: 1,
        location: "Laboratório Web 02",
        link: "",
      },
      {
        id: "slot-joao-bd-1",
        teacherId: "joao",
        teacherName: "Professor João",
        subject: "Banco de Dados",
        day: "Quarta",
        time: "16h às 17h",
        mode: "online",
        limit: 3,
        reserved: 0,
        location: "",
        link: "https://meet.edu/joao-bd",
      },
      {
        id: "slot-joao-web-2",
        teacherId: "joao",
        teacherName: "Professor João",
        subject: "Programação Web",
        day: "Quinta",
        time: "16h às 17h",
        mode: "online",
        limit: 3,
        reserved: 0,
        location: "",
        link: "https://meet.edu/joao-web",
      },
      {
        id: "slot-carlos-web-1",
        teacherId: "carlos",
        teacherName: "Professor Carlos",
        subject: "Programação Web",
        day: "Terça",
        time: "10h às 11h",
        mode: "online",
        limit: 4,
        reserved: 1,
        location: "",
        link: "https://meet.edu/carlos-web",
      },
      {
        id: "slot-camila-fisica-1",
        teacherId: "camila",
        teacherName: "Professora Camila",
        subject: "Física",
        day: "Quarta",
        time: "09h às 10h",
        mode: "onsite",
        limit: 4,
        reserved: 2,
        location: "Sala F-12",
        link: "",
      },
      {
        id: "slot-renato-math-1",
        teacherId: "renato",
        teacherName: "Professor Renato",
        subject: "Matemática",
        day: "Sexta",
        time: "08h às 09h",
        mode: "onsite",
        limit: 3,
        reserved: 0,
        location: "Sala B-104",
        link: "",
      },
    ],
    appointments: [
      {
        id: "apt-joao-web-1",
        studentId: "ana",
        studentName: "Ana Martins",
        teacherId: "joao",
        teacherName: "Professor João",
        subject: "Programação Web",
        slotId: "slot-joao-web-1",
        day: "Terça",
        time: "14h às 15h",
        mode: "Presencial",
        place: "Laboratório Web 02",
        status: "marcado",
        updated: false,
        updateNote: "",
      },
      {
        id: "apt-camila-fisica-1",
        studentId: "ana",
        studentName: "Ana Martins",
        teacherId: "camila",
        teacherName: "Professora Camila",
        subject: "Física",
        slotId: "slot-camila-fisica-1",
        day: "Quarta",
        time: "09h às 10h",
        mode: "Presencial",
        place: "Sala F-12",
        status: "concluído",
        updated: false,
        updateNote: "",
      },
      {
        id: "apt-legacy-renato",
        studentId: "ana",
        studentName: "Ana Martins",
        teacherId: "renato",
        teacherName: "Professor Renato",
        subject: "Matemática",
        slotId: "legacy-slot",
        day: "Segunda",
        time: "14h",
        mode: "Presencial",
        place: "Laboratório 04",
        status: "cancelado",
        updated: false,
        updateNote: "",
      },
    ],
    notifications: [
      {
        id: "notice-student-1",
        audience: "student",
        recipientId: "ana",
        title: "Seu atendimento com Professora Camila foi confirmado.",
        body: "Quarta | 09h às 10h | Sala F-12",
        tone: "info",
        createdAt: Date.now() - 1000 * 60 * 12,
      },
      {
        id: "notice-teacher-1",
        audience: "teacher",
        recipientId: "joao",
        title: "Sua disponibilidade de terça já tem 1 aluno inscrito.",
        body: "Programação Web | Terça | 14h às 15h",
        tone: "success",
        createdAt: Date.now() - 1000 * 60 * 8,
      },
    ],
  };
}

function loadState() {
  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY);

    if (!rawState) {
      return createInitialState();
    }

    const parsedState = JSON.parse(rawState);

    if (
      !parsedState ||
      parsedState.version !== STATE_VERSION ||
      !Array.isArray(parsedState.availabilities) ||
      !Array.isArray(parsedState.appointments) ||
      !Array.isArray(parsedState.notifications)
    ) {
      return createInitialState();
    }

    return parsedState;
  } catch (error) {
    return createInitialState();
  }
}

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function setStatusMessage(selector, type, message) {
  const status = document.querySelector(selector);

  if (!status) {
    return;
  }

  status.classList.remove("is-success", "is-error");
  status.classList.add(type === "success" ? "is-success" : "is-error");
  status.textContent = message;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatMode(mode) {
  return mode === "online" ? "Online" : "Presencial";
}

function formatLinkLabel(link) {
  if (!link) {
    return "Acesso a confirmar";
  }

  try {
    const parsedUrl = new URL(link);
    const cleanPath = parsedUrl.pathname.replace(/\/$/, "");
    return `${parsedUrl.hostname}${cleanPath}`;
  } catch (error) {
    return link.replace(/^https?:\/\//, "");
  }
}

function formatLocation(slot) {
  return slot.mode === "online" ? `Link: ${formatLinkLabel(slot.link)}` : `Local: ${slot.location}`;
}

function formatReserved(slot) {
  return `${slot.reserved}/${slot.limit} vagas`;
}

function formatRelativeTime(createdAt) {
  const elapsedMinutes = Math.max(0, Math.round((Date.now() - createdAt) / 60000));

  if (elapsedMinutes < 1) {
    return "Agora";
  }

  if (elapsedMinutes < 60) {
    return `Há ${elapsedMinutes} min`;
  }

  const elapsedHours = Math.round(elapsedMinutes / 60);
  return `Há ${elapsedHours} h`;
}

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function sortByDayAndTime(firstSlot, secondSlot) {
  const dayDifference = DAY_ORDER.indexOf(firstSlot.day) - DAY_ORDER.indexOf(secondSlot.day);

  if (dayDifference !== 0) {
    return dayDifference;
  }

  return firstSlot.time.localeCompare(secondSlot.time, "pt-BR");
}

function getCurrentRole() {
  return document.body.dataset.userRole || "student";
}

function getCurrentNotifications() {
  const role = getCurrentRole();
  const recipientId = role === "teacher" ? CURRENT_TEACHER.id : CURRENT_STUDENT.id;

  return appState.notifications
    .filter((notification) => {
      return notification.audience === role && notification.recipientId === recipientId;
    })
    .sort((firstNotification, secondNotification) => secondNotification.createdAt - firstNotification.createdAt);
}

function pushNotification(notification) {
  appState.notifications.unshift({
    id: generateId("notice"),
    createdAt: Date.now(),
    tone: "info",
    ...notification,
  });

  appState.notifications = appState.notifications.slice(0, 24);
}

function getAvailabilityById(slotId) {
  return appState.availabilities.find((slot) => slot.id === slotId);
}

function getAppointmentsForCurrentStudent() {
  return appState.appointments.filter((appointment) => appointment.studentId === CURRENT_STUDENT.id);
}

function getStudentAppointmentForSlot(slotId) {
  return appState.appointments.find((appointment) => {
    return appointment.studentId === CURRENT_STUDENT.id && appointment.slotId === slotId;
  });
}

function getTeacherById(teacherId) {
  return appState.teachers.find((teacher) => teacher.id === teacherId);
}

function getSlotsForSelectedTeacher() {
  if (!selectedSubject || !selectedTeacherId) {
    return [];
  }

  return appState.availabilities
    .filter((slot) => {
      return slot.subject === selectedSubject && slot.teacherId === selectedTeacherId;
    })
    .sort(sortByDayAndTime);
}

function getTeacherSlots() {
  return appState.availabilities
    .filter((slot) => slot.teacherId === CURRENT_TEACHER.id)
    .sort(sortByDayAndTime);
}

function getNextMarkedAppointment() {
  return getAppointmentsForCurrentStudent().find((appointment) => appointment.status === "marcado");
}

function renderNotificationCenter() {
  const notifications = getCurrentNotifications();

  document.querySelectorAll("[data-notification-button]").forEach((button) => {
    button.textContent = String(notifications.length);
  });

  document.querySelectorAll("[data-notification-list]").forEach((list) => {
    list.innerHTML = "";

    if (!notifications.length) {
      list.innerHTML = `
        <li class="empty-state">
          <strong>Nenhum aviso novo.</strong>
          <p>A central de notificações ficará visível aqui conforme a rotina evoluir.</p>
        </li>
      `;
      return;
    }

    list.innerHTML = notifications
      .map((notification) => {
        return `
          <li>
            <section class="notice-meta">
              <strong>${escapeHtml(notification.title)}</strong>
              <span class="chip ${notification.tone === "warning" ? "notice-tag warning" : "notice-tag"}">${escapeHtml(formatRelativeTime(notification.createdAt))}</span>
            </section>
            <p>${escapeHtml(notification.body)}</p>
          </li>
        `;
      })
      .join("");
  });

  const dashboardNoticeList = document.querySelector("[data-dashboard-notices]");

  if (dashboardNoticeList) {
    const studentNotices = getCurrentNotifications().slice(0, 3);

    if (!studentNotices.length) {
      dashboardNoticeList.innerHTML = `
        <li class="empty-state">
          <strong>Nenhum aviso no momento.</strong>
          <p>Atualizações do professor e confirmações de agendamento aparecerão aqui.</p>
        </li>
      `;
    } else {
      dashboardNoticeList.innerHTML = studentNotices
        .map((notification) => {
          return `
            <li>
              <strong>${escapeHtml(notification.title)}</strong>
              <p>${escapeHtml(notification.body)}</p>
            </li>
          `;
        })
        .join("");
    }
  }
}

function renderDashboardSummary() {
  const nextAppointmentText = document.querySelector("[data-next-appointment-text]");
  const nextAppointmentStatus = document.querySelector("[data-next-appointment-status]");

  if (!nextAppointmentText || !nextAppointmentStatus) {
    return;
  }

  const nextAppointment = getNextMarkedAppointment();

  if (!nextAppointment) {
    nextAppointmentText.textContent = "Nenhum atendimento marcado no momento.";
    nextAppointmentStatus.textContent = "Disponível";
    nextAppointmentStatus.className = "status-badge completed";
    return;
  }

  nextAppointmentText.textContent = `${nextAppointment.teacherName} | ${nextAppointment.day} | ${nextAppointment.time} | ${nextAppointment.place}`;
  nextAppointmentStatus.textContent = nextAppointment.updated ? "Atualizado" : "Marcado";
  nextAppointmentStatus.className = `status-badge ${nextAppointment.updated ? "warning" : "marked"}`;
}

function renderAppointments() {
  const appointmentList = document.querySelector("[data-appointment-list]");

  if (!appointmentList) {
    return;
  }

  const appointments = getAppointmentsForCurrentStudent();

  appointmentList.innerHTML = appointments
    .map((appointment) => {
      const updateMarkup = appointment.updated
        ? `<p class="appointment-note">${escapeHtml(appointment.updateNote)}</p>`
        : "";

      return `
        <article class="appointment-card panel-card ${appointment.updated ? "is-updated" : ""}" data-search-item>
          <header>
            <strong>${escapeHtml(appointment.teacherName)}</strong>
            <p>${escapeHtml(appointment.subject)} | ${escapeHtml(appointment.day)} | ${escapeHtml(appointment.time)}</p>
          </header>
          <section class="appointment-meta">
            <span class="chip">Modalidade: ${escapeHtml(appointment.mode)}</span>
            <span class="chip">${escapeHtml(appointment.mode === "Online" ? `Link: ${appointment.place}` : `Local: ${appointment.place}`)}</span>
            <span class="status-badge ${getStatusClassName(appointment.status)}">${escapeHtml(formatStatusLabel(appointment.status))}</span>
            ${appointment.updated ? '<span class="status-badge warning">Atualizado</span>' : ""}
          </section>
          ${updateMarkup}
        </article>
      `;
    })
    .join("");
}

function formatStatusLabel(status) {
  if (status === "marcado") {
    return "Marcado";
  }

  if (status === "cancelado") {
    return "Cancelado";
  }

  return "Concluído";
}

function getStatusClassName(status) {
  if (status === "marcado") {
    return "marked";
  }

  if (status === "cancelado") {
    return "cancelled";
  }

  return "completed";
}

function renderBookingSummaryCard() {
  const selectionList = document.querySelector("[data-booking-selection]");

  if (!selectionList) {
    return;
  }

  const selectedTeacher = getTeacherById(selectedTeacherId);
  const selectedSlot = getAvailabilityById(selectedSlotId);

  selectionList.innerHTML = `
    <li><strong>Matéria</strong><span>${escapeHtml(selectedSubject || "Selecione uma matéria para começar.")}</span></li>
    <li><strong>Professor</strong><span>${escapeHtml(selectedTeacher ? selectedTeacher.name : "Escolha um professor disponível.")}</span></li>
    <li><strong>Horário</strong><span>${escapeHtml(selectedSlot ? `${selectedSlot.day} | ${selectedSlot.time}` : "Selecione um horário para revisar o agendamento.")}</span></li>
  `;
}

function renderBookingFlow() {
  const subjectList = document.querySelector("[data-subject-list]");
  const teacherList = document.querySelector("[data-teacher-list]");
  const slotList = document.querySelector("[data-booking-slot-list]");

  if (!subjectList || !teacherList || !slotList) {
    return;
  }

  subjectList.innerHTML = appState.subjects
    .map((subject) => {
      const matchingTeachers = appState.availabilities.filter((slot) => slot.subject === subject).length;

      return `
        <button class="option-button ${selectedSubject === subject ? "is-active" : ""}" type="button" data-search-item data-subject-option="${escapeHtml(subject)}">
          <strong>${escapeHtml(subject)}</strong>
          <span>${matchingTeachers} disponibilidade(s) no momento</span>
        </button>
      `;
    })
    .join("");

  if (!selectedSubject) {
    teacherList.innerHTML = `
      <article class="empty-state">
        <strong>Escolha a matéria primeiro.</strong>
        <p>Depois disso, exibiremos somente professores que realmente ministram essa disciplina.</p>
      </article>
    `;
    slotList.innerHTML = `
      <article class="empty-state">
        <strong>Horários aparecerão aqui.</strong>
        <p>A jornada segue o fluxo Matéria → Professor → Horário → Agendar.</p>
      </article>
    `;
    renderBookingSummaryCard();
    return;
  }

  const filteredTeachers = appState.teachers.filter((teacher) => {
    return appState.availabilities.some((slot) => {
      return slot.subject === selectedSubject && slot.teacherId === teacher.id;
    });
  });

  if (!filteredTeachers.some((teacher) => teacher.id === selectedTeacherId)) {
    selectedTeacherId = "";
    selectedSlotId = "";
  }

  if (!filteredTeachers.length) {
    teacherList.innerHTML = `
      <article class="empty-state">
        <strong>Nenhum professor disponível nesta matéria.</strong>
        <p>Escolha outra disciplina ou publique novos horários para continuar o fluxo.</p>
      </article>
    `;
    slotList.innerHTML = `
      <article class="empty-state">
        <strong>Horários indisponíveis no momento.</strong>
        <p>Assim que houver um professor para essa matéria, os horários aparecerão aqui.</p>
      </article>
    `;
    renderBookingSummaryCard();
    return;
  }

  teacherList.innerHTML = filteredTeachers
    .map((teacher) => {
      const teacherSlots = appState.availabilities.filter((slot) => {
        return slot.subject === selectedSubject && slot.teacherId === teacher.id;
      });

      return `
        <button class="option-button ${selectedTeacherId === teacher.id ? "is-active" : ""}" type="button" data-search-item data-teacher-option="${escapeHtml(teacher.id)}">
          <strong>${escapeHtml(teacher.name)}</strong>
          <span>${teacherSlots.length} horário(s) para ${escapeHtml(selectedSubject)}</span>
        </button>
      `;
    })
    .join("");

  if (!selectedTeacherId) {
    slotList.innerHTML = `
      <article class="empty-state">
        <strong>Selecione um professor.</strong>
        <p>Mostraremos apenas os horários ligados à matéria escolhida.</p>
      </article>
    `;
    renderBookingSummaryCard();
    return;
  }

  const slots = getSlotsForSelectedTeacher();

  if (!slots.length) {
    slotList.innerHTML = `
      <article class="empty-state">
        <strong>Esse professor não possui horários nesta matéria.</strong>
        <p>Escolha outro docente ou aguarde a publicação de novas disponibilidades.</p>
      </article>
    `;
    renderBookingSummaryCard();
    reapplySearchFilter();
    return;
  }

  slotList.innerHTML = slots
    .map((slot) => {
      const isFull = slot.reserved >= slot.limit;
      const isAlreadyBooked = Boolean(getStudentAppointmentForSlot(slot.id));
      const disabled = isFull || isAlreadyBooked;
      const buttonLabel = isAlreadyBooked ? "Já agendado" : isFull ? "Lotado" : "Agendar";

      return `
        <article class="slot-card panel-card ${isFull ? "is-full" : ""}" data-search-item>
          <header>
            <strong>${escapeHtml(slot.teacherName)}</strong>
            <p>${escapeHtml(slot.day)} | ${escapeHtml(slot.time)}</p>
          </header>
          <section class="slot-meta">
            <span class="chip">${escapeHtml(slot.subject)}</span>
            <span class="chip">${escapeHtml(formatReserved(slot))}</span>
            <span class="chip">${escapeHtml(formatLocation(slot))}</span>
            <span class="chip">Modalidade: ${escapeHtml(formatMode(slot.mode))}</span>
          </section>
          <section class="slot-actions">
            <button class="btn ${disabled ? "btn-secondary" : "btn-primary"}" type="button" data-booking-slot="${escapeHtml(slot.id)}" ${disabled ? "disabled" : ""}>${buttonLabel}</button>
          </section>
        </article>
      `;
    })
    .join("");

  renderBookingSummaryCard();
  reapplySearchFilter();
}

function populateBookingDialog(slotId) {
  const summary = document.querySelector("[data-booking-summary]");
  const confirmButton = document.querySelector("[data-booking-confirm]");
  const dialog = document.querySelector("#booking-dialog");
  const slot = getAvailabilityById(slotId);

  if (!summary || !confirmButton || !dialog || !slot) {
    return;
  }

  selectedSlotId = slotId;
  renderBookingSummaryCard();
  summary.textContent = `${slot.subject} | ${slot.teacherName} | ${slot.day} | ${slot.time} | ${formatLocation(slot)}`;
  confirmButton.dataset.slotId = slotId;
  dialog.showModal();
  document.body.classList.add("dialog-open");
}

function setupBookingFlow() {
  const subjectList = document.querySelector("[data-subject-list]");
  const teacherList = document.querySelector("[data-teacher-list]");
  const slotList = document.querySelector("[data-booking-slot-list]");
  const confirmButton = document.querySelector("[data-booking-confirm]");

  if (!subjectList || !teacherList || !slotList || !confirmButton) {
    return;
  }

  renderBookingFlow();

  subjectList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-subject-option]");

    if (!button) {
      return;
    }

    selectedSubject = button.dataset.subjectOption;
    selectedTeacherId = "";
    selectedSlotId = "";
    renderBookingFlow();
  });

  teacherList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-teacher-option]");

    if (!button) {
      return;
    }

    selectedTeacherId = button.dataset.teacherOption;
    selectedSlotId = "";
    renderBookingFlow();
  });

  slotList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-booking-slot]");

    if (!button || button.disabled) {
      return;
    }

    populateBookingDialog(button.dataset.bookingSlot);
  });

  confirmButton.addEventListener("click", () => {
    const slot = getAvailabilityById(confirmButton.dataset.slotId || "");

    if (!slot) {
      return;
    }

    if (getStudentAppointmentForSlot(slot.id)) {
      setStatusMessage("[data-booking-status]", "error", "Esse horário já está reservado na sua agenda.");
      return;
    }

    if (slot.reserved >= slot.limit) {
      setStatusMessage("[data-booking-status]", "error", "Esse horário acabou de ficar sem vagas.");
      return;
    }

    slot.reserved += 1;
    appState.appointments.unshift({
      id: generateId("appointment"),
      studentId: CURRENT_STUDENT.id,
      studentName: CURRENT_STUDENT.name,
      teacherId: slot.teacherId,
      teacherName: slot.teacherName,
      subject: slot.subject,
      slotId: slot.id,
      day: slot.day,
      time: slot.time,
      mode: formatMode(slot.mode),
      place: slot.mode === "online" ? slot.link : slot.location,
      status: "marcado",
      updated: false,
      updateNote: "",
    });

    pushNotification({
      audience: "student",
      recipientId: CURRENT_STUDENT.id,
      title: `Agendamento confirmado com ${slot.teacherName}.`,
      body: `${slot.subject} | ${slot.day} | ${slot.time} | ${formatLocation(slot)}`,
      tone: "success",
    });

    saveState();
    renderAll();
    setStatusMessage("[data-booking-status]", "success", `Agendamento concluído em ${slot.subject} com ${slot.teacherName}.`);

    const dialog = document.querySelector("#booking-dialog");
    if (window.EduUI && dialog) {
      window.setTimeout(() => {
        window.EduUI.closeDialog(dialog);
      }, 450);
    }
  });
}

function syncAvailabilityMode(selectElement, onlineFields, onsiteFields) {
  const isOnline = selectElement.value === "online";
  onlineFields.hidden = !isOnline;
  onsiteFields.hidden = isOnline;
}

function collectAvailabilityData(form) {
  const mode = form.querySelector('select[name="mode"]').value;

  return {
    subject: form.querySelector('select[name="subject"]').value,
    day: form.querySelector('select[name="day"]').value,
    time: form.querySelector('input[name="time"]').value.trim(),
    mode,
    limit: Number(form.querySelector('input[name="limit"]').value),
    location: mode === "onsite" ? form.querySelector('input[name="location"]').value.trim() : "",
    link: mode === "online" ? form.querySelector('input[name="link"]').value.trim() : "",
  };
}

function isAvailabilityDataValid(data) {
  return Boolean(
    data.subject &&
    data.day &&
    data.time &&
    data.limit &&
    ((data.mode === "online" && data.link) || (data.mode === "onsite" && data.location))
  );
}

function renderTeacherAvailabilities() {
  const slotList = document.querySelector("[data-slot-list]");

  if (!slotList) {
    return;
  }

  const teacherSlots = getTeacherSlots();

  if (!teacherSlots.length) {
    slotList.innerHTML = `
      <article class="empty-state">
        <strong>Nenhuma disponibilidade criada ainda.</strong>
        <p>Publique o primeiro horário para liberar edição, exclusão e avisos simulados aos alunos.</p>
      </article>
    `;
  } else {
    slotList.innerHTML = teacherSlots
      .map((slot) => {
        return `
          <article class="slot-card panel-card" data-search-item>
            <header>
              <strong>${escapeHtml(slot.subject)}</strong>
              <p>${escapeHtml(slot.day)} | ${escapeHtml(slot.time)} | ${escapeHtml(formatMode(slot.mode))}</p>
            </header>
            <section class="slot-meta">
              <span class="chip">${escapeHtml(formatReserved(slot))}</span>
              <span class="chip">${escapeHtml(formatLocation(slot))}</span>
              ${slot.reserved > 0 ? '<span class="status-badge warning">Com aluno inscrito</span>' : '<span class="status-badge completed">Sem reserva</span>'}
            </section>
            <section class="slot-actions">
              <button class="btn btn-secondary" type="button" data-edit-availability="${escapeHtml(slot.id)}">Editar</button>
              <button class="btn btn-danger" type="button" data-delete-availability="${escapeHtml(slot.id)}">Excluir</button>
            </section>
          </article>
        `;
      })
      .join("");
  }

  reapplySearchFilter();
}

function getChangeNotifications(originalSlot, updatedSlot) {
  const messages = [];

  if (originalSlot.day !== updatedSlot.day || originalSlot.time !== updatedSlot.time) {
    messages.push({
      title: `Seu atendimento com ${updatedSlot.teacherName} foi atualizado.`,
      body: `Novo horário: ${updatedSlot.day} | ${updatedSlot.time}.`,
    });
  }

  if (originalSlot.mode !== updatedSlot.mode) {
    messages.push({
      title: "A modalidade do atendimento foi alterada.",
      body: `Agora o encontro será ${formatMode(updatedSlot.mode).toLowerCase()}.`,
    });
  }

  if (originalSlot.location !== updatedSlot.location && updatedSlot.mode === "onsite") {
    messages.push({
      title: "O local do atendimento foi alterado.",
      body: `Novo local: ${updatedSlot.location}.`,
    });
  }

  if (originalSlot.link !== updatedSlot.link && updatedSlot.mode === "online") {
    messages.push({
      title: "O link do atendimento foi alterado.",
      body: `Novo acesso: ${updatedSlot.link}.`,
    });
  }

  return messages;
}

function syncAppointmentsFromSlot(slotId, slot, updateMessages) {
  appState.appointments = appState.appointments.map((appointment) => {
    if (appointment.slotId !== slotId) {
      return appointment;
    }

    return {
      ...appointment,
      subject: slot.subject,
      day: slot.day,
      time: slot.time,
      mode: formatMode(slot.mode),
      place: slot.mode === "online" ? slot.link : slot.location,
      updated: updateMessages.length > 0,
      updateNote: updateMessages.length > 0 ? updateMessages[0].title : "",
    };
  });
}

function openEditAvailabilityModal(slotId) {
  const dialog = document.querySelector("#availability-edit-dialog");
  const form = document.querySelector("[data-availability-edit-form]");
  const slot = getAvailabilityById(slotId);

  if (!dialog || !form || !slot) {
    return;
  }

  editingSlotId = slotId;
  form.querySelector('select[name="subject"]').value = slot.subject;
  form.querySelector('select[name="day"]').value = slot.day;
  form.querySelector('input[name="time"]').value = slot.time;
  form.querySelector('select[name="mode"]').value = slot.mode;
  form.querySelector('input[name="limit"]').value = String(slot.limit);
  form.querySelector('input[name="location"]').value = slot.location;
  form.querySelector('input[name="link"]').value = slot.link;

  const onlineFields = form.querySelector("[data-edit-online-fields]");
  const onsiteFields = form.querySelector("[data-edit-onsite-fields]");
  syncAvailabilityMode(form.querySelector('select[name="mode"]'), onlineFields, onsiteFields);
  dialog.showModal();
  document.body.classList.add("dialog-open");
}

function openDeleteAvailabilityModal(slotId) {
  const dialog = document.querySelector("#availability-delete-dialog");
  const summary = document.querySelector("[data-delete-summary]");
  const slot = getAvailabilityById(slotId);

  if (!dialog || !summary || !slot) {
    return;
  }

  deletingSlotId = slotId;
  summary.textContent = `${slot.subject} | ${slot.day} | ${slot.time} | ${formatLocation(slot)}${slot.reserved > 0 ? " | Há aluno inscrito nesse horário." : ""}`;
  dialog.showModal();
  document.body.classList.add("dialog-open");
}

function setupAvailabilityManager() {
  const form = document.querySelector("[data-availability-form]");
  const slotList = document.querySelector("[data-slot-list]");
  const editForm = document.querySelector("[data-availability-edit-form]");
  const deleteButton = document.querySelector("[data-delete-confirm]");

  if (!form || !slotList || !editForm || !deleteButton) {
    return;
  }

  const modeSelect = form.querySelector('select[name="mode"]');
  const onlineFields = form.querySelector("[data-online-fields]");
  const onsiteFields = form.querySelector("[data-onsite-fields]");
  syncAvailabilityMode(modeSelect, onlineFields, onsiteFields);

  modeSelect.addEventListener("change", () => {
    syncAvailabilityMode(modeSelect, onlineFields, onsiteFields);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = collectAvailabilityData(form);

    if (!isAvailabilityDataValid(data)) {
      setStatusMessage("[data-availability-status]", "error", "Preencha matéria, dia, horário, modalidade e o campo de local ou link.");
      return;
    }

    appState.availabilities.unshift({
      id: generateId("slot"),
      teacherId: CURRENT_TEACHER.id,
      teacherName: CURRENT_TEACHER.name,
      reserved: 0,
      ...data,
    });

    pushNotification({
      audience: "teacher",
      recipientId: CURRENT_TEACHER.id,
      title: "Nova disponibilidade publicada.",
      body: `${data.subject} | ${data.day} | ${data.time} | ${formatMode(data.mode)}`,
      tone: "success",
    });

    saveState();
    form.reset();
    modeSelect.value = "online";
    syncAvailabilityMode(modeSelect, onlineFields, onsiteFields);
    renderAll();
    setStatusMessage("[data-availability-status]", "success", "Disponibilidade criada com ações de editar e excluir.");
  });

  slotList.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-availability]");
    const deleteTrigger = event.target.closest("[data-delete-availability]");

    if (editButton) {
      openEditAvailabilityModal(editButton.dataset.editAvailability);
    }

    if (deleteTrigger) {
      openDeleteAvailabilityModal(deleteTrigger.dataset.deleteAvailability);
    }
  });

  const editModeSelect = editForm.querySelector('select[name="mode"]');
  const editOnlineFields = editForm.querySelector("[data-edit-online-fields]");
  const editOnsiteFields = editForm.querySelector("[data-edit-onsite-fields]");

  editModeSelect.addEventListener("change", () => {
    syncAvailabilityMode(editModeSelect, editOnlineFields, editOnsiteFields);
  });

  editForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const slot = getAvailabilityById(editingSlotId);
    const data = collectAvailabilityData(editForm);

    if (!slot || !isAvailabilityDataValid(data)) {
      setStatusMessage("[data-availability-status]", "error", "Revise os dados antes de salvar a edição.");
      return;
    }

    if (data.limit < slot.reserved) {
      setStatusMessage("[data-availability-status]", "error", `Esse horário já possui ${slot.reserved} aluno(s) inscrito(s). Ajuste o limite antes de salvar.`);
      return;
    }

    const updateMessages = slot.reserved > 0 ? getChangeNotifications(slot, { ...slot, ...data }) : [];
    const slotIndex = appState.availabilities.findIndex((item) => item.id === editingSlotId);

    appState.availabilities[slotIndex] = {
      ...slot,
      ...data,
    };

    if (updateMessages.length > 0) {
      syncAppointmentsFromSlot(editingSlotId, appState.availabilities[slotIndex], updateMessages);

      updateMessages.forEach((message) => {
        pushNotification({
          audience: "student",
          recipientId: CURRENT_STUDENT.id,
          title: message.title,
          body: message.body,
          tone: "warning",
        });
      });

      pushNotification({
        audience: "teacher",
        recipientId: CURRENT_TEACHER.id,
        title: "Alunos inscritos foram avisados sobre a mudança.",
        body: `${slot.subject} | ${slot.day} → ${data.day} | ${slot.time} → ${data.time}`,
        tone: "success",
      });
    }

    saveState();
    renderAll();
    setStatusMessage("[data-availability-status]", "success", updateMessages.length > 0 ? "Disponibilidade atualizada e avisos enviados aos alunos inscritos." : "Disponibilidade atualizada com sucesso.");

    const dialog = document.querySelector("#availability-edit-dialog");
    if (window.EduUI && dialog) {
      window.EduUI.closeDialog(dialog);
    }
  });

  deleteButton.addEventListener("click", () => {
    const slot = getAvailabilityById(deletingSlotId);

    if (!slot) {
      return;
    }

    if (slot.reserved > 0) {
      appState.appointments = appState.appointments.map((appointment) => {
        if (appointment.slotId !== deletingSlotId) {
          return appointment;
        }

        return {
          ...appointment,
          status: "cancelado",
          updated: true,
          updateNote: `A disponibilidade de ${slot.teacherName} foi removida pelo professor.`,
        };
      });

      pushNotification({
        audience: "student",
        recipientId: CURRENT_STUDENT.id,
        title: `Seu atendimento com ${slot.teacherName} foi cancelado.`,
        body: `A disponibilidade de ${slot.subject} em ${slot.day} | ${slot.time} foi removida.`,
        tone: "warning",
      });
    }

    appState.availabilities = appState.availabilities.filter((item) => item.id !== deletingSlotId);
    pushNotification({
      audience: "teacher",
      recipientId: CURRENT_TEACHER.id,
      title: "Disponibilidade excluída.",
      body: `${slot.subject} | ${slot.day} | ${slot.time}`,
      tone: "success",
    });

    saveState();
    renderAll();
    setStatusMessage("[data-availability-status]", "success", "Disponibilidade excluída com confirmação visual.");

    const dialog = document.querySelector("#availability-delete-dialog");
    if (window.EduUI && dialog) {
      window.EduUI.closeDialog(dialog);
    }
  });

  renderTeacherAvailabilities();
}

function setupSearchFilter() {
  const input = document.querySelector("[data-search-input]");

  if (!input) {
    return;
  }

  input.addEventListener("input", reapplySearchFilter);
}

function reapplySearchFilter() {
  const input = document.querySelector("[data-search-input]");

  if (!input) {
    return;
  }

  const query = input.value.trim().toLowerCase();
  const items = document.querySelectorAll("[data-search-item]");

  items.forEach((item) => {
    item.hidden = query.length > 0 && !item.textContent.toLowerCase().includes(query);
  });
}

function setupProfileModal() {
  const form = document.querySelector("[data-profile-form]");

  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = form.querySelector('input[name="name"]').value;
    const email = form.querySelector('input[name="email"]').value;
    const school = form.querySelector('input[name="school"]').value;

    document.querySelectorAll("[data-profile-name]").forEach((node) => {
      node.textContent = name;
    });

    document.querySelectorAll("[data-profile-email]").forEach((node) => {
      node.textContent = email;
    });

    document.querySelectorAll("[data-profile-school]").forEach((node) => {
      node.textContent = school;
    });

    setStatusMessage("[data-profile-status]", "success", "Perfil atualizado visualmente com sucesso.");

    const dialog = document.querySelector("#profile-dialog");
    if (window.EduUI && dialog) {
      window.setTimeout(() => {
        window.EduUI.closeDialog(dialog);
      }, 500);
    }
  });
}

function renderAll() {
  saveState();
  renderNotificationCenter();
  renderDashboardSummary();
  renderAppointments();
  renderBookingFlow();
  renderTeacherAvailabilities();
  reapplySearchFilter();
}

document.addEventListener("DOMContentLoaded", () => {
  saveState();
  setupSearchFilter();
  setupProfileModal();
  setupBookingFlow();
  setupAvailabilityManager();
  renderAll();
});
