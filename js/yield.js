/**
 * DEWFALL Alpha — transparent psychrometric yield MODEL (estimates only).
 *
 * Calibrated to first-principles envelope work (not bench measurements):
 *   ~22 °C / 60 % RH  →  ~6–9 L/day  (honest jug / design bin)
 *   ~30 °C / 80 % RH  →  ~15–18 L/day (Caribbean-class humid)
 * Design target band: ~10–20 L/day residential.
 *
 * Architecture modeled:
 *   - Refrigeration core (R290): primary condensation when dew point is workable
 *   - Regenerating sorbent + Tier-5 TEC cassettes: assist in drier/hot air,
 *     gated by local AI on dew point, temps, airflow, available solar energy
 *
 * Solar (GHI / untapped TEC-branch harvest): offline lat/lng empirical model —
 * NOT a utility interconnection study. See estimateSiteSolar().
 *
 * ALL OUTPUTS ARE MODEL ESTIMATES. Machine not complete; nothing measured.
 */
(function (global) {
  'use strict';

  const R_V = 461.52;

  /** DEWFALL TEC solar-branch array assumptions (transparent). */
  const SOLAR_ARRAY_KWP = 0.6;   // 600 W_p — mid of ~0.4–0.8 kW_p class
  const SOLAR_PR = 0.75;         // performance ratio (inverter, soiling, temp, wiring)
  const SOLAR_GHI_REF = 5.5;     // kWh/m²/day — maps GHI → yield solarFactor scale

  function psatPa(T_c) {
    // Buck 1981 over liquid water
    return 611.21 * Math.exp((18.678 - T_c / 234.5) * T_c / (257.14 + T_c));
  }

  function dewpointC(T_c, RH) {
    const pv = Math.max(1, Math.min(RH, 0.995) * psatPa(T_c));
    // Magnus approximation (fast, accurate enough for climate bins)
    const a = 17.625, b = 243.04;
    const alpha = Math.log(RH) + (a * T_c) / (b + T_c);
    return (b * alpha) / (a - alpha);
  }

  function absHumidityGm3(T_c, RH) {
    const pv = Math.max(1, Math.min(RH, 0.995) * psatPa(T_c));
    const T_k = T_c + 273.15;
    return (pv / (R_V * T_k)) * 1000.0;
  }

  /**
   * Empirical clear-sky + cloud-adjusted GHI (kWh/m²/day).
   * Offline from lat/lng (+ optional RH). Calibrated toward:
   *   Phoenix ~5.7–6.0 · southern AB/SK ~4.0–4.3 · coastal BC ~2.8–3.2 ·
   *   Fort Severn / mid-north ON ~2.8–3.0 · high Arctic ~2.2–2.5
   */
  function estimateGHI(lat, lng, season, rh) {
    const absLat = Math.abs(lat || 0);
    const latRad = absLat * Math.PI / 180;
    let clear = 6.85 * Math.pow(Math.max(0.08, Math.cos(latRad)), 0.88);
    if (absLat > 58) clear *= 1 + 0.10 * Math.min(1, (absLat - 58) / 12);
    clear = Math.max(1.9, Math.min(7.2, clear));

    let cloud = 0.78;
    if (lng != null && !isNaN(lng)) {
      if (lng < -120 && lng > -132 && absLat >= 44 && absLat <= 55) cloud = 0.64; // PNW / coastal BC
      else if (lng >= -114.5 && lng <= -100 && absLat >= 48.5 && absLat <= 53.5) cloud = 0.90; // southern prairies
      else if (lng >= -118 && lng <= -104 && absLat >= 31 && absLat <= 38) cloud = 0.96; // US Southwest
      else if (lng >= -115 && lng <= -105 && absLat >= 38 && absLat <= 42) cloud = 0.92; // high desert
      else if (lng >= -125 && lng <= -110 && absLat >= 30 && absLat <= 42) cloud = 0.93;
      else if (lng >= -98 && lng <= -78 && absLat >= 24 && absLat <= 35) cloud = 0.74; // Gulf / SE
      else if (absLat >= 50 && absLat <= 62 && lng >= -95 && lng <= -70) cloud = 0.74; // Hudson Bay belt
      else if (absLat > 60) cloud = 0.72;
    }
    if (rh != null && !isNaN(rh)) {
      const rhAdj = (0.55 - rh) * 0.18;
      cloud = Math.max(0.48, Math.min(0.98, cloud + rhAdj));
    }

    const annual = clear * cloud;
    let summerMul, winterMul;
    {
      const boost = 1.12 + 0.38 * Math.sin(latRad);
      const cut = 0.50 + 0.38 * Math.cos(latRad);
      if ((lat || 0) >= 0) {
        summerMul = boost;
        winterMul = cut;
      } else {
        summerMul = Math.max(0.7, 1.85 - boost);
        winterMul = Math.min(1.35, 1.7 - cut * 0.4);
      }
    }
    const summer = annual * summerMul;
    const winter = annual * winterMul;
    let ghi = annual;
    if (season === 'summer') ghi = summer;
    else if (season === 'winter') ghi = winter;

    return {
      ghi: +ghi.toFixed(2),
      annual: +annual.toFixed(2),
      summer: +summer.toFixed(2),
      winter: +winter.toFixed(2),
      clearSky: +clear.toFixed(2),
      cloudFactor: +cloud.toFixed(2),
      unit: 'kWh/m²/day',
      estimated: true,
    };
  }

  /**
   * PV harvest for DEWFALL TEC solar-branch array.
   * E_year = GHI_daily × 365 × kW_p × PR
   * While undeployed, this harvest is treated as 100% untapped for the TEC branch.
   */
  function estimatePVHarvest(ghiDaily, kwp, pr) {
    const k = kwp != null ? kwp : SOLAR_ARRAY_KWP;
    const p = pr != null ? pr : SOLAR_PR;
    const daily = ghiDaily * k * p;
    const yearly = daily * 365;
    return {
      kwp: k,
      pr: p,
      kWhPerDay: +daily.toFixed(2),
      kWhPerYear: Math.round(yearly),
      untapped: true,
      note: 'Untapped until DEWFALL deployed — 100% of modeled TEC-branch PV harvest',
    };
  }

  /** Full site solar resource + untapped TEC-branch estimate. */
  function estimateSiteSolar(lat, lng, season, rh) {
    const ghi = estimateGHI(lat, lng, season || 'annual', rh);
    const harvest = estimatePVHarvest(ghi.ghi);
    const harvestAnnual = estimatePVHarvest(ghi.annual);
    // Resource index from GHI (display); yield gate remains solarFactor(lat, season)
    const resourceFactor = Math.min(1, Math.max(0.2, ghi.ghi / SOLAR_GHI_REF));
    return {
      ghi: ghi.ghi,
      ghiAnnual: ghi.annual,
      ghiSummer: ghi.summer,
      ghiWinter: ghi.winter,
      clearSky: ghi.clearSky,
      cloudFactor: ghi.cloudFactor,
      unit: ghi.unit,
      arrayKwp: harvest.kwp,
      pr: harvest.pr,
      kWhPerDay: harvest.kWhPerDay,
      kWhPerYear: harvest.kWhPerYear,
      untappedKWhYear: harvest.kWhPerYear,
      untappedKWhYearAnnual: harvestAnnual.kWhPerYear,
      resourceFactor: +resourceFactor.toFixed(2),
      untapped: true,
      estimated: true,
      disclaimer: 'Irradiance model estimate — not a utility interconnection study.',
    };
  }

  /**
   * Rough clear-sky solar availability proxy 0–1 by latitude + season.
   * Used by the yield TEC gate. Kept stable so L/day calibration does not drift;
   * GHI / untapped PV use estimateSiteSolar() separately.
   */
  function solarFactor(lat, season) {
    const absLat = Math.abs(lat || 0);
    let base = Math.max(0.25, 1 - absLat / 90);
    if (season === 'summer') {
      // More sun toward summer hemisphere; we approximate N-hem bias for 'summer'
      base *= (lat || 0) >= 0 ? 1.25 : 0.85;
    } else if (season === 'winter') {
      base *= (lat || 0) >= 0 ? 0.7 : 1.15;
    }
    return Math.min(1, Math.max(0.2, base));
  }

  /**
   * Estimate daily water production (L/day) for DEWFALL Alpha architecture.
   * Returns rich object for UI tooltips.
   */
  function estimateYield(T_c, RH, lat, season) {
    const rh = Math.max(0.05, Math.min(0.98, RH));
    const T = T_c;
    const Tdp = dewpointC(T, rh);
    const AH = absHumidityGm3(T, rh);
    const solar = solarFactor(lat || 0, season || 'annual');

    // —— Refrigeration core (R290) ——
    // Works when coil can get below dew point with usable ΔT.
    // Roughly zero below ~4 °C dew point; rises with Tdp and warm dry-bulb.
    let fridge = 0;
    if (Tdp > 4 && T > 5) {
      // Moisture driving force
      const moisture = Math.max(0, Tdp - 4);
      // Warm air improves throughput / COP window
      const warm = 0.75 + 0.02 * Math.max(0, Math.min(T, 35) - 12);
      // RH helps film / collection
      const rhFac = 0.55 + 0.45 * rh;
      fridge = moisture * 0.78 * warm * rhFac;
      // Soft cap when AH is huge (Caribbean) — matches ~15–18 L class
      fridge = fridge * (1 - 0.15 / (1 + AH / 12));
    }
    // Freeze / cold lockout derate
    if (T < 8) fridge *= Math.max(0.15, (T + 2) / 10);

    // —— Sorbent + Tier-5 TEC assist ——
    // Helps in drier / hot conditions where fridge alone is weak.
    // Solar-gated (dedicated solar branch for TEC cassettes).
    let tec = 0;
    const dryStress = Math.max(0, 0.55 - rh) / 0.55; // 0 moist → 1 very dry
    const hotBonus = Math.max(0, T - 22) / 20;
    if (AH > 3 && T > 10) {
      // Absolute humidity still needed as feedstock
      const feed = Math.min(1, AH / 10);
      tec = (1.8 + 3.5 * dryStress + 1.2 * hotBonus) * feed * (0.45 + 0.55 * solar);
      // When fridge already strong, TEC contributes less (AI gates cassettes)
      const gate = 1 / (1 + fridge / 10);
      tec *= 0.55 + 0.45 * gate;
    }

    let total = fridge + tec;
    // Residential design envelope soft caps (model, not measured)
    total = Math.min(20, Math.max(0, total));

    // Present as a range (±18%) to reflect model uncertainty
    let lo = Math.max(0, +(total * 0.82).toFixed(1));
    let hi = Math.min(22, +(total * 1.18).toFixed(1));
    if (hi < lo) { const m = +total.toFixed(1); lo = m; hi = m; }
    if (total < 0.5) { lo = 0; hi = Math.max(hi, 0.5); }

    // Qualitative score
    let score, scoreLabel, why;
    if (total >= 14) {
      score = 5; scoreLabel = 'Excellent';
      why = 'High dew point and absolute humidity favor the R290 refrigeration core; warm air supports strong condensation throughput.';
    } else if (total >= 10) {
      score = 4; scoreLabel = 'Strong';
      why = 'Good moisture availability. Refrigeration core does most of the work; TEC branch may idle.';
    } else if (total >= 6.0) {
      score = 3; scoreLabel = 'Moderate';
      why = 'Workable dew points. Yield near the warm-humid design bin (~6–9 L/day model).';
    } else if (total >= 3.5) {
      score = 2; scoreLabel = 'Limited';
      why = 'Lower absolute humidity. Sorbent/TEC cassettes and solar availability matter more than fridge alone.';
    } else {
      score = 1; scoreLabel = 'Challenging';
      why = 'Dry or cold air limits condensation. Tier-5 TEC + sorbent can still produce water at lower efficiency where solar is strong (e.g. US Southwest drought markets).';
    }

    // Market narrative
    let marketFit = '';
    if (rh < 0.45 && T > 20) {
      marketFit = 'US Southwest–style: drought demand is high; model leans on sorbent/TEC + solar, not fridge peak yield.';
    } else if (Tdp >= 18 && rh >= 0.65) {
      marketFit = 'Coastal-humid peak: highest modeled L/day from refrigeration-core condensation.';
    } else if (T < 12) {
      marketFit = 'Cool/temperate: fridge derated by low ambient; seasonal summer improves yield.';
    } else {
      marketFit = 'Mixed climate: both fridge and TEC paths contribute depending on season and solar.';
    }

    return {
      T: +T.toFixed(1),
      RH: Math.round(rh * 100),
      Tdp: +Tdp.toFixed(1),
      AH: +AH.toFixed(1),
      fridge: +fridge.toFixed(1),
      tec: +tec.toFixed(1),
      yieldMid: +total.toFixed(1),
      yieldLo: +lo.toFixed(1),
      yieldHi: +hi.toFixed(1),
      solar: +solar.toFixed(2),
      score,
      scoreLabel,
      why,
      marketFit,
      estimated: true,
    };
  }

  function enrichCity(city, season) {
    const bin = city.climate[season] || city.climate.annual;
    const y = estimateYield(bin.T, bin.RH, city.lat, season);
    const solar = estimateSiteSolar(city.lat, city.lng, season, bin.RH);
    // Attach yield-gate factor onto site solar for tooltips
    solar.yieldSolarFactor = y.solar;
    return Object.assign({}, city, { season, bin, yield: y, solar });
  }

  function enrichAll(cities, season) {
    return cities.map((c) => enrichCity(c, season));
  }

  /** Color scale: challenging amber → cyan → deep ocean blue (high water). */
  function yieldColor(mid, maxRef) {
    const t = Math.max(0, Math.min(1, mid / (maxRef || 18)));
    // cyan (low-mid) → deep blue (high)
    if (t < 0.35) {
      // muted teal / slate for low
      const u = t / 0.35;
      return lerpColor([90, 110, 130], [64, 196, 210], u);
    }
    if (t < 0.7) {
      const u = (t - 0.35) / 0.35;
      return lerpColor([64, 196, 210], [32, 140, 220], u);
    }
    const u = (t - 0.7) / 0.3;
    return lerpColor([32, 140, 220], [10, 60, 180], u);
  }

  function lerpColor(a, b, t) {
    const r = Math.round(a[0] + (b[0] - a[0]) * t);
    const g = Math.round(a[1] + (b[1] - a[1]) * t);
    const bl = Math.round(a[2] + (b[2] - a[2]) * t);
    return `rgb(${r},${g},${bl})`;
  }

  function humidityColor(AH) {
    const t = Math.max(0, Math.min(1, (AH - 4) / 18));
    return lerpColor([80, 100, 120], [180, 230, 255], t);
  }

  /** GHI color: soft gold → deep orange (low → high irradiance). */
  function solarColor(ghi, minRef, maxRef) {
    const lo = minRef != null ? minRef : 2.0;
    const hi = maxRef != null ? maxRef : 5.8;
    const t = Math.max(0, Math.min(1, (ghi - lo) / (hi - lo || 1)));
    const stops = [
      [0.00, [232, 200, 120]], // soft gold
      [0.40, [240, 168, 48]],  // amber gold
      [0.70, [232, 120, 36]],  // orange
      [1.00, [180, 56, 16]],   // deep orange
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
    return lerpColor(a, b, u);
  }

  global.DEWFALL_YIELD = {
    dewpointC,
    absHumidityGm3,
    estimateYield,
    enrichCity,
    enrichAll,
    yieldColor,
    humidityColor,
    solarFactor,
    estimateGHI,
    estimatePVHarvest,
    estimateSiteSolar,
    solarColor,
    SOLAR_ARRAY_KWP,
    SOLAR_PR,
  };
})(window);
