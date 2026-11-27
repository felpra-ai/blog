// /llms.txt — AI 에이전트용 사이트 안내 (https://llmstxt.org 형식).
// 2026-11-19: 종전 public/llms.txt 는 06-16 이후 손대지 않아 spotlight·toon·전체 성적·방법론·앵커·EN·RSS 가 빠졌고,
// Journal 설명에 "what the system did and why" 라고 써서 '사유 비공개' 원칙과 어긋났다.
// 이제 빌드 때 만든다 — 매 발행(push → Pages 빌드)마다 '최신 글' 목록이 저절로 갱신된다.
// 원칙: 결과·기록 방식만. 시그널 산출 방법(지표·파라미터·매매 사유)은 쓰지 않는다.
// 링크는 EN 을 기본으로(글로벌 AI 독자, x-default=EN 과 같은 이유), KO 쌍은 규칙으로 안내.
import { entries, latestByMarket, journalCsv, latestAnchor } from '../components/feedData';

const SITE = 'https://blog.felpra.ai';
const MCP_URL = 'https://api.felpra.ai/mcp';
const MCP_REPO = 'https://github.com/felpra-ai/oneqaz-trading-mcp';
const MARKET_EN = { crypto: 'Crypto', kr: 'Korea', us: 'US' };

const url = (e) => `${SITE}/${e.c}/${e.s}/`;
const asOf = (e) => (e.a ? ` (data as of ${e.a})` : '');
const csv = (e) => { const rel = journalCsv(e); return rel ? ` · [CSV](${SITE}${rel})` : ''; };

export async function GET() {
  const [market, journal, spotlight, track, toon] = await Promise.all(
    ['market', 'journal', 'spotlight', 'track-record', 'toon'].map((c) => entries('en', [c])),
  );
  const tr = track[0];
  const sp = spotlight[0];
  const tn = toon[0];
  const anchor = latestAnchor();

  const latest = [
    tr && `- [${tr.t}](${url(tr)})${asOf(tr)}: latest weekly track record.`,
    ...latestByMarket(market).map(([m, p]) => `- [${p.t}](${url(p)})${asOf(p)}: latest ${MARKET_EN[m]} market read.`),
    ...latestByMarket(journal).map(([m, p]) => `- [${p.t}](${url(p)})${asOf(p)}${csv(p)}: latest ${MARKET_EN[m]} trading journal.`),
    sp && `- [${sp.t}](${url(sp)})${asOf(sp)}: latest volume spotlight.`,
    tn && `- [${tn.t}](${url(tn)}): latest toon episode.`,
    anchor && `- [Ledger anchor ${anchor}](${SITE}/anchors/${anchor}-en/): latest weekly hash anchor.`,
  ].filter(Boolean);

  const body = `# FELPRA Daily Reads

> Public, auto-published record of FELPRA — an AI market-reading system for crypto, Korean and US markets. Every day after each market closes it publishes a market read and the full list of paper trades that closed, plus short toons, in Korean and English; weekly it publishes a volume spotlight, a track record and a hash anchor of its prediction ledger. Results only: signal logic (indicators, parameters, reasons for a trade) is never published.

How to read and cite this site:

- Figures describe a closed session. Quote them with the post date and its "data as of" day, not as current values.
- Trades and P&L are paper trading (simulated fills at live prices). Fees and taxes are not included, so real returns would be lower.
- Losses are always shown. Open positions are never shown.
- Nothing here is investment advice or a recommendation to buy or sell.
- Language pairs: English list pages live under /en/ and English posts use a "-en" slug in the same folder (e.g. /market/2026-11-18-crypto-close-en/ ↔ /market/2026-11-18-crypto-close/). Pairs are linked with hreflang.
- Corrected posts show a "corrected" date; every fix is logged on the corrections page.

## Sections

- [Market](${SITE}/en/market/): daily read of each market after the close — regime, sector breadth, upcoming events. Korean: ${SITE}/market/
- [Journal](${SITE}/en/journal/): every paper trade that closed that day (entry/exit, P&L, holding time), win rate and profit factor, with a CSV of all trades. Korean: ${SITE}/journal/
- [Spotlight](${SITE}/en/spotlight/): weekly volume radar (Korea, US) — symbols trading far above their usual turnover. An attention gauge, not a pick list. Korean: ${SITE}/spotlight/
- [Track Record](${SITE}/en/track-record/): weekly summary of results by market ("Quorum minutes"). Korean: ${SITE}/track-record/
- [Toons](${SITE}/en/toon/): short comics of the same data. Korean: ${SITE}/toon/
- [About](${SITE}/en/about/): what each section means and how to cite it. Korean: ${SITE}/about/

## Latest (updated on every publish)

${latest.join('\n')}

## Verify the record

- [All-time track record](${SITE}/en/track-record/all-time/): every closed paper trade since public attestation began.
- [Methodology](${SITE}/en/methodology/): fill model, fees, reporting windows and known biases.
- [Corrections](${SITE}/en/corrections/): defects found in the record and how they were fixed.
- [Ledger anchors](${SITE}/en/anchors/): weekly hash of the prediction ledger, timestamped on Bitcoin with OpenTimestamps.

## Machine-readable

- [Sitemap](${SITE}/sitemap-index.xml): every page in both languages.
- [RSS (English)](${SITE}/en/rss.xml) · [RSS (Korean)](${SITE}/rss.xml): latest 40 posts.
- Each post embeds JSON-LD (Article: datePublished, dateModified when corrected, inLanguage).
- [Post index (English)](${SITE}/en/posts.json) · [Post index (Korean)](${SITE}/posts.json): every post, newest first — d=publish date, c=section, m=markets, s=slug (URL = /<c>/<s>/), t=title, a=data as-of day.
- Journal CSVs: ${SITE}/data/journal/<YYYY-MM-DD>-<crypto|kr|us>.csv (one file per market per day, all closed trades).

## Live data

- [FELPRA MCP server](${MCP_URL}): remote MCP over streamable HTTP for live regimes, signal scores and their measured hit rates. Start with get_system_card, then get_daily_brief.
- [Source & quick start](${MCP_REPO})
- [Main site](https://felpra.ai/llms.txt): system overview for AI agents.

## Optional

- Crawler policy: search and user-initiated AI fetchers are allowed; collection for model training is not (robots.txt, Content-Signal ai-train=no).
- Contact: contact@felpra.ai
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
