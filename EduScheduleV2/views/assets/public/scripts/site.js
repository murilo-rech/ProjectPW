/**
 * site.js — Interações da área pública
 * EduSchedule
 *
 * Regras:
 * - Sem eventos inline
 * - Sem jQuery
 * - document.querySelector
 */

'use strict';

/* ── Fluxo de onboarding multi-step ── */
function initOnboardingSteps() {
  const stepsContainer = document.querySelector('[data-steps]');
  if (!stepsContainer) return;

  const steps    = stepsContainer.querySelectorAll('[data-step]');
  const dots     = document.querySelectorAll('[data-step-dot]');
  const connectors = document.querySelectorAll('[data-step-connector]');
  const labels   = document.querySelectorAll('[data-step-label]');
  const btnNext  = document.querySelectorAll('[data-step-next]');
  const btnPrev  = document.querySelectorAll('[data-step-prev]');

  let currentStep = 1;

  function goToStep(n) {
    steps.forEach((s) => s.classList.remove('is-active'));
    const target = stepsContainer.querySelector(`[data-step="${n}"]`);
    if (target) target.classList.add('is-active');

    dots.forEach((d, i) => {
      d.classList.remove('is-active', 'is-done');
      if (i + 1 < n)  d.classList.add('is-done');
      if (i + 1 === n) d.classList.add('is-active');
    });

    connectors.forEach((c, i) => {
      c.classList.toggle('is-done', i + 1 < n);
    });

    labels.forEach((l, i) => {
      l.classList.toggle('is-active', i + 1 === n);
    });

    currentStep = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  btnNext.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = parseInt(btn.getAttribute('data-step-next'), 10);
      goToStep(next);
    });
  });

  btnPrev.forEach((btn) => {
    btn.addEventListener('click', () => {
      const prev = parseInt(btn.getAttribute('data-step-prev'), 10);
      goToStep(prev);
    });
  });

  goToStep(1);
}

/* ── Seleção de plano no onboarding ── */
function initPlanSelector() {
  const planCards = document.querySelectorAll('[data-plan-card]');
  const hiddenInput = document.querySelector('[name="selected-plan"]');

  planCards.forEach((card) => {
    card.addEventListener('click', () => {
      planCards.forEach((c) => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      if (hiddenInput) hiddenInput.value = card.getAttribute('data-plan-card');
    });
  });
}

/* ── Seleção de perfil no cadastro ── */
function initProfileToggle() {
  const radioInputs = document.querySelectorAll('[name="profile"]');
  const teacherExtra = document.querySelector('[data-teacher-fields]');

  radioInputs.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (!teacherExtra) return;
      teacherExtra.style.display = radio.value === 'professor' ? 'flex' : 'none';
    });
  });
}

/* ── Scroll suave para âncoras ── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.querySelector(`#${id}`);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ── Contagem animada (métricas hero) ── */
function animateCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-counter'), 10);
      let start = 0;
      const duration = 1500;
      const step = target / (duration / 16);

      const update = () => {
        start = Math.min(start + step, target);
        el.textContent = Math.floor(start).toLocaleString('pt-BR');
        if (start < target) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.3 });

  counters.forEach((el) => observer.observe(el));
}

/* ── Inicialização ── */
function initPublicFaqs() {
  const list = document.querySelector('[data-public-faq-list]');
  if (!list || typeof HttpClientBase === 'undefined') return;

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const projectRoot = pathParts.length ? `/${pathParts[0]}` : '';
  const client = new HttpClientBase(`${window.location.origin}${projectRoot}/api`);
  const limit = parseInt(list.getAttribute('data-faq-limit') || '0', 10);

  function renderState(message) {
    const item = document.createElement('article');
    item.className = 'accordion-item';
    const content = document.createElement('section');
    content.className = 'accordion-content';
    content.style.display = 'block';
    const text = document.createElement('p');
    text.textContent = message;
    content.appendChild(text);
    item.appendChild(content);
    list.replaceChildren(item);
  }

  function createFaqItem(faq, index) {
    const item = document.createElement('article');
    item.className = 'accordion-item';

    const trigger = document.createElement('button');
    trigger.className = 'accordion-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.id = `faq-${faq.id || index + 1}`;
    trigger.textContent = faq.question;

    const icon = document.createElement('em');
    icon.className = 'accordion-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '\u25BE';

    const content = document.createElement('section');
    content.className = 'accordion-content';
    content.setAttribute('role', 'region');
    content.setAttribute('aria-labelledby', trigger.id);

    const answer = document.createElement('p');
    answer.textContent = faq.answer;

    trigger.appendChild(icon);
    content.appendChild(answer);
    item.appendChild(trigger);
    item.appendChild(content);

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      list.querySelectorAll('.accordion-item.is-open').forEach((openItem) => {
        openItem.classList.remove('is-open');
        openItem.querySelector('.accordion-trigger')?.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    return item;
  }

  async function loadFaqs() {
    renderState('Carregando perguntas frequentes...');

    try {
      const response = await client.get('/faqs/active');
      const faqs = limit > 0 ? (response.data || []).slice(0, limit) : (response.data || []);

      if (!faqs.length) {
        renderState('Nenhuma pergunta frequente publicada no momento.');
        return;
      }

      const fragment = document.createDocumentFragment();
      faqs.forEach((faq, index) => {
        fragment.appendChild(createFaqItem(faq, index));
      });
      list.replaceChildren(fragment);
    } catch (error) {
      renderState('Nao foi possivel carregar as perguntas frequentes.');
      console.error('[FAQ] Erro ao carregar perguntas:', error.message);
    }
  }

  loadFaqs();
}

document.addEventListener('DOMContentLoaded', () => {
  initOnboardingSteps();
  initPlanSelector();
  initProfileToggle();
  initSmoothScroll();
  animateCounters();
  initPublicFaqs();
});
