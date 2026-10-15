from pathlib import Path
import json,cv2,numpy as np
from PIL import Image
refs=json.loads(Path('docs/reference-ocr.json').read_text());out=[]
for f in refs:
 if f['id']==0:continue
 im=np.asarray(Image.open(f['path']).convert('RGB').resize((390,844)))
 dark=(im.max(axis=2)<35).astype('uint8');clipped=dark.copy();clipped[:80]=0;clipped[:,:25]=0;clipped[:,366:]=0
 n,labels,stats,centers=cv2.connectedComponentsWithStats(clipped)
 panels=[]
 for x,y,w,h,area in stats[1:]:
  if area>4000 and w>220 and h>45:
   # center dialog is x30...359; lower dialogs extend to both screen edges.
   cy=min(843,int(y+h/2));xs=np.where(dark[cy]>0)[0];left=0 if dark[cy,1] else 30
   panels.append(dict(x=left,y=int(y),w=390 if left==0 else 329,h=int(h),radius=59 if left else 55))
 text=[]
 for t in f['text']:
  x,y,w,h=[t[k] for k in ['x','y','w','h']];x0=max(0,int(x)-3);x1=min(390,int(x+w)+3);y0=max(0,int(y)-4);y1=min(844,int(y+h)+4)
  patch=im[y0:y1,x0:x1]
  ratio=float((patch.max(axis=2)<45).mean()) if patch.size else 0
  if ratio>.4 or (f['id']<14 and t['y']>200) or (f['id']>=138):
   text.append(dict(**t,onDark=ratio))
 out.append(dict(id=f['id'],name=f['name'],path=f['path'],panels=panels,text=text))
Path('docs/layout-analysis.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
for i in [8,15,18,34,36,53,57,61,66,84,97,101,114,127,133,137,138,145,146]:
 f=next(x for x in out if x['id']==i);print(i,f['panels'],[(t['text'],round(t['y'])) for t in f['text']])
