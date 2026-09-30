# Arcline Ads

Pinterest Ads media buying and 1:1 coaching agency.

**Live site:** [arclineads.com](https://arclineads.com)

## What's here

| File | Purpose |
| --- | --- |
| `index.html` | The full website and media buying onboarding form (opens at `/#onboarding`): a single self-contained file |
| `CNAME` | Custom domain for GitHub Pages (`arclineads.com`) |
| `README.md` | This file |

## Services

- **Media buying (done for you):** $299 one-time setup, then $299/mo or 8% of ad spend, whichever is higher. First payment after 30 days of running ads.
- **1:1 Coaching (done with you):** Installments possible.

## Onboarding applications

The media buying onboarding form sends each submission to a Google Sheet via a Google Apps Script web app. Each application becomes a new row (date + all answers).

- Script: `Extensions → Apps Script` inside the applications sheet.
- After editing the script, redeploy: **Deploy → Manage deployments → ✏️ → Version: New version**.
- The web app must stay set to **Execute as: Me** and **Who has access: Anyone**.

## Updating the site

1. Export the new version as a single HTML file.
2. Rename it to `index.html`.
3. In this repo: **Add file → Upload files**, replace `index.html`, and commit.
4. Wait 1–10 minutes, then hard-refresh (Cmd/Ctrl + Shift + R).

## Hosting

Hosted on GitHub Pages from the `main` branch, root folder.

DNS for `arclineads.com`:

- `A` records on `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME` on `www` → `lerobusiness.github.io`

---

© Arcline Ads. All rights reserved.
