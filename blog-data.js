/* Shared public blog feed for the home, About Us, and Blog pages. */
(function () {
  const SUPABASE_URL = "https://sdzbpsxkhpogbwixhulv.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_ahS3rtwQsIrXWGo2gIoJUA_JolIlwzf";
  const CACHE_KEY = "goalguide:blog-posts:v1";
  const rootUrl = new URL(".", document.currentScript.src);

  function imageUrl(value) {
    const valueText = String(value || "").trim();
    if (!valueText) return "";
    if (/^https?:\/\//i.test(valueText) || valueText.startsWith("/")) return valueText;
    if (/^[a-z][a-z0-9+.-]*:/i.test(valueText)) return "";
    return new URL(valueText.replace(/^\.\//, ""), rootUrl).href;
  }

  function pdfDownloadUrl(value, label) {
    const href = String(value || "").trim();
    if (!href) return "";
    try {
      const url = new URL(href, rootUrl);
      const filename = String(label || "blog-download")
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9-_]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "blog-download";
      url.searchParams.set("download", filename + ".pdf");
      return url.href;
    } catch (error) {
      return "";
    }
  }

  function renderPost(post, isStory) {
    const src = imageUrl(post.image_url);
    const description = String(post.description || "").trim();
    if (!src || !description) return null;

    const article = document.createElement("article");
    article.className = "home-blog-card blog-post-card" + (isStory ? " success-story-card" : "");
    const image = document.createElement("img");
    image.src = src;
    image.alt = description;
    image.loading = "lazy";
    image.decoding = "async";
    const text = document.createElement("p");
    text.className = "success-story-description";
    text.textContent = description;

    if (isStory) {
      article.append(image, text);
    } else {
      const heading = document.createElement("h3");
      const downloadUrl = pdfDownloadUrl(post.pdf_url, description);
      if (downloadUrl) {
        const download = document.createElement("a");
        download.className = "blog-download-link";
        download.href = downloadUrl;
        download.setAttribute("download", "");
        download.textContent = description;
        download.setAttribute("aria-label", "Download PDF: " + description);
        heading.appendChild(download);
      } else {
        heading.textContent = description;
      }
      article.append(image, heading);
    }
    return article;
  }

  function render(posts) {
    const validPosts = Array.isArray(posts) ? posts : [];
    document.querySelectorAll("[data-blog-grid]").forEach((grid) => {
      grid.replaceChildren();
      validPosts.filter((post) => post.post_type !== "story").forEach((post) => {
        const article = renderPost(post, false);
        if (article) grid.appendChild(article);
      });

      if (!grid.children.length) {
        const empty = document.createElement("p");
        empty.className = "blog-empty-state";
        empty.textContent = "New stories and updates are coming soon.";
        grid.appendChild(empty);
      }
    });

    document.querySelectorAll("[data-story-grid]").forEach((grid) => {
      grid.replaceChildren();
      validPosts.filter((post) => post.post_type === "story").forEach((post) => {
        const article = renderPost(post, true);
        if (article) grid.appendChild(article);
      });
      if (!grid.children.length) {
        const empty = document.createElement("p");
        empty.className = "blog-empty-state";
        empty.textContent = "Success stories are coming soon.";
        grid.appendChild(empty);
      }
    });
  }

  function saveCache(posts) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(posts)); }
    catch (error) { /* Browser storage can be unavailable. */ }
  }

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
    render(cached);
  } catch (error) {
    render([]);
  }

  fetch(SUPABASE_URL + "/rest/v1/blog_posts?select=id,image_url,pdf_url,description,post_type,sort_order,created_at&order=sort_order.asc,created_at.desc", {
    headers: { apikey: SUPABASE_ANON_KEY, Accept: "application/json" },
    cache: "no-store"
  })
    .then((response) => {
      if (!response.ok) throw new Error("Blog request failed: " + response.status);
      return response.json();
    })
    .then((posts) => {
      saveCache(posts);
      render(posts);
    })
    .catch((error) => {
      console.warn("Blog posts could not be refreshed from Supabase; showing the saved copy.", error);
    });
})();
