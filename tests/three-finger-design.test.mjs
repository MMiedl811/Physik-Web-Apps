import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium,webkit}=require('playwright'),M=require('../drei-finger-quiz/model.js');
const base=process.env.FINGER_URL||'http://127.0.0.1:8877';
for(const [name,engine] of Object.entries({chromium,webkit})){
 if(process.env.FINGER_BROWSER&&process.env.FINGER_BROWSER!==name)continue;
 const browser=await engine.launch(),passedSizes=[];
 try{
  for(const [width,height] of [[1440,900],[1024,768],[820,1180],[600,900],[720,450],[390,844]]){
   if(process.env.FINGER_WIDTH&&Number(process.env.FINGER_WIDTH)!==width)continue;
   const page=await browser.newPage({viewport:{width,height},hasTouch:true}),errors=[],failed=[],external=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));
   page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
   await page.goto(base+'/');await page.locator('a.card[href="drei-finger-quiz/index.html"]').click();
   const layout=async()=>{
    const r=await page.evaluate(()=>{
     const rect=e=>e.getBoundingClientRect(),visible=e=>e.getClientRects().length,ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
     return {overflow:document.documentElement.scrollWidth>innerWidth,wide:[...document.querySelectorAll('body *')].filter(e=>visible(e)&&(rect(e).right>innerWidth+1||e.scrollWidth>e.clientWidth+2)).map(e=>({id:e.id,tag:e.tagName,cls:e.className,sw:e.scrollWidth,cw:e.clientWidth,right:rect(e).right})),small:[...document.querySelectorAll('button,select,summary,.home')].filter(visible).filter(e=>rect(e).width<48||rect(e).height<48).map(e=>e.id||e.textContent),duplicates:ids.filter((id,i)=>ids.indexOf(id)!==i),cols:getComputedStyle(document.querySelector('.workspace')).gridTemplateColumns.split(' ').length};
    });
    if(r.overflow)await page.screenshot({path:`/tmp/finger-overflow-${name}-${width}.png`,fullPage:true});
    assert.equal(r.overflow,false,JSON.stringify({name,width,r}));assert.deepEqual(r.small,[]);assert.deepEqual(r.duplicates,[]);assert.equal(r.cols,width>=820?2:1);
   };
   await layout();assert.equal(await page.locator('#check').isDisabled(),true);
   for(let i=0;i<M.tasks.length;i++){
    const t=M.tasks[i],label=a=>t.missing==='q'?(a===1?'positiv':'negativ'):M.byId[a].label;
    await page.locator('#taskSelect').selectOption(String(i));await layout();
    const wrong=M.choices(t).find(a=>!M.correct(t,a));
    await page.locator('#pad').getByRole('button',{name:label(wrong),exact:true}).click();
    await page.locator('#check').click();assert.equal(await page.locator('#feedback').getAttribute('class'),'feedback wrong');
    await page.locator('#pause').click();assert.equal(await page.locator('#pause').textContent(),'Weiter abspielen');
    await layout();
    if([0,5,6,7,11].includes(i))await page.screenshot({path:`/tmp/finger-${name}-${width}-${i}-wrong.png`,fullPage:true});
    await page.locator('#pad').getByRole('button',{name:label(t[t.missing]),exact:true}).click();
    assert.equal(await page.locator('#comparison').isVisible(),false);
    assert.equal(await page.locator('#pad button[aria-pressed="true"]').getAttribute('aria-label'),label(t[t.missing]));assert.equal(await page.locator('#pad button[aria-pressed="true"]').evaluate(e=>e===document.activeElement),true);
    await page.locator('#check').click();assert.match(await page.locator('#feedback').textContent(),/^Richtig:/);
    await page.locator('#pause').click();await page.locator('#replay').click();assert.equal(await page.locator('#pause').textContent(),'Pause');await page.locator('#pause').click();
    await layout();
    if([0,5,6,7,11].includes(i))await page.screenshot({path:`/tmp/finger-${name}-${width}-${i}-right.png`,fullPage:true});
    if(i===11&&width===1024){await page.locator('#replay').click();await page.waitForTimeout(4000);assert.equal(await page.locator('#pause').textContent(),'Weiter abspielen');await page.screenshot({path:`/tmp/finger-${name}-${width}-finished.png`,fullPage:true});}
   }
   assert.equal(await page.locator('#next').isDisabled(),true);assert.match(await page.locator('#progress').textContent(),/12 von 12/);
   await page.locator('#previous').click();assert.equal(await page.locator('#taskSelect').inputValue(),'10');await page.locator('#next').click();
   await page.locator('summary').click();assert.equal(await page.locator('details').getAttribute('open'),'');
   await page.locator('#taskSelect').focus();assert.equal(await page.locator('#taskSelect').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
   await page.addStyleTag({content:'body{font-size:32px} .small,.hint,.legend,header p,.task-picker label,.pad button{font-size:28px}.answer h2{font-size:36px}'});await layout();
   await page.screenshot({path:`/tmp/finger-${name}-${width}-text.png`,fullPage:true});
   await page.locator('.home').click();assert.ok(page.url().endsWith('/index.html'));
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);
   passedSizes.push(`${width}x${height}`);await page.close();
  }
  console.log(`${name}: all 12 tasks, wrong/right answers, playback, navigation, touch, ${passedSizes.join(", ")} and text zoom passed`);
 }finally{await browser.close();}
}
