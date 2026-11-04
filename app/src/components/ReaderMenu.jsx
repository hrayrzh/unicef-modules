import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Меню читалки — ревью Анаит (ноябрь 2026):
 *
 *   «Այս երեք կոճակը եկեք դնենք մի հատ մենյուի տակ, որ կողքն էլ գրված լինի,
 *    թե ինչ են իրենք անում (մանկավարժ, օգնություն, փակել / վերադառնալ գլխավոր)»
 *   «վեբ տարբերակով էլ թող լինի կոճակով, որ պարզ լինի՝ ոնց հետ գնան մոդուլներ»
 *
 * Раньше в шапке стояли три иконки без подписей: ⇄ (роль), телефон (помощь),
 * ✕ (закрыть). Что делает каждая — приходилось угадывать, а возврат к списку
 * модулей вообще читался как «закрыть».
 *
 * Теперь одна кнопка, под ней выпадающий список с подписями. Вид выпадающего
 * списка под шапкой выбрал Грайр (2026-11-04).
 *
 * Подписи пунктов не придуманы заново — это строки, уже работавшие в проекте:
 * «Փոխել դերը» (title прежней кнопки роли), «Օգնություն» (кнопка помощи),
 * «Վերադառնալ մոդուլների ցանկ» (moduleLogic.js › nextHint на последнем шаге).
 */

const SwapIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 8h13l-3-3M20 16H7l3 3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6.6 3.5h3l1.4 4-2 1.4a12 12 0 0 0 6.1 6.1l1.4-2 4 1.4v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
  </svg>
);

const BackIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 6h7M4 12h7M4 18h7M20 12H14m0 0 2.6-2.6M14 12l2.6 2.6" />
  </svg>
);

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export default function ReaderMenu({ role, roleLabel, onSwapRole, onHelp, onClose }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    btnRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    // Escape закрывает меню, а не весь модуль: у читалки свой слушатель на
    // window, поэтому перехватываем на фазе погружения и гасим событие —
    // тот же приём, что в панели помощи.
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      close();
    };
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open, close]);

  const run = (fn) => () => { setOpen(false); fn(); };

  return (
    <div className="ms-menu" ref={wrapRef}>
      <button
        ref={btnRef}
        type="button"
        className={`ms-menu-btn${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MenuIcon />
        <span className="ms-menu-btn-label">Մենյու</span>
      </button>

      {open && (
        <div className="ms-menu-pop" role="menu">
          {role && (
            <button type="button" className="ms-menu-item" role="menuitem" onClick={run(onSwapRole)}>
              <span className="ms-menu-ico" aria-hidden><SwapIcon /></span>
              <span className="ms-menu-text">Փոխել դերը</span>
              <span className="ms-menu-now">{roleLabel}</span>
            </button>
          )}
          <button type="button" className="ms-menu-item" role="menuitem" onClick={run(onHelp)}>
            <span className="ms-menu-ico is-help" aria-hidden><PhoneIcon /></span>
            <span className="ms-menu-text">Օգնություն</span>
          </button>
          <button type="button" className="ms-menu-item" role="menuitem" onClick={run(onClose)}>
            <span className="ms-menu-ico" aria-hidden><BackIcon /></span>
            <span className="ms-menu-text">Վերադառնալ մոդուլների ցանկ</span>
          </button>
        </div>
      )}
    </div>
  );
}
