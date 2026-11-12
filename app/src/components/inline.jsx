import { LinkIcon, PhoneIcon } from './ContactCard';

/**
 * Разметка внутри строки контента — один разбор на всё приложение.
 *
 * Жила в `Block.jsx`, вынесена 12.11: ссылки понадобились ещё и в панели
 * помощи (блок «Գրավոր դիմում» переехал туда из раздела источников модуля 4).
 * Переносить её нельзя было в HelpButton — `Block.jsx` сам импортирует оттуда
 * иконки, вышло бы кольцо импортов.
 *
 * ⚠ Разметка работает только в тексте блоков. В `title`, в заголовках `h` и
 * внутри таблиц она не рендерится — звёздочки и скобки покажутся как есть.
 */

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
export function placeTip(term) {
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

export function renderInline(text, onOpenHelp) {
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
