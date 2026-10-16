import { Fragment, useId, useLayoutEffect, useRef, useState } from 'react';
import person from '../../assets/m5-person.webp';
import { Icon } from './icons';
import { F, S } from './art';
import { EASE, Frame, onKey, reducedMotion, useDone } from './shared';

/**
 * `identity` — «из чего складывается человек» (5_1.html, «tags»; 5_2.html,
 * «удостоверение»). Абзац определения дословный; примеры в нём — `items`,
 * подчёркнуты. Нажатие на пример отправляет его подписью к фигуре.
 *
 * Фигура — иллюстрация (`assets/m5-person.webp`, сделана генератором
 * изображений; пол персонажа нарочно не угадывается — просьба Армана). Снизу
 * лежит её серая размытая копия — человек «не в фокусе», безликий. Каждый
 * пример проявляет резкой и цветной свою часть (маска поверх цветной копии):
 * лицо, рот, бейдж, футболку, руку с паспортом, руку с телефоном, ноги; плюс
 * штрихи поверх — рамка камеры, звук, лист с подписью, линии шага. Когда
 * отмечены все, человек виден целиком — в этом и мысль абзаца.
 *
 * Поля: `title`, `text`, `items[]` из `{text, at}`: `text` — дословный кусок
 * абзаца (ищется по порядку), `at` — ключ места в `SPOTS`. Координаты мест
 * привязаны к картинке: при её замене их надо снять заново.
 */
const HINT = 'Սեղմեք ընդգծված բառերին՝ դրանք մարդու վրա տեսնելու համար։';

// Холст 440×320, иллюстрация по центру (IMG). `p` — точка на фигуре, `y` —
// высота подписи, `side` — с какой стороны подпись; `area` — что проявляется
// в цвете (эллипс с мягким краем), координаты холста.
const SPOTS = {
  image: { p: [170, 40], y: 34, side: 'l', area: [218, 40, 47, 42] },
  voice: { p: [266, 58], y: 58, side: 'r', area: [218, 58, 15, 10] },
  name: { p: [228, 96], y: 84, side: 'l', area: [234, 97, 16, 12] },
  surname: { p: [200, 146], y: 168, side: 'l', area: [220, 124, 50, 56] },
  passport: { p: [163, 112], y: 122, side: 'l', area: [175, 115, 27, 29] },
  phone: { p: [284, 104], y: 104, side: 'r', area: [270, 106, 26, 31] },
  sign: { p: [308, 237], y: 237, side: 'r' },
  gait: { p: [200, 294], y: 290, side: 'l', area: [220, 236, 45, 80] },
};
const W = 440;
const H = 320;
const EDGE_L = 132;
const EDGE_R = 308;
// Где лежит картинка (682×1024) на холсте: фигура по высоте холста.
const IMG = { x: 118.7, y: 8, w: 202.7, h: 304 };

// Штрихи поверх иллюстрации: контур рисует себя (S), заливка — следом (F).
const DRAW = {
  image: <S d="M160 18v-10h10M276 18v-10h-10M160 66v10h10M276 66v10h-10" className="is-accent" />,
  voice: <S d="M255 50a11 11 0 010 16M262 44a20 20 0 010 28" className="is-accent" />,
  sign: (
    <>
      <F t="rect" x="256" y="220" width="52" height="34" rx="3" className="tone-paper" />
      <S t="rect" x="256" y="220" width="52" height="34" rx="3" className="is-thin" />
      <S d="M263 243c5-12 9 6 13-3s7 5 11-4 6 4 12-2" className="is-accent is-thick" at={0.3} />
      <S d="M263 248h36" className="is-soft" at={0.5} />
    </>
  ),
  gait: <S d="M184 236h-20M188 252h-28M184 268h-18" className="is-accent" at={0.3} />,
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
  const uid = useId().replace(/:/g, '');
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
          <defs>
            <filter id={`${uid}g`} x="-15%" y="-15%" width="130%" height="130%">
              <feColorMatrix type="saturate" values="0" />
              <feGaussianBlur stdDeviation="3.2" />
            </filter>
            <radialGradient id={`${uid}r`}>
              <stop offset="0.6" stopColor="#fff" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id={`${uid}m`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
              <rect width={W} height={H} fill="#000" />
              {items.map((it, i) => {
                const a = SPOTS[it.at]?.area;
                return a && on(it.at) ? (
                  <ellipse key={it.at} className="ix-id-hole" cx={a[0]} cy={a[1]} rx={a[2]} ry={a[3]} fill={`url(#${uid}r)`} style={{ '--i': i }} />
                ) : null;
              })}
              <rect className="ix-id-all" width={W} height={H} fill="#fff" />
            </mask>
          </defs>
          <ellipse className="ix-id-shadow" cx="220" cy="304" rx="58" ry="6" />
          <image className="ix-id-ghost" href={person} x={IMG.x} y={IMG.y} width={IMG.w} height={IMG.h} filter={`url(#${uid}g)`} />
          <image href={person} x={IMG.x} y={IMG.y} width={IMG.w} height={IMG.h} mask={`url(#${uid}m)`} />
          {items.map((it, i) => {
            const s = SPOTS[it.at];
            if (!s) return null;
            const edge = s.side === 'l' ? EDGE_L : EDGE_R;
            return (
              <g key={it.at} className={`ix-id-spot${tagged[i] ? ' is-on' : ''}`}>
                {tagged[i] && (
                  <>
                    {DRAW[it.at] && <g className="ix-id-draw">{DRAW[it.at]}</g>}
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
