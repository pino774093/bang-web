from PIL import Image
from pathlib import Path
import numpy as np,json,unicodedata
refs=json.loads(Path('docs/reference-files.json').read_text());ref=np.array(Image.open(refs[84]['path']).convert('RGB').resize((390,844)));mask=ref.max(2)<25
fits=[]
for side,term in [('left','귀에'),('right','팔짱')]:
 p=next(p for p in Path('assets').glob('*.png') if term in unicodedata.normalize('NFC',p.name));a=np.array(Image.open(p).convert('RGBA'));alpha=a[:,:,3]>220
 sy=np.arange(alpha.shape[0]);edge=np.array([np.where(row)[0].max() if row.any() else np.nan for row in alpha]) if side=='left' else np.array([np.where(row)[0].min() if row.any() else np.nan for row in alpha])
 ys=np.arange(90,350);target=np.array([np.where(mask[y,:185])[0].max() for y in ys]) if side=='left' else np.array([np.where(mask[y,205:])[0].min()+205 for y in ys])
 best=None
 for scale in np.arange(.2,.46,.002):
  for oy in np.arange(-150,80,2):
   row=(ys-oy)/scale
   if row.min()<0 or row.max()>=len(edge)-1:continue
   val=np.interp(row,sy,edge)*scale
   if not np.isfinite(val).all():continue
   ox=np.median(target-val);err=float(np.abs(val+ox-target).mean())
   if best is None or err<best[0]:best=(err,scale,float(ox),float(oy))
 err,scale,x,y=best
 fits.append(dict(src=str(p),x=x,y=y,w=a.shape[1]*scale,h=a.shape[0]*scale,error=err))
 print(side,fits[-1])
Path('docs/silhouette-placement.json').write_text(json.dumps(fits,ensure_ascii=False,indent=2))
