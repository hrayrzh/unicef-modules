import { M1 } from './data/module01';

// Викторины (по разделам и итоговая) временно убраны из прохождения
// (2026-09-16, просьба Армана). Тексты вопросов остались в data/module01.js
// (QUIZ, FINAL) на случай возврата — вычитку носителем они всё равно ждут.
//
// Все функции ниже принимают первым аргументом `mod` — модуль в том виде,
// в каком его видит читатель (шаги уже отфильтрованы по роли, см.
// data/modules.js › viewOf). Раньше здесь был вшит M1: приложение писалось
// под один модуль.

// Гейт D9 можно выключить целиком через `VITE_NEXT_STEP_BLOCKER=false`
// в app/.env (или .env.local). Тогда кнопка «Далее» и боковая навигация
// открыты всегда, URL не редиректится. Любое значение, кроме строки
// "false", оставляет блокировку включённой — безопасный дефолт.
export const NEXT_STEP_BLOCKER = import.meta.env.VITE_NEXT_STEP_BLOCKER !== 'false';

export const lastStep = (mod) => mod.steps.length - 1;
export const isLastStep = (mod, step) => step === lastStep(mod);

// Ключ отметки: в него входит область (модуль + роль), иначе отметки двух
// модулей столкнулись бы на одинаковых «шаг:блок». См. modules.js › scopeOf.
export const blockKey = (scope, step, index) => `${scope}:${step}:${index}`;

// D9 — a section is finishable once at least ONE guide on it has been
// expanded (OQ5 resolved 2026-09-15: not every family has every platform,
// so demanding all of them was busywork) and every table/pair/cards panel
// has been opened. Guides carry no "done" mark any more — opening is the act.
export function panelKeys(mod, scope, step) {
  return mod.steps[step].blocks
    .map((b, i) => (b.k === 'guide' ? blockKey(scope, step, i) : null))
    .filter(Boolean);
}

export function openKeys(mod, scope, step) {
  return mod.steps[step].blocks
    .map((b, i) => (b.k === 'table' || b.k === 'pair' || b.k === 'cards' ? blockKey(scope, step, i) : null))
    .filter(Boolean);
}

export function guidesSatisfied(s, mod, scope, step) {
  const keys = panelKeys(mod, scope, step);
  return keys.length === 0 || keys.some((k) => !!s.opened[k]);
}

export function canFinishReading(s, mod, scope, step) {
  if (!NEXT_STEP_BLOCKER) return true;
  return guidesSatisfied(s, mod, scope, step)
    && openKeys(mod, scope, step).every((k) => !!s.opened[k]);
}

export function canAdvance(s, mod, scope, step) {
  return canFinishReading(s, mod, scope, step);
}

// The blocked "Next" button always states what is still missing, never just
// greys out. (D9)
export function nextHint(s, mod, scope, step) {
  if (NEXT_STEP_BLOCKER) {
    if (!guidesSatisfied(s, mod, scope, step)) return 'Բացեք առնվազն մեկ ուղեցույց';
    const missing = openKeys(mod, scope, step).filter((k) => !s.opened[k]);
    if (missing.length > 0) {
      // A flashcard deck is credited by flipping one card, so say that
      // rather than the generic "open N blocks".
      const kinds = missing.map((k) => mod.steps[step].blocks[Number(k.split(':')[2])].k);
      if (kinds.every((x) => x === 'cards')) return 'Բացեք առնվազն մեկ քարտ';
      return `Բացեք ևս ${missing.length} բլոկ`;
    }
  }
  return isLastStep(mod, step) ? 'Վերադառնալ մոդուլների ցանկ' : mod.steps[step + 1].label;
}

export function nextLabel(mod, step) {
  return isLastStep(mod, step) ? 'Ավարտել մոդուլը →' : 'Հաջորդ բաժին →';
}

// The intro is not a numbered section — it is named, not counted. The sections
// that follow number 1..N-1, so "Բաժին 1" is the first real section.
export const INTRO_STEP = 0;

export function stepLabel(mod, step) {
  if (step === INTRO_STEP) return mod.steps[INTRO_STEP].label;
  return `Բաժին ${step} / ${mod.steps.length - 1}`;
}

/**
 * Группировка шагов в боковой навигации. У модуля 1 она задана вручную —
 * разделы объединяются в четыре смысловые группы. Модуль 2 группируется
 * сам: шаги уже отфильтрованы по роли, и каждый стоит отдельным пунктом.
 */
const M1_GROUPS = [
  { title: 'Ներածություն', idx: [0] },
  { title: 'Ինչու է վերահսկողությունը կարևոր', idx: [1] },
  { title: 'Գործիքներ և կարգավորումներ', idx: [2, 3, 4, 5, 6] },
  { title: 'Հավասարակշռություն և փոխվստահություն', idx: [7] },
  { title: 'Շտապ օգնություն և աղբյուրներ', idx: [8] },
];

export function navGroups(mod) {
  if (mod === M1) return M1_GROUPS;
  return mod.steps.map((s, i) => ({ title: s.label, idx: [i] }));
}
