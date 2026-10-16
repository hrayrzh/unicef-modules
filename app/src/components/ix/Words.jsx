import { useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { EASE, Frame, Restart, reducedMotion, shuffled, useDone } from './shared';

// Подпись прилетает из нажатой кнопки на своё место в тексте: место уже в
// потоке, его сдвигают туда, где была кнопка, и отпускают.
function land(el, rect) {
  if (!el || !rect || reducedMotion()) return;
  const to = el.getBoundingClientRect();
  el.animate(
    [{ transform: `translate(${rect.left - to.left}px, ${rect.top - to.top}px)`, opacity: 0.5 }, { transform: 'none', opacity: 1 }],
    { duration: 420, easing: EASE },
  );
}

/**
 * `cloze` — пропуск в абзаце (Module_3.html, «Լրացրեք բաց թողնվածը»): на
 * месте `___` пустая строка, под абзацем варианты из файла предложений.
 * Неверный вариант качает головой, верный встаёт в текст. Абзац — целиком
 * и дословно, пропуск ширины не выдаёт: у него одна длина для всех ответов.
 *
 * Поля: `text` с `___` на месте ответа, `answer`, `options[]` (с ответом),
 * `title?`, `hint?`.
 */
const CLOZE_HINT = 'Լրացրեք բաց թողնվածը։'; // из Module_3.html

export function Cloze({ block: b, done, onDone, R }) {
  const [before = '', after = ''] = (b.text || '').split('___');
  const [opts] = useState(() => shuffled(b.options || []));
  const [ok, setOk] = useState(!!done);
  const [bad, setBad] = useState(null);
  const gapRef = useRef(null);
  const from = useRef(null);
  useDone(ok, onDone);

  const pick = (o, e) => {
    if (ok) return;
    if (o !== b.answer) {
      setBad(o);
      setTimeout(() => setBad((x) => (x === o ? null : x)), 650);
      return;
    }
    from.current = e.currentTarget.getBoundingClientRect();
    setOk(true);
  };

  useLayoutEffect(() => {
    if (!from.current) return;
    land(gapRef.current, from.current);
    from.current = null;
  }, [ok]);

  return (
    <Frame icon={<Icon name="blank" />} title={b.title} hint={ok && b.title ? null : b.hint || CLOZE_HINT} done={ok}>
      <p className="ix-cz-text">
        {R(before)}
        {ok ? (
          <span className="ix-cz-gap is-on" ref={gapRef}>{b.answer}</span>
        ) : (
          <span className="ix-cz-gap" aria-hidden />
        )}
        {R(after)}
      </p>
      {!ok && (
        <div className="ix-cz-opts">
          {opts.map((o) => (
            <button key={o} type="button" className={`ix-chip ix-cz-opt${bad === o ? ' is-bad' : ''}`} onClick={(e) => pick(o, e)}>
              {o}
            </button>
          ))}
        </div>
      )}
    </Frame>
  );
}

/**
 * `scramble` — фраза из перемешанных слов (Module_3.html, «Հավաքեք
 * նախադասությունը»): слова — кнопки, нажимают следующее по порядку, оно
 * встаёт в строку. Пустые места в строке той же ширины, что их слова: видно,
 * сколько слов осталось и какой они длины. Ошибка ничего не стоит.
 *
 * Поля: `text` — фраза дословно (режется по пробелам), `title?`, `hint?`.
 */
const SCR_HINT = 'Հավաքեք նախադասությունը։'; // из Module_3.html

export function Scramble({ block: b, done, onDone }) {
  const words = (b.text || '').split(/\s+/).filter(Boolean);
  const n = words.length;
  const fresh = () => shuffled(words.map((_, i) => i));
  const [pool, setPool] = useState(fresh);
  // Нажатые кнопки по порядку. Одинаковые слова взаимозаменяемы, поэтому
  // хранится кнопка, а не номер слова.
  const [used, setUsed] = useState(() => (done ? words.map((_, i) => i) : []));
  const [bad, setBad] = useState(null);
  const slotRefs = useRef([]);
  const from = useRef(null);
  const placed = used.length;
  const complete = placed === n;
  useDone(complete, onDone);

  const pick = (i, e) => {
    if (complete) return;
    if (words[i] !== words[placed]) {
      setBad(i);
      setTimeout(() => setBad((x) => (x === i ? null : x)), 650);
      return;
    }
    from.current = { k: placed, rect: e.currentTarget.getBoundingClientRect() };
    setUsed((u) => [...u, i]);
  };

  useLayoutEffect(() => {
    const f = from.current;
    if (!f) return;
    from.current = null;
    land(slotRefs.current[f.k], f.rect);
  }, [placed]);

  return (
    <Frame
      icon={<Icon name="words" />}
      title={b.title}
      hint={complete && b.title ? null : b.hint || SCR_HINT}
      progress={`${placed} / ${n}`}
      done={complete}
      tools={complete ? <Restart onClick={() => { setPool(fresh()); setUsed([]); }} /> : null}
    >
      <p className={`ix-scr-line${complete ? ' is-done' : ''}`} aria-live="polite">
        {words.map((w, k) => (
          <span
            key={k}
            ref={(el) => { slotRefs.current[k] = el; }}
            className={`ix-scr-w${k < placed ? ' is-on' : k === placed ? ' is-next' : ''}`}
            aria-hidden={k >= placed}
          >
            {w}
          </span>
        ))}
      </p>
      {!complete && (
        <div className="ix-scr-pool">
          {pool.filter((i) => !used.includes(i)).map((i) => (
            <button key={i} type="button" className={`ix-chip ix-scr-chip${bad === i ? ' is-bad' : ''}`} onClick={(e) => pick(i, e)}>
              {words[i]}
            </button>
          ))}
        </div>
      )}
    </Frame>
  );
}
