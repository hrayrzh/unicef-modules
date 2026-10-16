import { useRef, useState } from 'react';
import { Icon } from './icons';
import { Frame, Restart, bump, shake, useDone } from './shared';

/**
 * `trust` — таблица «Սխալ խոսք / Ճիշտ խոսք» как разговор (4.html, «chat»).
 * В каждом раунде две реплики взрослого в случайном порядке; выбрав одну,
 * читатель видит подписи обеих и то, как отозвалось у ребёнка: лицо и
 * полоска доверия рядом с ним. Это не счёт — чисел нигде нет, только
 * состояние ребёнка. В конце — обе колонки целиком.
 *
 * Поля — как у таблицы: `title`, `head[2]` = [неверная, верная],
 * `rows[]` из [неверная реплика, верная].
 */
const TRUST_HINT = 'Ընտրեք երկու պատասխաններից մեկը։';

const moodOf = (t) => (t < 0.4 ? 'sad' : t < 0.72 ? 'flat' : 'glad');

export function Trust({ block: b, done, onDone, R }) {
  const head = b.head || [];
  const rows = b.rows || [];
  const n = rows.length;
  const deal = () => rows.map(() => (Math.random() < 0.5 ? [0, 1] : [1, 0]));
  const [order, setOrder] = useState(deal);
  const [round, setRound] = useState(done ? n : 0);
  const [pick, setPick] = useState(null);
  const [trust, setTrust] = useState(done ? 1 : 0.5);
  const optRefs = useRef([]);
  const complete = round >= n;
  useDone(complete, onDone);

  const cur = rows[round];
  const choose = (side) => {
    if (pick !== null || !cur) return;
    const right = order[round][side] === 1;
    setPick(side);
    setTrust((t) => Math.max(0.06, Math.min(1, t + (right ? 0.18 : -0.22))));
    (right ? bump : shake)(optRefs.current[side]);
  };
  const next = () => { setPick(null); setRound((r) => r + 1); };
  const restart = () => { setOrder(deal()); setRound(0); setPick(null); setTrust(0.5); };
  const mood = moodOf(trust);
  const answered = Math.min(n, round + (pick !== null ? 1 : 0));

  return (
    <Frame
      icon={<Icon name="quote" />}
      title={b.title}
      hint={complete ? null : TRUST_HINT}
      progress={`${answered} / ${n}`}
      done={complete}
      tools={complete ? <Restart onClick={restart} /> : null}
    >
      <div className="ix-trust-top">
        <Face mood={mood} />
        <div className={`ix-trust-meter is-${mood}`} style={{ '--t': trust }} aria-hidden>
          <Icon name="heart" size={18} />
          <span className="ix-trust-bar"><i /></span>
        </div>
      </div>

      {!complete && cur && (
        <div className="ix-trust-round" key={round}>
          <div className="ix-trust-opts">
            {order[round].map((col, side) => {
              const shown = pick !== null;
              const right = col === 1;
              const cls = ['ix-trust-opt'];
              if (shown) cls.push(right ? 'is-right' : 'is-wrong', pick === side ? 'is-chosen' : 'is-other');
              return (
                <button
                  key={side}
                  type="button"
                  ref={(el) => { optRefs.current[side] = el; }}
                  className={cls.join(' ')}
                  style={{ '--i': side }}
                  aria-disabled={shown || undefined}
                  onClick={() => choose(side)}
                >
                  {shown && (
                    <span className="ix-trust-tag">
                      <Icon name={right ? 'check' : 'close'} size={13} strokeWidth={3} />
                      {head[col]}
                    </span>
                  )}
                  <span className="ix-trust-text">{R(cur[col])}</span>
                </button>
              );
            })}
          </div>
          {pick !== null && (
            <div className="ix-trust-foot">
              <button type="button" className="ix-round is-primary" onClick={next} aria-label="Հաջորդ">
                <Icon name="next" size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {complete && (
        <div className="ix-sort-result">
          {[0, 1].map((col) => (
            <div key={col} className={`ix-sort-col tone-${col ? 'do' : 'dont'}`} style={{ '--i': col }}>
              <div className="ix-sort-col-h">
                <span className="ix-bin-ico" aria-hidden><Icon name={col ? 'check' : 'close'} size={14} strokeWidth={2.6} /></span>
                {head[col]}
              </div>
              <div className="ix-sort-col-list">
                {rows.map((r, i) => (
                  <div key={i} className="ix-sort-item is-quote" style={{ '--i': i }}>
                    <span className="ix-sort-dot" aria-hidden />
                    <span>{R(r[col])}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Frame>
  );
}

/** Лицо ребёнка: брови и рот по настроению. Рты сменяются наплывом — Safari не анимирует `d`. */
function Face({ mood }) {
  return (
    <svg className={`ix-face is-${mood}`} viewBox="0 0 64 64" aria-hidden focusable="false">
      <circle cx="32" cy="32" r="28.5" className="ix-face-head" />
      <circle cx="16" cy="40" r="4.5" className="ix-face-cheek" />
      <circle cx="48" cy="40" r="4.5" className="ix-face-cheek" />
      <path d="M18 23.5h9" className="ix-face-brow is-l" />
      <path d="M37 23.5h9" className="ix-face-brow is-r" />
      <circle cx="23.5" cy="31" r="3.2" className="ix-face-eye" />
      <circle cx="40.5" cy="31" r="3.2" className="ix-face-eye" />
      <path d="M22.5 48c5.5-5 13.5-5 19 0" className="ix-face-mouth is-sad" />
      <path d="M23.5 45.5h17" className="ix-face-mouth is-flat" />
      <path d="M21.5 42c5.5 7.2 15.5 7.2 21 0" className="ix-face-mouth is-glad" />
    </svg>
  );
}

/**
 * `ripple` — «Ինչ ասել → Հոգեբանական նպատակը» (4.html, «ripple»): слово
 * как камень в воду. Видна только фраза; нажатие пускает от точки касания
 * круги цвета колонки, и под фразой раскрывается, что она делает с
 * ребёнком. `tone: "dont"` — коралловые круги и красная плитка для
 * таблицы «чего не говорить».
 *
 * Поля — как у таблицы: `title`, `head[2]` = [фраза, действие], `rows[]`, `tone`.
 */
const RIPPLE_HINT = 'Սեղմեք արտահայտության վրա՝ տեսնելու, թե ինչպես է այն ազդում երեխայի վրա։';

export function Ripple({ block: b, done, onDone, R }) {
  const head = b.head || [];
  const rows = b.rows || [];
  const n = rows.length;
  const tone = b.tone === 'dont' ? 'dont' : 'do';
  const [open, setOpen] = useState(() => rows.map(() => !!done));
  const [waves, setWaves] = useState({});
  const count = open.filter(Boolean).length;
  const complete = n > 0 && count === n;
  useDone(complete, onDone);

  // Круги идут от пальца; с клавиатуры — от середины фразы.
  const hit = (i, el, e) => {
    if (open[i]) return;
    const r = el.getBoundingClientRect();
    const x = e && e.clientX ? e.clientX - r.left : r.width / 2;
    const y = e && e.clientY ? e.clientY - r.top : 28;
    setWaves((w) => ({ ...w, [i]: { x, y } }));
    setOpen((o) => o.map((v, j) => v || j === i));
  };

  return (
    <Frame
      icon={<Icon name="ripple" />}
      className={tone === 'dont' ? 'is-danger' : ''}
      title={b.title}
      // Подсказка остаётся и у пройденного блока: без неё таблица выглядит
      // как обычный список фраз (просьба Армана).
      hint={RIPPLE_HINT}
      progress={`${count} / ${n}`}
      done={complete}
    >
      <div className="ix-rip-list">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`ix-rip tone-${tone}${open[i] ? ' is-open' : ''}`}
            style={{ '--i': i }}
            role={open[i] ? undefined : 'button'}
            tabIndex={open[i] ? undefined : 0}
            aria-expanded={open[i] ? undefined : false}
            onClick={(e) => hit(i, e.currentTarget, e)}
            onKeyDown={(e) => {
              if (open[i] || (e.key !== 'Enter' && e.key !== ' ')) return;
              e.preventDefault();
              hit(i, e.currentTarget, null);
            }}
          >
            {waves[i] && (
              <span className="ix-rip-waves" style={{ left: waves[i].x, top: waves[i].y }} aria-hidden>
                <i /><i /><i />
              </span>
            )}
            <div className="ix-rip-say">
              <span className="ix-rip-ico" aria-hidden><Icon name={tone === 'dont' ? 'close' : 'check'} size={13} strokeWidth={3} /></span>
              <span className="ix-rip-quote">{R(row[0])}</span>
            </div>
            {/* Подпись второй колонки видна и у закрытой фразы: сразу ясно,
                что за нажатием (просьба Армана). */}
            <span className="ix-rip-label">
              <Icon name={open[i] ? 'next' : 'plus'} size={12} strokeWidth={2.6} />
              {head[1]}
            </span>
            <div className="ix-rip-more">
              <div className="ix-rip-more-in">
                <p className="ix-rip-effect">{R(row[1])}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}
