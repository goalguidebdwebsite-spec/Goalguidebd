(function () {
  "use strict";

  const selectors = [
    ".german-course-card",
    ".home-blog-card",
    ".home-why-card",
    ".home-journey-card",
    ".schedule-card",
    ".registration-card",
    ".admission-questions-card",
    ".exam-fee-card",
    ".gallery-category",
    ".gallery-carousel-slide",
    ".contact-detail",
    ".terms-section",
    ".privacy-section",
    ".course-detail-media",
    ".course-meta",
    ".course-extra-copy"
  ];
  const heroHeadingSelector = [
    "#hero-title",
    "main h1:not(#registration-title)",
    ".german-hero h1",
    ".class-schedule-hero h1",
    ".admission-hero h1",
    ".about-hero h1",
    ".course-page-hero h1"
  ].join(",");

  function prepareHeroHeading(heading) {
    if (!(heading instanceof Element) || heading.classList.contains("hero-letter-motion-title")) return;
    if (!heading.querySelector(".hero-title-letter")) {
      const text = heading.textContent || "";
      const parts = text.match(/\s+|[^\s]+/gu) || [];
      const lifts = [6, 3, 5, 2, 7, 4, 3, 6, 2];
      const rotations = [-2, 1, -1, 2, -1, 1, -2, 1, -1];
      const scales = [1.1, 1.08, 1.12, 1.06, 1.15, 1.09, 1.07, 1.11, 1.08];
      const fragment = document.createDocumentFragment();
      let letterIndex = 0;

      parts.forEach((part) => {
        if (/^\s+$/u.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }
        const word = document.createElement("span");
        word.className = "hero-title-word";
        Array.from(part).forEach((character) => {
          const letter = document.createElement("span");
          const styleIndex = letterIndex % lifts.length;
          letter.className = "hero-title-letter";
          letter.textContent = character;
          letter.style.setProperty("--hero-letter-lift", `-${lifts[styleIndex]}px`);
          letter.style.setProperty("--hero-letter-rotate", `${rotations[styleIndex]}deg`);
          letter.style.setProperty("--hero-letter-scale", scales[styleIndex]);
          letter.style.setProperty("--hero-letter-delay", `${Math.min(letterIndex * 5, 180)}ms`);
          word.appendChild(letter);
          letterIndex += 1;
        });
        fragment.appendChild(word);
      });
      heading.replaceChildren(fragment);
    }
    heading.classList.add("hero-letter-motion-title");
  }

  function scanHeroHeadings(root) {
    if (!(root instanceof Element || root instanceof Document)) return;
    if (root instanceof Element && root.matches(heroHeadingSelector)) prepareHeroHeading(root);
    root.querySelectorAll(heroHeadingSelector).forEach(prepareHeroHeading);
  }

  // The German Language overview has its own observer for the Journey copy
  // and statistics. Avoid animating their parent at the same time.
  const pagePath = window.location.pathname.replace(/index\.html$/i, "").replace(/\/+$/, "");
  const isGermanOverview = pagePath.split("/").pop().toLowerCase() === "german_language";
  const selector = selectors
    .filter((item) => !(isGermanOverview && item === ".home-journey-card"))
    .join(",");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !("IntersectionObserver" in window)) return;
  scanHeroHeadings(document);
  const isMobile = window.matchMedia("(max-width: 700px)").matches;

  const observed = new WeakSet();
  let sequence = 0;

  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("scroll-motion-visible");
      activeObserver.unobserve(entry.target);
    });
  }, {
    threshold: isMobile ? 0.01 : 0.08,
    rootMargin: isMobile ? "0px 0px 2% 0px" : "0px 0px -6% 0px"
  });

  function watch(element) {
    if (!(element instanceof Element) || observed.has(element)) return;
    observed.add(element);
    element.classList.add("scroll-motion-card");
    element.style.setProperty("--scroll-motion-delay", Math.min(sequence % 4, 3) * 40 + "ms");
    sequence += 1;
    observer.observe(element);
  }

  function scan(root) {
    if (!(root instanceof Element || root instanceof Document)) return;
    scanHeroHeadings(root);
    if (root instanceof Element && root.matches(selector)) watch(root);
    root.querySelectorAll(selector).forEach(watch);
  }

  scan(document);

  const mutations = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node instanceof Element) scan(node);
      });
    });
  });
  if (document.body) mutations.observe(document.body, { childList: true, subtree: true });
})();
