// KeenerPet — Advanced Mode Cloudflare Worker
// Intercepts API routes, passes static assets to Cloudflare Pages

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const FROM_EMAIL = 'support@keenerpet.com';
const FROM_NAME = 'KeenerPet Newsletter';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Email collection API
    if (path === '/api/collect-email' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { email, source, tool, note } = body;
        if (!email || !email.includes('@')) {
          return new Response(JSON.stringify({ error: 'Invalid email' }), {
            status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // Send notification via MailChannels (free, no API key needed)
        try {
          await fetch('https://api.mailchannels.net/tx/v1/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: FROM_EMAIL, name: 'Support' }] }],
              from: { email: FROM_EMAIL, name: FROM_NAME },
              subject: `New ${source} signup from KeenerPet`,
              content: [{ type: 'text/plain', value: `Email: ${email}\nSource: ${source}\nTool: ${tool || 'N/A'}\nNote: ${note || 'N/A'}` }]
            })
          });
        } catch(e) {
          // Email notification is best-effort
          console.error('MailChannels error:', e);
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

    // Static assets — Cloudflare Pages handles these
    return env.ASSETS.fetch(request);
  }
};
