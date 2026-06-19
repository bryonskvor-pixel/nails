// app/api/themes/route.js
// Uses field NAMES not IDs — matches CSV import column headers exactly

let cache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bust = searchParams.get('bust') === '1';
  const now = Date.now();

  if (cache && !bust && now - cacheTimestamp < CACHE_TTL) {
    return Response.json({ themes: cache, count: cache.length }, {
      headers: { 'X-Cache': 'HIT' }
    });
  }

  const apiKey  = process.env.AIRTABLE_API_KEY;
  const baseId  = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;

  if (!apiKey || !baseId || !tableId) {
    return Response.json({ error: 'Airtable credentials not configured' }, { status: 500 });
  }

  try {
    const themes = await fetchAllThemes(apiKey, baseId, tableId);
    cache = themes;
    cacheTimestamp = now;
    return Response.json({ themes, count: themes.length }, {
      headers: { 'X-Cache': 'MISS' }
    });
  } catch (err) {
    console.error('Airtable error:', err.message);
    if (cache) {
      return Response.json({ themes: cache, count: cache.length }, {
        headers: { 'X-Cache': 'STALE' }
      });
    }
    return Response.json({ error: 'Failed to fetch themes', detail: err.message }, { status: 500 });
  }
}

async function fetchAllThemes(apiKey, baseId, tableId) {
  const themes = [];
  let offset = null;

  do {
    const params = new URLSearchParams();
    params.set('pageSize', '100');
    if (offset) params.set('offset', offset);

    const res = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableId}?${params}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Airtable ${res.status}: ${errText}`);
    }

    const data = await res.json();

    for (const record of data.records) {
      const f = record.fields;
      const themeName = f['Theme Name'] || '';

      // Skip empty rows or any stray header row imported as data
      if (!themeName || themeName === 'Theme Name') continue;

      themes.push({
        id:         record.id,
        themeName,
        category:   f['Category']    || 'Editorial & Specialty',
        nailShape:  f['Nail Shape']  || 'Almond',
        finishType: f['Finish Type'] || 'High-Gloss',
        baseColor:  f['Base Color']  || '',
        details:    f['Details']     || '',
        aiPrompt:   f['AI Prompt']   || '',
      });
    }

    offset = data.offset || null;
  } while (offset);

  themes.sort((a, b) =>
    a.category.localeCompare(b.category) || a.themeName.localeCompare(b.themeName)
  );

  return themes;
}
