import assert from 'node:assert/strict';
import {initialState,validateState,dataset,fitLine,visibleFit,slope,interval,number,autoRange,ticks,smoothSegments,axisInfo} from '../diagrammwerkstatt/model.mjs';
const near=(actual,expected,tolerance=1e-12)=>assert.ok(Math.abs(actual-expected)<=tolerance*Math.max(1,Math.abs(expected)),`${actual} ≠ ${expected}`);
const state=initialState();
assert.equal(number(' -1,25e-3 '),-.00125);assert.equal(number(''),null);
for(const value of ['1,2,3','0x10','1 m','Infinity','1e101'])assert.ok(Number.isNaN(number(value)));
// Hand-rechenbares Beispiel: Summe x=10, y=25, xy=69,7, x²=30.
const points=[1.1,2.9,5.2,6.8,9].map((y,x)=>({x,y}));
const fit=fitLine(points);near(fit.m,1.97);near(fit.b,1.06);
// Unabhängiges Optimalitätskriterium: jede gestörte Gerade hat größere Fehlerquadratsumme.
const loss=(m,b)=>points.reduce((sum,p)=>sum+(p.y-m*p.x-b)**2,0);
for(const dm of [-.1,0,.1])for(const db of [-.1,0,.1])if(dm||db)assert.ok(loss(fit.m+dm,fit.b+db)>loss(fit.m,fit.b));
near(points.reduce((sum,p)=>sum+p.y-fit.predict(p.x),0),0);
const shifted=fitLine(points.map(p=>({x:p.x+1e12,y:p.y})));near(shifted.m,1.97);near(shifted.predict(1e12+2),5);
const constant=fitLine([{x:1,y:3},{x:2,y:3},{x:3,y:3}]);near(constant.m,0);near(constant.b,3);
const steep=fitLine([{x:0,y:0},{x:1,y:1e6}]);
const clipped=visibleFit(steep,{min:-1e6,max:1},{min:-1,max:1});
near(clipped[0].x,-1e-6);near(clipped[1].x,1e-6);near(clipped[0].y,-1);near(clipped[1].y,1);
assert.equal(visibleFit(constant,{min:0,max:10},{min:4,max:5}).length,0);
const proportional=fitLine([{x:0,y:0},{x:1,y:2},{x:2,y:4}],true);near(proportional.m,2);assert.equal(proportional.b,0);
assert.ok(fitLine([{x:1,y:2},{x:1,y:5}]).error);assert.ok(fitLine([{x:0,y:2},{x:0,y:5}],true).error);
assert.ok(fitLine([]).error);assert.ok(slope({x:1,y:2},{x:1,y:3}).error);near(slope({x:1,y:2},{x:4,y:8}).m,2);
// Vollständiges Intervallbild, einschließlich innerem Minimum und Kehrwertpolstelle.
assert.deepEqual(interval(1,2,'square'),{low:0,high:9});
assert.deepEqual(interval(2,1,'inverse'),{low:1/3,high:1});
assert.deepEqual(interval(-2,1,'inverseSquare'),{low:1/9,high:1});
assert.deepEqual(interval(5,4,'sqrt'),{low:1,high:3});
assert.ok(interval(1,1,'inverse').error);assert.ok(interval(0,1,'inverseSquare').error);assert.ok(interval(1,2,'sqrt').error);
state.rows=[{x:'1',y:'3',ux:'',uy:''},{x:'2',y:'12',ux:'',uy:''},{x:'3',y:'27',ux:'',uy:''}];
const original=JSON.stringify(state.rows);state.x.transform='square';
near(fitLine(dataset(state).points,true).m,3);assert.equal(JSON.stringify(state.rows),original);
state.x={name:'Zeit',symbol:'t',unit:'s',transform:'square'};
assert.deepEqual(axisInfo(state.x),{name:'Zeit',symbol:'(t)²',unit:'(s)²'});
state.x.transform='inverse';state.uncertainty={enabled:true,mode:'common',x:'1',y:'-2'};
const withIssues=dataset(state);assert.equal(withIssues.points.length,3);assert.ok(withIssues.issues.some(s=>s.includes('enthält 0')));assert.ok(withIssues.issues.some(s=>s.includes('nichtnegative')));assert.equal(withIssues.points[0].xlow,undefined);
state.rows[0].x='0';const invalid=dataset(state);assert.equal(invalid.points.length,2);assert.ok(invalid.issues.some(s=>s.includes('x-Umformung')));
state.rows[0].x='abc';assert.ok(dataset(state).invalid.includes('0:x'));
const range=autoRange([{x:2,xlow:-1,xhigh:4}],'x');assert.ok(range.min< -1&&range.max>4);
const single=autoRange([{x:3}],'x');assert.ok(single.min<3&&single.max>3);
assert.ok(ticks(-.01,.01).includes(0));assert.ok(ticks(1e10,2e10).length>1);
assert.ok(smoothSegments([{x:0,y:1},{x:0,y:2}]).error);
const curve=smoothSegments([{x:0,y:0},{x:1,y:2},{x:2,y:1},{x:4,y:4}]);
for(const s of curve.segments)for(let i=0;i<=100;i++) {
  const t=i/100,u=1-t,y=u**3*s.a.y+3*u*u*t*s.c1.y+3*u*t*t*s.c2.y+t**3*s.b.y;
  assert.ok(y>=Math.min(s.a.y,s.b.y)-1e-12&&y<=Math.max(s.a.y,s.b.y)+1e-12,'Interpolation darf keine zusätzlichen Extrema erzeugen');
}
assert.deepEqual(validateState(initialState()),initialState());
for(const mutate of [s=>s.x.transform='__proto__',s=>s.view.manual='false',s=>s.rows=Array(301).fill(s.rows[0]),s=>s.selected=[NaN,1],s=>s.rows[0].x='a'.repeat(121)]) {
  const s=initialState();mutate(s);assert.throws(()=>validateState(s));
}
console.log('Diagrammwerkstatt: Parsing, OLS-Referenz/Optimalität, Ursprung, Grenzfälle, Intervalle, Linearisierung, Interpolation und Dateivalidierung bestanden.');
