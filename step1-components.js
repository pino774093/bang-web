/* STEP 1 component images only. Adds help without replacing images or scene links. */
(() => {
 const entries={
  brown:{title:'갈색 게임 카드',copy:['사용하면 효과를 적용하고 버린 카드 더미에 놓습니다.','자신의 턴에 사용 가능한 카드를 원하는 만큼 사용합니다. 단, 뱅!은 기본적으로 한 턴에 한 장만 사용합니다.','빗나감! 등 일부 카드는 다른 플레이어의 턴에도 사용할 수 있습니다.']},
  blue:{title:'파란색 게임 카드',copy:['자신의 앞에 내려놓고 버프처럼','지속적으로 효과를 얻는 장비 카드입니다.','자신의 턴에 장착하며, 무기(총)은 하나만 장착할 수 있고,','같은 이름의 카드를 중복 장착할 수는 없습니다.'],note:'감옥은 예외로 다른 플레이어 앞에 놓습니다.'},
  role:{title:'역할 카드',copy:['자신의 정체와 승리 목표를 결정합니다.','보안관만 역할을 공개합니다. 나머지 플레이어는 역할을 보여주지 않습니다. 탈락하게 되면 공개합니다.','역할별 자세한 승리 조건은 STEP 1에서 확인할 수 있습니다.'],note:'인물카드와는 완전히 다른 카드입니다.'},
  character:{title:'인물 카드',copy:['사용할 캐릭터와 특별한 능력을 나타냅니다.','표시된 총알 수만큼 생명력 표시용 총알을 받습니다. 보안관은 총알을 하나 더 받습니다.','턴이 끝날 때는 남아 있는 총알 수만큼 손패를 남길 수 있습니다.']},
  bullets:{title:'총알',copy:['플레이어의 생명력을 표시합니다.','피해를 입으면 총알을 잃고, 생명력을 회복하면 다시 얻습니다.','처음 정해진 최대 생명력보다 많은 총알을 가질 수 없습니다.']},
  board:{title:'개인패(개인판)',copy:['자신의 인물 카드와 남은 총알을 표시하는 데 사용합니다.','게임 중 자신의 생명력을 쉽게 확인할 수 있도록 앞에 놓습니다.']}
 };
 const targets={
  '8:398':[['8:414','brown'],['128:1118','brown'],['8:417','blue'],['128:1119','blue']],
  '8:422':[['8:432','character'],['128:1120','character'],['8:433','character'],['128:1121','character']],
  '8:435':[['8:446','role'],['131:1123','role']],
  '8:449':[['8:472','bullets']],
  '8:473':[['8:486','board']]
 };
 let dismiss=null;
 const make=(tag,cls,parent,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;parent.append(n);return n;};
 function close(focus=true){return dismiss?.(focus);}
 function open(stage,key,trigger){
  close(false);const entry=entries[key],saved=[...stage.children].map(n=>[n,n.inert]);
  const backdrop=make('div','component-help-backdrop',stage);backdrop.dataset.component=key;
  const art=make('div','component-help-art',backdrop);art.inert=true;
  // Keep only the selected front/back pair sharp; other component rows stay behind the blur.
  const selected=[...stage.querySelectorAll('.component-help-trigger')].filter(node=>node.dataset.component===key&&Math.abs(parseFloat(node.style.top)-parseFloat(trigger.style.top))<5);
  const bounds=selected.map(node=>node.getBoundingClientRect()),canvas=stage.getBoundingClientRect(),scale=canvas.width/390;
  const centerX=(Math.min(...bounds.map(r=>r.left))+Math.max(...bounds.map(r=>r.right)))/2;
  const centerY=(Math.min(...bounds.map(r=>r.top))+Math.max(...bounds.map(r=>r.bottom)))/2;
  const centerLocalX=(centerX-canvas.left)/scale,centerLocalY=(centerY-canvas.top)/scale;
  const groupWidth=(Math.max(...bounds.map(r=>r.right))-Math.min(...bounds.map(r=>r.left)))/scale;
  const zoom=Math.min(1.12,346/groupWidth)*(key==='blue'?0.8:1);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targetX=key==='blue'?105:195;
  const targetY=key==='blue'?185:292;
  const destination=`translate(${targetX-(centerX-canvas.left)/scale}px,${targetY-(centerY-canvas.top)/scale}px) scale(${zoom})`;
  art.style.transformOrigin=`${(centerX-canvas.left)/scale}px ${(centerY-canvas.top)/scale}px`;
  art.style.transform=destination;
  const originals=selected.map(node=>{const placeholder=document.createComment('component position'),style=node.getAttribute('style');node.replaceWith(placeholder);art.append(node);return {node,placeholder,style};});
  if(key==='blue'){
   const ordered=originals.slice().sort((a,b)=>parseFloat(a.node.style.left)-parseFloat(b.node.style.left));
   const cardLefts=ordered.map(({node})=>targetX+(parseFloat(node.style.left)-centerLocalX)*zoom);
   ordered.forEach(({node},i)=>{node.style.zIndex=String(i+1);if(i===0)node.style.left=(parseFloat(node.style.left)+28/zoom)+'px';});
   const rowTop=286;
   const addExample=(src,left,zIndex)=>{const image=document.createElement('img');image.src=encodeURI(src);image.alt='';image.setAttribute('aria-hidden','true');Object.assign(image.style,{position:'absolute',left:(centerLocalX+(left-targetX)/zoom)+'px',top:(centerLocalY+(rowTop-targetY)/zoom)+'px',width:'129px',height:'200px',zIndex:String(zIndex),objectFit:'contain',filter:'drop-shadow(3px 3px 1px rgba(0,0,0,.8))',pointerEvents:'none'});art.append(image);};
   addExample('assets/learning/56730c51-8166-4327-8aec-79704b722cfc.png',cardLefts[0]+28,1);
   addExample('assets/무제 폴더/뱅! 소스 (영)/카드 png/게임 카드/파란색 테두리/01_barile.png',cardLefts[1],2);
   const addNote=(top,paragraphs)=>{const note=document.createElement('div');Object.assign(note.style,{position:'absolute',left:'218px',top:top+'px',width:'145px',boxSizing:'border-box',display:'flex',flexDirection:'column',gap:'4px',color:'#fff',fontSize:'11px',lineHeight:'1.3',fontFamily:'inherit',wordBreak:'keep-all',overflowWrap:'normal',pointerEvents:'none'});for(const item of paragraphs){const p=document.createElement('p');p.textContent=item.text;Object.assign(p.style,{margin:'0',color:item.color||'#fff',fontSize:item.size||'11px',lineHeight:'1.3',whiteSpace:'pre-line'});note.append(p);}backdrop.append(note);};
   addNote(104,[{text:'무기 카드 :\n기본적으로 가능한 사정거리를 정해요! 한 개만 장착할 수 있고, 새 무기를 장착하면 원래의 무기는 버려요.'}]);
   addNote(296,[{text:'무기 외 카드 :\n다양한 효과를 줄 수 있어요. 같은 카드가 아니면 여러장 장착 가능!'}]);
  }
  const panel=make('section','component-help-paper',backdrop);panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','component-help-title');panel.setAttribute('aria-describedby','component-help-copy');
  const title=make('h2','',panel,entry.title);title.id='component-help-title';
  const copy=make('div','component-help-copy',panel);copy.id='component-help-copy';entry.copy.forEach(line=>make('p','',copy,line));if(entry.note)make('p','component-help-note',copy,'주의! '+entry.note);
  const button=make('button','component-help-close',panel,'닫기');button.type='button';button.onclick=()=>close();
  saved.forEach(([n])=>n.inert=true);
  const animations=[];let finished=false,closing=null;
  if(!reduced){
    animations.push(art.animate([{transform:'translate(0,0) scale(1)'},{transform:destination}],{duration:360,easing:'cubic-bezier(.22,.68,.22,1)'}));
    animations.push(panel.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'ease-out'}));
  }
  const finish=(focus)=>{if(finished)return;finished=true;animations.forEach(a=>a.cancel());originals.forEach(({node,placeholder,style})=>{if(style===null)node.removeAttribute('style');else node.setAttribute('style',style);placeholder.replaceWith(node);});saved.forEach(([n,inert])=>{if(n.isConnected)n.inert=inert;});backdrop.remove();dismiss=null;if(focus&&trigger.isConnected)trigger.focus({preventScroll:true});};
  dismiss=(focus=true)=>{
    if(!focus||reduced){finish(focus);return;}
    if(closing)return closing;
    const current=getComputedStyle(art).transform;animations.forEach(a=>a.cancel());
    const returning=art.animate([{transform:current},{transform:'translate(0,0) scale(1)'}],{duration:280,easing:'cubic-bezier(.4,0,.3,1)',fill:'forwards'});
    animations.push(returning,panel.animate([{opacity:1},{opacity:0}],{duration:180,fill:'forwards'}));
    closing=returning.finished.then(()=>finish(true)).catch(()=>{});return closing;
  };
  backdrop.addEventListener('click',event=>{event.stopPropagation();if(event.target===backdrop)close();});
  backdrop.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}else if(event.key==='Tab'){event.preventDefault();button.focus();}});
  button.focus({preventScroll:true});
  requestAnimationFrame(()=>{if(button.isConnected)button.focus({preventScroll:true});});
 }
 function mount(stage,id){
  const items=targets[id];if(!items)return;
  if(id==='8:422'){
    // One character's original front/back pair, centered in the existing illustration area.
    for(const removed of ['8:433','128:1121'])stage.querySelector(`[data-node-id="${removed}"]`)?.remove();
    for(const [nodeId,left] of [['8:432',85.5],['128:1120',175.5]]){
      const card=stage.querySelector(`[data-node-id="${nodeId}"]`);if(card){card.style.left=left+'px';card.style.top='192px';}
    }
  }
  for(const p of stage.querySelectorAll('p'))if(p.textContent==='이미지를 누르면 자세한 설명이 나와요!')p.textContent='이미지를 눌러 사용 방법을 확인하세요.';
  for(const [nodeId,key] of items){
   const target=stage.querySelector(`[data-node-id="${nodeId}"]`);if(!target)continue;
   target.classList.add('component-help-trigger');target.dataset.component=key;target.setAttribute('role','button');target.tabIndex=0;target.setAttribute('aria-haspopup','dialog');target.setAttribute('aria-label',entries[key].title+' 사용 방법');
   target.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();open(stage,key,target);});
   target.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();open(stage,key,target);}});
  }
 }
 window.BangComponentHelp={mount,close};
})();
