// /posts.json — KO 글 전체 색인(최신순). 홈 '전체 기간' 필터가 읽고, 기계 판독용으로도 쓴다.
// 한 줄 = { d: 발행일, c: 섹션, m: 시장, s: slug(주소 = /<c>/<s>/), t: 제목, a: 데이터 기준일 }
import { entries } from '../components/feedData';

export async function GET() {
  return new Response(JSON.stringify(await entries('ko')), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
