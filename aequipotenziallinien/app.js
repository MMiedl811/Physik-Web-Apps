'use strict';
const $=id=>document.getElementById(id);
const field=$('field'), preset=$('preset');
let charges=[], fixed=[], history=[], grid=[], tool='line', cursor=null, gesture=null, pending=0;
const plates=()=>preset.value==='plates';
const finitePlates=()=>plates()&&$('fringe').checked;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const volts=v=> (Math.abs(v)<.05?'0':v.toLocaleString('de-DE',{maximumFractionDigits:1}))+' V';
const tools=[...document.querySelectorAll('[data-tool]')];
function pathData(points){
  return points.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+' '+p.y.toFixed(2)).join('');
}
function stroke(d,color,width,dash=''){
  return '<path fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-dasharray="'+dash+'" d="'+d+'"/>';
}
function label(x,y,text,color){
  return '<text x="'+x+'" y="'+y+'" fill="'+color+'" font-size="17" font-weight="600" stroke="#f8fbfd" stroke-width="4" paint-order="stroke">'+text+'</text>';
}
function paths(v){
  if(plates()&&!finitePlates()){
    const x=360-4*v;
    return x<120||x>600?[]:[[{x,y:0},{x,y:HEIGHT}]];
  }
  return contours(grid,v);
}
function measure(p){
  if(!p) return null;
  if(finitePlates()){
    const onPlate=[strip.left,strip.right].some(x=>Math.abs(p.x-x)<=3 && p.y>=strip.top-3 && p.y<=strip.bottom+3);
    if(onPlate) return null;
  }else if((plates() ? p.x<=120||p.x>=600 : !charges.length||charges.some(c=>Math.hypot(c.x-p.x,c.y-p.y)<12))) return null;
  return finitePlates()?stripSample(p):sample(p,charges,plates());
}
function currentLine(p,measurement=measure(p)){
  if(!measurement) return null;
  let nearest=null, distance=Infinity;
  for(const points of paths(measurement.v)){
    for(const a of points){
      const d=Math.hypot(a.x-p.x,a.y-p.y);
      if(d<distance){distance=d;nearest=points;}
    }
  }
  return nearest?{...measurement,...p,d:pathData(nearest)}:null;
}
function drawReference(){
  const parts=[];
  if($('interval').checked && (plates()||charges.length)){
    for(let v=-60;v<=60;v+=10){
      if(finitePlates()&&Math.abs(v)===60) continue; // The plates already mark these levels.
      for(const points of paths(v)) parts.push(pathData(points));
    }
  }
  $('reference').innerHTML=parts.length?stroke(parts.join(''),'#768ea1',1.3):'';
  $('intervalKey').hidden=!$('interval').checked;
}
function drawFieldLines(){
  const enabled=$('lines').checked;
  $('fieldKey').hidden=!enabled;
  const mode=finitePlates()?'finite':plates()?'ideal':'charges';
  const lines=enabled?electricFieldLines(charges,mode):[];
  $('fieldLines').innerHTML=lines.map(points=>{
    const i=Math.floor((points.length-1)/2);
    const a=points[i],b=points[i+1];
    const angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
    const arrow='<g transform="translate('+((a.x+b.x)/2)+' '+((a.y+b.y)/2)+') rotate('+angle+')">'+stroke('M-5 -3L0 0 -5 3','#753d87',1.8)+'</g>';
    return stroke(pathData(points),'#753d87',1.4)+arrow;
  }).join('');
}
function renderScene(){
  grid=finitePlates()?finitePlateGrid():plates()?[]:makeGrid(charges);
  $('sources').innerHTML=finitePlates()?
    stroke('M'+strip.left+' '+strip.top+'V'+strip.bottom,'#b73e3c',6)+stroke('M'+strip.right+' '+strip.top+'V'+strip.bottom,'#275eb4',6)+label(strip.left-61,222,'+60 V','#9c3433')+label(strip.right+10,222,'−60 V','#204b93'):
    plates()?
    '<rect width="120" height="440" fill="#edf0f2"/><rect x="600" width="120" height="440" fill="#edf0f2"/>'+stroke('M120 0V440','#b73e3c',6)+stroke('M600 0V440','#275eb4',6)+label(42,34,'+60 V','#9c3433')+label(615,34,'−60 V','#204b93'):
    charges.map(c=>'<g transform="translate('+c.x+' '+c.y+')"><circle r="12" fill="'+(c.q>0?'#b73e3c':'#275eb4')+'"/><text y="6" fill="white" text-anchor="middle" font-size="20">'+(c.q>0?'+':'−')+'</text></g>').join('');
  $('model').textContent=finitePlates()?'Querschnitt durch zwei 6 m hohe Leiterplatten im Abstand von 2,4 m. In die Bildebene hinein sind sie unendlich ausgedehnt. Die Ladungsverteilung wird für feste Plattenpotenziale von +60 V und −60 V numerisch angenähert. Die Ansicht ist herausgezoomt. Ein Rasterabstand entspricht hier 80 cm.':plates()?'Ausschnitt zwischen idealen parallelen Platten im Abstand von 2,4 m. Links liegen +60 V an, rechts −60 V. Das Feld im Zwischenraum ist homogen. Randeffekte sind ausgeblendet.':'Jede Punktladung trägt +3 nC oder −3 nC. Die Einzelpotenziale addieren sich. Der Nullpunkt liegt im Unendlichen. Ein Rasterabstand entspricht 20 cm.';
  drawFieldLines(); drawReference(); renderFixed(); drawProbe();
}
function renderFixed(){
  $('fixed').innerHTML=fixed.map(l=>stroke(l.d,'#126864',3)+label(clamp(l.x+8,5,WIDTH-76),clamp(l.y-9,20,HEIGHT-5),volts(l.v),'#125d59')).join('');
  $('count').textContent=fixed.length+(fixed.length===1?' fixierte Linie':' fixierte Linien');
  $('undo').disabled=!history.length;
}
function drawProbe(){
  const reading=tool==='line'?measure(cursor):null;
  const line=reading && $('hoverLine').checked?currentLine(cursor,reading):null;
  $('previewKey').hidden=!$('hoverLine').checked;
  $('preview').innerHTML=line?stroke(line.d,'#56636f',2,'6 5'):'';
  $('value').textContent='φ = '+(reading?volts(reading.v):'— V');
  let marker='';
  if(cursor && (reading||tool!=='line')){
    const {x,y}=cursor;
    marker='<circle cx="'+x+'" cy="'+y+'" r="4" fill="#212d39" stroke="white" stroke-width="1.5"/>';
    if(reading && $('arrow').checked && Math.hypot(reading.ex,reading.ey)>1e-10){
      const angle=Math.atan2(reading.ey,reading.ex)*180/Math.PI;
      marker+='<g transform="translate('+x+' '+y+') rotate('+angle+')">'+stroke('M0 0H32 M24 -5L32 0 24 5','#753d87',3)+'</g>';
    }
  }
  $('probe').innerHTML=marker;
}
function queueProbe(){
  if(!pending) pending=requestAnimationFrame(()=>{pending=0;drawProbe();});
}
function setTool(next){
  tool=next;cursor=null;
  for(const b of tools){
    b.hidden=plates()&&b.dataset.tool!=='line';
    b.setAttribute('aria-pressed',String(b.dataset.tool===next));
  }
  $('hint').textContent=tool==='line'?(plates()?'Im Zwischenraum messen. Klicken oder nach dem Berühren loslassen, um die Linie zu fixieren.':'Klicken oder nach dem Berühren loslassen, um eine Linie zu fixieren. Ladungen lassen sich direkt verschieben.'):'Ins Feld tippen, um eine '+(tool==='positive'?'positive':'negative')+' Ladung zu setzen. Danach mit „Linie fixieren“ messen.';
  if(finitePlates()) $('hint').textContent='Vergleiche die Linien in der Mitte mit denen an den Plattenenden. Auch außerhalb der Platten kannst du messen.';
  drawProbe();
}
function reset(){
  const name=preset.value;
  $('fringeControl').hidden=!plates();
  charges=name==='free'||plates()?[]:name==='dipole'||name==='equal'?[{x:240,y:220,q:1},{x:480,y:220,q:name==='equal'?1:-1}]:[{x:360,y:220,q:name==='negative'?-1:1}];
  fixed=[];history=[];gesture=null;cursor=null;
  setTool(name==='free'?'positive':'line');renderScene();
}
function remember(){
  history.push({charges:charges.map(c=>({...c})),fixed:[...fixed],preset:preset.value});
}
function canPlace(p,skip){
  return charges.every((c,i)=>i===skip||Math.hypot(c.x-p.x,c.y-p.y)>=29);
}
function chargePoint(p){return {x:clamp(p.x,14,WIDTH-14),y:clamp(p.y,14,HEIGHT-14)};}
function apply(p){
  if(tool==='line'){
    const line=currentLine(p);
    if(!line||fixed.some(l=>l.d===line.d)) return;
    remember();fixed.push(line);renderFixed();
  }else{
    const target=chargePoint(p);
    if(!canPlace(target,-1)) return;
    remember();charges.push({...target,q:tool==='positive'?1:-1});
    preset.value='free';fixed=[];renderScene();
  }
}
function position(e){
  const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(field.getScreenCTM().inverse());
  return {x:point.x,y:point.y};
}
function inside(p){return p.x>=0&&p.x<=WIDTH&&p.y>=0&&p.y<=HEIGHT;}
field.onpointerdown=e=>{
  if(gesture||e.button!==0) return;
  const p=position(e);
  const hitRadius=Math.max(12,24*WIDTH/field.clientWidth);
  const hit=charges.map((c,index)=>({index,d:Math.hypot(c.x-p.x,c.y-p.y)})).sort((a,b)=>a.d-b.d)[0];
  gesture={id:e.pointerId,start:p,index:hit&&hit.d<hitRadius?hit.index:-1,moved:false};
  field.setPointerCapture(e.pointerId);cursor=p;drawProbe();
};
field.onpointermove=e=>{
  if(gesture&&gesture.id!==e.pointerId) return;
  const p=position(e);
  if(gesture&&gesture.index>=0){
    const g=gesture;
    if(Math.hypot(p.x-g.start.x,p.y-g.start.y)<4&&!g.moved) return;
    const target=chargePoint(p);
    if(!canPlace(target,g.index)) return;
    if(!g.moved){remember();g.moved=true;fixed=[];preset.value='free';}
    Object.assign(charges[g.index],target);cursor=null;renderScene();
  }else{cursor=inside(p)?p:null;queueProbe();}
};
field.onpointerup=e=>{
  if(gesture?.id!==e.pointerId) return;
  const p=position(e);
  if(!gesture.moved&&inside(p)) apply(p);
  gesture=null;cursor=e.pointerType==='mouse'&&inside(p)?p:null;drawProbe();
};
field.onpointercancel=()=>{gesture=null;cursor=null;drawProbe();};
field.onpointerleave=()=>{if(!gesture){cursor=null;drawProbe();}};
field.onkeydown=e=>{
  const steps={ArrowLeft:[-5,0],ArrowRight:[5,0],ArrowUp:[0,-5],ArrowDown:[0,5]};
  if(!(e.key in steps)&&e.key!=='Enter'&&e.key!==' ')return;
  e.preventDefault();cursor??={x:360,y:220};
  if(steps[e.key]){cursor={x:clamp(cursor.x+steps[e.key][0],0,WIDTH),y:clamp(cursor.y+steps[e.key][1],0,HEIGHT)};}
  else apply(cursor);
  drawProbe();
};
$('undo').onclick=()=>{
  const old=history.pop();if(!old)return;
  charges=old.charges;fixed=old.fixed;preset.value=old.preset;cursor=null;renderScene();
};
preset.onchange=()=>{$('fringe').checked=false;reset();};
$('fringe').onchange=reset;
tools.forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
$('lines').onchange=drawFieldLines;$('hoverLine').onchange=drawProbe;
$('interval').onchange=drawReference;$('arrow').onchange=drawProbe;
reset();
