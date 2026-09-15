import { M1, QUIZ, FINAL } from './data/module01';

export const FINAL_STEP = M1.steps.length;
export const isFinalStep = (step) => step === FINAL_STEP;

// D9 — a section is finishable once at least ONE guide on it has been
// expanded (OQ5 resolved 2026-09-15: not every family has every platform,
// so demanding all of them was busywork) and every table/pair/cards panel
// has been opened. Guides carry no "done" mark any more — opening is the act.
export function panelKeys(step) {
  if (isFinalStep(step)) return [];
  return M1.steps[step].blocks
    .map((b, i) => (b.k === 'guide' ? `${step}:${i}` : null))
    .filter(Boolean);
}

export function openKeys(step) {
  if (isFinalStep(step)) return [];
  return M1.steps[step].blocks
    .map((b, i) => (b.k === 'table' || b.k === 'pair' || b.k === 'cards' ? `${step}:${i}` : null))
    .filter(Boolean);
}

export function guidesSatisfied(s, step) {
  const keys = panelKeys(step);
  return keys.length === 0 || keys.some((k) => !!s.opened[k]);
}

export function canFinishReading(s, step) {
  return guidesSatisfied(s, step) && openKeys(step).every((k) => !!s.opened[k]);
}

// The intro is a framing page, not taught material — there is nothing to test
// yet, so it goes straight to the first section.
export function hasQuiz(step) {
  return !isFinalStep(step) && step !== INTRO_STEP;
}

export function quizPassed(s, step) {
  if (isFinalStep(step)) return s.fDone === true;
  if (!hasQuiz(step)) return true;
  return s.qStatus[step] === 'ok';
}

export function canAdvance(s, step) {
  return canFinishReading(s, step) && quizPassed(s, step);
}

// Grading shared by the per-section quiz and the final quiz.
export function grade(q, sel) {
  if (q.kind === 'tf') return sel === q.answer;
  if (q.kind === 'choice') return sel === q.correct;
  if (q.kind === 'multi') {
    return (sel || []).slice().sort().join(',') === q.correct.slice().sort().join(',');
  }
  return false;
}

export function hasSelection(q, sel) {
  return q.kind === 'multi' ? (sel || []).length > 0 : sel !== null && sel !== undefined;
}

// The blocked "Next" button always states what is still missing, never just
// greys out. (D9)
export function nextHint(s, step) {
  if (!guidesSatisfied(s, step)) return 'Բացեք առնվազն մեկ ուղեցույց';
  const missing = openKeys(step).filter((k) => !s.opened[k]);
  if (missing.length > 0) {
    // A flashcard deck is credited by flipping one card, so say that
    // rather than the generic "open N blocks".
    const kinds = missing.map((k) => M1.steps[step].blocks[Number(k.split(':')[1])].k);
    if (kinds.every((x) => x === 'cards')) return 'Բացեք առնվազն մեկ քարտ';
    return `Բացեք ևս ${missing.length} բլոկ`;
  }
  if (!hasQuiz(step)) return M1.steps[step + 1]?.label ?? '';
  if (s.phase !== 'quiz') return '1 հարց այս բաժնից';
  if (!quizPassed(s, step)) return 'Պատասխանեք վիկտորինայի հարցին';
  return step + 1 < M1.steps.length ? M1.steps[step + 1].label : '5 հարց ամբողջ մոդուլից';
}

export function nextLabel(s, step) {
  if (!hasQuiz(step) && !isFinalStep(step)) return 'Հաջորդ բաժին →';
  if (s.phase !== 'quiz' && !isFinalStep(step)) return 'Անցնել վիկտորինային →';
  return step + 1 < M1.steps.length ? 'Հաջորդ բաժին →' : 'Ամփոփիչ վիկտորինա →';
}

// The intro is not a numbered section — it is named, not counted. The sections
// that follow number 1..N-1, so "Բաժին 1" is the first real section.
export const INTRO_STEP = 0;
export const COUNTED_STEPS = M1.steps.length - 1;

export function stepLabel(step) {
  if (isFinalStep(step)) return 'Ամփոփիչ վիկտորինա';
  if (step === INTRO_STEP) return M1.steps[INTRO_STEP].label;
  return `Բաժին ${step} / ${COUNTED_STEPS}`;
}

export const NAV_GROUPS = [
  { title: 'Ներածություն', idx: [0] },
  { title: 'Ինչու է վերահսկողությունը կարևոր', idx: [1] },
  { title: 'Գործիքներ և կարգավորումներ', idx: [2, 3, 4, 5, 6] },
  { title: 'Հավասարակշռություն և փոխվստահություն', idx: [7] },
  { title: 'Շտապ օգնություն և աղբյուրներ', idx: [8] },
];

export { M1, QUIZ, FINAL };
