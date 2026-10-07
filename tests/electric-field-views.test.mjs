import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const base=process.env.ELECTRIC_URL||'http://127.0.0.1:8875';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],failed=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));page.on('request',r=>requests.push(r.url()));
 await page.goto(base+'/elektrische-felder/');await page.getByRole('button',{name:'Untersuchung starten'}).click();
 const state=()=>page.evaluate(()=>__electricFieldLab.getState());
 assert.equal((await state()).showSingleLines,false);assert.equal((await state()).showLines,true);
 const bitmap=()=>page.locator('#fieldCanvas').evaluate(c=>c.toDataURL());
 const physical=()=>page.evaluate(()=>{const l=__electricFieldLab;return{fields:[[0,.7],[-1.2,.8],[1.3,-.6]].map(([x,y])=>l.fieldAt(x,y)),contributions:l.fieldContributionsAt(.3,.7),probe:l.getState().probe};});
 // All four visibility states change the actual canvas, but never the physical field.
 await page.locator('[data-preset="dipole"]').click();await page.screenshot({path:'/tmp/electric-views-default.png',fullPage:true});const before=await physical(),images=[];
 for(const [single,total]of [[false,true],[true,false],[true,true],[false,false]]){
  await page.locator('#singleLinesToggle').setChecked(single);await page.locator('#linesToggle').setChecked(total);
  assert.deepEqual(await physical(),before);assert.equal((await state()).showSingleLines,single);assert.equal((await state()).showLines,total);
  assert.equal(await page.locator('#fieldLinesStatus').isVisible(),!single&&!total);images.push(await bitmap());
 }
 assert.equal(new Set(images).size,4);assert.equal((await state()).flow,false);
 await page.locator('#singleLinesToggle').check();await page.locator('#linesToggle').check();const staticFrame=await bitmap();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));assert.equal(await bitmap(),staticFrame);
 // Every single line follows its own Coulomb contribution, irrespective of other sources.
 for(const preset of ['single','negative','dipole','equal']){
  await page.locator(`[data-preset="${preset}"]`).click();assert.equal((await state()).showSingleLines,true);
  const report=await page.evaluate(()=>{const l=__electricFieldLab,s=l.getState(),lines=l.singleLineDiagnostics();let radialError=0,directionCos=1,totalRadialError=0;
   for(const line of lines){const c=s.charges[line.sourceIndex],[a,b]=line.pts,m={x:(a.x+b.x)/2,y:(a.y+b.y)/2},v=l.fieldContributionsAt(m.x,m.y)[line.sourceIndex],d=line.direction;
    radialError=Math.max(radialError,Math.abs((a.x-c.x)*(b.y-c.y)-(a.y-c.y)*(b.x-c.x)));
    directionCos=Math.min(directionCos,(d.x*v.ex+d.y*v.ey)/v.mag);
   }
   if(s.charges.length===1)for(const line of l.traceLines())for(const p of line){const c=s.charges[0],first=line[0];totalRadialError=Math.max(totalRadialError,Math.abs((p.x-c.x)*(first.y-c.y)-(p.y-c.y)*(first.x-c.x)));}
   return{count:lines.length,expected:s.charges.length*s.lineDensity,radialError,directionCos,totalRadialError};
  });assert.equal(report.count,report.expected);assert.ok(report.radialError<1e-10);assert.ok(report.directionCos>1-1e-10);assert.ok(report.totalRadialError<1e-10);
 }
 // Changing line density updates analytical single families. Other sources never terminate them.
 await page.locator('[data-preset="dipole"]').click();await page.evaluate(()=>__electricFieldLab.setLineDensity(8));assert.equal(await page.evaluate(()=>__electricFieldLab.singleLineDiagnostics().length),16);
 await page.evaluate(()=>__electricFieldLab.setLineDensity(22));assert.equal(await page.evaluate(()=>__electricFieldLab.singleLineDiagnostics().length),44);
 const crossing=await page.evaluate(()=>{const l=__electricFieldLab;return l.singleLineDiagnostics().some(line=>line.sourceIndex===0&&line.pts[1].x>l.getState().charges[1].x);});assert.equal(crossing,true);
 // Infinite plate contributions agree on the inside and cancel on the outside.
 await page.locator('[data-preset="capacitor"]').click();
 const plate=await page.evaluate(()=>{const l=__electricFieldLab,lines=l.singleLineDiagnostics();let cos=1;for(const line of lines){const [a,b]=line.pts,v=l.fieldContributionsAt((a.x+b.x)/2,a.y)[line.sourceIndex];cos=Math.min(cos,line.direction.x*v.ex/v.mag);}
  const ys=i=>[...new Set(lines.filter(line=>line.sourceIndex===i).map(line=>line.pts[0].y))];return{cos,lines,ys:[ys(0),ys(1)],inside:l.fieldContributionsAt(0,0),outside:l.fieldContributionsAt(1,0),sum:l.fieldAt(1,0)};
 });assert.ok(plate.cos>1-1e-12);assert.equal(plate.lines.length,88);assert.ok(plate.lines.every(line=>line.pts[0].y===line.pts[1].y));assert.ok(plate.ys[0].every(y=>!plate.ys[1].includes(y)));
 assert.ok(plate.inside.every(v=>v.ex>0));assert.equal(plate.outside[0].ex,-plate.outside[1].ex);assert.equal(plate.sum.mag,0);
 // Controls remain reachable in all modes, retaining values. Superposition values stay unchanged.
 for(const mode of ['motion','superposition','field']){
  await page.evaluate(mode=>__electricFieldLab.setMode(mode),mode);assert.equal(await page.locator('#singleLinesToggle').isVisible(),true);assert.equal((await state()).showSingleLines,true);assert.equal((await state()).showLines,true);
 }
 await page.locator('#superpositionModeBtn').click();const superBefore=await physical();await page.locator('#linesToggle').uncheck();await page.locator('#singleLinesToggle').uncheck();assert.deepEqual(await physical(),superBefore);
 // Deterministic trajectory after visibility changes equals the reference trajectory.
 await page.locator('#motionModeBtn').click();
 const trajectory=()=>page.evaluate(()=>{const l=__electricFieldLab;l.placeTestCharge(0,0);for(let i=0;i<10;i++)l.stepTestCharge(.1);return l.getState().testCharge;});
 const trajectoryBefore=await trajectory();await page.locator('#singleLinesToggle').check();await page.locator('#linesToggle').check();assert.deepEqual(await trajectory(),trajectoryBefore);
 await page.locator('#resetBtn').click();assert.equal((await state()).showSingleLines,false);assert.equal((await state()).showLines,true);assert.equal(await page.locator('#singleLinesToggle').isChecked(),false);
 // Real keyboard interaction, touch targets, focus and the requested layouts.
 await page.locator('[data-preset="dipole"]').click();await page.locator('#singleLinesToggle').focus();await page.keyboard.press('Space');assert.equal((await state()).showSingleLines,true);
 assert.ok(await page.locator('#singleLinesToggle').evaluate(e=>getComputedStyle(e.closest('label')).outlineWidth==='3px'));
 for(const size of [{width:1440,height:900},{width:1024,height:768},{width:820,height:1180},{width:390,height:844}]){
  await page.setViewportSize(size);for(const preset of ['dipole','capacitor']){
   await page.locator(`[data-preset="${preset}"]`).click();await page.screenshot({path:`/tmp/electric-views-${size.width}-${preset}.png`,fullPage:true});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const targets=await page.locator('.field-view-option').evaluateAll(labels=>labels.map(e=>{const r=e.getBoundingClientRect();return[r.width,r.height];}));assert.ok(targets.every(([w,h])=>w>=48&&h>=48));
  }
 }
 // 200% desktop zoom layout equivalent: half the CSS viewport. Separately double text sizes.
 await page.setViewportSize({width:720,height:450});await page.screenshot({path:'/tmp/electric-views-zoom-layout.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.setViewportSize({width:1440,height:900});await page.addStyleTag({content:'.field-views legend{font-size:34px}.field-view-option{font-size:32px}.field-views p{font-size:28px}'});await page.locator('#singleLinesToggle').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/electric-views-zoom.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await page.locator('.field-views p').evaluateAll(ps=>ps.every(p=>p.scrollWidth<=p.clientWidth)));
 await page.getByRole('link',{name:'Zur Übersicht',exact:true}).first().click();await page.waitForURL('**/index.html');await page.locator('a[href="elektrische-felder/index.html"]').click();await page.waitForURL('**/elektrische-felder/index.html');
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.ok(requests.every(url=>url.startsWith(base)||url.startsWith('data:')));
 console.log('Electric single/total views OK: four canvas states, analytical source directions, plate contributions, unchanged field/potential/motion, persistence/reset, keyboard, touch, layouts and enlarged text, navigation, local assets.');
}finally{await browser.close();}
