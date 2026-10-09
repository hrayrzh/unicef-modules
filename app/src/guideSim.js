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
 *
 * Язык экрана. У родителя телефон может быть на русском, и английские
 * названия пунктов ему ничего не скажут. Поэтому у каждого экрана есть
 * русский вариант подписей (`ruTitle`, `ruTarget`), выведенный из той же
 * скобки «(рус. «…»)», а соседние пункты меню заданы парами en/ru. Какой
 * язык показывать — решает переключатель в GuideSimulator.
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

/**
 * Правдоподобное окружение — чтобы экран читался как настоящий, а не как
 * схема. Пары [английский, русский]: русские подписи взяты из локализованных
 * интерфейсов самих платформ, чтобы в режиме RU экран выглядел как русский
 * телефон, а не как перевод.
 */
const DECOY_PAIRS = {
  ios: [['General', 'Основные'], ['Face ID & Passcode', 'Face ID и код-пароль'], ['Privacy & Security', 'Конфиденциальность и безопасность'], ['Notifications', 'Уведомления'], ['Battery', 'Аккумулятор'], ['Focus', 'Фокусирование']],
  macos: [['General', 'Основные'], ['Appearance', 'Оформление'], ['Desktop & Dock', 'Рабочий стол и Dock'], ['Displays', 'Мониторы'], ['Network', 'Сеть'], ['Sound', 'Звук']],
  android: [['Network & internet', 'Сеть и интернет'], ['Connected devices', 'Подключённые устройства'], ['Apps', 'Приложения'], ['Notifications', 'Уведомления'], ['Battery', 'Батарея'], ['Storage', 'Хранилище']],
  windows: [['System', 'Система'], ['Bluetooth & devices', 'Bluetooth и устройства'], ['Personalization', 'Персонализация'], ['Apps', 'Приложения'], ['Time & language', 'Время и язык'], ['Gaming', 'Игры']],
  youtube: [['Account', 'Аккаунт'], ['Notifications', 'Уведомления'], ['Playback', 'Воспроизведение'], ['Privacy', 'Конфиденциальность'], ['Data saving', 'Экономия трафика']],
  instagram: [['Account Centre', 'Центр аккаунтов'], ['Notifications', 'Уведомления'], ['Privacy', 'Конфиденциальность'], ['Saved', 'Сохранённое'], ['Close Friends', 'Близкие друзья']],
  tiktok: [['Manage account', 'Управление аккаунтом'], ['Privacy', 'Конфиденциальность'], ['Security', 'Безопасность'], ['Balance', 'Баланс'], ['Display', 'Экран']],
  snapchat: [['My Account', 'Мой аккаунт'], ['Notifications', 'Уведомления'], ['Privacy Controls', 'Конфиденциальность'], ['Additional Services', 'Дополнительные услуги']],
  roblox: [['Account Info', 'Данные аккаунта'], ['Security', 'Безопасность'], ['Privacy', 'Конфиденциальность'], ['Billing', 'Оплата'], ['Notifications', 'Уведомления']],
  playstation: [['Users and Accounts', 'Пользователи и учётные записи'], ['Network', 'Сеть'], ['Sound', 'Звук'], ['Storage', 'Хранилище'], ['System', 'Система']],
  xbox: [['General', 'Общие'], ['Account', 'Учётная запись'], ['Preferences', 'Настройки'], ['Devices & connections', 'Устройства и подключения']],
  nintendo: [['Data Management', 'Управление данными'], ['Screen Brightness', 'Яркость экрана'], ['Themes', 'Темы'], ['Internet', 'Интернет'], ['Users', 'Пользователи']],
  discord: [['My Account', 'Моя учётная запись'], ['Profiles', 'Профили'], ['Voice & Video', 'Голос и видео'], ['Appearance', 'Внешний вид'], ['Notifications', 'Уведомления']],
  // Модуль 3 — включение 2FA в сервисах аккаунтов.
  google: [['Personal info', 'Личная информация'], ['Data & privacy', 'Данные и конфиденциальность'], ['People & sharing', 'Люди и доступ'], ['Payments', 'Платежи'], ['About', 'О сервисе']],
  apple: [['Name, Phone, Email', 'Имя, телефон, e-mail'], ['Password & Security', 'Пароль и безопасность'], ['Payment & Shipping', 'Оплата и доставка'], ['Subscriptions', 'Подписки'], ['iCloud', 'iCloud']],
  facebook: [['Accounts Center', 'Центр аккаунтов'], ['Privacy', 'Конфиденциальность'], ['Notifications', 'Уведомления'], ['Your activity', 'Ваши действия'], ['Ad preferences', 'Настройки рекламы']],
  microsoft: [['Your info', 'Ваши данные'], ['Privacy', 'Конфиденциальность'], ['Devices', 'Устройства'], ['Services & subscriptions', 'Службы и подписки'], ['Payment options', 'Способы оплаты']],
};

const DECOY = Object.fromEntries(
  Object.entries(DECOY_PAIRS).map(([k, v]) => [k, v.map(([en, ru]) => ({ en, ru }))]),
);

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
  if (n.includes('google') || n.includes('gmail')) return 'google';
  if (n.includes('apple')) return 'apple';
  if (n.includes('facebook')) return 'facebook';
  if (n.includes('microsoft')) return 'microsoft';
  return 'ios';
}

/** Стабильный хеш: позиция цели в списке не должна прыгать при перерисовке. */
const hash = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const splitPath = (s) => String(s).split('›').map((x) => x.trim()).filter(Boolean);

/**
 * Русская подпись одного пункта. Русский путь «Настройки › Семья» режется так
 * же, как английский, и сегменты сопоставляются по позиции. Если число
 * сегментов не совпало (в английском пути оказался армянский кусок вроде
 * «[երեխա]», и регулярка захватила только хвост), сопоставлять по позиции
 * нельзя — тогда берётся последний русский сегмент: он и есть сама настройка.
 */
function ruFor(enSegs, ruFull, index) {
  const rs = splitPath(ruFull);
  if (!rs.length) return undefined;
  if (rs.length === enSegs.length) return rs[index];
  return index === enSegs.length - 1 ? rs[rs.length - 1] : undefined;
}

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
    const seg = splitPath(path);
    const ruSeg = (i) => ruFor(seg, found[0].ru, i);
    for (let i = 0; i < seg.length - 1; i += 1) {
      out.push({
        kind: 'nav', title: seg[i], target: seg[i + 1], ru: found[0].ru,
        ruTitle: ruSeg(i), ruTarget: ruSeg(i + 1), key: `${stepIndex}:n${i}`,
      });
    }
    const inside = seg[seg.length - 1];
    const insideRu = ruSeg(seg.length - 1);
    found.slice(1).forEach((s, j) => {
      out.push({
        kind: 'toggle', title: inside, target: s.en, ru: s.ru,
        ruTitle: insideRu, ruTarget: ruFor([s.en], s.ru, 0), key: `${stepIndex}:t${j}`,
      });
    });
  } else {
    found.forEach((s, j) => {
      out.push({
        kind: 'toggle', title: null, target: s.en, ru: s.ru,
        ruTarget: ruFor([s.en], s.ru, 0), key: `${stepIndex}:t${j}`,
      });
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

/** Есть ли у гайда что показать по-русски — иначе переключатель языка не нужен. */
export function hasRussian(screens) {
  return screens.some((sc) => !!sc.ruTarget);
}

/** Русский вариант подзаголовка гайда: «Screen Time (рус. «Экранное время»)» → «Экранное время». */
export function subRu(sub = '') {
  const m = /\(рус\.\s*«([^»]*)»\)/.exec(sub);
  return m ? m[1] : undefined;
}

/**
 * Список пунктов вокруг цели. Цель стоит на устойчивой позиции, соседи не
 * повторяются: шаг выборки по кольцу пула должен быть взаимно прост с его
 * длиной, иначе индексы зацикливаются и один и тот же пункт появляется дважды.
 * Проще и надёжнее — набирать, пропуская уже взятое.
 *
 * Каждая строка — пара { en, ru }; хеш и позиция считаются по английскому
 * названию, поэтому переключение языка не передвигает пункты на экране.
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
    if (item.en.toLowerCase() === targetKey || picks.includes(item)) continue;
    picks.push(item);
  }

  const rows = [];
  for (let i = 0; i <= n; i += 1) {
    if (i === pos) rows.push({ en: screen.target, ru: screen.ruTarget, target: true });
    else {
      const item = picks[i > pos ? i - 1 : i];
      if (item) rows.push({ en: item.en, ru: item.ru, target: false });
    }
  }
  return rows;
}
