(function(root){
  'use strict';
  const torque=(angle,polarity=1,current=true)=>current?3*polarity*Math.cos(angle):0;
  function step(state,dt,polarity=1,current=true,damping=0.8){
    const f=(a,w)=>[w,torque(a,polarity,current)-damping*w];
    const [a,w]=[state.angle,state.omega],k1=f(a,w),k2=f(a+dt*k1[0]/2,w+dt*k1[1]/2),k3=f(a+dt*k2[0]/2,w+dt*k2[1]/2),k4=f(a+dt*k3[0],w+dt*k3[1]);
    return {angle:a+dt*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6,omega:w+dt*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6};
  }
  const api={torque,step};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.LoopModel=api;
})(typeof window!=='undefined'?window:globalThis);
