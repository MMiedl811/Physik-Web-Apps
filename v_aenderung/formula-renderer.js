(()=>{
'use strict';
const formulas=[...document.querySelectorAll('.katex-formula')];
if(!formulas.length||!window.katex)return;
formulas.forEach(node=>window.katex.render(node.dataset.tex,node,{throwOnError:false,strict:'warn',output:'htmlAndMathml'}));
window.__formulaRenderer={count:()=>formulas.length,errors:()=>document.querySelectorAll('.katex-error').length};
})();
