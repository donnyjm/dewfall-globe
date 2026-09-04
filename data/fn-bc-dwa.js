/**
 * DEWFALL Globe — FNHA drinking water advisories in BC First Nations communities
 *
 * Source: FNHA Monthly Drinking Water Advisories Summary — August 2026
 * https://fnha.ca/wp-content/uploads/Drinking-Water-Advisory-Monthly-Summary.pdf
 * As of 2026-08-31: 38 DWAs in 38 systems across 32 communities
 * (14 WQA + 15 BWA + 9 DNC per summary; active rows only, revoked excluded).
 *
 * Term: Long ≥365 days · Short 61–364 · Brief ≤60 (Brief mapped to term:'short').
 * WQA mapped to advisoryType BWA for pin styling; advisoryTypeRaw kept.
 */
window.DEWFALL_FN_BC_META = {
  "sourceLabel": "FNHA DWA Monthly Summary Aug 2026",
  "sourceUrl": "https://fnha.ca/wp-content/uploads/Drinking-Water-Advisory-Monthly-Summary.pdf",
  "asOf": "2026-08-31",
  "communityCount": 26,
  "summaryNote": "38 DWAs / 32 communities (FNHA Aug 31 2026); this file dedupes to one pin per community"
};
window.DEWFALL_FN_BC = [
  {
    "id": "fn-bc-canim-lake-tsq-scen",
    "name": "Canim Lake - Tsq'éscen",
    "province": "BC",
    "lat": 51.782,
    "lng": -120.998,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "WQA",
    "term": "long",
    "systems": [
      "Canim Lake Main CWS",
      "Canim Lake West CWS"
    ],
    "dateSet": "2025-01-17",
    "populationNote": "51-100",
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
    "note": "FNHA WQA (long) since 2025-01-17 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-dzawada-enux-w-first-nation",
    "name": "Dzawada̱ʼenux̱w First Nation",
    "province": "BC",
    "lat": 50.97,
    "lng": -126.174,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "WQA",
    "term": "long",
    "systems": [
      "Kingcome CWS"
    ],
    "dateSet": "2024-12-19",
    "populationNote": "101-250",
    "homes": 60,
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
    "note": "FNHA WQA (long) since 2024-12-19 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-leq-mel-first-nation",
    "name": "Leq'á:mel First Nation",
    "province": "BC",
    "lat": 49.185,
    "lng": -122.077,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "WQA",
    "term": "short",
    "systems": [
      "Lakahahmen 2 CWS",
      "Kelly/Evergreen CWS"
    ],
    "dateSet": "2026-04-17",
    "populationNote": "51-100",
    "homes": 40,
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
    "note": "FNHA WQA (short) since 2026-04-17 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-lhtako-dene-nation",
    "name": "Lhtako Dene Nation",
    "province": "BC",
    "lat": 52.95,
    "lng": -122.469,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "WQA",
    "term": "long",
    "systems": [
      "Lhtako CWS"
    ],
    "dateSet": "2022-12-09",
    "populationNote": "101-250",
    "homes": 60,
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
    "note": "FNHA WQA (long) since 2022-12-09 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-nak-azdli-whut-en",
    "name": "Nak'azdli Whut'en",
    "province": "BC",
    "lat": 54.472,
    "lng": -124.199,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "WQA",
    "term": "short",
    "systems": [
      "William's Prairie Meadow CWS"
    ],
    "dateSet": "2026-05-04",
    "populationNote": "1-25",
    "homes": 15,
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
    "note": "FNHA WQA (short) since 2026-05-04 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-splats-in",
    "name": "Splats'in",
    "province": "BC",
    "lat": 50.52,
    "lng": -119.161,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "WQA",
    "term": "long",
    "systems": [
      "Elder's Lodge PWS-HR"
    ],
    "dateSet": "2024-11-04",
    "populationNote": "1-25",
    "homes": 15,
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
    "note": "FNHA WQA (long) since 2024-11-04 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-t-it-q-et",
    "name": "T'it'q'et",
    "province": "BC",
    "lat": 50.585,
    "lng": -121.854,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "WQA",
    "term": "long",
    "systems": [
      "Towinock CWS (AKA Texas Creek)"
    ],
    "dateSet": "2022-10-27",
    "populationNote": "1-25",
    "homes": 15,
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
    "note": "FNHA WQA (long) since 2022-10-27 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-tsal-alh",
    "name": "Tsal'alh",
    "province": "BC",
    "lat": 50.728,
    "lng": -122.195,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "WQA",
    "term": "long",
    "systems": [
      "N'kiat CWS",
      "Tsal'alh Main CWS"
    ],
    "dateSet": "2023-07-14",
    "populationNote": "51-100",
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
    "note": "FNHA WQA (long) since 2023-07-14 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-williams-lake-first-nation-t-exelc",
    "name": "Williams Lake First Nation (T'exelc)",
    "province": "BC",
    "lat": 52.124,
    "lng": -122.123,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "WQA",
    "term": "long",
    "systems": [
      "San Jose 6 PWS-HR"
    ],
    "dateSet": "2019-05-01",
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
    "note": "FNHA WQA (long) since 2019-05-01 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-yekooche-first-nation",
    "name": "Yekooche First Nation",
    "province": "BC",
    "lat": 54.433,
    "lng": -125.483,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "WQA",
    "term": "long",
    "systems": [
      "Portage CWS"
    ],
    "dateSet": "2024-03-08",
    "populationNote": "51-100",
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
    "note": "FNHA WQA (long) since 2024-03-08 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-adams-lake-indian-band",
    "name": "Adams Lake Indian Band",
    "province": "BC",
    "lat": 50.96,
    "lng": -119.63,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "BWA",
    "term": "long",
    "systems": [
      "Indian Point CWS"
    ],
    "dateSet": "2021-04-20",
    "populationNote": "26-50",
    "homes": 25,
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
    "note": "FNHA BWA (long) since 2021-04-20 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-ahousaht",
    "name": "Ahousaht",
    "province": "BC",
    "lat": 49.277,
    "lng": -126.06,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "BWA",
    "term": "long",
    "systems": [
      "Tofino Wilderness Lodge PWS-HR"
    ],
    "dateSet": "2022-12-05",
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
    "note": "FNHA BWA (long) since 2022-12-05 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-cowichan-tribes",
    "name": "Cowichan Tribes",
    "province": "BC",
    "lat": 48.766,
    "lng": -123.731,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "BWA",
    "term": "long",
    "systems": [
      "3904 Johnny Bear Road CWS"
    ],
    "dateSet": "2018-09-10",
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
    "note": "FNHA BWA (long) since 2018-09-10 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-gitga-at-first-nation",
    "name": "Gitga'at First Nation",
    "province": "BC",
    "lat": 53.424,
    "lng": -129.252,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "BWA",
    "term": "short",
    "systems": [
      "Hartley Bay CWS"
    ],
    "dateSet": "2026-08-31",
    "populationNote": "101-250",
    "homes": 60,
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
    "note": "FNHA BWA (short) since 2026-08-31 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-lower-kootenay-yaqan-nu-kiy",
    "name": "Lower Kootenay - Yaqan Nu?kiy",
    "province": "BC",
    "lat": 49.098,
    "lng": -116.585,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "BWA",
    "term": "long",
    "systems": [
      "Seven Nations Soaring Eagle Health Centre PWS-HR"
    ],
    "dateSet": "2022-05-11",
    "populationNote": "1-25",
    "homes": 15,
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
    "note": "FNHA BWA (long) since 2022-05-11 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-lower-similkameen",
    "name": "Lower Similkameen",
    "province": "BC",
    "lat": 49.024,
    "lng": -119.714,
    "advisoryType": "DNC",
    "advisoryTypeRaw": "DNC",
    "term": "long",
    "systems": [
      "Rodeo Cookhouse",
      "LSIB Education Centre PWS-HR"
    ],
    "dateSet": "2022-10-07",
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
    "note": "FNHA DNC (long) since 2022-10-07 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-lytton-tl-kemstin-first-nation",
    "name": "Lytton - Tl'Kemstin First Nation",
    "province": "BC",
    "lat": 50.446,
    "lng": -121.701,
    "advisoryType": "DNC",
    "advisoryTypeRaw": "DNC",
    "term": "long",
    "systems": [
      "18 Mile CWS - IR #4 Nickel Palm",
      "G'WSEP Gas PWS - Washroom Only"
    ],
    "dateSet": "2013-02-20",
    "populationNote": "1-25",
    "homes": 15,
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
    "note": "FNHA DNC (long) since 2013-02-20 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-n-quatqua",
    "name": "N'Quatqua",
    "province": "BC",
    "lat": 50.545,
    "lng": -122.476,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "BWA",
    "term": "long",
    "systems": [
      "Lakeshore Drive and RV Park PWS-HR"
    ],
    "dateSet": "2024-09-10",
    "populationNote": "1-25",
    "homes": 15,
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
    "note": "FNHA BWA (long) since 2024-09-10 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-shuswap-band-kenp-sq-t",
    "name": "Shuswap Band - Kenpésq't",
    "province": "BC",
    "lat": 50.531,
    "lng": -116.016,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "BWA",
    "term": "long",
    "systems": [
      "Kenpesq't Office PWS-HR"
    ],
    "dateSet": "2018-04-19",
    "populationNote": "1-25",
    "homes": 15,
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
    "note": "FNHA BWA (long) since 2018-04-19 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-soowahlie-first-nation",
    "name": "Soowahlie First Nation",
    "province": "BC",
    "lat": 49.08,
    "lng": -121.958,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "BWA",
    "term": "long",
    "systems": [
      "Sweltzer Creek Campground New Washroom PWS-LR"
    ],
    "dateSet": "2023-09-14",
    "populationNote": "26-50",
    "homes": 25,
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
    "note": "FNHA BWA (long) since 2023-09-14 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-stswecem-c-xget-tem-first-nation",
    "name": "Stswecem'c Xget'tem First Nation",
    "province": "BC",
    "lat": 51.533,
    "lng": -122.235,
    "advisoryType": "BWA",
    "advisoryTypeRaw": "BWA",
    "term": "long",
    "systems": [
      "Big Bar Guest Ranch PWS-HR",
      "Meadow Lake Ranch Cabins PWS-HR",
      "Soul Ranch (Lac La Hache) PWS-HR"
    ],
    "dateSet": "2011-11-03",
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
    "note": "FNHA BWA (long) since 2011-11-03 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-yuu-u-i-at-government",
    "name": "Yuułuʔiłʔatḥ Government",
    "province": "BC",
    "lat": 48.948,
    "lng": -125.552,
    "advisoryType": "DNC",
    "advisoryTypeRaw": "DNC",
    "term": "long",
    "systems": [
      "Wya Point Lodges PWS-HR",
      "Wya Point Campground PWS-HR",
      "Wya Point Yurts PWS-HR"
    ],
    "dateSet": "2014-05-20",
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
    "note": "FNHA DNC (long) since 2014-05-20 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-heiltsuk",
    "name": "Heiltsuk",
    "province": "BC",
    "lat": 52.153,
    "lng": -128.151,
    "advisoryType": "DNC",
    "advisoryTypeRaw": "DNC",
    "term": "long",
    "systems": [
      "Fish Plant Well PWS-HR"
    ],
    "dateSet": "2023-03-17",
    "populationNote": "1-25",
    "homes": 15,
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
    "note": "FNHA DNC (long) since 2023-03-17 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-lil-wat-nation",
    "name": "Lil'wat Nation",
    "province": "BC",
    "lat": 50.329,
    "lng": -122.672,
    "advisoryType": "DNC",
    "advisoryTypeRaw": "DNC",
    "term": "long",
    "systems": [
      "Kwetsa7 CWS"
    ],
    "dateSet": "2019-07-12",
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
    "note": "FNHA DNC (long) since 2019-07-12 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-tl-etinqox-government",
    "name": "Tl'etinqox Government",
    "province": "BC",
    "lat": 52.031,
    "lng": -123.165,
    "advisoryType": "DNC",
    "advisoryTypeRaw": "DNC",
    "term": "short",
    "systems": [
      "Anahim's Meadow Road (East System)",
      "T7 Ranch PWS-HR"
    ],
    "dateSet": "2025-10-10",
    "populationNote": "1-25",
    "homes": 15,
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
    "note": "FNHA DNC (short) since 2025-10-10 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  },
  {
    "id": "fn-bc-ulkatcho-first-nation",
    "name": "Ulkatcho First Nation",
    "province": "BC",
    "lat": 52.357,
    "lng": -125.159,
    "advisoryType": "DNC",
    "advisoryTypeRaw": "DNC",
    "term": "long",
    "systems": [
      "Fishtrap CWS (Nimpo Lake Rd)"
    ],
    "dateSet": "2022-11-03",
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
    "note": "FNHA DNC (long) since 2022-11-03 · BC region",
    "source": "FNHA Drinking Water Advisory Monthly Summary Aug 2026",
    "sourceDate": "2026-08-31",
    "fnha": true
  }
];
