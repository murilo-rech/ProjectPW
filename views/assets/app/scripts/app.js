/**
 * app.js — Interações da área de aplicação (Aluno & Professor)
 * EduSchedule
 */

'use strict';

/* ── Fluxo de agendamento ── */
function initBookingFlow() {
  const flowContainer = document.querySelector('[data-booking-flow]');
  if (!flowContainer) return;

  const steps = flowContainer.querySelectorAll('.booking-step');
  if (!steps.length) return;

  // TODO: substituir por dados reais da API GET /api/materias
  const mockData = {
    materias: [
      { id: 1, nome: 'Matemática', professores: [1, 2] },
      { id: 2, nome: 'Programação Web', professores: [3] },
      { id: 3, nome: 'Banco de Dados', professores: [2, 3] },
      { id: 4, nome: 'Redes de Computadores', professores: [1] },
    ],
    professores: [
      { id: 1, nome: 'Prof. Carlos Mendes', especialidade: 'Exatas' },
      { id: 2, nome: 'Profa. Ana Lima', especialidade: 'Tecnologia' },
      { id: 3, nome: 'Prof. Ricardo Souza', especialidade: 'Informática' },
    ],
    horarios: [
      { id: 1, hora: '08:00', vagas: 3, total: 5, professor: 1 },
      { id: 2, hora: '09:00', vagas: 0, total: 5, professor: 1 },
      { id: 3, hora: '10:00', vagas: 2, total: 5, professor: 1 },
      { id: 4, hora: '14:00', vagas: 5, total: 5, professor: 2 },
      { id: 5, hora: '15:00', vagas: 1, total: 5, professor: 2 },
      { id: 6, hora: '16:00', vagas: 4, total: 5, professor: 3 },
    ],
  };

  let selection = {
    materiaId: null,
    professorId: null,
    horarioId: null,
    modalidade: null,
  };

  // Passo 1: selecionar matéria
  function renderMaterias() {
    const grid = flowContainer.querySelector('[data-materia-grid]');
    if (!grid) return;

    grid.innerHTML = '';
    mockData.materias.forEach((m) => {
      const card = document.createElement('article');
      card.className = 'selectable-card';
      card.setAttribute('data-id', m.id);
      card.innerHTML = `
        <strong class="selectable-card-title">${m.nome}</strong>
        <span class="selectable-card-meta">${m.professores.length} professor(es)</span>
      `;
      card.addEventListener('click', () => {
        grid.querySelectorAll('.selectable-card').forEach((c) => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        selection.materiaId = m.id;
        selection.professorId = null;
        selection.horarioId = null;
        updateSummary();
        activateNextStep(1);
        renderProfessores(m.professores);
      });
      grid.appendChild(card);
    });
  }

  // Passo 2: selecionar professor (filtrado pela matéria)
  function renderProfessores(ids) {
    const grid = flowContainer.querySelector('[data-professor-grid]');
    if (!grid) return;

    grid.innerHTML = '';
    const filtered = mockData.professores.filter((p) => ids.includes(p.id));
    filtered.forEach((p) => {
      const card = document.createElement('article');
      card.className = 'selectable-card';
      card.setAttribute('data-id', p.id);
      card.innerHTML = `
        <strong class="selectable-card-title">${p.nome}</strong>
        <span class="selectable-card-meta">${p.especialidade}</span>
      `;
      card.addEventListener('click', () => {
        grid.querySelectorAll('.selectable-card').forEach((c) => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        selection.professorId = p.id;
        selection.horarioId = null;
        updateSummary();
        activateNextStep(2);
        renderHorarios(p.id);
      });
      grid.appendChild(card);
    });
  }

  // Passo 3: selecionar horário (filtrado pelo professor)
  function renderHorarios(professorId) {
    const grid = flowContainer.querySelector('[data-horario-grid]');
    if (!grid) return;

    grid.innerHTML = '';
    const filtered = mockData.horarios.filter((h) => h.professor === professorId);
    filtered.forEach((h) => {
      const isFull = h.vagas === 0;
      const slot = document.createElement('article');
      slot.className = `time-slot${isFull ? ' is-full' : ''}`;
      slot.setAttribute('data-id', h.id);
      slot.innerHTML = `
        <span class="time-slot-hour">${h.hora}</span>
        <span class="time-slot-vacancies">${isFull ? 'Lotado' : `${h.vagas}/${h.total} vagas`}</span>
      `;
      if (!isFull) {
        slot.addEventListener('click', () => {
          grid.querySelectorAll('.time-slot').forEach((s) => s.classList.remove('is-selected'));
          slot.classList.add('is-selected');
          selection.horarioId = h.id;
          updateSummary();
          activateNextStep(3);
        });
      }
      grid.appendChild(slot);
    });
  }

  // Passo 4: selecionar modalidade
  flowContainer.querySelectorAll('[data-modalidade]').forEach((card) => {
    card.addEventListener('click', () => {
      flowContainer.querySelectorAll('[data-modalidade]').forEach((c) => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      selection.modalidade = card.getAttribute('data-modalidade');
      updateSummary();
      activateNextStep(4);
    });
  });

  // Ativar passo
  function activateNextStep(currentIdx) {
    const nextStep = flowContainer.querySelector(`[data-step-idx="${currentIdx + 1}"]`);
    if (nextStep) {
      nextStep.classList.add('is-active');
      setTimeout(() => nextStep.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }

  // Atualizar sumário
  function updateSummary() {
    const sumEl = flowContainer.querySelector('[data-booking-summary]');
    if (!sumEl) return;

    const materia   = mockData.materias.find((m) => m.id === selection.materiaId);
    const professor = mockData.professores.find((p) => p.id === selection.professorId);
    const horario   = mockData.horarios.find((h) => h.id === selection.horarioId);

    sumEl.querySelector('[data-sum-materia]').textContent   = materia   ? materia.nome    : '—';
    sumEl.querySelector('[data-sum-professor]').textContent = professor  ? professor.nome  : '—';
    sumEl.querySelector('[data-sum-horario]').textContent   = horario    ? horario.hora    : '—';
    sumEl.querySelector('[data-sum-modalidade]').textContent = selection.modalidade || '—';
  }

  // Botão confirmar
  const btnConfirm = flowContainer.querySelector('[data-btn-confirm]');
  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      if (!selection.materiaId || !selection.professorId || !selection.horarioId || !selection.modalidade) {
        window.EduUI?.showToast('Complete todos os passos antes de confirmar.', 'error');
        return;
      }
      // TODO: substituir por chamada real via HttpClientBase.js POST /api/agendamentos
      window.EduUI?.showToast('Agendamento realizado com sucesso!', 'success');
      setTimeout(() => {
        window.location.href = 'agendamentos.html';
      }, 2000);
    });
  }

  renderMaterias();
}

/* ── Filtros de agendamentos (meus agendamentos) ── */
function initAppointmentFilters() {
  const filtersEl = document.querySelector('[data-appointment-filter]');
  if (!filtersEl) return;

  filtersEl.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      filtersEl.querySelectorAll('[data-filter]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.getAttribute('data-filter');
      document.querySelectorAll('[data-appointment-item]').forEach((item) => {
        const status = item.getAttribute('data-status');
        item.style.display = (filter === 'todos' || filter === status) ? '' : 'none';
      });
    });
  });
}

/* ── Cancelar agendamento ── */
function initCancelAppointment() {
  document.querySelectorAll('[data-cancel-appointment]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-cancel-appointment');
      if (!confirm('Deseja cancelar este agendamento?')) return;
      // TODO: substituir por chamada real DELETE /api/agendamentos/:id
      btn.closest('[data-appointment-item]').style.opacity = '0.4';
      window.EduUI?.showToast('Agendamento cancelado.', 'warning');
    });
  });
}

/* ── Marcar notificação como lida ── */
function initMarkAsRead() {
  document.querySelectorAll('[data-mark-read]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.notification-item');
      if (item) {
        item.classList.remove('is-unread');
        item.querySelector('.notification-dot')?.remove();
      }
      // TODO: substituir por PATCH /api/notificacoes/:id
    });
  });

  const markAll = document.querySelector('[data-mark-all-read]');
  if (markAll) {
    markAll.addEventListener('click', () => {
      document.querySelectorAll('.notification-item.is-unread').forEach((item) => {
        item.classList.remove('is-unread');
        item.querySelector('.notification-dot')?.remove();
      });
      window.EduUI?.showToast('Todas as notificações foram marcadas como lidas.', 'success');
    });
  }
}

/* ── Preview de foto de perfil ── */
function initAvatarUpload() {
  const input = document.querySelector('[data-avatar-input]');
  const img   = document.querySelector('[data-avatar-preview]');
  if (!input || !img) return;

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target.result; };
    reader.readAsDataURL(file);
  });
}

/* ── Disponibilidades — modal de criação/edição ── */
function initAvailabilityModal() {
  const btnAdd = document.querySelector('[data-add-availability]');
  if (!btnAdd) return;

  btnAdd.addEventListener('click', () => {
    window.EduUI?.openModal('modal-availability');
  });

  document.querySelectorAll('[data-edit-availability]').forEach((btn) => {
    btn.addEventListener('click', () => {
      // TODO: substituir por GET /api/disponibilidades/:id e preencher form
      window.EduUI?.openModal('modal-availability');
    });
  });

  document.querySelectorAll('[data-delete-availability]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!confirm('Excluir esta disponibilidade? Os alunos inscritos serão notificados.')) return;
      const card = btn.closest('.availability-card');
      if (card) card.remove();
      // TODO: DELETE /api/disponibilidades/:id + notificações
      window.EduUI?.showToast('Disponibilidade excluída. Alunos notificados.', 'warning');
    });
  });

  const form = document.querySelector('[data-availability-form]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // TODO: POST/PUT /api/disponibilidades
      window.EduUI?.closeModal('modal-availability');
      window.EduUI?.showToast('Disponibilidade salva com sucesso!', 'success');
    });
  }
}

/* ── Inicialização ── */
document.addEventListener('DOMContentLoaded', () => {
  initBookingFlow();
  initAppointmentFilters();
  initCancelAppointment();
  initMarkAsRead();
  initAvatarUpload();
  initAvailabilityModal();
});
