/* ==========================================================================
   THE WEEKEND FILM SCHOOL — SITE CONFIG
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit for day-to-day running of the site:
   dates, seats, prices, payment links, WhatsApp links, social handles.

   Everything else (the copy on each page) lives in the .html files.

   RULES
   - Dates are ISO format: "2026-08-22" (year-month-day). Do not use 22/08/26.
   - `seatsLeft: 0` closes the workshop automatically and shows "Sold out".
   - Anything with a date in the past is hidden from the site automatically.
   - `payLink` is a Razorpay payment link. Leave it as "" until you have one —
     the site will fall back to the WhatsApp enquiry flow, so nothing breaks.
   ========================================================================== */

window.WFS = {

  /* ---------------------------------------------------------------- BRAND */
  brand: {
    name: "The Weekend Film School",
    city: "Hyderabad",
    tagline: "Make your first film in one day.",
    url: "https://www.thenobodyclub.com/filmschool"   // change when the domain is live
  },

  /* ---------------------------------------------------------------- LINKS
     Fill these in as you create the accounts (Day 1 of the handover sheet).
     Any link left as "" is hidden from the site instead of 404-ing.        */
  links: {
    whatsappChannel: "",                                  // e.g. https://whatsapp.com/channel/xxxxx
    whatsappEnquiry: "https://wa.me/919000000000",        // <-- REPLACE with the real number
    instagram: "https://instagram.com/theweekendfilmschool",
    youtube: "",
    email: "hello@thenobodyclub.com",
    nobodyClub: "https://www.thenobodyclub.com",
    directory: "https://www.thenobodyclub.com/directory",
    maps: ""                                              // Google Business Profile link
  },

  /* --------------------------------------------------------------- FORMS
     Paste a Google Form (or Tally / Formspree) link for each. If a link is
     empty, the form on the site composes a WhatsApp message instead, so it
     works from day one with no tools set up.                              */
  forms: {
    waitlist: "",
    notify: "",
    masterclassProposal: "",
    corporate: ""
  },

  /* ------------------------------------------------------------- PRICING
     Founding price applies to the first two batches only.                 */
  pricing: {
    foundingActive: true,
    currency: "₹"
  },

  /* -------------------------------------------------------- SEATS ARE REAL
     Leave this as false until seats are genuinely selling. While it is
     false the site shows dates and prices but never says how many seats
     are left. Do not set it to true to create urgency: the people this is
     for can smell that, and it is the fastest way to lose them.           */
  seatsConfirmed: false,

  /* ------------------------------------------------------- LANDING PAGE
     Two switches for saturday/index.html only. Nothing else reads them.

     softLaunch        true  = the page is shared by hand and asks search
                              engines to ignore it, so it cannot compete
                              with index.html for the same searches.
                       false = go live. Indexing and rich results turn on.

     imagePlaceholders true  = the picture slots show a labelled empty
                              frame, so the layout is the final layout.
                       false = the picture slots disappear and the page is
                              type only. A real photograph always wins over
                              both. Must be false before softLaunch is.    */
  landing: {
    softLaunch: true,
    imagePlaceholders: true
  },

  /* ------------------------------------------------------------- BACKEND
     Where "Put my name down" sends the form. Both values are public by
     design and are safe ONLY because Row Level Security is switched on in
     Supabase. See PLAN §15.3. Never paste a service_role key here.

     Leave both empty and the form still works: it composes a WhatsApp or
     email message instead, and nobody sees an error.                      */
  backend: {
    url: "",        // https://xxxxxxxx.supabase.co
    anonKey: ""     // the anon / publishable key, not the service_role key
  },

  /* ----------------------------------------------------------- WORKSHOPS
     status: "open" | "waitlist" | "notify" | "soldout"
     track:  "mobile" | "ai" | "gear"                                       */
  workshops: [
    {
      id: "mob-2026-08-22",
      track: "mobile",
      title: "Mobile Filmmaking · Batch One",
      badge: "Mobile",
      date: "2026-08-22",
      dayLabel: "Saturday",
      time: "10 AM to 7 PM",
      venue: "Cafe venue, Banjara Hills",
      area: "Banjara Hills",
      seats: 30,
      seatsLeft: 9,
      price: 1499,
      standardPrice: 1999,
      status: "open",
      note: "Founding price. Phones only — bring a charger.",
      payLink: ""
    },
    {
      id: "ai-2026-08-23",
      track: "ai",
      title: "AI Filmmaking · Batch One",
      badge: "AI",
      date: "2026-08-23",
      dayLabel: "Sunday",
      time: "10 AM to 7 PM",
      venue: "Cafe venue, Madhapur",
      area: "Madhapur",
      seats: 25,
      seatsLeft: 18,
      price: 1499,
      standardPrice: 2499,
      status: "open",
      note: "Founding price. Bring a laptop and a charger. Tool credits included.",
      payLink: ""
    },
    {
      id: "mob-2026-09-12",
      track: "mobile",
      title: "Mobile Filmmaking · Batch Two",
      badge: "Mobile",
      date: "2026-09-12",
      dayLabel: "Saturday",
      time: "10 AM to 7 PM",
      venue: "Cafe venue, Banjara Hills",
      area: "Banjara Hills",
      seats: 30,
      seatsLeft: 30,
      price: 1499,
      standardPrice: 1999,
      status: "open",
      note: "Last batch at the founding price. After this it is ₹1,999 and stays there.",
      payLink: ""
    },
    {
      id: "mob-2026-10-03",
      track: "mobile",
      title: "Mobile Filmmaking · Batch Three",
      badge: "Mobile",
      date: "2026-10-03",
      dayLabel: "Saturday",
      time: "10 AM to 7 PM",
      venue: "Cafe venue, Banjara Hills",
      area: "Banjara Hills",
      seats: 30,
      seatsLeft: 30,
      price: 1999,
      standardPrice: 1999,
      status: "notify",
      note: "Standard pricing begins. Opens for booking once Batch Two fills.",
      payLink: ""
    },
    {
      id: "month-mob-2026-10",
      track: "mobile",
      title: "The Month · Mobile · Cohort One",
      badge: "Month · Mobile",
      date: "2026-10-10",
      dayLabel: "Four Saturdays",
      time: "10 AM to 6 PM, four weekends",
      venue: "Banjara Hills",
      area: "Banjara Hills",
      seats: 18,
      seatsLeft: 18,
      price: 6999,
      standardPrice: 6999,
      status: "waitlist",
      note: "One mentor attached to your crew for the whole month. Weekend graduates only.",
      payLink: ""
    },
    {
      id: "month-ai-2026-11",
      track: "ai",
      title: "The Month · AI · Cohort One",
      badge: "Month · AI",
      date: "2026-11-08",
      dayLabel: "Four Sundays",
      time: "10 AM to 6 PM, four weekends",
      venue: "Madhapur",
      area: "Madhapur",
      seats: 18,
      seatsLeft: 18,
      price: 7999,
      standardPrice: 7999,
      status: "waitlist",
      note: "Same structure, AI tools. Tool credits included. AI weekend graduates only.",
      payLink: ""
    }
  ],

  /* -------------------------------------------------------- MASTERCLASSES
     One day, one subject, one person who does it for a living.
     Leave `date` empty ("") for "dates announced on the channel".          */
  masterclasses: [
    {
      id: "mc-acting",
      title: "Acting for camera",
      teacher: "With a working screen actor",
      summary: "Self tapes, eyelines, hitting marks, and what casting directors are actually looking at.",
      day: "Saturday",
      date: "",
      seats: 30,
      price: 1499,
      status: "notify",
      payLink: ""
    },
    {
      id: "mc-writing",
      title: "Writing the short film",
      teacher: "With a produced screenwriter",
      summary: "Structure, subtext, and the specific reason your ending is not working.",
      day: "Saturday",
      date: "",
      seats: 30,
      price: 1499,
      status: "notify",
      payLink: ""
    },
    {
      id: "mc-edit",
      title: "The edit room",
      teacher: "With a working editor",
      summary: "Rhythm, sound design, and cutting your own footage live in the room.",
      day: "Sunday",
      date: "",
      seats: 25,
      price: 1999,
      status: "notify",
      payLink: ""
    },
    {
      id: "mc-directing",
      title: "Directing actors",
      teacher: "With a theatre and film director",
      summary: "Blocking, notes, and getting a performance out of a friend who is not an actor.",
      day: "Sunday",
      date: "",
      seats: 25,
      price: 1999,
      status: "notify",
      payLink: ""
    }
  ]
};
