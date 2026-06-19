'use client';

import { useState, useEffect, useRef } from 'react';

// ── CONSTANTS ──────────────────────────────────────────────────────────────────

const HANDS = [
  { id: 'hand-01', src: '/hands/hand-01.jpg', label: 'Fair / Cool',   group: 'adult' },
  { id: 'hand-02', src: '/hands/hand-02.jpg', label: 'Fair / Warm',   group: 'adult' },
  { id: 'hand-03', src: '/hands/hand-03.jpg', label: 'Medium',        group: 'adult' },
  { id: 'hand-04', src: '/hands/hand-04.jpg', label: 'Warm / Golden', group: 'adult' },
  { id: 'hand-05', src: '/hands/hand-05.jpg', label: 'Olive',         group: 'adult' },
  { id: 'hand-06', src: '/hands/hand-06.jpg', label: 'Deep / Warm',   group: 'adult' },
  { id: 'hand-07', src: '/hands/hand-07.png', label: 'Deep / Rich',   group: 'adult' },
];

const HAND_GROUPS = [
  { id: 'adult', label: 'Adult' },
];

const SHAPES   = ['Almond', 'Coffin', 'Stiletto', 'Square', 'Oval', 'Round'];
const VIBES    = ['Elegant & luxurious', 'Bold & edgy', 'Cute & playful', 'Minimal & clean', 'Dark & moody', 'Whimsical & romantic'];
const PALETTES = ['Soft nudes & blush', 'Deep jewel tones', 'Chrome & metallics', 'Pastels', 'Neon & bright', 'Black & white', 'Earth tones', 'Iridescent & shifting'];
const DETAILS  = ['Rhinestone accents', '3D elements', 'Gold foil', 'Glitter', 'Marble effect', 'Floral art', 'French tips', 'Chrome powder'];

const PINK   = '#B85CA8';
const PINKLT = '#F7EDF5';
const PINKDK = '#8A3D7A';

// ── HELPERS ────────────────────────────────────────────────────────────────────

function getOrCreateSession() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem('ng_session');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('ng_session', id); }
  return id;
}

// ── BEFORE/AFTER SLIDER ────────────────────────────────────────────────────────

function BeforeAfterSlider({ beforeSrc, afterSrc }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    const updatePos = (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setPos(Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100)));
    };
    const onUp        = () => { dragging.current = false; };
    const onMouseMove = (e) => { if (dragging.current) updatePos(e.clientX); };
    const onTouchMove = (e) => { if (dragging.current) { e.preventDefault(); updatePos(e.touches[0].clientX); } };

    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const startDrag = (clientX) => {
    dragging.current = true;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos(Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => startDrag(e.clientX)}
      onTouchStart={(e) => startDrag(e.touches[0].clientX)}
      style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px 12px 0 0', userSelect: 'none', cursor: 'ew-resize', touchAction: 'none' }}
    >
      <img src={afterSrc} alt="Generated nail design" style={{ width: '100%', display: 'block' }} />

      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={beforeSrc} alt="Original hand" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>

      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: 2, background: 'white', transform: 'translateX(-1px)', boxShadow: '0 0 8px rgba(0,0,0,0.4)', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 38, height: 38, borderRadius: '50%', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#666', letterSpacing: '-2px', fontWeight: 700 }}>
          ◀▶
        </div>
      </div>

      <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 700, color: 'white', background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.05em', pointerEvents: 'none' }}>BEFORE</div>
      <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700, color: 'white', background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.05em', pointerEvents: 'none' }}>AFTER</div>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────

export default function NailGenerator() {
  const [tab, setTab]               = useState('pick-hand');
  const [handGroup, setHandGroup]   = useState('adult');
  const [selectedHand, setSelectedHand] = useState(null);

  const [themes, setThemes]               = useState([]);
  const [themesLoading, setThemesLoading] = useState(true);
  const [selectedCat, setSelectedCat]     = useState('All');
  const [selectedTheme, setSelectedTheme] = useState(null);

  const [promptMode, setPromptMode]     = useState('guided');
  const [answers, setAnswers]           = useState({ shape: '', vibe: '', palette: '', details: [] });
  const [builderNotes, setBuilderNotes] = useState('');
  const [customText, setCustomText]     = useState('');
  const [buildingPrompt, setBuildingPrompt] = useState(false);

  const [finalPrompt, setFinalPrompt] = useState('');
  const [generating, setGenerating]   = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [resultUrl, setResultUrl]     = useState(null);
  const [resultMeta, setResultMeta]   = useState('');
  const [genError, setGenError]       = useState(null);
  const [gallery, setGallery]         = useState([]);

  const [credits, setCredits]         = useState(null);
  const [showBooking, setShowBooking] = useState(false);

  const pollRef        = useRef(null);
  const progressRef    = useRef(null);
  const genStartRef    = useRef(null);
  const timeoutRef     = useRef(null);
  const pendingMeta    = useRef(null);

  // ── EFFECTS ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchThemes();
    fetchCredits();
    return () => {
      clearInterval(pollRef.current);
      clearInterval(progressRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  // Progress bar animation
  useEffect(() => {
    if (generating) {
      genStartRef.current = Date.now();
      setGenProgress(2);
      progressRef.current = setInterval(() => {
        const elapsed = (Date.now() - genStartRef.current) / 1000;
        let p;
        if (elapsed < 8)  p = 2 + (elapsed / 8) * 33;
        else if (elapsed < 30) p = 35 + ((elapsed - 8) / 22) * 47;
        else p = 82;
        setGenProgress(Math.min(82, p));
      }, 300);
    } else {
      clearInterval(progressRef.current);
      if (resultUrl) setGenProgress(100);
    }
    return () => clearInterval(progressRef.current);
  }, [generating, resultUrl]);

  // Add to gallery when result arrives
  useEffect(() => {
    if (resultUrl && pendingMeta.current) {
      const { handSrc, meta } = pendingMeta.current;
      setGallery(prev => [
        { imageUrl: resultUrl, handSrc, meta },
        ...prev.filter(g => g.imageUrl !== resultUrl),
      ].slice(0, 4));
      pendingMeta.current = null;
    }
  }, [resultUrl]);

  // ── DATA FETCHING ─────────────────────────────────────────────────────────────

  async function fetchThemes() {
    try {
      const data = await fetch('/api/themes').then(r => r.json());
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
      const data = await fetch(`/api/credits?session=${sessionId}`).then(r => r.json());
      setCredits(data);
    } catch (e) {
      console.error('Credits fetch failed', e);
    }
  }

  async function consumeCredit() {
    const sessionId = getOrCreateSession();
    const data = await fetch('/api/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    }).then(r => r.json());
    setCredits(data);
    if (!data.allowed) { setShowBooking(true); return false; }
    return true;
  }

  // ── PROMPT BUILDER ────────────────────────────────────────────────────────────

  async function handleBuildPrompt() {
    if (!answers.shape || !answers.vibe || !answers.palette) return;
    setBuildingPrompt(true);
    try {
      const data = await fetch('/api/build-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shape:    answers.shape,
          vibe:     answers.vibe,
          palette:  answers.palette,
          details:  answers.details,
          notes:    builderNotes.trim(),
          ageGroup: selectedHand?.group || 'adult',
        }),
      }).then(r => r.json());
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

  // ── GENERATION ────────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!finalPrompt || !selectedHand) return;
    const allowed = await consumeCredit();
    if (!allowed) return;

    setGenerating(true);
    setResultUrl(null);
    setGenError(null);
    setGenProgress(0);
    pendingMeta.current = { handSrc: selectedHand.src, meta: resultMeta };

    try {
      const data = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt:        finalPrompt,
          handImagePath: selectedHand.src,
          nailShape:     answers.shape || selectedTheme?.nailShape || 'Almond',
          ageGroup:      selectedHand.group,
        }),
      }).then(r => r.json());

      if (!data.taskId) throw new Error('No task ID returned');

      // 90-second hard timeout
      timeoutRef.current = setTimeout(() => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setGenError('This is taking longer than usual. Please try again.');
          setGenerating(false);
        }
      }, 90000);

      pollRef.current = setInterval(async () => {
        try {
          const poll = await fetch(`/api/poll?id=${data.taskId}`).then(r => r.json());
          if (poll.status === 'Ready') {
            clearInterval(pollRef.current);
            clearTimeout(timeoutRef.current);
            setResultUrl(poll.imageUrl);
            setGenerating(false);
          } else if (poll.status === 'Error') {
            clearInterval(pollRef.current);
            clearTimeout(timeoutRef.current);
            setGenError('Generation failed. Please try again.');
            setGenerating(false);
          }
        } catch {
          clearInterval(pollRef.current);
          clearTimeout(timeoutRef.current);
          setGenError('Connection error. Please try again.');
          setGenerating(false);
        }
      }, 2000);

    } catch (e) {
      console.error('Generate failed', e);
      setGenError('Something went wrong. Please try again.');
      setGenerating(false);
    }
  }

  // ── DOWNLOAD ──────────────────────────────────────────────────────────────────

  function handleDownload() {
    if (!resultUrl) return;
    const name = `${(resultMeta || 'nail-design').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`;
    const a = document.createElement('a');
    a.href = `/api/download?url=${encodeURIComponent(resultUrl)}&name=${encodeURIComponent(name)}`;
    a.download = name;
    a.click();
  }

  // ── DERIVED STATE ─────────────────────────────────────────────────────────────

  const categories   = ['All', ...Array.from(new Set(themes.map(t => t.category)))];
  const filtered     = selectedCat === 'All' ? themes : themes.filter(t => t.category === selectedCat);
  const visibleHands = HANDS.filter(h => h.group === handGroup);
  const builderSteps = [answers.shape, answers.vibe, answers.palette].filter(Boolean).length;
  const builderPct   = Math.round((builderSteps / 3) * 100);

  const progressLabel =
    genProgress < 25 ? 'Analyzing your hand...' :
    genProgress < 55 ? 'Applying nail design...' :
    genProgress < 82 ? 'Adding finishing touches...' : 'Almost ready...';

  async function useTheme(theme) {
    setSelectedTheme(theme);
    setResultMeta(theme.themeName);

    const isDetailed = theme.aiPrompt.length >= 200 ||
      /^(a macro|an editorial|a crisp|a close-up|a detailed|a stunning|a beautiful)/i.test(theme.aiPrompt.trim());

    if (isDetailed) {
      setFinalPrompt(theme.aiPrompt);
      setTab('generate');
      return;
    }

    // Short/minimal Airtable prompt — expand with Claude before generating
    setBuildingPrompt(true);
    setFinalPrompt('');
    setTab('generate');

    try {
      const data = await fetch('/api/build-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shape:        theme.nailShape || 'Almond',
          vibe:         'Elegant & luxurious',
          palette:      theme.baseColor || theme.finishType || 'Custom',
          details:      [],
          notes:        '',
          ageGroup:     selectedHand?.group || 'adult',
          themeContext: {
            themeName:  theme.themeName,
            aiPrompt:   theme.aiPrompt,
            finishType: theme.finishType,
            baseColor:  theme.baseColor,
            details:    theme.details,
          },
        }),
      }).then(r => r.json());
      setFinalPrompt(data.prompt || theme.aiPrompt);
    } catch {
      setFinalPrompt(theme.aiPrompt);
    } finally {
      setBuildingPrompt(false);
    }
  }

  function toggleDetail(d) {
    setAnswers(prev => ({
      ...prev,
      details: prev.details.includes(d) ? prev.details.filter(x => x !== d) : [...prev.details, d],
    }));
  }

  // ── STYLES ────────────────────────────────────────────────────────────────────

  const s = {
    page:        { minHeight: '100vh', background: '#FAFAFA', fontFamily: "'Inter', system-ui, sans-serif", color: '#1a1a1a' },
    header:      { background: 'white', borderBottom: '1px solid #EBEBEB', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, position: 'sticky', top: 0, zIndex: 10 },
    logo:        { fontSize: 15, fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.01em' },
    creditBadge: { fontSize: 12, padding: '4px 10px', borderRadius: 20, background: credits?.remaining > 0 ? PINKLT : '#FFF3F3', color: credits?.remaining > 0 ? PINKDK : '#C0392B', fontWeight: 500, whiteSpace: 'nowrap' },
    main:        { maxWidth: 780, margin: '0 auto', padding: '20px 16px 100px' },
    sectionLabel:{ fontSize: 11, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 10 },

    chip: (active) => ({ padding: '7px 14px', borderRadius: 20, border: `1px solid ${active ? PINK : '#E0E0E0'}`, background: active ? PINKLT : 'white', color: active ? PINKDK : '#555', fontSize: 13, cursor: 'pointer', fontWeight: active ? 500 : 400, whiteSpace: 'nowrap', minHeight: 38 }),
    qOpt: (active) => ({ padding: '8px 14px', borderRadius: 16, border: `1px solid ${active ? PINK : '#E5E5E5'}`, background: active ? PINKLT : 'white', color: active ? PINKDK : '#555', fontSize: 13, cursor: 'pointer', fontWeight: active ? 500 : 400, minHeight: 38 }),

    primaryBtn: (disabled) => ({ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: disabled ? '#E5E5E5' : PINK, color: disabled ? '#AAA' : 'white', fontSize: 15, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.15s', minHeight: 50 }),
    ghostBtn:   { padding: '10px 16px', borderRadius: 10, border: `1px solid ${PINK}`, background: 'transparent', color: PINKDK, fontSize: 13, cursor: 'pointer', fontWeight: 500, minHeight: 42 },
    card:       { background: 'white', borderRadius: 12, border: '1px solid #EBEBEB', overflow: 'hidden' },
  };

  const TABS       = ['pick-hand', 'theme', 'builder', 'generate'];
  const TAB_LABELS = ['Choose hand', 'Pick theme', 'Build prompt', 'Generate'];

  // ── RENDER ────────────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      <style>{`
        @keyframes progressPulse { 0%,100%{opacity:1} 50%{opacity:0.75} }
        .gen-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        .gen-result {}
        .step-label { display:inline; }
        @media (max-width:620px) {
          .gen-grid { grid-template-columns:1fr; }
          .gen-result { order:-1; }
          .step-label { display:none; }
          .step-active .step-label { display:inline; }
        }
      `}</style>

      {/* Header */}
      <header style={s.header}>
        <span style={s.logo}>✦ Nail Design Studio</span>
        {credits && (
          <span style={s.creditBadge}>
            {credits.remaining} design{credits.remaining !== 1 ? 's' : ''} left
          </span>
        )}
      </header>

      <main style={s.main}>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}>
          {TABS.map((t, i) => {
            const done   = TABS.indexOf(tab) > i;
            const active = tab === t;
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => setTab(t)}
                  className={active ? 'step-active' : ''}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 0' }}
                >
                  <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: done ? PINK : active ? PINKLT : '#F0F0F0', border: `2px solid ${active || done ? PINK : '#E0E0E0'}`, color: done ? 'white' : active ? PINKDK : '#AAA', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span className="step-label" style={{ fontSize: 12, color: active ? PINKDK : '#999', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>
                    {TAB_LABELS[i]}
                  </span>
                </button>
                {i < 3 && <div style={{ width: 16, height: 1, background: '#E5E5E5', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>

        {/* ── TAB: PICK HAND ── */}
        {tab === 'pick-hand' && (
          <div>
            <div style={{ ...s.card, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Choose your hand</div>
              <div style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>Pick the closest match to see how your design will look.</div>

              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {HAND_GROUPS.map(g => (
                  <button key={g.id} style={s.chip(handGroup === g.id)} onClick={() => setHandGroup(g.id)}>{g.label}</button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                {visibleHands.map(hand => (
                  <div key={hand.id} onClick={() => setSelectedHand(hand)} style={{ borderRadius: 10, border: `2px solid ${selectedHand?.id === hand.id ? PINK : '#EBEBEB'}`, overflow: 'hidden', cursor: 'pointer', background: selectedHand?.id === hand.id ? PINKLT : 'white', transition: 'border-color 0.15s' }}>
                    <img src={hand.src} alt={hand.label} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: '5px 6px', fontSize: 11, color: '#666', textAlign: 'center' }}>{hand.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <button style={s.primaryBtn(!selectedHand)} disabled={!selectedHand} onClick={() => setTab('theme')}>
              {selectedHand ? 'Next — Pick a theme →' : 'Select a hand to continue'}
            </button>
          </div>
        )}

        {/* ── TAB: THEME LIBRARY ── */}
        {tab === 'theme' && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {categories.map(c => (
                <button key={c} style={s.chip(selectedCat === c)} onClick={() => setSelectedCat(c)}>
                  {c} <span style={{ opacity: 0.5, fontSize: 11 }}>({c === 'All' ? themes.length : themes.filter(t => t.category === c).length})</span>
                </button>
              ))}
            </div>

            {themesLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#AAA' }}>Loading themes...</div>
            ) : (
              <>
                <div style={s.sectionLabel}>{filtered.length} themes</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, maxHeight: 420, overflowY: 'auto', marginBottom: 16 }}>
                  {filtered.map(t => (
                    <div key={t.id} onClick={() => setSelectedTheme(selectedTheme?.id === t.id ? null : t)} style={{ padding: 12, borderRadius: 10, border: `${selectedTheme?.id === t.id ? 2 : 1}px solid ${selectedTheme?.id === t.id ? PINK : '#EBEBEB'}`, background: selectedTheme?.id === t.id ? PINKLT : 'white', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', marginBottom: 3, lineHeight: 1.3 }}>{t.themeName}</div>
                      <div style={{ fontSize: 11, color: '#AAA', marginBottom: 6 }}>{t.category}</div>
                      <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10, background: '#F4F4F4', color: '#666' }}>{t.nailShape}</div>
                    </div>
                  ))}
                </div>

                {selectedTheme && (
                  <div style={{ ...s.card, padding: 16, marginBottom: 16, background: PINKLT, border: `1px solid ${PINK}` }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{selectedTheme.themeName}</div>
                    <div style={{ fontSize: 12, color: PINKDK, marginBottom: 8 }}>{selectedTheme.category} · {selectedTheme.nailShape}</div>
                    <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5, marginBottom: 12 }}>{selectedTheme.aiPrompt.substring(0, 150)}...</div>
                    <button style={s.ghostBtn} onClick={() => useTheme(selectedTheme)}>Use this theme →</button>
                  </div>
                )}

                <button style={{ ...s.ghostBtn, width: '100%' }} onClick={() => setTab('builder')}>Build my own prompt instead</button>
              </>
            )}
          </div>
        )}

        {/* ── TAB: PROMPT BUILDER ── */}
        {tab === 'builder' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              <button style={s.chip(promptMode === 'guided')} onClick={() => setPromptMode('guided')}>Step-by-step guide</button>
              <button style={s.chip(promptMode === 'custom')} onClick={() => setPromptMode('custom')}>Write my own</button>
            </div>

            {promptMode === 'guided' && (
              <div>
                <div style={{ height: 4, background: '#F0E8F5', borderRadius: 4, marginBottom: 20 }}>
                  <div style={{ height: '100%', width: `${Math.max(4, builderPct)}%`, background: PINK, borderRadius: 4, transition: 'width 0.3s' }} />
                </div>

                {[
                  { key: 'shape',   label: '1. What shape?',    options: SHAPES   },
                  { key: 'vibe',    label: '2. What vibe?',     options: VIBES    },
                  { key: 'palette', label: '3. Color palette?', options: PALETTES },
                ].map(({ key, label, options }) => (
                  <div key={key} style={{ background: 'white', borderRadius: 10, padding: '14px 16px', marginBottom: 10, border: '1px solid #EBEBEB' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{label}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {options.map(o => (
                        <button key={o} style={s.qOpt(answers[key] === o)} onClick={() => setAnswers(p => ({ ...p, [key]: o }))}>{o}</button>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ background: 'white', borderRadius: 10, padding: '14px 16px', marginBottom: 10, border: '1px solid #EBEBEB' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>4. Special details? <span style={{ fontWeight: 400, color: '#AAA' }}>(optional)</span></div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {DETAILS.map(d => (
                      <button key={d} style={s.qOpt(answers.details.includes(d))} onClick={() => toggleDetail(d)}>{d}</button>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: 10, padding: '14px 16px', marginBottom: 16, border: '1px solid #EBEBEB' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>5. Any personal touches? <span style={{ fontWeight: 400, color: '#AAA' }}>(optional)</span></div>
                  <div style={{ fontSize: 12, color: '#AAA', marginBottom: 8 }}>Claude will work these into your design.</div>
                  <textarea
                    value={builderNotes}
                    onChange={e => setBuilderNotes(e.target.value)}
                    placeholder="e.g. accent nail on ring finger, goes with a burgundy dress, tiny heart somewhere..."
                    style={{ width: '100%', minHeight: 80, padding: '10px 12px', borderRadius: 8, border: '1px solid #E0E0E0', fontSize: 13, lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <button style={s.primaryBtn(builderSteps < 3 || buildingPrompt)} disabled={builderSteps < 3 || buildingPrompt} onClick={handleBuildPrompt}>
                  {buildingPrompt ? 'Crafting your prompt...' : builderSteps < 3 ? `Answer ${3 - builderSteps} more question${3 - builderSteps > 1 ? 's' : ''}` : 'Build my prompt with AI ✦'}
                </button>
              </div>
            )}

            {promptMode === 'custom' && (
              <div>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 10, lineHeight: 1.6 }}>
                  Describe exactly what you want — shape, color, finish, and any accents.
                </p>
                <textarea
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder="e.g. Long stiletto nails with a deep burgundy velvet magnetic cat-eye finish, accent nail with gold chrome dripping effect..."
                  style={{ width: '100%', minHeight: 140, padding: '12px', borderRadius: 10, border: '1px solid #E0E0E0', fontSize: 13, lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                />
                <button style={{ ...s.primaryBtn(!customText.trim()), marginTop: 10 }} disabled={!customText.trim()} onClick={() => { setFinalPrompt(customText.trim()); setResultMeta('Custom prompt'); setTab('generate'); }}>
                  Use this prompt →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: GENERATE ── */}
        {tab === 'generate' && (
          <>
            <div className="gen-grid">

              {/* Controls */}
              <div>
                <div style={s.sectionLabel}>Selected hand</div>
                {selectedHand ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <img src={selectedHand.src} alt={selectedHand.label} style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', border: `2px solid ${PINK}` }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedHand.label}</div>
                      <div style={{ fontSize: 11, color: '#AAA' }}>{HAND_GROUPS.find(g => g.id === selectedHand.group)?.label}</div>
                      <button onClick={() => setTab('pick-hand')} style={{ fontSize: 11, color: PINKDK, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2 }}>Change</button>
                    </div>
                  </div>
                ) : (
                  <button style={{ ...s.ghostBtn, marginBottom: 16 }} onClick={() => setTab('pick-hand')}>← Choose a hand first</button>
                )}

                <div style={s.sectionLabel}>Your prompt</div>
                <textarea
                  value={finalPrompt}
                  onChange={e => !buildingPrompt && setFinalPrompt(e.target.value)}
                  placeholder={buildingPrompt ? 'Crafting your personalized prompt...' : 'Select a theme or build a prompt first...'}
                  style={{ width: '100%', minHeight: 140, padding: '10px 12px', borderRadius: 10, border: '1px solid #E0E0E0', fontSize: 12, lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit', outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
                />

                {credits && (
                  <div style={{ fontSize: 12, color: credits.remaining > 0 ? '#888' : '#C0392B', marginBottom: 10, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                    <span>{credits.remaining} design{credits.remaining !== 1 ? 's' : ''} remaining</span>
                    <span style={{ color: '#CCC' }}>Flux Kontext Pro</span>
                  </div>
                )}

                <button style={s.primaryBtn(!finalPrompt.trim() || !selectedHand || generating || buildingPrompt)} disabled={!finalPrompt.trim() || !selectedHand || generating || buildingPrompt} onClick={handleGenerate}>
                  {generating ? 'Generating...' : buildingPrompt ? 'Crafting prompt...' : 'Generate design ✦'}
                </button>

                {genError && <div style={{ marginTop: 10, fontSize: 13, color: '#C0392B', lineHeight: 1.5 }}>{genError}</div>}
              </div>

              {/* Result */}
              <div className="gen-result">
                <div style={s.sectionLabel}>Your design</div>
                <div style={s.card}>
                  {generating && (
                    <div style={{ padding: '28px 20px', background: '#FAFAFA' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#555', marginBottom: 16, textAlign: 'center' }}>Creating your design...</div>
                      <div style={{ background: '#F0E8F5', borderRadius: 8, height: 10, overflow: 'hidden', marginBottom: 10 }}>
                        <div style={{ height: '100%', width: `${genProgress}%`, background: `linear-gradient(90deg, ${PINKDK}, ${PINK})`, borderRadius: 8, transition: 'width 0.5s ease', animation: genProgress < 95 ? 'progressPulse 2s ease-in-out infinite' : 'none' }} />
                      </div>
                      <div style={{ textAlign: 'center', fontSize: 12, color: '#AAA', marginBottom: 4 }}>{progressLabel}</div>
                      <div style={{ textAlign: 'center', fontSize: 11, color: '#CCC' }}>Usually takes 20–40 seconds</div>
                    </div>
                  )}

                  {!generating && !resultUrl && (
                    <div style={{ minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#FAFAFA' }}>
                      <div style={{ fontSize: 40, opacity: 0.1 }}>✦</div>
                      <div style={{ fontSize: 13, color: '#CCC' }}>Your design appears here</div>
                    </div>
                  )}

                  {resultUrl && selectedHand && (
                    <>
                      <BeforeAfterSlider beforeSrc={selectedHand.src} afterSrc={resultUrl} />
                      <div style={{ padding: '12px 14px', borderTop: '1px solid #EBEBEB' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{resultMeta}</div>
                        <div style={{ fontSize: 11, color: '#AAA', marginBottom: 10 }}>
                          {selectedHand.label} · {HAND_GROUPS.find(g => g.id === selectedHand.group)?.label}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={handleDownload} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${PINK}`, background: PINKLT, color: PINKDK, fontSize: 12, cursor: 'pointer', fontWeight: 500, minHeight: 40 }}>Save design</button>
                          <button onClick={handleGenerate} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #E0E0E0', background: 'white', color: '#555', fontSize: 12, cursor: 'pointer', minHeight: 40 }}>Regenerate</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Inline book CTA — shows after first result */}
                {resultUrl && credits && (
                  <div style={{ marginTop: 12, padding: '16px', background: `linear-gradient(135deg, ${PINKLT}, #F0E4EF)`, borderRadius: 12, border: `1px solid ${PINK}30`, textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Love this look?</div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>Book with {credits.salonName} to bring it to life.</div>
                    <a href={credits.bookingUrl || '/'} style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 10, background: PINK, color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
                      Book my appointment →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Session gallery */}
            {gallery.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={s.sectionLabel}>This session</div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                  {gallery.map((item, i) => (
                    <div key={i} onClick={() => setResultUrl(item.imageUrl)} style={{ flexShrink: 0, width: 80, cursor: 'pointer', borderRadius: 8, overflow: 'hidden', border: `2px solid ${resultUrl === item.imageUrl ? PINK : '#EBEBEB'}`, transition: 'border-color 0.15s' }}>
                      <img src={item.imageUrl} alt={item.meta} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                      <div style={{ padding: '3px 5px', fontSize: 10, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.meta}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── BOOKING MODAL ── */}
        {showBooking && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '32px 24px', maxWidth: 360, width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Love what you see?</div>
              <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>
                You've used your free designs. Book an appointment to unlock {credits?.bookingUnlockCount || 5} more and bring your favorite look to life.
              </div>
              <a href={credits?.bookingUrl || '/'} style={{ display: 'block', padding: '14px 0', borderRadius: 12, background: PINK, color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 15, marginBottom: 12 }}>
                Book my appointment
              </a>
              <button onClick={() => setShowBooking(false)} style={{ background: 'none', border: 'none', color: '#AAA', fontSize: 13, cursor: 'pointer', padding: 8 }}>
                Maybe later
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
