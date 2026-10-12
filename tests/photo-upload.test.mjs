import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
const source=fs.readFileSync(new URL('../public/photo-upload.js',import.meta.url),'utf8'),MB=1024*1024;
const permit={ok:true,status:200,json:async()=>({lease:'a'.repeat(64)})};
function setup(extra={}){const context=vm.createContext({window:{},Blob,File,URL,AbortController,Math,Error,Set,Image:class{},setTimeout(fn,ms){if(ms<15000)queueMicrotask(fn);return 1;},clearTimeout(){},...extra});vm.runInContext(source,context);return context.window.GUIDE_PHOTO_UPLOAD;}
test('작은 사진 유지, 원본 용량 초과와 압축 실패 안내',async()=>{
 const api=setup({createImageBitmap:async()=>{throw Error('decode failed');}}),small=new File(['x'],'test.jpg',{type:'image/jpeg'});
 assert.equal((await api.prepare(small)).file,small);
 await assert.rejects(api.prepare({size:41*MB,type:'image/jpeg'}),/사진 용량이 너무 큽니다/);
 await assert.rejects(api.prepare({size:11*MB,type:'image/jpeg'}),/자동 압축을 완료하지 못했습니다/);
 await assert.rejects(api.prepare({size:MB,type:'image/heic'}),/JPEG로 변환/);
});
test('큰 사진을 JPEG로 줄이고 비트맵 해제, 압축 후 용량 초과 거절',async()=>{
 let closed=0,quality=[],outputSize=1000;
 const canvas={width:0,height:0,getContext(){return {fillRect(){},drawImage(){}};},toBlob(fn,type,q){quality.push(q);fn({size:outputSize});}};
 const api=setup({createImageBitmap:async()=>({width:4000,height:3000,close(){closed++;}}),document:{createElement(){return canvas;}}});
 const result=await api.prepare({size:15*MB,type:'image/png',name:'large.png',lastModified:1});assert.equal(result.compressed,true);assert.equal(result.file.type,'image/jpeg');assert.equal(result.originalBytes,15*MB);assert.equal(closed,1);assert.equal(canvas.width,1);
 outputSize=11*MB;await assert.rejects(api.prepare({size:15*MB,type:'image/png',name:'large.png'}),/용량이 너무 큽니다/);assert.equal(closed,2);assert.equal(quality.length,7);
});
test('일시 오류 자동 재시도, 같은 파일 요청 유지, 용량 초과는 재시도하지 않음',async()=>{
 let calls=0;const form=new FormData(),retries=[];
 const api=setup({fetch:async(url,options)=>{if(url.endsWith('slot'))return permit;assert.equal(options.body,form);assert.equal(options.headers['X-Photo-Upload-Lease'],'a'.repeat(64));calls++;return {ok:calls===4,status:calls===4?200:503,json:async()=>({message:'stored'})};}});
 await api.send(form,n=>retries.push(n));assert.equal(calls,4);assert.deepEqual(retries,[1,2,3]);
 let rejectedCalls=0;const reject=setup({fetch:async(url)=>{if(url.endsWith('slot'))return permit;rejectedCalls++;return {ok:false,status:413,json:async()=>({error:'사진 용량이 너무 큽니다.'})};}});
 await assert.rejects(reject.send(form),/용량이 너무 큽니다/);assert.equal(rejectedCalls,1);
 const offline=setup({fetch:async()=>{throw new TypeError('Failed to fetch');}});await assert.rejects(offline.send(form),/통신이 원활하지 않아/);
});
test('한 페이지의 겹친 업로드를 직렬화하고 서버 대기 안내를 따른다',async()=>{
 const delays=[];let active=0,peak=0,calls=0;
 const api=setup({setTimeout(fn,ms){if(ms<15000){delays.push(ms);queueMicrotask(fn);}return 1;},fetch:async(url)=>{if(url.endsWith('slot'))return permit;active++;peak=Math.max(peak,active);await Promise.resolve();active--;calls++;return {ok:calls!==1,status:calls===1?429:200,headers:{get:()=>calls===1?'7':null},json:async()=>({id:'stored'})};}});
 await Promise.all([api.send(new FormData(),()=>{},{firstInBatch:true}),api.send(new FormData(),()=>{},{firstInBatch:false})]);
 assert.equal(peak,1);assert.equal(calls,3);assert.ok(delays[0]>=1000&&delays[0]<9000);assert.equal(delays[1],7000);assert.ok(delays[2]>=1000&&delays[2]<3000);
});
test('업로드 자리가 빌 때까지 사진 본문을 보내지 않고 만료되면 새 자리를 받는다',async()=>{
 let polls=0,uploads=0,waiting=0;const api=setup({fetch:async(url)=>{
  if(url.endsWith('slot')){polls++;return polls===1?{ok:true,status:200,json:async()=>({wait:true})}:permit;}
  uploads++;return uploads===1?{ok:false,status:409,json:async()=>({renewLease:true})}:{ok:true,status:200,json:async()=>({id:'stored'})};
 }});await api.send(new FormData(),()=>{},{onWait(){waiting++;assert.equal(uploads,0);}});assert.equal(waiting,1);assert.equal(polls,3);assert.equal(uploads,2);
});
