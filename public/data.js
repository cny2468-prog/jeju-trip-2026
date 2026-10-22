// Timetable: 2026 grade 2 Jeju field-trip plan, class 2-5 (B team).
// Bus grouping and return stop: accompanying meeting notes and user clarification.
// Coordinates are map reference points for the named places, not a driving route.
window.GUIDE_DATA = {
  classes: {
    1:{boys:[[243,5],[244,5]],girls:[[216,4],[217,5],[218,5]],bus:"1반 탑승 버스",busNote:"1~4반은 총 3대로 이동합니다. 1반은 1반 탑승 버스를 이용합니다.",departureGroups:[["1반","1반 탑승 버스"]]},
    2:{boys:[[241,5],[242,5]],girls:[[213,4],[214,4],[215,4]],bus:"2반 · 4반 A팀 동승",busNote:"1~4반은 총 3대로 이동합니다. 4반 A팀이 2반 버스에 함께 탑승합니다.",departureGroups:[["2반 전체 · 4반 A팀","2반 탑승 버스"]]},
    3:{boys:[[237,4],[239,4],[240,5]],girls:[[211,4],[212,4]],bus:"3반 · 4반 B팀 동승",busNote:"1~4반은 총 3대로 이동합니다. 4반 B팀이 3반 버스에 함께 탑승합니다.",departureGroups:[["3반 전체 · 4반 B팀","3반 탑승 버스"]]},
    4:{boys:[[235,5],[238,4]],girls:[[207,5],[209,4],[210,4]],bus:"A팀 → 2반 버스 · B팀 → 3반 버스",busNote:"1~4반은 총 3대로 이동합니다. 4반 A팀은 2반, B팀은 3반과 함께 탑승합니다.",departureGroups:[["4반 A팀","2반과 함께 탑승"],["4반 B팀","3반과 함께 탑승"]]},
    5:{boys:[[236,6]],girls:[[205,5],[206,5],[208,4]],bus:"A팀 → 6반 버스 · B팀 → 7반 버스",busNote:"5~7반은 총 2대로 이동합니다. 5반 A팀은 6반, B팀은 7반과 함께 탑승합니다.",departureGroups:[["5반 A팀","6반과 함께 탑승"],["5반 B팀","7반과 함께 탑승"]]},
    6:{boys:[[231,4],[232,4],[233,4],[234,4]],girls:[[203,5],[204,4]],bus:"6반 · 5반 A팀 동승",busNote:"5~7반은 총 2대로 이동합니다. 5반 A팀이 6반 버스에 함께 탑승합니다.",departureGroups:[["6반 전체 · 5반 A팀","6반 탑승 버스"]]},
    7:{boys:[[229,5],[230,5]],girls:[[201,5],[202,5],[303,4]],bus:"7반 · 5반 B팀 동승",busNote:"5~7반은 총 2대로 이동합니다. 5반 B팀이 7반 버스에 함께 탑승합니다.",departureGroups:[["7반 전체 · 5반 B팀","7반 탑승 버스"]]},
    8:{boys:[[227,5],[228,5]],girls:[[304,5],[305,6]],bus:"A팀 → 9반 버스 · B팀 → 10반 버스",busNote:"8~10반은 총 2대로 이동합니다. 8반 A팀은 9반, B팀은 10반과 함께 탑승합니다.",departureGroups:[["8반 A팀","9반과 함께 탑승"],["8반 B팀","10반과 함께 탑승"]]},
    9:{boys:[[225,5],[226,6]],girls:[[306,5],[307,5],[308,5]],bus:"9반 · 8반 A팀 동승",busNote:"8~10반은 총 2대로 이동합니다. 8반 A팀이 9반 버스에 함께 탑승합니다.",departureGroups:[["9반 전체 · 8반 A팀","9반 탑승 버스"]]},
    10:{boys:[[223,5],[224,5]],girls:[[309,5],[310,4],[311,5]],bus:"10반 · 8반 B팀 동승",busNote:"8~10반은 총 2대로 이동합니다. 8반 B팀이 10반 버스에 함께 탑승합니다.",departureGroups:[["10반 전체 · 8반 B팀","10반 탑승 버스"]]}
  },
  points: {
    school: [37.7284825, 127.0675133],
    gimpo: [37.5590078, 126.7942403],
    returnStop: [37.7302594, 127.0593053],
    jeju: [33.506581, 126.4931953],
    jetboat: [33.2440082, 126.416316],
    beach: [33.2448545, 126.4090386],
    resort: [33.273235, 126.70084],
    osulloc: [33.305366, 126.2880219],
    cliff: [33.2369581, 126.4241253],
    soesokkak: [33.2512389, 126.6180588],
    wind: [33.2894549, 126.5876107],
    seongsan: [33.4588891, 126.9408178],
    laf: [33.4568431, 126.7150389],
    peace: [33.4516406, 126.6189461],
    market: [33.5122386, 126.5275862]
  },
  names: {
    school: '발곡고', gimpo: '김포공항', returnStop: '서해아파트 정류장 일대', jeju: '제주공항', jetboat: '제트보트',
    beach: '중문 해수욕장', resort: '금호리조트-큰엉', osulloc: '오설록',
    cliff: '대포주상절리', soesokkak: '쇠소깍', wind: '윈드1947',
    seongsan: '성산일출봉', laf: '제주 라프', peace: '4·3평화공원', market: '동문시장'
  },
  routes: {
    1: ['school', 'gimpo', 'jeju', 'jetboat', 'beach', 'resort'],
    2: ['resort', 'osulloc', 'cliff', 'soesokkak', 'wind', 'resort'],
    3: ['resort', 'seongsan', 'laf', 'peace', 'market', 'jeju', 'gimpo', 'returnStop']
  },
  photos: {
    school: { src: 'assets/balgok-field.png', alt: '발곡고등학교 건물과 운동장 전경', credit: '발곡고등학교 공식 홈페이지', url: 'https://balgok-h.goeujb.kr/balgok-h/main.do' },
    gimpo: { src:'assets/gimpo.jpg',alt:'김포국제공항 국내선 터미널 전경',credit:'Hajoon0102 · Wikimedia Commons',url:'https://commons.wikimedia.org/wiki/File:GMP_domestic.jpg' },
    jejuAirport: { src:'assets/jejuAirport.jpg',alt:'제주국제공항 전경',credit:'螺钉 · CC BY-SA 3.0 · Wikimedia Commons',url:'https://commons.wikimedia.org/wiki/File:Jeju_International_Airport.jpg' },
    jetboat: { src:'assets/jetboat.webp',alt:'제주 중문 앞바다의 제트보트 체험 모습',credit:'비짓제주',url:'https://www.visitjeju.net/en/detail/view?contentsid=CNTS_000000000022073' },
    wind: { src:'assets/wind-track.jpg',alt:'윈드1947 카트 트랙 전경',credit:'윈드1947 공식 홈페이지',url:'http://www.sklec.com/' },
    laf: { src:'assets/laf.webp',alt:'제주 라프에서 짚라인을 타는 모습',credit:'비짓제주',url:'https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500006' },
    resort: { src:'assets/resort.jpg',alt:'금호리조트-큰엉 건물 전경',credit:'Tripadvisor 사진',url:'https://www.tripadvisor.co.kr/Hotel_Review-g297892-d4329394-Reviews-Kumho_Jeju_Resort-Seogwipo_Jeju_Island.html' },
    seongsan: { src: 'assets/seongsan.jpg', alt: '제주 성산일출봉 전경', credit: '螺钉 · CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Seongsan_Ilchulbong.jpg' },
    osulloc: { src: 'assets/osulloc.jpg', alt: '오설록 티뮤지엄과 녹차밭', credit: 'Matt Kieffer · CC BY-SA 2.0', url: 'https://commons.wikimedia.org/wiki/File:Osulloc_Tea_Museum_%26_Fields,_Jeju.jpg' },
    olle: { src: 'assets/olle.jpg', alt: '제주 올레길 6코스의 해안 풍경', credit: 'Jeju Olle Foundation · CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Jejuolle-route-06(5).jpg' },
    peace: { src: 'assets/peace.jpg', alt: '제주 4·3평화공원 전경', credit: 'Ayn tran · CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Jeju_4.3_Peace_Park,_Jeju_Island,_South_Korea,_June2016.jpg' },
    beach: { src: 'assets/beach.jpg', alt: '중문 색달 해변 전경', credit: 'Giuseppe Milo · CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Jungmun_Saekdal_Beach,_South_Korea.jpg' },
    cliff: { src: 'assets/cliff.jpg', alt: '대포주상절리의 바닷가 절벽', credit: 'Bernard Gagnon · CC0', url: 'https://commons.wikimedia.org/wiki/File:Daepo_Jusangjeolli_Cliff_04.jpg' },
    soesokkak: { src: 'assets/soesokkak.jpg', alt: '제주 쇠소깍 풍경', credit: '골뱅이 · CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Soesokkak,_Jeju_(%EC%A0%9C%EC%A3%BC_%EC%87%A0%EC%86%8C%EA%B9%8D)_-_panoramio.jpg' },
    market: { src: 'assets/market.jpg', alt: '제주 동문시장 풍경', credit: 'Abasaa · Public domain', url: 'https://commons.wikimedia.org/wiki/File:Dongmun_Market_01.JPG' }
  },
  tourism: {
    jetboat: {
      items: ['빠르게 달리는 보트 위에서 중문 앞바다와 해안선을 바라보세요.', '방향을 바꿀 때 느껴지는 속도감과 물보라가 이 체험의 포인트예요.', '탑승 전 구명조끼와 안전 안내를 확인하세요.'],
      sources: [{ label: '비짓제주 · 중문 해양레저', url: 'https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_000000000022073' }]
    },
    beach: {
      items: ['활처럼 굽은 백사장과 제주 바다의 넓은 풍경을 살펴보세요.', '흑색·백색·적색·회색이 섞인 모래와 검은 화산암을 비교해 보세요.', '계단 쪽 해녀상도 제주 해녀 문화를 떠올리게 하는 볼거리예요.'],
      sources: [{ label: '비짓제주 · 중문색달해수욕장', url: 'https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500604' }]
    },
    osulloc: {
      items: ['티뮤지엄 주변에 펼쳐진 서광 차밭의 초록 풍경을 살펴보세요.', '실내에서는 차의 역사와 문화를 소개하는 공간을 볼 수 있어요.', '차밭과 곶자왈 숲을 향한 전망도 이곳의 특징입니다.'],
      sources: [{ label: '비짓제주 · 오설록 티뮤지엄', url: 'https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500457' }]
    },
    cliff: {
      items: ['현무암이 식으며 갈라져 만들어진 4~6각형 돌기둥을 찾아보세요.', '기둥이 층층이 이어지는 절벽과 그 아래로 부딪히는 파도를 함께 볼 수 있어요.', '전망대에서는 난간 안쪽에서 해안 지형을 관찰하세요.'],
      sources: [{ label: '비짓제주 · 중문·대포해안 주상절리대', url: 'https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_000000000020476' }]
    },
    soesokkak: {
      items: ['효돈천의 민물과 바닷물이 만나는 물길, 검은 현무암과 숲을 살펴보세요.', '이곳은 제주올레 6코스의 시작점입니다. 길 표식을 찾아보세요.', '도보 구간에서는 해안과 마을 풍경이 어떻게 이어지는지 눈여겨보세요.'],
      sources: [{ label: '비짓제주 · 쇠소깍', url: 'https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500384' }, { label: '비짓제주 · 올레 6코스', url: 'https://m.visitjeju.net/kr/detail/view?contentsid=CNTS_000000000020298' }]
    },
    wind: {
      items: ['카트 체험에서는 트랙의 굽은 구간을 따라 달리는 느낌을 살펴보세요.', '서바이벌 체험에서는 팀워크와 안전 장비 사용이 핵심이에요.', '두 체험 모두 출발 전 현장 안내와 탑승 조건을 확인하세요.'],
      sources: [{ label: '윈드1947 · 카트 안내', url: 'https://www.sklec.com/pages.php?p=1_1_1_1' }, { label: '윈드1947 · 서바이벌 안내', url: 'https://sklec.com/bbs/board.php?bo_table=6_2_1_1&wr_id=10' }]
    },
    seongsan: {
      items: ['얕은 바다에서 일어난 화산활동으로 만들어진 응회구의 형태를 살펴보세요.', '탐방로에서 정상에 오르면 큰 분화구와 성산 앞바다, 우도 방향을 조망할 수 있어요.', '정상 탐방 여부와 걷는 범위는 현장 일정에 따르세요.'],
      sources: [{ label: '비짓제주 · 성산일출봉', url: 'https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500349' }]
    },
    laf: {
      items: ['짚라인에서는 녹차밭과 거문오름 일대의 풍경을 내려다볼 수 있어요.', '짚라인 대신 족욕을 선택한 학생은 차분하게 쉬며 주변 풍경을 즐길 수 있어요.', '각 체험의 이용 순서와 안전 안내를 확인하세요.'],
      sources: [{ label: '제주라프 · 공식 안내', url: 'https://www.jejulaf.net/' }]
    },
    peace: {
      items: ['위령광장과 위령제단은 제주4·3 희생자를 추모하는 공간입니다.', '평화기념관 상설전시에서 사건의 역사와 기억을 살펴볼 수 있어요.', '추모 공간에서는 조용히 이동하고 현장 관람 동선을 따르세요.'],
      sources: [{ label: '제주4·3평화재단 · 공원 시설', url: 'https://jeju43peace.or.kr/kor/sub04_02_01.do' }]
    },
    market: {
      items: ['시장 골목에서 제주 감귤과 농수산물, 생활용품을 둘러보세요.', '오메기떡 등 제주 먹거리도 볼 수 있습니다. 실제 구매와 식사는 자유식 안내를 따르세요.', '시장이 넓고 출입구가 여럿이므로 이동 전 모이는 위치와 게이트 번호를 확인하세요.'],
      sources: [{ label: '비짓제주 · 동문재래시장', url: 'https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500745' }]
    }
  },
  days: {
    1: { label: '1일차', date: '10월 28일 수요일', short: '10/28 수', heading: '제주 도착, 중문 바다', lead: '학교에서 제주로, 중문 바다에서 첫날을 시작해요.', overview: 'day1' },
    2: { label: '2일차', date: '10월 29일 목요일', short: '10/29 목', heading: '오설록, 올레길, 카트', lead: '녹차밭과 해안을 지나 카트 체험까지 이어지는 하루예요.', overview: 'day2' },
    3: { label: '3일차', date: '10월 30일 금요일', short: '10/30 금', heading: '성산일출봉, 4·3평화공원', lead: '성산일출봉과 4·3평화공원을 거쳐 집으로 돌아와요.', overview: 'day3' }
  },
  timelines: {
    1: [
      { time: '09:30–10:00', title: '본교 운동장 집결 및 출발', slide: 'school' },
      { time: '10:40–11:10', title: '김포공항 도착·수속', slide: 'gimpo' },
      { time: '11:10–12:10', title: '점심 · 간편식', slide: 'gimpo' },
      { time: '12:55', title: '김포공항 출발', slide: 'gimpo' },
      { time: '14:05–14:45', title: '제주공항 도착·버스 탑승', slide: 'jeju-arrive' },
      { time: '15:40–16:40', title: '제트보트', slide: 'jetboat' },
      { time: '16:50–17:50', title: '중문 해수욕장', slide: 'beach' },
      { time: '18:20–19:20', title: '저녁 · 현지식', slide: 'beach' },
      { time: '20:20–20:50', title: '숙소 도착·객실 배정', slide: 'resort1' },
      { time: '22:00', title: '인원 점검·취침', slide: 'resort1' }
    ],
    2: [
      { time: '07:00–08:40', title: '기상·조식', slide: 'day2' },
      { time: '08:40–09:40', title: '전용버스 이동', slide: 'day2' },
      { time: '09:40–11:00', title: '오설록 티뮤지엄', slide: 'osulloc' },
      { time: '11:30–12:30', title: '점심 · 애슐리퀸즈', slide: 'osulloc' },
      { time: '12:50–13:50', title: '대포주상절리', slide: 'cliff' },
      { time: '14:30–15:30', title: '쇠소깍·제주 올레길 6코스', slide: 'soesokkak' },
      { time: '15:50–17:30', title: '윈드1947 카트·서바이벌', slide: 'wind' },
      { time: '17:50–19:00', title: '숙소·저녁식사', slide: 'resort2' },
      { time: '19:30–21:00', title: '레크리에이션', slide: 'resort2' },
      { time: '21:50–22:00', title: '인원 점검·취침', slide: 'resort2' }
    ],
    3: [
      { time: '07:00–09:30', title: '기상·조식', slide: 'day3' },
      { time: '10:00', title: '전용버스 출발', slide: 'day3' },
      { time: '10:30–11:30', title: '성산일출봉', slide: 'seongsan' },
      { time: '12:00–13:00', title: '점심 · 흑돼지 수제버거', slide: 'laf' },
      { time: '13:00–14:30', title: '제주 라프 · 짚라인/족욕', slide: 'laf' },
      { time: '15:00–16:00', title: '제주 4·3평화공원', slide: 'peace' },
      { time: '16:30–18:30', title: '동문시장·저녁 자유식', slide: 'market' },
      { time: '19:00', title: '제주공항 도착·수속', slide: 'jeju-depart' },
      { time: '20:55', title: '제주공항 출발', slide: 'jeju-depart' },
      { time: '22:05', title: '김포공항 도착 후 버스 탑승', slide: 'return' },
      { time: '23:30경', title: '서해아파트 정류장 하차·종례 후 귀가', slide: 'return' }
    ]
  },
  slides: [
    { id: 'cover', group: 'before', title: '제주 2박 3일, 한 장씩 따라가요', subtitle: '반을 선택해 객실과 버스를 확인하세요.', type: 'cover' },
    { id: 'bus', group: 'before', title: '학교에서 김포공항까지', subtitle: '반별 버스 배차를 확인하세요.', type: 'bus', point: 'school' },
    { id: 'ready', group: 'before', title: '출발 전에 챙길 것', subtitle: '집결 시간과 주민등록초본을 먼저 확인하세요.', type: 'ready', point: 'school' },
    { id: 'rooms', group: 'before', title: '객실 번호와 피난 대피도', subtitle: '배정된 객실과 비상구를 확인하세요.', type: 'rooms', point: 'resort' },
    { id: 'cautions-general', group: 'before', title: '전체 유의사항 · 기본과 이동', subtitle: '집합, 버스, 공항에서 지킬 약속', type: 'cautions', section: 'general' },
    { id: 'cautions-activity', group: 'before', title: '전체 유의사항 · 체험과 숙소', subtitle: '체험장과 객실에서 지킬 약속', type: 'cautions', section: 'activity' },
    { id: 'cautions-emergency', group: 'before', title: '전체 유의사항 · 건강과 비상', subtitle: '아프거나 위험할 때의 행동', type: 'cautions', section: 'emergency' },
    { id: 'day1', group: 1, title: '1일차 한눈에 보기', subtitle: '제주에 닿는 날', type: 'overview', photo: 'beach' },
    { id: 'day2', group: 2, title: '2일차 한눈에 보기', subtitle: '제주의 자연과 체험을 만나는 날', type: 'overview', photo: 'osulloc' },
    { id: 'day3', group: 3, title: '3일차 한눈에 보기', subtitle: '제주를 기억하고 돌아오는 날', type: 'overview', photo: 'seongsan' },
    { id: 'school', group: 1, title: '본교 운동장 집결 및 출발', subtitle: '본교 운동장에서 모여 배정된 버스를 탑니다.', type: 'stop', time: '09:30–10:00', point: 'school', category: '이동', address: '본교 운동장', photo:'school', body: ['09:30까지 본교 운동장에 모여 출석과 인원을 확인합니다.', '본인 반의 버스 안내를 확인하고 김포공항으로 이동합니다.'] },
    { id: 'gimpo', group: 1, title: '김포공항', subtitle: '수속을 마치고 제주행 비행기에 올라요.', type: 'stop', time: '10:40–12:55', point: 'gimpo', category: '항공', address: '김포국제공항', photo:'gimpo', body: ['공항 도착 후 수속을 하고 간편식으로 점심을 먹습니다.', '주민등록번호 뒷자리까지 모두 표시된 주민등록초본을 준비하고, 배터리는 직접 가지고 탑승하세요.'] },
    { id: 'jeju-arrive', group: 1, title: '제주공항 도착', subtitle: '제주에서 학급별 전용버스를 탑니다.', type: 'stop', time: '14:05–14:45', point: 'jeju', category: '이동', address: '제주국제공항', photo:'jejuAirport', body: ['도착 후 인원을 확인하고 학급별 전용버스에 탑승합니다.', '이후 중문으로 이동해 첫 체험을 시작합니다.'] },
    { id: 'jetboat', group: 1, title: '제트보트', subtitle: '중문 바다에서 첫 체험을 시작해요.', type: 'stop', time: '15:40–16:40', point: 'jetboat', category: '체험', address: '중문 관광단지 일대', photo:'jetboat', body: ['제트보트 체험 시간은 15:40–16:40입니다.', '탑승 순서와 현장 안전 안내에 따라 이동합니다.'] },
    { id: 'beach', group: 1, title: '중문 해수욕장', subtitle: '첫날의 바다를 보고 저녁을 먹어요.', type: 'stop', time: '16:50–17:50', point: 'beach', category: '자연', address: '중문 색달 해변', photo: 'beach', body: ['중문 해수욕장을 둘러보는 시간은 16:50–17:50입니다.', '18:20–19:20에는 한라가든에서 현지식으로 저녁을 먹습니다.'] },
    { id: 'resort1', group: 1, title: '금호리조트-큰엉', subtitle: '객실을 배정받고 첫날을 마무리해요.', type: 'stop', time: '20:20–22:00', point: 'resort', category: '숙소', address: '서귀포시 남원읍 태위로 522-12', photo:'resort', body: ['20:20–20:50 숙소 도착 후 객실을 배정받습니다.', '20:50부터 개인 정비를 하고, 22:00 인원 점검 후 취침합니다.', '객실 번호와 피난 대피도는 숙소 안내 페이지에서 확인하세요.'] },
    { id: 'osulloc', group: 2, title: '오설록 티뮤지엄', subtitle: '녹차밭에서 둘째 날을 시작해요.', type: 'stop', time: '09:40–11:00', point: 'osulloc', category: '문화', address: '제주 오설록 티뮤지엄', photo: 'osulloc', body: ['07:00–08:40 숙소에서 조식 후 08:40 전용버스로 출발합니다.', '09:40–11:00 오설록 티뮤지엄을 방문합니다.', '11:30–12:30 점심은 애슐리퀸즈 프리미엄 뷔페입니다.'] },
    { id: 'cliff', group: 2, title: '대포주상절리', subtitle: '화산이 만든 제주 해안을 살펴봐요.', type: 'stop', time: '12:50–13:50', point: 'cliff', category: '자연', address: '제주중문대포해안 주상절리대', photo: 'cliff', body: ['대포주상절리 방문 시간은 12:50–13:50입니다.', '이후 쇠소깍과 제주 올레길 6코스로 이동합니다.'] },
    { id: 'soesokkak', group: 2, title: '쇠소깍 · 제주 올레길 6코스', subtitle: '물길과 바닷길을 따라 걸어요.', type: 'stop', time: '14:30–15:30', point: 'soesokkak', category: '자연', address: '쇠소깍 · 제주 올레길 6코스', photo: 'soesokkak', extraPhoto: 'olle', body: ['14:30–15:30 쇠소깍과 제주 올레길 6코스를 둘러봅니다.', '도보 이동과 집결 시각은 현장 안내를 따릅니다.'] },
    { id: 'wind', group: 2, title: '윈드1947', subtitle: '카트와 서바이벌 체험 시간이에요.', type: 'stop', time: '15:50–17:30', point: 'wind', category: '체험', address: '서귀포시 토평공단로 78-27', photo:'wind', body: ['15:50–17:30 윈드1947에서 카트와 서바이벌 체험을 합니다.', '안전 장비 착용과 현장 안내를 확인하세요.'] },
    { id: 'resort2', group: 2, title: '숙소 · 레크리에이션', subtitle: '저녁을 먹고 함께 하루를 마무리해요.', type: 'stop', time: '17:50–22:00', point: 'resort', category: '숙소', address: '금호리조트-큰엉 · 서귀포시 남원읍 태위로 522-12', photo:'resort', body: ['17:50 숙소 도착 후 18:00–19:00 숙소에서 저녁식사를 합니다.', '19:30–21:00 레크리에이션, 21:50–22:00 인원 점검 후 취침합니다.'] },
    { id: 'seongsan', group: 3, title: '성산일출봉', subtitle: '제주의 동쪽에서 마지막 날을 시작해요.', type: 'stop', time: '10:30–11:30', point: 'seongsan', category: '자연', address: '제주 성산일출봉', photo: 'seongsan', body: ['07:00–09:30 기상 및 조식 후 10:00 전용버스로 이동합니다.', '10:30–11:30 성산일출봉을 방문합니다.'] },
    { id: 'laf', group: 3, title: '제주 라프', subtitle: '짚라인 또는 족욕으로 체험을 마쳐요.', type: 'stop', time: '13:00–14:30', point: 'laf', category: '체험', address: '제주시 조천읍 선교로 115-1', photo:'laf', body: ['12:00–13:00 라푸드에서 흑돼지 수제버거 세트로 점심을 먹습니다.', '13:00–14:30 제주 라프에서 짚라인을 체험합니다. 짚라인을 타지 않는 학생은 족욕으로 대체합니다.'] },
    { id: 'peace', group: 3, title: '제주 4·3평화공원', subtitle: '제주의 역사를 기억하는 시간이에요.', type: 'stop', time: '15:00–16:00', point: 'peace', category: '역사', address: '제주 4·3평화공원', photo: 'peace', body: ['15:00–16:00 제주 4·3평화공원을 방문합니다.', '다음 장소는 동문시장입니다.'] },
    { id: 'market', group: 3, title: '동문시장', subtitle: '제주에서의 마지막 저녁을 보내요.', type: 'stop', time: '16:30–18:30', point: 'market', category: '시장', address: '제주 동문시장', photo: 'market', body: ['16:30–18:30 동문시장을 둘러보고 자유식으로 저녁을 먹습니다.', '19:00 제주공항 도착을 목표로 이동합니다.'] },
    { id: 'jeju-depart', group: 3, title: '제주공항에서 출발', subtitle: '수속 후 김포행 비행기에 올라요.', type: 'stop', time: '19:00–20:55', point: 'jeju', category: '항공', address: '제주국제공항', photo:'jejuAirport', body: ['19:00 제주공항에 도착해 수속을 준비합니다.', '20:55 제주공항에서 김포공항으로 출발합니다.'] },
    { id: 'return', group: 3, title: '김포공항 → 서해아파트 정류장', subtitle: '정류장에서 종례를 마친 뒤 귀가해요.', type: 'stop', time: '22:05–23:30경', point: 'returnStop', category: '귀가', address: '의정부 서해아파트 정류장 일대', photo:'school', body: ['22:05 김포공항에 도착합니다.', '김포공항에서 버스를 타고 학교 방향으로 이동합니다.', '버스는 23:30경 서해아파트 정류장에 도착할 예정입니다. 정류장에서 하차한 뒤 종례를 하고 귀가합니다.'] }
  ]
};
