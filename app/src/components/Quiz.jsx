import { QUIZ, grade, hasSelection, panelKeys } from '../moduleLogic';

const LETTERS = ['Ա', 'Բ', 'Գ', 'Դ', 'Ե'];

const badgeFor = (kind) =>
  kind === 'tf' ? 'Ճիշտ կամ սխալ'
    : kind === 'multi' ? 'Ընտրեք բոլոր ճիշտ պատասխանները'
      : kind === 'order' ? 'Դասավորեք հերթականությամբ'
        : 'Ընտրեք մեկ պատասխան';

/** Per-section quiz. Passing it is what unlocks the next section (D9). */
export default function Quiz({ step, state, update, onScrollTop }) {
  const q = QUIZ[step] || QUIZ[0];
  const st = state.qStatus[step];
  const sel = state.qSel[step];
  const ord = state.qOrder[step] || [];

  const pick = (v) =>
    update((prev) => ({
      qSel: { ...prev.qSel, [step]: v },
      qStatus: { ...prev.qStatus, [step]: null },
    }));

  const submit = () => {
    const ok = grade(q, sel);
    update((prev) => ({
      qStatus: { ...prev.qStatus, [step]: ok ? 'ok' : 'bad' },
      qShake: ok ? prev.qShake : (prev.qShake || 0) + 1,
    }));
  };

  // A wrong answer sends the reader back to the material and clears that
  // section's marks — you re-read before you re-answer.
  const retry = () => {
    update((prev) => {
      const marks = { ...prev.marks };
      panelKeys(step).forEach((k) => { marks[k] = null; });
      return {
        qStatus: { ...prev.qStatus, [step]: null },
        qSel: { ...prev.qSel, [step]: null },
        qOrder: { ...prev.qOrder, [step]: [] },
        marks,
        phase: 'read',
      };
    });
    onScrollTop();
  };

  const pickOrder = (i) => {
    if (ord.includes(i) || st === 'ok') return;
    if (q.order[ord.length] !== i) {
      update((prev) => ({
        qOrder: { ...prev.qOrder, [step]: [] },
        qStatus: { ...prev.qStatus, [step]: 'bad' },
        qShake: (prev.qShake || 0) + 1,
      }));
      return;
    }
    const next = ord.concat([i]);
    update((prev) => ({
      qOrder: { ...prev.qOrder, [step]: next },
      qStatus: { ...prev.qStatus, [step]: next.length === q.order.length ? 'ok' : null },
    }));
  };

  const can = hasSelection(q, sel);
  const showCheck = q.kind !== 'order' && st !== 'ok';

  return (
    <div
      key={String(state.qShake || 0)}
      style={{ marginTop: 26, padding: '28px 30px', borderRadius: 20, background: '#14181F', color: '#F7F5F0', animation: st === 'bad' ? 'msShake .5s ease both' : 'msFadeUp .45s cubic-bezier(.2,.85,.2,1) both' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ padding: '5px 11px', borderRadius: 999, background: 'rgba(28,171,226,.2)', color: '#7FD6F2', fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600 }}>Վիկտորինա</span>
        <span style={{ fontSize: 12, color: '#9BA4B2' }}>{badgeFor(q.kind)}</span>
      </div>
      <div style={{ marginTop: 16, fontSize: 19, lineHeight: 1.45, fontWeight: 500 }}>{q.prompt}</div>

      {q.kind === 'tf' && (
        <div style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[true, false].map((v) => (
            <button
              key={String(v)}
              className="ms-lift"
              onClick={() => pick(v)}
              style={{ padding: '14px 32px', borderRadius: 12, background: sel === v ? '#1CABE2' : 'rgba(247,245,240,.07)', border: `1.5px solid ${sel === v ? '#1CABE2' : 'rgba(247,245,240,.3)'}`, color: sel === v ? '#0E1218' : '#F7F5F0', fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}
            >
              {v ? 'Ճիշտ' : 'Սխալ'}
            </button>
          ))}
        </div>
      )}

      {q.kind === 'order' && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {(q.options || []).map((text, i) => {
              const at = ord.indexOf(i);
              const on = at >= 0;
              return (
                <div
                  key={i}
                  className="ms-slide"
                  role="button"
                  tabIndex={0}
                  onClick={() => pickOrder(i)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickOrder(i); } }}
                  style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderRadius: 12, background: on ? 'rgba(28,171,226,.16)' : 'rgba(247,245,240,.06)', border: `1.5px solid ${on ? '#1CABE2' : 'rgba(247,245,240,.18)'}`, cursor: on || st === 'ok' ? 'default' : 'pointer', transition: 'background .25s ease, border-color .25s ease, transform .25s cubic-bezier(.2,.85,.2,1)' }}
                >
                  <span style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 8, background: on ? '#1CABE2' : 'rgba(247,245,240,.1)', color: on ? '#0E1218' : '#9BA4B2', fontSize: 12, fontWeight: 600 }}>
                    {on ? at + 1 : ''}
                  </span>
                  <span style={{ fontSize: 14.5, lineHeight: 1.55 }}>{text}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: '#8A919D' }}>
            Ընտրված՝ {ord.length} / {(q.order || []).length}
          </div>
        </div>
      )}

      {(q.kind === 'choice' || q.kind === 'multi') && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {(q.options || []).map((text, i) => {
            const on = q.kind === 'multi' ? (sel || []).includes(i) : sel === i;
            const right = st === 'ok' && (q.kind === 'multi' ? q.correct.includes(i) : q.correct === i);
            const choose = () => {
              if (st === 'ok') return;
              if (q.kind === 'multi') {
                const cur = (sel || []).slice();
                const at = cur.indexOf(i);
                if (at >= 0) cur.splice(at, 1); else cur.push(i);
                pick(cur);
              } else pick(i);
            };
            return (
              <div
                key={i}
                className="ms-slide"
                role="button"
                tabIndex={0}
                onClick={choose}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } }}
                style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderRadius: 12, background: right || on ? 'rgba(28,171,226,.16)' : 'rgba(247,245,240,.06)', border: `1.5px solid ${right || on ? '#1CABE2' : 'rgba(247,245,240,.18)'}`, cursor: st === 'ok' ? 'default' : 'pointer', transition: 'background .25s ease, border-color .25s ease, transform .25s cubic-bezier(.2,.85,.2,1)' }}
              >
                <span style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 8, background: right || on ? '#1CABE2' : 'rgba(247,245,240,.1)', color: right || on ? '#0E1218' : '#9BA4B2', fontSize: 12, fontWeight: 600 }}>
                  {LETTERS[i]}
                </span>
                <span style={{ flex: 1, fontSize: 14.5, lineHeight: 1.55 }}>{text}</span>
                <span style={{ fontSize: 14, color: '#7FD6F2' }}>{right ? '✓' : on ? '•' : ''}</span>
              </div>
            );
          })}
        </div>
      )}

      {showCheck && (
        <button
          className="ms-lift"
          onClick={submit}
          disabled={!can}
          style={{ marginTop: 22, padding: '14px 30px', borderRadius: 999, background: can ? '#1CABE2' : 'rgba(247,245,240,.12)', border: 'none', color: can ? '#0E1218' : '#9BA4B2', fontSize: 13.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', cursor: can ? 'pointer' : 'not-allowed', boxShadow: can ? '0 12px 28px -12px rgba(28,171,226,.8)' : 'none' }}
        >
          Ստուգել պատասխանը
        </button>
      )}

      {st === 'ok' && (
        <div style={{ marginTop: 20, padding: '18px 20px', borderRadius: 14, background: 'rgba(28,171,226,.14)', border: '1px solid rgba(28,171,226,.5)', animation: 'msPop .4s cubic-bezier(.2,.85,.2,1) both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', background: '#1CABE2', color: '#0E1218', fontSize: 13 }}>✓</span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Ճիշտ է</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.7, color: '#C9D0DA' }}>{q.why}</div>
        </div>
      )}

      {st === 'bad' && (
        <div style={{ marginTop: 20, padding: '18px 20px', borderRadius: 14, background: 'rgba(255,107,90,.12)', border: '1px solid rgba(255,107,90,.5)', animation: 'msPop .4s cubic-bezier(.2,.85,.2,1) both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', background: '#FF6B5A', color: '#fff', fontSize: 13 }}>↺</span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Դեռ ոչ</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.7, color: '#C9D0DA' }}>
            Վերադարձեք բաժնի նյութին, կրկին ստուգեք ուղեցույցները և նշեք «Կատարված է», ապա փորձեք նորից։
          </div>
          <button className="ms-lift" onClick={retry} style={{ marginTop: 14, padding: '11px 20px', borderRadius: 11, background: '#FF6B5A', border: 'none', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
            Վերադառնալ նյութին →
          </button>
        </div>
      )}
    </div>
  );
}
