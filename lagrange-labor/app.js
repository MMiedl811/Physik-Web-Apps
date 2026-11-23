import {AU, MU, sample, sampleAlongAxis} from './model.mjs';
const $=id=>document.getElementById(id);
const NS='http://www.w3.org/2000/svg';
const info={
 L1:{title:'Näher dran, gleicher Takt',location:'Zwischen Sonne und Erde.',text:'Wohin zeigt die Erdkraft, wenn die Probe zwischen Sonne und Erde liegt?',example:'Sonnenbeobachtung: SOHO nutzt eine Bahn in der Umgebung von L1.'},
 L2:{title:'Weiter draußen, gleicher Takt',location:'Hinter der Erde, von der Sonne aus gesehen.',text:'Wohin zeigt die Erdkraft, wenn die Probe von der Sonne aus hinter der Erde liegt?',example:'James Webb nutzt eine Halo-Bahn um L2. Es steht nicht genau in diesem Punkt.'},
 L3:{title:'Auf der anderen Sonnenseite',location:'Der Erde gegenüber, jenseits der Sonne.',text:'Sonne und Erde ziehen hier in dieselbe Richtung. Die genaue Lage ergibt sich aus der gemeinsamen Kreisbewegung um den Schwerpunkt – L3 ist nicht exakt das Spiegelbild der Erde.',example:'Die Sonne liegt zwischen der Erde und L3. Die direkte Funkverbindung zur Erde wäre dadurch behindert.'},
 L4:{title:'Der Erde voraus',location:'60° vor der Erde in Umlaufrichtung.',text:'Sonne, Erde und L4 bilden ein gleichseitiges Dreieck. Die beiden Gravitationskräfte sind nicht parallel: Ihre Vektorsumme liefert die benötigte Kraft zum gemeinsamen Schwerpunkt.',example:'Stabil bedeutet hier: Kleine Störungen können zu Schwingungen in der Umgebung führen, ohne sofort anzuwachsen.'},
 L5:{title:'Der Erde hinterher',location:'60° hinter der Erde in Umlaufrichtung.',text:'Auch Sonne, Erde und L5 bilden ein gleichseitiges Dreieck. Die Erdanziehung wirkt schräg zur Sonnenanziehung; entscheidend ist die vektorielle Summe.',example:'L4 und L5 haben im idealisierten Sonne-Erde-Modell dieselben Stabilitätseigenschaften.'}
};
let useExactPoint = false;
let selected='L2',frame='inertial',both=true,running=false,angle=0,last=null;
function svg(tag,attrs={},text){const node=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))node.setAttribute(k,v);if(text!==undefined)node.textContent=text;return node;}
function append(parent,tag,attrs,text){const n=svg(tag,attrs,text);parent.append(n);return n;}
const pointButtons={};
for(const id of Object.keys(info)){
 const b=document.createElement('button');b.className='point-button';b.textContent=id;b.setAttribute('aria-label',id+' auswählen');b.setAttribute('aria-pressed',String(id===selected));b.dataset.point=id;
 b.onclick=()=>select(id);$('point-controls').append(b);pointButtons[id]=b;
}
function mapped(x,y){const a=frame==='inertial'?angle:0;return[320+155*(x*Math.cos(a)-y*Math.sin(a)),240-155*(x*Math.sin(a)+y*Math.cos(a))];}
// Schematic positions only. All numerical values come from model.mjs.
const schematic={L1:[.60,0],L2:[1.43,0],L3:[-1.05,0],L4:[.5,Math.sqrt(3)/2],L5:[.5,-Math.sqrt(3)/2]};
function draw(){
 const geometry=$('geometry'),bodies=$('bodies');geometry.replaceChildren();bodies.replaceChildren();
 const sun=mapped(0,0),earth=mapped(1,0);
 const a=frame==='inertial'?angle:0,offset=40*640/$('orbit').getBoundingClientRect().width;
 const bodyLabel=(p)=>({x:p[0]+Math.sin(a)*offset,y:p[1]+Math.cos(a)*offset+5*640/$('orbit').getBoundingClientRect().width,'text-anchor':'middle'});
 append(geometry,'line',{x1:320,y1:240,x2:mapped(1.65,0)[0],y2:mapped(1.65,0)[1],stroke:'#b6b6bc','stroke-dasharray':'4 5'});
 if(selected==='L4'||selected==='L5'){
  const p=mapped(...schematic[selected]);append(geometry,'polygon',{points:[sun,earth,p].map(v=>v.join(',')).join(' '),fill:'#eaf3ff',stroke:'#0066cc','stroke-width':1.5});
  append(geometry,'text',{x:320,y:445,'text-anchor':'middle',fill:'#626269'},'Gleichseitiges Dreieck');
 }
 // Counterclockwise orbital direction, matching L4 ahead / L5 behind.
 append(geometry,'path',{d:'M 320 85 A 155 155 0 0 0 230 114',fill:'none',stroke:'#626269','stroke-width':2});
 append(geometry,'path',{d:'M 230 114 l 11 -2 m -11 2 l 3 -11',fill:'none',stroke:'#626269','stroke-width':2});
 append(bodies,'circle',{cx:sun[0],cy:sun[1],r:21,fill:'#f1bd53',stroke:'#956000','stroke-width':2});
 append(bodies,'text',bodyLabel(sun),'Sonne');
 append(bodies,'circle',{cx:earth[0],cy:earth[1],r:11,fill:'#0066b8',stroke:'#00477f','stroke-width':2});
 append(bodies,'text',bodyLabel(earth),'Erde');
 for(const[id,p]of Object.entries(schematic)){
  const[x,y]=mapped(...p);pointButtons[id].style.left=`${100*x/640}%`;pointButtons[id].style.top=`${100*y/480}%`;
 }
}
function arrow(parent,x,y,dx,color,dashed=false){
 append(parent,'line',{x1:x,y1:y,x2:x+dx,y2:y,stroke:color,'stroke-width':3,'stroke-dasharray':dashed?'6 4':'none'});
 const len=Math.abs(dx);if(len<.0001)return;
 const head=Math.min(8,len*.65),sign=Math.sign(dx);
 append(parent,'path',{d:`M${x+dx} ${y}l${-sign*head} ${-head*.48}v${head*.96}Z`,fill:color});
}
const fmt=(v,d=3)=>v.toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});
function forces() {
 const leavingEarth = selected === 'L2';
 const distanceControl = $('probe-distance');
 const model = useExactPoint
  ? sample(selected, both)
  : sampleAlongAxis(leavingEarth ? 1 : -1, Number(distanceControl.value) * 1e7, both);
 // The display axis points left, towards the Sun. Model x points right.
 const sun = -model.sun[0];
 const earth = -model.earth[0];
 const total = -model.total[0];
 const required = -model.required[0];
 const difference = total - required;
 const rows = $('force-rows');
 const signed = value => (value < -1e-8 ? '−' : '+') + fmt(Math.abs(value));
 const distanceText = fmt(model.distanceEarth / 1e9, useExactPoint ? 3 : 2) + ' Mio. km';
 $('probe-value').textContent = distanceText;
 distanceControl.setAttribute('aria-valuetext', distanceText);
 $('axis').style.setProperty('--probe-gap', (20 + 45 * (model.distanceEarth / 1e9 - 0.9) / 1.5) + 'px');
 $('exact-point').setAttribute('aria-pressed', String(useExactPoint));
 $('distances').textContent = 'Zur Sonne: ' + fmt((model.position[0] + MU) * AU / 1e9, 3)
  + ' Mio. km · Zur Erde: ' + distanceText + ' · Zum Schwerpunkt: '
  + fmt(model.position[0] * AU / 1e9, 3) + ' Mio. km.';
 rows.replaceChildren();
 const entries = [
  ['Sonnenkraft', sun, '#956000'],
  ['Erdkraft', earth, '#0066b8'],
  ['Kraftsumme', total, '#16704a'],
  ['Sollwert', required, '#7840a0']
 ];
 entries.forEach(([label, value, color], index) => {
  const y = 20 + index * 49;
  append(rows, 'text', {x: 14, y, fill: color}, label);
  const direction = value > 0 ? '←  ' : value < 0 ? '→  ' : '';
  append(rows, 'text', {x: 376, y, 'text-anchor': 'end'}, direction + signed(value) + ' N');
  arrow(rows, 310, y + 17, -value * 40, color, index === 3);
 });
 $('forces').setAttribute('aria-label', entries.map(([label, value]) =>
  label + ' ' + signed(value) + ' Newton').join(', ') + '. Positiv bedeutet zur Sonne.');
 $('formula').textContent = '(' + signed(sun) + ' N) + (' + signed(earth) + ' N) ≈ ' + signed(total) + ' N';
 const matches = Math.abs(difference) < 0.001;
 let feedback;
 if (matches) {
  feedback = useExactPoint
   ? 'Die Kraftsumme entspricht dem Sollwert. Hier liegt ' + selected + '.'
   : 'Die Kraftsumme und der Sollwert unterscheiden sich um weniger als 0,001 N. Du bist sehr nahe an ' + selected + '.';
 } else {
  const direction = difference > 0 ? 'Zu viel' : 'Zu wenig';
  feedback = direction + ' Kraft zur Sonne für eine Kreisbahn mit derselben Umlaufzeit wie die Erde. Betrag der Abweichung: '
   + fmt(Math.abs(difference)) + ' N.';
  if (!both && useExactPoint) {
   feedback += ' ' + (leavingEarth ? 'Die Erde zieht zusätzlich zur Sonne hin.'
    : 'Die Erde zieht von der Sonne weg und schwächt so die Summe.');
  }
 }
 $('force-status').textContent = feedback;
 $('force-status').classList.toggle('missing', !matches);
 $('both').setAttribute('aria-pressed', String(both));
 $('sun-only').setAttribute('aria-pressed', String(!both));
}
function select(id){
 selected=id;both=true;useExactPoint=false;
 $('probe-distance').value = '200';
 const d=info[id],m=sample(id);for(const[k,v]of Object.entries(pointButtons))v.setAttribute('aria-pressed',String(k===id));
 $('point-tag').textContent=id;$('point-title').textContent=d.title;$('location').textContent=d.location;$('explanation').textContent=d.text;$('example').textContent=d.example;
 $('stability').textContent=['L4','L5'].includes(id)?'Stabil im Modell':'Instabil';
 $('distance').textContent=fmt(m.distanceEarth/1e9,2)+' Mio. km';
 const basic=['L1','L2'].includes(id);$('force-panel').hidden=!basic;$('advanced').hidden=basic;
 $('advanced-text').textContent=id==='L3'?'Beide Kräfte zeigen auf derselben Geraden zur Sonne und zur Erde. Ihre Summe liefert die Zentripetalkraft.':'Die Sonnenkraft zeigt zur Sonne, die Erdkraft zur Erde. Für die Kraftbilanz müssen beide Richtungen berücksichtigt werden.';
 $('distance').parentElement.hidden = basic;
 if (basic) {
  $('probe-l1').setAttribute('aria-pressed', String(id === 'L1'));
  $('probe-l2').setAttribute('aria-pressed', String(id === 'L2'));
  const line = '<span class="axis-line" aria-hidden="true"></span>';
  const gap = '<span class="axis-line axis-gap" aria-hidden="true"></span>';
  $('axis').innerHTML = '<span>Sonne</span>' + line + (id === 'L1'
   ? '<strong>Probe</strong>' + gap + '<span>Erde</span>'
   : '<span>Erde</span>' + gap + '<strong>Probe</strong>');
  forces();
 }
 draw();
}
function updatePhase(){
 $('phase').value=String(angle*180/Math.PI);$('phase-value').textContent=Math.round(angle*180/Math.PI)+'°';draw();
}
function setRunning(value){running=value;last=null;$('play').textContent=value?'Pause':'Start';}
function setFrame(value){frame=value;$('inertial').setAttribute('aria-pressed',String(value==='inertial'));$('rotating').setAttribute('aria-pressed',String(value==='rotating'));$('frame-badge').textContent=value==='inertial'?'Blick von außen':'Mitrotierende Ansicht';
 $('frame-note').textContent=value==='inertial'?'Alle fünf Punkte umlaufen den gemeinsamen Schwerpunkt mit derselben Winkelgeschwindigkeit wie die Erde. Ein Umlauf entspricht etwa einem Jahr.':'Die Ansicht dreht sich mit der Erde: Sonne, Erde und die fünf Punkte bleiben an festen Bildpositionen. Der Umlaufpositionsregler zeigt weiterhin die Phase im äußeren Bezugssystem.';draw();}
$('play').onclick=()=>setRunning(!running);
$('inertial').onclick=()=>setFrame('inertial');$('rotating').onclick=()=>setFrame('rotating');
$('both').onclick=()=>{both=true;forces();};$('sun-only').onclick=()=>{both=false;forces();};
$('probe-l1').onclick = () => { if (selected !== 'L1') select('L1'); };
$('probe-l2').onclick = () => { if (selected !== 'L2') select('L2'); };
$('probe-distance').oninput = () => {
 useExactPoint = false;
 forces();
};
$('exact-point').onclick = () => {
 useExactPoint = true;
 $('probe-distance').value = String(Math.round(sample(selected).distanceEarth / 1e7));
 forces();
};
$('speed').oninput=()=>{$('speed-value').textContent=fmt(Number($('speed').value),Number($('speed').value)%1?2:0)+'×';};
$('phase').oninput=()=>{angle=Number($('phase').value)*Math.PI/180;last=null;updatePhase();};
$('reset').onclick=()=>{setRunning(false);angle=0;$('speed').value='1';$('speed-value').textContent='1×';setFrame('inertial');select('L2');updatePhase();};
document.addEventListener('visibilitychange',()=>{last=null;});
function tick(time){if(running){if(last!==null){angle=(angle+Math.min((time-last)/1000,.1)*Number($('speed').value)*2*Math.PI/40)%(2*Math.PI);updatePhase();}last=time;}requestAnimationFrame(tick);}
const resizeObserver=new ResizeObserver(()=>{
 const ow=$('orbit').getBoundingClientRect().width,fw=$('forces').getBoundingClientRect().width;
 if(ow)$('orbit').style.setProperty('--orbit-font',Math.max(16,14*640/ow)+'px');
 if(fw)$('forces').style.setProperty('--force-font',Math.max(15,14*390/fw)+'px');
});resizeObserver.observe($('orbit'));resizeObserver.observe($('forces'));
select('L2');requestAnimationFrame(tick);
