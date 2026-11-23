// GET /nexuswave-inbox-r7q4  ->  private inbox of submissions.
// Lock it with Cloudflare Access (allow only your email). The check below is an extra
// safety net: it refuses to show anything if the request did not come through Access.
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function onRequestGet({ request, env }) {
  if (!request.headers.get('Cf-Access-Jwt-Assertion')) {
    return new Response('Not found', { status: 404 });
  }
  if (!env.DB) return new Response('Database not connected', { status: 500 });

  const url = new URL(request.url);
  const { results } = await env.DB.prepare(
    'SELECT id, email, answers_text, answers_json, created_at FROM submissions ORDER BY created_at DESC LIMIT 200'
  ).all();

  // ?download=latest gives the newest submission as a .txt file
  if (url.searchParams.get('download') === 'latest' && results.length) {
    return new Response(results[0].answers_text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="nexus-wave-onboarding-answers.txt"',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex',
      },
    });
  }

  const items = results.map((r, i) => `
    <details ${i === 0 ? 'open' : ''}>
      <summary><b>${esc(r.email)}</b> · ${esc(new Date(r.created_at).toUTCString())}${i === 0 ? ' · <i>latest</i>' : ''}</summary>
      <pre>${esc(r.answers_text)}</pre>
    </details>`).join('');

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Nexus Wave answers</title>
<style>
body{font:15px/1.5 system-ui,sans-serif;max-width:860px;margin:32px auto;padding:0 16px;color:#3B2A30;background:#FFF6F8}
h1{font-size:22px} details{background:#fff;border:1px solid #F2D5DC;border-radius:12px;margin:12px 0;padding:10px 14px}
summary{cursor:pointer} pre{white-space:pre-wrap;word-break:break-word;font:13px/1.55 ui-monospace,Menlo,monospace}
a{color:#C0243A}
</style></head><body>
<h1>Nexus Wave onboarding answers</h1>
<p>${results.length} submission${results.length === 1 ? '' : 's'}. Newest first. Each re-send from Ines is saved as a new entry.
${results.length ? '<a href="?download=latest">Download latest as .txt</a>' : ''}</p>
${items || '<p>Nothing yet.</p>'}
</body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}
