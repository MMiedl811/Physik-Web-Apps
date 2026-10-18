import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const M=createRequire(import.meta.url)('../drei-finger-quiz/model.js');
const base=process.env.FINGER_URL||'http://127.0.0.1:8891';
for(const [browserName,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{
  for(const [width,height] of [[1440,900],[1024,768],[820,1180],[600,900],[720,450],[390,844]]){
   if(process.env.FINGER_3D_WIDTH&&Number(process.env.FINGER_3D_WIDTH)!==width)continue;
   const page=await browser.newPage({viewport:{width,height},hasTouch:true}),errors=[],failed=[],external=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url())});
   await page.addInitScript(()=>{
    window.drawnParticle=null;
    const arc=CanvasRenderingContext2D.prototype.arc;
    CanvasRenderingContext2D.prototype.arc=function(x,y,r,...args){if(this.canvas.id==='taskCanvas')window.drawnParticle={x,y,r};return arc.call(this,x,y,r,...args)};
   });
   await page.route('**/drei-finger-quiz/scene.js',async route=>{const response=await route.fetch();const body=(await response.text()).replace('const scene=new THREE.Scene();','const scene=new THREE.Scene();window.renderedScene=scene;');await route.fulfill({response,body});});
   await page.goto(base+'/drei-finger-quiz/');
   await page.evaluate(async root=>{
    const T=await import(root+'/leiterschleife-magnetfeld/vendor/three/three.module.min.js');
    window.renderedThree=T;
   },base);

   const checkLayout=async()=>{
    const r=await page.evaluate(()=>{const rect=e=>e.getBoundingClientRect(),ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return {overflow:document.documentElement.scrollWidth>innerWidth,small:[...document.querySelectorAll('button,input,select,summary,.home')].filter(e=>e.getClientRects().length&&(!e.closest('details:not([open])')||e.tagName==='SUMMARY')).filter(e=>rect(e).width<48||rect(e).height<48).map(e=>e.id),dupes:ids.filter((id,i)=>ids.indexOf(id)!==i)}});
    assert.equal(r.overflow,false,JSON.stringify({browserName,width,r}));assert.deepEqual(r.small,[]);assert.deepEqual(r.dupes,[]);
   };
   for(const index of [6,10,9,0,11,1,2,3,4,5,7,8]){
    await page.locator('#taskSelect').selectOption(String(index));
    assert.equal(await page.locator('#solutionTools').isVisible(),false);assert.equal(await page.locator('#taskCanvas').isVisible(),true);assert.equal(await page.locator('#spaceCanvas').isVisible(),false);
    const task=M.tasks[index],correct=task[task.missing],label=task.missing==='q'?(correct>0?'positiv':'negativ'):M.byId[correct].label;
    await page.locator('#pad').getByRole('button',{name:label,exact:true}).click();await page.locator('#check').click();await page.locator('#timeline').fill('100');
    assert.equal(await page.locator('#view2d').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#pause').textContent(),'Weiter abspielen');
    const at1=await page.evaluate(()=>window.drawnParticle),rect=await page.locator('#taskCanvas').boundingBox();
    if([6,10,9].includes(index)){
     assert.ok(index===6?at1.r>15:at1.r<15);
     if(index===6){assert.ok(at1.x>rect.width*.5);assert.ok(at1.y>rect.height*.48);assert.match(await page.locator('#depthNote').textContent(),/vor der/);}
     if(index===10){assert.ok(Math.abs(at1.x-rect.width*.5)<.01);assert.ok(at1.y>rect.height*.48);assert.match(await page.locator('#depthNote').textContent(),/hinter der/);}
     await page.locator('#timeline').fill('0');assert.equal((await page.evaluate(()=>window.drawnParticle)).r,15);
     await page.locator('#timeline').fill('157');const furthest=await page.evaluate(()=>window.drawnParticle);
     await page.locator('#timeline').fill('280');const returning=await page.evaluate(()=>window.drawnParticle);
     assert.ok(index===6?furthest.r>returning.r:furthest.r<returning.r);
    }else assert.ok(Math.abs(at1.r-15)<1e-8);
    await page.locator('#timeline').fill('100');await checkLayout();
    if([6,10].includes(index)&&[1440,1024,820].includes(width))await page.screenshot({path:`/tmp/finger3d-${browserName}-${width}-${index+1}-2d.png`,fullPage:true});
    await page.locator('#view3d').click();await page.waitForFunction(()=>!document.querySelector('#spaceCanvas').hidden);
    assert.equal(await page.locator('#timeline').inputValue(),'100');assert.equal(await page.locator('#taskCanvas').isVisible(),false);await checkLayout();
    const physical=await page.evaluate(()=>{
     const T=window.renderedThree,arrows={},particles=[];
     window.renderedScene.traverseVisible(o=>{
      if(o.type==='ArrowHelper')arrows[o.cone.material.color.getHexString()]=new T.Vector3(0,1,0).applyQuaternion(o.cone.getWorldQuaternion(new T.Quaternion())).toArray();
      if(o.geometry?.type==='SphereGeometry'&&o.material.opacity===1)particles.push({position:o.position.toArray(),color:o.material.color.getHexString()});
     });return {arrows,particles};
    });
    const approx=(a,b)=>assert.ok(a.every((v,i)=>Math.abs(v-b[i])<1e-8),JSON.stringify({a,b,index}));
    approx(physical.arrows['354543'],M.byId[task.v].vector);approx(physical.arrows['287caa'],M.byId[task.b].vector);
    if(task.f!=='zero'){
     const [v,b]=[physical.arrows['354543'],physical.arrows['287caa']],cross=[v[1]*b[2]-v[2]*b[1],v[2]*b[0]-v[0]*b[2],v[0]*b[1]-v[1]*b[0]].map(x=>x*task.q),n=Math.hypot(...cross);
     approx(physical.arrows['bd6e22'],cross.map(x=>x/n));
    }else assert.equal(physical.arrows['bd6e22'],undefined);
    assert.equal(physical.particles.length,1);
    approx(physical.particles[0].position,M.position(task,1));
    if(index===6)approx(physical.particles[0].position,[Math.SQRT1_2*(1-Math.cos(1)),-Math.SQRT1_2*(1-Math.cos(1)),Math.sin(1)]);
    if(index===10)approx(physical.particles[0].position,[0,-(1-Math.cos(1)),-Math.sin(1)]);

    await page.locator('#cameraFront').click();assert.equal(await page.locator('#timeline').inputValue(),'100');
    await page.locator('#cameraReset').click();await page.locator('#spaceCanvas').focus();await page.keyboard.press('ArrowLeft');await page.keyboard.press('+');
    if(index===6){
     const bounds=await page.locator('#spaceCanvas').boundingBox(),before=await page.locator('#spaceCanvas').screenshot();
     await page.mouse.move(bounds.x+bounds.width*.5,bounds.y+bounds.height*.5);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.65,bounds.y+bounds.height*.55,{steps:8});await page.mouse.up();
     assert.notDeepEqual(await page.locator('#spaceCanvas').screenshot(),before);assert.equal(await page.locator('#timeline').inputValue(),'100');await page.locator('#cameraReset').click();
    }

    assert.equal(await page.locator('#timeline').inputValue(),'100');
    if([6,10].includes(index)&&[1440,1024,820].includes(width))await page.screenshot({path:`/tmp/finger3d-${browserName}-${width}-${index+1}-3d.png`,fullPage:true});
    await page.locator('#view2d').click();assert.equal(await page.locator('#timeline').inputValue(),'100');assert.deepEqual(await page.evaluate(()=>window.drawnParticle),at1);
    await page.locator('#replay').click();assert.equal(await page.locator('#pause').textContent(),'Pause');await page.locator('#pause').click();
    await page.locator('#view3d').click();await page.waitForFunction(()=>!document.querySelector('#spaceCanvas').hidden);
    await page.locator('#pad').getByRole('button',{name:label,exact:true}).click();assert.equal(await page.locator('#solutionTools').isVisible(),false);assert.equal(await page.locator('#spaceCanvas').isVisible(),false);
   }
   await page.locator('#check').click();await page.locator('#timeline').fill('100');await page.locator('#view3d').click();await page.waitForFunction(()=>!document.querySelector('#spaceCanvas').hidden);
   await page.locator('summary').click();await checkLayout();
   await page.addStyleTag({content:'.view-help,.timeline,.small,.hint,.legend{font-size:28px}'});await checkLayout();await page.screenshot({path:`/tmp/finger3d-${browserName}-${width}-text.png`,fullPage:true});
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);
   console.log(browserName,width,'2D depth / 3D / shared time / state reset / layout passed');await page.close();
  }
  const page=await browser.newPage();
  await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:get.call(this,type,...args)}});
  await page.goto(base+'/drei-finger-quiz/');await page.locator('#taskSelect').selectOption('10');await page.locator('#pad').getByRole('button',{name:'in die Ebene',exact:true}).click();await page.locator('#check').click();await page.locator('#view3d').click();
  await page.waitForFunction(()=>document.querySelector('#spaceStatus').textContent.includes('nicht verfügbar'));
  assert.equal(await page.locator('#taskCanvas').isVisible(),true);await page.locator('#timeline').fill('100');assert.match(await page.locator('#depthNote').textContent(),/hinter der/);
  console.log(browserName,'WebGL fallback passed');await page.close();
 }finally{await browser.close();}
}
