import test from 'node:test';import assert from 'node:assert/strict';
import {submissionDatabase} from '../worker/d1-retry.mjs';
import {previewDatabase} from '../preview-db.mjs';
test('D1 연결 손실은 저장이 완료된 경우에도 같은 키로 복구하고 중복을 만들지 않는다',async()=>{
 const db=previewDatabase(':memory:');let failed=false,calls=0;
 const wrap=inner=>({bind(...args){return wrap(inner.bind(...args));},all(){return inner.all();},async run(){calls++;const result=await inner.run();if(!failed){failed=true;throw Error('D1_ERROR: Network connection lost.');}return result;}});
 const fault={prepare(sql){return wrap(db.prepare(sql));}};
 const result=await submissionDatabase(fault).prepare('INSERT INTO photo_owners (class_no,seat_no,token_hash) VALUES (?,?,?) ON CONFLICT(class_no,seat_no) DO UPDATE SET token_hash=photo_owners.token_hash WHERE photo_owners.token_hash=excluded.token_hash').bind(6,97,'test-hash').run();
 assert.equal(result.meta.changes,1);assert.equal(calls,2);assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM photo_owners').bind().all()).results[0].n,1);
});
test('영구 D1 오류는 반복하지 않고 일시 오류도 네 번까지만 시도한다',async()=>{
 let calls=0;const db=message=>({prepare(){return {all:async()=>{calls++;throw Error(message);}};}});
 await assert.rejects(submissionDatabase(db('D1_ERROR: storage limit exceeded')).prepare('SELECT 1').all(),/storage limit/);assert.equal(calls,1);
 calls=0;await assert.rejects(submissionDatabase(db('D1_ERROR: Network connection lost.')).prepare('SELECT 1').all(),/Network connection lost/);assert.equal(calls,4);
});
