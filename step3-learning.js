/* STEP 3 original copy enhancements and optional turn-start reference. */
(() => {
  const frames=[{id:'turn-start',name:'Step 3 : 내 턴',y:4000,text:['Step 3 : 내 턴'],links:[]}];
  function node(tag,cls,parent,text){const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;parent.append(n);return n;}
  function button(parent,text,action,cls='turn-text-link'){const b=node('button',cls,parent,text);b.type='button';b.onclick=action;return b;}
  function card(parent,name){const source=window.BANG_CARDS.find(c=>c.name===name);if(!source)return;const img=node('img','turn-card',parent);img.src=source.src;img.alt={'01_bang':'뱅!','03_volcanic':'볼캐닉','08_mancato':'빗나감!','02_birra':'맥주','01_barile':'술통','04_mustang':'야생마','02_dinamite':'다이너마이트','03_prigione':'감옥'}[name]||name;img.draggable=false;}
  function render(stage,id,{go,openMenu,back}){
    const root=node('section','turn-lesson',stage);
    const wood=node('img','turn-wood',root);wood.src='assets/intro-wood.png';wood.alt='';
    const paper=node('img','turn-paper',root);paper.src='assets/intro-paper.png';paper.alt='';
    const frame=node('img','turn-frame',root);frame.src='assets/frame.png';frame.alt='';
    const menu=button(root,'',openMenu,'turn-menu');menu.setAttribute('aria-label','목차 열기');menu.innerHTML='<img src="assets/learning/0a3d10c2-d2f3-4d00-b8a6-9dace2b6209f.svg" alt="">';
    node('p','turn-step',root,'Step 3 : 내 턴');
    node('h1','turn-heading',root,'내 차례 시작하기');
    const sheet=node('div','turn-sheet',root);sheet.tabIndex=0;sheet.setAttribute('role','region');sheet.setAttribute('aria-label','학습 내용');
    if(id==='turn-start'){
      node('h2','',sheet,'턴 시작 효과를 판정합니다');
      const art=node('div','turn-card-example',sheet);card(art,'02_dinamite');node('span','turn-order',art,'→');card(art,'03_prigione');
      node('p','turn-callout',sheet,'주의! 감옥에 있어도 다이너마이트부터 판정합니다. 생존했다면 감옥 판정을 진행합니다.');
      node('h2','',sheet,'판정(Draw!) 방법');
      node('p','',sheet,'카드 더미 맨 위 한 장을 공개해 무늬와 숫자를 확인합니다. 조건과 비교한 뒤 결과와 관계없이 버린 카드 더미에 놓습니다.');
      const checks=[['술통 · 하트이면 공격을 피합니다','뱅! 공격을 받으면 판정할 수 있습니다. 하트가 아니어도 빗나감!으로 대응할 수 있습니다.'],['감옥 · 하트이면 벗어납니다','판정 후 감옥은 버립니다. 하트이면 턴을 진행하며, 아니면 카드 뽑기·사용 없이 턴을 마칩니다. 보안관에게는 놓을 수 없습니다.'],['다이너마이트 · 스페이드 2~9이면 폭발합니다','폭발하면 다이너마이트를 버리고 생명력 3을 잃습니다. 폭발하지 않으면 왼쪽 플레이어에게 넘깁니다.']];
      checks.forEach(([title,copy])=>{const d=node('details','turn-rule',sheet);node('summary','',d,title);node('p','',d,copy);});
      node('p','turn-small',sheet,'주의! 판정 카드의 일반 효과는 사용하지 않습니다. 럭키 듀크 등 판정에 영향을 주는 인물 능력은 해당 지시를 따릅니다.');
      node('p','',sheet,'턴 시작 효과를 처리한 뒤 카드 2장을 손패로 가져옵니다. 판정할 카드가 없으면 바로 뽑습니다.');
    }
    const footer=node('div','turn-footer',root);
    const forward=()=>go('attack-introduction');
    button(footer,'STEP 4로 →',forward,'turn-next');
    const dialogueNav=node('nav','turn-dialogue-navigation',root);dialogueNav.setAttribute('aria-label','설명창 이전 다음');
    button(dialogueNav,'뒤로<',back,'turn-dialogue-back');button(dialogueNav,'>클릭!',forward,'turn-dialogue-next');
    sheet.addEventListener('click',event=>{
      if(event.target.closest('button,a,input,select,textarea,summary,details,[role=tab]')||window.getSelection()?.toString())return;
      const rect=sheet.getBoundingClientRect();if(event.clientX<rect.left+rect.width/2)back();else forward();
    });
  }
  // Enhance only the editable HTML copy in original STEP 3 frames.
  // Images, interaction nodes, card motion and the original export remain intact.
  function enhanceOriginal(stage,id){
    const copies={
      '139:236':['139:297','카드 더미에서 게임 카드 <em>2장</em>을 뽑습니다.','주의! 다이너마이트나 감옥이 있다면 판정을 먼저 한 후 카드를 뽑습니다. (판정에 대한 설명은 Step 4 에서!)'],
      '139:249':['139:311',"손에 든 카드를 원하는 만큼 사용합니다. 한 장도 사용하지 않아도 됩니다. 이때, '뱅!'카드는 기본적으로 한 턴에 한 장만 사용할 수 있습니다.",''],
      '139:249-guide':['139:311','갈색 게임 카드 : 카드에 적혀진 설명에 따라 소모하여 카드 더미에 놓습니다.\n파란 게임 카드 : 이때(본인의 턴에서) 장착합니다.','파란 카드 중 무기(총) 카드는 새로 장착할 때 원래 장착하고 있던 무기 카드를 버려야 합니다.'],
      '139:265':['139:338','사용을 마친 뒤 손에 든 카드가 <em>현재 총알 개수</em>보다 많다면, 카드를 버려 <em>현재 총알 개수</em>에 맞춰줍니다.','주의! 초과하는 것이 아니라면 임의로 버릴 수 없습니다.'],
      '139:351':['139:365','카드 사용은 효과를 적용하는 행동입니다.\n턴 종료의 버리기는 초과 손패 정리입니다.','주의! 현재 생명력보다 많은 카드만 버립니다.\n제한 이하라면 임의로 버리지 않습니다.\n카드 효과에 따른 버리기는 예외입니다.']
    };
    const copy=copies[id];if(!copy)return;
    const target=stage.querySelector(`[data-node-id="${copy[0]}"]`);if(!target)return;
    target.removeAttribute('style');target.classList.add('step3-rule-copy');target.replaceChildren();
    node('p','step3-rule-main',target).innerHTML=copy[1];if(copy[2])node('p','step3-rule-note',target,copy[2]);
  }
  window.BangTurnLesson={frames,render,enhanceOriginal};
})();
