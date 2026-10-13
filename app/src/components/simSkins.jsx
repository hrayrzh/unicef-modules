// Оформление симулятора гайдов под каждую платформу. Раньше у всех 18
// платформ был один и тот же экран — серые квадратики и одинаковые строки,
// и родитель не узнавал в нём своё устройство. Теперь экран похож на
// настоящий: iPhone — сгруппированный список с цветными иконками, Android —
// Material, Windows/Mac — окно с боковым меню, консоли — экран телевизора,
// TikTok/Discord/Roblox — тёмные темы. Это всё ещё схема, а не копия
// интерфейса: важно узнать «где лежит», а не пиксели.
//
// `ui` задаёт раскладку строк, `device` — корпус. Цвета взяты из фирменных
// палитр интерфейсов (системные цвета iOS, Material, Fluent, PS5 и т.д.).

const IOS = {
  device: 'phone', ui: 'ios', status: 'ios', dark: false,
  font: "-apple-system, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif",
  screen: '#F2F2F7', head: '#F2F2F7', group: '#FFFFFF', text: '#000000', sub: '#8E8E93',
  sep: '#E5E5EA', accent: '#007AFF', on: '#34C759', off: '#E9E9EB', icon: 'square',
  titleAlign: 'center', back: '‹', chevron: '#C4C4C7',
};

const MATERIAL = {
  device: 'phone', ui: 'material', status: 'android', dark: false,
  font: "Roboto, 'Google Sans', system-ui, sans-serif",
  screen: '#F8FAFD', head: '#F8FAFD', group: '#FFFFFF', text: '#1F1F1F', sub: '#5E5E5E',
  sep: '#E6E8EC', accent: '#0B57D0', on: '#0B57D0', off: '#DDE3EA', icon: 'circle',
  titleAlign: 'left', back: '←', chevron: null,
};

const APP_LIGHT = {
  device: 'phone', ui: 'app', status: 'ios', dark: false,
  font: "-apple-system, system-ui, 'Segoe UI', Roboto, sans-serif",
  screen: '#FFFFFF', head: '#FFFFFF', group: '#FFFFFF', text: '#000000', sub: '#737373',
  sep: '#EFEFEF', icon: 'line', titleAlign: 'center', back: '‹', chevron: '#B0B0B0',
};

const APP_DARK = {
  ...APP_LIGHT, dark: true, chevron: '#6B6B70',
};

export const SKINS = {
  ios: IOS,
  apple: { ...IOS },
  macos: {
    ...IOS, device: 'desktop', ui: 'mac', status: null, window: 'mac',
    screen: '#F5F5F7', head: '#F5F5F7', side: '#E8E8ED', sideText: '#1D1D1F', on: '#007AFF',
  },
  android: MATERIAL,
  google: { ...MATERIAL, status: 'android' },
  windows: {
    device: 'desktop', ui: 'win', status: null, window: 'win', dark: false,
    font: "'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif",
    screen: '#F3F3F3', head: '#F3F3F3', group: '#FBFBFB', text: '#1A1A1A', sub: '#616161',
    sep: '#E5E5E5', accent: '#005FB8', on: '#005FB8', off: '#FFFFFF', icon: 'line',
    titleAlign: 'left', back: '←', chevron: '#8A8A8A', side: '#EFEFEF', sideText: '#1A1A1A',
  },
  microsoft: {
    device: 'desktop', ui: 'web', status: null, window: 'web', url: 'account.microsoft.com', dark: false,
    font: "'Segoe UI', system-ui, sans-serif",
    screen: '#F6F6F6', head: '#FFFFFF', group: '#FFFFFF', text: '#1A1A1A', sub: '#616161',
    sep: '#E1E1E1', accent: '#0067B8', on: '#0067B8', off: '#C8C8C8', icon: 'line',
    titleAlign: 'left', back: '←', chevron: '#8A8A8A', side: '#FFFFFF', sideText: '#1A1A1A',
  },
  youtube: { ...APP_LIGHT, accent: '#FF0000', on: '#065FD4', off: '#E5E5E5', brand: '#FF0000', titleAlign: 'left', back: '←' },
  instagram: { ...APP_LIGHT, accent: '#0095F6', on: '#0095F6', off: '#DBDBDB', brand: 'linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)' },
  facebook: { ...APP_LIGHT, screen: '#F0F2F5', head: '#FFFFFF', group: '#FFFFFF', accent: '#0866FF', on: '#0866FF', off: '#CED0D4', brand: '#0866FF', ui: 'cards' },
  tiktok: { ...APP_DARK, screen: '#121212', head: '#121212', group: '#1E1E1E', text: '#FFFFFF', sub: '#8A8B91', sep: '#2A2A2E', accent: '#FE2C55', on: '#20D5EC', off: '#3A3A3E', brand: '#FE2C55' },
  snapchat: { ...APP_LIGHT, screen: '#F7F7F7', head: '#FFFC00', headText: '#000000', group: '#FFFFFF', accent: '#0EADFF', on: '#0EADFF', off: '#DADADA', brand: '#FFFC00', ui: 'cards' },
  discord: { ...APP_DARK, screen: '#1E1F22', head: '#2B2D31', group: '#2B2D31', text: '#F2F3F5', sub: '#B5BAC1', sep: '#3F4147', accent: '#5865F2', on: '#23A55A', off: '#80848E', brand: '#5865F2', ui: 'cards' },
  roblox: { ...APP_DARK, screen: '#191B1D', head: '#232527', group: '#232527', text: '#FFFFFF', sub: '#BDBEBE', sep: '#393B3D', accent: '#335FFF', on: '#00B06F', off: '#57595B', brand: '#FFFFFF', ui: 'cards' },
  playstation: {
    device: 'tv', ui: 'console', status: null, dark: true,
    font: "'SST', 'Segoe UI', system-ui, sans-serif",
    screen: 'linear-gradient(160deg,#0B3D91 0%,#04173A 70%)', head: 'transparent', group: 'transparent',
    text: '#FFFFFF', sub: '#9FB3D9', sep: 'rgba(255,255,255,.08)', accent: '#FFFFFF', on: '#0070D1', off: '#3D4F73',
    icon: 'line', titleAlign: 'left', back: null, chevron: null,
    focus: { bg: '#FFFFFF', text: '#0B1B3A' }, side: 'rgba(0,0,0,.18)', sideText: '#C9D6EE',
  },
  xbox: {
    device: 'tv', ui: 'console', status: null, dark: true,
    font: "'Segoe UI', system-ui, sans-serif",
    screen: '#141414', head: 'transparent', group: 'transparent',
    text: '#FFFFFF', sub: '#A0A0A0', sep: 'rgba(255,255,255,.08)', accent: '#107C10', on: '#107C10', off: '#4A4A4A',
    icon: 'line', titleAlign: 'left', back: null, chevron: null,
    focus: { bg: '#2B2B2B', text: '#FFFFFF', ring: '#FFFFFF' }, side: '#1E1E1E', sideText: '#D0D0D0',
  },
  nintendo: {
    device: 'tv', ui: 'console', status: null, dark: false,
    font: "'Segoe UI', system-ui, sans-serif",
    screen: '#EBEBEB', head: 'transparent', group: 'transparent',
    text: '#2D2D2D', sub: '#7A7A7A', sep: '#D7D7D7', accent: '#00BBDB', on: '#00BBDB', off: '#C4C4C4',
    icon: 'line', titleAlign: 'left', back: null, chevron: null,
    focus: { bg: '#FFFFFF', text: '#2D2D2D', ring: '#00BBDB' }, side: '#E2E2E2', sideText: '#2D2D2D',
  },
};

export const skinFor = (platform) => SKINS[platform] || IOS;

/* ------------------------------------------------------------------ */
/* Иконки строк: глиф по смыслу пункта, цвет — как у системных иконок  */
/* iOS. Один набор на все платформы, раскладка решает, как его подать: */
/* цветной квадрат (iOS/Mac), кружок (Android), линия (приложения).     */

const G = {
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" /></>,
  hourglass: <path d="M7 3h10M7 21h10M8 3v2.5c0 2.2 4 4.5 4 6.5s-4 4.3-4 6.5V21M16 3v2.5c0 2.2-4 4.5-4 6.5s4 4.3 4 6.5V21" />,
  moon: <path d="M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10z" />,
  grid: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></>,
  bell: <><path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
  speaker: <><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></>,
  hand: <path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-.5a5.5 5.5 0 0 1-4.6-2.5L4 14.5a1.5 1.5 0 0 1 2.5-1.7L8 15" />,
  shield: <path d="M12 3.5l7 2.6V12c0 4.3-3 7.4-7 8.5-4-1.1-7-4.2-7-8.5V6.1z" />,
  family: <><circle cx="7.5" cy="6" r="2.2" /><circle cx="16.5" cy="6" r="2.2" /><circle cx="12" cy="12.6" r="1.8" /><path d="M4 20v-5.5A3.5 3.5 0 0 1 7.5 11M20 20v-5.5a3.5 3.5 0 0 0-3.5-3.5M9.2 20v-2.6a2.8 2.8 0 0 1 5.6 0V20" /></>,
  person: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  userplus: <><circle cx="10" cy="8" r="3.5" /><path d="M3.5 20a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2.2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
  key: <><circle cx="8" cy="15" r="3.6" /><path d="M10.6 12.4L19 4M15.5 7.5l2.2 2.2" /></>,
  battery: <><rect x="3" y="8" width="16" height="8" rx="2" /><path d="M21 11v2M6.5 11v2M9.5 11v2" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>,
  wifi: <><path d="M3.5 9.5a12 12 0 0 1 17 0M6.5 12.5a8 8 0 0 1 11 0M9.5 15.5a4 4 0 0 1 5 0" /><circle cx="12" cy="18.5" r=".8" /></>,
  devices: <><rect x="3" y="5" width="13" height="10" rx="1.5" /><rect x="17" y="9" width="4" height="10" rx="1" /><path d="M7 19h6" /></>,
  disk: <><ellipse cx="12" cy="6.5" rx="7" ry="2.5" /><path d="M5 6.5v11c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-11M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" /></>,
  card: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M7 15h3" /></>,
  chat: <path d="M4 5.5h16v10H9.5L5 19v-3.5H4z" />,
  pin: <><path d="M12 21s-6-5.4-6-10.5a6 6 0 0 1 12 0C18 15.6 12 21 12 21z" /><circle cx="12" cy="10.5" r="2.2" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z" /></>,
  access: <><circle cx="12" cy="4.5" r="1.8" /><path d="M5 8l7 1.5L19 8M12 9.5v5l-3 6M12 14.5l3 6" /></>,
  game: <><path d="M7 8h10a4 4 0 0 1 4 4.2l-.4 3.3a2.4 2.4 0 0 1-4.2 1.2L15 15H9l-1.4 1.7a2.4 2.4 0 0 1-4.2-1.2L3 12.2A4 4 0 0 1 7 8z" /><path d="M8 10.8v3M6.5 12.3h3" /></>,
  chart: <path d="M4 20V11M9.5 20V5M15 20v-6M20 20v-9" />,
  play: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M10 9.5v5l4.5-2.5z" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  ghost: <><path d="M5 20V11a7 7 0 0 1 14 0v9l-2.3-1.6-2.4 1.6-2.3-1.6-2.3 1.6-2.4-1.6z" /><circle cx="9.5" cy="11" r=".9" /><circle cx="14.5" cy="11" r=".9" /></>,
  filter: <path d="M4 5h16l-6 7.5V19l-4-2v-4.5z" />,
  ban: <><circle cx="12" cy="12" r="8.5" /><path d="M6 6l12 12" /></>,
  history: <><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4.5v3.8h3.8M12 8v4.5l3 2" /></>,
  mail: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3.5 7l8.5 6 8.5-6" /></>,
  phone: <><rect x="6.5" y="2.5" width="11" height="19" rx="2.6" /><path d="M10.5 18.5h3" /></>,
  download: <path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14" />,
  bookmark: <path d="M7 4h10v16l-5-3.5L7 20z" />,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.5v.5" /></>,
  home: <path d="M4 11l8-7 8 7v9h-5.5v-5.5h-5V20H4z" />,
  dot: <circle cx="12" cy="12" r="3.5" />,
};

// Порядок важен: первое совпадение побеждает («Screen Time passcode» —
// это код-пароль, а не экранное время). Цвета — системные цвета iOS.
const MATCH = [
  [/passcode|password|\bpin\b|passkey|face id|touch id|sign-?in|log ?in|security key/i, 'lock', '#34C759'],
  [/two-factor|2-step|verification|security|authentication/i, 'shield', '#8E8E93'],
  [/ghost/i, 'ghost', '#5856D6'],
  [/screen time|daily|time limit|play-?time|playtime|time management|screen distance/i, 'hourglass', '#5E5CE6'],
  [/downtime|bedtime|sleep|time away|focus|alarm/i, 'moon', '#5856D6'],
  [/app limit|app access|^apps?\b|app permissions|authorized apps|always allowed/i, 'grid', '#FF9500'],
  [/notification/i, 'bell', '#FF3B30'],
  [/sound|haptic|voice|vibration/i, 'speaker', '#FF2D55'],
  [/restrict|filter|maturity|age level|rating|sensitive|hidden words/i, 'filter', '#FF3B30'],
  [/privacy|visibility|discoverability/i, 'hand', '#007AFF'],
  [/family|parent|supervis|teen|pairing|guardian|ask to buy|ask a parent/i, 'family', '#30B0C7'],
  [/friend|follower|connection|people|member|invitation|close friends/i, 'userplus', '#34C759'],
  [/google|icloud|apple id|microsoft account/i, 'globe', '#007AFF'],
  [/account|profile|personal|your info|user|name|birthday|about/i, 'person', '#007AFF'],
  [/battery/i, 'battery', '#34C759'],
  [/display|brightness|appearance|wallpaper|theme|screen and video|dark mode|personaliz|lock screen|tv output/i, 'sun', '#007AFF'],
  [/wi-?fi|network|internet|data saving|mobile data/i, 'wifi', '#007AFF'],
  [/bluetooth|devices|accessor|controller|connected/i, 'devices', '#007AFF'],
  [/storage|data management|backup|saved|archive|memories|offline/i, 'disk', '#8E8E93'],
  [/purchase|spending|buy|payment|billing|balance|wallet|subscript|order|meta pay/i, 'card', '#34C759'],
  [/communicat|chat|message|\bdm\b|comments|replies/i, 'chat', '#34C759'],
  [/location|map|find/i, 'pin', '#FF9500'],
  [/language|region|time & language/i, 'globe', '#007AFF'],
  [/accessib|captions/i, 'access', '#007AFF'],
  [/game|gaming|experiences|xbox|mii|amiibo/i, 'game', '#FF2D55'],
  [/activity|report|overview|insight|history|recent/i, 'chart', '#FF9500'],
  [/playback|autoplay|video|quality|watch|live|captures|broadcast|youtube kids|clips/i, 'play', '#FF3B30'],
  [/download/i, 'download', '#007AFF'],
  [/email|mail/i, 'mail', '#007AFF'],
  [/mobile number|phone/i, 'phone', '#34C759'],
  [/blocked|block\b/i, 'ban', '#FF3B30'],
  [/share|sharing/i, 'userplus', '#30B0C7'],
  [/general|system|settings|preferences|control centre|control center|update/i, 'gear', '#8E8E93'],
  [/home/i, 'home', '#007AFF'],
  [/help|support|report a problem/i, 'info', '#8E8E93'],
];

export function glyphFor(label = '') {
  for (const [re, g, c] of MATCH) if (re.test(label)) return { g, c };
  return { g: 'dot', c: '#8E8E93' };
}

export function Glyph({ name, size = 16, color = 'currentColor', width = 1.9 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {G[name] || G.dot}
    </svg>
  );
}
