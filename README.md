# Arcline Ads

Pinterest Ads media buying and 1:1 coaching agency.

**Live site:** [arclineads.com](https://arclineads.com)

## Pages

| URL | File | Purpose |
| --- | --- | --- |
| `/` | `index.html` | Home: why Pinterest, results, the two offers, "which one" quiz |
| `/media-buying/` | `media-buying/index.html` | Done-for-you service page: process, results, pricing, FAQ |
| `/coaching/` | `coaching/index.html` | 1:1 coaching page: process, pricing, FAQ |
| `/apply/media-buying/` | `apply/media-buying/index.html` | Media buying onboarding form |
| `/apply/coaching/` | `apply/coaching/index.html` | 1:1 coaching application form |
| `/terms/`, `/privacy/` | `terms/index.html`, `privacy/index.html` | Legal pages |
| — | `404.html` | Not-found page |

Shared files live in `assets/`: `css/site.css` (all styling), `js/site.js` (menu, quiz, animations),
`js/apply.js` (both forms), `fonts/`, `img/`. `sitemap.xml` and `robots.txt` are for search engines.

Old links such as `/#onboarding`, `/#apply-coaching`, `/#terms` and `/#privacy` redirect to the new pages.

The site is plain HTML, CSS and JavaScript. There is no build step: edit a file, commit, and it is live.

## Services

- **Media buying (done for you):** $285 one-time setup, then $285/mo. First monthly payment after 30 days of running ads.
- **1:1 Coaching (done with you):** price shared on the call. Installments possible.

If pricing changes, update it in `index.html`, `media-buying/index.html` (pricing card, FAQ and the JSON-LD block in `<head>`) and `terms/index.html`.

## Applications

Each form sends answers to its own Google Sheet via a Google Apps Script web app. The two URLs are at the top of `assets/js/apply.js`.

A row is created as soon as someone completes step 1 (name + WhatsApp) and updates as they go. **Status** shows `In progress: reached step X of Y` or `Submitted`, so you can follow up with people who left early.

- Script: `Extensions → Apps Script` inside each sheet (both use the same script).
- After editing the script, redeploy: **Deploy → Manage deployments → ✏️ → Version: New version**.
- The web app must stay set to **Execute as: Me** and **Who has access: Anyone**.

## Hosting

Hosted on GitHub Pages from the `main` branch, root folder (`.github/workflows/static.yml`).

DNS for `arclineads.com`:

- `A` records on `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME` on `www` → `lerobusiness.github.io`

---

© Arcline Ads. All rights reserved.
