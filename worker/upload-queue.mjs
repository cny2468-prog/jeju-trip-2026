import {submissionDatabase} from './d1-retry.mjs';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const keyFor=async(id,token)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id+':'+token))),v=>v.toString(16).padStart(2,'0')).join('');
export async function reserveUpload(request,env){
 if(request.method!=='POST'||request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'같은 안내 사이트에서 제출하세요.'},403);
 try{
  if(Number(request.headers.get('Content-Length')||0)>500)return json({error:'요청이 너무 큽니다.'},413);
  const raw=await request.text();if(raw.length>500)return json({error:'요청이 너무 큽니다.'},413);
  const {id,token}=JSON.parse(raw);
  if(typeof id!=='string'||!/^[a-f0-9-]{36}$/.test(id)||typeof token!=='string'||!/^[a-zA-Z0-9-]{32,80}$/.test(token))return json({error:'사진 제출 정보를 확인하세요.'},400);
  const db=submissionDatabase(env.DB),key=await keyFor(id,token),now=Date.now();
  const own=(await db.prepare('SELECT state FROM photo_upload_slots WHERE lease_key=? AND expires_at>?').bind(key,now).all()).results[0];
  if(own)return json(own.state==='reserved'?{lease:key}:{wait:true});
  const result=await db.prepare("UPDATE photo_upload_slots SET lease_key=?,state='reserved',expires_at=? WHERE slot_no=(SELECT slot_no FROM photo_upload_slots WHERE expires_at<? ORDER BY expires_at LIMIT 1) AND NOT EXISTS(SELECT 1 FROM photo_upload_slots WHERE lease_key=? AND expires_at>=?) RETURNING slot_no").bind(key,now+30000,now,key,now).all();
  return json(result.results.length?{lease:key}:{wait:true});
 }catch(error){console.error('Upload reservation failed:',error.message);return json({error:'제출 순서를 확인하고 있습니다. 잠시 후 다시 시도하세요.'},503);}
}
export async function queuedUpload(request,env,submit){
 if(request.method!=='POST'||request.headers.get('Origin')!==new URL(request.url).origin)return submit();
 let lease=request.headers.get('X-Photo-Upload-Lease');
 // Previously opened guide tabs also share the same global 20-slot limit.
 if(!lease){
  const origin=new URL(request.url).origin;
  const reserved=await reserveUpload(new Request(origin+'/api/photo-upload-slot',{method:'POST',headers:{Origin:origin},body:JSON.stringify({id:crypto.randomUUID(),token:crypto.randomUUID()})}),env);
  const result=await reserved.json();if(!reserved.ok)return json(result,reserved.status);
  if(!result.lease)return new Response(JSON.stringify({error:'사진 제출이 몰려 잠시 기다리고 있습니다. 잠시 후 다시 제출하세요.'}),{status:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Retry-After':'3'}});
  lease=result.lease;
 }
 if(!/^[a-f0-9]{64}$/.test(lease))return json({error:'사진 제출 순서를 다시 확인하세요.'},409);
 const db=submissionDatabase(env.DB);let claimed=false;
 try{
  const now=Date.now(),result=await db.prepare("UPDATE photo_upload_slots SET state='uploading',expires_at=? WHERE lease_key=? AND expires_at>?").bind(now+120000,lease,now).run();
  if(!result.meta.changes)return json({error:'사진 제출 순서가 만료되었습니다.',renewLease:true},409);
  claimed=true;return await submit();
 }catch(error){console.error('Upload queue failed:',error.message);return json({error:'사진 제출 연결을 다시 확인하고 있습니다.'},503);}
 finally{if(claimed)try{await db.prepare("UPDATE photo_upload_slots SET lease_key=NULL,state='idle',expires_at=0 WHERE lease_key=?").bind(lease).run();}catch{console.warn('Upload slot release deferred until expiry');}}
}
