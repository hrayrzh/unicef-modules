import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MODULES } from '../data/module01';
import { moduleAt, viewOf, scopeOf, hasRoles, helpFor, ROLES } from '../data/modules';
import {
  navGroups, lastStep, isLastStep, NEXT_STEP_BLOCKER,
  canAdvance, nextHint, nextLabel, stepLabel,
} from '../moduleLogic';
import { useProgressStore } from '../store/progress';
import Block from '../components/Block';
import HelpButton from '../components/HelpButton';

/**
 * Reads the module/section straight out of the URL, so a section is linkable
 * and the browser's back button walks the module. Gating (D9) is enforced on
 * navigation, not just in the UI: a URL for a locked section is redirected
 * back to the furthest section actually earned. With NEXT_STEP_BLOCKER off
 * (app/.env) every section is reachable straight away.
 */
export default function ReaderPage() {
  const { moduleId, step: stepParam } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const moduleIndex = Math.min(MODULES.length - 1, Math.max(0, (Number(moduleId) || 1) - 1));
  const source = moduleAt(moduleIndex);
  const hasContent = !!source;

  const state = useProgressStore();
  const update = useProgressStore((s) => s.update);

  // Модуль 2 адресован двум аудиториям и делится на части для родителей и
  // для педагогов; пока роль не выбрана, показываем экран выбора. Модуль без
  // ролевых шагов (модуль 1) через это не проходит.
  const needsRole = hasRoles(source);
  const role = state.role?.[moduleIndex] || null;
  const pickRole = useCallback(
    (id) => update((prev) => ({ role: { ...prev.role, [moduleIndex]: id } })),
    [update, moduleIndex],
  );

  // Модуль в том виде, в каком его видит читатель: шаги уже отфильтрованы
  // по роли, поэтому индекс шага и то, что на экране, — одно и то же.
  const mod = useMemo(() => viewOf(source, role), [source, role]);
  const scope = scopeOf(moduleIndex, role);
  const LAST = mod ? lastStep(mod) : 0;
  const maxStep = state.maxStep?.[scope] ?? 0;

  // Old bookmarks may still point at `/final`, the closing quiz that is gone;
  // they land on the last section instead.
  const requested = stepParam === 'final' ? LAST : Math.max(0, (Number(stepParam) || 1) - 1);
  // Never trust the URL past what has been unlocked.
  const step = Math.min(requested, LAST, NEXT_STEP_BLOCKER ? maxStep : LAST);

  const scrollTop = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const stepPath = useCallback((i) => `/module/${moduleIndex + 1}/${i + 1}`, [moduleIndex]);

  // Bounce an out-of-range or locked URL to the section the learner has earned.
  useEffect(() => {
    if (!hasContent || (needsRole && !role)) return;
    if (requested !== step) navigate(stepPath(step), { replace: true });
  }, [hasContent, needsRole, role, requested, step, stepPath, navigate]);

  // A bare /module/1 gets the section number written in, so the URL always
  // names where you are.
  useEffect(() => {
    if (!hasContent || stepParam || (needsRole && !role)) return;
    navigate(stepPath(Math.min(maxStep, LAST)), { replace: true });
  }, [hasContent, needsRole, role, stepParam, maxStep, LAST, stepPath, navigate]);

  const gotoStep = useCallback(
    (i) => {
      const target = Math.min(LAST, Math.max(0, i));
      if (NEXT_STEP_BLOCKER) {
        if (target > maxStep + 1) return;
        if (target > step && !canAdvance(state, mod, scope, step)) return;
      }
      update((prev) => ({
        maxStep: { ...prev.maxStep, [scope]: Math.max(prev.maxStep?.[scope] ?? 0, target) },
        dir: target >= step ? 1 : -1,
        tick: (prev.tick || 0) + 1,
      }));
      navigate(stepPath(target));
      scrollTop();
    },
    [state, mod, scope, maxStep, LAST, step, update, navigate, stepPath, scrollTop],
  );

  const closeReader = useCallback(() => navigate('/'), [navigate]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeReader(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeReader]);

  // A section advances once it is read (D9); the last one closes the module.
  const onNext = useCallback(() => {
    if (!canAdvance(state, mod, scope, step)) return;
    if (!isLastStep(mod, step)) { gotoStep(step + 1); return; }
    update((prev) => ({ done: { ...prev.done, [moduleIndex]: true } }));
    closeReader();
  }, [step, state, mod, scope, update, gotoStep, moduleIndex, closeReader]);

  const advanceOk = hasContent && !!mod && canAdvance(state, mod, scope, step);
  const anim = `${state.dir === -1 ? 'msInBack' : 'msInFwd'} .5s cubic-bezier(.2,.85,.2,1) both`;

  const total = mod ? mod.steps.length : 1;
  const progressPct = `${Math.round(((step + 1) / total) * 100)}%`;
  const learnedPct = `${Math.round(((Math.min(maxStep, LAST) + 1) / total) * 100)}%`;

  const navItems = useMemo(() => {
    if (!mod) return [];
    const gated = !canAdvance(state, mod, scope, step);
    const isLocked = (i) => NEXT_STEP_BLOCKER && (i > maxStep + 1 || (i > step && gated));
    const item = (i, label) => {
      const cur = i === step;
      const seen = i <= maxStep;
      return { i, title: label, cur, seen, locked: isLocked(i) };
    };
    return navGroups(mod).map((g) => {
      const solo = g.idx.length === 1;
      const inGroup = g.idx.includes(step);
      const gLead = g.idx[0];
      return {
        title: g.title,
        solo,
        inGroup,
        gLead,
        gLocked: isLocked(gLead),
        first: solo ? item(g.idx[0], g.title) : null,
        children: solo ? [] : g.idx.map((i) => item(i, mod.steps[i].label)),
      };
    });
  }, [state, mod, scope, maxStep, step]);

  const { blocks, title } = mod?.steps[step] || { blocks: [], title: '' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column', background: '#F7F5F0', fontFamily: "'Noto Sans Armenian', 'Sora', Mshtakan, Sylfaen, system-ui, sans-serif", color: '#151A21' }}>
      <div className="ms-reader-head" style={{ flexShrink: 0, padding: '12px 20px 12px 40px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6E7787' }}>
              {hasContent ? mod.kicker : MODULES[moduleIndex].kicker}
            </span>
            {hasContent && (
              <span style={{ fontSize: 11, color: '#1CABE2', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{progressPct}</span>
            )}
          </div>
          {hasContent && (
            <div style={{ marginTop: 8, position: 'relative', height: 3, borderRadius: 2, background: 'rgba(21,26,33,.1)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: '0 auto 0 0', width: learnedPct, background: 'rgba(28,171,226,.2)', transition: 'width .5s cubic-bezier(.2,.8,.2,1)' }} />
              <div style={{ position: 'absolute', inset: '0 auto 0 0', width: progressPct, background: '#1CABE2', transition: 'width .5s cubic-bezier(.2,.8,.2,1)' }} />
            </div>
          )}
        </div>
        {/* Роль видна всё время и меняется в один тап: читатель может быть и
            родителем, и учителем, а половина модуля адресована не ему. */}
        {needsRole && role && (
          <button
            className="ms-role-swap"
            onClick={() => pickRole(role === 'parent' ? 'teacher' : 'parent')}
            title="Փոխել դերը"
          >
            <span className="ms-role-swap-now">{ROLES.find((r) => r.id === role)?.label}</span>
            <span aria-hidden>⇄</span>
          </button>
        )}
        {/* №36 — помощь доступна с любого экрана модуля. Шапка не скроллится,
            поэтому кнопка видна и в начале раздела, и в конце квиза. */}
        <HelpButton help={helpFor(moduleIndex)} />
        <button className="ms-close" onClick={closeReader} aria-label="Փակել" style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 10, background: 'rgba(21,26,33,.06)', border: '1px solid rgba(21,26,33,.14)', color: '#151A21', fontSize: 18, lineHeight: 1, cursor: 'pointer', transition: 'background .22s ease, transform .22s cubic-bezier(.2,.85,.2,1)' }}>
          ✕
        </button>
      </div>

      <div className="ms-reader-body" style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'stretch' }}>
        {hasContent && !(needsRole && !role) && (
          <aside className="ms-reader-nav" style={{ flex: '0 0 272px', borderRight: '1px solid rgba(21,26,33,.1)', borderTop: '1px solid rgba(21,26,33,.1)', overflowY: 'auto', padding: '22px 22px 30px 40px' }}>
            <nav className="ms-nav" style={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {navItems.map((g, gi) => (
                <div key={gi} className="ms-nav-group">
                  {g.solo ? (
                    <NavRow item={g.first} onPick={gotoStep} size={13.5} />
                  ) : (
                    <div className="ms-nav-group">
                      <div
                        className="ms-row ms-nav-group-head"
                        role="button"
                        tabIndex={0}
                        onClick={() => { if (!g.gLocked) gotoStep(g.gLead); }}
                        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !g.gLocked) { e.preventDefault(); gotoStep(g.gLead); } }}
                        style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', marginLeft: -12, borderRadius: 10, cursor: g.gLocked ? 'not-allowed' : 'pointer', background: g.inGroup ? 'rgba(28,171,226,.12)' : 'transparent', transition: 'background .25s ease' }}
                      >
                        <span style={{ fontSize: 13.5, lineHeight: 1.4, color: g.inGroup ? '#0F7FA8' : g.gLocked ? '#B7BDC6' : '#2B313A', fontWeight: g.inGroup ? 600 : 400 }}>
                          {g.title}
                        </span>
                      </div>
                      <div className="ms-nav-children" style={{ marginTop: 2, display: 'flex', flexDirection: 'column', paddingLeft: 14, borderLeft: '1px solid rgba(21,26,33,.12)', marginLeft: 2 }}>
                        {g.children.map((c) => (
                          <NavRow key={c.i} item={c} onPick={gotoStep} size={12.5} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </aside>
        )}

        <div
          ref={scrollRef}
          className="ms-reader-scroll"
          style={{ position: 'relative', flex: 1, minWidth: 0, minHeight: 0, overflowY: 'auto', borderTop: '1px solid rgba(21,26,33,.1)', padding: '40px 48px 18px' }}
        >
          {!hasContent && (
            <div style={{ maxWidth: 780, margin: '0 auto', fontSize: 16, lineHeight: 1.8, color: '#5A6270' }}>
              Այս մոդուլի բովանդակությունը դեռ լրացված չէ։
            </div>
          )}

          {hasContent && needsRole && !role && (
            <div className="ms-role-pick">
              <div className="ms-role-kicker">{source.kicker}</div>
              <h1 className="ms-role-title">{source.title}</h1>
              <p className="ms-role-sub">{source.sub}</p>
              <p className="ms-role-q">Ո՞ր դերում եք կարդում այս մոդուլը</p>
              <div className="ms-role-grid">
                {ROLES.map((r) => {
                  const n = source.steps.filter((x) => !x.role || x.role === r.id).length;
                  return (
                    <button key={r.id} className="ms-role-card" onClick={() => pickRole(r.id)}>
                      <span className="ms-role-card-t">{r.label}</span>
                      <span className="ms-role-card-h">{r.hint}</span>
                      <span className="ms-role-card-n">{n} բաժին</span>
                    </button>
                  );
                })}
              </div>
              <p className="ms-role-note">
                Դերը կարող եք փոխել ցանկացած պահի՝ վերևի կոճակով։ Ընդհանուր
                բաժինները՝ ներածությունը, օգնության կետերը և աղբյուրները, երևում են երկու դեպքում էլ։
              </p>
            </div>
          )}

          {hasContent && !(needsRole && !role) && (
            <div key={`${state.tick || 0}:${step}`} style={{ maxWidth: 780, margin: '0 auto', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#1CABE2', animation: 'msKickerIn .45s cubic-bezier(.2,.85,.2,1) both' }}>
                {stepLabel(mod, step)}
              </div>
              {/* The intro's title repeats its kicker, so it is not printed
                  twice — the kicker above already names the section. */}
              {title !== stepLabel(mod, step) && (
                <h1 className="ms-reader-title" style={{ margin: '12px 0 0', fontFamily: "'Noto Serif Armenian', 'Spectral', serif", fontSize: 34, lineHeight: 1.22, letterSpacing: '-.6px', fontWeight: 600, animation: 'msTitleIn .55s cubic-bezier(.2,.85,.2,1) both', animationDelay: '.06s' }}>
                  {title}
                </h1>
              )}
              <div style={{ marginTop: 30, marginBottom: 40, display: 'flex', flexDirection: 'column', gap: 22 }}>
                {blocks.map((b, bi) => (
                  <Block
                    key={bi}
                    block={b}
                    mod={mod}
                    scope={scope}
                    step={step}
                    index={bi}
                    state={state}
                    update={update}
                    anim={anim}
                    delay={`${(0.08 + bi * 0.055).toFixed(3)}s`}
                  />
                ))}
              </div>
              <Footer
                mod={mod}
                scope={scope}
                step={step}
                state={state}
                advanceOk={advanceOk}
                onPrev={() => gotoStep(step - 1)}
                onNext={onNext}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavRow({ item, onPick, size }) {
  const { i, title, cur, seen, locked } = item;
  const ref = useRef(null);
  // On a phone the list is a horizontal strip, and the current section may
  // sit off-screen to the right. Bring it into view; on the desktop column
  // the same call only scrolls if the row is out of the sidebar.
  useEffect(() => {
    if (!cur || !ref.current) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    ref.current.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }, [cur]);
  return (
    <div
      ref={ref}
      className="ms-row ms-nav-row"
      role="button"
      tabIndex={0}
      aria-current={cur ? 'step' : undefined}
      onClick={() => { if (!locked) onPick(i); }}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !locked) { e.preventDefault(); onPick(i); } }}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 4, padding: '9px 12px', marginLeft: -12, borderRadius: 10, cursor: locked ? 'not-allowed' : 'pointer', background: cur ? 'rgba(28,171,226,.12)' : 'transparent', transition: 'background .25s ease' }}
    >
      {cur && <span className="ms-nav-bar" style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, borderRadius: 2, background: '#1CABE2', transformOrigin: '50% 50%', animation: 'msBar .45s cubic-bezier(.2,.85,.2,1) both' }} />}
      <span className="ms-nav-label" style={{ fontSize: size, lineHeight: 1.4, color: cur ? '#0F7FA8' : locked ? '#B7BDC6' : seen ? '#2B313A' : '#8A919D', fontWeight: cur ? 600 : 400, transition: 'color .35s ease, transform .35s cubic-bezier(.2,.85,.2,1)', transform: `translateX(${cur ? 4 : 0}px)` }}>
        {locked ? '🔒 ' : ''}{title}
      </span>
    </div>
  );
}

function Footer({ mod, scope, step, state, advanceOk, onPrev, onNext }) {
  return (
    <div className="ms-reader-footer" style={{ marginTop: 'auto', paddingTop: 18, borderTop: '1px solid rgba(21,26,33,.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
      <button
        className="ms-lift ms-prev-btn"
        onClick={onPrev}
        disabled={step === 0}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px 12px 14px', borderRadius: 11, background: 'transparent', border: '1px solid rgba(21,26,33,.16)', color: '#151A21', fontSize: 13.5, fontWeight: 500, cursor: step === 0 ? 'default' : 'pointer', opacity: step > 0 ? 1 : 0.35, pointerEvents: step > 0 ? 'auto' : 'none' }}
      >
        <span style={{ fontSize: 15 }}>←</span> Նախորդ
      </button>
      <span className="ms-footer-label" style={{ fontSize: 12, color: '#6E7787', fontVariantNumeric: 'tabular-nums' }}>{stepLabel(mod, step)}</span>
      <NextButton advanceOk={advanceOk} onNext={onNext} mod={mod} scope={scope} step={step} state={state} />
    </div>
  );
}

/** The blocked state always says what is still missing, never just greys out. */
function NextButton({ advanceOk, onNext, mod, scope, step, state }) {
  return (
    <button
      className="ms-lift ms-next-btn"
      onClick={onNext}
      aria-disabled={!advanceOk}
      title={advanceOk ? undefined : nextHint(state, mod, scope, step)}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderRadius: 11, background: advanceOk ? '#1CABE2' : 'rgba(21,26,33,.12)', border: 'none', color: advanceOk ? '#0E1218' : '#8A919D', fontSize: 13.5, fontWeight: 600, cursor: advanceOk ? 'pointer' : 'not-allowed' }}
    >
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.25 }}>
        <span>{nextLabel(mod, step)}</span>
        <span style={{ fontSize: 10.5, fontWeight: 400, opacity: .7 }}>{nextHint(state, mod, scope, step)}</span>
      </span>
    </button>
  );
}
