import { Fragment, useEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { Frame, markParts, reducedMotion, sentences, useDone } from './shared';

/**
 * `merge` — слово из двух (файл «Նոր ինտերակտիվ տարբերակներ», модуль 5,
 * «Թվային հետք»): «share» и «parenting» с переводами из абзаца съезжаются,
 * «pare» выпадает, получается «sharenting» — и открывается абзац. Слова и
 * переводы — те, что в самом абзаце.
 *
 * Поля: `title`, `a` / `b` — `{word, gloss}`, у `b` ещё `cut` — сколько букв
 * выпадает в начале; `result` — слово абзаца («Շերենթինգ»); `text`.
 */
const MERGE_HINT = 'Սեղմեք՝ երկու բառերը միացնելու համար։';

export function Merge({ block: b, done, onDone, R }) {
  const a = b.a || {};
  const c = b.b || {};
  const cut = c.cut || 0;
  const [phase, setPhase] = useState(done ? 2 : 0);
  const timer = useRef(null);
  useDone(phase === 2, onDone);
  useEffect(() => () => clearTimeout(timer.current), []);

  const join = () => {
    if (phase) return;
    if (reducedMotion()) { setPhase(2); return; }
    setPhase(1);
    timer.current = setTimeout(() => setPhase(2), 950);
  };

  return (
    <Frame icon={<Icon name="merge" />} title={b.title} hint={phase === 2 ? null : MERGE_HINT} done={phase === 2}>
      <div className={`ix-merge is-p${phase}`}>
        <div className="ix-merge-stage">
          <div className="ix-merge-row" lang="en">
            <span className="ix-merge-w is-a">{a.word}</span>
            <span className="ix-merge-plus" aria-hidden>+</span>
            <span className="ix-merge-w is-b">
              <span className="ix-merge-cut">{(c.word || '').slice(0, cut)}</span>
              {(c.word || '').slice(cut)}
            </span>
          </div>
          <div className="ix-merge-gloss">
            {phase < 2 ? (
              <>
                <span>{a.gloss}</span>
                <span>{c.gloss}</span>
              </>
            ) : (
              <span className="ix-merge-res">{b.result}</span>
            )}
          </div>
          {phase === 0 && (
            <button type="button" className="ix-round is-primary is-lg ix-merge-btn" onClick={join} aria-label={MERGE_HINT}>
              <Icon name="merge" size={20} />
            </button>
          )}
        </div>
        {phase === 2 && <p className="ix-text ix-merge-text">{R(b.text)}</p>}
      </div>
    </Frame>
  );
}

/**
 * `maturity` — участие растёт с возрастом (тот же файл, «Երեխայի
 * վերաբերյալ բովանդակություն հրապարակելուց առաջ…»): ползунок от малыша к
 * подростку. Фигура растёт, облачко её голоса — тоже, на карточке решений
 * загораются галочки; предложения абзаца открываются по мере движения.
 * Засчитывается, когда ползунок дошёл до конца.
 *
 * Поля: `text`.
 */
const MAT_HINT = 'Շարժեք սահիչը՝ երեխայի տարիքի աճին հետևելու համար։';

export function Maturity({ block: b, done, onDone, R }) {
  const ss = sentences(b.text);
  const N = ss.length;
  const [v, setV] = useState(done ? 100 : 0);
  const [ok, setOk] = useState(!!done);
  useEffect(() => { if (v >= 98) setOk(true); }, [v]);
  useDone(ok, onDone);
  const k = Math.max(1, Math.ceil((v / 100) * N));
  const t = v / 100;

  return (
    <Frame icon={<Icon name="grow" />} hint={MAT_HINT} progress={`${k} / ${N}`} done={ok}>
      <div className="ix-mat" style={{ '--t': t }}>
        <svg viewBox="0 0 420 176" className="ix-mat-svg" aria-hidden>
          <path className="ix-mat-ground" d="M30 164h360" />
          <g className="ix-mat-kid">
            <circle cx="120" cy="54" r="17" className="ix-mat-fill" />
            <path d="M92 164v-50a28 28 0 0156 0v50z" className="ix-mat-fill" />
            <circle cx="120" cy="54" r="17" className="ix-mat-line" />
            <path d="M92 164v-50a28 28 0 0156 0v50" className="ix-mat-line" />
          </g>
          <g className="ix-mat-say">
            <path d="M164 30h72a12 12 0 0112 12v26a12 12 0 01-12 12h-50l-18 14 4-14h-8a12 12 0 01-12-12V42a12 12 0 0112-12z" className="ix-mat-bubble" />
            {[0, 1, 2].map((i) => <path key={i} d={`M176 ${45 + i * 11}h${48 - i * 12}`} className={`ix-mat-l${k > i ? ' is-on' : ''}`} />)}
          </g>
          <g className="ix-mat-card">
            <rect x="290" y="44" width="96" height="112" rx="10" className="ix-mat-paper" />
            {[0, 1, 2].map((i) => {
              const on = t >= (i + 1) / 3 - 0.02;
              return (
                <g key={i} className={on ? 'is-on' : ''}>
                  <rect x="304" y={62 + i * 30} width="16" height="16" rx="4" className="ix-mat-box" />
                  <path d={`M307 ${70 + i * 30}l4 4 7-8`} className="ix-mat-tick" />
                  <path d={`M328 ${70 + i * 30}h44`} className="ix-mat-row" />
                </g>
              );
            })}
          </g>
        </svg>
        <div className="ix-mat-range">
          <span className="ix-mat-end is-small" aria-hidden><Icon name="child" size={16} /></span>
          <input
            type="range"
            min="0"
            max="100"
            value={v}
            onChange={(e) => setV(+e.target.value)}
            className="ix-range"
            style={{ '--v': `${v}%` }}
            aria-label={MAT_HINT}
          />
          <span className="ix-mat-end" aria-hidden><Icon name="child" size={24} /></span>
        </div>
        <p className="ix-text ix-mat-text" aria-live="polite">
          {ss.slice(0, k).map((s, i) => (
            <Fragment key={i}>
              {i > 0 && ' '}
              <span className="ix-grow-s">{R(s)}</span>
            </Fragment>
          ))}
        </p>
      </div>
    </Frame>
  );
}

/**
 * `copies` — что бывает с опубликованным (тот же файл, «…կարող է
 * պահպանվել, կրկնօրինակվել կամ հասանելի դառնալ ավելի լայն լսարանի համար»):
 * кнопка «поделиться» трижды — фото уходит в облако (сохранилось), из него
 * разлетаются копии (скопировалось), вокруг появляются люди (стало доступно
 * широкой аудитории). Каждое нажатие подсвечивает в абзаце своё слово.
 *
 * Поля: `text`, `marks[3]` — дословные слова абзаца по порядку.
 */
const COPY_HINT = 'Սեղմեք կոճակին՝ տեսնելու, թե ինչ է լինում հրապարակված բովանդակության հետ։';
const SHARE = 'Կիսվել';
const CX = 300;
const CY = 138;
const COPIES = [[-178, -52], [178, -52], [-206, 34], [206, 34], [-112, 70], [112, 70]];
const PEOPLE = [
  [40, 40], [86, 22], [520, 22], [566, 40], [24, 120], [584, 120], [44, 214], [560, 214],
  [150, 228], [452, 228], [236, 230], [366, 230], [176, 20], [426, 20], [300, 230], [16, 76], [590, 172],
];

function Photo({ w = 60, h = 46 }) {
  return (
    <>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="6" className="ix-cp-card" />
      <circle cx={w / 2 - 14} cy={-h / 2 + 12} r="5" className="ix-cp-sun" />
      <path d={`M${-w / 2 + 5} ${h / 2 - 5}l${w * 0.3} ${-h * 0.42}l${w * 0.22} ${h * 0.26}l${w * 0.12} ${-h * 0.14}l${w * 0.26} ${h * 0.3}`} className="ix-cp-hill" />
    </>
  );
}

export function Copies({ block: b, done, onDone, R }) {
  const marks = b.marks || [];
  const total = marks.length || 3;
  const [n, setN] = useState(done ? total : 0);
  const complete = n >= total;
  useDone(complete, onDone);
  const parts = markParts(b.text, marks);

  return (
    <Frame icon={<Icon name="copy" />} hint={COPY_HINT} progress={`${n} / ${total}`} done={complete}>
      <div className={`ix-cp is-s${n}`}>
        <div className="ix-cp-stage">
          <svg viewBox="0 0 600 250" className="ix-cp-svg" aria-hidden>
            <g className="ix-cp-cloud">
              <path d="M262 74a22 22 0 01-2-44 30 30 0 0157-8 24 24 0 0137 22 20 20 0 01-6 30z" />
              <g transform="translate(305 52)"><Photo w={30} h={22} /></g>
              <path d="M300 112V86" className="ix-cp-up" />
              <path d="M292 94l8-9 8 9" className="ix-cp-up" />
            </g>
            {COPIES.map(([dx, dy], k) => (
              <g key={k} transform={`translate(${CX} ${CY})`}>
                <g className="ix-cp-copy" style={{ '--x': `${dx}px`, '--y': `${dy}px`, '--k': k }}>
                  <Photo w={48} h={36} />
                </g>
              </g>
            ))}
            {PEOPLE.map(([x, y], k) => (
              <g key={k} transform={`translate(${x} ${y})`}>
                <g className="ix-cp-man" style={{ '--k': k }}>
                  <circle cx="0" cy="-7" r="5.5" />
                  <path d="M-9 9a9 9 0 0118 0z" />
                </g>
              </g>
            ))}
            <g transform={`translate(${CX} ${CY})`} className="ix-cp-photo">
              <Photo />
            </g>
          </svg>
          {!complete && (
            <button type="button" className="ix-round is-primary is-lg ix-cp-btn" onClick={() => setN((x) => Math.min(total, x + 1))} aria-label={SHARE} title={SHARE}>
              <Icon name="share" size={20} />
            </button>
          )}
        </div>
        <p className="ix-text ix-cp-text">
          {parts.map((p, k) => (p.i == null ? (
            <Fragment key={k}>{R(p.t)}</Fragment>
          ) : (
            <mark key={k} className={`ix-ice-mark is-top${p.i < n ? ' is-on' : ''}`}>{p.t}</mark>
          )))}
        </p>
      </div>
    </Frame>
  );
}
