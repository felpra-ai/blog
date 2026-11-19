// /en/posts.json — EN 글 전체 색인(최신순). 형식은 /posts.json 과 같다.
import { entries } from '../../components/feedData';

export async function GET() {
  return new Response(JSON.stringify(await entries('en')), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
