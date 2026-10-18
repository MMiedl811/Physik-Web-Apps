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
 function drawMain(){
  const {ctx,w,h}=prepare('mainCanvas'),scale=Math.min(w/680,h/370),cx=w/2,cy=h/2+16;
  const p=(x,y,z)=>[cx+scale*(x+.52*z),cy+scale*(-y-.3*z)];
  ctx.fillStyle='#eff4ef';ctx.fillRect(0,0,w,h);
  const left=cx-285*scale,right=cx+210*scale;
  ctx.fillStyle='#ecd0c4';ctx.fillRect(left,cy-110*scale,75*scale,220*scale);ctx.fillStyle='#cae3d0';ctx.fillRect(right,cy-110*scale,75*scale,220*scale);
  text(ctx,'N',left+37*scale,cy+6, '#a84e3f',28,'center');text(ctx,'S',right+37*scale,cy+6,'#387554',28,'center');
  for(const y of [-90,0,90])arrow(ctx,p(-185,y,0),p(185,y,0),'#a5bdc9',2);
  text(ctx,'Magnetfeld N → S',w/2,26,colors.field,15,'center');
  const x=110*Math.cos(state.angle),z=-110*Math.sin(state.angle),a=[-x,-z],b=[x,z];
  line(ctx,p(0,-145,0),p(0,145,0),'#7a8581',3);text(ctx,'Drehachse',cx+8,cy-145*scale,colors.ink,14);
  // Hintere Leiterseite zuerst, damit die Perspektive am Schnittpunkt eindeutig bleibt.
  const sides=[{pos:a,name:'A',direction:-state.polarity},{pos:b,name:'B',direction:state.polarity}].sort((u,v)=>u.pos[1]-v.pos[1]);
  line(ctx,p(...[a[0],105,a[1]]),p(b[0],105,b[1]),colors.wire,5);
  line(ctx,p(a[0],-105,a[1]),p(b[0],-105,b[1]),colors.wire,5);
  for(const side of sides){const [sx,sz]=side.pos;
   line(ctx,p(sx,-105,sz),p(sx,105,sz),colors.wire,8);
   text(ctx,side.name,...p(sx,120,sz),colors.ink,17,'center');
   if(state.current){arrow(ctx,p(sx+14,side.direction>0?-50:50,sz),p(sx+14,side.direction>0?50:-50,sz),colors.current,3);
    const force=-side.direction;arrow(ctx,p(sx,0,sz),p(sx,0,sz+force*105),colors.force,4)}
  }
  if(state.current){const topDir=state.polarity;arrow(ctx,p(topDir>0?b[0]*.6:a[0]*.6,105,topDir>0?b[1]*.6:a[1]*.6),p(topDir>0?a[0]*.6:b[0]*.6,105,topDir>0?a[1]*.6:b[1]*.6),colors.current,3);
   arrow(ctx,p(topDir>0?a[0]*.6:b[0]*.6,-105,topDir>0?a[1]*.6:b[1]*.6),p(topDir>0?b[0]*.6:a[0]*.6,-105,topDir>0?b[1]*.6:a[1]*.6),colors.current,3)}
  text(ctx,'Kraftpfeile: nach vorn / nach hinten',w/2,h-17,colors.force,14,'center');
 }
 function drawAxis(){
  const {ctx,w,h}=prepare('axisCanvas'),cx=w/2,cy=h/2+8,r=Math.min(w*.32,h*.32),co=Math.cos(state.angle),si=Math.sin(state.angle),a=[cx-r*co,cy-r*si],b=[cx+r*co,cy+r*si];
  ctx.fillStyle='#f0f4f0';ctx.fillRect(0,0,w,h);arrow(ctx,[25,29],[w-25,29],colors.field,2);text(ctx,'N → S',cx,20,colors.field,14,'center');
  ctx.strokeStyle='#cbd5ce';ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();ctx.setLineDash([]);
  line(ctx,a,b,colors.wire,5);
  for(const [point,name,dir] of [[a,'A',state.polarity],[b,'B',-state.polarity]]){
   ctx.fillStyle=colors.wire;ctx.beginPath();ctx.arc(...point,7,0,TAU);ctx.fill();text(ctx,name,point[0]+11,point[1]-9,colors.ink,14);
   if(state.current){arrow(ctx,point,[point[0],point[1]-dir*48],colors.force,3);
    ctx.setLineDash([3,4]);line(ctx,[cx,cy],[point[0],cy],'#866d4d',2);ctx.setLineDash([])}
  }
  ctx.fillStyle=colors.ink;ctx.beginPath();ctx.arc(cx,cy,5,0,TAU);ctx.fill();
  text(ctx,'gestrichelt: Hebelarme',cx,h-12,'#796a50',14,'center');
 }
 function render(){
  drawMain();drawAxis();const deg=Math.round(wrap(state.angle)*180/Math.PI)%360;$('angle').value=deg;$('angleRead').textContent=deg+'°';
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
 new ResizeObserver(render).observe($('mainCanvas'));new ResizeObserver(render).observe($('axisCanvas'));render();requestAnimationFrame(frame);
})();
