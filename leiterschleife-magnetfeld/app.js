(()=>{
 'use strict';
 const $=id=>document.getElementById(id),state={angle:0,omega:0,polarity:1,current:true,running:false},TAU=Math.PI*2;
 const colors={wire:'#a7663f',field:'#507e9a',current:'#0f766e',force:'#ba6d23',ink:'#243c38'};
 const wrap=a=>(a%TAU+TAU)%TAU;
 function arrow(ctx,a,b,color,width=3){
  const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<1)return;
  const ux=dx/len,uy=dy/len,h=Math.min(10,len*.3);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=width;
  ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();ctx.beginPath();ctx.moveTo(...b);ctx.lineTo(b[0]-ux*h-uy*h*.55,b[1]-uy*h+ux*h*.55);ctx.lineTo(b[0]-ux*h+uy*h*.55,b[1]-uy*h-ux*h*.55);ctx.closePath();ctx.fill();
 }
 function line(ctx,a,b,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke()}
 function text(ctx,s,x,y,color=colors.ink,size=16,align='left'){ctx.fillStyle=color;ctx.font=`700 ${size}px system-ui`;ctx.textAlign=align;ctx.fillText(s,x,y)}
 function prepare(id){const c=$(id),r=c.getBoundingClientRect(),d=devicePixelRatio||1;if(c.width!==Math.round(r.width*d)||c.height!==Math.round(r.height*d)){c.width=Math.round(r.width*d);c.height=Math.round(r.height*d)}const ctx=c.getContext('2d');ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,r.width,r.height);return {ctx,w:r.width,h:r.height}}
 let scene3d=null;
 function unavailable(){
  scene3d=null;$('mainCanvas').hidden=true;
  $('sceneMessage').hidden=false;$('sceneMessage').textContent='Die 3D-Ansicht ist hier nicht verfügbar. Nutze die Achsenansicht: Strom, Kräfte, Winkel und Bewegung bleiben dort bedienbar.';
  document.querySelectorAll('.scene-tools button').forEach(b=>b.disabled=true);
 }
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>scene3d?.view(b.dataset.view));
 $('viewReset').onclick=()=>scene3d?.view('space');
 import('./scene.js').then(({createScene})=>{
  scene3d=createScene($('mainCanvas'),name=>{
   document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));
   $('sceneHelp').textContent=name==='front'?'Von vorn: ⊙ Kraft aus dem Bildschirm heraus · ⊗ Kraft in den Bildschirm hinein. Ziehen ändert den Blickwinkel, der Winkelregler die Schleifenstellung.':'Ziehen: Blickwinkel ändern · Zwei Finger oder Mausrad: zoomen. Mit Tastatur: Pfeiltasten und +/−. Die Schleifenstellung bleibt dabei gleich.';
  },unavailable);
  $('sceneMessage').hidden=true;render();
 }).catch(unavailable);
 function drawAxis(){
  const {ctx,w,h}=prepare('axisCanvas'),cx=w/2,cy=h/2+5,r=Math.min(w*.29,(h-150)/2),co=Math.cos(state.angle),si=Math.sin(state.angle),a=[cx-r*co,cy+r*si],b=[cx+r*co,cy-r*si];
  ctx.fillStyle='#f7f8fa';ctx.fillRect(0,0,w,h);arrow(ctx,[25,29],[w-25,29],colors.field,2);text(ctx,'N → S',cx,20,colors.field,14,'center');
  ctx.strokeStyle='#cbd5ce';ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();ctx.setLineDash([]);
  line(ctx,a,b,colors.wire,5);
  for(const [point,name,dir] of [[a,'A',state.polarity],[b,'B',-state.polarity]]){
   ctx.fillStyle=colors.wire;ctx.beginPath();ctx.arc(...point,7,0,TAU);ctx.fill();text(ctx,name,point[0]+11,point[1]+5,colors.ink,16);
   if(state.current){arrow(ctx,point,[point[0],point[1]+dir*40],colors.force,3);
    ctx.setLineDash([3,4]);line(ctx,[point[0],cy-r-41],[point[0],cy+r+41],'#ba6d23',1);line(ctx,[cx,cy+20],[point[0],cy+20],'#866d4d',3);ctx.setLineDash([])}
  }
  ctx.fillStyle=colors.ink;ctx.beginPath();ctx.arc(cx,cy,5,0,TAU);ctx.fill();
  text(ctx,'Hebelarme: waagerecht',cx,h-33,'#796a50',14,'center');text(ctx,'Wirkungslinien: senkrecht',cx,h-12,colors.force,14,'center');
 }
 function render(){
  scene3d?.update(state);drawAxis();const deg=Math.round(wrap(state.angle)*180/Math.PI)%360;$('angle').value=deg;$('angleRead').textContent=deg+'°';
  $('run').textContent=state.running?'Pause':'Freier Lauf';$('current').textContent=state.current?'Strom an':'Strom aus';$('current').setAttribute('aria-pressed',String(state.current));
  const t=LoopModel.torque(state.angle,state.polarity,state.current),zero=Math.abs(t)<.05;
  $('effect').textContent=!state.current?'Drehwirkung: keine':zero?'Drehwirkung: null (Totpunkt)':t>0?'Drehwirkung: vorwärts':'Drehwirkung: rückwärts';
  let explanation=!state.current?'Ohne Strom wirken keine magnetischen Kräfte auf die Leiter. Vorhandener Schwung nimmt durch Reibung ab.':zero?'Die Kräfte wirken noch. Ihre Wirkungslinien gehen durch die Drehachse: Die Hebelarme sind null.':t*state.omega<-.08?'Die Schleife hat die Gleichgewichtslage überschritten. Die Kräfte bremsen sie und drehen sie zurück.':'Die entgegengesetzten Kräfte haben Hebelarme und drehen die Schleife.';
  if($('explanation').textContent!==explanation)$('explanation').textContent=explanation;
 }
 function manual(angle){state.running=false;state.angle=angle;state.omega=0;render()}
 $('run').onclick=()=>{state.running=!state.running;render()};$('current').onclick=()=>{state.current=!state.current;render()};$('reverse').onclick=()=>{state.polarity*=-1;render()};
 $('step').onclick=()=>manual(state.angle+Math.PI/12);$('dead').onclick=()=>manual(Math.PI/2);$('angle').oninput=e=>manual(Number(e.target.value)*Math.PI/180);
 $('reset').onclick=()=>{Object.assign(state,{angle:0,omega:0,polarity:1,current:true,running:false});render()};
 let last=performance.now();function frame(now){let dt=Math.min((now-last)/1000,.05);last=now;if(state.running){while(dt>0){const h=Math.min(dt,1/120);Object.assign(state,LoopModel.step(state,h,state.polarity,state.current));dt-=h}render()}requestAnimationFrame(frame)}
 new ResizeObserver(render).observe($('axisCanvas'));render();requestAnimationFrame(frame);
})();
