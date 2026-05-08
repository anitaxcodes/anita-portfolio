# Anita Dangol — Cybersecurity Portfolio

A modern, elegant personal portfolio website built with pure HTML, CSS, and Vanilla JavaScript.

## Tech Stack

- HTML5 (semantic, SEO-ready)
- CSS3 (custom properties, glassmorphism, animations)
- Vanilla JavaScript (ES6+, no frameworks)

## Features

- Glassmorphism dark/light UI
- Canvas particle system
- Typing text effect
- Animated terminal widget
- Scroll-reveal animations
- Animated skill bars
- Counter animations
- Scroll progress bar
- Responsive mobile-first design
- Dark / Light mode toggle (persists via localStorage)
- Accessible (ARIA labels, semantic HTML)

## Project Structure

```
anita-portfolio/
├── index.html      — full site markup
├── style.css       — all styles + animations
├── script.js       — all interactivity
├── assets/         — images, resume PDF, icons
└── README.md
```

## Running Locally

Open `index.html` directly in any modern browser — no build step, no server needed.

```
# Option 1: double-click index.html
# Option 2: VS Code Live Server extension (right-click → Open with Live Server)
# Option 3: Python quick server
python -m http.server 8080
# then open http://localhost:8080
```

## Customising

| What | Where |
|------|-------|
| Name / intro text | `index.html` — Hero section |
| Links (GitHub, LinkedIn, email) | `index.html` — Contact section + Hero CTAs |
| Color palette | `style.css` — `:root` CSS variables |
| Terminal script | `script.js` — `initTerminal()` `script` array |
| Typing phrases | `script.js` — `initTypingEffect()` `phrases` array |
| Skill levels | `index.html` — `data-width` attributes on `.level-fill` |
| Counter targets | `index.html` — `data-target` on `.stat-number` |

## Adding a Resume

Place your PDF in `assets/resume-anita-dangol.pdf` and update the hero button:

```html
<a href="assets/resume-anita-dangol.pdf" download class="btn btn-primary">
```

## Deployment (Cloudflare Pages)

1. Push this folder to a GitHub repository.
2. Go to **Cloudflare Pages → Create a project → Connect to Git**.
3. Select your repository.
4. Set **Framework preset** to `None` (static site).
5. Leave Build command blank, Output directory blank.
6. Click **Save and Deploy**.

Your site will be live at `https://yourproject.pages.dev`.

## Fonts Used

- **Space Grotesk** — headings (modern, technical)
- **Inter** — body text (clean, readable)
- **JetBrains Mono** — terminal / code elements

Loaded from Google Fonts — no installation needed.

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

Built with curiosity and code by **Anita Dangol**.
