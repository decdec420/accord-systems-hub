import {parts as legacyParts} from './atlas-data.js';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const OEM='https://www.hondapartsnow.com';
const categoryNames={all:'All systems',engine:'Engine',chassis:'Brakes, suspension & steering',electrical_exhaust_heater_fuel:'Electrical, fuel & cooling',body_air_conditioning:'Body & air conditioning',interior_bumper:'Interior & trim',transmission_automatic:'Automatic transmission',accessories:'Optional accessories'};
const brands=[['NGK / NTK','Ignition and engine-management catalogs','https://www.ngksparkplugs.com/'],['DENSO','Ignition, starting, charging, and climate control','https://www.densoautoparts.com/'],['Akebono','Brake pad applications','https://www.akebonobrakes.com/'],['ADVICS','Brake components and application information','https://www.advicsaftermarket.com/'],['HondaPartsNow','OEM diagrams and parts references',OEM+'/2012-honda-accord--4dr_lx-kl_5at-parts.html'],['Honda owner information','Maintenance, controls, and owner manuals','https://mygarage.honda.com/s/manuals-search'],['CARB','California aftermarket converter applications','https://ww2.arb.ca.gov/aftermarket-catalytic-converter-database']];
function feature(id,title,desc,brand,website,group,query,x,y,w=126,h=129){return{id,title,desc,brand,website,group,query,crop:{x,y,w,h},notes:legacyParts[id]?.next,summary:legacyParts[id]?.summary};}
const ignition=[
 feature('spark-plugs','Spark Plugs','Reliable ignition. Better performance.','NGK','https://www.ngksparkplugs.com/','engine--plug_hole_coil_plug_l4','plug',22,528),
 feature('ignition-coils','Ignition Coils','Consistent spark. Smooth power.','DENSO','https://www.densoautoparts.com/','engine--plug_hole_coil_plug_l4','coil',158,528),
 feature('battery','Battery','Trusted starting power for every drive.','Honda OEM',OEM,'electrical_exhaust_heater_fuel--battery_l4','battery',294,528),
 feature('battery-cables','Battery Cables','Strong connections. No surprises.','Honda OEM',OEM,'electrical_exhaust_heater_fuel--battery_l4','cable',429,528),
 feature('starter','Starter Motor','Dependable starts. Built to last.','DENSO','https://www.densoautoparts.com/','engine--starter_motor_mitsuba_l4','starter',565,528),
 feature('starter-relay','Starter Relay','Small part. Big role.','Honda OEM',OEM,'electrical_exhaust_heater_fuel--control_unit_cabin','starter cut',700,528),
 feature('alternator','Alternator','Keeps you charged and on the move.','DENSO','https://www.densoautoparts.com/','engine--alternator_denso_l4','alternator',832,528)
];
const braking=[
 feature('front-brakes','Front Pads & Rotors','Stopping power you can trust.','Akebono','https://www.akebonobrakes.com/','chassis--front_brake','pad set',22,953,126,129),
 feature('rear-brakes','Rear Pads & Rotors','Balanced performance front to back.','Honda OEM',OEM,'chassis--rear_brake','pad',158,953,126,129),
 feature('calipers','Brake Calipers','Precision control. Built for confidence.','ADVICS','https://www.advicsaftermarket.com/','chassis--front_brake','caliper',294,953,126,129),
 feature('brake-fluid','Brake Fluid','Keeps your braking system strong.','Honda DOT 3',OEM,'chassis--brake_master_cylinder_master_power','reserve',429,953,126,129),
 feature('brake-hoses','Brake Hoses','Flexible. Durable. Essential.','Honda OEM',OEM,'chassis--brake_lines_vsa','hose',565,953,126,129),
 feature('abs-module','ABS / VSA Module','Advanced safety keeps you in control.','Honda OEM',OEM,'chassis--vsa_modulator','modulator',700,953,126,129),
 feature('parking-brake','Parking Brake Cable','Holds you steady when it matters.','Honda OEM',OEM,'chassis--parking_brake','wire',832,953,126,129)
];
const sensors=[
 feature('crank-sensor','Crankshaft Sensor','Tracks crankshaft position and engine speed.','Honda OEM',OEM,'engine--cylinder_block_oil_pan_l4','sensor assy., crank',64,302,160,110),
 feature('cam-sensor','Camshaft / TDC Sensor','Reports cam timing to the engine computer.','Honda OEM',OEM,'engine--cylinder_head_l4','sensor assy., tdc',268,294,185,128),
 feature('knock-sensor','Engine Knock Sensor','Detects combustion vibration for timing control.','Honda OEM',OEM,'engine--cylinder_block_oil_pan_l4','sensor, knock',289,128,160,123),
 feature('map-sensor','MAP Sensor','Reads pressure inside the intake manifold.','Honda OEM',OEM,'engine--intake_manifold_l4','map',68,469,164,94),
 feature('o2-sensors','Oxygen / A/F Sensors','Reports exhaust information to the ECU.','DENSO','https://www.densoautoparts.com/','engine--converter_l4','sensor',492,302,174,94),
 feature('coolant-sensor','Coolant Temp Sensor','Reports engine coolant temperature.','Honda OEM',OEM,'electrical_exhaust_heater_fuel--radiator_toyo','water temperature',502,469,162,94),
 feature('abs-sensors','ABS Wheel Sensors','Reports wheel speed to ABS and VSA.','Honda OEM',OEM,'chassis--front_knuckle','sensor assy.',490,118,176,139)
];
sensors.forEach(f=>f.sensor=true);
ignition.find(f=>f.id==='battery-cables').summary='Battery cables carry current to the starter and connect the battery to the vehicle grounds. The terminal, cable, and ground attachment are separate inspection points.';
ignition.find(f=>f.id==='battery-cables').notes='Inspect corrosion, terminal tightness, cable damage, and ground connections. Diagnose voltage drop before replacing a cable.';
braking.find(f=>f.id==='brake-hoses').notes='Inspect for cracks, leaks, chafing, and twists. Opened hydraulic circuits require the correct bleeding procedure before driving.';
const featured=[...ignition,...braking,...sensors];
let catalog=null,uniqueParts=[],activeCategory='all',mode='diagrams',query='',limit=24,currentGroup=null,currentRow=null,currentDiagram=0,zoom=1,activeFeature=null;
let toastTimer,searchTimer;
function loadPlan(){try{const value=localStorage.getItem('accord-catalog-plan');if(value){const list=JSON.parse(value);return Array.isArray(list)?list.filter(x=>x&&typeof x.id==='string'):[];}const legacy=JSON.parse(localStorage.getItem('accord-service-plan')||'[]');return Array.isArray(legacy)?legacy.map(id=>({id:'legacy:'+id,kind:'legacy',title:id.replaceAll('-',' ')})):[];}catch{return[];}}
let saved=loadPlan();
function showToast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2300);}
function storePlan(){try{localStorage.setItem('accord-catalog-plan',JSON.stringify(saved));}catch{showToast('Saved for this session. Browser storage is unavailable.');}$('plan-count').textContent=String(saved.length);}
function showDialog(id){const d=$(id);if(!d.open)d.showModal();document.body.style.overflow='hidden';}
function renderFeatured(list,target){$(target).innerHTML=list.map(f=>{const width=f.sensor?706:977;const bgSize=(width/f.crop.w*100).toFixed(4);const bgX=(f.crop.x/(width-f.crop.w)*100).toFixed(4);const bgY=(f.crop.y/((f.sensor?954:1610)-f.crop.h)*100).toFixed(4);return `<article class="part-card" ${f.id==='battery'?'id="starting"':''}><button class="part-art ${f.sensor?'sensor-art':''}" data-feature="${f.id}" style="--x:${f.crop.x};--y:${f.crop.y};--w:${f.crop.w};--h:${f.crop.h};--bg-size:${bgSize}%;--bg-pos-x:${bgX}%;--bg-pos-y:${bgY}%;background-size:var(--bg-size) auto;background-position:var(--bg-pos-x) var(--bg-pos-y)" aria-label="Explore ${esc(f.title)}"></button><div class="part-card-content"><h3>${esc(f.title)}</h3><p>${esc(f.desc)}</p><span class="brand-pill ${f.brand.includes('Honda')?'oem':''}">${esc(f.brand)}</span><button class="button card-primary" data-feature="${f.id}">View Parts <span aria-hidden="true">→</span></button><div class="card-subactions"><button data-feature="${f.id}" data-action="diagram">OEM Diagram</button><button data-feature="${f.id}" data-action="notes">DIY Notes</button></div><a class="card-source" href="${esc(f.website)}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">↗</span>${esc(new URL(f.website).hostname.replace(/^www\./,''))}</a></div></article>`;}).join('');}
renderFeatured(ignition,'ignition-cards');renderFeatured(braking,'brake-cards');renderFeatured(sensors,'sensor-cards');
$('brand-links').innerHTML=brands.map(([name,desc,url])=>`<a class="brand-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span><strong>${esc(name)}</strong><small>${esc(desc)}</small></span><span>↗</span></a>`).join('');
$('plan-count').textContent=String(saved.length);
function searchable(part){return [part.name,part.number,part.note].join(' ').toLowerCase();}
async function loadCatalog(){
 try{
  const response=await fetch('./data/catalog.json');if(!response.ok)throw new Error('Catalog request failed');
  const data=await response.json();if(!Array.isArray(data.groups)||!data.groups.length)throw new Error('Catalog data is empty');catalog=data;
  const byNumber=new Map();
  for(const group of catalog.groups)for(const part of group.parts){if(!part.number)continue;const old=byNumber.get(part.number);if(old){if(!old.groups.includes(group.id))old.groups.push(group.id);}else byNumber.set(part.number,{...part,groupId:group.id,category:group.category,groups:[group.id],search:searchable(part)});}
  uniqueParts=[...byNumber.values()];
  $('catalog-parts-count').textContent=uniqueParts.length.toLocaleString();$('catalog-diagrams-count').textContent=catalog.diagramCount.toLocaleString();
  renderCategoryTabs();renderCatalog();
 }catch(error){$('catalog-result-count').textContent='The catalog could not be loaded.';$('catalog-grid').innerHTML='<div class="empty-state">Your visual guide is available above.<br><button class="outline-button" id="retry-catalog">Retry catalog</button></div>';console.error(error);}
}
function renderCategoryTabs(){const ids=['all',...Object.keys(categoryNames).filter(id=>id!=='all'&&catalog.groups.some(g=>g.category===id))];$('category-tabs').innerHTML=ids.map(id=>`<button class="${activeCategory===id?'selected':''}" data-category="${id}" aria-pressed="${activeCategory===id}">${esc(categoryNames[id])}</button>`).join('');}
function normalize(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function partMatches(part,q){return !q||searchable(part).includes(q)||normalize(part.number).includes(normalize(q));}
function filteredGroups(){return catalog.groups.filter(g=>(activeCategory==='all'||g.category===activeCategory)&&(!query||g.name.toLowerCase().includes(query)||g.parts.some(p=>partMatches(p,query))));}
function filteredParts(){return uniqueParts.filter(p=>(activeCategory==='all'||p.groups.some(id=>catalog.groups.find(g=>g.id===id)?.category===activeCategory))&&partMatches(p,query));}
function imageTag(url,alt,fallback='./assets/reference-atlas.png'){return `<img src="${esc(url)}" alt="${esc(alt)}" loading="lazy" decoding="async" ${fallback&&url!==fallback?`data-fallback="${esc(fallback)}"`:''}>`;}
function renderCatalog(){
 if(!catalog)return;
 const results=mode==='diagrams'?filteredGroups():filteredParts();
 const visible=results.slice(0,limit);
 $('catalog-result-count').textContent=`${results.length.toLocaleString()} ${mode==='diagrams'?'assemblies':'individual part numbers'}${query?' matching “'+query+'”':''} · showing ${visible.length}`;
 $('clear-filters').hidden=activeCategory==='all'&&!query;
 $('load-more').hidden=visible.length>=results.length;
 $('load-more').innerHTML=`Show more ${mode==='diagrams'?'assemblies':'parts'} <span>↓</span>`;
 if(!results.length){$('catalog-grid').innerHTML='<div class="empty-state">No matching entries. Try a part name, a shorter term, or another system.</div>';return;}
 $('catalog-grid').innerHTML=visible.map(item=>{
  if(mode==='diagrams'){
   const matches=query?item.parts.filter(p=>partMatches(p,query)):[];
   return `<button class="diagram-card" data-group="${item.id}"><div class="diagram-preview">${imageTag(item.diagrams[0]?.image||'./assets/reference-atlas.png',item.name+' OEM diagram')}</div><div class="diagram-card-copy"><h3>${esc(item.name)}</h3><p>${item.parts.length} catalog entries · ${item.diagrams.length} diagram${item.diagrams.length===1?'':'s'}</p>${matches.length?`<p class="matches">${matches.length} matching part${matches.length===1?'':'s'} inside</p>`:''}</div></button>`;
  }
  const group=catalog.groups.find(g=>g.id===item.groupId);const fallback=group.diagrams[0]?.image;const photo=item.images[0]||fallback;
  return `<button class="diagram-card" data-group="${item.groupId}" data-number="${esc(item.number)}"><div class="diagram-preview">${imageTag(photo,item.name,fallback)}</div><div class="diagram-card-copy"><span class="part-number">${esc(item.number)}</span><h3>${esc(item.name)}</h3><p>${esc(group.name)}${item.groups.length>1?' · '+item.groups.length+' assemblies':''}</p></div></button>`;
 }).join('');
}
function renderHeaderResults(value){
 const q=value.trim().toLowerCase();if(!q){$('header-results').hidden=true;return;}
 if(!catalog){$('header-results').innerHTML='<p class="header-empty">The complete parts catalog is loading…</p>';$('header-results').hidden=false;return;}
 const results=uniqueParts.filter(p=>partMatches(p,q)).slice(0,6);
 $('header-results').innerHTML=results.length?results.map(p=>`<button class="header-result" data-group="${p.groupId}" data-number="${esc(p.number)}">${esc(p.name)}<small>${esc(p.number)} · ${esc(catalog.groups.find(g=>g.id===p.groupId).name)}</small></button>`).join(''):'<p class="header-empty">No matching parts. Press Enter to search assemblies.</p>';
 $('header-results').hidden=false;
}
function searchCatalog(value){query=value.trim().toLowerCase();$('catalog-search').value=value;limit=mode==='parts'?48:24;activeCategory='all';renderCategoryTabs();renderCatalog();$('header-results').hidden=true;$('catalog').scrollIntoView({behavior:'smooth'});}
function findFeatureGroup(f){let group=catalog.groups.find(g=>g.id===f.group);if(!group){group=catalog.groups.find(g=>g.parts.some(p=>p.name.toLowerCase().includes(f.query)));}return group;}
function openFeature(id,action){
 const f=featured.find(f=>f.id===id);if(!f)return;
 if(!catalog){showToast('The OEM catalog is still loading. Please try again in a moment.');return;}
 const group=findFeatureGroup(f);if(!group){showToast('Search the catalog for this component.');searchCatalog(f.title);return;}
 activeFeature=f;
 const part=group.parts.find(p=>p.name.toLowerCase().includes(f.query));
 openGroup(group.id,part?.number,true);
 if(action==='notes')requestAnimationFrame(()=>document.getElementById('feature-note')?.scrollIntoView({behavior:'smooth',block:'center'}));
}
function openGroup(id,number,preserveFeature=false){
 if(!catalog)return;
 const group=catalog.groups.find(g=>g.id===id);if(!group)return;
 if(!preserveFeature)activeFeature=null;
 currentGroup=group;currentRow=number?group.parts.find(p=>p.number===number):group.parts[0];currentRow||=group.parts[0];
 currentDiagram=Math.max(0,group.diagrams.findIndex(d=>d.hotspots.some(h=>h.code===currentRow?.ref)));zoom=1;
 $('dialog-title').textContent=group.name;
 $('dialog-eyebrow').textContent='2012 ACCORD LX · '+(categoryNames[group.category]||'OEM CATALOG').toUpperCase();
 $('dialog-content').innerHTML=`<div class="diagram-layout"><div class="diagram-column"><div class="diagram-toolbar"><select id="diagram-select" aria-label="Choose exploded diagram">${group.diagrams.map((d,i)=>`<option value="${i}" ${i===currentDiagram?'selected':''}>${esc(d.name)}${group.diagrams.length>1?' · '+(i+1)+' of '+group.diagrams.length:''}</option>`).join('')}</select><div class="diagram-zoom" aria-label="Diagram zoom"><button data-zoom="out" aria-label="Zoom diagram out">−</button><button data-zoom="reset" aria-label="Reset diagram zoom">1×</button><button data-zoom="in" aria-label="Zoom diagram in">+</button></div></div><div class="diagram-scroll"><div class="diagram-stage" id="diagram-stage"></div></div><p class="diagram-caption">Select a numbered callout to find the corresponding part. <a href="${esc(group.url)}" target="_blank" rel="noopener noreferrer">Source: HondaPartsNow ↗</a></p></div><div class="parts-column"><h3>${group.parts.length} catalog entries</h3><input class="parts-filter" id="parts-filter" type="search" aria-label="Filter parts in this diagram" placeholder="Filter names, numbers, or callouts…"><div class="part-row-list" id="part-row-list"></div><div class="selected-part-info" id="selected-part-info"></div></div></div>${activeFeature?renderFeatureNote(activeFeature):''}`;
 renderDiagram();renderRows('');renderSelectedPart();showDialog('part-dialog');
 $('part-dialog').scrollTop=0;$('header-results').hidden=true;
 if(number)requestAnimationFrame(()=>document.querySelector('.oem-row.selected')?.scrollIntoView({block:'nearest'}));
}
function renderFeatureNote(f){return `<section class="feature-note" id="feature-note"><h3>${esc(f.title)} · DIY notes</h3><p>${esc(f.summary||f.desc)}</p><div class="note-grid"><div><h3>Start with the evidence</h3><p>${esc(f.notes||'Use the numbered OEM diagram to identify the component, its mounting hardware, and any adjacent seals. Confirm the applicable version before ordering.')}</p></div><div><h3>Before you order</h3><p>The cover artwork is an illustration of the component family. The diagram and part number are your catalog reference. Confirm the VIN, included hardware, and any replacements with the seller.</p><a href="${esc(f.website)}" target="_blank" rel="noopener noreferrer">Open ${esc(f.brand)} catalog ↗</a></div></div></section>`;}
function renderDiagram(){
 const d=currentGroup.diagrams[currentDiagram];
 if(!d){$('diagram-stage').innerHTML='<p class="empty-state">Open the source catalog to view this diagram.</p>';return;}
 $('diagram-stage').style.width=(zoom*100)+'%';
 const diagramFallback=d.image.startsWith('./')?'':'./assets/reference-atlas.png';
 $('diagram-stage').innerHTML=`<img src="${esc(d.image)}" alt="${esc(d.name)} numbered OEM exploded diagram" ${diagramFallback?`data-fallback="${diagramFallback}"`:''}>`+d.hotspots.map((h,index)=>{
  const row=currentGroup.parts.find(p=>p.ref===h.code);const position=['left','top','width','height'].map(key=>`${key}:${/^\d+(\.\d+)?%$/.test(h[key])?h[key]:'0%'}`).join(';');
  return `<button class="diagram-hotspot ${currentRow?.ref===h.code?'selected':''}" data-callout="${esc(h.code)}" style="${position}" aria-label="Callout ${esc(h.code)}${row?' — '+esc(row.name):''}" title="${esc(h.code)}${row?' · '+esc(row.name):''}"></button>`;
 }).join('');
 $('diagram-select').value=String(currentDiagram);
 const reset=document.querySelector('[data-zoom="reset"]');if(reset)reset.textContent=zoom.toFixed(zoom%1?1:0)+'×';
}
function renderRows(filter){
 const q=filter.trim().toLowerCase();
 const list=currentGroup.parts.map((p,index)=>({p,index})).filter(({p})=>!q||partMatches(p,q)||p.ref===q);
 $('part-row-list').innerHTML=list.length?list.map(({p,index})=>`<button class="oem-row ${currentRow===p?'selected':''}" data-row="${index}" aria-pressed="${currentRow===p}"><span class="ref-number">${esc(p.ref||'—')}</span><span><strong>${esc(p.name)}</strong><small>${esc(p.number)}</small></span><span class="row-arrow">→</span></button>`).join(''):'<p class="empty-state">No matching parts in this assembly.</p>';
}
function renderSelectedPart(){
 const p=currentRow;if(!p){$('selected-part-info').innerHTML='<p>Select a part from the diagram or list.</p>';return;}
 const isSaved=saved.some(s=>s.id===currentGroup.id+':'+p.number);
 const other=currentGroup.parts.filter(x=>x.ref===p.ref).length;
 const qualifiers=Array.isArray(p.qualifiers)?p.qualifiers.map(v=>typeof v==='string'?v:v?.value||v?.desc||'').filter(Boolean).join(' · '):'';
 $('selected-part-info').innerHTML=`${p.images[0]?`<img class="part-photo" src="${esc(p.images[0])}" alt="OEM catalog image of ${esc(p.number)}" data-fallback="${esc(currentGroup.diagrams[currentDiagram]?.image||'')}">`:''}<h4>${esc(p.name)}</h4><div class="part-id">${esc(p.number)}</div>${p.note||qualifiers?`<p>${esc(p.note)} ${esc(qualifiers)}</p>`:''}<p>${other>1?other+' catalog alternatives share this callout. ':''}Verify the VIN and applicable supersession before ordering.</p><div class="part-actions"><a class="button" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">View price &amp; fitment ↗</a><button class="outline-button" id="save-part">${isSaved?'✓ Saved to plan':'＋ Save to plan'}</button></div>`;
}
function selectRow(index){const row=currentGroup.parts[index];if(!row)return;currentRow=row;renderRows($('parts-filter').value);renderSelectedPart();document.querySelectorAll('.diagram-hotspot').forEach(b=>b.classList.toggle('selected',b.dataset.callout===row.ref));}
function selectCallout(ref){const index=currentGroup.parts.findIndex(p=>p.ref===ref);if(index<0){showToast('This callout has no separately listed service part.');return;}$('parts-filter').value='';selectRow(index);document.querySelector('.oem-row.selected')?.scrollIntoView({block:'nearest',behavior:'smooth'});}
function saveCurrentPart(){
 const p=currentRow;if(!p)return;const id=currentGroup.id+':'+p.number,index=saved.findIndex(s=>s.id===id);
 if(index>=0){saved.splice(index,1);showToast('Removed from your service plan.');}else{saved.push({id,kind:'part',title:p.name,number:p.number,group:currentGroup.id,groupName:currentGroup.name});showToast('Saved to your service plan.');}
 storePlan();renderSelectedPart();
}
function renderPlan(){
 $('plan-items').innerHTML=saved.length?saved.map(item=>`<div class="saved-item"><button class="saved-open" data-saved-open="${esc(item.id)}">${esc(item.title)}<small>${esc(item.number||'Saved system')} · ${esc(item.groupName||'3D workspace')}</small></button><button class="saved-remove" data-saved-remove="${esc(item.id)}" aria-label="Remove ${esc(item.title)} from service plan">Remove</button></div>`).join(''):'<p class="empty-state">Open any part, then choose “Save to plan.” Your saved components will appear here.</p>';
}
document.addEventListener('click',event=>{
 const close=event.target.closest('[data-close]');if(close){$(close.dataset.close).close();return;}
 const featureButton=event.target.closest('[data-feature]');if(featureButton){openFeature(featureButton.dataset.feature,featureButton.dataset.action);return;}
 const groupButton=event.target.closest('[data-group]');if(groupButton){openGroup(groupButton.dataset.group,groupButton.dataset.number);return;}
 const categoryButton=event.target.closest('[data-category]');if(categoryButton){activeCategory=categoryButton.dataset.category;limit=mode==='parts'?48:24;renderCategoryTabs();renderCatalog();return;}
 const modeButton=event.target.closest('[data-mode]');if(modeButton){mode=modeButton.dataset.mode;limit=mode==='parts'?48:24;document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('selected',b===modeButton);b.setAttribute('aria-pressed',String(b===modeButton));});renderCatalog();return;}
 const callout=event.target.closest('[data-callout]');if(callout){selectCallout(callout.dataset.callout);return;}
 const row=event.target.closest('[data-row]');if(row){selectRow(Number(row.dataset.row));return;}
 const zoomButton=event.target.closest('[data-zoom]');if(zoomButton){zoom=zoomButton.dataset.zoom==='reset'?1:Math.min(3,Math.max(1,zoom+(zoomButton.dataset.zoom==='in'?.5:-.5)));renderDiagram();return;}
 const searchLink=event.target.closest('[data-catalog-search]');if(searchLink){event.preventDefault();mode='parts';document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('selected',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});if(catalog)searchCatalog(searchLink.dataset.catalogSearch);return;}
 const savedOpen=event.target.closest('[data-saved-open]');if(savedOpen){const item=saved.find(s=>s.id===savedOpen.dataset.savedOpen);if(item?.kind==='legacy'){location.href='./explorer.html';return;}$('plan-dialog').close();if(item)openGroup(item.group,item.number);return;}
 const savedRemove=event.target.closest('[data-saved-remove]');if(savedRemove){saved=saved.filter(s=>s.id!==savedRemove.dataset.savedRemove);storePlan();renderPlan();return;}
 if(event.target.closest('#save-part')){saveCurrentPart();return;}
 if(event.target.closest('#retry-catalog')){loadCatalog();return;}
 if(!event.target.closest('.header-search'))$('header-results').hidden=true;
});
document.addEventListener('input',event=>{if(event.target.id==='parts-filter')renderRows(event.target.value);});
document.addEventListener('change',event=>{if(event.target.id==='diagram-select'){currentDiagram=Number(event.target.value);zoom=1;renderDiagram();}});
document.addEventListener('error',event=>{const img=event.target;if(img instanceof HTMLImageElement&&img.dataset.fallback){const fallback=img.dataset.fallback;delete img.dataset.fallback;if(fallback&&img.getAttribute('src')!==fallback)img.src=fallback;}},true);
$('load-more').addEventListener('click',()=>{limit+=mode==='parts'?48:24;renderCatalog();});
$('catalog-search').addEventListener('input',event=>{query=event.target.value.trim().toLowerCase();limit=mode==='parts'?48:24;clearTimeout(searchTimer);searchTimer=setTimeout(renderCatalog,100);});
$('clear-filters').addEventListener('click',()=>{query='';activeCategory='all';$('catalog-search').value='';limit=24;renderCategoryTabs();renderCatalog();});
$('global-search').addEventListener('input',event=>{clearTimeout(searchTimer);const value=event.target.value;searchTimer=setTimeout(()=>renderHeaderResults(value),120);});
$('global-search').addEventListener('keydown',event=>{if(event.key==='Escape'){$('header-results').hidden=true;event.target.blur();}if(event.key==='Enter'&&catalog){event.preventDefault();searchCatalog(event.target.value);}});
$('open-plan').addEventListener('click',()=>{renderPlan();showDialog('plan-dialog');});
$('brands-button').addEventListener('click',()=>showDialog('brands-dialog'));
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.style.overflow='';});d.addEventListener('click',event=>{if(event.target===d){const rect=d.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)d.close();}});});
document.querySelectorAll('.nav-link').forEach(a=>a.addEventListener('click',()=>document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',a===b))));
loadCatalog();
