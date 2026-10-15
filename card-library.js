(() => {
 const names={bang:'뱅!',birra:'맥주',catbalou:'캣 벌로우',duello:'결투',gatling:'기관총',emporio:'잡화점',indiani:'인디언',mancato:'빗나감!',panico:'강탈',saloon:'주점',diligenza:'역마차',wellsfargo:'웰스 파고',barile:'술통',dinamite:'다이너마이트',prigione:'감옥',volcanic:'볼캐닉',mustang:'머스탱',remington:'레밍턴',carabine:'카빈',schofield:'스코필드',mirino:'조준경',winchester:'윈체스터',vice:'부관',fuorilegge:'무법자',rinnegato:'배신자',sceriffo:'보안관',bartcassidy:'바트 캐시디',blackjack:'블랙 잭',calamityjanet:'캘러미티 자넷',elgringo:'엘 그링고',jessejones:'제시 존스',jourdonnais:'주르도네',kitcarlson:'키트 칼슨',luckyduke:'럭키 듀크',paulregret:'폴 리그레트',pedroramirez:'페드로 라미레즈',rosedoolan:'로즈 둘란',sidketchum:'시드 케첨',slab:'슬랩 더 킬러',suzylafayette:'수지 라파예트',vulturesam:'벌처 샘',willythekid:'윌리 더 키드'};
 const roleIds=new Set(['vice','fuorilegge','rinnegato','sceriffo']);
 const characterIds=new Set(['bartcassidy','blackjack','calamityjanet','elgringo','jessejones','jourdonnais','kitcarlson','luckyduke','paulregret','pedroramirez','rosedoolan','sidketchum','slab','suzylafayette','vulturesam','willythekid']);
 const categories=[{id:'game',label:'게임 카드'},{id:'role',label:'역할 카드'},{id:'character',label:'인물 카드'}];
 const trickyRules=[
  '자신이 사망하는 순간에 맥주를 들고 있으면 마셔서 생존할 수 있습니다. (생존 비어)',
  '결투는 지목된 상대부터 뱅 카드를 내야 합니다.',
  '기관총은 빗나감으로 회피가 가능하나, 인디언은 회피가 불가능합니다.',
  '강탈은 이미 장착한 카드도 자기 손으로 들고 올 수 있습니다. (무기, 야생마, 술통, 조준경 등)',
  '캣 벌러우로 감옥이나 다이너 마이트를 제거해줄 수 있습니다.',
  '잡화점을 사용할 경우 자신이 몇 번째로 가져가는지 확인합니다.'
 ];
 const name=c=>names[c.name.replace(/^\d+_/,'')]||c.name;
 const categoryId=card=>{const id=card.name.replace(/^\d+_/,'');if(id==='뒷장')return null;if(roleIds.has(id))return'role';if(characterIds.has(id))return'character';return'game';};
 let activeCategory='game';
 window.BangCards={mount(stage){
  stage.querySelectorAll('.card-library').forEach(x=>x.remove());
  const area=document.createElement('section');area.className='card-library';area.setAttribute('aria-label','카드 목록 및 상세 보기');stage.append(area);
  const nav=document.createElement('nav');nav.className='card-library-nav';nav.setAttribute('aria-label','이전 화면 이동');area.append(nav);
  function button(label,action,parent=nav){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=action;parent.append(b);return b;}
  function arrowBack(parent,action,label){const b=button(label,action,parent);b.className='card-detail-back';b.setAttribute('aria-label',label);b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 4 7 12l8 8"/></svg>';return b;}
  const catalog=BANG_CARDS.map((card,index)=>({card,index,category:categoryId(card)})).filter(entry=>entry.category);
  const query=new URLSearchParams(location.hash.split('?')[1]||'');
  const selected=query.has('card')?Number(query.get('card')):null;
  const selectedEntry=catalog.find(entry=>entry.index===selected);
  if(selectedEntry)activeCategory=selectedEntry.category;
  if(selectedEntry){
   nav.remove();
   arrowBack(area,()=>window.BangRouter.go(BANG_FIGMA_FLOW.cards),'카드 목록으로 돌아가기');
   const {card,category}=selectedEntry,detail=document.createElement('article');detail.className='card-library-detail';area.append(detail);
   const label=document.createElement('p');label.className='card-library-category-label';label.textContent=categories.find(item=>item.id===category).label;
   const title=document.createElement('h2');title.textContent=name(card);const img=document.createElement('img');img.src=card.src;img.alt=name(card);
   const description=document.createElement('p');description.className='card-library-description';description.textContent=window.BANG_CARD_DESCRIPTIONS?.[card.name.replace(/^\d+_/,'')]||'이 카드의 설명을 준비 중입니다.';
   detail.append(label,title,img,description);
  }else{arrowBack(nav,()=>window.BangRouter.go('home'),'홈으로 돌아가기');renderList();}
  function renderList(){
   area.querySelector('.card-library-content')?.remove();
   const content=document.createElement('div');content.className='card-library-content';area.append(content);
   const tabs=document.createElement('nav');tabs.className='card-category-tabs';tabs.setAttribute('aria-label','카드 종류');content.append(tabs);
   const sections=new Map();
   for(const item of categories){
    const tab=button(item.label,()=>{
     activeCategory=item.id;
     tabs.querySelectorAll('button').forEach((button,index)=>{
      const active=categories[index].id===item.id;
      button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));
     });
     const section=sections.get(item.id);
     if(section){const areaTop=area.getBoundingClientRect().top;const sectionTop=section.getBoundingClientRect().top;area.scrollTo({top:Math.max(0,area.scrollTop+sectionTop-areaTop-80),behavior:'smooth'});}
    },tabs);
    tab.setAttribute('aria-pressed',String(activeCategory===item.id));if(activeCategory===item.id)tab.classList.add('is-active');
   }
   for(const item of categories){
    const section=document.createElement('section');section.className='card-category-section';section.id=`card-category-${item.id}`;sections.set(item.id,section);content.append(section);
    const heading=document.createElement('h2');heading.className='card-library-heading';heading.textContent=item.label;section.append(heading);
    const grid=document.createElement('div');grid.className='card-library-grid';section.append(grid);
    for(const {card,index}of catalog.filter(entry=>entry.category===item.id)){
     const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',name(card));const img=document.createElement('img');img.src=card.src;img.alt=name(card);img.loading='lazy';b.append(img);b.onclick=()=>window.BangRouter.go(BANG_FIGMA_FLOW.cards,{card:index});grid.append(b);
    }
   }
   const rules=document.createElement('section');rules.className='card-library-rules';rules.setAttribute('aria-labelledby','card-library-rules-title');
   const rulesTitle=document.createElement('h3');rulesTitle.id='card-library-rules-title';rulesTitle.textContent='자주 헷갈리는 규칙';rules.append(rulesTitle);
   const list=document.createElement('ol');for(const text of trickyRules){const item=document.createElement('li');item.textContent=text;list.append(item);}rules.append(list);content.append(rules);
  }
 }};
})();
