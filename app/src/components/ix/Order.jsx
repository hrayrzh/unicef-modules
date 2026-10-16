import { useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { EASE, Frame, Restart, plain, reducedMotion, shuffled, useDone } from './shared';

/**
 * `order` — пункты в правильном порядке (Module_3.html, «Դասավորեք…»):
 * карточки лежат вперемешку, нажимают ту, что идёт следующей. Верная
 * уезжает на своё место в нумерованный список над ними; неверная качает
 * головой. В файле были «3 կյանք» — жизни убраны, ошибка ничего не стоит.
 * В конце — список в порядке документа.
 *
 * `scale: true` — у мест растёт столбик силы («ամենաթույլից մինչև
 * ամենաուժեղը»): порядок здесь — от слабого к сильному, а не по времени.
 *
 * Поля: `title?`, `hint?`, `items[]` — пункты в верном порядке, дословно;
 * `scale?`.
 */
export function Order({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const n = items.length;
  const fresh = () => shuffled(items.map((_, i) => i));
  const [pool, setPool] = useState(fresh);
  const [placed, setPlaced] = useState(done ? n : 0);
  const [bad, setBad] = useState(null);
  const from = useRef(null);
  const slotRefs = useRef([]);
  const complete = placed === n;
  useDone(complete, onDone);

  const pick = (i, e) => {
    if (complete) return;
    if (i !== placed) {
      // Качает головой сама карточка (.is-bad), отдельный shake не нужен.
      setBad(i);
      setTimeout(() => setBad((x) => (x === i ? null : x)), 650);
      return;
    }
    from.current = { i, rect: e.currentTarget.getBoundingClientRect() };
    setPlaced((p) => p + 1);
  };

  // Карточка летит из стопки на своё место: место уже в потоке, его
  // сдвигают туда, где была карточка, и отпускают.
  useLayoutEffect(() => {
    const f = from.current;
    if (!f) return;
    from.current = null;
    const el = slotRefs.current[f.i];
    if (!el || reducedMotion()) return;
    const to = el.getBoundingClientRect();
    el.animate(
      [{ transform: `translate(${f.rect.left - to.left}px, ${f.rect.top - to.top}px)`, opacity: 0.6 }, { transform: 'none', opacity: 1 }],
      { duration: 460, easing: EASE },
    );
  }, [placed]);

  const left = pool.filter((i) => i >= placed);

  return (
    <Frame
      icon={<Icon name="steps" />}
      title={b.title}
      hint={complete && b.title ? null : b.hint}
      progress={`${placed} / ${n}`}
      done={complete}
      tools={complete ? <Restart onClick={() => { setPool(fresh()); setPlaced(0); }} /> : null}
    >
      <ol className={`ix-ord${b.scale ? ' has-scale' : ''}`}>
        {items.map((t, i) => {
          const state = i < placed ? 'is-on' : i === placed ? 'is-next' : '';
          return (
            <li key={i} className={`ix-ord-slot ${state}`}>
              <span className="ix-ord-n" aria-hidden>{i + 1}</span>
              {b.scale && (
                <span className="ix-ord-bars" aria-hidden>
                  {items.map((_, k) => <i key={k} className={k <= i ? 'is-up' : ''} style={{ '--h': `${((k + 1) / n) * 100}%` }} />)}
                </span>
              )}
              {i < placed ? (
                <span className="ix-ord-text" ref={(el) => { slotRefs.current[i] = el; }}>{R(t)}</span>
              ) : (
                <span className="ix-ord-empty" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>

      {!complete && (
        <div className="ix-ord-pool">
          {left.map((i) => (
            <button
              key={i}
              type="button"
              className={`ix-mcard ix-ord-card${bad === i ? ' is-bad' : ''}`}
              onClick={(e) => pick(i, e)}
            >
              {plain(items[i])}
            </button>
          ))}
        </div>
      )}
    </Frame>
  );
}
