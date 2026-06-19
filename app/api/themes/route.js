// app/api/themes/route.js
// Fetches all active themes from Airtable with 10-minute in-memory cache

const FIELD_IDS = {
  THEME_NAME:  'fldp5k1yeU1VvaJNM',
  CATEGORY:    'fldinoNPAmBQAa7G3',
  NAIL_SHAPE:  'fldGAurasQaOc6hUk',
  FINISH_TYPE: 'fldffTi3ly0XrMrV6',
  BASE_COLOR:  'fldrHmlQt0IWPhOj3',
  DETAILS:     'fldj4jJaadKMODx6i',
  AI_PROMPT:   'fldql3AYBXSuwnICE',
  ACTIVE:      'fldUaK1CWPy0YjCoL',
};

let cache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

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
    console.error('Airtable error:', err);
    if (cache) {
      return Response.json({ themes: cache, count: cache.length }, {
        headers: { 'X-Cache': 'STALE' }
      });
    }
    return Response.json({ error: 'Failed to fetch themes' }, { status: 500 });
  }
}

async function fetchAllThemes(apiKey, baseId, tableId) {
  const themes = [];
  let offset = null;

  do {
    const params = new URLSearchParams();
    Object.values(FIELD_IDS).forEach(id => params.append('fields[]', id));
    // No filter — return all records
// params.set('filterByFormula', `{${FIELD_IDS.ACTIVE}} = TRUE()`);
    params.set('pageSize', '100');
    if (offset) params.set('offset', offset);

    const res = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableId}?${params}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!res.ok) throw new Error(`Airtable ${res.status}`);
    const data = await res.json();

    for (const record of data.records) {
      const f = record.fields;
   
      themes.push({
        id:         record.id,
        themeName:  f[FIELD_IDS.THEME_NAME]  || '',
        category:   f[FIELD_IDS.CATEGORY]    || 'Editorial & Specialty',
        nailShape:  f[FIELD_IDS.NAIL_SHAPE]  || 'Almond',
        finishType: f[FIELD_IDS.FINISH_TYPE] || 'High-Gloss',
        baseColor:  f[FIELD_IDS.BASE_COLOR]  || '',
        details:    f[FIELD_IDS.DETAILS]     || '',
        aiPrompt:   f[FIELD_IDS.AI_PROMPT]   || '',
      });
    }

    offset = data.offset || null;
  } while (offset);

  themes.sort((a, b) => a.category.localeCompare(b.category) || a.themeName.localeCompare(b.themeName));
  return themes;
}
