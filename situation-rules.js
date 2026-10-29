/* Situation reference only. Existing navigation and card/STEP data remain independent. */
(() => {
 const trickyRules=[
  '자신이 사망하는 순간에 맥주를 들고 있으면 마셔서 생존할 수 있습니다. (생존 비어)',
  '결투는 지목된 상대부터 뱅 카드를 내야 합니다.',
  '기관총은 빗나감으로 회피가 가능하나, 인디언은 회피가 불가능합니다.',
  '강탈은 이미 장착한 카드도 자기 손으로 들고 올 수 있습니다. (무기, 야생마, 술통, 조준경 등)',
  '캣 벌로우로 감옥이나 다이너마이트를 제거해줄 수 있습니다.',
  '잡화점을 사용할 경우 자신이 몇 번째로 가져가는지 확인합니다.'
 ];
 const situations=[
  {title:'내 턴이 아닐 때',rules:[
   '빗나감!: 공격받았을 때 사용할 수 있습니다.',
   '맥주: 마지막 생명력을 잃는 상황에서는 다른 사람의 턴에도 사용할 수 있습니다. 단, 생존자가 2명일 때는 사용할 수 없습니다.',
   '술통: 이미 장착되어 있다면 뱅!·기관총 공격을 받았을 때 판정할 수 있습니다.',
   '결투·인디언!: 상대 카드의 효과에 따라 뱅! 카드를 버립니다.',
   '잡화점: 다른 사람이 사용했을 때도 카드를 받을 수 있습니다.'
  ],important:'술통은 장착된 카드의 효과입니다. 결투·인디언!·잡화점은 상대 카드의 효과에 대응하는 상황입니다.'},
  {title:'카드가 너무 많을 때',rules:[
   '자신의 턴에는 사용 가능한 카드를 자유롭게 사용하거나 사용하지 않을 수 있습니다.',
   '뱅! 카드는 기본적으로 한 턴에 한 장만 사용할 수 있습니다.',
   '턴 종료 시 손패가 현재 총알 수를 초과하면 초과한 만큼 버립니다.',
   '다른 사람의 턴에 잡화점으로 카드를 많이 받아도 즉시 버리지 않습니다.'
  ],important:'손패가 현재 총알 수 이하라면 마음대로 버릴 수 없습니다.'},
  {title:'체력이 부족할 때',rules:[
   '맥주: 자신의 생명력 1을 회복합니다.',
   '주점: 살아 있는 모든 플레이어가 각각 생명력 1을 회복합니다. 자신만 두 번 회복하는 것이 아닙니다.',
   '최대 생명력은 인물 카드의 처음 총알 수이며, 보안관은 1이 추가됩니다.',
   '마지막 생명력을 잃는 상황에서는 맥주로 살아남을 수 있지만 주점은 사용할 수 없습니다.',
   '생존자가 2명일 때는 맥주를 사용할 수 없습니다.',
   '주점은 자신의 턴에 사용합니다.'
  ],important:'최대 생명력을 초과하여 회복할 수 없습니다.'},
  {title:'공격받았을 때',rules:[
   '뱅!·기관총: 빗나감!으로 피할 수 있습니다.',
   '술통을 장착했다면 먼저 판정하여 하트가 나왔을 때 빗나감!을 아낄 수 있습니다. 판정에 실패해도 빗나감!을 사용할 수 있습니다.',
   '결투: 결투를 당한 상대부터 뱅! 카드를 번갈아 버립니다. 버리지 못하거나 버리지 않으면 생명력 1을 잃습니다.',
   '인디언!: 뱅! 카드를 버리지 않으면 생명력 1을 잃습니다.',
   '결투와 인디언!의 효과로 버리는 뱅! 카드는 턴당 뱅! 사용 횟수에 포함되지 않습니다.'
  ],important:'결투와 인디언!에는 일반적인 빗나감! 카드를 사용할 수 없습니다.'},
  {title:'카드를 장착할 때',rules:[
   '파란색 장비 카드의 총 장착 개수에는 제한이 없습니다.',
   '같은 이름의 파란색 카드는 중복 장착할 수 없습니다.',
   '무기 카드는 한 번에 하나만 장착할 수 있습니다.',
   '새로운 무기를 장착하면 기존 무기를 버립니다.'
  ],important:'장비 카드는 자신의 턴에만 새로 장착합니다.'},
  {title:'판정할 때',rules:[
   '카드 더미 맨 위의 카드를 공개하고 무늬와 숫자를 확인합니다.',
   '판정에 사용한 카드는 성공 여부와 관계없이 버립니다.',
   '술통: 하트가 나오면 공격을 피합니다.',
   '감옥: 하트가 나오면 감옥에서 벗어납니다. 실패하면 해당 턴을 건너뜁니다. 감옥 카드는 결과와 관계없이 버립니다.',
   '다이너마이트: 스페이드 2~9가 나오면 폭발하여 생명력 3을 잃습니다. 폭발하지 않으면 왼쪽 플레이어에게 전달합니다.',
   '다이너마이트는 설치한 즉시 판정하지 않고, 다음 자신의 턴부터 판정합니다.',
   '다이너마이트와 감옥이 함께 있다면 다이너마이트를 먼저 판정합니다.'
  ],important:'다이너마이트는 몇 바퀴를 돌아도 자동으로 사라지지 않습니다. 폭발하거나 다른 카드 효과로 제거될 때까지 남습니다.'},
  {title:'감옥과 다이너마이트가 함께 있을 때',rules:[
   '내 턴이 시작되면 카드를 뽑기 전에 다이너마이트를 먼저 판정합니다.',
   '다이너마이트가 폭발하지 않으면 왼쪽 플레이어에게 넘깁니다. 폭발하면 다이너마이트를 버리고 생명력 3을 잃습니다.',
   '다이너마이트를 처리한 뒤 살아 있다면, 새 판정 카드를 공개하여 감옥을 판정합니다.',
   '감옥 판정에서 하트가 나오면 정상적으로 턴을 진행합니다. 하트가 아니면 턴을 건너뜁니다. 감옥 카드는 어느 경우든 버립니다.'
  ],important:'감옥에 있어도 다이너마이트 판정을 생략하지 않습니다. 두 카드는 각각 별도의 카드로 판정하며, 감옥 때문에 턴을 건너뛰어도 이미 처리한 다이너마이트 결과는 유지됩니다.'},
  {title:'누군가 탈락했을 때',rules:[
   '탈락한 플레이어는 역할 카드를 공개하고, 자신의 손패와 장착 카드를 모두 버립니다.',
   '무법자를 탈락시킨 플레이어는 카드 3장을 뽑습니다.',
   '보안관이 부관을 탈락시킨 경우 보안관은 손패와 장착한 카드를 모두 버립니다.',
   '탈락 후 승리 조건이 충족되었는지 확인합니다.',
   '탈락한 사람은 빼고 거리를 셉니다.'
  ]}
 ];
 // Images illustrate each rule's subject, not every card mentioned in its prose.
 const ruleCardKeys=[
  [['mancato'],['birra'],['barile'],['duello','indiani'],['emporio']],
  [[],['bang'],[],[]],
  [['birra'],['saloon'],[],[],[],[]],
  [['bang','gatling'],['barile'],['duello'],['indiani'],[]],
  [[],[],['remington'],[]],
  [[],[],['barile'],['prigione'],['dinamite'],[],[]],
  [['prigione','dinamite'],['dinamite'],['prigione'],[]],
  [[],[],[],[],[]]
 ];
 function mount(root){
  root.classList.add('situation-rules-page');
  const hint=document.createElement('p');hint.className='situation-catalog-hint';hint.textContent='정확히 어떤 카드에 대한 문제일 때에는, 카드 도감을 보는 것이 더 편리할 수 있습니다!';root.append(hint);
  const create=(tag,cls,parent,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;parent.append(n);return n;};
  const viewport=create('section','situation-rules-scroll',root);viewport.setAttribute('aria-label',`${situations.length}가지 상황별 규칙`);
  create('p','situation-rules-intro',viewport,'확인할 상황을 선택합니다.');
  const entries=situations.map((s,i)=>{
   const section=create('section','situation-rule',viewport);
   const heading=create('h2','situation-rule-heading',section);
   const button=create('button','situation-rule-toggle',heading);button.type='button';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','situation-rule-'+i);
   create('span','situation-rule-number',button,String(i+1).padStart(2,'0'));create('span','situation-rule-title',button,s.title);const marker=create('span','situation-rule-marker',button,'+');marker.setAttribute('aria-hidden','true');
   const panel=create('div','situation-rule-panel',section);panel.id='situation-rule-'+i;panel.hidden=true;
   const references=[['빗나감!','mancato'],['맥주','birra'],['술통','barile'],['결투','duello'],['인디언!','indiani'],['잡화점','emporio'],['뱅!','bang'],['주점','saloon'],['기관총','gatling'],['감옥','prigione'],['다이너마이트','dinamite'],['무기 카드 예시 · 레밍턴','remington']];
   const list=create('ul','situation-rule-list',panel);
   s.rules.forEach((rule,ruleIndex)=>{
    const item=create('li','situation-rule-item',list);
    const keys=ruleCardKeys[i][ruleIndex];
    const cards=keys.map(key=>references.find(reference=>reference[1]===key));
    if(cards.length){
     const gallery=create('div','situation-rule-cards',item);
     cards.forEach(([label,key])=>{
      const card=window.BANG_CARDS.find(c=>c.name.replace(/^\d+_/,'')===key);if(!card)return;
      const figure=create('figure','situation-rule-card',gallery);
      const image=create('img','',figure);image.src=card.src;image.alt=label;image.loading='lazy';image.decoding='async';image.draggable=false;image.width=84;image.height=131;
      create('figcaption','',figure,label);
     });
    }
    const prose=create('div','situation-rule-prose',item);
    rule.split(/(?<=\.)\s+/).forEach(sentence=>create('p','',prose,sentence));
   });
   if(s.important)create('p','situation-rule-important',panel,s.important);
   button.onclick=()=>{
    const open=button.getAttribute('aria-expanded')!=='true';
    entries.forEach(entry=>{const selected=open&&entry.button===button;entry.button.setAttribute('aria-expanded',String(selected));entry.panel.hidden=!selected;entry.marker.textContent=selected?'−':'+';});
    // Scroll only this content area; keep the original back button and footer fixed.
    const y=section.offsetTop;
    if(open)viewport.scrollTo({top:Math.max(0,y-8),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
   };
   return {button,panel,marker};
  });
  const common=create('section','situation-tricky-rules',viewport);
  const heading=create('h2','',common,'자주 헷갈리는 규칙');heading.id='situation-tricky-rules-title';common.setAttribute('aria-labelledby',heading.id);
  const list=create('ol','',common);trickyRules.forEach(text=>create('li','',list,text));
  return viewport;
 }
 window.BangSituationRules={mount,situations};
})();
