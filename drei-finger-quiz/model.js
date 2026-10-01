(function(root){
 'use strict';
 const d=Math.SQRT1_2;
 const directions=[['nw','↖','oben links',[-d,d,0]],['n','↑','oben',[0,1,0]],['ne','↗','oben rechts',[d,d,0]],['w','←','links',[-1,0,0]],['zero','0','keine Kraft',[0,0,0]],['e','→','rechts',[1,0,0]],['sw','↙','unten links',[-d,-d,0]],['s','↓','unten',[0,-1,0]],['se','↘','unten rechts',[d,-d,0]],['in','⊗','in die Ebene',[0,0,-1]],['out','⊙','aus der Ebene',[0,0,1]]].map(([id,icon,label,vector])=>({id,icon,label,vector}));
 const byId=Object.fromEntries(directions.map(x=>[x.id,x]));
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
 const norm=a=>{const n=Math.hypot(...a);return n?a.map(x=>x/n):[0,0,0]};
 const equal=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<1e-8);
 const force=s=>norm(cross(byId[s.v].vector,byId[s.b].vector).map(x=>x*s.q));
 const tasks=[
  {missing:'f',v:'e',b:'in',q:-1,f:'s'}, {missing:'f',v:'e',b:'in',q:1,f:'n'},
  {missing:'f',v:'w',b:'out',q:-1,f:'s'}, {missing:'f',v:'e',b:'out',q:1,f:'s'},
  {missing:'f',v:'ne',b:'in',q:-1,f:'se'}, {missing:'b',v:'w',b:'out',q:1,f:'n'},
  {missing:'v',v:'out',b:'ne',q:-1,f:'se'}, {missing:'q',v:'w',b:'out',q:1,f:'n'},
  {missing:'b',v:'sw',b:'out',q:1,f:'nw'}, {missing:'v',v:'in',b:'s',q:-1,f:'e'},
  {missing:'v',v:'in',b:'e',q:1,f:'s'}, {missing:'f',v:'e',b:'e',q:-1,f:'zero'}
 ];
 function choices(task){
  if(task.missing==='q')return [1,-1];
  return directions.filter(x=>task.missing==='f'||(x.id!=='zero'&&Math.abs(dot(x.vector,byId[task.missing==='b'?task.v:task.b].vector))<1e-8)).map(x=>x.id);
 }
 function correct(task,answer){const s={...task,[task.missing]:answer};return equal(force(s),byId[s.f].vector)}
 function prediction(task,answer){
  const s={...task,[task.missing]:answer};
  if(task.missing==='f'){
   const v=byId[s.v].vector,f=byId[s.f].vector;
   if(s.f==='zero')s.b=s.v;
   else if(Math.abs(dot(v,f))>1e-8)return null;
   else return {...s,field:norm(cross(f,v).map(x=>x/s.q))};
  }
  return {...s,field:byId[s.b].vector};
 }
 function position(s,t){
  const v=byId[s.v].vector,b=s.field||byId[s.b].vector,par=b.map(x=>x*dot(v,b)),perp=v.map((x,i)=>x-par[i]),curve=cross(perp,b);
  return v.map((_,i)=>t*par[i]+Math.sin(t)*perp[i]+s.q*(1-Math.cos(t))*curve[i]);
 }
 const api={directions,byId,tasks,cross,dot,force,choices,correct,prediction,position};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FingerQuiz=api;
})(typeof window!=='undefined'?window:globalThis);
