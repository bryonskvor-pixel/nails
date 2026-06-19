export async function POST(request) {
  try {
    const { prompt, handImagePath, nailShape, ageGroup } = await request.json();

    if (!prompt || !handImagePath) {
      return Response.json({ error: 'Missing prompt or hand image' }, { status: 400 });
    }

    const apiKey = process.env.BFL_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'BFL_API_KEY not configured' }, { status: 500 });
    }

    // Construct absolute URL from request host so BFL can fetch the hand image.
    // Works on any Vercel deployment or custom domain automatically.
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const host  = request.headers.get('host') || '';
    const handImageUrl = `${proto}://${host}${handImagePath}`;

    const finalPrompt = buildFinalPrompt(prompt, nailShape, ageGroup);

    const response = await fetch('https://api.bfl.ai/v1/flux-kontext-pro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Key': apiKey,
      },
      body: JSON.stringify({
        prompt:           finalPrompt,
        input_image:      handImageUrl,
        aspect_ratio:     '1:1',
        output_format:    'jpeg',
        safety_tolerance: 2,
        guidance:         3.5,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('BFL error:', response.status, err);
      return Response.json({ error: 'Generation failed', detail: err }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ taskId: data.id });

  } catch (err) {
    console.error('Generate error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildFinalPrompt(themePrompt, nailShape, ageGroup) {
  const alreadyFramed = /^(a macro|an editorial|a crisp|a close-up|a detailed|a stunning|a beautiful)/i.test(themePrompt.trim());

  const ageNote = ageGroup === 'tween'
    ? ' Age-appropriate design for a young girl. Keep nail length very short.'
    : ageGroup === 'teen'
    ? ' Trendy design for a teenage girl. Keep nail length short to medium.'
    : '';

  const fiveNails = ' Every single nail — all five fingers — must be fully painted with the complete design. No bare nails.';

  if (alreadyFramed) {
    return `${themePrompt}${ageNote}${fiveNails} Apply the nail design to the hand in the reference image. Preserve the hand's natural skin tone, shape, and lighting. Only the nails should change.`;
  }

  const shape = nailShape || 'almond';
  return `Apply a luxury nail design to the hand in the reference image. ${shape} shaped nails. ${themePrompt}${ageNote}${fiveNails} Preserve the hand's natural skin tone, shape, and lighting. Only the nails should change. Professional salon photography lighting.`;
}
