import { useEffect, useState } from 'react';
import { Icon } from './icons';
import { Frame, useDone } from './shared';

/**
 * `passlen` — длина пароля (Module_3.html, «Գաղտնաբառի երկարություն»):
 * поле и шкала из `min` делений. Каждый символ зажигает деление: меньше 8 —
 * коралл, до `min` — янтарь, от `min` — голубой; счётчик «n / 15+», как в
 * файле. Засчитывается на `min`-м символе.
 *
 * Введённое никуда не уходит: не пишется в стор, а автозаполнение и
 * менеджеры паролей поле не трогают — вдруг кто-то наберёт настоящий пароль.
 *
 * Поля: `title`, `hint`, `placeholder`, `min` (по умолчанию 15).
 */
export function PassLen({ block: b, done, onDone }) {
  const min = b.min || 15;
  const [value, setValue] = useState('');
  const [ok, setOk] = useState(!!done);
  const len = [...value].length;
  useEffect(() => { if (len >= min) setOk(true); }, [len, min]);
  useDone(ok, onDone);
  const tone = len >= min ? ' is-ok' : len >= 8 ? ' is-mid' : len > 0 ? ' is-low' : '';

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
      </div>
    </Frame>
  );
}
