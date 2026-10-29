/* STEP 5 role strategy examples; original role cards and lesson navigation. */
(() => {
 const scenes=[
  {id:'tips-end',role:'보안관',card:'sceriffo',title:'누구를 믿을지 살펴봅니다',copy:'무엇보다 부관을 빨리 찾아내는 것이 중요합니다. 보안관을 제외한 모든 플레이어가 본인이 부관이라 주장할 것이므로, 보안관은 본인을 제외한 다른이들의 체력을 줄여서 각자의 정체가 밝혀졌을 때 바로 처리 가능하도록 준비하는 게 좋습니다.',key:'섣부른 공격보다 신중한 판단!'},
  {id:'tips-rules',role:'부관',card:'vice',title:'보안관을 지키며 협력합니다',copy:'자신이 부관임을 밝히는 타이밍이 중요합니다. 타이밍을 잘 보고 보안관의 신뢰를 얻어 보안관과 함께 무법자와 배신자를 처치하세요.',key:'보안관 보호와 적절한 협력!'},
  {id:'tips-special',role:'무법자',card:'fuorilegge',title:'정체를 드러낼 때를 살핍니다',copy:'보안관의 손패와 장비를 보며 행동합니다. 평소에는 정체를 드러내지 않고 부관인 척 하다가, 보안관의 손패와 장비가 거의 없을 떄에 정체를 드러냄을 감안하고 보안관을 공격하는 것이 좋습니다.',key:'정체를 숨기고 공격할 타이밍 찾기!'},
  {id:'tips-roles',role:'배신자',card:'rinnegato',title:'마지막까지 기회를 노립니다',copy:'부관인 척하며 보안관을 제외한 모든 플레이어를 처치하고 (보안관이 탈락하면 그 즉시 무법자의 승리로 게임이 끝이 납니다.) 마지막에 보안관과 1:1을 벌입니다. 그것이 최후의 생존자가 되는 방법입니다.',key:'초반에는 협력, 마지막에는 배신!'},
  {id:'tips-mind',role:'공통 심리전',card:'뒷장',title:'누구든 부관인 척할 수 있습니다',copy:'보안관 외의 정체는 숨겨져 있습니다.\n말만 믿기보다 행동도 함께 관찰하며,\n의도를 드러낼 때도 신중히 정합니다.',key:'카드만큼 중요한 것은 눈치와 타이밍!'}
 ];
 const make=(tag,cls,parent,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;parent.append(n);return n;};
 const image=(parent,src,cls,alt='')=>{const n=make('img',cls,parent);n.src=src;n.alt=alt;n.draggable=false;return n;};
 const button=(parent,cls,label,action)=>{const n=make('button',cls,parent,label);n.type='button';n.onclick=action;return n;};
 function animateCardTravel(source,destination,action){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){action();return;}
  const origin=source.getBoundingClientRect(),root=source.closest('.tips-story'),stageRect=root.getBoundingClientRect(),scale=stageRect.width/390;
  const target={left:stageRect.left+destination.left*scale,top:stageRect.top+destination.top*scale,width:destination.width*scale,height:destination.height*scale};
  const clone=source.cloneNode(true);clone.removeAttribute('id');
  Object.assign(clone.style,{position:'fixed',left:origin.left+'px',top:origin.top+'px',width:origin.width+'px',height:origin.height+'px',maxWidth:'none',margin:'0',zIndex:'2147483000',pointerEvents:'none',viewTransitionName:'none'});
  document.body.append(clone);source.style.visibility='hidden';
  const animation=clone.animate([{left:origin.left+'px',top:origin.top+'px',width:origin.width+'px',height:origin.height+'px'},{left:target.left+'px',top:target.top+'px',width:target.width+'px',height:target.height+'px'}],{duration:480,easing:'cubic-bezier(.18,.72,.24,1)',fill:'forwards'});
  animation.finished.then(()=>{action();window.setTimeout(()=>clone.remove(),360);}).catch(()=>clone.remove());
 }
 function renderRoleSelect(stage,{go,openMenu,back}){
  const root=make('section','field-lesson tips-story tips-role-select',stage);
  image(root,'assets/intro-wood.png','field-wood');image(root,'assets/intro-paper.png','field-paper');image(root,'assets/frame.png','field-frame');
  const menu=button(root,'field-menu','',openMenu);menu.setAttribute('aria-label','목차 열기');menu.innerHTML='<img src="assets/learning/0a3d10c2-d2f3-4d00-b8a6-9dace2b6209f.svg" alt="">';
  make('p','field-step-label',root,'Step 5 : 역할 별 전략');
  const grid=make('div','tips-role-select-grid',root);grid.setAttribute('aria-label','역할별 전략 선택');
  scenes.slice(0,4).forEach(scene=>{
   const card=window.BANG_CARDS.find(c=>c.name.replace(/^\d+_/,'')===scene.card);
   const item=make('div','tips-role-select-item',grid);
   const choice=button(item,'tips-role-card','',()=>animateCardTravel(cardImage,{left:110,top:190,width:170,height:265},()=>go(scene.id)));choice.setAttribute('aria-label',scene.role+' 전략 보기');
   const cardImage=image(choice,card.src,'tips-role-select-card-image',scene.role+' 역할 카드');
   make('span','tips-role-select-card-name',item,scene.role);
  });
  const footer=make('section','tips-role-select-footer',root);footer.setAttribute('aria-label','역할별 전략 안내');
  make('h1','tips-role-select-title',footer,'역할 별 전략');
  make('p','tips-role-select-hint',footer,'전략을 확인할 역할 카드를 선택하세요.');
  const nav=make('nav','tips-story-navigation',footer);nav.setAttribute('aria-label','이전 단계와 공통 심리전');
  const prev=button(nav,'tips-story-prev','',back);make('span','',prev,'뒤로<');prev.setAttribute('aria-label','이전 단계');
  const next=button(nav,'tips-story-next','',()=>go('tips-mind'));make('span','',next,'> 공통 심리전');next.setAttribute('aria-label','공통 심리전으로 이동');
  return root;
 }
 function render(stage,id,{go,openMenu,back}){
  if(id==='tips-role-select')return renderRoleSelect(stage,{go,openMenu,back});
  const index=scenes.findIndex(s=>s.id===id),scene=scenes[index],root=make('section','field-lesson tips-story',stage);root.dataset.scene=index+1;
  image(root,'assets/intro-wood.png','field-wood');image(root,'assets/intro-paper.png','field-paper');image(root,'assets/frame.png','field-frame');
  const menu=button(root,'field-menu','',openMenu);menu.setAttribute('aria-label','목차 열기');menu.innerHTML='<img src="assets/learning/0a3d10c2-d2f3-4d00-b8a6-9dace2b6209f.svg" alt="">';
  make('p','field-step-label',root,'Step 5 : '+scene.role);
  make('p','tips-story-kicker',root,index===4?'초보자들을 위한 Tip! · 공통 심리전':'역할 별 전략 · '+(index+1)+' / 4');
  make('h1','tips-story-title',root,scene.role);
  const visual=make('div','tips-story-visual',root);
  // Same card sources used by the STEP 2 role exploration, without changing the images.
  const card=window.BANG_CARDS.find(c=>c.name.replace(/^\d+_/,'')===scene.card);
  const roleImage=image(visual,card.src,'tips-story-role-image',index===4?'역할 카드 뒷면':scene.role+' 역할 카드');
  const dialogue=make('section','tips-story-dialogue',root);dialogue.setAttribute('aria-label','역할별 전략 설명');
  make('h2','tips-story-scene-title',dialogue,scene.title);
  const copy=make('div','tips-story-copy',dialogue);
  make('p','tips-story-text',copy,scene.copy);
  const nav=make('nav','tips-story-navigation',dialogue);nav.setAttribute('aria-label','이전 장면과 다음 장면');
  const roleIndex=index;
  const prev=button(nav,'tips-story-prev','',()=>animateCardTravel(roleImage,{left:55+(roleIndex%2)*168,top:132+Math.floor(roleIndex/2)*206,width:112,height:168},()=>go('tips-role-select')));make('span','',prev,'뒤로< 역할 선택');prev.setAttribute('aria-label','역할 카드 선택으로 돌아가기');
  const next=button(nav,'tips-story-next','',()=>go(index<4?'tips-mind':window.BANG_FIGMA_FLOW.menu));make('span','',next,index<4?'> 공통 심리전':'> 목차로');next.setAttribute('aria-label',index<4?'공통 심리전으로 이동':'STEP 목차로 이동');
  return root;
 }
 window.BangTipsStory={render};
})();
