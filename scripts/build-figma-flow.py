from pathlib import Path
import json,collections,base64,numpy as np
ns=json.load(open('docs/figma-local/layers.json'));gid=lambda g:f"{g['sessionID']}:{g['localID']}";by={gid(n['guid']):n for n in ns};children=collections.defaultdict(list)
for n in ns:
 if 'parentIndex'in n:children[gid(n['parentIndex']['guid'])].append(n)
for ch in children.values():ch.sort(key=lambda n:n['parentIndex']['position'])
mapping=json.load(open('docs/figma-local/frame-map-verified.json'));screens={x['figmaId']:x['screenId']for x in mapping};images=json.load(open('docs/figma-local/image-paths.json'));connections=json.load(open('docs/figma-local/connections.json'))
def local(n,fid):
 seq=[]
 while gid(n['guid'])!=fid:
  seq.append(n);n=by[gid(n['parentIndex']['guid'])]
 M=np.eye(3)
 for n in reversed(seq):
  t=n.get('transform',{});M=M@np.array([[t.get('m00',1),t.get('m01',0),t.get('m02',0)],[t.get('m10',0),t.get('m11',1),t.get('m12',0)],[0,0,1.]])
 return M[:2].tolist()
def visible(n):
 while n:
  if n.get('visible')is False:return False
  n=by.get(gid(n['parentIndex']['guid']))if'parentIndex'in n else None
 return True
def walk(n):
 yield n
 for x in children[gid(n['guid'])]:yield from walk(x)
def label(n):
 words=' '.join(x.get('textData',{}).get('characters','')for x in walk(n)if x.get('type')=='TEXT').strip()
 if words in ['<','〈','‹']:return '뒤로 가기'
 if words:return words.replace('\n',' ').replace('\u2028',' ')[:150]
 return n.get('name','선택')
def component(target):
 layers=[]
 for x in walk(target):
  for p in x.get('fillPaints',[]):
   if p.get('type')=='IMAGE':
    h=base64.b64decode(p['image']['hash']['data']).hex()
    if h in images:layers.append(dict(src=images[h],size=x.get('size'),matrix=local(x,gid(target['guid']))))
 return layers
frames={x['figmaId']:dict(id=x['figmaId'],name=by[x['figmaId']]['name'],screenId=x['screenId'],hotspots=[],automatic=[])for x in mapping}
ignored=[]
for r in connections:
 fid=r['sourceFrame'];n=by[r['sourceNode']];action=r['action'];kind=r['trigger']['interactionType']
 if fid not in frames:continue
 if not visible(n):ignored.append(dict(source=r['sourceNode'],reason='hidden-layer'));continue
 if r['targetStatus']!='resolved':ignored.append(dict(source=r['sourceNode'],reason='no-destination',action=action));continue
 item=dict(source=r['sourceNode'],label=label(n),trigger=kind,size=n.get('size',{'x':390,'y':844}),matrix=local(n,fid),action=action,target=r['destinationFrame'],targetNode=r['destinationNode'])
 if action.get('navigationType')=='SWAP_STATE':item['component']=component(by[r['destinationNode']])
 if action.get('navigationType')=='SCROLL_TO':item['targetMatrix']=local(by[r['destinationNode']],fid)
 if kind=='AFTER_TIMEOUT':item['delay']=max(0,r['trigger'].get('transitionTimeout',0));frames[fid]['automatic'].append(item)
 elif kind=='ON_CLICK':frames[fid]['hotspots'].append(item)
 else:ignored.append(dict(source=r['sourceNode'],reason='non-click-trigger',trigger=kind))
 # Interactions on unsupported component states do not become full-screen routes.
 if item['target']not in frames and not item.get('component') and action.get('navigationType')!='SCROLL_TO':raise RuntimeError('Unmapped destination '+str(item))
# Render smaller targets above larger parent targets, keeping both real buttons.
for f in frames.values():f['hotspots'].sort(key=lambda h:h['size']['x']*h['size']['y'],reverse=True)
output=dict(home='5:4',intro='8:330',cards='30:726',menu='47:2539',frames=frames,screenToFrame={str(x['screenId']):x['figmaId']for x in mapping if x['screenId']is not None})
Path('data/figma-flow.js').write_text('window.BANG_FIGMA_FLOW = '+json.dumps(output,ensure_ascii=False,separators=(',',':'))+';\n');Path('docs/figma-local/runtime-flow.json').write_text(json.dumps(output,ensure_ascii=False,indent=2));Path('docs/figma-local/ignored-connections.json').write_text(json.dumps(ignored,ensure_ascii=False,indent=2));print('frames',len(frames),'clicks',sum(len(f['hotspots'])for f in frames.values()),'timers',sum(len(f['automatic'])for f in frames.values()),'ignored',len(ignored))
