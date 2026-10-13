import { useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { EASE, Frame, Restart, bump, flyTo, reducedMotion, shake, shuffled, useDone } from './shared';

const TONE_ICON = { do: 'check', dont: 'close' };

/**
 * `sort` — карточки по одной, их раскладывают в две корзины: свайпом в
 * сторону корзины, кнопкой или клавишами ←/→. Корзины стоят слева и справа,
 * поэтому порядок в `bins` — это и есть стороны: [левая, правая].
 *
 * Ошибка не наказывается: карточка качает головой, а верная корзина
 * подсвечивается — задача научить, а не поймать. Когда всё разложено,
 * блок превращается в обычные два списка в порядке документа.
 *
 * `quote: true` — карточки-реплики («что сказать / что не говорить»).
 */
export function Sort({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const bins = b.bins || [];
  const fresh = () => shuffled(items.map((_, i) => i));
  const [queue, setQueue] = useState(() => (done ? [] : fresh()));
  const [dx, setDx] = useState(0);
  const [wrong, setWrong] = useState(null);
  const [hint, setHint] = useState(null);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef(null);
  const binRefs = useRef([]);
  const drag = useRef(null);
  const complete = queue.length === 0;
  useDone(complete, onDone);

  const top = queue[0];

  // The stack is as tall as the card on top. A fixed height sized for the
  // longest card left a short quote floating in a 600px box on a phone; the
  // height now eases to each new card instead.
  const stageRef = useRef(null);
  const lastH = useRef(null);
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) { lastH.current = null; return; }
    const h = el.offsetHeight;
    if (lastH.current != null && lastH.current !== h && !reducedMotion()) {
      el.animate([{ height: `${lastH.current}px` }, { height: `${h}px` }], { duration: 380, easing: EASE });
    }
    lastH.current = h;
  }, [top]);

  const total = (bi) => items.filter((it) => it.bin === bi).length;
  const placed = (bi) => items.filter((it, i) => it.bin === bi && !queue.includes(i)).length;

  const choose = async (bi, fromDx = 0) => {
    if (busy || top === undefined) return;
    if (items[top].bin !== bi) {
      setDx(0);
      shake(cardRef.current);
      setWrong(bi);
      setHint(items[top].bin);
      setTimeout(() => setWrong(null), 650);
      return;
    }
    setBusy(true);
    setHint(null);
    await flyTo(cardRef.current, binRefs.current[bi], { dx: fromDx, rot: fromDx / 24 });
    bump(binRefs.current[bi]);
    setDx(0);
    setQueue((q) => q.slice(1));
    setBusy(false);
  };

  const down = (e) => {
    if (busy || e.button > 0) return;
    drag.current = { x: e.clientX };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => { if (drag.current) setDx(e.clientX - drag.current.x); };
  const up = () => {
    if (!drag.current) return;
    drag.current = null;
    if (dx < -90) choose(0, dx);
    else if (dx > 90) choose(1, dx);
    else setDx(0);
  };
  const keys = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); choose(0); }
    if (e.key === 'ArrowRight') { e.preventDefault(); choose(1); }
  };

  const lean = dx < -40 ? 0 : dx > 40 ? 1 : null;
  const tone = (bi) => bins[bi]?.tone || (bi === 0 ? 'amber' : 'cyan');
  const icon = (bi) => TONE_ICON[tone(bi)] || (bi === 0 ? 'prev' : 'next');
  const cardClass = `ix-sort-card${b.quote ? ' is-quote' : ''}`;

  return (
    <Frame
      icon={<Icon name={b.quote ? 'quote' : 'sort'} />}
      title={b.title || 'Դասակարգեք'}
      hint={complete ? null : 'Քարտը քաշեք աջ կամ ձախ, կամ օգտվեք կոճակներից։'}
      progress={`${items.length - queue.length} / ${items.length}`}
      done={complete}
      tools={complete ? <Restart onClick={() => setQueue(fresh())} /> : null}
    >
      {!complete && (
        <div className="ix-sort">
          <div className="ix-sort-stage" ref={stageRef}>
            {queue.slice(0, 3).map((idx, pos) => (
              <div
                key={idx}
                ref={pos === 0 ? cardRef : null}
                className={`${cardClass} is-p${pos}`}
                style={pos === 0 && dx ? { transform: `translateX(${dx}px) rotate(${dx / 24}deg)`, transition: 'none' } : undefined}
                tabIndex={pos === 0 ? 0 : -1}
                aria-hidden={pos !== 0}
                onPointerDown={pos === 0 ? down : undefined}
                onPointerMove={pos === 0 ? move : undefined}
                onPointerUp={pos === 0 ? up : undefined}
                onPointerCancel={pos === 0 ? () => { drag.current = null; setDx(0); } : undefined}
                onKeyDown={pos === 0 ? keys : undefined}
              >
                <div className="ix-sort-text">{R(items[idx].text)}</div>
                {pos === 0 && [0, 1].map((bi) => (
                  <span
                    key={bi}
                    className={`ix-stamp tone-${tone(bi)} is-${bi === 0 ? 'l' : 'r'}`}
                    style={{ opacity: Math.min(1, Math.max(0, (bi === 0 ? -dx : dx) / 90)) }}
                    aria-hidden
                  >
                    <Icon name={icon(bi)} size={20} strokeWidth={2.6} />
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div className="ix-bins">
            {bins.map((bin, bi) => (
              <button
                key={bi}
                type="button"
                ref={(el) => { binRefs.current[bi] = el; }}
                className={`ix-bin tone-${tone(bi)}${lean === bi ? ' is-lean' : ''}${wrong === bi ? ' is-wrong' : ''}${hint === bi ? ' is-hint' : ''}`}
                onClick={() => choose(bi)}
              >
                <span className="ix-bin-ico" aria-hidden><Icon name={icon(bi)} size={16} strokeWidth={2.4} /></span>
                <span className="ix-bin-label">{bin.label}</span>
                <span className="ix-bin-count">{placed(bi)} / {total(bi)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {complete && (
        <div className="ix-sort-result">
          {bins.map((bin, bi) => (
            <div key={bi} className={`ix-sort-col tone-${tone(bi)}`} style={{ '--i': bi }}>
              <div className="ix-sort-col-h">
                <span className="ix-bin-ico" aria-hidden><Icon name={icon(bi)} size={14} strokeWidth={2.6} /></span>
                {bin.label}
              </div>
              <div className="ix-sort-col-list">
                {items.map((it, i) => (it.bin === bi ? (
                  <div key={i} className={b.quote ? 'ix-sort-item is-quote' : 'ix-sort-item'} style={{ '--i': i }}>
                    <span className="ix-sort-dot" aria-hidden />
                    <span>{R(it.text)}</span>
                  </div>
                ) : null))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Frame>
  );
}
