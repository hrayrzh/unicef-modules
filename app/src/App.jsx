import { Outlet, useLocation } from 'react-router-dom';
import { MODULES } from './data/module01';
import { useProgressStore } from './store/progress';

export default function App() {
  const location = useLocation();
  const inReader = location.pathname.startsWith('/module/');
  // The wheel's focused card is derived from the route so the ambient glow and
  // the reader agree on which module is in play.
  const match = location.pathname.match(/^\/module\/(\d+)/);
  const active = match ? Math.min(MODULES.length - 1, Math.max(0, Number(match[1]) - 1)) : 0;
  const accent = MODULES[active] || MODULES[0];
  const hydrated = useProgressStore.persist?.hasHydrated?.() ?? true;

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', overflow: 'hidden', background: '#0E1218', visibility: hydrated ? 'visible' : 'hidden' }}>
      {/* Ambient glow. Decorative only, so it never takes pointer events. */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
        <div
          style={{
            position: 'absolute', width: 900, height: 900, borderRadius: '50%',
            left: '50%', top: '42%', transform: 'translate(-50%,-50%)',
            background: `radial-gradient(circle, ${accent.glow}, transparent 62%)`,
            filter: 'blur(40px)', transition: 'background 900ms ease, opacity .4s ease',
            animation: 'msGlow 12s ease-in-out infinite',
            opacity: inReader ? 0 : 1,
          }}
        />
        <div
          style={{
            position: 'absolute', width: 620, height: 620, borderRadius: '50%',
            right: -180, bottom: -200,
            background: 'radial-gradient(circle, rgba(51,85,255,.32), transparent 66%)',
            filter: 'blur(34px)', animation: 'msGlow 15s ease-in-out 2s infinite',
            opacity: inReader ? 0 : 1, transition: 'opacity .4s ease',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% 120%, rgba(14,18,24,.9), transparent 60%)' }} />
      </div>
      <Outlet />
    </div>
  );
}
