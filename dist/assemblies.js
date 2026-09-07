import * as THREE from 'three';

// Educational component geometry, not OEM CAD or installation geometry.
export function buildAssembly(id, part) {
  const group = new THREE.Group();
  const tint = {violet:0x9675ee,cyan:0x53bccf,blue:0x6085cf,amber:0xe0a966}[part.accent];
  const metal = new THREE.MeshStandardMaterial({color:0x8896ac,metalness:.75,roughness:.32});
  const dark = new THREE.MeshStandardMaterial({color:0x172334,metalness:.28,roughness:.55});
  const accent = new THREE.MeshStandardMaterial({color:tint,metalness:.48,roughness:.32,emissive:tint,emissiveIntensity:.16});
  const light = new THREE.MeshStandardMaterial({color:0xd7e0e9,metalness:.3,roughness:.3});
  const gold = new THREE.MeshStandardMaterial({color:0xc4a165,metalness:.75,roughness:.3});
  function box(w,h,d,x=0,y=0,z=0,mat=metal){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);group.add(m);return m;}
  function cyl(r,h,x=0,y=0,z=0,mat=metal,axis='y'){
    const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),mat);
    if(axis==='x')m.rotation.z=Math.PI/2;if(axis==='z')m.rotation.x=Math.PI/2;
    m.position.set(x,y,z);group.add(m);return m;
  }
  function tube(points,r=.04,mat=metal){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,36,r,8,false),mat);group.add(m);return m;}
  function torus(r,t,x=0,y=0,z=0,mat=metal,axis='z'){const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,10,40),mat);m.position.set(x,y,z);if(axis==='x')m.rotation.y=Math.PI/2;if(axis==='y')m.rotation.x=Math.PI/2;group.add(m);return m;}
  if(id==='engine'){
    box(1.35,.55,.85,0,-.08,0);box(1.48,.17,.83,0,.27,0,accent);
    for(let i=0;i<4;i++){box(.06,.5,.9,-.54+i*.36,-.06,0,dark);cyl(.09,.07,-.5+i*.33,.4,0,dark);tube([[-.5+i*.33,.15,.38],[-.5+i*.33,-.12,.65],[-.5+i*.33,-.28,.4]],.065);}
    cyl(.23,.12,-.73,-.05,0,dark,'x');box(1.05,.16,.6,0,-.43,0,dark);
  }else if(id==='transmission'){
    cyl(.42,.8,0,0,0,metal,'x');cyl(.51,.12,.4,0,0,metal,'x');box(.55,.4,.65,-.23,-.12,0,accent);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;cyl(.033,.15,.44,Math.cos(a)*.43,Math.sin(a)*.43,dark,'x');}
  }else if(id==='spark-plugs'||id==='ignition-coils'||id==='injectors'){
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.24;
      cyl(.038,.22,x,-.09,0,metal);cyl(.065,.12,x,.06,0,id==='spark-plugs'?light:dark);
      if(id==='spark-plugs'){cyl(.052,.08,x,-.22,0,gold);for(let k=0;k<3;k++)torus(.065,.013,x,.09+k*.035,0,light,'y');}
      else box(.16,.09,.13,x,.18,0,accent);
    }
    if(id==='injectors')tube([[-.48,.22,0],[.48,.22,0]],.045,gold);
  }else if(id==='battery'){
    box(.63,.46,.7,0,0,0,dark);box(.69,.07,.76,0,.26,0,accent);
    cyl(.04,.06,-.22,.32,.21,gold);cyl(.04,.06,.22,.32,.21,gold);box(.4,.18,.012,0,0,.357,light);
    tube([[-.18,.3,0],[-.18,.4,0],[.18,.4,0],[.18,.3,0]],.025,dark);
  }else if(['starter','alternator','compressor','water-pump','blower'].includes(id)){
    cyl(.27,.48,0,0,0,metal,'x');cyl(.3,.06,.27,0,0,dark,'x');cyl(.09,.13,.32,0,0,gold,'x');
    for(let i=0;i<12;i++){const a=i*Math.PI/6;box(.35,.035,.055,0,Math.cos(a)*.27,Math.sin(a)*.27,dark);}
    if(id==='starter')cyl(.11,.29,-.04,.32,0,accent,'x');
    if(id==='blower')for(let i=0;i<12;i++){const a=i*Math.PI/6;box(.08,.26,.025,.3,Math.cos(a)*.15,Math.sin(a)*.15,accent).rotation.x=a;}
  }else if(['front-brakes','rear-brakes','wheel-bearings','tpms'].includes(id)){
    const radius=id==='tpms'?.18:.42;
    cyl(radius,.09,0,0,0,metal,'x');cyl(radius*.35,.15,0,0,0,dark,'x');
    torus(radius*.78,.014,.054,0,0,accent,'x');
    for(let i=0;i<5;i++){const a=i*Math.PI*.4;cyl(.026,.18,0,Math.cos(a)*radius*.45,Math.sin(a)*radius*.45,gold,'x');}
    if(id.includes('brakes'))box(.22,.37,.18,.05,.1,.32,accent);
  }else if(id==='calipers'){
    box(.3,.4,.3,0,0,0,accent);box(.33,.24,.07,0,0,.18,dark);cyl(.09,.3,0,0,0,metal,'x');
  }else if(id==='struts'){
    cyl(.09,.9,0,0,0,metal);cyl(.13,.44,0,-.25,0,dark);
    const points=[];for(let i=0;i<=150;i++){const a=i/150*Math.PI*12;points.push([Math.cos(a)*.2,-.28+i/150*.7,Math.sin(a)*.2]);}tube(points,.028,accent);
    cyl(.25,.05,0,.46,0,dark);cyl(.25,.05,0,-.3,0,dark);
  }else if(id==='cv-axles'||id==='steering'){
    cyl(.06,1.3,0,0,0,metal,'x');
    for(const side of [-1,1]){for(let i=0;i<5;i++)cyl(.08+i*.015,.045,side*(.42+i*.048),0,0,dark,'x');cyl(.11,.14,side*.77,0,0,accent,'x');}
  }else if(id==='control-arms'){
    tube([[-.4,0,-.35],[.35,0,0],[-.4,0,.35],[-.4,0,-.35]],.07,metal);
    for(const z of [-.35,.35])cyl(.1,.13,-.4,0,z,dark);cyl(.12,.19,.35,0,0,accent);
  }else if(['radiator','condenser','evaporator'].includes(id)){
    const w=id==='evaporator'?1:2.25;
    box(w,.61,.1,0,0,0,dark);
    for(let i=0;i<27;i++)box(w,.012,.12,0,-.27+i*.021,0,metal);
    box(.1,.69,.18,-w/2,0,0,accent);box(.1,.69,.18,w/2,0,0,accent);
    if(id==='radiator')for(const x of [-.55,.55]){torus(.23,.04,x,0,-.16,dark);cyl(.06,.1,x,0,-.16,accent,'z');}
  }else if(['coolant-hoses','parking-brake','weatherstrip'].includes(id)){
    tube([[-.45,0,-.4],[-.3,.18,0],[.27,.12,.2],[.45,0,.5]],.07,id==='parking-brake'?metal:dark);
    cyl(.095,.07,-.45,0,-.4,metal);
  }else if(['catalytic','fuel-pump'].includes(id)){
    cyl(.23,.64,0,0,0,id==='catalytic'?metal:light,'z');cyl(.07,1.05,0,0,0,gold,'z');
    torus(.23,.02,0,0,.24,accent);torus(.23,.02,0,0,-.24,accent);
  }else if(['engine-oil','atf','coolant','brake-fluid'].includes(id)){
    box(.46,.3,.48,0,0,0,id==='engine-oil'||id==='atf'?metal:light);cyl(.11,.08,0,.2,0,accent);
  }else if(id==='doors'){
    box(.06,.61,1.3,0,0,0,accent);box(.07,.33,1.05,0,.47,0,dark);box(.09,.045,.2,.06,.17,-.2,metal);
  }else if(id==='headlights'||id==='tail-lamps'){
    box(.58,.2,.13,0,0,0,accent);for(let i=0;i<3;i++)cyl(.067,.14,-.19+i*.19,0,0,light,'z');
  }else if(id==='seatbelts'){
    tube([[-.14,-.3,0],[.1,.4,0],[.16,-.23,.1]],.045,dark);box(.15,.14,.09,.16,-.23,.1,accent);
  }else if(id==='airbags'){
    torus(.26,.035,0,0,0,dark);box(.3,.2,.14,0,0,0,accent);
  }else if(id==='fuses'||id==='starter-relay'||id==='abs-module'){
    box(.45,.3,.4,0,0,0,id==='abs-module'?metal:dark);
    for(let i=0;i<6;i++)box(.065,.09,.08,(i%3-1)*.12,.2,(i<3?-.09:.09),accent);
    if(id==='abs-module')for(let i=0;i<4;i++)tube([[(i-1.5)*.09,.2,0],[(i-1.5)*.1,.36,.1],[(i-1.5)*.15,.38,.3]],.016,gold);
  }else{
    cyl(.1,.22,0,0,0,metal);box(.19,.15,.13,0,.19,0,accent);tube([[0,.26,0],[.14,.36,0],[.26,.32,.08]],.022,dark);
  }
  group.traverse(node=>{if(node.isMesh){node.castShadow=true;node.userData.partId=id;node.material.userData.originalEmissive=node.material.emissiveIntensity||0;}});
  group.userData.partId=id;
  return group;
}
