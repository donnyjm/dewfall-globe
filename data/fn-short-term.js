/**
 * DEWFALL Globe — ISC active short-term drinking water advisories
 * First Nations communities south of 60 (excl. BC — see FNHA / fn-bc-dwa.js).
 *
 * Source: Indigenous Services Canada short-term DWA page as of 2026-09-03
 * https://www.sac-isc.gc.ca/eng/1562856509704/1562856530304
 * Active only (Date revoked = None). Deduplicated by First Nation; systems listed.
 * Blood Tribe / Tallcree / Odanak / Samson school rows revoked — excluded.
 *
 * PRODUCT FRAMING: NEED / water-access sites — not high AWG yield sites.
 * Coordinates: fuzzy match to NRCan IR centroids in fn-reserves.js, else known coords.
 */
window.DEWFALL_FN_SHORT_META = {
  "sourceLabel": "ISC short-term DWA as of 2026-09-03",
  "sourceUrl": "https://www.sac-isc.gc.ca/eng/1562856509704/1562856530304",
  "asOf": "2026-09-03",
  "communityCount": 35,
  "advisoryCount": 41,
  "regions": [
    "Atlantic",
    "Québec",
    "Ontario",
    "Manitoba",
    "Saskatchewan",
    "Alberta"
  ],
  "note": "Excludes BC (FNHA). Excludes revoked. Short-term = temporary water quality issue."
};
window.DEWFALL_FN_SHORT = [
  {
    "id": "fn-st-metepenagiag-mi-kmaq-nation",
    "name": "Metepenagiag Mi'kmaq Nation",
    "province": "NB",
    "lat": 47.032,
    "lng": -65.486,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Red Bank Public Water System"
    ],
    "dateSet": "2026-08-29",
    "populationNote": "101-500 people",
    "homes": 80,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 5.5,
        "RH": 0.74
      },
      "summer": {
        "T": 17.5,
        "RH": 0.7
      },
      "winter": {
        "T": -6.0,
        "RH": 0.78
      }
    },
    "note": "ISC short-term BWA since 2026-08-29 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-miawpukek",
    "name": "Miawpukek",
    "province": "NL",
    "lat": 47.89,
    "lng": -55.677,
    "advisoryType": "DNC",
    "term": "short",
    "systems": [
      "Saint Anne's School Semi-Public Water System",
      "Conne River Public Water System"
    ],
    "dateSet": "2026-01-21",
    "populationNote": "501-1000 people",
    "homes": 150,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 5.5,
        "RH": 0.74
      },
      "summer": {
        "T": 17.5,
        "RH": 0.7
      },
      "winter": {
        "T": -6.0,
        "RH": 0.78
      }
    },
    "note": "ISC short-term DNC since 2026-01-21 · 2 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-tobique",
    "name": "Tobique",
    "province": "NB",
    "lat": 46.80122,
    "lng": -67.70138,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Employment and Training Center Semi Public Water System-NT"
    ],
    "dateSet": "2025-11-10",
    "populationNote": "Unknown",
    "homes": null,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 5.5,
        "RH": 0.74
      },
      "summer": {
        "T": 17.5,
        "RH": 0.7
      },
      "winter": {
        "T": -6.0,
        "RH": 0.78
      }
    },
    "note": "ISC short-term BWA since 2025-11-10 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-innu-essipit",
    "name": "Innu / Essipit",
    "province": "QC",
    "lat": 48.336,
    "lng": -69.4,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Ess / Essipit Public Water System"
    ],
    "dateSet": "2026-08-26",
    "populationNote": "101-500 people",
    "homes": 80,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 5.5,
        "RH": 0.74
      },
      "summer": {
        "T": 17.5,
        "RH": 0.7
      },
      "winter": {
        "T": -6.0,
        "RH": 0.78
      }
    },
    "note": "ISC short-term BWA since 2026-08-26 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-biigtigong-nishnaabeg",
    "name": "Biigtigong Nishnaabeg",
    "province": "ON",
    "lat": 48.628,
    "lng": -86.271,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Pic River Public Water System"
    ],
    "dateSet": "2026-09-01",
    "populationNote": "101-500 people",
    "homes": 80,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 5.0,
        "RH": 0.7
      },
      "summer": {
        "T": 19.0,
        "RH": 0.65
      },
      "winter": {
        "T": -8.0,
        "RH": 0.75
      }
    },
    "note": "ISC short-term BWA since 2026-09-01 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-chapleau-ojibway",
    "name": "Chapleau Ojibway",
    "province": "ON",
    "lat": 47.799,
    "lng": -83.396,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Chapleau Ojibwe Public Water System"
    ],
    "dateSet": "2026-08-28",
    "populationNote": "0-100 people",
    "homes": 40,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 5.0,
        "RH": 0.7
      },
      "summer": {
        "T": 19.0,
        "RH": 0.65
      },
      "winter": {
        "T": -8.0,
        "RH": 0.75
      }
    },
    "note": "ISC short-term BWA since 2026-08-28 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-deer-lake",
    "name": "Deer Lake",
    "province": "ON",
    "lat": 52.64,
    "lng": -94.08867,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Nursing Station PWS-NT / Semi-Public Water System",
      "Deer Lake Public Water System"
    ],
    "dateSet": "2025-10-21",
    "populationNote": "501-1000 people",
    "homes": 150,
    "remoteness": "remote",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2025-10-21 · 2 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-dokis",
    "name": "Dokis",
    "province": "ON",
    "lat": 46.06572,
    "lng": -80.05274,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Dokis Public Water System"
    ],
    "dateSet": "2026-06-24",
    "populationNote": "101-500 people",
    "homes": 80,
    "remoteness": "southern",
    "climate": {
      "annual": {
        "T": 5.0,
        "RH": 0.7
      },
      "summer": {
        "T": 19.0,
        "RH": 0.65
      },
      "winter": {
        "T": -8.0,
        "RH": 0.75
      }
    },
    "note": "ISC short-term BWA since 2026-06-24 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-fort-albany",
    "name": "Fort Albany",
    "province": "ON",
    "lat": 52.31697,
    "lng": -81.74179,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Fort Albany Public Water System"
    ],
    "dateSet": "2026-05-09",
    "populationNote": "1001-5000 people",
    "homes": 400,
    "remoteness": "remote",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-05-09 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-kee-way-win",
    "name": "Kee-Way-Win",
    "province": "ON",
    "lat": 52.986,
    "lng": -92.773,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Keewaywin Public Water System"
    ],
    "dateSet": "2026-03-19",
    "populationNote": "501-1000 people",
    "homes": 150,
    "remoteness": "remote",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-03-19 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-kitchenuhmaykoosib-inninuwug",
    "name": "Kitchenuhmaykoosib Inninuwug",
    "province": "ON",
    "lat": 53.81893,
    "lng": -89.76213,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Big Trout Lake Public Water System"
    ],
    "dateSet": "2026-08-13",
    "populationNote": "0-100 people",
    "homes": 40,
    "remoteness": "remote",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-08-13 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-mishkeegogamang",
    "name": "Mishkeegogamang",
    "province": "ON",
    "lat": 51.247,
    "lng": -90.197,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Ace Lake Public Water System",
      "Doghole Bay North Public Water System",
      "63A (Ten Houses) Public Water System",
      "63B Public Water System"
    ],
    "dateSet": "2025-12-23",
    "populationNote": "1001-5000 people",
    "homes": 400,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2025-12-23 · 4 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-moravian-of-the-thames",
    "name": "Moravian of the Thames",
    "province": "ON",
    "lat": 42.56715,
    "lng": -81.87877,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Moraviantown Public Water System"
    ],
    "dateSet": "2026-07-03",
    "populationNote": "501-1000 people",
    "homes": 150,
    "remoteness": "southern",
    "climate": {
      "annual": {
        "T": 8.0,
        "RH": 0.72
      },
      "summer": {
        "T": 21.0,
        "RH": 0.68
      },
      "winter": {
        "T": -4.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-07-03 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-six-nations-of-the-grand-river",
    "name": "Six Nations of the Grand River",
    "province": "ON",
    "lat": 49.08546,
    "lng": -94.13897,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "The Everlasting Tree School Semi-Public Water System"
    ],
    "dateSet": "2026-07-09",
    "populationNote": "Unknown",
    "homes": null,
    "remoteness": "southern",
    "climate": {
      "annual": {
        "T": 5.0,
        "RH": 0.7
      },
      "summer": {
        "T": 19.0,
        "RH": 0.65
      },
      "winter": {
        "T": -8.0,
        "RH": 0.75
      }
    },
    "note": "ISC short-term BWA since 2026-07-09 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-wabaseemoong-independent-nations",
    "name": "Wabaseemoong Independent Nations",
    "province": "ON",
    "lat": 50.16328,
    "lng": -94.94215,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Whitedog Public Water System"
    ],
    "dateSet": "2026-04-20",
    "populationNote": "501-1000 people",
    "homes": 150,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-04-20 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-whitesand",
    "name": "Whitesand",
    "province": "ON",
    "lat": 50.31533,
    "lng": -89.05133,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Whitesand Public Water System (MTSA Town of Armstrong)"
    ],
    "dateSet": "2026-06-08",
    "populationNote": "101-500 people",
    "homes": 80,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-06-08 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-birdtail-sioux",
    "name": "Birdtail Sioux",
    "province": "MB",
    "lat": 50.52033,
    "lng": -101.15767,
    "advisoryType": "DNC",
    "term": "short",
    "systems": [
      "Birdtail Sioux Landbase Semi-Public Water System"
    ],
    "dateSet": "2026-07-15",
    "populationNote": "Unknown",
    "homes": null,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term DNC since 2026-07-15 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-black-river",
    "name": "Black River",
    "province": "MB",
    "lat": 50.827,
    "lng": -96.29867,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Little Black River Public Water System"
    ],
    "dateSet": "2026-03-23",
    "populationNote": "501-1000 people",
    "homes": 150,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-03-23 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-bloodvein",
    "name": "Bloodvein",
    "province": "MB",
    "lat": 51.78346,
    "lng": -96.68414,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Bloodvein Public Water System"
    ],
    "dateSet": "2026-09-02",
    "populationNote": "1001-5000 people",
    "homes": 400,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-09-02 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-god-s-lake",
    "name": "God's Lake",
    "province": "MB",
    "lat": 54.52333,
    "lng": -94.43567,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "God's Lake Austin Nazzie Pumphouse Public Water System"
    ],
    "dateSet": "2026-02-16",
    "populationNote": "101-500 people",
    "homes": 80,
    "remoteness": "remote",
    "climate": {
      "annual": {
        "T": -1.5,
        "RH": 0.74
      },
      "summer": {
        "T": 15.0,
        "RH": 0.68
      },
      "winter": {
        "T": -20.0,
        "RH": 0.78
      }
    },
    "note": "ISC short-term BWA since 2026-02-16 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-lake-manitoba",
    "name": "Lake Manitoba",
    "province": "MB",
    "lat": 50.95,
    "lng": -98.45,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Lake Manitoba Women's Shelter Semi-Public Water System-NT",
      "Lake Manitoba Public Water System"
    ],
    "dateSet": "2026-05-07",
    "populationNote": "1001-5000 people",
    "homes": 400,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-05-07 · 2 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-sandy-bay",
    "name": "Sandy Bay",
    "province": "MB",
    "lat": 50.54278,
    "lng": -98.65761,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Sandy Bay Public Water System"
    ],
    "dateSet": "2026-05-27",
    "populationNote": "1001-5000 people",
    "homes": 400,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-05-27 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-sayisi-dene",
    "name": "Sayisi Dene",
    "province": "MB",
    "lat": 58.72,
    "lng": -98.48,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Tadoule Lake Public Water System"
    ],
    "dateSet": "2026-06-23",
    "populationNote": "101-500",
    "homes": 80,
    "remoteness": "remote-northern",
    "climate": {
      "annual": {
        "T": -4.0,
        "RH": 0.76
      },
      "summer": {
        "T": 12.0,
        "RH": 0.7
      },
      "winter": {
        "T": -24.0,
        "RH": 0.8
      }
    },
    "note": "ISC short-term BWA since 2026-06-23 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-waywayseecappo-treaty-four-1874",
    "name": "Waywayseecappo First Nation",
    "province": "MB",
    "lat": 50.67369,
    "lng": -100.93607,
    "advisoryType": "DNU",
    "term": "short",
    "systems": [
      "Waywayseecappo School Semi-Public Water System-Nt"
    ],
    "dateSet": "2025-11-30",
    "populationNote": "Unknown",
    "homes": null,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term DNU since 2025-11-30 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-canoe-lake-cree",
    "name": "Canoe Lake Cree",
    "province": "SK",
    "lat": 55.12472,
    "lng": -108.1924,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Canoe Lake No. 165 / Canoe Lake Cree Public Water System"
    ],
    "dateSet": "2026-07-29",
    "populationNote": "501-1000 people",
    "homes": 150,
    "remoteness": "remote",
    "climate": {
      "annual": {
        "T": -1.5,
        "RH": 0.74
      },
      "summer": {
        "T": 15.0,
        "RH": 0.68
      },
      "winter": {
        "T": -20.0,
        "RH": 0.78
      }
    },
    "note": "ISC short-term BWA since 2026-07-29 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-george-gordon-first-nation",
    "name": "George Gordon First Nation",
    "province": "SK",
    "lat": 53.66833,
    "lng": -105.609,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Gordon No. 86 Public Water System"
    ],
    "dateSet": "2026-08-31",
    "populationNote": "101-500 people",
    "homes": 80,
    "remoteness": "remote",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-08-31 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-makwa-sahgaiehcan",
    "name": "Makwa Sahgaiehcan",
    "province": "SK",
    "lat": 54.04967,
    "lng": -109.14333,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Makwa Lake No. 129 / Makwa Sahgaiehcan Public Water System"
    ],
    "dateSet": "2026-08-24",
    "populationNote": "1001-5000 people",
    "homes": 400,
    "remoteness": "remote",
    "climate": {
      "annual": {
        "T": -1.5,
        "RH": 0.74
      },
      "summer": {
        "T": 15.0,
        "RH": 0.68
      },
      "winter": {
        "T": -20.0,
        "RH": 0.78
      }
    },
    "note": "ISC short-term BWA since 2026-08-24 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-montreal-lake-cree-nation-lac-la-ronge",
    "name": "Montreal Lake Cree Nation & Lac La Ronge",
    "province": "SK",
    "lat": 53.487,
    "lng": -105.902,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Montreal Lake No. 106B Little Red River Public Water System"
    ],
    "dateSet": "2026-05-06",
    "populationNote": "101-500 people",
    "homes": 80,
    "remoteness": "remote",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-05-06 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-moosomin",
    "name": "Moosomin",
    "province": "SK",
    "lat": 53.122,
    "lng": -108.18633,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Moosomin No. 112B Public Water System"
    ],
    "dateSet": "2026-08-31",
    "populationNote": "1001-5000 people",
    "homes": 400,
    "remoteness": "remote",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-08-31 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-peter-ballantyne",
    "name": "Peter Ballantyne",
    "province": "SK",
    "lat": 56.334,
    "lng": -103.189,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Southend No. 200 Public Water System"
    ],
    "dateSet": "2026-06-26",
    "populationNote": "501-1000 people",
    "homes": 150,
    "remoteness": "remote-northern",
    "climate": {
      "annual": {
        "T": -1.5,
        "RH": 0.74
      },
      "summer": {
        "T": 15.0,
        "RH": 0.68
      },
      "winter": {
        "T": -20.0,
        "RH": 0.78
      }
    },
    "note": "ISC short-term BWA since 2026-06-26 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-red-pheasant",
    "name": "Red Pheasant",
    "province": "SK",
    "lat": 52.47386,
    "lng": -108.13469,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Red Pheasant No. 108 / Red Pheasant Cree Nation Public Water System"
    ],
    "dateSet": "2026-07-16",
    "populationNote": "101-500 people",
    "homes": 80,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-07-16 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-beaver-lake-cree-nation",
    "name": "Beaver Lake Cree Nation",
    "province": "AB",
    "lat": 53.4825,
    "lng": -113.72571,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Tina's Smokeshop Semi-Public Water System"
    ],
    "dateSet": "2026-07-22",
    "populationNote": "Unknown",
    "homes": null,
    "remoteness": "remote",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-07-22 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-cold-lake",
    "name": "Cold Lake",
    "province": "AB",
    "lat": 54.29766,
    "lng": -110.31686,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Cold Lake No. 149 Public Water System"
    ],
    "dateSet": "2026-08-27",
    "populationNote": "0-100 people",
    "homes": 40,
    "remoteness": "remote",
    "climate": {
      "annual": {
        "T": -1.5,
        "RH": 0.74
      },
      "summer": {
        "T": 15.0,
        "RH": 0.68
      },
      "winter": {
        "T": -20.0,
        "RH": 0.78
      }
    },
    "note": "ISC short-term BWA since 2026-08-27 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-samson-cree-nation-pigeon-lake",
    "name": "Samson Cree Nation (Pigeon Lake)",
    "province": "AB",
    "lat": 52.991,
    "lng": -113.939,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Ma-Me-O Campground 1 Public Water System"
    ],
    "dateSet": "2026-07-16",
    "populationNote": "0-100 people",
    "homes": 40,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-07-16 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  },
  {
    "id": "fn-st-stoney",
    "name": "Stoney",
    "province": "AB",
    "lat": 51.192,
    "lng": -115.009,
    "advisoryType": "BWA",
    "term": "short",
    "systems": [
      "Mînî Thnî Bearspaw Riding Arena Semi-Public Water System"
    ],
    "dateSet": "2026-08-08",
    "populationNote": "Unknown",
    "homes": null,
    "remoteness": "road-access",
    "climate": {
      "annual": {
        "T": 2.0,
        "RH": 0.72
      },
      "summer": {
        "T": 17.0,
        "RH": 0.66
      },
      "winter": {
        "T": -14.0,
        "RH": 0.76
      }
    },
    "note": "ISC short-term BWA since 2026-08-08 · 1 system(s)",
    "source": "ISC short-term DWA as of 2026-09-03",
    "sourceDate": "2026-09-03"
  }
];
