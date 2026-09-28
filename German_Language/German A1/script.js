/* Shared renderer for all four German course detail pages. */
(function () {
  const SUPABASE_URL = "https://sdzbpsxkhpogbwixhulv.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_ahS3rtwQsIrXWGo2gIoJUA_JolIlwzf";
  const CACHE_KEY = "goalguide:german-language:v1";
  const level = document.body.dataset.courseLevel;

  const courses = {
    A1: {
      title: "German A1",
      image: "Images/german-a1.webp",
      duration: "12 Weeks",
      fee: "18,500 BDT",
      description: "Learn essential German language skills including basic grammar, vocabulary, listening, and speaking for everyday communication and a strong foundation.",
      copy: "The A1 course is designed for beginners. Step by step, you will learn how to introduce yourself, ask and answer simple questions, and manage familiar everyday situations in German.",
      goal: "With guided lessons and regular practice, you will build the foundation needed to continue to German A2 and prepare for the Goethe-Zertifikat A1 exam.",
      highlights: ["German pronunciation and alphabet", "Essential words and everyday expressions", "Basic sentence structure and grammar", "Listening, speaking, reading and writing practice"]
    },
    A2: {
      title: "German A2",
      image: "Images/german-a2.webp",
      duration: "12 Weeks",
      fee: "18,500 BDT",
      description: "Build on your A1 knowledge by improving sentence structure, vocabulary, listening, and speaking skills to communicate confidently in daily situations.",
      copy: "The A2 course develops your basic German skills so you can communicate in common situations at home, at work, while travelling, and in your community.",
      goal: "You will strengthen your grammar and vocabulary while practising longer conversations and preparing for the Goethe-Zertifikat A2 exam.",
      highlights: ["Everyday conversations and practical dialogues", "Expanded vocabulary and useful expressions", "More complex sentence structures", "Listening, speaking, reading and writing practice"]
    },
    B1: {
      title: "German B1",
      image: "Images/german-b1.webp",
      duration: "12 Weeks",
      fee: "18,500 BDT",
      description: "Develop independent German communication skills for academic, professional, and social contexts with structured grammar and exam-focused practice.",
      copy: "The B1 course helps you express opinions, describe experiences, explain plans, and take part in conversations on familiar topics with greater independence.",
      goal: "Structured lessons and exam practice help you use German in everyday, academic, and professional situations and prepare for the Goethe-Zertifikat B1 exam.",
      highlights: ["Independent communication in familiar situations", "Giving opinions and explaining experiences", "Grammar and vocabulary for longer discussions", "Goethe-Zertifikat B1 exam preparation"]
    },
    B2: {
      title: "German B2",
      image: "Images/german-b2.webp",
      duration: "12 Weeks",
      fee: "18,500 BDT",
      description: "Achieve advanced German proficiency with fluent communication, complex grammar, academic writing, and comprehensive Goethe-Zertifikat B2 preparation.",
      copy: "The B2 course develops confident, detailed communication. You will work with more demanding texts and discuss academic, professional, and social topics clearly.",
      goal: "Advanced grammar, writing tasks, presentations, and exam strategies prepare you for the Goethe-Zertifikat B2 and real-world German communication.",
      highlights: ["Fluent discussion of complex topics", "Advanced grammar and precise vocabulary", "Academic and professional writing practice", "Goethe-Zertifikat B2 exam preparation"]
    }
  };

  const course = courses[level] || courses.A1;
  const escapeHtml = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  function buildPage() {
    const highlightItems = course.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    document.getElementById("course-page").innerHTML = `
      <header class="site-header">
        <nav class="navbar" aria-label="Main navigation">
          <a class="brand" href="index.html"><img class="brand-logo" src="Images/Goalguide_Logo.webp" alt="Goal Guide BD logo"><span class="brand-name">Goal Guide BD</span></a>
          <button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu" aria-label="Open menu"><span></span><span></span><span></span></button>
          <div class="nav-menu" id="nav-menu">
            <ul class="nav-links">
              <li><a href="index.html">Home</a></li>
              <li><a href="German_Language/index.html">German Language</a></li>
              <li><a href="Class_Schedule/index.html">Class Schedule</a></li>
              <li><a href="Admission/index.html">Admission</a></li>
              <li><a href="Exam/index.html">Exam</a></li>
              <li><a href="About_Us/index.html">About Us</a></li>
            </ul>
            <a class="btn-contact" href="Contact_US/index.html">Contact Us</a>
          </div>
        </nav>
      </header>

      <section class="course-page-hero" aria-labelledby="course-page-title">
        <div class="course-page-hero-content">
          <h1 id="course-page-title">${escapeHtml(course.title)}</h1>
          <nav class="course-breadcrumbs" aria-label="Breadcrumb">
            <a href="index.html">Home</a><span aria-hidden="true">›</span>
            <a href="German_Language/index.html">German Courses</a><span aria-hidden="true">›</span>
            <span aria-current="page">${escapeHtml(course.title)}</span>
          </nav>
        </div>
      </section>

      <main class="course-detail" id="course-detail">
        <figure class="course-detail-media">
          <img class="course-detail-image" id="course-detail-image" src="${escapeHtml(course.image)}" alt="${escapeHtml(course.title)} course materials" loading="eager">
        </figure>
        <div class="course-meta" aria-label="Course details">
          <span class="course-meta-badge course-meta-duration">Course Duration: <strong id="course-duration">${escapeHtml(course.duration)}</strong></span>
          <span class="course-meta-badge course-meta-fee">Course Fee: <strong id="course-fee">${escapeHtml(course.fee)}</strong></span>
        </div>
        <p class="course-description" id="course-description">${escapeHtml(course.description)}</p>
        <div class="course-extra-copy">
          <h2>About the ${escapeHtml(course.title)} Course</h2>
          <p>${escapeHtml(course.copy)}</p>
          <p>${escapeHtml(course.goal)}</p>
          <h2>What You Will Learn</h2>
          <ul class="course-highlights">${highlightItems}</ul>
        </div>
        <a class="course-admission-link" href="Admission/index.html">Admission Now</a>
      </main>

      <footer class="gf" id="site-footer">
        <div class="gf-inner">
          <div class="gf-grid">
            <div class="gf-brand">
              <img class="gf-logo" id="f-logo" src="Images/Goalguide_Logo.webp" alt="Goal Guide BD logo">
              <p class="gf-desc" id="f-desc"></p>
              <div class="gf-social" id="f-social"></div>
            </div>
            <div class="gf-col">
              <h3>Company</h3>
              <ul class="gf-links">
                <li><a href="About_Us/index.html">About Us</a></li>
                <li><a href="German_Language/index.html">Courses</a></li>
                <li><a href="Exam/index.html">Exams &amp; Fees</a></li>
                <li><a href="Gallery/index.html">Gallery</a></li>
                <li><a href="Blog/index.html">Blog &amp; Updates</a></li>
              </ul>
            </div>
            <div class="gf-col">
              <h3>Legals</h3>
              <ul class="gf-links">
                <li><a href="Terms_and_Conditions/index.html">Terms and Conditions</a></li>
                <li><a href="Privacy_Policy/index.html">Privacy Policy</a></li>
              </ul>
            </div>
            <div class="gf-col" id="f-contact-col">
              <h3 id="f-contact-title"></h3>
              <ul class="gf-contact" id="f-contact"></ul>
            </div>
          </div>
          <div class="gf-bottom"><p id="f-copy"></p></div>
        </div>
      </footer>`;
  }

  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)); }
    catch (error) { return null; }
  }

  function findCourse(content) {
    const rows = content && Array.isArray(content.courses) ? content.courses : [];
    const wantedTitle = course.title.toLowerCase();
    return rows.find((row) => String(row && row.title || "").trim().toLowerCase() === wantedTitle) ||
      rows.find((row) => String(row && row.level || "").trim().toUpperCase() === level) || null;
  }

  function renderCourse(settings) {
    const row = findCourse(settings);
    if (!row) return;
    if (row.duration) document.getElementById("course-duration").textContent = row.duration;
    if (row.fee) document.getElementById("course-fee").textContent = row.fee;
    if (row.description) document.getElementById("course-description").textContent = row.description;
  }

  async function loadCourseSettings() {
    renderCourse(readCache());
    try {
      const response = await fetch(
        SUPABASE_URL + "/rest/v1/german_language_settings?id=eq.1&select=content",
        { headers: { apikey: SUPABASE_ANON_KEY, Accept: "application/json" }, cache: "no-store" }
      );
      if (!response.ok) throw new Error("Supabase request failed with status " + response.status);
      const rows = await response.json();
      if (rows.length && rows[0].content) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(rows[0].content)); } catch (error) { /* cache is optional */ }
        renderCourse(rows[0].content);
      }
    } catch (error) {
      console.warn("Course duration and fee could not be refreshed from German Language settings.", error);
    }
  }

  buildPage();
  loadCourseSettings();
})();
