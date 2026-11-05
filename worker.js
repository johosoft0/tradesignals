// Cloudflare Worker — minimal CORS proxy for Yahoo Finance chart data.
// Deploy: dash.cloudflare.com → Workers & Pages → Create → paste this → Deploy.
// Then paste the worker URL (https://xxx.workers.dev) into the "Your proxy URL" field on the site.
const ALLOWED = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com'];

export default {
  async fetch(req) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

    const target = new URL(req.url).searchParams.get('url');
    let u;
    try { u = new URL(target); } catch { return new Response('bad url', { status: 400, headers: cors }); }
    if (!ALLOWED.includes(u.hostname)) return new Response('forbidden', { status: 403, headers: cors });

    const r = await fetch(u.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
      cf: { cacheTtl: 60, cacheEverything: true },
    });
    return new Response(r.body, {
      status: r.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};
