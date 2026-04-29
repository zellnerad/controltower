// Three options for the Billie Boss → Open Alerts panel on Live View.
// Each renders the full 360×640 sidebar (header → tabs → body).

const ALERTS = [
  { id: 'A-2041', flag: '🇮🇹', hotel: 'Marriott Rome',   robot: 'BILLIE-08', room: '1216', issue: "Door won't open",                  why: 'Privacy latch likely engaged from inside.', stalled: '1m 32s', attempts: 2, sev: 'high' },
  { id: 'A-2040', flag: '🇮🇹', hotel: 'Marriott Rome',   robot: 'BILLIE-14', room: '1118', issue: 'Depth sensor recalibration',       why: 'ToF channel 3 drift over threshold.',       stalled: '6m 04s', attempts: 1, sev: 'high' },
  { id: 'A-2039', flag: '🇫🇷', hotel: 'Le Meurice Paris',robot: 'BILLIE-22', room: '0612', issue: 'Battery low · 18%',                why: 'Heavy floor 6 routes drained pack faster.', stalled: '—',     attempts: 0, sev: 'med'  },
  { id: 'A-2038', flag: '🇮🇹', hotel: 'Marriott Rome',   robot: 'BILLIE-21', room: '0908', issue: 'Lift wait > 90s',                  why: 'Lift A out of service. Re-routing via B.',   stalled: '2m 11s', attempts: 0, sev: 'med'  },
  { id: 'A-2037', flag: '🇫🇷', hotel: 'Le Meurice Paris',robot: 'BILLIE-19', room: '0204', issue: 'Trash bin full',                   why: 'Service bay 2 backed up since 09:40.',       stalled: '—',     attempts: 0, sev: 'low'  },
  { id: 'A-2036', flag: '🇮🇹', hotel: 'Marriott Rome',   robot: 'BILLIE-11', room: '1402', issue: 'Guest request unconfirmed',        why: 'Guest did not confirm towels delivery.',     stalled: '—',     attempts: 0, sev: 'low'  },
];

const SEV = {
  high: { tone: '#ef4444', soft: 'rgba(239,68,68,.12)', label: 'HIGH' },
  med:  { tone: '#f59e0b', soft: 'rgba(245,158,11,.14)', label: 'MED'  },
  low:  { tone: 'rgba(24,24,27,.45)', soft: 'rgba(24,24,27,.06)', label: 'LOW' },
};

// ───── shared chrome (header + tabs) ─────
function PanelChrome({ children, badge = 1 }) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff',
      borderLeft: '1px solid rgba(24,24,27,.05)', display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden' }}>
      {/* top header */}
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid rgba(24,24,27,.04)' }}>
        <span style={{ width: 30, height: 30, borderRadius: 7, background: '#17171a',
          color: '#fbbf24', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="8" r="4"/>
          </svg>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -.1 }}>Billie Boss</div>
          <div className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.5)',
            letterSpacing: .5, marginTop: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 5, height: 5, borderRadius: 3, background: '#22c55e' }}/>
            WATCHING · 14 LIVE
          </div>
        </div>
        <button style={{ all: 'unset', cursor: 'pointer', padding: 4,
          color: 'rgba(24,24,27,.45)' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4l-4 4 4 4"/></svg>
        </button>
      </div>
      {/* tabs */}
      <div style={{ display: 'flex', padding: '8px 12px 0', gap: 4 }}>
        <button style={{ all: 'unset', cursor: 'pointer', padding: '5px 10px', borderRadius: 6,
          fontSize: 11.5, fontWeight: 600, background: 'rgba(24,24,27,.06)', color: '#17171a',
          display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Alerts
          <span className="mono" style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 3,
            background: '#ef4444', color: '#fff', fontWeight: 700 }}>{badge}</span>
        </button>
        <button style={{ all: 'unset', cursor: 'pointer', padding: '5px 10px', borderRadius: 6,
          fontSize: 11.5, fontWeight: 600, color: 'rgba(24,24,27,.5)' }}>
          Ask
        </button>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// OPTION A · Compact list — every alert is a row, top row expanded
// ─────────────────────────────────────────────────────────────────
function OptionA() {
  const [openId, setOpenId] = React.useState('A-2041');
  return (
    <PanelChrome badge={ALERTS.length}>
      <div className="mono" style={{ fontSize: 9, color: 'rgba(24,24,27,.45)', letterSpacing: 1.2,
        padding: '14px 16px 6px' }}>
        {ALERTS.length} OPEN · SORTED BY SEVERITY
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '0 12px 16px',
        display: 'flex', flexDirection: 'column', gap: 4 }}>
        {ALERTS.map(a => {
          const s = SEV[a.sev];
          const open = a.id === openId;
          return (
            <div key={a.id}
              onClick={() => setOpenId(open ? null : a.id)}
              style={{ cursor: 'pointer', borderRadius: 8,
                border: open ? `1px solid ${s.tone}40` : '1px solid rgba(24,24,27,.06)',
                background: open ? `linear-gradient(180deg, ${s.soft} 0%, #fff 70%)` : '#fff',
                padding: open ? '10px 12px 12px' : '8px 10px 8px',
                display: 'flex', flexDirection: 'column' }}>
              {/* row header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: 4, background: s.tone, flexShrink: 0 }}/>
                <span style={{ fontSize: 11.5 }}>{a.flag}</span>
                <span className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.55)',
                  letterSpacing: .4 }}>{a.robot.replace('BILLIE-', 'B-')} · rm {a.room}</span>
                <span style={{ flex: 1 }}/>
                {a.stalled !== '—' && (
                  <span className="mono" style={{ fontSize: 9, color: 'rgba(24,24,27,.4)',
                    letterSpacing: .3 }}>{a.stalled}</span>
                )}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: open ? 600 : 500, color: '#17171a',
                marginTop: 3, lineHeight: 1.3,
                whiteSpace: open ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {a.issue}
              </div>
              {open && (
                <>
                  <div style={{ fontSize: 11.5, color: 'rgba(24,24,27,.62)', lineHeight: 1.45,
                    marginTop: 6 }}>
                    {a.why}
                  </div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
                    <button style={{ all: 'unset', cursor: 'pointer', flex: 1,
                      padding: '7px 10px', borderRadius: 6, background: '#17171a',
                      color: '#fff', fontSize: 11.5, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      Take over →
                    </button>
                    <button style={{ all: 'unset', cursor: 'pointer',
                      padding: '7px 10px', borderRadius: 6,
                      border: '1px solid rgba(24,24,27,.1)', background: '#fff',
                      fontSize: 11.5, fontWeight: 500 }}>Why?</button>
                    <button style={{ all: 'unset', cursor: 'pointer',
                      padding: '7px 10px', borderRadius: 6,
                      border: '1px solid rgba(24,24,27,.1)', background: '#fff',
                      fontSize: 11.5, fontWeight: 500 }}>Skip</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </PanelChrome>
  );
}

// ─────────────────────────────────────────────────────────────────
// OPTION B · Stacked cards — hero card + smaller cards below
// ─────────────────────────────────────────────────────────────────
function OptionB() {
  const [heroId, setHeroId] = React.useState('A-2041');
  const hero = ALERTS.find(a => a.id === heroId);
  const rest = ALERTS.filter(a => a.id !== heroId);
  return (
    <PanelChrome badge={ALERTS.length}>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '12px 14px 18px',
        display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* HERO */}
        <div style={{ borderRadius: 10, border: '1px solid rgba(239,68,68,.25)',
          background: 'linear-gradient(180deg, rgba(254,242,242,.6) 0%, #fff 60%)',
          overflow: 'hidden' }}>
          <div style={{ padding: '11px 13px 9px', display: 'flex', alignItems: 'flex-start', gap: 9 }}>
            <span style={{ width: 22, height: 22, borderRadius: 5, flexShrink: 0,
              background: '#ef4444', color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 1.5L.8 12.5h12.4L7 1.5z"/><path d="M7 5.5v3.2M7 10.3v.01"/>
              </svg>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }}>{hero.issue}</div>
              <div className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.5)',
                letterSpacing: .3, marginTop: 2 }}>
                {hero.flag} {hero.robot} · rm {hero.room} · {hero.hotel.split(' ')[1] || hero.hotel}
              </div>
            </div>
            <span className="mono" style={{ fontSize: 9.5, color: '#b91c1c', fontWeight: 700,
              letterSpacing: .6, padding: '2px 6px', borderRadius: 3, background: 'rgba(239,68,68,.12)' }}>
              {SEV[hero.sev].label}
            </span>
          </div>
          <div style={{ padding: '0 13px 11px', fontSize: 12.5, lineHeight: 1.5 }}>
            <span>I tried twice — no movement. </span>
            <span style={{ color: 'rgba(24,24,27,.6)' }}>{hero.why}</span>
            <div className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.4)',
              letterSpacing: .5, marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>STALLED {hero.stalled}</span>
              <span style={{ width: 3, height: 3, borderRadius: 2, background: 'rgba(24,24,27,.25)' }}/>
              <span>{hero.attempts} ATTEMPTS</span>
            </div>
          </div>
          <div style={{ padding: '0 13px 12px' }}>
            <button style={{ all: 'unset', cursor: 'pointer', width: '100%',
              padding: '8px 10px', borderRadius: 6, background: '#17171a', color: '#fff',
              fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
              Take over {hero.robot.replace('BILLIE-', 'Billie ')} →
            </button>
            <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
              <button style={{ all: 'unset', cursor: 'pointer', flex: 1,
                padding: '7px 8px', borderRadius: 6, border: '1px solid rgba(24,24,27,.1)',
                background: '#fff', fontSize: 11.5, fontWeight: 500, textAlign: 'center' }}>
                📞 Call front desk
              </button>
              <button style={{ all: 'unset', cursor: 'pointer',
                padding: '7px 12px', borderRadius: 6, border: '1px solid rgba(24,24,27,.1)',
                background: '#fff', fontSize: 11.5, fontWeight: 500 }}>
                Why?
              </button>
            </div>
          </div>
        </div>

        <div className="mono" style={{ fontSize: 9, color: 'rgba(24,24,27,.45)',
          letterSpacing: 1.2, padding: '4px 2px 0' }}>
          {rest.length} MORE · TAP TO PROMOTE
        </div>

        {/* MINI CARDS */}
        {rest.map(a => {
          const s = SEV[a.sev];
          return (
            <div key={a.id} onClick={() => setHeroId(a.id)}
              style={{ cursor: 'pointer', borderRadius: 8,
                border: '1px solid rgba(24,24,27,.06)', background: '#fff',
                padding: '9px 11px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ width: 4, alignSelf: 'stretch', borderRadius: 2,
                background: s.tone, flexShrink: 0, marginTop: 1 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11 }}>{a.flag}</span>
                  <span className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.55)',
                    letterSpacing: .4 }}>{a.robot.replace('BILLIE-', 'B-')} · rm {a.room}</span>
                  <span style={{ flex: 1 }}/>
                  <span className="mono" style={{ fontSize: 8.5, color: s.tone,
                    fontWeight: 700, letterSpacing: .6 }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, marginTop: 3, lineHeight: 1.3,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {a.issue}
                </div>
              </div>
              <span style={{ color: 'rgba(24,24,27,.3)', fontSize: 14, marginLeft: 2 }}>›</span>
            </div>
          );
        })}
      </div>
    </PanelChrome>
  );
}

// ─────────────────────────────────────────────────────────────────
// OPTION C · Triage queue — Now (active) + grouped queue
// ─────────────────────────────────────────────────────────────────
function OptionC() {
  const active = ALERTS[0];
  const queue = ALERTS.slice(1);
  const counts = {
    high: queue.filter(a => a.sev === 'high').length,
    med:  queue.filter(a => a.sev === 'med').length,
    low:  queue.filter(a => a.sev === 'low').length,
  };
  const groups = [
    { sev: 'high', label: 'HIGH', items: queue.filter(a => a.sev === 'high') },
    { sev: 'med',  label: 'MEDIUM', items: queue.filter(a => a.sev === 'med') },
    { sev: 'low',  label: 'LOW', items: queue.filter(a => a.sev === 'low') },
  ];
  return (
    <PanelChrome badge={ALERTS.length}>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto',
        display: 'flex', flexDirection: 'column' }}>
        {/* counts strip */}
        <div style={{ display: 'flex', gap: 6, padding: '12px 14px 8px' }}>
          {[
            { tone: SEV.high.tone, n: counts.high + 1, label: 'HIGH' },
            { tone: SEV.med.tone,  n: counts.med,      label: 'MED'  },
            { tone: SEV.low.tone,  n: counts.low,      label: 'LOW'  },
          ].map(c => (
            <div key={c.label} style={{ flex: 1, padding: '7px 9px', borderRadius: 7,
              background: 'rgba(24,24,27,.04)',
              display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div className="mono" style={{ fontSize: 9, color: c.tone, fontWeight: 700,
                letterSpacing: .8 }}>{c.label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1, letterSpacing: -.4 }}>{c.n}</div>
            </div>
          ))}
        </div>

        {/* NOW */}
        <div style={{ padding: '4px 14px 8px' }}>
          <div className="mono" style={{ fontSize: 9, color: 'rgba(24,24,27,.45)',
            letterSpacing: 1.4, marginBottom: 6 }}>NOW</div>
          <div style={{ borderRadius: 10, border: '1px solid rgba(239,68,68,.25)',
            background: 'linear-gradient(180deg, rgba(254,242,242,.55) 0%, #fff 65%)',
            padding: '11px 13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 22, height: 22, borderRadius: 5,
                background: '#ef4444', color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 1.5L.8 12.5h12.4L7 1.5z"/><path d="M7 5.5v3.2M7 10.3v.01"/>
                </svg>
              </span>
              <span className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.55)',
                letterSpacing: .4 }}>{active.flag} {active.robot} · rm {active.room}</span>
              <span style={{ flex: 1 }}/>
              <span className="mono" style={{ fontSize: 9.5, color: '#b91c1c', fontWeight: 700,
                letterSpacing: .6 }}>STALLED {active.stalled}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 7, lineHeight: 1.3 }}>
              {active.issue}
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(24,24,27,.6)', marginTop: 4, lineHeight: 1.45 }}>
              {active.why}
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 9 }}>
              <button style={{ all: 'unset', cursor: 'pointer', flex: 1,
                padding: '7px 10px', borderRadius: 6, background: '#17171a', color: '#fff',
                fontSize: 11.5, fontWeight: 600, textAlign: 'center' }}>
                Take over →
              </button>
              <button style={{ all: 'unset', cursor: 'pointer',
                padding: '7px 10px', borderRadius: 6,
                border: '1px solid rgba(24,24,27,.1)', background: '#fff',
                fontSize: 11.5, fontWeight: 500 }}>Why?</button>
            </div>
          </div>
        </div>

        {/* QUEUE — grouped */}
        <div style={{ padding: '6px 0 16px' }}>
          {groups.map(g => g.items.length > 0 && (
            <div key={g.sev} style={{ marginBottom: 8 }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: 1.4,
                color: SEV[g.sev].tone, fontWeight: 700,
                padding: '8px 14px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                {g.label}
                <span style={{ color: 'rgba(24,24,27,.4)', fontWeight: 500 }}>· {g.items.length}</span>
              </div>
              {g.items.map(a => {
                const s = SEV[a.sev];
                return (
                  <div key={a.id} style={{ padding: '8px 14px',
                    borderTop: '1px solid rgba(24,24,27,.04)',
                    display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
                    <span style={{ width: 6, height: 6, borderRadius: 4, background: s.tone, flexShrink: 0 }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.issue}
                      </div>
                      <div className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.45)',
                        letterSpacing: .3, marginTop: 1 }}>
                        {a.flag} {a.robot.replace('BILLIE-', 'B-')} · rm {a.room}
                      </div>
                    </div>
                    {/* swipe affordances (visible buttons, not actual swipe) */}
                    <button style={{ all: 'unset', cursor: 'pointer',
                      padding: '4px 8px', borderRadius: 5, fontSize: 10.5, fontWeight: 600,
                      background: 'rgba(24,24,27,.05)', color: 'rgba(24,24,27,.65)' }}>
                      Ack
                    </button>
                    <button style={{ all: 'unset', cursor: 'pointer',
                      padding: '4px 8px', borderRadius: 5, fontSize: 10.5, fontWeight: 600,
                      background: 'rgba(24,24,27,.05)', color: 'rgba(24,24,27,.65)' }}>
                      Snooze
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </PanelChrome>
  );
}

Object.assign(window, { OptionA, OptionB, OptionC });
