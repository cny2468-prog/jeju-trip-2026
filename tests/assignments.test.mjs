import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({window:{}});
for(const file of ['data.js','assignments.js','assignments-ui.js','schedules.js'])vm.runInContext(fs.readFileSync(new URL('../public/'+file,import.meta.url),'utf8'),context);
const {GUIDE_ASSIGNMENTS:a,GUIDE_DATA:d,GUIDE_ASSIGNMENT_UI:ui}=context.window;
test('all 229 students have one room and one school-airport seat in their class',()=>{
 const counts=[24,22,21,22,20,25,24,21,26,24];
 assert.equal(a.scope,'school-gimpo-roundtrip');assert.equal(a.buses.length,7);
 assert.equal(Object.values(a.classes).flatMap(c=>c.rooms).length,49);
 for(let n=1;n<=10;n++){
  const c=a.classes[n],roomNames=c.rooms.flatMap(r=>r.members).sort(),seats=a.buses.flatMap(b=>b.seats.filter(s=>s.kind==='student'&&s.classNo===n));
  assert.equal(c.total,counts[n-1]);assert.equal(roomNames.length,c.total);assert.equal(new Set(roomNames).size,c.total);
  assert.deepEqual([...seats.map(s=>s.name)].sort(),[...roomNames]);
  assert.equal(d.classes[n].students.total,c.total);
  for(const r of c.rooms){assert.equal(r.count,r.members.length);assert.equal(r.members.filter(x=>x===r.leader).length,1);}
  assert.equal((ui.rooms(n).match(/data-room-member/g)||[]).length,c.total);
  assert.equal((ui.buses(n).match(/data-my-seat/g)||[]).length,c.total);
  assert.equal((ui.buses(n).match(/data-bus-roster-entry/g)||[]).length,c.total);
 }
});
test('split classes, staff exclusions and actual seat geometry',()=>{
 for(const [n,buses] of [[4,[[2,9],[3,13]]],[5,[[4,10],[5,10]]],[8,[[6,10],[7,11]]]])assert.deepEqual(JSON.parse(JSON.stringify(a.classes[n].buses.map(b=>[b.number,b.count]))),buses);
 for(const b of a.buses){
  assert.equal(b.seats.length,44);
  for(const e of b.expected)if(e.count!==null)assert.equal(b.seats.filter(s=>s.kind==='student'&&s.classNo===e.classNo).length,e.count);
  for(const s of b.seats){assert.equal(s.sourceCell,['B','C','F','G'][s.column]+(s.row+6));if(s.kind!=='student'){assert.equal(s.name,undefined);assert.equal(s.classNo,undefined);}}
  for(const cell of ['B7','F7'])assert.equal(b.seats.find(s=>s.sourceCell===cell).kind,'staff');
 }
 const resolved=a.buses.find(b=>b.number===4).seats.find(s=>s.sourceCell==='F10');assert.equal(resolved.classNo,6);assert.equal(resolved.label,'4열 우측 통로');
 assert.ok(a.classes[7].rooms.some(r=>r.gender==='girls'&&r.number===303));
 for(const [n,room,count] of [[2,213,3],[2,214,5],[6,203,4],[6,204,5],[10,223,6],[10,224,4]])assert.equal(a.classes[n].rooms.find(r=>r.number===room).count,count);
 assert.ok(d.classes[5].jejuBus.includes('5~7호차'));
});
