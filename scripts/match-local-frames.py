"""Match local Figma frames to reference states using text and actual asset placement."""
from pathlib import Path
import json,zipfile,base64,collections,re,unicodedata,difflib
import numpy as np,cv2
from PIL import Image,ImageDraw
ns=json.load(open('docs/figma-local/layers.json'));gid=lambda g:f"{g['sessionID']}:{g['localID']}";by={gid(n['guid']):n for n in ns};children=collections.defaultdict(list)
for n in ns:
 if 'parentIndex'in n:children[gid(n['parentIndex']['guid'])].append(n)
for ch in children.values():ch.sort(key=lambda n:n['parentIndex']['position'])
frames=[n for n in ns if n.get('type')=='FRAME'and n.get('size')=={'x':390,'y':844}and by.get(gid(n['parentIndex']['guid']),{}).get('type')=='CANVAS']
assets=Path('assets/figma-latest');assets.mkdir(exist_ok=True);images={};imagepaths={}
with zipfile.ZipFile(next(Path('reference').glob('*.fig')))as z:
 for f in z.infolist():
  if not f.filename.startswith('images/')or not f.file_size:continue
  content=z.read(f);from io import BytesIO
  try:im=Image.open(BytesIO(content)).convert('RGBA')
  except Exception:continue
  hash=f.filename.split('/')[-1];ext='.png'if content.startswith(b'\x89PNG')else'.jpg';p=assets/(hash+ext)
  if not p.exists():p.write_bytes(content)
  images[hash]=im;imagepaths[hash]=str(p)
def mat(n):
 t=n.get('transform',{});return np.array([[t.get('m00',1),t.get('m01',0),t.get('m02',0)],[t.get('m10',0),t.get('m11',1),t.get('m12',0)],[0,0,1.]])
def descendants(n,T=np.eye(3),opacity=1):
 for ch in children[gid(n['guid'])]:
  if ch.get('visible')is False:continue
  M=T@mat(ch);o=opacity*ch.get('opacity',1)
  yield ch,M,o
  yield from descendants(ch,M,o)
def rendered(n):
 canvas=Image.new('RGBA',(390,844));words=[]
 for node,M,opacity in descendants(n):
  if node.get('type')=='TEXT':
   if opacity>.01:words.append(node.get('textData',{}).get('characters',''))
   continue
  size=node.get('size');
  if not size:continue
  w,h=size['x'],size['y']
  if w<1 or h<1:continue
  for paint in node.get('fillPaints',[]):
   if paint.get('visible')is False:continue
   alpha=opacity*paint.get('opacity',1)
   if paint['type']=='IMAGE':
    info=paint.get('image',{}).get('hash',{});hash=base64.b64decode(info.get('data','')).hex();im=images.get(hash)
    if im is None:continue
    # Backgrounds do not distinguish frames and would swamp the score.
    if hash in ['bf1b0d5c7f8e06303c43f571928bf110fd3e64bd','57dd8d2821159afb840f424c5cbed7e2f71c5e60','fa10039b01858ebbfde55877396b0243c470d430','a72b7ea1c79e268c9b2b5b84e4f3914d5261e247']:continue
    mode=paint.get('imageScaleMode','FILL');scale=max(w/im.width,h/im.height)if mode=='FILL'else min(w/im.width,h/im.height)
    iw,ih=im.width*scale,im.height*scale;IM=M@np.array([[scale,0,(w-iw)/2],[0,scale,(h-ih)/2],[0,0,1.]])
    if mode=='STRETCH':
     t=paint.get('transform',{});P=np.array([[t.get('m00',1),t.get('m01',0),t.get('m02',0)],[t.get('m10',0),t.get('m11',1),t.get('m12',0)],[0,0,1.]])
     IM=M@np.diag([w,h,1.])@np.linalg.inv(P)@np.diag([1/im.width,1/im.height,1.])
    array=np.asarray(im).copy();array[:,:,3]=(array[:,:,3]*alpha).astype('uint8');warped=cv2.warpAffine(array,IM[:2],(390,844),flags=cv2.INTER_LINEAR);canvas=Image.alpha_composite(canvas,Image.fromarray(warped))
   elif paint['type']=='SOLID'and node.get('type')in ['ROUNDED_RECTANGLE','ELLIPSE','FRAME']:
    col=paint.get('color',{});rgb=[round(col.get(k,0)*255)for k in 'rgb']
    if max(rgb)>45 or w<30 or h<30:continue
    tile=Image.new('RGBA',(max(1,round(w)),max(1,round(h))));d=ImageDraw.Draw(tile);d.rounded_rectangle((0,0,w,h),radius=node.get('cornerRadius',0),fill=tuple(rgb+[round(255*alpha)]));arr=cv2.warpAffine(np.asarray(tile),M[:2],(390,844));canvas=Image.alpha_composite(canvas,Image.fromarray(arr))
 return np.asarray(canvas),words
norm=lambda s:re.sub(r'[^가-힣a-zA-Z0-9]','',s).lower()
refs=json.load(open('docs/screen-manifest.json'));refpixels={r['id']:np.asarray(Image.open(r['reference']).convert('RGB').resize((390,844))) for r in refs};rgba={};texts={};scores={};mapping=[]
# Groups are matched globally, never by ambiguous export suffix order.
for name in dict.fromkeys(n['name']for n in frames):
 fs=[n for n in frames if n['name']==name];rs=[r for r in refs if r['name']==name or re.fullmatch(re.escape(name)+r'-\d+',r['name'])]
 # Avoid collisions with explicitly named subframes.
 rs=[r for r in rs if not any(r['name']==other['name']and other['name']!=name for other in frames)]
 if len(fs)==1 and len(rs)==1:
  mapping.append(dict(figmaId=gid(fs[0]['guid']),screenId=rs[0]['id'],name=name,score=0,method='unique-name'));continue
 cost=np.zeros((len(fs),len(rs)))
 for i,f in enumerate(fs):
  img,words=rendered(f);a=norm(''.join(words));mask=(img[:,:,3]>220);mask[:50]=False;mask[:, :25]=False;mask[:,-25:]=False
  for j,r in enumerate(rs):
   ref=refpixels[r['id']];b=norm(''.join(t['text']for t in r['text']));similar=difflib.SequenceMatcher(None,a,b).ratio()if a or b else 1
   error=np.abs(img[:,:,:3].astype(float)-ref).mean(2);err=np.minimum(error,80)[mask].mean()if mask.any()else 0
   cost[i,j]=err+45*(1-similar)
  rgba[gid(f['guid'])]=img
 # Rectangular Hungarian minimum-cost assignment with extra unknown columns.
 C=np.pad(cost,((0,0),(0,max(0,len(fs)-len(rs)))),constant_values=65);n,m=C.shape;u=np.zeros(n+1);v=np.zeros(m+1);p=np.zeros(m+1,dtype=int);way=np.zeros(m+1,dtype=int)
 for i in range(1,n+1):
  p[0]=i;j0=0;minv=np.full(m+1,np.inf);used=np.zeros(m+1,dtype=bool)
  while True:
   used[j0]=True;i0=p[j0];delta=np.inf;j1=0
   for j in range(1,m+1):
    if used[j]:continue
    cur=C[i0-1,j-1]-u[i0]-v[j]
    if cur<minv[j]:minv[j]=cur;way[j]=j0
    if minv[j]<delta:delta=minv[j];j1=j
   for j in range(m+1):
    if used[j]:u[p[j]]+=delta;v[j]-=delta
    else:minv[j]-=delta
   j0=j1
   if p[j0]==0:break
  while True:
   j1=way[j0];p[j0]=p[j1];j0=j1
   if j0==0:break
 for j in range(1,m+1):
  if not p[j]:continue
  f=fs[p[j]-1];r=rs[j-1]if j<=len(rs)else None
  mapping.append(dict(figmaId=gid(f['guid']),screenId=r['id']if r else None,name=name,score=round(C[p[j]-1,j-1],2),method='text-and-asset-geometry'))
 print(name,len(fs),len(rs),flush=True)
Path('docs/figma-local/frame-map.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2));Path('docs/figma-local/image-paths.json').write_text(json.dumps(imagepaths,indent=2))
# Reference-only contact sheet to review the assignment, not runtime imagery.
for page in range((len(mapping)+19)//20):
 batch=mapping[page*20:page*20+20];sheet=Image.new('RGB',(10*156,4*362),'#ddd');d=ImageDraw.Draw(sheet)
 for ix,m in enumerate(batch):
  if m['figmaId']not in rgba:continue
  x=(ix%5)*312;y=(ix//5)*362;arr=rgba[m['figmaId']];bg=Image.new('RGBA',(390,844),'#ead6b3');bg=Image.alpha_composite(bg,Image.fromarray(arr));sheet.paste(bg.convert('RGB').resize((156,338)),(x,y+24));r=next((r for r in refs if r['id']==m['screenId']),None)
  if r:sheet.paste(Image.open(r['reference']).convert('RGB').resize((156,338)),(x+156,y+24))
  d.text((x,y+4),f"{m['figmaId']} -> {m['screenId']} ({m['score']})",fill='black')
 sheet.save(f'/tmp/bang-map-{page}.jpg')
print('mapped',len(mapping),flush=True)
