(() => {
  const definitions = new Map(window.BANG_SCREENS.map(screen => [screen.id, {...screen,text:window.BANG_DIALOGUES[screen.id]||[]}] ));
  const host = document.querySelector('#reference-screen');
  const stage = document.createElement('div');
  stage.className = 'design-stage';
  host.append(stage);
  const size = () => stage.style.transform = `scale(${host.clientWidth / 390})`;
  new ResizeObserver(size).observe(host);
  function node(tag, className, parent = stage) {
    const element = document.createElement(tag); element.className = className; parent.append(element); return element;
  }
  function image(src, x, y, w, h, parent = stage) {
    const img = node('img', 'design-image', parent);img.src = src;img.alt = '';img.draggable = false;
    Object.assign(img.style, { left:`${x}px`, top:`${y}px`, width:`${w}px`, height:`${h}px` });return img;
  }
  function box(element, data) {Object.assign(element.style,{left:`${data.x}px`,top:`${data.y}px`,width:`${data.w}px`,height:`${data.h}px`});}
  function text(data) {
    const line = node('span', 'design-copy');line.textContent = data.text;line.dataset.copy = data.kind;
    Object.assign(line.style, {left:`${data.x}px`,top:`${data.y - 1}px`,width:`${data.w}px`,height:`${data.h + 3}px`,color:data.color,fontSize:`${data.size}px`,textAlign:data.align});
    if(data.text.includes('가져가'))line.style.textShadow='1px 2px 3px rgba(0,0,0,.9)';
    // Fit the line to the measured PNG ink width, without changing other layers.
    const inner = document.createElement('span');inner.textContent=line.textContent;if(data.text.includes('두 장')){inner.replaceChildren();const parts=data.text.split('두 장');inner.append(parts[0]);const red=document.createElement('span');red.textContent='두 장';red.style.color='#ef3333';inner.append(red,parts.slice(1).join('두 장'));line.style.color='#fff';}line.replaceChildren(inner);
    inner.style.display='inline-block';inner.style.whiteSpace='pre';
    if(data.text.includes('가져가'))inner.style.textShadow='1px 2px 3px rgba(0,0,0,.9)';
    requestAnimationFrame(()=>{const natural=inner.offsetWidth;if(natural)inner.style.transform=`scaleX(${data.w / natural})`;});
  }
  function fitLoadedText() {
    for (const line of stage.querySelectorAll('.design-copy')) {
      const inner=line.firstElementChild;
      if(!inner)continue;
      const natural=inner.offsetWidth;
      if(natural)inner.style.transform=`scaleX(${parseFloat(line.style.width)/natural})`;
    }
  }
  window.addEventListener('bang-fonts-ready',()=>requestAnimationFrame(fitLoadedText));
  document.fonts?.addEventListener('loadingdone',()=>requestAnimationFrame(fitLoadedText));
  function button(data) {
    const b=node('button','design-action');b.type='button';box(b,data);b.setAttribute('aria-disabled','true');
    const img=image('assets/rules-decoration.svg',0,0,data.w,data.h,b);img.setAttribute('aria-hidden','true');
    const label=node('span','design-action-label',b);label.textContent=data.label;if(data.label==='이 역할로 플레이')label.style.fontSize='18px';return b;
  }
  function star(data){const img=image('assets/sheriff.svg',data.x,data.y,data.w,data.h);img.classList.add('design-white-star');}
  const sources = [...window.BANG_SCREENS.flatMap(s => s.images.map(a=>a.src))];
  window.BangDesign = {
    definitions,
    render(id) {
      const screen=definitions.get(Number(id));if(!screen)return false;
      stage.replaceChildren();host.setAttribute('aria-label',screen.name);stage.dataset.screen=screen.id;
      stage.classList.toggle('design-dark',screen.theme==='dark');
      const wood=node('div','design-wood');image('assets/wood.png',0,0,390,844,wood);
      const paper=image('assets/intro-paper.png',17.4,17.4,355.2,809.2);paper.classList.add('design-paper');
      const frame=image('assets/frame.png',5,14,376,826);frame.classList.add('design-frame');
      // Layer definitions come from the supplied original assets and measured references.
      const layerAssets=screen.id===27
        ?screen.images.map((asset,index)=>index===0?(definitions.get(28)?.images[0]||asset):asset)
        :screen.images;
      for (const [assetIndex,asset] of layerAssets.entries()) {
        const [a,c,x]=asset.matrix[0],[b,d,y]=asset.matrix[1];
        const clickable=screen.id===137;
        const target=clickable?node('button','design-card-target'):null;
        if(target){target.type='button';target.dataset.cardIndex=String(assetIndex);target.setAttribute('aria-label',`역할 카드 ${assetIndex+1}`);target.setAttribute('aria-disabled','true');Object.assign(target.style,{width:`${asset.width}px`,height:`${asset.height}px`});}
        const img=image(asset.src,0,0,asset.width,asset.height,target||stage);
        img.dataset.screenAssetIndex=String(assetIndex);
        // Chapter 3 role draw: the selected role face remains in front after
        // the smart transition has finished, so keep its shadow on the final layer.
        if([133,134,135,136].includes(screen.id)&&assetIndex===4)img.classList.add('role-revealed-card');
        const layer=target||img;
        layer.style.transformOrigin='0 0';layer.style.transform=`matrix(${a},${b},${c},${d},${x},${y})`;
        if([114,116,117,118].includes(screen.id)){
          if(asset.name==='discard pile'){
            img.classList.add('chapter-three-discard-pile');img.style.zIndex='50';
          }
          // The drawn Bang! card must sit above both the discard pile and the
          // perspective deck stack; the separate logo layer remains highest.
          if(asset.name?.includes('/01_bang.png')){
            img.classList.add('chapter-three-bang-card');img.style.zIndex='200';
          }
        }
        if(asset.clip)img.style.clipPath=asset.clip;
        if(asset.opacity!==undefined)img.style.opacity=asset.opacity;
        const bounds=asset.visibleBounds;
        if(bounds && bounds[2]<205 && bounds[3]>100 && bounds[3]<350 && !/pile|deck|더미|뭉텅이|bullet|총알/i.test(asset.name||'')){const scale=Math.hypot(a,b)||1;img.style.filter=`drop-shadow(${3/scale}px ${3/scale}px ${1/scale}px #000b)`;}
      }
      if([114,116,117,118].includes(screen.id)){
        const bangDeck=definitions.get(84)?.images.find(asset=>/카드뭉텅이원근\.png$/i.test(asset.name||''));
        if(bangDeck){
          const [[a,c,x],[b,d,y]]=bangDeck.matrix;
          const deck=image(bangDeck.src,0,0,bangDeck.width,bangDeck.height);
          deck.dataset.screenAssetIndex='bang-deck-front';
          deck.classList.add('chapter-three-deck-stack');
          deck.style.transformOrigin='0 0';deck.style.transform=`matrix(${a},${b},${c},${d},${x},${y})`;deck.style.zIndex='100';
        }
      }
      if(screen.id>=119 && screen.id<=122){const bang=image('assets/bang-logo.png',153,179,185,101);bang.classList.add('chapter-three-bang-logo');bang.style.transform='rotate(-29deg)';}
      if(screen.kind==='chapter-menu'){
        image('assets/logo-backing-vector.svg',56,25,277,174);
        const logo=image('assets/bang-logo.png',0,0,1697,927);logo.style.transformOrigin='0 0';logo.style.transform='matrix(.134494,-.011541,.011711,.134122,74.16,53.825)';
        for(const y of [217,399,581]){const b=node('button','design-chapter-tile');b.type='button';b.setAttribute('aria-label',screen.text.find(t=>t.y>y&&t.y<y+60)?.text || 'chapter');b.setAttribute('aria-disabled','true');box(b,{x:46,y,w:292,h:116});const art=image('assets/logo-backing-vector.svg',0,0,292,116,b);art.style.opacity='.75';}
      }
      for(const panel of screen.panels){const p=node('button','design-panel');p.type='button';p.setAttribute('aria-label',screen.text.filter(t=>t.y>=panel.y&&t.y<panel.y+panel.h).map(t=>t.text).join(' ')||'대사창');p.setAttribute('aria-disabled','true');box(p,panel);p.style.borderRadius=panel.x===0?`${panel.radius}px ${panel.radius}px 0 0`:`${panel.radius}px`;}
      if(screen.kind==='roles' && screen.id!==137 && screen.id>=133){const starBox={x:40,y:486,w:36,h:35};star(starBox);}
      if([29,30,31,32].includes(screen.id)){const oval=node('div','design-bullet-oval');box(oval,{x:223,y:292,w:27,h:44});}
      if([88,89,90,91].includes(screen.id)){const arrow=node('div','design-draw-arrow');box(arrow,{x:105,y:293,w:33,h:67});}
      // These are four role cards; the star is a sheriff marker and must not
      // appear over the renegade card in the staggered role-introduction scene.
      if(![41,42].includes(screen.id))for(const s of screen.stars)star(s);
      if(screen.id===146){const header=node('div','design-detail-header');box(header,{x:8,y:9,w:225,h:78});const inside=node('div','design-detail-header-line',header);image('assets/sheriff.svg',231,26,63,61);}
      for(const t of screen.text)text(t);
      for(const b of screen.buttons)button(b);
      if(screen.back){const b=node('button','design-back');b.type='button';b.setAttribute('aria-label','뒤로 가기');image('assets/back-vector.svg',0,0,68,68,b);b.addEventListener('click',()=>{if(history.state?.bang&&history.state.index>0)history.back();else location.hash='#/home';});}
      if(screen.id===33)renderPlayerTable();
      if(screen.speech){for(const bubble of screen.speech){
        const el=node('div','design-speech');box(el,bubble);
        const art=image('assets/말풍선.png',0,0,bubble.w,bubble.h,el);art.classList.add('design-speech-art');art.setAttribute('aria-hidden','true');
        const copy=node('span','design-speech-copy',el);copy.textContent=bubble.text;
      }}
      window.BangInteractions?.mount(screen,stage);
      size();return screen;
    }
  };
  function renderPlayerTable(){
    const table=node('div','design-role-table');
    const headers=['보안관','부관','무법자','배신자'];
    headers.forEach((s,i)=>{const e=node('span','design-role-header',table);e.textContent=s;e.style.left=`${188+i*46}px`;});
    const rows=[[1,0,2,1],[1,1,2,1],[1,1,3,1],[1,2,3,1]];
    const playerRows=[
      {top:161,count:210,number:175,upper:[0,30],lower:[15,45]},
      {top:250,count:302,number:278,upper:[15,45],lower:[0,30,60]},
      {top:348,count:397,number:385,upper:[15,45,75],lower:[0,30,60]},
      {top:462,count:517,number:489,upper:[15,45,75],lower:[0,30,60,90]}
    ];
    rows.forEach((values,i)=>{
      const layout=playerRows[i];
      const group=node('div','design-players',table);group.style.top=`${layout.top}px`;group.style.left=`${62-i*6}px`;
      for(const [line,positions] of [[0,layout.upper],[14,layout.lower]]){
        for(const x of positions){const figure=node('i','design-player',group);figure.style.left=`${x}px`;figure.style.top=`${line}px`;}
      }
      const count=node('span','design-player-count',table);count.textContent=`${4+i}인`;count.style.top=`${layout.count}px`;
      values.forEach((v,j)=>{const e=node('span','design-role-number',table);e.textContent=v;e.style.left=`${191+j*46}px`;e.style.top=`${layout.number}px`;});
    });
  }
})();
