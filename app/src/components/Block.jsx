import { useState } from 'react';

import FigureWithBubble from './FigureWithBubble';
import GuideSimulator from './GuideSimulator';
import PlatformLogo from './PlatformLogo';
import { LinkIcon, PhoneIcon } from './HelpButton';
import { interactiveFor } from './ix';
import { Icon } from './ix/icons';

// ((term||explanation)) marks a term that is emphasised and explained on
// hover/focus. §5 — the tooltip is CSS-only and inline, so it survives an
// iframe with a strict CSP and needs no positioning library.
// [label](url) is an inline link; `tel:` and `mailto:` open in place, web
// addresses in a new tab. **bold** carries the lead-in of a list item, so the
// eye catches what the item is about before reading it. All markers share one
// pass so they can mix inside one string.
const TERM = /\(\((.+?)\|\|(.+?)\)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*(.+?)\*\*/g;

// The tooltip is centred on its term, so near a screen edge half of it was
// cut off, and near the top of the column it slid under the reader header.
// Before it shows, shift it back inside the screen and, if there is no room
// above, open it below the term.
function placeTip(term) {
  const tip = term.querySelector('.ms-tip');
  if (!tip) return;
  term.style.setProperty('--tip-dx', '0px');
  term.classList.remove('is-below');
  const r = tip.getBoundingClientRect();
  const pad = 10;
  const vw = document.documentElement.clientWidth;
  let dx = 0;
  if (r.left < pad) dx = pad - r.left;
  else if (r.right > vw - pad) dx = vw - pad - r.right;
  term.style.setProperty('--tip-dx', `${Math.round(dx)}px`);
  const scroller = term.closest('.ms-reader-scroll');
  const top = scroller ? scroller.getBoundingClientRect().top : 0;
  if (r.top < top + pad) term.classList.add('is-below');
}

function renderInline(text, onOpenHelp) {
  if (typeof text !== 'string'
      || !(text.includes('((') || text.includes('](') || text.includes('**'))) return text;
  const out = [];
  let last = 0;
  for (const m of text.matchAll(TERM)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[3] !== undefined) {
      // (#help) — не адрес, а та же панель, что открывает кнопка в шапке.
      // Дублировать контакты в тексте не нужно: ссылка ведёт к ним.
      if (m[4] === '#help') {
        out.push(
          <button
            key={m.index}
            type="button"
            className="ms-help-inline"
            onClick={(e) => { e.stopPropagation(); onOpenHelp?.(); }}
          >
            <PhoneIcon size={13} />
            <span>{m[3]}</span>
          </button>,
        );
        last = m.index + m[0].length;
        continue;
      }
      const external = /^https?:/i.test(m[4]);
      const phone = /^tel:/i.test(m[4]);
      // Same icons as the help panel: a handset before a number, an
      // external-link arrow after a site.
      out.push(
        <a
          key={m.index}
          href={m[4]}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer noopener' : undefined}
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, verticalAlign: 'baseline', color: '#0F7FA8', fontWeight: 600, textDecoration: 'none' }}
        >
          <span style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>{m[3]}</span>
          {phone && <PhoneIcon size={13} />}
          {external && <LinkIcon size={13} />}
        </a>,
      );
      last = m.index + m[0].length;
      continue;
    }
    if (m[5] !== undefined) {
      out.push(<b key={m.index} style={{ fontWeight: 700, color: '#151A21' }}>{m[5]}</b>);
      last = m.index + m[0].length;
      continue;
    }
    out.push(
      // The term lives inside the card, whose click flips it. Swallow the
      // event so opening the tooltip — the only way to read it on touch —
      // does not flip the card away from the text being explained.
      <span
        key={m.index}
        className="ms-term"
        tabIndex={0}
        onMouseEnter={(e) => placeTip(e.currentTarget)}
        onFocus={(e) => placeTip(e.currentTarget)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
      >
        <strong style={{ fontWeight: 600, color: '#0F7FA8' }}>{m[1]}</strong>
        <span className="ms-tip" role="tooltip">{m[2]}</span>
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Лампочка для блока подсказки (№11) — рисуется, а не грузится: §5. */
function BulbIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <path d="M9 17.2h6M10 20.5h4M12 3.2a5.8 5.8 0 013.5 10.4c-.6.5-.9 1-.9 1.6H9.4c0-.6-.3-1.1-.9-1.6A5.8 5.8 0 0112 3.2z"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Звёздочка для блока «Հետաքրքիր է» (№9). */
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z"
        stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * №9 «Հետաքրքիր է» и №11 подсказка-лампочка. Оба — необязательное
 * углубление: свёрнуты, чтобы не разрывать основной текст, и не участвуют
 * в гейте D9. <details> взят намеренно: раскрытие работает без JS и
 * доступно с клавиатуры.
 */
function Aside({ kind, title, text, items, onOpenHelp }) {
  const R = (t) => renderInline(t, onOpenHelp);
  const isTip = kind === 'tip';
  return (
    <details className={isTip ? 'ms-aside is-tip' : 'ms-aside is-did'}>
      <summary className="ms-aside-head">
        <span className="ms-aside-icon" aria-hidden>{isTip ? <BulbIcon /> : <StarIcon />}</span>
        <span className="ms-aside-title">{title || (isTip ? 'Խորհուրդ' : 'Հետաքրքիր է')}</span>
        <span className="ms-aside-more" aria-hidden />
      </summary>
      <div className="ms-aside-body">
        {text && <p className="ms-aside-text">{renderInline(text)}</p>}
        {(items || []).map((t, i) => (
          <div key={i} className="ms-aside-item">
            <span className="ms-aside-dot" aria-hidden />
            <span>{renderInline(t)}</span>
          </div>
        ))}
      </div>
    </details>
  );
}

/**
 * Renders one content block. The gating rules (D9) live in the parent —
 * this component only reports opens/marks upward.
 */
export default function Block({ block: b, mod, scope, step, index, state, update, anim, delay, onOpenHelp }) {
  // Обёртка: внутри блока разметка знает, чем открыть панель помощи.
  const R = (t) => renderInline(t, onOpenHelp);

  const key = `${scope}:${step}:${index}`;
  // Two different things: `seen` is progress — the panel has been opened at
  // least once and stays credited after it is closed again (D16); `isOpen` is
  // only whether it is expanded right now. Expansion is local UI state so a
  // reader can tidy the page without losing the credit for what they read.
  const seen = !!state.opened[key];
  const [isOpen, setOpen] = useState(false);
  // Какая подача гайда открыта. Локальное состояние, не прогресс: способ
  // чтения не должен попадать в сохранённый прогресс и переживать перезагрузку.
  const [view, setView] = useState('sim');

  const credit = () => {
    if (!seen) update((prev) => ({ opened: { ...prev.opened, [key]: true } }));
  };
  // A guide is credited by reading, not by expanding: either the text tab
  // is chosen (the steps are all on screen at once) or the simulator has
  // been walked to its last screen. Other panels are credited on opening.
  const toggle = () => {
    if (!isOpen && b.k !== 'guide') credit();
    setOpen((v) => !v);
  };

  const wrap = (children) => (
    <div style={{ animation: anim, animationDelay: delay }}>{children}</div>
  );

  // `afterFlip` привязывает любой блок к флеш-карточкам того же шага по id:
  // он показывается, только пока перевёрнута хотя бы одна из указанных
  // карточек (`card` — номер или список номеров). Смотрит на флаг переворота,
  // а не на активную вкладку: карточка может быть перевёрнута, но не выбрана.
  // То же правило работает и для отдельных пунктов списка (`{ text, afterFlip }`).
  // `all: true` — нужны все перечисленные карточки, `not` — эти должны быть
  // НЕ перевёрнуты. Так одна фраза получает варианты под сочетания карточек.
  const flipOk = (rule) => {
    if (!rule) return true;
    const blocks = (mod.steps[step] || { blocks: [] }).blocks;
    const ci = blocks.findIndex((x) => x.k === 'cards' && x.id === rule.cards);
    if (ci < 0) return false;
    const on = (c) => !!state.cardFlip?.[`${scope}:${step}:${ci}:${c}`];
    const wanted = [].concat(rule.card);
    const ok = rule.all ? wanted.every(on) : wanted.some(on);
    return ok && ![].concat(rule.not ?? []).some(on);
  };
  if (!flipOk(b.afterFlip)) return null;

  // `showAfter: "<id>"` — блок появляется, только когда пройден блок того
  // же шага с этим `id` (например, список «Այդ դեպքում…» — после того как
  // стёрта фольга над абзацем, к которому он относится). Появляется с той
  // же анимацией входа, что и весь раздел.
  if (b.showAfter) {
    const blocks = (mod.steps[step] || { blocks: [] }).blocks;
    const gate = blocks.findIndex((x) => x.id === b.showAfter);
    if (gate >= 0 && !state.opened[`${scope}:${step}:${gate}`]) return null;
  }

  // Интерактивные блоки (components/ix): тот же текст документа, другая
  // подача. Пройденный блок засчитывается так же, как раскрытая панель, и
  // после перезагрузки показывается уже собранным.
  const Interactive = interactiveFor(b);
  if (Interactive) {
    return wrap(<Interactive block={b} done={seen} onDone={credit} R={R} />);
  }

  if (b.k === 'p') {
    return wrap(<p style={{ margin: 0, fontSize: 16, lineHeight: 1.8, color: '#2B313A' }}>{R(b.text)}</p>);
  }

  if (b.k === 'h') {
    return wrap(
      <h2 style={{ margin: '14px 0 0', fontFamily: "'Noto Serif Armenian', 'Spectral', serif", fontSize: 22, lineHeight: 1.35, fontWeight: 600, letterSpacing: '-.3px' }}>
        {b.text}
      </h2>,
    );
  }

  // One `width` sizes the figure, the bubble and the text together.
  if (b.k === 'figure') {
    return wrap(
      <FigureWithBubble
        src={b.src}
        alt={b.alt}
        bubble={b.bubble}
        bubbleText={b.bubbleText}
        width={b.width}
        align={b.align}
        asideTitle={b.asideTitle}
        asideText={b.asideText}
      />,
    );
  }

  if (b.k === 'note') {
    // `tone: "danger"` — красная врезка для «чего НЕ делать». Тот же цвет,
    // что у кнопки помощи: в палитре он означает «осторожно».
    const danger = b.tone === 'danger';
    // `big` — key callout («Ոսկե կանոնը»): only the title changes, becoming a
    // real bold heading in the serif face; the body stays like other notes.
    const big = !!b.big;
    return wrap(
      // Оттенок поверх сплошного фона страницы: полупрозрачная заливка
      // пропускала цветное пятно верха страницы (.ms-reader-glow).
      <div style={{ padding: '22px 24px', borderRadius: 16, background: `linear-gradient(${danger ? 'rgba(217,58,58,.07)' : 'rgba(28,171,226,.08)'} 0 0), var(--ms-page)`, borderLeft: `3px solid ${danger ? '#D93A3A' : '#1CABE2'}` }}>
        {big ? (
          <div style={{ fontFamily: "'Noto Serif Armenian', 'Spectral', serif", fontSize: 18, lineHeight: 1.3, fontWeight: 700, letterSpacing: '-.2px', color: danger ? '#B32B2B' : '#0F7FA8' }}>{b.title}</div>
        ) : (
          <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: danger ? '#B32B2B' : '#0F7FA8', fontWeight: 600 }}>{b.title}</div>
        )}
        <p style={{ margin: '11px 0 0', fontSize: 15.5, lineHeight: 1.75, color: '#2B313A' }}>{R(b.text)}</p>
        {/* Optional bullet list under the paragraph, same dot as other lists. */}
        {b.items && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {b.items.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 15.5, lineHeight: 1.75, color: '#2B313A' }}>
                <span aria-hidden style={{ flexShrink: 0, marginTop: 10, width: 5, height: 5, borderRadius: '50%', background: danger ? '#D93A3A' : '#1CABE2' }} />
                <span>{R(t)}</span>
              </div>
            ))}
          </div>
        )}
      </div>,
    );
  }

  if (b.k === 'list') {
    return wrap(
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {(b.items || []).filter((t) => typeof t === 'string' || flipOk(t.afterFlip)).map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0, marginTop: 9, width: 5, height: 5, borderRadius: '50%', background: '#1CABE2' }} />
            <span style={{ fontSize: 15, lineHeight: 1.75, color: '#2B313A' }}>{R(typeof t === 'string' ? t : t.text)}</span>
          </div>
        ))}
      </div>,
    );
  }

  if (b.k === 'links') {
    return wrap(
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(b.items || []).map((it, i) => {
          const body = (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#151A21' }}>{it.title}</span>
                {it.url && <span style={{ display: 'inline-flex', color: '#1CABE2' }}><LinkIcon size={14} /></span>}
              </div>
              <div style={{ marginTop: 5, fontSize: 13, lineHeight: 1.6, color: '#5A6270' }}>{it.meta}</div>
            </>
          );
          // Адрес в документе был живой ссылкой — здесь он тоже кликается,
          // а не просто напечатан. Карточки без адреса остаются текстом.
          return it.url ? (
            <a key={i} className="ms-slide ms-linkcard" href={it.url} target="_blank" rel="noreferrer noopener">
              {body}
            </a>
          ) : (
            <div key={i} className="ms-slide ms-linkcard is-plain">{body}</div>
          );
        })}
      </div>,
    );
  }

  // №9 — «Հետաքրքիր է» отдельным раскрывающимся окном с иконкой.
  // №11 — дополнительная информация через иконку-лампочку.
  // Оба — необязательное углубление: свёрнуты по умолчанию, чтобы не
  // разрывать основной текст, и не участвуют в гейте (D9) — модуль нельзя
  // застопорить на факультативном блоке.
  if (b.k === 'did' || b.k === 'tip') {
    return wrap(<Aside kind={b.k} title={b.title} text={b.text} items={b.items} onOpenHelp={onOpenHelp} />);
  }

  // №39 — источники в конце модуля: свёрнуты в компактный список, полное
  // описание раскрывается по наведению и по фокусу с клавиатуры.
  if (b.k === 'sources') {
    return wrap(
      <ol className="ms-src">
        {(b.items || []).map((s, i) => (
          <li key={i} className="ms-src-item">
            <a className="ms-src-link" href={s.url} target="_blank" rel="noreferrer noopener">
              <span className="ms-src-n">{i + 1}</span>
              <span className="ms-src-title">{s.title}</span>
              <span className="ms-src-host">{s.host}</span>
              <span className="ms-tip ms-src-tip" role="tooltip">{s.note}</span>
            </a>
          </li>
        ))}
      </ol>,
    );
  }

  if (b.k === 'check') {
    return wrap(
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(b.items || []).map((t, i) => {
          const ck = `${key}:${i}`;
          const on = !!state.checks[ck];
          return (
            <div
              key={i}
              className="ms-slide"
              role="checkbox"
              aria-checked={on}
              tabIndex={0}
              onClick={() => update((prev) => ({ checks: { ...prev.checks, [ck]: !prev.checks[ck] } }))}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); update((prev) => ({ checks: { ...prev.checks, [ck]: !prev.checks[ck] } })); } }}
              style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 18px', borderRadius: 14, background: '#FFFFFF', border: '1px solid rgba(21,26,33,.1)', cursor: 'pointer', transition: 'transform .2s cubic-bezier(.2,.85,.2,1), border-color .2s' }}
            >
              <span style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 7, background: on ? '#1CABE2' : 'transparent', border: `1.5px solid ${on ? '#1CABE2' : 'rgba(21,26,33,.28)'}`, color: on ? '#0E1218' : 'transparent', fontSize: 12, transition: 'background .2s, border-color .2s' }}>
                {on ? '✓' : ''}
              </span>
              <span style={{ fontSize: 15, lineHeight: 1.7, color: on ? '#5A6270' : '#151A21' }}>{R(typeof t === 'string' ? t : t.text)}</span>
            </div>
          );
        })}
      </div>,
    );
  }

  // Collapsible panels: guide, table and pair — opening is enough (OQ5).
  // Рамка и шапка — те же, что у интерактивных блоков модуля 2 (ix/shared ›
  // Frame, классы `ix-*`), чтобы все модули выглядели одинаково.
  const panelClass = `ix${seen ? ' is-done' : isOpen ? ' is-open' : ''}`;
  // Closed but already read: the header says so, so the credit is visible.
  const panelLabel = (readLabel) => (isOpen ? 'Փակել' : seen ? readLabel : 'Բացել');

  // `icon` — optional tile between the +/− box and the title (guides show
  // their platform's logo there).
  const head = (title, sub, rightLabel, icon = null) => (
    <div
      className="ix-head is-toggle ms-panel-head"
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      onClick={toggle}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
    >
      <span className="ix-head-icon" aria-hidden>
        <Icon name={isOpen ? 'minus' : 'plus'} size={15} strokeWidth={2.4} />
      </span>
      {icon}
      <span className="ix-head-text">
        <span className="ix-title">{title}</span>
        {sub ? <span className="ix-hint">{sub}</span> : null}
      </span>
      {/* Credited: the tick stays before the label whether the panel is open
          or closed, so the reader sees the block is done while inside it.
          Colour follows credit, not expansion — cyan always means "done". */}
      <span className="ix-head-side">
        <span className={seen ? 'ix-progress' : 'ix-progress is-muted'}>
          {seen && <Icon name="check" size={13} strokeWidth={3} />}
          {rightLabel}
        </span>
      </span>
    </div>
  );

  if (b.k === 'guide') {
    return wrap(
      <div className={panelClass}>
        {head(b.name, b.sub, panelLabel('Դիտված է'), <PlatformLogo name={b.name} />)}
        {isOpen && (
          <div className="ms-guide-body" style={{ display: 'flex', flexDirection: 'column', gap: 13, animation: 'msFadeUp .32s cubic-bezier(.2,.85,.2,1) both' }}>
            {/* Требование заказчика: инструкция показывается наглядно И остаётся
                текстовым пошаговиком. Не «или» — обе подачи доступны в один клик,
                потому что на симуляторе учат путь, а по списку сверяются, когда
                уже настраивают своё устройство. */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
              {[['sim', 'Սիմուլյատոր'], ['text', 'Տեքստային քայլաշար']].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => { setView(id); if (id === 'text') credit(); }}
                  style={{
                    padding: '7px 14px', borderRadius: 100, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                    border: `1px solid ${view === id ? '#1CABE2' : 'rgba(21,26,33,.14)'}`,
                    background: view === id ? 'rgba(28,171,226,.12)' : 'transparent',
                    color: view === id ? '#0F7FA8' : '#6E7787',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {view === 'sim' && <GuideSimulator guide={b} onComplete={credit} />}

            {view === 'text' && (b.steps || []).map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 8, background: 'rgba(28,171,226,.14)', color: '#0F7FA8', fontSize: 12, fontWeight: 600 }}>{i + 1}</span>
                <span style={{ fontSize: 15, lineHeight: 1.72, color: '#2B313A' }}>{R(t)}</span>
              </div>
            ))}
          </div>
        )}
      </div>,
    );
  }

  if (b.k === 'cards') {
    const cards = b.cards || [];
    const active = Math.min(state.cardTab?.[key] ?? 0, Math.max(0, cards.length - 1));
    const card = cards[active];
    const flipped = !!state.cardFlip?.[`${key}:${active}`];
    const seen = cards.filter((_, i) => state.cardFlip?.[`${key}:${i}`]).length;

    // Picking a stage never counts as progress — only a flip does, so the
    // panel cannot be satisfied by tabbing across the three ages. (D9)
    const pick = (i) =>
      update((prev) => ({ cardTab: { ...prev.cardTab, [key]: i } }));

    const flip = () =>
      update((prev) => {
        const fk = `${key}:${active}`;
        const next = { ...prev.cardFlip, [fk]: !prev.cardFlip?.[fk] };
        // One flip opens the panel; un-flipping never takes the credit back.
        const opened = next[fk] ? { ...prev.opened, [key]: true } : prev.opened;
        return { cardFlip: next, opened };
      });

    return wrap(
      <div className={seen > 0 ? 'ix is-done' : 'ix'}>
        <div className="ix-head">
          <span className="ix-head-icon" aria-hidden><Icon name="cards" /></span>
          <span className="ix-head-text">
            <span className="ix-title">{b.title}</span>
            <span className="ix-hint">{b.hint}</span>
          </span>
          {/* Счётчик появляется после первого переворота. Подсказка «переверни»
              стоит на самой карточке — в шапке она дублировалась. */}
          {seen > 0 && (
            <span className="ix-head-side">
              <span className="ix-progress"><Icon name="check" size={13} strokeWidth={3} />{seen} / {cards.length}</span>
            </span>
          )}
        </div>

        <div role="tablist" aria-label={b.title} style={{ display: 'flex', gap: 8, padding: '14px 22px 0', flexWrap: 'wrap' }}>
          {cards.map((c, i) => {
            const on = i === active;
            return (
              <button
                key={i}
                role="tab"
                aria-selected={on}
                className="ms-lift"
                onClick={() => pick(i)}
                style={{ padding: '9px 18px', borderRadius: 999, cursor: 'pointer', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', background: on ? '#1CABE2' : 'transparent', border: `1px solid ${on ? '#1CABE2' : 'rgba(21,26,33,.18)'}`, color: on ? '#0E1218' : '#5A6270', transition: 'background .2s, color .2s, border-color .2s' }}
              >
                {c.tab}
                {state.cardFlip?.[`${key}:${i}`] ? <span style={{ marginInlineStart: 7, opacity: .75 }}>✓</span> : null}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '16px 22px 22px' }}>
          <div
            className="ms-card"
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            aria-label={flipped ? 'Շրջել դեպի տարիքային փուլը' : `Բացել «${card?.front}» քարտի բովանդակությունը`}
            onClick={flip}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } }}
            style={{ position: 'relative', cursor: 'pointer', borderRadius: 16, minHeight: 232, display: 'grid' }}
          >
            <div className={`ms-card-inner${flipped ? ' is-flipped' : ''}`}>
              {/* Лицевая сторона — только приглашение перевернуть: название
                  стадии уже стоит на выбранной вкладке. `front` остаётся в
                  данных ради aria-label. */}
              <div className="ms-card-face" style={{ display: 'grid', placeItems: 'center', textAlign: 'center', padding: 28, borderRadius: 16, background: 'rgba(28,171,226,.07)', border: '1px solid rgba(28,171,226,.3)' }}>
                <div style={{ fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', color: '#0F7FA8', fontWeight: 600 }}>↻ Շրջել քարտը</div>
              </div>

              <div className="ms-card-face ms-card-back" style={{ padding: 26, borderRadius: 16, background: '#FFFFFF', border: '1px solid rgba(21,26,33,.14)', display: 'flex', flexDirection: 'column', gap: 15 }}>
                {(b.fields || []).map((f, i) => {
                  const value = card?.back?.[i];
                  return (
                    <div key={i}>
                      <div style={{ fontSize: 14.5, lineHeight: 1.45, color: '#2B313A', fontWeight: 600 }}>{f}</div>
                      {Array.isArray(value) ? (
                        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {value.map((t, j) => (
                            <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <span style={{ flexShrink: 0, marginTop: 8, width: 5, height: 5, borderRadius: '50%', background: '#1CABE2' }} />
                              <span style={{ fontSize: 14.5, lineHeight: 1.6, color: '#2B313A' }}>{R(t)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ marginTop: 5, fontSize: 14.5, lineHeight: 1.65, color: '#2B313A' }}>{R(value)}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>,
    );
  }

  // Сравнительная таблица (модуль 2: «шутка / конфликт / буллинг»). Первая
  // колонка — признак, остальные — сравниваемые явления.
  //
  // На узком экране таблица не скроллится вбок, а разбирается на карточки:
  // по карточке на признак, внутри — строка на каждое явление. Горизонтальный
  // скролл прячет половину сравнения за краем экрана, а смысл таблицы именно
  // в том, чтобы видеть колонки рядом.
  if (b.k === 'table') {
    return wrap(
      <div className={panelClass}>
        {head(b.title, null, panelLabel('Կարդացված'))}
        {isOpen && (
          <div style={{ padding: '0 16px 18px', animation: 'msFadeUp .32s cubic-bezier(.2,.85,.2,1) both' }}>
            <table className={b.plain ? 'ms-cmp is-plain' : 'ms-cmp'}>
              <thead>
                <tr>{(b.head || []).map((h) => <th key={h} scope="col">{R(h)}</th>)}</tr>
              </thead>
              <tbody>
                {(b.rows || []).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      // `plain` — колонки равноправны (модуль 4: «что сказать»
                      // против «чего не говорить»). Без него первая колонка —
                      // признак сравнения и идёт заголовком строки.
                      ci === 0 && !b.plain
                        ? <th key={ci} scope="row">{R(cell)}</th>
                        : <td key={ci}>{R(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Тот же материал карточками — показывается вместо таблицы на узком экране. */}
            <div className="ms-cmp-cards">
              {(b.rows || []).map((row, ri) => (
                <div key={ri} className="ms-cmp-card">
                  {!b.plain && <div className="ms-cmp-card-h">{R(row[0])}</div>}
                  {(b.plain ? row : row.slice(1)).map((cell, ci) => (
                    <div key={ci} className="ms-cmp-card-row">
                      <span className="ms-cmp-card-k">{R((b.head || [])[b.plain ? ci : ci + 1])}</span>
                      <span>{R(cell)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>,
    );
  }

  // Две колонки «что сказать / что не говорить» — тот же вид, что у
  // разложенного `sort` в модуле 2 (ix/Sort › результат).
  if (b.k === 'pair') {
    // В данных части заголовков уже стоит ✓/✕ — значок рисуется отдельно.
    const bare = (t) => String(t || '').replace(/^[✓✕]\s*/, '');
    const col = (tone, icon, title, items) => (
      <div className={`ix-sort-col tone-${tone}`}>
        <div className="ix-sort-col-h">
          <span className="ix-bin-ico" aria-hidden><Icon name={icon} size={14} strokeWidth={2.6} /></span>
          {bare(title)}
        </div>
        <div className="ix-sort-col-list">
          {(items || []).map((t, i) => (
            <div key={i} className="ix-sort-item" style={{ '--i': i }}>
              <span className="ix-sort-dot" aria-hidden />
              <span>{R(t)}</span>
            </div>
          ))}
        </div>
      </div>
    );
    return wrap(
      <div className={panelClass}>
        {head(b.title, null, panelLabel('Կարդացված'))}
        {isOpen && (
          <div className="ix-sort-result" style={{ padding: '0 16px 18px', animation: 'msFadeUp .32s cubic-bezier(.2,.85,.2,1) both' }}>
            {col('do', 'check', b.doTitle, b.doItems)}
            {col('dont', 'close', b.dontTitle, b.dontItems)}
          </div>
        )}
      </div>,
    );
  }

  return null;
}
