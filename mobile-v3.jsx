/* mobile-v3-cockpit.jsx — Bold / Cockpit layout.
   Feed is fullscreen always. HUD elements (telemetry, E-stop, joystick pad)
   float over it like a real tele-op rig. Agent + queue live in a right-edge
   drawer that overlays the feed when opened. Dark, dense, intentional. */

function MobileV3({ layoutVariant = 'feed' }) {
  const [drawer, setDrawer] = React.useState(null); // 'agent' | 'queue' | null
  const [controlMode, setControlMode] = React.useState(false); // tap "Take control" for joystick
  const [approval, setApproval] = React.useState(SEED_APPROVAL);

  const resolve = (approve) => setApproval(null);

  return (
    <div style={{ height: '100%', position: 'relative',
      background: '#000', color: '#fff', overflow: 'hidden' }}>
      {/* fullscreen feed */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {layoutVariant === 'map' ? (
          <MMapPanel height="100%"/>
        ) : (
          <MFeed height="100%" radius={0}/>
        )}
        {/* vignette */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(circle at center, transparent 55%, rgba(0,0,0,.4))' }}/>
      </div>

      {/* top HUD — robot + alerts + close */}
      <div style={{ position: 'absolute', top: 54, left: 12, right: 12, zIndex: 20,
        display: 'flex', alignItems: 'center', gap: 8 }}>
        <MRobotPill name="Billie-07" status="online" dark/>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {['agent', 'queue'].map(k => (
            <button key={k} onClick={() => setDrawer(drawer === k ? null : k)}
              style={{ height: 36, padding: '0 12px', borderRadius: 18,
                background: drawer === k ? 'rgba(91,91,247,.85)' : 'rgba(0,0,0,.5)',
                border: `1px solid ${drawer === k ? 'var(--accent)' : 'rgba(255,255,255,.14)'}`,
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                fontWeight: 600, fontSize: 12, fontFamily: 'inherit', position: 'relative' }}>
              <MIcon d={k === 'agent' ? MI.agent : MI.queue} size={14}/>
              {k === 'agent' ? 'Agent' : 'Queue'}
              {k === 'agent' && approval && (
                <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--warn)',
                  animation: 'mobPulse 1.2s ease infinite' }}/>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* left HUD — vertical telemetry rail */}
      <div style={{ position: 'absolute', top: 108, left: 12, zIndex: 18,
        display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { l: 'BATT', v: '82%', t: 'var(--ok)' },
          { l: 'NET',  v: '4/5', t: '#fff' },
          { l: 'CPU',  v: '34%', t: '#fff' },
          { l: 'PING', v: '28ms', t: '#fff' },
        ].map(x => (
          <div key={x.l} style={{ background: 'rgba(0,0,0,.55)',
            border: '1px solid rgba(255,255,255,.1)', borderRadius: 8,
            padding: '5px 8px', minWidth: 58, backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: .6,
              color: 'rgba(255,255,255,.5)', textTransform: 'uppercase' }}>{x.l}</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: x.t,
              fontFamily: 'var(--mono)' }}>{x.v}</div>
          </div>
        ))}
      </div>

      {/* mode pill — top center */}
      <div style={{ position: 'absolute', top: 108, left: '50%', transform: 'translateX(-50%)',
        zIndex: 18, display: 'flex', gap: 6 }}>
        <div style={{ padding: '5px 10px', borderRadius: 999, background: 'rgba(22,163,74,.22)',
          border: '1px solid rgba(22,163,74,.5)', fontSize: 10, fontWeight: 700, letterSpacing: 1,
          color: '#4ade80', fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 6,
          backdropFilter: 'blur(8px)' }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: '#4ade80',
            animation: 'mobPulse 1.2s ease infinite' }}/>
          AUTONOMOUS
        </div>
      </div>

      {/* approval banner (floats above bottom HUD when pending) */}
      {approval && !drawer && (
        <div style={{ position: 'absolute', left: 12, right: 12, bottom: 120, zIndex: 22 }}>
          <MApproval {...approval} dark compact
            onApprove={() => resolve(true)} onDeny={() => resolve(false)}/>
        </div>
      )}

      {/* bottom HUD — E-stop + control mode + joystick */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 20,
        padding: '16px 16px 30px',
        background: 'linear-gradient(180deg, transparent, rgba(0,0,0,.75))' }}>
        {controlMode ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <MJoystick size={140} dark/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              <button onClick={() => setControlMode(false)}
                style={{ padding: '8px 14px', borderRadius: 999,
                  background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.2)',
                  color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12,
                  fontFamily: 'inherit', backdropFilter: 'blur(8px)' }}>
                Release control
              </button>
              <MEStop size={70} float label/>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setControlMode(true)}
              style={{ flex: 1, height: 52, borderRadius: 26,
                background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.22)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8 }}>
              <MIcon d={MI.joystick} size={18}/> Take control
            </button>
            <MEStop size={60} float label/>
          </div>
        )}
      </div>

      {/* drawer overlay */}
      {drawer && (
        <div style={{ position: 'absolute', top: 54, left: 0, right: 0, bottom: 0,
          zIndex: 40, display: 'flex', flexDirection: 'column',
          background: 'rgba(10,12,18,.92)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px',
            borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -.01 }}>
              {drawer === 'agent' ? 'Agent' : 'Queue'}
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,.5)',
              fontFamily: 'var(--mono)' }}>
              {drawer === 'agent' ? 'BILLIE-07' : `${SEED_QUEUE.length} TASKS`}
            </div>
            <button onClick={() => setDrawer(null)}
              style={{ marginLeft: 10, width: 32, height: 32, borderRadius: 16,
                background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)',
                color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center' }}>
              <MIcon d={MI.close} size={16}/>
            </button>
          </div>

          {drawer === 'agent' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
              overflow: 'hidden' }}>
              <div style={{ flex: 1, overflow: 'auto', padding: 14,
                display: 'flex', flexDirection: 'column', gap: 10 }}>
                {approval && (
                  <MApproval {...approval} dark compact
                    onApprove={() => resolve(true)} onDeny={() => resolve(false)}/>
                )}
                {SEED_CHAT.map((m, i) => <MChatMsg key={i} {...m} dark/>)}
              </div>
              <div style={{ padding: '10px 14px 14px',
                borderTop: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 22,
                  background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)' }}>
                  <MIcon d={MI.mic} size={16} style={{ color: 'rgba(255,255,255,.5)' }}/>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', flex: 1 }}>
                    Message Billie-07…
                  </div>
                </div>
              </div>
            </div>
          )}

          {drawer === 'queue' && (
            <div style={{ flex: 1, overflow: 'auto', padding: 14,
              display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SEED_QUEUE.map((q, i) => <MTaskRow key={i} {...q} dark compact/>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { MobileV3 });
