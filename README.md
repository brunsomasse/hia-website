# Hope International Association — Website

![HIA Logo](images/logo.png)

> A Geneva-based nonprofit supporting widows and orphans worldwide through education, healthcare, microfinance, and community programs.

**Live site:** [hope-international-association.com](https://hope-international-association.com)  
**Staging:** [hia-hope.netlify.app](https://hia-hope.netlify.app)  
**Reg. No.:** 482.5.021.9302

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Updating Images](#updating-images)
- [Branching & Deployment Workflow](#branching--deployment-workflow)
- [Pending Integrations](#pending-integrations)
- [Contact](#contact)

---

## Project Overview

This is the official website for **Hope International Association (H.I.A)**, a single-file static site with no build step required. It features:

- Bilingual support (EN / FR) with a live toggle
- Multi-method donation modal (PayPal, Bank Transfer, QR/Mobile)
- Animated impact statistics
- Photo gallery with externalized image management
- Contact form (Formspree-ready)
- Stripe card payment integration (activation-ready)
- GDPR cookie consent banner
- Fully responsive and accessible (ARIA, skip links, keyboard navigation)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, grid, flexbox) |
| Scripting | Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts — Cormorant Garamond + Jost |
| Payments | Stripe.js (v3) |
| Contact Form | Formspree |
| Hosting | Netlify (continuous deployment from `main`) |
| Domain | Openprovider / Registrar.eu |
| Version Control | GitHub |

---

## Repository Structure

```
hia-website/
├── index.html              # Main site — all HTML, CSS, and JS
├── images.js               # Image configuration — edit here to swap images
├── 404.html                # Custom branded 404 error page
├── _redirects              # Netlify redirect rules (www → non-www)
├── _headers                # Netlify security & cache headers
├── sitemap.xml             # XML sitemap for search engines
├── robots.txt              # Search engine crawl instructions
└── images/
    ├── logo.png            # HIA logo (transparent PNG)
    ├── hia-donate.jpg      # Full-width banner image
    ├── gallery-community.jpg
    ├── gallery-education.jpg
    └── gallery-care.jpg
```

---

## Getting Started

No build tools or dependencies required. Clone and open directly:

```bash
git clone https://github.com/brunsomasse/hia-website.git
cd hia-website
```

**Preview locally:**
```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

Or use the Netlify CLI:
```bash
netlify dev
```

---

## Updating Images

All images are managed through `images.js` — **never embed images directly in `index.html`**.

**To replace an image with the same filename:**
1. Add the new file to the `images/` folder with the same name
2. Commit and push to `dev`
3. Open a PR → preview → merge to `main`

**To use a different filename:**
1. Upload the new file to `images/`
2. Open `images.js` and update the corresponding path
3. Commit, push, PR, merge

**Image recommendations:**

| Image | File | Recommended Size |
|---|---|---|
| Logo | `logo.png` | PNG, transparent background, 400px+ wide |
| Donate banner | `hia-donate.jpg` | JPG, 1200px+ wide, any height |
| Gallery images | `gallery-*.jpg` | JPG, 900px+ wide, 4:3 ratio |

---

## Branching & Deployment Workflow

This project follows a **`dev` → `main`** branching strategy.

```
dev branch    →  Pull Request  →  main branch  →  Netlify Production
     ↓                                ↓
Netlify Deploy Preview          hia-hope.netlify.app
(auto, per PR)                  hope-international-association.com
```

### Day-to-day workflow

```bash
# 1. Always work on dev
git checkout dev

# 2. Make your changes, then commit
git add .
git commit -m "Clear description of what changed"
git push

# 3. Netlify automatically builds a preview URL
#    Check it at: https://deploy-preview-X--hia-hope.netlify.app

# 4. Open a Pull Request on GitHub
#    github.com/brunsomasse/hia-website → Compare & pull request

# 5. Review the preview → Merge pull request
#    Netlify automatically deploys to production
```

### Branch protection

- `main` is **protected** — direct pushes are blocked
- All changes must go through a Pull Request from `dev`

---

## Pending Integrations

The following require client-provided credentials to activate:

| Feature | Status | What's needed |
|---|---|---|
| Custom domain | ⏳ Pending DNS | Openprovider DNS access |
| Contact form | ⏳ Pending | Formspree form ID → replace `FORMSPREE_ID` in `index.html` |
| Card payments | ⏳ Pending | Stripe publishable key → replace `YOUR_STRIPE_PUBLISHABLE_KEY` in `index.html` |
| Beneficiary testimonial | ⏳ Pending | Real quote + name + country from HIA team |
| Partner logos | ⏳ Pending | PNG logos from confirmed partners |

---

## Contact

**Hope International Association (H.I.A)**  
Via al Gagiuracs 12, CH-6528 Camorino, Switzerland  
📞 +41 77 451 95 14  
✉️ judmaria9@gmail.com  

**Developer:** Brun Somasse — [github.com/brunsomasse](https://github.com/brunsomasse)

---

*© 2026 Hope International Association. All rights reserved.*
