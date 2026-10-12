// Student itinerary only. No staff identities or contact details are included.
(() => {
  const data = window.GUIDE_DATA;
  const base = data.slides;
  const templates = Object.fromEntries(base.map(slide => [slide.id, slide]));
  const before = base.filter(slide => slide.group === 'before');
  data.points.gwakji = [33.45122, 126.3058];
  data.points.pyoseon = [33.32723069299215, 126.83810144720462];
  data.names.gwakji = '곽지해수욕장';
  data.names.pyoseon = '표선해수욕장';
  const beachSources = {
    gwakji: 'https://visitjeju.net/kr/detail/view?contentsid=CONT_000000000500056',
    pyoseon: 'https://visitjeju.net/kr/detail/view?contentsid=CNTS_000000000001196'
  };
  for (const id of ['gwakji', 'pyoseon']) {
    data.photos[id] = {src:`assets/${id}.webp`, alt:`${data.names[id]} 바다와 백사장`, credit:'제주관광공사 비짓제주', url:beachSources[id]};
    templates[id] = {id, point:id, title:data.names[id], subtitle:'백사장을 걸으며 제주의 바다를 바라봐요.', type:'stop', category:'자연', photo:id, address:id === 'gwakji' ? '제주시 애월읍 곽지리' : '서귀포시 표선면 표선리'};
  }
  data.tourism.gwakji = {
    items:['하얀 모래사장과 검은 현무암이 만나는 해안 풍경을 살펴보세요.', '과물노천탕 주변에서 바닷가의 용천수 문화를 만나볼 수 있어요.', '백사장을 산책하며 바다와 수평선을 사진으로 남겨보세요.'],
    sources:[{label:'비짓제주 · 곽지해수욕장',url:beachSources.gwakji}]
  };
  data.tourism.pyoseon = {
    items:['넓게 펼쳐진 백사장과 잔잔한 바다를 함께 바라보세요.', '물이 빠질 때와 들어올 때 달라지는 모래사장과 해안선을 관찰해 보세요.', '해변 산책 중에는 정해진 이동 구역과 재집합 시각을 지켜요.'],
    sources:[{label:'비짓제주 · 표선해수욕장',url:beachSources.pyoseon}]
  };
  const flight = {
    A:{out:'12:50',land:'14:00',back:'20:55',arrival:'22:05'},
    B:{out:'12:55',land:'14:05',back:'20:55',arrival:'22:05'},
    C:{out:'12:55',land:'14:05',back:'21:00',arrival:'22:10'}
  };
  for (let n = 1; n <= 10; n++) {
    const team = n <= 4 ? 'A' : n <= 7 ? 'B' : 'C';
    data.classes[n].team = team;
    data.classes[n].flight = {...flight[team]};
    const boys = data.classes[n].boys.reduce((sum, [, count]) => sum + count, 0);
    const girls = data.classes[n].girls.reduce((sum, [, count]) => sum + count, 0);
    data.classes[n].students = {boys, girls, total:boys + girls};
    const busRange = team === 'A' ? '1~4호차' : team === 'B' ? '5~7호차' : '8~10호차';
    data.classes[n].jejuBus = `2-${n}반 전용버스 · ${team}팀 ${busRange} 중 배정`;
  }
  const departure = team => [
    ['09:30–10:00','본교 운동장 집결 및 출발','school'],
    ['10:40–11:10','김포공항 도착·수속','gimpo'],
    ['11:10–12:10','점심 · 간편식','gimpo'],
    [flight[team].out,'김포공항 출발 · 제주에어','gimpo'],
    [`${flight[team].land}–${team === 'A' ? '14:40' : '14:45'}`,'제주공항 도착·학급별 버스 탑승','jeju-arrive']
  ];
  const firstNight = team => [
    [team === 'A' ? '20:30–21:00' : '20:20–20:50','숙소 도착·객실 배정','resort1'],
    [team === 'A' ? '21:00–21:50' : '20:50–21:50','개인 정비','resort1'],
    ['22:00','인원 점검·취침','resort1']
  ];
  const secondNight = arrival => [
    [arrival,'숙소 도착','resort2'],
    ['18:00–19:00','저녁 · 숙소식','resort2'],
    ['19:30–21:00','레크리에이션','resort2'],
    ['21:50–22:00','인원 점검·취침','resort2']
  ];
  const home = team => [
    [team === 'C' ? '19:00–19:30' : '19:00','제주공항 도착·수속 준비','jeju-depart'],
    [flight[team].back,'제주공항 출발 · 제주에어','jeju-depart'],
    [flight[team].arrival,'김포공항 도착 후 귀가 버스 탑승','return'],
    ['23:30경','서해아파트 정류장 하차·종례 후 귀가','return']
  ];
  const commonLastDay = team => [
    ['07:00–09:30','기상·조식','seongsan'],
    ['10:00','학급별 전용버스 출발','seongsan'],
    ['10:30–11:30','성산일출봉','seongsan'],
    ['12:00–13:00','점심 · 라푸드 흑돼지 수제버거 세트','laf'],
    ['13:00–14:30','제주 라프 · 짚라인/족욕','laf'],
    ['15:00–16:00','제주 4·3평화공원','peace'],
    ['16:30–18:30','동문시장·저녁 자유식','market'],
    ...home(team)
  ];
  const rows = {
    A:{
      1:[...departure('A'),
        ['15:10–16:10','곽지해수욕장','gwakji'],
        ['16:40–18:00','오설록 티뮤지엄','osulloc'],
        ['18:30–19:30','저녁 · 한라가든 돼지구이','resort1'],
        ...firstNight('A')],
      2:[['07:00–09:00','기상·조식','soesokkak'],
        ['09:00','학급별 전용버스 탑승·이동','soesokkak'],
        ['09:20–10:20','쇠소깍·제주 올레길 6코스','soesokkak'],
        ['10:30–12:00','윈드1947 카트·서바이벌','wind'],
        ['12:30–13:30','점심 · 애슐리퀸즈 프리미엄 뷔페','wind'],
        ['13:50–14:50','대포주상절리','cliff'],
        ['15:00–16:00','제트보트','jetboat'],
        ...secondNight('17:00')],
      3:commonLastDay('A')
    },
    B:{
      1:[...departure('B'),
        ['15:40–16:40','제트보트','jetboat'],
        ['16:50–17:50','중문 해수욕장','beach'],
        ['18:20–19:20','저녁 · 한라가든 돼지구이','beach'],
        ...firstNight('B')],
      2:[['07:00–08:40','기상·조식','osulloc'],
        ['08:40–09:40','학급별 전용버스 이동','osulloc'],
        ['09:40–11:00','오설록 티뮤지엄','osulloc'],
        ['11:30–12:30','점심 · 애슐리퀸즈 프리미엄 뷔페','osulloc'],
        ['12:50–13:50','대포주상절리','cliff'],
        ['14:30–15:30','쇠소깍·제주 올레길 6코스','soesokkak'],
        ['15:50–17:30','윈드1947 카트·서바이벌','wind'],
        ...secondNight('17:50')],
      3:commonLastDay('B')
    },
    C:{
      1:[...departure('C'),
        ['15:40–16:40','대포주상절리','cliff'],
        ['16:50–17:50','제트보트','jetboat'],
        ['18:20–19:20','저녁 · 한라가든 돼지구이','resort1'],
        ...firstNight('C')],
      2:[['07:00–09:00','기상·조식','seongsan'],
        ['09:20','학급별 전용버스 탑승·이동','seongsan'],
        ['10:00–11:00','성산일출봉','seongsan'],
        ['11:30–12:30','점심 · 라푸드 흑돼지 수제버거 세트','laf'],
        ['12:30–14:00','제주 라프 · 짚라인/족욕','laf'],
        ['14:30–15:30','제주 4·3평화공원','peace'],
        ['16:00–17:00','표선해수욕장','pyoseon'],
        ...secondNight('17:30')],
      3:[['07:00–08:50','기상·조식','wind'],
        ['08:50','학급별 전용버스 탑승·이동','wind'],
        ['09:20–10:50','윈드1947 카트·서바이벌','wind'],
        ['11:00–12:00','쇠소깍·제주 올레길 6코스','soesokkak'],
        ['12:30–13:30','점심 · 애슐리퀸즈 프리미엄 뷔페','soesokkak'],
        ['14:00–15:30','오설록 티뮤지엄','osulloc'],
        ['16:30–18:30','동문시장·저녁 자유식','market'],
        ...home('C')]
    }
  };
  const stops = {
    A:{1:[['school','09:30–10:00'],['gimpo','10:40–12:50'],['jeju-arrive','14:00–14:40'],['gwakji','15:10–16:10'],['osulloc','16:40–18:00'],['resort1','20:30–22:00']],
      2:[['soesokkak','09:20–10:20'],['wind','10:30–12:00'],['cliff','13:50–14:50'],['jetboat','15:00–16:00'],['resort2','17:00–22:00']],
      3:[['seongsan','10:30–11:30'],['laf','13:00–14:30'],['peace','15:00–16:00'],['market','16:30–18:30'],['jeju-depart','19:00–20:55'],['return','22:05–23:30경']]},
    B:{1:[['school','09:30–10:00'],['gimpo','10:40–12:55'],['jeju-arrive','14:05–14:45'],['jetboat','15:40–16:40'],['beach','16:50–17:50'],['resort1','20:20–22:00']],
      2:[['osulloc','09:40–11:00'],['cliff','12:50–13:50'],['soesokkak','14:30–15:30'],['wind','15:50–17:30'],['resort2','17:50–22:00']],
      3:[['seongsan','10:30–11:30'],['laf','13:00–14:30'],['peace','15:00–16:00'],['market','16:30–18:30'],['jeju-depart','19:00–20:55'],['return','22:05–23:30경']]},
    C:{1:[['school','09:30–10:00'],['gimpo','10:40–12:55'],['jeju-arrive','14:05–14:45'],['cliff','15:40–16:40'],['jetboat','16:50–17:50'],['resort1','20:20–22:00']],
      2:[['seongsan','10:00–11:00'],['laf','12:30–14:00'],['peace','14:30–15:30'],['pyoseon','16:00–17:00'],['resort2','17:30–22:00']],
      3:[['wind','09:20–10:50'],['soesokkak','11:00–12:00'],['osulloc','14:00–15:30'],['market','16:30–18:30'],['jeju-depart','19:00–21:00'],['return','22:10–23:30경']]}
  };
  const dayMeta = {
    A:{1:['곽지 바다와 녹차밭','곽지해수욕장을 걷고 오설록에서 녹차밭을 만나요.','gwakji'],2:['올레길, 카트, 주상절리','쇠소깍에서 시작해 카트와 제트보트 체험으로 이어져요.','soesokkak'],3:['성산, 라프, 제주의 역사','성산일출봉과 라프, 4·3평화공원을 거쳐 돌아와요.','seongsan']},
    B:{1:['제트보트와 중문 바다','제트보트를 체험하고 중문 해수욕장을 둘러봐요.','beach'],2:['녹차밭, 올레길, 카트','오설록과 주상절리, 쇠소깍을 지나 카트를 체험해요.','osulloc'],3:['성산, 라프, 제주의 역사','성산일출봉과 라프, 4·3평화공원을 거쳐 돌아와요.','seongsan']},
    C:{1:['주상절리와 제트보트','대포주상절리를 보고 제트보트를 체험해요.','cliff'],2:['성산, 라프, 표선 바다','성산일출봉과 라프, 4·3평화공원, 표선해수욕장을 찾아가요.','pyoseon'],3:['카트, 올레길, 녹차밭','카트를 타고 쇠소깍과 오설록을 방문한 뒤 돌아와요.','wind']}
  };
  const subtitles = {jetboat:'안전 안내에 따라 바다 위 체험을 즐겨요.', beach:'백사장을 걸으며 중문 바다를 바라봐요.', osulloc:'녹차밭과 차 문화를 만나봐요.', seongsan:'제주 동쪽의 화산 지형을 살펴봐요.', peace:'제주의 역사를 기억하는 시간이에요.'};
  const reminders = {jetboat:'탑승 순서와 현장 안전 안내를 따릅니다.', wind:'안전 장비를 착용하고 카트·서바이벌 체험 안내를 확인하세요.', soesokkak:'도보 이동 구역과 재집합 시각을 확인하세요.', laf:'짚라인을 타지 않는 학생은 족욕으로 대체합니다.'};
  data.programs = {};
  for (const team of ['A','B','C']) {
    const days = {}, timelines = {}, detailSlides = [], routes = {}, overviewSlides = [];
    for (let day = 1; day <= 3; day++) {
      const [heading, lead, image] = dayMeta[team][day];
      days[day] = {...data.days[day],heading,lead};
      overviewSlides.push({...templates[`day${day}`],photo:image});
      timelines[day] = rows[team][day].map(([time,title,slide]) => ({time,title,slide}));
      const dayDetails = stops[team][day].map(([id,time]) => {
        const slide = {...templates[id],group:day,time};
        if (subtitles[id]) slide.subtitle = subtitles[id];
        slide.body = timelines[day].filter(entry => entry.slide === id).map(entry => `${entry.time} · ${entry.title}`);
        if (reminders[id]) slide.body.push(reminders[id]);
        if (id === 'gimpo') slide.body.push('필수 준비물: 주민등록번호 뒷자리까지 모두 표시된 주민등록초본과 여권을 준비하세요. 배터리는 직접 가지고 탑승하세요.');
        if (id === 'jeju-arrive') slide.body.push('인원을 확인한 뒤 학급별 전용버스를 탑니다.');
        if (id === 'resort1' || id === 'resort2') slide.body.push('객실 번호와 피난 대피도를 확인하고 생활 안내를 따르세요.');
        if (id === 'return') slide.body.push('김포공항에서 버스를 타고 학교 방향으로 이동합니다. 서해아파트 정류장에서 하차해 종례 후 귀가합니다.');
        return slide;
      });
      detailSlides.push(...dayDetails);
      routes[day] = dayDetails.map(slide => slide.point);
      if (day > 1) routes[day].unshift('resort');
      if (day === 3) routes[day].splice(routes[day].length - 1, 0, 'gimpo');
    }
    data.programs[team] = {days,timelines,routes,slides:[...before,...overviewSlides,...detailSlides]};
  }
})();
