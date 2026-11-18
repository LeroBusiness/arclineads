/* Arcline Ads — site behaviour. The page works without this file; it adds motion and polish. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  /* Remember where this visit came from (utm tags, partner ?ref=, referrer).
     The application form sends it to the Arcline dashboard with the application. */
  try {
    if (!sessionStorage.getItem("arcline-source")) {
      var q = new URLSearchParams(location.search), src = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"].forEach(function (k) { var v = q.get(k); if (v) src[k] = v.slice(0, 500); });
      if (doc.referrer && doc.referrer.indexOf(location.origin) !== 0) src.referrer = doc.referrer.slice(0, 500);
      src.landing_page = location.pathname.slice(0, 200);
      sessionStorage.setItem("arcline-source", JSON.stringify(src));
    }
  } catch (e) {}

  /* Mobile menu */
  var menuBtn = doc.querySelector(".menu-btn"), menu = doc.getElementById("mobile-menu");
  if (menuBtn && menu) {
    var setMenu = function (open) { menu.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", String(open)); };
    menuBtn.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* Reveal on scroll, with a stagger inside each group */
  $$("[data-stagger]").forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.classList.add("reveal"); c.style.setProperty("--i", i); });
  });
  var reveals = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (n) { n.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    reveals.forEach(function (n) { io.observe(n); });
  }

  /* Count-up numbers: <dd data-count="35163" data-prefix="$"> */
  var fmt = function (el, v) {
    var dec = parseInt(el.dataset.decimals || "0", 10);
    return (el.dataset.prefix || "") + v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (el.dataset.suffix || "");
  };
  var count = function (el, delay) {
    var end = parseFloat(el.dataset.count), t0 = null, dur = 1600;
    el.textContent = fmt(el, 0);
    var tick = function (now) {
      if (t0 === null) t0 = now + (delay || 0);
      var p = Math.max(0, Math.min(1, (now - t0) / dur));
      el.textContent = fmt(el, end * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!reduce && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { count(e.target, e.target.closest(".tablet") ? 900 : 0); cio.unobserve(e.target); } });
    }, { threshold: 0.3 });
    $$("[data-count]").forEach(function (n) { cio.observe(n); });
  }

  /* Scroll-linked: header state, tablet tilt, step rail */
  var tablet = doc.querySelector(".tablet"), rail = doc.querySelector(".rail"), ticking = false;
  var onScroll = function () {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    root.classList.toggle("scrolled", y > 24);
    if (tablet && !reduce) {
      var r = tablet.parentNode.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.85)));
      var e = 1 - Math.pow(1 - p, 2);
      tablet.style.setProperty("--tilt", (24 * (1 - e)).toFixed(2) + "deg");
      tablet.style.setProperty("--scale", (0.9 + 0.1 * e).toFixed(4));
    }
    if (rail) {
      var rr = rail.getBoundingClientRect();
      rail.style.setProperty("--p", Math.max(0, Math.min(1, (vh * 0.8 - rr.top) / (vh * 0.45))).toFixed(3));
    }
  };
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* Cursor spotlight on cards */
  if (window.matchMedia("(hover: hover)").matches) {
    $$(".card").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", (e.clientX - r.left) + "px");
        c.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* Comparison chart tabs */
  var chart = doc.querySelector("[data-chart]");
  if (chart) {
    var data = JSON.parse(chart.dataset.chart), cols = $$(".col", chart), cap = doc.getElementById("chart-cap");
    var tabs = $$(".tabs button");
    var show = function (key) {
      var d = data[key];
      cols.forEach(function (col, i) {
        col.style.setProperty("--h", d.h[i]);
        col.querySelector(".val").textContent = d.v[i];
      });
      cap.textContent = d.cap;
      tabs.forEach(function (t) { t.setAttribute("aria-selected", String(t.dataset.key === key)); });
    };
    tabs.forEach(function (t) { t.addEventListener("click", function () { show(t.dataset.key); }); });
    /* grow the bars the first time the chart scrolls into view */
    if (!reduce && "IntersectionObserver" in window) {
      cols.forEach(function (col) { col.dataset.h = col.style.getPropertyValue("--h"); col.style.setProperty("--h", 0); });
      var chio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { cols.forEach(function (col) { col.style.setProperty("--h", col.dataset.h); }); chio.disconnect(); }
      }, { threshold: 0.4 });
      chio.observe(chart);
    }
  }

  /* Proof screenshot dialog */
  var dlg = doc.getElementById("proof-dialog");
  if (dlg && dlg.showModal) {
    $$("[data-open-proof]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); dlg.showModal(); }); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close(); });
  }

  /* More results */
  var moreBtn = doc.querySelector("[data-more]");
  if (moreBtn) {
    var extra = doc.getElementById(moreBtn.getAttribute("aria-controls"));
    moreBtn.addEventListener("click", function () {
      var open = extra.hidden;
      extra.hidden = !open;
      if (open) $$(".reveal", extra).forEach(function (n) { n.classList.add("in"); });
      moreBtn.setAttribute("aria-expanded", String(open));
      moreBtn.textContent = open ? "Show fewer results" : "Show more results";
    });
  }
})();
