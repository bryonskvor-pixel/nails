// api/generate.js
// Nail Generator — BFL Flux.2 image generation proxy
// Matches the pattern from remodel.guide/api/generate
// Deploy to Vercel. Requires BFL_API_KEY in environment variables.

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, nailShape } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const apiKey = process.env.BFL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'BFL_API_KEY not configured' });
  }

  // Build the final prompt — nail photography always needs this framing wrapper
  const finalPrompt = buildNailPrompt(prompt, nailShape);

  try {
    const response = await fetch('https://api.us1.bfl.ai/v1/flux-pro-1.1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Key': apiKey,
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        width: 1024,
        height: 1024,
        prompt_upsampling: false,
        safety_tolerance: 2,
        output_format: 'jpeg',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('BFL API error:', response.status, errText);
      return res.status(response.status).json({ error: 'BFL API error', detail: errText });
    }

    const data = await response.json();

    // BFL returns { id: "...", polling_url: "..." }
    return res.status(200).json({ taskId: data.id });

  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Wraps any theme prompt in consistent nail photography framing.
// The theme prompt carries all the design specifics;
// this function adds the photography/technical wrapper.
function buildNailPrompt(themePrompt, nailShape) {
  // If the theme prompt already starts with a photo framing phrase, use as-is
  const alreadyFramed = /^(a macro|an editorial|a crisp|a close-up|a detailed|a stunning|a beautiful)/i.test(themePrompt.trim());
  if (alreadyFramed) {
    return themePrompt;
  }

  // Otherwise wrap it
  const shape = nailShape || 'almond';
  return `A macro editorial photograph of a luxury nail manicure, ${shape.toLowerCase()} shape. ${themePrompt} Professional salon lighting, clean white background, hyper-realistic nail photography.`;
}
