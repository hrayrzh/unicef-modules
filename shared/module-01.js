/* ============================================================================
   UNICEF Armenia · Модуль 1 — «Ծնողական վերահսկողություն»
   ЕДИНЫЙ ИСТОЧНИК КОНТЕНТА. Все четыре концепта читают этот файл.
   Текст не дублировать в HTML концептов.

   Мини-разметка внутри строк:
     [[English|Русский]]  — название настройки: оригинал + рус. эквивалент
     **жирный**           — смысловой акцент
     {{n}}                — сноска на источник №n из MODULE_01.sources
   ============================================================================ */

const MODULE_01 = {

  meta: {
    number: 1,
    numberLabel: 'ՄՈԴՈՒԼ 1',
    title: 'Ծնողական վերահսկողություն',
    tagline: 'Քայլ առ քայլ՝ ինչպես կարգավորել ամեն սարքն ու հավելվածը, և ինչպես ապահովել անվտանգությունը՝ առանց վստահությունը կորցնելու։',
    readingMinutes: 25,
    audience: 'Ծնողներ և խնամակալներ',
    disclaimer: 'Ուսումնական մոդուլ՝ մեծահասակների համար։ Բովանդակությունը կրում է իրազեկման բնույթ և չի փոխարինում իրավական, բժշկական կամ հոգեբանական մասնագիտական խորհրդատվությանը։'
  },

  intro: {
    lead: 'Այսօր շատ ծնողներ տեխնոլոգիաների արագ զարգացման հետևանքով իրենց անօգնական են զգում և հաճախ տեղյակ չեն այն գործիքներից, որոնք կարող են օգնել երեխաների համար ստեղծել անվտանգ թվային միջավայր։',
    keyQuestion: {
      label: 'Հիմնական հարցը',
      text: 'Ինչպե՞ս հետևել երեխայի առցանց գործունեությանը և ապահովել նրա անվտանգությունը՝ առանց անձնական տարածքը խախտելու և վստահությունը կորցնելու։',
      answer: 'Հետազոտությունները հստակ պատասխան ունեն. ամենաարդյունավետը ոչ թե ամբողջական վերահսկողությունն է, այլ **ակտիվ, բայց ինքնուրույնություն խրախուսող** մոտեցումը։{{1}}'
    },
    goal: 'Մոդուլի նպատակն է համատեղել ծնողական հսկողությունը երեխայի ազատության հետ՝ պահպանելով ընտանեկան վստահության մթնոլորտը և խուսափելով ավելորդ լարվածությունից։ Մոդուլը կառուցված է երեք թեմայի շուրջ՝ ինչու է վերահսկողությունը կարևոր, ինչ գործիքներ կան ու ինչպես կարգավորել դրանք, և ինչպես պահպանել հավասարակշռությունը հսկողության ու վստահության միջև։',
    howToUse: {
      icon: '⚠',
      label: 'Ինչպես օգտվել կարգավորումների բաժնից',
      text: 'Կարգավորումների անվանումները տրված են բնագրով (անգլերեն), իսկ կողքին՝ ռուսերեն համարժեքը (օր.՝ Screen Time · «Экранное время»), որպեսզի հեշտ գտնեք դրանք ինչպես անգլերեն, այնպես էլ ռուսերեն ինտերֆեյսում։'
    }
  },

  /* ---- Три главы модуля. Задают навигацию во всех концептах ---------------- */
  chapters: [
    { id: 'why',     eyebrow: 'Մաս 1', title: 'Ինչու է վերահսկողությունը կարևոր', summary: 'Տարիքային ռիսկեր և թվային միջավայրի մարտահրավերները' },
    { id: 'tools',   eyebrow: 'Մաս 2', title: 'Գործիքներ և կարգավորումներ',       summary: 'Քայլ առ քայլ ուղեցույց 11 հարթակի համար' },
    { id: 'balance', eyebrow: 'Մաս 3', title: 'Հավասարակշռություն և փոխվստահություն', summary: 'Ինչ է ասում հետազոտությունը և ինչպես խոսել երեխայի հետ' }
  ],

  /* ---- Часть 1 ------------------------------------------------------------ */
  why: {
    stagesTitle: 'Տարիքային ռիսկեր. յուրաքանչյուր փուլ՝ իր մարտահրավերներով',
    stagesLead: 'Ճիշտ այնպես, ինչպես դաստիարակության մոտեցումը փոխվում է երեխայի աճին զուգահեռ, առցանց անվտանգության մոտեցումը նույնպես պետք է հարմարեցվի երեխայի ճանաչողական ու հուզական զարգացմանը։{{2}}',
    stages: [
      {
        id: 'early',
        ageFrom: 3, ageTo: 8,
        stage: 'Վաղ մանկություն',
        ageLabel: 'մինչև 8 տ.',
        risks: ['Տարիքին անհարիր բովանդակություն', 'Պատահական գնումներ'],
        focus: 'Փակ, ապահով միջավայր, ուղեկցվող օգտագործում՝ սահմանափակ ժամանակ, միայն ծնողի ֆիզիկական վերահսկողության տակ',
        tool: 'Միայն ծնողի կողմից ֆիլտրած բովանդակություն',
        toolShort: 'Ֆիլտրած բովանդակություն'
      },
      {
        id: 'school',
        ageFrom: 8, ageTo: 12,
        stage: 'Դպրոցական տարիք',
        ageLabel: '8–12 տ.',
        risks: ['13+ հարթակներ վաղ տարիքում', 'Անծանոթների շփում', 'In-app գնումներ'],
        focus: 'Ընտանեկան կանոններ, համատեղ կարգավորում, ծնողի անձնական վերահսկողության ներքո',
        tool: 'Family Link / Screen Time, էկրանի ժամ, բոլոր գործողությունների հաստատում, ծնողի կողմից բովանդակության վերահսկում',
        toolShort: 'Family Link / Screen Time'
      },
      {
        id: 'teen',
        ageFrom: 13, ageTo: 17,
        stage: 'Դեռահասություն',
        ageLabel: '13+ տ.',
        risks: ['Շանտաժ', 'Ցածր ինքնագնահատական', 'Ակտիվ սոցիալական ցանցեր, կախվածություն', 'Ավելորդ տվյալների տարածում'],
        focus: 'Բաց երկխոսություն, ինքնուրույնության աճ',
        tool: 'Teen Accounts, Family Pairing՝ ոչ թե վերահսկում',
        toolShort: 'Teen Accounts, Family Pairing'
      }
    ],
    challengesTitle: 'Թվային միջավայրի մարտահրավերները',
    challenges: [
      '8–12 տարեկանները ամենաարագ աճող խումբն են 13+ տարիքի համար նախատեսված հարթակներում, և հաճախ առերեսվում են ապատեղեկատվության, հավելվածներում գնումների ու անծանոթների շփման հետ՝ նախքան ընտանիքում հստակ կանոնների հաստատվելը։{{3}}',
      'Դեռահասներն ունեն ռիսկայնության այլ մակարդակ․ նրանք խոցելի են շանտաժի, անծանոթների ճնշման և սոցցանցերի հոգեբանական ազդեցության առջև։ Սա նշանակում է, որ մեխանիկական վերահսկողության փոխարեն անհրաժեշտ է այլ մոտեցում։{{4}}'
    ],
    callout: {
      icon: '⚠',
      label: 'Կանխարգելման առավելությունը',
      text: 'Նախապես պաշտպանելը շատ ավելի արդյունավետ է, քան հետևանքների դեմ պայքարելը։ Կարգավորումները տեղադրեք **նախքան** երեխային սարք տալը, ոչ թե խնդրի առաջանալուց հետո։{{5}}'
    }
  },

  /* ---- Часть 2: группы и гайды -------------------------------------------- */
  tools: {
    lead: 'Բոլոր ժամանակակից սարքերն ունեն անվճար, հզոր ծնողական վերահսկողության գործիքներ։ Ստորև՝ քայլ առ քայլ ուղեցույց ամեն համակարգի, սոցիալական ցանցի, խաղի և մեսենջերի համար։ Կարգավորման անվանումները տրված են անգլերեն (ինչպես սարքում), ռուսերեն համարժեքը՝ կողքին։',
    socialNote: 'Սոցիալական ցանցերի դեպքում հարկավոր է գիտակցել, որ հիմնական հարթակներում ընդհանրապես **արգելվում է մինչև 13 տարեկանների գրանցումը**։ Իսկ ավելի մեծ տարիքում վերահսկողությունը գործում է այն դեպքում, եթե երեխան նշել է իր իրական տարիքը։'
  },

  guideGroups: [
    { id: 'os',        letter: 'Ա', title: 'Օպերացիոն համակարգեր', short: 'Համակարգեր' },
    { id: 'social',    letter: 'Բ', title: 'Սոցիալական հավելվածներ', short: 'Սոցցանցեր' },
    { id: 'games',     letter: 'Գ', title: 'Խաղեր և կոնսոլներ',      short: 'Խաղեր' },
    { id: 'messenger', letter: 'Դ', title: 'Մեսենջերներ',            short: 'Մեսենջերներ' }
  ],

  guides: [
    {
      id: 'ios', abbr: 'iOS', group: 'os', order: 1,
      name: 'iPhone / iPad',
      platform: 'iOS',
      feature: 'Screen Time',
      featureRu: 'Экранное время',
      minutes: 8,
      ages: ['early', 'school', 'teen'],
      steps: [
        'Ձեր սարքում բացեք [[Settings › Family|Настройки › Семья]] և կարգավորեք [[Family Sharing|Семейный доступ]]՝ ավելացնելով երեխայի Apple հաշիվը (մինչև 6 անդամ)։',
        'Անցեք [[Settings › Screen Time|Настройки › Экранное время]], ընտրեք երեխայի անունը և միացրեք Screen Time։',
        'Դրեք [[Screen Time passcode|код-пароль для Экранного времени]], որը երեխան չգիտի։',
        'Բացեք [[Content & Privacy Restrictions|Контент и конфиденциальность]] և միացրեք այն։',
        '[[iTunes & App Store Purchases|Покупки в iTunes и App Store]]՝ [[Installing Apps|Установка приложений]] և [[Deleting Apps|Удаление приложений]]՝ [[Don\'t Allow|Нет]]. [[In-app Purchases|Встроенные покупки]]՝ [[Don\'t Allow|Нет]]։',
        '[[Content Restrictions|Ограничения контента]]՝ [[Web Content|Веб-содержимое]]՝ [[Limit Adult Websites|Лимит сайтов для взрослых]], դրեք տարիքային ցենզ ֆիլմերի ([[Movies|Фильмы]]), հավելվածների ([[Apps|Программы]]) ու երաժշտության ([[Music, Podcasts, News|Музыка, подкасты, новости]]) համար։',
        'Միացրեք [[Ask to Buy|Попросить купить]]՝ [[Settings › Family › [երեխա] › Ask To Buy|Настройки › Семья › [ребёнок] › Попросить купить]]՝ գնումները հաստատման ենթարկելու համար։',
        'Միացրեք [[Communication Safety|Безопасность общения]]՝ մերկ պատկերների ավտոմատ հայտնաբերման համար։',
        'Կարգավորեք [[Downtime|В покое]] և [[App Limits|Лимиты приложений]]՝ ժամային սահմանների համար։'
      ],
      sources: [6, 7]
    },
    {
      id: 'macos', abbr: 'mac', group: 'os', order: 2,
      name: 'Mac',
      platform: 'macOS',
      feature: 'Screen Time',
      featureRu: 'Экранное время',
      minutes: 5,
      ages: ['school', 'teen'],
      steps: [
        'Համոզվեք, որ երեխան ունի առանձին օգտատիրոջ հաշիվ և ընդգրկված է նույն [[Family Sharing|Семейный доступ]] խմբում։',
        'Բացեք [[System Settings › Screen Time|Системные настройки › Экранное время]], ընտրեք երեխայի հաշիվը։',
        'Միացրեք [[Content & Privacy|Контент и конфиденциальность]] և կիրառեք նույն սահմանափակումները, ինչ iOS-ում՝ վեբ-բովանդակություն, գնումներ, տարիքային ցենզ։',
        'Դրեք [[Screen Time passcode|код-пароль Экранного времени]] և կարգավորեք Downtime / App Limits։'
      ],
      note: 'macOS-ի և iOS-ի Screen Time-ը համաժամանակեցվում է նույն Apple հաշվի ներքո։',
      sources: [8]
    },
    {
      id: 'android', abbr: 'And', group: 'os', order: 3,
      name: 'Android',
      platform: 'Android',
      feature: 'Google Family Link',
      featureRu: 'Родительский контроль Family Link',
      minutes: 7,
      ages: ['early', 'school', 'teen'],
      steps: [
        'Ձեր հեռախոսին տեղադրեք Google Family Link հավելվածը (App Store / Google Play)։',
        'Բացեք հավելվածն ու ստեղծեք ընտանեկան խումբ. ավելացրեք երեխայի Google հաշիվը կամ ստեղծեք նորը ([[Supervise account|Контролировать аккаунт]])։',
        'Երեխայի սարքում՝ [[Settings › Google › Parental controls|Настройки › Google › Родительский контроль]], կապեք հաշիվը՝ մուտքագրելով ձեր էլ. փոստն ու գաղտնաբառը։',
        'Family Link-ում կարգավորեք՝ [[App access|Доступ к приложениям]]՝ նոր հավելվածների հաստատում, [[Screen time / Daily limit|Время использования / Дневной лимит]], [[Bedtime|Время сна]]։',
        'Միացրեք [[Content filters|Фильтры контента]]՝ Google Search-ի, Chrome-ի և YouTube-ի համար։',
        'Միացրեք գնումների հաստատումը Google Play-ում ([[Purchase approvals|Подтверждение покупок]])։'
      ],
      note: 'Android 16-ից (2025 դեկ.) կան նաև ներկառուցված ծնողական վերահսկողություններ. երեխայի սարքում՝ Settings › Parental controls, PIN-ով պաշտպանված, ներառյալ վեբ-կայքերի բովանդակության ֆիլտրերը։',
      sources: [9, 10, 11]
    },
    {
      id: 'windows', abbr: 'Win', group: 'os', order: 4,
      name: 'Windows 11',
      platform: 'Windows',
      feature: 'Microsoft Family Safety',
      featureRu: 'Семейная безопасность Microsoft',
      minutes: 7,
      ages: ['school', 'teen'],
      steps: [
        'Ստեղծեք երեխայի համար [[Microsoft account|учётная запись Microsoft]] և ավելացրեք ընտանեկան խմբին՝ [[Settings › Accounts › Family|Параметры › Учётные записи › Семья]]։',
        'Երեխայի համակարգչում նա պետք է մուտք գործի **իր Microsoft հաշվով**, ոչ թե տեղական (local) հաշվով, այլապես վերահսկողությունը չի աշխատի։',
        'Բացեք family.microsoft.com կամ Family Safety հավելվածը և ընտրեք երեխայի հաշիվը։',
        '[[Screen time|Время использования]]՝ միացրեք սահմանները սարքերի ու հավելվածների համար։',
        '[[Content filters|Фильтры контента]]՝ Microsoft Edge-ում միացրեք վեբ-ֆիլտրումը ըստ կատեգորիայի, արգելեք մեծահասակների կայքերը։',
        '[[Spending|Расходы]]՝ միացրեք [[Require approval for purchases|Запрашивать подтверждение покупок]]։'
      ],
      note: 'Նույն կարգավորումներն ինքնաշխատ տարածվում են Xbox-ի վրա, երբ երեխան մտնում է նույն հաշվով։',
      sources: [12, 13]
    },
    {
      id: 'youtube', abbr: 'YT', group: 'social', order: 5,
      name: 'YouTube',
      platform: 'YouTube',
      feature: 'YouTube Kids / Supervised / Restricted Mode',
      featureRu: 'YouTube Детям / Безопасный режим',
      minutes: 5,
      ages: ['early', 'school', 'teen'],
      steps: [
        'Մինչև 8 տ.՝ օգտագործեք [[YouTube Kids|YouTube Детям]]՝ առանձին հավելված. ընտրեք տարիքային կատեգորիան ստեղծելիս։',
        '8 տ.-ից բարձր՝ Family Link-ով ստեղծեք [[Supervised account|Аккаунт с родительским контролем]]՝ Family Link › [երեխա] › Controls › YouTube՝ ընտրեք բովանդակության մակարդակը։',
        'Հիմնական YouTube-ում միացրեք [[Restricted Mode|Безопасный режим]]՝ Profile › Settings › General › Restricted Mode › On։',
        'Պարբերաբար ստուգեք [[Watch history|История просмотра]]՝ տեսնելու, թե իրականում ինչ է դիտվում։'
      ],
      note: 'YouTube Kids-ը Հայաստանում այս պահին դեռ չի գործում, սակայն իրավիճակը կարող է փոխվել։ Ցանկալի է, որ մինչև 12 տարեկանը դուք վերահսկեք ողջ բովանդակությունը։',
      sources: [10]
    },
    {
      id: 'instagram', abbr: 'IG', group: 'social', order: 6,
      name: 'Instagram',
      platform: 'Instagram',
      feature: 'Teen Accounts / Family Center',
      featureRu: 'Подростковые аккаунты / Семейный центр',
      minutes: 6,
      ages: ['teen'],
      steps: [
        '13–17 տ. հաշիվներն ինքնըստինքյան դառնում են [[Teen Account|Подростковый аккаунт]]՝ ամենախիստ կարգավորմամբ (մասնավոր ռեժիմ, բովանդակության ֆիլտր). մինչև 16 տ.-ի համար փոփոխությունները պահանջում են ծնողի համաձայնություն։',
        'Թարմացրեք Instagram հավելվածը և՛ ձեր, և՛ երեխայի սարքում (պետք է ունենաք Instagram հաշիվ)։',
        'Բացեք [[Family Center|Семейный центр]]՝ Profile › ☰ menu › Family Center։',
        'Ուղարկեք հրավեր երեխային (կամ նա՝ ձեզ). երկու կողմն էլ պետք է հաստատեն կապը։',
        'Կարգավորեք [[daily time limit|дневной лимит времени]], տեսեք, թե ով կարող է գրել երեխային, և ստացեք ծանուցում, երբ նա բողոքարկում է բովանդակություն։'
      ],
      note: 'Հսկողությունը երեխան պետք է հաստատի և կարող է հանել. հենց դրա համար է կարևոր բաց զրույցը։',
      sources: [15]
    },
    {
      id: 'tiktok', abbr: 'TT', group: 'social', order: 7,
      name: 'TikTok',
      platform: 'TikTok',
      feature: 'Family Pairing',
      featureRu: 'Семейный режим',
      minutes: 5,
      ages: ['teen'],
      steps: [
        'Ձեր TikTok հաշվում բացեք [[Profile › ☰ › Settings and privacy|Профиль › Настройки и конфиденциальность]]։',
        'Ընտրեք [[Family Pairing|Семейный режим]], սեղմեք Continue և ընտրեք «Parent» դերը՝ ստանալով QR կոդ։',
        'Երեխայի սարքում բացեք նույն Family Pairing բաժինը, ընտրեք «Teen» և սկանավորեք QR կոդը՝ կապը հաստատելու համար։',
        'Կարգավորեք՝ [[Screen Time|Время использования]], [[Restricted Mode|Ограниченный режим]], ով կարող է գրել, և [[Time Away|Перерыв]]՝ դպրոցի ժամերին հասանելիությունն արգելելու համար։'
      ],
      sources: [14]
    },
    {
      id: 'snapchat', abbr: 'SC', group: 'social', order: 8,
      name: 'Snapchat',
      platform: 'Snapchat',
      feature: 'Family Center',
      featureRu: 'Семейный центр',
      minutes: 6,
      ages: ['teen'],
      steps: [
        'Ձեր հեռախոսին տեղադրեք Snapchat-ը և մտեք ձեր հաշիվ (և՛ դուք, և՛ երեխան պետք է ունենաք հաշիվ)։',
        'Պրոֆիլից սեղմեք [[Add Friends|Добавить друзей]]՝ ավելացնելով երեխային օգտանունով։',
        'Բացեք [[Settings › Privacy Controls › Family Center|Настройки › Конфиденциальность › Семейный центр]]։',
        'Ընտրեք երեխայի անունը › [[Send Invitation|Отправить приглашение]]։ Երեխան իր սարքում սեղմում է View Invitation › [[Accept|Принять]]։',
        'Կտեսնեք ընկերների ցանկը, վերջին 7 օրվա շփումները (առանց բովանդակության), նոր ընկերներն ու օրական միջին ժամանակը։',
        '[[Content Controls|Контроль контента]]՝ սահմանափակեք բովանդակությունը Stories-ում և Spotlight-ում։',
        'Անջատեք My AI-ը և միացրեք [[Snap Map › Ghost Mode|Snap Map › Режим невидимки]]՝ երեխայի գեոլոկացիան մյուս օգտատերերից թաքցնելու համար։'
      ],
      sources: []
    },
    {
      id: 'roblox', abbr: 'RB', group: 'games', order: 9,
      name: 'Roblox',
      platform: 'Roblox',
      feature: 'Parental Controls',
      featureRu: 'Родительский контроль',
      minutes: 5,
      ages: ['early', 'school', 'teen'],
      steps: [
        'Հաշիվ ստեղծելիս մուտքագրեք երեխայի **ճիշտ ծննդյան ամսաթիվը**. մինչև 13 տ. հաշիվներն ինքնաշխատ ստանում են ավելի խիստ սահմանափակումներ։',
        'Որպես հաշվի էլ. փոստ նշեք **ծնողի** էլ. փոստը և դրեք [[Parent PIN|родительский PIN-код]]՝ Settings › Parental Controls։',
        'Միացրեք [[Content Maturity / Allowed Experiences|Ограничение по возрасту контента]]՝ ըստ երեխայի տարիքի։',
        'Կարգավորեք [[Communication / Chat|Общение / Чат]]՝ սահմանափակեք կամ անջատեք չատը անծանոթների հետ։',
        'Ժամային սահմանի համար օգտագործեք սարքի մակարդակի գործիքը (Screen Time / Family Link), քանի որ Roblox-ն ինքը ժամային սահման չունի։'
      ],
      sources: [16]
    },
    {
      id: 'ps5', abbr: 'PS', group: 'games', order: 10,
      name: 'PlayStation 5',
      platform: 'PlayStation',
      feature: 'Family and Parental Controls',
      featureRu: 'Семья и родительский контроль',
      minutes: 8,
      ages: ['school', 'teen'],
      steps: [
        'Ստեղծեք ձեր՝ որպես [[Family Manager|Управляющий семьёй]] հաշիվը, ապա ավելացրեք երեխային՝ կոնսոլում [[Settings › Family and Parental Controls › Family Management|Настройки › Семья и родительский контроль › Управление семьёй]] կամ playstation.com/acct/family-ից։',
        'Մուտքագրեք երեխայի ճիշտ ծննդյան ամսաթիվը՝ տարիքին համապատասխան լռելյայն սահմանափակումների համար։',
        '[[Playtime Settings|Настройки игрового времени]]՝ միացրեք Restrict Playtime՝ ժամային սահման դնելու համար (PlayStation Family հավելվածով կարող եք կառավարել հեռակա)։',
        '[[Age Level for Games / Apps|Возрастной уровень для игр]]՝ դրեք բովանդակության տարիքային ցենզ։',
        '[[Communication & User-Generated Content|Общение и пользовательский контент]]՝ սահմանափակեք չատն ու անծանոթների հետ շփումը (օր.՝ Solo and Focused)։',
        '[[Monthly Spending Limit|Месячный лимит расходов]]՝ դրեք 0 կամ ցանկալի սահման. դրամը վերցվում է Family Manager-ի դրամապանակից։',
        'Դրեք [[System Restrictions passcode|PIN ограничений системы]] և փոխեք լռելյայն 0000-ը, անջատեք նոր օգտատերերի ստեղծումն ու հյուրի մուտքը։'
      ],
      sources: [17]
    },
    {
      id: 'xbox', abbr: 'XB', group: 'games', order: 11,
      name: 'Xbox Series X|S',
      platform: 'Xbox',
      feature: 'Family Settings',
      featureRu: 'Семейные настройки',
      minutes: 7,
      ages: ['school', 'teen'],
      steps: [
        'Տեղադրեք Xbox Family Settings հավելվածը (iOS / Android) կամ կոնսոլում անցեք [[Settings › Account › Family|Настройки › Учётная запись › Семья]]։',
        'Ստեղծեք երեխայի համար առանձին Microsoft account և ավելացրեք ընտանեկան խմբին (դուք՝ [[Organizer|Организатор]])։',
        'Կոնսոլում միացրեք [[Online safety & family › Family settings|Безопасность в сети и семья › Семейные настройки]] և դրեք PIN։',
        '[[Content restrictions|Ограничения контента]]՝ դրեք տարիքային ցենզ խաղերի ու հավելվածների համար։',
        '[[Privacy & online safety › Xbox privacy|Конфиденциальность и безопасность в сети]]՝ սահմանափակեք չատը, multiplayer-ն ու cross-network շփումը։',
        '[[Spending / Ask a parent|Расходы / Спросить родителя]]՝ միացրեք գնումների հաստատումն ու ծախսերի ծանուցումը։',
        'Դրեք [[passkey|код доступа]]՝ կոնսոլում կարգավորումներն ու գնումները պաշտպանելու համար։'
      ],
      sources: [18]
    },
    {
      id: 'switch', abbr: 'NS', group: 'games', order: 12,
      name: 'Nintendo Switch',
      platform: 'Nintendo',
      feature: 'Parental Controls',
      featureRu: 'Родительский контроль',
      minutes: 6,
      ages: ['early', 'school', 'teen'],
      steps: [
        'Տեղադրեք Nintendo Switch Parental Controls հավելվածը (iOS / Android) ձեր հեռախոսին և կապեք կոնսոլի հետ՝ ստանալով գրանցման կոդ։',
        'Դրեք [[Parental Controls PIN|PIN-код родительского контроля]]։ **Ուշադրություն.** սահմանափակումները կիրառվում են ամբողջ կոնսոլի վրա, ոչ թե առանձին օգտատիրոջ, ուստի դրեք ամենափոքր երեխայի տարիքով։',
        'Հավելվածում դրեք [[Restriction Level / age|Уровень ограничений / возраст]]՝ խաղերի տարիքային ցենզի համար։',
        'Կարգավորեք [[Play-time limit|Ограничение игрового времени]] և [[Bedtime Alarm|Будильник ко сну]]։',
        'Կոնսոլում՝ [[System Settings › Parental Controls|Настройки консоли › Родительский контроль]]. eShop-ի և գնումների սահմանափակումը կարգավորեք Nintendo հաշվի ընտանեկան խմբից։'
      ],
      sources: [19]
    },
    {
      id: 'discord', abbr: 'DC', group: 'messenger', order: 13,
      name: 'Discord',
      platform: 'Discord',
      feature: 'Family Center',
      featureRu: 'Семейный центр',
      minutes: 6,
      ages: ['teen'],
      steps: [
        'Տեղադրեք Discord հավելվածը ձեր հեռախոսին (կապը հաստատելու համար անհրաժեշտ է հեռախոս՝ QR կոդ սկանավորելու համար)։',
        'Բացեք [[User Settings › Family Center|Настройки пользователя › Семейный центр]]։',
        'Սեղմեք [[Connect with Teen|Связаться с подростком]] և սկանավորեք երեխայի սարքում Family Center-ից ստեղծված QR կոդը. երեխան պետք է հաստատի։',
        'Կապից հետո կտեսնեք գործունեության ամփոփումը՝ ընկերներ, սերվերներ, ում հետ է շփվում (հաղորդագրությունների բովանդակությունը չի երևում)։',
        'Երեխայի հաշվում միացրեք [[Privacy & Safety|Конфиденциальность и безопасность]]՝ ընտրեք բովանդակության ֆիլտրը ([[Keep Me Safe|Сканировать весь контент]])։',
        '[[Message Requests / DM spam filter|Запросы сообщений / Фильтр спама в личных сообщениях]]՝ միացրեք «Filter from non-friends»՝ անծանոթներից հաղորդագրությունները զտելու համար։',
        '[[Friend Requests|Запросы в друзья]]՝ ընտրեք Friends of Friends կամ No One՝ անծանոթներից հարցումներն արգելելու համար։'
      ],
      sources: [20, 21]
    }
  ],

  /* ---- Сквозной чеклист --------------------------------------------------- */
  checklist: {
    letter: 'Ե',
    title: 'Գործնական քայլաշար',
    subtitle: 'Սարքավորումների ընդհանուր հաջորդականություն',
    items: [
      { short: 'Ընտանեկան խումբ', text: 'Ստեղծեք ընտանեկան խումբ. Family Sharing (Apple) / Family Link (Google) / Microsoft Family՝ ձեր և երեխայի հաշիվներով։', sources: [5] },
      { short: 'Ծնողական PIN', text: 'Դրեք ծնողական գաղտնակոդ/PIN, որը երեխան չգիտի՝ ամեն համակարգում և կոնսոլում։', sources: [6] },
      { short: 'Բովանդակության ֆիլտրեր', text: 'Միացրեք բովանդակության ֆիլտրերն ու տարիքային ցենզը (Safari / Chrome / Edge, App Store / Play, խաղեր)։', sources: [6] },
      { short: 'Գնումների հաստատում', text: 'Միացրեք գնումների հաստատումը (Ask to Buy / Family Link / Microsoft Store / PlayStation / Xbox)։', sources: [11] },
      { short: 'Էկրանի ժամ և քնի ռեժիմ', text: 'Սահմանեք էկրանի ժամ և քնի ռեժիմ՝ ճկուն աշխատանքային և հանգստյան օրերի համար։', sources: [12] },
      { short: 'Հավելվածների ներքին պաշտպանություն', text: 'Կարգավորեք ամեն հավելվածի ու կոնսոլի ներքին պաշտպանությունը (TikTok, Instagram, Snapchat, YouTube, Roblox, PlayStation, Xbox, Discord)։', sources: [14] },
      { short: 'Պարբերական վերանայում', text: 'Ստուգեք պարբերաբար. կարգավորումներն աշխատում են միայն, երբ բոլորը միացված են և թարմացվում են։ Վերանայեք դրանք տարին մեկ-երկու անգամ՝ երեխայի աճին զուգահեռ։', sources: [1] }
    ]
  },

  /* ---- Часть 3 ------------------------------------------------------------ */
  balance: {
    researchTitle: 'Հսկողություն և վստահություն. ինչ է ասում հետազոտությունը',
    research: [
      'Գործիքները կարևոր են, բայց դրանք **միջոց են, ոչ թե նպատակ**։ Հետազոտությունները ցույց են տալիս, որ ինքնուրույնություն խրախուսող, ակտիվ վերահսկողությունը (կանոններ + բաց երկխոսություն + աստիճանական ազատություն) ավելի դրական արդյունք է տալիս, քան վերահսկող, սահմանափակող մոտեցումը, որը կապված է մեդիայի խնդրահարույց օգտագործման ու դեռահասի ավելի խնդրահարույց վարքի հետ։{{1}}',
      'Չափից շատ վերահսկող ու ճնշող մեթոդները երեխաների կողմից ընկալվում են ծայրահեղ բացասական և կարող են վնասել ընտանեկան հարաբերություններն ու վստահությունը՝ խաթարելով հենց պաշտպանական նպատակը։{{4}}'
    ],

    scriptsTitle: 'Կանոնների շուրջ պայմանավորվել. ինչ ասել և ինչ չասել',
    scriptsDo: [
      { text: '«Այս կանոնները քեզ պաշտպանելու համար են, ոչ թե քեզ վերահսկելու. արի միասին որոշենք»։', why: 'Կանոնը դարձնում է ընդհանուր որոշում, ոչ թե պարտադրանք։' },
      { text: '«Ի՞նչ խաղ ես հիմա ամենաշատը խաղում. ցույց տուր»։', why: 'Հանգիստ, անկեղծ հետաքրքրություն՝ առանց ստուգման ենթատեքստի։' },
      { text: '«Երբ մեծանաս և ցույց տաս, որ կարող ես ինքնուրույն կառավարել, սահմանափակումները կթուլացնենք»։', why: 'Ազատությունը դառնում է հասանելի նպատակ, ոչ թե պայքարի առարկա։' },
      { text: '«Եթե առցանց տհաճ բանի հանդիպես, ինձ կարող ես ասել առանց պատժի վախի»։', why: 'Ամենակարևոր նախադասությունը. այն բացում է ճանապարհը դեպի ձեզ։' }
    ],
    scriptsDont: [
      { text: '«Ես ամեն ինչ կտեսնեմ, ինչ անում ես հեռախոսում»։', why: 'Ընկալվում է որպես սպառնալիք և մղում է թաքցնելու։' },
      { text: '«Որովհետև ես այդպես եմ ասում»։', why: 'Առանց բացատրության կանոնը չի սովորեցնում ոչինչ։' },
      { text: '«Քեզ չեմ վստահում, դրա համար եմ ստուգում»։', why: 'Ուղղակիորեն վնասում է հարաբերությունը՝ առանց անվտանգություն ավելացնելու։' }
    ],
    scriptsNote: 'Կանոնները լավագույնս աշխատում են, երբ երեխան մասնակցում է դրանց ձևակերպմանը. ընդգրկվածությունը մեծացնում է կանոնը պահպանելու հավանականությունը։{{1}}',

    boundariesTitle: 'Թվային սահմաններ՝ առանց վեճերի',
    boundariesLead: 'Գրավոր «մեդիա-համաձայնագիրը» օգնում է կանոնները դարձնել ընդհանուր որոշում, ոչ թե պարտադրանք. էկրանի ժամ, քնելուց առաջ սարք չօգտագործելու կանոն, ինչը կարելի է կիսվել և ինչը՝ ոչ։ Վերանայեք այն պարբերաբար՝ երեխայի աճին համապատասխան։{{22}}',
    principles: [
      { title: 'Կանոնավոր ստուգում, ոչ թե հարցաքննություն', text: '«Ի՞նչ հետաքրքիր բան տեսար այս շաբաթ» ձևաչափը պահպանում է բաց հաղորդակցությունը։{{23}}' },
      { title: 'Դրական արձագանք', text: 'Նկատեք և գնահատեք, թե ինչ է երեխան լավ անում առցանց, ոչ միայն սխալները։{{1}}' },
      { title: 'Թափանցիկություն', text: 'Երեխան պետք է իմանա, ինչ եք վերահսկում և ինչու. թաքնված հսկողությունը, երբ բացահայտվում է, կործանում է վստահությունը։{{4}}' }
    ],

    freedomTitle: 'Ազատության աստիճանական ընդլայնում',
    freedom: 'Սահմանափակումները չպետք է հանվեն միանգամից, այլ աստիճանաբար՝ երեխայի հասունացմանը զուգահեռ։ Ավելի մեծ դեռահասներին պետք է հնարավորություն տալ ավելի շատ ինքնուրույնություն դրսևորելու առցանց տիրույթում՝ պահպանելով հիմնական լռելյայն պաշտպանությունները։{{4}} Կիրառելի և ընդունելի մեդիա-պլանը շարունակ զարգացրեք՝ ավելի մեծ ինքնուրույնության հաշվառմամբ. սա ամրապնդում է վստահությունն ու բաց հաղորդակցությունը։{{1}}',

    goldenRule: {
      icon: '🔑',
      label: 'Ոսկե կանոնը',
      text: 'Տեխնոլոգիան միշտ ավելի արագ է զարգանում, քան ցանկացած վերահսկողության համակարգ։ Երեխան, ով հասկանում է կանոնների պատճառը, ավելի լավ է պաշտպանված, քան նա, ում սարքը պարզապես կողպված է. **զրույցն ավելի կարևոր է, քան կարգավորումը**։{{5}}',
      extra: 'Կարևոր է նաև, որ մեծահասակն ինքը հետաքրքրվի նորարարություններով և տեղյակ լինի, թե ինչ հարթակներով ու հավելվածներով է հետաքրքրված երեխան։'
    }
  },

  /* ---- Экстренная помощь -------------------------------------------------- */
  emergency: {
    eyebrow: 'ՇՏԱՊ ՕԳՆՈՒԹՅՈՒՆ',
    title: 'Որտեղ դիմել',
    lead: 'Հիշեք՝ ոչ մի երեխա չպետք է միայնակ մնա առցանց վտանգերի ենթարկվելիս։',
    contacts: [
      {
        name: 'CyberChat',
        forWhom: 'երեխաների համար',
        contact: 'chat.cyberhub.am',
        phone: '055 228811',
        url: 'https://chat.cyberhub.am',
        text: 'Տեխնիկական, իրավական և հոգեբանական աջակցություն, 24/7 անանուն չատ։',
        urgent: true,
        sources: [25]
      },
      {
        name: 'Ոստիկանություն 102',
        forWhom: 'արտակարգ դեպքեր',
        contact: '102',
        phone: '102',
        url: 'https://www.police.am/hotline',
        text: 'Հաղորդման ներկայացում առցանց հանցագործությունների վերաբերյալ։',
        urgent: true,
        sources: [29]
      },
      {
        name: 'Internet Matters',
        forWhom: 'քայլ առ քայլ ուղեցույցներ',
        contact: 'internetmatters.org/parental-controls',
        url: 'https://www.internetmatters.org/parental-controls/',
        text: 'Անվճար, թարմացվող ուղեցույցներ բոլոր սարքերի ու հավելվածների համար։',
        urgent: false,
        sources: [5]
      }
    ]
  },

  /* ---- Дополнительные материалы ------------------------------------------- */
  reading: {
    eyebrow: 'ԼՐԱՑՈՒՑԻՉ ԸՆԹԵՐՑԱՆՈՒԹՅՈՒՆ',
    title: 'Օգտակար նյութեր՝ հայերեն և ռուսերեն',
    groups: [
      {
        lang: 'Հայերեն',
        items: [
          { title: 'UNICEF Հայաստան — «Երեխաները և թվային աշխարհը»', text: 'Ծնողահեն հանգույց՝ բաց երկխոսության, սահմանների և առցանց անվտանգության շուրջ։', url: 'https://www.unicef.org/armenia/երեխաները-և-թվային-աշխարհը', label: 'unicef.org/armenia' },
          { title: 'CyberChat / CyberHUB-AM', text: 'Հայաստանյան հարթակ՝ տեխնիկական, իրավական և հոգեբանական աջակցությամբ։', url: 'https://chat.cyberhub.am', label: 'chat.cyberhub.am' }
        ]
      },
      {
        lang: 'Русский',
        items: [
          { title: 'ЮНИСЕФ (ECA) — «Защита детей в интернете»', text: 'О балансе доверия и контроля, рисках и онлайн-безопасности.', url: 'https://www.unicef.org/eca/ru/защита-детей-в-интернете', label: 'unicef.org/eca/ru' },
          { title: 'Kaspersky — «Руководство по родительскому контролю»', text: 'Пошаговая настройка для iPhone, Android, Windows и YouTube.', url: 'https://www.kaspersky.ru/resource-center/preemptive-safety/family-guide-to-parental-controls', label: 'kaspersky.ru' },
          { title: 'Линия помощи «Дети онлайн» / Фонд Развития Интернет', text: 'Материалы для родителей (телефон 8-800-25-000-15 — только для России).', url: 'https://www.detionline.com', label: 'detionline.com' }
        ]
      }
    ],
    note: {
      icon: '⚠',
      label: 'Նշում Հայաստանի համար',
      text: 'Ռուսալեզու «Дети онлайн» թեժ գիծը ՌԴ-ի համար է. նյութերը կարդալ կարելի է ցանկացած երկրից։ Հայաստանում տեղական օգնության կետերն են CyberChat-ը (chat.cyberhub.am · 055 228811) և ոստիկանությունը (102)։'
    },
    media: [
      { icon: '🎧', type: 'Փոդքաստ', title: 'ԿիբեռՉատի փոդքաստ. Երեխաները կիբեռհարձակումների թիրախում', author: 'Սամվել Մարտիրոսյան, Հայկ Մկրտչյան', cta: 'Դիտել փոդքաստը', url: 'https://www.youtube.com/watch?v=N5jyTij3d5E&list=PLFA9PMsS4npfe8rxtfwm-18RR0M2OhEuy&index=2' },
      { icon: '📚', type: 'Բլոգ', title: 'Ծնողական վերահսկման հավելվածների բացասական կողմը․ առողջ սահմաններ', author: 'CyberHUB-AM', cta: 'Կարդալ բլոգը', url: 'https://cyberhub.am/hy/blog/2026/02/19/psy3/' }
    ]
  },

  /* ---- Источники ---------------------------------------------------------- */
  sourcesTitle: 'Աղբյուրներ և հղումներ',
  sourcesLead: 'Մոդուլի յուրաքանչյուր հիմնական պնդում և կարգավորման քայլ հիմնված է ստորև բերված աղբյուրների վրա։',
  sources: [
    { n: 1,  org: 'American Academy of Pediatrics (AAP)', title: 'Balancing Online Safety and Independence: Parental Monitoring by Age', url: 'https://www.aap.org/en/patient-care/media-and-children/center-of-excellence-on-social-media-and-youth-mental-health/qa-portal/qa-portal-library/qa-portal-library-questions/balancing-online-safety-and-independence-parental-monitoring-by-age/', label: 'aap.org' },
    { n: 2,  org: 'Our Rescue', title: 'Why Age-Appropriate Online Safety Conversations Matter', url: 'https://ourrescue.org/resources/child-exploitation/online-exploitation/why-age-appropriate-online-safety-conversations-matter', label: 'ourrescue.org' },
    { n: 3,  org: 'National Parenting Authority', title: 'Child Safety at Home and Online', url: 'https://nationalparentingauthority.com/child-safety-at-home-and-online', label: 'nationalparentingauthority.com' },
    { n: 4,  org: 'NTIA (US Dept. of Commerce)', title: 'Kids Online Health and Safety report 2024', url: 'https://www.ntia.gov/sites/default/files/reports/kids-online-health-safety/2024-kohs-report.pdf', label: 'ntia.gov (PDF)' },
    { n: 5,  org: 'Internet Matters', title: 'Parental controls hub — step-by-step guides, all platforms', url: 'https://www.internetmatters.org/parental-controls/', label: 'internetmatters.org' },
    { n: 6,  org: 'Apple Support', title: 'Use parental controls on your child\'s iPhone or iPad', url: 'https://support.apple.com/en-us/105121', label: 'support.apple.com' },
    { n: 7,  org: 'Internet Matters', title: 'Apple iPhone & iPad parental controls guide', url: 'https://www.internetmatters.org/parental-controls/smartphones-and-other-devices/apple-iphone-and-ipad-parental-control-guide/', label: 'internetmatters.org' },
    { n: 8,  org: 'Apple Support', title: 'Use Screen Time on Mac, iPhone & iPad', url: 'https://support.apple.com/en-us/108806', label: 'support.apple.com' },
    { n: 9,  org: 'Internet Matters', title: 'Android smartphone parental controls (Android 16 built-in)', url: 'https://www.internetmatters.org/parental-controls/smartphones-and-other-devices/android-smartphone/', label: 'internetmatters.org' },
    { n: 10, org: 'Internet Matters', title: 'Google Family Link setup guide', url: 'https://www.internetmatters.org/parental-controls/smartphones-and-other-devices/google-family-link/', label: 'internetmatters.org' },
    { n: 11, org: 'Google', title: 'Family Link — family safety & parental control tools', url: 'https://families.google/familylink/', label: 'families.google' },
    { n: 12, org: 'Internet Matters', title: 'Windows 11 parental controls guide (Microsoft Family Safety)', url: 'https://www.internetmatters.org/parental-controls/smartphones-and-other-devices/windows-11-parental-controls/', label: 'internetmatters.org' },
    { n: 13, org: 'Microsoft', title: 'Family Safety', url: 'https://www.microsoft.com/en-us/microsoft-365/family-safety', label: 'microsoft.com' },
    { n: 14, org: 'Internet Matters', title: 'TikTok privacy & safety settings (Family Pairing)', url: 'https://www.internetmatters.org/parental-controls/social-media/tiktok-privacy-and-safety-settings/', label: 'internetmatters.org' },
    { n: 15, org: 'Meta', title: 'Family Center — Instagram Teen Accounts & supervision', url: 'https://familycenter.meta.com/our-products/instagram/', label: 'familycenter.meta.com' },
    { n: 16, org: 'Internet Matters', title: 'Roblox parental controls guide', url: 'https://www.internetmatters.org/parental-controls/gaming-consoles/roblox-parental-controls/', label: 'internetmatters.org' },
    { n: 17, org: 'Internet Matters', title: 'PlayStation 5 parental controls guide', url: 'https://www.internetmatters.org/parental-controls/gaming-consoles/playstation-5-ps5/', label: 'internetmatters.org' },
    { n: 18, org: 'Internet Matters', title: 'Xbox Series X|S parental controls guide', url: 'https://www.internetmatters.org/parental-controls/gaming-consoles/xbox-series-x-s-parental-controls/', label: 'internetmatters.org' },
    { n: 19, org: 'Nintendo Support', title: 'How to set up, adjust or remove parental controls on Nintendo Switch', url: 'https://www.nintendo.com/en-gb/Support/Parental-Controls/How-to-Set-Up-Adjust-or-Remove-Parental-Controls-on-Nintendo-Switch-1494771.html', label: 'nintendo.com' },
    { n: 20, org: 'Internet Matters', title: 'Discord app safety settings guide', url: 'https://www.internetmatters.org/parental-controls/gaming-consoles/discord-app/', label: 'internetmatters.org' },
    { n: 21, org: 'Discord Support', title: 'Family Center for Parents and Guardians', url: 'https://support.discord.com/hc/en-us/articles/14155043715735-Family-Center-for-Parents-and-Guardians', label: 'support.discord.com' },
    { n: 22, org: 'AAP · HealthyChildren.org', title: 'Family Media Plan — evolving rules, shared agreement', url: 'https://www.healthychildren.org/English/family-life/Media/Pages/helping-kids-thrive-in-a-digital-world-AAP-policy-explained.aspx', label: 'healthychildren.org' },
    { n: 23, org: 'Common Sense Education', title: 'Digital Citizenship — conversation starters, family engagement', url: 'https://www.commonsense.org/education/digital-citizenship', label: 'commonsense.org/education' },
    { n: 24, org: 'UNICEF Armenia', title: '«Երեխաները և թվային աշխարհը» — ծնողահեն հանգույց', url: 'https://www.unicef.org/armenia/երեխաները-և-թվային-աշխարհը', label: 'unicef.org/armenia' },
    { n: 25, org: 'CyberHUB-AM', title: 'CyberChat launch — Armenia\'s first online support platform for children', url: 'https://cyberhub.am/en/blog/2025/08/28/cyberchat_launch_eng/', label: 'cyberhub.am' },
    { n: 26, org: 'UNICEF (ECA, рус.)', title: '«Защита детей в интернете»', url: 'https://www.unicef.org/eca/ru/защита-детей-в-интернете', label: 'unicef.org/eca/ru' },
    { n: 27, org: 'Kaspersky (рус.)', title: 'Руководство по родительскому контролю', url: 'https://www.kaspersky.ru/resource-center/preemptive-safety/family-guide-to-parental-controls', label: 'kaspersky.ru' },
    { n: 28, org: 'Линия помощи «Дети онлайн» (рус.)', title: 'Материалы для родителей', url: 'https://www.detionline.com', label: 'detionline.com' },
    { n: 29, org: 'ՀՀ Ոստիկանություն', title: 'Թեժ գիծ / hotline', url: 'https://www.police.am/hotline', label: 'police.am' }
  ],

  /* ==========================================================================
     КВИЗ. Общий пул. Каждый концепт берёт своё подмножество:
       A — все questions (финальный тест из 8)
       B — по одному micro-вопросу после каждой секции (поле `section`)
       C — scenarios (стресс-тест)
       D — reflections (что бы вы сказали)
     ТРЕБУЕТ ВЫЧИТКИ НОСИТЕЛЕМ ЯЗЫКА (см. OQ2 в CLAUDE.md)
     ========================================================================== */
  quiz: {
    title: 'Ստուգեք ձեզ',
    intro: 'Կարճ ստուգում՝ մոդուլի հիմնական գաղափարների շուրջ։ Սխալ պատասխանը խնդիր չէ. ամեն հարցից հետո կտեսնեք բացատրությունը։',
    passScore: 6,

    questions: [
      {
        id: 'q1', section: 'why', type: 'single',
        q: 'Հետազոտությունների համաձայն՝ ո՞ր մոտեցումն է ամենաարդյունավետը երեխայի առցանց անվտանգության համար։',
        options: [
          'Ամբողջական վերահսկողություն և բոլոր հավելվածների արգելում',
          'Ակտիվ, բայց ինքնուրույնություն խրախուսող մոտեցում',
          'Լիարժեք ազատություն՝ առանց որևէ կանոնի',
          'Թաքնված հսկողություն՝ երեխայի իմացության բացակայությամբ'
        ],
        correct: [1],
        explain: 'Կանոններ + բաց երկխոսություն + աստիճանական ազատություն համադրությունն ավելի դրական արդյունք է տալիս, քան սահմանափակող վերահսկողությունը։{{1}}'
      },
      {
        id: 'q2', section: 'why', type: 'single',
        q: 'Ե՞րբ է ճիշտ տեղադրել ծնողական վերահսկողության կարգավորումները։',
        options: [
          'Երբ արդեն խնդիր է առաջացել',
          'Նախքան երեխային սարքը տալը',
          'Երբ երեխան դառնա 13 տարեկան',
          'Միայն դպրոցի ուսումնական տարվա ընթացքում'
        ],
        correct: [1],
        explain: 'Կանխարգելումը շատ ավելի արդյունավետ է, քան հետևանքների դեմ պայքարը։{{5}}'
      },
      {
        id: 'q3', section: 'why', type: 'multi',
        q: 'Ո՞ր ռիսկերն են բնորոշ 8–12 տարեկան խմբին։ Նշեք բոլոր ճիշտ տարբերակները։',
        options: [
          '13+ հարթակներում վաղ գրանցում',
          'Անծանոթների հետ շփում',
          'Հավելվածներում գնումներ (in-app)',
          'Աշխատանքային նամակագրության արտահոսք'
        ],
        correct: [0, 1, 2],
        explain: '8–12 տարեկանները ամենաարագ աճող խումբն են 13+ հարթակներում. հենց այս փուլում են կարևոր ընտանեկան հստակ կանոնները։{{3}}'
      },
      {
        id: 'q4', section: 'tools', type: 'single',
        q: 'Ի՞նչ պետք է օգտագործել Roblox-ում խաղի ժամային սահման դնելու համար։',
        options: [
          'Roblox-ի ներքին ժամաչափը',
          'Սարքի մակարդակի գործիքը՝ Screen Time կամ Family Link',
          'Երրորդ կողմի վճարովի հավելված',
          'Ժամային սահման դնել հնարավոր չէ ոչ մի կերպ'
        ],
        correct: [1],
        explain: 'Roblox-ն ինքը ժամային սահման չունի, ուստի այն դրվում է սարքի մակարդակում։{{16}}'
      },
      {
        id: 'q5', section: 'tools', type: 'single',
        q: 'Windows 11-ում Microsoft Family Safety-ն չի աշխատի, եթե...',
        options: [
          'համակարգիչը միացված է Wi-Fi-ին, ոչ թե լարային ցանցին',
          'երեխան մուտք է գործում տեղական (local) հաշվով, ոչ թե Microsoft հաշվով',
          'ծնողն ունի iPhone, ոչ թե Android',
          'համակարգչում տեղադրված չէ Microsoft Edge-ը'
        ],
        correct: [1],
        explain: 'Վերահսկողությունը կապվում է Microsoft հաշվին. տեղական հաշվի դեպքում կարգավորումները չեն կիրառվի։{{12}}'
      },
      {
        id: 'q6', section: 'tools', type: 'single',
        q: 'Ո՞րն է Nintendo Switch-ի ծնողական վերահսկողության կարևոր առանձնահատկությունը։',
        options: [
          'Սահմանափակումները կիրառվում են ամբողջ կոնսոլի վրա, ոչ թե առանձին օգտատիրոջ',
          'Սահմանափակումները գործում են միայն առցանց խաղերի համար',
          'PIN կոդ դնել հնարավոր չէ',
          'Կարգավորումները հասանելի են միայն համակարգչից'
        ],
        correct: [0],
        explain: 'Հենց դրա համար սահմանափակումները պետք է դնել ընտանիքի ամենափոքր երեխայի տարիքով։{{19}}'
      },
      {
        id: 'q7', section: 'tools', type: 'single',
        q: 'Instagram-ում 13–17 տարեկանների հաշիվների վերաբերյալ ո՞ր պնդումն է ճիշտ։',
        options: [
          'Դրանք ինքնաշխատ դառնում են Teen Account, իսկ մինչև 16 տ.-ի փոփոխությունները պահանջում են ծնողի համաձայնություն',
          'Ծնողը կարող է կարդալ երեխայի բոլոր հաղորդագրությունները',
          'Հսկողությունը միանում է առանց երեխայի իմացության',
          'Family Center-ը հասանելի է միայն վճարովի բաժանորդագրությամբ'
        ],
        correct: [0],
        explain: 'Կապը պետք է հաստատեն երկու կողմն էլ, և երեխան կարող է այն հանել՝ դրա համար է կարևոր բաց զրույցը։{{15}}'
      },
      {
        id: 'q8', section: 'balance', type: 'single',
        q: 'Ո՞ր արտահայտությունը կօգնի կանոնների շուրջ պայմանավորվելուն։',
        options: [
          '«Ես ամեն ինչ կտեսնեմ, ինչ անում ես հեռախոսում»։',
          '«Քեզ չեմ վստահում, դրա համար եմ ստուգում»։',
          '«Եթե առցանց տհաճ բանի հանդիպես, ինձ կարող ես ասել առանց պատժի վախի»։',
          '«Որովհետև ես այդպես եմ ասում»։'
        ],
        correct: [2],
        explain: 'Այս նախադասությունը բացում է ճանապարհը դեպի ձեզ. երեխան կդիմի ձեզ, երբ իսկապես անհրաժեշտ լինի։{{1}}'
      },
      {
        id: 'q9', section: 'balance', type: 'truefalse',
        q: 'Թաքնված հսկողությունը, երբ բացահայտվում է, ամրապնդում է ընտանեկան վստահությունը։',
        options: ['Ճիշտ է', 'Սխալ է'],
        correct: [1],
        explain: 'Ընդհակառակը՝ թաքնված հսկողությունը, երբ բացահայտվում է, կործանում է վստահությունը։ Երեխան պետք է իմանա, ինչ եք վերահսկում և ինչու։{{4}}'
      },
      {
        id: 'q10', section: 'balance', type: 'single',
        q: 'Ինչպե՞ս է ձևակերպվում մոդուլի «ոսկե կանոնը»։',
        options: [
          'Որքան շատ սահմանափակում, այնքան լավ',
          'Զրույցն ավելի կարևոր է, քան կարգավորումը',
          'Սարքը պետք է լինի կողպված մինչև 18 տարեկանը',
          'Կարգավորումները բավական է դնել մեկ անգամ'
        ],
        correct: [1],
        explain: 'Երեխան, ով հասկանում է կանոնների պատճառը, ավելի լավ է պաշտպանված, քան նա, ում սարքը պարզապես կողպված է։{{5}}'
      },
      {
        id: 'q11', section: 'balance', type: 'single',
        q: 'Հայաստանում երեխաների համար 24/7 անանուն աջակցության չատը ո՞րն է։',
        options: [
          'CyberChat — chat.cyberhub.am · 055 228811',
          'Դրանք գործում են միայն ՌԴ-ում',
          '«Дети онлайн» — 8-800-25-000-15',
          'Հայաստանում նման ծառայություն չկա'
        ],
        correct: [0],
        explain: 'CyberChat-ը տրամադրում է տեխնիկական, իրավական և հոգեբանական աջակցություն 24/7։ Արտակարգ դեպքերում՝ ոստիկանություն 102։{{25}}'
      },
      {
        id: 'q12', section: 'tools', type: 'single',
        q: 'Որքա՞ն հաճախ է պետք վերանայել դրված կարգավորումները։',
        options: [
          'Մեկ անգամ դնելը բավական է',
          'Տարին մեկ-երկու անգամ՝ երեխայի աճին զուգահեռ',
          'Ամեն շաբաթ',
          'Միայն սարքը փոխելիս'
        ],
        correct: [1],
        explain: 'Կարգավորումներն աշխատում են միայն, երբ դրանք միացված են և թարմացվում են երեխայի աճին համապատասխան։{{1}}'
      }
    ],

    /* Концепт C — стресс-тест: жизненные сценарии, у каждого варианта свой разбор */
    scenarios: [
      {
        id: 's1',
        situation: 'Ձեր 11-ամյա երեխան խնդրում է TikTok-ի հաշիվ, քանի որ «դասարանում բոլորն ունեն»։',
        options: [
          { text: 'Բացում եք հաշիվ՝ նշելով ավելի մեծ տարիք, որ ստացվի', score: 0, feedback: 'Կեղծ տարիքով հաշիվը զրկում է երեխային բոլոր տարիքային պաշտպանություններից՝ Teen Account-ից, բովանդակության ֆիլտրից, Family Pairing-ից։' },
          { text: 'Բացատրում եք, թե ինչու է 13-ը սահման, և առաջարկում այլընտրանք', score: 2, feedback: 'Ճիշտ քայլ։ Կանոնի պատճառը բացատրելը և այլընտրանք առաջարկելը պահպանում է և՛ անվտանգությունը, և՛ հարաբերությունը։' },
          { text: 'Ուղղակի ասում եք «ոչ» առանց բացատրության', score: 1, feedback: 'Անվտանգության տեսակետից ճիշտ է, բայց «որովհետև ես այդպես եմ ասում» ձևակերպումը ոչինչ չի սովորեցնում և մղում է թաքուն հաշիվ բացելու։' },
          { text: 'Թույլ եք տալիս, բայց թաքուն հետևում եք հաշվին', score: 0, feedback: 'Թաքնված հսկողությունը, երբ բացահայտվում է, կործանում է վստահությունը՝ առանց իրական անվտանգություն ավելացնելու։' }
        ]
      },
      {
        id: 's2',
        situation: 'Երեխայի PlayStation-ի հաշվից ամսվա ընթացքում գնվել է զգալի գումարի ներխաղային բովանդակություն։',
        options: [
          { text: 'Դնում եք Monthly Spending Limit և միացնում գնումների հաստատումը', score: 2, feedback: 'Ճիշտ է։ PS5-ում դրամը վերցվում է Family Manager-ի դրամապանակից, ուստի ամսական սահմանն ու հաստատումը լուծում են խնդիրը արմատից։' },
          { text: 'Հեռացնում եք քարտը կոնսոլից և թողնում այդպես', score: 1, feedback: 'Ժամանակավոր լուծում է։ Համակարգային քայլը՝ Monthly Spending Limit + System Restrictions passcode։' },
          { text: 'Արգելում եք խաղալ մեկ ամիս', score: 0, feedback: 'Պատիժը չի վերացնում պատճառը. հաջորդ ամիս նույն իրավիճակը կկրկնվի, եթե սահմանը դրված չլինի։' },
          { text: 'Ոչինչ չեք անում՝ մտածելով, որ մեկ անգամ էր', score: 0, feedback: 'Առանց սահմանի իրավիճակը կրկնվում է։ Կանխարգելումը շատ ավելի արդյունավետ է, քան հետևանքների դեմ պայքարը։' }
        ]
      },
      {
        id: 's3',
        situation: '14-ամյա դեռահասը հրաժարվում է ընդունել Instagram Family Center-ի հրավերը։',
        options: [
          { text: 'Խոսում եք՝ բացատրելով, թե կոնկրետ ինչ եք տեսնելու և ինչ՝ ոչ', score: 2, feedback: 'Ճիշտ։ Family Center-ը չի ցույց տալիս հաղորդագրությունների բովանդակությունը. թափանցիկությունը հաճախ վերացնում է դիմադրությունը։' },
          { text: 'Սպառնում եք վերցնել հեռախոսը', score: 0, feedback: 'Ճնշող մեթոդները դեռահասների կողմից ընկալվում են ծայրահեղ բացասական և վնասում են հարաբերությունը։' },
          { text: 'Հրաժարվում եք գաղափարից և ոչինչ չեք անում', score: 1, feedback: 'Հսկողությունն իսկապես կամավոր է, բայց մնում են սարքի մակարդակի պաշտպանությունները և, ամենակարևորը, զրույցի շարունակությունը։' },
          { text: 'Ստեղծում եք կեղծ հաշիվ և հետևում եք նրան', score: 0, feedback: 'Դա թաքնված հսկողություն է. բացահայտվելու դեպքում այն կկործանի վստահությունը երկար ժամանակով։' }
        ]
      },
      {
        id: 's4',
        situation: 'Երեխան պատմում է, որ Roblox-ում անծանոթը խնդրել է իր լուսանկարը։',
        options: [
          { text: 'Շնորհակալություն եք հայտնում, որ ասաց, ապա միասին բլոկավորում եք և սեղմում ֆիլտրերը', score: 2, feedback: 'Ճիշտ։ Առաջին արձագանքը որոշում է՝ երեխան հաջորդ անգամ կասի՞, թե ոչ։ Ապա՝ Communication / Chat սահմանափակում և բողոք հարթակին։' },
          { text: 'Բարկանում եք և արգելում Roblox-ը', score: 0, feedback: 'Պատժի վախը հենց այն է, ինչը երեխաներին ստիպում է հաջորդ անգամ լռել։ Խնդիրը չի վերանում՝ այն դառնում է անտեսանելի։' },
          { text: 'Ասում եք «ուշադրություն մի դարձրու» և անցնում առաջ', score: 0, feedback: 'Անծանոթի կողմից լուսանկար խնդրելը լուրջ ազդանշան է. այն պահանջում է կոնկրետ գործողություն, ոչ թե անտեսում։' },
          { text: 'Դիմում եք CyberChat-ին խորհրդատվության համար', score: 1, feedback: 'Օգտակար քայլ է, հատկապես եթե իրավիճակը շարունակվում է։ Բայց առաջինը՝ երեխային շնորհակալություն և բլոկավորում։' }
        ]
      },
      {
        id: 's5',
        situation: 'Գիշերվա ժամը 1-ն է, երեխան դեռ հեռախոսին է, թեև Downtime-ը դրված է։',
        options: [
          { text: 'Ստուգում եք, արդյոք Screen Time passcode-ը հայտնի չէ երեխային', score: 2, feedback: 'Ճիշտ առաջին քայլը։ Կարգավորումներն աշխատում են միայն, երբ ծնողական կոդը երեխան չգիտի և բոլոր սարքերն ընդգրկված են։' },
          { text: 'Վերցնում եք հեռախոսը և գնում քնելու', score: 1, feedback: 'Լուծում է այս գիշերը, բայց ոչ պատճառը. վաղը նույն բանը կկրկնվի, եթե սահմանափակումը շրջանցելի է։' },
          { text: 'Որոշում եք, որ Downtime-ը չի աշխատում, և անջատում եք այն', score: 0, feedback: 'Հակառակ արդյունքը։ Ավելի հավանական է, որ կոդը հայտնի է կամ սարքը ընտանեկան խմբում չէ։' },
          { text: 'Միասին վերանայում եք քնի ժամի կանոնը որպես ընդհանուր որոշում', score: 2, feedback: 'Ուժեղ քայլ։ Երեխայի մասնակցությունը կանոնի ձևակերպմանը մեծացնում է դրա պահպանման հավանականությունը։' }
        ]
      }
    ],

    /* Концепт D — рефлексия: выбираешь реплику, получаешь разбор */
    reflections: [
      {
        id: 'r1',
        situation: 'Երեխան առաջին անգամ ստանում է սեփական հեռախոսը։ Դուք արդեն դրել եք կարգավորումները։ Ի՞նչ եք ասում։',
        options: [
          { text: '«Ես ամեն ինչ կտեսնեմ, ինչ անում ես հեռախոսում»։', good: false, why: 'Ընկալվում է որպես սպառնալիք։ Առաջին արձագանքը սովորաբար լինում է ոչ թե զգուշավորություն, այլ թաքցնելու ցանկություն։' },
          { text: '«Այս կանոնները քեզ պաշտպանելու համար են, ոչ թե քեզ վերահսկելու. արի միասին որոշենք»։', good: true, why: 'Կանոնը դառնում է ընդհանուր որոշում։ Ընդգրկվածությունը մեծացնում է կանոնը պահպանելու հավանականությունը։' }
        ]
      },
      {
        id: 'r2',
        situation: 'Ուզում եք հասկանալ, ինչով է երեխան զբաղված առցանց։ Ի՞նչ եք հարցնում։',
        options: [
          { text: '«Ցույց տուր հեռախոսը, ուզում եմ ստուգել»։', good: false, why: 'Սա հարցաքննության ձևաչափ է։ Այն փակում է երկխոսությունը, ոչ թե բացում։' },
          { text: '«Ի՞նչ խաղ ես հիմա ամենաշատը խաղում. ցույց տուր»։', good: true, why: 'Անկեղծ հետաքրքրություն՝ առանց ստուգման ենթատեքստի։ Սա այն ձևաչափն է, որը պահպանում է բաց հաղորդակցությունը։' }
        ]
      },
      {
        id: 'r3',
        situation: 'Դեռահասը պնդում է, որ սահմանափակումներն անարդար են։ Ի՞նչ եք պատասխանում։',
        options: [
          { text: '«Որովհետև ես այդպես եմ ասում»։', good: false, why: 'Առանց բացատրության կանոնը ոչինչ չի սովորեցնում և ընկալվում է որպես կամայականություն։' },
          { text: '«Երբ մեծանաս և ցույց տաս, որ կարող ես ինքնուրույն կառավարել, սահմանափակումները կթուլացնենք»։', good: true, why: 'Ազատությունը դառնում է հասանելի նպատակ։ Սահմանափակումները պետք է հանվեն աստիճանաբար՝ հասունացմանը զուգահեռ։' }
        ]
      },
      {
        id: 'r4',
        situation: 'Ուզում եք, որ երեխան դիմի ձեզ, եթե առցանց ինչ-որ վատ բան պատահի։ Ի՞նչ եք ասում նախապես։',
        options: [
          { text: '«Եթե առցանց տհաճ բանի հանդիպես, ինձ կարող ես ասել առանց պատժի վախի»։', good: true, why: 'Ամենակարևոր նախադասությունը ողջ մոդուլում։ Պատժի վախն է հիմնական պատճառը, որ երեխաները լռում են։' },
          { text: '«Եթե ինչ-որ բան պատահի, հեռախոսը կվերցնեմ»։', good: false, why: 'Ուղղակիորեն երաշխավորում է լռություն։ Երեխան կթաքցնի հենց այն, ինչի մասին ամենից շատ պետք է իմանաք։' }
        ]
      }
    ],

    results: {
      high:   { title: 'Հիանալի է', text: 'Դուք լավ եք յուրացրել մոդուլի հիմնական գաղափարները։ Հաջորդ քայլը՝ անցեք գործնական քայլաշարով ձեր սարքերի վրա։' },
      mid:    { title: 'Լավ սկիզբ է', text: 'Հիմքը կա։ Վերադարձեք այն բաժիններին, որտեղ եղել են սխալները՝ հատկապես կարգավորումների մասերին։' },
      low:    { title: 'Արժե վերընթերցել', text: 'Մոդուլը պարունակում է շատ գործնական մանրամասներ։ Անցեք նորից՝ սկսելով «Ինչու է վերահսկողությունը կարևոր» բաժնից։' }
    }
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = MODULE_01;
