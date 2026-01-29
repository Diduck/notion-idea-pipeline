// Cloudflare Worker - Proxy CORS pour Notion API
// Déploie ce fichier sur Cloudflare Workers (gratuit)

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Notion-Version',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Forward request to Notion API
    const url = new URL(request.url);
    const notionUrl = 'https://api.notion.com' + url.pathname + url.search;

    const response = await fetch(notionUrl, {
      method: request.method,
      headers: {
        'Authorization': request.headers.get('Authorization'),
        'Content-Type': 'application/json',
        'Notion-Version': request.headers.get('Notion-Version') || '2022-06-28',
      },
      body: request.method !== 'GET' ? await request.text() : undefined,
    });

    // Return response with CORS headers
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    return newResponse;
  },
};
