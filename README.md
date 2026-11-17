# Traavellio — 100% Framer Template Reverse Engineered Clone

A complete, 100% authentic reverse-engineered clone of the [Traavellio Framer Website](https://traavellio.framer.website), preserved with all original assets, media, layout, UI, motion animations, pages, and Framer component library.

---

## 🚀 Quick Start

Run the local server to test the cloned site:

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
traavellio/
├── site/                     # All 44 fully rendered static HTML pages
│   ├── index.html            # Homepage (Hero, Featured Tours, Testimonials, FAQ)
│   ├── about/                # About Us page
│   ├── book-a-trip/          # Booking form & trip planner
│   ├── blogs/                # Blog hub & 4 detailed blog articles
│   ├── tours/                # Tour catalogue & 25 tour detail pages
│   ├── destinations/         # Japan, Switzerland, Paris, New York
│   ├── activities/           # Camping, Water, Mountain, Ski & Snow
│   └── policies/             # Privacy Policy & Terms of Service
├── cdn_cache/                # 1,209+ original local assets (images, fonts, scripts)
│   ├── framerusercontent.com/
│   │   ├── images/           # All high-res tour photos, banners, avatars, badges
│   │   ├── sites/            # Framer Motion hydration runtime & JS modules
│   │   └── assets/           # Typography & custom font definitions
│   └── fonts.gstatic.com/    # Google Fonts
├── extracted_source/         # Decompiled & recovered React components from source maps
│   ├── components/           # 151 React source components (Ticker, Video, Navigation...)
│   ├── asset-library/        # Phosphor icons, SVGs, vector assets
│   └── catalog.json          # Index of all extracted components & metadata
├── server.mjs                # Local high-speed HTTP server with asset router & auto-caching
├── package.json              # Project definition & scripts
└── README.md                 # Project documentation
```

---

## 🌟 Cloned Features & Completeness

1. **All 44 Pages & Routes Cloned:**
   - **Main:** `/`, `/about`, `/book-a-trip`, `/blogs`, `/tours`
   - **Destinations (4):** `/destinations/japan`, `/destinations/switzerland`, `/destinations/paris`, `/destinations/new-york`
   - **Activities (4):** `/activities/camping-outdoor`, `/activities/water-adventures`, `/activities/mountain-expeditions`, `/activities/ski-snow-adventures`
   - **Tours (25):** Morocco, Italy, Paris Classics, Africa Safari, Switzerland Alpine Escape, Japan Culture, Iceland, Dubai, Australia, Egypt, etc.
   - **Articles (4):** Island Life, Europe Routes, Mountain Travel, Bali Soul
   - **Policies (2):** Privacy Policy, Terms & Conditions

2. **100% Original Media & Assets (1,209+ Files):**
   - High-definition tour photos, hero backgrounds, gallery images, travel destination thumbnails, customer avatars, partner logos.
   - Google Fonts & Framer custom web fonts (`woff2`).
   - SVG icons, badges, indicators, and graphics.

3. **Original UI & Motion Engine:**
   - Framer Motion animations (page transitions, scroll reveals, stagger effects).
   - Ticker marquee component for partners and ratings.
   - Video players with responsive controls.
   - Interactive mobile navigation drawer, dropdown menus, filter pills, and accordion FAQ panels.
   - Responsive breakpoints (Desktop `1200px+`, Tablet `810px-1199px`, Mobile `<810px`).

4. **Extracted React Source Code & Asset Library:**
   - 154 original component files extracted directly from Framer source maps into `extracted_source/components/` and `extracted_source/asset-library/`.
