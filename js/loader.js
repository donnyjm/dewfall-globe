/**
 * DEWFALL Globe loader — local vendor first, CDN fallback, error UI.
 */
(function () {
  'use strict';

  var CACHE_BUST = '1788561436';
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
    { src: 'data/fn-ltdwa.js', optional: true },
    { src: 'js/fn-ltdwa.js', optional: true },
    { src: 'data/fn-short-term.js', optional: true },
    { src: 'data/fn-bc-dwa.js', optional: true },
    { src: 'data/fn-reserves.js', optional: true },
    'data/world-water-need.js',
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
    detail.textContent = 'Three.js / globe.gl failed to load. Check vendor/ or network.';
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var el = document.createElement('script');
      el.src = withBust(src);
      el.async = false;
      el.onload = function () { resolve(src); };
      el.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.head.appendChild(el);
    });
  }

  function loadOptional(src) {
    return loadScript(src).catch(function () { return null; });
  }

  function loadWithFallback(localSrc, cdnSrc, label) {
    return loadScript(localSrc).catch(function (err) {
      console.warn('[DEWFALL] local ' + label + ' failed, trying CDN', err);
      setLoaderMessage('LOADING ' + label.toUpperCase() + ' · CDN FALLBACK');
      return loadScript(cdnSrc);
    });
  }

  function globeReady() {
    return typeof window.Globe === 'function' || typeof window.Globe === 'object';
  }

  function loadAppChain(list, i) {
    if (i >= list.length) return Promise.resolve();
    var item = list[i];
    var src = typeof item === 'string' ? item : item.src;
    var optional = typeof item === 'object' && item.optional;
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
