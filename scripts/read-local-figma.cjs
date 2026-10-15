// Read-only local .fig decoder. Requires Node 24+ and kiwi-schema.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),cp=require('node:child_process');
const input=process.argv[2];
if(!input)throw new Error('Usage: node scripts/read-local-figma.cjs reference/file.fig');
const kiwi=require(process.env.BANG_KIWI_PATH||'/private/tmp/bang-fig-parser/node_modules/kiwi-schema');
const canvas=cp.execFileSync('python3',['-c','import zipfile,sys;sys.stdout.buffer.write(zipfile.ZipFile(sys.argv[1]).read("canvas.fig"))',input],{maxBuffer:64*1024*1024});
if(canvas.subarray(0,8).toString()!=='fig-kiwi')throw new Error('Unsupported Figma archive');
let offset=12;const parts=[];
while(offset+4<=canvas.length){const size=canvas.readUInt32LE(offset);offset+=4;if(offset+size>canvas.length)throw new Error('Truncated payload');const part=canvas.subarray(offset,offset+size);offset+=size;parts.push(part.readUInt32LE(0)===0xfd2fb528?zlib.zstdDecompressSync(part):zlib.inflateRawSync(part));}
const schema=kiwi.decodeBinarySchema(parts[0]);const decoded=kiwi.compileSchema(schema).decodeMessage(parts[1]);
const output='/tmp/bang-latest-decoded.json';
fs.writeFileSync(output,JSON.stringify(decoded,(key,value)=>typeof value==='bigint'?value.toString():value instanceof Uint8Array?{encoding:'base64',data:Buffer.from(value).toString('base64')}:value));
console.log(`Decoded ${decoded.nodeChanges.length} layers into ${output}. Original file unchanged.`);
