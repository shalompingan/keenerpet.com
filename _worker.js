// KeenerPet — Advanced Mode Cloudflare Worker
// Intercepts API routes, passes static assets to Cloudflare Pages

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SENDGRID_KEY = '';
const FROM_EMAIL = 'hello@keenerpet.com';
const FROM_NAME = 'KeenerPet';

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

        // Store in KV if bound
        if (typeof env !== 'undefined' && env.EMAIL_KV) {
          await env.EMAIL_KV.put(
            `email:${Date.now()}`,
            JSON.stringify({ email, source, tool: tool || '', note: note || '', timestamp: new Date().toISOString() })
          );
        }

        // Send notification via SendGrid if configured
        if (SENDGRID_KEY) {
          await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SENDGRID_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: FROM_EMAIL }] }],
              from: { email: FROM_EMAIL, name: FROM_NAME },
              subject: `New ${source} signup from KeenerPet`,
              content: [{ type: 'text/plain', value: `Email: ${email}\nSource: ${source}\nTool: ${tool || 'N/A'}\nNote: ${note || 'N/A'}` }]
            })
          });
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
