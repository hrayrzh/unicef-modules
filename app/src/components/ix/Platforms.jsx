import { Fragment, useState } from 'react';
import { logoFor } from '../PlatformLogo';
import { Icon } from './icons';
import { Frame, plain, useDone } from './shared';

/**
 * Плитка приложения: логотип платформы, а если знака нет (Minecraft,
 * Brawl Stars) — нейтральная плитка с джойстиком. Размер задаёт CSS
 * того блока, где плитка стоит.
 */
export function AppTile({ name, className = '' }) {
  const logo = logoFor(name);
  if (!logo) {
    return <span className={`ix-app is-plain ${className}`} aria-hidden><Icon name="game" /></span>;
  }
  return (
    <span className={`ix-app ${className}`} style={{ '--bg': logo.color, '--fg': logo.fg }} aria-hidden>
      <svg viewBox="0 0 24 24" fill="currentColor"><path d={logo.d} /></svg>
    </span>
  );
}

/**
 * `matrix` — таблица «риск × платформа» из 5_1.html. Строки — риски, колонки
 * — платформы, которые названы во второй колонке таблицы (поиск по тексту,
 * поэтому точка не может разойтись с документом). Нажатие на риск
 * заполняет его строку точками и открывает обе колонки текста; нажатие на
 * платформу (как «радар» из 5_2.html) подсвечивает её колонку и риски, где
 * она названа. Блок пройден, когда открыты все риски.
 *
 * Поля — как у таблицы: `title`, `head[3]`, `rows[]`; плюс `platforms[]` —
 * названия так, как они написаны в тексте.
 */
const MATRIX_HINT = 'Սեղմեք ռիսկի կամ հարթակի վրա։';

export function Matrix({ block: b, done, onDone, R }) {
  const head = b.head || [];
  const rows = b.rows || [];
  const pls = b.platforms || [];
  const has = rows.map((r) => pls.map((p) => plain(r[1]).includes(p)));
  const [opened, setOpened] = useState(() => rows.map(() => !!done));
  const [cols, setCols] = useState(() => pls.map(() => !!done));
  const [row, setRow] = useState(done ? 0 : null);
  const [col, setCol] = useState(null);
  const count = opened.filter(Boolean).length;
  const complete = rows.length > 0 && count === rows.length;
  useDone(complete, onDone);

  const pickRow = (i) => {
    setRow(i);
    setCol(null);
    setOpened((o) => (o[i] ? o : o.map((v, k) => v || k === i)));
  };
  const pickCol = (j) => {
    setCol((c) => (c === j ? null : j));
    setCols((s) => (s[j] ? s : s.map((v, k) => v || k === j)));
  };

  return (
    <Frame icon={<Icon name="grid" />} title={b.title} hint={MATRIX_HINT} progress={`${count} / ${rows.length}`} done={complete}>
      <div className="ix-mx" style={{ '--cols': pls.length }}>
        <span className="ix-mx-corner" aria-hidden />
        {pls.map((p, j) => (
          <button
            key={p}
            type="button"
            className={`ix-mx-pl${col === j ? ' is-on' : ''}`}
            aria-pressed={col === j}
            aria-label={p}
            title={p}
            onClick={() => pickCol(j)}
          >
            <AppTile name={p} />
            <span className="ix-mx-pl-name" aria-hidden>{p}</span>
          </button>
        ))}
        {rows.map((r, i) => (
          <div key={i} className="ix-mx-row" role="presentation">
            <button
              type="button"
              className={`ix-mx-risk${row === i ? ' is-on' : ''}${opened[i] ? ' is-open' : ''}${col != null && has[i][col] ? ' is-hit' : ''}`}
              aria-pressed={row === i}
              onClick={() => pickRow(i)}
            >
              <span className="ix-mx-mark" aria-hidden>{opened[i] && <Icon name="check" size={11} strokeWidth={3.2} />}</span>
              <span className="ix-mx-risk-name">{r[0]}</span>
            </button>
            {pls.map((p, j) => {
              const shown = opened[i] || cols[j];
              const state = shown ? (has[i][j] ? ' is-hit' : ' is-miss') : '';
              return (
                <span
                  key={p}
                  className={`ix-mx-cell${state}${row === i ? ' in-row' : ''}${col === j ? ' in-col' : ''}`}
                  style={{ '--j': j }}
                  aria-hidden
                >
                  <i />
                  {/* На телефоне вместо точки — маленький логотип: шапка с
                      логотипами далеко, и по точке не понять, чья она. */}
                  {shown && has[i][j] && <AppTile name={p} className="ix-mx-mini" />}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* Платформа выбрана — её риски строкой, как «Instagram — …» в 5_1.html;
          название риска — кнопка, нажатие открывает риск. */}
      {col != null ? (
        <div className="ix-mx-panel is-pl" key={`p${col}`} aria-live="polite">
          <p className="ix-mx-pl-line">
            <AppTile name={pls[col]} />
            <b>{pls[col]}</b>
            {' — '}
            {rows.map((r, i) => i).filter((i) => has[i][col]).map((i, k) => (
              <Fragment key={i}>
                {k > 0 && ', '}
                <button type="button" className={`ix-mx-pl-risk${opened[i] ? ' is-open' : ''}`} onClick={() => pickRow(i)}>
                  {rows[i][0]}
                </button>
              </Fragment>
            ))}
          </p>
        </div>
      ) : row != null && (
        <div className="ix-mx-panel" key={row} aria-live="polite">
          <span className="ix-mx-panel-h">{rows[row][0]}</span>
          <div className="ix-mx-panel-cols">
            <div>
              <span className="ix-kicker">{head[1]}</span>
              <p>{R(rows[row][1])}</p>
            </div>
            <div>
              <span className="ix-kicker is-warn">{head[2]}</span>
              <p>{R(rows[row][2])}</p>
            </div>
          </div>
        </div>
      )}
    </Frame>
  );
}

/**
 * `toggles` — настройки платформ переключателями (5_1.html, «switch»).
 * Сверху — «экран телефона» с плитками приложений, ниже — экран настроек
 * выбранного: каждая рекомендация документа — строка с переключателем,
 * внизу — ссылка на официальную страницу безопасности. Пункты — дословные
 * части ячейки таблицы, разрезанные по смыслу, а не по каждой запятой
 * («անունը, տարիքը, դպրոցը…» не разваливается на строки).
 *
 * Засчитывается, как гайды (D16): достаточно одной платформы, где включено
 * всё, — у семьи может не быть PUBG.
 *
 * Поля: `title`, `items[]` из `{name, settings[], src}`; `src` — подпись
 * источника со ссылкой, разметкой `[подпись](адрес)`.
 */
const TOGGLES_HINT = 'Ընտրեք հարթակը և նշեք կիրառված կարգավորումները։';
// На плитке — название до скобки: «Minecraft (հատկապես …)» целиком стоит в шапке экрана.
const short = (name) => name.split(' (')[0];

export function Toggles({ block: b, done, onDone, R }) {
  const items = b.items || [];
  const [on, setOn] = useState(() => items.map((it) => (it.settings || []).map(() => !!done)));
  const [cur, setCur] = useState(0);
  const full = on.map((s) => s.length > 0 && s.every(Boolean));
  const complete = full.some(Boolean);
  useDone(complete, onDone);

  const flip = (k) => setOn((o) => o.map((s, i) => (i === cur ? s.map((v, j) => (j === k ? !v : v)) : s)));
  const it = items[cur] || {};
  const st = on[cur] || [];

  return (
    <Frame icon={<Icon name="toggle" />} title={b.title} hint={complete ? null : TOGGLES_HINT} done={complete}>
      <div className="ix-tg">
        <div className="ix-tg-apps" role="tablist">
          {items.map((x, i) => (
            <button
              key={x.name}
              type="button"
              role="tab"
              aria-selected={i === cur}
              className={`ix-tg-app${i === cur ? ' is-on' : ''}`}
              onClick={() => setCur(i)}
            >
              <span className="ix-tg-app-ico">
                <AppTile name={x.name} />
                {full[i] && <span className="ix-tg-badge"><Icon name="check" size={11} strokeWidth={3.4} /></span>}
              </span>
              <span className="ix-tg-app-name">{short(x.name)}</span>
            </button>
          ))}
        </div>

        <div className="ix-tg-screen" key={cur} role="tabpanel" aria-label={it.name}>
          <div className="ix-tg-bar">
            <AppTile name={it.name} />
            <span className="ix-tg-name">{it.name}</span>
            <span className="ix-tg-count">{st.filter(Boolean).length} / {st.length}</span>
          </div>
          <ul className="ix-tg-list">
            {(it.settings || []).map((t, k) => (
              <li key={k}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!st[k]}
                  className={`ix-tg-row${st[k] ? ' is-on' : ''}`}
                  style={{ '--i': k }}
                  onClick={() => flip(k)}
                >
                  <span className="ix-tg-text">{R(t)}</span>
                  <span className="ix-sw" aria-hidden><i /></span>
                </button>
              </li>
            ))}
          </ul>
          {it.src && (
            <p className="ix-tg-src">
              <Icon name="link" size={15} />
              <span>{R(it.src)}</span>
            </p>
          )}
        </div>
      </div>
    </Frame>
  );
}
