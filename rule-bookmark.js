/* One STEP-only button, clipped to the right edge of the original learning screen. */
(() => {
 const app=document.querySelector('#app');
 const root=document.createElement('aside');root.className='rule-bookmark';root.hidden=true;root.setAttribute('aria-label','카드와 규칙 바로가기');
 const button=document.createElement('button');button.type='button';button.className='rule-bookmark-button';button.innerHTML='<svg class="rule-bookmark-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span aria-hidden="true">카드&amp;규칙<i class="rule-bookmark-word-gap"></i>찾기</span>';root.append(button);document.body.append(root);
 let route=null,opened=false,suspended=false;
 function label(){button.setAttribute('aria-expanded',String(opened));button.setAttribute('aria-label',opened?'카드&규칙 찾기':'카드&규칙 찾기 펼치기');}
 function position(){
  if(root.hidden)return;
  const rect=app.getBoundingClientRect();
  // Keep the button inside the screen, allowing it to overlap the timber edge.
  root.style.left=(rect.right-78)+'px';
  root.style.top=(rect.top+rect.height*.22)+'px';
 }
 function close({focus=false,resume=true}={}){
  if(!opened)return;
  opened=false;root.classList.remove('is-open');label();
  if(focus)button.focus({preventScroll:true});
  if(resume&&window.BangRouter.current===route)window.BangLearning.resumeRuleBookmark();
 }
 label();
 button.onclick=()=>{
  if(app.hasAttribute('aria-busy'))return;
  if(opened){close({resume:false});window.BangLearning.go('search-menu');return;}
  opened=true;window.BangLearning.pauseRuleBookmark();root.classList.add('is-open');label();
 };
 document.addEventListener('pointerdown',event=>{if(opened&&!root.contains(event.target))close();},{capture:true,passive:true});
 document.addEventListener('keydown',event=>{if(opened&&event.key==='Escape'){event.preventDefault();close({focus:true});}});
 new ResizeObserver(position).observe(app);
 window.addEventListener('resize',position,{passive:true});window.visualViewport?.addEventListener('resize',position,{passive:true});
 window.BangRuleBookmark={
  update(id){close({resume:false});route=id;suspended=false;root.hidden=!id.startsWith('learn:')||id.startsWith('learn:search-');position();},
  suspend(value){suspended=value;if(value)close({resume:false});root.hidden=suspended||!route?.startsWith('learn:')||route.startsWith('learn:search-');position();}
 };
})();
