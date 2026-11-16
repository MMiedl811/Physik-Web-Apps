import {sample,wrap} from './model.mjs';

export const checkpointAngles=Object.freeze([0,90,180,270]);

// Short, contextual explanations for a deliberate jump, never an automatic tour.
export function checkpointExplanation(angle,state){
  const a=wrap(angle),m=sample(a,state.rpm,state.direction),zero=a%180===0;
  const carriers=state.carrier==='positive'?'positiven Modellträger':'Elektronen';
  if(state.rpm===0)return {title:`${a}° · Stillstand`,mechanism:'Die Spule steht: Die Ladungsträger werden nicht durch das Magnetfeld bewegt. Die bewegungsbedingte magnetische Lorentzkraft und die Induktionsspannung sind null.',connection:'Die Stellung allein erzeugt keine Spannung. Dafür muss die Spule gedreht werden.'};
  let mechanism;
  if(state.explanation==='flux'){
    mechanism=zero?'Die Flächennormale steht parallel oder antiparallel zum Magnetfeld. Der magnetische Fluss hat einen Extremwert und ändert sich in diesem Moment nicht. Deshalb ist die Induktionsspannung null.':'Die Spulenfläche liegt parallel zum Magnetfeld. Der magnetische Fluss ist gerade null, ändert sich aber am schnellsten. Deshalb ist der Betrag der Induktionsspannung maximal.';
  }else{
    mechanism=zero?`Die langen Leiterseiten bewegen sich parallel oder antiparallel zum Magnetfeld. Auf die ${carriers} wirkt dort keine magnetische Lorentzkraft. Es entsteht in diesem Moment keine Induktionsspannung.`:`Die langen Leiterseiten bewegen sich senkrecht zum Magnetfeld. Der magnetische Kraftanteil auf die ${carriers} ist hier betragsmäßig maximal. Dadurch ist auch der Betrag der Induktionsspannung maximal.`;
  }
  const connection=state.kind==='dc'?(zero?'Beim Kommutator wechseln die Bürsten jetzt zum anderen Spulenende, genau bei Spannung null. So bleibt die äußere Polung bei gleichem Drehsinn erhalten.':`Der Kommutator greift die Spannung so ab, dass X bei diesem Drehsinn ${m.dc>0?'positiv':'negativ'} gegenüber Y bleibt. Nach der nächsten Vierteldrehung folgt der Kontaktwechsel bei Spannung null.`):(zero?'Die Schleifringe halten dieselben Spulenenden mit X und Y verbunden. Beim Weiterdrehen durch diese Stellung wechselt die Spannung ihr Vorzeichen.':`Spulenende ${m.emf>0?'1':'2'} ist jetzt positiv gegenüber ${m.emf>0?'2':'1'}. Nach einer halben Umdrehung ist die Polung umgekehrt; die Schleifringe vertauschen die Anschlüsse nicht.`);
  return {title:`${a}° · ${zero?'Spannung null':state.explanation==='flux'?'maximaler Spannungsbetrag':'maximaler magnetischer Kraftanteil'}`,mechanism,connection};
}
