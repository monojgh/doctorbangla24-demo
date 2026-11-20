/* Medinest Digital — site scripts */
(function () {
  "use strict";
  var WHATSAPP = "919163229122";
  var lang = "en";

  /* ---------- Language toggle (English / বাংলা) ---------- */
  var bnEls = document.querySelectorAll("[data-bn]");
  var phEls = document.querySelectorAll("[data-bn-ph]");
  bnEls.forEach(function (el) { el.dataset.en = el.innerHTML; });
  phEls.forEach(function (el) { el.dataset.enPh = el.placeholder; });

  function setLang(l) {
    lang = l;
    document.documentElement.lang = l;
    bnEls.forEach(function (el) { el.innerHTML = l === "bn" ? el.dataset.bn : el.dataset.en; });
    phEls.forEach(function (el) { el.placeholder = l === "bn" ? el.dataset.bnPh : el.dataset.enPh; });
    document.querySelectorAll(".lang-opt").forEach(function (o) { o.classList.toggle("active", o.dataset.lang === l); });
    renderPortfolio(currentFilter);
    try { localStorage.setItem("md-lang", l); } catch (e) {}
  }
  document.getElementById("langToggle").addEventListener("click", function () { setLang(lang === "en" ? "bn" : "en"); });

  /* ---------- Header + mobile menu ---------- */
  var header = document.getElementById("header");
  var nav = document.getElementById("nav");
  var menuBtn = document.getElementById("menuBtn");
  var toTop = document.getElementById("toTop");
  function setMenu(open) {
    nav.classList.toggle("open", open); menuBtn.classList.toggle("open", open);
    document.documentElement.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  menuBtn.addEventListener("click", function (e) { e.stopPropagation(); setMenu(!nav.classList.contains("open")); });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("click", function (e) { if (nav.classList.contains("open") && !nav.contains(e.target)) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 1100) setMenu(false); });
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 10);
    toTop.classList.toggle("show", y > 600);
    // active nav link
    var pos = y + 120;
    document.querySelectorAll("section[id]").forEach(function (s) {
      var link = nav.querySelector('a[href="#' + s.id + '"]:not(.btn)');
      if (link) link.classList.toggle("active", pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Portfolio ---------- */
  var grid = document.getElementById("portfolioGrid");
  var items = window.PORTFOLIO || [];
  var currentFilter = "all";
  var visible = [];
  var catNames = {
    website: ["Website", "ওয়েবসাইট"], app: ["Software / App", "সফটওয়্যার / অ্যাপ"], poster: ["Poster Design", "পোস্টার ডিজাইন"],
    social: ["Social Media", "সোশ্যাল মিডিয়া"], google: ["Google Profile", "গুগল প্রোফাইল"], print: ["Printing", "প্রিন্টিং"]
  };
  function title(it) { return lang === "bn" ? (it.bn || it.en) : (it.en || it.bn); }
  function catName(c) { var n = catNames[c] || [c, c]; return lang === "bn" ? n[1] : n[0]; }

  function renderPortfolio(filter) {
    currentFilter = filter;
    visible = items.filter(function (it) { return filter === "all" || it.cat === filter; });
    grid.innerHTML = "";
    visible.forEach(function (it, i) {
      var el = document.createElement("div");
      el.className = "work";
      el.tabIndex = 0;
      el.style.animationDelay = (i * 0.05) + "s";
      el.innerHTML = '<img loading="lazy" alt=""><span class="work-zoom">⤢</span><div class="work-info"><small></small><h4></h4></div>';
      el.querySelector("img").src = it.img;
      el.querySelector("img").alt = title(it);
      if (it.fit === "contain") { el.classList.add("fit-contain"); el.style.background = it.bg || "#fff"; }
      el.querySelector("small").textContent = catName(it.cat);
      el.querySelector("h4").textContent = title(it);
      el.addEventListener("click", function () { openLb(i); });
      el.addEventListener("keydown", function (e) { if (e.key === "Enter") openLb(i); });
      grid.appendChild(el);
    });
  }
  document.getElementById("filters").addEventListener("click", function (e) {
    var b = e.target.closest(".filter"); if (!b) return;
    document.querySelectorAll(".filter").forEach(function (f) { f.classList.remove("active"); });
    b.classList.add("active");
    renderPortfolio(b.dataset.filter);
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox"), lbImg = document.getElementById("lbImg"), lbCap = document.getElementById("lbCap"), lbIndex = 0;
  function showLb() { var it = visible[lbIndex]; lbImg.src = it.img; lbImg.alt = title(it); lbCap.textContent = title(it) + "  •  " + catName(it.cat); }
  function openLb(i) { lbIndex = i; showLb(); lb.hidden = false; document.body.style.overflow = "hidden"; }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ""; }
  function step(d) { lbIndex = (lbIndex + d + visible.length) % visible.length; showLb(); }
  document.getElementById("lbClose").addEventListener("click", closeLb);
  document.getElementById("lbPrev").addEventListener("click", function () { step(-1); });
  document.getElementById("lbNext").addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb(); else if (e.key === "ArrowLeft") step(-1); else if (e.key === "ArrowRight") step(1);
  });

  /* ---------- Reveal on scroll + counters ---------- */
  function countUp(el) {
    var end = +el.dataset.count, suf = el.dataset.suffix || "", t0 = null;
    function f(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        en.target.querySelectorAll(".counter").forEach(countUp);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
    document.querySelectorAll(".counter").forEach(function (c) { c.textContent = c.dataset.count + (c.dataset.suffix || ""); });
  }

  /* ---------- Contact form → WhatsApp ---------- */
  var form = document.getElementById("contactForm"), err = document.getElementById("formError");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.name.value.trim(), phone = form.phone.value.trim();
    if (!name || !/^[6-9]\d{9}$/.test(phone)) {
      err.textContent = lang === "bn" ? "দয়া করে আপনার নাম ও সঠিক ১০ সংখ্যার মোবাইল নম্বর লিখুন।" : "Please enter your name and a valid 10-digit mobile number.";
      err.hidden = false; return;
    }
    err.hidden = true;
    var msg = "Hello Medinest Digital,%0A%0A" +
      "Name: " + encodeURIComponent(name) + "%0A" +
      "Mobile: " + encodeURIComponent(phone) + "%0A" +
      "Service: " + encodeURIComponent(form.service.value) + "%0A" +
      "Message: " + encodeURIComponent(form.message.value.trim());
    window.open("https://wa.me/" + WHATSAPP + "?text=" + msg, "_blank");
  });

  /* ---------- Init ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
  var saved = "en";
  try { saved = localStorage.getItem("md-lang") || "en"; } catch (e) {}
  setLang(saved === "bn" ? "bn" : "en");
  onScroll();
})();
