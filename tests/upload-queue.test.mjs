import test from 'node:test';import assert from 'node:assert/strict';
import {reserveUpload,queuedUpload} from '../worker/upload-queue.mjs';import {previewDatabase} from '../preview-db.mjs';
const origin='https://test.local';
const reserve=data=>new Request(origin+'/api/photo-upload-slot',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});
test('공유 업로드 자리는 20개, 반과 무관하게 대기하고 완료·만료 시 다시 사용할 수 있다',async()=>{
 const env={DB:previewDatabase(':memory:')},students=Array.from({length:21},()=>({id:crypto.randomUUID(),token:crypto.randomUUID(),photoBytes:1000})),leases=[];
 for(const s of students.slice(0,20)){const r=await reserveUpload(reserve(s),env);assert.equal(r.status,200);leases.push((await r.json()).lease);}
 assert.equal(new Set(leases).size,20);assert.equal((await(await reserveUpload(reserve(students[20]),env)).json()).wait,true);
 assert.equal((await queuedUpload(new Request(origin+'/api/photos',{method:'POST',headers:{Origin:origin}}),env,()=>{throw Error('must wait');})).status,503);
 assert.equal((await(await reserveUpload(reserve(students[0]),env)).json()).lease,leases[0]);
 let release;const upload=queuedUpload(new Request(origin+'/api/photos',{method:'POST',headers:{Origin:origin,'X-Photo-Upload-Lease':leases[0]}}),env,()=>new Promise(resolve=>release=()=>resolve(new Response('saved'))));
 while(!release)await new Promise(r=>setTimeout(r,1));assert.equal((await(await reserveUpload(reserve(students[0]),env)).json()).wait,true);release();assert.equal((await upload).status,200);
 assert.ok((await(await reserveUpload(reserve(students[20]),env)).json()).lease);
 await env.DB.prepare('UPDATE photo_upload_slots SET expires_at=0').bind().run();assert.ok((await(await reserveUpload(reserve({id:crypto.randomUUID(),token:crypto.randomUUID()}),env)).json()).lease);
 const expired=await queuedUpload(new Request(origin+'/api/photos',{method:'POST',headers:{Origin:origin,'X-Photo-Upload-Lease':leases[1]}}),env,()=>{throw Error('must not start');});assert.equal(expired.status,409);assert.equal((await expired.json()).renewLease,true);
});
test('같은 예약을 25번 겹쳐 사용해도 한 전송만 진입한다',async()=>{
 const env={DB:previewDatabase(':memory:')},data={id:crypto.randomUUID(),token:crypto.randomUUID(),photoBytes:1000},lease=(await(await reserveUpload(reserve(data),env)).json()).lease;
 let entered=0,release;const request=()=>new Request(origin+'/api/photos',{method:'POST',headers:{Origin:origin,'X-Photo-Upload-Lease':lease}});
 const first=queuedUpload(request(),env,()=>{entered++;return new Promise(resolve=>release=()=>resolve(new Response('saved')));});
 while(!release)await new Promise(r=>setTimeout(r,1));
 const duplicates=await Promise.all(Array.from({length:24},()=>queuedUpload(request(),env,()=>{entered++;return new Response('incorrect');})));
 assert.equal(entered,1);assert.ok(duplicates.every(r=>r.status===409));release();await first;
});
test('만료된 이전 전송의 finally가 새 전송의 자리를 반환하지 않는다',async()=>{
 const env={DB:previewDatabase(':memory:')},data={id:crypto.randomUUID(),token:crypto.randomUUID(),photoBytes:1000},lease=(await(await reserveUpload(reserve(data),env)).json()).lease;
 const request=()=>new Request(origin+'/api/photos',{method:'POST',headers:{Origin:origin,'X-Photo-Upload-Lease':lease}});let oldDone,newDone;
 const old=queuedUpload(request(),env,()=>new Promise(r=>oldDone=()=>r(new Response('old'))));while(!oldDone)await new Promise(r=>setTimeout(r,1));
 await env.DB.prepare('UPDATE photo_upload_slots SET expires_at=0 WHERE lease_key=?').bind(lease).run();
 assert.equal((await(await reserveUpload(reserve(data),env)).json()).lease,lease);
 const current=queuedUpload(request(),env,()=>new Promise(r=>newDone=()=>r(new Response('new'))));while(!newDone)await new Promise(r=>setTimeout(r,1));
 oldDone();await old;const row=(await env.DB.prepare('SELECT state,claim_id FROM photo_upload_slots WHERE lease_key=?').bind(lease).all()).results[0];assert.equal(row.state,'uploading');assert.ok(row.claim_id);newDone();await current;
});
test('10MiB 경계 사진은 전체 32MiB 예약 용량 안에서만 들어간다',async()=>{
 const env={DB:previewDatabase(':memory:')},leases=[];
 for(let i=0;i<4;i++){const r=await(await reserveUpload(reserve({id:crypto.randomUUID(),token:crypto.randomUUID(),photoBytes:10*1024*1024}),env)).json();leases.push(r);}
 assert.equal(leases.filter(x=>x.lease).length,3);assert.equal(leases[3].wait,true);
 const total=(await env.DB.prepare("SELECT SUM(declared_bytes) AS n FROM photo_upload_slots WHERE state='reserved'").bind().all()).results[0].n;assert.ok(total<=32*1024*1024);
});
