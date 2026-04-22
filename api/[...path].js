/**
 * Vercel Serverless Function - Re:Earth CMS API Proxy
 * Handles all /api/* requests and forwards to Re:Earth CMS API
 *
 * Using catch-all route: /api/[...path].js
 */

export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Extract the API path from the request
    // URL: https://your-app.vercel.app/api/workspace/projects
    // Path captured: workspace/projects (without /api)
    // Target: https://api.cms.reearth.io/api/workspace/projects (add /api back)
    const { path } = req.query;
    const apiPath = Array.isArray(path) ? path.join('/') : path;
    const targetUrl = `https://api.cms.reearth.io/api/${apiPath}`;

    console.log(`[Proxy] ${req.method} ${targetUrl}`);
    console.log('[Proxy] Request path:', path);
    console.log('[Proxy] apiPath:', apiPath);
    console.log('[Proxy] Has Authorization:', !!req.headers.authorization);

    // Prepare request headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Forward Authorization header if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
      console.log('[Proxy] Authorization header forwarded');
    } else {
      console.warn('[Proxy] No Authorization header found in request');
    }

    // Prepare fetch options
    const fetchOptions = {
      method: req.method,
      headers: headers,
    };

    // Add body for non-GET requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    // Forward the request to Re:Earth CMS API
    const response = await fetch(targetUrl, fetchOptions);

    console.log(`[Proxy] Response status: ${response.status}`);

    // Get response data
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Log error responses for debugging
    if (!response.ok) {
      console.error('[Proxy] Error response:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
      });
    }

    // Forward the response
    res.status(response.status).json(data);

  } catch (error) {
    console.error('[Proxy] Error:', error);
    res.status(500).json({
      error: 'Proxy error',
      message: error.message,
    });
  }
}
