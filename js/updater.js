/** Each open page checks its own loaded version, across phone and desktop. */
(function () {
  'use strict';
  var marker = document.querySelector('meta[name="dewfall-release"]');
  var loadedVersion = marker ? marker.content : null;
  var checking = false;
  var updating = false;

  function check() {
    if (checking || updating || document.visibilityState === 'hidden' || navigator.onLine === false) return;
    checking = true;
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 8000);
    fetch('version.json?t=' + Date.now(), { cache: 'no-store', signal: controller.signal })
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(async function (data) {
        if (!data || typeof data.v !== 'string' || !/^[a-zA-Z0-9._-]{1,100}$/.test(data.v)) return;
        if (!loadedVersion) { loadedVersion = data.v; return; }
        if (loadedVersion === data.v) return;
        // A release manifest can reach an edge cache before its HTML. Do not
        // replace a working globe until that exact document is available.
        var nextUrl = new URL(location.href);
        nextUrl.searchParams.set('release', data.v);
        var page = await fetch(nextUrl.toString(), { cache: 'no-store', signal: controller.signal });
        if (!page.ok) return;
        var html = await page.text();
        var documentVersion = html.match(/<meta\s+name=["']dewfall-release["']\s+content=["']([^"']+)["']/i);
        if (!documentVersion || documentVersion[1] !== data.v) return;
        if (document.visibilityState === 'hidden' || navigator.onLine === false) return;
        updating = true;
        var bar = document.createElement('div');
        bar.id = 'update-banner';
        bar.setAttribute('role', 'status');
        bar.style.cssText = 'position:fixed;inset:0 0 auto;z-index:100000;padding:14px 20px;padding-top:max(14px,env(safe-area-inset-top));background:#124957;color:#efffff;font:600 14px/1.4 system-ui;text-align:center;box-shadow:0 8px 25px #0005';
        bar.textContent = 'A new DEWFALL Globe is ready. Updating…';
        document.body.appendChild(bar);
        setTimeout(function () {
          var url = new URL(location.href);
          url.searchParams.set('release', data.v);
          // Keep site selection and force Safari to fetch the new HTML document.
          location.replace(url.toString());
        }, 1200);
      })
      .catch(function () { /* Keep the current globe usable when offline. */ })
      .finally(function () { clearTimeout(timeout); checking = false; });
  }
  check();
  setInterval(check, 20000);
  document.addEventListener('visibilitychange', check);
  window.addEventListener('focus', check);
  window.addEventListener('online', check);
  window.addEventListener('pageshow', check);
})();
