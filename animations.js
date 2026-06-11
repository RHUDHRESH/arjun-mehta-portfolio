/**
 * Arjun Mehta — Palace Folio
 * Editorial reveals · arch intro · tabbed realms
 * Intentionally NOT Site 2's scroll-pin cinematic stack.
 */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  let pendingHash = window.location.hash;

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  /* ══════════════════════════════════════════
     ARCH INTRO — curtain reveal, not frame preloader
     ══════════════════════════════════════════ */
  function initArchIntro() {
    const intro = qs('#arch-intro');
    if (!intro) return Promise.resolve();

    document.body.classList.add('is-intro-lock');

    if (prefersReduced || !hasGsap) {
      intro.remove();
      document.body.classList.remove('is-intro-lock');
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const shape = qs('.arch-intro__shape', intro);
      const name = qs('.arch-intro__name', intro);
      const tag = qs('.arch-intro__tag', intro);

      const tl = gsap.timeline({
        onComplete: () => {
          intro.classList.add('is-done');
          document.body.classList.remove('is-intro-lock');
          intro.remove();
          resolve();
        },
      });

      gsap.set([name, tag], { opacity: 0, y: 12 });
      gsap.set(shape, { scale: 0.6, opacity: 0 });

      tl.to(shape, { scale: 1, opacity: 1, duration: 0.9, ease: 'power3.out' })
        .to(name, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
        .to(tag, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
        .to({}, { duration: 0.5 })
        .to(intro, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.85,
          ease: 'power3.inOut',
        })
        .to(intro, { opacity: 0, duration: 0.2 }, '-=0.15');
    });
  }

  /* ══════════════════════════════════════════
     HEADER + FOLIO MENU
     ══════════════════════════════════════════ */
  function initHeader() {
    const header = qs('#folio-header');
    const menuBtn = qs('.folio-header__menu');
    const menu = qs('#folio-menu');
    if (!header) return;

    const onScroll = () => {
      const heroThreshold = window.innerHeight;
      header.classList.toggle('is-scrolled', window.scrollY >= heroThreshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (menuBtn && menu) {
      menuBtn.addEventListener('click', () => {
        const open = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', String(!open));
        menu.classList.toggle('is-open', !open);
        menu.setAttribute('aria-hidden', String(open));
      });

      qsa('.folio-menu a').forEach((link) => {
        link.addEventListener('click', () => {
          menuBtn.setAttribute('aria-expanded', 'false');
          menu.classList.remove('is-open');
          menu.setAttribute('aria-hidden', 'true');
        });
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) {
          menuBtn.setAttribute('aria-expanded', 'false');
          menu.classList.remove('is-open');
          menu.setAttribute('aria-hidden', 'true');
        }
      });
    }
  }

  /* ══════════════════════════════════════════
     CHAPTER RAIL — folio page markers
     ══════════════════════════════════════════ */
  function initChapterRail() {
    const rail = qs('.chapter-rail');
    if (!rail) return;

    const links = qsa('.chapter-rail a');
    const sections = links
      .map((a) => {
        const id = a.getAttribute('href')?.slice(1);
        return id ? qs(`#${id}`) : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    const sectionField = qs('#sourceSection');

    const setActive = (id) => {
      if (sectionField) sectionField.value = id;
      links.forEach((a) => {
        const match = a.getAttribute('href') === `#${id}`;
        a.classList.toggle('is-active', match);
        if (match) a.setAttribute('aria-current', 'section');
        else a.removeAttribute('aria-current');
      });
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(entry.target.id);
          });
        },
        { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
      );
      sections.forEach((s) => obs.observe(s));
    }
  }

  /* ══════════════════════════════════════════
     EDITORIAL REVEALS — fade up, no pinning
     ══════════════════════════════════════════ */
  function revealElement(el) {
    const delay = parseFloat(el.dataset.delay || '0') * 1000;
    if (delay > 0) {
      setTimeout(() => el.classList.add('is-visible'), delay);
    } else {
      el.classList.add('is-visible');
    }
  }

  function initReveals() {
    const heroCopy = qs('.folio-hero__copy');
    if (heroCopy) heroCopy.classList.add('is-visible');

    const items = qsa('.folio-reveal');
    if (!items.length) return;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealElement(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach((el) => obs.observe(el));
  }

  /* ══════════════════════════════════════════
     REALM TABS — destination folio switcher
     ══════════════════════════════════════════ */
  function initRealmTabs() {
    const tabs = qsa('.realm-tabs button');
    const panels = qsa('.realm-panel');
    if (!tabs.length || !panels.length) return;

    const syncTabIndex = (activeTab) => {
      tabs.forEach((t) => {
        t.tabIndex = t === activeTab ? 0 : -1;
      });
    };

    syncTabIndex(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const realm = tab.dataset.realm;
        tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
        syncTabIndex(tab);

        panels.forEach((panel) => {
          const active = panel.dataset.realm === realm;
          panel.classList.toggle('is-active', active);
          panel.hidden = !active;

          if (active && !prefersReduced && hasGsap) {
            const textBlock = qs('.realm-panel__copy', panel);
            const mainHero = qs('.realm-panel__hero', panel);
            const thumbnails = qsa('.realm-panel__thumbs figure', panel);

            gsap.killTweensOf([textBlock, mainHero, thumbnails]);
            gsap.set([textBlock, mainHero, thumbnails], { opacity: 0, y: 25 });
            gsap.to([textBlock, mainHero, ...thumbnails], {
              opacity: 1,
              y: 0,
              duration: 0.85,
              stagger: 0.12,
              ease: 'power2.out',
              clearProps: 'transform',
            });

            qsa('.folio-reveal', panel).forEach((el) => {
              if (!el.classList.contains('is-visible')) revealElement(el);
            });
          } else if (active && !prefersReduced) {
            qsa('.folio-reveal', panel).forEach((el) => {
              if (!el.classList.contains('is-visible')) revealElement(el);
            });
          }
        });
      });
    });
  }

  /* ══════════════════════════════════════════
     LIGHTBOX
     ══════════════════════════════════════════ */
  function initLightbox() {
    const box = qs('#lightbox');
    const dataEl = qs('#lightbox-data');
    if (!box || !dataEl) return;

    let items = [];
    try { items = JSON.parse(dataEl.textContent); } catch (_) { return; }

    const thumbSrc = (src) => {
      if (!src || src.includes('-sm.webp') || src.includes('-lq.webp')) return src;
      return src.endsWith('.webp') ? src.replace(/\.webp$/, '-sm.webp') : src;
    };

    const img = qs('.lightbox__img', box);
    const cap = qs('.lightbox__cap', box);
    let idx = 0;

    const strip = document.createElement('div');
    strip.className = 'lightbox__strip';
    strip.setAttribute('aria-label', 'Gallery thumbnails');
    items.forEach((item, i) => {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'lightbox__strip-thumb';
      thumb.dataset.index = String(i);
      thumb.setAttribute('aria-label', `View photo ${i + 1}`);
      const thumbImg = document.createElement('img');
      thumbImg.src = thumbSrc(item.src);
      thumbImg.alt = '';
      thumbImg.width = 44;
      thumbImg.height = 44;
      thumbImg.loading = 'lazy';
      thumbImg.addEventListener('error', () => { thumbImg.src = item.src; }, { once: true });
      thumb.appendChild(thumbImg);
      strip.appendChild(thumb);
    });
    const imgWrap = img?.parentNode;
    if (imgWrap) imgWrap.insertBefore(strip, img.nextSibling);

    const show = (i) => {
      idx = (i + items.length) % items.length;
      const item = items[idx];
      img.src = item.src;
      img.alt = item.cap;
      cap.textContent = item.cap;
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      document.dispatchEvent(new CustomEvent('folio-lightbox-change', { detail: { index: idx } }));
    };

    document.addEventListener('folio-lightbox-go', (e) => {
      if (box.classList.contains('is-open')) show(e.detail?.index ?? 0);
    });

    const close = () => {
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      img.src = '';
    };

    qsa('[data-lightbox]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lb = parseInt(btn.dataset.lb, 10);
        show(Number.isNaN(lb) ? 0 : lb);
      });
    });

    qsa('[data-close]', box).forEach((el) => el.addEventListener('click', close));
    qs('[data-prev]', box)?.addEventListener('click', () => show(idx - 1));
    qs('[data-next]', box)?.addEventListener('click', () => show(idx + 1));

    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ══════════════════════════════════════════
     INQUIRY FORM
     ══════════════════════════════════════════ */
  function initForm() {
    const form = qs('#inquiry-form');
    const status = qs('#form-status');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (status) {
        status.textContent = '';
        status.className = 'form-status';
      }

      const fd = new FormData(form);
      const dateFlexible = qs('#date-flexible')?.checked ?? false;
      const payload = {
        name: String(fd.get('name') || '').trim(),
        email: String(fd.get('email') || '').trim(),
        date: String(fd.get('date') || '').trim(),
        dateFlexible,
        venue: String(fd.get('venue') || '').trim(),
        package: String(fd.get('package') || '').trim(),
        message: String(fd.get('message') || '').trim(),
        sourcePath: String(fd.get('sourcePath') || location.pathname).trim(),
        sourceSection: String(fd.get('sourceSection') || '').trim(),
      };

      const dateOk = payload.date || dateFlexible;
      if (!payload.name || !payload.email || !dateOk || !payload.venue) {
        if (status) {
          status.textContent = 'Please complete all required fields.';
          status.classList.add('is-error');
        }
        return;
      }

      const btn = qs('button[type="submit"]', form);
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      try {
        const res = await fetch('/api/inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Request failed');
        if (status) {
          status.textContent = data.message || 'Thank you — Arjun will be in touch within 48 hours.';
          status.classList.add('is-success');
        }
        form.reset();
      } catch (err) {
        if (status) {
          status.textContent = 'Something went wrong. Please email hello@arjunmehta.photo directly.';
          status.classList.add('is-error');
        }
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Begin Your Story'; }
      }
    });
  }

  function restoreHash() {
    if (!pendingHash || pendingHash === '#') return;
    const target = qs(pendingHash);
    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      });
    }
    pendingHash = '';
  }

  /* ══════════════════════════════════════════
     BOOT
     ══════════════════════════════════════════ */
  function boot() {
    initHeader();
    initChapterRail();
    initRealmTabs();
    initLightbox();
    initForm();

    initArchIntro().then(() => {
      initReveals();
      restoreHash();
    });
  }

  if (location.hostname === 'localhost' || location.search.includes('debug=1')) {
    window.folio = { initReveals, initLightbox, initRealmTabs, initArchIntro };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();