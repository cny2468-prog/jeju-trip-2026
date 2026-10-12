import test from 'node:test';import assert from 'node:assert/strict';import {previewDatabase} from '../preview-db.mjs';import {photoRoutes} from '../worker/photos.mjs';
const png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXtUAAAAASUVORK5CYII=','base64'));
test('많은 사진은 200장씩 나누며 반·장소 필터와 전체 수를 유지',async()=>{
 const objects=new Map(),env={DB:previewDatabase(':memory:'),BUCKET:{async put(key,data){objects.set(key,data);},async get(key){return {body:objects.get(key).stream()};},async delete(key){objects.delete(key);}}},routes={5:[{id:'peace',title:'제주 4·3평화공원'}]};
 for(let i=0;i<205;i++){
  const form=new FormData();form.append('photo',new Blob([png],{type:'image/png'}),'test.png');form.append('data',JSON.stringify({id:crypto.randomUUID(),classNo:5,no:'205'+String(Math.floor(i/10)+1).padStart(2,'0'),name:'페이지검증',token:'a'.repeat(32),spotId:'peace',title:'검증사진',caption:''}));
  assert.equal((await photoRoutes.submit(new Request('https://test.local/api/photos',{method:'POST',headers:{Origin:'https://test.local'},body:form}),env,routes)).status,200);
 }
 const list=async query=>(await(await photoRoutes.list(new Request('https://test.local/teacher/api/photos?'+query),env)).json());
 const first=await list('spot=all&class=all');assert.equal(first.total,205);assert.equal(first.photos.length,200);assert.equal(first.selectedCount,0);assert.ok(first.nextCursor>0);
 const next=await list('spot=all&class=all&cursor='+first.nextCursor);assert.equal(next.photos.length,5);assert.equal(next.nextCursor,null);assert.equal(new Set([...first.photos,...next.photos].map(p=>p.id)).size,205);
 assert.equal((await list('spot=peace&class=7')).total,0);assert.equal((await list('spot=peace&class=5')).total,205);
 for(let i=205;i<1001;i++)await env.DB.prepare('INSERT INTO contest_photos SELECT ?,class_no,seat_no,student_no,student_name,spot_id,spot_title,title,caption,object_key,mime,bytes,token_hash,submitted_at,selected,thumbnail_key,thumbnail_bytes FROM contest_photos WHERE id=?').bind(crypto.randomUUID(),first.photos[0].id).run();
 const archive=await photoRoutes.archive(new Request('https://test.local/teacher/api/photos/archive?spot=all&class=all'),env);assert.equal(archive.status,413);assert.match((await archive.json()).error,/1,000장 이하/);
});
