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

  const REMOTE_WEIGHT = {
    'remote-northern': 3.0,
    'remote': 2.2,
    'road-access': 1.3,
    'southern': 1.0,
  };

  const state = {
    season: 'annual',
    layers: {
      yield: true,
      humidity: true,
      dewpoint: false,
      reserves: true,
      otherFn: false,
      ltdwa: true,
      northern: false,
    },
    autoRotate: true,
    selectedId: null,
    selectedKind: null,
    rankMode: 'yield',
    idleTimer: null,
    closeZoom: false,
    altitude: 1.9,
  };

  let globe = null;
  let enriched = [];
  let enrichedFn = [];
  let fnById = {};
  let tooltipEl = null;
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
    FN.forEach((c) => { fnById[c.id] = c; });

    document.querySelectorAll('[data-season]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-season]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.season = btn.dataset.season;
        refresh();
      });
    });

    ['yield', 'humidity', 'dewpoint', 'reserves', 'ltdwa', 'northern'].forEach((key) => {
      const el = $('#layer-' + (key === 'reserves' ? 'reserves' : key));
      if (!el) return;
      el.checked = !!state.layers[key];
      el.addEventListener('change', () => {
        state.layers[key] = el.checked;
        if (key === 'ltdwa' || key === 'northern' || key === 'reserves') {
          updateLtdwaBanner();
          if (state.rankMode === 'need') updateRankList();
        }
        applyLayers();
      });
    });

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
      rot.checked = true;
      rot.addEventListener('change', () => {
        state.autoRotate = rot.checked;
        if (globe) globe.controls().autoRotate = state.autoRotate;
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

    updateLtdwaBanner();
  }

  function updateLtdwaBanner() {
    const el = $('#ltdwa-banner');
    if (!el) return;
    const title = $('#banner-title');
    const stats = $('#banner-stats');
    const note = $('#banner-note');
    const showRes = state.layers.reserves;
    const showNeed = state.layers.ltdwa;
    el.classList.toggle('dim', !showRes && !showNeed);
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
      note.textContent = showNeed
        ? ('Amber/red = long-term · Gold = short-term · BC via FNHA (' + bcN + ') · need ≠ high yield')
        : 'Silver = all IR (NRCan ALC) · need layer off';
    }
  }

  function refresh() {
    enriched = Y.enrichAll(CITIES, state.season);
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
      return e;
    });
    updateStats();
    updateRankList();
    updateLtdwaBanner();
    applyLayers();
  }

  function updateStats() {
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

    if (state.rankMode === 'need') {
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
        return '<div class="rank-item need-item' + north + dnc + shortCls + (state.selectedId === c.id ? ' active' : '') + '" data-id="' + c.id + '" data-kind="fn">' +
          '<div class="num">' + (i + 1) + '</div>' +
          '<div><div class="city-name">' + escapeHtml(c.name) + '</div>' +
          '<div class="city-meta">' + escapeHtml(c.province) + ' \u00b7 ' + escapeHtml(termLabel(c)) + ' \u00b7 ' + escapeHtml(advisoryLabel(c.advisoryTypeRaw || c.advisoryType)) +
          ' \u00b7 ' + escapeHtml(homes) + ' \u00b7 ' + escapeHtml(c.remoteness) + '</div></div>' +
          '<div class="yld need-yld">' +
            '<span class="need-score">' + Math.round(c.needSignal) + '</span>' +
            '<span>need \u00b7 ' + y.yieldLo + '\u2013' + y.yieldHi + ' L est.</span>' +
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
        if (el.dataset.kind === 'fn') focusFn(el.dataset.id);
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
    globe.pointOfView({ lat: c.lat, lng: c.lng, altitude: 1.8 }, 1200);
    showCityTooltip(c, { clientX: window.innerWidth / 2 + 40, clientY: window.innerHeight / 2 - 80 });
    bumpIdle();
  }

  function focusFn(id) {
    const c = enrichedFn.find((x) => x.id === id);
    if (!c || !globe) return;
    state.selectedId = id;
    state.selectedKind = 'fn';
    updateRankList();
    globe.pointOfView({ lat: c.lat, lng: c.lng, altitude: 1.55 }, 1200);
    const tipEv = { clientX: window.innerWidth / 2 + 40, clientY: window.innerHeight / 2 - 80 };
    showFloatingName(c.name, tipEv);
    showFnTooltip(c, tipEv);
    bumpIdle();
  }

  function focusReserve(id) {
    const r = RESERVES.find((x) => x.id === id);
    if (!r || !globe) return;
    state.selectedId = id;
    state.selectedKind = 'reserve';
    globe.pointOfView({ lat: r.lat, lng: r.lng, altitude: 0.55 }, 1400);
    if (r.hasLtdwa && r.ltdwaId && fnById[r.ltdwaId]) {
      const c = enrichedFn.find((x) => x.id === r.ltdwaId) || Y.enrichCity(fnById[r.ltdwaId], state.season);
      if (c && !c.needSignal) c.needSignal = needSignal(fnById[r.ltdwaId]);
      showFnTooltip(c, { clientX: window.innerWidth / 2 + 40, clientY: window.innerHeight / 2 - 80 }, r);
    } else {
      showReserveTooltip(r, { clientX: window.innerWidth / 2 + 40, clientY: window.innerHeight / 2 - 80 });
    }
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
    if (!state.layers.northern) return enrichedFn;
    return enrichedFn.filter((c) => c.remoteness === 'remote-northern' || c.highlightNorthern);
  }

  function applyLayers() {
    if (!globe) return;
    const maxY = Math.max.apply(null, enriched.map((c) => c.yield.yieldMid).concat([1]));
    const reserves = visibleReserves();
    // Always draw crisp individual reserve markers (no blurry hexbins).
    const useReservePts = state.layers.reserves && reserves.length > 0;

    // Yield pillars + sharp reserve pins at every zoom
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
    if (useReservePts) {
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

    if (pts.length) {
      const reserveR = state.altitude > 2.2 ? 0.045 : (state.altitude > 1.5 ? 0.055 : 0.07);
      globe
        .pointsData(pts)
        .pointLat('lat')
        .pointLng('lng')
        .pointAltitude((d) => {
          if (d.kind === 'reserve') return 0.0025;
          return 0.01 + (d.yield.yieldMid / maxY) * 0.22;
        })
        .pointRadius((d) => {
          if (d.kind === 'reserve') {
            const dens = (d.density != null ? d.density : (d._res && d._res.density)) || 0;
            return reserveR * (1 + Math.min(0.35, dens / 140));
          }
          return 0.28 + (d.yield.yieldMid / maxY) * 0.55;
        })
        .pointColor((d) => {
          if (d.kind === 'reserve') return reserveDensityColor(d);
          return Y.yieldColor(d.yield.yieldMid, maxY);
        })
        .pointsMerge(false)
        .pointLabel(() => '')
        .onPointHover(onPointHover)
        .onPointClick((d) => {
          if (!d) return;
          if (d.kind === 'reserve' || d._res) focusReserve(d.id || (d._res && d._res.id));
          else if (d.kind === 'city' || d._city) focusCity(d.id || (d._city && d._city.id));
        });
    } else {
      globe.pointsData([]);
    }

    // Hexbins removed — they read as blurry dots at country scale.
    globe.hexBinPointsData([]);

    // Humidity rings + northern LTDWA pulses
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
    if (state.layers.ltdwa) {
      visibleFn().forEach((c) => {
        const isNorth = c.remoteness === 'remote-northern' || c.highlightNorthern;
        const isSouth = c.remoteness === 'southern' || c.remoteness === 'road-access';
        mist.push({
          lat: c.lat,
          lng: c.lng,
          maxR: isNorth ? 2.8 : (isSouth ? 2.4 : 2.2),
          propagationSpeed: 0.55,
          repeatPeriod: isNorth ? 900 : 1200,
          color: function () {
            if (c.advisoryType === 'DNC' || c.advisoryType === 'DNU') return 'rgba(224, 72, 56, 0.42)';
            if (c.term === 'short') return 'rgba(255, 200, 64, 0.38)';
            return isNorth ? 'rgba(255, 90, 50, 0.42)' : 'rgba(255, 160, 40, 0.4)';
          },
        });
      });
    }
    globe.ringsData(mist)
      .ringLat('lat').ringLng('lng')
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatPeriod')
      .ringColor('color');

    // HTML: dewpoint labels + LTDWA need pins (always on top, larger)
    const htmlItems = [];
    if (state.layers.dewpoint && enriched.length) {
      enriched.forEach((c) => {
        htmlItems.push({ kind: 'dp', lat: c.lat, lng: c.lng, city: c });
      });
    }
    if (state.layers.ltdwa) {
      visibleFn().forEach((c) => {
        htmlItems.push({ kind: 'fn', lat: c.lat, lng: c.lng, city: c });
      });
    }

    if (htmlItems.length) {
      globe.htmlElementsData(htmlItems)
        .htmlLat('lat').htmlLng('lng').htmlAltitude(0.018)
        .htmlElement((d) => {
          if (d.kind === 'dp') {
            const el = document.createElement('div');
            el.style.cssText = 'color:#c8e8f0;font:600 10px/1 sans-serif;background:rgba(8,20,36,0.75);border:1px solid rgba(62,200,212,0.35);padding:3px 6px;border-radius:6px;white-space:nowrap;pointer-events:none;transform:translate(-50%,-100%);text-shadow:0 1px 2px #000;';
            el.textContent = 'Tdp ' + d.city.yield.Tdp + '\u00b0C';
            return el;
          }
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
    const el = document.createElement('div');
    el.className = 'fn-pin' + (isNorth ? ' northern' : '') + (isShort ? ' short' : '') + (isDnc ? ' dnc' : ' bwa') +
      (state.layers.northern && isNorth ? ' emphasis' : '');
    el.title = c.name;
    el.innerHTML = '<span class="fn-pin-dot"></span><span class="fn-pin-label">' +
      escapeHtml(shortName(c.name)) + '</span>';
    el.addEventListener('mouseenter', (ev) => {
      showFnTooltip(c, ev);
      document.body.style.cursor = 'pointer';
      bumpIdle();
    });
    el.addEventListener('mouseleave', () => {
      hideTooltip();
      document.body.style.cursor = 'default';
    });
    el.addEventListener('click', (ev) => {
      ev.stopPropagation();
      focusFn(c.id);
    });
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

  function showCityTooltip(c, ev) {
    const y = c.yield;
    const badgeClass = 's' + y.score;
    tooltipEl.classList.remove('need-card', 'reserve-card');
    tooltipEl.innerHTML =
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
      '<div class="tc-body">' +
        '<div class="why">' + escapeHtml(y.why) + '</div>' +
        '<div class="fit">' + escapeHtml(y.marketFit) + '</div>' +
        '<div class="tc-breakdown">' +
          '<span>Fridge core: <strong>' + y.fridge + ' L</strong></span>' +
          '<span>TEC/sorbent: <strong>' + y.tec + ' L</strong></span>' +
          '<span>Solar factor: <strong>' + y.solar + '</strong></span>' +
        '</div>' +
        '<div class="est-tag">MODEL ESTIMATE \u2014 not measured. Machine incomplete. Climate normals \u00b7 ' + escapeHtml(state.season) + ' season bin.</div>' +
      '</div>';
    positionTooltip(ev);
    tooltipEl.classList.add('visible');
  }

  function showFloatingName(name, ev) {
    let fl = document.getElementById('fn-float-label');
    if (!fl) {
      fl = document.createElement('div');
      fl.id = 'fn-float-label';
      fl.className = 'fn-float-label';
      document.body.appendChild(fl);
    }
    fl.textContent = name || '';
    fl.classList.add('visible');
    const x = Math.min(window.innerWidth - 220, Math.max(12, (ev && ev.clientX || window.innerWidth / 2) + 14));
    const y = Math.max(12, (ev && ev.clientY || window.innerHeight / 2) - 36);
    fl.style.left = x + 'px';
    fl.style.top = y + 'px';
    clearTimeout(showFloatingName._t);
    showFloatingName._t = setTimeout(function () { fl.classList.remove('visible'); }, 4500);
  }

  function showReserveTooltip(r, ev) {
    tooltipEl.classList.remove('need-card');
    tooltipEl.classList.add('reserve-card');
    showFloatingName(r.name, ev);
    const ltdwa = r.hasLtdwa && r.ltdwaId ? fnById[r.ltdwaId] : null;
    const badge = ltdwa
      ? '<span class="badge ltdwa-link">On active water-need list</span>'
      : '<span class="badge reserve-badge">No active advisory on current need list</span>';
    tooltipEl.innerHTML =
      '<div class="tc-head reserve-head">' +
        '<div class="reserve-kicker">First Nations land \u00b7 NRCan ALC</div>' +
        '<h3 style="font-size:1.35rem;line-height:1.25;margin:6px 0 8px;color:#fff;font-weight:700;">' + escapeHtml(r.name) + '</h3>' +
        (r.alt ? '<div class="sub">' + escapeHtml(r.alt) + '</div>' : '') +
        '<div class="sub">' + escapeHtml(r.province || '') + ' \u00b7 ' + escapeHtml(r.typeLabel || r.type || 'IR') + '</div>' +
        badge +
      '</div>' +
      '<div class="tc-body">' +
        (ltdwa
          ? '<div class="why">Matched to ISC LTDWA community: <strong>' + escapeHtml(ltdwa.name) + '</strong>. Click the amber need pin for advisory details.</div>'
          : '<div class="why">Indian Reserve / FN land centroid. Not on the current ISC federal public-system LTDWA list (list changes; private wells &amp; territorial systems may still have advisories).</div>') +
        '<div class="fit">Nearby reserve density: <strong>' + (r.density != null ? r.density : '—') + '</strong> other reserves within 75 km (cluster proxy — not census population).</div>' +
        '<div class="est-tag">Source: NRCan Aboriginal Lands of Canada Legislative Boundaries. Pin = polygon centroid (largest part). Attribution: NRCan + ISC LTDWA.</div>' +
      '</div>';
    positionTooltip(ev);
    tooltipEl.classList.add('visible');
  }

  function showFnTooltip(c, ev, reserveCtx) {
    const y = c.yield;
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

    tooltipEl.classList.remove('reserve-card');
    tooltipEl.classList.add('need-card');
    tooltipEl.innerHTML =
      '<div class="tc-head need-head">' +
        '<div class="need-kicker">NEED \u00b7 water access \u2014 not a high-yield site</div>' +
        '<h3 style="font-size:1.3rem;line-height:1.25;margin:6px 0 8px;color:#fff;">' + escapeHtml(c.name) + '</h3>' +
        alt +
        resLine +
        '<div class="sub">' + escapeHtml(c.province) + ' \u00b7 ' + escapeHtml(c.remoteness) + '</div>' +
        termTag + ' ' +
        '<span class="badge ' + badge + '">' + escapeHtml(advisoryLabel(c.advisoryTypeRaw || c.advisoryType)) + '</span> ' +
        northTag + ' ' + bcTag +
      '</div>' +
      '<div class="tc-grid">' +
        '<div class="tc-cell"><div class="k">Population / homes</div><div class="v">' + escapeHtml(homes) + '</div></div>' +
        '<div class="tc-cell"><div class="k">' + (c.term === 'short' ? 'Date set' : 'Long-term since') + '</div><div class="v">' + escapeHtml(since) + '</div></div>' +
        '<div class="tc-cell span2"><div class="k">Estimated DEWFALL under local climate</div><div class="v big need-yield">' +
          y.yieldLo + ' \u2013 ' + y.yieldHi + ' L/day <span class="model-only">(model)</span></div></div>' +
        '<div class="tc-cell"><div class="k">Dry-bulb / RH</div><div class="v">' + y.T + ' \u00b0C \u00b7 ' + y.RH + '%</div></div>' +
        '<div class="tc-cell"><div class="k">Dew point</div><div class="v">' + y.Tdp + ' \u00b0C</div></div>' +
      '</div>' +
      '<div class="tc-body">' +
        '<div class="systems"><strong>System(s):</strong><br/>' + systems + '</div>' +
        '<div class="why cold-caveat">' + escapeHtml(coldClimateCaveat(c)) + '</div>' +
        (c.note ? '<div class="fit">' + escapeHtml(c.note) + '</div>' : '') +
        '<div class="tc-breakdown">' +
          '<span>Fridge: <strong>' + y.fridge + ' L</strong></span>' +
          '<span>TEC/sorbent: <strong>' + y.tec + ' L</strong></span>' +
          '<span>Need signal: <strong>' + Math.round(c.needSignal) + '</strong></span>' +
        '</div>' +
        '<div class="est-tag">' +
          'Source: ' + escapeHtml(c.source || FN_META.sourceLabel || 'ISC / FNHA') + '. ' +
          'List changes. Includes ISC long-term + short-term (south of 60 excl. BC) and FNHA BC advisories. ' +
          'Not all private wells or territorial systems. Reserve geometry: NRCan ALC. Model estimate \u00b7 ' + escapeHtml(state.season) + ' bin.' +
        '</div>' +
      '</div>';
    positionTooltip(ev);
    tooltipEl.classList.add('visible');
  }

  function positionTooltip(ev) {
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

  function hideTooltip() {
    tooltipEl.classList.remove('visible');
  }

  function bumpIdle() {
    if (!globe) return;
    globe.controls().autoRotate = false;
    clearTimeout(state.idleTimer);
    state.idleTimer = setTimeout(() => {
      if (state.autoRotate && globe) globe.controls().autoRotate = true;
    }, 8000);
  }

  function syncZoomMode() {
    if (!globe) return;
    const pov = globe.pointOfView();
    const alt = pov && pov.altitude != null ? pov.altitude : state.altitude;
    state.altitude = alt;
    state.closeZoom = alt < 1.85;
    // Rebuild when crossing pin-size bands so markers stay crisp and readable
    const sizeBand = alt > 2.2 ? 0 : (alt > 1.5 ? 1 : 2);
    if (sizeBand !== state._sizeBand) {
      state._sizeBand = sizeBand;
      if (state.layers.reserves) applyLayers();
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

    const ctrl = globe.controls();
    ctrl.autoRotate = true;
    ctrl.autoRotateSpeed = 0.45;
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

    globe.pointOfView({ lat: 52, lng: -92, altitude: 1.9 }, 0);
    state.altitude = 1.9;
    state.closeZoom = false;
    refresh();

    setTimeout(() => {
      const loader = $("#loader");
      if (loader) loader.classList.add("hide");
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
