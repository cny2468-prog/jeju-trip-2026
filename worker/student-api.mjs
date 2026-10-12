const STUDENT_ORIGIN='https://cny2468-prog.github.io';
const error=status=>new Response(JSON.stringify({error:'허용된 안내 사이트에서 제출하세요.'}),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export async function studentApi(request,env,dispatch){
 const origin=request.headers.get('Origin'),own=new URL(request.url).origin,allowed=env.STUDENT_SITE_ORIGIN||STUDENT_ORIGIN;
 const cross=origin===allowed&&origin!==own;
 if(request.method==='OPTIONS'){
  const requested=(request.headers.get('Access-Control-Request-Headers')||'').toLowerCase().split(',').map(x=>x.trim()).filter(Boolean);
  if(!cross||request.headers.get('Access-Control-Request-Method')!=='POST'||requested.some(h=>!['content-type','x-photo-upload-lease'].includes(h)))return error(403);
  return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Photo-Upload-Lease','Access-Control-Max-Age':'600',Vary:'Origin','Cache-Control':'no-store'}});
 }
 if(request.method==='POST'&&origin!==own&&!cross)return error(403);
 if(!cross)return dispatch(request);
 if(request.method!=='POST')return error(405);
 const headers=new Headers(request.headers);headers.set('Origin',own);
 const response=await dispatch(new Request(request,{headers})),out=new Headers(response.headers);
 out.set('Access-Control-Allow-Origin',origin);out.set('Vary',out.get('Vary')?out.get('Vary')+', Origin':'Origin');out.set('Access-Control-Expose-Headers','Retry-After');
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers:out});
}
