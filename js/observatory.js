/* Real Earth textures; illustrative orbital illumination, not a real-time solar ephemeris. */
(function () {
  'use strict';
  window.initObservatory = function (api) {
    const globe = api.globe;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let earthMaterial;
    document.getElementById('view-light').setAttribute('aria-pressed','true');
    document.getElementById('view-light').textContent='◐ Orbital';
    const loader = new THREE.TextureLoader();
    Promise.all(['earth-blue-marble.jpg', 'earth-night.jpg', 'earth-water.png', 'earth-topology.png'].map(name => new Promise((resolve, reject) => loader.load('vendor/img/' + name, resolve, undefined, reject)))).then(textures => {
      textures.forEach(t => { t.anisotropy = Math.min(16, globe.renderer().capabilities.getMaxAnisotropy()); });
      const sun = new THREE.Vector3().copy(globe.getCoords(20, -160, 1)).normalize();
      earthMaterial = new THREE.ShaderMaterial({
        uniforms: { dayMap:{value:textures[0]}, nightMap:{value:textures[1]}, waterMap:{value:textures[2]}, reliefMap:{value:textures[3]}, sunDirection:{value:sun}, dayOnly:{value:1} },
        vertexShader: `varying vec2 vUv; varying vec3 vWorldNormal; varying vec3 vWorldPosition;
          void main(){vUv=uv; vec4 wp=modelMatrix*vec4(position,1.0); vWorldPosition=wp.xyz;
          vWorldNormal=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*wp;}`,
        fragmentShader: `uniform sampler2D dayMap; uniform sampler2D nightMap; uniform sampler2D waterMap; uniform sampler2D reliefMap;
          uniform vec3 sunDirection; uniform float dayOnly; varying vec2 vUv; varying vec3 vWorldNormal; varying vec3 vWorldPosition;
          void main(){
            vec3 n=normalize(vWorldNormal); vec3 eye=normalize(cameraPosition-vWorldPosition);
            float ndl=dot(n,sunDirection); float daylight=smoothstep(-0.10,0.18,ndl);
            vec3 day=pow(texture2D(dayMap,vUv).rgb,vec3(2.2));
            vec3 night=pow(texture2D(nightMap,vUv).rgb,vec3(2.2));
            float ocean=texture2D(waterMap,vUv).r;
            // Hillshade from the supplied elevation raster, confined to land.
            vec2 texel=vec2(1.0/2048.0,1.0/1024.0);
            float east=texture2D(reliefMap,vUv+vec2(texel.x,0.0)).r;
            float west=texture2D(reliefMap,vUv-vec2(texel.x,0.0)).r;
            float north=texture2D(reliefMap,vUv+vec2(0.0,texel.y)).r;
            float south=texture2D(reliefMap,vUv-vec2(0.0,texel.y)).r;
            float hillshade=clamp(1.0+(west-east)*1.5+(south-north)*0.9,0.84,1.14);
            day*=mix(hillshade,1.0,ocean);
            float shine=pow(max(dot(n,normalize(sunDirection+eye)),0.0),95.0)*ocean*daylight;
            vec3 colour=day*(0.018+1.08*pow(max(ndl,0.0),0.65));
            colour+=night*(1.0-daylight)*1.15;
            colour+=vec3(0.72,0.82,0.94)*shine*0.30;
            float rim=pow(1.0-max(dot(n,eye),0.0),9.0);
            colour+=vec3(0.015,0.09,0.24)*rim*(0.1+daylight*0.45);
            // View-relative illumination keeps atlas labels readable without a flat blue haze.
            float facing=max(dot(n,eye),0.0);
            vec3 atlas=day*(0.58+0.48*pow(facing,0.45));
            atlas+=vec3(0.015,0.065,0.16)*rim;
            colour=mix(colour,atlas,dayOnly);
            gl_FragColor=vec4(pow(max(colour,vec3(0.0)),vec3(1.0/2.2)),1.0);
          }`
      });
      globe.globeMaterial(earthMaterial);
      document.getElementById('orbital-status').textContent='4K EARTH · ELEVATION DETAIL · STATIC IMAGERY';
    }).catch(() => { document.getElementById('orbital-status').textContent='DAYLIGHT EARTH'; });
    document.getElementById('desktop-layers').onclick=function(){
      const open=document.body.classList.toggle('layers-expanded');
      this.setAttribute('aria-expanded',String(open));
      this.textContent=open?'Close layers':'Layers';
    };
    document.getElementById('close-layers').addEventListener('click',()=>{
      document.body.classList.remove('layers-expanded');
      document.getElementById('desktop-layers').setAttribute('aria-expanded','false');
      document.getElementById('desktop-layers').textContent='Layers';
    });
    const hud = document.getElementById('coordinate-readout');
    const updateCoordinates = () => { const p=globe.pointOfView(); hud.textContent=Math.abs(p.lat).toFixed(1)+'° '+(p.lat>=0?'N':'S')+'  /  '+Math.abs(p.lng).toFixed(1)+'° '+(p.lng>=0?'E':'W'); };
    globe.controls().addEventListener('change',updateCoordinates); updateCoordinates();
    document.getElementById('view-home').onclick=()=>{api.clear();globe.pointOfView({lat:26,lng:-90,altitude:1.5},reduced?0:1200);};
    document.getElementById('view-zoom-in').onclick=()=>{const p=globe.pointOfView();globe.pointOfView({...p,altitude:Math.max(.2,p.altitude*.76)},reduced?0:450);};
    document.getElementById('view-zoom-out').onclick=()=>{const p=globe.pointOfView();globe.pointOfView({...p,altitude:Math.min(6,p.altitude*1.3)},reduced?0:450);};
    let lightFrame;
    function setDaylight(full) {
      const button=document.getElementById('view-light');
      button.setAttribute('aria-pressed',String(full));button.textContent=full?'◐ Orbital':'☀ Daylight';
      if(!earthMaterial)return;
      cancelAnimationFrame(lightFrame);
      const from=earthMaterial.uniforms.dayOnly.value,to=full?1:0,start=performance.now();
      function blend(now){const t=reduced?1:Math.min(1,(now-start)/1800);const eased=t*t*(3-2*t);earthMaterial.uniforms.dayOnly.value=from+(to-from)*eased;if(t<1)lightFrame=requestAnimationFrame(blend);}
      lightFrame=requestAnimationFrame(blend);
    }
    document.getElementById('view-light').onclick=function(){setDaylight(this.getAttribute('aria-pressed')!=='true');};
    if(window.initDewfallJourney)window.initDewfallJourney({globe,clear:api.clear,season:api.season,light:setDaylight,reduced});
    document.getElementById('view-present').onclick=function(){const active=document.body.classList.toggle('presentation');this.setAttribute('aria-pressed',String(active));this.textContent=active?'↙ Explore':'↗ Present';api.clear();};
    document.getElementById('view-rotate').onclick=()=>{const el=document.getElementById('layer-rotate');el.checked=!el.checked;el.dispatchEvent(new Event('change'));};
    const syncRotation=()=>{const active=document.getElementById('layer-rotate').checked; const btn=document.getElementById('view-rotate');btn.textContent=active?'Ⅱ':'▷';btn.setAttribute('aria-label',active?'Pause rotation':'Start rotation');btn.setAttribute('aria-pressed',String(active));};
    document.getElementById('layer-rotate').addEventListener('change',syncRotation);setInterval(syncRotation,1200);syncRotation();
    document.getElementById('view-method').onclick=()=>document.getElementById('method-dialog').showModal();
    document.getElementById('close-method').onclick=()=>document.getElementById('method-dialog').close();
    document.getElementById('method-dialog').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){api.clear();document.body.classList.remove('presentation');document.getElementById('view-present').setAttribute('aria-pressed','false');document.getElementById('view-present').textContent='↗ Present';} if(e.key==='/'&&!/INPUT|TEXTAREA/.test(e.target.tagName)){e.preventDefault();document.getElementById('btn-search').click();}});
    const totals=api.counts;
    document.getElementById('dataset-counts').textContent=totals.cities+' climates · '+totals.reserves.toLocaleString()+' land records · '+totals.world+' world sites · '+totals.markets+' markets';
    const rankContext=document.createElement('div');
    rankContext.className='rank-context'; rankContext.setAttribute('aria-live','polite');
    document.querySelector('#panel-rank header').appendChild(rankContext);
    const annotate = () => {
      rankContext.textContent=document.querySelectorAll('#rank-list .rank-item').length+' locations · '+api.season()+' climate bin';
      document.querySelectorAll('.rank-item,.search-result,.fn-pin,.drought-pin').forEach(el=>{el.tabIndex=0;if(el.tagName!=='BUTTON')el.setAttribute('role','button');if(!el.dataset.keyboardReady){el.dataset.keyboardReady='1';el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});}});
      document.querySelectorAll('.rank-tab').forEach(el=>el.setAttribute('aria-selected',String(el.classList.contains('active'))));
    };
    const observer=new MutationObserver(annotate);observer.observe(document.getElementById('rank-list'),{childList:true});observer.observe(document.getElementById('search-results'),{childList:true});annotate();
    window.exportDewfallCard=async function(c,button){
      const original=button.textContent;button.textContent='Creating…';button.disabled=true;
      try{
        const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1000;const ctx=canvas.getContext('2d');
        const bg=ctx.createLinearGradient(0,0,1600,1000);bg.addColorStop(0,'#142a36');bg.addColorStop(1,'#03090f');ctx.fillStyle=bg;ctx.fillRect(0,0,1600,1000);
        // Render immediately before reading WebGL; use only locally stored textures.
        globe.renderer().render(globe.scene(),globe.camera());
        const earth=globe.renderer().domElement;
        const size=Math.min(earth.width,earth.height);ctx.save();ctx.globalAlpha=.65;ctx.drawImage(earth,(earth.width-size)/2,(earth.height-size)/2,size,size,860,60,740,740);ctx.restore();
        const shade=ctx.createLinearGradient(700,0,1400,0);shade.addColorStop(0,'#10232f');shade.addColorStop(1,'#07121a00');ctx.fillStyle=shade;ctx.fillRect(0,0,1600,1000);
        ctx.fillStyle='#a1efdb';ctx.font='500 25px system-ui';ctx.fillText('DEWFALL  /  WATER ATLAS',76,86);
        ctx.fillStyle='#afc2ce';ctx.font='21px system-ui';ctx.fillText('SITE BRIEF · '+api.season().toUpperCase()+' CLIMATE BIN',76,151);
        let line='',y=233;ctx.fillStyle='#f4f8fb';ctx.font='500 53px system-ui';for(const word of c.name.split(' ')){if(ctx.measureText(line+word).width>860&&line){ctx.fillText(line,76,y);line='';y+=65;}line+=word+' ';}ctx.fillText(line.trim(),76,y);
        ctx.fillStyle='#a2b5c1';ctx.font='25px system-ui';ctx.fillText([c.region,c.country||c.province].filter(Boolean).join(' · ').slice(0,75),76,y+48);
        const yieldData=c.yield;
        if(yieldData){ctx.fillStyle='#a1efdb';ctx.font='500 88px system-ui';ctx.fillText(yieldData.yieldLo+'–'+yieldData.yieldHi,76,480);ctx.font='24px system-ui';ctx.fillText('L / DAY · MODELED',76,525);ctx.fillStyle='#bfccd2';ctx.font='25px system-ui';ctx.fillText(yieldData.T+'°C     '+yieldData.RH+'% RH     Dew point '+yieldData.Tdp+'°C',76,591);}
        if(c.fit){ctx.fillStyle='#ebc38a';ctx.font='31px system-ui';ctx.fillText('FIT '+c.fit.score+' / 100   ·   '+c.fit.label,76,659);}
        ctx.fillStyle='#a4b7c2';ctx.font='22px system-ui';ctx.fillText('Model estimates, not measured or guaranteed machine output.',76,735);ctx.fillText('Climate proxies · approximate locations · verify source status.',76,770);
        ctx.strokeStyle='#29424e';ctx.beginPath();ctx.moveTo(76,815);ctx.lineTo(1524,815);ctx.stroke();
        ctx.fillStyle='#95aeba';ctx.font='19px system-ui';const src=c.sourceUrl||'https://donnyjm.github.io/dewfall-globe/';ctx.fillText('Source: '+src.slice(0,132),76,864);ctx.fillText(api.permalink(c.id),76,907);ctx.fillText('MEKILOK ECOSYSTEM · NORTH VANCOUVER',76,953);
        const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('Export unavailable');const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='DEWFALL-'+c.id+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);button.textContent='Saved PNG';
      }catch(e){button.textContent='Export unavailable';}finally{button.disabled=false;setTimeout(()=>button.textContent=original,2400);}
    };
  };
})();
