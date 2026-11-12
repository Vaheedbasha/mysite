/* ==========================================================================
   MAIN.JS — all page behaviour
   --------------------------------------------------------------------------
   Sections:
   1.  Helpers
   2.  Content rendering from js/config.js
   3.  Contact details applied from config
   4.  Theme toggle
   5.  Sticky header state
   6.  Mobile navigation (focus trap, Escape)
   7.  Active nav link while scrolling
   8.  Scroll-reveal animations
   9.  Animated counters
   10. Expand live sites
   11. Back to top
   12. Contact form (validation, fetch, token)
   --------------------------------------------------------------------------
   Everything degrades gracefully: if a feature cannot run, the page still
   works because the full content is already in index.html.
   ========================================================================== */
(function () {
  "use strict";

  var SITE = window.SITE || {};
  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ======================================================================
     1. HELPERS
     ====================================================================== */
  function $(sel, scope) { return (scope || doc).querySelector(sel); }
  function $$(sel, scope) { return Array.prototype.slice.call((scope || doc).querySelectorAll(sel)); }

  // Escape user-editable strings before they go into HTML templates.
  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function waLink() {
    var number = SITE.whatsapp || "919550926882";
    var text = SITE.whatsappText || "Hi Vaheed, I'd like to discuss a website project.";
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(text);
  }

  var arrowSvg =
    '<svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>';

  var IMG_FALLBACK = ' onerror="this.remove()"';

  // Live cards shown before the "Show more" button reveals the rest.
  var VISIBLE_LIVE = 3;

  /* ======================================================================
     2. CONTENT RENDERING
     ----------------------------------------------------------------------
     Each render function replaces the static fallback markup in index.html
     with the same structure built from SITE. If config.js is missing or a
     list is empty, the fallback markup stays untouched.
     ====================================================================== */
  /* Technology chips: the brand mark always shows, the name appears on hover.
     The SVG symbols live in the sprite at the top of index.html. */
  var TECH = {
    html: { cls: "tech-html5", symbol: "i-html5", label: "HTML5" },
    css: { cls: "tech-css3", symbol: "i-css3", label: "CSS3" },
    js: { cls: "tech-javascript", symbol: "i-javascript", label: "JavaScript" },
    php: { cls: "tech-php", symbol: "i-php", label: "PHP" },
    mysql: { cls: "tech-mysql", symbol: "i-mysql", label: "MySQL" },
    seo: { cls: "tech-seo", symbol: "i-seo", label: "SEO" }
  };

  function techKey(tag) {
    var name = String(tag).toLowerCase();
    if (name === "html5") return "html";
    if (name === "css3") return "css";
    if (name === "javascript") return "js";
    return TECH[name] ? name : "";
  }

  function techItem(tag) {
    var key = techKey(tag);
    if (!key) {
      return '<li class="tech tech-generic"><span class="tech-name">' + esc(tag) + "</span></li>";
    }
    var t = TECH[key];
    return '<li class="tech ' + t.cls + '">' +
      '<svg class="tech-logo" aria-hidden="true"><use href="#' + t.symbol + '"></use></svg>' +
      '<span class="tech-name">' + t.label + "</span>" +
    "</li>";
  }

  function techRow(tags) {
    if (!tags || !tags.length) return "";
    return '<ul class="tech-row" aria-label="Technologies used">' +
      tags.map(techItem).join("") +
    "</ul>";
  }

  function imgPath(project) {
    return "images/projects/" + project.slug + ".webp";
  }

  /* One card design for everything: live sites and demos. */
  function renderCard(project, extra) {
    var isDemo = project.kind === "demo";
    var badge = isDemo
      ? '<span class="shot-badge">' + esc(project.badge || "Demo build") + "</span>"
      : '<span class="shot-badge shot-badge-live"><span class="pulse-dot" aria-hidden="true"></span>Live</span>';
    var linkText = isDemo ? (project.linkLabel || "Open demo") : "Visit live site";

    return '<article class="proj' + (extra ? " is-extra" : " reveal") + '">' +
      '<div class="shot">' + badge +
        '<div class="shot-fallback" aria-hidden="true">' +
          '<span class="shot-frame-bar"><i></i><i></i><i></i></span>' +
          '<span class="shot-fallback-name">' + esc(project.name) + "</span>" +
          '<span class="shot-fallback-note">Screenshot coming soon</span>' +
        "</div>" +
        '<img src="' + esc(imgPath(project)) + '" alt="' + esc(project.imageAlt || project.name) + '"' +
          ' width="1600" height="1000" loading="lazy" decoding="async"' + IMG_FALLBACK + ">" +
      "</div>" +
      '<div class="proj-body">' +
        "<h3>" + esc(project.name) + "</h3>" +
        "<p>" + esc(project.description) + "</p>" +
        techRow(project.tags) +
        '<a class="btn btn-ghost proj-link" href="' + esc(project.url) + '" target="_blank" rel="noopener noreferrer">' +
          esc(linkText) + arrowSvg +
        "</a>" +
      "</div>" +
    "</article>";
  }

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
  }

  var SERVICE_ICONS = {
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    code: '<path d="m15 18 5-5-5-5"/><path d="m9 6-5 5 5 5"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'
  };

  function serviceIcon(name) {
    var paths = SERVICE_ICONS[name] || SERVICE_ICONS.monitor;
    return '<span class="service-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + paths + "</svg></span>";
  }

  function renderService(service) {
    return '<article class="service reveal">' +
      serviceIcon(service.icon) +
      "<h3>" + esc(service.title) + "</h3>" +
      "<p>" + esc(service.description) + "</p>" +
      '<ul class="bullet-list">' +
        (service.bullets || []).map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") +
      "</ul>" +
    "</article>";
  }

  function renderProcessStep(step, index) {
    return '<li class="process-step reveal">' +
      '<span class="process-index">0' + (index + 1) + "</span>" +
      "<h3>" + esc(step.title) + "</h3>" +
      "<p>" + esc(step.text) + "</p>" +
    "</li>";
  }

  function renderTestimonial(item) {
    var badge = item.isSample && SITE.SHOW_SAMPLE_BADGE !== false
      ? '<span class="badge badge-sample" data-sample-badge>Sample</span>'
      : "";
    return '<figure class="quote-card reveal">' + badge +
      "<blockquote>" + esc(item.quote) + "</blockquote>" +
      '<figcaption data-initials="' + esc(initials(item.author)) + '"><strong>' + esc(item.author) +
      "</strong><span>" + esc(item.role) + "</span></figcaption>" +
    "</figure>";
  }

  function renderAll() {
    var projects = Array.isArray(SITE.projects) ? SITE.projects : [];
    if (projects.length) {
      var live = projects.filter(function (p) { return p.kind !== "demo"; });
      var demos = projects.filter(function (p) { return p.kind === "demo"; });

      var liveBox = $("#work-live");
      if (liveBox && live.length) {
        liveBox.innerHTML = live.map(function (p, i) {
          return renderCard(p, i >= VISIBLE_LIVE);
        }).join("");
      }

      var demoBox = $("#work-demos");
      if (demoBox && demos.length) {
        demoBox.innerHTML = demos.map(function (p) { return renderCard(p, false); }).join("");
      }
    }

    var servicesBox = $("#services-grid");
    if (servicesBox && Array.isArray(SITE.services) && SITE.services.length) {
      servicesBox.innerHTML = SITE.services.map(renderService).join("");
    }

    var processBox = $("#process-list");
    if (processBox && Array.isArray(SITE.process) && SITE.process.length) {
      processBox.innerHTML = SITE.process.map(renderProcessStep).join("");
    }

    var testimonialsSection = $("#testimonials");
    var testimonialsBox = $("#testimonials-grid");
    if (testimonialsSection) {
      if (SITE.SHOW_TESTIMONIALS === false) {
        testimonialsSection.hidden = true; // section can be turned off entirely
      } else if (testimonialsBox && Array.isArray(SITE.testimonials) && SITE.testimonials.length) {
        testimonialsBox.innerHTML = SITE.testimonials.map(renderTestimonial).join("");
      }
    }

    // Availability text
    $$("[data-site='availability']").forEach(function (el) {
      if (SITE.availability) el.textContent = SITE.availability;
    });
  }

  /* ======================================================================
     3. CONTACT DETAILS FROM CONFIG
     ====================================================================== */
  function applyContactDetails() {
    if (SITE.whatsapp || SITE.whatsappText) {
      $$('a[href^="https://wa.me/"]').forEach(function (a) { a.href = waLink(); });
    }
    if (SITE.email) {
      $$('a[href^="mailto:"]').forEach(function (a) {
        var subject = "Website project enquiry";
        // Keep the existing subject if one was set in the markup.
        var current = a.getAttribute("href") || "";
        var match = current.match(/subject=([^&]+)/);
        if (match) subject = decodeURIComponent(match[1]);
        a.href = "mailto:" + SITE.email + "?subject=" + encodeURIComponent(subject);
      });
      $$("[data-site='email']").forEach(function (el) { el.textContent = SITE.email; });
    }
    if (SITE.linkedin) {
      $$('a[href*="linkedin.com"]').forEach(function (a) { a.href = SITE.linkedin; });
    }
    var year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ======================================================================
     4. THEME TOGGLE
     ====================================================================== */
  function initTheme() {
    var toggle = $("#theme-toggle");
    if (!toggle) return;

    function label() {
      var isDark = root.getAttribute("data-theme") === "dark";
      toggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
      toggle.setAttribute("aria-pressed", isDark ? "false" : "true");
    }
    label();

    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* storage blocked */ }
      label();
    });
  }

  /* ======================================================================
     5. STICKY HEADER
     ====================================================================== */
  function initHeaderState() {
    var header = $("#site-header");
    if (!header) return;
    var ticking = false;

    function update() {
      if (window.scrollY > 12) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ======================================================================
     6. MOBILE NAVIGATION
     ====================================================================== */
  function initNav() {
    var toggle = $("#nav-toggle");
    var nav = $("#primary-nav");
    if (!toggle || !nav) return;

    var focusable = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      doc.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) {
        // Small delay so the panel is visible, and so the click has finished
        // focusing the toggle, before focus moves into the menu.
        window.setTimeout(function () {
          var first = nav.querySelector(focusable);
          if (first) first.focus();
        }, 80);
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close after choosing a link, and when clicking outside the panel
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    doc.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !toggle.contains(e.target)) {
        setOpen(false);
      }
    });

    // Escape closes; Tab is trapped inside the open panel
    doc.addEventListener("keydown", function (e) {
      if (!nav.classList.contains("is-open")) return;

      if (e.key === "Escape") {
        setOpen(false);
        toggle.focus();
        return;
      }
      if (e.key === "Tab") {
        var items = $$(focusable, nav).filter(function (el) { return el.offsetParent !== null; });
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (e.shiftKey && doc.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && doc.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Reset state when the viewport grows past the mobile breakpoint
    window.matchMedia("(min-width: 901px)").addEventListener("change", function (e) {
      if (e.matches) setOpen(false);
    });
  }

  /* ======================================================================
     7. ACTIVE NAV LINK
     ====================================================================== */
  function initScrollSpy() {
    var links = $$(".nav-link");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href");
      if (id && id.charAt(0) === "#") map[id.slice(1)] = a;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
        var link = map[entry.target.id];
        if (link) {
          link.classList.add("is-active");
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    Object.keys(map).forEach(function (id) {
      var section = doc.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ======================================================================
     8. SCROLL REVEAL
     ====================================================================== */
  function initReveal() {
    var items = $$(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    // Small stagger inside grids so cards arrive one after another.
    [".work-grid", ".services-grid", ".testimonials-grid",
     ".process-list", ".highlight-row"].forEach(function (groupSel) {
      $$(groupSel).forEach(function (group) {
        $$(".reveal", group).forEach(function (el, i) {
          el.style.setProperty("--reveal-delay", Math.min(i * 70, 350) + "ms");
        });
      });
    });

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ======================================================================
     8b. PROCESS CONNECTOR LINE
     ----------------------------------------------------------------------
     The line is a CSS pseudo-element that scales into view when the
     timeline first appears on screen.
     ====================================================================== */
  function initProcessLine() {
    var list = $("#process-list");
    if (!list) return;

    if (!("IntersectionObserver" in window) || reduceMotion) {
      list.classList.add("is-drawn");
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-drawn");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    observer.observe(list);
  }

  /* ======================================================================
     9. COUNTERS
     ====================================================================== */
  function initCounters() {
    var counters = $$(".counter");
    if (!counters.length) return;

    function run(el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      if (reduceMotion) { el.textContent = target; return; }
      var start = null;
      var duration = 1100;

      function step(now) {
        if (start === null) start = now;
        var progress = Math.min((now - start) / duration, 1);
        // ease-out for a soft landing
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) window.requestAnimationFrame(step);
        else el.textContent = target;
      }
      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(run);
      return;
    }
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ======================================================================
     10. EXPAND LIVE SITES
     ====================================================================== */
  function initWorkToggle() {
    var btn = $("#work-toggle");
    var grid = $("#work-live");
    if (!btn || !grid) return;

    if (!$$(".is-extra", grid).length) {
      var wrap = $("#work-more-wrap");
      if (wrap) wrap.hidden = true;
      return;
    }

    var label = $(".btn-label", btn);
    btn.addEventListener("click", function () {
      var open = grid.classList.toggle("is-expanded");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.classList.toggle("is-open", open);
      if (label) label.textContent = open ? "Show fewer live sites" : "Show more live sites";
    });
  }

  /* ======================================================================
     11. BACK TO TOP
     ====================================================================== */
  function initBackToTop() {
    var btn = $("#to-top");
    if (!btn) return;
    var ticking = false;

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        btn.classList.toggle("is-visible", window.scrollY > 500);
        ticking = false;
      });
    }, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      var logo = $(".logo");
      if (logo) logo.focus({ preventScroll: true });
    });
  }

  /* ======================================================================
     12. CONTACT FORM
     ----------------------------------------------------------------------
     - validates in the browser with friendly inline messages
     - posts JSON via fetch() to contact.php
     - falls back to a normal form post when fetch is unavailable
     ====================================================================== */
  function initForm() {
    var form = $("#contact-form");
    if (!form) return;

    var status = $("#form-status");
    var button = $("#submit-btn");
    var labelEl = button ? $(".btn-label", button) : null;
    var pageLoaded = Date.now();
    var csrfToken = null;
    var tokenRequested = false;

    // Ask the server for a CSRF token once, lazily, on first interaction.
    function fetchToken() {
      if (csrfToken || tokenRequested || !window.fetch) return;
      tokenRequested = true;
      fetch("contact.php?csrf=1", { credentials: "same-origin", headers: { Accept: "application/json" } })
        .then(function (r) { return r.json(); })
        .then(function (data) { if (data && data.token) csrfToken = data.token; })
        .catch(function () { /* form still works without a token */ });
    }
    form.addEventListener("focusin", fetchToken, { once: true });

    function setStatus(message, type) {
      if (!status) return;
      status.textContent = message;
      status.classList.remove("is-success", "is-error");
      if (type) status.classList.add("is-" + type);
    }

    function fieldError(input, message) {
      var field = input.closest(".field");
      var error = doc.getElementById(input.id + "-error");
      if (field) field.classList.toggle("has-error", Boolean(message));
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (error) {
        error.textContent = message || "";
        error.hidden = !message;
      }
      return !message;
    }

    function validate() {
      var name = $("#name");
      var email = $("#email");
      var message = $("#message");
      var ok = true;

      if (!name.value.trim() || name.value.trim().length < 2) {
        ok = fieldError(name, "Please tell me your name.") && ok;
      } else {
        fieldError(name, "");
      }

      var emailValue = email.value.trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue);
      if (!emailValue) ok = fieldError(email, "Please add an email address so I can reply.") && ok;
      else if (!emailOk) ok = fieldError(email, "That email address does not look right.") && ok;
      else fieldError(email, "");

      if (message.value.trim().length < 10) {
        ok = fieldError(message, "A sentence or two about the project helps — at least 10 characters.") && ok;
      } else {
        fieldError(message, "");
      }

      return ok;
    }

    // Clear a field's error as soon as the visitor starts fixing it.
    $$("input, textarea", form).forEach(function (input) {
      input.addEventListener("input", function () {
        if (input.id === "company") return;
        if (input.closest(".field") && input.closest(".field").classList.contains("has-error")) {
          fieldError(input, "");
        }
      });
    });

    form.addEventListener("submit", function (e) {
      if (!validate()) {
        e.preventDefault();
        var firstInvalid = form.querySelector(".has-error input, .has-error textarea");
        if (firstInvalid) firstInvalid.focus();
        setStatus("Please check the highlighted fields.", "error");
        return;
      }

      if (!window.fetch) return; // let the browser submit normally
      e.preventDefault();

      button.classList.add("is-loading");
      button.disabled = true;
      if (labelEl) labelEl.textContent = "Sending";
      setStatus("Sending your message…");

      var payload = new FormData(form);
      payload.append("elapsed", String(Date.now() - pageLoaded));
      if (csrfToken) payload.append("csrf_token", csrfToken);

      fetch("contact.php", {
        method: "POST",
        body: payload,
        credentials: "same-origin",
        headers: { "X-Requested-With": "XMLHttpRequest", Accept: "application/json" }
      })
        .then(function (response) {
          return response.json().catch(function () {
            throw new Error("Unexpected response from the server.");
          }).then(function (data) {
            if (!response.ok || !data.ok) throw new Error(data.error || "The message could not be sent.");
            return data;
          });
        })
        .then(function () {
          form.reset();
          setStatus("Thank you — your message is on its way. I usually reply within 24 hours.", "success");
        })
        .catch(function (error) {
          setStatus(
            (error && error.message ? error.message : "Something went wrong.") +
            " You can also email vaheedbasha882@gmail.com or message me on WhatsApp.",
            "error"
          );
        })
        .then(function () {
          button.classList.remove("is-loading");
          button.disabled = false;
          if (labelEl) labelEl.textContent = "Send message";
        });
    });
  }

  /* ======================================================================
     INIT
     ====================================================================== */
  function init() {
    renderAll();
    initWorkToggle();
    applyContactDetails();
    initTheme();
    initHeaderState();
    initNav();
    initScrollSpy();
    initReveal();
    initProcessLine();
    initCounters();
    initBackToTop();
    initForm();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})();
