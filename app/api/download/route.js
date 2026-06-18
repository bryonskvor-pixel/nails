// app/api/download/route.js
// Proxies the BFL-generated image server-side so the browser
// can trigger a clean download without CORS issues

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  const filename = searchParams.get('name') || 'nail-design.jpg';

  if (!imageUrl) {
    return Response.json({ error: 'Missing image URL' }, { status: 400 });
  }

  // Only allow BFL CDN URLs — don't let this become an open proxy
  const allowed = [
    'https://cdn.us1.bfl.ai',
    'https://cdn.bfl.ai',
    'https://storage.bfl.ai',
  ];

  const isAllowed = allowed.some(origin => imageUrl.startsWith(origin));
  if (!isAllowed) {
    return Response.json({ error: 'URL not allowed' }, { status: 403 });
  }

  try {
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      return Response.json({ error: 'Failed to fetch image' }, { status: 502 });
    }

    const buffer = await imageRes.arrayBuffer();
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });

  } catch (err) {
    console.error('Download error:', err);
    return Response.json({ error: 'Download failed' }, { status: 500 });
  }
}
