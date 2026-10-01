import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {defaultState,solve,validate,importState} from '../feldvektor-werkstatt/model.mjs';
// Independently rounded Coulomb reference: 10 pC at 5 cm gives about 35.95 V/m.
const s=defaultState();s.sources=[{id:1,x:0,y:0,q:1e-11}];s.point={x:3,y:4};
const at5=solve(s);assert.ok(Math.abs(at5.magnitude-35.95)<.002);assert.ok(Math.abs(at5.fields[0].x-21.5701243)<1e-6);assert.ok(Math.abs(at5.fields[0].y-28.7601657)<1e-6);
s.point={x:6,y:8};const at10=solve(s);assert.ok(Math.abs(at10.magnitude/at5.magnitude-.25)<1e-12);
s.sources[0].q=-2e-11;assert.ok(Math.abs(solve(s).res.x/at10.res.x+2)<1e-12);
s.sources=[{id:1,x:0,y:0,q:1e-11},{id:2,x:6,y:0,q:1e-11},{id:3,x:0,y:8,q:1e-11},{id:4,x:6,y:8,q:1e-11}];s.point={x:3,y:4};assert.equal(solve(s).angle,null);assert.equal(solve(s).zero,true);
s.sources[3].q=-1e-11;const four=solve(s);assert.ok(Math.abs(four.res.x-43.1402486)<1e-6);assert.ok(Math.abs(four.res.y-57.5203315)<1e-6);
s.point={x:0,y:0};assert.throws(()=>solve(s),/nicht definiert/);s.sources[0].q=0;assert.ok(Number.isFinite(solve(s).magnitude));s.sources=[];assert.equal(solve(s).magnitude,0);
const legacy={version:1,settings:{x1:0,y1:0,s1:1,e1:4,x2:8,y2:2,s2:1,e2:8,px:5,py:6,scale:1,vectors:true,sum:true,construction:true,guides:true,grid:true}};
const migrated=importState(legacy),oldResult=solve(migrated);assert.ok(Math.abs(oldResult.fields[0].mag-4)<1e-12);assert.ok(Math.abs(oldResult.fields[1].mag-8)<1e-12);
const expectedMagnitude=Math.sqrt(80+64*9/(5*Math.sqrt(61)));assert.ok(Math.abs(oldResult.magnitude-expectedMagnitude)<1e-12);
assert.throws(()=>validate({...defaultState(),sources:Array(5).fill({id:1,x:0,y:0,q:1e-11})}),/vier/);
assert.throws(()=>importState({version:2,settings:{...defaultState(),scale:-1}}),/Pfeilmaßstab/);
const {chromium}=createRequire(import.meta.url)('playwright'),base=process.env.WORKSHOP_URL||'http://127.0.0.1:8875';
const html=readFileSync(new URL('../feldvektor-werkstatt/index.html',import.meta.url),'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);assert.doesNotMatch(html,/svgExport/);
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],requests=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));page.on('requestfailed',r=>failed.push(r.url()));
 await page.goto(base+'/feldvektor-werkstatt/');await page.waitForFunction(()=>window.__fieldVectorWorkshop);
 const state=()=>page.evaluate(()=>__fieldVectorWorkshop.getState()),result=()=>page.evaluate(()=>__fieldVectorWorkshop.getResult());
 const fill=async(id,v)=>page.locator('#'+id).fill(String(v));
 await page.screenshot({path:'/tmp/workshop-v2-default.png',fullPage:true});
 assert.equal((await state()).sources.length,2);assert.ok(Math.abs((await result()).magnitude-43.1402486)<1e-6);
 // Physical charge is unchanged by unit selection; moving P changes E by inverse square.
 await page.locator('#example').selectOption('single');assert.equal(await page.locator('#q1').inputValue(),'10');
 const qBefore=(await state()).sources[0].q;await page.locator('#unit1').selectOption('nC');assert.equal(await page.locator('#q1').inputValue(),'0.01');assert.equal((await state()).sources[0].q,qBefore);
 await fill('q1','0,02');assert.ok(Math.abs((await state()).sources[0].q-2e-11)<1e-24);
 const original=(await result()).magnitude;await fill('px',6);await fill('py',8);assert.ok(Math.abs((await result()).magnitude/original-.25)<1e-10);
 const sourcesBefore=(await state()).sources;await page.locator('#autoScale').uncheck();await fill('scale','1000');assert.deepEqual((await state()).sources,sourcesBefore);await page.locator('#autoScale').check();
 // Empty board, source placement by real canvas actions, stable IDs, four-source cap.
 await page.locator('#example').selectOption('empty');assert.equal((await result()).angle,null);
 const canvasClick=async(x,y)=>{const b=await page.locator('#diagram').boundingBox();await page.mouse.click(b.x+x/800*b.width,b.y+y/650*b.height);};
 await page.locator('[data-tool="positive"]').click();await page.locator('#diagram').scrollIntoViewIfNeeded();await canvasClick(200,450);assert.equal((await state()).sources.length,1);assert.ok((await state()).sources[0].q>0);
 await page.locator('[data-tool="negative"]').click();await canvasClick(600,450);assert.ok((await state()).sources[1].q<0);
 await page.locator('#addSource').click();await page.locator('#addSource').click();assert.equal((await state()).sources.length,4);assert.equal(await page.locator('#addSource').isEnabled(),false);
 await page.locator('#diagram').scrollIntoViewIfNeeded();await canvasClick(600,200);assert.equal((await state()).sources.length,4);assert.match(await page.locator('#notice').innerText(),/Vier/);
 await page.locator('[data-remove="2"]').click();assert.equal((await state()).sources.length,3);await page.locator('#addSource').click();assert.deepEqual((await state()).sources.map(q=>q.id),[1,2,3,4]);
 // General superposition drawing, blank / zero-charge edge cases and coincidence recovery.
 await page.locator('#example').selectOption('four');assert.equal(await page.locator('#sources .source-card').count(),4);assert.match(await page.locator('#methodHint').innerText(),/Pfeilkette/);await page.locator('#method').selectOption('chain');
 for(const id of [1,2,3,4])await page.locator('#s'+id).selectOption('1');assert.match(await page.locator('#result').innerText(),/keine Richtung/);
 await page.screenshot({path:'/tmp/workshop-v2-null.png',fullPage:true});
 await fill('px',0);await fill('py',0);assert.match(await page.locator('#error').innerText(),/nicht definiert/);assert.equal(await page.locator('#pngExport').isEnabled(),false);
 await page.locator('[data-tool="point"]').click();await page.locator('#diagram').scrollIntoViewIfNeeded();await canvasClick(450,250);assert.equal(await page.locator('#error').innerText(),'');assert.ok((await result()).magnitude>0);
 await page.locator('[data-tool="move"]').click();
 // One drag is one undo entry; keyboard interaction keeps charge amounts fixed.
 const beforeDrag=await state(),box=await page.locator('[data-point="P"] .point-symbol').boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+25,box.y+box.height/2-20,{steps:5});await page.mouse.up();assert.notDeepEqual((await state()).point,beforeDrag.point);assert.deepEqual((await state()).sources,beforeDrag.sources);
 await page.locator('#undo').click();assert.deepEqual((await state()).point,beforeDrag.point);
 await page.locator('[data-point="P"]').focus();await page.keyboard.press('ArrowRight');assert.ok(Math.abs((await state()).point.x-beforeDrag.point.x-.1)<1e-10);await page.locator('#undo').click();
 // Invalid edit does not enter model; fix restores controls. Hidden results stay hidden.
 await fill('q1','NaN');assert.match(await page.locator('#error').innerText(),/gültige/);assert.equal(await page.locator('#save').isEnabled(),false);await fill('q1',10);assert.equal(await page.locator('#error').innerText(),'');
 await page.locator('#sum').uncheck();assert.doesNotMatch(await page.locator('#result').innerText(),/V\/m/);assert.equal(await page.locator('[data-vector="res"]').count(),0);await page.locator('#sum').check();
 // Both textbook starts now use inferred fixed Q; drawing ratio equals physical ratio.
 await page.locator('#example').selectOption('bookPositive');assert.match(await page.locator('#result').innerText(),/9,73/);
 const ratio=await page.evaluate(()=>{const lines=[1,2].map(id=>document.querySelector(`[data-vector="${id}"][data-helper="false"]`));return lines.map(n=>Math.hypot(+n.getAttribute('x2')-n.getAttribute('x1'),+n.getAttribute('y2')-n.getAttribute('y1')));});assert.ok(Math.abs(ratio[1]/ratio[0]-2)<1e-10);
 // New JSON round-trip and actual PNG decode.
 for(const [id,ext] of [['pngExport','png'],['save','json']]){const wait=page.waitForEvent('download');await page.locator('#'+id).click();const download=await wait;assert.equal(await download.failure(),null);await download.saveAs('/tmp/workshop-v2.'+ext);}
 const png=readFileSync('/tmp/workshop-v2.png');assert.equal(png.readUInt32BE(16),1600);assert.equal(png.readUInt32BE(20),1300);
 const saved=JSON.parse(readFileSync('/tmp/workshop-v2.json','utf8'));assert.equal(saved.version,2);const savedState=await state();
 await page.locator('#example').selectOption('empty');await page.locator('#file').setInputFiles('/tmp/workshop-v2.json');await page.waitForFunction(()=>__fieldVectorWorkshop.getState().sources.length===2);assert.deepEqual(await state(),savedState);
 await page.locator('#file').setInputFiles({name:'old.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Alte Aufgabe'));assert.ok(Math.abs((await result()).magnitude-expectedMagnitude)<1e-12);
 const beforeBad=await state();await page.locator('#file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":2,"settings":{}}')});await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('vier'));assert.deepEqual(await state(),beforeBad);
 for(const size of [{width:1440,height:900},{width:1024,height:768},{width:820,height:1180}]){
  await page.setViewportSize(size);await page.locator('#example').selectOption('four');await page.locator('#method').selectOption('chain');await fill('px',4);await fill('py',3);
  await page.screenshot({path:`/tmp/workshop-v2-${size.width}.png`,fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const sizes=await page.locator('.toolbar button,.tools button,#addSource').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().height));assert.ok(sizes.every(h=>h>=48));
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.ok(requests.every(url=>url.startsWith(base)||url.startsWith('blob:')));
 console.log('Workshop v2 OK: SI Coulomb, inverse square, sign/charge scaling, four-source cancellation, geometric scales, placement/drag/keyboard/undo, PNG and JSON v1/v2, validation, three viewports, local assets.');
}finally{await browser.close();}
