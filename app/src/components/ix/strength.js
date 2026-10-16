// Оценка стойкости пароля для `passlen` (Password.jsx). Не «длина × алфавит»:
// так «P@ssw0rd!» выглядел бы сильным, хотя его подбирают первым. Модель —
// упрощённый zxcvbn: пароль режется на куски (буквы, цифры, символы,
// пробелы), каждый кусок стоит столько попыток, сколько нужно на его
// подбор, с поправками на то, как пароли придумывают люди:
//   • известный пароль / слово из списка — ~1000 попыток, а не перебор;
//   • заглавной только первая буква или все — +1 бит, а не двойной алфавит;
//   • повтор и последовательность (aaa, 123, abc, qwerty) — почти даром;
//   • год 19xx/20xx — ~200 вариантов;
//   • в фразе из нескольких слов каждое слово — из словаря (~2 млн форм),
//     поэтому три случайных слова — «сильный», как в тексте модуля (NCSC).
// Время — для подбора на компьютере, 10 млрд попыток в секунду.

const COMMON = new Set([
  'password', 'passwd', 'pass', 'qwerty', 'qwertyuiop', 'asdfgh', 'asdfghjkl', 'zxcvbn', 'zxcvbnm', 'qazwsx',
  'iloveyou', 'admin', 'welcome', 'letmein', 'monkey', 'dragon', 'football', 'baseball', 'soccer', 'princess',
  'sunshine', 'master', 'superman', 'batman', 'shadow', 'michael', 'login', 'starwars', 'hello', 'freedom',
  'whatever', 'trustno', 'secret', 'love', 'killer', 'hunter', 'charlie', 'pokemon', 'minecraft', 'roblox',
  'fortnite', 'google', 'facebook', 'instagram', 'tiktok', 'user', 'test', 'abc', 'abcd', 'abcdef',
  'armenia', 'hayastan', 'yerevan', 'ararat', 'barev', 'parol', 'пароль', 'йцукен', 'любовь',
  'գաղտնաբառ', 'բարև', 'հայաստան', 'երևան', 'սեր',
  '123456', '1234567', '12345678', '123456789', '1234567890', '111111', '000000', '123123', '654321',
  '112233', '121212', '666666', '777777', '987654321', '1q2w3e', '1q2w3e4r', 'zaq12wsx', 'qwe123', 'abc123',
]);
const LEET = { '@': 'a', 4: 'a', 0: 'o', 1: 'i', '!': 'i', 3: 'e', $: 's', 5: 's', 7: 't', '+': 't' };
const ROWS = ['1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'йцукенгшщзхъ', 'фывапролджэ', 'ячсмитьбю'];
const RATE = 1e10;

const deleet = (s) => [...s].map((c) => LEET[c] || c).join('');
const isCommon = (s) => COMMON.has(s) || COMMON.has(deleet(s));

/** Шаг между знаками: +1/−1 по алфавиту или по ряду клавиатуры, 0 — не соседи. */
function step(a, b) {
  const d = b.codePointAt(0) - a.codePointAt(0);
  if (d === 1 || d === -1) return d;
  for (const r of ROWS) {
    const i = r.indexOf(a);
    const j = r.indexOf(b);
    if (i >= 0 && j >= 0 && Math.abs(i - j) === 1) return j - i;
  }
  return 0;
}

/** Три знака подряд — повтор (aaa) или ход в одну сторону (abc, 321, qwe); «efe» — нет. */
const chain = (a, b, c) => (a === b && b === c) || (step(a, b) !== 0 && step(a, b) === step(b, c));

/**
 * Биты куска: каждый знак — log2(pool), кроме третьего и дальше в повторе или
 * последовательности. `run` — самая длинная такая цепочка дешёвых знаков:
 * «stu» внутри «study» даёт 1 и предупреждения не заслуживает, «abcd» — 2.
 */
function walk(chars, pool) {
  const low = chars.map((c) => c.toLowerCase());
  let bits = 0;
  let run = 0;
  let cur = 0;
  low.forEach((c, i) => {
    if (i >= 2 && chain(low[i - 2], low[i - 1], c)) { bits += 1; cur += 1; run = Math.max(run, cur); } else { bits += Math.log2(pool); cur = 0; }
  });
  return { bits, run };
}

function letterPool(chars) {
  let pool = 0;
  if (chars.some((c) => /[a-z]/i.test(c))) pool += 26;
  if (chars.some((c) => /[Ա-և]/.test(c))) pool += 38;
  if (chars.some((c) => /[Ѐ-ӿ]/.test(c))) pool += 33;
  return pool || 30;
}

const KIND = (c) => (/\p{L}/u.test(c) ? 'l' : /\p{Nd}/u.test(c) ? 'd' : /\s/.test(c) ? 's' : 'y');

export function passStrength(pw) {
  const chars = [...pw];
  const lower = pw.toLowerCase();
  const warn = new Set();
  const has = {
    lower: /\p{Ll}/u.test(pw),
    upper: /\p{Lu}/u.test(pw),
    digit: /\p{Nd}/u.test(pw),
    symbol: /[^\p{L}\p{Nd}\s]/u.test(pw),
  };
  const words = pw.trim().split(/[\s\-_.]+/).filter((w) => [...w].filter((c) => /\p{L}/u.test(c)).length >= 2);
  const phrase = words.length >= 2;

  // Куски одного рода подряд.
  const segs = [];
  chars.forEach((c) => {
    const k = KIND(c);
    if (segs.length && segs[segs.length - 1].k === k) segs[segs.length - 1].c.push(c);
    else segs.push({ k, c: [c] });
  });

  let bits = 0;
  let run = 0;
  segs.forEach(({ k, c }) => {
    const s = c.join('');
    if (k === 's') return;
    if (k === 'l') {
      const ups = c.filter((x) => /\p{Lu}/u.test(x)).length;
      // Заглавная первая или все — привычка, а не случайность: +1 бит.
      const simpleCase = ups === 0 || ups === c.length || (ups === 1 && /\p{Lu}/u.test(c[0]));
      const caseBits = ups ? 1 : 0;
      if (isCommon(s.toLowerCase())) { warn.add('common'); bits += Math.log2(1000) + caseBits; return; }
      const w = walk(c, letterPool(c) * (simpleCase ? 1 : 2));
      run = Math.max(run, w.run);
      bits += (phrase ? Math.min(w.bits, 21) : w.bits) + (simpleCase ? caseBits : 0);
      return;
    }
    if (k === 'd') {
      if (isCommon(s)) { warn.add('common'); bits += Math.log2(1000); return; }
      if (/^(19|20)\d\d$/.test(s)) { warn.add('year'); bits += Math.log2(200); return; }
      const w = walk(c, 10);
      run = Math.max(run, w.run);
      bits += w.bits;
      return;
    }
    const w = walk(c, 33);
    run = Math.max(run, w.run);
    bits += w.bits;
  });
  // Порядок кусков тоже надо угадать.
  if (segs.length > 1) bits += Math.log2(segs.length);

  // Известный пароль целиком, с «украшениями» по краям: P@ssw0rd2024!
  const core = lower.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
  if (pw && (isCommon(lower) || (core.length >= 3 && isCommon(core)))) {
    warn.add('common');
    // Края оцениваются той же моделью: «2024!» — год и символ, а не 5 случайных знаков.
    const rest = lower.replace(core, '');
    const extra = rest ? passStrength(rest).bits : 0;
    bits = Math.min(bits, Math.log2(1000) + (has.upper ? 1 : 0) + extra);
  }
  if (run >= 2) warn.add('pattern');

  const level = !pw ? -1 : bits < 28 ? 0 : bits < 40 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : 4;
  const seconds = pw ? 2 ** Math.max(0, bits - 1) / RATE : 0;
  return { bits, level, seconds, has, words: words.length, warn: [...warn] };
}
