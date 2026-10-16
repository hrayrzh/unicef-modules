import { useState } from 'react';
import { Icon } from './icons';
import { Frame, useDone } from './shared';

/**
 * `myths` — «Կոտրեք … առասպել» из файла предложений к модулю 4 (4.html).
 * На карточке сначала только сам миф; кнопка «Կոտրել» — по названию
 * проходит трещина, оно раскалывается на две половинки и блекнет, а под
 * ним раскрывается то, что на самом деле. Расколотый миф остаётся на
 * карточке читаемым: видно, о каком заблуждении шла речь.
 *
 * Поля: `title`, `items[]` из `{ myth, fact }` — начало пункта и остальное,
 * дословно.
 */

// Трещина в долях ширины/высоты названия. Те же точки режут его на две
// половинки (clip-path), поэтому линия и разлом совпадают.
const CRACK = [[51, 0], [46, 24], [55, 46], [47, 70], [53, 88], [50, 100]];
const LEFT = `polygon(0 0, ${CRACK.map(([x, y]) => `${x}% ${y}%`).join(', ')}, 0 100%)`;
const RIGHT = `polygon(${CRACK.map(([x, y]) => `${x}% ${y}%`).join(', ')}, 100% 100%, 100% 0)`;
const CRACK_D = `M${CRACK.map(([x, y]) => `${x} ${y}`).join('L')}`;

export function Myths({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const n = items.length;
  const [broken, setBroken] = useState(() => items.map(() => !!done));
  const count = broken.filter(Boolean).length;
  const complete = n > 0 && count === n;
  useDone(complete, onDone);
  const smash = (i) => setBroken((s) => s.map((v, j) => v || j === i));

  return (
    <Frame icon={<Icon name="crack" />} title={b.title} progress={`${count} / ${n}`} done={complete}>
      <div className="ix-myths">
        {items.map((it, i) => (
          <article key={i} className={`ix-myth${broken[i] ? ' is-broken' : ''}`} style={{ '--i': i }}>
            <div className="ix-myth-top">
              <div className="ix-myth-split">
                <span className="ix-myth-half" style={{ clipPath: LEFT }}>{it.myth}</span>
                <span className="ix-myth-half is-r" style={{ clipPath: RIGHT }} aria-hidden>{it.myth}</span>
                <svg className="ix-myth-crack" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                  <path d={CRACK_D} vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
            </div>
            {!broken[i] && (
              <div className="ix-myth-act">
                <button type="button" className="ix-btn is-primary" onClick={() => smash(i)}>
                  <Icon name="crack" size={16} />
                  Կոտրել
                </button>
              </div>
            )}
            <div className="ix-myth-fact" aria-hidden={!broken[i]}>
              <div className="ix-myth-fact-in">
                <span className="ix-myth-ok" aria-hidden><Icon name="check" size={13} strokeWidth={3} /></span>
                <p>{R(it.fact)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Frame>
  );
}
