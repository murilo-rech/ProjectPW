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
/* â”€â”€ CRUD real de FAQ global â”€â”€ */
function initFaqCrud() {
  const list = document.querySelector('[data-faq-list]');
  const form = document.querySelector('[data-faq-form]');
  const btnAdd = document.querySelector('[data-add-faq]');
  if (!list || !form || typeof HttpClientBase === 'undefined') return;

  const client = new HttpClientBase('../../api');
  let faqs = [];

  function renderState(message) {
    const card = document.createElement('article');
    card.className = 'faq-admin-card';
    const content = document.createElement('section');
    content.className = 'faq-admin-content';
    const text = document.createElement('p');
    text.className = 'faq-admin-a';
    text.textContent = message;
    content.appendChild(text);
    card.appendChild(content);
    list.replaceChildren(card);
  }

  function fillForm(faq = null) {
    form.reset();
    form.querySelector('[name="id"]').value = faq?.id || '';
    form.querySelector('[name="question"]').value = faq?.question || '';
    form.querySelector('[name="answer"]').value = faq?.answer || '';
    form.querySelector('[name="status"]').value = String(faq?.status ?? 1);
    form.querySelector('[name="sort_order"]').value = faq?.sort_order || '';
  }

  function createButton(text, className, dataset = {}) {
    const button = document.createElement('button');
    button.className = className;
    button.type = 'button';
    button.textContent = text;
    Object.entries(dataset).forEach(([key, value]) => {
      button.setAttribute(key, value);
    });
    return button;
  }

  function renderFaqCard(faq, index) {
    const isActive = Number(faq.status) === 1;
    const card = document.createElement('article');
    card.className = 'faq-admin-card';
    card.setAttribute('data-faq-id', faq.id);

    const content = document.createElement('section');
    content.className = 'faq-admin-content';

    const question = document.createElement('h3');
    question.className = 'faq-admin-q';
    question.textContent = faq.question;

    const answer = document.createElement('p');
    answer.className = 'faq-admin-a';
    answer.textContent = faq.answer;

    content.appendChild(question);
    content.appendChild(answer);

    const actions = document.createElement('aside');
    actions.className = 'faq-admin-actions';

    const upButton = createButton('Subir', 'btn btn-ghost btn-sm');
    upButton.disabled = index === 0;
    upButton.addEventListener('click', () => moveFaq(index, -1));

    const downButton = createButton('Descer', 'btn btn-ghost btn-sm');
    downButton.disabled = index === faqs.length - 1;
    downButton.addEventListener('click', () => moveFaq(index, 1));

    const statusButton = createButton(
      isActive ? 'Inativar' : 'Ativar',
      `btn chip ${isActive ? 'chip-green' : 'chip-warning'}`
    );
    statusButton.addEventListener('click', () => toggleFaqStatus(faq));

    const editButton = createButton('Editar', 'btn btn-ghost btn-sm');
    editButton.addEventListener('click', () => {
      fillForm(faq);
      window.EduUI?.openModal('modal-faq');
    });

    const deleteButton = createButton('Excluir', 'btn btn-danger btn-sm');
    deleteButton.addEventListener('click', () => deleteFaq(faq.id));

    actions.appendChild(upButton);
    actions.appendChild(downButton);
    actions.appendChild(statusButton);
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    card.appendChild(content);
    card.appendChild(actions);
    return card;
  }

  function renderFaqs() {
    if (!faqs.length) {
      renderState('Nenhuma pergunta cadastrada.');
      return;
    }

    const fragment = document.createDocumentFragment();
    faqs.forEach((faq, index) => {
      fragment.appendChild(renderFaqCard(faq, index));
    });
    list.replaceChildren(fragment);
  }

  async function loadFaqs() {
    renderState('Carregando perguntas...');
    try {
      const response = await client.get('/faqs/list');
      faqs = response.data || [];
      renderFaqs();
    } catch (error) {
      renderState('Nao foi possivel carregar o FAQ.');
      window.EduUI?.showToast(error.message, 'error');
    }
  }

  async function toggleFaqStatus(faq) {
    const nextStatus = Number(faq.status) === 1 ? 0 : 1;
    try {
      await client.put(`/faqs/${faq.id}/status`, { status: nextStatus });
      window.EduUI?.showToast('Status atualizado.', 'success');
      await loadFaqs();
    } catch (error) {
      window.EduUI?.showToast(error.message, 'error');
    }
  }

  async function deleteFaq(id) {
    if (!confirm('Tem certeza que deseja remover esta pergunta?')) return;

    try {
      await client.delete(`/faqs/${id}`);
      window.EduUI?.showToast('Pergunta removida.', 'warning');
      await loadFaqs();
    } catch (error) {
      window.EduUI?.showToast(error.message, 'error');
    }
  }

  async function moveFaq(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= faqs.length) return;

    const reordered = [...faqs];
    const current = reordered[index];
    reordered[index] = reordered[nextIndex];
    reordered[nextIndex] = current;

    try {
      await Promise.all(reordered.map((faq, position) => {
        const nextOrder = position + 1;
        if (Number(faq.sort_order) === nextOrder) {
          return Promise.resolve();
        }
        return client.put(`/faqs/${faq.id}/order`, { sort_order: nextOrder });
      }));
      window.EduUI?.showToast('Ordem atualizada.', 'success');
      await loadFaqs();
    } catch (error) {
      window.EduUI?.showToast(error.message, 'error');
    }
  }

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      fillForm();
      window.EduUI?.openModal('modal-faq');
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = form.querySelector('[name="id"]').value;
    const sortOrder = form.querySelector('[name="sort_order"]').value;
    const payload = {
      question: form.querySelector('[name="question"]').value,
      answer: form.querySelector('[name="answer"]').value,
      status: Number(form.querySelector('[name="status"]').value),
    };

    if (sortOrder) {
      payload.sort_order = Number(sortOrder);
    }

    try {
      if (id) {
        await client.put(`/faqs/${id}`, payload);
        window.EduUI?.showToast('Pergunta atualizada!', 'success');
      } else {
        await client.post('/faqs', payload);
        window.EduUI?.showToast('Pergunta adicionada!', 'success');
      }

      window.EduUI?.closeModal('modal-faq');
      await loadFaqs();
    } catch (error) {
      window.EduUI?.showToast(error.message, 'error');
    }
  });

  loadFaqs();
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
    initFaqCrud();
  }

  initLinkRequests();
  initTableSearch();
  initSettingsTabs();
  initCharts();
});
