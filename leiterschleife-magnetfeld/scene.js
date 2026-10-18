import * as THREE from 'three';
import { OrbitControls } from './vendor/three/OrbitControls.js';

// World: B along +x, rotation axis +y; the existing model uses rotation about +y.
export function createScene(canvas, onViewChange, onUnavailable) {
 const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false});
 renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
 const scene = new THREE.Scene();
 scene.background = new THREE.Color('#f7f8fa');
 const camera = new THREE.OrthographicCamera(-4,4,3,-3,.1,60);
 const controls = new OrbitControls(camera,canvas);
 controls.enablePan = false;
 controls.minZoom = .75; controls.maxZoom = 2;
 controls.minPolarAngle = .001; controls.maxPolarAngle = Math.PI-.001;
 controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
 scene.add(new THREE.HemisphereLight(0xffffff,0x777d87,2.6));
 const light = new THREE.DirectionalLight(0xffffff,3);
 light.position.set(-3,6,7); scene.add(light);
 const materials = {};
 function material(color){return materials[color] ||= new THREE.MeshStandardMaterial({color,roughness:.38,metalness:.12});}
 function rod(parent,a,b,r,color){
  const from = new THREE.Vector3(...a),to = new THREE.Vector3(...b),delta = to.clone().sub(from);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r,r,delta.length(),16),material(color));
  mesh.position.copy(from).add(to).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
  parent.add(mesh); return mesh;
 }
 function label(parent,text,color,scale=.4){
  const c=document.createElement('canvas');c.width=256;c.height=128;
  const ctx=c.getContext('2d');ctx.fillStyle='#ffffff';ctx.beginPath();ctx.roundRect(6,6,244,116,24);ctx.fill();
  ctx.fillStyle=color;ctx.font='600 68px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,128,65);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));
  sprite.scale.set(scale*2,scale,1);sprite.renderOrder=5;parent.add(sprite);return sprite;
 }
 function arrow(parent,a,b,color,r=.025){
  const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from),length=delta.length(),head=Math.min(.20,length*.3);
  const group=new THREE.Group();group.position.copy(from);group.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
  rod(group,[0,0,0],[0,length-head,0],r,color);
  const cone=new THREE.Mesh(new THREE.ConeGeometry(r*3,head,20),material(color));cone.position.y=length-head/2;group.add(cone);parent.add(group);return group;
 }
 const wire=new THREE.Group();scene.add(wire);
 for(const x of [-1,1])rod(wire,[x,-1.15,0],[x,1.15,0],.055,'#a7663f');
 for(const y of [-1.15,1.15])rod(wire,[-1,y,0],[1,y,0],.055,'#a7663f');
 rod(scene,[0,-1.65,0],[0,1.65,0],.018,'#7a8581');
 const axisLabel=label(scene,'Achse','#4b555e',.28);axisLabel.position.set(0,1.92,0);
 const sideLabels=[label(scene,'A','#243c38'),label(scene,'B','#243c38')];
 for(const [x,name,color] of [[-2.5,'N','#a84e3f'],[2.5,'S','#387554']]){
  const pole=new THREE.Mesh(new THREE.BoxGeometry(.28,2.8,1.9),new THREE.MeshStandardMaterial({color,transparent:true,opacity:.24,depthWrite:false}));
  pole.position.x=x;scene.add(pole);
  const tag=label(scene,name,color,.48);tag.position.set(x,1.85,0);
 }
 for(const [y,z] of [[1.45,-.65],[-1.45,-.65],[1.45,.65],[-1.45,.65]])arrow(scene,[-2.25,y,z],[2.25,y,z],'#507e9a',.017);
 const current=new THREE.Group();wire.add(current);
 // Both current and force arrows have real 3D geometry; no screen-space directions.
 const currents=[];
 for(const p of [1,-1]){
  const group=new THREE.Group();current.add(group);currents.push(group);
  arrow(group,[-.88,p*.55,.085],[-.88,-p*.55,.085],'#0f766e',.034);
  arrow(group,[.88,-p*.55,.085],[.88,p*.55,.085],'#0f766e',.034);
  arrow(group,[p*.55,1.03,.085],[-p*.55,1.03,.085],'#0f766e',.034);
  arrow(group,[-p*.55,-1.03,.085],[p*.55,-1.03,.085],'#0f766e',.034);
 }
 const forces=new THREE.Group();scene.add(forces);
 const forceGroups=[];
 for(const p of [1,-1]){
  const group=new THREE.Group();forces.add(group);forceGroups.push(group);
  for(const sign of [-1,1]){
   const g=new THREE.Group();group.add(g);
   arrow(g,[0,-.2,0],[0,-.2,-sign*p*1.05],'#ba6d23',.045);
   const tag=label(g,sign===-1?'Fₐ':'Fᵦ','#995318',.36);tag.position.set(0,-.2,-sign*p*1.3);
   const frontTag=label(g,(sign===-1?'Fₐ ':'Fᵦ ')+(-sign*p>0?'⊙':'⊗'),'#995318',.40);frontTag.position.set(0,-.2,0);frontTag.visible=false;
   g.userData.tags={tag,frontTag};
  }
 }
 let activeView='space';
 function setForceLabels(){for(const group of forceGroups)for(const g of group.children){g.userData.tags.tag.visible=activeView!=='front';g.userData.tags.frontTag.visible=activeView==='front';}}
 function draw(){renderer.render(scene,camera);}
 function view(name){
  activeView=name;setForceLabels();camera.zoom=1;camera.up.set(0,1,0);
  if(name==='top'){camera.position.set(0,8,0);camera.up.set(0,0,-1);}
  else if(name==='front')camera.position.set(0,0,8);
  else camera.position.set(3.4,2.8,6);
  controls.target.set(0,0,0);camera.updateProjectionMatrix();controls.update();onViewChange(name);draw();
 }
 controls.addEventListener('change',draw);
 controls.addEventListener('start',()=>{activeView='custom';setForceLabels();onViewChange(activeView);});
 canvas.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key))return;
  e.preventDefault();
  if(e.key==='+'||e.key==='-'){camera.zoom=THREE.MathUtils.clamp(camera.zoom*(e.key==='+'?1.12:1/1.12),.75,2);camera.updateProjectionMatrix();}
  else{const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);
   spherical.theta+=e.key==='ArrowLeft'?.12:e.key==='ArrowRight'?-.12:0;
   spherical.phi=THREE.MathUtils.clamp(spherical.phi+(e.key==='ArrowUp'?-.12:e.key==='ArrowDown'?.12:0),.001,Math.PI-.001);
   camera.up.set(0,1,0);camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));}
  activeView='custom';setForceLabels();onViewChange(activeView);controls.update();draw();
 });
 function resize(){
  const {width,height}=canvas.getBoundingClientRect();if(!width||!height)return;
  const aspect=width/height,h=Math.max(5.2,6.8/aspect);
  camera.left=-h*aspect/2;camera.right=h*aspect/2;camera.top=h/2;camera.bottom=-h/2;
  camera.updateProjectionMatrix();renderer.setSize(width,height,false);draw();
 }
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();observer.disconnect();controls.enabled=false;onUnavailable();});
 view('space');resize();
 return {view,update(state){
  wire.rotation.y=state.angle;
  const x=Math.cos(state.angle),z=-Math.sin(state.angle);
  sideLabels[0].position.set(-x,1.43,-z);sideLabels[1].position.set(x,1.43,z);
  current.visible=forces.visible=state.current;
  currents.forEach((g,i)=>g.visible=state.polarity===(i===0?1:-1));
  forceGroups.forEach((g,i)=>{g.visible=state.polarity===(i===0?1:-1);g.children[0].position.set(-x,0,-z);g.children[1].position.set(x,0,z);});
  draw();
 }};
}
