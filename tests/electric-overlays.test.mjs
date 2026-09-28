import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import vm from 'node:vm';

// Use the project's installed Playwright via normal module resolution or NODE_PATH.
const {chromium}=createRequire(import.meta.url)('playwright');
const base=process.env.ELECTRIC_URL||'http://127.0.0.1:8875';
const html=readFileSync(new URL('../elektrische-felder/index.html',import.meta.url),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'duplicate HTML ids');

// Independent constant-field reference: test the real clock and integrator with irregular frames.
const code=name=>['stepTestCharge'].includes(name)?html.match(new RegExp('^function '+name+'\\([^]*?^}','m'))[0]:html.split('\n').find(s=>s.startsWith('function '+name+'('));
const clockState={last:0,motion:true,timeScale:100,testChargeValue:1,testMass:1,preset:'capacitor',gap:100,plateLength:100,charges:[],view:{xRange:100,yRange:100},testCharge:{x:0,y:0,vx:0,vy:0,elapsed:0,phase:'running',trail:[]}};
const clock=vm.createContext({state:clockState,document:{hidden:false},hypot:Math.hypot,fieldAt:()=>({ex:100,ey:0}),testChargeTouchesSource:()=>false,updateReadouts(){}});
vm.runInContext(code('stepTestCharge')+'\n'+code('advanceMotionTime'),clock);
for(const now of [16,116,616,2500])clock.advanceMotionTime(now);
assert.ok(Math.abs(clockState.testCharge.elapsed-250)<1e-8,'clock must not discard slow frames');
assert.ok(Math.abs(clockState.testCharge.x-.5*1e-4*250**2)<1e-8);
clock.document.hidden=true;clock.advanceMotionTime(10500);assert.ok(Math.abs(clockState.testCharge.elapsed-250)<1e-8);
clock.document.hidden=false;clock.advanceMotionTime(10600);assert.ok(Math.abs(clockState.testCharge.elapsed-260)<1e-8);
clockState.motion=false;clock.advanceMotionTime(20000);assert.ok(Math.abs(clockState.testCharge.elapsed-260)<1e-8);

const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],failed=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));page.on('request',r=>requests.push(r.url()));
 await page.goto(`${base}/elektrische-felder/`);await page.getByRole('button',{name:'Untersuchung starten'}).click();
 const reports=[];
 for(const preset of ['free','single','negative','dipole','equal','capacitor']){
  await page.locator(`[data-preset="${preset}"]`).click();
  await page.locator('#backgroundSelect').selectOption('potential');await page.locator('#equipotentialToggle').check();
  const report=await page.evaluate(()=>{
   const lab=window.__electricFieldLab,cs=lab.equipotentialDiagnostics(),preset=lab.getState().preset;
   let maxPhiError=0,maxTangentCos=0,minRadius=Infinity,maxCircleError=0,total=0;
   for(const c of cs)for(const [a,b] of c.segments){
    const m={x:(a.x+b.x)/2,y:(a.y+b.y)/2},f=lab.fieldAt(m.x,m.y),length=Math.hypot(b.x-a.x,b.y-a.y);
    maxPhiError=Math.max(maxPhiError,Math.abs(f.p-c.value));
    if(f.mag>1&&length>1e-6)maxTangentCos=Math.max(maxTangentCos,Math.abs(f.ex*(b.x-a.x)+f.ey*(b.y-a.y))/(f.mag*length));
    if(preset==='single'||preset==='negative')for(const p of [a,b]){const r=Math.hypot(p.x,p.y);minRadius=Math.min(minRadius,r);maxCircleError=Math.max(maxCircleError,Math.abs(r-8.9875517923/Math.abs(c.value)));}
    total++;
   }
   const h=1e-5,gradientErrors=[];for(const [x,y] of [[.3,.7],[-1,1],[1.4,-.5]]){const f=lab.fieldAt(x,y);gradientErrors.push(Math.hypot(f.ex+(lab.fieldAt(x+h,y).p-lab.fieldAt(x-h,y).p)/(2*h),f.ey+(lab.fieldAt(x,y+h).p-lab.fieldAt(x,y-h).p)/(2*h)));}
   const zero=cs.find(c=>c.value===0);
   return{preset,total,values:cs.map(c=>c.value),maxPhiError,maxTangentCos,maxCircleError,minRadius,gradientError:Math.max(...gradientErrors),zeroMaxX:zero?Math.max(...zero.segments.flat().map(p=>Math.abs(p.x))):null};
  });
  if(preset==='free'){assert.equal(report.total,0);}else{
   assert.ok(report.total>0,preset);assert.ok(report.maxPhiError<.06,`${preset} contour potential error ${report.maxPhiError}`);
   assert.ok(report.maxTangentCos<.07,`${preset} contour tangent error ${report.maxTangentCos}`);
   assert.ok(report.gradientError<1e-5,`${preset}: E != -grad(phi)`);
  }
  if(preset==='single'||preset==='negative'){assert.ok(report.maxCircleError<.00003);assert.ok(report.minRadius>.08);assert.ok(report.values.every(v=>preset==='single'?v>0:v<0));}
  if(preset==='dipole'||preset==='capacitor')assert.ok(report.zeroMaxX<.00003,'symmetry plane must be phi=0');
  reports.push(report);
 }
 // A constant physical value retains its color across scenes, Q changes and canvas resizing.
 await page.locator('[data-preset="single"]').click();
 const before=await page.evaluate(()=>{const l=__electricFieldLab;l.placeProbe(1,0);return{f:l.fieldAt(1,0),color:l.scalarColor('strength',10),phiColor:l.scalarColor('potential',10)};});
 await page.locator('#backgroundSelect').selectOption('strength');
 assert.match(await page.locator('#colorTitle').textContent(),/V\/m/);assert.match(await page.locator('#potentialRead').textContent(),/φ = 8,99 V/);
 await page.locator('#sourceStrengthInput').fill('2');await page.locator('#sourceStrengthInput').dispatchEvent('input');
 const after=await page.evaluate(()=>{const l=__electricFieldLab;return{f:l.fieldAt(1,0),color:l.scalarColor('strength',10),phiColor:l.scalarColor('potential',10)};});
 assert.equal(after.f.mag,before.f.mag*2);assert.equal(after.f.p,before.f.p*2);assert.deepEqual(after.color,before.color);assert.deepEqual(after.phiColor,before.phiColor);
 // Full cancellation produces a zero map, not arbitrary zero-potential contours.
 await page.evaluate(()=>{const l=__electricFieldLab;l.setPreset('dipole');});
 await page.locator('#fieldCanvas').focus();await page.keyboard.press('2');for(let i=0;i<32;i++)await page.keyboard.press('ArrowLeft');
 const cancellation=await page.evaluate(()=>({field:__electricFieldLab.fieldAt(0,1),contours:__electricFieldLab.equipotentialDiagnostics().length}));
 assert.ok(cancellation.field.mag<1e-10);assert.equal(cancellation.contours,0);
 // No collision at the edge of the viewport; a real plate impact still produces its speed.
 await page.locator('#motionModeBtn').click();await page.locator('[data-preset="single"]').click();
 const boundary=await page.evaluate(()=>{const l=__electricFieldLab;l.setMotionParameters({sourceStrength:2,testChargeValue:2,testMass:1});l.placeTestCharge(1.5,0);for(let i=0;i<50&&l.getState().testCharge.phase!=='finished';i++)l.stepTestCharge(100);return l.getState().testCharge;});
 assert.equal(boundary.stopReason,'boundary');assert.equal(boundary.finalSpeed,null);assert.equal(await page.locator('#impactSpeed').textContent(),'—');assert.equal(await page.locator('#testStatus').textContent(),'Ausschnitt verlassen');
 await page.locator('[data-preset="capacitor"]').click();await page.locator('#axisStartBtn').click();
 const impact=await page.evaluate(()=>{const l=__electricFieldLab;for(let i=0;i<10&&l.getState().testCharge.phase!=='finished';i++)l.stepTestCharge(100);return l.getState().testCharge;});
 assert.equal(impact.stopReason,'plate');assert.ok(impact.finalSpeed>0);assert.notEqual(await page.locator('#impactSpeed').textContent(),'—');
 // State and controls reset together, including after a rendered frame.
 await page.locator('#resetBtn').click();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));
 const reset=await page.evaluate(()=>({s:__electricFieldLab.getState(),background:document.querySelector('#backgroundSelect').value,contours:document.querySelector('#equipotentialToggle').checked,keyHidden:document.querySelector('#scalarKey').hidden}));
 assert.equal(reset.s.background,'none');assert.equal(reset.s.showEquipotentials,false);assert.equal(reset.background,'none');assert.equal(reset.contours,false);assert.equal(reset.keyHidden,true);
 for(const size of [{width:1440,height:900},{width:1024,height:768},{width:820,height:1180}]){
  await page.setViewportSize(size);await page.locator('[data-preset="dipole"]').click();await page.locator('#backgroundSelect').selectOption('potential');await page.locator('#equipotentialToggle').check();
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,selectHeight:document.querySelector('#backgroundSelect').getBoundingClientRect().height,labelHeight:document.querySelector('#equipotentialToggle').closest('label').getBoundingClientRect().height}));
  assert.equal(layout.overflow,false);assert.ok(layout.selectHeight>=48);assert.ok(layout.labelHeight>=48);
  await page.screenshot({path:`${tmpdir()}/electric-overlay-${size.width}-potential.png`,fullPage:true});
  await page.locator('#backgroundSelect').selectOption('strength');await page.screenshot({path:`${tmpdir()}/electric-overlay-${size.width}-strength.png`,fullPage:true});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.ok(requests.every(url=>url.startsWith(base)||url.startsWith('data:')),'unexpected external runtime request');
 console.log('Electric overlays and motion fixes OK:',JSON.stringify(reports));
}finally{await browser.close();}
