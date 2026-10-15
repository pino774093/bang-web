from pathlib import Path
from PIL import Image
import hashlib,json,shutil,unicodedata
manifest=json.loads(Path('docs/source-assets.json').read_text());out=[];hashes={}
Path('assets/source').mkdir(exist_ok=True)
for e in manifest['assets']:
 p=Path(e['source'])
 if p.suffix.lower() not in ['.png','.jpg','.jpeg']:continue
 h=hashlib.sha256(p.read_bytes()).hexdigest()[:12]
 if h in hashes:continue
 im=Image.open(p);ext='.png' if im.format=='PNG' else '.jpg';dest=Path('assets/source')/(h+ext);shutil.copy2(p,dest)
 a=im.convert('RGBA');alpha=a.getchannel('A');bbox=alpha.getbbox()
 row=dict(src=str(dest),name=e['displayName'],width=im.width,height=im.height,bbox=bbox,category=e['category'],corner=a.getpixel((0,0)))
 out.append(row);hashes[h]=row
# Existing local native archive images, including the original halftone texture.
for p in Path('assets/local-figma').glob('*'):
 im=Image.open(p);out.append(dict(src=str(p),name=p.name,width=im.width,height=im.height,bbox=im.convert('RGBA').getchannel('A').getbbox(),category='embedded-original',corner=im.convert('RGBA').getpixel((0,0))))
Path('docs/asset-catalog.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
print('Unique asset images:',len(out))
for e in out:
 if e['category'] not in ['role-card','character-card','game-card']:print(e['src'],unicodedata.normalize('NFC',e['name']),e['width'],e['height'],e['bbox'],e['corner'])
