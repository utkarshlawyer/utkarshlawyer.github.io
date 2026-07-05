/* ============================================================
   AEQUIS LEGAL — SCRIPT.JS
   BCI modal · nav · counters · reveal · carousel · form
   ============================================================ */

(function () {
  'use strict';

  /* ── BCI DISCLAIMER MODAL ─────────────────────────────── */
  const overlay  = document.getElementById('bciOverlay');
  const agreeBtn = document.getElementById('bciAgree');
  const declineBtn = document.getElementById('bciDecline');

  function showBCI() {
    if (!localStorage.getItem('bci-agreed')) {
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function hideBCI() {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
    setTimeout(() => { overlay.style.display = 'none'; }, 520);
  }

  if (agreeBtn) {
    agreeBtn.addEventListener('click', function () {
      localStorage.setItem('bci-agreed', '1');
      hideBCI();
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener('click', function () {
      window.history.back();
      // fallback if no history
      setTimeout(() => { window.location.href = 'about:blank'; }, 300);
    });
  }

  document.addEventListener('DOMContentLoaded', showBCI);


  /* ── NAVIGATION ──────────────────────────────────────── */
  const header   = document.getElementById('siteHeader');
  const burger   = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', function () {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 60);
    // float pill visibility
    const pill = document.querySelector('.float-pill');
    if (pill) pill.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      const open = navLinks.classList.toggle('open');
      burger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // close on link click
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }


  /* ── SMOOTH SCROLL with header offset ───────────────── */
  document.addEventListener('click', function (e) {
    const target = e.target.closest('a[href^="#"]');
    if (!target) return;
    const href = target.getAttribute('href');
    if (href === '#') return;
    const el = document.querySelector(href);
    if (!el) return;
    e.preventDefault();
    const offset = (header ? header.offsetHeight : 72) + 16;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });


  /* ── INTERSECTION OBSERVER SETUP ────────────────────── */
  function makeObserver(callback, options) {
    if (!('IntersectionObserver' in window)) {
      // fallback: trigger immediately
      return { observe: function (el) { callback([{ target: el, isIntersecting: true }]); } };
    }
    return new IntersectionObserver(callback, options || { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });
  }


  /* ── COUNTER ANIMATION ───────────────────────────────── */
  function animateCounter(el) {
    const target    = parseFloat(el.getAttribute('data-target'));
    const duration  = 1600;
    const startTime = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function step(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value    = target * easeOut(progress);
      el.textContent = target % 1 === 0
        ? Math.round(value).toLocaleString('en-IN')
        : value.toFixed(1);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterObs = makeObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        if (obs.unobserve) obs.unobserve(entry.target);
      }
    });
  });

  document.querySelectorAll('.m-counter[data-target]').forEach(function (el) {
    counterObs.observe(el);
  });


  /* ── SCROLL REVEAL ───────────────────────────────────── */
  const revealObs = makeObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        // stagger siblings
        const siblings = entry.target.parentElement
          ? Array.from(entry.target.parentElement.querySelectorAll('[data-reveal]'))
          : [entry.target];
        const idx = siblings.indexOf(entry.target);
        setTimeout(function () {
          entry.target.classList.add('revealed');
        }, idx * 80);
        if (obs.unobserve) obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    revealObs.observe(el);
  });


  /* ── REVIEWS CAROUSEL ────────────────────────────────── */
  const slides   = document.querySelectorAll('.rev-slide');
  const dotsWrap = document.getElementById('revDots');
  const prevBtn  = document.getElementById('revPrev');
  const nextBtn  = document.getElementById('revNext');
  let   current  = 0;
  let   autoTimer;

  if (slides.length) {
    // build dots
    if (dotsWrap) {
      slides.forEach(function (_, i) {
        const d = document.createElement('div');
        d.className = 'rd' + (i === 0 ? ' active' : '');
        d.addEventListener('click', function () { goTo(i); });
        dotsWrap.appendChild(d);
      });
    }

    function goTo(idx) {
      slides[current].classList.remove('active');
      if (dotsWrap) dotsWrap.children[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      if (dotsWrap) dotsWrap.children[current].classList.add('active');
      restartAuto();
    }

    function restartAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(function () { goTo(current + 1); }, 5000);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

    // expose for inline onclick fallback
    window.prevReview = function () { goTo(current - 1); };
    window.nextReview = function () { goTo(current + 1); };

    goTo(0);
  }


  /* ── CONTACT FORM ────────────────────────────────────── */
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('cfSubmit');
  const success   = document.getElementById('cfSuccess');
  const error     = document.getElementById('cfError');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;
      }
      if (error) error.style.display = 'none';

      const data = new FormData(form);

      fetch(form.action, {
        method: form.method || 'POST',
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      })
        .then(function () {
          if (submitBtn) submitBtn.style.display = 'none';
          if (success)   success.style.display   = 'block';
          form.reset();

          // GA4
          if (typeof gtag === 'function') {
            gtag('event', 'generate_lead', {
              event_category: 'Contact',
              event_label:    'Aequis Legal Form Submit'
            });
          }
          // Meta Pixel
          if (typeof fbq === 'function') {
            fbq('track', 'Lead');
          }
        })
        .catch(function () {
          if (submitBtn) {
            submitBtn.textContent = 'Send Message →';
            submitBtn.disabled = false;
          }
          if (error) error.style.display = 'block';
        });
    });
  }

})();
