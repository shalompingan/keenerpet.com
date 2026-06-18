// KeenerPet — Email Collector Worker
// Advanced Mode: API routes + static assets

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // API routes
    if (path.startsWith('/api/')) {
      return handleApi(request, env, url);
    }

    // Static assets — Cloudflare Pages handles these
    return env.ASSETS.fetch(request);
  }
};

async function handleApi(request, env, url) {
  const path = url.pathname;

  // === POST /api/collect-email — store email ===
  if (request.method === 'POST' && path === '/api/collect-email') {
    try {
      const body = await request.json();
      const { email, source, tool, note } = body;
      if (!email || !email.includes('@')) {
        return new Response(JSON.stringify({ error: 'Invalid email' }), {
          status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (!env.NEWSLETTER) {
        return new Response(JSON.stringify({ error: 'Storage not configured' }), {
          status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Save to KV
      const key = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await env.NEWSLETTER.put(key, JSON.stringify({
        email: email.toLowerCase().trim(),
        source: source || 'newsletter',
        tool: tool || '',
        note: note || '',
        timestamp: Date.now()
      }));

      // Send notification via SendGrid (if configured)
      if (env.SENDGRID_KEY) {
        try {
          await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + env.SENDGRID_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: 'support@keenerpet.com' }] }],
              from: { email: 'support@keenerpet.com', name: 'KeenerPet Newsletter' },
              subject: `New ${source} signup from KeenerPet`,
              content: [{ type: 'text/plain', value: `Email: ${email}\nSource: ${source}\nTool: ${tool || 'N/A'}\nNote: ${note || 'N/A'}` }]
            })
          });
        } catch(e) {
          console.error('SendGrid error:', e);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Internal error' }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  // === GET /api/collect-email/admin — admin panel ===
  if (request.method === 'GET' && path === '/api/collect-email/admin') {
    const password = env.ADMIN_KEY || 'keenerpet2026';
    const keyParam = url.searchParams.get('key');

    if (!keyParam || keyParam !== password) {
      const error = keyParam ? true : false;
      return new Response(loginPage(error), {
        status: 401,
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
      });
    }

    if (!env.NEWSLETTER) {
      return new Response('Storage not configured', { status: 500 });
    }

    const list = await env.NEWSLETTER.list();
    const entries = [];
    for (const key of list.keys) {
      const value = JSON.parse(await env.NEWSLETTER.get(key.name));
      entries.push({ id: key.name, ...value });
    }
    entries.sort((a, b) => b.timestamp - a.timestamp);

    return new Response(adminPage(entries), {
      headers: { 'Content-Type': 'text/html', ...corsHeaders },
    });
  }

  return new Response('Not found', { status: 404 });
}

function loginPage(showError) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Admin — KeenerPet</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, sans-serif; background: #1c1917; color: #e7e5e4; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .box { background: #292524; border-radius: 16px; padding: 40px 32px; max-width: 380px; width: 90%; text-align: center; }
  h1 { font-size: 20px; color: #d97706; margin-bottom: 6px; }
  p { font-size: 13px; color: #a8a29e; margin-bottom: 24px; }
  input { width: 100%; padding: 12px 16px; border: 1px solid #44403c; border-radius: 10px; background: #1c1917; color: #e7e5e4; font-size: 14px; outline: none; font-family: inherit; margin-bottom: 16px; }
  input:focus { border-color: #d97706; }
  button { width: 100%; padding: 12px; background: #d97706; color: #1c1917; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
  button:hover { background: #b45309; }
  .error { color: #ef4444; font-size: 13px; margin-bottom: 16px; display: ${showError ? 'block' : 'none'}; }
</style></head>
<body>
<div class="box">
  <h1>KeenerPet</h1>
  <p>Enter admin password to view subscribers</p>
  <div class="error" id="error">Incorrect password</div>
  <input type="password" id="pwd" placeholder="Password" autofocus>
  <button onclick="login()">Unlock</button>
</div>
<script>
function login() { var p = document.getElementById('pwd').value; if (p) window.location.href = '?key=' + encodeURIComponent(p); }
document.getElementById('pwd').addEventListener('keydown', function(e) { if (e.key === 'Enter') login(); });
<\/script>
</body></html>`;
}

function adminPage(entries) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Subscribers — KeenerPet</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, sans-serif; background: #1c1917; color: #e7e5e4; max-width: 1000px; margin: 0 auto; padding: 32px 20px; }
  h1 { font-size: 24px; color: #d97706; margin-bottom: 4px; }
  .subtitle { color: #a8a29e; font-size: 14px; margin-bottom: 24px; }
  .stats { display: flex; gap: 16px; margin-bottom: 24px; }
  .stat-card { background: #292524; border-radius: 12px; padding: 16px 24px; text-align: center; flex: 1; }
  .stat-num { font-size: 28px; font-weight: 700; color: #d97706; }
  .stat-label { font-size: 12px; color: #a8a29e; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
  .btn { background: #d97706; color: #1c1917; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit; margin-bottom: 16px; }
  .btn:hover { background: #b45309; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 12px 8px; color: #a8a29e; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #292524; }
  td { padding: 10px 8px; border-bottom: 1px solid #292524; color: #d6d3d1; }
  tr:hover td { background: #292524; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .tag-newsletter { background: #dbeafe; color: #1e40af; }
  .tag-test { background: #fef3c7; color: #92400e; }
  .empty { text-align: center; padding: 60px 20px; color: #a8a29e; }
  .empty-icon { font-size: 48px; margin-bottom: 16px; }
</style></head>
<body>
<h1>KeenerPet</h1>
<p class="subtitle">Email subscribers &amp; feedback</p>
<div class="stats">
  <div class="stat-card"><div class="stat-num">${entries.length}</div><div class="stat-label">Total</div></div>
</div>
<button class="btn" onclick="exportCSV()">Export CSV</button>
${entries.length === 0 ? `<div class="empty"><div class="empty-icon">📭</div><p>No subscribers yet.</p></div>` : `
<table>
  <tr><th>Date</th><th>Email</th><th>Source</th><th>Note</th></tr>
  ${entries.map(e => `<tr>
    <td>${new Date(e.timestamp).toLocaleString('en-US')}</td>
    <td>${e.email}</td>
    <td><span class="tag tag-${e.source}">${e.source}</span></td>
    <td style="max-width:250px;white-space:pre-wrap;word-break:break-word;font-size:12px;color:#a8a29e">${e.note || '-'}</td>
  </tr>`).join('')}
</table>`}
<script>
function exportCSV() {
  var rows = [['Date','Email','Source','Note']];
  ${JSON.stringify(entries.map(e => [new Date(e.timestamp).toLocaleString('en-US'), e.email, e.source, e.note || '']))}.forEach(function(r) { rows.push(r); });
  var csv = rows.map(function(r) { return r.map(function(v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(','); }).join('\\n');
  var a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'keenerpet-subscribers.csv';
  a.click();
}
<\/script>
</body></html>`;
}
