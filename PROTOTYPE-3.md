# Prototype 3 — two new dark directions

Open **`prototype-3.html`**. Press **9** and **0**, or use the bar at the bottom, to swap
between the two directions on identical content. **Notes** opens the thesis, type stack,
signature and honest cost of whichever one you are looking at. `?t=colour` in the URL opens
straight into one, so you can send someone a link.

Its own files are `assets/css/p3.css`, `assets/js/p3.js` and `assets/img/p3/`. It shares only
`assets/js/config.js` with the rest of the site.

**Nothing existing was modified.** `index.html`, `prototype-2.html`, `site.css`, `site.js`,
`p2.css`, `p2.js` and `design-demo/index.html` are all untouched, and the eight earlier
directions are still selectable exactly as they were.

---

## Where this sits, and a numbering note

The demo in `../design-demo/index.html` already holds eight directions, keys 1–8, and slot 8
is **Borrowed room**, which is prototype 2. Rather than renumber or overwrite anything, the
two new dark directions here are **09** and **10**. If you meant *replace* what is currently
in slot 8, say so and they renumber in one line — nothing about the work changes.

The switcher links back to directions 1–8, so both files stay reachable from either.

---

## Why this is not prototype 2 with a different palette

Looking at all eight earlier directions side by side (`design-demo/previews/compare.png`),
the honest finding is that they are **one composition wearing eight palettes**. Identical
skeleton every time: headline, lede, a four-box myth row, two buttons, a picture. The type
and colour change and the layout never does.

So the test for anything new was that it had to differ in *composition*, not only in tokens.
These two do: different section inventory, different hero mechanic, different image logic,
different density, different scale ratio, different mobile design. The theme swap changes
where the pictures live and how wide the column is, not just what colour things are.

---

## 09 · The credit roll  (the primary new direction)

**The thesis.** The school does not sell a lesson. It sells the last four seconds of a film,
where your name is. So the page is built out of the one typographic artifact a student
actually takes home: the **end credit block** — role in small mono capitals, name in display
underneath.

**The signature is a credit line with nothing on it.** `DIRECTED BY ______`. It draws itself
once on load and stays blank for the whole page. When you type your name into the booking
form, **both credits fill at once** — the one in the hero and the big one in the payoff
section. That interaction is the entire business in one gesture, and it is the only thing on
the page that is still empty until you act.

This is not invented. `brand/BRAND_GUIDE.md` §1 already says it: *"The line under it is the
same blank line as `DIRECTED BY ______`. Everything in this identity rhymes with that
blank."* The page just takes the brand at its word.

**The accent is the brand's own green** (`#3FBF77`, the guide's `--wfs-green-hi`, specified
ink-surfaces-only). It is true three ways at once: the exit sign is the only other light in a
dark room, a green light means a film has been approved to be made, and it is the colour the
roughly forty already-shipped social assets use. Choosing it is the one direction here that
does **not** put the page and the Instagram grid out of sync.

Green is rationed to what it means. No navigation button is green, because a green light is
given to you rather than pressed. **Exactly one control on the page is green** — the submit
at the bottom of the form — because that press is the moment.

**The voices.** Bricolage Grotesque on its real optical-size axis (tight and quirky at 80px,
open at 18px) · Literata for reading · IBM Plex Mono for anything a person could check, which
is the brand's standing rule. None of the three is used by any of the earlier eight.

**What it costs you.** The accent fails on paper at 1.89:1, so the money band and the
schedule sheet run without it entirely and lean on rules and scale instead. That is enforced
by scoping, not by discipline.

## 10 · Only the films are in colour  (the harder experiment)

Same content, argued further. **The interface has no hue anywhere** — five neutrals and
nothing else — and every photograph arrives completely ungraded and full-bleed. The only
colour this school has is its output, so the only colour on the page is the pictures.

The composition changes with it: wider bands, a narrower reading column, tighter display
tracking, a single type family carrying all three registers instead of three families, and
images that break out of the column to the full viewport. Emphasis is tonal rather than
coloured — the line holding the emphasis steps back and the emphasised phrase stays at full
brightness — because there is no colour left to carry it.

**What it costs you.** It is the most image-dependent thing in this repository. With weak
photography it collapses into grey type on black and there is no accent to rescue a dull
screen.

---

## The hero

Three compositions, not one scaled.

- **Wide (≥1000px).** Two columns. Type left, the photograph in its own right-hand column
  bleeding off the edge of the viewport. The type never sits on the brightest object in the
  picture, so the scrim can stay light and the photograph gets to be a photograph.
- **Phone and small tablet.** The photograph is a **band underneath the copy**, full bleed,
  not a field behind it. Type over a projected rectangle on a 375px screen is where
  legibility dies, and the picture is better seen than dimmed.
- The frame pans slower than the page, so the copy reads as raised off it.

**The photograph is the signature at architectural scale**: one person alone in a dark room
facing a large blank rectangle of projector light with nothing in it. It was generated
composed for this — subject hard right, the left third held empty and dark for the type.

## The schedule

§18: it never occupies a permanent box. It is a **closed object that states what is inside
it**, and it opens as a real modal. Native `<dialog>`, so focus trapping, Escape, returning
focus to the opener and inerting the page all come for free instead of being reimplemented
badly. `p3.js` adds two things only: click-the-backdrop, and an inline fallback so the button
is never dead where `<dialog>` is unsupported.

Inside, it is **the only paper on the page**. The page never shows a printed surface until
you ask it what happens, which makes the reveal feel like a different object rather than a
recoloured panel. Durations, not clock times, because the start and the finish are the only
two times anyone can honestly promise. Straight from the operations note: 15 / 15 / 15 min ·
1 hour lesson and handover · 30–40 min lunch with the captain · 2 hours making it · 1 hour
cutting · 30–40 min screening · 15 min outro. Nine blocks, eight changeovers.

## The cast

Five people set the way a production sets a cast list. They begin **staggered and separate**,
each in their own lane, and close into a single block at the moment the page hands you a
crew. Only transforms move and both states share one layout, so the animation cannot cause a
reflow or a jump. On a phone the horizontal separation is zero — there is no room to push
five lanes sideways without shoving type off the screen — so the separation there is vertical
and tonal.

## Motion, and what deliberately does not move

Eight animated things, each with a reason:

| What | Why it is allowed to move |
|---|---|
| The hero credit rule draws once | The page performs its own thesis |
| The hero lines arrive staggered | One orchestrated load, seen once |
| The cast closes into one block | It explains the product |
| A name fills the credit | State indication, blur-masked so it reads as one transformation |
| Sections rise as they arrive | Prevents jarring appearance |
| Buttons scale to 0.97 on press | Feedback |
| The sheet scales in from 0.97 | Occasional, so standard motion |
| The hero photograph pans slower | The type reads as raised off it |

One custom curve family, no built-in easings, everything under 300ms except the two
deliberate cinematic moments (the rule draw and the cast close). **The footer credit does not
roll** — a rolling credit is a loop, and a loop in a footer is decoration with a permanent
running cost. No marquee, no particles, no parallax outside the hero, and one scroll handler
in the whole file, rAF-throttled.

`prefers-reduced-motion` removes every transform-based movement and keeps opacity where it
aids comprehension.

## Facts, and where they come from

Dates, prices and the booking dropdown render from **`assets/js/config.js`**, still the only
file to edit for day-to-day running. `seatsConfirmed: false` is respected: no seat counter
appears anywhere. Anything dated in the past disappears by itself.

Used on the page and traceable: 2 to 5 minute films, 5-member teams, 2 actors, 200 metres,
theme given and script yours or ours, two films per captain, resource person teaches the room,
members-only pre-course material, nine blocks, twelve noon to seven, ₹1,499 founding for the
first two batches then ₹1,999.

**Carried over from prototype 2:** `config.js` still says `time: "10 AM to 7 PM"` on every
workshop. The operations note moved the day to a noon start, so `p3.js` substitutes its own
`DAY_TIME` and ignores the config field rather than print a time we know is wrong. Correct
`config.js` and delete `DAY_TIME` from both `p2.js` and `p3.js`.

**Not claimed:** no student films, no testimonials, no seat countdown, no invented dates, no
referral terms, and nothing about whether lunch is paid for — the sources disagree and the
page routes around it by describing what lunch is *for* instead. The student-films section
says there are none yet and shows the empty room.

## The imagery

Four new frames, generated with Cloudflare Workers AI (`flux-1-schnell`). Prompts are in
**`../design-demo/tools/shots_p3.py`** — edit one and re-run:

```bash
python design-demo/tools/shots_p3.py hero
```

They are generated in **full colour with real tonal separation on purpose**, because two
directions use the same set differently: 09 grades them into green-black, 10 shows them raw.
A frame that is already desaturated cannot do the second job.

`hero` is the blank projected rectangle with one person in front of it. `cast` is five pairs
of hands over one sheet of paper, shot from directly above so nobody has to face a camera and
it reads as an arrangement rather than a group photo. `mark` is two strips of tape on a
concrete floor. `roll` is the wall and the light, deliberately empty. Three frames from
prototype 2 are reused where they already served — `territory`, `room` — rather than
regenerated for the sake of it.

Every photograph is labelled illustrative in the footer and gets replaced the evening of the
first batch.

## Engineering

Semantic sections, one `<h1>`, ordered headings, real `<details>` for the FAQ, labelled form
fields, visible focus, 50px targets, `:active` states on every pressable thing.

**Turn JavaScript off and the page is complete** — dates are in the HTML as a fallback, the
FAQ still opens, the schedule sheet renders inline, and the form composes a WhatsApp message.
Nothing is hidden by CSS unless the `.js` class is present to reveal it, so a failed request
cannot blank a section, and a release timer reveals everything if an observer never fires.

Verified in a browser at 375px and 1360px: no horizontal overflow at either width
(`maxScrollX` is 0), the modal centres, the credit binding drives both slots, and every
text-on-surface pair clears 4.5:1 — the ratios are written next to the tokens in `p3.css`.
