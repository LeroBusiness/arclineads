# Arcline Ads

Pinterest Ads media buying agency.

**Live site:** [arclineads.com](https://arclineads.com)

## Pages

| URL | File | Purpose |
| --- | --- | --- |
| `/` | `index.html` | The whole pitch: why Pinterest, how it works, results, client messages, pricing, FAQ |
| `/apply/media-buying/` | `apply/media-buying/index.html` | Media buying onboarding form |
| `/terms/`, `/privacy/` | `terms/index.html`, `privacy/index.html` | Legal pages |
| — | `404.html` | Not-found page |

`/media-buying/`, `/coaching/` and `/apply/coaching/` are small redirect pages that send old links to the home page.
Old links such as `/#onboarding`, `/#terms` and `/#privacy` also redirect.

Shared files live in `assets/`: `css/site.css` (all styling), `js/site.js` (menu, animations),
`js/apply.js` (the form), `fonts/`, `img/`. `sitemap.xml` and `robots.txt` are for search engines.

The site is plain HTML, CSS and JavaScript. There is no build step: edit a file, commit, and it is live.

## Service

**Media buying (done for you):** $285/mo plus 8% of ad spend. No onboarding fee. First monthly payment after 30 days of running ads.

If pricing changes, update it in `index.html` (pricing card, FAQ, the meta description and the JSON-LD block in `<head>`) and `terms/index.html`.

## Applications

The form sends answers to a Google Sheet via a Google Apps Script web app. The URL is at the top of `assets/js/apply.js`.

A row is created as soon as someone completes step 1 (name + WhatsApp) and updates as they go. **Status** shows `In progress: reached step X of Y` or `Submitted`, so you can follow up with people who left early.

- Script: `Extensions → Apps Script` inside the sheet.
- After editing the script, redeploy: **Deploy → Manage deployments → ✏️ → Version: New version**.
- The web app must stay set to **Execute as: Me** and **Who has access: Anyone**.

## Hosting

Hosted on GitHub Pages from the `main` branch, root folder (`.github/workflows/static.yml`).

DNS for `arclineads.com`:

- `A` records on `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME` on `www` → `lerobusiness.github.io`

---

© Arcline Ads. All rights reserved.
