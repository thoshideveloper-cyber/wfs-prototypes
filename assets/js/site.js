/* ==========================================================================
   The Weekend Film School — site behaviour
   Vanilla JS, no dependencies, no build step. Loaded after config.js.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.WFS || {};
  var LINKS = CFG.links || {};
  var FORMS = CFG.forms || {};

  /* ---------------------------------------------------------------- utils */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, className, html) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

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

  var MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  var DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  /** Long, human date: "Saturday 22 August 2026" */
  function longDate(iso) {
    var d = parseDate(iso);
    if (!d) return "";
    return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  /** Build a wa.me link with a pre-filled message. */
  function whatsapp(message) {
    var base = LINKS.whatsappEnquiry || "";
    if (!base) return "";
    var sep = base.indexOf("?") === -1 ? "?" : "&";
    return base + sep + "text=" + encodeURIComponent(message);
  }

  /** Best available contact link for an intent, WhatsApp first, then email. */
  function enquiryLink(message, subject) {
    var wa = whatsapp(message);
    if (wa) return wa;
    if (LINKS.email) {
      return "mailto:" + LINKS.email +
        "?subject=" + encodeURIComponent(subject || "Enquiry") +
        "&body=" + encodeURIComponent(message);
    }
    return "";
  }

  /* -------------------------------------------------------- workshop model */

  /** Normalise a workshop: derive status, seat copy, and the right CTA. */
  function decorate(w) {
    var o = Object.create(w);
    var seatsLeft = typeof w.seatsLeft === "number" ? w.seatsLeft : w.seats;

    o.status = (w.status === "open" && seatsLeft <= 0) ? "soldout" : (w.status || "open");
    o.seatsLeft = seatsLeft;
    o.dateObj = parseDate(w.date);
    o.isPast = o.dateObj ? o.dateObj < todayStart() : false;
    o.founding = w.standardPrice && w.price < w.standardPrice;

    switch (o.status) {
      case "soldout":
        o.seatCopy = "Sold out";
        o.seatClass = "is-closed";
        o.ctaLabel = "Sold out";
        o.ctaHref = "";
        break;
      case "waitlist":
        o.seatCopy = "Waitlist open";
        o.seatClass = "is-closed";
        o.ctaLabel = "Join waitlist";
        o.ctaHref = FORMS.waitlist || enquiryLink(
          "Hi! I'd like to join the waitlist for " + w.title + ".", "Waitlist · " + w.title);
        break;
      case "notify":
        o.seatCopy = "Booking opens soon";
        o.seatClass = "is-closed";
        o.ctaLabel = "Notify me";
        o.ctaHref = FORMS.notify || enquiryLink(
          "Hi! Please let me know when booking opens for " + w.title + ".", "Notify me · " + w.title);
        break;
      default:
        o.seatCopy = seatsLeft + (seatsLeft === 1 ? " seat left" : " seats left");
        o.seatClass = seatsLeft <= 5 ? "is-low" : "";
        o.ctaLabel = money(w.price) + " · Book";
        o.ctaHref = "book.html?w=" + encodeURIComponent(w.id);
    }
    return o;
  }

  function trackClass(track) {
    return track === "ai" ? "is-ai" : track === "gear" ? "is-gear" : "";
  }

  function workshopById(id) {
    var list = CFG.workshops || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return decorate(list[i]);
    var mc = CFG.masterclasses || [];
    for (var j = 0; j < mc.length; j++) if (mc[j].id === id) return decorate(mc[j]);
    return null;
  }

  /** Upcoming workshops, soonest first. */
  function upcoming() {
    return (CFG.workshops || [])
      .map(decorate)
      .filter(function (w) { return !w.isPast; })
      .sort(function (a, b) { return (a.dateObj || 0) - (b.dateObj || 0); });
  }

  /* ------------------------------------------------------------ rendering */

  function workshopRow(w) {
    var d = w.dateObj;
    var row = el("article", "row-item" + (w.isPast ? " is-past" : ""));

    var when = el("div", "row-when");
    if (d) {
      when.innerHTML =
        '<div class="d">' + d.getDate() + "</div>" +
        '<div class="m">' + MONTHS[d.getMonth()] + " · " + DAYS[d.getDay()] + "</div>";
    } else {
      when.innerHTML = '<div class="d">TBA</div><div class="m">' + esc(w.dayLabel || "") + "</div>";
    }

    var meta = [w.venue, w.time, w.seats ? w.seats + " seats" : ""]
      .filter(Boolean).map(esc).join(" · ");

    var body = el("div", "row-body");
    body.innerHTML =
      "<h3>" + esc(w.title) + "</h3>" +
      '<div class="meta">' + meta + "</div>" +
      (w.note ? '<div class="meta">' + esc(w.note) + "</div>" : "") +
      (w.badge ? '<span class="badge ' + trackClass(w.track) + '">' + esc(w.badge) + "</span>" : "");

    var act = el("div", "row-act");
    var seat = '<span class="seats ' + w.seatClass + '">' + esc(w.seatCopy) + "</span>";
    var cta;
    if (!w.ctaHref) {
      cta = '<span class="btn btn-ghost btn-sm" aria-disabled="true">' + esc(w.ctaLabel) + "</span>";
    } else {
      var external = w.ctaHref.indexOf("http") === 0 || w.ctaHref.indexOf("mailto:") === 0;
      cta = '<a class="btn ' + (w.status === "open" ? "btn-primary" : "btn-ghost") + ' btn-sm" href="' +
        esc(w.ctaHref) + '"' + (external ? ' target="_blank" rel="noopener"' : "") + ">" +
        esc(w.ctaLabel) + "</a>";
    }
    act.innerHTML = seat + cta;

    row.appendChild(when);
    row.appendChild(body);
    row.appendChild(act);
    return row;
  }

  function masterclassRow(m) {
    var w = decorate(m);
    var row = el("article", "row-item");
    row.innerHTML =
      '<div class="row-when"><div class="d">' + esc(w.day || "TBA") + '</div><div class="m">One day</div></div>' +
      '<div class="row-body">' +
        "<h3>" + esc(w.title) + "</h3>" +
        '<div class="meta">' + esc(w.teacher) + "</div>" +
        '<div class="meta">' + esc(w.summary) + "</div>" +
        '<span class="badge is-craft">Craft</span>' +
      "</div>" +
      '<div class="row-act">' +
        '<span class="seats is-closed">' + esc(w.seats ? w.seats + " seats" : "") + "</span>" +
        (w.ctaHref
          ? '<a class="btn btn-ghost btn-sm" href="' + esc(w.ctaHref) + '" target="_blank" rel="noopener">' +
            money(w.price) + " · " + esc(w.ctaLabel) + "</a>"
          : '<span class="btn btn-ghost btn-sm" aria-disabled="true">' + money(w.price) + "</span>") +
      "</div>";
    return row;
  }

  function renderLists() {
    $$("[data-render]").forEach(function (host) {
      var kind = host.getAttribute("data-render");
      var limit = parseInt(host.getAttribute("data-limit"), 10) || 0;
      var items = [];

      if (kind === "workshops") {
        items = upcoming();
        var filter = host.getAttribute("data-track");
        if (filter) items = items.filter(function (w) { return w.track === filter; });
        if (limit) items = items.slice(0, limit);
        items = items.map(workshopRow);
      } else if (kind === "masterclasses") {
        items = (CFG.masterclasses || []).map(masterclassRow);
      }

      host.innerHTML = "";
      if (!items.length) {
        host.appendChild(el("div", "empty-state",
          "Dates for the next batch are being confirmed. " +
          (LINKS.whatsappChannel
            ? 'Join the <a class="y" href="' + esc(LINKS.whatsappChannel) + '" target="_blank" rel="noopener">WhatsApp channel</a> and you will hear first.'
            : "Write to us and you will hear first.")));
        return;
      }
      items.forEach(function (node) { host.appendChild(node); });
    });
  }

  /** The "next Saturday" strip on the home page. */
  function renderNextUp() {
    var host = $("[data-next-up]");
    if (!host) return;
    var next = upcoming().filter(function (w) { return w.status === "open"; })[0];
    if (!next) { host.hidden = true; return; }

    host.innerHTML =
      '<div class="row-when"><div class="d">' + next.dateObj.getDate() + "</div>" +
      '<div class="m">' + MONTHS[next.dateObj.getMonth()] + " · " + DAYS[next.dateObj.getDay()] + "</div></div>" +
      '<div class="row-body"><h3>' + esc(next.title) + "</h3>" +
      '<div class="meta">' + esc(longDate(next.date)) + " · " + esc(next.time) + " · " + esc(next.venue) + "</div></div>" +
      '<div class="row-act"><span class="seats ' + next.seatClass + '">' + esc(next.seatCopy) + "</span>" +
      '<a class="btn btn-primary btn-sm" href="' + esc(next.ctaHref) + '">' + esc(next.ctaLabel) + "</a></div>";
    host.hidden = false;
  }

  /* -------------------------------------------------------- booking page */

  function renderBookingPage() {
    var page = $("[data-book-page]");
    if (!page) return;

    var id = new URLSearchParams(window.location.search).get("w");
    var w = id ? workshopById(id) : null;
    var missing = $("[data-book-missing]");
    var detail = $("[data-book-detail]");

    if (!w || w.status === "soldout" || w.isPast) {
      if (missing) missing.hidden = false;
      if (detail) detail.hidden = true;
      return;
    }
    if (missing) missing.hidden = true;
    if (detail) detail.hidden = false;

    document.title = "Book · " + w.title + " — The Weekend Film School";

    // Some fields (the title) appear twice on this page — fill every match.
    var set = function (sel, html) {
      $$(sel).forEach(function (n) { n.innerHTML = html; });
    };
    set("[data-book-title]", esc(w.title));
    set("[data-book-date]", esc(w.date ? longDate(w.date) : (w.dayLabel || "Dates announced soon")));
    set("[data-book-time]", esc(w.time || "10 AM to 7 PM"));
    set("[data-book-venue]", esc(w.venue || "Venue confirmed 3 days before"));
    set("[data-book-seats]", esc(w.seatCopy));
    set("[data-book-note]", esc(w.note || ""));
    set("[data-book-total]",
      (w.founding ? '<span class="strike">' + money(w.standardPrice) + "</span>" : "") + money(w.price));

    var track = $("[data-book-track]");
    if (track) {
      track.textContent = w.badge || "";
      track.className = "badge " + trackClass(w.track);
      track.hidden = !w.badge;
    }

    var payMessage =
      "Hi! I'd like to book a seat for " + w.title +
      (w.date ? " on " + longDate(w.date) : "") + " (" + money(w.price) + ").";

    var payBtn = $("[data-book-pay]");
    if (payBtn) {
      if (w.payLink) {
        payBtn.href = w.payLink;
        payBtn.target = "_blank";
        payBtn.rel = "noopener";
        payBtn.textContent = "Pay " + money(w.price) + " and confirm my seat";
      } else {
        var link = enquiryLink(payMessage, "Booking · " + w.title);
        payBtn.href = link || "#";
        payBtn.target = "_blank";
        payBtn.rel = "noopener";
        payBtn.textContent = "Reserve my seat on WhatsApp";
        var fallbackNote = $("[data-book-fallback]");
        if (fallbackNote) fallbackNote.hidden = false;
      }
    }
  }

  /* ---------------------------------------------------------------- forms
     Every form works with zero backend: it composes a WhatsApp / email
     message. If a Google Form URL is set in config.forms, we send people
     there instead.                                                        */

  function wireForms() {
    $$("form[data-form]").forEach(function (form) {
      var key = form.getAttribute("data-form");
      var status = $(".form-status", form);

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var external = FORMS[key];
        if (external) { window.open(external, "_blank", "noopener"); return; }

        var data = new FormData(form);
        var lines = [];
        $$("[name]", form).forEach(function (input) {
          var label = input.getAttribute("data-label") || input.name;
          var value = (data.get(input.name) || "").toString().trim();
          if (value) lines.push(label + ": " + value);
        });

        if (!lines.length) {
          if (status) { status.textContent = "Please fill in at least one field."; status.className = "form-status is-error"; }
          return;
        }

        var subject = form.getAttribute("data-subject") || "Enquiry";
        var link = enquiryLink(subject + "\n\n" + lines.join("\n"), subject);

        if (!link) {
          if (status) {
            status.textContent = "No contact channel is configured yet. Write to " + (LINKS.email || "us") + ".";
            status.className = "form-status is-error";
          }
          return;
        }

        window.open(link, "_blank", "noopener");
        if (status) {
          status.textContent = "Opening WhatsApp — press send and we will reply within a day.";
          status.className = "form-status";
        }
        form.reset();
      });
    });
  }

  /* ------------------------------------------------------- link injection
     Elements with data-link="key" get their href from config.links.
     If the link is empty, the element (or its [data-link-hide] ancestor)
     is removed, so the site never shows a dead link.                      */

  function injectLinks() {
    $$("[data-link]").forEach(function (node) {
      var key = node.getAttribute("data-link");
      var href = LINKS[key];
      if (key === "email" && href) href = "mailto:" + href;
      if (key === "whatsappEnquiry" && href) {
        href = whatsapp("Hi! I have a question about the film school weekend.") || href;
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
  }

  /* ------------------------------------------------------------ structure
     Event JSON-LD so upcoming Saturdays can surface in search results.    */

  function injectEventSchema() {
    if (!$("[data-render='workshops']")) return;
    var list = upcoming().filter(function (w) { return w.status === "open"; });
    if (!list.length) return;

    var brand = CFG.brand || {};
    var payload = list.map(function (w) {
      return {
        "@context": "https://schema.org",
        "@type": "Event",
        name: w.title + " — " + brand.name,
        startDate: w.date + "T10:00:00+05:30",
        endDate: w.date + "T19:00:00+05:30",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: w.venue || brand.city,
          address: { "@type": "PostalAddress", addressLocality: w.area || brand.city, addressRegion: "Telangana", addressCountry: "IN" }
        },
        organizer: { "@type": "Organization", name: brand.name, url: brand.url },
        offers: {
          "@type": "Offer",
          price: w.price,
          priceCurrency: "INR",
          availability: w.seatsLeft > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
          url: (brand.url || "") + "/book.html?w=" + w.id
        }
      };
    });

    var tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify(payload);
    document.head.appendChild(tag);
  }

  /* --------------------------------------------------------------- chrome */

  function wireNav() {
    var toggle = $(".nav-toggle");
    var nav = $("#site-nav");
    if (!toggle || !nav) return;

    var close = function () {
      toggle.setAttribute("aria-expanded", "false");
      nav.setAttribute("data-open", "false");
    };

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.setAttribute("data-open", String(!open));
    });

    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 900) close(); });
  }

  function markCurrentPage() {
    var page = document.body.getAttribute("data-page");
    if (!page) return;
    $$("#site-nav a[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === page) a.setAttribute("aria-current", "page");
    });
  }

  function wireReveal() {
    var nodes = $$("[data-reveal]");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach(function (n) { n.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function stampYear() {
    $$("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });
  }

  /* ------------------------------------------------------------------ go */

  function init() {
    injectLinks();
    wireNav();
    markCurrentPage();
    renderLists();
    renderNextUp();
    renderBookingPage();
    wireForms();
    injectEventSchema();
    wireReveal();
    stampYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
