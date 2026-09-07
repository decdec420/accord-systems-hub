import * as THREE from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
import {buildAssembly} from './assemblies.js';
import {parts as legacyParts} from './atlas-data.js';
import {primaryPart} from './catalog-model.js';
// Spatial studies use source callout identities, but their mesh shapes and positions are illustrative.
// OEM diagrams remain the source for fitment, fastener positions, and installation references.
const v=a=>new THREE.Vector3(...a);
function material(color,metalness=.65,roughness=.32){return new THREE.MeshPhysicalMaterial({color,metalness,roughness,clearcoat:.35,clearcoatRoughness:.3});}
function kit(){return{silver:material(0xa7b2c6,.8,.29),cast:material(0x758395,.7,.46),dark:material(0x18202a,.35,.42),black:material(0x090f17,.05,.68),purple:material(0x9b54de,.5,.27),gold:material(0xc19b5a,.82,.3),copper:material(0xa36535,.9,.28)};}
function mesh(parent,geometry,mat,pos=[0,0,0]){const m=new THREE.Mesh(geometry,mat);m.position.fromArray(pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(p,w,h,d,mat,pos=[0,0,0],r=.04){return mesh(p,new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)),mat,pos);}
function cyl(p,r,h,mat,pos=[0,0,0],axis='y',segments=40){const m=mesh(p,new THREE.CylinderGeometry(r,r,h,segments),mat,pos);if(axis==='x')m.rotation.z=Math.PI/2;if(axis==='z')m.rotation.x=Math.PI/2;return m;}
function ring(p,r,t,mat,pos=[0,0,0],axis='z'){const m=mesh(p,new THREE.TorusGeometry(r,t,12,64),mat,pos);if(axis==='y')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.y=Math.PI/2;return m;}
function tube(p,points,r,mat){return mesh(p,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v)),64,r,16,false),mat);}
function component(root,ref,label,position,offset){const n=new THREE.Group();n.position.fromArray(position);n.userData={ref:String(ref),label,base:v(position),offset:v(offset),component:true};root.add(n);return n;}
function finish(root){root.traverse(n=>{if(n.isMesh){let p=n.parent;while(p&&!p.userData.component)p=p.parent;if(p){n.userData.ref=p.userData.ref;n.userData.systemId=p.userData.systemId;n.userData.label=p.userData.label;}n.material=n.material.clone();n.userData.baseColor=n.material.color.clone();n.userData.baseEmissive=n.material.emissive?.clone();}});return root;}
function bolt(root,ref,label,pos,offset,mats,axis='z',length=.22){const n=component(root,ref,label,pos,offset);cyl(n,.038,length,mats.silver,[0,0,0],axis,20);const head=cyl(n,.074,.06,mats.silver,axis==='z'?[0,0,length/2]:[0,length/2,0],axis,6);for(let i=0;i<5;i++)ring(n,.039,.006,mats.dark,axis==='z'?[0,0,-length/2+.025+i*.026]:[0,-length/2+.025+i*.026,0],axis);return n;}
function washer(root,ref,label,pos,offset,mats,r=.065){const n=component(root,ref,label,pos,offset);ring(n,r,.018,mats.silver);return n;}
export function buildIntake(){const root=new THREE.Group(),m=kit();root.userData.kind='intake';
 const manifold=component(root,'1','Intake manifold',[0,.25,0],[0,0,.28]);
 // Four runner volumes turn down toward the plenum; source chart supplies the component identities.
 for(let i=0;i<4;i++){const x=(i-1.5)*.46;tube(manifold,[[x,.57,-.36],[x,.55,-.02],[x,.36,.33],[x,-.12,.43],[x,-.42,.12]],.18,m.dark);ring(manifold,.184,.018,m.cast,[x,.51,-.24]);for(let j=0;j<5;j++)box(manifold,.02,.48,.03,m.cast,[x-.12+j*.06,.09,.59]);}
 box(manifold,2.04,.3,.16,m.cast,[0,.6,-.43]);
 for(let i=0;i<4;i++){ring(manifold,.15,.035,m.dark,[(i-1.5)*.46,.6,-.535]);cyl(manifold,.132,.015,m.black,[(i-1.5)*.46,.6,-.55],'z');}
 box(manifold,1.88,.4,.43,m.dark,[0,-.48,.02],.15);
 tube(manifold,[[.67,-.47,.03],[1.04,-.32,.02],[1.17,-.06,.17],[1.2,.13,.43]],.24,m.dark);
 ring(manifold,.25,.052,m.cast,[1.2,.13,.5]);cyl(manifold,.20,.025,m.black,[1.2,.13,.51],'z');
 const gasket=component(root,'2','Throttle body gasket',[1.2,.38,.58],[.25,.08,.92]);ring(gasket,.235,.022,m.purple);
 for(let i=0;i<4;i++){const seal=component(root,'3','Intake port gasket',[(i-1.5)*.46,.85,-.57],[0,.25,-.67]);ring(seal,.15,.025,m.purple);}
 const plate=component(root,'4','Throttle flange plate',[1.2,.38,.57],[.42,.22,.62]);box(plate,.59,.62,.045,m.cast);cyl(plate,.203,.053,m.black,[0,0,.009],'z');for(const x of [-.22,.22])for(const y of [-.23,.23])cyl(plate,.027,.054,m.black,[x,y,0],'z');
 const stay=component(root,'5','Lower manifold support',[-.27,-.78,-.3],[-.42,-.6,-.35]);box(stay,.30,.84,.08,m.cast,[0,-.04,0]);box(stay,.54,.12,.19,m.cast,[.04,.35,0]);box(stay,.40,.10,.25,m.cast,[.03,-.42,-.06]);for(const y of [-.40,.29])cyl(stay,.046,.11,m.black,[0,y,.035],'z');
 const harness=component(root,'6','Engine harness stay',[.62,-.56,-.32],[.65,-.42,-.2]);box(harness,.20,.38,.045,m.cast);box(harness,.42,.10,.05,m.cast,[.1,-.2,0]);
 const sensor=component(root,'7','MAP sensor',[.32,.88,-.03],[.13,.65,.2]);box(sensor,.3,.12,.24,m.dark);cyl(sensor,.052,.19,m.dark,[0,-.13,0]);box(sensor,.17,.11,.12,m.cast,[.18,.01,0]);
 const seal=component(root,'8','MAP sensor O-ring',[.32,.72,-.03],[.13,.38,.2]);ring(seal,.058,.014,m.purple,[0,0,0],'y');
 bolt(root,'9','Support stud',[-.27,-.51,-.25],[-.42,-.6,-.22],m,'z',.24);
 bolt(root,'10','MAP sensor bolt',[.41,.95,.02],[.13,.87,.2],m,'y',.15);
 for(const x of [-.93,.92]){const n=component(root,'11','Flange nut',[x,.85,-.52],[x*.4,.1,-.6]);cyl(n,.064,.07,m.silver,[0,0,0],'z',6);cyl(n,.082,.015,m.silver,[0,0,-.04],'z');}
 bolt(root,'12','Harness stay bolt',[.75,-.77,-.24],[.65,-.42,.35],m);
 bolt(root,'13','Lower support bolt',[-.24,-1.2,-.35],[-.4,-.85,.23],m);
 for(const x of [-.7,-.24,.24,.7])bolt(root,'14','Manifold mounting bolt',[x,.86,-.44],[0,.1,-.96],m,'z',.28);
 return finish(root);
}
export function buildAlternator(){const root=new THREE.Group(),m=kit();root.userData.kind='alternator';
 const front=component(root,'1','Alternator housing',[0,0,.28],[0,0,.2]);
 for(const z of [-.1,.18])ring(front,.63,.085,m.silver,[0,0,z]);
 for(let i=0;i<16;i++){const a=i*Math.PI/8;const rib=box(front,.11,.12,.36,m.silver,[Math.cos(a)*.64,Math.sin(a)*.64,.04]);rib.rotation.z=a;}
 ring(front,.23,.075,m.silver,[0,0,.25]);for(const a of [0,2.2,4.2]){const lug=box(front,.24,.34,.18,m.cast,[Math.cos(a)*.79,Math.sin(a)*.79,0]);lug.rotation.z=a;cyl(front,.068,.2,m.black,[Math.cos(a)*.79,Math.sin(a)*.79,.015],'z');}
 const rotor=component(root,'2','Rotor assembly',[0,0,0],[0,0,.95]);cyl(rotor,.35,.67,m.cast,[0,0,0],'z');cyl(rotor,.105,1.32,m.silver,[0,0,.2],'z');for(let i=0;i<10;i++){const a=i*Math.PI/5;box(rotor,.14,.13,.43,m.silver,[Math.cos(a)*.34,Math.sin(a)*.34,.0]).rotation.z=a;}
 const stator=component(root,'4','Rear frame and stator',[0,0,-.27],[0,0,-.6]);ring(stator,.54,.10,m.copper);ring(stator,.64,.057,m.cast,[0,0,-.05]);for(let i=0;i<32;i++){const a=i*Math.PI/16;const c=ring(stator,.075,.023,m.copper,[Math.cos(a)*.52,Math.sin(a)*.52,0],'x');c.rotation.y+=a;}
 const rear=component(root,'8','Rear end cover',[0,0,-.52],[0,0,-1.18]);cyl(rear,.59,.12,m.dark,[0,0,0],'z');for(let i=0;i<14;i++){const a=i*Math.PI/7;box(rear,.055,.17,.024,m.cast,[Math.cos(a)*.42,Math.sin(a)*.42,-.074]).rotation.z=a;}
 const brush=component(root,'3','Brush holder',[.31,.08,-.48],[.63,.28,-.7]);box(brush,.22,.3,.16,m.dark);box(brush,.11,.2,.08,m.gold,[0,0,.13]);
 for(const [ref,z,offset] of [['5',-.39,-.8],['6',.48,.75]]){const n=component(root,ref,'Generator bearing',[0,0,z],[0,0,offset]);ring(n,.16,.052,m.silver);ring(n,.15,.023,m.dark,[0,0,.039]);}
 const bush=component(root,'7','Insulation bush',[.52,.2,-.52],[.5,.3,-.7]);cyl(bush,.083,.15,m.black,[0,0,0],'z');
 const cover=component(root,'9','Bearing cover',[0,0,.53],[0,0,1.0]);ring(cover,.22,.033,m.cast);
 const pulley=component(root,'10','Drive pulley',[0,0,.69],[0,0,1.36]);cyl(pulley,.34,.21,m.dark,[0,0,0],'z');for(let i=0;i<6;i++)ring(pulley,.34,.015,m.silver,[0,0,-.1+i*.035]);
 const nut=component(root,'11','Pulley lock nut',[0,0,.85],[0,0,1.7]);cyl(nut,.12,.11,m.silver,[0,0,0],'z',6);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;bolt(root,'12','Housing bolt',[Math.cos(a)*.55,Math.sin(a)*.55,.16],[Math.cos(a)*.2,Math.sin(a)*.2,.85],m,'z',.65);}
 bolt(root,'13','Brush holder screw',[.34,.13,-.56],[.65,.25,-1.1],m,'z',.13);bolt(root,'14','Bearing cover screw',[.21,.12,.54],[.25,.17,1.1],m,'z',.14);const n=component(root,'15','Rear terminal nut',[.48,.2,-.64],[.55,.4,-1.35]);cyl(n,.07,.06,m.gold,[0,0,0],'z',6);
 return finish(root);
}
export function buildStudy(kind,group){if(kind==='intake')return buildIntake();if(kind==='alternator')return buildAlternator();const root=new THREE.Group();root.userData.kind=kind;const main=primaryPart(group);const n=component(root,main?.ref||'1',main?.name||group.name,[0,0,0],[0,0,0]);const geo=buildAssembly(kind,legacyParts[kind]||{accent:'violet'});n.add(geo);root.userData.single=true;return finish(root);}
export function buildVehicle(){const root=new THREE.Group(),m=kit();root.userData.kind='vehicle';const body=component(root,'body','Body & glass',[0,0,0],[0,1.5,0]);body.userData.systemId='body';const paint=material(0x213050,.87,.2);paint.transparent=true;paint.opacity=.17;paint.depthWrite=false;const glass=material(0x6d83ba,.32,.13);glass.transparent=true;glass.opacity=.18;glass.depthWrite=false;
 box(body,1.9,.46,4.55,paint,[0,.66,0],.20);box(body,1.84,.19,1.24,paint,[0,.94,1.53],.12);
 const cabin=new THREE.BufferGeometry();cabin.setAttribute('position',new THREE.Float32BufferAttribute([-.85,.91,.95,.85,.91,.95,-.71,1.53,.35,.71,1.53,.35,-.85,.91,-1.23,.85,.91,-1.23,-.71,1.53,-.65,.71,1.53,-.65],3));cabin.setIndex([0,1,2,1,3,2,4,6,5,5,6,7,0,2,4,2,6,4,1,5,3,3,5,7,2,3,6,3,7,6]);cabin.computeVertexNormals();glass.side=THREE.DoubleSide;mesh(body,cabin,glass);box(body,1.45,.055,1.04,paint,[0,1.54,-.15]);
 for(const side of [-1,1])for(const z of [-1.39,1.39]){const wheel=component(root,'suspension','Suspension & wheels',[side*.95,.47,z],[side*.8,-.07,0]);wheel.userData.systemId='suspension';ring(wheel,.36,.115,m.black,[0,0,0],'x');ring(wheel,.27,.05,m.silver,[side*.05,0,0],'x');cyl(wheel,.08,.17,m.silver,[side*.06,0,0],'x');for(let i=0;i<10;i++){const a=i*Math.PI/5;box(wheel,.06,.034,.26,m.cast,[side*.09,Math.cos(a)*.14,Math.sin(a)*.14]).rotation.x=-a;}}
 const positions=[['engine','engine',[0,.8,1.2],[0,.9,.2],.6],['ignition','battery',[-.58,.85,1.62],[-.6,.7,.5],.44],['transmission','transmission',[.62,.63,1.11],[.9,.1,.5],.7],['brakes','front-brakes',[.88,.45,1.39],[1,.1,.25],.68],['cooling','radiator',[0,.73,2.01],[0,.1,1],.65],['fuel','fuel-pump',[-.1,.32,-1.37],[0,.4,-.6],.7],['exhaust','catalytic',[.1,.26,-.27],[0,-.6,-.3],.75],['steering','steering',[0,.4,.75],[0,-.3,.5],.85],['hvac','compressor',[-.49,.6,.65],[-.9,.1,.2],.55],['electrical','fuses',[-.62,.78,.96],[-1,.75,0],.55],['safety','airbags',[-.49,1.05,.27],[-.6,1,.1],.75],['interior','doors',[.89,.91,-.5],[.8,.5,-.4],.65],['sensors','o2-sensors',[.37,.65,.45],[.8,.7,.2],.6],['accessories','headlights',[-.62,.86,2.16],[-.3,.1,1],.5]];
 for(const [sys,id,pos,offset,scale] of positions){const n=component(root,sys,sys,pos,offset);n.userData.systemId=sys;const assembly=buildAssembly(id,legacyParts[id]||{accent:'violet'});assembly.scale.setScalar(scale);n.add(assembly);}
 return finish(root);
}
