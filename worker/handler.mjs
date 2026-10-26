import {submitReflection,readReflections} from './submissions.mjs';
import {studentApi} from './student-api.mjs';
const encoder=new TextEncoder();
const SESSION='jeju_teacher', MAX_AGE=4*60*60;
function equal(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
const digest=async s=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(s)));
async function sign(value,secret){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(value)));}
function cookie(request){return request.headers.get('Cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith(SESSION+'='))?.slice(SESSION.length+1)||'';}
async function authorized(request,env){
  if(!env.TEACHER_SESSION_SECRET||!env.TEACHER_PASSWORD_HASH)return false;
  const parts=cookie(request).split('.');if(parts.length!==3||!/^\d+$/.test(parts[0])||!/^\w{32}$/.test(parts[1])||!/^[a-f0-9]{64}$/.test(parts[2]))return false;
  const expires=Number(parts[0]);if(expires<=Date.now()||expires>Date.now()+MAX_AGE*1000+60000)return false;
  return equal(parts[2],await sign(`${parts[0]}.${parts[1]}`,env.TEACHER_SESSION_SECRET+':'+env.TEACHER_PASSWORD_HASH));
}
function headers(type='text/html; charset=utf-8'){
  return {'Content-Type':type,'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"};
}
const redirect=(to,extra={})=>new Response(null,{status:303,headers:{...headers(),Location:to,...extra}});
function loginPage(message=''){
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>제주 2026 · 교사용 화면</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Malgun Gothic",sans-serif;background:#fbf8f2;color:#1b1b1a;margin:0;min-height:100vh;display:grid;place-items:center}main{width:min(400px,calc(100% - 56px));padding:32px;border:1px solid #d8d4ca;border-radius:16px;background:white}small{color:#be470e;font-weight:800}h1{font-size:26px;margin:16px 0}p{font-size:14px;line-height:1.8}label{display:block;font-size:13px;font-weight:700;margin-top:24px}input{width:100%;box-sizing:border-box;padding:13px;font:inherit;border:1px solid #bdb7ab;border-radius:8px;margin:7px 0 12px}button{width:100%;padding:14px;background:#1b1b1a;color:white;border:0;border-radius:9px;font:inherit;font-weight:700}a{color:#9e380c;font-size:13px}#error{color:#aa3108}</style></head><body><main><small>JEJU 2026 · 교사용</small><h1>느낀 점 모으기</h1><p>선생님께 전달된 교사용 비밀번호를 입력하세요.</p>${message?`<p id="error" role="alert">${message}</p>`:''}<form action="/teacher/login" method="post"><label for="password">교사용 비밀번호</label><input id="password" type="password" name="password" autocomplete="current-password" maxlength="128" required autofocus><button type="submit">교사용 화면 열기</button></form><p>교사용 비밀번호는 학생에게 공유하지 마세요. 공용 컴퓨터에서는 작업 후 화면을 잠가 주세요.</p><a href="https://cny2468-prog.github.io/jeju-trip-2026/">학생 안내로 돌아가기</a></main></body></html>`;
}
function photosRemoved(){return new Response(JSON.stringify({error:'사진 제출 기능은 종료되었습니다. 새로고침 후 소감문만 제출해 주세요.'}),{status:410,headers:headers('application/json; charset=utf-8')});}
const attempts=new Map();
export function createHandler(protectedAssets,publicText={},itineraries={}){
  return {async fetch(request,env={}){
    const url=new URL(request.url);let path;try{path=decodeURIComponent(url.pathname);}catch{return new Response('Not found',{status:404});}
    if(path.includes('\\')||path.includes('\0')||path.split('/').some(p=>p==='.'||p==='..'))return new Response('Not found',{status:404});
    const isTeacher=path==='/teacher'||path.startsWith('/teacher/');
    if(path==='/api/reflections')return studentApi(request,env,r=>submitReflection(r,env,itineraries));
    if(path==='/api/photo-upload-slot'||path==='/api/photos')return studentApi(request,env,()=>photosRemoved());
    if(!isTeacher){
      if(['/photo-upload.js','/photo-contest.js','/photo-contest.css'].includes(path))return new Response('Not found',{status:404});
      if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405});
      if(path.startsWith('/server/')||path.startsWith('/.openai/')||path.startsWith('/teacher-assets/'))return new Response('Not found',{status:404});
      const key=path==='/'?'/index.html':path;
      if(publicText[key])return new Response(request.method==='HEAD'?null:publicText[key].body,{headers:{'Content-Type':publicText[key].type,'Cache-Control':!key.endsWith('.html')&&/^\d+$/.test(url.searchParams.get('v')||'')?'public, max-age=31536000, immutable':'no-cache','X-Content-Type-Options':'nosniff'}});
      if(env.ASSETS?.fetch)return env.ASSETS.fetch(request);
      return new Response('Not found',{status:404});
    }
    if(request.method==='POST'){
      if(request.headers.get('Origin')!==url.origin||request.headers.get('Sec-Fetch-Site')==='cross-site')return new Response('Forbidden',{status:403,headers:headers()});
      if(path==='/teacher/logout')return redirect('/teacher',{'Set-Cookie':`${SESSION}=; Path=/teacher; HttpOnly; SameSite=Strict; Max-Age=0${url.protocol==='https:'?'; Secure':''}`,'Clear-Site-Data':'"cache"'});
      if(path==='/teacher/api/photos/select'){
        if(!await authorized(request,env))return new Response('Unauthorized',{status:401,headers:headers()});
        return photosRemoved();
      }
      if(path!=='/teacher/login')return new Response('Not found',{status:404,headers:headers()});
      if(!env.TEACHER_PASSWORD_HASH||!env.TEACHER_SESSION_SECRET)return new Response(loginPage('교사용 화면을 준비 중입니다. 잠시 후 다시 접속하세요.'),{status:503,headers:headers()});
      const ip=request.headers.get('CF-Connecting-IP')||'preview',now=Date.now();
      for(const [key,value]of attempts)if(value.until<now)attempts.delete(key);
      const count=attempts.get(ip);if(count?.n>=8&&count.until>now)return new Response(loginPage('잠시 기다린 후 다시 입력해 주세요.'),{status:429,headers:{...headers(),'Retry-After':'900'}});
      if(Number(request.headers.get('Content-Length')||0)>2048)return new Response('Too large',{status:413,headers:headers()});
      const raw=await request.text();if(raw.length>2048)return new Response('Too large',{status:413,headers:headers()});
      const password=new URLSearchParams(raw).get('password')||'';
      if(password.length>128||!equal(await digest(password),env.TEACHER_PASSWORD_HASH)){
        if(attempts.size<10000||attempts.has(ip))attempts.set(ip,{n:(count?.n||0)+1,until:now+15*60*1000});
        return new Response(loginPage('비밀번호가 올바르지 않습니다.'),{status:401,headers:headers()});
      }
      attempts.delete(ip);
      const nonce=hex(crypto.getRandomValues(new Uint8Array(16))),payload=`${now+MAX_AGE*1000}.${nonce}`,sig=await sign(payload,env.TEACHER_SESSION_SECRET+':'+env.TEACHER_PASSWORD_HASH);
      return redirect('/teacher',{'Set-Cookie':`${SESSION}=${payload}.${sig}; Path=/teacher; HttpOnly; SameSite=Strict; Max-Age=${MAX_AGE}${url.protocol==='https:'?'; Secure':''}`});
    }
    if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405,headers:headers()});
    if(!await authorized(request,env)){
      if(path==='/teacher'||path==='/teacher/'||path==='/teacher/login')return new Response(request.method==='HEAD'?null:loginPage(),{headers:headers()});
      return new Response('Unauthorized',{status:401,headers:headers('text/plain; charset=utf-8')});
    }
    if(path==='/teacher/login')return redirect('/teacher');
    if(path==='/teacher/session')return new Response(null,{status:204,headers:headers()});
    if(path==='/teacher/api/reflections')return readReflections(request,env);
    if(path==='/teacher/api/photos'||path.startsWith('/teacher/api/photos/')||path.startsWith('/teacher/photos/'))return photosRemoved();
    const asset=protectedAssets[path==='/teacher/'?'/teacher':path];
    if(!asset)return new Response('Not found',{status:404,headers:headers()});
    return new Response(request.method==='HEAD'?null:asset.body,{headers:headers(asset.type)});
  }};
}
