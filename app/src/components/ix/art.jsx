// Рисунки «доски»: линии, которые рисуют себя, и пятна цвета, которые
// проявляются следом. Общие для `story` (Story.jsx) и `scene` (Scene.jsx),
// чтобы иллюстрации в модуле были в одном стиле. Без надписей, кроме
// чисел из самого текста («5–6 մ»): подпись под рисунком говорит словами
// документа. Холст — viewBox 600×300 у `scene`, 600×250 у `story`.

/** Линия, которая рисует себя. `at` — задержка в секундах. */
export function S({ t: T = 'path', at = 0, className = '', ...p }) {
  return <T pathLength="1" className={`ix-d${className ? ` ${className}` : ''}`} style={{ '--d': `${at}s` }} {...p} />;
}

/** Заливка, проявляющаяся после контура. */
export function F({ t: T = 'path', at = 0, className = '', ...p }) {
  return <T className={`ix-f${className ? ` ${className}` : ''}`} style={{ '--d': `${at}s` }} {...p} />;
}

/** Фигура: голова и плечи, ноги на линии пола `y`. `tone` — цвет пятна. */
export function Person({ x, y = 226, s = 1, at = 0, tone, className }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className={className}>
      {tone && <F t="circle" cx="0" cy="-118" r="18" at={at + 0.9} className={`tone-${tone}`} />}
      {tone && <F d="M-30 0V-56a30 30 0 0160 0V0z" at={at + 1} className={`tone-${tone}`} />}
      <S t="circle" cx="0" cy="-118" r="18" at={at} />
      <S d="M-30 0V-56a30 30 0 0160 0V0" at={at + 0.3} />
    </g>
  );
}

/** Облачко реплики с хвостом к говорящему (`tail`: 'left' | 'right' | 'down'). */
function Bubble({ x, y, w, h, at, tail = 'down', tone = 'paper', className = '' }) {
  const r = 14;
  const tx = tail === 'left' ? x + 26 : tail === 'right' ? x + w - 26 : x + w / 2;
  const d = `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 01${r} ${r}v${h - 2 * r}a${r} ${r} 0 01-${r} ${r}`
    + `H${tx + 10}l-10 16-6-16H${x + r}a${r} ${r} 0 01-${r}-${r}V${y + r}a${r} ${r} 0 01${r}-${r}z`;
  return (
    <>
      <F d={d} at={at + 0.5} className={`tone-${tone}`} />
      <S d={d} at={at} className={className} />
    </>
  );
}

const FLOOR = 262;
const Floor = () => <S d={`M40 ${FLOOR}h520`} at={0} className="is-soft" />;

/**
 * Иллюстрации к шагам «Երբ նկատում եք ընթացող կոնֆլիկտ կամ բուլինգ…».
 * Педагог — голубой, ребёнок, которого травят, — янтарный, зачинщик —
 * графитовый, остальные ученики — серые.
 */
export const STEP_ART = {
  // Մոտեցեք աշակերտին — не делать замечание издалека, подойти.
  approach: (
    <g>
      <Floor />
      <Person x={118} y={FLOOR} at={0.1} tone="cyan" />
      <Person x={428} y={FLOOR} s={0.74} at={0.3} tone="amber" />
      <Person x={500} y={FLOOR} s={0.8} at={0.45} tone="slate" />
      <S d="M170 206c70-46 150-46 210-4" at={1} className="is-accent is-dash" />
      <S d="M364 186l18 17-24 5" at={1.5} className="is-accent is-thick" />
      <F t="text" x="280" y="46" textAnchor="middle" at={1.1} className="ix-art-label">5–6 մ</F>
      <S d="M160 80h240M160 70v20M400 70v20" at={0.8} />
      <S d="M262 62l36 36M298 62l-36 36" at={1.6} className="is-alert is-thick" />
    </g>
  ),
  // Պահպանեք գաղտնիությունը — разговор отдельно, чтобы класс не видел.
  private: (
    <g>
      <Floor />
      <Person x={84} y={FLOOR} s={0.72} at={0.1} tone="crowd" className="is-faded" />
      <Person x={150} y={FLOOR} s={0.7} at={0.2} tone="crowd" className="is-faded" />
      <F t="rect" x="262" y="58" width="296" height="204" rx="6" at={1} className="tone-cyan-soft" />
      <S d="M262 262V58h296v204" at={0.4} />
      <S t="rect" x="248" y="150" width="24" height="112" rx="3" at={0.8} />
      <F t="rect" x="236" y="104" width="34" height="26" rx="6" at={1.4} className="tone-cyan" />
      <S t="rect" x="236" y="104" width="34" height="26" rx="6" at={1.1} className="is-accent" />
      <S d="M244 104v-8a9 9 0 0118 0v8" at={1.2} className="is-accent" />
      <Person x={364} y={FLOOR} s={0.95} at={0.7} tone="cyan" />
      <Person x={462} y={FLOOR} s={0.72} at={0.9} tone="amber" />
    </g>
  ),
  // Թույլ տվեք երեխային պատմել — слушать, не перебивая.
  listen: (
    <g>
      <Floor />
      <Person x={168} y={FLOOR} s={0.78} at={0.1} tone="amber" />
      <Bubble x={214} y={36} w={210} h={96} at={0.7} tail="left" tone="amber-soft" />
      <S d="M240 68h150" at={1.3} />
      <S d="M240 90h120" at={1.5} />
      <S d="M240 112h80" at={1.7} />
      <Person x={486} y={FLOOR} at={0.3} tone="cyan" />
      <S d="M452 136a12 12 0 000 18M442 128a22 22 0 000 34" at={1.9} className="is-accent" />
    </g>
  ),
  // Եղեք հակիրճ և կոնկրետ — одна ясная фраза вместо долгих увещеваний.
  brief: (
    <g>
      <Floor />
      <Person x={116} y={FLOOR} at={0.1} tone="cyan" />
      <Bubble x={190} y={30} w={330} h={92} at={0.5} tail="left" />
      <S d="M216 60c12-10 22 10 34 0s22 10 34 0 22 10 34 0 22 10 34 0 22 10 34 0 22 10 34 0" at={0.9} className="is-soft" />
      <S d="M216 88c12-10 22 10 34 0s22 10 34 0 22 10 34 0 22 10 34 0 22 10 34 0" at={1.1} className="is-soft" />
      <S d="M330 46l80 64M410 46l-80 64" at={1.5} className="is-alert is-thick" />
      <Bubble x={190} y={150} w={190} h={60} at={1.7} tail="left" tone="cyan-soft" className="is-accent" />
      <S d="M214 180h112" at={2.1} className="is-thick" />
      <S d="M350 168v14M350 192v.5" at={2.3} className="is-thick" />
      <S d="M402 178l14 14 26-28" at={2.5} className="is-accent is-thick" />
    </g>
  ),
  // Պահպանեք հաստատակամություն՝ առանց էմոցիաների — ровно, без крика.
  calm: (
    <g>
      <Floor />
      <Person x={300} y={FLOOR} at={0.1} tone="cyan" />
      <S d="M50 120l20-34 20 56 20-66 20 76 20-56 20 34" at={0.7} className="is-alert is-thick" />
      <S d="M96 70l72 90M168 70l-72 90" at={1.3} className="is-alert" />
      <S d="M396 120c16-12 32 12 48 0s32-6 48 0 32 0 64 0" at={1.1} className="is-accent is-thick" />
      <S d="M470 160l14 14 26-28" at={1.7} className="is-accent is-thick" />
    </g>
  ),
  // Կիրառեք իրական հետևանքներ — справедливо и соразмерно.
  fair: (
    <g>
      <Floor />
      <Person x={86} y={FLOOR} s={0.78} at={0.1} tone="slate" />
      <Person x={520} y={FLOOR} s={0.92} at={0.2} tone="cyan" />
      <S d="M300 96v166M262 262h76" at={0.5} />
      <g className="ix-swing">
        <S d="M196 96h208" at={0.8} className="is-thick" />
        <S d="M206 96l-28 72M206 96l28 72M394 96l-28 72M394 96l28 72" at={1} className="is-soft" />
        <F d="M168 168a38 12 0 0076 0z" at={1.6} className="tone-cyan-soft" />
        <S d="M168 168a38 12 0 0076 0" at={1.2} />
        <F d="M356 168a38 12 0 0076 0z" at={1.6} className="tone-amber-soft" />
        <S d="M356 168a38 12 0 0076 0" at={1.3} />
        <S t="rect" x="186" y="140" width="40" height="26" rx="3" at={1.5} className="is-accent" />
        <S d="M206 140v26" at={1.7} className="is-accent" />
        <S d="M378 166l8-26h28l8 26z" at={1.6} />
      </g>
      <S t="circle" cx="300" cy="90" r="7" at={0.7} />
    </g>
  ),
};
