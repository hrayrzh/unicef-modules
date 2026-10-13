import { useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { EASE, Frame, Restart, plain, reducedMotion, useDone } from './shared';

/**
 * `network` — карта связей: в центре тот, кто обращается (ребёнок или
 * педагог), вокруг — к кому. Тап по узлу прокладывает к нему линию, по
 * ней бежит точка, а ниже открывается пункт документа.
 */
export function Network({ block: b, done, onDone, R }) {
  const nodes = b.nodes || [];
  const [open, setOpen] = useState(() => nodes.map(() => !!done));
  const [lines, setLines] = useState([]);
  const rootRef = useRef(null);
  const hubRef = useRef(null);
  const nodeRefs = useRef([]);
  const dotRefs = useRef([]);
  const count = open.filter(Boolean).length;
  const complete = count === nodes.length;
  useDone(complete, onDone);

  // Lines run between the centres of the discs, measured from the layout,
  // so the map reflows freely from phone to desktop.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const measure = () => {
      const r = root.getBoundingClientRect();
      const mid = (el) => {
        const e = el.getBoundingClientRect();
        return { x: e.left + e.width / 2 - r.left, y: e.top + e.height / 2 - r.top };
      };
      const hub = mid(hubRef.current);
      setLines(nodeRefs.current.map((el) => (el ? { a: hub, b: mid(el) } : null)));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  const openNode = (i) => {
    if (open[i]) return;
    setOpen((o) => o.map((v, j) => v || j === i));
    const ln = lines[i];
    const dot = dotRefs.current[i];
    if (ln && dot && !reducedMotion()) {
      dot.animate(
        [
          { transform: `translate(${ln.a.x}px, ${ln.a.y}px) scale(.5)`, opacity: 0 },
          { opacity: 1, offset: 0.15 },
          { transform: `translate(${ln.b.x}px, ${ln.b.y}px) scale(1)`, opacity: 0 },
        ],
        { duration: 760, easing: EASE },
      );
    }
  };

  return (
    <Frame
      icon={<Icon name="route" />}
      title={b.title}
      hint={complete ? null : b.hint}
      progress={`${count} / ${nodes.length}`}
      done={complete}
    >
      <div className="ix-net" ref={rootRef} style={{ '--n': nodes.length }}>
        <svg className="ix-net-lines" aria-hidden>
          {lines.map((ln, i) => (ln ? (
            <g key={i}>
              <line x1={ln.a.x} y1={ln.a.y} x2={ln.b.x} y2={ln.b.y} className="ix-net-base" />
              <line x1={ln.a.x} y1={ln.a.y} x2={ln.b.x} y2={ln.b.y} pathLength="1" className={open[i] ? 'ix-net-on is-on' : 'ix-net-on'} />
            </g>
          ) : null))}
        </svg>
        <div className="ix-net-nodes">
          {nodes.map((nd, i) => (
            <button
              key={i}
              type="button"
              className={`ix-net-node${open[i] ? ' is-open' : ''}`}
              style={{ '--i': i }}
              onClick={() => openNode(i)}
              aria-pressed={open[i]}
              aria-label={plain(nd.label || nd.text)}
            >
              <span className="ix-net-disc" ref={(el) => { nodeRefs.current[i] = el; }}>
                <Icon name={nd.icon} size={26} />
              </span>
              {nd.label && <span className="ix-net-label">{nd.label}</span>}
            </button>
          ))}
        </div>
        <div className="ix-net-hub">
          <span className="ix-net-disc is-hub" ref={hubRef}><Icon name={b.center?.icon || 'child'} size={28} /></span>
          <span className="ix-net-label is-hub">{b.center?.label}</span>
        </div>
        {nodes.map((_, i) => <span key={i} className="ix-net-dot" ref={(el) => { dotRefs.current[i] = el; }} aria-hidden />)}
      </div>

      {count > 0 && (
        <div className="ix-net-cards">
          {nodes.map((nd, i) => (open[i] ? (
            <div key={i} className="ix-net-card">
              <span className="ix-net-card-ico" aria-hidden><Icon name={nd.icon} size={18} /></span>
              <div className="ix-net-card-text">{R(nd.text)}</div>
            </div>
          ) : null))}
        </div>
      )}
    </Frame>
  );
}

/**
 * `timeline` — шаги по одному: «Հաջորդ քայլը» продлевает линию и
 * открывает следующий. Впереди видны пустые точки — сколько ещё осталось.
 */
export function Timeline({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const n = items.length;
  const [shown, setShown] = useState(done ? n : 1);
  const complete = shown >= n;
  useDone(complete, onDone);

  return (
    <Frame
      icon={<Icon name="steps" />}
      title={b.title}
      progress={`${shown} / ${n}`}
      done={complete}
      tools={complete ? <Restart onClick={() => setShown(1)} /> : null}
    >
      <ol className="ix-tl">
        {items.map((t, i) => (
          <li key={i} className={i < shown ? 'ix-tl-item is-on' : 'ix-tl-item is-ghost'} style={{ '--i': i }} aria-hidden={i >= shown}>
            <span className="ix-tl-dot">{i + 1}</span>
            <div className="ix-tl-text">
              {i < shown ? R(t) : <span className="ix-tl-ghost"><span /><span /></span>}
            </div>
          </li>
        ))}
      </ol>
      {!complete && (
        <button type="button" className="ix-btn is-primary ix-tl-next" onClick={() => setShown((s) => s + 1)}>
          Հաջորդ քայլը <Icon name="next" size={14} strokeWidth={2.4} />
        </button>
      )}
    </Frame>
  );
}

/**
 * `lock` — «Գաղտնիության սկզբունքը» под замком. Тап открывает дужку, и
 * правило раскрывается — тот смысл, что информация доступна не всем.
 */
export function Lock({ block: b, done, onDone, R }) {
  const [open, setOpen] = useState(!!done);
  useDone(open, onDone);
  const items = b.items || [];

  return (
    <Frame icon={<Icon name="lock" />} title={b.title} done={open}>
      <div className={`ix-lock${open ? ' is-open' : ''}`}>
        <button type="button" className="ix-lock-btn" onClick={() => setOpen(true)} aria-expanded={open} aria-label={b.title}>
          <svg viewBox="0 0 80 96" className="ix-lock-svg" aria-hidden>
            <path className="ix-lock-shackle" d="M22 46V30a18 18 0 0136 0v16" />
            <rect className="ix-lock-body" x="10" y="44" width="60" height="46" rx="11" />
            <circle className="ix-lock-hole" cx="40" cy="63" r="5.5" />
            <path className="ix-lock-hole" d="M40 67v9" />
          </svg>
        </button>
        {!open && <span className="ix-lock-cue">Սեղմեք կողպեքին</span>}
        <div className="ix-lock-content">
          <div className="ix-lock-inner">
            {b.text && <p className="ix-lock-text">{R(b.text)}</p>}
            <ul className="ix-lock-list">
              {items.map((t, i) => (
                <li key={i} style={{ '--i': i }}>
                  <span className="ix-lock-key" aria-hidden><Icon name="key" size={15} /></span>
                  <span>{R(t)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/**
 * `orb` — «назвать чувство». Тревожный сгусток мечется и горит тёплым;
 * каждое названное слово успокаивает его, уменьшает и остужает до
 * голубого. Это и есть мысль пункта: названная эмоция слабеет. Слова —
 * из того же раздела документа.
 */
export function Orb({ block: b, done, onDone, R }) {
  const words = b.words || [];
  const n = words.length;
  const [named, setNamed] = useState(() => (done ? words.map((_, i) => i) : []));
  const k = n ? named.length / n : 1;
  const complete = named.length === n;
  useDone(complete, onDone);
  const size = Math.round(176 - 84 * k);
  // Named words sit on the diagonals of an ellipse around the orb: a chip is
  // wider than tall, and on a plain circle the side ones landed on the orb.
  const spot = (j) => {
    const a = ((-135 + j * (360 / Math.max(n, 1))) * Math.PI) / 180;
    const r = (size / 2) * 0.75;
    return { x: Math.round(Math.cos(a) * (r + 58)), y: Math.round(Math.sin(a) * (r + 26)) };
  };

  return (
    <Frame
      icon={<Icon name="bubble" />}
      title={b.title}
      hint={complete ? null : 'Անվանեք հույզերը՝ սեղմելով դրանց վրա։'}
      progress={`${named.length} / ${n}`}
      done={complete}
      tools={complete ? <Restart onClick={() => setNamed([])} /> : null}
    >
      <div className="ix-orb-wrap">
        <div className="ix-orb-stage" style={{ '--s': `${size}px`, '--k': k }} aria-hidden>
          <div className="ix-orb-halo" />
          <div className="ix-orb">
            <span className="ix-orb-warm" />
            <span className="ix-orb-cool" />
          </div>
          {named.map((wi, j) => {
            const p = spot(j);
            return (
              <span key={wi} className="ix-orb-word" style={{ transform: `translate(${p.x}px, ${p.y}px)` }}>
                <span>{words[wi]}</span>
              </span>
            );
          })}
        </div>
        <div className="ix-orb-words">
          {words.map((w, i) => {
            const on = named.includes(i);
            return (
              <button
                key={i}
                type="button"
                className={`ix-chip${on ? ' is-done' : ''}`}
                aria-pressed={on}
                onClick={() => { if (!on) setNamed((list) => [...list, i]); }}
              >
                {on && <Icon name="check" size={12} strokeWidth={3} />}
                {w}
              </button>
            );
          })}
        </div>
      </div>
      {b.text && <p className={`ix-orb-cap${complete ? ' is-on' : ''}`}>{R(b.text)}</p>}
    </Frame>
  );
}
