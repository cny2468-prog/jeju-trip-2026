import test from 'node:test';import assert from 'node:assert/strict';
import {previewDatabase} from '../preview-db.mjs';import {submitReflection,readReflections} from '../worker/submissions.mjs';import {createHandler} from '../worker/handler.mjs';
const itinerary={5:[{id:'peace',group:3,title:'제주 4·3평화공원',question:''}],10:[{id:'peace',group:2,title:'제주 4·3평화공원',question:''}]};
const data=n=>({v:1,trip:'balgok-jeju-2026',no:`2${String(n).padStart(2,'0')}01`,classNo:n,name:'테스트학생',items:[{s:'peace',d:n===5?3:2,a:n+'반 글'}]});
const request=(data,token='a'.repeat(32))=>new Request('https://test.local/api/reflections',{method:'POST',headers:{Origin:'https://test.local','Content-Type':'application/json'},body:JSON.stringify({data,token})});
test('학번으로 반별 저장, 같은 기기 수정, 다른 기기 덮어쓰기 차단',async()=>{
 const env={DB:previewDatabase(':memory:')};
 assert.equal((await submitReflection(request(data(5)),env,itinerary)).status,200);
 assert.equal((await submitReflection(request(data(10)),env,itinerary)).status,200);
 const update=data(5);update.items[0].a='수정한 글';assert.equal((await submitReflection(request(update),env,itinerary)).status,200);
 assert.equal((await submitReflection(request(data(5),'b'.repeat(32)),env,itinerary)).status,409);
 const result=await (await readReflections(new Request('https://test.local/teacher/api/reflections?class=5'),env)).json();
 assert.equal(result.students.length,1);assert.equal(result.students[0].no,'20501');assert.equal(result.students[0].items[0].a,'수정한 글');
 assert.equal((await readReflections(new Request('https://test.local/teacher/api/reflections?class=all'),env)).status,400);
});
test('반 불일치·다른 반 일정 거절, 학생은 제출 내역 조회 불가',async()=>{
 const env={DB:previewDatabase(':memory:')},bad=data(5);bad.classNo=10;
 assert.equal((await submitReflection(request(bad),env,itinerary)).status,400);
 const wrongDay=data(5);wrongDay.items[0].d=2;assert.equal((await submitReflection(request(wrongDay),env,itinerary)).status,400);
 assert.equal((await submitReflection(new Request('https://test.local/api/reflections'),env,itinerary)).status,405);
 assert.equal((await createHandler({}, {},itinerary).fetch(new Request('https://test.local/teacher/api/reflections?class=5'),env)).status,401);
});
