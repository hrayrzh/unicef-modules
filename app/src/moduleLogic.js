import { M1, QUIZ, FINAL } from './data/module01';

export const FINAL_STEP = M1.steps.length;
export const isFinalStep = (step) => step === FINAL_STEP;

// D9 — a section is only finishable once every guide is expanded AND marked,
// and every table/pair panel has been opened. The mark is unreachable until
// the panel is open, so "tick everything at once" is not a valid path.
export function panelKeys(step) {
  if (isFinalStep(step)) return [];
  return M1.steps[step].blocks
    .map((b, i) => (b.k === 'guide' ? `${step}:${i}` : null))
    .filter(Boolean);
}

export function openKeys(step) {
  if (isFinalStep(step)) return [];
  return M1.steps[step].blocks
    .map((b, i) => (b.k === 'table' || b.k === 'pair' ? `${step}:${i}` : null))
    .filter(Boolean);
}

export function canFinishReading(s, step) {
  return (
    panelKeys(step).every((k) => !!s.marks[k]) &&
    openKeys(step).every((k) => !!s.opened[k])
  );
}

export function quizPassed(s, step) {
  if (isFinalStep(step)) return s.fDone === true;
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
  const keys = panelKeys(step);
  const unopened =
    keys.filter((k) => !s.opened[k] && !s.marks[k]).length +
    openKeys(step).filter((k) => !s.opened[k]).length;
  const unmarked = keys.filter((k) => !s.marks[k]).length;
  if (unopened > 0) return `Բացեք ևս ${unopened} ուղեցույց`;
  if (unmarked > 0) return `Նշեք ևս ${unmarked} կետ՝ «Կատարված է»`;
  if (s.phase !== 'quiz') return '1 հարց այս բաժնից';
  if (!quizPassed(s, step)) return 'Պատասխանեք վիկտորինայի հարցին';
  return step + 1 < M1.steps.length ? M1.steps[step + 1].label : '5 հարց ամբողջ մոդուլից';
}

export function nextLabel(s, step) {
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
