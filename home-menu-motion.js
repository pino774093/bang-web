/* Interaction only: preserve the original home geometry and all destination screens. */
(() => {
 const starIds={'8:326':'8:311','89:12':'8:308','89:16':'90:22'};
 const pending=new WeakMap();
 function cancel(stage){
  const state=pending.get(stage);if(!state)return;
  clearTimeout(state.timer);pending.delete(stage);
  state.group.classList.remove('home-menu-stamped');
  state.star?.classList.remove('home-star-selected','home-star-filled');
  if(state.image)state.image.src=state.originalSrc;
  stage.removeAttribute('aria-busy');
 }
 function select(stage,id,navigate){
  if(stage.dataset.learningFrame!=='5:4'||pending.has(stage))return false;
  const starId=starIds[id];if(!starId)return false;
  const group=stage.querySelector(`[data-node-id="${id}"]`);
  if(!group)return false;
  const star=stage.querySelector(`[data-node-id="${starId}"]`),image=star?.querySelector('img');
  const state={group,star,image,originalSrc:image?.getAttribute('src'),timer:null};
  pending.set(stage,state);stage.setAttribute('aria-busy','true');
  group.classList.add('home-menu-stamped');star?.classList.add('home-star-selected');
  // Keep playback inside the originating user gesture, as on the original home.
  if(id!=='89:12')window.BangMusic?.start();
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  state.timer=setTimeout(()=>{
   // The outgoing screen is cloned by the router: freeze the fill before cloning.
   star?.classList.add('home-star-filled');
   pending.delete(stage);stage.removeAttribute('aria-busy');
   if(stage.isConnected&&stage.dataset.learningFrame==='5:4')navigate();
  },reduced?60:300);
  return true;
 }
 window.BangHomeMotion={select,cancel};
})();
