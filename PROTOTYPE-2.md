# Prototype 2 — the new landing page

Open **`prototype-2.html`**. It sits alongside the live site and changes nothing that
already exists: `index.html`, `site.css` and `site.js` are untouched. Its own files are
`assets/css/p2.css`, `assets/js/p2.js` and `assets/img/p2/`.

**To make it the site**, once you are happy: rename `index.html` to `index-v1.html`, rename
`prototype-2.html` to `index.html`, and remove the `noindex` line from its `<head>`.

---

## The argument

The business does not sell lessons. It sells the four things a first film needs that
nobody in this city can buy: **a crew, a deadline, a room, and somebody to watch it.**
The hardest of those to find is the crew. So the crew is the page.

**The signature.** Five hairlines run down every section of the first half — five people
who have never met, each stuck in their own lane. At the moment the page hands you a crew,
the five lanes converge into one, and that single line carries the rest of the page to the
booking form. It is one CSS transform. It is also the entire business in a graphic.

**The materials.** Two, alternating. **The room** is deep indigo: dark, borrowed, where the
feeling lives. **The paper** is bone: where anything checkable lives — durations, prices,
what to bring. The accent is a flare, and a flare only shows in the dark, so it never
appears on paper. That is a rule, not a preference. (It also happens to be the only way it
passes contrast: 4.97:1 on indigo, 2.7:1 on bone.)

**The voices.** Fraunces only ever says things a person *feels*. Schibsted Grotesk runs the
structure. IBM Plex Mono holds anything a person could *check*. The three never blur.

## Why it is not Prototype 1

Nothing is carried over but accurate facts and the strongest existing line. Prototype 1 was
a dark dashboard: sticky tab navigation, one accent per category, rounded cards in even
grids, Space Grotesk and Inter. This has a serif human voice, a two-material system, an
asymmetric hero, a ledger for the routes, a converging five-column device, a duration spine
for the day, one full-bleed constraint moment, and a single scrolling page ending in a form.

## The hero

Full bleed photograph, type elevated over it. Four layers back to front: the photograph,
a light grade, a directional scrim, the copy. **The scrim is not decoration** — it is what
guarantees the lede clears 4.5:1 over a photograph, which is why it is a hard 100° gradient
rather than a polite wash. The image also pans slower than the page as you scroll, so the
copy reads as raised off it rather than printed on it.

The frame was generated composed deliberately: subject in the **right third**, two thirds
empty blue-hour sky on the left for the type to live in. Two alternates are on disk —
`hero-b.jpg` (from a dark room looking out) and `hero-c.jpg` (a stairwell at night) — swap
the filename in `prototype-2.html` to try them.

## The schedule sheet — the pattern for all the sites

The schedule is no longer a section you scroll past. It is a **closed box that states what
is inside**, and clicking it opens a real modal. Reusable anywhere, two attributes:

```html
<button data-dialog-open="my-id">…</button>
<dialog class="sheet" id="my-id"> … <button data-dialog-close>…</button> </dialog>
```

It uses the native `<dialog>` element, so focus trapping, Escape, returning focus to the
button that opened it, and making the rest of the page inert all come for free instead of
being reimplemented badly. `p2.js` adds only two things: click-the-backdrop-to-dismiss, and
a fallback that renders the sheet inline if a browser has no `<dialog>` support, so the
button is never dead.

## The day

Straight from your 8 August operations note, given as **durations rather than clock times**,
because the only two times anyone can honestly promise are the start and the finish:
15 / 15 / 15 min · 1 hour lesson and handover · 30–40 min lunch with the captain · 2 hours
making it · 1 hour cutting · 30–40 min screening · 15 min outro. Nine blocks, eight
changeovers, published as **twelve noon to seven**.

Also from that note and used on the page: 2–5 minute films, 5-member teams, 2 actors,
200 metres, theme given and script yours or ours, two films per captain, members-only
pre-course material.

## Facts, and where they come from

Dates, prices, areas and the booking dropdown all render from **`assets/js/config.js`** —
still the only file to edit for day-to-day running. `seatsConfirmed: false` is respected:
no seat counter appears anywhere. Anything dated in the past disappears by itself.

**One thing to fix in config.js:** every workshop still says `time: "10 AM to 7 PM"`. The
operations note moved the day to a noon start. Rather than print a time we know is wrong,
`p2.js` substitutes its own `DAY_TIME` constant and ignores the config field. Correct
`config.js` and then delete `DAY_TIME`.

## What it does not claim

No student films, no testimonials, no seat countdown, no press logos, no invented dates.
The student-films section says *there are none yet* and shows the empty room. Every
photograph is generated — labelled in the footer — and gets replaced the evening of the
first batch. Prompts are in `design-demo/tools/shots_p2.py`; edit one and re-run:

```bash
python design-demo/tools/shots_p2.py crew
```

## Engineering

Semantic sections, one `<h1>`, ordered headings, real `<details>` for the FAQ, labelled
form fields, visible focus, 50px targets. **Turn JavaScript off and the page is complete** —
dates are in the HTML as a fallback, the FAQ still opens, and the form composes a WhatsApp
message. Nothing is hidden by CSS unless the script is running to reveal it, so a failed
request cannot blank a section. `prefers-reduced-motion` removes all movement including the
convergence. Verified: no horizontal overflow at 390px, no console errors, every
text-on-surface pair at or above 4.97:1.
