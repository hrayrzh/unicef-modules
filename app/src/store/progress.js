import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// D11 — each concept owns its own storage key, so progress never leaks between
// variants. Bump the version when the shape changes.
const KEY = 'unicef-m01-f';

// Ключи панелей и отметок начинаются с «области» — модуль плюс роль
// (m0, m1p, m1t; см. data/modules.js › scopeOf). Без неё отметки двух модулей
// столкнулись бы на одинаковых «шаг:блок», а при смене роли повисли бы на
// чужих блоках: состав шагов у родителя и педагога разный.
const EMPTY = {
  done: {},      // module index -> completed
  maxStep: {},   // module index -> furthest section unlocked
  // Where the reader was when the module was closed (✕ or Escape), so the
  // module list reopens on that card and the module resumes on that section
  // instead of the furthest one. Request of Arman, 2026-10-09.
  lastModule: 0, // module index the deck should focus on return
  lastStep: {},  // scope -> section the reader was on when closed
  role: {},      // module index -> chosen audience ("parent" | "teacher")
  dir: 1,        // last navigation direction, drives the slide animation
  tick: 0,       // bumps to re-mount the section and replay its animation
  simLang: 'en', // simulator screen language: 'en' | 'ru' — one choice for all guides
  opened: {},    // "scope:step:block" -> guide/table panel expanded
  checks: {},    // "scope:step:block:i" -> checklist ticked
  cardTab: {},   // "scope:step:block" -> selected flashcard index
  cardFlip: {},  // "scope:step:block:i" -> that card has been flipped
};

// §5 — storage can be blocked inside an iframe with a strict policy. Falling
// back to an in-memory shim keeps the module fully usable; only persistence
// across reloads is lost.
const memory = new Map();
const safeStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return memory.get(name) ?? null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      memory.set(name, value);
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      memory.delete(name);
    }
  },
};

export const useProgressStore = create(
  persist(
    (set) => ({
      ...EMPTY,

      // Accepts a partial or an updater, matching how the original screen
      // batched its state writes.
      update: (patch) =>
        set((prev) => ({ ...(typeof patch === 'function' ? patch(prev) : patch) })),

      reset: () => set({ ...EMPTY }),
    }),
    {
      name: KEY,
      // v3 (2026-09-16): quiz state dropped along with the quizzes themselves.
      // v4 (2026-09-28): module 2 added. `maxStep` became per-module and panel
      // keys gained a scope prefix, so old flat keys no longer mean anything.
      version: 4,
      // Older saves are merged over EMPTY so the reader never reads an
      // `undefined` map; keys the shape no longer has are simply dropped.
      migrate: (s, from) => {
        const out = { ...EMPTY };
        for (const k of Object.keys(EMPTY)) if (s && s[k] !== undefined) out[k] = s[k];
        // До v4 прогресс был плоским и принадлежал модулю 1. Переносим его
        // под новые ключи, чтобы читатель не потерял место в модуле 1.
        if (from < 4) {
          out.maxStep = typeof s?.maxStep === 'number' ? { 0: s.maxStep } : {};
          out.role = {};
          const rescope = (src) => Object.fromEntries(
            Object.entries(src || {}).map(([k, v]) => [`m0:${k}`, v]),
          );
          out.opened = rescope(s?.opened);
          out.checks = rescope(s?.checks);
          out.cardTab = rescope(s?.cardTab);
          out.cardFlip = rescope(s?.cardFlip);
        }
        return out;
      },
      storage: createJSONStorage(() => safeStorage),
      // Actions stay out of storage.
      partialize: (s) => {
        const { update, reset, ...rest } = s;
        return rest;
      },
    },
  ),
);

export { EMPTY };
