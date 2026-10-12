import {submissionDatabase} from './d1-retry.mjs';
const MB=1024*1024,MAX_ENVELOPE=11*MB,ACTIVE_BYTES=32*MB,caches=new WeakMap();
const cacheFor=db=>{if(!caches.has(db))caches.set(db,{fullUntil:0,reserved:new Map()});return caches.get(db);};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...(data.wait?{'Retry-After':'5'}:{})}});
const wait=()=>json({wait:true,retryAfterMs:5000});
export const uploadKey=async(id,token,no='',classNo='')=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id+':'+token+(no?':'+no+':'+classNo:'')))),v=>v.toString(16).padStart(2,'0')).join('');
export async function reserveUpload(request,env){
 if(request.method!=='POST'||request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'같은 안내 사이트에서 제출하세요.'},403);
 try{
  if(Number(request.headers.get('Content-Length')||0)>500)return json({error:'요청이 너무 큽니다.'},413);
  const raw=await request.text();if(raw.length>500)return json({error:'요청이 너무 큽니다.'},413);
  let data;try{data=JSON.parse(raw);}catch{return json({error:'사진 제출 정보를 확인하세요.'},400);}
  const {id,token,no,classNo,photoBytes,thumbnailBytes=0}=data;
  if(typeof id!=='string'||!/^[a-f0-9-]{36}$/.test(id)||typeof token!=='string'||!/^[a-zA-Z0-9-]{32,80}$/.test(token))return json({error:'사진 제출 정보를 확인하세요.'},400);
  if(no!==undefined&&(typeof no!=='string'||!/^2\d{3,4}$/.test(no)||Number(no.slice(1,-2))!==classNo||!Number(no.slice(-2))||classNo<1||classNo>10))return json({error:'학번과 반을 확인하세요.'},400);
  if(photoBytes!==undefined&&(!Number.isSafeInteger(photoBytes)||photoBytes<=0||photoBytes>10*MB||!Number.isSafeInteger(thumbnailBytes)||thumbnailBytes<0||thumbnailBytes>256*1024))return json({error:'사진 용량이 너무 큽니다.'},413);
  const db=submissionDatabase(env.DB),key=await uploadKey(id,token,no,classNo),now=Date.now(),bytes=photoBytes===undefined?MAX_ENVELOPE:photoBytes+thumbnailBytes+4096;
  const cache=cacheFor(env.DB);for(const [held,expiry]of cache.reserved)if(expiry<=now)cache.reserved.delete(held);
  if((cache.reserved.get(key)||0)>now)return json({lease:key});
  if(cache.fullUntil>now)return wait();
  // Repeated reservations and the shared byte budget are checked atomically.
  const result=await db.prepare("UPDATE photo_upload_slots SET lease_key=?,claim_id=NULL,declared_bytes=?,state='reserved',expires_at=? WHERE slot_no=COALESCE((SELECT slot_no FROM photo_upload_slots WHERE lease_key=? AND state='reserved' AND expires_at>? LIMIT 1),(SELECT slot_no FROM photo_upload_slots WHERE expires_at<? ORDER BY expires_at LIMIT 1)) AND NOT EXISTS(SELECT 1 FROM photo_upload_slots WHERE lease_key=? AND state='uploading' AND expires_at>=?) AND (SELECT COALESCE(SUM(declared_bytes),0) FROM photo_upload_slots WHERE expires_at>=? AND lease_key<>?)+?<=? RETURNING slot_no").bind(key,bytes,now+30000,key,now,now,key,now,now,key,bytes,ACTIVE_BYTES).all();
  if(!result.results.length){cache.fullUntil=now+1000;return wait();}
  cache.reserved.set(key,now+30000);
  return json({lease:key});
 }catch(error){console.error('Upload reservation failed:',error.message);return json({error:'제출 순서를 확인하고 있습니다. 잠시 후 다시 시도하세요.'},503);}
}
export async function queuedUpload(request,env,submit){
 if(request.method!=='POST'||request.headers.get('Origin')!==new URL(request.url).origin)return submit(request);
 let lease=request.headers.get('X-Photo-Upload-Lease');
 if(!lease){
  const origin=new URL(request.url).origin,reserved=await reserveUpload(new Request(origin+'/api/photo-upload-slot',{method:'POST',headers:{Origin:origin},body:JSON.stringify({id:crypto.randomUUID(),token:crypto.randomUUID()})}),env),result=await reserved.json();
  if(!reserved.ok)return json(result,reserved.status);
  if(!result.lease)return new Response(JSON.stringify({error:'사진 제출이 몰려 잠시 기다리고 있습니다. 잠시 후 다시 제출하세요.'}),{status:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Retry-After':'5'}});
  lease=result.lease;
 }
 if(!/^[a-f0-9]{64}$/.test(lease))return json({error:'사진 제출 순서를 다시 확인하세요.'},409);
 const db=submissionDatabase(env.DB),claim=crypto.randomUUID();let claimed=false,timer;
 try{
  const now=Date.now();
  // Retrying the same DB operation keeps its claim ID; a second HTTP call cannot reuse it.
  const result=await db.prepare("UPDATE photo_upload_slots SET state='uploading',claim_id=?,expires_at=? WHERE lease_key=? AND expires_at>? AND (state='reserved' OR (state='uploading' AND claim_id=?)) RETURNING declared_bytes").bind(claim,now+120000,lease,now,claim).all();
  if(!result.results.length)return json({error:'사진 제출 순서를 다시 확인하고 있습니다.',renewLease:true},409);
  claimed=true;
  cacheFor(env.DB).reserved.delete(lease);
  timer=setInterval(()=>{void db.prepare("UPDATE photo_upload_slots SET expires_at=? WHERE lease_key=? AND claim_id=? AND state='uploading'").bind(Date.now()+120000,lease,claim).run().catch(()=>console.warn('Upload slot heartbeat deferred'));},30000);
  const headers=new Headers(request.headers);headers.set('X-Guide-Upload-Limit',String(result.results[0].declared_bytes));
  return await submit(new Request(request,{headers}));
 }catch(error){console.error('Upload queue failed:',error.message);return json({error:'사진 제출 연결을 다시 확인하고 있습니다.'},503);}
 finally{
  clearInterval(timer);
  if(claimed)try{await db.prepare("UPDATE photo_upload_slots SET lease_key=NULL,claim_id=NULL,state='idle',expires_at=0 WHERE lease_key=? AND claim_id=?").bind(lease,claim).run();cacheFor(env.DB).fullUntil=0;}catch{console.warn('Upload slot release deferred until expiry');}
 }
}

