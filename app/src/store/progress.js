import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// D11 — each concept owns its own storage key, so progress never leaks between
// variants. Bump the version when the shape changes.
const KEY = 'unicef-m01-f';

const EMPTY = {
  done: {},      // module index -> completed
  maxStep: 0,    // furthest section unlocked (per module 1)
  dir: 1,        // last navigation direction, drives the slide animation
  tick: 0,       // bumps to re-mount the section and replay its animation
  opened: {},    // "step:block" -> guide/table panel expanded
  checks: {},    // "step:block:i" -> checklist ticked
  cardTab: {},   // "step:block" -> selected flashcard index
  cardFlip: {},  // "step:block:i" -> that card has been flipped
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
      version: 3,
      // Older saves are merged over EMPTY so the reader never reads an
      // `undefined` map; keys the shape no longer has are simply dropped.
      migrate: (s) => {
        const out = { ...EMPTY };
        for (const k of Object.keys(EMPTY)) if (s && s[k] !== undefined) out[k] = s[k];
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
