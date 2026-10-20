import { useCallback, useEffect, useRef, useState } from 'react';
import { LinkIcon, PhoneIcon } from './ContactCard';


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
// Телефоны контакта: `phones[]` или один `tel` + `label` (как в ContactCard).
const phonesOf = (c) => c.phones || (c.tel ? [{ tel: c.tel, label: c.label }] : []);

/**
 * Окно (редизайн 2026-10-20, просьба Армана: «слишком явно сделано ИИ»):
 * красная шапка с заголовком засечным шрифтом; сразу под ней — экстренные
 * номера (`urgent`) крупными цифрами, вся плитка звонит; «Ե՞րբ դիմել» —
 * спокойный список; остальные организации — справочником: строка «кто и чем
 * помогает», номер справа. Длинное вступление (модуль 4) уходит из шапки в тело,
 * под экстренные номера, чтобы они оставались на первом экране.
 */
export default function HelpButton({ help: HELP, openSignal = 0 }) {
  const [open, setOpen] = useState(false);
  const urgent = (HELP.contacts || []).filter((c) => c.urgent && phonesOf(c).length);
  const rest = (HELP.contacts || []).filter((c) => !urgent.includes(c));
  const shortLead = (HELP.lead || '').length <= 180;
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
            <span className="ms-hp-grab" aria-hidden />
            <header className="ms-hp-head">
              <div className="ms-hp-head-text">
                <h2 className="ms-hp-title">{HELP.title}</h2>
                {shortLead && <p className="ms-hp-lead">{HELP.lead}</p>}
              </div>
              <button className="ms-hp-close" onClick={close} aria-label="Փակել">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                  <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div className="ms-hp-body">
              {/* Экстренные номера — первыми и крупно: вся плитка звонит. */}
              {urgent.length > 0 && (
                <div className="ms-hp-sos">
                  {urgent.map((c, i) => {
                    const p = phonesOf(c)[0];
                    return (
                      <a key={c.name} className="ms-hp-sos-tile" href={`tel:${p.tel}`} style={{ '--i': i }}>
                        <span className="ms-hp-sos-name">{c.name}</span>
                        <span className="ms-hp-sos-num">{p.label}</span>
                        {c.role && <span className="ms-hp-sos-role">{c.role}</span>}
                        <span className="ms-hp-sos-call" aria-hidden><PhoneIcon size={17} /></span>
                      </a>
                    );
                  })}
                </div>
              )}
              {!shortLead && <p className="ms-hp-intro">{HELP.lead}</p>}

              {/* №37 — «написано, в каких случаях обращаться». */}
              <section className="ms-hp-sec">
                <h3 className="ms-hp-h">{HELP.whenTitle}</h3>
                <ul className="ms-hp-when">
                  {HELP.when.map((t, i) => <li key={t} style={{ '--i': i }}>{t}</li>)}
                </ul>
              </section>

              {/* Остальные — справочником: кто и чем помогает, номер справа. */}
              <section className="ms-hp-sec">
                <h3 className="ms-hp-h">Որտեղ դիմել</h3>
                <ul className="ms-hp-dir">
                  {rest.map((c, i) => (
                    <li key={c.name} className="ms-hp-row" style={{ '--i': i }}>
                      <div className="ms-hp-row-main">
                        <span className="ms-hp-name">{c.name}</span>
                        {c.role && <span className="ms-hp-role">{c.role}</span>}
                      </div>
                      <div className="ms-hp-row-act">
                        {phonesOf(c).map((p) => (
                          <a key={p.tel} className="ms-hp-num" href={`tel:${p.tel}`}>
                            <PhoneIcon size={14} />
                            <span>{p.label}</span>
                          </a>
                        ))}
                        {c.url && (
                          <a className="ms-hp-web" href={c.url} target="_blank" rel="noreferrer noopener">
                            <span>{c.urlLabel}</span>
                            <LinkIcon size={12} />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
              {HELP.note && <p className="ms-hp-note">{HELP.note}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Иконки живут в ContactCard.jsx; отсюда их по-прежнему импортирует Block.jsx.
export { LinkIcon, PhoneIcon } from './ContactCard';
