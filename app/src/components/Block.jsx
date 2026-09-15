import { useState } from 'react';
import { M1 } from '../data/module01';
import FigureWithBubble from './FigureWithBubble';
import GuideSimulator from './GuideSimulator';
import { LinkIcon, PhoneIcon } from './HelpButton';

// ((term||explanation)) marks a term that is emphasised and explained on
// hover/focus. §5 — the tooltip is CSS-only and inline, so it survives an
// iframe with a strict CSP and needs no positioning library.
// [label](url) is an inline link; `tel:` and `mailto:` open in place, web
// addresses in a new tab. Both markers share one pass so they can mix.
const TERM = /\(\((.+?)\|\|(.+?)\)\)|\[([^\]]+)\]\(([^)\s]+)\)/g;

function renderInline(text) {
  if (typeof text !== 'string' || !(text.includes('((') || text.includes(']('))) return text;
  const out = [];
  let last = 0;
  for (const m of text.matchAll(TERM)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[3] !== undefined) {
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
    out.push(
      // The term lives inside the card, whose click flips it. Swallow the
      // event so opening the tooltip — the only way to read it on touch —
      // does not flip the card away from the text being explained.
      <span
        key={m.index}
        className="ms-term"
        tabIndex={0}
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
function Aside({ kind, title, text, items }) {
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
export default function Block({ block: b, step, index, state, update, anim, delay }) {
  const key = `${step}:${index}`;
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
    const blocks = (M1.steps[step] || { blocks: [] }).blocks;
    const ci = blocks.findIndex((x) => x.k === 'cards' && x.id === rule.cards);
    if (ci < 0) return false;
    const on = (c) => !!state.cardFlip?.[`${step}:${ci}:${c}`];
    const wanted = [].concat(rule.card);
    const ok = rule.all ? wanted.every(on) : wanted.some(on);
    return ok && ![].concat(rule.not ?? []).some(on);
  };
  if (!flipOk(b.afterFlip)) return null;

  if (b.k === 'p') {
    return wrap(<p style={{ margin: 0, fontSize: 16, lineHeight: 1.8, color: '#2B313A' }}>{renderInline(b.text)}</p>);
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
    // `big` — key callout («Ոսկե կանոնը»): only the title changes, becoming a
    // real bold heading in the serif face; the body stays like other notes.
    const big = !!b.big;
    return wrap(
      <div style={{ padding: '22px 24px', borderRadius: 16, background: 'rgba(28,171,226,.08)', borderLeft: '3px solid #1CABE2' }}>
        {big ? (
          <div style={{ fontFamily: "'Noto Serif Armenian', 'Spectral', serif", fontSize: 18, lineHeight: 1.3, fontWeight: 700, letterSpacing: '-.2px', color: '#0F7FA8' }}>{b.title}</div>
        ) : (
          <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#0F7FA8', fontWeight: 600 }}>{b.title}</div>
        )}
        <p style={{ margin: '11px 0 0', fontSize: 15.5, lineHeight: 1.75, color: '#2B313A' }}>{renderInline(b.text)}</p>
        {/* Optional bullet list under the paragraph, same dot as other lists. */}
        {b.items && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {b.items.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 15.5, lineHeight: 1.75, color: '#2B313A' }}>
                <span aria-hidden style={{ flexShrink: 0, marginTop: 10, width: 5, height: 5, borderRadius: '50%', background: '#1CABE2' }} />
                <span>{renderInline(t)}</span>
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
            <span style={{ fontSize: 15, lineHeight: 1.75, color: '#2B313A' }}>{renderInline(typeof t === 'string' ? t : t.text)}</span>
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
    return wrap(<Aside kind={b.k} title={b.title} text={b.text} items={b.items} />);
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
              <span style={{ fontSize: 15, lineHeight: 1.7, color: on ? '#5A6270' : '#151A21' }}>{renderInline(typeof t === 'string' ? t : t.text)}</span>
            </div>
          );
        })}
      </div>,
    );
  }

  // Collapsible panels: guide, table and pair — opening is enough (OQ5).
  const panelBorder = isOpen || seen ? '#1CABE2' : 'rgba(21,26,33,.12)';
  // Closed but already read: the header says so, so the credit is visible.
  const panelLabel = (readLabel) => (isOpen ? 'Փակել' : seen ? readLabel : 'Բացել');
  // Colour follows credit, not expansion: an open but unread panel keeps the
  // grey of «Բացել», so cyan always means "done".
  const panelFg = seen ? '#0F7FA8' : '#8A919D';

  const head = (title, sub, rightLabel, rightFg) => (
    <div
      className="ms-panel-head"
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      onClick={toggle}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', cursor: 'pointer', transition: 'background .2s ease' }}
    >
      <span style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 8, background: 'rgba(28,171,226,.12)', color: '#0F7FA8', fontSize: 15, lineHeight: 1 }}>
        {isOpen ? '−' : '+'}
      </span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 11, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16.5, fontWeight: 600, letterSpacing: '-.3px' }}>{title}</span>
        {sub ? <span style={{ fontSize: 12, color: '#6E7787' }}>{sub}</span> : null}
      </span>
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: rightFg }}>
        {/* Credited: a ticked box stays before the label whether the panel is
            open or closed, so the reader sees the block is done while inside it.
            Just the coloured tick — no box, no fill. */}
        {seen && (
          <span aria-label="Դիտված է" role="img" style={{ display: 'grid', placeItems: 'center', width: 16, height: 16 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
              <path d="M5 12.5l4.6 4.6L19 7.5" stroke="#1CABE2" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
        {rightLabel}
      </span>
    </div>
  );

  if (b.k === 'guide') {
    return wrap(
      <div style={{ borderRadius: 16, background: '#FFFFFF', border: `1px solid ${panelBorder}`, overflow: 'hidden', transition: 'border-color .25s ease' }}>
        {head(b.name, b.sub, panelLabel('Դիտված է'), panelFg)}
        {isOpen && (
          <div style={{ padding: '4px 24px 24px 62px', display: 'flex', flexDirection: 'column', gap: 13, animation: 'msFadeUp .32s cubic-bezier(.2,.85,.2,1) both' }}>
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
                <span style={{ fontSize: 15, lineHeight: 1.72, color: '#2B313A' }}>{renderInline(t)}</span>
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
      <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 16, overflow: 'hidden', background: '#FFFFFF', transition: 'border-color .25s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px' }}>
          <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 11, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16.5, fontWeight: 600, letterSpacing: '-.3px' }}>{b.title}</span>
            <span style={{ fontSize: 12, color: '#6E7787' }}>{b.hint}</span>
          </span>
          {/* Счётчик появляется после первого переворота. Подсказка «переверни»
              стоит на самой карточке — в шапке она дублировалась. */}
          {seen > 0 && (
            <span style={{ flexShrink: 0, fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0F7FA8' }}>
              ✓ {seen} / {cards.length}
            </span>
          )}
        </div>

        <div role="tablist" aria-label={b.title} style={{ display: 'flex', gap: 8, padding: '0 22px', flexWrap: 'wrap' }}>
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
                              <span style={{ fontSize: 14.5, lineHeight: 1.6, color: '#2B313A' }}>{renderInline(t)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ marginTop: 5, fontSize: 14.5, lineHeight: 1.65, color: '#2B313A' }}>{renderInline(value)}</div>
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

  if (b.k === 'pair') {
    return wrap(
      <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 16, overflow: 'hidden', background: '#FFFFFF', transition: 'border-color .25s ease' }}>
        {head(b.title, null, panelLabel('Կարդացված'), panelFg)}
        {isOpen && (
          <div className="ms-pair" style={{ padding: '0 16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, animation: 'msFadeUp .32s cubic-bezier(.2,.85,.2,1) both' }}>
            <div style={{ padding: '22px 24px', borderRadius: 16, background: 'rgba(28,171,226,.07)', border: '1px solid rgba(28,171,226,.3)' }}>
              <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#0F7FA8', fontWeight: 600 }}>✓ {b.doTitle}</div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {(b.doItems || []).map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14.5, lineHeight: 1.7, color: '#2B313A' }}>
                    <span aria-hidden style={{ flexShrink: 0, marginTop: 9, width: 5, height: 5, borderRadius: '50%', background: '#1CABE2' }} />
                    <span>{renderInline(t)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '22px 24px', borderRadius: 16, background: 'rgba(255,107,90,.07)', border: '1px solid rgba(255,107,90,.32)' }}>
              <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#C74232', fontWeight: 600 }}>✕ {b.dontTitle}</div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {(b.dontItems || []).map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14.5, lineHeight: 1.7, color: '#2B313A' }}>
                    <span aria-hidden style={{ flexShrink: 0, marginTop: 9, width: 5, height: 5, borderRadius: '50%', background: '#FF6B5A' }} />
                    <span>{renderInline(t)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>,
    );
  }

  return null;
}
