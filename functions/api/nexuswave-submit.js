// POST /api/nexuswave-submit  ->  saves one submission into the D1 database (binding name: DB)
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, error: 'db_not_bound' }, 500);

  // same-site requests only
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ ok: false }, 403);

  const len = Number(request.headers.get('Content-Length') || 0);
  if (len > 400000) return json({ ok: false, error: 'too_large' }, 413);

  let body;
  try { body = await request.json(); } catch (e) { return json({ ok: false }, 400); }

  const email = String(body.email || '').trim().slice(0, 200);
  const text = String(body.text || '');
  const data = JSON.stringify(body.data || {});
  if (!email || !text || text.length > 150000 || data.length > 200000) {
    return json({ ok: false, error: 'bad_input' }, 400);
  }

  await env.DB.prepare(
    'INSERT INTO submissions (id, email, answers_text, answers_json, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), email, text, data, new Date().toISOString()).run();

  return json({ ok: true });
}
