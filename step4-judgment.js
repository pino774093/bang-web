/* Two judgment scenes, using original card assets and the existing STEP shell. */
(() => {
 const make=(tag,cls,parent,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;parent.append(n);return n;};
 const image=(parent,src,cls,alt='')=>{const n=make('img',cls,parent);n.src=src;n.alt=alt;n.draggable=false;return n;};
 const button=(parent,cls,label,action)=>{const n=make('button',cls,parent,label);n.type='button';n.onclick=action;return n;};
 const card=key=>window.BANG_CARDS.find(c=>c.name.replace(/^\d+_/,'')===key).src;
 function render(stage,{go,openMenu},id='attack-draw'){
  const isExample=id==='attack-draw-examples';
  const root=make('section','field-lesson attack-story judgment-story'+(isExample?' judgment-example-scene':' judgment-intro-scene'),stage);
  image(root,'assets/intro-wood.png','field-wood');image(root,'assets/intro-paper.png','field-paper');image(root,'assets/frame.png','field-frame');
  const menu=button(root,'field-menu','',openMenu);menu.setAttribute('aria-label','목차 열기');menu.innerHTML='<img src="assets/learning/0a3d10c2-d2f3-4d00-b8a6-9dace2b6209f.svg" alt="">';
  make('p','field-step-label',root,'Step 4 : 판정');make('h1','attack-story-title',root,isExample?'카드로 판정을 확인합니다':'판정이란?');
  if(!isExample){
   image(root,'assets/source/step4-judgment-suit-example.png','judgment-intro-card','판정에서 확인하는 카드의 숫자와 무늬');
  }
  const dialogue=make('section','attack-story-dialogue',root);dialogue.setAttribute('aria-label','판정 설명');
  const copy=make('div','attack-story-copy',dialogue);copy.setAttribute('role','status');copy.setAttribute('aria-live','polite');copy.setAttribute('aria-atomic','true');
  const text=make('p','attack-story-text',copy,'판정이 필요한 상황에서는 카드 더미 맨 위의 카드를 한 장 공개합니다. 공개한 카드의 무늬와 숫자가 조건에 맞는지 확인합니다.');
  const note=make('p','attack-story-note',copy,'판정에 사용한 카드는 성공 여부와 관계없이 버린 카드 더미에 놓습니다.');
  if(isExample){
   text.textContent="카드 뒷면을 눌러 공개 예시를 확인하세요!\n아래 카드는 '판정'이 필요한 카드들입니다.\n판정 조건과 함께 비교해 주세요.";
   note.textContent='카드의 일반 효과를 사용하는 행동과는 다릅니다.';
   const pool=window.BANG_JUDGMENT_FACES.map(name=>window.BANG_CARDS.find(c=>c.name===name));
   let bag=[],last=null;
   function nextFace(){
    if(!bag.length){bag=pool.slice();for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}if(bag.length>1&&bag[bag.length-1]===last)[bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];}
    return last=bag.pop();
   }
   const reveal=button(root,'judgment-reveal','',async()=>{
    if(reveal.disabled)return;
    reveal.disabled=true;
    let motion=null;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    try{
     // Decode while the current face is still visible. Never reveal an unloaded image.
     const chosen=nextFace(),preload=new Image();preload.src=chosen.src;await preload.decode();
     if(!root.isConnected)return;
     // A two-part horizontal flip avoids 3D flattening from image/shadow filters in Safari.
     if(!reduced){
      motion=flip.animate([{transform:'scaleX(1)'},{transform:'scaleX(0)'}],{duration:150,easing:'ease-in',fill:'forwards'});
      await motion.finished;
      flip.style.transform='scaleX(0)';motion.cancel();motion=null;
     }
     if(!root.isConnected)return;
     front.src=chosen.src;await front.decode();
     reveal.setAttribute('aria-pressed','true');reveal.classList.add('is-revealed');
     hint.textContent='다시 누르면 다른 카드가 공개됩니다.';
     if(!reduced){
      motion=flip.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:180,easing:'ease-out',fill:'forwards'});
      await motion.finished;
     }
    }catch(error){
     if(root.isConnected)hint.textContent='카드를 불러오지 못했습니다. 다시 눌러 주세요.';
    }finally{
     flip.style.transform='';motion?.cancel();reveal.disabled=false;
    }
   });reveal.setAttribute('aria-label','무작위 판정 카드 공개');reveal.setAttribute('aria-pressed','false');
   const flip=make('span','judgment-flipper',reveal);image(flip,'assets/learning/56730c51-8166-4327-8aec-79704b722cfc.png','judgment-card-back','게임 카드 뒷면');
   const front=image(flip,pool[0].src,'judgment-card-front','공개 예시 게임 카드');
   const hint=make('p','judgment-reveal-hint',root,'카드 뒷면을 눌러 공개 예시를 확인합니다.');
   make('p','judgment-examples-label',root,'아래 카드를 눌러 판정 조건을 확인합니다.');
   const examples=make('div','judgment-examples',root);examples.setAttribute('role','group');examples.setAttribute('aria-label','판정 조건 예시');
   const drawer=make('section','judgment-condition',root);drawer.id='judgment-condition';drawer.setAttribute('aria-label','선택한 카드의 판정 조건');drawer.setAttribute('aria-live','polite');drawer.setAttribute('aria-atomic','true');
   const condition=make('p','',drawer);const extra=make('p','',drawer);
   const buttons=[['barile','술통','하트(♥)가 나오면 공격을 피합니다.','실패해도 빗나감! 카드를 사용할 수 있습니다.'],['prigione','감옥','하트(♥)가 나오면 감옥에서 벗어나 정상적으로 턴을 진행합니다.','실패하면 해당 턴을 건너뜁니다.'],['dinamite','다이너마이트','스페이드(♠) 2~9가 나오면 폭발하여 생명력 3을 잃습니다.','폭발하지 않으면 왼쪽 플레이어에게 전달합니다.']].map(([key,label,description,failure])=>{
    const b=button(examples,'judgment-example','',()=>{
     const open=b.getAttribute('aria-expanded')!=='true';
     buttons.forEach(n=>{n.setAttribute('aria-pressed',String(open&&n===b));n.setAttribute('aria-expanded',String(open&&n===b));});
     const wasOpen=drawer.classList.contains('is-open');
     condition.textContent=description;extra.textContent=failure;drawer.classList.toggle('is-open',open);
     if(open&&wasOpen&&!matchMedia('(prefers-reduced-motion: reduce)').matches)drawer.animate([{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'ease-out'});
    });b.dataset.judgment=key;b.setAttribute('aria-label',label+' 판정 조건');b.setAttribute('aria-pressed','false');b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls',drawer.id);image(b,card(key),'',label);make('span','',b,label);return b;
   });
  }
  const nav=make('nav','attack-story-navigation',dialogue);nav.setAttribute('aria-label','이전 장면과 다음 장면');
  const prev=button(nav,'attack-story-prev','',()=>go(isExample?'attack-draw':'attack-effects'));prev.setAttribute('aria-label',isExample?'판정 설명으로':'사정거리 마지막 장면으로');make('span','',prev,'뒤로<');
  const next=button(nav,'attack-story-next','',()=>go(isExample?'tips-end':'attack-draw-examples'));next.setAttribute('aria-label',isExample?'STEP 5로 이동':'판정 예시로 이동');make('span','',next,'>클릭!');return root;
 }
 window.BangJudgmentLesson={render};
})();
