const ADMIN_STORAGE_KEY = "eduScheduleAdminStateV2";
const ADMIN_STATE_VERSION = 1;

let adminState = loadAdminState();
let editingStudentId = "";
let removingStudentId = "";
let editingTeacherId = "";
let removingTeacherId = "";

function createAdminInitialState() {
  return {
    version: ADMIN_STATE_VERSION,
    students: [
      {
        id: "student-ana",
        name: "Ana Martins",
        email: "ana.martins@campus.edu.br",
        course: "TSI-3",
        status: "Ativo",
      },
      {
        id: "student-lucas",
        name: "Lucas Pereira",
        email: "lucas.pereira@campus.edu.br",
        course: "INFO-2B",
        status: "Em acompanhamento",
      },
      {
        id: "student-marina",
        name: "Marina Costa",
        email: "marina.costa@campus.edu.br",
        course: "Eletro-1",
        status: "Ativo",
      },
    ],
    teachers: [
      {
        id: "teacher-joao",
        name: "Professor Joao",
        email: "joao@campus.edu.br",
        subjects: ["Programacao Web", "Banco de Dados"],
        bond: "IFSUL Campus Pelotas Centro",
        status: "Pendente",
      },
      {
        id: "teacher-camila",
        name: "Professora Camila",
        email: "camila@campus.edu.br",
        subjects: ["Fisica"],
        bond: "IFSUL Campus Pelotas Centro",
        status: "Aprovado",
      },
      {
        id: "teacher-renato",
        name: "Professor Renato",
        email: "renato@campus.edu.br",
        subjects: ["Matematica", "Monitoria"],
        bond: "Rede Tecnica Sul",
        status: "Em revisao",
      },
    ],
    faqs: [
      {
        id: 1,
        question: "Como funciona o fluxo de atendimento?",
        answer: "O painel organiza disponibilidades, agendamentos e avisos em uma unica rotina.",
        published: true,
      },
      {
        id: 2,
        question: "Como professores entram na plataforma?",
        answer: "O cadastro passa por solicitacao de vinculo escolar antes da aprovacao final.",
        published: true,
      },
      {
        id: 3,
        question: "Como a escola cria o ambiente SaaS?",
        answer: "O administrador escolhe um plano, cadastra a escola e salva as configuracoes institucionais.",
        published: false,
      },
    ],
  };
}

function loadAdminState() {
  try {
    const rawState = window.localStorage.getItem(ADMIN_STORAGE_KEY);

    if (!rawState) {
      return createAdminInitialState();
    }

    const parsedState = JSON.parse(rawState);

    if (
      !parsedState ||
      parsedState.version !== ADMIN_STATE_VERSION ||
      !Array.isArray(parsedState.students) ||
      !Array.isArray(parsedState.teachers) ||
      !Array.isArray(parsedState.faqs)
    ) {
      return createAdminInitialState();
    }

    return parsedState;
  } catch (error) {
    return createAdminInitialState();
  }
}

function saveAdminState() {
  window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminState));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function setAdminStatus(selector, type, message) {
  const status = document.querySelector(selector);

  if (!status) {
    return;
  }

  status.classList.remove("is-success", "is-error");
  status.classList.add(type === "success" ? "is-success" : "is-error");
  status.textContent = message;
}

function openDialog(dialog) {
  if (!dialog || typeof dialog.showModal !== "function") {
    return;
  }

  dialog.showModal();
  document.body.classList.add("dialog-open");
}

function closeDialog(dialog) {
  if (!dialog) {
    return;
  }

  if (window.EduUI && typeof window.EduUI.closeDialog === "function") {
    window.EduUI.closeDialog(dialog);
  } else if (dialog.open) {
    dialog.close();
  }

  document.body.classList.remove("dialog-open");
}

function getStatusClass(status) {
  if (status === "Aprovado" || status === "Ativo") {
    return "approved";
  }

  if (status === "Inativo" || status === "Removido") {
    return "danger";
  }

  if (status === "Em acompanhamento" || status === "Em revisao") {
    return "warning";
  }

  return "pending";
}

function reapplyAdminSearch() {
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

function setupAdminSearch() {
  const input = document.querySelector("[data-search-input]");

  if (!input) {
    return;
  }

  input.addEventListener("input", reapplyAdminSearch);
}

function renderStudents() {
  const body = document.querySelector("[data-student-table]");

  if (!body) {
    return;
  }

  body.innerHTML = adminState.students
    .map((student) => {
      return `
        <tr data-search-item>
          <td>${escapeHtml(student.name)}</td>
          <td>${escapeHtml(student.email)}</td>
          <td>${escapeHtml(student.course)}</td>
          <td><span class="status-badge ${getStatusClass(student.status)}">${escapeHtml(student.status)}</span></td>
          <td class="table-actions">
            <button class="btn btn-secondary" type="button" data-student-edit="${escapeHtml(student.id)}">Editar</button>
            <button class="btn btn-danger" type="button" data-student-remove="${escapeHtml(student.id)}">Remover</button>
          </td>
        </tr>
      `;
    })
    .join("");

  reapplyAdminSearch();
}

function openStudentEditor(studentId) {
  const dialog = document.querySelector("#student-dialog");
  const form = document.querySelector("[data-student-form]");
  const title = document.querySelector("[data-student-dialog-title]");
  const student = adminState.students.find((item) => item.id === studentId);

  if (!dialog || !form || !title || !student) {
    return;
  }

  editingStudentId = studentId;
  title.textContent = "Editar aluno";
  form.querySelector('input[name="name"]').value = student.name;
  form.querySelector('input[name="email"]').value = student.email;
  form.querySelector('input[name="course"]').value = student.course;
  form.querySelector('select[name="status"]').value = student.status;
  openDialog(dialog);
}

function openStudentRemoval(studentId) {
  const dialog = document.querySelector("#student-delete-dialog");
  const summary = document.querySelector("[data-student-delete-summary]");
  const student = adminState.students.find((item) => item.id === studentId);

  if (!dialog || !summary || !student) {
    return;
  }

  removingStudentId = studentId;
  summary.textContent = `${student.name} | ${student.email} | ${student.course}`;
  openDialog(dialog);
}

function setupStudentActions() {
  const body = document.querySelector("[data-student-table]");
  const form = document.querySelector("[data-student-form]");
  const dialog = document.querySelector("#student-dialog");
  const deleteDialog = document.querySelector("#student-delete-dialog");
  const deleteButton = document.querySelector("[data-student-delete-confirm]");

  if (!body || !form || !dialog || !deleteDialog || !deleteButton) {
    return;
  }

  body.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-student-edit]");
    const removeButton = event.target.closest("[data-student-remove]");

    if (editButton) {
      openStudentEditor(editButton.dataset.studentEdit);
    }

    if (removeButton) {
      openStudentRemoval(removeButton.dataset.studentRemove);
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const course = form.querySelector('input[name="course"]').value.trim();
    const status = form.querySelector('select[name="status"]').value;

    if (!name || !validateEmail(email) || !course || !status) {
      setAdminStatus("[data-student-status]", "error", "Revise nome, e-mail, curso/turma e status antes de salvar.");
      return;
    }

    adminState.students = adminState.students.map((student) => {
      if (student.id !== editingStudentId) {
        return student;
      }

      return {
        ...student,
        name,
        email,
        course,
        status,
      };
    });

    saveAdminState();
    renderStudents();
    setAdminStatus("[data-student-status]", "success", "Aluno atualizado com sucesso.");
    closeDialog(dialog);
  });

  deleteButton.addEventListener("click", () => {
    const student = adminState.students.find((item) => item.id === removingStudentId);

    if (!student) {
      return;
    }

    adminState.students = adminState.students.filter((item) => item.id !== removingStudentId);
    saveAdminState();
    renderStudents();
    setAdminStatus("[data-student-status]", "success", `${student.name} removido da lista administrativa.`);
    closeDialog(deleteDialog);
  });
}

function renderTeachers() {
  const body = document.querySelector("[data-professor-table]");

  if (!body) {
    return;
  }

  body.innerHTML = adminState.teachers
    .map((teacher) => {
      const subjectsMarkup = teacher.subjects
        .map((subject) => `<span class="chip">${escapeHtml(subject)}</span>`)
        .join("");

      const approveDisabled = teacher.status === "Aprovado" ? "disabled" : "";

      return `
        <tr data-search-item>
          <td>${escapeHtml(teacher.name)}</td>
          <td>${escapeHtml(teacher.email)}</td>
          <td>
            <div class="table-cell-stack">
              <div class="inline-chips">${subjectsMarkup}</div>
            </div>
          </td>
          <td>${escapeHtml(teacher.bond)}</td>
          <td><span class="status-badge ${getStatusClass(teacher.status)}">${escapeHtml(teacher.status)}</span></td>
          <td class="table-actions">
            <button class="btn btn-secondary" type="button" data-teacher-edit="${escapeHtml(teacher.id)}">Editar</button>
            <button class="btn btn-primary" type="button" data-teacher-approve="${escapeHtml(teacher.id)}" ${approveDisabled}>Aprovar</button>
            <button class="btn btn-danger" type="button" data-teacher-remove="${escapeHtml(teacher.id)}">Remover</button>
          </td>
        </tr>
      `;
    })
    .join("");

  reapplyAdminSearch();
}

function openTeacherEditor(teacherId) {
  const dialog = document.querySelector("#teacher-dialog");
  const form = document.querySelector("[data-teacher-form]");
  const title = document.querySelector("[data-teacher-dialog-title]");
  const teacher = adminState.teachers.find((item) => item.id === teacherId);

  if (!dialog || !form || !title || !teacher) {
    return;
  }

  editingTeacherId = teacherId;
  title.textContent = "Editar professor";
  form.querySelector('input[name="name"]').value = teacher.name;
  form.querySelector('input[name="email"]').value = teacher.email;
  form.querySelector('input[name="subjects"]').value = teacher.subjects.join(", ");
  form.querySelector('input[name="bond"]').value = teacher.bond;
  form.querySelector('select[name="status"]').value = teacher.status;
  openDialog(dialog);
}

function openTeacherRemoval(teacherId) {
  const dialog = document.querySelector("#teacher-delete-dialog");
  const summary = document.querySelector("[data-teacher-delete-summary]");
  const teacher = adminState.teachers.find((item) => item.id === teacherId);

  if (!dialog || !summary || !teacher) {
    return;
  }

  removingTeacherId = teacherId;
  summary.textContent = `${teacher.name} | ${teacher.email} | ${teacher.bond}`;
  openDialog(dialog);
}

function setupTeacherActions() {
  const body = document.querySelector("[data-professor-table]");
  const form = document.querySelector("[data-teacher-form]");
  const dialog = document.querySelector("#teacher-dialog");
  const deleteDialog = document.querySelector("#teacher-delete-dialog");
  const deleteButton = document.querySelector("[data-teacher-delete-confirm]");

  if (!body || !form || !dialog || !deleteDialog || !deleteButton) {
    return;
  }

  body.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-teacher-edit]");
    const approveButton = event.target.closest("[data-teacher-approve]");
    const removeButton = event.target.closest("[data-teacher-remove]");

    if (editButton) {
      openTeacherEditor(editButton.dataset.teacherEdit);
      return;
    }

    if (approveButton) {
      adminState.teachers = adminState.teachers.map((teacher) => {
        if (teacher.id !== approveButton.dataset.teacherApprove) {
          return teacher;
        }

        return {
          ...teacher,
          status: "Aprovado",
        };
      });

      saveAdminState();
      renderTeachers();
      setAdminStatus("[data-professor-status]", "success", "Professor aprovado visualmente.");
      return;
    }

    if (removeButton) {
      openTeacherRemoval(removeButton.dataset.teacherRemove);
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const subjects = form.querySelector('input[name="subjects"]').value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const bond = form.querySelector('input[name="bond"]').value.trim();
    const status = form.querySelector('select[name="status"]').value;

    if (!name || !validateEmail(email) || !subjects.length || !bond || !status) {
      setAdminStatus("[data-professor-status]", "error", "Preencha nome, e-mail, materias, vinculo e status antes de salvar.");
      return;
    }

    adminState.teachers = adminState.teachers.map((teacher) => {
      if (teacher.id !== editingTeacherId) {
        return teacher;
      }

      return {
        ...teacher,
        name,
        email,
        subjects,
        bond,
        status,
      };
    });

    saveAdminState();
    renderTeachers();
    setAdminStatus("[data-professor-status]", "success", "Professor atualizado com sucesso.");
    closeDialog(dialog);
  });

  deleteButton.addEventListener("click", () => {
    const teacher = adminState.teachers.find((item) => item.id === removingTeacherId);

    if (!teacher) {
      return;
    }

    adminState.teachers = adminState.teachers.filter((item) => item.id !== removingTeacherId);
    saveAdminState();
    renderTeachers();
    setAdminStatus("[data-professor-status]", "success", `${teacher.name} removido do quadro.`);
    closeDialog(deleteDialog);
  });
}

function renderFaq() {
  const body = document.querySelector("[data-faq-body]");

  if (!body) {
    return;
  }

  body.innerHTML = adminState.faqs
    .map((item) => {
      return `
        <tr data-search-item>
          <td>${escapeHtml(item.question)}</td>
          <td><span class="status-badge ${item.published ? "published" : "pending"}">${item.published ? "Publicado" : "Rascunho"}</span></td>
          <td class="table-actions">
            <button class="btn btn-secondary" type="button" data-faq-edit="${item.id}">Editar</button>
            <button class="btn btn-warning" type="button" data-faq-publish="${item.id}">${item.published ? "Despublicar" : "Publicar"}</button>
            <button class="btn btn-danger" type="button" data-faq-delete="${item.id}">Excluir</button>
          </td>
        </tr>
      `;
    })
    .join("");

  reapplyAdminSearch();
}

function setupFaqCrud() {
  const body = document.querySelector("[data-faq-body]");
  const createButton = document.querySelector("[data-faq-create]");
  const dialog = document.querySelector("#faq-dialog");
  const form = document.querySelector("[data-faq-form]");
  const title = document.querySelector("[data-faq-dialog-title]");

  if (!body || !createButton || !dialog || !form || !title) {
    return;
  }

  function openCreateMode() {
    form.reset();
    form.dataset.editId = "";
    title.textContent = "Criar pergunta";
    openDialog(dialog);
  }

  function openEditMode(id) {
    const item = adminState.faqs.find((faqItem) => faqItem.id === id);

    if (!item) {
      return;
    }

    title.textContent = "Editar pergunta";
    form.dataset.editId = String(id);
    form.querySelector('input[name="question"]').value = item.question;
    form.querySelector('textarea[name="answer"]').value = item.answer;
    openDialog(dialog);
  }

  createButton.addEventListener("click", openCreateMode);

  body.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-faq-edit]");
    const publishButton = event.target.closest("[data-faq-publish]");
    const deleteButton = event.target.closest("[data-faq-delete]");

    if (editButton) {
      openEditMode(Number(editButton.dataset.faqEdit));
      return;
    }

    if (publishButton) {
      const id = Number(publishButton.dataset.faqPublish);
      adminState.faqs = adminState.faqs.map((item) => (
        item.id === id ? { ...item, published: !item.published } : item
      ));
      saveAdminState();
      renderFaq();
      setAdminStatus("[data-faq-status]", "success", "Status de publicacao atualizado.");
      return;
    }

    if (deleteButton) {
      const id = Number(deleteButton.dataset.faqDelete);
      adminState.faqs = adminState.faqs.filter((item) => item.id !== id);
      saveAdminState();
      renderFaq();
      setAdminStatus("[data-faq-status]", "success", "Pergunta removida do FAQ.");
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const question = form.querySelector('input[name="question"]').value.trim();
    const answer = form.querySelector('textarea[name="answer"]').value.trim();
    const editId = Number(form.dataset.editId);

    if (!question || !answer) {
      setAdminStatus("[data-faq-status]", "error", "Preencha pergunta e resposta para salvar.");
      return;
    }

    if (editId) {
      adminState.faqs = adminState.faqs.map((item) => (
        item.id === editId ? { ...item, question, answer } : item
      ));
      setAdminStatus("[data-faq-status]", "success", "Pergunta atualizada com sucesso.");
    } else {
      adminState.faqs = [
        {
          id: Date.now(),
          question,
          answer,
          published: false,
        },
        ...adminState.faqs,
      ];
      setAdminStatus("[data-faq-status]", "success", "Nova pergunta criada.");
    }

    saveAdminState();
    renderFaq();
    closeDialog(dialog);
  });

  renderFaq();
}

function setupSchoolSettings() {
  const form = document.querySelector("[data-school-settings-form]");
  const status = document.querySelector("[data-school-settings-status]");

  if (!form || !status || !window.EduScheduleContext) {
    return;
  }

  const saasState = window.EduScheduleContext.loadSaasState();
  const school = saasState.school;

  form.querySelector('input[name="schoolName"]').value = school.name;
  form.querySelector('input[name="schoolCode"]').value = school.code;
  form.querySelector('input[name="schoolEmail"]').value = school.email;
  form.querySelector('input[name="schoolPhone"]').value = school.phone;
  form.querySelector('input[name="city"]').value = school.city;
  form.querySelector('input[name="state"]').value = school.state;
  form.querySelector('input[name="logoName"]').value = school.logoName || school.name;
  form.querySelector('input[name="studentsEstimate"]').value = school.studentsEstimate;
  form.querySelector('select[name="appearance"]').value = school.preferences.appearance || "Aurora verde";
  form.querySelector('input[name="notifications"]').checked = Boolean(school.preferences.notifications);
  form.querySelector('input[name="publicCatalog"]').checked = Boolean(school.preferences.publicCatalog);

  const previewNodes = {
    logo: document.querySelector("[data-school-preview-logo]"),
    logoName: document.querySelector("[data-school-preview-logo-name]"),
    name: document.querySelector("[data-school-preview-name]"),
    plan: document.querySelector("[data-school-preview-plan]"),
    code: document.querySelector("[data-school-preview-code]"),
    email: document.querySelector("[data-school-preview-email]"),
    phone: document.querySelector("[data-school-preview-phone]"),
    city: document.querySelector("[data-school-preview-city]"),
    students: document.querySelector("[data-school-preview-students]"),
    appearance: document.querySelector("[data-school-preview-appearance]"),
  };

  function getInitials(name) {
    return (name || "EduSchedule")
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "ES";
  }

  function syncPreview() {
    const schoolName = form.querySelector('input[name="schoolName"]').value.trim() || "Sua escola";
    const schoolCode = form.querySelector('input[name="schoolCode"]').value.trim() || "CODIGO";
    const schoolEmail = form.querySelector('input[name="schoolEmail"]').value.trim() || "contato@escola.edu";
    const schoolPhone = form.querySelector('input[name="schoolPhone"]').value.trim() || "(00) 0000-0000";
    const city = form.querySelector('input[name="city"]').value.trim() || "Cidade";
    const schoolState = form.querySelector('input[name="state"]').value.trim() || "UF";
    const logoName = form.querySelector('input[name="logoName"]').value.trim() || schoolName;
    const students = form.querySelector('input[name="studentsEstimate"]').value.trim() || "0 alunos";
    const appearance = form.querySelector('select[name="appearance"]').value;

    if (previewNodes.logo) {
      previewNodes.logo.textContent = getInitials(schoolName);
    }

    if (previewNodes.logoName) {
      previewNodes.logoName.textContent = logoName;
    }

    if (previewNodes.name) {
      previewNodes.name.textContent = schoolName;
    }

    if (previewNodes.plan) {
      previewNodes.plan.textContent = saasState.plans[saasState.selectedPlan].name;
    }

    if (previewNodes.code) {
      previewNodes.code.textContent = schoolCode;
    }

    if (previewNodes.email) {
      previewNodes.email.textContent = schoolEmail;
    }

    if (previewNodes.phone) {
      previewNodes.phone.textContent = schoolPhone;
    }

    if (previewNodes.city) {
      previewNodes.city.textContent = `${city} - ${schoolState}`;
    }

    if (previewNodes.students) {
      previewNodes.students.textContent = students;
    }

    if (previewNodes.appearance) {
      previewNodes.appearance.textContent = appearance;
    }
  }

  form.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("input", syncPreview);
    field.addEventListener("change", syncPreview);
  });

  syncPreview();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.classList.remove("is-success", "is-error");

    const schoolName = form.querySelector('input[name="schoolName"]').value.trim();
    const schoolCode = form.querySelector('input[name="schoolCode"]').value.trim();
    const schoolEmail = form.querySelector('input[name="schoolEmail"]').value.trim();
    const schoolPhone = form.querySelector('input[name="schoolPhone"]').value.trim();
    const city = form.querySelector('input[name="city"]').value.trim();
    const schoolState = form.querySelector('input[name="state"]').value.trim();
    const logoName = form.querySelector('input[name="logoName"]').value.trim();
    const studentsEstimate = form.querySelector('input[name="studentsEstimate"]').value.trim();
    const appearance = form.querySelector('select[name="appearance"]').value;
    const notifications = form.querySelector('input[name="notifications"]').checked;
    const publicCatalog = form.querySelector('input[name="publicCatalog"]').checked;

    if (!schoolName || !schoolCode || !validateEmail(schoolEmail) || !schoolPhone || !city || !schoolState || !logoName || !studentsEstimate) {
      status.classList.add("is-error");
      status.textContent = "Revise os dados da escola antes de salvar as configuracoes.";
      return;
    }

    saasState.school = {
      ...saasState.school,
      name: schoolName,
      code: schoolCode,
      email: schoolEmail,
      phone: schoolPhone,
      city,
      state: schoolState,
      logoName,
      studentsEstimate,
      preferences: {
        ...saasState.school.preferences,
        appearance,
        notifications,
        publicCatalog,
      },
    };

    window.EduScheduleContext.saveSaasState(saasState);
    window.EduScheduleContext.applySaasContext();
    syncPreview();

    status.classList.add("is-success");
    status.textContent = "Configuracoes da escola atualizadas com sucesso.";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  saveAdminState();
  setupAdminSearch();
  renderStudents();
  setupStudentActions();
  renderTeachers();
  setupTeacherActions();
  setupFaqCrud();
  setupSchoolSettings();
  reapplyAdminSearch();
});
