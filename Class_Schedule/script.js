const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll(".nav-links a");

/* ----- Mobile menu open / close ----- */
function setMenu(open) {
  navMenu.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

navToggle.addEventListener("click", () => {
  setMenu(!navMenu.classList.contains("open"));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

/* Close the menu when clicking outside it */
document.addEventListener("click", (event) => {
  if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
    setMenu(false);
  }
});

/* Reset the menu when the screen grows back to desktop width */
window.matchMedia("(min-width: 991px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

/* ----- Selected link (#ed1c24) ----- */
function setActive(link) {
  navLinks.forEach((item) => {
    item.classList.remove("active");
    item.removeAttribute("aria-current");
  });
  link.classList.add("active");
  link.setAttribute("aria-current", "page");
}

/* Match the resolved page path so Netlify folder routes work consistently. */
function normalizePath(path) {
  return decodeURIComponent(path).replace(/\/index\.html?$/i, "/").replace(/\/+$/, "").toLowerCase() || "/";
}

const currentPath = normalizePath(location.pathname);
const currentLink = Array.from(navLinks).find(
  (link) => normalizePath(new URL(link.href, location.href).pathname) === currentPath
);
if (currentLink) setActive(currentLink);

/* Highlight the link that was clicked and close the mobile menu */
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setActive(link);
    setMenu(false);
  });
});

/* ===== Dynamic footer (content comes from Supabase) ===== */
/* Footer: the values come from Supabase (table footer_settings).
   The defaults below are the content of the design image and are shown
   whenever Supabase has nothing saved yet. */
(function () {
  const SUPABASE_URL = "https://sdzbpsxkhpogbwixhulv.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_ahS3rtwQsIrXWGo2gIoJUA_JolIlwzf";
  const CACHE_KEY = "goalguide:footer:v2";

  /* Used only if the logo file/URL cannot be loaded, so the logo never disappears. */
  const FALLBACK_LOGO = "data:image/webp;base64,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";

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

  /* Font Awesome Free icons (CC BY 4.0), inlined so nothing has to be downloaded. */
  const ICONS = {
    whatsapp: {
      vb: "0 0 448 512",
      d: "M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157m-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1s56.2 81.2 56.1 130.5c0 101.8-84.9 184.6-186.6 184.6m101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 18-17.6 21.8c-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7s-12.5-30.1-17.1-41.2c-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4s4.6-24.1 3.2-26.4c-1.3-2.5-5-3.9-10.5-6.6",
    },
    phone: {
      vb: "0 0 512 512",
      d: "M160.2 25c-7.9-18.9-28.5-28.9-48.1-23.6l-5.5 1.5C42 20.5-13.2 83.1 2.9 159.3 40 334.3 177.7 472 352.7 509.1 429 525.3 491.5 470 509.1 405.4l1.5-5.5c5.4-19.7-4.7-40.3-23.5-48.1l-97.3-40.5c-16.5-6.9-35.6-2.1-47 11.8l-38.6 47.2c-70.3-34.9-126.9-93.3-159.4-165l44.2-36c13.9-11.3 18.6-30.4 11.8-47z",
    },
    envelope: {
      vb: "0 0 512 512",
      d: "M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4l208 156a48 48 0 0 0 57.6 0l208-156c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48zM0 196v188c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V196L313.6 344.8c-34.1 25.6-81.1 25.6-115.2 0z",
    },
    "location-dot": {
      vb: "0 0 384 512",
      d: "M0 188.6C0 84.4 86 0 192 0s192 84.4 192 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0C120.1 450.9-.1 307.9-.1 188.6zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128",
    },
    facebook: {
      vb: "0 0 320 512",
      d: "M80 299.3V512h116V299.3h86.5l18-97.8H196v-34.6c0-51.7 20.3-71.5 72.7-71.5 16.3 0 29.4.4 37 1.2V7.9C291.4 4 256.4 0 236.2 0 129.3 0 80 50.5 80 159.4v42.1H14v97.8z",
    },
    youtube: {
      vb: "0 0 576 512",
      d: "M549.7 124.1c-6.2-23.7-24.8-42.3-48.3-48.6C458.9 64 288.1 64 288.1 64S117.3 64 74.7 75.5c-23.5 6.3-42 24.9-48.3 48.6C15 167 15 256.4 15 256.4s0 89.4 11.4 132.3c6.3 23.6 24.8 41.5 48.3 47.8C117.3 448 288.1 448 288.1 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zM232.2 337.6V175.2l142.7 81.2z",
    },
    instagram: {
      vb: "0 0 448 512",
      d: "M224.3 141a115 115 0 1 0-.6 230 115 115 0 1 0 .6-230m-.6 40.4a74.6 74.6 0 1 1 .6 149.2 74.6 74.6 0 1 1-.6-149.2m93.4-45.1a26.8 26.8 0 1 1 53.6 0 26.8 26.8 0 1 1-53.6 0m129.7 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8M399 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1",
    },
    x: {
      vb: "0 0 448 512",
      d: "M357.2 48h70.6L273.6 224.2 455 464H313L201.7 318.6 74.5 464H3.8l164.9-188.5L-5.2 48h145.6l100.5 132.9zm-24.8 373.8h39.1L119.1 88h-42z",
    },
    tiktok: {
      vb: "0 0 448 512",
      d: "M448.5 209.9c-44 .1-87-13.6-122.8-39.2v178.7c0 33.1-10.1 65.4-29 92.6s-45.6 48-76.6 59.6-64.8 13.5-96.9 5.3-60.9-25.9-82.7-50.8-35.3-56-39-88.9 2.9-66.1 18.6-95.2 40-52.7 69.6-67.7 62.9-20.5 95.7-16v89.9c-15-4.7-31.1-4.6-46 .4s-27.9 14.6-37 27.3-14 28.1-13.9 43.9 5.2 31 14.5 43.7 22.4 22.1 37.4 26.9 31.1 4.8 46-.1 28-14.4 37.2-27.1 14.2-28.1 14.2-43.8V0h88c-.1 7.4.6 14.9 1.9 22.2 3.1 16.3 9.4 31.9 18.7 45.7s21.3 25.6 35.2 34.6c19.9 13.1 43.2 20.1 67 20.1V210z",
    },
    linkedin: {
      vb: "0 0 448 512",
      d: "M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8c0-14.3 5.7-27.9 15.8-38S39.6 0 53.8 0s27.9 5.7 38 15.8 15.8 23.8 15.8 38c0 29.7-24.1 54.3-53.8 54.3M447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z",
    },
  };

  const SOCIALS = [
    { key: "facebook", label: "Facebook" },
    { key: "youtube", label: "YouTube" },
    { key: "instagram", label: "Instagram" },
    { key: "x", label: "X" },
    { key: "tiktok", label: "TikTok" },
    { key: "linkedin", label: "LinkedIn" },
  ];

  const $ = (id) => document.getElementById(id);
  const SVG_NS = "http://www.w3.org/2000/svg";

  function icon(name) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", ICONS[name].vb);
    svg.setAttribute("class", "gf-ico-" + name);
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", ICONS[name].d);
    svg.appendChild(path);
    return svg;
  }

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* Only normal links are allowed: no javascript: or data: URLs. */
  function safeUrl(value) {
    const url = String(value || "").trim();
    if (!url) return "";
    const scheme = url.match(/^([a-z][a-z0-9+.-]*):/i);
    if (scheme && !/^(https?|mailto|tel)$/i.test(scheme[1])) return "";
    return url;
  }

  function merge(content) {
    const data = content && typeof content === "object" ? content : {};
    return Object.assign({}, DEFAULTS, data, {
      social: Object.assign({}, DEFAULTS.social, data.social),
    });
  }

  function contactRow(iconName, text, href) {
    const li = make("li");
    li.appendChild(icon(iconName));
    if (href) {
      const a = make("a", "", text);
      a.href = href;
      if (href.startsWith("http")) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      li.appendChild(a);
    } else {
      li.appendChild(make("span", "", text));
    }
    return li;
  }

  function render(raw) {
    const c = merge(raw);

    /* Logo (falls back to the built-in copy if the image cannot load) */
    const logo = $("f-logo");
    const logoUrl = safeUrl(c.logo_url) || DEFAULTS.logo_url;
    logo.onerror = () => {
      logo.onerror = null;
      logo.src = FALLBACK_LOGO;
    };
    if (logo.getAttribute("src") !== logoUrl) logo.src = logoUrl;

    $("f-desc").textContent = c.description || "";

    /* Social circles */
    const social = $("f-social");
    social.innerHTML = "";
    SOCIALS.forEach((item) => {
      const url = safeUrl(c.social[item.key]);
      if (!url) return;
      const a = make("a", "gf-social-link");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", item.label);
      a.appendChild(icon(item.key));
      social.appendChild(a);
    });

    /* Contact: WhatsApp, phone, email, address */
    $("f-contact-title").textContent = c.contact_title || "";
    const contact = $("f-contact");
    contact.innerHTML = "";
    if (c.whatsapp) {
      const digits = c.whatsapp.replace(/\D/g, "");
      contact.appendChild(
        contactRow("whatsapp", c.whatsapp, digits ? "https://wa.me/" + digits : "")
      );
    }
    if (c.phone) {
      const tel = c.phone.replace(/[^\d+]/g, "");
      contact.appendChild(contactRow("phone", c.phone, tel ? "tel:" + tel : ""));
    }
    if (c.email) {
      contact.appendChild(contactRow("envelope", c.email, "mailto:" + c.email));
    }
    if (c.address) {
      contact.appendChild(contactRow("location-dot", c.address, ""));
    }

    $("f-copy").textContent = c.copyright || "";

    $("f-contact-col").hidden = !c.contact_title && !contact.children.length;
  }

  async function fetchContent() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(
        SUPABASE_URL + "/rest/v1/footer_settings?id=eq.1&select=content",
        {
          headers: { apikey: SUPABASE_ANON_KEY, Accept: "application/json" },
          signal: controller.signal,
        }
      );
      if (!res.ok) throw new Error("Request failed: " + res.status);
      const rows = await res.json();
      return rows.length ? rows[0].content : null;
    } finally {
      clearTimeout(timer);
    }
  }

  function readCache() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY));
    } catch (err) {
      return null;
    }
  }

  function writeCache(content) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(content));
    } catch (err) {
      /* storage unavailable: ignore */
    }
  }

  async function start() {
    render(readCache()); // saved copy if there is one, otherwise the image defaults
    try {
      const fresh = await fetchContent();
      if (fresh && Object.keys(fresh).length) {
        writeCache(fresh);
        render(fresh);
      }
    } catch (err) {
      console.warn("Footer: could not read Supabase, showing saved or default content.", err);
    }
  }

  start();
})();


/* ===== Dynamic Class Schedule batch tables (content comes from Supabase) ===== */
/* Values come from Supabase (table class_schedule_settings), edited from
   the admin's Class Schedule tab. The defaults below match the two
   reference tables (Saturday to Thursday Batch, Weekend Batch) and are
   shown whenever Supabase has nothing saved yet. The column headings
   (Session, Time, Days) are fixed in the HTML and are not part of this
   data. */
(function () {
  const SUPABASE_URL = "https://sdzbpsxkhpogbwixhulv.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_ahS3rtwQsIrXWGo2gIoJUA_JolIlwzf";
  const CACHE_KEY = "goalguide:class-schedule:v1";

  const DEFAULTS = {
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

  function $id(id) {
    return document.getElementById(id);
  }

  function merge(raw) {
    const c = raw && typeof raw === "object" ? raw : {};
    return {
      weekday_heading: c.weekday_heading || DEFAULTS.weekday_heading,
      weekday_rows: Array.isArray(c.weekday_rows)
        ? c.weekday_rows
        : DEFAULTS.weekday_rows,
      weekend_heading: c.weekend_heading || DEFAULTS.weekend_heading,
      weekend_rows: Array.isArray(c.weekend_rows)
        ? c.weekend_rows
        : DEFAULTS.weekend_rows
    };
  }

  function renderRows(tbodyId, rows) {
    const tbody = $id(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = "";
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      ["session", "time", "days"].forEach((key) => {
        const td = document.createElement("td");
        td.textContent = (row && row[key]) || "";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  function render(raw) {
    const c = merge(raw);
    if ($id("schedule-weekday-heading")) $id("schedule-weekday-heading").textContent = c.weekday_heading;
    if ($id("schedule-weekend-heading")) $id("schedule-weekend-heading").textContent = c.weekend_heading;
    renderRows("schedule-weekday-rows", c.weekday_rows);
    renderRows("schedule-weekend-rows", c.weekend_rows);
  }

  async function fetchContent() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(
        SUPABASE_URL + "/rest/v1/class_schedule_settings?id=eq.1&select=content",
        {
          headers: { apikey: SUPABASE_ANON_KEY, Accept: "application/json" },
          signal: controller.signal
        }
      );
      if (!res.ok) throw new Error("Request failed: " + res.status);
      const rows = await res.json();
      return rows.length ? rows[0].content : null;
    } finally {
      clearTimeout(timer);
    }
  }

  function readCache() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY));
    } catch (err) {
      return null;
    }
  }

  function writeCache(content) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(content));
    } catch (err) {
      /* storage unavailable: ignore */
    }
  }

  async function start() {
    render(readCache()); // saved copy if there is one, otherwise the defaults
    try {
      const fresh = await fetchContent();
      if (fresh && Object.keys(fresh).length) {
        writeCache(fresh);
        render(fresh);
      }
    } catch (err) {
      console.warn("Class Schedule: could not read Supabase, showing saved or default content.", err);
    }
  }

  start();
})();
