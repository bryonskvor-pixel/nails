// app/api/build-prompt/route.js
// Uses Claude to turn guided builder answers into a polished Flux prompt

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const { shape, vibe, palette, details, ageGroup } = await request.json();

    if (!shape || !vibe || !palette) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ageContext = ageGroup === 'tween'
      ? 'The nails are on a young girl (11-13), so keep the design age-appropriate, fun, and cute. Shorter nail lengths only.'
      : ageGroup === 'teen'
      ? 'The nails are on a teenage girl (15-17), so the design can be trendy and expressive but still age-appropriate. Short to medium nail lengths.'
      : 'The nails are on an adult woman. Any nail length and style is appropriate.';

    const detailsList = details && details.length > 0
      ? `Special accent details to include: ${details.join(', ')}.`
      : 'No special accent details requested.';

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: `You are a professional nail art prompt engineer writing image generation prompts for Flux AI. 
Your prompts always produce stunning, realistic nail photography.
Write prompts that are specific, editorial, and use real nail art vocabulary.
Every prompt must begin with "A macro editorial photograph of" and include lighting and finish details.
Return ONLY the prompt text, nothing else. No preamble, no explanation, no quotes.`,
      messages: [
        {
          role: 'user',
          content: `Write a Flux image generation prompt for this nail design:
Shape: ${shape}
Vibe: ${vibe}
Color palette: ${palette}
${detailsList}
${ageContext}

The prompt should feel like it was written by a professional nail technician who also understands editorial photography. Be specific about colors, textures, finishes, and any special effects.`,
        },
      ],
    });

    const prompt = message.content[0].text.trim();
    return Response.json({ prompt });

  } catch (err) {
    console.error('Build prompt error:', err);
    return Response.json({ error: 'Failed to build prompt' }, { status: 500 });
  }
}
