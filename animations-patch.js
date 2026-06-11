(function () {
  'use strict';

  const pR = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function qs(s, c) { return (c || document).querySelector(s); }
  function qsa(s, c) { return Array.from((c || document).querySelectorAll(s)); }

  function initLqip() {
    qsa('.lqip-wrap').forEach((wrap) => {
      const img = wrap.querySelector('img');
      if (!img) return;
      const mark = () => wrap.classList.add('is-loaded');
      if (img.complete) { mark(); return; }
      img.addEventListener('load', mark, { once: true });
      img.addEventListener('error', mark, { once: true });
    });
  }

  function patchForm() {
    const dateInput = qs('#inquiry-form input[name="date"]');
    if (!dateInput) return;
    const field = dateInput.closest('.field') || dateInput.parentElement;

    if (field && !qs('.field__hint', field)) {
      const hint = document.createElement('span');
      hint.className = 'field__hint';
      hint.textContent = 'If flexible, share your ideal month or season instead.';
      field.appendChild(hint);
    }

    if (!qs('#date-flexible')) {
      const lbl = document.createElement('label');
      lbl.style.cssText = 'display:flex;align-items:center;gap:0.4rem;font-size:0.7rem;letter-spacing:0.06em;text-transform:uppercase;color:var(--color-taupe);margin-top:0.5rem;cursor:pointer;';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = 'date-flexible';
      cb.style.cssText = 'accent-color:var(--color-copper);';
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode('Date not yet finalised'));
      field.appendChild(lbl);

      cb.addEventListener('change', () => {
        dateInput.required = !cb.checked;
        dateInput.placeholder = cb.checked ? 'e.g. March 2026, Spring' : '';
        dateInput.type = cb.checked ? 'text' : 'date';
      });
    }

    const pathField = qs('#sourcePath');
    if (pathField) pathField.value = location.pathname + location.search;
  }

  function patchLightboxStrip() {
    document.addEventListener('folio-lightbox-change', (e) => {
      const idx = e.detail?.index ?? 0;
      qsa('.lightbox__strip-thumb').forEach((t, i) => {
        t.classList.toggle('is-active', i === idx);
      });
      const active = qs('.lightbox__strip-thumb.is-active');
      active?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    });

    qsa('.lightbox__strip-thumb').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const i = parseInt(thumb.dataset.index, 10);
        if (!Number.isNaN(i)) {
          document.dispatchEvent(new CustomEvent('folio-lightbox-go', { detail: { index: i } }));
        }
      });
    });
  }

  function boot() {
    initLqip();
    patchForm();
    patchLightboxStrip();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();