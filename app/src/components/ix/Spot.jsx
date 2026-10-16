import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { EASE, Frame, plain, reducedMotion, useDone, useInView } from './shared';

/**
 * `spot` — «фонарик». Иллюстрация лежит в темноте; курсор или палец — луч,
 * видно только то, на что светишь. Места признаков слабо мерцают. Если
 * задержать на месте луч (или нажать на него), по кругу бежит шкала, и
 * признак найден: место остаётся освещённым, на нём номер, а карточка
 * признака вылетает оттуда в список под картинкой. Когда найдены все,
 * в комнате включается свет — темнота уходит целиком.
 *
 * Навык здесь — заметить скрытое; темнота и свет — та же мысль, что в
 * тексте: молчание и секретность против внимательного взрослого.
 *
 * Поля: `title`, `image` (импорт картинки), `ratio` — ширина/высота
 * картинки (1.5 по умолчанию), `items[]` из `{ x, y, text, say? }`:
 * x и y — место признака в процентах картинки, `say` — короткая реплика
 * в облачке над местом (дословно из текста признака).
 */
const HINT = 'Լույսով անցեք նկարի վրայով՝ նշանները գտնելու համար։';
// На телефоне главное действие — нажать на искру: вести луч пальцем можно,
// но вертикальный свайп листает страницу.
const HINT_TOUCH = 'Սեղմեք նկարի լուսավոր կետերի վրա՝ նշանները գտնելու համար։';
const coarse = () => typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;
const W = 1000;     // ширина холста маски; высота — по пропорции картинки
const DWELL = 480;  // сколько держать луч на месте, мс

export function Spot({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const n = items.length;
  const H = Math.round(W / (b.ratio || 1.5));
  const id = useId().replace(/:/g, '');
  const [found, setFound] = useState(() => (done ? items.map((_, i) => i) : []));
  const [hi, setHi] = useState(null);
  const [aim, setAim] = useState(null);
  const [awake, setAwake] = useState(!!done);
  const [rad, setRad] = useState(110); // радиус луча в единицах холста
  const stageRef = useRef(null);
  const lightRef = useRef(null);
  const ringRef = useRef(null);
  const listRef = useRef(null);
  const live = useRef({ x: W / 2, y: H * 0.45, aim: null, timer: null, found: new Set(found) });
  const inView = useInView(stageRef);
  const complete = n > 0 && found.length === n;
  useDone(complete, onDone);

  const px = (it) => ({ x: (it.x / 100) * W, y: (it.y / 100) * H });

  // Луч ~11% ширины, но не меньше 62px и не больше 112px на экране.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const fit = () => {
      const w = el.offsetWidth || 1;
      setRad((Math.max(62, Math.min(112, w * 0.11)) / w) * W);
    };
    fit();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const find = (i) => {
    const L = live.current;
    clearTimeout(L.timer);
    L.aim = null;
    setAim(null);
    if (L.found.has(i)) { setHi(i); return; }
    L.found.add(i);
    setFound((f) => [...f, i]);
    setHi(i);
  };

  // Луч двигается напрямую через атрибуты — без перерисовки на каждое движение.
  const put = (x, y, seek = true) => {
    const L = live.current;
    L.x = x; L.y = y;
    lightRef.current?.setAttribute('cx', x);
    lightRef.current?.setAttribute('cy', y);
    ringRef.current?.setAttribute('cx', x);
    ringRef.current?.setAttribute('cy', y);
    if (!seek) return;
    let best = null;
    let bestD = rad * 0.6;
    items.forEach((it, i) => {
      if (L.found.has(i)) return;
      const p = px(it);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) { best = i; bestD = d; }
    });
    if (best === L.aim) return;
    clearTimeout(L.timer);
    L.aim = best;
    setAim(best);
    if (best !== null) L.timer = setTimeout(() => find(best), DWELL);
  };

  const at = (e) => {
    const r = stageRef.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const down = (e) => {
    if (complete) return;
    setAwake(true);
    const p = at(e);
    put(p.x, p.y);
    // Попали в саму искру — её найдёт её же click. Иначе одно касание
    // засчитывало бы два места: искру и ближайшее к пальцу.
    if (e.target.closest?.('.ix-torch-spot')) return;
    // Нажатие рядом с местом — найдено сразу, держать не нужно. Берём
    // ближайшее: на телефоне места стоят в 25–30px друг от друга.
    let near = -1;
    let nearD = rad * 0.5;
    items.forEach((it, i) => {
      if (live.current.found.has(i)) return;
      const q = px(it);
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < nearD) { near = i; nearD = d; }
    });
    if (near >= 0) find(near);
  };
  const move = (e) => {
    if (complete) return;
    if (e.pointerType !== 'mouse' && !e.buttons) return;
    setAwake(true);
    const p = at(e);
    put(p.x, p.y);
  };
  const leave = () => {
    const L = live.current;
    clearTimeout(L.timer);
    L.aim = null;
    setAim(null);
  };
  useEffect(() => () => clearTimeout(live.current.timer), []);

  // Пока читатель не тронул картинку, луч сам бродит по комнате — видно,
  // что это фонарик. Находок при этом нет.
  useEffect(() => {
    if (!inView || awake || complete || reducedMotion()) return undefined;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t) => {
      const s = (t - t0) / 1000;
      put(W * (0.5 + 0.3 * Math.sin(s * 0.7)), H * (0.42 + 0.16 * Math.sin(s * 1.13)), false);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // put читает только refs и rad — перезапуск по ним не нужен
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, awake, complete]);

  // Карточка вылетает из места находки в список.
  const shown = useRef(found.length);
  useLayoutEffect(() => {
    const before = shown.current;
    shown.current = found.length;
    if (found.length <= before || reducedMotion()) return;
    const li = listRef.current?.querySelector(`[data-spot="${found[found.length - 1]}"]`);
    const st = stageRef.current;
    if (!li || !st) return;
    const it = items[found[found.length - 1]];
    const s = st.getBoundingClientRect();
    const r = li.getBoundingClientRect();
    const dx = s.left + (it.x / 100) * s.width - (r.left + r.width / 2);
    const dy = s.top + (it.y / 100) * s.height - (r.top + r.height / 2);
    li.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(.25)`, opacity: 0 },
        { transform: `translate(${dx * 0.15}px, ${dy * 0.15}px) scale(1.03)`, opacity: 1, offset: 0.7 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 700, easing: EASE },
    );
  }, [found.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const lit = complete;

  return (
    <Frame icon={<Icon name="eye" />} title={b.title} hint={complete ? null : coarse() ? HINT_TOUCH : HINT} progress={`${found.length} / ${n}`} done={complete}>
      <div
        ref={stageRef}
        className={`ix-torch${lit ? ' is-lit' : ''}${awake ? ' is-awake' : ''}`}
        style={{ aspectRatio: `${W} / ${H}` }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerLeave={leave}
        onPointerCancel={leave}
      >
        {b.image && <img className="ix-torch-img" src={b.image} alt="" draggable={false} />}

        <svg className="ix-torch-dark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden focusable="false">
          <defs>
            {/* Чёрное в маске прячет темноту. Край — прозрачный, а не белый:
                иначе ободок луча снова затемнял бы уже найденные места. */}
            <radialGradient id={`${id}g`}>
              <stop offset="0" stopColor="#000" stopOpacity="1" />
              <stop offset="0.5" stopColor="#000" stopOpacity="1" />
              <stop offset="1" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <mask id={`${id}m`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
              <rect width={W} height={H} fill="#fff" />
              {found.map((i) => {
                const p = px(items[i]);
                return <circle key={i} className="ix-torch-hole" cx={p.x} cy={p.y} r={rad * 0.85} fill={`url(#${id}g)`} />;
              })}
              <circle ref={lightRef} cx={live.current.x} cy={live.current.y} r={rad} fill={`url(#${id}g)`} />
            </mask>
          </defs>
          <rect className="ix-torch-shade" width={W} height={H} mask={`url(#${id}m)`} />
          <circle ref={ringRef} className="ix-torch-ring" cx={live.current.x} cy={live.current.y} r={rad * 0.62} />
        </svg>

        {items.map((it, i) => {
          const k = found.indexOf(i);
          return (
            <button
              key={i}
              type="button"
              className={`ix-torch-spot${k >= 0 ? ' is-found' : ''}${aim === i ? ' is-aim' : ''}${hi === i ? ' is-hi' : ''}`}
              style={{ left: `${it.x}%`, top: `${it.y}%`, '--i': i }}
              aria-label={plain(it.text)}
              aria-pressed={k >= 0}
              onFocus={() => { setAwake(true); const p = px(it); put(p.x, p.y, false); }}
              onClick={() => find(i)}
            >
              {k >= 0 ? k + 1 : (
                <svg className="ix-torch-dwell" viewBox="0 0 36 36" aria-hidden>
                  <circle cx="18" cy="18" r="16" pathLength="1" />
                </svg>
              )}
            </button>
          );
        })}

        {items.map((it, i) => (it.say && found.includes(i) ? (
          <span key={`say${i}`} className="ix-torch-say" style={{ left: `${it.x}%`, top: `${it.y}%` }} aria-hidden>
            {it.say}
          </span>
        ) : null))}
      </div>

      <ol className="ix-spot-list" ref={listRef} aria-live="polite">
        {found.map((i, k) => (
          <li
            key={i}
            data-spot={i}
            className={`ix-spot-item${hi === i ? ' is-hi' : ''}`}
            onMouseEnter={() => setHi(i)}
          >
            <span className="ix-spot-n" aria-hidden>{k + 1}</span>
            <span className="ix-spot-text">{R(items[i].text)}</span>
          </li>
        ))}
        {!complete && (
          <li className="ix-spot-item is-ghost" aria-hidden>
            <span className="ix-spot-n">?</span>
            <span className="ix-tl-ghost"><span /><span /></span>
          </li>
        )}
      </ol>
    </Frame>
  );
}
