import * as THREE from 'three';
import { OrbitControls } from '../leiterschleife-magnetfeld/vendor/three/OrbitControls.js';

// The task sheet is always the world xy plane; +z means out of the sheet.
export function createScene(canvas, onCameraChange, onUnavailable) {
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
 const scene=new THREE.Scene();scene.background=new THREE.Color('#f7f8fa');
 const camera=new THREE.PerspectiveCamera(38,1,.1,80);
 const controls=new OrbitControls(camera,canvas);
 controls.enablePan=false;controls.minDistance=5;controls.maxDistance=15;
 controls.touches.TWO=THREE.TOUCH.DOLLY_ROTATE;
 scene.add(new THREE.HemisphereLight(0xffffff,0x74808a,2.4));
 const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(-3,5,6);scene.add(light);
 const sheet=new THREE.Mesh(new THREE.PlaneGeometry(5,3.6),new THREE.MeshBasicMaterial({color:'#d8e6f1',transparent:true,opacity:.32,side:THREE.DoubleSide,depthWrite:false}));
 scene.add(sheet);
 const outline=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[-2.5,-1.8,0],[2.5,-1.8,0],[2.5,1.8,0],[-2.5,1.8,0]].map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color:'#748493'}));scene.add(outline);
 function label(parent,caption,color,size=.48){
  const c=document.createElement('canvas');let ctx=c.getContext('2d');ctx.font='600 58px system-ui';c.width=Math.max(128,Math.ceil(ctx.measureText(caption).width)+40);c.height=128;ctx=c.getContext('2d');ctx.fillStyle='#ffffff';ctx.beginPath();ctx.roundRect(4,4,c.width-8,120,20);ctx.fill();
  ctx.font='600 58px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(caption,c.width/2,65);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));sprite.scale.set(size*c.width/c.height,size,1);sprite.renderOrder=5;parent.add(sprite);return sprite;
 }
 const sheetLabel=label(scene,'Bildebene','#465563',.48);sheetLabel.position.set(0,2.05,0);
 const xLabel=label(scene,'rechts →','#465563',.38);xLabel.position.set(1.85,-1.6,0);
 const yLabel=label(scene,'↑ oben','#465563',.38);yLabel.position.set(-1.95,1.55,0);
 const depthLabel=label(scene,'heraus ⊙','#465563',.40);depthLabel.position.set(-1.65,-1,1.5);
 const depthArrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,1),new THREE.Vector3(-1.65,-1,0),1.15,'#748493',.18,.09);scene.add(depthArrow);
 let content=new THREE.Group();scene.add(content);let task=null,particle=null,trail=null,samples=[];
 const origin=new THREE.Mesh(new THREE.SphereGeometry(.09,20,12),new THREE.MeshStandardMaterial({color:'#354543',transparent:true,opacity:.25}));scene.add(origin);
 function vector(parent,direction,color,caption,length=1.25,dashed=false){
  const d=new THREE.Vector3(...direction);if(d.length()<1e-8)return;
  const arrow=new THREE.ArrowHelper(d.normalize(),new THREE.Vector3(0,0,0),length,color,.20,.12);parent.add(arrow);
  const end=d.multiplyScalar(length+.32);const tag=label(parent,caption,color,.48);tag.position.copy(end);
  if(dashed){arrow.line.material=new THREE.LineDashedMaterial({color,dashSize:.10,gapSize:.07});arrow.line.computeLineDistances();}
 }
 function clearContent(){
  content.traverse(o=>{o.geometry?.dispose();for(const m of [o.material].flat().filter(Boolean)){m.map?.dispose();m.dispose();}});
  scene.remove(content);content=new THREE.Group();scene.add(content);
 }
 function build(next){
  task=next;clearContent();const M=window.FingerQuiz;
  vector(content,M.byId[task.v].vector,'#354543','v₀');
  vector(content,M.byId[task.b].vector,'#287caa','B',1.75);
  if(task.f!=='zero')vector(content,M.byId[task.f].vector,'#bd6e22','F₀');
  else{const tag=label(content,'keine Kraft','#995318');tag.position.set(0,-.65,0);}
  samples=Array.from({length:113},(_,i)=>new THREE.Vector3(...M.position(task,i*.025)));
  const curve=new THREE.CatmullRomCurve3(samples);
  const full=new THREE.Mesh(new THREE.TubeGeometry(curve,112,.012,8,false),new THREE.MeshBasicMaterial({color:'#0f766e',transparent:true,opacity:.22,depthWrite:false}));full.renderOrder=1;content.add(full);
  trail=new THREE.Mesh(new THREE.TubeGeometry(curve,112,.025,8,false),new THREE.MeshBasicMaterial({color:'#0f766e',transparent:true,opacity:1,depthWrite:false}));trail.renderOrder=2;content.add(trail);
  particle=new THREE.Mesh(new THREE.SphereGeometry(.16,24,16),new THREE.MeshStandardMaterial({color:task.q>0?'#b34735':'#287caa',roughness:.35}));content.add(particle);
  const charge=label(particle,task.q>0?'+':'−','#243c38',.40);charge.position.set(0,.38,0);
 }
 function draw(){renderer.render(scene,camera);}
 function resize(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.setSize(r.width,r.height,false);draw();}
 function view(name='space'){
  const aspect=canvas.getBoundingClientRect().width/Math.max(1,canvas.getBoundingClientRect().height);
  // Fit the entire reference sheet even in portrait/split-screen windows.
  const distance=Math.max(9,9/Math.max(.65,aspect));camera.up.set(0,1,0);
  camera.position.copy(new THREE.Vector3(...(name==='front'?[0,0,1]:[.7,.45,1])).normalize().multiplyScalar(distance));
  controls.target.set(0,0,0);controls.update();onCameraChange(name);resize();
 }
 controls.addEventListener('change',draw);controls.addEventListener('start',()=>onCameraChange('custom'));
 canvas.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key))return;e.preventDefault();
  const offset=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(offset);
  s.theta+=e.key==='ArrowLeft'?.12:e.key==='ArrowRight'?-.12:0;
  s.phi=THREE.MathUtils.clamp(s.phi+(e.key==='ArrowUp'?-.12:e.key==='ArrowDown'?.12:0),.05,Math.PI-.05);
  s.radius=THREE.MathUtils.clamp(s.radius*(e.key==='+'?.9:e.key==='-'?1/.9:1),5,15);
  camera.position.copy(controls.target).add(offset.setFromSpherical(s));controls.update();onCameraChange('custom');draw();
 });
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();observer.disconnect();controls.enabled=false;onUnavailable();});
 view();
 return {view,resize,update(next,time){if(task!==next)build(next);particle.position.fromArray(window.FingerQuiz.position(task,time));trail.geometry.setDrawRange(0,Math.min(112,Math.floor(time/.025))*8*6);draw();}};
}
