# Zeyad Walid | Personal Portfolio

A high-performance, interactive personal portfolio website built to showcase my work as a Full Stack & WordPress Plugin Developer.

## 🚀 Features

- **Modern Architecture**: Pure HTML5, CSS3, and Vanilla JavaScript. No heavy frameworks, ensuring blazing fast load times.
- **Advanced Animations**: Powered by **GSAP** (GreenSock) and **Lenis** for buttery smooth scrolling, staggered reveals, and scroll-triggered parallax effects.
- **Canvas Visuals**: 
  - Interactive wave background.
  - Custom canvas-based particle engines (`services-signature-orbs`, `contact-signature-orbs`) that morph particles into SVGs (Phone, Mail, WhatsApp, Custom logos).
  - Mouse-tracking interactive text particles.
- **Performance First**:
  - Parallel CSS loading with modular architecture (no `@import` waterfalls).
  - Optimized `requestAnimationFrame` (rAF) loops for the custom cursor and canvas animations.
  - `will-change` and CSS containment (`contain`) for GPU hardware acceleration.
  - **Mobile Performance Mode**: Automatically disables heavy canvas effects and backdrop filters on mobile devices to preserve battery and maintain smooth 60fps.
  - Image lazy loading with CSS skeleton fallbacks.
- **Theming**: Fully supported Light/Dark mode with seamless CSS variable transitions.
- **SEO & Accessibility**: Semantic HTML, ARIA labels, and injected JSON-LD structured data (Schema.org) for rich search engine results.

## 📁 File Structure

- `/styles/` - Modular CSS architecture loaded in parallel (Base, Components, Layouts, Effects, Pages).
- `/scripts/` - Vanilla JS modules for animations, canvas effects, and UI interactions.
- `/assets/` - Optimized `.webp` images and media.
- `index.html` - Home page & Hero.
- `about.html` - Professional background and skills.
- `projects.html` - Portfolio gallery.
- `services.html` - Offerings, case studies, and process structures.
- `contact.html` - Get in touch.

## 🛠️ Tech Stack

- **Markup & Styling**: HTML5, CSS3 (Custom Properties, Grid, Flexbox)
- **Scripting**: Vanilla JavaScript (ES6+)
- **Animation Engine**: [GSAP 3](https://greensock.com/gsap/) + ScrollTrigger
- **Smooth Scroll**: [Lenis](https://lenis.darkroom.engineering/)

## 👨‍💻 About Me

I'm **Zeyad Walid**, a developer based in Cairo, Egypt, specializing in scalable web applications and custom WordPress solutions. I build tools that replace manual admin work and turn complex problems into clean, production-ready products.

---
*Designed & Built by Zeyad Walid.*