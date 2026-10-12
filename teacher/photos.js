(() => {
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const spots=[...new Map(Object.values(GUIDE_DATA.programs).flatMap(p=>p.slides).filter(s=>s.type==='stop'&&!['school','gimpo','jeju-arrive','jeju-depart','return'].includes(s.id)).map(s=>[s.id,s])).values()];
 let active=false,spot='all',classNo='all',photos=[],hideIdentity=true,message='',totalBytes=0,loading=false,generation=0,nextCursor=null,total=0,candidateCount=0;
 function gallery(){
  return spots.filter(s=>spot==='all'||s.id===spot).map(s=>{
   const place=photos.filter(p=>p.spotId===s.id);if(!place.length)return '';
   return `<section class="photo-place-group" data-gallery-spot="${s.id}"><h2>${esc(s.title)} · ${place.length}장</h2>${Array.from({length:10},(_,i)=>i+1).map(n=>{
    const group=place.filter(p=>p.classNo===n);if(!group.length)return '';
    return `<section data-gallery-class="${n}"><h3>2-${n}반 · ${group.length}장</h3><div class="teacher-photo-grid">${group.map(p=>`<article class="contest-card"><a href="/teacher/photos/${p.id}" target="_blank" rel="noopener"><img src="/teacher/photos/${p.id}?thumbnail=1" loading="lazy" alt="${esc(p.title)}"></a><div><p class="slide-kicker">작품 ${p.id.slice(0,8)}</p><h3>${esc(p.title)}</h3><p>${esc(p.caption||'설명 없음')}</p>${hideIdentity?'':`<p>${esc(p.no)} · ${esc(p.name)}</p>`}<a href="/teacher/photos/${p.id}?download=1">제출 사진 받기</a><label><input type="checkbox" data-contest-select="${p.id}" ${p.selected?'checked':''}> 콘테스트 후보</label></div></article>`).join('')}</div></section>`;
   }).join('')}</section>`;
  }).join('');
 }
 function render(){
  if(!active)return;
  const container=document.getElementById('teacherContent');container.innerHTML=`<article class="slide"><p class="slide-kicker">선생님 · 사진 콘테스트 모으기</p><h1>학생이 담은 제주,<br>장소별로 한눈에</h1><hr class="title-rule"><p class="lead">소감문과 별도로 제출한 사진입니다. 전체 사진을 보거나 장소와 반 버튼을 눌러 확인하세요. ‘콘테스트 후보’ 표시를 저장하고, 선택한 장소의 사진을 반별 폴더로 받을 수 있습니다.</p><section class="teacher-photo-pickers"><h2>방문 장소 선택</h2><div class="photo-choice-grid" role="group" aria-label="방문 장소 선택"><button type="button" data-photo-spot="all" aria-pressed="${spot==='all'}">전체 보기</button>${spots.map(s=>`<button type="button" data-photo-spot="${s.id}" aria-pressed="${s.id===spot}">${esc(s.title)}</button>`).join('')}</div><h2>${spot==='all'?'전체 장소':esc(spots.find(s=>s.id===spot)?.title)} · 반 선택</h2><div class="photo-choice-grid class-choice-grid" role="group" aria-label="사진 학급 선택"><button type="button" data-photo-class="all" aria-pressed="${classNo==='all'}">전체 반 보기</button>${Array.from({length:10},(_,i)=>i+1).map(n=>`<button type="button" data-photo-class="${n}" aria-pressed="${String(n)===classNo}">2-${n}반</button>`).join('')}</div><button class="reflection-button" data-refresh-photos ${loading?'disabled':''}>사진 새로 불러오기</button></section><label><input id="teacherPhotoBlind" type="checkbox" ${hideIdentity?'checked':''}> 학번·이름 숨기기</label><p class="photo-status" role="status">${esc(message||'전체 장소의 사진을 불러옵니다.')}</p><div class="collect-controls"><button class="reflection-button" data-photo-zip ${!photos.length||loading?'disabled':''}>현재 사진 ZIP 받기</button><button class="reflection-button" data-photo-zip-selected ${!candidateCount||loading?'disabled':''}>콘테스트 후보만 ZIP 받기</button></div><div id="photoArchiveParts"></div>${gallery()}${nextCursor!==null?`<button class="reflection-button full" type="button" data-load-more-photos ${loading?'disabled':''}>사진 더 보기 · ${photos.length} / ${total}장</button>`:''}${total>1000?'<p class="small-note">사진이 많아 ZIP은 장소·반을 선택해 1,000장 이하로 나누어 받으세요.</p>':''}<p class="small-note">큰 사진은 자동 압축된 제출본입니다. 고해상도 원본은 학생 기기에 보관됩니다.</p><p class="small-note">ZIP은 장소 / 반 폴더로 정리되며, 학번·이름·제목·설명을 담은 작품목록.csv가 함께 들어갑니다. 사진을 내려받을 때 학생 개인정보가 담긴 목록은 교사용으로 보관하세요.</p></article>`;
 }
 async function load(append=false){
  if(!spot){photos=[];message='먼저 방문 장소를 선택하세요.';render();return;}
  const version=++generation;loading=true;message='사진을 불러오는 중…';render();
  try{const response=await fetch(`/teacher/api/photos?spot=${encodeURIComponent(spot)}&class=${classNo}${append?'&cursor='+nextCursor:''}`,{cache:'no-store'});if(response.status===401){location.replace('/teacher');return;}const result=await response.json();if(!response.ok)throw Error(result.error||'불러오지 못했습니다.');if(version!==generation)return;photos=append?[...new Map([...photos,...result.photos].map(p=>[p.id,p])).values()]:result.photos;total=result.total??photos.length;totalBytes=result.totalBytes||0;candidateCount=result.selectedCount??photos.filter(p=>p.selected).length;nextCursor=result.nextCursor??null;message=`${spot==='all'?'전체 장소':spots.find(s=>s.id===spot).title} · ${classNo==='all'?'전체 반':`2-${classNo}반`} · 전체 ${total}장 중 ${photos.length}장 표시 · ${(totalBytes/1048576).toFixed(1)}MB`;}
  catch(error){if(version===generation){photos=[];message=error.message;}}
  finally{if(version===generation){loading=false;render();}}
 }
 async function zip(onlySelected){
  if(loading||!spot)return;
  const query='spot='+encodeURIComponent(spot)+'&class='+classNo+(onlySelected?'&selected=1':'');
  const target=document.getElementById('photoArchiveParts');
  message='다운로드 용량을 확인하는 중…';status();
  try{const response=await fetch('/teacher/api/photos/archive-plan?'+query,{cache:'no-store'}),result=await response.json();if(!response.ok)throw Error(result.error||'ZIP 준비에 실패했습니다.');
   if(!result.batches.length)throw Error('내려받을 사진이 없습니다.');
   if(result.batches.length===1){const link=document.createElement('a');link.href='/teacher/api/photos/archive?'+query+'&after='+result.batches[0].after+'&through='+result.batches[0].through;link.download='';document.body.append(link);link.click();link.remove();message='사진 ZIP 다운로드를 시작했습니다.';}
   else{target.innerHTML='<p>한 묶음당 200MB 이하로 나눴습니다. 아래 묶음을 차례대로 받으세요.</p>'+result.batches.map((b,i)=>'<p><a class="reflection-button" href="/teacher/api/photos/archive?'+query+'&after='+b.after+'&through='+b.through+'" download>묶음 '+(i+1)+' · '+b.count+'장 · '+(b.bytes/1048576).toFixed(1)+'MB 받기</a></p>').join('');message='총 '+result.batches.length+'개 ZIP으로 나누어 받습니다.';}
  }catch(error){message=error.message;}status();
 }
 function status(){const node=document.querySelector('.photo-status');if(node)node.textContent=message;const button=document.querySelector('[data-photo-zip-selected]');if(button)button.disabled=!candidateCount||loading;}
 document.addEventListener('change',e=>{

  if(e.target.id==='teacherPhotoBlind'){hideIdentity=e.target.checked;render();}
  if(e.target.matches('[data-contest-select]')){
   const checkbox=e.target,id=checkbox.dataset.contestSelect,selected=checkbox.checked,previous=photos.find(p=>p.id===id)?.selected;checkbox.disabled=true;
   void(async()=>{try{const response=await fetch('/teacher/api/photos/select',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,selected})});if(response.status===401){location.replace('/teacher');return;}const result=await response.json();if(!response.ok)throw Error(result.error||'저장하지 못했습니다.');const photo=photos.find(p=>p.id===id);if(photo){candidateCount+=selected&&!photo.selected?1:!selected&&photo.selected?-1:0;photo.selected=selected;}message='콘테스트 후보 표시를 저장했습니다.';}catch(error){message=error.message;checkbox.checked=!!previous;}finally{checkbox.disabled=false;}status();})();
  }
 });
 document.addEventListener('click',e=>{const place=e.target.closest('[data-photo-spot]'),group=e.target.closest('[data-photo-class]');if(place){spot=place.dataset.photoSpot;classNo='all';photos=[];void load();return;}if(group){classNo=group.dataset.photoClass;photos=[];void load();return;}if(e.target.closest('[data-load-more-photos]')&&!loading)void load(true);if(e.target.closest('[data-refresh-photos]'))void load();if(e.target.closest('[data-photo-zip]'))void zip(false);if(e.target.closest('[data-photo-zip-selected]'))void zip(true);});
 window.TEACHER_PHOTOS={open(){active=true;render();if(spot)void load();},close(){active=false;generation++;loading=false;},clear(){active=false;generation++;photos=[];nextCursor=null;total=0;candidateCount=0;loading=false;message='';}};
})();
