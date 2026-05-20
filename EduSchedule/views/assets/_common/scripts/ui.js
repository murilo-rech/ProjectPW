(function setupEduScheduleUi() {
  const SAAS_STORAGE_KEY = "eduScheduleSaasStateV1";

  function createDefaultSaasState() {
    return {
      selectedPlan: "professional",
      plans: {
        basic: {
          id: "basic",
          name: "Plano Basico",
          teacherLimit: "Ate 12 professores",
          studentLimit: "Ate 280 alunos",
          description: "Ideal para escolas menores que estao estruturando atendimentos."
        },
        professional: {
          id: "professional",
          name: "Plano Profissional",
          teacherLimit: "Ate 45 professores",
          studentLimit: "Ate 1.200 alunos",
          description: "Recursos ampliados para operacao multi-turno e coordenacao."
        },
        premium: {
          id: "premium",
          name: "Plano Premium",
          teacherLimit: "Professores ilimitados",
          studentLimit: "Alunos ilimitados",
          description: "Escala completa para redes, grupos educacionais e varios campi."
        }
      },
      school: {
        name: "Campus Pelotas Centro",
        code: "IFSUL-CENTRO-01",
        email: "contato@campus.edu.br",
        phone: "(53) 3333-2026",
        city: "Pelotas",
        state: "RS",
        logoName: "EduSchedule",
        studentsEstimate: "836 alunos",
        preferences: {
          notifications: true,
          publicCatalog: true,
          appearance: "Aurora verde"
        }
      }
    };
  }

  function loadSaasState() {
    try {
      const fallback = createDefaultSaasState();
      const rawState = window.localStorage.getItem(SAAS_STORAGE_KEY);

      if (!rawState) {
        return fallback;
      }

      const parsedState = JSON.parse(rawState);

      if (!parsedState || !parsedState.school || !parsedState.plans) {
        return fallback;
      }

      return {
        ...fallback,
        ...parsedState,
        school: {
          ...fallback.school,
          ...parsedState.school,
          preferences: {
            ...fallback.school.preferences,
            ...(parsedState.school.preferences || {})
          }
        },
        plans: {
          ...fallback.plans,
          ...parsedState.plans
        }
      };
    } catch (error) {
      return createDefaultSaasState();
    }
  }

  function saveSaasState(nextState) {
    window.localStorage.setItem(SAAS_STORAGE_KEY, JSON.stringify(nextState));
  }

  function getPublicHomeHref() {
    const pathname = window.location.pathname.toLowerCase();
    return pathname.includes("/views/") ? "../../index.html" : "index.html";
  }

  function setupBrandLinks() {
    const homeHref = getPublicHomeHref();

    document.querySelectorAll(".brand-mark").forEach((link) => {
      link.setAttribute("href", homeHref);
      link.setAttribute("title", "Voltar para a home publica");
      link.setAttribute("aria-label", "Voltar para a home publica do EduSchedule");
    });
  }

  function applySaasContext() {
    const saasState = loadSaasState();
    const selectedPlan = saasState.plans[saasState.selectedPlan] || saasState.plans.professional;
    const school = saasState.school;
    const schoolInitials = school.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "ES";

    document.querySelectorAll("[data-school-name]").forEach((node) => {
      node.textContent = school.name;
    });

    document.querySelectorAll("[data-school-code]").forEach((node) => {
      node.textContent = school.code;
    });

    document.querySelectorAll("[data-school-email]").forEach((node) => {
      node.textContent = school.email;
    });

    document.querySelectorAll("[data-school-phone]").forEach((node) => {
      node.textContent = school.phone;
    });

    document.querySelectorAll("[data-school-city]").forEach((node) => {
      node.textContent = school.city;
    });

    document.querySelectorAll("[data-school-state]").forEach((node) => {
      node.textContent = school.state;
    });

    document.querySelectorAll("[data-school-students]").forEach((node) => {
      node.textContent = school.studentsEstimate;
    });

    document.querySelectorAll("[data-school-plan]").forEach((node) => {
      node.textContent = selectedPlan.name;
    });

    document.querySelectorAll("[data-school-plan-description]").forEach((node) => {
      node.textContent = selectedPlan.description;
    });

    document.querySelectorAll("[data-school-teacher-limit]").forEach((node) => {
      node.textContent = selectedPlan.teacherLimit;
    });

    document.querySelectorAll("[data-school-student-limit]").forEach((node) => {
      node.textContent = selectedPlan.studentLimit;
    });

    document.querySelectorAll("[data-school-logo]").forEach((node) => {
      node.textContent = schoolInitials;
    });

    document.querySelectorAll("[data-school-logo-name]").forEach((node) => {
      node.textContent = school.logoName || school.name;
    });
  }

  function decorateSidebarLinks() {
    document.querySelectorAll(".sidebar-links a").forEach((link) => {
      if (link.querySelector(".sidebar-link__label")) {
        return;
      }

      const badge = link.querySelector(".chip, .status-badge");
      const labelText = Array.from(link.childNodes)
        .filter((node) => node !== badge)
        .map((node) => node.textContent || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      const icon = document.createElement("span");
      icon.className = "sidebar-link__icon";
      icon.setAttribute("aria-hidden", "true");

      const label = document.createElement("span");
      label.className = "sidebar-link__label";
      label.textContent = labelText;

      link.textContent = "";
      link.append(icon, label);

      if (badge) {
        badge.classList.add("sidebar-link__badge");
        link.append(badge);
      }
    });
  }

  function setActiveLink() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll("[data-nav-link]").forEach((link) => {
      const href = link.getAttribute("href") || "";
      const target = href.split("/").pop() || "index.html";

      if (target === currentPage) {
        link.classList.add("is-current");

        const detailsParent = link.closest("details");
        if (detailsParent) {
          detailsParent.open = true;
        }
      }
    });
  }

  function setupLoading() {
    const loadingScreen = document.querySelector("[data-loading-screen]");

    if (!loadingScreen) {
      return;
    }

    window.setTimeout(() => {
      loadingScreen.classList.add("is-hidden");
    }, 420);
  }

  function decorateResponsiveTables() {
    document.querySelectorAll("table").forEach((table) => {
      const headers = Array.from(table.querySelectorAll("thead th")).map((header) => {
        return header.textContent.replace(/\s+/g, " ").trim();
      });

      if (!headers.length) {
        return;
      }

      table.querySelectorAll("tbody tr").forEach((row) => {
        row.querySelectorAll("td").forEach((cell, index) => {
          if (!cell.dataset.label) {
            cell.dataset.label = headers[index] || "";
          }
        });
      });
    });
  }

  function setupMobileNav() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const navShell = document.querySelector("[data-nav-shell]");

    if (!toggle || !navShell) {
      return;
    }

    toggle.addEventListener("click", () => {
      const isOpen = navShell.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    navShell.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navShell.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function closeDialog(dialog) {
    if (dialog && dialog.open) {
      dialog.close();
    }
  }

  function ensureDialogCloseButton(dialog) {
    const modalCard = dialog.querySelector(".modal-card");

    if (!modalCard || modalCard.querySelector(".modal-close")) {
      return;
    }

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "modal-close";
    closeButton.setAttribute("data-dialog-close", "");
    closeButton.setAttribute("aria-label", "Fechar modal");
    closeButton.textContent = "X";
    modalCard.prepend(closeButton);
  }

  function setupDialogs() {
    document.querySelectorAll("dialog").forEach((dialog) => {
      ensureDialogCloseButton(dialog);
    });

    document.querySelectorAll("[data-dialog-target]").forEach((button) => {
      button.addEventListener("click", () => {
        const dialog = document.querySelector(button.dataset.dialogTarget);

        if (dialog && typeof dialog.showModal === "function") {
          dialog.showModal();
          document.body.classList.add("dialog-open");
        }
      });
    });

    document.querySelectorAll("dialog").forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog || event.target.closest("[data-dialog-close]")) {
          closeDialog(dialog);
          document.body.classList.remove("dialog-open");
        }
      });

      dialog.addEventListener("cancel", () => {
        document.body.classList.remove("dialog-open");
      });

      dialog.addEventListener("close", () => {
        document.body.classList.remove("dialog-open");
      });
    });
  }

  function setupSidebar() {
    const toggle = document.querySelector("[data-sidebar-toggle]");

    if (!toggle) {
      return;
    }

    function syncState() {
      toggle.setAttribute("aria-expanded", String(document.body.classList.contains("sidebar-open")));
    }

    toggle.addEventListener("click", () => {
      document.body.classList.toggle("sidebar-open");
      syncState();
    });

    document.querySelectorAll("[data-sidebar-close]").forEach((button) => {
      button.addEventListener("click", () => {
        document.body.classList.remove("sidebar-open");
        syncState();
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960) {
        document.body.classList.remove("sidebar-open");
        syncState();
      }
    });

    syncState();
  }

  window.EduUI = {
    closeDialog,
  };

  window.EduScheduleContext = {
    createDefaultSaasState,
    loadSaasState,
    saveSaasState,
    applySaasContext,
    getPublicHomeHref,
  };

  document.addEventListener("DOMContentLoaded", () => {
    setupBrandLinks();
    applySaasContext();
    decorateSidebarLinks();
    decorateResponsiveTables();
    setActiveLink();
    setupLoading();
    setupMobileNav();
    setupDialogs();
    setupSidebar();
  });
})();
