import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {createInterface} from 'node:readline';
import {previewDatabase} from './preview-db.mjs';
import {previewBucket} from './preview-bucket.mjs';
const configLines=createInterface({input:process.stdin});console.log('Ready for preview environment JSON on stdin.');
const env=await new Promise(resolve=>configLines.once('line',line=>resolve(JSON.parse(line))));
env.DB=previewDatabase();
env.BUCKET=previewBucket();
const {default:worker}=await import('./dist/server/index.js');
const root=path.resolve('public'),types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
env.ASSETS={async fetch(request){const pathname=decodeURIComponent(new URL(request.url).pathname);const file=path.resolve(root,`.${pathname==='/'?'/index.html':pathname}`);if(!file.startsWith(root+path.sep))return new Response('Forbidden',{status:403});try{return new Response(request.method==='HEAD'?null:await fs.readFile(file),{headers:{'Content-Type':types[path.extname(file)]||'application/octet-stream'}});}catch{return new Response('Not found',{status:404});}}};
http.createServer(async(req,res)=>{
  try{const url=`http://127.0.0.1:4173${req.url}`;let body; if(req.method!=='GET'&&req.method!=='HEAD'){const chunks=[];for await(const chunk of req)chunks.push(chunk);body=Buffer.concat(chunks);}
    const response=await worker.fetch(new Request(url,{method:req.method,headers:req.headers,body}),env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  }catch{res.writeHead(500,{'Content-Type':'text/plain'}).end('Preview request failed');}
}).listen(4173,'127.0.0.1',()=>console.log('http://127.0.0.1:4173/'));
