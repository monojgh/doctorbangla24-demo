// Nexine Digital — site interactions
(function () {
  const header = document.getElementById('header');
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  // Sticky header style
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const setMenu = open => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.getElementById('navOverlay').addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) setMenu(false); });

  // In-page links (Start a Project, menu, footer): scroll with JS so they work
  // everywhere, including in-app browsers and previews that block #hash jumps.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      const target = id.length > 1 && document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      const y = target.getBoundingClientRect().top + window.pageYOffset - header.offsetHeight - 8;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      try { history.pushState(null, '', id); } catch (err) { /* ignore */ }
      // "Start a Project" / quote buttons: put the cursor in the form (desktop only, no surprise keyboard on phones)
      if (id === '#contact' && link.classList.contains('btn') && window.innerWidth > 900) {
        setTimeout(() => { const n = document.getElementById('name'); if (n) n.focus({ preventScroll: true }); }, 700);
      }
    });
  });

  // Active nav link on scroll
  const links = [...nav.querySelectorAll('a:not(.nav-cta)')];
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Count-up stats
  const counter = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, suffix = el.dataset.suffix || '+';
      let cur = 0; const step = Math.max(1, Math.ceil(end / 50));
      const t = setInterval(() => {
        cur = Math.min(end, cur + step);
        el.textContent = cur + suffix;
        if (cur >= end) clearInterval(t);
      }, 30);
      counter.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => counter.observe(el));

  // Portfolio filter
  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.work').forEach(w => w.classList.toggle('hide', f !== 'all' && w.dataset.cat !== f));
    });
  });

  // Contact form (AJAX to contact.php on Hostinger)
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    note.className = 'form-note';
    if (!form.querySelector('#name').value.trim() || !/^\S+@\S+\.\S+$/.test(form.querySelector('#email').value) || !form.querySelector('#message').value.trim()) {
      note.textContent = 'Please fill in your name, a valid email and project details.';
      note.classList.add('err');
      return;
    }
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true; note.textContent = 'Sending...';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        note.textContent = 'Thank you! We will get back to you within 24 hours.';
        note.classList.add('ok'); form.reset();
      } else {
        throw new Error(data.error || 'failed');
      }
    } catch (err) {
      note.textContent = 'Message could not be sent. Please email or WhatsApp us directly.';
      note.classList.add('err');
    } finally { btn.disabled = false; }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
