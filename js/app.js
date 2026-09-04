/**
 * DEWFALL Globe — interactive photorealistic Earth visualization
 * Uses globe.gl (Three.js) + curated climate normals + transparent yield model
 * + NRCan First Nations reserves nationwide + ISC/FNHA water-need layer
 * (long-term LTDWA + short-term DWA + BC FNHA).
 */
(function () {
  'use strict';

  const Y = window.DEWFALL_YIELD;
  const CITIES = window.DEWFALL_CITIES;
  const FN_LONG = window.DEWFALL_FN_LTDWA || [];
  const FN_SHORT = window.DEWFALL_FN_SHORT || [];
  const FN_BC = window.DEWFALL_FN_BC || [];
  const FN_META = window.DEWFALL_FN_LTDWA_META || {};
  const FN_SHORT_META = window.DEWFALL_FN_SHORT_META || {};
  const FN_BC_META = window.DEWFALL_FN_BC_META || {};
  const RESERVES = window.DEWFALL_FN_RESERVES || [];
  const RES_META = window.DEWFALL_FN_RESERVES_META || {};
  function getWorldRaw() {
    return window.DEWFALL_WORLD_WATER_NEED || window.WORLD_WATER_NEED || [];
  }
  function getWorldMeta() {
    return window.DEWFALL_WORLD_WATER_NEED_META || {};
  }
  function getDroughtRaw() {
    return window.DEWFALL_DROUGHT_MARKETS || [];
  }
  function getDroughtMeta() {
    return window.DEWFALL_DROUGHT_MARKETS_META || {};
  }

  /** Merge need lists: long-term wins if same community; else short / BC. */
  function normNeedName(n) {
    return String(n || '').toLowerCase()
      .replace(/first nation.*$/i, '')
      .replace(/nation.*$/i, '')
      .replace(/band.*$/i, '')
      .replace(/tribe.*$/i, '')
      .replace(/[^a-z0-9]/g, '');
  }
  function findNeedKey(byKey, key) {
    if (byKey[key] != null) return key;
    const keys = Object.keys(byKey);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (!k || !key) continue;
      if (k.indexOf(key) === 0 || key.indexOf(k) === 0) {
        if (Math.min(k.length, key.length) >= 8) return k;
      }
    }
    return null;
  }
  function mergeNeedLists() {
    const out = [];
    const byKey = {};
    function add(c, termDefault, priority) {
      if (!c) return;
      const e = Object.assign({}, c);
      if (!e.term) e.term = termDefault;
      e._needPriority = priority;
      const key = normNeedName(e.name);
      const hit = findNeedKey(byKey, key);
      const prev = hit != null ? byKey[hit] : null;
      if (prev != null) {
        if (priority > out[prev]._needPriority) {
          out[prev].systems = Array.from(new Set((out[prev].systems || []).concat(e.systems || [])));
          return;
        }
        if (priority < out[prev]._needPriority) {
          const keepSystems = Array.from(new Set((out[prev].systems || []).concat(e.systems || [])));
          out[prev] = e;
          out[prev].systems = keepSystems;
        } else {
          out[prev].systems = Array.from(new Set((out[prev].systems || []).concat(e.systems || [])));
        }
        return;
      }
      byKey[key] = out.length;
      out.push(e);
    }
    FN_LONG.forEach((c) => add(Object.assign({}, c, { term: c.term || 'long' }), 'long', 0));
    FN_SHORT.forEach((c) => add(c, 'short', 1));
    FN_BC.forEach((c) => add(c, c.term || 'short', 1));
    return out;
  }
  const FN = mergeNeedLists();

  const DEFAULT_RESERVE_TYPES = new Set(RES_META.defaultTypes || ['IR']);
  const OPTIONAL_RESERVE_TYPES = new Set(RES_META.optionalTypes || ['IL', 'SHL', 'CRN', 'SRN', 'YFN']);

  /** iPhone / coarse-pointer / narrow viewport — drives UX + WebGL defaults. */
  function detectMobile() {
    try {
      if (window.matchMedia('(max-width: 820px), (pointer: coarse)').matches) return true;
    } catch (e) {}
    const ua = navigator.userAgent || '';
    return /iPhone|iPad|iPod|Android|Mobile/i.test(ua);
  }
  const IS_MOBILE = detectMobile();

  const REMOTE_WEIGHT = {
    'remote-northern': 3.0,
    'remote': 2.2,
    'road-access': 1.3,
    'southern': 1.0,
  };

  const state = {
    season: 'summer',
    layers: {
      yield: true,
      humidity: false,        // off by default — rings make the map too busy
      dewpoint: false,        // HTML labels costly on iOS
      reserves: true,
      otherFn: false,
      ltdwa: true,
      world: true,
      drought: true,
      northern: false,
      solar: false,
    },
    filter: 'all',
    autoRotate: true,
    selectedId: null,
    selectedKind: null,
    rankMode: 'yield',
    idleTimer: null,
    closeZoom: false,
    altitude: 1.9,
    mobileTouched: false,
    openSheet: null, // 'layers' | 'list' | 'search' | null
    tooltipPinned: false,
  };

  let globe = null;
  let enriched = [];
  let enrichedFn = [];
  let enrichedWorld = [];
  let enrichedDrought = [];
  let fnById = {};
  let tooltipEl = null;
  let tooltipBodyEl = null;
  let zoomRaf = null;

  const $ = (s) => document.querySelector(s);

  function reserveDensityColor(d) {
    // Local cluster density = neighbors within ~75 km (not census population).
    const n = (d && d.density != null) ? d.density : ((d && d._res && d._res.density) || 0);
    const t = Math.max(0, Math.min(1, n / 80));
    const stops = [
      [0.00, [94, 200, 255]],
      [0.35, [126, 231, 180]],
      [0.65, [255, 230, 109]],
      [1.00, [255, 107, 53]],
    ];
    let a = stops[0][1], b = stops[stops.length - 1][1], u = t;
    for (let i = 0; i < stops.length - 1; i++) {
      if (t >= stops[i][0] && t <= stops[i + 1][0]) {
        const span = stops[i + 1][0] - stops[i][0] || 1;
        u = (t - stops[i][0]) / span;
        a = stops[i][1];
        b = stops[i + 1][1];
        break;
      }
    }
    const rr = Math.round(a[0] + (b[0] - a[0]) * u);
    const gg = Math.round(a[1] + (b[1] - a[1]) * u);
    const bb = Math.round(a[2] + (b[2] - a[2]) * u);
    return 'rgb(' + rr + ',' + gg + ',' + bb + ')';
  }


  /** Cache site-solar estimates (2200+ reserves — compute once per season). */
  const solarCache = Object.create(null);
  function siteSolar(lat, lng, season, rh) {
    const s = season || state.season || 'annual';
    const key = (lat != null ? (+lat).toFixed(3) : 'x') + ',' +
      (lng != null ? (+lng).toFixed(3) : 'x') + ',' + s + ',' +
      (rh != null ? (+rh).toFixed(2) : 'n');
    if (solarCache[key]) return solarCache[key];
    const out = Y.estimateSiteSolar(lat, lng, s, rh);
    solarCache[key] = out;
    return out;
  }

  function solarForEntity(ent) {
    if (ent && ent.solar) return ent.solar;
    const lat = ent.lat, lng = ent.lng;
    let rh = null;
    if (ent.bin && ent.bin.RH != null) rh = ent.bin.RH;
    else if (ent.climate) {
      const bin = ent.climate[state.season] || ent.climate.annual;
      if (bin && bin.RH != null) rh = bin.RH;
    }
    return siteSolar(lat, lng, state.season, rh);
  }

  function formatKWh(n) {
    if (n == null || isNaN(n)) return '—';
    if (n >= 10000) return (n / 1000).toFixed(1) + ' MWh';
    if (n >= 1000) return (n / 1000).toFixed(2) + ' MWh';
    return Math.round(n) + ' kWh';
  }

  function solarTooltipBlock(sol, yieldSolarFactor) {
    if (!sol) return '';
    const yf = yieldSolarFactor != null ? yieldSolarFactor : sol.yieldSolarFactor;
    return (
      '<div class="tc-grid solar-grid">' +
        '<div class="tc-cell"><div class="k">GHI (model)</div><div class="v solar-v">' + sol.ghi + ' <span class="unit">kWh/m²/day</span></div></div>' +
        '<div class="tc-cell"><div class="k">Est. PV harvest</div><div class="v solar-v">' + formatKWh(sol.kWhPerYear) + '<span class="unit">/yr</span></div></div>' +
        '<div class="tc-cell span2"><div class="k">Untapped for DEWFALL TEC branch</div><div class="v big solar-v">' +
          formatKWh(sol.untappedKWhYear) + ' <span class="model-only">until deployed</span></div></div>' +
        '<div class="tc-cell"><div class="k">Summer / winter GHI</div><div class="v">' + sol.ghiSummer + ' / ' + sol.ghiWinter + '</div></div>' +
        '<div class="tc-cell"><div class="k">Yield solar factor</div><div class="v">' +
          (yf != null ? yf : '—') + '</div></div>' +
      '</div>' +
      '<div class="solar-untapped-note">100% of modeled TEC-branch array harvest is untapped until a DEWFALL unit is installed. ' +
        'Array assumption: ' + sol.arrayKwp + ' kW<sub>p</sub> · PR ' + sol.pr + '.</div>'
    );
  }

  function needSignal(c) {
    let homes = (c.homes != null && c.homes > 0) ? c.homes : (c.buildings || 0);
    if (!homes) {
      const p = String(c.populationNote || '');
      if (/1001|5000/.test(p)) homes = 400;
      else if (/501|1000/.test(p)) homes = 150;
      else if (/101|500/.test(p)) homes = 80;
      else if (/51|100|26|50|1-25|0-100/.test(p)) homes = 30;
      else homes = c.term === 'short' ? 25 : 10;
    }
    const w = REMOTE_WEIGHT[c.remoteness] || 1;
    const termBoost = c.term === 'long' ? 1.15 : 1;
    return homes * w * termBoost;
  }

  function visibleReserves() {
    if (!state.layers.reserves) return [];
    return RESERVES.filter((r) => {
      if (DEFAULT_RESERVE_TYPES.has(r.type)) return true;
      if (state.layers.otherFn && OPTIONAL_RESERVE_TYPES.has(r.type)) return true;
      return false;
    });
  }

  function reserveCountLabel() {
    const all = visibleReserves();
    const ir = all.filter((r) => r.type === 'IR').length;
    const other = all.length - ir;
    const matched = all.filter((r) => r.hasLtdwa).length;
    let s = ir + ' Indian Reserves';
    if (other > 0) s += ' + ' + other + ' other FN lands';
    const longN = FN.filter((c) => c.term === 'long').length;
    const shortN = FN.filter((c) => c.term === 'short').length;
    s += ' · ' + FN.length + ' water-need (' + longN + ' long · ' + shortN + ' short; ISC+FNHA)';
    if (matched) s += ' · ' + matched + ' name-matched';
    return s;
  }

  function initUI() {
    tooltipEl = $('#tooltip');
    tooltipBodyEl = $('#tooltip-body') || tooltipEl;
    if (IS_MOBILE) {
      document.body.classList.add('mobile-ui');
      // Sync checkbox defaults to mobile layer state
      const hum = $('#layer-humidity');
      if (hum) hum.checked = !!state.layers.humidity;
      const dp = $('#layer-dewpoint');
      if (dp) dp.checked = !!state.layers.dewpoint;
    }
    FN.forEach((c) => { fnById[c.id] = c; });

    document.querySelectorAll('[data-season]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-season]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.season = btn.dataset.season;
        refresh();
      });
    });

    ['yield', 'humidity', 'dewpoint', 'reserves', 'ltdwa', 'world', 'drought', 'northern', 'solar'].forEach((key) => {
      const el = $('#layer-' + (key === 'reserves' ? 'reserves' : key));
      if (!el) return;
      el.checked = !!state.layers[key];
      el.addEventListener('change', () => {
        state.layers[key] = el.checked;
        if (key === 'ltdwa' || key === 'world' || key === 'drought' || key === 'northern' || key === 'reserves') {
          updateLtdwaBanner();
          if (state.rankMode === 'need' || state.rankMode === 'world' || state.rankMode === 'fit' || state.rankMode === 'markets') updateRankList();
          if (state.layers.solar) updateStats();
        }
        if (key === 'solar') {
          document.body.classList.toggle('solar-layer-on', !!state.layers.solar);
          updateStats();
          updateLtdwaBanner();
        }
        applyLayers();
      });
    });
    document.body.classList.toggle('solar-layer-on', !!state.layers.solar);

    const otherEl = $('#layer-other-fn');
    if (otherEl) {
      otherEl.checked = !!state.layers.otherFn;
      otherEl.addEventListener('change', () => {
        state.layers.otherFn = otherEl.checked;
        updateLtdwaBanner();
        applyLayers();
      });
    }

    const rot = $('#layer-rotate');
    if (rot) {
      rot.checked = !!state.autoRotate;
      rot.addEventListener('change', () => {
        state.autoRotate = rot.checked;
        if (globe) {
          globe.controls().autoRotate = state.autoRotate;
          if (state.autoRotate && IS_MOBILE) {
            globe.controls().autoRotateSpeed = 0.22;
          }
        }
      });
    }

    document.querySelectorAll('.rank-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.rank-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.rankMode = btn.dataset.rank;
        updateRankList();
      });
    });

    document.querySelectorAll('.filter-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        applyFocusFilter(btn.dataset.filter || 'all');
      });
    });
    syncFilterChips();

    initMobileChrome();
    updateLtdwaBanner();
  }

  function closeSheets() {
    state.openSheet = null;
    const controls = $('#panel-controls');
    const rank = $('#panel-rank');
    const search = $('#panel-search');
    const backdrop = $('#sheet-backdrop');
    const fabL = $('#fab-layers');
    const fabR = $('#fab-list');
    const fabS = $('#fab-search');
    const btnS = $('#btn-search');
    if (controls) controls.classList.remove('open');
    if (rank) rank.classList.remove('open');
    if (search) {
      search.classList.remove('open');
      search.hidden = true;
    }
    if (backdrop) {
      backdrop.classList.remove('show');
      backdrop.hidden = true;
      backdrop.setAttribute('aria-hidden', 'true');
    }
    if (fabL) fabL.setAttribute('aria-expanded', 'false');
    if (fabR) fabR.setAttribute('aria-expanded', 'false');
    if (fabS) fabS.setAttribute('aria-expanded', 'false');
    if (btnS) btnS.setAttribute('aria-expanded', 'false');
  }

  function openSheet(which) {
    // layers/list are mobile-only sheets; search works on desktop + mobile
    if (which !== 'search' && !IS_MOBILE) return;
    closeSheets();
    hideTooltip();
    state.openSheet = which;
    const backdrop = $('#sheet-backdrop');
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.classList.add('show');
      backdrop.setAttribute('aria-hidden', 'false');
    }
    if (which === 'layers') {
      const el = $('#panel-controls');
      if (el) el.classList.add('open');
      const fab = $('#fab-layers');
      if (fab) fab.setAttribute('aria-expanded', 'true');
    } else if (which === 'list') {
      const el = $('#panel-rank');
      if (el) el.classList.add('open');
      const fab = $('#fab-list');
      if (fab) fab.setAttribute('aria-expanded', 'true');
    } else if (which === 'search') {
      const el = $('#panel-search');
      if (el) {
        el.hidden = false;
        el.classList.add('open');
      }
      const fab = $('#fab-search');
      if (fab) fab.setAttribute('aria-expanded', 'true');
      const btn = $('#btn-search');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      const input = $('#search-input');
      if (input) {
        input.value = '';
        renderSearchResults('');
        setTimeout(function () {
          try { input.focus(); } catch (e) {}
        }, IS_MOBILE ? 280 : 40);
      }
    }
  }

  function toggleSearch() {
    if (state.openSheet === 'search') closeSheets();
    else openSheet('search');
  }

  function normSearch(s) {
    return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function haystackMatch(query, parts) {
    if (!query) return false;
    const hay = normSearch(parts.filter(Boolean).join(' | '));
    if (!hay) return false;
    const tokens = query.split(/\s+/).filter(Boolean);
    return tokens.every(function (t) { return hay.indexOf(t) !== -1; });
  }

  function syncFilterChips() {
    document.querySelectorAll('.filter-chip').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.filter === state.filter);
    });
  }

  function syncLayerCheckboxes() {
    ['yield', 'humidity', 'dewpoint', 'reserves', 'otherFn', 'ltdwa', 'world', 'drought', 'northern', 'solar'].forEach(function (key) {
      const id = key === 'otherFn' ? 'layer-other-fn' : ('layer-' + key);
      const el = document.getElementById(id);
      if (el && state.layers[key] != null) el.checked = !!state.layers[key];
    });
  }

  /** Compact focus chips: All / Need only / Markets only / High fit */
  function applyFocusFilter(filter) {
    state.filter = filter || 'all';
    if (state.filter === 'need') {
      state.layers.ltdwa = true;
      state.layers.world = true;
      state.layers.drought = false;
    } else if (state.filter === 'markets') {
      state.layers.ltdwa = false;
      state.layers.world = false;
      state.layers.drought = true;
    } else if (state.filter === 'highfit') {
      state.layers.ltdwa = true;
      state.layers.world = true;
      state.layers.drought = false;
    } else {
      state.filter = 'all';
      state.layers.ltdwa = true;
      state.layers.world = true;
      state.layers.drought = true;
    }
    syncFilterChips();
    syncLayerCheckboxes();
    updateLtdwaBanner();
    updateRankList();
    applyLayers();
  }

  function passesHighFit(c) {
    if (state.filter !== 'highfit') return true;
    const score = (c.fit && c.fit.score != null) ? c.fit.score : 0;
    return score >= 45;
  }

  function searchLocations(rawQuery) {
    const q = normSearch(rawQuery);
    if (!q || q.length < 1) return [];
    const out = [];
    const limit = 40;

    // Water-need communities first
    for (let i = 0; i < enrichedFn.length && out.length < limit; i++) {
      const c = enrichedFn[i];
      if (haystackMatch(q, [c.name, c.altNames, c.province, c.region, c.remoteness])) {
        out.push({
          kind: 'need',
          id: c.id,
          name: c.name,
          meta: (c.province || '') + (c.altNames ? ' · ' + c.altNames : '') + ' · ' + termLabel(c),
          score: (normSearch(c.name).indexOf(q) === 0 ? 0 : 1),
        });
      }
    }

    // World Indigenous / BWA need
    for (let i = 0; i < enrichedWorld.length && out.length < limit; i++) {
      const c = enrichedWorld[i];
      if (haystackMatch(q, [c.name, c.people, c.country, c.region, c.issue, c.notes, c.kindIssue])) {
        out.push({
          kind: 'world',
          id: c.id,
          name: c.name,
          meta: [(c.country || ''), (c.people || ''), (c.issue || '')].filter(Boolean).join(' · '),
          score: (normSearch(c.name).indexOf(q) === 0 ? 0 : 1),
        });
      }
    }

    // Drought / arid commercial markets
    for (let i = 0; i < enrichedDrought.length && out.length < limit; i++) {
      const c = enrichedDrought[i];
      if (haystackMatch(q, [c.name, c.country, c.region, c.drought, c.why, c.yieldHint, 'drought', 'market', 'arid'])) {
        out.push({
          kind: 'drought',
          id: c.id,
          name: c.name,
          meta: [(c.country || ''), (c.region || ''), 'T' + c.tier + ' market', (c.drought || '')].filter(Boolean).join(' · '),
          score: (normSearch(c.name).indexOf(q) === 0 ? 0 : 1),
        });
      }
    }

    // Yield cities
    for (let i = 0; i < enriched.length && out.length < limit; i++) {
      const c = enriched[i];
      if (haystackMatch(q, [c.name, c.region, c.market, c.note])) {
        out.push({
          kind: 'city',
          id: c.id,
          name: c.name,
          meta: (c.region || '') + (c.market ? ' · ' + c.market : ''),
          score: (normSearch(c.name).indexOf(q) === 0 ? 0 : 2),
        });
      }
    }

    // Reserves (large set — stop early)
    const reserves = RESERVES || [];
    for (let i = 0; i < reserves.length && out.length < limit; i++) {
      const r = reserves[i];
      if (haystackMatch(q, [r.name, r.alt, r.province, r.typeLabel, r.type])) {
        out.push({
          kind: 'reserve',
          id: r.id,
          name: r.name,
          meta: (r.province || '') + (r.typeLabel ? ' · ' + r.typeLabel : '') + (r.alt ? ' · ' + r.alt : ''),
          score: (normSearch(r.name).indexOf(q) === 0 ? 1 : 3),
        });
      }
    }

    out.sort(function (a, b) {
      if (a.score !== b.score) return a.score - b.score;
      return a.name.localeCompare(b.name);
    });
    return out.slice(0, limit);
  }

  function renderSearchResults(query) {
    const box = $('#search-results');
    const hint = $('#search-hint');
    if (!box) return;
    const q = normSearch(query);
    if (!q) {
      box.innerHTML = '';
      if (hint) hint.textContent = 'Type to find markets, water-need sites, reserves, or yield cities.';
      return;
    }
    const results = searchLocations(q);
    if (!results.length) {
      box.innerHTML = '<div class="search-empty">No matches for “' + escapeHtml(query.trim()) + '”</div>';
      if (hint) hint.textContent = 'Try another spelling, province code, or alt name.';
      return;
    }
    if (hint) hint.textContent = results.length + ' result' + (results.length === 1 ? '' : 's');
    const badge = { need: 'Need', world: 'World', drought: 'Market', reserve: 'Reserve', city: 'City' };
    box.innerHTML = results.map(function (r) {
      return '<button type="button" class="search-result" role="option" data-kind="' + r.kind + '" data-id="' + escapeHtml(r.id) + '">' +
        '<span class="search-badge ' + r.kind + '">' + badge[r.kind] + '</span>' +
        '<span class="search-result-main">' +
          '<div class="search-result-name">' + escapeHtml(r.name) + '</div>' +
          '<div class="search-result-meta">' + escapeHtml(r.meta) + '</div>' +
        '</span></button>';
    }).join('');
    box.querySelectorAll('.search-result').forEach(function (el) {
      el.addEventListener('click', function () {
        selectSearchResult(el.dataset.kind, el.dataset.id);
      });
    });
  }

  function selectSearchResult(kind, id) {
    closeSheets();
    if (kind === 'need') focusFn(id);
    else if (kind === 'world') focusWorld(id);
    else if (kind === 'drought') focusDrought(id);
    else if (kind === 'reserve') focusReserve(id);
    else if (kind === 'city') focusCity(id);
  }

  function initMobileChrome() {
    const fabL = $('#fab-layers');
    const fabR = $('#fab-list');
    const fabS = $('#fab-search');
    const btnS = $('#btn-search');
    const closeL = $('#close-layers');
    const closeR = $('#close-list');
    const closeS = $('#close-search');
    const searchInput = $('#search-input');
    const backdrop = $('#sheet-backdrop');
    const tipClose = $('#tooltip-close');
    const discDismiss = $('#disclaimer-dismiss');
    const ltdwaDismiss = $('#ltdwa-dismiss');

    if (fabL) {
      fabL.addEventListener('click', () => {
        if (state.openSheet === 'layers') closeSheets();
        else openSheet('layers');
      });
    }
    if (fabR) {
      fabR.addEventListener('click', () => {
        if (state.openSheet === 'list') closeSheets();
        else openSheet('list');
      });
    }
    if (fabS) fabS.addEventListener('click', toggleSearch);
    if (btnS) btnS.addEventListener('click', toggleSearch);
    if (closeL) closeL.addEventListener('click', closeSheets);
    if (closeR) closeR.addEventListener('click', closeSheets);
    if (closeS) closeS.addEventListener('click', closeSheets);
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        renderSearchResults(searchInput.value);
      });
      searchInput.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') {
          closeSheets();
        } else if (ev.key === 'Enter') {
          const first = document.querySelector('#search-results .search-result');
          if (first) {
            ev.preventDefault();
            selectSearchResult(first.dataset.kind, first.dataset.id);
          }
        }
      });
    }
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        if (tooltipEl && tooltipEl.classList.contains('visible') && state.tooltipPinned) {
          hideTooltip();
          return;
        }
        closeSheets();
      });
    }
    if (tipClose) tipClose.addEventListener('click', (ev) => {
      ev.stopPropagation();
      hideTooltip();
    });
    if (discDismiss) {
      discDismiss.addEventListener('click', () => {
        const b = $('#disclaimer-banner');
        if (b) b.classList.add('hidden');
      });
    }
    if (ltdwaDismiss) {
      ltdwaDismiss.addEventListener('click', () => {
        const b = $('#ltdwa-banner');
        if (b) b.classList.add('hidden');
      });
    }

    // Tap outside tooltip (globe) closes pinned mobile sheet tooltip
    document.addEventListener('click', (ev) => {
      if (!IS_MOBILE || !state.tooltipPinned) return;
      if (!tooltipEl || !tooltipEl.classList.contains('visible')) return;
      if (tooltipEl.contains(ev.target)) return;
      if (ev.target.closest && ev.target.closest('.fn-pin')) return;
      // Allow sheet FABs without immediately fighting
      if (ev.target.closest && (ev.target.closest('.fab') || ev.target.closest('.panel') || ev.target.closest('.search-launch'))) return;
      hideTooltip();
    }, true);
  }

  function updateLtdwaBanner() {
    const el = $('#ltdwa-banner');
    if (!el) return;
    const title = $('#banner-title');
    const stats = $('#banner-stats');
    const note = $('#banner-note');
    const showRes = state.layers.reserves;
    const showNeed = state.layers.ltdwa;
    const showWorld = state.layers.world;
    el.classList.toggle('dim', !showRes && !showNeed && !showWorld);
    if (state.layers.northern) el.classList.add('northern-on');
    else el.classList.remove('northern-on');
    const longN = FN.filter((c) => c.term === 'long').length;
    const shortN = FN.filter((c) => c.term === 'short').length;
    const bcN = FN.filter((c) => c.province === 'BC' || c.fnha).length;
    if (title) {
      if (showRes && showNeed) title.textContent = 'First Nations reserves + water need';
      else if (showRes) title.textContent = 'First Nations reserves (NRCan)';
      else if (showNeed) title.textContent = 'First Nations water-need (ISC + FNHA)';
      else title.textContent = 'First Nations layers off';
    }
    if (stats) {
      if (showRes) stats.textContent = '· ' + reserveCountLabel();
      else if (showNeed) {
        stats.textContent = '· ' + longN + ' long-term · ' + shortN + ' short-term · includes BC/Prairies/Atlantic/southern ON';
      } else stats.textContent = '';
    }
    if (note) {
      if (state.layers.solar) {
        note.textContent = 'Solar potential ON · reserves recolored by GHI (gold→deep orange) · untapped = modeled TEC-branch PV until DEWFALL deployed · model, not interconnection study';
      } else {
        let noteTxt = showNeed
          ? ('Amber/red = long-term · Gold = short-term · BC via FNHA (' + bcN + ') · need ≠ high yield')
          : 'Silver = all IR (NRCan ALC) · need layer off';
        if (showWorld) {
          noteTxt += ' · Amber world need pins (' + (getWorldMeta().count || enrichedWorld.length || getWorldRaw().length) + ')';
        }
        if (state.layers.drought) {
          noteTxt += ' · Teal market pins (' + (getDroughtMeta().count || enrichedDrought.length || getDroughtRaw().length) + ')';
        }
        note.textContent = noteTxt;
      }
    }
  }


  function climateStubForLat(lat, lng) {
    // Rough climate bins for model estimates only — NOT weather station data
    const abs = Math.abs(lat || 0);
    let annualT, summerT, winterT, rh;
    if (abs < 15) { annualT=27; summerT=28; winterT=26; rh=0.75; }
    else if (abs < 25) { annualT=24; summerT=28; winterT=18; rh=0.55; }
    else if (abs < 35) { annualT=18; summerT=28; winterT=8; rh=0.45; }
    else if (abs < 45) { annualT=10; summerT=20; winterT=-2; rh=0.65; }
    else if (abs < 55) { annualT=4; summerT=14; winterT=-10; rh=0.70; }
    else if (abs < 65) { annualT=-2; summerT=10; winterT=-18; rh=0.72; }
    else { annualT=-8; summerT=6; winterT=-22; rh=0.75; }
    // Desert SW nudge (Navajo belt)
    if (lat > 33 && lat < 38 && lng > -112 && lng < -106) { rh = 0.35; summerT = 30; annualT = 14; winterT = 2; }
    // N Australia tropical
    if (lat < -10 && lat > -20 && lng > 129 && lng < 138) { rh = 0.55; summerT = 33; winterT = 18; annualT = 26; }
    return {
      annual: { T: annualT, RH: rh },
      summer: { T: summerT, RH: Math.max(0.3, rh - 0.05) },
      winter: { T: winterT, RH: Math.min(0.85, rh + 0.05) }
    };
  }


  /**
   * Fit = how well DEWFALL's climate/yield matches a water-NEED site.
   * Geometric mean of need intensity (0–100) and yield suitability (0–100).
   * High need + weak climate → honest LOW fit (not a sales lie).
   * High need + workable climate → HIGH fit (priority outreach).
   */
  function fitScoreFor(c) {
    const need = Math.max(0, c.needSignal || 0);
    // need intensity: log-ish scale so huge home counts don't dominate forever
    // const needNorm = Math.max(0, Math.min(100, 18 * Math.log10(need + 1) * 12)); // tune so typical 20–90
    // Better: percentile-free fixed scale
    // needSignal Canada often homes*weight ~ 10–500; world ~50–110
    const need01 = Math.max(0, Math.min(1, Math.log10(need + 1) / Math.log10(401))); // 0..~1 at 400
    const yMid = (c.yield && c.yield.yieldMid != null) ? +c.yield.yieldMid : 0;
    // Design band ~10–20 L/day; 0 L = 0 suitability; 12+ L = strong
    const yield01 = Math.max(0, Math.min(1, yMid / 14));
    const fit01 = Math.sqrt(need01 * yield01); // geometric mean
    const score = Math.round(fit01 * 100);
    let label;
    if (score >= 70) label = 'Strong fit';
    else if (score >= 45) label = 'Moderate fit';
    else if (score >= 25) label = 'Limited fit';
    else label = 'Weak fit · cold/dry climate';
    let blurb;
    if (yield01 < 0.25 && need01 > 0.4) blurb = 'High need, but local climate yields little from refrigeration AWG — honest weak product fit.';
    else if (yield01 >= 0.5 && need01 >= 0.4) blurb = 'Meaningful need where DEWFALL climate model looks workable — priority conversation site.';
    else if (yield01 >= 0.5) blurb = 'Decent modeled yield; need signal moderate.';
    else blurb = 'Need and/or climate are modest under this season’s model bin.';
    return { score, label, blurb, need01, yield01, yMid };
  }

  function fitClass(score) {
    if (score >= 70) return 'fit-hi';
    if (score >= 45) return 'fit-mid';
    return 'fit-lo';
  }

  /** Commercial market proxy: fixed modest demand + modeled yield suitability. */
  function commercialFitFor(c) {
    const need01 = 0.35; // market-demand proxy — not advisory need
    const yMid = (c.yield && c.yield.yieldMid != null) ? +c.yield.yieldMid : 0;
    const yield01 = Math.max(0, Math.min(1, yMid / 14));
    const score = Math.round(Math.sqrt(need01 * yield01) * 100);
    let label;
    if (score >= 55) label = 'Strong market climate';
    else if (score >= 40) label = 'Workable market climate';
    else label = 'Modest market climate';
    const hint = c.yieldHint || '';
    let blurb = 'Buy-market overlay: drought / arid residential demand — not an advisory-need pin.';
    if (hint === 'high') blurb = 'Commercial beachhead where modeled climate looks productive vs DEWFALL design band.';
    else if (hint === 'strong') blurb = 'Strong arid demand market; yield model is workable — prioritize early sales conversations.';
    else if (hint === 'moderate') blurb = 'Arid demand is real; modeled L/day is moderate — still a beachhead, not a need site.';
    return { score, label, blurb, need01, yield01, yMid };
  }

  function sitePermalink(id) {
    let base;
    if (/donnyjm\.github\.io/i.test(location.hostname)) {
      base = 'https://donnyjm.github.io/dewfall-globe/';
    } else {
      base = location.origin + location.pathname;
    }
    try {
      const u = new URL(base, location.href);
      u.search = '';
      u.hash = '';
      u.searchParams.set('site', id);
      return u.toString();
    } catch (e) {
      const clean = String(base).split('#')[0].split('?')[0];
      const join = /[?&]$/.test(clean) ? '' : (clean.indexOf('?') >= 0 ? '&' : '?');
      return clean + join + 'site=' + encodeURIComponent(id);
    }
  }

  function setSiteParam(id) {
    try {
      const url = new URL(window.location.href);
      if (id) url.searchParams.set('site', id);
      else url.searchParams.delete('site');
      const next = url.pathname + url.search + (url.hash || '');
      history.replaceState(null, '', next);
    } catch (e) {}
  }

  function siteXmlocation(c) {
    if (c.lat != null && c.lng != null) {
      return Number(c.lat).toFixed(4) + ', ' + Number(c.lng).toFixed(4);
    }
    return [c.province || c.country, c.region].filter(Boolean).join(' · ') || '—';
  }

  function siteCardText(c) {
    const y = c.yield || {};
    const sol = c.solar || solarForEntity(c);
    const srcUrl = c.sourceUrl ? (' ' + c.sourceUrl) : '';
    const untapped = sol && sol.untappedKWhYear != null ? formatKWh(sol.untappedKWhYear) : '—';
    if (c.kind === 'drought' || (c.id && String(c.id).indexOf('drought-') === 0)) {
      const fit = c.fit || commercialFitFor(c);
      const src = c.source || (getDroughtMeta().sourceLabel || 'drought markets');
      return [
        'DEWFALL market card — ' + (c.name || 'market'),
        siteXmlocation(c),
        'MARKET · drought / arid demand (commercial beachhead)',
        'Tier ' + (c.tier || '?') + ' · ' + (c.drought || 'arid') + ' · ' + (c.why || ''),
        'Commercial fit: ' + fit.score + ' · ' + fit.label,
        'Modeled yield (' + state.season + '): ' + y.yieldLo + '–' + y.yieldHi + ' L/day (model estimate)',
        'Solar untapped (TEC branch): ' + untapped + ' model',
        'Source: ' + src + srcUrl,
        'Map: ' + sitePermalink(c.id),
        '— Mekilok / DEWFALL · buy market, not advisory-need · model estimates only'
      ].join('\n');
    }
    const fit = c.fit || fitScoreFor(c);
    const issue = c.issue || advisoryLabel(c.advisoryTypeRaw || c.advisoryType) || 'documented water access gap';
    const src = c.source || (c.world ? (getWorldMeta().sourceLabel || 'curated list') : (FN_META.sourceLabel || 'ISC / FNHA'));
    return [
      'DEWFALL site card — ' + (c.name || 'site'),
      siteXmlocation(c),
      'Need: ' + issue,
      'Fit: ' + fit.score + ' · ' + fit.label,
      'Modeled yield (' + state.season + '): ' + y.yieldLo + '–' + y.yieldHi + ' L/day (model estimate)',
      'Solar untapped (TEC branch): ' + untapped + ' model',
      'Source: ' + src + srcUrl,
      'Map: ' + sitePermalink(c.id),
      '— Mekilok / DEWFALL · model estimates only; not measured'
    ].join('\n');
  }

  function copyText(text, btn) {
    const done = function () {
      if (!btn) return;
      const prev = btn.textContent;
      btn.textContent = 'Copied';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = prev;
        btn.classList.remove('copied');
      }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text); done();
      });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function fallbackCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) {
      console.warn('[DEWFALL] copy failed', e);
    }
  }

  function shareRowHtml() {
    return '<div class="share-row">' +
      '<button type="button" class="share-btn" data-share="link">Copy link</button>' +
      '<button type="button" class="share-btn" data-share="text">Copy card</button>' +
      '</div>';
  }

  function wireShareButtons(c) {
    const root = tooltipContentEl();
    if (!root || !c) return;
    root.querySelectorAll('[data-share]').forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (ev.cancelable) ev.preventDefault();
        const mode = btn.dataset.share;
        if (mode === 'link') copyText(sitePermalink(c.id), btn);
        else if (mode === 'text') copyText(siteCardText(c), btn);
      });
    });
  }

  function fitScoreCellHtml(fit) {
    if (!fit) return '';
    return '<div class="tc-cell span2 fit-cell">' +
      '<div class="k">Fit score</div>' +
      '<div class="v big fit-score-big ' + fitClass(fit.score) + '">' + fit.score +
      ' <span class="fit-label">' + escapeHtml(fit.label) + '</span></div></div>';
  }

  function parseSiteParam() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      let site = params.get('site');
      if (!site && window.location.hash) {
        const m = String(window.location.hash).match(/[#&?]site=([^&]+)/i);
        if (m) site = decodeURIComponent(m[1]);
      }
      return site || null;
    } catch (e) {
      return null;
    }
  }

  function applySiteDeepLink() {
    const site = parseSiteParam();
    if (!site || !globe) return false;
    if (enrichedFn.some(function (x) { return x.id === site; })) {
      focusFn(site);
      return true;
    }
    if (enrichedWorld.some(function (x) { return x.id === site; })) {
      focusWorld(site);
      return true;
    }
    if (enrichedDrought.some(function (x) { return x.id === site; })) {
      focusDrought(site);
      return true;
    }
    if (getDroughtRaw().some(function (x) { return x.id === site; })) {
      if (!enrichedDrought.length) refreshDrought();
      focusDrought(site);
      return true;
    }
    if (enriched.some(function (x) { return x.id === site; })) {
      focusCity(site);
      return true;
    }
    if (reserveById[site] || (RESERVES || []).some(function (x) { return x.id === site; })) {
      focusReserve(site);
      return true;
    }
    return false;
  }

  function worldNeedSignal(w) {
    let s = 50;
    if (w.term === 'chronic' || w.term === 'long') s += 25;
    if (w.kind === 'both' || w.kind === 'indigenous') s += 15;
    if (/no piped|unserved|mercury|uranium|arsenic|boil/i.test((w.issue||'') + ' ' + (w.notes||''))) s += 20;
    return s;
  }

  function refreshDrought() {
    enrichedDrought = getDroughtRaw().map(function (m) {
      const city = Object.assign({}, m, {
        climate: climateStubForLat(m.lat, m.lng),
        province: m.region || m.country,
        remoteness: 'market',
        market: 'drought / arid demand',
        note: m.why,
        source: m.source,
        sourceUrl: m.sourceUrl,
      });
      // Arid SW / desert nudge: slightly drier stub for extreme/severe drought metros
      if ((m.drought === 'extreme' || m.drought === 'severe') && city.climate && city.climate.summer) {
        city.climate.summer.RH = Math.min(city.climate.summer.RH, 0.38);
        city.climate.annual.RH = Math.min(city.climate.annual.RH, 0.42);
      }
      const e = Y.enrichCity(city, state.season);
      e.kind = 'drought';
      e.tier = m.tier;
      e.drought = m.drought;
      e.why = m.why;
      e.yieldHint = m.yieldHint;
      e.populationNote = m.populationNote;
      e.country = m.country;
      e.region = m.region;
      e.marketKind = m.kind;
      e.fit = commercialFitFor(e);
      return e;
    });
  }

  function refreshWorld() {
    enrichedWorld = getWorldRaw().map((w) => {
      const city = Object.assign({}, w, {
        climate: climateStubForLat(w.lat, w.lng),
        province: w.region || w.country,
        remoteness: 'world',
        advisoryType: w.issue && /boil/i.test(w.issue) ? 'BWA' : 'NEED',
        homes: null,
        systems: [w.issue || 'documented water access gap'],
        note: w.notes,
        source: w.source,
        sourceUrl: w.sourceUrl,
        term: w.term === 'short' ? 'short' : 'long',
        world: true,
        people: w.people,
        country: w.country,
        kindIssue: w.kind,
      });
      const e = Y.enrichCity(city, state.season);
      e.needSignal = worldNeedSignal(w);
      e.kind = 'world';
      e.fit = fitScoreFor(e);
      return e;
    });
  }

  function refresh() {
    for (const k of Object.keys(solarCache)) delete solarCache[k];
    enriched = Y.enrichAll(CITIES, state.season);
    refreshWorld();
    refreshDrought();
    enrichedFn = FN.map((c) => {
      const e = Y.enrichCity(c, state.season);
      e.needSignal = needSignal(c);
      e.kind = 'fn';
      e.term = c.term || 'long';
      e.dateSet = c.dateSet;
      e.populationNote = c.populationNote;
      e.advisoryTypeRaw = c.advisoryTypeRaw;
      e.fnha = c.fnha;
      e.source = c.source;
      e.fit = fitScoreFor(e);
      return e;
    });
    updateStats();
    updateRankList();
    updateLtdwaBanner();
    applyLayers();
  }

  function updateStats() {
    const strip = $('.stats');
    if (state.layers.solar) {
      if (strip) strip.classList.add('solar-stats');
      const need = visibleFn();
      setText('#stat-peak-lbl', 'Peak GHI');
      setText('#stat-avg-lbl', 'Avg GHI (need)');
      setText('#stat-top-lbl', 'Peak site');
      setText('#stat-high-lbl', 'Untapped /yr');
      if (!need.length) {
        setText('#stat-peak', '—');
        setText('#stat-avg', '—');
        setText('#stat-top', '—');
        setText('#stat-high', '—');
        return;
      }
      let peak = null, sum = 0, untapped = 0;
      need.forEach((c) => {
        const sol = c.solar || solarForEntity(c);
        sum += sol.ghi;
        untapped += sol.untappedKWhYear || 0;
        if (!peak || sol.ghi > peak.ghi) peak = { ghi: sol.ghi, name: c.name };
      });
      setText('#stat-peak', peak.ghi.toFixed(2));
      setText('#stat-avg', (sum / need.length).toFixed(2));
      setText('#stat-top', peak ? shortName(peak.name) : '—');
      setText('#stat-high', formatKWh(untapped));
      return;
    }
    if (strip) strip.classList.remove('solar-stats');
    if (!enriched.length) return;
    const yields = enriched.map((c) => c.yield.yieldMid);
    const max = Math.max.apply(null, yields);
    const avg = yields.reduce((a, b) => a + b, 0) / yields.length;
    const top = enriched.slice().sort((a, b) => b.yield.yieldMid - a.yield.yieldMid)[0];
    const highCount = yields.filter((v) => v >= 10).length;
    setText('#stat-peak', max.toFixed(1) + ' L');
    setText('#stat-avg', avg.toFixed(1) + ' L');
    setText('#stat-top', top ? top.name.split(',')[0] : '\u2014');
    setText('#stat-high', String(highCount));
    setText('#stat-peak-lbl', 'Peak est.');
    setText('#stat-avg-lbl', 'Avg est.');
    setText('#stat-top-lbl', 'Top city');
    setText('#stat-high-lbl', '≥10 L cities');
  }

  function setText(sel, v) {
    const el = $(sel);
    if (el) el.textContent = v;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function advisoryLabel(t) {
    if (t === 'DNC') return 'Do not consume';
    if (t === 'DNU') return 'Do not use';
    if (t === 'WQA') return 'Water quality advisory';
    return 'Boil water advisory';
  }

  function termLabel(c) {
    if (c.term === 'short') return 'Short-term';
    return 'Long-term';
  }

  function shortName(name) {
    return String(name)
      .split('(')[0].trim()
      .replace(/ First Nation.*$/, '')
      .replace(/ Band of Indians.*$/, '')
      .replace(/ Cree Nation.*$/, '')
      .replace(/ Nation.*$/, '')
      .slice(0, 20);
  }

  function updateRankList() {
    const list = $('#rank-list');
    if (!list) return;
    const title = $('#rank-title');
    const sub = $('#rank-sub');

    if (state.rankMode === 'markets') {
      if (title) title.textContent = 'Drought / arid markets';
      if (sub) sub.textContent = 'Commercial first beachheads · sorted by tier then modeled yield';
      const rows = enrichedDrought.slice().sort(function (a, b) {
        const ta = a.tier || 9, tb = b.tier || 9;
        if (ta !== tb) return ta - tb;
        return (b.yield.yieldMid || 0) - (a.yield.yieldMid || 0);
      });
      list.innerHTML = rows.map(function (c, i) {
        const y = c.yield;
        const fit = c.fit || { score: 0, label: '—' };
        return '<div class="rank-item need-item drought-item' + (state.selectedId === c.id ? ' active' : '') +
          '" data-id="' + c.id + '" data-kind="drought">' +
          '<div class="num">' + (i + 1) + '</div>' +
          '<div><div class="city-name">' + escapeHtml(c.name) + '</div>' +
          '<div class="city-meta">T' + c.tier + ' · ' + escapeHtml(c.country || '') + ' · ' + escapeHtml(c.drought || '') + '</div></div>' +
          '<div class="yld need-yld">' +
            '<span class="need-score ' + fitClass(fit.score) + '">' + fit.score + '</span>' +
            '<span>mkt · ' + y.yieldLo + '–' + y.yieldHi + ' L est.</span>' +
          '</div></div>';
      }).join('');
    } else if (state.rankMode === 'fit') {
      if (title) title.textContent = 'Need × yield fit';
      if (sub) sub.textContent = 'Need × modeled yield · higher = better DEWFALL conversation';
      const rows = enrichedFn.concat(enrichedWorld).slice().sort(function (a, b) {
        const fa = (a.fit && a.fit.score) || 0;
        const fb = (b.fit && b.fit.score) || 0;
        return fb - fa;
      });
      list.innerHTML = rows.map(function (c, i) {
        const y = c.yield;
        const fit = c.fit || { score: 0, label: '—' };
        const where = c.world
          ? escapeHtml(c.country || '') + ' · world'
          : escapeHtml(c.province || '') + ' · ' + escapeHtml(termLabel(c));
        const kind = c.world ? 'world' : 'fn';
        return '<div class="rank-item need-item fit-item' + (state.selectedId === c.id ? ' active' : '') +
          '" data-id="' + c.id + '" data-kind="' + kind + '">' +
          '<div class="num">' + (i + 1) + '</div>' +
          '<div><div class="city-name">' + escapeHtml(c.name) + '</div>' +
          '<div class="city-meta">' + where + ' · ' + escapeHtml(fit.label) + '</div></div>' +
          '<div class="yld need-yld">' +
            '<span class="need-score ' + fitClass(fit.score) + '">' + fit.score + '</span>' +
            '<span>fit · ' + y.yieldLo + '–' + y.yieldHi + ' L est.</span>' +
          '</div></div>';
      }).join('');
    } else if (state.rankMode === 'world') {
      if (title) title.textContent = 'World Indigenous / BWA need';
      if (sub) sub.textContent = 'Curated documented sites · not exhaustive';
      const rows = enrichedWorld.slice().sort((a, b) => b.needSignal - a.needSignal);
      list.innerHTML = rows.map((c, i) => {
        const y = c.yield;
        const fit = c.fit;
        const fitCls = fit ? (' ' + fitClass(fit.score)) : '';
        return '<div class="rank-item need-item world' + (state.selectedId === c.id ? ' active' : '') + '" data-id="' + c.id + '" data-kind="world">' +
          '<div class="num">' + (i + 1) + '</div>' +
          '<div><div class="city-name">' + escapeHtml(c.name) + '</div>' +
          '<div class="city-meta">' + escapeHtml(c.country || '') + '  ·  ' + escapeHtml(c.people || '') + '  ·  ' + escapeHtml(c.issue || '') + '</div></div>' +
          '<div class="yld need-yld">' +
            '<span class="need-score' + fitCls + '">' + Math.round(c.needSignal) + '</span>' +
            '<span>need  ·  ' + y.yieldLo + '–' + y.yieldHi + ' L est.' +
            (fit ? (' · fit ' + fit.score) : '') + '</span>' +
          '</div></div>';
      }).join('');
    } else if (state.rankMode === 'need') {
      if (title) title.textContent = 'Water need vs modeled yield';
      if (sub) sub.textContent = 'Long + short-term (ISC/FNHA) \u00b7 ranked by need signal';
      let rows = enrichedFn.slice();
      if (state.layers.northern) {
        rows = rows.filter((c) => c.remoteness === 'remote-northern' || c.highlightNorthern);
      }
      rows.sort((a, b) => b.needSignal - a.needSignal);
      list.innerHTML = rows.map((c, i) => {
        const y = c.yield;
        const homes = c.homes != null ? c.homes + ' homes' : (c.buildings ? c.buildings + ' bldgs' : (c.populationNote || 'multi-system'));
        const north = (c.remoteness === 'remote-northern' || c.highlightNorthern) ? ' north' : '';
        const dnc = (c.advisoryType === 'DNC' || c.advisoryType === 'DNU') ? ' dnc' : '';
        const shortCls = c.term === 'short' ? ' short-term' : '';
        const fit = c.fit;
        const fitCls = fit ? (' ' + fitClass(fit.score)) : '';
        return '<div class="rank-item need-item' + north + dnc + shortCls + (state.selectedId === c.id ? ' active' : '') + '" data-id="' + c.id + '" data-kind="fn">' +
          '<div class="num">' + (i + 1) + '</div>' +
          '<div><div class="city-name">' + escapeHtml(c.name) + '</div>' +
          '<div class="city-meta">' + escapeHtml(c.province) + ' \u00b7 ' + escapeHtml(termLabel(c)) + ' \u00b7 ' + escapeHtml(advisoryLabel(c.advisoryTypeRaw || c.advisoryType)) +
          ' \u00b7 ' + escapeHtml(homes) + ' \u00b7 ' + escapeHtml(c.remoteness) + '</div></div>' +
          '<div class="yld need-yld">' +
            '<span class="need-score' + fitCls + '">' + Math.round(c.needSignal) + '</span>' +
            '<span>need \u00b7 ' + y.yieldLo + '\u2013' + y.yieldHi + ' L est.' +
            (fit ? (' \u00b7 fit ' + fit.score) : '') + '</span>' +
          '</div></div>';
      }).join('');
    } else {
      if (title) title.textContent = 'Where DEWFALL produces most';
      if (sub) sub.textContent = 'Ranked by modeled L/day \u00b7 click to fly';
      const sorted = enriched.slice().sort((a, b) => b.yield.yieldMid - a.yield.yieldMid);
      list.innerHTML = sorted.map((c, i) => {
        const y = c.yield;
        return '<div class="rank-item' + (state.selectedId === c.id ? ' active' : '') + '" data-id="' + c.id + '" data-kind="city">' +
          '<div class="num">' + (i + 1) + '</div>' +
          '<div><div class="city-name">' + escapeHtml(c.name) + '</div>' +
          '<div class="city-meta">' + escapeHtml(c.region) + ' \u00b7 ' + y.scoreLabel + '</div></div>' +
          '<div class="yld">' + y.yieldLo + '\u2013' + y.yieldHi + '<span>L/day est.</span></div></div>';
      }).join('');
    }

    list.querySelectorAll('.rank-item').forEach((el) => {
      el.addEventListener('click', () => {
        if (IS_MOBILE) closeSheets();
        if (el.dataset.kind === 'fn') focusFn(el.dataset.id);
        else if (el.dataset.kind === 'world') focusWorld(el.dataset.id);
        else if (el.dataset.kind === 'drought') focusDrought(el.dataset.id);
        else focusCity(el.dataset.id);
      });
    });
  }

  function focusCity(id) {
    const c = enriched.find((x) => x.id === id);
    if (!c || !globe) return;
    state.selectedId = id;
    state.selectedKind = 'city';
    updateRankList();
    applyLayers();
    globe.pointOfView({ lat: c.lat, lng: c.lng, altitude: 1.8 }, 1200);
    showCityTooltip(c, { clientX: window.innerWidth / 2 + 40, clientY: window.innerHeight / 2 - 80 });
    bumpIdle();
  }

  function focusFn(id) {
    const c = enrichedFn.find((x) => x.id === id);
    if (!c || !globe) return;
    state.selectedId = id;
    state.selectedKind = 'fn';
    setSiteParam(id);
    updateRankList();
    // Stop spinning so the pin stays in frame
    state.autoRotate = false;
    if (globe.controls) {
      try { globe.controls().autoRotate = false; } catch (e) {}
    }
    const rot = document.getElementById('layer-rotate');
    if (rot) rot.checked = false;
    applyLayers();
    // Close enough that one pin fills attention (was too high — felt like a vague pan)
    const alt = IS_MOBILE ? 0.28 : 0.32;
    globe.pointOfView({ lat: c.lat, lng: c.lng, altitude: alt }, 1400);
    // Re-apply after camera settles so HTML pin + beacon render in the new frustum
    setTimeout(function () {
      state.altitude = alt;
      state.closeZoom = true;
      applyLayers();
      showFnTooltip(c, {
        clientX: window.innerWidth / 2,
        clientY: IS_MOBILE ? window.innerHeight * 0.55 : window.innerHeight / 2 - 40
      });
    }, 1450);
    bumpIdle();
  }

  function focusWorld(id) {
    const c = enrichedWorld.find((x) => x.id === id);
    if (!c || !globe) return;
    state.selectedId = id;
    state.selectedKind = 'world';
    setSiteParam(id);
    updateRankList();
    state.autoRotate = false;
    if (globe.controls) {
      try { globe.controls().autoRotate = false; } catch (e) {}
    }
    const rot = document.getElementById('layer-rotate');
    if (rot) rot.checked = false;
    applyLayers();
    const alt = IS_MOBILE ? 0.28 : 0.32;
    globe.pointOfView({ lat: c.lat, lng: c.lng, altitude: alt }, 1400);
    setTimeout(function () {
      state.altitude = alt;
      state.closeZoom = true;
      applyLayers();
      showWorldTooltip(c, {
        clientX: window.innerWidth / 2,
        clientY: IS_MOBILE ? window.innerHeight * 0.55 : window.innerHeight / 2 - 40
      });
    }, 1450);
    bumpIdle();
  }

  function focusDrought(id) {
    const c = enrichedDrought.find((x) => x.id === id);
    if (!c || !globe) return;
    state.selectedId = id;
    state.selectedKind = 'drought';
    setSiteParam(id);
    updateRankList();
    state.autoRotate = false;
    if (globe.controls) {
      try { globe.controls().autoRotate = false; } catch (e) {}
    }
    const rot = document.getElementById('layer-rotate');
    if (rot) rot.checked = false;
    applyLayers();
    const alt = IS_MOBILE ? 0.28 : 0.32;
    globe.pointOfView({ lat: c.lat, lng: c.lng, altitude: alt }, 1400);
    setTimeout(function () {
      state.altitude = alt;
      state.closeZoom = true;
      applyLayers();
      showDroughtTooltip(c, {
        clientX: window.innerWidth / 2,
        clientY: IS_MOBILE ? window.innerHeight * 0.55 : window.innerHeight / 2 - 40
      });
    }, 1450);
    bumpIdle();
  }

  function focusReserve(id) {
    const r = reserveById[id] || (RESERVES || []).find((x) => x.id === id);
    if (!r || !globe) return;
    state.selectedId = id;
    state.selectedKind = 'reserve';
    applyLayers();
    globe.pointOfView({ lat: r.lat, lng: r.lng, altitude: 0.55 }, 1400);
    const tipEv = { clientX: window.innerWidth / 2, clientY: window.innerHeight * 0.55 };
    const show = function () {
      if (r.hasLtdwa && r.ltdwaId && fnById[r.ltdwaId]) {
        const c = enrichedFn.find((x) => x.id === r.ltdwaId) || Y.enrichCity(fnById[r.ltdwaId], state.season);
        if (c && !c.needSignal) c.needSignal = needSignal(fnById[r.ltdwaId]);
        showFnTooltip(c, tipEv, r);
      } else {
        showReserveTooltip(r, tipEv);
      }
    };
    if (IS_MOBILE) setTimeout(show, 500);
    else show();
    bumpIdle();
  }


  function coldClimateCaveat(c) {
    if (c.remoteness === 'remote-northern' || (c.lat && c.lat >= 53) || c.highlightNorthern) {
      return 'Cold / northern climate: refrigeration AWG L/day is typically MUCH lower than warm-humid markets. Model yield below is an honest local-climate estimate \u2014 not a high-production pitch.';
    }
    if (c.yield && c.yield.T < 8) {
      return 'Cool climate bin: fridge core is derated. Treat L/day as a model estimate under local normals, not a Caribbean-class yield.';
    }
    return 'Yield is a climate model estimate under local normals \u2014 this pin marks unmet drinking-water NEED, not a high-AWG sales site.';
  }

  function visibleFn() {
    if (!state.layers.ltdwa) return [];
    let rows = enrichedFn;
    if (state.layers.northern) {
      rows = rows.filter((c) => c.remoteness === 'remote-northern' || c.highlightNorthern);
    }
    if (state.filter === 'highfit') {
      rows = rows.filter(passesHighFit);
    }
    return rows;
  }

  function visibleWorld() {
    if (!state.layers.world) return [];
    if (state.filter === 'highfit') return enrichedWorld.filter(passesHighFit);
    return enrichedWorld;
  }

  function visibleDrought() {
    if (!state.layers.drought) return [];
    return enrichedDrought;
  }

  function applyLayers() {
    if (!globe) return;
    // Rehydrate world pins if data arrived late or first paint raced
    if (state.layers.world && !enrichedWorld.length && getWorldRaw().length) {
      refreshWorld();
    }
    if (state.layers.drought && !enrichedDrought.length && getDroughtRaw().length) {
      refreshDrought();
    }
    const maxY = Math.max.apply(null, enriched.map((c) => c.yield.yieldMid).concat([1]));
    const reserves = visibleReserves();
    const useReservePts = state.layers.reserves && reserves.length > 0;
    // Mobile: at altitude > 1.3 hide individual reserves (keep yield + need); show all when zoomed in.
    const showReservesNow = !IS_MOBILE || state.altitude < 1.3;

    const pts = [];
    if (state.layers.yield && enriched.length) {
      enriched.forEach((c) => {
        pts.push({
          kind: 'city',
          id: c.id,
          lat: c.lat,
          lng: c.lng,
          yield: c.yield,
          name: c.name,
          region: c.region,
          market: c.market,
          _city: c,
        });
      });
    }
    if (useReservePts && showReservesNow) {
      // Skip reserves that already have a larger LTDWA pin to reduce clutter
      let idx = 0;
      reserves.forEach((r) => {
        if (r.hasLtdwa && state.layers.ltdwa) return;
        // Far-ish mobile zoom: subsample every 2nd until very close (altitude already gated)
        if (IS_MOBILE && state.altitude >= 1.05 && (idx++ % 2) === 1) return;
        pts.push({
          kind: 'reserve',
          id: r.id,
          lat: r.lat,
          lng: r.lng,
          name: r.name,
          type: r.type,
          typeLabel: r.typeLabel,
          province: r.province,
          hasLtdwa: !!r.hasLtdwa,
          ltdwaId: r.ltdwaId,
          density: r.density || 0,
          _res: r,
        });
      });
    }

    // Tall beacon pillar for selected Water Need (Canada or world)
    // World need sites as amber pillars (backup visibility + match need language)
    if (state.layers.world) {
      visibleWorld().forEach(function (w) {
        pts.push({
          kind: 'world-need',
          id: w.id,
          lat: w.lat,
          lng: w.lng,
          yield: w.yield || { yieldMid: 8 },
          _world: w,
        });
      });
    }

    if (state.selectedKind === 'fn' && state.selectedId) {
      const sel = enrichedFn.find((x) => x.id === state.selectedId);
      if (sel) {
        pts.push({
          kind: 'need-beacon',
          id: 'beacon-' + sel.id,
          lat: sel.lat,
          lng: sel.lng,
          yield: { yieldMid: 1 },
          _fn: sel,
          beaconColor: '#ffd24a',
        });
      }
    }
    if (state.selectedKind === 'world' && state.selectedId) {
      const sel = enrichedWorld.find((x) => x.id === state.selectedId);
      if (sel) {
        pts.push({
          kind: 'need-beacon',
          id: 'beacon-world-' + sel.id,
          lat: sel.lat,
          lng: sel.lng,
          yield: { yieldMid: 1 },
          _world: sel,
          beaconColor: '#ff6ad5',
        });
      }
    }
    if (state.selectedKind === 'drought' && state.selectedId) {
      const sel = enrichedDrought.find((x) => x.id === state.selectedId);
      if (sel) {
        pts.push({
          kind: 'need-beacon',
          id: 'beacon-drought-' + sel.id,
          lat: sel.lat,
          lng: sel.lng,
          yield: { yieldMid: 1 },
          _drought: sel,
          beaconColor: '#3ec8d4',
        });
      }
    }

    if (pts.length) {
      const reserveR = IS_MOBILE
        ? (state.altitude > 1.1 ? 0.04 : 0.055)
        : (state.altitude > 2.2 ? 0.045 : (state.altitude > 1.5 ? 0.055 : 0.07));
      // Mobile: merge reserve-heavy point clouds for WebGL cost; desktop stays unmerged for crisp clicks.
      const mergePts = IS_MOBILE && useReservePts && showReservesNow && state.altitude >= 1.05;
      globe
        .pointsData(pts)
        .pointLat('lat')
        .pointLng('lng')
        .pointAltitude((d) => {
          if (d.kind === 'need-beacon') return 0.28;
          if (d.kind === 'world-need') return 0.045;
          if (d.kind === 'reserve') return 0.0025;
          return 0.01 + (d.yield.yieldMid / maxY) * 0.22;
        })
        .pointRadius((d) => {
          if (d.kind === 'need-beacon') return 0.55;
          if (d.kind === 'world-need') return 0.42;
          if (d.kind === 'reserve') {
            const dens = (d.density != null ? d.density : (d._res && d._res.density)) || 0;
            return reserveR * (1 + Math.min(0.35, dens / 140));
          }
          return 0.28 + (d.yield.yieldMid / maxY) * 0.55;
        })
        .pointColor((d) => {
          if (d.kind === 'need-beacon') return d.beaconColor || '#ffd24a';
          if (d.kind === 'world-need') return '#f0a040';
          if (d.kind === 'reserve') {
            if (state.layers.solar) {
              const sol = d._solar || siteSolar(d.lat, d.lng, state.season, null);
              d._solar = sol;
              return Y.solarColor(sol.ghi);
            }
            return reserveDensityColor(d);
          }
          if (state.layers.solar && d._city && d._city.solar) {
            return Y.solarColor(d._city.solar.ghi);
          }
          return Y.yieldColor(d.yield.yieldMid, maxY);
        })
        .pointsMerge(mergePts)
        .pointLabel(() => '')
        .onPointHover(IS_MOBILE ? function () {} : onPointHover)
        .onPointClick((d) => {
          if (!d) return;
          if (d.kind === 'need-beacon' && d._fn) focusFn(d._fn.id);
          else if (d.kind === 'need-beacon' && d._world) focusWorld(d._world.id);
          else if (d.kind === 'need-beacon' && d._drought) focusDrought(d._drought.id);
          else if (d.kind === 'world-need' && d._world) focusWorld(d._world.id);
          else if (d.kind === 'world-need') focusWorld(d.id);
          else if (d.kind === 'reserve' || d._res) focusReserve(d.id || (d._res && d._res.id));
          else if (d.kind === 'city' || d._city) focusCity(d.id || (d._city && d._city.id));
        });
    } else {
      globe.pointsData([]);
    }

    // Hexbins removed — they read as blurry dots at country scale.
    globe.hexBinPointsData([]);

    // Rings: humidity mist only (OFF by default). Never auto-ring every need site.
    const mist = [];
    if (state.layers.humidity && enriched.length) {
      enriched.filter((c) => c.yield.AH >= 8).forEach((c) => {
        mist.push({
          lat: c.lat,
          lng: c.lng,
          maxR: 1.5 + Math.min(4, c.yield.AH / 5),
          propagationSpeed: 0.8 + c.yield.AH / 20,
          repeatPeriod: 1400 - Math.min(600, c.yield.AH * 25),
          color: (function (city) {
            return function () {
              const a = 0.15 + Math.min(0.35, city.yield.AH / 40);
              return 'rgba(160, 220, 255, ' + a + ')';
            };
          })(c),
        });
      });
    }
    // Optional northern-only pulse when highlight toggle is on
    if (state.layers.ltdwa && state.layers.northern) {
      visibleFn().forEach((c) => {
        const isNorth = c.remoteness === 'remote-northern' || c.highlightNorthern;
        if (!isNorth) return;
        mist.push({
          lat: c.lat,
          lng: c.lng,
          maxR: 2.4,
          propagationSpeed: 0.55,
          repeatPeriod: 1100,
          color: function () { return 'rgba(255, 90, 50, 0.35)'; },
        });
      });
    }
    // Loud locator rings ONLY on the selected water-need site
    if (state.layers.ltdwa && state.selectedKind === 'fn' && state.selectedId) {
      const sel = enrichedFn.find((c) => c.id === state.selectedId);
      if (sel) {
        [1.2, 2.4, 3.8].forEach(function (maxR, i) {
          mist.push({
            lat: sel.lat,
            lng: sel.lng,
            maxR: maxR,
            propagationSpeed: 0.9 + i * 0.25,
            repeatPeriod: 700 + i * 200,
            color: function () {
              return i === 0 ? 'rgba(255, 240, 140, 0.85)' : 'rgba(255, 180, 40, 0.55)';
            },
          });
        });
      }
    }
    if (state.layers.world && state.selectedKind === 'world' && state.selectedId) {
      const sel = enrichedWorld.find((c) => c.id === state.selectedId);
      if (sel) {
        [1.2, 2.4, 3.8].forEach(function (maxR, i) {
          mist.push({
            lat: sel.lat,
            lng: sel.lng,
            maxR: maxR,
            propagationSpeed: 0.9 + i * 0.25,
            repeatPeriod: 700 + i * 200,
            color: function () {
              return i === 0 ? 'rgba(255, 240, 140, 0.85)' : 'rgba(255, 180, 40, 0.55)';
            },
          });
        });
      }
    }
    if (state.layers.drought && state.selectedKind === 'drought' && state.selectedId) {
      const sel = enrichedDrought.find((c) => c.id === state.selectedId);
      if (sel) {
        [1.2, 2.4, 3.8].forEach(function (maxR, i) {
          mist.push({
            lat: sel.lat,
            lng: sel.lng,
            maxR: maxR,
            propagationSpeed: 0.9 + i * 0.25,
            repeatPeriod: 700 + i * 200,
            color: function () {
              return i === 0 ? 'rgba(120, 240, 255, 0.85)' : 'rgba(62, 200, 212, 0.5)';
            },
          });
        });
      }
    }
    globe.ringsData(mist)
      .ringLat('lat').ringLng('lng')
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatPeriod')
      .ringColor('color');

    // HTML overlays: dewpoint (opt) + water-need pins (dot only — names in sheet/tooltip)
    const htmlItems = [];
    if (state.layers.dewpoint && enriched.length) {
      enriched.forEach((c) => {
        htmlItems.push({ kind: 'dp', lat: c.lat, lng: c.lng, city: c });
      });
    }
    if (state.layers.ltdwa) {
      visibleFn().forEach((c) => {
        const selected = state.selectedKind === 'fn' && state.selectedId === c.id;
        htmlItems.push({ kind: 'fn', lat: c.lat, lng: c.lng, city: c, selected: selected });
      });
    }
    if (state.layers.world) {
      visibleWorld().forEach((w) => {
        const selected = state.selectedKind === 'world' && state.selectedId === w.id;
        htmlItems.push({ kind: 'world', lat: w.lat, lng: w.lng, city: w, selected: selected });
      });
    }
    if (state.layers.drought) {
      visibleDrought().forEach((m) => {
        const selected = state.selectedKind === 'drought' && state.selectedId === m.id;
        htmlItems.push({ kind: 'drought', lat: m.lat, lng: m.lng, city: m, selected: selected });
      });
    }

    if (htmlItems.length) {
      globe.htmlElementsData(htmlItems)
        .htmlLat('lat').htmlLng('lng')
        .htmlAltitude((d) => (d.selected ? 0.06 : 0.018))
        .htmlElement((d) => {
          if (d.kind === 'dp') {
            const el = document.createElement('div');
            el.style.cssText = 'color:#c8e8f0;font:600 10px/1 sans-serif;background:rgba(8,20,36,0.75);border:1px solid rgba(62,200,212,0.35);padding:3px 6px;border-radius:6px;white-space:nowrap;pointer-events:none;transform:translate(-50%,-100%);text-shadow:0 1px 2px #000;';
            el.textContent = 'Tdp ' + d.city.yield.Tdp + '\u00b0C';
            return el;
          }
          if (d.kind === 'world') return makeWorldPin(d.city);
          if (d.kind === 'drought') return makeDroughtPin(d.city);
          return makeFnPin(d.city);
        });
    } else {
      globe.htmlElementsData([]);
    }

    const hq = enriched.find((c) => c.id === 'north-vancouver');
    if (hq) {
      globe.labelsData([hq])
        .labelLat('lat').labelLng('lng')
        .labelText(() => 'DEWFALL HQ')
        .labelSize(0.45).labelDotRadius(0.35)
        .labelColor(() => 'rgba(62,200,212,0.95)')
        .labelAltitude(0.02).labelResolution(2);
    }
  }

  function makeFnPin(c) {
    const isNorth = c.remoteness === 'remote-northern' || c.highlightNorthern;
    const isDnc = c.advisoryType === 'DNC' || c.advisoryType === 'DNU';
    const isShort = c.term === 'short';
    const isSelected = state.selectedKind === 'fn' && state.selectedId === c.id;
    const el = document.createElement('div');
    el.className = 'fn-pin' + (isNorth ? ' northern' : '') + (isShort ? ' short' : '') + (isDnc ? ' dnc' : ' bwa') +
      (state.layers.northern && isNorth ? ' emphasis' : '') +
      (isSelected ? ' selected' : '');
    el.title = '';
    // Dot only — except the SELECTED water-need site shows its name as a locator
    if (isSelected) {
      const fitBit = (c.fit && c.fit.score != null) ? (' · ' + c.fit.score) : '';
      el.innerHTML = '<span class="fn-pin-beacon"></span><span class="fn-pin-dot"></span><span class="fn-pin-label fn-pin-label-selected">' +
        escapeHtml(shortName(c.name)) + fitBit + '</span>';
    } else {
      el.innerHTML = '<span class="fn-pin-dot"></span>';
    }
    if (!IS_MOBILE) {
      el.addEventListener('mouseenter', (ev) => {
        showFnTooltip(c, ev);
        document.body.style.cursor = 'pointer';
        bumpIdle();
      });
      el.addEventListener('mouseleave', () => {
        hideTooltip();
        document.body.style.cursor = 'default';
      });
    }
    function openFn(ev) {
      if (ev) {
        ev.stopPropagation();
        if (ev.cancelable) ev.preventDefault();
      }
      focusFn(c.id);
    }
    el.addEventListener('click', openFn);
    el.addEventListener('touchend', function (ev) {
      // iOS: HTML overlays on WebGL often miss click; touchend is reliable
      openFn(ev);
    }, { passive: false });
    return el;
  }

  function makeWorldPin(c) {
    // Same visual language as Canadian need pins (amber BWA / gold short)
    const isSelected = state.selectedKind === 'world' && state.selectedId === c.id;
    const isShort = c.term === 'short';
    const isDnc = /do not (consume|use)|arsenic|mercury|uranium/i.test(
      (c.issue || '') + ' ' + (c.notes || '') + ' ' + (c.advisoryType || '')
    );
    const el = document.createElement('div');
    el.className = 'fn-pin world emphasis' + (isShort ? ' short' : '') + (isDnc ? ' dnc' : ' bwa') +
      (isSelected ? ' selected' : '');
    el.title = '';
    if (isSelected) {
      const fitBit = (c.fit && c.fit.score != null) ? (' · ' + c.fit.score) : '';
      el.innerHTML = '<span class="fn-pin-beacon"></span><span class="fn-pin-dot"></span><span class="fn-pin-label fn-pin-label-selected">' +
        escapeHtml(shortName(c.name)) + fitBit + '</span>';
    } else {
      el.innerHTML = '<span class="fn-pin-dot"></span>';
    }
    if (!IS_MOBILE) {
      el.addEventListener('mouseenter', (ev) => {
        showWorldTooltip(c, ev);
        document.body.style.cursor = 'pointer';
        bumpIdle();
      });
      el.addEventListener('mouseleave', () => {
        hideTooltip();
        document.body.style.cursor = 'default';
      });
    }
    function openWorld(ev) {
      if (ev) {
        ev.stopPropagation();
        if (ev.cancelable) ev.preventDefault();
      }
      focusWorld(c.id);
    }
    el.addEventListener('click', openWorld);
    el.addEventListener('touchend', function (ev) {
      openWorld(ev);
    }, { passive: false });
    return el;
  }

  function makeDroughtPin(c) {
    const isSelected = state.selectedKind === 'drought' && state.selectedId === c.id;
    const tier = c.tier || 3;
    const el = document.createElement('div');
    el.className = 'drought-pin tier-' + tier + (isSelected ? ' selected' : '');
    el.title = '';
    if (isSelected) {
      const fitBit = (c.fit && c.fit.score != null) ? (' · ' + c.fit.score) : '';
      el.innerHTML = '<span class="drought-pin-beacon"></span><span class="drought-pin-diamond"></span><span class="drought-pin-label drought-pin-label-selected">' +
        escapeHtml(shortName(c.name)) + fitBit + '</span>';
    } else {
      el.innerHTML = '<span class="drought-pin-diamond"></span>';
    }
    if (!IS_MOBILE) {
      el.addEventListener('mouseenter', (ev) => {
        showDroughtTooltip(c, ev);
        document.body.style.cursor = 'pointer';
        bumpIdle();
      });
      el.addEventListener('mouseleave', () => {
        hideTooltip();
        document.body.style.cursor = 'default';
      });
    }
    function openDrought(ev) {
      if (ev) {
        ev.stopPropagation();
        if (ev.cancelable) ev.preventDefault();
      }
      focusDrought(c.id);
    }
    el.addEventListener('click', openDrought);
    el.addEventListener('touchend', function (ev) {
      openDrought(ev);
    }, { passive: false });
    return el;
  }

  function onPointHover(d, ev) {
    if (d) {
      if (d.kind === 'reserve') {
        showReserveTooltip(d._res || d, ev);
      } else {
        showCityTooltip(d._city || d, ev);
      }
      document.body.style.cursor = 'pointer';
    } else {
      hideTooltip();
      document.body.style.cursor = 'default';
    }
    bumpIdle();
  }

  function tooltipContentEl() {
    return document.getElementById('tooltip-body') || tooltipEl;
  }
  function setTooltipHtml(html) {
    const el = tooltipContentEl();
    el.innerHTML = html;
  }


  function showCityTooltip(c, ev) {
    const y = c.yield;
    const badgeClass = 's' + y.score;
    tooltipEl.classList.remove('need-card', 'reserve-card', 'world-card', 'drought-card');
    setTooltipHtml(
      '<div class="tc-head">' +
        '<h3>' + escapeHtml(c.name) + '</h3>' +
        '<div class="sub">' + escapeHtml(c.region) + ' \u00b7 ' + escapeHtml(c.market || '') + '</div>' +
        '<span class="badge ' + badgeClass + '">' + escapeHtml(y.scoreLabel) + ' \u00b7 score ' + y.score + '/5</span>' +
      '</div>' +
      '<div class="tc-grid">' +
        '<div class="tc-cell span2"><div class="k">Estimated DEWFALL yield</div><div class="v big">' + y.yieldLo + ' \u2013 ' + y.yieldHi + ' L/day</div></div>' +
        '<div class="tc-cell"><div class="k">Dry-bulb</div><div class="v">' + y.T + ' \u00b0C</div></div>' +
        '<div class="tc-cell"><div class="k">Relative humidity</div><div class="v">' + y.RH + '%</div></div>' +
        '<div class="tc-cell"><div class="k">Dew point</div><div class="v">' + y.Tdp + ' \u00b0C</div></div>' +
        '<div class="tc-cell"><div class="k">Abs. humidity</div><div class="v">' + y.AH + ' g/m\u00b3</div></div>' +
      '</div>' +
      solarTooltipBlock(c.solar || solarForEntity(c), y.solar) +
      '<div class="tc-body">' +
        '<div class="why">' + escapeHtml(y.why) + '</div>' +
        '<div class="fit">' + escapeHtml(y.marketFit) + '</div>' +
        '<div class="tc-breakdown">' +
          '<span>Fridge core: <strong>' + y.fridge + ' L</strong></span>' +
          '<span>TEC/sorbent: <strong>' + y.tec + ' L</strong></span>' +
          '<span>Solar factor: <strong>' + y.solar + '</strong></span>' +
        '</div>' +
        '<div class="est-tag">MODEL ESTIMATE \u2014 not measured. Machine incomplete. Climate normals \u00b7 ' + escapeHtml(state.season) + ' season bin. Irradiance model \u2014 not a utility interconnection study.</div>' +
      '</div>');
    pinTooltip(ev);
  }

  function showReserveTooltip(r, ev) {
    tooltipEl.classList.remove('need-card', 'world-card', 'drought-card');
    tooltipEl.classList.add('reserve-card');
    // names/info only via hover tooltip / mobile sheet
    const ltdwa = r.hasLtdwa && r.ltdwaId ? fnById[r.ltdwaId] : null;
    const badge = ltdwa
      ? '<span class="badge ltdwa-link">On active water-need list</span>'
      : '<span class="badge reserve-badge">No active advisory on current need list</span>';
    setTooltipHtml(
      '<div class="tc-head reserve-head">' +
        '<div class="reserve-kicker">First Nations land \u00b7 NRCan ALC</div>' +
        '<h3 style="font-size:1.35rem;line-height:1.25;margin:6px 0 8px;color:#fff;font-weight:700;">' + escapeHtml(r.name) + '</h3>' +
        (r.alt ? '<div class="sub">' + escapeHtml(r.alt) + '</div>' : '') +
        '<div class="sub">' + escapeHtml(r.province || '') + ' \u00b7 ' + escapeHtml(r.typeLabel || r.type || 'IR') + '</div>' +
        badge +
      '</div>' +
      solarTooltipBlock(siteSolar(r.lat, r.lng, state.season, null), null) +
      '<div class="tc-body">' +
        (ltdwa
          ? '<div class="why">Matched to ISC LTDWA community: <strong>' + escapeHtml(ltdwa.name) + '</strong>. Click the amber need pin for advisory details.</div>'
          : '<div class="why">Indian Reserve / FN land centroid. Not on the current ISC federal public-system LTDWA list (list changes; private wells &amp; territorial systems may still have advisories).</div>') +
        '<div class="fit">Nearby reserve density: <strong>' + (r.density != null ? r.density : '—') + '</strong> other reserves within 75 km (cluster proxy — not census population).</div>' +
        '<div class="est-tag">Source: NRCan Aboriginal Lands of Canada Legislative Boundaries. Pin = polygon centroid (largest part). Attribution: NRCan + ISC LTDWA. Solar: offline GHI model \u2014 not a utility interconnection study.</div>' +
      '</div>');
    pinTooltip(ev);
  }

  function showFnTooltip(c, ev, reserveCtx) {
    const y = c.yield;
    const fit = c.fit || fitScoreFor(c);
    if (!c.fit) c.fit = fit;
    const homes = c.homes != null ? String(c.homes) : (c.populationNote || c.homesImpactNote || 'see systems');
    const since = c.longTermSince || c.dateSet || 'see source';
    const systems = (c.systems || []).map(escapeHtml).join('<br/>');
    const alt = c.altNames ? '<div class="sub">' + escapeHtml(c.altNames) + '</div>' : '';
    const badge = (c.advisoryType === 'DNC' || c.advisoryType === 'DNU') ? 'dnc' : (c.term === 'short' ? 'short-badge' : 'bwa');
    const northTag = (c.remoteness === 'remote-northern' || c.highlightNorthern)
      ? '<span class="badge north-badge">Northern remote</span>' : '';
    const termTag = '<span class="badge ' + (c.term === 'short' ? 'short-badge' : 'long-badge') + '">' +
      escapeHtml(termLabel(c)) + '</span>';
    const bcTag = (c.province === 'BC' || c.fnha) ? '<span class="badge bc-badge">BC FNHA</span>' : '';
    const resLine = reserveCtx
      ? '<div class="sub">Reserve match: ' + escapeHtml(reserveCtx.name) + ' (' + escapeHtml(reserveCtx.type || 'IR') + ')</div>'
      : '';

    tooltipEl.classList.remove('reserve-card', 'world-card', 'drought-card');
    tooltipEl.classList.add('need-card');
    setTooltipHtml(
      '<div class="tc-head need-head">' +
        '<div class="need-kicker">NEED · fit = need × climate yield (model)</div>' +
        '<h3 style="font-size:1.3rem;line-height:1.25;margin:6px 0 8px;color:#fff;">' + escapeHtml(c.name) + '</h3>' +
        alt +
        resLine +
        '<div class="sub">' + escapeHtml(c.province) + ' · ' + escapeHtml(c.remoteness) + '</div>' +
        termTag + ' ' +
        '<span class="badge ' + badge + '">' + escapeHtml(advisoryLabel(c.advisoryTypeRaw || c.advisoryType)) + '</span> ' +
        northTag + ' ' + bcTag +
      '</div>' +
      '<div class="tc-grid">' +
        fitScoreCellHtml(fit) +
        '<div class="tc-cell"><div class="k">Population / homes</div><div class="v">' + escapeHtml(homes) + '</div></div>' +
        '<div class="tc-cell"><div class="k">' + (c.term === 'short' ? 'Date set' : 'Long-term since') + '</div><div class="v">' + escapeHtml(since) + '</div></div>' +
        '<div class="tc-cell span2"><div class="k">Estimated DEWFALL under local climate</div><div class="v big need-yield">' +
          y.yieldLo + ' – ' + y.yieldHi + ' L/day <span class="model-only">(model)</span></div></div>' +
        '<div class="tc-cell"><div class="k">Dry-bulb / RH</div><div class="v">' + y.T + ' °C · ' + y.RH + '%</div></div>' +
        '<div class="tc-cell"><div class="k">Dew point</div><div class="v">' + y.Tdp + ' °C</div></div>' +
      '</div>' +
      '<div class="tc-body">' +
        '<div class="fit-blurb">' + escapeHtml(fit.blurb) + '</div>' +
        '<div class="systems"><strong>System(s):</strong><br/>' + systems + '</div>' +
        '<div class="why cold-caveat">' + escapeHtml(coldClimateCaveat(c)) + '</div>' +
        (c.note ? '<div class="fit">' + escapeHtml(c.note) + '</div>' : '') +
        solarTooltipBlock(c.solar || solarForEntity(c), y.solar) +
        '<div class="tc-breakdown">' +
          '<span>Fridge: <strong>' + y.fridge + ' L</strong></span>' +
          '<span>TEC/sorbent: <strong>' + y.tec + ' L</strong></span>' +
          '<span>Need signal: <strong>' + Math.round(c.needSignal) + '</strong></span>' +
        '</div>' +
        '<div class="est-tag">' +
          'Source: ' + escapeHtml(c.source || FN_META.sourceLabel || 'ISC / FNHA') + '. ' +
          'List changes. Includes ISC long-term + short-term (south of 60 excl. BC) and FNHA BC advisories. ' +
          'Not all private wells or territorial systems. Reserve geometry: NRCan ALC. Model estimate · ' + escapeHtml(state.season) + ' bin. Solar irradiance model — not a utility interconnection study.' +
        '</div>' +
        shareRowHtml() +
      '</div>');
    wireShareButtons(c);
    pinTooltip(ev);
  }

  function showWorldTooltip(c, ev) {
    const y = c.yield;
    const fit = c.fit || fitScoreFor(c);
    if (!c.fit) c.fit = fit;
    const people = c.people ? escapeHtml(c.people) : '—';
    const region = [c.country, c.region].filter(Boolean).map(escapeHtml).join(' · ');
    const issue = escapeHtml(c.issue || 'documented water access gap');
    const term = escapeHtml(c.term === 'short' ? 'Short-term' : (c.term === 'chronic' || c.term === 'long' ? 'Chronic / long-term' : String(c.term || 'long')));
    const srcHtml = c.sourceUrl
      ? ('<a href="' + escapeHtml(c.sourceUrl) + '" target="_blank" rel="noopener">' + escapeHtml(c.source || 'source') + '</a>')
      : escapeHtml(c.source || getWorldMeta().sourceLabel || 'curated list');

    tooltipEl.classList.remove('reserve-card', 'drought-card');
    tooltipEl.classList.add('need-card', 'world-card');
    setTooltipHtml(
      '<div class="tc-head need-head">' +
        '<div class="need-kicker">WORLD NEED · fit = need × climate yield (model)</div>' +
        '<h3 style="font-size:1.3rem;line-height:1.25;margin:6px 0 8px;color:#fff;">' + escapeHtml(c.name) + '</h3>' +
        '<div class="sub">' + region + '</div>' +
        '<span class="badge world-badge">World</span> ' +
        '<span class="badge long-badge">' + term + '</span>' +
      '</div>' +
      '<div class="tc-grid">' +
        fitScoreCellHtml(fit) +
        '<div class="tc-cell"><div class="k">People</div><div class="v">' + people + '</div></div>' +
        '<div class="tc-cell"><div class="k">Issue</div><div class="v">' + issue + '</div></div>' +
        '<div class="tc-cell span2"><div class="k">Estimated DEWFALL under lat-band climate stub</div><div class="v big need-yield">' +
          y.yieldLo + ' – ' + y.yieldHi + ' L/day <span class="model-only">(model · climate stub)</span></div></div>' +
        '<div class="tc-cell"><div class="k">Dry-bulb / RH</div><div class="v">' + y.T + ' °C · ' + y.RH + '%</div></div>' +
        '<div class="tc-cell"><div class="k">Dew point</div><div class="v">' + y.Tdp + ' °C</div></div>' +
      '</div>' +
      '<div class="tc-body">' +
        '<div class="fit-blurb">' + escapeHtml(fit.blurb) + '</div>' +
        (c.note ? '<div class="fit">' + escapeHtml(c.note) + '</div>' : '') +
        '<div class="why cold-caveat">Climate inputs are lat-band stubs (not weather-station normals). Yield is a model estimate only — this pin marks documented water NEED.</div>' +
        '<div class="tc-breakdown">' +
          '<span>Fridge: <strong>' + y.fridge + ' L</strong></span>' +
          '<span>TEC/sorbent: <strong>' + y.tec + ' L</strong></span>' +
          '<span>Need signal: <strong>' + Math.round(c.needSignal) + '</strong></span>' +
        '</div>' +
        '<div class="est-tag">' +
          'Source: ' + srcHtml + '. Curated global list; not exhaustive; Canada FN on separate layer; centroids approximate. Model estimate · ' + escapeHtml(state.season) + ' bin.' +
        '</div>' +
        shareRowHtml() +
      '</div>');
    wireShareButtons(c);
    pinTooltip(ev);
  }

  function showDroughtTooltip(c, ev) {
    const y = c.yield;
    const fit = c.fit || commercialFitFor(c);
    if (!c.fit) c.fit = fit;
    const region = [c.country, c.region].filter(Boolean).map(escapeHtml).join(' · ');
    const srcHtml = c.sourceUrl
      ? ('<a href="' + escapeHtml(c.sourceUrl) + '" target="_blank" rel="noopener">' + escapeHtml(c.source || 'source') + '</a>')
      : escapeHtml(c.source || getDroughtMeta().sourceLabel || 'drought markets');
    const pop = c.populationNote ? escapeHtml(c.populationNote) : '—';
    const tierBadge = '<span class="badge drought-tier">Tier ' + escapeHtml(String(c.tier || '?')) + '</span>';
    const droughtBadge = '<span class="badge drought-badge">' + escapeHtml(String(c.drought || 'arid')) + '</span>';

    tooltipEl.classList.remove('need-card', 'reserve-card', 'world-card');
    tooltipEl.classList.add('drought-card');
    setTooltipHtml(
      '<div class="tc-head drought-head">' +
        '<div class="need-kicker drought-kicker">MARKET · drought / arid demand — commercial first beachhead</div>' +
        '<h3 style="font-size:1.3rem;line-height:1.25;margin:6px 0 8px;color:#fff;">' + escapeHtml(c.name) + '</h3>' +
        '<div class="sub">' + region + '</div>' +
        tierBadge + ' ' + droughtBadge +
        ' <span class="badge market-badge">Buy market</span>' +
      '</div>' +
      '<div class="tc-grid">' +
        fitScoreCellHtml(fit) +
        '<div class="tc-cell"><div class="k">Population</div><div class="v">' + pop + '</div></div>' +
        '<div class="tc-cell"><div class="k">Yield hint</div><div class="v">' + escapeHtml(c.yieldHint || '—') + '</div></div>' +
        '<div class="tc-cell span2"><div class="k">Estimated DEWFALL under lat-band climate stub</div><div class="v big need-yield">' +
          y.yieldLo + ' – ' + y.yieldHi + ' L/day <span class="model-only">(model · climate stub)</span></div></div>' +
        '<div class="tc-cell"><div class="k">Dry-bulb / RH</div><div class="v">' + y.T + ' °C · ' + y.RH + '%</div></div>' +
        '<div class="tc-cell"><div class="k">Dew point</div><div class="v">' + y.Tdp + ' °C</div></div>' +
      '</div>' +
      '<div class="tc-body">' +
        '<div class="fit-blurb">' + escapeHtml(c.why || fit.blurb) + '</div>' +
        '<div class="why cold-caveat">This is a buy market, not an advisory-need pin. Teal diamonds mark commercial drought / arid demand — distinct from amber Indigenous / BWA need sites.</div>' +
        solarTooltipBlock(c.solar || solarForEntity(c), y.solar) +
        '<div class="tc-breakdown">' +
          '<span>Fridge: <strong>' + y.fridge + ' L</strong></span>' +
          '<span>TEC/sorbent: <strong>' + y.tec + ' L</strong></span>' +
          '<span>Commercial fit: <strong>' + fit.score + '</strong></span>' +
        '</div>' +
        '<div class="est-tag">' +
          'Source: ' + srcHtml + '. Curated commercial first-market list; centroids approximate; not water-advisory sites. Model estimate · ' + escapeHtml(state.season) + ' bin.' +
        '</div>' +
        shareRowHtml() +
      '</div>');
    wireShareButtons(c);
    pinTooltip(ev);
  }

  function positionTooltip(ev) {
    if (!tooltipEl) return;
    if (IS_MOBILE) {
      // Bottom sheet — CSS owns left/right/bottom; clear desktop coords
      tooltipEl.style.left = '';
      tooltipEl.style.top = '';
      return;
    }
    if (!ev) return;
    const pad = 16;
    const w = 340;
    const h = tooltipEl.offsetHeight || 400;
    let x = (ev.clientX || 0) + 18;
    let y = (ev.clientY || 0) - 20;
    if (x + w > window.innerWidth - pad) x = (ev.clientX || 0) - w - 18;
    if (y + h > window.innerHeight - pad) y = window.innerHeight - h - pad;
    if (y < pad) y = pad;
    if (x < pad) x = pad;
    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top = y + 'px';
  }

  function pinTooltip(ev) {
    positionTooltip(ev);
    state.tooltipPinned = !!IS_MOBILE;
    if (IS_MOBILE) {
      closeSheets();
      const backdrop = $('#sheet-backdrop');
      if (backdrop) {
        backdrop.hidden = false;
        backdrop.classList.add('show');
        backdrop.setAttribute('aria-hidden', 'false');
      }
      // iOS Safari: force layout before adding .visible so translate3d animates
      tooltipEl.classList.remove('visible');
      void tooltipEl.offsetHeight;
      tooltipEl.classList.add('visible');
      // scroll sheet content to top so name is visible
      const body = tooltipContentEl();
      if (body) body.scrollTop = 0;
    } else {
      tooltipEl.classList.add('visible');
    }
  }

  function hideTooltip() {
    if (!tooltipEl) return;
    tooltipEl.classList.remove('visible');
    state.tooltipPinned = false;
    if (IS_MOBILE && !state.openSheet) {
      const backdrop = $('#sheet-backdrop');
      if (backdrop) {
        backdrop.classList.remove('show');
        backdrop.hidden = true;
        backdrop.setAttribute('aria-hidden', 'true');
      }
    }
  }

  function bumpIdle() {
    if (!globe) return;
    globe.controls().autoRotate = false;
    clearTimeout(state.idleTimer);
    if (IS_MOBILE) {
      // After first interaction, stop auto-rotate until user toggles it back on
      state.mobileTouched = true;
      state.autoRotate = false;
      const rot = $('#layer-rotate');
      if (rot) rot.checked = false;
      return;
    }
    state.idleTimer = setTimeout(() => {
      if (state.autoRotate && globe) globe.controls().autoRotate = true;
    }, 8000);
  }

  function syncZoomMode() {
    if (!globe) return;
    const pov = globe.pointOfView();
    const alt = pov && pov.altitude != null ? pov.altitude : state.altitude;
    state.altitude = alt;
    state.closeZoom = IS_MOBILE ? alt < 1.15 : alt < 1.85;
    document.body.classList.toggle('mobile-close-zoom', IS_MOBILE && state.closeZoom);
    // Rebuild when crossing pin-size / mobile reserve-visibility bands
    let sizeBand;
    if (IS_MOBILE) {
      // >1.3 hide reserves; 1.05–1.3 subsample; <1.05 all
      sizeBand = alt > 1.3 ? 0 : (alt >= 1.05 ? 1 : 2);
    } else {
      sizeBand = alt > 2.2 ? 0 : (alt > 1.5 ? 1 : 2);
    }
    if (sizeBand !== state._sizeBand) {
      state._sizeBand = sizeBand;
      if (state.layers.reserves || IS_MOBILE) applyLayers();
    }
  }

  function bootGlobe() {
    const el = $("#globeViz");
    const base = "vendor/img/";
    const earthDay = base + "earth-blue-marble.jpg";
    const earthTopo = base + "earth-topology.png";
    const sky = base + "night-sky.png";

    globe = Globe()(el)
      .globeImageUrl(earthDay)
      .bumpImageUrl(earthTopo)
      .backgroundImageUrl(sky)
      .showAtmosphere(true)
      .atmosphereColor("#4ec8e8")
      .atmosphereAltitude(0.18);

    const resize = () => {
      globe.width(window.innerWidth);
      globe.height(window.innerHeight);
    };
    resize();
    window.addEventListener("resize", resize);

    // Cap DPR on mobile Safari — full retina WebGL with 2200+ points is too heavy
    try {
      const r = globe.renderer && globe.renderer();
      if (r && r.setPixelRatio) {
        r.setPixelRatio(Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1.5 : 2));
      }
    } catch (e) {
      console.warn('[DEWFALL] setPixelRatio failed', e);
    }

    const ctrl = globe.controls();
    ctrl.autoRotate = true;
    ctrl.autoRotateSpeed = IS_MOBILE ? 0.22 : 0.45;
    ctrl.enableDamping = true;
    ctrl.minDistance = 120;
    ctrl.maxDistance = 800;
    ctrl.addEventListener('change', () => {
      if (zoomRaf) return;
      zoomRaf = requestAnimationFrame(() => {
        zoomRaf = null;
        syncZoomMode();
      });
    });

    el.addEventListener("mousedown", bumpIdle);
    el.addEventListener("wheel", bumpIdle, { passive: true });
    el.addEventListener("touchstart", bumpIdle, { passive: true });

    // Prefer Canada framing a bit closer on phones so taps matter sooner
    const startAlt = IS_MOBILE ? 2.05 : 1.9;
    globe.pointOfView({ lat: 52, lng: -92, altitude: startAlt }, 0);
    state.altitude = startAlt;
    state.closeZoom = false;
    if (IS_MOBILE) document.body.classList.remove('mobile-close-zoom');
    refresh();

    setTimeout(() => {
      const loader = $("#loader");
      if (loader) loader.classList.add("hide");
      // Deep link ?site=<id> after enrich + globe ready
      try { applySiteDeepLink(); } catch (e) { console.warn('[DEWFALL] site deep link', e); }
    }, 900);
  }

  function showBootError(msg) {
    if (typeof window.__DEWFALL_SHOW_LOAD_ERROR__ === "function") {
      window.__DEWFALL_SHOW_LOAD_ERROR__(msg || "EARTH FAILED TO LOAD");
      return;
    }
    var loader = document.querySelector("#loader");
    if (!loader) return;
    loader.classList.remove("hide");
    loader.classList.add("error");
    var pEl = loader.querySelector(".loader-inner p");
    if (pEl) pEl.textContent = msg || "EARTH FAILED TO LOAD";
  }

  function main() {
    if (typeof Globe === "undefined") {
      console.error("[DEWFALL] Globe is undefined - cannot init Earth");
      showBootError("EARTH FAILED TO LOAD");
      return;
    }
    if (!Y || !CITIES) {
      console.error("DEWFALL: missing yield model or cities data");
      showBootError("EARTH FAILED TO LOAD");
      return;
    }
    if (!FN.length) console.warn("DEWFALL: FN water-need data not loaded");
    else console.info("DEWFALL need layer:", FN.length, "communities (" + FN.filter(function (c) { return c.term === "long"; }).length + " long · " + FN.filter(function (c) { return c.term === "short"; }).length + " short)");
    if (!RESERVES.length) console.warn("DEWFALL: FN reserves data not loaded");
    else console.info("[DEWFALL] reserves loaded:", RESERVES.length, RES_META.dedupedCountsByType || {});
    const dm = getDroughtRaw();
    if (!dm.length) console.warn("DEWFALL: drought markets data not loaded");
    else console.info("[DEWFALL] drought markets:", dm.length, getDroughtMeta().sourceLabel || "");
    try {
      initUI();
      bootGlobe();
    } catch (err) {
      console.error("[DEWFALL] boot failed", err);
      showBootError("EARTH FAILED TO LOAD");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
