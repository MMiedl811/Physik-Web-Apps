(()=>{
'use strict';
if(!window.joint)return;
const {dia,shapes}=joint;
const graph=new dia.Graph({}, {cellNamespace:shapes});
const wrap=document.getElementById('paperWrap');
const host=document.getElementById('jointPaper');
const status=document.getElementById('status');
const count=document.getElementById('count');
let selected=null;
const COLORS={ink:'#183b3a',petrol:'#176b68',amber:'#d8a13f',red:'#b85f50',paper:'#fffdf8'};
const portGroups={
 left:{position:{name:'left'},attrs:{portBody:{r:9,magnet:true,fill:'#287ac0',stroke:'#fff',strokeWidth:3}}},
 right:{position:{name:'right'},attrs:{portBody:{r:9,magnet:true,fill:'#c9574b',stroke:'#fff',strokeWidth:3}}}
};
const ports={groups:portGroups,items:[{id:'left',group:'left'},{id:'right',group:'right'}]};

function makeElement(type,x,y){
 const el=new shapes.standard.Rectangle({position:{x,y},size:{width:150,height:76},ports});
 const labels={battery:'Batterie',lamp:'Lampe',switch:'Schalter'};
 const symbols={battery:'┃ │',lamp:'⊗',switch:'— ／ —'};
 el.set('componentType',type);
 el.attr({body:{fill:COLORS.paper,stroke:COLORS.petrol,strokeWidth:2,rx:14,ry:14},label:{text:`${symbols[type]}\n${labels[type]}`,fill:COLORS.ink,fontSize:15,fontWeight:800,fontFamily:'Georgia,serif'}});
 el.addTo(graph);return el;
}
function makeLink(source,target){
 const link=new shapes.standard.Link({source,target,attrs:{line:{stroke:COLORS.ink,strokeWidth:4,targetMarker:{type:'path',d:''},sourceMarker:{type:'path',d:''}}},router:{name:'manhattan',args:{padding:18,step:12}},connector:{name:'rounded',args:{radius:10}}});
 link.addTo(graph);return link;
}
const paper=new dia.Paper({el:host,model:graph,width:'100%',height:'100%',gridSize:12,drawGrid:false,background:{color:'transparent'},cellViewNamespace:shapes,interactive:{labelMove:false},defaultLink:()=>makeLink({},{}),linkPinning:false,snapLinks:{radius:35},markAvailable:true,validateConnection:(sv,sm,tv,tm)=>!!sm&&!!tm&&sv!==tv&&sm.getAttribute('port-group')!==tm.getAttribute('port-group')});

function updateStatus(message){
 const elements=graph.getElements().length,links=graph.getLinks().length;
 count.textContent=`${elements} Bauteile · ${links} Leitungen`;
 status.textContent=message||(links>=elements&&elements>=3?'Geschlossener Aufbau möglich. JointJS verbindet und führt die Leitungen automatisch.':'Verbinde die Bauteile zu einem geschlossenen Stromkreis.');
}
function selectCell(cell){
 if(selected)selected.attr(selected.isLink()?{'line/stroke':COLORS.ink}:{'body/stroke':COLORS.petrol,'body/strokeWidth':2});
 selected=cell;
 if(selected)selected.attr(selected.isLink()?{'line/stroke':COLORS.red}:{'body/stroke':COLORS.amber,'body/strokeWidth':4});
 updateStatus(selected?`${selected.isLink()?'Leitung':'Bauteil'} ausgewählt. Mit „Auswahl löschen“ entfernen.`:'Auswahl aufgehoben.');
}
paper.on('cell:pointerclick',(view)=>selectCell(view.model));
paper.on('blank:pointerdown',()=>selectCell(null));
paper.on('link:connect',()=>updateStatus('Leitung verbunden. Die automatische Führung bleibt beim Verschieben erhalten.'));
graph.on('add remove change:source change:target',()=>updateStatus());
function add(type){const n=graph.getElements().length;const el=makeElement(type,70+(n%3)*190,90+Math.floor(n/3)*140);selectCell(el);updateStatus(`${{battery:'Batterie',lamp:'Lampe',switch:'Schalter'}[type]} eingesetzt. Ziehe an den farbigen Klemmen eine Leitung.`);return el;}
function clear(){graph.clear();selected=null;updateStatus('Zeichenfläche geleert.');}
function demo(){clear();const w=Math.max(480,wrap.clientWidth),gap=Math.max(155,(w-190)/3),b=makeElement('battery',20,180),l=makeElement('lamp',20+gap,70),s=makeElement('switch',Math.min(w-170,20+gap*2),180);makeLink({id:b.id,port:'right'},{id:l.id,port:'left'});makeLink({id:l.id,port:'right'},{id:s.id,port:'left'});makeLink({id:s.id,port:'right'},{id:b.id,port:'left'});updateStatus('Demo aufgebaut: Batterie, Lampe und Schalter bilden einen geschlossenen Ring.');}
document.querySelectorAll('[data-add]').forEach(btn=>btn.addEventListener('click',()=>add(btn.dataset.add)));
document.getElementById('demoBtn').addEventListener('click',demo);
document.getElementById('clearBtn').addEventListener('click',clear);
document.getElementById('resetBtn').addEventListener('click',demo);
document.getElementById('deleteBtn').addEventListener('click',()=>{if(!selected)return updateStatus('Wähle zuerst ein Bauteil oder eine Leitung aus.');const cell=selected;selected=null;cell.remove();updateStatus('Auswahl gelöscht.');});
new ResizeObserver(()=>paper.setDimensions(wrap.clientWidth,wrap.clientHeight)).observe(wrap);
demo();
window.__jointPilot={graph,paper,add,demo,clear,state:()=>({elements:graph.getElements().map(e=>({id:e.id,type:e.get('componentType'),position:e.position()})),links:graph.getLinks().map(l=>({source:l.source(),target:l.target()}))})};
})();
