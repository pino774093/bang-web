(() => {
  const flow=window.BANG_FIGMA_FLOW;
  let timers=[],overlay=null,active=null;
  const clearTimers=()=>{timers.forEach(clearTimeout);timers=[];};
  // Hold each dark Chapter 3 title for 1.2s after the role-draw scene.
  for(const id of ['42:1946','42:1966','42:1983','42:2000']){
    const frame=flow.frames[id];
    if(frame?.automatic?.[0])frame.automatic[0].delay=1.2;
  }
  // After the role is drawn, the four Chapter 3 "체험 하기" cards advance
  // without a tap. Preserve each Figma destination and transition animation.
  for(const id of ['42:1954','42:1974','42:1991','42:2008']){
    const frame=flow.frames[id];
    if(!frame)continue;
    const outgoing=frame.automatic?.find(item=>item.label==='체험 하기')||
      frame.hotspots?.find(item=>item.label==='체험 하기');
    if(!outgoing)continue;
    frame.hotspots=frame.hotspots.filter(item=>item!==outgoing);
    frame.automatic=frame.automatic.filter(item=>item!==outgoing);
    outgoing.trigger='AFTER_TIMEOUT';
    outgoing.delay=1.2;
    frame.automatic.push(outgoing);
  }
  // All revealed role cards leave automatically after 1.1s via their existing
  // Smart Animate exit. The final two were still wired to wait for a click.
  for(const id of ['42:2043','47:670','47:1189','47:2108']){
    const frame=flow.frames[id];
    if(!frame)continue;
    const outgoing=frame.automatic?.find(item=>item.label==='보안관')||
      frame.hotspots?.find(item=>item.label==='보안관');
    if(!outgoing)continue;
    frame.hotspots=frame.hotspots.filter(item=>item!==outgoing);
    frame.automatic=frame.automatic.filter(item=>item!==outgoing);
    outgoing.trigger='AFTER_TIMEOUT';
    outgoing.delay=1.1;
    frame.automatic.push(outgoing);
  }
  // Let the Remington equip sequence and its immediate follow-up play states
  // remain visible after each Smart Animate transition instead of chaining
  // through the exported 0–20ms timeouts.
  for(const id of [
    '47:231','47:2306','47:868','47:1387',
    '47:216','47:2328','47:890','47:1409',
    '47:253','47:2377','47:939','47:2456'
  ]){
    const frame=flow.frames[id];
    if(frame?.automatic?.length)frame.automatic[0].delay=1;
  }
  function place(el,item){
    const [[a,c,x],[b,d,y]]=item.matrix;
    Object.assign(el.style,{left:`${x/390*100}%`,top:`${y/844*100}%`,width:`${item.size.x/390*100}%`,height:`${item.size.y/844*100}%`,transform:`matrix(${a},${b},${c},${d},0,0)`,transformOrigin:'0 0'});
  }
  function run(item,button){
    if(document.querySelector('#app').hasAttribute('aria-busy'))return;
    const kind=item.action.navigationType;
    if(kind==='SWAP_STATE'){
      if(!button||!item.component?.length)return;
      let view=button.querySelector('.figma-component-state');
      if(!view){view=document.createElement('span');view.className='figma-component-state';button.append(view);}
      view.replaceChildren();
      for(const layer of item.component){const img=document.createElement('img');img.src=layer.src;img.alt='';img.style.width='100%';img.style.height='100%';img.style.objectFit='contain';view.append(img);}
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
        const styles=getComputedStyle(document.documentElement);
        const duration=parseFloat(styles.getPropertyValue('--duration-flip'))||700;
        const easing=styles.getPropertyValue('--ease-natural').trim()||'ease-in-out';
        view.animate([{transform:'rotateY(90deg)'},{transform:'rotateY(0)'}],{duration,easing});
      }
      button.setAttribute('aria-pressed','true');return;
    }
    if(kind==='SCROLL_TO'){
      const point=item.targetMatrix?.map(row=>row[2]);
      if(point){const viewport=overlay?.parentElement;viewport?.scrollTo?.({left:Math.max(0,point[0]),top:Math.max(0,point[1]),behavior:'smooth'});}
      return;
    }
    if(item.target&&flow.frames[item.target]){
      if([133,134,135,136].includes(flow.frames[item.target].screenId))window.BangEffects?.playPaperFlip();
      const roleCard=active?.id==='5:229'&&item.action.transitionType==='SMART_ANIMATE'?{matrix:item.matrix,size:item.size}:null;
      const action=item.label==='처음으로'&&item.target===flow.home
        ?{...item.action,transitionType:'DISSOLVE'}:item.action;
      window.BangRouter.go(item.target,{replace:item.trigger==='AFTER_TIMEOUT',action,motion:roleCard});
    }
  }
  window.BangInteractions={
    // The renderer is also used by the design review page; routing mounts separately.
    mount(){},
    cancel(){clearTimers();active=null;},
    mountFrame(frame,root){
      clearTimers();active=frame;document.querySelectorAll('.figma-interaction-layer').forEach(el=>el.remove());
      // Visible artwork remains untouched. Only source-derived targets handle input.
      for(const button of root.querySelectorAll('button')){button.inert=true;button.tabIndex=-1;button.style.pointerEvents='none';button.setAttribute('aria-hidden','true');}
      root.onclick=null;root.onkeydown=null;
      if(frame.id===flow.cards){window.BangCards.mount(root);return;}
      overlay=document.createElement('div');overlay.className='figma-interaction-layer';overlay.dataset.frame=frame.id;root.append(overlay);
      if(frame.id===flow.menu){
        const logoHome=document.createElement('button');logoHome.type='button';logoHome.className='figma-hotspot';
        logoHome.setAttribute('aria-label','BANG! 홈으로');logoHome.title='홈으로';
        Object.assign(logoHome.style,{left:'74px',top:'34px',width:'239px',height:'145px'});
        logoHome.addEventListener('click',event=>{event.stopPropagation();window.BangRouter.go('home',{action:{transitionType:'DISSOLVE',transitionDuration:.4}});});
        overlay.append(logoHome);
      }
      for(const item of frame.hotspots){
        const button=document.createElement('button');button.type='button';button.className='figma-hotspot';button.dataset.sourceNode=item.source;button.dataset.targetFrame=item.target||'';
        let label=item.label;
        if(['Rectangle 8','Group 6','Group 9'].includes(label))label='다음 대사';
        const isBack=item.label==='뒤로 가기'||(item.size.x<90&&item.size.y<90&&item.matrix[0][2]<80&&item.matrix[1][2]<80);
        if(isBack)label='뒤로 가기';
        button.setAttribute('aria-label',label);place(button,item);button.addEventListener('click',event=>{event.stopPropagation();if(isBack)window.BangRouter.back();else run(item,button);});overlay.append(button);
      }
      const screen=window.BangDesign?.definitions.get(frame.screenId);
      const hasBackHotspot=frame.hotspots.some(item=>item.label==='뒤로 가기'||(item.size.x<90&&item.size.y<90&&item.matrix[0][2]<80&&item.matrix[1][2]<80));
      if(screen?.back&&!hasBackHotspot){
        const button=document.createElement('button');button.type='button';button.className='figma-hotspot';
        button.setAttribute('aria-label','뒤로 가기');
        Object.assign(button.style,{left:'5px',top:'6px',width:'68px',height:'68px'});
        button.addEventListener('click',event=>{event.stopPropagation();window.BangRouter.back();});overlay.append(button);
      }
    },
    activate(){
      clearTimers();if(!active)return;
      if(new URLSearchParams(location.search).get('review')==='1')return;
      const frame=active;
      for(const item of frame.automatic)timers.push(setTimeout(()=>{if(active===frame&&window.BangRouter.current===frame.id)run(item);},Math.max(16,item.delay*1000)));
    },
    get active(){return active;}
  };
})();
