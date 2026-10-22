/* Latest Figma learning flow. The original simulation graph and data stay intact. */
(() => {
  const data=window.BANG_LEARNING_SCENES,flow=window.BANG_FIGMA_FLOW;
  const frames=new Map(data.frames.map(frame=>[frame.id,frame]));
  // Confirmed learning continuation; retain the untouched Figma export as the audit source.
  const stepThreeEnd=frames.get('139:351');
  frames.set(stepThreeEnd.id,{...stepThreeEnd,links:stepThreeEnd.links.map(link=>link.to==='42:2064'?{...link,to:'turn-timing'}:link)});
  for(const frame of window.BangTurnLesson.frames)frames.set(frame.id,frame);
  frames.set('search-menu',{id:'search-menu',name:'카드&규칙 찾기',text:['카드&규칙 찾기'],links:[]});
  frames.set('search-situations',{id:'search-situations',name:'상황별 규칙',text:['상황별 규칙'],links:[]});
  // Extend only the isolated learning graph; the original simulation graph stays intact.
  const continueTo=(id,oldTarget,newTarget)=>{const f=frames.get(id);frames.set(id,{...f,links:f.links.map(l=>l.to===oldTarget?{...l,to:newTarget}:l)});};
  continueTo('139:249','42:2064','139:265');
  continueTo('139:265','42:2064','139:351');
  continueTo('139:236','42:2064','139:249');
  const menuIds=new Set(['94:60','124:745','131:1141']);
  const covers=new Set(['35:1427','42:1668','42:1687','42:1695','131:1124','131:1132']);
  const stepStarts=['35:1427','42:1687','131:1124'];
  const titles=['카드 종류 설명 & 세팅','각 역할과 승리 조건','내 턴에는 뭘 해야할까?','누구를 공격할 수 있을까?','초보자들을 위한 Tip!'];
  let active=null,timer=null,drawer=null,restoreFocus=null,menuInert=[],drawerCloseTimer=null,drawAnimations=[],drawerCleanup=null;
  const route=id=>id===flow.home||id===flow.menu?id:'learn:'+id;
  for(const frame of frames.values()){
    if(frame.id===flow.home||frame.id===flow.menu||frame.id===flow.cards||menuIds.has(frame.id))continue;
    flow.frames[route(frame.id)]={id:route(frame.id),name:frame.id.startsWith('139:')?'Step 3 : 내 턴':frame.text.find(t=>/^Step /.test(t))||frame.name,screenId:null,hotspots:[],automatic:[]};
  }
  const surface=document.createElement('main');surface.id='learning-screen';surface.className='reference-screen';surface.hidden=true;surface.inert=true;
  const stage=document.createElement('div');stage.className='design-stage learning-stage';surface.append(stage);document.querySelector('#app').append(surface);
  new ResizeObserver(()=>{stage.style.transform=`scale(${surface.clientWidth/390})`;}).observe(surface);
  function source(id){return id.startsWith('learn:')?id.slice(6):id;}
  function has(id){return id===flow.home||id===flow.menu||id?.startsWith('learn:');}
  function element(tag,cls,parent=stage){const n=document.createElement(tag);n.className=cls;parent.append(n);return n;}
  function go(id,options={}){if(id==='140:427'){message('Step 4는 준비 중입니다.');return;}closeMenu(false);return window.BangRouter.go(route(id),{action:{transitionType:'DISSOLVE'},...options});}
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
    const nextLink=frame.links.find(l=>l.to&&!menuIds.has(l.to)&&l.to!=='8:258'&&(frame.id!=='94:185'||l.to==='131:1124'));
    if(nextLink&&!detail)bind(next,next.textContent,()=>follow(frame,nextLink));
    const menu=element('button','learning-menu-button');menu.type='button';menu.setAttribute('aria-label','목차 열기');
    const template=document.createElement('template');template.innerHTML=data.scenes['131:1182'];
    const icon=template.content.querySelector('[data-node-id="131:1190"]');if(icon)menu.innerHTML=icon.innerHTML;
    if(detail){menu.innerHTML='<img src="assets/back-vector.svg" alt="">';bind(menu,'역할 목록으로 돌아가기',()=>go('94:185'));}else bind(menu,'목차 열기',openMenu);
    const stepLabel=frame.text.find(t=>/^Step /.test(t));if(stepLabel){const header=element('div','learning-step-label');header.textContent=stepLabel;}
    if(frame.id==='94:185'){
      panel.classList.add('learning-role-exploration');const hint=element('span','learning-role-hint',panel);hint.textContent='> 카드를 클릭하세요!';
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
    if(link.to==='140:427'){message('Step 4는 준비 중입니다.');return;}
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
      const y=hintRect?(hintRect.top+hintRect.height/2-origin.top)/scale-top:bottom-top-36;
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
    previous.innerHTML='<img src="assets/back-vector.svg" alt="">';bind(previous,'홈으로 돌아가기',()=>go(flow.home));
    const heading=element('h1','search-choice-heading',root);heading.textContent='카드&규칙 찾기';
    const choices=element('nav','search-choice-buttons',root);choices.setAttribute('aria-label','찾는 방법 선택');
    const cards=element('button','search-choice-button',choices);cards.type='button';cards.textContent='카드 도감';
    cards.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 5-3 1 4 15 9-3"/><rect x="8" y="3" width="12" height="17" rx="2"/><path d="m14 7 3 4-3 4-3-4Z"/></svg><span>카드 도감</span>';
    bind(cards,'카드 도감',()=>window.BangRouter.go(flow.cards));
    const situations=element('button','search-choice-button',choices);situations.type='button';situations.textContent='상황별 규칙';
    situations.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8l-6 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M10 8a2 2 0 1 1 3 1.7c-1 .6-1 1-1 2.3M12 15h.01"/></svg><span>상황별 규칙</span>';
    bind(situations,'상황별 규칙',()=>go('search-situations'));
  }
  function mountSearchTabs(parent,selected){
    parent.querySelector('.search-page-tabs')?.remove();
    const nav=element('nav','search-page-tabs',parent);nav.setAttribute('aria-label','카드와 상황 찾기 전환');
    for(const [key,label]of [['cards','카드 도감'],['situations','상황별 규칙']]){
      if(key==='situations'){const divider=element('span','search-page-divider',nav);divider.textContent='ㅣ';divider.setAttribute('aria-hidden','true');}
      const button=element('button','search-page-tab',nav);button.type='button';button.textContent=label;
      if(key===selected)button.setAttribute('aria-current','page');
      button.onclick=()=>{if(key===selected)return;if(key==='cards')window.BangRouter.go(flow.cards);else go('search-situations');};
    }
    return nav;
  }
  function renderSituationSearch(){
    renderSearchMenu();surface.setAttribute('aria-label','상황별 규칙');
    const root=stage.querySelector('.search-choice');root.querySelector('.search-choice-buttons').remove();
    root.querySelector('.search-choice-heading').textContent='상황별 규칙';
    const note=element('p','search-situations-pending',root);note.textContent='상황별 규칙 안내를 준비 중입니다.';
    mountSearchTabs(root,'situations');
  }
  function render(id){
    cancel();active=source(id);const frame=frames.get(active);if(!frame)throw new Error('Unknown learning route '+id);
    stage.className='design-stage learning-stage';stage.dataset.learningFrame=active;delete stage.dataset.screen;
    surface.setAttribute('aria-label',active===flow.home?'BANG! 홈':active===flow.menu?'STEP 목차':active.startsWith('139:')?'Step 3 : 내 턴':frame.text.find(t=>/^Step /.test(t))||'학습 설명');
    if(active==='search-menu'){renderSearchMenu();return stage;}
    if(active==='search-situations'){renderSituationSearch();return stage;}
    if(window.BangTurnLesson.frames.some(f=>f.id===active)){
      stage.replaceChildren();window.BangTurnLesson.render(stage,active,{go,openMenu,back});return stage;
    }
    if(data.scenes[active])stage.innerHTML=data.scenes[active];else reuse(frame);
    roughFrame();decorateButtons();
    for(const node of stage.querySelectorAll('img')){node.draggable=false;if(!node.alt)node.setAttribute('aria-hidden','true');}
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
      bind(find('90:53'),'Step 5 준비 중',()=>message('Step 5는 준비 중입니다.'));
      window.BangTurnLesson.links(stage,go,'turn-menu-topics');
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
      find('124:934')?.remove();
      const label=element('label','learning-player-count');label.textContent='플레이 인원 ';
      const select=element('select','',label);select.setAttribute('aria-label','플레이 인원');
      for(const n of [4,5,6,7]){const option=document.createElement('option');option.value=n;option.textContent=n+'명';select.append(option);}select.value=sessionStorage.getItem('bang-learning-players')||'5';
      const update=()=>{const counts={4:[1,0,2,1],5:[1,1,2,1],6:[1,1,3,1],7:[1,2,3,1]}[select.value];['124:961','124:962','124:963','124:964'].forEach((id,i)=>{const n=find(id)?.querySelector('p');if(n)n.textContent=counts[i]+'장';});sessionStorage.setItem('bang-learning-players',select.value);};select.onchange=update;update();
    }
    ensureStepLabel(frame);
    prepareCardDraw();
    prepareCardUse();
    makeDialogueClickable(frame,controls);
    for(const menu of stage.querySelectorAll('[aria-label="목차 열기"]')){
      menu.classList.add('learning-menu-normalized');
      menu.innerHTML='<span class="learning-menu-icon"><img src="assets/learning/0a3d10c2-d2f3-4d00-b8a6-9dace2b6209f.svg" alt=""></span>';
    }
    return stage;
  }
  function activate(){
    clearTimeout(timer);if(!active)return;
    playCardDraw();
    playCardUse();
    const frame=frames.get(active);
    const auto=frame.links.find(l=>l.trigger==='AFTER_TIMEOUT'&&frames.has(l.to));
    // Ignore the stale title timeout on the component explanation: it loops back.
    if(new URLSearchParams(location.search).get('review')==='1')return;
    if(auto&&active!=='8:398')timer=setTimeout(()=>follow(frame,auto),Math.max(covers.has(active)?650:400,(auto.delay||0)*1000));
  }
  function cancel(){window.BangHomeMotion?.cancel(stage);for(const animation of drawAnimations)animation.cancel();drawAnimations=[];clearTimeout(timer);timer=null;active=null;closeMenu(false);}
  function closeMenu(focus=true){
    if(!drawer)return;
    const closing=drawer;
    const finish=()=>{
      if(drawer!==closing)return;
      clearTimeout(drawerCloseTimer);drawerCloseTimer=null;
      drawerCleanup?.();drawerCleanup=null;
      closing.remove();drawer=null;
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
    if(drawer)return;clearTimeout(timer);restoreFocus=document.activeElement;
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
  function stepFor(id){const f=frames.get(id);if(f?.y>=3671)return 3;return f?.y>=1500?2:1;}
  window.BangLearning={surface,has,render,activate,cancel,go,frames,mountSearchTabs};
})();
