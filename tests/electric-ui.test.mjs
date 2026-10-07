import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const base=process.env.ELECTRIC_URL||'http://127.0.0.1:8877';
const browser=await chromium.launch();
try {
 const page=await browser.newPage(),errors=[],failed=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));page.on('request',r=>requests.push(r.url()));
 for(const size of [{width:1440,height:900},{width:1024,height:768},{width:820,height:1180},{width:390,height:844},{width:720,height:450}]){
  await page.setViewportSize(size);await page.goto(base+'/elektrische-felder/');
  assert.ok(await page.getByRole('dialog').isVisible());
  assert.ok(await page.getByRole('button',{name:'Untersuchung starten'}).evaluate(e=>e===document.activeElement));
  await page.screenshot({path:`/tmp/electric-ui-${size.width}-intro.png`});
  await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
  assert.ok(await page.locator('#fieldModeBtn').evaluate(e=>e===document.activeElement));
  for(const mode of ['field','motion','superposition']){
   await page.locator({field:'#fieldModeBtn',motion:'#motionModeBtn',superposition:'#superpositionModeBtn'}[mode]).click();
   await page.locator('[data-preset="capacitor"]').click();await page.locator('#singleLinesToggle').check();
   if(mode==='field'){await page.locator('#backgroundSelect').selectOption('potential');await page.locator('#equipotentialToggle').check();}
   if(mode==='motion'){
    await page.locator('[data-test-sign="-1"]').click();assert.equal(await page.locator('[data-test-sign="-1"]').getAttribute('aria-pressed'),'true');
    await page.locator('#axisStartBtn').click();await page.locator('#motionBtn').click();await page.locator('#motionBtn').click();
    assert.equal(await page.evaluate(()=>__electricFieldLab.getState().motion),false);
   }
   assert.equal(await page.locator('[data-preset="capacitor"]').getAttribute('aria-pressed'),'true');
   const report=await page.evaluate(()=>{
    const visible=e=>e.getClientRects().length>0;
    const controls=[...document.querySelectorAll('button,select,input[type="range"],summary,a.home,label.check,label.field-view-option')].filter(visible);
    const small=controls.filter(e=>{const r=e.getBoundingClientRect();return r.width<48||r.height<48;}).map(e=>e.id||e.textContent);
    const clipped=[...document.querySelectorAll('.readout strong,.analysis-box strong,.slider label,.mode-tab,.seg button,.field-views p')].filter(visible).filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent);
    const b=getComputedStyle(document.body),stage=document.querySelector('.stage-card').getBoundingClientRect(),left=document.querySelector('.left').getBoundingClientRect();
    return{small,clipped,overflow:document.documentElement.scrollWidth>innerWidth,bodyOverflow:b.overflowY,parallel:stage.left>=left.right};
   });assert.deepEqual(report.small,[]);assert.deepEqual(report.clipped,[]);assert.equal(report.overflow,false);assert.notEqual(report.bodyOverflow,'hidden');
   if(size.width>=820)assert.equal(report.parallel,true);
   await page.screenshot({path:`/tmp/electric-ui-${size.width}-${mode}.png`,fullPage:true});
  }
  await page.locator('#resetBtn').click();await page.locator('#fieldModeBtn').click();await page.locator('#fieldModeBtn').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#motionModeBtn').getAttribute('aria-selected'),'true');
  await page.locator('.model summary').click();assert.ok(await page.locator('.model').getAttribute('open')!==null);
 }
 // 200% text enlargement, including the entry and expanded explanation.
 await page.setViewportSize({width:1440,height:900});await page.goto(base+'/elektrische-felder/');await page.addStyleTag({content:'html{font-size:200%} body{font-size:32px} button,select,.mode-tab,.seg button{font-size:32px}.slider label,.readout strong,.analysis-box p,.field-views p,.model-content{font-size:30px}'});
 await page.getByRole('button',{name:'Untersuchung starten'}).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(await page.locator('.seg button,.mode-tab,.readout strong,.field-views p').evaluateAll(es=>es.filter(e=>e.getClientRects().length&&e.scrollWidth>e.clientWidth+1).map(e=>e.textContent)),[]);await page.screenshot({path:'/tmp/electric-ui-text200.png',fullPage:true});
 await page.getByRole('link',{name:'Zur Übersicht',exact:true}).click();await page.waitForURL('**/index.html');await page.locator('a[href="elektrische-felder/index.html"]').click();await page.waitForURL('**/elektrische-felder/index.html');
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.ok(requests.every(url=>url.startsWith(base)||url.startsWith('data:')));
 console.log('Electric UI OK: entry Escape/focus, all modes, selection semantics, motion controls, keyboard tabs, reset, 48px targets, uncut values, parallel iPad layout, narrow/zoom layouts, explanation, navigation and assets.');
}finally{await browser.close();}
