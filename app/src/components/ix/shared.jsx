import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './icons';

// Общие кирпичики интерактивных блоков модуля 2: рамка, хуки, движение.
//
// Без очков, серий и «опыта» — просьба Армана 2026-10-13. Блок только
// отмечает, что пройден (тот же `opened[key]`, что у таблиц и пар), чтобы
// после перезагрузки показать уже собранный результат, а не начинать заново.

const RM = '(prefers-reduced-motion: reduce)';
export const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.(RM).matches;
export const EASE = 'cubic-bezier(.2,.85,.2,1)';

export function useReducedMotion() {
  const [reduce, setReduce] = useState(reducedMotion);
  useEffect(() => {
    const m = window.matchMedia?.(RM);
    if (!m) return undefined;
    const on = () => setReduce(m.matches);
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, []);
  return reduce;
}

/** Fisher–Yates. A shuffle that keeps the source order would hand over the answer. */
export function shuffled(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.length > 2 && a.every((x, i) => x === list[i])) a.push(a.shift());
  return a;
}

/** Text without the inline markup — for buttons, where links and tooltips cannot live. */
export function plain(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/\(\((.+?)\|\|(.+?)\)\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1');
}

export const longest = (list) => list.reduce((a, b) => (plain(b).length > plain(a).length ? b : a), '');

export const onKey = (fn) => (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
};

/**
 * Becomes true once the element scrolls into view. Animations that tell a
 * story (drawing, scrolling capture) wait for it — otherwise they would play
 * out below the fold before anyone looks.
 */
export function useInView(ref, threshold = 0.3) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setSeen(true); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return seen;
}

/**
 * FLIP: elements marked `data-flip="id"` slide from where they were to where
 * they are now; new ones fade in. Positions are offsets inside `ref`, not
 * viewport rects — the reader scrolls, and a scroll between two renders must
 * not read as movement. `ref` has to be the nearest positioned ancestor.
 */
export function useFlip(ref) {
  const prev = useRef(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const next = new Map();
    const still = reducedMotion();
    root.querySelectorAll('[data-flip]').forEach((el) => {
      const pos = { x: el.offsetLeft, y: el.offsetTop };
      next.set(el.dataset.flip, pos);
      if (!prev.current || still) return;
      const was = prev.current.get(el.dataset.flip);
      if (!was) {
        el.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: EASE });
        return;
      }
      const dx = was.x - pos.x;
      const dy = was.y - pos.y;
      if (dx || dy) el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 460, easing: EASE });
    });
    prev.current = next;
  });
}

export function shake(el) {
  if (!el || reducedMotion()) return;
  el.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-9px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }],
    { duration: 420, easing: 'ease-out' },
  );
}

export function bump(el) {
  if (!el || reducedMotion()) return;
  el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' }], { duration: 380, easing: EASE });
}

/**
 * Sends an element flying into `target` and resolves when it lands. `dx`,
 * `dy`, `rot` — where a drag left it, so the flight starts from the finger,
 * not from the resting place.
 */
export function flyTo(el, target, { dx = 0, dy = 0, rot = 0, scale = 0.22, duration = 480, fade = true } = {}) {
  if (!el || !target || reducedMotion()) return Promise.resolve();
  const a = el.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const tx = b.left + b.width / 2 - (a.left + a.width / 2 - dx);
  const ty = b.top + b.height / 2 - (a.top + a.height / 2 - dy);
  const anim = el.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) rotate(0deg) scale(${scale})`, opacity: fade ? 0 : 1 },
    ],
    { duration, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards' },
  );
  return anim.finished.catch(() => {});
}

/**
 * Рамка интерактивного блока — та же, что у раскрывающихся панелей:
 * белая карточка, серая граница, голубая, когда блок пройден.
 * `title` — простой текст: разметка в заголовках не рендерится (CLAUDE.md).
 */
export function Frame({ icon, title, hint, progress, done, tools, children, className = '' }) {
  return (
    <section className={`ix${done ? ' is-done' : ''}${className ? ` ${className}` : ''}`}>
      <header className="ix-head">
        {icon && <span className="ix-head-icon" aria-hidden>{icon}</span>}
        <span className="ix-head-text">
          {title && <span className="ix-title">{title}</span>}
          {hint && <span className={title ? 'ix-hint' : 'ix-hint is-solo'}>{hint}</span>}
        </span>
        {(progress != null || tools) && (
          <span className="ix-head-side">
            {progress != null && (
              <span className="ix-progress" aria-live="polite">
                {done && <Icon name="check" size={13} strokeWidth={3} />}
                {progress}
              </span>
            )}
            {tools}
          </span>
        )}
      </header>
      <div className="ix-body">{children}</div>
    </section>
  );
}

export function Restart({ onClick }) {
  return (
    <button type="button" className="ix-tool" onClick={onClick} title="Սկսել նորից" aria-label="Սկսել նորից">
      <Icon name="restart" size={15} />
    </button>
  );
}

/** Calls `onDone` once the block is complete; the credit is never taken back. */
export function useDone(complete, onDone) {
  const fired = useRef(false);
  useEffect(() => {
    if (complete && !fired.current) { fired.current = true; onDone?.(); }
  }, [complete, onDone]);
}
