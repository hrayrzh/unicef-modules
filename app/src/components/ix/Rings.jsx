import { useId, useState } from 'react';
import { Icon } from './icons';
import { Frame, useDone } from './shared';

/**
 * `rings` — «защитные кольца» из 5_2.html для таблицы «Ի՞նչ է փոխում
 * տարիքային շեմը»: в центре ребёнок, вокруг — по кольцу на риск, название
 * риска написано по дуге. Нажатие на кольцо (или на название под ним)
 * обводит кольцо цветом и открывает вторую колонку таблицы. Блок пройден,
 * когда обведены все кольца.
 *
 * Поля — как у таблицы: `title`, `head[2]`, `rows[]`.
 */
const HINT = 'Սեղմեք օղակներին կամ ռիսկերի անուններին։';
const C = 160; // центр холста 320×320
const OUTER = 148;
const STEP = 24;
const ring = (r) => `M${C} ${C - r}a${r} ${r} 0 1 1 0 ${2 * r}a${r} ${r} 0 1 1 0 ${-2 * r}`;
// Дуга под надпись — верхняя половина слева направо, чуть внутрь от
// середины полосы: буквы стоят на базовой линии и растут наружу.
const arc = (r) => `M${C - r} ${C}A${r} ${r} 0 0 1 ${C + r} ${C}`;

export function Rings({ block: b, done, onDone, R }) {
  const head = b.head || [];
  const rows = b.rows || [];
  const uid = useId().replace(/:/g, '');
  const [lit, setLit] = useState(() => rows.map(() => !!done));
  const [cur, setCur] = useState(done ? 0 : null);
  const count = lit.filter(Boolean).length;
  const complete = rows.length > 0 && count === rows.length;
  useDone(complete, onDone);

  const light = (i) => {
    setCur(i);
    setLit((l) => (l[i] ? l : l.map((v, k) => v || k === i)));
  };
  const radius = (i) => OUTER - i * STEP;

  return (
    <Frame icon={<Icon name="rings" />} title={b.title} hint={complete ? null : HINT} progress={`${count} / ${rows.length}`} done={complete}>
      <div className="ix-rg">
        <div className="ix-rg-stage">
          <svg viewBox="0 0 320 320" className="ix-rg-svg" aria-hidden>
            <defs>
              {rows.map((_, i) => <path key={i} id={`${uid}a${i}`} d={arc(radius(i) - 3.6)} />)}
            </defs>
            {rows.map((r, i) => (
              <g
                key={i}
                className={`ix-ring${lit[i] ? ' is-lit' : ''}${cur === i ? ' is-cur' : ''}`}
                style={{ '--i': i }}
                onClick={() => light(i)}
              >
                <path className="ix-ring-base" d={ring(radius(i))} />
                <path className="ix-ring-fill" d={ring(radius(i))} pathLength="1" />
                <text className="ix-ring-label" textAnchor="middle">
                  <textPath href={`#${uid}a${i}`} startOffset="50%">{r[0]}</textPath>
                </text>
                <path className="ix-ring-hit" d={ring(radius(i))} />
              </g>
            ))}
            <g className={`ix-rg-child${complete ? ' is-safe' : ''}`}>
              <circle cx={C} cy={C - 16} r="10" />
              <path d={`M${C - 17} ${C + 22}v-8a17 17 0 0134 0v8z`} />
            </g>
          </svg>
        </div>

        <div className="ix-rg-side">
          <div className="ix-rg-chips">
            {rows.map((r, i) => (
              <button
                key={i}
                type="button"
                className={`ix-rg-chip${lit[i] ? ' is-lit' : ''}${cur === i ? ' is-cur' : ''}`}
                aria-pressed={cur === i}
                onClick={() => light(i)}
              >
                <span className="ix-rg-dot" aria-hidden>{lit[i] && <Icon name="check" size={10} strokeWidth={3.4} />}</span>
                {r[0]}
              </button>
            ))}
          </div>
          {cur != null ? (
            <div className="ix-rg-card" key={cur} aria-live="polite">
              <span className="ix-kicker">{head[1]}</span>
              <span className="ix-rg-card-h">{rows[cur][0]}</span>
              <p>{R(rows[cur][1])}</p>
            </div>
          ) : (
            <div className="ix-rg-card is-ghost" aria-hidden>
              <span className="ix-kicker">{head[1]}</span>
              <span className="ix-tl-ghost"><span /><span /></span>
            </div>
          )}
        </div>
      </div>
    </Frame>
  );
}
