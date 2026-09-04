/**
 * DEWFALL Globe — ISC active Long-Term Drinking Water Advisories (LTDWA)
 * First Nations communities on federal public water systems.
 *
 * Source: Indigenous Services Canada active LTDWAs as of 2026-08-13
 * (40 advisories in 38 communities). Numbers change; this is NOT a
 * complete inventory of every private well, short-term advisory, or
 * territorial system (YT/NT/NU often outside this federal public-system list).
 * BC / AB / QC / Atlantic currently 0 active on this ISC list.
 *
 * PRODUCT FRAMING: these are NEED / water-access sites — not high AWG yield
 * sites. Northern/cold climates often mean LOWER L/day from refrigeration AWG.
 * Coordinates: Wikipedia / GeoNames / Nominatim community centroids (approx).
 */
window.DEWFALL_FN_LTDWA = [
  // —— Manitoba (7) ——
  {
    id: "fn-cross-lake",
    name: "Cross Lake Band of Indians",
    altNames: "Pimicikamak · Nikikonakos",
    province: "MB",
    lat: 54.622, lng: -97.774,
    advisoryType: "BWA",
    homes: 248, buildings: null,
    longTermSince: "2026-08",
    systems: ["Cross Lake Natimek PWS"],
    remoteness: "road-access",
    climate: {
      annual: { T: -0.5, RH: 0.74 },
      summer: { T: 16.5, RH: 0.68 },
      winter: { T: -20.0, RH: 0.78 }
    },
    note: "Long-term since Aug 2026 · northern Manitoba road-access community",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-mathias-colomb",
    name: "Mathias Colomb Cree Nation",
    altNames: "Pukatawagan",
    province: "MB",
    lat: 55.745, lng: -101.288,
    advisoryType: "BWA",
    homes: 400, buildings: null,
    longTermSince: "2021-09",
    systems: ["Townsite PWS"],
    remoteness: "remote-northern",
    climate: {
      annual: { T: -2.5, RH: 0.74 },
      summer: { T: 15.0, RH: 0.68 },
      winter: { T: -23.0, RH: 0.78 }
    },
    note: "Remote northern MB · ~400 homes on Townsite PWS since Sep 2021",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-pauingassi",
    name: "Pauingassi First Nation",
    altNames: "",
    province: "MB",
    lat: 52.164, lng: -95.379,
    advisoryType: "BWA",
    homes: 130, buildings: 4,
    longTermSince: "2026-03",
    systems: ["Pauingassi PWS"],
    remoteness: "remote",
    climate: {
      annual: { T: 0.5, RH: 0.73 },
      summer: { T: 17.5, RH: 0.68 },
      winter: { T: -18.5, RH: 0.77 }
    },
    note: "~130 homes · long-term since Mar 2026",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-shamattawa",
    name: "Shamattawa First Nation",
    altNames: "",
    province: "MB",
    lat: 55.861, lng: -92.090,
    advisoryType: "BWA",
    homes: 170, buildings: 14,
    longTermSince: "2019-12",
    systems: ["Shamattawa PWS"],
    remoteness: "remote-northern",
    climate: {
      annual: { T: -3.0, RH: 0.75 },
      summer: { T: 14.5, RH: 0.70 },
      winter: { T: -24.0, RH: 0.80 }
    },
    note: "Northern remote MB · fly-in · cold climate limits fridge AWG L/day",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-tataskweyak",
    name: "Tataskweyak Cree Nation",
    altNames: "Split Lake",
    province: "MB",
    lat: 56.170, lng: -96.157,
    advisoryType: "BWA",
    homes: 371, buildings: 5,
    longTermSince: "2018-05",
    systems: ["Tataskweyak Cree PWS (#6602)"],
    remoteness: "remote-northern",
    climate: {
      annual: { T: -3.5, RH: 0.74 },
      summer: { T: 14.0, RH: 0.68 },
      winter: { T: -24.5, RH: 0.79 }
    },
    note: "~371 homes · long-term since May 2018 · northern MB",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-tootinaowaziibeeng",
    name: "Tootinaowaziibeeng Treaty Reserve",
    altNames: "Valley River",
    province: "MB",
    lat: 51.228, lng: -100.970,
    advisoryType: "DNC",
    homes: 115, buildings: 12,
    longTermSince: "2024-07",
    systems: ["Tootinaowaziibeeng PWS"],
    remoteness: "road-access",
    climate: {
      annual: { T: 1.5, RH: 0.70 },
      summer: { T: 18.5, RH: 0.64 },
      winter: { T: -16.0, RH: 0.76 }
    },
    note: "Do not consume · ~115 homes since Jul 2024",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-waywayseecappo",
    name: "Waywayseecappo First Nation",
    altNames: "Treaty Four - 1874",
    province: "MB",
    lat: 50.720, lng: -100.878,
    advisoryType: "DNC",
    homes: 80, buildings: 6,
    longTermSince: "2024-09",
    systems: ["Waywayseecappo Valley PWS"],
    remoteness: "road-access",
    climate: {
      annual: { T: 2.0, RH: 0.70 },
      summer: { T: 19.0, RH: 0.64 },
      winter: { T: -15.0, RH: 0.75 }
    },
    note: "Do not consume · ~80 homes since Sep 2024",
    source: "ISC LTDWA as of 2026-08-13"
  },

  // —— Saskatchewan (4 communities / 5 advisories) ——
  {
    id: "fn-little-pine",
    name: "Little Pine First Nation",
    altNames: "",
    province: "SK",
    lat: 52.915, lng: -109.048,
    advisoryType: "BWA",
    homes: 250, buildings: 10,
    longTermSince: "2019-11",
    systems: ["Little Pine PWS"],
    remoteness: "road-access",
    climate: {
      annual: { T: 1.5, RH: 0.68 },
      summer: { T: 18.5, RH: 0.58 },
      winter: { T: -16.5, RH: 0.76 }
    },
    note: "~250 homes · BWA since Nov 2019",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-ministikwan",
    name: "Ministikwan Lake Cree Nation",
    altNames: "Mudie Lake",
    province: "SK",
    lat: 54.020, lng: -109.738,
    advisoryType: "BWA",
    homes: 145, buildings: 10,
    longTermSince: "2025-12",
    systems: ["Ministikwan PWS No. 161A – Mudie Lake"],
    remoteness: "remote",
    climate: {
      annual: { T: -0.5, RH: 0.70 },
      summer: { T: 16.5, RH: 0.62 },
      winter: { T: -19.0, RH: 0.77 }
    },
    note: "Mudie Lake system · ~145 homes since Dec 2025",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-peepeekisis",
    name: "Peepeekisis Cree Nation No.81",
    altNames: "",
    province: "SK",
    lat: 50.875, lng: -103.387,
    advisoryType: "BWA",
    homes: null, buildings: null,
    longTermSince: "2014-04",
    systems: ["Poitras Well (since 2014)", "Main PWS (since 2016)"],
    remoteness: "road-access",
    climate: {
      annual: { T: 2.5, RH: 0.68 },
      summer: { T: 19.0, RH: 0.58 },
      winter: { T: -14.5, RH: 0.75 }
    },
    note: "TWO systems combined on one pin · Poitras Well + Main PWS · since 2014/2016",
    homesImpactNote: "Multi-system; Poitras Well ~6 homes + Main PWS community system",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-wahpeton",
    name: "Wahpeton Dakota Nation",
    altNames: "Waḣpéthuŋwaŋ Dakota Oyate",
    province: "SK",
    lat: 53.278, lng: -105.886,
    advisoryType: "BWA",
    homes: 75, buildings: null,
    longTermSince: "2026-07",
    systems: ["Wahpeton PWS"],
    remoteness: "road-access",
    climate: {
      annual: { T: 1.0, RH: 0.70 },
      summer: { T: 18.0, RH: 0.62 },
      winter: { T: -17.0, RH: 0.76 }
    },
    note: "~75 homes · BWA since Jul 2026",
    source: "ISC LTDWA as of 2026-08-13"
  },

  // —— Ontario (27) ——
  {
    id: "fn-naongashiing",
    name: "Anishnaabeg of Naongashiing",
    altNames: "Big Island · Big Island Lake",
    province: "ON",
    lat: 49.144, lng: -94.660,
    advisoryType: "BWA",
    homes: 48, buildings: null,
    longTermSince: null,
    systems: ["Big Island Lake system"],
    remoteness: "road-access",
    climate: {
      annual: { T: 2.5, RH: 0.72 },
      summer: { T: 18.5, RH: 0.68 },
      winter: { T: -14.0, RH: 0.76 }
    },
    note: "Big Island Lake · ~48 homes · Lake of the Woods area",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-bearskin-lake",
    name: "Bearskin Lake First Nation",
    altNames: "",
    province: "ON",
    lat: 53.892, lng: -90.955,
    advisoryType: "BWA",
    homes: null, buildings: null,
    longTermSince: null,
    systems: ["Cisterns", "Nursing station systems"],
    remoteness: "remote-northern",
    climate: {
      annual: { T: -2.0, RH: 0.74 },
      summer: { T: 15.0, RH: 0.70 },
      winter: { T: -22.0, RH: 0.79 }
    },
    note: "Northern remote · cisterns + nursing station systems · long-standing advisory",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-cat-lake",
    name: "Cat Lake First Nation",
    altNames: "Bizhiw-zaaga'igan",
    province: "ON",
    lat: 51.725, lng: -91.826,
    advisoryType: "BWA",
    homes: null, buildings: null,
    longTermSince: null,
    systems: ["Youth Healing Centre semi-public"],
    remoteness: "remote",
    climate: {
      annual: { T: -0.5, RH: 0.73 },
      summer: { T: 16.5, RH: 0.68 },
      winter: { T: -19.5, RH: 0.78 }
    },
    note: "Youth Healing Centre semi-public system",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-georgina-island",
    name: "Chippewas of Georgina Island First Nation",
    altNames: "Waaseyaagmiing Anishinaabek",
    province: "ON",
    lat: 44.333, lng: -79.283,
    advisoryType: "BWA",
    homes: 120, buildings: null,
    longTermSince: null,
    systems: ["Georgina Island PWS"],
    remoteness: "southern",
    climate: {
      annual: { T: 7.5, RH: 0.74 },
      summer: { T: 20.5, RH: 0.70 },
      winter: { T: -5.5, RH: 0.78 }
    },
    note: "~120 homes · Lake Simcoe · southern ON road/ferry access",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-nawash",
    name: "Chippewas of Nawash First Nation",
    altNames: "Neyaashiinigmiing · Cape Croker",
    province: "ON",
    lat: 44.917, lng: -81.033,
    advisoryType: "BWA",
    homes: 300, buildings: null,
    longTermSince: null,
    systems: ["Cape Croker PWS"],
    remoteness: "southern",
    climate: {
      annual: { T: 6.5, RH: 0.76 },
      summer: { T: 19.5, RH: 0.72 },
      winter: { T: -6.0, RH: 0.80 }
    },
    note: "Cape Croker · ~300 homes · Bruce Peninsula",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-chippewas-thames",
    name: "Chippewas of the Thames First Nation",
    altNames: "",
    province: "ON",
    lat: 42.812, lng: -81.455,
    advisoryType: "BWA",
    homes: 406, buildings: null,
    longTermSince: null,
    systems: ["Chippewas of the Thames PWS"],
    remoteness: "southern",
    climate: {
      annual: { T: 8.5, RH: 0.74 },
      summer: { T: 21.5, RH: 0.70 },
      winter: { T: -4.0, RH: 0.76 }
    },
    note: "~406 homes · southwestern Ontario",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-eabametoong",
    name: "Eabametoong First Nation",
    altNames: "Fort Hope",
    province: "ON",
    lat: 51.629, lng: -87.848,
    advisoryType: "BWA",
    homes: 270, buildings: null,
    longTermSince: "2002",
    systems: ["Eabametoong / Fort Hope PWS"],
    remoteness: "remote",
    climate: {
      annual: { T: -0.5, RH: 0.73 },
      summer: { T: 16.5, RH: 0.68 },
      winter: { T: -19.5, RH: 0.78 }
    },
    note: "~270 homes · remote · advisory since 2002",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-fort-severn",
    name: "Fort Severn First Nation",
    altNames: "Waśaho Ininiwak · Fort Severn 89",
    province: "ON",
    lat: 55.9925, lng: -87.635,
    advisoryType: "BWA",
    homes: 118, buildings: null,
    longTermSince: "2025-12",
    systems: ["Fort Severn PWS"],
    remoteness: "remote-northern",
    climate: {
      annual: { T: -5.0, RH: 0.76 },
      summer: { T: 11.5, RH: 0.72 },
      winter: { T: -26.0, RH: 0.82 }
    },
    note: "Northernmost ON · Hudson Bay · HIGHLIGHT northern cold · fridge AWG heavily derated",
    highlightNorthern: true,
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-grassy-narrows",
    name: "Grassy Narrows First Nation",
    altNames: "Asubpeeschoseewagong Netum Anishinabek",
    province: "ON",
    lat: 50.154, lng: -93.992,
    advisoryType: "BWA",
    homes: 210, buildings: null,
    longTermSince: null,
    systems: ["Grassy Narrows PWS"],
    remoteness: "road-access",
    climate: {
      annual: { T: 1.5, RH: 0.72 },
      summer: { T: 18.0, RH: 0.68 },
      winter: { T: -16.0, RH: 0.76 }
    },
    note: "~210 homes · northwestern Ontario",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-gull-bay",
    name: "Gull Bay First Nation",
    altNames: "Kiashke Zaaging Anishinaabek",
    province: "ON",
    lat: 49.804, lng: -89.108,
    advisoryType: "BWA",
    homes: 97, buildings: null,
    longTermSince: null,
    systems: ["Gull Bay PWS"],
    remoteness: "road-access",
    climate: {
      annual: { T: 1.5, RH: 0.72 },
      summer: { T: 17.5, RH: 0.68 },
      winter: { T: -15.5, RH: 0.76 }
    },
    note: "~97 homes · Lake Nipigon area",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-lac-la-croix",
    name: "Lac La Croix First Nation",
    altNames: "Gakijiwanong Anishinaabe Nation",
    province: "ON",
    lat: 48.376, lng: -92.163,
    advisoryType: "BWA",
    homes: 108, buildings: null,
    longTermSince: null,
    systems: ["Lac La Croix PWS"],
    remoteness: "road-access",
    climate: {
      annual: { T: 2.5, RH: 0.72 },
      summer: { T: 18.5, RH: 0.68 },
      winter: { T: -14.0, RH: 0.76 }
    },
    note: "~108 homes · Rainy River District",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-marten-falls",
    name: "Marten Falls First Nation",
    altNames: "Ogoki Post",
    province: "ON",
    lat: 51.667, lng: -85.917,
    advisoryType: "BWA",
    homes: 91, buildings: null,
    longTermSince: "2006",
    systems: ["Marten Falls PWS"],
    remoteness: "remote",
    climate: {
      annual: { T: -0.5, RH: 0.73 },
      summer: { T: 16.5, RH: 0.68 },
      winter: { T: -19.5, RH: 0.78 }
    },
    note: "~91 homes · remote · since 2006",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-mishkeegogamang",
    name: "Mishkeegogamang First Nation",
    altNames: "Erik Lake · Osnaburgh",
    province: "ON",
    lat: 51.234, lng: -90.238,
    advisoryType: "BWA",
    homes: 7, buildings: null,
    longTermSince: null,
    systems: ["Erik Lake"],
    remoteness: "remote",
    climate: {
      annual: { T: 0.0, RH: 0.72 },
      summer: { T: 17.0, RH: 0.68 },
      winter: { T: -18.5, RH: 0.77 }
    },
    note: "Erik Lake still active (~7 homes) · 63B system lifted May 2026",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-munsee-delaware",
    name: "Munsee-Delaware Nation",
    altNames: "",
    province: "ON",
    lat: 42.788, lng: -81.475,
    advisoryType: "DNC",
    homes: 46, buildings: null,
    longTermSince: null,
    systems: ["Munsee-Delaware PWS"],
    remoteness: "southern",
    climate: {
      annual: { T: 8.5, RH: 0.74 },
      summer: { T: 21.5, RH: 0.70 },
      winter: { T: -4.0, RH: 0.76 }
    },
    note: "Do not consume · ~46 homes · southwestern ON",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-muskrat-dam",
    name: "Muskrat Dam Lake First Nation",
    altNames: "",
    province: "ON",
    lat: 53.403, lng: -91.778,
    advisoryType: "BWA",
    homes: 88, buildings: null,
    longTermSince: "2004",
    systems: ["Muskrat Dam PWS"],
    remoteness: "remote-northern",
    climate: {
      annual: { T: -2.0, RH: 0.74 },
      summer: { T: 15.0, RH: 0.70 },
      winter: { T: -22.0, RH: 0.79 }
    },
    note: "~88 homes · remote · since 2004",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-neskantaga",
    name: "Neskantaga First Nation",
    altNames: "",
    province: "ON",
    lat: 52.205, lng: -88.011,
    advisoryType: "BWA",
    homes: 76, buildings: null,
    longTermSince: "1996",
    systems: ["Neskantaga PWS"],
    remoteness: "remote",
    climate: {
      annual: { T: -1.0, RH: 0.73 },
      summer: { T: 16.0, RH: 0.68 },
      winter: { T: -20.5, RH: 0.78 }
    },
    note: "Longest-standing · since 1996 · ~76 homes · remote",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-nibinamik",
    name: "Nibinamik First Nation",
    altNames: "Summer Beaver",
    province: "ON",
    lat: 52.708, lng: -88.542,
    advisoryType: "BWA",
    homes: 105, buildings: null,
    longTermSince: "2014",
    systems: ["Nibinamik PWS"],
    remoteness: "remote",
    climate: {
      annual: { T: -1.5, RH: 0.73 },
      summer: { T: 15.5, RH: 0.68 },
      winter: { T: -21.0, RH: 0.78 }
    },
    note: "~105 homes · remote · since 2014",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-north-caribou",
    name: "North Caribou Lake First Nation",
    altNames: "Weagamow Lake",
    province: "ON",
    lat: 52.945, lng: -91.312,
    advisoryType: "BWA",
    homes: 150, buildings: null,
    longTermSince: null,
    systems: ["North Caribou Lake / Weagamow PWS"],
    remoteness: "remote",
    climate: {
      annual: { T: -1.5, RH: 0.73 },
      summer: { T: 15.5, RH: 0.68 },
      winter: { T: -21.0, RH: 0.78 }
    },
    note: "~150 homes · Weagamow Lake",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-north-spirit",
    name: "North Spirit Lake First Nation",
    altNames: "",
    province: "ON",
    lat: 52.508, lng: -93.024,
    advisoryType: "BWA",
    homes: 95, buildings: null,
    longTermSince: null,
    systems: ["North Spirit Lake PWS"],
    remoteness: "remote",
    climate: {
      annual: { T: -1.0, RH: 0.73 },
      summer: { T: 16.0, RH: 0.68 },
      winter: { T: -20.0, RH: 0.78 }
    },
    note: "~95 homes · remote northwestern ON",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-oneida-thames",
    name: "Oneida Nation of the Thames",
    altNames: "",
    province: "ON",
    lat: 42.823, lng: -81.402,
    advisoryType: "BWA",
    homes: 550, buildings: null,
    longTermSince: null,
    systems: ["Oneida Nation of the Thames PWS"],
    remoteness: "southern",
    climate: {
      annual: { T: 8.5, RH: 0.74 },
      summer: { T: 21.5, RH: 0.70 },
      winter: { T: -4.0, RH: 0.76 }
    },
    note: "~550 homes · largest homes count on this list · southwestern ON",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-pikangikum",
    name: "Pikangikum First Nation",
    altNames: "Bigaanjigamiing",
    province: "ON",
    lat: 51.808, lng: -93.993,
    advisoryType: "BWA",
    homes: 20, buildings: 36,
    longTermSince: null,
    systems: ["Pikangikum PWS"],
    remoteness: "remote",
    climate: {
      annual: { T: 0.0, RH: 0.72 },
      summer: { T: 17.0, RH: 0.68 },
      winter: { T: -18.5, RH: 0.77 }
    },
    note: "Remote · ~20 homes + 36 buildings on advisory",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-sandy-lake",
    name: "Sandy Lake First Nation",
    altNames: "",
    province: "ON",
    lat: 53.057, lng: -93.326,
    advisoryType: "BWA",
    homes: 400, buildings: null,
    longTermSince: "2003",
    systems: ["Sandy Lake PWS"],
    remoteness: "remote-northern",
    climate: {
      annual: { T: -2.0, RH: 0.74 },
      summer: { T: 15.0, RH: 0.70 },
      winter: { T: -22.0, RH: 0.79 }
    },
    note: "Remote · ~400 homes · since 2003",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-seine-river",
    name: "Seine River First Nation",
    altNames: "Jiima’aaganing",
    province: "ON",
    lat: 48.746, lng: -92.346,
    advisoryType: "BWA",
    homes: 90, buildings: null,
    longTermSince: null,
    systems: ["Seine River PWS"],
    remoteness: "road-access",
    climate: {
      annual: { T: 2.5, RH: 0.72 },
      summer: { T: 18.5, RH: 0.68 },
      winter: { T: -14.0, RH: 0.76 }
    },
    note: "~90 homes · Rainy River District",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-shawanaga",
    name: "Shawanaga First Nation",
    altNames: "",
    province: "ON",
    lat: 45.514, lng: -80.285,
    advisoryType: "BWA",
    homes: 101, buildings: null,
    longTermSince: null,
    systems: ["Shawanaga PWS"],
    remoteness: "southern",
    climate: {
      annual: { T: 6.0, RH: 0.76 },
      summer: { T: 19.5, RH: 0.72 },
      winter: { T: -7.0, RH: 0.80 }
    },
    note: "~101 homes · Parry Sound / Georgian Bay",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-slate-falls",
    name: "Slate Falls Nation",
    altNames: "Shakopaatikoong",
    province: "ON",
    lat: 51.150, lng: -91.618,
    advisoryType: "BWA",
    homes: 60, buildings: null,
    longTermSince: null,
    systems: ["Slate Falls PWS"],
    remoteness: "remote",
    climate: {
      annual: { T: 0.0, RH: 0.72 },
      summer: { T: 17.0, RH: 0.68 },
      winter: { T: -18.5, RH: 0.77 }
    },
    note: "~60 homes · remote northwestern ON",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-wabauskang",
    name: "Wabauskang First Nation",
    altNames: "",
    province: "ON",
    lat: 50.379, lng: -93.174,
    advisoryType: "BWA",
    homes: 45, buildings: null,
    longTermSince: null,
    systems: ["Wabauskang PWS"],
    remoteness: "road-access",
    climate: {
      annual: { T: 1.5, RH: 0.72 },
      summer: { T: 18.0, RH: 0.68 },
      winter: { T: -16.0, RH: 0.76 }
    },
    note: "~45 homes · northwestern Ontario",
    source: "ISC LTDWA as of 2026-08-13"
  },
  {
    id: "fn-wawakapewin",
    name: "Wawakapewin First Nation",
    altNames: "Long Dog",
    province: "ON",
    lat: 53.466, lng: -89.199,
    advisoryType: "BWA",
    homes: 15, buildings: null,
    longTermSince: null,
    systems: ["Long Dog / Wawakapewin PWS"],
    remoteness: "remote-northern",
    climate: {
      annual: { T: -2.5, RH: 0.74 },
      summer: { T: 14.5, RH: 0.70 },
      winter: { T: -23.0, RH: 0.79 }
    },
    note: "Long Dog · ~15 homes · northern remote · pin near Long Dog Lake",
    source: "ISC LTDWA as of 2026-08-13"
  }
];

window.DEWFALL_FN_LTDWA_META = {
  communityCount: 38,
  advisoryCount: 40,
  asOf: "2026-08-13",
  sourceLabel: "Indigenous Services Canada active LTDWA",
  disclaimer:
    "Federal public-system LTDWAs only. List changes. Does not cover all private wells, short-term advisories, or territorial systems. BC/AB/QC/Atlantic currently 0 on this list.",
  framing:
    "NEED / water-access sites — not necessarily high AWG yield. Northern/cold climates often mean LOWER L/day from refrigeration AWG."
};
