import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile} from 'node:fs/promises';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const base=process.env.DIAGRAM_URL||'http://127.0.0.1:8881';
const output=process.env.DIAGRAM_QA||'/tmp/diagrammwerkstatt-versions-qa';
await mkdir(output,{recursive:true});
for(const [engineName,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{
  for(const [width,height] of [[1440,900],[1024,768],[820,1180],[600,900],[390,844],[720,450]]){
   if(process.env.DIAGRAM_WIDTH&&width!==Number(process.env.DIAGRAM_WIDTH))continue;
   const context=await browser.newContext({viewport:{width,height},hasTouch:true,acceptDownloads:true});
   const page=await context.newPage();const errors=[],external=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});
   for(const [path,protocol] of [['zabma-protokoll',true],['diagrammwerkstatt',false]]){
    await page.goto(`${base}/${path}/`);await page.locator('#tour-welcome-skip').click();
    assert.equal(await page.locator('.protocol-panel').isVisible(),protocol);
    assert.equal(await page.locator('#point-count').textContent(),'0 Punkte');
    if(protocol){
     await page.locator('#protocol-title-input').fill('Freier Fall');
     await page.locator('#protocol-name').fill('Max Mustermann');
     await page.locator('#protocol-target').fill('Wir untersuchen den Zusammenhang zwischen Fallzeit und Fallstrecke.');
     await page.locator('#protocol-setup').fill('Eine Kugel fällt vor einer Maßskala. Eine Kamera zeichnet die Bewegung auf.');
     await page.locator('#protocol-description').fill('Wir lesen zu sechs Zeitpunkten die Fallstrecke ab und tragen die Werte ein.');
     await page.locator('#protocol-analysis').fill('Die Fallstrecke ist proportional zum Quadrat der Fallzeit.');
    }
    await page.locator('#example').click();
    if(protocol){assert.match(await page.locator('#notice').textContent(),/noch einmal/);assert.equal(await page.locator('#protocol-name').inputValue(),'Max Mustermann');await page.locator('#example').click();}
    await page.waitForTimeout(400);
    // Example replaces the project. Populate protocol after choosing example.
    if(protocol){await page.locator('#protocol-title-input').fill('Freier Fall');await page.locator('#protocol-name').fill('Max Mustermann');await page.locator('#protocol-target').fill('Wir untersuchen die Abhängigkeit der Fallstrecke von der Fallzeit.');await page.locator('#protocol-setup').fill('Kugel, Maßskala und Videokamera.');await page.locator('#protocol-description').fill('Zu sechs Zeitpunkten wird die Fallstrecke aus dem Video abgelesen.');await page.locator('#protocol-analysis').fill('Die Fallstrecke wächst proportional zum Quadrat der Fallzeit.');}
    await page.locator('#fit-toggle').click();await page.locator('#slope-toggle').click();
    await page.locator('#linearize-open').click();await page.locator('#transform-x').selectOption('square');
    await page.locator('#uncertainty-open').click();await page.locator('#uncertainty-on').check();await page.locator('#common-uy').fill('0,1');await page.waitForTimeout(400);
    await page.reload();assert.equal(await page.locator('#transform-x').inputValue(),'square');
    if(protocol)assert.equal(await page.locator('#protocol-name').inputValue(),'Max Mustermann');
    const audit=await page.evaluate(()=>{
     const visible=e=>!!e.getClientRects().length&&!e.closest('details:not([open])');
     const small=[...document.querySelectorAll('button,input:not([type="checkbox"]),select,textarea,summary,a.home,.version-nav a,.check')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.width<47.9||r.height<47.9;}).map(e=>e.id||e.textContent);
     const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
     return {overflow:document.documentElement.scrollWidth>innerWidth,small,duplicate:ids.filter((id,i)=>ids.indexOf(id)!==i),cols:getComputedStyle(document.querySelector('main')).gridTemplateColumns.split(' ').length};
    });assert(!audit.overflow,JSON.stringify({engineName,width,path,audit}));assert.deepEqual(audit.small,[]);assert.deepEqual(audit.duplicate,[]);assert.equal(audit.cols,width>=820?2:1);
    await page.locator('#linearize-details').evaluate(e=>e.open=false);await page.locator('#uncertainty-details').evaluate(e=>e.open=false);await page.evaluate(()=>window.scrollTo(0,0));
    if([1440,1024,820,390].includes(width))await page.screenshot({path:`${output}/${engineName}-${path}-${width}.png`,fullPage:true});
    // Tour must reach every target in both variants without changing data.
    const before=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).map(([key,value])=>[key,value.startsWith('{')?JSON.parse(value):value])));
    await page.locator('#help-tour').click();await page.locator('#tour-start').click();
    const steps=protocol?11:10;
    for(let step=1;step<=steps;step++){
     assert.equal(await page.locator('#tour-card').getAttribute('data-step'),String(step));await page.waitForTimeout(80);
     assert(await page.locator('.tour-spotlight').isVisible(),`${engineName} ${width} ${path} step ${step}`);
     const overlap=await page.evaluate(()=>{const a=document.querySelector('.tour-spotlight').getBoundingClientRect(),b=document.querySelector('#tour-card').getBoundingClientRect();return a.bottom>b.top;});assert(!overlap);
     await page.locator('#tour-next').click();
    }
    assert(await page.locator('#tour-card').isHidden());assert.deepEqual(await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).map(([key,value])=>[key,value.startsWith('{')?JSON.parse(value):value]))),before);
    // Stub only the OS print dialog; render the actual print DOM and CSS.
    await page.evaluate(()=>{window.print=()=>{window.__printed=true;};});
    await page.locator('#file-open').click();await page.locator('#pdf').click();
    assert.equal(await page.evaluate(()=>window.__printed),true,await page.locator('#notice').textContent());
    assert.equal(await page.locator('.protocol-page').count(),protocol?2:1);
    assert.equal(await page.locator('.print-data-table th').nth(1).textContent(),'t / s');
    await page.emulateMedia({media:'print'});
    assert(await page.locator('.protocol-page').first().isVisible(),'Druckinhalt muss sichtbar sein');
    if(width===1024){
     await page.screenshot({path:`${output}/${engineName}-${path}-print.png`,fullPage:true});
     if(engineName==='chromium')await page.pdf({path:`${output}/${path}.pdf`,preferCSSPageSize:true,printBackground:true});
    }
    const clipping=await page.locator('.protocol-page').evaluateAll(es=>es.some(e=>e.scrollHeight>e.clientHeight+2));assert(!clipping);
    await page.emulateMedia({media:'screen'});await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
    // A long paragraph must trigger an actionable warning, never silent truncation.
    if(protocol&&width===1024){await page.locator('#protocol-target').fill('Ein sehr langer Text zur Untersuchung. '.repeat(45));await page.evaluate(()=>window.__printed=false);await page.locator('#pdf').click();assert.equal(await page.evaluate(()=>window.__printed),false);assert.match(await page.locator('#notice').textContent(),/passen nicht vollständig/);}
    await page.locator('.home').click();await page.locator(`#topic-methoden a[href="${path}/"]`).click();assert.equal(await page.locator('.protocol-panel').isVisible(),protocol);
   }
   // Each variant retains its own project on the same origin.
   await page.goto(`${base}/zabma-protokoll/`);assert.equal(await page.locator('#protocol-name').inputValue(),'Max Mustermann');
   await page.goto(`${base}/diagrammwerkstatt/`);assert.equal(await page.locator('#protocol-name').inputValue(),'');
   if(width===1024){
    await page.goto(`${base}/zabma-protokoll/`);await page.locator('#file-open').click();
    const downloading=page.waitForEvent('download');await page.locator('#save').click();
    const file=await (await downloading).path(),project=JSON.parse(await readFile(file,'utf8'));
    assert.equal(project.protocol.name,'Max Mustermann');
    await page.goto(`${base}/diagrammwerkstatt/`);await page.locator('#file-open').click();
    const chooser=page.waitForEvent('filechooser');await page.locator('#load').click();await (await chooser).setFiles(file);
    await page.waitForTimeout(400);assert.equal(await page.locator('#protocol-name').inputValue(),'Max Mustermann');assert(await page.locator('.protocol-panel').isHidden());
    const saving=page.waitForEvent('download');await page.locator('#save').click();
    const roundTrip=JSON.parse(await readFile(await (await saving).path(),'utf8'));
    assert.deepEqual(roundTrip.protocol,project.protocol);assert.deepEqual(roundTrip.rows,project.rows);
   }
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);await context.close();console.log(`${engineName} ${width}×${height}: beide Varianten, Tour, getrennte Speicherung, Navigation und Drucklayout bestanden`);
  }
 }finally{await browser.close();}
}
