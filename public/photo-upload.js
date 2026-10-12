(() => {
 'use strict';
 const MB=1024*1024,MAX_BYTES=10*MB,TARGET_BYTES=MB,MAX_SOURCE_BYTES=40*MB;
 const formats=new Set(['image/jpeg','image/png','image/webp']);
 const apiFetch=(...args)=>(window.GUIDE_API||fetch)(...args);
 const size=bytes=>`${(bytes/MB).toFixed(2)}MB`;
 async function decode(file){
  if(typeof createImageBitmap==='function')return createImageBitmap(file);
  const url=URL.createObjectURL(file),img=new Image();
  try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});return img;}finally{URL.revokeObjectURL(url);}
 }
 async function prepare(file){
  if(!formats.has(file.type))throw Error('JPEG·PNG·WebP 사진을 선택하세요. HEIC 사진은 JPEG로 변환해 주세요.');
  if(!file.size)throw Error('빈 사진 파일은 제출할 수 없습니다.');
  if(file.size>MAX_SOURCE_BYTES)throw Error('사진 용량이 너무 큽니다. 기기에서 사진 크기를 줄여 40MB 이하의 원본을 선택하세요.');
  if(file.size<=TARGET_BYTES)return {file,originalBytes:file.size,compressed:false};
  let bitmap;
  try{
   bitmap=await decode(file);
   const sourceWidth=bitmap.width||bitmap.naturalWidth,sourceHeight=bitmap.height||bitmap.naturalHeight;
   if(!sourceWidth||!sourceHeight||sourceWidth*sourceHeight>60_000_000)throw Error('이미지 크기 초과');
   const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)throw Error('압축 기능 사용 불가');
   let longest=Math.min(1920,Math.max(sourceWidth,sourceHeight)),best=file;
   for(let attempt=0;attempt<6;attempt++){
    const ratio=longest/Math.max(sourceWidth,sourceHeight);
    canvas.width=Math.max(1,Math.round(sourceWidth*ratio));canvas.height=Math.max(1,Math.round(sourceHeight*ratio));
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const quality=Math.max(.55,.82-attempt*.055);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));
    if(blob&&blob.size&&blob.size<best.size)best=blob;
    if(best.size<=TARGET_BYTES)break;
    longest=Math.max(960,Math.round(longest*.8));
   }
   canvas.width=canvas.height=1;
   if(best.size>MAX_BYTES)throw Error('사진 용량이 너무 큽니다. 자동 압축 후에도 10MB를 초과했습니다. 사진 크기를 줄여 다시 선택하세요.');
   const compressed=best!==file;
   return {file:compressed?new File([best],file.name.replace(/\.[^.]+$/,'')+'-upload.jpg',{type:'image/jpeg',lastModified:file.lastModified}):file,originalBytes:file.size,compressed};
  }catch(error){
   if(file.size>MAX_BYTES)throw Error('사진 용량이 너무 큽니다. 자동 압축을 완료하지 못했습니다. 10MB 이하로 줄여 다시 선택하세요.');
   throw Error('이 사진을 압축할 수 없습니다. JPEG로 다시 저장하거나 다른 사진을 선택하세요.');
  }finally{bitmap?.close?.();}
 }
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 let queue=Promise.resolve();
 async function reserve(form,onWait){
  const data=JSON.parse(form.get('data')||'{}'),until=Date.now()+600000;
  for(let poll=0;poll<120&&Date.now()<until;poll++){
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
   let response,result;
   try{response=await apiFetch('/api/photo-upload-slot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:data.id,token:data.token}),signal:controller.signal});result=await response.json();}finally{clearTimeout(timer);}
   if(response.ok&&/^[a-f0-9]{64}$/.test(result.lease||''))return result.lease;
   if(response.ok&&result.wait){onWait();await pause(1500+Math.floor(Math.random()*3500));continue;}
   const error=Error(result.error||'사진 제출 순서를 확인하지 못했습니다. 잠시 후 다시 제출하세요.');
   if(response.status>=400&&response.status<500&&response.status!==429)error.permanent=true;
   throw error;
  }
  const error=Error('사진 제출 대기가 길어지고 있습니다. 선택한 사진은 남아 있으니 잠시 후 다시 제출하세요.');error.permanent=true;throw error;
 }
 async function transmit(form,onRetry,firstInBatch,onWait){
  // Spread simultaneous classroom submissions, then pace each student's files.
  // The queue also prevents two open spots in this page from uploading together.
  await pause(1000+Math.floor(Math.random()*(firstInBatch?8000:2000)));
  for(let attempt=0;attempt<4;attempt++){
   const controller=new AbortController();let timer;
   let retryAfter=0;
   try{
    // Acquire a small server permit before sending any photo bytes.
    const lease=await reserve(form,onWait);
    timer=setTimeout(()=>controller.abort(),60000);
    const response=await apiFetch('/api/photos',{method:'POST',headers:{'X-Photo-Upload-Lease':lease},body:form,signal:controller.signal});
    let result;try{result=await response.json();}catch{result={};}
    if(response.ok)return result;
    const retryHeader=response.headers?.get('Retry-After');
    if(retryHeader){const seconds=Number(retryHeader);retryAfter=Number.isFinite(seconds)?seconds*1000:Date.parse(retryHeader)-Date.now();}
    if(response.status!==429&&response.status<500&&!result.renewLease){const error=Error(result.error||'사진을 제출하지 못했습니다.');error.permanent=true;throw error;}
    if(attempt===3)throw Error(result.error||'접속이 몰려 사진을 제출하지 못했습니다. 잠시 후 다시 제출하세요. 선택한 사진은 남아 있습니다.');
   }catch(error){
    if(error.permanent)throw error;
    if(attempt===3){
     if(error.name==='AbortError')throw Error('업로드 시간이 초과됐습니다. 사진은 남아 있으니 다시 제출하세요.');
     if(error.name==='TypeError')throw Error('통신이 원활하지 않아 사진을 제출하지 못했습니다. 선택한 사진은 남아 있으니 연결 상태를 확인하고 다시 제출하세요.');
     throw error;
    }
   }
   finally{clearTimeout(timer);}
   onRetry(attempt+1);
   await pause(Math.max(1000*2**attempt+Math.floor(Math.random()*1200),Math.min(30000,Math.max(0,retryAfter))));
  }
 }
 function send(form,onRetry=()=>{},{firstInBatch=true,onWait=()=>{}}={}){
  const pending=queue.then(()=>transmit(form,onRetry,firstInBatch,onWait));
  queue=pending.catch(()=>{});
  return pending;
 }
 window.GUIDE_PHOTO_UPLOAD={prepare,send,size,MAX_BYTES,TARGET_BYTES};
})();
