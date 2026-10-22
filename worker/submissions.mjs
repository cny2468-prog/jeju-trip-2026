import {submissionDatabase} from './d1-retry.mjs';
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff'}});
const classFromNo=no=>/^2\d{3,4}$/.test(no)&&Number(no.slice(-2))>0?Number(no.slice(1,-2)):0;
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
const database=env=>{if(!env.DB?.prepare)throw Error('제출 기능을 준비 중입니다. 잠시 후 다시 시도해 주세요.');return submissionDatabase(env.DB);};
export async function submitReflection(request,env,itineraries){
 const url=new URL(request.url);
 if(request.method!=='POST')return response({error:'제출 요청만 가능합니다.'},405);
 if(request.headers.get('Origin')!==url.origin)return response({error:'같은 안내 사이트에서 제출해 주세요.'},403);
 try{
  if(Number(request.headers.get('Content-Length')||0)>100000)return response({error:'내용이 너무 깁니다.'},413);
  const raw=await request.text();if(raw.length>90000)return response({error:'내용이 너무 깁니다.'},413);
  const {data,token,mode}=JSON.parse(raw),n=classFromNo(data?.no||'');
  if(mode!==undefined&&mode!=='spot')return response({error:'제출 방식을 확인해 주세요.'},400);
  if(!n||n>10||data.classNo!==n||data.trip!=='balgok-jeju-2026'||data.v!==1||typeof data.name!=='string'||!data.name.trim()||data.name.length>20||typeof token!=='string'||!/^[a-zA-Z0-9-]{32,80}$/.test(token))return response({error:'학번·이름·선택한 반을 확인해 주세요.'},400);
  if(!Array.isArray(data.items)||!data.items.length||data.items.length>20)return response({error:'느낀 점을 먼저 작성해 주세요.'},400);
  if(mode==='spot'&&data.items.length!==1)return response({error:'이 장소의 느낀 점 한 개만 제출해 주세요.'},400);
  const items=[],seen=new Set();
  for(const item of data.items){
   const stop=itineraries[n]?.find(s=>s.id===item.s&&s.group===item.d);
   if(!stop||seen.has(item.s)||typeof item.a!=='string'||!item.a.trim()||item.a.length>3000)return response({error:'해당 반의 장소와 느낀 점을 확인해 주세요.'},400);
   seen.add(item.s);items.push({s:stop.id,d:stop.group,t:stop.title,q:stop.question,a:item.a.trim(),u:typeof item.u==='string'?item.u.slice(0,40):''});
  }
  const now=new Date().toISOString(),payload={v:1,trip:data.trip,title:'2026 발곡고 2학년 제주 현장체험학습',no:data.no,name:data.name.trim(),classNo:n,savedAt:now,items};
  const photoOwner=(await database(env).prepare('SELECT token_hash FROM photo_owners WHERE class_no=? AND seat_no=?').bind(n,Number(data.no.slice(-2))).all()).results[0];
  if(photoOwner&&photoOwner.token_hash!==await hash(token))return response({error:'처음 사진을 제출한 기기에서 소감문을 제출해 주세요.'},409);
  // Merge inside the UPSERT so overlapping spot submissions cannot erase each other.
  const updatedPayload=mode==='spot'?`json_set(excluded.payload,'$.items',json((SELECT json_group_array(json(item)) FROM (SELECT value AS item FROM json_each(reflections.payload,'$.items') WHERE json_extract(value,'$.s') NOT IN (SELECT json_extract(value,'$.s') FROM json_each(excluded.payload,'$.items')) UNION ALL SELECT value AS item FROM json_each(excluded.payload,'$.items')))))`:'excluded.payload';
  const result=await database(env).prepare('INSERT INTO reflections (class_no,seat_no,student_no,payload,token_hash,submitted_at) VALUES (?,?,?,?,?,?) ON CONFLICT(class_no,seat_no) DO UPDATE SET student_no=excluded.student_no,payload='+updatedPayload+',submitted_at=excluded.submitted_at WHERE reflections.token_hash=excluded.token_hash').bind(n,Number(data.no.slice(-2)),data.no,JSON.stringify(payload),await hash(token),now).run();
  if(!result.meta.changes)return response({error:'이 학번은 다른 기기에서 이미 제출했습니다. 수정 제출이 필요하면 처음 제출한 기기를 사용하거나 선생님께 파일로 제출해 주세요.'},409);
  return response({classNo:n,submittedAt:now,message:mode==='spot'?`${items[0].t} 느낀 점을 2-${n}반으로 제출했습니다. 다른 장소의 제출 내용은 유지됩니다. 같은 기기에서 다시 제출하면 이 장소의 글이 수정됩니다.`:`2-${n}반으로 제출했습니다. 같은 기기에서 다시 제출하면 최신 글로 바뀝니다.`});
 }catch(error){console.error('Reflection submission failed:',error.message);return response({error:'제출하지 못했습니다. 작성한 글은 기기에 남아 있으니 잠시 후 다시 시도하거나 파일로 제출해 주세요.'},503);}
}
export async function readReflections(request,env){
 const n=Number(new URL(request.url).searchParams.get('class'));
 if(!Number.isInteger(n)||n<1||n>10)return response({error:'확인할 반을 선택해 주세요.'},400);
 try{const result=await database(env).prepare('SELECT payload,submitted_at FROM reflections WHERE class_no=? ORDER BY seat_no').bind(n).all();return response({classNo:n,students:result.results.map(row=>({...JSON.parse(row.payload),submittedAt:row.submitted_at}))});}
 catch(error){console.error('Reflection collection failed:',error.message);return response({error:'제출 현황을 불러오지 못했습니다. 다시 시도해 주세요.'},503);}
}
