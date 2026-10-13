import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './icons';
import { Frame, Restart, flyTo, onKey, plain, reducedMotion, shake, shuffled, useDone, useFlip } from './shared';

/**
 * Сравнительная таблица как задание (`table` с `game: true`): ячейки пусты,
 * их значения лежат фишками под текущей строкой. Фишку тащат в ячейку или
 * выбирают тапом и тапают по ячейке. Строки заполняются по одной — так
 * сравнение идёт признак за признаком, как и задумано в документе.
 *
 * «Ցույց տալ պատասխանները» дозаполняет таблицу сама: блок учит различать,
 * а не проверяет, и застрять в нём нельзя.
 */
export function TableGame({ block: b, done, onDone, R }) {
  const head = b.head || [];
  const rows = b.rows || [];
  const all = useMemo(() => rows.flatMap((row, r) => row.slice(1).map((_, k) => `${r}:${k + 1}`)), [rows]);
  const [filled, setFilled] = useState(() => new Set(done ? all : []));
  const [order] = useState(() => rows.map((row) => shuffled(row.slice(1).map((_, k) => k + 1))));
  const [sel, setSel] = useState(null);
  const [bad, setBad] = useState(null);
  const [drag, setDrag] = useState(null);
  const dragRef = useRef(null);
  const slotRefs = useRef({});
  const chipRefs = useRef({});
  const rootRef = useRef(null);
  const timers = useRef([]);
  useFlip(rootRef);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const active = rows.findIndex((row, r) => row.slice(1).some((_, k) => !filled.has(`${r}:${k + 1}`)));
  const complete = active === -1;
  useDone(complete, onDone);
  useEffect(() => { setSel(null); }, [active]);

  const land = (key) => setFilled((f) => new Set(f).add(key));

  const place = async (c, slotC, from) => {
    const key = `${active}:${slotC}`;
    if (filled.has(key)) return;
    const chip = chipRefs.current[c];
    if (c !== slotC) {
      shake(chip);
      shake(slotRefs.current[key]);
      setBad(key);
      setTimeout(() => setBad(null), 600);
      return;
    }
    setSel(null);
    await flyTo(chip, slotRefs.current[key], { dx: from?.x || 0, dy: from?.y || 0, scale: 0.7, duration: 360 });
    land(key);
  };

  const revealAll = () => {
    const rest = all.filter((k) => !filled.has(k));
    const gap = reducedMotion() ? 0 : 80;
    rest.forEach((k, i) => timers.current.push(setTimeout(() => land(k), i * gap)));
  };

  // A drag starts after a few pixels; a press without movement is a tap
  // that selects the chip, so both ways work with mouse and finger.
  const down = (c) => (e) => {
    if (e.button > 0) return;
    dragRef.current = { c, x0: e.clientX, y0: e.clientY, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const x = e.clientX - d.x0;
    const y = e.clientY - d.y0;
    if (!d.moved && Math.hypot(x, y) < 6) return;
    d.moved = true;
    setDrag({ c: d.c, x, y });
  };
  const up = (e) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (!d.moved) { setSel((s) => (s === d.c ? null : d.c)); return; }
    const at = { x: e.clientX - d.x0, y: e.clientY - d.y0 };
    const hit = document.elementsFromPoint(e.clientX, e.clientY).find((el) => el.dataset?.slot);
    setDrag(null);
    if (!hit) return;
    const [r, c] = hit.dataset.slot.split(':').map(Number);
    if (r === active) place(d.c, c, at);
  };
  const cancel = () => { dragRef.current = null; setDrag(null); };

  return (
    <Frame
      icon={<Icon name="grid" />}
      title={b.title}
      hint={complete ? null : 'Քարտը քաշեք (կամ ընտրեք, ապա սեղմեք) դատարկ վանդակի վրա։'}
      progress={`${filled.size} / ${all.length}`}
      done={complete}
      tools={complete
        ? <Restart onClick={() => setFilled(new Set())} />
        : <button type="button" className="ix-btn is-ghost" onClick={revealAll}>Ցույց տալ պատասխանները</button>}
    >
      <div className="ix-tg" ref={rootRef} style={{ '--cols': head.length - 1 }}>
        <div className="ix-tg-row is-head" aria-hidden>
          {head.map((h, i) => <div key={i} className="ix-tg-h">{R(h)}</div>)}
        </div>
        {rows.map((row, r) => (
          <Fragment key={r}>
            <div className={`ix-tg-row${r === active ? ' is-active' : ''}${!complete && r > active ? ' is-later' : ''}`}>
              <div className="ix-tg-rh">{R(row[0])}</div>
              {row.slice(1).map((cell, k) => {
                const c = k + 1;
                const key = `${r}:${c}`;
                const on = filled.has(key);
                const open = r === active && !on;
                const armed = open && sel != null;
                return (
                  <div
                    key={c}
                    data-slot={key}
                    ref={(el) => { slotRefs.current[key] = el; }}
                    className={`ix-tg-slot${on ? ' is-filled' : ''}${open ? ' is-open' : ''}${armed ? ' is-armed' : ''}${bad === key ? ' is-wrong' : ''}`}
                    role={armed ? 'button' : undefined}
                    tabIndex={armed ? 0 : undefined}
                    onClick={armed ? () => place(sel, c) : undefined}
                    onKeyDown={armed ? onKey(() => place(sel, c)) : undefined}
                  >
                    <span className="ix-tg-k">{R(head[c])}</span>
                    <span className="ix-tg-v">{on ? R(cell) : open ? '?' : ''}</span>
                  </div>
                );
              })}
            </div>
            {r === active && (
              <div className="ix-tg-tray">
                {order[r].filter((c) => !filled.has(`${r}:${c}`)).map((c) => (
                  <button
                    key={`${r}:${c}`}
                    type="button"
                    data-flip={`${r}:${c}`}
                    ref={(el) => { chipRefs.current[c] = el; }}
                    className={`ix-chip is-drag${sel === c ? ' is-sel' : ''}${drag?.c === c ? ' is-dragging' : ''}`}
                    style={drag?.c === c ? { transform: `translate(${drag.x}px, ${drag.y}px) rotate(-2deg)`, transition: 'none' } : undefined}
                    aria-pressed={sel === c}
                    onPointerDown={down(c)}
                    onPointerMove={move}
                    onPointerUp={up}
                    onPointerCancel={cancel}
                    onKeyDown={onKey(() => setSel((s) => (s === c ? null : c)))}
                  >
                    {R(row[c])}
                  </button>
                ))}
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </Frame>
  );
}

/**
 * `match` — пары: случай слева, правовая основа справа. Выбирают карточку
 * в одной колонке, затем её пару в другой. Найденная пара уезжает наверх
 * строкой таблицы — к концу задания на экране собранная таблица со
 * ссылками на статьи. `tag` — вид ответственности над случаем.
 */
export function Match({ block: b, done, onDone, R }) {
  const pairs = b.pairs || [];
  const n = pairs.length;
  const fresh = () => shuffled(pairs.map((_, i) => i));
  const [rightOrder, setRightOrder] = useState(fresh);
  const [matched, setMatched] = useState(() => (done ? pairs.map((_, i) => i) : []));
  const [selL, setSelL] = useState(null);
  const [selR, setSelR] = useState(null);
  const [bad, setBad] = useState(null);
  const [good, setGood] = useState(null);
  const rootRef = useRef(null);
  useFlip(rootRef);
  const complete = matched.length === n;
  useDone(complete, onDone);

  const check = (l, r) => {
    setSelL(null);
    setSelR(null);
    if (l === r) {
      setGood(l);
      setTimeout(() => {
        setMatched((m) => (m.includes(l) ? m : [...m, l]));
        setGood(null);
      }, reducedMotion() ? 0 : 420);
    } else {
      setBad({ l, r });
      setTimeout(() => setBad(null), 650);
    }
  };
  const pickL = (i) => { if (good != null) return; if (selR != null) check(i, selR); else setSelL((s) => (s === i ? null : i)); };
  const pickR = (i) => { if (good != null) return; if (selL != null) check(selL, i); else setSelR((s) => (s === i ? null : i)); };

  const left = pairs.map((_, i) => i).filter((i) => !matched.includes(i));
  const right = rightOrder.filter((i) => !matched.includes(i));
  const cls = (side, i) => {
    const sel = side === 'l' ? selL : selR;
    return `ix-mcard is-${side}${sel === i ? ' is-sel' : ''}${good === i ? ' is-good' : ''}${bad && bad[side] === i ? ' is-bad' : ''}`;
  };

  return (
    <Frame
      icon={<Icon name="law" />}
      title={b.title}
      hint={complete ? null : 'Ընտրեք քարտ ձախ սյունակից, ապա՝ դրա զույգը աջից։'}
      progress={`${matched.length} / ${n}`}
      done={complete}
      tools={complete ? <Restart onClick={() => { setMatched([]); setRightOrder(fresh()); }} /> : null}
    >
      <div className="ix-match" ref={rootRef}>
        {matched.length > 0 && (
          <div className="ix-match-done">
            {pairs.map((p, i) => (matched.includes(i) ? (
              <div key={`m${i}`} data-flip={`m${i}`} className="ix-match-row">
                <div className="ix-match-l">
                  {p.tag && <span className="ix-match-tag">{p.tag}</span>}
                  <span>{R(p.left)}</span>
                </div>
                <span className="ix-match-join" aria-hidden><Icon name="link" size={14} /></span>
                <div className="ix-match-r">{R(p.right)}</div>
              </div>
            ) : null))}
          </div>
        )}

        {!complete && (
          <div className="ix-match-cols">
            <div className="ix-match-col">
              {b.head && <div className="ix-match-h">{b.head[0]}</div>}
              {left.map((i) => (
                <button key={`l${i}`} data-flip={`l${i}`} type="button" className={cls('l', i)} onClick={() => pickL(i)} aria-pressed={selL === i}>
                  {pairs[i].tag && <span className="ix-match-tag">{pairs[i].tag}</span>}
                  <span>{plain(pairs[i].left)}</span>
                </button>
              ))}
            </div>
            <div className="ix-match-col">
              {b.head && <div className="ix-match-h">{b.head[1]}</div>}
              {right.map((i) => (
                <button key={`r${i}`} data-flip={`r${i}`} type="button" className={cls('r', i)} onClick={() => pickR(i)} aria-pressed={selR === i}>
                  <span className="ix-mcard-ico" aria-hidden><Icon name="law" size={16} /></span>
                  <span>{plain(pairs[i].right)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Frame>
  );
}
