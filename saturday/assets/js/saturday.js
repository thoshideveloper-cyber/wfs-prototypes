/* ==========================================================================
   The Weekend Film School. saturday/
   Everything on this page that is not CSS. Loaded after config.js.
   No framework, no SDK, no scroll listener.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.WFS || {};
  var BRAND = CFG.brand || {};
  var LINKS = CFG.links || {};
  var LANDING = CFG.landing || {};
  var BACKEND = CFG.backend || {};
  var SOFT_LAUNCH = LANDING.softLaunch !== false;
  var LIVE = !!(BACKEND.url && BACKEND.anonKey);

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------- helpers */

  function money(n) {
    if (n === 0) return "Free";
    return "₹" + Number(n).toLocaleString("en-IN");
  }

  function parseDate(iso) {
    if (!iso) return null;
    var d = new Date(iso + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  }

  function todayStart() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /* "Sat 22 Aug" for the seat bar, "Saturday 22 August" everywhere else.
     Assembled by hand because every locale puts a comma after the weekday. */
  function shortDate(iso) {
    var d = parseDate(iso);
    if (!d) return "";
    return [
      d.toLocaleDateString("en-IN", { weekday: "short" }),
      d.getDate(),
      d.toLocaleDateString("en-IN", { month: "short" })
    ].join(" ").replace(/,/g, "");
  }

  function longDate(iso) {
    var d = parseDate(iso);
    if (!d) return "";
    return [
      d.toLocaleDateString("en-IN", { weekday: "long" }),
      d.getDate(),
      d.toLocaleDateString("en-IN", { month: "long" })
    ].join(" ").replace(/,/g, "");
  }

  /* The placeholder number in config.js must never render as a real link.
     A missing button is better than one that goes nowhere. The pattern
     catches the +91 90000 00000 shape without the literal appearing here,
     so the pre-deploy grep for it stays clean. */
  function realWhatsApp() {
    var url = LINKS.whatsappEnquiry || "";
    if (!url) return "";
    var digits = url.replace(/\D/g, "");
    if (/^(?:91)?0*9?0{6,}/.test(digits)) return "";
    return url;
  }

  function whatsappWith(message) {
    var base = realWhatsApp();
    if (!base) return "";
    return base + (base.indexOf("?") === -1 ? "?" : "&") + "text=" + encodeURIComponent(message);
  }

  /* WhatsApp first, email second. Identical to the existing site, and it is
     what keeps a lead reachable while D9 holds the number back. */
  function enquiryLink(message, subject) {
    var wa = whatsappWith(message);
    if (wa) return wa;
    if (LINKS.email) {
      return "mailto:" + LINKS.email +
        "?subject=" + encodeURIComponent(subject || "The Weekend Film School") +
        "&body=" + encodeURIComponent(message);
    }
    return "";
  }

  /* ------------------------------------------------------ workshop model */

  /* Every config read is guarded. A malformed config.js must degrade to the
     "dates being confirmed" state, never throw. */
  function upcoming() {
    var list = CFG.workshops;
    if (Object.prototype.toString.call(list) !== "[object Array]") return [];
    var start = todayStart();
    return list
      .filter(function (w) {
        var d = parseDate(w && w.date);
        return d && d >= start;
      })
      .sort(function (a, b) { return parseDate(a.date) - parseDate(b.date); });
  }

  function openOnes() {
    return upcoming().filter(function (w) { return w.status === "open"; });
  }

  function nextOpen(track) {
    var list = openOnes();
    for (var i = 0; i < list.length; i++) {
      if (!track || list[i].track === track) return list[i];
    }
    return null;
  }

  function seatsLeftOf(w) {
    return typeof w.seatsLeft === "number" ? w.seatsLeft : w.seats;
  }

  /* --------------------------------------------------------------- links */

  function injectLinks() {
    $$("[data-link]").forEach(function (node) {
      var key = node.getAttribute("data-link");
      var href = key === "whatsappEnquiry" ? realWhatsApp() : LINKS[key];
      if (key === "email" && href) href = "mailto:" + href;
      if (key === "whatsappEnquiry" && href) {
        href = whatsappWith("Hi! I have a question about the Saturday film school day.") || href;
      }
      if (!href) {
        var wrap = node.closest("[data-link-hide]") || node;
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        return;
      }
      node.setAttribute("href", href);
      if (href.indexOf("http") === 0) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener");
      }
    });

    $$("[data-text]").forEach(function (node) {
      var key = node.getAttribute("data-text");
      if (LINKS[key]) node.textContent = LINKS[key];
    });

    $$("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });
  }

  /* -------------------------------------------------- canonical and social */

  function stampUrls() {
    var base = (BRAND.url || "").replace(/\/+$/, "");
    if (!base) return;
    var page = base + "/saturday/";
    var canonical = $("[data-canonical]");
    var ogUrl = $("[data-og-url]");
    var ogImage = $("[data-og-image]");
    if (canonical) canonical.setAttribute("href", page);
    if (ogUrl) ogUrl.setAttribute("content", page);
    if (ogImage) ogImage.setAttribute("content", page + "assets/img/og-cover.png");
  }

  /* ------------------------------------------------------- image slots
     Three states, one switch. A placeholder must read as deliberately
     reserved, never as broken, and it must hold the exact final ratio so
     the built layout is the final layout. */

  function fillSlots() {
    var slots = $$("[data-slot]");
    if (!slots.length) return;

    var wanted = LANDING.imagePlaceholders === true;
    if (wanted && !SOFT_LAUNCH) {
      // Going live cannot silently ship asset slugs to the public.
      window.console && console.error(
        "config.landing.imagePlaceholders must be false before softLaunch is. " +
        "Falling back to the type-only composition.");
      wanted = false;
    }
    if (!wanted) return;

    slots.forEach(function (host) {
      // The ratio is CSS's, keyed off data-ratio, so the frame cannot drift
      // from the label inside it or from the hero's mobile crop.
      var frame = document.createElement("div");
      frame.className = "slot";
      frame.setAttribute("aria-hidden", "true");
      frame.innerHTML =
        '<p class="slot__id"></p><p class="slot__alt"></p>';
      frame.firstChild.textContent =
        host.getAttribute("data-slot") + " · " + host.getAttribute("data-ratio");
      frame.lastChild.textContent = host.getAttribute("data-alt") || "";
      host.appendChild(frame);
    });
  }

  /* --------------------------------------------------------------- prices */

  function stampPrices() {
    var w = nextOpen("mobile") || nextOpen();
    if (!w) return;
    var founding = $("[data-founding-price]");
    var standard = $("[data-standard-price]");
    if (founding && typeof w.price === "number") founding.textContent = money(w.price);
    if (standard && typeof w.standardPrice === "number") standard.textContent = money(w.standardPrice);
  }

  /* ------------------------------------------------------------- seat bar
     Five states, all driven by config.js. No number is ever shown unless
     the founder has explicitly set seatsConfirmed: true. */

  /* Returns the line in parts so the area can be dropped by CSS on a narrow
     phone without the script guessing at the viewport. */
  function seatbarCopy() {
    var w = nextOpen();
    if (!w) return { parts: ["Dates for the next one are being confirmed"], dot: false };

    var when = shortDate(w.date);
    var left = seatsLeftOf(w);
    var area = w.area ? { area: w.area } : null;

    if (left === 0) {
      var after = openOnes().filter(function (x) { return seatsLeftOf(x) !== 0; })[0];
      return {
        parts: [when + " is full" + (after ? ". Next: " + shortDate(after.date) : "")],
        dot: false
      };
    }
    if (CFG.seatsConfirmed !== true) {
      return { parts: [when, area, money(w.price)].filter(Boolean), dot: false };
    }
    if (left <= 5) {
      return {
        parts: [when, left + (left === 1 ? " seat left" : " seats left")],
        dot: true
      };
    }
    return { parts: [when, area, left + " seats left"].filter(Boolean), dot: false };
  }

  function wireSeatbar() {
    var bar = $("#seatbar");
    var meta = $("[data-seatbar-meta]");
    var anchor = $("[data-seatbar-anchor]");
    var ask = $("#ask");
    if (!bar || !meta) return;

    var copy = seatbarCopy();
    meta.textContent = "";
    copy.parts.forEach(function (part, i) {
      var span = document.createElement("span");
      if (part && part.area) {
        span.className = "seatbar__area";
        span.textContent = (i ? " · " : "") + part.area;
      } else {
        span.textContent = (i ? " · " : "") + part;
      }
      meta.appendChild(span);
    });
    if (copy.dot) {
      var dot = document.createElement("span");
      dot.className = "seatbar__dot";
      dot.setAttribute("aria-hidden", "true");
      meta.insertBefore(dot, meta.firstChild);
    }

    if (!("IntersectionObserver" in window) || !anchor || !ask) return;

    var passedAnchor = false;
    var inAsk = false;
    var apply = function () {
      bar.classList.toggle("is-shown", passedAnchor && !inAsk);
    };

    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        passedAnchor = !e.isIntersecting && e.boundingClientRect.top < 0;
      });
      apply();
    }).observe(anchor);

    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { inAsk = e.isIntersecting; });
      apply();
    }, { rootMargin: "0px 0px -20% 0px" }).observe(ask);
  }

  /* ------------------------------------------------------------- the rail
     A4. It is navigation, and navigation must tell the truth about where you
     are without drawing attention to itself. */

  function wireRail() {
    var links = $$(".rail__link");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var rail = $(".rail");
    var bar = $("#seatbar");

    var targets = links.map(function (link) {
      return document.getElementById(link.getAttribute("href").slice(1));
    });

    var list = $(".rail__list");

    var setActive = function (index) {
      links.forEach(function (link, i) {
        if (i === index) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
      // Fill the spine down to the middle of the active tick.
      if (list) {
        var link = links[index];
        list.style.setProperty("--rail-progress",
          (link.offsetTop + link.offsetHeight / 2) + "px");
      }
      var host = targets[index] && targets[index].closest("[data-act]");
      var act = host ? host.getAttribute("data-act") : "day";
      if (rail) rail.setAttribute("data-act", act);
      if (bar) bar.setAttribute("data-act", act);
    };

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = targets.indexOf(e.target);
        if (i !== -1) setActive(i);
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });

    targets.forEach(function (t) { if (t) io.observe(t); });

    // The cut band is not a section and its surface is mid-crossfade, so no
    // label colour is readable on it. Hide the label while it is on screen.
    var band = $(".cut-band");
    if (!band || !rail) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { rail.classList.toggle("is-between", e.isIntersecting); });
    }, { rootMargin: "-50% 0px -50% 0px", threshold: 0 }).observe(band);
  }

  /* ---------------------------------------------------------- the strikes
     A1. The objection is literally being crossed out, so the motion is the
     meaning. Default is struck, so a failed script leaves them struck. */

  function wireStrikes() {
    var items = $$(".crossing");
    if (!items.length || REDUCED || !("IntersectionObserver" in window)) return;

    var host = $(".crossings");
    if (host) host.classList.add("js-strikes");

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-struck");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -15% 0px", threshold: 0.4 });

    items.forEach(function (n) { io.observe(n); });
  }

  /* ------------------------------------------------------- soft launch
     While the page is shared by hand it asks not to be indexed and emits no
     Course or FAQPage data, so it cannot compete with index.html. */

  function goLiveIfLive() {
    if (SOFT_LAUNCH) return;

    var tag = $("[data-soft-launch]");
    if (tag && tag.parentNode) tag.parentNode.removeChild(tag);

    var base = (BRAND.url || "").replace(/\/+$/, "");
    var page = base ? base + "/saturday/" : "";
    var blocks = [];

    var instances = openOnes()
      .filter(function (w) { return /^(10 AM to 7 PM)$/.test(w.time || ""); })
      .map(function (w) {
        return {
          "@type": "CourseInstance",
          courseMode: "Onsite",
          startDate: w.date + "T10:00:00+05:30",
          endDate: w.date + "T19:00:00+05:30",
          location: {
            "@type": "Place",
            name: w.area || BRAND.city,
            address: {
              "@type": "PostalAddress",
              addressLocality: w.area || BRAND.city,
              addressRegion: "Telangana",
              addressCountry: "IN"
            }
          },
          offers: {
            "@type": "Offer",
            price: w.price,
            priceCurrency: "INR",
            availability: seatsLeftOf(w) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/SoldOut"
          }
        };
      });

    if (instances.length) {
      blocks.push({
        "@context": "https://schema.org",
        "@type": "Course",
        name: "Make your first film in one day",
        description: "One Saturday in Hyderabad. You arrive knowing nobody, join a crew of five, and by 7 PM your film is on a screen with your name in the credits.",
        url: page || undefined,
        provider: {
          "@type": "EducationalOrganization",
          name: BRAND.name || "The Weekend Film School",
          url: base || undefined
        },
        hasCourseInstance: instances
      });
    }

    var faqs = $$(".qa__item").map(function (item) {
      return {
        "@type": "Question",
        name: $("h3", item).textContent.trim(),
        acceptedAnswer: {
          "@type": "Answer",
          text: $$("p", item).map(function (p) { return p.textContent.trim(); }).join(" ")
        }
      };
    });

    if (faqs.length) {
      blocks.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs });
    }

    blocks.forEach(function (block) {
      var tag = document.createElement("script");
      tag.type = "application/ld+json";
      tag.textContent = JSON.stringify(block);
      document.head.appendChild(tag);
    });
  }

  /* ------------------------------------------------------------ analytics
     No cookie, no third party, no IP. session_id dies with the tab. */

  var SESSION = (function () {
    try {
      var k = "wfs_s";
      var v = sessionStorage.getItem(k);
      if (!v) {
        v = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem(k, v);
      }
      return v;
    } catch (e) { return ""; }
  })();

  function track(name, props) {
    if (!LIVE) return;
    try {
      fetch(BACKEND.url.replace(/\/+$/, "") + "/rest/v1/events", {
        method: "POST",
        keepalive: true,
        headers: {
          apikey: BACKEND.anonKey,
          Authorization: "Bearer " + BACKEND.anonKey,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          name: name,
          props: props || null,
          session_id: SESSION,
          page_path: location.pathname
        })
      }).catch(function () {});
    } catch (e) {}
  }

  function wireTracking() {
    $$("[data-cta]").forEach(function (node) {
      node.addEventListener("click", function () {
        track("cta_click", { where: node.getAttribute("data-cta") });
      });
    });

    if (!("IntersectionObserver" in window)) return;

    var once = function (el, name) {
      if (!el) return;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          track(name);
          io.disconnect();
        });
      });
      io.observe(el);
    };

    once($(".hero"), "hero_seen");
    once($("#ask"), "reached_ask");
  }

  /* --------------------------------------------------------------- the ask */

  var PHONE_INPUT = /^(?:0|\+?91)?[6-9]\d{9}$/;

  function normalisePhone(raw) {
    var digits = String(raw || "").replace(/[\s\-()]/g, "");
    if (!PHONE_INPUT.test(digits)) return null;
    return "+91" + digits.replace(/\D/g, "").slice(-10);
  }

  function buildWhichChips() {
    var host = $("[data-which]");
    if (!host) return;

    var mobile = nextOpen("mobile");
    var ai = nextOpen("ai");
    var either = $(".chip", host);

    if (!mobile && !ai) {
      // No open batch. The chips collapse to one honest line and the form
      // still submits, with workshop_id null.
      var line = document.createElement("p");
      line.className = "chips__empty";
      line.textContent = "The next date is being confirmed";
      if (either) either.parentNode.removeChild(either);
      host.appendChild(line);
      var hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = "preference";
      hidden.value = "either";
      host.appendChild(hidden);
      return;
    }

    [
      { w: mobile, label: "Mobile", value: "mobile" },
      { w: ai, label: "AI", value: "ai" }
    ].forEach(function (opt) {
      if (!opt.w) return;
      var label = document.createElement("label");
      label.className = "chip";
      var text = opt.label + ", " + longDate(opt.w.date);
      label.innerHTML = '<input type="radio" name="preference"><span></span>';
      var input = label.firstChild;
      input.value = opt.value;
      input.setAttribute("data-id", opt.w.id);
      input.setAttribute("data-label", opt.w.title || text);
      label.lastChild.textContent = text;
      host.insertBefore(label, either);
    });

    $$('input[name="preference"]', host).forEach(function (input) {
      input.addEventListener("change", function () {
        track("date_selected", { id: input.getAttribute("data-id") || "either" });
      });
    });
  }

  function icsFor(w) {
    var date = (w.date || "").replace(/-/g, "");
    var stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    // 10:00 to 19:00 Asia/Kolkata, written in UTC so no VTIMEZONE is needed.
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//The Weekend Film School//saturday//EN",
      "BEGIN:VEVENT",
      "UID:" + (w.id || "wfs") + "@thenobodyclub.com",
      "DTSTAMP:" + stamp,
      "DTSTART:" + date + "T043000Z",
      "DTEND:" + date + "T133000Z",
      "SUMMARY:" + (w.title || "The Weekend Film School"),
      "DESCRIPTION:Ten in the morning to seven at night. By seven your film exists.",
      "LOCATION:" + (w.area || BRAND.city || "Hyderabad"),
      "END:VEVENT",
      "END:VCALENDAR"
    ];
    return lines.join("\r\n");
  }

  function showSuccess(form, data, workshop) {
    var panel = $("#lead-done");
    if (!panel) return;

    var dated = workshop && workshop.date;
    var heading = dated
      ? "Done. You are on the list for " + longDate(workshop.date) + "."
      : "Done. You are on the list.";
    var body = dated
      ? "We will message you on WhatsApp with the venue pin and a payment link. Usually the same day, always within one."
      : "We will message you on WhatsApp the moment the next date is fixed. You will hear before it goes public.";

    var message = "Hi! I just put my name down. " + data.name + ", " + data.phone_e164 +
      (workshop ? ". I want " + (workshop.title || workshop.id) + "." : ".");

    panel.innerHTML =
      '<h3 tabindex="-1"></h3><p></p><p class="done__actions"></p>';
    $("h3", panel).textContent = heading;
    $("p", panel).textContent = body;

    var actions = $(".done__actions", panel);

    if (dated) {
      var cal = document.createElement("a");
      cal.className = "btn";
      cal.textContent = "Add it to your calendar";
      cal.setAttribute("download", "weekend-film-school.ics");
      cal.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(icsFor(workshop));
      actions.appendChild(cal);
    }

    var reach = enquiryLink(message, "I put my name down");
    if (reach) {
      var link = document.createElement("a");
      link.className = "link";
      link.href = reach;
      link.textContent = "Message us now";
      if (reach.indexOf("http") === 0) { link.target = "_blank"; link.rel = "noopener"; }
      actions.appendChild(link);
    }

    form.hidden = true;
    panel.hidden = false;
    panel.setAttribute("role", "status");
    $("h3", panel).focus();
  }

  function wireForm() {
    var form = $("#lead-form");
    if (!form) return;

    var name = $("#lead-name");
    var phone = $("#lead-phone");
    var alertBox = $("#lead-alert");
    var submit = $(".form__submit", form);
    var tsField = form.elements.ts;
    var started = 0;

    var setError = function (input, message) {
      var box = document.getElementById(input.id + "-error");
      if (box) box.textContent = message || "";
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
      return !message;
    };

    var checkName = function () {
      var value = (name.value || "").trim();
      if (!value) return setError(name, "We need something to call you.");
      if (value.length < 2) return setError(name, "That is a bit short. Two letters at least.");
      return setError(name, "");
    };

    var checkPhone = function () {
      var value = (phone.value || "").trim();
      if (!value) return setError(phone, "We need a number to send the venue pin to.");
      if (!normalisePhone(value)) {
        return setError(phone,
          "That does not look like an Indian mobile number. Ten digits, starting with 6, 7, 8 or 9.");
      }
      return setError(phone, "");
    };

    // On blur and on submit, never on keystroke.
    name.addEventListener("blur", checkName);
    phone.addEventListener("blur", checkPhone);

    form.addEventListener("input", function () {
      if (started) return;
      started = Date.now();
      if (tsField) tsField.value = String(started);
      track("form_start");
    }, { once: false });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (alertBox) alertBox.textContent = "";

      var okName = checkName();
      var okPhone = checkPhone();
      if (!okName || !okPhone) {
        (okName ? phone : name).focus();
        track("form_submit_error", { code: "validation" });
        return;
      }

      var picked = form.querySelector('input[name="preference"]:checked') ||
                   form.querySelector('input[name="preference"]');
      var experience = form.querySelector('input[name="experience"]:checked');
      var workshopId = picked ? picked.getAttribute("data-id") : null;
      var workshop = workshopId
        ? openOnes().filter(function (w) { return w.id === workshopId; })[0]
        : nextOpen();

      var params = new URLSearchParams(location.search);
      var utm = {};
      params.forEach(function (value, key) {
        if (key.indexOf("utm_") === 0) utm[key] = value.slice(0, 120);
      });

      var payload = {
        name: (name.value || "").trim(),
        phone_e164: normalisePhone(phone.value),
        workshop_id: workshop ? workshop.id : null,
        workshop_label: workshop ? (workshop.title || null) : null,
        preference: picked ? picked.value : "either",
        experience: experience ? experience.value : null,
        source: (params.get("src") || "").slice(0, 60) || null,
        utm: Object.keys(utm).length ? utm : null,
        page_path: location.pathname
      };

      // A bot fills the hidden field, and a human cannot submit in under two
      // and a half seconds. Both are reported as success so nothing is learnt.
      var trap = form.elements.hp_company && form.elements.hp_company.value;
      var tooFast = started && Date.now() - started < 2500;
      if (trap || tooFast) { showSuccess(form, payload, workshop); return; }

      if (!LIVE) {
        // No backend configured. Exactly what the current site does: the
        // submit becomes the message, and nobody sees an error.
        var compose = enquiryLink(
          "Hi! Put my name down. " + payload.name + ", " + payload.phone_e164 +
          (workshop ? ". I want " + (workshop.title || workshop.id) + "." : "."),
          "Put my name down");
        track("whatsapp_fallback");
        if (compose) window.open(compose, "_blank", "noopener");
        showSuccess(form, payload, workshop);
        return;
      }

      var controller = ("AbortController" in window) ? new AbortController() : null;
      var timer = setTimeout(function () { controller && controller.abort(); }, 8000);

      submit.setAttribute("aria-busy", "true");
      submit.classList.add("btn--busy");
      submit.textContent = "Sending";
      submit.insertAdjacentHTML("beforeend", '<span class="btn__bar"></span>');
      $$("input, button", form).forEach(function (n) { n.disabled = true; });
      var startedAt = Date.now();

      var finish = function (fn) {
        // A state nobody can see is not a state. Hold it for 400ms.
        var wait = Math.max(0, 400 - (Date.now() - startedAt));
        setTimeout(fn, wait);
      };

      var restore = function () {
        clearTimeout(timer);
        submit.removeAttribute("aria-busy");
        submit.classList.remove("btn--busy");
        submit.textContent = "Put my name down";
        $$("input, button", form).forEach(function (n) { n.disabled = false; });
      };

      var fail = function (code, message) {
        finish(function () {
          restore();
          track("form_submit_error", { code: code });
          if (!alertBox) return;
          alertBox.textContent = message;
          alertBox.focus();
          var reach = enquiryLink(
            "Hi! Put my name down. " + payload.name + ", " + payload.phone_e164 + ".",
            "Put my name down");
          if (reach) {
            var link = document.createElement("a");
            link.className = "link";
            link.href = reach;
            link.textContent = " Message us instead.";
            if (reach.indexOf("http") === 0) { link.target = "_blank"; link.rel = "noopener"; }
            alertBox.appendChild(link);
            track("whatsapp_fallback");
          }
        });
      };

      fetch(BACKEND.url.replace(/\/+$/, "") + "/rest/v1/leads", {
        method: "POST",
        signal: controller ? controller.signal : undefined,
        headers: {
          apikey: BACKEND.anonKey,
          Authorization: "Bearer " + BACKEND.anonKey,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(payload)
      }).then(function (response) {
        clearTimeout(timer);
        // 409 is a duplicate. From the person's side they are on the list.
        if (response.status === 201 || response.status === 204 || response.status === 409) {
          finish(function () {
            restore();
            track("form_submit_ok");
            showSuccess(form, payload, workshop);
          });
          return;
        }
        return response.text().then(function (body) {
          if (response.status === 400 && body.indexOf("rate_limited") !== -1) {
            fail("rate_limited",
              "That is a few too many in one go. Message us on WhatsApp and we will put you down by hand.");
            return;
          }
          fail("http_" + response.status,
            "That did not send. Two options: try again, or just message us on WhatsApp and we will put you down manually.");
        });
      }).catch(function () {
        fail("network",
          "That did not send. Two options: try again, or just message us on WhatsApp and we will put you down manually.");
      });
    });
  }

  /* --------------------------------------------------------- real images
     Only runs once a slot has a real src. The Cut block is fetched early
     because a blank rectangle at the moment of the cut would break the
     page's one big idea. */

  function preloadTheCut() {
    var frame = $('[data-slot="the-cut-6-14"] img');
    var shoot = $("#shoot");
    if (!frame || !shoot || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        frame.setAttribute("loading", "eager");
        frame.setAttribute("fetchpriority", "high");
        io.disconnect();
      });
    }, { rootMargin: "0px 0px 40% 0px" });
    io.observe(shoot);
  }

  /* ------------------------------------------------------------------ go */

  function init() {
    injectLinks();
    stampUrls();
    fillSlots();
    stampPrices();
    buildWhichChips();
    wireSeatbar();
    wireRail();
    wireStrikes();
    wireForm();
    wireTracking();
    preloadTheCut();
    goLiveIfLive();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
