/* FinanceAI — UI utilities: formatting, toasts, modals, canvas charts, icons */
(function () {
  const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$' };
  const Currency = { symbol: '$', decimals: 2 };

  function setCurrency(code) {
    Currency.symbol = (code && CURRENCY_SYMBOLS[code]) || '$';
  }

  function fmtMoney(v, opts) {
    const n = Number(v) || 0;
    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(n);
    return sign + Currency.symbol + abs.toLocaleString(undefined, {
      minimumFractionDigits: Currency.decimals,
      maximumFractionDigits: Currency.decimals
    });
  }

  function fmtNum(v, dec) {
    const n = Number(v) || 0;
    return n.toLocaleString(undefined, { maximumFractionDigits: dec == null ? 2 : dec });
  }

  function fmtPct(v) {
    return (Number(v) || 0) + '%';
  }

  function fmtDate(s) {
    if (!s) return '—';
    const d = new Date(s.length === 10 ? s + 'T00:00:00' : s);
    if (isNaN(d)) return s;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function fmtDateTime(s) {
    if (!s) return '—';
    const d = new Date(s);
    if (isNaN(d)) return s;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  function moneyClass(n) {
    if (n > 0) return 'money-pos';
    if (n < 0) return 'money-neg';
    return '';
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- Toasts ---------- */
  function toast(title, msg, type) {
    const box = document.getElementById('toasts');
    if (!box) return;
    const icons = { success: '✅', error: '⚠️', info: '💡' };
    const el = document.createElement('div');
    el.className = 'toast toast-' + (type || 'info');
    el.innerHTML =
      '<span class="toast-icon">' + (icons[type || 'info'] || '💡') + '</span>' +
      '<div class="toast-body">' +
      (title ? '<div class="toast-title">' + escapeHtml(title) + '</div>' : '') +
      (msg ? '<div class="toast-msg">' + escapeHtml(msg) + '</div>' : '') +
      '</div>';
    box.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 260); }, 4200);
  }

  function toastError(err) {
    let title = 'Something went wrong';
    let msg = err && err.message ? err.message : 'Please try again.';
    if (err && err.status === 401) { title = 'Session expired'; msg = 'Please sign in again.'; }
    toast(title, msg, 'error');
  }

  /* ---------- Modal ---------- */
  let _onModalClose = null;
  let _lastFocused = null;
  let _modalActive = false;

  function modalEls() {
    return {
      root: document.getElementById('modalRoot'),
      panel: document.getElementById('modalPanel')
    };
  }

  function focusablesWithin(container) {
    const base = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
    return Array.from(container.querySelectorAll(base)).filter(el => !el.disabled && el.offsetParent !== null);
  }

  /* Central [data-close] binder — idempotent so openModal/wireModal never double-bind. */
  function bindCloseButtons(container) {
    container.querySelectorAll('[data-close]').forEach(b => {
      if (b.dataset.uicloseBound) return;
      b.dataset.uicloseBound = '1';
      b.addEventListener('click', closeModal);
    });
  }

  function openModal(contentHTML, opts) {
    const { root, panel } = modalEls();
    if (!root || !panel) return;
    opts = opts || {};

    if (!_modalActive && document.activeElement) _lastFocused = document.activeElement;
    _onModalClose = opts.onClose || null;
    _modalActive = true;

    panel.className = 'modal-panel' + (opts.wide ? ' wide' : '');
    panel.innerHTML = contentHTML;
    panel.tabIndex = -1;

    /* a11y: label the dialog from its heading, describe it when a paragraph exists */
    const title = panel.querySelector('h2');
    if (title) { title.id = title.id || 'uimodal-title'; panel.setAttribute('aria-labelledby', 'uimodal-title'); }
    const desc = panel.querySelector('p');
    if (desc) { desc.id = desc.id || 'uimodal-desc'; panel.setAttribute('aria-describedby', 'uimodal-desc'); }

    root.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    bindCloseButtons(panel);

    const focusTarget = panel.querySelector('input, select, textarea') || focusablesWithin(panel)[0] || panel;
    setTimeout(() => { try { focusTarget.focus(); } catch (e) { } }, 60);

    if (opts.onMount) setTimeout(opts.onMount, 0);
  }

  function closeModal() {
    const { root, panel } = modalEls();
    if (!root || root.classList.contains('hidden') || !_modalActive) return;
    _modalActive = false;

    root.classList.add('hidden');
    document.body.style.overflow = '';
    panel.innerHTML = '';

    const onClose = _onModalClose;
    _onModalClose = null;
    const restore = _lastFocused;
    _lastFocused = null;
    if (restore && restore.isConnected) {
      try { restore.focus(); } catch (e) { }
    }

    if (typeof onClose === 'function') onClose();
  }

  function confirmModal(title, message, onConfirm, danger) {
    openModal(
      '<div class="modal-head"><h2>' + escapeHtml(title) + '</h2>' +
      '<button class="icon-btn" data-close aria-label="Close dialog"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>' +
      '<p style="color:var(--text-2)">' + escapeHtml(message) + '</p>' +
      '<div class="modal-foot">' +
      '<button class="btn" data-close type="button">Cancel</button>' +
      '<button class="btn ' + (danger ? 'btn-danger' : 'btn-primary') + '" id="confirmBtn">' +
      (danger ? 'Delete' : 'Confirm') + '</button></div>',
      { onClose: null }
    );
    panelAction('#confirmBtn', 'click', () => { closeModal(); onConfirm(); });
  }

  function bindModalClose(rootEl) {
    bindCloseButtons(rootEl);
  }

  /* Rebind all [data-close] after setting panel content (idempotent) */
  function wireModal() {
    const { panel } = modalEls();
    if (panel) bindCloseButtons(panel);
  }

  /* Delegated event listener. Supports both:
      on(el, selector, event, handler)                      — bind on el
      on(el, containerSelector, innerSelector, event, handler) — bind on el, require container match */
  function on() {
    const args = Array.prototype.slice.call(arguments);
    let el, container, selector, event, handler;
    if (args.length >= 5) {
      el = typeof args[0] === 'string' ? document.querySelector(args[0]) : args[0];
      container = args[1];
      selector = args[2];
      event = args[3];
      handler = args[4];
    } else {
      el = typeof args[0] === 'string' ? document.querySelector(args[0]) : args[0];
      container = null;
      selector = args[1];
      event = args[2];
      handler = args[3];
    }
    if (!el) return;
    el.addEventListener(event, (e) => {
      const hit = container ? e.target.closest(container) : el;
      if (!hit || !el.contains(hit)) return;
      const target = e.target.closest ? e.target.closest(selector) : null;
      if (target && hit.contains(target)) handler(e, target);
    });
  }

  function panelAction(selector, event, handler) {
    const el = document.getElementById('modalPanel').querySelector(selector);
    if (el) el.addEventListener(event || 'click', handler);
  }

  /* ---------- Icons (inline SVG set) ---------- */
  const ICONS = {
    dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7H4a2 2 0 0 1 0-4h13"/><path d="M20 7v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>',
    receipt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3z"/><path d="M9 8h6M9 12h6"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 13.5 10.5 23 1 13.5V1h12.5L23 10.5 20 13.5z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
    pie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>',
    bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 4v4M8 2h8"/><path d="M8 13h.01M16 13h.01M8 17h8"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    bank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-6 9 6"/><path d="M4 9v10M9 9v10M15 9v10M20 9v10"/><path d="M3 21h18"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4z" fill="currentColor"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>'
  };

  function icon(name) { return ICONS[name] || ICONS.tag; }

  /* ============================================================
     Canvas chart renderers (no dependencies)
     ============================================================ */

  function _sizeCanvas(canvas, cssW, cssH) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(cssW * dpr));
    canvas.height = Math.max(1, Math.floor(cssH * dpr));
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  /* Line/area chart for cash flow: series rows [{label, income, expenses, savings}] */
  function lineChart(canvas, rows, opts) {
    opts = opts || {};
    const parent = canvas.parentElement;
    const cssW = Math.max(280, parent.clientWidth || 420);
    const cssH = opts.height || 260;
    const ctx = _sizeCanvas(canvas, cssW, cssH);
    const pad = { top: 18, right: 14, bottom: 30, left: 56 };
    const w = cssW - pad.left - pad.right;
    const h = cssH - pad.top - pad.bottom;

    const series = opts.series || [
      { key: 'income', color: '#22d3ee', label: 'Income' },
      { key: 'expenses', color: '#f87171', label: 'Expenses' },
      { key: 'savings', color: '#34d399', label: 'Savings' }
    ];

    const allVals = [];
    rows.forEach(r => series.forEach(s => allVals.push(Number(r[s.key]) || 0)));
    const max = Math.max(1, ...allVals) * 1.12;
    const labels = rows.map(r => r.month || r.label || '');

    // Grid + Y labels
    ctx.font = '11px Inter, sans-serif';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const v = (max / 4) * i;
      const y = pad.top + h - (h * i) / 4;
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + w, y); ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'right';
      ctx.fillText(fmtShortMoney(v), pad.left - 8, y);
    }

    // X labels
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    const step = Math.max(1, Math.ceil(labels.length / 8));
    labels.forEach((l, i) => {
      if (i % step === 0) {
        const x = pad.left + (i / Math.max(1, labels.length - 1)) * w;
        ctx.fillText(l || '', x, cssH - 10);
      }
    });

    // Series lines/areas
    series.forEach((s, si) => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2.4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      let first = true;
      rows.forEach((r, i) => {
        const x = labels.length <= 1 ? pad.left + w / 2 : pad.left + (i / (labels.length - 1)) * w;
        const y = pad.top + h - ((Number(r[s.key]) || 0) / max) * h;
        if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      });
      ctx.stroke();
      // Area fill for first series
      if (si === 0) {
        const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + h);
        grad.addColorStop(0, hexA(s.color, 0.22));
        grad.addColorStop(1, hexA(s.color, 0));
        ctx.beginPath();
        rows.forEach((r, i) => {
          const x = labels.length <= 1 ? pad.left + w / 2 : pad.left + (i / (labels.length - 1)) * w;
          const y = pad.top + h - ((Number(r[s.key]) || 0) / max) * h;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.lineTo(pad.left + w, pad.top + h);
        ctx.lineTo(pad.left, pad.top + h);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }
      // Dots
      rows.forEach((r, i) => {
        const x = labels.length <= 1 ? pad.left + w / 2 : pad.left + (i / (labels.length - 1)) * w;
        const y = pad.top + h - ((Number(r[s.key]) || 0) / max) * h;
        ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = s.color; ctx.fill();
        ctx.strokeStyle = '#0f1319'; ctx.lineWidth = 1.5; ctx.stroke();
      });
    });

    // Tooltip overlay (simple hover)
    if (!canvas.__lineHover) {
      canvas.__lineHover = document.createElement('div');
      canvas.__lineHover.style.cssText = 'position:absolute;pointer-events:none;background:#1a2230;border:1px solid #232c3d;border-radius:8px;padding:8px 10px;font-size:12px;color:#e8ecf4;display:none;z-index:5;box-shadow:0 8px 24px rgba(0,0,0,.4)';
      parent.style.position = 'relative';
      parent.appendChild(canvas.__lineHover);
    }
    const hover = canvas.__lineHover;
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      if (mx < pad.left || mx > pad.left + w) { hover.style.display = 'none'; return; }
      const i = Math.round(((mx - pad.left) / w) * Math.max(1, labels.length - 1));
      const r = rows[i];
      if (!r) { hover.style.display = 'none'; return; }
      hover.innerHTML = '<b>' + escapeHtml(labels[i] || '') + '</b><br>' + series.map(s =>
        '<span style="color:' + s.color + '">' + escapeHtml(s.label) + ': ' + fmtMoney(r[s.key]) + '</span>').join('<br>');
      hover.style.display = 'block';
      const hw = hover.offsetWidth, hh = hover.offsetHeight;
      let hx = mx + 12; if (hx + hw > cssW) hx = mx - hw - 12;
      let hy = (e.clientY - rect.top) + 12; if (hy + hh > cssH) hy = cssH - hh - 4;
      hover.style.left = hx + 'px'; hover.style.top = hy + 'px';
    };
    canvas.onmouseleave = () => { hover.style.display = 'none'; };
  }

  /* Donut chart: slices [{label, value, color}] */
  function donutChart(canvas, slices, opts) {
    opts = opts || {};
    const size = Math.min(opts.size || 190, Math.max(140, canvas.parentElement.clientWidth - 40));
    const ctx = _sizeCanvas(canvas, size, size);
    const cx = size / 2, cy = size / 2;
    const outer = size / 2 - 6, inner = outer * 0.62;
    const total = slices.reduce((s, x) => s + (Number(x.value) || 0), 0) || 1;
    let angle = -Math.PI / 2;
    const gap = 0.02;
    slices.forEach((s) => {
      const frac = (Number(s.value) || 0) / total;
      const sweep = frac * Math.PI * 2;
      const a0 = angle + gap / 2;
      const a1 = angle + sweep - gap / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, outer, a0, a1);
      ctx.arc(cx, cy, inner, a1, a0, true);
      ctx.closePath();
      ctx.fillStyle = s.color || '#7c5cff';
      ctx.fill();
      angle += sweep;
    });
    ctx.beginPath(); ctx.arc(cx, cy, outer, 0, Math.PI * 2); ctx.strokeStyle = '#1a2230'; ctx.lineWidth = 2; ctx.stroke();
    // Center text
    ctx.fillStyle = '#e8ecf4';
    ctx.font = '700 15px Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const centerPct = opts.center !== undefined ? opts.center : Math.round((Number(slices[0] && slices[0].value) || 0) / (Number(slices[0] && slices[0].value) || 0) * 0 || 0);
    const shade = opts.center ? Math.round(opts.center) : null;
    if (shade != null) {
      ctx.fillText(String(shade) + '%', cx, cy - 10);
      ctx.fillStyle = '#64748b'; ctx.font = '11px Inter, sans-serif';
      ctx.fillText(opts.centerLabel || 'share', cx, cy + 12);
    } else {
      ctx.fillText(opts.center || '', cx, cy - 6);
      ctx.fillStyle = '#64748b'; ctx.font = '11px Inter, sans-serif';
      ctx.fillText(opts.centerLabel || 'total', cx, cy + 12);
    }
  }

  /* Bar chart: rows [{label, value, color}] */
  function barChart(canvas, rows, opts) {
    opts = opts || {};
    const parent = canvas.parentElement;
    const cssW = Math.max(280, parent.clientWidth || 420);
    const cssH = opts.height || 240;
    const ctx = _sizeCanvas(canvas, cssW, cssH);
    const pad = { top: 16, right: 14, bottom: 34, left: 14 };
    const w = cssW - pad.left - pad.right;
    const h = cssH - pad.top - pad.bottom;
    const max = Math.max(0.01, ...rows.map(r => Number(r.value) || 0));
    const bw = Math.min(44, (w / Math.max(1, rows.length)) * 0.55);
    const gap = (w - bw * rows.length) / Math.max(1, rows.length + 1);

    rows.forEach((r, i) => {
      const v = Number(r.value) || 0;
      const bh = (v / max) * h;
      const x = pad.left + gap + i * (bw + gap);
      const y = pad.top + h - bh;
      const grad = ctx.createLinearGradient(0, y, 0, y + bh);
      grad.addColorStop(0, r.color || '#7c5cff');
      grad.addColorStop(1, hexA(r.color || '#7c5cff', 0.5));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, bw, bh, [4, 4, 0, 0]);
      ctx.fill();
      // Value label on top
      if (v > 0) {
        ctx.fillStyle = '#9aa7bd';
        ctx.font = '600 10.5px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(shortNum(v), x + bw / 2, y - 4);
      }
      // Label below
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const lbl = String(r.label || '');
      const short = lbl.length > 10 ? lbl.slice(0, 10) + '…' : lbl;
      ctx.fillText(short, x + bw / 2, pad.top + h + 6);
    });
  }

  /* Horizontal stacked allocation */
  function allocChart(canvas, rows, opts) {
    opts = opts || {};
    const parent = canvas.parentElement;
    const cssW = Math.max(280, parent.clientWidth || 420);
    const cssH = 26;
    const ctx = _sizeCanvas(canvas, cssW, cssH);
    const total = rows.reduce((s, r) => s + (Number(r.value) || 0), 0) || 1;
    let x = 0;
    rows.forEach(r => {
      const frac = (Number(r.value) || 0) / total;
      const bw = frac * cssW;
      ctx.fillStyle = r.color || '#7c5cff';
      ctx.fillRect(x, 0, bw, cssH);
      x += bw;
    });
    if (rows.length === 0) { ctx.fillStyle = '#232c3d'; ctx.fillRect(0, 0, cssW, cssH); }
  }

  function shortNum(v) {
    const n = Number(v) || 0;
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
    return String(Math.round(n));
  }

  function fmtShortMoney(v) {
    const n = Number(v) || 0;
    if (Math.abs(n) >= 1000000) return Currency.symbol + (n / 1000000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1000) return Currency.symbol + (n / 1000).toFixed(1) + 'k';
    return Currency.symbol + String(Math.round(n));
  }

  function hexA(hex, a) {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  const UI = {
    setCurrency, fmtMoney, fmtNum, fmtPct, fmtDate, fmtDateTime, moneyClass, escapeHtml,
    toast, toastError, openModal, closeModal, confirmModal, bindModalClose, wireModal, panelAction, on,
    icon, lineChart, donutChart, barChart, allocChart
  };
    /* Global modal behaviors — Escape closes, Tab traps focus, click-outside dismisses. Bound once. */
  document.addEventListener('keydown', (e) => {
    if (!_modalActive) return;
    const { panel } = modalEls();
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key === 'Tab' && panel) {
      const list = focusablesWithin(panel);
      if (list.length) {
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (!_modalActive) return;
    const { root } = modalEls();
    if (!root) return;
    if (e.target === root || (e.target && e.target.id === 'modalBackdrop')) closeModal();
  });

  window.UI = UI;
  window.$$ = (sel, root) => (root || document).querySelector(sel);
  window.$$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
})();