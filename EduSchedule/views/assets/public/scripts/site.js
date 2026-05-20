function updateFieldState(field, isValid, message) {
  const inputGroup = field.closest(".input-group");
  const messageNode = inputGroup ? inputGroup.querySelector(".field-message") : null;

  if (!inputGroup || !messageNode) {
    return isValid;
  }

  inputGroup.classList.remove("is-valid", "is-invalid");
  inputGroup.classList.add(isValid ? "is-valid" : "is-invalid");
  messageNode.textContent = message;
  return isValid;
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getViewPath(area, fileName) {
  const pathname = window.location.pathname.replace(/\\/g, "/").toLowerCase();

  if (pathname.includes("/views/public/")) {
    return area === "public" ? fileName : `../${area}/${fileName}`;
  }

  if (pathname.includes("/views/app/") || pathname.includes("/views/admin/")) {
    return area === "public" ? `../public/${fileName}` : `../${area}/${fileName}`;
  }

  return area === "public" ? `views/public/${fileName}` : `views/${area}/${fileName}`;
}

function getSaasContext() {
  return window.EduScheduleContext || null;
}

function getSaasState() {
  const context = getSaasContext();
  return context ? context.loadSaasState() : null;
}

function saveSaasState(state) {
  const context = getSaasContext();

  if (!context) {
    return;
  }

  context.saveSaasState(state);
  context.applySaasContext();
}

function setupPlanSelection() {
  const buttons = document.querySelectorAll("[data-plan-select]");
  const status = document.querySelector("[data-plan-status]");
  const nextStepHref = getViewPath("public", "criar-escola.html");

  if (!buttons.length) {
    return;
  }

  function renderSelectedPlan() {
    const state = getSaasState();

    if (!state) {
      return;
    }

    buttons.forEach((button) => {
      const card = button.closest(".pricing-card");
      const isSelected = state.selectedPlan === button.dataset.planSelect;

      button.setAttribute("aria-pressed", String(isSelected));
      button.textContent = isSelected ? "Plano selecionado" : "Selecionar plano";
      button.classList.toggle("btn-primary", isSelected);
      button.classList.toggle("btn-secondary", !isSelected);

      if (card) {
        card.classList.toggle("is-selected", isSelected);
      }
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const state = getSaasState();
      const selectedPlanKey = button.dataset.planSelect;
      const selectedPlan = state && state.plans ? state.plans[selectedPlanKey] : null;

      if (selectedPlan) {
        state.selectedPlan = selectedPlanKey;
        saveSaasState(state);
        renderSelectedPlan();
      }

      buttons.forEach((control) => {
        control.disabled = true;
        control.textContent = control === button ? "Abrindo cadastro..." : "Plano salvo";
      });

      if (status) {
        status.classList.remove("is-error");
        status.classList.add("is-success");
        status.textContent = selectedPlan
          ? `${selectedPlan.name} selecionado. Abrindo o cadastro da escola.`
          : "Abrindo o cadastro da escola.";
      }

      window.setTimeout(() => {
        window.location.href = nextStepHref;
      }, 420);
    });
  });

  renderSelectedPlan();
}

function setupSchoolCreationForm() {
  const form = document.querySelector("[data-school-setup-form]");
  const status = document.querySelector("[data-school-setup-status]");
  const adminSchoolHref = getViewPath("admin", "escola.html");

  if (!form || !status) {
    return;
  }

  const state = getSaasState();

  if (!state) {
    return;
  }

  const selectedPlan = state.plans[state.selectedPlan] || state.plans.professional;
  const logoInput = form.querySelector('input[name="logo"]');
  const previewNodes = {
    name: document.querySelector("[data-preview-school-name]"),
    code: document.querySelector("[data-preview-school-code]"),
    email: document.querySelector("[data-preview-school-email]"),
    phone: document.querySelector("[data-preview-school-phone]"),
    cityState: document.querySelector("[data-preview-school-city-state]"),
    logo: document.querySelector("[data-preview-school-logo]"),
    logoName: document.querySelector("[data-preview-school-logo-name]"),
    students: document.querySelector("[data-preview-school-students]"),
    plan: document.querySelector("[data-preview-school-plan]"),
  };

  const initialSchool = state.school || {};
  form.querySelector('input[name="schoolName"]').value = initialSchool.name || "";
  form.querySelector('input[name="schoolCode"]').value = initialSchool.code || "";
  form.querySelector('input[name="schoolEmail"]').value = initialSchool.email || "";
  form.querySelector('input[name="schoolPhone"]').value = initialSchool.phone || "";
  form.querySelector('input[name="city"]').value = initialSchool.city || "";
  form.querySelector('input[name="state"]').value = initialSchool.state || "";
  form.querySelector('input[name="studentsEstimate"]').value = initialSchool.studentsEstimate || "";

  function getSchoolLogoName() {
    if (logoInput && logoInput.files && logoInput.files[0]) {
      return logoInput.files[0].name.replace(/\.[^.]+$/, "");
    }

    return form.querySelector('input[name="schoolName"]').value.trim() || initialSchool.logoName || "EduSchedule";
  }

  function getSchoolInitials(name) {
    return (name || "EduSchedule")
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "ES";
  }

  function syncPreview() {
    const schoolName = form.querySelector('input[name="schoolName"]').value.trim() || "Sua escola";
    const schoolCode = form.querySelector('input[name="schoolCode"]').value.trim() || "CODIGO-INSTITUCIONAL";
    const schoolEmail = form.querySelector('input[name="schoolEmail"]').value.trim() || "contato@escola.edu";
    const schoolPhone = form.querySelector('input[name="schoolPhone"]').value.trim() || "(00) 0000-0000";
    const city = form.querySelector('input[name="city"]').value.trim() || "Cidade";
    const schoolState = form.querySelector('input[name="state"]').value.trim() || "UF";
    const students = form.querySelector('input[name="studentsEstimate"]').value.trim() || "0 alunos";
    const logoName = getSchoolLogoName();

    if (previewNodes.name) {
      previewNodes.name.textContent = schoolName;
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

    if (previewNodes.cityState) {
      previewNodes.cityState.textContent = `${city} - ${schoolState}`;
    }

    if (previewNodes.logo) {
      previewNodes.logo.textContent = getSchoolInitials(schoolName);
    }

    if (previewNodes.logoName) {
      previewNodes.logoName.textContent = logoName;
    }

    if (previewNodes.students) {
      previewNodes.students.textContent = students;
    }

    if (previewNodes.plan) {
      previewNodes.plan.textContent = selectedPlan.name;
    }
  }

  form.querySelectorAll("input").forEach((field) => {
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
    const studentsEstimate = form.querySelector('input[name="studentsEstimate"]').value.trim();

    if (!schoolName || !schoolCode || !validateEmail(schoolEmail) || !schoolPhone || !city || !schoolState || !studentsEstimate) {
      status.classList.add("is-error");
      status.textContent = "Preencha todos os dados institucionais para criar a escola.";
      return;
    }

    state.school = {
      ...state.school,
      name: schoolName,
      code: schoolCode,
      email: schoolEmail,
      phone: schoolPhone,
      city,
      state: schoolState,
      logoName: getSchoolLogoName(),
      studentsEstimate,
    };

    saveSaasState(state);
    status.classList.add("is-success");
    status.textContent = `${schoolName} criada com sucesso. Abrindo as configuracoes administrativas.`;

    window.setTimeout(() => {
      window.location.href = adminSchoolHref;
    }, 320);
  });
}

function setupContactForm() {
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-form-status]");

  if (!form || !status) {
    return;
  }

  const fields = {
    name: form.querySelector('input[name="name"]'),
    email: form.querySelector('input[name="email"]'),
    message: form.querySelector('textarea[name="message"]'),
  };

  function validateField(fieldName) {
    if (fieldName === "name") {
      return updateFieldState(
        fields.name,
        fields.name.value.trim().length >= 3,
        fields.name.value.trim().length >= 3 ? "Nome preenchido corretamente." : "Informe ao menos 3 caracteres."
      );
    }

    if (fieldName === "email") {
      return updateFieldState(
        fields.email,
        validateEmail(fields.email.value),
        validateEmail(fields.email.value) ? "E-mail válido." : "Digite um e-mail institucional ou pessoal válido."
      );
    }

    return updateFieldState(
      fields.message,
      fields.message.value.trim().length >= 12,
      fields.message.value.trim().length >= 12 ? "Mensagem pronta para envio." : "Explique sua dúvida com pelo menos 12 caracteres."
    );
  }

  Object.keys(fields).forEach((fieldName) => {
    fields[fieldName].addEventListener("input", () => {
      validateField(fieldName);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const valid =
      validateField("name") &&
      validateField("email") &&
      validateField("message");

    status.classList.remove("is-success", "is-error");

    if (!valid) {
      status.classList.add("is-error");
      status.textContent = "Revise os campos destacados antes de enviar.";
      return;
    }

    status.classList.add("is-success");
    status.textContent = "Mensagem validada com sucesso. Em uma integração real, ela seguiria para a API.";
    form.reset();
    form.querySelectorAll(".input-group").forEach((group) => {
      group.classList.remove("is-valid", "is-invalid");
    });
    form.querySelectorAll(".field-message").forEach((messageNode) => {
      messageNode.textContent = "";
    });
  });
}

function setupFaqAccordion() {
  const triggers = document.querySelectorAll("[data-accordion-trigger]");

  if (!triggers.length) {
    return;
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const panel = document.querySelector(`#${trigger.getAttribute("aria-controls")}`);
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";

      triggers.forEach((otherTrigger) => {
        const otherPanel = document.querySelector(`#${otherTrigger.getAttribute("aria-controls")}`);
        otherTrigger.setAttribute("aria-expanded", "false");
        if (otherPanel) {
          otherPanel.hidden = true;
        }
      });

      trigger.setAttribute("aria-expanded", String(!isExpanded));
      if (panel) {
        panel.hidden = isExpanded;
      }
    });
  });
}

function setupRegisterForm() {
  const form = document.querySelector("[data-register-form]");
  const status = document.querySelector("[data-register-status]");

  if (!form || !status) {
    return;
  }

  const studentPanel = form.querySelector("[data-student-fields]");
  const teacherPanel = form.querySelector("[data-teacher-fields]");
  const typeInputs = form.querySelectorAll('input[name="accountType"]');
  const passwordInput = form.querySelector('input[name="password"]');
  const confirmInput = form.querySelector('input[name="confirmPassword"]');

  function syncTypePanels() {
    const selectedType = form.querySelector('input[name="accountType"]:checked');
    const isTeacher = selectedType && selectedType.value === "teacher";

    teacherPanel.hidden = !isTeacher;
    studentPanel.hidden = isTeacher;
  }

  typeInputs.forEach((input) => {
    input.addEventListener("change", syncTypePanels);
  });

  syncTypePanels();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.classList.remove("is-success", "is-error");

    if (!validateEmail(form.querySelector('input[name="email"]').value)) {
      status.classList.add("is-error");
      status.textContent = "Informe um e-mail válido para criar a conta.";
      return;
    }

    if (passwordInput.value.length < 6) {
      status.classList.add("is-error");
      status.textContent = "A senha precisa ter ao menos 6 caracteres.";
      return;
    }

    if (passwordInput.value !== confirmInput.value) {
      status.classList.add("is-error");
      status.textContent = "As senhas não conferem.";
      return;
    }

    status.classList.add("is-success");
    status.textContent = "Cadastro validado com sucesso. Na integração futura, os dados serão enviados para a API.";
  });
}

function setupPasswordToggle() {
  const toggles = document.querySelectorAll("[data-password-toggle]");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const target = document.querySelector(toggle.dataset.passwordToggle);

      if (!target) {
        return;
      }

      const isPassword = target.getAttribute("type") === "password";
      target.setAttribute("type", isPassword ? "text" : "password");
      toggle.textContent = isPassword ? "Ocultar" : "Mostrar";
    });
  });
}

function setupLoginForm() {
  const form = document.querySelector("[data-login-form]");
  const status = document.querySelector("[data-login-status]");

  if (!form || !status) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.classList.remove("is-success", "is-error");

    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;

    if (!validateEmail(email) || password.length < 6) {
      status.classList.add("is-error");
      status.textContent = "Preencha e-mail válido e senha com pelo menos 6 caracteres.";
      return;
    }

    status.classList.add("is-success");
    status.textContent = "Login validado. Use os botões de demonstração para acessar /app ou /adm.";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupPlanSelection();
  setupSchoolCreationForm();
  setupContactForm();
  setupFaqAccordion();
  setupRegisterForm();
  setupPasswordToggle();
  setupLoginForm();
});
