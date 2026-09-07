import {parts as legacyParts} from './atlas-data.js';
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

export {featured,brands};
