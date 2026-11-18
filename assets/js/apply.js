/* Arcline Ads — media buying application form.
   Every step goes to two places:
   1. The Google Sheet (Google Apps Script web app), as before.
   2. The Arcline dashboard API. On submit the applicant becomes a LEAD in
      OPS (no account, no email yet). We bill by hand, so the team contacts
      them and sends the dashboard invite from OPS once they have paid.
   The thank-you screen says we'll reach out. Someone who is already a client
   is sent to log in. (If the API is ever set to invite straight away, the
   "check your inbox" screen below takes over by itself.) */
(function () {
  "use strict";
  var root = document.getElementById("apply-app");
  if (!root) return;
  // Google Apps Script web app URL (must end in /exec).
  var ENDPOINT = "https://script.google.com/macros/s/AKfycbxVLfRMuspbXuTHb00utXSpZwKJlrKKlVnYpT6_1h3nRYEL7kJ-wP_gR02ljIOC6Naz/exec";
  var KEY = "arcline-onboarding-v5";
  // Arcline dashboard: the API that creates the account, and where clients log in.
  var API = "https://api-production-164d65a9.up.railway.app/api/website/applications";
  var APP_URL = "https://client.arclineads.com";
  var APP_KEY = "arcline-application";   // { id, token } handed out by the API
  var SOURCE_KEY = "arcline-source";     // utm/ref/referrer of this visit (set in site.js too)

  var COUNTRIES = [["🇺🇸","United States","+1","US"],["🇬🇧","United Kingdom","+44","GB"],["🇨🇦","Canada","+1","CA"],["🇦🇺","Australia","+61","AU"],["🇳🇿","New Zealand","+64","NZ"],["🇮🇪","Ireland","+353","IE"],["🇩🇪","Germany","+49","DE"],["🇫🇷","France","+33","FR"],["🇳🇱","Netherlands","+31","NL"],["🇧🇪","Belgium","+32","BE"],["🇪🇸","Spain","+34","ES"],["🇮🇹","Italy","+39","IT"],["🇵🇹","Portugal","+351","PT"],["🇨🇭","Switzerland","+41","CH"],["🇦🇹","Austria","+43","AT"],["🇸🇪","Sweden","+46","SE"],["🇳🇴","Norway","+47","NO"],["🇩🇰","Denmark","+45","DK"],["🇫🇮","Finland","+358","FI"],["🇵🇱","Poland","+48","PL"],["🇷🇴","Romania","+40","RO"],["🇬🇷","Greece","+30","GR"],["🇲🇰","North Macedonia","+389","MK"],["🇷🇸","Serbia","+381","RS"],["🇭🇷","Croatia","+385","HR"],["🇧🇬","Bulgaria","+359","BG"],["🇦🇱","Albania","+355","AL"],["🇹🇷","Turkey","+90","TR"],["🇦🇪","UAE","+971","AE"],["🇸🇦","Saudi Arabia","+966","SA"],["🇿🇦","South Africa","+27","ZA"],["🇮🇳","India","+91","IN"],["🇸🇬","Singapore","+65","SG"],["🇲🇽","Mexico","+52","MX"],["🇧🇷","Brazil","+55","BR"]];

  var S = {
    contact: { type: "contact", title: "First, where can we reach you?" },
    store: { type: "single", q: "Shopify store", title: "Do you currently have a Shopify store?", options: ["Yes", "No"] },
    newStore: { type: "single", q: "Start a new store", title: "Do you want to start a new store and onboard it with Arcline?", options: ["Yes", "No"] },
    revenue: { type: "single", q: "Monthly revenue", title: "What is your current monthly store revenue?", options: ["€0 – 5k", "€5 – 20k", "€20 – 50k", "€50 – 150k", "€150k+"] },
    niche: { type: "single", q: "Niche", title: "Which niche are you in?", options: ["Fashion & apparel", "Home & decor", "Beauty & skincare", "Jewelry & accessories", "Health & wellness", "Kids & baby", "Other"] },
    platforms: { type: "single", q: "Ad platforms", title: "Which advertising platforms are you running?", options: ["Meta", "Google", "TikTok", "Meta + Google", "3 or more platforms", "None yet"] },
    pinAcct: { type: "single", q: "Pinterest accounts", title: "Do you already have a Pinterest Business Account + Ad Account?", options: ["Yes, both", "Business account only", "Not yet"] },
    catalog: { type: "single", q: "Catalogue", title: "What is your Pinterest Catalogue status?", options: ["Connected & approved", "Connected, but has errors", "Not set up yet", "Not sure"] },
    budget: { type: "single", q: "Ad budget", title: "What is your monthly ad budget?", options: ["€1 – 4k", "€5 – 10k", "€10 – 20k", "€20k+"] },
    roas: { type: "roas", q: "BER / Target ROAS", title: "What is your BER and Target ROAS?", sub: "Your break-even ROAS and the return you aim for." },
    expect: { type: "text", q: "Expectations", title: "What do you expect from Arcline?", ph: "Briefly tell us what you hope to achieve..." }
  };
  var EMPTY = { first: "", last: "", company: "", email: "", country: "0", phone: "", store: "", newStore: "", url: "", revenue: "", niche: "", platforms: "", pinAcct: "", catalog: "", budget: "", ber: "", target: "", expect: "" };

  var st = { step: 0, f: Object.assign({}, EMPTY), err: "", sent: false, busy: false, status: null, resend: "" };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && saved.f) { st.step = saved.step || 0; st.f = Object.assign({}, EMPTY, saved.f); }
  } catch (e) {}
  var leadId = null, advTimer = null;

  function route() {
    var f = st.f;
    var r = ["contact", "store"];
    if (f.store === "No") return r.concat(["newStore"], f.newStore === "No" ? ["expect"] : ["budget", "expect"]);
    return r.concat(["revenue", "niche", "platforms", "pinAcct"], f.pinAcct === "Not yet" ? [] : ["catalog"], ["budget", "roas", "expect"]);
  }
  function save() {
    try { if (st.sent) localStorage.removeItem(KEY); else localStorage.setItem(KEY, JSON.stringify({ step: st.step, f: st.f })); } catch (e) {}
  }
  function validate() {
    var f = st.f, id = route()[st.step], s = S[id];
    if (id === "contact") {
      if (!f.first.trim() || !f.last.trim()) return "Please add your first and last name.";
      if (!f.company.trim()) return "Please add your company or brand name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return "Please enter a valid email address.";
      if (f.phone.replace(/\D/g, "").length < 6) return "Please enter your WhatsApp number.";
    }
    if (s.type === "single" && !f[id]) return "Pick one option to continue.";
    if (id === "store" && f.store === "Yes" && f.url.trim().length < 4) return "Please add your store URL.";
    if (id === "roas" && (!f.ber.trim() || !f.target.trim())) return "Please add both numbers. A rough estimate is fine.";
    if (s.type === "text" && f[id].trim().length < 3) return "Tell us in a sentence or two.";
    return "";
  }
  function answers() {
    var f = st.f, c = COUNTRIES[+f.country] || COUNTRIES[0];
    var out = { Name: (f.first + " " + f.last).trim(), Email: f.email, Prefix: c[3] + " " + c[2], WhatsApp: "'" + f.phone.replace(/\D/g, "") };
    out.Company = f.company;
    route().slice(1).forEach(function (id) {
      if (id === "roas") out["BER / Target ROAS"] = f.ber + " / " + f.target;
      else out[S[id].q] = f[id];
      if (id === "store" && f.store === "Yes") out["Store URL"] = f.url;
    });
    return out;
  }
  function lid() {
    if (!leadId) { try { leadId = localStorage.getItem(KEY + "-id"); } catch (e) {} }
    if (!leadId) { leadId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7); try { localStorage.setItem(KEY + "-id", leadId); } catch (e) {} }
    return leadId;
  }
  function sync(status) {
    var body = JSON.stringify(Object.assign({ ID: lid(), Status: status, Updated: new Date().toLocaleString("en-GB") }, answers()));
    return fetch(ENDPOINT, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body }).catch(function () {});
  }

  /* Arcline dashboard API */
  function captureSource() {
    try {
      if (sessionStorage.getItem(SOURCE_KEY)) return;
      var q = new URLSearchParams(location.search), out = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"].forEach(function (k) { var v = q.get(k); if (v) out[k] = v.slice(0, 500); });
      if (document.referrer && document.referrer.indexOf(location.origin) !== 0) out.referrer = document.referrer.slice(0, 500);
      out.landing_page = location.pathname.slice(0, 200);
      sessionStorage.setItem(SOURCE_KEY, JSON.stringify(out));
    } catch (e) {}
  }
  function source() { try { return JSON.parse(sessionStorage.getItem(SOURCE_KEY) || "{}"); } catch (e) { return {}; } }
  function getApp() { try { return JSON.parse(localStorage.getItem(APP_KEY) || "null"); } catch (e) { return null; } }
  function setApp(a) { try { if (a) localStorage.setItem(APP_KEY, JSON.stringify(a)); else localStorage.removeItem(APP_KEY); } catch (e) {} }
  function apiCall(path, opts) {
    var headers = { "Content-Type": "application/json" };
    if (opts.token) headers["X-Application-Token"] = opts.token;
    return fetch(API + path, { method: opts.method, headers: headers, body: opts.body ? JSON.stringify(opts.body) : undefined }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) { var err = new Error(data && data.message || "Request failed"); err.status = res.status; throw err; }
        return data;
      });
    });
  }
  function contactPayload() {
    var f = st.f, c = COUNTRIES[+f.country] || COUNTRIES[0], digits = f.phone.replace(/\D/g, "");
    return {
      first_name: f.first.trim(), last_name: f.last.trim(), email: f.email.trim(),
      company_name: f.company.trim() || null,
      phone: digits ? (c[2] + " " + digits).slice(0, 40) : null,
      store_url: f.store === "Yes" && f.url.trim() ? f.url.trim() : null,
      marketing_optin: true
    };
  }
  var ANSWER_KEYS = { store: "shopify_store", newStore: "start_new_store", revenue: "monthly_revenue", niche: "niche", platforms: "ad_platforms", pinAcct: "pinterest_accounts", catalog: "catalogue", budget: "ad_budget", expect: "expectations" };
  function answersPayload() {
    var f = st.f, out = {}, c = COUNTRIES[+f.country] || COUNTRIES[0];
    out.country = c[1];
    route().slice(1).forEach(function (id) {
      if (id === "roas") { out.break_even_roas = f.ber.trim(); out.target_roas = f.target.trim(); }
      else if (ANSWER_KEYS[id] && f[id]) out[ANSWER_KEYS[id]] = String(f[id]).slice(0, 5000);
    });
    return out;
  }
  function progress(stepIndex) {
    var r = route();
    return { step: r[Math.min(stepIndex, r.length - 1)], steps_completed: stepIndex + 1, total_steps: r.length };
  }
  function apiStart(stepIndex) {
    return apiCall("", { method: "POST", body: { contact: contactPayload(), progress: progress(stepIndex), source: source(), website: "" } })
      .then(function (a) { setApp({ id: a.id, token: a.token }); return a; });
  }
  // One call at a time, in order: a quick second click must not start a second application.
  var queue = Promise.resolve();
  function enqueue(fn) { queue = queue.then(fn, fn); return queue; }
  // A step is done. Starts the application when there is none yet (or the old one is gone).
  function apiSave(stepIndex) { return enqueue(function () { return saveNow(stepIndex); }); }
  function saveNow(stepIndex) {
    var a = getApp();
    if (!a || a.submitted) return apiStart(stepIndex).catch(function () {});
    return apiCall("/" + a.id, { method: "PATCH", token: a.token, body: { contact: contactPayload(), answers: answersPayload(), progress: progress(stepIndex) } })
      .catch(function (e) {
        if ([400, 401, 404, 409].indexOf(e.status) >= 0) { setApp(null); return apiStart(stepIndex).then(function () { if (stepIndex > 0) return saveNow(stepIndex); }).catch(function () {}); }
      });
  }
  // Final step. Resolves with "invited", "existing_client", "invite_failed" or null when the API failed.
  function apiSubmit() { return enqueue(submitNow); }
  function submitNow() {
    var i = route().length - 1;
    var body = { contact: contactPayload(), answers: answersPayload(), progress: progress(i) };
    var a = getApp();
    var go = function (app) {
      return apiCall("/" + app.id + "/submit", { method: "POST", token: app.token, body: body })
        .then(function (r) { setApp({ id: app.id, token: app.token, submitted: true }); return r.status; });
    };
    var first = a && !a.submitted ? go(a).catch(function (e) {
      if ([401, 404].indexOf(e.status) >= 0) { setApp(null); return apiStart(i).then(go); }
      throw e;
    }) : apiStart(i).then(go);
    return first.catch(function () { return null; });
  }
  function apiResend() {
    var a = getApp();
    if (!a) return Promise.reject(new Error("none"));
    return apiCall("/" + a.id + "/resend-invite", { method: "POST", token: a.token });
  }

  function next() {
    clearTimeout(advTimer);
    var e = validate();
    if (e) { st.err = e; render(true); return; }
    var r = route();
    if (st.step >= r.length - 1) { submit(); return; }
    var nx = st.step + 1;
    sync("In progress: reached step " + (nx + 1) + " of " + r.length + " (" + S[r[nx]].title + ")");
    apiSave(st.step);
    st.step = nx; st.err = "";
    render(); window.scrollTo(0, 0);
  }
  function resend() {
    st.resend = "sending"; render();
    apiResend().then(function () { st.resend = "Invite sent again. Check your inbox."; })
      .catch(function () { st.resend = "Couldn't send it again just yet. Please wait a few minutes and try again."; })
      .then(function () { render(); });
  }
  function back() { clearTimeout(advTimer); st.step = Math.max(0, st.step - 1); st.err = ""; render(); window.scrollTo(0, 0); }
  function submit() {
    st.busy = true; render();
    var account = apiSubmit();
    Promise.all([sync("Submitted"), account]).then(function (res) {
      try { localStorage.removeItem(KEY + "-id"); } catch (e) {}
      leadId = null; st.sent = true; st.busy = false; st.status = res[1] || null;
      render(); window.scrollTo(0, 0);
      try { history.replaceState(null, "", "#thank-you"); } catch (e) {}
    });
  }

  /* Rendering */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "text") n.textContent = v;
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v);
      else if (k === "value") n.value = v;
      else n.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function input(key, attrs) {
    return el("input", Object.assign({ class: "inp", value: st.f[key], oninput: function (e) { st.f[key] = e.target.value; st.err = ""; save(); } }, attrs));
  }
  var bar = document.getElementById("apply-progress");

  function render(keepFocus) {
    save();
    root.textContent = "";
    if (st.sent) {
      if (bar) bar.style.width = "100%";
      var email = st.f.email.trim();
      if (st.status === "invited") {
        root.appendChild(el("div", { class: "done" }, [
          el("div", { class: "ok", "aria-hidden": "true", text: "✓" }),
          el("div", { class: "step-label", text: "Application received" }),
          el("h1", { text: "Check your inbox, " + st.f.first.trim() + "." }),
          el("p", {}, [document.createTextNode("We sent an invite to "), el("strong", { text: email }), document.createTextNode(". Click the link inside to set your password and open your Arcline dashboard. Your setup checklist is waiting there.")]),
          el("p", { text: "Don't see it? Check your spam folder." }),
          el("button", { type: "button", class: "btn ghost", disabled: st.resend === "sending", onclick: resend, text: st.resend === "sending" ? "Sending…" : "Send the invite again" }),
          st.resend && st.resend !== "sending" ? el("p", { class: "note", role: "status", text: st.resend }) : null,
          el("p", { class: "note" }, [document.createTextNode("Already set your password? "), el("a", { class: "link", href: APP_URL + "/auth", text: "Log in to your dashboard" })])
        ]));
        return;
      }
      if (st.status === "existing_client") {
        root.appendChild(el("div", { class: "done" }, [
          el("div", { class: "ok", "aria-hidden": "true", text: "✓" }),
          el("div", { class: "step-label", text: "Welcome back" }),
          el("h1", { text: "You already have an account." }),
          el("p", {}, [el("strong", { text: email }), document.createTextNode(" is already an Arcline client. Log in to go to your dashboard.")]),
          el("a", { class: "btn", href: APP_URL + "/auth", text: "Log in" })
        ]));
        return;
      }
      root.appendChild(el("div", { class: "done" }, [
        el("div", { class: "ok", "aria-hidden": "true", text: "✓" }),
        el("div", { class: "step-label", text: "Application received" }),
        el("h1", { text: "Thank you, " + st.f.first.trim() + "." }),
        el("p", { text: "We've got your application. Our team will review it and reach out to you within a few hours." }),
        el("a", { class: "btn ghost", href: "/", text: "Back to site" })
      ]));
      return;
    }
    var r = route(), i = Math.min(st.step, r.length - 1), id = r[i], s = S[id], f = st.f;
    st.step = i;
    if (bar) bar.style.width = Math.round((i / r.length) * 100) + "%";
    var last = i === r.length - 1, single = s.type === "single", showUrl = id === "store" && f.store === "Yes";

    root.appendChild(el("div", { class: "step-label", text: "Step " + (i + 1) + " of " + r.length }));
    var h1 = el("h1", { text: s.title, tabindex: "-1" });
    root.appendChild(h1);
    if (s.sub) root.appendChild(el("p", { class: "sub", text: s.sub }));

    var fields = el("div", { class: "fields" });
    if (id === "contact") {
      fields.appendChild(el("div", { class: "frow" }, [
        input("first", { placeholder: "First name *", "aria-label": "First name", autocomplete: "given-name" }),
        input("last", { placeholder: "Last name *", "aria-label": "Last name", autocomplete: "family-name" })
      ]));
      fields.appendChild(input("company", { placeholder: "Company / brand name *", "aria-label": "Company or brand name", autocomplete: "organization" }));
      fields.appendChild(input("email", { type: "email", placeholder: "Email address * (e.g. you@domain.com)", "aria-label": "Email address", autocomplete: "email" }));
      var sel = el("select", { class: "inp", "aria-label": "Country code", onchange: function (e) { st.f.country = e.target.value; save(); } },
        COUNTRIES.map(function (c, k) { return el("option", { value: String(k), text: c[0] + "  " + c[1] + " (" + c[2] + ")" }); }));
      sel.value = f.country;
      fields.appendChild(el("div", { class: "frow" }, [sel, input("phone", { type: "tel", inputmode: "tel", placeholder: "WhatsApp number *", "aria-label": "WhatsApp number", autocomplete: "tel-national" })]));
    }
    if (single) {
      s.options.forEach(function (label) {
        var on = f[id] === label;
        fields.appendChild(el("button", { type: "button", class: "choice", "aria-pressed": String(on), onclick: function () {
          st.f[id] = label; st.err = "";
          render();
          if (!(id === "store" && label === "Yes")) advTimer = setTimeout(next, 260);
          else { var u = root.querySelector('input[type="url"]'); if (u) u.focus(); }
        } }, [el("span", { text: label }), el("i", { "aria-hidden": "true", text: on ? "✓" : "" })]));
      });
    }
    if (showUrl) fields.appendChild(el("label", { class: "flabel" }, [document.createTextNode("Your store URL *"), input("url", { type: "url", placeholder: "yourstore.com" })]));
    if (id === "roas") {
      fields.appendChild(el("div", { class: "frow" }, [
        el("label", { class: "flabel" }, [document.createTextNode("Break-even ROAS"), input("ber", { inputmode: "decimal", placeholder: "e.g. 1.8" })]),
        el("label", { class: "flabel" }, [document.createTextNode("Target ROAS"), input("target", { inputmode: "decimal", placeholder: "e.g. 3.0" })])
      ]));
    }
    if (s.type === "text") {
      fields.appendChild(el("textarea", { class: "inp", rows: "5", placeholder: s.ph, "aria-label": s.title, value: f[id], oninput: function (e) { st.f[id] = e.target.value; st.err = ""; save(); } }));
    }
    root.appendChild(fields);
    if (st.err) root.appendChild(el("div", { class: "err", role: "alert", text: st.err }));

    root.appendChild(el("div", { class: "form-nav" }, [
      i > 0 ? el("button", { type: "button", class: "back-btn", onclick: back, text: "← Back" }) : el("span"),
      (!single || showUrl) ? el("button", { type: "button", class: "btn", disabled: st.busy, onclick: next, text: st.busy ? "Sending…" : (last ? "Submit application" : "Continue") }) : null
    ]));
    if (i === 0) {
      var note = el("p", { class: "privacy-note" });
      note.appendChild(document.createTextNode("Your answers are saved as you go so we can follow up. See our "));
      note.appendChild(el("a", { href: "/privacy/", text: "Privacy Policy" }));
      note.appendChild(document.createTextNode("."));
      root.appendChild(note);
    }
    if (!keepFocus && s.type !== "single") { var first = root.querySelector("input, textarea"); if (first && window.innerWidth > 899) first.focus(); }
  }

  root.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName === "INPUT") { e.preventDefault(); next(); }
  });
  captureSource();
  render(true);
})();
