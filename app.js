(() => {
  const flow=window.BANG_FIGMA_FLOW;
  const app=document.querySelector('#app');
  const surfaces={home:document.querySelector('#home'),intro:document.querySelector('#intro'),screen:document.querySelector('#reference-screen')};
  let current=null,revision=0,animation=null,transitionLayer=null,motionAnimations=[],motionLayer=null,motionRestores=[],dialogueLayer=null,dialogueAnimations=[];
  const roleLineupOriginalOpacity=new WeakMap();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function motionDuration(name,fallback){
    const value=getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const amount=parseFloat(value);
    if(!Number.isFinite(amount))return fallback;
    return value.endsWith('s')&&!value.endsWith('ms')?amount*1000:amount;
  }
  function identify(value){
    if(value==='home')return flow.home;if(value==='intro')return flow.intro;
    if(typeof value==='number')return flow.screenToFrame[value];
    return flow.frames[value]?value:null;
  }
  function fromURL(){
    const route=location.hash.split('?')[0];
    if(route==='#/intro')return flow.intro;
    if(route.startsWith('#/figma/'))return identify(decodeURIComponent(route.slice(8)))||flow.home;
    if(route.startsWith('#/screen/'))return identify(Number(route.slice(9)))||flow.home;
    return flow.home;
  }
  function address(id,card){
    const route=id===flow.home?'#/home':id===flow.intro?'#/intro':'#/figma/'+id;
    return route+(Number.isInteger(card)?'?card='+card:'');
  }
  function stop(){window.BangInteractions.cancel();}
  function clearTransition(){
    animation?.cancel();motionAnimations.forEach(player=>player.cancel());dialogueAnimations.forEach(player=>player.cancel());transitionLayer?.remove();motionLayer?.remove();dialogueLayer?.remove();
    motionRestores.forEach(([element,opacity])=>{if(element.isConnected)element.style.opacity=opacity;});
    animation=transitionLayer=motionLayer=dialogueLayer=null;motionAnimations=[];dialogueAnimations=[];motionRestores=[];
  }
  function animateDialogueExit(){
    const oldBubbles=transitionLayer?.querySelectorAll('.design-speech');
    if(!oldBubbles?.length)return;
    dialogueLayer=document.createElement('div');dialogueLayer.className='dialogue-exit-layer';app.append(dialogueLayer);
    const duration=motionDuration('--duration-dialogue',400);
    for(const oldBubble of oldBubbles){
      const bounds=rectPercent(oldBubble),bubble=oldBubble.cloneNode(true);
      bubble.querySelectorAll('.design-speech-copy').forEach(copy=>copy.remove());
      bubble.style.animation='none';
      Object.assign(bubble.style,{left:`${bounds.left}%`,top:`${bounds.top}%`,width:`${bounds.width}%`,height:`${bounds.height}%`,opacity:'1'});
      dialogueLayer.append(bubble);
      dialogueAnimations.push(bubble.animate([{opacity:1},{opacity:0}],{duration,easing:'ease-in-out',fill:'forwards'}));
    }
  }
  function easingFor(action){
    return getComputedStyle(document.documentElement).getPropertyValue('--ease-natural').trim()||'ease-in-out';
  }
  function ensureMotionLayer(){
    if(!motionLayer){motionLayer=document.createElement('div');motionLayer.className='role-smart-motion';motionLayer.setAttribute('aria-hidden','true');motionLayer.inert=true;app.append(motionLayer);}
    return motionLayer;
  }
  function rectPercent(element){
    const r=element.getBoundingClientRect(),a=app.getBoundingClientRect();
    return {left:(r.left-a.left)/a.width*100,top:(r.top-a.top)/a.height*100,width:r.width/a.width*100,height:r.height/a.height*100};
  }
  function targetsInsideNewComposites(fromId,root){
    const source=window.BangDesign.definitions.get(flow.frames[fromId]?.screenId);
    const target=window.BangDesign.definitions.get(flow.frames[current]?.screenId);
    if(!source||!target)return new Map();
    const oldSources=new Set(source.images.map(asset=>new URL(asset.src,document.baseURI).href));
    const placed=[...root.querySelectorAll('img[data-screen-asset-index]')].map(image=>({
      image,src:image.currentSrc||image.src,rect:rectPercent(image)
    }));
    // Some Figma exports flatten a group while also exporting its children.
    // Track the overlap so the child can still move without drawing twice.
    const composites=placed.filter(item=>!oldSources.has(item.src)&&item.rect.width>=45&&item.rect.height>=20);
    const embedded=new Map();
    for(const child of placed){
      const containing=composites.filter(({image,rect})=>image!==child.image&&
        child.rect.left>=rect.left-.25&&child.rect.top>=rect.top-.25&&
        child.rect.left+child.rect.width<=rect.left+rect.width+.25&&
        child.rect.top+child.rect.height<=rect.top+rect.height+.25);
      if(containing.length)embedded.set(child.image,containing.map(item=>item.image));
    }
    return embedded;
  }
  function animateSharedImages(root,duration,easing,skipTarget=null,skipTargets=new Set()){
    const oldRoot=transitionLayer?.querySelector('.design-stage')||transitionLayer;
    if(!oldRoot)return 0;
    const oldImages=[...oldRoot.querySelectorAll('img')],used=new Set();
    const moved=[];
    for(const target of root.querySelectorAll('img')){
      const src=target.currentSrc||target.src;
      if(!src||target===skipTarget||skipTargets.has(target)||target.closest('.figma-interaction-layer,.figma-component-state'))continue;
      const to=rectPercent(target);
      const source=oldImages.filter(image=>!used.has(image)&&(image.currentSrc||image.src)===src)
        .map(image=>({image,rect:rectPercent(image)}))
        .sort((a,b)=>Math.hypot(a.rect.left-to.left,a.rect.top-to.top,a.rect.width-to.width,a.rect.height-to.height)-Math.hypot(b.rect.left-to.left,b.rect.top-to.top,b.rect.width-to.width,b.rect.height-to.height))[0];
      if(!source)continue;
      const from=source.rect,delta=Math.hypot(from.left-to.left,from.top-to.top,from.width-to.width,from.height-to.height);
      if(delta<.5)continue;
      used.add(source.image);const sourceOpacity=getComputedStyle(source.image).opacity;source.image.style.opacity='0';
      motionRestores.push([target,target.style.opacity]);target.style.opacity='0';
      const moving=source.image.cloneNode(false);moving.removeAttribute('id');moving.alt='';moving.draggable=false;
      Object.assign(moving.style,{position:'absolute',left:`${to.left}%`,top:`${to.top}%`,width:`${to.width}%`,height:`${to.height}%`,margin:'0',transform:'none',transformOrigin:'0 0',willChange:'transform',zIndex:'1',opacity:sourceOpacity||'1'});
      ensureMotionLayer().append(moving);
      const startX=(from.left-to.left)/to.width*100,startY=(from.top-to.top)/to.height*100;
      const startScaleX=from.width/to.width,startScaleY=from.height/to.height;
      motionAnimations.push(moving.animate([
        {transform:`translate(${startX}%,${startY}%) scale(${startScaleX},${startScaleY})`},
        {transform:'translate(0,0) scale(1,1)'}
      ],{duration,easing,fill:'forwards'}));
      moved.push(target);
    }
    return moved;
  }
  function animatePersonalBoardGroup(fromId,root,duration,easing){
    // In this Chapter 1 Smart Animate edge, the destination's flattened board
    // artwork also contains the character/role cards. Move the source board
    // and its card overlays as one composition so the cards stay attached.
    if(fromId!=='8:581'||current!=='8:596')return new Set();
    const oldRoot=transitionLayer?.querySelector('.design-stage');
    const sourceMat=oldRoot?.querySelector('[data-screen-asset-index="0"]');
    const targetMat=root.querySelector('[data-screen-asset-index="0"]');
    const sourceCards=['1','2'].map(index=>oldRoot?.querySelector(`[data-screen-asset-index="${index}"]`));
    const targetCards=['1','2'].map(index=>root.querySelector(`[data-screen-asset-index="${index}"]`));
    if(!sourceMat||!targetMat||sourceCards.some(image=>!image)||targetCards.some(image=>!image))return new Set();
    const from=rectPercent(sourceMat),to=rectPercent(targetMat);
    if(!from.width||!from.height||!to.width||!to.height)return new Set();
    const skipped=new Set([targetMat,...targetCards]);
    for(const image of [sourceMat,...sourceCards])image.style.opacity='0';
    for(const image of skipped){motionRestores.push([image,image.style.opacity]);image.style.opacity='0';}
    const group=document.createElement('div');
    group.className='personal-board-motion-group';
    Object.assign(group.style,{position:'absolute',left:`${to.left}%`,top:`${to.top}%`,width:`${to.width}%`,height:`${to.height}%`,transformOrigin:'0 0',willChange:'transform'});
    const sourceImages=[sourceMat,...sourceCards];
    sourceImages.forEach((source,index)=>{
      const rect=rectPercent(source),clone=source.cloneNode(false);
      clone.removeAttribute('id');clone.alt='';clone.draggable=false;
      Object.assign(clone.style,{position:'absolute',left:`${(rect.left-from.left)/from.width*100}%`,top:`${(rect.top-from.top)/from.height*100}%`,width:`${rect.width/from.width*100}%`,height:`${rect.height/from.height*100}%`,margin:'0',transform:'none',transformOrigin:'0 0',zIndex:String(index+1),opacity:'1'});
      group.append(clone);
    });
    ensureMotionLayer().append(group);
    motionAnimations.push(group.animate([
      {transform:`translate(${(from.left-to.left)/to.width*100}%,${(from.top-to.top)/to.height*100}%) scale(${from.width/to.width},${from.height/to.height})`},
      {transform:'translate(0,0) scale(1,1)'}
    ],{duration,easing,fill:'forwards'}));
    return skipped;
  }
  function animateRoleCard(fromId,root,motion,duration,easing){
    const sourceFrame=flow.frames[fromId],targetFrame=flow.frames[current];
    const fromScreen=window.BangDesign.definitions.get(sourceFrame?.screenId);
    const toScreen=window.BangDesign.definitions.get(targetFrame?.screenId);
    const destination=toScreen?.images?.map((asset,index)=>({asset,index,bounds:asset.visibleBounds||asset.bounds}))
      .filter(entry=>entry.bounds?.[2]>200&&entry.bounds?.[3]>300)
      .sort((a,b)=>b.bounds[2]*b.bounds[3]-a.bounds[2]*a.bounds[3])[0];
    if(!fromScreen||!destination)return;
    const clickX=motion.matrix[0][2]+motion.size.x/2,clickY=motion.matrix[1][2]+motion.size.y/2;
    const source=fromScreen.images.map(asset=>({asset,bounds:asset.visibleBounds||asset.bounds}))
      .filter(entry=>entry.bounds?.[2]>80&&entry.bounds?.[3]>100)
      .sort((a,b)=>Math.hypot(a.bounds[0]+a.bounds[2]/2-clickX,a.bounds[1]+a.bounds[3]/2-clickY)-Math.hypot(b.bounds[0]+b.bounds[2]/2-clickX,b.bounds[1]+b.bounds[3]/2-clickY))[0];
    const targetImage=root.querySelector(`[data-screen-asset-index="${destination.index}"]`);
    if(!source||!targetImage)return;
    motionRestores.push([targetImage,targetImage.style.opacity]);targetImage.style.opacity='0';
    ensureMotionLayer();
    const card=document.createElement('div');card.className='role-smart-card';
    const back=document.createElement('img');back.src=source.asset.src;back.alt='';
    const face=document.createElement('img');face.src=destination.asset.src;face.alt='';
    back.className='role-smart-card-back';face.className='role-smart-card-face';card.append(back,face);motionLayer.append(card);app.append(motionLayer);
    const [sx,sy,sw,sh]=source.bounds,[tx,ty,tw,th]=destination.bounds;
    const pct=(n,total)=>`${n/total*100}%`;
    const startX=(sx-tx)/tw*100,startY=(sy-ty)/th*100;
    Object.assign(card.style,{left:pct(tx,390),top:pct(ty,844),width:pct(tw,390),height:pct(th,844),transformOrigin:'0 0',willChange:'transform'});
    const turn=document.createElement('div');turn.className='role-smart-card-turn';
    card.replaceChildren(turn);turn.append(back,face);
    motionAnimations.push(card.animate([
      {transform:`translate(${startX}%,${startY}%) scale(${sw/tw},${sh/th})`},
      {transform:'translate(0,0) scale(1,1)'}
    ],{duration:motionDuration('--duration-card',500),easing,fill:'forwards'}));
    motionAnimations.push(turn.animate([
      {transform:'rotateY(0deg)'},
      {transform:'rotateY(180deg)'}
    ],{duration:motionDuration('--duration-flip',700),easing,fill:'forwards'}));
    return targetImage;
  }
  const roleSelectionSlotByScreen=new Map([[133,0],[134,1],[135,2],[136,3]]);
  function animateRoleCardReturn(fromId,root,duration,easing){
    const fromScreenId=flow.frames[fromId]?.screenId,toScreenId=flow.frames[current]?.screenId;
    const slot=roleSelectionSlotByScreen.get(fromScreenId);
    if(slot===undefined||toScreenId!==137)return;
    const sourceDefinition=window.BangDesign.definitions.get(fromScreenId);
    const targetDefinition=window.BangDesign.definitions.get(toScreenId);
    const sourceAsset=sourceDefinition?.images?.map((asset,index)=>({asset,index,bounds:asset.visibleBounds||asset.bounds}))
      .filter(entry=>entry.bounds?.[2]>200&&entry.bounds?.[3]>300)
      .sort((a,b)=>b.bounds[2]*b.bounds[3]-a.bounds[2]*a.bounds[3])[0];
    const targetAsset=targetDefinition?.images?.[slot];
    const oldRoot=transitionLayer?.querySelector('.design-stage')||transitionLayer;
    const sourceImage=oldRoot?.querySelector(`[data-screen-asset-index="${sourceAsset?.index}"]`);
    const targetImage=root.querySelector(`[data-screen-asset-index="${slot}"]`);
    if(!sourceAsset||!targetAsset||!sourceImage||!targetImage)return;
    const from=rectPercent(sourceImage),to=rectPercent(targetImage);
    if(!from.width||!from.height||!to.width||!to.height)return;
    motionRestores.push([sourceImage,sourceImage.style.opacity]);sourceImage.style.opacity='0';
    motionRestores.push([targetImage,targetImage.style.opacity]);targetImage.style.opacity='0';
    ensureMotionLayer();
    const card=document.createElement('div');card.className='role-smart-card';
    const back=document.createElement('img');back.src=targetImage.currentSrc||targetImage.src;back.alt='';back.className='role-smart-card-back';
    const face=document.createElement('img');face.src=sourceImage.currentSrc||sourceImage.src;face.alt='';face.className='role-smart-card-face';
    const turn=document.createElement('div');turn.className='role-smart-card-turn';turn.append(back,face);card.append(turn);
    Object.assign(card.style,{left:`${to.left}%`,top:`${to.top}%`,width:`${to.width}%`,height:`${to.height}%`,transformOrigin:'0 0',willChange:'transform'});
    ensureMotionLayer().append(card);
    const startX=(from.left-to.left)/to.width*100,startY=(from.top-to.top)/to.height*100;
    motionAnimations.push(card.animate([
      {transform:`translate(${startX}%,${startY}%) scale(${from.width/to.width},${from.height/to.height})`},
      {transform:'translate(0,0) scale(1,1)'}
    ],{duration:motionDuration('--duration-card',500),easing,fill:'forwards'}));
    motionAnimations.push(turn.animate([
      {transform:'rotateY(180deg)'},
      {transform:'rotateY(0deg)'}
    ],{duration:motionDuration('--duration-flip',700),easing,fill:'forwards'}));
    return targetImage;
  }
  const revealedRoleExitBackByScreen=new Map([[132,2],[49,1],[60,1],[71,1]]);
  function animateRevealedRoleToBack(fromId,root,easing){
    const fromScreenId=flow.frames[fromId]?.screenId,toScreenId=flow.frames[current]?.screenId;
    const targetIndex=revealedRoleExitBackByScreen.get(toScreenId);
    if(![66,67,68,69].includes(fromScreenId)||targetIndex===undefined)return;
    const oldRoot=transitionLayer?.querySelector('.design-stage')||transitionLayer;
    const sourceImage=oldRoot?.querySelector('[data-screen-asset-index="2"]');
    const targetImage=root.querySelector(`[data-screen-asset-index="${targetIndex}"]`);
    if(!sourceImage||!targetImage)return;
    const from=rectPercent(sourceImage),to=rectPercent(targetImage);
    if(!from.width||!from.height||!to.width||!to.height)return;
    motionRestores.push([sourceImage,sourceImage.style.opacity]);sourceImage.style.opacity='0';
    motionRestores.push([targetImage,targetImage.style.opacity]);targetImage.style.opacity='0';
    ensureMotionLayer();
    const card=document.createElement('div');card.className='role-smart-card';
    const back=document.createElement('img');back.src=targetImage.currentSrc||targetImage.src;back.alt='';back.className='role-smart-card-back';
    const face=document.createElement('img');face.src=sourceImage.currentSrc||sourceImage.src;face.alt='';face.className='role-smart-card-face';
    const turn=document.createElement('div');turn.className='role-smart-card-turn';turn.append(back,face);card.append(turn);
    Object.assign(card.style,{left:`${to.left}%`,top:`${to.top}%`,width:`${to.width}%`,height:`${to.height}%`,transformOrigin:'0 0',willChange:'transform'});
    ensureMotionLayer().append(card);
    const startX=(from.left-to.left)/to.width*100,startY=(from.top-to.top)/to.height*100;
    motionAnimations.push(card.animate([
      {transform:`translate(${startX}%,${startY}%) scale(${from.width/to.width},${from.height/to.height})`},
      {transform:'translate(0,0) scale(1,1)'}
    ],{duration:motionDuration('--duration-card',500),easing,fill:'forwards'}));
    motionAnimations.push(turn.animate([
      {transform:'rotateY(180deg)'},
      {transform:'rotateY(0deg)'}
    ],{duration:motionDuration('--duration-flip',700),easing,fill:'forwards'}));
    return targetImage;
  }
  const showcaseRoleByScreen=new Map([[37,0],[38,0],[39,1],[43,2],[44,3],[45,3],[46,3]]);
  function animateRoleLineupEntrance(fromId,root){
    // The four small role cards first form a lineup on this single Chapter 2
    // edge. Dissolve them in reading order once; later role close-ups retain
    // their separate Smart Animate movement and must not replay this entrance.
    if(fromId!=='35:1076'||current!=='35:1092')return {targets:new Set(),duration:0};
    const definition=window.BangDesign.definitions.get(42);
    const cards=definition?.images?.map((asset,index)=>({asset,index}))
      .filter(({asset})=>asset.name==='role card')||[];
    const targets=new Set();
    const duration=motionDuration('--duration-dissolve',700);
    const stagger=motionDuration('--stagger-role-card',450);
    for(const {index} of cards){
      const image=root.querySelector(`[data-screen-asset-index="${index}"]`);
      if(!image)continue;
      targets.add(image);motionRestores.push([image,roleLineupOriginalOpacity.get(image)??image.style.opacity]);image.style.opacity='0';
      motionAnimations.push(image.animate([{opacity:0},{opacity:1}],{
        duration,delay:targets.size>0?(targets.size-1)*stagger:0,
        easing:'ease-in-out',fill:'forwards'
      }));
    }
    return {targets,duration:targets.size?duration+(targets.size-1)*stagger:0};
  }
  function animateRoleShowcase(fromId,root,duration,easing){
    const fromScreenId=flow.frames[fromId]?.screenId,toScreenId=flow.frames[current]?.screenId;
    const toRole=showcaseRoleByScreen.get(toScreenId);
    if(toRole===undefined)return new Set();
    const sourceStage=transitionLayer?.querySelector('.design-stage');
    const sourceDefinition=window.BangDesign.definitions.get(fromScreenId);
    const targetDefinition=window.BangDesign.definitions.get(toScreenId);
    if(!sourceStage||!sourceDefinition||!targetDefinition||sourceDefinition.images.length<4||targetDefinition.images.length<5)return new Set();
    const sourceImages=[...sourceStage.querySelectorAll('img[data-screen-asset-index]')];
    const targetImages=[...root.querySelectorAll('img[data-screen-asset-index]')];
    const byIndex=(images,index)=>images.find(image=>image.dataset.screenAssetIndex===String(index));
    const oldRole=showcaseRoleByScreen.get(fromScreenId);
    const targetFocus=byIndex(targetImages,4),targetSelected=byIndex(targetImages,toRole);
    if(!targetFocus||!targetSelected)return new Set();
    const handled=new Set(targetImages.filter(image=>Number(image.dataset.screenAssetIndex)<5));
    // The front card replaces its small copy for as long as this role is being explained.
    targetSelected.style.opacity='0';
    if(oldRole===toRole){
      const oldFocus=byIndex(sourceImages,4);
      if(oldFocus&&(oldFocus.currentSrc||oldFocus.src)!==(targetFocus.currentSrc||targetFocus.src)){
        addRoleMotion(oldFocus,targetFocus,duration,easing,1);
        oldFocus.style.opacity='0';
        motionRestores.push([targetFocus,targetFocus.style.opacity]);targetFocus.style.opacity='0';
      }
      return handled;
    }
    const incomingSource=byIndex(sourceImages,toRole);
    if(!incomingSource)return handled;
    addRoleMotion(incomingSource,targetFocus,duration,easing,2);
    incomingSource.style.opacity='0';
    motionRestores.push([targetFocus,targetFocus.style.opacity]);targetFocus.style.opacity='0';
    const outgoingSource=oldRole===undefined?null:byIndex(sourceImages,4);
    const outgoingTarget=oldRole===undefined?null:byIndex(targetImages,oldRole);
    if(outgoingSource&&outgoingTarget){
      addRoleMotion(outgoingSource,outgoingTarget,duration,easing,1);
      outgoingSource.style.opacity='0';
      motionRestores.push([outgoingTarget,outgoingTarget.style.opacity]);outgoingTarget.style.opacity='0';
    }
    return handled;
  }
  function addRoleMotion(startImage,endImage,duration,easing,zIndex){
    const from=rectPercent(startImage),to=rectPercent(endImage);
    if(!from.width||!from.height||!to.width||!to.height)return;
    ensureMotionLayer();
    // Showcase cards are already face-up. Move one copy of the destination
    // artwork so its zoom never crossfades or flips into a duplicate image.
    const card=endImage.cloneNode(false);card.removeAttribute('id');card.alt='';card.setAttribute('aria-hidden','true');
    Object.assign(card.style,{position:'absolute',left:`${to.left}%`,top:`${to.top}%`,width:`${to.width}%`,height:`${to.height}%`,margin:'0',padding:'0',border:'0',opacity:'1',objectFit:'fill',filter:'drop-shadow(3px 3px 1px #000b)',transformOrigin:'0 0',zIndex:String(zIndex),willChange:'transform'});motionLayer.append(card);
    const startX=(from.left-to.left)/to.width*100,startY=(from.top-to.top)/to.height*100;
    const startScaleX=from.width/to.width,startScaleY=from.height/to.height;
    motionAnimations.push(card.animate([
      {transform:`translate(${startX}%,${startY}%) scale(${startScaleX},${startScaleY})`},
      {transform:'translate(0,0) scale(1,1)'}
    ],{duration,easing,fill:'forwards'}));
  }
  function show(id,{hideRoleLineup=false}={}){
    stop();const frame=flow.frames[id];const mode=id===flow.home?'home':id===flow.intro?'intro':'screen';
    for(const [name,surface]of Object.entries(surfaces)){surface.hidden=name!==mode;surface.inert=name!==mode;}
    if(mode==='screen'){
      if(!window.BangDesign.render(frame.screenId,id))throw new Error('Missing screen for Figma frame '+id);
    }
    // Hide the incoming role lineup synchronously, before image decoding yields
    // to paint. Its staggered entrance below is the only time it should appear.
    if(mode==='screen'&&hideRoleLineup&&current==='35:1076'&&id==='35:1092'){
      const definition=window.BangDesign.definitions.get(frame.screenId);
      definition?.images?.forEach((asset,index)=>{
        if(asset.name!=='role card')return;
        const image=surfaces.screen.querySelector(`[data-screen-asset-index="${index}"]`);
        if(!image)return;
        roleLineupOriginalOpacity.set(image,image.style.opacity);image.style.opacity='0';
      });
    }
    current=id;document.title=(id===flow.home?'BANG!':frame.name)+' | 인터랙티브 설명서';
    const root=mode==='screen'?surfaces.screen.querySelector('.design-stage'):surfaces[mode];
    const selectedRole=showcaseRoleByScreen.get(frame.screenId)??roleSelectionSlotByScreen.get(frame.screenId);
    if(mode==='screen'&&selectedRole!==undefined){
      const thumbnail=root.querySelector(`[data-screen-asset-index="${selectedRole}"]`);
      if(thumbnail)thumbnail.style.opacity='0';
    }
    window.BangInteractions.mountFrame(frame,root);
    return root;
  }
  async function change(id,{instant=false,action={},motion=null}={}){
    const token=++revision,fromId=current;
    stop();clearTransition();
    app.setAttribute('aria-busy','true');
    // Chapter one begins with two sparse cover states. Force a visible dissolve
    // across both edges instead of letting the short Figma smart transition snap.
    const chapterOneDissolveEdges=new Set(['35:1427>42:1668','42:1668>8:330','8:330>8:398','8:398>8:422']);
    const chapterOneDissolve=chapterOneDissolveEdges.has(`${fromId}>${id}`);
    const chapterTwoRoleLineup=fromId==='35:1076'&&id==='35:1092';
    const smart=action.transitionType==='SMART_ANIMATE'&&!chapterOneDissolve;
    const screenDuration=motionDuration('--duration-screen',600);
    const dissolveDuration=motionDuration('--duration-dissolve',700);
    const duration=instant?0:reduced.matches?0:chapterOneDissolve?Math.max(dissolveDuration,700):smart?screenDuration:dissolveDuration;
    let waitDuration=duration;
    const easing=easingFor(action);
    try{
      if(token!==revision)return;
      if(duration&&!chapterTwoRoleLineup){
        const outgoing=Object.values(surfaces).find(surface=>!surface.hidden);
        if(outgoing){
          transitionLayer=outgoing.cloneNode(true);
          transitionLayer.removeAttribute('id');
          transitionLayer.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
          transitionLayer.removeAttribute('hidden');
          transitionLayer.inert=true;
          transitionLayer.setAttribute('aria-hidden','true');
          transitionLayer.classList.add('screen-transition-layer');
          // Text is rendered as live HTML for editing. Fading a second copy of
          // the outgoing text over the new frame makes glyphs look briefly
          // smaller or doubled while their positions and fitted widths differ.
          transitionLayer.querySelectorAll('.design-copy,.design-speech-copy').forEach(node=>node.remove());
        }
      }
      const root=show(id,{hideRoleLineup:chapterTwoRoleLineup&&duration>0&&smart});
      if(transitionLayer){app.append(transitionLayer);animateDialogueExit();}
      // Wait for local image decoding before revealing a new composition.
      await Promise.all([...root.querySelectorAll('img')].filter(img=>!img.loading||img.loading!=='lazy').map(img=>img.decode?.().catch(()=>{})));
      if(token!==revision)return;
      if(duration&&smart){
        const roleTarget=motion?.matrix?animateRoleCard(fromId,root,motion,duration,easing):null;
        const roleReturnTarget=animateRoleCardReturn(fromId,root,duration,easing);
        const revealedRoleBackTarget=animateRevealedRoleToBack(fromId,root,easing);
        const roleShowcaseTargets=animateRoleShowcase(fromId,root,motionDuration('--duration-card',500),easing);
        const roleLineup=animateRoleLineupEntrance(fromId,root);
        waitDuration=Math.max(waitDuration,roleLineup.duration);
        const personalBoardTargets=animatePersonalBoardGroup(fromId,root,duration,easing);
        const skippedTargets=new Set([...roleShowcaseTargets,...roleLineup.targets,...personalBoardTargets]);
        const embedded=targetsInsideNewComposites(fromId,root);
        const moved=animateSharedImages(root,duration,easing,roleTarget||roleReturnTarget||revealedRoleBackTarget,skippedTargets);
        const heldComposites=new Set();
        moved.forEach(target=>embedded.get(target)?.forEach(composite=>heldComposites.add(composite)));
        if(heldComposites.size){
          // Keep the outgoing composition as a clean backdrop while a child
          // moves out of a flattened destination group. Reveal that group only
          // at handoff, when its baked-in copy exactly replaces the moving one.
          heldComposites.forEach(composite=>{motionRestores.push([composite,composite.style.opacity]);composite.style.opacity='0';});
        }else{
        // Smart Animate is composed from individual matched layers. Fading the
        // whole outgoing frame as a fallback doubles unmatched artwork and
        // leaves visible trails, so keep the destination as the sole static
        // composition even when no image pair can be animated.
        transitionLayer?.remove();transitionLayer=null;
        }
      }
      // Every non-smart Figma transition (including slide/instant types) uses
      // the site's standard dissolve so the flow stays visually consistent.
      if(duration&&transitionLayer&&!smart){
        animation=transitionLayer.animate([{opacity:1},{opacity:0}],{duration,easing,fill:'forwards'});
      }
      if(duration&&chapterOneDissolve){
        motionAnimations.push(root.animate([{opacity:0},{opacity:1}],{duration,easing,fill:'forwards'}));
      }
      if(duration){const animations=[animation?.finished,...motionAnimations.map(player=>player.finished)].filter(Boolean);await Promise.race([Promise.all(animations),new Promise(resolve=>setTimeout(resolve,waitDuration+100))]);}
      if(token!==revision)return;
      clearTransition();app.removeAttribute('aria-busy');
      root.tabIndex=-1;root.focus({preventScroll:true});
      window.BangInteractions.activate();
    }catch(error){if(error.name!=='AbortError'){console.error(error);app.dispatchEvent(new CustomEvent('bang-error',{detail:error.message}));}}
    finally{if(token===revision){clearTransition();app.removeAttribute('aria-busy');}}
  }
  function go(value,options={}){
    const id=identify(value);if(!id)return false;
    const hash=address(id,options.card);
    if(hash===location.hash&&!options.force)return false;
    const index=(history.state?.bang?history.state.index:0)+(options.replace?0:1);
    const state={bang:true,index,frame:id,...(Number.isInteger(options.card)?{card:options.card}:{})};
    history[options.replace?'replaceState':'pushState'](state,'',hash);
    void change(id,options);return true;
  }
  function transitionFromHistory(fromId,toId){
    const frame=flow.frames[fromId];
    const edge=[...(frame?.hotspots||[]),...(frame?.automatic||[])]
      .find(item=>item.target===toId);
    return edge?.action||{};
  }
  window.BangRouter={go,back:()=>history.state?.bang&&history.state.index>0?history.back():go('home'),get current(){return current;},address};
  let lastURL=location.href;
  function sync(){if(location.href===lastURL&&current===fromURL()&&history.state?.card===undefined)return;lastURL=location.href;const target=fromURL();void change(target,{action:transitionFromHistory(current,target)});}
  window.addEventListener('popstate',()=>{lastURL='';sync();});
  window.addEventListener('hashchange',()=>{if(current!==fromURL())sync();});
  const id=fromURL();if(!history.state?.bang)history.replaceState({bang:true,index:0,frame:id},'');
  show(id);window.BangInteractions.activate();
})();
