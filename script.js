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
   2. CUSTOM CURSOR
   .cursor   : snaps to mouse
   .cursor-follower : lags behind with lerp
   ============================================================ */
const cursorDot    = document.querySelector('.cursor');
const cursorRing   = document.querySelector('.cursor-follower');

let mx = 0, my = 0;       // mouse position
let fx = 0, fy = 0;       // follower position

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursorDot.style.left = mx + 'px';
  cursorDot.style.top  = my + 'px';
});

(function lerpFollower() {
  fx += (mx - fx) * 0.11;
  fy += (my - fy) * 0.11;
  cursorRing.style.left = fx + 'px';
  cursorRing.style.top  = fy + 'px';
  requestAnimationFrame(lerpFollower);
})();

// Scale cursor on interactive elements
document.querySelectorAll('a, button, .contact-reveal-row, [role="button"], .dot-btn')
  .forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.style.transform  = 'translate(-50%,-50%) scale(2.2)';
      cursorRing.style.transform = 'translate(-50%,-50%) scale(1.6)';
      cursorRing.style.opacity   = '0.35';
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.style.transform  = 'translate(-50%,-50%) scale(1)';
      cursorRing.style.transform = 'translate(-50%,-50%) scale(1)';
      cursorRing.style.opacity   = '0.55';
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
   7. FIXED SIDE-DOT NAVIGATION
   One dot per section. Active dot updates on scroll.
   Clicking a dot smooth-scrolls to that section.
   ============================================================ */
const SECTIONS = [
  'home', 'about', 'skills', 'experience', 'certifications',
  'education', 'projects', 'testimonials', 'blog', 'contact',
];

const dotBtns = document.querySelectorAll('.dot-btn');

dotBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.section);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

function getActiveSectionId() {
  const mid = window.scrollY + window.innerHeight * 0.45;
  let active = SECTIONS[0];
  SECTIONS.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= mid) active = id;
  });
  return active;
}

function updateDotNav() {
  const active = getActiveSectionId();
  dotBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === active);
  });
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

/* ============================================================
   Scroll listener — dots + nav highlight
   ============================================================ */
window.addEventListener('scroll', () => {
  updateDotNav();
  updateNavHighlight();
}, { passive: true });

// Run once on load
updateDotNav();
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
