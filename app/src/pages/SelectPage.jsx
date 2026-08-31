import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MODULES } from '../data/module01';
import { useProgressStore } from '../store/progress';

const ANGLE_STEP = 20; // was an editor-tunable prop in the source design

export default function SelectPage() {
  const navigate = useNavigate();
  const done = useProgressStore((s) => s.done);
  const reset = useProgressStore((s) => s.reset);
  // Which card the wheel is focused on — transient UI state, not progress.
  const [active, setActive] = useState(0);
  const n = MODULES.length;
  const a = MODULES[active];

  const jump = useCallback(
    (i) => setActive(Math.min(n - 1, Math.max(0, i))),
    [n, setActive],
  );

  const start = useCallback(() => {
    // Module 1 is the only one with content; the rest open the same reader and
    // show the "not filled in yet" state.
    navigate(`/module/${active + 1}`);
  }, [active, navigate]);

  useEffect(() => {
    const onKey = (e) => {
      if (['ArrowDown', 'ArrowRight'].includes(e.key)) { e.preventDefault(); jump(active + 1); }
      if (['ArrowUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); jump(active - 1); }
      if (e.key === 'Enter') start();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, jump, start]);

  return (
    <div style={{ position: 'relative', height: '100dvh', overflow: 'hidden' }}>
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
          padding: '22px 34px', display: 'flex', alignItems: 'center', gap: 20,
          animation: 'msFadeIn .9s ease both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(246,244,239,.08)', border: '1px solid rgba(246,244,239,.18)', display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 13, height: 13, borderRadius: '4px 4px 7px 7px', border: '2.5px solid #1CABE2' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.2px' }}>SafeSteps</span>
            <span style={{ fontSize: 10.5, color: '#8891A0', letterSpacing: '.1em', textTransform: 'uppercase' }}>Digital safety</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 26 }}>
          <span style={{ fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7C8593' }}>Ընտրեք մոդուլը</span>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 3, fontVariantNumeric: 'tabular-nums' }}>
            <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.5px', color: '#F6F4EF' }}>
              {String(active + 1).padStart(2, '0')}
            </span>
            <span style={{ fontSize: 12.5, color: '#6E7787' }}>/ {String(n).padStart(2, '0')}</span>
          </span>
        </div>
      </header>

      {/* Left dot rail */}
      <div style={{ position: 'fixed', left: 34, top: '50%', transform: 'translateY(-50%)', zIndex: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {MODULES.map((m, i) => (
          <div
            key={i}
            role="button"
            tabIndex={0}
            aria-label={`Մոդուլ ${i + 1}`}
            onClick={() => jump(i)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jump(i); } }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', opacity: i === active ? 1 : 0.6, transition: 'opacity .4s ease' }}
          >
            <span style={{ width: i === active ? 34 : 14, height: 2, background: i === active ? a.accent : 'rgba(246,244,239,.3)', transition: 'width .5s cubic-bezier(.4,0,.2,1), background .5s' }} />
            <span style={{ fontSize: 11, letterSpacing: '.1em', color: i === active ? '#F6F4EF' : '#6E7787', fontVariantNumeric: 'tabular-nums', transition: 'color .5s' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
          </div>
        ))}
      </div>

      {/* The arc of cards */}
      <div
        style={{
          position: 'fixed', left: '50%', top: 'calc(31vh + var(--R))', width: 0, height: 0, zIndex: 20,
          '--ch': 'clamp(220px, min(52vw, 45vh), 620px)',
          '--cw': 'calc(var(--ch) * 0.75)',
          '--R': 'calc(var(--ch) * 1.85)',
        }}
      >
        {MODULES.map((m, i) => {
          const d = i - active;
          const dist = Math.abs(d);
          const focused = dist === 0;
          const isDone = !!done[i];
          return (
            <div
              key={i}
              onClick={() => { if (!focused) jump(i); }}
              style={{
                position: 'absolute', left: 0, top: 0,
                width: 'var(--cw)', height: 'var(--ch)',
                marginLeft: 'calc(var(--cw) / -2)', marginTop: 'calc(var(--ch) / -2)',
                transform: `rotate(${(d * ANGLE_STEP).toFixed(2)}deg) translateY(calc(-1 * var(--R)))`,
                transformOrigin: '50% 50%',
                opacity: focused ? 1 : dist === 1 ? 0.5 : dist === 2 ? 0.18 : 0,
                filter: `blur(${focused ? '0px' : dist === 1 ? '5px' : '11px'}) grayscale(${focused ? 0 : 0.85})`,
                zIndex: 20 - dist,
                cursor: focused ? 'default' : 'pointer',
                pointerEvents: dist > 2 ? 'none' : 'auto',
                transition: 'transform 460ms cubic-bezier(.62,0,.26,1), opacity 280ms ease-out, filter 300ms ease-out',
                willChange: 'transform, opacity',
              }}
            >
              <div
                style={{
                  position: 'relative', width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden',
                  background: '#F7F5F0',
                  border: `1px solid ${focused ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.4)'}`,
                  boxShadow: focused
                    ? '0 46px 90px -40px rgba(0,0,0,.85), 0 0 0 1px rgba(255,255,255,.08)'
                    : '0 30px 60px -40px rgba(0,0,0,.7)',
                  transition: 'box-shadow 320ms ease-out, border-color 320ms ease-out',
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: m.wash }} />
                <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', right: -90, top: -100, background: m.glow, filter: 'blur(26px)' }} />
                <div style={{ position: 'relative', height: '100%', padding: 'calc(var(--ch) * .072)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 'max(9px, calc(var(--ch) * .034))', letterSpacing: '.16em', textTransform: 'uppercase', color: '#7B8492', whiteSpace: 'nowrap' }}>
                      {m.kicker}
                    </span>
                    <span style={{ flexShrink: 0, width: 9, height: 9, borderRadius: '50%', background: isDone ? '#24A783' : 'rgba(20,24,31,.16)', boxShadow: `0 0 0 4px ${isDone ? 'rgba(36,167,131,.2)' : 'rgba(20,24,31,.05)'}` }} />
                  </div>
                  <div style={{ fontFamily: "'Spectral', serif", fontSize: 'calc(var(--ch) * .25)', lineHeight: .8, fontWeight: 600, letterSpacing: '-.04em', color: '#151A21', marginTop: 'auto' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ marginTop: 'calc(var(--ch) * .04)', fontSize: 'max(13px, calc(var(--ch) * .057))', lineHeight: 1.2, fontWeight: 600, letterSpacing: '-.5px', color: '#151A21' }}>
                    {m.title}
                  </div>
                  <div style={{ marginTop: 'calc(var(--ch) * .04)', paddingTop: 'calc(var(--ch) * .036)', borderTop: '1px solid rgba(20,24,31,.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 'max(9.5px, calc(var(--ch) * .032))', color: '#7B8492', whiteSpace: 'nowrap' }}>
                    <span>{m.meta || '9 բաժին · 9 հարց'}</span>
                    <span>{m.time || '~25 րոպե'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active module summary + CTA */}
      <div style={{ position: 'fixed', left: '50%', bottom: '3.4vh', transform: 'translateX(-50%)', zIndex: 30, width: 'min(620px, 80vw)', textAlign: 'center' }}>
        <div style={{ animation: 'msRise .5s cubic-bezier(.2,.85,.2,1) both' }}>
          <div style={{ fontSize: 11.5, letterSpacing: '.18em', textTransform: 'uppercase', color: a.accent, transition: 'color .5s' }}>{a.kicker}</div>
          <h1 style={{ margin: '14px 0 0', fontSize: 'clamp(28px, 3.4vw, 44px)', lineHeight: 1.08, letterSpacing: '-1.6px', fontWeight: 600 }}>{a.title}</h1>
          <p style={{ margin: '14px auto 0', maxWidth: 500, fontSize: 14.5, lineHeight: 1.65, color: '#9BA4B2', fontWeight: 300 }}>{a.blurb}</p>
          <div style={{ marginTop: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="ms-lift"
              onClick={start}
              style={{ padding: '15px 28px', borderRadius: 13, border: 'none', background: '#1CABE2', color: '#10141A', fontSize: 14.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 14px 34px -12px rgba(28,171,226,.55)' }}
            >
              {done[active] ? 'Վերանայել մոդուլը' : 'Սկսել մոդուլը'}
            </button>
            <span style={{ fontSize: 12.5, color: '#6E7787' }}>
              {done[active] ? 'Ավարտված է' : '9 բաժին, ապա՝ վիկտորինա'}
            </span>
            {/* D11 — explicit progress reset, so a reviewer can retest the
                gating from a clean state. */}
            <button
              onClick={() => { if (window.confirm('Զրոյացնե՞լ ընթացքը։')) reset(); }}
              style={{ padding: '8px 14px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(246,244,239,.24)', color: '#8891A0', fontSize: 11.5, cursor: 'pointer' }}
            >
              Զրոյացնել ընթացքը
            </button>
          </div>
        </div>
      </div>

      {/* Prev / next */}
      <div className="ms-footer-nav" style={{ position: 'fixed', left: '50%', bottom: '3.4vh', transform: 'translateX(-50%)', zIndex: 31, width: 'min(1100px, 94vw)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <button
          className="ms-card-btn"
          onClick={() => jump(active - 1)}
          disabled={active === 0}
          style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 11, padding: '13px 20px 13px 15px', borderRadius: 14, background: 'rgba(246,244,239,.14)', border: '1.5px solid rgba(246,244,239,.42)', backdropFilter: 'blur(10px)', boxShadow: '0 12px 30px -16px rgba(0,0,0,.7)', color: active > 0 ? '#F6F4EF' : '#7A828F', fontSize: 13.5, fontWeight: 500, cursor: active > 0 ? 'pointer' : 'not-allowed', opacity: active > 0 ? 1 : 0.45, transition: 'background .22s ease, transform .22s cubic-bezier(.2,.85,.2,1), opacity .3s ease' }}
        >
          <span style={{ fontSize: 15 }}>←</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.25 }}>
            <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#9BA4B2' }}>Նախորդ</span>
            <span>{active > 0 ? `Մոդուլ ${String(active).padStart(2, '0')}` : 'Ցանկի սկիզբ'}</span>
          </span>
        </button>
        <button
          className="ms-card-btn"
          onClick={() => jump(active + 1)}
          disabled={active === n - 1}
          style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 11, padding: '13px 15px 13px 20px', borderRadius: 14, background: 'rgba(246,244,239,.14)', border: '1.5px solid rgba(246,244,239,.42)', backdropFilter: 'blur(10px)', boxShadow: '0 12px 30px -16px rgba(0,0,0,.7)', color: active < n - 1 ? '#F6F4EF' : '#7A828F', fontSize: 13.5, fontWeight: 500, cursor: active < n - 1 ? 'pointer' : 'not-allowed', opacity: active < n - 1 ? 1 : 0.45, transition: 'background .22s ease, transform .22s cubic-bezier(.2,.85,.2,1), opacity .3s ease' }}
        >
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.25 }}>
            <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#9BA4B2' }}>Հաջորդ</span>
            <span>{active < n - 1 ? `Մոդուլ ${String(active + 2).padStart(2, '0')}` : 'Ցանկի վերջ'}</span>
          </span>
          <span style={{ fontSize: 15 }}>→</span>
        </button>
      </div>
    </div>
  );
}
