const whatsappNumber = "5511992845113";
const whatsappLinks = document.querySelectorAll("[data-whatsapp]");
const yearLabel = document.querySelector("[data-year]");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const explodedRun = document.querySelector("[data-exploded-run]");
const steps = Array.from(document.querySelectorAll("[data-story-step]"));
const counter = document.querySelector("[data-exploded-count]");
const progressBar = document.querySelector("[data-progress-bar]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.documentElement.classList.add("has-js");

whatsappLinks.forEach((link) => {
  const message = link.dataset.whatsapp;
  link.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
});

if (yearLabel) {
  yearLabel.textContent = new Date().getFullYear();
}

if (menuToggle && mainNav) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    mainNav.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
    mainNav.classList.toggle("is-open", !isOpen);
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -36px 0px", threshold: 0.08 });

  document.querySelectorAll("[data-reveal]").forEach((card, index) => {
    card.style.transitionDelay = `${Math.min(index, 3) * 70}ms`;
    revealObserver.observe(card);
  });
} else {
  document.querySelectorAll("[data-reveal]").forEach((card) => {
    card.classList.add("is-visible");
  });
}

if (reducedMotion.matches) {
  steps.forEach((step) => step.removeAttribute("aria-hidden"));
} else if (explodedRun && steps.length > 0) {
  const parts = Array.from(explodedRun.querySelectorAll("[data-part]"));
  const offsets = {
    frame: [0, 25],
    board: [-88, 16],
    battery: [88, 18],
    display: [-12, -84],
    camera: [82, -64],
    screws: [22, 8],
  };
  let animationFrame = 0;

  const updateStory = () => {
    animationFrame = 0;
    const bounds = explodedRun.getBoundingClientRect();
    const scrollDistance = Math.max(1, bounds.height - window.innerHeight);
    const progress = Math.max(0, Math.min(1, -bounds.top / scrollDistance));
    const activeIndex = Math.min(steps.length - 1, Math.floor(progress * steps.length));
    const spread = 0.35 + progress * 0.65;

    parts.forEach((part) => {
      const [x, y] = offsets[part.dataset.part] || [0, 0];
      part.style.transform = `translate3d(${x * spread}px, ${y * spread}px, 0)`;
      if (part.dataset.part !== "frame" && part.dataset.part !== "display") {
        part.style.opacity = String(0.7 + 0.3 * progress);
      }
    });

    steps.forEach((step, index) => {
      const active = index === activeIndex;
      step.classList.toggle("is-active", active);
      if (active) {
        step.removeAttribute("aria-hidden");
        step.setAttribute("aria-current", "step");
      } else {
        step.setAttribute("aria-hidden", "true");
        step.removeAttribute("aria-current");
      }
    });

    if (counter) {
      counter.innerHTML = `${String(activeIndex + 1).padStart(2, "0")} <i>/</i> ${String(steps.length).padStart(2, "0")}`;
    }
    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
    }
  };

  const scheduleUpdate = () => {
    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(updateStory);
    }
  };

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  scheduleUpdate();
}
