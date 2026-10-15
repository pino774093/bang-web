from pathlib import Path
from PIL import Image
import json,cv2,numpy as np,math,unicodedata
refs=json.loads(Path('docs/reference-files.json').read_text());ocr={f['id']:f for f in json.loads(Path('docs/reference-ocr.json').read_text())};layouts={f['id']:f for f in json.loads(Path('docs/layout-analysis.json').read_text())}
matched={f['id']:f['matches'] for f in json.loads(Path('docs/asset-matches.json').read_text())}
extras={f['id']:f['matches'] for f in json.loads(Path('docs/extra-matches.json').read_text())} if Path('docs/extra-matches.json').exists() else {}
refined={f['id']:f['matches'] for f in json.loads(Path('docs/refined-matches.json').read_text())} if Path('docs/refined-matches.json').exists() else {}
fits=json.loads(Path('docs/silhouette-placement.json').read_text())
catalog={a['src']:a for a in json.loads(Path('docs/asset-catalog.json').read_text())}
def visible(m):
 a=catalog.get(m['src']);box=a['bbox'] if a else Image.open(m['src']).convert('RGBA').getchannel('A').getbbox()
 if not box:return m['bounds']
 x0,y0,x1,y1=box;T=np.array(m['matrix']);pts=np.array([[x0,y0,1],[x1,y0,1],[x1,y1,1],[x0,y1,1]])@T.T
 return [float(pts[:,0].min()),float(pts[:,1].min()),float(np.ptp(pts[:,0])),float(np.ptp(pts[:,1]))]
def iou(a,b):
 x=max(0,min(a[0]+a[2],b[0]+b[2])-max(a[0],b[0]));y=max(0,min(a[1]+a[3],b[1]+b[3])-max(a[1],b[1]));area=x*y
 return area/max(1,a[2]*a[3]+b[2]*b[3]-area)
def rectimage(src,x,y,w,h,**extra):
 im=Image.open(src);return dict(src=src,matrix=[[w/im.width,0,x],[0,h/im.height,y]],bounds=[x,y,w,h],visibleBounds=[x,y,w,h],width=im.width,height=im.height,**extra)
screens=[]
for f in refs:
 i=f['id']
 if i==0:continue
 im=np.asarray(Image.open(f['path']).convert('RGB').resize((390,844)))
 dark=i<=13 or 138<=i<=145
 candidates=[]
 for m in matched.get(i,[])+extras.get(i,[])+refined.get(i,[]):
  if m['matches']<12 or m['error']>24:continue
  if m['matches']<35 and m['error']>12:continue
  m=dict(m);m['visibleBounds']=visible(m)
  a=catalog.get(m['src']);p=Image.open(m['src']);m['width']=p.width;m['height']=p.height
  m['score']=m['matches']*math.exp(-m['error']/8)
  candidates.append(m)
 chosen=[]
 for m in sorted(candidates,key=lambda m:m['score'],reverse=True):
  if any(iou(m['visibleBounds'],n['visibleBounds'])>.65 for n in chosen):continue
  # Suppress spurious tiny feature matches outside the canvas.
  x,y,w,h=m['visibleBounds']
  if x+w<0 or y+h<0 or x>390 or y>844:continue
  chosen.append(m)
 chosen.sort(key=lambda m:m['visibleBounds'][2]*m['visibleBounds'][3],reverse=True)
 # Remove redundant atomic cards already supplied by a better-matching composite asset.
 chosen=[m for m in chosen if not any(n is not m and any(t in n['name'] for t in ['Group 18','제목 없음','매트','손패']) and n['visibleBounds'][2]*n['visibleBounds'][3]>m['visibleBounds'][2]*m['visibleBounds'][3]*1.2 and m['visibleBounds'][0]>=n['visibleBounds'][0]-3 and m['visibleBounds'][1]>=n['visibleBounds'][1]-3 and m['visibleBounds'][0]+m['visibleBounds'][2]<=n['visibleBounds'][0]+n['visibleBounds'][2]+3 and m['visibleBounds'][1]+m['visibleBounds'][3]<=n['visibleBounds'][1]+n['visibleBounds'][3]+3 and m['error']>n['error']-2 for n in chosen)]
 # Scene background is an individual supplied table image, not a frame screenshot.
 scene = i in list(range(84,93))+list(range(94,104))+list(range(105,114))+list(range(114,115))+list(range(116,126))+list(range(127,131))
 if scene:
  # Both silhouettes have measured contour fits with <1px mean boundary error.
  background=[rectimage(a['src'],a['x'],a['y'],a['w'],a['h'],name='original silhouette') for a in fits]
  table=next(p for p in Path('assets').glob('*.png') if '테이블' in unicodedata.normalize('NFC',p.name))
  background.append(rectimage(str(table),0,260,390,584,name='original round table'))
  discard=next(p for p in Path('assets').glob('*.png') if '카드 더미' in unicodedata.normalize('NFC',p.name))
  if not any('카드 더미' in unicodedata.normalize('NFC',m['name']) for m in chosen):chosen.append(rectimage(str(discard),158,426,150,75,name='discard pile'))
  chosen=[m for m in chosen if not any(t in unicodedata.normalize('NFC',m['name']) for t in ['테이블','실루엣'])]
  # Occluded lower mats have a high whole-image color error because the hand and
  # dialogue cover their lower half. Preserve strong geometry matches nonetheless.
  perspectives=[m for m in refined.get(i,[]) if m['src'] in ['assets/source/90abd2f01f42.png','assets/source/af53d6639d93.png','assets/source/2256956e89fd.png','assets/source/b5c9d8fc3fbc.png'] and m['matches']>35 and m['error']<60]
  if perspectives:
   m=dict(max(perspectives,key=lambda m:m['matches']*math.exp(-m['error']/15)))
   m['visibleBounds']=visible(m);p=Image.open(m['src']);m['width']=p.width;m['height']=p.height
   chosen=[n for n in chosen if not any(t in n.get('name','') for t in ['Group 18','제목 없음'])]
   chosen.insert(0,m)
  elif i in list(range(97,104))+[105,114,116,117,118,123,124,125,127,128,129,130]:
   # Only the upper edge remains exposed above the dialogue panel.
   chosen.insert(0,rectimage('assets/source/2256956e89fd.png' if i>=123 else 'assets/source/90abd2f01f42.png',-39,249,483,724.5,name='original perspective mat'))
  chosen=background+chosen
 # The upright deck is a different supplied asset from the perspective deck.
 if i in list(range(49,66))+list(range(70,84))+[93,104,115,126,131,132]:
  chosen=[m for m in chosen if m['src']!='assets/source/eb13191c82f5.png']
  chosen.append(rectimage('assets/source/d291b32da533.png',106.78,66.93,89.34,115.99,name='original upright deck'))
 if 119<=i<=122:
  bang=[m for m in matched.get(i,[]) if m['name'].endswith('/갈색 테두리/01_bang.png') and m['bounds'][1]<400 and m['matches']>=20]
  if bang:
   m=dict(max(bang,key=lambda m:m['matches']));m['visibleBounds']=visible(m);p=Image.open(m['src']);m['width']=p.width;m['height']=p.height;chosen.append(m)
 # Exact hand image already contains its component cards.
 if any('손패' in unicodedata.normalize('NFC',m.get('name','')) for m in chosen):
  chosen=[m for m in chosen if not('카드 png' in m.get('name','') and m['visibleBounds'][1]>650)]
 if 66<=i<=69:
  bare=next(dict(m) for m in screens[21]['images'] if '매트' in m.get('name',''))
  composites=[m for m in refined.get(i,[]) if m['src']=='assets/source/16a27dfc6ee4.png' and m['matches']>50]
  if composites:
   m=dict(min(composites,key=lambda m:m['error']));m['visibleBounds']=visible(m);p=Image.open(m['src']);m['width']=p.width;m['height']=p.height;m['clip']='polygon(0 0,100% 0,100% 100%,40% 100%,40% 31%,0 31%)';chosen=[bare,m]+chosen
 # Fixed card-back positions are visible on the role selection PNG.
 if i==137:
  back='assets/source/7da014c6a399.png'
  chosen=[rectimage(back,x,y,136,211,name='role selection card') for x,y in [(40,84),(207,84),(40,332),(207,332)]]

 # Visible role grid remains in place behind the enlarged foreground card.
 if 36<=i<=48:
  rolefiles=['1c18f8a09fa5768446e1151dc373a95f9fba37ab','c0c667f51aaf8f9ab07a49efb454f32a3074662b','ffabd4a2d4fe972be943226a741f89bb3d017795','16d42a9c1639855b253b527f4645064e14ac3059']
  count=1 if i==48 else 2 if i==36 else 3 if i==40 else 4
  front=[m for m in chosen if m['visibleBounds'][2]>150]
  chosen=[rectimage('assets/local-figma/'+rolefiles[n]+'.png',x,y,119,185,name='role card') for n,(x,y) in enumerate([(64,130),(206,130),(64,345),(206,345)][:count])]+front
 panels=layouts[i]['panels'] if not dark else []
 # The turn summary consists of individual touching pill panels.
 if 53<=i<=59 or 61<=i<=65:
  count=1 if i<=56 else 2 if i<=59 else 3
  panels=[dict(x=10,y=469+116*n,w=374,h=116 if n<2 else 143,radius=59) for n in range(count)]
 text=[]
 for t in ocr[i]['text']:
  x,y,w,h=[t[k] for k in ['x','y','w','h']];cx=x+w/2;cy=y+h/2
  belongs=dark or any(p['x']<=cx<=p['x']+p['w'] and p['y']<=cy<=p['y']+p['h'] for p in panels)
  if not belongs and i not in [13,128,129,130,146]:continue
  if i==13 and y<200:continue
  if 128<=i<=130 and y<150 and ('SCER' in t['text']):continue
  if not belongs and not(128<=i<=130 and y<450) and not(i==146):continue
  s=t['text'].replace("'뱅은",'‘뱅!’은').replace('체력 +10 된다.','체력 +1이 된다.').replace('뱅에는','‘뱅!’에는')
  if s in ['SHERIFF','SHERIFF :']:continue
  if i==124 and s=='-°':s='-1'
  if i==130 and y<150:continue
  kind='hint' if '클릭' in s or '카드를 클릭' in s else 'copy'
  red=False
  patch=im[max(0,int(y)):min(844,int(y+h)+1),max(0,int(x)):min(390,int(x+w)+1)]
  if patch.size:red=int(((patch[:,:,0]>patch[:,:,1]*1.5)&(patch[:,:,0]>70)).sum())>15
  text.append(dict(text=s,x=x,y=y,w=w,h=min(h,24) if h>26 and kind=='copy' else h,color='#aa2e1b' if kind=='hint' else '#ef3333' if red else '#fff' if dark or belongs else '#111',kind=kind,align='left' if 133<=i<=136 and y>535 and y<740 else 'center',size=28 if 133<=i<=136 and s in ['보안관','부관','무법자','배신자'] else 24 if 'chapter' in s or s in ['기본 설명','역할 알기','체험 하기','체험하기'] else 16 if kind=='copy' else 14))
 if i==146:
  for t in text:t['color']='#fff';t['size']=20
 # Detect actual red click targets, independent of OCR label quality.
 redmask=((im[:,:,0]>180)&(im[:,:,1]<70)&(im[:,:,2]<60)).astype('uint8');n,l,stats,centers=cv2.connectedComponentsWithStats(redmask)
 buttons=[]
 for x,y,w,h,area in stats[1:]:
  if w>25 and h>25 and area>550 and y>430:
   label=next((t['text'] for t in ocr[i]['text'] if x<=t['x']+t['w']/2<=x+w and y<=t['y']+t['h']/2<=y+h),'예')
   buttons.append(dict(x=int(x)-3,y=int(y)-3,w=int(w)+7,h=int(h)+10,label=label))
 text=[t for t in text if not any(b['x']<=t['x']+t['w']/2<=b['x']+b['w'] and b['y']<=t['y']+t['h']/2<=b['y']+b['h'] for b in buttons)]
 stars=[];mask=(im.min(2)>210).astype('uint8');n,l,stats,centers=cv2.connectedComponentsWithStats(mask)
 for x,y,w,h,area in stats[1:]:
  if 29<=w<=40 and 27<=h<=40 and 200<area<500:stars.append(dict(x=int(x),y=int(y),w=int(w),h=int(h)))
 hasBack=int(redmask[:75,:80].sum())>500
 # Card back grid behind the selected role stays fixed and dimmed, as in PNG.
 if 133<=i<=136:
  back='assets/local-figma/575307c544192014be8bfbe7af3d8e2190097aed.png'
  chosen=[rectimage(back,x,y,136,211,opacity=.24) for x,y in [(40,84),(207,84),(40,332),(207,332)]]+chosen
 if i in [123,124,128,129,130]:
  text=[t for t in text if t['text']!='-1']
  text.append(dict(text='-1',x=298,y=148,w=25,h=20,color='#f33',kind='copy',align='center',size=24))
 if i in [88,89,90,91]:text.append(dict(text='가져가',x=93,y=266,w=50,h=18,color='#fff',kind='copy',align='center',size=18))
 speech=[dict(x=130,y=57,w=168,h=124,text='나 부관이라니까!' if i==128 else '야 쟤가\n무법자네' if i==129 else 'ㅋㅋ')] if 128<=i<=130 else []
 text=[t for t in text if not(128<=i<=130 and t['y']<145)]
 # Reference-only screen names do not define navigation order.
 screens.append(dict(id=i,name=f['name'],reference=f['path'],theme='dark' if dark else 'paper',back=hasBack,images=chosen,speech=speech,panels=panels,text=text,buttons=buttons,stars=stars,connectionStatus='unconfirmed',kind='chapter' if i<13 else 'chapter-menu' if i==13 else 'home' if i==14 else 'intro' if i==15 else 'roles' if 133<=i<=137 else 'ending' if i>=138 and i<=145 else 'reference-state'))
Path('data/dialogues.js').write_text('window.BANG_DIALOGUES = '+json.dumps({str(s['id']):s['text'] for s in screens},ensure_ascii=False,separators=(',',':'))+';\n')
Path('data/screens.js').write_text('window.BANG_SCREENS = '+json.dumps([{k:v for k,v in s.items() if k!='text'} for s in screens],ensure_ascii=False,separators=(',',':'))+';\n')
Path('docs/screen-manifest.json').write_text(json.dumps(screens,ensure_ascii=False,indent=2))
print('Screen definitions',len(screens),'images',sum(len(s['images']) for s in screens),'HTML text lines',sum(len(s['text']) for s in screens))
