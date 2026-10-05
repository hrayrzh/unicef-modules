import { M1, HELP } from './module01';
import { M2, HELP2 } from './module02';
import { M3, HELP3 } from './module03';
import { M4, HELP4 } from './module04';
import { M5, HELP5 } from './module05';
import { CONTACTS } from './help';

/**
 * Реестр модулей. Приложение писалось под один модуль — `M1` был вшит в
 * moduleLogic и страницы напрямую. С приходом модуля 2 всё, что зависит от
 * содержания, берётся отсюда по индексу.
 *
 * Ключ — индекс модуля (0-based), как в `MODULES[]` на экране выбора.
 * Отсутствие ключа значит «контента ещё нет» — читалка покажет заглушку.
 */
export const BY_INDEX = { 0: M1, 1: M2, 2: M3, 3: M4, 4: M5 };

export function moduleAt(index) {
  return BY_INDEX[index] || null;
}

/**
 * Панель помощи: контакты общие для всех модулей (data/help.js), а «когда
 * обращаться» — своё, оно зависит от темы. Решение Грайра 2026-10-05: всё
 * после «Որտեղ դիմել» одинаково везде, иначе переход между модулями менял
 * телефоны, хотя помощь от темы не зависит.
 */
const HELP_BY_INDEX = { 0: HELP, 1: HELP2, 2: HELP3, 3: HELP4, 4: HELP5 };

export function helpFor(index) {
  const own = HELP_BY_INDEX[index] || HELP;
  return { ...own, contacts: CONTACTS };
}

/**
 * Роли (модуль 2). Документ заказчика разделён на «ՄԱՍ Ա» для родителей и
 * «ՄԱՍ Բ» для педагогов: половина материала одному читателю не адресована.
 * Роль выбирается на входе и переключается в шапке.
 *
 * Модуль без ролевых шагов (модуль 1) роли не спрашивает — `hasRoles` ниже.
 */
export const ROLES = [
  { id: 'parent', label: 'Ծնող կամ խնամակալ', hint: 'Ինչ նկատել տանը և ինչպես աջակցել երեխային' },
  { id: 'teacher', label: 'Մանկավարժ', hint: 'Ինչ նկատել դասարանում և ինչպես միջամտել' },
];

export function hasRoles(mod) {
  return !!mod && mod.steps.some((s) => s.role);
}

/**
 * Шаги, которые видит читатель в выбранной роли: общие (без `role`) плюс свои.
 * Порядок сохраняется, поэтому общее вступление остаётся первым, а помощь и
 * источники — последними.
 *
 * Вся остальная логика работает уже с этим списком, так что индекс шага и
 * то, что человек видит на экране, — одно и то же.
 */
export function stepsFor(mod, role) {
  if (!mod) return [];
  if (!hasRoles(mod)) return mod.steps;
  return mod.steps.filter((s) => !s.role || s.role === role);
}

/** Модуль «как его видит читатель»: те же поля, но шаги уже отфильтрованы. */
export function viewOf(mod, role) {
  if (!mod) return null;
  return { ...mod, steps: stepsFor(mod, role) };
}

/**
 * Префикс ключей прогресса. Раньше ключ был «шаг:блок» — при двух модулях
 * такие ключи столкнулись бы, а при смене роли состав шагов меняется, и
 * старые отметки повисли бы на чужих блоках. Поэтому в ключ входят и модуль,
 * и роль.
 */
export function scopeOf(moduleIndex, role) {
  const mod = moduleAt(moduleIndex);
  return hasRoles(mod) ? `m${moduleIndex}${role === 'teacher' ? 't' : 'p'}` : `m${moduleIndex}`;
}
