import { useRef, useState } from 'react';
import { Icon } from './icons';
import { Frame, plain, useDone, useInView } from './shared';
import { STEP_ART } from './art';

/**
 * `scene` — пошаговая инструкция с иллюстрацией к каждому шагу.
 * Слева — короткие названия шагов (начало фразы из текста), справа —
 * рисунок выбранного шага, который рисуется линией, и полный текст шага
 * под ним. На телефоне вместо списка — ряд номеров над рисунком.
 *
 * Первая версия была одной «сценой в коридоре», которая липла к верху
 * экрана и наезжала на текст шагов, а фигуры-пилюли мало что объясняли
 * (Арман, 2026-10-13: «very bad made»). Теперь у каждого шага свой рисунок
 * про смысл именно этого шага.
 *
 * Поля пункта: `label` — короткое название (дословное начало текста),
 * `text` — полный текст, `art` — ключ рисунка в STEP_ART (art.jsx).
 */
export function Scene({ block: b, done, onDone, R }) {
  const items = (b.items || []).map((it) => (typeof it === 'string' ? { text: it } : it));
  const n = items.length;
  const [at, setAt] = useState(0);
  const [seen, setSeen] = useState(() => new Set(done ? items.map((_, i) => i) : [0]));
  const artRef = useRef(null);
  const inView = useInView(artRef);
  const complete = seen.size === n;
  useDone(complete, onDone);

  const go = (i) => {
    const k = Math.max(0, Math.min(n - 1, i));
    setAt(k);
    setSeen((s) => (s.has(k) ? s : new Set(s).add(k)));
  };
  const it = items[at];
  const label = (x) => x.label || plain(x.text).split(/[.:։]/)[0];

  return (
    <Frame icon={<Icon name="scene" />} title={b.title} progress={`${seen.size} / ${n}`} done={complete}>
      <div className="ix-st">
        <ol className="ix-st-list">
          {items.map((x, i) => (
            <li key={i}>
              <button
                type="button"
                className={`ix-st-item${seen.has(i) ? ' is-seen' : ''}`}
                aria-current={i === at ? 'step' : undefined}
                aria-label={label(x)}
                onClick={() => go(i)}
              >
                <span className="ix-st-n">
                  {seen.has(i) && i !== at ? <Icon name="check" size={12} strokeWidth={3} /> : i + 1}
                </span>
                <span className="ix-st-label">{label(x)}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="ix-st-main">
          <div className="ix-st-art" ref={artRef}>
            {inView && (
              <svg key={at} viewBox="0 0 600 300" className="ix-wb" role="img" aria-label={label(it)}>
                {STEP_ART[it.art] || null}
              </svg>
            )}
          </div>
          <div className="ix-st-cap" key={at}>
            <span className="ix-st-kicker">Քայլ {at + 1} / {n}</span>
            <p>{R(it.text)}</p>
          </div>
          <div className="ix-st-ctrl">
            <button type="button" className="ix-round" onClick={() => go(at - 1)} disabled={at === 0} aria-label="Նախորդ">
              <Icon name="prev" size={16} />
            </button>
            <button type="button" className="ix-round is-primary" onClick={() => go(at + 1)} disabled={at === n - 1} aria-label="Հաջորդ">
              <Icon name="next" size={16} />
            </button>
          </div>
        </div>
      </div>
    </Frame>
  );
}
