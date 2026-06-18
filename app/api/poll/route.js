// api/poll.js
// Nail Generator — BFL result polling proxy
// Matches the pattern from remodel.guide/api/poll
// Deploy to Vercel. Requires BFL_API_KEY in environment variables.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing task id' });
  }

  const apiKey = process.env.BFL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'BFL_API_KEY not configured' });
  }

  try {
    const response = await fetch(`https://api.us1.bfl.ai/v1/get_result?id=${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'X-Key': apiKey,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('BFL poll error:', response.status, errText);
      return res.status(response.status).json({ error: 'Poll error', detail: errText });
    }

    const data = await response.json();

    // BFL returns:
    // { status: "Pending" }
    // { status: "Ready", result: { sample: "https://..." } }
    // { status: "Error" }
    // { status: "Content Moderated" }
    return res.status(200).json(data);

  } catch (err) {
    console.error('Poll error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
