// 빌드 타임 글 데이터 — 목록 페이지·홈 '오늘' 카드·/posts.json·/llms.txt 가 함께 쓴다.
import { getCollection } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';
import type { Col, Entry, Lang } from './feedCore';

export const ALL_COLS: Col[] = ['track-record', 'market', 'spotlight', 'journal', 'toon'];
const day = (d?: Date) => (d ? new Date(d).toISOString().slice(0, 10) : undefined);

/** lang 글만, 최신순. */
export async function entries(lang: Lang, cols: Col[] = ALL_COLS): Promise<Entry[]> {
  const rows: [number, Entry][] = [];
  for (const c of cols) {
    const xs = await getCollection(c, ({ data }: any) => !data.draft && (lang === 'en' ? data.lang === 'en' : data.lang !== 'en'));
    for (const x of xs as any[]) {
      const e: Entry = { d: day(x.data.date)!, c, m: x.data.markets ?? [], s: x.slug, t: x.data.title };
      const a = day(x.data.data_as_of);
      if (a) e.a = a;
      rows.push([x.data.date.valueOf(), e]);
    }
  }
  return rows.sort((p, q) => q[0] - p[0]).map(([, e]) => e);
}

/** 시장별 최신 1건 — 시장이 여럿인 글은 첫 시장 기준. */
export function latestByMarket(list: Entry[], markets: string[] = ['crypto', 'kr', 'us']): [string, Entry][] {
  const out: Record<string, Entry> = {};
  for (const e of list) { const m = e.m[0]; if (m && !out[m]) out[m] = e; }
  return markets.filter((m) => out[m]).map((m) => [m, out[m]]);
}

/** 생성기 규약: /data/journal/<data_as_of>-<market>.csv — 파일이 있을 때만 경로를 준다. */
export function journalCsv(e: Entry): string | null {
  const m = e.m[0];
  if (!m || !e.a) return null;
  const rel = `/data/journal/${e.a}-${m}.csv`;
  return fs.existsSync(path.join(process.cwd(), 'public', rel)) ? rel : null;
}

/** 최신 원장 앵커 날짜 (src/pages/anchors/<날짜>.astro 기준). */
export function latestAnchor(): string | null {
  const files = Object.keys(import.meta.glob('../pages/anchors/20*-en.astro'));
  const days = files.map((f) => f.match(/(20\d{2}-\d{2}-\d{2})-en\.astro$/)?.[1]).filter(Boolean).sort() as string[];
  return days.length ? days[days.length - 1] : null;
}

export const anchorHref = (d: string, lang: Lang) => `/anchors/${d}${lang === 'en' ? '-en' : ''}/`;
