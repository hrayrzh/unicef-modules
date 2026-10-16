import { useRef, useState } from 'react';
import { Icon } from './icons';
import { Frame, plain, useDone, useInView } from './shared';
import { SPOT_SCENES } from './art';

/**
 * `spot` — «заметьте признаки на рисунке». Сцена из `SPOT_SCENES` рисуется
 * бледно, на ней мерцают точки. Нажатая точка становится номером, её деталь
 * проявляется янтарной линией (телефон прячут, подарок, дверь закрывается…),
 * а сам признак дословно встаёт в список под рисунком — в том порядке, в
 * каком их заметили. Навык здесь — именно заметить, отсюда и подача.
 *
 * Поля: `title`, `scene` — ключ в `SPOT_SCENES` (art.jsx), `items[]` из
 * `{ at, text }`, где `at` — деталь сцены (её точка и рисунок).
 */
const HINT = 'Սեղմեք նկարի լուսավոր կետերին՝ նշանները գտնելու համար։';

export function Spot({ block: b, done, onDone, R }) {
  const scene = SPOT_SCENES[b.scene];
  const items = (b.items || []).filter((it) => scene?.spots[it.at]);
  const n = items.length;
  const [found, setFound] = useState(() => (done ? items.map((_, i) => i) : []));
  const [hi, setHi] = useState(null);
  const stageRef = useRef(null);
  const inView = useInView(stageRef);
  const complete = n > 0 && found.length === n;
  useDone(complete, onDone);

  const hit = (i) => {
    setHi(i);
    setFound((f) => (f.includes(i) ? f : [...f, i]));
  };

  return (
    <Frame icon={<Icon name="eye" />} title={b.title} hint={complete ? null : HINT} progress={`${found.length} / ${n}`} done={complete}>
      <div ref={stageRef} className="ix-spot">
        {inView && scene && (
          <>
            <svg className="ix-wb" viewBox="0 0 600 300" aria-hidden focusable="false">
              {scene.base}
              {found.map((i) => <g key={items[i].at}>{scene.parts[items[i].at]}</g>)}
            </svg>
            {items.map((it, i) => {
              const [x, y] = scene.spots[it.at];
              const k = found.indexOf(i);
              return (
                <button
                  key={it.at}
                  type="button"
                  className={`ix-spot-dot${k >= 0 ? ' is-found' : ''}${hi === i ? ' is-hi' : ''}`}
                  style={{ left: `${x / 6}%`, top: `${y / 3}%`, '--i': i }}
                  aria-label={plain(it.text)}
                  aria-pressed={k >= 0}
                  onClick={() => hit(i)}
                >
                  {k >= 0 ? k + 1 : <span className="ix-spot-core" />}
                </button>
              );
            })}
          </>
        )}
      </div>

      <ol className="ix-spot-list" aria-live="polite">
        {found.map((i, k) => (
          <li
            key={items[i].at}
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
