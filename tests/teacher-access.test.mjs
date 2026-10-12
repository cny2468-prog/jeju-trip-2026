import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {createHandler} from '../worker/handler.mjs';
const password='preview-only-test-secret';
const env={TEACHER_PASSWORD_HASH:createHash('sha256').update(password).digest('hex'),TEACHER_SESSION_SECRET:'test-session-secret-must-never-be-used-in-production'};
const worker=createHandler({'/teacher':{body:'teacher collection screen',type:'text/html'},'/teacher/assets/reflections.js':{body:'protected collection code',type:'text/javascript'}},{'/index.html':{body:'public student screen',type:'text/html'}});
const origin='https://preview.test';
const request=(path,options={})=>new Request(origin+path,options);
test('student page is public; teacher collection and scripts require server authentication',async()=>{
  assert.equal(await(await worker.fetch(request('/'),env)).text(),'public student screen');
  const login=await worker.fetch(request('/teacher'),env);assert((await login.text()).includes('type="password"'));
  for(const path of ['/teacher/assets/reflections.js','/teacher/session'])assert.equal((await worker.fetch(request(path),env)).status,401);
  assert.equal((await worker.fetch(request('/teacher-assets/reflections.js'),env)).status,404);
});
test('wrong password, cross-origin requests, and forged cookies fail; correct password opens protected routes',async()=>{
  const options=value=>({method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password:value})});
  assert.equal((await worker.fetch(request('/teacher/login',options('wrong')),env)).status,401);
  assert.equal((await worker.fetch(request('/teacher/login',{...options(password),headers:{Origin:'https://other.test'}}),env)).status,403);
  const response=await worker.fetch(request('/teacher/login',options(password)),env);assert.equal(response.status,303);
  const cookie=response.headers.get('Set-Cookie');assert(cookie.includes('HttpOnly'));assert(cookie.includes('Secure'));assert(cookie.includes('SameSite=Strict'));
  const authed={headers:{Cookie:cookie.split(';')[0]}};
  assert.equal(await(await worker.fetch(request('/teacher',authed),env)).text(),'teacher collection screen');
  assert.equal((await worker.fetch(request('/teacher/assets/reflections.js',authed),env)).status,200);
  assert.equal((await worker.fetch(request('/teacher/session',authed),env)).status,204);
  assert.equal((await worker.fetch(request('/teacher/assets/reflections.js',{headers:{Cookie:cookie.split(';')[0]+'bad'}}),env)).status,401);
  assert.equal((await worker.fetch(request('/teacher/assets/reflections.js',authed),{...env,TEACHER_PASSWORD_HASH:'rotated'})).status,401);
  const logout=await worker.fetch(request('/teacher/logout',{method:'POST',headers:{...authed.headers,Origin:origin}}),env);assert.equal(logout.status,303);assert(logout.headers.get('Set-Cookie').includes('Max-Age=0'));
});
test('unconfigured and expired sessions cannot disclose the teacher assets',async()=>{
  assert.equal((await worker.fetch(request('/teacher/assets/reflections.js'),{})).status,401);
  const expired=`jeju_teacher=${Date.now()-1000}.${'a'.repeat(32)}.${'0'.repeat(64)}`;
  assert.equal((await worker.fetch(request('/teacher/assets/reflections.js',{headers:{Cookie:expired}}),env)).status,401);
});
