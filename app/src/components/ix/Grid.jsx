import { useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { Frame, Restart, flyTo, plain, reducedMotion, shake, shuffled, useDone, useFlip } from './shared';

/**
 * Сравнительная таблица как задание (`table` с `game: true`) — в духе
 * «Դասակարգեք»: в центре одна карточка «признак: значение», под ней
 * колонки таблицы. Карточку отправляют в её колонку тапом (или клавишей
 * 1…N). Признаки идут по порядку, значения одного признака — подряд, так
 * что сравнение идёт строка за строкой, как в документе. Ошибка не
 * наказывается: карточка качает головой, верная колонка подсвечивается.
 * В конце — обычная сравнительная таблица.
 *
 * Первая версия — сетка с пустыми клетками и фишками — была неудобной
 * (Арман, 2026-10-13); эта повторяет понравившийся `sort`.
 */
const TG_TONES = ['cyan', 'amber', 'dont', 'violet'];

export function TableGame({ block: b, done, onDone, R }) {
  const head = b.head || [];
  const rows = b.rows || [];
  const cols = head.length - 1;
  // Карточки: строка за строкой, внутри строки — вперемешку.
  const [cards] = useState(() => rows.flatMap((row, r) => shuffled(row.slice(1).map((text, k) => ({ r, c: k + 1, text })))));
  const fresh = () => cards.map((_, i) => i);
  const [queue, setQueue] = useState(() => (done ? [] : fresh()));
  const [wrong, setWrong] = useState(null);
  const [hint, setHint] = useState(null);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef(null);
  const binRefs = useRef([]);
  const complete = queue.length === 0;
  useDone(complete, onDone);

  const top = queue[0];
  const placed = (c) => cards.filter((x, i) => x.c === c && !queue.includes(i));

  // Стопка по высоте верхней карточки, как у `sort`.
  const stageRef = useRef(null);
  const lastH = useRef(null);
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) { lastH.current = null; return; }
    const h = el.offsetHeight;
    if (lastH.current != null && lastH.current !== h && !reducedMotion()) {
      el.animate([{ height: `${lastH.current}px` }, { height: `${h}px` }], { duration: 360, easing: 'cubic-bezier(.2,.85,.2,1)' });
    }
    lastH.current = h;
  }, [top]);

  const choose = async (c) => {
    if (busy || top === undefined) return;
    if (cards[top].c !== c) {
      shake(cardRef.current);
      setWrong(c);
      setHint(cards[top].c);
      setTimeout(() => setWrong(null), 650);
      return;
    }
    setBusy(true);
    setHint(null);
    await flyTo(cardRef.current, binRefs.current[c], { scale: 0.3 });
    setQueue((q) => q.slice(1));
    setBusy(false);
  };
  const keys = (e) => {
    const k = Number(e.key);
    if (k >= 1 && k <= cols) { e.preventDefault(); choose(k); }
  };

  return (
    <Frame
      icon={<Icon name="grid" />}
      title={b.title}
      hint={complete ? null : 'Քարտը սահում է դեպի ձեզ. կարդացեք այն և նետեք այն խմբի մեջ, որին պատկանում է՝ սեղմելով գույնով տուփը։'}
      progress={`${cards.length - queue.length} / ${cards.length}`}
      done={complete}
      tools={complete ? <Restart onClick={() => setQueue(fresh())} /> : null}
    >
      {!complete && (
        <div className="ix-tgx" style={{ '--cols': cols }}>
          <div className="ix-sort-stage ix-tgx-stage" ref={stageRef}>
            {queue.slice(0, 3).map((idx, pos) => (
              <div
                key={idx}
                ref={pos === 0 ? cardRef : null}
                className={`ix-sort-card ix-tgx-card is-p${pos}`}
                tabIndex={pos === 0 ? 0 : -1}
                aria-hidden={pos !== 0}
                onKeyDown={pos === 0 ? keys : undefined}
              >
                <div className="ix-sort-text">
                  <span className="ix-tgx-kicker">{plain(rows[cards[idx].r][0])}</span>
                  <span className="ix-tgx-value">{R(cards[idx].text)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="ix-tgx-bins">
            {head.slice(1).map((h, k) => {
              const c = k + 1;
              const tone = TG_TONES[k % TG_TONES.length];
              const got = placed(c);
              return (
                <div key={c} className="ix-tgx-col">
                  <button
                    type="button"
                    ref={(el) => { binRefs.current[c] = el; }}
                    className={`ix-bin tone-${tone}${wrong === c ? ' is-wrong' : ''}${hint === c ? ' is-hint' : ''}`}
                    onClick={() => choose(c)}
                  >
                    <span className="ix-bin-ico ix-tgx-n" aria-hidden>{c}</span>
                    <span className="ix-bin-label">{plain(h)}</span>
                    <span className="ix-bin-count">{got.length} / {rows.length}</span>
                  </button>
                  {got.length > 0 && (
                    <div className={`ix-tgx-list tone-${tone}`}>
                      {got.map((x) => (
                        <div key={`${x.r}:${x.c}`} className="ix-tgx-got">
                          <span className="ix-tgx-kicker">{plain(rows[x.r][0])}</span>
                          <span>{R(x.text)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {complete && (
        <div className="ix-tgx-result">
          <table className="ms-cmp">
            <thead>
              <tr>{head.map((h, i) => <th key={i} scope="col">{R(h)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ '--i': ri }}>
                  {row.map((cell, ci) => (ci === 0 ? <th key={ci} scope="row">{R(cell)}</th> : <td key={ci}>{R(cell)}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="ms-cmp-cards">
            {rows.map((row, ri) => (
              <div key={ri} className="ms-cmp-card">
                <div className="ms-cmp-card-h">{R(row[0])}</div>
                {row.slice(1).map((cell, ci) => (
                  <div key={ci} className="ms-cmp-card-row">
                    <span className="ms-cmp-card-k">{R(head[ci + 1])}</span>
                    <span>{R(cell)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </Frame>
  );
}

/**
 * `match` — пары: случай слева, правовая основа справа. Выбирают карточку
 * в одной колонке, затем её пару в другой. Найденная пара уезжает наверх
 * строкой таблицы — к концу задания на экране собранная таблица со
 * ссылками на статьи. `tag` — вид ответственности над случаем.
 *
 * `keys: true` — слева короткие названия (термин, риск), справа их
 * описания (модуль 3): колонки меняются шириной, жирное — слева.
 * `icon` — значок блока и правых карточек (по умолчанию `law`).
 */
export function Match({ block: b, done, onDone, R }) {
  const pairs = b.pairs || [];
  const n = pairs.length;
  const icon = b.icon || 'law';
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
      icon={<Icon name={icon} />}
      title={b.title}
      hint={complete ? null : 'Ընտրեք քարտ ձախ սյունակից, ապա՝ դրա զույգը աջից։'}
      progress={`${matched.length} / ${n}`}
      done={complete}
      tools={complete ? <Restart onClick={() => { setMatched([]); setRightOrder(fresh()); }} /> : null}
    >
      <div className={`ix-match${b.keys ? ' is-keys' : ''}`} ref={rootRef}>
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
                  {!b.keys && <span className="ix-mcard-ico" aria-hidden><Icon name={icon} size={16} /></span>}
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
