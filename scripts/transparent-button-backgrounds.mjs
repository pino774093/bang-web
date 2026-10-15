// Remove exterior white matte and recover antialiased black-ink edge coverage.
// All non-exterior pixels are preserved byte for byte.
// No resizing, cropping, drawing, color changes, or removal of enclosed white labels.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const names = ['button-rules.png', 'button-cards.png', 'intro-back.png'];
const write = process.argv.includes('--write');
const crc32 = bytes => {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const name = Buffer.from(type), length = Buffer.alloc(4), crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
};
function decode(bytes) {
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  let header; const chunks = [], compressed = [];
  for (let offset = 8; offset < bytes.length;) {
    const size = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + size);
    if (type === 'IHDR') header = data;
    else if (type === 'IDAT') compressed.push(data);
    else if (type !== 'IEND') chunks.push({type, data});
    offset += 12 + size;
  }
  assert.equal(header[8], 8); assert.equal(header[9], 6); assert.equal(header[12], 0);
  const width = header.readUInt32BE(0), height = header.readUInt32BE(4), stride = width * 4;
  const raw = zlib.inflateSync(Buffer.concat(compressed)), pixels = Buffer.alloc(stride * height);
  const paeth = (a,b,c) => { const p=a+b-c, x=Math.abs(p-a),y=Math.abs(p-b),z=Math.abs(p-c); return x<=y && x<=z ? a : y<=z ? b : c; };
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]; assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const i = y * stride + x, a = x >= 4 ? pixels[i-4] : 0, b = y ? pixels[i-stride] : 0, c = y && x>=4 ? pixels[i-stride-4] : 0;
      pixels[i] = (raw[y*(stride+1)+1+x] + [0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter]) & 255;
    }
  }
  return {header, chunks, width, height, pixels};
}
function encode(image) {
  const stride = image.width * 4, raw = Buffer.alloc((stride+1)*image.height);
  for (let y=0;y<image.height;y++) image.pixels.copy(raw,y*(stride+1)+1,y*stride,(y+1)*stride);
  return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',image.header),...image.chunks.map(c=>chunk(c.type,c.data)),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
for (const name of names) {
  const target = path.join(root,'assets',name), backup = path.join(root,'assets','originals',name);
  const original = fs.readFileSync(fs.existsSync(backup) ? backup : target);
  const image = decode(original), before = Buffer.from(image.pixels), {width,height,pixels} = image;
  const visited = new Uint8Array(width*height), queue=[];
  const exteriorWhite = p => {
    const i=p*4, min=Math.min(pixels[i],pixels[i+1],pixels[i+2]),max=Math.max(pixels[i],pixels[i+1],pixels[i+2]);
    return pixels[i+3]===0 || (min>17 && max-min<=10);
  };
  const add = p => { if (!visited[p] && exteriorWhite(p)) {visited[p]=1; queue.push(p);} };
  for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}
  for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
  for(let k=0;k<queue.length;k++){
    const p=queue[k],x=p%width,y=Math.floor(p/width);
    if(x>0)add(p-1);if(x<width-1)add(p+1);if(y>0)add(p-width);if(y<height-1)add(p+width);
  }
  let cleared=0, recoveredEdgePixels=0, preservedWhite=0;
  for(let p=0;p<width*height;p++) {
    if(visited[p] && pixels[p*4+3]) {
      const i=p*4;
      // Figma's white matte was baked into the black ink's antialias pixels.
      // Solve C = alpha * 17 + (1 - alpha) * 255 instead of deleting that texture.
      const matte=Math.min(before[i],before[i+1],before[i+2]);
      const coverage=(255-matte)/(255-17);
      pixels[i+3]=Math.round(before[i+3]*coverage);
      if(pixels[i+3]===0)cleared++;
      else recoveredEdgePixels++;
      pixels[i]=pixels[i+1]=pixels[i+2]=17;
    }
    else if(!visited[p] && before[p*4]>=245 && before[p*4+1]>=245 && before[p*4+2]>=245)preservedWhite++;
    if(!visited[p])for(let channel=0;channel<4;channel++)assert.equal(pixels[p*4+channel],before[p*4+channel]);
  }
  const encoded=encode(image), decoded=decode(encoded);
  assert.deepEqual(decoded.pixels,pixels);assert.ok(preservedWhite>0);
  console.log(JSON.stringify({name,width,height,clearedExteriorPixels:cleared,recoveredEdgePixels,preservedWhiteForegroundPixels:preservedWhite,nonExteriorPixelsUnchanged:true,cornerBefore:[...before.subarray(0,4)],cornerAfter:[...pixels.subarray(0,4)],mode:write?'write':'inspect'}));
  if(write){fs.mkdirSync(path.dirname(backup),{recursive:true});if(!fs.existsSync(backup))fs.writeFileSync(backup,original);fs.writeFileSync(target,encoded);fs.writeFileSync(target.replace('.png','-transparent-v2.png'),encoded);}
}
