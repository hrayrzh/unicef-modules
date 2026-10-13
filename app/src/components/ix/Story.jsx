import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { Frame, plain, useDone, useInView } from './shared';
import { F, Person, S } from './art';

/**
 * `story` — «доска»: по сцене на пункт, сцена рисуется линией, под ней
 * подпись — тот же пункт из документа дословно. Сцены листаются сами
 * (полоски сверху показывают время) или кнопками. Рисунок запускается,
 * только когда доска в поле зрения, иначе он закончится до того, как на
 * него посмотрят.
 */

// Сцены — к пунктам «Առօրյա անվտանգության կանոններ» и «Շարունակական
// հաղորդակցություն և վստահություն». Только линии и пятна цвета, без
// надписей: подпись под доской уже говорит словами документа.
const ART = {
  // Семейный цифровой договор: экранное время, без телефона перед сном.
  agreement: (
    <g>
      <Person x={92} at={0} tone="cyan" />
      <Person x={176} s={0.72} at={0.35} tone="amber" />
      <F t="rect" x="248" y="32" width="138" height="182" rx="10" at={1.4} className="tone-paper" />
      <S t="rect" x="248" y="32" width="138" height="182" rx="10" at={0.7} />
      <S d="M270 70h94" at={1.1} />
      <S d="M270 96h94" at={1.25} />
      <S d="M270 122h66" at={1.4} />
      <S d="M270 166c9-14 17 12 27-2s14 10 22-4" at={1.7} />
      <S d="M330 184l10 10 22-24" at={2.1} className="is-accent is-thick" />
      <S t="circle" cx="472" cy="76" r="34" at={1.2} />
      <S d="M472 56v20l14 10" at={1.6} className="is-accent" />
      <S d="M452 150a26 26 0 1034 30 21 21 0 01-34-30z" at={1.9} />
      <S t="rect" x="514" y="150" width="40" height="64" rx="8" at={2.1} />
      <S d="M506 222l56-80" at={2.6} className="is-alert is-thick" />
    </g>
  ),
  // Настройки приватности — открыто, вместе, а не тайком.
  settings: (
    <g>
      <F d="M110 70l52 20v42c0 30-22 52-52 62-30-10-52-32-52-62V90z" at={1.6} className="tone-cyan" />
      <S d="M110 70l52 20v42c0 30-22 52-52 62-30-10-52-32-52-62V90z" at={0} />
      <S d="M88 132l16 16 30-32" at={0.8} className="is-accent is-thick" />
      <S t="rect" x="222" y="18" width="156" height="214" rx="22" at={0.3} />
      <S d="M282 34h36" at={0.7} />
      {[78, 128, 178].map((y, i) => (
        <g key={y}>
          <S d={`M244 ${y}h56`} at={0.9 + i * 0.2} />
          <F t="rect" x="316" y={y - 13} width="46" height="26" rx="13" at={1.8 + i * 0.35} className="tone-cyan ix-track" />
          <S t="rect" x="316" y={y - 13} width="46" height="26" rx="13" at={1 + i * 0.2} />
          <circle cx="329" cy={y} r="9" className="ix-knob" style={{ '--d': `${1.8 + i * 0.35}s` }} />
        </g>
      ))}
      <F d="M430 125s28-38 64-38 64 38 64 38-28 38-64 38-64-38-64-38z" at={2.4} className="tone-paper" />
      <S d="M430 125s28-38 64-38 64 38 64 38-28 38-64 38-64-38-64-38z" at={1.2} />
      <S t="circle" cx="494" cy="125" r="17" at={1.7} className="is-accent" />
    </g>
  ),
  // Короткие частые разговоры по поводу из повседневности.
  talk: (
    <g>
      <Person x={140} at={0} tone="cyan" />
      <Person x={398} s={0.76} at={0.35} tone="amber" />
      <g className="ix-pop" style={{ '--d': '1.1s' }}>
        <F d="M176 34h96a14 14 0 0114 14v18a14 14 0 01-14 14h-62l-18 14 4-14h-20a14 14 0 01-14-14V48a14 14 0 0114-14z" at={1.1} className="tone-paper" />
        <S d="M176 34h96a14 14 0 0114 14v18a14 14 0 01-14 14h-62l-18 14 4-14h-20a14 14 0 01-14-14V48a14 14 0 0114-14z" at={1.1} />
        <S d="M180 56h70" at={1.5} className="is-accent" />
      </g>
      <g className="ix-pop" style={{ '--d': '1.9s' }}>
        <F d="M300 72h62a12 12 0 0112 12v14a12 12 0 01-12 12h-14l4 14-18-14h-34a12 12 0 01-12-12V84a12 12 0 0112-12z" at={1.9} className="tone-amber-soft" />
        <S d="M300 72h62a12 12 0 0112 12v14a12 12 0 01-12 12h-14l4 14-18-14h-34a12 12 0 01-12-12V84a12 12 0 0112-12z" at={1.9} />
        <S d="M306 91h46" at={2.3} />
      </g>
      <g className="ix-pop" style={{ '--d': '2.7s' }}>
        <S d="M196 118h52a12 12 0 0112 12v8a12 12 0 01-12 12h-36l-14 10 3-10h-5a12 12 0 01-12-12v-8a12 12 0 0112-12z" at={2.7} />
        <S d="M200 134h34" at={3} className="is-accent" />
      </g>
      <S t="rect" x="474" y="58" width="100" height="70" rx="9" at={0.9} />
      <S d="M512 80v26l22-13z" at={1.4} className="is-accent" />
      <S d="M524 128v18M502 146h44" at={1.5} />
    </g>
  ),
  // Дом, где можно рассказать без страха наказания.
  home: (
    <g>
      <F d="M178 222V122L300 42l122 80v100z" at={1.5} className="tone-paper" />
      <S d="M178 222V122L300 42l122 80v100" at={0} />
      <S d="M160 134L300 34l140 100" at={0.6} />
      <S t="rect" x="276" y="160" width="48" height="62" rx="4" at={0.9} />
      <S t="rect" x="202" y="146" width="42" height="36" rx="3" at={1.1} />
      <S t="rect" x="356" y="146" width="42" height="36" rx="3" at={1.2} />
      <g className="ix-beat" style={{ '--d': '2.2s' }}>
        <F d="M300 128s-26-16-26-34a14 14 0 0126-7 14 14 0 0126 7c0 18-26 34-26 34z" at={1.9} className="tone-coral" />
        <S d="M300 128s-26-16-26-34a14 14 0 0126-7 14 14 0 0126 7c0 18-26 34-26 34z" at={1.5} className="is-alert" />
      </g>
      <Person x={98} at={0.4} tone="cyan" />
      <Person x={492} s={0.72} at={0.7} tone="amber" />
      <g className="ix-pop" style={{ '--d': '2.4s' }}>
        <S d="M508 52h56a12 12 0 0112 12v14a12 12 0 01-12 12h-30l-16 12 3-12h-13a12 12 0 01-12-12V64a12 12 0 0112-12z" at={2.4} />
        <S d="M528 70h20M528 80h12" at={2.8} className="is-accent" />
      </g>
    </g>
  ),
};

export function Story({ block: b, done, onDone, R }) {
  const scenes = b.scenes || [];
  const n = scenes.length;
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [seen, setSeen] = useState(() => new Set(done ? scenes.map((_, i) => i) : [0]));
  const stageRef = useRef(null);
  const inView = useInView(stageRef);
  const bars = useRef([]);
  const t = useRef(0);
  const complete = seen.size === n;
  useDone(complete, onDone);

  const goTo = (i) => {
    const k = Math.max(0, Math.min(n - 1, i));
    setAt(k);
    setStarted(true);
    setSeen((s) => (s.has(k) ? s : new Set(s).add(k)));
  };

  // Scene change: its own bar starts from zero, earlier bars are full. The
  // bars are written directly — the frame loop below moves them 60 times a
  // second, and React's diff would not notice those writes.
  useEffect(() => {
    t.current = 0;
    bars.current.forEach((el, i) => { if (el) el.style.transform = `scaleX(${i < at ? 1 : 0})`; });
  }, [at]);

  useEffect(() => {
    if (!playing) return undefined;
    let raf;
    let last = performance.now();
    // Time to read the caption: ~65 ms a character, never under 7 s.
    const dur = Math.max(7000, plain(scenes[at].text).length * 65);
    const tick = (now) => {
      t.current += (now - last) / dur;
      last = now;
      const el = bars.current[at];
      if (el) el.style.transform = `scaleX(${Math.min(1, t.current)})`;
      if (t.current >= 1) {
        if (at < n - 1) goTo(at + 1);
        else setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, at]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    setStarted(true);
    if (!playing && at === n - 1 && t.current >= 1) { goTo(0); setPlaying(true); return; }
    setPlaying((p) => !p);
  };

  const sc = scenes[at];
  return (
    <Frame icon={<Icon name="film" />} title={b.title} progress={`${at + 1} / ${n}`} done={complete}>
      <div className="ix-story">
        <div className="ix-story-bars" aria-hidden>
          {scenes.map((_, i) => (
            <span key={i} className="ix-story-bar"><i ref={(el) => { bars.current[i] = el; }} /></span>
          ))}
        </div>
        <div className="ix-story-stage" ref={stageRef}>
          {inView && (
            <svg key={at} viewBox="0 0 600 250" className="ix-wb" role="img" aria-label={plain(sc.group)}>
              {ART[sc.art]}
            </svg>
          )}
          {!started && (
            <button type="button" className="ix-story-play" onClick={toggle} aria-label="Դիտել">
              <Icon name="play" size={28} />
            </button>
          )}
        </div>
        <div className="ix-story-cap" key={at} aria-live="polite">
          <span className="ix-story-kicker">{sc.group}</span>
          <p>{R(sc.text)}</p>
        </div>
        <div className="ix-story-ctrl">
          <button type="button" className="ix-round" onClick={() => goTo(at - 1)} disabled={at === 0} aria-label="Նախորդ">
            <Icon name="prev" size={16} />
          </button>
          <button type="button" className="ix-round is-primary is-lg" onClick={toggle} aria-label={playing ? 'Դադար' : 'Դիտել'}>
            <Icon name={playing ? 'pause' : 'play'} size={18} />
          </button>
          <button type="button" className="ix-round" onClick={() => goTo(at + 1)} disabled={at === n - 1} aria-label="Հաջորդ">
            <Icon name="next" size={16} />
          </button>
        </div>
      </div>
    </Frame>
  );
}
