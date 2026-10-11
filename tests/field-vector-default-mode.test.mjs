import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {defaultState,solve,changeMode,importState} from '../feldvektor-werkstatt/model.mjs';
const s=defaultState();assert.equal(s.mode,'given');assert.ok(Math.abs(solve(s).res.x+2.4)<1e-12);assert.ok(Math.abs(solve(s).res.y)<1e-12);
const moved=structuredClone(s);moved.point.y=8;assert.ok(solve(moved).fields.every(f=>Math.abs(f.mag-2)<1e-12));
const charges=changeMode(s,'charges');assert.ok(Math.abs(solve(charges).magnitude-2.4)<1e-12);charges.point.y=8;assert.ok(solve(charges).fields.every(f=>f.mag<2));
const old=structuredClone(charges);delete old.mode;assert.ok(Math.abs(solve(importState({version:2,settings:old})).magnitude-solve(charges).magnitude)<1e-12);
const {chromium,webkit}=createRequire(import.meta.url)('playwright'),base=process.env.WORKSHOP_URL||'http://127.0.0.1:8877';
for(const [name,type] of Object.entries({chromium,webkit})){
 const b=await type.launch();try{const p=await b.newPage({hasTouch:true}),errors=[],failed=[];p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>failed.push(r.url()));
 for(const size of [{width:1440,height:900},{width:1024,height:768},{width:820,height:1180},{width:600,height:900},{width:720,height:450}]){
 await p.setViewportSize(size);await p.goto(base+'/feldvektor-werkstatt/');await p.waitForFunction(()=>window.__fieldVectorWorkshop);
 assert.equal(await p.locator('#mode').inputValue(),'given');assert.equal(await p.locator('#q1').count(),0);assert.equal(await p.locator('#e1').inputValue(),'2');assert.equal(await p.locator('#e2').inputValue(),'2');assert.doesNotMatch(await p.locator('#diagram').textContent(),/pC|Feste Quellladungen/);
 await p.locator('#e1').fill('4');await p.locator('#e2').fill('8');let r=await p.evaluate(()=>__fieldVectorWorkshop.getResult());assert.ok(Math.abs(r.res.x+7.2)<1e-10);assert.ok(Math.abs(r.res.y-3.2)<1e-10);
 await p.locator('[data-tool="point"]').click();const box=await p.locator('#diagram').boundingBox();await p.locator('#diagram').click({position:{x:box.width*.5,y:box.height*.4}});assert.deepEqual(await p.locator('#e1').inputValue(),'4');assert.equal(await p.locator('#e2').inputValue(),'8');
 const before=await p.evaluate(()=>__fieldVectorWorkshop.getResult().magnitude);await p.locator('#mode').selectOption('charges');assert.equal(await p.locator('#e1').count(),0);assert.ok(await p.locator('#q1').isVisible());assert.ok(Math.abs((await p.evaluate(()=>__fieldVectorWorkshop.getResult().magnitude))-before)<1e-9);
 await p.screenshot({path:`/tmp/workshop-default-${name}-${size.width}-charges.png`,fullPage:true});await p.locator('#mode').selectOption('given');assert.ok(Math.abs(Number(await p.locator('#e1').inputValue())-4)<1e-10);
 await p.locator('#addSource').click();assert.equal(await p.locator('#e3').inputValue(),'2');await p.locator('#example').selectOption('four');assert.equal(await p.locator('#mode').inputValue(),'given');assert.equal(await p.locator('#e4').inputValue(),'2');
 const ids=await p.locator('[id]').evaluateAll(es=>es.map(e=>e.id));assert.equal(ids.length,new Set(ids).size);
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(await p.locator('select,input:not([type="checkbox"]):not([type="file"]),button').evaluateAll(es=>es.filter(e=>e.getClientRects().length).filter(e=>e.getBoundingClientRect().height<48).map(e=>e.id)),[]);
 await p.screenshot({path:`/tmp/workshop-default-${name}-${size.width}-given.png`,fullPage:true});
 }
 // Save/load honors the model instead of forcing the startup default.
 await p.locator('#mode').selectOption('charges');const saved=await p.evaluate(()=>({version:2,settings:__fieldVectorWorkshop.getState()}));await p.locator('#mode').selectOption('given');await p.locator('#file').setInputFiles({name:'charges.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(saved))});assert.equal(await p.locator('#mode').inputValue(),'charges');
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);console.log(name+': given startup, input E1/E2, P placement, conversion, source creation, presets, save/load, 5 viewports and touch layout OK.');
 }finally{await b.close();}
}
