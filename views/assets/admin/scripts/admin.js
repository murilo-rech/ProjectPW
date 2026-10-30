/**
 * admin.js — Interações da área administrativa (Escola & Global)
 * EduSchedule
 */

'use strict';

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
  // Os CRUDs de usuarios, escolas e FAQ sao inicializados pelos modulos que
  // consomem os servicos reais da API.
  initTableSearch();
  initSettingsTabs();
  initCharts();
});
