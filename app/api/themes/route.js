// api/themes.js
// Nail Generator — Airtable theme fetcher
// Fetches all active themes from the Nail Generator base and returns
// them formatted for the frontend. In-memory cache holds results for
// 10 minutes so Airtable isn't hit on every page load.

// ── CACHE ─────────────────────────────────────────────────────────────────────

let cache = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ── FIELD IDS ─────────────────────────────────────────────────────────────────
// These match the fields created in the Themes table

const FIELDS = {
  THEME_NAME: 'fldp5k1yeU1VvaJNM',
  CATEGORY:   'fldinoNPAmBQAa7G3',
  NAIL_SHAPE: 'fldGAurasQaOc6hUk',
  FINISH_TYPE:'fldffTi3ly0XrMrV6',
  BASE_COLOR: 'fldrHmlQt0IWPhOj3',
  DETAILS:    'fldj4jJaadKMODx6i',
  AI_PROMPT:  'fldql3AYBXSuwnICE',
  ACTIVE:     'fldUaK1CWPy0YjCoL',
};

// ── HANDLER ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional ?bust=1 query param to force cache refresh
  const bustCache = req.query.bust === '1';

  const now = Date.now();
  if (cache && !bustCache && now - cacheTimestamp < CACHE_TTL_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json({ themes: cache, count: cache.length });
  }

  const apiKey  = process.env.AIRTABLE_API_KEY;
  const baseId  = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;

  if (!apiKey || !baseId || !tableId) {
    return res.status(500).json({ error: 'Airtable credentials not configured' });
  }

  try {
    const themes = await fetchAllThemes(apiKey, baseId, tableId);

    // Update cache
    cache = themes;
    cacheTimestamp = now;

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json({ themes, count: themes.length });

  } catch (err) {
    console.error('Airtable fetch error:', err);

    // If cache is stale but exists, return it rather than failing hard
    if (cache) {
      res.setHeader('X-Cache', 'STALE');
      return res.status(200).json({ themes: cache, count: cache.length });
    }

    return res.status(500).json({ error: 'Failed to fetch themes from Airtable' });
  }
}

// ── AIRTABLE FETCH (handles pagination) ───────────────────────────────────────

async function fetchAllThemes(apiKey, baseId, tableId) {
  const themes = [];
  let offset = null;

  // Airtable returns max 100 records per request — paginate with offset
  do {
    const url = buildAirtableUrl(baseId, tableId, offset);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Airtable API ${response.status}: ${errText}`);
    }

    const data = await response.json();

    for (const record of data.records) {
      const f = record.fields;

      // Only include active themes
      if (!f[FIELDS.ACTIVE]) continue;

      themes.push({
        id:         record.id,
        themeName:  f[FIELDS.THEME_NAME]  || '',
        category:   f[FIELDS.CATEGORY]    || 'Editorial & Specialty',
        nailShape:  f[FIELDS.NAIL_SHAPE]  || 'Almond',
        finishType: f[FIELDS.FINISH_TYPE] || 'High-Gloss',
        baseColor:  f[FIELDS.BASE_COLOR]  || '',
        details:    f[FIELDS.DETAILS]     || '',
        aiPrompt:   f[FIELDS.AI_PROMPT]   || '',
      });
    }

    offset = data.offset || null;

  } while (offset);

  // Sort alphabetically within each category
  themes.sort((a, b) => {
    if (a.category < b.category) return -1;
    if (a.category > b.category) return 1;
    return a.themeName.localeCompare(b.themeName);
  });

  return themes;
}

// ── URL BUILDER ───────────────────────────────────────────────────────────────

function buildAirtableUrl(baseId, tableId, offset) {
  const base = `https://api.airtable.com/v0/${baseId}/${tableId}`;

  const params = new URLSearchParams();

  // Only fetch the fields we need
  Object.values(FIELDS).forEach(fieldId => {
    params.append('fields[]', fieldId);
  });

  // Filter to active only (belt-and-suspenders with the JS check above)
  params.set('filterByFormula', `{${FIELDS.ACTIVE}} = TRUE()`);
  params.set('pageSize', '100');

  if (offset) {
    params.set('offset', offset);
  }

  return `${base}?${params.toString()}`;
}
