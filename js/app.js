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
  let IS_MOBILE = detectMobile();
  const COUNTRY_WATER = window.DEWFALL_COUNTRY_WATER || [];

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
      countries: false,
      drought: true,
      northern: false,
      solar: false,
    },
    filter: 'all',
    worldCause: 'all',
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

    $('#layer-countries').addEventListener('change', function () { state.layers.countries = this.checked; applyLayers(); });
    $('#world-cause').addEventListener('change', function () { state.worldCause = this.value; updateRankList(); applyLayers(); });
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
    for (let i = 0; i < enrichedFn.length; i++) {
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
    for (let i = 0; i < enrichedWorld.length; i++) {
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
    for (let i = 0; i < enrichedDrought.length; i++) {
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
    for (let i = 0; i < enriched.length; i++) {
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
    for (let i = 0; i < reserves.length; i++) {
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

    COUNTRY_WATER.forEach(function(c) {
      if (haystackMatch(q,[c.name,c.iso3,c.region])) out.push({kind:'country',id:c.id,name:c.name,meta:'National water-access estimates · '+c.region,score:2});
    });
    out.forEach(function (r) { if (normSearch(r.name) === q) r.score = -1; });
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
    if (hint) hint.textContent = (results.length === 40 ? 'Top 40 matches' : results.length + ' result' + (results.length === 1 ? '' : 's'));
    const badge = { need: 'Need', world: 'World', drought: 'Market', reserve: 'Reserve', city: 'City', country: 'Country' };
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
    if (kind === 'country') focusCountry(id);
    else if (kind === 'need') focusFn(id);
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
        } else if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
          ev.preventDefault();
          const rows = Array.from(document.querySelectorAll('#search-results .search-result'));
          if (!rows.length) return;
          const current = rows.findIndex(el => el.classList.contains('search-focused'));
          const next = current < 0 ? (ev.key === 'ArrowDown' ? 0 : rows.length - 1) : (current + (ev.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length;
          rows.forEach((el,i) => {el.classList.toggle('search-focused',i === next);el.setAttribute('aria-selected',String(i === next));});
          rows[next].scrollIntoView({block:'nearest'});
        } else if (ev.key === 'Enter') {
          const first = document.querySelector('#search-results .search-result.search-focused') || document.querySelector('#search-results .search-result');
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
    // Screening suitability; 0 L = 0 suitability; 12+ L = strong
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


  /** Coarse country-level income bands for fallback when site-socio missing. */
  const COUNTRY_INCOME_PROXY = {
    USA: { band: 'USD middle (national proxy)', note: 'national ACS/GNI proxy — not local' },
    US: { band: 'USD middle (national proxy)', note: 'national ACS/GNI proxy — not local' },
    Canada: { band: 'CAD middle (national proxy)', note: 'national proxy — not community' },
    CA: { band: 'CAD middle (national proxy)', note: 'national proxy — not community' },
    Australia: { band: 'AUD middle (national proxy)', note: 'national ABS/GNI proxy' },
    Mexico: { band: 'MXN lower-middle–middle (national)', note: 'national GNI proxy' },
    Chile: { band: 'CLP middle (national proxy)', note: 'national GNI proxy' },
    'South Africa': { band: 'ZAR lower-middle (national)', note: 'national GNI proxy — high inequality' },
    Israel: { band: 'ILS middle (national proxy)', note: 'national GNI proxy' },
    Spain: { band: 'EUR middle (national proxy)', note: 'national GNI proxy' },
    UAE: { band: 'AED middle–upper (national)', note: 'national GNI proxy' },
    'Saudi Arabia': { band: 'SAR middle (national proxy)', note: 'national GNI proxy' },
    Brazil: { band: 'BRL lower-middle (national)', note: 'national GNI proxy' },
    Peru: { band: 'PEN lower-middle (national)', note: 'national GNI proxy' },
    Bolivia: { band: 'BOB low–lower-middle (national)', note: 'national GNI proxy' },
    Botswana: { band: 'BWP lower-middle (national)', note: 'national GNI proxy' },
    Tanzania: { band: 'TZS low (national)', note: 'national GNI proxy' },
    Namibia: { band: 'NAD lower-middle (national)', note: 'national GNI proxy' },
    Greenland: { band: 'DKK middle (Greenland proxy)', note: 'municipal / national proxy' },
    Kiribati: { band: 'AUD-equivalent low–lower-middle', note: 'national GNI proxy' },
    Tuvalu: { band: 'AUD-equivalent low–lower-middle', note: 'national GNI proxy' },
    'Marshall Islands': { band: 'USD low–lower-middle', note: 'national GNI proxy' },
    'New Zealand': { band: 'NZD middle (national proxy)', note: 'national GNI proxy' }
  };

  function formatPopulation(n) {
    if (n == null || n === '' || isNaN(Number(n))) return null;
    const v = Number(n);
    if (v >= 1000000) {
      const m = v / 1000000;
      return '~' + (m >= 10 ? Math.round(m) : (Math.round(m * 10) / 10)) + 'M';
    }
    if (v >= 10000) return '~' + Math.round(v / 1000) + 'k';
    if (v >= 1000) return '~' + (Math.round(v / 100) / 10) + 'k';
    return '~' + String(Math.round(v));
  }

  function socioFor(c) {
    if (!c) return { populationLabel: '—', incomeLabel: '—', populationNote: '', incomeNote: '', source: '' };
    const table = window.DEWFALL_SITE_SOCIO || {};
    const hit = table[c.id];
    if (hit) {
      const popLabel = hit.population != null
        ? (formatPopulation(hit.population) + (hit.populationNote ? ' · ' + hit.populationNote : ''))
        : (hit.populationNote || '—');
      return {
        population: hit.population,
        populationLabel: popLabel || '—',
        populationNote: hit.populationNote || '',
        incomeBand: hit.incomeBand || '',
        incomeLabel: hit.incomeBand || '—',
        incomeNote: hit.incomeNote || '',
        source: hit.source || '',
        sourceUrl: hit.sourceUrl || '',
        fromTable: true
      };
    }
    // Fallbacks — never invent precise incomes
    let population = null;
    let populationNote = '';
    let populationLabel = '—';
    if (c.homes != null && !isNaN(Number(c.homes)) && Number(c.homes) > 0) {
      population = Math.round(Number(c.homes) * 3);
      populationNote = 'est. community (homes×3)';
      populationLabel = formatPopulation(population) + ' · ' + populationNote;
    } else if (c.populationNote) {
      populationLabel = String(c.populationNote);
      populationNote = String(c.populationNote);
    } else if (c.homesImpactNote) {
      populationLabel = String(c.homesImpactNote);
    }

    const country = c.country || (c.kind === 'fn' || (c.id && String(c.id).indexOf('fn-') === 0) ? 'Canada' : '');
    const proxy = COUNTRY_INCOME_PROXY[country] || null;
    let incomeLabel = '—';
    let incomeNote = '';
    if (c.kind === 'fn' || (c.id && String(c.id).indexOf('fn-') === 0)) {
      incomeLabel = 'CAD low–moderate';
      incomeNote = 'provincial Indigenous proxy — not band-specific';
    } else if (proxy) {
      incomeLabel = proxy.band;
      incomeNote = proxy.note;
    }

    return {
      population: population,
      populationLabel: populationLabel,
      populationNote: populationNote,
      incomeBand: incomeLabel !== '—' ? incomeLabel : '',
      incomeLabel: incomeLabel,
      incomeNote: incomeNote,
      source: 'runtime fallback',
      sourceUrl: '',
      fromTable: false
    };
  }

  function fundersForSite(c) {
    const list = window.DEWFALL_FUNDERS || [];
    if (!c || !list.length) return [];
    const id = String(c.id || '').toLowerCase();
    const name = String(c.name || '').toLowerCase();
    const country = String(c.country || '').toLowerCase();
    const region = String(c.region || c.province || '').toLowerCase();
    const people = String(c.people || '').toLowerCase();
    const hay = [id, name, country, region, people, String(c.altNames || ''), String(c.notes || ''), String(c.note || ''), String(c.why || '')].join(' ').toLowerCase();
    const isDrought = c.kind === 'drought' || id.indexOf('drought-') === 0;
    const isFn = c.kind === 'fn' || id.indexOf('fn-') === 0;
    const isWorld = c.kind === 'world' || !!c.world;
    const isIndigenous = isFn ||
      /indigenous|aboriginal|first nation|tribal|navajo|din[eé]|hopi|yanomami|maasai|himba|inuit|māori|maori|shipibo|aymara|yaqui|gwich|yup'?ik|iñupiat|inupiat/i.test(hay) ||
      (c.kindIssue === 'indigenous' || c.kindIssue === 'both');

    // Primary geography buckets (strict)
    const buckets = new Set();
    if (isFn || /canada/.test(country) || id.indexOf('fn-') === 0) {
      buckets.add('canada');
      if (c.province) buckets.add('prov:' + String(c.province).toUpperCase());
    }
    if (/usa|united states/.test(country) || id.indexOf('usa-') === 0 || (isDrought && /usa|united states/.test(country))) {
      buckets.add('usa');
    }
    if (isDrought && /usa|united states/.test(country)) buckets.add('usa-drought');
    if (/australia/.test(country) || id.indexOf('aus-') === 0) buckets.add('australia');
    if (/northern territory|\bnt\b/.test(region) || /aus-(laramba|willowra|yuendumu|angurugu|numbulwar|wilora|yuelamu|alpurrurulam|nauiyu|wugularr|engawala|bulla|nyirripi)/.test(id)) {
      buckets.add('australia-nt');
    }
    if (/western australia/.test(region) || /aus-(kiwirrkurra|pandanus|warburton|jigalong|ngumpan|mulan|wanarn|kunawarritji|wingellina|blackstone|yandeyarra|burringurrah|pia-wadjari|tjukurla|bow-river|tjuntjuntjara)/.test(id)) {
      buckets.add('australia-wa');
    }
    if (/navajo|din[eé]|shiprock|thoreau|dilkon|crownpoint|oljato|leupp|dennehotso|tolani|pueblo-pintado|counselor/.test(hay)) buckets.add('navajo');
    if (/alaska|chefornak|kipnuk|kivalina|newtok|shishmaref|yup|iñupiat|inupiat|alatna|allakaket|tuntutuliak/.test(hay)) buckets.add('alaska');
    if (/brazil|yanomami|roraima/.test(hay)) buckets.add('brazil');
    if (/peru|shipibo|matsigenka|nanay|cusco|espinar/.test(hay)) buckets.add('peru');
    if (/bolivia|aymara|tiquipa/.test(hay)) buckets.add('bolivia');
    if (((/yaqui|sonora/.test(hay) || (/mexico/.test(hay) && !/new mexico/.test(hay))) && !/new mexico/.test(region)) || (isDrought && /mexico/i.test(country))) buckets.add('mexico');
    if (/chile|santiago/.test(hay) || (isDrought && /chile/.test(country))) buckets.add('chile');
    if (/botswana|tanzania|namibia|south africa|cape town|maasai|himba|africa/.test(hay) || (isDrought && /south africa/.test(country))) buckets.add('africa');
    if (/kiribati|tuvalu|marshall|pacific|tarawa|funafuti|majuro/.test(hay)) buckets.add('pacific');
    if (/arizona/.test(region) || /drought-(phoenix|tucson|yuma|prescott)/.test(id)) buckets.add('arizona');
    if (/california/.test(region) || /drought-(los-angeles|san-diego|inland-empire|bakersfield|fresno|palm-springs)/.test(id)) buckets.add('california');
    if (/new zealand|māori|maori|ruatoki|havelock/.test(hay)) buckets.add('nz');
    if (/greenland/.test(hay)) buckets.add('greenland');
    buckets.add('global');

    function funderBuckets(f) {
      const geos = f.geographies || [];
      const out = new Set();
      geos.forEach(function (g) {
        const x = String(g).toLowerCase();
        if (x === 'global') out.add('global');
        if (x === 'can' || x === 'canada' || x === 'fn') out.add('canada');
        if (x === 'us' || x === 'usa' || x === 'tribal') out.add('usa');
        if (x === 'navajo') out.add('navajo');
        if (x === 'alaska') out.add('alaska');
        if (x === 'au' || x === 'australia' || x === 'aboriginal') out.add('australia');
        if (x === 'nt' || x === 'northern territory') out.add('australia-nt');
        if (x === 'wa' || x === 'western australia') out.add('australia-wa');
        if (x === 'br' || x === 'brazil' || x === 'amazon' || x === 'yanomami') out.add('brazil');
        if (x === 'pe' || x === 'peru') out.add('peru');
        if (x === 'bo' || x === 'bolivia') out.add('bolivia');
        if (x === 'mx' || x === 'mexico') out.add('mexico');
        if (x === 'cl' || x === 'chile') out.add('chile');
        if (x === 'latam') { out.add('brazil'); out.add('peru'); out.add('bolivia'); out.add('mexico'); out.add('chile'); }
        if (x === 'africa' || x === 'za' || x === 'south africa' || x === 'bw' || x === 'botswana' || x === 'tz' || x === 'tanzania' || x === 'na' || x === 'namibia') out.add('africa');
        if (x === 'pacific') out.add('pacific');
        if (x === 'az' || x === 'arizona') out.add('arizona');
        if (x === 'ca' || x === 'california') out.add('california');
        if (x === 'mb' || x === 'on' || x === 'sk' || x === 'ab' || x === 'bc' || x === 'qc' || x === 'nb' || x === 'nl') out.add('prov:' + x.toUpperCase());
      });
      return out;
    }

    const themeWant = new Set();
    if (isIndigenous) { themeWant.add('indigenous'); themeWant.add('need'); themeWant.add('water'); themeWant.add('wash'); themeWant.add('infrastructure'); }
    if (isDrought) { themeWant.add('drought'); themeWant.add('commercial'); themeWant.add('municipal'); themeWant.add('climate'); themeWant.add('procurement'); themeWant.add('energy'); }
    if (isWorld || isFn) { themeWant.add('need'); themeWant.add('water'); themeWant.add('infrastructure'); themeWant.add('wash'); }
    if (/climate|drought|arid|adaptation/.test(hay)) themeWant.add('climate');

    const PARENT = { usa: 1, canada: 1, australia: 1, global: 1, 'usa-drought': 1 };
    const scored = list.map(function (f) {
      const fb = funderBuckets(f);
      const themes = f.themes || [];
      const fbList = [];
      fb.forEach(function (b) { fbList.push(b); });
      // Province tags alone should not force province-exact match for national Canada orgs
      const specifics = fbList.filter(function (b) {
        return !PARENT[b] && b.indexOf('prov:') !== 0;
      });
      let geoHits = 0;
      let parentHit = false;
      let specificHit = false;
      fbList.forEach(function (b) {
        if (b === 'global') return;
        if (!buckets.has(b)) return;
        geoHits += 1;
        if (PARENT[b]) parentHit = true;
        else specificHit = true;
      });
      // If funder has specific regions (navajo, arizona, brazil…), require a specific hit —
      // parent-only (usa/canada/australia) is not enough for Navajo-only or CA-board orgs.
      let localHit = specifics.length ? specificHit : parentHit;
      // Navajo-only / DigDeep-style orgs: if their ONLY tribal specifics are navajo (+states),
      // require navajo. Multi-region agencies (IHS with alaska+navajo) keep specificHit.
      if (fb.has('navajo') && !buckets.has('navajo')) {
        const tribalSpecs = specifics.filter(function (b) {
          return b === 'navajo' || b === 'alaska' || b === 'arizona' || b === 'california';
        });
        const onlyNavajo = tribalSpecs.length > 0 && tribalSpecs.every(function (b) {
          return b === 'navajo' || b === 'arizona' || b === 'california'; // AZ/NM states ride with Navajo-Gallup
        });
        if (onlyNavajo) localHit = false;
      }

      const isGlobalOnly = fb.size === 1 && fb.has('global');
      const hasGlobal = fb.has('global');

      if (!localHit && !hasGlobal && !isGlobalOnly) return null;
      if (!localHit && !isGlobalOnly) {
        // multi-region + global tag → allow as soft global for world/drought only
        if (!(hasGlobal && (isWorld || isDrought))) return null;
      }
      if (!localHit && !hasGlobal) return null;

      let score = 0;
      if (localHit) score += 20 + geoHits * 6;
      if (specificHit) score += 10;
      if (isGlobalOnly || (!localHit && hasGlobal)) score += 3;

      for (let ti = 0; ti < themes.length; ti++) {
        if (themeWant.has(themes[ti])) score += 4;
      }
      if (isDrought && (f.kind === 'commercial' || themes.indexOf('commercial') >= 0 || themes.indexOf('procurement') >= 0 || themes.indexOf('drought') >= 0 || themes.indexOf('municipal') >= 0)) score += 12;
      if (isIndigenous && themes.indexOf('indigenous') >= 0 && localHit) score += 14;
      if (isFn && fb.has('canada')) score += 12;
      if (buckets.has('navajo') && fb.has('navajo')) score += 16;
      if (buckets.has('alaska') && fb.has('alaska')) score += 16;
      if (isDrought && themes.indexOf('indigenous') >= 0 && !isIndigenous) score -= 20;
      if (isDrought && f.kind === 'ngo' && themes.indexOf('wash') >= 0 && !isIndigenous) score -= 8;
      if (!isDrought && f.id === 'muni-procurement') score -= 10;
      if (isGlobalOnly) score -= 2;
      if (themes.indexOf('indigenous') >= 0 && !localHit) score -= 30;
      // Soft-global (no local hit): keep score low so they only fill slots
      if (!localHit && hasGlobal) score = Math.min(score, 8);
      return { f: f, score: score, localHit: localHit };
    }).filter(function (x) { return x && x.score > 0; });

    scored.sort(function (a, b) {
      if (b.localHit !== a.localHit) return a.localHit ? -1 : 1;
      return b.score - a.score;
    });
    const out = [];
    const seen = {};
    for (let i = 0; i < scored.length && out.length < 5; i++) {
      const f = scored[i].f;
      if (seen[f.id]) continue;
      // For drought commercial markets, skip Indigenous / tribal-need agencies
      if (isDrought && !isIndigenous) {
        const th = f.themes || [];
        const blob = String(f.name || '') + ' ' + String(f.note || '');
        if (th.indexOf('indigenous') >= 0 || /tribal|first nations|navajo water/i.test(blob)) {
          if (th.indexOf('commercial') < 0 && th.indexOf('drought') < 0 && th.indexOf('procurement') < 0) {
            continue;
          }
        }
      }
      seen[f.id] = true;
      out.push(f);
    }
    if (out.length < 2) {
      list.filter(function (f) {
        const fb = funderBuckets(f);
        return fb.size === 1 && fb.has('global');
      }).slice(0, 3).forEach(function (f) {
        if (out.length < 3 && !seen[f.id]) { seen[f.id] = true; out.push(f); }
      });
    }
    return out.slice(0, 5);
  }

  function socioCellsHtml(socio) {
    const pop = escapeHtml(socio.populationLabel || '—');
    const inc = escapeHtml(socio.incomeLabel || '—');
    return '<div class="tc-cell"><div class="k">Population</div><div class="v">' + pop + '</div></div>' +
      '<div class="tc-cell"><div class="k">Income</div><div class="v">' + inc + '</div></div>';
  }

  function fundersSectionHtml(funders) {
    if (!funders || !funders.length) return '';
    const items = funders.map(function (f) {
      const name = escapeHtml(f.name);
      const note = f.note ? '<span class="funder-note">' + escapeHtml(f.note) + '</span>' : '';
      const link = f.url
        ? ('<a href="' + escapeHtml(f.url) + '" target="_blank" rel="noopener">' + name + '</a>')
        : name;
      return '<li>' + link + note + '</li>';
    }).join('');
    return '<div class="funders-block">' +
      '<div class="funders-title">Who can fund this area</div>' +
      '<ul class="funders-list">' + items + '</ul>' +
      '</div>';
  }

  function socioHonestyHtml() {
    return '<div class="socio-honesty">Population/income are estimates or regional proxies — not a credit check. Funders listed are starting points, not commitments.</div>';
  }


  function sitePermalink(id) {
    let base;
    if (/donnyjm\.github\.io/i.test(location.hostname)) {
      base = 'https://donnyjm.github.io/dewfall-globe/';
    } else {
      base = window.parent !== window ? window.parent.location.origin + window.parent.location.pathname : location.origin + location.pathname;
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
      if (window.parent !== window) { const outer=new URL(window.parent.location.href); if(id) outer.searchParams.set('site',id); else outer.searchParams.delete('site'); window.parent.history.replaceState(null,'',outer.pathname+outer.search); }
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
    if (CITIES.some(x => x.id === c.id)) return [
      'DEWFALL climate card — ' + c.name,
      c.region || '',
      'Modeled yield (' + state.season + '): ' + y.yieldLo + '–' + y.yieldHi + ' L/day',
      'Climate: ' + y.T + '°C / ' + y.RH + '% RH; dew point ' + y.Tdp + '°C',
      '400 W cooling scenario; range varies cooling 300–500 W. Not a confidence interval or measured production.',
      'Climate bin, not live weather. Sorption/TEC production is not credited.',
      sitePermalink(c.id)
    ].join('\n');
    const sol = c.solar || solarForEntity(c);
    const srcUrl = c.sourceUrl ? (' ' + c.sourceUrl) : '';
    const untapped = sol && sol.untappedKWhYear != null ? formatKWh(sol.untappedKWhYear) : '—';
    if (c.kind === 'drought' || (c.id && String(c.id).indexOf('drought-') === 0)) {
      const fit = c.fit || commercialFitFor(c);
      const src = c.source || (getDroughtMeta().sourceLabel || 'drought markets');
      const socioD = socioFor(c);
      const fundersD = fundersForSite(c);
      const fundersLineD = fundersD.length
        ? ('Funders (starting points): ' + fundersD.map(function (f) { return f.name; }).join('; '))
        : null;
      return [
        'DEWFALL market card — ' + (c.name || 'market'),
        siteXmlocation(c),
        'MARKET · drought / arid demand (commercial beachhead)',
        'Tier ' + (c.tier || '?') + ' · ' + (c.drought || 'arid') + ' · ' + (c.why || ''),
        'Population: ' + (socioD.populationLabel || '—'),
        'Income: ' + (socioD.incomeLabel || '—') + (socioD.incomeNote ? ' (' + socioD.incomeNote + ')' : ''),
        'Commercial fit: ' + fit.score + ' · ' + fit.label,
        'Modeled yield (' + state.season + '): ' + y.yieldLo + '–' + y.yieldHi + ' L/day (model estimate)',
        'Solar untapped (TEC branch): ' + untapped + ' model',
        fundersLineD,
        'Source: ' + src + srcUrl,
        'Map: ' + sitePermalink(c.id),
        '— Mekilok / DEWFALL · buy market, not advisory-need · pop/income proxies · funders are starting points'
      ].filter(Boolean).join('\n');
    }
    const fit = c.fit || fitScoreFor(c);
    const issue = c.issue || advisoryLabel(c.advisoryTypeRaw || c.advisoryType) || 'documented water access gap';
    const src = c.source || (c.world ? (getWorldMeta().sourceLabel || 'curated list') : (FN_META.sourceLabel || 'ISC / FNHA'));
    const socioN = socioFor(c);
    const fundersN = fundersForSite(c);
    const fundersLineN = fundersN.length
      ? ('Funders (starting points): ' + fundersN.map(function (f) { return f.name; }).join('; '))
      : null;
    return [
      'DEWFALL site card — ' + (c.name || 'site'),
      siteXmlocation(c),
      'Need: ' + issue,
      'Population: ' + (socioN.populationLabel || '—'),
      'Income: ' + (socioN.incomeLabel || '—') + (socioN.incomeNote ? ' (' + socioN.incomeNote + ')' : ''),
      'Fit: ' + fit.score + ' · ' + fit.label,
      'Modeled yield (' + state.season + '): ' + y.yieldLo + '–' + y.yieldHi + ' L/day (model estimate)',
      'Solar untapped (TEC branch): ' + untapped + ' model',
      fundersLineN,
      'Source: ' + src + srcUrl,
      'Map: ' + sitePermalink(c.id),
      '— Mekilok / DEWFALL · model estimates only; pop/income proxies; funders are starting points'
    ].filter(Boolean).join('\n');
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
        if (fallbackCopy(text)) done(); else if(btn) btn.textContent='Copy unavailable';
      });
    } else {
      if (fallbackCopy(text)) done();
      else if (btn) btn.textContent = 'Copy unavailable';
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
      const copied = document.execCommand('copy');
      document.body.removeChild(ta);
      return copied;
    } catch (e) {
      console.warn('[DEWFALL] copy failed', e);
      return false;
    }
  }

  function shareRowHtml() {
    return '<div class="share-row">' +
      '<button type="button" class="share-btn" data-share="link">Copy link</button>' +
      '<button type="button" class="share-btn" data-share="text">Copy card</button>' +
      '<button type="button" class="share-btn" data-share="png">Save PNG</button>' +
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
        else if (mode === 'png' && window.exportDewfallCard) window.exportDewfallCard(c, btn);
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
    if (COUNTRY_WATER.some(c=>c.id===site)) { focusCountry(site); return true; }
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
        term: w.term || 'reported',
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
    if (tooltipEl && tooltipEl.classList.contains('visible')) {
      const group = state.selectedKind === 'country' ? COUNTRY_WATER : state.selectedKind === 'city' ? enriched : state.selectedKind === 'fn' ? enrichedFn : state.selectedKind === 'world' ? enrichedWorld : enrichedDrought;
      const current = group.find(c => c.id === state.selectedId);
      const render = {country:showCountryTooltip,city:showCityTooltip,fn:showFnTooltip,world:showWorldTooltip,drought:showDroughtTooltip}[state.selectedKind];
      if (current && render) render(current);
    }
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
    setText('#stat-peak-lbl', 'Peak model / day');
    setText('#stat-avg-lbl', 'Mean model / day');
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

    $('#world-cause-filter').hidden = state.rankMode !== 'world';
    if (state.rankMode === 'countries') {
      title.textContent = 'Worldwide water access';
      sub.textContent = '217 countries / economies · national estimates, not local advisories';
      const rows=COUNTRY_WATER.slice().sort((a,b)=>(a.basic?a.basic.percent:101)-(b.basic?b.basic.percent:101));
      list.innerHTML=rows.map((c,i)=>'<div class="rank-item" data-id="'+c.id+'" data-kind="country"><div class="num">'+(i+1)+'</div><div><div class="city-name">'+escapeHtml(c.name)+'</div><div class="city-meta">National · '+(c.basic?c.basic.year:'no data')+'</div></div><div class="yld">'+(c.basic?escapeHtml(formatGap(c.basic.percent)):'—')+'<span>without basic water</span></div></div>').join('');
    } else if (state.rankMode === 'markets') {
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
      if (title) title.textContent = 'World water need';
      if (sub) sub.textContent = 'Dated reports · not live advisories · '+enrichedWorld.length+' records';
      const rows = filteredWorld().slice().sort((a, b) => (b.year||0)-(a.year||0) || b.needSignal-a.needSignal);
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
      if (title) title.textContent = 'Highest modeled yield';
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
        if (el.dataset.kind === 'country') focusCountry(el.dataset.id);
        else if (el.dataset.kind === 'fn') focusFn(el.dataset.id);
        else if (el.dataset.kind === 'world') focusWorld(el.dataset.id);
        else if (el.dataset.kind === 'drought') focusDrought(el.dataset.id);
        else focusCity(el.dataset.id);
      });
    });
  }

  function formatGap(percent) {
    const gap=Math.max(0,100-percent);
    return gap>0 && gap<0.1 ? '<0.1%' : gap.toFixed(1)+'%';
  }

  function showCountryTooltip(c, ev) {
    tooltipEl.classList.remove('reserve-card','need-card','world-card','drought-card');
    function cell(label,record){return '<div class="tc-cell span2"><div class="k">'+label+'</div><div class="v big">'+(record?escapeHtml(formatGap(record.percent)):'No data')+'</div><div class="sub">'+(record?'National estimate · '+record.year:'No published value in the imported 2020–2025 series')+'</div></div>';}
    setTooltipHtml('<div class="tc-head"><div class="need-kicker">COUNTRY CONTEXT · WHO / UNICEF JMP</div><h3>'+escapeHtml(c.name)+'</h3><div class="sub">'+escapeHtml(c.region)+'</div></div><div class="tc-grid">'+cell('Population without at least basic drinking water',c.basic)+cell('Population without safely managed drinking water',c.safe)+'</div><div class="tc-body"><p>These are national service estimates. They do not show which households lack water, and do not establish a local shortage, conflict or drinking-water advisory.</p><p><strong>Basic:</strong> improved source within a 30-minute round trip. <strong>Safely managed:</strong> improved source on premises, available when needed and free from priority contamination. These measures overlap; do not add them.</p><p>'+escapeHtml(c.markerLocation?'Map reference: '+c.markerLocation+' (World Bank country metadata). This is not a crisis pin for that city.':'No map reference supplied; this country remains available in the list and search.')+'</p><p>No site yield or fit is calculated from national water-access statistics.</p><div class="est-tag">Source: '+escapeHtml(c.source)+' · imported 2026-09-04.<br><a target="_blank" rel="noopener" href="'+escapeHtml(c.sourceUrl)+'">Basic-water source ↗</a> · <a target="_blank" rel="noopener" href="'+escapeHtml(c.safeSourceUrl)+'">Safely-managed source ↗</a> · <a target="_blank" href="data/global-water-sources.html">Coverage and source register ↗</a></div><div class="share-row"><button id="country-copy" type="button">Copy link</button></div></div>');
    document.getElementById('country-copy').onclick=function(){copyText(sitePermalink(c.id),this);};
    pinTooltip(ev || {clientX:innerWidth/2,clientY:innerHeight/3});
  }

  function focusCountry(id) {
    const c=COUNTRY_WATER.find(c=>c.id===id);
    if(!c||!globe)return;
    closeSheets();state.selectedId=id;state.selectedKind='country';setSiteParam(id);
    state.layers.countries=true;$('#layer-countries').checked=true;
    state.autoRotate=false;globe.controls().autoRotate=false;$('#layer-rotate').checked=false;
    updateRankList();applyLayers();
    if(Number.isFinite(c.lat)&&Number.isFinite(c.lng))globe.pointOfView({lat:c.lat,lng:c.lng,altitude:1.7},1200);
    showCountryTooltip(c);
  }

  function makeCountryPin(c) {
    const el=document.createElement('button');el.type='button';el.className='country-pin';
    el.setAttribute('aria-label',c.name+' — national water-access context');
    const gap=c.basic?100-c.basic.percent:null;
    el.style.setProperty('--country-colour',gap===null?'#8292a4':gap>=25?'#e1a4ff':gap>=5?'#ba9ae9':'#8a91bd');
    el.innerHTML='<span class="country-dot"></span><span class="country-name">'+escapeHtml(c.name)+' · national context</span>';
    el.onclick=function(e){e.stopPropagation();focusCountry(c.id);};
    return el;
  }

  function focusCity(id) {
    const c = enriched.find((x) => x.id === id);
    if (!c || !globe) return;
    state.selectedId = id;
    state.selectedKind = 'city';
    setSiteParam(id);
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
      if(state.selectedId !== id) return;
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
    const alt = /region|state|province|governorate/.test(c.scope || '') ? 1.1 : (IS_MOBILE ? 0.45 : 0.55);
    globe.pointOfView({ lat: c.lat, lng: c.lng, altitude: alt }, 1400);
    setTimeout(function () {
      if(state.selectedId !== id) return;
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
      if(state.selectedId !== id) return;
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

  function filteredWorld() { return enrichedWorld.filter(c => state.worldCause === 'all' || (state.worldCause === 'community' ? !c.cause : c.cause === state.worldCause)); }
  function visibleWorld() {
    if (!state.layers.world) return [];
    if (state.filter === 'highfit') return filteredWorld().filter(passesHighFit);
    return filteredWorld();
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
    // Keep every reserve available at every zoom level.
    const showReservesNow = true;

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

      reserves.forEach((r) => {
        if (r.hasLtdwa && state.layers.ltdwa) return;


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
      // Individual meshes preserve interaction for every reserve.
      const mergePts = false;
      globe
        .onGlobeClick((coords, ev) => { if (IS_MOBILE) pickNearbyReserves(coords, ev); })
        .pointsData(pts)
        .pointLat('lat')
        .pointLng('lng')
        .pointAltitude((d) => {
          if (d.kind === 'need-beacon') return 0.28;
          if (d.kind === 'world-need') return 0.045;
          if (d.kind === 'reserve') return 0.0025;
          // Keep relative yield differences with a quieter, shorter silhouette.
          return 0.005 + (d.yield.yieldMid / maxY) * 0.11;
        })
        .pointRadius((d) => {
          if (d.kind === 'need-beacon') return 0.55;
          if (d.kind === 'world-need') return 0.42;
          if (d.kind === 'reserve') {
            const dens = (d.density != null ? d.density : (d._res && d._res.density)) || 0;
            return reserveR * (1 + Math.min(0.35, dens / 140));
          }
          return 0.17 + (d.yield.yieldMid / maxY) * 0.33;
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
        .pointLabel(pointHoverLabel)
        .onPointHover(onPointHover)
        .onPointClick((d, ev) => {
          if (!d) return;
          if (d.kind === 'need-beacon' && d._fn) focusFn(d._fn.id);
          else if (d.kind === 'need-beacon' && d._world) focusWorld(d._world.id);
          else if (d.kind === 'need-beacon' && d._drought) focusDrought(d._drought.id);
          else if (d.kind === 'world-need' && d._world) focusWorld(d._world.id);
          else if (d.kind === 'world-need') focusWorld(d.id);
          else if (d.kind === 'reserve' || d._res) {
            if (!IS_MOBILE || !pickNearbyReserves(d, ev)) focusReserve(d.id || (d._res && d._res.id));
          }
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

    if (state.layers.countries) COUNTRY_WATER.filter(c=>Number.isFinite(c.lat)&&Number.isFinite(c.lng)).forEach(c=>htmlItems.push({kind:'country',lat:c.lat,lng:c.lng,city:c}));

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
          if (d.kind === 'country') return makeCountryPin(d.city);
          if (d.kind === 'world') return makeWorldPin(d.city);
          if (d.kind === 'drought') return makeDroughtPin(d.city);
          return makeFnPin(d.city);
        });
    } else {
      globe.htmlElementsData([]);
    }

    // Location names appear on hover, not as permanent globe labels.
    globe.labelsData([]);
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
        escapeHtml(c.name) + fitBit + '</span>';
    } else {
      el.innerHTML = '<span class="fn-pin-dot"></span><span class="fn-pin-label">' + escapeHtml(c.name) + '</span>';
    }
    if (!IS_MOBILE) {
      el.addEventListener('mouseenter', (ev) => {
        document.body.style.cursor = 'pointer';
        bumpIdle();
      });
      el.addEventListener('mouseleave', () => {
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
    el.className = 'fn-pin world emphasis named' + (isShort ? ' short' : '') + (isDnc ? ' dnc' : ' bwa') +
      (isSelected ? ' selected' : '');
    el.title = '';
    if (isSelected) {
      const fitBit = (c.fit && c.fit.score != null) ? (' · ' + c.fit.score) : '';
      el.innerHTML = '<span class="fn-pin-beacon"></span><span class="fn-pin-dot"></span><span class="fn-pin-label fn-pin-label-selected">' +
        escapeHtml(c.name) + fitBit + '</span>';
    } else {
      el.innerHTML = '<span class="fn-pin-dot"></span><span class="fn-pin-label fn-pin-label-always">' +
        escapeHtml(c.name) + '</span>';
    }
    if (!IS_MOBILE) {
      el.addEventListener('mouseenter', (ev) => {
        document.body.style.cursor = 'pointer';
        bumpIdle();
      });
      el.addEventListener('mouseleave', () => {
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
    el.className = 'drought-pin named tier-' + tier + (isSelected ? ' selected' : '');
    el.title = '';
    if (isSelected) {
      const fitBit = (c.fit && c.fit.score != null) ? (' · ' + c.fit.score) : '';
      el.innerHTML = '<span class="drought-pin-beacon"></span><span class="drought-pin-diamond"></span><span class="drought-pin-label drought-pin-label-selected">' +
        escapeHtml(c.name) + fitBit + '</span>';
    } else {
      el.innerHTML = '<span class="drought-pin-diamond"></span><span class="drought-pin-label drought-pin-label-always">' +
        escapeHtml(c.name) + '</span>';
    }
    if (!IS_MOBILE) {
      el.addEventListener('mouseenter', (ev) => {
        document.body.style.cursor = 'pointer';
        bumpIdle();
      });
      el.addEventListener('mouseleave', () => {
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

  function pickNearbyReserves(coords, ev) {
    if (!state.layers.reserves || !ev || !Number.isFinite(ev.clientX)) return false;
    const rect = document.getElementById('globeViz').getBoundingClientRect();
    const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
    const nearby = visibleReserves().filter(r => !(r.hasLtdwa && state.layers.ltdwa))
      .filter(r => Math.abs(r.lat - coords.lat) < 25 && Math.abs(((r.lng - coords.lng + 540) % 360) - 180) < 60)
      .map(r => { const p = globe.getScreenCoords(r.lat, r.lng, 0.0025); return {r, distance:Math.hypot(p.x-x,p.y-y)}; })
      .filter(p => p.distance <= 28).sort((a,b) => a.distance-b.distance);
    if (!nearby.length) return false;
    if (nearby.length === 1) { focusReserve(nearby[0].r.id); return true; }
    globe.controls().autoRotate = false;
    setTooltipHtml('<div class="tc-head"><h3>Choose a community</h3><div class="sub">' + nearby.length +
      ' locations near your tap</div></div><div class="reserve-tap-options">' + nearby.map(({r}) =>
      '<button type="button" data-reserve-choice="' + escapeHtml(r.id) + '">' + escapeHtml(r.name) +
      '<small>' + escapeHtml(r.province || '') + '</small></button>').join('') + '</div>');
    tooltipContentEl().querySelectorAll('[data-reserve-choice]').forEach(button => {
      button.onclick = () => focusReserve(button.dataset.reserveChoice);
    });
    pinTooltip(ev);
    return true;
  }

  function pointHoverLabel(d) {
    if (!d || d.kind !== 'reserve') return '';
    const reserve = d._res || d;
    return '<span class="reserve-hover-name">' + escapeHtml(reserve.name || '') +
      (reserve.province ? ' · ' + escapeHtml(reserve.province) : '') + '</span>';
  }

  function onPointHover(d) { document.body.style.cursor = d ? 'pointer' : 'default'; }

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
          '<span>TEC/sorbent: <strong>not credited</strong></span>' +
          '<span>Solar factor: <strong>' + y.solar + '</strong></span>' +
        '</div>' +
        '<div class="est-tag">MODEL ESTIMATE \u2014 not measured. Machine incomplete. Climate normals \u00b7 ' + escapeHtml(state.season) + ' season bin. Irradiance model \u2014 not a site energy assessment.</div>' +
      shareRowHtml() + '</div>');
    wireShareButtons(c);
    pinTooltip(ev);
  }

  function showReserveTooltip(r, ev) {
    tooltipEl.classList.remove('need-card', 'world-card', 'drought-card');
    tooltipEl.classList.add('reserve-card');
    // names/info only via hover tooltip / mobile sheet
    const ltdwa = r.hasLtdwa && r.ltdwaId ? fnById[r.ltdwaId] : null;
    const badge = ltdwa
      ? '<span class="badge ltdwa-link">Matched in the dated need dataset</span>'
      : '<span class="badge reserve-badge">No match in this dated need dataset</span>';
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
          : '<div class="why">Indian Reserve / FN land centroid. No match in the supplied dated water-need dataset. This does not establish current advisory status; private wells and territorial systems may be outside its coverage.</div>') +
        '<div class="fit">Nearby reserve density: <strong>' + (r.density != null ? r.density : '—') + '</strong> other reserves within 75 km (cluster proxy — not census population).</div>' +
        '<div class="est-tag">Source: NRCan Aboriginal Lands of Canada Legislative Boundaries. Pin = polygon centroid (largest part). Attribution: NRCan + ISC LTDWA. Solar: offline GHI model \u2014 not a site energy assessment.</div>' +
      '</div>');
    pinTooltip(ev);
  }

  function showFnTooltip(c, ev, reserveCtx) {
    const y = c.yield;
    const fit = c.fit || fitScoreFor(c);
    if (!c.fit) c.fit = fit;
    const socio = socioFor(c);
    const funders = fundersForSite(c);
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
        socioCellsHtml(socio) +
        '<div class="tc-cell"><div class="k">Homes (advisory)</div><div class="v">' + escapeHtml(homes) + '</div></div>' +
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
        fundersSectionHtml(funders) +
        socioHonestyHtml() +
        solarTooltipBlock(c.solar || solarForEntity(c), y.solar) +
        '<div class="tc-breakdown">' +
          '<span>Fridge: <strong>' + y.fridge + ' L</strong></span>' +
          '<span>TEC/sorbent: <strong>not credited</strong></span>' +
          '<span>Need signal: <strong>' + Math.round(c.needSignal) + '</strong></span>' +
        '</div>' +
        '<div class="est-tag">' +
          'Source: ' + escapeHtml(c.source || FN_META.sourceLabel || 'ISC / FNHA') + '. ' +
          'List changes. Includes ISC long-term + short-term (south of 60 excl. BC) and FNHA BC advisories. ' +
          'Not all private wells or territorial systems. Reserve geometry: NRCan ALC. Model estimate · ' + escapeHtml(state.season) + ' bin. Solar irradiance model — not a site energy assessment.' +
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
    const socio = socioFor(c);
    const funders = c.cause ? [] : fundersForSite(c);
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
        '<div class="need-kicker">WORLD WATER NEED · DOCUMENTED SNAPSHOT</div>' +
        '<h3 style="font-size:1.3rem;line-height:1.25;margin:6px 0 8px;color:#fff;">' + escapeHtml(c.name) + '</h3>' +
        '<div class="sub">' + region + '</div>' +
        '<div class="evidence-context">Source period: '+escapeHtml(c.evidenceDate || c.year || 'not recorded')+' · '+escapeHtml(c.scope || 'community / site')+'<br>Current local status is not verified. '+escapeHtml(c.coordinateNote || 'Approximate place reference.')+'</div>' +
        '<span class="badge world-badge">World</span> ' +
        '<span class="badge long-badge">' + term + '</span>' +
      '</div>' +
      '<div class="tc-grid">' +
        fitScoreCellHtml(fit) +
        socioCellsHtml(socio) +
        '<div class="tc-cell"><div class="k">People / group</div><div class="v">' + people + '</div></div>' +
        '<div class="tc-cell"><div class="k">Issue</div><div class="v">' + issue + '</div></div>' +
        '<div class="tc-cell span2"><div class="k">Estimated yield · rough latitude climate proxy</div><div class="v big need-yield">' +
          y.yieldLo + ' – ' + y.yieldHi + ' L/day <span class="model-only">(model · climate proxy)</span></div></div>' +
        '<div class="tc-cell"><div class="k">Dry-bulb / RH</div><div class="v">' + y.T + ' °C · ' + y.RH + '%</div></div>' +
        '<div class="tc-cell"><div class="k">Dew point</div><div class="v">' + y.Tdp + ' °C</div></div>' +
      '</div>' +
      '<div class="tc-body">' +
        '<div class="fit-blurb">' + escapeHtml(fit.blurb) + '</div>' +
        (c.note ? '<div class="fit">' + escapeHtml(c.note) + '</div>' : '') +
        fundersSectionHtml(funders) +
        socioHonestyHtml() +
        '<div class="why cold-caveat">Climate inputs are lat-band stubs (not weather-station normals). Yield is a model estimate only — this pin marks documented water NEED.</div>' +
        '<div class="tc-breakdown">' +
          '<span>Fridge: <strong>' + y.fridge + ' L</strong></span>' +
          '<span>TEC/sorbent: <strong>not credited</strong></span>' +
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
    const socio = socioFor(c);
    const funders = fundersForSite(c);
    const region = [c.country, c.region].filter(Boolean).map(escapeHtml).join(' · ');
    const srcHtml = c.sourceUrl
      ? ('<a href="' + escapeHtml(c.sourceUrl) + '" target="_blank" rel="noopener">' + escapeHtml(c.source || 'source') + '</a>')
      : escapeHtml(c.source || getDroughtMeta().sourceLabel || 'drought markets');
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
        socioCellsHtml(socio) +
        '<div class="tc-cell"><div class="k">Modeled climate suitability</div><div class="v">' + escapeHtml(y.scoreLabel) + '</div></div>' +
        '<div class="tc-cell"><div class="k">Market note</div><div class="v">' + escapeHtml(c.populationNote || 'metro') + '</div></div>' +
        '<div class="tc-cell span2"><div class="k">Estimated yield · rough latitude climate proxy</div><div class="v big need-yield">' +
          y.yieldLo + ' – ' + y.yieldHi + ' L/day <span class="model-only">(model · climate proxy)</span></div></div>' +
        '<div class="tc-cell"><div class="k">Dry-bulb / RH</div><div class="v">' + y.T + ' °C · ' + y.RH + '%</div></div>' +
        '<div class="tc-cell"><div class="k">Dew point</div><div class="v">' + y.Tdp + ' °C</div></div>' +
      '</div>' +
      '<div class="tc-body">' +
        '<div class="fit-blurb">' + escapeHtml(c.why || fit.blurb) + '</div>' +
        '<div class="why cold-caveat">This is a buy market, not an advisory-need pin. Teal diamonds mark commercial drought / arid demand — distinct from amber Indigenous / BWA need sites.</div>' +
        fundersSectionHtml(funders) +
        socioHonestyHtml() +
        solarTooltipBlock(c.solar || solarForEntity(c), y.solar) +
        '<div class="tc-breakdown">' +
          '<span>Fridge: <strong>' + y.fridge + ' L</strong></span>' +
          '<span>TEC/sorbent: <strong>not credited</strong></span>' +
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
    const selected = enriched.concat(enrichedFn,enrichedWorld,enrichedDrought).find(c => c.id === state.selectedId);
    const root = tooltipContentEl();
    if (selected && selected.climate && !root.querySelector('.season-comparison')) {
      const section = document.createElement('section');
      section.className = 'season-comparison';
      section.setAttribute('aria-label','Seasonal yield comparison');
      section.innerHTML = '<h4>Across the seasons <span>modeled L/day</span></h4><div class="season-cells">' +
        ['annual','summer','winter'].map(season => {
          const y = Y.enrichCity(selected,season).yield;
          return '<div class="' + (state.season === season ? 'current' : '') + '"><span>' + season + '</span><strong>' + y.yieldMid.toFixed(1) + '</strong><small>' + y.T + '°C · ' + y.RH + '% RH</small></div>';
        }).join('') + '</div><p>Same 400 W cooling scenario. Source seasonal bins; approximate climate, not a forecast.</p>';
      const grid = root.querySelector('.tc-grid');
      if (grid) grid.insertAdjacentElement('afterend',section);
    }
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

    globe = Globe({ rendererConfig: { antialias: true, preserveDrawingBuffer: true } })(el)
      .globeImageUrl(earthDay)
      .bumpImageUrl(earthTopo)
      .backgroundImageUrl(sky)
      .showAtmosphere(true)
      .atmosphereColor("#6598dd")
      .atmosphereAltitude(0.035);

    // Low relief and restrained blue limb preserve the satellite texture.
    const material = globe.globeMaterial();
    material.bumpScale = 0.32;
    material.shininess = 9;
    material.specular.set('#192b3a');
    // The vendored globe.gl exposes scene(), but not the newer lights() API.
    // Retain its built-in lighting; the optional orbital shader controls its own light.
    const resize = () => {
      const mobileNow = detectMobile();
      if (mobileNow !== IS_MOBILE) {
        IS_MOBILE = mobileNow;
        document.body.classList.toggle('mobile-ui', IS_MOBILE);
        closeSheets();
        hideTooltip();
      }
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
    ctrl.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    state.autoRotate = ctrl.autoRotate;
    $('#layer-rotate').checked = ctrl.autoRotate;
    ctrl.autoRotateSpeed = IS_MOBILE ? 0.10 : 0.16;
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
    const startAlt = IS_MOBILE ? 1.85 : 1.65;
    globe.pointOfView({ lat: 26, lng: -90, altitude: startAlt }, 0);
    state.altitude = startAlt;
    state.closeZoom = false;
    if (IS_MOBILE) document.body.classList.remove('mobile-close-zoom');
    refresh();
    // Optional presentation controls must never stop the data explorer from opening.
    try {
      if (window.initObservatory) window.initObservatory({ globe, clear: () => { hideTooltip(); closeSheets(); }, season: () => state.season, permalink: sitePermalink, counts: {cities:CITIES.length,reserves:RESERVES.length,world:getWorldRaw().length,markets:getDroughtRaw().length} });
    } catch (error) { console.warn('[DEWFALL] Optional presentation unavailable', error); }
    globe.renderer().domElement.addEventListener('webglcontextlost', function (event) {
      event.preventDefault(); showBootError('GRAPHICS INTERRUPTED — RETRY TO RESTORE EARTH');
    });

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
