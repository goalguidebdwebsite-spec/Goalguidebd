(function () {
  "use strict";

  const selector = [
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
  ].join(",");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !("IntersectionObserver" in window)) return;
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
