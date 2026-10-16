import { useState } from 'react';
import { Icon } from './icons';
import { Frame, useDone } from './shared';

/**
 * `vault` — «сейф» из 5_1.html для «Տվյալներ, որոնք խորհուրդ չի տրվում
 * հրապարակել»: у каждой группы свой сейф с открытой дверцей, данные лежат
 * снаружи «на виду». Нажатие прячет данное под замок; когда спрятана вся
 * группа, дверца закрывается и открывается «Ինչու՞.». У пункта может быть
 * своё «Ինչու՞.» — оно открывается сразу под ним (группа «Որոշ
 * լուսանկարներ»). Шредер из 5_2.html не взят: текст не про уничтожение
 * данных, а про то, чтобы не выкладывать их.
 *
 * Поля: `title`, `groups[]` из `{title, text?, items[], why?}`; пункт —
 * строка или `{text, why}`.
 */
const HINT = 'Սեղմեք յուրաքանչյուր տվյալի վրա՝ այն կողպելու համար։';
const WHY = /^(Ինչու՞\.)\s*/;

function Why({ text, R, className = '' }) {
  const m = WHY.exec(text);
  return (
    <p className={`ix-vault-why ${className}`}>
      <span className="ix-vault-why-ico" aria-hidden><Icon name="key" size={14} /></span>
      <span>{m ? <><b>{m[1]}</b> {R(text.slice(m[0].length))}</> : R(text)}</span>
    </p>
  );
}

function Safe({ shut }) {
  return (
    <svg viewBox="0 0 48 48" className={`ix-safe${shut ? ' is-shut' : ''}`} aria-hidden>
      <rect className="ix-safe-body" x="5" y="6" width="38" height="34" rx="5" />
      <rect className="ix-safe-hole" x="10" y="11" width="28" height="24" rx="2.5" />
      <g className="ix-safe-door">
        <rect x="10" y="11" width="28" height="24" rx="2.5" />
        <circle cx="24" cy="23" r="5" />
        <path d="M24 18v2M24 26v2M19 23h2M27 23h2" />
      </g>
      <path className="ix-safe-feet" d="M11 40v3M37 40v3" />
    </svg>
  );
}

export function Vault({ block: b, done, onDone, R }) {
  const groups = b.groups || [];
  const [locked, setLocked] = useState(() => groups.map((g) => (g.items || []).map(() => !!done)));
  const shut = locked.map((l) => l.length > 0 && l.every(Boolean));
  const count = shut.filter(Boolean).length;
  const complete = groups.length > 0 && count === groups.length;
  useDone(complete, onDone);

  const lock = (gi, k) => setLocked((all) => all.map((l, i) => (i === gi ? l.map((v, j) => v || j === k) : l)));

  return (
    <Frame icon={<Icon name="safe" />} title={b.title} hint={complete ? null : HINT} progress={`${count} / ${groups.length}`} done={complete}>
      <div className="ix-vault">
        {groups.map((g, gi) => (
          <section key={gi} className={`ix-vault-g${shut[gi] ? ' is-shut' : ''}`} style={{ '--i': gi }}>
            <header className="ix-vault-head">
              <Safe shut={shut[gi]} />
              <span className="ix-vault-n">{gi + 1}</span>
              <span className="ix-vault-title">{g.title}</span>
            </header>
            {g.text && <p className="ix-vault-pre">{R(g.text)}</p>}
            <ul className="ix-vault-items">
              {(g.items || []).map((it, k) => {
                const text = typeof it === 'string' ? it : it.text;
                const on = locked[gi][k];
                return (
                  <li key={k}>
                    <button
                      type="button"
                      className={`ix-vault-item${on ? ' is-locked' : ''}`}
                      aria-pressed={on}
                      onClick={() => lock(gi, k)}
                    >
                      <span className="ix-vault-ico" aria-hidden><Icon name={on ? 'lock' : 'eye'} size={15} /></span>
                      <span className="ix-vault-text">{R(text)}</span>
                    </button>
                    {it.why && on && <Why text={it.why} R={R} className="is-item" />}
                  </li>
                );
              })}
            </ul>
            {g.why && shut[gi] && <Why text={g.why} R={R} />}
          </section>
        ))}
      </div>
    </Frame>
  );
}
