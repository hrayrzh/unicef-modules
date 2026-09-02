import { useMemo, useState } from 'react';
import { buildScenario, menuRows } from '../guideSim';

/**
 * Модель экрана устройства: нужный пункт подсвечен, нажатие уводит на
 * следующий экран. Родители теряются не потому, что не понимают зачем, а
 * потому, что не знают, где в настройках что лежит — пройдя путь один раз
 * здесь, человек узнаёт его на своём телефоне.
 *
 * Симулятор не заменяет текстовый пошаговик, а идёт рядом с ним: текущий шаг
 * показан целиком над устройством, а полный список — на соседней вкладке.
 */
export default function GuideSimulator({ guide }) {
  const screens = useMemo(() => buildScenario(guide), [guide]);
  const [at, setAt] = useState(0);
  const [toggled, setToggled] = useState(false);

  const finished = at >= screens.length;
  const sc = finished ? null : screens[at];
  const step = finished ? null : guide.steps[sc.stepIndex];

  const DONE_TEXT = 'Այս ուղեցույցի բոլոր քայլերն անցել եք սիմուլյատորի վրա։';
  // Шаги разной длины, и блок задания менял высоту на каждом переходе —
  // устройство под ним прыгало вверх-вниз. Самый длинный текст держит высоту
  // невидимой копией, актуальный текст лежит поверх: блок больше не дышит.
  const tallest = useMemo(
    () => [...(guide.steps || []), DONE_TEXT].reduce((a, b) => (b.length > a.length ? b : a), ''),
    [guide],
  );

  const advance = () => { setToggled(false); setAt((i) => i + 1); };
  // Переключателю нужно успеть доехать, но не настолько, чтобы это
  // читалось отдельным движением перед сменой экрана.
  const flip = () => { setToggled(true); setTimeout(advance, 240); };

  return (
    <div>
      {/* Задание — тот же текст, что и в списке шагов. */}
      <div style={{ borderRadius: 14, background: 'rgba(28,171,226,.07)', padding: '15px 18px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: '.13em', textTransform: 'uppercase', color: '#0F7FA8', fontWeight: 600, marginBottom: 6 }}>
          {finished
            ? 'Ավարտված է'
            : `Քայլ ${sc.stepIndex + 1} / ${guide.steps.length}`}
        </div>
        <div style={{ position: 'relative' }}>
          {/* Держит высоту — виден только самый длинный шаг, и то прозрачно. */}
          <div aria-hidden style={{ fontSize: 14.5, lineHeight: 1.7, visibility: 'hidden' }}>{tallest}</div>
          <div style={{ position: 'absolute', inset: 0, fontSize: 14.5, lineHeight: 1.7, color: '#2B313A' }}>
            {finished ? DONE_TEXT : step}
          </div>
        </div>
      </div>

      {/* Точки прогресса по экранам */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        {screens.map((s, i) => (
          <span
            key={s.key}
            style={{
              width: i === at ? 26 : 18, height: 4, borderRadius: 2,
              background: i < at ? '#24A783' : i === at ? '#1CABE2' : 'rgba(21,26,33,.14)',
              transition: 'all .3s cubic-bezier(.2,.85,.2,1)',
            }}
          />
        ))}
      </div>

      {/* Корпус устройства */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 320, background: '#151A21', borderRadius: 30, padding: 10, boxShadow: '0 24px 50px -24px rgba(21,26,33,.5)' }}>
          <div style={{ background: '#F2F4F8', borderRadius: 22, overflow: 'hidden', height: 320, display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 20, display: 'grid', placeItems: 'center' }}>
              <span style={{ width: 62, height: 4, borderRadius: 3, background: 'rgba(255,255,255,.4)' }} />
            </div>

            {finished ? (
              <div style={{ flex: 1, background: '#fff', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center', gap: 12 }}>
                <span style={{ width: 58, height: 58, borderRadius: '50%', background: '#24A783', display: 'grid', placeItems: 'center', animation: 'msPop .45s cubic-bezier(.2,.85,.2,1) both' }}>
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                    <path d="M5 12.5l4.6 4.6L19 7.5" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <b style={{ fontSize: 15, color: '#151A21' }}>{guide.name}</b>
                <span style={{ fontSize: 12.5, color: '#6E7787' }}>{screens.length} գործողություն</span>
                <button
                  onClick={() => { setAt(0); setToggled(false); }}
                  style={{ marginTop: 4, padding: '9px 18px', borderRadius: 100, border: '1px solid rgba(21,26,33,.18)', background: 'transparent', color: '#2B313A', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  Անցնել կրկին
                </button>
              </div>
            ) : (
              <>
                {/* Стрелка «назад» есть не на каждом экране, но место под неё
                    держится всегда — иначе заголовок скачет вбок на первом же
                    переходе. Симметричная распорка справа держит центровку. */}
                <div style={{ background: '#fff', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #E4E8F2' }}>
                  <span style={{ width: 8, flexShrink: 0, fontSize: 13, color: '#1CABE2', fontWeight: 700, visibility: at > 0 ? 'visible' : 'hidden' }}>‹</span>
                  <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#151A21', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sc.title || guide.sub?.split('(')[0]?.trim() || guide.name}
                  </span>
                  <span style={{ width: 8, flexShrink: 0 }} aria-hidden />
                </div>

                <div key={sc.key} style={{ flex: 1, background: '#fff', animation: 'msSimIn .16s ease-out both' }}>
                  {sc.kind === 'act' && (
                    <div style={{ padding: '26px 20px', display: 'grid', placeItems: 'center', gap: 14, textAlign: 'center' }}>
                      <span style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#1CABE2,#24A783)', display: 'grid', placeItems: 'center' }}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                          <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
                        </svg>
                      </span>
                      <span style={{ fontSize: 13, color: '#39415C', lineHeight: 1.55, fontWeight: 500 }}>{guide.name}</span>
                      <button
                        onClick={advance}
                        style={{ padding: '10px 20px', borderRadius: 100, border: 'none', background: '#1CABE2', color: '#0E1218', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Կատարեցի
                      </button>
                    </div>
                  )}

                  {sc.kind === 'toggle' && (
                    <>
                      <Row label={sc.target} highlight>
                        <Switch on={toggled} onClick={flip} />
                      </Row>
                      {menuRows(sc).filter((r) => !r.target).slice(0, 3).map((r) => (
                        <Row key={r.label} label={r.label} dim>
                          <Switch on={false} />
                        </Row>
                      ))}
                    </>
                  )}

                  {sc.kind === 'nav' && menuRows(sc).map((r) => (
                    <Row
                      key={r.label}
                      label={r.label}
                      highlight={r.target}
                      dim={!r.target}
                      onClick={r.target ? advance : undefined}
                    >
                      <span style={{ color: r.target ? '#1CABE2' : '#B8C0D6', fontSize: 15 }}>›</span>
                    </Row>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Русский эквивалент текущей настройки — как в исходном документе. */}
      {!finished && sc.ru && (
        <p style={{ margin: '14px 0 0', textAlign: 'center', fontSize: 12.5, color: '#6E7787' }}>
          {sc.target} — «{sc.ru}»
        </p>
      )}
    </div>
  );
}

function Row({ label, highlight, dim, onClick, children }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={highlight && onClick ? 'ms-sim-target' : undefined}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 15px', borderBottom: '1px solid #F0F2F8',
        fontSize: 13.5, fontWeight: highlight ? 700 : 600,
        color: dim ? '#9AA3BC' : highlight ? '#0F7FA8' : '#39415C',
        background: highlight ? 'rgba(28,171,226,.07)' : 'transparent',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, background: highlight ? 'linear-gradient(135deg,#1CABE2,#24A783)' : '#E8ECF7' }} />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {children}
    </div>
  );
}

function Switch({ on, onClick }) {
  return (
    <span
      onClick={onClick}
      role={onClick ? 'switch' : undefined}
      aria-checked={onClick ? on : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={onClick && !on ? 'ms-sim-switch' : undefined}
      style={{
        width: 42, height: 25, borderRadius: 100, flexShrink: 0, position: 'relative',
        background: on ? '#24A783' : '#D3D9E8',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background .3s cubic-bezier(.2,.85,.2,1)',
      }}
    >
      <span style={{ position: 'absolute', top: 3, left: 3, width: 19, height: 19, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.22)', transform: on ? 'translateX(17px)' : 'none', transition: 'transform .3s cubic-bezier(.2,.85,.2,1)' }} />
    </span>
  );
}
