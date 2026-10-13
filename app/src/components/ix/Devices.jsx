import { useRef, useState } from 'react';
import { Icon } from './icons';
import { Frame, Restart, shuffled, useDone, useInView } from './shared';

/* ------------------------------------------------------------------ */
/* Чат на экране телефона — общий для «3 քայլ» и scrolling screenshot. */
/* Без слов: полоски вместо текста. Смысл несут действия, а не реплики. */

const BUBBLES = [
  ['in', 70], ['in', 48], ['out', 56], ['in', 82], ['out', 40], ['in', 64],
  ['in', 52], ['out', 70], ['in', 44], ['in', 76], ['out', 58], ['in', 60],
];

function ChatColumn({ count = BUBBLES.length, flags = false }) {
  return (
    <div className="ix-chat-col">
      {BUBBLES.slice(0, count).map(([side, w], i) => (
        <div key={i} className={`ix-bub is-${side}`} style={{ width: `${w}%` }}>
          {flags && side === 'in' && <i className="ix-bub-flag"><Icon name="flag" size={10} strokeWidth={2.2} /></i>}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

const FX_ICON = { shot: 'camera', report: 'flag', block: 'block' };

/**
 * `phoneSteps` — «3 քայլ՝ արգելափակել, հաղորդել, պահպանել». Кнопки
 * действий перемешаны, нажимать нужно в правильном порядке — тот же, что
 * у специалистов: сначала сохранить, потом пожаловаться, потом
 * заблокировать. Каждое действие видно на экране: вспышка и миниатюра
 * скриншота, лист жалобы с флажками, блокировка гасит переписку.
 */
export function PhoneSteps({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const n = items.length;
  const [order, setOrder] = useState(() => shuffled(items.map((_, i) => i)));
  const [stage, setStage] = useState(done ? n : 0);
  const [wrong, setWrong] = useState(null);
  const [hint, setHint] = useState(false);
  const complete = stage >= n;
  useDone(complete, onDone);

  const press = (i) => {
    if (i < stage) return;
    if (i === stage) { setStage((s) => s + 1); setHint(false); return; }
    setWrong(i);
    setHint(true);
    setTimeout(() => setWrong(null), 520);
  };
  const fx = new Set(items.slice(0, stage).map((it) => it.fx));
  const last = stage > 0 ? items[stage - 1].fx : null;
  const blocked = fx.has('block');

  return (
    <Frame
      icon={<Icon name="phone" />}
      title={b.title}
      hint={complete ? null : 'Սեղմեք կոճակները ճիշտ հերթականությամբ'}
      progress={`${stage} / ${n}`}
      done={complete}
      tools={complete ? <Restart onClick={() => { setStage(0); setOrder(shuffled(items.map((_, i) => i))); }} /> : null}
    >
      <div className="ix-ps">
        <div className="ix-phone" aria-hidden>
          <div className="ix-phone-screen">
            <div className="ix-chat-head">
              <span className={`ix-chat-ava${blocked ? ' is-blocked' : ''}`}>
                <Icon name={blocked ? 'block' : 'child'} size={14} strokeWidth={2} />
              </span>
              <span className="ix-line" style={{ width: '46%' }} />
            </div>
            <div className={`ix-chat-body${blocked ? ' is-blocked' : ''}`}>
              <ChatColumn count={6} flags={fx.has('report')} />
            </div>
            <div className="ix-chat-input"><span className="ix-line" style={{ width: '62%' }} /></div>
            {blocked && (
              <div className="ix-chat-banner"><Icon name="block" size={12} strokeWidth={2.2} /><span className="ix-line" style={{ width: 54 }} /></div>
            )}
            {last === 'shot' && <div className="ix-flash" key={`f${stage}`} />}
            {fx.has('shot') && (
              <div className={`ix-thumb${last === 'shot' ? ' is-new' : ''}`}>
                <ChatColumn count={4} />
                <span className="ix-thumb-ok"><Icon name="check" size={9} strokeWidth={3.4} /></span>
              </div>
            )}
            {last === 'report' && (
              <div className="ix-sheet" key={`s${stage}`}>
                <span className="ix-sheet-grip" />
                <div className="ix-sheet-row is-on"><Icon name="flag" size={12} strokeWidth={2.2} /><span className="ix-line" style={{ width: '58%' }} /></div>
                <div className="ix-sheet-row"><span className="ix-line" style={{ width: '70%' }} /></div>
                <div className="ix-sheet-row"><span className="ix-line" style={{ width: '44%' }} /></div>
              </div>
            )}
          </div>
        </div>

        <div className="ix-ps-side">
          <div className="ix-ps-btns">
            {order.map((i) => {
              const it = items[i];
              const isDone = i < stage;
              return (
                <button
                  key={i}
                  type="button"
                  className={`ix-ps-btn${isDone ? ' is-done' : ''}${wrong === i ? ' is-wrong' : ''}${hint && i === stage ? ' is-hint' : ''}`}
                  onClick={() => press(i)}
                  aria-disabled={isDone}
                >
                  <span className="ix-ps-ico" aria-hidden><Icon name={FX_ICON[it.fx]} size={17} /></span>
                  <span className="ix-ps-label">{it.label}</span>
                  {isDone && <span className="ix-ps-n">{i + 1}</span>}
                </button>
              );
            })}
          </div>
          {stage > 0 && (
            <ol className="ix-ps-list">
              {items.slice(0, stage).map((it, i) => (
                <li key={i}>
                  <span className="ix-ps-num">{i + 1}</span>
                  <span><b>{it.label}</b>. {R(it.text)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */

// Где какие кнопки на корпусе. `on` — какая из подписей `labels` к ней относится.
const PHONE_KEYS = {
  iphone: [
    { side: 'l', top: 58, h: 30, on: 'volUp' },
    { side: 'l', top: 96, h: 30 },
    { side: 'r', top: 74, h: 50, on: 'side' },
  ],
  android: [
    { side: 'r', top: 50, h: 30 },
    { side: 'r', top: 84, h: 30, on: 'volDown' },
    { side: 'r', top: 132, h: 34, on: 'power' },
  ],
};

function PhoneKeys({ kind, labels = {} }) {
  const keys = PHONE_KEYS[kind] || [];
  return (
    <div className={`ix-dev-phone is-${kind}`}>
      <div className="ix-dev-body">
        <div className="ix-dev-screen">
          <ChatColumn count={5} />
          <div className="ix-flash is-late" />
          <div className="ix-thumb is-late"><ChatColumn count={4} /></div>
        </div>
      </div>
      {keys.map((k, i) => (
        <span key={i} className={`ix-dev-key is-${k.side}${k.on ? ' is-on' : ''}`} style={{ top: k.top, height: k.h }}>
          {k.on && labels[k.on] && (
            <span className={`ix-dev-label is-${k.side}`} style={{ '--i': i }}>{labels[k.on]}</span>
          )}
        </span>
      ))}
    </div>
  );
}

function Keys({ combos, kind }) {
  return (
    <div className={`ix-keys is-${kind}`}>
      <div className="ix-keys-screen">
        <div className="ix-keys-win">
          <span className="ix-line" style={{ width: '60%' }} />
          <span className="ix-line" style={{ width: '82%' }} />
          <span className="ix-line" style={{ width: '48%' }} />
        </div>
        <div className="ix-snip" />
        <div className="ix-flash is-full" />
      </div>
      <div className="ix-combos">
        {combos.map((combo, ci) => (
          <div key={ci} className="ix-combo" style={{ '--c': ci }}>
            {combo.map((k, ki) => (
              <span key={ki} className="ix-combo-part">
                {ki > 0 && <span className="ix-plus" aria-hidden>+</span>}
                <kbd className="ix-key" style={{ '--k': ki }}>{k}</kbd>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * `devices` — как сделать скриншот на своём устройстве. Вкладки — сами
 * устройства; на каждой анимация нажатия: на телефоне светятся и
 * нажимаются нужные кнопки корпуса, на компьютере — клавиши по очереди.
 */
export function Devices({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const [at, setAt] = useState(0);
  const [run, setRun] = useState(0);
  const [seen, setSeen] = useState(() => new Set(done ? items.map((_, i) => i) : [0]));
  const stageRef = useRef(null);
  const inView = useInView(stageRef);
  const complete = seen.size === items.length;
  useDone(complete, onDone);

  const pick = (i) => {
    setAt(i);
    setRun((r) => r + 1);
    setSeen((s) => (s.has(i) ? s : new Set(s).add(i)));
  };
  const it = items[at];

  return (
    <Frame
      icon={<Icon name="camera" />}
      title={b.title}
      hint={complete ? null : 'Ընտրեք սարքը'}
      progress={`${seen.size} / ${items.length}`}
      done={complete}
      tools={<Restart onClick={() => setRun((r) => r + 1)} />}
    >
      <div className="ix-tabs" role="tablist">
        {items.map((d, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === at}
            className={`ix-tab${i === at ? ' is-on' : ''}`}
            onClick={() => pick(i)}
          >
            {seen.has(i) && i !== at && <Icon name="check" size={12} strokeWidth={3} />}
            {d.name}
          </button>
        ))}
      </div>
      <div className="ix-dev-stage" ref={stageRef} aria-hidden>
        {inView && (
          <div key={`${at}:${run}`} className="ix-dev-run">
            {it.keys ? <Keys combos={it.keys} kind={it.kind} /> : <PhoneKeys kind={it.kind} labels={it.labels} />}
          </div>
        )}
      </div>
      <p className="ix-dev-text" key={at}><b>{it.name}</b>. {R(it.text)}</p>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */

/**
 * `scrollshot` — «Scrolling screenshot»: переписка прокручивается в
 * телефоне, а справа из кадров собирается одна длинная картинка. Ниже —
 * вкладки платформ: где искать кнопку, с подписью кнопки как на экране.
 */
export function ScrollShot({ block: b, done, onDone, R }) {
  const tabs = b.tabs || [];
  const [at, setAt] = useState(0);
  const [run, setRun] = useState(0);
  const [seen, setSeen] = useState(() => new Set(done ? tabs.map((_, i) => i) : [0]));
  const stageRef = useRef(null);
  const inView = useInView(stageRef);
  const complete = seen.size === tabs.length;
  useDone(complete, onDone);
  const pick = (i) => { setAt(i); setSeen((s) => (s.has(i) ? s : new Set(s).add(i))); };
  const tab = tabs[at];

  return (
    <Frame
      icon={<Icon name="scroll" />}
      title={b.title}
      progress={`${seen.size} / ${tabs.length}`}
      done={complete}
      tools={<Restart onClick={() => setRun((r) => r + 1)} />}
    >
      {b.text && <p className="ix-text">{R(b.text)}</p>}
      <div className="ix-ss" ref={stageRef} aria-hidden>
        {inView && (
          <div className="ix-ss-run" key={run}>
            <div className="ix-ss-phone">
              <div className="ix-ss-view">
                <div className="ix-ss-scroll"><ChatColumn /></div>
                <div className="ix-ss-frame" />
              </div>
            </div>
            <span className="ix-ss-arrow"><Icon name="next" size={22} strokeWidth={2.2} /></span>
            <div className="ix-ss-strip">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="ix-ss-slice" style={{ '--s': i }}>
                  <div className="ix-ss-slice-in" style={{ transform: `translateY(${-i * 25}%)` }}><ChatColumn /></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="ix-tabs" role="tablist">
        {tabs.map((t, i) => (
          <button key={i} type="button" role="tab" aria-selected={i === at} className={`ix-tab${i === at ? ' is-on' : ''}`} onClick={() => pick(i)}>
            {seen.has(i) && i !== at && <Icon name="check" size={12} strokeWidth={3} />}
            {t.label}
          </button>
        ))}
      </div>
      <div className="ix-ss-tab" key={at}>
        <div className={`ix-ss-ui is-${tab.ui}`} aria-hidden>
          <div className="ix-ss-ui-screen">
            {tab.ui === 'ios' && (
              <div className="ix-ss-seg"><span>Screen</span><span className="is-on">{tab.button}</span></div>
            )}
            <ChatColumn count={3} />
            {tab.ui === 'android' && (
              <div className="ix-ss-bar"><span>✎</span><span className="is-on">{tab.button}</span><span>⤴</span></div>
            )}
          </div>
        </div>
        <p className="ix-ss-text">{R(tab.text)}</p>
      </div>
      {b.note && <p className="ix-ss-note">{R(b.note)}</p>}
    </Frame>
  );
}
