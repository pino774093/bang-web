/* Additional lessons only; no simulation state or renderer dependencies. */
(() => {
  const routes=['turn-timing','turn-cautions'];
  const labels=['카드 사용 타이밍','내 턴 주의사항'];
  const frames=['turn-start','turn-timing','turn-cautions'].map(id=>({id,name:'Step 3 : 내 턴',y:4000,text:['Step 3 : 내 턴'],links:[]}));
  const timings=[
    {label:'내 턴',title:'사용 단계에서는 자유롭게',cards:['01_bang','03_volcanic'],copy:['갈색 카드는 사용하고 버리고, 파란 카드는 장착해요.','순서는 자유! 단, <em>뱅!은 기본 1장</em>만 사용해요.','카드를 쓰지 않고 넘어가도 괜찮아요.'],note:'볼캐닉 장착 / 윌리 더 키드의 능력: 뱅! 횟수 제한 없음. 사정거리는 지켜요.'},
    {label:'상대 턴',title:'정해진 대응만 할 수 있어요',cards:['08_mancato','02_birra'],copy:['뱅!·기관총 공격에는 <em>빗나감!</em>으로 대응해요.','탈락할 피해를 입었다면 즉시 <em>맥주</em>로 생존할 수 있어요.','일반 사용·새 장착은 불가. 평소 회복은 내 턴에만!'],note:'맥주는 마지막 2명일 때 효과가 없어요. 결투·인디언에는 빗나감! 대신 뱅!을 버려 대응해요.'},
    {label:'장착 후',title:'내 턴이 끝나도 효과는 계속',cards:['01_barile','04_mustang'],copy:['파란 카드는 <em>내 턴에 장착</em>해요. 감옥은 다른 사람 앞에 놓아요.','장착 카드는 버려지거나 제거될 때까지 남아요.','통은 상대의 뱅! 공격을 받을 때 방어 판정을 할 수 있어요.'],note:'통 판정은 ♥이면 성공! 실패해도 빗나감!을 쓸 수 있어요. 결투·인디언에는 통 사용 불가.'},
    {label:'턴 시작',title:'뽑기 전에 먼저 판정해요',cards:['02_dinamite','03_prigione'],copy:['둘 다 있다면 <em>다이너마이트 → 감옥</em> 순서예요.','판정을 마친 뒤 카드 2장을 뽑아요. 감옥 실패 시 턴을 건너뛰어요.','새 카드를 쓰는 행동이 아니라 <em>이미 놓인 카드</em>의 효과 처리예요.'],note:'판정은 덱 맨 위 1장을 공개해 확인한 뒤 버리는 것. 그 카드를 손패로 가져오지 않아요.'}
  ];
  const rules=[
    ['같은 이름의 파란 카드는 1장만','다른 이름이라면 여러 장 장착할 수 있어요.','예: 통 + 야생마는 가능 / 통 + 통은 불가.','turn-timing','장착 후 다시 보기',2],
    ['무기는 한 번에 하나만','새 무기를 놓으면 기존 무기는 버려요. 무기 카드가 없으면 기본 사정거리 1이에요.','무기는 거리 자체가 아닌 공격 사정거리를 정해요.','turn-timing','장착 시점 보기',2],
    ['카드는 안 써도 괜찮아요','사용 단계에서 한 장도 쓰지 않고 끝낼 수 있어요. 손패를 모두 써야 하는 것도 아니에요.','사용을 마쳤다면 손패 정리만 확인해요.','139:249','카드 사용 설명 보기'],
    ['다이너마이트 먼저, 감옥은 그다음','둘 다 있다면 카드 뽑기 전에 이 순서로 판정해요. 감옥 실패 시 뽑기·사용을 건너뛰고 턴이 끝나요.','감옥 실패가 앞서 처리한 다이너마이트의 결과를 취소하지는 않아요.','turn-start','턴 시작 판정 보기'],
    ['뱅!은 기본 한 턴에 1장','볼캐닉과 윌리 더 키드는 예외예요. 기관총·결투는 뱅! 카드 사용과 별개예요.','결투·인디언에 대응해 버린 뱅!은 1장 제한에 포함되지 않아요.','turn-timing','내 턴 타이밍 보기',0],
    ['끝날 때만 손패 수를 확인해요','손패가 현재 생명력보다 많으면 초과분을 버려요. 턴 중간에는 많아도 괜찮아요.','예: 현재 생명력 3, 손패 5장 → 2장 버리기.','139:265','턴 종료 설명 보기']
  ];
  let selectedTab=0;
  function node(tag,cls,parent,text){const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;parent.append(n);return n;}
  function button(parent,text,action,cls='turn-text-link'){const b=node('button',cls,parent,text);b.type='button';b.onclick=action;return b;}
  function card(parent,name){const source=window.BANG_CARDS.find(c=>c.name===name);if(!source)return;const img=node('img','turn-card',parent);img.src=source.src;img.alt={'01_bang':'뱅!','03_volcanic':'볼캐닉','08_mancato':'빗나감!','02_birra':'맥주','01_barile':'통','04_mustang':'야생마','02_dinamite':'다이너마이트','03_prigione':'감옥'}[name]||name;img.draggable=false;}
  function links(parent,go,cls){const nav=node('nav',cls,parent);nav.setAttribute('aria-label','STEP 3 소주제');button(nav,'사용 타이밍',()=>go('turn-timing'));button(nav,'내 턴 주의사항',()=>go('turn-cautions'));return nav;}
  function render(stage,id,{go,openMenu,back}){
    const root=node('section','turn-lesson',stage);
    const wood=node('img','turn-wood',root);wood.src='assets/intro-wood.png';wood.alt='';
    const paper=node('img','turn-paper',root);paper.src='assets/intro-paper.png';paper.alt='';
    const frame=node('img','turn-frame',root);frame.src='assets/frame.png';frame.alt='';
    const menu=button(root,'',openMenu,'turn-menu');menu.setAttribute('aria-label','목차 열기');menu.innerHTML='<img src="assets/learning/0a3d10c2-d2f3-4d00-b8a6-9dace2b6209f.svg" alt="">';
    node('p','turn-step',root,'Step 3 : 내 턴');
    node('h1','turn-heading',root,id==='turn-start'?'내 차례 시작하기':id==='turn-timing'?'카드 사용 타이밍':'잠깐! 내 턴에 이것만은 기억하자!');
    const progress=node('nav','turn-progress',root);progress.setAttribute('aria-label','STEP 3 더 알아보기');
    routes.forEach((route,i)=>{const b=button(progress,labels[i],()=>go(route),'turn-phase');if(route===id)b.setAttribute('aria-current','step');});
    const sheet=node('div','turn-sheet',root);sheet.tabIndex=0;sheet.setAttribute('role','region');sheet.setAttribute('aria-label',id==='turn-cautions'?'내 턴 주의사항 목록':'학습 내용');
    if(id==='turn-start'){
      node('h2','',sheet,'뽑기 전, 내 앞의 카드부터!');
      const art=node('div','turn-card-example',sheet);card(art,'02_dinamite');node('span','turn-order',art,'→');card(art,'03_prigione');
      node('p','turn-callout',sheet,'둘 다 있다면 다이너마이트 → 감옥 → 카드 2장 뽑기');
      const checks=[['다이너마이트가 있다면','♠ 2~9면 폭발: 버리고 생명력 3 감소. 아니면 왼쪽 사람에게 넘겨요. 생존했다면 다음 판정으로!'],['감옥이 있다면','♥이면 감옥을 버리고 진행. 아니라면 감옥을 버리고 턴을 건너뛰어요. 보안관에게는 감옥을 놓을 수 없어요.']];
      checks.forEach(([title,copy])=>{const d=node('details','turn-rule',sheet);node('summary','',d,title);node('p','',d,copy);});
      node('p','turn-small',sheet,'판정: 덱 맨 위 1장을 공개하고 버려요. 손패에 넣는 카드가 아니에요.');
      node('p','',sheet,'판정할 카드가 없다면 바로 2장을 뽑아요. 캐릭터 능력이 있다면 그 지시를 따라요.');
    }else if(id==='turn-timing'){
      const tabs=node('div','turn-tabs',sheet);tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','카드 사용 상황');
      const body=node('div','turn-tab-content',sheet);body.id='turn-timing-panel';body.setAttribute('role','tabpanel');
      const tabButtons=timings.map((timing,i)=>{const b=button(tabs,timing.label,()=>show(i),'turn-tab');b.id='turn-timing-tab-'+i;b.setAttribute('role','tab');b.setAttribute('aria-controls',body.id);b.onkeydown=e=>{let next;if(e.key==='ArrowRight')next=(i+1)%4;else if(e.key==='ArrowLeft')next=(i+3)%4;else if(e.key==='Home')next=0;else if(e.key==='End')next=3;if(next!==undefined){e.preventDefault();show(next);tabButtons[next].focus();}};return b;});
      function show(index){selectedTab=index;tabButtons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});body.replaceChildren();body.setAttribute('aria-labelledby',tabButtons[index].id);const t=timings[index];const art=node('div','turn-card-example',body);t.cards.forEach(name=>card(art,name));node('h2','',body,t.title);const list=node('ul','turn-points',body);t.copy.forEach(copy=>{node('li','',list).innerHTML=copy;});node('p','turn-callout',body,t.note);if(index===3)button(body,'턴 시작 판정 자세히 보기',()=>go('turn-start'));sheet.scrollTop=0;}
      show(selectedTab);
    }else{
      node('p','turn-small',sheet,'궁금한 규칙만 펼쳐보세요.');
      rules.forEach(([title,copy,example,related,label,tab],i)=>{const detail=node('details','turn-rule',sheet);node('summary','',detail,`${i+1}. ${title}`);node('p','',detail,copy);node('p','turn-callout',detail,example);button(detail,label,()=>{if(tab!==undefined)selectedTab=tab;go(related);});detail.addEventListener('toggle',()=>{if(detail.open)for(const other of sheet.querySelectorAll('details'))if(other!==detail)other.open=false;});});
    }
    const footer=node('div','turn-footer',root);
    const forward=()=>go(id==='turn-start'?'turn-timing':id==='turn-timing'?'turn-cautions':'140:427');
    button(footer,id==='turn-start'?'타이밍 설명으로 돌아가기':id==='turn-timing'?'내 턴 주의사항 →':'STEP 4로 →',forward,'turn-next');
    const dialogueNav=node('nav','turn-dialogue-navigation',root);dialogueNav.setAttribute('aria-label','설명창 이전 다음');
    button(dialogueNav,'뒤로<',back,'turn-dialogue-back');button(dialogueNav,'>클릭!',forward,'turn-dialogue-next');
    sheet.addEventListener('click',event=>{
      if(event.target.closest('button,a,input,select,textarea,summary,details,[role=tab]')||window.getSelection()?.toString())return;
      const rect=sheet.getBoundingClientRect();if(event.clientX<rect.left+rect.width/2)back();else forward();
    });
  }
  window.BangTurnLesson={frames,render,links};
})();
