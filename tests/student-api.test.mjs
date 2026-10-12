import test from 'node:test';import assert from 'node:assert/strict';
import {studentApi} from '../worker/student-api.mjs';import {createHandler} from '../worker/handler.mjs';import {previewDatabase} from '../preview-db.mjs';
const backend='https://backend.test',origin='https://cny2468-prog.github.io';
test('GitHub Pages 사전 요청만 허용하고 교사 화면은 외부에 공개하지 않는다',async()=>{
 const handler=createHandler({});
 const options=(site,headers='content-type,x-photo-upload-lease')=>new Request(backend+'/api/photos',{method:'OPTIONS',headers:{Origin:site,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':headers}});
 const allowed=await handler.fetch(options(origin));assert.equal(allowed.status,204);assert.equal(allowed.headers.get('Access-Control-Allow-Origin'),origin);assert.equal(allowed.headers.get('Access-Control-Allow-Credentials'),null);
 assert.equal((await handler.fetch(options('https://other.github.io'))).status,403);assert.equal((await handler.fetch(options(origin,'authorization'))).status,403);
 const teacher=await handler.fetch(new Request(backend+'/teacher/session',{headers:{Origin:origin}}));assert.equal(teacher.status,401);assert.equal(teacher.headers.get('Access-Control-Allow-Origin'),null);
});
test('외부 제출 본문은 그대로 전달하고 서버 Origin 검증과 반별 저장을 유지한다',async()=>{
 const data={v:1,trip:'balgok-jeju-2026',no:'20699',name:'연결테스트학생',classNo:6,items:[{s:'peace',d:3,a:'연결 시험'}]},body=JSON.stringify({data,token:crypto.randomUUID()}),env={DB:previewDatabase(':memory:')},handler=createHandler({}, {},{6:[{id:'peace',title:'평화공원',group:3}]});
 const request=new Request(backend+'/api/reflections',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body});
 const response=await handler.fetch(request,env);assert.equal(response.status,200);assert.equal(response.headers.get('Access-Control-Allow-Origin'),origin);assert.equal((await response.json()).classNo,6);
 let reached=false;const denied=await studentApi(new Request(backend+'/api/photos',{method:'POST',headers:{Origin:'https://other.github.io'},body:'bad'}),{},()=>{reached=true;});assert.equal(denied.status,403);assert.equal(reached,false);
});
