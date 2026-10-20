import { Fragment, useEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { Frame, reducedMotion, sentences, useDone } from './shared';

/**
 * `grow` — «росток» (файл «Նոր ինտերակտիվ տարբերակներ», модуль 2,
 * «Վերականգնում»): абзацы открываются по предложению, каждое — полив.
 * Лейка наклоняется, падают капли, стебель дорастает, появляется лист;
 * на последнем предложении распускается цветок. Абзацы — дословно, с теми же
 * пробелами между предложениями; видно первое предложение, остальные — по
 * поливу.
 *
 * Поля: `items[]` — абзацы.
 */
const HINT = 'Ջրեք բույսը՝ հաջորդ միտքը բացելու համար։';
const WATER = 'Ջրել';
// Листья по стеблю снизу вверх: [x, y, сторона].
const LEAVES = [[120, 150, 1], [120, 132, -1], [120, 114, 1], [120, 97, -1], [120, 82, 1]];

export function Grow({ block: b, done, onDone, R }) {
  const paras = (b.items || []).map((p) => sentences(p));
  const flat = paras.flatMap((ss, p) => ss.map((t, k) => ({ p, k })));
  const N = flat.length;
  const [shown, setShown] = useState(done ? N : 1);
  const [pour, setPour] = useState(0);
  const timer = useRef(null);
  const complete = shown >= N;
  useDone(complete, onDone);
  useEffect(() => () => clearTimeout(timer.current), []);

  const growth = N > 1 ? (shown - 1) / (N - 1) : 1;
  const leaves = 1 + Math.round(growth * (LEAVES.length - 1)); // росток с одним листом с самого начала
  const water = () => {
    if (complete || timer.current) return;
    setPour((k) => k + 1);
    timer.current = setTimeout(() => { timer.current = null; setShown((s) => Math.min(N, s + 1)); }, reducedMotion() ? 0 : 700);
  };

  let idx = 0;
  return (
    <Frame icon={<Icon name="sprout" />} hint={HINT} progress={`${shown} / ${N}`} done={complete}>
      <div className={`ix-grow${complete ? ' is-bloom' : ''}`}>
        <div className="ix-grow-stage">
          <svg viewBox="0 -16 240 248" className="ix-grow-svg" aria-hidden>
            <g transform="translate(16 -20)">
            <g key={pour} className={`ix-grow-can${pour ? ' is-pouring' : ''}`}>
              <path d="M150 34h46v30a6 6 0 01-6 6h-34a6 6 0 01-6-6z" className="ix-grow-can-body" />
              <path d="M196 42c12 0 14 18 2 20" className="ix-grow-can-line" />
              <path d="M150 46l-34-14 4-8 34 12" className="ix-grow-can-body" />
            </g>
            {/* Капли — от носика наклонённой лейки (поворот −24° вокруг ручки). */}
            {pour > 0 && (
              <g key={`d${pour}`}>
                {[0, 1, 2].map((k) => <circle key={k} className="ix-grow-drop" cx={110 + k * 6} cy="60" r="3" style={{ '--k': k }} />)}
              </g>
            )}
            </g>
            <ellipse cx="120" cy="222" rx="60" ry="6" className="ix-grow-shadow" />
            <path
              className="ix-grow-stem"
              d="M120 172C120 150 116 122 120 70"
              pathLength="1"
              style={{ strokeDashoffset: 1 - (0.3 + 0.7 * growth) }}
            />
            {LEAVES.map(([x, y, s], k) => (
              <path
                key={k}
                className={`ix-grow-leaf${k < leaves ? ' is-on' : ''}${s < 0 ? ' is-left' : ''}`}
                d={s > 0 ? `M${x} ${y}c8-13 26-16 36-8-8 13-26 16-36 8z` : `M${x} ${y}c-8-13-26-16-36-8 8 13 26 16 36 8z`}
              />
            ))}
            <g className="ix-grow-flower">
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="120" cy="58" rx="7" ry="11" transform={`rotate(${a} 120 70)`} className="ix-grow-petal" />
              ))}
              <circle cx="120" cy="70" r="6.5" className="ix-grow-core" />
            </g>
            <path d="M74 172h92l-11 50H85z" className="ix-grow-pot" />
            <rect x="68" y="164" width="104" height="13" rx="5" className="ix-grow-rim" />
          </svg>
          {!complete && (
            <button type="button" className="ix-round is-primary is-lg ix-grow-btn" onClick={water} aria-label={WATER} title={WATER}>
              <Icon name="drop" size={20} />
            </button>
          )}
        </div>

        <div className="ix-grow-text" aria-live="polite">
          {paras.map((ss, p) => {
            const start = idx;
            idx += ss.length;
            if (start >= shown) return null;
            return (
              <p key={p}>
                {ss.map((t, k) => (start + k < shown ? (
                  <Fragment key={k}>
                    {k > 0 && ' '}
                    <span className="ix-grow-s">{R(t)}</span>
                  </Fragment>
                ) : null))}
              </p>
            );
          })}
        </div>
      </div>
    </Frame>
  );
}
