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
 function render(stage,id,{go,openMenu,back}){
  const index=scenes.findIndex(s=>s.id===id),scene=scenes[index],root=make('section','field-lesson tips-story',stage);root.dataset.scene=index+1;
  image(root,'assets/intro-wood.png','field-wood');image(root,'assets/intro-paper.png','field-paper');image(root,'assets/frame.png','field-frame');
  const menu=button(root,'field-menu','',openMenu);menu.setAttribute('aria-label','목차 열기');menu.innerHTML='<img src="assets/learning/0a3d10c2-d2f3-4d00-b8a6-9dace2b6209f.svg" alt="">';
  make('p','field-step-label',root,'Step 5 : '+scene.role);
  make('p','tips-story-kicker',root,'초보자들을 위한 Tip! · '+(index+1)+' / 5');
  make('h1','tips-story-title',root,scene.role);
  const visual=make('div','tips-story-visual',root);
  // Same card sources used by the STEP 2 role exploration, without changing the images.
  const card=window.BANG_CARDS.find(c=>c.name.replace(/^\d+_/,'')===scene.card);
  image(visual,card.src,'tips-story-role-image',index===4?'역할 카드 뒷면':scene.role+' 역할 카드');
  const dialogue=make('section','tips-story-dialogue',root);dialogue.setAttribute('aria-label','역할별 전략 설명');
  make('h2','tips-story-scene-title',dialogue,scene.title);
  const copy=make('div','tips-story-copy',dialogue);
  make('p','tips-story-text',copy,scene.copy);
  const nav=make('nav','tips-story-navigation',dialogue);nav.setAttribute('aria-label','이전 장면과 다음 장면');
  const prev=button(nav,'tips-story-prev','',()=>index?go(scenes[index-1].id):back());make('span','',prev,'뒤로<');prev.setAttribute('aria-label','이전 장면');
  const next=button(nav,'tips-story-next','',()=>go(index<4?scenes[index+1].id:window.BANG_FIGMA_FLOW.menu));make('span','',next,index<4?'>클릭!':'>목차로');next.setAttribute('aria-label',index<4?'다음 장면':'STEP 목차로 이동');
  return root;
 }
 window.BangTipsStory={render};
})();
