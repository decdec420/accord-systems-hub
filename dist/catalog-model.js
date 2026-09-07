export const OEM='https://www.hondapartsnow.com';
export const MANUAL='https://charm.li/Honda/2012/Accord%20L4-2.4L/';
export const INTAKE='engine--intake_manifold_l4';
export const SYSTEMS=[
 ['engine','Engine & intake','engine','Block, head, timing, lubrication, and intake.','ENGINE BAY',[.67,.34]],
 ['ignition','Ignition & starting','bolt','Spark, battery, starting, and charging.','ENGINE BAY',[.82,.25]],
 ['fuel','Fuel & air delivery','fuel','Tank, pump, injectors, and intake air path.','FRONT TO REAR',[.2,.47]],
 ['cooling','Cooling','cooling','Radiator, pump, hoses, and coolant circuit.','FRONT OF VEHICLE',[.86,.47]],
 ['transmission','Transmission & axles','gear','5-speed automatic, internal gears, and drive axles.','ENGINE BAY / UNDERBODY',[.55,.52]],
 ['brakes','Brakes & ABS','brakes','Pads, rotors, hydraulics, parking brake, and VSA.','ALL FOUR WHEELS',[.46,.73]],
 ['suspension','Suspension & wheels','suspension','Arms, knuckles, shocks, hubs, and wheels.','ALL FOUR CORNERS',[.88,.74]],
 ['steering','Steering','steering','Wheel, column, hydraulic pump, and steering rack.','CABIN / FRONT AXLE',[.45,.24]],
 ['exhaust','Exhaust & emissions','exhaust','Catalyst, exhaust pipe, evaporative controls, and sensors.','ENGINE TO TAILPIPE',[.26,.72]],
 ['electrical','Electrical & lighting','electric','Wiring, fuses, controls, instruments, and lamps.','THROUGHOUT VEHICLE',[.86,.6]],
 ['hvac','Climate control','fan','Compressor, refrigerant lines, heater, and cabin airflow.','ENGINE BAY / DASH',[.59,.2]],
 ['body','Body & glass','body','Structure, doors, locks, windows, and exterior trim.','BODY SHELL',[.28,.3]],
 ['interior','Interior & seats','seat','Seats, console, panels, carpet, and headliner.','CABIN',[.35,.42]],
 ['safety','Restraints & safety','shield','Seat belts, airbags, SRS, and occupant sensing.','CABIN',[.37,.57]],
 ['sensors','Sensors & signals','sensor','Sensor components across every mechanical and electrical system.','THROUGHOUT VEHICLE',[.7,.57]],
 ['accessories','Accessories','tool','Optional equipment and accessory assemblies.','EQUIPMENT DEPENDENT',[.17,.62]]
].map(([id,name,icon,description,zone,point])=>({id,name,icon,description,zone,point}));
export const systemById=Object.fromEntries(SYSTEMS.map(s=>[s.id,s]));
export function systemFor(g){const s=g.id;
 if(g.category==='accessories')return'accessories';
 if(/seat_belts|srs_unit|steering_wheel_srs/.test(s))return'safety';
 if(g.category==='transmission_automatic'||/driveshaft|clutch_torque|select_lever/.test(s))return'transmission';
 if(/plug_hole|starter_motor|alternator|battery_l4/.test(s))return'ignition';
 if(/brake|vsa_modulator/.test(s))return'brakes';
 if(/p_s_|steering_column/.test(s))return'steering';
 if(/shock_absorber|lower_arm|knuckle|wheel_disk|front_sub_frame/.test(s))return'suspension';
 if(/radiator|water_hose|water_pump/.test(s))return'cooling';
 if(/exhaust_pipe|converter_l4|canister/.test(s))return'exhaust';
 if(/fuel_|air_cleaner|resonator_chamber/.test(s))return'fuel';
 if(/a_c_|heater_|--duct/.test(s))return'hvac';
 if(g.category==='engine')return /engine_wire/.test(s)?'electrical':'engine';
 if(g.category==='electrical_exhaust_heater_fuel')return'electrical';
 if(g.category==='interior_bumper')return /bumpers|grille|mirror|molding|emblems|grommet/.test(s)?'body':'interior';
 return'body';
}
export const cleanName=s=>String(s||'').replace(/\[Freight Parts\]\s*/g,'').replace(/\s+\(L4\)/g,'').replace(/\s+/g,' ').trim();
export const isHardware=p=>/^(bolt|nut|screw|washer|clip|clamp|pin[, ]|circlip|ring[, ]|cotter)/i.test(p.name||'');
export const isSeal=p=>/gasket|seal|o-ring|grommet/i.test(p.name||'');
export const normalize=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function matches(p,q){if(!q.trim())return true;const words=q.toLowerCase().trim().split(/\s+/);const text=[p.name,p.number,p.note,p.ref].join(' ').toLowerCase();return words.every(w=>text.includes(w))||(normalize(q).length>2&&normalize(p.number).includes(normalize(q)));}
const primaryQueries={ [INTAKE]:'manifold assy', 'engine--alternator_denso_l4':'alternator assy', 'engine--starter_motor_mitsuba_l4':'starter motor', 'electrical_exhaust_heater_fuel--battery_l4':'battery assy', 'chassis--front_brake':'pad set', 'chassis--rear_brake':'pad set','chassis--vsa_modulator':'modulator assy'};
export function primaryPart(g){const q=primaryQueries[g.id];if(q){const p=g.parts.find(p=>p.name.toLowerCase().includes(q));if(p)return p;}const tokens=cleanName(g.name).toLowerCase().split(/[^a-z]+/).filter(s=>s.length>2&&!['front','rear','assy','side','components','automatic'].includes(s));return [...g.parts].sort((a,b)=>score(b)-score(a))[0];function score(p){return (isHardware(p)?-100:0)+(isSeal(p)?-15:0)+(p.images?.length?3:0)+tokens.filter(t=>p.name.toLowerCase().includes(t)).length*8;}}
const MODELS={
 [INTAKE]:'intake', 'engine--alternator_denso_l4':'alternator','engine--starter_motor_mitsuba_l4':'starter','engine--plug_hole_coil_plug_l4':'spark-plugs','electrical_exhaust_heater_fuel--battery_l4':'battery','chassis--front_brake':'front-brakes','chassis--rear_brake':'rear-brakes','chassis--front_shock_absorber':'struts','chassis--rear_shock_absorber':'struts','chassis--front_lower_arm':'control-arms','chassis--driveshaft_half_shaft_l4':'cv-axles','chassis--p_s_gear_box':'steering','electrical_exhaust_heater_fuel--radiator_toyo':'radiator','body_air_conditioning--a_c_condenser':'condenser','body_air_conditioning--a_c_compressor':'compressor','engine--water_pump_l4':'water-pump','engine--converter_l4':'catalytic','electrical_exhaust_heater_fuel--fuel_tank':'fuel-pump','engine--fuel_injector_l4':'injectors','chassis--vsa_modulator':'abs-module','engine--engine_assy_transmission_assy_l4':'engine'};
export const modelFor=g=>g?MODELS[g.id]||null:null;
export function buildIndex(data,directory=[]){const groups=data.groups.map(g=>({...g,systemId:systemFor(g)}));const groupMap=new Map(groups.map(g=>[g.id,g]));const parts=new Map();for(const g of groups)for(const p of g.parts){if(!p.number)continue;if(parts.has(p.number))parts.get(p.number).groupIds.push(g.id);else parts.set(p.number,{...p,groupId:g.id,groupIds:[g.id],systemId:g.systemId});}const missing=directory.filter(e=>!groupMap.has(e.id)).map(e=>({...e,systemId:systemFor(e)}));return{groups,groupMap,parts:[...parts.values()],missing};}
export function groupsFor(index,system){return index.groups.filter(g=>system==='sensors'?g.parts.some(p=>/sensor|sender|switch/i.test(p.name)):g.systemId===system);}
