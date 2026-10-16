import { useEffect, useMemo, useState } from 'react';
import { buildScenario, menuRows, sideRows, hasRussian, subRu } from '../guideSim';
import { useProgressStore } from '../store/progress';
import { Glyph, glyphFor, skinFor } from './simSkins';

/**
 * Модель экрана устройства: нужный пункт подсвечен, нажатие уводит на
 * следующий экран. Родители теряются не потому, что не понимают зачем, а
 * потому, что не знают, где в настройках что лежит — пройдя путь один раз
 * здесь, человек узнаёт его на своём телефоне.
 *
 * Симулятор не заменяет текстовый пошаговик, а идёт рядом с ним: текущий шаг
 * показан целиком над устройством, а полный список — на соседней вкладке.
 *
 * Экран оформлен под платформу гайда (simSkins.jsx): телефон, окно
 * компьютера или телевизор консоли, со своими цветами и иконками.
 * Внутри симулятора по-прежнему нет движения — см. CLAUDE.md.
 */
export default function GuideSimulator({ guide, onComplete }) {
  const screens = useMemo(() => buildScenario(guide), [guide]);
  const [at, setAt] = useState(0);
  const [toggled, setToggled] = useState(false);
  const platform = screens[0]?.platform;
  const skin = skinFor(platform);

  // Язык подписей на экране устройства. Один на все гайды и переживает
  // перезагрузку: родитель с русским телефоном выбирает RU один раз, а не
  // на каждой из 13 платформ. Переключатель показывается, только если в
  // шагах гайда вообще есть русские эквиваленты.
  const storedLang = useProgressStore((s) => s.simLang);
  const update = useProgressStore((s) => s.update);
  const bilingual = useMemo(() => hasRussian(screens), [screens]);
  const lang = bilingual && storedLang === 'ru' ? 'ru' : 'en';
  const setLang = (l) => update({ simLang: l });
  // Подпись пункта в выбранном языке; без русского варианта остаётся английский.
  const L = (en, ru) => (lang === 'ru' && ru) || en;

  const finished = at >= screens.length;
  // Reaching the last screen is what credits the guide (Block.jsx › credit).
  useEffect(() => { if (finished) onComplete?.(); }, [finished, onComplete]);
  const sc = finished ? null : screens[at];
  const step = finished ? null : guide.steps[sc.stepIndex];

  const DONE_TEXT = 'Այս ուղեցույցի բոլոր քայլերն անցել եք սիմուլյատորի վրա։';
  // Шаги разной длины, и блок задания менял высоту на каждом переходе —
  // устройство под ним прыгало вверх-вниз. Самый длинный текст держит высоту
  // невидимой копией, актуальный текст лежит поверх: блок больше не дышит.
  const tallest = useMemo(
    () => [...(guide.steps || []), DONE_TEXT].reduce((a, b) => (b.length > a.length ? b : a), ''),
    [guide],
  );

  const advance = () => { setToggled(false); setAt((i) => i + 1); };
  // Стрелки по бокам корпуса: не всем очевидно, что двигаться надо тапом по
  // подсвеченному пункту. Ими можно листать экраны в обе стороны, минуя
  // действие, — симулятор учит «где лежит», а не проверяет.
  const back = () => { setToggled(false); setAt((i) => Math.max(0, i - 1)); };
  // Переключателю нужно успеть доехать, но не настолько, чтобы это
  // читалось отдельным движением перед сменой экрана.
  const flip = () => { setToggled(true); setTimeout(advance, 240); };

  // Заголовок экрана. Без пути экран открыт в разделе, о котором гайд.
  const title = finished
    ? guide.name
    : sc.title
      ? L(sc.title, sc.ruTitle)
      : L(guide.sub?.split('(')[0]?.trim(), subRu(guide.sub)) || guide.name;

  const wide = skin.device !== 'phone';

  return (
    <div>
      {/* Задание — тот же текст, что и в списке шагов. */}
      <div style={{ borderRadius: 14, background: 'rgba(28,171,226,.07)', padding: '15px 18px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: '.13em', textTransform: 'uppercase', color: '#0F7FA8', fontWeight: 600, marginBottom: 6 }}>
          {finished
            ? 'Ավարտված է'
            : `Քայլ ${sc.stepIndex + 1} / ${guide.steps.length}`}
        </div>
        <div style={{ position: 'relative' }}>
          {/* Держит высоту — виден только самый длинный шаг, и то прозрачно. */}
          <div aria-hidden style={{ fontSize: 14.5, lineHeight: 1.7, visibility: 'hidden' }}>{tallest}</div>
          <div style={{ position: 'absolute', inset: 0, fontSize: 14.5, lineHeight: 1.7, color: '#2B313A' }}>
            {finished ? DONE_TEXT : step}
          </div>
        </div>
      </div>

      {/* Точки прогресса по экранам */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        {screens.map((s, i) => (
          <span
            key={s.key}
            // Ширина одинаковая у всех: активная точка была шире остальных,
            // и на каждом переходе весь ряд разъезжался. Отличается цветом.
            style={{
              width: 18, height: 4, borderRadius: 2,
              background: i < at ? '#24A783' : i === at ? '#1CABE2' : 'rgba(21,26,33,.14)',
            }}
          />
        ))}
      </div>

      {/* Корпус устройства, по бокам — стрелки «назад» / «вперёд», по центру
          его высоты. На узком экране стрелки уходят под корпус (.ms-sim-row
          в global.css): рядом с ними устройство ужималось вдвое. */}
      <div className="ms-sim-row">
        <Arrow dir="prev" onClick={back} disabled={at === 0} label="Նախորդ էկրան" />
        <div className={`ms-sim-phone${wide ? ' is-wide' : ''}`}>
          <Device skin={skin} title={title}>
            <Screen skin={skin} platform={platform} title={title} canBack={at > 0}
              lang={bilingual ? <LangToggle lang={lang} onChange={setLang} skin={skin} /> : null}
            >
              {finished ? (
                <Finished skin={skin} guide={guide} count={screens.length} onAgain={() => { setAt(0); setToggled(false); }} />
              ) : (
                <div key={sc.key}>
                  {sc.kind === 'act' && <Act skin={skin} guide={guide} onDone={advance} />}

                  {sc.kind === 'toggle' && (
                    <Group skin={skin}>
                      <Row skin={skin} label={L(sc.target, sc.ruTarget)} en={sc.target} highlight>
                        <Switch skin={skin} on={toggled} onClick={flip} />
                      </Row>
                      {menuRows(sc).filter((r) => !r.target).slice(0, 3).map((r) => (
                        <Row key={r.en} skin={skin} label={L(r.en, r.ru)} en={r.en} dim>
                          <Switch skin={skin} on={false} />
                        </Row>
                      ))}
                    </Group>
                  )}

                  {(sc.kind === 'nav' || sc.kind === 'tap') && (
                    <Group skin={skin}>
                      {menuRows(sc).map((r) => (
                        <Row
                          key={r.en}
                          skin={skin}
                          label={L(r.en, r.ru)}
                          en={r.en}
                          highlight={r.target}
                          dim={!r.target}
                          onClick={r.target ? advance : undefined}
                        >
                          {skin.chevron !== null && <Chevron skin={skin} on={r.target} />}
                        </Row>
                      ))}
                    </Group>
                  )}
                </div>
              )}
            </Screen>
          </Device>
        </div>
        <Arrow dir="next" onClick={advance} disabled={finished} label="Հաջորդ էկրան" />
      </div>

      {/* Второй язык текущей настройки — как в исходном документе. В режиме
          EN под экраном русский эквивалент, в режиме RU — английский оригинал,
          чтобы оба названия были перед глазами при любом выборе. */}
      {!finished && sc.ru && (
        <p style={{ margin: '14px 0 0', textAlign: 'center', fontSize: 12.5, color: '#6E7787' }}>
          {lang === 'ru' && sc.ruTarget
            ? <>{sc.ruTarget} — «{sc.target}»</>
            : <>{sc.target} — «{sc.ru}»</>}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Корпус: телефон, окно компьютера или телевизор консоли.              */

function Device({ skin, title, children }) {
  if (skin.device === 'phone') {
    return (
      <div style={{ background: '#151A21', borderRadius: 34, padding: 9, boxShadow: '0 24px 50px -24px rgba(21,26,33,.5), inset 0 0 0 1.5px #2B313A' }}>
        <div style={{ position: 'relative', borderRadius: 26, overflow: 'hidden', height: 380, display: 'flex', flexDirection: 'column', background: skin.screen, fontFamily: skin.font }}>
          <StatusBar skin={skin} />
          {children}
        </div>
      </div>
    );
  }
  if (skin.device === 'tv') {
    return (
      <div>
        <div style={{ background: '#0B0D10', borderRadius: 12, padding: 7, boxShadow: '0 24px 50px -24px rgba(21,26,33,.6)' }}>
          <div className="ms-sim-tv" style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: skin.screen, fontFamily: skin.font }}>
            {children}
          </div>
        </div>
        <div aria-hidden style={{ width: 90, height: 8, margin: '0 auto', background: '#0B0D10', borderRadius: '0 0 6px 6px' }} />
      </div>
    );
  }
  // desktop: окно приложения с заголовком в духе своей ОС
  return (
    <div style={{ borderRadius: skin.window === 'win' ? 8 : 12, overflow: 'hidden', border: '1px solid rgba(21,26,33,.18)', boxShadow: '0 24px 50px -26px rgba(21,26,33,.55)', background: skin.screen, fontFamily: skin.font }}>
      <WindowBar skin={skin} title={title} />
      <div style={{ position: 'relative', height: 300, display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );
}

function WindowBar({ skin }) {
  if (skin.window === 'mac') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 12px', background: skin.side, borderBottom: `1px solid ${skin.sep}` }}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        <span style={{ flex: 1, textAlign: 'center', fontSize: 11.5, fontWeight: 600, color: '#4A4A4F', marginRight: 42 }}>System Settings</span>
      </div>
    );
  }
  if (skin.window === 'web') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#E8EAED', borderBottom: `1px solid ${skin.sep}` }}>
        {['#C7C9CC', '#C7C9CC', '#C7C9CC'].map((c, i) => <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
        <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 100, background: '#FFFFFF', fontSize: 11, color: '#3C4043', minWidth: 0 }}>
          <Glyph name="lock" size={10} color="#5F6368" width={2.4} />
          <span style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>{skin.url}</span>
        </span>
      </div>
    );
  }
  // Windows 11
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 0 0 12px', background: skin.side, borderBottom: `1px solid ${skin.sep}` }}>
      <Glyph name="gear" size={12} color="#1A1A1A" width={2} />
      <span style={{ flex: 1, marginLeft: 8, fontSize: 11.5, color: '#1A1A1A' }}>Settings</span>
      {['—', '▢', '✕'].map((c) => <span key={c} style={{ width: 34, height: 28, display: 'grid', placeItems: 'center', fontSize: 11, color: '#1A1A1A' }}>{c}</span>)}
    </div>
  );
}

/** Строка состояния телефона: iPhone — часы и «остров», Android — часы и камера. */
function StatusBar({ skin }) {
  const ink = skin.dark ? '#FFFFFF' : '#000000';
  const bg = skin.head;
  if (skin.status === 'android') {
    return (
      <div aria-hidden style={{ position: 'relative', height: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: bg, color: ink, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
        <span>12:30</span>
        <span style={{ position: 'absolute', left: '50%', top: 8, width: 9, height: 9, marginLeft: -4.5, borderRadius: '50%', background: '#0B0D10' }} />
        <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Glyph name="wifi" size={11} color={ink} width={2.4} />
          <Glyph name="battery" size={13} color={ink} width={2} />
        </span>
      </div>
    );
  }
  return (
    <div aria-hidden style={{ position: 'relative', height: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: bg, color: skin.headText || ink, fontSize: 11.5, fontWeight: 700, flexShrink: 0 }}>
      <span>9:41</span>
      <span style={{ position: 'absolute', left: '50%', top: 7, width: 64, height: 17, marginLeft: -32, borderRadius: 100, background: '#0B0D10' }} />
      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
          {[4, 6, 8, 10].map((h) => <span key={h} style={{ width: 2.5, height: h, borderRadius: 1, background: skin.headText || ink }} />)}
        </span>
        <Glyph name="battery" size={15} color={skin.headText || ink} width={2} />
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Экран: шапка с заголовком и, у окон и консолей, боковое меню.        */

function Screen({ skin, platform, title, canBack, lang, children }) {
  const head = <Header skin={skin} title={title} canBack={canBack} lang={lang} />;
  const body = (
    <div className="ms-sim-body" style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 10 }}>
      {children}
    </div>
  );
  if (skin.device === 'phone') return <>{head}{body}</>;
  // Окно и консоль: слева корневое меню платформы, справа — текущий экран.
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
      <div className="ms-sim-side" aria-hidden style={{ width: '34%', flexShrink: 0, padding: '10px 8px', background: skin.side, borderRight: `1px solid ${skin.sep}`, overflow: 'hidden' }}>
        {sideRows(platform, 7).map((r) => {
          const { g } = glyphFor(r.en);
          return (
            <div key={r.en} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 7px', borderRadius: 6, fontSize: 10.5, color: skin.sideText, opacity: .78, lineHeight: 1.25 }}>
              <Glyph name={g} size={12} color={skin.sideText} width={2} />
              <span style={{ minWidth: 0 }}>{r.en}</span>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {head}
        {body}
      </div>
    </div>
  );
}

/**
 * Шапка экрана. Заголовок переносится, а не обрезается многоточием: «YouTube
 * Kids / Supervised / Restricted Mode» должно читаться целиком. Переключатель
 * EN/RU стоит у правого края, как кнопка в шапке настоящих настроек; место
 * под него и под стрелку «назад» держится всегда, чтобы заголовок не скакал.
 */
function Header({ skin, title, canBack, lang }) {
  const ink = skin.headText || skin.text;
  const left = skin.titleAlign === 'left';
  const large = skin.ui === 'win' || skin.ui === 'console' || skin.ui === 'web' || skin.ui === 'mac';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, minHeight: 44, padding: large ? '12px 14px 6px' : '8px 12px', background: skin.head, borderBottom: skin.ui === 'app' || skin.ui === 'cards' ? `1px solid ${skin.sep}` : 'none', flexShrink: 0 }}>
      {skin.back && (
        <span aria-hidden style={{ width: 14, flexShrink: 0, fontSize: skin.back === '‹' ? 22 : 15, lineHeight: 1, color: skin.ui === 'ios' ? skin.accent : ink, visibility: canBack ? 'visible' : 'hidden' }}>{skin.back}</span>
      )}
      <span
        style={{
          flex: 1, minWidth: 0, textAlign: left ? 'left' : 'center',
          padding: lang ? (left ? '0 62px 0 0' : '0 58px') : (left ? 0 : '0 14px'),
          fontSize: large ? 15 : 13.5, fontWeight: 700, lineHeight: 1.25, color: ink,
          overflowWrap: 'anywhere',
        }}
      >
        {title}
      </span>
      {lang && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>{lang}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Строки — у каждой раскладки своя подача.                             */

function Group({ skin, children }) {
  if (skin.ui === 'ios' || skin.ui === 'mac') {
    return (
      <div style={{ margin: '8px 12px 0', background: skin.group, borderRadius: 11, overflow: 'hidden' }}>{children}</div>
    );
  }
  if (skin.ui === 'win' || skin.ui === 'web' || skin.ui === 'cards') {
    return <div style={{ display: 'flex', flexDirection: 'column', gap: skin.ui === 'cards' ? 0 : 4, margin: skin.ui === 'cards' ? '8px 10px 0' : '6px 12px 0', borderRadius: skin.ui === 'cards' ? 10 : 0, overflow: 'hidden' }}>{children}</div>;
  }
  return <div style={{ paddingTop: skin.ui === 'console' ? 6 : 2 }}>{children}</div>;
}

function RowIcon({ skin, en, highlight }) {
  const { g, c } = glyphFor(en);
  if (skin.icon === 'square') {
    return (
      <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: 'grid', placeItems: 'center', background: c }}>
        <Glyph name={g} size={15} color="#FFFFFF" width={2.2} />
      </span>
    );
  }
  if (skin.icon === 'circle') {
    return (
      <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: `${c}22` }}>
        <Glyph name={g} size={16} color={c} width={2} />
      </span>
    );
  }
  const focusInk = skin.focus && highlight ? skin.focus.text : skin.text;
  return (
    <span style={{ width: 22, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
      <Glyph name={g} size={17} color={focusInk} width={1.9} />
    </span>
  );
}

function Row({ skin, label, en, highlight, dim, onClick, children }) {
  const ui = skin.ui;
  const card = ui === 'win' || ui === 'web';
  const focus = ui === 'console' && highlight ? skin.focus : null;
  const ink = focus ? focus.text : highlight ? (skin.dark ? '#FFFFFF' : skin.text) : skin.text;
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={highlight && onClick ? 'ms-sim-target' : undefined}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 11,
        padding: ui === 'material' ? '11px 16px' : ui === 'console' ? '9px 14px' : '10px 13px',
        margin: ui === 'console' ? '0 10px 4px' : 0,
        borderRadius: card ? 6 : ui === 'console' ? 8 : 0,
        background: focus ? focus.bg : card || ui === 'cards' ? skin.group : 'transparent',
        border: card ? `1px solid ${skin.sep}` : 'none',
        borderBottom: card || ui === 'console' || ui === 'material' ? (card ? `1px solid ${skin.sep}` : 'none') : `1px solid ${skin.sep}`,
        boxShadow: focus?.ring ? `0 0 0 2px ${focus.ring}` : 'none',
        opacity: dim ? 0.62 : 1,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <RowIcon skin={skin} en={en} highlight={highlight} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, lineHeight: 1.3, fontWeight: highlight ? 650 : 450, color: ink, overflowWrap: 'anywhere' }}>{label}</span>
      {children}
    </div>
  );
}

function Chevron({ skin, on }) {
  return <span aria-hidden style={{ flexShrink: 0, fontSize: 18, lineHeight: 1, color: on && skin.ui !== 'ios' ? skin.accent : skin.chevron }}>›</span>;
}

function Switch({ skin, on, onClick }) {
  const win = skin.ui === 'win' || skin.ui === 'web';
  const w = win ? 38 : 44;
  const h = win ? 20 : 26;
  const knob = win ? 12 : 22;
  const pad = (h - knob) / 2;
  return (
    <span
      onClick={onClick}
      role={onClick ? 'switch' : undefined}
      aria-checked={onClick ? on : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={onClick && !on ? 'ms-sim-switch' : undefined}
      style={{
        width: w, height: h, borderRadius: 100, flexShrink: 0, position: 'relative',
        background: on ? skin.on : skin.off,
        border: win && !on ? `1px solid ${skin.sub}` : 'none',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background .3s cubic-bezier(.2,.85,.2,1)',
      }}
    >
      <span style={{
        position: 'absolute', top: pad - (win && !on ? 1 : 0), left: pad - (win && !on ? 1 : 0), width: knob, height: knob, borderRadius: '50%',
        background: win && !on ? skin.sub : '#FFFFFF', boxShadow: win ? 'none' : '0 1px 4px rgba(0,0,0,.22)',
        transform: on ? `translateX(${w - knob - pad * 2}px)` : 'none', transition: 'transform .3s cubic-bezier(.2,.85,.2,1)',
      }} />
    </span>
  );
}

/* ------------------------------------------------------------------ */

/** Шаг без настроек (установить приложение, ввести дату) — подтверждение. */
function Act({ skin, guide, onDone }) {
  const { g, c } = glyphFor(guide.sub || guide.name);
  return (
    <div style={{ padding: '26px 20px', display: 'grid', placeItems: 'center', gap: 14, textAlign: 'center' }}>
      <span style={{ width: 54, height: 54, borderRadius: 16, background: skin.brand || c, display: 'grid', placeItems: 'center' }}>
        <Glyph name={g} size={26} color={skin.brand === '#FFFC00' || skin.brand === '#FFFFFF' ? '#000000' : '#FFFFFF'} width={2.1} />
      </span>
      <span style={{ fontSize: 13, color: skin.text, lineHeight: 1.45, fontWeight: 600 }}>{guide.name}</span>
      <button
        type="button"
        onClick={onDone}
        style={{ padding: '10px 20px', borderRadius: 100, border: 'none', background: skin.on, color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
      >
        Կատարեցի
      </button>
    </div>
  );
}

function Finished({ skin, guide, count, onAgain }) {
  return (
    <div style={{ padding: 24, display: 'grid', placeItems: 'center', gap: 12, textAlign: 'center' }}>
      <span style={{ width: 58, height: 58, borderRadius: '50%', background: '#24A783', display: 'grid', placeItems: 'center' }}>
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
          <path d="M5 12.5l4.6 4.6L19 7.5" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <b style={{ fontSize: 15, color: skin.text }}>{guide.name}</b>
      <span style={{ fontSize: 12.5, color: skin.sub }}>{count} գործողություն</span>
      <button
        type="button"
        onClick={onAgain}
        style={{ marginTop: 4, padding: '9px 18px', borderRadius: 100, border: `1px solid ${skin.sep}`, background: 'transparent', color: skin.text, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
      >
        Անցնել կրկին
      </button>
    </div>
  );
}

/** EN / RU — язык подписей на экране устройства. Компактный, под шапку экрана. */
function LangToggle({ lang, onChange, skin }) {
  const dark = skin?.dark;
  return (
    <div
      role="group"
      aria-label="Էկրանի լեզուն"
      style={{ display: 'inline-flex', flexShrink: 0, padding: 2, borderRadius: 100, border: `1px solid ${dark ? 'rgba(255,255,255,.22)' : 'rgba(21,26,33,.14)'}`, background: dark ? 'rgba(255,255,255,.08)' : '#F2F4F8' }}
    >
      {[['en', 'EN'], ['ru', 'RU']].map(([id, label]) => {
        const on = lang === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(id)}
            style={{
              padding: '2px 7px', borderRadius: 100, border: 'none',
              fontSize: 10, fontWeight: 700, letterSpacing: '.06em', lineHeight: 1.5,
              background: on ? '#1CABE2' : 'transparent',
              color: on ? '#fff' : dark ? '#C9CDD4' : '#6E7787',
              cursor: on ? 'default' : 'pointer',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Круглая стрелка сбоку от корпуса. Без анимаций — см. правило симулятора. */
function Arrow({ dir, onClick, disabled, label }) {
  return (
    <button
      type="button"
      className="ms-sim-arrow"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        flexShrink: 0, width: 40, height: 40, borderRadius: '50%',
        display: 'grid', placeItems: 'center',
        border: '1px solid rgba(21,26,33,.16)', background: '#FFFFFF',
        color: disabled ? '#B8C0D6' : '#0F7FA8',
        cursor: disabled ? 'default' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 12px rgba(21,26,33,.08)',
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path
          d={dir === 'prev' ? 'M14.5 6l-6 6 6 6' : 'M9.5 6l6 6-6 6'}
          stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
