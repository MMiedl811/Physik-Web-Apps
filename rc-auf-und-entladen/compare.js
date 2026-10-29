'use strict';
// Immutable snapshots keep saved runs independent of all live controls.
const savedRuns=[];
const curveColors=['#0066cc','#b54900','#007668','#8c3faa','#ad304b','#52600b'];
const curveDashes=['','8 5','2 5','12 4 2 4','6 3 2 3','14 6'];
const quantityNames={i:'I / mA',uc:'U꜀ / V',ur:'Uᵣ / V'};
function snapshot(){return {...params(),cycle:state.cycle,mode:state.cycle?'charge':state.mode,start:state.cycle?0:state.start};}
function runDuration(run){return (run.cycle?13:5)*run.r*run.c;}
function runValues(run,t){
 const tau=run.r*run.c,switchTime=8*tau;
 const target=run.cycle?(t<switchTime?run.v:0):run.mode==='charge'?run.v:0;
 const uc=run.cycle?(t<switchTime?run.v*(1-Math.exp(-t/tau)):run.v*(1-Math.exp(-8))*Math.exp(-(t-switchTime)/tau)):target+(run.start-target)*Math.exp(-t/tau);
 return {uc,ur:target-uc,i:(target-uc)/run.r};
}
function runKey(run){return JSON.stringify(run);}
function comparisonRuns(){const current=snapshot();return savedRuns.some(run=>runKey(run)===runKey(current))?[...savedRuns]:[...savedRuns,current];}
function runLabel(run,index){return `${index+1}: ${run.cycle?'Gesamtverlauf':run.mode==='charge'?'Aufladen':'Entladen'} · R = ${fmt(run.r/1000,0)} kΩ · C = ${fmt(run.c*1e6,0)} µF · U₀ = ${fmt(run.v,0)} V · U꜀,Start = ${fmt(run.start,2)} V`;}
function sampleTimes(runs){const end=Math.max(...runs.map(runDuration)),count=+$('sampleCount').value;return Array.from({length:count},(_,j)=>j*end/(count-1));}
function sampledValue(run,t,key){if(t>runDuration(run)+1e-9)return null;return runValues(run,t)[key]*(key==='i'?1000:1);}
function comparisonData(){const runs=comparisonRuns(),key=$('compareQuantity').value;return {runs,key,times:sampleTimes(runs)};}
function comparisonSvg(runs,key,width=960){
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('xmlns',NS);svg.setAttribute('viewBox',`0 0 ${width} 440`);svg.setAttribute('width',width);svg.setAttribute('height','440');
 const end=Math.max(...runs.map(runDuration));let min=0,max=0;
 for(const run of runs){for(const t of [0,runDuration(run),...(run.cycle?[8*run.r*run.c-1e-9,8*run.r*run.c]:[])]){const value=runValues(run,t)[key]*(key==='i'?1000:1);min=Math.min(min,value);max=Math.max(max,value);}}
 if(max-min<1e-12)max=min+1;
 const right=width-32,X=t=>86+t/end*(right-86),Y=value=>380-(value-min)/(max-min)*332;
 const text=(x,y,value,attrs={})=>txt(x,y,value,svg,{'font-family':'system-ui, sans-serif','font-size':16,fill:'#233b52',...attrs});
 text(12,24,quantityNames[key]);
 for(let j=0;j<=4;j++){const value=min+(max-min)*j/4,y=Y(value);line(86,y,right,y,svg,{stroke:'#cbd3dd'});text(74,y+5,fmt(value,key==='i'?3:2),{'text-anchor':'end'});}
 const ticks=width<650?4:10;for(let j=0;j<=ticks;j++){const t=end*j/ticks,x=X(t);line(x,48,x,380,svg,{stroke:'#e0e6ed'});text(x,408,fmt(t,1),{'text-anchor':'middle'});}
 line(86,Y(0),right,Y(0),svg,{stroke:'#526579','stroke-width':2});text(right,435,'t / s',{'text-anchor':'end'});
 runs.forEach((run,index)=>{
  const tau=run.r*run.c,segments=run.cycle?[[0,8*tau,true],[8*tau,13*tau,false]]:[[0,5*tau,false]];
  for(const [start,stop,left] of segments){let d='';for(let j=0;j<=300;j++){const t=start+(stop-start)*j/300,evalT=left&&j===300?t-1e-9*tau:t,value=runValues(run,evalT)[key]*(key==='i'?1000:1);d+=(j?'L':'M')+X(t).toFixed(3)+','+Y(value).toFixed(3);}el('path',{d,fill:'none',stroke:curveColors[index],'stroke-width':3,'stroke-dasharray':curveDashes[index]},svg);}
  for(const t of sampleTimes(runs)){const value=sampledValue(run,t,key);if(value===null)continue;el(index%2?'rect':'circle',index%2?{x:X(t)-3.5,y:Y(value)-3.5,width:7,height:7,fill:curveColors[index]}:{cx:X(t),cy:Y(value),r:3.5,fill:curveColors[index]},svg);}
 });return svg;
}
let comparisonSignature='';
window.renderComparison=function(){
 const {runs,key,times}=comparisonData(),width=Math.max(320,$('comparisonChart').clientWidth),signature=JSON.stringify({runs,key,times,width});
 if(signature===comparisonSignature)return;comparisonSignature=signature;
 $('comparisonChart').setAttribute('viewBox',`0 0 ${width} 440`);
 $('comparisonChart').replaceChildren(...comparisonSvg(runs,key,width).childNodes);
 $('curveLegend').replaceChildren();runs.forEach((run,index)=>{const li=document.createElement('li'),mark=document.createElement('span');mark.className='curve-mark';mark.style.borderColor=curveColors[index];mark.style.borderTopStyle=index?'dashed':'solid';li.append(mark,document.createTextNode(runLabel(run,index).replace(/^\d+: /,'')));$('curveLegend').append(li);});
 const table=$('comparisonTable'),head=document.createElement('thead'),body=document.createElement('tbody');table.replaceChildren(head,body);
 const header=document.createElement('tr');for(const label of ['t / s',...runs.map((run,index)=>`Kurve ${index+1}: ${quantityNames[key]}`)]){const th=document.createElement('th');th.scope='col';th.textContent=label;header.append(th);}head.append(header);
 for(const t of times){const row=document.createElement('tr');for(const value of [fmt(t,3),...runs.map(run=>{const value=sampledValue(run,t,key);return value===null?'—':fmt(value,5);})]){const td=document.createElement('td');td.textContent=value;row.append(td);}body.append(row);}
 $('clearCurves').disabled=!savedRuns.length;
 $('newCurve').disabled=savedRuns.length>=5;
 $('compareStatus').textContent=`${runs.length} ${runs.length===1?'Kurve':'Kurven'} · ${savedRuns.length} festgehalten · gemeinsame Zeitachse von 0 bis ${fmt(times.at(-1),1)} s`+(savedRuns.length>=5?' · Maximal fünf festgehaltene Kurven plus aktueller Vorgang.':'');
};
$('newCurve').onclick=()=>{const run=snapshot();if(savedRuns.length>=5)return;if(!savedRuns.some(item=>runKey(item)===runKey(run)))savedRuns.push(Object.freeze(run));reset();window.renderComparison();};
$('clearCurves').onclick=()=>{savedRuns.length=0;window.renderComparison();};
for(const id of ['compareQuantity','sampleCount'])$(id).onchange=window.renderComparison;
function downloadBlob(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function exportCsv(){
 const {runs,times}=comparisonData(),rows=[['RC-Glied – berechnete Modellwerte; keine Messdaten']];
 runs.forEach((run,index)=>rows.push([runLabel(run,index),`Zeitfenster: ${fmt(runDuration(run),5)} s`]));
 rows.push(['t / s',...runs.flatMap((run,index)=>['I / mA','U꜀ / V','Uᵣ / V'].map(label=>`Kurve ${index+1}: ${label}`))]);
 for(const t of times)rows.push([fmt(t,8),...runs.flatMap(run=>['i','uc','ur'].map(key=>{const value=sampledValue(run,t,key);return value===null?'':fmt(value,8);}))]);
 const csv='\ufeff'+rows.map(row=>row.map(cell=>'"'+String(cell).replaceAll('"','""')+'"').join(';')).join('\r\n');
 downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),'RC-Modellwerte.csv');
}
async function exportPng(){
 // Capture a fixed state before awaiting image decoding; UI changes cannot mix runs.
 const {runs,key,times}=comparisonData(),svg=comparisonSvg(runs,key);
 const width=1600,chartHeight=680,legendHeight=runs.length*36,tableTop=120+chartHeight+legendHeight+70,rowHeight=38;
 const height=tableTop+(times.length+1)*rowHeight+80,canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Bildexport ist in diesem Browser nicht verfügbar.');ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);
 ctx.fillStyle='#172c40';ctx.font='600 30px system-ui, sans-serif';ctx.fillText('RC-Glied · Kurvenvergleich',48,48);ctx.font='20px system-ui, sans-serif';ctx.fillText('Berechnete Modellwerte · idealer RC-Kreis · '+quantityNames[key],48,82);
 const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg));
 await image.decode();ctx.drawImage(image,48,112,1504,chartHeight);
 runs.forEach((run,index)=>{const y=120+chartHeight+index*36;ctx.strokeStyle=curveColors[index];ctx.lineWidth=4;ctx.setLineDash(curveDashes[index].split(' ').filter(Boolean).map(Number));ctx.beginPath();ctx.moveTo(48,y);ctx.lineTo(84,y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#172c40';ctx.font='20px system-ui, sans-serif';ctx.fillText(runLabel(run,index),98,y+7);});
 ctx.font='19px system-ui, sans-serif';ctx.fillText('Zeit ab Vorgangsbeginn · — = außerhalb des dargestellten Vorgangs · Werte gerundet',48,tableTop-22);
 const cols=runs.length+1,colWidth=1504/cols;
 const cells=[['t / s',...runs.map((run,index)=>`Kurve ${index+1}: ${quantityNames[key]}`)],...times.map(t=>[fmt(t,3),...runs.map(run=>{const value=sampledValue(run,t,key);return value===null?'—':fmt(value,5);})])];
 cells.forEach((row,j)=>{row.forEach((value,k)=>{const x=48+k*colWidth,y=tableTop+j*rowHeight;ctx.fillStyle=j===0?'#eaf3ff':j%2?'#fff':'#f5f5f7';ctx.fillRect(x,y,colWidth,rowHeight);ctx.strokeStyle='#cbd3dd';ctx.lineWidth=1;ctx.strokeRect(x,y,colWidth,rowHeight);ctx.fillStyle='#172c40';ctx.font=(j===0?'600 ':'')+'20px system-ui, sans-serif';ctx.fillText(value,x+12,y+26);});});
 ctx.font='18px system-ui, sans-serif';ctx.fillText('RC-Glied · Strom- und Spannungszeichen gemäß fester Zählrichtung der Animation',48,height-28);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Das PNG konnte nicht erstellt werden.');downloadBlob(blob,'RC-Diagramm-und-Wertetabelle.png');
}
$('exportCsv').onclick=exportCsv;
$('exportPng').onclick=async()=>{const button=$('exportPng');button.disabled=true;try{await exportPng();}catch(error){$('compareStatus').textContent=error.message;}finally{button.disabled=false;}};
window.renderComparison();

window.addEventListener('resize',window.renderComparison);
