/* Reuse the simulation's role selection/detail compositions in STEP 2 only. */
(() => {
 const sources={'94:185':'5:229','94:200':'35:1451','94:224':'42:1479','94:248':'42:1515','94:272':'42:1535'};
 const ids=['94:200','94:224','94:248','94:272'];
 function register(flow){for(const [id,source] of Object.entries(sources))flow.frames['learn:'+id].screenId=flow.frames[source].screenId;}
 function render(stage,id,{go}){
  const flow=window.BANG_FIGMA_FLOW,source=flow.frames[sources[id]];
  window.BangDesign.render(source.screenId);
  const original=document.querySelector('#reference-screen .design-stage');
  const panelColors=[...original.querySelectorAll('.design-panel')].map(n=>getComputedStyle(n).backgroundColor);
  stage.replaceChildren(...[...original.childNodes].map(n=>n.cloneNode(true)));
  [...stage.querySelectorAll('.design-panel')].forEach((n,i)=>{n.style.backgroundColor=panelColors[i];n.setAttribute('aria-hidden','true');n.tabIndex=-1;n.inert=true;});
  stage.dataset.screen=String(source.screenId);
  stage.classList.toggle('design-dark',original.classList.contains('design-dark'));
  // Original simulator data and controls remain unchanged; only these learning clones differ.
  for(const button of stage.querySelectorAll('.design-action'))if(button.textContent.includes('이 역할로 플레이'))button.remove();
  if(id==='94:185'){
   for(const copy of stage.querySelectorAll('.design-copy'))if(copy.textContent==='체험할 역할을 뽑아볼까요?'){
    const inner=copy.firstElementChild;inner.textContent='역할을 탐색하세요!';inner.style.transform='none';
   }
   const next=document.createElement('button');next.type='button';next.className='learning-role-next-step';next.textContent='>다음 Step으로 이동';
   Object.assign(next.style,{position:'absolute',left:'28px',top:'778px',width:'334px',height:'44px',fontSize:'14px',color:'#aa2e1b',textAlign:'center',cursor:'pointer'});next.onclick=()=>go('131:1124');stage.append(next);
   const roles=['보안관','부관','무법자','배신자'];
   [...stage.querySelectorAll('.design-card-target')].forEach((button,i)=>{
    button.removeAttribute('aria-disabled');button.setAttribute('aria-label',roles[i]);
    const hotspot=source.hotspots.find(h=>h.label===roles[i]);
    button.onclick=()=>go(ids[i],{action:hotspot.action,motion:{matrix:hotspot.matrix,size:hotspot.size}});
   });
  }else{
   // Same selected-thumbnail hiding performed by the simulation's app.show().
   const thumbnail=stage.querySelector(`[data-screen-asset-index="${ids.indexOf(id)}"]`);if(thumbnail)thumbnail.style.opacity='0';
  }
  const back=stage.querySelector('.design-back');
  if(back){back.setAttribute('aria-label',id==='94:185'?'STEP 목차로 돌아가기':'역할 목록으로 돌아가기');back.onclick=()=>go(id==='94:185'?flow.menu:'94:185',{action:{transitionType:'SMART_ANIMATE'}});}
  for(const copy of stage.querySelectorAll('.design-copy')){
    Object.assign(copy.style,{left:'28px',width:'334px',textAlign:'center',justifyContent:'center'});
    const inner=copy.firstElementChild;if(inner){inner.style.transform='none';inner.style.transformOrigin='center center';}
  }
  requestAnimationFrame(()=>{for(const copy of stage.querySelectorAll('.design-copy')){const inner=copy.firstElementChild;if(inner?.offsetWidth)inner.style.transform=`scaleX(${Math.min(1,334/inner.offsetWidth)})`;}});
  return stage;
 }
 window.BangRoleExplore={register,has:id=>Object.hasOwn(sources,id),render};
})();
