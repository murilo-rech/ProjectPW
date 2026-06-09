/**
 * admin.js — Interações da área administrativa (Escola & Global)
 * EduSchedule
 */

'use strict';

/* ── CRUD genérico de usuários ── */
function initUserCrud(config = {}) {
  const {
    addButtonSelector   = '[data-add-user]',
    editButtonSelector  = '[data-edit-user]',
    deleteButtonSelector= '[data-delete-user]',
    modalId             = 'modal-user',
    formSelector        = '[data-user-form]',
    toastAdd            = 'Usuário criado com sucesso!',
    toastEdit           = 'Usuário atualizado com sucesso!',
    toastDelete         = 'Usuário removido.',
    confirmDelete       = 'Tem certeza que deseja remover este usuário?',
  } = config;

  const btnAdd = document.querySelector(addButtonSelector);
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      const form = document.querySelector(formSelector);
      if (form) form.reset();
      window.EduUI?.openModal(modalId);
    });
  }

  document.querySelectorAll(editButtonSelector).forEach((btn) => {
    btn.addEventListener('click', () => {
      // TODO: GET /api/usuarios/:id e preencher formulário
      window.EduUI?.openModal(modalId);
    });
  });

  document.querySelectorAll(deleteButtonSelector).forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!confirm(confirmDelete)) return;
      const row = btn.closest('tr, [data-user-card], article');
      if (row) {
        row.style.opacity = '0.3';
        setTimeout(() => row.remove(), 300);
      }
      // TODO: DELETE /api/usuarios/:id
      window.EduUI?.showToast(toastDelete, 'warning');
    });
  });

  const form = document.querySelector(formSelector);
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // TODO: POST ou PUT /api/usuarios
      window.EduUI?.closeModal(modalId);
      window.EduUI?.showToast(toastAdd, 'success');
    });
  }
}

/* ── Solicitações de vínculo ── */
function initLinkRequests() {
  document.querySelectorAll('[data-approve-request]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.request-card, article');
      if (card) {
        card.style.opacity = '0.3';
        setTimeout(() => card.remove(), 300);
      }
      // TODO: POST /api/vinculos/:id/aprovar
      window.EduUI?.showToast('Solicitação aprovada! Professor vinculado.', 'success');
    });
  });

  document.querySelectorAll('[data-reject-request]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!confirm('Rejeitar esta solicitação?')) return;
      const card = btn.closest('.request-card, article');
      if (card) {
        card.style.opacity = '0.3';
        setTimeout(() => card.remove(), 300);
      }
      // TODO: POST /api/vinculos/:id/rejeitar
      window.EduUI?.showToast('Solicitação rejeitada.', 'error');
    });
  });
}

/* ── Busca na tabela ── */
function initTableSearch() {
  const searchInput = document.querySelector('[data-table-search]');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase().trim();
    document.querySelectorAll('[data-searchable-row]').forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(term) ? '' : 'none';
    });
  });
}

/* ── Bloquear/desbloquear escola ── */
function initSchoolBlock() {
  document.querySelectorAll('[data-toggle-block]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isBlocked = btn.classList.contains('is-blocked');
      const action = isBlocked ? 'desbloquear' : 'bloquear';
      if (!confirm(`Deseja ${action} esta escola?`)) return;
      btn.classList.toggle('is-blocked');
      btn.textContent = isBlocked ? 'Bloquear' : 'Desbloquear';
      // TODO: PATCH /api/escolas/:id/status
      window.EduUI?.showToast(`Escola ${isBlocked ? 'desbloqueada' : 'bloqueada'}.`, 'warning');
    });
  });
}

/* ── Publicar/despublicar FAQ ── */
function initFaqPublish() {
  document.querySelectorAll('[data-toggle-publish]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isPublished = btn.getAttribute('data-published') === 'true';
      btn.setAttribute('data-published', String(!isPublished));
      btn.textContent = isPublished ? 'Publicar' : 'Despublicar';
      btn.classList.toggle('chip-green', !isPublished);
      // TODO: PATCH /api/faq/:id/status
      window.EduUI?.showToast(`Item ${isPublished ? 'despublicado' : 'publicado'}.`, 'success');
    });
  });
}

/* ── Configurações — abas ── */
function initSettingsTabs() {
  const links = document.querySelectorAll('.settings-link[data-settings-tab]');
  const panels = document.querySelectorAll('[data-settings-panel]');

  links.forEach((link) => {
    link.addEventListener('click', () => {
      links.forEach((l) => l.classList.remove('is-active'));
      panels.forEach((p) => p.classList.add('is-hidden'));
      link.classList.add('is-active');
      const target = link.getAttribute('data-settings-tab');
      const panel = document.querySelector(`[data-settings-panel="${target}"]`);
      if (panel) panel.classList.remove('is-hidden');
    });
  });
}

/* ── Gráficos animados ── */
function initCharts() {
  const bars = document.querySelectorAll('.chart-bar[data-height]');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      const height = bar.getAttribute('data-height');
      setTimeout(() => {
        bar.style.height = height;
        bar.style.transition = 'height 0.8s ease';
      }, 100);
      observer.unobserve(bar);
    });
  }, { threshold: 0.2 });

  bars.forEach((bar) => {
    bar.style.height = '0';
    observer.observe(bar);
  });
}

/* ── Inicialização ── */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar CRUD para cada contexto
  if (document.querySelector('[data-page="alunos"]')) {
    initUserCrud({
      addButtonSelector: '[data-add-user]',
      editButtonSelector: '[data-edit-user]',
      deleteButtonSelector: '[data-delete-user]',
      modalId: 'modal-user',
      formSelector: '[data-user-form]',
      toastAdd: 'Aluno criado com sucesso!',
      toastDelete: 'Aluno removido.',
      confirmDelete: 'Tem certeza que deseja remover este aluno?',
    });
  }

  if (document.querySelector('[data-page="professores"]')) {
    initUserCrud({
      addButtonSelector: '[data-add-user]',
      editButtonSelector: '[data-edit-user]',
      deleteButtonSelector: '[data-delete-user]',
      modalId: 'modal-user',
      formSelector: '[data-user-form]',
      toastAdd: 'Professor criado com sucesso!',
      toastDelete: 'Professor removido.',
      confirmDelete: 'Tem certeza que deseja remover este professor?',
    });
  }

  if (document.querySelector('[data-page="administradores"]')) {
    initUserCrud({
      addButtonSelector: '[data-add-user]',
      editButtonSelector: '[data-edit-user]',
      deleteButtonSelector: '[data-delete-user]',
      modalId: 'modal-user',
      formSelector: '[data-user-form]',
      toastAdd: 'Administrador criado com sucesso!',
      toastDelete: 'Administrador removido.',
      confirmDelete: 'Tem certeza que deseja remover este administrador?',
    });
  }

  if (document.querySelector('[data-page="escolas"]')) {
    initUserCrud({
      addButtonSelector: '[data-add-school]',
      editButtonSelector: '[data-edit-school]',
      deleteButtonSelector: '[data-delete-school]',
      modalId: 'modal-school',
      formSelector: '[data-school-form]',
      toastAdd: 'Escola criada com sucesso!',
      toastDelete: 'Escola removida.',
      confirmDelete: 'Tem certeza que deseja remover esta escola?',
    });
    initSchoolBlock();
  }

  if (document.querySelector('[data-page="planos"]')) {
    initUserCrud({
      addButtonSelector: '[data-add-plan]',
      editButtonSelector: '[data-edit-plan]',
      deleteButtonSelector: '[data-delete-plan]',
      modalId: 'modal-plan',
      formSelector: '[data-plan-form]',
      toastAdd: 'Plano criado com sucesso!',
      toastDelete: 'Plano removido.',
      confirmDelete: 'Tem certeza que deseja remover este plano?',
    });
  }

  if (document.querySelector('[data-page="faq"]')) {
    initUserCrud({
      addButtonSelector: '[data-add-faq]',
      editButtonSelector: '[data-edit-faq]',
      deleteButtonSelector: '[data-delete-faq]',
      modalId: 'modal-faq',
      formSelector: '[data-faq-form]',
      toastAdd: 'Pergunta adicionada!',
      toastDelete: 'Pergunta removida.',
    });
    initFaqPublish();
  }

  initLinkRequests();
  initTableSearch();
  initSettingsTabs();
  initCharts();
});
