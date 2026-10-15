from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json
files=json.loads(Path('docs/reference-files.json').read_text())
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',16)
for start in range(0,len(files),30):
 page=Image.new('RGB',(1170,2250),'#ddd');draw=ImageDraw.Draw(page)
 for j,f in enumerate(files[start:start+30]):
  im=Image.open(f['path']).convert('RGB');im.thumbnail((190,411))
  x=(j%6)*195;y=(j//6)*450
  page.paste(im,(x,y+28));draw.text((x+3,y+3),str(f['id'])+' '+f['name'].replace('게임설명시작','G').replace('역할선택로딩','R'),font=font,fill='black')
 page.save(f'docs/contact-{start//30}.jpg')
