# saturday/

One landing page, built from `PLAN_LANDING_PAGE.md`. It has one job: turn a
visitor into a name and a WhatsApp number.

It does **not** replace `index.html` and shares no stylesheet with the other six
pages. It **does** read the same `../assets/js/config.js` you already edit every
week, so dates and prices stay in one file.

```
index.html            the page. HTML, CSS and JS all in one file, no build step
assets/js/saturday.js behaviour: config, the form, the seat bar, the rail
assets/fonts/         two self-hosted variable faces, 81 KB the pair
assets/img/           og-cover.png, the 1200x630 social preview
supabase.sql          paste into the Supabase SQL editor once
```

The CSS is inside `index.html` on purpose. It is 9 KB gzipped, and inlining it
means nothing has to be fetched before the page can paint.

## The two switches, in ../assets/js/config.js

```js
landing: {
  softLaunch: true,          // true = ask search engines to ignore this page
  imagePlaceholders: true    // true = show labelled empty picture frames
}
```

`softLaunch: true` is why the page is not in `sitemap.xml` and carries a
`noindex` tag. That is deliberate: while the URL is shared by hand, this page
and `index.html` would otherwise compete for the same searches.

`imagePlaceholders: true` draws a labelled frame at the exact size of each
photograph that is still missing, so the layout you see is the final layout.
**It must be `false` before `softLaunch` is.** If you flip `softLaunch` and
forget, the page logs an error and hides the frames rather than publishing
asset names to the world.

## Going live, in order

1. Put the real WhatsApp number in `links.whatsappEnquiry`. Until you do, every
   WhatsApp button stays hidden and people are pointed at email instead. That is
   deliberate: a missing button beats one that goes nowhere.
2. Run `supabase.sql`, then paste the project URL and the **anon** key into
   `backend` in `config.js`. Never the `service_role` key.
3. Confirm dates, area and prices in `config.js`.
4. Leave `seatsConfirmed: false` until seats are genuinely selling.
5. Set `imagePlaceholders: false`.
6. Set `softLaunch: false`.
7. Add this line to `../sitemap.xml`:
   ```xml
   <url><loc>https://www.thenobodyclub.com/filmschool/saturday/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
   ```
8. Check nothing leaked. Run these from the folder above this one:
   ```
   grep -rn 900000 . --include=*.html --include=*.js
   grep -rniE "service_role|sk_live|rzp_live|resend" . --include=*.html --include=*.js
   ```
   Both should print nothing. They are scoped to the files a browser actually
   downloads, so notes and SQL that mention those words do not set off a false
   alarm.

## When the photographs arrive

Every picture slot is already wired. Drop an `<img>` inside the
`[data-slot]` div and the frame gets out of the way; the ratio and the space are
already correct, so nothing moves. The slugs and the alt text are printed in
each frame.

## Rebuilding the fonts or the social image

Only needed if the character set, the axis ranges or the preview copy change.

```
pip install fonttools brotli pillow
python scripts/build-fonts.py
python scripts/build-og.py
```
