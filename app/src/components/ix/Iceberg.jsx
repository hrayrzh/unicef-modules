import { Fragment, useId, useState } from 'react';
import { Icon } from './icons';
import { Frame, useDone } from './shared';

/**
 * `iceberg` — «айсберг» из 5_1.html: над водой видна верхушка — активный
 * след (то, что ребёнок публикует сам), под водой в темноте — огромная
 * пассивная часть (что собирают платформы). Нажатие на верхушку или на
 * воду открывает часть: подпись получает слова документа, а в абзаце над
 * сценой подсвечивается то же место. Абзац — дословный, в нём ничего не
 * меняется. Блок пройден, когда открыты обе части.
 *
 * Поля: `text` — абзац целиком; `top` и `deep` — `{label, text}`: слово из
 * абзаца и пояснение в скобках после него, тоже дословно.
 */
const HINT = 'Սեղմեք սառցալեռի ջրից վեր և ջրի տակ գտնվող մասերին։';

/** Абзац на куски: найденные места помечены номером части, порядок — как в тексте. */
function split(text = '', marks) {
  const out = [];
  let at = 0;
  marks.forEach((m, k) => {
    const i = m ? text.indexOf(m, at) : -1;
    if (i < 0) return;
    if (i > at) out.push({ t: text.slice(at, i) });
    out.push({ t: m, k });
    at = i + m.length;
  });
  if (at < text.length) out.push({ t: text.slice(at) });
  return out;
}
const whole = (x) => (x.label && x.text ? `${x.label} (${x.text})` : x.text);

// Значки-примеры: над водой — то, что публикуют; в воде — то, что собирают.
const UP = [
  { icon: 'heart', x: 30, y: 9 },
  { icon: 'msg', x: 19, y: 21 },
  { icon: 'photo', x: 31, y: 29 },
];
const DOWN = [
  { icon: 'pin', x: 11, y: 56 },
  { icon: 'eye', x: 9, y: 80 },
  { icon: 'link', x: 89, y: 56 },
  { icon: 'phone', x: 91, y: 80 },
];

export function Iceberg({ block: b, done, onDone, R }) {
  const top = b.top || {};
  const deep = b.deep || {};
  const uid = useId().replace(/:/g, '');
  const [seen, setSeen] = useState(done ? 3 : 0);
  const complete = seen === 3;
  useDone(complete, onDone);
  const show = (bit) => setSeen((s) => s | bit);
  const hasTop = !!(seen & 1);
  const hasDeep = !!(seen & 2);
  const parts = split(b.text, [whole(top), whole(deep)]);

  return (
    <Frame icon={<Icon name="iceberg" />} title={b.title} hint={complete ? null : HINT} progress={`${(hasTop ? 1 : 0) + (hasDeep ? 1 : 0)} / 2`} done={complete}>
      {b.text && (
        <p className="ix-text">
          {parts.map((p, i) => (p.k == null ? (
            <Fragment key={i}>{R(p.t)}</Fragment>
          ) : (
            <mark key={i} className={`ix-ice-mark is-${p.k ? 'deep' : 'top'}${seen & (1 << p.k) ? ' is-on' : ''}`}>{R(p.t)}</mark>
          )))}
        </p>
      )}

      <div className={`ix-ice${hasTop ? ' has-top' : ''}${hasDeep ? ' has-deep' : ''}`}>
        <svg viewBox="0 0 600 380" className="ix-ice-svg" aria-hidden>
          <defs>
            <linearGradient id={`${uid}sky`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F8FCFE" />
              <stop offset="1" stopColor="#DDF1FA" />
            </linearGradient>
            <linearGradient id={`${uid}sea`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1D8EC0" />
              <stop offset="1" stopColor="#0A3F5E" />
            </linearGradient>
          </defs>
          <rect width="600" height="141" fill={`url(#${uid}sky)`} onClick={() => show(1)} />
          <g className="ix-ice-under" onClick={() => show(2)}>
            <rect y="140" width="600" height="240" fill={`url(#${uid}sea)`} />
            <g className="ix-ice-rays">
              <path d="M150 140h60L120 380H20z" />
              <path d="M330 140h40l40 240h-90z" />
              <path d="M470 140h50l60 240h-70z" />
            </g>
            <g className="ix-ice-deep">
              <path className="ix-ice-ice" d="M232 140L196 176 150 214 128 268 158 330 232 362 320 372 412 350 466 296 470 236 432 186 376 140z" />
              <path className="ix-ice-facet" d="M376 140L432 186 470 236 466 296 412 350 340 292 330 200z" />
              <path className="ix-ice-facet is-soft" d="M232 140L196 176 150 214 128 268 200 250 260 190z" />
            </g>
            <rect className="ix-ice-murk" y="140" width="600" height="240" />
          </g>
          <path className="ix-ice-line" d="M0 141c25-6 50 6 75 0s50 6 75 0 50 6 75 0 50 6 75 0 50 6 75 0 50 6 75 0 50 6 75 0 50 6 75 0" />
          <g className="ix-ice-tip" onClick={() => show(1)}>
            <path className="ix-ice-ice" d="M232 141L262 92 280 104 300 34 326 82 342 72 376 141z" />
            <path className="ix-ice-facet" d="M300 34L326 82 342 72 376 141 318 141 306 90z" />
          </g>
        </svg>

        {UP.map((s, i) => (
          <span key={s.icon} className="ix-ice-bit is-up" style={{ left: `${s.x}%`, top: `${s.y}%`, '--i': i }} aria-hidden>
            <Icon name={s.icon} size={16} />
          </span>
        ))}
        {DOWN.map((s, i) => (
          <span key={s.icon} className="ix-ice-bit is-down" style={{ left: `${s.x}%`, top: `${s.y}%`, '--i': i }} aria-hidden>
            <Icon name={s.icon} size={16} />
          </span>
        ))}

        <button type="button" className={`ix-ice-tag is-top${hasTop ? ' is-on' : ''}`} onClick={() => show(1)} aria-expanded={hasTop}>
          <span className="ix-ice-tag-h">
            {hasTop ? <Icon name="check" size={12} strokeWidth={3.2} /> : <Icon name="plus" size={12} strokeWidth={3} />}
            {top.label}
          </span>
          {hasTop && <span className="ix-ice-tag-t">{R(top.text)}</span>}
        </button>
        <button type="button" className={`ix-ice-tag is-deep${hasDeep ? ' is-on' : ''}`} onClick={() => show(2)} aria-expanded={hasDeep}>
          <span className="ix-ice-tag-h">
            {hasDeep ? <Icon name="check" size={12} strokeWidth={3.2} /> : <Icon name="plus" size={12} strokeWidth={3} />}
            {deep.label}
          </span>
          {hasDeep && <span className="ix-ice-tag-t">{R(deep.text)}</span>}
        </button>
      </div>
    </Frame>
  );
}
