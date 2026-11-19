// 글 목록 공통 로직 — 빌드(PostList)와 브라우저(홈 전체 기간 필터)가 같은 함수로 같은 마크업을 만든다.
// astro:content 를 import 하지 않는다(클라이언트 번들에 들어가므로). 데이터 수집은 feedData.ts.
// 2026-11-19 메뉴 재구성: 하루 3시장 × 시황·매매일지가 6줄씩 쌓이던 목록을 '시황: 코인·국장·미장' 한 줄로 묶는다.

export type Lang = 'ko' | 'en';
export type Col = 'track-record' | 'market' | 'spotlight' | 'journal' | 'toon';
/** 목록 항목 — /posts.json 의 한 줄과 같다. d=발행일(UTC 날짜), a=데이터 기준일 */
export interface Entry { d: string; c: Col; m: string[]; s: string; t: string; a?: string }

export const MARKETS = ['crypto', 'kr', 'us'] as const;
export const CAT: Record<Lang, Record<Col, string>> = {
  ko: { 'track-record': '트랙 레코드', market: '시황', spotlight: '스포트라이트', journal: '매매일지', toon: '툰' },
  en: { 'track-record': 'Track Record', market: 'Market', spotlight: 'Spotlight', journal: 'Journal', toon: 'Toon' },
};
export const MKT: Record<Lang, Record<string, string>> = {
  ko: { crypto: '코인', kr: '국장', us: '미장' },
  en: { crypto: 'Crypto', kr: 'Korea', us: 'US' },
};
const COL_ORDER: Record<Col, number> = { 'track-record': 0, market: 1, journal: 2, spotlight: 3, toon: 4 };
/** 시장별로 한 줄에 묶는 섹션 */
const MERGED: Col[] = ['market', 'journal'];

export const hrefOf = (e: Entry) => `/${e.c}/${e.s}/`;
const mOrder = (m?: string) => { const i = (MARKETS as readonly string[]).indexOf(m ?? ''); return i < 0 ? 9 : i; };

export type Line =
  | { kind: 'merged'; c: Col; items: Entry[] }
  | { kind: 'single'; c: Col; e: Entry };
export interface Day { d: string; n: number; lines: Line[] }

/** 날짜 = 데이터 기준일(없으면 발행일). 미장은 한국 시간 다음 날 아침에 발행되므로 발행일로 묶으면
 *  11-18 미장 글이 11-19 칸에 들어간다. entries 는 최신순이라고 가정한다. */
export function groupDays(entries: Entry[]): Day[] {
  const days: Day[] = [];
  const idx = new Map<string, Day>();
  for (const e of entries) {
    const key = e.a ?? e.d;
    let day = idx.get(key);
    if (!day) { day = { d: key, n: 0, lines: [] }; idx.set(key, day); days.push(day); }
    day.n++;
    if (MERGED.includes(e.c)) {
      const line = day.lines.find((l) => l.kind === 'merged' && l.c === e.c) as Extract<Line, { kind: 'merged' }> | undefined;
      if (line) line.items.push(e); else day.lines.push({ kind: 'merged', c: e.c, items: [e] });
    } else day.lines.push({ kind: 'single', c: e.c, e });
  }
  days.sort((x, y) => (x.d < y.d ? 1 : x.d > y.d ? -1 : 0));
  for (const day of days) {
    day.lines.sort((a, b) => COL_ORDER[a.c] - COL_ORDER[b.c]);
    for (const l of day.lines) if (l.kind === 'merged') l.items.sort((x, y) => mOrder(x.m[0]) - mOrder(y.m[0]));
  }
  return days;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!));
const stripDate = (t: string) => t.replace(/^\d{4}-\d{2}-\d{2}\s*/, '');

/** inline = 한 섹션만 있는 목록(시황·매매일지)에서 하루를 '날짜 + 시장 칩' 한 줄로 그린다. */
export function renderDays(days: Day[], lang: Lang, inline = false): string {
  const cat = CAT[lang];
  const mkt = MKT[lang];
  const tags = (m: string[]) => m.map((x) => mkt[x] ?? x).join(' · ');
  const chip = (d: string, c: Col, e: Entry) => {
    const name = mkt[e.m[0]] ?? esc(e.m[0] ?? '');
    return `<a class="fd-chip" href="${hrefOf(e)}" aria-label="${d} ${name} ${cat[c]}">${name}</a>`;
  };
  if (inline) {
    return `<ul class="fd-inline">${days.map((day) => {
      const parts = day.lines.map((l) => (l.kind === 'merged'
        ? l.items.map((e) => chip(day.d, l.c, e)).join('')
        : `<a class="fd-title" href="${hrefOf(l.e)}">${esc(stripDate(l.e.t))}</a>`)).join('');
      return `<li class="fd-iday"><time datetime="${day.d}">${day.d}</time><span class="fd-chips">${parts}</span></li>`;
    }).join('')}</ul>`;
  }
  return days.map((day) => {
    const lines = day.lines.map((l) => {
      const badge = `<span class="fd-cat fd-${l.c}">${cat[l.c]}</span>`;
      if (l.kind === 'merged') {
        const chips = l.items.map((e) => chip(day.d, l.c, e)).join('');
        return `<li class="fd-line">${badge}<span class="fd-chips">${chips}</span></li>`;
      }
      const m = l.e.m.length ? `<span class="fd-mk">${tags(l.e.m)}</span>` : '';
      return `<li class="fd-line">${badge}<a class="fd-title" href="${hrefOf(l.e)}">${esc(stripDate(l.e.t))}</a>${m}</li>`;
    }).join('');
    return `<div class="fd-day"><div class="fd-head"><time datetime="${day.d}">${day.d}</time><span class="fd-n">${day.n}</span></div><ul class="fd-lines">${lines}</ul></div>`;
  }).join('');
}
