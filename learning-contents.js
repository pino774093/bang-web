/* Expandable contents for learning screens only. Coordinates are in the 390px canvas. */
(() => {
  const steps=[
    {title:'카드 종류 설명 & 세팅',topics:[['구성','8:398'],['개인 세팅','8:489'],['전체 세팅','128:1063']]},
    {title:'각 역할과 승리 조건',topics:[['보안관','35:1114'],['부관','42:1728'],['무법자','35:1212'],['배신자','35:1228'],['역할 탐색','94:185']]},
    {title:'내 턴에는 뭘 해야할까?',topics:[['카드 뽑기','139:236'],['카드 사용','139:249'],['카드 버리기','139:265'],['사용 타이밍','turn-timing'],['내 턴 주의사항','turn-cautions']]},
    {title:'누구를 공격할 수 있을까?',topics:[]},
    {title:'초보자들을 위한 Tip!',topics:[]}
  ];
  // Several animation/text frames belong to the same visible subtopic.
  const pageGroups=[
    [['8:398','8:422','8:435','8:449','8:473','47:80','47:94','128:1041'],['8:489','8:501','8:514','8:540','8:566','8:581','124:980','8:685','128:1017','128:996','124:909'],['128:1063','136:12','136:37','131:1268','136:118','136:197']],
    [['35:1114','35:1131','94:200'],['42:1728','94:224'],['35:1212','94:248'],['35:1228','35:1374','35:1390','35:1406','94:272'],['94:185']],
    [['139:236'],['139:249'],['139:265','139:351'],['turn-timing','turn-start'],['turn-cautions']]
  ];
  function topicFor(id){
    for(let step=0;step<pageGroups.length;step++)for(let topic=0;topic<pageGroups[step].length;topic++){
      if(pageGroups[step][topic].includes(id))return {step,topic,key:`topic:${step}:${topic}`,label:steps[step].topics[topic][0]};
    }
    return null;
  }
  function layout(expanded){
    const rows=[],positions=[];let y=16;
    steps.forEach((step,i)=>{
      positions.push(y);rows.push({key:'step:'+i,step:i,center:y+21});
      if(i===expanded)step.topics.forEach(([label,to],j)=>rows.push({key:`topic:${i}:${j}`,step:i,topic:j,label,to,center:y+82+j*44+20}));
      y+=112+(i===expanded?step.topics.length*44+14:0);
    });
    return {rows,positions,footerTop:y,height:y+148};
  }
  function nearest(rows,y){return rows.reduce((a,b)=>Math.abs(a.center-y)<=Math.abs(b.center-y)?a:b);}
  function mount(panel,shortcuts,{currentStep,currentId,go,message}){
    const currentTopic=topicFor(currentId);
    const create=(tag,cls,parent)=>{const n=document.createElement(tag);n.className=cls;parent.append(n);return n;};
    const viewport=create('div','learning-contents-scroll',panel);
    const content=create('div','learning-contents-body',viewport);
    const track=create('div','learning-drawer-track',content);track.setAttribute('aria-hidden','true');
    const live=create('p','sr-only',panel);live.setAttribute('role','status');
    let expanded=-1,selected='step:'+Math.max(0,Math.min(4,currentStep-1)),previewKey=selected,drag=null,raf=null,disposed=false;
    let geometry=layout(expanded);
    const main=[],lists=[],dots=[];
    steps.forEach((step,i)=>{
      const button=create('button','learning-drawer-step',content);button.type='button';button.dataset.step=String(i+1);
      const label=create('span','',button);label.textContent='Step '+(i+1);
      const title=create('span','',button);title.textContent=step.title;
      if(i+1===currentStep)button.setAttribute('aria-current','step');
      if(step.topics.length){button.setAttribute('aria-controls','learning-topics-'+i);button.setAttribute('aria-expanded','false');}
      button.onclick=()=>choose({key:'step:'+i,step:i});main.push(button);
      const dot=create('span','learning-drawer-dot',content);dot.setAttribute('aria-hidden','true');dots.push(dot);
      const list=create('div','learning-contents-topics',content);list.id='learning-topics-'+i;list.inert=true;lists.push(list);
      step.topics.forEach(([name,to],j)=>{
        const topic=create('button','learning-contents-subtopic',list);topic.type='button';topic.dataset.target=to;topic.style.top=j*44+'px';
        topic.textContent='— '+name;if(currentTopic?.step===i&&currentTopic.topic===j)topic.setAttribute('aria-current','page');topic.onclick=()=>choose({key:`topic:${i}:${j}`,step:i,topic:j,to});
        const point=create('span','learning-drawer-dot',list);point.style.top=j*44+16+'px';point.setAttribute('aria-hidden','true');
      });
    });
    const star=create('button','learning-drawer-star',content);star.type='button';star.setAttribute('role','slider');star.setAttribute('aria-label','별을 위아래로 움직여 STEP과 하위 목차 선택');star.setAttribute('aria-orientation','vertical');star.setAttribute('aria-valuemin','1');
    content.append(shortcuts);
    function row(key){return geometry.rows.find(r=>r.key===key)||geometry.rows[0];}
    function preview(key,y=row(key).center){
      previewKey=key;const item=row(key);star.style.top=y-17+'px';star.setAttribute('aria-valuemax',String(geometry.rows.length));star.setAttribute('aria-valuenow',String(geometry.rows.indexOf(item)+1));star.setAttribute('aria-valuetext',`Step ${item.step+1}${item.to?' '+item.label:' '+steps[item.step].title}`);
      main.forEach((b,i)=>b.classList.toggle('is-drag-target',!!drag&&item.key==='step:'+i));
      for(const b of content.querySelectorAll('.learning-contents-subtopic'))b.classList.toggle('is-drag-target',!!drag&&b.dataset.target===item.to);
    }
    function draw(){
      geometry=layout(expanded);
      main.forEach((button,i)=>{
        const y=geometry.positions[i],open=i===expanded;
        button.style.top=y+'px';dots[i].style.top=y+16+'px';
        if(steps[i].topics.length)button.setAttribute('aria-expanded',String(open));
        const list=lists[i];list.style.top=y+82+'px';list.style.height=(open?steps[i].topics.length*44:0)+'px';list.classList.toggle('is-expanded',open);list.inert=!open;
      });
      track.style.top=geometry.rows[0].center+'px';track.style.height=geometry.rows.at(-1).center-geometry.rows[0].center+'px';
      shortcuts.style.top=geometry.footerTop+'px';content.style.height=geometry.height+'px';
      if(!geometry.rows.some(r=>r.key===selected))selected='step:'+Math.max(0,expanded);
      preview(selected);
    }
    function choose(item){
      if(item.to){go(item.to);return;}
      if(!steps[item.step].topics.length){message(`Step ${item.step+1}는 준비 중입니다.`);preview(selected);return;}
      expanded=expanded===item.step?-1:item.step;
      selected=expanded===currentTopic?.step?currentTopic.key:item.key;draw();
      live.textContent=expanded<0?`Step ${item.step+1} 하위 목차 접힘`:`Step ${item.step+1} 하위 목차 ${steps[item.step].topics.length}개 펼침`;
      // Keep the selected heading visible while the following content expands.
      const top=row(selected).center-21;
      if(top<viewport.scrollTop||top+42>viewport.scrollTop+viewport.clientHeight)viewport.scrollTo({top:Math.max(0,top-16),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    }
    function pointerPreview(){
      if(!drag)return;
      const rect=viewport.getBoundingClientRect(),scale=panel.getBoundingClientRect().height/844||1;
      const center=Math.max(geometry.rows[0].center,Math.min(geometry.rows.at(-1).center,(drag.clientY-rect.top)/scale+viewport.scrollTop-drag.grabOffset));
      preview(nearest(geometry.rows,center).key,center);
    }
    function autoScroll(){
      if(!drag||disposed)return;
      const r=viewport.getBoundingClientRect(),scale=panel.getBoundingClientRect().height/844||1;
      const y=(drag.clientY-r.top)/scale,height=r.height/scale;
      const delta=y<40?-Math.min(12,(40-y)/3):y>height-40?Math.min(12,(y-height+40)/3):0;
      if(delta){viewport.scrollTop+=delta;pointerPreview();}
      raf=requestAnimationFrame(autoScroll);
    }
    star.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;e.preventDefault();const scale=panel.getBoundingClientRect().height/844||1,r=star.getBoundingClientRect();
      drag={id:e.pointerId,clientY:e.clientY,grabOffset:(e.clientY-r.top-r.height/2)/scale};star.setPointerCapture(e.pointerId);star.classList.add('is-dragging');raf=requestAnimationFrame(autoScroll);
    });
    star.addEventListener('pointermove',e=>{if(drag?.id===e.pointerId){drag.clientY=e.clientY;pointerPreview();}});
    function finish(e,cancelled){
      if(drag?.id!==e.pointerId)return;
      if(!cancelled){drag.clientY=e.clientY;pointerPreview();}
      const item=row(previewKey);drag=null;cancelAnimationFrame(raf);star.classList.remove('is-dragging');preview(selected);
      if(!cancelled)choose(item);
    }
    star.addEventListener('pointerup',e=>finish(e,false));star.addEventListener('pointercancel',e=>finish(e,true));star.addEventListener('lostpointercapture',e=>finish(e,true));
    star.addEventListener('keydown',e=>{
      let index=geometry.rows.indexOf(row(previewKey));
      if(e.key==='ArrowDown')index=Math.min(geometry.rows.length-1,index+1);
      else if(e.key==='ArrowUp')index=Math.max(0,index-1);
      else if(e.key==='Home')index=0;else if(e.key==='End')index=geometry.rows.length-1;
      else if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(row(previewKey));return;}else return;
      e.preventDefault();const item=geometry.rows[index];preview(item.key);
      const top=item.center-30;if(top<viewport.scrollTop||item.center+30>viewport.scrollTop+viewport.clientHeight)viewport.scrollTo({top:Math.max(0,top-viewport.clientHeight/2),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    });
    draw();
    return ()=>{disposed=true;drag=null;cancelAnimationFrame(raf);};
  }
  window.BangContents={steps,topicFor,layout,nearest,mount};
})();
