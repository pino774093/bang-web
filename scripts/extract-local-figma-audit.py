"""Build a read-only handoff audit from the decoded local Figma document.
Input is produced with kiwi-schema from canvas.fig's embedded schema + message.
This script never updates application routes or the source .fig file.
"""
from pathlib import Path
import json,collections,hashlib,zipfile
src=next(Path('reference').glob('*.fig'))
message=json.load(open('/tmp/bang-latest-decoded.json'))
ns=message['nodeChanges'];gid=lambda g:f"{g['sessionID']}:{g['localID']}"
by={gid(n['guid']):n for n in ns};children=collections.defaultdict(list)
for n in ns:
 if 'parentIndex'in n:children[gid(n['parentIndex']['guid'])].append(n)
def parent(n):return by.get(gid(n['parentIndex']['guid'])) if 'parentIndex'in n else None
def frame(n):
 seen=set()
 while n and gid(n['guid'])not in seen:
  seen.add(gid(n['guid']));p=parent(n)
  if n.get('type')=='FRAME' and p and p.get('type')=='CANVAS':return n
  n=p
 return None
def descendants(n):
 for child in children[gid(n['guid'])]:
  yield child
  yield from descendants(child)
frames=[n for n in ns if n.get('type')=='FRAME' and parent(n) and parent(n).get('type')=='CANVAS']
rows=[]
for n in ns:
 for interaction in n.get('prototypeInteractions',[]):
  if interaction.get('isDeleted'):continue
  owner=frame(n)
  for action in interaction.get('actions',[]):
   target=action.get('transitionNodeID');targetid=gid(target)if target else None;destination=by.get(targetid);targetframe=frame(destination)if destination else None
   rows.append(dict(sourceNode=gid(n['guid']),sourceName=n.get('name'),sourceFrame=gid(owner['guid'])if owner else None,sourceFrameName=owner.get('name')if owner else None,trigger=interaction.get('event'),action=action,destinationNode=targetid,destinationName=destination.get('name')if destination else None,destinationFrame=gid(targetframe['guid'])if targetframe else None,targetStatus='resolved' if destination else 'none-or-sentinel' if targetid in [None,'4294967295:4294967295'] else 'missing'))
frameindex=[dict(id=gid(n['guid']),name=n.get('name'),size=n.get('size'),transform=n.get('transform'),startingPoint=n.get('prototypeStartingPoint'),text=[x.get('textData',{}).get('characters','')for x in descendants(n)if x.get('type')=='TEXT'])for n in frames]
fields=['guid','parentIndex','type','name','visible','opacity','size','transform','fillPaints','strokePaints','strokeWeight','effects','cornerRadius','rectangleCornerRadii','fontName','fontSize','textData','textAlignHorizontal','textAlignVertical','lineHeight','letterSpacing','prototypeInteractions','prototypeStartingPoint']
clean=[{k:n[k]for k in fields if k in n}for n in ns]
with zipfile.ZipFile(src)as z:images=[x.filename for x in z.infolist()if x.filename.startswith('images/')and x.file_size]
summary=dict(source=str(src),sha256=hashlib.sha256(src.read_bytes()).hexdigest(),exportedAt='2026-10-15T15:08:23.075Z',nodes=len(ns),topLevelFrames=len(frames),mobile390x844=sum(n.get('size')=={'x':390,'y':844}for n in frames),layersWithStoredInteractions=sum(bool(n.get('prototypeInteractions'))for n in ns),layersWithActiveInteractions=sum(any(not i.get('isDeleted')for i in n.get('prototypeInteractions',[]))for n in ns),activeInteractions=sum(not i.get('isDeleted',False)for n in ns for i in n.get('prototypeInteractions',[])),actionCount=len(rows),triggerCounts=dict(collections.Counter(r['trigger'].get('interactionType')for r in rows)),targetCounts=dict(collections.Counter(r['targetStatus']for r in rows)),embeddedImages=len(images),applicationModified=False)
for name,obj in [('summary',summary),('frames',frameindex),('connections',rows),('layers',clean)]:Path('docs/figma-local/'+name+'.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2))
lines=['# 最新ローカル Figma 読取検証'.replace('最新ローカル Figma 読取検証','최신 로컬 Figma 읽기 검증'),'','원본 .fig와 웹사이트 구현은 변경하지 않았습니다.','',f"- 원본: `{src}`",f"- 내보내기 시각(한국): 2026-10-16 00:08:23",f"- 레이어: {len(ns)}개",f"- 최상위 프레임: {len(frames)}개",f"- 유효한 인터랙션: {summary['activeInteractions']}개",f"- 내부 이미지: {len(images)}개",'','실제 연결 예시: 홈(5:4)의 게임 설명 시작 버튼(8:326)은 소개가 아니라 챕터 메뉴(47:2539, 이름 home)로 연결됩니다. 같은 이름의 프레임을 ID로 구별해야 합니다.','','## 추출 파일','','- frames.json: 프레임 ID/이름/크기/실제 문구','- connections.json: 트리거, 목적지 ID, 전환 시간/효과','- layers.json: 위치·크기·폰트·색상 등 레이어 정보','- summary.json: 원본 해시 및 검증 수치','','삭제된 연결은 활성 연결에서 제외했습니다. sentinel 목적지(4294967295:4294967295)는 실제 화면으로 연결하면 안 됩니다. 추출에 성공한 것과 브라우저 구현이 완성된 것은 별개입니다.']
Path('docs/figma-local/README.md').write_text('\n'.join(lines)+'\n');print(json.dumps(summary,ensure_ascii=False,indent=2))
