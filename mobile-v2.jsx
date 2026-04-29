/* mobile-v2-dispatcher.jsx — Balanced layout.
   Feed is the hero; agent approvals are SWIPE CARDS stacked above the feed's
   lower edge (Tinder-style: drag right = approve, left = deny). Queue lives
   in a draggable bottom sheet that peeks 2 rows by default and expands on tap. */

function MobileV2({ layoutVariant = 'feed' }) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [cards, setCards] = React.useState([
    {
      id: 1,
      title: 'Enter room 314 to investigate open door?',
      detail: 'Outside default permissions. I can log + skip, or enter briefly.',
      meta: '11:44',
    },
    {
      id: 2,
      title: 'Deviate from sweep route to charger B?',
      detail: 'Battery is 34%. Earlier-than-planned dock saves 4 min and avoids low-power cutoff.',
      meta: '11:43',
    },
  ]);
  const [drag, setDrag] = React.useState({ x: 0, active: false });
  const topCard = cards[0];

  const handleDown = (e) => {
    if (!topCard) return;
    const startX = (e.touches ? e.touches[0].clientX : e.clientX);
    const move = (ev) => {
      const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - startX;
      setDrag({ x, active: true });
    };
    const up = (ev) => {
      const x = (ev.changedTouches ? ev.changedTouches[0].clientX : ev.clientX) - startX;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
      if (Math.abs(x) > 90) {
        setDrag({ x: x > 0 ? 400 : -400, active: false });
        setTimeout(() => {
          setCards(c => c.slice(1));
          setDrag({ x: 0, active: false });
        }, 180);
      } else {
        setDrag({ x: 0, active: false });
      }
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
  };

  const resolveTop = (approve) => {
    setDrag({ x: approve ? 400 : -400, active: false });
    setTimeout(() => { setCards(c => c.slice(1)); setDrag({ x: 0, active: false }); }, 180);
  };

  return (
    <div style={{ height: '100%', position: 'relative',
      background: '#0b0d12', color: '#fff', overflow: 'hidden',
      paddingTop: 54 }}>
      {/* header — glass over feed */}
      <div style={{ position: 'absolute', top: 54, left: 0, right: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
        <button style={{ width: 36, height: 36, borderRadius: 18,
          background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.08)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MIcon d={MI.menu} size={18}/>
        </button>
        <MRobotPill name="Billie-07" status="online" dark/>
        <div style={{ marginLeft: 'auto' }}>
          <button style={{ width: 36, height: 36, borderRadius: 18,
            background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.08)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            color: '#fff', cursor: 'pointer', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MIcon d={MI.alert} size={18}/>
          </button>
        </div>
      </div>

      {/* feed — full-bleed hero */}
      <div style={{ position: 'absolute', top: 54, left: 0, right: 0, bottom: 0 }}>
        {layoutVariant === 'map' ? (
          <MMapPanel height="100%"/>
        ) : (
          <MFeed height="100%" radius={0}/>
        )}
        {/* dark gradient under stack */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%',
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,.75))',
          pointerEvents: 'none' }}/>
      </div>

      {/* telemetry + joystick (side-by-side, centered below header) */}
      <div style={{ position: 'absolute', top: 120, left: 14, right: 14, zIndex: 20 }}>
        <MTelemetry dark compact/>
      </div>

      {/* swipe card stack (above bottom sheet) */}
      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 240, zIndex: 25,
        display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cards.length > 0 && (
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,.7)',
            letterSpacing: .6, textTransform: 'uppercase', display: 'flex',
            alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--agent)',
              animation: 'mobPulse 1.2s ease infinite' }}/>
            {cards.length} pending approval{cards.length > 1 ? 's' : ''}
            <span style={{ marginLeft: 'auto', fontWeight: 500, textTransform: 'none',
              fontSize: 10, color: 'rgba(255,255,255,.5)', letterSpacing: 0 }}>
              swipe → approve, ← deny
            </span>
          </div>
        )}
        <div style={{ position: 'relative', height: 180 }}>
          {cards.slice(0, 3).reverse().map((c, i, arr) => {
            const isTop = i === arr.length - 1;
            const depth = arr.length - 1 - i;
            const rot = isTop ? drag.x * 0.05 : 0;
            return (
              <div key={c.id}
                onMouseDown={isTop ? handleDown : undefined}
                onTouchStart={isTop ? handleDown : undefined}
                style={{
                  position: 'absolute', inset: 0,
                  transform: `translate(${isTop ? drag.x : 0}px, ${depth * -8}px) scale(${1 - depth * 0.04}) rotate(${rot}deg)`,
                  transition: drag.active ? 'none' : 'transform .25s cubic-bezier(.2,.8,.2,1)',
                  zIndex: arr.length - depth,
                  cursor: isTop ? 'grab' : 'default',
                  opacity: 1 - depth * 0.15,
                }}>
                <MApproval {...c} dark compact
                  onApprove={() => resolveTop(true)}
                  onDeny={() => resolveTop(false)}/>
                {/* swipe hint overlay */}
                {isTop && drag.active && (
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 14,
                    background: drag.x > 0 ? 'rgba(22,163,74,.25)' : drag.x < 0 ? 'rgba(220,38,38,.25)' : 'transparent',
                    pointerEvents: 'none', display: 'flex', alignItems: 'center',
                    justifyContent: drag.x > 0 ? 'flex-start' : 'flex-end', padding: 24 }}>
                    <div style={{ padding: '6px 12px', borderRadius: 8, fontWeight: 700,
                      fontSize: 14, letterSpacing: 1,
                      border: `2px solid ${drag.x > 0 ? 'var(--ok)' : 'var(--danger)'}`,
                      color: drag.x > 0 ? 'var(--ok)' : 'var(--danger)',
                      transform: `rotate(${drag.x > 0 ? -12 : 12}deg)`, background: 'rgba(0,0,0,.4)' }}>
                      {drag.x > 0 ? 'APPROVE' : 'DENY'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {cards.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: 14,
              background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 6, color: 'rgba(255,255,255,.6)' }}>
              <MIcon d={MI.check} size={22} stroke={2.4}/>
              <div style={{ fontSize: 13, fontWeight: 500 }}>All clear</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Agent is running autonomously</div>
            </div>
          )}
        </div>
      </div>

      {/* bottom sheet — queue */}
      <div style={{ position: 'absolute', left: 0, right: 0,
        bottom: 0, zIndex: 30,
        transform: sheetOpen ? 'translateY(0)' : 'translateY(calc(100% - 220px))',
        transition: 'transform .3s cubic-bezier(.2,.8,.2,1)',
        background: '#14161c', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        border: '1px solid rgba(255,255,255,.08)', borderBottom: 'none',
        boxShadow: '0 -8px 24px rgba(0,0,0,.4)',
        maxHeight: 'calc(100% - 180px)', display: 'flex', flexDirection: 'column' }}>
        {/* handle */}
        <div onClick={() => setSheetOpen(!sheetOpen)}
          style={{ padding: '8px 0 4px', cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.25)',
            margin: '0 auto' }}/>
        </div>
        {/* header */}
        <div onClick={() => setSheetOpen(!sheetOpen)}
          style={{ display: 'flex', alignItems: 'center', padding: '8px 16px 10px',
            cursor: 'pointer', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Queue</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <MEStop size={44} label={false}/>
          </div>
        </div>
        {/* queue rows */}
        <div style={{ padding: '4px 14px 14px', display: 'flex', flexDirection: 'column', gap: 6,
          overflow: 'auto', flex: 1 }}>
          {SEED_QUEUE.filter(q => q.status !== 'queued' && q.status !== 'running').map((q, i) => <MTaskRow key={i} {...q} dark compact/>)}
        </div>
      </div>

      {/* joystick FAB (appears when you tap "take control") — simplified: always small pill */}
      <button onClick={() => {}}
        style={{ position: 'absolute', right: 14, bottom: 240, zIndex: 24,
          width: 44, height: 44, borderRadius: 22,
          background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.12)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          color: '#fff', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center' }}>
        <MIcon d={MI.joystick} size={18}/>
      </button>
    </div>
  );
}

Object.assign(window, { MobileV2 });
