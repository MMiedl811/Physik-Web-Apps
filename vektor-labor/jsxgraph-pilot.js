(()=>{
'use strict';
const host=document.getElementById('jsxStage');
const wrap=document.getElementById('stageWrap');
const switcher=document.getElementById('rendererSwitch');
const originalBtn=document.getElementById('rendererOriginal');
const pilotBtn=document.getElementById('rendererPilot');
const stageTip=document.getElementById('stageTip');
if(!host||!wrap||!switcher||!originalBtn||!pilotBtn||!window.JXG)return;

let board=null;
let startPoint=null;
let endPoint=null;
let syncLock=false;
let renderer='original';
const COLORS={blue:'#3066a6',orange:'#c66a2b',user:'#0f766e',ink:'#25332f',grid:'#c7d2cc'};
const isPilotTask=()=>{
  const api=window.__vectorLabTest;
  if(!api)return false;
  const state=api.getState();
  return state.context==='velocity'&&state.taskIndex===0;
};
const pilotState=()=>window.__vectorLabTest.getState();
const snap=value=>{const state=pilotState();if(!state.snap)return value;const step=state.scale/2;return Math.round(value/step)*step;};
const arrowAttrs=(color,width=5)=>({strokeColor:color,strokeWidth:width,lastArrow:{type:2,size:7},fixed:true,highlight:false});

function addVector(start,vec,color,label){
  const end=[start[0]+vec[0],start[1]+vec[1]];
  board.create('arrow',[start,end],arrowAttrs(color));
  board.create('text',[(start[0]+end[0])/2,(start[1]+end[1])/2+.45,label],{fontSize:18,strokeColor:color,fixed:true,highlight:false,cssStyle:'font-family:Georgia,serif;font-weight:700'});
}
function evaluateFromPoints(){
  if(syncLock||!startPoint||!endPoint)return;
  syncLock=true;
  const start={x:snap(startPoint.X()),y:snap(startPoint.Y())};
  const end={x:snap(endPoint.X()),y:snap(endPoint.Y())};
  startPoint.setPosition(JXG.COORDS_BY_USER,[start.x,start.y]);
  endPoint.setPosition(JXG.COORDS_BY_USER,[end.x,end.y]);
  window.__vectorLabTest.setUserArrow(start,{x:end.x-start.x,y:end.y-start.y});
  syncLock=false;
}
function buildBoard(){
  if(board)JXG.JSXGraph.freeBoard(board);
  host.innerHTML='';
  const state=pilotState(),scale=Number.isFinite(state.scale)&&state.scale>0?state.scale:1;
  board=JXG.JSXGraph.initBoard('jsxStage',{
    boundingbox:[-2*scale,7*scale,9*scale,-3*scale],axis:true,grid:true,keepaspectratio:true,
    pan:{enabled:false},zoom:{enabled:false},showCopyright:false,showNavigation:false,
    renderer:'svg',maxFrameRate:30
  });
  board.defaultAxes.x.setAttribute({strokeColor:'#9cafaa',ticks:{strokeColor:'#9cafaa',label:{fontSize:12}}});
  board.defaultAxes.y.setAttribute({strokeColor:'#9cafaa',ticks:{strokeColor:'#9cafaa',label:{fontSize:12}}});
  addVector([0,0],[4,1],COLORS.blue,'vₐ');
  addVector([0,0],[2,3],COLORS.orange,'Δv');
  board.create('arrow',[[4,1],[6,4]],{...arrowAttrs(COLORS.orange,4),dash:2,strokeOpacity:.65});
  board.create('text',[4.8,3.05,'Δv verschoben'],{fontSize:13,strokeColor:COLORS.orange,fixed:true,highlight:false});
  const user=state.userArrow||{start:{x:0,y:0},vec:{x:0,y:0}};
  const pointAttrs={face:'o',fillColor:COLORS.user,strokeColor:'#fff',strokeWidth:3,snapToGrid:state.snap,snapSizeX:scale/2,snapSizeY:scale/2,showInfobox:false};
  startPoint=board.create('point',[user.start.x,user.start.y],{...pointAttrs,name:'Start',size:7});
  endPoint=board.create('point',[user.start.x+user.vec.x,user.start.y+user.vec.y],{...pointAttrs,name:'Spitze',size:8});
  board.create('arrow',[startPoint,endPoint],{strokeColor:COLORS.user,strokeWidth:6,lastArrow:{type:2,size:8},highlight:false});
  startPoint.on('drag',evaluateFromPoints);endPoint.on('drag',evaluateFromPoints);
  startPoint.on('up',evaluateFromPoints);endPoint.on('up',evaluateFromPoints);
  board.create('text',[-1.7*scale,-2.35*scale,state.snap?`Rasterfang: ${scale/2}`:'Rasterfang aus'],{fontSize:13,strokeColor:'#68716d',fixed:true,highlight:false});
}
function setRenderer(next){
  renderer=next==='pilot'&&isPilotTask()?'pilot':'original';
  const active=renderer==='pilot';
  originalBtn.setAttribute('aria-pressed',String(!active));
  pilotBtn.setAttribute('aria-pressed',String(active));
  wrap.classList.toggle('jsx-active',active);
  document.body.classList.toggle('jsx-pilot-active',active);
  const state=window.__vectorLabTest.getState();
  stageTip.textContent=active?`JSXGraph-Pilot: Start und Spitze ziehen · Maßstab ${state.scale} · Rasterfang ${state.snap?'an':'aus'}`:'Hilfspfeil: am Schaft verschieben · an den Kreisen verändern · freie Fläche: Ergebnispfeil zeichnen';
  if(active){buildBoard();requestAnimationFrame(()=>board&&board.resizeContainer(host.clientWidth,host.clientHeight,true));}
}
function refreshAvailability(){
  const available=isPilotTask();
  switcher.classList.toggle('available',available);
  if(!available&&renderer==='pilot')setRenderer('original');
}
originalBtn.addEventListener('click',()=>setRenderer('original'));
pilotBtn.addEventListener('click',()=>setRenderer('pilot'));
new ResizeObserver(()=>{if(renderer==='pilot'&&board)board.resizeContainer(host.clientWidth,host.clientHeight,true);}).observe(host);
new MutationObserver(refreshAvailability).observe(document.getElementById('taskNumber'),{childList:true,characterData:true,subtree:true});
document.querySelectorAll('[data-context],#nextBtn').forEach(el=>el.addEventListener('click',()=>queueMicrotask(refreshAvailability)));
document.querySelectorAll('#scaleSelect,#snapToggle').forEach(el=>el.addEventListener('change',()=>{if(renderer==='pilot')buildBoard();}));
window.addEventListener('vector-lab-ready',refreshAvailability,{once:true});
refreshAvailability();
window.__jsxGraphPilot={setRenderer,getRenderer:()=>renderer,isAvailable:isPilotTask,getBoard:()=>board,setArrow(start,vec){setRenderer('pilot');startPoint.setPosition(JXG.COORDS_BY_USER,[start.x,start.y]);endPoint.setPosition(JXG.COORDS_BY_USER,[start.x+vec.x,start.y+vec.y]);evaluateFromPoints();return window.__vectorLabTest.evaluate();}};
})();
