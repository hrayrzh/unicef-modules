# SafeSteps — React build of the module reader

React port of `module-select-standalone.html`. The build emits plain static
`index.html` + `assets/*.css` + `assets/*.js` — no server needed.

## Commands

```bash
npm install
npm run dev       # http://localhost:8080
npm run build     # -> dist/
npm run preview   # serve dist/ on http://localhost:8080
```

All three use port 8080 with `strictPort`, so the port never silently shifts.

## Why it stays embeddable

- `base: './'` — the built paths are relative, so `dist/` works from `file://`,
  from a GitHub Pages subdirectory, and inside an iframe on any host (D2).
- Hash routing (`#/module/1/3`) — deep links resolve without server rewrite
  rules.
- No fixed `100vh` on the outer container (§5); `100dvh` on the shell only.

## Routes

| Route | Screen |
|---|---|
| `#/` | Module wheel |
| `#/module/:moduleId` | Reader, redirects to the furthest section earned |
| `#/module/:moduleId/:step` | A specific section (`1`-based) |
| `#/module/:moduleId/final` | Closing quiz |

A URL pointing at a section the learner has not unlocked is redirected back to
the furthest one earned — the gate (D9) is enforced on navigation, not just in
the UI.

## Structure

```
src/
├── main.jsx              router (createHashRouter)
├── App.jsx               shell + ambient background
├── moduleLogic.js        gating rules and quiz grading (D9)
├── store/progress.js     zustand + persist, key `unicef-m01-f` (D11)
├── data/module01.js      all module content — single source of truth
├── pages/                SelectPage (wheel), ReaderPage (module)
└── components/           Block, Quiz, FinalQuiz
```

Content lives only in `src/data/module01.js`. Editing a wording there updates
every screen that shows it.

## Progress

`zustand/persist` writes to `localStorage` under `unicef-m01-f`. If storage is
blocked (a strict iframe policy), it falls back to an in-memory shim: the
module stays fully usable, only persistence across reloads is lost.
