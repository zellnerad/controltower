// LiveView.jsx — shared state + three layout compositions.
// Central state keeps sparklines, log, tasks and chat synced across layouts.

function useLiveState() {
  const [battery, setBattery] = React.useState(Array.from({ length: 40 }, (_, i) => 76 - i * 0.05 + Math.sin(i / 3) * 0.4));
  const [cpu, setCpu] = React.useState(Array.from({ length: 40 }, (_, i) => 42 + Math.sin(i / 2) * 8 + Math.random() * 3));
  const [signal, setSignal] = React.useState(Array.from({ length: 40 }, (_, i) => 78 + Math.sin(i / 4) * 6 + Math.random() * 2));
  const [temp, setTemp] = React.useState(Array.from({ length: 40 }, (_, i) => 48 + Math.sin(i / 5) * 3));

  React.useEffect(() => {
    const id = setInterval(() => {
      setBattery((b) => [...b.slice(1), Math.max(0, b[b.length - 1] - 0.03 + (Math.random() - 0.5) * 0.2)]);
      setCpu((c) => [...c.slice(1), Math.max(0, Math.min(100, c[c.length - 1] + (Math.random() - 0.5) * 6))]);
      setSignal((s) => [...s.slice(1), Math.max(30, Math.min(100, s[s.length - 1] + (Math.random() - 0.5) * 4))]);
      setTemp((t) => [...t.slice(1), t[t.length - 1] + (Math.random() - 0.5) * 0.6]);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const [messages, setMessages] = React.useState([
    { role: 'agent', content: 'Good evening. Running Evening Rounds flow. I\'m in the corridor outside 103, heading to 202 with the meds cart.' },
    { role: 'user', content: 'How many stops left?' },
    { role: 'agent', content: 'Three more: 202, 204, and the nurse station. ETA 8 min if 201 stays clear.' },
  ]);

  const [log, setLog] = React.useState([
    { t: '19:42:01', level: 'info', msg: 'path planner: replan triggered (obstacle at 12.4, 5.1)' },
    { t: '19:41:58', level: 'ok',   msg: 'localization: pose confidence 0.94' },
    { t: '19:41:52', level: 'info', msg: 'nav: waypoint "corridor-B3" reached' },
    { t: '19:41:40', level: 'warn', msg: 'perception: low-confidence track (human, 3.2m)' },
    { t: '19:41:22', level: 'ok',   msg: 'task "deliver-203" completed (2m 14s)' },
    { t: '19:40:55', level: 'info', msg: 'flow "Evening Rounds" step 3/7 started' },
    { t: '19:40:32', level: 'ok',   msg: 'cart: payload secured (1.8 kg)' },
    { t: '19:40:10', level: 'info', msg: 'billieboss: acknowledged operator command' },
  ]);

  React.useEffect(() => {
    const id = setInterval(() => {
      const lines = [
        { level: 'info', msg: 'nav: speed 0.42 m/s, heading 94°' },
        { level: 'ok', msg: 'localization: pose confidence 0.96' },
        { level: 'info', msg: 'perception: 2 humans tracked in corridor' },
        { level: 'warn', msg: 'nav: narrow gap detected (0.82 m)' },
      ];
      const now = new Date();
      const t = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const line = { ...lines[Math.floor(Math.random() * lines.length)], t };
      setLog((l) => [line, ...l].slice(0, 14));
    }, 4200);
    return () => clearInterval(id);
  }, []);

  return { battery, cpu, signal, temp, messages, setMessages, log, setLog };
}

const ROBOT = { id: 'B-08', name: 'Billie-08', model: 'Bellhop v2.3', location: 'St. Mary\'s · Floor 3 · Ward B' };
const FLEET = [
  { id: 'B-08', name: 'Billie-08', status: 'active',  battery: 73, location: 'Ward B · Floor 3' },
  { id: 'B-11', name: 'Billie-11', status: 'active',  battery: 58, location: 'Ward A · Floor 2' },
  { id: 'B-15', name: 'Billie-15', status: 'idle',    battery: 91, location: 'Dock · Basement'   },
  { id: 'B-16', name: 'Billie-16', status: 'charging',battery: 34, location: 'Bay 2 · Floor 1'   },
  { id: 'B-18', name: 'Billie-18', status: 'active',  battery: 62, location: 'Ward C · Floor 4'  },
];
const CONN = { state: 'Link stable', latency: 12, ssid: 'SM-OR-5G', rssi: -58, bandwidth: 82 };

// who's on shift
const OPERATOR = { id: 'op1', name: 'Dr. Sarah Chen', role: 'Ward Charge Nurse', init: 'SC', color: '#f59e0b', shift: 'On call · 14:00–22:00' };
const TEAM = [
  { id: 'op1', name: 'Dr. Sarah Chen',   init: 'SC', color: '#f59e0b' },
  { id: 'op2', name: 'Marcus Rivera',    init: 'MR', color: '#22c55e' },
  { id: 'op3', name: 'Priya Okafor',     init: 'PO', color: '#ec4899' },
  { id: 'op4', name: 'Jenna Lindqvist',  init: 'JL', color: '#3b82f6' },
  { id: 'op5', name: 'Tomás Álvarez',    init: 'TA', color: '#a855f7' },
];
// canned mission events for the timeline (t in minutes since mission start)
const MISSION_EVENTS_INIT = [
  { id: 'e1', t: 0,   kind: 'start',  label: 'Mission started',       tags: ['op1'] },
  { id: 'e2', t: 3,   kind: 'nav',    label: 'Left dock · Bay 2',     tags: [] },
  { id: 'e3', t: 7,   kind: 'nav',    label: 'Paused at elevator',    tags: ['op2'] },
  { id: 'e4', t: 11,  kind: 'pick',   label: 'Picked up coffee tray', tags: ['op3'] },
  { id: 'e5', t: 14,  kind: 'alert',  label: 'Re-planned around spill', tags: ['op1', 'op4'] },
];
const FLOW_STEPS = [
  'Pick up cart from pharmacy',
  'Deliver meds to room 201',
  'Deliver meds to room 202',
  'Deliver meds to room 204',
  'Return cart to nurse station',
  'Dock for charging',
];
// Flows are structured as: POI → Items → Actions
// POI = waypoint (e.g. "Entrance"). Item = sub-routine at that POI.
// Action = atomic snake_case skill call the robot executes.
// `current` is a [poiIdx, itemIdx, actionIdx] pointer into the tree.
const FLOWS = {
  'Morning Café Run': {
    tag: 'DELIVERY · 18 MIN',
    current: [0, 0, 2],
    pois: [
      { name: 'Room 1412', items: [
        { name: 'Opening the door', actions: [
          'Walking to Room 1412', 'Nudging the door open', 'Entering the bathroom',
          'Softening collision limits', 'Sliding through the gap', 'Tucking the arm in',
          'Restoring collision limits', 'Sliding clear of the doorway',
        ]},
      ]},
      { name: 'Coffee Corner', items: [
        { name: 'Picking up the order', actions: [
          'Approaching the counter', 'Spotting the coffee tray', 'Opening the gripper',
          'Closing around the tray', 'Lifting the tray',
          'Easing back from the counter', 'Confirming stable grip',
        ]},
        { name: 'Turning toward the exit', actions: [
          'Rotating the base', 'Realigning the arm', 'Sliding into the corridor',
        ]},
      ]},
      { name: 'Restroom Check', items: [
        { name: 'Inspecting the bathroom', actions: [
          'Walking to the restroom', 'Scanning the floor for spills',
          'Checking for a waiting person', 'Logging the status',
        ]},
      ]},
      { name: 'Dock', items: [
        { name: 'Returning to the dock', actions: [
          'Walking to the dock', 'Aligning with the charger',
          'Backing into the dock', 'Starting to charge',
        ]},
      ]},
    ],
  },
  'Linen Collection': {
    tag: 'LOGISTICS · 22 MIN',
    current: [0, 0, 0],
    pois: [
      { name: 'Linen Storage', items: [
        { name: 'Picking up a fresh stack', actions: [
          'Walking to storage', 'Spotting the linen bundle', 'Opening the gripper',
          'Closing around the bundle', 'Lifting the bundle',
        ]},
      ]},
      { name: 'Room 201', items: [
        { name: 'Delivering fresh linens', actions: [
          'Walking to Room 201', 'Knocking on the door', 'Checking entry policy',
          'Stepping inside', 'Setting down the bundle',
        ]},
      ]},
      { name: 'Laundry Chute', items: [
        { name: 'Dropping off used linens', actions: [
          'Walking to the chute', 'Aligning with the opening',
          'Opening the gripper', 'Releasing into the chute',
        ]},
      ]},
    ],
  },
  'Lab Sample Courier': {
    tag: 'TRANSPORT · 12 MIN',
    current: [0, 0, 0],
    pois: [
      { name: 'Nurse Station 3F', items: [
        { name: 'Picking up the samples', actions: [
          'Walking to the nurse station', 'Spotting the sample rack',
          'Closing around the rack', 'Lifting carefully',
        ]},
      ]},
      { name: 'Lab 2F', items: [
        { name: 'Dropping off the samples', actions: [
          'Walking to the lab', 'Aligning with the drop-off tray',
          'Placing the rack', 'Opening the gripper', 'Retracting the arm',
        ]},
      ]},
    ],
  },
  'Night Patrol': {
    tag: 'SECURITY · 40 MIN',
    current: [0, 0, 0],
    pois: [
      { name: 'Dock', items: [{ name: 'Leaving the dock', actions: ['Undocking', 'Rotating the base', 'Heading to the first corridor'] }] },
      { name: 'Corridor A', items: [{ name: 'Sweeping the corridor', actions: ['Walking the corridor', 'Scanning 360°', 'Logging what was seen'] }] },
      { name: 'Corridor B', items: [{ name: 'Sweeping the corridor', actions: ['Walking the corridor', 'Scanning 360°', 'Logging what was seen'] }] },
      { name: 'Fire Exits', items: [{ name: 'Checking the exits', actions: ['Walking to the exits', 'Scanning 360°', 'Confirming doors are closed'] }] },
    ],
  },
  'Disinfection Pass': {
    tag: 'CLEANING · 28 MIN',
    current: [0, 0, 0],
    pois: [
      { name: 'Room 201', items: [{ name: 'UV disinfection', actions: ['Walking to Room 201', 'Starting the UV lamp', 'Sweeping the room', 'Turning the UV lamp off'] }] },
      { name: 'Room 202', items: [{ name: 'UV disinfection', actions: ['Walking to Room 202', 'Starting the UV lamp', 'Sweeping the room', 'Turning the UV lamp off'] }] },
      { name: 'Corridor', items: [{ name: 'UV disinfection', actions: ['Walking the corridor', 'Starting the UV lamp', 'Sweeping the corridor', 'Turning the UV lamp off'] }] },
    ],
  },
  'Morning Rounds': {
    tag: 'DELIVERY · 35 MIN',
    current: [0, 0, 0],
    pois: [
      { name: 'Kitchen', items: [{ name: 'Picking up the tray', actions: ['Walking to the kitchen', 'Spotting the meal tray', 'Closing around the tray', 'Lifting the tray'] }] },
      { name: 'Room 201', items: [{ name: 'Delivering breakfast', actions: ['Walking to Room 201', 'Aligning with the table', 'Placing the tray', 'Retracting the arm'] }] },
      { name: 'Room 202', items: [{ name: 'Delivering breakfast', actions: ['Walking to Room 202', 'Aligning with the table', 'Placing the tray', 'Retracting the arm'] }] },
      { name: 'Room 204', items: [{ name: 'Delivering breakfast', actions: ['Walking to Room 204', 'Aligning with the table', 'Placing the tray', 'Retracting the arm'] }] },
    ],
  },
};

// Flatten flow into linear list of action rows with poi/item context;
// compute global index of `current` for progress calculations.
function flattenFlow(flow) {
  const rows = []; let globalIdx = 0, currentGlobal = 0;
  const [cp, ci, ca] = flow.current;
  flow.pois.forEach((poi, pi) => {
    poi.items.forEach((it, ii) => {
      it.actions.forEach((name, ai) => {
        const isCurrent = pi === cp && ii === ci && ai === ca;
        const isDone = pi < cp || (pi === cp && ii < ci) || (pi === cp && ii === ci && ai < ca);
        if (isCurrent) currentGlobal = globalIdx;
        rows.push({
          global: globalIdx++, poi: poi.name, poiIdx: pi,
          item: it.name, itemIdx: ii, action: name, actionIdx: ai,
          done: isDone, active: isCurrent,
          firstInItem: ai === 0, firstInPoi: ai === 0 && ii === 0,
          lastInItem: ai === it.actions.length - 1,
          lastInPoi: ii === poi.items.length - 1 && ai === it.actions.length - 1,
        });
      });
    });
  });
  return { rows, total: globalIdx, currentGlobal };
}
const TASKS = [
  { title: 'Take the elevator to floor 4',       status: 'active',  eta: '1m' },
  { title: 'Inspect room 4212',                  status: 'queued',  eta: '4m' },
  { title: 'Inspect room 4667',                  status: 'queued',  eta: '8m' },
  { title: 'Take the laundry cart to basement',  status: 'queued',  eta: '14m' },
];

// ═══ LAYOUT A — Operator ══════════════════════════════════════
// Camera dominant left; map + telemetry right column; agent + queue + log
// split along the bottom. Balanced workhorse.
function LayoutOperator({ lidar, setLidar, agentStyle = 'chat' }) {
  const s = useLiveState();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <TopBar robot={ROBOT} connection={CONN} lidar={lidar} onLidarToggle={() => setLidar(!lidar)} />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gridTemplateRows: '1.1fr 1fr',
        gap: 12, padding: 12, minHeight: 0 }}>
        {/* camera, spans 2 rows */}
        <div style={{ gridRow: '1 / 3', minHeight: 0 }}>
          <Panel title={<><Icon d={I.cam} size={12}/> Live Camera · CAM_01</>}
            actions={<><IconBtn icon={I.lidar} size={24} active={lidar} onClick={() => setLidar(!lidar)} title="LIDAR"/><IconBtn icon={I.expand} size={24}/></>}
            pad={false} style={{ height: '100%' }}>
            <CameraView robot={ROBOT} lidar={lidar} />
          </Panel>
        </div>
        {/* map top-right */}
        <Panel title={<><Icon d={I.map} size={12}/> Map · Floor 3</>}
          actions={<Chip><span className="mono">2.4 m/s</span></Chip>}
          pad={false} style={{ minHeight: 0 }}>
          <MapView robot={ROBOT} showLidar={lidar} />
        </Panel>
        {/* telemetry + flow + agent bottom-right */}
        <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 12, minHeight: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <TelemetryCard label="Battery" value={s.battery[s.battery.length-1].toFixed(0)} unit="%"
              spark={s.battery} tone="ok" icon={I.bolt}/>
            <TelemetryCard label="Signal" value={s.signal[s.signal.length-1].toFixed(0)} unit="%"
              spark={s.signal} tone="neutral" icon={I.wifi}/>
            <TelemetryCard label="CPU" value={s.cpu[s.cpu.length-1].toFixed(0)} unit="%"
              spark={s.cpu} tone="warn" icon={I.cpu}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 0 }}>
            <Panel title={<><Icon d={I.route} size={12}/> Flow · Evening Rounds</>}>
              <FlowSteps steps={FLOW_STEPS} current={2} />
            </Panel>
            <Panel title={<><Icon d={I.chat} size={12}/> Agent · Billie Boss</>} pad={false}
              style={agentStyle === 'terminal' ? { background: '#16171c', borderColor: '#26272d' } : {}}>
              <AgentChat messages={s.messages} setMessages={s.setMessages} robot={ROBOT} variant={agentStyle} />
            </Panel>
          </div>
        </div>
      </div>
      {/* bottom rail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, padding: '0 12px 12px', height: 220, flexShrink: 0 }}>
        <Panel title={<><Icon d={I.queue} size={12}/> Task Queue · 5 pending</>}>
          <div style={{ overflowY: 'auto', minHeight: 0 }}><TaskQueue tasks={TASKS}/></div>
        </Panel>
        <Panel title={<>Activity Log</>} actions={<Chip dot tone="ok">live</Chip>}>
          <div style={{ overflowY: 'auto', minHeight: 0 }}><ActivityLog entries={s.log}/></div>
        </Panel>
      </div>
    </div>
  );
}

// ─── ArmPanel — compact manipulator status snippet ─────────────
// Live XYZ + roll/pitch/yaw pose, state/mode/payload/mounting, and per-joint
// angles J1–J6 with color dots. Values drift subtly to feel real.
function ArmPanel() {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1100);
    return () => clearInterval(id);
  }, []);
  // subtle drift
  const drift = (base, amp) => base + Math.sin((tick + base) / 4) * amp + (Math.random() - 0.5) * (amp / 4);
  const pose = {
    x: drift(-333.1, 0.4), y: drift(531.6, 0.4), z: drift(400.8, 0.3),
    r: drift(-178.3, 0.2), p: drift(55.9, 0.2), w: drift(-100.5, 0.3),
  };
  const joints = [
    { name: 'J1', val: drift(138.8, 0.5), color: '#f59e0b' },
    { name: 'J2', val: drift(1.7, 0.4),   color: '#ef4444' },
    { name: 'J3', val: drift(-81.5, 0.5), color: '#22c55e' },
    { name: 'J4', val: drift(-55.6, 0.4), color: '#3b82f6' },
    { name: 'J5', val: drift(60.4, 0.5),  color: '#a855f7' },
    { name: 'J6', val: drift(-98.2, 0.4), color: '#ec4899' },
  ];
  const Row = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11 }}>
      <span style={{ color: 'rgba(255,255,255,.5)' }}>{label}</span>
      <span className="mono tnum" style={{ color: '#fff', fontWeight: 500 }}>{value}</span>
    </div>
  );
  return (
    <div style={{ color: '#fff' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(199,210,254,.9)' }}>
          <circle cx="4" cy="12" r="1.5"/><circle cx="11" cy="4" r="1.5"/>
          <path d="M5 11l5-5M11 5.5l2 1M11 2.5l2-1"/>
        </svg>
        <span style={{ fontSize: 10.5, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.55)',
          letterSpacing: 1, flex: 1 }}>ARM · 6-DOF</span>
        {/* Real/Sim segmented toggle (read-only, visual) */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,.06)', borderRadius: 5, padding: 2 }}>
          <span style={{ padding: '2px 8px', borderRadius: 3, background: 'var(--accent)',
            color: '#fff', fontSize: 10, fontWeight: 600 }}>Real</span>
          <span style={{ padding: '2px 8px', borderRadius: 3,
            color: 'rgba(255,255,255,.5)', fontSize: 10, fontWeight: 500 }}>Sim</span>
        </div>
      </div>

      {/* 2-col: meta (left) + pose (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 10, marginBottom: 10,
        padding: '8px 10px', background: 'rgba(255,255,255,.03)', borderRadius: 6,
        border: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Row label="State" value={<span style={{ color: '#86efac' }}>● Normal</span>}/>
          <Row label="Mode"  value="Position"/>
          <Row label="Payload"  value="1.30 kg"/>
          <Row label="Mounting" value="Floor"/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', rowGap: 6, columnGap: 6 }}>
          <PoseCell label="X" value={pose.x.toFixed(1)} unit="mm"/>
          <PoseCell label="Y" value={pose.y.toFixed(1)} unit="mm"/>
          <PoseCell label="Z" value={pose.z.toFixed(1)} unit="mm"/>
          <PoseCell label="Roll"  value={pose.r.toFixed(1)} unit="°"/>
          <PoseCell label="Pitch" value={pose.p.toFixed(1)} unit="°"/>
          <PoseCell label="Yaw"   value={pose.w.toFixed(1)} unit="°"/>
        </div>
      </div>

      {/* joints row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
        {joints.map(j => (
          <div key={j.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '5px 0', background: 'rgba(255,255,255,.03)', borderRadius: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9,
              color: 'rgba(255,255,255,.55)', fontFamily: 'var(--mono)' }}>
              <span style={{ width: 5, height: 5, borderRadius: 3, background: j.color,
                boxShadow: `0 0 4px ${j.color}80` }}/>
              {j.name}
            </span>
            <span className="mono tnum" style={{ fontSize: 11.5, color: '#fff', fontWeight: 600 }}>
              {j.val.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
function PoseCell({ label, value, unit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,.45)', fontFamily: 'var(--mono)', letterSpacing: .5 }}>{label}</span>
      <span className="mono tnum" style={{ fontSize: 11.5, color: '#fff', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {value}<span style={{ color: 'rgba(255,255,255,.4)', fontWeight: 400, marginLeft: 2, fontSize: 9.5 }}>{unit}</span>
      </span>
    </div>
  );
}

// ─── AgentStatusLine — Claude-Code-style live "what I'm doing now" ──
const AGENT_STATUSES = [
  { v: 'nav',  text: 'Navigating to POI: dock2', meta: '[-2.144, 4.460, 1.571]' },
  { v: 'arm',  text: 'Folding arm and gripper to travel position', meta: null },
  { v: 'scan', text: 'Scanning for handoff tag near counter A', meta: 'conf 0.87' },
  { v: 'plan', text: 'Re-planning around cart at corridor 3B',    meta: '142 cells' },
  { v: 'wait', text: 'Waiting for elevator · car 2 inbound',      meta: 'ETA 14s' },
];
function AgentStatusLine() {
  const [i, setI] = React.useState(0);
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    const a = setInterval(() => setI((x) => (x + 1) % AGENT_STATUSES.length), 4200);
    const b = setInterval(() => setT((x) => x + 1), 1000);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);
  const s = AGENT_STATUSES[i];
  const dots = '.'.repeat((t % 3) + 1);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, marginTop: 2 }}>
      {/* spinner */}
      <svg width="10" height="10" viewBox="0 0 14 14" style={{ flexShrink: 0, animation: 'spin 1.2s linear infinite' }}>
        <circle cx="7" cy="7" r="5" fill="none" stroke="rgba(199,210,254,.2)" strokeWidth="1.6"/>
        <path d="M7 2a5 5 0 015 5" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
      <span className="mono" style={{ fontSize: 10.5, color: 'rgba(199,210,254,.95)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, flex: 1 }}
        title={s.text + (s.meta ? ' ' + s.meta : '')}>
        {s.text}{dots}
        {s.meta && <span style={{ color: 'rgba(255,255,255,.35)', marginLeft: 6 }}>{s.meta}</span>}
      </span>
    </div>
  );
}

// ─── Operator / collab components ──────────────────────────
// Avatar: colored initials pill
function Avatar({ p, size = 22, onClick, title }) {
  if (!p) return null;
  return (
    <span onClick={onClick} title={title || p.name}
      style={{ width: size, height: size, borderRadius: size, background: p.color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.max(8, size * 0.42), fontWeight: 700, color: '#fff',
        flexShrink: 0, cursor: onClick ? 'pointer' : 'default',
        border: '1.5px solid rgba(18,20,26,.9)', letterSpacing: .2 }}>
      {p.init}
    </span>
  );
}
function AvatarStack({ people, size = 18, max = 3 }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      {shown.map((p, i) => (
        <span key={p.id} style={{ marginLeft: i === 0 ? 0 : -6 }}>
          <Avatar p={p} size={size}/>
        </span>
      ))}
      {extra > 0 && (
        <span style={{ marginLeft: -6, width: size, height: size, borderRadius: size,
          background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.85)',
          border: '1.5px solid rgba(18,20,26,.9)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: Math.max(8, size * 0.42), fontWeight: 700 }}>+{extra}</span>
      )}
    </div>
  );
}

// SidebarAction: pill button for the actions strip
function SidebarAction({ icon, label, onClick, active, tone }) {
  const tones = {
    default: { bg: 'rgba(255,255,255,.04)', border: 'rgba(255,255,255,.1)', fg: 'rgba(255,255,255,.85)' },
    warn:    { bg: 'rgba(251,146,60,.1)',   border: 'rgba(251,146,60,.25)', fg: '#fdba74' },
  };
  const t = tones[tone] || tones.default;
  return (
    <button onClick={onClick}
      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        padding: '6px 8px', borderRadius: 5,
        border: `1px solid ${active ? 'var(--accent)' : t.border}`,
        background: active ? 'rgba(91,91,247,.18)' : t.bg,
        color: active ? '#c7d2fe' : t.fg,
        fontSize: 10.5, fontFamily: 'inherit', fontWeight: 500, cursor: 'pointer',
        transition: 'background .12s' }}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

// DrawerShell: title row + close + scrollable body
function DrawerShell({ title, icon, onClose, children, maxH = 280 }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,.08)', flexShrink: 0,
      background: 'rgba(255,255,255,.015)' }}>
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'rgba(199,210,254,.85)', display: 'flex' }}>{icon}</span>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#fff', flex: 1 }}>{title}</span>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent',
          color: 'rgba(255,255,255,.5)', cursor: 'pointer', width: 20, height: 20, borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <Icon d={I.close} size={11}/>
        </button>
      </div>
      <div style={{ maxHeight: maxH, overflowY: 'auto', padding: '4px 12px 12px' }}>
        {children}
      </div>
    </div>
  );
}

// Captain's Log — scrollable log entries + add entry row
function CaptainsLogDrawer({ onClose }) {
  const [entries, setEntries] = React.useState([
    { t: '14:08', author: OPERATOR, text: 'Starting café run. Corridor A looked clear.' },
    { t: '14:14', author: TEAM[1], text: 'Robot paused at the elevator; re-queued the call.' },
    { t: '14:19', author: OPERATOR, text: 'Spill at 3F hallway — re-planned. Dispatched facilities.' },
  ]);
  const [draft, setDraft] = React.useState('');
  const add = () => {
    if (!draft.trim()) return;
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setEntries((e) => [...e, { t, author: OPERATOR, text: draft.trim() }]);
    setDraft('');
  };
  return (
    <DrawerShell title="Log · Morning Café Run" onClose={onClose}
      icon={<svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 1h8v12H3zM5 4h4M5 7h4M5 10h3"/></svg>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        {entries.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 8 }}>
            <span className="mono tnum" style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', flexShrink: 0, width: 34 }}>{e.t}</span>
            <Avatar p={e.author} size={16}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)' }}>{e.author.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.9)', lineHeight: 1.4 }}>{e.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          placeholder="Add log entry…"
          style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
            outline: 'none', color: '#fff', fontSize: 11.5, fontFamily: 'var(--sans)',
            padding: '6px 8px', borderRadius: 5 }}/>
        <button onClick={add} disabled={!draft.trim()}
          style={{ border: 'none', background: draft.trim() ? 'var(--accent)' : 'rgba(255,255,255,.08)',
            color: '#fff', padding: '0 12px', borderRadius: 5, fontSize: 11, fontWeight: 600,
            cursor: draft.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>Log</button>
      </div>
    </DrawerShell>
  );
}

// CameraDrivePanel — floating on the camera, bottom-right. Compact D-pad
// with a rotation ring; robot image rotates to match real heading.
function CameraDrivePanel({ rightEdge, locked, inlineArm = false, topOffset }) {
  const [pressed, setPressed] = React.useState(null);
  const [collapsed, setCollapsed] = React.useState(false);
  const [subTab, setSubTab] = React.useState('base'); // 'base' | 'arm' (only when inlineArm)
  const [heading, setHeading] = React.useState(0); // degrees, 0 = base orientation
  const [pos, setPos] = React.useState({ x: 0, y: 0 }); // translation offset
  const [dragging, setDragging] = React.useState(false);
  const ringRef = React.useRef(null);

  const step = (dir) => {
    if (locked) return;
    setPressed(dir);
    setTimeout(() => setPressed(null), 180);
    // translate relative to current heading
    const rad = (heading - 90) * Math.PI / 180; // image baseline faces "right" in flat coords
    const forward = { x: Math.cos(rad), y: Math.sin(rad) };
    const right = { x: -forward.y, y: forward.x };
    const d = 6;
    if (dir === 'up')    setPos(p => ({ x: p.x + forward.x * d, y: p.y + forward.y * d }));
    if (dir === 'down')  setPos(p => ({ x: p.x - forward.x * d, y: p.y - forward.y * d }));
    if (dir === 'left')  setPos(p => ({ x: p.x - right.x * d,   y: p.y - right.y * d }));
    if (dir === 'right') setPos(p => ({ x: p.x + right.x * d,   y: p.y + right.y * d }));
  };

  // keyboard — arrows + WASD + Q/E rotate
  React.useEffect(() => {
    const onKey = (e) => {
      if (locked) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right' };
      if (map[e.key]) { e.preventDefault(); step(map[e.key]); }
      if (e.key === 'q' || e.key === 'Q') setHeading(h => h - 15);
      if (e.key === 'e' || e.key === 'E') setHeading(h => h + 15);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked, heading]);

  // Drag on rotation ring
  const startDrag = (e) => {
    if (locked) return;
    e.preventDefault();
    setDragging(true);
  };
  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      if (!ringRef.current) return;
      const r = ringRef.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const ang = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI + 90;
      setHeading(ang);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging]);

  // D-pad arrow button
  const Arrow = ({ dir, rot, style }) => {
    const on = pressed === dir;
    return (
      <button onMouseDown={() => step(dir)}
        disabled={locked}
        style={{ position: 'absolute', width: 30, height: 30, borderRadius: 8,
          border: `1px solid ${on ? 'var(--accent)' : 'rgba(255,255,255,.22)'}`,
          background: on ? 'var(--accent)' : 'rgba(14,16,20,.85)',
          color: '#fff', cursor: locked ? 'not-allowed' : 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: on ? '0 0 14px rgba(91,91,247,.7)' : '0 2px 6px rgba(0,0,0,.4)',
          transition: 'all .12s', opacity: locked ? 0.45 : 1, padding: 0,
          ...style }}>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor"
          strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: `rotate(${rot}deg)` }}><path d="M8 3v10M4 7l4-4 4 4"/></svg>
      </button>
    );
  };

  if (collapsed) {
    return (
      <button onClick={() => setCollapsed(false)} title="Manual drive"
        style={{ position: 'absolute',
          ...(topOffset != null ? { top: topOffset } : { bottom: 12 }),
          right: rightEdge, width: 40, height: 40, borderRadius: 8,
          border: '1px solid rgba(255,255,255,.15)', background: 'rgba(14,16,20,.85)',
          backdropFilter: 'blur(10px)', color: '#fff', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,.3)', transition: 'right .22s ease' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="5"/><path d="M8 4.5v7M4.5 8h7"/></svg>
      </button>
    );
  }

  const PANEL_W = 280;
  const IMG_SIZE = 204;

  return (
    <div style={{ position: 'absolute',
      ...(topOffset != null ? { top: topOffset } : { bottom: 12 }),
      right: rightEdge, width: PANEL_W,
      borderRadius: 10, background: 'rgba(14,16,20,.85)', backdropFilter: 'blur(14px)',
      border: '1px solid rgba(255,255,255,.08)', padding: 10,
      transition: 'right .22s ease',
      boxShadow: '0 8px 28px rgba(0,0,0,.4)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: 3,
          background: locked ? '#f59e0b' : '#22c55e',
          boxShadow: `0 0 6px ${locked ? '#f59e0b' : '#22c55e'}` }}/>
        {inlineArm ? (
          <div style={{ display: 'flex', gap: 2, flex: 1,
            background: 'rgba(255,255,255,.04)', borderRadius: 5, padding: 2 }}>
            {[
              { v: 'base', label: 'BASE' },
              { v: 'arm',  label: 'ARM' },
            ].map(t => {
              const on = subTab === t.v;
              return (
                <button key={t.v} onClick={() => setSubTab(t.v)}
                  style={{ flex: 1, padding: '3px 6px', borderRadius: 3, border: 'none',
                    background: on ? 'rgba(91,91,247,.25)' : 'transparent',
                    color: on ? '#c7d2fe' : 'rgba(255,255,255,.6)',
                    fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: .8,
                    cursor: 'pointer', transition: 'all .12s' }}>{t.label}</button>
              );
            })}
          </div>
        ) : (
          <span style={{ fontSize: 10.5, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.65)',
            letterSpacing: 1, flex: 1 }}>DRIVE</span>
        )}
        <span className="mono tnum" style={{ fontSize: 9.5, color: 'rgba(199,210,254,.8)' }}>
          {Math.round((((heading % 360) + 360) % 360))}°
        </span>
        <button onClick={() => setCollapsed(true)} title="Hide"
          style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,.5)',
            cursor: 'pointer', width: 18, height: 18, borderRadius: 3, padding: 0,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6"/></svg>
        </button>
      </div>

      {inlineArm && subTab === 'arm' ? (
        <ArmControlPanel mode="embedded" locked={locked}/>
      ) : (<>
      {/* Robot image + rotation ring + D-pad */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1',
        borderRadius: 10, overflow: 'hidden',
        background: 'radial-gradient(circle at center, #f5f5f7 0%, #d9dade 80%, #bdbec4 100%)',
        border: '1px solid rgba(255,255,255,.08)' }}>
        {/* rotation ring (drag to rotate) */}
        <div ref={ringRef}
          onMouseDown={startDrag}
          style={{ position: 'absolute', inset: 6, borderRadius: '50%',
            border: `1.5px dashed ${dragging ? 'var(--accent)' : 'rgba(60,70,100,.45)'}`,
            cursor: locked ? 'not-allowed' : (dragging ? 'grabbing' : 'grab'),
            transition: 'border-color .15s',
            pointerEvents: locked ? 'none' : 'auto' }}/>
        {/* ticks */}
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 6, pointerEvents: 'none' }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const r1 = 48, r2 = i % 2 ? 45 : 42;
            const rad = (deg - 90) * Math.PI / 180;
            return <line key={deg} x1={50 + r1 * Math.cos(rad)} y1={50 + r1 * Math.sin(rad)}
              x2={50 + r2 * Math.cos(rad)} y2={50 + r2 * Math.sin(rad)}
              stroke="rgba(40,50,70,.4)" strokeWidth={i % 2 ? .4 : .8}/>;
          })}
        </svg>
        {/* heading indicator — points up */}
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 6, pointerEvents: 'none',
          transform: `rotate(${heading}deg)`, transition: dragging ? 'none' : 'transform .15s' }}>
          <path d="M50 3l4 8h-8z" fill="var(--accent)"/>
        </svg>
        {/* robot image — rotates with heading + translates by pos */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          transform: `translate(${pos.x}px, ${pos.y}px) rotate(${heading}deg)`,
          transition: dragging ? 'none' : 'transform .25s ease-out' }}>
          <img src={window.__resources?.assets_robot_topdown_png || (window.__resources?.assets_robot_topdown_png || "assets/robot-topdown.png")} alt="Robot"
            style={{ width: IMG_SIZE, height: IMG_SIZE, objectFit: 'contain',
              opacity: locked ? 0.5 : 1,
              filter: 'contrast(1.08) saturate(1.1) drop-shadow(0 4px 10px rgba(0,0,0,.25))',
              pointerEvents: 'none' }}/>
        </div>
        {/* D-pad — 4 arrows around the edges */}
        <Arrow dir="up"    rot={0}   style={{ top: 4,    left: '50%', transform: 'translateX(-50%)' }}/>
        <Arrow dir="down"  rot={180} style={{ bottom: 4, left: '50%', transform: 'translateX(-50%)' }}/>
        <Arrow dir="left"  rot={-90} style={{ left: 4,   top: '50%', transform: 'translateY(-50%)' }}/>
        <Arrow dir="right" rot={90}  style={{ right: 4,  top: '50%', transform: 'translateY(-50%)' }}/>
      </div>

      {/* Rotate buttons + stop */}
      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        <button onMouseDown={() => !locked && setHeading(h => h - 15)} disabled={locked}
          title="Rotate CCW"
          style={{ flex: 1, padding: '6px', borderRadius: 5,
            border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)',
            color: 'rgba(255,255,255,.85)', cursor: locked ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            opacity: locked ? 0.45 : 1 }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5a4.5 4.5 0 10-.5 4M11 2v3h-3"/></svg>
        </button>
        <button onMouseDown={() => { setPos({ x: 0, y: 0 }); setHeading(0); }}
          title="Stop / reset"
          style={{ flex: 1, padding: '6px', borderRadius: 5,
            border: '1px solid rgba(239,68,68,.35)', background: 'rgba(239,68,68,.12)',
            color: '#fca5a5', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1"/></svg>
        </button>
        <button onMouseDown={() => !locked && setHeading(h => h + 15)} disabled={locked}
          title="Rotate CW"
          style={{ flex: 1, padding: '6px', borderRadius: 5,
            border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)',
            color: 'rgba(255,255,255,.85)', cursor: locked ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            opacity: locked ? 0.45 : 1 }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5a4.5 4.5 0 11.5 4M3 2v3h3"/></svg>
        </button>
      </div>

      {/* Help line */}
      <div style={{ marginTop: 6, fontSize: 9.5, fontFamily: 'var(--mono)',
        color: 'rgba(255,255,255,.4)', textAlign: 'center', letterSpacing: .3 }}>
        WASD · drag ring · Q/E rotate
      </div>
      </>)}
    </div>
  );
}

// DriveTab — top-down robot image with directional D-pad overlay
function DriveTab() {
  const [pressed, setPressed] = React.useState(null);
  const [locked, setLocked] = React.useState(false);
  const [speed, setSpeed] = React.useState(0.5); // 0–1
  const [mode, setMode] = React.useState('translate'); // 'translate' | 'rotate'

  // Which arrow lights up based on robot orientation. The top-down image
  // has the robot facing RIGHT (arm/gripper at the top-left, wheels on sides).
  const dirs = mode === 'translate'
    ? { up: 'Forward', down: 'Reverse', left: 'Strafe L', right: 'Strafe R' }
    : { up: 'Pitch ↑', down: 'Pitch ↓', left: 'Rotate CCW', right: 'Rotate CW' };

  const press = (d) => { if (!locked) { setPressed(d); setTimeout(() => setPressed(null), 200); } };

  // keyboard
  React.useEffect(() => {
    const onKey = (e) => {
      if (locked) return;
      const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right' };
      const d = map[e.key];
      if (d) { e.preventDefault(); press(d); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked]);

  const DPadBtn = ({ dir, rot, d }) => {
    const on = pressed === dir;
    return (
      <button onMouseDown={() => press(dir)}
        disabled={locked}
        title={dirs[dir]}
        style={{ width: 44, height: 44, borderRadius: 10,
          border: `1px solid ${on ? 'var(--accent)' : 'rgba(255,255,255,.22)'}`,
          background: on ? 'var(--accent)' : 'rgba(14,16,20,.85)',
          backdropFilter: 'blur(6px)',
          color: '#fff', cursor: locked ? 'not-allowed' : 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: on ? '0 0 18px rgba(91,91,247,.7)' : '0 2px 10px rgba(0,0,0,.35)',
          transform: on ? 'scale(.94)' : 'scale(1)',
          transition: 'all .12s', opacity: locked ? 0.45 : 1,
          gridArea: dir }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: `rotate(${rot}deg)` }}><path d="M8 3v10M4 7l4-4 4 4"/></svg>
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(255,255,255,.06)',
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.45)',
            letterSpacing: 1.2, marginBottom: 2 }}>MANUAL DRIVE</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
            {locked ? 'Disabled · Flow active' : 'Ready · Direct control'}
          </div>
        </div>
        <span style={{ width: 7, height: 7, borderRadius: 4,
          background: locked ? '#f59e0b' : '#22c55e',
          boxShadow: `0 0 8px ${locked ? '#f59e0b' : '#22c55e'}` }}/>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 4, padding: '10px 14px 0', flexShrink: 0 }}>
        {[
          { v: 'translate', label: 'Translate', icon: 'M8 2v12M2 8h12M2 8l3-3M2 8l3 3M14 8l-3-3M14 8l-3 3M8 2l-3 3M8 2l3 3M8 14l-3-3M8 14l3-3' },
          { v: 'rotate', label: 'Rotate', icon: 'M12 5a5 5 0 10.5 4M12 2v3h-3' },
        ].map(m => (
          <button key={m.v} onClick={() => setMode(m.v)}
            style={{ flex: 1, padding: '6px 8px', borderRadius: 5,
              border: `1px solid ${mode === m.v ? 'var(--accent)' : 'rgba(255,255,255,.1)'}`,
              background: mode === m.v ? 'rgba(91,91,247,.18)' : 'rgba(255,255,255,.04)',
              color: mode === m.v ? '#c7d2fe' : 'rgba(255,255,255,.7)',
              fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={m.icon}/></svg>
            {m.label}
          </button>
        ))}
      </div>

      {/* Robot top-down + D-pad overlay */}
      <div style={{ padding: '14px 14px 0', flexShrink: 0 }}>
        <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,.08)',
          background: 'radial-gradient(circle at center, rgba(91,91,247,.06), transparent 60%), #0a0c11',
          aspectRatio: '1.5 / 1' }}>
          {/* robot image */}
          <img src={window.__resources?.assets_robot_topdown_png || (window.__resources?.assets_robot_topdown_png || "assets/robot-topdown.png")} alt="Robot top view"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'contain', opacity: locked ? 0.35 : 0.85,
              filter: 'drop-shadow(0 8px 22px rgba(91,91,247,.25))',
              transition: 'opacity .2s' }}/>
          {/* subtle grid + heading indicator */}
          <svg viewBox="0 0 300 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <pattern id="dg" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth=".5"/>
              </pattern>
            </defs>
            <rect width="300" height="200" fill="url(#dg)"/>
            {/* forward heading arrow (robot faces right) */}
            <g transform="translate(150,100)" opacity={pressed === 'up' ? 1 : 0.5}>
              <path d="M40 0l-8 -6v3h-20v6h20v3z" fill="var(--accent)"/>
            </g>
          </svg>
          {/* D-pad overlay — centered */}
          <div style={{ position: 'absolute', inset: 0, display: 'grid',
            gridTemplateAreas: '". up ." "left center right" ". down ."',
            gridTemplateColumns: '1fr 44px 1fr', gridTemplateRows: '1fr 44px 1fr',
            gap: 6, padding: 10, placeItems: 'center' }}>
            <DPadBtn dir="up" rot={0}/>
            <DPadBtn dir="left" rot={-90}/>
            {/* stop button center */}
            <button onMouseDown={() => press('center')}
              disabled={locked}
              title="Stop"
              style={{ gridArea: 'center', width: 44, height: 44, borderRadius: 22,
                border: `1px solid ${pressed === 'center' ? '#fca5a5' : 'rgba(255,255,255,.22)'}`,
                background: pressed === 'center' ? 'rgba(239,68,68,.35)' : 'rgba(14,16,20,.85)',
                backdropFilter: 'blur(6px)',
                color: '#fca5a5', cursor: locked ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,.35)', opacity: locked ? 0.45 : 1,
                transition: 'all .12s' }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1"/></svg>
            </button>
            <DPadBtn dir="right" rot={90}/>
            <DPadBtn dir="down" rot={180}/>
          </div>
        </div>
        {/* active direction readout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10,
          fontSize: 11, color: 'rgba(255,255,255,.7)' }}>
          <span className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,.4)', letterSpacing: 1 }}>ACTION</span>
          <span style={{ color: '#fff', fontWeight: 600, flex: 1 }}>
            {pressed ? (pressed === 'center' ? 'STOP' : dirs[pressed]) : '—'}
          </span>
          <span className="mono tnum" style={{ fontSize: 10.5, color: 'rgba(199,210,254,.85)' }}>
            {(speed * 0.8).toFixed(2)} m/s
          </span>
        </div>
      </div>

      {/* speed slider */}
      <div style={{ padding: '14px 14px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,.5)', letterSpacing: 1 }}>SPEED</span>
          <span className="mono tnum" style={{ fontSize: 10, color: '#fff' }}>{Math.round(speed * 100)}%</span>
        </div>
        <input type="range" min={0} max={1} step={0.05} value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }}/>
      </div>

      {/* secondary actions */}
      <div style={{ padding: '14px 14px 16px', flexShrink: 0, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={() => setLocked(!locked)}
          style={{ flex: 1, padding: '7px 10px', borderRadius: 5,
            border: `1px solid ${locked ? 'rgba(245,158,11,.45)' : 'rgba(255,255,255,.12)'}`,
            background: locked ? 'rgba(245,158,11,.15)' : 'rgba(255,255,255,.04)',
            color: locked ? '#fcd34d' : '#fff',
            fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {locked
              ? <path d="M4 7V4a3 3 0 016 0v3M3 7h8v6H3z"/>
              : <path d="M4 7V4a3 3 0 015.8-1M3 7h8v6H3z"/>}
          </svg>
          {locked ? 'Locked' : 'Lock'}
        </button>
        <button style={{ flex: 1, padding: '7px 10px', borderRadius: 5,
          border: '1px solid rgba(255,255,255,.12)',
          background: 'rgba(255,255,255,.04)', color: '#fff',
          fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 7a5 5 0 015-5v2M12 7a5 5 0 01-5 5v-2M3 4l-1-2M11 10l1 2"/></svg>
          Re-center
        </button>
      </div>

      {/* help */}
      <div style={{ margin: '0 14px 14px', padding: '8px 10px', borderRadius: 6,
        background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
        fontSize: 10.5, color: 'rgba(255,255,255,.55)', lineHeight: 1.5 }}>
        Use arrow keys or WASD to drive. Hold to jog.
      </div>
    </div>
  );
}

// SidebarCaptainsLog — same content, no drawer shell, fills sidebar height
function SidebarCaptainsLog() {
  const [entries, setEntries] = React.useState([
    { t: '14:08', author: OPERATOR, text: 'Starting café run. Corridor A looked clear.' },
    { t: '14:14', author: TEAM[1], text: 'Robot paused at the elevator; re-queued the call.' },
    { t: '14:19', author: OPERATOR, text: 'Spill at 3F hallway — re-planned. Dispatched facilities.' },
    { t: '14:26', author: TEAM[2], text: 'Confirmed delivery at Nurse Station. Photo attached.' },
  ]);
  const [draft, setDraft] = React.useState('');
  const add = () => {
    if (!draft.trim()) return;
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setEntries((e) => [...e, { t, author: OPERATOR, text: draft.trim() }]);
    setDraft('');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '10px 14px 6px', fontSize: 10, fontFamily: 'var(--mono)',
        color: 'rgba(255,255,255,.45)', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,.06)',
        display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'rgba(199,210,254,.85)', display: 'flex' }}>
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 1h8v12H3zM5 4h4M5 7h4M5 10h3"/></svg>
        </span>
        LOG · MORNING CAFÉ RUN
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {entries.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <span className="mono tnum" style={{ fontSize: 10, color: 'rgba(255,255,255,.4)',
                flexShrink: 0, width: 34, paddingTop: 2 }}>{e.t}</span>
              <Avatar p={e.author} size={18}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.55)', marginBottom: 2 }}>{e.author.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.92)', lineHeight: 1.45 }}>{e.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,.06)',
        display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        {/* quick-action chips — each adds a log entry */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { label: 'Open issue', tone: '#fca5a5', bg: 'rgba(248,113,113,.12)', border: 'rgba(248,113,113,.35)',
              icon: <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M7 1l6 11H1zM7 5v4M7 11v.01"/></svg>,
              text: 'Opened issue — needs attention.' },
            { label: 'Add note', tone: 'rgba(199,210,254,.9)', bg: 'rgba(91,91,247,.12)', border: 'rgba(91,91,247,.35)',
              icon: <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M2 2h7l3 3v7H2zM5 7h5M5 10h3"/></svg>,
              text: '' },
            { label: 'Replaced battery', tone: '#86efac', bg: 'rgba(34,197,94,.12)', border: 'rgba(34,197,94,.35)',
              icon: <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h9v6H2zM11 6h1v2h-1M4.5 5.5L6 7l2.5-3"/></svg>,
              text: 'Replaced battery pack — back to 100%.' },
          ].map((q) => (
            <button key={q.label}
              onClick={() => {
                if (q.text) {
                  const now = new Date();
                  const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
                  setEntries((e) => [...e, { t, author: OPERATOR, text: q.text }]);
                } else {
                  // Add note: focus input
                  const inp = document.querySelector('[data-log-input]');
                  if (inp) inp.focus();
                }
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 9px', border: `1px solid ${q.border}`, background: q.bg,
                color: q.tone, borderRadius: 999, fontSize: 10.5, fontWeight: 500,
                fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {q.icon}
              {q.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input data-log-input value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
            placeholder="Add log entry…"
            style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
              outline: 'none', color: '#fff', fontSize: 11.5, fontFamily: 'var(--sans)',
              padding: '7px 9px', borderRadius: 5 }}/>
          <button onClick={add} disabled={!draft.trim()}
            style={{ border: 'none', background: draft.trim() ? 'var(--accent)' : 'rgba(255,255,255,.08)',
              color: '#fff', padding: '0 14px', borderRadius: 5, fontSize: 11, fontWeight: 600,
              cursor: draft.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>Log</button>
        </div>
      </div>
    </div>
  );
}
function IssueReportDrawer({ onClose }) {
  const [title, setTitle] = React.useState('');
  const [severity, setSeverity] = React.useState('medium');
  const [desc, setDesc] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const SEV = [
    { v: 'low',    label: 'Low',    color: '#86efac' },
    { v: 'medium', label: 'Medium', color: '#fde68a' },
    { v: 'high',   label: 'High',   color: '#fca5a5' },
  ];
  if (submitted) {
    return (
      <DrawerShell title="Issue filed" onClose={onClose}
        icon={<svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#86efac" strokeWidth="1.6" strokeLinecap="round"><path d="M2 7l3 3 7-7"/></svg>}>
        <div style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 22, height: 22, borderRadius: 11, background: 'rgba(34,197,94,.2)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round"><path d="M2 7l3 3 7-7"/></svg>
          </span>
          <div style={{ fontSize: 12, color: '#fff' }}>
            <div style={{ fontWeight: 600 }}>INC-{Math.floor(Math.random() * 900 + 100)} filed</div>
            <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 10.5 }}>Assigned to field ops · you'll get updates here.</div>
          </div>
        </div>
      </DrawerShell>
    );
  }
  return (
    <DrawerShell title="Report an issue" onClose={onClose}
      icon={<svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#fdba74" strokeWidth="1.6" strokeLinecap="round"><path d="M7 1l6 11H1zM7 5v4M7 11v.01"/></svg>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="What's wrong? (e.g. Bumped into cart)"
          style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
            outline: 'none', color: '#fff', fontSize: 12, fontFamily: 'var(--sans)',
            padding: '7px 9px', borderRadius: 5 }}/>
        <div style={{ display: 'flex', gap: 4 }}>
          {SEV.map(s => (
            <button key={s.v} onClick={() => setSeverity(s.v)}
              style={{ flex: 1, padding: '5px 6px', borderRadius: 4,
                border: `1px solid ${severity === s.v ? s.color : 'rgba(255,255,255,.1)'}`,
                background: severity === s.v ? `${s.color}22` : 'rgba(255,255,255,.04)',
                color: severity === s.v ? s.color : 'rgba(255,255,255,.7)',
                fontSize: 10.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {s.label}
            </button>
          ))}
        </div>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)}
          placeholder="More detail… (optional)" rows={3}
          style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
            outline: 'none', color: '#fff', fontSize: 11.5, fontFamily: 'var(--sans)',
            padding: '7px 9px', borderRadius: 5, resize: 'none' }}/>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,.4)', letterSpacing: .5, flex: 1 }}>
            Attached: {ROBOT.id} · Floor 3 · Mission M-0421
          </span>
          <button onClick={() => title.trim() && setSubmitted(true)} disabled={!title.trim()}
            style={{ border: 'none', background: title.trim() ? 'var(--accent)' : 'rgba(255,255,255,.08)',
              color: '#fff', padding: '6px 14px', borderRadius: 5, fontSize: 11, fontWeight: 600,
              cursor: title.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>Submit</button>
        </div>
      </div>
    </DrawerShell>
  );
}

// Timeline — horizontal track with event dots; click a dot to tag people
function TimelineDrawer({ onClose }) {
  const [events, setEvents] = React.useState(MISSION_EVENTS_INIT);
  const [selected, setSelected] = React.useState(null); // event id
  const [hide, setHide] = React.useState({}); // { eventId: true }  => hidden
  const elapsed = 18; // mission duration in min (for axis length)
  const now = 15;     // current time head
  const trackW = 316; // full track width in px
  const xFor = (t) => (t / elapsed) * trackW;

  const selectedEv = events.find(e => e.id === selected);
  const toggleTag = (evId, personId) => {
    setEvents((arr) => arr.map(e => e.id !== evId ? e : ({
      ...e, tags: e.tags.includes(personId) ? e.tags.filter(t => t !== personId) : [...e.tags, personId]
    })));
  };
  const toggleHide = (evId) => setHide((h) => ({ ...h, [evId]: !h[evId] }));
  const kindColor = { start: '#86efac', nav: '#93c5fd', pick: '#c7d2fe', alert: '#fca5a5' };

  return (
    <DrawerShell title="Mission Timeline" onClose={onClose} maxH={320}
      icon={<svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M1 7h12M4 4v6M10 4v6M7 2v10"/></svg>}>
      {/* track */}
      <div style={{ position: 'relative', height: 72, marginBottom: 10, marginTop: 6 }}>
        {/* axis */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 34, height: 2, background: 'rgba(255,255,255,.08)', borderRadius: 2 }}/>
        <div style={{ position: 'absolute', left: 0, width: xFor(now), top: 34, height: 2,
          background: 'var(--accent)', boxShadow: '0 0 6px rgba(91,91,247,.7)', borderRadius: 2 }}/>
        {/* axis ticks */}
        {[0, 5, 10, 15].map(t => (
          <div key={t} style={{ position: 'absolute', left: xFor(t), top: 34, width: 1, height: 5,
            background: 'rgba(255,255,255,.15)' }}>
            <span className="mono" style={{ position: 'absolute', top: 8, left: -6, fontSize: 9,
              color: 'rgba(255,255,255,.4)', whiteSpace: 'nowrap' }}>{t}m</span>
          </div>
        ))}
        {/* now marker */}
        <div style={{ position: 'absolute', left: xFor(now) - 1, top: 22, width: 2, height: 26,
          background: 'var(--accent)' }}/>
        <span className="mono" style={{ position: 'absolute', left: xFor(now) - 14, top: 2,
          fontSize: 9, color: 'var(--accent)', letterSpacing: .5, fontWeight: 600 }}>NOW</span>
        {/* event dots */}
        {events.map(e => {
          const hidden = hide[e.id];
          const x = xFor(e.t);
          const isSel = selected === e.id;
          return (
            <div key={e.id}
              onClick={() => setSelected(isSel ? null : e.id)}
              style={{ position: 'absolute', left: x - 7, top: 28, cursor: 'pointer',
                opacity: hidden ? 0.3 : 1 }}>
              <div style={{ width: 14, height: 14, borderRadius: 7,
                background: isSel ? kindColor[e.kind] : 'rgba(18,20,26,.9)',
                border: `2px solid ${kindColor[e.kind]}`,
                boxShadow: isSel ? `0 0 8px ${kindColor[e.kind]}` : 'none',
                transition: 'all .15s' }}/>
              {e.tags.length > 0 && (
                <div style={{ position: 'absolute', top: -14, left: 12 }}>
                  <AvatarStack size={14} people={e.tags.map(id => TEAM.find(p => p.id === id)).filter(Boolean)}/>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* selected event detail + tag picker */}
      {selectedEv ? (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 6, padding: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: kindColor[selectedEv.kind] }}/>
            <span className="mono tnum" style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>t+{selectedEv.t}m</span>
            <span style={{ fontSize: 12, color: '#fff', fontWeight: 500, flex: 1 }}>{selectedEv.label}</span>
            <button onClick={() => toggleHide(selectedEv.id)} title={hide[selectedEv.id] ? 'Show' : 'Hide'}
              style={{ border: 'none', background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.7)',
                padding: '3px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
              {hide[selectedEv.id] ? 'Show' : 'Hide'}
            </button>
          </div>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.45)',
            letterSpacing: .5, marginBottom: 6 }}>TAG SOMEONE</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {TEAM.map(p => {
              const on = selectedEv.tags.includes(p.id);
              return (
                <button key={p.id} onClick={() => toggleTag(selectedEv.id, p.id)}
                  style={{ border: `1px solid ${on ? p.color : 'rgba(255,255,255,.1)'}`,
                    background: on ? `${p.color}22` : 'rgba(255,255,255,.03)',
                    color: on ? '#fff' : 'rgba(255,255,255,.75)',
                    padding: '3px 8px 3px 3px', borderRadius: 12,
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 10.5, fontFamily: 'inherit', cursor: 'pointer' }}>
                  <Avatar p={p} size={16}/>
                  {p.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.45)', fontStyle: 'italic',
          padding: '6px 2px', textAlign: 'center' }}>
          Click any event to tag people or hide it
        </div>
      )}

      {/* events list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {events.map(e => {
          const hidden = hide[e.id];
          return (
            <div key={e.id} onClick={() => setSelected(e.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
                borderRadius: 4, cursor: 'pointer',
                background: selected === e.id ? 'rgba(91,91,247,.12)' : 'transparent',
                opacity: hidden ? 0.45 : 1 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: kindColor[e.kind] }}/>
              <span className="mono tnum" style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', width: 30 }}>t+{e.t}m</span>
              <span style={{ fontSize: 11, color: hidden ? 'rgba(255,255,255,.4)' : '#fff',
                flex: 1, textDecoration: hidden ? 'line-through' : 'none' }}>{e.label}</span>
              {e.tags.length > 0 && <AvatarStack size={14} people={e.tags.map(id => TEAM.find(p => p.id === id)).filter(Boolean)}/>}
            </div>
          );
        })}
      </div>
    </DrawerShell>
  );
}

// ═══ LAYOUT B — Cinema ════════════════════════════════════════
// Camera full-bleed. Chat is a right sidebar that opens/closes.
// Time top-right. Bottom-center shows 3 ops actions (not a log).
// AbortTakeoverBanner — appears across the camera view when the operator
// aborts the running flow. Hands off control with agent-voice copy that
// instructs the operator to drive manually.
function AbortTakeoverBanner({ robotId, flowName, onResume, rightEdge = 0 }) {
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  return (
    <div style={{ position: 'absolute', top: 56, left: 12, right: rightEdge + 12, zIndex: 40,
      transition: 'right .22s ease' }}>
      <div style={{
        display: 'flex', alignItems: 'stretch', gap: 0,
        background: 'linear-gradient(180deg, rgba(220,38,38,.96) 0%, rgba(185,28,28,.96) 100%)',
        border: '1px solid rgba(255,255,255,.18)',
        borderRadius: 10,
        boxShadow: '0 12px 32px rgba(220,38,38,.35), 0 0 0 1px rgba(220,38,38,.4)',
        overflow: 'hidden',
        animation: 'abortBannerIn .28s cubic-bezier(.2,.9,.3,1)',
      }}>
        {/* Pulsing accent strip */}
        <div style={{ width: 4, background: '#fff', opacity: .85,
          animation: 'abortPulse 1.6s ease-in-out infinite' }}/>
        {/* Hazard icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 14px 0 16px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8,
            background: 'rgba(255,255,255,.16)', border: '1px solid rgba(255,255,255,.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.3 3.86a2 2 0 013.4 0l8.5 14.14A2 2 0 0120.5 21h-17a2 2 0 01-1.7-3L10.3 3.86z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
        </div>
        {/* Copy block */}
        <div style={{ flex: 1, padding: '10px 14px 10px 0', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span className="mono" style={{ fontSize: 9.5, letterSpacing: 1.4, color: '#fff', opacity: .9,
              padding: '2px 6px', background: 'rgba(0,0,0,.22)', borderRadius: 3 }}>
              FLOW STOPPED
            </span>
            <span className="mono" style={{ fontSize: 10, color: '#fff', opacity: .8, letterSpacing: .5 }}>
              {robotId}
            </span>
            <span style={{ fontSize: 10, color: '#fff', opacity: .55 }}>·</span>
            <span className="mono" style={{ fontSize: 10, color: '#fff', opacity: .8, letterSpacing: .5 }}>
              {flowName}
            </span>
            <span style={{ flex: 1 }}/>
            <span className="mono" style={{ fontSize: 10, color: '#fff', opacity: .8, letterSpacing: .8 }}>
              MANUAL · {mm}:{ss}
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', lineHeight: 1.35,
            letterSpacing: -.1 }}>
            You're driving {robotId} now. Take the wheel — flow is paused, joints are unlocked.
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.85)', marginTop: 3, lineHeight: 1.4 }}>
            Use the joystick or arrow keys to move. When you're done, hand back to autonomy and I'll
            re-plan from this position.
          </div>
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
          borderLeft: '1px solid rgba(255,255,255,.18)' }}>
          <button onClick={onResume}
            style={{ all: 'unset', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              color: '#7f1d1d', background: '#fff', padding: '8px 14px', borderRadius: 6,
              letterSpacing: -.1,
              boxShadow: '0 2px 8px rgba(0,0,0,.18)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>
            Hand back to autonomy
          </button>
        </div>
      </div>
      <style>{`
        @keyframes abortBannerIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes abortPulse {
          0%, 100% { opacity: .55; }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// FleetTopNav — full-width top navigation with a tab per Billie.
// Selected tab is white text w/ accent underline; others dim; status dot per tab.
function FleetTopNav({ fleet, selectedId, onSelect, currentRoom, rightEdge = 0 }) {
  const dotFor = (s) => s === 'active' ? '#22c55e' : s === 'charging' ? '#fbbf24' : 'rgba(255,255,255,.4)';
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: rightEdge, height: 44,
      display: 'flex', alignItems: 'stretch',
      background: 'linear-gradient(180deg, rgba(10,11,14,.92) 0%, rgba(10,11,14,.78) 100%)',
      borderBottom: '1px solid rgba(255,255,255,.06)',
      backdropFilter: 'blur(18px)',
      zIndex: 30,
      transition: 'right .22s ease',
      paddingLeft: 14, paddingRight: 14 }}>
      {/* billie tabs */}
      <div style={{ display: 'flex', alignItems: 'stretch', flex: 1, minWidth: 0, gap: 0 }}>
        {fleet.map(b => {
          const on = b.id === selectedId;
          const n = b.name.split('-')[1];
          return (
            <button key={b.id} onClick={() => onSelect(b.id)} title={b.location}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer',
                padding: '0 16px', display: 'inline-flex', alignItems: 'center', gap: 8,
                position: 'relative', fontFamily: 'inherit',
                color: on ? '#fff' : 'rgba(255,255,255,.6)',
                fontSize: 12.5, fontWeight: on ? 700 : 500, letterSpacing: .2,
                transition: 'color .15s' }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.color = 'rgba(255,255,255,.95)'; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.color = 'rgba(255,255,255,.6)'; }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: dotFor(b.status),
                boxShadow: b.status === 'active' ? `0 0 5px ${dotFor(b.status)}` : 'none' }}/>
              <span>Billie {n}</span>
              {/* active underline */}
              <span style={{ position: 'absolute', left: 10, right: 10, bottom: 0, height: 2,
                background: on ? 'var(--accent)' : 'transparent',
                borderRadius: '2px 2px 0 0',
                boxShadow: on ? '0 0 8px rgba(91,91,247,.7)' : 'none',
                transition: 'background .15s' }}/>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// FleetSwitcher — compact dropdown: selected billie as the trigger, full fleet
// in a dropdown menu. Scales to any roster size.
function FleetSwitcher({ fleet, selectedId, onSelect, currentRoom, selected }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const dotFor = (s) => s === 'active' ? '#22c55e' : s === 'charging' ? '#fbbf24' : 'rgba(255,255,255,.4)';
  const activeCount = fleet.filter(f => f.status === 'active').length;

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'rgba(14,16,20,.75)', border: '1px solid rgba(255,255,255,.08)',
          backdropFilter: 'blur(14px)', borderRadius: 8, padding: '7px 10px 7px 8px',
          cursor: 'pointer', fontFamily: 'inherit', color: '#fff',
          boxShadow: '0 8px 24px rgba(0,0,0,.3)',
          transition: 'background .15s' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(22,25,32,.9)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(14,16,20,.75)'}>
        <div style={{ width: 24, height: 24, borderRadius: 5, background: 'var(--accent)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="5" y="7" width="14" height="10" rx="2"/><circle cx="9" cy="12" r="1" fill="#fff"/><circle cx="15" cy="12" r="1" fill="#fff"/><path d="M12 3v4M8 20h8"/></svg>
        </div>
        <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>{selected.name}</span>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: dotFor(selected.status),
              boxShadow: selected.status === 'active' ? `0 0 5px ${dotFor(selected.status)}` : 'none' }}/>
          </div>
          <div className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,.55)',
            letterSpacing: .5, marginTop: 1 }}>
            FLEET · {activeCount}/{fleet.length} ACTIVE
          </div>
        </div>
        {currentRoom && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff',
            background: 'var(--accent)', padding: '3px 8px', borderRadius: 4,
            letterSpacing: .2, boxShadow: '0 0 10px rgba(91,91,247,.35)' }}>{currentRoom}</span>
        )}
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,.5)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}><path d="M3 4.5l3 3 3-3"/></svg>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          minWidth: 260,
          background: 'rgba(16,18,24,.96)', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 8, backdropFilter: 'blur(18px)',
          boxShadow: '0 18px 48px rgba(0,0,0,.6)', overflow: 'hidden', zIndex: 40 }}>
          <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid rgba(255,255,255,.06)',
            fontSize: 9.5, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.5)',
            letterSpacing: 1.2 }}>FLEET</div>
          {fleet.map(b => {
            const on = b.id === selectedId;
            return (
              <button key={b.id} onClick={() => { onSelect(b.id); setOpen(false); }}
                style={{ width: '100%', border: 'none', cursor: 'pointer',
                  background: on ? 'rgba(91,91,247,.22)' : 'transparent',
                  padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 10,
                  fontFamily: 'inherit', color: '#fff', textAlign: 'left',
                  borderLeft: `3px solid ${on ? 'var(--accent)' : 'transparent'}`,
                  transition: 'background .12s' }}
                onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'rgba(255,255,255,.05)'; }}
                onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ width: 7, height: 7, borderRadius: 4, background: dotFor(b.status),
                  boxShadow: b.status === 'active' ? `0 0 6px ${dotFor(b.status)}` : 'none', flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
                  <div style={{ fontSize: 12.5, fontWeight: on ? 700 : 500 }}>{b.name}</div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,.5)',
                    letterSpacing: .3, marginTop: 1 }}>
                    {b.location.toUpperCase()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                  <div style={{ position: 'relative', width: 18, height: 9,
                    border: '1px solid rgba(255,255,255,.5)', borderRadius: 2 }}>
                    <div style={{ position: 'absolute', top: 1, left: 1, bottom: 1,
                      width: `${Math.max(2, (b.battery / 100) * 14)}px`,
                      background: b.battery > 50 ? '#22c55e' : b.battery > 20 ? '#fbbf24' : '#ef4444',
                      borderRadius: 1 }}/>
                    <div style={{ position: 'absolute', top: 2, right: -3, width: 2, height: 3,
                      background: 'rgba(255,255,255,.5)', borderRadius: '0 1px 1px 0' }}/>
                  </div>
                  <span className="mono tnum" style={{ fontSize: 10.5, color: 'rgba(255,255,255,.75)' }}>{b.battery}%</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// App shell — outer product navigation above the Operator Console.
// ═══════════════════════════════════════════════════════════════
const APP_TABS = [
  { id: 'home',       label: 'Home' },
  { id: 'fleet',      label: 'Live View' },
  { id: 'alerts',     label: 'Open Alerts' },
  { id: 'dispatcher', label: 'Dispatcher' },
  { id: 'operator',   label: 'Operator Console', active: true },
  { id: 'reports',    label: 'Customers Reports' },
  { id: 'rooms',      label: 'Rooms App' },
  { id: 'robots',     label: 'Robots Management' },
  { id: 'brain',      label: 'AI Brain' },
  { id: 'analytics',  label: 'Analytics' },
  { id: 'log',        label: 'Activity Log' },
];

function AppShell({ children }) {
  const [tab, setTab] = React.useState(() => {
    try { return localStorage.getItem('bb_tab') || 'home'; } catch { return 'home'; }
  });
  React.useEffect(() => { try { localStorage.setItem('bb_tab', tab); } catch {} }, [tab]);
  React.useEffect(() => {
    const h = (e) => { if (e.detail && e.detail.tab) setTab(e.detail.tab); };
    window.addEventListener('app:navigate', h);
    return () => window.removeEventListener('app:navigate', h);
  }, []);
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#fbfbfa' }}>
      {/* product nav */}
      <div style={{ height: 48, flexShrink: 0, display: 'flex', alignItems: 'stretch',
        background: '#ffffff',
        borderBottom: '1px solid var(--border)',
        paddingLeft: 14, paddingRight: 14 }}>
        {/* brand / org */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 16, marginRight: 10,
          borderRight: '1px solid var(--border)' }}>
          <img src={window.__resources?.assets_billie_logo_png || (window.__resources?.assets_billie_logo_png || "assets/billie-logo.png")} alt="Billie"
            onError={(e) => { e.currentTarget.src = (window.__resources?.assets_billie_logo_white_png || "assets/billie-logo-white.png"); e.currentTarget.style.filter = 'invert(1)'; }}
            style={{ height: 20, width: 'auto', display: 'block' }}/>
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', alignItems: 'stretch', flex: 1, minWidth: 0, overflowX: 'auto' }}>
          {APP_TABS.map(t => {
            const on = t.id === tab;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer',
                  padding: '0 14px', display: 'inline-flex', alignItems: 'center',
                  fontFamily: 'inherit', whiteSpace: 'nowrap',
                  color: on ? 'var(--ink)' : 'var(--ink-3)',
                  fontSize: 13, fontWeight: on ? 600 : 500, letterSpacing: -.005,
                  position: 'relative', transition: 'color .12s' }}
                onMouseEnter={(e) => { if (!on) e.currentTarget.style.color = 'var(--ink-1)'; }}
                onMouseLeave={(e) => { if (!on) e.currentTarget.style.color = 'var(--ink-3)'; }}>
                {t.label}
                {t.comingSoon && (
                  <span className="mono" style={{ marginLeft: 6, fontSize: 8.5, fontWeight: 600,
                    letterSpacing: .6, padding: '2px 5px', borderRadius: 3,
                    background: 'rgba(91,91,247,.10)', color: 'var(--accent-ink, #4141e0)',
                    textTransform: 'uppercase' }}>
                    Soon
                  </span>
                )}
                <span style={{ position: 'absolute', left: 10, right: 10, bottom: -1, height: 2,
                  background: on ? 'var(--ink)' : 'transparent',
                  borderRadius: '2px 2px 0 0' }}/>
              </button>
            );
          })}
        </div>

        {/* right: user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 14,
          borderLeft: '1px solid var(--border)' }}>
          <button style={{ border: 'none', background: 'transparent', cursor: 'pointer',
            color: 'var(--ink-3)', padding: 4, display: 'inline-flex', alignItems: 'center' }}
            title="Search">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="7" cy="7" r="4.5"/><path d="M13 13l-2.5-2.5" strokeLinecap="round"/></svg>
          </button>
          <button style={{ border: 'none', background: 'transparent', cursor: 'pointer',
            color: 'var(--ink-3)', padding: 4, display: 'inline-flex', alignItems: 'center', position: 'relative' }}
            title="Alerts">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6a5 5 0 0110 0v3l1.5 2h-13L3 9V6z"/><path d="M6 12a2 2 0 004 0"/></svg>
            <span style={{ position: 'absolute', top: 3, right: 2, width: 6, height: 6, borderRadius: 3,
              background: '#ef4444' }}/>
          </button>
          <div style={{ width: 26, height: 26, borderRadius: 13,
            background: 'linear-gradient(135deg, #5b5bf7, #a78bfa)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, color: '#fff' }} title="Tal">TL</div>
        </div>
      </div>

      {/* content — active tab renders operator console; others placeholder */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {tab === 'operator' ? children
          : tab === 'dispatcher' ? <DispatcherView/>
          : tab === 'home' ? <HomeView goto={setTab}/>
          : tab === 'fleet' ? <FleetView goto={setTab}/>
          : tab === 'alerts' ? <AlertsView goto={setTab}/>
          : tab === 'rooms' ? <RoomsApp goto={setTab}/>
          : tab === 'robots' ? <RobotsApp goto={setTab}/>
          : tab === 'reports' ? <ReportsView goto={setTab}/>
          : tab === 'log' ? <ActivityLog/>
          : tab === 'brain' ? <BrainView goto={setTab}/>
          : tab === 'analytics' ? <AnalyticsView/>
          : <AppPlaceholder tab={APP_TABS.find(t => t.id === tab)}/>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FleetView — live camera wall, one tile per Billie per active cam.
// ═══════════════════════════════════════════════════════════════
const FLEET_FEEDS = [
  { id: 'F1', billie: 'BILLIE-08', cam: 'fwd',     room: 'rm 1216 · Rome',     time: '08:40', state: 'live',    site: 'Marriott Rome',     step: 'Bed · duvet replace',   pct: 72, accent: '#fbbf24', photo: (window.__resources?.assets_flag_remote_control_png || "assets/flag-remote-control.png") },
  { id: 'F2', billie: 'BILLIE-12', cam: 'fwd',     room: 'rm 1210 · Rome',     time: '04:12', state: 'live',    site: 'Marriott Rome',     step: 'Bathroom · towel fold', pct: 32, accent: '#fbbf24', photo: (window.__resources?.assets_flag_towels_png || "assets/flag-towels.png") },
  { id: 'F3', billie: 'BILLIE-03', cam: 'fwd',     room: 'rm 322 · Berlin',    time: '11:24', state: 'live',    site: 'Hilton Berlin',     step: 'Mini-bar · restock',    pct: 48, accent: '#fbbf24', photo: (window.__resources?.assets_flag_white_curtain_png || "assets/flag-white-curtain.png") },
  { id: 'F4', billie: 'BILLIE-17', cam: '—',       room: 'service',            time: '—',     state: 'offline', site: 'Marriott Rome',     step: 'maintenance',           pct: 0,  accent: '#525252', photo: (window.__resources?.assets_flag_door_png || "assets/flag-door.png") },
  { id: 'F5', billie: 'BILLIE-08', cam: 'arm',     room: 'rm 1216 · arm cam',  time: '08:40', state: 'live',    site: 'Marriott Rome',     step: 'grip · towel',          pct: 72, accent: '#fbbf24', photo: (window.__resources?.assets_flag_wardrobe_png || "assets/flag-wardrobe.png") },
  { id: 'F6', billie: 'BILLIE-12', cam: 'arm',     room: 'rm 1210 · arm cam',  time: '04:12', state: 'live',    site: 'Marriott Rome',     step: 'cabinet · mini-bar',    pct: 32, accent: '#fbbf24', photo: (window.__resources?.assets_flag_door_png || "assets/flag-door.png") },
  { id: 'F7', billie: 'BILLIE-21', cam: 'fwd',     room: 'rm 508 · Brussels',  time: '02:06', state: 'live',    site: 'Cardo Brussels',    step: 'Approaching 508',       pct: 12, accent: '#fbbf24', photo: (window.__resources?.assets_flag_white_curtain_png || "assets/flag-white-curtain.png") },
  { id: 'F8', billie: 'BILLIE-14', cam: '—',       room: 'dock · charging',    time: '—',     state: 'offline', site: 'Hilton Berlin',     step: 'battery 41% → 100%',    pct: 0,  accent: '#525252', photo: (window.__resources?.assets_flag_wardrobe_png || "assets/flag-wardrobe.png") },
  { id: 'F9', billie: 'BILLIE-05', cam: 'fwd',     room: 'rm 214 · Potsdam',   time: '06:18', state: 'live',    site: 'Seminaris Potsdam', step: 'Checkout · deep clean', pct: 54, accent: '#fbbf24', photo: (window.__resources?.assets_flag_remote_control_png || "assets/flag-remote-control.png") },
];

function FleetView({ goto }) {
  const [siteFilter, setSiteFilter] = React.useState('All sites');
  const [density, setDensity] = React.useState(3); // cols
  const [focus, setFocus] = React.useState(null);
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1200);
    return () => clearInterval(id);
  }, []);
  const sites = ['All sites', ...new Set(FLEET_FEEDS.map(f => f.site))];
  const feeds = siteFilter === 'All sites' ? FLEET_FEEDS : FLEET_FEEDS.filter(f => f.site === siteFilter);
  const liveCount = feeds.filter(f => f.state === 'live').length;
  const now = new Date();
  const clock = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden',
      background: '#fbfbfa', color: '#17171a', fontFamily: 'Inter, var(--sans)',
      display: 'flex', flexDirection: 'row' }}>
      {/* main column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      {/* top utility bar removed — density + clock now live in the title row */}

      {/* hotel filter chips moved into the content area, under the H1 title */}

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '22px 40px 40px' }}>
        {/* title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 36,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 700,
              letterSpacing: -.6, color: '#17171a' }}>Live view</h1>
            <div style={{ fontSize: 13, color: 'rgba(24,24,27,.52)', marginTop: 4,
              fontStyle: 'normal', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Streaming feeds from every active Billie · click to take over
            </div>
          </div>
          {/* live counter pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 8,
              background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)' }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: '#ef4444',
                boxShadow: '0 0 8px #ef4444', animation: 'billPulse 1.4s ease-in-out infinite' }}/>
              <span className="mono tnum" style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5', letterSpacing: .4 }}>
                {liveCount} LIVE
              </span>
            </div>
            <div className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.35)', letterSpacing: .8 }}>
              {feeds.length - liveCount} OFFLINE
            </div>
            <button onClick={() => setDensity(d => d === 3 ? 2 : d === 2 ? 4 : 3)}
              style={{ all: 'unset', cursor: 'pointer',
                padding: '8px 14px', borderRadius: 8, fontSize: 11.5, fontWeight: 600,
                color: 'rgba(24,24,27,.72)',
                border: '1px solid rgba(24,24,27,.09)',
                background: 'rgba(24,24,27,.035)' }}>
              ▦ {density} cols
            </button>
            <span className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.48)', letterSpacing: .8 }}>
              Today · {clock}
            </span>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed rgba(24,24,27,.09)', marginBottom: 20 }}/>

        {/* hotel filter chips — under the title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          marginBottom: 20 }}>
          <span className="mono" style={{ fontSize: 9.5, letterSpacing: 1.2,
            color: 'rgba(24,24,27,.4)', marginRight: 4 }}>PROPERTY</span>
          {sites.map(s => {
            const on = siteFilter === s;
            const count = s === 'All sites'
              ? FLEET_FEEDS.length
              : FLEET_FEEDS.filter(f => f.site === s).length;
            const liveN = s === 'All sites'
              ? FLEET_FEEDS.filter(f => f.state === 'live').length
              : FLEET_FEEDS.filter(f => f.site === s && f.state === 'live').length;
            const flag = s === 'All sites' ? null
              : ({ 'Marriott Rome': '🇮🇹', 'Hilton Berlin': '🇩🇪',
                   'Cardo Brussels': '🇧🇪', 'Seminaris Potsdam': '🇩🇪' })[s];
            return (
              <button key={s} onClick={() => setSiteFilter(s)}
                style={{ all: 'unset', cursor: 'pointer',
                  padding: '6px 12px', borderRadius: 999,
                  fontSize: 12, fontWeight: on ? 600 : 500,
                  color: on ? '#fff' : 'rgba(24,24,27,.72)',
                  background: on ? '#17171a' : '#ffffff',
                  border: `1px solid ${on ? '#17171a' : 'rgba(24,24,27,.09)'}`,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  transition: 'background .12s, color .12s, border-color .12s' }}>
                {flag && <span style={{ fontSize: 12 }}>{flag}</span>}
                <span>{s}</span>
                <span className="mono tnum" style={{ fontSize: 10,
                  color: on ? 'rgba(255,255,255,.55)' : 'rgba(24,24,27,.42)',
                  fontWeight: 500 }}>
                  {liveN}/{count}
                </span>
              </button>
            );
          })}
        </div>

        {/* grid */}
        <div style={{ display: 'grid',
          gridTemplateColumns: `repeat(${density}, 1fr)`, gap: 16 }}>
          {feeds.map((f, i) => (
            <FleetTile key={f.id} feed={f} tick={tick} idx={i} onOpen={() => setFocus(f)}/>
          ))}
        </div>
      </div>

      {focus && <FleetFocus feed={focus} onClose={() => setFocus(null)} goto={goto}/>}
      </div>
      {/* agent sidebar */}
      <FleetAgentPanel goto={goto}/>
    </div>
  );
}

function FleetTile({ feed, tick, idx, onOpen }) {
  const isLive = feed.state === 'live';
  // Robots with open alerts (matches TRIAGE_ALERTS in Billie Boss panel) → tile is highlighted red.
  const ALERTED = { 'BILLIE-08': 'high', 'BILLIE-14': 'high', 'BILLIE-22': 'med', 'BILLIE-21': 'med', 'BILLIE-19': 'low', 'BILLIE-11': 'low' };
  const ALERT_LABELS = {
    'BILLIE-08': "Door won't open",
    'BILLIE-14': 'Sensor recal needed',
    'BILLIE-22': 'Battery low · 18%',
    'BILLIE-21': 'Lift wait > 90s',
    'BILLIE-19': 'Trash bin full',
    'BILLIE-11': 'Guest unconfirmed',
  };
  const alertSev = ALERTED[feed.billie];
  const alertLabel = ALERT_LABELS[feed.billie];
  const ALERT_TONE = {
    high: { tone: '#ef4444', soft: 'rgba(239,68,68,.18)', glow: 'rgba(239,68,68,.35)', label: 'HIGH' },
    med:  { tone: '#f59e0b', soft: 'rgba(245,158,11,.2)',  glow: 'rgba(245,158,11,.3)',  label: 'MED'  },
    low:  { tone: '#a3a3a3', soft: 'rgba(24,24,27,.12)',   glow: 'rgba(24,24,27,.15)',   label: 'LOW'  },
  }[alertSev];
  // scroll the "feed" image horizontally to fake motion
  const offset = isLive ? ((tick * 3 + idx * 17) % 100) : 0;
  // different gradient scenes per cam type
  const SCENES = {
    live:    ['linear-gradient(120deg, #3b2e26 0%, #6b5043 45%, #c9a588 100%)',
              'linear-gradient(135deg, #2b3a4a 0%, #3e5266 50%, #7b98b0 100%)',
              'linear-gradient(125deg, #4c3a2e 0%, #7a5c46 50%, #c9a074 100%)',
              'linear-gradient(140deg, #34282a 0%, #5b3f45 50%, #a27486 100%)'],
    offline: ['linear-gradient(135deg, #1a1a1d 0%, #2a2a2d 60%, #3a3a3d 100%)'],
  };
  const scene = isLive ? SCENES.live[idx % SCENES.live.length] : SCENES.offline[0];

  return (
    <div style={{ background: '#ffffff',
      border: alertSev ? `1px solid ${ALERT_TONE.tone}` : isLive ? '1px solid rgba(251,191,36,.2)' : '1px solid rgba(24,24,27,.06)',
      boxShadow: alertSev ? `0 0 0 3px ${ALERT_TONE.soft}, 0 4px 14px ${ALERT_TONE.glow}` : 'none',
      borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'border-color .15s, transform .15s, box-shadow .15s',
      position: 'relative' }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      {alertSev && (
        <div style={{ position: 'absolute', top: -1, left: -1, right: -1, height: 26,
          background: `linear-gradient(180deg, ${ALERT_TONE.tone} 0%, ${ALERT_TONE.tone} 60%, transparent 100%)`,
          opacity: alertSev === 'high' ? .9 : .75,
          zIndex: 4, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 10px', color: '#fff' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 10.5, fontWeight: 700, letterSpacing: .3,
            textShadow: '0 1px 2px rgba(0,0,0,.25)' }}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1.5L.8 12.5h12.4L7 1.5z"/><path d="M7 5.5v3.2M7 10.3v.01"/>
            </svg>
            ALERT · {alertLabel}
          </span>
          <span className="mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: .8,
            padding: '1px 6px', borderRadius: 3,
            background: 'rgba(255,255,255,.22)',
            border: '1px solid rgba(255,255,255,.35)' }}>
            {ALERT_TONE.label}
          </span>
        </div>
      )}
      {/* feed */}
      <div style={{ position: 'relative', aspectRatio: '16/10',
        background: feed.photo ? '#fbfbfa' : scene, overflow: 'hidden',
        cursor: isLive ? 'pointer' : 'default' }}
        onClick={isLive ? onOpen : undefined}>
        {/* photo fill */}
        {feed.photo && (
          <div style={{ position: 'absolute', inset: 0,
            backgroundImage: `url(${feed.photo})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: isLive ? 'none' : 'grayscale(.6) brightness(.55)' }}/>
        )}
        {/* scan lines + vignette */}
        <div style={{ position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.08) 0px, rgba(0,0,0,.08) 1px, transparent 1px, transparent 3px)',
          pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,.45) 100%)',
          pointerEvents: 'none' }}/>
        {/* motion hint — a thin bright line that sweeps horizontally when live */}
        {isLive && (
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: 2,
            left: `${offset}%`,
            background: 'linear-gradient(180deg, transparent, rgba(24,24,27,.18), transparent)',
            pointerEvents: 'none' }}/>
        )}

        {/* tile title strip — flag + city + billie */}
        {(() => {
          const CITY_FLAGS = { Rome: '🇮🇹', Berlin: '🇩🇪', Brussels: '🇧🇪', Potsdam: '🇩🇪', Paris: '🇫🇷', Tokyo: '🇯🇵' };
          // derive city from feed.room (e.g. "rm 1216 · Rome") or feed.site
          let city = '';
          const parts = (feed.room || '').split('·').map(s => s.trim());
          if (parts.length > 1) city = parts[parts.length - 1];
          if (!city || /arm cam|service|dock|charging/i.test(city)) {
            const siteParts = (feed.site || '').split(' ');
            city = siteParts[siteParts.length - 1];
          }
          const flag = CITY_FLAGS[city] || '📍';
          const billieShort = (feed.billie || '').replace('BILLIE-', 'Billie ');
          return (
            <div style={{ position: 'absolute', top: alertSev ? 32 : 10, left: 12,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 9px', borderRadius: 999,
              background: 'rgba(10,10,12,.72)', border: '1px solid rgba(24,24,27,.08)',
              backdropFilter: 'blur(8px)',
              maxWidth: 'calc(100% - 90px)' }}>
              <span style={{ fontSize: 12, lineHeight: 1 }}>{flag}</span>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#ffffff',
                letterSpacing: .2, whiteSpace: 'nowrap' }}>
                {city}
              </span>
              <span style={{ width: 3, height: 3, borderRadius: 2,
                background: 'rgba(255,255,255,.35)' }}/>
              <span className="mono" style={{ fontSize: 10, fontWeight: 600,
                color: isLive ? '#dfab25' : 'rgba(255,255,255,.52)',
                letterSpacing: .3, whiteSpace: 'nowrap' }}>
                {billieShort}
              </span>
            </div>
          );
        })()}

        {/* top overlays */}
        <div style={{ position: 'absolute', top: alertSev ? 32 : 10, left: 12, right: 12,
          display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
          <span style={{ flex: 1 }}/>
          <span className="mono" style={{ fontSize: 10, letterSpacing: 1.2,
            color: isLive ? 'rgba(24,24,27,.66)' : 'rgba(24,24,27,.35)',
            textShadow: '0 1px 2px rgba(0,0,0,.5)' }}>
            CAM · {feed.cam}
          </span>
          {isLive ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 8px', borderRadius: 4, background: '#dc2626',
              fontSize: 9.5, fontWeight: 700, color: '#17171a', letterSpacing: .6 }}>
              <span style={{ width: 5, height: 5, borderRadius: 3, background: '#fff',
                boxShadow: '0 0 4px #fff', animation: 'billPulse 1.4s ease-in-out infinite' }}/>
              LIVE
            </span>
          ) : (
            <span style={{ padding: '3px 8px', borderRadius: 4,
              background: 'rgba(0,0,0,.55)', border: '1px solid rgba(24,24,27,.1)',
              fontSize: 9.5, fontWeight: 700, color: 'rgba(24,24,27,.55)', letterSpacing: .6 }}>
              · OFFLINE
            </span>
          )}
        </div>

        {/* bottom-left: room + billie + time */}
        <div style={{ position: 'absolute', left: 12, right: 12, bottom: 10,
          textShadow: '0 1px 3px rgba(0,0,0,.7)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#17171a', letterSpacing: -.1 }}>
            {feed.room}
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.62)',
            letterSpacing: .6, marginTop: 2 }}>
            {feed.billie}{feed.time !== '—' ? ` · ${feed.time}` : ''}
          </div>
        </div>

        {/* progress bar when live */}
        {isLive && feed.pct > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2,
            background: 'rgba(0,0,0,.4)' }}>
            <div style={{ height: '100%', width: `${feed.pct}%`, background: feed.accent,
              boxShadow: `0 0 6px ${feed.accent}` }}/>
          </div>
        )}
      </div>

      {/* action bar */}
      <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6,
        background: '#fbfbfa' }}>
        {isLive ? (
          <>
            <FleetAction label="open" onClick={onOpen}/>
            <FleetAction label="❚❚ pause"/>
            <FleetAction label="abort" tone="danger"/>
            <span style={{ flex: 1 }}/>
            <span className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.35)', letterSpacing: .4,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
              {feed.step}
            </span>
          </>
        ) : (
          <>
            <FleetAction label="wake"/>
            <FleetAction label="details"/>
            <span style={{ flex: 1 }}/>
            <span className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.35)', letterSpacing: .4 }}>
              {feed.step}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function FleetAction({ label, tone, onClick }) {
  const bg = tone === 'primary' ? '#fbbf24' : tone === 'danger' ? 'transparent' : 'rgba(24,24,27,.035)';
  const border = tone === 'primary' ? 'rgba(251,191,36,.35)' : tone === 'danger' ? 'rgba(220,38,38,.55)' : 'rgba(24,24,27,.08)';
  const color = tone === 'primary' ? '#451a03' : tone === 'danger' ? '#dc2626' : 'rgba(24,24,27,.66)';
  return (
    <button onClick={onClick} style={{ all: 'unset', cursor: 'pointer',
      padding: '4px 10px', borderRadius: 5, fontSize: 10.5, fontWeight: 600,
      background: bg, border: `1px solid ${border}`, color, letterSpacing: .2 }}>
      {label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// FleetAgentPanel — agent sidebar on the Live View, shows current
// open alerts (Billie-08 can't open the door) + chat with Billie Boss
// ═══════════════════════════════════════════════════════════════
function FleetAgentPanel({ goto }) {
  const [tab, setTab] = React.useState('alerts'); // alerts | chat
  const [collapsed, setCollapsed] = React.useState(false);
  const [acked, setAcked] = React.useState(false);
  const [thinking, setThinking] = React.useState(false);
  const [reply, setReply] = React.useState(null);
  const [input, setInput] = React.useState('');
  const [chat, setChat] = React.useState([
    { role: 'agent', text: 'Heads up — Billie 08 has been stalled at room 1216 for 90 seconds. The arm tried the lever twice; the door isn\'t opening. I think the latch is engaged from the inside.' },
  ]);
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat, thinking]);

  const sendChat = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    setInput('');
    setChat(c => [...c, { role: 'user', text }]);
    setThinking(true);
    try {
      const prompt = `You are Billie Boss, the agent watching the fleet from the Live View. The active situation is: Billie 08 is stalled at room 1216 (Marriott Rome) — the door is latched from inside and the robot can\'t open it. The operator just typed: "${text}". Reply in 1-2 short sentences as the agent. Be concrete; suggest a next step or confirm an action. No emoji.`;
      const r = await window.claude.complete(prompt);
      setChat(c => [...c, { role: 'agent', text: r.trim() }]);
    } catch {
      setChat(c => [...c, { role: 'agent', text: 'Comms degraded — retry.', error: true }]);
    } finally { setThinking(false); }
  };

  const askWhy = async () => {
    if (thinking || reply) return;
    setThinking(true);
    try {
      const prompt = 'You are Billie Boss, the fleet agent. The operator clicked "Why?" on this alert: Billie 08 stalled trying to enter room 1216 — door not opening despite two arm attempts on the lever. Explain in 2 short sentences what you observed and what you think the cause is. No emoji.';
      const r = await window.claude.complete(prompt);
      setReply(r.trim());
    } catch { setReply('Comms degraded — retry.'); }
    finally { setThinking(false); }
  };

  if (collapsed) {
    return (
      <div style={{ width: 44, flexShrink: 0, borderLeft: '1px solid rgba(24,24,27,.06)',
        background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '14px 0', gap: 14 }}>
        <button onClick={() => setCollapsed(false)}
          title="Open Billie Boss"
          style={{ all: 'unset', cursor: 'pointer', width: 28, height: 28, borderRadius: 6,
            background: '#17171a', color: '#fbbf24',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M14 8a6 6 0 01-9 5l-3 1 1-3a6 6 0 1111-3z"/>
          </svg>
          {!acked && (
            <span style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10,
              borderRadius: 5, background: '#ef4444', border: '2px solid #fff' }}/>
          )}
        </button>
        <div className="mono" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)',
          fontSize: 9.5, color: 'rgba(24,24,27,.45)', letterSpacing: 1.5 }}>
          BILLIE BOSS
        </div>
      </div>
    );
  }

  return (
    <aside style={{ width: 340, flexShrink: 0, borderLeft: '1px solid rgba(24,24,27,.06)',
      background: '#ffffff', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* header */}
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid rgba(24,24,27,.05)' }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#17171a',
          color: '#fbbf24', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M14 8a6 6 0 01-9 5l-3 1 1-3a6 6 0 1111-3z"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#17171a', letterSpacing: -.1 }}>
            Billie Boss
          </div>
          <div className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.5)', letterSpacing: .8,
            display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: 3, background: '#22c55e' }}/>
            WATCHING · 14 LIVE
          </div>
        </div>
        <button onClick={() => setCollapsed(true)}
          style={{ all: 'unset', cursor: 'pointer', padding: 4,
            color: 'rgba(24,24,27,.45)', borderRadius: 4 }}
          title="Collapse">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M9 3l-4 4 4 4"/>
          </svg>
        </button>
      </div>

      {/* tab pills */}
      <div style={{ display: 'flex', padding: '8px 12px 0', gap: 4 }}>
        {[
          { v: 'alerts',     label: 'Alerts',     n: 6 },
          { v: 'dispatcher', label: 'Dispatcher', n: 7 },
          { v: 'chat',       label: 'Ask',        n: null },
        ].map(t => {
          const on = tab === t.v;
          return (
            <button key={t.v} onClick={() => setTab(t.v)}
              style={{ all: 'unset', cursor: 'pointer',
                padding: '5px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600,
                color: on ? '#17171a' : 'rgba(24,24,27,.55)',
                background: on ? 'rgba(24,24,27,.06)' : 'transparent',
                display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {t.label}
              {t.n != null && (
                <span className="mono" style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 3,
                  background: t.v === 'alerts' && !acked ? '#ef4444' : 'rgba(24,24,27,.1)',
                  color: t.v === 'alerts' && !acked ? '#fff' : 'rgba(24,24,27,.6)',
                  fontWeight: 700, letterSpacing: .3 }}>
                  {t.n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* body */}
      {tab === 'alerts' ? (
        <AlertsTriage goto={goto} thinking={thinking} reply={reply} askWhy={askWhy} setAcked={setAcked}/>
      ) : tab === 'dispatcher' ? (
        <DispatcherMini goto={goto}/>
      ) : (
        // chat view
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflow: 'auto',
            padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chat.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8,
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                {m.role === 'agent' && (
                  <span style={{ width: 22, height: 22, borderRadius: 4, flexShrink: 0,
                    background: '#17171a', color: '#fbbf24',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700, letterSpacing: .2 }}>BB</span>
                )}
                <div style={{ maxWidth: '82%', fontSize: 12.5, lineHeight: 1.45,
                  padding: '7px 10px', borderRadius: 9,
                  background: m.role === 'user' ? '#17171a' : 'rgba(24,24,27,.05)',
                  color: m.role === 'user' ? '#fff' : '#17171a',
                  borderBottomRightRadius: m.role === 'user' ? 3 : 9,
                  borderBottomLeftRadius:  m.role === 'user' ? 9 : 3 }}>
                  {m.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: 4, flexShrink: 0,
                  background: '#17171a', color: '#fbbf24',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700 }}>BB</span>
                <div style={{ padding: '8px 10px', borderRadius: 9, background: 'rgba(24,24,27,.05)',
                  display: 'flex', gap: 3, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: 3,
                      background: 'rgba(24,24,27,.4)',
                      animation: `td 1s ${i * .15}s infinite ease-in-out` }}/>
                  ))}
                  <style>{'@keyframes td { 0%,60%,100% { opacity:.3 } 30% { opacity:.9 } }'}</style>
                </div>
              </div>
            )}
          </div>
          <div style={{ borderTop: '1px solid rgba(24,24,27,.06)',
            padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendChat(); }}
              placeholder={thinking ? 'thinking…' : 'Ask Billie Boss anything…'}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 12.5, color: '#17171a', fontFamily: 'inherit' }}/>
            <button onClick={sendChat} disabled={!input.trim() || thinking}
              style={{ all: 'unset', cursor: input.trim() && !thinking ? 'pointer' : 'default',
                width: 26, height: 26, borderRadius: 5,
                background: input.trim() && !thinking ? '#17171a' : 'rgba(24,24,27,.08)',
                color: input.trim() && !thinking ? '#fbbf24' : 'rgba(24,24,27,.4)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 7h10M8 3l4 4-4 4"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════
// AlertsTriage — counts strip + active alert + grouped queue.
// Used as the body of the "Alerts" tab in the Billie Boss panel.
// ═══════════════════════════════════════════════════════════════
const TRIAGE_ALERTS = [
  { id: 'A-2041', flag: '🇮🇹', city: 'Rome',  robot: 'BILLIE-08', room: '1216', issue: "Door won't open",                  why: 'Privacy latch likely engaged from inside.', stalled: '1m 32s', attempts: 2, sev: 'high' },
  { id: 'A-2040', flag: '🇮🇹', city: 'Rome',  robot: 'BILLIE-14', room: '1118', issue: 'Depth sensor recalibration',       why: 'ToF channel 3 drift over threshold.',       stalled: '6m 04s', attempts: 1, sev: 'high' },
  { id: 'A-2039', flag: '🇫🇷', city: 'Paris', robot: 'BILLIE-22', room: '0612', issue: 'Battery low · 18%',                why: 'Heavy floor 6 routes drained pack faster.', stalled: '—',     attempts: 0, sev: 'med'  },
  { id: 'A-2038', flag: '🇮🇹', city: 'Rome',  robot: 'BILLIE-21', room: '0908', issue: 'Lift wait > 90s',                  why: 'Lift A out of service. Re-routing via B.',   stalled: '2m 11s', attempts: 0, sev: 'med'  },
  { id: 'A-2037', flag: '🇫🇷', city: 'Paris', robot: 'BILLIE-19', room: '0204', issue: 'Trash bin full',                   why: 'Service bay 2 backed up since 09:40.',       stalled: '—',     attempts: 0, sev: 'low'  },
  { id: 'A-2036', flag: '🇮🇹', city: 'Rome',  robot: 'BILLIE-11', room: '1402', issue: 'Guest request unconfirmed',        why: 'Guest did not confirm towels delivery.',     stalled: '—',     attempts: 0, sev: 'low'  },
];

const TRIAGE_SEV = {
  high: { tone: '#ef4444', label: 'HIGH' },
  med:  { tone: '#f59e0b', label: 'MED'  },
  low:  { tone: 'rgba(24,24,27,.45)', label: 'LOW' },
};

function AlertsTriage({ goto, thinking, reply, askWhy, setAcked }) {
  const active = TRIAGE_ALERTS[0];
  const queue = TRIAGE_ALERTS.slice(1);
  const counts = {
    high: TRIAGE_ALERTS.filter(a => a.sev === 'high').length,
    med:  TRIAGE_ALERTS.filter(a => a.sev === 'med').length,
    low:  TRIAGE_ALERTS.filter(a => a.sev === 'low').length,
  };
  const groups = [
    { sev: 'high', label: 'HIGH',   items: queue.filter(a => a.sev === 'high') },
    { sev: 'med',  label: 'MEDIUM', items: queue.filter(a => a.sev === 'med')  },
    { sev: 'low',  label: 'LOW',    items: queue.filter(a => a.sev === 'low')  },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto',
      display: 'flex', flexDirection: 'column' }}>
      {/* counts strip */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 14px 8px' }}>
        {[
          { tone: TRIAGE_SEV.high.tone, n: counts.high, label: 'HIGH' },
          { tone: TRIAGE_SEV.med.tone,  n: counts.med,  label: 'MED'  },
          { tone: TRIAGE_SEV.low.tone,  n: counts.low,  label: 'LOW'  },
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

      {/* NOW — the active alert */}
      <div style={{ padding: '4px 14px 8px' }}>
        <div className="mono" style={{ fontSize: 9, color: 'rgba(24,24,27,.45)',
          letterSpacing: 1.4, marginBottom: 6 }}>NOW</div>
        <div style={{ borderRadius: 10, border: '1px solid rgba(239,68,68,.25)',
          background: 'linear-gradient(180deg, rgba(254,242,242,.55) 0%, #fff 65%)',
          padding: '11px 13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: 5, flexShrink: 0,
              background: '#ef4444', color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 1.5L.8 12.5h12.4L7 1.5z"/><path d="M7 5.5v3.2M7 10.3v.01"/>
              </svg>
            </span>
            <span className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.55)',
              letterSpacing: .4 }}>
              {active.flag} {active.robot} · rm {active.room} · {active.city}
            </span>
            <span style={{ flex: 1 }}/>
            <span className="mono" style={{ fontSize: 9.5, color: '#b91c1c', fontWeight: 700,
              letterSpacing: .6 }}>STALLED {active.stalled}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 7, lineHeight: 1.3,
            color: '#17171a' }}>
            {active.issue}
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(24,24,27,.6)', marginTop: 4, lineHeight: 1.45 }}>
            I tried the lever twice — no movement. {active.why}
          </div>

          {/* Why? expansion (LLM reply) */}
          {reply && (
            <div style={{ marginTop: 9, padding: '8px 10px', borderRadius: 6,
              background: 'rgba(24,24,27,.04)', border: '1px solid rgba(24,24,27,.06)',
              fontSize: 11.5, lineHeight: 1.45, color: '#17171a' }}>
              {reply}
            </div>
          )}
          {thinking && !reply && (
            <div style={{ marginTop: 9, padding: '8px 10px', borderRadius: 6,
              background: 'rgba(24,24,27,.04)', fontSize: 11, color: 'rgba(24,24,27,.55)' }}>
              Billie Boss is checking the logs…
            </div>
          )}

          <div style={{ display: 'flex', gap: 5, marginTop: 9 }}>
            <button onClick={() => goto && goto('operator')}
              style={{ all: 'unset', cursor: 'pointer', flex: 1,
                padding: '7px 10px', borderRadius: 6, background: '#17171a', color: '#fff',
                fontSize: 11.5, fontWeight: 600, textAlign: 'center' }}>
              Take over →
            </button>
            <button onClick={askWhy} disabled={thinking || !!reply}
              style={{ all: 'unset', cursor: thinking || reply ? 'default' : 'pointer',
                padding: '7px 10px', borderRadius: 6,
                border: '1px solid rgba(24,24,27,.1)', background: '#fff',
                fontSize: 11.5, fontWeight: 500,
                color: reply ? 'rgba(24,24,27,.4)' : '#17171a',
                opacity: thinking ? .6 : 1 }}>
              Why?
            </button>
            <button onClick={() => setAcked && setAcked(true)}
              style={{ all: 'unset', cursor: 'pointer',
                padding: '7px 10px', borderRadius: 6,
                border: '1px solid rgba(24,24,27,.1)', background: '#fff',
                fontSize: 11.5, fontWeight: 500, color: '#17171a' }}>
              Skip
            </button>
          </div>
        </div>
      </div>

      {/* QUEUE — grouped by severity */}
      <div style={{ padding: '6px 0 16px' }}>
        {groups.map(g => g.items.length > 0 && (
          <div key={g.sev} style={{ marginBottom: 8 }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: 1.4,
              color: TRIAGE_SEV[g.sev].tone, fontWeight: 700,
              padding: '8px 14px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
              {g.label}
              <span style={{ color: 'rgba(24,24,27,.4)', fontWeight: 500 }}>· {g.items.length}</span>
            </div>
            {g.items.map(a => {
              const s = TRIAGE_SEV[a.sev];
              return (
                <div key={a.id}
                  onClick={() => goto && goto('alerts')}
                  style={{ padding: '8px 14px',
                    borderTop: '1px solid rgba(24,24,27,.04)',
                    display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
                  <span style={{ width: 6, height: 6, borderRadius: 4, background: s.tone, flexShrink: 0 }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3,
                      color: '#17171a',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.issue}
                    </div>
                    <div className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.45)',
                      letterSpacing: .3, marginTop: 1 }}>
                      {a.flag} {a.robot.replace('BILLIE-', 'B-')} · rm {a.room}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); }}
                    style={{ all: 'unset', cursor: 'pointer',
                      padding: '4px 8px', borderRadius: 5, fontSize: 10.5, fontWeight: 600,
                      background: 'rgba(24,24,27,.05)', color: 'rgba(24,24,27,.65)' }}>
                    Ack
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); }}
                    style={{ all: 'unset', cursor: 'pointer',
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

      {/* footer link */}
      <div style={{ padding: '0 14px 14px', marginTop: 'auto' }}>
        <button onClick={() => goto && goto('alerts')}
          style={{ all: 'unset', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', padding: '8px 10px', borderRadius: 6,
            background: 'rgba(24,24,27,.04)', fontSize: 11.5, fontWeight: 600,
            color: '#17171a' }}>
          Open all alerts
          <span className="mono" style={{ fontSize: 10, opacity: .5 }}>→</span>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DispatcherMini — compact queue of unassigned/pending tasks for the
// agent panel on Live View. Tap a row to assign or open in operator.
// ═══════════════════════════════════════════════════════════════
function DispatcherMini({ goto }) {
  const QUEUE = [
    { id: 'T-4821', flag: '🇮🇹', hotel: 'Marriott Rome',     room: '1402', task: 'Towels + toothbrush',     wait: '4m',  prio: 'high',   billie: null },
    { id: 'T-4820', flag: '🇮🇹', hotel: 'Marriott Rome',     room: '0908', task: 'Late checkout pickup',    wait: '6m',  prio: 'med',    billie: null },
    { id: 'T-4819', flag: '🇫🇷', hotel: 'Le Meurice Paris',   room: '0612', task: 'Extra pillows',           wait: '2m',  prio: 'med',    billie: 'Billie-22' },
    { id: 'T-4818', flag: '🇮🇹', hotel: 'Marriott Rome',     room: '1108', task: 'Room service · breakfast',wait: '11m', prio: 'high',   billie: null },
    { id: 'T-4817', flag: '🇫🇷', hotel: 'Le Meurice Paris',   room: '0204', task: 'Trash pickup',            wait: '1m',  prio: 'low',    billie: 'Billie-19' },
    { id: 'T-4816', flag: '🇮🇹', hotel: 'Marriott Rome',     room: '0716', task: 'Iron + ironing board',    wait: '3m',  prio: 'low',    billie: null },
    { id: 'T-4815', flag: '🇫🇷', hotel: 'Le Meurice Paris',   room: '0801', task: 'Welcome amenity drop',   wait: '7m',  prio: 'med',    billie: null },
  ];
  const PRIO = {
    high: { tone: '#ef4444', bg: 'rgba(239,68,68,.1)' },
    med:  { tone: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
    low:  { tone: 'rgba(24,24,27,.45)', bg: 'rgba(24,24,27,.06)' },
  };
  const unassigned = QUEUE.filter(t => !t.billie).length;
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '10px 12px 18px' }}>
      {/* header strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 2px 8px' }}>
        <span className="mono" style={{ fontSize: 9, color: 'rgba(24,24,27,.45)', letterSpacing: 1.2 }}>
          QUEUE · {QUEUE.length}
        </span>
        <span style={{ flex: 1 }}/>
        <span className="mono" style={{ fontSize: 9, color: '#b45309', letterSpacing: .8,
          padding: '1px 5px', borderRadius: 3, background: 'rgba(245,158,11,.14)', fontWeight: 700 }}>
          {unassigned} UNASSIGNED
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {QUEUE.map(t => {
          const p = PRIO[t.prio];
          return (
            <button key={t.id} onClick={() => goto && goto('dispatcher')}
              style={{ all: 'unset', cursor: 'pointer',
                display: 'flex', alignItems: 'flex-start', gap: 9,
                padding: '9px 10px', borderRadius: 7,
                border: '1px solid rgba(24,24,27,.06)', background: '#fff' }}>
              <span style={{ width: 4, alignSelf: 'stretch', borderRadius: 2,
                background: p.tone, flexShrink: 0, marginTop: 1 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11.5 }}>{t.flag}</span>
                  <span className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.55)',
                    letterSpacing: .4 }}>rm {t.room}</span>
                  <span style={{ flex: 1 }}/>
                  <span className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.4)',
                    letterSpacing: .3 }}>{t.wait}</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: '#17171a',
                  marginTop: 2, lineHeight: 1.3, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.task}
                </div>
                <div className="mono" style={{ fontSize: 9.5,
                  color: t.billie ? 'rgba(24,24,27,.55)' : '#b45309',
                  letterSpacing: .3, marginTop: 3,
                  display: 'flex', alignItems: 'center', gap: 5 }}>
                  {t.billie ? (
                    <><span style={{ width: 5, height: 5, borderRadius: 3, background: '#22c55e' }}/>{t.billie}</>
                  ) : (
                    <>UNASSIGNED · tap to assign</>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* open full dispatcher */}
      <button onClick={() => goto && goto('dispatcher')}
        style={{ all: 'unset', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          width: '100%', marginTop: 10, padding: '8px 10px', borderRadius: 6,
          background: 'rgba(24,24,27,.04)', fontSize: 11.5, fontWeight: 600,
          color: '#17171a' }}>
        Open full dispatcher
        <span className="mono" style={{ fontSize: 10, opacity: .5 }}>→</span>
      </button>
    </div>
  );
}

function FleetFocus({ feed, onClose, goto }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.78)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
      backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(1080px, 92vw)', background: '#ffffff',
          border: '1px solid rgba(251,191,36,.25)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: '1px solid rgba(24,24,27,.05)' }}>
          <span style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 20, color: '#17171a' }}>
            {feed.room}
          </span>
          <span className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.52)', letterSpacing: .8 }}>
            {feed.billie} · CAM · {feed.cam}
          </span>
          <span style={{ flex: 1 }}/>
          <button onClick={() => goto('operator')} style={{ all: 'unset', cursor: 'pointer',
            padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
            color: '#451a03', background: '#fbbf24' }}>
            Take over →
          </button>
          <button onClick={onClose} style={{ all: 'unset', cursor: 'pointer', padding: 6,
            color: 'rgba(24,24,27,.55)' }}>✕</button>
        </div>
        <div style={{ aspectRatio: '16/9',
          background: 'linear-gradient(120deg, #3b2e26 0%, #6b5043 45%, #c9a588 100%)',
          position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.08) 0px, rgba(0,0,0,.08) 1px, transparent 1px, transparent 3px)' }}/>
          <div style={{ position: 'absolute', left: 20, bottom: 20, color: '#17171a',
            textShadow: '0 1px 3px rgba(0,0,0,.7)' }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{feed.step}</div>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(24,24,27,.62)', marginTop: 3 }}>
              step progress · {feed.pct}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RoomsApp — property-level room management (assign + status + priority)
// ═══════════════════════════════════════════════════════════════
const ROOMS_APP_DATA = (() => {
  const rooms = [];
  // Floors 12, 13, 14 — with a mix of statuses
  const statuses = ['Needs Cleaning', 'Needs Cleaning', 'Needs Cleaning', 'Needs Cleaning',
                    'Needs Cleaning', 'In Progress', 'Done', 'Needs Inspection', 'Needs Cleaning'];
  const assignees = ['Unassigned', 'Unassigned', 'Unassigned', 'Maid 1', 'Unassigned',
                     'Maid 2', 'Maid 1', 'Unassigned', 'Unassigned'];
  for (let f = 12; f <= 14; f++) {
    for (let i = 0; i < 16; i++) {
      const n = f * 100 + i; // 1200..1215, etc
      const idx = (n * 7) % statuses.length;
      rooms.push({
        n: String(n),
        floor: `F${f}`,
        status: statuses[idx],
        assignee: assignees[idx],
        priority: (n % 11 === 0),
      });
    }
  }
  return rooms;
})();

function ImpersonateMenu({ goto }) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(null); // active impersonation
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener('mousedown', h);
    return () => window.removeEventListener('mousedown', h);
  }, [open]);

  // External callers (e.g. Rooms row) fire `bb:impersonate` with {id}
  const peopleRef = React.useRef(null);
  React.useEffect(() => {
    const onExt = (e) => {
      const id = e.detail?.id;
      if (!id || !peopleRef.current) return;
      const found = peopleRef.current.find(p => p.id === id);
      if (found) {
        setActive(found);
        try { localStorage.setItem('bb_tab', 'operator'); } catch {}
        window.dispatchEvent(new CustomEvent('app:navigate', { detail: { tab: 'operator' } }));
      }
    };
    window.addEventListener('bb:impersonate', onExt);
    return () => window.removeEventListener('bb:impersonate', onExt);
  }, []);

  const PEOPLE = [
    { kind: 'group', label: 'Billies' },
    { kind: 'billie', id: 'BILLIE-08', sub: '🇮🇹 Marriott Rome · rm 1210' },
    { kind: 'billie', id: 'BILLIE-12', sub: '🇮🇹 Marriott Rome · rm 1216' },
    { kind: 'billie', id: 'BILLIE-17', sub: '🇫🇷 Accor Paris · rm 314' },
    { kind: 'billie', id: 'BILLIE-22', sub: '🇩🇪 Steigenberger Berlin · rm 508' },
    { kind: 'billie', id: 'BILLIE-29', sub: '🇧🇪 Cardo Brussels · rm 112' },
    { kind: 'group', label: 'Operators' },
    { kind: 'op', id: 'Dr. Sarah Chen', sub: 'On call · Rome', init: 'SC', color: '#f59e0b' },
    { kind: 'op', id: 'M. Rivera',      sub: 'On shift · Paris',  init: 'MR', color: '#6366f1' },
    { kind: 'op', id: 'Ivy Nakamura',   sub: 'On shift · Rome PM', init: 'IN', color: '#10b981' },
    { kind: 'op', id: 'P. Jansen',      sub: 'Off-duty · Berlin',  init: 'PJ', color: '#a78bfa' },
    { kind: 'op', id: 'L. Dubois',      sub: 'Overnight · Brussels', init: 'LD', color: '#ef4444' },
  ];
  peopleRef.current = PEOPLE;

  const pick = (p) => {
    setActive(p);
    setOpen(false);
    if (p.kind === 'billie') {
      // jump to Operator Console to see their live view
      try { localStorage.setItem('bb_tab', 'operator'); } catch {}
      window.dispatchEvent(new CustomEvent('app:navigate', { detail: { tab: 'operator' } }));
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative', marginLeft: 6 }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ all: 'unset', cursor: 'pointer',
          padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
          color: active ? '#3730a3' : 'rgba(24,24,27,.85)',
          border: `1px solid ${active ? 'rgba(91,91,247,.35)' : 'rgba(24,24,27,.09)'}`,
          background: active ? 'rgba(91,91,247,.08)' : 'rgba(24,24,27,.035)',
          display: 'inline-flex', alignItems: 'center', gap: 7 }}
        title="Impersonate a Billie or operator">
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7" cy="5" r="2.4"/><path d="M2.5 12c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4"/>
        </svg>
        {active ? `Viewing as ${active.id}` : 'Impersonate'}
        <span style={{ opacity: .5 }}>▾</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          minWidth: 280, maxHeight: 380, overflow: 'auto',
          background: '#fff', border: '1px solid rgba(24,24,27,.1)', borderRadius: 8,
          boxShadow: '0 14px 40px rgba(0,0,0,.12)', zIndex: 20, padding: '6px 0' }}>
          {active && (
            <>
              <button onClick={() => { setActive(null); setOpen(false); }}
                style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%',
                  padding: '8px 14px', fontSize: 11.5, color: '#b91c1c', fontWeight: 500,
                  borderBottom: '1px solid rgba(24,24,27,.06)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                ✕ Exit impersonation
              </button>
            </>
          )}
          {PEOPLE.map((p, i) => {
            if (p.kind === 'group') {
              return (
                <div key={'g'+i} className="mono" style={{
                  fontSize: 9, color: 'rgba(24,24,27,.4)', letterSpacing: 1.2,
                  padding: '10px 14px 4px', textTransform: 'uppercase', fontWeight: 600,
                }}>{p.label}</div>
              );
            }
            const isOn = active && active.id === p.id;
            return (
              <button key={p.id} onClick={() => pick(p)}
                style={{ all: 'unset', cursor: 'pointer', display: 'flex', width: '100%',
                  padding: '8px 14px', alignItems: 'center', gap: 10,
                  background: isOn ? 'rgba(91,91,247,.08)' : 'transparent' }}
                onMouseEnter={(e) => { if (!isOn) e.currentTarget.style.background = 'rgba(24,24,27,.04)'; }}
                onMouseLeave={(e) => { if (!isOn) e.currentTarget.style.background = 'transparent'; }}>
                {p.kind === 'billie' ? (
                  <span className="mono" style={{
                    width: 26, height: 26, borderRadius: 5, background: '#17171a',
                    color: '#fbbf24', fontSize: 9, fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, letterSpacing: .3,
                  }}>{p.id.replace('BILLIE-', '')}</span>
                ) : (
                  <span style={{
                    width: 26, height: 26, borderRadius: 13, background: p.color,
                    color: '#fff', fontSize: 10, fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>{p.init}</span>
                )}
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.25 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#17171a',
                    fontFamily: p.kind === 'billie' ? 'var(--mono)' : 'inherit' }}>{p.id}</div>
                  <div style={{ fontSize: 10.5, color: 'rgba(24,24,27,.55)' }}>{p.sub}</div>
                </div>
                {isOn && (
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#5b5bf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7l3 3 7-7"/></svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RoomsApp({ goto }) {
  const [subTab, setSubTab] = React.useState('rooms');
  const [property, setProperty] = React.useState('Marriott Rome');
  const [statusFilter, setStatusFilter] = React.useState('All Status');
  const [floorFilter, setFloorFilter] = React.useState('All Floors');
  const [query, setQuery] = React.useState('');
  const [rooms, setRooms] = React.useState(ROOMS_APP_DATA);

  const filtered = rooms.filter(r => {
    if (statusFilter !== 'All Status' && r.status !== statusFilter) return false;
    if (floorFilter !== 'All Floors' && r.floor !== floorFilter) return false;
    if (query && !r.n.includes(query)) return false;
    return true;
  });
  const staffCount = '23/28';
  const totalAssigned = filtered.length;

  const togglePriority = (n) => setRooms(rs => rs.map(r => r.n === n ? { ...r, priority: !r.priority } : r));
  const updateAssignee = (n, v) => setRooms(rs => rs.map(r => r.n === n ? { ...r, assignee: v } : r));
  const updateStatus   = (n, v) => setRooms(rs => rs.map(r => r.n === n ? { ...r, status: v } : r));

  const [agentOpen, setAgentOpen] = React.useState(() => {
    try { const v = localStorage.getItem('bb_rooms_agent'); return v === null ? true : v === '1'; } catch { return true; }
  });
  React.useEffect(() => { try { localStorage.setItem('bb_rooms_agent', agentOpen ? '1' : '0'); } catch {} }, [agentOpen]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden',
      background: '#fbfbfa', color: '#17171a', fontFamily: 'Inter, var(--sans)',
      display: 'flex', flexDirection: 'column' }}>
      {/* top bar: property switcher + sub-nav */}
      <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16,
        background: '#ffffff', borderBottom: '1px solid rgba(24,24,27,.05)' }}>
        <span style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 16, fontWeight: 700,
          color: '#17171a', letterSpacing: -.4 }}>Rooms</span>
        <span className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.35)', letterSpacing: 1.2 }}>
          BY BELLBOY
        </span>
        <div style={{ width: 1, height: 16, background: 'rgba(24,24,27,.07)', marginLeft: 4 }}/>
        <button onClick={() => {
          const ps = ['Marriott Rome', 'Hilton Berlin', 'Cardo Brussels', 'Seminaris Potsdam'];
          const i = ps.indexOf(property);
          setProperty(ps[(i+1) % ps.length]);
        }} style={{ all: 'unset', cursor: 'pointer',
          padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
          color: 'rgba(24,24,27,.85)',
          border: '1px solid rgba(24,24,27,.09)',
          background: 'rgba(24,24,27,.035)',
          display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          🏨 {property} <span style={{ opacity: .5 }}>▾</span>
        </button>
        <ImpersonateMenu goto={goto}/>
        <span style={{ flex: 1 }}/>
        {['Hotels','Users','Rooms','Assign'].map(t => {
          const on = t === 'Assign';
          return (
            <span key={t} style={{ fontSize: 12, fontWeight: 500, cursor: 'pointer',
              color: on ? '#fbbf24' : 'rgba(24,24,27,.55)',
              padding: '6px 2px',
              borderBottom: on ? '2px solid #fbbf24' : '2px solid transparent' }}>
              {t}
            </span>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden',
        display: 'grid', gridTemplateColumns: agentOpen ? '1fr 360px' : '1fr', gap: 0,
        position: 'relative' }}>
        {/* main column */}
        <div style={{ overflow: 'auto', padding: '24px 32px 40px', minWidth: 0 }}>
        {/* sub-tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 18,
          borderBottom: '1px solid rgba(24,24,27,.06)' }}>
          <RoomsSubTab on={subTab === 'rooms'} onClick={() => setSubTab('rooms')}
            label="Rooms" count={rooms.length}/>
          <RoomsSubTab on={subTab === 'staff'} onClick={() => setSubTab('staff')}
            label="Staff" count={staffCount}/>
        </div>

        {/* heading */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
          <h1 style={{ margin: 0, fontSize: 28,
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 700,
            color: '#17171a', letterSpacing: -.5 }}>
            Today's Assigned Rooms
          </h1>
          <span style={{ fontSize: 14, color: 'rgba(24,24,27,.52)',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontStyle: 'normal' }}>
            — Tuesday, April 21, 2026
          </span>
          <span style={{ flex: 1 }}/>
          <span className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.35)', letterSpacing: .8 }}>
            {totalAssigned} SHOWING · {rooms.length} TOTAL
          </span>
        </div>

        {/* filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 200px', display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 7,
            background: 'rgba(24,24,27,.035)', border: '1px solid rgba(24,24,27,.07)' }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="rgba(24,24,27,.48)" strokeWidth="1.6">
              <circle cx="7" cy="7" r="4.5"/><path d="M13 13l-2.5-2.5" strokeLinecap="round"/>
            </svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search room..."
              style={{ all: 'unset', flex: 1, fontSize: 12, color: '#17171a',
                fontFamily: 'inherit' }}/>
          </div>
          <RoomsFilterSelect value={statusFilter} onChange={setStatusFilter}
            options={['All Status', 'Needs Cleaning', 'In Progress', 'Needs Inspection', 'Done']}/>
          <RoomsFilterSelect value={floorFilter} onChange={setFloorFilter}
            options={['All Floors', 'F12', 'F13', 'F14']}/>
          <button onClick={() => { setStatusFilter('All Status'); setFloorFilter('All Floors'); setQuery(''); }}
            style={{ all: 'unset', cursor: 'pointer', padding: '7px 10px',
              fontSize: 12, color: 'rgba(24,24,27,.55)',
              display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            ↺ Reset
          </button>
          <span style={{ flex: 1 }}/>

          {/* Reset all rooms — unassign everyone */}
          <button onClick={() => {
              setRooms(rs => rs.map(r => ({ ...r, assignee: 'Unassigned' })));
            }}
            style={{ all: 'unset', cursor: 'pointer',
              padding: '7px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500,
              color: 'rgba(24,24,27,.85)',
              background: 'rgba(24,24,27,.04)',
              border: '1px solid rgba(24,24,27,.09)',
              display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7a4 4 0 0 1 7-2.8M11 7a4 4 0 0 1-7 2.8"/><path d="M10 2.5v2h-2M4 11.5v-2h2"/>
            </svg>
            Reset all rooms
          </button>

          {/* Upload printout */}
          <button style={{ all: 'unset', cursor: 'pointer',
            padding: '7px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500,
            color: 'rgba(24,24,27,.85)',
            background: 'rgba(24,24,27,.04)',
            border: '1px solid rgba(24,24,27,.09)',
            display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1.5v8M4 5.5l3-4 3 4"/><rect x="2" y="10" width="10" height="2.5" rx=".5"/>
            </svg>
            Upload printout
          </button>

          <button style={{ all: 'unset', cursor: 'pointer',
            padding: '8px 16px', borderRadius: 7, fontSize: 12.5, fontWeight: 600,
            background: '#fbbf24', color: '#451a03', letterSpacing: .1 }}>
            + Add Room
          </button>
        </div>

        {/* rooms list */}
        <div style={{ display: 'flex', flexDirection: 'column',
          border: '1px solid rgba(24,24,27,.06)', borderRadius: 10, overflow: 'hidden',
          background: 'rgba(255,255,255,.02)' }}>
          {filtered.map((r, i) => (
            <RoomsRow key={r.n} r={r} last={i === filtered.length - 1}
              onTogglePriority={() => togglePriority(r.n)}
              onAssign={(v) => updateAssignee(r.n, v)}
              onStatus={(v) => updateStatus(r.n, v)}
              onImpersonate={(id) => window.dispatchEvent(new CustomEvent('bb:impersonate', { detail: { id } }))}/>
          ))}
        </div>
        </div>

        {/* AGENT sidebar */}
        {agentOpen ? (
          <RoomsAgent rooms={rooms} property={property}
            onClose={() => setAgentOpen(false)}
            onAssignAll={() => setRooms(rs => {
              const maids = ['Maid 1','Maid 2','Maid 3','Maid 4','Maid 5'];
              let i = 0;
              return rs.map(r => r.assignee === 'Unassigned'
                ? { ...r, assignee: maids[i++ % maids.length] }
                : r);
            })}/>
        ) : (
          <button onClick={() => setAgentOpen(true)}
            style={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)',
              background: '#fff', border: '1px solid rgba(24,24,27,.1)',
              borderRight: 'none', borderRadius: '8px 0 0 8px',
              padding: '14px 8px 14px 10px', cursor: 'pointer',
              color: '#17171a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              fontFamily: 'inherit',
              boxShadow: '-4px 0 12px rgba(0,0,0,.06)', zIndex: 5 }}
            title="Show Billie Boss agent">
            <img src={window.__resources?.billie_boss_logo_jpg || (window.__resources?.billie_boss_logo_jpg || "billie-boss-logo.jpg")} alt="Billie Boss"
              style={{ width: 22, height: 22, borderRadius: 11, objectFit: 'cover' }}/>
            <span className="mono" style={{ fontSize: 9, letterSpacing: 1,
              writingMode: 'vertical-rl', transform: 'rotate(180deg)',
              color: 'rgba(24,24,27,.55)', fontWeight: 600 }}>AGENT</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Agent panel for Rooms App — sticky right rail.
function RoomsAgent({ rooms, property, onAssignAll, onClose }) {
  const [messages, setMessages] = React.useState([
    { role: 'agent', content: `Morning. I've pulled tonight's checkout list for ${property}. 42 rooms today, 28 ready to assign. Want me to batch-assign to Maid 1 and Maid 2 by floor?` },
    { role: 'user',  content: 'how many need inspection first?' },
    { role: 'agent', content: '6 rooms flagged for re-inspection from last shift. I can route those to human review before the Billies start.' },
  ]);
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);
  const send = async () => {
    if (!input.trim()) return;
    const q = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', content: q }, { role: 'agent', content: '…', typing: true }]);
    try {
      const reply = await window.claude.complete(
        `You are Billie Boss, the rooms-operations agent for ${property}. Today: ${rooms.length} rooms total, ${rooms.filter(r => r.status === 'Needs Cleaning').length} need cleaning, ${rooms.filter(r => r.assignee === 'Unassigned').length} unassigned. Keep it under 40 words, no lists, conversational.\n\nUser: ${q}`
      );
      setMessages(m => [...m.slice(0, -1), { role: 'agent', content: reply }]);
    } catch {
      setMessages(m => [...m.slice(0, -1), { role: 'agent', content: "Can't reach the planner right now — try again in a sec." }]);
    }
  };

  const unassigned = rooms.filter(r => r.assignee === 'Unassigned').length;
  const needsClean = rooms.filter(r => r.status === 'Needs Cleaning').length;
  const inProgress = rooms.filter(r => r.status === 'In Progress').length;
  const done       = rooms.filter(r => r.status === 'Done').length;

  return (
    <div style={{ borderLeft: '1px solid var(--border)',
      background: '#ffffff', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* agent header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(24,24,27,.06)',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <img src={window.__resources?.billie_boss_logo_jpg || (window.__resources?.billie_boss_logo_jpg || "billie-boss-logo.jpg")} alt="Billie Boss"
          style={{ width: 34, height: 34, borderRadius: 17, objectFit: 'cover', background: '#fff', flexShrink: 0 }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#17171a' }}>Billie Boss</div>
          <div className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.48)', letterSpacing: .4 }}>
            rooms agent · {property}
          </div>
        </div>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}/>
        {onClose && (
          <button onClick={onClose} title="Hide agent"
            style={{ border: 'none', background: 'transparent', color: 'rgba(24,24,27,.5)',
              width: 26, height: 26, borderRadius: 5, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(24,24,27,.06)'; e.currentTarget.style.color = '#17171a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(24,24,27,.5)'; }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3l-5 4 5 4"/></svg>
          </button>
        )}
      </div>

      {/* today's snapshot */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(24,24,27,.05)', flexShrink: 0 }}>
        <div className="mono" style={{ fontSize: 9, color: 'rgba(24,24,27,.35)', letterSpacing: 1.2, marginBottom: 8 }}>
          TODAY'S BOARD
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <RoomsAgentStat label="Needs clean"  value={needsClean}  tone="#f59e0b"/>
          <RoomsAgentStat label="In progress"  value={inProgress}  tone="#5b5bf7"/>
          <RoomsAgentStat label="Done"         value={done}        tone="#22c55e"/>
          <RoomsAgentStat label="Unassigned"   value={unassigned}  tone="#ef4444"/>
        </div>
      </div>

      {/* suggestions */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(24,24,27,.05)', flexShrink: 0 }}>
        <div className="mono" style={{ fontSize: 9, color: 'rgba(24,24,27,.35)', letterSpacing: 1.2, marginBottom: 8 }}>
          SUGGESTIONS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <RoomsAgentAction label={`Assign ${unassigned} unassigned rooms`} onClick={onAssignAll}/>
          <RoomsAgentAction label="Group by floor · 3 Maids"/>
          <RoomsAgentAction label="Flag rooms with late checkout"/>
        </div>
      </div>

      {/* chat */}
      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '12px 16px',
        display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => m.role === 'agent' ? (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <img src={window.__resources?.billie_boss_logo_jpg || (window.__resources?.billie_boss_logo_jpg || "billie-boss-logo.jpg")} alt=""
              style={{ width: 22, height: 22, borderRadius: 11, objectFit: 'cover', background: '#fff', flexShrink: 0, marginTop: 2 }}/>
            <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.5, color: 'rgba(24,24,27,.85)',
              fontStyle: m.typing ? 'italic' : 'normal', opacity: m.typing ? .55 : 1 }}>
              {m.content}
            </div>
          </div>
        ) : (
          <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ maxWidth: '85%', fontSize: 12.5, lineHeight: 1.5, color: '#ffffff',
              background: '#17171a', padding: '7px 11px', borderRadius: 10, borderTopRightRadius: 3 }}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* input */}
      <div style={{ padding: '10px 12px 12px', borderTop: '1px solid rgba(24,24,27,.06)', flexShrink: 0,
        display: 'flex', gap: 6, alignItems: 'center',
        background: 'rgba(255,255,255,.02)' }}>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask Billie Boss…"
          style={{ all: 'unset', flex: 1, padding: '8px 12px', borderRadius: 7,
            background: 'rgba(24,24,27,.04)', border: '1px solid rgba(24,24,27,.06)',
            fontSize: 12.5, color: '#17171a', fontFamily: 'inherit' }}/>
        <button onClick={send} disabled={!input.trim()} style={{ all: 'unset', cursor: input.trim() ? 'pointer' : 'not-allowed',
          padding: '8px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
          background: input.trim() ? '#17171a' : 'rgba(24,24,27,.04)',
          color: input.trim() ? '#ffffff' : 'rgba(24,24,27,.35)' }}>
          Send
        </button>
      </div>
    </div>
  );
}

function RoomsAgentStat({ label, value, tone }) {
  return (
    <div style={{ padding: '8px 10px', borderRadius: 6,
      background: 'rgba(255,255,255,.03)', border: '1px solid rgba(24,24,27,.05)',
      display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span className="mono tnum" style={{ fontSize: 18, fontWeight: 700, color: tone, lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: 10, color: 'rgba(24,24,27,.52)' }}>{label}</span>
    </div>
  );
}

function RoomsAgentAction({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ all: 'unset', cursor: 'pointer',
      padding: '8px 10px', borderRadius: 6, fontSize: 11.5, color: 'rgba(24,24,27,.78)',
      background: 'rgba(91,91,247,.1)', border: '1px solid rgba(91,91,247,.25)',
      display: 'flex', alignItems: 'center', gap: 6, transition: 'background .12s' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(91,91,247,.18)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(91,91,247,.1)'}>
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .7, flexShrink: 0 }}>
        <path d="M3 6h6M6 3l3 3-3 3"/>
      </svg>
      {label}
    </button>
  );
}

function RoomsSubTab({ on, onClick, label, count }) {
  return (
    <button onClick={onClick} style={{ all: 'unset', cursor: 'pointer',
      padding: '10px 14px', display: 'inline-flex', alignItems: 'center', gap: 8,
      borderBottom: on ? '2px solid #fbbf24' : '2px solid transparent',
      color: on ? '#fbbf24' : 'rgba(24,24,27,.52)',
      fontSize: 13, fontWeight: 500, marginBottom: -1 }}>
      {label}
      <span style={{ fontSize: 10.5, fontWeight: 700,
        padding: '2px 7px', borderRadius: 10,
        background: on ? 'rgba(251,191,36,.14)' : 'rgba(24,24,27,.05)',
        color: on ? '#fbbf24' : 'rgba(24,24,27,.48)',
        fontFamily: 'var(--mono)', letterSpacing: .4 }}>
        {count}
      </span>
    </button>
  );
}

function RoomsFilterSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ all: 'unset', cursor: 'pointer',
        padding: '7px 28px 7px 12px', borderRadius: 7,
        fontSize: 12, color: 'rgba(24,24,27,.85)',
        background: 'rgba(24,24,27,.035)',
        border: '1px solid rgba(24,24,27,.07)',
        fontFamily: 'inherit',
        appearance: 'none',
        backgroundImage: 'linear-gradient(45deg, transparent 50%, rgba(24,24,27,.48) 50%), linear-gradient(135deg, rgba(24,24,27,.48) 50%, transparent 50%)',
        backgroundPosition: 'calc(100% - 14px) 13px, calc(100% - 10px) 13px',
        backgroundSize: '4px 4px, 4px 4px',
        backgroundRepeat: 'no-repeat' }}>
      {options.map(o => <option key={o} value={o} style={{ background: '#ffffff' }}>{o}</option>)}
    </select>
  );
}

const ROOMS_STATUS_TONES = {
  'Needs Cleaning':   { bg: 'rgba(251,191,36,.16)', fg: '#92400e', border: 'rgba(251,191,36,.45)' },
  'In Progress':      { bg: 'rgba(91,91,247,.12)',  fg: '#3730a3', border: 'rgba(91,91,247,.35)' },
  'Needs Inspection': { bg: 'rgba(249,115,22,.14)', fg: '#9a3412', border: 'rgba(249,115,22,.4)'  },
  'Done':             { bg: 'rgba(34,197,94,.14)',  fg: '#166534', border: 'rgba(34,197,94,.4)'   },
};

function RoomsRow({ r, last, onTogglePriority, onAssign, onStatus, onImpersonate }) {
  const [checked, setChecked] = React.useState(false);
  const tone = ROOMS_STATUS_TONES[r.status] || ROOMS_STATUS_TONES['Needs Cleaning'];
  return (
    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14,
      borderBottom: last ? 'none' : '1px solid rgba(24,24,27,.05)',
      background: r.priority ? 'rgba(251,191,36,.04)' : 'transparent',
      transition: 'background .12s' }}
      onMouseEnter={(e) => e.currentTarget.style.background = r.priority ? 'rgba(251,191,36,.07)' : 'rgba(255,255,255,.03)'}
      onMouseLeave={(e) => e.currentTarget.style.background = r.priority ? 'rgba(251,191,36,.04)' : 'transparent'}>
      {/* checkbox */}
      <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)}
        style={{ width: 15, height: 15, accentColor: '#fbbf24', cursor: 'pointer' }}/>

      {/* room number */}
      <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: '#17171a',
        letterSpacing: .3, minWidth: 60 }}>
        {r.n}
      </span>

      {/* floor tag */}
      <span className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.35)', letterSpacing: .6 }}>
        {r.floor}
      </span>

      <span style={{ flex: 1 }}/>

      {/* assign to */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.42)', letterSpacing: .8, whiteSpace: 'nowrap' }}>
          ASSIGN TO
        </span>
        <select value={r.assignee} onChange={(e) => onAssign(e.target.value)}
          style={{ all: 'unset', cursor: 'pointer',
            padding: '4px 24px 4px 10px', borderRadius: 5,
            fontSize: 11.5, color: r.assignee === 'Unassigned' ? 'rgba(24,24,27,.52)' : '#17171a',
            fontWeight: r.assignee.startsWith('Maid') ? 600 : 500,
            background: 'rgba(24,24,27,.035)',
            border: '1px solid rgba(24,24,27,.07)',
            whiteSpace: 'nowrap',
            appearance: 'none',
            backgroundImage: 'linear-gradient(45deg, transparent 50%, rgba(24,24,27,.35) 50%), linear-gradient(135deg, rgba(24,24,27,.35) 50%, transparent 50%)',
            backgroundPosition: 'calc(100% - 11px) 10px, calc(100% - 8px) 10px',
            backgroundSize: '3.5px 3.5px, 3.5px 3.5px',
            backgroundRepeat: 'no-repeat' }}>
          {['Unassigned', 'Maid 1', 'Maid 2', 'Maid 3', 'Maid 4', 'Maid 5'].map(a =>
            <option key={a} style={{ background: '#ffffff' }}>{a}</option>
          )}
        </select>
        {r.assignee.startsWith('BILLIE') && false && (
          <button onClick={() => onImpersonate?.(r.assignee)}
            title={`Impersonate ${r.assignee}`}
            style={{ all: 'unset', cursor: 'pointer',
              width: 24, height: 24, borderRadius: 5,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(91,91,247,.08)', border: '1px solid rgba(91,91,247,.18)',
              color: '#4141e0', flexShrink: 0 }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(91,91,247,.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(91,91,247,.08)'}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="5" r="2.4"/><path d="M2.5 12c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4"/>
            </svg>
          </button>
        )}
      </div>

      {/* status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.42)', letterSpacing: .8, whiteSpace: 'nowrap' }}>
          STATUS
        </span>
        <select value={r.status} onChange={(e) => onStatus(e.target.value)}
          style={{ all: 'unset', cursor: 'pointer',
            padding: '4px 24px 4px 10px', borderRadius: 5,
            fontSize: 11.5, color: tone.fg, fontWeight: 600,
            background: tone.bg, border: `1px solid ${tone.border}`,
            appearance: 'none',
            backgroundImage: `linear-gradient(45deg, transparent 50%, ${tone.fg} 50%), linear-gradient(135deg, ${tone.fg} 50%, transparent 50%), linear-gradient(to right, ${tone.bg}, ${tone.bg})`,
            backgroundPosition: 'calc(100% - 11px) 10px, calc(100% - 8px) 10px, 0 0',
            backgroundSize: '3.5px 3.5px, 3.5px 3.5px, 100% 100%',
            backgroundRepeat: 'no-repeat' }}>
          {['Needs Cleaning', 'In Progress', 'Needs Inspection', 'Done'].map(s =>
            <option key={s} style={{ background: '#ffffff', color: '#17171a' }}>{s}</option>
          )}
        </select>
      </div>

      {/* priority */}
      <button onClick={onTogglePriority} style={{ all: 'unset', cursor: 'pointer',
        padding: '5px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 500,
        color: r.priority ? '#fbbf24' : 'rgba(24,24,27,.62)',
        background: r.priority ? 'rgba(251,191,36,.1)' : 'rgba(24,24,27,.035)',
        border: `1px solid ${r.priority ? 'rgba(251,191,36,.4)' : 'rgba(24,24,27,.08)'}`,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        whiteSpace: 'nowrap', flexShrink: 0 }}>
        <span>⚑</span>
        {r.priority ? 'Priority' : 'Mark as priority'}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Activity Log — terminal-style live feed
// ═══════════════════════════════════════════════════════════════
const LOG_TONES = {
  STATE:      '#a78bfa',  // purple
  DISPATCH:   '#a78bfa',
  ASSIGN:     '#a78bfa',
  PASS:       '#22c55e',  // green
  RELEASE:    '#22c55e',
  CHARGE:     '#22c55e',
  WARN:       '#f59e0b',  // amber
  FAIL:       '#ef4444',  // red
  OFFLINE:    '#ef4444',
  INTERVENE:  '#06b6d4',  // teal
  TICK:       '#94a3b8',  // gray
  REPORT:     '#fbbf24',  // yellow
};

const LOG_ENTRIES = [
  { t: '14:32:08', src: 'BILLIE-08',  kw: 'STATE',     rest: 'entered phase=bathroom_mirror rm=1210' },
  { t: '14:31:52', src: 'BILLIE-12',  kw: 'STATE',     rest: 'entered phase=bedroom_vacuum rm=1216' },
  { t: '14:31:45', src: 'PMS',        kw: 'RELEASE',   rest: 'rm=3238 status=clean report=#r-2984' },
  { t: '14:31:20', src: 'BILLIE-08',  kw: 'REPORT',    rest: 'submitted rm=3238 edits=0 duration=17m55s' },
  { t: '14:30:55', src: 'INSPECTOR',  kw: 'PASS',      rest: 'rm=3238 by=mrossi' },
  { t: '14:28:02', src: 'BILLIE-12',  kw: 'WARN',      rest: 'water tank low (18%) — auto-topup scheduled' },
  { t: '14:26:14', src: 'INSPECTOR',  kw: 'FAIL',      rest: 'rm=1211 reason="streak on bath mirror" by=mrossi' },
  { t: '14:26:05', src: 'BILLIE-12',  kw: 'INTERVENE', rest: 'rm=1211 human took control 00:42' },
  { t: '14:25:11', src: 'BILLIE-12',  kw: 'WARN',      rest: 'obstacle detected (chair) rm=1211' },
  { t: '14:20:33', src: 'BILLIE-08',  kw: 'DISPATCH',  rest: 'assigned rm=1210 from queue' },
  { t: '14:20:12', src: 'DISPATCHER', kw: 'ASSIGN',    rest: 'BILLIE-08 ← rm=1210 (priority=stayover)' },
  { t: '14:18:07', src: 'BILLIE-08',  kw: 'CHARGE',    rest: 'complete 100% — returning to duty' },
  { t: '14:02:55', src: 'PMS',        kw: 'RELEASE',   rest: 'rm=1214 status=clean' },
  { t: '14:00:00', src: 'SYSTEM',     kw: 'TICK',      rest: 'hourly heartbeat · 4 bots online · 32 rooms tracked' },
  { t: '13:58:12', src: 'BILLIE-08',  kw: 'STATE',     rest: 'entered phase=bed_strip rm=1211' },
  { t: '13:54:00', src: 'INSPECTOR',  kw: 'PASS',      rest: 'rm=1214 by=mrossi edits=1' },
  { t: '13:48:22', src: 'BILLIE-14',  kw: 'OFFLINE',   rest: 'docked for scheduled maintenance (battery cycle #412)' },
  { t: '13:44:18', src: 'BILLIE-12',  kw: 'STATE',     rest: 'entered phase=trash_out rm=1216' },
  { t: '13:42:03', src: 'PMS',        kw: 'RELEASE',   rest: 'rm=1216 status=checkout report=#r-2983' },
  { t: '13:38:55', src: 'BILLIE-08',  kw: 'REPORT',    rest: 'submitted rm=1211 edits=1 duration=19m08s' },
  { t: '13:36:40', src: 'INSPECTOR',  kw: 'PASS',      rest: 'rm=1211 by=mrossi edits=1' },
  { t: '13:30:00', src: 'SYSTEM',     kw: 'TICK',      rest: 'hourly heartbeat · 4 bots online · 28 rooms tracked' },
  { t: '13:25:44', src: 'DISPATCHER', kw: 'ASSIGN',    rest: 'BILLIE-12 ← rm=1216 (priority=checkout)' },
  { t: '13:22:11', src: 'BILLIE-12',  kw: 'CHARGE',    rest: 'starting cycle from 34% → target 100%' },
  { t: '13:10:07', src: 'BILLIE-08',  kw: 'STATE',     rest: 'entered phase=bathroom_mirror rm=1211' },
  { t: '13:02:33', src: 'BILLIE-08',  kw: 'DISPATCH',  rest: 'assigned rm=1211 from queue' },
];

// ═══════════════════════════════════════════════════════════════
// Shifts — past shift records (inner tab of Activity Log)
// ═══════════════════════════════════════════════════════════════
const SHIFT_RECORDS = [
  { id: 'sh-241', date: 'Today', label: 'Morning · 06:00–14:00', property: '🇮🇹 Marriott Rome',
    operator: { name: 'Dr. Sarah Chen', init: 'SC', color: '#f59e0b' },
    robot: 'Billie-08', rooms: 18, interventions: 3,
    duration: '7h 58m', status: 'completed',
    note: 'Routine morning run. 2 water refills. 1 guest encounter on Fl.12, handled politely. Billie-08 flagged RM 1211 bath mirror streak (FAIL by mrossi) — investigated, cloth worn. Swapped.',
    recLen: '7:58:02' },
  { id: 'sh-240', date: 'Today', label: 'Morning · 06:00–14:00', property: '🇫🇷 Accor Paris',
    operator: { name: 'M. Rivera', init: 'MR', color: '#6366f1' },
    robot: 'Billie-12', rooms: 22, interventions: 5,
    duration: '7h 54m', status: 'completed',
    note: 'Heavy checkout day (fashion week). 3 obstacles (luggage), 1 stuck at lift (solved in 42s), 1 minibar mismatch flagged for shift lead. Overall clean run.',
    recLen: '7:54:11' },
  { id: 'sh-239', date: 'Yesterday', label: 'Evening · 14:00–22:00', property: '🇮🇹 Marriott Rome',
    operator: { name: 'Ivy Nakamura', init: 'IN', color: '#10b981' },
    robot: 'Billie-17', rooms: 16, interventions: 2,
    duration: '8h 02m', status: 'completed',
    note: 'Quiet evening shift. One bathroom blockage (towel rack) resolved via skip+flag. Docked early at 21:58.',
    recLen: '8:02:44' },
  { id: 'sh-238', date: 'Yesterday', label: 'Morning · 06:00–14:00', property: '🇩🇪 Steigenberger Berlin',
    operator: { name: 'P. Jansen', init: 'PJ', color: '#a78bfa' },
    robot: 'Billie-22', rooms: 14, interventions: 7,
    duration: '7h 45m', status: 'flagged',
    note: 'Several vision failures in low-light rooms (Fl.3). 7 operator interventions logged. Recommend firmware update billie-os 1.8.3 before next run on this floor.',
    recLen: '7:45:12' },
  { id: 'sh-237', date: 'Yesterday', label: 'Night · 22:00–06:00', property: '🇧🇪 Cardo Brussels',
    operator: { name: 'L. Dubois', init: 'LD', color: '#ef4444' },
    robot: 'Billie-29', rooms: 9, interventions: 1,
    duration: '7h 51m', status: 'completed',
    note: 'Overnight turndown only. One lift-priority swap, resolved. No incidents.',
    recLen: '7:51:08' },
  { id: 'sh-236', date: '2 days ago', label: 'Morning · 06:00–14:00', property: '🇮🇹 Marriott Rome',
    operator: { name: 'Dr. Sarah Chen', init: 'SC', color: '#f59e0b' },
    robot: 'Billie-08', rooms: 20, interventions: 4,
    duration: '8h 00m', status: 'completed',
    note: 'Smooth run. Refilled supplies once at 10:12. All reports submitted. Inspector passes: 19/20.',
    recLen: '8:00:21' },
  { id: 'sh-235', date: '2 days ago', label: 'Evening · 14:00–22:00', property: '🇫🇷 Accor Paris',
    operator: { name: 'M. Rivera', init: 'MR', color: '#6366f1' },
    robot: 'Billie-12', rooms: 17, interventions: 6,
    duration: '7h 56m', status: 'flagged',
    note: '6 interventions — one repeated knock-and-wait on Fl.7 (no-show guest). Recommend SMS fallback policy review with hotel ops.',
    recLen: '7:56:33' },
];

function ShiftsTable() {
  const [selected, setSelected] = React.useState(null);
  const sh = selected ? SHIFT_RECORDS.find(s => s.id === selected) : null;
  const [modal, setModal] = React.useState(null); // 'rec' | 'notes' | null

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(24,24,27,.1)', borderRadius: 10,
      overflow: 'hidden' }}>
      {/* column header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '140px 200px 1fr 130px 110px 110px 200px',
        gap: 12, padding: '10px 16px',
        background: '#f7f7f5', borderBottom: '1px solid rgba(24,24,27,.08)',
        fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
        color: 'rgba(24,24,27,.5)', letterSpacing: 1,
      }}>
        <div>SHIFT</div>
        <div>PROPERTY</div>
        <div>OPERATOR / ROBOT</div>
        <div style={{ textAlign: 'right' }}>ROOMS</div>
        <div style={{ textAlign: 'right' }}>INTERVENE</div>
        <div>STATUS</div>
        <div style={{ textAlign: 'right' }}>ACTIONS</div>
      </div>
      {SHIFT_RECORDS.map((s, i) => {
        const failed = s.status === 'flagged';
        return (
          <div key={s.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 200px 1fr 130px 110px 110px 200px',
              gap: 12, padding: '14px 16px', alignItems: 'center',
              borderBottom: i < SHIFT_RECORDS.length - 1 ? '1px solid rgba(24,24,27,.06)' : 'none',
              fontSize: 13, color: '#17171a',
              background: '#fff',
            }}>
            {/* shift */}
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#17171a' }}>{s.date}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.5)' }}>{s.label}</div>
            </div>
            {/* property */}
            <div style={{ fontSize: 13, color: 'rgba(24,24,27,.82)' }}>{s.property}</div>
            {/* operator/robot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 26, height: 26, borderRadius: 13, background: s.operator.color,
                color: '#fff', fontSize: 10, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{s.operator.init}</span>
              <div style={{ lineHeight: 1.25, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#17171a',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.operator.name}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.5)' }}>{s.robot}</div>
              </div>
            </div>
            {/* rooms */}
            <div className="mono tnum" style={{ textAlign: 'right', fontSize: 14, fontWeight: 600, color: '#17171a' }}>
              {s.rooms}
            </div>
            {/* interventions */}
            <div className="mono tnum" style={{
              textAlign: 'right', fontSize: 14, fontWeight: 600,
              color: s.interventions >= 5 ? '#b45309' : s.interventions >= 3 ? '#a16207' : 'rgba(24,24,27,.7)',
            }}>
              {s.interventions}×
            </div>
            {/* status */}
            <div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 8px', borderRadius: 10,
                background: failed ? 'rgba(251,191,36,.15)' : 'rgba(34,197,94,.12)',
                color: failed ? '#92400e' : '#166534',
                fontSize: 10, fontWeight: 700, letterSpacing: .3,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: 3,
                  background: failed ? '#f59e0b' : '#22c55e' }}/>
                {failed ? 'FLAGGED' : 'DONE'}
              </span>
            </div>
            {/* actions */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button onClick={() => { setSelected(s.id); setModal('rec'); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 4,
                  border: '1px solid rgba(24,24,27,.12)',
                  background: '#fff', color: '#17171a',
                  fontSize: 11, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f7f7f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3,2 12,7 3,12" fill="currentColor" stroke="none"/>
                </svg>
                Recording
              </button>
              <button onClick={() => { setSelected(s.id); setModal('notes'); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 4,
                  border: '1px solid rgba(24,24,27,.12)',
                  background: '#fff', color: '#17171a',
                  fontSize: 11, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f7f7f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2h6l2 2v8H3zM5 6h4M5 8h4M5 10h3"/>
                </svg>
                Notes
              </button>
            </div>
          </div>
        );
      })}
      {/* modal */}
      {modal && sh && (
        <div onClick={() => setModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(24,24,27,.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
            backdropFilter: 'blur(4px)' }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: modal === 'rec' ? 760 : 520,
              background: '#fff', borderRadius: 12, overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,.3)' }}>
            {/* header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(24,24,27,.08)',
              display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#17171a' }}>
                  {modal === 'rec' ? 'Shift recording' : 'Shift notes'}
                </div>
                <div className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.55)', marginTop: 2 }}>
                  {sh.date.toUpperCase()} · {sh.label.toUpperCase()} · {sh.robot.toUpperCase()}
                </div>
              </div>
              <button onClick={() => setModal(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer',
                  color: 'rgba(24,24,27,.5)', width: 26, height: 26, borderRadius: 4,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>
              </button>
            </div>
            {/* body */}
            <div style={{ padding: 20 }}>
              {modal === 'rec' ? (
                <div>
                  {/* fake video pane */}
                  <div style={{
                    aspectRatio: '16/9', background: '#0a0a0c', borderRadius: 8,
                    position: 'relative', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(91,91,247,.15), transparent 60%)',
                  }}>
                    {/* simulated first-person tile */}
                    <div style={{ position: 'absolute', inset: 0,
                      background: 'repeating-linear-gradient(0deg, rgba(255,255,255,.02) 0 2px, transparent 2px 4px)' }}/>
                    <div className="mono" style={{
                      color: 'rgba(255,255,255,.45)', fontSize: 11, letterSpacing: 1,
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 42, marginBottom: 8 }}>▶</div>
                      FIRST-PERSON FEED · {sh.recLen}<br/>
                      <span style={{ opacity: .6 }}>{sh.rooms} rooms · {sh.interventions} interventions indexed</span>
                    </div>
                    {/* top-left hud */}
                    <div style={{ position: 'absolute', top: 10, left: 12,
                      fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,.6)',
                      letterSpacing: .8 }}>
                      REC · {sh.robot.toUpperCase()} · {sh.date.toUpperCase()}
                    </div>
                    {/* bottom scrub */}
                    <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12,
                      display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.7)' }}>00:00</div>
                      <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,.15)',
                        borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: '0%', height: '100%', background: '#fbbf24' }}/>
                      </div>
                      <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.7)' }}>{sh.recLen}</div>
                    </div>
                  </div>
                  {/* intervention markers */}
                  <div style={{ marginTop: 14 }}>
                    <div className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.5)',
                      letterSpacing: 1, marginBottom: 8 }}>JUMP TO INTERVENTION</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {Array.from({ length: sh.interventions }).map((_, i) => (
                        <button key={i}
                          style={{
                            padding: '4px 9px', borderRadius: 4,
                            border: '1px solid rgba(24,24,27,.12)',
                            background: '#fff', fontSize: 11, fontFamily: 'var(--mono)',
                            color: '#17171a', cursor: 'pointer',
                          }}>
                          {String(i+1).padStart(2,'0')} · {String(Math.floor((i+1) * (7/sh.interventions))).padStart(2,'0')}:{String(Math.floor(Math.random()*59)).padStart(2,'0')}:{String(Math.floor(Math.random()*59)).padStart(2,'0')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 14,
                    padding: 12, borderRadius: 8, background: '#f7f7f5' }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: 16, background: sh.operator.color,
                      color: '#fff', fontSize: 11, fontWeight: 700,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>{sh.operator.init}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#17171a' }}>{sh.operator.name}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.55)' }}>
                        {sh.duration.toUpperCase()} · {sh.rooms} ROOMS · {sh.interventions} INTERVENTIONS
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.55, color: '#17171a' }}>
                    {sh.note}
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => setModal(null)}
                      style={{ padding: '7px 14px', borderRadius: 5,
                        border: '1px solid rgba(24,24,27,.12)',
                        background: '#fff', fontSize: 12, fontFamily: 'inherit',
                        color: '#17171a', cursor: 'pointer', fontWeight: 500 }}>
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityLog() {
  const [innerTab, setInnerTab] = React.useState('shifts'); // 'live' | 'shifts'
  const [filter, setFilter] = React.useState('all');
  const CHIPS = [
    { id: 'all',        label: 'all' },
    { id: 'BILLIE-08',  label: 'BILLIE-08' },
    { id: 'BILLIE-12',  label: 'BILLIE-12' },
    { id: 'errors',     label: 'errors only' },
    { id: 'interventions', label: 'interventions' },
    { id: 'pms',        label: 'PMS events' },
  ];
  const matches = (e) => {
    if (filter === 'all') return true;
    if (filter === 'errors') return ['WARN','FAIL','OFFLINE'].includes(e.kw);
    if (filter === 'interventions') return e.kw === 'INTERVENE';
    if (filter === 'pms') return e.src === 'PMS';
    return e.src === filter;
  };
  const rows = LOG_ENTRIES.filter(matches);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto',
      padding: '28px 44px 44px', background: '#fbfbfa', fontFamily: 'Inter, var(--sans)' }}>
      {/* breadcrumb */}
      <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4,
        color: 'rgba(24,24,27,.42)', marginBottom: 8, textTransform: 'uppercase' }}>
        Activity log · {innerTab === 'live' ? 'live feed' : 'shift history'}
      </div>
      {/* title */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700, letterSpacing: -.4, color: '#17171a',
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          Activity log
        </h1>
        <span className="mono" style={{ fontSize: 13, color: 'rgba(24,24,27,.4)', whiteSpace: 'nowrap' }}>
          · {innerTab === 'live' ? `${LOG_ENTRIES.length} events` : `${SHIFT_RECORDS.length} shifts logged`}
        </span>
        <span style={{ flex: 1 }}/>
        {innerTab === 'live' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 8px', borderRadius: 10, background: 'rgba(34,197,94,.1)',
            fontSize: 10, fontWeight: 700, color: '#166534', letterSpacing: .3 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#22c55e',
              boxShadow: '0 0 6px #22c55e', animation: 'billPulse 1.4s ease-in-out infinite' }}/>
            LIVE
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: 'rgba(24,24,27,.55)', marginBottom: 18 }}>
        {innerTab === 'live'
          ? 'Every Billie action, dispatcher call, and PMS event — streamed in real time.'
          : 'Past shifts — robot, operator on duty, intervention count. View the first-person recording or read shift notes.'}
      </div>

      {/* inner tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18,
        borderBottom: '1px solid rgba(24,24,27,.1)' }}>
        {[
          { v: 'shifts', label: 'Shifts',     sub: `${SHIFT_RECORDS.length} records` },
          { v: 'live',   label: 'Live feed',  sub: `${LOG_ENTRIES.length} events` },
        ].map(t => {
          const on = innerTab === t.v;
          return (
            <button key={t.v} onClick={() => setInnerTab(t.v)}
              style={{
                all: 'unset', cursor: 'pointer',
                padding: '10px 16px 11px',
                borderBottom: `2px solid ${on ? '#17171a' : 'transparent'}`,
                marginBottom: -1,
                display: 'inline-flex', alignItems: 'baseline', gap: 8,
                color: on ? '#17171a' : 'rgba(24,24,27,.55)',
                fontWeight: on ? 600 : 500, fontSize: 14,
                transition: 'color .12s, border-color .12s',
              }}>
              <span>{t.label}</span>
              <span className="mono" style={{ fontSize: 10.5,
                color: 'rgba(24,24,27,.4)', fontWeight: 500 }}>{t.sub}</span>
            </button>
          );
        })}
      </div>

      {innerTab === 'live' && (<>
      {/* filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {CHIPS.map(c => {
          const on = filter === c.id;
          return (
            <button key={c.id} onClick={() => setFilter(c.id)}
              style={{ all: 'unset', cursor: 'pointer',
                padding: '6px 14px', borderRadius: 999,
                fontSize: 12, fontWeight: 600, letterSpacing: .1,
                color: on ? '#451a03' : 'rgba(24,24,27,.68)',
                background: on ? '#fbbf24' : '#ffffff',
                border: `1px solid ${on ? 'rgba(251,191,36,.55)' : 'rgba(24,24,27,.12)'}`,
                fontFamily: /^BILLIE/.test(c.id) ? 'var(--mono)' : 'inherit',
                whiteSpace: 'nowrap',
                transition: 'background .1s, color .1s' }}>
              {c.label}
            </button>
          );
        })}
      </div>

      {/* terminal */}
      <div style={{ background: '#0a0a0c', border: '1px solid #1c1c20',
        borderRadius: 10, padding: '18px 22px',
        fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.9,
        color: 'rgba(255,255,255,.72)',
        boxShadow: '0 20px 40px -24px rgba(0,0,0,.5)',
        maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
        {rows.map((e, i) => {
          const tone = LOG_TONES[e.kw] || '#a78bfa';
          const srcIsBillie = /^BILLIE/.test(e.src);
          return (
            <div key={i} style={{ whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis' }}>
              <span style={{ color: 'rgba(255,255,255,.4)' }}>{e.t}</span>
              <span style={{ marginLeft: 14,
                color: srcIsBillie ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.65)',
                fontWeight: srcIsBillie ? 600 : 500 }}>{e.src}</span>
              <span style={{ marginLeft: 14, color: tone, fontWeight: 700 }}>{e.kw}</span>
              <span style={{ marginLeft: 14, color: 'rgba(255,255,255,.78)' }}>{e.rest}</span>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,.35)', fontStyle: 'italic' }}>
            No events match this filter.
          </div>
        )}
      </div>
      </>)}

      {innerTab === 'shifts' && <ShiftsTable/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BrainView — AI Brain with sub-tabs: Agents · Data labeling · Training
// ═══════════════════════════════════════════════════════════════

const BRAIN_AI_TASKS = [
  { name: 'turn on the bathroom light',          ok: 229, total: 240, trend: +0.4 },
  { name: 'pick up towel from floor',            ok: 182, total: 196, trend: +1.1 },
  { name: 'restock mini-bar · 6-unit tray',      ok: 147, total: 158, trend: +0.8 },
  { name: 'fold top sheet · king',               ok: 118, total: 134, trend: -0.3 },
  { name: 'open cabinet 2 · room type 1',        ok:  16, total:  22, trend: +1.9 },
  { name: 'hilton-berlin-ai · open toilet lid',  ok:  19, total:  35, trend: -2.2 },
  { name: 'open cabinet 1 · room type 2',        ok:  11, total:  24, trend: +0.6 },
  { name: 'place coffee pod in machine',         ok:  58, total:  74, trend: +0.2 },
];

function BrainView({ goto }) {
  const [sub, setSub] = React.useState(() => {
    try {
      const v = localStorage.getItem('bb_brain_sub');
      return (v === 'agents' || v === 'labeling' || v === 'training') ? v : 'agents';
    } catch { return 'agents'; }
  });
  React.useEffect(() => { try { localStorage.setItem('bb_brain_sub', sub); } catch {} }, [sub]);

  const subs = [
    { id: 'agents',   label: 'AI Agents',     sub: '14 live · 2 drafts' },
    { id: 'labeling', label: 'Data labeling', sub: '2,314 in queue' },
    { id: 'training', label: 'Model training', sub: '3 runs this week' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#fbfbfa', overflow: 'hidden' }}>
      {/* top bar */}
      <div style={{ display: 'flex', flexDirection: 'column',
        padding: '18px 40px 0', borderBottom: '1px solid rgba(24,24,27,.06)',
        background: '#fff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 14 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4,
            color: 'rgba(24,24,27,.35)' }}>AI BRAIN</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#17171a', letterSpacing: -0.3 }}>
            {subs.find(s => s.id === sub)?.label}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
          {subs.map(s => (
            <button key={s.id} onClick={() => setSub(s.id)}
              style={{ all: 'unset', cursor: 'pointer',
                padding: '10px 16px 12px',
                fontSize: 13, fontWeight: sub === s.id ? 600 : 500,
                color: sub === s.id ? '#17171a' : 'rgba(24,24,27,.52)',
                borderBottom: sub === s.id ? '2px solid #17171a' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: 8 }}>
              {s.label}
              <span className="mono" style={{ fontSize: 9.5, letterSpacing: .8,
                color: 'rgba(24,24,27,.35)', fontWeight: 400 }}>
                {s.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {sub === 'agents' ? <BrainAgents goto={goto}/>
          : sub === 'labeling' ? <BrainLabeling/>
          : <BrainTraining/>}
      </div>
    </div>
  );
}

// ─── Sub-view: AI Agents ─────────────────────────────────────────
const BRAIN_AGENTS = [
  { id: 'ag-01', name: 'Dispatcher',      status: 'live', role: 'Room assignment + priority queue',
    calls: '2,184/day', accuracy: '98.2%', lastTrained: '3d ago', owner: 'Ops', color: '#5b5bf7' },
  { id: 'ag-02', name: 'Vision · Towel fold', status: 'live', role: 'Detect fold compliance on bath towels',
    calls: '1,220/day', accuracy: '96.8%', lastTrained: '1w ago', owner: 'Vision', color: '#22c55e' },
  { id: 'ag-03', name: 'Vision · Bed make', status: 'live', role: 'Detect pillow + duvet alignment',
    calls: '980/day', accuracy: '94.1%', lastTrained: '1w ago', owner: 'Vision', color: '#22c55e' },
  { id: 'ag-04', name: 'Mini-bar OCR',    status: 'live', role: 'Read labels + count bottles',
    calls: '640/day', accuracy: '99.1%', lastTrained: '2w ago', owner: 'Vision', color: '#22c55e' },
  { id: 'ag-05', name: 'Grip planner',    status: 'live', role: 'Plan arm trajectory for unknown objects',
    calls: '3,402/day', accuracy: '92.4%', lastTrained: '2d ago', owner: 'Manip', color: '#fbbf24' },
  { id: 'ag-06', name: 'Escalation triage', status: 'live', role: 'Classify help-requests by urgency',
    calls: '48/day', accuracy: '97.0%', lastTrained: '5d ago', owner: 'Ops', color: '#5b5bf7' },
  { id: 'ag-07', name: 'Path planner',    status: 'live', role: 'Navigate hallways + avoid guests',
    calls: '5,100/day', accuracy: '99.6%', lastTrained: '1d ago', owner: 'Nav', color: '#06b6d4' },
  { id: 'ag-08', name: 'Guest-presence detector', status: 'live', role: 'Abort entry if occupant detected',
    calls: '2,020/day', accuracy: '99.9%', lastTrained: '2w ago', owner: 'Safety', color: '#ef4444' },
  { id: 'ag-09', name: 'Voice summarizer', status: 'live', role: 'Transcribe operator handoff notes',
    calls: '130/day', accuracy: '95.2%', lastTrained: '3w ago', owner: 'Ops', color: '#5b5bf7' },
  { id: 'ag-10', name: 'Inspection QA',   status: 'live', role: 'Rate room after completion · 18 checks',
    calls: '310/day', accuracy: '96.5%', lastTrained: '4d ago', owner: 'QA', color: '#f97316' },
  { id: 'ag-11', name: 'Consumable forecaster', status: 'draft', role: 'Predict amenity restock needs per floor',
    calls: '—',        accuracy: '—',     lastTrained: 'never',  owner: 'Ops', color: '#5b5bf7' },
  { id: 'ag-12', name: 'Guest-language router', status: 'draft', role: 'Route operator chat by detected language',
    calls: '—',        accuracy: '—',     lastTrained: 'never',  owner: 'Ops', color: '#5b5bf7' },
];

function BrainAgents({ goto }) {
  const [q, setQ] = React.useState('');
  const filtered = BRAIN_AGENTS.filter(a =>
    !q || a.name.toLowerCase().includes(q.toLowerCase()) || a.role.toLowerCase().includes(q.toLowerCase()));
  const live = BRAIN_AGENTS.filter(a => a.status === 'live').length;
  const draft = BRAIN_AGENTS.filter(a => a.status === 'draft').length;
  return (
    <div style={{ padding: '22px 40px 40px' }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        {[
          { k: 'Live agents',       v: String(live),  sub: 'shipping decisions' },
          { k: 'Drafts',            v: String(draft), sub: 'in review' },
          { k: 'Calls · last 24h',  v: '16.2k',       sub: '+8% vs yday' },
          { k: 'Avg accuracy',      v: '96.7%',       sub: 'across live agents' },
        ].map((x,i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid rgba(24,24,27,.08)',
            borderRadius: 10, padding: 14 }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: 1.2,
              color: 'rgba(24,24,27,.4)', textTransform: 'uppercase' }}>{x.k}</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: '#17171a', marginTop: 6 }}>{x.v}</div>
            <div style={{ fontSize: 11, color: 'rgba(24,24,27,.52)', marginTop: 2 }}>{x.sub}</div>
          </div>
        ))}
      </div>

      {/* search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: '0 0 300px', display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 12px', borderRadius: 7,
          background: '#fff', border: '1px solid rgba(24,24,27,.09)' }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="rgba(24,24,27,.48)" strokeWidth="1.6">
            <circle cx="7" cy="7" r="4.5"/><path d="M13 13l-2.5-2.5" strokeLinecap="round"/>
          </svg>
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search agents..."
            style={{ all: 'unset', flex: 1, fontSize: 12, color: '#17171a', fontFamily: 'inherit' }}/>
        </div>
        <span style={{ flex: 1 }}/>
        <button style={{ all: 'unset', cursor: 'pointer',
          padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600,
          background: '#17171a', color: '#fff' }}>
          + New agent
        </button>
      </div>

      {/* table */}
      <div style={{ background: '#fff', border: '1px solid rgba(24,24,27,.08)', borderRadius: 10,
        overflow: 'hidden' }}>
        <div style={{ display: 'grid',
          gridTemplateColumns: '1.6fr 2.2fr 120px 110px 110px 110px 80px',
          alignItems: 'center', padding: '10px 14px',
          background: 'rgba(24,24,27,.025)', borderBottom: '1px solid rgba(24,24,27,.06)',
          fontSize: 10, letterSpacing: 1, color: 'rgba(24,24,27,.45)', textTransform: 'uppercase' }}>
          <div>Agent</div><div>Role</div><div>Owner</div>
          <div>Calls</div><div>Accuracy</div><div>Trained</div><div style={{ textAlign: 'right' }}>Status</div>
        </div>
        {filtered.map((a,i) => (
          <div key={a.id} style={{ display: 'grid',
            gridTemplateColumns: '1.6fr 2.2fr 120px 110px 110px 110px 80px',
            alignItems: 'center', padding: '14px 14px', gap: 8,
            borderBottom: i < filtered.length - 1 ? '1px solid rgba(24,24,27,.05)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: a.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 11, fontWeight: 700 }}>
                {a.name.split(' ')[0].slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#17171a' }}>{a.name}</div>
                <div className="mono" style={{ fontSize: 9.5, letterSpacing: .6,
                  color: 'rgba(24,24,27,.4)' }}>{a.id}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(24,24,27,.68)' }}>{a.role}</div>
            <div style={{ fontSize: 12, color: 'rgba(24,24,27,.68)' }}>{a.owner}</div>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(24,24,27,.6)' }}>{a.calls}</div>
            <div className="mono" style={{ fontSize: 11, color: '#17171a', fontWeight: 500 }}>{a.accuracy}</div>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(24,24,27,.52)' }}>{a.lastTrained}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {a.status === 'live' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 8px', borderRadius: 5,
                  background: 'rgba(34,197,94,.12)', color: '#15803d',
                  fontSize: 10, fontWeight: 600, letterSpacing: .3 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }}/>
                  LIVE
                </span>
              ) : (
                <span style={{ padding: '3px 8px', borderRadius: 5,
                  background: 'rgba(24,24,27,.06)', color: 'rgba(24,24,27,.55)',
                  fontSize: 10, fontWeight: 600, letterSpacing: .3 }}>
                  DRAFT
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sub-view: Your impact ───────────────────────────────────────
function BrainImpact({ goto }) {
  return (
    <div style={{ padding: '22px 40px 40px' }}>
      <MyImpactPanel goto={goto}/>
    </div>
  );
}

// ─── Sub-view: Autonomy analysis (week view) ─────────────────────
const AUTO_WEEK = [
  { d: 'Mon', v: 78, rooms:  96, teleop: 21, flagged:  8 },
  { d: 'Tue', v: 82, rooms: 104, teleop: 19, flagged:  6 },
  { d: 'Wed', v: 74, rooms:  88, teleop: 23, flagged: 11 },
  { d: 'Thu', v: 85, rooms: 112, teleop: 17, flagged:  5 },
  { d: 'Fri', v: 88, rooms: 118, teleop: 14, flagged:  4 },
  { d: 'Sat', v: 80, rooms:  92, teleop: 18, flagged:  7 },
  { d: 'Sun', v: 86, rooms: 107, teleop: 15, flagged:  5 },
  { d: 'Today', v: 91, rooms: 14, teleop: 1, flagged: 0, partial: true },
];

const AUTO_BREAKDOWN = [
  { cat: 'grip · unknown object',        n: 48, delta: -0.6 },
  { cat: 'mini-bar · occluded bottle',   n: 32, delta: +0.4 },
  { cat: 'narrow-gap nav (≤ 0.85 m)',    n: 28, delta: -1.2 },
  { cat: 'bathroom · open toilet lid',   n: 24, delta: +2.1 },
  { cat: 'pillow alignment · retry',     n: 19, delta: -0.3 },
  { cat: 'guest-presence false positive',n: 14, delta: -0.1 },
  { cat: 'cabinet door (type-2 room)',   n: 11, delta: -0.8 },
  { cat: 'coffee-pod seating',           n:  9, delta: +0.2 },
];

const AUTO_PER_BILLIE = [
  { id: 'Billie-08', flag: '🇮🇹', v: 94, rooms: 92,  trend: +1.2 },
  { id: 'Billie-12', flag: '🇮🇹', v: 91, rooms: 88,  trend: +0.4 },
  { id: 'Billie-03', flag: '🇩🇪', v: 88, rooms: 81,  trend: -0.3 },
  { id: 'Billie-05', flag: '🇫🇷', v: 86, rooms: 77,  trend: +0.8 },
  { id: 'Billie-09', flag: '🇬🇧', v: 92, rooms: 84,  trend: +0.6 },
  { id: 'Billie-14', flag: '🇺🇸', v: 74, rooms: 62,  trend: -1.1 },
  { id: 'Billie-17', flag: '🇯🇵', v: 89, rooms: 79,  trend: +0.9 },
  { id: 'Billie-21', flag: '🇪🇸', v: 68, rooms: 54,  trend: -2.4 },
];

function BrainAutonomyWeek() {
  const totalRooms   = AUTO_WEEK.reduce((s,d) => s + d.rooms, 0);
  const totalTeleop  = AUTO_WEEK.reduce((s,d) => s + d.teleop, 0);
  const totalFlagged = AUTO_WEEK.reduce((s,d) => s + d.flagged, 0);
  const avgAuto = Math.round(AUTO_WEEK.reduce((s,d) => s + d.v, 0) / AUTO_WEEK.length);

  const H = 180, W_PAD = 38;
  const pct2y = (v) => H - (v / 100) * H;
  const target = 90;

  const maxBreak = Math.max(...AUTO_BREAKDOWN.map(b => b.n));

  return (
    <div style={{ padding: '22px 40px 40px' }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        {[
          { k: 'Avg autonomy',       v: avgAuto + '%', sub: 'last 7 days' },
          { k: 'Rooms completed',    v: totalRooms.toLocaleString(), sub: 'fleet total' },
          { k: 'Tele-op takeovers',  v: String(totalTeleop), sub: `${Math.round(totalTeleop/totalRooms*100)}% of rooms` },
          { k: 'QA flags raised',    v: String(totalFlagged), sub: 'pending review' },
        ].map((x,i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid rgba(24,24,27,.08)',
            borderRadius: 10, padding: 14 }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: 1.2,
              color: 'rgba(24,24,27,.4)', textTransform: 'uppercase' }}>{x.k}</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: '#17171a', marginTop: 6 }}>{x.v}</div>
            <div style={{ fontSize: 11, color: 'rgba(24,24,27,.52)', marginTop: 2 }}>{x.sub}</div>
          </div>
        ))}
      </div>

      {/* Weekly autonomy line */}
      <div style={{ background: '#fff', border: '1px solid rgba(24,24,27,.08)',
        borderRadius: 10, padding: '16px 18px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111', letterSpacing: -.4 }}>
            Autonomy — last 7 days
          </h3>
          <span style={{ flex: 1 }}/>
          <span className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.45)', letterSpacing: 1.1 }}>
            TARGET {target}%
          </span>
        </div>
        <div className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.45)', letterSpacing: 1.1,
          marginBottom: 16 }}>
          ROOMS FINISHED END-TO-END WITHOUT A TELE-OP TAKE-OVER · COUNT ABOVE EACH BAR
        </div>
        <div style={{ position: 'relative', height: H + 30, paddingLeft: W_PAD, paddingRight: 10 }}>
          {[100, 75, 50, 25, 0].map(v => (
            <React.Fragment key={v}>
              <div style={{ position: 'absolute', left: 0, top: pct2y(v) - 6, width: W_PAD - 8,
                fontSize: 9.5, color: 'rgba(0,0,0,.35)', textAlign: 'right',
                fontFamily: 'var(--mono)' }}>{v}%</div>
              <div style={{ position: 'absolute', left: W_PAD, right: 10, top: pct2y(v),
                height: 1, background: 'rgba(0,0,0,.06)' }}/>
            </React.Fragment>
          ))}
          <div style={{ position: 'absolute', left: W_PAD, right: 10, top: pct2y(target),
            height: 1, borderTop: '1px dashed rgba(220,38,38,.6)' }}/>
          <div style={{ position: 'absolute', right: 10, top: pct2y(target) - 16,
            fontSize: 10, color: '#b91c1c', fontWeight: 600, background: '#fff', padding: '0 4px' }}>
            target {target}%
          </div>
          <div style={{ position: 'absolute', left: W_PAD, right: 10, top: 0, bottom: 30,
            display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            {AUTO_WEEK.map(({ d, v, rooms, partial }) => {
              const hit = v >= target;
              const h = (v / 100) * H;
              return (
                <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 6 }}>
                  <div style={{ width: '100%', maxWidth: 58, height: h, position: 'relative',
                    background: partial
                      ? 'repeating-linear-gradient(135deg, #fcd34d 0 6px, #fde68a 6px 12px)'
                      : hit
                        ? 'linear-gradient(180deg, #fcd34d, #fbbf24)'
                        : 'linear-gradient(180deg, #c7d2fe, #a5b4fc)',
                    border: `1px solid ${partial ? '#f59e0b' : hit ? '#f59e0b' : '#818cf8'}`,
                    borderBottom: 'none', borderRadius: '3px 3px 0 0' }}>
                    <span className="mono tnum" style={{ position: 'absolute', top: -18, left: 0, right: 0,
                      textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,.7)' }}>
                      {partial ? `${rooms}·` : rooms}
                    </span>
                    <span className="mono tnum" style={{ position: 'absolute', top: 6, left: 0, right: 0,
                      textAlign: 'center', fontSize: 11, fontWeight: 700,
                      color: partial ? '#78350f' : hit ? '#78350f' : '#312e81' }}>{v}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ position: 'absolute', left: W_PAD, right: 10, bottom: 0, height: 24,
            display: 'flex', gap: 10 }}>
            {AUTO_WEEK.map(({ d, partial }) => (
              <div key={d} style={{ flex: 1, textAlign: 'center', fontSize: 12,
                color: partial ? '#b45309' : 'rgba(0,0,0,.6)',
                fontWeight: partial ? 600 : 400, paddingTop: 6 }}>{d}{partial ? ' ·' : ''}</div>
            ))}
          </div>
        </div>
      </div>

      {/* two-up: per-billie + failure breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
        {/* per-billie */}
        <div style={{ background: '#fff', border: '1px solid rgba(24,24,27,.08)',
          borderRadius: 10, padding: '16px 18px 18px' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111', letterSpacing: -.3 }}>
            Autonomy by Billie — week
          </h3>
          <div className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.45)', letterSpacing: 1.1,
            marginBottom: 14, marginTop: 2 }}>
            SORTED HIGH → LOW · TREND vs PREVIOUS WEEK
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...AUTO_PER_BILLIE].sort((a,b) => b.v - a.v).map(r => {
              const tone = r.v >= 90 ? '#22c55e' : r.v >= 80 ? '#f59e0b' : '#ef4444';
              const trendUp = r.trend > 0;
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 15, lineHeight: 1, width: 18 }}>{r.flag}</span>
                  <span style={{ fontSize: 12, color: '#17171a', width: 76 }}>{r.id}</span>
                  <div style={{ flex: 1, height: 14, borderRadius: 3,
                    background: 'rgba(24,24,27,.05)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0,
                      width: r.v + '%', background: tone,
                      transition: 'width .4s ease' }}/>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${target}%`,
                      width: 1, background: 'rgba(220,38,38,.4)' }}/>
                  </div>
                  <span className="mono tnum" style={{ fontSize: 11, color: '#17171a',
                    fontWeight: 600, width: 36, textAlign: 'right' }}>{r.v}%</span>
                  <span className="mono tnum" style={{ fontSize: 10,
                    color: trendUp ? '#15803d' : '#b91c1c', width: 38, textAlign: 'right' }}>
                    {trendUp ? '▲' : '▼'} {Math.abs(r.trend).toFixed(1)}
                  </span>
                  <span className="mono" style={{ fontSize: 10, color: 'rgba(0,0,0,.45)',
                    width: 56, textAlign: 'right' }}>{r.rooms} rms</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* failure breakdown */}
        <div style={{ background: '#fff', border: '1px solid rgba(24,24,27,.08)',
          borderRadius: 10, padding: '16px 18px 18px' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111', letterSpacing: -.3 }}>
            Why Billies ask for help
          </h3>
          <div className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.45)', letterSpacing: 1.1,
            marginBottom: 14, marginTop: 2 }}>
            TELE-OP TAKEOVERS BY CATEGORY · LAST 7 DAYS · TREND vs PRIOR WEEK
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {AUTO_BREAKDOWN.map(b => {
              const improving = b.delta < 0; // lower take-over = better
              return (
                <div key={b.cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: '#17171a', flex: 1,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {b.cat}
                  </span>
                  <div style={{ width: 110, height: 8, borderRadius: 2,
                    background: 'rgba(24,24,27,.05)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0,
                      width: (b.n / maxBreak * 100) + '%',
                      background: '#fbbf24' }}/>
                  </div>
                  <span className="mono tnum" style={{ fontSize: 11, color: '#17171a',
                    fontWeight: 600, width: 28, textAlign: 'right' }}>{b.n}</span>
                  <span className="mono tnum" style={{ fontSize: 10,
                    color: improving ? '#15803d' : '#b91c1c', width: 38, textAlign: 'right' }}>
                    {improving ? '▼' : '▲'} {Math.abs(b.delta).toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-view: Data labeling ─────────────────────────────────────
const LABEL_TASKS = [
  { id: 'LB-4012', class: 'Towel fold · compliant?',  queue: 412, answered: 1804, contributors: 6, accuracy: '94.2%', priority: 'high' },
  { id: 'LB-4013', class: 'Pillow alignment',         queue: 280, answered: 1240, contributors: 4, accuracy: '91.0%', priority: 'med' },
  { id: 'LB-4014', class: 'Duvet corners',            queue: 320, answered: 980,  contributors: 5, accuracy: '88.5%', priority: 'high' },
  { id: 'LB-4015', class: 'Mini-bar label OCR',       queue: 104, answered: 3210, contributors: 3, accuracy: '99.0%', priority: 'low' },
  { id: 'LB-4016', class: 'Wardrobe door · open/closed', queue: 560, answered: 712,  contributors: 7, accuracy: '82.1%', priority: 'high' },
  { id: 'LB-4017', class: 'Trash bin empty?',         queue: 198, answered: 1402, contributors: 4, accuracy: '96.3%', priority: 'med' },
  { id: 'LB-4018', class: 'Remote control placement', queue: 240, answered: 890,  contributors: 5, accuracy: '89.4%', priority: 'med' },
  { id: 'LB-4019', class: 'Curtain · drawn correctly',queue: 200, answered: 1120, contributors: 6, accuracy: '92.8%', priority: 'low' },
];

function BrainLabeling() {
  const totalQueue = LABEL_TASKS.reduce((s,t) => s + t.queue, 0);
  const totalAnswered = LABEL_TASKS.reduce((s,t) => s + t.answered, 0);
  return (
    <div style={{ padding: '22px 40px 40px' }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        {[
          { k: 'In queue',          v: totalQueue.toLocaleString(), sub: 'awaiting labels' },
          { k: 'Answered · 7d',     v: totalAnswered.toLocaleString(), sub: 'across all classes' },
          { k: 'Active labelers',   v: '12',  sub: '4 remote · 8 in-house' },
          { k: 'Consensus',         v: '91.7%', sub: 'inter-rater agreement' },
        ].map((x,i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid rgba(24,24,27,.08)',
            borderRadius: 10, padding: 14 }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: 1.2,
              color: 'rgba(24,24,27,.4)', textTransform: 'uppercase' }}>{x.k}</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: '#17171a', marginTop: 6 }}>{x.v}</div>
            <div style={{ fontSize: 11, color: 'rgba(24,24,27,.52)', marginTop: 2 }}>{x.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 1.2,
          color: 'rgba(24,24,27,.45)', textTransform: 'uppercase' }}>Label queues</div>
        <span style={{ flex: 1 }}/>
        <button style={{ all: 'unset', cursor: 'pointer',
          padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600,
          background: '#17171a', color: '#fff' }}>
          Open labeler →
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid rgba(24,24,27,.08)', borderRadius: 10,
        overflow: 'hidden' }}>
        <div style={{ display: 'grid',
          gridTemplateColumns: '110px 2fr 120px 140px 130px 110px 80px',
          alignItems: 'center', padding: '10px 14px',
          background: 'rgba(24,24,27,.025)', borderBottom: '1px solid rgba(24,24,27,.06)',
          fontSize: 10, letterSpacing: 1, color: 'rgba(24,24,27,.45)', textTransform: 'uppercase' }}>
          <div>Task</div><div>Class</div><div>In queue</div>
          <div>Answered · 7d</div><div>Contributors</div><div>Consensus</div>
          <div style={{ textAlign: 'right' }}>Priority</div>
        </div>
        {LABEL_TASKS.map((t,i) => (
          <div key={t.id} style={{ display: 'grid',
            gridTemplateColumns: '110px 2fr 120px 140px 130px 110px 80px',
            alignItems: 'center', padding: '13px 14px',
            borderBottom: i < LABEL_TASKS.length - 1 ? '1px solid rgba(24,24,27,.05)' : 'none' }}>
            <div className="mono" style={{ fontSize: 11, color: '#17171a', fontWeight: 500 }}>{t.id}</div>
            <div style={{ fontSize: 12.5, color: '#17171a' }}>{t.class}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative', width: 50, height: 4, borderRadius: 2,
                background: 'rgba(24,24,27,.08)' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${Math.min(100, t.queue / 6)}%`,
                  borderRadius: 2, background: '#fbbf24' }}/>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'rgba(24,24,27,.68)' }}>{t.queue}</span>
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(24,24,27,.6)' }}>{t.answered.toLocaleString()}</div>
            <div style={{ display: 'flex', gap: -4, alignItems: 'center' }}>
              {Array.from({ length: Math.min(t.contributors, 5) }).map((_,j) => (
                <div key={j} style={{ width: 20, height: 20, borderRadius: '50%',
                  background: ['#fbbf24','#5b5bf7','#22c55e','#ef4444','#06b6d4'][j % 5],
                  border: '2px solid #fff', marginLeft: j === 0 ? 0 : -6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 8.5, fontWeight: 700 }}>
                  {String.fromCharCode(65 + j)}
                </div>
              ))}
              {t.contributors > 5 && (
                <span className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.52)', marginLeft: 4 }}>
                  +{t.contributors - 5}
                </span>
              )}
            </div>
            <div className="mono" style={{ fontSize: 11, color: '#17171a', fontWeight: 500 }}>{t.accuracy}</div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ padding: '3px 7px', borderRadius: 5, fontSize: 10, fontWeight: 600,
                letterSpacing: .3,
                background: t.priority === 'high' ? 'rgba(239,68,68,.12)' :
                            t.priority === 'med'  ? 'rgba(251,191,36,.16)' : 'rgba(24,24,27,.06)',
                color: t.priority === 'high' ? '#b91c1c' :
                       t.priority === 'med'  ? '#a16207' : 'rgba(24,24,27,.55)' }}>
                {t.priority.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sub-view: Model training ────────────────────────────────────
const TRAIN_RUNS = [
  { id: 'RUN-0421-A', model: 'Vision · Towel fold',  status: 'running',  progress: 68, eta: '2h 14m',
    startedBy: 'Dr. Sarah Chen', dataset: 'v41 · 18.2k',  baseline: '96.8%', gain: '+1.4%' },
  { id: 'RUN-0421-B', model: 'Grip planner',         status: 'running',  progress: 22, eta: '5h 40m',
    startedBy: 'Jenna L.',       dataset: 'v12 · 44.0k',  baseline: '92.4%', gain: '+2.1%' },
  { id: 'RUN-0420-A', model: 'Path planner',         status: 'complete', progress: 100, eta: '—',
    startedBy: 'Oded H.',        dataset: 'v88 · 120k',   baseline: '99.5%', gain: '+0.1%' },
  { id: 'RUN-0419-C', model: 'Bed make',             status: 'complete', progress: 100, eta: '—',
    startedBy: 'Dr. Sarah Chen', dataset: 'v23 · 12.8k',  baseline: '93.5%', gain: '+0.6%' },
  { id: 'RUN-0418-A', model: 'Mini-bar OCR',         status: 'failed',   progress: 43, eta: '—',
    startedBy: 'Jenna L.',       dataset: 'v07 · 6.4k',   baseline: '99.1%', gain: '—' },
];

function BrainTraining() {
  return (
    <div style={{ padding: '22px 40px 40px' }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        {[
          { k: 'Runs · this week', v: '3',  sub: '2 running · 1 complete' },
          { k: 'GPU hours · 7d',   v: '412', sub: '8× A100 · 3 nodes' },
          { k: 'Avg gain',         v: '+1.1%', sub: 'accuracy vs baseline' },
          { k: 'Next auto-retrain',v: 'Thu 04:00', sub: 'scheduled · 6 agents' },
        ].map((x,i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid rgba(24,24,27,.08)',
            borderRadius: 10, padding: 14 }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: 1.2,
              color: 'rgba(24,24,27,.4)', textTransform: 'uppercase' }}>{x.k}</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: '#17171a', marginTop: 6 }}>{x.v}</div>
            <div style={{ fontSize: 11, color: 'rgba(24,24,27,.52)', marginTop: 2 }}>{x.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 1.2,
          color: 'rgba(24,24,27,.45)', textTransform: 'uppercase' }}>Training runs</div>
        <span style={{ flex: 1 }}/>
        <button style={{ all: 'unset', cursor: 'pointer',
          padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600,
          background: '#17171a', color: '#fff' }}>
          + Start run
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid rgba(24,24,27,.08)', borderRadius: 10,
        overflow: 'hidden' }}>
        <div style={{ display: 'grid',
          gridTemplateColumns: '130px 1.6fr 120px 160px 140px 110px 100px 90px',
          alignItems: 'center', padding: '10px 14px',
          background: 'rgba(24,24,27,.025)', borderBottom: '1px solid rgba(24,24,27,.06)',
          fontSize: 10, letterSpacing: 1, color: 'rgba(24,24,27,.45)', textTransform: 'uppercase' }}>
          <div>Run</div><div>Model</div><div>Status</div><div>Progress</div>
          <div>Dataset</div><div>Baseline</div><div>Gain</div><div>ETA</div>
        </div>
        {TRAIN_RUNS.map((r,i) => (
          <div key={r.id} style={{ display: 'grid',
            gridTemplateColumns: '130px 1.6fr 120px 160px 140px 110px 100px 90px',
            alignItems: 'center', padding: '13px 14px',
            borderBottom: i < TRAIN_RUNS.length - 1 ? '1px solid rgba(24,24,27,.05)' : 'none' }}>
            <div className="mono" style={{ fontSize: 11, color: '#17171a', fontWeight: 500 }}>{r.id}</div>
            <div>
              <div style={{ fontSize: 12.5, color: '#17171a' }}>{r.model}</div>
              <div style={{ fontSize: 10.5, color: 'rgba(24,24,27,.45)' }}>by {r.startedBy}</div>
            </div>
            <div>
              {r.status === 'running' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 8px', borderRadius: 5,
                  background: 'rgba(91,91,247,.12)', color: '#4f46e5',
                  fontSize: 10, fontWeight: 600, letterSpacing: .3 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#5b5bf7',
                    animation: 'pulse 1.4s ease-in-out infinite' }}/>
                  RUNNING
                </span>
              ) : r.status === 'complete' ? (
                <span style={{ padding: '3px 8px', borderRadius: 5,
                  background: 'rgba(34,197,94,.12)', color: '#15803d',
                  fontSize: 10, fontWeight: 600, letterSpacing: .3 }}>
                  ✓ COMPLETE
                </span>
              ) : (
                <span style={{ padding: '3px 8px', borderRadius: 5,
                  background: 'rgba(239,68,68,.12)', color: '#b91c1c',
                  fontSize: 10, fontWeight: 600, letterSpacing: .3 }}>
                  FAILED
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative', flex: 1, height: 4, borderRadius: 2,
                background: 'rgba(24,24,27,.08)' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${r.progress}%`,
                  borderRadius: 2,
                  background: r.status === 'failed' ? '#ef4444'
                    : r.status === 'complete' ? '#22c55e' : '#5b5bf7' }}/>
              </div>
              <span className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.55)',
                minWidth: 30, textAlign: 'right' }}>{r.progress}%</span>
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(24,24,27,.6)' }}>{r.dataset}</div>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(24,24,27,.6)' }}>{r.baseline}</div>
            <div className="mono" style={{ fontSize: 11, fontWeight: 600,
              color: r.gain === '—' ? 'rgba(24,24,27,.35)'
                : r.gain.startsWith('+') ? '#15803d' : '#17171a' }}>{r.gain}</div>
            <div className="mono" style={{ fontSize: 11, color: 'rgba(24,24,27,.52)' }}>{r.eta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsView() {
  const [sub, setSub] = React.useState(() => {
    try { return localStorage.getItem('bb_analytics_sub') || 'yesterday'; } catch { return 'yesterday'; }
  });
  React.useEffect(() => { try { localStorage.setItem('bb_analytics_sub', sub); } catch {} }, [sub]);

  const subs = [
    { id: 'yesterday', label: 'Yesterday',         sub: 'Nov 13 · fleet recap' },
    { id: 'autonomy',  label: 'Autonomy analysis', sub: 'last 7 days' },
  ];
  const current = subs.find(s => s.id === sub);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#fbfbfa', overflow: 'hidden' }}>
      {/* top bar */}
      <div style={{ display: 'flex', flexDirection: 'column',
        padding: '18px 40px 0', borderBottom: '1px solid rgba(24,24,27,.06)',
        background: '#fff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 14 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: 1.4,
            color: 'rgba(24,24,27,.35)' }}>ANALYTICS</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#17171a', letterSpacing: -0.3 }}>
            {current?.label}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
          {subs.map(s => (
            <button key={s.id} onClick={() => setSub(s.id)}
              style={{ all: 'unset', cursor: 'pointer',
                padding: '10px 16px 12px',
                fontSize: 13, fontWeight: sub === s.id ? 600 : 500,
                color: sub === s.id ? '#17171a' : 'rgba(24,24,27,.52)',
                borderBottom: sub === s.id ? '2px solid #17171a' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: 8 }}>
              {s.label}
              <span className="mono" style={{ fontSize: 9.5, letterSpacing: .8,
                color: 'rgba(24,24,27,.35)', fontWeight: 400 }}>
                {s.sub}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* body */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {sub === 'yesterday' ? <AnalyticsYesterday/> : <BrainAutonomyWeek/>}
      </div>
    </div>
  );
}

function AnalyticsComingSoon() {
  // teaser metrics — not real data, but give the page presence rather than
  // a blank "coming soon" screen
  const kpis = [
    { label: 'Rooms completed', val: '—',  sub: 'rolling 30d' },
    { label: 'Avg cycle time',  val: '—',  sub: 'per room'    },
    { label: 'Autonomy rate',   val: '—',  sub: 'no tele-op'  },
    { label: 'Guest-facing flags', val: '—', sub: 'per 1k rooms' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto',
      background: '#fbfbfa', color: '#17171a', fontFamily: 'Inter, var(--sans)',
      padding: '40px 48px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10,
              padding: '4px 10px', borderRadius: 999,
              background: 'rgba(91,91,247,.08)',
              border: '1px solid rgba(91,91,247,.18)' }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent, #5b5bf7)' }}/>
              <span className="mono" style={{ fontSize: 10, letterSpacing: 1.5,
                color: 'var(--accent-ink, #4141e0)', fontWeight: 600 }}>COMING SOON</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -.5,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', marginBottom: 8 }}>
              Analytics
            </div>
            <div style={{ fontSize: 14, color: 'rgba(24,24,27,.62)', maxWidth: 620, lineHeight: 1.55 }}>
              Fleet-wide performance, room economics, autonomy trends and quality signals —
              sliced by property, shift, and robot. We're still wiring up the pipelines.
            </div>
          </div>
          <button style={{ all: 'unset', cursor: 'pointer',
            padding: '9px 16px', borderRadius: 7, fontSize: 12.5, fontWeight: 600,
            background: '#17171a', color: '#fbbf24',
            border: '1px solid #17171a' }}>
            Notify me when it's live
          </button>
        </div>

        {/* teaser KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ padding: 16, background: '#ffffff',
              border: '1px solid rgba(24,24,27,.06)', borderRadius: 10,
              position: 'relative', overflow: 'hidden' }}>
              <div className="mono" style={{ fontSize: 9.5, letterSpacing: 1.2,
                color: 'rgba(24,24,27,.42)', marginBottom: 10 }}>
                {k.label.toUpperCase()}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -.5,
                color: 'rgba(24,24,27,.25)' }}>{k.val}</div>
              <div style={{ fontSize: 11, color: 'rgba(24,24,27,.42)', marginTop: 4 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* big blurred chart preview */}
        <div style={{ position: 'relative', background: '#ffffff',
          border: '1px solid rgba(24,24,27,.06)', borderRadius: 10,
          padding: 20, minHeight: 340, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16, filter: 'blur(2px)', opacity: .55 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Rooms per hour · fleet</div>
              <div style={{ fontSize: 11.5, color: 'rgba(24,24,27,.52)' }}>last 30 days · all properties</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['30d','7d','24h'].map((l, i) => (
                <span key={l} style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11,
                  background: i === 0 ? 'rgba(24,24,27,.06)' : 'transparent',
                  color: 'rgba(24,24,27,.72)' }}>{l}</span>
              ))}
            </div>
          </div>

          {/* placeholder chart */}
          <svg viewBox="0 0 900 240" width="100%" height="240"
            style={{ filter: 'blur(3px)', opacity: .45 }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="ana-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5b5bf7" stopOpacity=".35"/>
                <stop offset="100%" stopColor="#5b5bf7" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {[0,1,2,3].map(i => (
              <line key={i} x1="0" x2="900" y1={i*60+20} y2={i*60+20}
                stroke="rgba(24,24,27,.06)" strokeWidth="1"/>
            ))}
            <path d="M0,180 C60,160 110,140 170,150 C230,160 260,110 320,95 C380,80 420,120 480,110 C540,100 580,60 640,55 C700,50 740,90 800,80 C850,72 880,60 900,55 L900,240 L0,240 Z"
              fill="url(#ana-grad)"/>
            <path d="M0,180 C60,160 110,140 170,150 C230,160 260,110 320,95 C380,80 420,120 480,110 C540,100 580,60 640,55 C700,50 740,90 800,80 C850,72 880,60 900,55"
              fill="none" stroke="#5b5bf7" strokeWidth="2.4" strokeLinecap="round"/>
          </svg>

          {/* overlay */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8,
            background: 'linear-gradient(180deg, rgba(255,255,255,.1), rgba(255,255,255,.55))' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
              stroke="rgba(24,24,27,.42)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <path d="M7 16l3-4 3 2 4-6"/>
            </svg>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: 1.6,
              color: 'rgba(24,24,27,.55)', fontWeight: 600 }}>DASHBOARD IN BUILD</div>
            <div style={{ fontSize: 12.5, color: 'rgba(24,24,27,.62)' }}>
              Expect this view in the next release.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Analytics · Yesterday — Nov 13 fleet recap
// Editorial: headline number, short lede, then property + robot tables.
// Zero live data — all static, so it reads cleanly at the 9am stand-up.
// ═══════════════════════════════════════════════════════════════
function AnalyticsYesterday() {
  const total   = 742;   // rooms cleaned
  const target  = 720;
  const auton   = 93.1;  // % autonomous (no tele-op)
  const avgCyc  = 20.8;  // min / room
  const flags   = 4;     // guest-facing issues

  const PROPS = [
    { site: 'ROOMers Milan',     flag: '🇮🇹', rooms: 164, tgt: 156, auto: 95.4, flags: 0, lead: 'Marta R.'   },
    { site: 'Nobu Berlin',       flag: '🇩🇪', rooms: 138, tgt: 140, auto: 91.2, flags: 1, lead: 'Jonas W.'   },
    { site: 'Sofitel Paris',     flag: '🇫🇷', rooms: 122, tgt: 118, auto: 92.8, flags: 1, lead: 'Camille D.' },
    { site: 'The Standard LDN',  flag: '🇬🇧', rooms: 108, tgt: 110, auto: 94.1, flags: 0, lead: 'Priya K.'   },
    { site: '1 Hotel Brooklyn',  flag: '🇺🇸', rooms:  96, tgt:  96, auto: 88.7, flags: 2, lead: 'Devon M.'   },
    { site: 'Park Hyatt Tokyo',  flag: '🇯🇵', rooms:  68, tgt:  70, auto: 96.5, flags: 0, lead: 'Akiko T.'   },
    { site: 'Cardo Brussels',    flag: '🇧🇪', rooms:  46, tgt:  30, auto: 90.0, flags: 0, lead: 'Hugo V.'    },
  ];
  const ROBOTS = [
    { id: 'BILLIE-08', site: 'Milan',     rooms: 58, cyc: 19.4, auto: 97.2, tele: 2, trend: 'up'   },
    { id: 'BILLIE-12', site: 'Milan',     rooms: 54, cyc: 20.8, auto: 95.1, tele: 4, trend: 'flat' },
    { id: 'BILLIE-03', site: 'Berlin',    rooms: 47, cyc: 22.1, auto: 92.4, tele: 6, trend: 'flat' },
    { id: 'BILLIE-09', site: 'London',    rooms: 46, cyc: 21.3, auto: 94.1, tele: 3, trend: 'up'   },
    { id: 'BILLIE-05', site: 'Paris',     rooms: 42, cyc: 23.7, auto: 89.6, tele: 7, trend: 'down' },
    { id: 'BILLIE-17', site: 'Tokyo',     rooms: 38, cyc: 20.1, auto: 96.5, tele: 2, trend: 'up'   },
    { id: 'BILLIE-14', site: 'Brooklyn',  rooms: 31, cyc: 26.3, auto: 82.1, tele: 14, trend: 'down' },
    { id: 'BILLIE-21', site: 'Madrid',    rooms: 28, cyc: 27.9, auto: 78.4, tele: 18, trend: 'down' },
  ];
  const FLAGS = [
    { time: '14:22', site: 'Berlin',   robot: 'BILLIE-03', room: '412',
      note: 'Stained bedsheet missed — guest escalated at check-in.' },
    { time: '16:40', site: 'Paris',    robot: 'BILLIE-05', room: '208',
      note: 'Bathroom mirror streaks flagged by inspector; rework 4min.' },
    { time: '18:05', site: 'Brooklyn', robot: 'BILLIE-14', room: '503',
      note: 'Towel count short by 1 — housekeeper added on manual pass.' },
    { time: '21:17', site: 'Brooklyn', robot: 'BILLIE-14', room: '611',
      note: 'Vacuum missed under-bed strip. Pattern — BILLIE-14 cal drift.' },
  ];

  // mini bar — 24 hourly rooms for the hero
  const HOURLY = [2, 1, 0, 0, 0, 3, 14, 38, 62, 71, 64, 58, 52, 55, 60, 66, 58, 49, 41, 33, 28, 19, 11, 5];
  const maxH = Math.max(...HOURLY);

  return (
    <div style={{ padding: '28px 40px 48px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* hero — headline number + lede + hourly bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 28,
        paddingBottom: 24, borderBottom: '1px solid rgba(24,24,27,.08)' }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: 1.5,
            color: 'rgba(24,24,27,.4)', marginBottom: 12 }}>
            THURSDAY, NOV 13 · FLEET RECAP
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 68, fontWeight: 600, letterSpacing: -2,
              color: '#17171a', lineHeight: 1, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              {total}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#17171a' }}>
                rooms cleaned
              </div>
              <div style={{ fontSize: 12, color: 'rgba(24,24,27,.52)' }}>
                <span style={{ color: '#15803d', fontWeight: 600 }}>+{total - target}</span>
                {' '}vs. target of {target}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(24,24,27,.72)',
            maxWidth: 520, textWrap: 'pretty' }}>
            A clean day. Milan ran hot — ROOMers pulled ahead of target by
            noon and stayed there. Brooklyn held the fleet back: BILLIE-14
            looks due for calibration. Two guest flags, both recoverable.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: 1.3,
              color: 'rgba(24,24,27,.4)' }}>ROOMS / HOUR · LOCAL TIME</div>
            <div style={{ fontSize: 11, color: 'rgba(24,24,27,.48)' }}>
              peak 09:00 · {Math.max(...HOURLY)} rooms
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120,
            padding: '0 2px', borderBottom: '1px solid rgba(24,24,27,.1)' }}>
            {HOURLY.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column',
                justifyContent: 'flex-end', height: '100%' }}>
                <div style={{ height: (v / maxH) * 100 + '%',
                  background: i >= 8 && i <= 10 ? '#17171a' : 'rgba(24,24,27,.2)',
                  borderRadius: 1 }}/>
              </div>
            ))}
          </div>
          <div className="mono" style={{ display: 'flex', justifyContent: 'space-between',
            fontSize: 9.5, color: 'rgba(24,24,27,.4)', letterSpacing: .5 }}>
            <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
        background: 'rgba(24,24,27,.08)',
        border: '1px solid rgba(24,24,27,.08)', borderRadius: 10, overflow: 'hidden' }}>
        <AYKpi label="Autonomy rate" val={auton.toFixed(1)} unit="%" sub="no tele-op" delta="+0.8 vs wk" deltaTone="ok"/>
        <AYKpi label="Avg cycle time" val={avgCyc.toFixed(1)} unit="min" sub="per room" delta="−0.4 vs wk" deltaTone="ok"/>
        <AYKpi label="Guest-facing flags" val={flags} unit="" sub="out of 742" delta="+1 vs wk" deltaTone="warn"/>
        <AYKpi label="Properties on target" val="5" unit="/ 7" sub="Berlin, London short" delta="" deltaTone=""/>
      </div>

      {/* two-column: properties + robots */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* properties */}
        <AYPanel title="By property" sub="rooms · target · autonomy">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="mono" style={{ display: 'grid',
              gridTemplateColumns: '1.6fr 60px 56px 80px 50px',
              gap: 10, padding: '6px 14px 10px', fontSize: 9.5, letterSpacing: 1.1,
              color: 'rgba(24,24,27,.42)', borderBottom: '1px solid rgba(24,24,27,.06)' }}>
              <span>PROPERTY</span>
              <span style={{ textAlign: 'right' }}>ROOMS</span>
              <span style={{ textAlign: 'right' }}>VS TGT</span>
              <span style={{ textAlign: 'right' }}>AUTONOMY</span>
              <span style={{ textAlign: 'right' }}>FLAGS</span>
            </div>
            {PROPS.map((p, i) => {
              const d = p.rooms - p.tgt;
              const dTone = d >= 0 ? '#15803d' : '#b45309';
              return (
                <div key={p.site} style={{ display: 'grid',
                  gridTemplateColumns: '1.6fr 60px 56px 80px 50px',
                  gap: 10, padding: '12px 14px', fontSize: 13,
                  borderBottom: i < PROPS.length - 1 ? '1px solid rgba(24,24,27,.04)' : 'none',
                  alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <span style={{ fontSize: 16 }}>{p.flag}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: '#17171a',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.site}</div>
                      <div style={{ fontSize: 11, color: 'rgba(24,24,27,.48)' }}>{p.lead}</div>
                    </div>
                  </div>
                  <div className="mono" style={{ textAlign: 'right', color: '#17171a', fontWeight: 500 }}>
                    {p.rooms}
                  </div>
                  <div className="mono" style={{ textAlign: 'right', color: dTone, fontWeight: 500 }}>
                    {d >= 0 ? '+' : ''}{d}
                  </div>
                  <AYBar value={p.auto}/>
                  <div className="mono" style={{ textAlign: 'right',
                    color: p.flags ? '#b45309' : 'rgba(24,24,27,.35)', fontWeight: p.flags ? 600 : 400 }}>
                    {p.flags || '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </AYPanel>

        {/* robots */}
        <AYPanel title="By robot" sub="rooms · cycle · autonomy">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="mono" style={{ display: 'grid',
              gridTemplateColumns: '1.5fr 60px 60px 80px 44px',
              gap: 10, padding: '6px 14px 10px', fontSize: 9.5, letterSpacing: 1.1,
              color: 'rgba(24,24,27,.42)', borderBottom: '1px solid rgba(24,24,27,.06)' }}>
              <span>ROBOT</span>
              <span style={{ textAlign: 'right' }}>ROOMS</span>
              <span style={{ textAlign: 'right' }}>CYCLE</span>
              <span style={{ textAlign: 'right' }}>AUTONOMY</span>
              <span style={{ textAlign: 'right' }}>TREND</span>
            </div>
            {ROBOTS.map((r, i) => {
              const arrow = r.trend === 'up' ? '↗' : r.trend === 'down' ? '↘' : '→';
              const tcol = r.trend === 'up' ? '#15803d' : r.trend === 'down' ? '#b45309' : 'rgba(24,24,27,.35)';
              return (
                <div key={r.id} style={{ display: 'grid',
                  gridTemplateColumns: '1.5fr 60px 60px 80px 44px',
                  gap: 10, padding: '12px 14px', fontSize: 13,
                  borderBottom: i < ROBOTS.length - 1 ? '1px solid rgba(24,24,27,.04)' : 'none',
                  alignItems: 'center' }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="mono" style={{ fontWeight: 500, color: '#17171a', fontSize: 12 }}>{r.id}</div>
                    <div style={{ fontSize: 11, color: 'rgba(24,24,27,.48)' }}>{r.site}</div>
                  </div>
                  <div className="mono" style={{ textAlign: 'right', color: '#17171a', fontWeight: 500 }}>{r.rooms}</div>
                  <div className="mono" style={{ textAlign: 'right', color: '#17171a' }}>
                    {r.cyc.toFixed(1)}<span style={{ color: 'rgba(24,24,27,.4)', fontWeight: 400 }}> m</span>
                  </div>
                  <AYBar value={r.auto}/>
                  <div className="mono" style={{ textAlign: 'right', color: tcol, fontSize: 14 }}>{arrow}</div>
                </div>
              );
            })}
          </div>
        </AYPanel>
      </div>

      {/* flags detail */}
      <AYPanel title="Guest-facing flags" sub="4 incidents · all recoverable">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {FLAGS.map((f, i) => (
            <div key={i} style={{ display: 'grid',
              gridTemplateColumns: '60px 110px 110px 70px 1fr',
              gap: 16, padding: '14px 14px', alignItems: 'center',
              borderBottom: i < FLAGS.length - 1 ? '1px solid rgba(24,24,27,.04)' : 'none' }}>
              <div className="mono" style={{ fontSize: 11, color: 'rgba(24,24,27,.52)' }}>{f.time}</div>
              <div style={{ fontSize: 12.5, color: '#17171a', fontWeight: 500 }}>{f.site}</div>
              <div className="mono" style={{ fontSize: 11.5, color: '#17171a' }}>{f.robot}</div>
              <div className="mono" style={{ fontSize: 11.5, color: 'rgba(24,24,27,.6)' }}>RM {f.room}</div>
              <div style={{ fontSize: 13, color: 'rgba(24,24,27,.72)', lineHeight: 1.5 }}>{f.note}</div>
            </div>
          ))}
        </div>
      </AYPanel>
    </div>
  );
}

// ─── sub-atoms ─────────────────────────────────────────────────
function AYKpi({ label, val, unit, sub, delta, deltaTone }) {
  const dc = deltaTone === 'ok' ? '#15803d' : deltaTone === 'warn' ? '#b45309' : 'rgba(24,24,27,.4)';
  return (
    <div style={{ background: '#fff', padding: '18px 20px 20px',
      display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div className="mono" style={{ fontSize: 9.5, letterSpacing: 1.2,
        color: 'rgba(24,24,27,.42)' }}>{label.toUpperCase()}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -.8, color: '#17171a',
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', lineHeight: 1 }}>
          {val}
        </div>
        {unit && <div style={{ fontSize: 14, color: 'rgba(24,24,27,.52)', fontWeight: 500 }}>{unit}</div>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2 }}>
        <div style={{ fontSize: 11.5, color: 'rgba(24,24,27,.52)' }}>{sub}</div>
        {delta && <div className="mono" style={{ fontSize: 10.5, color: dc, fontWeight: 500 }}>{delta}</div>}
      </div>
    </div>
  );
}

function AYPanel({ title, sub, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(24,24,27,.08)',
      borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 12px',
        borderBottom: '1px solid rgba(24,24,27,.06)',
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#17171a', letterSpacing: -.1 }}>{title}</div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 1.2,
          color: 'rgba(24,24,27,.4)' }}>{sub?.toUpperCase()}</div>
      </div>
      {children}
    </div>
  );
}

function AYBar({ value }) {
  // 70-100 range mapped
  const pct = Math.max(0, Math.min(1, (value - 70) / 30));
  const tone = value >= 90 ? '#17171a' : value >= 85 ? 'rgba(24,24,27,.55)' : '#b45309';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 4, background: 'rgba(24,24,27,.06)', borderRadius: 2 }}>
        <div style={{ width: pct * 100 + '%', height: '100%', background: tone, borderRadius: 2 }}/>
      </div>
      <div className="mono" style={{ fontSize: 11, color: '#17171a', fontWeight: 500, width: 30, textAlign: 'right' }}>
        {value.toFixed(0)}
      </div>
    </div>
  );
}



function AppPlaceholder({ tab }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#fbfbfa', color: 'rgba(24,24,27,.52)',
      fontFamily: 'Inter, var(--sans)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#17171a', marginBottom: 6 }}>{tab.label}</div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 1.5,
          color: 'rgba(24,24,27,.35)' }}>COMING SOON</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Dispatcher — hi-fi kanban. Rooms flow left→right through states.
// Matches Operator Console dark-glass aesthetic.
// ═══════════════════════════════════════════════════════════════
const DISPATCHER_DATA = {
  todo: {
    label: 'To-do', sub: 'WAITING · GREEN LIGHT', count: 18, delta: '+9',
    accent: '#fbbf24',
    floors: [
      { name: 'Floor 1', rooms: [
        { n: '1200', kind: 'stayover' }, { n: '1202', kind: 'stayover' },
        { n: '1203', kind: 'stayover' }, { n: '1204', kind: 'checkout', priority: 'P1' },
        { n: '1212', kind: 'checkout', priority: 'P1', highlight: true },
        { n: '1213', kind: 'stayover' }, { n: '1228', kind: 'stayover' },
      ]},
      { name: 'Floor 2', rooms: [
        { n: '2204', kind: 'stayover' }, { n: '2209', kind: 'checkout', priority: 'P1' },
        { n: '2215', kind: 'stayover' }, { n: '2220', kind: 'stayover' },
      ]},
      { name: 'Floor 3', rooms: [
        { n: '3200', kind: 'stayover' }, { n: '3202', kind: 'checkout', priority: 'P1' },
        { n: '3212', kind: 'checkout', priority: 'P1', highlight: true },
        { n: '3222', kind: 'stayover' },
      ]},
    ],
  },
  ready: {
    label: 'Ready', sub: 'QUEUED · ETA SHOWN', count: 5, delta: '+1',
    accent: '#f59e0b',
    floors: [
      { name: 'Floor 1', rooms: [
        { n: '1210', meta: 'since 11:26', eta: '2m', guest: 'checked out', kind: 'checkout' },
        { n: '1216', meta: 'since 11:02', eta: '6m', guest: 'checked out', kind: 'checkout', flag: true },
        { n: '1218', meta: 'since 10:48', eta: '9m', guest: 'vacant', kind: 'stayover' },
      ]},
      { name: 'Floor 3', rooms: [
        { n: '3208', meta: 'since 09:51', eta: '14m', guest: 'checked out', kind: 'checkout' },
        { n: '3210', meta: 'since 10:17', eta: '17m', guest: 'checked out', kind: 'checkout', flag: true },
      ]},
    ],
  },
  progress: {
    label: 'In progress', sub: 'LIVE · 8 BILLIES', count: 8,
    accent: '#5b5bf7',
    liveCards: [
      { n: '1210', billie: 'Billie-08', operator: 'Dr. Sarah Chen',
        time: '04:12', pct: 32, step: 'Bathroom · towel fold',
        stepNum: 4, stepTotal: 12, etaFinish: '16:42' },
      { n: '1216', billie: 'Billie-12', operator: 'M. Rivera',
        time: '08:40', pct: 72, step: 'Bed · duvet replace',
        stepNum: 9, stepTotal: 12, etaFinish: '16:46',
        flags: [
          { label: 'remote control', img: (window.__resources?.assets_flag_remote_control_png || "assets/flag-remote-control.png") },
          { label: 'towels',         img: (window.__resources?.assets_flag_towels_png || "assets/flag-towels.png") },
          { label: 'white curtain',  img: (window.__resources?.assets_flag_white_curtain_png || "assets/flag-white-curtain.png") },
          { label: 'door',           img: (window.__resources?.assets_flag_door_png || "assets/flag-door.png") },
          { label: 'wardrobe',       img: (window.__resources?.assets_flag_wardrobe_png || "assets/flag-wardrobe.png") },
        ] },
    ],
  },
  inspected: {
    label: 'Pending review', sub: 'QA · AWAITING RELEASE', count: 3,
    accent: '#f97316',
    cards: [
      { n: '1205', time: '21m', billie: 'B-08', reports: 2, flag: 'pass', inspector: 'Auto + MK', waiting: 14 },
      { n: '1211', time: '28m', billie: 'B-12', reports: 7, flag: 'pass', inspector: 'Auto',      waiting: 32 },
      { n: '1217', time: '19m', billie: 'B-08', reports: 3, flag: 'pass', inspector: 'MK',        waiting: 6  },
    ],
  },
  done: {
    label: 'Done', sub: 'RELEASED TO PMS', count: 14, delta: '+5',
    accent: '#a78bfa',
    rows: [
      { n: '1206', edits: 0, time: '21m', synced: true,    closedAt: '15:58' },
      { n: '1207', edits: 1, time: '18m', synced: true,    closedAt: '15:44' },
      { n: '1208', edits: 4, time: '24m', synced: 'partial', closedAt: '15:31' },
      { n: '1209', edits: 0, time: '14m', synced: true,    closedAt: '15:12' },
      { n: '1214', edits: 1, time: '22m', synced: true,    closedAt: '14:55' },
      { n: '3238', edits: 0, time: '17m', synced: true,    closedAt: '14:40' },
    ],
  },
};

const DISPATCHER_PROPERTIES = ['Marriott Rome', 'Hilton Berlin', 'Cardo Brussels', 'Seminaris Potsdam'];
const PROPERTY_FLAGS = {
  'Marriott Rome':     '🇮🇹',
  'Hilton Berlin':     '🇩🇪',
  'Cardo Brussels':    '🇧🇪',
  'Seminaris Potsdam': '🇩🇪',
};
const PROPERTY_COLORS = {
  'Marriott Rome':     '#fb923c',
  'Hilton Berlin':     '#5b5bf7',
  'Cardo Brussels':    '#22c55e',
  'Seminaris Potsdam': '#a78bfa',
};
const DISPATCHER_ACTIVITY = [
  { t: '16:30', kind: 'start',   txt: 'Billie-08 started 1210 · Check-out clean' },
  { t: '16:28', kind: 'release', txt: '1209 released to PMS · clean, 0 edits' },
  { t: '16:24', kind: 'flag',    txt: '1208 flagged: 4 edits during QA (minibar mismatch)' },
  { t: '16:18', kind: 'start',   txt: 'Billie-12 started 1216 · Check-out clean' },
  { t: '16:14', kind: 'qa',      txt: '1217 inspected · pass (MK)' },
];

const DISPATCHER_BILLIES = [
  { id: 'Billie-08', state: 'working', room: '1210',   op: 'Dr. Sarah Chen', batt: 78, floor: 'F1', task: 'Bathroom · towel fold',         city: 'Berlin',    flag: '🇩🇪' },
  { id: 'Billie-12', state: 'working', room: '1216',   op: 'M. Rivera',      batt: 64, floor: 'F1', task: 'Bed · duvet replace',           city: 'Rome',      flag: '🇮🇹' },
  { id: 'Billie-17', state: 'working', room: '322',    op: 'A. Bauer',       batt: 71, floor: 'F3', task: 'Vacuum · main carpet',          city: 'Berlin',    flag: '🇩🇪' },
  { id: 'Billie-22', state: 'working', room: '508',    op: 'L. Peeters',     batt: 58, floor: 'F5', task: 'Mirror · polish',               city: 'Brussels',  flag: '🇧🇪' },
  { id: 'Billie-24', state: 'working', room: '214',    op: 'T. Hofmann',     batt: 83, floor: 'F2', task: 'Trash out',                     city: 'Potsdam',   flag: '🇩🇪' },
  { id: 'Billie-29', state: 'working', room: '3212',   op: 'R. Conte',       batt: 49, floor: 'F3', task: 'Bed · linen strip',             city: 'Rome',      flag: '🇮🇹' },
  { id: 'Billie-33', state: 'working', room: '2209',   op: 'J. Weber',       batt: 67, floor: 'F2', task: 'Bathroom · sink',               city: 'Berlin',    flag: '🇩🇪' },
  { id: 'Billie-41', state: 'working', room: '511',    op: 'S. Janssens',    batt: 55, floor: 'F5', task: 'Wardrobe · restock',            city: 'Brussels',  flag: '🇧🇪' },
  { id: 'Billie-03', state: 'idle',    room: '—',      op: '—',              batt: 92, floor: 'F2', task: 'Awaiting dispatch · dock 2B',   city: 'Brussels',  flag: '🇧🇪' },
  { id: 'Billie-05', state: 'idle',    room: '—',      op: '—',              batt: 87, floor: 'F3', task: 'Awaiting dispatch · dock 3A',   city: 'Tel Aviv',  flag: '🇮🇱' },
  { id: 'Billie-21', state: 'charging',room: '—',      op: '—',              batt: 41, floor: 'F1', task: 'Charging · 18 min to 80%',      city: 'Berlin',    flag: '🇩🇪' },
  { id: 'Billie-14', state: 'offline', room: '—',      op: '—',              batt: 0,  floor: 'svc', task: 'Service bay · sensor recal',    city: 'Rome',      flag: '🇮🇹' },
];

const DISPATCHER_ACTIVITY_FULL = [
  { t: '16:30', kind: 'start',   txt: 'Billie-08 started 1210',           sub: 'Check-out clean · Dr. Sarah Chen assigned' },
  { t: '16:28', kind: 'release', txt: '1209 released to PMS',             sub: 'clean · 0 edits · auto-closed' },
  { t: '16:26', kind: 'qa',      txt: '1211 inspected · pass',            sub: 'Auto review · 7 reports reviewed' },
  { t: '16:24', kind: 'flag',    txt: '1208 flagged during QA',           sub: '4 edits · minibar mismatch · waiting on Shift Lead' },
  { t: '16:21', kind: 'release', txt: '1207 released to PMS',             sub: 'clean · 1 edit · M. Kim signed off' },
  { t: '16:18', kind: 'start',   txt: 'Billie-12 started 1216',           sub: 'Check-out clean · M. Rivera assigned' },
  { t: '16:14', kind: 'qa',      txt: '1217 inspected · pass',            sub: 'MK reviewed · 3 reports' },
  { t: '16:09', kind: 'release', txt: '1206 released to PMS',             sub: 'clean · 0 edits' },
  { t: '16:02', kind: 'flag',    txt: 'Floor 2 corridor partially mapped',sub: '3 rooms waiting on scan · Billie-21 dispatched' },
  { t: '15:58', kind: 'start',   txt: 'Shift handover · Evening Shift',   sub: '8 Billies online · 3 docked · 1 in service' },
];

function HomeView({ goto }) {
  const cols = DISPATCHER_DATA;
  const now = new Date();
  const hr = now.getHours();
  const greet = hr < 5 ? 'Still up' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const [clock, setClock] = React.useState(() =>
    String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0'));
  React.useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setClock(String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'));
    }, 30000);
    return () => clearInterval(id);
  }, []);
  const [roomsStatus, setRoomsStatus] = React.useState({ label: 'ON TRACK', tone: 'ok' });
  React.useEffect(() => {
    // flip after 6s to show the "behind" state
    const t1 = setTimeout(() => setRoomsStatus({ label: 'BEHIND · BERLIN', tone: 'warn' }), 6000);
    return () => clearTimeout(t1);
  }, []);
  const [sideTab, setSideTab] = React.useState('activity');

  const AUTONOMY = [
    { d: 'Billie-08', flag: '🇮🇹', v: 96, n: 14 },
    { d: 'Billie-12', flag: '🇮🇹', v: 92, n: 11 },
    { d: 'Billie-03', flag: '🇩🇪', v: 89, n:  9 },
    { d: 'Billie-05', flag: '🇫🇷', v: 87, n:  8 },
    { d: 'Billie-09', flag: '🇬🇧', v: 94, n: 12 },
    { d: 'Billie-14', flag: '🇺🇸', v: 78, n:  6 },
    { d: 'Billie-17', flag: '🇯🇵', v: 91, n: 10 },
    { d: 'Billie-21', flag: '🇪🇸', v: 72, n:  7 },
  ];
  const TARGET = 90;

  const BILLIE_INSPECTION = [
    { id: 'BILLIE-08', avg: 19.4, rooms: 58, trend: -1.2, week: [18, 21, 19, 20, 17, 22, 19] },
    { id: 'BILLIE-12', avg: 20.8, rooms: 54, trend: -0.6, week: [22, 23, 20, 19, 21, 21, 20] },
    { id: 'BILLIE-03', avg: 22.1, rooms: 47, trend: +0.4, week: [23, 21, 22, 22, 21, 24, 22] },
    { id: 'BILLIE-05', avg: 23.7, rooms: 42, trend: +1.1, week: [22, 24, 23, 25, 24, 24, 23] },
    { id: 'BILLIE-14', avg: 26.3, rooms: 31, trend: +2.0, week: [25, 28, 26, 27, 25, 28, 25] },
    { id: 'BILLIE-21', avg: 27.9, rooms: 28, trend: +3.1, week: [26, 29, 28, 30, 27, 28, 27] },
  ];


  const [SITES, setSITES] = React.useState([
    { name: "Marriott Rome",        done: 5, total: 18, sub: '2 stayovers · 1 fail',   tone: '#fb923c', kpi: 'fail',   flag: '🇮🇹', pulseId: 0 },
    { name: "Hilton Berlin",        done: 6, total: 14, sub: '3 stayovers · clean',    tone: '#22c55e', kpi: 'clean',  flag: '🇩🇪', pulseId: 0 },
    { name: "Cardo Brussels",       done: 4, total: 12, sub: 'on schedule',             tone: '#22c55e', kpi: 'clean',  flag: '🇧🇪', pulseId: 0 },
    { name: "Seminaris Potsdam",    done: 3, total: 10, sub: 'behind schedule',         tone: '#f59e0b', kpi: 'behind', flag: '🇩🇪', pulseId: 0 },
  ]);
  React.useEffect(() => {
    const onTask = (e) => {
      const { hotel } = e.detail;
      setSITES(prev => prev.map(s => s.name === hotel
        ? { ...s, done: Math.min(s.total, s.done + 1), pulseId: s.pulseId + 1 }
        : s));
    };
    window.addEventListener('task-complete', onTask);
    return () => window.removeEventListener('task-complete', onTask);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden',
      background: '#fbfbfa', color: '#17171a', fontFamily: 'Inter, var(--sans)',
      display: 'flex', flexDirection: 'row', position: 'relative' }}>
      <TaskCompletionSimulator/>
      {/* main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* greeting */}
        <div style={{ padding: '32px 40px 20px', display: 'flex', alignItems: 'flex-end', gap: 24,
          borderBottom: '1px solid rgba(24,24,27,.04)' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700, letterSpacing: -.5, color: '#17171a',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              {greet}, Maya
            </h1>
            <div style={{ marginTop: 6, fontSize: 14, color: 'rgba(24,24,27,.52)', letterSpacing: .05 }}>
              14 rooms turned today · 1 inspection failed · 2 Billies in the field · synced {clock}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* top-right action buttons removed — console link now lives inside each inspection tile */}
          </div>
        </div>

        {/* STRIP 1 — Today: rooms per site + total + active Billies + ops on shift */}
        <div style={{ padding: '20px 40px 0' }}>
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.08)',
            boxShadow: '0 1px 0 rgba(0,0,0,.04), 0 8px 24px -12px rgba(0,0,0,.35)',
            borderRadius: 10, padding: '16px 18px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: -.4 }}>
                Today
              </h3>
              <span className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.45)', letterSpacing: 1.2 }}>
                ROOMS · BILLIES · OPERATORS
              </span>
              <span style={{ flex: 1 }}/>
              <a onClick={() => goto('dispatcher')}
                style={{ fontSize: 11, color: '#5b5bf7', cursor: 'pointer', fontWeight: 500 }}>
                Open Dispatcher →
              </a>
            </div>
            <TodayStrip sites={SITES} status={roomsStatus} goto={goto}/>
          </div>
        </div>

        {/* STRIP 2 — Open alerts (each card = photo + alert) */}
        <div style={{ padding: '14px 40px 0' }}>
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.08)',
            boxShadow: '0 1px 0 rgba(0,0,0,.04), 0 8px 24px -12px rgba(0,0,0,.35)',
            borderRadius: 10, padding: '16px 18px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: -.4 }}>
                Open alerts
              </h3>
              <span className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.45)', letterSpacing: 1.2 }}>
                3 OPEN · 1 UNASSIGNED · LIVE FROM FLEET
              </span>
              <span style={{ flex: 1 }}/>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 8px', borderRadius: 10, background: 'rgba(239,68,68,.1)',
                fontSize: 10, fontWeight: 700, color: '#b91c1c', letterSpacing: .3, marginRight: 12 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: '#ef4444',
                  boxShadow: '0 0 6px #ef4444', animation: 'billPulse 1.4s ease-in-out infinite' }}/>
                LIVE
              </span>
              <a onClick={() => goto('alerts')}
                style={{ fontSize: 11, color: '#5b5bf7', cursor: 'pointer', fontWeight: 500 }}>
                All alerts →
              </a>
            </div>
            <HomeAlertCards goto={goto}/>
          </div>
        </div>

        {/* STRIP 3 — Task tracking */}
        <div style={{ padding: '14px 40px 0' }}>
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.08)',
            boxShadow: '0 1px 0 rgba(0,0,0,.04), 0 8px 24px -12px rgba(0,0,0,.35)',
            borderRadius: 10, padding: '16px 18px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: -.4 }}>
                Task tracking
              </h3>
              <span className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.45)', letterSpacing: 1.2 }}>
                ALL HOTELS · LAST 2 HOURS
              </span>
              <span style={{ flex: 1 }}/>
              <a style={{ fontSize: 11, color: '#5b5bf7', cursor: 'pointer', fontWeight: 500 }}>
                View all →
              </a>
            </div>
            <div className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.45)', letterSpacing: 1.1,
              marginBottom: 12 }}>
              WHAT WAS DONE · WHICH BILLIE · HOW LONG · WHETHER A HUMAN HAD TO STEP IN
            </div>
            <TaskTrackingTable goto={goto}/>
          </div>
        </div>

        {/* STRIP 4 — Autonomy: per-Billie autonomy + avg inspection time */}
        <div style={{ padding: '14px 40px 32px' }}>
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.08)',
            boxShadow: '0 1px 0 rgba(0,0,0,.04), 0 8px 24px -12px rgba(0,0,0,.35)',
            borderRadius: 10, padding: '16px 18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: -.4 }}>
                Autonomy level
              </h3>
              <span className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.45)', letterSpacing: 1.2 }}>
                PER BILLIE · TODAY
              </span>
              <span style={{ flex: 1 }}/>
              <span className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.45)', letterSpacing: 1.1 }}>
                TARGET 90%
              </span>
            </div>
            <div className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.45)', letterSpacing: 1.1,
              marginBottom: 16 }}>
              ROOMS FINISHED END-TO-END WITHOUT A TELE-OP TAKE-OVER · COUNT ABOVE EACH BAR
            </div>
            <AutonomyChart data={AUTONOMY} target={TARGET}/>

            {/* divider */}
            <div style={{ height: 1, background: 'rgba(0,0,0,.06)', margin: '22px -18px 18px' }}/>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: -.4 }}>
                Avg inspection time per Billie — last 7 days
              </h3>
              <span style={{ flex: 1 }}/>
              <LegendDotLight color="#22c55e" label="≤ target"/>
              <LegendDotLight color="#f59e0b" label="near target"/>
              <LegendDotLight color="#ef4444" label="over target"/>
            </div>
            <div className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.45)', letterSpacing: 1.1,
              marginBottom: 14 }}>
              TARGET 22:00 · LOWER IS BETTER · HOVER A BAR FOR DAILY BREAKDOWN
            </div>
            <BillieInspectionChart data={BILLIE_INSPECTION} target={22}/>
          </div>
        </div>
      </div>

      {/* sidebar */}
      <DispatcherSidebar tab={sideTab} setTab={setSideTab}/>
    </div>
  );
}

function MyImpactPanel({ goto }) {
  // Maya's personal contributions this month
  const KPIS = [
    { label: 'CORRECTIONS THIS MONTH', value: '47', sub: '↑ 6 vs February', highlight: true },
    { label: 'FLOW COMMITS YOU INSPIRED', value: '3',  sub: 'patterns you flagged → shipped fixes' },
    { label: 'DEEP-REWIND REDUCTION',    value: '−12%', sub: 'slide @ Marriott Rome · month-over-month' },
    { label: 'CONSENSUS ALIGNMENT',      value: '91%', sub: 'your choices match the 75th-percentile operator' },
  ];

  const PATTERNS = [
    { name: 'ai_task → rewind_2_3',         count: 17, you: 12 },
    { name: 'replay_policy → rewind_plus',  count: 12, you:  8 },
    { name: 'slide → rewind_15dec',         count:  9, you:  5 },
    { name: 'navigate_poi → resume',        count:  8, you:  4 },
    { name: 'joints → rewind_1',            count:  5, you:  3 },
  ];
  const maxCount = Math.max(...PATTERNS.map(p => p.count));

  const IMPACT = [
    { id: '8b7301b', flow: 'ai_task', tag: 'POI alignment issue', txt: 'fixed the Coffee-Corner ai_task · POI alignment issue.',
      meta: 'Mar 14 · 23 operators flagged · you contributed 9 corrections' },
    { id: 'c4a12ee', flow: null,      tag: null, txt: 'added a pre-slide pass check for Marriott Rome bathrooms.',
      meta: 'Mar 12 · you contributed 4 corrections to this pattern' },
    { id: '24a7881', flow: null,      tag: null, txt: 'added a retry on pointcloud_fitness below 0.6 before escalating.',
      meta: 'Mar 28 · cross-tenant fix · you flagged it first' },
    { id: null,      flow: null,      tag: null, txt: 'Deep-rewind rate on slide at Marriott Rome dropped from 35% → 23% post-fix.',
      meta: 'Apr 03 onwards · partly thanks to your corrections', note: true },
  ];

  return (
    <div>
      {/* heading strip */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111',
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: -.4 }}>
          Your impact
        </h3>
        <span className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.45)', letterSpacing: 1.2 }}>
          MAYA · OPERATOR · LAST 30 DAYS
        </span>
        <span style={{ flex: 1 }}/>
        <a style={{ fontSize: 11, color: '#5b5bf7', cursor: 'pointer', fontWeight: 500 }}>
          Full report →
        </a>
      </div>

      {/* KPI row — first tile is yellow-highlighted like the reference */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        marginBottom: 12 }}>
        {KPIS.map((k, i) => {
          const hi = k.highlight;
          return (
            <div key={k.label} style={{
              background: hi ? '#fef3c7' : '#fff',
              border: `1px solid ${hi ? '#fbbf24' : 'rgba(0,0,0,.08)'}`,
              borderRadius: 10, padding: '14px 16px',
              boxShadow: '0 1px 0 rgba(0,0,0,.04), 0 8px 24px -12px rgba(0,0,0,.35)',
            }}>
              <div className="mono" style={{ fontSize: 9.5, letterSpacing: 1.3, fontWeight: 600,
                color: hi ? '#92400e' : 'rgba(0,0,0,.5)', marginBottom: 10 }}>
                {k.label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#111', letterSpacing: -.8,
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                lineHeight: 1 }}>
                {k.value}
              </div>
              <div style={{ fontSize: 11, color: hi ? '#92400e' : 'rgba(0,0,0,.52)', marginTop: 8 }}>
                {k.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* two-up: correction patterns + downstream impact */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* patterns */}
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.08)',
          boxShadow: '0 1px 0 rgba(0,0,0,.04), 0 8px 24px -12px rgba(0,0,0,.35)',
          borderRadius: 10, padding: '14px 18px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#111', letterSpacing: -.2,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Your correction patterns
            </h4>
            <span style={{ flex: 1 }}/>
            <span className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.45)', letterSpacing: 1.1 }}>
              MAR · TOP 5
            </span>
          </div>
          {PATTERNS.map(p => {
            const pct = (p.count / maxCount) * 100;
            const youPct = (p.you / maxCount) * 100;
            return (
              <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 28px',
                alignItems: 'center', gap: 10, padding: '5px 0' }}>
                <span className="mono" style={{ fontSize: 11, color: 'rgba(0,0,0,.78)' }}>
                  {p.name}
                </span>
                <div style={{ position: 'relative', height: 12, background: 'rgba(0,0,0,.035)',
                  borderRadius: 3, overflow: 'hidden' }}>
                  {/* total count — pale blue */}
                  <div style={{ position: 'absolute', inset: 0, width: pct + '%',
                    background: 'rgba(147,197,253,.55)', borderRadius: 3 }}/>
                  {/* your contribution — amber overlay */}
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: youPct + '%',
                    background: '#fbbf24', borderRadius: 3 }}/>
                </div>
                <span className="mono" style={{ fontSize: 11, color: 'rgba(0,0,0,.78)', textAlign: 'right',
                  fontWeight: 600 }}>
                  {p.count}
                </span>
              </div>
            );
          })}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,.06)',
            fontSize: 11.5, color: 'rgba(0,0,0,.62)', lineHeight: 1.45 }}>
            <span style={{ color: 'rgba(0,0,0,.45)' }}>Your signature pattern — </span>
            <span className="mono" style={{ color: '#111' }}>ai_task → rewind_2_3</span>.
            The <span className="mono" style={{ color: '#111' }}>flow</span> team is tracking this;
            it's the most-corrected pattern on the team and they're working on a template fix.
          </div>
        </div>

        {/* downstream impact */}
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.08)',
          boxShadow: '0 1px 0 rgba(0,0,0,.04), 0 8px 24px -12px rgba(0,0,0,.35)',
          borderRadius: 10, padding: '14px 18px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#111', letterSpacing: -.2,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Downstream impact
            </h4>
            <span style={{ flex: 1 }}/>
            <span className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.45)', letterSpacing: 1.1 }}>
              FROM SIGNAL → CODE
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {IMPACT.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                {r.note ? (
                  <div style={{ width: 18, height: 18, borderRadius: 9,
                    background: 'rgba(59,130,246,.12)', color: '#1d4ed8',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: 11, fontWeight: 700 }}>i</div>
                ) : (
                  <div style={{ width: 18, height: 18, borderRadius: 9,
                    background: 'rgba(34,197,94,.14)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="#15803d"
                      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 7l3 3 7-7"/>
                    </svg>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 12, color: '#111' }}>
                    {r.id && (
                      <>
                        <span style={{ color: 'rgba(0,0,0,.55)' }}>Flow commit </span>
                        <span className="mono" style={{ color: '#111', fontWeight: 600 }}>{r.id}</span>
                        {' '}
                      </>
                    )}
                    {r.txt}
                    {r.flow && (
                      <>
                        {' '}
                        <span className="mono" style={{ background: 'rgba(0,0,0,.05)', padding: '1px 5px',
                          borderRadius: 3, fontSize: 10.5, color: '#111' }}>{r.flow}</span>
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(0,0,0,.5)', marginTop: 2 }}>
                    {r.meta}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeAction({ label, onClick, tone }) {
  const bg = tone || 'rgba(24,24,27,.04)';
  const br = tone ? tone : 'rgba(24,24,27,.08)';
  return (
    <button onClick={onClick}
      style={{ padding: '8px 14px', border: `1px solid ${br}`, background: bg,
        color: '#17171a', borderRadius: 6, fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
        cursor: 'pointer', letterSpacing: .1 }}>
      {label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// AlertsView — full-page alerts list across the fleet.
// ═══════════════════════════════════════════════════════════════
function AlertsView({ goto }) {
  const [filter, setFilter] = React.useState('open'); // open | acked | resolved | all
  const [sevFilter, setSevFilter] = React.useState('all');

  const ALERTS = [
    { id: 'A-2041', flag: '🇮🇹', hotel: 'Marriott Rome',     robot: 'BILLIE-08', room: '1216', kind: 'door',     issue: 'Door won\'t open',                        why: 'Privacy latch likely engaged from inside',     severity: 'high',  started: '08:42', stalled: '1m 32s', assignee: null,             ack: false, status: 'open' },
    { id: 'A-2040', flag: '🇮🇹', hotel: 'Marriott Rome',     robot: 'BILLIE-14', room: '1118', kind: 'sensor',   issue: 'Depth sensor recalibration required',     why: 'Drift on ToF channel 3 over last 4 inspections', severity: 'high',  started: '08:02', stalled: '14m',    assignee: { name: 'Oded Polak',     init: 'OP', color: '#fb923c' }, ack: true,  status: 'open' },
    { id: 'A-2039', flag: '🇩🇪', hotel: 'Hilton Berlin',     robot: 'BILLIE-21', room: '0804', kind: 'battery',  issue: 'Battery degradation · 41% capacity',       why: 'Pack at 287 cycles · below maintenance threshold', severity: 'med',  started: '07:18', stalled: '1h 6m',  assignee: { name: 'M. Kim',         init: 'MK', color: '#a855f7' }, ack: true,  status: 'open' },
    { id: 'A-2038', flag: '🇧🇪', hotel: 'Cardo Brussels',    robot: 'BILLIE-09', room: '0512', kind: 'arm',      issue: 'Arm pose drift on handover',               why: 'Joint 4 encoder skipped 0.3° on last grasp',   severity: 'med',   started: '06:47', stalled: '2h',     assignee: null,             ack: false, status: 'open' },
    { id: 'A-2037', flag: '🇩🇪', hotel: 'Seminaris Potsdam', robot: 'BILLIE-05', room: '0317', kind: 'wifi',     issue: 'Wi-Fi roam packet loss',                   why: 'AP-3F-04 dropped frames during corridor walk',  severity: 'low',   started: '06:12', stalled: '2h 22m', assignee: { name: 'L. Dubois',      init: 'LD', color: '#10b981' }, ack: true,  status: 'open' },
    { id: 'A-2036', flag: '🇮🇹', hotel: 'Marriott Rome',     robot: 'BILLIE-12', room: '1210', kind: 'door',     issue: 'Door blocked · luggage in path',           why: 'Operator override · resolved by housekeeping',  severity: 'med',   started: 'yesterday', stalled: '—', assignee: { name: 'Ivy Nakamura',   init: 'IN', color: '#10b981' }, ack: true,  status: 'resolved' },
    { id: 'A-2035', flag: '🇩🇪', hotel: 'Hilton Berlin',     robot: 'BILLIE-17', room: 'svc',  kind: 'maint',    issue: 'Scheduled drivetrain inspection due',      why: 'Hit 1200km of travel since last service',       severity: 'low',   started: 'yesterday', stalled: '—', assignee: { name: 'P. Jansen',      init: 'PJ', color: '#a78bfa' }, ack: true,  status: 'resolved' },
  ];

  const KIND_ICON = {
    door:    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="2" width="8" height="11"/><circle cx="9" cy="8" r=".7" fill="currentColor"/></svg>,
    sensor:  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="2"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M3 3l1.4 1.4M9.6 9.6L11 11M3 11l1.4-1.4M9.6 4.4L11 3"/></svg>,
    battery: <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="9" height="6"/><path d="M11 6v2"/><rect x="3" y="5" width="2.5" height="4" fill="currentColor" stroke="none"/></svg>,
    arm:     <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12V8l3-3 4 4M9 9l3 3"/><circle cx="5" cy="5" r="1.2"/></svg>,
    wifi:    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.5a8 8 0 0110 0M4 8.5a5 5 0 016 0M7 11h.01"/></svg>,
    maint:   <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2.5a3 3 0 00-3.8 3.8L2 10l2 2 3.7-3.7a3 3 0 003.8-3.8L9.5 6.3 7.7 4.5z"/></svg>,
  };
  const SEV = {
    high: { bg: 'rgba(239,68,68,.12)',  fg: '#b91c1c', dot: '#ef4444', label: 'HIGH' },
    med:  { bg: 'rgba(245,158,11,.12)', fg: '#b45309', dot: '#f59e0b', label: 'MED'  },
    low:  { bg: 'rgba(100,116,139,.12)',fg: '#334155', dot: '#94a3b8', label: 'LOW'  },
  };

  const filtered = ALERTS.filter(a => {
    if (filter === 'open' && a.status !== 'open') return false;
    if (filter === 'acked' && (a.status !== 'open' || !a.ack)) return false;
    if (filter === 'resolved' && a.status !== 'resolved') return false;
    if (sevFilter !== 'all' && a.severity !== sevFilter) return false;
    return true;
  });

  const counts = {
    open:     ALERTS.filter(a => a.status === 'open').length,
    unassigned: ALERTS.filter(a => a.status === 'open' && !a.assignee).length,
    acked:    ALERTS.filter(a => a.status === 'open' && a.ack).length,
    resolved: ALERTS.filter(a => a.status === 'resolved').length,
    all:      ALERTS.length,
  };

  const now = new Date();
  const clock = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden',
      background: '#fbfbfa', color: '#17171a', fontFamily: 'Inter, var(--sans)',
      display: 'flex', flexDirection: 'column' }}>
      {/* breadcrumb */}
      <div style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12,
        background: '#ffffff', borderBottom: '1px solid rgba(24,24,27,.05)' }}>
        <span style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 15,
          color: '#17171a' }}>Open Alerts</span>
        <span style={{ flex: 1 }}/>
        <span className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.48)', letterSpacing: .8 }}>
          Today · {clock}
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '22px 40px 40px' }}>
        {/* title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 22 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 36,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 700,
              letterSpacing: -.6, color: '#17171a' }}>Open Alerts</h1>
            <div style={{ fontSize: 13, color: 'rgba(24,24,27,.52)', marginTop: 4,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Open issues across the fleet · ranked by severity
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22 }}>
            <AlertStat n={counts.open} label="OPEN" tone="#ef4444"/>
            <AlertStat n={counts.unassigned} label="UNASSIGNED" tone="#f59e0b"/>
            <AlertStat n={counts.acked} label="ACKED" tone="#5b5bf7"/>
          </div>
        </div>

        {/* filter row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { v: 'open', label: 'Open', n: counts.open },
              { v: 'acked', label: 'Acked', n: counts.acked },
              { v: 'resolved', label: 'Resolved', n: counts.resolved },
              { v: 'all', label: 'All', n: counts.all },
            ].map(f => {
              const on = filter === f.v;
              return (
                <button key={f.v} onClick={() => setFilter(f.v)}
                  style={{ all: 'unset', cursor: 'pointer',
                    padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    color: on ? '#fff' : 'rgba(24,24,27,.7)',
                    background: on ? '#17171a' : 'transparent',
                    border: `1px solid ${on ? '#17171a' : 'rgba(24,24,27,.09)'}`,
                    display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {f.label}
                  <span className="mono" style={{ fontSize: 10,
                    color: on ? 'rgba(255,255,255,.55)' : 'rgba(24,24,27,.4)',
                    fontWeight: 500 }}>{f.n}</span>
                </button>
              );
            })}
          </div>
          <span style={{ width: 1, height: 18, background: 'rgba(24,24,27,.1)' }}/>
          <span className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.4)',
            letterSpacing: 1.2 }}>SEVERITY</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { v: 'all',  label: 'Any' },
              { v: 'high', label: 'High', dot: '#ef4444' },
              { v: 'med',  label: 'Med',  dot: '#f59e0b' },
              { v: 'low',  label: 'Low',  dot: '#94a3b8' },
            ].map(f => {
              const on = sevFilter === f.v;
              return (
                <button key={f.v} onClick={() => setSevFilter(f.v)}
                  style={{ all: 'unset', cursor: 'pointer',
                    padding: '6px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600,
                    color: on ? '#17171a' : 'rgba(24,24,27,.6)',
                    background: on ? 'rgba(24,24,27,.06)' : 'transparent',
                    display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {f.dot && <span style={{ width: 6, height: 6, borderRadius: 3, background: f.dot }}/>}
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* alerts list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1,
          background: 'rgba(24,24,27,.06)', borderRadius: 10, overflow: 'hidden',
          border: '1px solid rgba(24,24,27,.06)' }}>
          {/* header row */}
          <div style={{ display: 'grid',
            gridTemplateColumns: '40px minmax(280px, 2fr) minmax(180px, 1.1fr) 70px 110px minmax(140px, 1fr) 110px',
            gap: 16, padding: '10px 16px', background: '#ffffff',
            fontSize: 9.5, fontFamily: 'var(--mono)', letterSpacing: 1.2,
            color: 'rgba(24,24,27,.45)', fontWeight: 600 }}>
            <span>STATUS</span>
            <span>ISSUE</span>
            <span>BILLIE · LOCATION</span>
            <span>SEV</span>
            <span>STARTED</span>
            <span>ASSIGNED</span>
            <span style={{ textAlign: 'right' }}></span>
          </div>
          {filtered.length === 0 && (
            <div style={{ padding: '40px 16px', textAlign: 'center', background: '#fff',
              fontSize: 12.5, color: 'rgba(24,24,27,.5)' }}>
              Nothing here. Quiet shift.
            </div>
          )}
          {filtered.map((a, i) => {
            const isResolved = a.status === 'resolved';
            return (
              <div key={a.id}
                onClick={() => goto && goto('operator')}
                style={{ display: 'grid',
                  gridTemplateColumns: '40px minmax(280px, 2fr) minmax(180px, 1.1fr) 70px 110px minmax(140px, 1fr) 110px',
                  gap: 16, padding: '14px 16px', background: '#ffffff',
                  cursor: 'pointer', transition: 'background .12s',
                  alignItems: 'center', opacity: isResolved ? .55 : 1 }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(24,24,27,.025)'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}>
                {/* status */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {isResolved ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 22, height: 22, borderRadius: 4,
                      background: 'rgba(34,197,94,.12)', color: '#15803d' }}>
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7l3 3 7-7"/></svg>
                    </span>
                  ) : a.ack ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 22, height: 22, borderRadius: 4,
                      background: 'rgba(91,91,247,.1)', color: '#4141e0' }}>
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="5"/><path d="M7 4v3.5l2 1.5"/></svg>
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 22, height: 22, borderRadius: 4,
                      background: 'rgba(239,68,68,.12)', color: '#b91c1c' }}>
                      <span style={{ width: 7, height: 7, borderRadius: 4, background: '#ef4444',
                        boxShadow: '0 0 6px #ef4444',
                        animation: 'billPulse 1.4s ease-in-out infinite' }}/>
                    </span>
                  )}
                </div>
                {/* issue */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 18, height: 18, borderRadius: 4, color: 'rgba(24,24,27,.55)',
                      background: 'rgba(24,24,27,.05)', flexShrink: 0 }}>
                      {KIND_ICON[a.kind]}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#17171a',
                      letterSpacing: -.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.issue}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'rgba(24,24,27,.55)',
                    marginTop: 3, marginLeft: 26, lineHeight: 1.4,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {a.why}
                  </div>
                </div>
                {/* billie + location */}
                <div style={{ minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 600,
                    color: '#17171a', letterSpacing: .3, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12 }}>{a.flag}</span>
                    <span>{a.robot}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(24,24,27,.5)', marginTop: 2 }}>
                    {a.hotel} · rm {a.room}
                  </div>
                </div>
                {/* severity */}
                <div>
                  <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 3,
                    fontSize: 9.5, fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: .6,
                    background: SEV[a.severity].bg, color: SEV[a.severity].fg }}>
                    {SEV[a.severity].label}
                  </span>
                </div>
                {/* started + stalled */}
                <div>
                  <div className="mono" style={{ fontSize: 11.5, color: 'rgba(24,24,27,.7)',
                    fontWeight: 600, letterSpacing: .3 }}>{a.started}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'rgba(24,24,27,.45)',
                    letterSpacing: .3, marginTop: 2 }}>
                    {a.stalled !== '—' ? `stalled ${a.stalled}` : '—'}
                  </div>
                </div>
                {/* assigned */}
                <div>
                  {a.assignee ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 22, height: 22, borderRadius: 11, background: a.assignee.color,
                        color: '#fff', fontSize: 9.5, fontWeight: 700, letterSpacing: .3,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0 }}>{a.assignee.init}</span>
                      <span style={{ fontSize: 12, color: '#17171a' }}>{a.assignee.name}</span>
                    </span>
                  ) : (
                    <button onClick={(e) => e.stopPropagation()}
                      style={{ all: 'unset', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 9px', borderRadius: 5,
                        border: '1px dashed rgba(24,24,27,.2)',
                        fontSize: 11, fontWeight: 600, color: 'rgba(24,24,27,.55)' }}>
                      + Assign
                    </button>
                  )}
                </div>
                {/* action */}
                <div style={{ textAlign: 'right' }}>
                  {!isResolved ? (
                    <a onClick={(e) => { e.stopPropagation(); goto && goto('operator'); }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 11.5, color: '#5b5bf7', fontWeight: 600, cursor: 'pointer',
                        whiteSpace: 'nowrap' }}>
                      Open console →
                    </a>
                  ) : (
                    <span className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.4)',
                      letterSpacing: .8 }}>RESOLVED</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AlertStat({ n, label, tone }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 70 }}>
      <span className="tnum" style={{ fontSize: 32, fontWeight: 700,
        color: '#17171a', letterSpacing: -.5, lineHeight: 1, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{n}</span>
      <span className="mono" style={{ fontSize: 9.5, color: tone || 'rgba(24,24,27,.5)',
        letterSpacing: 1.2, fontWeight: 700, marginTop: 6 }}>{label}</span>
    </div>
  );
}

function AlertsTable({ goto }) {
  const ROWS = [
    { flag: '🇮🇹', hotel: 'Marriott Rome',     robot: 'Billie-14', issue: 'Sensor recalibration required',  severity: 'high',  started: '14:02', assignee: 'Oded Polak',      avatar: 'OP', tone: '#fb923c' },
    { flag: '🇩🇪', hotel: 'Hilton Berlin',     robot: 'Billie-21', issue: 'Battery degradation · 41% cap',   severity: 'med',   started: '15:18', assignee: 'M. Kim',          avatar: 'MK', tone: '#a855f7' },
    { flag: '🇧🇪', hotel: 'Cardo Brussels',    robot: 'Billie-09', issue: 'Arm pose drift on handover',      severity: 'med',   started: '15:47', assignee: 'Unassigned',      avatar: '?',  tone: '#94a3b8' },
  ];
  const SEV = {
    high: { bg: 'rgba(239,68,68,.12)',  fg: '#b91c1c', label: 'HIGH' },
    med:  { bg: 'rgba(245,158,11,.12)', fg: '#b45309', label: 'MED'  },
    low:  { bg: 'rgba(100,116,139,.12)',fg: '#334155', label: 'LOW'  },
  };
  const header = { fontSize: 9.5, fontFamily: 'var(--mono)', letterSpacing: 1.2,
    color: 'rgba(0,0,0,.45)', fontWeight: 600, padding: '0 8px 8px', textAlign: 'left',
    borderBottom: '1px solid rgba(0,0,0,.08)' };
  const cell = { fontSize: 12, color: '#111', padding: '12px 8px', verticalAlign: 'middle' };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={header}>HOTEL</th>
            <th style={header}>ROBOT</th>
            <th style={header}>ISSUE</th>
            <th style={{ ...header, width: 70 }}>SEV</th>
            <th style={{ ...header, width: 90 }}>STARTED</th>
            <th style={{ ...header, width: 170 }}>ASSIGNED</th>
            <th style={{ ...header, width: 110 }}></th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r, i) => (
            <tr key={i} style={{ borderBottom: i === ROWS.length - 1 ? 'none' : '1px solid rgba(0,0,0,.05)',
              cursor: 'pointer', transition: 'background .12s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,.02)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <td style={cell}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{r.flag}</span>
                  <span style={{ fontWeight: 500 }}>{r.hotel}</span>
                </span>
              </td>
              <td style={{ ...cell, fontFamily: 'var(--mono)', fontWeight: 600, letterSpacing: .3 }}>{r.robot}</td>
              <td style={cell}>{r.issue}</td>
              <td style={cell}>
                <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 3,
                  fontSize: 9.5, fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: .6,
                  background: SEV[r.severity].bg, color: SEV[r.severity].fg }}>
                  {SEV[r.severity].label}
                </span>
              </td>
              <td style={{ ...cell, fontFamily: 'var(--mono)', color: 'rgba(0,0,0,.6)', fontSize: 11.5 }}>{r.started}</td>
              <td style={cell}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 11, background: r.tone,
                    color: '#17171a', fontSize: 9.5, fontWeight: 700, letterSpacing: .3,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0 }}>{r.avatar}</span>
                  <span style={{ color: r.assignee === 'Unassigned' ? 'rgba(0,0,0,.45)' : '#111',
                    fontStyle: r.assignee === 'Unassigned' ? 'italic' : 'normal' }}>
                    {r.assignee}
                  </span>
                </span>
              </td>
              <td style={{ ...cell, textAlign: 'right' }}>
                <a onClick={(e) => { e.stopPropagation(); goto && goto('operator'); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 11.5, color: '#5b5bf7', fontWeight: 600, cursor: 'pointer',
                    whiteSpace: 'nowrap' }}>
                  Open console →
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TaskCompletionSimulator() {
  const POOL = [
    { flag: '🇮🇹', hotel: 'Marriott Rome',     room: '1216', robot: 'Billie-08', duration: '19:42', manual: false },
    { flag: '🇩🇪', hotel: 'Hilton Berlin',     room: '0804', robot: 'Billie-21', duration: '24:11', manual: true,  reason: 'minibar re-align · 38s' },
    { flag: '🇧🇪', hotel: 'Cardo Brussels',    room: '0512', robot: 'Billie-09', duration: '08:57', manual: false },
    { flag: '🇩🇪', hotel: 'Seminaris Potsdam', room: '0317', robot: 'Billie-05', duration: '21:08', manual: false },
    { flag: '🇩🇪', hotel: 'Hilton Berlin',     room: '0621', robot: 'Billie-17', duration: '20:04', manual: false },
    { flag: '🇧🇪', hotel: 'Cardo Brussels',    room: '0408', robot: 'Billie-14', duration: '12:33', manual: true,  reason: 'curtain pinch · 52s' },
    { flag: '🇩🇪', hotel: 'Seminaris Potsdam', room: '0209', robot: 'Billie-03', duration: '23:47', manual: false },
    { flag: '🇮🇹', hotel: 'Marriott Rome',     room: '1118', robot: 'Billie-12', duration: '18:29', manual: false },
    { flag: '🇮🇹', hotel: 'Marriott Rome',     room: '1204', robot: 'Billie-08', duration: '22:36', manual: true,  reason: 'slide rewind +15s' },
  ];
  const idx = React.useRef(0);
  React.useEffect(() => {
    const push = () => {
      const t = POOL[idx.current % POOL.length];
      idx.current++;
      const now = new Date();
      const stamp = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
      window.dispatchEvent(new CustomEvent('task-complete', {
        detail: { ...t, t: stamp, id: Date.now() + Math.random() }
      }));
    };
    const first = setTimeout(push, 1800);
    const interval = setInterval(push, 6500);
    return () => { clearTimeout(first); clearInterval(interval); };
  }, []);
  return null;
}

function TaskTrackingTable({ goto }) {
  const ROWS = [
    { flag: '🇮🇹', hotel: 'Marriott Rome',    room: '1216', task: 'Full room inspection',           robot: 'Billie-08', duration: '19:42', target: 22, manual: false },
    { flag: '🇩🇪', hotel: 'Hilton Berlin',    room: '0804', task: 'Full room inspection',           robot: 'Billie-21', duration: '24:11', target: 22, manual: true,  reason: 'Tele-op · minibar re-align', seconds: 38 },
    { flag: '🇧🇪', hotel: 'Cardo Brussels',   room: '0512', task: 'Bathroom-only pass',             robot: 'Billie-09', duration: '08:57', target: 10, manual: false },
    { flag: '🇩🇪', hotel: 'Seminaris Potsdam',room: '0317', task: 'Full room inspection',           robot: 'Billie-05', duration: '21:08', target: 22, manual: false },
    { flag: '🇮🇹', hotel: 'Marriott Rome',    room: '1210', task: 'Towel-rack check',               robot: 'Billie-12', duration: '04:26', target: 4,  manual: true,  reason: 'Maya · rewind +15s on slide', seconds: 17 },
    { flag: '🇩🇪', hotel: 'Hilton Berlin',    room: '0621', task: 'Full room inspection',           robot: 'Billie-17', duration: '20:04', target: 22, manual: false },
    { flag: '🇧🇪', hotel: 'Cardo Brussels',   room: '0408', task: 'Wardrobe + curtains pass',       robot: 'Billie-14', duration: '12:33', target: 12, manual: true,  reason: 'Tele-op · curtain pinch',    seconds: 52 },
    { flag: '🇩🇪', hotel: 'Seminaris Potsdam',room: '0209', task: 'Full room inspection',           robot: 'Billie-03', duration: '23:47', target: 22, manual: false },
  ];
  const header = { fontSize: 9.5, fontFamily: 'var(--mono)', letterSpacing: 1.2,
    color: 'rgba(0,0,0,.45)', fontWeight: 600, padding: '0 8px 8px', textAlign: 'left',
    borderBottom: '1px solid rgba(0,0,0,.08)' };
  const cell = { fontSize: 12, color: '#111', padding: '12px 8px', verticalAlign: 'middle' };

  const durTone = (r) => {
    const [m, s] = r.duration.split(':').map(Number);
    const mins = m + s/60;
    if (mins <= r.target) return '#15803d';
    if (mins <= r.target * 1.05) return '#b45309';
    return '#b91c1c';
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={header}>HOTEL</th>
            <th style={{ ...header, width: 70 }}>ROOM</th>
            <th style={header}>TASK</th>
            <th style={{ ...header, width: 110 }}>BILLIE</th>
            <th style={{ ...header, width: 110 }}>DURATION</th>
            <th style={header}>MANUAL INTERVENTION</th>
            <th style={{ ...header, width: 90 }}></th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r, i) => (
            <tr key={i} style={{ borderBottom: i === ROWS.length - 1 ? 'none' : '1px solid rgba(0,0,0,.05)',
              cursor: 'pointer', transition: 'background .12s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,.02)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <td style={cell}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{r.flag}</span>
                  <span style={{ fontWeight: 500 }}>{r.hotel}</span>
                </span>
              </td>
              <td style={{ ...cell, fontFamily: 'var(--mono)', color: 'rgba(0,0,0,.7)', fontSize: 11.5, letterSpacing: .3 }}>
                rm {r.room}
              </td>
              <td style={cell}>{r.task}</td>
              <td style={{ ...cell, fontFamily: 'var(--mono)', fontWeight: 600, letterSpacing: .3 }}>{r.robot}</td>
              <td style={{ ...cell, fontFamily: 'var(--mono)', fontWeight: 600, letterSpacing: .3,
                color: durTone(r) }}>
                {r.duration}
                <span style={{ color: 'rgba(0,0,0,.35)', fontWeight: 500, marginLeft: 4, fontSize: 10 }}>
                  / {String(r.target).padStart(2, '0')}:00
                </span>
              </td>
              <td style={cell}>
                {r.manual ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 3,
                      fontSize: 9.5, fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: .6,
                      background: 'rgba(245,158,11,.12)', color: '#b45309' }}>
                      YES · {r.seconds}s
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(0,0,0,.55)' }}>{r.reason}</span>
                  </span>
                ) : (
                  <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 3,
                    fontSize: 9.5, fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: .6,
                    background: 'rgba(34,197,94,.12)', color: '#15803d' }}>
                    AUTONOMOUS
                  </span>
                )}
              </td>
              <td style={{ ...cell, textAlign: 'right' }}>
                <a onClick={(e) => { e.stopPropagation(); goto && goto('inspections'); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 11.5, color: '#5b5bf7', fontWeight: 600, cursor: 'pointer',
                    whiteSpace: 'nowrap' }}>
                  Replay →
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HomeAlertCards({ goto }) {
  const RAW = [
    {
      id: 'a-08',
      img: (window.__resources?.assets_flag_door_png || "assets/flag-door.png"),
      flag: '🇮🇹', hotel: 'Marriott Rome',
      robot: 'BILLIE-08', room: 'rm 1216 · entry',
      issue: "Door won't open",
      detail: '3 attempts · door handle out of reach',
      severity: 'high',
      stalledSec: 252,           // 4m 12s
      assignee: null,            // unassigned
      live: true,
      nearby: 'BILLIE-12 · 30s',
    },
    {
      id: 'a-12',
      img: (window.__resources?.assets_flag_towels_png || "assets/flag-towels.png"),
      flag: '🇮🇹', hotel: 'Marriott Rome',
      robot: 'BILLIE-12', room: 'rm 1210 · bathroom',
      issue: "Stuck — can't reach the towel rack",
      detail: 'Awaiting tele-op · arm at full extension',
      severity: 'high',
      stalledSec: 134,           // 2m 14s
      assignee: { name: 'Oded Polak', avatar: 'OP', tone: '#fb923c' },
      live: true,
    },
    {
      id: 'a-21',
      img: (window.__resources?.assets_flag_wardrobe_png || "assets/flag-wardrobe.png"),
      flag: '🇩🇪', hotel: 'Hilton Berlin',
      robot: 'BILLIE-21', room: 'rm 0804 · wardrobe',
      issue: 'Battery degradation · 41% cap',
      detail: 'Recommend swap before next room',
      severity: 'med',
      stalledSec: 0,
      assignee: { name: 'M. Kim', avatar: 'MK', tone: '#a855f7' },
      live: false,
    },
    {
      id: 'a-09',
      img: (window.__resources?.assets_flag_white_curtain_png || "assets/flag-white-curtain.png"),
      flag: '🇧🇪', hotel: 'Cardo Brussels',
      robot: 'BILLIE-09', room: 'rm 0512 · window wall',
      issue: 'Arm pose drift on handover',
      detail: 'Re-cal scheduled 16:00',
      severity: 'med',
      stalledSec: 0,
      assignee: null,            // unassigned
      live: false,
    },
  ];

  // ---- urgency sort: HIGH first, within HIGH unassigned > assigned, then by stall time desc
  const SEV_RANK = { high: 0, med: 1, low: 2 };
  const ROWS = [...RAW].sort((a, b) => {
    if (SEV_RANK[a.severity] !== SEV_RANK[b.severity]) return SEV_RANK[a.severity] - SEV_RANK[b.severity];
    const ua = a.assignee ? 1 : 0, ub = b.assignee ? 1 : 0;
    if (ua !== ub) return ua - ub;            // unassigned first
    return b.stalledSec - a.stalledSec;        // longest stall first
  });

  // ---- live ticker for stall pill
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2,'0')}`;
  };

  const SEV = {
    high: { bg: '#ef4444', fg: '#fff',     border: 'rgba(239,68,68,.45)',  ring: '0 0 0 3px rgba(239,68,68,.12)', label: 'HIGH' },
    med:  { bg: '#f59e0b', fg: '#1f1300',  border: 'rgba(245,158,11,.35)', ring: 'none', label: 'MED'  },
    low:  { bg: '#64748b', fg: '#fff',     border: 'rgba(0,0,0,.08)',      ring: 'none', label: 'LOW'  },
  };

  return (
    <div style={{ display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
      {ROWS.map((a) => {
        const sev = SEV[a.severity];
        const unassigned = !a.assignee;
        const stalled = a.stalledSec > 0;
        const liveStall = stalled ? a.stalledSec + tick : 0;

        return (
          <div key={a.id} style={{ background: '#fff',
            border: `1px solid ${unassigned ? '#fbbf24' : sev.border}`,
            boxShadow: sev.ring,
            borderRadius: 10, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            position: 'relative',
            cursor: 'pointer', transition: 'transform .12s, box-shadow .12s' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>

            {/* left accent bar for HIGH */}
            {a.severity === 'high' && (
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 3,
                background: '#ef4444', zIndex: 2 }}/>
            )}

            {/* unassigned amber ribbon */}
            {unassigned && (
              <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 3,
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 7px', borderRadius: 4,
                background: '#fbbf24', color: '#5f3b00',
                fontSize: 9, fontWeight: 700, letterSpacing: .6,
                fontFamily: 'var(--mono)',
                boxShadow: '0 2px 6px rgba(0,0,0,.2)' }}>
                UNASSIGNED
              </div>
            )}

            {/* photo */}
            <div style={{ aspectRatio: '16/10', background: '#e5e7eb',
              backgroundImage: `url(${a.img})`, backgroundSize: 'cover', backgroundPosition: 'center',
              position: 'relative' }}>
              {/* sev pill top-left */}
              <div style={{ position: 'absolute', top: 8, left: 8,
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 8px', borderRadius: 4,
                background: sev.bg, color: sev.fg,
                fontSize: 9.5, fontWeight: 700, letterSpacing: .6,
                fontFamily: 'var(--mono)',
                boxShadow: '0 2px 6px rgba(0,0,0,.2)' }}>
                {a.severity === 'high' && (
                  <span style={{ width: 5, height: 5, borderRadius: 3, background: '#fff',
                    boxShadow: '0 0 4px #fff', animation: 'billPulse 1.4s ease-in-out infinite' }}/>
                )}
                {sev.label}
              </div>

              {/* live + ticking stall time bottom-right of photo */}
              {(a.live || stalled) && (
                <div style={{ position: 'absolute', bottom: 28, right: 8,
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 7px', borderRadius: 4,
                  background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)',
                  color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: .4,
                  fontFamily: 'var(--mono)' }}>
                  {a.live && (
                    <span style={{ width: 5, height: 5, borderRadius: 3, background: '#ef4444',
                      boxShadow: '0 0 4px #ef4444',
                      animation: 'billPulse 1.4s ease-in-out infinite' }}/>
                  )}
                  {stalled ? `STALLED ${fmt(liveStall)}` : 'LIVE'}
                </div>
              )}

              {/* robot+room overlay bottom */}
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0,
                padding: '14px 10px 8px',
                background: 'linear-gradient(transparent, rgba(0,0,0,.6))',
                display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, lineHeight: 1 }}>{a.flag}</span>
                <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: '#fff',
                  letterSpacing: .4 }}>{a.robot}</span>
                <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 10 }}>·</span>
                <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.85)',
                  letterSpacing: .3 }}>{a.room}</span>
              </div>
            </div>

            {/* alert body */}
            <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8,
              flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111', lineHeight: 1.3,
                letterSpacing: -.1 }}>
                {a.issue}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(0,0,0,.6)', lineHeight: 1.4 }}>
                {a.detail}
              </div>

              {a.nearby && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 8px', borderRadius: 5,
                  background: 'rgba(91,91,247,.08)',
                  color: '#5b5bf7',
                  fontSize: 10.5, fontWeight: 600,
                  alignSelf: 'flex-start' }}>
                  <span>↻</span>
                  Reroute · {a.nearby}
                </div>
              )}

              {/* meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto' }}>
                {unassigned ? (
                  <button style={{ all: 'unset', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 8px', borderRadius: 5, fontSize: 10.5, fontWeight: 700,
                    color: '#5f3b00',
                    background: 'rgba(251,191,36,.18)',
                    border: '1px dashed rgba(245,158,11,.6)',
                    letterSpacing: .2 }}>
                    Take it →
                  </button>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 11,
                      background: a.assignee.tone, color: '#fff',
                      fontSize: 9, fontWeight: 700, letterSpacing: .3,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0 }}>{a.assignee.avatar}</span>
                    <span style={{ fontSize: 11, color: '#111', whiteSpace: 'nowrap' }}>
                      {a.assignee.name}
                    </span>
                  </span>
                )}
                <span style={{ flex: 1 }}/>
              </div>

              {/* CTAs — severity-aware */}
              <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                {a.severity === 'high' ? (
                  <>
                    <button onClick={() => goto && goto('operator')}
                      style={{ all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'center',
                        padding: '7px 8px', borderRadius: 5, fontSize: 11.5, fontWeight: 700,
                        color: '#fff', background: '#111', letterSpacing: .2 }}>
                      Open console →
                    </button>
                    <button style={{ all: 'unset', cursor: 'pointer',
                      padding: '7px 10px', borderRadius: 5, fontSize: 11, fontWeight: 600,
                      color: 'rgba(0,0,0,.6)',
                      border: '1px solid rgba(0,0,0,.12)' }}>
                      Escalate
                    </button>
                  </>
                ) : (
                  <>
                    <button style={{ all: 'unset', cursor: 'pointer', flex: 1, textAlign: 'center',
                      padding: '7px 8px', borderRadius: 5, fontSize: 11.5, fontWeight: 700,
                      color: '#111',
                      background: '#fff',
                      border: '1px solid rgba(0,0,0,.18)', letterSpacing: .2 }}>
                      Acknowledge
                    </button>
                    <button onClick={() => goto && goto('operator')}
                      style={{ all: 'unset', cursor: 'pointer',
                        padding: '7px 10px', borderRadius: 5, fontSize: 11, fontWeight: 600,
                        color: '#5b5bf7',
                        border: '1px solid rgba(91,91,247,.3)' }}>
                      Console
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LiveInspectionStrip({ goto }) {
  const FLAGS = [
    { label: 'remote control', img: (window.__resources?.assets_flag_remote_control_png || "assets/flag-remote-control.png"), robot: 'BILLIE-08', location: 'rm 1216 · living area' },
    { label: 'towel rack',     img: (window.__resources?.assets_flag_towels_png || "assets/flag-towels.png"),         robot: 'BILLIE-12', location: 'rm 1210 · bathroom',
      needsHelp: true, helpNote: "Stuck — can't reach the towel rack · 2m 14s" },
    { label: 'white curtain',  img: (window.__resources?.assets_flag_white_curtain_png || "assets/flag-white-curtain.png"),  robot: 'BILLIE-08', location: 'rm 1216 · window wall' },
    { label: 'door',           img: (window.__resources?.assets_flag_door_png || "assets/flag-door.png"),           robot: 'BILLIE-08', location: 'rm 1216 · entry' },
    { label: 'wardrobe',       img: (window.__resources?.assets_flag_wardrobe_png || "assets/flag-wardrobe.png"),       robot: 'BILLIE-08', location: 'rm 1216 · wardrobe' },
  ];
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.08)',
      boxShadow: '0 1px 0 rgba(0,0,0,.04), 0 8px 24px -12px rgba(0,0,0,.35)',
      borderRadius: 10, padding: '16px 18px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111',
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: -.4 }}>
          Live inspection
        </h3>
        <span style={{ flex: 1 }}/>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 8px', borderRadius: 10, background: 'rgba(239,68,68,.1)',
          fontSize: 10, fontWeight: 700, color: '#b91c1c', letterSpacing: .3 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: '#ef4444',
            boxShadow: '0 0 6px #ef4444', animation: 'billPulse 1.4s ease-in-out infinite' }}/>
          LIVE
        </span>
      </div>

      {/* Billie-12 help banner removed — indication is now on the tile itself */}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {FLAGS.map((f) => (
          <div key={f.label} style={{ background: '#fafafa',
            border: f.needsHelp ? '1px solid rgba(239,68,68,.45)' : '1px solid rgba(0,0,0,.08)',
            boxShadow: f.needsHelp ? '0 0 0 3px rgba(239,68,68,.1)' : 'none',
            borderRadius: 8, overflow: 'hidden',
            display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ aspectRatio: '16/10', background: '#e5e7eb',
              backgroundImage: `url(${f.img})`, backgroundSize: 'cover', backgroundPosition: 'center',
              position: 'relative' }}>
              {f.needsHelp && (
                <div style={{ position: 'absolute', top: 6, left: 6,
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 8px 3px 7px', borderRadius: 4,
                  background: '#ef4444', color: '#17171a',
                  fontSize: 9.5, fontWeight: 700, letterSpacing: .4,
                  boxShadow: '0 2px 6px rgba(239,68,68,.5)' }}>
                  <span style={{ width: 5, height: 5, borderRadius: 3, background: '#fff',
                    boxShadow: '0 0 4px #fff', animation: 'billPulse 1.4s ease-in-out infinite' }}/>
                  NEEDS HELP
                </div>
              )}
            </div>
            <div style={{ padding: '8px 10px 9px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#111',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {f.label}
                </span>
                <span style={{ flex: 1 }}/>
                <button onClick={() => goto && goto('operator')}
                  style={{ all: 'unset', cursor: 'pointer',
                    padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700,
                    color: f.needsHelp ? '#fff' : '#5b5bf7',
                    background: f.needsHelp ? '#111' : 'transparent',
                    border: f.needsHelp ? 'none' : '1px solid rgba(91,91,247,.3)',
                    letterSpacing: .3,
                    display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  title="Open Operator Console">
                  Console →
                </button>
                <button style={{ all: 'unset', cursor: 'pointer',
                  padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700,
                  color: '#dc2626', background: 'transparent',
                  border: '1px solid rgba(220,38,38,.5)',
                  letterSpacing: .3 }}>
                  Abort
                </button>
              </div>
              {f.needsHelp ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 10, color: '#b91c1c', fontWeight: 500 }}>
                  <span className="mono" style={{ fontWeight: 700, letterSpacing: .3 }}>{f.robot}</span>
                  <span style={{ color: 'rgba(0,0,0,.25)' }}>·</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.helpNote}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 10, color: 'rgba(0,0,0,.5)' }}>
                  <span className="mono" style={{ fontWeight: 600, color: 'rgba(0,0,0,.65)',
                    letterSpacing: .3 }}>{f.robot}</span>
                  <span style={{ color: 'rgba(0,0,0,.25)' }}>·</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.location}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiCard({ label, value, suffix, delta, deltaTone, ring, mono, custom, tone, status, statusTone }) {
  const deltaColor = deltaTone === 'up' ? '#15803d' : '#c2410c';
  const arrow = deltaTone === 'up' ? '▲' : '▼';
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.08)',
      boxShadow: '0 1px 0 rgba(0,0,0,.04), 0 8px 24px -12px rgba(0,0,0,.35)',
      borderRadius: 10, padding: '14px 16px 14px', display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden' }}>
      <div className="mono" style={{ fontSize: 9.5, letterSpacing: 1.3, color: 'rgba(0,0,0,.5)',
        display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>{label}</span>
        {status && (
          <>
            <span style={{ flex: 1 }}/>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 7px', borderRadius: 8,
              background: statusTone === 'warn' ? 'rgba(245,158,11,.14)' : 'rgba(34,197,94,.14)',
              color: statusTone === 'warn' ? '#b45309' : '#15803d',
              fontSize: 9, fontWeight: 700, letterSpacing: .4 }}>
              <span style={{ width: 5, height: 5, borderRadius: 3,
                background: statusTone === 'warn' ? '#f59e0b' : '#22c55e',
                boxShadow: statusTone === 'warn'
                  ? '0 0 4px #f59e0b'
                  : '0 0 4px #22c55e' }}/>
              {status}
            </span>
          </>
        )}
      </div>
      {custom ? custom : (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
        <span className={mono ? 'mono tnum' : 'tnum'}
          style={{ fontSize: 32, fontWeight: 700, color: tone || '#111', lineHeight: 1, letterSpacing: -.8 }}>
          {value}
        </span>
        {suffix && (
          <span className="mono" style={{ fontSize: 13, color: 'rgba(0,0,0,.4)', fontWeight: 500 }}>
            {suffix}
          </span>
        )}
      </div>
      )}
      {ring !== undefined && (
        <div style={{ marginTop: 10, height: 3, background: 'rgba(0,0,0,.06)', borderRadius: 2,
          overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, ring * 100)}%`, height: '100%',
            background: 'linear-gradient(90deg, #5b5bf7, #a78bfa)', borderRadius: 2 }}/>
        </div>
      )}
      <div style={{ marginTop: 10, fontSize: 10.5, color: deltaColor,
        display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
        <span style={{ fontSize: 9 }}>{arrow}</span> {delta}
      </div>
    </div>
  );
}

function TodayStrip({ sites, status, goto }) {
  const totalDone = sites.reduce((a, s) => a + s.done, 0);
  const totalAll  = sites.reduce((a, s) => a + s.total, 0);
  const billies = DISPATCHER_BILLIES;
  const working = billies.filter(b => b.state === 'working').length;
  const idle    = billies.filter(b => b.state === 'idle').length;
  const offline = billies.filter(b => b.state === 'offline').length;

  const OPS = [
    { initials: 'OP', name: 'Oded Polak',  shift: '4h 12m', color: '#fb923c' },
    { initials: 'MR', name: 'Maya Reyes',  shift: '2h 48m', color: '#5b5bf7' },
  ];

  const statusColor = status.tone === 'warn' ? '#f59e0b' : '#22c55e';
  const statusBg    = status.tone === 'warn' ? 'rgba(245,158,11,.12)' : 'rgba(34,197,94,.12)';
  const statusText  = status.tone === 'warn' ? '#92400e' : '#15803d';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 14,
      alignItems: 'stretch' }}>

      {/* CELL 1 — rooms today (total + per site) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10,
        padding: '4px 16px 4px 0', borderRight: '1px solid rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="mono" style={{ fontSize: 9.5, letterSpacing: 1.3, fontWeight: 600,
            color: 'rgba(0,0,0,.5)' }}>ROOMS TODAY</span>
          <span style={{ flex: 1 }}/>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '2px 8px', borderRadius: 10, background: statusBg,
            fontSize: 9.5, fontWeight: 700, color: statusText, letterSpacing: .3 }}>
            <span style={{ width: 5, height: 5, borderRadius: 3, background: statusColor }}/>
            {status.label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="mono tnum" style={{ fontSize: 32, fontWeight: 700, color: '#111',
            letterSpacing: -.8, lineHeight: 1,
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{totalDone}</span>
          <span className="mono tnum" style={{ fontSize: 16, color: 'rgba(0,0,0,.4)',
            fontWeight: 500 }}>/ {totalAll}</span>
          <span style={{ flex: 1 }}/>
          <span style={{ fontSize: 11, color: 'rgba(0,0,0,.55)' }}>across {sites.length} sites</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
          {sites.map(s => {
            const pct = s.done / s.total;
            return (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, lineHeight: 1 }}>{s.flag}</span>
                <span style={{ fontSize: 11.5, color: '#111', fontWeight: 500,
                  flexShrink: 0, minWidth: 110, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
                <div style={{ flex: 1, height: 4, background: 'rgba(0,0,0,.06)', borderRadius: 2,
                  overflow: 'hidden' }}>
                  <div style={{ width: `${pct * 100}%`, height: '100%', background: s.tone,
                    borderRadius: 2 }}/>
                </div>
                <span className="mono tnum" style={{ fontSize: 10.5, color: 'rgba(0,0,0,.65)',
                  fontWeight: 600, minWidth: 32, textAlign: 'right' }}>
                  {s.done}/{s.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CELL 2 — active Billies */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10,
        padding: '4px 16px', borderRight: '1px solid rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="mono" style={{ fontSize: 9.5, letterSpacing: 1.3, fontWeight: 600,
            color: 'rgba(0,0,0,.5)' }}>ACTIVE BILLIES</span>
          <span style={{ flex: 1 }}/>
          <a onClick={() => goto('fleet')}
            style={{ fontSize: 10.5, color: '#5b5bf7', cursor: 'pointer', fontWeight: 500 }}>
            Fleet →
          </a>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="mono tnum" style={{ fontSize: 32, fontWeight: 700, color: '#111',
            letterSpacing: -.8, lineHeight: 1,
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            {working + idle}
          </span>
          <span className="mono tnum" style={{ fontSize: 16, color: 'rgba(0,0,0,.4)',
            fontWeight: 500 }}>/ {billies.length}</span>
          <span style={{ flex: 1 }}/>
          <span style={{ fontSize: 11, color: 'rgba(0,0,0,.55)' }}>online now</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#22c55e' }}/>
            <span className="mono tnum" style={{ fontWeight: 600, color: '#111' }}>{working}</span>
            <span style={{ color: 'rgba(0,0,0,.55)' }}>working</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#a3a3a3' }}/>
            <span className="mono tnum" style={{ fontWeight: 600, color: '#111' }}>{idle}</span>
            <span style={{ color: 'rgba(0,0,0,.55)' }}>idle</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: 'rgba(0,0,0,.25)' }}/>
            <span className="mono tnum" style={{ fontWeight: 600, color: '#111' }}>{offline}</span>
            <span style={{ color: 'rgba(0,0,0,.55)' }}>offline</span>
          </span>
        </div>
        {/* compact billie chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          {billies.slice(0, 8).map(b => {
            const tone = b.state === 'working' ? '#22c55e'
              : b.state === 'idle' ? '#a3a3a3'
              : b.state === 'charging' ? '#f59e0b' : 'rgba(0,0,0,.25)';
            return (
              <span key={b.id} className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 6px', borderRadius: 4, fontSize: 9.5, fontWeight: 600,
                color: 'rgba(0,0,0,.7)',
                background: 'rgba(0,0,0,.04)' }}>
                <span style={{ width: 5, height: 5, borderRadius: 3, background: tone }}/>
                {b.id.replace('BILLIE-', 'B')}
              </span>
            );
          })}
        </div>
      </div>

      {/* CELL 3 — operators on shift */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0 4px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="mono" style={{ fontSize: 9.5, letterSpacing: 1.3, fontWeight: 600,
            color: 'rgba(0,0,0,.5)' }}>OPERATORS ON SHIFT</span>
          <span style={{ flex: 1 }}/>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '2px 8px', borderRadius: 10, background: 'rgba(34,197,94,.12)',
            fontSize: 9.5, fontWeight: 700, color: '#15803d', letterSpacing: .3 }}>
            <span style={{ width: 5, height: 5, borderRadius: 3, background: '#22c55e',
              boxShadow: '0 0 5px #22c55e' }}/>
            LIVE
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="mono tnum" style={{ fontSize: 32, fontWeight: 700, color: '#111',
            letterSpacing: -.8, lineHeight: 1,
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{OPS.length}</span>
          <span style={{ flex: 1 }}/>
          <span style={{ fontSize: 11, color: 'rgba(0,0,0,.55)' }}>tele-op coverage</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
          {OPS.map(op => (
            <div key={op.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 13,
                background: `linear-gradient(135deg, ${op.color}aa, ${op.color})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 10, letterSpacing: .3, flexShrink: 0,
                boxShadow: '0 0 0 2px #fff' }}>{op.initials}</div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2,
                minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#111',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {op.name}
                </span>
                <span className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.5)',
                  letterSpacing: .3 }}>
                  on shift · {op.shift}
                </span>
              </div>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: '#22c55e',
                boxShadow: '0 0 5px #22c55e' }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SiteCard({ name, done, total, sub, tone, flag, pulseId }) {
  const pct = done / total;
  const [pulse, setPulse] = React.useState(false);
  const prevPulse = React.useRef(pulseId);
  React.useEffect(() => {
    if (pulseId !== prevPulse.current && pulseId > 0) {
      prevPulse.current = pulseId;
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 1400);
      return () => clearTimeout(t);
    }
  }, [pulseId]);
  return (
    <div style={{ background: '#fafafa',
      border: '1px solid rgba(0,0,0,.08)', borderRadius: 8, padding: '14px 14px 12px',
      display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer',
      transition: 'border-color .15s, background .15s, box-shadow .25s',
      boxShadow: pulse ? `0 0 0 2px ${tone}55` : 'none' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#fafafa'; }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        {flag && <span style={{ fontSize: 16, lineHeight: 1 }}>{flag}</span>}
        <span style={{ fontSize: 15, fontWeight: 600, color: '#111', letterSpacing: -.1,
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{name}</span>
        <span style={{ flex: 1 }}/>
        <span className="mono tnum" style={{ fontSize: 14, fontWeight: 700, color: '#111',
          display: 'inline-flex', alignItems: 'baseline', gap: 4,
          padding: pulse ? '1px 6px' : '1px 0',
          borderRadius: 6,
          background: pulse ? `${tone}22` : 'transparent',
          transition: 'background .25s, padding .25s',
          animation: pulse ? 'siteCountBump .6s ease-out' : 'none' }}>
          {pulse && (
            <span style={{ fontSize: 10, fontWeight: 700, color: tone, marginRight: 2,
              animation: 'siteCountPlus .9s ease-out forwards' }}>+1</span>
          )}
          {done}<span style={{ color: 'rgba(0,0,0,.35)', fontWeight: 500 }}>/{total}</span>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
        <span style={{ width: 5, height: 5, borderRadius: 3, background: tone,
          boxShadow: `0 0 4px ${tone}` }}/>
        <span style={{ color: 'rgba(0,0,0,.6)' }}>{sub}</span>
      </div>
      <div style={{ marginTop: 4, height: 3, background: 'rgba(0,0,0,.06)', borderRadius: 2,
        overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: tone, borderRadius: 2 }}/>
      </div>
    </div>
  );
}

function HomeBillieRow({ b, last }) {
  const TONE = {
    working:  { dot: '#22c55e', label: 'online',  bg: 'rgba(34,197,94,.12)' },
    idle:     { dot: '#22c55e', label: 'online',  bg: 'rgba(34,197,94,.12)' },
    charging: { dot: '#22c55e', label: 'online',  bg: 'rgba(34,197,94,.12)' },
    offline:  { dot: 'rgba(0,0,0,.35)', label: 'offline', bg: 'rgba(0,0,0,.06)' },
  };
  const t = TONE[b.state] || TONE.offline;
  // synthesize an alert for demo rows
  const ALERTS = {
    'Billie-14': { tone: '#ef4444', label: 'Sensor recal needed' },
    'Billie-21': { tone: '#f59e0b', label: 'Battery low · 41%' },
  };
  const alert = ALERTS[b.id];
  const loc = b.room !== '—' ? `${b.floor} · rm ${b.room}` : b.floor === 'svc' ? 'Service bay' : `${b.floor} · dock`;
  const hasOp = b.op && b.op !== '—';
  const opInitials = hasOp ? b.op.replace(/^Dr\.\s+/,'').split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase() : '';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 2px',
      borderBottom: last ? 'none' : '1px solid rgba(0,0,0,.06)' }}>
      <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: '#111',
        letterSpacing: .5, width: 78, flexShrink: 0 }}>{b.id}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flex: '0 0 120px',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>{b.flag}</span>
        <span style={{ fontSize: 11.5, color: 'rgba(0,0,0,.75)', fontWeight: 500 }}>{b.city}</span>
      </span>
      <span style={{ fontSize: 11, color: 'rgba(0,0,0,.5)', flex: '0 0 82px',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {loc}
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flex: '0 0 130px',
        whiteSpace: 'nowrap', overflow: 'hidden' }}>
        {hasOp ? (
          <>
            <span style={{ width: 18, height: 18, borderRadius: 9,
              background: 'linear-gradient(135deg, #c7d2fe, #818cf8)',
              color: '#312e81', fontSize: 8.5, fontWeight: 700, letterSpacing: .2,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0 }}>{opInitials}</span>
            <span style={{ fontSize: 11, color: '#111', fontWeight: 500,
              overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.op}</span>
          </>
        ) : (
          <span style={{ fontSize: 10.5, color: 'rgba(0,0,0,.3)', fontStyle: 'italic' }}>unassigned</span>
        )}
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '3px 8px', borderRadius: 10, background: t.bg,
        fontSize: 10.5, fontWeight: 600, color: 'rgba(0,0,0,.75)', letterSpacing: .3,
        flexShrink: 0 }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: t.dot,
          boxShadow: t.label === 'online' ? `0 0 5px ${t.dot}` : 'none' }}/>
        {t.label}
      </span>
      <span style={{ flex: 1 }}/>
      {alert ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11,
          color: alert.tone, fontWeight: 600, flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 1.5L.8 12.5h12.4L7 1.5z"/><path d="M7 5.5v3.2M7 10.3v.01"/>
          </svg>
          {alert.label}
        </span>
      ) : (
        <span style={{ fontSize: 10.5, color: 'rgba(0,0,0,.35)' }}>—</span>
      )}
    </div>
  );
}

function AITaskChart({ data }) {
  const sorted = [...data].sort((a, b) => (a.ok / a.total) - (b.ok / b.total));
  const toneFor = (p) => p >= .9 ? '#22c55e' : p >= .7 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {sorted.map((t, i) => {
        const p = t.ok / t.total;
        const tone = toneFor(p);
        const trendUp = t.trend > 0;
        return (
          <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 12,
            padding: '9px 4px', borderBottom: i === sorted.length - 1 ? 'none' : '1px solid rgba(0,0,0,.05)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: tone,
              flexShrink: 0, boxShadow: `0 0 5px ${tone}80` }}/>
            <span className="mono" style={{ fontSize: 12, color: '#111',
              flex: '0 0 260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t.name}
            </span>
            <div style={{ flex: 1, height: 8, background: '#f1f5f9',
              border: '1px solid rgba(0,0,0,.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${p * 100}%`, height: '100%',
                background: `linear-gradient(90deg, ${tone}, ${tone}cc)`,
                transition: 'width .3s' }}/>
            </div>
            <span className="mono tnum" style={{ fontSize: 11, color: 'rgba(0,0,0,.6)',
              width: 66, textAlign: 'right' }}>
              {t.ok}/{t.total}
            </span>
            <span className="mono tnum" style={{ fontSize: 12, fontWeight: 700, color: tone,
              width: 52, textAlign: 'right' }}>
              {(p * 100).toFixed(1)}%
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 600, width: 48, textAlign: 'right',
              color: trendUp ? '#15803d' : '#c2410c',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
              <span style={{ fontSize: 8 }}>{trendUp ? '▲' : '▼'}</span>
              {Math.abs(t.trend).toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LegendDotLight({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, color: 'rgba(0,0,0,.55)' }}>
      <span style={{ width: 7, height: 7, borderRadius: 2, background: color }}/>
      {label}
    </span>
  );
}

function BillieInspectionChart({ data, target }) {
  const max = Math.max(...data.map(d => d.avg), target + 6);
  const toneFor = (v) => v <= target ? '#22c55e' : v <= target + 2 ? '#f59e0b' : '#ef4444';
  const fmt = (min) => {
    const m = Math.floor(min);
    const s = Math.round((min - m) * 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {data.map((b) => {
        const pct = (b.avg / max) * 100;
        const targetPct = (target / max) * 100;
        const tone = toneFor(b.avg);
        const trendUp = b.trend > 0;
        const trendSig = Math.abs(b.trend);
        return (
          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: '#111',
              width: 78, letterSpacing: .4 }}>{b.id}</span>
            <div style={{ flex: 1, position: 'relative', height: 22, background: '#f8fafc',
              border: '1px solid rgba(0,0,0,.06)', borderRadius: 4, overflow: 'hidden' }}>
              {/* bar */}
              <div style={{ width: `${pct}%`, height: '100%',
                background: `linear-gradient(90deg, ${tone}, ${tone}dd)`,
                transition: 'width .3s' }}/>
              {/* target line */}
              <div title={`target ${target}:00`} style={{ position: 'absolute',
                top: -2, bottom: -2, left: `${targetPct}%`,
                width: 1.5, background: 'rgba(0,0,0,.45)',
                boxShadow: '0 0 0 2px rgba(24,24,27,.62)' }}/>
              {/* weekly mini dots inside bar */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', gap: 3, padding: '0 8px', pointerEvents: 'none' }}>
                {b.week.map((v, i) => {
                  const hit = v <= target;
                  return (
                    <span key={i} style={{ width: 3, height: 3, borderRadius: 2,
                      background: hit ? 'rgba(24,24,27,.72)' : 'rgba(0,0,0,.35)' }}/>
                  );
                })}
              </div>
              {/* value */}
              <span className="mono tnum" style={{ position: 'absolute', right: 8,
                top: 0, bottom: 0, display: 'flex', alignItems: 'center',
                fontSize: 11, fontWeight: 700,
                color: b.avg > target + 2 ? '#fff' : 'rgba(0,0,0,.8)' }}>
                {fmt(b.avg)}
              </span>
            </div>
            <span className="mono tnum" style={{ fontSize: 10, color: 'rgba(0,0,0,.55)',
              width: 60, textAlign: 'right' }}>
              {b.rooms} rooms
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 600, width: 52, textAlign: 'right',
              color: trendUp ? '#c2410c' : '#15803d', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
              <span style={{ fontSize: 8 }}>{trendUp ? '▲' : '▼'}</span>
              {trendSig.toFixed(1)}m
            </span>
          </div>
        );
      })}
      {/* x-axis */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, paddingLeft: 88 }}>
        <div style={{ flex: 1, position: 'relative', height: 14 }}>
          {[0, 10, 20, 30].filter(v => v <= max).map(v => (
            <div key={v} style={{ position: 'absolute', left: `${(v/max)*100}%`,
              top: 0, transform: 'translateX(-50%)',
              fontSize: 9.5, color: 'rgba(0,0,0,.45)', fontFamily: 'var(--mono)' }}>
              {v}m
            </div>
          ))}
          <div style={{ position: 'absolute', left: `${(target/max)*100}%`,
            top: 0, transform: 'translateX(-50%)',
            fontSize: 9.5, color: '#111', fontFamily: 'var(--mono)', fontWeight: 600 }}>
            ▲ {target}m
          </div>
        </div>
        <span style={{ width: 60 }}/>
        <span style={{ width: 52 }}/>
      </div>
    </div>
  );
}

function AutonomyChart({ data, target }) {
  const H = 190;
  const W_PAD = 40;
  const pct2y = (v) => H - (v / 100) * H;
  return (
    <div style={{ position: 'relative', height: H + 30, paddingLeft: W_PAD, paddingRight: 10 }}>
      {/* y-axis grid */}
      {[100, 75, 50, 25, 0].map(v => (
        <React.Fragment key={v}>
          <div style={{ position: 'absolute', left: 0, top: pct2y(v) - 6, width: W_PAD - 8,
            fontSize: 9.5, color: 'rgba(0,0,0,.35)', textAlign: 'right',
            fontFamily: 'var(--mono)' }}>{v}%</div>
          <div style={{ position: 'absolute', left: W_PAD, right: 10, top: pct2y(v),
            height: 1, background: 'rgba(0,0,0,.06)' }}/>
        </React.Fragment>
      ))}
      {/* target line */}
      <div style={{ position: 'absolute', left: W_PAD, right: 10, top: pct2y(target),
        height: 1, background: 'transparent', borderTop: '1px dashed rgba(220,38,38,.6)' }}/>
      <div style={{ position: 'absolute', right: 10, top: pct2y(target) - 16,
        fontSize: 10, color: '#b91c1c', fontWeight: 600, letterSpacing: .3,
        background: '#fff', padding: '0 4px' }}>
        target {target}%
      </div>
      {/* bars */}
      <div style={{ position: 'absolute', left: W_PAD, right: 10, top: 0, bottom: 30,
        display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        {data.map(({ d, v, n, partial }) => {
          const hit = v >= target;
          const h = (v / 100) * H;
          return (
            <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 6 }}>
              <div style={{ width: '100%', maxWidth: 58, height: h, position: 'relative',
                background: partial
                  ? 'repeating-linear-gradient(135deg, #fcd34d 0 6px, #fde68a 6px 12px)'
                  : hit
                    ? 'linear-gradient(180deg, #fcd34d, #fbbf24)'
                    : 'linear-gradient(180deg, #c7d2fe, #a5b4fc)',
                border: `1px solid ${partial ? '#f59e0b' : hit ? '#f59e0b' : '#818cf8'}`,
                borderBottom: 'none',
                borderRadius: '3px 3px 0 0',
                boxShadow: partial ? '0 0 0 2px rgba(251,191,36,.18)' : 'none' }}>
                {/* total on top of bar */}
                {n != null && (
                  <span className="mono tnum" style={{ position: 'absolute', top: -18, left: 0, right: 0,
                    textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,.7)',
                    letterSpacing: .3 }}>{partial ? `${n}·` : n}</span>
                )}
                <span className="mono tnum" style={{ position: 'absolute', top: 6, left: 0, right: 0,
                  textAlign: 'center', fontSize: 11, fontWeight: 700,
                  color: partial ? '#78350f' : hit ? '#78350f' : '#312e81' }}>{v}%</span>
              </div>
            </div>
          );
        })}
      </div>
      {/* x labels */}
      <div style={{ position: 'absolute', left: W_PAD, right: 10, bottom: 0, height: 24,
        display: 'flex', gap: 10 }}>
        {data.map(({ d, flag, partial }) => (
          <div key={d} style={{ flex: 1, textAlign: 'center', fontSize: 12,
            color: partial ? '#b45309' : 'rgba(0,0,0,.6)',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontStyle: 'normal', fontWeight: partial ? 600 : 400,
            paddingTop: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            whiteSpace: 'nowrap' }}>
            {flag && <span style={{ fontSize: 14, lineHeight: 1 }}>{flag}</span>}
            {d}{partial ? ' ·' : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

function DispatcherView() {
  const [filter, setFilter] = React.useState('Marriott Rome');
  const cols = DISPATCHER_DATA;
  const [clock, setClock] = React.useState('16:30');
  const [sideTab, setSideTab] = React.useState('activity');
  React.useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setClock(String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'));
    }, 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden',
      background: '#fbfbfa',
      fontFamily: 'Inter, var(--sans)', color: '#17171a',
      display: 'flex', flexDirection: 'row' }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ padding: '16px 24px 14px', display: 'flex', alignItems: 'center', gap: 20,
        borderBottom: '1px solid rgba(24,24,27,.05)',
        background: 'linear-gradient(180deg, rgba(255,255,255,.02), transparent)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -.3, color: '#17171a' }}>Dispatcher</div>
            <span className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.42)' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 3,
                background: '#22c55e', marginRight: 5, boxShadow: '0 0 4px #22c55e' }}/>
              synced · {clock}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(24,24,27,.52)', marginTop: 4 }}>
            {filter} · Evening Shift · rooms flow left → right
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
          <DispatcherStat label="ROOMS TODAY" value="40"/>
          <DispatcherStat label="ACTIVE" value="8" tone="#8787ff" sub="in motion"/>
          <DispatcherStat label="THROUGHPUT" value="14" sub="↑ 21%" tone="#4ade80"/>
          <DispatcherStat label="AVG CYCLE" value="21m" sub="target 25m"/>
          <DispatcherStat label="PMS FAILS" value="1" tone="#fb923c"/>
        </div>
      </div>

      {/* filter rail */}
      <div style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid rgba(24,24,27,.04)' }}>
        <span className="mono" style={{ fontSize: 9, color: 'rgba(24,24,27,.35)', letterSpacing: 1.2 }}>PROPERTY</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {DISPATCHER_PROPERTIES.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '4px 10px', border: 'none', cursor: 'pointer',
                background: filter === f ? 'rgba(91,91,247,.2)' : 'rgba(255,255,255,.03)',
                color: filter === f ? '#fff' : 'rgba(24,24,27,.58)',
                border: `1px solid ${filter === f ? 'rgba(91,91,247,.5)' : 'rgba(24,24,27,.06)'}`,
                borderRadius: 4, fontFamily: 'inherit', fontSize: 11, fontWeight: filter === f ? 600 : 500,
                display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: 3,
                background: PROPERTY_COLORS[f] || '#fff' }}/>
              <span style={{ fontSize: 11 }}>{PROPERTY_FLAGS[f]}</span>
              {f}
            </button>
          ))}
        </div>
        <span style={{ flex: 1 }}/>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <LegendDot color="#f59e0b" label="queued"/>
          <LegendDot color="#5b5bf7" label="in-flight"/>
          <LegendDot color="#a78bfa" label="closed"/>
        </div>
        <span style={{ width: 1, height: 16, background: 'rgba(24,24,27,.06)' }}/>
        <button style={{ padding: '4px 10px', border: '1px solid rgba(24,24,27,.07)',
          background: 'rgba(255,255,255,.03)', color: '#17171a',
          borderRadius: 4, fontFamily: 'inherit', fontSize: 11, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Add task
        </button>
      </div>

      {/* board */}
      <div style={{ flex: 1, minHeight: 0, padding: '14px 18px 0',
        display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12,
        overflow: 'hidden' }}>
        <DispatcherColumn col={cols.todo}>
          {cols.todo.floors.map((fl, fi) => (
            <React.Fragment key={fi}>
              <FloorLabel count={fl.carts ? `${fl.carts} carts` : fl.rooms.length}>{fl.name}</FloorLabel>
              {fl.carts ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', background: '#fffbeb',
                  border: '1px dashed rgba(245,158,11,.55)', borderRadius: 6 }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>🛒</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#78350f', letterSpacing: -.1 }}>
                      {fl.carts} carts waiting
                    </span>
                    <span className="mono" style={{ fontSize: 9.5, color: 'rgba(120,53,15,.65)',
                      letterSpacing: .4 }}>
                      Ready to stock · no Billie assigned
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {fl.rooms.map((r, i) => <RoomChip key={i} {...r}/>)}
                </div>
              )}
            </React.Fragment>
          ))}
        </DispatcherColumn>

        <DispatcherColumn col={cols.ready}>
          <ReadyColumn floors={cols.ready.floors}/>
        </DispatcherColumn>

        <DispatcherColumn col={cols.progress}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cols.progress.liveCards.map((c, i) => <LiveCard key={i} {...c}/>)}
          </div>
          <div style={{ flex: 1 }}/>
          <div style={{ padding: '8px 10px', background: '#f8fafc',
            border: '1px dashed rgba(0,0,0,.15)', borderRadius: 5,
            fontSize: 10.5, color: 'rgba(0,0,0,.55)', textAlign: 'center' }}>
            Capacity: 8 / 12 Billies in motion
          </div>
        </DispatcherColumn>

        <DispatcherColumn col={cols.done}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {cols.done.rows.map((r, i) => <DoneRow key={i} {...r}/>)}
          </div>
        </DispatcherColumn>
      </div>

      {/* activity ticker */}
      <DispatcherActivity/>
      </div>
      {/* right sidebar */}
      <DispatcherSidebar tab={sideTab} setTab={setSideTab}/>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, color: 'rgba(24,24,27,.52)' }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: color,
        boxShadow: `0 0 4px ${color}` }}/>
      {label}
    </span>
  );
}

function DispatcherSidebar({ tab, setTab }) {
  const TABS = [
    { v: 'agent',    label: 'Agent' },
    { v: 'billies',  label: 'Billies' },
    { v: 'activity', label: 'Activity' },
  ];
  const [width, setWidth] = React.useState(() => {
    const saved = Number(localStorage.getItem('sidebarW'));
    return saved >= 260 && saved <= 640 ? saved : 320;
  });
  const dragging = React.useRef(false);
  React.useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const newW = Math.max(260, Math.min(640, window.innerWidth - e.clientX));
      setWidth(newW);
    };
    const onUp = () => {
      if (dragging.current) {
        dragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        localStorage.setItem('sidebarW', String(width));
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [width]);
  const startDrag = (e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };
  return (
    <aside style={{ width, flexShrink: 0, background: '#ffffff',
      borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
      {/* resize handle */}
      <div onMouseDown={startDrag}
        title="Drag to resize"
        style={{ position: 'absolute', left: -3, top: 0, bottom: 0, width: 6,
          cursor: 'col-resize', zIndex: 5,
          background: 'transparent' }}
        onMouseEnter={(e) => e.currentTarget.firstChild.style.opacity = '1'}
        onMouseLeave={(e) => { if (!dragging.current) e.currentTarget.firstChild.style.opacity = '0'; }}>
        <div style={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)',
          width: 2, height: 36, borderRadius: 2, background: '#5b5bf7',
          opacity: 0, transition: 'opacity .15s' }}/>
      </div>
      {/* header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={window.__resources?.billie_boss_logo_jpg || (window.__resources?.billie_boss_logo_jpg || "billie-boss-logo.jpg")} alt="" style={{ width: 26, height: 26, borderRadius: 13,
          objectFit: 'cover', background: '#f5f5f4', border: '1px solid var(--border)' }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Billie Boss</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>watching the floor · 12 Billies</div>
        </div>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--ok)' }}/>
      </div>
      {/* tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 8px' }}>
        {TABS.map(t => {
          const on = tab === t.v;
          return (
            <button key={t.v} onClick={() => setTab(t.v)}
              style={{ flex: 1, padding: '10px 8px', border: 'none', background: 'transparent',
                color: on ? 'var(--ink)' : 'var(--ink-3)',
                borderBottom: `2px solid ${on ? 'var(--ink)' : 'transparent'}`,
                fontFamily: 'inherit', fontSize: 12.5, fontWeight: on ? 600 : 500, cursor: 'pointer',
                marginBottom: -1 }}>
              {t.label}
            </button>
          );
        })}
      </div>
      {/* panel */}
      {tab === 'agent' && <DispatcherAgentPanel/>}
      {tab === 'billies' && <DispatcherBilliesPanel/>}
      {tab === 'activity' && <DispatcherActivityPanel/>}
    </aside>
  );
}

function DispatcherAgentPanel() {
  const SUGGESTIONS = [
    "What's blocking 1208?",
    "Who's free on Floor 2?",
    "Summarize the shift so far",
    "Why is Billie-21 charging?",
  ];
  const [msgs, setMsgs] = React.useState([
    { who: 'boss', t: "Evening — 12 Billies online. 8 working, 2 idle on F2/F3, 1 charging, 1 in service. 1208 is stuck in QA on a minibar mismatch." },
    { who: 'me',   t: "Throughput trend?" },
    { who: 'boss', t: "14 rooms closed so far, +21% vs yesterday same hour. Avg cycle 21m (target 25m). You're ahead." },
  ]);
  const [draft, setDraft] = React.useState('');
  const send = (text) => {
    const t = (text ?? draft).trim();
    if (!t) return;
    setMsgs(m => [...m, { who: 'me', t }, { who: 'boss', t: "On it — pulling that up now." }]);
    setDraft('');
  };
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '14px 14px 6px',
        display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map((m, i) => m.who === 'boss' ? (
          <div key={i} style={{ display: 'flex', gap: 8 }}>
            <img src={window.__resources?.billie_boss_logo_jpg || (window.__resources?.billie_boss_logo_jpg || "billie-boss-logo.jpg")} alt="" style={{ width: 20, height: 20, borderRadius: 10,
              objectFit: 'cover', background: '#fff', flexShrink: 0, marginTop: 2,
              border: '1px solid var(--border)' }}/>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '8px 11px', fontSize: 12.5, lineHeight: 1.45,
              color: 'var(--ink-1)', maxWidth: 240 }}>{m.t}</div>
          </div>
        ) : (
          <div key={i} style={{ alignSelf: 'flex-end', background: 'var(--ink)',
            borderRadius: 10, padding: '7px 11px',
            fontSize: 12.5, lineHeight: 1.4, color: '#fff', maxWidth: 230 }}>{m.t}</div>
        ))}
      </div>
      <div style={{ padding: '6px 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => send(s)}
            style={{ padding: '4px 10px', border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--ink-2)',
              borderRadius: 999, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer' }}>
            {s}
          </button>
        ))}
      </div>
      <div style={{ padding: '8px 12px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '6px 8px 6px 10px' }}>
          <input value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
            placeholder="Ask Billie Boss…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--ink)', fontFamily: 'inherit', fontSize: 12.5 }}/>
          <button onClick={() => send()}
            style={{ border: 'none', background: 'var(--ink)', color: '#fff',
              width: 24, height: 24, borderRadius: 5, cursor: 'pointer', fontSize: 13, lineHeight: 1 }}>↑</button>
        </div>
      </div>
    </div>
  );
}

function DispatcherBilliesPanel() {
  const STATE_TONE = {
    working:  { bg: 'rgba(91,91,247,.18)',  br: 'rgba(91,91,247,.45)',  fg: '#c7d2fe', dot: '#5b5bf7' },
    idle:     { bg: 'rgba(34,197,94,.12)',  br: 'rgba(34,197,94,.35)',  fg: '#bbf7d0', dot: '#22c55e' },
    charging: { bg: 'rgba(245,158,11,.15)', br: 'rgba(245,158,11,.4)',  fg: '#fde68a', dot: '#f59e0b' },
    offline:  { bg: 'rgba(24,24,27,.04)',br: 'rgba(24,24,27,.07)', fg: 'rgba(24,24,27,.48)', dot: 'rgba(24,24,27,.28)' },
  };
  const counts = DISPATCHER_BILLIES.reduce((a, b) => { a[b.state] = (a[b.state]||0)+1; return a; }, {});
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '12px 14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginBottom: 12 }}>
        {['working','idle','charging','offline'].map(s => (
          <div key={s} style={{ background: 'rgba(255,255,255,.03)',
            border: '1px solid rgba(24,24,27,.055)', borderRadius: 5, padding: '5px 6px',
            textAlign: 'center' }}>
            <div className="tnum" style={{ fontSize: 16, fontWeight: 700, color: STATE_TONE[s].dot, lineHeight: 1 }}>{counts[s]||0}</div>
            <div className="mono" style={{ fontSize: 8.5, color: 'rgba(24,24,27,.48)',
              letterSpacing: .8, marginTop: 2, textTransform: 'uppercase' }}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {DISPATCHER_BILLIES.map(b => {
          const tone = STATE_TONE[b.state];
          return (
            <div key={b.id} style={{ background: 'rgba(255,255,255,.03)',
              border: '1px solid rgba(24,24,27,.06)', borderRadius: 6, padding: '8px 10px',
              display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: tone.dot,
                  boxShadow: b.state !== 'offline' ? `0 0 5px ${tone.dot}` : 'none', flexShrink: 0 }}/>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#17171a' }}>{b.id}</span>
                <span className="mono" style={{ fontSize: 9, color: tone.fg, background: tone.bg,
                  border: `1px solid ${tone.br}`, padding: '1px 6px', borderRadius: 3,
                  textTransform: 'uppercase', letterSpacing: .6 }}>{b.state}</span>
                <span style={{ flex: 1 }}/>
                {b.room !== '—' && (
                  <span className="mono tnum" style={{ fontSize: 10.5, color: '#17171a' }}>{b.room}</span>
                )}
                <span className="mono" style={{ fontSize: 9.5,
                  color: b.batt > 50 ? 'rgba(24,24,27,.52)' : b.batt > 20 ? '#f59e0b' : '#ef4444' }}>
                  {b.batt}%
                </span>
              </div>
              <div style={{ fontSize: 10.5, color: 'rgba(24,24,27,.55)', marginLeft: 13 }}>
                {b.task}
                {b.op && b.op !== '—' && <span style={{ color: 'rgba(24,24,27,.35)' }}> · {b.op}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DispatcherActivityPanel() {
  const TONE = { start: '#5b5bf7', release: '#a78bfa', flag: '#fb923c', qa: '#f97316', done: '#22c55e', teleop: '#fbbf24' };
  const [extra, setExtra] = React.useState([]);
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  React.useEffect(() => {
    const onTask = (e) => {
      const d = e.detail;
      const entry = {
        id: d.id,
        t: d.t,
        kind: d.manual ? 'teleop' : 'done',
        txt: `${d.robot} finished rm ${d.room} · ${d.flag} ${d.hotel}`,
        sub: d.manual
          ? `took ${d.duration} · tele-op assisted · ${d.reason}`
          : `took ${d.duration} · fully autonomous`,
        fresh: true,
      };
      setExtra(prev => [entry, ...prev].slice(0, 20));
      // clear fresh flag after animation
      setTimeout(() => {
        setExtra(prev => prev.map(x => x.id === entry.id ? { ...x, fresh: false } : x));
      }, 1600);
    };
    window.addEventListener('task-complete', onTask);
    return () => window.removeEventListener('task-complete', onTask);
  }, []);
  const allRows = [...extra, ...DISPATCHER_ACTIVITY_FULL];
  const FILTERS = [
    { v: 'all',     label: 'All' },
    { v: 'done',    label: 'Done',    kinds: ['done'] },
    { v: 'teleop',  label: 'Tele-op', kinds: ['teleop'] },
    { v: 'flag',    label: 'Flags',   kinds: ['flag'] },
    { v: 'qa',      label: 'QA',      kinds: ['qa', 'release'] },
  ];
  const active = FILTERS.find(f => f.v === filter);
  const rows = allRows.filter(a => {
    if (active && active.kinds && !active.kinds.includes(a.kind)) return false;
    if (q) {
      const hay = `${a.txt} ${a.sub} ${a.t}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* search + filters */}
      <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(24,24,27,.4)' }}>
            <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="2"/>
            <path d="m15 15 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search activity…"
            style={{ width: '100%', boxSizing: 'border-box',
              padding: '7px 10px 7px 30px', fontSize: 12,
              border: '1px solid var(--border)', borderRadius: 6,
              background: '#fafafa', color: '#17171a',
              fontFamily: 'inherit', outline: 'none' }}
            onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#5b5bf7'; }}
            onBlur={(e) => { e.target.style.background = '#fafafa'; e.target.style.borderColor = 'var(--border)'; }}
          />
          {q && (
            <button onClick={() => setQ('')}
              style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                border: 'none', background: 'transparent', cursor: 'pointer',
                color: 'rgba(24,24,27,.5)', fontSize: 14, padding: '2px 6px', lineHeight: 1 }}>
              ×
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {FILTERS.map(f => {
            const on = filter === f.v;
            const dot = f.kinds && f.kinds[0] && TONE[f.kinds[0]];
            return (
              <button key={f.v} onClick={() => setFilter(f.v)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 9px', borderRadius: 12,
                  border: `1px solid ${on ? '#17171a' : 'var(--border)'}`,
                  background: on ? '#17171a' : '#fff',
                  color: on ? '#fff' : 'var(--ink-2)',
                  fontSize: 11, fontWeight: on ? 600 : 500,
                  fontFamily: 'inherit', cursor: 'pointer' }}>
                {dot && <span style={{ width: 6, height: 6, borderRadius: 3, background: dot }}/>}
                {f.label}
              </button>
            );
          })}
          <span style={{ flex: 1 }}/>
          <span className="mono" style={{ fontSize: 9.5, color: 'rgba(24,24,27,.45)',
            letterSpacing: .5, alignSelf: 'center' }}>
            {rows.length}/{allRows.length}
          </span>
        </div>
      </div>
      {/* list */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '12px 14px' }}>
        {rows.length === 0 ? (
          <div style={{ padding: '24px 8px', textAlign: 'center',
            fontSize: 11.5, color: 'rgba(24,24,27,.45)' }}>
            No matching activity
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rows.map((a, i) => (
              <div key={a.id || i} style={{ display: 'flex', gap: 10, paddingBottom: 12, position: 'relative',
                animation: a.fresh ? 'activityFlash 1.4s ease-out' : 'none',
                borderRadius: 6 }}>
                <div style={{ width: 44, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="mono tnum" style={{ fontSize: 10, color: 'rgba(24,24,27,.52)' }}>{a.t}</span>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: TONE[a.kind] || '#fff',
                    marginTop: 4, boxShadow: `0 0 4px ${TONE[a.kind] || '#fff'}` }}/>
                  {i < rows.length - 1 && (
                    <span style={{ flex: 1, width: 1, background: 'rgba(24,24,27,.07)', marginTop: 3 }}/>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
                  <div style={{ fontSize: 11.5, color: '#17171a', lineHeight: 1.35 }}>{a.txt}</div>
                  <div style={{ fontSize: 10, color: 'rgba(24,24,27,.48)', marginTop: 2, lineHeight: 1.3 }}>{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DispatcherActivity() {
  return (
    <div style={{ borderTop: '1px solid rgba(24,24,27,.05)',
      background: 'rgba(255,255,255,.02)',
      padding: '10px 24px 12px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 9, letterSpacing: 1.2, color: 'rgba(24,24,27,.35)' }}>ACTIVITY</span>
        <span style={{ height: 1, flex: 1, background: 'rgba(24,24,27,.05)' }}/>
        <span style={{ fontSize: 10, color: 'rgba(24,24,27,.42)' }}>last 30 min</span>
      </div>
      <div style={{ display: 'flex', gap: 14, overflow: 'hidden', flexWrap: 'nowrap' }}>
        {DISPATCHER_ACTIVITY.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 10.5, color: 'rgba(24,24,27,.62)', flexShrink: 0 }}>
            <span className="mono" style={{ fontSize: 10, color: 'rgba(24,24,27,.35)' }}>{a.t}</span>
            <span style={{ width: 5, height: 5, borderRadius: 3,
              background: { start: '#5b5bf7', release: '#a78bfa', flag: '#fb923c', qa: '#f97316' }[a.kind] || '#fff' }}/>
            <span>{a.txt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DispatcherStat({ label, value, tone, sub }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      padding: '6px 12px', background: 'rgba(255,255,255,.03)',
      border: '1px solid rgba(24,24,27,.055)', borderRadius: 6, lineHeight: 1.1,
      minWidth: 78 }}>
      <span className="mono" style={{ fontSize: 9, color: 'rgba(24,24,27,.42)', letterSpacing: 1.1,
        whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 3 }}>
        <span className="tnum" style={{ fontSize: 18, fontWeight: 700, color: tone || '#fff', lineHeight: 1 }}>{value}</span>
        {sub && <span style={{ fontSize: 9.5, color: tone || 'rgba(24,24,27,.48)',
          fontWeight: 500 }}>{sub}</span>}
      </div>
    </div>
  );
}

function DispatcherColumn({ col, children }) {
  // live "last updated" timestamp for the Ready column
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (col.label !== 'Ready') return;
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, [col.label]);
  const lastUpdated = React.useMemo(() => {
    if (col.label !== 'Ready') return null;
    const d = new Date();
    return d.toTimeString().slice(0, 5); // HH:MM
  }, [tick, col.label]);

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.1)',
      borderRadius: 8, padding: 0, display: 'flex', flexDirection: 'column',
      minHeight: 0, overflow: 'hidden',
      color: '#111',
      boxShadow: '0 4px 14px rgba(0,0,0,.4)' }}>
      {/* header */}
      <div style={{ padding: '11px 12px 9px', borderBottom: '1px solid rgba(0,0,0,.08)',
        background: `linear-gradient(180deg, ${col.accent}1a, #fff)`,
        position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: col.accent }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: 3.5, background: col.accent }}/>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111', letterSpacing: .1 }}>{col.label}</span>
          {lastUpdated && (
            <span className="mono" title={`Last updated at ${lastUpdated}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 9.5, fontWeight: 600, letterSpacing: .3,
                color: 'rgba(24,24,27,.55)',
                padding: '1px 6px', borderRadius: 3,
                background: 'rgba(24,24,27,.04)',
                border: '1px solid rgba(24,24,27,.08)',
              }}>
              <span style={{ width: 5, height: 5, borderRadius: 2.5, background: '#22c55e',
                boxShadow: '0 0 4px #22c55e',
                animation: 'billPulse 1.4s ease-in-out infinite' }}/>
              updated {lastUpdated}
            </span>
          )}
          <span style={{ flex: 1 }}/>
          <span className="mono tnum" style={{ fontSize: 10.5, fontWeight: 700, color: '#111',
            background: '#f4f4f5', border: '1px solid rgba(0,0,0,.1)',
            padding: '2px 8px', borderRadius: 10 }}>
            {col.count}{col.delta ? <span style={{ color: col.accent, marginLeft: 5 }}>{col.delta}</span> : ''}
          </span>
        </div>
        {col.sub && (
          <div className="mono" style={{ fontSize: 9, letterSpacing: 1.2,
            color: 'rgba(0,0,0,.5)', marginTop: 4 }}>{col.sub}</div>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 10,
        display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function FloorLabel({ children, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: 1.2,
        color: 'rgba(0,0,0,.5)' }}>{children.toUpperCase()}</div>
      {(typeof count === 'number' || typeof count === 'string') && (
        <span className="mono" style={{ fontSize: 9, color: 'rgba(0,0,0,.35)' }}>· {count}</span>
      )}
      <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,.06)' }}/>
    </div>
  );
}

function RoomChip({ n, highlight, kind, priority }) {
  const isCheckout = kind === 'checkout';
  return (
    <div title={`${n} · ${kind || ''}`}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center',
      justifyContent: 'center', minWidth: 50,
      padding: '6px 9px', borderRadius: 5,
      background: highlight ? '#fef3c7' : '#f8f8f8',
      border: `1px solid ${highlight ? '#f59e0b' : 'rgba(0,0,0,.1)'}`,
      fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
      color: highlight ? '#92400e' : '#111', cursor: 'pointer' }}>
      {isCheckout && (
        <span style={{ position: 'absolute', top: 3, left: 3,
          width: 4, height: 4, borderRadius: 2, background: '#ec4899' }} title="check-out"/>
      )}
      {n}
      {priority === 'P1' && !highlight && (
        <span style={{ marginLeft: 5, fontSize: 8.5, fontWeight: 700,
          color: '#d97706', letterSpacing: .3 }}>P1</span>
      )}
      {highlight && (
        <span style={{ position: 'absolute', top: -5, right: -3,
          fontSize: 10, color: '#d97706', lineHeight: 1 }}>△</span>
      )}
    </div>
  );
}

function ReadyColumn({ floors: initFloors }) {
  const [floors, setFloors] = React.useState(initFloors);
  const [dragKey, setDragKey] = React.useState(null);

  const togglePriority = (fi, ri) => {
    setFloors(prev => prev.map((fl, i) => i !== fi ? fl : {
      ...fl,
      rooms: fl.rooms.map((r, j) => j !== ri ? r : { ...r, priority: !r.priority })
    }));
  };
  const onDragStart = (fi, ri) => (e) => {
    setDragKey(`${fi}:${ri}`);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const onDrop = (fi, ri) => (e) => {
    e.preventDefault();
    if (!dragKey) return;
    const [sfi, sri] = dragKey.split(':').map(Number);
    if (sfi !== fi) { setDragKey(null); return; } // same floor only for simplicity
    setFloors(prev => prev.map((fl, i) => {
      if (i !== fi) return fl;
      const rooms = [...fl.rooms];
      const [moved] = rooms.splice(sri, 1);
      rooms.splice(ri, 0, moved);
      return { ...fl, rooms };
    }));
    setDragKey(null);
  };

  return (
    <>
      {floors.map((fl, fi) => (
        <React.Fragment key={fi}>
          <FloorLabel count={fl.rooms.length}>{fl.name}</FloorLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {fl.rooms.map((r, ri) => (
              <ReadyCard key={`${fi}-${ri}-${r.n}`} {...r}
                dragging={dragKey === `${fi}:${ri}`}
                onTogglePriority={() => togglePriority(fi, ri)}
                onDragStart={onDragStart(fi, ri)}
                onDragOver={onDragOver}
                onDrop={onDrop(fi, ri)}/>
            ))}
          </div>
        </React.Fragment>
      ))}
    </>
  );
}

function ReadyCard({ n, meta, eta, guest, flag, kind, priority, onTogglePriority, onDragStart, onDragOver, onDrop, dragging }) {
  return (
    <div draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{ position: 'relative', background: priority ? '#fef3c7' : '#fffbeb',
      border: `1px solid ${priority ? '#f59e0b' : '#fcd34d'}`,
      borderRadius: 6, padding: '8px 10px', cursor: 'grab',
      opacity: dragging ? .4 : 1,
      display: 'flex', flexDirection: 'column', gap: 3,
      transition: 'background .15s' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        {/* drag handle dots */}
        <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 1,
          marginRight: 2, opacity: .35 }}>
          <span style={{ display: 'flex', gap: 1 }}>
            <span style={{ width: 2, height: 2, borderRadius: 1, background: 'rgba(0,0,0,.35)' }}/>
            <span style={{ width: 2, height: 2, borderRadius: 1, background: 'rgba(0,0,0,.35)' }}/>
          </span>
          <span style={{ display: 'flex', gap: 1 }}>
            <span style={{ width: 2, height: 2, borderRadius: 1, background: 'rgba(0,0,0,.35)' }}/>
            <span style={{ width: 2, height: 2, borderRadius: 1, background: 'rgba(0,0,0,.35)' }}/>
          </span>
          <span style={{ display: 'flex', gap: 1 }}>
            <span style={{ width: 2, height: 2, borderRadius: 1, background: 'rgba(0,0,0,.35)' }}/>
            <span style={{ width: 2, height: 2, borderRadius: 1, background: 'rgba(0,0,0,.35)' }}/>
          </span>
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: '#111' }}>{n}</span>
        <span style={{ fontSize: 9.5, color: 'rgba(0,0,0,.5)', textTransform: 'capitalize' }}>
          · {guest}
        </span>
        <span style={{ flex: 1 }}/>
        <span className="mono" style={{ fontSize: 9.5, fontWeight: 700, color: '#b45309' }}>in {eta}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="mono" style={{ fontSize: 9, color: 'rgba(0,0,0,.45)' }}>{meta}</span>
        <span style={{ flex: 1 }}/>
        {kind === 'checkout' && (
          <span style={{ fontSize: 8.5, fontWeight: 700, color: '#be185d',
            letterSpacing: .4, textTransform: 'uppercase' }}>check-out</span>
        )}
        {/* priority toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePriority && onTogglePriority(); }}
          title={priority ? 'Remove priority' : 'Mark as priority'}
          style={{ border: `1px solid ${priority ? '#d97706' : 'rgba(0,0,0,.15)'}`,
            background: priority ? '#f59e0b' : '#fff',
            color: priority ? '#fff' : 'rgba(0,0,0,.55)',
            padding: '2px 6px', borderRadius: 3, cursor: 'pointer',
            fontSize: 9, fontWeight: 700, letterSpacing: .3,
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontFamily: 'inherit' }}>
          <svg width="9" height="9" viewBox="0 0 10 10" fill={priority ? '#fff' : 'none'}>
            <path d="M5 1l1.3 2.6 2.7.4-2 1.9.5 2.6L5 7.2 2.5 8.5 3 5.9 1 4l2.7-.4L5 1z"
              stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
          </svg>
          {priority ? 'P1' : 'Set as priority'}
        </button>
      </div>
      {flag && (
        <span style={{ position: 'absolute', top: -5, right: 4, fontSize: 10, color: '#d97706' }}>△</span>
      )}
    </div>
  );
}

function LiveCard({ n, billie, operator, time, pct, step, stepNum, stepTotal, etaFinish, flags }) {
  const openConsole = () => {
    // switch the host app to the Operator Console tab
    window.dispatchEvent(new CustomEvent('app:navigate', { detail: { tab: 'operator', billie } }));
  };
  return (
    <div style={{ background: 'linear-gradient(180deg, #eef2ff, #fff)',
      border: '1px solid #818cf8',
      borderRadius: 7, padding: '11px 12px',
      boxShadow: '0 2px 10px rgba(91,91,247,.15)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, color: '#111' }}>{n}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 9.5, fontWeight: 700,
          color: '#ffffff', background: '#5b5bf7',
          padding: '2px 6px', borderRadius: 3, letterSpacing: .5 }}>
          <span style={{ width: 5, height: 5, borderRadius: 3, background: '#fff',
            animation: 'pulse 1.5s ease-in-out infinite' }}/>
          LIVE
        </span>
        <span style={{ flex: 1 }}/>
        <span className="tnum" style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: '#3730a3' }}>{time}</span>
      </div>

      {/* billie row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 4,
          background: '#5b5bf7', border: '1px solid rgba(0,0,0,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, color: '#17171a' }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <rect x="3" y="4" width="10" height="8" rx="1.5" stroke="#fff" strokeWidth="1.3"/>
            <circle cx="6" cy="8" r="1" fill="#fff"/>
            <circle cx="10" cy="8" r="1" fill="#fff"/>
            <path d="M8 2v2" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#111' }}>{billie}</div>
          <div style={{ fontSize: 9.5, color: 'rgba(0,0,0,.55)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{operator}</div>
        </div>
      </div>

      {/* inspection flags, if any */}
      {flags && flags.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <span style={{ width: 4, height: 4, borderRadius: 2, background: '#ef4444',
              boxShadow: '0 0 4px #ef4444' }}/>
            <span className="mono" style={{ fontSize: 9, letterSpacing: 1, color: '#b91c1c', fontWeight: 700 }}>
              {flags.length} FLAGS
            </span>
            <span style={{ flex: 1 }}/>
            <a style={{ fontSize: 9.5, color: '#5b5bf7', cursor: 'pointer', fontWeight: 600 }}>view →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${flags.length}, 1fr)`, gap: 3 }}>
            {flags.map((f) => (
              <div key={f.label} title={f.label}
                style={{ aspectRatio: '1', borderRadius: 3, overflow: 'hidden',
                  backgroundImage: `url(${f.img})`, backgroundSize: 'cover', backgroundPosition: 'center',
                  border: '1px solid rgba(239,68,68,.35)',
                  position: 'relative' }}>
                <div style={{ position: 'absolute', right: 2, top: 2,
                  width: 10, height: 10, borderRadius: 5,
                  background: '#ef4444', color: '#17171a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 7, fontWeight: 800, lineHeight: 1,
                  boxShadow: '0 1px 2px rgba(0,0,0,.4)' }}>✕</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* progress */}
      <div style={{ marginBottom: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: '#111' }}>{step}</span>
          <span className="mono" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.55)' }}>
            {stepNum}/{stepTotal}
          </span>
        </div>
        <div style={{ height: 3, background: 'rgba(0,0,0,.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: '#5b5bf7' }}/>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', gap: 8,
        fontSize: 9.5, color: 'rgba(0,0,0,.5)' }}>
        <span>{pct}%  ·  ETA finish {etaFinish}</span>
        <button onClick={openConsole}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#5b5bf7', color: '#ffffff',
            border: 'none', borderRadius: 4,
            padding: '4px 9px', fontSize: 10, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 1px 4px rgba(91,91,247,.35)' }}>
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <rect x="1" y="2" width="8" height="6" rx="1" stroke="#fff" strokeWidth="1.2"/>
            <path d="M3 4.5L4.5 6 3 7.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.5 7.5h2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Open console
        </button>
      </div>
    </div>
  );
}

function InspectedCard({ n, time, billie, reports, flag, inspector, waiting = 0 }) {
  // waiting is seeded in minutes — count up live so the card feels alive
  const [mins, setMins] = React.useState(waiting);
  React.useEffect(() => {
    const id = setInterval(() => setMins(m => m + 1), 60000);
    return () => clearInterval(id);
  }, []);
  const urgent = mins >= 20;
  const warn = mins >= 10 && !urgent;
  const waitBg = urgent ? '#fee2e2' : warn ? '#fef3c7' : '#f1f5f9';
  const waitBr = urgent ? '#fca5a5' : warn ? '#fcd34d' : '#cbd5e1';
  const waitFg = urgent ? '#b91c1c' : warn ? '#92400e' : '#334155';
  return (
    <div style={{ background: '#fff7ed', border: '1px solid #fdba74',
      borderRadius: 6, padding: '8px 10px', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: '#111' }}>{n}</span>
        <span style={{ flex: 1 }}/>
        <span title="Time waiting for review"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 9.5, fontWeight: 700, letterSpacing: .2,
            color: waitFg, background: waitBg,
            border: `1px solid ${waitBr}`,
            borderRadius: 3, padding: '1px 5px', fontFamily: 'var(--mono)' }}>
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5 2.5V5l1.8 1.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {mins}m
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: .5,
          color: '#14532d', background: '#bbf7d0',
          border: '1px solid #86efac',
          borderRadius: 3, padding: '1px 6px', textTransform: 'uppercase' }}>{flag}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 9.5, color: 'rgba(0,0,0,.55)' }}>
        <span className="mono">{billie}</span>
        <span>·</span>
        <span className="mono">cycle {time}</span>
        <span style={{ flex: 1 }}/>
        <span>{reports} rpts</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 9.5, color: 'rgba(0,0,0,.5)' }}>
          QA: <span style={{ color: '#111', fontWeight: 500 }}>{inspector}</span>
        </span>
        <span style={{ flex: 1 }}/>
        <a href="#" onClick={(e) => e.preventDefault()}
          style={{ fontSize: 10, fontWeight: 600, color: '#5b5bf7',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '2px 6px', borderRadius: 3,
            background: '#eef2ff', border: '1px solid #c7d2fe' }}>
          Open report
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  );
}

function DoneRow({ n, edits, time, synced, closedAt }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3,
      background: '#faf5ff',
      border: '1px solid #ddd6fe',
      borderRadius: 5, padding: '7px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 700, color: '#111',
          width: 40 }}>{n}</span>
        <span className="mono" style={{ fontSize: 9.5,
          color: edits === 0 ? '#15803d' : edits > 2 ? '#c2410c' : 'rgba(0,0,0,.55)' }}>
          {edits === 0 ? 'clean' : `${edits} edit${edits > 1 ? 's' : ''}`}
        </span>
        <span style={{ flex: 1 }}/>
        <span className="mono tnum" style={{ fontSize: 9.5, color: 'rgba(0,0,0,.5)' }}>{time}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 9, fontWeight: 700,
          color: synced === 'partial' ? '#9a3412' : '#166534',
          background: synced === 'partial' ? '#fed7aa' : '#bbf7d0',
          border: `1px solid ${synced === 'partial' ? '#fdba74' : '#86efac'}`,
          padding: '1px 6px', borderRadius: 3, letterSpacing: .4 }}>
          PMS{synced === 'partial' && ' ⋯'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 9.5, color: 'rgba(0,0,0,.5)' }}>
          Released to PMS <span style={{ color: '#111', fontFamily: 'var(--mono)' }}>{closedAt}</span>
          {synced === 'partial' && <span style={{ color: '#c2410c', marginLeft: 4 }}>· retry pending</span>}
        </span>
        <span style={{ flex: 1 }}/>
        <button onClick={(e) => e.stopPropagation()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#fff', color: '#5b5bf7',
            border: '1px solid #c7d2fe', borderRadius: 3,
            padding: '2px 7px', fontSize: 9.5, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M2.5 1.5h3.5L8 3.5v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-6a1 1 0 01.5-.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
            <path d="M6 1.5V4h2" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
          </svg>
          View report
        </button>
      </div>
    </div>
  );
}

function PredictionBubble({ flowCur, onPick, onDismiss, onCallOperator }) {
  // Phase 2 — inline chat prediction card. Top-2 predictions when flow stops; operator still decides.
  const action = flowCur?.action || '';
  const predictions = React.useMemo(() => {
    const a = action.toLowerCase();
    if (a.includes('towel') || a.includes('bathroom')) {
      return [
        { label: 'Retry grasp with wider approach angle', conf: 0.72, why: 'towel rack occluded by shower door — similar recoveries in 14/18 past runs' },
        { label: 'Skip and flag for human housekeeping', conf: 0.21, why: 'object out of reach envelope; fallback in SOP §4.2' },
      ];
    }
    if (a.includes('coffee') || a.includes('café') || a.includes('cafe')) {
      return [
        { label: 'Re-scan QR on cup sleeve, then resume pour', conf: 0.68, why: 'barcode miss rate spikes under morning backlight' },
        { label: 'Ask guest to place cup on marked spot', conf: 0.24, why: 'fallback when vision confidence < 0.4 for 2+ frames' },
      ];
    }
    if (a.includes('door') || a.includes('knock')) {
      return [
        { label: 'Wait 8s and knock again (louder)', conf: 0.64, why: '3× in last 7 days, guest opened on 2nd knock' },
        { label: 'Leave at door and notify guest via SMS', conf: 0.28, why: 'SOP for no-answer after 15s on breakfast runs' },
      ];
    }
    return [
      { label: 'Retry last step with slower approach', conf: 0.66, why: 'most common recovery for this step type' },
      { label: 'Skip step and continue flow', conf: 0.23, why: 'acceptable when step is non-critical per SOP' },
    ];
  }, [action]);

  const [hover, setHover] = React.useState(null);

  return (
    <div style={{
      alignSelf: 'flex-start',
      maxWidth: '95%',
      width: '95%',
      background: 'linear-gradient(180deg, rgba(251,191,36,.16) 0%, rgba(251,191,36,.08) 100%)',
      border: '1px solid rgba(251,191,36,.35)',
      borderRadius: 10,
      borderBottomLeftRadius: 3,
      padding: '10px 12px 11px',
      fontSize: 13, lineHeight: 1.4,
      color: '#fde68a',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span className="mono" style={{
          fontSize: 9, fontWeight: 700, letterSpacing: 1,
          padding: '2px 6px', borderRadius: 3,
          background: '#fbbf24', color: '#1a1208',
        }}>FLOW STOPPED</span>
        <span style={{ fontSize: 11.5, color: '#fff', fontWeight: 600 }}>
          Suggested next steps
        </span>
        <span style={{ flex: 1 }}/>
        <span className="mono" style={{ fontSize: 8.5, color: 'rgba(251,191,36,.7)', letterSpacing: .5 }}>
          HINT ONLY
        </span>
      </div>

      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.7)', marginBottom: 10, lineHeight: 1.4 }}>
        Stuck on <span style={{ color: '#fff', fontWeight: 600 }}>"{action}"</span>. Here's what I'd try —
        <span style={{ color: 'rgba(255,255,255,.55)' }}> you decide.</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {predictions.map((p, i) => (
          <button key={i}
            onClick={onPick}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{
              textAlign: 'left',
              padding: '8px 10px',
              borderRadius: 6,
              border: `1px solid ${hover === i ? 'rgba(251,191,36,.55)' : 'rgba(255,255,255,.12)'}`,
              background: hover === i ? 'rgba(251,191,36,.14)' : 'rgba(0,0,0,.2)',
              color: 'inherit', cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background .12s, border-color .12s',
              display: 'flex', flexDirection: 'column', gap: 3,
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="mono" style={{
                fontSize: 9, fontWeight: 700,
                width: 14, height: 14, borderRadius: 3,
                background: i === 0 ? '#fbbf24' : 'rgba(255,255,255,.15)',
                color: i === 0 ? '#1a1208' : 'rgba(255,255,255,.7)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{i + 1}</span>
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 600, flex: 1, lineHeight: 1.3 }}>
                {p.label}
              </span>
              <span className="mono tnum" style={{
                fontSize: 10, fontWeight: 700,
                color: i === 0 ? '#fbbf24' : 'rgba(255,255,255,.55)',
                flexShrink: 0,
              }}>{(p.conf * 100).toFixed(0)}%</span>
            </div>
            <div style={{
              fontSize: 10.5, color: 'rgba(255,255,255,.5)', lineHeight: 1.35,
              paddingLeft: 22,
            }}>{p.why}</div>
            <div style={{
              height: 2, marginLeft: 22, marginTop: 1,
              background: 'rgba(0,0,0,.3)', borderRadius: 1, overflow: 'hidden',
            }}>
              <div style={{
                width: `${p.conf * 100}%`, height: '100%',
                background: i === 0 ? '#fbbf24' : 'rgba(255,255,255,.4)',
              }}/>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={onPick}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34,197,94,.28)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(34,197,94,.18)'}
          style={{
            fontSize: 11, padding: '5px 10px', borderRadius: 4,
            border: '1px solid rgba(134,239,172,.4)',
            background: 'rgba(34,197,94,.18)',
            color: '#86efac', cursor: 'pointer', fontWeight: 600,
            fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            transition: 'background .12s',
          }}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5a4 4 0 018 0v3M11 5l-1.5 1.5L8 5"/>
          </svg>
          Retry step
        </button>
        <button onClick={onCallOperator}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(91,91,247,.28)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(91,91,247,.18)'}
          style={{
            fontSize: 11, padding: '5px 10px', borderRadius: 4,
            border: '1px solid rgba(139,140,250,.45)',
            background: 'rgba(91,91,247,.18)',
            color: '#c7d2fe', cursor: 'pointer', fontWeight: 600,
            fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            transition: 'background .12s',
          }}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 3.5c0 4.5 3.5 8 8 8l1.5-1.5-2.5-1L8 10 4 6l1-1.5-1-2.5z"/>
          </svg>
          Call operator
        </button>
        <button onClick={onDismiss}
          style={{
            fontSize: 10.5, padding: '5px 9px', borderRadius: 4,
            border: '1px solid rgba(255,255,255,.15)',
            background: 'rgba(255,255,255,.04)',
            color: 'rgba(255,255,255,.7)', cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
          Choose manually
        </button>
        <span style={{ flex: 1 }}/>
        <span className="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', letterSpacing: .6 }}>
          billie-boss v0.4
        </span>
      </div>
    </div>
  );
}

function LayoutCinema({ lidar, setLidar, armPos = 'stacked' }) {
  const s = useLiveState();
  const [chatOpen, setChatOpen] = React.useState(true);
  const [locked, setLocked] = React.useState(true);
  const [manual, setManual] = React.useState(false);
  const [aborted, setAborted] = React.useState(false);
  const abortAnnouncedRef = React.useRef(false);
  React.useEffect(() => {
    if (aborted && !abortAnnouncedRef.current) {
      abortAnnouncedRef.current = true;
      s.setMessages((m) => [...m,
        { role: 'agent', content: `Flow aborted. I'm handing ${ROBOT.id} over to you — please take the wheel and drive manually. Joints unlocked, motion stopped, I'm watching.` },
      ]);
    }
    if (!aborted) abortAnnouncedRef.current = false;
  }, [aborted]);
  const [paused, setPaused] = React.useState(true); // demo: stopped so predictions show
  const [flowName, setFlowName] = React.useState('Morning Café Run');
  const [flowOpen, setFlowOpen] = React.useState(false);
  const [flowVariant, setFlowVariant] = React.useState('grouped');
  const [flowExpanded, setFlowExpanded] = React.useState(true);
  const [sidebarTab, setSidebarTab] = React.useState('chat');
  const [mapExpanded, setMapExpanded] = React.useState(false);
  const [drawer, setDrawer] = React.useState(null); // 'log' | 'issue' | 'timeline' | null
  const [selectedBillyId, setSelectedBillyId] = React.useState(ROBOT.id);
  const selectedBilly = FLEET.find(b => b.id === selectedBillyId) || FLEET[0];
  const flow = FLOWS[flowName];
  const FlowRender = FLOW_VARIANTS[flowVariant].render;
  const { rows: flowRows, currentGlobal: flowCurGlobal, total: flowTotal } = flattenFlow(flow);
  const flowCur = flowRows[flowCurGlobal];
  const currentRoom = flowCur?.poi;
  const nextRoom = (() => {
    if (!flowCur) return null;
    for (let i = flowCurGlobal + 1; i < flowRows.length; i++) {
      if (flowRows[i].poi !== currentRoom) return flowRows[i].poi;
    }
    return null;
  })();
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  const hhmm = now.toTimeString().slice(0, 8);

  const SIDEBAR_MIN = 280, SIDEBAR_MAX = 900;
  const [sidebarW, setSidebarW] = React.useState(() => {
    const saved = parseInt(localStorage.getItem('lv-sidebar-w') || '', 10);
    return (saved >= SIDEBAR_MIN && saved <= SIDEBAR_MAX) ? saved : 360;
  });
  const [resizing, setResizing] = React.useState(false);
  React.useEffect(() => { localStorage.setItem('lv-sidebar-w', String(sidebarW)); }, [sidebarW]);
  React.useEffect(() => {
    if (!resizing) return;
    const onMove = (e) => {
      const w = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, window.innerWidth - e.clientX));
      setSidebarW(w);
    };
    const onUp = () => setResizing(false);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizing]);
  const SIDEBAR_W = sidebarW;
  const rightEdge = chatOpen ? SIDEBAR_W + 12 : 12;

  return (
    <div style={{ position: 'relative', height: '100%', background: '#0a0a0c', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: chatOpen ? SIDEBAR_W : 0,
        transition: resizing ? 'none' : 'right .22s ease' }}>
        <CameraView robot={ROBOT} lidar={lidar} />
      </div>

      {/* fleet top-nav strip */}
      <FleetTopNav fleet={FLEET} selectedId={selectedBillyId} onSelect={setSelectedBillyId} currentRoom={currentRoom} rightEdge={chatOpen ? SIDEBAR_W : 0}/>

      {/* Abort banner — operator-takeover handoff */}
      {aborted && (
        <AbortTakeoverBanner
          robotId={selectedBilly?.id || ROBOT.id}
          flowName={flowName}
          onResume={() => { setAborted(false); setManual(false); setLocked(true); }}
          rightEdge={chatOpen ? SIDEBAR_W : 0}
        />
      )}

      {/* top bar — stats, time on right (below the fleet nav) */}
      <div style={{ position: 'absolute', top: 56, left: 12, right: rightEdge, display: 'flex', gap: 10,
        alignItems: 'center', transition: 'right .22s ease' }}>
        <GlassPanel style={{ padding: '8px 12px', display: 'flex', gap: 14 }}>
          <MiniStat label="BATT" value={s.battery[s.battery.length-1].toFixed(0) + '%'} tone="#22c55e"
            icon={<BattGlyph pct={s.battery[s.battery.length-1]}/>}/>
          <MiniStat label="WIFI" value={s.signal[s.signal.length-1].toFixed(0) + '%'}  tone="#60a5fa"
            icon={<WifiGlyph bars={s.signal[s.signal.length-1] > 70 ? 3 : s.signal[s.signal.length-1] > 40 ? 2 : 1}/>}/>
          <MiniStat label="CPU"  value={s.cpu[s.cpu.length-1].toFixed(0) + '%'}       tone="#fbbf24"/>
          <MiniStat label="TEMP" value={s.temp[s.temp.length-1].toFixed(1) + '°C'}    tone="#a78bfa"/>
        </GlassPanel>
        <GlassPanel style={{ padding: '6px 8px', display: 'flex', gap: 4, alignItems: 'center' }}>
          <PopButton
            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13s4.5-4 4.5-8A4.5 4.5 0 007 .5 4.5 4.5 0 002.5 5c0 4 4.5 8 4.5 8z"/><circle cx="7" cy="5" r="1.6"/></svg>}
            label="Location">
            <PopRow label="COORDINATES" copy>[-2.15, 4.465, 1.57]</PopRow>
            <PopRow label="ROTATION">89.95°</PopRow>
            <PopRow label="SERIAL NUMBER" copy>1352507b06102Aq</PopRow>
            <PopLink>AutoXing</PopLink>
          </PopButton>
          <PopButton
            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="3" r="1.5"/><circle cx="3.5" cy="8" r="1.3"/><circle cx="10.5" cy="8" r="1.3"/><path d="M6.3 4.2L4.2 7M7.7 4.2L9.8 7M7 12v-4"/></svg>}
            label="Joints">
            <PopRow label="JOINTS" copy>[1.0, -48.7, 8.0, -2.6, -18.7, 177.2]</PopRow>
            <PopRow label="POSE" copy>[395.4, 16.5, 200.8, -0.1, 2.1, -0.0]</PopRow>
            <PopLink>UFactory</PopLink>
          </PopButton>
        </GlassPanel>
        <div style={{ flex: 1 }} />
      </div>

      {/* current room — floating on camera */}
      {currentRoom && (
        <div style={{ position: 'absolute', top: 116, left: 12,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 14px 8px 10px',
          background: 'rgba(91,91,247,.92)',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,.35), 0 0 16px rgba(91,91,247,.35)',
          backdropFilter: 'blur(14px)' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 14s5-4.5 5-8a5 5 0 10-10 0c0 3.5 5 8 5 8z"/><circle cx="8" cy="6" r="1.8"/>
          </svg>
          <div style={{ lineHeight: 1.15 }}>
            <div className="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,.7)',
              letterSpacing: 1, fontWeight: 600 }}>NOW AT</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: .2 }}>{currentRoom}</div>
          </div>
        </div>
      )}

      {/* mini-map top-right under top bar */}
      <GlassPanel style={{ position: 'absolute', top: 116, right: rightEdge, width: 280, height: 260, padding: 0,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'right .22s ease' }}>
        {/* header bar */}
        <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,.08)',
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: 'rgba(0,0,0,.25)' }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,.65)' }}>
            <path d="M7 12s4-4 4-7a4 4 0 10-8 0c0 3 4 7 4 7z"/><circle cx="7" cy="5" r="1.3"/>
          </svg>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: '#fff' }}>Location</div>
          </div>
          <button onClick={() => setMapExpanded(true)} title="Expand map"
            style={{ width: 22, height: 22, borderRadius: 4, flexShrink: 0,
              border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.05)',
              color: 'rgba(255,255,255,.85)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', padding: 0, transition: 'background .12s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(91,91,247,.35)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5V2h3M10 5V2H7M2 7v3h3M10 7v3H7"/></svg>
          </button>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <MapView robot={ROBOT} showLidar={lidar} compact />
        </div>
      </GlassPanel>
      {/* map expanded modal */}
      {mapExpanded && (
        <div onClick={() => setMapExpanded(false)}
          style={{ position: 'absolute', inset: 0, background: 'rgba(6,7,10,.78)',
            backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 1200, height: '100%', maxHeight: 760,
              background: '#0e1014', border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 10, position: 'relative', overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}>
            <div style={{ position: 'absolute', top: 14, left: 16, fontSize: 11, fontFamily: 'var(--mono)',
              color: 'rgba(255,255,255,.75)', letterSpacing: 1, zIndex: 2 }}>MAP · FLOOR 3 · WARD B</div>
            <button onClick={() => setMapExpanded(false)} title="Close"
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 3, width: 28, height: 28, borderRadius: 5,
                border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.04)',
                color: 'rgba(255,255,255,.85)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
                justifyContent: 'center', padding: 0 }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.04)'}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6"/></svg>
            </button>
            <div style={{ position: 'absolute', inset: 0 }}>
              <MapView robot={ROBOT} showLidar={lidar} />
            </div>
          </div>
        </div>
      )}

      {/* task queue bottom-left */}
      <GlassPanel style={{ position: 'absolute', bottom: 12, left: 12, width: 320, padding: 12 }}>
        <div style={{ fontSize: 10.5, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.55)',
          letterSpacing: 1, marginBottom: 8 }}>WHAT'S NEXT · {TASKS.filter(t=>t.status==='queued').length} PENDING</div>
        <DarkTaskQueue tasks={TASKS.slice(0, 4)}/>
      </GlassPanel>

      {/* camera-overlay drive panel — directly below the map */}
      {armPos === 'tabs' ? (
        <CameraDrivePanel rightEdge={rightEdge} locked={locked} inlineArm topOffset={356}/>
      ) : (
        <>
          <CameraDrivePanel rightEdge={rightEdge} locked={locked} topOffset={356}/>
          {armPos === 'stacked' && (
            <ArmControlPanel rightEdge={rightEdge} bottomOffset={12} locked={locked}/>
          )}
        </>
      )}

      {/* 3 ops actions — bottom-center */}
      {(() => {
        return (
      <GlassPanel style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        padding: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
          padding: '0 10px 0 6px', lineHeight: 1.1 }}>
          <span className="tnum mono" style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: 0.5 }}>{hhmm}</span>
          <span className="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', letterSpacing: 1 }}>
            {now.toDateString().toUpperCase().slice(0, 10)} · UTC
          </span>
        </div>
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,.1)' }}/>
        <ActionBtn tone="danger" disabled={aborted} onClick={() => { setAborted(true); setManual(true); setLocked(false); }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="7" cy="7" r="5.2"/><path d="M7 4.4v3.2M7 9.5v.01"/></svg>
          {aborted ? 'Flow aborted' : 'Abort Flow'}
        </ActionBtn>
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,.1)' }}/>
        <ActionBtn tone={locked ? 'ok' : 'warn'} onClick={() => setLocked(!locked)}>
          {locked ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 017.7-1.5"/></svg>
          )}
          Lock Position
        </ActionBtn>
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,.1)' }}/>
        <ActionBtn tone={manual ? 'accent' : 'neutral'} onClick={() => setManual(!manual)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {/* base */}
            <rect x="7" y="20" width="12" height="2" rx="1"/>
            {/* shoulder joint */}
            <circle cx="16" cy="14" r="2.4"/>
            {/* upper arm (shoulder → elbow) */}
            <path d="M14.4 12.3l-4.6-4.6"/>
            {/* elbow joint */}
            <circle cx="8.6" cy="6.5" r="1.6"/>
            {/* forearm (elbow → wrist) */}
            <path d="M7.3 7.6L4.5 10.3"/>
            {/* gripper */}
            <path d="M4.5 10.3l-1.6 1.6M4.5 10.3l1.6 1.6M2.9 11.9v2M6.1 11.9v2"/>
            {/* mount on base */}
            <path d="M15 20v-3.8"/>
          </svg>
          {manual ? 'Manual control on' : 'Take Manual Control'}
        </ActionBtn>
      </GlassPanel>
        );
      })()}

      {/* closed-chat handle */}
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)}
          style={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)',
            background: 'rgba(18,20,26,.85)', border: '1px solid rgba(255,255,255,.1)',
            borderRight: 'none', borderRadius: '8px 0 0 8px', padding: '14px 10px',
            color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            backdropFilter: 'blur(12px)' }}>
          <Icon d={I.chat} size={14}/>
          <span style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: 1, writingMode: 'vertical-rl',
            transform: 'rotate(180deg)' }}>BILLIE</span>
        </button>
      )}

      {/* right sidebar — Billie Boss chat */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: SIDEBAR_W,
        background: 'rgba(14,16,20,.92)', borderLeft: '1px solid rgba(255,255,255,.08)',
        backdropFilter: 'blur(18px)', transform: chatOpen ? 'translateX(0)' : `translateX(${SIDEBAR_W}px)`,
        transition: resizing ? 'none' : 'transform .22s ease', display: 'flex', flexDirection: 'column' }}>
        {/* resize handle — left edge */}
        {chatOpen && (
          <div onMouseDown={() => setResizing(true)}
            title="Drag to resize"
            style={{ position: 'absolute', top: 0, bottom: 0, left: -3, width: 6, zIndex: 10,
              cursor: 'col-resize',
              background: resizing ? 'rgba(91,91,247,.4)' : 'transparent',
              transition: 'background .12s' }}
            onMouseEnter={(e) => { if (!resizing) e.currentTarget.style.background = 'rgba(91,91,247,.25)'; }}
            onMouseLeave={(e) => { if (!resizing) e.currentTarget.style.background = 'transparent'; }}/>
        )}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.08)',
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={window.__resources?.billie_boss_logo_jpg || (window.__resources?.billie_boss_logo_jpg || "billie-boss-logo.jpg")} alt="Billie Boss" style={{ width: 26, height: 26, borderRadius: 13, objectFit: 'cover', background: '#fff' }}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Billie Boss</div>
            <AgentStatusLine/>
          </div>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}/>
          <button onClick={() => setChatOpen(false)}
            style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,.6)',
              width: 26, height: 26, borderRadius: 5, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.6)'; }}>
            <Icon d={I.close} size={14}/>
          </button>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.08)', flexShrink: 0, padding: '0 8px' }}>
          {[
            { v: 'chat', label: 'Agent', icon: <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h10v7H5L2 13z"/></svg> },
            { v: 'flow', label: 'Flow', icon: <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="3" cy="3" r="1.6"/><circle cx="11" cy="7" r="1.6"/><circle cx="3" cy="11" r="1.6"/><path d="M4.5 3.5L9.5 6.5M4.5 10.5L9.5 7.5"/></svg> },
            { v: 'drive', label: 'Drive', icon: <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="5"/><path d="M7 4v6M4 7h6"/></svg> },
            ...(armPos === 'sidebar' ? [{ v: 'arm', label: 'Arm', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="20" width="12" height="2" rx="1"/><circle cx="16" cy="14" r="2.4"/><path d="M14.4 12.3l-4.6-4.6"/><circle cx="8.6" cy="6.5" r="1.6"/><path d="M7.3 7.6L4.5 10.3"/><path d="M4.5 10.3l-1.6 1.6M4.5 10.3l1.6 1.6M2.9 11.9v2M6.1 11.9v2"/><path d="M15 20v-3.8"/></svg> }] : []),
            { v: 'log',  label: 'Log',  icon: <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2h6l2 2v8H3zM5 5h4M5 7.5h4M5 10h3"/></svg> },
          ].map(t => {
            const on = sidebarTab === t.v;
            return (
              <button key={t.v} onClick={() => setSidebarTab(t.v)}
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '9px 10px', border: 'none', background: 'transparent',
                  color: on ? '#fff' : 'rgba(255,255,255,.55)',
                  borderBottom: `2px solid ${on ? 'var(--accent)' : 'transparent'}`,
                  fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
                  transition: 'color .12s' }}>
                {t.icon}
                {t.label}
                {t.v === 'flow' && (
                  <span className="mono tnum" style={{ fontSize: 9.5,
                    color: on ? 'rgba(199,210,254,.85)' : 'rgba(255,255,255,.4)',
                    marginLeft: 2 }}>{Math.round(((flowCurGlobal + 1) / flowTotal) * 100)}%</span>
                )}
              </button>
            );
          })}
        </div>
        {sidebarTab === 'flow' && (
        /* Full grouped Flow view — header / scrolling body / footer controls */
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(255,255,255,.06)', flexShrink: 0 }}>
            <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.45)',
              letterSpacing: 1.2, marginBottom: 4 }}>MISSION FLOW</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis' }}>{flowName}</div>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.45)',
                  letterSpacing: .5, marginTop: 2 }}>{flow.tag}</div>
              </div>
              <select value={flowName} onChange={(e) => setFlowName(e.target.value)}
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                  color: 'rgba(255,255,255,.85)', borderRadius: 5, padding: '4px 8px', fontSize: 11,
                  fontFamily: 'inherit', cursor: 'pointer', outline: 'none', flexShrink: 0 }}>
                {Object.keys(FLOWS).map(n => <option key={n} value={n} style={{ background: '#12141a' }}>{n}</option>)}
              </select>
            </div>
          </div>
          {/* Scrolling flow body */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 12px 12px' }}>
            <FlowGrouped flow={flow}/>
          </div>
          {/* Footer — Step / Play / Pause / Abort */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,.08)',
            display: 'flex', gap: 6, flexShrink: 0, background: 'rgba(0,0,0,.25)' }}>
            <FlowFooterBtn icon={<svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><rect x="2" y="2" width="2.5" height="8"/><path d="M5 2v8l5-4z"/></svg>} label="Step"/>
            <FlowFooterBtn primary icon={<svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><path d="M3 2v8l7-4z"/></svg>} label="Play"/>
            <FlowFooterBtn icon={<svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><rect x="2.5" y="2" width="2.5" height="8"/><rect x="7" y="2" width="2.5" height="8"/></svg>} label="Pause"/>
            <div style={{ flex: 1 }}/>
            <FlowFooterBtn danger icon={<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10L6 2l4 8z"/><path d="M6 5v2M6 8.5v.01" stroke="#0b0d13"/></svg>} label="Abort"/>
          </div>
        </div>
        )}
        {sidebarTab === 'drive' && (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <DriveTab/>
        </div>
        )}
        {sidebarTab === 'arm' && (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <ArmControlPanel mode="embedded" locked={locked}/>
        </div>
        )}
        {sidebarTab === 'log' && (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <SidebarCaptainsLog/>
        </div>
        )}
        {sidebarTab === 'chat' && (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {/* persistent mini flow snippet above chat */}
          {flowCur && (
            <button onClick={() => setSidebarTab('flow')}
              style={{ display: 'block', width: '100%', textAlign: 'left',
                border: 'none', borderBottom: '1px solid rgba(91,91,247,.28)',
                background: 'linear-gradient(180deg, rgba(91,91,247,.22) 0%, rgba(91,91,247,.14) 100%)',
                padding: '10px 14px 11px', cursor: 'pointer',
                fontFamily: 'inherit', color: 'inherit',
                transition: 'background .15s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(180deg, rgba(91,91,247,.32) 0%, rgba(91,91,247,.2) 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(180deg, rgba(91,91,247,.22) 0%, rgba(91,91,247,.14) 100%)'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 9, color: '#fff',
                  letterSpacing: 1, background: 'var(--accent)', padding: '2px 6px',
                  borderRadius: 3, flexShrink: 0, fontWeight: 700 }}>NOW</span>
                <span style={{ fontSize: 12, color: '#fff', fontWeight: 600, flex: 1,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{flowCur.action}</span>
                <span className="mono tnum" style={{ fontSize: 10.5, color: '#c7d2fe', fontWeight: 600 }}>
                  {Math.round(((flowCurGlobal + 1) / flowTotal) * 100)}%
                </span>
              </div>
              <div style={{ height: 3, background: 'rgba(0,0,0,.35)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${Math.round(((flowCurGlobal + 1) / flowTotal) * 100)}%`,
                  height: '100%', background: 'var(--accent)',
                  boxShadow: '0 0 6px rgba(91,91,247,.7)', transition: 'width .3s' }}/>
              </div>
            </button>
          )}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <DarkChatWithQuick messages={s.messages} setMessages={s.setMessages} robot={ROBOT}
              paused={paused} flowCur={flowCur} onResolvePrediction={() => setPaused(false)}/>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

// Chat with quick-action strip above the send input
function DarkChatWithQuick({ messages, setMessages, robot, paused, flowCur, onResolvePrediction }) {
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [issueOpen, setIssueOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [messages]);
  const sendText = async (text) => {
    if (!text || busy) return;
    setInput(''); setBusy(true);
    setMessages((m) => [...m, { role: 'user', content: text }, { role: 'agent', content: '', pending: true }]);
    try {
      const prompt = `You are Billie Boss, mission-control agent for ${robot.id}, indoor hospital service robot on Floor 3 Ward B. Battery 74%. Operator said: "${text}". Reply in 1-2 short sentences as the agent, plainly. Include any relevant number. No emoji.`;
      const reply = await window.claude.complete(prompt);
      setMessages((m) => { const c = m.slice(); c[c.length-1] = { role: 'agent', content: reply.trim() }; return c; });
    } catch { setMessages((m) => { const c = m.slice(); c[c.length-1] = { role: 'agent', content: '⚠ comms degraded', error: true }; return c; }); }
    finally { setBusy(false); }
  };
  const QUICKS = [
    { label: 'slide back', icon: <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7H2M5 4L2 7l3 3"/></svg> },
    { label: 'skip',       icon: <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3l6 4-6 4zM10 3v8"/></svg> },
    { label: 'twist',      icon: <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5a4 4 0 018 0v3M11 5l-1.5 1.5L8 5"/><path d="M11 9a4 4 0 01-8 0V6M3 9l1.5-1.5L6 9"/></svg> },
    { label: 'maps',       icon: <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2L2 3v9l3-1 4 1 3-1V3l-3 1zM5 2v9M9 3v9"/></svg> },
  ];
  return (
    <>
      <div ref={ref} style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ maxWidth: '88%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            padding: '8px 12px', borderRadius: 10, fontSize: 13, lineHeight: 1.45,
            background: m.role === 'user' ? 'rgba(255,255,255,.1)' : 'rgba(91,91,247,.22)',
            color: m.role === 'user' ? '#fff' : '#e0e2ff',
            borderBottomRightRadius: m.role === 'user' ? 3 : 10,
            borderBottomLeftRadius: m.role === 'user' ? 10 : 3 }}>
            {m.pending ? <TypingDotsDark/> : m.content}
          </div>
        ))}
        {paused && flowCur && (
          <PredictionBubble flowCur={flowCur} onPick={onResolvePrediction} onDismiss={onResolvePrediction}
            onCallOperator={() => {
              onResolvePrediction();
              setMessages((m) => [...m,
                { role: 'user', content: 'Calling operator for help on this step…' },
                { role: 'agent', content: 'Paging operator Ivy Nakamura. Ringing now — stay on the line.' },
              ]);
            }}/>
        )}
      </div>
      {/* Operator strip — who's on shift, above quick actions */}
      <div style={{ padding: '7px 12px', borderTop: '1px solid rgba(255,255,255,.06)',
        background: 'rgba(255,255,255,.02)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.45)', letterSpacing: 1 }}>OPERATOR</span>
        <Avatar p={OPERATOR} size={18}/>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.92)', fontWeight: 500 }}>{OPERATOR.name}</span>
        <span style={{ flex: 1 }}/>
        <span className="mono" style={{ fontSize: 9.5, color: '#86efac', letterSpacing: .5,
          display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: 3, background: '#22c55e' }}/>
          ON CALL
        </span>
      </div>
      {/* quick actions */}
      <div style={{ padding: '6px 12px 0', fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: .8,
        color: 'rgba(255,255,255,.42)', borderTop: '1px solid rgba(255,255,255,.06)' }}>
        you can write any command in your own words
      </div>
      <div style={{ padding: '6px 10px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {QUICKS.map((q) => (
          <button key={q.label} onClick={() => sendText(q.label)} disabled={busy}
            style={{ border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)',
              color: 'rgba(255,255,255,.85)', padding: '5px 10px', borderRadius: 999,
              fontSize: 11, fontFamily: 'inherit', cursor: busy ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
              transition: 'background .12s' }}
            onMouseEnter={(e) => { if (!busy) e.currentTarget.style.background = 'rgba(255,255,255,.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}>
            <span style={{ color: 'rgba(199,210,254,.85)', display: 'flex' }}>{q.icon}</span>
            {q.label}
          </button>
        ))}
        {/* Report issue — opens inline modal */}
        <button onClick={() => setIssueOpen(true)}
          style={{ border: '1px solid rgba(251,146,60,.35)', background: 'rgba(251,146,60,.1)',
            color: '#fdba74', padding: '5px 10px', borderRadius: 999,
            fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1l6 11H1zM7 5v4M7 11v.01"/></svg>
          report issue
        </button>
      </div>
      {/* send input */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '10px 12px',
        display: 'flex', gap: 8, alignItems: 'center' }}>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendText(input.trim()); }}
          placeholder="Send command to Billie Boss…" disabled={busy}
          style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
            outline: 'none', color: '#fff', fontSize: 13, fontFamily: 'var(--sans)',
            padding: '8px 10px', borderRadius: 6 }}/>
        <button onClick={() => sendText(input.trim())} disabled={busy || !input.trim()}
          style={{ border: 'none', background: input.trim() && !busy ? 'var(--accent)' : 'rgba(255,255,255,.1)',
            color: '#fff', width: 32, height: 32, borderRadius: 6, cursor: input.trim() && !busy ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon d={I.send} size={13}/>
        </button>
      </div>
      {/* Report Issue modal */}
      {issueOpen && <InlineIssueModal onClose={() => setIssueOpen(false)} robot={robot}/>}
    </>
  );
}

// Inline issue modal — overlays the chat (absolute within sidebar)
function InlineIssueModal({ onClose, robot }) {
  const [title, setTitle] = React.useState('');
  const [severity, setSeverity] = React.useState('medium');
  const [desc, setDesc] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const SEV = [
    { v: 'low',    label: 'Low',    color: '#86efac' },
    { v: 'medium', label: 'Medium', color: '#fde68a' },
    { v: 'high',   label: 'High',   color: '#fca5a5' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50,
      backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 320, background: '#12141a',
          border: '1px solid rgba(255,255,255,.1)', borderRadius: 10,
          boxShadow: '0 20px 60px rgba(0,0,0,.5)', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.06)',
          display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#fdba74" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1l6 11H1zM7 5v4M7 11v.01"/></svg>
          <span style={{ fontSize: 12.5, color: '#fff', fontWeight: 600, flex: 1 }}>
            {submitted ? 'Issue filed' : 'Report an issue'}
          </span>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent',
            color: 'rgba(255,255,255,.5)', cursor: 'pointer', width: 22, height: 22, borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={I.close} size={11}/>
          </button>
        </div>
        {submitted ? (
          <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: 14, background: 'rgba(34,197,94,.2)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#86efac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7l3 3 7-7"/></svg>
            </span>
            <div>
              <div style={{ fontSize: 12.5, color: '#fff', fontWeight: 600 }}>INC-{Math.floor(Math.random() * 900 + 100)} filed</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.55)' }}>Assigned to field ops · you'll get updates here.</div>
            </div>
          </div>
        ) : (
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
              placeholder="What's wrong? (e.g. Bumped into cart)"
              style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                outline: 'none', color: '#fff', fontSize: 12.5, fontFamily: 'var(--sans)',
                padding: '8px 10px', borderRadius: 5 }}/>
            <div style={{ display: 'flex', gap: 4 }}>
              {SEV.map(s => (
                <button key={s.v} onClick={() => setSeverity(s.v)}
                  style={{ flex: 1, padding: '6px 6px', borderRadius: 4,
                    border: `1px solid ${severity === s.v ? s.color : 'rgba(255,255,255,.1)'}`,
                    background: severity === s.v ? `${s.color}22` : 'rgba(255,255,255,.04)',
                    color: severity === s.v ? s.color : 'rgba(255,255,255,.7)',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {s.label}
                </button>
              ))}
            </div>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)}
              placeholder="More detail… (optional)" rows={3}
              style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                outline: 'none', color: '#fff', fontSize: 12, fontFamily: 'var(--sans)',
                padding: '8px 10px', borderRadius: 5, resize: 'none' }}/>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
              <span className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,.4)', letterSpacing: .5, flex: 1 }}>
                {robot?.id} · Floor 3 · M-0421
              </span>
              <button onClick={onClose} style={{ border: '1px solid rgba(255,255,255,.1)',
                background: 'transparent', color: 'rgba(255,255,255,.7)',
                padding: '6px 12px', borderRadius: 5, fontSize: 11, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => title.trim() && setSubmitted(true)} disabled={!title.trim()}
                style={{ border: 'none', background: title.trim() ? 'var(--accent)' : 'rgba(255,255,255,.08)',
                  color: '#fff', padding: '6px 14px', borderRadius: 5, fontSize: 11, fontWeight: 600,
                  cursor: title.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>Submit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ children, tone = 'neutral', onClick, disabled }) {
  const tones = {
    neutral: { bg: 'rgba(255,255,255,.06)', border: 'rgba(255,255,255,.12)', fg: '#fff' },
    ok:      { bg: 'rgba(34,197,94,.18)',   border: 'rgba(34,197,94,.35)',   fg: '#86efac' },
    warn:    { bg: 'rgba(251,191,36,.18)',  border: 'rgba(251,191,36,.35)',  fg: '#fde68a' },
    danger:  { bg: 'rgba(239,68,68,.18)',   border: 'rgba(239,68,68,.4)',    fg: '#fca5a5' },
    accent:  { bg: 'rgba(91,91,247,.25)',   border: 'rgba(91,91,247,.4)',    fg: '#c7d2fe' },
  };
  const t = tones[tone];
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ border: `1px solid ${t.border}`, background: t.bg, color: t.fg,
        padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1,
        fontFamily: 'inherit', letterSpacing: 0.2 }}>
      {children}
    </button>
  );
}

function GlassPanel({ children, style }) {
  return (
    <div style={{ background: 'rgba(18,20,26,.7)', border: '1px solid rgba(255,255,255,.08)',
      borderRadius: 10, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      boxShadow: '0 4px 20px rgba(0,0,0,.3)', color: '#e4e4e7', ...style }}>{children}</div>
  );
}
function GlassBtn({ children, active, onClick, danger }) {
  return (
    <button onClick={onClick}
      style={{ border: 'none', background: active ? 'rgba(91,91,247,.35)' : 'transparent',
        color: danger ? '#fca5a5' : '#fff', padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
        fontSize: 11, fontWeight: danger ? 700 : 500, letterSpacing: danger ? .5 : 0,
        display: 'inline-flex', alignItems: 'center', gap: 4 }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.1)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      {children}
    </button>
  );
}
// ─── PopButton — icon with click-out popover ───────────────
function PopButton({ icon, label, children }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} title={label}
        style={{ width: 28, height: 28, borderRadius: 5, border: 'none',
          background: open ? 'rgba(91,91,247,.3)' : 'transparent',
          color: open ? '#c7d2fe' : 'rgba(255,255,255,.85)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .12s' }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = 'rgba(255,255,255,.08)'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = 'transparent'; }}>
        {icon}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 36, left: 0, minWidth: 230,
          background: '#fff', borderRadius: 8, boxShadow: '0 10px 40px rgba(0,0,0,.2), 0 2px 8px rgba(0,0,0,.08)',
          border: '1px solid rgba(0,0,0,.06)', padding: 12, zIndex: 60, fontFamily: 'var(--sans)' }}>
          {children}
        </div>
      )}
    </div>
  );
}
function PopRow({ label, copy, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#8b8f99', letterSpacing: .5, marginBottom: 3 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {copy && <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="#8b8f99" strokeWidth="1.4"><rect x="3" y="3" width="8" height="8" rx="1"/><path d="M1 9V2a1 1 0 011-1h7"/></svg>}
        <span className="mono tnum" style={{ fontSize: 12, color: '#1a1a1a', fontWeight: 500 }}>{children}</span>
      </div>
    </div>
  );
}
function PopLink({ children }) {
  return (
    <button style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: '7px 10px', border: '1px solid #e4e6eb', background: '#fff',
      color: '#1a1a1a', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
      {children}
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M4 2h6v6M10 2L4 8M3 4H2v6h6v-1"/></svg>
    </button>
  );
}

function MiniStat({ label, value, tone, icon }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 46 }}>
      <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.45)', letterSpacing: 1,
        display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {icon && <span style={{ color: tone, display: 'flex' }}>{icon}</span>}
        {label}
      </span>
      <span className="tnum" style={{ fontSize: 14, fontWeight: 600, color: tone }}>{value}</span>
    </div>
  );
}
// inline battery + wifi glyphs
const BattGlyph = ({ pct = 74 }) => (
  <svg width="13" height="9" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.2">
    <rect x="1" y="1.5" width="14" height="7" rx="1.2"/>
    <rect x="16" y="3.5" width="1.5" height="3" rx=".5" fill="currentColor" stroke="none"/>
    <rect x="2.5" y="3" width={Math.max(1, Math.min(11, (pct/100)*11))} height="4" fill="currentColor" stroke="none"/>
  </svg>
);
const WifiGlyph = ({ bars = 3 }) => (
  <svg width="12" height="10" viewBox="0 0 14 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <path d="M1 5a8 8 0 0112 0" opacity={bars >= 3 ? 1 : 0.25}/>
    <path d="M3 7.5a5 5 0 018 0" opacity={bars >= 2 ? 1 : 0.25}/>
    <path d="M5 10a2 2 0 014 0" opacity={bars >= 1 ? 1 : 0.25}/>
  </svg>
);
// ─── flow icons + row ──────────────────────────────────────────
const FLOW_ICONS = {
  check:  'M2.5 7l3 3 6-7',
  play:   'M4 3l7 5-7 5z',
  dot:    '',
};

function ActionIcon({ name, size = 12 }) {
  // tiny icon per action-kind so rows aren't just text
  const K = name.toLowerCase();
  if (K.includes('walk') || K.includes('approach') || K.includes('head') || K.includes('navigate') || K.includes('return')) return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="3" r="1.5"/><path d="M5 13l1-4 1 1 1-1 1 4M6 9L4 7M8 9l2-2"/></svg>;
  if (K.includes('rotate') || K.includes('turn')) return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M12 7a5 5 0 11-1.5-3.5M12 2v3h-3"/></svg>;
  if (K.includes('align') || K.includes('realign')) return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M7 1v12M3 4h8M3 10h8"/></svg>;
  if (K.includes('nudge') || K.includes('bump') || K.includes('slide') || K.includes('ease') || K.includes('back') || K.includes('retract')) return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2 7h10M9 4l3 3-3 3"/></svg>;
  if (K.includes('knock')) return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 7h8M6 4l3 3-3 3"/><circle cx="11" cy="3" r="1"/></svg>;
  if (K.includes('policy') || K.includes('entry policy')) return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><path d="M7 4v3l2 2"/></svg>;
  if (K.includes('collision') || K.includes('limits')) return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><path d="M7 2.5v2M7 9.5v2M2.5 7h2M9.5 7h2"/></svg>;
  if (K.includes('tuck') || K.includes('joint') || K.includes('arm')) return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="4" cy="10" r="1.5"/><circle cx="10" cy="4" r="1.5"/><path d="M5 9l4-4"/></svg>;
  if (K.includes('grip') || K.includes('clos') || K.includes('open the gripper') || K.includes('release')) return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 3v4a4 4 0 008 0V3M7 11v2"/></svg>;
  if (K.includes('lift')) return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M7 12V3M4 6l3-3 3 3"/></svg>;
  if (K.includes('spot') || K.includes('detect') || K.includes('scan') || K.includes('inspect') || K.includes('check')) return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="7" cy="7" r="2"/><path d="M2 7a5 5 0 0110 0M7 2v1M7 11v1M2 7h1M11 7h1"/></svg>;
  if (K.includes('place') || K.includes('set down') || K.includes('drop') || K.includes('put')) return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M7 2v7M4 8l3 3 3-3M2 13h10"/></svg>;
  if (K.includes('dock') || K.includes('charg') || K.includes('undock')) return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M8 2l-3 5h3l-2 5 5-7H8l1-3z"/></svg>;
  if (K.includes('uv') || K.includes('sweep') || K.includes('lamp')) return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="7" cy="7" r="2"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M3 3l1.5 1.5M9.5 9.5L11 11M3 11l1.5-1.5M9.5 4.5L11 3"/></svg>;
  if (K.includes('log') || K.includes('confirm')) return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 2h8v10H3zM5 5h4M5 8h4M5 11h2"/></svg>;
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="7" cy="7" r="1.5"/></svg>;
}

function ActionRow({ row, onClick }) {
  const { action, done, active } = row;
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '5px 8px',
      borderRadius: 5, cursor: onClick ? 'pointer' : 'default',
      background: active ? 'rgba(91,91,247,.16)' : 'transparent',
      transition: 'background .1s',
    }}
    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      {/* left check */}
      <span style={{ width: 12, height: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {done ? (
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={FLOW_ICONS.check}/></svg>
        ) : active ? (
          <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }}/>
        ) : (
          <span style={{ width: 4, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)' }}/>
        )}
      </span>
      {/* icon */}
      <span style={{ color: active ? '#fff' : done ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.45)', flexShrink: 0 }}>
        <ActionIcon name={action} size={11}/>
      </span>
      {/* action name */}
      <span className="mono" style={{
        flex: 1, fontSize: 11.5, fontFamily: 'var(--mono)',
        color: active ? '#fff' : done ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.75)',
        fontWeight: active ? 600 : 400,
      }}>{action}</span>
      {/* right play */}
      <svg width="10" height="10" viewBox="0 0 14 14" fill={active ? 'var(--accent)' : 'none'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
        style={{ color: active ? 'var(--accent)' : 'rgba(255,255,255,.3)', flexShrink: 0 }}>
        <path d={FLOW_ICONS.play}/>
      </svg>
    </div>
  );
}

// A · Grouped — matches the reference UI. POI headers show "3/8" progress,
// with an overall flow completion bar at the top.
function FlowGrouped({ flow }) {
  const { rows, currentGlobal, total } = flattenFlow(flow);
  // count done actions per POI + overall
  const poiStats = flow.pois.map((poi, pi) => {
    let total = 0, done = 0, active = false;
    poi.items.forEach((it, ii) => {
      it.actions.forEach((_, ai) => {
        total++;
        const r = rows.find(r => r.poiIdx === pi && r.itemIdx === ii && r.actionIdx === ai);
        if (r.done) done++;
        if (r.active) active = true;
      });
    });
    return { total, done, active, complete: done === total };
  });
  const overallDone = rows.filter(r => r.done).length;
  const overallPct = Math.round((overallDone / total) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* overall flow progress bar */}
      <div style={{ padding: '2px 2px 10px', marginBottom: 6, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.5)', letterSpacing: 1 }}>PROGRESS</span>
          <span className="mono tnum" style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>
            {overallPct}%
            <span style={{ color: 'rgba(255,255,255,.4)', fontWeight: 400, marginLeft: 6 }}>{overallDone}/{total}</span>
          </span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${overallPct}%`, height: '100%', background: 'var(--accent)',
            boxShadow: '0 0 8px rgba(91,91,247,.6)', transition: 'width .3s' }}/>
        </div>
      </div>

      {flow.pois.map((poi, pi) => {
        const [cp, ci] = flow.current;
        const stats = poiStats[pi];
        const poiDone = stats.complete;
        const poiActive = stats.active;
        return (
          <div key={pi} style={{ marginBottom: 8 }}>
            {/* POI header — name + fraction + status chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,.06)',
              marginBottom: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 600, flex: 1,
                color: poiActive ? '#fff' : poiDone ? 'rgba(255,255,255,.45)' : 'rgba(255,255,255,.85)' }}>{poi.name}</span>
              <span className="mono tnum" style={{ fontSize: 10,
                color: poiActive ? 'rgba(199,210,254,.9)' : poiDone ? 'rgba(134,239,172,.8)' : 'rgba(255,255,255,.4)',
                fontWeight: 500, letterSpacing: .2 }}>{stats.done}/{stats.total}</span>
              {poiActive && <span className="mono" style={{ fontSize: 9, color: 'var(--accent)',
                letterSpacing: 1, background: 'rgba(91,91,247,.2)', padding: '1px 5px', borderRadius: 3 }}>ACTIVE</span>}
              {poiDone && <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"><path d={FLOW_ICONS.check}/></svg>}
            </div>
            {poi.items.map((it, ii) => {
              const itemActive = pi === cp && ii === ci;
              return (
                <div key={ii}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: itemActive ? '#c7d2fe' : 'rgba(255,255,255,.55)',
                    padding: '6px 8px 3px', letterSpacing: .3 }}>{it.name}</div>
                  {it.actions.map((_, ai) => {
                    const row = rows.find(r => r.poiIdx === pi && r.itemIdx === ii && r.actionIdx === ai);
                    return <ActionRow key={ai} row={row}/>;
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// B · Compact — only current POI+Item + inline mini-breadcrumb
function FlowCompact({ flow }) {
  const { rows, currentGlobal, total } = flattenFlow(flow);
  const cur = rows[currentGlobal];
  if (!cur) return null;
  const pct = Math.round((currentGlobal / Math.max(total - 1, 1)) * 100);
  return (
    <div>
      <div style={{ padding: 12, background: 'rgba(91,91,247,.14)', borderRadius: 8,
        border: '1px solid rgba(91,91,247,.28)', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, color: 'rgba(199,210,254,.95)', fontWeight: 500 }}>{cur.poi}</span>
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="rgba(199,210,254,.5)" strokeWidth="1.5" strokeLinecap="round"><path d="M4 2l4 4-4 4"/></svg>
          <span style={{ fontSize: 10.5, color: 'rgba(199,210,254,.7)' }}>{cur.item}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#fff' }}><ActionIcon name={cur.action} size={16}/></span>
          <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{cur.action}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,.1)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)' }}/>
          </div>
          <span className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,.6)' }}>{currentGlobal + 1}/{total}</span>
        </div>
      </div>
      {rows[currentGlobal + 1] && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,.35)', letterSpacing: 1 }}>NEXT</span>
          <span className="mono">{rows[currentGlobal + 1].action}</span>
          {rows[currentGlobal + 1].poi !== cur.poi && (
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>→ {rows[currentGlobal + 1].poi}</span>
          )}
        </div>
      )}
    </div>
  );
}

// C · POI chips — horizontal strip of POIs, expanded current one shows actions
function FlowChips({ flow }) {
  const [cp, ci, ca] = flow.current;
  const cur = flow.pois[cp].items[ci];
  return (
    <div>
      {/* POI strip */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        {flow.pois.map((poi, pi) => {
          const done = pi < cp, active = pi === cp;
          return (
            <div key={pi} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px',
                borderRadius: 10, fontSize: 10.5, fontWeight: 500,
                background: active ? 'var(--accent)' : done ? 'rgba(34,197,94,.18)' : 'rgba(255,255,255,.06)',
                color: active ? '#fff' : done ? '#86efac' : 'rgba(255,255,255,.6)',
                border: active ? '1px solid rgba(255,255,255,.2)' : '1px solid transparent' }}>
                {done && <svg width="9" height="9" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d={FLOW_ICONS.check}/></svg>}
                {active && <span style={{ width: 5, height: 5, borderRadius: 3, background: '#fff',
                  animation: 'pulse 1.4s ease-in-out infinite' }}/>}
                {poi.name}
              </div>
              {pi < flow.pois.length - 1 && (
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.5" strokeLinecap="round"><path d="M3 2l4 4-4 4"/></svg>
              )}
            </div>
          );
        })}
      </div>
      {/* current actions */}
      <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.4)',
        letterSpacing: 1, marginBottom: 4 }}>{flow.pois[cp].name.toUpperCase()} · {cur.name.toUpperCase()}</div>
      <div>
        {cur.actions.map((action, ai) => {
          const row = { action, done: ai < ca, active: ai === ca };
          return <ActionRow key={ai} row={row}/>;
        })}
      </div>
    </div>
  );
}

// D · Terminal — code-console look
function FlowTerminal({ flow }) {
  const { rows, currentGlobal } = flattenFlow(flow);
  return (
    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 1.6 }}>
      {rows.map((r, i) => {
        const prefix = r.done ? '✓' : r.active ? '▶' : ' ';
        return (
          <div key={i} style={{
            display: 'flex', gap: 8, alignItems: 'baseline',
            color: r.active ? '#fff' : r.done ? 'rgba(134,239,172,.85)' : 'rgba(255,255,255,.55)',
            background: r.active ? 'rgba(91,91,247,.15)' : 'transparent',
            padding: '1px 6px', margin: '0 -6px', borderRadius: 3,
          }}>
            <span style={{ color: r.done ? '#22c55e' : r.active ? 'var(--accent)' : 'rgba(255,255,255,.25)', width: 10, flexShrink: 0 }}>{prefix}</span>
            <span style={{ color: 'rgba(255,255,255,.3)', width: 18, flexShrink: 0, textAlign: 'right' }}>{String(i).padStart(2, '0')}</span>
            {r.firstInPoi && <span style={{ color: 'rgba(199,210,254,.7)', fontWeight: 600 }}>{r.poi.replace(/\s/g, '_').toLowerCase()}.</span>}
            {r.firstInItem && !r.firstInPoi && <span style={{ color: 'rgba(199,210,254,.5)' }}>{r.item.replace(/\s/g, '_').toLowerCase()}.</span>}
            {!r.firstInPoi && !r.firstInItem && <span style={{ color: 'rgba(255,255,255,.2)', width: 8 }}>·</span>}
            <span style={{ fontWeight: r.active ? 600 : 400 }}>{r.action}()</span>
          </div>
        );
      })}
    </div>
  );
}

// E · Tree — explorer-style indented
function FlowTree({ flow }) {
  const [cp, ci, ca] = flow.current;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {flow.pois.map((poi, pi) => {
        const poiDone = pi < cp, poiActive = pi === cp;
        return (
          <div key={pi}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 0' }}>
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
                style={{ color: 'rgba(255,255,255,.4)' }}><path d="M3 2l4 4-4 4"/></svg>
              <span style={{ fontSize: 12, fontWeight: 600,
                color: poiActive ? '#fff' : poiDone ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.85)' }}>{poi.name}</span>
              {poiDone && <svg width="9" height="9" viewBox="0 0 14 14" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><path d={FLOW_ICONS.check}/></svg>}
            </div>
            {poi.items.map((it, ii) => {
              const itemActive = pi === cp && ii === ci;
              return (
                <div key={ii} style={{ paddingLeft: 14, borderLeft: '1px solid rgba(255,255,255,.06)', marginLeft: 4 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600,
                    color: itemActive ? '#c7d2fe' : 'rgba(255,255,255,.55)', padding: '3px 0 2px 4px' }}>{it.name}</div>
                  <div style={{ paddingLeft: 6 }}>
                    {it.actions.map((action, ai) => {
                      const active = pi === cp && ii === ci && ai === ca;
                      const done = pi < cp || (pi === cp && ii < ci) || (pi === cp && ii === ci && ai < ca);
                      return <ActionRow key={ai} row={{ action, active, done }}/>;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const FLOW_VARIANTS = {
  grouped:  { label: 'Grouped',  render: FlowGrouped },
  compact:  { label: 'Compact',  render: FlowCompact },
  chips:    { label: 'Chips',    render: FlowChips },
  terminal: { label: 'Terminal', render: FlowTerminal },
  tree:     { label: 'Tree',     render: FlowTree },
};
function DarkTaskQueue({ tasks }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {tasks.map((t, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
          borderRadius: 6, background: t.status === 'active' ? 'rgba(91,91,247,.2)' : 'rgba(255,255,255,.04)' }}>
          <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>#{String(i+1).padStart(2,'0')}</span>
          <span style={{ fontSize: 12, color: '#fff', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
          <span className="mono" style={{ fontSize: 10,
            color: t.status === 'active' ? '#c7d2fe' : t.status === 'blocked' ? '#fbbf24' : 'rgba(255,255,255,.4)' }}>
            {t.eta}
          </span>
        </div>
      ))}
    </div>
  );
}
function DarkChat({ messages, setMessages, robot }) {
  // wrapper that restyles AgentChat's tree — reuse variant='chat' inside dark panel
  // Simpler: inline a dark-skinned chat.
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [messages]);
  const send = async () => {
    const text = input.trim(); if (!text || busy) return;
    setInput(''); setBusy(true);
    setMessages((m) => [...m, { role: 'user', content: text }, { role: 'agent', content: '', pending: true }]);
    try {
      const prompt = `You are Billie Boss, mission-control agent for ${robot.id}, indoor hospital service robot on Floor 3 Ward B. Battery 74%. Operator said: "${text}". Reply in 1-2 short sentences as the agent, plainly. Include any relevant number. No emoji.`;
      const reply = await window.claude.complete(prompt);
      setMessages((m) => { const c = m.slice(); c[c.length-1] = { role: 'agent', content: reply.trim() }; return c; });
    } catch { setMessages((m) => { const c = m.slice(); c[c.length-1] = { role: 'agent', content: '⚠ comms degraded', error: true }; return c; }); }
    finally { setBusy(false); }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div ref={ref} style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ maxWidth: '85%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            padding: '7px 10px', borderRadius: 8, fontSize: 12.5, lineHeight: 1.45,
            background: m.role === 'user' ? 'rgba(255,255,255,.1)' : 'rgba(91,91,247,.22)',
            color: m.role === 'user' ? '#fff' : '#e0e2ff',
            borderBottomRightRadius: m.role === 'user' ? 2 : 8,
            borderBottomLeftRadius: m.role === 'user' ? 8 : 2 }}>
            {m.pending ? <TypingDotsDark/> : m.content}
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '8px 10px', display: 'flex', gap: 6, alignItems: 'center' }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder="Send command…" disabled={busy}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontSize: 12, fontFamily: 'var(--sans)' }}/>
        <button onClick={send} disabled={busy || !input.trim()}
          style={{ border: 'none', background: input.trim() && !busy ? 'var(--accent)' : 'rgba(255,255,255,.1)',
            color: '#fff', width: 26, height: 26, borderRadius: 5, cursor: input.trim() && !busy ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon d={I.send} size={12}/>
        </button>
      </div>
    </div>
  );
}
function TypingDotsDark() {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: 3, background: '#c7d2fe', opacity: .6,
        animation: `td 1s ${i * .15}s infinite ease-in-out` }}/>)}
    </span>
  );
}

// ═══ LAYOUT C — Split Console ══════════════════════════════════
// Camera and map share the top half 50/50, terminal-style agent right,
// flow + queue + log across the bottom. Mission-console vibe.
function LayoutConsole({ lidar, setLidar }) {
  const s = useLiveState();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <TopBar robot={ROBOT} connection={CONN} lidar={lidar} onLidarToggle={() => setLidar(!lidar)} />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 320px',
        gridTemplateRows: '1.2fr auto auto', gap: 10, padding: 10, minHeight: 0 }}>
        <Panel pad={false} title={<><Icon d={I.cam} size={12}/> Camera</>}
          actions={<Chip dot tone="danger" style={{ background: 'var(--danger-soft)' }}>REC</Chip>}>
          <CameraView robot={ROBOT} lidar={lidar}/>
        </Panel>
        <Panel pad={false} title={<><Icon d={I.map} size={12}/> Floor 3 · Ward B</>}
          actions={<><IconBtn icon={I.lidar} size={22} active={lidar} onClick={() => setLidar(!lidar)}/><IconBtn icon={I.expand} size={22}/></>}>
          <MapView robot={ROBOT} showLidar={lidar}/>
        </Panel>
        {/* agent, tall right rail, spans all rows */}
        <div style={{ gridRow: '1 / 4', minHeight: 0 }}>
          <Panel pad={false} title={<><Icon d={I.chat} size={12}/> Billie Boss · Command Line</>}
            actions={<Chip dot tone="ok">ready</Chip>} style={{ height: '100%' }}>
            <AgentChat messages={s.messages} setMessages={s.setMessages} robot={ROBOT} variant="terminal"/>
          </Panel>
        </div>

        {/* telemetry strip under camera+map */}
        <div style={{ gridColumn: '1 / 3', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <TelemetryCard label="Battery" value={s.battery[s.battery.length-1].toFixed(0)} unit="%" spark={s.battery} tone="ok" icon={I.bolt} wide/>
          <TelemetryCard label="Network" value={s.signal[s.signal.length-1].toFixed(0)} unit="%" spark={s.signal} icon={I.wifi} wide/>
          <TelemetryCard label="CPU" value={s.cpu[s.cpu.length-1].toFixed(0)} unit="%" spark={s.cpu} tone="warn" icon={I.cpu} wide/>
          <TelemetryCard label="Core Temp" value={s.temp[s.temp.length-1].toFixed(1)} unit="°C" spark={s.temp} icon={I.cpu} wide/>
        </div>

        {/* flow + queue + log bottom */}
        <div style={{ gridColumn: '1 / 3', display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: 10, minHeight: 0, height: 220 }}>
          <Panel title={<><Icon d={I.route} size={12}/> Flow</>}>
            <div style={{ overflowY: 'auto', minHeight: 0 }}><FlowSteps steps={FLOW_STEPS} current={2}/></div>
          </Panel>
          <Panel title={<><Icon d={I.queue} size={12}/> Queue</>}>
            <div style={{ overflowY: 'auto', minHeight: 0 }}><TaskQueue tasks={TASKS}/></div>
          </Panel>
          <Panel title="Log" actions={<Chip dot tone="ok">live</Chip>}>
            <div style={{ overflowY: 'auto', minHeight: 0 }}><ActivityLog entries={s.log} dense/></div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ArmControlPanel — manipulator controller. Side-view image with joint sliders
// and gripper. `mode` controls framing: 'panel' = floating card (own header),
// 'embedded' = no header (used inside a tab body).
function ArmControlPanel({ mode = 'panel', locked = false, rightEdge, bottomOffset = 12, onClose }) {
  const [j1, setJ1] = React.useState(0);      // base rotation (deg)
  const [shoulder, setShoulder] = React.useState(-30);  // deg from vertical
  const [elbow, setElbow] = React.useState(60);
  const [wrist, setWrist] = React.useState(-10);
  const [gripper, setGripper] = React.useState(false); // open/closed
  const [preset, setPreset] = React.useState(null);

  const applyPreset = (name) => {
    setPreset(name);
    if (name === 'home') { setJ1(0); setShoulder(-30); setElbow(60); setWrist(-10); }
    if (name === 'tuck') { setJ1(0); setShoulder(-85); setElbow(120); setWrist(-40); }
    if (name === 'reach'){ setJ1(0); setShoulder(10); setElbow(30); setWrist(0); }
    setTimeout(() => setPreset(null), 300);
  };

  const JointRow = ({ label, value, setValue, min, max, unit = '°' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ width: 44, fontSize: 10, fontFamily: 'var(--mono)',
        color: 'rgba(255,255,255,.55)', letterSpacing: .5 }}>{label}</span>
      <input type="range" min={min} max={max} value={value} disabled={locked}
        onChange={(e) => setValue(+e.target.value)}
        style={{ flex: 1, accentColor: 'var(--accent)', opacity: locked ? 0.5 : 1 }}/>
      <span className="mono tnum" style={{ width: 42, textAlign: 'right', fontSize: 10.5,
        color: '#fff' }}>{value > 0 ? '+' : ''}{value}{unit}</span>
    </div>
  );

  const armInner = (
    <>
      {/* Arm visualization — image + base rotation ring */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1.1 / 1',
        borderRadius: 10, overflow: 'hidden',
        background: 'radial-gradient(circle at 40% 30%, #f5f5f7 0%, #d9dade 75%, #b9babf 100%)',
        border: '1px solid rgba(255,255,255,.08)', marginBottom: 10 }}>
        {/* J1 base rotation ring */}
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
          width: 76, height: 20, borderRadius: '50%',
          border: '1.5px dashed rgba(60,70,100,.4)', pointerEvents: 'none' }}/>
        {/* Arm image — flip + tilt based on joint state for visual feedback */}
        <img src={window.__resources?.assets_arm_side_png || (window.__resources?.assets_arm_side_png || "assets/arm-side.png")} alt="Arm"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain',
            opacity: locked ? 0.55 : 1,
            transform: `rotateY(${j1 * 0.4}deg) rotate(${(shoulder + 30) * 0.15}deg)`,
            transformOrigin: '50% 85%',
            filter: 'contrast(1.05) drop-shadow(0 4px 12px rgba(0,0,0,.25))',
            transition: 'transform .25s ease-out' }}/>
        {/* Gripper indicator */}
        <div style={{ position: 'absolute', top: 8, right: 8,
          padding: '3px 7px', borderRadius: 4,
          background: gripper ? 'rgba(91,91,247,.85)' : 'rgba(14,16,20,.7)',
          border: `1px solid ${gripper ? 'var(--accent)' : 'rgba(255,255,255,.18)'}`,
          fontSize: 9, fontFamily: 'var(--mono)', color: '#fff',
          letterSpacing: .8, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: 3,
            background: gripper ? '#fff' : 'rgba(255,255,255,.5)' }}/>
          {gripper ? 'CLOSED' : 'OPEN'}
        </div>
        {/* Pose readout */}
        <div style={{ position: 'absolute', bottom: 4, left: 6,
          fontSize: 9, fontFamily: 'var(--mono)', color: 'rgba(40,50,80,.7)',
          letterSpacing: .5, lineHeight: 1.3 }}>
          <div>XYZ [0.42, 0.18, 0.31]m</div>
          <div>RPY [-0.1, 2.1, 0.0]</div>
        </div>
        {/* Preset flash */}
        {preset && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ padding: '4px 10px', borderRadius: 4, fontSize: 10,
              fontFamily: 'var(--mono)', letterSpacing: 1,
              background: 'rgba(91,91,247,.9)', color: '#fff' }}>→ {preset.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Joint sliders */}
      <JointRow label="J1 base" value={j1} setValue={setJ1} min={-180} max={180}/>
      <JointRow label="J2 shld" value={shoulder} setValue={setShoulder} min={-90} max={90}/>
      <JointRow label="J3 elbw" value={elbow} setValue={setElbow} min={0} max={150}/>
      <JointRow label="J4 wrst" value={wrist} setValue={setWrist} min={-90} max={90}/>

      {/* Gripper + presets row */}
      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        <button onClick={() => setGripper(g => !g)} disabled={locked}
          style={{ flex: 1.2, padding: '6px', borderRadius: 5,
            border: `1px solid ${gripper ? 'var(--accent)' : 'rgba(255,255,255,.14)'}`,
            background: gripper ? 'rgba(91,91,247,.25)' : 'rgba(255,255,255,.04)',
            color: gripper ? '#c7d2fe' : 'rgba(255,255,255,.85)',
            cursor: locked ? 'not-allowed' : 'pointer',
            fontSize: 10.5, fontFamily: 'var(--mono)', letterSpacing: .6,
            opacity: locked ? 0.5 : 1, display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', gap: 4 }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            {gripper
              ? <><path d="M3 2v5a3 3 0 006 0V2"/><path d="M3 6h6"/></>
              : <><path d="M3 2v4M9 2v4M2 8h8"/></>}
          </svg>
          {gripper ? 'Close' : 'Open'}
        </button>
        <button onClick={() => applyPreset('home')} disabled={locked}
          title="Home"
          style={{ flex: 1, padding: '6px', borderRadius: 5,
            border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)',
            color: 'rgba(255,255,255,.85)', cursor: locked ? 'not-allowed' : 'pointer',
            fontSize: 10, fontFamily: 'var(--mono)', opacity: locked ? 0.5 : 1,
            letterSpacing: .5 }}>Home</button>
        <button onClick={() => applyPreset('tuck')} disabled={locked}
          title="Tuck arm"
          style={{ flex: 1, padding: '6px', borderRadius: 5,
            border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)',
            color: 'rgba(255,255,255,.85)', cursor: locked ? 'not-allowed' : 'pointer',
            fontSize: 10, fontFamily: 'var(--mono)', opacity: locked ? 0.5 : 1,
            letterSpacing: .5 }}>Tuck</button>
        <button onClick={() => applyPreset('reach')} disabled={locked}
          title="Reach out"
          style={{ flex: 1, padding: '6px', borderRadius: 5,
            border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)',
            color: 'rgba(255,255,255,.85)', cursor: locked ? 'not-allowed' : 'pointer',
            fontSize: 10, fontFamily: 'var(--mono)', opacity: locked ? 0.5 : 1,
            letterSpacing: .5 }}>Reach</button>
      </div>
    </>
  );

  if (mode === 'embedded') {
    return <div style={{ padding: 12 }}>{armInner}</div>;
  }

  // 'panel' — floating card above Drive
  const PANEL_W = 280;
  return (
    <div style={{ position: 'absolute', bottom: bottomOffset, right: rightEdge, width: PANEL_W,
      borderRadius: 10, background: 'rgba(14,16,20,.85)', backdropFilter: 'blur(14px)',
      border: '1px solid rgba(255,255,255,.08)', padding: 10,
      transition: 'right .22s ease',
      boxShadow: '0 8px 28px rgba(0,0,0,.4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: 3,
          background: locked ? '#f59e0b' : '#22c55e',
          boxShadow: `0 0 6px ${locked ? '#f59e0b' : '#22c55e'}` }}/>
        <span style={{ fontSize: 10.5, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.65)',
          letterSpacing: 1, flex: 1 }}>ARM</span>
        <span className="mono tnum" style={{ fontSize: 9.5, color: 'rgba(199,210,254,.8)' }}>
          J1 {j1 > 0 ? '+' : ''}{j1}°
        </span>
        {onClose && (
          <button onClick={onClose} title="Hide"
            style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,.5)',
              cursor: 'pointer', width: 18, height: 18, borderRadius: 3, padding: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6"/></svg>
          </button>
        )}
      </div>
      {armInner}
    </div>
  );
}

Object.assign(window, { LayoutOperator, LayoutCinema, LayoutConsole, LayoutFlowFirst, LayoutAgentFlow, ArmControlPanel });

// ═══ LAYOUT D — Flow-first ════════════════════════════════════
// Flow pinned to the left as a tall sidebar. Camera+map center. Chat right.
// Flow is always visible so the operator sees the mission at a glance.
function LayoutFlowFirst({ lidar, setLidar }) {
  const s = useLiveState();
  const [flowName, setFlowName] = React.useState('Morning Café Run');
  const [flowVariant, setFlowVariant] = React.useState('grouped');
  const [flowOpen, setFlowOpen] = React.useState(false);
  const flow = FLOWS[flowName];
  const FlowRender = FLOW_VARIANTS[flowVariant].render;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <TopBar robot={ROBOT} connection={CONN} lidar={lidar} onLidarToggle={() => setLidar(!lidar)}/>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr 340px', gap: 10, padding: 10, minHeight: 0 }}>
        {/* LEFT · flow sidebar — dark panel */}
        <div style={{ background: '#12141a', border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 10, display: 'flex', flexDirection: 'column', minHeight: 0, color: '#fff' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.5)',
                letterSpacing: 1 }}>MISSION FLOW</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{flowName}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.45)',
                letterSpacing: .5, marginTop: 2 }}>{flow.tag}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button onClick={() => setFlowVariant(Object.keys(FLOW_VARIANTS)[(Object.keys(FLOW_VARIANTS).indexOf(flowVariant) + 1) % Object.keys(FLOW_VARIANTS).length])}
                title={`View: ${FLOW_VARIANTS[flowVariant].label}`}
                style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)',
                  color: 'rgba(255,255,255,.8)', fontSize: 9.5, fontFamily: 'var(--mono)', padding: '3px 6px', borderRadius: 4,
                  cursor: 'pointer', letterSpacing: .5 }}>
                {FLOW_VARIANTS[flowVariant].label.toUpperCase()}
              </button>
              <button onClick={() => setFlowOpen(!flowOpen)}
                style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)',
                  color: '#fff', fontSize: 10, fontFamily: 'inherit', padding: '3px 6px', borderRadius: 4,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
                Change
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 4l4 4 4-4"/></svg>
              </button>
            </div>
          </div>
          {flowOpen && (
            <div style={{ padding: 6, borderBottom: '1px solid rgba(255,255,255,.08)', background: 'rgba(0,0,0,.3)' }}>
              {Object.keys(FLOWS).map((n) => (
                <button key={n} onClick={() => { setFlowName(n); setFlowOpen(false); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', padding: '6px 8px',
                    background: n === flowName ? 'rgba(91,91,247,.2)' : 'transparent', color: '#fff',
                    borderRadius: 4, fontFamily: 'inherit', cursor: 'pointer', fontSize: 11.5, fontWeight: n === flowName ? 600 : 400 }}
                  onMouseEnter={(e) => { if (n !== flowName) e.currentTarget.style.background = 'rgba(255,255,255,.05)'; }}
                  onMouseLeave={(e) => { if (n !== flowName) e.currentTarget.style.background = 'transparent'; }}>
                  {n}
                </button>
              ))}
            </div>
          )}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
            <FlowRender flow={flow}/>
          </div>
          {/* mini controls at bottom */}
          <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,.08)',
            display: 'flex', gap: 4 }}>
            <MiniCtrl icon="M2 12L7 2l5 10z" label="Abort Flow" danger/>
            <MiniCtrl icon="M3 6V4a3 3 0 016 0v2M2 6h8v6H2z" label="Lock Position"/>
            <MiniCtrl icon="M2 7h6M8 4l4 3-4 3" label="Release Arm"/>
          </div>
        </div>

        {/* CENTER · camera + map */}
        <div style={{ display: 'grid', gridTemplateRows: '1.1fr 1fr auto', gap: 10, minHeight: 0 }}>
          <Panel pad={false} title={<><Icon d={I.cam} size={12}/> Camera · CAM_01</>}
            actions={<Chip dot tone="danger" style={{ background: 'var(--danger-soft)' }}>REC</Chip>}>
            <CameraView robot={ROBOT} lidar={lidar}/>
          </Panel>
          <Panel pad={false} title={<><Icon d={I.map} size={12}/> Map · Floor 3 · Ward B</>}
            actions={<><IconBtn icon={I.lidar} size={22} active={lidar} onClick={() => setLidar(!lidar)}/><IconBtn icon={I.expand} size={22}/></>}>
            <MapView robot={ROBOT} showLidar={lidar}/>
          </Panel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            <TelemetryCard label="Battery" value={s.battery[s.battery.length-1].toFixed(0)} unit="%" spark={s.battery} tone="ok" icon={I.bolt}/>
            <TelemetryCard label="Signal" value={s.signal[s.signal.length-1].toFixed(0)} unit="%" spark={s.signal} icon={I.wifi}/>
            <TelemetryCard label="CPU" value={s.cpu[s.cpu.length-1].toFixed(0)} unit="%" spark={s.cpu} tone="warn" icon={I.cpu}/>
            <TelemetryCard label="Temp" value={s.temp[s.temp.length-1].toFixed(1)} unit="°C" spark={s.temp} icon={I.cpu}/>
          </div>
        </div>

        {/* RIGHT · chat + queue */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr auto', gap: 10, minHeight: 0 }}>
          <Panel pad={false} title={<><Icon d={I.chat} size={12}/> Billie Boss</>}
            actions={<Chip dot tone="ok">ready</Chip>} style={{ minHeight: 0 }}>
            <AgentChat messages={s.messages} setMessages={s.setMessages} robot={ROBOT} variant="chat"/>
          </Panel>
          <Panel title={<><Icon d={I.queue} size={12}/> Queue · {TASKS.filter(t=>t.status!=='done').length}</>}
            style={{ height: 220 }}>
            <div style={{ overflowY: 'auto', minHeight: 0 }}><TaskQueue tasks={TASKS}/></div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function MiniCtrl({ icon, label, primary, danger }) {
  const bg = primary ? 'var(--accent)' : danger ? 'rgba(239,68,68,.14)' : 'rgba(255,255,255,.05)';
  const fg = primary ? '#fff' : danger ? '#fca5a5' : 'rgba(255,255,255,.85)';
  const border = primary ? 'var(--accent)' : danger ? 'rgba(239,68,68,.35)' : 'rgba(255,255,255,.1)';
  return (
    <button title={label} style={{ border: `1px solid ${border}`, background: bg, color: fg,
      padding: '6px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 10.5, fontWeight: 600,
      fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor"><path d={icon}/></svg>
      {label}
    </button>
  );
}

// Footer button for MISSION FLOW panel — Step / Play / Pause / Abort
function FlowFooterBtn({ icon, label, primary, danger, onClick }) {
  const bg = primary ? 'var(--accent)' : danger ? 'rgba(239,68,68,.12)' : 'rgba(255,255,255,.04)';
  const fg = primary ? '#fff' : danger ? '#fca5a5' : 'rgba(255,255,255,.85)';
  const border = primary ? 'var(--accent)' : danger ? 'rgba(239,68,68,.35)' : 'rgba(255,255,255,.1)';
  return (
    <button onClick={onClick} style={{ border: `1px solid ${border}`, background: bg, color: fg,
      padding: '6px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 600,
      fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5,
      transition: 'background .12s' }}
      onMouseEnter={(e) => { if (!primary && !danger) e.currentTarget.style.background = 'rgba(255,255,255,.08)'; }}
      onMouseLeave={(e) => { if (!primary && !danger) e.currentTarget.style.background = bg; }}>
      {icon}
      {label}
    </button>
  );
}

// ═══ LAYOUT E — Agent+Flow ════════════════════════════════════
// Flow embedded INSIDE the agent panel, as a collapsible header section.
// Camera+map take the center; the combined Agent+Flow panel is the right rail.
function LayoutAgentFlow({ lidar, setLidar }) {
  const s = useLiveState();
  const [flowName, setFlowName] = React.useState('Morning Café Run');
  const [flowVariant, setFlowVariant] = React.useState('compact');
  const [flowExpanded, setFlowExpanded] = React.useState(true);
  const flow = FLOWS[flowName];
  const FlowRender = FLOW_VARIANTS[flowVariant].render;
  const { rows, currentGlobal, total } = flattenFlow(flow);
  const cur = rows[currentGlobal];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <TopBar robot={ROBOT} connection={CONN} lidar={lidar} onLidarToggle={() => setLidar(!lidar)}/>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.6fr 1fr 380px', gap: 10, padding: 10, minHeight: 0 }}>
        {/* camera */}
        <Panel pad={false} title={<><Icon d={I.cam} size={12}/> Camera · CAM_01</>}
          actions={<Chip dot tone="danger" style={{ background: 'var(--danger-soft)' }}>REC</Chip>}>
          <CameraView robot={ROBOT} lidar={lidar}/>
        </Panel>
        {/* map + telemetry */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr auto', gap: 10, minHeight: 0 }}>
          <Panel pad={false} title={<><Icon d={I.map} size={12}/> Map · Floor 3 · Ward B</>}
            actions={<><IconBtn icon={I.lidar} size={22} active={lidar} onClick={() => setLidar(!lidar)}/><IconBtn icon={I.expand} size={22}/></>}>
            <MapView robot={ROBOT} showLidar={lidar}/>
          </Panel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            <TelemetryCard label="Battery" value={s.battery[s.battery.length-1].toFixed(0)} unit="%" spark={s.battery} tone="ok" icon={I.bolt}/>
            <TelemetryCard label="Signal" value={s.signal[s.signal.length-1].toFixed(0)} unit="%" spark={s.signal} icon={I.wifi}/>
            <TelemetryCard label="CPU" value={s.cpu[s.cpu.length-1].toFixed(0)} unit="%" spark={s.cpu} tone="warn" icon={I.cpu}/>
            <TelemetryCard label="Temp" value={s.temp[s.temp.length-1].toFixed(1)} unit="°C" spark={s.temp} icon={I.cpu}/>
          </div>
        </div>
        {/* RIGHT · combined Agent + Flow */}
        <div style={{ background: '#12141a', border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 10, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          {/* Agent identity bar */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.08)',
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <img src={window.__resources?.billie_boss_logo_jpg || (window.__resources?.billie_boss_logo_jpg || "billie-boss-logo.jpg")} alt="Billie Boss" style={{ width: 28, height: 28, borderRadius: 14, objectFit: 'cover', background: '#fff' }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Billie Boss</div>
              <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>mission-control agent</div>
            </div>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}/>
          </div>

          {/* Embedded flow card */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
            <button onClick={() => setFlowExpanded(!flowExpanded)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '9px 14px', border: 'none', background: 'rgba(91,91,247,.08)',
                color: '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                style={{ transform: flowExpanded ? 'rotate(90deg)' : 'none', transition: 'transform .15s',
                  color: 'rgba(255,255,255,.6)' }}><path d="M4 2l4 4-4 4"/></svg>
              <Icon d={I.route} size={11}/>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Flow · {flowName}</span>
              <span style={{ flex: 1 }}/>
              <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>
                {currentGlobal + 1}/{total}
              </span>
            </button>
            {flowExpanded && (
              <div style={{ padding: '10px 12px 12px' }}>
                {/* variant + flow picker row */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  <select value={flowName} onChange={(e) => setFlowName(e.target.value)}
                    style={{ flex: 1, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                      color: '#fff', borderRadius: 4, padding: '3px 6px', fontSize: 10.5, fontFamily: 'inherit',
                      cursor: 'pointer' }}>
                    {Object.keys(FLOWS).map(n => <option key={n} value={n} style={{ background: '#12141a' }}>{n}</option>)}
                  </select>
                  <button onClick={() => setFlowVariant(Object.keys(FLOW_VARIANTS)[(Object.keys(FLOW_VARIANTS).indexOf(flowVariant) + 1) % Object.keys(FLOW_VARIANTS).length])}
                    title={`View: ${FLOW_VARIANTS[flowVariant].label}`}
                    style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)',
                      color: 'rgba(255,255,255,.85)', fontSize: 9.5, fontFamily: 'var(--mono)', padding: '3px 6px', borderRadius: 4,
                      cursor: 'pointer', letterSpacing: .5, flexShrink: 0 }}>
                    {FLOW_VARIANTS[flowVariant].label.toUpperCase()}
                  </button>
                </div>
                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  <FlowRender flow={flow}/>
                </div>
                {/* primary actions footer */}
                <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                  <MiniCtrl icon="M2 12L7 2l5 10z" label="Abort Flow" danger/>
                  <MiniCtrl icon="M3 6V4a3 3 0 016 0v2M2 6h8v6H2z" label="Lock Position"/>
                  <MiniCtrl icon="M2 7h6M8 4l4 3-4 3" label="Release Arm"/>
                </div>
              </div>
            )}
            {!flowExpanded && cur && (
              <div style={{ padding: '0 14px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 10.5, color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>
                  <span>{cur.poi}</span>
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{ opacity: .5 }}><path d="M4 2l4 4-4 4"/></svg>
                  <span>{cur.item}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 9, color: 'var(--accent)',
                    letterSpacing: 1, background: 'rgba(91,91,247,.2)', padding: '1px 5px',
                    borderRadius: 3, flexShrink: 0 }}>NOW</span>
                  <span style={{ fontSize: 12, color: '#fff', fontWeight: 500, flex: 1,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cur.action}</span>
                </div>
                <div style={{ height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 1,
                  overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round(((currentGlobal + 1) / total) * 100)}%`,
                    height: '100%', background: 'var(--accent)', transition: 'width .3s' }}/>
                </div>
              </div>
            )}
          </div>

          {/* Chat region */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <DarkChatWithQuick messages={s.messages} setMessages={s.setMessages} robot={ROBOT}/>
          </div>
        </div>
      </div>
    </div>
  );
}
