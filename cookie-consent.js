/*!
 * Socially Introverts: cookie consent
 * ---------------------------------------------------------------
 * - Google Analytics (GA4) does NOT load until a visitor clicks Accept.
 * - Decline (or no answer) means no analytics script and no analytics cookies.
 * - The choice is remembered for 12 months in the visitor's browser.
 * - Any element with  data-cookie-reopen  reopens the banner (used in the footer).
 *
 * Add to every page <head>, before anything else:
 *   <script src="cookie-consent.js"></script>
 *
 * To change wording, colours or the GA4 ID, edit the values below.
 */
(function () {
  'use strict';

  var GA_ID = 'G-6CFRTJP9SL';
  var STORE_KEY = 'si_cookie_consent_v1';
  var MONTHS_VALID = 12;
  var PRIVACY_URL = 'privacy.html#cookies';

  var COPY = {
    title: 'A quick cookie note',
    body: 'I use analytics cookies to see which pages are helping people. They only run if you say yes. You can change your mind any time from the footer.',
    link: 'Privacy policy',
    accept: 'Accept',
    decline: 'Decline'
  };

  /* ---- gtag stub: safe to call before GA4 exists ---------------- */
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  /* ---- storage helpers ------------------------------------------ */
  var memoryChoice = null; // fallback if the browser blocks storage

  function readChoice() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return memoryChoice;
      var data = JSON.parse(raw);
      if (!data || (data.choice !== 'accepted' && data.choice !== 'declined')) return null;
      var ageMs = Date.now() - (data.ts || 0);
      if (ageMs > MONTHS_VALID * 30.44 * 24 * 60 * 60 * 1000) return null;
      return data.choice;
    } catch (e) {
      return memoryChoice;
    }
  }

  function saveChoice(choice) {
    memoryChoice = choice;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ choice: choice, ts: Date.now() }));
    } catch (e) { /* storage blocked: choice only lasts for this page view */ }
  }

  /* ---- Google Analytics on / off -------------------------------- */
  var gaLoaded = false;

  function loadGA() {
    window['ga-disable-' + GA_ID] = false;
    if (gaLoaded) return;
    gaLoaded = true;
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  function clearGACookies() {
    var host = location.hostname;
    var parts = host.split('.');
    var domains = [host, '.' + host];
    if (parts.length >= 2) domains.push('.' + parts.slice(-2).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0 || name === '_gid' || name.indexOf('_gat') === 0) {
        var expired = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
        document.cookie = expired;
        domains.forEach(function (d) { document.cookie = expired + '; domain=' + d; });
      }
    });
  }

  function disableGA() {
    window['ga-disable-' + GA_ID] = true;
    clearGACookies();
  }

  /* ---- styles (uses your site colours when the page defines them) */
  var CSS = [
    '.si-cookie{position:fixed;z-index:1000;left:max(16px,env(safe-area-inset-left));right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));max-width:560px;margin:0 auto;box-sizing:border-box;padding:22px 24px;background:var(--bg-1,#f5f1ee);color:var(--ink-soft,#4a2a2f);border:1px solid rgba(93,15,17,0.28);border-radius:8px;box-shadow:0 14px 34px rgba(93,15,17,0.20);font-family:var(--font-display,"Cormorant Garamond",serif);}',
    '.si-cookie[hidden]{display:none !important;}',
    '.si-cookie *{box-sizing:border-box;}',
    '.si-cookie:focus{outline:none;}',
    '.si-cookie-title{display:block;margin:0 0 6px;font-family:var(--font-script,"Beau Rivage",cursive);font-size:1.8rem;line-height:1.1;color:var(--maroon,#5d0f11);}',
    '.si-cookie-body{margin:0 0 16px;font-size:1.1rem;line-height:1.5;color:var(--ink-soft,#4a2a2f);}',
    '.si-cookie-body a{color:var(--maroon,#5d0f11);text-decoration:underline;text-underline-offset:2px;}',
    '.si-cookie-actions{display:flex;flex-wrap:wrap;gap:10px;}',
    '.si-cookie-btn{flex:1 1 130px;font:inherit;font-size:0.9rem;font-weight:700;letter-spacing:0.03em;text-transform:uppercase;line-height:1.2;text-align:center;padding:14px 22px;border-radius:999px;cursor:pointer;border:1.5px solid var(--pill-ink,#7a2035);transition:transform .15s ease,box-shadow .15s ease;}',
    '.si-cookie-btn:hover{transform:translateY(-2px);box-shadow:0 6px 14px rgba(93,15,17,0.20);}',
    '.si-cookie-btn:focus-visible{outline:2px solid var(--maroon,#5d0f11);outline-offset:3px;}',
    '.si-cookie-accept{background:var(--maroon,#5d0f11);border-color:var(--maroon,#5d0f11);color:#fff;}',
    '.si-cookie-decline{background:transparent;color:var(--pill-ink,#7a2035);}',
    '.cookie-reopen{font:inherit;font-style:italic;color:inherit;background:none;border:0;padding:0;cursor:pointer;transition:opacity .15s ease;}',
    '.cookie-reopen:hover{opacity:0.65;}',
    '.cookie-reopen:focus-visible{outline:2px solid currentColor;outline-offset:3px;}',
    '@media (max-width:860px){.foot .cookie-reopen{padding:9px 0;text-align:left;}}',
    '@media (prefers-reduced-motion:no-preference){.si-cookie.si-cookie-in{animation:si-cookie-up .28s ease-out both;}}',
    '@keyframes si-cookie-up{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}',
    '@media (max-width:480px){.si-cookie{padding:18px 18px;}.si-cookie-body{font-size:1.05rem;}}'
  ].join('\n');

  function addStyles() {
    if (document.getElementById('si-cookie-css')) return;
    var st = document.createElement('style');
    st.id = 'si-cookie-css';
    st.appendChild(document.createTextNode(CSS));
    document.head.appendChild(st);
  }

  /* ---- banner ---------------------------------------------------- */
  var banner = null;

  function build() {
    if (banner) return banner;
    addStyles();
    banner = document.createElement('div');
    banner.className = 'si-cookie';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie preferences');
    banner.tabIndex = -1;
    banner.hidden = true;

    var title = document.createElement('span');
    title.className = 'si-cookie-title';
    title.textContent = COPY.title;

    var body = document.createElement('p');
    body.className = 'si-cookie-body';
    body.appendChild(document.createTextNode(COPY.body + ' '));
    var a = document.createElement('a');
    a.href = PRIVACY_URL;
    a.textContent = COPY.link;
    body.appendChild(a);
    body.appendChild(document.createTextNode('.'));

    var actions = document.createElement('div');
    actions.className = 'si-cookie-actions';

    var accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'si-cookie-btn si-cookie-accept';
    accept.textContent = COPY.accept;
    accept.addEventListener('click', function () { choose('accepted'); });

    var decline = document.createElement('button');
    decline.type = 'button';
    decline.className = 'si-cookie-btn si-cookie-decline';
    decline.textContent = COPY.decline;
    decline.addEventListener('click', function () { choose('declined'); });

    actions.appendChild(accept);
    actions.appendChild(decline);
    banner.appendChild(title);
    banner.appendChild(body);
    banner.appendChild(actions);
    document.body.appendChild(banner);
    return banner;
  }

  function show(moveFocus) {
    var b = build();
    b.hidden = false;
    b.classList.remove('si-cookie-in');
    void b.offsetWidth; // restart the entrance animation
    b.classList.add('si-cookie-in');
    if (moveFocus) b.focus();
  }

  function hide() {
    if (banner) banner.hidden = true;
  }

  function choose(choice) {
    saveChoice(choice);
    if (choice === 'accepted') loadGA(); else disableGA();
    hide();
  }

  /* ---- start ------------------------------------------------------ */
  var existing = readChoice();
  if (existing === 'accepted') loadGA();
  else if (existing === 'declined') window['ga-disable-' + GA_ID] = true;

  function init() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== document) {
        if (t.hasAttribute && t.hasAttribute('data-cookie-reopen')) {
          e.preventDefault();
          show(true);
          return;
        }
        t = t.parentNode;
      }
    });
    if (!existing) show(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
