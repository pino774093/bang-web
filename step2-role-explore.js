/* Reuse the role card selection/detail artwork in the learning flow only. */
(() => {
 const sources={'94:185':'5:229','94:200':'35:1451','94:224':'42:1479','94:248':'42:1515','94:272':'42:1535'};
 const ids=['94:200','94:224','94:248','94:272'];
 function register(flow){for(const [id,source] of Object.entries(sources))flow.frames['learn:'+id].screenId=flow.frames[source].screenId;}
 function render(stage,id,{go,openMenu}){
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
   for(const copy of stage.querySelectorAll('.design-copy'))if(copy.textContent.trim()==='체험할 역할을 뽑아볼까요?'){
    const text=copy.firstElementChild||copy;text.textContent='역할을 더 자세히 알아볼까요?';
    Object.assign(copy.style,{left:'28px',width:'334px',textAlign:'center'});
   }
   for(const hint of stage.querySelectorAll('.design-copy'))if(hint.textContent.trim()==='> 카드를 클릭하세요!')hint.remove();
   const cardHint=document.createElement('p');cardHint.className='role-explore-click-hint';cardHint.textContent='카드를 클릭하세요!';stage.append(cardHint);
   const previous=document.createElement('button');previous.type='button';previous.className='learning-role-list-back';previous.textContent='뒤로<';previous.setAttribute('aria-label','이전 역할 설명으로 돌아가기');
   Object.assign(previous.style,{position:'absolute',left:'28px',top:'778px',width:'96px',height:'40px',padding:'0',border:'0',background:'transparent',font:'inherit',fontSize:'16px',color:'#aa2e1b',textAlign:'left',cursor:'pointer'});previous.onclick=()=>go('35:1406',{action:{transitionType:'SMART_ANIMATE'}});stage.append(previous);
   const next=document.createElement('button');next.type='button';next.className='learning-role-next-step';next.textContent='> 게임 준비하기';
   Object.assign(next.style,{position:'absolute',right:'28px',top:'778px',width:'124px',height:'40px',padding:'0',border:'0',background:'transparent',font:'inherit',fontSize:'16px',color:'#aa2e1b',textAlign:'right',cursor:'pointer'});next.onclick=()=>go('124:909');stage.append(next);
   const roles=['보안관','부관','무법자','배신자'];
   [...stage.querySelectorAll('.design-card-target')].forEach((button,i)=>{
    button.removeAttribute('aria-disabled');button.setAttribute('aria-label',roles[i]);
    const hotspot=source.hotspots.find(h=>h.label===roles[i]);
    button.onclick=()=>go(ids[i],{action:hotspot.action,motion:{matrix:hotspot.matrix,size:hotspot.size}});
   });
   const step=document.createElement('div');step.className='learning-step-label';step.textContent='Step 1 : 역할과 승리 조건';
   Object.assign(step.style,{width:'220px',boxSizing:'border-box',whiteSpace:'nowrap'});stage.append(step);
  }else{
   // Same selected-thumbnail hiding performed by the simulation's app.show().
   const thumbnail=stage.querySelector(`[data-screen-asset-index="${ids.indexOf(id)}"]`);if(thumbnail)thumbnail.style.opacity='0';
  }
  if(id==='94:185'){
   stage.querySelector('.design-back')?.remove();
   const menu=document.createElement('button');menu.type='button';menu.className='learning-menu-button';menu.setAttribute('aria-label','목차 열기');
   menu.innerHTML='<span class="learning-menu-icon"><img src="assets/learning/0a3d10c2-d2f3-4d00-b8a6-9dace2b6209f.svg" alt=""></span>';menu.onclick=()=>openMenu();stage.append(menu);
  }else{
   const back=stage.querySelector('.design-back');
   if(back){back.setAttribute('aria-label','역할 카드 목록으로 돌아가기');back.onclick=()=>go('94:185',{action:{transitionType:'SMART_ANIMATE'}});}
  }
  if(id!=='94:185'){
   const labels={'94:200':'보안관','94:224':'부관','94:248':'무법자','94:272':'배신자'};
   const detailCopy={
    '94:200':['무법자와 배신자를 모두 탈락시키는 것이 목표입니다.','역할을 처음부터 공개하지만, 다른 플레이어 중 누가 자신의 편인지는 모른 채 시작합니다.','보안관은 체력이 1 더 많고 감옥에 갇히지 않습니다.','부관을 직접 제거하면 손패와 장비를 모두 잃습니다.'],
    '94:224':['보안관과 같은 편으로, 보안관이 목표를 달성하도록 돕습니다.','부관은 정체를 숨깁니다.','보안관도 누가 부관인지 처음부터 알지 못합니다.'],
    '94:248':['보안관을 탈락시키는 것이 목표입니다.','무법자들은 목표를 공유하지만 서로의 정체를 처음부터 확인하지 않습니다.','보안관이 탈락했을 때 무법자가 남아 있으면, 누가 보안관을 탈락시켰든 무법자 팀이 승리합니다.'],
    '94:272':['배신자는 무법자와 같은 편이 아닌 독립된 역할입니다.','다른 플레이어가 남아 있을 때 보안관이 먼저 탈락하면 무법자 팀이 승리합니다.','따라서 배신자는 상황에 따라 보안관을 보호해야 합니다.']
   };
   stage.querySelectorAll('.design-copy').forEach(node=>node.remove());
   const copy=document.createElement('div');copy.className='learning-role-detail-copy';
   const goals={'94:200':'무법자·배신자 제거','94:224':'보안관 보호','94:248':'보안관 제거','94:272':'혼자 생존'};
   const goal=document.createElement('p');goal.className='learning-role-goal';goal.textContent='한 줄 목표: '+goals[id];copy.append(goal);
   if(id==='94:272'){
    for(const sentence of detailCopy[id]){const line=document.createElement('p');line.className='learning-role-detail-sentence';line.textContent='- '+sentence;copy.append(line);}
    const emphasis=document.createElement('strong');emphasis.textContent='- 무법자는 보안관 제거, 배신자는 단독 생존이 목표입니다.';copy.append(emphasis);
   }else for(const sentence of detailCopy[id]){const line=document.createElement('p');line.className='learning-role-detail-sentence';line.textContent='- '+sentence;copy.append(line);}
   stage.append(copy);
   stage.querySelectorAll('.design-white-star').forEach(star=>star.remove());
   const heading=document.createElement('h1');heading.className='learning-role-detail-heading';
   const star=document.createElement('img');star.className='learning-role-detail-star';star.src='assets/sheriff.svg';star.alt='';star.setAttribute('aria-hidden','true');
   const name=document.createElement('span');name.textContent=labels[id];heading.append(star,name);stage.append(heading);
   const step=document.createElement('div');step.className='learning-step-label';step.textContent='Step 1 : 역할과 승리 조건';stage.append(step);
  }
  requestAnimationFrame(()=>{for(const copy of stage.querySelectorAll('.design-copy')){const inner=copy.firstElementChild;if(inner?.offsetWidth)inner.style.transform=`scaleX(${Math.min(1,334/inner.offsetWidth)})`;}});
  return stage;
 }
 window.BangRoleExplore={register,has:id=>Object.hasOwn(sources,id),render};
})();
