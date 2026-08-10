/* =============================================================================
   THE WEEKEND FILM SCHOOL — PROTOTYPE 2

   Rules this file obeys, inherited from the existing site:
   - Nothing here is required for the page to work. Turn JavaScript off and the
     page is complete: real dates are in the HTML, the FAQ is <details>, and the
     form falls back to a WhatsApp message composed by the browser.
   - `seatsConfirmed` is respected. Seat counts never render while it is false.
   - Anything dated in the past disappears by itself.

   ONE KNOWN CORRECTION. config.js still carries time: "10 AM to 7 PM" on every
   workshop. The operations note of 8 August moved the day to a noon start, and
   this page says twelve noon to seven. Rather than print a time we know is
   wrong, the renderer below substitutes DAY_TIME and ignores the config field.
   Fix config.js and delete DAY_TIME.
   ============================================================================= */
(function () {
  'use strict';

  var DAY_TIME = '12 noon to 7 PM';
  var CFG = window.WFS || {};
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Everything the stylesheet hides is hidden behind .js, so this line is what
     licenses the animation. No script, no hiding. */
  document.documentElement.classList.add('js');

  /* ---------------------------------------------------------------- dates -- */
  function money(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

  function upcoming() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    return (CFG.workshops || [])
      .filter(function (w) {
        return w.date && new Date(w.date) >= today && w.status !== 'soldout';
      })
      .sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
  }

  function renderDates() {
    var host = document.querySelector('[data-dates]');
    var list = upcoming().filter(function (w) { return w.price <= 3000; }).slice(0, 3);
    if (!host || !list.length) return;   // keep the hand-written fallback

    host.innerHTML = list.map(function (w) {
      var d = new Date(w.date);
      var day = String(d.getDate()).padStart(2, '0');
      var mon = d.toLocaleString('en-GB', { month: 'short' });
      var wd = d.toLocaleString('en-GB', { weekday: 'short' });
      var founding = w.price < w.standardPrice;
      var label = w.status === 'notify' ? 'Opens later' : money(w.price) + (founding ? ' founding' : '');
      // seat counts stay hidden until they are genuinely real
      var seats = CFG.seatsConfirmed && w.seatsLeft > 0 ? w.seatsLeft + ' seats left' : '';
      return '' +
        '<li class="dt">' +
          '<span class="dt__d">' + day + '<small>' + mon + ' · ' + wd + '</small></span>' +
          '<div><h3>' + w.title + '</h3><p>' + w.area + ' · ' + DAY_TIME +
            (w.note ? ' · ' + w.note.replace(/^Founding price\.\s*/, '') : '') + '</p></div>' +
          '<span class="dt__act"><span class="pill">' + label + '</span>' +
            (seats ? '<span class="data">' + seats + '</span>' : '') +
          '</span>' +
        '</li>';
    }).join('');

    // the nav fact and the hero price line, from the same source
    var next = list[0];
    var fact = document.querySelector('[data-next-fact]');
    if (fact && next) {
      var nd = new Date(next.date);
      fact.textContent = next.area + ' · ' +
        nd.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    }
    var price = document.querySelector('[data-price-line]');
    if (price && next) {
      price.textContent = next.price < next.standardPrice
        ? money(next.price) + ' founding price · first two batches only'
        : money(next.price) + ' · ' + DAY_TIME;
    }

    var sel = document.querySelector('[data-day-options]');
    if (sel) {
      sel.innerHTML = list.map(function (w) {
        var d = new Date(w.date);
        return '<option>' + d.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) +
          ' · ' + w.badge + ' · ' + money(w.price) + '</option>';
      }).join('') + '<option>Either — tell me what is open</option>';
    }
  }

  /* ----------------------------------------------------------------- form --
     No backend keys on this page yet, so the form composes a WhatsApp message,
     exactly as the rest of the site already degrades.                        */
  function wireForm() {
    var form = document.querySelector('[data-form]');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#p2-name');
      var phone = form.querySelector('#p2-phone');
      var day = form.querySelector('#p2-day');
      var bad = null;
      if (!name.value.trim()) bad = name;
      else if (!/^[0-9+\s-]{10,15}$/.test(phone.value.trim())) bad = phone;
      if (bad) { bad.focus(); bad.style.borderColor = '#B0341F'; return; }

      var wa = (CFG.links && CFG.links.whatsappEnquiry) || '';
      var text = encodeURIComponent(
        'Hi — putting my name down for the Weekend Film School.\n' +
        'Name: ' + name.value.trim() + '\n' +
        'Number: ' + phone.value.trim() + '\n' +
        'Day: ' + day.value
      );
      form.classList.add('is-done');
      if (wa && wa.indexOf('919000000000') === -1) window.open(wa + '?text=' + text, '_blank', 'noopener');
    });
  }

  /* --------------------------------------------------------------- motion --
     Two behaviours only: things rise once as they arrive, and the five lanes
     converge exactly once. Anything already on screen is shown immediately, and
     a timer releases everything if the observer never fires, so no content can
     get stuck invisible.                                                      */
  function wireMotion() {
    if (reduced || !('IntersectionObserver' in window)) return;  // CSS default is the finished state

    var join = document.querySelector('[data-join]');
    var targets = [].slice.call(document.querySelectorAll('.rise, .stagger'));

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -6% 0px' });

    targets.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
    // release valve: content can never stay hidden because an observer misfired
    setTimeout(function () {
      targets.forEach(function (el) { el.classList.add('is-in'); });
    }, 6000);

    /* The convergence. Push the five apart only once we know they are still
       below the fold, so the reader always sees them separate first and then
       watches them join. Already on screen at load? Leave them joined. */
    if (join && join.getBoundingClientRect().top > window.innerHeight) {
      join.classList.add('is-apart');
      var jio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          setTimeout(function () { join.classList.remove('is-apart'); }, 420);
          jio.disconnect();
        });
      }, { rootMargin: '0px 0px -24% 0px' });
      jio.observe(join);
      setTimeout(function () { join.classList.remove('is-apart'); }, 9000);
    }
  }

  /* --------------------------------------------------------------- dialogs --
     The disclosure pattern for every site: [data-dialog-open="id"] opens
     #id, [data-dialog-close] closes the dialog it sits inside. Native <dialog>
     already does focus trapping, Escape, returning focus to the opener and
     making the rest of the page inert, so none of that is rebuilt here. All
     this adds is backdrop-click-to-close and a no-support fallback.          */
  function wireDialogs() {
    var supported = typeof HTMLDialogElement === 'function' &&
                    typeof document.createElement('dialog').showModal === 'function';

    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-dialog-open]');
      if (opener) {
        var dlg = document.getElementById(opener.getAttribute('data-dialog-open'));
        if (!dlg) return;
        if (!supported) return;            // no dialog support: the link/anchor still works
        e.preventDefault();
        dlg.showModal();
        return;
      }
      var closer = e.target.closest('[data-dialog-close]');
      if (closer) {
        var owner = closer.closest('dialog');
        if (owner) {
          // an anchor inside the sheet should still navigate after closing
          if (closer.tagName === 'A') { owner.close(); return; }
          e.preventDefault();
          owner.close();
        }
      }
    });

    // click the backdrop, not the sheet, to dismiss
    [].forEach.call(document.querySelectorAll('dialog'), function (dlg) {
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg) dlg.close();
      });
    });

    /* Without <dialog>, the sheet has to remain reachable. Show it inline at
       the bottom of the page rather than leaving a dead button. */
    if (!supported) {
      [].forEach.call(document.querySelectorAll('dialog'), function (dlg) {
        dlg.setAttribute('open', '');
        dlg.style.position = 'static';
        dlg.style.width = '100%';
        dlg.style.maxHeight = 'none';
      });
    }
  }

  /* ------------------------------------------------------------- hero pan --
     The photograph sits a layer behind the type and moves slower than it, so
     the copy reads as raised off the image rather than printed on it. One
     transform, rAF-throttled, and only while the hero is on screen.          */
  function wireHeroPan() {
    var img = document.querySelector('[data-pan]');
    var hero = document.querySelector('.hero');
    if (!img || !hero || reduced) return;
    var ticking = false;
    function update() {
      var r = hero.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        var seen = Math.min(1, Math.max(0, -r.top / r.height));
        img.style.setProperty('--pan', (seen * 46).toFixed(1) + 'px');
      }
      ticking = false;
    }
    addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  function init() { renderDates(); wireForm(); wireDialogs(); wireMotion(); wireHeroPan(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
