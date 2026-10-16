import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { F, S } from './art';
import { EASE, Frame, onKey, reducedMotion, useDone } from './shared';

/**
 * `identity` — «из чего складывается человек» (5_1.html, «tags»; 5_2.html,
 * «удостоверение»). Абзац определения дословный; примеры в нём — `items`,
 * подчёркнуты. Нажатие на пример отправляет его подписью к фигуре. Фигура
 * сначала серая и безликая, как аватар «без фото»; каждый пример проявляет в
 * цвете свою часть: лицо, голос, рубашку с бейджем, паспорт и телефон в руках,
 * подпись, шаг. Когда отмечены все, из силуэта получается узнаваемый
 * человек — в этом и мысль абзаца.
 *
 * Поля: `title`, `text`, `items[]` из `{text, at}`: `text` — дословный кусок
 * абзаца (ищется по порядку), `at` — ключ места в `SPOTS`.
 */
const HINT = 'Սեղմեք ընդգծված բառերին՝ դրանք մարդու վրա տեսնելու համար։';

// Холст 440×320, фигура по центру (x 220). `p` — точка на фигуре, `y` —
// высота подписи, `side` — с какой стороны подпись. Предметы нарисованы
// между EDGE_L и EDGE_R, подписи — снаружи, поэтому друг друга не закрывают.
const SPOTS = {
  image: { p: [194, 44], y: 46, side: 'l' },
  voice: { p: [264, 60], y: 60, side: 'r' },
  name: { p: [204, 122], y: 118, side: 'l' },
  surname: { p: [236, 128], y: 128, side: 'r' },
  passport: { p: [148, 182], y: 186, side: 'l' },
  phone: { p: [289, 170], y: 168, side: 'r' },
  sign: { p: [301, 238], y: 240, side: 'r' },
  gait: { p: [186, 288], y: 286, side: 'l' },
};
const W = 440;
const H = 320;
const EDGE_L = 132;
const EDGE_R = 308;

// Что проявляется на фигуре для каждого примера: контур рисует себя (S),
// заливка — следом (F).
const DRAW = {
  image: (
    <>
      <F d="M193 61C190 41 203 30 220 30c18 0 29 12 27 29-3-6-8-10-14-12-9 6-23 7-34 3-3 3-5 6-6 11z" className="tone-hair" />
      <S d="M193 61C190 41 203 30 220 30c18 0 29 12 27 29-3-6-8-10-14-12-9 6-23 7-34 3-3 3-5 6-6 11z" />
      <F t="circle" cx="211" cy="62" r="2.6" at={0.3} className="tone-ink" />
      <F t="circle" cx="229" cy="62" r="2.6" at={0.35} className="tone-ink" />
      <F t="circle" cx="205" cy="71" r="4" at={0.5} className="tone-blush" />
      <F t="circle" cx="235" cy="71" r="4" at={0.5} className="tone-blush" />
      <S d="M180 30v-9h9M260 30v-9h-9M180 92v9h9M260 92v9h-9" className="is-accent" at={0.4} />
    </>
  ),
  voice: (
    <>
      <S d="M212 74c5 5 11 5 16 0" className="is-thick" />
      <S d="M254 51a13 13 0 010 18M262 44a24 24 0 010 32" className="is-accent" at={0.3} />
    </>
  ),
  name: (
    <>
      <F t="rect" x="204" y="112" width="32" height="24" rx="4" className="tone-paper" />
      <S t="rect" x="204" y="112" width="32" height="24" rx="4" className="is-accent" />
      <S d="M210 121h20" className="is-thick" at={0.3} />
    </>
  ),
  surname: <S d="M210 129h13" className="is-thick" />,
  passport: (
    <>
      <F t="rect" x="148" y="166" width="25" height="33" rx="3" className="tone-navy" />
      <S t="rect" x="148" y="166" width="25" height="33" rx="3" />
      <S t="circle" cx="160.5" cy="178" r="4.5" className="is-gold" at={0.3} />
      <S d="M154 188h13" className="is-gold" at={0.4} />
      <F t="circle" cx="162" cy="202" r="8" className="tone-skin" at={0.2} />
      <S t="circle" cx="162" cy="202" r="8" at={0.1} />
    </>
  ),
  phone: (
    <>
      <F t="rect" x="270" y="156" width="19" height="32" rx="4" className="tone-ink" />
      <F t="rect" x="273" y="160" width="13" height="21" rx="2" className="tone-screen" at={0.3} />
      <S t="rect" x="270" y="156" width="19" height="32" rx="4" />
      <F t="circle" cx="279" cy="186" r="8" className="tone-skin" at={0.2} />
      <S t="circle" cx="279" cy="186" r="8" at={0.1} />
    </>
  ),
  sign: (
    <>
      <F t="rect" x="249" y="222" width="52" height="34" rx="3" className="tone-paper" />
      <S t="rect" x="249" y="222" width="52" height="34" rx="3" />
      <S d="M256 245c5-12 9 6 13-3s7 5 11-4 6 4 12-2" className="is-accent is-thick" at={0.3} />
      <S d="M256 250h36" className="is-soft" at={0.5} />
    </>
  ),
  gait: <S d="M176 238h-20M180 254h-28M176 270h-18" className="is-accent" at={0.3} />,
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
  const on = (at) => complete || tagged[items.findIndex((it) => it.at === at)];

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
          {/* Фигура: части серые, пока их пример не отмечен (или пока не
              отмечены все). Руки и ноги — «трубки»: тёмный штрих под цветным. */}
          <ellipse className="ix-id-shadow" cx="220" cy="292" rx="66" ry="6" />
          <g className={`ix-id-leg is-l${on('gait') ? ' is-on is-step' : ''}`}>
            <path className="ix-id-tube-o" d="M208 186v92" />
            <path className="ix-id-tube is-pants" d="M208 186v92" />
            <path className="ix-id-shoe" d="M210 274h-19a7 7 0 000 14h19z" />
          </g>
          <g className={`ix-id-leg is-r${on('gait') ? ' is-on is-step' : ''}`}>
            <path className="ix-id-tube-o" d="M232 186v92" />
            <path className="ix-id-tube is-pants" d="M232 186v92" />
            <path className="ix-id-shoe" d="M230 274h19a7 7 0 010 14h-19z" />
          </g>
          <g className={`ix-id-arm${on('name') ? ' is-on' : ''}`}>
            <path className="ix-id-tube-o" d="M190 112c-14 22-24 50-28 84" />
            <path className="ix-id-tube is-shirt" d="M190 112c-14 22-24 50-28 84" />
            <path className="ix-id-tube-o" d="M250 112c14 20 24 44 29 72" />
            <path className="ix-id-tube is-shirt" d="M250 112c14 20 24 44 29 72" />
          </g>
          <rect className={`ix-id-part is-skin${on('image') ? ' is-on' : ''}`} x="212" y="80" width="16" height="16" rx="4" />
          <path className={`ix-id-part is-shirt${on('name') ? ' is-on' : ''}`} d="M184 106c10-9 23-14 36-14s26 5 36 14l-10 82h-52z" />
          <circle className="ix-id-part is-skin" cx="162" cy="202" r="8" />
          <circle className="ix-id-part is-skin" cx="279" cy="186" r="8" />
          <circle className={`ix-id-part is-skin${on('image') ? ' is-on' : ''}`} cx="220" cy="60" r="27" />
          {!on('image') && <text x="220" y="70" className="ix-id-q">?</text>}
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
