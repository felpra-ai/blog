// 태그 페이지(/tags/<tag>/ · /en/tags/<tag>/) 공통 경로 계산.
// 2026-11-19: 종전엔 KO 전용 + track-record·market·journal 만 모아서
//   ① EN 글 태그가 한국어 목록으로 갔고 ② spotlight·toon 글의 태그(#screener·#toon 등)는 404 였다.
// 태그 집합은 두 언어 글을 합쳐서 만든다 → KO·EN 태그 페이지가 언제나 같은 목록으로 짝을 이룬다(siteLang EN_TWIN).
import { getCollection } from 'astro:content';

const COLLECTIONS = ['track-record', 'market', 'spotlight', 'journal', 'toon'] as const;

export async function tagPaths(lang: 'ko' | 'en') {
  const tagMap = new Map<string, any[]>();
  for (const c of COLLECTIONS) {
    const entries = await getCollection(c, ({ data }) => !data.draft);
    for (const e of entries) {
      const keys = [...(e.data.markets ?? []), ...(e.data.tags ?? [])];
      const mine = (e.data.lang === 'en') === (lang === 'en');
      for (const k of keys) {
        if (!tagMap.has(k)) tagMap.set(k, []);
        if (mine) tagMap.get(k)!.push({ ...e, _collection: c });
      }
    }
  }
  return [...tagMap.entries()].map(([tag, posts]) => ({
    params: { tag },
    props: { tag, posts: posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf()) },
  }));
}
