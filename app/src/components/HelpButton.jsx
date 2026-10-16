import { useCallback, useEffect, useRef, useState } from 'react';
import ContactCard, { PhoneIcon } from './ContactCard';


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
/**
 * Панель открывается не только своей кнопкой: внутри раздела есть ссылки
 * «Օգնության կետեր», которые должны вести сюда же, а не дублировать контакты
 * в тексте. Поэтому состояние можно поднять наружу — `openSignal` растёт на
 * каждый такой запрос из контента.
 */
export default function HelpButton({ help: HELP, openSignal = 0 }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  // Ноль — начальное значение, по нему панель не открывается.
  useEffect(() => { if (openSignal > 0) setOpen(true); }, [openSignal]);

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
                {HELP.contacts.map((c) => <ContactCard key={c.name} c={c} />)}
              </div>
              {HELP.note && <p className="ms-help-note">{HELP.note}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Иконки живут в ContactCard.jsx; отсюда их по-прежнему импортирует Block.jsx.
export { LinkIcon, PhoneIcon } from './ContactCard';
