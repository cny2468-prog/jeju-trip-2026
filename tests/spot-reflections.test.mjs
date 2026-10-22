import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {previewDatabase} from '../preview-db.mjs';import {submitReflection,readReflections} from '../worker/submissions.mjs';
test('장소 버튼은 해당 글만 보내며 교사 조회에서 이전 장소와 수정본을 확인한다',async()=>{
 const list=[{id:'peace',type:'stop',group:3,title:'평화공원'},{id:'osulloc',type:'stop',group:2,title:'오설록'}],env={DB:previewDatabase(':memory:')},listeners={},values=new Map([['jeju2026-reflections-class-6',JSON.stringify({me:{no:'20601',name:'제출시험학생'},book:{peace:{text:'역사를 기억해요'},osulloc:{text:'제주 차 문화'}}})]]),sent=[];
 const window={GUIDE_API:async(path,options)=>{const body=JSON.parse(options.body);sent.push(body);return submitReflection(new Request('https://test.local'+path,{...options,headers:{...options.headers,Origin:'https://test.local'}}),env,{6:list});}};
 const context=vm.createContext({window,document:{addEventListener:(type,fn)=>listeners[type]=fn,querySelector:()=>({textContent:''})},localStorage:{getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)},crypto,TextEncoder,TextDecoder,console});
 vm.runInContext(fs.readFileSync('public/reflections.js','utf8'),context);const api=window.GUIDE_REFLECTIONS;api.setContext(6,list,()=>{});
 assert.match(api.reflectionHtml(list[0]),/data-submit-spot-reflection="peace"/);assert.equal(api.buildFile().items.length,2);
 async function click(spot){const status={textContent:''},button={dataset:{submitSpotReflection:spot},disabled:false,closest:()=>({querySelector:()=>status})};listeners.click({target:{closest:selector=>selector==='[data-submit-reflections], [data-submit-spot-reflection]'?button:null}});while(button.disabled)await new Promise(r=>setTimeout(r,1));assert.match(status.textContent,/2-6반으로 제출했습니다/);}
 await click('peace');assert.equal(sent[0].mode,'spot');assert.deepEqual(sent[0].data.items.map(i=>i.s),['peace']);await click('osulloc');
 listeners.input({target:{matches:()=>true,dataset:{reflection:'peace'},value:'수정한 역사 소감'}});await click('peace');
 const result=await(await readReflections(new Request('https://test.local/teacher/api/reflections?class=6'),env)).json();assert.equal(result.students.length,1);assert.deepEqual(Object.fromEntries(result.students[0].items.map(i=>[i.s,i.a])),{osulloc:'제주 차 문화',peace:'수정한 역사 소감'});
 assert.throws(()=>api.buildFile('missing'),/이 장소의 느낀 점을 먼저 작성/);
});
