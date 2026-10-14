import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const base=process.env.NEWTON_URL||'http://127.0.0.1:8883';
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{
  for(const [width,height] of [[1440,900],[1024,768],[820,1180],[600,900],[720,450],[390,844]]){
   const page=await browser.newPage({viewport:{width,height},hasTouch:true}),errors=[],failed=[],external=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});
   page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
   await page.addInitScript(()=>{
    window.newtonLabels={};const fill=CanvasRenderingContext2D.prototype.fillRect,text=CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillRect=function(x,y,w,h){if(this.canvas.id==='space'&&x===0&&y===0&&w>100&&h>100)window.newtonLabels={};return fill.apply(this,arguments)};
    CanvasRenderingContext2D.prototype.fillText=function(t,x,y){if(this.canvas.id==='space')window.newtonLabels[t]={x,y,width:this.measureText(t).width,w:this.canvas.clientWidth,h:this.canvas.clientHeight};return text.apply(this,arguments)};
   });
   await page.goto(base+'/');await page.locator('a.card[href="newtons-kanonenkugel/index.html"]').click();
   await page.screenshot({path:`/tmp/newton-design-${name}-${width}-intro.png`,fullPage:true});
   await page.getByRole('button',{name:'Untersuchung starten'}).click();assert.equal(await page.locator('#play').evaluate(e=>e===document.activeElement),true);
   assert.equal(await page.evaluate(()=>__newtonFormulaRenderer.count()),3);assert.equal(await page.evaluate(()=>__newtonFormulaRenderer.errors()),0);
   const layout=async()=>{
    const r=await page.evaluate(()=>{
     const rect=e=>e.getBoundingClientRect(),visible=e=>e.getClientRects().length,ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
     const head=rect(document.querySelector('.scene-head')),canvas=rect(document.querySelector('#space'));
     return {overflow:document.documentElement.scrollWidth>innerWidth,wide:[...document.querySelectorAll('body *')].filter(e=>visible(e)&&(rect(e).right>innerWidth+1||e.scrollWidth>e.clientWidth+2)).map(e=>({tag:e.tagName,id:e.id,cls:e.className,right:rect(e).right,sw:e.scrollWidth,cw:e.clientWidth})),small:[...document.querySelectorAll('button,input,summary,.home')].filter(visible).filter(e=>rect(e).width<48||rect(e).height<48).map(e=>e.id||e.className),duplicates:ids.filter((id,i)=>ids.indexOf(id)!==i),overlappingGroups:[...document.querySelector('.panel').children].some((e,i,all)=>i&&rect(all[i-1]).bottom>rect(e).top+1),cols:getComputedStyle(document.querySelector('.layout')).gridTemplateColumns.split(' ').length,overlay:head.bottom>canvas.top+.5};
    });
    if(r.overflow)await page.screenshot({path:`/tmp/newton-overflow-${name}-${width}.png`,fullPage:true});assert.equal(r.overflow,false,JSON.stringify({name,width,r}));assert.deepEqual(r.small,[]);assert.deepEqual(r.duplicates,[]);assert.equal(r.cols,width>=820?2:1);assert.equal(r.overlay,false);assert.equal(r.overlappingGroups,false,'Bediengruppen überlagern sich');
    for(const [t,l] of Object.entries(await page.evaluate(()=>window.newtonLabels)))assert.ok(l.x>=0&&l.x+l.width<=l.w&&l.y>=0&&l.y<=l.h,JSON.stringify({name,width,t,l}));
   };
   await page.locator('#slow').click();assert.equal(await page.locator('#slow').getAttribute('aria-pressed'),'true');
   await page.locator('#slow').click();assert.equal(await page.locator('#slow').getAttribute('aria-pressed'),'false');
   for(const preset of ['circle','5000','11500','0']){
    await page.locator(`[data-speed="${preset}"]`).click();assert.equal(await page.locator(`[data-speed="${preset}"]`).getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-speed][aria-pressed="true"]').count(),1);
    await page.waitForTimeout(400);await layout();await page.screenshot({path:`/tmp/newton-design-${name}-${width}-${preset}-ready.png`,fullPage:true});
    await page.locator('#play').click();await page.waitForTimeout(100);await page.locator('#play').click();assert.equal(await page.evaluate(()=>__newtonTest.state.running),false);
    const time=await page.evaluate(()=>__newtonTest.snapshot().t);await page.waitForTimeout(60);assert.equal(await page.evaluate(()=>__newtonTest.snapshot().t),time);
    await page.locator('#reset').click();await page.locator('#step').click();assert.ok(await page.evaluate(()=>__newtonTest.snapshot().t)>0);
    if(preset==='circle'){
     await page.locator('#reset').click();const result=await page.evaluate(()=>{const m=__newtonTest,a=m.snapshot();m.step(2.5);return {start:a,end:m.snapshot(),ax:m.acceleration(6571000,0),arrow:m.gravityArrowLength(6571000*2)};});
     assert.ok(Math.abs(result.ax.x+398589196000000/6571000**2)<1e-10);assert.ok(Math.abs(result.ax.y)<1e-12);assert.ok(Math.abs(result.arrow-16.25)<1e-12);assert.ok(Math.abs(result.end.r-6571000)<2);assert.ok(Math.abs((result.end.energy-result.start.energy)/result.start.energy)<1e-7);
    }else{
     const done=await page.evaluate(()=>{const m=__newtonTest;for(let i=0;i<2000&&!['Aufprall','Flucht'].includes(m.snapshot().status);i++)m.step(.1);return m.snapshot();});
     assert.equal(done.status,preset==='11500'?'Flucht':'Aufprall');assert.equal(await page.locator('#play').textContent(),'Noch einmal');
     await page.waitForTimeout(400);await layout();await page.screenshot({path:`/tmp/newton-design-${name}-${width}-${preset}-finished.png`,fullPage:true});
     await page.locator('#play').click();assert.equal(await page.evaluate(()=>__newtonTest.state.running),true);await page.locator('#play').click();assert.ok(await page.evaluate(()=>__newtonTest.snapshot().t)<100);
    }
   }
   const initial=await page.evaluate(()=>__newtonTest.state.initial);
   for(const bad of ['7.9','13','-1','abc']){await page.locator('#speedInput').fill(bad);await page.locator('#speedInput').press('Enter');assert.equal(await page.locator('#speedInput').getAttribute('aria-invalid'),'true');assert.equal(await page.locator('#speedError').isVisible(),true);assert.equal(await page.evaluate(()=>__newtonTest.state.initial),initial);await layout();}
   await page.screenshot({path:`/tmp/newton-design-${name}-${width}-error.png`,fullPage:true});
   await page.locator('#speedInput').fill('7,9');await page.locator('#speedInput').press('Enter');assert.equal(await page.evaluate(()=>__newtonTest.state.initial),7900);assert.equal(await page.locator('#speedError').isVisible(),false);assert.equal(await page.locator('[data-speed][aria-pressed="true"]').count(),0);
   await page.locator('#speed').fill('12000');assert.equal(await page.evaluate(()=>__newtonTest.state.initial),12000);await page.locator('#reset').click();assert.equal(await page.evaluate(()=>__newtonTest.snapshot().t),0);
   await page.locator('[data-speed="circle"]').click();assert.match(await page.locator('#vR').textContent(),/^\d+,\d{2} km\/s$/);assert.match(await page.locator('#gR').textContent(),/^\d+,\d{2} m\/s²$/);
   await page.locator('summary').click();await page.locator('#speedInput').focus();assert.equal(await page.locator('#speedInput').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
   await page.addStyleTag({content:'body{font-size:32px}.title p,.zoom-readout,.value span,.note,.input-error{font-size:28px}.value strong{font-size:34px}.vector-key,.read{font-size:32px}'});await page.waitForTimeout(200);await layout();
   await page.screenshot({path:`/tmp/newton-design-${name}-${width}-text.png`,fullPage:true});
   await page.locator('.home').click();assert.ok(page.url().endsWith('/index.html'));assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);await page.close();
  }
  console.log(`${name}: six viewports, all presets, impact/escape, circular energy reference, input errors, slow motion, reset, labels, text zoom and navigation passed`);
 }finally{await browser.close();}
}
