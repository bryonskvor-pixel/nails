// app/api/poll/route.js
// Polls BFL for generation result by taskId
// Returns { status: "Pending" | "Ready" | "Error", imageUrl? }

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return Response.json({ error: 'Missing task id' }, { status: 400 });
  }

  const apiKey = process.env.BFL_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'BFL_API_KEY not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
     `https://api.bfl.ai/v1/get_result?id=${encodeURIComponent(id)}`
      { headers: { 'X-Key': apiKey } }
    );

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: 'Poll failed', detail: err }, { status: response.status });
    }

    const data = await response.json();

    // Normalize the response for the frontend
    if (data.status === 'Ready') {
      return Response.json({
        status: 'Ready',
        imageUrl: data.result?.sample || data.result?.url || null,
      });
    }

    if (data.status === 'Error' || data.status === 'Content Moderated') {
      return Response.json({ status: 'Error', message: data.status });
    }

    // Still pending
    return Response.json({ status: 'Pending' });

  } catch (err) {
    console.error('Poll error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
