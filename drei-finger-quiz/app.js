(()=>{
 'use strict';const M=FingerQuiz,$=id=>document.getElementById(id),names={f:'Lorentzkraft',b:'Magnetfeld',v:'Bewegung',q:'Ladung'},colors={b:'#287caa',v:'#354543',f:'#bd6e22'};
 const state={index:0,answers:Array(M.tasks.length).fill(null),checked:Array(M.tasks.length).fill(false),time:0,playing:false,celebration:0};
 M.tasks.forEach((t,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`${i+1} · ${names[t.missing]} ergänzen`;$('taskSelect').append(o)});
 const label=(key,value)=>key==='q'?(value===1?'positiv (+)':'negativ (−)'):M.byId[value].label;
 function canvas(id){const c=$(id),r=c.getBoundingClientRect(),d=devicePixelRatio||1;c.width=Math.max(1,Math.round(r.width*d));c.height=Math.max(1,Math.round(r.height*d));const ctx=c.getContext('2d');ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,r.width,r.height);return{ctx,w:r.width,h:r.height}}
 function text(c,s,x,y,color='#233b36',size=15,align='left'){c.fillStyle=color;c.font=`700 ${size}px system-ui`;c.textAlign=align;c.fillText(s,x,y)}
 function forceLabel(c,x,y,color){c.save();c.setLineDash([]);c.fillStyle=color;c.strokeStyle=color;c.textAlign='left';c.font='italic 20px Georgia, serif';c.fillText('F',x,y);c.font='12px Georgia, serif';c.fillText('L',x+12,y+5);c.lineWidth=1.3;c.beginPath();c.moveTo(x,y-21);c.lineTo(x+13,y-21);c.lineTo(x+9,y-24);c.moveTo(x+13,y-21);c.lineTo(x+9,y-18);c.stroke();c.restore()}
 function arrow(c,x,y,dx,dy,color,caption=''){const len=Math.hypot(dx,dy);if(len<1)return;const ux=dx/len,uy=dy/len;c.strokeStyle=color;c.fillStyle=color;c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.lineTo(x+dx,y+dy);c.stroke();c.beginPath();c.moveTo(x+dx,y+dy);c.lineTo(x+dx-ux*10-uy*5,y+dy-uy*10+ux*5);c.lineTo(x+dx-ux*10+uy*5,y+dy-uy*10-ux*5);c.closePath();c.fill();if(caption)text(c,caption,x+dx+uy*13,y+dy-ux*13,color,14)}
 function symbol(c,x,y,kind,color,r=10){c.strokeStyle=color;c.fillStyle=color;c.lineWidth=2;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();if(kind==='out'){c.beginPath();c.arc(x,y,3,0,Math.PI*2);c.fill()}else{c.beginPath();c.moveTo(x-r*.5,y-r*.5);c.lineTo(x+r*.5,y+r*.5);c.moveTo(x+r*.5,y-r*.5);c.lineTo(x-r*.5,y+r*.5);c.stroke()}}
 function particle(c,x,y,q,color='#fffdf8'){c.fillStyle=color;c.strokeStyle='#354543';c.lineWidth=2;c.beginPath();c.arc(x,y,15,0,Math.PI*2);c.fill();c.stroke();text(c,q===null?'?':q>0?'+':'−',x,y+6,'#233b36',22,'center')}
 function guessedForce(task,answer){if(task.missing==='f')return answer;const vector=M.force({...task,[task.missing]:answer});return M.directions.find(d=>d.vector.every((x,i)=>Math.abs(x-vector[i])<1e-8)).id}
 function drawTask(){const {ctx:c,w,h}=canvas('taskCanvas'),task=M.tasks[state.index],answer=state.answers[state.index],checked=state.checked[state.index],s={...task};if(answer!==null)s[task.missing]=answer;
  const cx=w*.5,cy=h*.48,scale=Math.min(w/6.8,h/5.2),depth=checked&&(task.v==='in'||task.v==='out'||task.f==='in'||task.f==='out'),project=r=>[cx+scale*(r[0]+(depth?.65*r[2]:0)),cy-scale*(r[1]+(depth?.4*r[2]:0))],b=checked?task.b:task.missing==='b'&&answer===null?null:s.b;
  if(b){const vec=M.byId[b].vector;for(let x=40;x<w-20;x+=65)for(let y=46;y<h-25;y+=60){if(b==='in'||b==='out')symbol(c,x,y,b,'#8bb5cc',7);else arrow(c,x-vec[0]*18,y+vec[1]*18,vec[0]*36,-vec[1]*36,'#9abbcb')}}
  else text(c,'Magnetfeld: ?',w/2,35,colors.b,19,'center');
  if(checked){c.strokeStyle='#0f766e';c.lineWidth=3;c.beginPath();for(let t=0;t<=state.time+.001;t+=.025){const p=project(M.position(task,t));if(t===0)c.moveTo(...p);else c.lineTo(...p)}c.stroke()}
  function direction(dir,color,key,dashed=false){const vec=M.byId[dir].vector;c.setLineDash(dashed?[6,5]:[]);
   if(dir==='in'||dir==='out'){const x=cx+(key==='v'?-58:58),y=cy+(key==='f'&&dashed?-52:0);symbol(c,x,y,dir,color,12);if(key==='v')text(c,'Bewegung',x,y+35,color,13,'center');else forceLabel(c,x+17,y+7,color)}
   else if(dir==='zero')text(c,'keine Kraft',cx,cy+70,color,15,'center');
   else arrow(c,cx+vec[0]*20,cy-vec[1]*20,vec[0]*70,-vec[1]*70,color,key==='v'?'Bewegung':'');if(key==='f'&&dir!=='zero'&&dir!=='in'&&dir!=='out')forceLabel(c,cx+vec[0]*90+14,cy-vec[1]*90+5,color);c.setLineDash([]);
  }
  for(const key of ['v','f']){if(!checked&&task.missing===key&&answer===null){text(c,`${names[key]}: ?`,20,key==='v'?h-42:h-18,colors[key]);continue}
   if(checked&&key==='f'){const guess=guessedForce(task,answer);if(guess!==task.f)direction(guess,'#886494','f',true);direction(task.f,colors.f,'f')}
   else direction(checked?task[key]:s[key],colors[key],key);
  }
  if(checked&&state.time>.04)c.globalAlpha=.25;particle(c,cx,cy,checked?task.q:task.missing==='q'&&answer===null?null:s.q);c.globalAlpha=1;
  if(checked){const now=project(M.position(task,state.time));if(state.time>.04){particle(c,...now,task.q)}
   text(c,'Richtige Bahn',15,24,'#0f766e',14);if(depth)text(c,'Schrägansicht: Tiefe ↗',15,h-14,'#52675e',12);
  }
  if(state.celebration>0){const age=1.5-state.celebration;c.save();c.globalAlpha=Math.min(1,state.celebration*2);for(let i=0;i<42;i++){const angle=(i*2.399),speed=35+(i%7)*12,x=cx+Math.cos(angle)*speed*age,y=cy-50-Math.abs(Math.sin(angle))*speed*age+95*age*age;c.save();c.translate(x,y);c.rotate(age*4+i);c.fillStyle=['#d8a13b','#0f766e','#287caa','#c05b72'][i%4];c.fillRect(-3,-5,6,10);c.restore()}c.restore()}
 }
 function setup(){const t=M.tasks[state.index],selected=state.answers[state.index],allowed=M.choices(t);$('taskSelect').value=state.index;$('taskTitle').textContent=`Aufgabe ${state.index+1} / ${M.tasks.length}`;$('question').textContent=t.missing==='q'?'Welches Vorzeichen hat die Ladung?':`In welche Richtung zeigt ${t.missing==='v'?'die Bewegung':t.missing==='b'?'das Magnetfeld':'die Lorentzkraft'}?`;
  $('pad').replaceChildren();const options=t.missing==='q'?[{id:1,icon:'+',label:'positiv'},{id:-1,icon:'−',label:'negativ'}]:M.directions;
  options.forEach(o=>{const b=document.createElement('button');b.type='button';b.disabled=!allowed.includes(o.id);b.setAttribute('aria-pressed',String(selected===o.id));b.setAttribute('aria-label',o.label);const icon=document.createElement('span');icon.textContent=o.icon;b.append(icon,document.createTextNode(o.label));if(t.missing==='q')b.className='charge';b.onclick=()=>{state.answers[state.index]=o.id;state.checked[state.index]=false;state.playing=false;state.celebration=0;setup()};$('pad').append(b)});
  $('hint').textContent=['b','v'].includes(t.missing)?'Gesucht ist eine Richtung senkrecht zur bekannten Feld- beziehungsweise Bewegungsrichtung.':'Wähle eine Antwort. Deine Auswahl erscheint direkt in der Zeichnung.';
  $('check').disabled=selected===null;$('comparison').hidden=!state.checked[state.index];$('previous').disabled=state.index===0;$('next').disabled=state.index===M.tasks.length-1;$('progress').textContent=`${state.checked.filter(Boolean).length} von ${M.tasks.length} kontrolliert`;drawTask();if(state.checked[state.index])results();
 }
 function setText(id,value){if($(id).textContent!==value)$(id).textContent=value}
 function results(){const task=M.tasks[state.index],answer=state.answers[state.index],ok=M.correct(task,answer),feedback=$('feedback');feedback.className='feedback'+(ok?'':' wrong');setText('feedback',ok?`Richtig: ${names[task.missing]} – ${label(task.missing,answer)}.`:`Deine Antwort: ${label(task.missing,answer)}. Richtig ist: ${label(task.missing,task[task.missing])}.`);
  const guess=guessedForce(task,answer);setText('forceNote',guess===task.f?`Deine Kraftrichtung stimmt mit der richtigen überein: ${label('f',task.f)}.`:`Kraft nach deiner Eingabe: ${label('f',guess)}. Richtige Kraftrichtung: ${label('f',task.f)}.`);
  setText('viewNote',task.v==='in'||task.v==='out'||task.f==='in'||task.f==='out'?'Die Bahn erscheint in einer Schrägansicht: „aus der Ebene“ zeigt schräg nach rechts oben. Die Richtungssymbole beziehen sich weiter auf die Bildebene.':'Die Animation zeigt die physikalisch richtige Bahn direkt in der Aufgabenzeichnung.');
  drawTask();setText('pause',state.playing?'Pause':'Weiter abspielen');
 }
 $('check').onclick=()=>{state.checked[state.index]=true;state.time=0;state.playing=true;state.celebration=M.correct(M.tasks[state.index],state.answers[state.index])&&!matchMedia('(prefers-reduced-motion: reduce)').matches?1.5:0;setup()};$('taskSelect').onchange=e=>{state.index=Number(e.target.value);state.time=0;state.playing=false;state.celebration=0;setup()};
 for(const [id,offset]of[['previous',-1],['next',1]])$(id).onclick=()=>{state.index+=offset;state.time=0;state.playing=false;state.celebration=0;setup()};
 $('replay').onclick=()=>{state.time=0;state.playing=true;results()};$('pause').onclick=()=>{state.playing=!state.playing;if(state.time>=2.8)state.time=0;results()};
 let last=performance.now();function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;const celebrating=state.celebration>0;if(celebrating)state.celebration=Math.max(0,state.celebration-dt);if(celebrating&&!state.playing)drawTask();if(state.playing){state.time=Math.min(2.8,state.time+dt*.8);if(state.time>=2.8)state.playing=false;results()}requestAnimationFrame(frame)}
 new ResizeObserver(()=>{drawTask();if(state.checked[state.index])results()}).observe($('taskCanvas'));setup();requestAnimationFrame(frame);
})();
