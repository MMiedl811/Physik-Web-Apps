(()=>{
'use strict';
const originalBtn=document.getElementById('formulaOriginal');
const katexBtn=document.getElementById('formulaKatex');
const formulas=[...document.querySelectorAll('.katex-formula')];
if(!originalBtn||!katexBtn||!formulas.length||!window.katex)return;
const originals=new Map(formulas.map(node=>[node,node.innerHTML]));
let renderer='original';
function renderKatex(){
  formulas.forEach(node=>window.katex.render(node.dataset.tex,node,{throwOnError:false,strict:'warn',output:'htmlAndMathml'}));
}
function restoreOriginal(){formulas.forEach(node=>{node.innerHTML=originals.get(node);});}
function setRenderer(next){
  renderer=next==='katex'?'katex':'original';
  const active=renderer==='katex';
  originalBtn.setAttribute('aria-pressed',String(!active));
  katexBtn.setAttribute('aria-pressed',String(active));
  if(active)renderKatex();else restoreOriginal();
}
originalBtn.addEventListener('click',()=>setRenderer('original'));
katexBtn.addEventListener('click',()=>setRenderer('katex'));
window.__katexPilot={setRenderer,getRenderer:()=>renderer,count:()=>formulas.length,texts:()=>formulas.map(node=>node.textContent.trim())};
})();
