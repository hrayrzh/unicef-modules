import { useRef, useState } from 'react';
import { Icon } from './icons';
import { Frame, reducedMotion, useDone } from './shared';
import { Bubble, Person, S } from './art';

/**
 * `wall` — «Հոգեբանական պատնեշներ» (4.html, «wall»): причины, по которым
 * ребёнок молчит, — кирпичи стены между ним и взрослым. Нажатый кирпич
 * падает, сквозь дыру проступает сцена за стеной. Когда упал последний,
 * рушатся и пустые кирпичи-заполнители, ребёнок говорит, взрослый слушает,
 * и под сценой появляется остальной текст. Упавшие причины не исчезают —
 * они лежат под стеной строкой, чтобы их можно было перечитать.
 *
 * Поля: `title`, `lead` — фраза перед перечнем, `items[]` — причины
 * (кирпичи), `after[]` — абзацы, которые открываются, когда стена упала.
 */
const HINT = 'Սեղմեք աղյուսներին՝ պատը քանդելու համար։';
const FLOOR = 238;

// Пустые кирпичи между подписанными: без них ряды из одного длинного
// кирпича не похожи на кладку. Шаг — после каждого второго.
const layout = (n) => {
  const out = [{ f: 0 }];
  for (let i = 0; i < n; i += 1) {
    out.push({ i });
    if (i % 2 === 1) out.push({ f: out.length });
  }
  out.push({ f: out.length });
  return out;
};

export function Wall({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const n = items.length;
  const [down, setDown] = useState(() => items.map(() => !!done));
  const [pile, setPile] = useState(() => (done ? items.map((_, i) => i) : []));
  // Стена, которая уже лежала при открытии, не рушится заново.
  const [settled] = useState(!!done);
  const falling = useRef(new Set());
  const stageRef = useRef(null);
  const brickRefs = useRef([]);
  const count = down.filter(Boolean).length;
  const complete = n > 0 && count === n;
  useDone(complete, onDone);

  const knock = async (i) => {
    if (down[i] || falling.current.has(i)) return;
    falling.current.add(i);
    const el = brickRefs.current[i];
    if (el && !reducedMotion()) {
      const fall = (stageRef.current?.offsetHeight || 260) - el.offsetTop + 30;
      const dir = i % 2 ? 1 : -1;
      await el.animate(
        [
          { transform: 'none' },
          { transform: `translateY(-5px) rotate(${-dir * 2}deg)`, offset: 0.14 },
          { transform: `translate(${dir * 24}px, ${fall}px) rotate(${dir * 30}deg)` },
        ],
        { duration: 760, easing: 'cubic-bezier(.5,0,.9,.45)', fill: 'forwards' },
      ).finished.catch(() => {});
    }
    setDown((d) => d.map((v, j) => v || j === i));
    setPile((p) => [...p, i]);
  };

  return (
    <Frame icon={<Icon name="wall" />} title={b.title} hint={complete ? null : HINT} progress={`${count} / ${n}`} done={complete}>
      {b.lead && <p className="ix-text">{R(b.lead)}</p>}
      <div ref={stageRef} className={`ix-wall${complete ? ' is-open' : ''}`} style={{ '--p': n ? count / n : 1 }}>
        {/* Холст обрезан по рисунку (фигуры, облачко, пол): на телефоне
            сцена была мелкой полосой внизу высокой стены. */}
        <svg className="ix-wall-scene" viewBox="110 24 390 222" preserveAspectRatio="xMidYMax meet" aria-hidden focusable="false">
          <S d={`M40 ${FLOOR}h520`} className="is-soft" />
          <Person x={150} y={FLOOR} s={0.8} tone="amber" />
          <Person x={452} y={FLOOR} tone="cyan" />
          {/* Стены нет: ребёнок говорит, взрослый слушает. */}
          {complete && (
            <g key="open">
              <Bubble x={196} y={34} w={196} h={80} at={0.4} tail="left" tone="amber-soft" />
              <S d="M222 64h134" at={1} />
              <S d="M222 88h96" at={1.2} />
              <S d="M416 106a12 12 0 000 18M406 98a22 22 0 000 34" at={1.4} className="is-accent" />
            </g>
          )}
        </svg>
        <div className="ix-wall-bricks">
          {layout(n).map((x, k) => (x.i === undefined ? (
            <span
              key={`f${x.f}`}
              className={`ix-brick is-filler${settled ? ' is-gone' : ''}`}
              style={{ '--i': k, '--j': x.f }}
              aria-hidden
            />
          ) : (
            <button
              key={x.i}
              type="button"
              ref={(el) => { brickRefs.current[x.i] = el; }}
              className={`ix-brick${down[x.i] ? ' is-down' : ''}`}
              style={{ '--i': k }}
              tabIndex={down[x.i] ? -1 : 0}
              aria-hidden={down[x.i] || undefined}
              onClick={() => knock(x.i)}
            >
              {R(items[x.i])}
            </button>
          )))}
        </div>
      </div>

      {pile.length > 0 && (
        <div className="ix-wall-pile">
          {pile.map((i) => <span key={i} className="ix-wall-chip">{R(items[i])}</span>)}
        </div>
      )}
      {complete && (b.after || []).map((t, i) => (
        <p key={i} className="ix-tail ix-wall-after" style={{ '--i': i }}>{R(t)}</p>
      ))}
    </Frame>
  );
}
