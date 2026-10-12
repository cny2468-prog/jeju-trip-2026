(() => {
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const drafts=new Map();
 function draft(key){if(!drafts.has(key))drafts.set(key,{files:[],busy:false,message:''});return drafts.get(key);}
 function cards(value){return value.files.map((photo,i)=>`<div class="photo-entry"><img src="${photo.url}" alt="제출 전 사진 ${i+1} 미리보기"><div>${photo.compressed?`<p class="photo-compression-note">자동 압축 · ${GUIDE_PHOTO_UPLOAD.size(photo.originalBytes)} → ${GUIDE_PHOTO_UPLOAD.size(photo.file.size)}</p>`:''}<label>사진 제목<input data-photo-title="${i}" maxlength="60" value="${esc(photo.title)}" placeholder="이 순간에 이름을 붙여 주세요" required></label><label>사진 설명<textarea data-photo-caption="${i}" maxlength="500" rows="3" placeholder="무엇을 담았고, 왜 기억에 남았나요?">${esc(photo.caption)}</textarea></label><button type="button" class="reflection-link" data-remove-photo="${i}" ${value.busy?'disabled':''}>이 사진 빼기</button></div></div>`).join('');}
 function update(box){const value=draft(box.dataset.photoKey);box.querySelector('.photo-drafts').innerHTML=cards(value);box.querySelector('.photo-submit').disabled=value.busy||!value.files.length;box.querySelector('[data-photo-files]').disabled=value.busy;box.querySelector('.photo-status').textContent=value.message;}
 window.GUIDE_PHOTOS={render(s,n){const key=n+':'+s.id,value=draft(key);return `<section class="reflection-box photo-contest" data-photo-key="${key}" data-photo-spot="${s.id}" data-photo-class="${n}"><p class="slide-kicker">JEJU PHOTO CONTEST · ${esc(s.title)} · 2-${n}반</p><h2>내가 담은 제주, 사진으로 남겨요</h2><p>제주의 풍경, 체험의 순간, 친구와 함께한 이야기를 직접 찍은 사진으로 전해 주세요. 제목과 설명을 붙여 제출하면 이 장소의 2-${n}반 사진으로 모입니다.</p><p class="small-note">사진 속 친구에게 콘테스트에 제출해도 되는지 먼저 확인하세요. 여행지 사진만 제출하세요. 큰 사진은 업로드 전에 자동 압축합니다(긴 변 최대 1920px, 목표 1MB). JPEG·PNG·WebP, 압축 후 한 장 최대 10MB, 한 장소당 최대 10장입니다. 원본은 기기에 보관하세요. 선택한 사진은 제출 전까지 이 페이지에만 남으니 페이지를 닫기 전에 제출해 주세요.</p><label class="photo-file-label">사진 고르기<input data-photo-files type="file" accept="image/jpeg,image/png,image/webp" multiple ${value.busy?'disabled':''}></label><div class="photo-drafts">${cards(value)}</div><button type="button" class="reflection-button full photo-submit" data-submit-photos ${value.busy||!value.files.length?'disabled':''}>사진 제출 · ${esc(s.title)} · 2-${n}반</button><p class="photo-status" role="status">${esc(value.message)}</p><p class="small-note">소감문과 별도로 제출됩니다. 교사용 ‘사진 콘테스트 모으기’에서 확인하며 학생끼리는 제출 사진을 볼 수 없습니다.</p></section>`;},clear(){for(const value of drafts.values())for(const file of value.files)URL.revokeObjectURL(file.url);drafts.clear();}};
 document.addEventListener('change',e=>{
  if(!e.target.matches('[data-photo-files]'))return;
  const box=e.target.closest('.photo-contest'),value=draft(box.dataset.photoKey),files=Array.from(e.target.files);e.target.value='';if(value.busy)return;
  value.busy=true;value.message='사진 크기를 확인하고 자동 압축하는 중…';update(box);
  void(async()=>{const errors=[];let added=0;
   try{for(const file of files){
    if(value.files.length>=10){errors.push('한 장소에서 사진은 최대 10장까지 선택할 수 있습니다.');break;}
    try{const photo=await GUIDE_PHOTO_UPLOAD.prepare(file),thumbnail=await GUIDE_PHOTO_UPLOAD.thumbnail(photo.file);value.files.push({id:crypto.randomUUID(),...photo,thumbnail,url:URL.createObjectURL(thumbnail),title:'',caption:''});added++;}
    catch(error){errors.push(file.name+': '+error.message);}
   }}finally{value.busy=false;value.message=(added?사진안내(added):'')+[...new Set(errors)].join('\n');update(box);}
  })();
 });
 function 사진안내(count){return count+'장을 준비했습니다. 큰 사진은 자동 압축했습니다. 제목과 설명을 적고 사진 제출을 눌러 주세요.\n';}
 document.addEventListener('input',e=>{const box=e.target.closest('.photo-contest');if(!box)return;const value=draft(box.dataset.photoKey);if(e.target.matches('[data-photo-title]'))value.files[Number(e.target.dataset.photoTitle)].title=e.target.value;if(e.target.matches('[data-photo-caption]'))value.files[Number(e.target.dataset.photoCaption)].caption=e.target.value;});
 document.addEventListener('click',e=>{
  const box=e.target.closest('.photo-contest');if(!box)return;const value=draft(box.dataset.photoKey),remove=e.target.closest('[data-remove-photo]');
  if(remove){const [file]=value.files.splice(Number(remove.dataset.removePhoto),1);URL.revokeObjectURL(file.url);update(box);return;}
  if(!e.target.closest('[data-submit-photos]')||value.busy)return;
  void(async()=>{
   value.busy=true;let sent=0;
   try{
    const me=GUIDE_REFLECTIONS.photoIdentity();if(me.classNo!==Number(box.dataset.photoClass))throw Error('선택한 반과 학생 정보를 확인해 주세요.');
    if(value.files.some(photo=>!photo.title.trim()))throw Error('각 사진의 제목을 적어 주세요.');
    const total=value.files.length;value.message=`사진 0 / ${total}장 제출 중…`;update(box);
    for(const photo of [...value.files]){
     const form=new FormData();form.append('photo',photo.file);form.append('thumbnail',photo.thumbnail);form.append('data',JSON.stringify({...me,id:photo.id,spotId:box.dataset.photoSpot,title:photo.title,caption:photo.caption}));
     value.message=`사진 ${sent+1} / ${total}장 제출 중…`;update(box);
     await GUIDE_PHOTO_UPLOAD.send(form,attempt=>{value.message=`사진 ${sent+1} / ${total}장 · 통신이 지연되어 자동 재시도 중(${attempt}/3)…`;update(box);},{firstInBatch:sent===0,onWait(){value.message=`사진 ${sent+1} / ${total}장 · 제출이 몰려 순서를 기다리고 있습니다. 이 화면을 닫지 마세요.`;update(box);}});
     value.files.splice(value.files.indexOf(photo),1);URL.revokeObjectURL(photo.url);sent++;
    }
    value.message=`사진 ${sent}장을 이 장소의 2-${me.classNo}반으로 제출했습니다. 선생님용 사진 수집 화면에 저장되었습니다.`;
   }catch(error){value.message=(sent?`${sent}장 제출 완료. 남은 사진: `:'')+error.message;}finally{value.busy=false;update(box);}
  })();
 });
})();
