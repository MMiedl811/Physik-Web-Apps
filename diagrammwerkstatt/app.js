import {transforms,MAX_ROWS,number,fmt,axisInfo,axisLabel,dataset,fitLine,visibleFit,slope,autoRange,ticks,smoothSegments,blankRow,initialState,validateState} from './model.mjs';
import {setupTour} from './tour.js';

const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const protocolMode = document.body.dataset.mode === 'protocol';
// Der frühere kombinierte Arbeitsstand gehört weiterhin zum vollständigen Protokoll.
const STORAGE = protocolMode ? 'physik-diagrammwerkstatt-v1' : 'physik-diagrammwerkstatt-diagram-v1';
let state = initialState(), history = [], nextPick = 0, renderTimer, storageTimer, screenPoints = [];
let latest = {points:[],issues:[]}, lastSvgSize = {width:800,height:460};
function node(tag, text, cls) {const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function svgNode(tag, attrs={}, parent=$('plot'), text) {
  const e=document.createElementNS(NS,tag);
  for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));
  if(text!==undefined)e.textContent=text;
  parent.append(e);return e;
}
function message(text) {$('notice').textContent=text;}
function remember() {
  const value=JSON.stringify(state);
  if(history.at(-1)!==value)history.push(value);
  if(history.length>40)history.shift();
  $('undo').disabled=!history.length;
}
function queueRender() {clearTimeout(renderTimer);renderTimer=setTimeout(update,70);}
function persistNow() {
  clearTimeout(storageTimer);
  try{localStorage.setItem(STORAGE,JSON.stringify(state));}
  catch{$('storage-hint').hidden=false;$('storage-hint').textContent='Dieser Browser kann den Stand nicht lokal sichern. Nutze „Projekt speichern“.';}
}
function persist() {
  clearTimeout(storageTimer);
  storageTimer=setTimeout(persistNow,250);
}
window.addEventListener('pagehide',persistNow);
function changed({table=false, controls=false}={}) {
  if(controls)syncControls();
  if(table)renderTable();
  update();
}
function transformedHeader(key) {return `${axisLabel(state[key])} · berechnet`;}
function columns() {
  const cols=['x','y'];
  if(state.uncertainty.enabled&&state.uncertainty.mode==='individual')cols.push('ux','uy');
  if(state.x.transform!=='identity')cols.push('tx');
  if(state.y.transform!=='identity')cols.push('ty');
  return cols;
}
function renderTableHead() {
  const tr=node('tr');tr.append(node('th','Messung'));
  for(const key of columns()) {
    const text=key[0]==='t'?axisLabel(state[key[1]]):key[0]==='u'?`Δ${state[key[1]].symbol||key[1]}${state[key[1]].unit?` / ${state[key[1]].unit}`:''}`:axisLabel({...state[key],transform:'identity'});
    const th=node('th',text);th.scope='col';th.title=text;tr.append(th);
  }
  $('table-head').replaceChildren(tr);
  $('table-hint').textContent=`Dezimalkomma oder Dezimalpunkt · Werte aus einer Tabelle einfügen · weitere Messungen: seitlich scrollen.${columns().some(k=>k[0]==='t')?' Berechnete Werte stehen unter den Originalwerten.':''}`;
}
function appendRow(row, i) {
  const tr=node('tr');tr.dataset.row=i;const numberCell=node('td');numberCell.append(node('span',String(i+1)));tr.append(numberCell);
  for(const key of columns()) {
    const td=node('td');
    if(key[0]==='t') {
      const out=node('output');out.dataset.derived=key[1];out.setAttribute('aria-label',`Messung ${i+1}, ${transformedHeader(key[1])}`);td.append(out);
    } else {
      const input=node('input');input.type='text';input.inputMode='decimal';input.autocomplete='off';input.spellcheck=false;input.maxLength=120;input.value=row[key];input.dataset.key=key;input.setAttribute('aria-label',`Messung ${i+1}, ${key[0]==='u'?'Unsicherheit '+key[1]:key}`);
      input.addEventListener('beforeinput',()=>{if(input.dataset.edited!=='true'){remember();input.dataset.edited='true';}});
      input.addEventListener('blur',()=>{delete input.dataset.edited;});
      input.addEventListener('input',()=>{
        // Auch programmgesteuertes Einfügen / assistive Eingabemethoden sichern.
        if(input.dataset.edited!=='true'){remember();input.dataset.edited='true';}
        state.rows[i][key]=input.value;queueRender();
        if(i===state.rows.length-1&&state.rows.length<MAX_ROWS&&state.rows[i].x.trim()&&state.rows[i].y.trim()) {
          const extra=blankRow();state.rows.push(extra);appendRow(extra,state.rows.length-1);updateAddButton();
        }
      });
      input.addEventListener('paste',e=>paste(e,i,key));
      input.addEventListener('keydown',e=>{
        if(e.key==='Enter') {e.preventDefault();const following=$('table-body').querySelector(`[data-row="${i+1}"] [data-key="${key}"]`);if(following)following.focus();else $('add-row').focus();}
      });
      td.append(input);
    }
    tr.append(td);
  }
  const del=node('button','×');del.type='button';del.setAttribute('aria-label',`Messung ${i+1} löschen`);
  del.addEventListener('click',()=>{remember();state.rows.splice(i,1);if(!state.rows.length)state.rows.push(blankRow());state.selected=[0,Math.max(0,state.rows.length-1)];changed({table:true});const buttons=$('table-body').querySelectorAll('button');buttons[Math.min(i,buttons.length-1)].focus();});numberCell.append(del);
  $('table-body').append(tr);
}
function updateAddButton() {$('add-row').disabled=state.rows.length>=MAX_ROWS;}
function renderTable() {
  renderTableHead();$('table-body').replaceChildren();state.rows.forEach(appendRow);updateAddButton();
}
function paste(event,startRow,key) {
  const text=event.clipboardData?.getData('text/plain');
  if(!text||!/[\t\n;\r]/.test(text)||key.startsWith('u'))return;
  const lines=text.trim().split(/\r?\n|\r/).filter(l=>l.trim()).map(l=>l.split(/\t|;/).map(v=>v.trim()));
  if(lines.some(l=>l.length>2)||lines.some(l=>l.some(v=>v.length>120))) {
    event.preventDefault();message('Bitte eine oder zwei Wertespalten ohne Überschrift einfügen; maximal 120 Zeichen je Wert.');return;
  }
  if(startRow+lines.length>MAX_ROWS) {event.preventDefault();message('Es sind höchstens 300 Messwertzeilen möglich.');return;}
  event.preventDefault();remember();
  while(state.rows.length<startRow+lines.length)state.rows.push(blankRow());
  lines.forEach((line,j)=>{
    if(line.length===2) {state.rows[startRow+j].x=line[0];state.rows[startRow+j].y=line[1];}
    else state.rows[startRow+j][key]=line[0];
  });
  if(state.rows.length<MAX_ROWS&&state.rows.at(-1).x&&state.rows.at(-1).y)state.rows.push(blankRow());
  changed({table:true});message(`${lines.length} Zeilen eingefügt. Werte und Einheiten bitte prüfen.`);
  $('table-body').querySelector(`[data-row="${startRow}"] [data-key="${key}"]`)?.focus();
}
function syncControls() {
  for(const key of ['x','y']) {
    for(const field of ['name','symbol','unit'])$(`${key}-${field}`).value=state[key][field];
    $(`transform-${key}`).value=state[key].transform;
  }
  $('diagram-title').value=state.title;
  for(const key of ['name','partners','date','target','setup','description','analysis'])$(`protocol-${key}`).value=state.protocol[key]||'';
  $('protocol-title-input').value=state.protocol.title||state.title||'Mein Versuch';
  $('protocol-class').value=state.protocol.class||'';
  $('uncertainty-on').checked=state.uncertainty.enabled;
  $('uncertainty-mode').value=state.uncertainty.mode;
  $('common-ux').value=state.uncertainty.x;$('common-uy').value=state.uncertainty.y;
  $('origin').checked=state.origin;
  $('manual-view').checked=state.view.manual;
  $('reverse-x').checked=state.view.reverseX;$('reverse-y').checked=state.view.reverseY;
  for(const key of ['xmin','xmax','ymin','ymax'])$(key).value=state.view[key];
  $('undo').disabled=!history.length;
}
function slopeUnit() {
  const x=axisInfo(state.x).unit,y=axisInfo(state.y).unit;
  return !x&&!y?'(einheitenlos)':`${y?`(${y})`:'1'}${x?` / (${x})`:''}`;
}
function lineEquation(fit) {return `${axisInfo(state.y).symbol} = ${fmt(fit.m)} · ${axisInfo(state.x).symbol}${fit.b===0?'':` ${fit.b<0?'−':'+'} ${fmt(Math.abs(fit.b))}`}`;}
function textResult(parent, text, strong=false) {const p=node('p');p.append(node(strong?'strong':'span',text));parent.append(p);}
function updatePointSelectors(points) {
  const ids=points.map(p=>p.id);
  if(!ids.includes(state.selected[0]))state.selected[0]=ids[0]??0;
  if(!ids.includes(state.selected[1]))state.selected[1]=ids.at(-1)??0;
  for(const [j,id] of ['point-a','point-b'].entries()) {
    const select=$(id),current=select.value;
    const signature=points.map(p=>`${p.id}:${fmt(p.x)}:${fmt(p.y)}`).join('|');
    if(select.dataset.signature!==signature) {
      select.replaceChildren(...points.map(p=>{const opt=node('option',`Messung ${p.id+1}: (${fmt(p.x)} | ${fmt(p.y)})`);opt.value=p.id;return opt;}));
      select.dataset.signature=signature;
    }
    select.value=String(state.selected[j]);select.disabled=!points.length;
    if(!points.length&&current)select.value='';
  }
}
function update() {
  clearTimeout(renderTimer);
  latest=dataset(state);
  const {points,issues,invalid}=latest;
  updatePointSelectors(points);
  const invalidSet=new Set(invalid);
  $('table-body').querySelectorAll('input').forEach(input=>{
    const row=input.closest('tr').dataset.row;
    input.setAttribute('aria-invalid',String(invalidSet.has(`${row}:${input.dataset.key}`)));
  });
  $('table-body').querySelectorAll('output').forEach(out=>{
    const i=Number(out.closest('tr').dataset.row),key=out.dataset.derived,v=number(state.rows[i][key]);
    const t=v===null?null:transforms[state[key].transform].fn(v);
    out.textContent=t===null?'—':Number.isFinite(t)?fmt(t):'nicht definiert';
  });
  for(const key of ['x','y']) {
    $(`u${key}-label`).textContent=`Δ${state[key].symbol||key}${state[key].unit?` / ${state[key].unit}`:''}`;
    const inp=$(`common-u${key}`),v=number(inp.value);
    inp.setAttribute('aria-invalid',String(state.uncertainty.enabled&&state.uncertainty.mode==='common'&&v!==null&&(!Number.isFinite(v)||v<0)));
  }
  $('uncertainty-options').hidden=!state.uncertainty.enabled;
  $('common-uncertainty').hidden=state.uncertainty.mode!=='common';
  $('bounds-controls').hidden=!state.view.manual;
  $('point-count').textContent=`${points.length} ${points.length===1?'Punkt':'Punkte'}`;
  $('empty-state').hidden=points.length>0;
  document.querySelectorAll('[data-style]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.style===state.style)));
  for(const key of ['slope','fit']){$(`${key}-toggle`).setAttribute('aria-pressed',String(state[key]));$(`${key}-panel`).hidden=!state[key];$(`${key}-legend`).hidden=!state[key];}
  $('tools-intro').hidden=state.slope||state.fit;
  document.querySelector('.analysis-results').hidden=!state.slope&&!state.fit;
  $('connection-legend').hidden=state.style==='points';
  $('transform-hint').textContent=`Dargestellt: ${axisLabel(state.y)} gegen ${axisLabel(state.x)}. Die Originalwerte bleiben unverändert.${state.x.transform!=='identity'||state.y.transform!=='identity'?' Die Steigung bezieht sich jetzt auf diese umgeformten Größen.':''}`;
  $('original').disabled=state.x.transform==='identity'&&state.y.transform==='identity';
  const fit=state.fit?fitLine(points,state.origin):null;
  const a=points.find(p=>p.id===state.selected[0]),b=points.find(p=>p.id===state.selected[1]);
  const triangle=state.slope?slope(a,b):null;
  $('slope-result').replaceChildren();
  if(state.slope) {
    if(triangle.error)textResult($('slope-result'),triangle.error);
    else {
      textResult($('slope-result'),'m = Δy / Δx = (yB − yA) / (xB − xA)');
      textResult($('slope-result'),`m = [${fmt(b.y)} − (${fmt(a.y)})] / [${fmt(b.x)} − (${fmt(a.x)})]`);
      textResult($('slope-result'),`Δy = ${fmt(triangle.dy)}${axisInfo(state.y).unit?' '+axisInfo(state.y).unit:''} · Δx = ${fmt(triangle.dx)}${axisInfo(state.x).unit?' '+axisInfo(state.x).unit:''}`);
      textResult($('slope-result'),`m = ${fmt(triangle.m)} ${slopeUnit()}`,true);
      const p=node('p','Mittlere Steigung zwischen A und B; keine Tangentensteigung und keine Ausgleichsgerade.','hint');$('slope-result').append(p);
    }
    $('pick-hint').textContent=`Im Diagramm antippen: Als Nächstes wird Punkt ${nextPick===0?'A':'B'} gesetzt. Oder oben aus der Liste wählen.`;
  }
  $('fit-result').replaceChildren();
  if(state.fit) {
    if(fit.error)textResult($('fit-result'),fit.error);
    else {
      textResult($('fit-result'),lineEquation(fit),true);
      textResult($('fit-result'),`Steigung m = ${fmt(fit.m)} ${slopeUnit()}`);
      textResult($('fit-result'),`Achsenabschnitt b = ${fmt(fit.b)} ${axisInfo(state.y).unit||'(einheitenlos)'}`);
      textResult($('fit-result'),`${fit.n} Wertepaare · ${state.origin?'Ursprung fest vorgegeben':'Achsenabschnitt frei'}`);
      if(points.length===2)$('fit-result').append(node('p','Zwei verschiedene x-Werte legen eine Gerade fest. Daraus lässt sich noch keine Streuung um eine frei angepasste Gerade beurteilen.','hint'));
    }
  }
  const moreIssues=drawPlot(points,fit,triangle,a,b);
  const allIssues=[...new Set([...issues,...moreIssues])];
  $('issues').hidden=!allIssues.length;
  $('issues').replaceChildren();
  if(allIssues.length){$('issues').append(node('p','Bitte prüfen:'));const ul=node('ul');allIssues.slice(0,12).forEach(s=>ul.append(node('li',s)));if(allIssues.length>12)ul.append(node('li',`… und ${allIssues.length-12} weitere Hinweise.`));$('issues').append(ul);}
  $('plot-hint').textContent=`${state.view.manual?'Eigene Achsengrenzen aktiv.':'Automatische Skalierung · Ursprung muss nicht im Bild liegen.'}${state.style==='points'?'':state.style==='line'?' Verbindung nach aufsteigendem x-Wert.':' Glatte Verbindung durch die Punkte; keine Ausgleichskurve.'}`;
  persist();
}
function drawPlot(points,fit,triangle,a,b) {
  const svg=$('plot'),w=Math.max(270,Math.round($('plot-container').getBoundingClientRect().width));
  const h=w>=800?480:w>=500?420:350;
  lastSvgSize={width:w,height:h};svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('width',w);svg.setAttribute('height',h);
  svg.replaceChildren();screenPoints=[];
  svgNode('title',{},svg,state.title||'Mein Diagramm');
  svgNode('desc',{},svg,`${points.length} Messpunkte; ${axisLabel(state.y)} gegen ${axisLabel(state.x)}. Werte und Auswertungen stehen in der Tabelle und unter dem Diagramm.`);
  svg.setAttribute('aria-label',`${state.title||'Mein Diagramm'}: ${axisLabel(state.y)} gegen ${axisLabel(state.x)}, ${points.length} Messpunkte`);
  const issues=[];
  let xr=autoRange(points,'x'),yr=autoRange(points,'y');
  if(state.view.manual) {
    for(const [key,range] of [['x',xr],['y',yr]]) {
      const min=number(state.view[`${key}min`]),max=number(state.view[`${key}max`]);
      const valid=Number.isFinite(min)&&Number.isFinite(max)&&min<max;
      $(`${key}min`).setAttribute('aria-invalid',String(!valid));$(`${key}max`).setAttribute('aria-invalid',String(!valid));
      if(valid){range.min=min;range.max=max;}
      else issues.push(`${key}-Achsengrenzen: Zwei gültige Zahlen mit „von“ < „bis“ eingeben. Bis dahin wird diese Achse automatisch skaliert.`);
    }
  } else for(const id of ['xmin','xmax','ymin','ymax'])$(id).setAttribute('aria-invalid','false');
  const xt=ticks(xr.min,xr.max,w<500?3:5),yt=ticks(yr.min,yr.max,5);
  const measure=document.createElement('canvas').getContext('2d');measure.font='14px system-ui';
  const yLabelWidth=Math.max(20,...yt.map(v=>measure.measureText(fmt(v,3)).width));
  const L=Math.ceil(35+yLabelWidth),R=22,T=28,B=68,pw=Math.max(60,w-L-R),ph=h-T-B;
  const mapX=v=>L+(state.view.reverseX?1-(v-xr.min)/(xr.max-xr.min):(v-xr.min)/(xr.max-xr.min))*pw;
  const mapY=v=>T+(state.view.reverseY?(v-yr.min)/(yr.max-yr.min):1-(v-yr.min)/(yr.max-yr.min))*ph;
  const mx=v=>Math.max(-1e6,Math.min(1e6,mapX(v))),my=v=>Math.max(-1e6,Math.min(1e6,mapY(v)));
  const defs=svgNode('defs');const clip=svgNode('clipPath',{id:'plot-clip'},defs);svgNode('rect',{x:L,y:T,width:pw,height:ph},clip);
  svgNode('rect',{x:0,y:0,width:w,height:h,fill:'#fff'});
  const grid=svgNode('g',{'clip-path':'url(#plot-clip)'});
  function gridLines(list,range,horizontal) {
    if(list.length<2)return;
    const step=list[1]-list[0],start=Math.floor(range.min/step)*step;
    for(let i=0;i<160;i++) {
      const v=start+i*step/5;if(v>range.max+step/100)break;if(v<range.min)continue;
      const pixel=horizontal?my(v):mx(v);
      svgNode('line',horizontal?{x1:L,x2:L+pw,y1:pixel,y2:pixel,stroke:i%5===0?'#d3d5d9':'#eff0f2','stroke-width':1}:{x1:pixel,x2:pixel,y1:T,y2:T+ph,stroke:i%5===0?'#d3d5d9':'#eff0f2','stroke-width':1},grid);
    }
  }
  gridLines(xt,xr,false);gridLines(yt,yr,true);
  if(xr.min<=0&&xr.max>=0)svgNode('line',{x1:mx(0),x2:mx(0),y1:T,y2:T+ph,stroke:'#8c9098','stroke-width':1.2},grid);
  if(yr.min<=0&&yr.max>=0)svgNode('line',{x1:L,x2:L+pw,y1:my(0),y2:my(0),stroke:'#8c9098','stroke-width':1.2},grid);
  svgNode('rect',{x:L,y:T,width:pw,height:ph,fill:'none',stroke:'#626269','stroke-width':1.2});
  const labelAttrs={'font-size':14,'font-family':'system-ui, sans-serif',fill:'#343a46'};
  for(const v of yt){const y=my(v);svgNode('text',{...labelAttrs,x:L-9,y:y+5,'text-anchor':'end'},svg,fmt(v,3));}
  for(const v of xt){const x=mx(v);svgNode('text',{...labelAttrs,x,y:T+ph+24,'text-anchor':x<L+25?'start':x>L+pw-25?'end':'middle'},svg,fmt(v,3));}
  function fitText(text,space) {
    if(measure.measureText(text).width<=space)return text;
    let s=text;while(s.length&&measure.measureText(s+'…').width>space)s=s.slice(0,-1);return s+'…';
  }
  const xText=axisLabel(state.x),yText=axisLabel(state.y);
  const xLabel=svgNode('text',{...labelAttrs,x:L+pw/2,y:h-15,'text-anchor':'middle','font-weight':600},svg,fitText(xText,w-20));
  svgNode('title',{},xLabel,xText);
  const yLabel=svgNode('text',{...labelAttrs,transform:`translate(17 ${T+ph/2}) rotate(-90)`,'text-anchor':'middle','font-weight':600},svg,fitText(yText,ph));svgNode('title',{},yLabel,yText);
  if(xText!==fitText(xText,w-20)||yText!==fitText(yText,ph))issues.push(`Vollständige Achsenbeschriftung: ${yText} gegen ${xText}. Für den Diagrammrand bitte kürzere Formelzeichen/Einheiten verwenden.`);
  const data=svgNode('g',{'clip-path':'url(#plot-clip)'});
  const sorted=[...points].sort((p,q)=>p.x-q.x);
  const pathAttrs={fill:'none',stroke:'#343a46','stroke-width':2,'stroke-linejoin':'round'};
  if(state.style==='line'&&points.length>1)svgNode('path',{...pathAttrs,d:sorted.map((p,i)=>`${i?'L':'M'}${mx(p.x)},${my(p.y)}`).join(' ')},data);
  if(state.style==='smooth'&&points.length>1) {
    const smooth=smoothSegments(points);
    if(smooth.error)issues.push(smooth.error);
    else if(smooth.segments.length) {
      const first=smooth.segments[0].a;
      const d=`M${mx(first.x)},${my(first.y)} `+smooth.segments.map(s=>`C${mx(s.c1.x)},${my(s.c1.y)} ${mx(s.c2.x)},${my(s.c2.y)} ${mx(s.b.x)},${my(s.b.y)}`).join(' ');
      svgNode('path',{...pathAttrs,d},data);
    }
  }
  const fitEnds=visibleFit(fit,xr,yr);
  if(fitEnds.length)svgNode('line',{x1:mx(fitEnds[0].x),y1:my(fitEnds[0].y),x2:mx(fitEnds[1].x),y2:my(fitEnds[1].y),stroke:'#9b3e15','stroke-width':2.5,'stroke-dasharray':'8 5'},data);
  const bars=svgNode('g',{stroke:'#626269','stroke-width':1.5},data);
  for(const p of points) {
    if(p.xlow!==undefined){const x1=mx(p.xlow),x2=mx(p.xhigh),y=my(p.y);svgNode('path',{d:`M${x1},${y}H${x2} M${x1},${y-5}V${y+5} M${x2},${y-5}V${y+5}`},bars);}
    if(p.ylow!==undefined){const y1=my(p.ylow),y2=my(p.yhigh),x=mx(p.x);svgNode('path',{d:`M${x},${y1}V${y2} M${x-5},${y1}H${x+5} M${x-5},${y2}H${x+5}`},bars);}
  }
  if(triangle&&!triangle.error) {
    svgNode('path',{d:`M${mx(a.x)},${my(a.y)} L${mx(b.x)},${my(a.y)} L${mx(b.x)},${my(b.y)} Z`,fill:'#196650', 'fill-opacity':.06,stroke:'#196650','stroke-width':2},data);
    const tx=(mx(a.x)+mx(b.x))/2,ty=(my(a.y)+my(b.y))/2;
    if(tx>L+20&&tx<L+pw-20&&my(a.y)>T+16&&my(a.y)<T+ph-16)svgNode('text',{...labelAttrs,x:tx,y:my(a.y)-8,'text-anchor':'middle',fill:'#196650','paint-order':'stroke',stroke:'white','stroke-width':4},data,'Δx');
    if(mx(b.x)>L+24&&mx(b.x)<L+pw-24&&ty>T+12&&ty<T+ph-12)svgNode('text',{...labelAttrs,x:mx(b.x)+8,y:ty,fill:'#196650','paint-order':'stroke',stroke:'white','stroke-width':4},data,'Δy');
  }
  let outside=0;
  for(const p of points) {
    const x=mx(p.x),y=my(p.y);
    if(p.x<xr.min||p.x>xr.max||p.y<yr.min||p.y>yr.max){outside++;continue;}
    const selected=state.slope&&state.selected.includes(p.id);
    svgNode('circle',{cx:x,cy:y,r:selected?6:4.5,fill:selected?'#196650':'#343a46',stroke:'white','stroke-width':1.5},data);
    if(selected) {
      const name=state.selected[0]===p.id?'A':'B';
      const sx=Math.min(L+pw-10,Math.max(L+10,x+12)),sy=Math.min(T+ph-6,Math.max(T+16,y-12));
      svgNode('text',{...labelAttrs,x:sx,y:sy,'font-weight':600,fill:'#196650','paint-order':'stroke',stroke:'white','stroke-width':4},data,name);
    }
    screenPoints.push({id:p.id,x,y});
  }
  if(outside)issues.push(`${outside} ${outside===1?'Messpunkt liegt':'Messpunkte liegen'} außerhalb deiner Achsengrenzen. „Ansicht anpassen“ zeigt alle Punkte.`);
  return issues;
}
for(const key of ['x','y']) {
  const select=$(`transform-${key}`);
  for(const [id,t] of Object.entries(transforms)){const opt=node('option',t.label);opt.value=id;select.append(opt);}
  select.addEventListener('change',()=>{remember();state[key].transform=select.value;state.view.manual=false;nextPick=0;changed({table:true,controls:true});});
  for(const field of ['name','symbol','unit']) {
    const input=$(`${key}-${field}`);
    input.addEventListener('focus',remember);
    input.addEventListener('input',()=>{state[key][field]=input.value;renderTableHead();queueRender();});
  }
}
$('diagram-title').addEventListener('focus',remember);
$('diagram-title').addEventListener('input',()=>{state.title=$('diagram-title').value;queueRender();});
for(const key of ['name','partners','date','target','setup','description','analysis','class'])$(`protocol-${key}`).addEventListener('input',()=>{state.protocol[key]=$(`protocol-${key}`).value;persist();});
$('protocol-title-input').addEventListener('input',()=>{state.protocol.title=$('protocol-title-input').value;persist();});
document.querySelectorAll('[data-style]').forEach(button=>button.addEventListener('click',()=>{remember();state.style=button.dataset.style;changed();}));
$('add-row').addEventListener('click',()=>{if(state.rows.length>=MAX_ROWS)return;remember();const row=blankRow();state.rows.push(row);appendRow(row,state.rows.length-1);updateAddButton();update();$('table-body').lastElementChild.querySelector('input').focus();});
$('undo').addEventListener('click',()=>{if(!history.length)return;state=validateState(JSON.parse(history.pop()));nextPick=0;changed({table:true,controls:true});message('Letzte Änderung rückgängig gemacht.');});
$('swap').addEventListener('click',()=>{
  remember();[state.x,state.y]=[state.y,state.x];
  state.rows=state.rows.map(r=>({x:r.y,y:r.x,ux:r.uy,uy:r.ux}));
  [state.uncertainty.x,state.uncertainty.y]=[state.uncertainty.y,state.uncertainty.x];
  [state.view.reverseX,state.view.reverseY]=[state.view.reverseY,state.view.reverseX];state.view.manual=false;
  changed({table:true,controls:true});message('Größen, Einheiten, Umformungen und Unsicherheiten wurden getauscht.');
});
$('original').addEventListener('click',()=>{remember();state.x.transform=state.y.transform='identity';state.view.manual=false;changed({table:true,controls:true});});
$('auto-view').addEventListener('click',()=>{remember();state.view.manual=false;changed({controls:true});message('Die Ansicht zeigt wieder alle gültigen Messpunkte und ihre darstellbaren Unsicherheitsintervalle.');});
for(const key of ['slope','fit'])$(`${key}-toggle`).addEventListener('click',()=>{
  remember();state[key]=!state[key];
  if(key==='slope'&&state.slope&&latest.points.length>1)state.selected=[latest.points[0].id,latest.points.at(-1).id];
  nextPick=0;changed();
});
for(const [j,id] of ['point-a','point-b'].entries())$(id).addEventListener('change',()=>{remember();state.selected[j]=Number($(id).value);nextPick=1-j;changed();});
$('plot').addEventListener('click',event=>{
  if(!state.slope||!screenPoints.length)return;
  const box=$('plot').getBoundingClientRect(),x=(event.clientX-box.left)*lastSvgSize.width/box.width,y=(event.clientY-box.top)*lastSvgSize.height/box.height;
  const nearest=screenPoints.map(p=>({...p,d:Math.hypot(p.x-x,p.y-y)})).sort((p,q)=>p.d-q.d)[0];
  if(nearest.d>24)return;
  remember();state.selected[nextPick]=nearest.id;nextPick=1-nextPick;changed();
});
$('origin').addEventListener('change',()=>{remember();state.origin=$('origin').checked;changed();});
$('uncertainty-on').addEventListener('change',()=>{remember();state.uncertainty.enabled=$('uncertainty-on').checked;changed({table:true});});
$('uncertainty-mode').addEventListener('change',()=>{remember();state.uncertainty.mode=$('uncertainty-mode').value;changed({table:true});});
for(const key of ['x','y']) {
  const input=$(`common-u${key}`);input.addEventListener('focus',remember);input.addEventListener('input',()=>{state.uncertainty[key]=input.value;queueRender();});
}
$('manual-view').addEventListener('change',()=>{
  remember();state.view.manual=$('manual-view').checked;
  if(state.view.manual)for(const key of ['x','y']) {
    const range=autoRange(latest.points,key);
    const ratio=Math.max(Math.abs(range.min),Math.abs(range.max))/(range.max-range.min);
    const digits=Math.min(17,Math.max(6,Math.ceil(Math.log10(ratio))+4));
    state.view[`${key}min`]=String(Number(range.min.toPrecision(digits))).replace('.',',');state.view[`${key}max`]=String(Number(range.max.toPrecision(digits))).replace('.',',');
  }
  changed({controls:true});
});
for(const key of ['xmin','xmax','ymin','ymax']) {$(key).addEventListener('focus',remember);$(key).addEventListener('input',()=>{state.view[key]=$(key).value;queueRender();});}
for(const [id,key] of [['reverse-x','reverseX'],['reverse-y','reverseY']])$(id).addEventListener('change',()=>{remember();state.view[key]=$(id).checked;changed();});
let replacePending=null;
function replaceProject(kind,make) {
  const hasData=state.rows.some(r=>r.x.trim()||r.y.trim())||Object.entries(state.protocol).some(([key,value])=>value.trim()&&(key!=='title'||value!=='Mein Versuch'));
  if(hasData&&replacePending!==kind){replacePending=kind;message(`${kind}: Dein aktuelles Projekt einschließlich Protokolltexten würde ersetzt. Klicke noch einmal, um fortzufahren. Mit „Rückgängig“ kannst du anschließend zurückkehren.`);return;}
  replacePending=null;remember();state=make();nextPick=0;changed({table:true,controls:true});message(`${kind} geladen. Der vorherige Stand bleibt über „Rückgängig“ erreichbar.`);
}
document.addEventListener('input',()=>{replacePending=null;});
$('example').addEventListener('click',()=>replaceProject('Beispiel',()=>{
  const s=initialState();s.title='Weg und Zeit · Beispieldaten';s.x={name:'Zeit',symbol:'t',unit:'s',transform:'identity'};s.y={name:'Weg',symbol:'s',unit:'m',transform:'identity'};
  s.rows=[[0,0],[1,.52],[2,1.95],[3,4.6],[4,7.9],[5,12.6]].map(([x,y])=>({x:String(x).replace('.',','),y:String(y).replace('.',','),ux:'',uy:''}));s.rows.push(blankRow());return s;
}));
$('clear').addEventListener('click',()=>replaceProject('Leeres Projekt',initialState));
function download(blob,filename) {
  const url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function printProtocol(){
  update();
  const root=$('print-document');document.body.append(root);root.replaceChildren();
  const esc=(tag,text,cls)=>{const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=text||'';return e;};
  const page=(title)=>{const e=esc('section','', 'protocol-page');e.append(esc('h1',title));return e;};
  const section=(parent,title,text,space='')=>{const box=esc('section','', 'protocol-print-section');box.append(esc('h2',title));if(text)box.append(esc('p',text));if(space){const blank=esc('div','',space);blank.setAttribute('aria-label','Freiraum für handschriftliche Ergänzungen');box.append(blank);}parent.append(box);};
  const p=state.protocol||{};
  const first=page(p.title||state.title||'Versuchsprotokoll');
  const meta=esc('div','', 'print-meta');for(const [label,value] of [['Name',p.name],['Partner',p.partners],['Kurs / Klasse',p.class],['Datum',p.date?String(p.date).split('-').reverse().join('.'):'' ]]){const item=esc('div','', 'print-meta-item');item.append(esc('strong',`${label}: `),esc('span',value||' '));meta.append(item);}first.append(meta);
  section(first,'Z · Ziel',p.target,'writing-space short');
  section(first,'A · Aufbau',p.setup,'drawing-space');
  section(first,'B · Beschreibung',p.description,'writing-space short');
  const second=page(protocolMode ? `${p.title||state.title||'Versuchsprotokoll'} · Ergebnisse` : state.title||'Diagramm und Auswertung');
  const resultGrid=esc('div','', 'print-results-grid');const tableBox=esc('section','', 'print-table-box');tableBox.append(esc('h2','M · Messergebnisse'));
  const table=document.createElement('table');table.className='print-data-table';const head=document.createElement('thead'),hr=document.createElement('tr');for(const label of ['Nr.',axisLabel({...state.x,transform:'identity'}),axisLabel({...state.y,transform:'identity'})])hr.append(esc('th',label));head.append(hr);table.append(head);const body=document.createElement('tbody');
  const rows=state.rows.map((r,i)=>({r,i})).filter(({r})=>r.x.trim()||r.y.trim());
  for(const {r,i} of rows){const tr=document.createElement('tr');tr.append(esc('td',String(i+1)),esc('td',r.x),esc('td',r.y));body.append(tr);}table.append(body);tableBox.append(table);
  tableBox.append(esc('p','Tabelle: eingegebene Originalwerte und Originaleinheiten.','print-small'));
  if(state.uncertainty.enabled)tableBox.append(esc('p','Fehlerbalken zeigen die eingegebenen Unsicherheitsintervalle. Die genauen Unsicherheiten bleiben in der Projektdatei erhalten.','print-small'));
  const graph=esc('section','', 'print-graph-box');graph.append(esc('h2','Diagramm und grafische Auswertung'));const svg=$('plot').cloneNode(true);svg.removeAttribute('id');svg.removeAttribute('width');svg.removeAttribute('height');svg.querySelector('#plot-clip')?.setAttribute('id','print-plot-clip');svg.querySelectorAll('[clip-path]').forEach(e=>e.setAttribute('clip-path','url(#print-plot-clip)'));graph.append(svg);graph.append(esc('p',`${axisLabel(state.y)} gegen ${axisLabel(state.x)} · ${latest.points.length} gültige Messpunkte`,'print-small'));
  const fit=state.fit?fitLine(latest.points,state.origin):null;
  if(fit&&!fit.error){graph.append(esc('p',`Ausgleichsgerade: ${lineEquation(fit)}\nm = ${fmt(fit.m)} ${slopeUnit()} · b = ${fmt(fit.b)} ${axisInfo(state.y).unit}\nUngewichtet; Unsicherheiten gehen nicht in die Anpassung ein.`,'print-small'));}
  const a=latest.points.find(point=>point.id===state.selected[0]),b=latest.points.find(point=>point.id===state.selected[1]),triangle=state.slope?slope(a,b):null;
  if(triangle&&!triangle.error)graph.append(esc('p',`Steigungsdreieck A–B: m = Δy / Δx = ${fmt(b.y-a.y)} / ${fmt(b.x-a.x)} = ${fmt(triangle.m)} ${slopeUnit()}`,'print-small'));
  if(state.style==='smooth')graph.append(esc('p','Glatte Verbindung: Interpolation durch die Messpunkte, keine Ausgleichskurve.','print-small'));
  if(!$('issues').hidden)graph.append(esc('p',$('issues').textContent,'print-small'));
  resultGrid.append(tableBox,graph);second.append(resultGrid);
  section(second,protocolMode?'A · Auswertung':'Eigene Auswertung und Ergänzungen',protocolMode?p.analysis:'','writing-space long');
  root.append(...(protocolMode?[first,second]:[second]));
  root.classList.add('preparing');
  const tooMany=rows.length>28;
  const overflow=[...root.querySelectorAll('.protocol-page, .protocol-print-section p, .print-results-grid, .print-table-box, .print-graph-box, td, th, .print-meta-item, h1')].some(e=>e.scrollHeight>e.clientHeight+2||e.scrollWidth>e.clientWidth+2);
  root.classList.remove('preparing');
  if(tooMany||overflow){root.replaceChildren();message(tooMany?'PDF: Auf die A4-Vorlage passen höchstens 28 Messungen. Bitte wähle eine kürzere Messreihe; alle Werte kannst du als Projektdatei sichern.':'PDF: Text, Messwerte oder Auswertung passen nicht vollständig auf die A4-Vorlage. Bitte kürze lange Texte, Beschriftungen oder Werte. Sichere vollständige Inhalte als Projektdatei.');$('notice').scrollIntoView({block:'center'});return;}
  document.body.classList.add('printing-protocol');
  const restore=()=>{document.body.classList.remove('printing-protocol');root.replaceChildren();window.removeEventListener('afterprint',restore);};
  window.addEventListener('afterprint',restore,{once:true});window.print();setTimeout(restore,120000);
}
$('pdf').addEventListener('click',printProtocol);
$('save').addEventListener('click',()=>{update();persistNow();download(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),'diagrammwerkstatt.json');message('Projektdatei gespeichert. Sie enthält Originalwerte, Unsicherheiten und Einstellungen.');});
$('load').addEventListener('click',()=>{$('file').click();});
$('file').addEventListener('change',async()=>{
  const file=$('file').files[0];if(!file)return;
  try {
    if(file.size>500000)throw new Error('Datei zu groß. Bitte eine Diagrammwerkstatt-Projektdatei bis 500 kB wählen.');
    const loaded=validateState(JSON.parse(await file.text()));
    remember();state=loaded;nextPick=0;changed({table:true,controls:true});message('Projekt geladen. Der vorherige Stand bleibt über „Rückgängig“ erreichbar.');
  }catch(error){message(`Laden fehlgeschlagen: ${error.message}`);}
  $('file').value='';
});
$('png').addEventListener('click',async()=>{
  update();$('png').disabled=true;
  try {
    const {width,height}=lastSvgSize;
    const clone=$('plot').cloneNode(true);
    const xml=new XMLSerializer().serializeToString(clone);
    const url=URL.createObjectURL(new Blob([xml],{type:'image/svg+xml;charset=utf-8'}));
    const img=new Image();
    try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Diagramm konnte nicht gerendert werden.'));img.src=url;});}
    finally{URL.revokeObjectURL(url);}
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    const exportWidth=Math.max(width,640),lines=[];
    const fit=state.fit?fitLine(latest.points,state.origin):null;
    const a=latest.points.find(p=>p.id===state.selected[0]),b=latest.points.find(p=>p.id===state.selected[1]),tri=state.slope?slope(a,b):null;
    const text=[`${axisLabel(state.y)} gegen ${axisLabel(state.x)} · ${latest.points.length} Messpunkte`,...(fit&&!fit.error?[`Ausgleichsgerade (ungewichtet): ${lineEquation(fit)}`,`m = ${fmt(fit.m)} ${slopeUnit()} · b = ${fmt(fit.b)} ${axisInfo(state.y).unit}`]:[]),...(tri&&!tri.error?[`Steigungsdreieck A–B: m = ${fmt(tri.m)} ${slopeUnit()}`]:[]),...(state.style==='smooth'?['Glatte Verbindung durch Messpunkte; keine Ausgleichskurve.']:[]),...(state.uncertainty.enabled?['Fehlerbalken: eingegebene Unsicherheitsintervalle; im Fit nicht gewichtet.']:[]),...(!$('issues').hidden?['Achtung: Hinweise zu ausgelassenen Werten / Intervallen oder zur Darstellung in der App beachten.']:[])];
    ctx.font='15px system-ui';
    for(const paragraph of text) {
      let line='';for(const word of paragraph.split(' ')){if(ctx.measureText(line+' '+word).width>exportWidth-40&&line){lines.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)lines.push(line);
    }
    const plotHeight=height*exportWidth/width,fullHeight=64+plotHeight+lines.length*24+24;
    canvas.width=exportWidth*2;canvas.height=fullHeight*2;ctx.scale(2,2);ctx.fillStyle='#fff';ctx.fillRect(0,0,exportWidth,fullHeight);
    ctx.fillStyle='#1d1d1f';ctx.font='600 21px system-ui';
    let title=state.title||'Mein Diagramm';while(title.length>1&&ctx.measureText(title).width>exportWidth-40)title=title.slice(0,-2)+'…';ctx.fillText(title,20,34);
    ctx.drawImage(img,0,54,exportWidth,plotHeight);ctx.font='15px system-ui';lines.forEach((line,i)=>ctx.fillText(line,20,64+plotHeight+i*24));
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw new Error('Bild konnte nicht gespeichert werden.');
    download(blob,'diagramm.png');message('Diagramm als PNG exportiert. Für die spätere Bearbeitung zusätzlich das Projekt speichern.');
  }catch(error){message(`Export fehlgeschlagen: ${error.message}`);}
  finally{$('png').disabled=false;}
});
try {
  const saved=localStorage.getItem(STORAGE);
  if(saved){state=validateState(JSON.parse(saved));message('Dein letzter Stand wurde aus diesem Browser wiederhergestellt.');}
}catch{$('storage-hint').hidden=false;$('storage-hint').textContent='Ein früherer Stand konnte nicht geladen werden. Projektdateien lassen sich weiterhin öffnen.';}
syncControls();renderTable();update();
let observedPlotWidth=-1, resizeFrame=0;
new ResizeObserver(entries=>{
  const width=entries[0].contentRect.width;
  if(Math.abs(width-observedPlotWidth)<.5)return;
  observedPlotWidth=width;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(update);
}).observe($('plot-container'));
$('data-toggle').addEventListener('click',()=>{
  const collapsed=!$('input-area').hidden;
  $('input-area').hidden=collapsed;
  $('data-toggle').setAttribute('aria-expanded',String(!collapsed));
  $('data-toggle').textContent=collapsed?'Tabelle aufklappen':'Tabelle einklappen';
});
for(const [button,detail] of [['linearize-open','linearize-details'],['uncertainty-open','uncertainty-details'],['file-open','file-details']]) {
  $(button).addEventListener('click',()=>{$(detail).open=true;$(detail).scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$(detail).querySelector('summary').focus({preventScroll:true});});
}
setupTour();
