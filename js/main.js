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
   10. Project filters
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

  /* ======================================================================
     2. CONTENT RENDERING
     ----------------------------------------------------------------------
     Each render function replaces the static fallback markup in index.html
     with the same structure built from SITE. If config.js is missing or a
     list is empty, the fallback markup stays untouched.
     ====================================================================== */
  function chips(tags) {
    if (!tags || !tags.length) return "";
    return '<ul class="chips" aria-label="Technologies used">' +
      tags.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") +
      "</ul>";
  }

  function imgPath(project) {
    return "images/projects/" + project.slug + ".webp";
  }

  function renderFeatured(project) {
    var c = project.case || {};
    var caseHtml = "";
    if (c.challenge || c.built || c.result) {
      caseHtml = '<dl class="case">' +
        (c.challenge ? "<div><dt>Challenge</dt><dd>" + esc(c.challenge) + "</dd></div>" : "") +
        (c.built ? "<div><dt>What I built</dt><dd>" + esc(c.built) + "</dd></div>" : "") +
        (c.result ? "<div><dt>Result</dt><dd>" + esc(c.result) + "</dd></div>" : "") +
        "</dl>";
    }

    return '<article class="proj reveal" data-type="' + esc(project.type) + '">' +
      '<div class="shot">' +
        '<div class="shot-fallback" aria-hidden="true">' +
          '<span class="shot-frame-bar"><i></i><i></i><i></i></span>' +
          '<span class="shot-fallback-name">' + esc(project.name) + "</span>" +
          '<span class="shot-fallback-note">Screenshot coming soon</span>' +
        "</div>" +
        '<img src="' + esc(imgPath(project)) + '" alt="' + esc(project.imageAlt || project.name) + '"' +
          ' width="1600" height="1000" loading="lazy" decoding="async"' + IMG_FALLBACK + ">" +
      "</div>" +
      '<div class="proj-body">' +
        '<p class="proj-meta"><span class="proj-cat">' + esc(project.category) + "</span>" +
          '<span class="sep" aria-hidden="true">·</span><span>' + esc(project.status || "Live") + "</span></p>" +
        "<h3>" + esc(project.name) + "</h3>" +
        "<p>" + esc(project.description) + "</p>" +
        chips(project.tags) +
        (project.role ? '<p class="proj-role"><span>My role:</span> ' + esc(project.role) + "</p>" : "") +
        caseHtml +
        '<a class="btn btn-ghost proj-link" href="' + esc(project.url) + '" target="_blank" rel="noopener noreferrer">' +
          "Visit live site" + arrowSvg +
        "</a>" +
      "</div>" +
    "</article>";
  }

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
  }

  function renderMini(project) {
    return '<article class="mini reveal" data-type="' + esc(project.type) + '">' +
      '<div class="mini-thumb">' +
        '<img src="' + esc(imgPath(project)) + '" alt="' + esc(project.imageAlt || project.name) + '"' +
          ' width="800" height="500" loading="lazy" decoding="async"' + IMG_FALLBACK + ">" +
        '<span class="mini-initial" aria-hidden="true">' + esc(initials(project.name)) + "</span>" +
      "</div>" +
      '<div class="mini-body">' +
        "<h4>" + esc(project.name) + "</h4>" +
        "<p>" + esc(project.description) + "</p>" +
        '<a class="text-link" href="' + esc(project.url) + '" target="_blank" rel="noopener noreferrer"' +
          ' aria-label="Visit the ' + esc(project.name) + ' website (opens in a new tab)">' +
          "Visit site" + '<span aria-hidden="true"> →</span>' +
        "</a>" +
      "</div>" +
    "</article>";
  }

  function renderDemo(project) {
    var isSoon = /soon/i.test(project.badge || "");
    return '<article class="demo reveal" data-type="' + esc(project.type) + '">' +
      '<div class="demo-head">' +
        '<span class="badge ' + (isSoon ? "badge-soon" : "badge-demo") + '">' + esc(project.badge || "Demo build") + "</span>" +
        '<span class="demo-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
      "</div>" +
      "<h4>" + esc(project.name) + "</h4>" +
      "<p>" + esc(project.description) + "</p>" +
      chips(project.tags) +
      '<a class="text-link" href="' + esc(project.url) + '" target="_blank" rel="noopener noreferrer"' +
        ' aria-label="' + esc(project.linkLabel || "Open demo") + " — " + esc(project.name) + ' (opens in a new tab)">' +
        esc(project.linkLabel || "Open demo") + '<span aria-hidden="true"> →</span>' +
      "</a>" +
    "</article>";
  }

  var SERVICE_ICONS = {
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    code: '<path d="m15 18 5-5-5-5"/><path d="m9 6-5 5 5 5"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0 5.1 5.1l-8.9 8.9a2.5 2.5 0 0 1-3.5-3.5l8.9-8.9"/><path d="M17.5 3.5 21 7"/>'
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
      var featured = projects.filter(function (p) { return p.kind === "featured"; });
      var more = projects.filter(function (p) { return p.kind === "more"; });
      var demos = projects.filter(function (p) { return p.kind === "demo"; });

      var featuredBox = $("#work-featured");
      if (featuredBox && featured.length) featuredBox.innerHTML = featured.map(renderFeatured).join("");

      var moreBox = $("#work-more");
      if (moreBox && more.length) moreBox.innerHTML = more.map(renderMini).join("");

      var demoBox = $("#work-demos");
      if (demoBox && demos.length) demoBox.innerHTML = demos.map(renderDemo).join("");
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
    var mobileToggle = $(".theme-toggle-mobile");
    if (!toggle && !mobileToggle) return;

    function setTheme(dark) {
      var next = dark ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* storage blocked */ }
      updateButtonLabels(dark);
    }

    function updateButtonLabels(isDark) {
      if (toggle) {
        toggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
        toggle.setAttribute("aria-pressed", isDark ? "false" : "true");
      }
      if (mobileToggle) {
        mobileToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
        mobileToggle.setAttribute("aria-pressed", isDark ? "false" : "true");
      }
    }

    function label() {
      var isDark = root.getAttribute("data-theme") === "dark";
      updateButtonLabels(isDark);
    }
    label();

    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem("theme", next); } catch (e) { /* storage blocked */ }
        label();
      });
    }
    if (mobileToggle) {
      mobileToggle.addEventListener("click", function () {
        var isDark = root.getAttribute("data-theme") !== "dark";
        setTheme(isDark);
      });
    }
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
    [".work-grid", ".mini-grid", ".demo-grid", ".services-grid", ".testimonials-grid",
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
     10. PROJECT FILTERS
     ====================================================================== */
  function initFilters() {
    var buttons = $$(".filter-btn");
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.getAttribute("data-filter");

        buttons.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", active ? "true" : "false");
        });

        $$("#work [data-type]").forEach(function (item) {
          var show = filter === "all" || item.getAttribute("data-type") === filter;
          item.classList.toggle("filtered-out", !show);
          if (show) item.classList.add("is-visible");
        });
      });
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
    applyContactDetails();
    initTheme();
    initHeaderState();
    initNav();
    initScrollSpy();
    initReveal();
    initProcessLine();
    initCounters();
    initFilters();
    initBackToTop();
    initForm();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})();
