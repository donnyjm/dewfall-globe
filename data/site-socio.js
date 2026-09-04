/**
 * DEWFALL Globe — population + income band hints for site cards.
 * Prefer ranges / “est.” / regional proxies. Never invent precise village incomes.
 * Missing ids fall back to runtime socioFor() in app.js.
 */
window.DEWFALL_SITE_SOCIO = {
  "drought-phoenix": {
    "population": 4900000,
    "populationNote": "est. metro CSA",
    "incomeBand": "USD median household ~$70–80k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS / CSA approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-tucson": {
    "population": 1100000,
    "populationNote": "est. metro",
    "incomeBand": "USD median household ~$55–65k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-las-vegas": {
    "population": 2300000,
    "populationNote": "est. metro",
    "incomeBand": "USD median household ~$65–75k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-albuquerque": {
    "population": 920000,
    "populationNote": "est. metro",
    "incomeBand": "USD median household ~$55–65k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-el-paso": {
    "population": 870000,
    "populationNote": "est. metro",
    "incomeBand": "USD median household ~$50–60k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-inland-empire": {
    "population": 4600000,
    "populationNote": "est. Riverside–San Bernardino metro",
    "incomeBand": "USD median household ~$70–85k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-bakersfield": {
    "population": 910000,
    "populationNote": "est. metro",
    "incomeBand": "USD median household ~$60–70k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-san-diego": {
    "population": 3300000,
    "populationNote": "est. metro",
    "incomeBand": "USD median household ~$85–95k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-los-angeles": {
    "population": 13000000,
    "populationNote": "est. LA basin / CSA",
    "incomeBand": "USD median household ~$75–90k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-yuma": {
    "population": 210000,
    "populationNote": "est. metro",
    "incomeBand": "USD median household ~$50–60k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-st-george": {
    "population": 200000,
    "populationNote": "est. metro",
    "incomeBand": "USD median household ~$65–75k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-prescott": {
    "population": 240000,
    "populationNote": "est. metro",
    "incomeBand": "USD median household ~$55–65k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-palm-springs": {
    "population": 450000,
    "populationNote": "est. Coachella Valley",
    "incomeBand": "USD median household ~$55–70k",
    "incomeNote": "valley ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-denver": {
    "population": 3000000,
    "populationNote": "est. Front Range metro",
    "incomeBand": "USD median household ~$85–95k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-salt-lake": {
    "population": 1300000,
    "populationNote": "est. metro",
    "incomeBand": "USD median household ~$80–90k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-boise": {
    "population": 800000,
    "populationNote": "est. metro",
    "incomeBand": "USD median household ~$70–80k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-oklahoma-city": {
    "population": 1500000,
    "populationNote": "est. metro",
    "incomeBand": "USD median household ~$60–70k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-dallas": {
    "population": 7900000,
    "populationNote": "est. DFW metro",
    "incomeBand": "USD median household ~$75–85k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-austin": {
    "population": 2500000,
    "populationNote": "est. metro",
    "incomeBand": "USD median household ~$80–95k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-san-antonio": {
    "population": 2600000,
    "populationNote": "est. metro",
    "incomeBand": "USD median household ~$60–70k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-fresno": {
    "population": 1000000,
    "populationNote": "est. metro",
    "incomeBand": "USD median household ~$55–65k",
    "incomeNote": "metro ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "drought-monterrey": {
    "population": 5300000,
    "populationNote": "est. metro",
    "incomeBand": "MXN middle (national urban proxy)",
    "incomeNote": "national urban proxy — not neighborhood survey",
    "source": "INEGI / UN urban approx",
    "sourceUrl": "https://www.inegi.org.mx/"
  },
  "drought-hermosillo": {
    "population": 950000,
    "populationNote": "est. metro",
    "incomeBand": "MXN lower-middle–middle (regional proxy)",
    "incomeNote": "regional proxy",
    "source": "INEGI approx",
    "sourceUrl": "https://www.inegi.org.mx/"
  },
  "drought-perth": {
    "population": 2200000,
    "populationNote": "est. greater metro",
    "incomeBand": "AUD median household ~$90–110k",
    "incomeNote": "ABS metro proxy",
    "source": "ABS approx",
    "sourceUrl": "https://www.abs.gov.au/"
  },
  "drought-adelaide": {
    "population": 1400000,
    "populationNote": "est. greater metro",
    "incomeBand": "AUD median household ~$75–90k",
    "incomeNote": "ABS metro proxy",
    "source": "ABS approx",
    "sourceUrl": "https://www.abs.gov.au/"
  },
  "drought-santiago": {
    "population": 7000000,
    "populationNote": "est. RM metro",
    "incomeBand": "CLP middle (national urban proxy)",
    "incomeNote": "national urban proxy",
    "source": "INE / UN approx",
    "sourceUrl": "https://www.ine.cl/"
  },
  "drought-cape-town": {
    "population": 4800000,
    "populationNote": "est. metro",
    "incomeBand": "ZAR lower-middle–middle (metro mixed)",
    "incomeNote": "metro mixed — high inequality",
    "source": "Stats SA / UN approx",
    "sourceUrl": "https://www.statssa.gov.za/"
  },
  "drought-tel-aviv": {
    "population": 4200000,
    "populationNote": "est. metro area",
    "incomeBand": "ILS middle–upper-middle (coastal metro)",
    "incomeNote": "metro proxy",
    "source": "CBS Israel / UN approx",
    "sourceUrl": "https://www.cbs.gov.il/"
  },
  "drought-murcia": {
    "population": 1500000,
    "populationNote": "est. SE Spain arid belt (Murcia–Almería)",
    "incomeBand": "EUR lower-middle–middle (regional proxy)",
    "incomeNote": "regional proxy",
    "source": "INE Spain approx",
    "sourceUrl": "https://www.ine.es/"
  },
  "drought-dubai": {
    "population": 3500000,
    "populationNote": "est. emirate / city",
    "incomeBand": "AED middle–upper (expat-heavy metro)",
    "incomeNote": "city proxy — wide distribution",
    "source": "DSC Dubai / UN approx",
    "sourceUrl": "https://www.dsc.gov.ae/"
  },
  "drought-riyadh": {
    "population": 7000000,
    "populationNote": "est. metro",
    "incomeBand": "SAR middle (national urban proxy)",
    "incomeNote": "national urban proxy",
    "source": "GASTAT / UN approx",
    "sourceUrl": "https://www.stats.gov.sa/"
  },
  "fn-cross-lake": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "MB Indigenous regional median proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 744,
    "populationNote": "est. community (homes×3)",
    "homes": 248
  },
  "fn-mathias-colomb": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "MB Indigenous regional median proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 1200,
    "populationNote": "est. community (homes×3)",
    "homes": 400
  },
  "fn-pauingassi": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "MB Indigenous regional median proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 390,
    "populationNote": "est. community (homes×3)",
    "homes": 130
  },
  "fn-shamattawa": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "MB Indigenous regional median proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 510,
    "populationNote": "est. community (homes×3)",
    "homes": 170
  },
  "fn-tataskweyak": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "MB Indigenous regional median proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 1113,
    "populationNote": "est. community (homes×3)",
    "homes": 371
  },
  "fn-tootinaowaziibeeng": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "MB Indigenous regional median proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 345,
    "populationNote": "est. community (homes×3)",
    "homes": 115
  },
  "fn-waywayseecappo": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "MB Indigenous regional median proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 240,
    "populationNote": "est. community (homes×3)",
    "homes": 80
  },
  "fn-little-pine": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "SK Indigenous regional median proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 750,
    "populationNote": "est. community (homes×3)",
    "homes": 250
  },
  "fn-ministikwan": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "SK Indigenous regional median proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 435,
    "populationNote": "est. community (homes×3)",
    "homes": 145
  },
  "fn-peepeekisis": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "SK Indigenous regional median proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-wahpeton": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "SK Indigenous regional median proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 225,
    "populationNote": "est. community (homes×3)",
    "homes": 75
  },
  "fn-naongashiing": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 144,
    "populationNote": "est. community (homes×3)",
    "homes": 48
  },
  "fn-bearskin-lake": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-cat-lake": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-georgina-island": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 360,
    "populationNote": "est. community (homes×3)",
    "homes": 120
  },
  "fn-nawash": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 900,
    "populationNote": "est. community (homes×3)",
    "homes": 300
  },
  "fn-chippewas-thames": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 1218,
    "populationNote": "est. community (homes×3)",
    "homes": 406
  },
  "fn-eabametoong": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 810,
    "populationNote": "est. community (homes×3)",
    "homes": 270
  },
  "fn-fort-severn": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 354,
    "populationNote": "est. community (homes×3)",
    "homes": 118
  },
  "fn-grassy-narrows": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 630,
    "populationNote": "est. community (homes×3)",
    "homes": 210
  },
  "fn-gull-bay": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 291,
    "populationNote": "est. community (homes×3)",
    "homes": 97
  },
  "fn-lac-la-croix": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 324,
    "populationNote": "est. community (homes×3)",
    "homes": 108
  },
  "fn-marten-falls": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 273,
    "populationNote": "est. community (homes×3)",
    "homes": 91
  },
  "fn-mishkeegogamang": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 21,
    "populationNote": "est. community (homes×3)",
    "homes": 7
  },
  "fn-munsee-delaware": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 138,
    "populationNote": "est. community (homes×3)",
    "homes": 46
  },
  "fn-muskrat-dam": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 264,
    "populationNote": "est. community (homes×3)",
    "homes": 88
  },
  "fn-neskantaga": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 228,
    "populationNote": "est. community (homes×3)",
    "homes": 76
  },
  "fn-nibinamik": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 315,
    "populationNote": "est. community (homes×3)",
    "homes": 105
  },
  "fn-north-caribou": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 450,
    "populationNote": "est. community (homes×3)",
    "homes": 150
  },
  "fn-north-spirit": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 285,
    "populationNote": "est. community (homes×3)",
    "homes": 95
  },
  "fn-oneida-thames": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 1650,
    "populationNote": "est. community (homes×3)",
    "homes": 550
  },
  "fn-pikangikum": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 60,
    "populationNote": "est. community (homes×3)",
    "homes": 20
  },
  "fn-sandy-lake": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 1200,
    "populationNote": "est. community (homes×3)",
    "homes": 400
  },
  "fn-seine-river": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 270,
    "populationNote": "est. community (homes×3)",
    "homes": 90
  },
  "fn-shawanaga": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 303,
    "populationNote": "est. community (homes×3)",
    "homes": 101
  },
  "fn-slate-falls": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 180,
    "populationNote": "est. community (homes×3)",
    "homes": 60
  },
  "fn-wabauskang": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 135,
    "populationNote": "est. community (homes×3)",
    "homes": 45
  },
  "fn-wawakapewin": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC LTDWA homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 45,
    "populationNote": "est. community (homes×3)",
    "homes": 15
  },
  "fn-st-metepenagiag-mi-kmaq-nation": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "Atlantic Indigenous regional proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 240,
    "populationNote": "est. community (homes×3)",
    "homes": 80
  },
  "fn-st-miawpukek": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "Atlantic Indigenous regional proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 450,
    "populationNote": "est. community (homes×3)",
    "homes": 150
  },
  "fn-st-tobique": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "Atlantic Indigenous regional proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-st-innu-essipit": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "QC Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 240,
    "populationNote": "est. community (homes×3)",
    "homes": 80
  },
  "fn-st-biigtigong-nishnaabeg": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 240,
    "populationNote": "est. community (homes×3)",
    "homes": 80
  },
  "fn-st-chapleau-ojibway": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 120,
    "populationNote": "est. community (homes×3)",
    "homes": 40
  },
  "fn-st-deer-lake": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 450,
    "populationNote": "est. community (homes×3)",
    "homes": 150
  },
  "fn-st-dokis": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 240,
    "populationNote": "est. community (homes×3)",
    "homes": 80
  },
  "fn-st-fort-albany": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 1200,
    "populationNote": "est. community (homes×3)",
    "homes": 400
  },
  "fn-st-kee-way-win": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 450,
    "populationNote": "est. community (homes×3)",
    "homes": 150
  },
  "fn-st-kitchenuhmaykoosib-inninuwug": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 120,
    "populationNote": "est. community (homes×3)",
    "homes": 40
  },
  "fn-st-mishkeegogamang": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 1200,
    "populationNote": "est. community (homes×3)",
    "homes": 400
  },
  "fn-st-moravian-of-the-thames": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 450,
    "populationNote": "est. community (homes×3)",
    "homes": 150
  },
  "fn-st-six-nations-of-the-grand-river": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-st-wabaseemoong-independent-nations": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 450,
    "populationNote": "est. community (homes×3)",
    "homes": 150
  },
  "fn-st-whitesand": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "ON Indigenous / remote northern proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 240,
    "populationNote": "est. community (homes×3)",
    "homes": 80
  },
  "fn-st-birdtail-sioux": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "MB Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-st-black-river": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "MB Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 450,
    "populationNote": "est. community (homes×3)",
    "homes": 150
  },
  "fn-st-bloodvein": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "MB Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 1200,
    "populationNote": "est. community (homes×3)",
    "homes": 400
  },
  "fn-st-god-s-lake": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "MB Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 240,
    "populationNote": "est. community (homes×3)",
    "homes": 80
  },
  "fn-st-lake-manitoba": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "MB Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 1200,
    "populationNote": "est. community (homes×3)",
    "homes": 400
  },
  "fn-st-sandy-bay": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "MB Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 1200,
    "populationNote": "est. community (homes×3)",
    "homes": 400
  },
  "fn-st-sayisi-dene": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "MB Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 240,
    "populationNote": "est. community (homes×3)",
    "homes": 80
  },
  "fn-st-waywayseecappo-treaty-four-1874": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "MB Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-st-canoe-lake-cree": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "SK Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 450,
    "populationNote": "est. community (homes×3)",
    "homes": 150
  },
  "fn-st-george-gordon-first-nation": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "SK Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 240,
    "populationNote": "est. community (homes×3)",
    "homes": 80
  },
  "fn-st-makwa-sahgaiehcan": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "SK Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 1200,
    "populationNote": "est. community (homes×3)",
    "homes": 400
  },
  "fn-st-montreal-lake-cree-nation-lac-la-ronge": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "SK Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 240,
    "populationNote": "est. community (homes×3)",
    "homes": 80
  },
  "fn-st-moosomin": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "SK Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 1200,
    "populationNote": "est. community (homes×3)",
    "homes": 400
  },
  "fn-st-peter-ballantyne": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "SK Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 450,
    "populationNote": "est. community (homes×3)",
    "homes": 150
  },
  "fn-st-red-pheasant": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "SK Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 240,
    "populationNote": "est. community (homes×3)",
    "homes": 80
  },
  "fn-st-beaver-lake-cree-nation": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "AB Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-st-cold-lake": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "AB Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 120,
    "populationNote": "est. community (homes×3)",
    "homes": 40
  },
  "fn-st-samson-cree-nation-pigeon-lake": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "AB Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 120,
    "populationNote": "est. community (homes×3)",
    "homes": 40
  },
  "fn-st-stoney": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "AB Indigenous regional median proxy — not band-specific",
    "source": "ISC short-term homes ×3 est. + provincial Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-bc-canim-lake-tsq-scen": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 120,
    "populationNote": "est. community (homes×3)",
    "homes": 40
  },
  "fn-bc-dzawada-enux-w-first-nation": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 180,
    "populationNote": "est. community (homes×3)",
    "homes": 60
  },
  "fn-bc-leq-mel-first-nation": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 120,
    "populationNote": "est. community (homes×3)",
    "homes": 40
  },
  "fn-bc-lhtako-dene-nation": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 180,
    "populationNote": "est. community (homes×3)",
    "homes": 60
  },
  "fn-bc-nak-azdli-whut-en": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 45,
    "populationNote": "est. community (homes×3)",
    "homes": 15
  },
  "fn-bc-splats-in": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 45,
    "populationNote": "est. community (homes×3)",
    "homes": 15
  },
  "fn-bc-t-it-q-et": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 45,
    "populationNote": "est. community (homes×3)",
    "homes": 15
  },
  "fn-bc-tsal-alh": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 120,
    "populationNote": "est. community (homes×3)",
    "homes": 40
  },
  "fn-bc-williams-lake-first-nation-t-exelc": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-bc-yekooche-first-nation": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 120,
    "populationNote": "est. community (homes×3)",
    "homes": 40
  },
  "fn-bc-adams-lake-indian-band": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 75,
    "populationNote": "est. community (homes×3)",
    "homes": 25
  },
  "fn-bc-ahousaht": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-bc-cowichan-tribes": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-bc-gitga-at-first-nation": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 180,
    "populationNote": "est. community (homes×3)",
    "homes": 60
  },
  "fn-bc-lower-kootenay-yaqan-nu-kiy": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 45,
    "populationNote": "est. community (homes×3)",
    "homes": 15
  },
  "fn-bc-lower-similkameen": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-bc-lytton-tl-kemstin-first-nation": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 45,
    "populationNote": "est. community (homes×3)",
    "homes": 15
  },
  "fn-bc-n-quatqua": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 45,
    "populationNote": "est. community (homes×3)",
    "homes": 15
  },
  "fn-bc-shuswap-band-kenp-sq-t": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 45,
    "populationNote": "est. community (homes×3)",
    "homes": 15
  },
  "fn-bc-soowahlie-first-nation": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 75,
    "populationNote": "est. community (homes×3)",
    "homes": 25
  },
  "fn-bc-stswecem-c-xget-tem-first-nation": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-bc-yuu-u-i-at-government": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-bc-heiltsuk": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 45,
    "populationNote": "est. community (homes×3)",
    "homes": 15
  },
  "fn-bc-lil-wat-nation": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "fn-bc-tl-etinqox-government": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "population": 45,
    "populationNote": "est. community (homes×3)",
    "homes": 15
  },
  "fn-bc-ulkatcho-first-nation": {
    "incomeBand": "CAD low–moderate",
    "incomeNote": "BC Indigenous regional median proxy — not band-specific",
    "source": "FNHA BC homes ×3 est. + BC Indigenous income proxy",
    "sourceUrl": "https://www.sac-isc.gc.ca/",
    "populationNote": "homes unknown — see systems"
  },
  "usa-navajo-thoreau": {
    "population": 1900,
    "populationNote": "est. CDP / chapter area",
    "incomeBand": "USD low (tribal area proxy)",
    "incomeNote": "Navajo Nation area ACS proxy — not household survey",
    "source": "US Census CDP / DigDeep context",
    "sourceUrl": "https://www.census.gov/"
  },
  "usa-navajo-shiprock": {
    "population": 7700,
    "populationNote": "est. CDP",
    "incomeBand": "USD low (tribal area proxy)",
    "incomeNote": "Navajo Nation area ACS proxy",
    "source": "US Census CDP approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "usa-navajo-dilkon": {
    "population": 1200,
    "populationNote": "est. chapter area",
    "incomeBand": "USD low (tribal area proxy)",
    "incomeNote": "Navajo Nation area ACS proxy",
    "source": "chapter / Census approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "usa-navajo-crownpoint": {
    "population": 2500,
    "populationNote": "est. CDP / chapter",
    "incomeBand": "USD low (tribal area proxy)",
    "incomeNote": "Navajo Nation area ACS proxy",
    "source": "US Census approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "usa-oglala-pine-ridge": {
    "population": 19000,
    "populationNote": "est. reservation population (range)",
    "incomeBand": "USD low (reservation ACS proxy)",
    "incomeNote": "reservation ACS proxy — high poverty share",
    "source": "US Census / BIA approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "usa-jackson-ms": {
    "population": 150000,
    "populationNote": "est. city",
    "incomeBand": "USD median household ~$40–50k",
    "incomeNote": "city ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "usa-flint-mi": {
    "population": 80000,
    "populationNote": "est. city",
    "incomeBand": "USD median household ~$30–40k",
    "incomeNote": "city ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "usa-ak-kivalina": {
    "population": 450,
    "populationNote": "est. village",
    "incomeBand": "USD low–moderate (rural Alaska proxy)",
    "incomeNote": "ANV / borough proxy — not household survey",
    "source": "Alaska DCRA / Census approx",
    "sourceUrl": "https://www.commerce.alaska.gov/web/dcra/"
  },
  "usa-ak-shishmaref": {
    "population": 560,
    "populationNote": "est. village",
    "incomeBand": "USD low–moderate (rural Alaska proxy)",
    "incomeNote": "ANV proxy",
    "source": "Alaska DCRA / Census approx",
    "sourceUrl": "https://www.commerce.alaska.gov/web/dcra/"
  },
  "usa-ak-newtok": {
    "population": 380,
    "populationNote": "est. village (relocating)",
    "incomeBand": "USD low–moderate (rural Alaska proxy)",
    "incomeNote": "ANV proxy",
    "source": "Alaska DCRA approx",
    "sourceUrl": "https://www.commerce.alaska.gov/web/dcra/"
  },
  "usa-ak-chefornak": {
    "population": 440,
    "populationNote": "est. village",
    "incomeBand": "USD low–moderate (rural Alaska proxy)",
    "incomeNote": "ANV proxy",
    "source": "Alaska DCRA / Census approx",
    "sourceUrl": "https://www.commerce.alaska.gov/web/dcra/"
  },
  "usa-ak-kipnuk": {
    "population": 700,
    "populationNote": "est. village",
    "incomeBand": "USD low–moderate (rural Alaska proxy)",
    "incomeNote": "ANV proxy",
    "source": "Alaska DCRA / Census approx",
    "sourceUrl": "https://www.commerce.alaska.gov/web/dcra/"
  },
  "aus-yuendumu": {
    "population": 750,
    "populationNote": "est. community",
    "incomeBand": "AUD low (remote Aboriginal proxy)",
    "incomeNote": "NT remote community proxy — not household survey",
    "source": "ABS / NT Health community approx",
    "sourceUrl": "https://www.abs.gov.au/"
  },
  "aus-willowra": {
    "population": 300,
    "populationNote": "est. community",
    "incomeBand": "AUD low (remote Aboriginal proxy)",
    "incomeNote": "NT remote proxy",
    "source": "ABS / NT community approx",
    "sourceUrl": "https://www.abs.gov.au/"
  },
  "aus-laramba": {
    "population": 300,
    "populationNote": "est. community",
    "incomeBand": "AUD low (remote Aboriginal proxy)",
    "incomeNote": "NT remote proxy",
    "source": "ABS / NT community approx",
    "sourceUrl": "https://www.abs.gov.au/"
  },
  "aus-kiwirrkurra": {
    "population": 180,
    "populationNote": "est. community",
    "incomeBand": "AUD low (remote Aboriginal proxy)",
    "incomeNote": "WA remote proxy",
    "source": "ABS community approx",
    "sourceUrl": "https://www.abs.gov.au/"
  },
  "aus-pandanus-park": {
    "population": 100,
    "populationNote": "est. ~100 residents (source note)",
    "incomeBand": "AUD low (remote Aboriginal proxy)",
    "incomeNote": "WA remote proxy",
    "source": "community reporting / ABS",
    "sourceUrl": "https://www.abs.gov.au/"
  },
  "aus-warburton": {
    "population": 450,
    "populationNote": "est. community",
    "incomeBand": "AUD low (remote Aboriginal proxy)",
    "incomeNote": "WA Ngaanyatjarra proxy",
    "source": "ABS community approx",
    "sourceUrl": "https://www.abs.gov.au/"
  },
  "aus-angurugu": {
    "population": 800,
    "populationNote": "est. community",
    "incomeBand": "AUD low–moderate (remote Aboriginal proxy)",
    "incomeNote": "NT Groote Eylandt proxy",
    "source": "ABS / NT approx",
    "sourceUrl": "https://www.abs.gov.au/"
  },
  "ki-south-tarawa": {
    "population": 63000,
    "populationNote": "est. urban atoll",
    "incomeBand": "AUD/AUD-equivalent low–lower-middle (national)",
    "incomeNote": "national GNI proxy",
    "source": "Kiribati NSO / UN approx",
    "sourceUrl": "https://data.unicef.org/"
  },
  "tv-funafuti": {
    "population": 7000,
    "populationNote": "est. atoll capital",
    "incomeBand": "AUD low–lower-middle (national)",
    "incomeNote": "national GNI proxy",
    "source": "Tuvalu / UN approx",
    "sourceUrl": "https://data.unicef.org/"
  },
  "mh-majuro": {
    "population": 28000,
    "populationNote": "est. atoll urban",
    "incomeBand": "USD low–lower-middle (national)",
    "incomeNote": "national GNI proxy",
    "source": "RMI / UN approx",
    "sourceUrl": "https://data.unicef.org/"
  },
  "gl-qaanaaq": {
    "population": 600,
    "populationNote": "est. settlement",
    "incomeBand": "DKK middle (Greenland municipal proxy)",
    "incomeNote": "municipal proxy — Arctic cost of living high",
    "source": "Statistics Greenland approx",
    "sourceUrl": "https://stat.gl/"
  },
  "gl-kullorsuaq": {
    "population": 450,
    "populationNote": "est. settlement",
    "incomeBand": "DKK middle (Greenland municipal proxy)",
    "incomeNote": "municipal proxy",
    "source": "Statistics Greenland approx",
    "sourceUrl": "https://stat.gl/"
  },
  "pe-shipibo-canaan": {
    "population": 600,
    "populationNote": "est. ~150 families (source note)",
    "incomeBand": "PEN low (Amazon Indigenous proxy)",
    "incomeNote": "regional Indigenous proxy — not village survey",
    "source": "Mongabay / community reporting",
    "sourceUrl": "https://news.mongabay.com/"
  },
  "br-yanomami-surucucu": {
    "populationNote": "multi-village territory — pop. varies",
    "incomeBand": "BRL low (Amazon Indigenous proxy)",
    "incomeNote": "territorial proxy — not village survey",
    "source": "Funai / Funasa context",
    "sourceUrl": "https://www.gov.br/funasa/"
  },
  "nz-havelock-north": {
    "population": 15000,
    "populationNote": "est. town",
    "incomeBand": "NZD middle (regional proxy)",
    "incomeNote": "Hawke's Bay regional proxy",
    "source": "Stats NZ approx",
    "sourceUrl": "https://www.stats.govt.nz/"
  },
  "usa-mcdowell-wv": {
    "population": 18000,
    "populationNote": "est. county",
    "incomeBand": "USD low (Appalachia county ACS)",
    "incomeNote": "county ACS proxy",
    "source": "US Census ACS approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "usa-hopi-kykotsmovi": {
    "population": 7000,
    "populationNote": "est. Hopi Reservation (range)",
    "incomeBand": "USD low (tribal area proxy)",
    "incomeNote": "reservation ACS proxy",
    "source": "US Census / Hopi Tribe approx",
    "sourceUrl": "https://www.census.gov/"
  },
  "mx-yaqui-vicam": {
    "population": 10000,
    "populationNote": "est. pueblo / municipio area",
    "incomeBand": "MXN low–lower-middle (Indigenous regional proxy)",
    "incomeNote": "Sonora Indigenous regional proxy",
    "source": "INEGI approx",
    "sourceUrl": "https://www.inegi.org.mx/"
  }
};

window.DEWFALL_SITE_SOCIO_META = {
  count: 160,
  drought: 31,
  fn: 99,
  world: 30,
  note: "Estimates and regional proxies only — not a credit check or household survey."
};
