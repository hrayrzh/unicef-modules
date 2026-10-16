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

  // Модуль 3, «Ինչ է 2FA-ն» — абзац по фразам (доска из Module_3.html).
  // Второй шаг после пароля: форма с паролем → код на телефоне → щит.
  factor: (
    <g>
      <F t="rect" x="40" y="44" width="170" height="160" rx="14" at={0.9} className="tone-paper" />
      <S t="rect" x="40" y="44" width="170" height="160" rx="14" at={0} />
      <S t="circle" cx="125" cy="86" r="17" at={0.4} />
      <S t="rect" x="62" y="124" width="126" height="30" rx="8" at={0.6} />
      {[84, 103, 122, 141, 160].map((x, i) => <S key={x} t="circle" cx={x} cy="139" r="3.2" at={0.9 + i * 0.08} className="is-thick" />)}
      <S d="M62 180h70" at={1.1} className="is-soft" />
      <S d="M228 124h70" at={1.4} className="is-accent is-thick" />
      <S d="M286 112l14 12-14 12" at={1.6} className="is-accent is-thick" />
      <F t="rect" x="320" y="30" width="100" height="190" rx="16" at={2.2} className="tone-paper" />
      <S t="rect" x="320" y="30" width="100" height="190" rx="16" at={1.7} />
      <S d="M356 44h28" at={1.9} />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <g key={k}>
          <F t="rect" x={333 + k * 13} y="116" width="10" height="16" rx="2.5" at={2.5 + k * 0.1} className="tone-cyan" />
          <S t="rect" x={333 + k * 13} y="116" width="10" height="16" rx="2.5" at={2.2 + k * 0.1} />
        </g>
      ))}
      <S d="M432 124h20" at={2.8} className="is-accent is-thick" />
      <S d="M445 116l8 8-8 8" at={2.9} className="is-accent is-thick" />
      <F d="M512 64l50 19v40c0 29-21 50-50 59-29-9-50-30-50-59V83z" at={3.4} className="tone-cyan" />
      <S d="M512 64l50 19v40c0 29-21 50-50 59-29-9-50-30-50-59V83z" at={3} />
      <S d="M491 122l15 15 28-30" at={3.5} className="is-accent is-thick" />
    </g>
  ),
  // Пароль украден, но без второго шага замок не открыть; телефон у хозяина.
  stolen: (
    <g>
      <Person x={84} at={0} tone="slate" />
      <F t="rect" x="122" y="92" width="88" height="34" rx="8" at={0.9} className="tone-paper" />
      <S t="rect" x="122" y="92" width="88" height="34" rx="8" at={0.6} />
      {[140, 157, 174, 191].map((x, i) => <S key={x} t="circle" cx={x} cy="109" r="3.2" at={0.9 + i * 0.08} className="is-thick" />)}
      <S d="M218 112c40-6 66 2 90 18" at={1.3} className="is-alert" />
      <F t="rect" x="312" y="118" width="88" height="76" rx="12" at={1.9} className="tone-paper" />
      <S d="M328 118V96a28 28 0 0156 0v22" at={1.6} />
      <S t="rect" x="312" y="118" width="88" height="76" rx="12" at={1.5} />
      <S d="M356 144v22" at={1.9} className="is-thick" />
      <F t="circle" cx="404" cy="116" r="19" at={2.5} className="tone-paper" />
      <S t="circle" cx="404" cy="116" r="19" at={2.3} className="is-alert is-thick" />
      <S d="M391 103l26 26" at={2.6} className="is-alert is-thick" />
      <F t="rect" x="452" y="104" width="56" height="98" rx="11" at={3} className="tone-paper" />
      <S t="rect" x="452" y="104" width="56" height="98" rx="11" at={2.8} />
      {[0, 1, 2].map((k) => <F key={k} t="rect" x={461 + k * 14} y="142" width="10" height="16" rx="2.5" at={3.2 + k * 0.1} className="tone-cyan" />)}
      <Person x={552} s={0.86} at={2.7} tone="cyan" />
    </g>
  ),
  // SMS можно перехватить, приложение-аутентификатор — нет.
  sms: (
    <g>
      <F t="rect" x="56" y="26" width="104" height="196" rx="16" at={0.6} className="tone-paper" />
      <S t="rect" x="56" y="26" width="104" height="196" rx="16" at={0} />
      <S d="M94 40h28" at={0.3} />
      <F d="M76 78h64a8 8 0 018 8v28a8 8 0 01-8 8H96l-12 10 2-10h-10a8 8 0 01-8-8V86a8 8 0 018-8z" at={1} className="tone-amber-soft" />
      <S d="M76 78h64a8 8 0 018 8v28a8 8 0 01-8 8H96l-12 10 2-10h-10a8 8 0 01-8-8V86a8 8 0 018-8z" at={0.6} />
      <S d="M82 100h52" at={1} />
      <S d="M152 96c50-22 96-14 128 22" at={1.4} className="is-alert" />
      <S d="M266 104l15 15-20 3" at={1.7} className="is-alert" />
      <Person x={300} s={0.7} at={1.2} tone="slate" />
      <F t="rect" x="404" y="26" width="104" height="196" rx="16" at={2.3} className="tone-paper" />
      <S t="rect" x="404" y="26" width="104" height="196" rx="16" at={2} />
      <S d="M442 40h28" at={2.2} />
      <S t="circle" cx="456" cy="94" r="24" at={2.4} className="is-soft" />
      <S d="M456 70a24 24 0 0124 24" at={2.8} className="is-accent is-thick" />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <g key={k}>
          <F t="rect" x={419 + k * 13} y="140" width="10" height="16" rx="2.5" at={3 + k * 0.1} className="tone-cyan" />
          <S t="rect" x={419 + k * 13} y="140" width="10" height="16" rx="2.5" at={2.7 + k * 0.1} />
        </g>
      ))}
      <F t="circle" cx="540" cy="58" r="20" at={3.6} className="tone-cyan" />
      <S t="circle" cx="540" cy="58" r="20" at={3.4} className="is-accent" />
      <S d="M530 58l7 7 13-14" at={3.7} className="is-accent is-thick" />
    </g>
  ),
  // Сильнее всего — ключ-брелок и passkey (отпечаток); столбики силы.
  passkey: (
    <g>
      <F d="M92 98h150a28 28 0 010 56H92a28 28 0 010-56z" at={0.8} className="tone-paper" />
      <S d="M92 98h150a28 28 0 010 56H92a28 28 0 010-56z" at={0} />
      <S t="circle" cx="92" cy="126" r="10" at={0.4} />
      <F t="rect" x="270" y="110" width="44" height="32" rx="4" at={1} className="tone-slate" />
      <S t="rect" x="270" y="110" width="44" height="32" rx="4" at={0.6} />
      <S d="M282 120h6M296 120h6M282 132h6M296 132h6" at={1.1} />
      <F t="circle" cx="190" cy="126" r="16" at={1.4} className="tone-cyan" />
      <S t="circle" cx="190" cy="126" r="16" at={1.2} className="is-accent" />
      <S t="rect" x="376" y="66" width="104" height="120" rx="24" at={1.4} className="is-soft" />
      <S d="M398 112a30 30 0 0160 0" at={1.7} className="is-accent" />
      <S d="M406 152v-34a22 22 0 0144 0v12" at={1.9} className="is-accent" />
      <S d="M418 160v-38a10 10 0 0120 0v30" at={2.1} className="is-accent" />
      <S d="M450 146v14" at={2.3} className="is-accent" />
      <F t="rect" x="514" y="168" width="16" height="28" rx="3" at={2.6} className="tone-slate" />
      <F t="rect" x="538" y="146" width="16" height="50" rx="3" at={2.8} className="tone-cyan" />
      <F t="rect" x="562" y="124" width="16" height="72" rx="3" at={3} className="tone-cyan" />
      <S t="rect" x="562" y="124" width="16" height="72" rx="3" at={2.8} className="is-accent" />
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
            <svg key={at} viewBox="0 0 600 250" className="ix-wb" {...(sc.group ? { role: 'img', 'aria-label': plain(sc.group) } : { 'aria-hidden': true })}>
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
          {sc.group && <span className="ix-story-kicker">{sc.group}</span>}
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
