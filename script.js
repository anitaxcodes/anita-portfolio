/* ============================================================
   ANITA DANGOL PORTFOLIO — script.js
   ============================================================ */

'use strict';

/* ============================================================
   INIT — run everything after DOM is ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initScrollProgress();
  initNavbar();
  initThemeToggle();
  initMobileMenu();
  initParticles();
  initTypingEffect();
  initTerminal();
  initScrollAnimations();
  initSkillBars();
  initCounters();
  initContactForm();
});

/* ============================================================
   1. LOADER
   ============================================================ */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  document.body.classList.add('no-scroll');

  setTimeout(() => {
    loader.classList.add('fade-out');
    document.body.classList.remove('no-scroll');
  }, 2000);
}

/* ============================================================
   2. SCROLL PROGRESS BAR
   ============================================================ */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function update() {
    const scrolled  = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = maxScroll > 0 ? (scrolled / maxScroll * 100) + '%' : '0%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ============================================================
   3. NAVBAR — scroll style + active link highlight
   ============================================================ */
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = Array.from(document.querySelectorAll('section[id]'));
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    // highlight the section whose top is closest above viewport mid
    const mid = window.scrollY + window.innerHeight / 3;
    let active = sections[0];
    sections.forEach(s => {
      if (s.offsetTop <= mid) active = s;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + active.id);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // smooth scroll on nav clicks
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 76, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   4. DARK / LIGHT THEME TOGGLE
   ============================================================ */
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const saved = localStorage.getItem('ad-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ad-theme', next);
  });
}

/* ============================================================
   5. MOBILE NAVIGATION MENU
   ============================================================ */
function initMobileMenu() {
  const btn   = document.getElementById('mobile-menu-btn');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;

  function close() {
    btn.classList.remove('open');
    links.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('open');
    links.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !links.contains(e.target)) close();
  });

  // close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
}

/* ============================================================
   6. CANVAS PARTICLE SYSTEM
   ============================================================ */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let rafId;

  const COLORS = [
    'rgba(126, 231, 193,',   // mint
    'rgba(184, 168, 255,',   // lavender
    'rgba(229, 231, 235,',   // light text
  ];

  /* ---- sizing ---- */
  function setSize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  /* ---- Particle class ---- */
  class Particle {
    constructor() { this.init(); }

    init() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 1.4 + 0.4;
      this.a  = Math.random() * 0.45 + 0.1;
      this.col= COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.col + this.a + ')';
      ctx.fill();
    }
  }

  /* ---- build particle pool ---- */
  function buildPool() {
    const density = Math.floor(canvas.width * canvas.height / 12000);
    const count   = Math.min(density, 80);
    particles = Array.from({ length: count }, () => new Particle());
  }

  /* ---- draw connecting lines ---- */
  function drawWeb() {
    const max = 115;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < max) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(126, 231, 193, ${(1 - dist / max) * 0.09})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ---- animation loop ---- */
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWeb();
    particles.forEach(p => { p.update(); p.draw(); });
    rafId = requestAnimationFrame(loop);
  }

  /* ---- responsive resize ---- */
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(rafId);
    setSize();
    buildPool();
    loop();
  });
  ro.observe(canvas.parentElement || canvas);

  setSize();
  buildPool();
  loop();
}

/* ============================================================
   7. TYPING EFFECT
   ============================================================ */
function initTypingEffect() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const phrases = [
    'Cybersecurity Student',
    'CTF Learner',
    'SEO Content Writer',
    'Creative Digital Enthusiast',
    'Ethical Hacking Explorer',
  ];

  let pIdx    = 0;
  let cIdx    = 0;
  let erasing = false;
  let timer;

  function tick() {
    const phrase = phrases[pIdx];

    if (!erasing) {
      el.textContent = phrase.slice(0, ++cIdx);
      if (cIdx >= phrase.length) {
        // pause then start erasing
        timer = setTimeout(() => { erasing = true; tick(); }, 2400);
        return;
      }
      timer = setTimeout(tick, 78);
    } else {
      el.textContent = phrase.slice(0, --cIdx);
      if (cIdx <= 0) {
        erasing = false;
        pIdx    = (pIdx + 1) % phrases.length;
        timer   = setTimeout(tick, 480);
        return;
      }
      timer = setTimeout(tick, 44);
    }
  }

  // delay first start until after loader
  setTimeout(tick, 2200);
}

/* ============================================================
   8. ANIMATED TERMINAL
   ============================================================ */
function initTerminal() {
  const container = document.getElementById('terminal-lines');
  if (!container) return;

  const script = [
    { kind: 'prompt',  cmd:  'whoami',              delay: 600  },
    { kind: 'output',  text: 'anita dangol — cybersecurity learner', delay: 960  },
    { kind: 'blank',                                 delay: 1200 },
    { kind: 'prompt',  cmd:  'ls skills/',           delay: 1500 },
    { kind: 'output',  text: 'ctf/  cryptography/  linux/  web-security/', delay: 1860 },
    { kind: 'blank',                                 delay: 2100 },
    { kind: 'prompt',  cmd:  'cat mission.txt',      delay: 2500 },
    { kind: 'output',  text: 'learn. build. grow. never stop.', delay: 2860 },
    { kind: 'blank',                                 delay: 3100 },
    { kind: 'comment', text: '# currently: solving CTF challenges 🚩', delay: 3500 },
  ];

  function appendLine(html) {
    const span = document.createElement('span');
    span.className   = 't-line';
    span.innerHTML   = html;
    container.appendChild(span);
    container.scrollTop = container.scrollHeight;
  }

  script.forEach(({ kind, cmd, text, delay }) => {
    setTimeout(() => {
      switch (kind) {
        case 'prompt':
          appendLine(
            `<span class="t-prompt">anita@cyber:~$</span> <span class="t-cmd">${escHtml(cmd)}</span>`
          );
          break;
        case 'output':
          appendLine(`<span class="t-output">${escHtml(text)}</span>`);
          break;
        case 'comment':
          appendLine(`<span class="t-comment">${escHtml(text)}</span>`);
          break;
        case 'blank':
          appendLine('&nbsp;');
          break;
      }
    }, delay);
  });
}

/* tiny XSS guard for terminal strings */
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ============================================================
   9. SCROLL-REVEAL  (Intersection Observer)
   ============================================================ */
function initScrollAnimations() {
  const els = document.querySelectorAll('[data-animate]');
  if (!('IntersectionObserver' in window)) {
    // fallback: just show everything
    els.forEach(el => el.classList.add('in-view'));
    return;
  }

  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -55px 0px' }
  );

  els.forEach(el => obs.observe(el));
}

/* ============================================================
   10. SKILL BAR ANIMATION
   ============================================================ */
function initSkillBars() {
  const fills = document.querySelectorAll('.level-fill');
  if (!fills.length) return;

  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.width || '0%';
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  fills.forEach(f => obs.observe(f));
}

/* ============================================================
   11. COUNTER ANIMATION (about stats)
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach(c => obs.observe(c));
}

function runCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1700;
  const start    = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      el.textContent = target + '+';
    }
  }

  requestAnimationFrame(frame);
}

/* ============================================================
   12. CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form     = document.getElementById('contact-form');
  if (!form) return;

  const btnText    = form.querySelector('.btn-text');
  const btnSending = form.querySelector('.btn-sending');
  const success    = document.getElementById('form-success');

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Basic client-side validation
    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) return;
    if (!isValidEmail(email)) {
      form.email.focus();
      return;
    }

    // Show loading state
    if (btnText)    btnText.classList.add('hidden');
    if (btnSending) btnSending.classList.remove('hidden');

    /*
      Replace this setTimeout with your actual form submission:
      e.g. fetch('/api/contact', { method:'POST', body: new FormData(form) })
    */
    setTimeout(() => {
      if (btnText)    btnText.classList.remove('hidden');
      if (btnSending) btnSending.classList.add('hidden');
      if (success)    success.classList.remove('hidden');

      form.reset();

      setTimeout(() => {
        if (success) success.classList.add('hidden');
      }, 6000);
    }, 1600);
  });

  // Floating label feel: add/remove focused class
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => input.closest('.form-group')?.classList.add('focused'));
    input.addEventListener('blur',  () => input.closest('.form-group')?.classList.remove('focused'));
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   13. FOOTER NAV — smooth scroll (handles links not in navbar)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id     = link.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 76, behavior: 'smooth' });
  });
});
