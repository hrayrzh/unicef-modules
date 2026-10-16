import { useState } from 'react';
import { Icon } from './icons';
import { useDone } from './shared';

/**
 * `unfold` — абзац по частям, как в файле предложений Армана: видна первая
 * часть, кнопка «▸» добавляет следующую. Каждая часть — плашка со своим
 * значком по кругу 💡 🔎 🛡️ 🔑 (те же, что в файле). Когда открыта последняя,
 * кнопка исчезает и блок засчитывается.
 *
 * Поля: `items[]` — части абзаца дословно, по порядку; `title?` — заголовок
 * врезки, которую блок заменил (модуль 3), мелкой строкой сверху.
 */
const MARKS = ['💡', '🔎', '🛡️', '🔑'];

export function Unfold({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const n = items.length;
  const [shown, setShown] = useState(done ? n : 1);
  const complete = shown >= n;
  useDone(complete, onDone);

  return (
    <div className={`ix ix-uf${complete ? ' is-done' : ''}`}>
      {b.title && <div className="ix-uf-title">{b.title}</div>}
      <div className="ix-uf-list" aria-live="polite">
        {items.slice(0, shown).map((t, i) => (
          <div key={i} className="ix-uf-item">
            <span className="ix-uf-mark" aria-hidden>{MARKS[i % MARKS.length]}</span>
            <span className="ix-uf-text">{R(t)}</span>
          </div>
        ))}
      </div>
      <div className="ix-uf-foot">
        <span className="ix-progress">
          {complete && <Icon name="check" size={13} strokeWidth={3} />}
          {shown} / {n}
        </span>
        {!complete && (
          <button type="button" className="ix-round is-primary" onClick={() => setShown((s) => s + 1)} aria-label="Հաջորդ">
            <Icon name="next" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
