import { useRef, useState } from 'react';
import { Icon } from './icons';
import { Frame, flyTo, useDone } from './shared';

/**
 * `casefile` — «дело» (файл «Նոր ինտերակտիվ տարբերակներ», модуль 2,
 * «Իրավական պաշտպանություն»): абзацы — листы с номерами рядом с папкой.
 * Нажатый лист улетает в папку, стопка в ней растёт, абзац встаёт на своё
 * место по номеру. Собраны все — на папке печать.
 *
 * Поля: `items[]` — абзацы по порядку.
 */
const CASE_HINT = 'Սեղմեք փաստաթղթերին՝ դրանք թղթապանակում հավաքելու համար։';

export function CaseFile({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const [filed, setFiled] = useState(() => items.map(() => !!done));
  const [busy, setBusy] = useState(false);
  const folderRef = useRef(null);
  const docRefs = useRef([]);
  const n = filed.filter(Boolean).length;
  const complete = items.length > 0 && n === items.length;
  useDone(complete, onDone);

  const file = async (i) => {
    if (filed[i] || busy) return;
    setBusy(true);
    await flyTo(docRefs.current[i], folderRef.current, { scale: 0.3, duration: 560 });
    setFiled((f) => f.map((v, k) => v || k === i));
    setBusy(false);
  };

  return (
    <Frame icon={<Icon name="folder" />} hint={CASE_HINT} progress={`${n} / ${items.length}`} done={complete}>
      <div className={`ix-case${complete ? ' is-closed' : ''}`}>
        <div className="ix-case-stage">
          <div className="ix-case-docs">
            {items.map((_, i) => (filed[i] ? (
              <span key={`g${i}`} className="ix-case-gap" aria-hidden>{i + 1}</span>
            ) : (
              <button
                key={`d${i}`}
                ref={(el) => { docRefs.current[i] = el; }}
                type="button"
                className="ix-case-doc"
                style={{ '--i': i }}
                onClick={() => file(i)}
                aria-label={`${i + 1}`}
              >
                <span className="ix-case-clip" aria-hidden><Icon name="clip" size={18} /></span>
                <span className="ix-case-lines" aria-hidden><i /><i /><i /><i /><i /></span>
                <span className="ix-case-num">{i + 1}</span>
              </button>
            )))}
          </div>
          <div className="ix-case-folder" ref={folderRef} aria-hidden>
            <span className="ix-case-back" />
            <span className="ix-case-papers">
              {filed.map((f, i) => (f ? <i key={i} style={{ '--k': i }} /> : null))}
            </span>
            <span className="ix-case-front">
              <span className="ix-case-count">{n} / {items.length}</span>
            </span>
            {complete && <span className="ix-case-stamp"><Icon name="check" size={22} strokeWidth={3} /></span>}
          </div>
        </div>

        <ol className="ix-nlist">
          {items.map((t, i) => (
            <li key={i} className={filed[i] ? 'is-on' : ''}>
              <span className="ix-num" aria-hidden>{i + 1}</span>
              {filed[i] ? <p>{R(t)}</p> : <span className="ix-tl-ghost" aria-hidden><span /><span /></span>}
            </li>
          ))}
        </ol>
      </div>
    </Frame>
  );
}

/**
 * `combo` — кодовый замок (тот же файл, модуль 4, «Ապացույցների հետ վարվելու
 * կանոններ…»): по колёсику на правило. Нажатое колёсико прокручивается до
 * галочки, и правило встаёт под замком на своё место. Все колёсики на месте —
 * дужка поднимается, замок открыт.
 *
 * Поля: `items[]` — правила по порядку.
 */
const COMBO_HINT = 'Պտտեք յուրաքանչյուր անիվը՝ կողպեքը բացելու համար։';
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function Combo({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const [set, setSet] = useState(() => items.map(() => !!done));
  const n = set.filter(Boolean).length;
  const complete = items.length > 0 && n === items.length;
  useDone(complete, onDone);
  const turn = (i) => setSet((s) => (s[i] ? s : s.map((v, k) => v || k === i)));

  return (
    <Frame icon={<Icon name="dial" />} hint={COMBO_HINT} progress={`${n} / ${items.length}`} done={complete}>
      <div className={`ix-cl${complete ? ' is-open' : ''}`}>
        <div className="ix-cl-lock">
          <svg viewBox="0 0 220 80" className="ix-cl-shackle" aria-hidden>
            <path d="M58 80V50a52 52 0 01104 0v30" />
          </svg>
          <div className="ix-cl-body">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`ix-wheel${set[i] ? ' is-set' : ''}`}
                aria-pressed={set[i]}
                aria-label={`${i + 1}`}
                onClick={() => turn(i)}
                style={{ '--i': i }}
              >
                <span className="ix-wheel-strip" aria-hidden>
                  {DIGITS.map((d) => <span key={d}>{(d + i * 3 + 1) % 10}</span>)}
                  <span className="ix-wheel-ok"><Icon name="check" size={18} strokeWidth={3} /></span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <ol className="ix-nlist">
          {items.map((t, i) => (
            <li key={i} className={set[i] ? 'is-on' : ''}>
              <span className="ix-num" aria-hidden>{i + 1}</span>
              {set[i] ? <span className="ix-cl-t">{R(t)}</span> : <span className="ix-tl-ghost" aria-hidden><span /><span /></span>}
            </li>
          ))}
        </ol>
      </div>
    </Frame>
  );
}
