import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium,webkit}=require(process.env.PLAYWRIGHT_PATH||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root=process.cwd(),out='/tmp/lagrange-qa-20261123';await mkdir(out,{recursive:true});
const server=http.createServer(async(req,res)=>{try{const p=decodeURIComponent(new URL(req.url,'http://local').pathname);let f=path.join(root,p);if(p.endsWith('/'))f+='index.html';const b=await readFile(f);res.setHeader('Content-Type',f.endsWith('.css')?'text/css':/\.(js|mjs)$/.test(f)?'text/javascript':'text/html');res.end(b);}catch{res.statusCode=404;res.end('Not found');}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=process.env.LAGRANGE_URL?.replace(/\/$/,'') || `http://127.0.0.1:${server.address().port}`;
try{for(const [name,engine]of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{for(const [width,height]of [[1440,1000],[1024,768],[820,1180],[600,900],[720,450],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true});const p=await context.newPage();const errors=[],external=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));p.on('response',r=>{if(r.status()>=400)errors.push(String(r.status())+' '+r.url());});
  p.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
  await p.goto(base+'/');
  const cardCount = await p.locator('a.card').count();
  assert.match(await p.locator('.hero-meta').textContent(), new RegExp(cardCount + ' Apps'));
  await p.locator('a[href="lagrange-labor/"]').click();await p.waitForSelector('[data-point="L2"][aria-pressed="true"]');
  assert.match(await p.locator('#probe-value').textContent(),/2,00 Mio/);
  for(const id of ['L1','L2','L3','L4','L5']){
   await p.locator(`[data-point="${id}"]`).click();assert.equal(await p.locator('#point-tag').textContent(),id);
   if(['L1','L2'].includes(id)){
    assert.ok(await p.locator('#force-panel').isVisible());
    const probe = p.locator('#probe-distance');
    assert.match(await p.locator('#force-status').textContent(), id === 'L1' ? /Zu viel/ : /Zu wenig/);
    await probe.fill('90');
    assert.match(await p.locator('#force-status').textContent(), id === 'L1' ? /Zu wenig/ : /Zu viel/);
    await probe.fill('240');
    assert.match(await p.locator('#force-status').textContent(), id === 'L1' ? /Zu viel/ : /Zu wenig/);
    await probe.fill(id === 'L1' ? '149' : '150');
    assert.match(await p.locator('#force-status').textContent(), /sehr nahe/);
    await p.locator('#exact-point').click();
    assert.match(await p.locator('#force-status').textContent(), new RegExp('Hier liegt ' + id));
    assert.equal(await p.locator('#exact-point').getAttribute('aria-pressed'), 'true');
    await p.locator('#sun-only').click();
    assert.match(await p.locator('#force-status').textContent(), id === 'L1' ? /Zu viel/ : /Zu wenig/);
    await p.locator('#both').click();
    const earthText = await p.locator('#force-rows text').nth(3).textContent();
    assert.match(earthText, id === 'L1' ? /^→\s+−0,/ : /^←\s+\+0,/);
    await p.waitForFunction(() => {
      const label = document.querySelector('#forces text');
      return parseFloat(getComputedStyle(label).fontSize) * label.ownerSVGElement.getBoundingClientRect().width / 390 >= 13.99;
    });
    // Every arrow length is proportional, including the small Earth contribution.
    const dx=await p.locator('#force-rows line').evaluateAll(es=>es.map(e=>Number(e.getAttribute('x2'))-Number(e.getAttribute('x1'))));
    assert.ok(Math.abs(dx[0]+dx[1]-dx[2])<1e-8);assert.ok(Math.abs(dx[2]-dx[3])<1e-8);
   }else{assert.ok(await p.locator('#advanced').isVisible());assert.ok(!await p.locator('#force-panel').isVisible());}
  }
  await p.locator('[data-point="L2"]').click();
  await p.locator('#probe-l1').click();
  assert.equal(await p.locator('#point-tag').textContent(), 'L1');
  assert.match(await p.locator('#axis').textContent(), /SonneProbeErde/);
  await p.locator('#probe-l2').click();
  assert.equal(await p.locator('#point-tag').textContent(), 'L2');
  await p.locator('summary').filter({hasText:'Wie entstehen die Zahlen?'}).click();
  assert.match(await p.locator('#distances').textContent(), /Zum Schwerpunkt/);
  await p.locator('summary').filter({hasText:'Wie entstehen die Zahlen?'}).click();
  await p.locator('#reset').click();await p.locator('#play').click();await p.waitForTimeout(180);await p.locator('#play').click();
  const paused=await p.locator('#phase').inputValue();assert.ok(Number(paused)>0);await p.waitForTimeout(80);assert.equal(await p.locator('#phase').inputValue(),paused);
  await p.locator('#speed').fill('2');await p.locator('#phase').fill('135');assert.equal(await p.locator('#phase-value').textContent(),'135°');
  await p.locator('#rotating').click();const fixed=await p.locator('[data-point="L2"]').getAttribute('style');await p.locator('#phase').fill('260');assert.equal(await p.locator('[data-point="L2"]').getAttribute('style'),fixed);
  await p.locator('#inertial').click();assert.notEqual(await p.locator('[data-point="L2"]').getAttribute('style'),fixed);
  // Buttons remain inside scene and do not overlap each other at all cardinal positions.
  for(const phase of ['0','90','180','270']){
   await p.locator('#phase').fill(phase);
   const rects=await p.locator('.point-button').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};}));
   const labels=await p.locator('#bodies text').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};}));
   for(const l of labels)for(const b of rects){const cx=b.x+b.w/2,cy=b.y+b.h/2;const dx=cx-Math.max(l.x,Math.min(cx,l.x+l.w)),dy=cy-Math.max(l.y,Math.min(cy,l.y+l.h));assert.ok(Math.hypot(dx,dy)>24,`body label overlaps point ${name} ${width} ${phase}`);}
   for(let i=0;i<rects.length;i++){const a=rects[i];assert.ok(a.x>=0&&a.x+a.w<=width+1);for(let j=i+1;j<rects.length;j++){const b=rects[j];assert.ok(Math.abs(a.x-b.x)>=48||Math.abs(a.y-b.y)>=48,`point overlap ${name} ${width}`);}}
  }
  await p.locator('#reset').click();assert.equal(await p.locator('#phase').inputValue(),'0');assert.equal(await p.locator('#speed').inputValue(),'1');assert.equal(await p.locator('#inertial').getAttribute('aria-pressed'),'true');assert.equal(await p.locator('#point-tag').textContent(),'L2');
  await p.screenshot({path:`${out}/${name}-${width}-L2.png`,fullPage:true});
  if(width===1024){const r=await p.locator('#play').boundingBox();assert.ok(r.y+r.height<=768,'Start muss im iPad-Querformat erreichbar sein');}
  await p.locator('[data-point="L1"]').click();await p.locator('#exact-point').click();await p.locator('#sun-only').click();await p.screenshot({path:`${out}/${name}-${width}-L1.png`,fullPage:true});
  await p.locator('[data-point="L4"]').click();await p.locator('#rotating').click();await p.screenshot({path:`${out}/${name}-${width}-L4.png`,fullPage:true});
  await p.locator('summary').filter({hasText:'Erklärung aufdecken'}).click();await p.locator('summary').filter({hasText:'Modell, Stabilität'}).click();await p.locator('summary').filter({hasText:'Quellen und Nutzung'}).click();
  const result=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,ids:[...document.querySelectorAll('[id]')].map(e=>e.id),small:[...document.querySelectorAll('button,input,summary,a.back')].filter(e=>e.getClientRects().length&&e.closest('details')?.open!==false).filter(e=>{const r=e.getBoundingClientRect();return r.height<47.5||(e.tagName==='BUTTON'&&r.width<47.5);}).map(e=>e.id||e.textContent)}));
  assert.ok(!result.overflow,`${name} ${width} overflow`);assert.equal(new Set(result.ids).size,result.ids.length);assert.deepEqual(result.small,[]);
  // Keyboard focus and navigation, plus fully offline local runtime reload.
  await p.locator('#play').focus();assert.ok(await p.locator('#play').evaluate(e=>e===document.activeElement));await p.keyboard.press('Space');assert.equal(await p.locator('#play').textContent(),'Pause');await p.keyboard.press('Space');
  if (!process.env.LAGRANGE_URL) await p.route('https://**',r=>r.abort());await p.reload();await p.waitForSelector('[data-point="L2"]');
  await p.locator('a.back').click();assert.ok(await p.locator('#nutzung').count());
  if(width===1440)await p.screenshot({path:`${out}/${name}-frontpage.png`,fullPage:true});
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log(name,width,height,'OK');await context.close();
 }}finally{await browser.close();}
}}finally{server.close();}
