import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
const {chromium}=createRequire(import.meta.url)('playwright');
const base=process.env.VECTOR_URL||'http://127.0.0.1:8876';
const html=readFileSync(new URL('../vektor-labor/index.html',import.meta.url),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],external=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url());});page.on('requestfailed',r=>failed.push(r.url()));
 await page.goto(base+'/');await page.locator('a[href="vektor-labor/index.html"]').click();
 await page.getByRole('button',{name:'Überspringen'}).click();
 await page.locator('[data-context="electric"]').click();
 assert.match(await page.locator('#modelNote').innerText(),/1 N\/C = 1 V\/m/);
 assert.match(await page.locator('#axesLayer').textContent(),/^P$/);
 const expected=[[8,0],[4,0],[3,4],[-3,4],[-4,-3]];
 for(let i=0;i<expected.length;i++){
  const t=await page.evaluate(()=>__vectorLabTest.currentTask());
  assert.deepEqual([t.target.vec.x,t.target.vec.y],expected[i]);
  const g=t.given.map(a=>a.vec),sum={x:g[0].x+(g[1]?.x||0),y:g[0].y+(g[1]?.y||0)};
  if(i<3)assert.deepEqual(t.target.vec,sum);
  if(i===3)assert.deepEqual({x:g[0].x+t.target.vec.x,y:g[0].y+t.target.vec.y},g[1]);
  if(i===4)assert.deepEqual({x:g[0].x+t.target.vec.x,y:g[0].y+t.target.vec.y},{x:0,y:0});
  assert.equal(await page.locator('#relation .vector').count(),i===4?2:3);
  await page.locator('#helperAddBtn').click();assert.equal(await page.locator('[data-helper-id]').count(),1);
  await page.locator('#helperDeleteBtn').click();assert.equal(await page.locator('[data-helper-id]').count(),0);
  await page.locator('#snapToggle').uncheck();
  const origin=await page.locator('#axesLayer circle').evaluate(el=>({x:Number(el.getAttribute('cx')),y:Number(el.getAttribute('cy'))}));
  const scale=await page.evaluate(()=>__vectorLabTest.getState().scale),r=await page.locator('#stage').boundingBox();
  await page.mouse.move(r.x+origin.x,r.y+origin.y);await page.mouse.down();await page.mouse.move(r.x+origin.x+t.target.vec.x/scale*50,r.y+origin.y-t.target.vec.y/scale*50,{steps:8});await page.mouse.up();
  await page.locator('#checkBtn').click();assert.match(await page.locator('#feedback').innerText(),/Sauber konstruiert/);
  assert.match(await page.locator('#userMagnitude').innerText(),/N\/C/);
  const result=await page.evaluate(()=>{const l=__vectorLabTest,t=l.currentTask();return l.setUserArrow(t.target.start,{x:-t.target.vec.x,y:-t.target.vec.y});});
  assert.equal(result.direction,false);
  await page.locator('#solutionBtn').click();for(let j=0;j<3;j++)await page.locator('#solutionNext').click();
  assert.match(await page.locator('#solutionText').innerText(),/N\/C/);
  await page.locator('#solutionNext').click();await page.locator('#nextBtn').click();
  assert.equal(await page.locator('#userLayer [data-vector]').count(),0);
 }
 // Existing contexts retain all tasks, symbols and units after repeated topic switches.
 for(const [context,unit,count] of [['velocity','m/s',8],['force','N',8],['acceleration','m/s²',6]]){
  await page.locator(`[data-context="${context}"]`).click();
  assert.equal(await page.evaluate(c=>__vectorLabTest.TASKS[c].length,context),count);
  assert.ok((await page.locator('#scaleCompact').innerText()).endsWith(unit));
  const valid=await page.evaluate(()=>{const l=__vectorLabTest,t=l.currentTask();return l.setUserArrow(t.target.start,t.target.vec);});assert.ok(valid.start&&valid.end&&valid.direction&&valid.magnitude);
 }
 await page.locator('[data-context="electric"]').click();
 for(const size of [{width:1440,height:900},{width:1024,height:768},{width:820,height:1180}]){
  await page.setViewportSize(size);
  await page.locator('[data-context="electric"]').click();
  await page.screenshot({path:`${tmpdir()}/vector-electric-${size.width}-plates.png`,fullPage:true});
  await page.locator('#nextBtn').click();await page.locator('#nextBtn').click();
  await page.locator('#magnitudeToggle').check();
  await page.screenshot({path:`${tmpdir()}/vector-electric-${size.width}.png`,fullPage:true});
  const buttons=await page.locator('[data-context]').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
  assert.ok(buttons.every(b=>b.w>=48&&b.h>=48));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#solutionBtn').click();for(let i=0;i<3;i++)await page.locator('#solutionNext').click();
  await page.screenshot({path:`${tmpdir()}/vector-electric-${size.width}-solution.png`,fullPage:true});
  await page.locator('#solutionNext').click();
 }
 await page.locator('.home').click();assert.equal(new URL(page.url()).pathname,'/index.html');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(failed,[]);
 console.log('Vector electric OK: 5 analytical tasks, pointer constructions, wrong directions, helpers, solutions, topic reset, existing contexts, 3 viewports, local assets and catalog navigation.');
}finally{await browser.close();}
