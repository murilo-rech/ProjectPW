/**
 * ui.js — Comportamentos de interface compartilhados
 * EduSchedule | Área pública, app e admin
 *
 * Regras:
 * - Sem eventos inline no HTML
 * - Sem jQuery
 * - Sempre document.querySelector
 */

'use strict';

/* ── Loading screen ── */
function initLoadingScreen() {
  const shell = document.querySelector('[data-loading-screen]');
  if (!shell) return;
  window.addEventListener('load', () => {
    setTimeout(() => shell.classList.add('is-hidden'), 400);
  });
}

/* ── Menu de navegação mobile (público) ── */
function initNavToggle() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const shell  = document.querySelector('[data-nav-shell]');
  if (!toggle || !shell) return;

  toggle.addEventListener('click', () => {
    const isOpen = shell.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? 'Fechar' : 'Menu';
  });

  // Fechar ao clicar fora
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !shell.contains(e.target)) {
      shell.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Menu';
    }
  });
}

/* ── Sidebar do painel (app/admin) ── */
function initSidebarToggle() {
  const toggle  = document.querySelector('[data-sidebar-toggle]');
  const sidebar = document.querySelector('[data-sidebar]');
  const overlay = document.querySelector('[data-sidebar-overlay]');
  if (!toggle || !sidebar) return;

  function openSidebar() {
    sidebar.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    sidebar.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
  });

  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }
}

/* ── Modais ── */
function initModals() {
  // Abrir modal pelo atributo data-modal-open="id-do-modal"
  document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const id = trigger.getAttribute('data-modal-open');
      openModal(id);
    });
  });

  // Fechar pelo botão de fechar
  document.querySelectorAll('[data-modal-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const overlay = btn.closest('.modal-overlay');
      if (overlay) closeModal(overlay.id);
    });
  });

  // Fechar clicando no overlay
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Fechar com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openOverlay = document.querySelector('.modal-overlay.is-open');
      if (openOverlay) closeModal(openOverlay.id);
    }
  });
}

function openModal(id) {
  const overlay = document.querySelector(`#${id}`);
  if (!overlay) return;
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const overlay = document.querySelector(`#${id}`);
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

/* ── Accordion ── */
function initAccordion() {
  document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      if (!item) return;

      const isOpen = item.classList.contains('is-open');

      // Fechar todos
      document.querySelectorAll('.accordion-item.is-open').forEach((openItem) => {
        openItem.classList.remove('is-open');
        openItem.querySelector('.accordion-trigger')
          .setAttribute('aria-expanded', 'false');
      });

      // Abrir o clicado (se estava fechado)
      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ── Abas ── */
function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach((tabsRoot) => {
    const buttons = tabsRoot.querySelectorAll('.tab-btn');
    const panels  = tabsRoot.querySelectorAll('.tab-panel');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');

        buttons.forEach((b) => b.classList.remove('is-active'));
        panels.forEach((p)  => p.classList.remove('is-active'));

        btn.classList.add('is-active');
        const panel = tabsRoot.querySelector(`[data-tab-panel="${target}"]`);
        if (panel) panel.classList.add('is-active');
      });
    });
  });
}

/* ── Toast de notificação ── */
function showToast(message, type = 'success', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('aside');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('article');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button type="button" aria-label="Fechar" style="margin-left:auto;background:none;border:none;color:var(--color-text-2);cursor:pointer;font-size:1rem;">✕</button>
  `;

  container.appendChild(toast);

  toast.querySelector('button').addEventListener('click', () => toast.remove());

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ── Marcar link ativo na sidebar ── */
function markActiveLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.sidebar-link, [data-nav-link]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const linkFile = href.split('/').pop();
    if (linkFile && linkFile === currentPath) {
      link.classList.add('is-active');
    }
  });
}

/* ── Confirmação de exclusão ── */
function initDeleteConfirm() {
  document.querySelectorAll('[data-confirm-delete]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const message = btn.getAttribute('data-confirm-delete') || 'Tem certeza que deseja excluir?';
      if (!confirm(message)) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  });
}

/* ── Inicialização geral ── */
document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initNavToggle();
  initSidebarToggle();
  initModals();
  initAccordion();
  initTabs();
  initDeleteConfirm();
  markActiveLink();
});

// Exportar funções para uso externo
window.EduUI = {
  openModal,
  closeModal,
  showToast,
};
