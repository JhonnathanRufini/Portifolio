const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const yearLabel = document.querySelector("#current-year");

if (yearLabel) {
  yearLabel.textContent = new Date().getFullYear();
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
    navLinks.classList.toggle("is-open", !isOpen);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
      navLinks.classList.remove("is-open");
    });
  });
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function createGalleryPlaceholder(gallery, title, description) {
  const placeholder = makeElement("div", "gallery-placeholder");
  placeholder.setAttribute("role", "img");
  placeholder.setAttribute("aria-label", `${title}. ${description} Adicione imagens à pasta assets/projects/${gallery.dataset.gallery}.`);

  const eyebrow = makeElement("span", "gallery-placeholder__eyebrow", "ESTUDO DE CASO");
  const heading = makeElement("span", "gallery-placeholder__title", title);
  const note = makeElement(
    "span",
    "gallery-placeholder__note",
    `Adicione imagens em assets/projects/${gallery.dataset.gallery}/ e execute npm run build.`
  );
  placeholder.append(eyebrow, heading, note);
  gallery.append(placeholder);

  const toolbar = makeElement("div", "case-gallery__toolbar");
  toolbar.append(makeElement("span", "gallery-caption", "GALERIA DO PROJETO"));
  toolbar.append(makeElement("span", "gallery-counter", "Imagens em breve"));
  gallery.append(toolbar);
}

function renderGallery(gallery, files) {
  const title = gallery.dataset.title || gallery.dataset.gallery;
  const description = gallery.dataset.description || `Imagens do projeto ${title}.`;

  if (!Array.isArray(files) || files.length === 0) {
    createGalleryPlaceholder(gallery, title, description);
    return;
  }

  const safeFiles = files.filter((file) => typeof file === "string" && !file.startsWith("/") && !file.includes(".."));
  if (safeFiles.length === 0) {
    createGalleryPlaceholder(gallery, title, description);
    return;
  }

  const main = makeElement("figure", "case-gallery__main");
  const mainImage = makeElement("img");
  mainImage.src = safeFiles[0];
  mainImage.alt = `${title} — ${description}`;
  mainImage.loading = "lazy";
  mainImage.decoding = "async";
  mainImage.addEventListener("error", () => {
    gallery.replaceChildren();
    createGalleryPlaceholder(gallery, title, description);
  }, { once: true });
  main.append(mainImage);
  gallery.append(main);

  const toolbar = makeElement("div", "case-gallery__toolbar");
  toolbar.append(makeElement("span", "gallery-caption", "GALERIA DO PROJETO"));
  const counter = makeElement("span", "gallery-counter", `1 / ${safeFiles.length}`);
  toolbar.append(counter);
  gallery.append(toolbar);

  if (safeFiles.length < 2) return;

  const thumbnails = makeElement("div", "case-gallery__thumbs");
  thumbnails.setAttribute("role", "group");
  thumbnails.setAttribute("aria-label", `Imagens do projeto ${title}`);

  safeFiles.forEach((src, index) => {
    const thumbnail = makeElement("button", "gallery-thumb");
    thumbnail.type = "button";
    thumbnail.setAttribute("aria-label", `Exibir imagem ${index + 1} de ${safeFiles.length} do projeto ${title}`);
    thumbnail.setAttribute("aria-pressed", String(index === 0));

    const image = makeElement("img");
    image.src = src;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    thumbnail.append(image);

    thumbnail.addEventListener("click", () => {
      mainImage.src = src;
      mainImage.alt = `${title} — imagem ${index + 1} de ${safeFiles.length}`;
      counter.textContent = `${index + 1} / ${safeFiles.length}`;
      thumbnails.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.setAttribute("aria-pressed", String(buttonIndex === index));
      });
    });
    thumbnails.append(thumbnail);
  });

  gallery.append(thumbnails);
}

const galleries = document.querySelectorAll("[data-gallery]");
galleries.forEach((gallery) => {
  const files = window.PROJECT_GALLERIES?.[gallery.dataset.gallery];
  renderGallery(gallery, files);
});

const projectCases = document.querySelectorAll(".case-list .case-study");
projectCases.forEach((project) => {
  project.addEventListener("toggle", () => {
    if (!project.open) return;
    projectCases.forEach((otherProject) => {
      if (otherProject !== project && otherProject.open) otherProject.open = false;
    });
  });
});

const revealElements = document.querySelectorAll(".recognition-card, .technology-group, .journey-timeline li");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  revealElements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}
