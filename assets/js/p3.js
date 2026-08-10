/* =============================================================================
   THE WEEKEND FILM SCHOOL — PROTOTYPE 3

   Rules inherited from the rest of the site, unchanged:
   - Nothing here is required for the page to work. Turn JavaScript off and the
     page is complete: real dates are in the HTML, the FAQ is <details>, the
     schedule sheet renders inline, and the form composes a WhatsApp message.
   - Every hidden state is behind the .js class this file adds, so a failed
     script can never blank a section.
   - `seatsConfirmed` is respected. Seat counts never render while it is false.
   - Anything dated in the past disappears by itself.

   ONE KNOWN CORRECTION, carried over from prototype 2. config.js still says
   time: "10 AM to 7 PM" on every workshop. The operations note moved the day to
   a noon start. Rather than print a time we know is wrong, this file substitutes
   DAY_TIME and ignores the config field. Correct config.js and delete DAY_TIME.
   ============================================================================= */
(function () {
  'use strict';

  var DAY_TIME = '12 noon to 7 PM';
  var CFG = window.WFS || {};
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('js');

  /* ---------------------------------------------------------------- dates -- */
  function money(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

  function upcoming() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    return (CFG.workshops || [])
      .filter(function (w) { return w.date && new Date(w.date) >= today && w.status !== 'soldout'; })
      .sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
  }

  function renderDates() {
    var host = document.querySelector('[data-dates]');
    var list = upcoming().filter(function (w) { return w.price <= 3000; }).slice(0, 3);
    if (!host || !list.length) return;          // keep the hand-written fallback

    host.innerHTML = list.map(function (w) {
      var d = new Date(w.date);
      var day = String(d.getDate()).padStart(2, '0');
      var mon = d.toLocaleString('en-GB', { month: 'short' });
      var wd = d.toLocaleString('en-GB', { weekday: 'short' });
      var founding = w.price < w.standardPrice;
      var label = w.status === 'notify' ? 'Opens later' : money(w.price) + (founding ? ' founding' : '');
      var seats = CFG.seatsConfirmed && w.seatsLeft > 0 ? w.seatsLeft + ' seats left' : '';
      return '' +
        '<li class="dt">' +
          '<span class="dt__d display">' + day + '<small class="data">' + mon + ' · ' + wd + '</small></span>' +
          '<div><h3 class="display">' + w.title + '</h3><p>' + w.area + ' · ' + DAY_TIME +
            (w.note ? ' · ' + w.note.replace(/^Founding price\.\s*/, '') : '') + '</p></div>' +
          '<span class="dt__act"><span class="data pill">' + label + '</span>' +
            (seats ? '<span class="data">' + seats + '</span>' : '') +
          '</span>' +
        '</li>';
    }).join('');

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

  /* --------------------------------------------------------------- credit --
     THE SIGNATURE. Both credit lines on the page are blank until the visitor
     types their name into the booking form, and then they fill together. The
     hint under the big one changes with them, because a label that still says
     "this is blank" once it is not blank would be lying.
     The fill is blur-masked in CSS so it reads as one transformation rather
     than as two overlapping pieces of text.                                  */
  function wireCredit() {
    var input = document.querySelector('[data-credit-input]');
    var slots = [].slice.call(document.querySelectorAll('[data-credit]'));
    var hint = document.querySelector('[data-credit-hint]');
    if (!input || !slots.length) return;

    var blank = hint ? hint.textContent : '';
    var filled = 'That is what the last four seconds of your film look like. ' +
                 'The rest of it is a Saturday away.';

    function paint() {
      var name = input.value.trim().replace(/\s+/g, ' ').slice(0, 34);
      slots.forEach(function (slot) {
        var out = slot.querySelector('[data-credit-name]');
        if (out) out.textContent = name;
        if (name) slot.setAttribute('data-has-name', '');
        else slot.removeAttribute('data-has-name');
      });
      if (hint) hint.textContent = name ? filled : blank;
    }
    input.addEventListener('input', paint);
    paint();                                   // survives a browser-restored value
  }

  /* ----------------------------------------------------------------- form --
     No backend keys on this page, so the form composes a WhatsApp message,
     exactly as the rest of the site already degrades.                        */
  function wireForm() {
    var form = document.querySelector('[data-form]');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#p3-name');
      var phone = form.querySelector('#p3-phone');
      var day = form.querySelector('#p3-day');
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

  /* -------------------------------------------------------------- dialogs --
     [data-dialog-open="id"] opens #id, [data-dialog-close] closes its own
     dialog. Native <dialog> already gives focus trapping, Escape, returning
     focus to the opener and inerting the page, so none of that is rebuilt.
     This adds two things only: click-the-backdrop, and an inline fallback so
     the button is never dead where <dialog> is unsupported.                  */
  function wireDialogs() {
    var supported = typeof HTMLDialogElement === 'function' &&
                    typeof document.createElement('dialog').showModal === 'function';

    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-dialog-open]');
      if (opener) {
        var dlg = document.getElementById(opener.getAttribute('data-dialog-open'));
        if (!dlg || !supported) return;
        e.preventDefault();
        dlg.showModal();
        return;
      }
      var closer = e.target.closest('[data-dialog-close]');
      if (closer) {
        var owner = closer.closest('dialog');
        if (!owner) return;
        if (closer.tagName === 'A') { owner.close(); return; }   // still navigates
        e.preventDefault();
        owner.close();
      }
    });

    [].forEach.call(document.querySelectorAll('dialog'), function (dlg) {
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    });

    if (!supported) {
      [].forEach.call(document.querySelectorAll('dialog'), function (dlg) {
        dlg.setAttribute('open', '');
        dlg.style.position = 'static';
        dlg.style.width = '100%';
        dlg.style.maxHeight = 'none';
      });
    }
  }

  /* --------------------------------------------------------------- motion --
     Things rise once as they arrive, and the cast closes exactly once.
     Anything already on screen shows immediately, and a release timer reveals
     everything if an observer never fires, so no content can get stuck.      */
  function wireMotion() {
    if (reduced || !('IntersectionObserver' in window)) return;   // CSS default is the end state

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
    setTimeout(function () {
      targets.forEach(function (el) { el.classList.add('is-in'); });
    }, 6000);

    /* The cast closes into one block. Only push the five apart if they are
       still below the fold, so the reader always sees them separate first and
       then watches them join. Already on screen? Leave them joined. */
    var cast = document.querySelector('[data-cast]');
    if (cast && cast.getBoundingClientRect().top > window.innerHeight) {
      cast.classList.add('is-apart');
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          setTimeout(function () { cast.classList.remove('is-apart'); }, 420);
          cio.disconnect();
        });
      }, { rootMargin: '0px 0px -26% 0px' });
      cio.observe(cast);
      setTimeout(function () { cast.classList.remove('is-apart'); }, 9000);
    }
  }

  /* ------------------------------------------------------------- hero pan --
     The photograph moves slower than the type in front of it, so the copy
     reads as raised off the image rather than printed on it. One transform,
     rAF-throttled, and only while the hero is on screen.                     */
  function wireHeroPan() {
    var img = document.querySelector('[data-pan]');
    var hero = document.querySelector('.hero');
    if (!img || !hero || reduced) return;
    var ticking = false;
    function update() {
      var r = hero.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        var seen = Math.min(1, Math.max(0, -r.top / r.height));
        img.style.setProperty('--pan', (seen * 52).toFixed(1) + 'px');
      }
      ticking = false;
    }
    addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------ the demo switch --
     Not part of either direction. Swaps [data-theme] on <html>, which is the
     only thing that separates them: no markup changes, no reload, no second
     stylesheet.                                                              */
  var SPEC = {
    credits: {
      name: '09 · The credit roll',
      thesis: 'The school does not sell a lesson. It sells the last four seconds of a film, ' +
        'where your name is. So the page is built out of the one artifact a student takes home: ' +
        'the end credit block. The accent is the brand’s own green, which is true three ways ' +
        'at once — the exit sign is the only other light in a dark room, a green light means a ' +
        'film is approved to be made, and it is the colour the shipped social assets already use.',
      type: 'Bricolage Grotesque on its optical-size axis · Literata for reading · ' +
        'IBM Plex Mono for anything checkable',
      mat: 'Green-black, no radius, no shadow, hairline rules. Every photograph is graded into ' +
        'the room. The only light surface on the page is paper, and paper appears only where ' +
        'something is checkable.',
      sig: 'A credit line with nothing on it. It draws itself once on load and stays blank until ' +
        'you type your name into the booking form, at which point both credits fill together.',
      cost: 'The accent fails on paper (1.89:1), so the money band and the schedule sheet run ' +
        'without it and lean on rules and scale instead. That is a real constraint, enforced by ' +
        'scoping rather than by discipline.'
    },
    colour: {
      name: '10 · Only the films are in colour',
      thesis: 'The same content, argued harder. The interface has no hue anywhere — five ' +
        'neutrals and nothing else — and every photograph arrives completely ungraded and ' +
        'full-bleed. The only colour this school has is its output, so the only colour on the page ' +
        'is the pictures.',
      type: 'Geologica alone, three registers off one weight axis · IBM Plex Mono for values. ' +
        'A single family against 09’s three voices, which is the opposite typographic argument.',
      mat: 'Wider bands, narrower column, tighter display tracking, and images that break the ' +
        'column to the full viewport. The composition changes, not only the palette.',
      sig: 'Emphasis is carried by a rule under the word rather than by a colour, because there ' +
        'is no colour to carry it. The page can never compete with a photograph.',
      cost: 'It is the most image-dependent direction here. With weak photography it collapses ' +
        'into grey type on black, and there is no accent to rescue a dull screen.'
    }
  };

  function wireSwitch() {
    var btns = [].slice.call(document.querySelectorAll('.switch button[data-set]'));
    var spec = document.getElementById('spec');
    if (!btns.length) return;

    function set(k) {
      if (!SPEC[k]) return;
      root.setAttribute('data-theme', k);
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.set === k)); });
      var s = SPEC[k];
      document.getElementById('specName').textContent = s.name;
      document.getElementById('specThesis').textContent = s.thesis;
      document.getElementById('specType').textContent = s.type;
      document.getElementById('specMat').textContent = s.mat;
      document.getElementById('specSig').textContent = s.sig;
      document.getElementById('specCost').textContent = s.cost;
      try { localStorage.setItem('wfs-p3', k); } catch (e) { /* private mode */ }
    }

    btns.forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.set); }); });
    document.addEventListener('keydown', function (e) {
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
      if (e.key === '9') set('credits');
      if (e.key === '0') set('colour');
    });

    var specBtn = document.getElementById('specBtn');
    var specX = document.getElementById('specClose');
    if (specBtn) specBtn.addEventListener('click', function () { spec.hidden = !spec.hidden; });
    if (specX) specX.addEventListener('click', function () { spec.hidden = true; });

    var q = (location.search.match(/[?&]t=(credits|colour)/) || [])[1];
    var saved = null; try { saved = localStorage.getItem('wfs-p3'); } catch (e) { /* ignore */ }
    set(q || (saved && SPEC[saved] ? saved : 'credits'));
  }

  function init() {
    renderDates(); wireCredit(); wireForm(); wireDialogs();
    wireMotion(); wireHeroPan(); wireSwitch();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
