// ═══════════════════════════════════════════════════════════════
// RobotsApp — fleet-wide robot registry.
//   • list of every Billie, not just the active ones on Home
//   • expandable row reveals: Captain's Log, Notes & Tasks,
//     State photos (door-left-open, scuff, etc), Parts log
//   • "Add new Billie" CTA top-right
// ═══════════════════════════════════════════════════════════════

const ROBOTS_DATA = [
  {
    id: 'BILLIE-08', name: 'Billie-08', model: 'Bellhop v2.3', serial: 'BH23-0818',
    state: 'working', battery: 78, city: 'Rome',     site: 'Marriott Rome',     flag: '🇮🇹',
    assignee: 'Dr. Sarah Chen', room: '1210', task: 'Bathroom · towel fold',
    firmware: 'v4.12.3', lastService: '14 days ago',  rooms7d: 58, uptime: '99.2%',
    photo: 'assets/robot-topdown.png',
    log: [
      { t: '16:30', kind: 'start',    txt: 'Dispatched to rm 1210 · Check-out clean'         },
      { t: '16:24', kind: 'nav',      txt: 'Reached waypoint · corridor F12'                  },
      { t: '16:18', kind: 'ok',       txt: 'Localization confidence 0.96'                     },
      { t: '15:42', kind: 'flag',     txt: 'Flagged wardrobe door (left open) · photo captured' },
      { t: '15:10', kind: 'release',  txt: 'Released rm 1208 to PMS · clean, 0 edits'         },
      { t: '14:55', kind: 'ok',       txt: 'Battery docked → 100% · 38 min cycle'             },
    ],
    notes: [
      { who: 'M. Rivera', when: '2h ago',  kind: 'note', txt: 'Left gripper runs a little loose at full extension — still in tolerance, keep an eye.' },
      { who: 'Oded',      when: '1d ago',  kind: 'task', done: false, txt: 'Re-torque arm joint 3 at next service window' },
      { who: 'Sarah',     when: '3d ago',  kind: 'task', done: true,  txt: 'Replace fabric bumper · ordered 4/14, fitted 4/17' },
    ],
    statePhotos: [
      { t: '15:42 today',  img: 'assets/flag-wardrobe.png',       tag: 'Wardrobe left open',  by: 'BILLIE-08',  severity: 'warn' },
      { t: 'yesterday',    img: 'assets/flag-door.png',           tag: 'Door ajar · F12 corridor', by: 'BILLIE-08', severity: 'info' },
      { t: '2d ago',       img: 'assets/flag-towels.png',         tag: 'Towels on floor',     by: 'BILLIE-08',  severity: 'info' },
    ],
    parts: [
      { name: 'Left-gripper pad',   status: 'watch',   qty: 1, sku: 'BH-GP-02L', note: 'Wear at 62% — order spare this week' },
      { name: 'Fabric bumper · rear', status: 'ok',    qty: 2, sku: 'BH-BP-R01', note: 'Replaced 4/17 · next due ~90 days'   },
      { name: 'LIDAR dome cover',   status: 'ok',      qty: 1, sku: 'BH-LD-01',  note: 'Clean, no scuffs'                     },
    ],
  },
  {
    id: 'BILLIE-12', name: 'Billie-12', model: 'Bellhop v2.3', serial: 'BH23-1204',
    state: 'help',   battery: 32, city: 'Rome',     site: 'Marriott Rome',     flag: '🇮🇹',
    assignee: 'M. Rivera', room: '1210', task: 'Bathroom · towel fold',
    firmware: 'v4.12.3', lastService: '8 days ago', rooms7d: 54, uptime: '97.8%',
    photo: 'assets/robot-topdown.png',
    log: [
      { t: '16:32', kind: 'flag',     txt: 'NEEDS HELP — stuck · towel rack out of reach'   },
      { t: '16:28', kind: 'warn',     txt: 'Arm plan failed 3x · requesting tele-op'        },
      { t: '16:21', kind: 'start',    txt: 'Dispatched to rm 1210 · bathroom'               },
      { t: '15:58', kind: 'ok',       txt: 'Firmware sync · v4.12.3'                         },
    ],
    notes: [
      { who: 'M. Rivera', when: '4m ago', kind: 'note', txt: 'Bathroom 1210 has the shorter rack variant — bump reach limits by 4cm for this room type.' },
      { who: 'Oded',      when: '6d ago', kind: 'task', done: false, txt: 'Calibrate left arm reach envelope' },
    ],
    statePhotos: [
      { t: '2m ago',       img: 'assets/flag-towels.png',  tag: 'Stuck · towel rack',          by: 'BILLIE-12', severity: 'danger' },
      { t: 'yesterday',    img: 'assets/flag-white-curtain.png', tag: 'Curtain tangled · rm 1208', by: 'BILLIE-12', severity: 'warn' },
    ],
    parts: [
      { name: 'Left-arm encoder',   status: 'order',   qty: 0, sku: 'BH-AE-03L', note: 'Drift 1.2° · replacement en route · ETA Fri' },
      { name: 'Gripper pad',        status: 'ok',      qty: 1, sku: 'BH-GP-02L', note: 'Fresh'  },
    ],
  },
  {
    id: 'BILLIE-11', name: 'Billie-11', model: 'Bellhop v2.2', serial: 'BH22-0341',
    state: 'idle',   battery: 92, city: 'Brussels', site: 'Cardo Brussels',    flag: '🇧🇪',
    assignee: '—', room: '—', task: 'Dock 2B · awaiting dispatch',
    firmware: 'v4.12.3', lastService: '3 days ago', rooms7d: 47, uptime: '98.4%',
    photo: 'assets/robot-topdown.png',
    log: [
      { t: '16:05', kind: 'ok',       txt: 'Docked · 92% · idle'                              },
      { t: '14:50', kind: 'release',  txt: 'Released rm 508 to PMS · clean, 1 edit'           },
      { t: '12:12', kind: 'ok',       txt: 'Preventive service · joint grease'                },
    ],
    notes: [
      { who: 'Tech · BE', when: '3d ago',  kind: 'note', txt: 'Scuff on the chassis skirt — cosmetic only.' },
    ],
    statePhotos: [
      { t: '3d ago',   img: 'assets/flag-door.png',   tag: 'Scuff · chassis skirt', by: 'Tech · BE', severity: 'info' },
    ],
    parts: [
      { name: 'Chassis skirt',      status: 'watch',   qty: 1, sku: 'BH-CS-02',  note: 'Cosmetic scuff, low priority'         },
      { name: 'Wheel hub (front)',  status: 'ok',      qty: 2, sku: 'BH-WH-F01', note: 'Within tolerance'                      },
    ],
  },
  {
    id: 'BILLIE-15', name: 'Billie-15', model: 'Bellhop v2.3', serial: 'BH23-0512',
    state: 'working',battery: 67, city: 'Potsdam',  site: 'Seminaris Potsdam', flag: '🇩🇪',
    assignee: 'Jenna L.', room: '214', task: 'Checkout · deep clean',
    firmware: 'v4.12.3', lastService: '21 days ago',rooms7d: 42, uptime: '96.9%',
    photo: 'assets/robot-topdown.png',
    log: [
      { t: '16:28', kind: 'start',    txt: 'Dispatched to rm 214'                             },
      { t: '16:10', kind: 'ok',       txt: 'Left dock 3A · 67% battery'                       },
    ],
    notes: [
      { who: 'Jenna', when: '1d ago', kind: 'task', done: false, txt: 'Swap out dusty LIDAR dome — scheduled for Thursday' },
    ],
    statePhotos: [
      { t: '1d ago',   img: 'assets/flag-remote-control.png', tag: 'Remote left on floor', by: 'BILLIE-15', severity: 'info' },
    ],
    parts: [
      { name: 'LIDAR dome cover',   status: 'watch',   qty: 1, sku: 'BH-LD-01',  note: 'Dusty — schedule clean/swap' },
    ],
  },
  {
    id: 'BILLIE-16', name: 'Billie-16', model: 'Bellhop v2.2', serial: 'BH22-1408',
    state: 'service',battery: 0,  city: 'Rome',     site: 'Marriott Rome',     flag: '🇮🇹',
    assignee: 'Tech · RM', room: 'svc', task: 'Service bay · sensor recalibration',
    firmware: 'v4.11.8', lastService: 'in service', rooms7d: 31, uptime: '94.1%',
    photo: 'assets/robot-topdown.png',
    log: [
      { t: '14:02', kind: 'flag',     txt: 'Moved to service bay · IMU drift 3.4°'            },
      { t: '11:30', kind: 'warn',     txt: 'Localization lost 2x in corridor F12'             },
    ],
    notes: [
      { who: 'Tech · RM', when: '2h ago', kind: 'task', done: false, txt: 'Recalibrate IMU, rerun mapping pass' },
      { who: 'Oded',      when: '6h ago', kind: 'note', txt: 'Pulled from rotation until recal sign-off.' },
    ],
    statePhotos: [
      { t: '2h ago',   img: 'assets/map-scan.png',    tag: 'Map drift · F12', by: 'Tech · RM', severity: 'warn' },
    ],
    parts: [
      { name: 'IMU module',         status: 'order',   qty: 0, sku: 'BH-IMU-04', note: 'Backordered — ETA next week'     },
      { name: 'LIDAR dome cover',   status: 'ok',      qty: 1, sku: 'BH-LD-01',  note: 'Cleaned in service'               },
    ],
  },
  {
    id: 'BILLIE-18', name: 'Billie-18', model: 'Bellhop v2.3', serial: 'BH23-1707',
    state: 'offline',battery: 0,  city: 'Rome',     site: 'Marriott Rome',     flag: '🇮🇹',
    assignee: '—', room: '—', task: 'Powered down · shipped for firmware',
    firmware: 'v4.10.2', lastService: '48 days ago',rooms7d: 0,  uptime: '—',
    photo: 'assets/robot-topdown.png',
    log: [
      { t: '1w ago',  kind: 'warn',    txt: 'Shipped to depot for firmware reflash' },
    ],
    notes: [
      { who: 'Oded', when: '1w ago', kind: 'note', txt: 'Back April 28. Do not reassign.' },
    ],
    statePhotos: [],
    parts: [
      { name: 'Mainboard',          status: 'order',   qty: 0, sku: 'BH-MB-01',  note: 'Reflash in progress at depot'    },
    ],
  },
  {
    id: 'BILLIE-21', name: 'Billie-21', model: 'Bellhop v2.3', serial: 'BH23-2105',
    state: 'charging',battery: 41, city: 'Berlin',   site: 'Hilton Berlin',     flag: '🇩🇪',
    assignee: '—', room: '—', task: 'Charging · 18m to 80%',
    firmware: 'v4.12.3', lastService: '6 days ago', rooms7d: 28, uptime: '93.7%',
    photo: 'assets/robot-topdown.png',
    log: [
      { t: '16:22', kind: 'ok',       txt: 'Returned to dock · 41% battery'                   },
      { t: '15:18', kind: 'warn',     txt: 'Battery capacity 41% — capacity-degraded flag'    },
    ],
    notes: [
      { who: 'M. Kim', when: '2h ago', kind: 'task', done: false, txt: 'Replace battery pack — degradation below threshold' },
    ],
    statePhotos: [],
    parts: [
      { name: 'Battery pack',       status: 'order',   qty: 0, sku: 'BH-BAT-03', note: 'Below 50% capacity · order placed' },
    ],
  },

];

function RobotsApp({ goto }) {
  const [robots, setRobots] = React.useState(ROBOTS_DATA);
  const [expandedId, setExpandedId] = React.useState('BILLIE-08');
  const [rowTab, setRowTab] = React.useState({}); // per-row: 'log' | 'notes' | 'photos' | 'parts'
  const [query, setQuery] = React.useState('');
  const [modelFilter, setModelFilter] = React.useState('All');
  const [siteFilter, setSiteFilter] = React.useState('All sites');
  const [addOpen, setAddOpen] = React.useState(false);

  const sites = ['All sites', ...Array.from(new Set(robots.map(r => r.site)))];

  // Billies only (agents have been removed from this view)
  const robotOnly = robots;
  // Preferred order requested by user: 08, 12, 11, 15, 18, 16
  const prefOrder = ['BILLIE-08','BILLIE-12','BILLIE-11','BILLIE-15','BILLIE-18','BILLIE-16'];
  const robotIds = [
    ...prefOrder.filter(id => robotOnly.some(r => r.id === id)),
    ...robotOnly.map(r => r.id).filter(id => !prefOrder.includes(id)),
  ];

  const filtered = robots.filter(r => {
    if (query && !(r.name.toLowerCase().includes(query.toLowerCase()) ||
                   r.site.toLowerCase().includes(query.toLowerCase()) ||
                   r.assignee.toLowerCase().includes(query.toLowerCase()))) return false;
    if (modelFilter !== 'All') {
      // modelFilter is a specific robot ID
      if (r.id !== modelFilter) return false;
    }
    if (siteFilter !== 'All sites' && r.site !== siteFilter) return false;
    return true;
  });

  const counts = {
    total:    robots.length,
    robots:   robotOnly.length,
    help:     robots.filter(r => r.state === 'help').length,
    service:  robots.filter(r => r.state === 'service').length,
    offline:  robots.filter(r => r.state === 'offline').length,
  };

  const getTab = (id) => rowTab[id] || 'log';
  const setTab = (id, tab) => setRowTab(rt => ({ ...rt, [id]: tab }));

  const addBillie = (draft) => {
    const id = draft.id || `BILLIE-${String(robots.length + 1).padStart(2, '0')}`;
    const newBot = {
      id, name: id, model: draft.model || 'Bellhop v2.3',
      serial: draft.serial || `BH23-${Math.floor(Math.random()*9999).toString().padStart(4,'0')}`,
      state: 'idle', battery: 100,
      city: draft.city || 'Rome',
      site: draft.site || 'Marriott Rome',
      flag: draft.flag || '🇮🇹',
      assignee: '—', room: '—', task: 'Newly registered · awaiting first dispatch',
      firmware: 'v4.12.3', lastService: '—', rooms7d: 0, uptime: '—',
      photo: 'assets/robot-topdown.png',
      log: [{ t: 'just now', kind: 'ok', txt: `Registered to fleet · ${draft.site || 'Marriott Rome'}` }],
      notes: [], statePhotos: [], parts: [],
    };
    setRobots(rs => [...rs, newBot]);
    setExpandedId(id);
    setAddOpen(false);
  };

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden',
      background: '#fbfbfa', color: '#17171a', fontFamily: 'Inter, var(--sans)',
      display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16,
        background: '#ffffff', borderBottom: '1px solid rgba(24,24,27,.05)' }}>
        <span style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 16,
          color: '#17171a', letterSpacing: -.4 }}>Robots</span>
        <span className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.35)', letterSpacing: 1.2 }}>
          FLEET REGISTRY
        </span>
        <span style={{ flex: 1 }}/>
        <span className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.48)', letterSpacing: .8 }}>
          {counts.robots} BILLIES · {counts.help} NEEDS HELP · {counts.service + counts.offline} OUT
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '22px 40px 40px' }}>
        {/* title row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 36,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 700,
              letterSpacing: -.6, color: '#17171a' }}>
              The fleet <span style={{ color: 'rgba(24,24,27,.35)', fontSize: 22 }}>· {counts.robots} Billies</span>
            </h1>
            <div style={{ fontSize: 13, color: 'rgba(24,24,27,.52)', marginTop: 4,
              fontStyle: 'normal', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Every Billie in the fleet — status, captain's log, notes, evidence, and parts.
            </div>
          </div>
          <button onClick={() => setAddOpen(true)}
            style={{ all: 'unset', cursor: 'pointer',
              padding: '10px 16px', borderRadius: 7, fontSize: 13, fontWeight: 600,
              background: '#fbbf24', color: '#451a03', letterSpacing: .1,
              display: 'inline-flex', alignItems: 'center', gap: 7,
              boxShadow: '0 2px 6px rgba(251,191,36,.25)' }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M7 2v10M2 7h10"/>
            </svg>
            Add new Billie
          </button>
        </div>

        {/* summary strip */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          <StatePill active={modelFilter === 'All'} label="All" count={counts.total}
            onClick={() => setModelFilter('All')}/>
          {robotIds.map(id => (
            <StatePill key={id} active={modelFilter === id}
              label={id.replace('BILLIE-','Billie-')} tone="#fbbf24"
              onClick={() => setModelFilter(id)}/>
          ))}
        </div>

        {/* search + site filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ flex: '0 0 260px', display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 7,
            background: 'rgba(24,24,27,.035)', border: '1px solid rgba(24,24,27,.07)' }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="rgba(24,24,27,.48)" strokeWidth="1.6">
              <circle cx="7" cy="7" r="4.5"/><path d="M13 13l-2.5-2.5" strokeLinecap="round"/>
            </svg>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search Billie, site, operator..."
              style={{ all: 'unset', flex: 1, fontSize: 12, color: '#17171a', fontFamily: 'inherit' }}/>
          </div>
          <button onClick={() => {
              const i = sites.indexOf(siteFilter);
              setSiteFilter(sites[(i + 1) % sites.length]);
            }} style={{ all: 'unset', cursor: 'pointer',
              padding: '7px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500,
              color: 'rgba(24,24,27,.85)',
              background: 'rgba(24,24,27,.035)', border: '1px solid rgba(24,24,27,.09)' }}>
            ▾ {siteFilter}
          </button>
          <span style={{ flex: 1 }}/>
          <span className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.35)', letterSpacing: .8 }}>
            {filtered.length} OF {counts.total} SHOWN
          </span>
        </div>

        {/* list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(r => (
            <RobotRow key={r.id} r={r}
              expanded={expandedId === r.id}
              onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
              tab={getTab(r.id)}
              setTab={(t) => setTab(r.id, t)}
              goto={goto}
              onUpdate={(patch) => setRobots(rs => rs.map(x => x.id === r.id ? { ...x, ...patch } : x))}/>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(24,24,27,.35)',
              fontSize: 13, border: '1px dashed rgba(24,24,27,.08)', borderRadius: 10 }}>
              No Billies match these filters.
            </div>
          )}
        </div>
      </div>

      {addOpen && <AddBillieModal onClose={() => setAddOpen(false)} onAdd={addBillie}
        siteOptions={sites.filter(s => s !== 'All sites')}/>}
    </div>
  );
}

function StatePill({ active, label, count, tone, onClick }) {
  return (
    <button onClick={onClick} style={{ all: 'unset', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '6px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 500,
      color: active ? '#fff' : 'rgba(24,24,27,.62)',
      background: active ? 'rgba(24,24,27,.06)' : 'rgba(255,255,255,.02)',
      border: `1px solid ${active ? 'rgba(24,24,27,.12)' : 'rgba(24,24,27,.06)'}`,
      transition: 'background .12s' }}>
      {tone && <span style={{ width: 6, height: 6, borderRadius: 3, background: tone,
        boxShadow: active ? `0 0 5px ${tone}` : 'none' }}/>}
      <span>{label}</span>
      {count != null && (
        <span className="mono tnum" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.48)' }}>{count}</span>
      )}
    </button>
  );
}

function RobotRow({ r, expanded, onToggle, tab, setTab, goto, onUpdate }) {
  const stateTone = STATE_TONE[r.state] || STATE_TONE.idle;
  return (
    <div style={{ background: '#ffffff',
      border: `1px solid ${expanded ? 'rgba(24,24,27,.09)' : 'rgba(24,24,27,.05)'}`,
      borderRadius: 12, overflow: 'hidden',
      boxShadow: expanded ? '0 8px 32px rgba(0,0,0,.35)' : 'none',
      transition: 'border-color .12s' }}>
      {/* summary row */}
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 18px', cursor: 'pointer' }}>
        {/* avatar */}
        <div style={{ width: 44, height: 44, borderRadius: 9,
          background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8">
            <rect x="5" y="7" width="14" height="10" rx="2"/>
            <circle cx="9" cy="12" r="1" fill="#fbbf24"/><circle cx="15" cy="12" r="1" fill="#fbbf24"/>
            <path d="M12 3v4M8 20h8"/>
          </svg>
        </div>

        {/* name + meta */}
        <div style={{ flex: '0 0 200px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#17171a' }}>{r.name}</span>
            <span className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.35)' }}>{r.model}</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(24,24,27,.52)', marginTop: 2,
            display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>{r.flag}</span><span>{r.site}</span>
          </div>
        </div>

        {/* state */}
        <div style={{ flex: '0 0 130px', display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: stateTone.color,
            boxShadow: r.state === 'help' || r.state === 'working' ? `0 0 6px ${stateTone.color}` : 'none',
            animation: r.state === 'help' ? 'billPulse 1.2s ease-in-out infinite' : 'none' }}/>
          <span style={{ fontSize: 12, fontWeight: 600, color: stateTone.color, letterSpacing: .2,
            textTransform: r.state === 'help' ? 'uppercase' : 'capitalize' }}>
            {r.state === 'help' ? 'Needs help' : r.state}
          </span>
        </div>

        {/* battery */}
        <div style={{ flex: '0 0 90px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: 26, height: 12,
            border: '1px solid rgba(24,24,27,.28)', borderRadius: 2 }}>
            <div style={{ position: 'absolute', top: 1, left: 1, bottom: 1,
              width: `${Math.max(2, (r.battery / 100) * 22)}px`,
              background: r.battery > 50 ? '#22c55e' : r.battery > 20 ? '#fbbf24' : '#ef4444',
              borderRadius: 1 }}/>
            <div style={{ position: 'absolute', top: 3, right: -3, width: 2, height: 4,
              background: 'rgba(24,24,27,.35)', borderRadius: '0 1px 1px 0' }}/>
          </div>
          <span className="mono tnum" style={{ fontSize: 11, color: 'rgba(24,24,27,.66)' }}>{r.battery}%</span>
        </div>

        {/* task + assignee */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, color: '#17171a', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.task}</div>
          <div style={{ fontSize: 11, color: 'rgba(24,24,27,.48)', marginTop: 2 }}>
            {r.room !== '—' && <>rm {r.room} · </>}
            Assigned to <span style={{ color: 'rgba(24,24,27,.66)', fontWeight: 500 }}>{r.assignee}</span>
          </div>
        </div>

        {/* quick counts */}
        <div style={{ display: 'flex', gap: 12, color: 'rgba(24,24,27,.52)',
          fontSize: 10.5, fontFamily: 'var(--mono)', letterSpacing: .3 }}>
          <QuickCount label="LOG"    n={r.log.length}/>
          <QuickCount label="NOTES"  n={r.notes.length}/>
          <QuickCount label="PHOTOS" n={r.statePhotos.length}/>
          <QuickCount label="PARTS"  n={r.parts.length} alert={r.parts.some(p => p.status === 'order')}/>
        </div>

        {/* caret */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(24,24,27,.48)" strokeWidth="1.8"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }}>
          <path d="M3 5.5l4 4 4-4"/>
        </svg>
      </div>

      {/* expanded body */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(24,24,27,.06)',
          background: '#f6f6f4', padding: '16px 18px 20px' }}>
          {/* tabs */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 14,
            borderBottom: '1px solid rgba(24,24,27,.05)' }}>
            <RowTab on={tab === 'log'}    onClick={() => setTab('log')}
              label={`Captain's log`} count={r.log.length}/>
            <RowTab on={tab === 'notes'}  onClick={() => setTab('notes')}
              label="Notes & tasks" count={r.notes.length}/>
            <RowTab on={tab === 'photos'} onClick={() => setTab('photos')}
              label="State photos" count={r.statePhotos.length}/>
            <RowTab on={tab === 'parts'}  onClick={() => setTab('parts')}
              label="Parts" count={r.parts.length}
              alert={r.parts.some(p => p.status === 'order')}/>
            <span style={{ flex: 1 }}/>
            <button onClick={() => goto && goto('operator')}
              style={{ all: 'unset', cursor: 'pointer', padding: '6px 12px', borderRadius: 6,
                fontSize: 11.5, fontWeight: 600, color: '#17171a', background: '#5b5bf7',
                alignSelf: 'center' }}>
              Open in Operator Console →
            </button>
          </div>

          {/* content */}
          {tab === 'log'    && <LogPanel   r={r} onUpdate={onUpdate}/>}
          {tab === 'notes'  && <NotesPanel r={r} onUpdate={onUpdate}/>}
          {tab === 'photos' && <PhotosPanel r={r} onUpdate={onUpdate}/>}
          {tab === 'parts'  && <PartsPanel r={r} onUpdate={onUpdate}/>}
        </div>
      )}
    </div>
  );
}

const STATE_TONE = {
  working:  { color: '#22c55e' },
  idle:     { color: '#94a3b8' },
  charging: { color: '#fbbf24' },
  help:     { color: '#ef4444' },
  service:  { color: '#fb923c' },
  offline:  { color: '#525252' },
};

function QuickCount({ label, n, alert }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.1 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: alert ? '#ef4444' : '#fff',
        fontFamily: 'var(--mono)' }}>{n}</span>
      <span style={{ fontSize: 9, color: 'rgba(24,24,27,.35)' }}>{label}</span>
    </div>
  );
}

function RowTab({ on, onClick, label, count, alert }) {
  return (
    <button onClick={onClick} style={{ all: 'unset', cursor: 'pointer',
      padding: '9px 14px', position: 'relative',
      fontSize: 12, fontWeight: on ? 700 : 500,
      color: on ? 'var(--ink)' : 'var(--ink-3)',
      display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {label}
      <span style={{ fontSize: 10, fontFamily: 'var(--mono)',
        padding: '1px 6px', borderRadius: 10,
        background: alert ? 'rgba(239,68,68,.2)' : 'rgba(24,24,27,.06)',
        color: alert ? '#fca5a5' : 'rgba(24,24,27,.55)' }}>{count}</span>
      {on && <span style={{ position: 'absolute', left: 8, right: 8, bottom: -1, height: 2,
        background: '#fbbf24', borderRadius: '2px 2px 0 0' }}/>}
    </button>
  );
}

// ─── Captain's log ────────────────────────────────────────────
const LOG_KIND = {
  start:   { icon: '▶', color: '#5b5bf7' },
  ok:      { icon: '✓', color: '#22c55e' },
  nav:     { icon: '→', color: '#94a3b8' },
  warn:    { icon: '!', color: '#fbbf24' },
  flag:    { icon: '⚑', color: '#ef4444' },
  release: { icon: '↳', color: '#22c55e' },
  qa:      { icon: '◉', color: '#a855f7' },
};

function LogPanel({ r }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0,
      background: '#fbfbfa', border: '1px solid rgba(24,24,27,.05)', borderRadius: 8 }}>
      {r.log.map((entry, i) => {
        const k = LOG_KIND[entry.kind] || LOG_KIND.nav;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '10px 14px',
            borderBottom: i < r.log.length - 1 ? '1px solid rgba(24,24,27,.04)' : 'none' }}>
            <span className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.35)',
              letterSpacing: .4, flex: '0 0 48px' }}>{entry.t}</span>
            <span style={{ width: 22, height: 22, borderRadius: 4,
              background: `${k.color}22`, color: k.color,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{k.icon}</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink-1)', flex: 1 }}>
              {entry.txt}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Notes & tasks ────────────────────────────────────────────
function NotesPanel({ r, onUpdate }) {
  const [draft, setDraft] = React.useState('');
  const [kind, setKind] = React.useState('note');

  const add = () => {
    if (!draft.trim()) return;
    const entry = { who: 'You', when: 'just now', kind, done: kind === 'task' ? false : undefined, txt: draft.trim() };
    onUpdate({ notes: [entry, ...r.notes] });
    setDraft('');
  };
  const toggleDone = (idx) => {
    const next = r.notes.map((n, i) => i === idx ? { ...n, done: !n.done } : n);
    onUpdate({ notes: next });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* composer */}
      <div style={{ background: '#fbfbfa', border: '1px solid rgba(24,24,27,.06)',
        borderRadius: 8, padding: 12 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <KindChip on={kind === 'note'} label="📝 Note" onClick={() => setKind('note')}/>
          <KindChip on={kind === 'task'} label="☐ Task" onClick={() => setKind('task')}/>
        </div>
        <textarea value={draft} onChange={e => setDraft(e.target.value)}
          placeholder={kind === 'task' ? 'Describe the task — e.g. "replace left gripper pad"' : 'Write a note for this Billie...'}
          style={{ width: '100%', minHeight: 60, background: 'transparent',
            border: 'none', outline: 'none', resize: 'vertical',
            fontFamily: 'inherit', fontSize: 12.5, color: '#17171a', lineHeight: 1.5 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.35)', letterSpacing: .4 }}>
            Posting as You · visible to all operators on {r.site}
          </span>
          <span style={{ flex: 1 }}/>
          <button onClick={add} disabled={!draft.trim()}
            style={{ all: 'unset', cursor: draft.trim() ? 'pointer' : 'not-allowed',
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: draft.trim() ? '#fbbf24' : 'rgba(24,24,27,.07)',
              color: draft.trim() ? '#451a03' : 'rgba(24,24,27,.22)' }}>
            {kind === 'task' ? 'Add task' : 'Post note'}
          </button>
        </div>
      </div>

      {/* list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {r.notes.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: 'rgba(24,24,27,.28)',
            fontSize: 12, border: '1px dashed rgba(24,24,27,.07)', borderRadius: 8 }}>
            No notes or tasks yet.
          </div>
        )}
        {r.notes.map((n, i) => (
          <div key={i} style={{ background: '#fbfbfa',
            border: '1px solid rgba(24,24,27,.05)',
            borderLeft: `3px solid ${n.kind === 'task' ? (n.done ? '#22c55e' : '#fbbf24') : '#5b5bf7'}`,
            borderRadius: 8, padding: '10px 12px',
            display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            {n.kind === 'task' ? (
              <button onClick={() => toggleDone(i)}
                style={{ all: 'unset', cursor: 'pointer', flexShrink: 0, marginTop: 1,
                  width: 16, height: 16, borderRadius: 4,
                  border: `1.5px solid ${n.done ? '#22c55e' : 'rgba(24,24,27,.35)'}`,
                  background: n.done ? '#22c55e' : 'transparent',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {n.done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fbfbfa" strokeWidth="2"><path d="M2 5l2 2 4-4"/></svg>}
              </button>
            ) : (
              <span style={{ fontSize: 14, marginTop: 1 }}>📝</span>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, lineHeight: 1.5,
                color: n.done ? 'rgba(24,24,27,.35)' : 'rgba(24,24,27,.85)',
                textDecoration: n.done ? 'line-through' : 'none' }}>
                {n.txt}
              </div>
              <div style={{ fontSize: 10.5, color: 'rgba(24,24,27,.42)', marginTop: 3 }}>
                {n.who} · {n.when}
                {n.kind === 'task' && <> · <span style={{ color: n.done ? '#22c55e' : '#fbbf24' }}>{n.done ? 'done' : 'open'}</span></>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KindChip({ on, label, onClick }) {
  return (
    <button onClick={onClick} style={{ all: 'unset', cursor: 'pointer',
      padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500,
      color: on ? '#fbbf24' : 'rgba(24,24,27,.52)',
      background: on ? 'rgba(251,191,36,.12)' : 'rgba(24,24,27,.035)',
      border: `1px solid ${on ? 'rgba(251,191,36,.35)' : 'rgba(24,24,27,.07)'}` }}>
      {label}
    </button>
  );
}

// ─── State photos ─────────────────────────────────────────────
function PhotosPanel({ r, onUpdate }) {
  const sevBorder = (s) => s === 'danger' ? 'rgba(239,68,68,.45)' : s === 'warn' ? 'rgba(251,191,36,.4)' : 'rgba(24,24,27,.06)';
  const sevLabel  = (s) => s === 'danger' ? { bg: '#ef4444', fg: '#fff', label: 'CRITICAL' }
                        : s === 'warn'   ? { bg: '#fbbf24', fg: '#451a03', label: 'WARN' }
                        : { bg: 'rgba(24,24,27,.07)', fg: '#fff', label: 'INFO' };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.48)', letterSpacing: 1 }}>
          STATE OF BILLIE · captured by robot cams or operators on duty
        </span>
        <span style={{ flex: 1 }}/>
        <button style={{ all: 'unset', cursor: 'pointer',
          padding: '6px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 600,
          color: 'rgba(24,24,27,.85)', border: '1px solid rgba(24,24,27,.09)',
          display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 2v8M3 6l4-4 4 4"/><rect x="2" y="10.5" width="10" height="2" rx=".5"/>
          </svg>
          Upload photo
        </button>
      </div>
      {r.statePhotos.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'rgba(24,24,27,.28)',
          fontSize: 12, border: '1px dashed rgba(24,24,27,.07)', borderRadius: 8 }}>
          No state photos yet. Upload one when an operator flags something worth remembering.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {r.statePhotos.map((p, i) => {
            const s = sevLabel(p.severity);
            return (
              <div key={i} style={{ background: '#fbfbfa',
                border: `1px solid ${sevBorder(p.severity)}`, borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ aspectRatio: '4/3', backgroundImage: `url(${p.img})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 6, left: 6,
                    padding: '2px 7px', borderRadius: 3, fontSize: 9, fontWeight: 700,
                    background: s.bg, color: s.fg, letterSpacing: .4 }}>
                    {s.label}
                  </span>
                </div>
                <div style={{ padding: '8px 10px 9px' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#17171a',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.tag}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.42)',
                    letterSpacing: .3, marginTop: 2 }}>
                    {p.by} · {p.t}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Parts log ────────────────────────────────────────────────
function PartsPanel({ r, onUpdate }) {
  const statusTone = {
    ok:    { color: '#22c55e', label: 'OK' },
    watch: { color: '#fbbf24', label: 'WATCH' },
    order: { color: '#ef4444', label: 'ON ORDER' },
  };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.48)', letterSpacing: 1 }}>
          REPLACEMENT PARTS · track wear, mark as watch, log orders
        </span>
        <span style={{ flex: 1 }}/>
        <button style={{ all: 'unset', cursor: 'pointer',
          padding: '6px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 600,
          color: 'rgba(24,24,27,.85)', border: '1px solid rgba(24,24,27,.09)',
          display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M7 2v10M2 7h10"/>
          </svg>
          Log part
        </button>
      </div>
      <div style={{ background: '#fbfbfa', border: '1px solid rgba(24,24,27,.05)',
        borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'grid',
          gridTemplateColumns: '1.2fr 100px 100px 70px 2fr',
          padding: '10px 14px', background: 'rgba(255,255,255,.03)',
          borderBottom: '1px solid rgba(24,24,27,.05)',
          fontSize: 9.5, fontFamily: 'var(--mono)', color: 'rgba(24,24,27,.42)',
          letterSpacing: 1 }}>
          <span>PART</span><span>STATUS</span><span>SKU</span><span>QTY</span><span>NOTE</span>
        </div>
        {r.parts.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: 'rgba(24,24,27,.28)',
            fontSize: 12 }}>
            No parts logged.
          </div>
        )}
        {r.parts.map((p, i) => {
          const s = statusTone[p.status] || statusTone.ok;
          return (
            <div key={i} style={{ display: 'grid',
              gridTemplateColumns: '1.2fr 100px 100px 70px 2fr', gap: 8,
              padding: '11px 14px', alignItems: 'center',
              borderBottom: i < r.parts.length - 1 ? '1px solid rgba(24,24,27,.035)' : 'none',
              fontSize: 12.5, color: 'var(--ink-1)' }}>
              <span style={{ fontWeight: 500 }}>{p.name}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: .4 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: s.color }}/>
                {s.label}
              </span>
              <span className="mono" style={{ fontSize: 11, color: 'rgba(24,24,27,.52)' }}>{p.sku}</span>
              <span className="mono tnum" style={{ fontSize: 12, color: 'rgba(24,24,27,.66)' }}>{p.qty}</span>
              <span style={{ fontSize: 11.5, color: 'rgba(24,24,27,.58)' }}>{p.note}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Add Billie modal ─────────────────────────────────────────
function AddBillieModal({ onClose, onAdd, siteOptions }) {
  const [model, setModel] = React.useState('Bellhop v2.3');
  const [site, setSite] = React.useState(siteOptions[0] || 'Marriott Rome');
  const [serial, setSerial] = React.useState('');
  const siteToCity = {
    'Marriott Rome':     { city: 'Rome',     flag: '🇮🇹' },
    'Hilton Berlin':     { city: 'Berlin',   flag: '🇩🇪' },
    'Cardo Brussels':    { city: 'Brussels', flag: '🇧🇪' },
    'Seminaris Potsdam': { city: 'Potsdam',  flag: '🇩🇪' },
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: 'min(460px, 92vw)', background: '#ffffff',
          border: '1px solid rgba(24,24,27,.07)', borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,.6)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(24,24,27,.05)',
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: 7,
            background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.35)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8">
              <rect x="5" y="7" width="14" height="10" rx="2"/>
              <circle cx="9" cy="12" r="1" fill="#fbbf24"/><circle cx="15" cy="12" r="1" fill="#fbbf24"/>
              <path d="M12 3v4M8 20h8"/>
            </svg>
          </span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#17171a',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Register a new Billie</div>
            <div style={{ fontSize: 11.5, color: 'rgba(24,24,27,.48)' }}>
              Fresh out of the crate — it starts idle on its home site.
            </div>
          </div>
          <span style={{ flex: 1 }}/>
          <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer',
            padding: 4, color: 'rgba(24,24,27,.48)' }}>✕</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Model">
            <select value={model} onChange={e => setModel(e.target.value)} style={SELECT_STYLE}>
              <option>Bellhop v2.3</option>
              <option>Bellhop v2.2</option>
              <option>Bellhop v3.0 (pilot)</option>
            </select>
          </Field>
          <Field label="Serial / VIN">
            <input value={serial} onChange={e => setSerial(e.target.value)}
              placeholder="BH23-0000 (leave blank to auto-generate)"
              style={INPUT_STYLE}/>
          </Field>
          <Field label="Assign to site">
            <select value={site} onChange={e => setSite(e.target.value)} style={SELECT_STYLE}>
              {siteOptions.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(24,24,27,.05)',
          display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer',
            padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
            color: 'rgba(24,24,27,.62)' }}>Cancel</button>
          <button onClick={() => {
              const c = siteToCity[site] || { city: 'Rome', flag: '🇮🇹' };
              onAdd({ model, serial, site, city: c.city, flag: c.flag });
            }}
            style={{ all: 'unset', cursor: 'pointer',
              padding: '8px 16px', borderRadius: 6, fontSize: 12.5, fontWeight: 600,
              background: '#fbbf24', color: '#451a03' }}>
            Register Billie
          </button>
        </div>
      </div>
    </div>
  );
}

const INPUT_STYLE = {
  width: '100%', padding: '8px 10px', borderRadius: 6,
  background: 'rgba(24,24,27,.035)', border: '1px solid rgba(24,24,27,.08)',
  color: '#17171a', fontSize: 12.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};
const SELECT_STYLE = {
  ...INPUT_STYLE, appearance: 'none',
  backgroundImage: 'linear-gradient(45deg, transparent 50%, rgba(24,24,27,.48) 50%), linear-gradient(135deg, rgba(24,24,27,.48) 50%, transparent 50%)',
  backgroundPosition: 'calc(100% - 14px) calc(50% - 2px), calc(100% - 9px) calc(50% - 2px)',
  backgroundSize: '5px 5px', backgroundRepeat: 'no-repeat',
};

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.48)', letterSpacing: 1 }}>
        {label.toUpperCase()}
      </span>
      {children}
    </div>
  );
}

// export to window so the main entry can render it
Object.assign(window, { RobotsApp });
