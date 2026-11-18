// 페이지 언어와 KO↔EN 쌍둥이 경로 — Header·Footer 가 함께 쓴다(종전 Header.astro 안의 계산을 그대로 옮김).
// 블로그는 경로가 곧 언어다: /en/ 프리픽스(상설·목록) 또는 글 슬러그 -en.

// 글(날짜 슬러그) — EN 은 같은 폴더에 -en 슬러그로 산다. 원장 앵커 상세도 같은 규칙(/anchors/<날짜>-en/).
const POST_RE = /^\/(journal|market|spotlight|track-record|toon|anchors)\/20\d{2}-[^/]+\/$/;

// KO 쪽에서 /en/ 쌍이 있는 경로. (2026-11-19: About·tags 도 /en/ 쌍을 갖게 됨 — 종전엔 About 이 영어 단일
// 페이지라 /about/ 이 KO 로 판정돼 영어 화면에서 누르면 메뉴가 한국어로 바뀌었다.)
const EN_TWIN = [
  /^\/(\d+\/)?$/,                                          // 홈 + 페이지네이션
  /^\/(journal|market|spotlight|track-record)\/(\d+\/)?$/, // 카테고리 목록
  /^\/track-record\/all-time\/$/,
  /^\/(methodology|corrections|anchors|about)\/$/,
  /^\/tags\/[^/]+\/$/,                                     // 태그 (KO·EN 이 같은 태그 집합으로 빌드됨)
  /^\/toon\/$/,                                           // 툰 목록
  /^\/toon\/series\/[a-z-]+\/$/,                          // 툰 시리즈
];

export function isPostPath(path: string): boolean {
  return POST_RE.test(path);
}

export function isEnPath(path: string): boolean {
  return path === '/en/' || path.startsWith('/en/') || (isPostPath(path) && /-en\/$/.test(path));
}

/** 같은 페이지의 다른 언어 경로. 쌍이 없으면 null. */
export function altPathOf(path: string): string | null {
  const en = isEnPath(path);
  if (isPostPath(path)) return en ? path.replace(/-en\/$/, '/') : path.replace(/\/$/, '-en/');
  if (path.startsWith('/en/')) return path.replace(/^\/en/, '') || '/';
  if (EN_TWIN.some((re) => re.test(path))) return '/en' + path;
  return null;
}

/** 쌍이 없을 때 다른 언어 쪽 갈 곳 — 같은 섹션 목록, 섹션을 모르면 홈. */
export function fallbackOf(path: string): string {
  const en = isEnPath(path);
  const m = path.replace(/^\/en\//, '/').match(/^\/(journal|market|spotlight|track-record|toon|anchors)\//);
  if (m) return en ? `/${m[1]}/` : `/en/${m[1]}/`;
  return en ? '/' : '/en/';
}
