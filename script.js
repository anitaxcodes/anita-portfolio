/* ============================================================
   ANITA DANGOL PORTFOLIO — script.js
   ============================================================ */

'use strict';

/* ============================================================
   1. PAGE LOADER
   After 1500ms: fade loader out, reveal main content.
   ============================================================ */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const main   = document.getElementById('main-content');

  setTimeout(() => {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
      main.classList.add('visible');
    }, 520);
  }, 1500);
});

/* ============================================================
   2. STARFIELD CANVAS
   Static twinkling stars in white, cyan and purple.
   ============================================================ */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const STAR_COLORS = ['#ffffff', '#00FFFF', '#9B59B6'];
  const STAR_COUNT  = 280;
  let stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function buildStars() {
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      r:       Math.random() * 1.4 + 0.3,
      color:   STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      alpha:   Math.random() * 0.7 + 0.2,
      // twinkle: slowly oscillate alpha
      speed:   Math.random() * 0.008 + 0.002,
      phase:   Math.random() * Math.PI * 2,
    }));
  }

  function drawStars(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const twinkle = s.alpha * (0.6 + 0.4 * Math.sin(t * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = twinkle;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawStars);
  }

  window.addEventListener('resize', () => { resize(); buildStars(); });
  resize();
  buildStars();
  requestAnimationFrame(drawStars);
})();

/* ============================================================
   CUSTOM CURSOR — dot only, sparkle trail on move
   ============================================================ */
const cursorDot = document.querySelector('.cursor');
let mx = 0, my = 0;

const SPARKLE_COLORS = ['#ffffff', '#00FFFF', '#9B59B6'];

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  if (cursorDot) {
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  }
  spawnSparkle(mx, my);
});

let lastSparkle = 0;
function spawnSparkle(x, y) {
  const now = Date.now();
  if (now - lastSparkle < 30) return;   // throttle: max ~33 sparkles/s
  lastSparkle = now;

  const el = document.createElement('div');
  el.className = 'sparkle';

  const size   = Math.random() * 3 + 2;          // 2–5px
  const color  = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
  const offX   = (Math.random() - 0.5) * 14;     // slight scatter
  const offY   = (Math.random() - 0.5) * 14;

  el.style.cssText = `
    left:${x + offX}px;
    top:${y + offY}px;
    width:${size}px;
    height:${size}px;
    background:${color};
    box-shadow:0 0 ${size * 2}px ${color};
  `;

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 620);
}

// Grow dot on interactive elements
document.querySelectorAll('a, button, .contact-reveal-row, [role="button"]')
  .forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (cursorDot) cursorDot.style.transform = 'translate(-50%,-50%) scale(2.4)';
    });
    el.addEventListener('mouseleave', () => {
      if (cursorDot) cursorDot.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  });

/* ============================================================
   3. TYPING / ROTATING HERO TITLE
   Fades out, swaps phrase, fades in every 2500ms.
   ============================================================ */
const phrases = [
  'Security Enthusiast',
  'Digital Forensics Student',
  'CTF Player',
  'Defensive Security Analyst',
];

const typedEl = document.getElementById('typed-text');
let phraseIdx = 0;

if (typedEl) {
  typedEl.textContent = phrases[0];

  setInterval(() => {
    typedEl.style.transition = 'opacity 0.4s ease';
    typedEl.style.opacity    = '0';

    setTimeout(() => {
      phraseIdx = (phraseIdx + 1) % phrases.length;
      typedEl.textContent = phrases[phraseIdx];
      typedEl.style.opacity = '1';
    }, 420);
  }, 2500);
}

/* ============================================================
   4. ANIMATED STAT COUNTERS
   Counts from 0 → target over 2000ms (ease-out cubic).
   Triggered by Intersection Observer on #about.
   ============================================================ */
function runCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const startTs  = performance.now();

  function tick(now) {
    const elapsed  = now - startTs;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }

  requestAnimationFrame(tick);
}

const aboutSection = document.getElementById('about');
if (aboutSection) {
  const statsObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-number').forEach(runCounter);
        statsObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });

  statsObs.observe(aboutSection);
}

/* ============================================================
   5. SCROLL REVEAL ANIMATIONS
   Adds .visible to .reveal elements as they enter viewport.
   Children are staggered by their sibling index (0.1s each).
   ============================================================ */
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // Find sibling index within parent grid for stagger
      const siblings = Array.from(entry.target.parentElement?.children || []);
      const idx      = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = (idx * 0.10) + 's';
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObs.observe(el));
} else {
  // Fallback: show all immediately
  revealEls.forEach(el => el.classList.add('visible'));
}

/* ============================================================
   6. TESTIMONIAL SLIDER
   JS-powered, one card visible at a time.
   Prev / Next buttons + dot indicators + auto-advance 5s.
   ============================================================ */
const testimonials = [
  {
    quote: '"Anita demonstrates exceptional dedication to cybersecurity concepts. Her analytical approach to problem-solving and ability to communicate technical findings clearly sets her apart."',
    name:  'Apil Chang',
    title: 'Lecturer, The Westminster College',
  },
  {
    quote: '"Anita\'s structured reports and attention to detail in data analysis made a real impact on our content strategy. A highly reliable and proactive team member."',
    name:  'Sanish Shrestha',
    title: 'Manager, Nepsay Mart',
  },
  {
    quote: '"Her ability to translate complex digital insights into clear, actionable recommendations for non-technical stakeholders is a rare and valuable skill."',
    name:  'Mandip Dhakal',
    title: 'Supervisor, Regulus Treks and Expedition',
  },
];

let slideIdx = 0;
let autoSlideTimer;

const tCard  = document.getElementById('testimonial-card');
const tQuote = document.getElementById('testimonial-quote');
const tName  = document.getElementById('author-name');
const tTitle = document.getElementById('author-title');
const dotsEl = document.getElementById('slider-dots');

function buildDots() {
  if (!dotsEl) return;
  dotsEl.innerHTML = '';
  testimonials.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className   = 'slider-dot' + (i === slideIdx ? ' active' : '');
    btn.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    btn.setAttribute('role', 'tab');
    btn.addEventListener('click', () => goSlide(i));
    dotsEl.appendChild(btn);
  });
}

function goSlide(idx) {
  if (!tCard) return;

  tCard.style.opacity = '0';

  setTimeout(() => {
    slideIdx      = ((idx % testimonials.length) + testimonials.length) % testimonials.length;
    const t       = testimonials[slideIdx];
    tQuote.textContent = t.quote;
    tName.textContent  = t.name;
    tTitle.textContent = t.title;
    tCard.style.opacity = '1';
    buildDots();
  }, 380);
}

// Init
if (tQuote) {
  const t = testimonials[0];
  tQuote.textContent = t.quote;
  tName.textContent  = t.name;
  tTitle.textContent = t.title;
  buildDots();
}

document.getElementById('prev-btn')?.addEventListener('click', () => {
  clearInterval(autoSlideTimer);
  goSlide(slideIdx - 1);
  startAutoSlide();
});

document.getElementById('next-btn')?.addEventListener('click', () => {
  clearInterval(autoSlideTimer);
  goSlide(slideIdx + 1);
  startAutoSlide();
});

function startAutoSlide() {
  autoSlideTimer = setInterval(() => goSlide(slideIdx + 1), 5000);
}
startAutoSlide();

/* ============================================================
   7. ACTIVE SECTION TRACKER (used by nav highlight)
   ============================================================ */
const SECTIONS = [
  'home', 'about', 'skills', 'experience', 'certifications',
  'education', 'projects', 'testimonials', 'blog', 'contact',
];

function getActiveSectionId() {
  const mid = window.scrollY + window.innerHeight * 0.45;
  let active = SECTIONS[0];
  SECTIONS.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= mid) active = id;
  });
  return active;
}

/* ============================================================
   8. ACTIVE HEADER NAV LINK
   Highlights the nav link matching the current section.
   ============================================================ */
const navLinks = document.querySelectorAll('.nav-link');

function updateNavHighlight() {
  const active = getActiveSectionId();
  navLinks.forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    link.classList.toggle('active', href === active);
  });
}

/* Scroll listener — nav highlight */
window.addEventListener('scroll', updateNavHighlight, { passive: true });
updateNavHighlight();

/* ============================================================
   9. HAMBURGER MOBILE MENU
   Toggles .open on nav-links. Closes on link click or Escape.
   ============================================================ */
const hamburgerBtn = document.getElementById('hamburger');
const navList      = document.getElementById('nav-links');

function closeMenu() {
  hamburgerBtn?.classList.remove('open');
  navList?.classList.remove('open');
  hamburgerBtn?.setAttribute('aria-expanded', 'false');
}

hamburgerBtn?.addEventListener('click', () => {
  const isOpen = hamburgerBtn.classList.toggle('open');
  navList.classList.toggle('open', isOpen);
  hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
});

navList?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

document.addEventListener('click', e => {
  if (!hamburgerBtn?.contains(e.target) && !navList?.contains(e.target)) {
    closeMenu();
  }
});

/* ============================================================
   10. CONTACT INFO REVEAL
   Email: decoded from Base64 on click.
   Phone: assembled from parts on click.
   ============================================================ */
const EMAIL_B64   = 'YW5pa2FkYW5nb2xAZ21haWwuY29t';
const PHONE_PARTS = ['+977', '-', '9808507929'];

let emailShown = false;
let phoneShown = false;

// Hero email row
const emailRow = document.getElementById('email-row');
emailRow?.addEventListener('click', revealEmail);
emailRow?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') revealEmail(); });

function revealEmail() {
  if (emailShown) return;
  const decoded = atob(EMAIL_B64);
  emailRow.querySelector('.reveal-text').textContent = decoded;
  emailShown = true;

  // Sync contact section reveal as well
  const contactEl = document.getElementById('contact-email-reveal');
  if (contactEl) contactEl.textContent = decoded;
}

// Hero phone row
const phoneRow = document.getElementById('phone-row');
phoneRow?.addEventListener('click', revealPhone);
phoneRow?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') revealPhone(); });

function revealPhone() {
  if (phoneShown) return;
  phoneRow.querySelector('.reveal-text').textContent = PHONE_PARTS.join('');
  phoneShown = true;
}

// Contact section email card reveal
const contactEmailEl = document.getElementById('contact-email-reveal');
contactEmailEl?.addEventListener('click', () => {
  if (contactEmailEl.textContent === 'Click to reveal') {
    contactEmailEl.textContent = atob(EMAIL_B64);
  }
});
contactEmailEl?.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && contactEmailEl.textContent === 'Click to reveal') {
    contactEmailEl.textContent = atob(EMAIL_B64);
  }
});

/* ============================================================
   11. SMOOTH SCROLL for all anchor links
   CSS scroll-behavior:smooth already handles most cases;
   this JS ensures header offset is respected.
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id     = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});
