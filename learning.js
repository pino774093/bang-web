/* Latest Figma learning flow. The original simulation graph and data stay intact. */
(() => {
  const data=window.BANG_LEARNING_SCENES,flow=window.BANG_FIGMA_FLOW;
  const frames=new Map(data.frames.map(frame=>[frame.id,frame]));
  const introGoal=frames.get('8:330');
  frames.set('intro-goal',{...introGoal,id:'intro-goal',text:['서로의 역할을 추리하고 각자의 목표를 완수하세요!','> 클릭!']});
  frames.set('game-intro-one',{id:'game-intro-one',step:1,name:'게임 소개',text:['마피아 게임, 해본 적 있나요?','정체를 숨기고, 말과 행동으로 서로를 의심하는 게임.','BANG!에서는 그 심리전이 서부의 총격전으로 펼쳐집니다.','> 클릭!'],links:[{source:'intro-next',trigger:'ON_CLICK',to:'game-intro-two'}]});
  frames.set('game-intro-two',{id:'game-intro-two',step:1,name:'게임 소개',text:['누가 내 편인지 모른 채,\n총격전이 시작됩니다.','카드를 사용해 공격하고, 피하고, 서로를 돕습니다.','하지만 모두의 목표가 같지는 않습니다.','당신이 맡은 역할에 따라\n이기는 방법이 달라집니다.','> 역할 알아보기'],links:[{source:'intro-next',trigger:'ON_CLICK',to:'30:931'}]});
  // Confirmed learning continuation; retain the untouched Figma export as the audit source.
  const stepThreeEnd=frames.get('139:351');
  frames.set(stepThreeEnd.id,{...stepThreeEnd,links:stepThreeEnd.links.map(link=>link.to==='42:2064'?{...link,to:'attack-introduction'}:link)});
  for(const frame of window.BangTurnLesson.frames)frames.set(frame.id,frame);
  for(const id of ['turn-timing','turn-cautions'])frames.set(id,{id,name:'Step 4',step:3,text:[],links:[],redirect:'attack-introduction'});
  for(const frame of window.BangFieldLesson.frames)frames.set(frame.id,frame);
  frames.set('search-menu',{id:'search-menu',name:'카드&규칙 찾기',text:['카드&규칙 찾기'],links:[]});
  frames.set('search-situations',{id:'search-situations',name:'상황별 규칙',text:['상황별 규칙'],links:[]});
  // Extend only the isolated learning graph; the original simulation graph stays intact.
  const continueTo=(id,oldTarget,newTarget)=>{const f=frames.get(id);frames.set(id,{...f,links:f.links.map(l=>l.to===oldTarget?{...l,to:newTarget}:l)});};
  // Skip only the exported staggered reveal (Sheriff, then the other roles).
  // Keep the complete order: four-card overview, sequential role lessons,
  // then the clickable role explorer.
  const roleIntro=frames.get('30:931');
  frames.set('30:931',{...roleIntro,links:roleIntro.links.map(link=>link.to==='30:960'?{...link,to:'35:1260',transition:{type:'DISSOLVE',duration:0}}:link)});
  const roleCards=frames.get('30:960');
  frames.set('30:960',{...roleCards,links:roleCards.links.map(link=>link.trigger==='AFTER_TIMEOUT'?{...link,to:'35:1260',transition:{type:'DISSOLVE',duration:0}}:link)});
  // The Sheriff and Renegade facts from these scenes are consolidated in their
  // clickable card details, so skip the duplicate standalone scenes.
  continueTo('35:1114','35:1131','42:1728');
  continueTo('35:1374','35:1390','35:1406');
  frames.delete('35:1131');frames.delete('35:1390');
  continueTo('139:249','42:2064','139:265');
  continueTo('139:265','42:2064','attack-introduction');
  continueTo('139:265','139:351','attack-introduction');
  continueTo('139:236','42:2064','139:249');
  // Put the player-count and role-card-count page at the start of STEP 2.
  continueTo('124:909','8:398','8:489');
  // Personal setup: reveal Sheriff → life points → character bullets → Sheriff +1 → table setup.
  continueTo('8:330','8:398','intro-goal');
  continueTo('8:685','47:80','128:996');
  continueTo('128:996','47:80','128:1017');
  continueTo('128:1017','47:80','128:1063');
  const setupLast=frames.get('136:197');
  frames.set('setup-share-abilities',{...setupLast,id:'setup-share-abilities',step:2,text:['각자 가진 인물 카드의 능력이 무엇인지 다른 사람들과 공유합니다.','> 클릭!','Step 2 : 전체 세팅'],links:setupLast.links.map(link=>({...link,to:link.to==='42:1687'?'131:1124':link.to}))});
  continueTo('136:197','42:1687','setup-share-abilities');
  const menuIds=new Set(['94:60','124:745','131:1141']);
  const covers=new Set(['35:1427','42:1668','42:1687','42:1695','131:1124','131:1132']);
  const stepStarts=['game-intro-one','8:398','131:1124','attack-introduction','tips-role-select'];
  const titles=['어떤 게임일까?','게임을 준비해 볼까?','내 턴에는 뭘 해야할까?','사정거리와 판정','초보자들을 위한 Tip!'];
  const introStarts=['game-intro-one','42:1687','131:1124','step4-intro','step5-intro'];
  const introDefinitions=new Map([
    ['35:1427',{step:1,to:'game-intro-one'}],['42:1668',{step:1,to:'game-intro-one'}],
    ['42:1687',{step:2,to:'8:398'}],['42:1695',{step:2,to:'8:398'}],
    ['131:1124',{step:3,to:'131:1182'}],['131:1132',{step:3,to:'131:1182'}],
    ['step4-intro',{step:4,to:'attack-introduction'}],['step5-intro',{step:5,to:'tips-role-select'}]
  ]);
  for(const [id,info]of introDefinitions)if(!frames.has(id))frames.set(id,{id,step:info.step,name:'Step '+info.step,text:['Step '+info.step],links:[]});
  const homeFlow=frames.get(flow.home);if(homeFlow)homeFlow.links=homeFlow.links.map(link=>link.to==='35:1427'||link.to==='42:1687'?{...link,to:'game-intro-one'}:link);
  const contentsFlow=frames.get(flow.menu);if(contentsFlow)contentsFlow.links=contentsFlow.links.map(link=>link.to==='35:1427'?{...link,to:'game-intro-one'}:link.to==='42:1687'?{...link,to:'8:398'}:link);
  for(const id of ['94:185','94:200','94:224','94:248','94:272','35:1114','42:1728','35:1212','35:1228','35:1374','35:1406'])if(frames.has(id))frames.set(id,{...frames.get(id),step:1});
  for(const id of ['8:398','8:422','8:435','8:449','8:473','47:80','47:94','128:1041','124:909','8:489','8:501','8:514','8:540','8:566','8:581','124:980','8:685','128:1017','128:996','128:1063','136:12','136:37','131:1268','136:118','136:197','setup-share-abilities'])if(frames.has(id))frames.set(id,{...frames.get(id),step:2});
  const roleCopy={
    '94:200':['보안관','무법자와 배신자를 모두 탈락시키는 것이 목표입니다.\n역할을 처음부터 공개하지만, 다른 플레이어 중 누가 자신의 편인지는 모른 채 시작합니다.\n보안관은 체력이 1 더 많고 감옥에 갇히지 않습니다. 부관을 직접 제거하면 손패와 장비를 모두 잃습니다.'],
    '94:224':['부관','보안관과 같은 편으로, 보안관이 목표를 달성하도록 돕습니다.\n부관은 정체를 숨기며, 보안관도 누가 부관인지 처음부터 알지 못합니다.'],
    '94:248':['무법자','보안관을 탈락시키는 것이 목표입니다.\n무법자들은 목표를 공유하지만 서로의 정체를 처음부터 확인하지 않습니다. 보안관이 탈락했을 때 무법자가 남아 있으면, 누가 보안관을 탈락시켰든 무법자 팀이 승리합니다.'],
    '94:272':['배신자','마지막까지 혼자 살아남는 것이 목표입니다. 배신자는 무법자와 같은 편이 아닌 독립된 역할입니다.\n자신 외에 다른 플레이어가 남아 있는데 보안관이 먼저 탈락하면 무법자 팀이 승리하므로 목표를 달성할 수 없습니다.\n\n무법자는 보안관의 탈락이 목표, 배신자는 자신의 단독 생존이 목표입니다.']
  };
  for(const [id,[name,copy]]of Object.entries(roleCopy)){const f=frames.get(id);frames.set(id,{...f,step:1,roleName:name,roleCopy:copy,text:[copy,'> 상세 설명','Step 1 : 역할과 승리 조건'],links:f.links.filter(l=>l.source!=='8:258')});}
  const roleExplore=frames.get('94:185');
  frames.set('94:185',{...roleExplore,step:1,text:['역할을 탐색하세요!','> 카드를 선택해 상세 설명을 확인하세요.','> 역할 알아보기를 마쳤어요!'],links:roleExplore.links.filter(l=>!['94:189','94:190','94:191','94:192','94:195'].includes(l.source)).map(l=>l.source==='144:454'?{...l,to:'8:398'}:l)});
  const legacyRoleSequence=new Set(['30:931','30:960','35:1260','35:1114','42:1728','35:1212','35:1228','35:1374','35:1406']);
  for(const id of legacyRoleSequence){const f=frames.get(id);if(f)frames.set(id,{...f,step:1});}
  let pendingIntro=null,introAdvance=null,autoAdvanceCleanup=null;

  let active=null,timer=null,drawer=null,restoreFocus=null,menuInert=[],drawerCloseTimer=null,drawAnimations=[],drawerCleanup=null,mainContentsCleanup=null;
  const route=id=>id===flow.home||id===flow.menu?id:'learn:'+id;
  for(const frame of frames.values()){
    if(frame.id===flow.home||frame.id===flow.menu||frame.id===flow.cards||menuIds.has(frame.id))continue;
    flow.frames[route(frame.id)]={id:route(frame.id),name:frame.id.startsWith('139:')?'Step 3 : 내 턴':frame.text.find(t=>/^Step /.test(t))||frame.name,screenId:null,hotspots:[],automatic:[]};
  }
  window.BangRoleExplore.register(flow);
  const surface=document.createElement('main');surface.id='learning-screen';surface.className='reference-screen';surface.hidden=true;surface.inert=true;
  const stage=document.createElement('div');stage.className='design-stage learning-stage';surface.append(stage);document.querySelector('#app').append(surface);
  new ResizeObserver(()=>{stage.style.transform=`scale(${surface.clientWidth/390})`;}).observe(surface);
  function source(id){return id.startsWith('learn:')?id.slice(6):id;}
  function has(id){return id===flow.home||id===flow.menu||id?.startsWith('learn:');}
  function element(tag,cls,parent=stage){const n=document.createElement(tag);n.className=cls;parent.append(n);return n;}
  function normalizeStepLabels(step){for(const p of stage.querySelectorAll('p'))if(/^Step\s+\d+(?:\s*:|$)/i.test(p.textContent.trim()))p.textContent=p.textContent.replace(/^Step\s+\d+/i,'Step '+step);}
  let searchReturn=flow.home;
  try{searchReturn=sessionStorage.getItem('bang-search-return')||flow.home;}catch{}
  function go(id,options={}){
    if(id==='search-menu'){
      const current=window.BangRouter.current;
      if(current&&current!==flow.cards&&!['learn:search-menu','learn:search-situations'].includes(current)){
        searchReturn=current;try{sessionStorage.setItem('bang-search-return',current);}catch{}
      }
    }
    if(id==='140:427'&&active!=='step4-intro'&&(!active||stepFor(active)!==4))id='attack-introduction';
    const target=frames.get(id);
    const ordinary=key=>key&&key!==flow.home&&key!==flow.menu&&!key.startsWith('search-');
    if(target&&ordinary(id)&&!introDefinitions.has(id)&&!introDefinitions.has(active)){
      const nextStep=stepFor(id),previousStep=ordinary(active)?stepFor(active):null;
      if(nextStep!==previousStep){
        const intro=introStarts[nextStep-1];pendingIntro={intro,to:id};id=intro;
      }
    }
    closeMenu(false);return window.BangRouter.go(route(id),{action:{transitionType:'DISSOLVE'},...options});
  }
  function back(){
    closeMenu(false);
    if(history.state?.bang&&history.state.index>0)window.BangRouter.back();
    else go(flow.menu);
  }
  function message(text){stage.querySelector('.learning-message')?.remove();const n=element('p','learning-message');n.setAttribute('role','status');n.textContent=text;setTimeout(()=>n.remove(),4000);}
  function labelFor(frame,link){
    if(menuIds.has(link.to))return '목차 열기';
    if(frame.id===flow.home)return {'8:326':'처음부터 배우기','89:12':'카드&규칙 찾기','89:16':'게임 시뮬레이션'}[link.source];
    if(frame.id===flow.menu){const i=stepStarts.indexOf(link.to);return i>=0?'Step '+(i+1)+' '+titles[i]:'Step 4 준비 중';}
    return frame.text.find(t=>t.startsWith('>'))?.replace(/^>\s*/,'')||'다음 설명';
  }
  function bind(node,label,action){
    if(!node)return;
    node.removeAttribute('aria-disabled');node.inert=false;
    if(node.style.display==='contents'){
      const bounds=[...node.children].map(child=>child.getBoundingClientRect()).filter(r=>r.width&&r.height);
      if(bounds.length){
        const origin=stage.getBoundingClientRect(),scale=origin.width/390||1;
        const left=Math.max(origin.left,Math.min(...bounds.map(r=>r.left))),top=Math.max(origin.top,Math.min(...bounds.map(r=>r.top)));
        const right=Math.min(origin.right,Math.max(...bounds.map(r=>r.right))),bottom=Math.min(origin.top+844*scale,Math.max(...bounds.map(r=>r.bottom)));
        const overlay=element('button','learning-hotspot');overlay.type='button';
        Object.assign(overlay.style,{left:(left-origin.left)/scale+'px',top:(top-origin.top)/scale+'px',width:(right-left)/scale+'px',height:(bottom-top)/scale+'px'});
        node.classList.add('learning-control');bind(overlay,label,action);return overlay;
      }
    }
    if(node.tagName!=='BUTTON'){node.setAttribute('role','button');node.tabIndex=0;}
    node.setAttribute('aria-label',label);node.classList.add('learning-control');
    node.addEventListener('click',event=>{event.stopPropagation();if(node.dataset.suppressClick)return;action();});
    node.addEventListener('keydown',event=>{if(node.tagName!=='BUTTON'&&(event.key==='Enter'||event.key===' ')){event.preventDefault();event.stopPropagation();action();}});
    return node;
  }
  function find(id){return stage.querySelector(`[data-node-id="${id}"]`);}
  function roughFrame(){
    // The original PNG retains the hand-drawn border which generic CSS cannot reproduce.
    const border=[...stage.querySelectorAll('[style]')].find(n=>n.style.height==='810px'&&n.style.width==='359px'&&n.style.borderWidth==='20px');
    if(border){const img=document.createElement('img');img.src='assets/frame.png';img.alt='';img.className='learning-outer-frame';border.replaceWith(img);}
  }
  function decorateButtons(){
    if(active!==flow.home)return;
    for(const [id,x,y]of [['8:326',136,618],['89:12',136,684],['89:16',137,750]]){
      const group=find(id);if(!group)continue;
      for(const n of group.children)if(n.style.background)n.style.visibility='hidden';
      const img=document.createElement('img');img.src='assets/rules-decoration.svg';img.alt='';img.className='learning-home-button-art';
      Object.assign(img.style,{left:x+'px',top:y+'px',width:'183px',height:'66px'});group.prepend(img);
    }
  }
  const legacyRoleScreens={'94:185':'5:229','94:200':'35:1451','94:224':'42:1479','94:248':'42:1515','94:272':'42:1535'};
  function reuse(frame){
    const legacy=flow.frames[legacyRoleScreens[frame.id]||frame.id];
    if(!legacy)throw new Error('Missing learning frame '+frame.id);
    // Keep each original role-detail screen and its card entrance treatment.
    // Only the preceding role overview (35:1260) uses the four-card tableau.
    window.BangDesign.render(legacy.screenId);
    const old=document.querySelector('#reference-screen .design-stage');
    stage.replaceChildren(...[...old.childNodes].map(n=>n.cloneNode(true)));
    stage.querySelectorAll('.figma-interaction-layer,.design-copy,.design-back,.design-action,.design-panel').forEach(n=>n.remove());
    const detail=['94:200','94:224','94:248','94:272'].includes(frame.id);
    if(detail){
      const slot={'94:200':0,'94:224':1,'94:248':2,'94:272':3}[frame.id];
      stage.querySelector(`[data-screen-asset-index="${slot}"]`)?.remove();
    }
    const panel=element('div','learning-role-panel');panel.style.top=(detail?454:frame.id==='94:185'?592:584)+'px';
    const copy=element('p','learning-role-copy',panel);
    copy.textContent=frame.text.filter(t=>!t.startsWith('>')&&!/^Step /.test(t)&&t!=='<').join('\n');
    if(detail){copy.textContent=frame.text.find(t=>t.length>30).replace(/\u2028+/g,'\n');const heading=element('h2','learning-role-name',panel);heading.textContent=frame.text.find(t=>['보안관','부관','무법자','배신자'].includes(t));}
    const next=element(detail?'span':'button','learning-role-next',panel);if(!detail)next.type='button';next.textContent=frame.id==='94:185'?'> 다음 step으로 이동':'> 클릭!';
    const nextLink=frame.links.find(l=>l.to&&!menuIds.has(l.to)&&l.to!=='8:258'&&(frame.id!=='94:185'||l.to==='8:398'));
    if(nextLink&&!detail)bind(next,next.textContent,()=>follow(frame,nextLink));
    const menu=element('button','learning-menu-button');menu.type='button';menu.setAttribute('aria-label','목차 열기');
    const template=document.createElement('template');template.innerHTML=data.scenes['131:1182'];
    const icon=template.content.querySelector('[data-node-id="131:1190"]');if(icon)menu.innerHTML=icon.innerHTML;
    if(detail){menu.innerHTML='<img src="assets/back-vector.svg" alt="">';bind(menu,'역할 목록으로 돌아가기',()=>go('94:185'));}else bind(menu,'목차 열기',openMenu);
    const stepLabel=frame.text.find(t=>/^Step /.test(t));if(stepLabel){
      const header=element('div','learning-step-label');
      header.textContent=legacyRoleSequence.has(frame.id)?'Step 1 : 역할과 승리 조건':stepLabel;
      if(legacyRoleSequence.has(frame.id))Object.assign(header.style,{width:'220px',boxSizing:'border-box',whiteSpace:'nowrap'});
    }
    if(frame.id==='94:185'){
      panel.classList.add('learning-role-exploration');const hint=element('span','learning-role-hint',panel);hint.textContent='카드를 눌러 역할을 확인합니다.';
      const roleIds=['94:200','94:224','94:248','94:272'];
      const names=['sceriffo','vice','fuorilegge','rinnegato'];
      for(const [i,node]of [...stage.querySelectorAll('.design-card-target')].entries()){
        const card=window.BANG_CARDS.find(c=>c.name.replace(/^\d+_/,'')===names[i]);
        Object.assign(node.style,{left:(i%2?207:45)+'px',top:(i<2?84:328)+'px',width:'136px',height:'211px',transform:'none'});
        const image=node.querySelector('img');if(card)image.src=card.src;Object.assign(image.style,{left:'0',top:'0',width:'136px',height:'211px',transform:'none'});
        bind(node,['보안관','부관','무법자','배신자'][i],()=>go(roleIds[i]));
      }
    }
  }
  function follow(frame,link){
    if(menuIds.has(link.to)){openMenu();return;}
    if(frame.id===flow.home){
      if(link.to===flow.cards){go('search-menu');return;}
      if(link.to==='5:229'){window.BangMusic?.start();window.BangRouter.go('5:229');return;}
      window.BangMusic?.start();go(link.to);return;
    }
    // The unresolved Figma links below must never enter or modify the simulation.
    if(link.to==='42:2064'||link.to==='8:258'){message('이어서 볼 설명은 준비 중입니다. 목차에서 다른 STEP을 선택해 주세요.');return;}
    if(frames.has(link.to)){go(link.to,{replace:link.trigger==='AFTER_TIMEOUT'});return;}
    message('이어서 볼 설명은 준비 중입니다.');
  }
  function makeDialogueClickable(frame,controls){
    if(frame.id===flow.home||frame.id===flow.menu)return;
    const panels=[...stage.querySelectorAll('.learning-role-panel,[data-node-id]')].filter(n=>n.classList.contains('learning-role-panel')||(n.style.background==='#111'||n.style.background==='rgb(17, 17, 17)')&&n.style.borderRadius==='59px');
    const origin=stage.getBoundingClientRect(),scale=origin.width/390||1;
    for(const panel of panels){
      const rect=panel.getBoundingClientRect();
      const inside=n=>{const r=n.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;return x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom;};
      const next=panel.querySelector('button.learning-role-next');
      let link=frame.links.find(l=>l.trigger==='ON_CLICK'&&(frames.has(l.to)||l.to==='140:427')&&!menuIds.has(l.to)&&controls.get(l.source)&&inside(controls.get(l.source)));
      if(!link&&!next){
        if(panel.classList.contains('learning-role-panel'))link=frame.links.find(l=>l.trigger==='ON_CLICK'&&frames.has(l.to)&&!menuIds.has(l.to));
        else if(frame.id!=='8:398'){const auto=frame.links.find(l=>l.trigger==='AFTER_TIMEOUT'&&frames.has(l.to));if(auto)link={...auto,trigger:'ON_CLICK'};}
      }
      for(const copy of stage.querySelectorAll('p,.learning-role-copy'))if(inside(copy))copy.classList.add('learning-dialogue-copy');
      const hints=[...stage.querySelectorAll('p,.learning-role-next')].filter(n=>/^\s*[>›]\s*(?:클릭!|준비\s*했어요!|다음\s*step)/.test(n.textContent)&&inside(n));
      const hint=hints[0],hintRect=hint?.getBoundingClientRect(),hintStyle=hint?getComputedStyle(hint):null;
      const top=Math.max(0,(rect.top-origin.top)/scale),bottom=Math.min(844,(rect.bottom-origin.top)/scale),width=rect.width/scale;
      const rightX=hintRect?(hintRect.left+hintRect.width/2-rect.left)/scale:width-42;
      const roleNavigationOffset=legacyRoleSequence.has(frame.id)?10:0;
      const y=(hintRect?(hintRect.top+hintRect.height/2-origin.top)/scale-top:bottom-top-36)+roleNavigationOffset;
      for(const h of hints)h.style.visibility='hidden';
      const makeSide=(isBack,action)=>{
        const button=element('button',isBack?'learning-dialogue-back':'learning-dialogue-next');button.type='button';button.dataset.dialoguePanel=panel.dataset.nodeId||'reused';
        Object.assign(button.style,{left:(rect.left-origin.left)/scale+(isBack?0:width/2)+'px',top:top+'px',width:width/2+'px',height:Math.max(0,bottom-top)+'px',borderRadius:isBack?'59px 0 0 0':'0 59px 0 0'});
        const label=element('span','learning-dialogue-label',button);label.textContent=isBack?'뒤로<':frame.id==='124:909'?'>준비했어요!':'>클릭!';
        Object.assign(label.style,{left:(isBack?width-rightX:rightX-width/2)+'px',top:y+'px',color:hintStyle?.color||'#aa2e1b',fontSize:hintStyle?.fontSize||'14px'});
        bind(button,isBack?'이전 페이지':'다음 설명',action);return button;
      };
      makeSide(true,back);
      if(next||link)makeSide(false,()=>next?next.click():follow(frame,link));
    }
  }
  function prepareCardDraw(){
    if(active!=='139:236')return;
    delete stage.dataset.drawMotionPlayed;
    const animated=new URLSearchParams(location.search).get('review')!=='1'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    for(const id of ['139:301','139:302']){
      const card=find(id);if(!card)continue;
      card.classList.add('learning-drawn-card');
      if(animated)card.style.visibility='hidden';
    }
  }
  function playCardDraw(){
    if(active!=='139:236'||stage.dataset.drawMotionPlayed)return;
    stage.dataset.drawMotionPlayed='1';
    const cards=[...stage.querySelectorAll('.learning-drawn-card')];
    cards.forEach(card=>card.style.visibility='');
    if(new URLSearchParams(location.search).get('review')==='1'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const deck=find('139:247');if(!deck)return;
    const startX=parseFloat(deck.style.left)+parseFloat(deck.style.width)/2;
    const startY=parseFloat(deck.style.top)+parseFloat(deck.style.height)*.35;
    cards.forEach((card,i)=>{
      const dx=startX-parseFloat(card.style.left)-parseFloat(card.style.width)/2;
      const dy=startY-parseFloat(card.style.top)-parseFloat(card.style.height)/2;
      const animation=card.animate([
        {transform:`translate(${dx}px,${dy}px) scale(.68) rotate(-7deg)`,opacity:0,offset:0},
        {transform:`translate(${dx}px,${dy+18}px) scale(.7) rotate(-5deg)`,opacity:1,offset:.12},
        {transform:`translate(${dx*.35}px,${dy*.42}px) scale(.9) rotate(${i?5:-4}deg)`,opacity:1,offset:.58},
        {transform:'translate(0,0) scale(1) rotate(0deg)',opacity:1,offset:1}
      ],{duration:850,delay:100+i*210,easing:'cubic-bezier(.22,.65,.28,1)',fill:'both'});
      drawAnimations.push(animation);
    });
  }
  function prepareCardUse(){
    if(active!=='139:249')return;
    find('139:326')?.remove();
    delete stage.dataset.useMotionPlayed;
    find('139:318')?.classList.add('learning-used-card');
  }
  function playCardUse(){
    if(active!=='139:249'||stage.dataset.useMotionPlayed)return;
    stage.dataset.useMotionPlayed='1';
    if(new URLSearchParams(location.search).get('review')==='1'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const card=find('139:318'),board=find('139:264');if(!card||!board)return;
    const x=parseFloat(card.style.left)+parseFloat(card.style.width)/2;
    const y=parseFloat(card.style.top)+parseFloat(card.style.height)/2;
    // Colt .45 is printed inside the original board image's weapon slot.
    const targetX=parseFloat(board.style.left)+parseFloat(board.style.width)*.82-4;
    const targetY=parseFloat(board.style.top)+parseFloat(board.style.height)*.63;
    const lifted=`translate(${195-x}px,-145px)`;
    // 500 ms to lift, 1000 ms stationary, 850 ms to equip over the printed Colt .45.
    const animation=card.animate([
      {transform:'translate(0,0)',offset:0},
      {transform:lifted,offset:500/2350,easing:'linear'},
      {transform:lifted,offset:1500/2350,easing:'cubic-bezier(.35,0,.25,1)'},
      {transform:`translate(${targetX-x}px,${targetY-y}px) rotate(5deg) scale(1.08)`,offset:1}
    ],{duration:2350,delay:200,easing:'linear',fill:'both'});
    drawAnimations.push(animation);
  }
  function prepareCardDiscard(){
    if(active!=='139:265')return;
    delete stage.dataset.discardMotionPlayed;
    const card=find('139:345');if(!card)return;
    card.classList.add('learning-discarded-card');
    card.style.transformOrigin='center';card.style.zIndex='7';
    if(new URLSearchParams(location.search).get('review')!=='1'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)card.style.visibility='hidden';
  }
  function playCardDiscard(){
    if(active!=='139:265'||stage.dataset.discardMotionPlayed)return;
    stage.dataset.discardMotionPlayed='1';
    const card=find('139:345');if(!card)return;card.style.visibility='';
    if(new URLSearchParams(location.search).get('review')==='1'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    // Match the original hand's Jail to its original discarded pose over the vintage pile.
    const template=document.createElement('template');template.innerHTML=data.scenes['139:351'];
    const target=template.content.querySelector('[data-node-id="139:370"]');if(!target)return;
    const size=n=>({x:parseFloat(n.style.left)+parseFloat(n.style.width)/2,y:parseFloat(n.style.top)+parseFloat(n.style.height)/2,w:parseFloat(n.style.width)});
    const from=size(card),to=size(target),dx=to.x-from.x,dy=to.y-from.y,scale=to.w/from.w;
    const animation=card.animate([
      {transform:'translate(0,0) scale(1)',offset:0},
      {transform:`translate(${dx*.7}px,${dy*.55}px) scale(${1+(scale-1)*.65})`,offset:.45},
      {transform:`translate(${dx}px,${dy}px) scale(${scale})`,offset:1}
    ],{duration:850,delay:250,easing:'cubic-bezier(.25,.6,.3,1)',fill:'both'});
    drawAnimations.push(animation);
  }
  // Missing Figma labels inherit their section, independent of navigation history.
  function ensureStepLabel(frame){
    if(frame.id===flow.home||frame.id===flow.menu||frame.id===flow.cards||menuIds.has(frame.id)||covers.has(frame.id))return;
    if(stage.querySelector('.learning-step-label')||[...stage.querySelectorAll('p')].some(p=>/^Step\s+\d+(?:\s*:|$)/i.test(p.textContent.trim())))return;
    const topic=window.BangContents.topicFor(frame.id);
    const label=topic?`Step ${topic.step+1} : ${topic.label}`:`Step ${stepFor(frame.id)}`;
    // Copy the actual section badge (including its Figma dimensions) when available.
    const templateFrame=topic&&data.frames.find(f=>f.text.includes(label)&&data.scenes[f.id]);
    if(templateFrame){
      const template=document.createElement('template');template.innerHTML=data.scenes[templateFrame.id];
      const text=[...template.content.querySelectorAll('p')].find(p=>p.textContent.trim()===label);
      const badge=text?.parentElement.parentElement;
      if(badge){
        const copy=badge.cloneNode(true);
        copy.querySelectorAll('[data-node-id]').forEach(n=>n.removeAttribute('data-node-id'));
        copy.removeAttribute('data-node-id');copy.classList.add('learning-inherited-step-label');
        stage.append(copy);return;
      }
    }
    const header=element('div','learning-step-label');header.textContent=label;
  }
  function renderSearchMenu(){
    stage.replaceChildren();surface.setAttribute('aria-label','카드&규칙 찾기');
    const root=element('section','turn-lesson search-choice');
    for(const [cls,src]of [['turn-wood','assets/intro-wood.png'],['turn-paper','assets/learning/1a32359f-8b42-4d64-b553-fc7b1039dd84.png'],['turn-frame','assets/frame.png']]){
      const image=element('img',cls,root);image.src=src;image.alt='';image.draggable=false;
    }
    const previous=element('button','learning-menu-button search-choice-back',root);previous.type='button';
    previous.innerHTML='<img src="assets/back-vector.svg" alt="">';bind(previous,active==='search-situations'?'카드&규칙 찾기로 돌아가기':'이전 페이지로 돌아가기',()=>active==='search-situations'?go('search-menu'):window.BangRouter.go(searchReturn));
    const heading=element('h1','search-choice-heading',root);heading.textContent='카드&규칙 찾기';
    const choices=element('nav','search-choice-buttons',root);choices.setAttribute('aria-label','찾는 방법 선택');
    const cards=element('button','search-choice-button',choices);cards.type='button';cards.textContent='카드 도감';
    cards.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 5-3 1 4 15 9-3"/><rect x="8" y="3" width="12" height="17" rx="2"/><path d="m14 7 3 4-3 4-3-4Z"/></svg><span>카드 도감</span>';
    bind(cards,'카드 도감',()=>window.BangRouter.go(flow.cards));
    const situations=element('button','search-choice-button',choices);situations.type='button';situations.textContent='상황별 규칙';
    situations.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8l-6 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M10 8a2 2 0 1 1 3 1.7c-1 .6-1 1-1 2.3M12 15h.01"/></svg><span>상황별 규칙</span>';
    bind(situations,'상황별 규칙',()=>go('search-situations'));
  }
  let searchTabTimer=null;
  function mountSearchTabs(parent,selected){
    clearTimeout(searchTabTimer);searchTabTimer=null;
    parent.querySelector('.search-page-tabs')?.remove();
    const nav=element('nav','search-page-tabs',parent);nav.setAttribute('aria-label','카드와 상황 찾기 전환');nav.dataset.selected=selected;
    for(const [key,label]of [['cards','카드 도감'],['situations','상황별 규칙']]){
      if(key==='situations'){const divider=element('span','search-page-divider',nav);divider.textContent='ㅣ';divider.setAttribute('aria-hidden','true');}
      const button=element('button','search-page-tab',nav);button.type='button';button.textContent=label;
      if(key===selected)button.setAttribute('aria-current','page');
      button.dataset.tab=key;
      button.onclick=()=>{
        if(nav.dataset.selected===key)return;
        clearTimeout(searchTabTimer);searchTabTimer=null;
        nav.dataset.selected=key;
        nav.querySelectorAll('.search-page-tab').forEach(tab=>{
          if(tab.dataset.tab===key)tab.setAttribute('aria-current','page');else tab.removeAttribute('aria-current');
        });
        if(key===selected)return;
        const origin=window.BangRouter.current;
        const navigate=()=>{
          searchTabTimer=null;
          if(!nav.isConnected||window.BangRouter.current!==origin)return;
          // Finish the slide before changing canvases, with no footer dissolve or restart.
          if(key==='cards')window.BangRouter.go(flow.cards,{instant:true});else go('search-situations',{instant:true});
        };
        if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)navigate();
        else searchTabTimer=setTimeout(navigate,300);
      };
    }
    return nav;
  }
  function renderSituationSearch(){
    renderSearchMenu();surface.setAttribute('aria-label','상황별 규칙');
    const root=stage.querySelector('.search-choice');root.querySelector('.search-choice-buttons').remove();
    root.querySelector('.turn-paper').src='assets/intro-paper.png';
    const heading=root.querySelector('.search-choice-heading');heading.textContent='상황별 규칙';
    const header=element('div','design-detail-header situation-title-sign',root);header.setAttribute('aria-hidden','true');
    element('div','design-detail-header-line',header);
    const star=element('img','situation-title-star',root);star.src='assets/sheriff.svg';star.alt='';star.draggable=false;
    const back=root.querySelector('.search-choice-back');back.classList.add('situation-page-back');
    back.innerHTML='<img src="assets/back-vector-a73e2a.svg?v=red1" alt="" aria-hidden="true" draggable="false">';
    window.BangSituationRules.mount(root);
    mountSearchTabs(root,'situations');
  }
  function render(id){
    cancel();active=source(id);const frame=frames.get(active);if(!frame)throw new Error('Unknown learning route '+id);
    if(frame.redirect){go(frame.redirect,{replace:true,instant:true});return stage;}
    stage.className='design-stage learning-stage';stage.dataset.learningFrame=active;delete stage.dataset.screen;
    surface.setAttribute('aria-label',active===flow.home?'BANG! 홈':active===flow.menu?'STEP 목차':active.startsWith('139:')?'Step 3 : 내 턴':frame.text.find(t=>/^Step /.test(t))||'학습 설명');
    if(introDefinitions.has(active)){
      const info=introDefinitions.get(active),destination=pendingIntro?.intro===active?pendingIntro.to:info.to;pendingIntro=null;
      // Keep the existing dark STEP cover artwork; use live text and one cover per STEP.
      stage.innerHTML=data.scenes['42:1668'];
      for(const p of stage.querySelectorAll('p')){
        if(p.textContent==='Step 1')p.textContent='Step '+info.step;
        if(p.textContent==='카드 종류 설명 & 세팅')p.textContent=titles[info.step-1];
      }
      let done=false;
      introAdvance=()=>{if(done)return;done=true;clearTimeout(timer);introAdvance=null;go(destination,{replace:true});};
      const skip=element('button','learning-step-intro-skip');skip.type='button';skip.setAttribute('aria-label','Step '+info.step+' 설명 시작');skip.onclick=()=>introAdvance?.();
      return stage;
    }
    if(active==='game-intro-one'||active==='game-intro-two'){
      stage.innerHTML=data.scenes['8:330'];
      find('8:380')?.remove();
      const title=active==='game-intro-one'?'마피아 게임, 해본 적 있나요?':'누가 내 편인지 모른 채,\n총격전이 시작됩니다.';
      const body=active==='game-intro-one'?['정체를 숨기고, 말과 행동으로 서로를 의심하는 게임.','BANG!에서는 그 심리전이 서부의 총격전으로 펼쳐집니다.']:['카드를 사용해 공격하고, 피하고, 서로를 돕습니다.','하지만 모두의 목표가 같지는 않습니다.','당신이 맡은 역할에 따라\n이기는 방법이 달라집니다.'];
      const copy=find('8:362');copy.replaceChildren();copy.style.top='377px';copy.style.height='142px';copy.classList.add('game-intro-copy');
      copy.classList.add('game-intro-one-copy');stage.append(copy);
      if(active==='game-intro-one'||active==='game-intro-two'){
        find('8:396')?.remove();
        element('div','game-intro-one-backdrop',stage).setAttribute('aria-hidden','true');
      }
      const topTitle=element('h1','game-intro-title');topTitle.textContent=title;if(active==='game-intro-two')topTitle.style.whiteSpace='pre-line';
      body.forEach((line,index)=>{const p=document.createElement('p');if(active==='game-intro-one'&&index===0){p.textContent='정체를 숨기고, 말과 행동으로';p.append(document.createElement('br'),'서로를 의심하는 게임.');}else if(active==='game-intro-one'&&index===1){p.textContent='BANG!에서는 그 심리전이 서부의 총격전으로';p.append(document.createElement('br'),'펼쳐집니다.');}else if(active==='game-intro-two'&&index===2){p.textContent='당신이 맡은 역할에 따라';p.append(document.createElement('br'),'이기는 방법이 달라집니다.');}else p.textContent=line;copy.append(p);});
      const next=element('button','learning-dialogue-next game-intro-next');next.type='button';next.textContent=active==='game-intro-two'?'>역할 알아보기':'> 다음';next.setAttribute('aria-label',active==='game-intro-two'?'역할 알아보기':'다음 장면');next.onclick=()=>go(active==='game-intro-one'?'game-intro-two':'30:931');
      const previous=element('button','learning-dialogue-back game-intro-previous');previous.type='button';previous.textContent='< 뒤로';previous.setAttribute('aria-label','이전 화면으로 돌아가기');previous.onclick=()=>active==='game-intro-two'?go('game-intro-one'):back();
      const badge=element('div','learning-step-label');badge.textContent='Step 1 : 게임 소개';
      const menu=element('button','learning-menu-button');menu.type='button';menu.setAttribute('aria-label','목차 열기');menu.innerHTML='<span class="learning-menu-icon"><img src="assets/learning/0a3d10c2-d2f3-4d00-b8a6-9dace2b6209f.svg" alt=""></span>';menu.onclick=openMenu;
      return stage;
    }
    if(window.BangFieldLesson.has(active)){stage.replaceChildren();window.BangFieldLesson.render(stage,active,{go,openMenu,back});normalizeStepLabels(stepFor(active));return stage;}
    if(window.BangRoleExplore.has(active)){const rendered=window.BangRoleExplore.render(stage,active,{go,openMenu,back});normalizeStepLabels(stepFor(active));return rendered;}
    if(active==='search-menu'){renderSearchMenu();return stage;}
    if(active==='search-situations'){renderSituationSearch();return stage;}
    if(window.BangTurnLesson.frames.some(f=>f.id===active)){
      stage.replaceChildren();window.BangTurnLesson.render(stage,active,{go,openMenu,back});normalizeStepLabels(stepFor(active));return stage;
    }
    if(active==='setup-share-abilities'){
      stage.innerHTML=data.scenes['136:197'];
      const copy=find('136:202');copy.replaceChildren();
      for(const [i,line]of ['각자 가진 인물 카드의 능력이 무엇인지','다른 사람들과 공유합니다.'].entries()){
        const p=document.createElement('p');p.textContent=line;p.style.lineHeight='100.03%';p.style.marginBottom=i?'0':'14px';copy.append(p);
      }
      const note=element('p','setup-share-note');note.textContent='역할카드와 인물카드는 다릅니다. 뒷면에 총알이 그려진 카드가 인물카드 입니다.';
      // Reuse the same five player positions as the distance illustration.
      for(const id of ['136:213','136:214','136:215','136:216','136:217','136:218','136:219','136:222','136:223','136:224'])find(id)?.remove();
      const template=document.createElement('template');template.innerHTML=data.scenes['131:1268'];
      const table=template.content.querySelector('[data-node-id="131:1285"]').cloneNode(true);stage.append(table);
      const characters=['03_calamityjanet','04_elgringo','14_suzylafayette','09_paulregret','08_luckyduke'];
      window.BangFieldLesson.seats.forEach((seat,i)=>{
        const image=element('img','setup-share-character');image.src='assets/source/share-'+characters[i]+'.png';image.alt=['재앙의 자넷','엘 그링고','수지 라파예트','폴 리그레트','럭키 듀크'][i]+' 인물 카드';image.draggable=false;
        image.style.left=(seat.x-23)+'px';image.style.top=(seat.y-36)+'px';
      });
    }else if(active==='intro-goal'){
      stage.innerHTML=data.scenes['8:330'];
      const copy=find('8:362');copy.replaceChildren();
      for(const [i,line] of ['서로의 역할을 추리하고','각자의 목표를 완수하세요!'].entries()){
        const p=document.createElement('p');p.textContent=line;p.style.lineHeight='100.03%';p.style.marginBottom=i?'0':'14px';copy.append(p);
      }
    }else if(data.scenes[active])stage.innerHTML=data.scenes[active];else reuse(frame);
    if(active==='30:931'){
      const copy=find('30:941');if(copy){
        copy.replaceChildren();const p=document.createElement('p');
        p.style.lineHeight='1.4';p.style.wordBreak='keep-all';p.style.overflowWrap='normal';
        ['그럼 이제 어떻게 해야','이길 수 있는지 알아볼까요?','이는 마피아 게임처럼 각자의','역할에 따라 달라집니다.'].forEach((line,i)=>{if(i)p.append(document.createElement('br'));p.append(document.createTextNode(line));});
        copy.append(p);
      }
    }
    roughFrame();decorateButtons();
    for(const node of stage.querySelectorAll('img')){node.draggable=false;if(!node.alt)node.setAttribute('aria-hidden','true');}
    if(active===flow.menu){
      for(const id of ['47:2567','90:32','90:39','90:46','90:53'])find(id)?.remove();
      for(const p of stage.querySelectorAll('p')){if(p.textContent.trim()==='카드 종류 설명 & 세팅')p.textContent='어떤 게임일까?';if(p.textContent.trim()==='각 역할과 승리 조건')p.textContent='게임을 준비해 볼까?';}
      const panel=element('section','learning-contents-page');panel.setAttribute('aria-label','STEP과 세부 단계 목차');
      const shortcuts=document.createElement('nav');shortcuts.className='learning-drawer-shortcuts';shortcuts.hidden=true;
      mainContentsCleanup=window.BangContents.mount(panel,shortcuts,{currentStep:1,currentId:active,go,message});
      bind(find('47:2544'),'홈으로 돌아가기',()=>go(flow.home));
      return stage;
    }
    const controls=new Map();
    for(const link of frame.links.filter(l=>l.trigger==='ON_CLICK')){
      // Prefer a containing interaction over duplicate nested prototype targets.
      const target=find(link.source);if(!target)continue;
      if(link.to==='42:2064'&&target.parentElement.closest('.learning-control'))continue;
      const control=bind(target,labelFor(frame,link),()=>{if(frame.id===flow.home)window.BangHomeMotion.select(stage,link.source,()=>follow(frame,link));else follow(frame,link);});if(control){control.dataset.sourceNode=link.source;controls.set(link.source,control);}
    }
    for(const link of frame.links.filter(l=>l.trigger==='ON_DRAG'&&frames.has(l.to))){
      const control=controls.get(link.source)||find(link.source);if(!control)continue;
      let start=null;control.style.touchAction='none';
      control.addEventListener('pointerdown',e=>{start=[e.clientX,e.clientY];control.setPointerCapture(e.pointerId);});
      control.addEventListener('pointerup',e=>{if(start&&Math.hypot(e.clientX-start[0],e.clientY-start[1])>35){control.dataset.suppressClick='1';follow(frame,link);}start=null;});
      control.addEventListener('pointercancel',()=>{start=null;});
    }
    if(active===flow.menu){
      bind(find('90:53'),'Step 5 초보자들을 위한 Tip!',()=>go('tips-role-select'));
      const logo=find('47:2544');bind(logo,'홈으로 돌아가기',()=>go(flow.home));
    }
    // Sources use copied Step 2 labels inside the dedicated Step 3 frames.
    if(active.startsWith('139:')){
      for(const n of stage.querySelectorAll('[data-node-id]'))if(n.children.length===1&&n.firstElementChild?.tagName==='P'&&n.textContent.includes('Step 2 : 보안관'))n.firstElementChild.textContent='Step 3 : 내 턴';
    }
    if(active==='139:249'){
      for(const p of stage.querySelectorAll('p'))if(p.textContent.includes('윌리 더 키드'))p.textContent='(볼캐닉 장착 / 윌리 더 키드의 능력은 예외)';
    }
    if(active==='124:909'){
      const setupIntro=find('124:921')?.querySelector('p');if(setupIntro)setupIntro.textContent='잠깐! 본격적으로 시작하기 전에';
      find('124:934')?.remove();
      const label=element('label','learning-player-count');label.textContent='플레이 인원 ';
      const field=element('span','learning-player-select',label);
      const select=element('select','',field);select.setAttribute('aria-label','플레이 인원');
      const arrow=document.createElementNS('http://www.w3.org/2000/svg','svg');arrow.setAttribute('viewBox','0 0 14 10');arrow.setAttribute('class','learning-player-select-arrow');arrow.setAttribute('aria-hidden','true');arrow.setAttribute('focusable','false');
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M2 2 7 7 12 2');arrow.append(path);field.append(arrow);
      for(const n of [4,5,6,7]){const option=document.createElement('option');option.value=n;option.textContent=n+'명';select.append(option);}select.value=sessionStorage.getItem('bang-learning-players')||'5';
      const update=()=>{const counts={4:[1,0,2,1],5:[1,1,2,1],6:[1,1,3,1],7:[1,2,3,1]}[select.value];['124:961','124:962','124:963','124:964'].forEach((id,i)=>{const n=find(id)?.querySelector('p');if(n)n.textContent=counts[i]+'장';});sessionStorage.setItem('bang-learning-players',select.value);};select.onchange=update;update();
    }
    window.BangTurnLesson.enhanceOriginal(stage,active);
    if(!legacyRoleSequence.has(active))normalizeStepLabels(stepFor(active));
    if(legacyRoleSequence.has(active)){
      for(const p of stage.querySelectorAll('p'))if(/^Step\s+\d+(?:\s*:.*)?$/i.test(p.textContent.trim())){
        p.textContent='Step 1 : 역할과 승리 조건';p.style.whiteSpace='nowrap';p.style.wordBreak='keep-all';p.style.overflowWrap='normal';
        const textBox=p.parentElement,badge=textBox?.parentElement;
        if(textBox){textBox.style.width='188px';textBox.style.whiteSpace='nowrap';}
        const shape=badge&&[...badge.children].find(node=>node.style.background==='rgb(17, 17, 17)'&&node.style.height==='46px');
        if(shape)shape.style.width='220px';
      }
    }
    ensureStepLabel(frame);
    for(const button of stage.querySelectorAll('button')){
      const left=parseFloat(button.style.left),top=parseFloat(button.style.top);
      if(Number.isFinite(left)&&Number.isFinite(top)&&left<=16&&top<=20&&parseFloat(button.style.width)>=55&&parseFloat(button.style.height)>=55)button.style.zIndex='40';
    }
    prepareCardDraw();
    prepareCardUse();
    prepareCardDiscard();
    makeDialogueClickable(frame,controls);
    for(const menu of stage.querySelectorAll('[aria-label="목차 열기"]')){
      menu.classList.add('learning-menu-normalized');
      menu.innerHTML='<span class="learning-menu-icon"><img src="assets/learning/0a3d10c2-d2f3-4d00-b8a6-9dace2b6209f.svg" alt=""></span>';
    }
    window.BangComponentHelp.mount(stage,active);
    return stage;
  }
  function activate(){
    clearTimeout(timer);autoAdvanceCleanup?.();autoAdvanceCleanup=null;if(!active)return;
    if(introAdvance){timer=setTimeout(()=>introAdvance?.(),1200);return;}
    playCardDraw();
    playCardUse();
    playCardDiscard();
    const frame=frames.get(active);
    const auto=frame.links.find(l=>l.trigger==='AFTER_TIMEOUT'&&frames.has(l.to));
    // Ignore the stale title timeout on the component explanation: it loops back.
    if(new URLSearchParams(location.search).get('review')==='1')return;
    if(auto&&active!=='8:398'){
      const current=active;let advanced=false;
      const advance=()=>{if(advanced||active!==current||drawer)return;advanced=true;clearTimeout(timer);follow(frame,auto);};
      const click=event=>{
        if(event.defaultPrevented||event.target.closest('button,a,input,select,textarea,[role="button"],[role="dialog"],.learning-drawer-backdrop'))return;
        advance();
      };
      const key=event=>{if(event.target===stage&&(event.key==='Enter'||event.key===' ')){event.preventDefault();advance();}};
      const oldTabIndex=stage.getAttribute('tabindex');stage.tabIndex=0;
      stage.addEventListener('click',click);stage.addEventListener('keydown',key);
      autoAdvanceCleanup=()=>{stage.removeEventListener('click',click);stage.removeEventListener('keydown',key);if(oldTabIndex===null)stage.removeAttribute('tabindex');else stage.setAttribute('tabindex',oldTabIndex);};
      timer=setTimeout(advance,Math.max(covers.has(active)?650:400,(auto.delay||0)*1000));
    }
  }
  function cancel(){autoAdvanceCleanup?.();autoAdvanceCleanup=null;introAdvance=null;clearTimeout(searchTabTimer);searchTabTimer=null;mainContentsCleanup?.();mainContentsCleanup=null;window.BangComponentHelp.close(false);window.BangHomeMotion?.cancel(stage);for(const animation of drawAnimations)animation.cancel();drawAnimations=[];clearTimeout(timer);timer=null;active=null;closeMenu(false);}
  function closeMenu(focus=true){
    if(!drawer)return;
    const closing=drawer;
    const finish=()=>{
      if(drawer!==closing)return;
      clearTimeout(drawerCloseTimer);drawerCloseTimer=null;
      drawerCleanup?.();drawerCleanup=null;
      closing.remove();drawer=null;window.BangRuleBookmark?.suspend(false);
      for(const [node,inert]of menuInert)node.inert=inert;menuInert=[];
      if(focus)restoreFocus?.focus();restoreFocus=null;activate();
    };
    // Navigation removes the old surface immediately; explicit closing slides it away.
    if(!focus||window.matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
    if(closing.classList.contains('is-closing'))return;
    closing.classList.add('is-closing');
    const panel=closing.querySelector('.learning-drawer');
    panel.addEventListener('animationend',event=>{if(event.target===panel&&event.animationName==='learning-drawer-exit')finish();});
    drawerCloseTimer=setTimeout(finish,300);
  }
  function openMenu(){
    if(drawer)return;window.BangRuleBookmark?.suspend(true);clearTimeout(timer);restoreFocus=document.activeElement;
    drawer=element('div','learning-drawer-backdrop');drawer.setAttribute('role','presentation');
    menuInert=[...stage.children].filter(node=>node!==drawer).map(node=>[node,node.inert]);for(const [node]of menuInert)node.inert=true;
    const panel=element('section','learning-drawer',drawer);panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','목차');
    const h=element('h2','',panel);h.textContent='목차';
    const close=element('button','learning-drawer-close',panel);close.type='button';close.setAttribute('aria-label','목차 닫기');close.innerHTML='<img src="assets/back-vector.svg" alt="">';close.onclick=()=>closeMenu();
    const shortcuts=element('nav','learning-drawer-shortcuts',panel);shortcuts.setAttribute('aria-label','바로가기');
    const icons={home:'<path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',game:'<path d="M8 7h8c3 0 4 2 5 6l1 5c.5 3-2 4-4 2l-3-3H9l-3 3c-2 2-4.5 1-4-2l1-5c1-4 2-6 5-6Z"/><path d="M7 10v6M4 13h6"/><circle cx="16" cy="11" r=".7"/><circle cx="19" cy="14" r=".7"/>'};
    const destinations=[['홈으로','home',()=>go(flow.home)],['카드&규칙 찾기','search',()=>go('search-menu')],['시뮬레이션 하기','game',()=>{closeMenu(false);window.BangMusic?.start();window.BangRouter.go('5:229');}]];
    destinations.forEach(([label,icon,navigate])=>{const button=element('button','learning-drawer-shortcut',shortcuts);button.type='button';button.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[icon]}</svg><span></span>`;button.lastElementChild.textContent=label;button.onclick=navigate;});
    drawerCleanup=window.BangContents.mount(panel,shortcuts,{currentStep:stepFor(active),currentId:active,go,message});
    drawer.onclick=e=>{if(e.target===drawer)closeMenu();};
    drawer.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeMenu();}if(e.key==='Tab'){const list=[...panel.querySelectorAll('button')].filter(button=>!button.closest('[inert]'));if(e.shiftKey&&document.activeElement===list[0]){e.preventDefault();list.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===list.at(-1)){e.preventDefault();list[0].focus();}}});
    close.focus();
  }
  function stepFor(id){const f=frames.get(id);if(f?.step)return f.step;if(f?.y>=3671)return 3;return f?.y>=1500?2:1;}
  window.BangLearning={surface,has,render,activate,cancel,go,frames,mountSearchTabs,pauseRuleBookmark:()=>clearTimeout(timer),resumeRuleBookmark:activate};
})();
