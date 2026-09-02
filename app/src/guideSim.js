/**
 * Сценарий симулятора экрана устройства.
 *
 * Требование заказчика, повторённое в комментариях к каждому гайду:
 * «գիֆ և տեքստային chechlist» — инструкция показывается наглядно и при этом
 * остаётся текстовым пошаговиком. Комментарий №12 («идея Грайра») уточняет:
 * выбираешь устройство, дальше видишь последовательность действий на экране.
 *
 * Сценарий не пишется руками для каждой платформы: он выводится из тех же
 * строк шагов, что и текстовый список. Значит текст и симулятор не могут
 * разойтись — правка формулировки меняет и то, и другое.
 */

// Шаги записаны как «Settings › Family (рус. «Настройки › Семья»)»:
// латинское название настройки, следом русский эквивалент в скобках.
const SETTING_RE = /([A-Za-z][A-Za-z0-9 &'’\-/›.]*?)\s*\(рус\.\s*«([^»]*)»\)/g;

// Значения, а не пункты меню: «поставьте Don't Allow» — это выбор внутри
// экрана, отдельным экраном его показывать незачем.
const VALUES = new Set([
  "don't allow", 'нет', 'on', 'off', 'limit adult websites', 'keep me safe',
  'friends of friends', 'no one', 'solo and focused', 'organizer', 'teen', 'parent',
]);

// Не больше трёх экранов на шаг. Без ограничения плотные шаги iOS
// разворачиваются в десяток экранов подряд, и человек устаёт тапать
// раньше, чем доходит до сути. Полный текст шага виден всегда.
const MAX_PER_STEP = 3;

/** Правдоподобное окружение — чтобы экран читался как настоящий, а не как схема. */
const DECOY = {
  ios: ['General', 'Face ID & Passcode', 'Privacy & Security', 'Notifications', 'Battery', 'Focus'],
  macos: ['General', 'Appearance', 'Desktop & Dock', 'Displays', 'Network', 'Sound'],
  android: ['Network & internet', 'Connected devices', 'Apps', 'Notifications', 'Battery', 'Storage'],
  windows: ['System', 'Bluetooth & devices', 'Personalization', 'Apps', 'Time & language', 'Gaming'],
  youtube: ['Account', 'Notifications', 'Playback', 'Privacy', 'Data saving'],
  instagram: ['Account Centre', 'Notifications', 'Privacy', 'Saved', 'Close Friends'],
  tiktok: ['Manage account', 'Privacy', 'Security', 'Balance', 'Display'],
  snapchat: ['My Account', 'Notifications', 'Privacy Controls', 'Additional Services'],
  roblox: ['Account Info', 'Security', 'Privacy', 'Billing', 'Notifications'],
  playstation: ['Users and Accounts', 'Network', 'Sound', 'Storage', 'System'],
  xbox: ['General', 'Account', 'Preferences', 'Devices & connections'],
  nintendo: ['Data Management', 'Screen Brightness', 'Themes', 'Internet', 'Users'],
  discord: ['My Account', 'Profiles', 'Voice & Video', 'Appearance', 'Notifications'],
};

/** Платформа выводится из названия гайда — отдельного поля в данных нет. */
export function platformOf(name = '') {
  const n = name.toLowerCase();
  if (n.includes('iphone') || n.includes('ipad') || n.includes('ios')) return 'ios';
  if (n.includes('mac')) return 'macos';
  if (n.includes('android')) return 'android';
  if (n.includes('windows')) return 'windows';
  if (n.includes('youtube')) return 'youtube';
  if (n.includes('instagram')) return 'instagram';
  if (n.includes('tiktok')) return 'tiktok';
  if (n.includes('snapchat')) return 'snapchat';
  if (n.includes('roblox')) return 'roblox';
  if (n.includes('playstation')) return 'playstation';
  if (n.includes('xbox')) return 'xbox';
  if (n.includes('nintendo') || n.includes('switch')) return 'nintendo';
  if (n.includes('discord')) return 'discord';
  return 'ios';
}

/** Стабильный хеш: позиция цели в списке не должна прыгать при перерисовке. */
const hash = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/** Один шаг гайда → экраны симулятора. */
function screensForStep(step, stepIndex, platform) {
  const found = [];
  const seen = new Set();
  for (const m of String(step).matchAll(SETTING_RE)) {
    const label = m[1].trim().replace(/\s+/g, ' ');
    const key = label.toLowerCase();
    if (!label || VALUES.has(key) || seen.has(key)) continue;
    seen.add(key);
    found.push({ en: label, ru: m[2] });
  }

  // Шаг без названий настроек — установить приложение, ввести дату рождения.
  // Показывать «меню» тут не из чего, поэтому это экран подтверждения.
  if (!found.length) return [{ kind: 'act', key: `${stepIndex}:a` }];

  const out = [];
  const path = found[0].en;
  if (path.includes('›')) {
    const seg = path.split('›').map((x) => x.trim()).filter(Boolean);
    for (let i = 0; i < seg.length - 1; i += 1) {
      out.push({ kind: 'nav', title: seg[i], target: seg[i + 1], ru: found[0].ru, key: `${stepIndex}:n${i}` });
    }
    const inside = seg[seg.length - 1];
    found.slice(1).forEach((s, j) => {
      out.push({ kind: 'toggle', title: inside, target: s.en, ru: s.ru, key: `${stepIndex}:t${j}` });
    });
  } else {
    found.forEach((s, j) => {
      out.push({ kind: 'toggle', title: null, target: s.en, ru: s.ru, key: `${stepIndex}:t${j}` });
    });
  }
  return out.slice(0, MAX_PER_STEP);
}

/** Все экраны гайда, с привязкой каждого к своему шагу. */
export function buildScenario(guide) {
  const platform = platformOf(guide.name);
  const screens = [];
  (guide.steps || []).forEach((text, i) => {
    screensForStep(text, i, platform).forEach((sc) => {
      screens.push({ ...sc, platform, stepIndex: i, stepText: text });
    });
  });
  return screens;
}

/**
 * Список пунктов вокруг цели. Цель стоит на устойчивой позиции, соседи не
 * повторяются: шаг выборки по кольцу пула должен быть взаимно прост с его
 * длиной, иначе индексы зацикливаются и один и тот же пункт появляется дважды.
 * Проще и надёжнее — набирать, пропуская уже взятое.
 */
export function menuRows(screen) {
  const pool = DECOY[screen.platform] || DECOY.ios;
  const n = 4;
  const h = hash(screen.target);
  const pos = h % (n + 1);

  const picks = [];
  const targetKey = screen.target.toLowerCase();
  for (let i = 0; i < pool.length && picks.length < n; i += 1) {
    const item = pool[(h + i) % pool.length];
    // Соседом не может быть сама цель или уже добавленный пункт.
    if (item.toLowerCase() === targetKey || picks.includes(item)) continue;
    picks.push(item);
  }

  const rows = [];
  for (let i = 0; i <= n; i += 1) {
    if (i === pos) rows.push({ label: screen.target, target: true });
    else {
      const item = picks[i > pos ? i - 1 : i];
      if (item) rows.push({ label: item, target: false });
    }
  }
  return rows;
}
