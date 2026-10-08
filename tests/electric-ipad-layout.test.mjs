import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const base=process.env.ELECTRIC_URL||'http://127.0.0.1:8875';
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{
  for(const size of [{width:1440,height:900},{width:1024,height:768},{width:820,height:1180},{width:600,height:900},{width:720,height:450}]){
   const page=await browser.newPage({viewport:size,hasTouch:true}),errors=[],failed=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));
   await page.addInitScript(()=>{
    window.drawnLabels={};const proto=CanvasRenderingContext2D.prototype,fill=proto.fillRect,text=proto.fillText;
    proto.fillRect=function(x,y,w,h){if(x===0&&y===0&&w>200&&h>200)window.drawnLabels={};return fill.apply(this,arguments);};
    proto.fillText=function(t,x,y){if(['Sonde','Probeladung'].includes(t)){const m=this.measureText(t);window.drawnLabels[t]={x,y,width:m.width,w:this.canvas.clientWidth,h:this.canvas.clientHeight};}return text.apply(this,arguments);};
   });
   await page.goto(base+'/elektrische-felder/');await page.getByRole('button',{name:'Untersuchung starten'}).click();
   for(const mode of ['field','motion','superposition']){
    await page.locator({field:'#fieldModeBtn',motion:'#motionModeBtn',superposition:'#superpositionModeBtn'}[mode]).click();
    await page.locator('[data-preset="capacitor"]').click();await page.locator('#singleLinesToggle').check();
    if(mode==='field'){await page.locator('#backgroundSelect').selectOption('potential');assert.equal(await page.locator('#backgroundSelect').inputValue(),'potential');}
    if(mode==='motion'){await page.locator('#axisStartBtn').click();await page.locator('#motionBtn').click();await page.locator('#motionBtn').click();}
    const report=await page.evaluate(()=>{
     const r=e=>e.getBoundingClientRect(),visible=e=>e.getClientRects().length;
     const settings=document.querySelector('.settings'),legend=settings.querySelector('legend'),source=settings.querySelector('.source-controls h3');
     return {cols:getComputedStyle(settings).gridTemplateColumns.split(' ').length,headingDelta:Math.abs(r(legend).top-r(source).top),overflow:document.documentElement.scrollWidth>innerWidth,small:[...document.querySelectorAll('button,select,input[type="range"],label.field-view-option')].filter(visible).filter(e=>r(e).width<48||r(e).height<48).map(e=>e.id),tool:[...document.querySelectorAll('#tools button')].filter(visible).map(e=>({w:r(e).width,parent:r(e.parentElement).width})),fieldHeight:r(document.querySelector('#fieldIdeaText').parentElement).height};
    });
    assert.equal(report.overflow,false);assert.deepEqual(report.small,[]);
    if(size.width>760){if(mode!=='field'||size.width>1000)assert.ok(report.headingDelta<3,JSON.stringify(report));if(mode!=='field')assert.equal(report.cols,2);}
    else assert.equal(report.cols,1);
    if(mode!=='field')for(const t of report.tool)assert.ok(Math.abs(t.w-t.parent)<2);
    if(size.width===1440&&mode==='motion')assert.ok(report.fieldHeight<250,'short field card stretched');
    await page.screenshot({path:`/tmp/electric-ipad-${name}-${size.width}-${mode}.png`,fullPage:true});
   }
   await page.locator('#motionModeBtn').click();await page.locator('[data-preset="equal"]').click();await page.locator('#axisStartBtn').click();
   await page.evaluate(()=>{__electricFieldLab.placeProbe(0,2.44);__electricFieldLab.placeTestCharge(0,2.44);__electricFieldLab.draw();});
   for(const l of Object.values(await page.evaluate(()=>window.drawnLabels))){assert.ok(l.x-l.width/2>=0&&l.x+l.width/2<=l.w);assert.ok(l.y-8>=0&&l.y+8<=l.h);}
   // A completed trajectory outside the visible area must not leave a clipped object label.
   await page.evaluate(()=>{for(let i=0;i<120;i++)__electricFieldLab.stepTestCharge(100);__electricFieldLab.draw();});
   assert.equal(await page.evaluate(()=>__electricFieldLab.getState().testCharge.stopReason),'boundary');
   assert.equal(await page.evaluate(()=>window.drawnLabels.Probeladung),undefined);
   await page.screenshot({path:`/tmp/electric-ipad-${name}-${size.width}-outside.png`,fullPage:true});
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);await page.close();
  }
 }finally{await browser.close();}
 console.log(name+': all modes, desktop, both iPad orientations, split view and zoom layout; aligned settings, full-width tools, compact analysis, label bounds, outside trajectory, touch targets and browser errors OK.');
}
