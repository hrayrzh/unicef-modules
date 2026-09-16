import { M1 } from './data/module01';

// Викторины (по разделам и итоговая) временно убраны из прохождения
// (2026-09-16, просьба Армана). Тексты вопросов остались в data/module01.js
// (QUIZ, FINAL) на случай возврата — вычитку носителем они всё равно ждут.
export const LAST_STEP = M1.steps.length - 1;
export const isLastStep = (step) => step === LAST_STEP;

// Гейт D9 можно выключить целиком через `VITE_NEXT_STEP_BLOCKER=false`
// в app/.env (или .env.local). Тогда кнопка «Далее» и боковая навигация
// открыты всегда, URL не редиректится. Любое значение, кроме строки
// "false", оставляет блокировку включённой — безопасный дефолт.
export const NEXT_STEP_BLOCKER = import.meta.env.VITE_NEXT_STEP_BLOCKER !== 'false';

// D9 — a section is finishable once at least ONE guide on it has been
// expanded (OQ5 resolved 2026-09-15: not every family has every platform,
// so demanding all of them was busywork) and every table/pair/cards panel
// has been opened. Guides carry no "done" mark any more — opening is the act.
export function panelKeys(step) {
  return M1.steps[step].blocks
    .map((b, i) => (b.k === 'guide' ? `${step}:${i}` : null))
    .filter(Boolean);
}

export function openKeys(step) {
  return M1.steps[step].blocks
    .map((b, i) => (b.k === 'table' || b.k === 'pair' || b.k === 'cards' ? `${step}:${i}` : null))
    .filter(Boolean);
}

export function guidesSatisfied(s, step) {
  const keys = panelKeys(step);
  return keys.length === 0 || keys.some((k) => !!s.opened[k]);
}

export function canFinishReading(s, step) {
  if (!NEXT_STEP_BLOCKER) return true;
  return guidesSatisfied(s, step) && openKeys(step).every((k) => !!s.opened[k]);
}

export function canAdvance(s, step) {
  return canFinishReading(s, step);
}

// The blocked "Next" button always states what is still missing, never just
// greys out. (D9)
export function nextHint(s, step) {
  if (NEXT_STEP_BLOCKER) {
    if (!guidesSatisfied(s, step)) return 'Բացեք առնվազն մեկ ուղեցույց';
    const missing = openKeys(step).filter((k) => !s.opened[k]);
    if (missing.length > 0) {
      // A flashcard deck is credited by flipping one card, so say that
      // rather than the generic "open N blocks".
      const kinds = missing.map((k) => M1.steps[step].blocks[Number(k.split(':')[1])].k);
      if (kinds.every((x) => x === 'cards')) return 'Բացեք առնվազն մեկ քարտ';
      return `Բացեք ևս ${missing.length} բլոկ`;
    }
  }
  return isLastStep(step) ? 'Վերադառնալ մոդուլների ցանկ' : M1.steps[step + 1].label;
}

export function nextLabel(step) {
  return isLastStep(step) ? 'Ավարտել մոդուլը →' : 'Հաջորդ բաժին →';
}

// The intro is not a numbered section — it is named, not counted. The sections
// that follow number 1..N-1, so "Բաժին 1" is the first real section.
export const INTRO_STEP = 0;
export const COUNTED_STEPS = M1.steps.length - 1;

export function stepLabel(step) {
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

export { M1 };
