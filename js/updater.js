/**
 * DEWFALL Globe — auto-update for phones/desktops on GitHub Pages.
 * Polls version.json; when the deploy changes, reloads once so Safari
 * picks up new JS/CSS without a manual hard-refresh.
 */
(function () {
  'use strict';
  var KEY = 'dewfall-globe-version';
  var POLL_MS = 20000;
  var checking = false;

  function getStored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setStored(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  function check() {
    if (checking) return;
    checking = true;
    fetch('version.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        checking = false;
        if (!data || !data.v) return;
        var prev = getStored();
        if (!prev) {
          setStored(data.v);
          return;
        }
        if (prev !== data.v) {
          setStored(data.v);
          // Soft banner then reload — avoids surprise mid-tap when possible
          var bar = document.getElementById('update-banner');
          if (!bar) {
            bar = document.createElement('div');
            bar.id = 'update-banner';
            bar.setAttribute('role', 'status');
            bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:100000;padding:12px 16px;padding-top:max(12px,env(safe-area-inset-top));background:#1a4a58;color:#e8f8ff;font:650 14px/1.3 system-ui,sans-serif;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.4);';
            bar.textContent = 'New DEWFALL Globe version — updating…';
            document.body.appendChild(bar);
          }
          setTimeout(function () {
            location.reload();
          }, 600);
        }
      })
      .catch(function () { checking = false; });
  }

  // First paint: record current version without reload
  check();
  setInterval(check, POLL_MS);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') check();
  });
  window.addEventListener('focus', check);
  window.addEventListener('pageshow', function (ev) {
    if (ev.persisted) check();
  });
})();
