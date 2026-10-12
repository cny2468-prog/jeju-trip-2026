export async function uploadForm(request){
 const limit=Math.min(11*1024*1024,Number(request.headers.get('X-Guide-Upload-Limit'))||11*1024*1024);
 const tooLarge=()=>Object.assign(Error('사진 용량이 너무 큽니다.'),{name:'UploadTooLarge'});
 if(Number(request.headers.get('Content-Length')||0)>limit)throw tooLarge();
 if(!request.body)return request.formData();
 const reader=request.body.getReader();let bytes=0,exceeded=false;
 const bounded=new ReadableStream({async pull(controller){try{const part=await reader.read();if(part.done){controller.close();return;}bytes+=part.value.byteLength;if(bytes>limit){exceeded=true;controller.error(tooLarge());await reader.cancel();return;}controller.enqueue(part.value);}catch(error){controller.error(error);}},cancel(reason){return reader.cancel(reason);}});
 try{return await new Request(request,{body:bounded,duplex:'half'}).formData();}
 catch(error){if(exceeded)throw tooLarge();throw error;}
 finally{try{await reader.cancel();}catch{}}
}
