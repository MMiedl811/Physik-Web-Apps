import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {initialState} from '../diagrammwerkstatt/model.mjs';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const base=process.env.DIAGRAM_URL||'http://127.0.0.1:8881';
const output=process.env.DIAGRAM_QA||'/tmp/diagrammwerkstatt-qa';
await mkdir(output,{recursive:true});
const fixture=()=>{
  const s=initialState();s.title='Freier Fall · Beispieldaten';
  s.x={name:'Zeit',symbol:'t',unit:'s',transform:'identity'};s.y={name:'Weg',symbol:'s',unit:'m',transform:'identity'};
  s.rows=[[0,0],[1,.5],[2,2],[3,4.5],[4,8],[5,12.5]].map(([x,y])=>({x:String(x).replace('.',','),y:String(y).replace('.',','),ux:'0,1',uy:'0,2'}));
  return s;
};
const engines=process.env.DIAGRAM_BROWSER?{[process.env.DIAGRAM_BROWSER]:{chromium,webkit}[process.env.DIAGRAM_BROWSER]}:{chromium,webkit};
for(const [engineName,engine] of Object.entries(engines)) {
  const browser=await engine.launch();
  try {
    for(const [width,height] of [[1440,900],[1024,768],[820,1180],[600,900],[390,844]]) {
      if(process.env.DIAGRAM_WIDTH&&width!==Number(process.env.DIAGRAM_WIDTH))continue;
      const context=await browser.newContext({viewport:{width,height},hasTouch:true,acceptDownloads:true});
      const page=await context.newPage(),errors=[],failed=[],external=[];
      page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});
      const wait=()=>page.waitForTimeout(160);
      const shot=async label=>{if([1440,1024,820,390].includes(width))await page.screenshot({path:`${output}/${engineName}-${width}-${label}.png`,fullPage:true});};
      const audit=async label=>{
        const result=await page.evaluate(()=>{
          const shown=e=>!!e.getClientRects().length&&(!e.closest('details:not([open])')||e.parentElement?.tagName==='DETAILS'&&e.tagName==='SUMMARY'),rect=e=>e.getBoundingClientRect();
          const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
          const controls=[...document.querySelectorAll('button,select,input:not([type="checkbox"]),summary,.home,.check')].filter(shown);
          return {overflow:document.documentElement.scrollWidth>innerWidth,scrollWidths:[document.documentElement.scrollWidth,document.body.scrollWidth,innerWidth],overflowElements:[...document.querySelectorAll("body *")].filter(e=>shown(e)&&e.scrollWidth>e.clientWidth+2&&!e.closest(".table-wrap")).map(e=>({tag:e.tagName,id:e.id,cl:e.className,sw:e.scrollWidth,cw:e.clientWidth})).slice(0,30),overflowNodes:[...document.querySelectorAll("body *")].filter(e=>shown(e)&&rect(e).right>innerWidth&&!e.closest(".table-wrap")).map(e=>({tag:e.tagName,id:e.id,right:rect(e).right})).slice(0,15),duplicate:ids.filter((v,i)=>ids.indexOf(v)!==i),small:controls.filter(e=>rect(e).width<47.9||rect(e).height<47.9).map(e=>({id:e.id,text:e.textContent?.trim(),w:rect(e).width,h:rect(e).height})),badSvg:/NaN|Infinity/.test(document.getElementById('plot').innerHTML),columns:getComputedStyle(document.querySelector('main')).gridTemplateColumns.split(' ').length};
        });
        assert.equal(result.overflow,false,JSON.stringify({engineName,width,label,result}));assert.deepEqual(result.duplicate,[]);assert.deepEqual(result.small,[],JSON.stringify({engineName,width,label,result}));assert.equal(result.badSvg,false);return result;
      };
      const load=async s=>{
        const chooser=page.waitForEvent('filechooser');
        await page.locator('details').filter({has:page.locator('#load')}).evaluate(e=>e.open=true);
        await page.locator('#load').click();
        await (await chooser).setFiles({name:'projekt.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(s))});await wait();
      };
      await page.goto(`${base}/index.html`);assert.equal(await page.locator('a.card').count(),19);
      await page.locator('a.card[href="diagrammwerkstatt/"]').click();await wait();
      await page.locator('#tour-welcome-skip').click();
      assert.match(await page.locator('#point-count').textContent(),/^0 Punkte/);const aligned=await page.evaluate(()=>[...document.querySelectorAll('#table-head th')].every((th,i)=>Math.abs(th.getBoundingClientRect().top-document.querySelector('#table-body tr').children[i].getBoundingClientRect().top)<1));assert(aligned,'Tabellenbeschriftungen müssen mit den Werten fluchten');await audit('leer');await shot('leer');
      // Direkte Eingabe einschließlich Dezimalkomma und fehlerhafter Zwischenzustände.
      await page.getByRole('textbox',{name:'Messung 1, x',exact:true}).fill('1,5');
      await page.getByRole('textbox',{name:'Messung 1, y',exact:true}).fill('3');await wait();assert.match(await page.locator('#point-count').textContent(),/^1 Punkt$/);
      await page.getByRole('textbox',{name:'Messung 1, x',exact:true}).fill('falsch');await wait();assert.equal(await page.getByRole('textbox',{name:'Messung 1, x',exact:true}).getAttribute('aria-invalid'),'true');assert.equal(await page.locator('#issues').isVisible(),true);
      await page.locator('#undo').click();await wait();assert.equal(await page.getByRole('textbox',{name:'Messung 1, x',exact:true}).inputValue(),'1,5');
      await page.locator('#example').click();await page.locator('#example').click();await wait();assert.equal(await page.locator('#point-count').textContent(),'6 Punkte');await shot('beispiel');
      // Browser-ClipboardEvent prüft Mehrzeilen-Einfügen ohne Betriebssystem-Zwischenablage.
      await page.locator('[data-key="x"]').first().evaluate(e=>{const data=new DataTransfer();data.setData('text/plain','1,5\t3\n2,5\t5');e.dispatchEvent(new ClipboardEvent('paste',{clipboardData:data,bubbles:true,cancelable:true}));});await wait();
      assert.equal(await page.locator('[data-key="x"]').first().inputValue(),'1,5');assert.equal(await page.locator('[data-key="y"]').nth(1).inputValue(),'5');
      await load(fixture());
      await page.locator('[data-style="line"]').click();await audit('verbinden');
      await page.locator('[data-style="smooth"]').click();assert.equal(await page.locator('[data-style="smooth"]').getAttribute('aria-pressed'),'true');await audit('glatt');
      await page.locator('#slope-toggle').click();await page.locator('#fit-toggle').click();await wait();assert.match(await page.locator('#slope-result').textContent(),/m = 2,5/);await audit('werkzeuge');await shot('werkzeuge');
      // Plot-Tippen und alternative Punktwahl.
      await page.locator('#point-a').selectOption('1');await page.locator('#point-b').selectOption('3');await wait();assert.match(await page.locator('#slope-result').textContent(),/m = 2 /);
      const circle=page.locator('#plot circle').first();await circle.tap({force:true});await wait();
      await page.locator('#linearize-details summary').click();await page.locator('#transform-x').selectOption('square');await page.locator('#origin').check();await wait();assert.match(await page.locator('#fit-result').textContent(),/Steigung m = 0,5/);
      assert.equal(await page.locator('#table-body tr').first().locator('input[data-key="x"]').inputValue(),'0');assert.equal(await page.locator('output[data-derived="x"]').count(),6);
      await page.locator('#uncertainty-details summary').click();await page.locator('#uncertainty-on').check();await page.locator('#common-ux').fill('0,1');await page.locator('#common-uy').fill('0,2');await wait();await audit('linearisierung');await shot('linearisierung');
      await page.locator('#uncertainty-mode').selectOption('individual');await wait();assert.equal(await page.locator('[data-key="ux"]').count(),6);await audit('individuell');await shot('individuell');
      // Tauschen muss auch Unsicherheiten, Symbole und Transformationen mitnehmen.
      await page.locator('#swap').click();await wait();assert.equal(await page.locator('#x-symbol').inputValue(),'s');assert.equal(await page.locator('#transform-y').inputValue(),'square');assert.equal(await page.locator('[data-key="uy"]').first().inputValue(),'0,1');await audit('tausch');
      await page.locator('#original').click();await wait();assert.equal(await page.locator('output[data-derived]').count(),0);
      await page.locator('#axes-details summary').click();await page.locator('#manual-view').check();await page.locator('#xmin').fill('4');await page.locator('#xmax').fill('2');await wait();assert.match(await page.locator('#issues').textContent(),/Achsengrenzen/);
      await page.locator('#xmin').fill('0');await page.locator('#xmax').fill('2');await page.locator('#reverse-x').check();await page.locator('#reverse-y').check();await wait();assert.match(await page.locator('#issues').textContent(),/außerhalb/);await audit('achsen');await shot('achsen');
      await page.locator('#auto-view').click();await wait();assert.equal(await page.locator('#manual-view').isChecked(),false);
      // Kehrwert bei null und nicht umformbare Fehlerintervalle bleiben verständlich.
      await page.locator('#transform-y').selectOption('inverse');await wait();assert.match(await page.locator('#issues').textContent(),/nicht definiert/);await audit('kehrwert');await shot('kehrwert');
      const duplicate=fixture();duplicate.rows[1].x='0';await load(duplicate);await page.locator('[data-style="smooth"]').click();await wait();assert.match(await page.locator('#issues').textContent(),/denselben x-Wert/);await audit('doppelte-x');
      // Laden ungültiger Dateien darf den aktuellen Stand nicht ersetzen.
      await load({version:42});assert.match(await page.locator('#notice').textContent(),/Laden fehlgeschlagen/);assert.equal(await page.locator('#point-count').textContent(),'6 Punkte');
      // Export und JSON-Rundlauf mit tatsächlich erzeugten Dateien.
      const final=fixture();final.x.transform='square';final.fit=true;final.origin=true;final.slope=true;final.selected=[1,5];final.uncertainty.enabled=true;final.uncertainty.x='0,1';final.uncertainty.y='0,2';await load(final);
      if(width===1024) {
        const saving=page.waitForEvent('download');await page.locator('#save').click();const download=await saving;const path=await download.path();assert.deepEqual(JSON.parse(await readFile(path,'utf8')).rows,final.rows);
        const pngDownload=page.waitForEvent('download');await page.locator('#png').click();const png=await pngDownload;await png.saveAs(`${output}/${engineName}-export.png`);const bytes=await readFile(`${output}/${engineName}-export.png`);assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.ok(bytes.length>10000);
        await page.reload();await wait();assert.equal(await page.locator('#transform-x').inputValue(),'square');assert.match(await page.locator('#fit-result').textContent(),/Steigung m = 0,5/);
      }
      await page.locator('#linearize-details').evaluate(e=>e.open=true);await page.locator('#axes-details').evaluate(e=>e.open=true);await page.locator('#uncertainty-details').evaluate(e=>e.open=true);await page.locator('#manual-view').check();await wait();await audit('alle controls');await shot('final');
      await context.setOffline(true);await page.locator('#original').click();await wait();assert.equal(await page.locator('#transform-x').inputValue(),'identity');assert.equal(await page.locator('#point-count').textContent(),'6 Punkte');await context.setOffline(false);
      if(width===1440) {
        await page.locator('[data-key="x"]').first().focus();await page.keyboard.press('Enter');
        assert.equal(await page.evaluate(()=>document.activeElement.closest('tr').dataset.row),'1');
        const negative=fixture();negative.rows[0].x='-1';await load(negative);
        await page.locator('#linearize-details').evaluate(e=>e.open=true);
        await page.locator('#transform-x').selectOption('sqrt');await wait();assert.equal(await page.locator('#point-count').textContent(),'5 Punkte');assert.match(await page.locator('#issues').textContent(),/nicht definiert/);
        await page.locator('#transform-x').selectOption('inverseSquare');await wait();assert.equal(await page.locator('#point-count').textContent(),'6 Punkte');
        await page.locator('#transform-x').selectOption('inverse');await wait();assert.equal(await page.locator('#point-count').textContent(),'6 Punkte');
        const offset=fixture();offset.rows=offset.rows.map((r,i)=>({...r,x:String(1e12+i)}));await load(offset);
        await page.locator('#axes-details').evaluate(e=>e.open=true);await page.locator('#manual-view').check();await wait();assert.equal(await page.locator('#xmin').getAttribute('aria-invalid'),'false');
        const long=fixture();long.y.symbol='LangeMessgröße';long.y.unit='Kilogramm mal Meter pro Quadratsekunde';long.fit=true;long.slope=true;
        await load(long);await wait();await audit('lange Beschriftungen');assert.match(await page.locator('#issues').textContent(),/Vollständige Achsenbeschriftung/);await shot('lange-beschriftungen');
      }
      // 200 % Zoom als halbe CSS-Viewportbreite bei unveränderter Schriftgröße.
      if(width===1440){await page.setViewportSize({width:720,height:450});await wait();await audit('zoom-equivalent');await page.screenshot({path:`${output}/${engineName}-zoom.png`,fullPage:true});}
      await page.locator('.home').click();assert.ok(page.url().endsWith('/index.html'));
      assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);
      await context.close();console.log(`${engineName} ${width}×${height}: Eingabe, Werkzeuge, Umformung, Intervalle, Achsen, Dateien und Layout bestanden`);
    }
  }finally{await browser.close();}
}
await writeFile(`${output}/result.txt`,`Browser: ${process.env.DIAGRAM_BROWSER||'Chromium und WebKit'}. Breiten: ${process.env.DIAGRAM_WIDTH||'1440, 1024, 820, 600, 390'} CSS-px; bei 1440 zusätzlich 720×450 als Zoom-Layoutäquivalent. Alle Assertions bestanden. Screenshots separat visuell prüfen.\n`);
