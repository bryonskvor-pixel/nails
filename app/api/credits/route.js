// app/api/credits/route.js
// Lightweight session-based credit tracking
// Config drives free generations and booking unlock count
// In production swap sessionStore for Supabase/Redis for persistence

// ── CONFIG ────────────────────────────────────────────────────────────────────
// These values come from env vars so white-label clients can override them

const CONFIG = {
  freeGenerations:    parseInt(process.env.FREE_GENERATIONS    || '3'),
  bookingUnlockCount: parseInt(process.env.BOOKING_UNLOCK_COUNT || '5'),
  bookingUrl:         process.env.BOOKING_URL || '/',
  salonName:          process.env.SALON_NAME  || 'the salon',
};

// ── IN-MEMORY SESSION STORE ────────────────────────────────────────────────────
// Keyed by sessionId (UUID generated client-side, stored in localStorage)
// In production replace with: supabase.from('credits').select/upsert
const sessionStore = new Map();

// ── HANDLERS ──────────────────────────────────────────────────────────────────

// GET /api/credits?session=xxx  — check remaining credits
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session');

  if (!sessionId) {
    return Response.json({ error: 'Missing session' }, { status: 400 });
  }

  const session = getOrCreateSession(sessionId);
  return Response.json(formatResponse(session));
}

// POST /api/credits  — consume one credit
export async function POST(request) {
  try {
    const { sessionId, action } = await request.json();

    if (!sessionId) {
      return Response.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const session = getOrCreateSession(sessionId);

    // Handle booking unlock action
    if (action === 'unlock') {
      session.unlockedByBooking = true;
      session.bonusCredits = CONFIG.bookingUnlockCount;
      sessionStore.set(sessionId, session);
      return Response.json({ ...formatResponse(session), unlocked: true });
    }

    // Check if generation is allowed
    const totalAllowed = CONFIG.freeGenerations + (session.unlockedByBooking ? session.bonusCredits : 0);
    if (session.used >= totalAllowed) {
      return Response.json({
        allowed: false,
        remaining: 0,
        bookingUrl: CONFIG.bookingUrl,
        salonName: CONFIG.salonName,
        message: `Book with ${CONFIG.salonName} to unlock ${CONFIG.bookingUnlockCount} more designs`,
      }, { status: 402 });
    }

    // Consume one credit
    session.used += 1;
    sessionStore.set(sessionId, session);

    return Response.json(formatResponse(session));

  } catch (err) {
    console.error('Credits error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function getOrCreateSession(sessionId) {
  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, {
      used: 0,
      unlockedByBooking: false,
      bonusCredits: 0,
      createdAt: Date.now(),
    });
  }
  return sessionStore.get(sessionId);
}

function formatResponse(session) {
  const totalAllowed = CONFIG.freeGenerations + (session.unlockedByBooking ? session.bonusCredits : 0);
  const remaining = Math.max(0, totalAllowed - session.used);

  return {
    allowed: remaining > 0,
    remaining,
    used: session.used,
    total: totalAllowed,
    freeGenerations: CONFIG.freeGenerations,
    unlockedByBooking: session.unlockedByBooking,
    bonusCredits: session.bonusCredits,
    bookingUrl: CONFIG.bookingUrl,
    salonName: CONFIG.salonName,
  };
}
