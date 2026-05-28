/* ============================================================
   ANITA DANGOL PORTFOLIO — script.js
   ============================================================ */

'use strict';

/* ============================================================
   0. INTRO OVERLAY
   Slides up after 2.5 s to reveal the main site.
   ============================================================ */
(function initIntro() {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;
  setTimeout(() => {
    overlay.classList.add('slide-out');
    setTimeout(() => { overlay.style.display = 'none'; }, 900);
  }, 2500);
})();

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
   2. WEBGL BACKGROUND — Three.js
   Icosahedron on right side, forensics orbit rings, mini stars.
   ============================================================ */
(function initWebGL() {
  const container = document.getElementById('webgl-container');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.022);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 15;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // ── Group — sits in the right-side empty space of the hero ──
  const group = new THREE.Group();
  group.position.x = 7;
  scene.add(group);

  // Wireframe icosahedron (outer only — small inner removed)
  const coreMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(4, 2),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.18 })
  );
  group.add(coreMesh);

  // Particle cloud tightly around the icosahedron
  const pGeo = new THREE.BufferGeometry();
  const COUNT = 2200;
  const pos   = new Float32Array(COUNT * 3);
  const col   = new Float32Array(COUNT * 3);
  const c1    = new THREE.Color(0x00ffcc);
  const c2    = new THREE.Color(0x8b5cf6);

  for (let i = 0; i < COUNT * 3; i += 3) {
    const r     = 5 + Math.random() * 9;
    const theta = 2 * Math.PI * Math.random();
    const phi   = Math.acos(2 * Math.random() - 1);
    pos[i]     = r * Math.sin(phi) * Math.cos(theta);
    pos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i + 2] = r * Math.cos(phi);
    const m = c1.clone().lerp(c2, Math.random());
    col[i] = m.r; col[i + 1] = m.g; col[i + 2] = m.b;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.05, vertexColors: true,
    transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending,
  }));
  group.add(particles);

  // ── Forensics orbit rings (scanning / radar vibe) ────────────
  const mkRing = (radius, tube, color, opacity, rx, ry, rz) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(radius, tube, 6, 120),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
    );
    m.rotation.set(rx, ry, rz);
    group.add(m);
    return m;
  };
  const ring1 = mkRing(5.2, 0.016, 0x00ffcc, 0.22, Math.PI / 2, 0, 0);
  const ring2 = mkRing(6.4, 0.011, 0x8b5cf6, 0.16, Math.PI / 5, 0, Math.PI / 7);
  const ring3 = mkRing(4.6, 0.009, 0x00ffcc, 0.10, -Math.PI / 3, Math.PI / 4, 0);

  // ── Mini background stars (scene-level, not in group) ────────
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(550 * 3);
  for (let i = 0; i < 550 * 3; i++) starPos[i] = (Math.random() - 0.5) * 110;
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starField = new THREE.Points(starGeo, new THREE.PointsMaterial({
    size: 0.07, color: 0xffffff, transparent: true, opacity: 0.20,
  }));
  scene.add(starField);

  // ── Mouse parallax ──────────────────────────────────────────
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX - window.innerWidth  / 2;
    mouseY = e.clientY - window.innerHeight / 2;
  });

  // ── Scroll: fade out past hero, scale up while scrolling ─────
  let scrollScale = 1;
  function onScroll() {
    const hero = document.getElementById('home');
    if (!hero) return;
    const heroH   = hero.offsetHeight;
    const scrollY = window.scrollY;
    const fadeStart = heroH * 0.65;
    container.style.opacity = String(
      scrollY < fadeStart ? 1 : Math.max(0, 1 - (scrollY - fadeStart) / (heroH * 0.35))
    );
    scrollScale = 1 + Math.min(scrollY / heroH, 1) * 0.45;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Animation loop ──────────────────────────────────────────
  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    coreMesh.rotation.y += 0.002;
    particles.rotation.y = t * 0.04;

    ring1.rotation.z += 0.0028;
    ring2.rotation.y += 0.0018;
    ring3.rotation.z -= 0.0014;

    starField.rotation.y = t * 0.004;

    // Mouse parallax on whole group
    group.rotation.y += 0.05 * (mouseX * 0.004 - group.rotation.y);
    group.rotation.x += 0.05 * (mouseY * 0.004 - group.rotation.x);

    group.scale.setScalar(scrollScale);

    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
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
    name:  'Apil Chand',
    title: 'Lecturer',
  },
  {
    quote: '"Anita\'s structured reports and attention to detail in data analysis made a real impact on our content strategy. A highly reliable and proactive team member."',
    name:  'Sandesh Neupane',
    title: 'Manager, Nepsay Mart',
  },
  {
    quote: '"Her ability to translate complex digital insights into clear, actionable recommendations for non-technical stakeholders is a rare and valuable skill."',
    name:  'Madan Bhandari',
    title: 'Regulus Supervisor, Regulus Treks and Expedition',
  },
  {
    quote: '"Working with her has been a smooth experience she handles every technical task with great care, precision, and responsibility."',
    name:  'Sunita Dangol',
    title: 'CEO, GoNepal Explore',
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
