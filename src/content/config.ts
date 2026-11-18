import { defineCollection, z } from 'astro:content';

// Shared frontmatter schema — enforced at build time.
// A post missing a required field FAILS the build (prevents bad auto-publishes).
const postSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  description: z.string(),
  // category is implied by the collection folder, but kept for clarity/validation
  category: z.enum(['track-record', 'market', 'journal', 'spotlight']),
  // market tags — cross-filter axis (kr / us / crypto)
  markets: z.array(z.enum(['kr', 'us', 'crypto'])).default([]),
  tags: z.array(z.string()).default([]),
  lang: z.enum(['ko', 'en']).default('ko'),
  draft: z.boolean().default(false),
  // 정정/갱신 재발행 시각 — JSON-LD dateModified 로 노출 (없으면 미수정 글)
  updated: z.coerce.date().optional(),
  // 데이터 기준일 (발행일 date 와 분리 — 날짜 오귀속 방지, §4-2)
  data_as_of: z.coerce.date().optional(),
  // 기계 가독 핵심 수치 (§4-7 — AI 인용용, 소스 명기)
  metrics: z.record(z.union([z.string(), z.number()])).optional(),
  ogImage: z.string().optional(),
  // hreflang pairing — the alternate-language version of this same post
  altUrl: z.string().optional(),
  altLang: z.enum(['ko', 'en']).optional(),
});

// 툰(인스타툰 캐러셀을 웹툰처럼 세로로) — 2026-11-18. 시리즈 = 시장별 담당 고양이 일기 + 거래량 레이더(radar) · 일정 카운트다운(countdown) (11-18).
// 이미지는 public/toon/<slug>/0N.webp (엔딩 카드 제외 5장). 본문 = 대사 원문 + 원문 글 링크 + 면책.
const toonSchema = postSchema.extend({
  category: z.literal('toon'),
  series: z.string(),
  episode: z.number().int().positive(),
  images: z.array(z.object({ src: z.string(), alt: z.string() })).min(1),
  source: z.string().optional(),   // 원문 시황 글 경로
});

const trackRecord = defineCollection({ type: 'content', schema: postSchema });
const toon = defineCollection({ type: 'content', schema: toonSchema });
const market = defineCollection({ type: 'content', schema: postSchema });
const journal = defineCollection({ type: 'content', schema: postSchema });
const spotlight = defineCollection({ type: 'content', schema: postSchema });

export const collections = {
  'track-record': trackRecord,
  market,
  journal,
  spotlight,
  toon,
};
