/**
 * Карточка организации: название, чем помогает, кнопки звонка и кнопка
 * сайта. Одна и та же в панели помощи (HelpButton) и в тексте модуля
 * (блок `contacts`, Block.jsx) — контакты выглядят одинаково везде.
 *
 * Поля: `name`, `role`, телефоны — `phones[]` из `{ tel, label }` или
 * один `tel` + `label`, сайт — `url` + `urlLabel`, `urgent` — красная
 * карточка для экстренного номера.
 */
export default function ContactCard({ c }) {
  const phones = c.phones || (c.tel ? [{ tel: c.tel, label: c.label }] : []);
  return (
    <div className={c.urgent ? 'ms-help-card is-urgent' : 'ms-help-card'}>
      <div className="ms-help-name">{c.name}</div>
      {c.role && <p className="ms-help-role">{c.role}</p>}
      <div className="ms-help-actions">
        {/* Кнопка звонка в виде телефона — №37 дословно. У контакта без
            телефона её место занимает кнопка на сайт. */}
        {phones.map((p) => (
          <a key={p.tel} className="ms-help-call" href={`tel:${p.tel}`}>
            <PhoneIcon size={14} />
            <span>{p.label}</span>
          </a>
        ))}
        {c.url && (
          <a className="ms-help-link" href={c.url} target="_blank" rel="noreferrer noopener">
            <span>{c.urlLabel}</span>
            <LinkIcon size={13} />
          </a>
        )}
      </div>
    </div>
  );
}

/** Внешняя ссылка: стрелка из рамки. Рисуется, не грузится — §5.
    Общая для карточек контактов и ссылок (Block.jsx › links). */
export function LinkIcon({ size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M14 4h6v6M20 4l-9 9M18 13v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h5"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PhoneIcon({ size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M6.5 3.5h3l1.4 3.6-2 1.5a12 12 0 006.5 6.5l1.5-2 3.6 1.4v3a2 2 0 01-2.2 2A16.5 16.5 0 014.5 5.7a2 2 0 012-2.2z"
        stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
      />
    </svg>
  );
}
