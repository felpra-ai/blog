// 빌드 직전 브랜드 정규화 (2026-11-27 OneQAZ → FELPRA 전환).
//
// 맥미니 게시기가 새 글을 올릴 때 옛 이름·주소가 섞여 들어와도 게시되는 사이트에는 새 이름만 나가게 한다.
// `npm run build` 앞(prebuild)에서 돌며 src/content · src/data · public/anchors 의 텍스트 파일을 그 자리에서 고친다.
// - web.archive.org 스냅숏 주소는 실제 보관 주소라 그대로 둔다.
// - 해시·증명 값은 건드리지 않는다(16진 문자열에는 아래 패턴이 없다).
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const ROOTS = ['src/content', 'src/data', 'src/pages/anchors', 'public/anchors'];
const EXT = new Set(['.md', '.mdx', '.astro', '.json', '.txt', '.xml', '.yaml', '.yml', '.html']);
const PROTECT = /https?:\/\/web\.archive\.org\/web\/[^\s"'<>)\]]+/g;
const OLD = ['one', 'qaz'].join(''); // 이 파일 자체에도 옛 이름 문자열을 남기지 않는다
const OLD_CAP = 'One' + 'QAZ';
const PAIRS = [
  [new RegExp(`github\\.com/wnsod/${OLD}-trading-mcp(?![\\w-])`, 'g'), 'github.com/felpra-ai/felpra-trading-mcp'],
  [new RegExp(`github\\.com/${OLD}-trading/${OLD}-trading-mcp(?![\\w-])`, 'g'), 'github.com/felpra-ai/felpra-trading-mcp'],
  [new RegExp(`github\\.com/felpra-ai/${OLD}-trading-mcp(?![\\w-])`, 'g'), 'github.com/felpra-ai/felpra-trading-mcp'],
  [new RegExp(`github\\.com/wnsod/${OLD}-blog(?![\\w-])`, 'g'), 'github.com/felpra-ai/blog'],
  [new RegExp(`github\\.com/wnsod/${OLD}(?![\\w-])`, 'g'), 'github.com/felpra-ai/site'],
  [new RegExp(`pypi\\.org/project/${OLD}-trading-mcp`, 'g'), 'pypi.org/project/felpra-trading-mcp'],
  [new RegExp(`(contact|support|security)@${OLD}\\.com`, 'g'), 'contact@felpra.ai'],
  [new RegExp(`(?<![\\w.:-])api\\.${OLD}\\.com`, 'g'), 'api.felpra.ai'],
  [new RegExp(`(?<![\\w.:-])blog\\.${OLD}\\.com`, 'g'), 'blog.felpra.ai'],
  [new RegExp(`(?<![\\w.@:-])${OLD}\\.com(?![\\w-])`, 'g'), 'felpra.ai'],
  [new RegExp(`@${OLD_CAP}2026`, 'g'), '@FELPRA2026'],
  [new RegExp(`${OLD}:anchor`, 'g'), 'felpra:anchor'],
  [new RegExp(`${OLD}_vault`, 'g'), 'vault'],
  [new RegExp(`(?<![@\\w])${OLD_CAP}`, 'g'), 'FELPRA'],
  [/원쿼즈/g, '펠프라'],
  [new RegExp('!' + 'QAZ', 'g'), '범'],
];

function fix(text) {
  const saved = [];
  let t = text.replace(PROTECT, (m) => `\u0000${saved.push(m) - 1}\u0000`);
  for (const [rx, rep] of PAIRS) t = t.replace(rx, rep);
  t = t.replaceAll('an FELPRA', 'a FELPRA').replaceAll('An FELPRA', 'A FELPRA');
  return t.replace(/\u0000(\d+)\u0000/g, (_, i) => saved[Number(i)]);
}

function* walk(dir) {
  let names;
  try { names = readdirSync(dir); } catch { return; }
  for (const n of names) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (EXT.has(extname(n).toLowerCase())) yield p;
  }
}

let changed = 0;
for (const root of ROOTS) {
  for (const p of walk(root)) {
    const s = readFileSync(p, 'utf8');
    const n = fix(s);
    if (n !== s) { writeFileSync(p, n); changed += 1; }
  }
}
console.log(`[rebrand] normalized ${changed} file(s)`);
