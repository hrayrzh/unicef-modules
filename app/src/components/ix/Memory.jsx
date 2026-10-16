import { useEffect, useRef, useState } from 'react';
import { logoFor } from '../PlatformLogo';
import { Icon } from './icons';
import { AppTile } from './Platforms';
import { Frame, Restart, shuffled, useDone, useFlip } from './shared';

/**
 * `memory` — «Հիշողության խաղ. գտեք զույգերը» (Module_3.html): карточки
 * рубашкой вверх, открывают по две. Пара остаётся открытой и получает номер,
 * не пара через секунду закрывается. Без счёта ходов и времени. Когда
 * найдены все, карточки съезжаются парами: слева — первая, справа — её пара.
 *
 * Поля: `title`, `pairs[]` из `[a, b]` — дословные куски текста; если для
 * `a` есть логотип (`logoFor`: Google, Apple, Microsoft, Instagram…), он
 * стоит на карточке.
 */
export function Memory({ block: b, done, onDone }) {
  const pairs = b.pairs || [];
  const cards = pairs.flatMap((p, i) => [{ i, side: 0, text: p[0] }, { i, side: 1, text: p[1] }]);
  const fresh = () => shuffled(cards.map((_, k) => k));
  const [order, setOrder] = useState(fresh);
  const [open, setOpen] = useState([]);
  const [found, setFound] = useState(() => (done ? pairs.map((_, i) => i) : []));
  const [miss, setMiss] = useState(false);
  const timer = useRef(null);
  const rootRef = useRef(null);
  useFlip(rootRef);
  const complete = pairs.length > 0 && found.length === pairs.length;
  useDone(complete, onDone);
  useEffect(() => () => clearTimeout(timer.current), []);

  const tap = (k) => {
    if (complete || miss || open.includes(k) || found.includes(cards[k].i)) return;
    const next = [...open, k];
    if (next.length < 2) { setOpen(next); return; }
    const [x, y] = next.map((j) => cards[j]);
    if (x.i === y.i) {
      setFound((f) => [...f, x.i]);
      setOpen([]);
      return;
    }
    setOpen(next);
    setMiss(true);
    timer.current = setTimeout(() => { setOpen([]); setMiss(false); }, 1000);
  };

  // В конце — парами по порядку данных.
  const shown = complete
    ? cards.map((_, k) => k).sort((p, q) => cards[p].i - cards[q].i || cards[p].side - cards[q].side)
    : order;

  return (
    <Frame
      icon={<Icon name="memory" />}
      title={b.title}
      progress={`${found.length} / ${pairs.length}`}
      done={complete}
      tools={complete ? <Restart onClick={() => { setOrder(fresh()); setFound([]); setOpen([]); }} /> : null}
    >
      <div className={`ix-mem${complete ? ' is-done' : ''}`} ref={rootRef}>
        {shown.map((k) => {
          const c = cards[k];
          const got = found.includes(c.i);
          const up = got || open.includes(k);
          return (
            <button
              key={k}
              data-flip={`c${k}`}
              type="button"
              className={`ix-mem-card${up ? ' is-up' : ''}${got ? ' is-found' : ''}${miss && open.includes(k) ? ' is-miss' : ''}`}
              aria-pressed={up}
              aria-label={up ? c.text : '?'}
              onClick={() => tap(k)}
            >
              <span className="ix-mem-inner">
                <span className="ix-mem-back" aria-hidden><Icon name="memory" size={22} /></span>
                <span className="ix-mem-face" aria-hidden>
                  {got && <span className="ix-mem-n">{c.i + 1}</span>}
                  {c.side === 0 && logoFor(c.text) && <AppTile name={c.text} />}
                  <span className="ix-mem-text">{c.text}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Frame>
  );
}
