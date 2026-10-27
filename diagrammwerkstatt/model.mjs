export const transforms = Object.freeze({
  identity: {label: 'Original', symbol: s => s, unit: u => u, fn: x => x},
  square: {label: 'Quadrat', symbol: s => `(${s})²`, unit: u => u ? `(${u})²` : '', fn: x => x * x},
  inverse: {label: 'Kehrwert', symbol: s => `1/(${s})`, unit: u => u ? `1/(${u})` : '', fn: x => x === 0 ? NaN : 1 / x},
  inverseSquare: {label: 'Kehrwertquadrat', symbol: s => `1/(${s})²`, unit: u => u ? `1/(${u})²` : '', fn: x => x === 0 ? NaN : 1 / (x * x)},
  sqrt: {label: 'Quadratwurzel', symbol: s => `√(${s})`, unit: u => u ? `√(${u})` : '', fn: x => x >= 0 ? Math.sqrt(x) : NaN}
});
export const MAX_ROWS = 300;
export function number(text) {
  const s = String(text ?? '').trim();
  if (!s) return null;
  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?$/.test(s)) return NaN;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) && Math.abs(n) <= 1e100 ? n : NaN;
}
export function fmt(n, digits = 5) {
  if (!Number.isFinite(n)) return 'nicht definiert';
  if (n === 0) return '0';
  const a = Math.abs(n);
  if (a >= 1e6 || a < 1e-4) return n.toExponential(digits - 1).replace(/\.?0+e/, 'e').replace('.', ',').replace('e+', ' · 10^').replace('e-', ' · 10^−');
  return Number(n.toPrecision(digits)).toLocaleString('de-DE', {maximumSignificantDigits: digits, useGrouping: false});
}
export function axisInfo(axis) {
  const t = transforms[axis.transform];
  return {symbol: t.symbol(axis.symbol || '?'), unit: t.unit(axis.unit), name: axis.name};
}
export function axisLabel(axis) {
  const a = axisInfo(axis);
  return a.symbol + (a.unit ? ` / ${a.unit}` : '');
}
export function interval(value, delta, transform) {
  const t = transforms[transform];
  const a = value - delta, b = value + delta;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return {error: 'Intervall ist zu groß.'};
  if ((transform === 'inverse' || transform === 'inverseSquare') && a <= 0 && b >= 0) return {error: 'Unsicherheitsintervall enthält 0: Kehrwert dort nicht definiert.'};
  if (transform === 'sqrt' && a < 0) return {error: 'Unsicherheitsintervall reicht unter 0: keine reelle Quadratwurzel.'};
  const values = [t.fn(a), t.fn(b)];
  if (transform === 'square' && a <= 0 && b >= 0) values.push(0);
  if (!values.every(Number.isFinite)) return {error: 'Umgeformtes Intervall ist nicht endlich.'};
  return {low: Math.min(...values), high: Math.max(...values)};
}
export function dataset(state) {
  const points = [], issues = [], invalid = [];
  state.rows.forEach((row, i) => {
    const x = number(row.x), y = number(row.y);
    if (x === null && y === null) return;
    const errors = [];
    for (const [key, v] of [['x', x], ['y', y]]) {
      if (v === null || !Number.isFinite(v)) {
        errors.push(`${key}: ${v === null ? 'Wert fehlt' : 'gültige Zahl eingeben (Betrag höchstens 10^100)'}`);
        invalid.push(`${i}:${key}`);
      }
    }
    const tx = transforms[state.x.transform].fn(x), ty = transforms[state.y.transform].fn(y);
    if (Number.isFinite(x) && !Number.isFinite(tx)) errors.push('x-Umformung ist für diesen Wert nicht definiert.');
    if (Number.isFinite(y) && !Number.isFinite(ty)) errors.push('y-Umformung ist für diesen Wert nicht definiert.');
    if (errors.length) {issues.push(`Messung ${i + 1}: ${errors.join('; ')}`); return;}
    const p = {id: i, x: tx, y: ty};
    if (state.uncertainty.enabled) {
      for (const key of ['x', 'y']) {
        const text = state.uncertainty.mode === 'individual' ? row[`u${key}`] : state.uncertainty[key];
        const d = number(text);
        if (d === null) continue; // Leeres Feld bedeutet: kein Intervall angegeben.
        if (!Number.isFinite(d) || d < 0) {
          issues.push(`Messung ${i + 1}: Δ${key} muss eine endliche, nichtnegative Zahl sein; dieser Fehlerbalken fehlt.`);
          if (state.uncertainty.mode === 'individual') invalid.push(`${i}:u${key}`);
          continue;
        }
        const bounds = interval(key === 'x' ? x : y, d, state[key].transform);
        if (bounds.error) issues.push(`Messung ${i + 1}, Δ${key}: ${bounds.error} Dieser Fehlerbalken fehlt.`);
        else {p[`${key}low`] = bounds.low; p[`${key}high`] = bounds.high;}
      }
    }
    points.push(p);
  });
  return {points, issues, invalid};
}
export function fitLine(points, origin = false) {
  if (points.length < 2) return {error: 'Mindestens zwei gültige Wertepaare eingeben.'};
  const n = points.length;
  const x0 = origin ? 0 : points[0].x + points.reduce((s,p) => s + (p.x - points[0].x) / n, 0);
  const y0 = origin ? 0 : points[0].y + points.reduce((s,p) => s + (p.y - points[0].y) / n, 0);
  const sx = Math.max(...points.map(p => Math.abs(p.x - x0)));
  const sy = Math.max(...points.map(p => Math.abs(p.y - y0))) || 1;
  if (!sx) return {error: origin ? 'Mindestens ein x-Wert muss von 0 verschieden sein.' : 'Für eine eindeutige Gerade werden unterschiedliche x-Werte benötigt.'};
  let xx = 0, xy = 0;
  for (const p of points) {const dx = (p.x-x0)/sx; xx += dx*dx; xy += dx*((p.y-y0)/sy);}
  const m = (xy / xx) * (sy / sx), b = y0 - m*x0;
  if (![m,b].every(Number.isFinite)) return {error: 'Zahlenbereich für die Geradenanpassung zu groß.'};
  const predict = x => y0 + m*(x-x0);
  return {m,b,n,predict,inverse:y=>x0+(y-y0)/m};
}
// Schnitt mit dem sichtbaren Rechteck vor dem Zeichnen: vermeidet verfälschte
// Geraden durch das Begrenzen sehr großer SVG-Koordinaten.
export function visibleFit(fit, xr, yr) {
  if (!fit || fit.error) return [];
  if (fit.m===0) return fit.b>=yr.min&&fit.b<=yr.max?[{x:xr.min,y:fit.b},{x:xr.max,y:fit.b}]:[];
  const candidates=[];
  for(const x of [xr.min,xr.max]){const y=fit.predict(x);if(Number.isFinite(y)&&y>=yr.min&&y<=yr.max)candidates.push({x,y});}
  for(const y of [yr.min,yr.max]){const x=fit.inverse(y);if(Number.isFinite(x)&&x>=xr.min&&x<=xr.max)candidates.push({x,y});}
  candidates.sort((a,b)=>a.x-b.x);
  return candidates.length>=2?[candidates[0],candidates.at(-1)]:[];
}
export function slope(a, b) {
  if (!a || !b) return {error: 'Zwei gültige Messpunkte auswählen.'};
  const dx = b.x-a.x, dy = b.y-a.y;
  if (dx === 0) return {error: 'Δx = 0: Die Steigung ist nicht definiert.', dx, dy};
  const m = dy/dx;
  if (!Number.isFinite(m)) return {error: 'Steigung außerhalb des darstellbaren Zahlenbereichs.'};
  return {dx,dy,m};
}
export function autoRange(points, key) {
  if (!points.length) return {min: 0, max: 10};
  const values = points.flatMap(p => [p[key], p[`${key}low`] ?? p[key], p[`${key}high`] ?? p[key]]);
  let min = Math.min(...values), max = Math.max(...values);
  if (min === max) {const pad = Math.abs(min)*.15 || 1; return {min: min-pad, max: max+pad};}
  const pad = (max-min)*.09;
  return {min: min-pad, max: max+pad};
}
export function ticks(min, max, target = 6) {
  const raw = (max-min)/target;
  if (!(raw > 0) || !Number.isFinite(raw)) return [];
  const power = 10**Math.floor(Math.log10(raw)), q = raw/power;
  const step = (q <= 1 ? 1 : q <= 2 ? 2 : q <= 5 ? 5 : 10)*power;
  const start = Math.ceil(min/step)*step, out = [];
  for (let i=0; i<30; i++) {const v=start+i*step; if(v>max+step*1e-8) break; out.push(Math.abs(v)<step*1e-9?0:v);}
  return out;
}
// Formtreue Hermite-Verbindung, gewichtet harmonische innere Tangenten.
export function smoothSegments(points) {
  const p = [...points].sort((a,b)=>a.x-b.x);
  if (p.length < 2) return {segments: []};
  const h = [], d = [];
  for (let i=0;i<p.length-1;i++) {
    h.push(p[i+1].x-p[i].x);
    if (h[i]===0) return {error: 'Glatte Kurve nicht möglich: Mehrere Punkte haben denselben x-Wert. Nutze „Punkte“ oder „Verbinden“.'};
    d.push((p[i+1].y-p[i].y)/h[i]);
  }
  const m = [d[0]];
  for (let i=1;i<p.length-1;i++) {
    const w1 = 2*h[i]+h[i-1], w2 = h[i]+2*h[i-1];
    m[i] = d[i-1]*d[i] <= 0 ? 0 : (w1+w2)/(w1/d[i-1]+w2/d[i]);
  }
  m[p.length-1] = d.at(-1);
  const segments = h.map((width,i)=>({a:p[i],b:p[i+1],c1:{x:p[i].x+width/3,y:p[i].y+m[i]*width/3},c2:{x:p[i+1].x-width/3,y:p[i+1].y-m[i+1]*width/3}}));
  if (segments.some(s=>[s.c1.x,s.c1.y,s.c2.x,s.c2.y].some(v=>!Number.isFinite(v)))) return {error:'Zahlenbereich für die glatte Kurve zu groß. Nutze „Punkte“.'};
  return {segments};
}
export function blankRow() {return {x:'',y:'',ux:'',uy:''};}
export function initialState() {
  return {version:1,title:'Mein Diagramm',protocol:{title:'Mein Versuch',name:'',partners:'',class:'',date:'',target:'',setup:'',description:'',analysis:''},x:{name:'',symbol:'x',unit:'',transform:'identity'},y:{name:'',symbol:'y',unit:'',transform:'identity'},rows:Array.from({length:6},blankRow),style:'points',uncertainty:{enabled:false,mode:'common',x:'',y:''},fit:false,origin:false,slope:false,selected:[0,1],view:{manual:false,xmin:'',xmax:'',ymin:'',ymax:'',reverseX:false,reverseY:false}};
}
export function validateState(raw) {
  const fail = () => {throw new Error('Keine gültige Diagrammwerkstatt-Datei (Version 1, höchstens 300 Zeilen).');};
  if (!raw || raw.version!==1 || !Array.isArray(raw.rows) || raw.rows.length>MAX_ROWS || !raw.rows.length) fail();
  const s = initialState();
  const str = v => {if(typeof v!=='string'||v.length>120) fail(); return v;};
  s.title=str(raw.title);
  const protocol=raw.protocol??{};
  for(const key of ['title','name','partners','class','date','target','setup','description','analysis']) {
    const value=protocol[key]??'';
    if(typeof value!=='string'||value.length>4000)fail();
    s.protocol[key]=value;
  }
  for (const key of ['x','y']) {
    if (!raw[key] || !Object.hasOwn(transforms,raw[key].transform)) fail();
    s[key]={name:str(raw[key].name),symbol:str(raw[key].symbol),unit:str(raw[key].unit),transform:raw[key].transform};
  }
  s.rows=raw.rows.map(r=>{if(!r)fail();return {x:str(r.x),y:str(r.y),ux:str(r.ux),uy:str(r.uy)};});
  if (!['points','line','smooth'].includes(raw.style)||!raw.uncertainty||!raw.view) fail();
  s.style=raw.style;
  if (!['common','individual'].includes(raw.uncertainty.mode)) fail();
  s.uncertainty={mode:raw.uncertainty.mode,x:str(raw.uncertainty.x),y:str(raw.uncertainty.y)};
  const bool = v => {if(typeof v!=='boolean') fail(); return v;};
  s.uncertainty.enabled=bool(raw.uncertainty.enabled);
  for(const key of ['fit','origin','slope'])s[key]=bool(raw[key]);
  for(const key of ['manual','reverseX','reverseY'])s.view[key]=bool(raw.view[key]);
  for(const key of ['xmin','xmax','ymin','ymax'])s.view[key]=str(raw.view[key]);
  if(!Array.isArray(raw.selected)||raw.selected.length!==2||!raw.selected.every(v=>Number.isInteger(v)&&v>=0&&v<MAX_ROWS))fail();
  s.selected=[...raw.selected];
  return s;
}
