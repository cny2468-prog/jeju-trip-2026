(() => {
  const data = window.GUIDE_ASSIGNMENTS;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const hosts = {1:1,2:2,3:3,4:6,5:7,6:9,7:10};
  function buses(classNo) {
    const profile = data.classes[classNo];
    return `<section class="assignment-section" aria-label="왕복 버스 좌석 배정"><h2>학교↔김포공항 왕복 좌석표</h2><p class="small-note">학교 출발과 김포공항에서 돌아올 때 같은 배정 좌석을 확인하세요. 제주 현지 버스 좌석표와는 별개입니다.<br>좌석 위치는 운전석을 앞에 두고 바라본 방향입니다. 우리 반 이름은 주황색으로 표시됩니다.</p>${profile.buses.map((item,i) => {
      const bus = data.buses.find(b => b.number === item.number);
      const students = bus.seats.filter(s => s.kind === 'student' && s.classNo === classNo);
      return `<section class="assigned-bus" data-assignment-bus="${bus.number}"><h3>${profile.buses.length > 1 ? `<span class="bus-team-label">${String.fromCharCode(65+i)}팀 · ${item.count}명</span> ` : ''}${bus.number}호차${hosts[bus.number] !== classNo ? ` · 2-${hosts[bus.number]}반과 함께 탑승` : ''}</h3><div class="bus-seat-plan" aria-label="${bus.number}호차 좌석 배치"><div class="bus-front"><span>앞 · 운전석</span><span>출입문 →</span></div><div class="seat-position-key"><span>창가</span><span>통로</span><span>통로</span><span>창가</span></div>${Array.from({length:11},(_,r)=>`<div class="bus-seat-row"><span class="bus-row-label">${r+1}열</span>${bus.seats.filter(s=>s.row===r+1).map(s => {
        const mine=s.kind==='student' && s.classNo===classNo;
        return `<div class="bus-seat ${mine?'my-class-seat':s.kind}" ${mine?'data-my-seat':''} data-seat-cell="${s.sourceCell}" aria-label="${esc(s.label)} · ${mine?esc(s.name):s.kind==='student'?`2-${s.classNo}반`:s.kind==='staff'?'인솔석':'빈 좌석'}"><strong>${mine?esc(s.name):s.kind==='student'?`2-${s.classNo}반`:s.kind==='staff'?'인솔석':'—'}</strong><small>${s.place==='window'?'창가':'통로'}</small></div>`;
      }).join('')}</div>`).join('')}</div><details class="bus-name-list" open><summary>우리 반 탑승 명단 · ${students.length}명</summary><ul>${students.map(s=>`<li data-bus-roster-entry><strong>${esc(s.name)}</strong><span>${esc(s.label)}</span></li>`).join('')}</ul></details></section>`;
    }).join('')}<p class="small-note">귀가: 김포공항 도착 후 버스 탑승 → 23:30경 서해아파트 정류장 하차 → 종례 후 귀가</p></section>`;
  }
  function rooms(classNo) {
    const profile = data.classes[classNo];
    return `<section class="assignment-section" aria-label="반별 객실 명단"><h2>우리 반 객실 명단</h2><p class="small-note">방장을 포함한 실제 명단 기준 인원입니다. 내 객실 번호와 방장을 확인하세요.</p>${['boys','girls'].map(g=>`<h3>${g==='boys'?'남자':'여자'} 객실</h3><div class="room-rosters">${profile.rooms.filter(r=>r.gender===g).map(r=>`<section class="room-roster" data-roster-room="${r.number}"><header><h4>${r.number}호</h4><span>${r.count}명 · ${Math.floor(r.number/100)}층</span></header><ul>${r.members.map(n=>`<li data-room-member><span>${esc(n)}</span>${n===r.leader?'<b class="room-leader">방장</b>':''}</li>`).join('')}</ul></section>`).join('')}</div>`).join('')}</section>`;
  }
  window.GUIDE_ASSIGNMENT_UI = {buses, rooms};
})();
