/* STEP 4–5 reference tools only. No dependency on the original game simulation. */
(() => {
 const topics=[['140:427','기본 거리'],['attack-range','무기 사정거리'],['attack-effects','거리 변경 효과'],['tips-end','보안관 전략'],['tips-rules','부관 전략'],['tips-special','무법자 전략'],['tips-roles','배신자 전략'],['tips-mind','공통 심리전']];
 const frames=topics.map(([id,label],i)=>({id,name:`Step ${i<3?4:5} : ${label}`,step:i<3?4:5,y:i<3?6000:8000,text:[`Step ${i<3?4:5} : ${label}`],links:[]}));
 frames.push({id:'attack-introduction',name:'Step 4 : 사정거리',step:4,y:5900,text:['Step 4 : 사정거리'],links:[]});
 frames.push({id:'attack-draw-examples',name:'Step 4 : 판정 예시',step:4,y:6100,text:['Step 4 : 판정'],links:[]});
 frames.push({id:'attack-draw',name:'Step 4 : 판정',step:4,y:6000,text:['Step 4 : 판정'],links:[]});
 const weapons=[['colt','콜트 .45',1,null],['volcanic','볼캐닉',1,'03_volcanic'],['schofield','스코필드',2,'07_schofield'],['remington','레밍턴',3,'05_remington'],['carabine','카빈',4,'06_carabine'],['winchester','윈체스터',5,'09_winchester']];
 // Exact five-seat arrangement from cached Figma frame 131:1268 (STEP 1 overall setup).
 const seats=[
  {label:'나',x:203,y:426,head:'131:1302',board:'131:1307',hand:'136:98'},
  {label:'A',x:88,y:337,head:'131:1303',board:'131:1305',hand:'136:67'},
  {label:'B',x:133,y:220,head:'131:1299',board:'131:1310',hand:'136:113'},
  {label:'C',x:266,y:220,head:'131:1300',board:'131:1309',hand:'136:108'},
  {label:'D',x:319,y:337,head:'131:1301',board:'131:1308',hand:'136:103'}
 ];
 const state={target:1,weapon:'colt',scope:false,ownMustang:false,mustangs:new Set(),eliminated:new Set()};
 function distance(s,target,from=0){
  const alive=seats.map((_,i)=>i).filter(i=>!s.eliminated.has(i));
  if(from===target||!alive.includes(from)||!alive.includes(target))return null;
  const a=alive.indexOf(from),b=alive.indexOf(target),clockwise=(b-a+alive.length)%alive.length,counterclockwise=alive.length-clockwise;
  const base=Math.min(clockwise,counterclockwise);
  const scope=from===0&&s.scope?1:0,mustang=target===0?(s.ownMustang?1:0):(s.mustangs.has(target)?1:0);
  const effective=Math.max(1,base+mustang-scope);
  const range=from===0?(weapons.find(w=>w[0]===s.weapon)?.[2]||1):1;
  return {base,clockwise,counterclockwise,effective,scope,mustang,range,canAttack:effective<=range};
 }
 const tips={
  'tips-end':{title:'턴 종료 전 확인',lines:['손패는 현재 생명력 이하로 남깁니다. 초과한 만큼 버립니다.','카드를 반드시 사용할 필요는 없습니다. 손패를 전부 사용할 필요도 없습니다.'],details:[['손패 제한을 확인하는 시점','턴 중간에는 현재 생명력보다 많은 카드를 보유할 수 있습니다. 예를 들어 생명력 3, 손패 5장으로 턴을 마치면 두 장을 버립니다.'],['최대 생명력과 구분','손패 제한은 인물 카드의 인쇄 숫자나 최대 생명력이 아니라 지금 남은 생명력입니다.']],cards:[['bang','뱅!'],['birra','맥주']]},
  'tips-rules':{title:'자주 놓치는 규칙',lines:['뱅!은 기본적으로 자신의 턴에 한 장만 사용합니다.','같은 이름의 파란색 카드는 자기 앞에 중복 장착할 수 없습니다.','무기는 하나만 장착합니다. 새 무기를 놓으면 기존 무기를 버립니다.'],details:[['뱅! 사용 횟수의 예외','볼캐닉을 장착했거나 윌리 더 키드라면 여러 장 사용할 수 있습니다. 사정거리는 그대로 지킵니다. 기관총·결투는 뱅! 카드가 아니며, 결투·인디언에 대응해 버린 뱅!도 일반 공격 사용 횟수에 포함되지 않습니다.'],['서로 다른 장착 카드는 함께 사용','통과 야생마처럼 이름이 다르면 함께 장착할 수 있습니다. 주르도네의 능력과 실제 통처럼 인물 능력이 주는 효과는 같은 이름의 카드 두 장을 놓는 행동과 구분합니다.']],cards:[['volcanic','볼캐닉'],['willythekid','윌리 더 키드'],['barile','통']]},
  'tips-special':{title:'헷갈리는 특수 상황',lines:['감옥과 다이너마이트가 함께 있다면 다이너마이트부터 판정합니다.','마지막 생명력을 잃는 즉시 맥주로 생존할 수 있습니다. 생존자가 두 명이면 맥주는 효과가 없습니다.','보안관이 부관을 제거하면 보안관의 손패와 장착 카드를 모두 버립니다.'],details:[['판정은 카드 뽑기 전에 처리','다이너마이트를 먼저 판정하고 생존했다면 감옥을 별도로 판정합니다. 감옥에서 탈출하지 못하면 감옥을 버리고 턴을 건너뜁니다. 앞서 처리한 다이너마이트 결과는 취소되지 않습니다.'],['맥주로 생존하는 조건','상대 턴에는 마지막 생명력을 잃는 순간에만 사용할 수 있습니다. 피해가 현재 생명력보다 크면 필요한 만큼 여러 장을 즉시 사용해 생명력이 1 이상이 되어야 합니다. 최대 생명력은 넘기지 못합니다. 두 명이 남았을 때도 카드를 낼 수는 있지만 회복하지 못하므로 생존 수단이 되지 않습니다.'],['탈락 책임자가 없는 경우','다이너마이트 피해에는 책임 플레이어가 없습니다. 폭발로 부관이 탈락했다고 보안관에게 벌칙을 주지 않으며, 무법자 처치 보상도 없습니다.']],cards:[['prigione','감옥'],['dinamite','다이너마이트'],['birra','맥주'],['sceriffo','보안관']]}
 };
 const roleTips=[
  {key:'sceriffo',label:'보안관',copy:'다른 플레이어의 행동을 살피며 부관을 실수로 제거하지 않도록 주의합니다.',rule:'모든 무법자와 배신자가 탈락해야 승리합니다. 부관을 제거하면 자신의 손패와 장착 카드를 전부 버립니다.'},
  {key:'vice',label:'부관',copy:'보안관을 보호하면서 무법자와 배신자를 견제합니다.',rule:'보안관과 같은 팀입니다. 자신이 먼저 탈락했더라도 보안관 팀이 승리하면 함께 승리합니다.'},
  {key:'fuorilegge',label:'무법자',copy:'보안관을 탈락시키는 것이 목표입니다. 다른 무법자와의 불필요한 소모전을 줄입니다.',rule:'보안관이 탈락할 때 배신자 혼자만 남는 경우를 제외하면 무법자 팀이 승리합니다. 누가 보안관을 제거했는지는 관계없습니다.'},
  {key:'rinnegato',label:'배신자',copy:'다른 플레이어들을 먼저 탈락시키고, 마지막에 보안관과 맞서도록 상황을 조절합니다.',rule:'자신만 살아남아야 승리합니다. 다른 사람이 남았는데 보안관이 먼저 탈락하면 게임이 끝나고 무법자 팀이 승리합니다.'}
 ];
 let selectedRole=0;
 const make=(tag,cls,parent,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;parent.append(n);return n;};
 const button=(parent,label,action,cls='field-text-button')=>{const n=make('button',cls,parent,label);n.type='button';n.onclick=action;return n;};
 function image(parent,src,cls,alt=''){const n=make('img',cls,parent);n.src=src;n.alt=alt;n.draggable=false;return n;}
 function cardSource(key){return window.BANG_CARDS.find(c=>c.name.replace(/^\d+_/,'')===key)?.src;}
 function cardLink(parent,key,label){const i=window.BANG_CARDS.findIndex(c=>c.name.replace(/^\d+_/,'')===key);return button(parent,label+' ›',()=>window.BangRouter.go(window.BANG_FIGMA_FLOW.cards,{card:i}),'field-card-link');}
 function detail(parent,title,copy){const n=make('details','field-detail',parent);make('summary','',n,title);make('p','',n,copy);return n;}
 function render(stage,id,{go,openMenu,back}){
  if(['attack-introduction','140:427','attack-range','attack-effects','attack-draw','attack-draw-examples'].includes(id))return window.BangAttackStory.render(stage,id,{go,openMenu,back});
  if(['tips-end','tips-rules','tips-special','tips-roles','tips-mind'].includes(id))return window.BangTipsStory.render(stage,id,{go,openMenu,back});
  const index=topics.findIndex(t=>t[0]===id),step=index<3?4:5;
  const root=make('section','field-lesson field-step-'+step,stage);
  image(root,'assets/intro-wood.png','field-wood');image(root,'assets/intro-paper.png','field-paper');image(root,'assets/frame.png','field-frame');
  const menu=button(root,'',openMenu,'field-menu');menu.setAttribute('aria-label','목차 열기');menu.innerHTML='<img src="assets/learning/0a3d10c2-d2f3-4d00-b8a6-9dace2b6209f.svg" alt="">';
  make('p','field-step-label',root,`Step ${step} : ${step===4?'공격 대상':'실전 Tip'}`);
  make('h1','field-title',root,step===4?'사정거리와 판정':'초보자들을 위한 Tip!');
  const nav=make('nav','field-tabs',root);nav.setAttribute('aria-label',`STEP ${step} 소주제`);
  topics.slice(step===4?0:3,step===4?3:7).forEach(([to,label])=>{const b=button(nav,label,()=>go(to),'field-tab');if(to===id)b.setAttribute('aria-current','page');});
  const body=make('div','field-body',root);body.setAttribute('role','region');body.setAttribute('aria-label',topics[index][1]);body.tabIndex=0;
  if(step===4)renderAttack(body,id);else renderTips(body,id);
  const footer=make('nav','field-footer',root);footer.setAttribute('aria-label','이전 화면과 STEP 이동');
  button(footer,'뒤로<',back,'field-footer-back');button(footer,step===4?'STEP 5로 >':'STEP 목차 >',()=>go(step===4?'tips-end':window.BANG_FIGMA_FLOW.menu),'field-footer-next');
  return root;
 }
 function renderAttack(body,id){
  make('p','field-instruction',body,'플레이어를 선택해 거리와 공격 가능 여부를 확인합니다.');
  const tableWindow=make('div','field-table-window',body);const scene=make('div','field-table-scene',tableWindow);scene.setAttribute('aria-label','기존 Figma의 5인 배치 예시');
  const art=make('div','field-table-art',scene);art.setAttribute('aria-hidden','true');
  const template=document.createElement('template');template.innerHTML=window.BANG_LEARNING_SCENES.scenes['131:1268'];
  const clones=new Map();for(const key of ['131:1285',...seats.flatMap(s=>[s.head,s.board,s.hand])]){
   const src=template.content.querySelector(`[data-node-id="${key}"]`);if(!src)continue;const clone=src.cloneNode(true);clone.querySelectorAll('[data-node-id]').forEach(n=>n.removeAttribute('data-node-id'));clone.removeAttribute('data-node-id');art.append(clone);clones.set(key,clone);
  }
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 390 300');svg.classList.add('field-path');svg.setAttribute('aria-hidden','true');scene.append(svg);
  const path=document.createElementNS('http://www.w3.org/2000/svg','polyline');svg.append(path);
  const seatButtons=seats.map((seat,i)=>{const b=button(scene,'',()=>{if(i===0)return;state.target=i;refresh();},'field-seat');b.dataset.seat=i;Object.assign(b.style,{left:seat.x-25+'px',top:seat.y-175-25+'px'});return b;});
  const status=make('div','field-distance-status',body);status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
  const heading=make('h2','',status),calculation=make('p','',status),direction=make('p','field-small',status);
  const controls=make('section','field-controls',body);let weaponButtons=[],effectButtons=[];
  if(id==='attack-range'){
   make('h2','field-section-title',controls,'장착 무기');
   const list=make('div','field-weapon-list',controls);list.setAttribute('role','group');list.setAttribute('aria-label','장착 무기 선택');
   weaponButtons=weapons.map(([key,label,range,card])=>{const b=button(list,'',()=>{state.weapon=key;refresh();},'field-weapon');b.dataset.weapon=key;image(b,card?window.BANG_CARDS.find(c=>c.name===card).src:'assets/source/16a27dfc6ee4.png','',label);make('span','',b,label);make('span','field-small',b,'사정거리 '+range);return b;});
   make('p','field-note',controls,'무기는 공격 사정거리를 정합니다. 플레이어 사이의 거리 자체를 바꾸지는 않습니다.');
  }else if(id==='attack-effects'){
   make('h2','field-section-title',controls,'거리 효과 비교');const list=make('div','field-effect-list',controls);
   effectButtons=[['scope','mirino','내 조준경'],['target','mustang','상대 야생마'],['own','mustang','내 야생마']].map(([key,card,label])=>{const b=button(list,'',()=>{if(key==='scope')state.scope=!state.scope;else if(key==='own')state.ownMustang=!state.ownMustang;else if(state.mustangs.has(state.target))state.mustangs.delete(state.target);else state.mustangs.add(state.target);refresh();},'field-effect');b.dataset.effect=key;image(b,cardSource(card),'',label);make('span','',b,label);return b;});
   make('p','field-note',controls,'조준경은 내가 보는 거리를 1 줄입니다(최소 1). 야생마는 다른 사람이 장착자를 보는 거리를 1 늘립니다.');
   const reverse=make('p','field-reverse',controls);reverse.dataset.reverse='';
  }else{
   make('p','field-note',controls,'양옆 플레이어는 거리 1입니다. 시계·반시계 방향 중 더 짧은 경로를 사용하며, 탈락자는 계산에서 제외합니다.');
   make('p','field-small',controls,'5인 배치 예시입니다. 탭을 바꿔도 무기와 거리 효과 설정은 유지됩니다.');
  }
  const actions=make('div','field-actions',body);
  const elimination=button(actions,'',()=>{const i=state.target;if(state.eliminated.has(i))state.eliminated.delete(i);else if(state.eliminated.size<3)state.eliminated.add(i);else{direction.textContent='거리 비교를 위해 최소 두 명을 남깁니다.';return;}refresh();},'field-action');elimination.dataset.elimination='';
  button(actions,'설정 초기화',()=>{state.target=1;state.weapon='colt';state.scope=false;state.ownMustang=false;state.mustangs.clear();state.eliminated.clear();refresh();},'field-action');
  detail(body,'공격 가능 표시와 실제 카드 사용','표시는 뱅!의 거리 조건만 확인합니다. 실제 공격은 자신의 카드 사용 단계에 하며 기본적으로 한 턴에 한 장입니다. 볼캐닉과 윌리 더 키드는 사용 횟수의 예외입니다. 다른 인물 능력이나 추가 거리 효과가 있다면 별도로 반영해야 합니다.');
  function refresh(){
   const selected=distance(state,state.target),weapon=weapons.find(w=>w[0]===state.weapon);
   seats.forEach((seat,i)=>{
    const dead=state.eliminated.has(i),d=distance(state,i);const b=seatButtons[i];b.replaceChildren();make('span','field-seat-name',b,seat.label);make('span','field-seat-distance',b,i===0?'':dead?'탈락':String(d.effective));
    b.classList.toggle('is-target',i===state.target);b.classList.toggle('is-eliminated',dead);b.classList.toggle('is-reachable',i!==0&&!!d?.canAttack);b.setAttribute('aria-pressed',String(i===state.target));b.setAttribute('aria-label',i===0?'나':`${seat.label}, ${dead?'탈락':`거리 ${d.effective}, ${d.canAttack?'공격 가능':'사정거리 밖'}`}`);
    for(const key of [seat.head,seat.board,seat.hand]){const node=clones.get(key);if(node)node.style.opacity=dead?'.2':'1';}
   });
   heading.textContent=selected?`${seats[state.target].label} · 거리 ${selected.effective} · ${selected.canAttack?'공격 가능':'사정거리 밖'}`:`${seats[state.target].label} · 탈락한 플레이어`;
   status.classList.toggle('is-reachable',!!selected?.canAttack);
   calculation.textContent=selected?`기본 ${selected.base}${selected.mustang?' + 야생마 1':''}${selected.scope?' − 조준경 1':''} → 거리 ${selected.effective} / ${weapon[1]} 사정거리 ${weapon[2]}`:'탈락한 플레이어는 공격 대상과 거리 계산에서 제외합니다.';
   direction.textContent=selected?`시계 ${selected.clockwise} / 반시계 ${selected.counterclockwise} · 숫자는 적용 후 거리입니다.`:'';
   elimination.textContent=state.eliminated.has(state.target)?`${seats[state.target].label} 복귀`:`${seats[state.target].label} 탈락 적용`;
   weaponButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.weapon===state.weapon)));
   effectButtons.forEach(b=>{const on=b.dataset.effect==='scope'?state.scope:b.dataset.effect==='own'?state.ownMustang:state.mustangs.has(state.target);b.setAttribute('aria-pressed',String(on));b.disabled=b.dataset.effect==='target'&&state.eliminated.has(state.target);});
   const reverse=controls.querySelector('[data-reverse]');if(reverse){const d=distance(state,0,state.target);reverse.textContent=d?`${seats[state.target].label}가 나를 보는 거리: ${d.effective} (상대의 다른 거리 효과는 없는 기준입니다.)`:'복귀시키거나 다른 플레이어를 선택해 비교합니다.';}
   path.setAttribute('points','');if(selected){const alive=seats.map((_,i)=>i).filter(i=>!state.eliminated.has(i));const start=alive.indexOf(0),step=selected.clockwise<=selected.counterclockwise?1:-1,steps=selected.base;const points=[];for(let i=0;i<=steps;i++){const seat=seats[alive[(start+i*step+alive.length)%alive.length]];points.push(`${seat.x},${seat.y-175}`);}path.setAttribute('points',points.join(' '));}
  }
  refresh();
 }
 function renderTips(body,id){
  if(id==='tips-roles'){
   make('h2','field-section-title',body,'역할별 실전 팁');const list=make('div','field-role-list',body);list.setAttribute('aria-label','역할 선택');
   const copy=make('section','field-role-copy',body);const buttons=roleTips.map((role,i)=>{const b=button(list,'',()=>{selectedRole=i;show();},'field-role');image(b,cardSource(role.key),'',role.label);make('span','',b,role.label);return b;});
   function show(){const role=roleTips[selectedRole];buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selectedRole)));copy.replaceChildren();make('h3','',copy,role.label);make('p','field-role-tip',copy,role.copy);make('p','',copy,role.rule);detail(copy,'생존과 팀 승리의 구분','보안관·부관과 무법자는 역할에 따른 팀 승리를 따릅니다. 먼저 탈락했더라도 자기 팀이 승리하면 함께 승리합니다. 배신자는 다른 모든 사람이 탈락하고 자신만 살아남아야 합니다.');cardLink(copy,role.key,role.label+' 카드 설명');}
   show();return;
  }
  const tip=tips[id];make('h2','field-section-title',body,tip.title);const list=make('ul','field-tip-list',body);tip.lines.forEach(line=>make('li','',list,line));
  tip.details.forEach(([title,copy])=>detail(body,title,copy));
  const links=make('nav','field-card-links',body);links.setAttribute('aria-label','관련 카드 상세');tip.cards.forEach(([key,label])=>cardLink(links,key,label));
 }
 window.BangFieldLesson={frames,has:id=>frames.some(f=>f.id===id),render,distance,weapons,seats,state};
})();
