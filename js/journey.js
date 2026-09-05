/* A guided narrative over the existing climate dataset; no invented observations. */
(function(){
  'use strict';
  window.initDewfallJourney=function(api){
    const chapters=[
      {id:'north-vancouver',title:'It begins with the air.',copy:'North Vancouver is DEWFALL’s home. Moist coastal air is only part of the story: temperature determines how much of that moisture a cold coil can collect.'},
      {id:'mumbai',title:'Follow the moisture.',copy:'Across the Pacific and Indian oceans, warm coastal air changes the equation. Mumbai’s supplied climate bins show why humid warmth favours condensation.'},
      {id:'las-vegas',title:'Need isn’t the same as yield.',copy:'In the desert, a compelling need for water meets a difficult climate for condensation. The map keeps that gap visible; it credits no unvalidated sorption or TEC production.'},
      {id:'sydney',title:'Every place has a season.',copy:'A single summer number is not a year-round promise. Explore each location’s climate, compare seasons, and follow the evidence before choosing a pilot.'}
    ];
    const card=document.getElementById('journey-card');
    let index=0,active=false,previousView,previousRotation,previousLight,flightTimer,previousPoints,previousRings,previousFocus;
    const title=document.getElementById('journey-title');
    title.tabIndex=-1;
    card.setAttribute('aria-labelledby','journey-title');
    const step=document.getElementById('journey-step');
    step.setAttribute('aria-live','polite');
    step.setAttribute('aria-atomic','true');
    function render(){
      const story=chapters[index];const city=window.DEWFALL_CITIES.find(c=>c.id===story.id);
      if(!city)return;
      const season=api.season();
      const y=window.DEWFALL_YIELD.enrichCity(city,season).yield;
      document.getElementById('journey-step').textContent=String(index+1).padStart(2,'0')+' / 04  ·  '+city.name.toUpperCase()+' · '+season.toUpperCase();
      document.getElementById('journey-title').textContent=story.title;
      document.getElementById('journey-copy').textContent=story.copy;
      const reading=document.getElementById('journey-reading');
      reading.replaceChildren();
      for(const [value,label] of [[y.T+'°C','climate bin'],[y.RH+'%','relative humidity'],[y.yieldMid.toFixed(1)+' L','modeled / day']]){
        const cell=document.createElement('div'),strong=document.createElement('strong'),small=document.createElement('span');strong.textContent=value;small.textContent=label;cell.append(strong,small);reading.append(cell);
      }
      document.getElementById('journey-prev').disabled=index===0;
      document.getElementById('journey-next').disabled=index===chapters.length-1;
      // Focus the new chapter so keyboard navigation never stays on a disabled arrow.
      card.scrollTop=0;title.focus({preventScroll:true});
      clearTimeout(flightTimer);
      api.globe.controls().autoRotate=false;
      if(api.reduced){api.globe.pointOfView({lat:city.lat,lng:city.lng,altitude:1.7},0);return;}
      // Pull out before crossing the planet, then settle into the new hemisphere.
      api.globe.pointOfView({altitude:2.6},900);
      flightTimer=setTimeout(()=>{if(active)api.globe.pointOfView({lat:city.lat,lng:city.lng,altitude:1.7},2400);},920);
    }
    function stop(restore){
      if(!active)return;
      active=false;clearTimeout(flightTimer);card.hidden=true;
      document.body.classList.remove('journey-mode');
      document.getElementById('view-journey').setAttribute('aria-pressed','false');
      api.globe.pointsData(previousPoints || []);api.globe.ringsData(previousRings || []);
      api.light(previousLight);
      api.globe.controls().autoRotate=previousRotation;
      if(restore&&previousView)api.globe.pointOfView(previousView,api.reduced?0:1200);
      if(restore)(previousFocus&&previousFocus.isConnected?previousFocus:document.getElementById('view-journey')).focus({preventScroll:true});
    }
    document.getElementById('view-journey').onclick=function(){
      if(active){stop(true);return;}
      previousFocus=document.activeElement;
      previousView={...api.globe.pointOfView()};previousRotation=api.globe.controls().autoRotate;
      previousLight=document.getElementById('view-light').getAttribute('aria-pressed')==='true';
      previousPoints=api.globe.pointsData();previousRings=api.globe.ringsData();
      // Clearing a selected site rebuilds map layers, so hide them after that refresh.
      api.clear();
      api.globe.pointsData([]);api.globe.ringsData([]);
      document.body.classList.remove('presentation');
      document.body.classList.add('journey-mode');card.hidden=false;active=true;index=0;
      this.setAttribute('aria-pressed','true');api.light(false);render();
    };
    document.getElementById('journey-next').onclick=()=>{if(index<chapters.length-1){index++;api.light(true);render();}};
    document.getElementById('journey-prev').onclick=()=>{if(index>0){index--;api.light(index!==0);render();}};
    document.getElementById('journey-exit').onclick=()=>stop(true);
    document.getElementById('journey-inspect').onclick=()=>{const id=chapters[index].id;stop(false);const url=new URL(location.href);url.searchParams.set('site',id);location.assign(url.href);};
    document.addEventListener('keydown',e=>{if(!active||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='Escape'){e.preventDefault();stop(true);}if(e.key==='ArrowRight'){e.preventDefault();document.getElementById('journey-next').click();}if(e.key==='ArrowLeft'){e.preventDefault();document.getElementById('journey-prev').click();}});
  };
})();
