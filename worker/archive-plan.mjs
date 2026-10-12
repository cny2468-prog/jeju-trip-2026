import {submissionDatabase} from './d1-retry.mjs';
export const ARCHIVE_BYTES=200*1024*1024;
export function archiveFilter(request){
 const p=new URL(request.url).searchParams,spot=p.get('spot'),group=p.get('class')||'all',n=Number(group),after=Number(p.get('after')||0),through=Number(p.get('through')||Number.MAX_SAFE_INTEGER);
 if(!spot||!/^[a-z0-9-]{1,40}$/.test(spot)||(group!=='all'&&(!Number.isInteger(n)||n<1||n>10))||!Number.isSafeInteger(after)||after<0||!Number.isSafeInteger(through)||through<=after)throw Error('장소와 반을 다시 선택해 주세요.');
 return {where:' WHERE rowid>? AND rowid<=?'+(spot==='all'?'':' AND spot_id=?')+(group==='all'?'':' AND class_no=?')+(p.get('selected')==='1'?' AND selected=1':''),values:[after,through,...(spot==='all'?[]:[spot]),...(group==='all'?[]:[n])]};
}
export async function archivePlan(request,env){
 try{
  const {where,values}=archiveFilter(request),rows=(await submissionDatabase(env.DB).prepare('SELECT rowid AS cursorRow,bytes FROM contest_photos'+where+' ORDER BY rowid').bind(...values).all()).results;
  const batches=[];let part=null,last=0;
  for(const row of rows){if(!part||part.count>=1000||part.bytes+row.bytes>ARCHIVE_BYTES){part={after:last,through:row.cursorRow,count:0,bytes:0};batches.push(part);}part.count++;part.bytes+=row.bytes;part.through=row.cursorRow;last=row.cursorRow;}
  return Response.json({batches,total:rows.length,maxBytes:ARCHIVE_BYTES},{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){return Response.json({error:error.message},{status:400,headers:{'Cache-Control':'private, no-store'}});}
}
