/* mobile-shared.jsx — primitives shared across the 3 mobile variants.
   All three layouts share: camera feed card, telemetry strip, E-stop,
   approval card, joystick, task queue row, robot picker header. */

// ─── icons (reuse glyphs from desktop) ─────────────────────────
const MIcon = ({ d, size = 18, stroke = 1.7, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);
const MI = {
  play: 'M8 5v14l11-7z',
  pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
  stop: 'M6 6h12v12H6z',
  cam: 'M3 7h4l2-3h6l2 3h4v12H3zM12 17a4 4 0 100-8 4 4 0 000 8z',
  map: 'M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
  bolt: 'M13 2L3 14h7l-1 8 10-12h-7l1-8z',
  wifi: 'M5 12a10 10 0 0114 0M8.5 15.5a5 5 0 017 0M12 19h.01',
  chat: 'M21 12a8 8 0 01-12 7l-5 2 2-5a8 8 0 1115-4z',
  queue: 'M4 6h16M4 12h16M4 18h10',
  check: 'M5 12l5 5L20 7',
  close: 'M6 6l12 12M18 6L6 18',
  alert: 'M12 9v4M12 17h.01M10.3 3.9L2.4 17.6A2 2 0 004.1 20.5h15.8a2 2 0 001.7-2.9L13.7 3.9a2 2 0 00-3.4 0z',
  chevron: 'M9 6l6 6-6 6',
  chevronDown: 'M6 9l6 6 6-6',
  expand: 'M4 4h6M4 4v6M20 20h-6M20 20v-6',
  joystick: 'M12 4v16M4 12h16',
  fullscreen: 'M4 9V4h5M20 15v5h-5M4 15v5h5M20 9V4h-5',
  menu: 'M4 7h16M4 12h16M4 17h10',
  mic: 'M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3zM5 11a7 7 0 0014 0M12 19v3',
  pin: 'M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zM12 11a2 2 0 100-4 2 2 0 000 4z',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h.1a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5h.1a1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v.1a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z',
  agent: 'M12 8V4M8 4h8M6 8h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2zM9 13v2M15 13v2',
};

// ─── camera feed (reused across layouts) ───────────────────────
function MFeed({ height = 200, radius = 14, crosshair = true, showOverlay = true, children }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf; const loop = () => { setT(p => p + 1); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, []);
  const drift = Math.sin(t * 0.008) * 3;
  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: radius,
      overflow: 'hidden', background: '#0b0d12' }}>
      <img src="assets/camera-feed.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', transform: `scale(1.05) translate(${drift * 0.4}px, ${drift * 0.2}px)`,
          filter: 'saturate(1.05) contrast(1.02)' }}/>
      {/* scanline */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: `${(t * 0.3) % 100}%`,
        height: 40, background: 'linear-gradient(180deg, transparent, rgba(91,91,247,.12), transparent)',
        pointerEvents: 'none' }}/>
      {/* crosshair */}
      {crosshair && (
        <svg style={{ position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)', opacity: .55 }} width="36" height="36" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#fff" strokeWidth="1"/>
          <line x1="18" y1="6" x2="18" y2="14" stroke="#fff" strokeWidth="1"/>
          <line x1="18" y1="22" x2="18" y2="30" stroke="#fff" strokeWidth="1"/>
          <line x1="6" y1="18" x2="14" y2="18" stroke="#fff" strokeWidth="1"/>
          <line x1="22" y1="18" x2="30" y2="18" stroke="#fff" strokeWidth="1"/>
        </svg>
      )}
      {/* top-left LIVE chip + signal */}
      {showOverlay && (
        <>
          <div style={{ position: 'absolute', top: 10, left: 10,
            display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(0,0,0,.55)', padding: '3px 8px', borderRadius: 999,
              fontSize: 10, fontWeight: 600, color: '#fff', letterSpacing: .3,
              backdropFilter: 'blur(6px)' }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: '#ef4444',
                animation: 'mobPulse 1.2s ease infinite' }}/>
              LIVE
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'rgba(0,0,0,.55)', padding: '3px 8px', borderRadius: 999,
              fontSize: 10, color: '#fff', fontFamily: 'var(--mono)',
              backdropFilter: 'blur(6px)' }}>
              4K · 60fps
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 10, left: 10,
            fontFamily: 'var(--mono)', fontSize: 10, color: '#fff',
            background: 'rgba(0,0,0,.55)', padding: '3px 8px', borderRadius: 4,
            backdropFilter: 'blur(6px)' }}>
            CAM-01 · Hallway-3F
          </div>
        </>
      )}
      {children}
    </div>
  );
}

// ─── telemetry strip (compact) ─────────────────────────────────
function MTelemetry({ compact = false, dark = false, battery = 82, signal = 4,
  cpu = 34, latency = 28, mode = 'AUTO' }) {
  const bg = dark ? 'rgba(255,255,255,.06)' : 'var(--surface-2)';
  const border = dark ? 'rgba(255,255,255,.08)' : 'var(--border)';
  const ink = dark ? 'rgba(255,255,255,.95)' : 'var(--ink)';
  const ink2 = dark ? 'rgba(255,255,255,.55)' : 'var(--ink-3)';
  const cell = (label, val, accent) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
      <div style={{ fontSize: 9, color: ink2, letterSpacing: .6, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: compact ? 12 : 13, fontWeight: 600, color: accent || ink,
        fontFamily: 'var(--mono)' }}>{val}</div>
    </div>
  );
  const batColor = battery < 20 ? 'var(--danger)' : battery < 40 ? 'var(--warn)' : ink;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12,
      padding: compact ? '8px 12px' : '10px 14px', background: bg,
      border: `1px solid ${border}`, borderRadius: 10 }}>
      {cell('MODE', mode, mode === 'AUTO' ? 'var(--ok)' : mode === 'MANUAL' ? 'var(--warn)' : 'var(--danger)')}
      {cell('BATT', `${battery}%`, batColor)}
      {cell('NET', `${signal}/5`)}
      {cell('CPU', `${cpu}%`)}
      {cell('PING', `${latency}ms`)}
    </div>
  );
}

// ─── E-stop button ─────────────────────────────────────────────
function MEStop({ size = 64, onPress, pressed, float = false, label = true }) {
  return (
    <button onClick={onPress} style={{
      width: size, height: size, borderRadius: size / 2,
      background: pressed
        ? 'radial-gradient(circle at 35% 30%, #fca5a5, #991b1b)'
        : 'radial-gradient(circle at 35% 30%, #ef4444, #b91c1c)',
      border: '3px solid #7f1d1d',
      boxShadow: float
        ? '0 8px 20px rgba(220,38,38,.4), 0 0 0 4px rgba(255,255,255,.9), inset 0 -3px 6px rgba(0,0,0,.25)'
        : '0 2px 6px rgba(220,38,38,.3), inset 0 -3px 6px rgba(0,0,0,.25), inset 0 2px 3px rgba(255,255,255,.3)',
      color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 1, cursor: 'pointer', fontWeight: 700, letterSpacing: 1,
      fontFamily: 'var(--mono)', fontSize: 10, padding: 0,
    }}>
      <MIcon d={MI.stop} size={size * 0.28} stroke={2.4}/>
      {label && <div style={{ fontSize: size * 0.12 }}>E-STOP</div>}
    </button>
  );
}

// ─── approval card (agent asks for permission) ─────────────────
function MApproval({ title, detail, meta, accent, onApprove, onDeny, dark = false, compact = false }) {
  const surface = dark ? '#1a1c22' : '#fff';
  const border = dark ? 'rgba(255,255,255,.1)' : 'var(--border)';
  const ink = dark ? '#fff' : 'var(--ink)';
  const ink2 = dark ? 'rgba(255,255,255,.65)' : 'var(--ink-2)';
  const ink3 = dark ? 'rgba(255,255,255,.45)' : 'var(--ink-3)';
  return (
    <div style={{ background: surface, border: `1px solid ${border}`,
      borderRadius: 14, padding: compact ? 12 : 14, boxShadow: dark ? 'none' : '0 1px 2px rgba(0,0,0,.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 11,
          background: 'linear-gradient(135deg, var(--agent), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MIcon d={MI.agent} size={12} stroke={2} />
          <style>{`.agent-dot { color: white; }`}</style>
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--agent)', letterSpacing: .3,
          textTransform: 'uppercase' }}>Agent needs approval</div>
        <div style={{ marginLeft: 'auto', fontSize: 10, color: ink3, fontFamily: 'var(--mono)' }}>{meta || 'now'}</div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: ink, marginBottom: 4, lineHeight: 1.3 }}>{title}</div>
      {detail && <div style={{ fontSize: 12.5, color: ink2, lineHeight: 1.45, marginBottom: 12 }}>{detail}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onDeny} style={{
          flex: 1, padding: '10px 12px', borderRadius: 10,
          border: `1px solid ${border}`, background: dark ? 'rgba(255,255,255,.04)' : 'var(--surface-2)',
          color: ink, fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <MIcon d={MI.close} size={14} stroke={2.2}/> Deny
        </button>
        <button onClick={onApprove} style={{
          flex: 1.3, padding: '10px 12px', borderRadius: 10, border: 'none',
          background: 'var(--ok)', color: '#fff', fontWeight: 600, fontSize: 13.5,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: '0 1px 2px rgba(22,163,74,.4)',
        }}>
          <MIcon d={MI.check} size={14} stroke={2.4}/> Approve
        </button>
      </div>
    </div>
  );
}

// ─── joystick control ──────────────────────────────────────────
function MJoystick({ size = 180, onChange, dark = false }) {
  const [pos, setPos] = React.useState({ x: 0, y: 0, active: false });
  const ref = React.useRef(null);
  const r = size / 2;
  const handleRadius = size * 0.22;
  const handleStart = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const move = (ev) => {
      const pt = ev.touches ? ev.touches[0] : ev;
      let dx = pt.clientX - cx;
      let dy = pt.clientY - cy;
      const d = Math.hypot(dx, dy);
      const max = r - handleRadius;
      if (d > max) { dx = dx * max / d; dy = dy * max / d; }
      setPos({ x: dx, y: dy, active: true });
      onChange?.({ x: dx / max, y: -dy / max });
    };
    const up = () => {
      setPos({ x: 0, y: 0, active: false });
      onChange?.({ x: 0, y: 0 });
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    move(e);
  };
  const bg = dark ? 'radial-gradient(circle at 30% 25%, rgba(255,255,255,.08), rgba(255,255,255,.02))' : 'radial-gradient(circle at 30% 25%, #fff, #e9e8e3)';
  const border = dark ? 'rgba(255,255,255,.14)' : 'var(--border-strong)';
  const handle = dark
    ? 'radial-gradient(circle at 35% 25%, #6d6dff, #3d3dc7)'
    : 'radial-gradient(circle at 35% 25%, var(--accent), var(--accent-ink))';
  return (
    <div ref={ref}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      style={{ width: size, height: size, borderRadius: size / 2,
        background: bg, border: `1px solid ${border}`, position: 'relative',
        touchAction: 'none', userSelect: 'none',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,.1), 0 1px 2px rgba(0,0,0,.05)' }}>
      {/* guide lines */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%',
        backgroundImage: 'radial-gradient(circle, transparent 35%, rgba(0,0,0,.04) 36%, transparent 37%)',
        pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', left: '50%', top: 8, bottom: 8, width: 1,
        background: dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)', transform: 'translateX(-50%)' }}/>
      <div style={{ position: 'absolute', top: '50%', left: 8, right: 8, height: 1,
        background: dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)', transform: 'translateY(-50%)' }}/>
      {/* handle */}
      <div style={{
        position: 'absolute',
        left: `calc(50% + ${pos.x}px - ${handleRadius}px)`,
        top: `calc(50% + ${pos.y}px - ${handleRadius}px)`,
        width: handleRadius * 2, height: handleRadius * 2, borderRadius: '50%',
        background: handle,
        boxShadow: '0 4px 12px rgba(0,0,0,.2), inset 0 -3px 6px rgba(0,0,0,.25), inset 0 2px 3px rgba(255,255,255,.3)',
        transition: pos.active ? 'none' : 'left .2s ease, top .2s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: handleRadius * 0.8, height: handleRadius * 0.8, borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,.55)' }}/>
      </div>
    </div>
  );
}

// ─── task queue row ────────────────────────────────────────────
function MTaskRow({ title, meta, status, active, dark = false, compact = false }) {
  const statusTone = {
    running: { bg: 'var(--accent-soft)', fg: 'var(--accent-ink)', dot: 'var(--accent)' },
    queued:  { bg: 'var(--surface-2)',   fg: 'var(--ink-3)',     dot: 'var(--ink-4)' },
    done:    { bg: 'var(--ok-soft)',     fg: 'var(--ok-ink)',    dot: 'var(--ok)' },
    blocked: { bg: 'var(--warn-soft)',   fg: 'var(--warn-ink)',  dot: 'var(--warn)' },
    alert:   { bg: 'var(--danger-soft)', fg: 'var(--danger-ink)',dot: 'var(--danger)' },
  }[status] || { bg: 'var(--surface-2)', fg: 'var(--ink-3)', dot: 'var(--ink-4)' };
  const surface = dark ? 'rgba(255,255,255,.04)' : 'var(--surface)';
  const border = dark ? 'rgba(255,255,255,.08)' : 'var(--border)';
  const ink = dark ? '#fff' : 'var(--ink)';
  const ink3 = dark ? 'rgba(255,255,255,.5)' : 'var(--ink-3)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12,
      padding: compact ? '10px 12px' : '12px 14px',
      background: active ? (dark ? 'rgba(91,91,247,.12)' : 'var(--accent-weak)') : surface,
      border: `1px solid ${active ? 'var(--accent)' : border}`,
      borderRadius: 12, minHeight: compact ? 52 : 60 }}>
      <div style={{ width: 8, height: 8, borderRadius: 4, background: statusTone.dot,
        animation: status === 'running' ? 'mobPulse 1.2s ease infinite' : 'none', flexShrink: 0 }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: ink, marginBottom: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ fontSize: 11, color: ink3, fontFamily: 'var(--mono)' }}>{meta}</div>
      </div>
      <div style={{ fontSize: 10, padding: '3px 8px', borderRadius: 999,
        background: statusTone.bg, color: statusTone.fg, fontWeight: 600, letterSpacing: .3,
        textTransform: 'uppercase' }}>{status}</div>
    </div>
  );
}

// ─── chat message (agent) ──────────────────────────────────────
function MChatMsg({ role, text, meta, dark = false }) {
  const isAgent = role === 'agent';
  const isUser = role === 'user';
  const isSystem = role === 'system';
  if (isSystem) {
    return (
      <div style={{ textAlign: 'center', fontSize: 10.5, color: dark ? 'rgba(255,255,255,.4)' : 'var(--ink-4)',
        fontFamily: 'var(--mono)', letterSpacing: .3, padding: '6px 0', textTransform: 'uppercase' }}>
        — {text} —
      </div>
    );
  }
  const bg = isAgent
    ? (dark ? 'rgba(124,58,237,.18)' : 'var(--agent-soft)')
    : (dark ? 'rgba(255,255,255,.08)' : 'var(--surface-2)');
  const fg = isAgent
    ? (dark ? '#c4b5fd' : 'var(--agent-ink)')
    : (dark ? '#fff' : 'var(--ink-1)');
  return (
    <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row',
      gap: 8, alignItems: 'flex-end' }}>
      {isAgent && (
        <div style={{ width: 22, height: 22, borderRadius: 11, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--agent), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <MIcon d={MI.agent} size={11} stroke={2}/>
        </div>
      )}
      <div style={{ maxWidth: '78%', background: bg, color: fg,
        padding: '8px 11px', borderRadius: 14,
        borderBottomLeftRadius: isAgent ? 4 : 14,
        borderBottomRightRadius: isUser ? 4 : 14,
        fontSize: 13, lineHeight: 1.4 }}>
        {text}
        {meta && <div style={{ fontSize: 10, opacity: .6, marginTop: 3, fontFamily: 'var(--mono)' }}>{meta}</div>}
      </div>
    </div>
  );
}

// ─── robot picker pill ─────────────────────────────────────────
function MRobotPill({ name, status, dark = false, onClick }) {
  const tone = status === 'online' ? 'var(--ok)' : status === 'alert' ? 'var(--danger)' : 'var(--warn)';
  const bg = dark ? 'rgba(255,255,255,.08)' : 'var(--surface)';
  const border = dark ? 'rgba(255,255,255,.1)' : 'var(--border)';
  const ink = dark ? '#fff' : 'var(--ink)';
  const ink3 = dark ? 'rgba(255,255,255,.5)' : 'var(--ink-3)';
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 10px 6px 6px', borderRadius: 999,
      background: bg, border: `1px solid ${border}`, color: ink,
      cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
    }}>
      <div style={{ width: 26, height: 26, borderRadius: 13,
        background: 'linear-gradient(135deg, #efefec, #d6d4cd)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="8" width="14" height="11" rx="2"/>
          <path d="M12 2v6M8 12h.01M16 12h.01M9 16h6"/>
        </svg>
        <div style={{ position: 'absolute', right: -1, bottom: -1, width: 9, height: 9,
          borderRadius: 5, background: tone, border: `1.5px solid ${bg}` }}/>
      </div>
      <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
        <div>{name}</div>
        <div style={{ fontSize: 9.5, fontWeight: 500, color: ink3, fontFamily: 'var(--mono)',
          textTransform: 'uppercase', letterSpacing: .5 }}>{status}</div>
      </div>
      <MIcon d={MI.chevronDown} size={14} stroke={2} style={{ color: ink3 }}/>
    </button>
  );
}

// ─── seed data (shared across all variants) ───────────────────
const SEED_CHAT = [
  { role: 'system', text: 'Mission started · Hallway inspection' },
  { role: 'agent',  text: 'Beginning sweep of 3F east corridor. 12 rooms on the manifest.', meta: '11:42' },
  { role: 'agent',  text: 'Detected open door at room 314. Logging as anomaly.', meta: '11:43' },
  { role: 'user',   text: 'Any guests around?', meta: '11:44' },
  { role: 'agent',  text: 'No motion detected. Lighting normal. Should I proceed?', meta: '11:44' },
];

const SEED_QUEUE = [
  { title: 'Hallway sweep · 3F east',    meta: 'Running · 7 of 12 rooms',  status: 'running', active: true },
  { title: 'Return to dock · Charger B', meta: 'Queued · ETA after sweep', status: 'queued' },
  { title: 'Check door 314',             meta: 'Flagged · needs approval', status: 'alert' },
  { title: 'Turndown · rooms 301–306',   meta: 'Queued · 18 min',           status: 'queued' },
  { title: 'Linen restock · closet 3B',  meta: 'Queued · 6 min',            status: 'queued' },
  { title: 'Elevator descent to 2F',     meta: 'Blocked · elev busy',       status: 'blocked' },
  { title: 'Pre-sweep calibration',      meta: 'Done · 11:38',              status: 'done' },
];

const SEED_APPROVAL = {
  title: 'Enter room 314 to investigate open door?',
  detail: 'I detected an open guest-room door during hallway sweep. Entering is outside my default permissions. I can log + skip, or enter briefly to confirm it\'s unoccupied.',
  meta: 'just now',
};

// ─── activity dot (for alerts in header) ───────────────────────
function MActivityBadge({ n, dark = false }) {
  if (!n) return null;
  return (
    <div style={{ position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16,
      padding: '0 4px', borderRadius: 8, background: 'var(--danger)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 700, color: '#fff', border: `2px solid ${dark ? '#0b0d12' : '#fff'}` }}>
      {n}
    </div>
  );
}

Object.assign(window, {
  MIcon, MI, MFeed, MTelemetry, MEStop, MApproval, MJoystick,
  MTaskRow, MChatMsg, MRobotPill, MActivityBadge,
  SEED_CHAT, SEED_QUEUE, SEED_APPROVAL,
});
