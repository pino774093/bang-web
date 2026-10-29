/* STEP 4 only: the same illustrated scene + dialogue rhythm as STEP 1–3. */
(() => {
 const scenes=[['140:427','상대까지 얼마나 멀까?'],['attack-range','내 총으로 닿을까?'],['attack-effects','거리가 바뀌기도 해요']];
 const make=(tag,cls,parent,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;parent.append(n);return n;};
 const button=(parent,cls,label,action)=>{const n=make('button',cls,parent,label);n.type='button';n.onclick=action;return n;};
 function img(parent,src,cls,alt=''){const n=make('img',cls,parent);n.src=src;n.alt=alt;n.draggable=false;return n;}
 let playerCount=5;
 try{const saved=Number(sessionStorage.getItem('bang-range-players'));if(saved>=4&&saved<=7)playerCount=saved;}catch{}
 function seatsFor(count,original){
  if(count===5)return original.map(s=>({...s}));
  return Array.from({length:count},(_,i)=>({label:i?String.fromCharCode(64+i):'나',x:195-140*Math.sin(i*2*Math.PI/count),y:323+106*Math.cos(i*2*Math.PI/count),head:original[i%original.length].head}));
 }
 function distance(state,target,from=0,count=5){
  const alive=Array.from({length:count},(_,i)=>i).filter(i=>!state.eliminated.has(i));
  if(from===target||!alive.includes(from)||!alive.includes(target))return null;
  const a=alive.indexOf(from),b=alive.indexOf(target),clockwise=(b-a+alive.length)%alive.length,counterclockwise=alive.length-clockwise;
  const base=Math.min(clockwise,counterclockwise),scope=from===0&&state.scope?1:0,mustang=target===0?(state.ownMustang?1:0):(state.mustangs.has(target)?1:0);
  const effective=Math.max(1,base+mustang-scope),range=window.BangFieldLesson.weapons.find(w=>w[0]===state.weapon)[2];
  return {base,effective,clockwise,counterclockwise,canAttack:effective<=range};
 }
 function render(stage,id,{go,openMenu,back}){
  const progress={
   'game-start':{title:'',cards:[['sceriffo','보안관']],text:'모두 준비되었다면 보안관부터 시작합니다.\n차례는 보안관 기준 시계방향으로 돌아갑니다.',note:'',prev:'setup-share-abilities',next:'131:1124'},
   'game-attack':{title:'1. 카드를 사용해요',cards:[['bang','뱅!'],['birra','맥주']],text:'사용 조건을 확인하고,\n카드와 대상을 정해 사용합니다.',note:'공격·회복·장착 등 효과는 카드마다 다릅니다.',prev:'139:265',next:'game-response'},
   'game-response':{title:'2. 상대가 대응해요',cards:[['bang','뱅!'],['mancato','빗나감!']],text:'카드 효과에 맞춰 회피하거나\n카드를 버립니다.\n대응하지 못하면 피해를 받습니다.',note:'자기 턴이 아니어도 대응할 수 있습니다.',prev:'game-attack',next:'game-resolution'},
   'game-resolution':{title:'3. 결과를 처리해요',cards:[['bang','뱅!'],['mancato','빗나감!']],text:'회피나 피해를 처리한 뒤,\n내 카드 사용을 이어갑니다.',note:'상대의 대응으로 턴이 넘어가지는 않습니다.',prev:'game-response',next:'attack-introduction'},
   'range-summary':{title:'거리와 사정거리, 달라요',cards:[['panico','강탈!']],text:'총은 뱅!이 닿는 범위를,\n조준경·야생마는 보이는 거리를 바꿔요.',note:'강탈!은 총과 상관없이 거리 1인 상대에게만!\n조준경·야생마를 반영한 거리로 확인해요.',prev:'attack-effects',next:'attack-draw'},
   'game-elimination':{title:'탈락하면 어떻게 될까?',cards:[['fuorilegge','역할 공개']],text:'만약 진행중 생명력이 다하면 탈락합니다.\n탈락한 사람은 역할을 공개하고,\n손패와 장착 카드를 모두 버립니다.',note:'탈락한 사람은 턴과 거리 계산에서 빠져요.',prev:'attack-draw-examples',next:'game-beer'},
   'game-beer':{title:'맥주로 살아남을 수 있어요',cards:[['birra','맥주']],text:'마지막 생명력을 잃는 순간,\n즉시 맥주로 생명력을 회복하면\n살아남을 수 있습니다.\n피해가 크면 맥주가 여러 장 필요할 수 있습니다.',note:'다른 사람의 턴에도 사용할 수 있어요.\n단, 두 명만 남은 상태에서는 맥주는 효과가 없어요.',prev:'game-elimination',next:'game-rewards'},
   'game-rewards':{title:'탈락에 따른 보상과 벌칙',cards:[['fuorilegge','무법자'],['vice','부관']],text:'무법자를 탈락시킨 사람은 역할에 관계없이\n카드 세 장을 뽑습니다.\n보안관이 부관을 탈락시키면 자신의\n손패와 장착 카드를 전부 버립니다.',note:'다이너마이트 폭발에는 처치자가 없으므로\n이 보상이나 벌칙을 적용하지 않습니다.',prev:'game-beer',next:'game-ending'},
   'game-ending':{title:'게임은 언제 끝날까?',cards:[['sceriffo','보안관'],['rinnegato','배신자']],text:'무법자와 배신자가 모두 탈락하면\n보안관과 부관 팀이 승리하고,\n보안관이 탈락하면 무법자 팀이 승리합니다.\n단, 배신자 혼자 남았다면 배신자의 승리!',note:'종료 조건이 충족되는 즉시 게임이 끝납니다.\n먼저 탈락한 사람도 소속 팀과 함께 승리합니다.',prev:'game-rewards',next:'tips-role-select'}
  };
  if(progress[id]){
   const lesson=progress[id],root=render(stage,'attack-introduction',{go,openMenu,back});
   root.dataset.scene='game-progress';
   if(['game-elimination','game-beer','game-rewards','game-ending'].includes(id))root.classList.add('elimination-story');
   const topic=window.BangContents.topicFor(id);
   root.querySelector('.field-step-label').textContent=topic?`Step ${topic.step+1} : ${topic.label}`:'Step 4';
   if(lesson.title)make('h1','attack-story-title',root,lesson.title);
   if(['game-attack','game-response','game-resolution'].includes(id)){
    const steps=make('ol','use-response-flow',root);steps.setAttribute('aria-label','사용과 대응 진행 순서');
    ['사용','대응','결과 처리'].forEach((label,i)=>{const item=make('li','',steps,`${i+1}. ${label}`);if(['game-attack','game-response','game-resolution'][i]===id)item.setAttribute('aria-current','step');});
   }
   root.querySelector('.attack-story-text').textContent=lesson.text;
   if(lesson.note)make('p','attack-story-note',root.querySelector('.attack-story-copy'),lesson.note);
   const area=root.querySelector('.attack-story-cards');area.replaceChildren();area.setAttribute('aria-label',lesson.title||'보안관 카드');
   for(const [key,label]of lesson.cards){const card=make('div','attack-story-card',area);img(card,window.BANG_CARDS.find(c=>c.name.replace(/^\d+_/,'')===key).src,'',label);make('span','',card,label);}
   if(id==='game-response'){
    area.remove();
    const summary=make('section','response-summary',root);summary.setAttribute('aria-label','카드별 대응 방법');
    const list=make('div','response-card-rows',summary);
    for(const [attacks,reply,caption]of [
     [[['bang','뱅!'],['gatling','기관총']],['mancato','빗나감!'],'빗나감!으로 회피'],
     [[['indiani','인디언!']],['bang','뱅!'],'뱅! 한 장 버리기'],
     [[['duello','결투']],['bang','뱅!'],'상대부터 번갈아 뱅! 버리기']
    ]){
     const row=make('div','response-card-row',list);
     const from=make('div','response-card-group',row);from.setAttribute('aria-label','상대가 사용한 카드');
     for(const [key,label]of attacks){const figure=make('figure','response-card-figure',from);img(figure,window.BANG_CARDS.find(c=>c.name.replace(/^\d+_/,'')===key).src,'',label);make('figcaption','',figure,label);}
     const arrow=make('span','response-card-arrow',row,'→');arrow.setAttribute('aria-hidden','true');
     const to=make('div','response-card-answer',row);to.setAttribute('aria-label','대응 방법');
     const figure=make('figure','response-card-figure',to);img(figure,window.BANG_CARDS.find(c=>c.name.replace(/^\d+_/,'')===reply[0]).src,'',reply[1]);
     make('p','response-card-caption',to,caption);
    }
    make('p','response-summary-note',summary,'장착한 술통으로도 뱅!·기관총을 피할 수 있어요.\n하트가 나오면 회피 성공!');
   }
   if(id==='game-start')root.classList.add('game-start-screen');
   root.querySelector('.attack-story-prev').onclick=()=>back(lesson.prev);
   const next=root.querySelector('.attack-story-next');next.onclick=()=>go(lesson.next);next.setAttribute('aria-label',id==='game-ending'?'STEP 5로 이동':'다음 장면');
   return root;
  }
  if(id==='attack-introduction'){
   const root=render(stage,'140:427',{go,openMenu,back});root.dataset.scene='range-introduction';
   root.classList.remove('range-exercise');root.querySelector('.attack-story-title')?.remove();
   root.querySelector('.attack-story-player-count').remove();root.querySelector('.attack-story-illustration').remove();
   root.querySelector('.attack-story-text').textContent="'뱅!'과 '강탈!' 카드를 원하는 상대에게 사용하기 위해선 사정거리를 확인해야 합니다. 그럼 그 사정거리에 대해 알아볼까요?";
   root.querySelector('.attack-story-note').remove();
   // Keep the empty card container for other lessons that reuse this shell.
   root.querySelector('.attack-story-prev').onclick=()=>back('game-resolution');
   root.querySelector('.attack-story-next').onclick=()=>go('140:427');return root;
  }
  if(['attack-draw','attack-draw-examples','attack-draw-other'].includes(id))return window.BangJudgmentLesson.render(stage,{go,openMenu,back},id);
  const lesson=window.BangFieldLesson,index=scenes.findIndex(s=>s[0]===id);
  let seats=seatsFor(playerCount,lesson.seats),players=[];
  const state={target:1,weapon:'colt',scope:false,ownMustang:false,mustangs:new Set(),eliminated:new Set()};
  let selected=null,effect=null;
  const root=make('section','field-lesson attack-story',stage);root.dataset.scene=String(index+1);root.classList.add('range-exercise');
  make('h1','attack-story-title',root,scenes[index][1]);
  img(root,'assets/intro-wood.png','field-wood');img(root,'assets/intro-paper.png','field-paper');img(root,'assets/frame.png','field-frame');
  const menu=button(root,'field-menu','',openMenu);menu.setAttribute('aria-label','목차 열기');menu.innerHTML='<img src="assets/learning/0a3d10c2-d2f3-4d00-b8a6-9dace2b6209f.svg" alt="">';
  make('p','field-step-label',root,'Step 4 : 거리와 사정거리');
  const countBar=make('label','learning-player-count attack-story-player-count',root,'플레이 인원 ');
  const countSelect=make('select','',countBar);countSelect.setAttribute('aria-label','플레이 인원');
  for(const n of [4,5,6,7]){const option=make('option','',countSelect,n+'명');option.value=String(n);}
  countSelect.value=String(playerCount);
  countSelect.onchange=()=>{
    const n=Number(countSelect.value);if(![4,5,6,7].includes(n))return;
    playerCount=n;try{sessionStorage.setItem('bang-range-players',String(n));}catch{}
    seats=seatsFor(n,lesson.seats);selected=null;buildPlayers();refresh();
  };
  const illustration=make('div','attack-story-illustration',root);illustration.setAttribute('role','group');illustration.setAttribute('aria-label','5인 게임의 플레이어 배치');
  const art=make('div','attack-story-art',illustration);art.setAttribute('aria-hidden','true');
  const template=document.createElement('template');template.innerHTML=window.BANG_LEARNING_SCENES.scenes['131:1268'];
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 390 584');svg.setAttribute('aria-hidden','true');svg.classList.add('attack-story-path');illustration.append(svg);
  const path=document.createElementNS('http://www.w3.org/2000/svg','polyline');svg.append(path);
  function buildPlayers(){
   illustration.setAttribute('aria-label',playerCount+'인 게임의 플레이어 배치');
   players.forEach(p=>p.remove());art.replaceChildren();
   art.append(template.content.querySelector('[data-node-id="131:1285"]').cloneNode(true));
   players=seats.map((seat,i)=>{
    const head=template.content.querySelector(`[data-node-id="${seat.head}"]`).cloneNode(true);
    head.removeAttribute('data-node-id');head.querySelectorAll('[data-node-id]').forEach(n=>n.removeAttribute('data-node-id'));
    Object.assign(head.style,{left:seat.x-25+'px',top:seat.y-25+'px'});art.append(head);
    const b=button(illustration,'attack-story-player','',()=>{if(i===0)return;selected=i;refresh();});b.dataset.player=i;
    Object.assign(b.style,{left:seat.x-25+'px',top:seat.y-25+'px'});if(i===0)b.disabled=true;return b;
   });
  }
  buildPlayers();
  const cardArea=make('div','attack-story-cards',root);cardArea.setAttribute('role','group');cardArea.setAttribute('aria-label',index===1?'무기 카드 선택':'거리 효과 카드 선택');
  const cardSource=key=>window.BANG_CARDS.find(c=>c.name.replace(/^\d+_/,'')===key)?.src;
  let cards=[];
  if(index===1){
   cards=lesson.weapons.map(([key,label,range])=>{
    const b=button(cardArea,'attack-story-card','',()=>{state.weapon=key;refresh();});b.dataset.weapon=key;
    img(b,key==='colt'?'assets/source/step4-colt45-player-mat.png':cardSource(key),'',label);make('span','',b,key==='colt'?'기본 총':label);make('span','attack-story-card-range',b,'사정거리 '+range);return b;
   });
  }else if(index===2){
   cards=[['scope','mirino','조준경'],['mustang','mustang','야생마']].map(([key,card,label])=>{
    const b=button(cardArea,'attack-story-card','',()=>{effect=effect===key?null:key;state.scope=effect==='scope';state.ownMustang=effect==='mustang';refresh();});b.dataset.effect=key;img(b,cardSource(card),'',label);make('span','',b,label);return b;
   });
  }
  const dialogue=make('section','attack-story-dialogue',root);dialogue.setAttribute('aria-label','장면 설명');
  const copy=make('div','attack-story-copy',dialogue);copy.setAttribute('role','status');copy.setAttribute('aria-live','polite');copy.setAttribute('aria-atomic','true');
  const text=make('p','attack-story-text',copy),note=make('p','attack-story-note',copy);
  const navigation=make('nav','attack-story-navigation',dialogue);navigation.setAttribute('aria-label','이전 장면과 다음 장면');
  const prev=button(navigation,'attack-story-prev','',()=>back(index?scenes[index-1][0]:'attack-introduction'));prev.setAttribute('aria-label','이전 장면');make('span','',prev,'뒤로<');
  const next=button(navigation,'attack-story-next','',()=>go(index<2?scenes[index+1][0]:'range-summary'));next.setAttribute('aria-label',index<2?'다음 장면':'거리와 사정거리 정리로 이동');make('span','',next,'>클릭!');
  function refresh(){
   const weapon=lesson.weapons.find(w=>w[0]===state.weapon),reverse=index===2&&effect==='mustang';
   const value=i=>distance(state,reverse?0:i,reverse?i:0,seats.length);
   countSelect.value=String(playerCount);
   players.forEach((b,i)=>{
    const d=i?value(i):null;b.replaceChildren();make('span','attack-story-player-name',b,seats[i].label);if(i)make('span','attack-story-player-distance',b,String(d.effective));
    b.classList.toggle('is-selected',i===selected);b.classList.toggle('is-reachable',index===1&&i!==0&&d.canAttack);b.classList.toggle('is-changed',index===2&&i!==0&&d.effective!==d.base);
    b.setAttribute('aria-pressed',String(i===selected));b.setAttribute('aria-label',i?`${seats[i].label}, ${reverse?'나를 보는 ':''}거리 ${d.effective}${index===1?d.canAttack?', 공격 가능':', 사정거리 밖':''}`:'나 · 공격하는 플레이어');
   });
   cards.forEach(b=>b.setAttribute('aria-pressed',String(index===1?b.dataset.weapon===state.weapon:b.dataset.effect===effect)));
   path.setAttribute('points','');if(selected!==null){const d=distance(state,selected,0,seats.length),sign=d.clockwise<=d.counterclockwise?1:-1,points=[];for(let i=0;i<=d.base;i++){const seat=seats[(i*sign+seats.length)%seats.length];points.push(`${seat.x},${seat.y}`);}if(reverse)points.reverse();path.setAttribute('points',points.join(' '));}
   if(index===0){
    text.textContent=selected===null?'양옆은 거리 1, 한 사람 건너면 거리 2예요.':`${seats[selected].label}까지 거리 ${value(selected).base}예요.\n두 방향 중 짧은 쪽으로 세어요.`;
    note.textContent='사람을 눌러 거리와 경로를 확인해요.';
   }else if(index===1){
    const name=weapon[0]==='colt'?'기본 총':weapon[1];
    text.textContent=selected===null?`${name}의 사정거리는 ${weapon[2]}이에요.\n거리 ${weapon[2]}까지 뱅!으로 공격할 수 있어요.`:`상대까지 거리 ${value(selected).effective}, 총의 사정거리 ${weapon[2]}.\n${value(selected).canAttack?'뱅!으로 공격할 수 있어요.':'총이 닿지 않아 공격할 수 없어요.'}`;
    note.textContent='거리 ≤ 사정거리면 공격 가능!\n총을 바꿔도 상대까지 거리는 그대로예요.';
   }else if(effect==='scope'){
    text.textContent=selected===null?'조준경: 내가 상대를 보는 거리 −1.':`조준경으로 내가 ${seats[selected].label}를 보는 거리는 ${value(selected).effective}.`;
    note.textContent='내가 보는 거리만 줄어요. 최소 거리는 1이에요.';
   }else if(effect==='mustang'){
    text.textContent=selected===null?'야생마: 상대가 나를 보는 거리 +1.':`야생마로 ${seats[selected].label}가 나를 보는 거리는 ${value(selected).effective}.`;
    note.textContent='상대가 보는 거리만 늘어요.\n내가 상대를 보는 거리는 그대로예요.';
   }else{
    text.textContent='조준경은 내가 상대를 더 가깝게,\n야생마는 상대가 나를 더 멀게 보게 해요.';
    note.textContent='카드를 하나씩 눌러 숫자 변화를 비교해요.';
   }
  }
  refresh();return root;
 }
 window.BangAttackStory={render,distance,seatsFor};
})();
