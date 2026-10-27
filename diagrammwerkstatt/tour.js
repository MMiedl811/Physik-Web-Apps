const protocolMode = document.body.dataset.mode === 'protocol';
const SEEN_KEY = `physik-diagrammwerkstatt-tour-${protocolMode?'protocol':'diagram'}-v2`;

export function setupTour() {
  const help = document.getElementById('help-tour');
  const steps = [
    {target:'#protocol-editor',title:'Dein ZABMA-Protokoll',text:'Formuliere Ziel, Aufbau, Beschreibung und Auswertung direkt hier. Name, Partner, Klasse und Datum kannst du ebenfalls eintragen. Alles wird mit deinen Messwerten im Projekt gespeichert.'},
    {target:'#axis-fields',title:'Größen und Einheiten',text:'Gib für jede Achse ein Formelzeichen und eine Einheit ein, zum Beispiel t und s für die Zeit. x bezeichnet die waagrechte, y die senkrechte Achse.'},
    {target:'.table-wrap',title:'Ein Wertepaar je Messung',text:'x und y stehen direkt untereinander. Neue Werte erscheinen sofort im Diagramm. Weitere Messungen findest du durch seitliches Scrollen; „＋ Messung“ ergänzt eine Spalte.'},
    {target:'.segments',title:'So werden die Punkte dargestellt',text:'Wähle einzelne Punkte, gerade Verbindungen oder eine glatte Kurve. Die glatte Verbindung läuft durch die Messpunkte; sie ist keine Ausgleichskurve.'},
    {target:'#swap',title:'Achsen schnell tauschen',text:'Dieser Button vertauscht x und y mitsamt Einheiten und Unsicherheiten. Mit „Ansicht anpassen“ daneben bringst du alle gültigen Werte wieder ins Bild.'},
    {target:'#slope-toggle',title:'Eine Steigung untersuchen',text:'Schalte das Steigungsdreieck ein. Wähle anschließend in der Auswertung zwei Messpunkte oder tippe sie im Diagramm an. Dort siehst du Δy / Δx mit eingesetzten Werten und Einheit.'},
    {target:'#fit-toggle',title:'Eine Ausgleichsgerade bestimmen',text:'Dieser Button passt eine Gerade an alle gültigen Messpunkte an. Die Auswertung unter dem Diagramm zeigt Gleichung und Steigung. Alle Punkte werden gleich gewichtet.'},
    {target:'#transform-x',title:'Einen Zusammenhang linearisieren',text:'Wähle zum Beispiel „Quadrat“, um t² statt t aufzutragen. Diagramm und berechnete Tabellenwerte ändern sich gemeinsam. Die Originalwerte bleiben erhalten.'},
    {target:'#uncertainty-details .check',title:'Messunsicherheiten sichtbar machen',text:'Schalte Fehlerbalken ein und gib die Unsicherheit gemeinsam für alle Werte oder einzeln je Messung an. Die Ausgleichsgerade bleibt dabei ungewichtet.'},
    {target:'#save',title:'Deine Messwerte mitnehmen',text:'„Projekt speichern“ bewahrt Protokoll, Werte und Einstellungen. „Diagramm als PNG“ exportiert nur das Diagramm.'},
    {target:'#pdf',title:'Dein Protokoll als PDF',text:'Öffne den PDF-Export und wähle im Druckdialog „Als PDF sichern“. Das Protokoll passt auf höchstens zwei A4-Seiten und lässt Platz zum Zeichnen und handschriftlichen Ergänzen. Diese Tour findest du jederzeit wieder unter „Hilfe & Tour“.' }
  ].filter(step=>protocolMode||step.target!=='#protocol-editor');
  if(!protocolMode){
    steps.find(step=>step.target==='#save').text='„Projekt speichern“ bewahrt Messwerte, Unsicherheiten und Einstellungen. „Diagramm als PNG“ exportiert das Diagramm mit den Ergebnissen der eingeschalteten Werkzeuge.';
    Object.assign(steps.at(-1),{title:'Diagramm und Auswertung als PDF',text:'Öffne den PDF-Export und wähle im Druckdialog „Als PDF sichern“. Messwerte, Diagramm und Auswertung passen auf eine A4-Seite mit Platz für eigene Ergänzungen. Umfangreiche Inhalte meldet die App vor dem Druck. Unter „Hilfe & Tour“ kannst du die Tour wiederholen.'});
  }

  const welcome = document.createElement('dialog');
  welcome.className='tour-welcome';welcome.id='tour-welcome';
  welcome.setAttribute('aria-labelledby','tour-welcome-title');
  welcome.setAttribute('aria-describedby','tour-welcome-copy');
  welcome.innerHTML='<span class="tour-count">Willkommen in der Diagrammwerkstatt</span><h2 id="tour-welcome-title">Von Messwerten zum Diagramm</h2><p id="tour-welcome-copy">Eine kurze Tour zeigt dir die Eingabefelder und wichtigsten Buttons direkt in der App. Du kannst die hervorgehobenen Werkzeuge ausprobieren und jederzeit aussteigen.</p><div class="tour-actions"><button type="button" id="tour-start" class="primary">Tour starten</button><button type="button" id="tour-welcome-skip">Überspringen</button></div>';
  if(protocolMode){welcome.querySelector('.tour-count').textContent='Willkommen beim ZABMA-Protokoll';welcome.querySelector('h2').textContent='Dein Versuch, Schritt für Schritt';}
  document.body.append(welcome);

  const spotlight=document.createElement('div');spotlight.className='tour-spotlight';spotlight.hidden=true;spotlight.setAttribute('aria-hidden','true');document.body.append(spotlight);
  const card=document.createElement('section');card.className='tour-card';card.id='tour-card';card.hidden=true;
  card.setAttribute('role','dialog');card.setAttribute('aria-modal','false');card.setAttribute('aria-labelledby','tour-title');card.setAttribute('aria-describedby','tour-text');
  card.innerHTML='<div id="tour-count" class="tour-count"></div><h2 id="tour-title"></h2><p id="tour-text"></p><div class="tour-actions"><button type="button" id="tour-back">Zurück</button><button type="button" id="tour-next" class="primary">Weiter</button></div><button type="button" id="tour-skip" class="tour-skip">Überspringen</button>';
  document.body.append(card);
  const get=id=>document.getElementById(id);
  let index=-1,target=null,previousScroll=0,opened=[],expandedData=false,raf=0;

  function seen(){try{localStorage.setItem(SEEN_KEY,'done');}catch{/* Die Tour funktioniert auch ohne lokalen Speicher. */}}
  function position(){
    if(!target||card.hidden)return;
    const r=target.getBoundingClientRect(),cardRect=card.getBoundingClientRect();
    const top=Math.max(8,r.top-5),bottom=Math.min(innerHeight-8,cardRect.top-16,r.bottom+5);
    const left=Math.max(8,r.left-5),right=Math.min(innerWidth-8,r.right+5);
    spotlight.hidden=bottom<=top||right<=left;
    Object.assign(spotlight.style,{left:`${left}px`,top:`${top}px`,width:`${Math.max(0,right-left)}px`,height:`${Math.max(0,bottom-top)}px`});
    document.body.style.setProperty('--tour-space',`${cardRect.height}px`);
  }
  function queuePosition(){cancelAnimationFrame(raf);raf=requestAnimationFrame(position);}
  function showStep(next){
    index=next;
    const step=steps[index];target=document.querySelector(step.target);
    if(!target){finish();return;}
    if(target.closest('#input-area')&&get('input-area').hidden){get('data-toggle').click();expandedData=true;}
    for(let parent=target.parentElement;parent;parent=parent.parentElement){
      if(parent.tagName==='DETAILS'&&!parent.open){opened.push(parent);parent.open=true;}
    }
    get('tour-count').textContent=`Schritt ${index+1} von ${steps.length}`;
    get('tour-title').textContent=step.title;get('tour-text').textContent=step.text;
    get('tour-back').disabled=index===0;
    get('tour-next').textContent=index===steps.length-1?'Fertig':'Weiter';
    card.dataset.step=String(index+1);card.dataset.target=step.target;
    card.hidden=false;document.body.classList.add('tour-active');
    document.body.style.setProperty('--tour-space',`${card.getBoundingClientRect().height}px`);
    // Nur die Ansicht wird verändert; die Tour legt keine Beispieldaten an.
    target.scrollIntoView({block:'start',inline:'nearest',behavior:'instant'});
    window.scrollBy({top:-24,behavior:'instant'});
    position();queuePosition();get('tour-next').focus({preventScroll:true});
  }
  function start(){
    welcome.close();previousScroll=scrollY;opened=[];expandedData=false;
    showStep(0);
  }
  function finish(){
    if(welcome.open)welcome.close();
    card.hidden=true;spotlight.hidden=true;target=null;index=-1;cancelAnimationFrame(raf);
    document.body.classList.remove('tour-active');document.body.style.removeProperty('--tour-space');
    for(const detail of opened)detail.open=false;
    opened=[];
    if(expandedData&&!get('input-area').hidden)get('data-toggle').click();
    expandedData=false;seen();
    window.scrollTo({top:previousScroll,behavior:'instant'});help.focus({preventScroll:true});
  }
  function openWelcome(){
    if(!card.hidden)finish();
    previousScroll=scrollY;welcome.showModal();get('tour-start').focus();
  }
  help.addEventListener('click',openWelcome);
  get('tour-start').addEventListener('click',start);
  get('tour-welcome-skip').addEventListener('click',finish);
  get('tour-skip').addEventListener('click',finish);
  get('tour-next').addEventListener('click',()=>index===steps.length-1?finish():showStep(index+1));
  get('tour-back').addEventListener('click',()=>{if(index>0)showStep(index-1);});
  welcome.addEventListener('cancel',event=>{event.preventDefault();finish();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!card.hidden){event.preventDefault();finish();}});
  window.addEventListener('scroll',queuePosition,{passive:true});
  document.addEventListener('scroll',queuePosition,{passive:true,capture:true});
  window.addEventListener('resize',queuePosition);
  window.visualViewport?.addEventListener('resize',queuePosition);
  new ResizeObserver(queuePosition).observe(card);
  let alreadySeen=false;try{alreadySeen=localStorage.getItem(SEEN_KEY)==='done';}catch{}
  if(!alreadySeen)openWelcome();
}
