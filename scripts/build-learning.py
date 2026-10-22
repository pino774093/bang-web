"""Compile the read-only Figma context into buildless HTML/CSS scene data.

Existing simulation data and renderers are deliberately not inputs or outputs.
"""
import concurrent.futures, hashlib, html, json, re, subprocess
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
contexts = json.loads((ROOT/'docs/figma-learning/contexts.json').read_text())
frames = json.loads((ROOT/'docs/figma-learning/frames.json').read_text())
assets = ROOT/'assets/learning'
assets.mkdir(exist_ok=True)
map_file=ROOT/'docs/figma-learning/asset-map.json'
previous=json.loads(map_file.read_text()) if map_file.exists() else {}

def css(classes):
    d = {}; transforms = {}
    simple = {
        'absolute':('position','absolute'), 'relative':('position','relative'),
        'contents':('display','contents'), 'block':('display','block'), 'flex':('display','flex'),
        'flex-col':('flex-direction','column'), 'flex-none':('flex','none'),
        'items-center':('align-items','center'), 'justify-center':('justify-content','center'),
        'overflow-hidden':('overflow','hidden'), 'pointer-events-none':('pointer-events','none'),
        'object-cover':('object-fit','cover'), 'object-bottom':('object-position','bottom'),
        'max-w-none':('max-width','none'), 'text-center':('text-align','center'),
        'whitespace-nowrap':('white-space','nowrap'), 'whitespace-pre':('white-space','pre'),
        'bg-white':('background','#fff'), 'text-white':('color','#fff'), 'text-black':('color','#000'),
        'border-black':('border-color','#000'), 'border-solid':('border-style','solid'),
        'list-decimal':('list-style-type','decimal'), 'cursor-pointer':('cursor','pointer'),
        'not-italic':('font-style','normal'), 'mix-blend-overlay':('mix-blend-mode','overlay'),
        '[word-break:break-word]':('overflow-wrap','break-word'),
    }
    props={'w':'width','h':'height','left':'left','top':'top','inset':'inset','rounded':'border-radius',
           'tracking':'letter-spacing','leading':'line-height','mb':'margin-bottom','ms':'margin-inline-start',
           'shadow':'box-shadow','bg':'background','border':'border-color'}
    for c in classes.split():
        if c in simple: k,v=simple[c];d[k]=v
        elif c=='size-full': d.update(width='100%',height='100%')
        elif c in ('w-full','h-full'):d['width' if c=='w-full' else 'height']='100%'
        elif c in ('inset-0','left-0','top-0'): d[c.split('-')[0]]='0'
        elif c.startswith('opacity-'):d['opacity']=str(float(c[8:])/100)
        elif c=='border' or re.fullmatch(r'border-\d+',c):d.update({'border-width':('1' if c=='border' else c[7:])+'px','border-style':'solid'})
        elif c.startswith('font-'):d['font-weight']='600' if ':040' in c else '400'
        elif c.startswith('-translate-'):transforms[c.split('-')[2]]='-50%'
        elif m:=re.fullmatch(r'(-?)(rotate|skew-x)-(?:\[([^\]]+)\]|([\d.]+))',c):
            v=m[3] or m[4]+'deg';v=('-' if m[1] else '')+v;transforms[m[2]]=v
        elif m:=re.fullmatch(r'([a-z-]+)-\[(.*)\]',c):
            p,v=m.groups();v=v.replace('_',' ')
            if p=='text':d['color' if v.startswith('#') else 'font-size']=v
            elif p=='size':d.update(width=v,height=v)
            elif p in props:d[props[p]]=v
            else:raise ValueError('Unknown class '+c)
        else:raise ValueError('Unknown class '+c)
    if 'box-shadow' in d:
        # Figma image shadows must follow alpha, not the rectangular wrapper.
        # CSS drop-shadow uses a Gaussian deviation (half the box-shadow blur).
        shadow=d.pop('box-shadow')
        parts=re.findall(r'(-?[\d.]+)px (-?[\d.]+)px ([\d.]+)px 0px (rgba?\([^)]+\)|#[a-fA-F0-9]+)',shadow)
        if not parts:raise ValueError('Unsupported image shadow '+shadow)
        d['filter']=' '.join(f'drop-shadow({x}px {y}px {float(blur)/2:g}px {color})' for x,y,blur,color in parts)
    if transforms:
        d['transform']=' '.join([f'translate({transforms.get("x","0")},{transforms.get("y","0")})']+
             ([f'rotate({transforms["rotate"]})'] if 'rotate'in transforms else [])+
             ([f'skewX({transforms["skew-x"]})'] if 'skew-x'in transforms else []))
    return ';'.join(f'{k}:{v}' for k,v in d.items())

variables={fid:dict(re.findall(r'const (\w+) = "(https://[^\"]+)";',code)) for fid,code in contexts.items()}
urls=sorted({url for vars in variables.values() for url in vars.values()})
urlpaths={url:'assets/learning/'+url.rsplit('/',1)[1] for url in urls}
def download(url):
    if url in previous and (ROOT/previous[url]).is_file():
        urlpaths[url]=previous[url]
        return url
    target=ROOT/urlpaths[url]
    if not target.exists() or not target.stat().st_size:
        pending=target.with_suffix(target.suffix+'.part')
        subprocess.run(['curl','-f','-sS','-L','--connect-timeout','15','--max-time','60','--retry','3','--retry-all-errors','-o',str(pending),url],check=True)
        pending.replace(target)
    return url
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(download,urls))
# Exact byte matches reuse the existing local asset, including originals.
hashes={}
for path in sorted((ROOT/'assets').rglob('*')):
    if path.is_file() and path.suffix in ('.png','.svg','.jpg') and 'learning' not in path.parts:
        hashes.setdefault(hashlib.sha256(path.read_bytes()).hexdigest(),path.relative_to(ROOT).as_posix())
for url,path in urlpaths.items():
    digest=hashlib.sha256((ROOT/path).read_bytes()).hexdigest()
    urlpaths[url]=hashes.setdefault(digest,path)
map_file.write_text(json.dumps(urlpaths,ensure_ascii=False,indent=2)+'\n')

class Parser(HTMLParser):
    def __init__(self):super().__init__(convert_charrefs=False);self.out=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs);classes=attrs.pop('classname','');attrs.pop('class',None)
        if tag=='a':tag='div'
        if tag=='button':attrs['type']='button'
        if 'src'in attrs:attrs['src']=urlpaths.get(attrs['src'],attrs['src'])
        if classes:attrs['style']=css(classes)
        attrs['class']='learning-layer'
        self.out.append('<'+tag+''.join(' '+k+(('="'+html.escape(v,quote=True)+'"') if v is not None else '') for k,v in attrs.items())+'>')
    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs)
        if tag!='img':self.handle_endtag(tag)
    def handle_endtag(self,tag):
        if tag=='a':tag='div'
        if tag!='img':self.out.append('</'+tag+'>')
    def handle_data(self,s):self.out.append(s)
    def handle_entityref(self,s):self.out.append('&'+s+';')
    def handle_charref(self,s):self.out.append('&#'+s+';')

scenes={}
for fid,code in contexts.items():
    body=code.split('export default function',1)[1].split('return (',1)[1].rsplit(');',1)[0]
    # Inline the single Figma role-card helper as ordinary HTML.
    if '<Component1 ' in body:
        helper=code.split('function Component1',1)[1].split('return (',1)[1].split(');',1)[0]
        def component(m):
            cl=re.search(r'className="([^"]+)"',m[0]).group(1)
            return re.sub(r'className=\{className \|\| "[^"]+"\}',lambda _: 'className="'+cl+'"',helper)
        body=re.sub(r'<Component1\b[^>]+/>',component,body)
    body=re.sub(r'\{`([^`]*)`\}',lambda m:html.escape(m[1]),body)
    body=re.sub(r'src=\{(\w+)\}',lambda m:'src="'+variables[fid][m[1]]+'"',body)
    body=body.replace('{" "}',' ')
    if re.search(r'\{[^}]+\}',body):raise ValueError('Unconverted JSX '+fid)
    p=Parser();p.feed(body);scenes[fid]=''.join(p.out).strip()

payload={'frames':frames,'scenes':scenes}
(ROOT/'data/learning-scenes.js').write_text('// Figma STEP 1–3; generated by scripts/build-learning.py.\nwindow.BANG_LEARNING_SCENES = '+json.dumps(payload,ensure_ascii=False,separators=(',',':'))+';\n')
# Remove only duplicate files created by this import, never existing artwork.
used=set(urlpaths.values())
for url in urls:
    candidate=assets/url.rsplit('/',1)[1]
    if candidate.is_file() and candidate.relative_to(ROOT).as_posix() not in used:candidate.unlink()
print(f'Compiled {len(scenes)} learning scenes; {len(set(urlpaths.values()))} unique local graphics.')
