// Line icons for the interactive blocks. Drawn inline, not loaded: §5 — the
// module has to work offline and inside an iframe with a strict CSP.
const STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };

const PATHS = {
  // Forms of cyberbullying (module 2, «Տարածված տեսակները»).
  msg: <><path d="M4 5.5h16v10H9.5L5 19v-3.5H4z" /><path d="M12.6 7.6l-2 3.4h3l-2 3.4" /></>,
  photo: <><rect x="3.5" y="5" width="13" height="11" rx="2" /><circle cx="8" cy="9" r="1.4" /><path d="M3.5 14l4-3.5 3.5 3 2-1.6 3.5 3" /><path d="M19.5 8.5V18a2 2 0 01-2 2H7" /></>,
  mask: <><path d="M4 7.5c2.6-1.6 5.3-2 8-2s5.4.4 8 2c0 6-3.6 10-8 10s-8-4-8-10z" /><path d="M8 11.2c.8-.6 1.8-.6 2.6 0M13.4 11.2c.8-.6 1.8-.6 2.6 0" /><path d="M10 14.5c1.3.8 2.7.8 4 0" /></>,
  exclude: <><circle cx="7" cy="8" r="2.4" /><circle cx="13" cy="8" r="2.4" /><path d="M3 17c.6-2.6 2.1-4 4-4s3 .9 3.6 2.2M10 15.2c.7-1.4 1.8-2.2 3-2.2 1.9 0 3.4 1.4 4 4" /><circle cx="19.5" cy="7" r="1.9" strokeDasharray="2 1.6" /></>,
  pin: <><path d="M12 21s-6-5.4-6-10.5a6 6 0 0112 0C18 15.6 12 21 12 21z" /><circle cx="12" cy="10.5" r="2.2" /></>,
  groupchat: <><path d="M3.5 5.5h11V13H8l-3 2.5V13H3.5z" /><path d="M14.5 9h6v7.5H19V19l-3-2.5h-6V13" /></>,
  share: <><circle cx="6" cy="12" r="2.3" /><circle cx="17.5" cy="6" r="2.3" /><circle cx="17.5" cy="18" r="2.3" /><path d="M8.1 10.9l7.3-3.8M8.1 13.1l7.3 3.8" /></>,
  video: <><rect x="3" y="6" width="13" height="12" rx="2.2" /><path d="M16 10.5l5-3v9l-5-3" /></>,
  game: <><path d="M7 8h10a4 4 0 014 4.2l-.4 3.3a2.4 2.4 0 01-4.2 1.2L15 15H9l-1.4 1.7a2.4 2.4 0 01-4.2-1.2L3 12.2A4 4 0 017 8z" /><path d="M8 10.8v3M6.5 12.3h3" /><circle cx="15.5" cy="11.4" r=".7" fill="currentColor" /><circle cx="17.2" cy="13.2" r=".7" fill="currentColor" /></>,

  // Frame icons — what kind of interaction the block is.
  warn: <><path d="M12 4l9 15.5H3z" /><path d="M12 10v4.2" /><circle cx="12" cy="17" r=".6" fill="currentColor" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  cards: <><rect x="7.5" y="3.5" width="12" height="15" rx="2" /><path d="M4.5 7v11.5a2 2 0 002 2H15" /></>,
  sort: <><rect x="8" y="3.5" width="8" height="6" rx="1.5" /><path d="M12 9.5v3M6 12.5h12M6 12.5V15M18 12.5V15" /><rect x="3" y="15" width="6" height="5" rx="1.5" /><rect x="15" y="15" width="6" height="5" rx="1.5" /></>,
  grid: <><rect x="3.5" y="4" width="17" height="16" rx="2" /><path d="M3.5 9h17M9.5 9v11M15 9v11" /></>,
  link: <><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" /></>,
  film: <><rect x="3.5" y="5" width="17" height="14" rx="2.2" /><path d="M10 9.3v5.4l4.6-2.7z" /></>,
  bubble: <><circle cx="12" cy="12" r="7.5" /><path d="M9 9.6a3.6 3.6 0 013-1.6" /></>,
  steps: <><circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><path d="M6 8v8M11 6h9M11 18h9" /></>,
  scene: <><rect x="3" y="4.5" width="18" height="15" rx="2" /><circle cx="9" cy="11" r="1.8" /><path d="M5.8 17.5c.4-1.8 1.6-3 3.2-3s2.8 1.2 3.2 3M14.5 9h3.5M14.5 12h3.5" /></>,
  keys: <><rect x="3" y="7" width="18" height="10" rx="2" /><path d="M6.5 10.5h1M10 10.5h1M13.5 10.5h1M17 10.5h.5M8 14h8" /></>,
  scroll: <><rect x="6.5" y="2.5" width="11" height="19" rx="2.6" /><path d="M12 7v8M9.5 12.5L12 15l2.5-2.5" /></>,
  route: <><circle cx="6" cy="6" r="2.4" /><circle cx="18" cy="18" r="2.4" /><path d="M8.4 6H15a3.5 3.5 0 010 7H9a3.5 3.5 0 000 7h6.6" /></>,
  law: <><path d="M12 4v16M8 20h8M5 7.5h14" /><path d="M5 7.5l-2.5 6h5zM19 7.5l-2.5 6h5z" /></>,
  scratch: <><rect x="3" y="6" width="18" height="12" rx="2.5" /><path d="M6.5 13.5c1.4-2.4 2.8-2.4 4.2 0s2.8 2.4 4.2 0 2.1-1.6 2.6-1.4" /></>,
  quote: <><path d="M4.5 5.5h15V15h-8L7 18.5V15H4.5z" /><path d="M9 9.2h6M9 11.8h4" /></>,

  // People and places.
  family: <><circle cx="7.5" cy="6" r="2.2" /><circle cx="16.5" cy="6" r="2.2" /><circle cx="12" cy="12.6" r="1.8" /><path d="M4 20v-5.5A3.5 3.5 0 017.5 11M20 20v-5.5a3.5 3.5 0 00-3.5-3.5" /><path d="M9.2 20v-2.6a2.8 2.8 0 015.6 0V20" /></>,
  school: <><path d="M3 10l9-5.5 9 5.5" /><path d="M5 9v10.5h14V9" /><path d="M10 19.5V15h4v4.5M3 19.5h18" /></>,
  child: <><circle cx="12" cy="6.5" r="3" /><path d="M6.5 20.5V17a5.5 5.5 0 0111 0v3.5" /></>,
  teacher: <><circle cx="8.5" cy="6.5" r="2.8" /><path d="M3.5 20.5v-3.2A5.3 5.3 0 018.8 12h1.7" /><rect x="12.5" y="8.5" width="8.5" height="6.5" rx="1" /><path d="M14.5 20.5l2.2-4.5 2.3 4.5" /></>,
  building: <><path d="M4 20.5V8l8-4 8 4v12.5" /><path d="M2.5 20.5h19M8 11v6M12 11v6M16 11v6" /></>,
  parents: <><circle cx="8" cy="6.5" r="2.4" /><circle cx="16" cy="6.5" r="2.4" /><path d="M3.5 20v-5a4.5 4.5 0 019 0M11.5 20v-5a4.5 4.5 0 019 0" /></>,

  // Actions.
  phone: <><rect x="6.5" y="2.5" width="11" height="19" rx="2.6" /><path d="M10.5 18.5h3" /></>,
  camera: <><path d="M4 8h3l1.6-2.5h6.8L17 8h3v11H4z" /><circle cx="12" cy="13.2" r="3.4" /></>,
  flag: <><path d="M5.5 21V4" /><path d="M5.5 4.5h11l-2.2 4 2.2 4h-11" /></>,
  block: <><circle cx="12" cy="12" r="8.5" /><path d="M6 6l12 12" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2.2" /><path d="M8 10.5V8a4 4 0 018 0v2.5M12 14.5v2.2" /></>,
  key: <><circle cx="8" cy="15" r="3.6" /><path d="M10.6 12.4L19 4M15.5 7.5l2.2 2.2M17.6 5.4l2 2" /></>,

  // Controls.
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none" />,
  pause: <><rect x="6.5" y="5.5" width="3.6" height="13" rx="1" fill="currentColor" stroke="none" /><rect x="13.9" y="5.5" width="3.6" height="13" rx="1" fill="currentColor" stroke="none" /></>,
  prev: <path d="M15 5l-7 7 7 7" />,
  next: <path d="M9 5l7 7-7 7" />,
  restart: <><path d="M4.5 12a7.5 7.5 0 102.2-5.3" /><path d="M4.5 4.5v4h4" /></>,
  check: <path d="M5 12.5l4.6 4.6L19 7.5" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  minus: <path d="M5.5 12h13" />,
};

export function Icon({ name, size = 18, ...rest }) {
  const body = PATHS[name];
  if (!body) return null;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" {...STROKE} {...rest}>
      {body}
    </svg>
  );
}
