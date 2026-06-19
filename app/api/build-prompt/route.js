import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are a professional nail art prompt engineer writing image generation prompts for Flux AI.
Your prompts always produce stunning, realistic nail photography.
Write prompts that are specific, editorial, and use real nail art vocabulary.
Every prompt must begin with "A macro editorial photograph of" and include lighting and finish details.
CRITICAL: The prompt must explicitly state that ALL FIVE nails on the hand are fully painted and designed — never leave any nail bare or unfinished.
Return ONLY the prompt text, nothing else. No preamble, no explanation, no quotes.`;

export async function POST(request) {
  try {
    const { shape, vibe, palette, details, notes, ageGroup, themeContext } = await request.json();

    if (!shape || !vibe || !palette) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ageContext = ageGroup === 'tween'
      ? 'The nails are on a young girl (11-13), so keep the design age-appropriate, fun, and cute. Shorter nail lengths only.'
      : ageGroup === 'teen'
      ? 'The nails are on a teenage girl (15-17), so the design can be trendy and expressive but still age-appropriate. Short to medium nail lengths.'
      : 'The nails are on an adult woman. Any nail length and style is appropriate.';

    let userContent;

    if (themeContext) {
      // Theme expansion mode — short Airtable prompt needs to become a full Flux prompt
      userContent = `Expand this nail design theme into a rich, detailed Flux image generation prompt:

Theme name: ${themeContext.themeName}
Design brief: ${themeContext.aiPrompt}
Nail shape: ${shape}
Finish type: ${themeContext.finishType || 'varies'}
Base color: ${themeContext.baseColor || 'varies'}
Special details: ${themeContext.details || 'none specified'}
${ageContext}

Write a detailed editorial photography prompt that captures the full essence of "${themeContext.themeName}". Be specific about textures, colors, finishes, effects, and lighting. Make it aspirational and salon-worthy.`;
    } else {
      // Guided builder mode
      const detailsList = details && details.length > 0
        ? `Special accent details to include: ${details.join(', ')}.`
        : 'No special accent details requested.';

      const personalNotes = notes && notes.length > 0
        ? `Personal notes from the client (incorporate these): ${notes}`
        : '';

      userContent = `Write a Flux image generation prompt for this nail design:
Shape: ${shape}
Vibe: ${vibe}
Color palette: ${palette}
${detailsList}
${personalNotes}
${ageContext}

The prompt should feel like it was written by a professional nail technician who also understands editorial photography. Be specific about colors, textures, finishes, and any special effects. Make sure to emphasize that every single nail — all five — is fully designed and painted.`;
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: SYSTEM,
      messages: [{ role: 'user', content: userContent }],
    });

    const prompt = message.content[0].text.trim();
    return Response.json({ prompt });

  } catch (err) {
    console.error('Build prompt error:', err);
    return Response.json({ error: 'Failed to build prompt' }, { status: 500 });
  }
}
