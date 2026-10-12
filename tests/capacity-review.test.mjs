import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {previewDatabase} from '../preview-db.mjs';import {createHandler} from '../worker/handler.mjs';
const origin='https://test.local',bytes=new Uint8Array(1024*1024);bytes.set([255,216,255]);
const expected=createHash('sha256').update(bytes).digest('hex'),itineraries=Object.fromEntries(Array.from({length:10},(_,i)=>[i+1,[{id:'peace',title:'검증 장소'}]]));
// Isolated local handler/SQLite test. This does not measure the hosted Worker or R2.
for(const users of [30,100,300])test(`${users}명 동시 시작·1인 10장: 저장 손실/중복/내용 손상 없이 완료`,async()=>{
 const hashes=new Map(),env={DB:previewDatabase(':memory:'),BUCKET:{async put(key,file){hashes.set(key,createHash('sha256').update(new Uint8Array(await file.arrayBuffer())).digest('hex'));},async delete(key){hashes.delete(key);}}},worker=createHandler({}, {},itineraries),times=[],start=performance.now();let waiting=0;
 const tasks=Array.from({length:users},async(_,index)=>{
  const n=index%10+1,seat=Math.floor(index/10)+1,no='2'+String(n).padStart(2,'0')+String(seat).padStart(2,'0'),token=crypto.randomUUID(),began=performance.now();
  for(let fileNo=0;fileNo<10;fileNo++){
   const data={id:crypto.randomUUID(),token,no,classNo:n,name:'부하검증학생',spotId:'peace',title:'검증 '+fileNo,caption:''};let lease;
   while(!lease){const response=await worker.fetch(new Request(origin+'/api/photo-upload-slot',{method:'POST',headers:{Origin:origin},body:JSON.stringify({...data,photoBytes:bytes.length})}),env);assert.equal(response.status,200);const result=await response.json();lease=result.lease;if(!lease){waiting++;await new Promise(r=>setTimeout(r,10+index%20));}}
   const form=new FormData();form.append('data',JSON.stringify(data));form.append('photo',new Blob([bytes],{type:'image/jpeg'}),'test.jpg');
   const result=await worker.fetch(new Request(origin+'/api/photos',{method:'POST',headers:{Origin:origin,'X-Photo-Upload-Lease':lease},body:form}),env);assert.equal(result.status,200,await result.text());
  }times.push(performance.now()-began);
 });
 await Promise.all(tasks);
 const row=(await env.DB.prepare('SELECT COUNT(*) AS n,COUNT(DISTINCT id) AS uniquePhotos FROM contest_photos').bind().all()).results[0];assert.equal(row.n,users*10);assert.equal(row.uniquePhotos,users*10);assert.equal(hashes.size,users*10);assert.ok([...hashes.values()].every(h=>h===expected));
 assert.equal((await env.DB.prepare("SELECT COUNT(*) AS n FROM photo_upload_slots WHERE state<>'idle'").bind().all()).results[0].n,0);
 times.sort((a,b)=>a-b);console.log(JSON.stringify({environment:'local-handler-sqlite-hash-bucket',users,photos:row.n,waitingRequests:waiting,elapsedSeconds:+((performance.now()-start)/1000).toFixed(2),studentCompletionP95Seconds:+(times[Math.ceil(times.length*.95)-1]/1000).toFixed(2)}));
});
