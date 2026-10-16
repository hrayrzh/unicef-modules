import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { S } from './art';
import { EASE, Frame, onKey, reducedMotion, useDone } from './shared';

/**
 * `identity` — «из чего складывается человек» (5_1.html, «tags»; 5_2.html,
 * «удостоверение»). Абзац определения дословный; примеры в нём — `items`,
 * подчёркнуты. Нажатие на пример отправляет его подписью к фигуре, и на
 * безликом пунктирном силуэте дорисовывается то, о чём пример: лицо, голос,
 * бейдж с именем, паспорт, телефон, подпись, походка. Когда отмечены все,
 * силуэт становится узнаваемым человеком — в этом и мысль абзаца.
 *
 * Поля: `title`, `text`, `items[]` из `{text, at}`: `text` — дословный кусок
 * абзаца (ищется по порядку), `at` — ключ места в `SPOTS`.
 */
const HINT = 'Սեղմեք ընդգծված բառերին՝ դրանք մարդու վրա տեսնելու համար։';

// Холст 440×320, фигура по центру (x 220). `p` — точка на фигуре, `y` —
// высота подписи, `side` — с какой стороны подпись. Предметы нарисованы
// между EDGE_L и EDGE_R, подписи — снаружи, поэтому друг друга не закрывают.
const SPOTS = {
  image: { p: [190, 40], y: 52, side: 'l' },
  voice: { p: [262, 70], y: 64, side: 'r' },
  name: { p: [200, 128], y: 120, side: 'l' },
  surname: { p: [240, 138], y: 134, side: 'r' },
  passport: { p: [136, 203], y: 204, side: 'l' },
  phone: { p: [301, 192], y: 186, side: 'r' },
  sign: { p: [305, 242], y: 250, side: 'r' },
  gait: { p: [186, 286], y: 290, side: 'l' },
};
const W = 440;
const H = 320;
const EDGE_L = 132;
const EDGE_R = 308;

// Что дорисовывается на фигуре для каждого примера.
const DRAW = {
  image: (
    <>
      <S d="M194 58c2-18 13-28 26-28s24 10 26 28c-7-7-16-10-26-10s-19 3-26 10z" className="is-thick" />
      <S t="circle" cx="211" cy="62" r="1.6" className="is-thick" at={0.3} />
      <S t="circle" cx="229" cy="62" r="1.6" className="is-thick" at={0.35} />
      <S d="M180 26v-8h8M260 26v-8h-8M180 100v8h8M260 100v8h-8" className="is-accent" at={0.4} />
    </>
  ),
  voice: (
    <>
      <S d="M212 76c5 4 11 4 16 0" className="is-thick" />
      <S d="M254 62a10 10 0 010 16M262 55a20 20 0 010 30" className="is-accent" at={0.3} />
    </>
  ),
  name: (
    <>
      <S t="rect" x="200" y="120" width="40" height="28" rx="4" className="is-accent" />
      <S d="M206 130h28" className="is-thick" at={0.3} />
    </>
  ),
  surname: <S d="M206 139h20" className="is-thick" />,
  passport: (
    <>
      <S t="rect" x="136" y="186" width="26" height="34" rx="3" className="is-accent" />
      <S t="circle" cx="149" cy="199" r="4.5" at={0.3} />
      <S d="M143 211h12" at={0.4} />
    </>
  ),
  phone: (
    <>
      <S t="rect" x="283" y="176" width="18" height="32" rx="4" className="is-accent" />
      <S d="M289 202h6" at={0.3} />
    </>
  ),
  sign: (
    <>
      <S t="rect" x="255" y="226" width="50" height="32" rx="3" />
      <S d="M262 248c5-12 9 6 13-3s7 5 11-4 6 4 10-2" className="is-accent is-thick" at={0.3} />
    </>
  ),
  gait: (
    <>
      <S d="M190 238h-18M194 254h-26M190 270h-16" className="is-accent" />
      <S d="M202 286h-16M238 286h16" className="is-thick" at={0.3} />
    </>
  ),
};

/** Абзац на куски по примерам: кусок с `i` — пример номер i. */
function split(text = '', items) {
  const out = [];
  let at = 0;
  items.forEach((it, i) => {
    const k = text.indexOf(it.text, at);
    if (k < 0) return;
    if (k > at) out.push({ t: text.slice(at, k) });
    out.push({ t: it.text, i });
    at = k + it.text.length;
  });
  if (at < text.length) out.push({ t: text.slice(at) });
  return out;
}

export function Identity({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const [tagged, setTagged] = useState(() => items.map(() => !!done));
  const count = tagged.filter(Boolean).length;
  const complete = items.length > 0 && count === items.length;
  useDone(complete, onDone);
  const from = useRef(null);
  const labelRefs = useRef([]);
  const parts = split(b.text, items);

  const tag = (i, e) => {
    if (tagged[i]) return;
    from.current = { i, rect: e.currentTarget.getBoundingClientRect() };
    setTagged((t) => t.map((v, k) => v || k === i));
  };

  // Подпись вылетает из слова в абзаце и садится к фигуре.
  useLayoutEffect(() => {
    const f = from.current;
    if (!f) return;
    from.current = null;
    const el = labelRefs.current[f.i];
    if (!el || reducedMotion()) return;
    const to = el.getBoundingClientRect();
    const dx = f.rect.left + f.rect.width / 2 - (to.left + to.width / 2);
    const dy = f.rect.top + f.rect.height / 2 - (to.top + to.height / 2);
    el.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(.7)`, opacity: 0.4 }, { transform: 'none', opacity: 1 }],
      { duration: 620, easing: EASE },
    );
  }, [tagged]);

  return (
    <Frame icon={<Icon name="idtag" />} title={b.title} hint={complete ? null : HINT} progress={`${count} / ${items.length}`} done={complete}>
      <p className="ix-text">
        {parts.map((p, k) => (p.i == null ? (
          <Fragment key={k}>{R(p.t)}</Fragment>
        ) : (
          <span
            key={k}
            role="button"
            tabIndex={tagged[p.i] ? -1 : 0}
            aria-pressed={tagged[p.i]}
            className={`ix-id-word${tagged[p.i] ? ' is-on' : ''}`}
            onClick={(e) => tag(p.i, e)}
            onKeyDown={onKey(() => tag(p.i, { currentTarget: document.activeElement }))}
          >
            {p.t}
          </span>
        )))}
      </p>

      <div className={`ix-id${complete ? ' is-known' : ''}`}>
        <svg viewBox={`0 0 ${W} ${H}`} className="ix-id-svg" aria-hidden>
          <g className="ix-id-body">
            <circle cx="220" cy="62" r="30" />
            <path d="M176 196v-56c0-24 20-40 44-40s44 16 44 40v56" />
            <path d="M176 142c-14 14-22 34-24 56M264 142c14 14 22 34 24 50" />
            <path d="M202 196v90M238 196v90" />
          </g>
          {!tagged[items.findIndex((it) => it.at === 'image')] && <text x="220" y="72" className="ix-id-q">?</text>}
          {items.map((it, i) => {
            const s = SPOTS[it.at];
            if (!s) return null;
            const edge = s.side === 'l' ? EDGE_L : EDGE_R;
            return (
              <g key={it.at} className={`ix-id-spot${tagged[i] ? ' is-on' : ''}`}>
                {tagged[i] && (
                  <>
                    <g className="ix-id-draw">{DRAW[it.at]}</g>
                    <S d={`M${edge} ${s.y}L${s.p[0]} ${s.p[1]}`} className="ix-id-lead" at={0.15} />
                  </>
                )}
                <circle cx={s.p[0]} cy={s.p[1]} r="4" className="ix-id-pin" style={{ '--i': i }} />
              </g>
            );
          })}
        </svg>
        {items.map((it, i) => {
          const s = SPOTS[it.at];
          if (!s || !tagged[i]) return null;
          const pos = s.side === 'l'
            ? { right: `${100 - (EDGE_L / W) * 100}%`, top: `${(s.y / H) * 100}%` }
            : { left: `${(EDGE_R / W) * 100}%`, top: `${(s.y / H) * 100}%` };
          return (
            <span
              key={it.at}
              ref={(el) => { labelRefs.current[i] = el; }}
              className={`ix-id-label is-${s.side}`}
              style={pos}
            >
              {it.text}
            </span>
          );
        })}
      </div>
    </Frame>
  );
}
