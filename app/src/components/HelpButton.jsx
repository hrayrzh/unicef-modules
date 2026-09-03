import { useCallback, useEffect, useRef, useState } from 'react';
import { HELP } from '../data/module01';

/**
 * Кнопка «Օգնություն» — требования рецензента №36 и №37.
 *
 * №36: видна на всём протяжении модуля, всегда доступна, отдельным цветом.
 * №37: внутри — ссылка, кнопка звонка в виде телефона и описание, в каких
 * случаях обращаться.
 *
 * Место — шапка читалки, а не плавающий угол: шапка не скроллится, поэтому
 * кнопка честно доступна на любом экране, и при этом ничего не перекрывает.
 * Плавающая кнопка в правом нижнем углу наезжала бы на «Հաջորդ», в левом —
 * на нижние пункты боковой навигации.
 *
 * Цвет намеренно выпадает из палитры модуля: весь интерфейс держится на
 * UNICEF cyan, помощь — единственный тёплый красный. Так её видно, не читая.
 */
export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    // Возврат фокуса на кнопку: иначе после закрытия с клавиатуры фокус
    // уходит в начало документа.
    btnRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    // Читалка закрывается по Escape своим слушателем на window. Перехватываем
    // на фазе погружения и гасим событие, иначе один Escape закрыл бы и
    // панель помощи, и весь модуль.
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      close();
    };
    window.addEventListener('keydown', onKey, true);
    panelRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, close]);

  return (
    <>
      <button
        ref={btnRef}
        className="ms-help-btn"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <PhoneIcon size={15} />
        <span className="ms-help-btn-label">{'Օգնություն'}</span>
      </button>

      {open && (
        <div
          className="ms-help-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div
            ref={panelRef}
            className="ms-help-panel"
            role="dialog"
            aria-modal="true"
            aria-label={HELP.title}
            tabIndex={-1}
          >
            <div className="ms-help-head">
              <div>
                <div className="ms-help-kicker">{HELP.title}</div>
                <p className="ms-help-lead">{HELP.lead}</p>
              </div>
              <button className="ms-close ms-help-close" onClick={close} aria-label="Փակել">✕</button>
            </div>

            <div className="ms-help-body">
              {/* №37 — «написано, в каких случаях обращаться». */}
              <h3 className="ms-help-h">{HELP.whenTitle}</h3>
              <ul className="ms-help-when">
                {HELP.when.map((t) => <li key={t}>{t}</li>)}
              </ul>

              <h3 className="ms-help-h">Որտեղ դիմել</h3>
              <div className="ms-help-contacts">
                {HELP.contacts.map((c) => (
                  <div key={c.name} className={c.urgent ? 'ms-help-card is-urgent' : 'ms-help-card'}>
                    <div className="ms-help-name">{c.name}</div>
                    <p className="ms-help-role">{c.role}</p>
                    <div className="ms-help-actions">
                      {/* Кнопка звонка в виде телефона — №37 дословно. */}
                      <a className="ms-help-call" href={`tel:${c.tel}`}>
                        <PhoneIcon size={14} />
                        <span>{c.label}</span>
                      </a>
                      {c.url && (
                        <a className="ms-help-link" href={c.url} target="_blank" rel="noreferrer noopener">
                          {c.urlLabel}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PhoneIcon({ size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M6.5 3.5h3l1.4 3.6-2 1.5a12 12 0 006.5 6.5l1.5-2 3.6 1.4v3a2 2 0 01-2.2 2A16.5 16.5 0 014.5 5.7a2 2 0 012-2.2z"
        stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
      />
    </svg>
  );
}
