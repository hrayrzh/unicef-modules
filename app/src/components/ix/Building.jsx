import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { Frame, leadOf, reducedMotion, useDone } from './shared';

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
  const hallRef = useRef(null);
  const roomRefs = useRef([]);
  const meRef = useRef(null);
  const prev = useRef(null);
  const n = seen.filter(Boolean).length;
  const complete = items.length > 0 && n === items.length;
  useDone(complete, onDone);

  // Точки маршрута для комнаты: где учитель стоит (левый верхний угол —
  // посередине значок и подпись), проём двери изнутри и точка в коридоре
  // напротив двери. Коридор горизонтальный на широком экране, вертикальный
  // на телефоне — сторона двери берётся из того, где комната относительно него.
  const geo = (i) => {
    const r = roomRefs.current[i];
    const h = hallRef.current;
    if (!r || !h) return null;
    const L = r.offsetLeft;
    const T = r.offsetTop;
    const W = r.offsetWidth;
    const H = r.offsetHeight;
    const rest = { x: L + 24, y: T + 24 };
    if (h.offsetWidth > h.offsetHeight) {
      const above = T + H / 2 < h.offsetTop;
      return { rest, inside: { x: L + W / 2, y: above ? T + H - 18 : T + 18 }, hall: { x: L + W / 2, y: h.offsetTop + h.offsetHeight / 2 } };
    }
    const left = L + W / 2 < h.offsetLeft;
    return { rest, inside: { x: left ? L + W - 18 : L + 18, y: T + H / 2 }, hall: { x: h.offsetLeft + h.offsetWidth / 2, y: T + H / 2 } };
  };

  const place = (el, p) => {
    el.style.left = `${p.x}px`;
    el.style.top = `${p.y}px`;
  };

  const go = (i) => {
    setCur(i);
    setSeen((s) => (s[i] ? s : s.map((v, k) => v || k === i)));
  };

  // Учитель ходит только через двери и коридор: из угла своей комнаты к
  // проёму, в коридор, по коридору к другой двери, в проём, в угол. Место
  // ставится сразу (до анимации), анимация ведёт к нему от старого места —
  // поэтому ничего не прыгает. Скорость одна на всех отрезках.
  useLayoutEffect(() => {
    if (cur == null) return;
    const el = meRef.current;
    const b = geo(cur);
    const from = prev.current;
    prev.current = cur;
    if (!el || !b || from === cur) return;
    place(el, b.rest);
    el.style.visibility = 'visible';
    if (reducedMotion()) return;
    const a = from == null ? null : geo(from);
    const pts = a ? [a.rest, a.inside, a.hall, b.hall, b.inside, b.rest] : [b.hall, b.inside, b.rest];
    const lens = pts.slice(1).map((p, k) => Math.hypot(p.x - pts[k].x, p.y - pts[k].y));
    const total = lens.reduce((x, y) => x + y, 0) || 1;
    let run = 0;
    const frames = pts.map((p, k) => {
      if (k > 0) run += lens[k - 1];
      return { transform: `translate(${p.x - b.rest.x}px, ${p.y - b.rest.y}px)`, offset: run / total };
    });
    el.getAnimations().forEach((x) => x.cancel());
    el.animate(frames, { duration: Math.min(1700, Math.max(420, total / 0.42)), easing: 'cubic-bezier(.45,.05,.55,.95)' });
  }, [cur]); // eslint-disable-line react-hooks/exhaustive-deps

  // Перестроилась сетка (поворот телефона) — учитель остаётся в своей комнате.
  useEffect(() => {
    const on = () => {
      const el = meRef.current;
      const b = prev.current == null ? null : geo(prev.current);
      if (el && b) place(el, b.rest);
    };
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Frame icon={<Icon name="plan" />} hint={PLAN_HINT} progress={`${n} / ${items.length}`} done={complete}>
      <div className="ix-plan">
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
        <span className="ix-plan-me" ref={meRef} aria-hidden>
          <Icon name="teacher" size={16} />
        </span>
      </div>

      {/* Карточка одна и та же — меняется только содержимое, мягко. */}
      <div className={`ix-plan-card${cur == null ? ' is-ghost' : ''}`} aria-live="polite">
        {cur != null ? (
          <>
            <span className="ix-plan-card-ico" key={`i${cur}`} aria-hidden><Icon name={icons[cur] || 'school'} size={20} /></span>
            <p key={`t${cur}`}>{R(items[cur])}</p>
          </>
        ) : (
          <span className="ix-tl-ghost" aria-hidden><span /><span /></span>
        )}
      </div>
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
