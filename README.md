# Arcline Ads

Pinterest Ads media buying and 1:1 coaching agency.

**Live site:** [arclineads.com](https://arclineads.com)

## What's here

| File | Purpose |
| --- | --- |
| `index.html` | The full website plus both application forms: media buying (`/#onboarding`) and 1:1 coaching (`/#apply-coaching`). A single self-contained file |
| `CNAME` | Custom domain for GitHub Pages (`arclineads.com`) |
| `README.md` | This file |

## Services

- **Media buying (done for you):** $299 one-time setup, then $299/mo or 8% of ad spend, whichever is higher. First payment after 30 days of running ads.
- **1:1 Coaching (done with you):** Installments possible.

## Onboarding applications

Each form sends answers to its own Google Sheet via a Google Apps Script web app:

- **Media buying** → media buying applications sheet
- **1:1 coaching** → coaching applications sheet

A row is created as soon as someone completes step 1 (name + WhatsApp) and updates as they go. **Status** shows `In progress: reached step X of Y` or `Submitted`, so you can follow up with people who left early.

- Script: `Extensions → Apps Script` inside each sheet (both use the same script).
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
