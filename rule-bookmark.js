/* STEP-only draggable shortcut, kept within the visible learning screen. */
(() => {
 const app=document.querySelector('#app');
 const root=document.createElement('aside');root.className='rule-bookmark';root.hidden=true;root.setAttribute('aria-label','카드와 규칙 바로가기');
 const button=document.createElement('button');button.type='button';button.className='rule-bookmark-button';button.innerHTML='<svg class="rule-bookmark-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span aria-hidden="true">카드&amp;규칙<i class="rule-bookmark-word-gap"></i>찾기</span>';root.append(button);document.body.append(root);
 let route=null,opened=false,suspended=false,drag=null,suppressClick=false,edge=null;
 function label(){button.setAttribute('aria-expanded',String(opened));button.setAttribute('aria-label',opened?'카드&규칙 찾기':'카드&규칙 찾기 펼치기');}
 function position(){
  if(root.hidden||drag)return;
  if(edge){placeAtEdge();return;}
  const rect=app.getBoundingClientRect();
  // Keep the button inside the screen, allowing it to overlap the timber edge.
  root.style.left=Math.max(rect.left,rect.right-root.offsetWidth)+'px';
  root.style.top=clamp(rect.top+rect.height*.22,rect.top,Math.max(rect.top,rect.bottom-root.offsetHeight))+'px';
 }
 function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
 function placeAtEdge(){
  const rect=app.getBoundingClientRect();
  const right=edge==='right';
  root.classList.toggle('edge-left',!right);root.classList.toggle('edge-right',right);
  root.style.left=(right?Math.max(rect.left,rect.right-root.offsetWidth):rect.left)+'px';
  root.style.top=clamp(parseFloat(root.style.top)||rect.top,rect.top,Math.max(rect.top,rect.bottom-root.offsetHeight))+'px';
 }
 function snapToWall(){
  const left=parseFloat(root.style.left)||0,top=parseFloat(root.style.top)||0;
  const rect=app.getBoundingClientRect();
  const right=Math.max(rect.left,rect.right-root.offsetWidth);
  const leftDistance=Math.abs(left-rect.left),rightDistance=Math.abs(right-left);
  edge=leftDistance<rightDistance?'left':'right';
  root.style.left=(edge==='right'?right:rect.left)+'px';
  root.style.top=clamp(top,rect.top,Math.max(rect.top,rect.bottom-root.offsetHeight))+'px';
  root.classList.add('is-snapped');placeAtEdge();
 }
 function close({focus=false,resume=true}={}){
  if(!opened)return;
  opened=false;root.classList.remove('is-open');label();
  if(focus)button.focus({preventScroll:true});
  if(resume&&window.BangRouter.current===route)window.BangLearning.resumeRuleBookmark();
 }
 label();
 button.addEventListener('pointerdown',event=>{
  if(event.button!==undefined&&event.button!==0)return;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:root.getBoundingClientRect().left,top:root.getBoundingClientRect().top,moved:false};
  button.classList.add('is-dragging');root.classList.add('is-dragging');
  try{button.setPointerCapture(event.pointerId);}catch{}
 });
 button.addEventListener('pointermove',event=>{
  if(!drag||drag.id!==event.pointerId)return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(Math.abs(dx)+Math.abs(dy)>7)drag.moved=true;
  if(!drag.moved)return;
  if(opened)close();
  event.preventDefault();
  const bounds=app.getBoundingClientRect();
  root.style.left=clamp(drag.left+dx,bounds.left,Math.max(bounds.left,bounds.right-root.offsetWidth))+'px';
  root.style.top=clamp(drag.top+dy,bounds.top,Math.max(bounds.top,bounds.bottom-root.offsetHeight))+'px';
 });
 function finishDrag(event){
  if(!drag||drag.id!==event.pointerId)return;
  const moved=drag.moved;drag=null;button.classList.remove('is-dragging');root.classList.remove('is-dragging');
  if(moved){suppressClick=true;opened=false;root.classList.remove('is-open');label();snapToWall();setTimeout(()=>{suppressClick=false;},0);}
 }
 button.addEventListener('pointerup',finishDrag);button.addEventListener('pointercancel',finishDrag);
 button.onclick=event=>{
  if(suppressClick){event.preventDefault();event.stopPropagation();return;}
  if(app.hasAttribute('aria-busy'))return;
  if(opened){close({resume:false});window.BangLearning.go('search-menu');return;}
  opened=true;window.BangLearning.pauseRuleBookmark();root.classList.add('is-open');label();
 };
 document.addEventListener('pointerdown',event=>{if(opened&&!root.contains(event.target))close();},{capture:true,passive:true});
 document.addEventListener('keydown',event=>{if(opened&&event.key==='Escape'){event.preventDefault();close({focus:true});}});
 new ResizeObserver(position).observe(app);
 window.addEventListener('resize',()=>{if(edge)placeAtEdge();else position();},{passive:true});window.visualViewport?.addEventListener('resize',()=>{if(edge)placeAtEdge();else position();},{passive:true});
 window.BangRuleBookmark={
  update(id){close({resume:false});route=id;suspended=false;root.hidden=!id.startsWith('learn:')||id.startsWith('learn:search-');position();},
  suspend(value){suspended=value;if(value)close({resume:false});root.hidden=suspended||!route?.startsWith('learn:')||route.startsWith('learn:search-');position();}
 };
})();
