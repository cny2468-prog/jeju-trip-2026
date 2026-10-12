import test from 'node:test';import assert from 'node:assert/strict';import {unzipSync,strFromU8} from 'fflate';
import {previewDatabase} from '../preview-db.mjs';import {photoRoutes} from '../worker/photos.mjs';import {createHandler} from '../worker/handler.mjs';
const png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXtUAAAAASUVORK5CYII=','base64'));
const itineraries={5:[{id:'peace',title:'제주 4·3평화공원'}],7:[{id:'peace',title:'제주 4·3평화공원'}]};
test('전체 장소 보기에서도 장소·반 필터와 ZIP 폴더를 유지한다',async()=>{
 const env=environment(),routes={5:[...itineraries[5],{id:'osulloc',title:'오설록 티뮤지엄'}],7:itineraries[7]};
 for(const item of [submission(),submission(5,{spotId:'osulloc'}),submission(7)])assert.equal((await photoRoutes.submit(item.request,env,routes)).status,200);
 const list=async(q)=>(await(await photoRoutes.list(new Request('https://test.local/teacher/api/photos?'+q),env)).json()).photos;
 assert.equal((await list('spot=all&class=all')).length,3);
 const own=await list('spot=all&class=5');assert.equal(own.length,2);assert.ok(own.every(p=>p.classNo===5));assert.equal(new Set(own.map(p=>p.spotId)).size,2);
 assert.equal((await list('spot=peace&class=all')).length,2);
 const archive=await photoRoutes.archive(new Request('https://test.local/teacher/api/photos/archive?spot=all&class=all'),env);
 assert.equal(archive.status,200);const entries=unzipSync(new Uint8Array(await archive.arrayBuffer()));assert.equal(Object.keys(entries).length,4);assert.ok(Object.keys(entries).some(p=>p.includes('오설록 티뮤지엄/2-5반/')));
});
function environment(){const objects=new Map();return {DB:previewDatabase(':memory:'),BUCKET:{async put(key,data){objects.set(key,data);},async get(key){const value=objects.get(key);return value?{body:new Blob([value]).stream()}:null;},async delete(key){objects.delete(key);}},objects};}
function submission(n=5,extra={},bytes=png,type='image/png'){
 const data={id:crypto.randomUUID(),no:`2${String(n).padStart(2,'0')}01`,name:'사진테스트학생',classNo:n,token:'a'.repeat(32),spotId:'peace',title:'제주에서 기억한 순간',caption:'사진 설명',...extra},form=new FormData();form.append('data',JSON.stringify(data));form.append('photo',new Blob([bytes],{type}),'test.png');return {data,request:new Request('https://test.local/api/photos',{method:'POST',headers:{Origin:'https://test.local'},body:form})};
}
test('사진은 장소·반으로 분리, 재시도 중복 방지, 후보 저장과 ZIP 원본·목록 수합',async()=>{
 const env=environment(),a=submission(),b=submission(7);assert.equal((await photoRoutes.submit(a.request,env,itineraries)).status,200);assert.equal((await photoRoutes.submit(b.request,env,itineraries)).status,200);
 const retry=submission(5,{id:a.data.id,title:'수정 제목'});assert.equal((await photoRoutes.submit(retry.request,env,itineraries)).status,200);
 const list=await(await photoRoutes.list(new Request('https://test.local/teacher/api/photos?spot=peace&class=5'),env)).json();assert.equal(list.photos.length,1);assert.equal(list.photos[0].title,'수정 제목');assert.equal(list.photos[0].classNo,5);
 const selection=new Request('https://test.local/teacher/api/photos/select',{method:'POST',body:JSON.stringify({id:a.data.id,selected:true})});assert.equal((await photoRoutes.select(selection,env)).status,200);
 const archive=await photoRoutes.archive(new Request('https://test.local/teacher/api/photos/archive?spot=peace&class=all&selected=1'),env);assert.equal(archive.status,200);const entries=unzipSync(new Uint8Array(await archive.arrayBuffer()));const names=Object.keys(entries);assert.equal(names.length,2);assert.ok(names.some(name=>name.includes('2-5반/')));assert.ok(!names.some(name=>name.includes('2-7반/')));assert.ok(strFromU8(entries['작품목록.csv']).includes('수정 제목'));
 const image=await photoRoutes.image(new Request('https://test.local/teacher/photos/'+a.data.id),env,a.data.id);assert.equal(image.headers.get('content-type'),'image/png');assert.deepEqual(new Uint8Array(await image.arrayBuffer()),png);
});
test('다른 기기·다른 반 장소·잘못된 이미지·초과 제출 거절, 학생의 사진 조회·후보 변경 차단',async()=>{
 const env=environment(),first=submission();assert.equal((await photoRoutes.submit(first.request,env,itineraries)).status,200);
 assert.equal((await photoRoutes.submit(submission(5,{token:'b'.repeat(32)}).request,env,itineraries)).status,409);
 assert.equal((await photoRoutes.submit(submission(5,{spotId:'fake'}).request,env,itineraries)).status,400);
 assert.equal((await photoRoutes.submit(submission(5,{},new TextEncoder().encode('<svg/>'),'image/svg+xml').request,env,itineraries)).status,415);
 for(let i=0;i<9;i++)assert.equal((await photoRoutes.submit(submission().request,env,itineraries)).status,200);
 assert.equal((await photoRoutes.submit(submission().request,env,itineraries)).status,409);
 assert.equal((await photoRoutes.submit(submission(5,{id:first.data.id,title:'10장 제출 후 제목 수정'}).request,env,itineraries)).status,200);
 const atLimit=await(await photoRoutes.list(new Request('https://test.local/teacher/api/photos?spot=peace&class=5'),env)).json();assert.equal(atLimit.photos.length,10);
 const worker=createHandler({}, {},itineraries);
 assert.equal((await worker.fetch(new Request('https://test.local/teacher/photos/'+first.data.id),env)).status,401);
 assert.equal((await worker.fetch(new Request('https://test.local/teacher/api/photos?spot=peace&class=5'),env)).status,401);
 assert.equal((await worker.fetch(new Request('https://test.local/teacher/api/photos/select',{method:'POST',headers:{Origin:'https://test.local'},body:JSON.stringify({id:first.data.id,selected:true})}),env)).status,401);
 assert.equal((await worker.fetch(new Request('https://test.local/teacher/api/photos/archive?spot=peace&class=5'),env)).status,401);
});
