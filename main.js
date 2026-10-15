/* PRIDE LINE — interactions */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header scroll state ---------- */
  var header = document.getElementById('header');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('header--scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  var menuClose = document.getElementById('menuClose');
  var menuOpen = false;

  function setMenu(open) {
    if (!menu || !burger) return;
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    if (open) {
      menu.hidden = false;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { menu.classList.add('is-open'); });
      });
      if (menuClose) menuClose.focus();
    } else {
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
      window.setTimeout(function () {
        if (!menuOpen) menu.hidden = true;
      }, reduceMotion ? 0 : 400);
      burger.focus();
    }
  }

  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menuOpen); });
    if (menuClose) menuClose.addEventListener('click', function () { setMenu(false); });
    menu.addEventListener('click', function (e) {
      if (e.target === menu) setMenu(false); /* click on backdrop */
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false); /* close after navigating */
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) setMenu(false);
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- parallax for atmosphere background ---------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (parallaxEls.length && !reduceMotion) {
    var ticking = false;
    var updateParallax = function () {
      ticking = false;
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var rect = el.parentElement.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(updateParallax); }
    }, { passive: true });
    window.addEventListener('resize', updateParallax);
    updateParallax();
  }

  /* ---------- FAQ accordion ---------- */
  var faqButtons = document.querySelectorAll('.faq__q');
  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      /* close others: single-open accordion */
      faqButtons.forEach(function (other) {
        if (other !== btn && other.getAttribute('aria-expanded') === 'true') {
          other.setAttribute('aria-expanded', 'false');
          var otherPanel = document.getElementById(other.getAttribute('aria-controls'));
          if (otherPanel) otherPanel.hidden = true;
        }
      });
      btn.setAttribute('aria-expanded', String(!expanded));
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) panel.hidden = expanded;
    });
  });

  /* ---------- copy promo code ---------- */
  var copyBtn = document.getElementById('copyPromo');
  var copyLabel = document.getElementById('copyPromoLabel');
  if (copyBtn && copyLabel) {
    var code = copyBtn.getAttribute('data-code') || 'PRIDELINE';
    var resetTimer = null;
    var done = function () {
      copyLabel.textContent = 'Скопировано: ' + code;
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(function () {
        copyLabel.textContent = 'Скопировать промокод';
      }, 2200);
    };
    var fallbackCopy = function () {
      var ta = document.createElement('textarea');
      ta.value = code;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* noop */ }
      document.body.removeChild(ta);
    };
    copyBtn.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done, fallbackCopy);
      } else {
        fallbackCopy();
      }
    });
  }

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

/* ---------- mobile sticky CTA ---------- */
(function () {
  'use strict';
  var bar = document.getElementById('mobileCta');
  if (!bar) return;
  var footer = document.querySelector('.footer');
  var past = false, atFooter = false;
  function update() { bar.classList.toggle('is-on', past && !atFooter); }
  window.addEventListener('scroll', function () {
    past = window.scrollY > 480;
    update();
  }, { passive: true });
  if (footer && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      atFooter = entries[0].isIntersecting;
      update();
    }, { threshold: 0.06 }).observe(footer);
  }
  update();
})();

/* ---------- lightweight event layer for future analytics ---------- */
(function () {
  'use strict';
  window.dataLayer = window.dataLayer || [];
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-track]') : null;
    if (t) {
      window.dataLayer.push({ event: 'pl_click', track: t.getAttribute('data-track'), ts: Date.now() });
    }
  }, true);
})();

/* ---------- traffer attribution: ?t=trf_xxx подставляется в ссылки бота ---------- */
(function () {
  'use strict';
  var m = location.search.match(/[?&]ref=(ref_[0-9]{1,10})/i) || location.search.match(/[?&]t=(trf_[a-z0-9]{1,12})/i);
  if (!m) return;
  var code = m[1];
  var fix = function () {
    document.querySelectorAll('a[href*="t.me/PrideLine1GateBot"]').forEach(function (a) {
      if (a.href.indexOf('start=') > -1) return;
      a.href = a.href + (a.href.indexOf('?') > -1 ? '&' : '?') + 'start=' + code;
    });
  };
  fix();
  document.addEventListener('DOMContentLoaded', fix);
})();

/* ---------- reviews: branded next-arrow ---------- */
(function () {
    var strip = document.querySelector('.reviews__carousel');
    var next = document.querySelector('.reviews__next');
    if (!strip || !next) { return; }
    function stepPx() {
      var card = strip.querySelector('.review-card');
      if (!card) { return strip.clientWidth; }
      var cs = getComputedStyle(strip);
      var gap = parseFloat(cs.columnGap || cs.gap || '0') || 0;
      return card.getBoundingClientRect().width + gap;
    }
    function update() {
      var end = strip.scrollWidth - strip.clientWidth - 8;
      next.classList.toggle('is-end', strip.scrollLeft >= end);
    }
    next.addEventListener('click', function () {
      strip.scrollBy({ left: stepPx(), behavior: 'smooth' });
    });
    strip.addEventListener('scroll', function () {
      window.requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
})();
