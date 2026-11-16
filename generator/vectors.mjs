// Native MathML for the HTML legend; drawn vector accents for SVG/3D labels.
export function vectorMath(symbol,subscript=''){
  const vector=`<mover accent="true"><mi>${symbol}</mi><mo>→</mo></mover>`;
  return `<math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="Vektor ${symbol}${subscript?' '+subscript:''}">${subscript?`<msub>${vector}<mi>${subscript}</mi></msub>`:vector}</math>`;
}
export function vectorSVG(x,y,symbol,color){
  const label=symbol==='F₊'?'F positiv':symbol==='Fₑ'?'F Elektron':symbol;
  return `<g class="vector-label" role="img" aria-label="Vektor ${label}"><text x="${x}" y="${y}" style="fill:${color};font-size:24px">${symbol}</text><path d="M${x} ${y-28}h18m-5-4 5 4-5 4" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}
