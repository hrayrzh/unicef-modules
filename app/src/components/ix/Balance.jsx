import { useState } from 'react';
import { Icon } from './icons';
import { Frame, leadOf, useDone } from './shared';

/**
 * `seesaw` — весы «контроль ↔ доверие» (файл «Նոր ինտերակտիվ տարբերակներ»,
 * модуль 1, «Թվային սահմաններ՝ առանց վեճերի»). Слева на чаше замок —
 * контроль, справа сердце — доверие. Сначала весы перекошены в сторону
 * замка; каждый открытый пункт кладёт гирю на чашу доверия, и коромысло
 * выравнивается. Когда открыты все, весы стоят ровно, сердце закрашено.
 * Чаши висят ровно: они поворачиваются обратно на тот же угол.
 *
 * Пункт — кнопка с зачином (до первой точки), нажатие дописывает остальное
 * дословно. Поля: `items[]`.
 */
const HINT = 'Սեղմեք կանոններին՝ կշեռքը հավասարակշռելու համար։';
const TILT = 12;
const L = 82; // точка подвеса левой чаши
const RX = 318; // и правой

function Pan({ x, tilt, children }) {
  return (
    <g className="ix-saw-pan" style={{ transformOrigin: `${x}px 103px`, transform: `rotate(${-tilt}deg)` }}>
      <path className="ix-saw-rope" d={`M${x} 103L${x - 30} 152M${x} 103L${x + 30} 152`} />
      {children}
      <path className="ix-saw-dish" d={`M${x - 40} 152h80a40 15 0 01-80 0z`} />
    </g>
  );
}

export function Seesaw({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const [on, setOn] = useState(() => items.map(() => !!done));
  const n = on.filter(Boolean).length;
  const complete = items.length > 0 && n === items.length;
  useDone(complete, onDone);
  const tilt = -TILT * (1 - n / Math.max(1, items.length));
  const open = (i) => setOn((o) => (o[i] ? o : o.map((v, k) => v || k === i)));

  return (
    <Frame icon={<Icon name="scale" />} hint={HINT} progress={`${n} / ${items.length}`} done={complete}>
      <div className={`ix-saw${complete ? ' is-level' : ''}`}>
        <svg viewBox="0 58 400 156" className="ix-saw-svg" aria-hidden>
          <path className="ix-saw-ground" d="M110 204h180" />
          <path className="ix-saw-post" d="M200 106l-28 98h56z" />
          <g className="ix-saw-beam" style={{ transform: `rotate(${tilt}deg)` }}>
            <rect className="ix-saw-bar" x="62" y="98" width="276" height="10" rx="5" />
            <Pan x={L} tilt={tilt}>
              <g className="ix-saw-lock">
                <path d={`M${L - 10} 132v-9a10 10 0 0120 0v9`} />
                <rect x={L - 16} y="131" width="32" height="21" rx="4" />
                <path d={`M${L} 139v6`} />
              </g>
            </Pan>
            <Pan x={RX} tilt={tilt}>
              <path
                className="ix-saw-heart"
                d={`M${RX} 132c-9-6-15-10-15-16a7 7 0 0115-3 7 7 0 0115 3c0 6-6 10-15 16z`}
              />
              {items.map((_, k) => (on[k] ? (
                <rect key={k} className="ix-saw-weight" x={RX - 29 + k * 20} y="137" width="18" height="15" rx="3" style={{ '--k': k }} />
              ) : null))}
            </Pan>
            <circle className="ix-saw-pin" cx="200" cy="103" r="7" />
          </g>
        </svg>

        <ul className="ix-saw-list">
          {items.map((t, i) => {
            const [lead, rest] = leadOf(t);
            return (
              <li key={i}>
                <button type="button" className={`ix-saw-item${on[i] ? ' is-on' : ''}`} aria-expanded={on[i]} onClick={() => open(i)}>
                  <span className="ix-saw-w" aria-hidden>{on[i] ? <Icon name="check" size={13} strokeWidth={3} /> : i + 1}</span>
                  <span className="ix-saw-text">
                    <b>{R(lead)}</b>
                    {on[i] && <span className="ix-saw-rest">{R(rest)}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Frame>
  );
}
