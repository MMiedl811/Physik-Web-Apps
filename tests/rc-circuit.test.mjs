import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile} from 'node:fs/promises';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const base=process.env.RC_URL||'http://127.0.0.1:8893';
const output=process.env.RC_QA||'/tmp/rc-qa';
await mkdir(output,{recursive:true});
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{
 for(const [width,height] of [[1440,900],[1024,768],[820,1180],[600,900],[390,844],[720,450]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true});
  const page=await context.newPage(),errors=[],failed=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('requestfailed',r=>failed.push(r.url()));
  page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))external.push(r.url());});
  // Deterministic animation frames, exercising the application's actual callback.
  await page.addInitScript(()=>{window.requestAnimationFrame=callback=>{window.rcFrame=callback;return 1;};});
  await page.goto(base+'/index.html');
  assert.equal(await page.locator('a.card').count(),20);
  await page.locator('a[href="rc-auf-und-entladen/"]').click();
  const audit=async label=>{
   const result=await page.evaluate(()=>{
    const shown=e=>e.getClientRects().length&&(!e.closest('details:not([open])')||e.tagName==='SUMMARY');
    const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
    const controls=[...document.querySelectorAll('button,select,input[type=range],summary,.home,label:has(input[type=checkbox])')].filter(shown);
    return {overflow:document.documentElement.scrollWidth>innerWidth,duplicates:ids.filter((id,i)=>ids.indexOf(id)!==i),small:controls.filter(e=>{const r=e.getBoundingClientRect();return r.width<47.9||r.height<47.9;}).map(e=>e.id||e.tagName)};
   });
   assert.deepEqual(result,{overflow:false,duplicates:[],small:[]},`${name} ${width} ${label}`);
  };
  const shot=async label=>{if([1440,1024,820,390].includes(width))await page.screenshot({path:`${output}/${name}-${width}-${label}.png`,fullPage:true});};
  const advance=async seconds=>page.evaluate(seconds=>{for(let j=0;j<seconds*10;j++){window.rcNow=(window.rcNow||1000)+100;window.rcFrame(window.rcNow);}},seconds);
  await audit('bereit');await shot('bereit');
  await page.locator('#discharge').click();assert.match(await page.locator('#explanation').textContent(),/ungeladen/);assert.match(await page.locator('#direction').textContent(),/I = 0/);await page.locator('#charge').click();await page.locator('#reset').click();
  await page.locator('#play').click();await advance(4.1);await page.locator('#play').click();
  assert.match(await page.locator('#play').textContent(),/Start/);
  const before=await page.evaluate(()=>values().uc);
  await page.locator('#discharge').click();
  assert.equal(await page.evaluate(()=>values().uc),before);
  assert.ok(await page.evaluate(()=>values().i<0));
  await page.locator('#reset').click();
  assert.equal(await page.locator('#measuredVoltage').textContent(),'6,00 V');
  assert.equal(await page.locator('#current').textContent(),'−0,300 mA'.replace('−','-'));
  for(const key of ['uc','ur','i']){await page.locator('#quantity').selectOption(key);await page.locator('#meter').selectOption(key==='i'?'uc':key);await audit('entladen '+key);}
  await shot('entladen');
  await page.locator('#area').selectOption('exact');
  await page.locator('#play').click();await advance(21);assert.match(await page.locator('#play').textContent(),/Wiederholen/);
  assert.match(await page.locator('#areaInfo').textContent(),/-2,980 mC/);
  await page.locator('#cycle').click();await page.locator('#preview').uncheck();await page.locator('#preview').check();
  await page.locator('#area').selectOption('mean');await page.locator('#intervals').selectOption('50');
  await audit('gesamtverlauf flaeche');await shot('gesamtverlauf');
  await page.locator('#speed').selectOption('2');await page.locator('#play').click();await advance(16.2);
  assert.equal(await page.evaluate(()=>state.mode),'discharge');assert.ok(await page.evaluate(()=>values().i<0));
  await advance(11);assert.match(await page.locator('#play').textContent(),/Wiederholen/);
  await page.locator('#play').click();assert.equal(await page.evaluate(()=>state.mode),'charge');
  await page.locator('#reset').click();assert.equal(await page.evaluate(()=>state.running),false);
  for(const id of ['voltage','resistance','capacitance']){await page.locator('#'+id).fill(await page.locator('#'+id).getAttribute('max'));assert.equal(await page.evaluate(()=>state.t),0);}
  for(const summary of await page.locator('summary').all())await summary.click();
  await page.locator('#formulaQuantity').selectOption('ur');await audit('extremwerte und erklaerungen');
  await page.locator('#formulaQuantity').selectOption('uc');
  await context.setOffline(true);await page.locator('#discharge').click();await page.locator('#reset').click();await audit('offline');await context.setOffline(false);
  if(width===1440){
   const physical=await page.evaluate(()=>{
    const {r,c,v}=params(),tau=r*c;let kirchhoff=0,continuity=0,ode=0,integral=0;
    for(const mode of ['charge','discharge']){
     state.cycle=false;state.mode=mode;state.start=mode==='charge'?0:v;
     const n=20000,dt=5*tau/n;let q=0;
     for(let j=0;j<=n;j++){const t=j*dt,a=values(t);q+=a.i*dt*(j===0||j===n?.5:1);kirchhoff=Math.max(kirchhoff,Math.abs(a.uc+a.ur-(mode==='charge'?v:0)));if(j>0&&j<n){const h=tau*1e-5;ode=Math.max(ode,Math.abs(c*(values(t+h).uc-values(t-h).uc)/(2*h)-a.i));}}
     integral=Math.max(integral,Math.abs(q-c*(values(5*tau).uc-state.start)));
    }
    state.cycle=true;continuity=Math.abs(values(8*tau-1e-8*tau).uc-values(8*tau).uc);
    let agreement=0;
    for(const cycle of [false,true])for(const mode of ['charge','discharge'])for(const start of [0,v*.4,v]){
     state.cycle=cycle;state.mode=mode;state.start=start;
     for(const t of [0,tau,5*tau,8*tau,13*tau])for(const key of ['i','uc','ur'])agreement=Math.max(agreement,Math.abs(values(t)[key]-runValues(snapshot(),t)[key]));
    }
    return {kirchhoff,continuity,ode,integral,agreement};
   });
   assert.ok(physical.kirchhoff<1e-12);assert.ok(physical.continuity<1e-8);assert.ok(physical.ode<1e-10);assert.ok(physical.integral<1e-9);assert.equal(physical.agreement,0);
   console.log(name+' Bilanzen: '+JSON.stringify(physical));
  }
  // Saved curves retain parameters and initial voltage after every live change.
  await page.locator('#voltage').fill('6');await page.locator('#resistance').fill('20');await page.locator('#capacitance').fill('500');
  await page.locator('#discharge').click();await page.locator('#reset').click();
  await page.locator('#newCurve').click();await page.locator('#resistance').fill('40');
  assert.equal(await page.locator('#curveLegend li').count(),2);
  const comparison=await page.evaluate(()=>({saved:runValues(savedRuns[0],0).i,current:runValues(snapshot(),0).i}));
  assert.equal(comparison.saved,-.0003);assert.equal(comparison.current,-.00015);
  for(const key of ['uc','ur','i']){await page.locator('#compareQuantity').selectOption(key);await audit('vergleich '+key);}
  await page.locator('#comparisonTable').evaluate(e=>e.closest('details').open=true);
  await audit('wertetabelle');
  if([1440,1024,820,390].includes(width))await page.locator('.comparison').screenshot({path:`${output}/${name}-${width}-vergleich.png`});
  if(width===1024){
   await context.setOffline(true);let downloading=page.waitForEvent('download');await page.locator('#exportPng').click();const png=await downloading;
   await png.saveAs(`${output}/${name}-export.png`);const bytes=await readFile(`${output}/${name}-export.png`);assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes.readUInt32BE(16),1600);assert.ok(bytes.length>30000);await context.setOffline(false);
   downloading=page.waitForEvent('download');await page.locator('#exportCsv').click();const csv=await downloading;const csvText=await readFile(await csv.path(),'utf8');assert.match(csvText,/keine Messdaten/);assert.match(csvText,/-0,00030000|"-0,30000000"/);assert.match(csvText,/Kurve 2: Uᵣ/);
   await page.locator('#sampleCount').selectOption('51');
   assert.equal(await page.locator('#comparisonTable tbody tr').count(),51);
   await page.locator('#newCurve').click();
   for(const value of ['50','60','70']){await page.locator('#resistance').fill(value);await page.locator('#newCurve').click();}
   await page.locator('#resistance').fill('80');assert.equal(await page.locator('#curveLegend li').count(),6);assert.equal(await page.locator('#newCurve').isDisabled(),true);await audit('sechs kurven');
   await page.locator('.comparison').screenshot({path:`${output}/${name}-sechs-kurven.png`});
   downloading=page.waitForEvent('download');await page.locator('#exportPng').click();await (await downloading).saveAs(`${output}/${name}-export-sechs.png`);
   await page.locator('#clearCurves').click();assert.equal(await page.locator('#curveLegend li').count(),1);assert.equal(await page.locator('#clearCurves').isDisabled(),true);
   await page.locator('#cycle').click();
   for(const key of ['uc','ur']){
    await page.locator('#compareQuantity').selectOption(key);
    downloading=page.waitForEvent('download');await page.locator('#exportPng').click();await (await downloading).saveAs(`${output}/${name}-export-cycle-${key}.png`);
   }

  }
  await page.locator('.home').click();assert.equal(page.url(),base+'/index.html');
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);
  await context.close();console.log(`${name} ${width}×${height}: Bedienung, Layout, Navigation und Offlinebetrieb bestanden`);
 }
 }finally{await browser.close();}
}
// Independently check executable inline JavaScript syntax as a classic script.
const {Script}=await import('node:vm');
const html=await readFile(new URL('../rc-auf-und-entladen/index.html',import.meta.url),'utf8');
for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new Script(script[1]);
console.log('JavaScript-Syntax bestanden');
