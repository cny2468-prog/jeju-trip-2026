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
  let classNo = 5, itinerary = [], onRender = () => {}, collected = [], rejected = [], filter = '';
  let loading = false, storageError = false, collectionMessage = '';
  const loadedClasses=new Set();
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
    return `<form class="reflection-identity"><div class="reflection-fields"><label>학번 (4~5자리)<input name="studentNo" inputmode="numeric" autocomplete="off" maxlength="5" value="${esc(me.no)}" placeholder="2${String(classNo).padStart(2,'0')}01" required></label><label>학생 이름<input name="studentName" autocomplete="off" maxlength="20" value="${esc(me.name)}" required></label></div><button class="reflection-button" type="submit">학생 정보 저장</button><p class="reflection-message" role="status"></p><p class="small-note">학번·학생 이름·느낀 점은 이 기기에만 저장됩니다. 학교에서 사용하는 학번 체계로 입력하세요.</p></form>`;
  }
  function reflectionHtml(s) {
    if (!stops([s]).length) return '';
    const value = state(), saved = value.book[s.id];
    return `<section class="reflection-box"><h2>학생 느낀 점 쓰기</h2><p>${esc(prompt(s))}</p>${identityHtml()}<label class="reflection-label">${esc(s.title)} 느낀 점<textarea data-reflection="${s.id}" rows="5" maxlength="3000" placeholder="직접 보고, 듣고, 생각한 것을 적어 주세요.">${esc(saved?.text || '')}</textarea></label><p class="reflection-save-status" role="status">${saved?.text ? '이 기기에 저장된 글입니다.' : '쓰는 대로 이 기기에 저장됩니다.'}</p><button type="button" class="reflection-link" data-go="after">다녀와서 · 내 느낀 점 내기 →</button></section>`;
  }
  function afterHtml() {
    const { book } = state(), qs = stops(itinerary), written = qs.filter(s => book[s.id]?.text.trim()).length;
    return `<article class="slide"><p class="slide-kicker">다녀와서 · 2학년 ${classNo}반</p><h1>제주에서의 경험을<br>글로 남겨요</h1><hr class="title-rule"><p class="lead">장소마다 쓴 느낀 점을 파일 하나로 받아 선생님이 안내한 제출처에 내세요. 아직 못 쓴 곳은 아래 장소를 눌러 작성할 수 있습니다.</p>${identityHtml()}<p class="section-label">내 느낀 점 · ${written}/${qs.length}곳 작성</p><ol class="reflection-place-list">${qs.map(s => `<li><button type="button" data-go="${s.id}"><span>${book[s.id]?.text.trim() ? '작성' : '미작성'}</span><small>${s.group}일차</small><strong>${esc(s.title)}</strong><i>›</i></button></li>`).join('')}</ol><button class="reflection-button full" type="button" data-download-reflections ${!written ? 'disabled' : ''}>내 느낀 점 저장</button><p id="reflectionDownloadStatus" role="status"></p><button class="reflection-link" type="button" data-restore-reflections>저장한 느낀 점 파일 불러오기</button><input id="restoreReflectionFile" type="file" accept=".txt,text/plain" hidden><p class="small-note">학번_이름_느낀점.txt 파일로 저장됩니다. 저장 후 글을 고치면 파일을 다시 받아 제출하세요. 기기를 바꾸거나 브라우저 기록을 지우기 전에 파일을 받아 두세요.</p><div class="callout"><b>선생님 · 느낀 점 모으기</b><p>학생이 제출한 파일들을 모아 살핌 양식 엑셀로 받을 수 있습니다.</p><button class="reflection-button" type="button" data-go="collect">느낀 점 모으기</button></div></article>`;
  }
  const allStops = n => stops(window.GUIDE_DATA.programs[window.GUIDE_DATA.classes[n].team].slides);
  const itemKey = it => `${it.d}:${it.s}`;
  function questionsFor(numbers) {
    const byKey = new Map();
    numbers.forEach(n => allStops(n).forEach(s => byKey.set(`${s.group}:${s.id}`, { ...s, q: prompt(s) })));
    return [...byKey.values()].sort((a,b) => a.group-b.group);
  }
  const filtered = () => collected.filter(s => String(s.classNo) === filter);
  function collectHtml() {
    const students = filtered();
    const counts = Array.from({length:10},(_,i)=>({n:i+1,count:collected.filter(s=>s.classNo===i+1).length}));
    return `<article class="slide"><a class="overview-back" href="https://cny2468-prog.github.io/jeju-trip-2026/">학생 안내 보기</a><p class="slide-kicker">선생님 · 느낀 점 모으기</p><h1>학생 파일을 모아<br>살핌 양식으로</h1><hr class="title-rule"><p class="lead">담당 반을 선택하면 학생이 사이트에서 제출한 글을 불러옵니다. 별도로 받은 파일도 학번으로 반별 분류됩니다. 선택한 반의 학생만 표와 엑셀에 포함됩니다.</p><div class="collect-class-picker"><label for="reflectionClassFilter">확인할 반<select id="reflectionClassFilter" ${loading ? 'disabled' : ''}><option value="" ${!filter ? 'selected' : ''}>반을 선택하세요</option>${counts.map(({n,count})=>`<option value="${n}" ${filter===String(n)?'selected':''}>2-${n}반 · ${count}명</option>`).join('')}</select></label><div class="collect-class-tabs" aria-label="반별 수합 현황">${counts.map(({n,count})=>`<button type="button" data-collect-class="${n}" ${loading ? 'disabled' : ''} aria-pressed="${filter===String(n)}">2-${n}반 <small>${loadedClasses.has(n) || count ? `${count}명` : '미조회'}</small></button>`).join('')}</div><p class="small-note">학번 예: 20501 → 2-5반 1번, 21001 → 2-10반 1번. 여러 반 파일을 함께 가져와도 학번에 따라 분류됩니다.</p></div><button class="reflection-button" type="button" data-refresh-submissions ${!filter || loading ? 'disabled' : ''}>선택한 반 제출 현황 새로 불러오기</button><p role="status">${esc(collectionMessage)}</p><div class="reflection-drop" id="reflectionDrop"><strong>여기에 파일을 끌어다 놓거나</strong><button class="reflection-button" type="button" data-pick-reflections ${loading ? 'disabled' : ''}>${loading ? '파일 읽는 중…' : '파일 고르기'}</button><input id="reflectionFiles" type="file" accept=".txt,text/plain" multiple hidden><p class="small-note">여러 파일을 한 번에 선택할 수 있습니다. 압축 파일은 먼저 풀어 주세요. 파일은 이 컴퓨터 안에서만 읽습니다.</p></div><div class="collect-controls"><button type="button" class="reflection-link" data-clear-collected ${loading ? 'disabled' : ''}>이 화면 목록 비우기</button></div><p class="collect-summary" role="status">전체 수합 ${collected.length}명 · ${filter ? `2-${filter}반 ${students.length}명` : '반을 선택해 주세요'} · 제외한 파일 ${rejected.length}개</p><div class="collect-table-wrap"><table class="collect-table"><thead><tr><th>학번</th><th>학생 이름</th><th>반</th><th>쓴 곳</th><th>확인할 것</th></tr></thead><tbody>${students.map(s => `<tr><td>${esc(s.no)}</td><td>${esc(s.name)}</td><td>2-${s.classNo}</td><td>${s.items.length}/${allStops(s.classNo).length}</td><td>${esc(s.warnings.join(' '))}</td></tr>`).join('')}${rejected.map(s => `<tr class="collect-error"><td colspan="4">${esc(s.file)}</td><td>${esc(s.reason)}</td></tr>`).join('')}</tbody></table></div><button class="reflection-button full" type="button" data-download-xlsx ${loading || !students.some(s=>s.items.length) ? 'disabled' : ''}>${filter ? `2-${filter}반 살핌 양식 엑셀 받기` : '반 선택 후 엑셀 받기'}</button><p id="xlsxDownloadStatus" role="status"></p><p class="small-note">첫 시트 ‘설문응답’: 학번·이름·장소별 질문, 학생마다 한 행. 둘째 시트 ‘모아 보기’: 학생·장소별 상세 글. 살핌 명단의 학번 체계와 학생 이름이 일치해야 합니다.</p><p class="small-note">같은 학번 파일은 나중에 저장한 파일을 사용합니다. 4자리·5자리 학번이 섞였거나 이름이 다르면 표에 표시합니다. 사이트로 제출한 글은 서버에 저장되어 다른 선생님도 해당 반에서 확인할 수 있습니다. 별도로 가져온 파일은 이 화면에서만 처리하며 새로고침하면 비워집니다.</p></article>`;
  }
  const encode = s => { let binary=''; for(const byte of new TextEncoder().encode(s)) binary+=String.fromCharCode(byte); return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); };
  const decode = s => new TextDecoder('utf-8', {fatal:true}).decode(Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)));
  function buildFile() {
    const { me, book } = state(), error = identityProblem(me.no, me.name);
    if (error) throw Error(error);
    const items = stops(itinerary).filter(s => book[s.id]?.text.trim()).map(s => ({s:s.id,d:s.group,t:s.title,q:prompt(s),a:book[s.id].text.trim(),u:book[s.id].updatedAt}));
    if (!items.length) throw Error('장소별 느낀 점을 먼저 작성해 주세요.');
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
  async function addFiles(files) {
    if(loading) return; loading=true; onRender();
    try {
      for(const file of Array.from(files)) {
        try {
          if(!/\.txt$/i.test(file.name) || file.size>500000) throw Error('.txt 파일만 받을 수 있습니다. 파일당 최대 500KB입니다.');
          const s=parseFile(await file.text()); s.file=file.name;
          const key=s=>`${s.classNo}:${s.no.slice(-2)}`;
          const index=collected.findIndex(prev=>key(prev)===key(s));
          if(index>=0) {
            const prev=collected[index], keepNew=(Date.parse(s.savedAt)||0)>=(Date.parse(prev.savedAt)||0), kept=keepNew?s:prev;
            kept.warnings.push('중복 학번: 나중에 저장한 파일을 사용했습니다.');
            if(prev.name!==s.name) kept.warnings.push('동일 학번의 학생 이름이 다릅니다. 확인해 주세요.');
            if(prev.no.length!==s.no.length) kept.warnings.push('동일 학생의 4·5자리 학번이 섞여 있습니다.');
            collected[index]=kept;
          } else collected.push(s);
        } catch(error) { rejected.push({file:file.name,reason:error.message}); }
      }
      collected.sort((a,b)=>a.classNo-b.classNo || Number(a.no.slice(-2))-Number(b.no.slice(-2)));
    } finally { loading=false; onRender(); }
  }
  async function loadClass(n){
    if(loading||!n)return;loading=true;collectionMessage='2-'+n+'반 제출 현황을 불러오는 중…';onRender();
    try{const res=await fetch('/teacher/api/reflections?class='+n,{cache:'no-store'});if(res.status===401){location.replace('/teacher');return;}const result=await res.json();if(!res.ok)throw Error(result.error||'불러오지 못했습니다.');
      for(const data of result.students){const student=parseFile(fileText(data)),index=collected.findIndex(s=>s.classNo===student.classNo&&s.no.slice(-2)===student.no.slice(-2));if(index<0)collected.push(student);else if(Date.parse(student.savedAt)>=Date.parse(collected[index].savedAt))collected[index]=student;}
      collected.sort((a,b)=>a.classNo-b.classNo||Number(a.no.slice(-2))-Number(b.no.slice(-2)));loadedClasses.add(n);collectionMessage='2-'+n+'반 사이트 제출 '+result.students.length+'명을 확인했습니다.';
    }catch(error){collectionMessage=error.message;}finally{loading=false;onRender();}
  }
  const oneLine = s => String(s).replace(/_(?=x[0-9a-f]{4}_)/gi,'＿').replace(/[\r\n\u0085\u2028\u2029]+/g,' ').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').trim();
  function workbook(students = filtered()) {
    const qs=questionsFor(filter==='all'?Array.from({length:10},(_,i)=>i+1):[Number(filter)]);
    const question=s=>oneLine(`[${s.group}일차 ${s.title}] ${s.q}`).replace(/[:：]/g,' · ');
    const rows=[['학번','이름',...qs.map(question)]], read=[['학번','이름','반','일차','날짜·시각','장소','질문','느낀 점']];
    students.forEach(s=>{
      const answers=new Map(s.items.map(it=>[itemKey(it),it.a]));
      rows.push([s.no,s.name,...qs.map(q=>oneLine(answers.get(`${q.group}:${q.id}`)||''))]);
      s.items.forEach(it=>{const program=window.GUIDE_DATA.programs[window.GUIDE_DATA.classes[s.classNo].team], stop=program.slides.find(q=>q.id===it.s);read.push([s.no,s.name,`2-${s.classNo}`,`${it.d}일차`,`${program.days[it.d].date} ${stop.time}`,it.t,it.q,it.a]);});
    });
    const wb=XLSX.utils.book_new();
    for(const [name,values] of [['설문응답',rows],['모아 보기',read]]) {
      const sheet=XLSX.utils.aoa_to_sheet(values); sheet['!cols']=values[0].map((_,i)=>({wch:i===0?8:i===1?10:42})); XLSX.utils.book_append_sheet(wb,sheet,name);
    }
    return wb;
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
    if(e.target.id==='reflectionClassFilter'){filter=e.target.value;onRender();if(filter)void loadClass(Number(filter));}
    if(e.target.id==='reflectionFiles'){const files=[...e.target.files];e.target.value='';void addFiles(files);}
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
    if(e.target.closest('[data-pick-reflections]'))document.getElementById('reflectionFiles').click();
    if(e.target.closest('[data-restore-reflections]'))document.getElementById('restoreReflectionFile').click();
    if(e.target.closest('[data-focus-reflection]')){const box=document.querySelector('.reflection-box');box?.scrollIntoView({behavior:'smooth',block:'start'});box?.querySelector('textarea')?.focus({preventScroll:true});}
    const classButton=e.target.closest('[data-collect-class]');if(classButton){filter=classButton.dataset.collectClass;onRender();void loadClass(Number(filter));}
    if(e.target.closest('[data-refresh-submissions]'))void loadClass(Number(filter));
    if(e.target.closest('[data-clear-collected]')){collected=[];rejected=[];loadedClasses.clear();collectionMessage='이 화면의 목록을 비웠습니다. 서버 제출 내역은 유지됩니다.';onRender();}
    if(e.target.closest('[data-download-reflections]')){
      const status=document.getElementById('reflectionDownloadStatus');
      try {const data=buildFile();download(new Blob(['\uFEFF'+fileText(data)],{type:'text/plain;charset=utf-8'}),`${data.no}_${data.name.replace(/[\\/:*?"<>|\s]/g,'')}_느낀점.txt`);status.textContent='파일을 받았습니다. 선생님이 안내한 제출처에 내세요.';}catch(error){status.textContent=error.message;}
    }
    if(e.target.closest('[data-download-xlsx]')){
      const status=document.getElementById('xlsxDownloadStatus');
      try {if(!filtered().length)throw Error('학생 파일을 먼저 골라 주세요.');const bytes=XLSX.write(workbook(),{type:'array',bookType:'xlsx'});download(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),`제주2026_${filter==='all'?'전체반':`2-${filter}반`}_느낀점_살핌양식.xlsx`);status.textContent=`학생 ${filtered().length}명의 살핌 양식 엑셀을 받았습니다.`;}catch{status.textContent='엑셀을 만들지 못했습니다. 파일을 확인한 뒤 다시 시도해 주세요.';}
    }
  });
  document.addEventListener('dragover',e=>{const drop=e.target.closest('#reflectionDrop');if(drop){e.preventDefault();drop.classList.add('drag-over');}});
  document.addEventListener('dragleave',e=>{const drop=e.target.closest('#reflectionDrop');if(drop&&!drop.contains(e.relatedTarget))drop.classList.remove('drag-over');});
  document.addEventListener('drop',e=>{const drop=e.target.closest('#reflectionDrop');if(drop){e.preventDefault();drop.classList.remove('drag-over');void addFiles(e.dataTransfer.files);}});
  window.GUIDE_REFLECTIONS={
    setContext(n,list,rerender){if(classNo!==n)filter=String(n);classNo=n;itinerary=list;onRender=rerender;},
    reflectionHtml,afterHtml,collectHtml,parseFile,buildFile,fileText,workbook,
    sideHtml(type){return `<div class="reflection-side"><span>JEJU 2026 · AFTER THE TRIP</span><h2>${type==='collect'?'학생의 경험을<br>한 파일에 모아요':'장소를 떠올리며<br>나의 경험을 기록해요'}</h2><p>${type==='collect'?'파일 고르기 또는 끌어다 놓기 → 반별 확인 → 살핌 양식 엑셀 받기':'장소별 느낀 점 작성 → 내 느낀 점 저장 → 안내받은 제출처에 파일 제출'}</p><img src="assets/seongsan.jpg" alt="제주 성산일출봉 풍경"><p>학생 정보와 글은 서버로 전송하지 않습니다.</p></div>`;}
  };
})();
