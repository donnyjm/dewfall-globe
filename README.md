# DEWFALL Globe

Interactive photorealistic Earth globe showing **where DEWFALL produces the most water** — estimated L/day from a transparent climate / psychrometric model.

**Mekilok · North Vancouver · DEWFALL Alpha AWG visualization**

> **Disclaimer:** All yields are **MODEL ESTIMATES**, not measured. The machine is not complete. Design target ~10–20 L/day residential; warm-humid design bin historically modeled ~6–9 L/day (unvalidated).

## Open / run

No build step. From this directory:

```bash
cd /workspace/dewfall-globe
python3 -m http.server 8766
```

Then open: **http://127.0.0.1:8766/**

A static server is required so CDN libraries and modules load correctly (avoid `file://` in some browsers).

## Features

- NASA Blue Marble globe via **globe.gl** + Three.js (atmosphere glow, night sky)
- ~59 curated cities with annual / summer / winter climate normals (T, RH → dew point & absolute humidity)
- Cyan → deep-blue yield pillars; humidity mist rings on moist cities
- Season selector, layer toggles, ranked city list, rich hover/click cards
- Fridge-core vs TEC/sorbent breakdown + qualitative score (1–5)
- Dark coastal/tech UI, DEWFALL branding, fullscreen responsive
- Auto-rotate when idle; orbit / zoom / drag
- **All First Nations reserves** nationwide (NRCan Aboriginal Lands — Indian Reserves), silver hexbin/dots
- ISC First Nations **LTDWA need** layer (amber/red pins on top, distinct from cyan yield pillars)




## First Nations reserves (nationwide)

Toggle **All First Nations reserves** (default ON) to show NRCan **Aboriginal Lands of Canada Legislative Boundaries** centroids for Indian Reserves (IR) across Canada.

- Data file: `data/fn-reserves.js` (~2,200+ deduped IR pins + optional FN settlement types).
- Optional **Other FN settlement lands**: Sechelt (SHL), Cree/Naskapi (CRN), Salt River (SRN), Yukon FN (YFN), Indian Land (IL). Excludes Inuit Owned Land (IOL) and similar by default.
- At world/continent zoom: hexbin aggregation for GPU performance; zoom in for individual silver pins.
- Amber/red LTDWA need pins stay larger and on top. Fuzzy name + geo match marks `hasLtdwa` where possible.
- Attribution: **NRCan ALC Legislative Boundaries** + **ISC LTDWA**.

## First Nations LTDWA need layer

Toggle **First Nations — active LTDWA (need)** to show ISC long-term drinking water advisory communities (38 communities / 40 advisories as of **2026-08-13**).

- These pins are **NEED / water-access** sites — **not** high AWG yield markets.
- Amber = boil-water advisory (BWA); red = do-not-consume (DNC); northern remote pins are emphasized (optional **Northern remote** filter).
- Cards show homes impacted, since date, systems, **modeled** DEWFALL L/day under local climate (often low in cold/northern bins), plus ISC attribution.
- Rank tab **LTDWA need** sorts by homes × remoteness and still shows yield so the need-vs-production tension is visible.
- Source: Indigenous Services Canada federal public-system LTDWAs only. List changes; private wells / short-term / territorial systems often not included. BC/AB/QC/Atlantic currently 0 on this list.

Data: `data/fn-ltdwa.js` (`window.DEWFALL_FN_LTDWA`).

## Data sources

- **Primary:** Embedded curated climate normals (NOAA / ECCC / WMO-style station climate approximations) in `data/cities.js` — no API key required
- **Optional path:** Open-Meteo Climate API (no key) can enhance live climate pulls; app runs fully offline from curated data

## Yield formula (summary)

See `js/yield.js` for the full transparent model.

1. Compute dew point (°C) and absolute humidity (g/m³) from dry-bulb + RH (Buck / Magnus).
2. **Refrigeration core (R290):** scales with dew point above ~4 °C, warm ambient, and RH; cold ambient derate; soft-capped toward Caribbean ~15–18 L/day class.
3. **Sorbent + Tier-5 TEC:** adds yield in drier/hot air, gated by solar-availability factor (latitude × season) and absolute humidity feedstock; reduced when fridge already strong (AI-style gate).
4. Present mid estimate with ±~18% range; qualitative score 1–5.

Calibrated (illustrative, not bench-fitted) toward:

| Climate bin | Model class |
|-------------|-------------|
| ~22 °C / 60 % RH | ~6–9 L/day |
| ~30 °C / 80 % RH | ~15–18 L/day mid |

## Files

| Path | Role |
|------|------|
| `index.html` | App shell |
| `css/styles.css` | Dark product UI |
| `data/cities.js` | City climate normals |
| `js/yield.js` | Psychrometric yield model |
| `js/app.js` | Globe, layers, UI |
| `js/loader.js` | Loads Three.js + globe.gl (CDN) then local scripts |

## Product context

- **DEWFALL Alpha:** modular solar-ready residential AWG
- R290 refrigeration core for primary condensation + regenerating sorbent for difficult conditions
- Tier 5: six independently controlled TEC condensation cassettes on dedicated solar branch
- Local AI gates cassettes by dew point, temps, airflow, available energy
- Target geographies: **US Southwest** (drought demand) and **coastal-humidity** markets (high yield)

## License / use

Internal Mekilok / DEWFALL product visualization. Climate figures are approximate normals for illustration.
