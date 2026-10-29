/* A small reminder shared by the learning pages. */
(() => {
 const stage=document.querySelector('#learning-screen .learning-stage');
 if(!stage)return;
 const roles=[
  ['sceriffo','보안관','무법자와 배신자를 모두 처치합니다.'],
  ['vice','부관','보안관을 지키고, 보안관과 함께 승리합니다.'],
  ['fuorilegge','무법자','보안관을 처치합니다. 단, 배신자만 남으면 배신자가 승리합니다.'],
  ['rinnegato','배신자','다른 사람을 모두 처치하고 마지막까지 혼자 살아남습니다.']
 ];
 const make=(tag,cls,parent,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;parent.append(n);return n;};
 let cleanup=null;
 function open(trigger){
  if(stage.querySelector('.victory-help-overlay'))return;
  const overlay=make('dialog','victory-help-overlay',stage);
  const panel=make('section','victory-help-note',overlay);panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','victory-help-title');
  make('h2','',panel,'그래서 어떻게 이기더라?').id='victory-help-title';
  const close=make('button','victory-help-close',panel,'×');close.type='button';close.setAttribute('aria-label','승리 목표 쪽지 닫기');
  make('p','victory-help-context',panel,'다른 사람의 말과 행동을 살피며 정체를 추측하고, 내 역할의 승리 목표를 달성합니다.');
  const list=make('dl','victory-help-roles',panel);
  for(const [key,name,goal]of roles){
   const row=make('div','victory-help-role',list);
   const card=window.BANG_CARDS.find(c=>c.name.replace(/^\d+_/,'')===key);
   const image=make('img','',row);image.src=card.src;image.alt=name+' 역할 카드';image.width=42;image.height=65;
   const copy=make('div','',row);make('dt','',copy,name);make('dd','',copy,goal);
  }
  make('p','victory-help-tip',panel,'보안관·부관·무법자는 먼저 탈락해도 팀이 이기면 함께 승리합니다.');
  const siblings=[...stage.children].filter(n=>n!==overlay).map(n=>[n,n.inert]);siblings.forEach(([n])=>n.inert=true);
  const dismiss=()=>{document.removeEventListener('keydown',keys,true);siblings.forEach(([n,value])=>n.inert=value);if(overlay.open)overlay.close();overlay.remove();cleanup=null;if(trigger.isConnected)trigger.focus({preventScroll:true});};
  const keys=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();dismiss();}else if(e.key==='Tab'){e.preventDefault();close.focus();}};
  cleanup=dismiss;document.addEventListener('keydown',keys,true);
  close.onclick=dismiss;overlay.onclick=e=>{if(e.target===overlay)dismiss();};
  overlay.addEventListener('cancel',e=>{e.preventDefault();dismiss();});
  overlay.showModal();close.focus({preventScroll:true});
 }
 function mount(){
  if(cleanup&&!stage.querySelector('.victory-help-overlay'))cleanup();
  const id=stage.dataset.learningFrame;
  const flow=window.BANG_FIGMA_FLOW;
  const route=decodeURIComponent(location.hash).split('?')[0].replace(/^#\/figma\//,'').replace(/^learn:/,'');
  const menus=['47:2539','5:4','94:60','124:745','131:1141',flow?.menu,flow?.home];
  const isMenu=menus.includes(route)||!id||menus.includes(id)||!!stage.querySelector('.learning-drawer-backdrop');
  document.documentElement.toggleAttribute('data-hide-victory-help',isMenu);
  if(isMenu){
   if(cleanup)cleanup();
   document.querySelectorAll('.victory-help-trigger').forEach(n=>n.remove());
   return;
  }
  if(stage.querySelector('.victory-help-trigger')||!stage.children.length)return;
  const trigger=make('button','victory-help-trigger',stage);trigger.type='button';trigger.setAttribute('aria-haspopup','dialog');
  const icon=make('span','victory-help-icon',trigger,'?');icon.setAttribute('aria-hidden','true');make('span','',trigger,'그래서 어떻게 이기더라?');trigger.onclick=e=>{e.stopPropagation();open(trigger);};
 }
 window.addEventListener('hashchange',mount);
 new MutationObserver(mount).observe(stage,{childList:true,attributes:true,attributeFilter:['data-learning-frame']});mount();
})();
