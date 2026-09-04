/**
 * DEWFALL Globe — funding organizations / programs that could support
 * water access, Indigenous infrastructure, or drought-resilience markets.
 *
 * Real named programs only. URLs are public homepages.
 * Match helpers: geographies + themes scored in app.js fundersForSite().
 */
window.DEWFALL_FUNDERS = [
  // —— Canada FN / Indigenous ——
  {
    id: 'isc-canada-water',
    name: 'Indigenous Services Canada — water & wastewater',
    kind: 'government',
    geographies: ['CAN', 'Canada', 'FN', 'MB', 'ON', 'SK', 'AB', 'BC', 'QC', 'NB', 'NL'],
    themes: ['indigenous', 'water', 'infrastructure', 'need'],
    url: 'https://www.sac-isc.gc.ca/',
    note: 'Federal FN water systems / LTDWA ending support'
  },
  {
    id: 'cirnac',
    name: 'Crown-Indigenous Relations (CIRNAC)',
    kind: 'government',
    geographies: ['CAN', 'Canada', 'FN'],
    themes: ['indigenous', 'infrastructure', 'need'],
    url: 'https://www.rcaanc-cirnac.gc.ca/',
    note: 'Modern treaties, self-government, northern infrastructure'
  },
  {
    id: 'cmhc-indigenous',
    name: 'CMHC — Indigenous housing & infrastructure',
    kind: 'government',
    geographies: ['CAN', 'Canada', 'FN'],
    themes: ['indigenous', 'housing', 'infrastructure', 'need'],
    url: 'https://www.cmhc-schl.gc.ca/',
    note: 'On-reserve / urban Indigenous housing programs'
  },
  {
    id: 'fcm-gmf',
    name: 'FCM Green Municipal Fund',
    kind: 'government',
    geographies: ['CAN', 'Canada'],
    themes: ['municipal', 'climate', 'water', 'infrastructure', 'drought'],
    url: 'https://greenmunicipalfund.ca/',
    note: 'Municipal climate / water infrastructure grants'
  },
  {
    id: 'cleanbc',
    name: 'CleanBC / BC climate & water programs',
    kind: 'government',
    geographies: ['CAN', 'Canada', 'BC', 'FN'],
    themes: ['climate', 'water', 'infrastructure', 'indigenous'],
    url: 'https://cleanbc.gov.bc.ca/',
    note: 'Provincial climate adaptation & community funding'
  },
  {
    id: 'fnfa',
    name: 'First Nations Finance Authority',
    kind: 'finance',
    geographies: ['CAN', 'Canada', 'FN'],
    themes: ['indigenous', 'infrastructure', 'finance', 'need'],
    url: 'https://www.fnfa.ca/',
    note: 'Borrowing for FN capital / infrastructure'
  },
  {
    id: 'waterfirst',
    name: 'Water First (Canada)',
    kind: 'ngo',
    geographies: ['CAN', 'Canada', 'FN', 'ON'],
    themes: ['indigenous', 'water', 'need', 'wash'],
    url: 'https://waterfirst.ngo/',
    note: 'FN water operator training & community projects'
  },

  // —— US tribal / Indigenous ——
  {
    id: 'ihs-sfc',
    name: 'IHS Sanitation Facilities Construction',
    kind: 'government',
    geographies: ['US', 'USA', 'tribal', 'Navajo', 'Alaska', 'AZ', 'NM', 'SD', 'NE', 'KS'],
    themes: ['indigenous', 'water', 'infrastructure', 'need', 'wash'],
    url: 'https://www.ihs.gov/dsfc/',
    note: 'Tribal water / sewer facility construction'
  },
  {
    id: 'epa-dwsrf',
    name: 'EPA Drinking Water SRF (tribal set-asides)',
    kind: 'government',
    geographies: ['US', 'USA', 'tribal'],
    themes: ['indigenous', 'water', 'infrastructure', 'need', 'municipal'],
    url: 'https://www.epa.gov/dwsrf',
    note: 'State revolving funds + tribal set-asides'
  },
  {
    id: 'usda-rd',
    name: 'USDA Rural Development — water & waste',
    kind: 'government',
    geographies: ['US', 'USA', 'tribal', 'Alaska', 'Appalachia'],
    themes: ['rural', 'water', 'infrastructure', 'need', 'municipal'],
    url: 'https://www.rd.usda.gov/',
    note: 'Rural / tribal water & wastewater loans & grants'
  },
  {
    id: 'usbr-navajo-gallup',
    name: 'Bureau of Reclamation — Navajo-Gallup',
    kind: 'government',
    geographies: ['US', 'USA', 'Navajo', 'NM', 'AZ', 'tribal'],
    themes: ['indigenous', 'water', 'infrastructure', 'need'],
    url: 'https://www.usbr.gov/uc/progact/navajo-gallup/index.html',
    note: 'San Juan / Cutter lateral pipeline context'
  },
  {
    id: 'digdeep',
    name: 'DigDeep — Navajo Water Project',
    kind: 'ngo',
    geographies: ['US', 'USA', 'Navajo', 'AZ', 'NM', 'UT', 'tribal'],
    themes: ['indigenous', 'water', 'need', 'wash'],
    url: 'https://www.digdeep.org/',
    note: 'Implementer for off-grid Navajo home water systems'
  },
  {
    id: 'waterorg-us',
    name: 'Water.org',
    kind: 'ngo',
    geographies: ['global', 'US', 'USA', 'LatAm', 'Africa'],
    themes: ['water', 'wash', 'finance', 'need'],
    url: 'https://water.org/',
    note: 'WaterCredit / microfinance for household water'
  },

  // —— US drought metros (commercial / municipal) ——
  {
    id: 'doe-water',
    name: 'US DOE — water & energy programs',
    kind: 'government',
    geographies: ['US', 'USA', 'AZ', 'CA', 'NV', 'TX', 'CO', 'UT'],
    themes: ['drought', 'climate', 'commercial', 'energy', 'municipal'],
    url: 'https://www.energy.gov/',
    note: 'Energy–water nexus R&D and deployment'
  },
  {
    id: 'ca-water-boards',
    name: 'California State Water Boards',
    kind: 'government',
    geographies: ['US', 'USA', 'CA', 'California'],
    themes: ['drought', 'water', 'municipal', 'commercial'],
    url: 'https://www.waterboards.ca.gov/',
    note: 'State drought / drinking-water / recycled-water programs'
  },
  {
    id: 'az-water',
    name: 'Arizona Department of Water Resources',
    kind: 'government',
    geographies: ['US', 'USA', 'AZ', 'Arizona'],
    themes: ['drought', 'water', 'municipal', 'commercial'],
    url: 'https://www.azwater.gov/',
    note: 'State drought planning & water management'
  },
  {
    id: 'muni-procurement',
    name: 'Municipal / commercial procurement',
    kind: 'commercial',
    geographies: ['US', 'USA', 'global', 'AU', 'Australia', 'MX', 'Mexico', 'CL', 'Chile', 'AE', 'SA', 'IL', 'ES', 'ZA'],
    themes: ['drought', 'commercial', 'municipal', 'procurement'],
    url: 'https://www.gsa.gov/',
    note: 'Not only grants — metro buyers & utility RFPs'
  },

  // —— Australia remote Aboriginal ——
  {
    id: 'niaa',
    name: 'NIAA — Closing the Gap water',
    kind: 'government',
    geographies: ['AU', 'Australia', 'NT', 'WA', 'Aboriginal'],
    themes: ['indigenous', 'water', 'need', 'infrastructure'],
    url: 'https://www.niaa.gov.au/',
    note: 'National Indigenous Australians Agency programs'
  },
  {
    id: 'power-water-nt',
    name: 'Power and Water Corporation (NT)',
    kind: 'government',
    geographies: ['AU', 'Australia', 'NT', 'Northern Territory'],
    themes: ['water', 'infrastructure', 'indigenous', 'need', 'municipal'],
    url: 'https://www.powerwater.com.au/',
    note: 'Remote community water services in NT'
  },
  {
    id: 'wa-watercorp',
    name: 'Water Corporation (WA)',
    kind: 'government',
    geographies: ['AU', 'Australia', 'WA', 'Western Australia'],
    themes: ['water', 'infrastructure', 'indigenous', 'need', 'municipal', 'drought'],
    url: 'https://www.watercorporation.com.au/',
    note: 'Remote Aboriginal community water services'
  },
  {
    id: 'closing-the-gap',
    name: 'Closing the Gap — water security',
    kind: 'government',
    geographies: ['AU', 'Australia', 'Aboriginal'],
    themes: ['indigenous', 'water', 'need'],
    url: 'https://www.closingthegap.gov.au/',
    note: 'National Agreement outcomes on essential services'
  },

  // —— LatAm Indigenous ——
  {
    id: 'idb-water',
    name: 'Inter-American Development Bank — water',
    kind: 'mdb',
    geographies: ['LatAm', 'BR', 'Brazil', 'PE', 'Peru', 'BO', 'Bolivia', 'MX', 'Mexico', 'CL', 'Chile'],
    themes: ['water', 'infrastructure', 'indigenous', 'need', 'climate'],
    url: 'https://www.iadb.org/',
    note: 'Regional water & sanitation lending'
  },
  {
    id: 'caf-banco',
    name: 'CAF — Development Bank of Latin America',
    kind: 'mdb',
    geographies: ['LatAm', 'PE', 'Peru', 'BO', 'Bolivia', 'MX', 'Mexico', 'CL', 'Chile', 'BR', 'Brazil'],
    themes: ['water', 'infrastructure', 'climate', 'need'],
    url: 'https://www.caf.com/',
    note: 'Water / climate infrastructure finance'
  },
  {
    id: 'funasa-br',
    name: 'Funasa (Brazil) — Indigenous health & WASH',
    kind: 'government',
    geographies: ['BR', 'Brazil', 'Yanomami', 'Amazon'],
    themes: ['indigenous', 'water', 'wash', 'need'],
    url: 'https://www.gov.br/funasa/',
    note: 'Federal Indigenous sanitation / health infrastructure'
  },
  {
    id: 'who-wash',
    name: 'WHO / UNICEF JMP — WASH',
    kind: 'un',
    geographies: ['global', 'Africa', 'LatAm', 'Pacific'],
    themes: ['wash', 'water', 'need', 'global'],
    url: 'https://washdata.org/',
    note: 'Global monitoring; entry to UN WASH programs'
  },

  // —— Africa ——
  {
    id: 'afdb-water',
    name: 'African Development Bank — water',
    kind: 'mdb',
    geographies: ['Africa', 'ZA', 'South Africa', 'BW', 'Botswana', 'TZ', 'Tanzania', 'NA', 'Namibia'],
    themes: ['water', 'infrastructure', 'climate', 'need'],
    url: 'https://www.afdb.org/',
    note: 'Regional water & sanitation investments'
  },
  {
    id: 'unicef-wash',
    name: 'UNICEF WASH',
    kind: 'un',
    geographies: ['global', 'Africa', 'Pacific', 'LatAm'],
    themes: ['wash', 'water', 'need', 'global'],
    url: 'https://www.unicef.org/wash',
    note: 'Country WASH programmes & emergencies'
  },

  // —— Global climate / water ——
  {
    id: 'gcf',
    name: 'Green Climate Fund',
    kind: 'climate',
    geographies: ['global'],
    themes: ['climate', 'adaptation', 'water', 'drought', 'global'],
    url: 'https://www.greenclimate.fund/',
    note: 'Climate adaptation & resilience finance'
  },
  {
    id: 'adaptation-fund',
    name: 'Adaptation Fund',
    kind: 'climate',
    geographies: ['global'],
    themes: ['climate', 'adaptation', 'water', 'drought', 'global'],
    url: 'https://www.adaptation-fund.org/',
    note: 'UNFCCC adaptation projects incl. water security'
  },
  {
    id: 'worldbank-water',
    name: 'World Bank — Water Global Practice',
    kind: 'mdb',
    geographies: ['global'],
    themes: ['water', 'infrastructure', 'climate', 'need', 'global'],
    url: 'https://www.worldbank.org/en/topic/water',
    note: 'Country water & sanitation lending'
  },
  {
    id: 'wateraid',
    name: 'WaterAid',
    kind: 'ngo',
    geographies: ['global', 'Africa', 'Pacific', 'AU', 'Australia'],
    themes: ['wash', 'water', 'need', 'global'],
    url: 'https://www.wateraid.org/',
    note: 'NGO WASH delivery & advocacy'
  },
  {
    id: 'gef',
    name: 'Global Environment Facility',
    kind: 'climate',
    geographies: ['global'],
    themes: ['climate', 'water', 'adaptation', 'global'],
    url: 'https://www.thegef.org/',
    note: 'GEF international waters & climate windows'
  }
];

window.DEWFALL_FUNDERS_META = {
  count: window.DEWFALL_FUNDERS.length,
  note: 'Starting-point funders/programs only — not commitments or eligibility advice. Prefer official portals.'
};
