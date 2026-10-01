import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const {chromium}=createRequire(import.meta.url)('playwright');
const base=process.env.WORKSHOP_URL||'http://127.0.0.1:8875';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.goto(base+'/feldvektor-werkstatt/');
 assert.match(await page.locator('#result').innerText(),/2,4 V\/m/);
 await page.screenshot({path:'/tmp/workshop-dipole.png',fullPage:true});
 await page.locator('#example').selectOption('positive');
 assert.match(await page.locator('#result').innerText(),/9,73 V\/m/);
 const actual=await page.evaluate(()=>{const w=__fieldVectorWorkshop;return w.solve(w.getState());});
 // Independent reference: angle between (5,6) and (-3,4) has cosine 9/(5 sqrt(61)).
 const expectedMagnitude=Math.sqrt(4**2+8**2+2*4*8*9/(5*Math.sqrt(61)));
 assert.ok(Math.abs(Math.hypot(actual.res.x,actual.res.y)-expectedMagnitude)<1e-10);
 assert.ok(actual.fields[0].x>0&&actual.fields[1].x<0);
 const fieldsBefore=actual.fields;await page.locator('#scale').fill('2,5');
 assert.deepEqual(await page.evaluate(()=>__fieldVectorWorkshop.solve(__fieldVectorWorkshop.getState()).fields),fieldsBefore);
 await page.locator('#example').selectOption('dipole');
 for(const [id,value] of [['s1','1'],['px','3'],['py','0']]){if(id==='s1')await page.locator('#'+id).selectOption(value);else await page.locator('#'+id).fill(value);}
 assert.match(await page.locator('#result').innerText(),/keine Richtung/);
 await page.screenshot({path:'/tmp/workshop-nullfield.png',fullPage:true});
 await page.locator('#px').fill('0');assert.match(await page.locator('#error').innerText(),/nicht auf einer Quellladung/);
 await page.locator('#example').selectOption('positive');assert.equal(await page.locator('#error').innerText(),'');
 await page.locator('#sum').uncheck();assert.doesNotMatch(await page.locator('#result').innerText(),/9,73/);
 await page.locator('#undo').click();assert.equal(await page.locator('#sum').isChecked(),true);
 // Real download/export and reload of saved settings.
 for(const [id,extension] of [['svgExport','svg'],['pngExport','png'],['save','json']]){
  const promise=page.waitForEvent('download');await page.locator('#'+id).click();const download=await promise;
  assert.equal(await download.failure(),null);assert.equal(download.suggestedFilename(),'feldvektoren.'+extension);
  await download.saveAs('/tmp/workshop-export.'+extension);
 }
 const exported=readFileSync('/tmp/workshop-export.svg','utf8');assert.match(exported,/Pfeilmaßstab/);assert.match(exported,/xmlns=/);
 const png=readFileSync('/tmp/workshop-export.png');assert.equal(png.readUInt32BE(16),1600);assert.equal(png.readUInt32BE(20),1300);
 await page.locator('#px').fill('9');await page.locator('#file').setInputFiles('/tmp/workshop-export.json');await page.waitForFunction(()=>document.querySelector('#px').value==='5');assert.equal(await page.locator('#px').inputValue(),'5');
 // Mouse movement changes a source, undo restores it.
 const circle=page.locator('[data-point="Q1"] circle'),box=await circle.boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+30,box.y+box.height/2-20,{steps:4});await page.mouse.up();assert.notEqual(await page.locator('#x1').inputValue(),'0');await page.locator('#undo').click();assert.equal(await page.locator('#x1').inputValue(),'0');
 for(const size of [{width:1440,height:900},{width:1024,height:768},{width:820,height:1180}]){
  await page.setViewportSize(size);await page.screenshot({path:`/tmp/workshop-${size.width}.png`,fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 assert.deepEqual(errors,[]);assert.ok(requests.every(url=>url.startsWith(base)||url.startsWith('blob:')));
 console.log('Workshop OK: independent magnitude, cancellation, undefined source point, scale independence, undo, dragging, SVG/PNG/JSON round-trip, three viewports, local assets.');
}finally{await browser.close();}
