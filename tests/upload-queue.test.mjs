import test from 'node:test';import assert from 'node:assert/strict';
import {reserveUpload,queuedUpload} from '../worker/upload-queue.mjs';import {previewDatabase} from '../preview-db.mjs';
const origin='https://test.local';
const reserve=data=>new Request(origin+'/api/photo-upload-slot',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});
test('공유 업로드 자리는 20개, 반과 무관하게 대기하고 완료·만료 시 다시 사용할 수 있다',async()=>{
 const env={DB:previewDatabase(':memory:')},students=Array.from({length:21},()=>({id:crypto.randomUUID(),token:crypto.randomUUID()})),leases=[];
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
