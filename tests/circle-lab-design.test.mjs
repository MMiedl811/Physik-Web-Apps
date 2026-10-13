import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const base=process.env.CIRCLE_LAB_URL||'http://127.0.0.1:8878';
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{
  for(const [width,height] of [[1440,900],[1024,768],[820,1180],[600,900],[720,450],[390,844]]){
   const page=await browser.newPage({viewport:{width,height},hasTouch:true}),errors=[],failed=[],external=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});
   page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
   await page.addInitScript(()=>{
    window.circleLabels={};window.circleBoxes=[];const oldClear=CanvasRenderingContext2D.prototype.clearRect,oldRound=CanvasRenderingContext2D.prototype.roundRect;
    CanvasRenderingContext2D.prototype.clearRect=function(){if(this.canvas.id==='orbit'){window.circleLabels={};window.circleBoxes=[];}return oldClear.apply(this,arguments)};
    CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h){if(this.canvas.id==='orbit')window.circleBoxes.push({x,y,w,h});return oldRound.apply(this,arguments)};
    const original=CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText=function(t,x,y){if(this.canvas.id==='orbit'&&t){const m=this.measureText(t),offset=this.textAlign==='center'?m.width/2:this.textAlign==='right'?m.width:0;window.circleLabels[t]={x:x-offset,y,top:y-m.actualBoundingBoxAscent,bottom:y+m.actualBoundingBoxDescent,width:m.width,w:this.canvas.clientWidth,h:this.canvas.clientHeight};}return original.apply(this,arguments);};
   });
   await page.goto(base+'/');await page.locator('a.card[href="kreisbewegungs-labor/index.html"]').click();
   await page.screenshot({path:`/tmp/circle-design-${name}-${width}-intro.png`,fullPage:true});
   await page.getByRole('button',{name:'Untersuchung starten'}).click();assert.equal(await page.locator('#play').evaluate(e=>e===document.activeElement),true);
   const layout=async()=>{
    const r=await page.evaluate(()=>{
     const rect=e=>e.getBoundingClientRect(),visible=e=>e.getClientRects().length,ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
     return {overflow:document.documentElement.scrollWidth>innerWidth,small:[...document.querySelectorAll('button,.home,.toggle')].filter(visible).filter(e=>rect(e).width<48||rect(e).height<48).map(e=>e.id||e.className),duplicates:ids.filter((id,i)=>ids.indexOf(id)!==i),cols:getComputedStyle(document.querySelector('.layout')).gridTemplateColumns.split(' ').length};
    });
    assert.equal(r.overflow,false,JSON.stringify({name,width,r}));assert.deepEqual(r.small,[]);assert.deepEqual(r.duplicates,[]);assert.equal(r.cols,width>=820?2:1);
    const boxes=await page.evaluate(()=>window.circleBoxes);for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert.equal(a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h,false,JSON.stringify({name,width,i,j,a,b}));}
    for(const [t,l] of Object.entries(await page.evaluate(()=>window.circleLabels)))assert.ok(l.x>=0&&l.x+l.width<=l.w&&l.y>=0&&l.y<=l.h,JSON.stringify({name,width,t,l}));
   };
   assert.equal(await page.locator('#paths').isChecked(),false);await layout();await page.screenshot({path:`/tmp/circle-design-${name}-${width}-ready.png`,fullPage:true});
   await page.locator('#play').click();await page.waitForTimeout(150);await page.locator('#play').click();
   const paused=await page.evaluate(()=>__kreisLab.snapshot());assert.equal(paused.running,false);assert.ok(paused.elapsed>0);await page.waitForTimeout(80);assert.equal(await page.evaluate(()=>__kreisLab.snapshot().elapsed),paused.elapsed);
   await page.locator('#reset').click();await page.locator('#step').click();assert.match(await page.locator('#angleReadout').textContent(),/15°/);
   for(let i=0;i<5;i++)await page.locator('#step').click();assert.ok(Math.abs((await page.evaluate(()=>__kreisLab.snapshot())).degrees-90)<1e-10);
   const ids=['paths','velocityVectors','accelerationVectors','tangent'];
   for(let mask=0;mask<16;mask++){
    for(let i=0;i<4;i++)await page.locator('#'+ids[i]).setChecked(Boolean(mask&(1<<i)));
    const s=await page.evaluate(()=>__kreisLab.snapshot());assert.ok(Math.abs(s.degrees-90)<1e-10);
    for(let i=0;i<4;i++)assert.equal(s[ids[i]],Boolean(mask&(1<<i)));
    await layout();
   }
   const labels=await page.evaluate(()=>window.circleLabels);
   for(const [first,second] of [['Tangentialbahn','v'],['P2','a'],['b₁','Δφ = 90°']]){const a=labels[first],b=labels[second];assert.ok(a&&b);assert.equal(a.x<b.x+b.width&&b.x<a.x+a.width&&a.top<b.bottom&&b.top<a.bottom,false,JSON.stringify({name,width,first,second,a,b}));}
   await page.screenshot({path:`/tmp/circle-design-${name}-${width}-all.png`,fullPage:true});
   for(const fraction of [.25,.5,.75,1]){
    const s=await page.evaluate(f=>{__kreisLab.reset();__kreisLab.setPaths(true);__kreisLab.setVectors(true);__kreisLab.setTangent(true);return __kreisLab.advance(8*f);},fraction);
    assert.ok(Math.abs(s.angle-2*Math.PI*fraction)<1e-12);assert.equal(s.running,false);await layout();
   }
   assert.equal(await page.locator('#play').textContent(),'Noch einmal');await page.screenshot({path:`/tmp/circle-design-${name}-${width}-finished.png`,fullPage:true});
   await page.locator('#play').click();assert.equal(await page.evaluate(()=>__kreisLab.snapshot().running),true);await page.locator('#play').click();await page.locator('#reset').click();
   for(const id of ids)assert.equal(await page.locator('#'+id).isChecked(),false);assert.equal(await page.locator('#angleReadout').textContent(),'Δφ = 0°');
   if(width===1024){await page.locator('#play').click();await page.waitForFunction(()=>!__kreisLab.snapshot().running&&__kreisLab.snapshot().degrees===360,{},{timeout:12000});assert.equal(await page.locator('#play').textContent(),'Noch einmal');await page.locator('#reset').click();}
   await page.locator('#paths').focus();assert.equal(await page.locator('#paths').evaluate(e=>getComputedStyle(e.parentElement).outlineStyle),'solid');
   await page.keyboard.press('Space');assert.equal(await page.locator('#paths').isChecked(),true);
   const image=page.locator('.context img');assert.equal(await image.evaluate(e=>e.complete&&e.naturalWidth>0),true);
   await page.addStyleTag({content:'body{font-size:32px}.title p,.pill,.observation,.context p{font-size:28px}.stage-head h2{font-size:36px}.toggle{font-size:32px}'});await layout();
   await page.screenshot({path:`/tmp/circle-design-${name}-${width}-text.png`,fullPage:true});
   await page.locator('.home').click();assert.ok(page.url().endsWith('/index.html'));assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);await page.close();
  }
  console.log(`${name}: six viewports, all 16 display combinations, start/pause, 15-degree steps, full turn, reset, canvas bounds, text zoom, keyboard and navigation passed`);
 }finally{await browser.close();}
}
