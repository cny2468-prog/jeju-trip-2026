import {Zip,ZipPassThrough,strToU8} from 'fflate';
import {submissionDatabase} from './d1-retry.mjs';
const photoJson=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const photoHash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
const photoId=value=>typeof value==='string'&&/^[a-f0-9-]{36}$/.test(value);
function photoDb(env){if(!env.DB?.prepare)throw Error('사진 수집 기능을 준비 중입니다.');return submissionDatabase(env.DB);}
function photoBucket(env){if(!env.BUCKET?.put)throw Error('사진 저장 기능을 준비 중입니다.');return env.BUCKET;}
function photoType(b){if(b[0]===255&&b[1]===216&&b[2]===255)return ['image/jpeg','jpg'];if([137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v))return ['image/png','png'];if(new TextDecoder().decode(b.slice(0,4))==='RIFF'&&new TextDecoder().decode(b.slice(8,12))==='WEBP')return ['image/webp','webp'];return null;}
export function createPhotoRoutes(){return {
 async submit(request,env,itineraries){
  if(request.method!=='POST')return photoJson({error:'사진은 제출 버튼으로 올려 주세요.'},405);
  if(request.headers.get('Origin')!==new URL(request.url).origin)return photoJson({error:'같은 사이트에서 제출해 주세요.'},403);
  try{
   if(Number(request.headers.get('Content-Length')||0)>11*1024*1024)return photoJson({error:'사진 용량이 너무 큽니다. 한 장은 압축 후 10MB 이하로 제출하세요.'},413);
   const form=await request.formData(),file=form.get('photo');let data;try{data=JSON.parse(form.get('data')||'');}catch{return photoJson({error:'사진 정보를 확인해 주세요.'},400);}
   const n=/^2\d{3,4}$/.test(data.no||'')?Number(data.no.slice(1,-2)):0,seat=Number(data.no?.slice(-2));
   if(n<1||n>10||!seat||n!==data.classNo||typeof data.name!=='string'||!data.name.trim()||data.name.length>20||typeof data.token!=='string'||!/^[a-zA-Z0-9-]{32,80}$/.test(data.token)||!photoId(data.id))return photoJson({error:'학번·학생 이름·선택한 반을 확인해 주세요.'},400);
   const spot=itineraries[n]?.find(s=>s.id===data.spotId);if(!spot)return photoJson({error:'이 반 일정의 장소를 선택해 주세요.'},400);
   if(typeof data.title!=='string'||!data.title.trim()||data.title.length>60||typeof data.caption!=='string'||data.caption.length>500)return photoJson({error:'사진 제목은 1~60자, 설명은 500자 이내로 적어 주세요.'},400);
   if(!file||typeof file.arrayBuffer!=='function'||!file.size)return photoJson({error:'사진 파일을 선택하세요.'},400);
   if(file.size>10*1024*1024)return photoJson({error:'사진 용량이 너무 큽니다. 압축 후에도 10MB를 초과하면 사진 크기를 줄여 다시 제출하세요.'},413);
   const header=new Uint8Array(await file.slice(0,12).arrayBuffer()),type=photoType(header);if(!type||file.type!==type[0])return photoJson({error:'JPEG·PNG·WebP 사진만 제출할 수 있습니다.'},415);
   const db=photoDb(env),bucket=photoBucket(env),tokenHash=await photoHash(data.token);
   const reflection=await db.prepare('SELECT token_hash FROM reflections WHERE class_no=? AND seat_no=?').bind(n,seat).all();
   if(reflection.results[0]&&reflection.results[0].token_hash!==tokenHash)return photoJson({error:'처음 제출한 기기에서 사진을 제출해 주세요.'},409);
   const owner=await db.prepare('INSERT INTO photo_owners (class_no,seat_no,token_hash) VALUES (?,?,?) ON CONFLICT(class_no,seat_no) DO UPDATE SET token_hash=photo_owners.token_hash WHERE photo_owners.token_hash=excluded.token_hash').bind(n,seat,tokenHash).run();
   if(!owner.meta.changes)return photoJson({error:'이 학번은 다른 기기에서 제출했습니다. 처음 제출한 기기를 사용하세요.'},409);
   const previous=(await db.prepare('SELECT token_hash,object_key FROM contest_photos WHERE id=?').bind(data.id).all()).results[0];
   if(previous&&previous.token_hash!==tokenHash)return photoJson({error:'본인의 사진만 수정할 수 있습니다.'},403);
   const count=(await db.prepare('SELECT COUNT(*) AS n FROM contest_photos WHERE class_no=? AND seat_no=? AND spot_id=? AND id<>?').bind(n,seat,spot.id,data.id).all()).results[0].n;
   if(count>=10)return photoJson({error:'한 장소에서 학생 1명당 사진 10장까지 제출할 수 있습니다.'},409);
   const key=`contest/2-${n}/${spot.id}/${data.id}.${type[1]}`,now=new Date().toISOString();
   await bucket.put(key,file,{httpMetadata:{contentType:type[0]}});
   try{await db.prepare('INSERT INTO contest_photos (id,class_no,seat_no,student_no,student_name,spot_id,spot_title,title,caption,object_key,mime,bytes,token_hash,submitted_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,caption=excluded.caption,object_key=excluded.object_key,mime=excluded.mime,bytes=excluded.bytes,submitted_at=excluded.submitted_at WHERE contest_photos.token_hash=excluded.token_hash').bind(data.id,n,seat,data.no,data.name.trim(),spot.id,spot.title,data.title.trim(),data.caption.trim(),key,type[0],file.size,tokenHash,now).run();}
   catch(error){if(!previous)await bucket.delete(key);throw error;}
   if(previous&&previous.object_key!==key)await bucket.delete(previous.object_key);
   return photoJson({id:data.id,classNo:n,spotId:spot.id,message:`${spot.title} · 2-${n}반 사진으로 제출했습니다.`});
  }catch(error){console.error('Photo submission failed:',error.message);return photoJson({error:'사진을 제출하지 못했습니다. 선택한 사진을 유지한 채 잠시 후 다시 시도해 주세요.'},503);}
 },
 async list(request,env){
  const url=new URL(request.url),spot=url.searchParams.get('spot'),classValue=url.searchParams.get('class')||'all',n=Number(classValue),cursor=Number(url.searchParams.get('cursor')||0);
  if(!spot||!/^[a-z0-9-]{1,40}$/.test(spot)||(classValue!=='all'&&(!Number.isInteger(n)||n<1||n>10))||!Number.isSafeInteger(cursor)||cursor<0)return photoJson({error:'장소와 반을 선택하세요.'},400);
  try{
   photoBucket(env);const where=' WHERE 1=1'+(spot==='all'?'':' AND spot_id=?')+(classValue==='all'?'':' AND class_no=?'),values=[...(spot==='all'?[]:[spot]),...(classValue==='all'?[]:[n])],db=photoDb(env);
   const counts=(await db.prepare('SELECT COUNT(*) AS total,COALESCE(SUM(selected),0) AS selectedCount FROM contest_photos'+where).bind(...values).all()).results[0];
   const rows=(await db.prepare('SELECT rowid AS cursorRow,id,class_no AS classNo,student_no AS no,student_name AS name,spot_id AS spotId,spot_title AS spotTitle,title,caption,mime,bytes,submitted_at AS submittedAt,selected FROM contest_photos'+where+' AND rowid>? ORDER BY rowid LIMIT 201').bind(...values,cursor).all()).results;
   const photos=rows.slice(0,200),nextCursor=rows.length>200?photos.at(-1).cursorRow:null;
   return photoJson({photos,total:counts.total,selectedCount:counts.selectedCount,nextCursor});
  }catch(error){console.error('Photo collection failed:',error.message);return photoJson({error:'사진을 불러오지 못했습니다. 다시 시도해 주세요.'},503);}
 },
 async image(request,env,id){
  if(!photoId(id))return photoJson({error:'사진이 없습니다.'},404);
  try{const row=(await photoDb(env).prepare('SELECT object_key,mime FROM contest_photos WHERE id=?').bind(id).all()).results[0];if(!row)return photoJson({error:'사진이 없습니다.'},404);const object=await photoBucket(env).get(row.object_key);if(!object)return photoJson({error:'사진이 없습니다.'},404);return new Response(object.body,{headers:{'Content-Type':row.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Disposition':new URL(request.url).searchParams.has('download')?`attachment; filename="contest-${id}.${row.mime==='image/jpeg'?'jpg':row.mime==='image/png'?'png':'webp'}"`:'inline'}});}
  catch(error){console.error('Photo image failed:',error.message);return photoJson({error:'사진을 열지 못했습니다.'},503);}
 },
 async select(request,env){
  try{const raw=await request.text();if(raw.length>500)return photoJson({error:'잘못된 요청입니다.'},400);const {id,selected}=JSON.parse(raw);if(!photoId(id)||typeof selected!=='boolean')return photoJson({error:'사진을 선택하세요.'},400);const result=await photoDb(env).prepare('UPDATE contest_photos SET selected=? WHERE id=?').bind(selected?1:0,id).run();return photoJson({selected},result.meta.changes?200:404);}
  catch(error){console.error('Contest selection failed:',error.message);return photoJson({error:'후보 표시를 저장하지 못했습니다.'},503);}
 },
 async archive(request,env){
  const url=new URL(request.url),spot=url.searchParams.get('spot'),classValue=url.searchParams.get('class')||'all',n=Number(classValue),candidates=url.searchParams.get('selected')==='1';
  if(!spot||!/^[a-z0-9-]{1,40}$/.test(spot)||(classValue!=='all'&&(!Number.isInteger(n)||n<1||n>10)))return photoJson({error:'장소와 반을 선택하세요.'},400);
  try{
   const query='SELECT * FROM contest_photos WHERE 1=1'+(spot==='all'?'':' AND spot_id=?')+(classValue==='all'?'':' AND class_no=?')+(candidates?' AND selected=1':'')+' ORDER BY spot_id,class_no,seat_no,submitted_at LIMIT 1001';
   const countQuery='SELECT COUNT(*) AS n FROM contest_photos WHERE 1=1'+(spot==='all'?'':' AND spot_id=?')+(classValue==='all'?'':' AND class_no=?')+(candidates?' AND selected=1':'');
   const count=(await photoDb(env).prepare(countQuery).bind(...(spot==='all'?[]:[spot]),...(classValue==='all'?[]:[n])).all()).results[0].n;
   if(count>1000)return photoJson({error:'사진이 많습니다. 장소와 반을 선택해 1,000장 이하로 나누어 내려받으세요.'},413);
   const photos=(await photoDb(env).prepare(query).bind(...(spot==='all'?[]:[spot]),...(classValue==='all'?[]:[n])).all()).results;if(!photos.length)return photoJson({error:'내려받을 사진이 없습니다.'},404);
   if(photos.length>1000)return photoJson({error:'사진이 추가되었습니다. 장소와 반을 선택해 1,000장 이하로 나누어 내려받으세요.'},413);
   const bucket=photoBucket(env);let cancelled=false,wake;
   const stream=new ReadableStream({start(controller){
    const zip=new Zip((error,chunk,final)=>{if(cancelled)return;if(error){controller.error(error);cancelled=true;return;}controller.enqueue(chunk);if(final)controller.close();});
    void(async()=>{try{
     for(const photo of photos){if(cancelled)return;const object=await bucket.get(photo.object_key);if(!object)throw Error('Photo object unavailable');const extension=photo.mime==='image/jpeg'?'jpg':photo.mime==='image/png'?'png':'webp';const entry=new ZipPassThrough(`${photo.spot_title.replace(/[\\/:*?"<>|]/g,'_')}/2-${photo.class_no}반/작품-${photo.id}.${extension}`);zip.add(entry);const reader=object.body.getReader();while(true){const part=await reader.read();if(cancelled){await reader.cancel();return;}if(part.done)break;entry.push(part.value,false);if(controller.desiredSize<=0&&!cancelled)await new Promise(resolve=>wake=resolve);}entry.push(new Uint8Array(),true);}
     const cell=value=>{let text=String(value??'');if(/^[\s]*[=+@-]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
     const rows=[['작품번호','장소','반','학번','학생 이름','제목','설명','콘테스트 후보','제출 시각'],...photos.map(p=>[p.id,p.spot_title,`2-${p.class_no}`,p.student_no,p.student_name,p.title,p.caption,p.selected?'후보':'',p.submitted_at])];
     const manifest=new ZipPassThrough('작품목록.csv');zip.add(manifest);manifest.push(strToU8('\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n')),true);zip.end();
    }catch(error){console.error('Photo ZIP failed:',error.message);if(!cancelled){cancelled=true;controller.error(error);}}})();
   },pull(){if(wake){wake();wake=null;}},cancel(){cancelled=true;if(wake){wake();wake=null;}}});
   return new Response(stream,{headers:{'Content-Type':'application/zip','Content-Disposition':`attachment; filename="jeju-photo-${spot}-${classValue}${candidates?'-candidates':''}.zip"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  }catch(error){console.error('Photo ZIP preparation failed:',error.message);return photoJson({error:'사진 ZIP을 준비하지 못했습니다. 다시 시도해 주세요.'},503);}
 }
};}
