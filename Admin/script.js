/* ===== Supabase ===== */
const SUPABASE_URL = "https://sdzbpsxkhpogbwixhulv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ahS3rtwQsIrXWGo2gIoJUA_JolIlwzf";
const BUCKET = "site-images";

const SESSION_KEY = "goalguide:admin-session";
const CACHE_KEY = "goalguide:footer:v2"; // same key the main page reads

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

/* Defaults = the content of the footer design image (same as the main page) */
const DEFAULTS = {
  logo_url: "Images/Goalguide-logo.webp",
  description:
    "WAIS BD is a trusted German language school in Dhaka, offering A1–B2 courses with a focus on Goethe exam preparation since 2013.",
  social: {
    facebook: "https://www.facebook.com/",
    youtube: "https://www.youtube.com/",
    instagram: "",
    x: "",
    tiktok: "",
    linkedin: "",
  },
  contact_title: "Contact",
  whatsapp: "+88 01717099770",
  phone: "+88 01717099770",
  email: "info.waisbd@gmail.com",
  address: "House 2/1, 3rd Floor, Kalabagan, Dhanmondi, Dhaka 1205",
  copyright: "© 2026 WAIS. All Rights Reserved",
};

const SOCIAL_KEYS = ["facebook", "youtube", "instagram", "x", "tiktok", "linkedin"];

const $ = (id) => document.getElementById(id);

/* ---------- helpers ---------- */
let toastTimer;
function toast(message, type) {
  const t = $("toast");
  t.textContent = message;
  t.className = "toast show" + (type === "error" ? " error" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 4500);
}

function setStatus(message, type) {
  const s = $("save-status");
  s.textContent = message;
  s.className = "status" + (type ? " " + type : "");
}

function mergeContent(content) {
  const data = content && typeof content === "object" ? content : {};
  return Object.assign({}, DEFAULTS, data, {
    social: Object.assign({}, DEFAULTS.social, data.social),
  });
}

/* ---------- login / logout ---------- */
function showApp(signedIn) {
  $("login-view").hidden = signedIn;
  $("app-view").hidden = !signedIn;
}

$("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('[type="submit"]');
  button.disabled = true;
  $("login-error").textContent = "";
  const { error } = await sb.auth.signInWithPassword({
    email: $("login-user").value.trim(),
    password: $("login-pass").value
  });
  button.disabled = false;
  if (error) {
    $("login-error").textContent = "Enter the correct email and password";
    return;
  }
  sessionStorage.setItem(SESSION_KEY, "1");
  $("login-pass").value = "";
  enterPanel();
});

$("logout-btn").addEventListener("click", async () => {
  sessionStorage.removeItem(SESSION_KEY);
  await sb.auth.signOut();
  showApp(false);
});

document.querySelectorAll("[data-password-target]").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const input = $(toggle.dataset.passwordTarget);
    const showPassword = input.type === "password";
    input.type = showPassword ? "text" : "password";
    toggle.textContent = showPassword ? "Hide" : "Show";
    toggle.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
    toggle.setAttribute("aria-pressed", String(showPassword));
  });
});

const passwordDialog = $("password-dialog");
$("change-password-open").addEventListener("click", async () => {
  const { data } = await sb.auth.getUser();
  $("password-account-email").textContent = data && data.user ? "Signed in as " + data.user.email : "";
  $("password-change-status").textContent = "";
  $("password-current").value = "";
  $("password-new").value = "";
  $("password-confirm").value = "";
  passwordDialog.querySelectorAll("[data-password-target]").forEach((toggle) => {
    $(toggle.dataset.passwordTarget).type = "password";
    toggle.textContent = "Show";
    toggle.setAttribute("aria-label", "Show password");
    toggle.setAttribute("aria-pressed", "false");
  });
  passwordDialog.showModal();
});
$("password-dialog-cancel").addEventListener("click", () => passwordDialog.close());
$("password-change-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const currentPassword = $("password-current").value;
  const newPassword = $("password-new").value;
  const confirmPassword = $("password-confirm").value;
  const status = $("password-change-status");
  const button = $("password-change-submit");
  if (newPassword.length < 8) {
    status.textContent = "Use at least 8 characters for the new password.";
    return;
  }
  if (newPassword !== confirmPassword) {
    status.textContent = "The passwords do not match.";
    return;
  }
  button.disabled = true;
  status.textContent = "Updating password…";
  const { data: userData, error: userError } = await sb.auth.getUser();
  if (userError || !userData.user || !userData.user.email) {
    button.disabled = false;
    status.textContent = "Your Admin session expired. Please sign in again.";
    return;
  }

  const { error: verifyError } = await sb.auth.signInWithPassword({
    email: userData.user.email,
    password: currentPassword
  });
  if (verifyError) {
    button.disabled = false;
    status.textContent = "Current password is incorrect.";
    return;
  }

  const { error } = await sb.auth.updateUser({ password: newPassword });
  button.disabled = false;
  if (error) {
    status.textContent = "Could not update password: " + error.message;
    return;
  }
  status.textContent = "Password updated successfully.";
  $("password-current").value = "";
  $("password-new").value = "";
  $("password-confirm").value = "";
  window.setTimeout(() => passwordDialog.close(), 1200);
});

/* ---------- tabs ---------- */
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");
const adminNav = $("admin-nav");
const adminNavToggle = $("admin-nav-toggle");
const adminNavBackdrop = $("admin-nav-backdrop");

function setAdminNavOpen(open) {
  adminNav.classList.toggle("open", open);
  adminNavBackdrop.hidden = !open;
  adminNavToggle.setAttribute("aria-expanded", String(open));
  adminNavToggle.setAttribute("aria-label", open ? "Close admin navigation" : "Open admin navigation");
  document.body.classList.toggle("admin-nav-open", open);
}

adminNavToggle.addEventListener("click", () => setAdminNavOpen(!adminNav.classList.contains("open")));
$("admin-nav-close").addEventListener("click", () => setAdminNavOpen(false));
adminNavBackdrop.addEventListener("click", () => setAdminNavOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setAdminNavOpen(false);
});
window.matchMedia("(min-width: 721px)").addEventListener("change", (event) => {
  if (event.matches) setAdminNavOpen(false);
});

const SECTION_ACTIONS = {
  home: { title: "Home", save: () => $("home-save-all").click(), restore: () => $("home-restore-defaults").click(), saveText: "Save all Home sections" },
  "german-language": { title: "German Language", save: ["german-save"], restore: ["german-reset"] },
  "class-schedule": { title: "Class Schedule", save: ["cs-save"], restore: ["cs-reset"] },
  admission: { title: "Admission", save: ["admission-options-save", "admission-contact-save"], restore: ["admission-options-reset", "admission-contact-reset"] },
  exam: { title: "Exam", save: ["exam-save"], restore: ["exam-reset"] },
  about: { title: "About Us", save: ["about-main-save", "save-btn"], restore: ["about-main-reset", "reset-btn"] },
  blog: { title: "Blog", save: () => $("blog-post-form").requestSubmit(), restore: () => $("blog-post-cancel").click(), saveText: "Save blog post", restoreText: "Clear form" },
  terms: { title: "Terms", save: () => $("terms-form").requestSubmit(), restore: ["terms-reset"], saveText: "Save Terms" },
  privacy: { title: "Privacy", save: () => $("privacy-form").requestSubmit(), restore: ["privacy-reset"], saveText: "Save Privacy Policy" },
  "contact-us": { title: "Contact Us", save: ["contact-page-save"], restore: null, saveText: "Save Contact Page" },
  gallery: { title: "Gallery", save: ["gallery-save"], restore: null, saveText: "Save Gallery" },
  messages: { title: "Messages", save: ["messages-refresh"], restore: null, saveText: "Refresh messages", saveClass: "btn-ghost" },
  registered: { title: "Registered", save: ["registered-refresh"], restore: null, saveText: "Refresh registrations", saveClass: "btn-ghost" }
};

function invokeSectionAction(action) {
  if (typeof action === "function") return action();
  (action || []).forEach((id) => $(id)?.click());
}

function updateSectionToolbar(name) {
  const config = SECTION_ACTIONS[name] || SECTION_ACTIONS.home;
  const save = $("section-save");
  const restore = $("section-restore");
  $("section-toolbar-title").textContent = config.title;
  save.className = "btn " + (config.saveClass || "btn-primary");
  save.textContent = config.saveText || "Save";
  save.hidden = !config.save;
  restore.textContent = config.restoreText || "Restore default values";
  restore.hidden = !config.restore;
  save.onclick = () => invokeSectionAction(config.save);
  restore.onclick = () => invokeSectionAction(config.restore);

  // The shared strip is the single visible home for save/reset controls.
  const controlIds = [
    "home-save-all", "home-restore-defaults", "german-save", "german-save-bottom", "german-reset", "german-reset-bottom",
    "cs-save", "cs-save-bottom", "cs-reset", "cs-reset-bottom", "admission-options-save", "admission-options-reset",
    "admission-contact-save", "admission-contact-reset", "exam-save", "exam-save-top", "exam-reset", "exam-reset-bottom",
    "about-main-save", "about-main-reset", "save-btn", "save-top", "reset-btn", "terms-save", "terms-reset",
    "privacy-save", "privacy-reset", "contact-page-save", "gallery-save", "messages-refresh", "registered-refresh",
    "blog-post-save", "blog-post-cancel"
  ];
  controlIds.forEach((id) => { const button = $(id); if (button) button.hidden = true; });
}

function showSection(name) {
  if (name === "registared") name = "registered";
  const target = $("section-" + name) ? name : "home";
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.target === target));
  panels.forEach((panel) => (panel.hidden = panel.id !== "section-" + target));
  updateSectionToolbar(target);
  history.replaceState(null, "", "#" + target);
}

updateSectionToolbar("home");

tabs.forEach((tab) => tab.addEventListener("click", () => {
  showSection(tab.dataset.target);
  setAdminNavOpen(false);
}));

/* ---------- footer form ---------- */
/* Relative paths (Images/…) live in the site root, one folder above /admin */
function previewSrc(url) {
  return /^([a-z][a-z0-9+.-]*:|\/)/i.test(url) ? url : "../" + url;
}

function updateLogoPreview() {
  const url = $("logo-url").value.trim() || DEFAULTS.logo_url;
  $("logo-preview").src = previewSrc(url);
}
$("logo-url").addEventListener("input", updateLogoPreview);

function populate(c) {
  $("logo-url").value = c.logo_url || "";
  updateLogoPreview();
  $("description").value = c.description || "";
  SOCIAL_KEYS.forEach((key) => ($("soc-" + key).value = c.social[key] || ""));


  $("contact-title").value = c.contact_title || "";
  $("whatsapp").value = c.whatsapp || "";
  $("phone").value = c.phone || "";
  $("email").value = c.email || "";
  $("address").value = c.address || "";
  $("copyright").value = c.copyright || "";
}

function collect() {
  const social = {};
  SOCIAL_KEYS.forEach((key) => (social[key] = $("soc-" + key).value.trim()));
  return {
    logo_url: $("logo-url").value.trim(),
    description: $("description").value.trim(),
    social,
    contact_title: $("contact-title").value.trim(),
    whatsapp: $("whatsapp").value.trim(),
    phone: $("phone").value.trim(),
    email: $("email").value.trim(),
    address: $("address").value.trim(),
    copyright: $("copyright").value.trim(),
  };
}

async function loadFooter() {
  const { data, error } = await sb
    .from("footer_settings")
    .select("content")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    populate(mergeContent(null));
    toast("Could not read Supabase (" + error.message + "). Did you run supabase-setup.sql?", "error");
    return;
  }
  populate(mergeContent(data && data.content));
}

async function saveFooter() {
  const buttons = [$("save-btn"), $("save-top")];
  const content = collect();
  buttons.forEach((b) => (b.disabled = true));
  setStatus("Saving…");

  const { error } = await sb
    .from("footer_settings")
    .upsert({ id: 1, content, updated_at: new Date().toISOString() });
  buttons.forEach((b) => (b.disabled = false));

  if (error) {
    setStatus("Could not save: " + error.message, "error");
    toast("Could not save. Did you run supabase-setup.sql in Supabase?", "error");
    return;
  }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(content));
  } catch (err) {
    /* ignore */
  }
  setStatus("Saved. The footer on the main page is updated.", "ok");
  toast("Saved to Supabase.");
}

$("save-btn").addEventListener("click", saveFooter);
$("save-top").addEventListener("click", saveFooter);

$("reset-btn").addEventListener("click", () => {
  populate(mergeContent(null));
  setStatus("Form reset to the default footer. Click Save to publish it.");
});

/* ---------- logo upload ---------- */
$("logo-file").addEventListener("change", async (event) => {
  const input = event.target;
  const file = input.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast("Please choose an image file.", "error");
    input.value = "";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    toast("The image is larger than 5 MB.", "error");
    input.value = "";
    return;
  }

  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = "footer/logo-" + Date.now() + "." + ext;
  toast("Uploading…");

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  input.value = "";
  if (error) {
    toast("Upload failed: " + error.message, "error");
    return;
  }
  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  $("logo-url").value = data.publicUrl;
  updateLogoPreview();
  toast("Logo uploaded. Click Save to publish it.");
});

/* ---------- start ---------- */
let loaded = false;

async function enterPanel() {
  showApp(true);
  showSection(location.hash.slice(1) || "home");
  if (!loaded) {
    loaded = true;
    await loadFooter();
  }
}

sb.auth.getSession().then(({ data, error }) => {
  if (!error && data.session && data.session.user) {
    sessionStorage.setItem(SESSION_KEY, "1");
    enterPanel();
  } else {
    sessionStorage.removeItem(SESSION_KEY);
    showApp(false);
  }
});


/* ===== Home: hero section (new) =====
   Saves the heading and the text under the German flag to the Supabase
   table hero_settings (run supabase-hero.sql once to create it). */
const HERO_CACHE_KEY = "goalguide:hero:v1"; // same key the main page reads

const HERO_DEFAULTS = {
  heading_start: "MASTER THE",
  heading_highlight: "GERMAN LANGUAGE",
  heading_end: "WITH CONFIDENCE",
  text: "Professional German language training in Dhaka for study, career and migration purposes.",
};

function heroSetStatus(message, type) {
  const s = $("hero-status");
  s.textContent = message;
  s.className = "status" + (type ? " " + type : "");
}

function heroUpdatePreview() {
  $("hero-pv-start").textContent = $("hero-heading-start").value;
  $("hero-pv-highlight").textContent = $("hero-heading-highlight").value;
  $("hero-pv-end").textContent = $("hero-heading-end").value;
}

["hero-heading-start", "hero-heading-highlight", "hero-heading-end"].forEach((id) =>
  $(id).addEventListener("input", heroUpdatePreview)
);

function heroPopulate(content) {
  const c = Object.assign({}, HERO_DEFAULTS, content && typeof content === "object" ? content : {});
  $("hero-heading-start").value = c.heading_start || "";
  $("hero-heading-highlight").value = c.heading_highlight || "";
  $("hero-heading-end").value = c.heading_end || "";
  $("hero-text").value = c.text || "";
  heroUpdatePreview();
}

function heroCollect() {
  return {
    heading_start: $("hero-heading-start").value.trim(),
    heading_highlight: $("hero-heading-highlight").value.trim(),
    heading_end: $("hero-heading-end").value.trim(),
    text: $("hero-text").value.trim(),
  };
}

async function heroLoad() {
  const { data, error } = await sb
    .from("hero_settings")
    .select("content")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    toast("Could not read the hero settings (" + error.message + "). Did you run supabase-hero.sql?", "error");
    return;
  }
  if (data && data.content && Object.keys(data.content).length) heroPopulate(data.content);
}

async function heroSave() {
  const button = $("hero-save");
  const content = heroCollect();
  button.disabled = true;
  heroSetStatus("Saving…");

  const { error } = await sb
    .from("hero_settings")
    .upsert({ id: 1, content, updated_at: new Date().toISOString() });
  button.disabled = false;

  if (error) {
    heroSetStatus("Could not save: " + error.message, "error");
    toast("Could not save the hero section. Did you run supabase-hero.sql in Supabase?", "error");
    return;
  }
  try {
    localStorage.setItem(HERO_CACHE_KEY, JSON.stringify(content));
  } catch (err) {
    /* ignore */
  }
  heroSetStatus("Saved. The hero section on the home page is updated.", "ok");
  toast("Hero section saved to Supabase.");
}

$("hero-save").addEventListener("click", heroSave);

$("hero-reset").addEventListener("click", () => {
  heroPopulate(HERO_DEFAULTS);
  heroSetStatus("Form reset to the default hero. Click Save to publish it.");
});

/* Load the saved hero values once, after the admin is logged in */
let heroLoaded = false;
function heroLoadOnce() {
  if (heroLoaded) return;
  heroLoaded = true;
  heroLoad();
}

heroPopulate(HERO_DEFAULTS);
$("login-form").addEventListener("submit", () => {
  if (sessionStorage.getItem(SESSION_KEY) === "1") heroLoadOnce();
});
if (sessionStorage.getItem(SESSION_KEY) === "1") heroLoadOnce();

/* ===== German Language page course cards =====
   This editor is for the German_Language page only. Home cards have a
   separate editor and table below. */
const GERMAN_CACHE_KEY = "goalguide:german-language:v1";

const GERMAN_DEFAULTS = {
  courses: [
    {
      level: "A1",
      title: "German A1",
      image: "Images/german-a1.webp",
      duration: "12 Weeks",
      fee: "18,500 BDT",
      description: "Learn essential German language skills including basic grammar, vocabulary, listening, and speaking for everyday communication and a strong foundation.",
      link_text: "Explore More",
      link_url: "German_Language/German A1/index.html"
    },
    {
      level: "A2",
      title: "German A2",
      image: "Images/german-a2.webp",
      duration: "12 Weeks",
      fee: "18,500 BDT",
      description: "Build on your A1 knowledge by improving sentence structure, vocabulary, listening, and speaking skills to communicate confidently in daily situations.",
      link_text: "Explore More",
      link_url: "German_Language/German A2/index.html"
    },
    {
      level: "B1",
      title: "German B1",
      image: "Images/german-b1.webp",
      duration: "12 Weeks",
      fee: "18,500 BDT",
      description: "Develop independent German communication skills for academic, professional, and social contexts with structured grammar and exam-focused practice.",
      link_text: "Explore More",
      link_url: "German_Language/German B1/index.html"
    },
    {
      level: "B2",
      title: "German B2",
      image: "Images/german-b2.webp",
      duration: "12 Weeks",
      fee: "18,500 BDT",
      description: "Achieve advanced German proficiency with fluent communication, complex grammar, academic writing, and comprehensive Goethe-Zertifikat B2 preparation.",
      link_text: "Explore More",
      link_url: "German_Language/German B2/index.html"
    }
  ]
};

function germanSetStatus(message, type) {
  const s = $("german-status");
  if (!s) return;
  s.textContent = message;
  s.className = "status" + (type ? " " + type : "");
}

function germanPreviewSrc(url) {
  return /^([a-z][a-z0-9+.-]*:|\/)/i.test(url) ? url : "../" + url;
}


function normalizeGermanImagePath(value) {
  return String(value || "")
    .replace(/Images\/German_B1\.webp/gi, "Images/german-b1.webp")
    .replace(/Images\/German_b1\.webp/gi, "Images/german-b1.webp")
    .replace(/Images\/German_B2\.webp/gi, "Images/german-b2.webp")
    .replace(/Images\/German_b2\.webp/gi, "Images/german-b2.webp");
}

function germanRenderFields(content) {
  const c = Object.assign({}, GERMAN_DEFAULTS, content && typeof content === "object" ? content : {});
  c.courses = Array.isArray(c.courses) ? c.courses : GERMAN_DEFAULTS.courses;

  const wrap = $("german-course-fields");
  wrap.innerHTML = "";

  c.courses.slice(0, 4).forEach((course, index) => {
    const fallback = GERMAN_DEFAULTS.courses[index];
    const data = Object.assign({}, fallback, course || {});
    data.image = normalizeGermanImagePath(data.image);
    if (/^German_Language\/index\.html#(?:a1|a2|b1|b2)$/i.test(data.link_url || "")) {
      data.link_url = "German_Language/German " + fallback.level + "/index.html";
    }
    const card = document.createElement("div");
    card.className = "card german-course-editor";
    card.innerHTML = `
      <h2>
        <span>${data.title || fallback.title}</span>
        <span class="german-course-badge">Card ${index + 1}</span>
      </h2>

      <div class="german-course-image-row">
        <img class="german-course-image-preview" id="german-image-preview-${index}" alt="">
        <div>
          <label class="field">
            <span>Image link</span>
            <input type="text" id="german-image-${index}" value="">
          </label>
          <label class="field">
            <span>Or upload a new image</span>
            <input type="file" id="german-image-file-${index}" accept="image/*">
          </label>
        </div>
      </div>

      <div class="german-course-fields">
        <label class="field">
          <span>Level label</span>
          <input type="text" id="german-level-${index}">
        </label>

        <label class="field">
          <span>Card heading</span>
          <input type="text" id="german-title-${index}">
        </label>

        <label class="field">
          <span>Course Duration</span>
          <input type="text" id="german-duration-${index}" placeholder="12 Weeks">
        </label>

        <label class="field">
          <span>Course Fee</span>
          <input type="text" id="german-fee-${index}" placeholder="18,500 BDT">
        </label>

        <label class="field field-wide">
          <span>Description</span>
          <textarea id="german-description-${index}" rows="4"></textarea>
        </label>

        <label class="field">
          <span>Link text</span>
          <input type="text" id="german-link-text-${index}">
        </label>

        <label class="field">
          <span>Link URL</span>
          <input type="text" id="german-link-url-${index}" placeholder="German_Language/German A1/index.html or https://...">
        </label>
      </div>

      <div class="save-bar">
        <span class="status" id="german-image-status-${index}" role="status"></span>
      </div>
    `;

    wrap.appendChild(card);

    $("german-image-" + index).value = data.image || "";
    $("german-level-" + index).value = data.level || "";
    $("german-title-" + index).value = data.title || "";
    $("german-duration-" + index).value = data.duration || "";
    $("german-fee-" + index).value = data.fee || "";
    $("german-description-" + index).value = data.description || "";
    $("german-link-text-" + index).value = data.link_text || "";
    $("german-link-url-" + index).value = data.link_url || "";

    const preview = $("german-image-preview-" + index);
    preview.src = germanPreviewSrc(data.image || fallback.image);
    preview.onerror = () => {
      preview.onerror = null;
      preview.style.opacity = ".35";
    };

    $("german-image-" + index).addEventListener("input", () => {
      preview.style.opacity = "1";
      preview.src = germanPreviewSrc($("german-image-" + index).value.trim());
    });

    $("german-image-file-" + index).addEventListener("change", (event) =>
      germanUploadImage(index, event)
    );
  });
}

function germanCollect() {
  return {
    courses: [0, 1, 2, 3].map((index) => ({
      level: $("german-level-" + index).value.trim(),
      title: $("german-title-" + index).value.trim(),
      image: normalizeGermanImagePath($("german-image-" + index).value.trim()),
      duration: $("german-duration-" + index).value.trim(),
      fee: $("german-fee-" + index).value.trim(),
      description: $("german-description-" + index).value.trim(),
      link_text: $("german-link-text-" + index).value.trim(),
      link_url: $("german-link-url-" + index).value.trim()
    }))
  };
}

async function germanLoad() {
  const { data, error } = await sb
    .from("german_language_settings")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    germanSetStatus("Could not read German Language settings: " + error.message, "error");
    toast("Could not read German Language settings. Run supabase-german-language.sql first.", "error");
    return;
  }

  germanRenderFields(data && data.content ? data.content : GERMAN_DEFAULTS);
}

async function germanSave() {
  const button = $("german-save");
  const bottomButton = $("german-save-bottom");
  const content = germanCollect();

  [button, bottomButton].forEach((b) => { if (b) b.disabled = true; });
  germanSetStatus("Saving…");

  const { error } = await sb
    .from("german_language_settings")
    .upsert({ id: 1, content, updated_at: new Date().toISOString() });

  [button, bottomButton].forEach((b) => { if (b) b.disabled = false; });

  if (error) {
    germanSetStatus("Could not save: " + error.message, "error");
    toast("Could not save German Language content. Check the Supabase table and policies.", "error");
    return;
  }

  try {
    localStorage.setItem(GERMAN_CACHE_KEY, JSON.stringify(content));
  } catch (err) {
    /* ignore */
  }

  germanSetStatus("Saved. The German Language cards are updated.", "ok");
  toast("German Language section saved to Supabase.");
}

async function germanUploadImage(index, event) {
  const input = event.target;
  const file = input.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast("Please choose an image file.", "error");
    input.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast("The image is larger than 5 MB.", "error");
    input.value = "";
    return;
  }

  const ext = (file.name.split(".").pop() || "webp")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") || "webp";
  const path = "german-language/card-" + (index + 1) + "-" + Date.now() + "." + ext;

  $("german-image-status-" + index).textContent = "Uploading…";

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type
    });

  input.value = "";

  if (error) {
    $("german-image-status-" + index).textContent = "";
    toast("Upload failed: " + error.message, "error");
    return;
  }

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  $("german-image-" + index).value = data.publicUrl;

  const preview = $("german-image-preview-" + index);
  preview.style.opacity = "1";
  preview.src = data.publicUrl;

  $("german-image-status-" + index).textContent = "Uploaded. Click Save to publish.";
}

let germanLoaded = false;
function germanLoadOnce() {
  if (germanLoaded) return;
  germanLoaded = true;
  germanLoad();
}

$("german-save").addEventListener("click", germanSave);
$("german-save-bottom").addEventListener("click", germanSave);

function germanReset() {
  germanRenderFields(GERMAN_DEFAULTS);
  germanSetStatus("Form reset to the default German Language cards. Click Save to publish it.");
}

$("german-reset").addEventListener("click", germanReset);
$("german-reset-bottom").addEventListener("click", germanReset);

const originalEnterPanel = enterPanel;
enterPanel = async function () {
  await originalEnterPanel();
  germanLoadOnce();
};

germanRenderFields(GERMAN_DEFAULTS);
if (sessionStorage.getItem(SESSION_KEY) === "1") germanLoadOnce();


/* ===== Home German course cards =====
   These settings power only the cards below the Home hero. */
const HOME_GERMAN_CACHE_KEY = "goalguide:home-german-courses:v1";
const HOME_GERMAN_DEFAULTS = {
  section_heading: "Choose Your German Learning Path",
  section_subtitle: "CEFR-aligned courses designed to prepare you for Goethe-Zertifikat exams.",
  courses: [
    { level: "A1", title: "German A1", image: "Images/German_A1.webp", description: "Learn essential German language skills including basic grammar, vocabulary, listening, and speaking for everyday communication and a strong foundation.", link_text: "Explore More", link_url: "German_Language/index.html#a1" },
    { level: "A2", title: "German A2", image: "Images/German_A2.webp", description: "Build on your A1 knowledge by improving sentence structure, vocabulary, listening, and speaking skills to communicate confidently in daily situations.", link_text: "Explore More", link_url: "German_Language/index.html#a2" },
    { level: "B1", title: "German B1", image: "Images/German_B1.webp", description: "Develop independent German communication skills for academic, professional, and social contexts with structured grammar and exam-focused practice.", link_text: "Explore More", link_url: "German_Language/index.html#b1" },
    { level: "B2", title: "German B2", image: "Images/German_B2.webp", description: "Achieve advanced German proficiency with fluent communication, complex grammar, academic writing, and comprehensive Goethe-Zertifikat B2 preparation.", link_text: "Explore More", link_url: "German_Language/index.html#b2" }
  ]
};

function homeGermanSetStatus(message, type) {
  const status = $("home-german-status");
  if (!status) return;
  status.textContent = message;
  status.className = "status" + (type ? " " + type : "");
}

function homeGermanPreviewSrc(url) {
  return /^([a-z][a-z0-9+.-]*:|\/)/i.test(url) ? url : "../" + url;
}

function homeGermanRender(content) {
  const settings = Object.assign({}, HOME_GERMAN_DEFAULTS, content && typeof content === "object" ? content : {});
  const courses = Array.isArray(settings.courses) ? settings.courses : HOME_GERMAN_DEFAULTS.courses;
  $("home-german-heading").value = settings.section_heading || "";
  $("home-german-subtitle").value = settings.section_subtitle || "";
  const wrap = $("home-german-course-fields");
  wrap.innerHTML = "";

  HOME_GERMAN_DEFAULTS.courses.forEach((fallback, index) => {
    const course = Object.assign({}, fallback, courses[index] || {});
    const card = document.createElement("div");
    card.className = "home-german-course-card";
    card.innerHTML = `
      <h3>${fallback.title}</h3>
      <img class="home-german-course-preview" id="home-german-image-preview-${index}" alt="${fallback.title} preview">
      <label class="field"><span>Image link</span><input type="text" id="home-german-image-${index}" placeholder="Images/German_A1.webp or https://…"></label>
      <label class="field"><span>Card heading</span><input type="text" id="home-german-title-${index}"></label>
      <label class="field"><span>Paragraph text</span><textarea id="home-german-description-${index}" rows="4"></textarea></label>
      <div class="home-german-link-fields">
        <label class="field"><span>Explore More button text</span><input type="text" id="home-german-link-text-${index}"></label>
        <label class="field"><span>Explore More link</span><input type="text" id="home-german-link-url-${index}" placeholder="German_Language/index.html#a1 or https://…"></label>
      </div>`;
    wrap.appendChild(card);

    $("home-german-image-" + index).value = course.image || "";
    $("home-german-title-" + index).value = course.title || "";
    $("home-german-description-" + index).value = course.description || "";
    $("home-german-link-text-" + index).value = course.link_text || "";
    $("home-german-link-url-" + index).value = course.link_url || "";
    const preview = $("home-german-image-preview-" + index);
    preview.src = homeGermanPreviewSrc(course.image || fallback.image);
    preview.onerror = () => { preview.style.opacity = ".35"; };
    $("home-german-image-" + index).addEventListener("input", () => {
      preview.style.opacity = "1";
      preview.src = homeGermanPreviewSrc($("home-german-image-" + index).value.trim());
    });
  });
}

function homeGermanCollect() {
  return {
    section_heading: $("home-german-heading").value.trim(),
    section_subtitle: $("home-german-subtitle").value.trim(),
    courses: HOME_GERMAN_DEFAULTS.courses.map((fallback, index) => ({
      level: fallback.level,
      title: $("home-german-title-" + index).value.trim(),
      image: $("home-german-image-" + index).value.trim(),
      description: $("home-german-description-" + index).value.trim(),
      link_text: $("home-german-link-text-" + index).value.trim(),
      link_url: $("home-german-link-url-" + index).value.trim()
    }))
  };
}

async function homeGermanLoad() {
  const { data, error } = await sb.from("home_german_courses_settings").select("content").eq("id", 1).maybeSingle();
  if (error) {
    homeGermanSetStatus("Could not read Home course settings: " + error.message, "error");
    toast("Could not read Home course settings. Run supabase-home-german-courses.sql first.", "error");
    return;
  }
  homeGermanRender(data && data.content ? data.content : HOME_GERMAN_DEFAULTS);
}

async function homeGermanSave() {
  const button = $("home-german-save");
  const content = homeGermanCollect();
  button.disabled = true;
  homeGermanSetStatus("Saving…");
  const { error } = await sb.from("home_german_courses_settings").upsert({ id: 1, content, updated_at: new Date().toISOString() });
  button.disabled = false;
  if (error) {
    homeGermanSetStatus("Could not save: " + error.message, "error");
    toast("Could not save Home course cards. Check the Supabase table and policies.", "error");
    return;
  }
  try { localStorage.setItem(HOME_GERMAN_CACHE_KEY, JSON.stringify(content)); } catch (err) { /* ignore */ }
  homeGermanSetStatus("Saved. Home course cards are updated.", "ok");
  toast("Home German course cards saved to Supabase.");
}

let homeGermanLoaded = false;
function homeGermanLoadOnce() {
  if (homeGermanLoaded) return;
  homeGermanLoaded = true;
  homeGermanLoad();
}

$("home-german-save").addEventListener("click", homeGermanSave);
$("home-german-reset").addEventListener("click", () => {
  homeGermanRender(HOME_GERMAN_DEFAULTS);
  homeGermanSetStatus("Form reset to the defaults. Click Save to publish them.");
});
const enterPanelBeforeHomeGerman = enterPanel;
enterPanel = async function () {
  await enterPanelBeforeHomeGerman();
  homeGermanLoadOnce();
};
homeGermanRender(HOME_GERMAN_DEFAULTS);
if (sessionStorage.getItem(SESSION_KEY) === "1") homeGermanLoadOnce();


/* ===== Home About section editor =====
   Content is stored in home_about_settings.content and read by the public home page. */
const HOME_ABOUT_CACHE_KEY = "goalguide:home-about:v1";

const HOME_ABOUT_DEFAULTS = {
  heading: "About WAIS - German Language School Dhaka",
  intro: "WAIS BD is a trusted German language institute in Dhaka, offering German language A1-B2 courses since 2013 with a focus on Goethe exam preparation and practical communication skills.",
  body: "WAIS BD - German Language School Dhaka has been providing structured German language education since 2013. We specialize in CEFR-aligned courses from A1 to B2, designed to prepare students for Goethe-Zertifikat examinations and real-world communication.",
  image: "Images/home-about.webp",
  button_text: "MORE ABOUT US",
  button_url: "About_Us/index.html"
};

function homeAboutSetStatus(message, type) {
  const s = $("home-about-status");
  if (!s) return;
  s.textContent = message;
  s.className = "status" + (type ? " " + type : "");
}

function homeAboutPreviewSrc(url) {
  return /^([a-z][a-z0-9+.-]*:|\/)/i.test(url) ? url : "../" + url;
}

function homeAboutPopulate(content) {
  const c = Object.assign({}, HOME_ABOUT_DEFAULTS, content && typeof content === "object" ? content : {});
  $("home-about-heading").value = c.heading || "";
  $("home-about-intro").value = c.intro || "";
  $("home-about-body").value = c.body || "";
  $("home-about-image-url").value = c.image || "";
  $("home-about-button-text").value = c.button_text || "";
  $("home-about-button-url").value = c.button_url || "";
  const preview = $("home-about-image-preview");
  preview.style.opacity = "1";
  preview.src = homeAboutPreviewSrc(c.image || HOME_ABOUT_DEFAULTS.image);
  preview.onerror = () => {
    preview.onerror = null;
    preview.style.opacity = ".35";
  };
}

function homeAboutCollect() {
  return {
    heading: $("home-about-heading").value.trim(),
    intro: $("home-about-intro").value.trim(),
    body: $("home-about-body").value.trim(),
    image: $("home-about-image-url").value.trim(),
    button_text: $("home-about-button-text").value.trim(),
    button_url: $("home-about-button-url").value.trim()
  };
}

async function homeAboutLoad() {
  const { data, error } = await sb
    .from("home_about_settings")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    homeAboutSetStatus("Could not read About section: " + error.message, "error");
    toast("Could not read the Home About section. Run the home-about SQL first.", "error");
    return;
  }

  homeAboutPopulate(data && data.content ? data.content : HOME_ABOUT_DEFAULTS);
}

async function homeAboutSave() {
  const button = $("home-about-save");
  const content = homeAboutCollect();
  button.disabled = true;
  homeAboutSetStatus("Saving…");

  const { error } = await sb
    .from("home_about_settings")
    .upsert({ id: 1, content, updated_at: new Date().toISOString() });

  button.disabled = false;

  if (error) {
    homeAboutSetStatus("Could not save: " + error.message, "error");
    toast("Could not save the Home About section. Check the Supabase table and policies.", "error");
    return;
  }

  try {
    localStorage.setItem(HOME_ABOUT_CACHE_KEY, JSON.stringify(content));
  } catch (err) {
    /* ignore */
  }

  homeAboutSetStatus("Saved. The About section on the home page is updated.", "ok");
  toast("Home About section saved to Supabase.");
}

async function homeAboutUploadImage(event) {
  const input = event.target;
  const file = input.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast("Please choose an image file.", "error");
    input.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast("The image is larger than 5 MB.", "error");
    input.value = "";
    return;
  }

  const ext = (file.name.split(".").pop() || "webp")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") || "webp";
  const path = "home-about/home-about-" + Date.now() + "." + ext;

  homeAboutSetStatus("Uploading…");
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

  input.value = "";

  if (error) {
    homeAboutSetStatus("Upload failed: " + error.message, "error");
    toast("Upload failed: " + error.message, "error");
    return;
  }

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  $("home-about-image-url").value = data.publicUrl;
  $("home-about-image-preview").style.opacity = "1";
  $("home-about-image-preview").src = data.publicUrl;
  homeAboutSetStatus("Image uploaded. Click Save to publish it.");
}

$("home-about-image-url").addEventListener("input", () => {
  const preview = $("home-about-image-preview");
  preview.style.opacity = "1";
  preview.src = homeAboutPreviewSrc($("home-about-image-url").value.trim());
});
$("home-about-image-file").addEventListener("change", homeAboutUploadImage);
$("home-about-save").addEventListener("click", homeAboutSave);
$("home-about-reset").addEventListener("click", () => {
  homeAboutPopulate(HOME_ABOUT_DEFAULTS);
  homeAboutSetStatus("Form reset to the default About section. Click Save to publish it.");
});

homeAboutPopulate(HOME_ABOUT_DEFAULTS);
let homeAboutLoaded = false;
function homeAboutLoadOnce() {
  if (homeAboutLoaded) return;
  homeAboutLoaded = true;
  homeAboutLoad();
}

const previousEnterPanelForAbout = enterPanel;
enterPanel = async function () {
  await previousEnterPanelForAbout();
  homeAboutLoadOnce();
};
if (sessionStorage.getItem(SESSION_KEY) === "1") homeAboutLoadOnce();


/* ===== Home Mission & Vision section editor ===== */
const HOME_MISSION_CACHE_KEY = "goalguide:home-mission:v1";

const HOME_MISSION_DEFAULTS = {
  heading: "WAIS BD Mission & Vision",
  intro: "WAIS BD is a trusted German language institute in Dhaka, offering A1-B2 courses since 2013 with a focus on Goethe exam preparation and practical communication skills.",
  body: "WAIS BD - German Language School Dhaka has been providing structured German language education since 2013. We specialize in CEFR-aligned courses from A1 to B2, designed to prepare students for Goethe-Zertifikat examinations and real-world communication. Our experienced instructors focus on grammar accuracy, practical conversation, and exam-oriented training. With small batch sizes and personalized guidance, we help students confidently achieve their academic, professional, and migration goals in German-speaking countries.",
  image: "Images/home-mission.webp"
};

function homeMissionSetStatus(message, type) {
  const s = $("home-mission-status");
  if (!s) return;
  s.textContent = message;
  s.className = "status" + (type ? " " + type : "");
}

function homeMissionPreviewSrc(url) {
  return /^([a-z][a-z0-9+.-]*:|\/)/i.test(url) ? url : "../" + url;
}

function homeMissionPopulate(content) {
  const c = Object.assign({}, HOME_MISSION_DEFAULTS, content && typeof content === "object" ? content : {});
  $("home-mission-heading").value = c.heading || "";
  $("home-mission-intro").value = c.intro || "";
  $("home-mission-body").value = c.body || "";
  $("home-mission-image-url").value = c.image || "";
  const preview = $("home-mission-image-preview");
  preview.style.opacity = "1";
  preview.src = homeMissionPreviewSrc(c.image || HOME_MISSION_DEFAULTS.image);
  preview.onerror = () => {
    preview.onerror = null;
    preview.style.opacity = ".35";
  };
}

function homeMissionCollect() {
  return {
    heading: $("home-mission-heading").value.trim(),
    intro: $("home-mission-intro").value.trim(),
    body: $("home-mission-body").value.trim(),
    image: $("home-mission-image-url").value.trim()
  };
}

async function homeMissionLoad() {
  const { data, error } = await sb
    .from("home_mission_settings")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    homeMissionSetStatus("Could not read Mission & Vision section: " + error.message, "error");
    toast("Could not read the Mission & Vision section. Run the new SQL first.", "error");
    return;
  }

  homeMissionPopulate(data && data.content ? data.content : HOME_MISSION_DEFAULTS);
}

async function homeMissionSave() {
  const button = $("home-mission-save");
  const content = homeMissionCollect();
  button.disabled = true;
  homeMissionSetStatus("Saving…");

  const { error } = await sb
    .from("home_mission_settings")
    .upsert({ id: 1, content, updated_at: new Date().toISOString() });

  button.disabled = false;

  if (error) {
    homeMissionSetStatus("Could not save: " + error.message, "error");
    toast("Could not save the Mission & Vision section. Check the Supabase table and policies.", "error");
    return;
  }

  try {
    localStorage.setItem(HOME_MISSION_CACHE_KEY, JSON.stringify(content));
  } catch (err) {
    /* ignore */
  }

  homeMissionSetStatus("Saved. The Mission & Vision section is updated.", "ok");
  toast("Mission & Vision section saved to Supabase.");
}

async function homeMissionUploadImage(event) {
  const input = event.target;
  const file = input.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast("Please choose an image file.", "error");
    input.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast("The image is larger than 5 MB.", "error");
    input.value = "";
    return;
  }

  const ext = (file.name.split(".").pop() || "webp")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") || "webp";
  const path = "home-mission/home-mission-" + Date.now() + "." + ext;

  homeMissionSetStatus("Uploading…");
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

  input.value = "";

  if (error) {
    homeMissionSetStatus("Upload failed: " + error.message, "error");
    toast("Upload failed: " + error.message, "error");
    return;
  }

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  $("home-mission-image-url").value = data.publicUrl;
  $("home-mission-image-preview").style.opacity = "1";
  $("home-mission-image-preview").src = data.publicUrl;
  homeMissionSetStatus("Image uploaded. Click Save to publish.");
}

$("home-mission-image-url").addEventListener("input", () => {
  const preview = $("home-mission-image-preview");
  preview.style.opacity = "1";
  preview.src = homeMissionPreviewSrc($("home-mission-image-url").value.trim());
});
$("home-mission-image-file").addEventListener("change", homeMissionUploadImage);
$("home-mission-save").addEventListener("click", homeMissionSave);
$("home-mission-reset").addEventListener("click", () => {
  homeMissionPopulate(HOME_MISSION_DEFAULTS);
  homeMissionSetStatus("Form reset to the default Mission & Vision section. Click Save to publish it.");
});

homeMissionPopulate(HOME_MISSION_DEFAULTS);
let homeMissionLoaded = false;
function homeMissionLoadOnce() {
  if (homeMissionLoaded) return;
  homeMissionLoaded = true;
  homeMissionLoad();
}

const previousEnterPanelForMission = enterPanel;
enterPanel = async function () {
  await previousEnterPanelForMission();
  homeMissionLoadOnce();
};
if (sessionStorage.getItem(SESSION_KEY) === "1") homeMissionLoadOnce();


/* ===== Home German Journey background card editor ===== */
const HOME_JOURNEY_CACHE_KEY = "goalguide:home-journey:v1";
const HOME_JOURNEY_DEFAULTS = {
  heading: "Start Your German Language Journey Today",
  button_text: "Registration Now",
  button_url: "Admission/index.html",
  number: "3500",
  stat_text: "Over 3k students have successfully learned German."
};

function homeJourneySetStatus(message, type) {
  const s = $("home-journey-status");
  if (!s) return;
  s.textContent = message;
  s.className = "status" + (type ? " " + type : "");
}

function homeJourneyPopulate(content) {
  const c = Object.assign({}, HOME_JOURNEY_DEFAULTS, content && typeof content === "object" ? content : {});
  $("home-journey-heading").value = c.heading || "";
  $("home-journey-button-text").value = c.button_text || "";
  $("home-journey-button-url").value = c.button_url || "";
  $("home-journey-number").value = c.number || "";
  $("home-journey-stat-text").value = c.stat_text || "";
}

function homeJourneyCollect() {
  return {
    heading: $("home-journey-heading").value.trim(),
    button_text: $("home-journey-button-text").value.trim(),
    button_url: $("home-journey-button-url").value.trim(),
    number: $("home-journey-number").value.trim(),
    stat_text: $("home-journey-stat-text").value.trim()
  };
}

async function homeJourneyLoad() {
  const { data, error } = await sb
    .from("home_journey_settings")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    homeJourneySetStatus("Could not read German Journey section: " + error.message, "error");
    toast("Could not read the German Journey section. Run the new SQL first.", "error");
    return;
  }

  homeJourneyPopulate(data && data.content ? data.content : HOME_JOURNEY_DEFAULTS);
}

async function homeJourneySave() {
  const button = $("home-journey-save");
  const content = homeJourneyCollect();
  button.disabled = true;
  homeJourneySetStatus("Saving…");

  const { error } = await sb
    .from("home_journey_settings")
    .upsert({ id: 1, content, updated_at: new Date().toISOString() });

  button.disabled = false;

  if (error) {
    homeJourneySetStatus("Could not save: " + error.message, "error");
    toast("Could not save the German Journey section. Check the Supabase table and policies.", "error");
    return;
  }

  try {
    localStorage.setItem(HOME_JOURNEY_CACHE_KEY, JSON.stringify(content));
  } catch (err) {
    /* ignore */
  }

  homeJourneySetStatus("Saved. The German Journey section is updated.", "ok");
  toast("German Journey section saved to Supabase.");
}

$("home-journey-save").addEventListener("click", homeJourneySave);
$("home-journey-reset").addEventListener("click", () => {
  homeJourneyPopulate(HOME_JOURNEY_DEFAULTS);
  homeJourneySetStatus("Form reset to the default German Journey section. Click Save to publish it.");
});

homeJourneyPopulate(HOME_JOURNEY_DEFAULTS);
let homeJourneyLoaded = false;
function homeJourneyLoadOnce() {
  if (homeJourneyLoaded) return;
  homeJourneyLoaded = true;
  homeJourneyLoad();
}

const previousEnterPanelForJourney = enterPanel;
enterPanel = async function () {
  await previousEnterPanelForJourney();
  homeJourneyLoadOnce();
};
if (sessionStorage.getItem(SESSION_KEY) === "1") homeJourneyLoadOnce();


/* ===== Home Why Choose Us editor ===== */
const HOME_WHY_CACHE_KEY = "goalguide:home-why:v1";
const HOME_WHY_DEFAULTS = {
  heading: "Why Choose Us",
  subtitle: "Learn German with Confidence, Quality and Proven Success",
  cards: [
    { title: "Expert Guidance & Quality Education", text: "Learn from experienced instructors using a CEFR-aligned curriculum designed to build strong German language skills and prepare you for Goethe-Zertifikat exams." },
    { title: "Proven Success Since 2013", text: "With over 3,000 students trained, WAIS has a strong track record of helping learners achieve academic, professional, and migration goals." },
    { title: "Personalized Learning Experience", text: "Small batch sizes, structured lessons, and individual attention ensure faster progress and confident communication at every level from A1 to B2." }
  ]
};

function homeWhySetStatus(message, type) {
  const s = $("home-why-status");
  s.textContent = message;
  s.className = "status" + (type ? " " + type : "");
}

function homeWhyPopulate(content) {
  const c = content && typeof content === "object" ? content : HOME_WHY_DEFAULTS;
  const cards = Array.isArray(c.cards) ? c.cards : [];
  $("home-why-heading").value = c.heading || "";
  $("home-why-subtitle").value = c.subtitle || "";
  [0, 1, 2].forEach((i) => {
    const card = Object.assign({}, HOME_WHY_DEFAULTS.cards[i], cards[i] || {});
    $("home-why-title-" + (i + 1)).value = card.title || "";
    $("home-why-text-" + (i + 1)).value = card.text || "";
  });
}

function homeWhyCollect() {
  return {
    heading: $("home-why-heading").value.trim(),
    subtitle: $("home-why-subtitle").value.trim(),
    cards: [1, 2, 3].map((i) => ({
      title: $("home-why-title-" + i).value.trim(),
      text: $("home-why-text-" + i).value.trim()
    }))
  };
}

async function homeWhyLoad() {
  const { data, error } = await sb
    .from("home_why_choose_settings")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    homeWhySetStatus("Could not read Why Choose Us settings: " + error.message, "error");
    toast("Could not read Why Choose Us settings. Run the new SQL first.", "error");
    return;
  }

  homeWhyPopulate(data && data.content ? data.content : HOME_WHY_DEFAULTS);
}

async function homeWhySave() {
  const button = $("home-why-save");
  const content = homeWhyCollect();
  button.disabled = true;
  homeWhySetStatus("Saving…");

  const { error } = await sb
    .from("home_why_choose_settings")
    .upsert({ id: 1, content, updated_at: new Date().toISOString() });

  button.disabled = false;

  if (error) {
    homeWhySetStatus("Could not save: " + error.message, "error");
    toast("Could not save Why Choose Us content. Check the Supabase table and policies.", "error");
    return;
  }

  try { localStorage.setItem(HOME_WHY_CACHE_KEY, JSON.stringify(content)); }
  catch (err) { /* ignore */ }

  homeWhySetStatus("Saved. The Why Choose Us section is updated.", "ok");
  toast("Why Choose Us section saved to Supabase.");
}

$("home-why-save").addEventListener("click", homeWhySave);
$("home-why-reset").addEventListener("click", () => {
  homeWhyPopulate(HOME_WHY_DEFAULTS);
  homeWhySetStatus("Form reset to the default Why Choose Us section. Click Save to publish it.");
});

homeWhyPopulate(HOME_WHY_DEFAULTS);
let homeWhyLoaded = false;
function homeWhyLoadOnce() {
  if (homeWhyLoaded) return;
  homeWhyLoaded = true;
  homeWhyLoad();
}

const previousEnterPanelForWhyChoose = enterPanel;
enterPanel = async function () {
  await previousEnterPanelForWhyChoose();
  homeWhyLoadOnce();
};
if (sessionStorage.getItem(SESSION_KEY) === "1") homeWhyLoadOnce();


/* ===== Unified Home section actions ===== */
function homeSetGlobalStatus(message, type) {
  const status = $("home-save-status");
  status.textContent = message;
  status.className = "status home-save-status" + (type ? " " + type : "");
}

document.querySelectorAll("#section-home .save-bar").forEach((bar) => { bar.hidden = true; });

const HOME_SETTINGS_EDITORS = [
  { name: "Hero", table: "hero_settings", cache: HERO_CACHE_KEY, collect: heroCollect, status: heroSetStatus },
  { name: "Course cards", table: "home_german_courses_settings", cache: HOME_GERMAN_CACHE_KEY, collect: homeGermanCollect, status: homeGermanSetStatus },
  { name: "About", table: "home_about_settings", cache: HOME_ABOUT_CACHE_KEY, collect: homeAboutCollect, status: homeAboutSetStatus },
  { name: "Mission & Vision", table: "home_mission_settings", cache: HOME_MISSION_CACHE_KEY, collect: homeMissionCollect, status: homeMissionSetStatus },
  { name: "German Journey", table: "home_journey_settings", cache: HOME_JOURNEY_CACHE_KEY, collect: homeJourneyCollect, status: homeJourneySetStatus },
  { name: "Why Choose Us", table: "home_why_choose_settings", cache: HOME_WHY_CACHE_KEY, collect: homeWhyCollect, status: homeWhySetStatus }
];

async function homeSaveAll() {
  const button = $("home-save-all");
  button.disabled = true;
  homeSetGlobalStatus("Saving all Home sections…");
  HOME_SETTINGS_EDITORS.forEach((editor) => editor.status("Saving…"));

  const results = await Promise.all(HOME_SETTINGS_EDITORS.map(async (editor) => {
    try {
      const content = editor.collect();
      const { error } = await sb.from(editor.table).upsert({ id: 1, content, updated_at: new Date().toISOString() });
      if (error) throw error;
      try { localStorage.setItem(editor.cache, JSON.stringify(content)); } catch (storageError) { /* cache is optional */ }
      editor.status("Saved with Home settings.", "ok");
      return { name: editor.name, error: null };
    } catch (error) {
      editor.status("Could not save: " + error.message, "error");
      return { name: editor.name, error };
    }
  }));

  button.disabled = false;
  const failures = results.filter((result) => result.error);
  if (failures.length) {
    const failureDetails = failures.map((result) => result.name + " (" + result.error.message + ")").join("; ");
    homeSetGlobalStatus("Some sections could not be saved: " + failureDetails, "error");
    toast("Some Home sections could not be saved. See the Home status message for details.", "error");
    return;
  }
  homeSetGlobalStatus("All Home sections saved successfully.", "ok");
  toast("All Home sections saved to Supabase.");
}

function homeRestoreDefaults() {
  heroPopulate(HERO_DEFAULTS);
  homeGermanRender(HOME_GERMAN_DEFAULTS);
  homeAboutPopulate(HOME_ABOUT_DEFAULTS);
  homeMissionPopulate(HOME_MISSION_DEFAULTS);
  homeJourneyPopulate(HOME_JOURNEY_DEFAULTS);
  homeWhyPopulate(HOME_WHY_DEFAULTS);
  $("home-about-image-file").value = "";
  $("home-mission-image-file").value = "";
  homeSetGlobalStatus("Default values restored in the form. Click Save all Home sections to publish them.");
}

$("home-save-all").addEventListener("click", homeSaveAll);
$("home-restore-defaults").addEventListener("click", homeRestoreDefaults);


/* ===== Shared Blog posts ===== */
let blogPosts = [];
let blogPostsLoaded = false;
const BLOG_POSTS_TABLE = "blog_posts";
const BLOG_PDF_BUCKET = "blog-pdfs";
const BLOG_PDF_MAX_SIZE = 25 * 1024 * 1024;

function blogStatus(message, type) {
  const status = $("blog-post-status");
  status.textContent = message;
  status.className = "status" + (type ? " " + type : "");
}

function blogRenderAdminList() {
  const list = $("blog-posts-admin-list");
  list.replaceChildren();
  if (!blogPosts.length) {
    const empty = document.createElement("p");
    empty.className = "hero-hint";
    empty.textContent = "No blog posts yet. Add the first one above.";
    list.appendChild(empty);
    return;
  }

  blogPosts.forEach((post) => {
    const row = document.createElement("article");
    row.className = "blog-admin-post";
    const image = document.createElement("img");
    image.src = blogAdminImageUrl(post.image_url);
    image.alt = "Blog post image preview";
    image.loading = "lazy";
    const description = document.createElement("p");
    description.textContent = post.description;
    const pdf = document.createElement("a");
    pdf.className = "blog-admin-pdf-link";
    pdf.textContent = post.pdf_url ? "Download attached PDF" : "No PDF attached";
    if (post.pdf_url) {
      pdf.href = blogDownloadUrl(post.pdf_url, post.description);
      pdf.target = "_blank";
      pdf.rel = "noopener noreferrer";
    }
    const actions = document.createElement("div");
    actions.className = "blog-admin-post-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "btn btn-ghost";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => blogEditPost(post));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-danger";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => blogDeletePost(post));
    actions.append(edit, remove);
    row.append(image, description, pdf, actions);
    list.appendChild(row);
  });
}

function blogAdminImageUrl(value) {
  const url = String(value || "").trim();
  if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  return "../" + url.replace(/^\.\//, "");
}

function blogDownloadUrl(value, filename) {
  try {
    const url = new URL(value, location.href);
    url.searchParams.set("download", blogSafeFilename(filename) + ".pdf");
    return url.href;
  } catch (error) {
    return value;
  }
}

function blogSafeFilename(value) {
  return String(value || "blog-download")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "blog-download";
}

function blogPdfStoragePath(value) {
  try {
    const url = new URL(value);
    const marker = "/storage/v1/object/public/" + BLOG_PDF_BUCKET + "/";
    const index = url.pathname.indexOf(marker);
    return index < 0 ? null : decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch (error) {
    return null;
  }
}

async function blogRemovePdf(value) {
  const path = blogPdfStoragePath(value);
  if (!path) return null;
  const { error } = await sb.storage.from(BLOG_PDF_BUCKET).remove([path]);
  return error || null;
}

async function blogUploadPdf(file) {
  if (!file) return null;
  if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
    throw new Error("Choose a PDF file.");
  }
  const signature = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
  if (signature !== "%PDF-") {
    throw new Error("The selected file does not contain a valid PDF document.");
  }
  if (file.size > BLOG_PDF_MAX_SIZE) {
    throw new Error("The PDF must be 25 MB or smaller.");
  }
  const safeName = blogSafeFilename(file.name.replace(/\.pdf$/i, "")) + ".pdf";
  const uniqueId = window.crypto && typeof window.crypto.randomUUID === "function"
    ? window.crypto.randomUUID()
    : Date.now() + "-" + Math.random().toString(36).slice(2);
  const path = "blog-posts/" + uniqueId + "-" + safeName;
  const { error } = await sb.storage.from(BLOG_PDF_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: "application/pdf"
  });
  if (error) throw new Error("PDF upload failed: " + error.message);
  const { data } = sb.storage.from(BLOG_PDF_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function blogResetForm() {
  $("blog-post-form").reset();
  $("blog-post-id").value = "";
  const currentPdf = $("blog-post-current-pdf");
  currentPdf.replaceChildren();
  currentPdf.hidden = true;
  $("blog-editor-heading").textContent = "Add a blog post";
  $("blog-post-save").textContent = "Add blog post";
  $("blog-post-cancel").hidden = true;
}

function blogEditPost(post) {
  $("blog-post-id").value = post.id;
  $("blog-post-image").value = post.image_url;
  $("blog-post-description").value = post.description;
  const currentPdf = $("blog-post-current-pdf");
  currentPdf.replaceChildren();
  if (post.pdf_url) {
    const link = document.createElement("a");
    link.href = blogDownloadUrl(post.pdf_url, post.description);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Download current PDF";
    currentPdf.append("Current PDF: ", link);
    currentPdf.hidden = false;
  } else {
    currentPdf.hidden = true;
  }
  $("blog-editor-heading").textContent = "Edit blog post";
  $("blog-post-save").textContent = "Save changes";
  $("blog-post-cancel").hidden = false;
  $("blog-post-image").focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function blogLoadPosts() {
  const list = $("blog-posts-admin-list");
  list.textContent = "Loading blog posts…";
  const { data, error } = await sb
    .from(BLOG_POSTS_TABLE)
    .select("id,image_url,pdf_url,description,sort_order,created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    blogPostsLoaded = false;
    blogStatus("Could not load posts: " + error.message, "error");
    list.textContent = "Check that the Supabase Blog setup SQL has been run.";
    return;
  }
  blogPosts = data || [];
  blogRenderAdminList();
  blogStatus(blogPosts.length + " published post" + (blogPosts.length === 1 ? "" : "s") + ".", "ok");
}

function blogLoadOnce() {
  if (blogPostsLoaded) return;
  blogPostsLoaded = true;
  blogLoadPosts();
}

$("blog-post-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const imageUrl = $("blog-post-image").value.trim();
  const description = $("blog-post-description").value.trim();
  const postId = $("blog-post-id").value;
  const pdfFile = $("blog-post-pdf").files[0] || null;
  const existingPost = postId ? blogPosts.find((post) => post.id === postId) : null;
  if (!imageUrl || !description) {
    blogStatus("Add both an image link and a description.", "error");
    return;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(imageUrl) && !/^https?:\/\//i.test(imageUrl)) {
    blogStatus("Enter a valid image URL or a path such as Images/blog-post.webp.", "error");
    return;
  }
  if (!pdfFile && !(existingPost && existingPost.pdf_url)) {
    blogStatus("Attach a PDF file before publishing this post.", "error");
    return;
  }
  const button = $("blog-post-save");
  button.disabled = true;
  blogStatus(pdfFile ? "Uploading PDF and saving post…" : postId ? "Saving changes…" : "Publishing post…");
  let uploadedPdfUrl = null;
  let result;
  try {
    if (pdfFile) uploadedPdfUrl = await blogUploadPdf(pdfFile);
  } catch (error) {
    button.disabled = false;
    blogStatus(error.message, "error");
    return;
  }
  const postValues = {
    image_url: imageUrl,
    description,
    ...(uploadedPdfUrl ? { pdf_url: uploadedPdfUrl } : {}),
    updated_at: new Date().toISOString()
  };
  if (postId) {
    result = await sb.from(BLOG_POSTS_TABLE).update(postValues).eq("id", postId);
  } else {
    const nextOrder = blogPosts.reduce((max, post) => Math.max(max, Number(post.sort_order) || 0), -1) + 1;
    result = await sb.from(BLOG_POSTS_TABLE).insert({
      ...postValues,
      sort_order: nextOrder
    });
  }
  button.disabled = false;
  if (result.error) {
    if (uploadedPdfUrl) await blogRemovePdf(uploadedPdfUrl);
    blogStatus("Could not save post: " + result.error.message, "error");
    return;
  }
  if (uploadedPdfUrl && existingPost && existingPost.pdf_url) {
    const cleanupError = await blogRemovePdf(existingPost.pdf_url);
    if (cleanupError) console.warn("The previous blog PDF could not be removed from Storage.", cleanupError);
  }
  blogResetForm();
  await blogLoadPosts();
  blogStatus("Blog post saved. It will appear across the site.", "ok");
  toast("Blog post saved.");
});

$("blog-post-cancel").addEventListener("click", blogResetForm);

async function blogDeletePost(post) {
  if (!window.confirm("Delete this blog post from the site?")) return;
  const { error } = await sb.from(BLOG_POSTS_TABLE).delete().eq("id", post.id);
  if (error) {
    blogStatus("Could not delete post: " + error.message, "error");
    return;
  }
  if (post.pdf_url) {
    const cleanupError = await blogRemovePdf(post.pdf_url);
    if (cleanupError) console.warn("The deleted blog PDF could not be removed from Storage.", cleanupError);
  }
  blogPosts = blogPosts.filter((item) => item.id !== post.id);
  blogRenderAdminList();
  blogStatus("Blog post deleted.", "ok");
  toast("Blog post deleted.");
}

tabs.forEach((tab) => {
  if (tab.dataset.target === "blog") tab.addEventListener("click", blogLoadOnce);
});
const previousEnterPanelForBlog = enterPanel;
enterPanel = async function () {
  await previousEnterPanelForBlog();
  if (location.hash === "#blog") blogLoadOnce();
};
if (sessionStorage.getItem(SESSION_KEY) === "1" && location.hash === "#blog") blogLoadOnce();

/* ===== Class Schedule editor =====
   Saves both batch tables to the Supabase table class_schedule_settings
   (run supabase-class-schedule.sql once to create it). The column
   headings (Session / Time / Days) are fixed on the page and are not
   editable here — both row lists can be changed independently. */
const CS_CACHE_KEY = "goalguide:class-schedule:v1";

const CS_DEFAULTS = {
  weekday_heading: "Saturday to Thursday Batch",
  weekday_rows: [
    { session: "Morning", time: "9:00 am", days: "Sat, Mon, Wed or Sun, Tue, Thu" },
    { session: "Forenoon", time: "11:00 am", days: "Sat, Mon, Wed or Sun, Tue, Thu" },
    { session: "Afternoon", time: "3:30 pm", days: "Sat, Mon, Wed or Sun, Tue, Thu" },
    { session: "Evening", time: "7:00 pm", days: "Sat, Mon, Wed or Sun, Tue, Thu" },
    { session: "Night (online)", time: "9:00 pm", days: "Sat, Mon, Wed or Sun, Tue, Thu" }
  ],
  weekend_heading: "Weekend Batch",
  weekend_rows: [
    { session: "Afternoon", time: "3:30 pm", days: "Friday & Saturday" },
    { session: "Evening", time: "6:45 pm", days: "Friday & Saturday" }
  ]
};

function csSetStatus(message, type) {
  const s = $("cs-status");
  s.textContent = message;
  s.className = "status" + (type ? " " + type : "");
}

function csRenderRows(containerId, prefix, rows) {
  const wrap = $(containerId);
  wrap.innerHTML = "";

  rows.forEach((data, index) => {
    const row = document.createElement("div");
    row.className = "cs-row-card";
    row.innerHTML = `
      <div class="cs-row-heading">
        <h3>Row ${index + 1}</h3>
        <button class="btn btn-danger cs-remove-row" type="button" data-cs-prefix="${prefix}" data-cs-index="${index}" aria-label="Remove ${prefix === "cs-weekday" ? "weekday" : "weekend"} row ${index + 1}">Remove row</button>
      </div>
      <div class="cs-row-fields">
        <label class="field">
          <span>Session</span>
          <input type="text" data-cs-field="session">
        </label>
        <label class="field">
          <span>Time</span>
          <input type="text" data-cs-field="time">
        </label>
        <label class="field">
          <span>Days</span>
          <input type="text" data-cs-field="days">
        </label>
      </div>
    `;
    wrap.appendChild(row);
    row.querySelector('[data-cs-field="session"]').value = data.session || "";
    row.querySelector('[data-cs-field="time"]').value = data.time || "";
    row.querySelector('[data-cs-field="days"]').value = data.days || "";
  });
}

function csCollectRows(prefix) {
  return Array.from($(prefix + "-rows").querySelectorAll(".cs-row-card"), (row) => ({
    session: row.querySelector('[data-cs-field="session"]').value.trim(),
    time: row.querySelector('[data-cs-field="time"]').value.trim(),
    days: row.querySelector('[data-cs-field="days"]').value.trim()
  }));
}

function csChangeRows(prefix, change) {
  const rows = csCollectRows(prefix);
  change(rows);
  csRenderRows(prefix + "-rows", prefix, rows);
  csSetStatus("Row changes are not saved yet. Click Save to publish them.");
}

function csPopulate(content) {
  const c = Object.assign({}, CS_DEFAULTS, content && typeof content === "object" ? content : {});
  const weekdayRows = Array.isArray(c.weekday_rows) ? c.weekday_rows : CS_DEFAULTS.weekday_rows;
  const weekendRows = Array.isArray(c.weekend_rows) ? c.weekend_rows : CS_DEFAULTS.weekend_rows;

  $("cs-weekday-heading").value = c.weekday_heading || "";
  $("cs-weekend-heading").value = c.weekend_heading || "";

  csRenderRows("cs-weekday-rows", "cs-weekday", weekdayRows);
  csRenderRows("cs-weekend-rows", "cs-weekend", weekendRows);
}

function csCollect() {
  return {
    weekday_heading: $("cs-weekday-heading").value.trim(),
    weekday_rows: csCollectRows("cs-weekday"),
    weekend_heading: $("cs-weekend-heading").value.trim(),
    weekend_rows: csCollectRows("cs-weekend")
  };
}

async function csLoad() {
  const { data, error } = await sb
    .from("class_schedule_settings")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    csSetStatus("Could not read Class Schedule settings: " + error.message, "error");
    toast("Could not read Class Schedule settings. Run supabase-class-schedule.sql first.", "error");
    csPopulate(CS_DEFAULTS);
    return;
  }

  csPopulate(data && data.content ? data.content : CS_DEFAULTS);
}

async function csSave() {
  const buttons = [$("cs-save"), $("cs-save-bottom")];
  const content = csCollect();
  const hasIncompleteRow = [...content.weekday_rows, ...content.weekend_rows]
    .some((row) => !row.session || !row.time || !row.days);
  if (hasIncompleteRow) {
    csSetStatus("Complete every row or remove it before saving.", "error");
    return;
  }
  buttons.forEach((b) => { if (b) b.disabled = true; });
  csSetStatus("Saving…");

  const { error } = await sb
    .from("class_schedule_settings")
    .upsert({ id: 1, content, updated_at: new Date().toISOString() });

  buttons.forEach((b) => { if (b) b.disabled = false; });

  if (error) {
    csSetStatus("Could not save: " + error.message, "error");
    toast("Could not save Class Schedule content. Check the Supabase table and policies.", "error");
    return;
  }

  try {
    localStorage.setItem(CS_CACHE_KEY, JSON.stringify(content));
  } catch (err) {
    /* ignore */
  }

  csSetStatus("Saved. The Class Schedule page is updated.", "ok");
  toast("Class Schedule saved to Supabase.");
}

$("cs-save").addEventListener("click", csSave);
$("cs-save-bottom").addEventListener("click", csSave);
$("cs-weekday-add-row").addEventListener("click", () => {
  csChangeRows("cs-weekday", (rows) => rows.push({ session: "", time: "", days: "" }));
});
$("cs-weekend-add-row").addEventListener("click", () => {
  csChangeRows("cs-weekend", (rows) => rows.push({ session: "", time: "", days: "" }));
});
$("cs-weekday-rows").addEventListener("click", (event) => {
  const button = event.target.closest(".cs-remove-row");
  if (!button) return;
  const index = Number(button.dataset.csIndex);
  csChangeRows("cs-weekday", (rows) => rows.splice(index, 1));
});
$("cs-weekend-rows").addEventListener("click", (event) => {
  const button = event.target.closest(".cs-remove-row");
  if (!button) return;
  const index = Number(button.dataset.csIndex);
  csChangeRows("cs-weekend", (rows) => rows.splice(index, 1));
});
[$("cs-reset"), $("cs-reset-bottom")].forEach((btn) => {
  btn.addEventListener("click", () => {
    csPopulate(CS_DEFAULTS);
    csSetStatus("Form reset to the default Class Schedule content. Click Save to publish it.");
  });
});

csPopulate(CS_DEFAULTS);
let csLoaded = false;
function csLoadOnce() {
  if (csLoaded) return;
  csLoaded = true;
  csLoad();
}

const previousEnterPanelForClassSchedule = enterPanel;
enterPanel = async function () {
  await previousEnterPanelForClassSchedule();
  csLoadOnce();
};
if (sessionStorage.getItem(SESSION_KEY) === "1") csLoadOnce();

/* ===== Exam section editor =====
   Stores the public Exam page cards and notice in Supabase table exam_settings.
   Uses the same Supabase project as the existing admin panel. */
const EXAM_CACHE_KEY = "goalguide:exam:v1";
const EXAM_DEFAULTS = {
  cards: [
    { title: "Goethe Zertifikat A1", price: "14,200 BDT" },
    { title: "Goethe Zertifikat A2", price: "15,500 BDT" },
    { title: "Goethe Zertifikat B1", price: "18,800 BDT" },
    { title: "Goethe Zertifikat B2", price: "18,800 BDT" }
  ],
  notice: "The Exam Will Take Place at Goethe-Institut Bangladesh."
};

function examSetStatus(message, type) {
  const el = $("exam-status");
  if (!el) return;
  el.textContent = message;
  el.className = "status" + (type ? " " + type : "");
}

function examMerge(content) {
  const data = content && typeof content === "object" ? content : {};
  const cards = Array.isArray(data.cards) ? data.cards : [];
  return {
    cards: EXAM_DEFAULTS.cards.map((fallback, index) => ({
      ...fallback,
      ...(cards[index] && typeof cards[index] === "object" ? cards[index] : {})
    })),
    notice: typeof data.notice === "string" ? data.notice : EXAM_DEFAULTS.notice
  };
}

function examPopulate(content) {
  const c = examMerge(content);
  c.cards.forEach((card, index) => {
    const n = index + 1;
    $("exam-title-" + n).value = card.title || "";
    $("exam-price-" + n).value = card.price || "";
  });
  $("exam-notice").value = c.notice || "";
}

function examCollect() {
  return {
    cards: [1, 2, 3, 4].map((n) => ({
      title: $("exam-title-" + n).value.trim(),
      price: $("exam-price-" + n).value.trim()
    })),
    notice: $("exam-notice").value.trim()
  };
}

async function examLoad() {
  const { data, error } = await sb
    .from("exam_settings")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    examPopulate(EXAM_DEFAULTS);
    examSetStatus("Could not read Exam settings: " + error.message, "error");
    return;
  }

  const content = examMerge(data && data.content);
  examPopulate(content);
  try { localStorage.setItem(EXAM_CACHE_KEY, JSON.stringify(content)); } catch (err) { /* ignore */ }
}

async function examSave() {
  const buttons = [$("exam-save"), $("exam-save-top")];
  const content = examCollect();
  buttons.forEach((button) => { if (button) button.disabled = true; });
  examSetStatus("Saving…");

  const { error } = await sb
    .from("exam_settings")
    .upsert({ id: 1, content, updated_at: new Date().toISOString() });

  buttons.forEach((button) => { if (button) button.disabled = false; });

  if (error) {
    examSetStatus("Could not save: " + error.message, "error");
    toast("Could not save Exam settings. Run the Exam SQL in Supabase and check the policies.", "error");
    return;
  }

  try { localStorage.setItem(EXAM_CACHE_KEY, JSON.stringify(content)); } catch (err) { /* ignore */ }
  examSetStatus("Saved. The Exam page is updated.", "ok");
  toast("Exam settings saved to Supabase.");
}

function examReset() {
  examPopulate(EXAM_DEFAULTS);
  examSetStatus("Form reset to the default Exam content. Click Save to publish it.");
}

if ($("exam-save")) $("exam-save").addEventListener("click", examSave);
if ($("exam-save-top")) $("exam-save-top").addEventListener("click", examSave);
if ($("exam-reset")) $("exam-reset").addEventListener("click", examReset);
if ($("exam-reset-bottom")) $("exam-reset-bottom").addEventListener("click", examReset);

examPopulate(EXAM_DEFAULTS);
let examLoaded = false;
function examLoadOnce() {
  if (examLoaded) return;
  examLoaded = true;
  examLoad();
}

/* Load when the existing admin panel is opened or when the Exam tab is selected. */
if (sessionStorage.getItem(SESSION_KEY) === "1") examLoadOnce();
tabs.forEach((tab) => {
  if (tab.dataset.target === "exam") tab.addEventListener("click", examLoadOnce);
});


/* ===== About Us Main Section editor =====
   Saves the About Us page's heading, three years, two paragraphs and
   three gallery photos to Supabase table about_us_settings.content —
   the same table and row the public About Us page (About_Us/script.js)
   already reads from. This is "Section 1 — About Us" in the admin panel. */
const ABOUT_MAIN_CACHE_KEY = "goalguide:about-us:v1"; // same key the public About Us page reads

const ABOUT_MAIN_DEFAULTS = {
  heading: "German Language School Dhaka",
  years: ["2013", "2020", "2026"],
  paragraph_1: "Would you like to learn German and want to sit for the certificate exam at Goethe-Institut? You can prepare yourself here properly. We are offering German Language intensive courses. We are also offering courses at affordable prices. So you can complete the courses at a minimum cost. We have experienced teachers as well. We always try to do the best for our students.",
  paragraph_2: "Our team of forward-thinkers, designers, and strategists is dedicated to solving complex problems through intuitive design and smart solutions. Whether it’s crafting user-centered interfaces, scaling platforms, or streamlining processes, we strive to push boundaries.",
  gallery: [
    "Images/about-gallery-1.webp",
    "Images/about-gallery-2.webp",
    "Images/about-gallery-3.webp"
  ]
};

function aboutMainSetStatus(message, type) {
  const s = $("about-main-status");
  if (!s) return;
  s.textContent = message;
  s.className = "status" + (type ? " " + type : "");
}

function aboutMainPreviewSrc(url) {
  return /^([a-z][a-z0-9+.-]*:|\/)/i.test(url) ? url : "../" + url;
}

function aboutMainMerge(content) {
  const data = content && typeof content === "object" ? content : {};
  const years = Array.isArray(data.years) ? data.years : ABOUT_MAIN_DEFAULTS.years;
  const gallery = Array.isArray(data.gallery) ? data.gallery : ABOUT_MAIN_DEFAULTS.gallery;
  return {
    heading: data.heading || ABOUT_MAIN_DEFAULTS.heading,
    years: [0, 1, 2].map((i) => years[i] || ABOUT_MAIN_DEFAULTS.years[i]),
    paragraph_1: data.paragraph_1 || ABOUT_MAIN_DEFAULTS.paragraph_1,
    paragraph_2: data.paragraph_2 || ABOUT_MAIN_DEFAULTS.paragraph_2,
    gallery: [0, 1, 2].map((i) => gallery[i] || ABOUT_MAIN_DEFAULTS.gallery[i])
  };
}

function aboutMainPopulate(content) {
  const c = aboutMainMerge(content);
  $("about-main-heading").value = c.heading || "";
  $("about-main-year-1").value = c.years[0] || "";
  $("about-main-year-2").value = c.years[1] || "";
  $("about-main-year-3").value = c.years[2] || "";
  $("about-main-paragraph-1").value = c.paragraph_1 || "";
  $("about-main-paragraph-2").value = c.paragraph_2 || "";

  [0, 1, 2].forEach((i) => {
    const n = i + 1;
    $("about-main-gallery-" + n + "-url").value = c.gallery[i] || "";
    const preview = $("about-main-gallery-" + n + "-preview");
    preview.style.opacity = "1";
    preview.src = aboutMainPreviewSrc(c.gallery[i] || ABOUT_MAIN_DEFAULTS.gallery[i]);
    preview.onerror = () => {
      preview.onerror = null;
      preview.style.opacity = ".35";
    };
  });
}

function aboutMainCollect() {
  return {
    heading: $("about-main-heading").value.trim(),
    years: [1, 2, 3].map((n) => $("about-main-year-" + n).value.trim()),
    paragraph_1: $("about-main-paragraph-1").value.trim(),
    paragraph_2: $("about-main-paragraph-2").value.trim(),
    gallery: [1, 2, 3].map((n) => $("about-main-gallery-" + n + "-url").value.trim())
  };
}

async function aboutMainLoad() {
  const { data, error } = await sb
    .from("about_us_settings")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    aboutMainSetStatus("Could not read the About Us Main Section: " + error.message, "error");
    toast("Could not read the About Us Main Section. Check the Supabase table and policies.", "error");
    return;
  }

  aboutMainPopulate(data && data.content ? data.content : ABOUT_MAIN_DEFAULTS);
}

async function aboutMainSave() {
  const button = $("about-main-save");
  const content = aboutMainCollect();
  button.disabled = true;
  aboutMainSetStatus("Saving…");

  const { error } = await sb
    .from("about_us_settings")
    .upsert({ id: 1, content, updated_at: new Date().toISOString() });

  button.disabled = false;

  if (error) {
    aboutMainSetStatus("Could not save: " + error.message, "error");
    toast("Could not save the About Us Main Section. Check the Supabase table and policies.", "error");
    return;
  }

  try {
    localStorage.setItem(ABOUT_MAIN_CACHE_KEY, JSON.stringify(content));
  } catch (err) {
    /* ignore */
  }

  aboutMainSetStatus("Saved. The About Us page is updated.", "ok");
  toast("About Us Main Section saved to Supabase.");
}

async function aboutMainUploadImage(index, event) {
  const input = event.target;
  const file = input.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast("Please choose an image file.", "error");
    input.value = "";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    toast("The image is larger than 5 MB.", "error");
    input.value = "";
    return;
  }

  const ext = (file.name.split(".").pop() || "webp")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") || "webp";
  const n = index + 1;
  const path = "about-us/gallery-" + n + "-" + Date.now() + "." + ext;

  aboutMainSetStatus("Uploading photo " + n + "…");

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

  input.value = "";

  if (error) {
    aboutMainSetStatus("");
    toast("Upload failed: " + error.message, "error");
    return;
  }

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  $("about-main-gallery-" + n + "-url").value = data.publicUrl;

  const preview = $("about-main-gallery-" + n + "-preview");
  preview.style.opacity = "1";
  preview.src = data.publicUrl;

  aboutMainSetStatus("Photo " + n + " uploaded. Click Save to publish.", "ok");
}

[0, 1, 2].forEach((i) => {
  const n = i + 1;
  $("about-main-gallery-" + n + "-url").addEventListener("input", () => {
    const preview = $("about-main-gallery-" + n + "-preview");
    preview.style.opacity = "1";
    preview.src = aboutMainPreviewSrc($("about-main-gallery-" + n + "-url").value.trim());
  });
  $("about-main-gallery-" + n + "-file").addEventListener("change", (event) =>
    aboutMainUploadImage(i, event)
  );
});

$("about-main-save").addEventListener("click", aboutMainSave);
$("about-main-reset").addEventListener("click", () => {
  aboutMainPopulate(ABOUT_MAIN_DEFAULTS);
  aboutMainSetStatus("Form reset to the default About Us Main Section. Click Save to publish it.");
});

aboutMainPopulate(ABOUT_MAIN_DEFAULTS);
let aboutMainLoaded = false;
function aboutMainLoadOnce() {
  if (aboutMainLoaded) return;
  aboutMainLoaded = true;
  aboutMainLoad();
}

const previousEnterPanelForAboutMain = enterPanel;
enterPanel = async function () {
  await previousEnterPanelForAboutMain();
  aboutMainLoadOnce();
};
if (sessionStorage.getItem(SESSION_KEY) === "1") aboutMainLoadOnce();

/* ===== Admission registration form dropdown editor ===== */
const ADMISSION_OPTIONS_CACHE_KEY = "goalguide:admission-form:v1";
const ADMISSION_OPTIONS_DEFAULTS = {
  courses: ["German A1", "German A2", "German B1", "German B2"],
  shifts: ["Morning", "Afternoon", "Evening"],
  learning_modes: ["Offline", "Online"],
  countries: ["Bangladesh", "India", "Nepal", "Pakistan", "Other"],
  reasons: ["Higher Education", "Work / Career", "Migration", "Family Reunion", "Goethe Exam Preparation", "Personal Interest"],
  payment_methods: ["bKash", "Nagad", "Bank Transfer", "Cash", "Other"]
};
const ADMISSION_OPTION_FIELDS = {
  courses: "admission-options-courses",
  shifts: "admission-options-shifts",
  learning_modes: "admission-options-learning-modes",
  countries: "admission-options-countries",
  reasons: "admission-options-reasons",
  payment_methods: "admission-options-payment-methods"
};

function admissionOptionsSetStatus(message, type) {
  const status = $("admission-options-status");
  status.textContent = message;
  status.className = "status" + (type ? " " + type : "");
}

function admissionOptionsNormalize(content) {
  const data = content && typeof content === "object" ? content : {};
  const result = {};
  Object.keys(ADMISSION_OPTION_FIELDS).forEach((key) => {
    const values = Array.isArray(data[key]) ? data[key] : ADMISSION_OPTIONS_DEFAULTS[key];
    result[key] = values.map((value) => String(value || "").trim()).filter(Boolean);
    if (!result[key].length) result[key] = ADMISSION_OPTIONS_DEFAULTS[key];
  });
  return result;
}

function admissionOptionsPopulate(content) {
  const options = admissionOptionsNormalize(content);
  Object.entries(ADMISSION_OPTION_FIELDS).forEach(([key, id]) => {
    $(id).value = options[key].join("\n");
  });
}

function admissionOptionsCollect() {
  const options = {};
  Object.entries(ADMISSION_OPTION_FIELDS).forEach(([key, id]) => {
    options[key] = $(id).value.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
  });
  return options;
}

async function admissionOptionsLoad() {
  const { data, error } = await sb
    .from("admission_form_settings")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    admissionOptionsSetStatus("Could not load dropdown choices: " + error.message, "error");
    toast("Could not load Admission form options. Run supabase_admission_form_setup.sql first.", "error");
    return;
  }

  const options = admissionOptionsNormalize(data && data.content);
  admissionOptionsPopulate(options);
  try { localStorage.setItem(ADMISSION_OPTIONS_CACHE_KEY, JSON.stringify(options)); } catch (err) {}
}

async function admissionOptionsSave() {
  const button = $("admission-options-save");
  const options = admissionOptionsCollect();
  const emptyGroup = Object.keys(options).find((key) => !options[key].length);
  if (emptyGroup) {
    admissionOptionsSetStatus("Each dropdown needs at least one option.", "error");
    return;
  }

  button.disabled = true;
  admissionOptionsSetStatus("Saving…");
  const { error } = await sb
    .from("admission_form_settings")
    .upsert({ id: 1, content: options, updated_at: new Date().toISOString() });
  button.disabled = false;

  if (error) {
    admissionOptionsSetStatus("Could not save: " + error.message, "error");
    toast("Could not save Admission dropdown options. Check the Supabase table and policies.", "error");
    return;
  }

  try { localStorage.setItem(ADMISSION_OPTIONS_CACHE_KEY, JSON.stringify(options)); } catch (err) {}
  admissionOptionsSetStatus("Saved. Reload the public Admission page to see the updated choices.", "ok");
  toast("Admission form dropdown options saved.");
}

$("admission-options-save").addEventListener("click", admissionOptionsSave);
$("admission-options-reset").addEventListener("click", () => {
  admissionOptionsPopulate(ADMISSION_OPTIONS_DEFAULTS);
  admissionOptionsSetStatus("Defaults restored in this form. Click Save options to publish them.");
});

admissionOptionsPopulate(ADMISSION_OPTIONS_DEFAULTS);
let admissionOptionsLoaded = false;
function admissionOptionsLoadOnce() {
  if (admissionOptionsLoaded) return;
  admissionOptionsLoaded = true;
  admissionOptionsLoad();
}

const previousEnterPanelForAdmissionOptions = enterPanel;
enterPanel = async function () {
  await previousEnterPanelForAdmissionOptions();
  admissionOptionsLoadOnce();
};
if (sessionStorage.getItem(SESSION_KEY) === "1") admissionOptionsLoadOnce();

/* ===== Admission contact section editor ===== */
const ADMISSION_CONTACT_CACHE_KEY = "goalguide:admission-contact:v1";
const ADMISSION_CONTACT_DEFAULTS = {
  phone: "+880 1717-099770",
  available: "Saturday to Friday",
  office_days: "Saturday to Thursday",
  time: "10:00 AM - 07:00 PM",
  email: "info.waisbd@gmail.com"
};

function admissionContactSetStatus(message, type) {
  const status = $("admission-contact-status");
  if (!status) return;
  status.textContent = message;
  status.className = "status" + (type ? " " + type : "");
}

function admissionContactPopulate(content) {
  const data = content && typeof content === "object" ? content : {};
  Object.keys(ADMISSION_CONTACT_DEFAULTS).forEach((key) => {
    const input = $("admission-contact-" + (key === "office_days" ? "office-days" : key));
    if (input) input.value = typeof data[key] === "string" ? data[key] : ADMISSION_CONTACT_DEFAULTS[key];
  });
}

function admissionContactCollect() {
  return {
    phone: $("admission-contact-phone").value.trim(),
    available: $("admission-contact-available").value.trim(),
    office_days: $("admission-contact-office-days").value.trim(),
    time: $("admission-contact-time").value.trim(),
    email: $("admission-contact-email").value.trim()
  };
}

async function admissionContactLoad() {
  const { data, error } = await sb.from("admission_contact_settings")
    .select("content").eq("id", 1).maybeSingle();
  if (error) {
    admissionContactSetStatus("Could not load contact details: " + error.message, "error");
    toast("Could not load Admission contact details. Run supabase_admission_contact_setup.sql first.", "error");
    return;
  }
  const content = data && data.content ? data.content : ADMISSION_CONTACT_DEFAULTS;
  admissionContactPopulate(content);
  try { localStorage.setItem(ADMISSION_CONTACT_CACHE_KEY, JSON.stringify(content)); } catch (error) {}
}

async function admissionContactSave() {
  const button = $("admission-contact-save");
  const content = admissionContactCollect();
  if (Object.values(content).some((value) => !value)) {
    admissionContactSetStatus("Please fill in all five contact values.", "error");
    return;
  }
  button.disabled = true;
  admissionContactSetStatus("Saving…");
  const { error } = await sb.from("admission_contact_settings")
    .upsert({ id: 1, content, updated_at: new Date().toISOString() });
  button.disabled = false;
  if (error) {
    admissionContactSetStatus("Could not save: " + error.message, "error");
    toast("Could not save Admission contact details. Check the Supabase table and policies.", "error");
    return;
  }
  try { localStorage.setItem(ADMISSION_CONTACT_CACHE_KEY, JSON.stringify(content)); } catch (error) {}
  admissionContactSetStatus("Saved. The Admission contact section is updated.", "ok");
  toast("Admission contact details saved.");
}

$("admission-contact-save").addEventListener("click", admissionContactSave);
$("admission-contact-reset").addEventListener("click", () => {
  admissionContactPopulate(ADMISSION_CONTACT_DEFAULTS);
  admissionContactSetStatus("Defaults restored in this form. Click Save contact details to publish them.");
});
admissionContactPopulate(ADMISSION_CONTACT_DEFAULTS);
let admissionContactLoaded = false;
function admissionContactLoadOnce() {
  if (admissionContactLoaded) return;
  admissionContactLoaded = true;
  admissionContactLoad();
}
const previousEnterPanelForAdmissionContact = enterPanel;
enterPanel = async function () {
  await previousEnterPanelForAdmissionContact();
  admissionContactLoadOnce();
};
if (sessionStorage.getItem(SESSION_KEY) === "1") admissionContactLoadOnce();

/* ===== Contact Us page settings editor ===== */
const CONTACT_PAGE_CACHE_KEY = "goalguide:contact-page:v1";
const CONTACT_PAGE_DEFAULTS = {
  map_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10000!2d90.21653799726562!3d23.811102400000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c11b7398e455%3A0x4bdf5a372762e77b!2sGoal%20Guide!5e0!3m2!1sbn!2sbd!4v1790457868427!5m2!1sbn!2sbd",
  whatsapp: "+88 01717099770",
  phone: "+88 01717099770",
  email: "info.waisbd@gmail.com",
  address: "House 2/1, 3rd Floor, Kalabagan, Dhanmondi, Dhaka 1205",
  facebook: "https://facebook.com/",
  messenger: "",
  youtube: "https://youtube.com/"
};

function contactPageStatus(message, type) {
  const status = $("contact-page-status");
  status.textContent = message;
  status.className = "status" + (type ? " " + type : "");
}

function contactPagePopulate(raw) {
  const data = raw && typeof raw === "object" ? raw : {};
  Object.keys(CONTACT_PAGE_DEFAULTS).forEach((key) => {
    const input = $("contact-page-" + (key === "map_url" ? "map" : key));
    input.value = typeof data[key] === "string" ? data[key] : CONTACT_PAGE_DEFAULTS[key];
  });
}

function contactPageCollect() {
  return {
    map_url: $("contact-page-map").value.trim(),
    whatsapp: $("contact-page-whatsapp").value.trim(),
    phone: $("contact-page-phone").value.trim(),
    email: $("contact-page-email").value.trim(),
    address: $("contact-page-address").value.trim(),
    facebook: $("contact-page-facebook").value.trim(),
    messenger: $("contact-page-messenger").value.trim(),
    youtube: $("contact-page-youtube").value.trim()
  };
}

async function contactPageLoad() {
  const { data, error } = await sb.from("contact_page_settings")
    .select("content").eq("id", 1).maybeSingle();
  if (error) {
    contactPageStatus("Could not load Contact Us settings: " + error.message, "error");
    toast("Could not load Contact Us settings. Run supabase_contact_us_setup.sql first.", "error");
    return;
  }
  const content = data && data.content ? data.content : CONTACT_PAGE_DEFAULTS;
  contactPagePopulate(content);
  try { localStorage.setItem(CONTACT_PAGE_CACHE_KEY, JSON.stringify(content)); } catch (error) {}
}

async function contactPageSave() {
  const button = $("contact-page-save");
  const content = contactPageCollect();
  const mapUrl = contactSafeHttpUrl(content.map_url);
  if (!mapUrl || new URL(mapUrl).hostname !== "www.google.com" || new URL(mapUrl).pathname !== "/maps/embed") {
    contactPageStatus("Enter a valid Google Maps embed URL.", "error");
    return;
  }
  if (!content.whatsapp || !content.phone || !content.email || !content.address) {
    contactPageStatus("Please complete the WhatsApp, phone, email, and address fields.", "error");
    return;
  }
  for (const key of ["facebook", "messenger", "youtube"]) {
    if (content[key] && !contactSafeHttpUrl(content[key])) {
      contactPageStatus("Facebook, Messenger, and YouTube links must use http or https.", "error");
      return;
    }
  }
  button.disabled = true;
  contactPageStatus("Saving…");
  const { error } = await sb.from("contact_page_settings")
    .upsert({ id: 1, content, updated_at: new Date().toISOString() });
  button.disabled = false;
  if (error) {
    contactPageStatus("Could not save: " + error.message, "error");
    toast("Could not save Contact Us settings. Check the Supabase table and policies.", "error");
    return;
  }
  try { localStorage.setItem(CONTACT_PAGE_CACHE_KEY, JSON.stringify(content)); } catch (error) {}
  contactPageStatus("Saved. The Contact Us page is updated.", "ok");
  toast("Contact Us settings saved.");
}

function contactSafeHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch (error) { return ""; }
}

$("contact-page-save").addEventListener("click", contactPageSave);
contactPagePopulate(CONTACT_PAGE_DEFAULTS);
let contactPageLoaded = false;
function contactPageLoadOnce() {
  if (contactPageLoaded) return;
  contactPageLoaded = true;
  contactPageLoad();
}
tabs.forEach((tab) => {
  if (tab.dataset.target === "contact-us") tab.addEventListener("click", contactPageLoadOnce);
});

/* ===== Secure Contact Us message inbox =====
   Inbox queries/deletes require a Supabase Auth session. The public anon
   client can only submit new messages under the SQL policies. */
const messagesList = $("messages-list");
const messagesStatus = $("messages-status");

function messagesSetStatus(message, type) {
  messagesStatus.textContent = message;
  messagesStatus.className = "status" + (type ? " " + type : "");
}

function messagesRender(rows) {
  messagesList.replaceChildren();
  if (!rows.length) {
    messagesSetStatus("There are no messages yet.");
    return;
  }
  messagesSetStatus(rows.length + (rows.length === 1 ? " message" : " messages"));
  rows.forEach((row) => {
    const article = document.createElement("article");
    article.className = "admin-message";
    const head = document.createElement("div");
    head.className = "admin-message-head";
    const main = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = row.name;
    const meta = document.createElement("p");
    meta.className = "admin-message-meta";
    const date = row.created_at ? new Date(row.created_at).toLocaleString() : "Date unavailable";
    meta.textContent = row.email + " · " + row.phone + " · " + date;
    main.append(title, meta);
    const remove = document.createElement("button");
    remove.className = "btn btn-ghost admin-message-delete";
    remove.type = "button";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", "Delete message from " + row.name);
    remove.addEventListener("click", () => messagesDelete(row.id, remove));
    const body = document.createElement("p");
    body.className = "admin-message-body";
    body.textContent = row.message;
    head.append(main, remove);
    article.append(head, body);
    messagesList.appendChild(article);
  });
}

async function messagesLoad() {
  messagesSetStatus("Loading messages…");
  const { data, error } = await sb.from("contact_messages")
    .select("id,name,email,phone,message,created_at")
    .order("created_at", { ascending: false });
  if (error) {
    messagesSetStatus("Could not load messages: " + error.message, "error");
    return;
  }
  messagesRender(data || []);
}

async function messagesDelete(id, button) {
  if (!window.confirm("Delete this message permanently?")) return;
  button.disabled = true;
  const { error } = await sb.from("contact_messages").delete().eq("id", id);
  if (error) {
    button.disabled = false;
    messagesSetStatus("Could not delete this message: " + error.message, "error");
    return;
  }
  messagesSetStatus("Message deleted.", "ok");
  await messagesLoad();
}

$("messages-refresh").addEventListener("click", messagesLoad);
tabs.forEach((tab) => {
  if (tab.dataset.target === "messages") tab.addEventListener("click", messagesLoad);
});

/* ===== Admission registration inbox (private; requires Admin authentication) ===== */
const registeredList = $("registered-list");
const registeredStatus = $("registered-status");

function registeredSetStatus(message, type) {
  registeredStatus.textContent = message;
  registeredStatus.className = "status" + (type ? " " + type : "");
}

function registeredRender(rows, searchedCode) {
  registeredList.replaceChildren();
  if (!rows.length) {
    registeredSetStatus(searchedCode ? "No registration found with unique ID " + searchedCode + "." : "No admission registrations have been received yet.");
    return;
  }
  registeredSetStatus(rows.length + (rows.length === 1 ? " registration" : " registrations"));
  rows.forEach((row) => {
    const article = document.createElement("article");
    article.className = "admin-message registered-card";
    const head = document.createElement("div");
    head.className = "admin-message-head";
    const titleWrap = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = row.full_name || "Student registration";
    const meta = document.createElement("p");
    meta.className = "admin-message-meta";
    meta.textContent = row.registration_code + " · " + row.email + " · " + (row.created_at ? new Date(row.created_at).toLocaleString() : "Date unavailable");
    titleWrap.append(title, meta);
    const remove = document.createElement("button");
    remove.className = "btn btn-ghost admin-message-delete";
    remove.type = "button";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", "Delete registration " + row.registration_code);
    remove.addEventListener("click", () => registeredDelete(row, remove));
    head.append(titleWrap, remove);

    const details = document.createElement("div");
    details.className = "registered-details";
    const formData = row.form_data && typeof row.form_data === "object" ? row.form_data : {};
    const normalizedValues = new Map(Object.entries(formData).map(([key, value]) => [
      key.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""), value
    ]));
    const detailGroups = [
      { title: "About Person", fields: [
        ["First Name", "first_name"], ["Last Name", "last_name"], ["Date of Birth", "date_of_birth"],
        ["Gender", "gender"], ["Place of Birth", "place_of_birth"],
        ["Educational Qualification", "educational_qualification"], ["Email Address", "email_address"],
        ["Mobile number", "mobile_number"]
      ] },
      { title: "About Course", fields: [
        ["German Course", "german_course"], ["Learning Mode", "learning_mode"], ["Shift", "shift"],
        ["Payment Method", "payment_method"], ["Reason For Learning German", "reason_for_learning_german"]
      ] },
      { title: "About Address", fields: [
        ["City", "city"], ["Address Line", "address_line"], ["Post Code", "post_code"], ["Country", "country"]
      ] },
      { title: "Message", fields: [["Message", "message"]] }
    ];
    detailGroups.forEach((group) => {
      const section = document.createElement("section");
      section.className = "registered-detail-group";
      const heading = document.createElement("h4");
      heading.textContent = group.title;
      const list = document.createElement("dl");
      group.fields.forEach(([label, key]) => {
        const term = document.createElement("dt");
        term.textContent = label;
        const description = document.createElement("dd");
        const rawValue = normalizedValues.get(key);
        description.textContent = Array.isArray(rawValue)
          ? rawValue.join(", ") || "—"
          : String(rawValue ?? "").trim() || "—";
        list.append(term, description);
      });
      section.append(heading, list);
      details.appendChild(section);
    });
    const files = document.createElement("div");
    files.className = "registered-files";
    const filesTitle = document.createElement("strong");
    filesTitle.textContent = "Attachments";
    files.appendChild(filesTitle);
    (Array.isArray(row.attachments) ? row.attachments : []).forEach((file) => {
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = file.name || "Download attachment";
      link.addEventListener("click", async (event) => {
        event.preventDefault();
        const downloadWindow = window.open("about:blank", "_blank");
        link.textContent = "Preparing download…";
        const { data, error } = await sb.storage.from("registration-uploads").createSignedUrl(file.path, 300);
        if (error || !data?.signedUrl) {
          if (downloadWindow) downloadWindow.close();
          link.textContent = file.name || "Download attachment";
          registeredSetStatus("Could not prepare this attachment download: " + (error?.message || "Unknown error"), "error");
          return;
        }
        if (downloadWindow) downloadWindow.location.href = data.signedUrl;
        link.textContent = file.name || "Download attachment";
      });
      files.appendChild(link);
    });
    article.append(head, details, files);
    registeredList.appendChild(article);
  });
}

async function registeredLoad(searchValue) {
  const requestedCode = typeof searchValue === "string" ? searchValue : $("registered-id-search").value;
  const code = String(requestedCode).trim().toUpperCase();
  registeredSetStatus(code ? "Searching for " + code + "…" : "Loading registrations…");
  let query = sb.from("admission_registrations")
    .select("id,registration_code,full_name,email,mobile,form_data,attachments,created_at");
  query = code ? query.eq("registration_code", code) : query.order("created_at", { ascending: false });
  const { data, error } = await query;
  if (error) {
    registeredSetStatus("Could not load registrations: " + error.message, "error");
    return;
  }
  registeredRender(data || [], code);
}

async function registeredDelete(row, button) {
  if (!window.confirm("Permanently delete registration " + row.registration_code + " and its uploaded files?")) return;
  button.disabled = true;
  const paths = (Array.isArray(row.attachments) ? row.attachments : []).map((file) => file.path).filter(Boolean);
  if (paths.length) {
    const { error: storageError } = await sb.storage.from("registration-uploads").remove(paths);
    if (storageError) {
      button.disabled = false;
      registeredSetStatus("Could not delete the registration files: " + storageError.message, "error");
      return;
    }
  }
  const { error } = await sb.from("admission_registrations").delete().eq("id", row.id);
  if (error) {
    button.disabled = false;
    registeredSetStatus("Could not delete this registration: " + error.message, "error");
    return;
  }
  await registeredLoad();
}

$("registered-refresh").addEventListener("click", registeredLoad);
$("registered-search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  registeredLoad();
});
$("registered-search-clear").addEventListener("click", () => {
  $("registered-id-search").value = "";
  registeredLoad("");
});
tabs.forEach((tab) => {
  if (tab.dataset.target === "registered") tab.addEventListener("click", registeredLoad);
});

if (sessionStorage.getItem(SESSION_KEY) === "1") {
  if (location.hash === "#contact-us") contactPageLoadOnce();
  if (location.hash === "#messages") messagesLoad();
  if (location.hash === "#registered" || location.hash === "#registared") registeredLoad();
}

/* ===== Public Gallery management ===== */
const GALLERY_CACHE_KEY = "goalguide:gallery:v1";
const GALLERY_TABLE = "gallery_settings";
const GALLERY_STANDARD_CATEGORIES = [
  "Classes & Learning",
  "Events & Activities",
  "Students & Community",
  "Achievements",
  "Campus & Facilities",
  "Workshops"
].map((name) => ({ name, custom: false }));
let galleryContent = { categories: [...GALLERY_STANDARD_CATEGORIES], images: [] };

function galleryStatus(message, type) {
  const status = $("gallery-status");
  status.textContent = message;
  status.className = "status" + (type ? " " + type : "");
}

function galleryNormalize(raw) {
  const data = raw && typeof raw === "object" ? raw : {};
  const inputCategories = Array.isArray(data.categories) ? data.categories : [];
  const categories = [...GALLERY_STANDARD_CATEGORIES];
  inputCategories.forEach((entry) => {
    const name = typeof entry === "string" ? entry.trim() : String(entry && entry.name || "").trim();
    if (!name || categories.some((item) => item.name.toLowerCase() === name.toLowerCase())) return;
    categories.push({ name, custom: typeof entry === "object" ? entry.custom !== false : true });
  });
  const images = (Array.isArray(data.images) ? data.images : []).filter((item) =>
    item && typeof item.url === "string" && typeof item.category === "string" &&
    categories.some((category) => category.name === item.category)
  ).map((item) => ({
    id: String(item.id || crypto.randomUUID()),
    url: item.url,
    category: item.category,
    alt: String(item.alt || "")
  }));
  return { categories, images };
}

function galleryFillCategorySelect() {
  const select = $("gallery-category-select");
  const current = select.value;
  select.replaceChildren(...galleryContent.categories.map((category) => new Option(category.name, category.name)));
  if (galleryContent.categories.some((category) => category.name === current)) select.value = current;
}

function galleryRenderAdmin() {
  galleryFillCategorySelect();
  const list = $("gallery-admin-list");
  list.replaceChildren();
  const categoryManager = document.createElement("div");
  categoryManager.className = "gallery-admin-categories";
  galleryContent.categories.forEach((category) => {
    if (!category.custom) return;
    const row = document.createElement("div");
    row.className = "gallery-admin-category-chip";
    const label = document.createElement("span");
    label.textContent = category.name;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-ghost";
    remove.textContent = "Remove category";
    remove.disabled = galleryContent.images.some((image) => image.category === category.name);
    remove.title = remove.disabled ? "Move or remove this category's images first." : "Remove this custom category";
    remove.addEventListener("click", () => {
      galleryContent.categories = galleryContent.categories.filter((entry) => entry.name !== category.name);
      galleryRenderAdmin();
      galleryStatus("Custom category removed from this draft. Save Gallery to publish the change.");
    });
    row.append(label, remove);
    categoryManager.appendChild(row);
  });
  if (categoryManager.childElementCount) list.appendChild(categoryManager);

  if (!galleryContent.images.length) {
    const empty = document.createElement("p");
    empty.className = "hero-hint";
    empty.textContent = "No gallery images added yet.";
    list.appendChild(empty);
    return;
  }

  galleryContent.categories.forEach((category) => {
    const images = galleryContent.images.filter((image) => image.category === category.name);
    if (!images.length) return;
    const group = document.createElement("section");
    group.className = "gallery-admin-category";
    const tools = document.createElement("div");
    tools.className = "gallery-admin-category-tools";
    const heading = document.createElement("h3");
    heading.textContent = category.name + " · " + images.length;
    tools.appendChild(heading);
    const cards = document.createElement("div");
    cards.className = "gallery-admin-images";
    images.forEach((image) => {
      const card = document.createElement("article");
      card.className = "gallery-admin-image-card";
      const preview = document.createElement("img");
      preview.src = image.url;
      preview.alt = image.alt || category.name;
      preview.loading = "lazy";
      preview.onerror = () => { preview.style.opacity = ".35"; };
      const description = document.createElement("p");
      description.textContent = image.alt || image.url;
      const move = document.createElement("select");
      move.setAttribute("aria-label", "Image category");
      galleryContent.categories.forEach((item) => move.add(new Option(item.name, item.name)));
      move.value = image.category;
      move.addEventListener("change", () => {
        image.category = move.value;
        galleryRenderAdmin();
        galleryStatus("Image category changed in this draft. Save Gallery to publish.");
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn btn-ghost gallery-admin-image-remove";
      remove.textContent = "Remove image";
      remove.addEventListener("click", () => {
        galleryContent.images = galleryContent.images.filter((entry) => entry.id !== image.id);
        galleryRenderAdmin();
        galleryStatus("Image removed from this draft. Save Gallery to publish.");
      });
      card.append(preview, description, move, remove);
      cards.appendChild(card);
    });
    group.append(tools, cards);
    list.appendChild(group);
  });
}

async function galleryLoad() {
  galleryStatus("Loading gallery…");
  const { data, error } = await sb.from(GALLERY_TABLE).select("content").eq("id", 1).maybeSingle();
  if (error) {
    galleryContent = galleryNormalize(null);
    galleryRenderAdmin();
    galleryStatus("Could not load Gallery settings: " + error.message, "error");
    toast("Could not load Gallery. Run supabase_gallery_setup.sql first.", "error");
    return;
  }
  galleryContent = galleryNormalize(data && data.content);
  galleryRenderAdmin();
  try { localStorage.setItem(GALLERY_CACHE_KEY, JSON.stringify(galleryContent)); } catch (error) {}
  galleryStatus("Gallery settings loaded.");
}

async function gallerySave() {
  const button = $("gallery-save");
  button.disabled = true;
  galleryStatus("Saving gallery…");
  const { error } = await sb.from(GALLERY_TABLE).upsert({
    id: 1,
    content: galleryContent,
    updated_at: new Date().toISOString()
  });
  button.disabled = false;
  if (error) {
    galleryStatus("Could not save: " + error.message, "error");
    toast("Could not save Gallery. Check the Supabase table and policies.", "error");
    return;
  }
  try { localStorage.setItem(GALLERY_CACHE_KEY, JSON.stringify(galleryContent)); } catch (error) {}
  galleryStatus("Saved. The public Gallery page is updated.", "ok");
  toast("Gallery saved.");
}

$("gallery-category-add").addEventListener("click", () => {
  const input = $("gallery-category-new");
  const name = input.value.trim().replace(/\s+/g, " ");
  if (!name) {
    galleryStatus("Enter a category name first.", "error");
    return;
  }
  if (galleryContent.categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
    galleryStatus("That category already exists.", "error");
    return;
  }
  galleryContent.categories.push({ name, custom: true });
  input.value = "";
  galleryRenderAdmin();
  $("gallery-category-select").value = name;
  galleryStatus("Custom category added. Save Gallery to keep it.");
});

$("gallery-image-add").addEventListener("click", async () => {
  const urlInput = $("gallery-image-url");
  const fileInput = $("gallery-image-file");
  const file = fileInput.files && fileInput.files[0];
  let imageUrl = urlInput.value.trim();
  const category = $("gallery-category-select").value;
  const alt = $("gallery-image-alt").value.trim();
  if (!category) {
    galleryStatus("Select a category first.", "error");
    return;
  }
  if (file && imageUrl) {
    galleryStatus("Use an image URL or upload a file, not both.", "error");
    return;
  }
  if (file) {
    if (!file.type.startsWith("image/")) {
      galleryStatus("Choose a valid image file.", "error");
      fileInput.value = "";
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      galleryStatus("Image files must be 8 MB or smaller.", "error");
      return;
    }
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = "gallery/gallery-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
    const addButton = $("gallery-image-add");
    addButton.disabled = true;
    galleryStatus("Uploading image…");
    const { error } = await sb.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600", upsert: false, contentType: file.type
    });
    addButton.disabled = false;
    if (error) {
      galleryStatus("Upload failed: " + error.message, "error");
      return;
    }
    imageUrl = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }
  if (!imageUrl) {
    galleryStatus("Paste an image URL or choose an image file.", "error");
    return;
  }
  try {
    const parsed = new URL(imageUrl);
    if (!/^https?:$/.test(parsed.protocol)) throw new Error("bad protocol");
  } catch (error) {
    galleryStatus("Enter a valid image URL.", "error");
    return;
  }
  galleryContent.images.push({ id: crypto.randomUUID(), url: imageUrl, category, alt });
  urlInput.value = "";
  fileInput.value = "";
  $("gallery-image-alt").value = "";
  galleryRenderAdmin();
  galleryStatus("Image added to this draft. Click Save Gallery to publish it.");
});

$("gallery-save").addEventListener("click", gallerySave);
galleryContent = galleryNormalize(null);
galleryRenderAdmin();
let galleryLoaded = false;
function galleryLoadOnce() {
  if (galleryLoaded) return;
  galleryLoaded = true;
  galleryLoad();
}
tabs.forEach((tab) => {
  if (tab.dataset.target === "gallery") tab.addEventListener("click", galleryLoadOnce);
});
if (sessionStorage.getItem(SESSION_KEY) === "1" && location.hash === "#gallery") galleryLoadOnce();


/* ===== Terms page editor ===== */
const TERMS_CACHE_KEY = "goalguide:terms:v1";
const TERMS_DEFAULTS = {
  account_registration: "Please provide accurate and complete information when creating an account. You are responsible for keeping your account details secure and confidential.",
  eligibility: "You must be at least {minimum_age} years old to use our services. By creating an account, you confirm that you meet this age requirement.",
  minimum_age: 16,
  course_access: "When you enroll in a course, we grant you a personal, non-transferable license to access its course materials. Access may be time-limited or indefinite, as stated at the time of enrollment.",
  materials_sharing: "Course materials are for your individual use only. Sharing, reproducing, or distributing course content without our written permission is prohibited.",
  payment_terms: "Course fees are due at the time of enrollment. Prices and available payment methods may change; the applicable fee and methods will be confirmed during registration.",
  refund_policy: "You may request a refund within {refund_days} days of enrollment. Refund requests made after this period may not be accepted. Any course-specific conditions will be shared at enrollment.",
  refund_days: 7,
  respectful_behavior: "We aim to maintain a respectful learning environment. Harassment, abusive language, or disruptive behavior is not permitted in our classes or on our platform.",
  prohibited_activities: "You may not use our services to disrupt classes, misuse course materials, interfere with our systems, or engage in unlawful activity.",
  intellectual_property: "Our course materials, lessons, graphics, logos, and other content belong to Goal Guide BD or their respective rights holders and are protected by applicable intellectual property laws. You may not reproduce, distribute, or modify them without permission.",
  liability: "We work to provide reliable courses and services, but we cannot guarantee specific learning, examination, or career outcomes. To the extent permitted by law, Goal Guide BD is not liable for indirect losses arising from use of our services.",
  privacy_protection: "We respect your privacy. Please read our Privacy Policy to learn how we collect, use, and protect your personal information.",
  modifications: "We may update these Terms and Conditions or our services from time to time. We will communicate significant changes through our website or by email. Continued use of our services after an update means you accept the revised terms.",
  governing_law: "These Terms and Conditions are governed by the laws of {jurisdiction}. Any dispute arising from our services will be handled by the appropriate courts in {jurisdiction}.",
  jurisdiction: "Bangladesh",
  contact_intro: "If you have questions about these Terms and Conditions, please contact us:",
  whatsapp: "+88 01717099770",
  phone: "+88 01717099770",
  email: "info.waisbd@gmail.com",
  address: "House 2/1, 3rd Floor, Kalabagan, Dhanmondi, Dhaka 1205",
  closing_note: "These Terms and Conditions are intended to make our services clear and transparent. Please contact us if you need any clarification."
};

function termsSetStatus(message, type) {
  const status = $("terms-status");
  status.textContent = message;
  status.className = "status" + (type ? " " + type : "");
}

function termsPopulate(content) {
  const values = Object.assign({}, TERMS_DEFAULTS, content && typeof content === "object" ? content : {});
  document.querySelectorAll("[data-terms-field]").forEach((field) => {
    field.value = values[field.dataset.termsField] == null ? "" : String(values[field.dataset.termsField]);
  });
}

function termsCollect() {
  const content = {};
  document.querySelectorAll("[data-terms-field]").forEach((field) => {
    const key = field.dataset.termsField;
    content[key] = field.value.trim();
  });
  content.minimum_age = Number(content.minimum_age);
  content.refund_days = Number(content.refund_days);
  return content;
}

async function termsLoad() {
  const { data, error } = await sb
    .from("terms_settings")
    .select("content")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    termsSetStatus("Could not load Terms content: " + error.message, "error");
    toast("Could not load Terms content. Run supabase_terms_setup.sql first.", "error");
    return;
  }
  const content = data && data.content ? data.content : TERMS_DEFAULTS;
  termsPopulate(content);
  try { localStorage.setItem(TERMS_CACHE_KEY, JSON.stringify(content)); } catch (error) {}
  termsSetStatus("Terms content loaded.", "ok");
}

let termsLoaded = false;
function termsLoadOnce() {
  if (termsLoaded) return;
  termsLoaded = true;
  termsLoad();
}

$("terms-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = termsCollect();
  if (!Number.isInteger(content.minimum_age) || content.minimum_age < 1 ||
      !Number.isInteger(content.refund_days) || content.refund_days < 0) {
    termsSetStatus("Minimum age must be at least 1 and refund days must be 0 or more.", "error");
    return;
  }
  const button = $("terms-save");
  button.disabled = true;
  termsSetStatus("Saving Terms content…");
  const { error } = await sb.from("terms_settings").upsert({
    id: 1,
    content,
    updated_at: new Date().toISOString()
  });
  button.disabled = false;
  if (error) {
    termsSetStatus("Could not save Terms content: " + error.message, "error");
    toast("Could not save Terms content. Check Supabase table permissions.", "error");
    return;
  }
  try { localStorage.setItem(TERMS_CACHE_KEY, JSON.stringify(content)); } catch (error) {}
  termsSetStatus("Saved. The Terms page will show the updated content.", "ok");
  toast("Terms page content saved.");
});

$("terms-reset").addEventListener("click", () => {
  termsPopulate(TERMS_DEFAULTS);
  termsSetStatus("Form reset to defaults. Click Save Terms to publish the defaults.");
});

tabs.forEach((tab) => {
  if (tab.dataset.target === "terms") tab.addEventListener("click", termsLoadOnce);
});
const previousEnterPanelForTerms = enterPanel;
enterPanel = async function () {
  await previousEnterPanelForTerms();
  if (location.hash === "#terms") termsLoadOnce();
};
if (sessionStorage.getItem(SESSION_KEY) === "1" && location.hash === "#terms") termsLoadOnce();


/* ===== Privacy Policy editor ===== */
const PRIVACY_CACHE_KEY = "goalguide:privacy-policy:v1";
const PRIVACY_DEFAULTS = {
  personal_information: "When you submit a registration or contact form, we may collect the details you provide, such as your name, contact information, course interests, address, and any files you choose to send.",
  usage_information: "Basic technical information may be processed when you use this website to deliver pages, maintain service reliability, and help protect the site from misuse.",
  use_information: "We use submitted information to respond to questions, manage course registration, provide requested services, communicate relevant updates, and maintain the security and operation of our website.",
  sharing_information: "We may share information with trusted service providers that help us host the website, process forms, store data, or provide services. We share only what is needed for those purposes and do not sell personal information.",
  cookies_storage: "This website may use browser storage to remember published site content and improve page loading. Your browser settings let you manage or clear locally stored website data.",
  data_security: "We use reasonable safeguards designed to protect information from unauthorized access, loss, or misuse. No website or method of online transmission can be guaranteed completely secure.",
  data_retention: "We keep information for as long as needed to respond to you, provide our services, meet operational needs, and handle any follow-up matters. You may contact us to ask about information you have submitted.",
  privacy_choices: "You may contact us to ask what personal information you have provided, request a correction, or ask us to remove it where we are able to do so. We may need to retain some records for legitimate operational or legal reasons.",
  children_privacy: "Our services are intended for people who are at least {minimum_age} years old. If you believe a child has submitted personal information to us, please contact us so we can review the request.",
  minimum_age: 16,
  policy_changes: "We may update this Privacy Policy when our services or information practices change. The latest version will be published on this page, with its effective wording applying from the time it is posted.",
  contact_intro: "If you have questions or requests about this Privacy Policy or your personal information, please contact us:",
  whatsapp: "+88 01717099770",
  phone: "+88 01717099770",
  email: "info.waisbd@gmail.com",
  address: "House 2/1, 3rd Floor, Kalabagan, Dhanmondi, Dhaka 1205",
  closing_note: "We will review privacy questions and requests sent through the contact details above."
};

function privacySetStatus(message, type) {
  const status = $("privacy-status");
  status.textContent = message;
  status.className = "status" + (type ? " " + type : "");
}

function privacyPopulate(content) {
  const values = Object.assign({}, PRIVACY_DEFAULTS, content && typeof content === "object" ? content : {});
  document.querySelectorAll("[data-privacy-field]").forEach((field) => {
    field.value = values[field.dataset.privacyField] == null ? "" : String(values[field.dataset.privacyField]);
  });
}

function privacyCollect() {
  const content = {};
  document.querySelectorAll("[data-privacy-field]").forEach((field) => {
    content[field.dataset.privacyField] = field.value.trim();
  });
  content.minimum_age = Number(content.minimum_age);
  return content;
}

async function privacyLoad() {
  const { data, error } = await sb
    .from("privacy_settings")
    .select("content")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    privacySetStatus("Could not load Privacy Policy content: " + error.message, "error");
    toast("Could not load Privacy Policy content. Run supabase_privacy_setup.sql first.", "error");
    return;
  }
  const content = data && data.content ? data.content : PRIVACY_DEFAULTS;
  privacyPopulate(content);
  try { localStorage.setItem(PRIVACY_CACHE_KEY, JSON.stringify(content)); } catch (error) {}
  privacySetStatus("Privacy Policy content loaded.", "ok");
}

let privacyLoaded = false;
function privacyLoadOnce() {
  if (privacyLoaded) return;
  privacyLoaded = true;
  privacyLoad();
}

$("privacy-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = privacyCollect();
  if (!Number.isInteger(content.minimum_age) || content.minimum_age < 1) {
    privacySetStatus("Minimum age must be a whole number greater than zero.", "error");
    return;
  }
  const button = $("privacy-save");
  button.disabled = true;
  privacySetStatus("Saving Privacy Policy content…");
  const { error } = await sb.from("privacy_settings").upsert({
    id: 1,
    content,
    updated_at: new Date().toISOString()
  });
  button.disabled = false;
  if (error) {
    privacySetStatus("Could not save Privacy Policy content: " + error.message, "error");
    toast("Could not save Privacy Policy content. Check Supabase table permissions.", "error");
    return;
  }
  try { localStorage.setItem(PRIVACY_CACHE_KEY, JSON.stringify(content)); } catch (error) {}
  privacySetStatus("Saved. The Privacy Policy page will show the updated content.", "ok");
  toast("Privacy Policy content saved.");
});

$("privacy-reset").addEventListener("click", () => {
  privacyPopulate(PRIVACY_DEFAULTS);
  privacySetStatus("Form reset to defaults. Click Save Privacy Policy to publish the defaults.");
});

tabs.forEach((tab) => {
  if (tab.dataset.target === "privacy") tab.addEventListener("click", privacyLoadOnce);
});
const previousEnterPanelForPrivacy = enterPanel;
enterPanel = async function () {
  await previousEnterPanelForPrivacy();
  if (location.hash === "#privacy") privacyLoadOnce();
};
if (sessionStorage.getItem(SESSION_KEY) === "1" && location.hash === "#privacy") privacyLoadOnce();
