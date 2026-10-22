const fs=require('fs'),vm=require('vm'),assert=require('assert');const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('field-learning.js','utf8'),context);const lesson=context.window.BangFieldLesson;let cases=0;
const weapons=lesson.weapons;
function steps(from,to,sign,dead){let current=from,total=0;while(current!==to){current=(current+sign+5)%5;if(!dead.has(current))total++;}return total;}
for(let mask=0;mask<16;mask++){
 const eliminated=new Set([1,2,3,4].filter(i=>mask&(1<<(i-1))));if(eliminated.size===4)continue;
 for(let target=1;target<5;target++)for(const weapon of weapons)for(const scope of [false,true])for(const mustang of [false,true])for(const ownMustang of [false,true]){
  const s={eliminated,weapon:weapon[0],scope,mustangs:new Set(mustang?[target]:[]),ownMustang};const d=lesson.distance(s,target);cases++;
  if(eliminated.has(target)){assert.equal(d,null);continue;}
  const clockwise=steps(0,target,1,eliminated),counterclockwise=steps(0,target,-1,eliminated),base=Math.min(clockwise,counterclockwise),effective=Math.max(1,base+Number(mustang)-Number(scope));
  assert.equal(d.base,base);assert.equal(d.clockwise,clockwise);assert.equal(d.counterclockwise,counterclockwise);assert.equal(d.effective,effective);assert.equal(d.canAttack,effective<=weapon[2]);
  const reverse=lesson.distance(s,0,target);assert.equal(reverse.effective,base+Number(ownMustang));
 }
}
assert.equal(lesson.frames.length,7);assert(lesson.has('140:427')&&lesson.has('tips-roles'));assert.equal(new Set(lesson.frames.map(f=>f.id)).size,7);
const html=fs.readFileSync('index.html','utf8');assert(html.indexOf('src="field-learning.js')<html.indexOf('src="learning.js'));assert(html.includes('field-learning.css'));
for(const file of ['app.js','screen-renderer.js','interactions.js','styles.css','screens.css','learning.css','step3-learning.js','card-library.js','data/card-detail-pages.js','home-menu-motion.js','home-menu-motion.css','data/learning-scenes.js','data/screens.js','data/figma-flow.js']){const before=require('child_process').execFileSync('git',['show','7636670:'+file]);assert(before.equals(fs.readFileSync(file)),file+' changed');}
// Existing topic destinations are preserved, new topics are recognized by the drawer.
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('learning-contents.js','utf8'),ctx);const contents=ctx.window.BangContents;
assert.equal(contents.topicFor('35:1390').label,'배신자');assert.equal(contents.topicFor('139:236').label,'카드 뽑기');assert.equal(contents.topicFor('attack-effects').step,3);assert.equal(contents.topicFor('tips-special').step,4);
console.log(`PASS: ${cases} distance/range/effect/elimination cases, 7 routes, preserved original files and existing topic destinations.`);
