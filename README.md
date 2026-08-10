# The Weekend Film School — website

The production website, developed from `Film School/WeekendFilmSchool_Website_Prototype_1.html`
and the story deck (`WeekendFilmSchool_Story.pdf`).

Plain HTML, CSS and JavaScript. **No build step, no npm, no framework.** Open the folder
in any editor, change a file, refresh the browser. It deploys to Netlify, Vercel,
GitHub Pages, Hostinger or any shared host by uploading the folder as-is.

---

## Running it locally

Double-clicking `index.html` mostly works, but the booking page reads a URL parameter,
so use a tiny local server instead:

```bash
# Python (already on most machines)
python -m http.server 8000
# then open http://localhost:8000
```

---

## The one file you will edit weekly

**`assets/js/config.js`** — dates, seats, prices, payment links, WhatsApp and social links.
Nothing else needs touching to run the business week to week.

```js
{
  id: "mob-2026-08-22",      // unique, never reuse — the booking URL uses it
  track: "mobile",            // mobile | ai | gear  (sets the colour and badge)
  title: "Mobile Filmmaking · Batch One",
  date: "2026-08-22",         // ISO only: YYYY-MM-DD
  time: "10 AM to 7 PM",
  venue: "Cafe venue, Banjara Hills",
  seats: 30,
  seatsLeft: 9,               // 0 flips the batch to "Sold out" automatically
  price: 1499,
  standardPrice: 1999,        // shown struck through when price is lower
  status: "open",             // open | waitlist | notify | soldout
  payLink: ""                 // Razorpay payment link
}
```

Behaviour that is automatic, so you cannot forget it:

- A date in the past disappears from the site. No dead batches on the page.
- `seatsLeft: 0` shows "Sold out" and disables the button.
- Five seats or fewer turns the seat count red.
- Empty `payLink` falls back to booking over WhatsApp — the site works before Razorpay exists.
- Empty social links are removed from the footer rather than shown broken.

### The three things to replace before launch

1. `links.whatsappEnquiry` — currently `+91 90000 00000`, a placeholder. **Replace it.**
2. `links.whatsappChannel` — paste the channel link once you create it (Day 1 of the handover sheet).
3. `brand.url` and the `<link rel="canonical">` / `og:url` tags in each `.html` file, plus
   `sitemap.xml` and `robots.txt`, once the real domain is decided.

---

## Files

```
index.html            How it works — the main sales page
dates.html            Upcoming batches, full price list, corporate enquiry form
book.html             Booking page. Reads ?w=<workshop id> from config.js
masterclasses.html    Masterclasses + "propose a masterclass" form
films.html            Student films
faq.html              FAQ (with FAQPage structured data)
404.html
robots.txt, sitemap.xml
assets/css/site.css   Whole design system. Tokens at the top — change those to reskin.
assets/js/config.js   ← the file you edit
assets/js/site.js     Rendering, nav, forms, structured data. Rarely needs changes.
assets/img/           favicon.svg, og-cover.svg
```

The header and footer are repeated in each HTML file (that is the cost of having no build
step). If you change a nav link, change it in all seven files.

---

## Forms without any backend

The corporate and masterclass-proposal forms need no server. On submit they compose a
pre-filled WhatsApp message (falling back to email). If you would rather use Google Forms,
paste the form URL into `config.forms` and the button sends people there instead:

```js
forms: {
  waitlist: "https://forms.gle/xxxx",
  notify: "",
  masterclassProposal: "",
  corporate: ""
}
```

---

## Payments

Create a Razorpay payment link per batch, paste it into that batch's `payLink`. The booking
page then shows "Pay ₹1,499 and confirm my seat". Until then it shows "Reserve my seat on
WhatsApp" with the batch details pre-filled in the message, so nothing is blocked on
payment setup.

---

## Before you launch, in order

1. Replace the WhatsApp number and channel link in `config.js`.
2. Confirm the real dates, venues and seat counts in `config.js`.
3. Export `assets/img/og-cover.svg` to `og-cover.png` at 1200×630 (Canva or any SVG viewer
   will do it). WhatsApp and Instagram previews need a PNG, not an SVG.
4. Swap the three placeholder film cards in `films.html` for real stills after batch one.
5. Set the domain, then update canonical URLs, `sitemap.xml` and `robots.txt`.

---

## Two things the source material disagreed on

Flagged rather than silently chosen:

1. **One day or two?** The story deck and the handover sheet both say one Saturday,
   10 AM to 7 PM, ₹1,999. The HTML prototype said "two days, 10 to 5" in the ladder and on
   the dates page. **The site follows the deck: one day, 10 to 7.** If it is really two days,
   change `time` in `config.js` and the timeline block in `index.html`.
2. **Founding price.** The deck says ₹1,999; the handover sheet's post copy says ₹1,499 for
   the first two batches; the prototype said both. The site treats ₹1,499 as the founding
   price for the first two batches and ₹1,999 as standard, which is what the posts promise.

Dates in `config.js` are placeholders on real 2026 Saturdays and Sundays (Mobile on
Saturday, AI on Sunday, per the deck). Replace them with the confirmed ones.
