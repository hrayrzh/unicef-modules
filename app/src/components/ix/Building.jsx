import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { EASE, Frame, leadOf, reducedMotion, useDone } from './shared';

/**
 * `floorplan` — план школы (файл «Նոր ինտերակտիվ տարբերակներ», модуль 2,
 * педагоги, «Կանխարգելիչ, գործնական աշխատանք դասարանում»): пункты — комнаты
 * вдоль коридора, в каждой значок и зачин пункта. Нажатие — учитель идёт по
 * коридору в эту комнату, в ней зажигается свет, под планом — пункт целиком.
 * На широком экране коридор горизонтальный (три комнаты сверху, три снизу), на
 * телефоне — вертикальный.
 *
 * Поля: `items[]` — пункты с `**зачином**`; `icons[]` — значки комнат.
 */
const PLAN_HINT = 'Սեղմեք դպրոցի սենյակներին՝ յուրաքանչյուր քայլը տեսնելու համար։';

export function FloorPlan({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const icons = b.icons || [];
  const half = Math.ceil(items.length / 2);
  const [seen, setSeen] = useState(() => items.map(() => !!done));
  const [cur, setCur] = useState(null);
  const planRef = useRef(null);
  const hallRef = useRef(null);
  const roomRefs = useRef([]);
  const meRef = useRef(null);
  const prev = useRef(null);
  const [pos, setPos] = useState(null);
  const n = seen.filter(Boolean).length;
  const complete = items.length > 0 && n === items.length;
  useDone(complete, onDone);

  // Учитель встаёт в верхний левый угол комнаты — посередине значок и подпись.
  const centerOf = (i) => {
    const r = roomRefs.current[i];
    return r ? { x: r.offsetLeft + 24, y: r.offsetTop + 24, cx: r.offsetLeft + r.offsetWidth / 2, cy: r.offsetTop + r.offsetHeight / 2 } : null;
  };

  const go = (i) => {
    setCur(i);
    setSeen((s) => (s[i] ? s : s.map((v, k) => v || k === i)));
  };

  // Учитель стоит в выбранной комнате; путь — через коридор: из своей двери в
  // коридор, по коридору, в новую дверь.
  useLayoutEffect(() => {
    if (cur == null) return;
    const to = centerOf(cur);
    setPos(to);
    const from = prev.current;
    prev.current = cur;
    const el = meRef.current;
    const hall = hallRef.current;
    if (!el || !to || reducedMotion()) return;
    const a = from == null ? null : centerOf(from);
    const wide = hall.offsetWidth > hall.offsetHeight;
    const line = wide ? hall.offsetTop + hall.offsetHeight / 2 : hall.offsetLeft + hall.offsetWidth / 2;
    const door = (p) => (wide ? { x: p.cx, y: line } : { x: line, y: p.cy });
    const pts = a ? [a, door(a), door(to), to] : [door(to), to];
    el.animate(
      pts.map((p) => ({ transform: `translate(${p.x - to.x}px, ${p.y - to.y}px)` })),
      { duration: a ? 900 : 450, easing: EASE },
    );
  }, [cur]); // eslint-disable-line react-hooks/exhaustive-deps

  // Перестроилась сетка (поворот телефона) — учитель остаётся в своей комнате.
  useEffect(() => {
    const on = () => { if (prev.current != null) setPos(centerOf(prev.current)); };
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  return (
    <Frame icon={<Icon name="plan" />} hint={PLAN_HINT} progress={`${n} / ${items.length}`} done={complete}>
      <div className="ix-plan" ref={planRef}>
        {items.map((t, i) => {
          const [lead] = leadOf(t);
          const top = i < half;
          return (
            <button
              key={i}
              ref={(el) => { roomRefs.current[i] = el; }}
              type="button"
              className={`ix-room${top ? ' is-top' : ' is-bottom'}${i === half - 1 || i === items.length - 1 ? ' is-end' : ''}${seen[i] ? ' is-seen' : ''}${cur === i ? ' is-cur' : ''}`}
              style={{ gridArea: `r${i}` }}
              aria-pressed={cur === i}
              onClick={() => go(i)}
            >
              <span className="ix-room-ico" aria-hidden><Icon name={icons[i] || 'school'} size={22} /></span>
              <span className="ix-room-name">{lead}</span>
              {seen[i] && <span className="ix-room-ok" aria-hidden><Icon name="check" size={11} strokeWidth={3.2} /></span>}
            </button>
          );
        })}
        <span className="ix-plan-hall" ref={hallRef} style={{ gridArea: 'hall' }} aria-hidden />
        {pos && (
          <span className="ix-plan-me" ref={meRef} style={{ left: pos.x, top: pos.y }} aria-hidden>
            <Icon name="teacher" size={16} />
          </span>
        )}
      </div>

      {cur != null ? (
        <div className="ix-plan-card" key={cur} aria-live="polite">
          <span className="ix-plan-card-ico" aria-hidden><Icon name={icons[cur] || 'school'} size={20} /></span>
          <p>{R(items[cur])}</p>
        </div>
      ) : (
        <div className="ix-plan-card is-ghost" aria-hidden><span className="ix-tl-ghost"><span /><span /></span></div>
      )}
    </Frame>
  );
}

/**
 * `elevator` — уровни работы (тот же файл, модуль 3, педагоги, «Երբ
 * աշակերտը հայտնում է…»): здание в разрезе, этаж — уровень (вверху школа,
 * ниже класс, внизу — ученик). Нажатие на этаж — кабина едет туда, двери
 * раскрываются, рядом — пункты этого уровня. Кабина стоит на нижнем этаже.
 *
 * Поля: `floors[]` из `{name, icon, items[]}` сверху вниз; `name` — заголовок
 * уровня из текста дословно.
 */
const LIFT_HINT = 'Ընտրեք հարկը՝ վերելակով այնտեղ հասնելու համար։';
const RIDE = 600; // мс на этаж

export function Elevator({ block: b, done, onDone, R }) {
  const floors = b.floors || [];
  const last = floors.length - 1;
  const [seen, setSeen] = useState(() => floors.map(() => !!done));
  const [car, setCar] = useState(last);
  const [cur, setCur] = useState(null);
  const [open, setOpen] = useState(false);
  const [dist, setDist] = useState(1);
  const timer = useRef(null);
  const n = seen.filter(Boolean).length;
  const complete = floors.length > 0 && n === floors.length;
  useDone(complete, onDone);
  useEffect(() => () => clearTimeout(timer.current), []);

  const call = (i) => {
    clearTimeout(timer.current);
    setCur(i);
    setSeen((s) => (s[i] ? s : s.map((v, k) => v || k === i)));
    if (i === car) { setOpen(true); return; }
    setOpen(false);
    setDist(Math.abs(i - car));
    setCar(i);
    // Двери раскрываются, когда кабина доехала: поездка — по 0,6 с на этаж.
    timer.current = setTimeout(() => setOpen(true), reducedMotion() ? 0 : RIDE * Math.abs(i - car) + 120);
  };

  const f = cur != null ? floors[cur] : null;
  return (
    <Frame icon={<Icon name="lift" />} hint={LIFT_HINT} progress={`${n} / ${floors.length}`} done={complete}>
      <div className="ix-lift" style={{ '--n': floors.length }}>
        <div className="ix-lift-house">
          <svg className="ix-lift-roof" viewBox="0 0 300 34" preserveAspectRatio="none" aria-hidden>
            <path d="M3 32L150 3l147 29z" />
          </svg>
          <div className="ix-lift-body">
            <div className="ix-lift-shaft" aria-hidden>
              <span className="ix-lift-cable" style={{ '--at': car, '--ride': `${RIDE * dist}ms` }} />
              <span
                className={`ix-lift-car${open ? ' is-open' : ''}`}
                style={{ '--at': car, '--ride': `${RIDE * dist}ms` }}
              >
                <span className="ix-lift-in"><Icon name="teacher" size={18} /></span>
                <i className="is-l" />
                <i className="is-r" />
              </span>
            </div>
            <div className="ix-lift-floors">
              {floors.map((fl, i) => (
                <button
                  key={i}
                  type="button"
                  className={`ix-lift-floor${cur === i ? ' is-cur' : ''}${seen[i] ? ' is-seen' : ''}`}
                  aria-pressed={cur === i}
                  onClick={() => call(i)}
                >
                  <span className="ix-lift-num" aria-hidden>{floors.length - i}</span>
                  <span className="ix-lift-ico" aria-hidden><Icon name={fl.icon || 'school'} size={20} /></span>
                  <span className="ix-lift-name">{fl.name}</span>
                  {seen[i] && <span className="ix-lift-ok" aria-hidden><Icon name="check" size={11} strokeWidth={3.2} /></span>}
                </button>
              ))}
            </div>
          </div>
          <span className="ix-lift-ground" aria-hidden />
        </div>

        <div className={`ix-lift-panel${f && open ? ' is-on' : ''}`} aria-live="polite">
          {f && open ? (
            <div key={cur} className="ix-lift-panel-in">
              <span className="ix-lift-h">{f.name}</span>
              <ul>
                {(f.items || []).map((t, k) => <li key={k} style={{ '--k': k }}>{R(t)}</li>)}
              </ul>
            </div>
          ) : (
            <span className="ix-tl-ghost" aria-hidden><span /><span /></span>
          )}
        </div>
      </div>
    </Frame>
  );
}
