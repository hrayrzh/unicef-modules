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
  // Module 4: a myth cracked in two, the wall of silence, a phrase's ripples.
  curtain: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M12 3v18" /><path d="M8.5 9.5L6 12l2.5 2.5M15.5 9.5L18 12l-2.5 2.5" /></>,
  crack: <><path d="M4.5 5h15v14h-15z" /><path d="M12.6 5l-2.2 4.4 3.2 2.8-2.6 3.4 1.4 3.4" /></>,
  wall: <><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M9 14.3V19M15 14.3V19" /></>,
  ripple: <><path d="M12 3.5s-3.4 3.9-3.4 6.4a3.4 3.4 0 006.8 0c0-2.5-3.4-6.4-3.4-6.4z" /><path d="M4.5 15.5c1.8 1.8 4.5 3 7.5 3s5.7-1.2 7.5-3" /><path d="M8 15c1.1.6 2.5 1 4 1s2.9-.4 4-1" /></>,
  heart: <path d="M12 19.5s-7.5-4.4-7.5-9.7A4.1 4.1 0 0112 7.5a4.1 4.1 0 017.5 2.3c0 5.3-7.5 9.7-7.5 9.7z" />,
  // Module 5: settings switch, protective rings, iceberg, safe, a tagged person.
  toggle: <><rect x="2.5" y="7" width="19" height="10" rx="5" /><circle cx="16.5" cy="12" r="2.8" /></>,
  rings: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5.6" /><circle cx="12" cy="12" r="2.2" /></>,
  iceberg: <><path d="M2.5 10.5h19" /><path d="M8 10.5l3-5.5 1.8 2.4 1.4-1.2 2.8 4.3" /><path d="M7.5 10.5L5 15l3.5 4.5h7l3-4.5-2-4.5" strokeDasharray="2 1.7" /></>,
  safe: <><rect x="3.5" y="4" width="17" height="15" rx="2" /><circle cx="12" cy="11.5" r="3.2" /><path d="M12 8.3v1M12 13.7v1M8.8 11.5h1M14.2 11.5h1M6.5 19v1.5M17.5 19v1.5" /></>,
  idtag: <><circle cx="10" cy="7" r="3" /><path d="M4.5 20.5V16a5.5 5.5 0 018.6-4.5" /><path d="M14 14.5h6.5v5H14l-1.8-2.5z" /></>,
  // Module 3: a sentence with a gap, words to put in line, memory cards,
  // an unknown file, public Wi-Fi.
  blank: <><path d="M3 9h5M16 9h5M3 15h18" /><rect x="9.5" y="6.5" width="5" height="5" rx="1" strokeDasharray="1.8 1.4" /></>,
  words: <><rect x="3" y="5" width="7.5" height="5" rx="1.6" /><rect x="13.5" y="5" width="7.5" height="5" rx="1.6" /><rect x="7" y="14" width="10" height="5" rx="1.6" /><path d="M6.8 10v1.8a2.2 2.2 0 002.2 2.2M17.2 10v1.8A2.2 2.2 0 0115 14" /></>,
  memory: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" /><path d="M6 8.2c0-1.6 2-1.6 2-.2 0 .8-1 .9-1 1.6" /></>,
  file: <><path d="M6 3h8l4.5 4.5V21H6z" /><path d="M14 3v4.5h4.5" /><path d="M10.6 12.2a1.6 1.6 0 113 .8c-.5.5-1.1.7-1.1 1.6" /><circle cx="12.5" cy="17.3" r=".6" fill="currentColor" /></>,
  wifi: <><path d="M3 9.5a13 13 0 0118 0M6 12.8a8.6 8.6 0 0112 0M9 16a4.2 4.2 0 016 0" /><circle cx="12" cy="19" r="1" fill="currentColor" /></>,
  // Новые варианты (файл «Նոր ինտերակտիվ տարբերակներ»): весы, росток, дело,
  // кодовый замок, план школы, лифт, слияние слов, рост, копии, данные.
  scale: <><path d="M12 4v16M8 20h8M4.5 7.5h15" /><path d="M4.5 7.5L2 13.5a2.6 2.6 0 005 0zM19.5 7.5L17 13.5a2.6 2.6 0 005 0z" /></>,
  sprout: <><path d="M12 21v-9" /><path d="M12 12c0-4-3-6.5-7-6.5 0 4 3 6.5 7 6.5zM12 14.5c0-3.4 2.6-5.5 6-5.5 0 3.4-2.6 5.5-6 5.5z" /><path d="M7.5 21h9" /></>,
  drop: <path d="M12 3.5s-6 6.6-6 10.8a6 6 0 0012 0C18 10.1 12 3.5 12 3.5z" />,
  folder: <><path d="M3 7.5V18a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V9a1.5 1.5 0 00-1.5-1.5H12L10 5H4.5A1.5 1.5 0 003 6.5z" /></>,
  clip: <path d="M15.5 7.5l-6.4 6.4a1.8 1.8 0 002.5 2.5l7-7a3.6 3.6 0 00-5.1-5.1l-7.2 7.2a5.4 5.4 0 007.6 7.6l6-6" />,
  dial: <><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M7.5 10V7.5a4.5 4.5 0 019 0V10" /><path d="M8.5 15.5h1M11.5 15.5h1M14.5 15.5h1" /></>,
  plan: <><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M3 11h7M14 11h7M10 4v4M14 16v4M10 14v6" /></>,
  book: <><path d="M4 5.5A2 2 0 016 3.5h13v14H6a2 2 0 00-2 2z" /><path d="M4 19.5a2 2 0 002 2h13M8 7.5h7" /></>,
  masks: <><path d="M3.5 5h9v5.5a4.5 4.5 0 01-9 0z" /><path d="M6 8.5h1M10 8.5h-1M6.5 12c.9.7 2.1.7 3 0" /><path d="M13.5 9.5h7V14a3.5 3.5 0 01-7 0" /><path d="M15.5 12.5h.5M18.5 12.5H18M15.8 16c.6-.6 1.8-.6 2.4 0" /></>,
  hand: <path d="M8 13V5.8a1.4 1.4 0 012.8 0V11M10.8 10.5V4.4a1.4 1.4 0 012.8 0v6.1M13.6 10.6V5.6a1.4 1.4 0 012.8 0v7M16.4 9.8a1.4 1.4 0 012.8 0v4.7a6.5 6.5 0 01-6.5 6.5h-.8a6 6 0 01-4.6-2.2L4.6 15a1.5 1.5 0 012.3-1.9L8 14.3" />,
  pulse: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M6 12.5h3l1.6-3.5 2.6 7 1.8-3.5H18" /></>,
  aid: <><circle cx="12" cy="12" r="8.5" /><path d="M12 8v8M8 12h8" /></>,
  lift: <><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M12 3v18M8.5 9.5L10 8l1.5 1.5M12.5 14.5L14 16l1.5-1.5" /></>,
  merge: <><path d="M6 4v4a4 4 0 004 4h4a4 4 0 014 4v4M18 4v4a4 4 0 01-4 4" /><path d="M3.5 6.5L6 4l2.5 2.5M15.5 6.5L18 4l2.5 2.5" /></>,
  grow: <><circle cx="7" cy="8" r="2" /><path d="M4.5 20v-5.5a2.5 2.5 0 015 0V20" /><circle cx="16.5" cy="5.5" r="2.4" /><path d="M13.5 20v-8a3 3 0 016 0v8" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5.5A1.5 1.5 0 0014.5 4h-9A1.5 1.5 0 004 5.5v9A1.5 1.5 0 005.5 16H8" /></>,
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M5 20.5v-1a7 7 0 0114 0v1" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4L18 18M6 18l1.6-1.6M16.4 7.6L18 6" /><circle cx="12" cy="12" r="6.3" /></>,
  cabinet: <><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M5 9h14M5 15h14M10.5 6h3M10.5 12h3M10.5 18h3" /></>,
  crowd: <><circle cx="6" cy="9" r="2" /><circle cx="12" cy="7" r="2.2" /><circle cx="18" cy="9" r="2" /><path d="M2.5 18v-1.5A3.5 3.5 0 019 15.2M21.5 18v-1.5a3.5 3.5 0 00-6.5-1.3M7.5 19v-2a4.5 4.5 0 019 0v2" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.3 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.3-3.8-8.5S9.4 5.9 12 3.5z" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  infinity: <path d="M12 12c-1.8-2.3-3.2-3.5-5-3.5a3.5 3.5 0 000 7c1.8 0 3.2-1.2 5-3.5zm0 0c1.8 2.3 3.2 3.5 5 3.5a3.5 3.5 0 000-7c-1.8 0-3.2 1.2-5 3.5z" />,
  fork: <><path d="M12 21v-6M12 15L6 8M12 15l6-7" /><path d="M3.5 9L6 8l.6 2.6M20.5 9L18 8l-.6 2.6" /></>,
  mail: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3.5 7l8.5 6.5L20.5 7" /></>,
  post: <><rect x="4" y="3.5" width="16" height="17" rx="2" /><circle cx="8" cy="7.5" r="1.6" /><path d="M11 7.5h6M7 11.5h10v5H7z" /></>,

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
