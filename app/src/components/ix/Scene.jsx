import { useState } from 'react';
import { Icon } from './icons';
import { Frame, onKey, useDone } from './shared';

/**
 * `scene` — «Երբ նկատում եք ընթացող կոնֆլիկտ կամ բուլինգ»: школьный
 * коридор и шесть шагов педагога. Выбранный шаг разыгрывается на сцене:
 * педагог подходит ближе, уводит ребёнка от чужих глаз, слушает, коротко
 * и ровно говорит с зачинщиком, применяет соразмерные последствия.
 *
 * Сцена липнет к верху экрана, пока читаешь шаги под ней, — тап по шагу
 * в конце списка не уводит картинку за край.
 */

// Где стоят фигуры и что видно на каждом шаге. -1 — до первого тапа.
function frame(k) {
  const aside = k === 1 || k === 2;
  return {
    teacher: k < 0 ? 488 : aside ? 470 : 318,
    target: aside ? 408 : 196,
    crowd: aside ? { x: -26, o: 0.18 } : { x: 0, o: 1 },
    bully: aside ? 0.3 : 1,
    taunt: k <= 0,
    distance: k < 0,
    zone: aside,
    listen: k === 2,
    say: k === 3,
    calm: k === 4,
    fair: k === 5,
  };
}

// Flat, friendly figures: a head and a rounded body, feet on the floor line.
function Fig({ x, h = 1, tone, className = '', style }) {
  return (
    <g className={`ix-fig tone-${tone} ${className}`} style={{ transform: `translateX(${x}px)`, ...style }}>
      <circle cx="0" cy={222 - 104 * h} r={17 * h} />
      <path d={`M${-24 * h} 222V${222 - 56 * h}a${24 * h} ${24 * h} 0 01${48 * h} 0V222z`} />
    </g>
  );
}

export function Scene({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const [at, setAt] = useState(-1);
  const [seen, setSeen] = useState(() => new Set(done ? items.map((_, i) => i) : []));
  const complete = seen.size === items.length;
  useDone(complete, onDone);
  const pick = (i) => { setAt(i); setSeen((s) => (s.has(i) ? s : new Set(s).add(i))); };
  const f = frame(at);

  return (
    <Frame icon={<Icon name="scene" />} title={b.title} progress={`${seen.size} / ${items.length}`} done={complete}>
      <div className="ix-scene">
        <div className="ix-scene-stage">
          <svg viewBox="0 0 560 250" className="ix-scene-svg" aria-hidden>
            {/* corridor */}
            <rect x="0" y="0" width="560" height="222" className="ix-sc-wall" />
            <rect x="34" y="40" width="74" height="96" rx="6" className="ix-sc-win" />
            <rect x="440" y="40" width="74" height="96" rx="6" className="ix-sc-win" />
            <path d="M0 222h560" className="ix-sc-floor" />

            {/* distance the reprimand must not be shouted across */}
            <g className={`ix-sc-fade${f.distance ? ' is-on' : ''}`}>
              <path d="M290 240h168M290 234v12M458 234v12" className="ix-sc-measure" />
              <text x="374" y="236" textAnchor="middle" className="ix-sc-label">5–6 մ</text>
            </g>

            {/* privacy zone around the child and the teacher */}
            <ellipse cx="440" cy="168" rx="92" ry="70" className={`ix-sc-zone ix-sc-fade${f.zone ? ' is-on' : ''}`} />

            {/* onlookers */}
            <g className="ix-sc-move" style={{ transform: `translateX(${f.crowd.x}px)`, opacity: f.crowd.o }}>
              <Fig x={62} h={0.78} tone="crowd" />
              <Fig x={112} h={0.74} tone="crowd" />
            </g>

            <Fig x={f.target} h={0.76} tone="target" className="ix-sc-move" />
            <Fig x={258} h={0.8} tone="bully" className={`ix-sc-move${f.calm || f.fair ? ' is-down' : ''}`} style={{ opacity: f.bully }} />
            <Fig x={f.teacher} h={1} tone="teacher" className="ix-sc-move is-walk" />

            {/* the bully's jab at the target */}
            <g className={`ix-sc-pop${f.taunt ? ' is-on' : ''}`}>
              <path d="M218 72h52l8-8 4 8h12v28h-30l-10 10v-10h-36z" className="ix-sc-bubble is-alert" />
              <path d="M226 86l8-6 8 10 8-10 8 6 8-6" className="ix-sc-ink is-alert" />
            </g>

            {/* the child tells, the teacher listens */}
            <g className={`ix-sc-pop${f.listen ? ' is-on' : ''}`}>
              <path d="M360 70h76a12 12 0 0112 12v14a12 12 0 01-12 12h-44l-14 12 2-12h-20a12 12 0 01-12-12V82a12 12 0 0112-12z" className="ix-sc-bubble" />
              <circle cx="384" cy="89" r="4" className="ix-sc-dotty" style={{ '--i': 0 }} />
              <circle cx="398" cy="89" r="4" className="ix-sc-dotty" style={{ '--i': 1 }} />
              <circle cx="412" cy="89" r="4" className="ix-sc-dotty" style={{ '--i': 2 }} />
              <path d="M500 92a10 10 0 010 16M507 86a18 18 0 010 28" className="ix-sc-ink is-accent" />
            </g>

            {/* one short, concrete sentence */}
            <g className={`ix-sc-pop${f.say ? ' is-on' : ''}`}>
              <path d="M300 38h70a12 12 0 0112 12v12a12 12 0 01-12 12h-36l-6 12-8-12h-20a12 12 0 01-12-12V50a12 12 0 0112-12z" className="ix-sc-bubble is-teacher" />
              <path d="M304 56h44" className="ix-sc-ink is-thick" />
              <path d="M362 48v9M362 64v.5" className="ix-sc-ink is-thick" />
            </g>

            {/* firm, without raising the voice — the line goes flat */}
            <g className={`ix-sc-pop${f.calm ? ' is-on' : ''}`}>
              <path d="M300 38h70a12 12 0 0112 12v12a12 12 0 01-12 12h-36l-6 12-8-12h-20a12 12 0 01-12-12V50a12 12 0 0112-12z" className="ix-sc-bubble is-teacher" />
              <path d="M306 56c6-10 10 10 16 0s10 10 16 0 10 10 16 0" className="ix-sc-ink ix-sc-calm" />
              <path d="M306 56h48" className="ix-sc-ink is-accent ix-sc-flat" />
            </g>

            {/* fair, proportionate consequences */}
            <g className={`ix-sc-pop${f.fair ? ' is-on' : ''}`}>
              <g className="ix-sc-scale">
                <path d="M288 30v52M268 82h40M256 42h64" className="ix-sc-ink is-thick" />
                <path d="M256 42l-12 22h24zM320 42l-12 22h24z" className="ix-sc-ink" />
                <path d="M244 64a12 7 0 0024 0M308 64a12 7 0 0024 0" className="ix-sc-ink is-accent" />
              </g>
            </g>
          </svg>
          {at >= 0 && <div className="ix-scene-badge" key={at}>{at + 1}</div>}
        </div>

        <ol className="ix-scene-steps">
          {items.map((t, i) => (
            <li
              key={i}
              className={`ix-scene-step${i === at ? ' is-on' : ''}${seen.has(i) ? ' is-seen' : ''}`}
              style={{ '--i': i }}
              role="button"
              tabIndex={0}
              aria-pressed={i === at}
              onClick={() => pick(i)}
              onKeyDown={onKey(() => pick(i))}
            >
              <span className="ix-scene-n">{seen.has(i) && i !== at ? <Icon name="check" size={13} strokeWidth={3} /> : i + 1}</span>
              <span className="ix-scene-t">{R(t)}</span>
            </li>
          ))}
        </ol>
      </div>
    </Frame>
  );
}
