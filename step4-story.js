/* STEP 4 only: the same illustrated scene + dialogue rhythm as STEP 1–3. */
(() => {
 const scenes=[['140:427','플레이어 간 거리'],['attack-range','무기 사정거리'],['attack-effects','특별한 거리 규칙']];
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
  if(id==='attack-introduction'){
   const root=render(stage,'140:427',{go,openMenu,back});root.dataset.scene='range-introduction';
   root.querySelector('.attack-story-player-count').remove();root.querySelector('.attack-story-illustration').remove();
   root.querySelector('.attack-story-text').textContent="'뱅!'과 '강탈!' 카드를 원하는 상대에게 사용하기 위해선 사정거리를 확인해야 합니다. 그럼 그 사정거리에 대해 알아볼까요?";
   root.querySelector('.attack-story-note').remove();
   const area=root.querySelector('.attack-story-cards');area.setAttribute('aria-label','뱅!과 강탈! 카드');
   for(const [key,label]of [['bang','뱅!'],['panico','강탈!']]){
    const card=make('div','attack-story-card',area);img(card,window.BANG_CARDS.find(c=>c.name.replace(/^\d+_/,'')===key).src,'',label);make('span','',card,label);
   }
   root.querySelector('.attack-story-next').onclick=()=>go('140:427');return root;
  }
  if(['attack-draw','attack-draw-examples'].includes(id))return window.BangJudgmentLesson.render(stage,{go,openMenu,back},id);
  const lesson=window.BangFieldLesson,index=scenes.findIndex(s=>s[0]===id);
  let seats=seatsFor(playerCount,lesson.seats),players=[];
  const state={target:1,weapon:'colt',scope:false,ownMustang:false,mustangs:new Set(),eliminated:new Set()};
  let selected=null,effect=null;
  const root=make('section','field-lesson attack-story',stage);root.dataset.scene=String(index+1);
  img(root,'assets/intro-wood.png','field-wood');img(root,'assets/intro-paper.png','field-paper');img(root,'assets/frame.png','field-frame');
  const menu=button(root,'field-menu','',openMenu);menu.setAttribute('aria-label','목차 열기');menu.innerHTML='<img src="assets/learning/0a3d10c2-d2f3-4d00-b8a6-9dace2b6209f.svg" alt="">';
  make('p','field-step-label',root,'Step 4 : 사정거리');
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
  const prev=button(navigation,'attack-story-prev','',()=>index?go(scenes[index-1][0]):back());prev.setAttribute('aria-label','이전 장면');make('span','',prev,'뒤로<');
  const next=button(navigation,'attack-story-next','',()=>go(index<2?scenes[index+1][0]:'attack-draw'));next.setAttribute('aria-label',index<2?'다음 장면':'판정 설명으로 이동');make('span','',next,'>클릭!');
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
    text.textContent=selected===null?`${playerCount}인 게임에서 양옆 플레이어는 거리 1입니다.\n가장 먼 플레이어까지의 거리는 ${Math.floor(playerCount/2)}입니다.`:`${seats[selected].label}까지의 거리는 ${value(selected).base}입니다.\n시계·반시계 방향 중 짧은 경로로 계산합니다.`;
    note.textContent='시계·반시계 방향 중 짧은 경로로 계산합니다.\n플레이어를 눌러 거리를 확인합니다.';
   }else if(index===1){
    if(selected!==null){const d=value(selected);text.textContent=`${weapon[0]==='colt'?'기본 총':weapon[1]}의 사정거리는 ${weapon[2]}입니다.\n${seats[selected].label}(거리 ${d.effective})${d.canAttack?'는 공격할 수 있습니다.':'는 사정거리 밖이므로 공격할 수 없습니다.'}`;}
    else text.textContent=weapon[0]==='colt'?'무기를 장착하지 않으면 기본 사정거리는 1로,\n양옆 플레이어만 공격할 수 있습니다.':`${weapon[1]}을 장착하면 사정거리 ${weapon[2]}까지\n뱅!으로 공격할 수 있습니다.`;
    note.textContent=`${playerCount}인 배치에서 공격 가능한 상대는 ${seats.filter((_,i)=>i&&value(i).canAttack).length}명입니다.\n무기는 플레이어 사이의 거리를 바꾸지 않습니다.`;
   }else if(effect==='scope'){
    text.textContent=selected===null?`${playerCount}인 배치에서 조준경은 내가 보는 거리를\n1 줄입니다. 최소 거리는 1입니다.`:`조준경을 장착하면 내가 ${seats[selected].label}를 보는 거리는\n${value(selected).effective}입니다. 최소 거리는 1입니다.`;
    note.textContent='숫자는 내가 상대를 보는 거리입니다.\n탈락한 플레이어는 거리 계산에서 제외합니다.';
   }else if(effect==='mustang'){
    text.textContent=selected===null?`${playerCount}인 배치에서 야생마를 장착하면\n다른 사람이 나를 보는 거리가 1 증가합니다.`:`${seats[selected].label}가 나를 보는 거리는 ${value(selected).effective}입니다.\n내가 ${seats[selected].label}를 보는 거리는 ${distance(state,selected,0,seats.length).effective}로 유지됩니다.`;
    note.textContent='숫자는 상대가 나를 보는 거리입니다.\n탈락한 플레이어는 거리 계산에서 제외합니다.';
   }else{
    text.textContent=`${playerCount}인 배치에서 거리 변경 효과를 비교합니다.\n조준경과 야생마는 플레이어 사이의 거리를 바꿉니다.`;
    note.textContent='카드를 눌러 적용 방향을 확인합니다.\n탈락한 플레이어는 거리 계산에서 제외합니다.';
   }
  }
  refresh();return root;
 }
 window.BangAttackStory={render,distance,seatsFor};
})();
