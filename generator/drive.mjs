import * as THREE from 'three';

// A schematic hand-operated crank. The hand translates with the freely turning
// vertical grip, but does not spin rigidly with the rotor about the generator axis.
export function createHandDrive(rotor, scene) {
  const crank=new THREE.Group();rotor.add(crank);
  const hand=new THREE.Group();scene.add(hand);
  const metal=new THREE.MeshStandardMaterial({color:'#687480',metalness:.5,roughness:.34});
  const gripMaterial=new THREE.MeshStandardMaterial({color:'#303d49',roughness:.75});
  const skin=new THREE.MeshStandardMaterial({color:'#d5a27e',roughness:.82});
  const sleeve=new THREE.MeshStandardMaterial({color:'#71869a',roughness:.9});
  function rod(parent,a,b,r,material){
    const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),d=to.clone().sub(from);
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),16),material);
    mesh.position.copy(from).add(to).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());parent.add(mesh);return mesh;
  }
  function round(parent,at,size,material){
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),material);mesh.position.set(...at);mesh.scale.set(...size);parent.add(mesh);return mesh;
  }
  function finger(points,r){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,20,r,10,false),skin);hand.add(mesh);
    round(hand,points[0],[r,r,r],skin);round(hand,points.at(-1),[r,r,r],skin);
  }
  // Shaft continuation, hub, horizontal crank arm and rotating grip.
  rod(crank,[0,1.18,0],[0,1.58,0],.055,metal);
  rod(crank,[0,1.52,0],[0,1.64,0],.11,metal);
  rod(crank,[0,1.58,0],[0,1.58,.92],.055,metal);
  rod(crank,[0,1.58,.92],[0,2.07,.92],.035,metal);
  const grip=rod(crank,[0,1.72,.92],[0,2.05,.92],.056,gripMaterial);
  round(crank,[0,1.58,.92],[.07,.07,.07],metal);
  round(crank,[0,2.065,.92],[.060,.035,.060],gripMaterial);

  // Palm, four curled fingers and opposing thumb form an actual grasp around
  // the grip. Skin surfaces join naturally; the handle remains a separate part.
  round(hand,[.16,.01,0],[.125,.205,.125],skin);
  for(const y of [-.135,-.045,.045,.135])finger([[.17,y,-.10],[.025,y,-.126],[-.078,y,-.075],[-.10,y,.025],[-.025,y,.105]],.034);
  finger([[.20,.13,.055],[.11,.19,.14],[.015,.145,.15],[.005,.075,.13]],.044);
  rod(hand,[.22,.025,0],[.52,.06,.015],.105,skin);
  round(hand,[.29,.035,0],[.12,.12,.11],skin);
  rod(hand,[.46,.06,.015],[.90,.11,.035],.14,sleeve);
  rod(hand,[.44,.058,.015],[.49,.064,.018],.145,sleeve);
  const attachment=new THREE.Vector3();
  return {
    update(visible){
      crank.visible=hand.visible=visible;
      if(!visible)return;
      // World-space grip position is derived from the same rigid rotor geometry.
      rotor.updateWorldMatrix(true,true);grip.getWorldPosition(attachment);
      hand.position.copy(attachment);
    },
    // Readable geometry evidence for QA; not a second simulation state.
    state(){return {visible:hand.visible,hand:hand.position.toArray(),grip:grip.getWorldPosition(new THREE.Vector3()).toArray(),rotation:hand.rotation.toArray().slice(0,3)};}
  };
}
