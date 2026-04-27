/* shared.jsx — primitives shared by all three robot-control layouts.
   Every panel is presentational + accepts props so layouts can compose
   them differently. State lives in the parent LiveView so two layouts
   in the canvas never desync their telemetry. */

// ─── tiny icons ────────────────────────────────────────────────
const Icon = ({ d, size = 14, stroke = 1.7, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);
const I = {
  play: 'M8 5v14l11-7z',
  pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
  stop: 'M6 6h12v12H6z',
  send: 'M4 12l16-8-6 18-3-8-7-2z',
  dot: 'M12 12h.01',
  cam: 'M3 7h4l2-3h6l2 3h4v12H3zM12 17a4 4 0 100-8 4 4 0 000 8z',
  map: 'M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
  bolt: 'M13 2L3 14h7l-1 8 10-12h-7l1-8z',
  wifi: 'M5 12a10 10 0 0114 0M8.5 15.5a5 5 0 017 0M12 19h.01',
  cpu: 'M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2M6 6h12v12H6zM10 10h4v4h-4z',
  chat: 'M21 12a8 8 0 01-12 7l-5 2 2-5a8 8 0 1115-4z',
  queue: 'M4 6h16M4 12h16M4 18h10',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  close: 'M6 6l12 12M18 6L6 18',
  expand: 'M4 4h6M4 4v6M20 20h-6M20 20v-6',
  collapse: 'M10 4H4v6M14 20h6v-6',
  chevron: 'M9 6l6 6-6 6',
  check: 'M5 12l5 5L20 7',
  alert: 'M12 9v4M12 17h.01M10.3 3.9L2.4 17.6A2 2 0 004.1 20.5h15.8a2 2 0 001.7-2.9L13.7 3.9a2 2 0 00-3.4 0z',
  pin: 'M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zM12 11a2 2 0 100-4 2 2 0 000 4z',
  lidar: 'M12 12L4 6M12 12l8-6M12 12v10M12 12L4 18M12 12l8 6',
  record: 'M12 12m-4 0a4 4 0 108 0 4 4 0 10-8 0',
  route: 'M6 19V5a3 3 0 116 0v14a3 3 0 006 0v-2',
};

// ─── base atoms ────────────────────────────────────────────────
const Panel = ({ children, style, title, actions, pad = true, flat = false }) => (
  <div style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    boxShadow: flat ? 'none' : 'var(--shadow-sm)',
    display: 'flex', flexDirection: 'column', minHeight: 0, ...style }}>
    {title && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', letterSpacing: .1,
          display: 'flex', alignItems: 'center', gap: 8 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{actions}</div>
      </div>
    )}
    <div style={{ flex: 1, minHeight: 0, padding: pad ? 14 : 0, display: 'flex', flexDirection: 'column' }}>{children}</div>
  </div>
);

const Chip = ({ tone = 'neutral', children, dot, style }) => {
  const tones = {
    neutral: { bg: 'var(--surface-2)', fg: 'var(--ink-2)', dot: 'var(--ink-3)' },
    ok:      { bg: 'var(--ok-soft)',   fg: 'var(--ok)',    dot: 'var(--ok)' },
    warn:    { bg: 'var(--warn-soft)', fg: 'var(--warn)',  dot: 'var(--warn)' },
    danger:  { bg: 'var(--danger-soft)', fg: 'var(--danger)', dot: 'var(--danger)' },
    accent:  { bg: 'var(--accent-soft)', fg: 'var(--accent-ink)', dot: 'var(--accent)' },
  };
  const t = tones[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
      background: t.bg, color: t.fg, padding: '3px 8px', borderRadius: 999,
      fontSize: 11, fontWeight: 500, lineHeight: 1.4, ...style }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 3, background: t.dot }} />}
      {children}
    </span>
  );
};

const IconBtn = ({ icon, onClick, title, active, size = 26 }) => (
  <button onClick={onClick} title={title}
    style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid transparent', background: active ? 'var(--surface-2)' : 'transparent',
      color: active ? 'var(--ink)' : 'var(--ink-3)', borderRadius: 6, cursor: 'pointer',
      transition: 'background .12s, color .12s' }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = active ? 'var(--surface-2)' : 'transparent'; e.currentTarget.style.color = active ? 'var(--ink)' : 'var(--ink-3)'; }}>
    <Icon d={icon} size={14} />
  </button>
);

// ─── camera panel ──────────────────────────────────────────────
// Draws a synthetic "hallway" scene in CSS; optional LIDAR point-cloud
// overlay; HUD with framerate + resolution. Use it like a video element.
function CameraView({ robot, lidar = true, fullscreen, onToggleFullscreen, compact = false }) {
  const tick = 0;
  const drift = 0;
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 'inherit',
      overflow: 'hidden', background: '#fbfbfa' }}>
      {/* photo feed — subtle parallax on the image to feel "live" */}
      <img src="assets/camera-feed.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', transform: `scale(1.03) translate(${drift * 0.4}px, ${drift * 0.2}px)`,
          filter: 'contrast(1.02) saturate(1.05)' }}/>
      {/* slight vignette for cinematic feel */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.45) 100%)',
        pointerEvents: 'none' }}/>

      {/* LIDAR overlay */}
      {lidar && (
        <svg viewBox="0 0 400 300" preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'screen' }}>
          {Array.from({ length: 80 }).map((_, i) => {
            const a = (i / 80) * Math.PI + 0.2;
            const r = 60 + Math.sin(a * 3 + tick / 8) * 25 + (i % 7) * 3;
            const x = 200 + Math.cos(a) * r;
            const y = 180 + Math.sin(a) * r * 0.35;
            return <circle key={i} cx={x} cy={y} r="1.2" fill="#5bf7d0" opacity=".8" />;
          })}
          <circle cx="200" cy="180" r="3" fill="#5bf7d0" />
          <circle cx="200" cy="180" r={20 + (tick % 60)} fill="none" stroke="#5bf7d0" strokeOpacity={0.5 - ((tick % 60) / 120)} />
        </svg>
      )}

      {/* HUD corners */}
      {!compact && (
        <>
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, alignItems: 'center',
            padding: '5px 9px', background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)',
            borderRadius: 6, color: '#17171a', fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#ef4444',
              animation: 'pulse 1.6s infinite' }} />
            REC · CAM_01
          </div>
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6,
            padding: '5px 9px', background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)',
            borderRadius: 6, color: '#17171a', fontSize: 11, fontFamily: 'var(--mono)' }}>
            1920×1080 · 30 FPS
          </div>
          <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between',
            color: 'rgba(24,24,27,.78)', fontSize: 11, fontFamily: 'var(--mono)' }}>
            <span>{robot?.id ?? 'R-07'} · pose 34.21, 8.04, 1.57</span>
            <span>{new Date().toISOString().slice(11, 19)}Z</span>
          </div>
        </>
      )}
      <style>{`@keyframes pulse { 50% { opacity: .35 } }`}</style>
    </div>
  );
}

// ─── map panel ─────────────────────────────────────────────────
// Hospital/office floorplan, occupancy-grid style.
function MapView({ robot, compact = false, showLidar = true, style }) {
  const tick = 0;
  // Static pose — no motion
  const t = 0;
  const rx = 180 + Math.cos(t) * 90;
  const ry = 120 + Math.sin(t * 0.8) * 40;
  const heading = Math.atan2(Math.cos(t * 0.8) * 40 * 0.8, -Math.sin(t) * 90) * 180 / Math.PI;
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#e8eefc',
      borderRadius: 'inherit', overflow: 'hidden', ...style }}>
      {/* SLAM scan as the map itself */}
      <img src="assets/map-scan.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', imageRendering: 'pixelated', opacity: .95 }}/>

      <svg viewBox="0 0 400 280" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* planned path — gentle curve the robot is following */}
        <path d="M 90 160 Q 180 80 270 120 T 340 180" fill="none"
          stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 4" opacity=".7"/>

        {/* waypoint */}
        <g transform="translate(340 180)">
          <circle r="5" fill="#fff" stroke="var(--accent)" strokeWidth="1.8"/>
          <circle r="2" fill="var(--accent)"/>
          <text y="-9" fontSize="9" fontWeight="600" fontFamily="var(--mono)" fill="var(--accent-ink)" textAnchor="middle">→ 202</text>
        </g>

        {/* LIDAR scatter */}
        {showLidar && Array.from({ length: 40 }).map((_, i) => {
          const a = (i / 40) * Math.PI * 2;
          const r = 18 + Math.sin(a * 4 + tick / 3) * 4;
          return <circle key={i} cx={rx + Math.cos(a) * r} cy={ry + Math.sin(a) * r}
            r="0.9" fill="var(--accent)" opacity=".75"/>;
        })}

        {/* robot marker w/ heading */}
        <g transform={`translate(${rx} ${ry})`}>
          <circle r={12 + (tick % 24) / 2.5} fill="none" stroke="var(--accent)" strokeWidth="1.2"
            opacity={0.55 - (tick % 24) / 50}/>
          <circle r="8" fill="var(--accent)"/>
          <circle r="8" fill="none" stroke="#fff" strokeWidth="1.8"/>
          <path d="M0 0 L9 -2.5 L0 -5 Z" fill="#fff" transform={`rotate(${heading})`}/>
        </g>

        {!compact && (
          <>
            {/* labels */}
            <g>
              <rect x="16" y="14" width="120" height="20" rx="3" fill="rgba(255,255,255,.92)" stroke="#cfd4dc"/>
              <text x="24" y="27" fontSize="10" fontFamily="var(--mono)" fontWeight="600" fill="#3f3f46">FLOOR 3 · WARD B</text>
            </g>
            {/* scale bar */}
            <g transform="translate(370 262)">
              <rect x="-64" y="-14" width="66" height="18" rx="3" fill="rgba(255,255,255,.92)" stroke="#cfd4dc"/>
              <line x1="-56" y1="-2" x2="-6" y2="-2" stroke="#3f3f46" strokeWidth="1.2"/>
              <line x1="-56" y1="-5" x2="-56" y2="1" stroke="#3f3f46" strokeWidth="1.2"/>
              <line x1="-6" y1="-5" x2="-6" y2="1" stroke="#3f3f46" strokeWidth="1.2"/>
              <text x="-31" y="-7" fontSize="8" fontFamily="var(--mono)" fill="#3f3f46" textAnchor="middle">5 m</text>
            </g>
          </>
        )}
      </svg>
    </div>
  );
}

// ─── telemetry strip / cards ───────────────────────────────────
// Mini sparkline. Points are updated in the parent so two layouts stay synced.
function Spark({ points, color = 'var(--accent)', height = 24, width = 80 }) {
  if (!points?.length) return null;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);
  const d = points.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={`${d} L${width} ${height} L0 ${height} Z`} fill={color} opacity=".12"/>
      <path d={d} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function TelemetryCard({ label, value, unit, spark, tone = 'neutral', icon, wide = false }) {
  const toneColor = { neutral: 'var(--accent)', ok: 'var(--ok)', warn: 'var(--warn)', danger: 'var(--danger)' }[tone];
  return (
    <div style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)',
      display: 'flex', flexDirection: 'column', gap: 6, minWidth: wide ? 0 : 110 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <span style={{ fontSize: 10.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: .6, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          {icon && <Icon d={icon} size={11} stroke={1.9} />} {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span className="tnum" style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.3, color: 'var(--ink)' }}>{value}</span>
          {unit && <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>{unit}</span>}
        </div>
        {spark && <Spark points={spark} color={toneColor} />}
      </div>
    </div>
  );
}

// ─── agent chat ────────────────────────────────────────────────
// Send a command, stream a response. Calls window.claude.complete.
// `style` prop: 'chat' (default) or 'terminal' — same data, different shell.
function AgentChat({ messages, setMessages, robot, variant = 'chat', compact = false, onCommand }) {
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const scrollRef = React.useRef(null);
  React.useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    const userMsg = { role: 'user', content: text, ts: Date.now() };
    const pending = { role: 'agent', content: '', ts: Date.now(), pending: true };
    setMessages((m) => [...m, userMsg, pending]);
    setBusy(true);
    onCommand?.(text);
    try {
      const prompt = `You are Billie Boss, the mission-control agent for ${robot?.id ?? 'R-07'}, an indoor service robot currently on Floor 3 Ward B of St. Mary's Hospital. Battery 74%, running "Evening Rounds" flow, next task: deliver meds to 202. The operator just typed: "${text}". Reply as the agent in 1-3 short sentences — acknowledge, state what you are doing, and mention any relevant numbers. Speak plainly, no emoji. If the command is risky, ask for confirmation.`;
      const reply = await window.claude.complete(prompt);
      setMessages((m) => {
        const copy = m.slice();
        copy[copy.length - 1] = { role: 'agent', content: reply.trim(), ts: Date.now() };
        return copy;
      });
    } catch (e) {
      setMessages((m) => {
        const copy = m.slice();
        copy[copy.length - 1] = { role: 'agent', content: '⚠ comms link degraded — retry.', ts: Date.now(), error: true };
        return copy;
      });
    } finally { setBusy(false); }
  };

  const term = variant === 'terminal';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0,
      background: term ? '#16171c' : 'transparent', borderRadius: term ? 'inherit' : 0,
      color: term ? '#d4d4d8' : 'var(--ink)' }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: compact ? 10 : 14,
        display: 'flex', flexDirection: 'column', gap: term ? 4 : 10, fontSize: 13 }}>
        {messages.map((m, i) => term ? (
          <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: 12, display: 'flex', gap: 8 }}>
            <span style={{ color: m.role === 'user' ? '#f5a97f' : '#7dd3fc', flexShrink: 0 }}>
              {m.role === 'user' ? '$ op' : '» billieboss'}
            </span>
            <span style={{ color: m.error ? '#fca5a5' : m.pending ? '#a1a1aa' : '#e4e4e7', whiteSpace: 'pre-wrap' }}>
              {m.content || (m.pending ? '…' : '')}
            </span>
          </div>
        ) : (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start',
            flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, flexShrink: 0,
              background: m.role === 'user' ? 'var(--surface-2)' : 'var(--accent)',
              color: m.role === 'user' ? 'var(--ink-2)' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, letterSpacing: .5 }}>
              {m.role === 'user' ? 'OP' : 'AT'}
            </div>
            <div style={{ maxWidth: '78%', padding: '7px 11px', borderRadius: 10,
              background: m.role === 'user' ? 'var(--surface-2)' : 'var(--accent-soft)',
              color: m.role === 'user' ? 'var(--ink)' : 'var(--accent-ink)',
              fontSize: 13, lineHeight: 1.45,
              borderBottomRightRadius: m.role === 'user' ? 3 : 10,
              borderBottomLeftRadius: m.role === 'user' ? 10 : 3 }}>
              {m.pending ? <TypingDots /> : m.content}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid ' + (term ? '#26272d' : 'var(--border)'),
        padding: compact ? '8px 10px' : '10px 12px', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        {term && <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#7dd3fc' }}>$</span>}
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder={busy ? 'Billie Boss is thinking…' : 'Send command to Billie Boss…'}
          disabled={busy}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 13, fontFamily: term ? 'var(--mono)' : 'var(--sans)',
            color: term ? '#d4d4d8' : 'var(--ink)' }} />
        <button onClick={send} disabled={busy || !input.trim()}
          style={{ border: 'none', background: input.trim() && !busy ? 'var(--accent)' : (term ? '#26272d' : 'var(--surface-2)'),
            color: input.trim() && !busy ? '#fff' : 'var(--ink-3)',
            width: 28, height: 28, borderRadius: 6, cursor: input.trim() && !busy ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .12s' }}>
          <Icon d={I.send} size={13} />
        </button>
      </div>
    </div>
  );
}
function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 3, padding: '2px 0' }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: 3, background: 'currentColor', opacity: .5,
          animation: `td 1s ${i * 0.15}s infinite ease-in-out` }} />
      ))}
      <style>{`@keyframes td { 0%,60%,100% { transform: translateY(0); opacity:.3 } 30% { transform: translateY(-3px); opacity:.9 } }`}</style>
    </span>
  );
}

// ─── flow + activity log ───────────────────────────────────────
function FlowSteps({ steps, current }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 2px' }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done ? 'var(--ok)' : active ? 'var(--accent)' : 'var(--surface-2)',
              color: done || active ? '#fff' : 'var(--ink-4)',
              border: done || active ? 'none' : '1px solid var(--border-strong)' }}>
              {done ? <Icon d={I.check} size={10} stroke={2.6}/> :
                active ? <span style={{ width: 6, height: 6, borderRadius: 3, background: '#fff' }} /> :
                <span style={{ fontSize: 9, fontWeight: 600 }}>{i + 1}</span>}
            </div>
            <span style={{ fontSize: 12.5, color: done ? 'var(--ink-3)' : active ? 'var(--ink)' : 'var(--ink-3)',
              fontWeight: active ? 600 : 500, textDecoration: done ? 'line-through' : 'none',
              textDecorationColor: 'var(--ink-4)' }}>{s}</span>
            {active && <Chip tone="accent" dot style={{ marginLeft: 'auto' }}>in progress</Chip>}
          </div>
        );
      })}
    </div>
  );
}

function ActivityLog({ entries, dense = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'var(--mono)', fontSize: 11.5, lineHeight: 1.6 }}>
      {entries.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, padding: dense ? '2px 0' : '3px 0', alignItems: 'baseline' }}>
          <span style={{ color: 'var(--ink-4)', flexShrink: 0 }}>{e.t}</span>
          <span style={{
            color: e.level === 'err' ? 'var(--danger)' : e.level === 'warn' ? 'var(--warn)' :
                   e.level === 'ok' ? 'var(--ok)' : 'var(--ink-3)',
            fontWeight: 600, width: 38, flexShrink: 0, textTransform: 'uppercase', fontSize: 10 }}>
            {e.level === 'err' ? 'ERR' : e.level === 'warn' ? 'WARN' : e.level === 'ok' ? 'OK' : 'INFO'}
          </span>
          <span style={{ color: 'var(--ink-2)', minWidth: 0 }}>{e.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ─── task queue ────────────────────────────────────────────────
function TaskQueue({ tasks, onClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {tasks.map((t, i) => {
        const states = {
          active:   { bg: 'var(--accent-soft)', fg: 'var(--accent-ink)', dot: 'var(--accent)', label: 'Running' },
          queued:   { bg: 'var(--surface-2)',   fg: 'var(--ink-3)',      dot: 'var(--ink-4)',  label: 'Queued' },
          done:     { bg: 'var(--ok-soft)',     fg: 'var(--ok)',         dot: 'var(--ok)',     label: 'Done' },
          blocked:  { bg: 'var(--warn-soft)',   fg: 'var(--warn)',       dot: 'var(--warn)',   label: 'Blocked' },
        }[t.status];
        return (
          <div key={i} onClick={() => onClick?.(t)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              borderRadius: 8, border: '1px solid var(--border)',
              background: t.status === 'active' ? 'var(--accent-soft)' : 'var(--surface)',
              cursor: 'pointer', transition: 'background .12s' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', width: 22 }}>#{String(i + 1).padStart(2, '0')}</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 500, flex: 1, minWidth: 0,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t.eta}</span>
            <Chip tone={t.status === 'active' ? 'accent' : t.status === 'done' ? 'ok' : t.status === 'blocked' ? 'warn' : 'neutral'} dot={t.status === 'active'}>
              {states.label}
            </Chip>
          </div>
        );
      })}
    </div>
  );
}

// ─── network indicator ─────────────────────────────────────────
// Live signal bars + latency pulse + SSID. Self-animating to feel alive.
function NetIndicator({ connection, compact, onDark }) {
  const [tick, setTick] = React.useState(0);
  const [pingHist, setPingHist] = React.useState(Array.from({ length: 16 }, () => 10 + Math.random() * 8));
  React.useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1);
      setPingHist(h => [...h.slice(1), Math.max(5, Math.min(120, h[h.length - 1] + (Math.random() - 0.5) * 6))]);
    }, 900);
    return () => clearInterval(id);
  }, []);
  const latency = Math.round(pingHist[pingHist.length - 1]);
  const rssi = connection.rssi || -58;
  // 4 bars from rssi (-90 weakest → -40 strongest)
  const bars = Math.max(1, Math.min(4, Math.round(((rssi + 90) / 50) * 4)));
  const tone = latency < 30 ? 'ok' : latency < 80 ? 'warn' : 'bad';
  const toneColor = onDark
    ? { ok: '#4ade80', warn: '#fbbf24', bad: '#f87171' }[tone]
    : { ok: '#16a34a', warn: '#d97706', bad: '#dc2626' }[tone];
  const baseBg = onDark ? 'rgba(24,24,27,.035)' : 'var(--surface)';
  const baseBorder = onDark ? 'rgba(24,24,27,.07)' : 'var(--border)';
  const fg = onDark ? 'rgba(24,24,27,.78)' : 'var(--ink-2)';
  const muted = onDark ? 'rgba(24,24,27,.42)' : 'var(--ink-3)';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: compact ? '3px 8px' : '4px 10px',
      border: `1px solid ${baseBorder}`, borderRadius: 999,
      background: baseBg, color: fg, fontSize: 11 }}>
      {/* signal bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 10 }}>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} style={{
            width: 2.5, height: 3 + i * 1.8,
            background: i <= bars ? toneColor : onDark ? 'rgba(24,24,27,.08)' : '#d4d4d8',
            borderRadius: 1,
          }}/>
        ))}
      </div>
      {/* ssid (hidden in compact) */}
      {!compact && (
        <span className="mono" style={{ fontSize: 10, color: muted, letterSpacing: .3 }}>{connection.ssid || '5G'}</span>
      )}
      {/* latency with pulsing dot */}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 5, height: 5, borderRadius: 3, background: toneColor,
          boxShadow: `0 0 4px ${toneColor}`,
          animation: 'netPulse 1.2s ease-in-out infinite' }}/>
        <span className="mono" style={{ fontSize: 10.5, fontWeight: 500, color: fg }}>{latency}ms</span>
      </span>
    </div>
  );
}

// inject the keyframe once
if (typeof document !== 'undefined' && !document.getElementById('net-indicator-kf')) {
  const s = document.createElement('style');
  s.id = 'net-indicator-kf';
  s.textContent = '@keyframes netPulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }';
  document.head.appendChild(s);
}

// ─── top bar (robot selector + status) ─────────────────────────
function TopBar({ robot, connection, onLidarToggle, lidar, compact, onDark }) {
  const chipBg = onDark ? 'rgba(24,24,27,.035)' : 'var(--surface)';
  const chipBorder = onDark ? 'rgba(24,24,27,.06)' : 'var(--border)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: compact ? '8px 12px' : '10px 16px',
      borderBottom: `1px solid ${chipBorder}`, background: onDark ? 'rgba(14,16,20,.92)' : 'var(--surface)',
      color: onDark ? '#fff' : 'inherit', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg, #1a1a22 0%, #3a3a44 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#17171a' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="7" width="14" height="10" rx="2"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><path d="M12 3v4M8 20h8"/></svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
            {robot.name}
            <Chip tone="ok" dot>Online</Chip>
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: onDark ? 'rgba(24,24,27,.48)' : 'var(--ink-3)' }}>{robot.id} · {robot.model}</div>
        </div>
      </div>
      <div style={{ height: 20, width: 1, background: chipBorder, margin: '0 6px' }} />
      <Chip><Icon d={I.pin} size={10}/> {robot.location}</Chip>
      <NetIndicator connection={connection} compact={compact} onDark={onDark}/>
      <div style={{ flex: 1 }} />
      {!compact && (
        <>
          <IconBtn icon={I.lidar} active={lidar} onClick={onLidarToggle} title="Toggle LIDAR overlay" />
          <IconBtn icon={I.record} title="Record" />
          <IconBtn icon={I.more} title="More" />
          <button style={{ padding: '6px 10px', border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--ink-2)', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon d={I.pause} size={11}/> Pause flow
          </button>
          <button style={{ padding: '6px 10px', border: '1px solid var(--danger)', background: 'var(--surface)',
            color: 'var(--danger)', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            E-STOP
          </button>
        </>
      )}
    </div>
  );
}

Object.assign(window, {
  Icon, I, Panel, Chip, IconBtn, CameraView, MapView,
  Spark, TelemetryCard, AgentChat, FlowSteps, ActivityLog, TaskQueue, TopBar, NetIndicator,
});
