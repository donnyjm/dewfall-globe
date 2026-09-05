/**
 * DEWFALL Globe loader — local vendor first, CDN fallback, error UI.
 */
(function () {
  'use strict';

  var CACHE_BUST = 'mtnzxuc7';
  function withBust(url) {
    if (!url || /^https?:/i.test(url)) return url;
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'v=' + CACHE_BUST;
  }

  var LOCAL = { three: 'vendor/three.min.js', globe: 'vendor/globe.gl.min.js' };
  var CDN = {
    three: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js',
    globe: 'https://cdn.jsdelivr.net/npm/globe.gl@2.31.0/dist/globe.gl.min.js'
  };
  var APP_SCRIPTS = [
    'data/cities.js',
    'js/yield.js',
    'data/fn-ltdwa.js',
    'data/fn-short-term.js',
    'data/fn-bc-dwa.js',
    'data/fn-reserves.js',
    'data/world-water-need.js',
    'data/drought-markets.js',
    'data/funders.js',
    'data/site-socio.js',
    { src: 'js/journey.js', optional: true },
    { src: 'js/observatory.js', optional: true },
    'js/app.js'
  ];

  function qs(sel) { return document.querySelector(sel); }

  function setLoaderMessage(msg, isError) {
    var loader = qs('#loader');
    var inner = loader && loader.querySelector('.loader-inner');
    if (!inner) return;
    var p = inner.querySelector('p');
    if (p) p.textContent = msg;
    if (!isError) return;
    loader.classList.add('error');
    loader.classList.remove('hide');
    var orb = inner.querySelector('.loader-orb');
    if (orb) orb.style.animation = 'none';
    if (!inner.querySelector('.loader-retry')) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'loader-retry';
      btn.textContent = 'Retry';
      btn.addEventListener('click', function () { location.reload(); });
      inner.appendChild(btn);
    }
    var detail = inner.querySelector('.loader-detail');
    if (!detail) {
      detail = document.createElement('p');
      detail.className = 'loader-detail';
      inner.appendChild(detail);
    }
    detail.textContent = 'The Earth or a required dataset could not load. Please retry.';
  }

  function loadScript(src, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var el = document.createElement('script');
      var settled = false;
      var timer = setTimeout(function () {
        if (settled) return;
        settled = true;
        el.onload = el.onerror = null;
        el.remove();
        reject(new Error('Timed out loading ' + src));
      }, timeoutMs || 20000);
      function finish(error) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        el.onload = el.onerror = null;
        if (error) reject(error);
        else resolve(src);
      }
      el.src = withBust(src);
      el.async = false;
      el.onload = function () { finish(); };
      el.onerror = function () { finish(new Error('Failed to load ' + src)); };
      document.head.appendChild(el);
    });
  }

  function loadOptional(src) {
    return loadScript(src, 8000).catch(function (err) {
      console.warn('[DEWFALL] optional enhancement unavailable', err);
      return null;
    });
  }

  function loadWithFallback(localSrc, cdnSrc, label) {
    return loadScript(localSrc).catch(function (err) {
      console.warn('[DEWFALL] local ' + label + ' failed, trying CDN', err);
      setLoaderMessage('LOADING ' + label.toUpperCase() + ' · CDN FALLBACK');
      return loadScript(cdnSrc);
    });
  }

  function globeReady() {
    return typeof window.Globe === 'function';
  }

  function loadAppChain(list, i) {
    if (i >= list.length) return Promise.resolve();
    var item = list[i];
    var src = typeof item === 'string' ? item : item.src;
    var optional = typeof item === 'object' && item.optional;
    setLoaderMessage('LOADING RECORDS · ' + Math.round((i / list.length) * 100) + '%');
    var next = function () { return loadAppChain(list, i + 1); };
    if (optional) return loadOptional(src).then(next);
    return loadScript(src).then(next);
  }

  function boot() {
    setLoaderMessage('LOADING EARTH - DEWFALL MODEL');
    return loadWithFallback(LOCAL.three, CDN.three, 'three')
      .then(function () {
        if (typeof window.THREE === 'undefined') {
          throw new Error('THREE global missing after three.min.js');
        }
        setLoaderMessage('LOADING GLOBE · DEWFALL MODEL');
        return loadWithFallback(LOCAL.globe, CDN.globe, 'globe.gl');
      })
      .then(function () {
        if (!globeReady()) {
          throw new Error('Globe missing after globe.gl.min.js');
        }
        setLoaderMessage('LOADING DATA - DEWFALL MODEL');
        return loadAppChain(APP_SCRIPTS, 0);
      })
      .catch(function (err) {
        console.error('[DEWFALL] load failed', err);
        setLoaderMessage('EARTH FAILED TO LOAD', true);
        window.__DEWFALL_LOAD_ERROR__ = String(err && err.message ? err.message : err);
      });
  }

  window.__DEWFALL_SHOW_LOAD_ERROR__ = function (msg) {
    setLoaderMessage(msg || 'EARTH FAILED TO LOAD', true);
  };

  boot();
})();
