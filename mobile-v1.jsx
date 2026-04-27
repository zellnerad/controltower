/* mobile-v1-feedfirst.jsx — Conservative / Feed-first layout.
   Portrait: header · feed · telemetry · tabs (Agent | Queue) · bottom bar.
   Closest to a traditional monitoring UI — all surfaces visible at once.
   Approval surfaces as an inline card above the tabs when pending. */

function MobileV1({ layoutVariant = 'feed' }) {
  const [tab, setTab] = React.useState('agent');
  const [approval, setApproval] = React.useState(SEED_APPROVAL);
  const [chat, setChat] = React.useState(SEED_CHAT);

  const onApprove = () => {
    setChat([...chat, { role: 'user', text: 'Approved · enter room 314', meta: 'now' },
      { role: 'agent', text: 'Entering room 314. Will log findings.', meta: 'now' }]);
    setApproval(null);
  };
  const onDeny = () => {
    setChat([...chat, { role: 'user', text: 'Denied · skip and log', meta: 'now' },
      { role: 'agent', text: 'Logged as anomaly. Continuing sweep.', meta: 'now' }]);
    setApproval(null);
  };

  const activePanel = layoutVariant; // 'feed' | 'map' | 'agent'

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', color: 'var(--ink)', paddingTop: 54 }}>
      {/* top nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <button style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)',
          background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink-2)', cursor: 'pointer' }}>
          <MIcon d={MI.menu} size={18}/>
        </button>
        <MRobotPill name="Billie-07" status="online"/>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--surface)', position: 'relative', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}>
            <MIcon d={MI.alert} size={18}/>
            <MActivityBadge n={2}/>
          </button>
        </div>
      </div>

      {/* scrollable content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 14,
        display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* feed / map / agent hero (depends on layoutVariant) */}
        {activePanel === 'feed' && (
          <MFeed height={200}>
            <button style={{ position: 'absolute', top: 10, right: 10,
              width: 32, height: 32, borderRadius: 8, background: 'rgba(0,0,0,.55)',
              color: '#fff', border: 'none', cursor: 'pointer', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MIcon d={MI.fullscreen} size={16}/>
            </button>
          </MFeed>
        )}
        {activePanel === 'map' && <MMapPanel height={200}/>}
        {activePanel === 'agent' && (
          <div style={{ height: 200, borderRadius: 14, padding: 14,
            background: 'linear-gradient(135deg, var(--agent-soft), var(--accent-soft))',
            border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase',
              color: 'var(--agent-ink)' }}>Agent status</div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -.01, color: 'var(--ink)' }}>
              Sweeping 3F east corridor
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.45 }}>
              On step 7 of 12. Current focus: room 314 (anomaly detected).
              Awaiting 1 approval.
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
              <span className="bb-pill bb-pill-ok">On schedule</span>
              <span className="bb-pill bb-pill-agent">Autonomous</span>
            </div>
          </div>
        )}

        {/* telemetry */}
        <MTelemetry/>

        {/* pending approval */}
        {approval && (
          <MApproval {...approval} onApprove={onApprove} onDeny={onDeny}/>
        )}

        {/* tab switcher */}
        <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--surface-2)',
          borderRadius: 10, border: '1px solid var(--border)' }}>
          {['agent', 'queue'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: 'none',
                background: tab === t ? 'var(--surface)' : 'transparent',
                color: tab === t ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: tab === t ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
                textTransform: 'capitalize' }}>
              {t === 'agent' ? 'Agent chat' : `Queue · ${SEED_QUEUE.length}`}
            </button>
          ))}
        </div>

        {tab === 'agent' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 8 }}>
            {chat.map((m, i) => <MChatMsg key={i} {...m}/>)}
          </div>
        )}

        {tab === 'queue' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SEED_QUEUE.map((q, i) => <MTaskRow key={i} {...q} compact/>)}
          </div>
        )}
      </div>

      {/* bottom bar: compose + E-stop */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px 14px', borderTop: '1px solid var(--border)',
        background: 'var(--surface)' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 22,
          border: '1px solid var(--border)' }}>
          <MIcon d={MI.mic} size={16} style={{ color: 'var(--ink-3)' }}/>
          <div style={{ fontSize: 13, color: 'var(--ink-4)', flex: 1 }}>Message Billie-07…</div>
          <MIcon d={MI.joystick} size={16} style={{ color: 'var(--ink-3)' }}/>
        </div>
        <MEStop size={48} label={false}/>
      </div>
    </div>
  );
}

// small map panel used by v1 + v2 when layoutVariant = 'map'
function MMapPanel({ height = 200 }) {
  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 14, overflow: 'hidden' }}>
      <img src="assets/map-scan.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', imageRendering: 'pixelated' }}/>
      {/* robot marker */}
      <div style={{ position: 'absolute', top: '50%', left: '46%',
        width: 22, height: 22, borderRadius: 11, background: 'var(--accent)',
        border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,.3)',
        transform: 'translate(-50%, -50%)' }}/>
      <div style={{ position: 'absolute', top: '50%', left: '46%',
        width: 60, height: 60, borderRadius: 30,
        border: '1px solid rgba(91,91,247,.5)',
        transform: 'translate(-50%, -50%)',
        animation: 'mobPulse 2s ease infinite' }}/>
      <div style={{ position: 'absolute', top: 10, left: 10,
        background: 'rgba(0,0,0,.55)', padding: '3px 8px', borderRadius: 4,
        fontSize: 10, color: '#fff', fontFamily: 'var(--mono)', backdropFilter: 'blur(6px)' }}>
        SLAM · 3F
      </div>
    </div>
  );
}

Object.assign(window, { MobileV1, MMapPanel });
