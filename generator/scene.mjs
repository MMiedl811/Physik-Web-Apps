import * as THREE from 'three';
import { OrbitControls } from './vendor/three/OrbitControls.js';

// Own WebGL scene. All rotor parts have the SAME rigid transform about +y.
export function createScene(canvas, onView, onLost) {
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  const scene=new THREE.Scene();scene.background=new THREE.Color('#f7f8fa');
  const camera=new THREE.OrthographicCamera(-3,3,2.7,-2.7,.1,60);
  const controls=new OrbitControls(camera,canvas);controls.enablePan=false;
  controls.minZoom=.75;controls.maxZoom=1.8;controls.minPolarAngle=.06;controls.maxPolarAngle=Math.PI-.06;
  scene.add(new THREE.HemisphereLight(0xffffff,0x8c94a1,2.3));
  const light=new THREE.DirectionalLight(0xffffff,2.7);light.position.set(3,6,5);scene.add(light);
  const mats=new Map(),labels=[];
  const material=color=>{if(!mats.has(color))mats.set(color,new THREE.MeshStandardMaterial({color,roughness:.4,metalness:.16}));return mats.get(color);};
  function rod(parent,a,b,r,color){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,delta.length(),16),material(color));
    mesh.position.copy(start).add(end).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());parent.add(mesh);return mesh;
  }
  function route(parent,points,r,color){for(let i=1;i<points.length;i++)rod(parent,points[i-1],points[i],r,color);}
  function box(parent,size,at,color){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material(color));mesh.position.set(...at);parent.add(mesh);return mesh;}
  function label(parent,value,color,at,size=.28){
    const c=document.createElement('canvas');c.width=256;c.height=128;
    const ctx=c.getContext('2d');
    function paint(v){ctx.clearRect(0,0,256,128);ctx.fillStyle='rgba(255,255,255,.94)';ctx.beginPath();ctx.roundRect(4,4,248,120,24);ctx.fill();ctx.fillStyle=color;ctx.font='600 88px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(v,128,66);}
    paint(value);
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,depthWrite:false}));sprite.scale.set(size*2,size,1);sprite.position.set(...at);sprite.renderOrder=5;parent.add(sprite);labels.push(sprite);sprite.userData.baseSize=size;sprite.userData.write=v=>{paint(v);texture.needsUpdate=true;};return sprite;
  }
  const rotor=new THREE.Group();scene.add(rotor);
  // At theta=0: the winding lies in the yz plane, A at +z and B at -z.
  route(rotor,[[0,-.8,.24],[0,-.8,1],[0,.8,1],[0,.8,0]],.042,'#a84b0b');
  route(rotor,[[0,.8,0],[0,.8,-1],[0,-.8,-1],[0,-.8,-.24]],.042,'#08766f');
  rod(rotor,[0,-2.14,0],[0,1.21,0],.055,'#797e87');
  const tagA=label(rotor,'A','#a84b0b',[0,1.02,1.08],.25),tagB=label(rotor,'B','#08766f',[0,1.02,-1.08],.25);
  const terminal1=label(rotor,'1','#a84b0b',[.08,-.97,.53],.21),terminal2=label(rotor,'2','#08766f',[-.08,-.97,-.53],.21);
  // Mechanical support is insulating. No conductor passes through another ring.
  rod(scene,[0,-2.23,0],[0,-2.06,0],.19,'#505965');
  box(scene,[3.1,.10,2.4],[0,-2.3,0],'#e3e6eb');
  const poleTags=[];
  for(const [x,name,color] of [[-1.82,'N','#ba4d54'],[1.82,'S','#3c6daa']]){
    const geo=new THREE.BoxGeometry(.42,2.1,1.9),mat=new THREE.MeshStandardMaterial({color,transparent:true,opacity:.22,depthWrite:false});
    const pole=new THREE.Mesh(geo,mat);pole.position.set(x,.05,0);scene.add(pole);
    const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color}));edge.position.copy(pole.position);scene.add(edge);
    poleTags.push(label(scene,name,color,[x,1.33,0],.34));
  }
  const field=new THREE.Group();scene.add(field);
  for(const [y,z] of [[-.6,-.65],[.6,-.65],[-.6,.65],[.6,.65]])field.add(new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(-1.6,y,z),3.2,0x7c94a9,.13,.07));
  const forceA=new THREE.ArrowHelper(new THREE.Vector3(0,1,0),new THREE.Vector3(.13,0,1),.65,0x6f3a9e,.16,.08);
  const forceB=new THREE.ArrowHelper(new THREE.Vector3(0,-1,0),new THREE.Vector3(-.13,0,-1),.65,0x6f3a9e,.16,.08);
  const velocity=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(0,0,1),.6,0x315c8a,.16,.08);
  rotor.add(forceA,forceB,velocity);
  const faTag=label(rotor,'Fₑ','#6f3a9e',[.17,.72,1],.24),fbTag=label(rotor,'Fₑ','#6f3a9e',[-.17,-.72,-1],.24);
  const vTag=label(rotor,'v','#315c8a',[.72,0,1],.23);
  const normal=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(0,0,0),1.1,0x6f3a9e,.18,.09);rotor.add(normal);
  const normalTag=label(rotor,'n','#6f3a9e',[1.21,.09,0],.24);
  const area=new THREE.Mesh(new THREE.PlaneGeometry(2,1.6),new THREE.MeshBasicMaterial({color:'#a6cee5',transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}));area.rotation.y=Math.PI/2;rotor.add(area);

  // Closed annular sectors: hollow on the inside, with actual insulating gaps.
  function ring(parent,inner,outer,y0,y1,a0,a1,color){
    const positions=[],indices=[],segments=80;
    for(let i=0;i<=segments;i++){
      const a=a0+(a1-a0)*i/segments;
      for(const [r,y] of [[inner,y0],[outer,y0],[inner,y1],[outer,y1]])positions.push(r*Math.cos(a),y,r*Math.sin(a));
      if(i<segments){const k=i*4;for(const [a,b,c,d] of [[0,1,5,4],[2,6,7,3],[0,4,6,2],[1,3,7,5]])indices.push(k+a,k+b,k+c,k+a,k+c,k+d);}
    }
    indices.push(0,2,3,0,3,1);const k=segments*4;indices.push(k,k+1,k+3,k,k+3,k+2);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
    const mat=new THREE.MeshStandardMaterial({color,roughness:.32,metalness:.4,side:THREE.DoubleSide});
    const mesh=new THREE.Mesh(geo,mat);parent.add(mesh);return mesh;
  }
  const acRotor=new THREE.Group(),dcRotor=new THREE.Group();rotor.add(acRotor,dcRotor);
  for(const [y,color] of [[-1.30,'#a84b0b'],[-1.77,'#08766f']]){
    rod(acRotor,[0,y-.03,0],[0,y+.03,0],.27,'#444d59');
    ring(acRotor,.27,.35,y-.06,y+.06,0,Math.PI*2,color);
  }
  route(acRotor,[[0,-.8,.24],[0,-1.05,.3],[0,-1.24,.3]],.023,'#a84b0b');
  route(acRotor,[[0,-.8,-.24],[0,-1,-.15],[0,-1.65,-.15],[0,-1.71,-.30]],.023,'#08766f');
  rod(dcRotor,[0,-1.65,0],[0,-1.35,0],.27,'#444d59');
  ring(dcRotor,.27,.35,-1.65,-1.35,.045,Math.PI-.045,'#a84b0b');
  ring(dcRotor,.27,.35,-1.65,-1.35,Math.PI+.045,2*Math.PI-.045,'#08766f');
  route(dcRotor,[[0,-.8,.24],[0,-1.15,.30],[0,-1.35,.30]],.023,'#a84b0b');
  route(dcRotor,[[0,-.8,-.24],[0,-1.15,-.30],[0,-1.35,-.30]],.023,'#08766f');
  const acFixed=new THREE.Group(),dcFixed=new THREE.Group();scene.add(acFixed,dcFixed);
  for(const [i,y] of [[0,-1.30],[1,-1.77]]){
    box(acFixed,[.18,.10,.12],[.44,y,0],'#454953');
    route(acFixed,[[.53,y,0],[1.1,y,0]],.023,'#626269');
    label(acFixed,i===0?'X':'Y','#42424a',[1.22,y,.05],.23);
  }
  for(const [sign,name] of [[1,'X'],[-1,'Y']]){
    box(dcFixed,[.18,.12,.015],[sign*.44,-1.50,0],'#454953');
    route(dcFixed,[[sign*.53,-1.5,0],[sign*1.1,-1.5,0]],.023,'#626269');
    label(dcFixed,name,'#42424a',[sign*1.22,-1.5,.05],.23);
  }
  let activeView='space',lastPolarity=null,contactDetail=false,cachedState=null,cachedSample=null;
  const draw=()=>renderer.render(scene,camera);
  controls.addEventListener('change',draw);
  controls.addEventListener('start',()=>{activeView='custom';onView('custom');});
  function view(name){
    activeView=name;contactDetail=name==='contacts';camera.zoom=1;camera.up.set(0,1,0);
    const target=name==='contacts'?new THREE.Vector3(0,-1.44,0):new THREE.Vector3(0,-.4,0);
    if(name==='top'){camera.position.set(0,8,0);camera.up.set(0,0,-1);}
    else if(name==='front')camera.position.set(0,-.4,8);
    else if(name==='contacts'){camera.position.set(2,-.1,3.6);camera.zoom=1.7;}
    else camera.position.set(-6,3.4,7);
    controls.target.copy(target);camera.updateProjectionMatrix();controls.update();onView(name);resize();if(cachedState)update(cachedState,cachedSample);
  }
  canvas.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key))return;
    e.preventDefault();
    if(['+','-'].includes(e.key)){camera.zoom=THREE.MathUtils.clamp(camera.zoom*(e.key==='+'?1.12:1/1.12),.75,1.8);camera.updateProjectionMatrix();}
    else{
      const offset=camera.position.clone().sub(controls.target),sphere=new THREE.Spherical().setFromVector3(offset);
      sphere.theta+=(e.key==='ArrowLeft'?.14:e.key==='ArrowRight'?-.14:0);
      sphere.phi=THREE.MathUtils.clamp(sphere.phi+(e.key==='ArrowUp'?-.14:e.key==='ArrowDown'?.14:0),.06,Math.PI-.06);
      camera.up.set(0,1,0);camera.position.copy(controls.target).add(offset.setFromSpherical(sphere));
    }
    activeView='custom';onView('custom');controls.update();draw();
  });
  function resize(){
    const {width,height}=canvas.getBoundingClientRect();if(!width||!height)return;
    const aspect=width/height,h=Math.max(4.6,5.5/aspect);
    for(const sprite of labels){const size=Math.max(sprite.userData.baseSize,28*h/height/camera.zoom);sprite.scale.set(size*2,size,1);}
    camera.left=-h*aspect/2;camera.right=h*aspect/2;camera.top=h/2;camera.bottom=-h/2;
    camera.updateProjectionMatrix();renderer.setSize(width,height,false);draw();
  }
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();observer.disconnect();controls.enabled=false;onLost();});
  view('space');resize();
  function update(state,m){
    cachedState=state;cachedSample=m;
    rotor.rotation.y=m.theta;
    const polarity=Math.sign(m.emf);
    if(polarity!==lastPolarity){terminal1.userData.write(`1 ${polarity===0?'':polarity>0?'+':'−'}`);terminal2.userData.write(`2 ${polarity===0?'':polarity>0?'−':'+'}`);lastPolarity=polarity;}
    acRotor.visible=acFixed.visible=state.kind==='ac';dcRotor.visible=dcFixed.visible=state.kind==='dc';
    const lorentz=state.explanation==='lorentz';
    field.visible=tagA.visible=tagB.visible=!contactDetail;poleTags.forEach(t=>t.visible=!contactDetail);
    area.visible=normal.visible=normalTag.visible=!lorentz&&!contactDetail;
    forceA.visible=forceB.visible=faTag.visible=fbTag.visible=lorentz&&m.electronA!==0&&!contactDetail;
    if(m.electronA!==0){
      forceA.setDirection(new THREE.Vector3(0,m.electronA,0));forceB.setDirection(new THREE.Vector3(0,-m.electronA,0));
      const len=.65*Math.abs(m.sine);forceA.setLength(len,Math.min(.15,len*.35),.07);forceB.setLength(len,Math.min(.15,len*.35),.07);
      faTag.position.y=m.electronA*(len+.16);fbTag.position.y=-m.electronA*(len+.16);
    }
    velocity.visible=vTag.visible=lorentz&&m.omega!==0&&!contactDetail;
    velocity.setDirection(new THREE.Vector3(state.direction,0,0));vTag.position.x=state.direction*.74;
    draw();
  }
  return {view,update};
}
