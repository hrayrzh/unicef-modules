import FigureWithBubble from './FigureWithBubble';

/**
 * Renders one content block. The gating rules (D9) live in the parent —
 * this component only reports opens/marks upward.
 */
export default function Block({ block: b, step, index, state, update, anim, delay }) {
  const key = `${step}:${index}`;
  const isOpen = !!state.opened[key];
  const mark = state.marks[key];

  const toggle = () =>
    update((prev) => ({ opened: { ...prev.opened, [key]: !prev.opened[key] } }));

  // A mark is a toggle, so a mis-click is recoverable.
  const setMark = (value) =>
    update((prev) => ({
      marks: { ...prev.marks, [key]: prev.marks[key] === value ? null : value },
    }));

  const wrap = (children) => (
    <div style={{ animation: anim, animationDelay: delay }}>{children}</div>
  );

  if (b.k === 'p') {
    return wrap(<p style={{ margin: 0, fontSize: 16, lineHeight: 1.8, color: '#2B313A' }}>{b.text}</p>);
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
    return wrap(
      <div style={{ padding: '22px 24px', borderRadius: 16, background: 'rgba(28,171,226,.08)', borderLeft: '3px solid #1CABE2' }}>
        <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#0F7FA8', fontWeight: 600 }}>{b.title}</div>
        <p style={{ margin: '11px 0 0', fontSize: 15.5, lineHeight: 1.75, color: '#2B313A' }}>{b.text}</p>
      </div>,
    );
  }

  if (b.k === 'list') {
    return wrap(
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {(b.items || []).map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0, marginTop: 9, width: 5, height: 5, borderRadius: '50%', background: '#1CABE2' }} />
            <span style={{ fontSize: 15, lineHeight: 1.75, color: '#2B313A' }}>{typeof t === 'string' ? t : t.text}</span>
          </div>
        ))}
      </div>,
    );
  }

  if (b.k === 'links') {
    return wrap(
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(b.items || []).map((it, i) => (
          <div key={i} className="ms-slide" style={{ padding: '17px 20px', borderRadius: 14, background: '#FFFFFF', border: '1px solid rgba(21,26,33,.1)', transition: 'transform .2s cubic-bezier(.2,.85,.2,1), border-color .2s' }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{it.title}</div>
            <div style={{ marginTop: 5, fontSize: 13, lineHeight: 1.6, color: '#5A6270' }}>{it.meta}</div>
          </div>
        ))}
      </div>,
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
              <span style={{ fontSize: 15, lineHeight: 1.7, color: on ? '#5A6270' : '#151A21' }}>{typeof t === 'string' ? t : t.text}</span>
            </div>
          );
        })}
      </div>,
    );
  }

  // Collapsible panels: guide (needs a mark), table and pair (open is enough).
  const panelBorder =
    mark === 'done' || (b.k !== 'guide' && isOpen) ? '#1CABE2' : 'rgba(21,26,33,.12)';

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
      <span style={{ flexShrink: 0, fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: rightFg }}>{rightLabel}</span>
    </div>
  );

  if (b.k === 'guide') {
    return wrap(
      <div style={{ borderRadius: 16, background: '#FFFFFF', border: `1px solid ${panelBorder}`, overflow: 'hidden', transition: 'border-color .25s ease' }}>
        {head(
          b.name,
          b.sub,
          mark === 'done' ? '✓ Կատարված է' : mark === 'na' ? 'Չի վերաբերում' : 'Բացել',
          mark ? '#0F7FA8' : '#8A919D',
        )}
        {isOpen && (
          <div style={{ padding: '4px 24px 24px 62px', display: 'flex', flexDirection: 'column', gap: 13, animation: 'msFadeUp .32s cubic-bezier(.2,.85,.2,1) both' }}>
            {(b.steps || []).map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 8, background: 'rgba(28,171,226,.14)', color: '#0F7FA8', fontSize: 12, fontWeight: 600 }}>{i + 1}</span>
                <span style={{ fontSize: 15, lineHeight: 1.72, color: '#2B313A' }}>{t}</span>
              </div>
            ))}
            {/* Both marks are only reachable here, inside an opened guide. */}
            <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid rgba(21,26,33,.09)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                className="ms-lift"
                onClick={() => setMark('done')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: mark === 'done' ? '#1CABE2' : 'transparent', border: `1px solid ${mark === 'done' ? '#1CABE2' : 'rgba(21,26,33,.18)'}`, color: mark === 'done' ? '#0E1218' : '#151A21', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                ✓ Կատարված է
              </button>
              <button
                className="ms-lift"
                onClick={() => setMark('na')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: mark === 'na' ? 'rgba(21,26,33,.1)' : 'transparent', border: `1px solid ${mark === 'na' ? 'rgba(21,26,33,.3)' : 'rgba(21,26,33,.14)'}`, color: mark === 'na' ? '#151A21' : '#6E7787', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >
                Չի վերաբերում
              </button>
            </div>
          </div>
        )}
      </div>,
    );
  }

  if (b.k === 'table') {
    const cols = `minmax(0,.9fr) repeat(${Math.max(1, (b.head || []).length - 1)}, minmax(0,1.1fr))`;
    return wrap(
      <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 16, overflow: 'hidden', background: '#FFFFFF', transition: 'border-color .25s ease' }}>
        {head(b.title, null, isOpen ? '✓ Կարդացված' : 'Բացել', isOpen ? '#0F7FA8' : '#8A919D')}
        {isOpen && (
          <div style={{ padding: '0 14px 16px', animation: 'msFadeUp .32s cubic-bezier(.2,.85,.2,1) both' }}>
            <div className="ms-table">
              <div style={{ display: 'grid', gridTemplateColumns: cols, background: 'rgba(21,26,33,.04)', minWidth: 640 }}>
                {(b.head || []).map((h, i) => (
                  <div key={i} style={{ padding: '13px 16px', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5A6270', fontWeight: 600 }}>{h}</div>
                ))}
              </div>
              {(b.rows || []).map((row, ri) => (
                <div key={ri} style={{ display: 'grid', gridTemplateColumns: cols, borderTop: '1px solid rgba(21,26,33,.09)', minWidth: 640 }}>
                  {row.map((cell, ci) => (
                    <div key={ci} style={{ padding: 16, fontSize: 13.5, lineHeight: 1.6, color: '#2B313A' }}>{cell}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>,
    );
  }

  if (b.k === 'pair') {
    return wrap(
      <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 16, overflow: 'hidden', background: '#FFFFFF', transition: 'border-color .25s ease' }}>
        {head(b.title, null, isOpen ? '✓ Կարդացված' : 'Բացել', isOpen ? '#0F7FA8' : '#8A919D')}
        {isOpen && (
          <div className="ms-pair" style={{ padding: '0 16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, animation: 'msFadeUp .32s cubic-bezier(.2,.85,.2,1) both' }}>
            <div style={{ padding: '22px 24px', borderRadius: 16, background: 'rgba(28,171,226,.07)', border: '1px solid rgba(28,171,226,.3)' }}>
              <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#0F7FA8', fontWeight: 600 }}>✓ {b.doTitle}</div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {(b.doItems || []).map((t, i) => (
                  <div key={i} style={{ fontSize: 14.5, lineHeight: 1.7, color: '#2B313A' }}>{t}</div>
                ))}
              </div>
            </div>
            <div style={{ padding: '22px 24px', borderRadius: 16, background: 'rgba(255,107,90,.07)', border: '1px solid rgba(255,107,90,.32)' }}>
              <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#C74232', fontWeight: 600 }}>✕ {b.dontTitle}</div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {(b.dontItems || []).map((t, i) => (
                  <div key={i} style={{ fontSize: 14.5, lineHeight: 1.7, color: '#2B313A' }}>{t}</div>
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
