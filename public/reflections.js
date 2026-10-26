(() => {
  'use strict';
  const TRIP = 'balgok-jeju-2026', TITLE = '2026 발곡고 2학년 제주 현장체험학습';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const prompts = {
    peace: '제주 4·3의 역사를 살펴보며 알게 된 점과 평화를 위해 실천하고 싶은 일을 적어 보세요.',
    cliff: '주상절리의 모양을 관찰하고, 자연이 만들어 낸 풍경에서 인상 깊었던 점을 적어 보세요.',
    seongsan: '성산일출봉에서 관찰한 지형과 풍경, 새롭게 알게 된 점을 적어 보세요.',
    osulloc: '차 문화와 제주 자연을 살펴보며 새롭게 알게 된 점을 적어 보세요.',
    wind: '카트 체험에서 지킨 안전 수칙과 도전하며 느낀 점을 적어 보세요.',
    jetboat: '제트보트 체험에서 지킨 안전 수칙과 가장 기억에 남는 순간을 적어 보세요.',
    laf: '체험과 작품 감상 중 인상 깊었던 순간과 그 이유를 적어 보세요.',
    market: '시장에서 관찰한 제주 음식과 생활 모습, 기억에 남는 경험을 적어 보세요.',
    soesokkak: '쇠소깍과 올레길에서 관찰한 자연, 함께 걸으며 느낀 점을 적어 보세요.',
    resort1: '친구들과 숙소에서 함께 생활하며 지킨 약속과 느낀 점을 적어 보세요.',
    resort2: '레크리에이션에서 함께 협력한 경험과 친구에게 고마웠던 일을 적어 보세요.'
  };
  const prompt = s => prompts[s.id] || '이곳에서 보고 체험한 것 중 가장 인상 깊었던 점과 그 이유를 적어 보세요.';
  const stops = list => list.filter(s => s.type === 'stop' && !['school','gimpo','jeju-arrive','jeju-depart','return'].includes(s.id));
  const storageKey = n => `jeju2026-reflections-class-${n}`;
  let classNo = 5, itinerary = [], onRender = () => {}, filter = '5';
  let storageError = false;
  const memory = new Map();
  function state() {
    if (memory.has(classNo)) return memory.get(classNo);
    let value = { me: { no: '', name: '' }, book: {} };
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey(classNo)) || 'null');
      if (stored && stored.me && stored.book && typeof stored.book === 'object') value = stored;
    } catch { storageError = true; }
    memory.set(classNo, value); return value;
  }
  function persist() {
    try { localStorage.setItem(storageKey(classNo), JSON.stringify(state())); storageError = false; }
    catch { storageError = true; }
  }
  const classFromNo = no => /^2\d{3,4}$/.test(no) && Number(no.slice(-2)) > 0 ? Number(no.slice(1, -2)) : 0;
  function identityProblem(no, name, expected = classNo) {
    if (classFromNo(no) !== expected || expected < 1 || expected > 10) return `선택한 2-${expected}반의 학번을 적어 주세요. 예: 2${String(expected).padStart(2,'0')}01`;
    if (!name.trim() || name.trim().length > 20 || /[\r\n\u0000-\u001f]/.test(name)) return '학생 이름을 1~20자로 적어 주세요.';
    return '';
  }
  function identityHtml() {
    const { me } = state();
    return `<form class="reflection-identity"><div class="reflection-fields"><label>학번 (4~5자리)<input name="studentNo" inputmode="numeric" autocomplete="off" maxlength="5" value="${esc(me.no)}" placeholder="2${String(classNo).padStart(2,'0')}01" required></label><label>학생 이름<input name="studentName" autocomplete="off" maxlength="20" value="${esc(me.name)}" required></label></div><button class="reflection-button" type="submit">학생 정보 저장</button><p class="reflection-message" role="status"></p><p class="small-note">작성 중에는 이 기기에 저장됩니다. ‘선생님께 제출’을 누르면 학번·이름·느낀 점이 해당 반으로 제출됩니다.</p></form>`;
  }
  function reflectionHtml(s) {
    if (!stops([s]).length) return '';
    const value = state(), saved = value.book[s.id];
    return `<section class="reflection-box"><h2>학생 느낀 점 쓰기</h2><p>${esc(prompt(s))}</p>${identityHtml()}<label class="reflection-label">${esc(s.title)} 느낀 점<textarea data-reflection="${s.id}" rows="5" maxlength="3000" placeholder="직접 보고, 듣고, 생각한 것을 적어 주세요.">${esc(saved?.text || '')}</textarea></label><p class="reflection-save-status" role="status">${saved?.text ? '이 기기에 저장된 글입니다.' : '쓰는 대로 이 기기에 저장됩니다.'}</p><button type="button" class="reflection-button full" data-submit-spot-reflection="${s.id}">이 장소 소감문 제출 · 2-${classNo}반</button><p data-reflection-submit-status role="status"></p><p class="small-note">이 장소의 글만 선생님께 제출합니다. 이미 제출한 다른 장소의 글은 유지됩니다. 수정한 뒤 같은 버튼을 다시 누르면 이 장소의 글이 바뀝니다.</p><button type="button" class="reflection-link" data-go="after">다녀와서 · 내 느낀 점 모아보기 →</button></section>`;
  }
  function afterHtml() {
    const { book } = state(), qs = stops(itinerary), written = qs.filter(s => book[s.id]?.text.trim()).length;
    return `<article class="slide"><p class="slide-kicker">다녀와서 · 2학년 ${classNo}반</p><h1>제주에서의 경험을<br>글로 남겨요</h1><hr class="title-rule"><p class="lead">장소마다 쓴 느낀 점을 ‘선생님께 제출’로 내세요. 학번에 따라 내 반으로 자동 분류됩니다. 파일 저장은 백업이나 별도 제출에 사용할 수 있습니다. 아직 못 쓴 곳은 아래 장소를 눌러 작성할 수 있습니다.</p>${identityHtml()}<p class="section-label">내 느낀 점 · ${written}/${qs.length}곳 작성</p><ol class="reflection-place-list">${qs.map(s => `<li><button type="button" data-go="${s.id}"><span>${book[s.id]?.text.trim() ? '작성' : '미작성'}</span><small>${s.group}일차</small><strong>${esc(s.title)}</strong><i>›</i></button></li>`).join('')}</ol><button class="reflection-button full" type="button" data-submit-reflections ${!written ? 'disabled' : ''}>선생님께 제출 · 2-${classNo}반</button><p id="reflectionSubmitStatus" role="status"></p><button class="reflection-button full" type="button" data-download-reflections ${!written ? 'disabled' : ''}>내 느낀 점 저장</button><p id="reflectionDownloadStatus" role="status"></p><button class="reflection-link" type="button" data-restore-reflections>저장한 느낀 점 파일 불러오기</button><input id="restoreReflectionFile" type="file" accept=".txt,text/plain" hidden><p class="small-note">학번_이름_느낀점.txt 파일로 저장됩니다. 제출한 글을 고치면 같은 기기에서 ‘선생님께 제출’을 다시 누르세요. 파일로 제출할 때는 최신 파일을 다시 받아 주세요. 기기를 바꾸거나 브라우저 기록을 지우기 전에 파일을 받아 두세요.</p></article>`;
  }
  const allStops = n => stops(window.GUIDE_DATA.programs[window.GUIDE_DATA.classes[n].team].slides);
  const encode = s => { let binary=''; for(const byte of new TextEncoder().encode(s)) binary+=String.fromCharCode(byte); return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); };
  const decode = s => new TextDecoder('utf-8', {fatal:true}).decode(Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)));
  function buildFile(spotId) {
    const { me, book } = state(), error = identityProblem(me.no, me.name);
    if (error) throw Error(error);
    const items = stops(itinerary).filter(s => (!spotId||s.id===spotId)&&book[s.id]?.text.trim()).map(s => ({s:s.id,d:s.group,t:s.title,q:prompt(s),a:book[s.id].text.trim(),u:book[s.id].updatedAt}));
    if (!items.length) throw Error(spotId?'이 장소의 느낀 점을 먼저 작성해 주세요.':'장소별 느낀 점을 먼저 작성해 주세요.');
    return { v:1,trip:TRIP,title:TITLE,no:me.no,name:me.name.trim(),classNo,savedAt:new Date().toISOString(),items };
  }
  function fileText(data) {
    const lines = ['제주 현장체험학습 · 느낀 점',`여행: ${TITLE}`,`학번: ${data.no}`,`이름: ${data.name}`,`반: 2-${data.classNo}`,`저장한 때: ${data.savedAt}`,''];
    data.items.forEach(it => { const s = itinerary.find(s=>s.id===it.s); lines.push(`[${it.d}일차 · ${window.GUIDE_DATA.days[it.d].date} ${s?.time || ''} · ${it.t}]`,`질문: ${it.q}`,it.a,''); });
    lines.push('----- 아래 줄은 선생님이 느낀 점을 모을 때 쓰는 정보예요. 지우거나 고치지 마세요 -----',`DORMSTRIP1 ${encode(JSON.stringify(data))}`);
    return lines.join('\n')+'\n';
  }
  function parseFile(text) {
    const clean = text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
    const tag = clean.match(/^DORMSTRIP1 ([A-Za-z0-9_-]+)\s*$/m);
    let data, fromText = false;
    if (tag) { try { data = JSON.parse(decode(tag[1])); } catch { /* Try readable body. */ } }
    if (!data) {
      if (!clean.startsWith('제주 현장체험학습 · 느낀 점')) throw Error('이 안내 사이트에서 받은 느낀 점 파일이 아닙니다.');
      const head = key => clean.match(new RegExp(`^${key}: (.+)$`,'m'))?.[1]?.trim() || '';
      if (head('여행') !== TITLE) throw Error('다른 여행의 파일입니다.');
      const body = clean.split('----- 아래 줄은')[0], lines = body.split('\n'), items = [];
      const re = /^\[(\d+)일차 · [^·\]]* · (.+)\]$/;
      for (let i=0;i<lines.length;i++) {
        const m = lines[i].match(re); if (!m) continue;
        const q = lines[i+1]?.startsWith('질문: ') ? lines[++i].slice(4) : '';
        let end=i+1; while(end<lines.length && !re.test(lines[end])) end++;
        items.push({s:'',d:Number(m[1]),t:m[2],q,a:lines.slice(i+1,end).join('\n').trim(),u:''}); i=end-1;
      }
      data={v:1,trip:TRIP,title:TITLE,no:head('학번'),name:head('이름'),savedAt:'',items}; fromText=true;
    }
    if (data.v!==1 || data.trip!==TRIP) throw Error('다른 여행이거나 지원하지 않는 파일입니다.');
    const n=classFromNo(data.no);
    if (!n || n>10 || typeof data.name!=='string' || identityProblem(data.no,data.name,n)) throw Error('학번이나 학생 이름을 확인해 주세요.');
    if (data.classNo != null && data.classNo!==n) throw Error('파일의 반과 학번이 일치하지 않습니다.');
    if (!Array.isArray(data.items) || data.items.length>200 || typeof data.savedAt!=='string' || (data.savedAt && !Number.isFinite(Date.parse(data.savedAt)))) throw Error('파일 정보 형식이 올바르지 않습니다.');
    const warnings=fromText?['정보 줄이 없어 본문으로 읽었습니다.']:[], answers=new Map();
    for(const it of data.items) {
      if (typeof it.a!=='string' || it.a.length>3000 || !Number.isInteger(it.d) || it.d<1 || it.d>3 || typeof it.t!=='string' || it.t.length>120) throw Error('장소별 글의 형식이나 길이를 확인해 주세요.');
      const s=allStops(n).find(s=>s.group===it.d && (it.s ? s.id===it.s : s.title===it.t));
      if (!s) { warnings.push('해당 반 일정에 없는 글은 제외했습니다.'); continue; }
      if (it.a.trim()) answers.set(`${s.group}:${s.id}`,{s:s.id,d:s.group,t:s.title,q:prompt(s),a:it.a.trim(),u:typeof it.u==='string'?it.u:''});
    }
    if (!answers.size) throw Error('해당 반 일정에 맞는 느낀 점이 없습니다.');
    return {...data,name:data.name.trim(),classNo:n,items:[...answers.values()],warnings};
  }
  function download(blob, filename) {
    const url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url;a.download=filename; document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  document.addEventListener('submit', e=>{
    if(!e.target.matches('.reflection-identity'))return; e.preventDefault();
    const form=e.target, values=new FormData(form), no=String(values.get('studentNo')).trim(), name=String(values.get('studentName')).trim(), error=identityProblem(no,name);
    if(error){form.querySelector('.reflection-message').textContent=error;return;}
    state().me={no,name};persist();form.querySelector('.reflection-message').textContent=storageError?'기기에 저장하지 못했습니다. 창을 닫기 전에 느낀 점 파일을 받아 주세요.':'학생 정보를 이 기기에 저장했습니다.';
  });
  document.addEventListener('input',e=>{
    if(!e.target.matches('[data-reflection]'))return;
    state().book[e.target.dataset.reflection]={text:e.target.value,updatedAt:new Date().toISOString()};persist();
    document.querySelector('.reflection-save-status').textContent=storageError?'기기에 저장하지 못했습니다. 창을 닫기 전에 파일을 받아 주세요.':'이 기기에 저장했습니다.';
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='restoreReflectionFile'){
      const file=e.target.files[0];e.target.value='';if(!file)return;
      void (async()=>{
        const status=document.getElementById('reflectionDownloadStatus');
        try{
          if(!/\.txt$/i.test(file.name)||file.size>500000)throw Error('500KB 이하의 느낀 점 .txt 파일을 골라 주세요.');
          const data=parseFile(await file.text()),value=state();
          if(data.classNo!==classNo)throw Error(`이 파일은 2-${data.classNo}반 학생의 파일입니다. 먼저 해당 반을 선택하세요.`);
          if(value.me.no && (classFromNo(value.me.no)!==data.classNo || value.me.no.slice(-2)!==data.no.slice(-2) || value.me.name.trim()!==data.name))throw Error('현재 학생 정보와 파일의 학번·이름이 다릅니다. 본인 파일인지 확인해 주세요.');
          let count=0;for(const item of data.items){if(!value.book[item.s]?.text.trim()){value.book[item.s]={text:item.a,updatedAt:item.u||new Date().toISOString()};count++;}}
          value.me={no:data.no,name:data.name};persist();onRender();
          document.getElementById('reflectionDownloadStatus').textContent=storageError?'기기에 저장하지 못했습니다. 창을 닫기 전에 파일을 받아 주세요.':`${count}곳의 글을 불러왔습니다. 이미 작성한 글은 유지했습니다.`;
        }catch(error){status.textContent=error.message;}
      })();
    }
  });
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-restore-reflections]'))document.getElementById('restoreReflectionFile').click();
    if(e.target.closest('[data-focus-reflection]')){const box=document.querySelector('.reflection-box');box?.scrollIntoView({behavior:'smooth',block:'start'});box?.querySelector('textarea')?.focus({preventScroll:true});}
    if(e.target.closest('[data-submit-reflections], [data-submit-spot-reflection]')){
      const button=e.target.closest('[data-submit-reflections], [data-submit-spot-reflection]'),spotId=button.dataset.submitSpotReflection,status=spotId?button.closest('.reflection-box').querySelector('[data-reflection-submit-status]'):document.getElementById('reflectionSubmitStatus');
      if(button.disabled)return;
      void(async()=>{button.disabled=true;status.textContent='제출 중…';
        try{const data=buildFile(spotId),key='jeju2026-submission-token-'+data.classNo+'-'+data.no.slice(-2);let token=localStorage.getItem(key);if(!token){token=crypto.randomUUID();localStorage.setItem(key,token);}
          const res=await window.GUIDE_API('/api/reflections',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data,token,...(spotId?{mode:'spot'}:{})})}),result=await res.json();if(!res.ok)throw Error(result.error||'제출하지 못했습니다.');status.textContent=result.message;
        }catch(error){status.textContent=error.message;}finally{button.disabled=false;}
      })();
    }
    if(e.target.closest('[data-download-reflections]')){
      const status=document.getElementById('reflectionDownloadStatus');
      try {const data=buildFile();download(new Blob(['\uFEFF'+fileText(data)],{type:'text/plain;charset=utf-8'}),`${data.no}_${data.name.replace(/[\\/:*?"<>|\s]/g,'')}_느낀점.txt`);status.textContent='파일을 받았습니다. 선생님이 안내한 제출처에 내세요.';}catch(error){status.textContent=error.message;}
    }

  });
  window.GUIDE_REFLECTIONS={
    setContext(n,list,rerender){if(classNo!==n)filter=String(n);classNo=n;itinerary=list;onRender=rerender;},
    reflectionHtml,afterHtml,parseFile,buildFile,fileText,
    sideHtml(){return `<div class="reflection-side"><span>JEJU 2026 · AFTER THE TRIP</span><h2>장소를 떠올리며<br>나의 경험을 기록해요</h2><p>장소별로 작성하고 바로 제출하거나, 다녀와서 한꺼번에 제출하세요.</p><img src="assets/seongsan.jpg" alt="제주 성산일출봉 풍경"><p>제출한 글은 선생님용 화면에서 반별로 확인합니다.</p></div>`;}
  };
})();
