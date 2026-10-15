import json,time
from pathlib import Path
import Vision,Quartz,Foundation
files=json.loads(Path('docs/reference-files.json').read_text());output=[]
for f in files:
 url=Foundation.NSURL.fileURLWithPath_(str(Path(f['path']).resolve()))
 source=Quartz.CGImageSourceCreateWithURL(url,None);image=Quartz.CGImageSourceCreateImageAtIndex(source,0,None)
 req=Vision.VNRecognizeTextRequest.alloc().init();req.setRecognitionLevel_(Vision.VNRequestTextRecognitionLevelAccurate);req.setRecognitionLanguages_(['ko-KR','en-US']);req.setUsesLanguageCorrection_(False)
 handler=Vision.VNImageRequestHandler.alloc().initWithCGImage_options_(image,{})
 ok,error=handler.performRequests_error_([req],None)
 text=[]
 if ok:
  for obs in req.results():
   candidate=obs.topCandidates_(1)[0];b=obs.boundingBox()
   text.append(dict(text=candidate.string(),confidence=candidate.confidence(),x=b.origin.x*390,y=(1-b.origin.y-b.size.height)*844,w=b.size.width*390,h=b.size.height*844))
 output.append(dict(**f,text=text));Path('docs/reference-ocr.json').write_text(json.dumps(output,ensure_ascii=False,indent=2))
 print(f['id'],f['name'],len(text),flush=True)
