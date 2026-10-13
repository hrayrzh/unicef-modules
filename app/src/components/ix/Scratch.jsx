import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { Frame, onKey, reducedMotion, useDone } from './shared';

/**
 * `scratch` — «Քերեք մատով կամ մկնիկով՝ տեքստը բացելու համար»: абзац
 * закрыт «фольгой», её стирают пальцем или мышью. Когда стёрта примерно
 * половина, фольга растворяется сама — выскребать каждый пиксель не нужно.
 * Подсказка дословно из файла предложений Армана.
 *
 * Доступность: текст лежит под фольгой в DOM — скринридер читает его
 * сразу; с клавиатуры карточку открывает Enter или пробел. Прокрутка
 * страницы пальцем над карточкой не блокируется (touch-action: pan-y),
 * стирают горизонтальными движениями.
 *
 * Поля: `title`, `items[]` (по карточке на абзац) или `text`, `lead`,
 * `tone: "danger"` — красная иконка в шапке (предупреждения),
 * `after[]` — абзацы обычным текстом под карточками. Так сделано в файле
 * предложений: под фольгой только первый абзац раздела, остальные читаются
 * сразу («Հոգեբանական աջակցություն», модуль 2).
 */
const HINT = 'Քերեք մատով կամ մկնիկով՝ տեքստը բացելու համար';

export function Scratch({ block: b, done, onDone, R }) {
  const items = b.items || (b.text ? [b.text] : []);
  const n = items.length;
  const [open, setOpen] = useState(() => items.map(() => !!done));
  const count = open.filter(Boolean).length;
  const complete = count === n;
  useDone(complete, onDone);
  const reveal = (i) => setOpen((o) => (o[i] ? o : o.map((v, j) => v || j === i)));

  return (
    <Frame
      icon={<Icon name={b.tone === 'danger' ? 'warn' : 'scratch'} />}
      className={b.tone === 'danger' ? 'is-danger' : ''}
      title={b.title}
      progress={`${count} / ${n}`}
      done={complete}
    >
      {b.lead && <p className="ix-lead">{R(b.lead)}</p>}
      <div className="ix-scratch-list">
        {items.map((t, i) => (
          <ScratchCard key={i} index={i} open={open[i]} onReveal={() => reveal(i)}>
            {R(t)}
          </ScratchCard>
        ))}
      </div>
      {(b.after || []).map((t, i) => <p key={i} className="ix-tail">{R(t)}</p>)}
    </Frame>
  );
}

const BRUSH = 22;      // радиус «монетки», px
const ENOUGH = 0.45;   // какая доля стёрта — и фольга растворяется

function ScratchCard({ index, open, onReveal, children }) {
  const wrapRef = useRef(null);
  // Фольга закрывает только абзац, подпись над ним видна всегда.
  const areaRef = useRef(null);
  const canvasRef = useRef(null);
  const st = useRef({ down: false, last: null, moves: 0, touched: false });
  // Фольга исчезает плавно и только потом снимается из DOM.
  const [gone, setGone] = useState(open);

  useEffect(() => {
    if (!open || gone) return undefined;
    const t = setTimeout(() => setGone(true), reducedMotion() ? 0 : 520);
    return () => clearTimeout(t);
  }, [open, gone]);

  // Рисуем фольгу под размер карточки (и заново при изменении размера,
  // пока её ещё не начали стирать).
  useEffect(() => {
    if (open) return undefined;
    const wrap = areaRef.current;
    const cv = canvasRef.current;
    if (!wrap || !cv || !cv.getContext) return undefined;
    const paint = () => {
      const r = wrap.getBoundingClientRect();
      if (!r.width || st.current.touched) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      const w = r.width;
      const h = r.height;
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#CDEBF7');
      g.addColorStop(0.5, '#93D2EB');
      g.addColorStop(1, '#C2E6F4');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // блики фольги
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 12;
      for (let x = -h; x < w; x += 34) {
        ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      for (let k = 0; k < 30; k += 1) {
        const x = (k * 97 + index * 41) % w;
        const y = (k * 53 + index * 29) % h;
        ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      // знак «потри здесь»: волна по центру
      const cx = w / 2;
      const cy = h / 2;
      ctx.strokeStyle = 'rgba(15,127,168,.55)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 54, cy + 6);
      for (let i = 0; i <= 6; i += 1) ctx.lineTo(cx - 54 + i * 18, cy + (i % 2 ? -10 : 6));
      ctx.stroke();
    };
    paint();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(paint);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [open, index]);

  const ctxOf = () => canvasRef.current?.getContext?.('2d');
  const pointOf = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const erase = (p) => {
    const ctx = ctxOf();
    if (!ctx) return;
    const s = st.current;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = BRUSH * 2;
    ctx.beginPath();
    if (s.last) { ctx.moveTo(s.last.x, s.last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(p.x, p.y, BRUSH, 0, Math.PI * 2); ctx.fill();
    s.last = p;
  };
  // Доля стёртого — по редкой выборке пикселей, без полного обхода.
  const cleared = () => {
    const cv = canvasRef.current;
    const ctx = ctxOf();
    if (!cv || !ctx || !cv.width) return 0;
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let clear = 0;
    let all = 0;
    for (let i = 3; i < d.length; i += 4 * 23) { all += 1; if (d[i] < 40) clear += 1; }
    return all ? clear / all : 0;
  };
  const check = () => { if (!open && cleared() > ENOUGH) onReveal(); };

  const down = (e) => {
    if (open || e.button > 0) return;
    const s = st.current;
    s.down = true; s.touched = true; s.last = null;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    erase(pointOf(e));
  };
  const move = (e) => {
    const s = st.current;
    if (!s.down) return;
    erase(pointOf(e));
    s.moves += 1;
    if (s.moves % 12 === 0) check();
  };
  const up = () => {
    const s = st.current;
    if (!s.down) return;
    s.down = false; s.last = null;
    check();
  };

  return (
    <div
      ref={wrapRef}
      className={`ix-scratch${open ? ' is-open' : ''}`}
      style={{ '--i': index }}
      role={open ? undefined : 'button'}
      tabIndex={open ? undefined : 0}
      aria-label={open ? undefined : 'Բացել'}
      onKeyDown={open ? undefined : onKey(onReveal)}
    >
      {/* Подпись видна всегда, как в файле предложений: что делать с карточкой. */}
      <div className="ix-scratch-label">
        <span className="ix-scratch-coin" aria-hidden>🪙</span>
        <span>{HINT}</span>
        {open && <span className="ix-scratch-ok" aria-hidden><Icon name="check" size={12} strokeWidth={3} /></span>}
      </div>
      <div className="ix-scratch-area" ref={areaRef}>
      <div className="ix-scratch-text">{children}</div>
      {!gone && (
        <canvas
          ref={canvasRef}
          className="ix-scratch-foil"
          aria-hidden
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={up}
        />
      )}
      </div>
    </div>
  );
}
