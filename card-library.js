(() => {
 // Catalog-only title override; keep the source Figma and simulation data intact.
 const catalogTitle=window.BANG_DIALOGUES?.[146]?.find(line=>line.text==='카드 세부 설명');
 if(catalogTitle){catalogTitle.text='카드 도감';catalogTitle.w=80;}
 const catalogScreen=window.BANG_SCREENS?.find(screen=>screen.id===146);if(catalogScreen)catalogScreen.name='카드 도감';
 const catalogFrame=window.BANG_FIGMA_FLOW?.frames[window.BANG_FIGMA_FLOW.cards];if(catalogFrame)catalogFrame.name='카드 도감';
 const names={bang:'뱅!',birra:'맥주',catbalou:'캣 벌로우',duello:'결투',gatling:'기관총',emporio:'잡화점',indiani:'인디언',mancato:'빗나감!',panico:'강탈',saloon:'주점',diligenza:'역마차',wellsfargo:'웰스 파고',barile:'통',dinamite:'다이너마이트',prigione:'감옥',volcanic:'볼캐닉',mustang:'야생마',remington:'레밍턴',carabine:'카빈',schofield:'스코필드',mirino:'조준경',winchester:'윈체스터',vice:'부관',fuorilegge:'무법자',rinnegato:'배신자',sceriffo:'보안관',bartcassidy:'바트 캐시디',blackjack:'블랙 잭',calamityjanet:'캘러미티 자넷',elgringo:'엘 그링고',jessejones:'제시 존스',jourdonnais:'주르도네',kitcarlson:'키트 칼슨',luckyduke:'럭키 듀크',paulregret:'폴 리그레트',pedroramirez:'페드로 라미레즈',rosedoolan:'로즈 둘란',sidketchum:'시드 케첨',slab:'슬랩 더 킬러',suzylafayette:'수지 라파예트',vulturesam:'벌처 샘',willythekid:'윌리 더 키드'};
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
  window.BangLearning?.mountSearchTabs(stage,'cards');
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
   const page=window.BANG_CARD_DETAIL_PAGES?.[card.name.replace(/^\d+_/,'')];
   if(page)renderDetailPage(detail,card,page);else detail.append(label,title,img,description);
  }else{arrowBack(nav,()=>window.BangLearning.go('search-menu'),'카드&규칙 찾기로 돌아가기');renderList();}
  function renderDetailPage(detail,card,page){
   detail.classList.add('card-guide');
   const add=(tag,cls,parent,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;parent.append(n);return n;};
   const hero=add('header','card-guide-hero',detail);
   add('p','card-guide-type',hero,page.type);
   add('h2','',hero,page.title);
   const image=add('img','card-guide-image',hero);image.src=card.src;image.alt=page.title;
   function section(title){const section=add('section','card-guide-section',detail);add('h3','',section,title);return section;}
   const effect=section(page.effectTitle||'카드 효과');page.effect.forEach((line,i)=>{const p=add('p','',effect);add(i===0?'strong':'span','',p,line);});
   const core=section('핵심 규칙');core.classList.add('card-guide-core');
   const coreList=add('ul','card-guide-core-list',core);page.coreRules.forEach(line=>add('li','',coreList,line));
   function accordion(parent,entry){
    const row=add('details','card-guide-accordion',parent);add('summary','',row,entry.title);
    if(entry.points){const list=add('ul','',row);entry.points.forEach(point=>add('li','',list,point));}
    else add('p','',row,entry.answer);
   }
   if(page.rules?.length){const rules=section('자세한 규칙');page.rules.forEach(entry=>accordion(rules,entry));}
   if(page.faq?.length){const faq=section('자주 묻는 질문');page.faq.forEach(entry=>accordion(faq,{...entry,title:'Q. '+entry.title}));}
   const related=section('관련 카드');const grid=add('div','card-guide-related',related);
   page.related.forEach(([key,title])=>{
    const entry=catalog.find(({card})=>card.name.replace(/^\d+_/,'')===key);if(!entry)return;
    const link=button(title,()=>window.BangRouter.go(BANG_FIGMA_FLOW.cards,{card:entry.index}),grid);link.className='card-guide-related-card';
    link.setAttribute('aria-label',title+' 상세 설명');link.textContent='';
    const img=add('img','',link);img.src=entry.card.src;img.alt='';img.loading='lazy';add('span','',link,title);
   });
   const source=add('a','card-guide-source',detail,'기준: BANG! 기본판 공식 규칙');source.href=page.source;source.target='_blank';source.rel='noopener noreferrer';
   if(page.faqSource){const faqSource=add('a','card-guide-source',detail,'세부 판정: 공식 FAQ');faqSource.href=page.faqSource;faqSource.target='_blank';faqSource.rel='noopener noreferrer';}
  }
  function renderList(){
   area.querySelector('.card-library-content')?.remove();
   const content=document.createElement('div');content.className='card-library-content';area.append(content);
   const tabs=document.createElement('nav');tabs.className='card-category-tabs';tabs.setAttribute('aria-label','카드 종류');content.append(tabs);
   const sections=new Map();
   function selectCategory(id){
    activeCategory=id;
    tabs.querySelectorAll('button').forEach((button,index)=>{
     const active=categories[index].id===id;
     button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));
    });
   }
   // Geometry is measured in viewport pixels; scrollTop uses unscaled stage pixels.
   const scale=()=>area.getBoundingClientRect().height/area.offsetHeight||1;
   function syncCategory(){
    const threshold=tabs.getBoundingClientRect().bottom+8*scale();
    let current=categories[0].id;
    for(const item of categories){
     if(sections.get(item.id).getBoundingClientRect().top<=threshold+1)current=item.id;
    }
    selectCategory(current);
   }
   for(const item of categories){
    button(item.label,()=>{
     const section=sections.get(item.id);
     const stickyBottom=area.getBoundingClientRect().top+(parseFloat(getComputedStyle(tabs).top)+tabs.offsetHeight+8)*scale();
     const delta=(section.getBoundingClientRect().top-stickyBottom)/scale();
     area.scrollTo({top:Math.max(0,area.scrollTop+delta),behavior:'smooth'});
    },tabs);
   }
   for(const item of categories){
    const section=document.createElement('section');section.className='card-category-section';section.id=`card-category-${item.id}`;sections.set(item.id,section);content.append(section);
    const heading=document.createElement('h2');heading.className='card-library-heading';heading.textContent=item.label;section.append(heading);
    const grid=document.createElement('div');grid.className='card-library-grid';section.append(grid);
    for(const {card,index}of catalog.filter(entry=>entry.category===item.id)){
     const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',name(card));const img=document.createElement('img');img.src=card.src;img.alt=name(card);img.loading='lazy';b.append(img);const caption=document.createElement('span');caption.className='card-library-card-name';caption.textContent=name(card);b.append(caption);b.onclick=()=>window.BangRouter.go(BANG_FIGMA_FLOW.cards,{card:index});grid.append(b);
    }
   }
   const rules=document.createElement('section');rules.className='card-library-rules';rules.setAttribute('aria-labelledby','card-library-rules-title');
   const rulesTitle=document.createElement('h3');rulesTitle.id='card-library-rules-title';rulesTitle.textContent='자주 헷갈리는 규칙';rules.append(rulesTitle);
   const list=document.createElement('ol');for(const text of trickyRules){const item=document.createElement('li');item.textContent=text;list.append(item);}rules.append(list);content.append(rules);
   area.addEventListener('scroll',syncCategory,{passive:true});
   syncCategory();
   requestAnimationFrame(()=>{if(area.isConnected)syncCategory();});
  }
  area.querySelectorAll('img').forEach(image=>{image.draggable=false;});
 }};
})();
