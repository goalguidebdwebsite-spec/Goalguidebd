(function () {
  "use strict";

  const SUPABASE_URL = "https://sdzbpsxkhpogbwixhulv.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_ahS3rtwQsIrXWGo2gIoJUA_JolIlwzf";
  const CACHE_KEY = "goalguide:contact-page:v1";
  const DEFAULTS = {
    whatsapp: "+88 01717099770",
    facebook: "https://facebook.com/",
    messenger: ""
  };

  function getSettings(value) {
    const data = value && typeof value === "object" ? value : {};
    return {
      whatsapp: typeof data.whatsapp === "string" ? data.whatsapp : DEFAULTS.whatsapp,
      facebook: typeof data.facebook === "string" ? data.facebook : DEFAULTS.facebook,
      messenger: typeof data.messenger === "string" && data.messenger.trim()
        ? data.messenger
        : (typeof data.facebook === "string" ? data.facebook : DEFAULTS.facebook)
    };
  }

  function whatsappUrl(value) {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.startsWith("0")) digits = "880" + digits.slice(1);
    else if (digits.startsWith("8800")) digits = "880" + digits.slice(4);
    return digits.length >= 8 ? "https://wa.me/" + digits : "";
  }

  function messengerUrl(value) {
    const input = String(value || "").trim();
    if (!input) return "https://www.messenger.com/";
    if (/^\d+$/.test(input)) return "https://m.me/" + input;
    if (/^@?[a-z\d.]+$/i.test(input)) return "https://m.me/" + encodeURIComponent(input.replace(/^@/, ""));

    try {
      const url = new URL(/^https?:\/\//i.test(input) ? input : "https://" + input);
      if (url.protocol !== "https:" && url.protocol !== "http:") return "https://www.messenger.com/";
      const host = url.hostname.toLowerCase().replace(/^(www|web|m)\./, "");
      if (host === "m.me" || host === "messenger.com") return url.href;
      if (host !== "facebook.com" && host !== "fb.com") return "https://www.messenger.com/";

      if (url.pathname.toLowerCase().endsWith("profile.php")) {
        const id = url.searchParams.get("id");
        return id ? "https://m.me/" + encodeURIComponent(id) : url.href;
      }

      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0]?.toLowerCase() === "pages" && parts.length > 1) {
        const pageId = parts.find((part) => /^\d+$/.test(part));
        return "https://m.me/" + encodeURIComponent(pageId || parts[1]);
      }
      const slug = parts[0];
      if (slug && !["share", "sharer", "watch", "events", "groups", "marketplace"].includes(slug.toLowerCase())) {
        return "https://m.me/" + encodeURIComponent(slug);
      }
      return "https://www.messenger.com/";
    } catch (error) {
      return "https://www.messenger.com/";
    }
  }

  function makeLink(className, label, href, svg) {
    if (!href) return null;
    const link = document.createElement("a");
    link.className = "site-communication-button " + className;
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", label);
    link.title = label;
    link.innerHTML = svg;
    return link;
  }

  function render(raw) {
    const settings = getSettings(raw);
    const whatsapp = makeLink(
      "site-communication-button--whatsapp",
      "Chat on WhatsApp",
      whatsappUrl(settings.whatsapp),
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16.04 3.2A12.72 12.72 0 0 0 5.08 22.38L3.4 28.52l6.3-1.65A12.73 12.73 0 1 0 16.04 3.2Zm0 23.13c-1.98 0-3.92-.53-5.62-1.54l-.4-.24-3.74.98 1-3.64-.26-.42A10.4 10.4 0 1 1 16.04 26.33Zm5.7-7.8c-.31-.16-1.85-.91-2.14-1.02-.29-.1-.5-.16-.7.16-.21.31-.8 1.02-.98 1.23-.18.2-.36.23-.67.08-.31-.16-1.32-.49-2.52-1.56-.93-.83-1.56-1.86-1.75-2.17-.18-.31-.02-.48.14-.64.14-.14.31-.36.47-.54.15-.18.2-.31.31-.52.1-.2.05-.39-.03-.54-.08-.16-.7-1.69-.96-2.31-.25-.6-.51-.52-.7-.53h-.6c-.21 0-.54.08-.83.39-.28.31-1.08 1.05-1.08 2.57s1.11 2.98 1.27 3.19c.15.2 2.18 3.33 5.28 4.67.74.32 1.31.51 1.76.65.74.23 1.41.2 1.94.12.59-.09 1.85-.76 2.11-1.49.26-.74.26-1.36.18-1.49-.08-.13-.28-.2-.59-.36Z"/></svg>'
    );
    const messenger = makeLink(
      "site-communication-button--messenger",
      "Message us on Messenger",
      messengerUrl(settings.messenger),
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C8.7 3 3 8.35 3 15.52c0 3.76 1.54 7.01 4.05 9.25.21.19.34.46.35.75l.07 2.4a.9.9 0 0 0 1.26.81l2.68-1.18c.23-.1.48-.12.72-.05 1.2.34 2.5.52 3.87.52 7.3 0 13-5.35 13-12.52S23.3 3 16 3Zm1.3 16.86-3.82-4.08a1.95 1.95 0 0 0-2.78-.1l-4.1 3.1 4.5-7.2a1.95 1.95 0 0 1 3.02-.36l3.82 4.08a1.95 1.95 0 0 0 2.78.1l4.1-3.1-4.5 7.2a1.95 1.95 0 0 1-3.02.36Z"/></svg>'
    );
    let container = document.querySelector(".site-communication-buttons");
    if (!container) {
      container = document.createElement("div");
      container.className = "site-communication-buttons";
      container.setAttribute("aria-label", "Contact us");
      document.body.appendChild(container);
    }
    container.replaceChildren(...[messenger, whatsapp].filter(Boolean));
  }

  try {
    render(JSON.parse(localStorage.getItem(CACHE_KEY) || "null") || DEFAULTS);
  } catch (error) {
    render(DEFAULTS);
  }

  fetch(SUPABASE_URL + "/rest/v1/contact_page_settings?id=eq.1&select=content", {
    headers: { apikey: SUPABASE_ANON_KEY, Accept: "application/json" },
    cache: "no-store"
  }).then((response) => {
    if (!response.ok) throw new Error("Contact settings request failed: " + response.status);
    return response.json();
  }).then((rows) => {
    if (!rows.length || !rows[0].content) return;
    const content = rows[0].content;
    render(content);
    try {
      const previous = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}") || {};
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...previous, ...content }));
    } catch (error) {}
  }).catch((error) => console.warn("Floating contact buttons could not refresh their settings.", error));
})();
