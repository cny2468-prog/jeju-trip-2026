import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createHandler} from '../worker/handler.mjs';
const origin='https://test.local',password='local-only-retirement-check';
const env={TEACHER_PASSWORD_HASH:createHash('sha256').update(password).digest('hex'),TEACHER_SESSION_SECRET:'local-only-test-session-secret',get DB(){throw Error('Photo retirement must not access DB');},get BUCKET(){throw Error('Photo retirement must not access storage');}};
test('stale student photo clients receive a clear retirement response without writing data',async()=>{
 const worker=createHandler({});
 for(const path of ['/api/photos','/api/photo-upload-slot']){
  const res=await worker.fetch(new Request(origin+path,{method:'POST',headers:{Origin:'https://cny2468-prog.github.io'},body:'old upload'}),env);
  assert.equal(res.status,410);assert.equal(res.headers.get('Access-Control-Allow-Origin'),'https://cny2468-prog.github.io');assert.match((await res.json()).error,/소감문만 제출/);
 }
 for(const path of ['/photo-upload.js','/photo-contest.js','/photo-contest.css'])assert.equal((await worker.fetch(new Request(origin+path),env)).status,404);
});
test('retired teacher photo routes cannot read, export or change photo records',async()=>{
 const worker=createHandler({});
 const login=await worker.fetch(new Request(origin+'/teacher/login',{method:'POST',headers:{Origin:origin},body:new URLSearchParams({password})}),env);
 assert.equal(login.status,303);const cookie=login.headers.get('Set-Cookie').split(';')[0];
 for(const path of ['/teacher/api/photos','/teacher/api/photos/archive','/teacher/api/photos/archive-plan','/teacher/photos/old-id']){
  const res=await worker.fetch(new Request(origin+path,{headers:{Cookie:cookie}}),env);assert.equal(res.status,410);
 }
 const selection=await worker.fetch(new Request(origin+'/teacher/api/photos/select',{method:'POST',headers:{Cookie:cookie,Origin:origin},body:'old selection'}),env);assert.equal(selection.status,410);
 assert.equal((await worker.fetch(new Request(origin+'/teacher/assets/photos.js',{headers:{Cookie:cookie}}),env)).status,404);
});
