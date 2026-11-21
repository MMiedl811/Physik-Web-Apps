// Drawing coordinates: 200 units per metre. Charges are ±3 nC.
const WIDTH = 720, HEIGHT = 440, STEP = 5;
const strength = 8.9875517923 * 3 * 200;
function sample(point, charges, plates) {
  if (plates) return {v:(360-point.x)/4, ex:1, ey:0};
  let v=0, ex=0, ey=0;
  for (const c of charges) {
    const dx=point.x-c.x, dy=point.y-c.y, r=Math.hypot(dx,dy);
    if (r===0) return {v:c.q*Infinity,ex:NaN,ey:NaN};
    const k=strength*c.q/r;
    v+=k; ex+=k*dx/(r*r); ey+=k*dy/(r*r);
  }
  return {v,ex,ey};
}
// Marching squares. Shared edge IDs let a click select its connected contour.
function makeGrid(charges) {
  const rows=[];
  for(let y=0;y<=HEIGHT;y+=STEP){
    const row=[];
    for(let x=0;x<=WIDTH;x+=STEP) row.push(sample({x,y},charges,false).v);
    rows.push(row);
  }
  return rows;
}
function contours(grid,level) {
  const points=new Map(), links=new Map();
  for(let j=0;j<grid.length-1;j++) for(let i=0;i<grid[j].length-1;i++){
    const values=[grid[j][i],grid[j][i+1],grid[j+1][i+1],grid[j+1][i]];
    if(values.every(v=>v>=level) || values.every(v=>v<level)) continue;
    const hits=[];
    for(let edge=0;edge<4;edge++){
      const a=values[edge],b=values[(edge+1)%4];
      if((a>=level)===(b>=level)) continue;
      const t=Number.isFinite(a-b)?(level-a)/(b-a):0.5;
      const x=i+[t,1,1-t,0][edge], y=j+[0,t,1,1-t][edge];
      const id=[`h${i},${j}`,`v${i+1},${j}`,`h${i},${j+1}`,`v${i},${j}`][edge];
      points.set(id,{x:x*STEP,y:y*STEP});hits.push(id);
    }
    if(hits.length===4 && (values[0]-level)*(values[2]-level)<(values[1]-level)*(values[3]-level)) hits.unshift(hits.pop());
    for(let k=0;k<hits.length;k+=2){
      const a=hits[k],b=hits[k+1];
      if(!links.has(a)) links.set(a,[]);
      if(!links.has(b)) links.set(b,[]);
      links.get(a).push(b);links.get(b).push(a);
    }
  }
  const paths=[], seen=new Set();
  function walk(start){
    if(seen.has(start)) return;
    const path=[];
    let id=start, prev=null;
    while(id!=null && !seen.has(id)){
      seen.add(id);path.push(points.get(id));
      const next=links.get(id).find(other=>other!==prev);
      prev=id;id=next;
    }
    if(id===start) path.push(points.get(start));
    paths.push(path);
  }
  for(const [id,neighbors] of links) if(neighbors.length===1) walk(id);
  for(const id of links.keys()) walk(id);
  return paths;
}

// Cross-section of strips extending into the screen. Approximate the surface
// charge by constant densities on short panels. Opposite panels carry
// opposite charge, so the potential at infinity is zero.
const strip = {left:300,right:420,top:70,bottom:370,panel:10};
function logPrimitive(t,d){
  const r=Math.hypot(t,d);
  return r ? t*Math.log(r)-t+d*Math.atan2(t,d) : 0;
}
function stripKernel(x,y,top){
  const left=Math.abs(x-strip.left), right=Math.abs(x-strip.right);
  const a=y-top, b=a-strip.panel;
  return logPrimitive(a,right)-logPrimitive(b,right)-logPrimitive(a,left)+logPrimitive(b,left);
}
function solveStripCharges(){
  const n=(strip.bottom-strip.top)/strip.panel;
  const rows=Array.from({length:n},(_,i)=>{
    const y=strip.top+(i+.5)*strip.panel;
    return [...Array.from({length:n},(_,j)=>stripKernel(strip.left,y,strip.top+j*strip.panel)),60];
  });
  // Enforce +60 V at each left panel centre. Mirror symmetry gives −60 V on the right.
  for(let i=0;i<n;i++){
    const pivot=rows[i][i];
    for(let k=i;k<=n;k++) rows[i][k]/=pivot;
    for(let j=0;j<n;j++){
      if(i===j) continue;
      const factor=rows[j][i];
      for(let k=i;k<=n;k++) rows[j][k]-=factor*rows[i][k];
    }
  }
  return rows.map(row=>row[n]);
}
const densities=solveStripCharges();
function stripPotential(x,y){
  if(y>=strip.top&&y<=strip.bottom){
    if(x===strip.left) return 60;
    if(x===strip.right) return -60;
  }
  let v=0;
  for(let j=0;j<densities.length;j++) v+=densities[j]*stripKernel(x,y,strip.top+j*strip.panel);
  return v;
}
function stripSample({x,y}){
  const h=.1;
  return {v:stripPotential(x,y),ex:(stripPotential(x-h,y)-stripPotential(x+h,y))/(2*h),
    ey:(stripPotential(x,y-h)-stripPotential(x,y+h))/(2*h)};
}
let stripGrid;
function finitePlateGrid(){
  if(!stripGrid){
    stripGrid=Array.from({length:HEIGHT/STEP+1},(_,j)=>
      Array.from({length:WIDTH/STEP+1},(_,i)=>stripPotential(i*STEP,j*STEP)));
  }
  return stripGrid;
}

// Trace along the total field. Negative seeds are followed backwards and
// reversed for display. Drop duplicate connections already seeded at a plus.
function electricFieldLines(charges, plateMode){
  if(plateMode==='ideal'){
    return Array.from({length:9},(_,i)=>[{x:120,y:20+50*i},{x:600,y:20+50*i}]);
  }
  const finite=plateMode==='finite';
  const seeds=[];
  if(finite){
    for(const side of [1,-1]){
      const x=side===1?strip.left:strip.right;
      for(const offset of [-4,4]){
        for(const y of [72,95,145,220,295,345,368]) seeds.push({x:x+offset,y,side});
      }
    }
  }else{
    for(const c of charges){
      for(let i=0;i<12;i++){
        const a=(i+.5)*Math.PI/6;
        seeds.push({x:c.x+12*Math.cos(a),y:c.y+12*Math.sin(a),side:c.q});
      }
    }
  }
  function direction(p){
    const f=finite?stripSample(p):sample(p,charges,false);
    const mag=Math.hypot(f.ex,f.ey);
    return mag>1e-10?{x:f.ex/mag,y:f.ey/mag}:null;
  }
  const lines=[];
  for(const seed of seeds){
    const points=[seed], step=3*seed.side;
    let p=seed, connected=false;
    for(let i=0;i<600;i++){
      const d=direction(p);
      if(!d) break;
      const mid=direction({x:p.x+step*d.x/2,y:p.y+step*d.y/2});
      if(!mid || d.x*mid.x+d.y*mid.y<=0) break;
      const next={x:p.x+step*mid.x,y:p.y+step*mid.y};
      const hit=finite
        ? Math.abs(next.x-(seed.side>0?strip.right:strip.left))<=3 && next.y>=strip.top-2 && next.y<=strip.bottom+2
        : charges.some(c=>c.q!==seed.side && Math.hypot(next.x-c.x,next.y-c.y)<=12);
      points.push(next);
      if(hit){connected=true;break;}
      if(next.x<0||next.x>WIDTH||next.y<0||next.y>HEIGHT) break;
      p=next;
    }
    if(points.length>2 && !(seed.side<0&&connected)) lines.push(seed.side<0?points.reverse():points);
  }
  return lines;
}
