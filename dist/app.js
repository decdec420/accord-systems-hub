import * as THREE from "three";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { RoundedBoxGeometry } from "./vendor/RoundedBoxGeometry.js";

import { buildAssembly } from "./assemblies.js";

const systemOrder = [
  "overview",
  "powertrain",
  "ignition",
  "starting",
  "brakes",
  "suspension",
  "cooling",
  "fuel",
  "hvac",
  "electrical",
  "body",
  "fluids"
];

const systems = {
  overview: { label: "Overview", shortLabel: "Full vehicle", glyph: "✦", description: "Every mapped system in one view", parts: [] },
  powertrain: { label: "Powertrain", shortLabel: "Engine & driveline", glyph: "◈", description: "Engine, transmission, and torque path", parts: ["engine", "transmission", "cv-axles"] },
  ignition: { label: "Ignition", shortLabel: "Spark & timing", glyph: "ϟ", description: "Spark, coils, and engine timing", parts: ["spark-plugs", "ignition-coils", "crank-sensor"] },
  starting: { label: "Starting & charging", shortLabel: "Power delivery", glyph: "▣", description: "Battery, starter, and alternator", parts: ["battery", "starter", "starter-relay", "alternator"] },
  brakes: { label: "Brakes & ABS", shortLabel: "Control & stopping", glyph: "◉", description: "Hydraulic braking and stability control", parts: ["front-brakes", "rear-brakes", "calipers", "brake-fluid", "abs-module", "parking-brake"] },
  suspension: { label: "Suspension & steering", shortLabel: "Ride & direction", glyph: "⌁", description: "Ride, steering, bearings, and axles", parts: ["struts", "control-arms", "cv-axles", "steering", "wheel-bearings"] },
  cooling: { label: "Cooling", shortLabel: "Temperature control", glyph: "❄", description: "Coolant flow and engine temperature", parts: ["radiator", "water-pump", "thermostat", "coolant-hoses"] },
  fuel: { label: "Fuel & emissions", shortLabel: "Air, fuel, exhaust", glyph: "◒", description: "Fuel delivery, sensors, and catalyst", parts: ["fuel-pump", "injectors", "o2-sensors", "catalytic"] },
  hvac: { label: "Climate control", shortLabel: "A/C & airflow", glyph: "✣", description: "Refrigerant loop and cabin airflow", parts: ["compressor", "condenser", "evaporator", "blower"] },
  electrical: { label: "Electrical & lighting", shortLabel: "Signals & light", glyph: "⌘", description: "Fuses, lamps, sensors, and power", parts: ["fuses", "headlights", "tail-lamps", "tpms"] },
  body: { label: "Body & safety", shortLabel: "Protection & trim", glyph: "◇", description: "Occupant protection and exterior shell", parts: ["airbags", "doors", "weatherstrip", "seatbelts"] },
  fluids: { label: "Fluids & service", shortLabel: "Maintenance points", glyph: "◌", description: "The fluids that keep the Accord healthy", parts: ["engine-oil", "coolant", "atf", "brake-fluid"] }
};

function makePart(label, subtitle, system, glyph, summary, location, next, source, url, status, position, hitSize, accent) {
  return {
    label: label,
    subtitle: subtitle,
    system: system,
    glyph: glyph,
    signal: "About this component",
    summary: summary,
    location: location,
    next: next,
    source: source,
    url: url,
    status: status,
    position: position,
    hitSize: hitSize,
    accent: accent
  };
}

const parts = {
  engine: makePart("2.4L i-VTEC Engine", "Powertrain · Inline 4-cylinder", "powertrain", "◈", "The 2.4L inline-four is the center of the Accord's powertrain. Use this layer to trace oil, air, fuel, spark, and temperature together.", "Front center · transverse", "Check oil level, mounts, leak points, and scan data.", "Honda OEM diagrams", "https://www.hondapartsnow.com/", "VIEW", [0, 1.38, 2.05], [1.8, 0.78, 1.55], "violet"),
  transmission: makePart("5-speed automatic transmission", "Powertrain · Driveline", "powertrain", "▤", "The automatic transaxle carries engine torque to the front axles. Fluid condition, mounts, and shift behavior belong in this layer.", "Front left · transaxle case", "Check ATF level, leaks, mounts, and shift quality.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [-1.55, 0.8, 0.95], [1.15, 0.82, 1.25], "blue"),
  "cv-axles": makePart("Front CV axles", "Suspension & steering · Torque transfer", "suspension", "⇄", "The inner joints allow suspension movement while carrying engine torque to the front wheels. Load-only vibration points toward this path.", "Transaxle to front hubs", "Inspect boots, play, grease, and vibration under throttle.", "TRQ", "https://www.trqparts.com/", "VIEW", [1.75, 0.68, 1.32], [0.62, 0.38, 1.5], "blue"),
  "spark-plugs": makePart("Spark plugs", "Ignition · 4-cylinder set", "ignition", "ϟ", "Four plugs ignite the air-fuel mixture. Pair a visual check with gap, torque, coil condition, and live misfire data.", "Cylinder head · under coils", "Inspect plug color, gap, threads, and oil in the wells.", "NGK", "https://www.ngk.com/", "VIEW", [0.35, 1.7, 2.3], [1.1, 0.4, 0.8], "violet"),
  "ignition-coils": makePart("Ignition coils", "Ignition · Coil-on-plug", "ignition", "⚡", "Each coil sits over a plug and is controlled by the engine computer. Swap-test logic can isolate a cylinder when a misfire appears.", "Top of cylinder head", "Inspect boots, connectors, and cylinder-specific misfire data.", "DENSO", "https://www.densoautoparts.com/", "VIEW", [-0.65, 1.78, 2.28], [1.1, 0.42, 0.82], "violet"),
  "crank-sensor": makePart("Crankshaft position sensor", "Ignition · Timing input", "ignition", "⌁", "This sensor tells the ECU where the crankshaft is. A dropout can look like a starting, stalling, or intermittent ignition problem.", "Lower engine · timing side", "Check connector security and compare RPM while cranking.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [-1, 0.94, 1.7], [0.52, 0.52, 0.62], "violet"),
  battery: makePart("12V battery", "Starting & charging · Electrical reserve", "starting", "▣", "The battery supplies the starter and stabilizes the vehicle's electrical system. Terminals, ground paths, and resting voltage matter together.", "Engine bay · battery tray", "Inspect terminals, grounds, resting voltage, and load response.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [1.18, 1.38, 2], [0.92, 0.72, 1.18], "cyan"),
  starter: makePart("Starter motor", "Starting & charging · Cranking", "starting", "⟳", "The starter converts battery current into engine rotation. Slow crank, free-spinning, or intermittent engagement belongs here first.", "Front of engine · low mount", "Check voltage drop, cable integrity, and engagement behavior.", "DENSO", "https://www.densoautoparts.com/", "VIEW", [-1.45, 0.75, 2.38], [0.9, 0.62, 0.72], "cyan"),
  "starter-relay": makePart("Starter relay", "Starting & charging · Control", "starting", "▦", "The relay routes the start command to the starter circuit. It is small, but a failed contact can mimic a dead starter.", "Starter control circuit", "Locate the relay using the Honda wiring diagram, then test the start circuit.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [1.7, 1.65, 1.75], [0.55, 0.5, 0.55], "cyan"),
  alternator: makePart("Alternator", "Starting & charging · Output", "starting", "◌", "The alternator replenishes the battery and powers the vehicle while running. Output, belt condition, and grounds should be read as one system.", "Engine front · belt drive", "Measure running voltage and inspect belt and connections.", "DENSO", "https://www.densoautoparts.com/", "VIEW", [1.48, 0.92, 2], [0.92, 0.84, 0.7], "cyan"),
  "front-brakes": makePart("Front pads & rotors", "Brakes & ABS · Primary axle", "brakes", "◉", "The front axle handles most of the braking work. Pad thickness, rotor condition, caliper movement, and hose health all matter.", "Front wheels · left and right", "Inspect pad thickness, rotor face, hardware, and slide pins.", "Akebono", "https://www.akebonobrakes.com/", "VIEW", [2.43, 0.78, 2.82], [0.62, 1, 0.82], "cyan"),
  "rear-brakes": makePart("Rear pads & rotors", "Brakes & ABS · Rear axle", "brakes", "◉", "The rear axle keeps braking balanced and supports stability. Uneven wear often points toward hardware or parking-brake issues.", "Rear wheels · left and right", "Inspect pad wear, rotor edge, caliper, and parking-brake action.", "Centric", "https://www.centricparts.com/", "VIEW", [2.43, 0.78, -2.82], [0.62, 1, 0.82], "cyan"),
  calipers: makePart("Brake calipers", "Brakes & ABS · Hydraulic clamp", "brakes", "▰", "Calipers convert hydraulic pressure into pad clamp force. Sticking slides, pistons, and uneven pressure can create heat and pull.", "Behind each brake rotor", "Check slide movement, piston behavior, and hose condition.", "ADVICS", "https://www.advicsaftermarket.com/", "VIEW", [2.65, 0.84, 2.6], [0.42, 0.55, 0.54], "cyan"),
  "brake-fluid": makePart("Brake fluid", "Brakes & ABS · Hydraulic medium", "brakes", "◒", "Brake fluid carries pressure from the master cylinder to each caliper. Age, moisture, leaks, and a soft pedal are one inspection path.", "Master cylinder reservoir", "Check level, color, leaks, and service history.", "Honda DOT 3", "https://www.hondapartsnow.com/", "VIEW", [1.7, 1.72, 2.45], [0.48, 0.42, 0.6], "cyan"),
  "abs-module": makePart("ABS / VSA module", "Brakes & ABS · Stability control", "brakes", "⬢", "The ABS/VSA modulator manages brake pressure during wheel slip events and shares data with wheel-speed and steering-angle inputs.", "Engine bay · firewall side", "Read ABS/VSA codes and compare sensor signals with Honda diagnostic steps.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [1.3, 1.3, 1.2], [0.82, 0.74, 0.72], "cyan"),
  "parking-brake": makePart("Parking brake cable", "Brakes & ABS · Hold system", "brakes", "⌁", "The parking-brake cable applies the rear brake mechanism when the lever is set. Binding or excess travel can change rear brake behavior.", "Cabin lever to rear brakes", "Check lever travel, cable movement, and rear hardware.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [0, 0.36, -2], [0.4, 0.35, 1.3], "cyan"),
  struts: makePart("Front spring / damper assemblies", "Suspension & steering · Ride control", "suspension", "⇅", "The spring and damper assembly supports the front corner and controls suspension movement. Leaks, mounts, springs, and tire wear tell the story together.", "Front corners · towers to knuckles", "Inspect leaks, mounts, spring seats, and rebound behavior.", "Monroe", "https://www.monroe.com/", "VIEW", [2.05, 1.22, 2.72], [0.45, 1.25, 0.48], "blue"),
  "control-arms": makePart("Control arms & bushings", "Suspension & steering · Location", "suspension", "⌁", "Control arms locate the wheel through suspension travel. Bushings and ball joints affect steering feel, tire wear, and braking stability.", "Front subframe to knuckle", "Check bushings, ball joints, looseness, and alignment clues.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [2.05, 0.52, 1.75], [0.72, 0.35, 1.25], "blue"),
  steering: makePart("Steering rack & tie rods", "Suspension & steering · Direction", "suspension", "⌖", "The rack converts steering-wheel input into movement at the front knuckles. Centering, play, and alignment belong in one view.", "Front subframe · cross-car", "Check center position, tie-rod play, and alignment.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [0, 0.44, 1.05], [1.9, 0.32, 0.42], "blue"),
  "wheel-bearings": makePart("Wheel bearings", "Suspension & steering · Hub rotation", "suspension", "◎", "Wheel bearings support the hub and allow low-friction rotation. Noise, looseness, and heat help separate a bearing issue from a tire or brake issue.", "Inside each hub", "Check play, noise, roughness, and temperature side to side.", "Timken", "https://www.timken.com/", "VIEW", [2.52, 0.74, 2.82], [0.42, 0.8, 0.62], "blue"),
  radiator: makePart("Radiator", "Cooling · Heat exchanger", "cooling", "▤", "The radiator rejects heat from the coolant. Fins, airflow, cap pressure, and coolant level all affect temperature control.", "Front of engine bay", "Check level cold, leaks, fins, fans, and temperature trend.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [0, 1.03, 3.55], [2.85, 0.72, 0.32], "cyan"),
  "water-pump": makePart("Water pump", "Cooling · Circulation", "cooling", "◌", "The water pump moves coolant through the engine and radiator. A leak, bearing noise, or weak circulation can create an overheating path.", "Engine side · belt drive", "Inspect for leaks, pulley noise, and circulation clues.", "AISIN", "https://www.aisinworld.com/", "VIEW", [-1.2, 0.98, 1.58], [0.58, 0.58, 0.62], "cyan"),
  thermostat: makePart("Thermostat", "Cooling · Flow gate", "cooling", "◍", "The thermostat controls when coolant is routed through the radiator. Stuck-open and stuck-closed failures create different temperature patterns.", "Engine outlet · lower side", "Compare warm-up time, hose temperature, and scan data.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [-1.42, 0.74, 1], [0.55, 0.45, 0.55], "cyan"),
  "coolant-hoses": makePart("Coolant hoses", "Cooling · Pressure path", "cooling", "≋", "Hoses move coolant and carry system pressure. Soft spots, swelling, cracking, and clamp leaks are simple but important checks.", "Radiator to engine", "Inspect cold, then recheck for seepage after a drive.", "Gates", "https://www.gates.com/", "VIEW", [0.8, 1.1, 2.92], [0.9, 0.32, 1.3], "cyan"),
  "fuel-pump": makePart("Fuel pump module", "Fuel & emissions · Supply", "fuel", "◒", "The in-tank pump supplies fuel pressure to the injectors. Prime sound, pressure, and voltage at the module separate supply problems from ignition problems.", "Fuel tank · under rear seat", "Listen for prime and verify pressure before replacing parts.", "DENSO", "https://www.densoautoparts.com/", "VIEW", [0, 0.25, -1.78], [1.15, 0.25, 1], "amber"),
  injectors: makePart("Fuel injectors", "Fuel & emissions · Metering", "fuel", "⌁", "Injectors meter fuel into each intake runner. Balance, spray, connector condition, and fuel trim help confirm their contribution.", "Intake manifold · cylinder head", "Compare fuel trims, injector pulse, and cylinder behavior.", "DENSO", "https://www.densoautoparts.com/", "VIEW", [0.6, 1.3, 1.8], [1.2, 0.45, 0.45], "amber"),
  "o2-sensors": makePart("Oxygen sensors", "Fuel & emissions · Feedback", "fuel", "◌", "The sensors report exhaust oxygen so the ECU can correct fueling and evaluate catalyst performance. Signal behavior matters more than a single voltage snapshot.", "Exhaust · before and after catalyst", "Compare upstream response, downstream activity, and fuel trims.", "DENSO", "https://www.densoautoparts.com/", "VIEW", [0, 0.64, 1.02], [0.42, 0.42, 0.9], "amber"),
  catalytic: makePart("Catalytic converter", "Fuel & emissions · Exhaust treatment", "fuel", "▰", "The catalyst treats exhaust gases after combustion. Efficiency data, exhaust leaks, and sensor behavior should be checked before condemning the converter.", "Underbody · front exhaust", "Check for leaks and compare upstream/downstream sensor behavior.", "Walker", "https://www.walkerexhaust.com/", "VIEW", [0, 0.48, 1.72], [0.68, 0.52, 1.28], "amber"),
  compressor: makePart("A/C compressor", "Climate control · Refrigerant loop", "hvac", "✣", "The compressor circulates refrigerant and loads the engine when the A/C is on. Belt, clutch, pressure, and leak evidence belong together.", "Engine lower front", "Check clutch engagement, belt, pressures, and leak evidence.", "DENSO", "https://www.densoautoparts.com/", "VIEW", [-1.75, 0.66, 0.58], [0.8, 0.65, 0.88], "amber"),
  condenser: makePart("A/C condenser", "Climate control · Heat rejection", "hvac", "▤", "The condenser rejects heat from the refrigerant at the front of the vehicle. Damage, airflow, and leak traces can change high-side pressure.", "In front of radiator", "Inspect fins, fittings, dye, and airflow.", "DENSO", "https://www.densoautoparts.com/", "VIEW", [0.9, 1.22, 3.7], [2.2, 0.5, 0.25], "amber"),
  evaporator: makePart("A/C evaporator", "Climate control · Cabin cooling", "hvac", "❄", "The evaporator absorbs heat from cabin air. Restricted airflow, low charge, and a leaking core can feel similar from the driver's seat.", "HVAC case · behind dash", "Check airflow, vent temperature, and pressure evidence.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [0, 1.02, -0.65], [1.25, 0.78, 0.7], "amber"),
  blower: makePart("Blower motor", "Climate control · Air movement", "hvac", "◌", "The blower moves air through the HVAC case. Fan speed, resistor control, cabin filter, and noise are part of the same path.", "Passenger side · under dash", "Check speed control, filter, noise, and current draw.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [1.1, 0.58, -0.7], [0.72, 0.62, 0.72], "amber"),
  fuses: makePart("Fuse and relay boxes", "Electrical & lighting · Protection", "electrical", "▦", "Fuses protect circuits while relays switch larger loads. A clean inspection starts with the correct circuit, not random parts swapping.", "Under hood and driver kick panel", "Use the circuit diagram and test both sides of each fuse.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [-2.02, 1.45, 1.62], [0.7, 0.64, 0.72], "blue"),
  headlights: makePart("Headlights", "Electrical & lighting · Forward visibility", "electrical", "✧", "Headlights are a complete circuit: fuse, switch, wiring, bulb or assembly, and ground. The visible symptom only starts the test.", "Front corners", "Check bulb, connector, voltage, ground, and lens condition.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [1.72, 1.15, 4.1], [0.74, 0.45, 0.5], "blue"),
  "tail-lamps": makePart("Tail and brake lamps", "Electrical & lighting · Rear visibility", "electrical", "✧", "Tail, brake, and turn circuits share housings but not always the same feed. Separate the switch signal from lamp-side power.", "Rear corners", "Check bulb, socket, ground, and brake-switch feed.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [1.72, 1.12, -4.1], [0.74, 0.45, 0.5], "blue"),
  tpms: makePart("TPMS sensors", "Electrical & lighting · Tire signal", "electrical", "◎", "TPMS sensors report tire pressure and identify their wheel position. A warning light can reflect pressure, sensor battery, or relearn state.", "Inside each wheel", "Confirm actual pressure, sensor IDs, and relearn status.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [2.6, 0.74, -2.8], [0.35, 0.45, 0.45], "blue"),
  airbags: makePart("Airbag system", "Body & safety · Restraint control", "body", "⬢", "Airbags are part of a monitored restraint system with sensors, modules, clockspring wiring, and impact logic. Scan before touching connectors.", "Cabin · front and side zones", "Use the Honda SRS diagnostic procedure. Do not probe airbag connectors.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [0, 1.28, -0.4], [1.5, 0.7, 1.2], "violet"),
  doors: makePart("Doors and latches", "Body & safety · Access", "body", "▱", "Doors carry latches, hinges, glass, wiring, weather sealing, and safety reinforcement. Noise and water leaks often share a location.", "Four side doors", "Check alignment, hinge play, latch, glass, and seals.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [2.08, 1.2, 0], [0.34, 0.9, 2.4], "violet"),
  weatherstrip: makePart("Door weatherstrip", "Body & safety · Sealing", "body", "≋", "Weatherstrip keeps water, wind, and road noise outside the cabin. Torn or collapsed sections can look like trim problems but act like leak paths.", "Door frames and openings", "Inspect compression, tears, corners, and adhesive seating.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [2.17, 1.92, 0.1], [0.3, 0.25, 2.3], "violet"),
  seatbelts: makePart("Seatbelt assemblies", "Body & safety · Occupant restraint", "body", "∥", "Belts, pretensioners, buckles, and warning switches work as one restraint path. Any damaged or locked component needs careful replacement logic.", "Cabin · five seating positions", "Inspect webbing, latch, retractor, and SRS scan state.", "Honda OEM", "https://www.hondapartsnow.com/", "VIEW", [0.85, 1.22, -0.1], [0.45, 0.72, 0.55], "violet"),
  "engine-oil": makePart("Engine oil", "Fluids & service · Lubrication", "fluids", "◒", "Oil protects bearings, cam surfaces, timing components, and the VTEC system. Level, viscosity, leaks, and service interval all matter.", "Pan, filter, and fill cap", "Check level on a level surface and inspect for leaks.", "Honda service information", "https://www.hondapartsnow.com/", "VIEW", [0, 0.44, 1.42], [1.55, 0.25, 1.4], "amber"),
  coolant: makePart("Engine coolant", "Fluids & service · Thermal control", "fluids", "❄", "Coolant carries heat away from the engine and protects the system from corrosion and freezing. Level is read cold at the reservoir and radiator.", "Radiator, reservoir, and passages", "Check cold level, leaks, cap, and correct coolant mix.", "Honda coolant", "https://www.hondapartsnow.com/", "VIEW", [1.55, 1.2, 2.92], [0.48, 0.65, 0.52], "cyan"),
  atf: makePart("Automatic transmission fluid", "Fluids & service · Shift control", "fluids", "◌", "ATF lubricates and controls the automatic transmission. Color, level, leak points, and correct drain-and-fill practice matter together.", "Transaxle case and fill path", "Check level and service history before a drain and fill.", "Honda ATF", "https://www.hondapartsnow.com/", "VIEW", [-1.6, 0.56, 0.82], [0.9, 0.3, 0.78], "amber")
};

systems.overview.parts = Object.keys(parts);
const manualUrl = "https://mygarage.honda.com/s/manuals-search";
for (const id of systems.fluids.parts) { parts[id].url = manualUrl; parts[id].source = "Honda owner's manual"; }
parts.struts.url = "https://www.hondapartsnow.com/oem-2012-honda-accord-shock_absorber.html";
parts["ignition-coils"].url = "https://www.hondapartsnow.com/oem-2012-honda-accord-ignition_coil.html";
parts.catalytic.url = "https://www.walkerexhaust.com/support/tech-tips/carb-converter-basics.html";
parts.catalytic.source = "Walker CARB application guide";
parts.airbags.url = manualUrl;
parts.seatbelts.url = manualUrl;
parts.catalytic.next = "Diagnose efficiency and exhaust leaks first. For California replacement, verify the CARB application against the under-hood emissions label.";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function loadPlan() {
  try { const saved=JSON.parse(localStorage.getItem("accord-service-plan")||"[]"); return Array.isArray(saved)?saved.filter(id=>systems[id]&&id!=="overview"):[]; }
  catch { return []; }
}

const state = {
  activeSystem: "overview",
  selectedPart: "engine",
  view: "atlas",
  exploded: false,
  labels: true,
  searchQuery: "",
  systemQuery: "",
  servicePlan: new Set(loadPlan())
};

const dom = {
  canvas: document.getElementById("car-canvas"),
  sceneShell: document.getElementById("scene-shell"),
  sceneLoading: document.getElementById("scene-loading"),
  sceneReadout: document.getElementById("scene-readout-text"),
  systemList: document.getElementById("system-list"),
  systemSearch: document.getElementById("system-search"),
  globalSearch: document.getElementById("global-search"),
  searchResults: document.getElementById("search-results"),
  hotspots: document.getElementById("hotspots"),
  detailKicker: document.getElementById("detail-kicker"),
  detailIndex: document.getElementById("detail-index"),
  detailIcon: document.getElementById("detail-icon"),
  detailTitle: document.getElementById("detail-title"),
  detailSubtitle: document.getElementById("detail-subtitle"),
  detailSignal: document.getElementById("detail-signal"),
  detailSummary: document.getElementById("detail-summary"),
  detailNext: document.getElementById("detail-next"),
  partCount: document.getElementById("part-count"),
  partList: document.getElementById("part-list"),
  viewerTitle: document.getElementById("viewer-title"),
  labelsToggle: document.getElementById("labels-toggle"),
  explodeToggle: document.getElementById("explode-toggle"),
  guideButton: document.getElementById("guide-button"),
  addPlanButton: document.getElementById("add-plan-button"),
  planButton: document.getElementById("plan-button"),
  planCount: document.getElementById("plan-count"),
  toast: document.getElementById("toast")
};

const colorMap = { violet: 0xa15eff, cyan: 0x55dcff, blue: 0x6d8dff, amber: 0xffb66a };

let renderer;
let scene;
let camera;
let controls;
let carRoot;
let bodyGroup;
let wheelGroup;
let assemblyNodes = {};
let hotspotElements = [];
let pointerStart = null;
let dragging = false;
let animationFrame;
let techGroup;
let hitTargets;
let markerNodes = {};
let markerBasePositions = {};
let raycaster;
let pointer;
let toastTimer;

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createMaterial(options) {
  return new THREE.MeshPhysicalMaterial({
    color: options.color ?? 0x24345d,
    metalness: options.metalness ?? 0.55,
    roughness: options.roughness ?? 0.34,
    clearcoat: options.clearcoat ?? 0.4,
    clearcoatRoughness: 0.24,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0
  });
}

function addRounded(parent, width, height, depth, position, material, radius) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(width, height, depth, 5, radius ?? 0.16), material);
  mesh.position.set(position[0], position[1], position[2]);
  parent.add(mesh);
  return mesh;
}

function buildCar() {
  carRoot = new THREE.Group();
  carRoot.position.y = -0.03;
  carRoot.rotation.y = -0.2;
  carRoot.scale.x = .8;
  scene.add(carRoot);

  bodyGroup = new THREE.Group();
  wheelGroup = new THREE.Group();
  techGroup = new THREE.Group();
  hitTargets = new THREE.Group();
  carRoot.add(bodyGroup, wheelGroup, techGroup, hitTargets);

  const bodyMaterial = createMaterial({ color: 0x253864, metalness: 0.9, roughness: 0.23, clearcoat: 0.85 });
  const bodyDarkMaterial = createMaterial({ color: 0x111a32, metalness: 0.78, roughness: 0.28, clearcoat: 0.72 });
  const glassMaterial = createMaterial({ color: 0x091427, metalness: 0.35, roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.84 });
  const trimMaterial = createMaterial({ color: 0x060b16, metalness: 0.64, roughness: 0.22 });
  const chromeMaterial = createMaterial({ color: 0xc1d0ed, metalness: 0.98, roughness: 0.15, clearcoat: 0.7 });

  addRounded(bodyGroup, 4.8, 0.72, 8.55, [0, 0.78, 0], bodyMaterial, 0.25);
  addRounded(bodyGroup, 4.65, 0.33, 2.75, [0, 1.23, 2.45], bodyMaterial, 0.16);
  addRounded(bodyGroup, 4.52, 0.27, 2.2, [0, 1.12, -3], bodyMaterial, 0.16);
  // Sloped sedan cabin, with a separate roof and window pillars.
  const cabinVertices = new Float32Array([
    -2,1.28,1.85, 2,1.28,1.85, -1.7,2.18,.7, 1.7,2.18,.7,
    -2,1.28,-2.35, 2,1.28,-2.35, -1.7,2.18,-1.5, 1.7,2.18,-1.5
  ]);
  const cabinGeometry = new THREE.BufferGeometry();
  cabinGeometry.setAttribute('position',new THREE.BufferAttribute(cabinVertices,3));
  cabinGeometry.setIndex([0,1,2,1,3,2, 4,6,5,5,6,7, 0,2,4,2,6,4, 1,5,3,3,5,7, 2,3,6,3,7,6]);
  cabinGeometry.computeVertexNormals();
  glassMaterial.side = THREE.DoubleSide;
  bodyGroup.add(new THREE.Mesh(cabinGeometry,glassMaterial));
  addRounded(bodyGroup,3.49,.1,2.28,[0,2.2,-.4],bodyMaterial,.055);
  for (const side of [-1,1]) {
    const pillar = addRounded(bodyGroup,.07,.94,.12,[side*1.86,1.74,-.3],bodyMaterial,.02);
    pillar.rotation.z = side*.3;
    for (const z of [.73,-1.2]) addRounded(bodyGroup,.05,.06,.24,[side*2.04,1.13,z],chromeMaterial,.018);
  }
  addRounded(bodyGroup, 2.18, 0.27, 0.1, [0, 0.88, 4.28], trimMaterial, 0.04);
  addRounded(bodyGroup, 1.9, 0.09, 0.08, [0, 0.87, 4.36], chromeMaterial, 0.03);
  addRounded(bodyGroup, 2.2, 0.12, 0.08, [0, 0.54, 4.18], bodyDarkMaterial, 0.03);

  const emblem = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.035, 12, 32), chromeMaterial);
  emblem.position.set(0, 1, 4.39);
  emblem.rotation.x = Math.PI / 2;
  bodyGroup.add(emblem);

  const headlightMaterial = createMaterial({ color: 0x9bdcff, metalness: 0.18, roughness: 0.12, emissive: 0x2b96e8, emissiveIntensity: 1.9, transparent: true, opacity: 0.98 });
  const tailMaterial = createMaterial({ color: 0xff5e95, metalness: 0.3, roughness: 0.18, emissive: 0xff1d6a, emissiveIntensity: 1.7 });
  addRounded(bodyGroup, 0.72, 0.24, 0.12, [1.55, 1.15, 4.15], headlightMaterial, 0.03).rotation.z = -0.12;
  addRounded(bodyGroup, 0.72, 0.24, 0.12, [-1.55, 1.15, 4.15], headlightMaterial, 0.03).rotation.z = 0.12;
  addRounded(bodyGroup, 0.78, 0.22, 0.1, [1.58, 1.16, -4.16], tailMaterial, 0.03);
  addRounded(bodyGroup, 0.78, 0.22, 0.1, [-1.58, 1.16, -4.16], tailMaterial, 0.03);

  const mirrorMaterial = createMaterial({ color: 0x132242, metalness: 0.86, roughness: 0.2, clearcoat: 0.8 });
  addRounded(bodyGroup, 0.34, 0.24, 0.5, [2.12, 1.52, 1], mirrorMaterial, 0.08).rotation.z = -0.12;
  addRounded(bodyGroup, 0.34, 0.24, 0.5, [-2.12, 1.52, 1], mirrorMaterial, 0.08).rotation.z = 0.12;

  const tireMaterial = createMaterial({ color: 0x05070c, metalness: 0.12, roughness: 0.72 });
  const rimMaterial = createMaterial({ color: 0x9aa9c4, metalness: 0.96, roughness: 0.21, clearcoat: 0.6 });
  const brakeMaterial = createMaterial({ color: 0x6f7b91, metalness: 0.88, roughness: 0.29 });
  const caliperMaterial = createMaterial({ color: 0x7222ba, metalness: 0.64, roughness: 0.26, emissive: 0x25083d, emissiveIntensity: 0.45 });

  [[-1, 2.78], [1, 2.78], [-1, -2.8], [1, -2.8]].forEach(function (wheelData) {
    const side = wheelData[0];
    const z = wheelData[1];
    const wheel = new THREE.Group();
    wheel.position.set(side * 2.38, 0.74, z);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.42, 36), tireMaterial);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.45, 28), rimMaterial);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.46, 24), brakeMaterial);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.5, 16), chromeMaterial);
    const caliper = addRounded(wheel, 0.2, 0.45, 0.28, [side > 0 ? 0.2 : -0.2, 0.13, 0.22], caliperMaterial, 0.04);
    tire.rotation.z = Math.PI / 2;
    rim.rotation.z = Math.PI / 2;
    disc.rotation.z = Math.PI / 2;
    hub.rotation.z = Math.PI / 2;
    wheel.add(tire, rim, disc, hub);
    wheel.userData.partId = z > 0 ? "front-brakes" : "rear-brakes";
    caliper.userData.partId = wheel.userData.partId;
    wheel.userData.basePosition = wheel.position.clone();
    wheelGroup.add(wheel);
  });

  const underglow = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 7.8), new THREE.MeshBasicMaterial({ color: 0x5421c8, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending }));
  underglow.rotation.x = -Math.PI / 2;
  underglow.position.y = 0.02;
  bodyGroup.add(underglow);

  Object.keys(parts).forEach(function (partId) {
    const part = parts[partId];
    const assembly = buildAssembly(partId, part);
    assembly.position.fromArray(part.position);
    assemblyNodes[partId] = assembly;
    techGroup.add(assembly);
    const marker = new THREE.Group();
    marker.position.set(part.position[0], part.position[1], part.position[2]);
    marker.userData.partId = partId;
    const tint = colorMap[part.accent] || colorMap.violet;
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), new THREE.MeshStandardMaterial({ color: tint, emissive: tint, emissiveIntensity: 1.8, transparent: true, opacity: 0.92 }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.018, 8, 30), new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending }));
    ring.rotation.x = Math.PI / 2;
    marker.add(orb, ring);
    markerNodes[partId] = marker;
    markerBasePositions[partId] = new THREE.Vector3(part.position[0], part.position[1], part.position[2]);
    techGroup.add(marker);

    const hit = new THREE.Mesh(new THREE.BoxGeometry(Math.max(part.hitSize[0]*.65,.24), Math.max(part.hitSize[1]*.65,.24), Math.max(part.hitSize[2]*.65,.24)), new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: 0, depthWrite: false }));
    hit.position.set(part.position[0], part.position[1], part.position[2]);
    hit.userData.partId = partId;
    hitTargets.add(hit);
  });
}

function addLights() {
  scene.add(new THREE.HemisphereLight(0x9caeff, 0x02040a, 2.1));
  const key = new THREE.PointLight(0x9560ff, 145, 20, 2);
  key.position.set(5, 7, 7);
  scene.add(key);
  const fill = new THREE.PointLight(0x44cfff, 110, 18, 2);
  fill.position.set(-6, 4, 4);
  scene.add(fill);
  const rim = new THREE.PointLight(0xff5a9e, 80, 18, 2);
  rim.position.set(1, 4, -7);
  scene.add(rim);
  const floorLight = new THREE.PointLight(0x5121d9, 80, 14, 2);
  floorLight.position.set(0, 0.1, 0);
  scene.add(floorLight);
}

function addEnvironment() {
  const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshBasicMaterial({ color: 0x05091a, transparent: true, opacity: 0.8 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  floor.receiveShadow = true;
  scene.add(floor);
  const grid = new THREE.GridHelper(22, 22, 0x2b3e8a, 0x0e1b42);
  grid.position.y = -0.01;
  grid.material.transparent = true;
  grid.material.opacity = 0.26;
  scene.add(grid);
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = [];
  for (let index = 0; index < 220; index += 1) {
    starPositions.push((Math.random() - 0.5) * 24, Math.random() * 9 + 1, (Math.random() - 0.5) * 20 - 3);
  }
  starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
  scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0x8da8ff, size: 0.026, transparent: true, opacity: 0.68 })));
}

function initScene() {
  try {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030711, 0.027);
    camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    camera.position.set(7.6, 4.8, 10.5);
    renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 6.4;
    controls.maxDistance = 30;
    controls.minDistance = 4;
    controls.maxPolarAngle = Math.PI * .86;
    controls.target.set(0, 0.95, 0);
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.28;
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    addEnvironment();
    addLights();
    buildCar();
    resizeScene();
    window.addEventListener("resize", resizeScene);
    new ResizeObserver(resizeScene).observe(dom.sceneShell);
    dom.canvas.addEventListener("pointerdown", event => { pointerStart = {x:event.clientX,y:event.clientY}; dragging=false; });
    dom.canvas.addEventListener("pointerup", event => { if(pointerStart && Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)>5) dragging=true; });
    dom.canvas.addEventListener("pointercancel", () => {pointerStart=null;dragging=true;});
    dom.canvas.addEventListener("keydown", onCameraKey);
    dom.canvas.addEventListener("webglcontextlost", event => {
      event.preventDefault(); cancelAnimationFrame(animationFrame);
      dom.sceneLoading.innerHTML = '<span>The 3D view was paused by your device. <button type="button" onclick="location.reload()">Reload 3D</button></span>';
      dom.sceneLoading.classList.remove("is-hidden");
    });
    dom.canvas.addEventListener("pointermove", onCanvasPointerMove);
    dom.canvas.addEventListener("pointerleave", function () { dom.canvas.style.cursor = "grab"; });
    dom.canvas.addEventListener("click", onCanvasClick);
    dom.sceneLoading.classList.add("is-hidden");
    updateSceneState();
    animate();
  } catch (error) {
    dom.sceneLoading.innerHTML = "<span>3D scene unavailable · system atlas remains active</span>";
    dom.sceneLoading.classList.add("scene-error");
    console.error("Accord Systems Hub scene error", error);
  }
}

function resizeScene() {
  if (!renderer || !camera) return;
  const width = dom.sceneShell.clientWidth;
  const height = dom.sceneShell.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  if (controls) {
    const frameDistance = Math.min(28, Math.max(14, 14 / camera.aspect));
    camera.position.sub(controls.target).setLength(frameDistance).add(controls.target);
    controls.update();
  }
}

function getIntersection(event) {
  if (!raycaster || !camera || !hitTargets) return null;
  const rect = dom.canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const activeIds = systems[state.activeSystem].parts;
  const meshes = Object.entries(assemblyNodes).filter(([id,node])=>node.visible && activeIds.includes(id)).flatMap(([,node])=>node.children);
  const exact = raycaster.intersectObjects(meshes, true)[0];
  if (exact) return exact;
  return raycaster.intersectObjects(hitTargets.children.filter(node=>activeIds.includes(node.userData.partId)), false)[0] || null;
}

function onCanvasPointerMove(event) {
  const intersection = getIntersection(event);
  dom.canvas.style.cursor = intersection ? "pointer" : "grab";
}

function onCanvasClick(event) {
  if (dragging || !pointerStart) return;
  const intersection = getIntersection(event);
  const partId = intersection && intersection.object && intersection.object.userData.partId;
  if (partId) selectPart(partId, { keepSystem: true });
}

function animate() {
  animationFrame = requestAnimationFrame(animate);
  if (document.hidden) return;
  if (!renderer || !scene || !camera) return;
  const time = performance.now() * 0.001;
  Object.keys(markerNodes).forEach(function (partId, index) {
    const marker = markerNodes[partId];
    const ring = marker.children[1];
    if (ring && !reducedMotion) {
      ring.rotation.z += 0.008;
      ring.scale.setScalar(1 + Math.sin(time * 2.2 + index * 0.3) * 0.08);
    }
  });
  if (carRoot) carRoot.position.y = -.03;
  for (const [id,node] of Object.entries(assemblyNodes)) {
    node.position.lerp(node.userData.targetPosition, reducedMotion ? 1 : .14);
    markerNodes[id].position.copy(node.position);
    const hit = hitTargets.children.find(item=>item.userData.partId===id);
    if (hit) hit.position.copy(node.position);
  }
  if(bodyGroup) bodyGroup.position.y += ((state.exploded ? 2.5 : 0) - bodyGroup.position.y) * (reducedMotion ? 1 : .14);
  if(wheelGroup) wheelGroup.children.forEach(wheel=>{
    const base=wheel.userData.basePosition;
    wheel.position.x += (base.x*(state.exploded ? 1.45 : 1)-wheel.position.x)*(reducedMotion ? 1 : .14);
  });
  if (controls) controls.update();
  renderer.render(scene, camera);
  positionHotspots();
}

function renderSystemList() {
  const query = state.systemQuery.trim().toLowerCase();
  const filtered = systemOrder.filter(function (id) {
    if (!query) return true;
    const system = systems[id];
    return (system.label + " " + system.shortLabel + " " + system.description).toLowerCase().includes(query);
  });
  if (!filtered.length) {
    dom.systemList.innerHTML = '<div class="empty-state">No matching system</div>';
    return;
  }
  let html = "";
  filtered.forEach(function (id) {
    const system = systems[id];
    const count = id === "overview" ? Object.keys(parts).length : system.parts.length;
    html += '<button class="system-item ' + (state.activeSystem === id ? "is-active" : "") + '" type="button" data-system="' + id + '">' +
      '<span class="system-glyph" aria-hidden="true">' + system.glyph + '</span>' +
      '<span class="system-copy"><strong>' + escapeHTML(system.label) + '</strong><small>' + escapeHTML(system.shortLabel) + '</small></span>' +
      '<span class="system-count">' + String(count).padStart(2, "0") + "</span></button>";
  });
  dom.systemList.innerHTML = html;
  dom.systemList.querySelectorAll("[data-system]").forEach(function (button) {
    button.addEventListener("click", function () { selectSystem(button.dataset.system); });
  });
}

function renderHotspots() {
  const ids = state.activeSystem === "overview"
    ? [...new Set([state.selectedPart,"engine","battery","front-brakes","rear-brakes","radiator","fuel-pump","evaporator"])].slice(0,7)
    : systems[state.activeSystem].parts;
  dom.hotspots.innerHTML = ids.map(id => '<button class="hotspot ' + (state.selectedPart===id?'is-active':'') + '" type="button" data-part="'+id+'" aria-pressed="'+(state.selectedPart===id)+'"><span class="hotspot-dot"></span><span>'+escapeHTML(parts[id].label)+'</span></button>').join('');
  hotspotElements = [...dom.hotspots.querySelectorAll('[data-part]')];
  hotspotElements.forEach(button=>button.addEventListener('click',()=>selectPart(button.dataset.part,{keepSystem:true})));
  dom.hotspots.classList.toggle("is-hidden", !state.labels);
  dom.hotspots.inert = !state.labels;
}

const projected = new THREE.Vector3();
function positionHotspots() {
  if(!state.labels || !camera) return;
  const width=dom.sceneShell.clientWidth, height=dom.sceneShell.clientHeight;
  const occupied=[];
  for(const button of hotspotElements) {
    const node=markerNodes[button.dataset.part];
    if(!node) {button.style.visibility='hidden';continue;}
    node.getWorldPosition(projected);projected.project(camera);
    const inFrame=projected.z>-1 && projected.z<1 && Math.abs(projected.x)<1.1 && Math.abs(projected.y)<1.1;
    button.style.visibility=inFrame?'visible':'hidden';
    if(!inFrame)continue;
    const half=button.offsetWidth/2+6;
    let x=Math.max(half,Math.min(width-half,(projected.x*.5+.5)*width));
    let y=Math.max(66,Math.min(height-65,(-projected.y*.5+.5)*height-20));
    for(let step=0;step<7;step++) {
      if(!occupied.some(p=>Math.abs(p.x-x)<p.half+half && Math.abs(p.y-y)<33))break;
      y += y<height/2 ? 34 : -34;
    }
    y=Math.max(66,Math.min(height-65,y));
    occupied.push({x,y,half});
    button.style.left=x+'px';button.style.top=y+'px';
  }
}

function renderDetail() {
  const system = systems[state.activeSystem];
  const part = parts[state.selectedPart] || parts.engine;
  const ids = system.parts.length ? system.parts : Object.keys(parts);
  const index = Math.max(1, systemOrder.indexOf(state.activeSystem));
  dom.detailKicker.textContent = "SELECTED COMPONENT";
  dom.detailIndex.textContent = String(index).padStart(2, "0") + " / " + String(systemOrder.length - 1).padStart(2, "0");
  dom.detailIcon.textContent = part.glyph;
  dom.detailTitle.textContent = part.label;
  dom.detailSubtitle.textContent = part.subtitle;
  dom.detailSignal.textContent = part.signal;
  dom.detailSummary.textContent = part.summary;
  dom.detailNext.textContent = part.next;
  dom.partCount.textContent = String(ids.length).padStart(2, "0") + " PARTS";
  dom.viewerTitle.textContent = state.activeSystem === "overview" ? "Full vehicle systems view" : system.label + " layer";

  let html = "";
  ids.forEach(function (id) {
    const item = parts[id];
    html += '<button class="part-row ' + (state.selectedPart === id ? "is-selected" : "") + '" type="button" data-part="' + id + '">' +
      '<span class="part-thumb" aria-hidden="true">' + item.glyph + '</span>' +
      '<span class="part-copy"><strong>' + escapeHTML(item.label) + '</strong><small>' + escapeHTML(item.location) + '</small></span>' +
      '<span>' + escapeHTML(item.status) + "</span></button>";
  });
  dom.partList.innerHTML = html;
  dom.partList.querySelectorAll("[data-part]").forEach(function (button) {
    button.addEventListener("click", function () { selectPart(button.dataset.part, { keepSystem: true }); });
  });
  const inPlan = state.servicePlan.has(state.activeSystem === "overview" ? parts[state.selectedPart].system : state.activeSystem);
  dom.addPlanButton.innerHTML = inPlan ? '<span aria-hidden="true">✓</span> Layer added to service plan' : '<span aria-hidden="true">＋</span> Add layer to service plan';
  dom.addPlanButton.classList.toggle("is-active", inPlan);
}

function updateSceneState() {
  renderSystemList();
  renderDetail();
  renderHotspots();
  Object.keys(markerNodes).forEach(function (id) {
    const node = markerNodes[id];
    const part = parts[id];
    const inSystem = systems[state.activeSystem].parts.includes(id);
    const isSelected = state.selectedPart === id;
    node.visible = inSystem || isSelected;
    node.scale.setScalar(isSelected ? 1.45 : inSystem ? 1.05 : 0.72);
    node.children.forEach(function (child) {
      if (child.material) child.material.opacity = isSelected ? 1 : inSystem ? 0.76 : 0.26;
    });
  });

  const xray = state.view === "inspection" || state.activeSystem !== "overview" || state.exploded;
  if (bodyGroup) bodyGroup.traverse(node=>{
    if(!node.isMesh) return;
    const material=node.material;
    if(material.userData.baseOpacity===undefined) material.userData.baseOpacity=material.opacity;
    material.transparent=true;
    material.opacity=xray ? (state.exploded ? .16 : .075) : material.userData.baseOpacity*.78;
    material.depthWrite=!xray;
  });
  const ids=systems[state.activeSystem].parts;
  for (const [id,node] of Object.entries(assemblyNodes)) {
    const inSystem=ids.includes(id), selected=state.selectedPart===id;
    node.visible=inSystem;
    const base=markerBasePositions[id];
    const index=ids.indexOf(id);
    node.userData.targetPosition=base.clone();
    if(state.exploded && inSystem) {
      if(state.activeSystem==='overview') node.userData.targetPosition.set(base.x*1.3,base.y+.45+(index%3)*.27,base.z*1.15);
      else node.userData.targetPosition.set(((index%3)-1)*2.1,1.4+Math.floor(index/3)*1.5,(index%2?1.2:-1.2));
    }
    node.traverse(mesh=>{
      if(!mesh.isMesh)return;
      mesh.material.emissive.set(selected?0x633aa0:0x102032);
      mesh.material.emissiveIntensity=selected ? .6 : .1;
    });
  }
  dom.labelsToggle.setAttribute('aria-pressed',String(state.labels));
  dom.explodeToggle.setAttribute('aria-pressed',String(state.exploded));

  dom.sceneShell.classList.toggle("is-exploded", state.exploded);
  dom.sceneReadout.textContent = state.exploded ? "EXPLODED VIEW · DRAG TO ORBIT" : "DRAG TO ORBIT · SCROLL TO ZOOM";
  dom.explodeToggle.classList.toggle("is-active", state.exploded);
  dom.explodeToggle.innerHTML = state.exploded ? '<span aria-hidden="true">✣</span> Collapse view' : '<span aria-hidden="true">✣</span> Exploded view';
  dom.labelsToggle.classList.toggle("is-active", state.labels);
  dom.labelsToggle.innerHTML = state.labels ? '<span aria-hidden="true">◎</span> Labels' : '<span aria-hidden="true">◎</span> Show labels';
  document.querySelectorAll("[data-view]").forEach(function (button) { button.classList.toggle("is-active", button.dataset.view === state.view); button.setAttribute("aria-pressed",String(button.dataset.view === state.view)); });
}

function selectSystem(systemId) {
  if (!systems[systemId]) return;
  state.activeSystem = systemId;
  const systemPartIds = systems[systemId].parts.length ? systems[systemId].parts : Object.keys(parts);
  if (!systemPartIds.includes(state.selectedPart)) state.selectedPart = systemPartIds[0];
  updateSceneState();
  if (systemId !== "overview") showToast(systems[systemId].label + " layer selected");
}

function selectPart(partId, options) {
  if (!parts[partId]) return;
  state.selectedPart = partId;
  if (!options || !options.keepSystem || !systems[state.activeSystem].parts.includes(partId)) state.activeSystem = parts[partId].system;
  updateSceneState();
  showToast(parts[partId].label + " selected");
}

function renderSearchResults(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    dom.searchResults.classList.remove("is-open");
    dom.searchResults.innerHTML = "";
    return;
  }
  const partResults = Object.keys(parts).filter(function (id) {
    const part = parts[id];
    return (part.label + " " + part.subtitle + " " + part.location + " " + part.system).toLowerCase().includes(normalized);
  }).slice(0, 6);
  const systemResults = systemOrder.filter(function (id) { return id !== "overview"; }).filter(function (id) {
    return (systems[id].label + " " + systems[id].description).toLowerCase().includes(normalized);
  }).slice(0, 3);
  if (!partResults.length && !systemResults.length) {
    dom.searchResults.innerHTML = '<div class="empty-state">No parts or systems found</div>';
    dom.searchResults.classList.add("is-open");
    return;
  }
  let html = "";
  partResults.forEach(function (id) {
    const part = parts[id];
    html += '<button class="search-result" type="button" data-result-part="' + id + '">' +
      '<span class="search-result-icon">' + part.glyph + '</span>' +
      '<span><strong>' + escapeHTML(part.label) + '</strong><small>' + escapeHTML(part.subtitle) + '</small></span>' +
      '<span>' + escapeHTML(part.status) + "</span></button>";
  });
  systemResults.forEach(function (id) {
    html += '<button class="search-result" type="button" data-result-system="' + id + '">' +
      '<span class="search-result-icon">' + systems[id].glyph + '</span>' +
      '<span><strong>' + escapeHTML(systems[id].label) + '</strong><small>' + escapeHTML(systems[id].description) + '</small></span>' +
      "<span>LAYER</span></button>";
  });
  dom.searchResults.innerHTML = html;
  dom.searchResults.classList.add("is-open");
  dom.searchResults.querySelectorAll("[data-result-part]").forEach(function (button) {
    button.addEventListener("click", function () {
      selectPart(button.dataset.resultPart);
      dom.globalSearch.value = "";
      renderSearchResults("");
      document.getElementById("systems").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  dom.searchResults.querySelectorAll("[data-result-system]").forEach(function (button) {
    button.addEventListener("click", function () {
      selectSystem(button.dataset.resultSystem);
      dom.globalSearch.value = "";
      renderSearchResults("");
      document.getElementById("systems").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function togglePlan() {
  const systemId = state.activeSystem === "overview" ? parts[state.selectedPart].system : state.activeSystem;
  if (state.servicePlan.has(systemId)) {
    state.servicePlan.delete(systemId);
    showToast(systems[systemId].label + " removed from service plan");
  } else {
    state.servicePlan.add(systemId);
    showToast(systems[systemId].label + " added to service plan");
  }
  dom.planCount.textContent = String(state.servicePlan.size);
  try {localStorage.setItem('accord-service-plan',JSON.stringify([...state.servicePlan]));} catch {showToast('Added for this session; browser storage is unavailable.');}
  renderDetail();
  renderPlan();
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  dom.toast.textContent = message;
  dom.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(function () { dom.toast.classList.remove("is-visible"); }, 2300);
}

function openGuide() {
  const part = parts[state.selectedPart];
  showToast("Opening " + part.source + " reference");
  window.open(part.url, "_blank", "noopener,noreferrer");
}

function resetCamera() {
  if (!camera || !controls) return;
  camera.position.set(7.6, 4.8, 10.5);
  controls.target.set(0, 0.95, 0);
  resizeScene();
  controls.update();
  showToast("3D camera reset");
}

function attachEvents() {
  dom.systemSearch.addEventListener("input", function (event) {
    state.systemQuery = event.target.value;
    renderSystemList();
  });
  dom.globalSearch.addEventListener("input", function (event) {
    state.searchQuery = event.target.value;
    renderSearchResults(state.searchQuery);
  });
  dom.globalSearch.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      dom.globalSearch.value = "";
      renderSearchResults("");
      dom.globalSearch.blur();
    }
  });
  document.addEventListener("click", function (event) {
    if (!event.target.closest(".global-search")) renderSearchResults("");
  });
  document.querySelectorAll("[data-nav]").forEach(function (button) {
    button.addEventListener("click", function () {
      document.querySelectorAll("[data-nav]").forEach(function (item) { item.classList.toggle("is-active", item === button); });
      const target = button.dataset.nav;
      if (target === "overview") document.getElementById("overview").scrollIntoView({ behavior: "smooth", block: "start" });
      if (target === "systems") document.getElementById("systems").scrollIntoView({ behavior: "smooth", block: "start" });
      if (target === "parts") document.getElementById("parts").scrollIntoView({ behavior: "smooth", block: "start" });
      if (target === "resources") document.getElementById("resources").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  document.querySelectorAll("[data-system-card]").forEach(function (card) {
    card.addEventListener("click", function () {
      selectSystem(card.dataset.systemCard);
      document.getElementById("systems").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  document.querySelectorAll("[data-view]").forEach(function (button) {
    button.addEventListener("click", function () {
      state.view = button.dataset.view;
      updateSceneState();
      showToast(state.view === "inspection" ? "Inspection layer enabled" : "Atlas layer enabled");
    });
  });
  dom.labelsToggle.addEventListener("click", function () {
    state.labels = !state.labels;
    updateSceneState();
  });
  dom.explodeToggle.addEventListener("click", function () {
    state.exploded = !state.exploded;
    updateSceneState();
    showToast(state.exploded ? "Components spread into inspection view" : "Vehicle layers collapsed");
  });
  document.getElementById("reset-camera").addEventListener("click", resetCamera);
  dom.guideButton.addEventListener("click", openGuide);
  dom.addPlanButton.addEventListener("click", togglePlan);
  dom.planButton.addEventListener("click", function () {renderPlan();document.getElementById('plan-dialog').showModal();});
  document.getElementById('close-plan').addEventListener('click',()=>document.getElementById('plan-dialog').close());
  document.getElementById('zoom-in').addEventListener('click',()=>zoomCamera(.82));
  document.getElementById('zoom-out').addEventListener('click',()=>zoomCamera(1.2));
  document.querySelectorAll('[data-camera]').forEach(button=>button.addEventListener('click',()=>{
    if(!camera||!controls)return;
    const views={front:[0,3,16],top:[0,17,.01],side:[16,3,0]};
    camera.position.fromArray(views[button.dataset.camera]);controls.target.set(0,1,0);resizeScene();controls.update();
  }));
}

function renderPlan() {
  const target=document.getElementById('plan-items');
  target.innerHTML=state.servicePlan.size ? [...state.servicePlan].map(id=>'<div class="plan-row"><button type="button" class="plan-open" data-open-layer="'+id+'">'+escapeHTML(systems[id].label)+'<small>'+systems[id].parts.length+' components</small></button><button type="button" class="outline-button" data-remove-layer="'+id+'" aria-label="Remove '+escapeHTML(systems[id].label)+' from plan">Remove</button></div>').join('') : '<p class="empty-state">Select a system and choose “Add layer to service plan” to start your list.</p>';
  target.querySelectorAll('[data-open-layer]').forEach(button=>button.addEventListener('click',()=>{selectSystem(button.dataset.openLayer);document.getElementById('plan-dialog').close();document.getElementById('systems').scrollIntoView({behavior:'smooth'});}));
  target.querySelectorAll('[data-remove-layer]').forEach(button=>button.addEventListener('click',()=>{state.servicePlan.delete(button.dataset.removeLayer);try{localStorage.setItem('accord-service-plan',JSON.stringify([...state.servicePlan]));}catch{}dom.planCount.textContent=String(state.servicePlan.size);renderPlan();renderDetail();}));
}
function zoomCamera(factor) {
  if(!camera||!controls)return;
  const offset=camera.position.clone().sub(controls.target);
  offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));
  camera.position.copy(controls.target).add(offset);controls.update();
}
function onCameraKey(event) {
  if(!camera||!controls)return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(event.key))event.preventDefault();
  if(event.key==='+'||event.key==='=')return zoomCamera(.9);
  if(event.key==='-')return zoomCamera(1.1);
  const sphere=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  if(event.key==='ArrowLeft')sphere.theta-=.1;if(event.key==='ArrowRight')sphere.theta+=.1;
  if(event.key==='ArrowUp')sphere.phi-=.1;if(event.key==='ArrowDown')sphere.phi+=.1;
  sphere.phi=THREE.MathUtils.clamp(sphere.phi,.05,Math.PI*.86);
  camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sphere));controls.update();
}

dom.planCount.textContent = String(state.servicePlan.size);
document.querySelector('.status-pill').textContent=(systemOrder.length-1)+' SYSTEMS · '+Object.keys(parts).length+' COMPONENTS';
attachEvents();
renderSystemList();
renderDetail();
renderHotspots();
initScene();
