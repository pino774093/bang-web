from pathlib import Path
import json,cv2,numpy as np,time,sys,unicodedata
from PIL import Image
cv2.setNumThreads(4)
assets=json.loads(Path('docs/asset-catalog.json').read_text());refs=json.loads(Path('docs/reference-files.json').read_text())
if '--extras' in sys.argv:
 assets=[]
 for p in Path('assets').glob('*.png'):
  if unicodedata.normalize('NFC',p.name) in ['펼쳐진 카드 손패.png','카드 더미.png','둥근나무테이블.png'] or '실루엣' in unicodedata.normalize('NFC',p.name):
   im=Image.open(p);assets.append(dict(src=str(p),name=p.name,width=im.width,height=im.height))
output_file='docs/extra-matches.json' if '--extras' in sys.argv else 'docs/asset-matches.json'
sift=cv2.SIFT_create(nfeatures=2400,contrastThreshold=.035)
source=[]
for a in assets:
 if a['src'].endswith('.jpg') or any(t in a['name'] for t in ['일러스트','현상수배','우드그레인','a72b7','fa1003','23a49e','c5a3db','bf1b0','57dd8','0d5008','035a64','BANG!.png']):continue
 im=np.asarray(Image.open(a['src']).convert('RGBA'));rgb=im[:,:,:3].copy();rgb[im[:,:,3]<30]=180
 scale=min(1,850/max(rgb.shape[:2]));rgb=cv2.resize(rgb,None,fx=scale,fy=scale)
 gray=cv2.cvtColor(rgb,cv2.COLOR_RGB2GRAY);kp,de=sift.detectAndCompute(gray,None)
 if de is None:continue
 source.append((a,scale,kp,de))
print('Templates',len(source),flush=True)
matcher=cv2.FlannBasedMatcher(dict(algorithm=1,trees=4),dict(checks=40));out=[]
for f in refs:
 if f['id']==0:continue
 ref=np.asarray(Image.open(f['path']).convert('RGB').resize((780,1688)));gray=cv2.cvtColor(ref,cv2.COLOR_RGB2GRAY)
 rk,rd=sift.detectAndCompute(gray,None);found=[]
 for a,sc,kp,de in source:
  matches=matcher.knnMatch(de,rd,k=2);good=[m for m,n in matches if m.distance<.63*n.distance]
  if len(good)<7:continue
  src=np.float32([kp[m.queryIdx].pt for m in good]);dst=np.float32([rk[m.trainIdx].pt for m in good])
  for repeat in range(4):
   if len(src)<7:break
   M,mask=cv2.estimateAffinePartial2D(src,dst,method=cv2.RANSAC,ransacReprojThreshold=2,maxIters=1500,confidence=.995)
   if M is None:break
   valid=mask.ravel().astype(bool);count=int(valid.sum());frac=count/len(src)
   if count<7:break
   s=float(np.linalg.norm(M[:,0]));angle=float(np.degrees(np.arctan2(M[1,0],M[0,0])))
   T=M.copy()/2;T[:,:2]*=sc
   w=a['width'];h=a['height'];corners=np.array([[0,0,1],[w,0,1],[w,h,1],[0,h,1]],float)@T.T
   bb=[float(corners[:,0].min()),float(corners[:,1].min()),float(np.ptp(corners[:,0])),float(np.ptp(corners[:,1]))]
   span=np.ptp(src[valid],axis=0)/(np.array([w,h])*sc)
   if 15<bb[2]<1000 and 20<bb[3]<2200 and -1000<bb[0]<390 and -1400<bb[1]<844 and s>.025 and count>=max(7,len(good)*.07) and np.prod(span)>.035:
    # Compare only real, opaque pixels after warping to the screen.
    rgba=np.asarray(Image.open(a['src']).convert('RGBA'))
    warp=cv2.warpAffine(rgba,T*2,(780,1688));alpha=warp[:,:,3]>240
    visible=int(alpha.sum());err=float(np.abs(warp[:,:,:3].astype(float)-ref).mean(axis=2)[alpha].mean()) if visible else 255
    found.append(dict(src=a['src'],name=a['name'],matrix=T.tolist(),bounds=bb,matches=count,coverage=span.tolist(),error=err,angle=angle))
   src=src[~valid];dst=dst[~valid]
 out.append(dict(**f,matches=found))
 Path(output_file).write_text(json.dumps(out,ensure_ascii=False,indent=2))
 print(f['id'],len(found),flush=True)
