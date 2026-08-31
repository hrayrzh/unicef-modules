import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// D11 — each concept owns its own storage key, so progress never leaks between
// variants. Bump the version when the shape changes.
const KEY = 'unicef-m01-f';

const EMPTY = {
  done: {},      // module index -> completed
  maxStep: 0,    // furthest section unlocked (per module 1)
  phase: 'read', // 'read' | 'quiz'
  opened: {},    // "step:block" -> guide/table panel expanded
  marks: {},     // "step:block" -> 'done' | 'na'
  checks: {},    // "step:block:i" -> checklist ticked
  qSel: {},
  qStatus: {},
  qOrder: {},
  qShake: 0,
  fIdx: 0,
  fSel: null,
  fStatus: null,
  fWrong: {},
  fDone: false,
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
      version: 1,
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
