// ═══════════════════════════════════════════════════════════════
// ReportsView — Customer Reports / Inspections table
//
// Every inspection run (robot OR human agent) against any room.
// Matches the uploaded wireframe: filter chips at top, big filter
// bar (time range / robot / site / room / production / status),
// a data table of every inspection with:
//   Robot · Name · Site · Room · Started · Duration · Prod · Status
//   · Progress · Results (passed / issues / failed / media icons)
// Plus the compact "All / Waiting / Inspecting / Approved / Failed"
// status chips from the second screenshot.
// ═══════════════════════════════════════════════════════════════

const INSPECTIONS_DATA = (() => {
  // Generate a plausible spread: ~10,200 inspections. For the table
  // we render a sampled slice; the headline counts are real.
  const sites = [
    { site: 'Hilton Berlin',     flag: '🇩🇪', city: 'Berlin'   },
    { site: 'Marriott Rome',     flag: '🇮🇹', city: 'Rome'     },
    { site: 'Seminaris Potsdam', flag: '🇩🇪', city: 'Potsdam'  },
    { site: 'Cardo Brussels',    flag: '🇧🇪', city: 'Brussels' },
  ];
  const robots = ['BILLIE-08', 'BILLIE-12', 'BILLIE-03', 'BILLIE-05', 'BILLIE-14',
                  'BILLIE-15', 'BILLIE-17', 'BILLIE-21'];
  const humans = [
    { id: 'H-MR',  name: 'Maria Rivera',   role: 'Shift supervisor' },
    { id: 'H-SC',  name: 'Dr. Sarah Chen', role: 'Ops manager'      },
    { id: 'H-JL',  name: 'Jenna L.',       role: 'QA'               },
    { id: 'H-OH',  name: 'Oded H.',        role: 'Fleet lead'       },
  ];
  const nameTpl = [
    ['Floor 2 Room', 'standard-br'],
    ['Floor 3 Room', 'genr-bl'],
    ['Floor 1 Room', 'superior_shower_br'],
    ['Floor 4 Room', 'deluxe-tw'],
    ['Floor 2 Room', 'suite-br-01'],
    ['Floor 5 Room', 'standard-br'],
  ];
  // Hand-crafted recent rows that match the look of the attached screenshot.
  // Times wind backward from 16:15 on Apr 21 2026.
  const rows = [
    { robot: 'BILLIE-15', site: 0, room: '2080', tpl: 0, started: 'Apr 21, 2026 · 04:15 PM',
      dur: '10m 54s', prod: true, status: 'aborted',  progress: '0 / 0',
      results: { pass: 0, warn: 0, fail: 0, photo: 0, note: 0 } },
    { robot: 'BILLIE-15', site: 0, room: '2080', tpl: 0, started: 'Apr 21, 2026 · 04:11 PM',
      dur: '2m 33s',  prod: true, status: 'aborted',  progress: '0 / 0',
      results: { pass: 0, warn: 0, fail: 0, photo: 0, note: 0 } },
    { human: humans[0], site: 1, room: '3209', tpl: 1, started: 'Apr 21, 2026 · 03:47 PM',
      dur: '0s',      prod: true, status: 'approved', progress: '1 / 1',
      verdict: 'Failed', results: { pass: 0, warn: 0, fail: 0, photo: 1, note: 0 } },
    { human: humans[1], site: 1, room: '4249', tpl: 2, started: 'Apr 21, 2026 · 03:37 PM',
      dur: '0s',      prod: true, status: 'approved', progress: '1 / 1',
      verdict: 'Passed', results: { pass: 1, warn: 0, fail: 0, photo: 0, note: 0 } },
    { human: humans[2], site: 1, room: '3222', tpl: 3, started: 'Apr 21, 2026 · 03:03 PM',
      dur: '0s',      prod: true, status: 'approved', progress: '1 / 1',
      verdict: 'Failed', results: { pass: 0, warn: 0, fail: 0, photo: 1, note: 0 } },
    { robot: 'BILLIE-08', site: 1, room: '3226', tpl: 1, started: 'Apr 21, 2026 · 02:54 PM',
      dur: '14m 4s',  prod: true, status: 'approved', progress: '18 / 18',
      verdict: 'Failed', results: { pass: 15, warn: 1, fail: 2, photo: 9, note: 0 } },
    { robot: 'BILLIE-14', site: 2, room: '0134', tpl: 2, started: 'Apr 21, 2026 · 02:54 PM',
      dur: '13m 8s',  prod: true, status: 'approved', progress: '14 / 14',
      verdict: 'Passed', results: { pass: 14, warn: 0, fail: 0, photo: 0, note: 0 } },
    { robot: 'BILLIE-12', site: 1, room: '1210', tpl: 0, started: 'Apr 21, 2026 · 02:28 PM',
      dur: '7m 12s',  prod: true, status: 'inspecting', progress: '9 / 18',
      results: { pass: 8, warn: 1, fail: 0, photo: 4, note: 0 } },
    { robot: 'BILLIE-03', site: 3, room: '0508', tpl: 2, started: 'Apr 21, 2026 · 02:12 PM',
      dur: '9m 31s',  prod: true, status: 'waiting', progress: '14 / 14',
      verdict: 'Waiting approve', results: { pass: 12, warn: 2, fail: 0, photo: 3, note: 0 } },
    { robot: 'BILLIE-05', site: 2, room: '0214', tpl: 5, started: 'Apr 21, 2026 · 01:50 PM',
      dur: '11m 44s', prod: true, status: 'approved', progress: '14 / 14',
      verdict: 'Passed', results: { pass: 13, warn: 1, fail: 0, photo: 2, note: 1 } },
    { human: humans[3], site: 0, room: '2015', tpl: 4, started: 'Apr 21, 2026 · 01:22 PM',
      dur: '5m 12s',  prod: false, status: 'approved', progress: '6 / 6',
      verdict: 'Passed', results: { pass: 6, warn: 0, fail: 0, photo: 1, note: 2 } },
    { robot: 'BILLIE-08', site: 1, room: '1216', tpl: 0, started: 'Apr 21, 2026 · 01:04 PM',
      dur: '8m 40s',  prod: true, status: 'approved', progress: '16 / 16',
      verdict: 'Passed', results: { pass: 16, warn: 0, fail: 0, photo: 0, note: 0 } },
    { robot: 'BILLIE-21', site: 0, room: '0322', tpl: 3, started: 'Apr 21, 2026 · 12:48 PM',
      dur: '12m 6s',  prod: true, status: 'approved', progress: '12 / 12',
      verdict: 'Passed', results: { pass: 11, warn: 1, fail: 0, photo: 0, note: 0 } },
    { robot: 'BILLIE-17', site: 1, room: '3120', tpl: 1, started: 'Apr 21, 2026 · 12:20 PM',
      dur: '4m 12s',  prod: false, status: 'aborted', progress: '3 / 16',
      results: { pass: 3, warn: 0, fail: 0, photo: 1, note: 0 } },
    { human: humans[0], site: 1, room: '1210', tpl: 0, started: 'Apr 21, 2026 · 11:58 AM',
      dur: '0s',      prod: true, status: 'approved', progress: '1 / 1',
      verdict: 'Passed', results: { pass: 1, warn: 0, fail: 0, photo: 0, note: 0 } },
    { robot: 'BILLIE-12', site: 1, room: '1208', tpl: 0, started: 'Apr 21, 2026 · 11:34 AM',
      dur: '6m 22s',  prod: true, status: 'approved', progress: '18 / 18',
      verdict: 'Passed', results: { pass: 17, warn: 1, fail: 0, photo: 0, note: 0 } },
    { robot: 'BILLIE-03', site: 3, room: '0512', tpl: 4, started: 'Apr 21, 2026 · 11:02 AM',
      dur: '10m 2s',  prod: true, status: 'approved', progress: '14 / 14',
      verdict: 'Passed', results: { pass: 14, warn: 0, fail: 0, photo: 0, note: 0 } },
    { robot: 'BILLIE-05', site: 2, room: '0214', tpl: 5, started: 'Apr 21, 2026 · 10:40 AM',
      dur: '9m 18s',  prod: true, status: 'approved', progress: '14 / 14',
      verdict: 'Passed', results: { pass: 14, warn: 0, fail: 0, photo: 0, note: 0 } },
    { robot: 'BILLIE-14', site: 2, room: '0140', tpl: 2, started: 'Apr 21, 2026 · 10:12 AM',
      dur: '13m 44s', prod: true, status: 'approved', progress: '14 / 14',
      verdict: 'Failed', results: { pass: 11, warn: 1, fail: 2, photo: 4, note: 0 } },
    { robot: 'BILLIE-08', site: 1, room: '1220', tpl: 0, started: 'Apr 21, 2026 · 09:48 AM',
      dur: '9m 6s',   prod: true, status: 'approved', progress: '16 / 16',
      verdict: 'Passed', results: { pass: 15, warn: 1, fail: 0, photo: 0, note: 0 } },
    { human: humans[1], site: 1, room: '3101', tpl: 1, started: 'Apr 21, 2026 · 09:24 AM',
      dur: '0s',      prod: true, status: 'approved', progress: '1 / 1',
      verdict: 'Passed', results: { pass: 1, warn: 0, fail: 0, photo: 0, note: 0 } },
    { robot: 'BILLIE-15', site: 0, room: '2081', tpl: 0, started: 'Apr 21, 2026 · 09:02 AM',
      dur: '8m 18s',  prod: true, status: 'approved', progress: '16 / 16',
      verdict: 'Passed', results: { pass: 16, warn: 0, fail: 0, photo: 0, note: 0 } },
    { robot: 'BILLIE-21', site: 0, room: '0308', tpl: 3, started: 'Apr 21, 2026 · 08:36 AM',
      dur: '11m 52s', prod: true, status: 'approved', progress: '12 / 12',
      verdict: 'Passed', results: { pass: 12, warn: 0, fail: 0, photo: 0, note: 0 } },
  ];

  return rows.map((r, i) => {
    const s = sites[r.site];
    const tpl = nameTpl[r.tpl];
    return {
      id: `INS-${10225 - i}`,
      robotLabel: r.robot || (r.human ? 'human' : '—'),
      nameLine: r.robot
        ? `${s.site} | ${tpl[0]} ${r.room} | ${tpl[1]}`
        : 'human',
      site: s.site,
      flag: s.flag,
      city: s.city,
      room: r.room,
      started: r.started,
      dur: r.dur,
      prod: r.prod,
      status: r.status,
      progress: r.progress,
      verdict: r.verdict,
      results: r.results,
      isHuman: !!r.human,
      humanName: r.human?.name,
      humanRole: r.human?.role,
    };
  });
})();

function ReportsView({ goto }) {
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [robotFilter,  setRobotFilter]  = React.useState('All Robots');
  const [siteFilter,   setSiteFilter]   = React.useState('All Sites');
  const [roomFilter,   setRoomFilter]   = React.useState('All Rooms');
  const [prodFilter,   setProdFilter]   = React.useState('Production');
  const [statFilter,   setStatFilter]   = React.useState('All Statuses');
  const [q,            setQ]            = React.useState('');
  const [focus,        setFocus]        = React.useState(null);

  // The "big" counters in the header are fixed in this mock to match
  // the screenshot (10,225 inspections, 8,341 reports, etc).
  const counts = {
    total:     10225,
    waiting:   1,
    inspecting:1,
    approved:  8323,
    failed:    1,
  };

  const rows = INSPECTIONS_DATA.filter(r => {
    if (statusFilter === 'waiting'    && r.status !== 'waiting')    return false;
    if (statusFilter === 'inspecting' && r.status !== 'inspecting') return false;
    if (statusFilter === 'approved'   && r.status !== 'approved')   return false;
    if (statusFilter === 'failed'     && r.verdict !== 'Failed')    return false;
    if (robotFilter !== 'All Robots' && r.robotLabel !== robotFilter) return false;
    if (siteFilter  !== 'All Sites'  && r.site       !== siteFilter)  return false;
    if (q && !(r.nameLine.toLowerCase().includes(q.toLowerCase()) ||
               r.robotLabel.toLowerCase().includes(q.toLowerCase()) ||
               r.room.toLowerCase().includes(q.toLowerCase())))
      return false;
    return true;
  });

  const robotOptions = ['All Robots', ...Array.from(new Set(INSPECTIONS_DATA.map(r => r.robotLabel))).sort()];
  const siteOptions  = ['All Sites',  ...Array.from(new Set(INSPECTIONS_DATA.map(r => r.site)))];
  const roomOptions  = ['All Rooms',  ...Array.from(new Set(INSPECTIONS_DATA.map(r => r.room))).sort()];

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden',
      background: '#fbfbfa', color: '#17171a', fontFamily: 'Inter, var(--sans)',
      display: 'flex', flexDirection: 'column' }}>

      {/* breadcrumb */}
      <div style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12,
        background: '#ffffff', borderBottom: '1px solid rgba(24,24,27,.05)' }}>
        <span style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 15,
          color: 'rgba(255,255,255,.82)' }}>Customers reports</span>
        <span className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.35)', letterSpacing: 1.2 }}>
          INSPECTIONS · QA · AUDITS
        </span>
        <span style={{ flex: 1 }}/>
        <span className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.48)', letterSpacing: .8 }}>
          {counts.total.toLocaleString()} INSPECTIONS · {counts.approved.toLocaleString()} APPROVED · {counts.failed} FAILED
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '22px 40px 40px' }}>

        {/* title */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 36,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 700,
              letterSpacing: -.6, color: '#17171a' }}>
              Inspections <span style={{ color: 'rgba(24,24,27,.35)', fontSize: 22 }}>· {counts.total.toLocaleString()}</span>
            </h1>
            <div style={{ fontSize: 13, color: 'rgba(24,24,27,.52)', marginTop: 4,
              fontStyle: 'normal', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Every Billie and human agent inspection — approved, waiting, or failed.
            </div>
          </div>
          <button style={{ all: 'unset', cursor: 'pointer',
            padding: '8px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 600,
            color: 'rgba(24,24,27,.85)',
            background: 'rgba(24,24,27,.035)', border: '1px solid rgba(24,24,27,.09)',
            display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 7h8M8 4l3 3-3 3"/></svg>
            Export CSV
          </button>
        </div>

        {/* status chips */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14,
          padding: 3, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(24,24,27,.05)',
          borderRadius: 8, width: 'fit-content' }}>
          <StatusChip active={statusFilter === 'all'}        label="All"             count={counts.total.toLocaleString()}  onClick={() => setStatusFilter('all')}/>
          <StatusChip active={statusFilter === 'waiting'}    label="Waiting approve" count={counts.waiting}  tone="#60a5fa" onClick={() => setStatusFilter('waiting')}/>
          <StatusChip active={statusFilter === 'inspecting'} label="Inspecting"      count={counts.inspecting} tone="#a78bfa" onClick={() => setStatusFilter('inspecting')}/>
          <StatusChip active={statusFilter === 'approved'}   label="Approved"        count={counts.approved.toLocaleString()} tone="#22c55e" onClick={() => setStatusFilter('approved')}/>
          <StatusChip active={statusFilter === 'failed'}     label="Failed"          count={counts.failed}  tone="#ef4444" onClick={() => setStatusFilter('failed')}/>
        </div>

        {/* filter bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap',
          padding: 10, background: '#ffffff',
          border: '1px solid rgba(24,24,27,.05)', borderRadius: 8 }}>
          <FilterBtn icon={
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="10" height="9" rx="1"/><path d="M2 6h10M5 2v2M9 2v2"/>
            </svg>
          } label="Start time range"/>
          <FilterBtn opts={robotOptions} value={robotFilter} onChange={setRobotFilter}/>
          <FilterBtn opts={siteOptions}  value={siteFilter}  onChange={setSiteFilter}/>
          <FilterBtn opts={roomOptions}  value={roomFilter}  onChange={setRoomFilter}/>
          <FilterBtn opts={['Production', 'Staging', 'All']}       value={prodFilter} onChange={setProdFilter}/>
          <FilterBtn opts={['All Statuses', 'approved', 'aborted', 'waiting', 'inspecting']} value={statFilter} onChange={setStatFilter}/>
          <span style={{ flex: 1 }}/>
          <button onClick={() => {
              setStatusFilter('all'); setRobotFilter('All Robots'); setSiteFilter('All Sites');
              setRoomFilter('All Rooms'); setProdFilter('Production'); setStatFilter('All Statuses');
              setQ('');
            }}
            style={{ all: 'unset', cursor: 'pointer',
              padding: '6px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 500,
              color: 'rgba(24,24,27,.52)',
              display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2l6 6M8 2l-6 6"/></svg>
            Clear
          </button>
        </div>

        {/* search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: '0 0 280px', display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 7,
            background: 'rgba(24,24,27,.035)', border: '1px solid rgba(24,24,27,.07)' }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="rgba(24,24,27,.48)" strokeWidth="1.6">
              <circle cx="7" cy="7" r="4.5"/><path d="M13 13l-2.5-2.5" strokeLinecap="round"/>
            </svg>
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search inspection, robot, room..."
              style={{ all: 'unset', flex: 1, fontSize: 12, color: '#17171a', fontFamily: 'inherit' }}/>
          </div>
          <span style={{ flex: 1 }}/>
          <span className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.35)', letterSpacing: .8 }}>
            SHOWING {rows.length} OF {INSPECTIONS_DATA.length.toLocaleString()} RECENT
          </span>
        </div>

        {/* table */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(24,24,27,.05)',
          borderRadius: 10, overflow: 'hidden' }}>
          {/* header */}
          <div style={{ display: 'grid',
            gridTemplateColumns: '110px 2fr 1.1fr 75px 1.1fr 90px 55px 110px 80px 1.3fr',
            gap: 8, padding: '12px 16px', background: 'rgba(255,255,255,.02)',
            borderBottom: '1px solid rgba(24,24,27,.05)',
            fontSize: 9.5, fontFamily: 'var(--mono)', color: 'rgba(24,24,27,.42)',
            letterSpacing: 1 }}>
            <ColHdr>ROBOT ↑↓</ColHdr>
            <ColHdr>NAME ↑↓</ColHdr>
            <ColHdr>SITE ↑↓</ColHdr>
            <ColHdr>ROOM ↑↓</ColHdr>
            <ColHdr>STARTED ↑↓</ColHdr>
            <ColHdr>DURATION ↑↓</ColHdr>
            <ColHdr>PROD ↓</ColHdr>
            <ColHdr>STATUS ↑↓</ColHdr>
            <ColHdr>PROGRESS</ColHdr>
            <ColHdr>RESULTS</ColHdr>
          </div>
          {/* rows */}
          {rows.map((r, i) => (
            <InspectionRow key={r.id} r={r}
              onClick={() => setFocus(r)}
              last={i === rows.length - 1}/>
          ))}
          {rows.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(24,24,27,.35)',
              fontSize: 13 }}>
              No inspections match these filters.
            </div>
          )}
        </div>
      </div>

      {focus && <InspectionModal r={focus} onClose={() => setFocus(null)} goto={goto}/>}
    </div>
  );
}

function ColHdr({ children }) {
  return <span>{children}</span>;
}

function StatusChip({ active, label, count, tone, onClick }) {
  return (
    <button onClick={onClick} style={{ all: 'unset', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
      color: active ? '#fff' : 'rgba(24,24,27,.62)',
      background: active ? 'rgba(24,24,27,.055)' : 'transparent',
      transition: 'background .12s' }}>
      {tone && <span style={{ width: 6, height: 6, borderRadius: 3, background: tone }}/>}
      <span>{label}</span>
      <span className="mono tnum" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.48)' }}>· {count}</span>
    </button>
  );
}

function FilterBtn({ icon, label, opts, value, onChange }) {
  if (opts) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{ appearance: 'none', all: 'unset', cursor: 'pointer',
            padding: '7px 28px 7px 12px', borderRadius: 6,
            fontSize: 12, color: 'rgba(24,24,27,.78)', fontFamily: 'inherit',
            background: 'rgba(24,24,27,.035)', border: '1px solid rgba(24,24,27,.07)' }}>
          {opts.map(o => <option key={o} value={o} style={{ background: '#ffffff' }}>{o}</option>)}
        </select>
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', color: 'rgba(24,24,27,.48)', fontSize: 9 }}>▾</span>
      </div>
    );
  }
  return (
    <button style={{ all: 'unset', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '7px 12px', borderRadius: 6,
      fontSize: 12, color: 'rgba(24,24,27,.62)',
      background: 'rgba(24,24,27,.035)', border: '1px solid rgba(24,24,27,.07)' }}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ─── Row ──────────────────────────────────────────────────────
function InspectionRow({ r, onClick, last }) {
  return (
    <div onClick={onClick} style={{ display: 'grid',
      gridTemplateColumns: '110px 2fr 1.1fr 75px 1.1fr 90px 55px 110px 80px 1.3fr',
      gap: 8, padding: '12px 16px', alignItems: 'center',
      borderBottom: last ? 'none' : '1px solid rgba(24,24,27,.035)',
      fontSize: 12, color: 'var(--ink-1)', cursor: 'pointer',
      transition: 'background .1s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {/* ROBOT */}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {r.isHuman ? (
          <span style={{ width: 18, height: 18, borderRadius: 9,
            background: 'rgba(167,139,250,.18)', border: '1px solid rgba(167,139,250,.35)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#a78bfa" strokeWidth="1.4">
              <circle cx="5" cy="3.5" r="1.6"/><path d="M1.5 9c.6-2 1.9-3 3.5-3s2.9 1 3.5 3"/>
            </svg>
          </span>
        ) : (
          <span style={{ width: 18, height: 18, borderRadius: 4,
            background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.3)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fbbf24" strokeWidth="1.4">
              <rect x="2" y="3" width="6" height="4.5" rx=".5"/>
              <circle cx="4" cy="5" r=".4" fill="#fbbf24"/><circle cx="6" cy="5" r=".4" fill="#fbbf24"/>
            </svg>
          </span>
        )}
        <span className="mono" style={{ fontSize: 11, fontWeight: 600,
          color: r.isHuman ? '#c4b5fd' : '#fcd34d' }}>{r.robotLabel}</span>
      </span>

      {/* NAME */}
      <span style={{ fontSize: 12, color: 'rgba(24,24,27,.78)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {r.isHuman ? (
          <span style={{ color: '#c4b5fd' }}>{r.humanName} <span style={{ color: 'rgba(24,24,27,.35)' }}>· {r.humanRole}</span></span>
        ) : (
          r.nameLine
        )}
      </span>

      {/* SITE */}
      <span style={{ fontSize: 12, color: 'rgba(24,24,27,.66)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span>{r.flag}</span><span>{r.site}</span>
      </span>

      {/* ROOM */}
      <span className="mono tnum" style={{ fontSize: 12, color: 'rgba(24,24,27,.78)' }}>{r.room}</span>

      {/* STARTED */}
      <span style={{ fontSize: 11.5, color: 'rgba(24,24,27,.62)', lineHeight: 1.35 }}>
        {(() => {
          const [d, t] = r.started.split(' · ');
          return <><div>{d}</div><div className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.48)' }}>{t}</div></>;
        })()}
      </span>

      {/* DURATION */}
      <span className="mono tnum" style={{ fontSize: 11.5, color: 'rgba(24,24,27,.66)' }}>{r.dur}</span>

      {/* PROD */}
      <span style={{ textAlign: 'center' }}>
        {r.prod && <span style={{ color: '#22c55e' }}>✓</span>}
      </span>

      {/* STATUS */}
      <StatusPill status={r.status}/>

      {/* PROGRESS */}
      <span className="mono tnum" style={{ fontSize: 11.5, color: 'rgba(24,24,27,.62)' }}>{r.progress}</span>

      {/* RESULTS */}
      <ResultsCell r={r}/>
    </div>
  );
}

function StatusPill({ status }) {
  const tones = {
    approved:   { bg: 'rgba(22,163,74,.10)',   fg: '#15803d', label: 'approved'    },
    aborted:    { bg: 'rgba(100,116,139,.12)', fg: '#475569', label: 'aborted'     },
    waiting:    { bg: 'rgba(37,99,235,.10)',   fg: '#1d4ed8', label: 'waiting'     },
    inspecting: { bg: 'rgba(124,58,237,.10)',  fg: '#6d28d9', label: 'inspecting'  },
    failed:     { bg: 'rgba(220,38,38,.10)',   fg: '#b91c1c', label: 'failed'      },
  };
  const t = tones[status] || tones.approved;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 10,
      fontSize: 10.5, fontWeight: 600, letterSpacing: .2,
      background: t.bg, color: t.fg }}>
      {t.label}
    </span>
  );
}

function ResultsCell({ r }) {
  const res = r.results;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {r.verdict && (
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: .3,
          color: r.verdict === 'Passed' ? '#15803d'
               : r.verdict === 'Failed' ? '#b91c1c'
               : '#1d4ed8' }}>
          {r.verdict === 'Passed' && <span style={{ marginRight: 4 }}>✓</span>}
          {r.verdict === 'Failed' && <span style={{ marginRight: 4 }}>✕</span>}
          {r.verdict}
        </span>
      )}
      <div style={{ display: 'flex', gap: 8, fontSize: 10.5,
        fontFamily: 'var(--mono)', color: 'rgba(24,24,27,.52)' }}>
        <ResIco color="#22c55e" sym="✓" n={res.pass}/>
        <ResIco color="#fbbf24" sym="!" n={res.warn}/>
        <ResIco color="#ef4444" sym="✕" n={res.fail}/>
        <ResIco color="#a78bfa" sym="◉" n={res.photo}/>
        <ResIco color="#94a3b8" sym="✎" n={res.note}/>
      </div>
    </div>
  );
}

function ResIco({ color, sym, n }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3,
      color: n > 0 ? color : 'rgba(24,24,27,.18)' }}>
      <span style={{ fontSize: 10 }}>{sym}</span>
      <span className="tnum">{n}</span>
    </span>
  );
}

// ─── Focus modal ──────────────────────────────────────────────
function InspectionModal({ r, onClose, goto }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: 'min(720px, 94vw)', maxHeight: '86vh',
          background: '#ffffff', border: '1px solid rgba(24,24,27,.07)',
          borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,.6)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(24,24,27,.05)',
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#17171a',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Inspection {r.id}
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(24,24,27,.52)', marginTop: 2 }}>
              {r.isHuman ? `${r.humanName} · ${r.humanRole}` : r.robotLabel} · {r.site} · rm {r.room}
            </div>
          </div>
          <span style={{ flex: 1 }}/>
          <StatusPill status={r.status}/>
          <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer',
            padding: 4, color: 'rgba(24,24,27,.48)', fontSize: 14 }}>✕</button>
        </div>
        <div style={{ padding: 20, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <Stat label="Duration" val={r.dur}/>
            <Stat label="Progress" val={r.progress}/>
            <Stat label="Verdict"  val={r.verdict || '—'} tone={r.verdict === 'Passed' ? '#4ade80' : r.verdict === 'Failed' ? '#fca5a5' : undefined}/>
            <Stat label="Started"  val={r.started.split(' · ')[1] || r.started}/>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Card title="Checks" n={r.results.pass + r.results.warn + r.results.fail}
              breakdown={[
                ['Passed', r.results.pass, '#4ade80'],
                ['Issues', r.results.warn, '#fbbf24'],
                ['Failed', r.results.fail, '#fca5a5'],
              ]}/>
            <Card title="Evidence" n={r.results.photo + r.results.note}
              breakdown={[
                ['Photos', r.results.photo, '#a78bfa'],
                ['Notes',  r.results.note,  '#94a3b8'],
              ]}/>
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(24,24,27,.52)',
            padding: 14, background: 'rgba(255,255,255,.02)', borderRadius: 8,
            border: '1px dashed rgba(24,24,27,.06)', lineHeight: 1.55 }}>
            Full inspection report with per-check media, comments, and customer-visible note would render here.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { onClose?.(); goto && goto('operator'); }}
              style={{ all: 'unset', cursor: 'pointer',
                padding: '9px 16px', borderRadius: 7, fontSize: 12.5, fontWeight: 600,
                background: '#5b5bf7', color: '#17171a' }}>Open in Operator Console →</button>
            <button style={{ all: 'unset', cursor: 'pointer',
              padding: '9px 16px', borderRadius: 7, fontSize: 12.5, fontWeight: 600,
              color: 'rgba(24,24,27,.78)',
              background: 'rgba(24,24,27,.035)', border: '1px solid rgba(24,24,27,.08)' }}>
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, val, tone }) {
  return (
    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,.03)',
      border: '1px solid rgba(24,24,27,.05)', borderRadius: 7 }}>
      <div className="mono" style={{ fontSize: 9, color: 'rgba(24,24,27,.42)',
        letterSpacing: 1, marginBottom: 4 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: tone || '#fff' }}>{val}</div>
    </div>
  );
}

function Card({ title, n, breakdown }) {
  return (
    <div style={{ flex: 1, padding: 14, background: 'rgba(255,255,255,.02)',
      border: '1px solid rgba(24,24,27,.05)', borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#17171a' }}>{title}</span>
        <span className="mono tnum" style={{ fontSize: 11, color: 'rgba(24,24,27,.52)' }}>{n}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {breakdown.map(([l, n, c]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11.5 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: c }}/>
            <span style={{ color: 'rgba(24,24,27,.66)', flex: 1 }}>{l}</span>
            <span className="mono tnum" style={{ color: c, fontWeight: 600 }}>{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ReportsView });
