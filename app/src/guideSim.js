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
 * схема. Пары [английский, русский]: русские подписи — как в локализованных
 * интерфейсах самих платформ, чтобы в режиме RU экран выглядел как русский
 * телефон, а не как перевод.
 *
 * Раньше у платформы было 4–6 пунктов на все экраны, и экраны выглядели
 * одинаково. Теперь у каждой платформы полный корневой список, а у
 * узнаваемых экранов (Screen Time, Family Center, Accounts Center…) — свои
 * пункты: внутри «Экранного времени» соседи — «В покое» и «Лимиты
 * приложений», а не «Аккумулятор».
 */
const DECOY_PAIRS = {
  ios: [['General', 'Основные'], ['Accessibility', 'Универсальный доступ'], ['Camera', 'Камера'], ['Control Centre', 'Пункт управления'], ['Display & Brightness', 'Экран и яркость'], ['Wallpaper', 'Обои'], ['Notifications', 'Уведомления'], ['Sounds & Haptics', 'Звуки, тактильные сигналы'], ['Focus', 'Фокусирование'], ['Face ID & Passcode', 'Face ID и код-пароль'], ['Privacy & Security', 'Конфиденциальность и безопасность'], ['Battery', 'Аккумулятор'], ['App Store', 'App Store'], ['Wallet & Apple Pay', 'Wallet и Apple Pay']],
  apple: [['Personal Information', 'Личная информация'], ['Sign-In & Security', 'Вход и безопасность'], ['Payment & Shipping', 'Оплата и доставка'], ['Subscriptions', 'Подписки'], ['iCloud', 'iCloud'], ['Family Sharing', 'Семейный доступ'], ['Media & Purchases', 'Медиаматериалы и покупки'], ['Find My', 'Локатор']],
  macos: [['Wi-Fi', 'Wi-Fi'], ['Bluetooth', 'Bluetooth'], ['Network', 'Сеть'], ['Notifications', 'Уведомления'], ['Sound', 'Звук'], ['Focus', 'Фокусирование'], ['General', 'Основные'], ['Appearance', 'Оформление'], ['Accessibility', 'Универсальный доступ'], ['Desktop & Dock', 'Рабочий стол и Dock'], ['Displays', 'Дисплеи'], ['Privacy & Security', 'Конфиденциальность и безопасность'], ['Touch ID & Password', 'Touch ID и пароль'], ['Users & Groups', 'Пользователи и группы']],
  android: [['Network & internet', 'Сеть и интернет'], ['Connected devices', 'Подключенные устройства'], ['Apps', 'Приложения'], ['Notifications', 'Уведомления'], ['Battery', 'Батарея'], ['Storage', 'Хранилище'], ['Sound & vibration', 'Звук и вибрация'], ['Display', 'Экран'], ['Wallpaper & style', 'Обои и стиль'], ['Accessibility', 'Спец. возможности'], ['Security & privacy', 'Безопасность и конфиденциальность'], ['Location', 'Местоположение'], ['Digital Wellbeing', 'Цифровое благополучие']],
  google: [['Home', 'Главная'], ['Personal info', 'Личная информация'], ['Data & privacy', 'Данные и конфиденциальность'], ['Security', 'Безопасность'], ['People & sharing', 'Настройки доступа'], ['Payments & subscriptions', 'Платежи и подписки'], ['About', 'О сервисе']],
  windows: [['Home', 'Главная'], ['System', 'Система'], ['Bluetooth & devices', 'Bluetooth и устройства'], ['Network & internet', 'Сеть и Интернет'], ['Personalization', 'Персонализация'], ['Apps', 'Приложения'], ['Accounts', 'Учетные записи'], ['Time & language', 'Время и язык'], ['Gaming', 'Игры'], ['Accessibility', 'Специальные возможности'], ['Privacy & security', 'Конфиденциальность и защита'], ['Windows Update', 'Центр обновления Windows']],
  // Учётная запись Microsoft (гайд 2FA в модуле 3), не Family Safety —
  // у той свой экран, см. 'microsoft family safety' ниже.
  microsoft: [['Home', 'Главная'], ['Your info', 'Ваши сведения'], ['Privacy', 'Конфиденциальность'], ['Security', 'Безопасность'], ['Payment options', 'Способы оплаты'], ['Order history', 'Журнал заказов'], ['Devices', 'Устройства'], ['Subscriptions', 'Подписки'], ['Family', 'Семья']],
  youtube: [['General', 'Общие'], ['Switch account', 'Сменить аккаунт'], ['Family Center', 'Семейный центр'], ['Notifications', 'Уведомления'], ['Purchases and memberships', 'Покупки и спонсорство'], ['Manage all history', 'Управление историей'], ['Your data in YouTube', 'Ваши данные на YouTube'], ['Privacy', 'Конфиденциальность'], ['Video quality preferences', 'Качество видео'], ['Downloads', 'Скачивания'], ['Watch on TV', 'Просмотр на телевизоре'], ['Captions', 'Субтитры'], ['Data saving', 'Экономия трафика']],
  instagram: [['Saved', 'Сохраненное'], ['Archive', 'Архив'], ['Your activity', 'Ваши действия'], ['Notifications', 'Уведомления'], ['Time management', 'Управление временем'], ['Account privacy', 'Конфиденциальность аккаунта'], ['Close Friends', 'Близкие друзья'], ['Blocked', 'Заблокированные'], ['Hide story and live', 'Скрыть историю и эфир'], ['Messages and story replies', 'Сообщения и ответы на истории'], ['Tags and mentions', 'Метки и упоминания'], ['Comments', 'Комментарии'], ['Accounts Center', 'Центр аккаунтов']],
  facebook: [['Accounts Center', 'Центр аккаунтов'], ['Profile settings', 'Настройки профиля'], ['Notifications', 'Уведомления'], ['Accessibility', 'Специальные возможности'], ['Language and region', 'Язык и регион'], ['Media', 'Медиафайлы'], ['Time management', 'Управление временем'], ['Dark mode', 'Темный режим'], ['Audience and visibility', 'Аудитория и видимость'], ['Your activity', 'Ваши действия'], ['Payments', 'Платежи']],
  tiktok: [['Account', 'Аккаунт'], ['Privacy', 'Конфиденциальность'], ['Security & permissions', 'Безопасность и разрешения'], ['Share profile', 'Поделиться профилем'], ['Notifications', 'Уведомления'], ['LIVE', 'LIVE'], ['Activity center', 'Центр действий'], ['Content preferences', 'Настройки контента'], ['Ads', 'Реклама'], ['Playback', 'Воспроизведение'], ['Display', 'Экран'], ['Language', 'Язык'], ['Offline videos', 'Офлайн-видео']],
  snapchat: [['Name', 'Имя'], ['Username', 'Имя пользователя'], ['Birthday', 'День рождения'], ['Mobile Number', 'Номер телефона'], ['Email', 'Эл. почта'], ['Password', 'Пароль'], ['Two-Factor Authentication', 'Двухфакторная аутентификация'], ['Notifications', 'Уведомления'], ['Memories', 'Воспоминания'], ['Blocked', 'Заблокированные'], ['Clear Data', 'Очистка данных'], ['My Data', 'Мои данные']],
  roblox: [['Account Info', 'Данные аккаунта'], ['Security', 'Безопасность'], ['Privacy', 'Конфиденциальность'], ['Parental Controls', 'Родительский контроль'], ['Notifications', 'Уведомления'], ['Billing', 'Оплата'], ['Subscriptions', 'Подписки'], ['App Permissions', 'Разрешения приложения']],
  playstation: [['Accessibility', 'Специальные возможности'], ['Network', 'Сеть'], ['Users and Accounts', 'Пользователи и учетные записи'], ['Family and Parental Controls', 'Семья и родительский контроль'], ['System', 'Система'], ['Storage', 'Память'], ['Sound', 'Звук'], ['Screen and Video', 'Экран и видео'], ['Accessories', 'Аксессуары'], ['Notifications', 'Уведомления'], ['Captures and Broadcasts', 'Снимки и трансляции']],
  xbox: [['General', 'Общие'], ['Account', 'Учетная запись'], ['Preferences', 'Настройки'], ['Accessibility', 'Специальные возможности'], ['Devices & connections', 'Устройства и подключения'], ['System', 'Система']],
  nintendo: [['Data Management', 'Управление данными'], ['Users', 'Пользователи'], ['Mii', 'Mii'], ['Parental Controls', 'Родительский контроль'], ['Internet', 'Интернет'], ['Screen Brightness', 'Яркость экрана'], ['Lock Screen', 'Блокировка экрана'], ['Themes', 'Темы'], ['Notifications', 'Уведомления'], ['Sleep Mode', 'Режим ожидания'], ['Controllers and Sensors', 'Контроллеры и датчики'], ['TV Output', 'Вывод на ТВ'], ['System', 'Система']],
  discord: [['My Account', 'Моя учётная запись'], ['Profiles', 'Профили'], ['Content & Social', 'Контент и общение'], ['Data & Privacy', 'Данные и конфиденциальность'], ['Family Center', 'Семейный центр'], ['Authorized Apps', 'Авторизованные приложения'], ['Devices', 'Устройства'], ['Connections', 'Интеграции'], ['Appearance', 'Внешний вид'], ['Voice & Video', 'Голос и видео'], ['Notifications', 'Уведомления']],
};

/**
 * Пункты конкретных экранов. Ключ — название экрана (или подзаголовок гайда
 * для экранов без пути) в нижнем регистре; `платформа:экран`, если у разных
 * платформ одноимённые экраны выглядят по-разному.
 */
const CONTEXT_PAIRS = {
  'screen time': [['App & Website Activity', 'Активность в приложениях и на веб-сайтах'], ['Downtime', 'В покое'], ['App Limits', 'Лимиты приложений'], ['Always Allowed', 'Разрешенные всегда'], ['Screen Distance', 'Расстояние до экрана'], ['Communication Limits', 'Ограничения общения'], ['Communication Safety', 'Безопасность общения'], ['Content & Privacy Restrictions', 'Контент и конфиденциальность'], ['Lock Screen Time Settings', 'Блокировка настроек']],
  'ios:family': [['Family Sharing', 'Семейный доступ'], ['Purchase Sharing', 'Общие покупки'], ['Location Sharing', 'Передача геопозиции'], ['Subscriptions', 'Подписки'], ['Ask to Buy', 'Попросить купить'], ['Screen Time', 'Экранное время'], ['Add Member', 'Добавить участника']],
  'android:google': [['Manage your Google Account', 'Управление аккаунтом Google'], ['Autofill', 'Автозаполнение'], ['Backup', 'Резервное копирование'], ['Devices & sharing', 'Устройства и обмен данными'], ['Find My Device', 'Найти устройство'], ['Personalize using shared data', 'Персонализация'], ['Set up & restore', 'Настройка и восстановление']],
  'google family link': [['Daily limit', 'Дневной лимит'], ['Bedtime', 'Режим сна'], ['App limits', 'Ограничения для приложений'], ['Content restrictions', 'Ограничения контента'], ['Location', 'Местоположение'], ['Activity', 'Действия'], ['Devices', 'Устройства'], ['Account settings', 'Настройки аккаунта']],
  'microsoft family safety': [['Overview', 'Обзор'], ['Activity reporting', 'Отчеты о действиях'], ['Screen time', 'Время использования устройства'], ['Content filters', 'Фильтры содержимого'], ['Spending', 'Расходы'], ['Find your family', 'Найти семью'], ['Devices', 'Устройства']],
  'teen accounts': [['Family Center', 'Семейный центр'], ['Supervision', 'Родительский контроль'], ['Time management', 'Управление временем'], ['Account privacy', 'Конфиденциальность аккаунта'], ['Messages and story replies', 'Сообщения и ответы на истории'], ['Sensitive content', 'Деликатный контент'], ['Hidden words', 'Скрытые слова'], ['Sleep mode', 'Режим сна']],
  'accounts center': [['Personal details', 'Личная информация'], ['Password and security', 'Пароль и безопасность'], ['Ad preferences', 'Настройки рекламы'], ['Meta Pay', 'Meta Pay'], ['Connected experiences', 'Связанные функции'], ['Your information and permissions', 'Ваша информация и разрешения'], ['Profiles', 'Профили']],
  'password and security': [['Change password', 'Изменить пароль'], ['Two-factor authentication', 'Двухфакторная аутентификация'], ['Saved login', 'Сохраненные данные для входа'], ["Where you're logged in", 'Где вы вошли'], ['Login alerts', 'Оповещения о входе'], ['Recent emails', 'Недавние эл. письма'], ['Security Checkup', 'Проверка безопасности']],
  'family pairing': [['Screen Time', 'Экранное время'], ['Restricted Mode', 'Ограниченный режим'], ['Time Away', 'Время вне приложения'], ['Search', 'Поиск'], ['Discoverability', 'Видимость аккаунта'], ['Direct Messages', 'Личные сообщения'], ['Liked videos', 'Понравившиеся видео'], ['Comments', 'Комментарии']],
  'snapchat:family center': [['Content Controls', 'Контроль контента'], ['Send Invitation', 'Отправить приглашение'], ['Friends', 'Друзья'], ['Recent Chats', 'Недавние чаты'], ['My AI', 'My AI'], ['Report a concern', 'Сообщить о проблеме']],
  'snap map': [['Ghost Mode', 'Режим призрака'], ['My Friends', 'Мои друзья'], ['My Friends, Except…', 'Мои друзья, кроме…'], ['Only These Friends', 'Только эти друзья'], ['Location Requests', 'Запросы местоположения'], ['Location Settings', 'Настройки геолокации']],
  'discord:family center': [['Activity Overview', 'Обзор активности'], ['Connect with Teen', 'Связаться с подростком'], ['Privacy & Safety', 'Конфиденциальность и безопасность'], ['Message Requests', 'Запросы на переписку'], ['Friend Requests', 'Запросы в друзья'], ['Sensitive Media', 'Деликатные медиафайлы']],
  'roblox:parental controls': [['Parent PIN', 'PIN-код родителя'], ['Content Maturity', 'Зрелость контента'], ['Communication', 'Общение'], ['Spending Limits', 'Лимиты расходов'], ['Screen Time', 'Экранное время'], ['Friends', 'Друзья'], ['Linked Accounts', 'Связанные аккаунты']],
  'nintendo:parental controls': [['Restriction Level', 'Уровень ограничений'], ['Play-Time Limit', 'Лимит времени игры'], ['Bedtime Alarm', 'Сигнал отхода ко сну'], ['Communication with Others', 'Общение с другими'], ['Posting to Social Media', 'Публикации в соцсетях'], ['Restricted Software', 'Ограниченные программы'], ['Change PIN', 'Изменить PIN-код']],
  'family and parental controls': [['Family Management', 'Управление семьей'], ['PS5 Console Restrictions', 'Ограничения консоли PS5'], ['Playtime Settings', 'Настройки времени игры'], ['Age Level for Games', 'Возрастной уровень игр'], ['Web Browsing', 'Веб-браузер'], ['Communication and User-Generated Content', 'Общение и контент пользователей'], ['Monthly Spending Limit', 'Месячный лимит расходов']],
  'family settings': [['Content restrictions', 'Ограничения контента'], ['Screen time', 'Время использования'], ['Spending', 'Расходы'], ['Activity reporting', 'Отчеты о действиях'], ['Privacy & online safety', 'Конфиденциальность и безопасность в сети'], ['Ask a parent', 'Спросить родителя']],
  'xbox:account': [['Sign-in, security & passkey', 'Вход, безопасность и ключ доступа'], ['Family', 'Семья'], ['Privacy & online safety', 'Конфиденциальность и безопасность в сети'], ['Payment & billing', 'Оплата и счета'], ['Subscriptions', 'Подписки'], ['Linked social accounts', 'Связанные учетные записи']],
  'xbox:family': [['Online safety & family', 'Безопасность в сети и семья'], ['Family settings', 'Параметры семьи'], ['Manage family members', 'Члены семьи'], ['Add to family', 'Добавить в семью']],
  'online safety & family': [['Family settings', 'Параметры семьи'], ['Privacy & online safety', 'Конфиденциальность и безопасность в сети'], ['Manage family members', 'Члены семьи'], ['Xbox privacy', 'Конфиденциальность Xbox']],
  'privacy & online safety': [['Xbox privacy', 'Конфиденциальность Xbox'], ['App privacy', 'Конфиденциальность приложений'], ['Location', 'Расположение'], ['Diagnostic data', 'Диагностические данные'], ['Family settings', 'Параметры семьи']],
  'microsoft:security': [['Sign-in activity', 'Действия при входе'], ['Password security', 'Безопасность пароля'], ['Two-step verification', 'Двухшаговая проверка'], ['Ways to prove who you are', 'Способы подтверждения личности'], ['Passwordless account', 'Учетная запись без пароля'], ['Recovery code', 'Код восстановления'], ['Trusted devices', 'Доверенные устройства']],
  'google:security': [['Recent security activity', 'Недавние действия'], ['How you sign in to Google', 'Способы входа в аккаунт'], ['2-Step Verification', 'Двухэтапная аутентификация'], ['Passkeys and security keys', 'Ключи доступа'], ['Password', 'Пароль'], ['Recovery phone', 'Резервный номер телефона'], ['Recovery email', 'Резервный адрес эл. почты'], ['Your devices', 'Ваши устройства']],
  '2-step verification': [['Get started', 'Начать'], ['Second steps', 'Дополнительные этапы'], ['Backup codes', 'Резервные коды'], ['Authenticator', 'Приложение Authenticator'], ['Google prompts', 'Уведомления Google']],
  'sign-in & security': [['Email & Phone Numbers', 'Эл. почта и номера телефонов'], ['Password', 'Пароль'], ['Two-Factor Authentication', 'Двухфакторная аутентификация'], ['Account Recovery', 'Восстановление учетной записи'], ['Legacy Contact', 'Цифровой наследник'], ['Sign in with Apple', 'Вход с Apple']],
  'two-factor authentication': [['Turn On', 'Включить'], ['Trusted Phone Numbers', 'Доверенные номера телефонов'], ['Security Keys', 'Ключи безопасности'], ['Get Verification Code', 'Получить код проверки']],
};

const pairsToRows = (list) => list.map(([en, ru]) => ({ en, ru }));
const DECOY = Object.fromEntries(Object.entries(DECOY_PAIRS).map(([k, v]) => [k, pairsToRows(v)]));
const CONTEXT = Object.fromEntries(Object.entries(CONTEXT_PAIRS).map(([k, v]) => [k, pairsToRows(v)]));

/** Пункты для экрана: свои у узнаваемого экрана, иначе корневой список платформы. */
function poolFor(screen) {
  const ctx = String(screen.title || screen.ctx || '').toLowerCase();
  return CONTEXT[`${screen.platform}:${ctx}`] || CONTEXT[ctx] || DECOY[screen.platform] || DECOY.ios;
}

/** Корневой список платформы — боковое меню у окон и консолей. */
export function sideRows(platform, n = 7) {
  return (DECOY[platform] || DECOY.ios).slice(0, n);
}

// Что на экране переключатель, а что — пункт меню, на который нажимают.
// Раньше всё без пути было переключателем, и «Family Center» или
// «Send Invitation» выглядели как тумблеры.
const SWITCHY = /mode|passcode|\bpin\b|passkey|filter|limit|restrict|ask to buy|downtime|bedtime|alarm|verification|authentication|ghost|requests|history|time away|daily|spending|level|maturity|communication|purchases|sharing|safety/i;
const isSwitch = (label) => SWITCHY.test(label) && !/privacy & safety/i.test(label);

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

// Регулярка захватывает латиницу до скобки целиком, и в начало пути иногда
// попадает конец предыдущей фразы: «Google / Gmail. Google Account › …»,
// «Facebook. Settings › …». Название экрана — то, что после последней точки.
const cleanHead = (s) => {
  const i = s.lastIndexOf('. ');
  return i >= 0 ? s.slice(i + 2).trim() : s;
};

/** Один шаг гайда → экраны симулятора. */
function screensForStep(step, stepIndex) {
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

  // Настройки идут в порядке текста. Путь «A › B › C» — это переходы по
  // меню, где бы в шаге он ни стоял (раньше путь учитывался, только если
  // шёл первым, иначе показывался тумблером). Остальные настройки — пункты
  // на последнем открытом экране: тумблер или строка, на которую нажимают.
  const out = [];
  let inside = null;
  let insideRu;
  found.forEach((s, j) => {
    if (s.en.includes('›')) {
      const seg = splitPath(s.en);
      seg[0] = cleanHead(seg[0]);
      const ruSeg = (i) => ruFor(seg, s.ru, i);
      for (let i = 0; i < seg.length - 1; i += 1) {
        out.push({
          kind: 'nav', title: seg[i], target: seg[i + 1], ru: s.ru,
          ruTitle: ruSeg(i), ruTarget: ruSeg(i + 1), key: `${stepIndex}:${j}n${i}`,
        });
      }
      inside = seg[seg.length - 1];
      insideRu = ruSeg(seg.length - 1);
      return;
    }
    const target = cleanHead(s.en);
    out.push({
      kind: isSwitch(target) ? 'toggle' : 'tap', title: inside, target, ru: s.ru,
      ruTitle: insideRu, ruTarget: ruFor([target], s.ru, 0), key: `${stepIndex}:${j}t`,
    });
  });
  return out.slice(0, MAX_PER_STEP);
}

/** Все экраны гайда, с привязкой каждого к своему шагу. */
export function buildScenario(guide) {
  const platform = platformOf(guide.name);
  // Экран без пути открыт в разделе, о котором гайд: «Screen Time»,
  // «Family Pairing». Его пункты и подбираются как соседи.
  const ctx = String(guide.sub || '').split('(')[0].trim();
  const screens = [];
  (guide.steps || []).forEach((text, i) => {
    screensForStep(text, i).forEach((sc) => {
      screens.push({ ...sc, platform, ctx, stepIndex: i, stepText: text });
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
export function menuRows(screen, n = 4) {
  const pool = poolFor(screen);
  // Экран и цель вместе: соседние экраны одного раздела начинают выборку с
  // разных мест и не показывают один и тот же набор.
  const h = hash(`${screen.title || screen.ctx || ''}|${screen.target}`);
  const pos = hash(screen.target) % (n + 1);

  const picks = [];
  const skip = new Set([screen.target.toLowerCase(), String(screen.title || '').toLowerCase()]);
  for (let i = 0; i < pool.length && picks.length < n; i += 1) {
    const item = pool[(h + i) % pool.length];
    // Соседом не может быть сама цель, сам экран или уже добавленный пункт.
    if (skip.has(item.en.toLowerCase()) || picks.includes(item)) continue;
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
