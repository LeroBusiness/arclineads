/* Arcline Ads — site behaviour. Every page works without this file; it only adds polish. */
(function () {
  "use strict";
  var doc = document;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  /* Mobile menu */
  var menuBtn = $(".menu-btn"), menu = $("#mobile-menu");
  if (menuBtn && menu) {
    var setMenu = function (open) { menu.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", String(open)); };
    menuBtn.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* Reveal on scroll */
  var reveals = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (n) { n.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    reveals.forEach(function (n) { io.observe(n); });
  }

  /* Count-up numbers: <dd data-count="14.2" data-prefix="$" data-suffix="M" data-decimals="1"> */
  var counters = $$("[data-count]");
  if (counters.length && !reduce && "IntersectionObserver" in window) {
    var run = function (el) {
      var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || "0", 10);
      var pre = el.dataset.prefix || "", suf = el.dataset.suffix || "", t0 = performance.now(), dur = 1400;
      var tick = function (now) {
        var p = Math.min(1, (now - t0) / dur), v = end * (1 - Math.pow(1 - p, 3));
        el.textContent = pre + v.toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.4 });
    counters.forEach(function (n) { cio.observe(n); });
  }

  /* Rotating hero proof */
  var proof = $("[data-proof]");
  if (proof && !reduce) {
    var items = JSON.parse(proof.dataset.proof), bgs = ["#b8623f", "#8a5fb0", "#3f8fb0", "#3f9a6a"], i = 0;
    setInterval(function () {
      proof.classList.add("out");
      setTimeout(function () {
        i = (i + 1) % items.length;
        var it = items[i], av = $(".av", proof);
        av.textContent = it[0].split(/\s+/).map(function (w) { return w[0] || ""; }).join("").slice(0, 2).toUpperCase();
        av.style.background = bgs[i % bgs.length];
        $(".nm", proof).textContent = it[0];
        $(".rs", proof).textContent = it[1];
        $(".tm", proof).textContent = it[2];
        proof.classList.remove("out");
      }, 300);
    }, 3200);
  }

  /* Proof screenshot dialog */
  var dlg = $("#proof-dialog");
  if (dlg && dlg.showModal) {
    $$("[data-open-proof]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); dlg.showModal(); }); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close(); });
  }

  /* More results */
  var moreBtn = $("[data-more]");
  if (moreBtn) {
    var extra = doc.getElementById(moreBtn.getAttribute("aria-controls"));
    moreBtn.addEventListener("click", function () {
      var open = extra.hidden;
      extra.hidden = !open;
      moreBtn.setAttribute("aria-expanded", String(open));
      moreBtn.textContent = open ? "Show less ↑" : "View more results ↓";
    });
  }

  /* Testimonial carousel */
  var track = $("[data-chats]");
  if (track) {
    var step = function () { var c = track.firstElementChild; return c ? c.offsetWidth + 18 : 300; };
    var prev = $("[data-chat-prev]"), next = $("[data-chat-next]");
    if (prev) prev.addEventListener("click", function () { track.scrollLeft <= 4 ? track.scrollTo({ left: track.scrollWidth }) : track.scrollBy({ left: -step() }); });
    if (next) next.addEventListener("click", function () { track.scrollLeft + track.clientWidth >= track.scrollWidth - 4 ? track.scrollTo({ left: 0 }) : track.scrollBy({ left: step() }); });
  }

  /* Which-one quiz */
  var quiz = $("[data-quiz]");
  if (quiz) {
    var ans = {}, out = $(".quiz-result", quiz);
    var show = function () {
      if (!ans.q1 || !ans.q2) return;
      var coach = ans.q2 === "yes", title, text;
      if (coach) {
        title = "1:1 Coaching";
        text = ans.q1 === "yes" ? "Your store already works. We'll teach you to add Pinterest yourself." : "We'll teach you to launch and scale Pinterest on your own store.";
      } else {
        title = "Media buying";
        text = ans.q1 === "yes" ? "Your store already converts. Hand us Pinterest and we'll run it." : ans.q1 === "none" ? "No store yet? No problem. We'll help you get set up and run Pinterest for you." : "Not profitable yet? Hand us Pinterest and we'll build it for you.";
      }
      out.classList.toggle("c2", coach);
      $("b", out).textContent = title;
      $("p", out).textContent = text;
      var more = $("[data-res-more]", out), apply = $("[data-res-apply]", out);
      more.href = coach ? "/coaching/" : "/media-buying/";
      more.textContent = coach ? "How coaching works" : "How media buying works";
      apply.href = coach ? "/apply/coaching/" : "/apply/media-buying/";
      apply.textContent = coach ? "Apply for 1:1 coaching" : "Apply for media buying";
      apply.classList.toggle("c2", coach);
      out.hidden = false;
    };
    quiz.addEventListener("click", function (e) {
      var b = e.target.closest(".opt");
      if (!b) return;
      $$('.opt[data-q="' + b.dataset.q + '"]', quiz).forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      ans[b.dataset.q] = b.dataset.v;
      show();
    });
  }
})();
