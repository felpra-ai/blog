// 툰 시리즈 — 이름·소개·대표 얼굴 (블로그 v2 캐릭터 얼굴 이모티콘 재사용). 새 시리즈 = 여기 한 줄.
export interface ToonSeries { id: string; ko: string; en: string; koDesc: string; enDesc: string; face: string }

export const TOON_SERIES: ToonSeries[] = [
  { id: 'crypto', ko: '벵갈의 코인 일기', en: "Bengal's Crypto Diary",
    koDesc: '코인 담당 벵갈과 의장 !QAZ 의 하루 한 컷 시황.', enDesc: 'Bengal (crypto desk) and !QAZ, one market day at a time.',
    face: '/characters/v2/crypto/face/06_neutral.png' },
  { id: 'kr', ko: '코숏의 국장 일기', en: "Kosho's Korea Diary",
    koDesc: '국장 담당 코숏과 의장 !QAZ 의 하루 한 컷 시황.', enDesc: 'Kosho (Korean stocks) and !QAZ, one market day at a time.',
    face: '/characters/v2/kr/face/06_neutral.png' },
  { id: 'us', ko: '멘쿤의 미장 일기', en: "Maine's US Diary",
    koDesc: '미장 담당 멘쿤과 의장 !QAZ 의 하루 한 컷 시황.', enDesc: 'Maine (US stocks) and !QAZ, one market day at a time.',
    face: '/characters/v2/us/face/06_neutral.png' },
  { id: 'radar', ko: '거래량 레이더', en: 'Volume Radar',
    koDesc: '평소보다 거래가 몇 배 몰린 종목 — 관심의 신호이지 방향이 아니다.', enDesc: 'Names that traded many times their usual turnover — attention, not direction.',
    face: '/characters/v2/kr/face/11_thinking.png' },
  { id: 'countdown', ko: '러블의 일정 카운트다운', en: "Lovble's Countdown",
    koDesc: '글로벌 뉴스 담당 러블이 알려 주는 큰 일정 D-2. 일정 안내이지 예측이 아니다.', enDesc: 'Lovble (global news desk) flags big scheduled events two days out. A schedule, not a forecast.',
    face: '/characters/v2/news/face/06_neutral.png' },
];

export const seriesOf = (id: string) => TOON_SERIES.find((s) => s.id === id);
