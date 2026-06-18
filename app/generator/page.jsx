'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── CONSTANTS ──────────────────────────────────────────────────────────────────

const HANDS = [
  { id: 'hand-01', src: '/hands/hand-01.jpg', label: 'Fair / Cool',    group: 'adult' },
  { id: 'hand-02', src: '/hands/hand-02.jpg', label: 'Fair / Warm',    group: 'adult' },
  { id: 'hand-03', src: '/hands/hand-03.jpg', label: 'Medium',         group: 'adult' },
  { id: 'hand-04', src: '/hands/hand-04.jpg', label: 'Warm / Golden',  group: 'adult' },
  { id: 'hand-05', src: '/hands/hand-05.jpg', label: 'Olive',          group: 'adult' },
  { id: 'hand-06', src: '/hands/hand-06.jpg', label: 'Deep / Warm',    group: 'adult' },
  { id: 'hand-07', src: '/hands/hand-07.jpg', label: 'Deep / Rich',    group: 'adult' },
  { id: 'hand-08', src: '/hands/hand-08.jpg', label: 'Deep / Cool',    group: 'adult' },
  { id: 'hand-09', src: '/hands/hand-09.jpg', label: 'Fair',           group: 'teen'  },
  { id: 'hand-10', src: '/hands/hand-10.jpg', label: 'Medium',         group: 'teen'  },
  { id: 'hand-11', src: '/hands/hand-11.jpg', label: 'Deep',           group: 'teen'  },
  { id: 'hand-12', src: '/hands/hand-12.jpg', label: 'Fair',           group: 'tween' },
  { id: 'hand-13', src: '/hands/hand-13.jpg', label: 'Medium',         group: 'tween' },
  { id: 'hand-14', src: '/hands/hand-14.jpg', label: 'Deep',           group: 'tween' },
];

const HAND_GROUPS = [
  { id: 'adult', label: 'Adult' },
  { id: 'teen',  label: 'High School' },
  { id: 'tween', label: 'Middle School' },
];

const SHAPES  = ['Almond', 'Coffin', 'Stiletto', 'Square', 'Oval', 'Round'];
const VIBES   = ['Elegant & luxurious', 'Bold & edgy', 'Cute & playful', 'Minimal & clean', 'Dark & moody', 'Whimsical & romantic'];
const PALETTES = ['Soft nudes & blush', 'Deep jewel tones', 'Chrome & metallics', 'Pastels', 'Neon & bright', 'Black & white', 'Earth tones', 'Iridescent & shifting'];
const DETAILS  = ['Rhinestone accents', '3D elements', 'Gold foil', 'Glitter', 'Marble effect', 'Floral art', 'French tips', 'Chrome powder'];

// ── HELPERS ────────────────────────────────────────────────────────────────────

function getOrCreateSession() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem('ng_session');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('ng_session', id);
  }
  return id;
}

function getAbsoluteHandUrl(src) {
  if (typeof window === 'undefined') return src;
  return `${window.location.origin}${src}`;
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────

export default function NailGenerator() {
  // Tab state
  const [tab, setTab] = useState('pick-hand'); // pick-hand | theme | builder | generate

  // Hand selection
  const [handGroup, setHandGroup] = useState('adult');
  const [selectedHand, setSelectedHand] = useState(null);

  // Theme library
  const [themes, setThemes]         = useState([]);
  const [themesLoading, setThemesLoading] = useState(true);
  const [selectedCat, setSelectedCat]     = useState('All');
  const [selectedTheme, setSelectedTheme] = useState(null);

  // Guided builder
  const [promptMode, setPromptMode] = useState('guided');
  const [answers, setAnswers] = useState({ shape: '', vibe: '', palette: '', details: [] });
  const [customText, setCustomText] = useState('');
  const [buildingPrompt, setBuildingPrompt] = useState(false);

  // Generate
  const [finalPrompt, setFinalPrompt] = useState('');
  const [generating, setGenerating]   = useState(false);
  const [resultUrl, setResultUrl]     = useState(null);
  const [resultMeta, setResultMeta]   = useState('');
  const [genError, setGenError]       = useState(null);
  const pollRef = useRef(null);

  // Credits
  const [credits, setCredits]       = useState(null);
  const [showBooking, setShowBooking] = useState(false);

  // ── EFFECTS ────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchThemes();
    fetchCredits();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  // ── DATA FETCHING ──────────────────────────────────────────────────────────

  async function fetchThemes() {
    try {
      const res = await fetch('/api/themes');
      const data = await res.json();
      setThemes(data.themes || []);
    } catch (e) {
      console.error('Themes fetch failed', e);
    } finally {
      setThemesLoading(false);
    }
  }

  async function fetchCredits() {
    const sessionId = getOrCreateSession();
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/credits?session=${sessionId}`);
      const data = await res.json();
      setCredits(data);
    } catch (e) {
      console.error('Credits fetch failed', e);
    }
  }

  async function consumeCredit() {
    const sessionId = getOrCreateSession();
    const res = await fetch('/api/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    const data = await res.json();
    setCredits(data);
    if (!data.allowed) {
      setShowBooking(true);
      return false;
    }
    return true;
  }

  // ── PROMPT BUILDER ─────────────────────────────────────────────────────────

  async function handleBuildPrompt() {
    if (!answers.shape || !answers.vibe || !answers.palette) return;
    setBuildingPrompt(true);
    try {
      const res = await fetch('/api/build-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shape:    answers.shape,
          vibe:     answers.vibe,
          palette:  answers.palette,
          details:  answers.details,
          ageGroup: selectedHand?.group || 'adult',
        }),
      });
      const data = await res.json();
      if (data.prompt) {
        setFinalPrompt(data.prompt);
        setResultMeta('Custom: ' + answers.vibe);
        setTab('generate');
      }
    } catch (e) {
      console.error('Build prompt failed', e);
    } finally {
      setBuildingPrompt(false);
    }
  }

  // ── GENERATION ─────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!finalPrompt || !selectedHand) return;

    const allowed = await consumeCredit();
    if (!allowed) return;

    setGenerating(true);
    setResultUrl(null);
    setGenError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt:       finalPrompt,
          handImageUrl: getAbsoluteHandUrl(selectedHand.src),
          nailShape:    answers.shape || selectedTheme?.nailShape || 'Almond',
          ageGroup:     selectedHand.group,
        }),
      });

      const data = await res.json();
      if (!data.taskId) throw new Error('No task ID returned');

      // Start polling
      pollRef.current = setInterval(async () => {
        try {
          const pollRes  = await fetch(`/api/poll?id=${data.taskId}`);
          const pollData = await pollRes.json();

          if (pollData.status === 'Ready') {
            clearInterval(pollRef.current);
            setResultUrl(pollData.imageUrl);
            setGenerating(false);
          } else if (pollData.status === 'Error') {
            clearInterval(pollRef.current);
            setGenError('Generation failed. Try again.');
            setGenerating(false);
          }
        } catch (e) {
          clearInterval(pollRef.current);
          setGenError('Connection error. Try again.');
          setGenerating(false);
        }
      }, 2000);

    } catch (e) {
      console.error('Generate failed', e);
      setGenError('Something went wrong. Try again.');
      setGenerating(false);
    }
  }

  // ── DOWNLOAD ───────────────────────────────────────────────────────────────

  function handleDownload() {
    if (!resultUrl) return;
    const name = `${(resultMeta || 'nail-design').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`;
    const url  = `/api/download?url=${encodeURIComponent(resultUrl)}&name=${encodeURIComponent(name)}`;
    const a    = document.createElement('a');
    a.href     = url;
    a.download = name;
    a.click();
  }

  // ── DERIVED STATE ──────────────────────────────────────────────────────────

  const categories = ['All', ...Array.from(new Set(themes.map(t => t.category)))];
  const filtered   = selectedCat === 'All' ? themes : themes.filter(t => t.category === selectedCat);
  const visibleHands = HANDS.filter(h => h.group === handGroup);
  const builderSteps = [answers.shape, answers.vibe, answers.palette].filter(Boolean).length;
  const progress     = Math.round((builderSteps / 3) * 100);

  function useTheme(theme) {
    setFinalPrompt(theme.aiPrompt);
    setResultMeta(theme.themeName);
    setSelectedTheme(theme);
    setTab('generate');
  }

  function toggleDetail(d) {
    setAnswers(prev => ({
      ...prev,
      details: prev.details.includes(d)
        ? prev.details.filter(x => x !== d)
        : [...prev.details, d],
    }));
  }

  // ── STYLES ─────────────────────────────────────────────────────────────────

  const PINK   = '#B85CA8';
  const PINKLT = '#F7EDF5';
  const PINKDK = '#8A3D7A';

  const s = {
    page: {
      minHeight: '100vh',
      background: '#FAFAFA',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#1a1a1a',
    },
    header: {
      background: 'white',
      borderBottom: '1px solid #EBEBEB',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 56,
      position: 'sticky',
      top: 0,
      zIndex: 10,
    },
    logo: { fontSize: 16, fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.01em' },
    creditBadge: {
      fontSize: 12,
      padding: '4px 10px',
      borderRadius: 20,
      background: credits?.remaining > 0 ? PINKLT : '#FFF3F3',
      color: credits?.remaining > 0 ? PINKDK : '#C0392B',
      fontWeight: 500,
    },
    main: { maxWidth: 780, margin: '0 auto', padding: '24px 16px 80px' },
    tabs: {
      display: 'flex',
      gap: 2,
      borderBottom: '1px solid #EBEBEB',
      marginBottom: 24,
    },
    tab: (active) => ({
      padding: '10px 16px',
      border: 'none',
      background: 'transparent',
      borderBottom: `2px solid ${active ? PINK : 'transparent'}`,
      color: active ? PINKDK : '#888',
      fontWeight: active ? 600 : 400,
      fontSize: 14,
      cursor: 'pointer',
      marginBottom: -1,
      transition: 'all 0.15s',
    }),
    sectionLabel: {
      fontSize: 11,
      color: '#AAAAAA',
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      fontWeight: 600,
      marginBottom: 10,
    },
    chip: (active) => ({
      padding: '5px 12px',
      borderRadius: 20,
      border: `1px solid ${active ? PINK : '#E0E0E0'}`,
      background: active ? PINKLT : 'white',
      color: active ? PINKDK : '#555',
      fontSize: 13,
      cursor: 'pointer',
      fontWeight: active ? 500 : 400,
      whiteSpace: 'nowrap',
    }),
    qOpt: (active) => ({
      padding: '6px 14px',
      borderRadius: 16,
      border: `1px solid ${active ? PINK : '#E5E5E5'}`,
      background: active ? PINKLT : 'white',
      color: active ? PINKDK : '#555',
      fontSize: 13,
      cursor: 'pointer',
      fontWeight: active ? 500 : 400,
    }),
    primaryBtn: (disabled) => ({
      width: '100%',
      padding: '12px 0',
      borderRadius: 10,
      border: 'none',
      background: disabled ? '#E5E5E5' : PINK,
      color: disabled ? '#AAA' : 'white',
      fontSize: 15,
      fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 0.15s',
    }),
    ghostBtn: {
      padding: '8px 16px',
      borderRadius: 8,
      border: `1px solid ${PINK}`,
      background: 'transparent',
      color: PINKDK,
      fontSize: 13,
      cursor: 'pointer',
      fontWeight: 500,
    },
    card: {
      background: 'white',
      borderRadius: 12,
      border: '1px solid #EBEBEB',
      overflow: 'hidden',
    },
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <span style={s.logo}>✦ Nail Design Studio</span>
        {credits && (
          <span style={s.creditBadge}>
            {credits.remaining} design{credits.remaining !== 1 ? 's' : ''} remaining
          </span>
        )}
      </header>

      <main style={s.main}>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          {['pick-hand', 'theme', 'builder', 'generate'].map((t, i) => {
            const labels = ['Choose hand', 'Pick theme', 'Build prompt', 'Generate'];
            const done = ['pick-hand','theme','builder','generate'].indexOf(tab) > i;
            const active = tab === t;
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => setTab(t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: done ? PINK : active ? PINKLT : '#F0F0F0',
                    border: `2px solid ${active || done ? PINK : '#E0E0E0'}`,
                    color: done ? 'white' : active ? PINKDK : '#AAA',
                    fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 12, color: active ? PINKDK : '#888', fontWeight: active ? 600 : 400 }}>
                    {labels[i]}
                  </span>
                </button>
                {i < 3 && <div style={{ width: 20, height: 1, background: '#E0E0E0' }} />}
              </div>
            );
          })}
        </div>

        {/* ── TAB: PICK HAND ── */}
        {tab === 'pick-hand' && (
          <div>
            <div style={{ ...s.card, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Choose your hand</div>
              <div style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>
                Pick the closest match to see how your design will look.
              </div>

              {/* Age group tabs */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {HAND_GROUPS.map(g => (
                  <button key={g.id} style={s.chip(handGroup === g.id)} onClick={() => setHandGroup(g.id)}>
                    {g.label}
                  </button>
                ))}
              </div>

              {/* Hand grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                {visibleHands.map(hand => (
                  <div
                    key={hand.id}
                    onClick={() => setSelectedHand(hand)}
                    style={{
                      borderRadius: 10,
                      border: `2px solid ${selectedHand?.id === hand.id ? PINK : '#EBEBEB'}`,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: selectedHand?.id === hand.id ? PINKLT : 'white',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <img
                      src={hand.src}
                      alt={hand.label}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ padding: '6px 8px', fontSize: 11, color: '#666', textAlign: 'center' }}>
                      {hand.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              style={s.primaryBtn(!selectedHand)}
              disabled={!selectedHand}
              onClick={() => setTab('theme')}
            >
              {selectedHand ? 'Next — Pick a theme' : 'Select a hand to continue'}
            </button>
          </div>
        )}

        {/* ── TAB: THEME LIBRARY ── */}
        {tab === 'theme' && (
          <div>
            <div style={s.sectionLabel}>Filter by category</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {categories.map(c => (
                <button key={c} style={s.chip(selectedCat === c)} onClick={() => setSelectedCat(c)}>
                  {c} <span style={{ opacity: 0.5, fontSize: 11 }}>
                    ({c === 'All' ? themes.length : themes.filter(t => t.category === c).length})
                  </span>
                </button>
              ))}
            </div>

            {themesLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#AAA' }}>Loading themes...</div>
            ) : (
              <>
                <div style={s.sectionLabel}>{filtered.length} themes</div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: 10, maxHeight: 420, overflowY: 'auto', marginBottom: 16,
                }}>
                  {filtered.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTheme(selectedTheme?.id === t.id ? null : t)}
                      style={{
                        padding: '12px',
                        borderRadius: 10,
                        border: `${selectedTheme?.id === t.id ? 2 : 1}px solid ${selectedTheme?.id === t.id ? PINK : '#EBEBEB'}`,
                        background: selectedTheme?.id === t.id ? PINKLT : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', marginBottom: 3, lineHeight: 1.3 }}>
                        {t.themeName}
                      </div>
                      <div style={{ fontSize: 11, color: '#AAA', marginBottom: 6 }}>{t.category}</div>
                      <div style={{
                        display: 'inline-block', padding: '2px 8px',
                        borderRadius: 10, fontSize: 10,
                        background: '#F4F4F4', color: '#666',
                      }}>
                        {t.nailShape}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTheme && (
                  <div style={{ ...s.card, padding: 16, marginBottom: 16, background: PINKLT, border: `1px solid ${PINK}` }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{selectedTheme.themeName}</div>
                    <div style={{ fontSize: 12, color: PINKDK, marginBottom: 8 }}>
                      {selectedTheme.category} · {selectedTheme.nailShape}
                    </div>
                    <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5, marginBottom: 12 }}>
                      {selectedTheme.aiPrompt.substring(0, 150)}...
                    </div>
                    <button style={s.ghostBtn} onClick={() => useTheme(selectedTheme)}>
                      Use this theme →
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ ...s.ghostBtn, flex: 1 }} onClick={() => setTab('builder')}>
                    Build my own prompt instead
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB: PROMPT BUILDER ── */}
        {tab === 'builder' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              <button style={s.chip(promptMode === 'guided')} onClick={() => setPromptMode('guided')}>
                Step-by-step guide
              </button>
              <button style={s.chip(promptMode === 'custom')} onClick={() => setPromptMode('custom')}>
                Write my own
              </button>
            </div>

            {promptMode === 'guided' && (
              <div>
                {/* Progress bar */}
                <div style={{ height: 3, background: '#F0E8F5', borderRadius: 2, marginBottom: 20 }}>
                  <div style={{ height: '100%', width: `${Math.max(4, progress)}%`, background: PINK, borderRadius: 2, transition: 'width 0.3s' }} />
                </div>

                {[
                  { key: 'shape',   label: '1. What shape?',           options: SHAPES   },
                  { key: 'vibe',    label: '2. What vibe?',            options: VIBES    },
                  { key: 'palette', label: '3. Color palette?',        options: PALETTES },
                ].map(({ key, label, options }) => (
                  <div key={key} style={{ background: 'white', borderRadius: 10, padding: '14px 16px', marginBottom: 10, border: '1px solid #EBEBEB' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#1a1a1a' }}>{label}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {options.map(o => (
                        <button key={o} style={s.qOpt(answers[key] === o)} onClick={() => setAnswers(p => ({ ...p, [key]: o }))}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ background: 'white', borderRadius: 10, padding: '14px 16px', marginBottom: 16, border: '1px solid #EBEBEB' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#1a1a1a' }}>
                    4. Special details? <span style={{ fontWeight: 400, color: '#AAA' }}>(optional)</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {DETAILS.map(d => (
                      <button key={d} style={s.qOpt(answers.details.includes(d))} onClick={() => toggleDetail(d)}>{d}</button>
                    ))}
                  </div>
                </div>

                <button
                  style={s.primaryBtn(builderSteps < 3 || buildingPrompt)}
                  disabled={builderSteps < 3 || buildingPrompt}
                  onClick={handleBuildPrompt}
                >
                  {buildingPrompt
                    ? 'Crafting your prompt...'
                    : builderSteps < 3
                    ? `Answer ${3 - builderSteps} more question${3 - builderSteps > 1 ? 's' : ''}`
                    : 'Build my prompt with AI ✦'}
                </button>
              </div>
            )}

            {promptMode === 'custom' && (
              <div>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 10, lineHeight: 1.6 }}>
                  Describe exactly what you want. Be specific about shape, color, finish, and any accents.
                </p>
                <textarea
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder="e.g. Long stiletto nails with a deep burgundy velvet magnetic cat-eye finish, accent nail with gold chrome dripping effect from the cuticle, ultra-glossy topcoat..."
                  style={{
                    width: '100%', minHeight: 130, padding: '12px',
                    borderRadius: 10, border: '1px solid #E0E0E0',
                    fontSize: 13, lineHeight: 1.6, resize: 'vertical',
                    fontFamily: 'inherit', outline: 'none',
                  }}
                />
                <button
                  style={{ ...s.primaryBtn(!customText.trim()), marginTop: 10 }}
                  disabled={!customText.trim()}
                  onClick={() => {
                    setFinalPrompt(customText.trim());
                    setResultMeta('Custom prompt');
                    setTab('generate');
                  }}
                >
                  Use this prompt →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: GENERATE ── */}
        {tab === 'generate' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Left column */}
            <div>
              <div style={s.sectionLabel}>Selected hand</div>
              {selectedHand ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <img
                    src={selectedHand.src}
                    alt={selectedHand.label}
                    style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: `2px solid ${PINK}` }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedHand.label}</div>
                    <div style={{ fontSize: 11, color: '#AAA' }}>
                      {HAND_GROUPS.find(g => g.id === selectedHand.group)?.label}
                    </div>
                    <button
                      onClick={() => setTab('pick-hand')}
                      style={{ fontSize: 11, color: PINKDK, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2 }}
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <button style={s.ghostBtn} onClick={() => setTab('pick-hand')}>← Choose a hand first</button>
              )}

              <div style={s.sectionLabel}>Your prompt</div>
              <textarea
                value={finalPrompt}
                onChange={e => setFinalPrompt(e.target.value)}
                placeholder="Select a theme or build a prompt first..."
                style={{
                  width: '100%', minHeight: 160, padding: '10px 12px',
                  borderRadius: 10, border: '1px solid #E0E0E0',
                  fontSize: 12, lineHeight: 1.6, resize: 'vertical',
                  fontFamily: 'inherit', outline: 'none', marginBottom: 12,
                }}
              />

              {credits && (
                <div style={{
                  fontSize: 12, color: credits.remaining > 0 ? '#888' : '#C0392B',
                  marginBottom: 8, display: 'flex', justifyContent: 'space-between',
                }}>
                  <span>{credits.remaining} design{credits.remaining !== 1 ? 's' : ''} remaining</span>
                  <span style={{ color: '#BBB' }}>Powered by Flux · ~$0.06/image</span>
                </div>
              )}

              <button
                style={s.primaryBtn(!finalPrompt.trim() || !selectedHand || generating)}
                disabled={!finalPrompt.trim() || !selectedHand || generating}
                onClick={handleGenerate}
              >
                {generating ? 'Generating your design...' : 'Generate design ✦'}
              </button>

              {genError && (
                <div style={{ marginTop: 10, fontSize: 13, color: '#C0392B' }}>{genError}</div>
              )}
            </div>

            {/* Right column — result */}
            <div>
              <div style={s.sectionLabel}>Your design</div>
              <div style={{ ...s.card, minHeight: 300 }}>
                {generating && (
                  <div style={{
                    minHeight: 300, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 12,
                    background: '#FAFAFA',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      border: `3px solid ${PINKLT}`, borderTop: `3px solid ${PINK}`,
                      animation: 'spin 1s linear infinite',
                    }} />
                    <div style={{ fontSize: 13, color: '#AAA' }}>Creating your design...</div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                )}

                {!generating && !resultUrl && (
                  <div style={{
                    minHeight: 300, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: '#FAFAFA',
                  }}>
                    <div style={{ fontSize: 36, opacity: 0.15 }}>✦</div>
                    <div style={{ fontSize: 13, color: '#CCC' }}>Your design appears here</div>
                  </div>
                )}

                {resultUrl && (
                  <>
                    <img
                      src={resultUrl}
                      alt="Generated nail design"
                      style={{ width: '100%', display: 'block', borderRadius: '12px 12px 0 0' }}
                    />
                    <div style={{ padding: '12px 14px', borderTop: '1px solid #EBEBEB' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{resultMeta}</div>
                      <div style={{ fontSize: 11, color: '#AAA', marginBottom: 10 }}>
                        {selectedHand?.label} · {selectedHand && HAND_GROUPS.find(g => g.id === selectedHand.group)?.label}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={handleDownload}
                          style={{ flex: 1, padding: '7px 0', borderRadius: 7, border: `1px solid ${PINK}`, background: PINKLT, color: PINKDK, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
                        >
                          Download
                        </button>
                        <button
                          onClick={handleGenerate}
                          style={{ flex: 1, padding: '7px 0', borderRadius: 7, border: '1px solid #E0E0E0', background: 'white', color: '#555', fontSize: 12, cursor: 'pointer' }}
                        >
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── BOOKING MODAL ── */}
        {showBooking && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, padding: 20,
          }}>
            <div style={{
              background: 'white', borderRadius: 16, padding: 28,
              maxWidth: 380, width: '100%', textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                Love what you see?
              </div>
              <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>
                You've used your free designs. Book an appointment to unlock {credits?.bookingUnlockCount || 5} more and bring your favorite look to life.
              </div>
              <a
                href={credits?.bookingUrl || '/'}
                style={{
                  display: 'block', width: '100%', padding: '12px 0',
                  borderRadius: 10, background: PINK, color: 'white',
                  textDecoration: 'none', fontWeight: 600, fontSize: 15,
                  marginBottom: 10,
                }}
              >
                Book my appointment
              </a>
              <button
                onClick={() => setShowBooking(false)}
                style={{ background: 'none', border: 'none', color: '#AAA', fontSize: 13, cursor: 'pointer' }}
              >
                Maybe later
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
