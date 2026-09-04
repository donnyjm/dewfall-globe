/**
 * DEWFALL Globe — curated climate normals for representative cities.
 * Values are approximate annual / summer / winter climate normals
 * (dry-bulb °C, RH fraction) drawn from published normals (NOAA, ECCC,
 * WMO-style station climate). Dew point is computed in yield.js.
 * NOT live weather. Model-input only.
 */
window.DEWFALL_CITIES = [
  // —— Pacific Northwest / HQ ——
  { id:"north-vancouver", name:"North Vancouver", region:"BC, Canada", market:"HQ / temperate coastal", lat:49.32, lng:-123.07,
    climate:{ annual:{T:10.5,RH:0.78}, summer:{T:17.5,RH:0.72}, winter:{T:4.0,RH:0.84} }, note:"DEWFALL home base · cool marine air" },
  { id:"vancouver", name:"Vancouver", region:"BC, Canada", market:"temperate coastal", lat:49.28, lng:-123.12,
    climate:{ annual:{T:10.4,RH:0.79}, summer:{T:17.8,RH:0.71}, winter:{T:4.1,RH:0.85} }, note:"Mild wet winters · modest dew points" },
  { id:"seattle", name:"Seattle", region:"WA, USA", market:"temperate coastal", lat:47.61, lng:-122.33,
    climate:{ annual:{T:11.4,RH:0.75}, summer:{T:18.5,RH:0.65}, winter:{T:5.5,RH:0.82} }, note:"PNW marine · similar to Vancouver" },
  { id:"portland", name:"Portland", region:"OR, USA", market:"temperate", lat:45.52, lng:-122.68,
    climate:{ annual:{T:12.5,RH:0.72}, summer:{T:20.5,RH:0.58}, winter:{T:5.5,RH:0.82} }, note:"Drier summers than coast" },

  // —— US Southwest (drought demand · TEC/sorbent assist) ——
  { id:"phoenix", name:"Phoenix", region:"AZ, USA", market:"US Southwest arid", lat:33.45, lng:-112.07,
    climate:{ annual:{T:24.0,RH:0.36}, summer:{T:34.5,RH:0.28}, winter:{T:13.5,RH:0.48} }, note:"Extreme drought demand · low AH · TEC branch critical" },
  { id:"tucson", name:"Tucson", region:"AZ, USA", market:"US Southwest arid", lat:32.22, lng:-110.97,
    climate:{ annual:{T:21.5,RH:0.38}, summer:{T:31.5,RH:0.35}, winter:{T:12.0,RH:0.45} }, note:"Monsoon bumps summer RH slightly" },
  { id:"las-vegas", name:"Las Vegas", region:"NV, USA", market:"US Southwest arid", lat:36.17, lng:-115.14,
    climate:{ annual:{T:20.5,RH:0.30}, summer:{T:33.0,RH:0.20}, winter:{T:9.5,RH:0.42} }, note:"Very dry · high solar for Tier 5 TEC" },
  { id:"albuquerque", name:"Albuquerque", region:"NM, USA", market:"US Southwest arid", lat:35.08, lng:-106.65,
    climate:{ annual:{T:14.5,RH:0.42}, summer:{T:25.5,RH:0.35}, winter:{T:3.5,RH:0.52} }, note:"High desert · cold winters limit fridge core" },
  { id:"el-paso", name:"El Paso", region:"TX, USA", market:"US Southwest arid", lat:31.76, lng:-106.49,
    climate:{ annual:{T:18.5,RH:0.40}, summer:{T:28.5,RH:0.38}, winter:{T:8.5,RH:0.48} }, note:"Chihuahuan desert fringe" },
  { id:"yuma", name:"Yuma", region:"AZ, USA", market:"US Southwest arid", lat:32.69, lng:-114.63,
    climate:{ annual:{T:24.5,RH:0.35}, summer:{T:35.0,RH:0.30}, winter:{T:14.0,RH:0.42} }, note:"Hottest US city class · solar-rich" },

  // —— California / Mediterranean ——
  { id:"los-angeles", name:"Los Angeles", region:"CA, USA", market:"Mediterranean coastal", lat:34.05, lng:-118.24,
    climate:{ annual:{T:18.5,RH:0.65}, summer:{T:22.5,RH:0.68}, winter:{T:14.0,RH:0.62} }, note:"Marine layer · moderate year-round yield" },
  { id:"san-diego", name:"San Diego", region:"CA, USA", market:"Mediterranean coastal", lat:32.72, lng:-117.16,
    climate:{ annual:{T:17.8,RH:0.68}, summer:{T:21.5,RH:0.72}, winter:{T:14.0,RH:0.65} }, note:"Cool coastal humidity · steady" },
  { id:"san-francisco", name:"San Francisco", region:"CA, USA", market:"cool coastal", lat:37.77, lng:-122.42,
    climate:{ annual:{T:14.0,RH:0.74}, summer:{T:16.5,RH:0.75}, winter:{T:11.0,RH:0.76} }, note:"Cool fog · lower fridge COP" },
  { id:"sacramento", name:"Sacramento", region:"CA, USA", market:"inland Mediterranean", lat:38.58, lng:-121.49,
    climate:{ annual:{T:16.5,RH:0.58}, summer:{T:26.0,RH:0.42}, winter:{T:8.5,RH:0.75} }, note:"Hot dry summers · wet winters" },

  // —— Gulf / Southeast humid (high yield) ——
  { id:"miami", name:"Miami", region:"FL, USA", market:"coastal humid", lat:25.76, lng:-80.19,
    climate:{ annual:{T:25.0,RH:0.74}, summer:{T:28.5,RH:0.76}, winter:{T:20.5,RH:0.72} }, note:"Flagship humid yield market" },
  { id:"tampa", name:"Tampa", region:"FL, USA", market:"coastal humid", lat:27.95, lng:-82.46,
    climate:{ annual:{T:23.0,RH:0.74}, summer:{T:28.0,RH:0.76}, winter:{T:17.0,RH:0.72} }, note:"Gulf humidity · strong summer" },
  { id:"key-west", name:"Key West", region:"FL, USA", market:"coastal humid", lat:24.56, lng:-81.78,
    climate:{ annual:{T:25.5,RH:0.76}, summer:{T:28.5,RH:0.76}, winter:{T:21.5,RH:0.74} }, note:"Tropical marine · top-tier AH" },
  { id:"new-orleans", name:"New Orleans", region:"LA, USA", market:"coastal humid", lat:29.95, lng:-90.07,
    climate:{ annual:{T:21.0,RH:0.76}, summer:{T:28.0,RH:0.78}, winter:{T:12.5,RH:0.74} }, note:"Very humid Gulf · high summer yield" },
  { id:"houston", name:"Houston", region:"TX, USA", market:"coastal humid", lat:29.76, lng:-95.37,
    climate:{ annual:{T:21.0,RH:0.74}, summer:{T:29.0,RH:0.74}, winter:{T:12.5,RH:0.72} }, note:"Gulf moisture · large residential market" },
  { id:"jacksonville", name:"Jacksonville", region:"FL, USA", market:"coastal humid", lat:30.33, lng:-81.66,
    climate:{ annual:{T:20.5,RH:0.74}, summer:{T:27.5,RH:0.76}, winter:{T:13.0,RH:0.72} }, note:"SE Atlantic humid" },
  { id:"charleston", name:"Charleston", region:"SC, USA", market:"coastal humid", lat:32.78, lng:-79.93,
    climate:{ annual:{T:19.0,RH:0.74}, summer:{T:27.5,RH:0.76}, winter:{T:10.5,RH:0.70} }, note:"Atlantic Lowcountry humidity" },
  { id:"atlanta", name:"Atlanta", region:"GA, USA", market:"humid subtropical", lat:33.75, lng:-84.39,
    climate:{ annual:{T:16.5,RH:0.68}, summer:{T:26.5,RH:0.70}, winter:{T:6.5,RH:0.66} }, note:"Inland humid · cooler winters" },

  // —— Hawaii / Pacific ——
  { id:"honolulu", name:"Honolulu", region:"HI, USA", market:"tropical coastal", lat:21.31, lng:-157.86,
    climate:{ annual:{T:25.5,RH:0.68}, summer:{T:27.5,RH:0.64}, winter:{T:23.0,RH:0.72} }, note:"Trade-wind tropical · excellent year-round" },

  // —— Caribbean / LatAm humid ——
  { id:"san-juan", name:"San Juan", region:"Puerto Rico", market:"tropical coastal", lat:18.47, lng:-66.11,
    climate:{ annual:{T:27.0,RH:0.76}, summer:{T:28.5,RH:0.76}, winter:{T:25.5,RH:0.74} }, note:"Caribbean peak moisture" },
  { id:"cartagena", name:"Cartagena", region:"Colombia", market:"tropical coastal", lat:10.39, lng:-75.51,
    climate:{ annual:{T:28.0,RH:0.80}, summer:{T:28.5,RH:0.82}, winter:{T:27.0,RH:0.78} }, note:"Very high AH · top model yields" },
  { id:"rio", name:"Rio de Janeiro", region:"Brazil", market:"tropical coastal", lat:-22.91, lng:-43.17,
    climate:{ annual:{T:24.0,RH:0.78}, summer:{T:27.5,RH:0.78}, winter:{T:21.0,RH:0.78} }, note:"Atlantic tropical humidity" },
  { id:"cancun", name:"Cancún", region:"Mexico", market:"tropical coastal", lat:21.16, lng:-86.85,
    climate:{ annual:{T:26.5,RH:0.76}, summer:{T:28.5,RH:0.78}, winter:{T:24.0,RH:0.74} }, note:"Yucatán Caribbean coast" },
  { id:"havana", name:"Havana", region:"Cuba", market:"tropical coastal", lat:23.11, lng:-82.37,
    climate:{ annual:{T:25.5,RH:0.78}, summer:{T:28.0,RH:0.80}, winter:{T:22.5,RH:0.76} }, note:"Caribbean humid" },

  // —— Asia tropics / coastal ——
  { id:"singapore", name:"Singapore", region:"Singapore", market:"equatorial humid", lat:1.35, lng:103.82,
    climate:{ annual:{T:27.5,RH:0.84}, summer:{T:28.0,RH:0.84}, winter:{T:26.5,RH:0.84} }, note:"Near-constant high dew point · elite yield" },
  { id:"jakarta", name:"Jakarta", region:"Indonesia", market:"equatorial humid", lat:-6.21, lng:106.85,
    climate:{ annual:{T:27.5,RH:0.80}, summer:{T:27.0,RH:0.82}, winter:{T:28.0,RH:0.78} }, note:"Monsoon tropics" },
  { id:"manila", name:"Manila", region:"Philippines", market:"tropical coastal", lat:14.60, lng:120.98,
    climate:{ annual:{T:27.5,RH:0.78}, summer:{T:28.5,RH:0.80}, winter:{T:26.0,RH:0.74} }, note:"Monsoon coastal · very high AH" },
  { id:"bangkok", name:"Bangkok", region:"Thailand", market:"tropical humid", lat:13.76, lng:100.50,
    climate:{ annual:{T:28.5,RH:0.74}, summer:{T:29.5,RH:0.76}, winter:{T:26.5,RH:0.68} }, note:"Hot humid · strong fridge-core yield" },
  { id:"mumbai", name:"Mumbai", region:"India", market:"tropical coastal", lat:19.08, lng:72.88,
    climate:{ annual:{T:27.5,RH:0.75}, summer:{T:29.0,RH:0.82}, winter:{T:24.5,RH:0.65} }, note:"Monsoon spike · huge coastal market" },
  { id:"chennai", name:"Chennai", region:"India", market:"tropical coastal", lat:13.08, lng:80.27,
    climate:{ annual:{T:28.5,RH:0.72}, summer:{T:32.0,RH:0.62}, winter:{T:25.5,RH:0.76} }, note:"Bay of Bengal humidity" },
  { id:"ho-chi-minh", name:"Ho Chi Minh City", region:"Vietnam", market:"tropical humid", lat:10.82, lng:106.63,
    climate:{ annual:{T:27.5,RH:0.78}, summer:{T:28.5,RH:0.80}, winter:{T:26.0,RH:0.74} }, note:"Mekong delta humidity" },
  { id:"hong-kong", name:"Hong Kong", region:"China", market:"subtropical coastal", lat:22.32, lng:114.17,
    climate:{ annual:{T:23.5,RH:0.78}, summer:{T:28.5,RH:0.82}, winter:{T:16.5,RH:0.72} }, note:"Strong summer monsoon humidity" },
  { id:"tokyo", name:"Tokyo", region:"Japan", market:"humid subtropical", lat:35.68, lng:139.69,
    climate:{ annual:{T:16.0,RH:0.65}, summer:{T:26.0,RH:0.74}, winter:{T:6.0,RH:0.52} }, note:"Humid summers · dry cool winters" },

  // —— Middle East / arid (demand + TEC) ——
  { id:"dubai", name:"Dubai", region:"UAE", market:"hot arid / coastal", lat:25.20, lng:55.27,
    climate:{ annual:{T:28.5,RH:0.52}, summer:{T:36.0,RH:0.50}, winter:{T:20.0,RH:0.58} }, note:"Coastal Gulf humidity + extreme heat · mixed fridge/TEC" },
  { id:"abu-dhabi", name:"Abu Dhabi", region:"UAE", market:"hot arid / coastal", lat:24.45, lng:54.38,
    climate:{ annual:{T:28.0,RH:0.55}, summer:{T:35.5,RH:0.52}, winter:{T:19.5,RH:0.60} }, note:"Similar to Dubai · high solar" },
  { id:"cairo", name:"Cairo", region:"Egypt", market:"arid", lat:30.04, lng:31.24,
    climate:{ annual:{T:22.0,RH:0.55}, summer:{T:28.5,RH:0.48}, winter:{T:14.0,RH:0.62} }, note:"Desert city · Nile humidity fringe" },
  { id:"riyadh", name:"Riyadh", region:"Saudi Arabia", market:"hot arid", lat:24.71, lng:46.68,
    climate:{ annual:{T:26.5,RH:0.28}, summer:{T:36.0,RH:0.18}, winter:{T:15.0,RH:0.42} }, note:"Extreme arid · TEC/sorbent dependent" },

  // —— Africa ——
  { id:"lagos", name:"Lagos", region:"Nigeria", market:"tropical coastal", lat:6.52, lng:3.38,
    climate:{ annual:{T:27.0,RH:0.82}, summer:{T:27.5,RH:0.84}, winter:{T:27.0,RH:0.78} }, note:"Gulf of Guinea · very high AH" },
  { id:"accra", name:"Accra", region:"Ghana", market:"tropical coastal", lat:5.60, lng:-0.19,
    climate:{ annual:{T:27.0,RH:0.80}, summer:{T:26.5,RH:0.82}, winter:{T:28.0,RH:0.76} }, note:"West African humid coast" },
  { id:"nairobi", name:"Nairobi", region:"Kenya", market:"highland temperate", lat:-1.29, lng:36.82,
    climate:{ annual:{T:18.5,RH:0.68}, summer:{T:20.0,RH:0.62}, winter:{T:16.5,RH:0.74} }, note:"Elevation cools · moderate AH" },
  { id:"cape-town", name:"Cape Town", region:"South Africa", market:"Mediterranean", lat:-33.92, lng:18.42,
    climate:{ annual:{T:17.0,RH:0.70}, summer:{T:21.5,RH:0.65}, winter:{T:13.0,RH:0.76} }, note:"SH Mediterranean · winter rainfall" },

  // —— Australia / Oceania ——
  { id:"sydney", name:"Sydney", region:"Australia", market:"humid subtropical coastal", lat:-33.87, lng:151.21,
    climate:{ annual:{T:18.5,RH:0.68}, summer:{T:23.5,RH:0.68}, winter:{T:13.0,RH:0.68} }, note:"Coastal humidity · solid summer yield" },
  { id:"brisbane", name:"Brisbane", region:"Australia", market:"subtropical coastal", lat:-27.47, lng:153.03,
    climate:{ annual:{T:21.0,RH:0.68}, summer:{T:25.5,RH:0.68}, winter:{T:15.5,RH:0.66} }, note:"Warmer than Sydney · good AH" },
  { id:"darwin", name:"Darwin", region:"Australia", market:"tropical monsoonal", lat:-12.46, lng:130.84,
    climate:{ annual:{T:27.5,RH:0.70}, summer:{T:28.5,RH:0.78}, winter:{T:25.5,RH:0.55} }, note:"Wet-season spike · dry-season TEC assist" },
  { id:"auckland", name:"Auckland", region:"New Zealand", market:"temperate maritime", lat:-36.85, lng:174.76,
    climate:{ annual:{T:15.5,RH:0.78}, summer:{T:20.0,RH:0.74}, winter:{T:11.5,RH:0.82} }, note:"Cool maritime · modest fridge yield" },

  // —— Europe / Med ——
  { id:"lisbon", name:"Lisbon", region:"Portugal", market:"Mediterranean coastal", lat:38.72, lng:-9.14,
    climate:{ annual:{T:17.0,RH:0.70}, summer:{T:23.0,RH:0.60}, winter:{T:12.0,RH:0.78} }, note:"Atlantic Med · moderate" },
  { id:"barcelona", name:"Barcelona", region:"Spain", market:"Mediterranean coastal", lat:41.39, lng:2.17,
    climate:{ annual:{T:16.5,RH:0.70}, summer:{T:24.5,RH:0.68}, winter:{T:10.0,RH:0.70} }, note:"Med summer humidity" },
  { id:"athens", name:"Athens", region:"Greece", market:"Mediterranean", lat:37.98, lng:23.73,
    climate:{ annual:{T:18.5,RH:0.60}, summer:{T:28.0,RH:0.48}, winter:{T:10.0,RH:0.70} }, note:"Hot dry summers · winter moisture" },
  { id:"london", name:"London", region:"UK", market:"temperate maritime", lat:51.51, lng:-0.13,
    climate:{ annual:{T:11.5,RH:0.78}, summer:{T:18.0,RH:0.68}, winter:{T:5.5,RH:0.84} }, note:"Cool marine · low fridge yield" },

  // —— More US / Canada ——
  { id:"chicago", name:"Chicago", region:"IL, USA", market:"humid continental", lat:41.88, lng:-87.63,
    climate:{ annual:{T:10.5,RH:0.68}, summer:{T:23.5,RH:0.68}, winter:{T:-3.0,RH:0.72} }, note:"Humid summers · freezing winters" },
  { id:"new-york", name:"New York", region:"NY, USA", market:"humid subtropical", lat:40.71, lng:-74.01,
    climate:{ annual:{T:13.0,RH:0.65}, summer:{T:25.0,RH:0.66}, winter:{T:1.5,RH:0.62} }, note:"Summer humid · winter limited" },
  { id:"boston", name:"Boston", region:"MA, USA", market:"humid continental", lat:42.36, lng:-71.06,
    climate:{ annual:{T:11.0,RH:0.66}, summer:{T:22.5,RH:0.68}, winter:{T:0.0,RH:0.62} }, note:"Coastal NE · seasonal" },
  { id:"toronto", name:"Toronto", region:"ON, Canada", market:"humid continental", lat:43.65, lng:-79.38,
    climate:{ annual:{T:9.5,RH:0.70}, summer:{T:22.0,RH:0.68}, winter:{T:-4.0,RH:0.74} }, note:"Great Lakes humidity summers" },
  { id:"montreal", name:"Montreal", region:"QC, Canada", market:"humid continental", lat:45.50, lng:-73.57,
    climate:{ annual:{T:7.0,RH:0.72}, summer:{T:21.5,RH:0.70}, winter:{T:-8.0,RH:0.74} }, note:"Cold winters shut fridge core" },
  { id:"denver", name:"Denver", region:"CO, USA", market:"high plains arid", lat:39.74, lng:-104.99,
    climate:{ annual:{T:10.5,RH:0.48}, summer:{T:23.0,RH:0.40}, winter:{T:-1.0,RH:0.55} }, note:"High dry · TEC/solar niche" },
];
