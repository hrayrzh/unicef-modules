import { FINAL, M1, grade, hasSelection } from '../moduleLogic';

const LETTERS = ['Ա', 'Բ', 'Գ', 'Դ'];

/**
 * Closing quiz over the whole module. A wrong answer offers a jump back to the
 * section it came from, so the fix is re-reading rather than re-guessing.
 */
export default function FinalQuiz({ state, update, onScrollTop, onGotoStep, onFinish }) {
  const i = state.fIdx || 0;
  const q = FINAL[i];
  const sel = state.fSel;
  const st = state.fStatus;
  // Only first-attempt answers count toward the score.
  const clean = FINAL.filter((_, k) => !state.fWrong[k]).length;

  const pick = (v) => update({ fSel: v, fStatus: null });

  const submit = () => {
    const ok = grade(q, sel);
    update((prev) => ({
      fStatus: ok ? 'ok' : 'bad',
      qShake: ok ? prev.qShake : (prev.qShake || 0) + 1,
      fWrong: ok ? prev.fWrong : { ...prev.fWrong, [i]: true },
    }));
  };

  const next = () => {
    if (i + 1 < FINAL.length) update({ fIdx: i + 1, fSel: null, fStatus: null });
    else update({ fDone: true, fStatus: null });
    onScrollTop();
  };

  const can = hasSelection(q, sel);

  if (state.fDone) {
    return (
      <div style={{ marginTop: 28, padding: '34px 32px', borderRadius: 20, background: '#FFFFFF', border: '1px solid rgba(28,171,226,.4)', animation: 'msPop .5s cubic-bezier(.2,.85,.2,1) both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          <div style={{ display: 'grid', placeItems: 'center', width: 84, height: 84, borderRadius: '50%', background: 'rgba(28,171,226,.12)', border: '2px solid #1CABE2', color: '#151A21' }}>
            <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.5px' }}>
              {Math.round((clean / FINAL.length) * 100)}%
            </span>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#0F7FA8' }}>
              {clean} / {FINAL.length}
            </div>
            <div style={{ marginTop: 10, fontFamily: "'Noto Serif Armenian', 'Spectral', serif", fontSize: 26, lineHeight: 1.25, fontWeight: 600, color: '#151A21' }}>
              {clean === FINAL.length ? 'Բոլոր հարցերին՝ առաջին փորձից' : 'Մոդուլն ավարտված է'}
            </div>
            <div style={{ marginTop: 8, fontSize: 14.5, lineHeight: 1.7, color: '#5A6270' }}>
              {clean === FINAL.length
                ? 'Ամփոփիչ վիկտորինան անցել եք առանց սխալի։'
                : 'Սխալ պատասխանները վերանայվեցին և կրկին ստուգվեցին։'}
            </div>
          </div>
        </div>
        <button className="ms-lift" onClick={onFinish} style={{ marginTop: 26, padding: '14px 26px', borderRadius: 12, background: '#1CABE2', border: 'none', color: '#0E1218', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Ավարտել մոդուլը →
        </button>
      </div>
    );
  }

  return (
    <div
      key={String(state.qShake || 0)}
      style={{ marginTop: 28, padding: '30px 32px', borderRadius: 20, background: '#14181F', color: '#F7F5F0', animation: st === 'bad' ? 'msShake .5s ease both' : 'msFadeUp .45s cubic-bezier(.2,.85,.2,1) both' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ fontSize: 11.5, letterSpacing: '.14em', textTransform: 'uppercase', color: '#9BA4B2' }}>
          Հարց {i + 1} / {FINAL.length}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {FINAL.map((_, k) => (
            <span key={k} style={{ width: 22, height: 5, borderRadius: 3, background: k < i ? '#1CABE2' : k === i ? 'rgba(28,171,226,.55)' : 'rgba(247,245,240,.18)', transition: 'background .4s ease' }} />
          ))}
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: '#7FD6F2' }}>
        {q.kind === 'tf' ? 'Ճիշտ կամ սխալ' : q.kind === 'multi' ? 'Ընտրեք բոլոր ճիշտները' : 'Ընտրեք մեկ պատասխան'}
      </div>
      <div style={{ marginTop: 16, fontSize: 20, lineHeight: 1.42, fontWeight: 500 }}>{q.prompt}</div>

      {q.kind === 'tf' ? (
        <div style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[true, false].map((v) => (
            <button
              key={String(v)}
              className="ms-lift"
              onClick={() => pick(v)}
              style={{ padding: '14px 32px', borderRadius: 12, background: sel === v ? '#1CABE2' : 'transparent', border: `1.5px solid ${sel === v ? '#1CABE2' : 'rgba(247,245,240,.28)'}`, color: sel === v ? '#0E1218' : '#F7F5F0', fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}
            >
              {v ? 'Ճիշտ' : 'Սխալ'}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {(q.options || []).map((text, k) => {
            const on = q.kind === 'multi' ? (sel || []).includes(k) : sel === k;
            const right = st === 'ok' && (q.kind === 'multi' ? q.correct.includes(k) : q.correct === k);
            const choose = () => {
              if (st === 'ok') return;
              if (q.kind === 'multi') {
                const cur = (sel || []).slice();
                const at = cur.indexOf(k);
                if (at >= 0) cur.splice(at, 1); else cur.push(k);
                pick(cur);
              } else pick(k);
            };
            return (
              <div
                key={k}
                className="ms-slide"
                role="button"
                tabIndex={0}
                onClick={choose}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } }}
                style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderRadius: 12, background: 'rgba(247,245,240,.06)', border: `1.5px solid ${right || on ? '#1CABE2' : 'rgba(247,245,240,.18)'}`, cursor: st === 'ok' ? 'default' : 'pointer', transition: 'background .25s ease, border-color .25s ease, transform .25s cubic-bezier(.2,.85,.2,1)' }}
              >
                <span style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 8, background: right || on ? '#1CABE2' : 'rgba(247,245,240,.1)', color: right || on ? '#0E1218' : '#9BA4B2', fontSize: 12, fontWeight: 600 }}>
                  {LETTERS[k]}
                </span>
                <span style={{ flex: 1, fontSize: 14.5, lineHeight: 1.55 }}>{text}</span>
                <span style={{ fontSize: 14, color: '#7FD6F2' }}>{right ? '✓' : on ? '•' : ''}</span>
              </div>
            );
          })}
        </div>
      )}

      {st !== 'ok' && (
        <button
          className="ms-lift"
          onClick={submit}
          disabled={!can}
          style={{ marginTop: 20, padding: '13px 24px', borderRadius: 12, background: can ? '#1CABE2' : 'rgba(247,245,240,.12)', border: 'none', color: can ? '#0E1218' : '#8A919D', fontSize: 14, fontWeight: 600, cursor: can ? 'pointer' : 'not-allowed' }}
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
          <button className="ms-lift" onClick={next} style={{ marginTop: 16, padding: '12px 22px', borderRadius: 11, background: '#1CABE2', border: 'none', color: '#0E1218', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
            {i + 1 < FINAL.length ? 'Հաջորդ հարց →' : 'Տեսնել արդյունքը →'}
          </button>
        </div>
      )}

      {st === 'bad' && (
        <div style={{ marginTop: 20, padding: '18px 20px', borderRadius: 14, background: 'rgba(255,107,90,.12)', border: '1px solid rgba(255,107,90,.5)', animation: 'msPop .4s cubic-bezier(.2,.85,.2,1) both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', background: '#FF6B5A', color: '#fff', fontSize: 13 }}>↺</span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Դեռ ոչ</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.7, color: '#C9D0DA' }}>
            Այս հարցը «{M1.steps[q.section].title}» բաժնից է։
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="ms-lift"
              onClick={() => { update({ fStatus: null, fSel: null }); onGotoStep(q.section); }}
              style={{ padding: '12px 20px', borderRadius: 11, background: '#FF6B5A', border: 'none', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
            >
              Բացել բաժինը կրկին
            </button>
            <button
              className="ms-lift"
              onClick={() => update({ fStatus: null, fSel: null })}
              style={{ padding: '12px 20px', borderRadius: 11, background: 'transparent', border: '1px solid rgba(247,245,240,.28)', color: '#F7F5F0', fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}
            >
              Փորձել կրկին
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
