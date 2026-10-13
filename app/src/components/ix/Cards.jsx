import { useRef, useState } from 'react';
import { Icon } from './icons';
import { Frame, onKey, plain, useDone } from './shared';

/**
 * `reveal` — пункты закрыты, тап открывает. Текст под размытием, а не
 * спрятан: видно, сколько его и где он, но прочитать можно, только открыв.
 * `grid` — плитки вместо строк (причины травли), `lead`/`tail` — абзац,
 * из которого пункты вынуты, остаётся вокруг них.
 */
export function Reveal({ block: b, done, onDone, R }) {
  const items = (b.items || []).map((it) => (typeof it === 'string' ? { text: it } : it));
  const n = items.length;
  const [open, setOpen] = useState(() => items.map(() => !!done));
  const count = open.filter(Boolean).length;
  const complete = count === n;
  useDone(complete, onDone);
  const reveal = (i) => setOpen((o) => (o[i] ? o : o.map((v, j) => v || j === i)));

  return (
    <Frame
      icon={<Icon name={b.icon || 'eye'} />}
      title={b.title}
      hint={complete ? null : 'Հպեք՝ բացելու համար'}
      progress={`${count} / ${n}`}
      done={complete}
    >
      {b.lead && <p className="ix-lead">{R(b.lead)}</p>}
      <div className={b.grid ? 'ix-reveal is-grid' : 'ix-reveal'}>
        {items.map((it, i) => {
          const on = open[i];
          return (
            <div
              key={i}
              className={on ? 'ix-reveal-card is-open' : 'ix-reveal-card'}
              style={{ '--i': i }}
              role={on ? undefined : 'button'}
              tabIndex={on ? undefined : 0}
              aria-expanded={on ? undefined : false}
              onClick={() => reveal(i)}
              onKeyDown={on ? undefined : onKey(() => reveal(i))}
            >
              <span className="ix-reveal-badge" aria-hidden>
                {it.icon ? <Icon name={it.icon} size={20} /> : i + 1}
              </span>
              <span className="ix-reveal-text">{R(it.text)}</span>
              <span className="ix-reveal-state" aria-hidden>
                <Icon name={on ? 'check' : 'plus'} size={12} strokeWidth={on ? 3 : 2.4} />
              </span>
            </div>
          );
        })}
      </div>
      {b.tail && <p className="ix-tail">{R(b.tail)}</p>}
    </Frame>
  );
}

/**
 * `flips` — карточки с двумя сторонами: на лице зачин пункта (то, что в
 * документе стоит жирным до точки), на обороте — остальной текст. Так
 * читатель сначала видит, о чём пункт, и сам решает его открыть.
 */
export function Flips({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const n = items.length;
  const [flipped, setFlipped] = useState(() => items.map(() => false));
  const [seen, setSeen] = useState(() => items.map(() => !!done));
  const count = seen.filter(Boolean).length;
  const complete = count === n;
  useDone(complete, onDone);

  const flip = (i) => {
    setFlipped((f) => f.map((v, j) => (j === i ? !v : v)));
    setSeen((s) => s.map((v, j) => v || j === i));
  };

  return (
    <Frame icon={<Icon name={b.icon || 'cards'} />} title={b.title} progress={`${count} / ${n}`} done={complete}>
      <div className="ix-flips">
        {items.map((it, i) => (
          <div
            key={i}
            className={`ix-flip${flipped[i] ? ' is-flipped' : ''}${seen[i] ? ' is-seen' : ''}`}
            style={{ '--i': i }}
            role="button"
            tabIndex={0}
            aria-pressed={flipped[i]}
            aria-label={plain(it.front)}
            onClick={() => flip(i)}
            onKeyDown={onKey(() => flip(i))}
          >
            <div className="ix-flip-inner">
              <div className="ix-flip-face ix-flip-front" aria-hidden={flipped[i]}>
                <span className="ix-flip-mark">
                  {it.badge
                    ? <span className="ix-flip-letter">{it.badge}</span>
                    : it.icon ? <Icon name={it.icon} size={24} /> : <span className="ix-flip-num">{i + 1}</span>}
                </span>
                <span className="ix-flip-title">{R(it.front)}</span>
                <span className="ix-flip-cue">
                  {seen[i] && <Icon name="check" size={12} strokeWidth={3} />}
                  ↻ Շրջել քարտը
                </span>
              </div>
              <div className="ix-flip-face ix-flip-back" aria-hidden={!flipped[i]}>
                <span className="ix-flip-kicker">{plain(it.front)}</span>
                <span className="ix-flip-text">{R(it.back)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/**
 * `deck` — колода: по пункту на карточку, следующая видна краем из-под
 * верхней. Листается свайпом, стрелками, тапом по карточке и клавишами ←/→.
 * Высоту колоды держит самая длинная карточка: все лежат в одной ячейке
 * сетки, поэтому при перелистывании ничего не прыгает.
 */
export function Deck({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const n = items.length;
  const [at, setAt] = useState(0);
  const [reach, setReach] = useState(done ? n - 1 : 0);
  const [dx, setDx] = useState(0);
  const drag = useRef(null);
  const complete = reach >= n - 1;
  useDone(complete, onDone);

  const go = (i) => {
    const t = Math.max(0, Math.min(n - 1, i));
    setAt(t);
    setReach((r) => Math.max(r, t));
  };
  const down = (e) => {
    if (e.button > 0) return;
    drag.current = { x: e.clientX, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    if (!drag.current) return;
    const d = e.clientX - drag.current.x;
    if (Math.abs(d) > 5) drag.current.moved = true;
    if (drag.current.moved) setDx(d);
  };
  const up = () => {
    if (!drag.current) return;
    const { moved } = drag.current;
    drag.current = null;
    const d = dx;
    setDx(0);
    if (!moved) { if (at < n - 1) go(at + 1); return; }
    if (d < -60) go(at + 1);
    else if (d > 60) go(at - 1);
  };
  const keys = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(at + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(at - 1); }
  };

  return (
    <Frame icon={<Icon name={b.icon || 'cards'} />} title={b.title} hint="Թերթեք քարտերը" progress={`${at + 1} / ${n}`} done={complete}>
      <div className={`ix-deck tone-${b.tone || 'cyan'}`} tabIndex={0} onKeyDown={keys} aria-roledescription="carousel" aria-label={b.title}>
        <div className="ix-deck-stage">
          {items.map((t, i) => {
            const off = i - at;
            const pos = off < 0 ? 'is-gone' : off === 0 ? 'is-top' : off === 1 ? 'is-b1' : off === 2 ? 'is-b2' : 'is-far';
            const live = off === 0 && dx !== 0;
            return (
              <div
                key={i}
                className={`ix-deck-card ${pos}`}
                aria-hidden={off !== 0}
                style={{
                  zIndex: n - Math.abs(off),
                  ...(live ? { transform: `translateX(${dx}px) rotate(${dx / 24}deg)`, transition: 'none' } : null),
                }}
                onPointerDown={off === 0 ? down : undefined}
                onPointerMove={off === 0 ? move : undefined}
                onPointerUp={off === 0 ? up : undefined}
                onPointerCancel={off === 0 ? () => { drag.current = null; setDx(0); } : undefined}
              >
                <div className="ix-deck-inner">
                  <span className="ix-deck-num">
                    <Icon name={b.cardIcon || 'warn'} size={15} />
                    {i + 1}
                  </span>
                  <div className="ix-deck-text">{R(t)}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="ix-deck-nav">
          <button type="button" className="ix-round" onClick={() => go(at - 1)} disabled={at === 0} aria-label="Նախորդ">
            <Icon name="prev" size={16} />
          </button>
          <div className="ix-dots">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`ix-dot${i === at ? ' is-on' : ''}${i <= reach ? ' is-seen' : ''}`}
                onClick={() => go(i)}
                aria-label={`${i + 1}`}
                aria-current={i === at ? 'true' : undefined}
              />
            ))}
          </div>
          <button type="button" className="ix-round is-primary" onClick={() => go(at + 1)} disabled={at === n - 1} aria-label="Հաջորդ">
            <Icon name="next" size={16} />
          </button>
        </div>
      </div>
    </Frame>
  );
}
