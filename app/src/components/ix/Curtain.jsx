import { useRef, useState } from 'react';
import { Icon } from './icons';
import { Frame, useDone } from './shared';

/**
 * `curtain` — «шторка» из файла предложений к модулю 4 (4.html, «curtain»):
 * у одного признака две стороны. Вкладки — признаки (первая колонка
 * таблицы); на сцене слева «Առողջ հարաբերություն», справа «Զգուշացնող
 * նշան», граница между ними двигается пальцем, мышью или стрелками. Когда
 * граница побывала у обоих краёв — обе стороны прочитаны целиком, —
 * под сценой открывается «Ինչ անել». Блок пройден, когда так открыты все
 * признаки.
 *
 * Поля — как у таблицы: `title`, `head[4]` = [признак, левая сторона,
 * правая сторона, что делать], `rows[]` в том же порядке.
 */
const HINT = 'Քաշեք բաժանարարը աջ ու ձախ՝ երկու կողմն էլ տեսնելու համար։';
const EDGE = 8; // насколько близко к краю — «сторона видна целиком», %
const clamp = (v) => Math.max(0, Math.min(100, v));

export function Curtain({ block: b, done, onDone, R }) {
  const head = b.head || [];
  const rows = b.rows || [];
  const n = rows.length;
  const [tab, setTab] = useState(0);
  // Бит 1 — левая сторона открыта целиком, бит 2 — правая.
  const [seen, setSeen] = useState(() => rows.map(() => (done ? 3 : 0)));
  const [x, setX] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(!!done);
  const stageRef = useRef(null);
  const drag = useRef(null);
  const count = seen.filter((s) => s === 3).length;
  const complete = n > 0 && count === n;
  useDone(complete, onDone);

  const place = (v) => {
    const c = clamp(v);
    setX(c);
    setTouched(true);
    const bit = c >= 100 - EDGE ? 1 : c <= EDGE ? 2 : 0;
    if (bit) setSeen((s) => (s[tab] & bit ? s : s.map((m, i) => (i === tab ? m | bit : m))));
  };
  const at = (e) => {
    const r = stageRef.current.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * 100;
  };
  // Нажатие переносит границу плавно; движение пальцем — без задержки.
  const down = (e) => {
    if (e.button > 0) return;
    drag.current = { x0: e.clientX, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    place(at(e));
  };
  const move = (e) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.abs(e.clientX - d.x0) > 3) { d.moved = true; setDragging(true); }
    if (d.moved) place(at(e));
  };
  const up = () => { drag.current = null; setDragging(false); };
  const keys = (e) => {
    const step = { ArrowLeft: -10, ArrowDown: -10, ArrowRight: 10, ArrowUp: 10, Home: -100, End: 100 }[e.key];
    if (step == null) return;
    e.preventDefault();
    place(x + step);
  };
  const pick = (i) => { setTab(i); setX(50); };

  const row = rows[tab] || [];
  const ready = seen[tab] === 3;

  return (
    <Frame icon={<Icon name="curtain" />} title={b.title} hint={complete ? null : HINT} progress={`${count} / ${n}`} done={complete}>
      <div className="ix-tabs" role="tablist">
        {rows.map((r, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === tab}
            className={`ix-tab${i === tab ? ' is-on' : ''}`}
            onClick={() => pick(i)}
          >
            {seen[i] === 3 && <Icon name="check" size={13} strokeWidth={3} />}
            {r[0]}
          </button>
        ))}
      </div>

      <div
        key={tab}
        ref={stageRef}
        className={`ix-cur${dragging ? ' is-drag' : ''}${touched ? '' : ' is-idle'}`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <div className="ix-cur-side is-warn">
          <span className="ix-cur-tag">
            <Icon name={seen[tab] & 2 ? 'check' : 'warn'} size={13} strokeWidth={2.4} />
            {head[2]}
          </span>
          <p className="ix-cur-text">{R(row[2])}</p>
          <span className="ix-cur-mark" aria-hidden><Icon name="warn" size={96} strokeWidth={1.2} /></span>
        </div>
        <div className="ix-cur-side is-ok" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>
          <span className="ix-cur-tag">
            <Icon name="check" size={13} strokeWidth={2.6} />
            {head[1]}
          </span>
          <p className="ix-cur-text">{R(row[1])}</p>
          <span className="ix-cur-mark" aria-hidden><Icon name="heart" size={96} strokeWidth={1.2} /></span>
        </div>
        {/* Линия стоит точно по границе, а кружок у краёв не уходит за
            сцену наполовину — поэтому это два элемента. */}
        <span className="ix-cur-line" style={{ left: `${x}%` }} aria-hidden />
        <span
          className="ix-cur-knob"
          style={{ left: `clamp(25px, ${x}%, calc(100% - 25px))` }}
          role="slider"
          tabIndex={0}
          aria-label={`${head[1]} / ${head[2]}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(x)}
          aria-valuetext={x >= 50 ? head[1] : head[2]}
          onKeyDown={keys}
        >
          <Icon name="prev" size={15} strokeWidth={2.4} />
          <Icon name="next" size={15} strokeWidth={2.4} />
        </span>
      </div>

      {ready ? (
        <div className="ix-cur-todo" key={`todo${tab}`}>
          <span className="ix-cur-todo-ico" aria-hidden><Icon name="key" size={16} /></span>
          <div className="ix-cur-todo-body">
            <span className="ix-cur-todo-h">{head[3]}</span>
            <p>{R(row[3])}</p>
          </div>
        </div>
      ) : (
        <div className="ix-cur-todo is-locked" aria-hidden>
          <span className="ix-cur-todo-ico"><Icon name="lock" size={16} /></span>
          <div className="ix-cur-todo-body">
            <span className="ix-cur-todo-h">{head[3]}</span>
            <span className="ix-tl-ghost"><span /><span /></span>
          </div>
        </div>
      )}
    </Frame>
  );
}
