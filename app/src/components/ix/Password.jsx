import { useEffect, useState } from 'react';
import { Icon } from './icons';
import { Frame, useDone } from './shared';
import { passStrength } from './strength';

/**
 * `passlen` — стойкость пароля (Module_3.html, «Գաղտնաբառի երկարություն»):
 * поле, шкала длины до `min` (счётчик «n / 15+», как в файле) и оценка
 * стойкости — не только по длине, а и по составу и привычным уловкам
 * (strength.js): «Password1!» — «Շատ թույլ», три случайных слова — «Ուժեղ».
 * Под шкалой — уровень, примерное время подбора, из чего состоит пароль
 * и чем он слаб (известное слово, «aaa / 123 / qwerty», год).
 *
 * Засчитывается, когда пароль длиной от `min` и не слабее «Ուժեղ».
 * Введённое никуда не уходит: не пишется в стор, а автозаполнение и
 * менеджеры паролей поле не трогают — вдруг кто-то наберёт настоящий пароль.
 *
 * Поля: `title`, `hint`, `placeholder`, `min` (по умолчанию 15).
 */
const LEVELS = ['Շատ թույլ', 'Թույլ', 'Միջին', 'Ուժեղ', 'Շատ ուժեղ'];
const TONES = ['bad', 'low', 'mid', 'ok', 'top'];
const TIME = 'Կոտրելու մոտավոր ժամանակը՝';
const WARN = {
  common: 'Պարունակում է հաճախ օգտագործվող գաղտնաբառ կամ բառ. այն փորձում են առաջինը։',
  pattern: 'Կրկնվող կամ իրար հաջորդող նշանները (aaa, 123, abc, qwerty) հեշտ է կռահել։',
  year: 'Տարեթիվը (օր.՝ 2010) հեշտ է կռահել։',
};
const NOTE = 'Հաշվարկը ենթադրում է վայրկյանում 10 միլիարդ փորձ։ Մուտքագրված տեքստը մնում է միայն ձեր սարքում և ոչ մի տեղ չի ուղարկվում։';

/** Время подбора словами: «3 ժամ», «58 տարի», «հազարավոր տարիներ». */
function crackTime(sec) {
  const y = sec / 31557600;
  if (sec < 1) return 'ակնթարթորեն';
  if (sec < 60) return `${Math.round(sec)} վայրկյան`;
  if (sec < 3600) return `${Math.round(sec / 60)} րոպե`;
  if (sec < 86400) return `${Math.round(sec / 3600)} ժամ`;
  if (sec < 86400 * 30) return `${Math.round(sec / 86400)} օր`;
  if (y < 1) return `${Math.max(1, Math.round(sec / 2629800))} ամիս`;
  if (y < 100) return `${Math.round(y)} տարի`;
  if (y < 1000) return `${Math.round(y / 100)} դար`;
  if (y < 1e6) return 'հազարավոր տարիներ';
  if (y < 1e9) return 'միլիոնավոր տարիներ';
  return 'միլիարդավոր տարիներ';
}

export function PassLen({ block: b, done, onDone }) {
  const min = b.min || 15;
  const [value, setValue] = useState('');
  const [ok, setOk] = useState(!!done);
  const len = [...value].length;
  const st = passStrength(value);
  useEffect(() => { if (len >= min && st.level >= 3) setOk(true); }, [len, min, st.level]);
  useDone(ok, onDone);
  const tone = st.level >= 0 ? ` is-${TONES[st.level]}` : '';

  // Из чего состоит пароль. Первые два — то, что советует текст модуля.
  const chips = [
    { on: len >= min, label: `${min}+ նիշ`, key: true },
    { on: st.words >= 3, label: '3+ բառ', key: true },
    { on: st.has.lower, label: 'Փոքրատառեր' },
    { on: st.has.upper, label: 'Մեծատառեր' },
    { on: st.has.digit, label: 'Թվեր' },
    { on: st.has.symbol, label: 'Սիմվոլներ (!@#…)' },
  ];

  return (
    <Frame icon={<Icon name="key" />} title={b.title} hint={b.hint} progress={`${len} / ${min}+`} done={ok}>
      <div className={`ix-pw${tone}`}>
        <input
          className="ix-pw-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={b.placeholder}
          aria-label={b.title}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
          data-form-type="other"
        />
        <div className="ix-pw-meter" style={{ '--n': min }} aria-hidden>
          {Array.from({ length: min }, (_, i) => <i key={i} className={i < len ? 'is-on' : ''} />)}
        </div>

        <div className="ix-pw-info" aria-live="polite">
          {st.level >= 0 && (
            <div className="ix-pw-verdict">
              <span className="ix-pw-level">{LEVELS[st.level]}</span>
              <span className="ix-pw-time">{TIME} <b>{crackTime(st.seconds)}</b></span>
            </div>
          )}
          <ul className="ix-pw-chips">
            {chips.map((c) => (
              <li key={c.label} className={`ix-pw-chip${c.on ? ' is-on' : ''}${c.key ? ' is-key' : ''}`}>
                {c.on ? <Icon name="check" size={12} strokeWidth={3} /> : <span className="ix-pw-dot" aria-hidden />}
                {c.label}
              </li>
            ))}
          </ul>
          {st.warn.map((w) => (
            <p key={w} className="ix-pw-warn">
              <Icon name="warn" size={15} />
              <span>{WARN[w]}</span>
            </p>
          ))}
          <p className="ix-pw-note">{NOTE}</p>
        </div>
      </div>
    </Frame>
  );
}
