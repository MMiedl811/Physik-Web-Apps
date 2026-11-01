import { defaults, sample, advance, wrap, radians, parameters, carrierForceA } from './model.mjs';

const $ = id => document.getElementById(id);
const state = { ...defaults, running: false };
let scene=null;
const fmt = (n, digits = 2) => (Math.abs(n) < 1e-9 ? 0 : n).toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const sgn = n => Math.abs(n) < 1e-9 ? 0 : Math.sign(n);
const p2 = v => v.map(x => Number(x.toFixed(2))).join(',');
const project = ([x,y,z]) => [380 + 125*x + 50*z, 165 - 100*y + 26*z];
const line = (points, color, width = 4, extra = '') => `<polyline points="${points.map(p2).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const path3 = (points, color, width = 4, extra = '') => line(points.map(project), color, width, extra);
const text = (x,y,value,extra='') => `<text x="${x}" y="${y}" ${extra}>${value}</text>`;
const dot = (x,y,label,color) => `<circle cx="${x}" cy="${y}" r="16" fill="white" stroke="${color}" stroke-width="3"/>${text(x,y+7,label,'text-anchor="middle" style="font-size:21px;font-weight:600"')}`;
function arrow(a,b,color,width=3){
  if(Math.hypot(b[0]-a[0],b[1]-a[1])<1)return '';
  const d=Math.atan2(b[1]-a[1],b[0]-a[0]), size=10;
  return line([a,b],color,width)+`<path d="M${p2(b)} L${p2([b[0]-size*Math.cos(d-.45),b[1]-size*Math.sin(d-.45)])} L${p2([b[0]-size*Math.cos(d+.45),b[1]-size*Math.sin(d+.45)])}Z" fill="${color}"/>`;
}
function magnet(x, label, fill) {
  const y=.99,z=.95,w=.48;
  const face=[[x,-y,-z],[x+w,-y,-z],[x+w,y,-z],[x,y,-z]];
  const top=[[x,y,-z],[x+w,y,-z],[x+w,y,z],[x,y,z]];
  const front=[[x,-y,z],[x+w,-y,z],[x+w,y,z],[x,y,z]];
  const side=[[x+w,-y,-z],[x+w,-y,z],[x+w,y,z],[x+w,y,-z]];
  const poly=(pts,f)=>`<polygon points="${pts.map(project).map(p2).join(' ')}" fill="${f}" stroke="${fill}" stroke-width="2"/>`;
  const center=project([x+w/2,0,z]);
  return poly(face,fill)+poly(side,label==='N'?'#f1c0c1':'#bdd1ee')+poly(top,label==='N'?'#f5d6d6':'#d3e3f6')+poly(front,label==='N'?'#f9eeee':'#edf3fb')+text(center[0],center[1]+11,label,'text-anchor="middle" class="big"');
}
function machine(m) {
  const force=carrierForceA(m,state.carrier),forceLabel=state.carrier==='positive'?'F₊':'Fₑ';
  $('machine').dataset.forceA=String(force);
  const r=m.sideA, at=(factor,y)=>[r[0]*factor,y,r[2]*factor];
  const title='<title id="machineTitle">Rotierende Spule im festen Magnetfeld</title><desc id="machineDesc">Nordpol links, Südpol rechts. Leiterseite A ist kupferfarben, B türkis. Die Darstellung und alle Werte gehören zum gleichen Drehwinkel.</desc>';
  let out=title+magnet(-2.1,'N','#b54a4f')+magnet(1.62,'S','#426eaa');
  for(const y of [-.55,0,.55])out+=arrow(project([-1.55,y,-.5]),project([1.5,y,-.5]),'#9eacb4',2);
  out+=text(515,58,'B →','style="font-size:24px;fill:#47545c"');
  out+=path3([[0,-1.15,0],[0,1.3,0]],'#8c8c95',3,'stroke-dasharray="7 7"');
  // The open winding is split into two colored sides; the gap is at its bottom.
  if(state.explanation==='flux'){
    const corners=[at(1,-.8),at(1,.8),at(-1,.8),at(-1,-.8)];
    out+=`<polygon points="${corners.map(project).map(p2).join(' ')}" fill="#c6ddeb" fill-opacity=".5" stroke="none"/>`;
  }
  out+=path3([at(.24,-.8),at(1,-.8),at(1,.8),at(0,.8)],'#a84b0b',7);
  out+=path3([at(0,.8),at(-1,.8),at(-1,-.8),at(-.24,-.8)],'#08766f',7);
  const a=project(at(1,0)),b=project(at(-1,0));
  out+=dot(a[0],a[1],'A','#a84b0b')+dot(b[0],b[1],'B','#08766f');
  const t1=project(at(.24,-.8)),t2=project(at(-.24,-.8));
  out+=path3([at(.24,-.8),at(.24,-1.2)],'#a84b0b',4)+path3([at(-.24,-.8),at(-.24,-1.2)],'#08766f',4);
  // Static labels identify coil ends without implying a permanent pole.
  const sign=sgn(m.emf);
  out+=text(t1[0]+14,t1[1]+45,`1 ${sign===0?'':sign>0?'+':'−'}`,'style="font-size:23px;fill:#a84b0b"')+text(t2[0]-48,t2[1]+45,`2 ${sign===0?'':sign>0?'−':'+'}`,'style="font-size:23px;fill:#08766f"');
  if(state.explanation==='lorentz') {
    if(m.omega!==0){
      const v=m.velocityA.map(x=>x/Math.abs(m.omega)*.57), tip=project([r[0]+v[0],0,r[2]+v[2]]);
      out+=arrow(a,tip,'#315c8a',4)+text(tip[0]+8,tip[1]+4,'v','style="fill:#315c8a;font-size:24px"');
    }
    if(force!==0){
      const tip=project(at(1,.48*force));
      out+=arrow([a[0]+22,a[1]],[tip[0]+22,tip[1]],'#6f3a9e',4)+text(tip[0]+30,tip[1]+7,forceLabel,'style="fill:#6f3a9e;font-size:24px"');
      const btip=project(at(-1,-.48*force));
      out+=arrow([b[0]-22,b[1]],[btip[0]-22,btip[1]],'#6f3a9e',4)+text(btip[0]-58,btip[1]+7,forceLabel,'style="fill:#6f3a9e;font-size:24px"');
    }
  } else {
    const tip=project(m.normal.map(x=>1.05*x));
    out+=arrow(project([0,0,0]),tip,'#6f3a9e',4)+text(tip[0]+12,tip[1]-7,'n','style="fill:#6f3a9e;font-size:24px"');
    // Small end-on inset: oriented normal, B, and the exact same rotation angle.
    out+=`<rect x="28" y="282" width="242" height="65" rx="12" fill="#f5f5f7"/>`;
    out+=text(42,308,'Fluss je Windung','class="minor"')+text(42,334,`${fmt(m.linkage/parameters.turns*1000,1)} mWb`,'style="font-size:22px;font-weight:600"');
  }
  out+=text(380,24,`θ = ${fmt(state.angle,0)}°`,'text-anchor="middle" style="font-size:24px"');
  $('machine').innerHTML=out;
}
const polar=(cx,cy,r,a)=>[cx+r*Math.cos(a),cy+r*Math.sin(a)];
function arc(cx,cy,r,start,end){return `M${p2(polar(cx,cy,r,start))} A${r} ${r} 0 ${end-start>Math.PI?1:0} 1 ${p2(polar(cx,cy,r,end))}`;}
function contacts(m) {
  let out='<title id="contactSvgTitle">Spulenanschlüsse 1 und 2, Kontaktflächen und ruhende Bürsten X und Y</title>';
  const theta=m.theta, coilSign=sgn(m.emf), outer=state.kind==='ac'?m.emf:m.dc;
  if(state.kind==='ac'){
    // Separate rings in separate axial sections, not coplanar, touching conductors.
    for(const [i,cx,color] of [[1,190,'#a84b0b'],[2,480,'#08766f']]){
      out+=`<circle cx="${cx}" cy="84" r="44" fill="none" stroke="${color}" stroke-width="13"/>`;
      const end=polar(cx,84,38,theta);
      out+=line([[cx,84],end],color,4)+dot(cx,84,String(i),color);
      out+=line([[cx+51,84],[cx+82,84]],'#626269',15)+line([[cx+82,84],[cx+132,84]],'#626269',3);
      out+=text(cx+132,68,i===1?'X':'Y','text-anchor="middle" style="font-size:24px;font-weight:600"');
      out+=text(cx,166,`Ring ${i}`,'text-anchor="middle" style="font-size:24px"');
    }
    $('contactTitle').textContent='Zwei getrennte Schleifringe';
    $('contactText').textContent='Die Ringe sitzen hintereinander auf der Achse; hier sind sie getrennt gezeigt. X bleibt mit 1 und Y mit 2 verbunden. Die äußere Polung wechselt.';
  } else {
    const cx=380,cy=84,r=48,gap=.065;
    out+=`<path d="${arc(cx,cy,r,theta-Math.PI+gap,theta-gap)}" fill="none" stroke="#a84b0b" stroke-width="18"/>`;
    out+=`<path d="${arc(cx,cy,r,theta+gap,theta+Math.PI-gap)}" fill="none" stroke="#08766f" stroke-width="18"/>`;
    for(const [id,angle,color] of [[1,theta-Math.PI/2,'#a84b0b'],[2,theta+Math.PI/2,'#08766f']]){
      const pt=polar(cx,cy,24,angle),end=polar(cx,cy,43,angle);
      out+=line([pt,end],color,3)+dot(pt[0],pt[1],String(id),color);
    }
    out+=line([[cx+58,cy],[cx+87,cy]],'#626269',15)+line([[cx-58,cy],[cx-87,cy]],'#626269',15);
    out+=line([[cx+87,cy],[cx+190,cy]],'#626269',3)+line([[cx-87,cy],[cx-190,cy]],'#626269',3);
    out+=text(cx+190,62,'X','text-anchor="middle" style="font-size:24px;font-weight:600"')+text(cx-190,62,'Y','text-anchor="middle" style="font-size:24px;font-weight:600"');
    out+=text(cx,170,m.contact===0?'Kontaktwechsel':m.contact>0?'X ↔ 1     Y ↔ 2':'X ↔ 2     Y ↔ 1','text-anchor="middle" style="font-size:24px"');
    $('contactTitle').textContent='Ein geteilter Ring: der Kommutator';
    $('contactText').textContent='Zwei isolierte Halbringe drehen mit der Spule. Nach jedem halben Umlauf wechselt jede Bürste zum anderen Spulenende. Außen bleibt die Polung bei gleichem Drehsinn erhalten.';
  }
  out+=text(28,30,`1 ${coilSign===0?'0':coilSign>0?'+':'−'} / 2 ${coilSign===0?'0':coilSign>0?'−':'+'}`,'style="font-size:23px;font-weight:600"');
  out+=text(728,30,`X ${sgn(outer)===0?'0':outer>0?'+':'−'} / Y ${sgn(outer)===0?'0':outer>0?'−':'+'}`,'text-anchor="end" style="font-size:23px;font-weight:600"');
  $('contacts').innerHTML=out;
}
function plot(m){
  const left=72,right=716,top=38,bottom=218,mid=(top+bottom)/2,scale=72/Math.max(1,m.peak);
  const x=a=>left+(right-left)*a/360,y=u=>mid-u*scale;
  let out='<title id="plotSvgTitle">Wechselspannung und pulsierende Gleichspannung über dem Drehwinkel</title>';
  for(const u of [-Math.max(1,m.peak),0,Math.max(1,m.peak)]){
    out+=line([[left,y(u)],[right,y(u)]],'#dedee3',1)+text(left-12,y(u)+7,fmt(u,1),'text-anchor="end" style="font-size:22px"');
  }
  out+=text(18,23,'U / V','style="font-size:22px"');
  for(const a of [0,90,180,270,360])out+=line([[x(a),top],[x(a),bottom]],'#e9e9ed',1)+text(x(a),246,`${a}°`,'text-anchor="middle" style="font-size:22px"');
  const ac=[],dc=[];
  for(let angle=0;angle<=360;angle++){const p=sample(angle,state.rpm,state.direction);ac.push([x(angle),y(p.emf)]);dc.push([x(angle),y(p.dc)]);}
  // Draw AC last and dashed so overlapping positive half waves remain legible.
  out+=line(dc,'#167440',state.kind==='dc'?5:3)+line(ac,'#6941b0',state.kind==='ac'?4:3,'stroke-dasharray="10 8"');
  const cursor=x(state.angle),value=state.kind==='ac'?m.emf:m.dc;
  out+=line([[cursor,top-6],[cursor,bottom]],'#42424a',2,'stroke-dasharray="3 5"');
  out+=`<circle cx="${cursor}" cy="${y(value)}" r="7" fill="white" stroke="${state.kind==='ac'?'#6941b0':'#167440'}" stroke-width="4"/>`;
  out+=text(394,269,'Drehwinkel θ','text-anchor="middle" style="font-size:22px"');
  $('plot').innerHTML=out;
  $('periodRead').textContent=state.rpm===0?'Stillstand':`1 Umlauf: ${fmt(60/state.rpm,1)} s`;
}
function explain(m){
  const still=m.omega===0,zero=m.sine===0,peak=Math.abs(m.cosine)<1e-9;
  const positive=state.carrier==='positive',force=carrierForceA(m,state.carrier),carriers=positive?'positive Ladungsträger':'Elektronen';
  $('fluxReadout').hidden=state.explanation!=='flux';$('fluxValue').textContent=`${fmt(m.linkage/parameters.turns*1000,1)} mWb`;$('fluxMeter').value=m.linkage/parameters.turns*1000;
  if(state.explanation==='lorentz'){
    $('explainLabel').textContent='LORENTZKRAFT & LADUNGSTRENNUNG';
    $('explainTitle').textContent='Bewegung trennt Ladungen';
    $('explainText').textContent=`Der Antrieb bewegt die Spule und ihre ${positive?'im Modell beweglichen positiven Ladungsträger':'freien Elektronen'} durch das Magnetfeld. Die magnetische Lorentzkraft verschiebt ${carriers} entlang der Leiterseiten. Die Ladungsverschiebung erzeugt eine Spannung zwischen den Spulenenden.`;
    $('positionText').textContent=still?'Stillstand: keine Bewegung der Spule, keine bewegungsbedingte Ladungstrennung und keine Induktionsspannung.':zero?'In dieser Stellung bewegen sich die langen Leiterseiten parallel zum Magnetfeld. Entlang dieser Seiten wirkt keine magnetische Lorentzkraft: Die Spannung ist null.':`${peak?'Betragsmaximum: Die Leiterbewegung steht senkrecht zum Magnetfeld. ':''}An A wirkt die magnetische Kraft auf ${carriers} nach ${force>0?'oben':'unten'}, an B nach ${force>0?'unten':'oben'}. Nach einer halben Umdrehung kehrt sich die Ladungstrennung um.`;
    $('vectorLegend').textContent=`v: Leiterbewegung · ${positive?'F₊':'Fₑ'}: magnetische Kraft auf ${carriers}`;
  }else{
    $('explainLabel').textContent='MAGNETISCHER FLUSS';
    $('explainTitle').textContent='Die Orientierung macht den Unterschied';
    $('explainText').textContent='Das Magnetfeld B bleibt gleich stark, auch die Spulenfläche A bleibt gleich groß. Beim Drehen ändert sich ihre Orientierung zum Feld. Dadurch ändert sich der magnetische Fluss durch die Spule. Nur eine zeitliche Änderung erzeugt Induktionsspannung.';
    $('positionText').textContent=still?'Stillstand: Der magnetische Fluss bleibt zeitlich konstant. Auch bei großem Fluss entsteht keine Spannung.':zero?'Die Flächennormale n ist parallel oder antiparallel zum Feld. Der Fluss hat einen Extremwert und ändert sich in diesem Moment nicht: U = 0.':peak?'Die Spulenfläche liegt parallel zum Magnetfeld: Der Fluss ist gerade null, seine zeitliche Änderung ist betragsmäßig maximal. Deshalb ist der Spannungsbetrag maximal.':`Fluss je Windung: ${fmt(m.linkage/parameters.turns*1000,1)} mWb. Entscheidend für die Spannung ist, wie schnell sich dieser Wert ändert, nicht wie groß er gerade ist.`;
    $('vectorLegend').textContent='n: Flächennormale · θ: Drehwinkel von n gegenüber B · Fläche blau hinterlegt';
  }
  $('commonText').textContent=state.kind==='ac'?'Schleifringe verbinden dieselben Spulenenden stets mit denselben Bürsten. Daher wechselt die Spannung auch außen ihr Vorzeichen.':'Der Kommutator ändert die Spannungserzeugung in der Spule nicht. Er tauscht nur die äußeren Anschlüsse: Die Spannung pulsiert und wird nach jeder halben Umdrehung null.';
}
function render(){
  if(!state.carrier)return;
  const m=sample(state.angle,state.rpm,state.direction),outer=state.kind==='ac'?m.emf:m.dc;
  $('angle').value=state.angle;$('angleRead').textContent=`${fmt(state.angle,0)}°`;
  $('rpm').value=state.rpm;$('rpmRead').textContent=`${state.rpm} U/min`;
  $('coilU').textContent=`${fmt(m.emf)} V`;$('outerU').textContent=`${fmt(outer)} V`;
  $('polarity').textContent=`U₁₂: Spulenende 1 gegen 2. Uₓᵧ: Bürste X gegen Y. ${state.direction<0?'Drehsinn umgekehrt.':''}`;
  $('run').textContent=state.running?'Pause':'Start';
  $('motionState').textContent=state.rpm===0?'Stillstand':state.running?'Drehung läuft':'Momentaufnahme';
  $('reverse').setAttribute('aria-pressed',String(state.direction<0));
  $('step').textContent=state.direction>0?'Schritt +15°':'Schritt −15°';
  document.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===state.kind)));
  document.querySelectorAll('[data-explanation]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.explanation===state.explanation)));
  document.querySelectorAll('[data-carrier]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.carrier===state.carrier)));
  $('carrierNote').textContent=state.carrier==='positive'?'Modell: bewegliche positive Ladungsträger. Ihre Bewegungsrichtung definiert die technische Stromrichtung; im Metall bewegen sich tatsächlich Elektronen.':'Elektronenmodell: Elektronen sind negativ. Ihre gerichtete Verschiebung ist der technischen Stromrichtung entgegengesetzt.';
  machine(m);contacts(m);plot(m);explain(m);
  scene?.update(state,m);
}
let lastTime=null;
function animate(time){
  if(state.running&&lastTime!==null){state.angle=advance(state.angle,Math.min((time-lastTime)/1000,.1),state.rpm,state.direction);render();}
  lastTime=time;requestAnimationFrame(animate);
}
$('run').addEventListener('click',()=>{if(!state.carrier)return;state.running=!state.running;lastTime=null;render();});
$('step').addEventListener('click',()=>{state.running=false;state.angle=wrap(Math.round(state.angle)+15*state.direction);render();});
$('angle').addEventListener('input',e=>{state.running=false;state.angle=Number(e.target.value);render();});
$('rpm').addEventListener('input',e=>{state.rpm=Number(e.target.value);render();});
$('reverse').addEventListener('click',()=>{state.direction*=-1;render();});
$('reset').addEventListener('click',()=>{const carrier=state.carrier;Object.assign(state,defaults,{running:false,carrier});lastTime=null;scene?.view('space');render();});
document.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>{state.kind=b.dataset.kind;render();}));
document.querySelectorAll('[data-explanation]').forEach(b=>b.addEventListener('click',()=>{state.explanation=b.dataset.explanation;render();}));
document.addEventListener('visibilitychange',()=>{lastTime=null;});
function chooseCarrier(carrier){
  if(!['positive','electrons'].includes(carrier))return;
  const firstChoice=!state.carrier;state.carrier=carrier;
  document.querySelector('.shell').inert=false;document.querySelector('.shell').removeAttribute('data-awaiting-carrier');
  render();
  if($('carrierDialog').open)$('carrierDialog').close();
  if(firstChoice)$('run').focus({preventScroll:true});
}
document.querySelectorAll('[data-choose-carrier]').forEach(b=>b.addEventListener('click',()=>chooseCarrier(b.dataset.chooseCarrier)));
document.querySelectorAll('[data-carrier]').forEach(b=>b.addEventListener('click',()=>chooseCarrier(b.dataset.carrier)));
$('carrierDialog').addEventListener('cancel',e=>e.preventDefault());
$('carrierDialog').addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  e.preventDefault();
  const controls=[...$('carrierDialog').querySelectorAll('button,a[href]')];
  const index=controls.indexOf(document.activeElement);
  const next=index<0?(e.shiftKey?controls.length-1:0):(index+(e.shiftKey?-1:1)+controls.length)%controls.length;
  controls[next].focus();
});
$('carrierDialog').showModal();$('carrierTitle').focus({preventScroll:true});
render();requestAnimationFrame(animate);
function unavailable(){scene=null;$('scene').hidden=true;$('machine').removeAttribute('hidden');$('sceneMessage').hidden=false;$('sceneHelp').hidden=true;document.querySelector('.view-controls').hidden=true;}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>scene?.view(b.dataset.view)));
import('./scene.mjs').then(({createScene})=>{
  scene=createScene($('scene'),name=>document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name))),unavailable);
  $('machine').setAttribute('hidden','');render();
}).catch(unavailable);
