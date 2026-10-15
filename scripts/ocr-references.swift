import Foundation
import Vision
import ImageIO
let root=URL(fileURLWithPath:FileManager.default.currentDirectoryPath)
let input=try Data(contentsOf:root.appendingPathComponent("docs/reference-files.json"))
let files=try JSONSerialization.jsonObject(with:input) as! [[String:Any]]
var output=[[String:Any]]()
for file in files {
 let url=root.appendingPathComponent(file["path"] as! String)
 guard let source=CGImageSourceCreateWithURL(url as CFURL,nil),let image=CGImageSourceCreateImageAtIndex(source,0,nil) else {continue}
 let req=VNRecognizeTextRequest();req.recognitionLevel = .accurate;req.recognitionLanguages=["ko-KR","en-US"];req.usesLanguageCorrection=false
 try VNImageRequestHandler(cgImage:image).perform([req])
 let text=(req.results ?? []).compactMap { o -> [String:Any]? in
  guard let c=o.topCandidates(1).first else{return nil};let b=o.boundingBox
  return ["text":c.string,"confidence":c.confidence,"x":b.minX*390,"y":(1-b.maxY)*844,"w":b.width*390,"h":b.height*844]
 }
 var f=file;f["text"]=text;output.append(f)
 try JSONSerialization.data(withJSONObject:output,options:[.prettyPrinted,.sortedKeys,.withoutEscapingSlashes]).write(to:root.appendingPathComponent("docs/reference-ocr.json"))
 print("\(file["id"]!) \(file["name"]!) \(text.count) lines")
}
