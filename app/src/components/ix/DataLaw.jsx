import { Fragment, useEffect, useState } from 'react';
import { Icon } from './icons';
import { Frame, markParts, useDone } from './shared';

/**
 * `namecard` — «ваше имя — ваши данные» (файл «Նոր ինտերակտիվ
 * տարբերակներ», модуль 5, «Անձնական տվյալի սուբյեկտ…»): читатель пишет имя,
 * оно появляется на карточке; одна бирка помечает имя как персональные
 * данные, другая — человека как их субъекта. Имя никуда не пишется.
 *
 * Поля: `text` — пункт дословно; `placeholder`; `data`, `subject` — подписи
 * бирок (из файла предложений).
 */
const NAME_HINT = 'Գրեք ձեր անունը։';

export function NameCard({ block: b, done, onDone, R }) {
  const [name, setName] = useState('');
  const [ok, setOk] = useState(!!done);
  const filled = name.trim().length > 0;
  useEffect(() => { if (name.trim().length >= 2) setOk(true); }, [name]);
  useDone(ok, onDone);

  return (
    <Frame icon={<Icon name="idtag" />} hint={NAME_HINT} done={ok}>
      <p className="ix-text">{R(b.text)}</p>
      <input
        className="ix-pw-input ix-nc-input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={b.placeholder}
        aria-label={b.placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        data-1p-ignore
        data-lpignore="true"
      />
      <div className={`ix-nc${filled ? ' is-filled' : ''}`}>
        <div className="ix-nc-card">
          <span className="ix-nc-ava" aria-hidden><Icon name="user" size={30} /></span>
          <span className="ix-nc-main">
            <span className="ix-nc-name" key={filled ? 'n' : 'e'}>{filled ? name : '…'}</span>
            <span className="ix-nc-lines" aria-hidden><i /><i /></span>
          </span>
        </div>
        <div className="ix-nc-tags" aria-hidden={!filled}>
          <span className="ix-nc-tag is-subj"><Icon name="user" size={14} />{b.subject}</span>
          <span className="ix-nc-tag is-data"><Icon name="idtag" size={14} />{b.data}</span>
        </div>
      </div>
    </Frame>
  );
}

/**
 * `pipeline` — «обработка — любое действие с данными» (тот же файл, «Անձնական
 * տվյալի մշակում…»): данные слева, шестерёнка посередине, справа результат.
 * Действие из абзаца — кнопка: по ленте едет пакет, шестерёнка
 * поворачивается, справа встаёт значок действия, в абзаце подсвечиваются те
 * же слова.
 *
 * Поля: `text`; `actions[]` из `{text, icon}` — дословные куски абзаца по порядку.
 */
const PIPE_HINT = 'Սեղմեք յուրաքանչյուր գործողության վրա։';

export function Pipeline({ block: b, done, onDone, R }) {
  const acts = b.actions || [];
  const [ran, setRan] = useState(() => acts.map(() => !!done));
  const [runs, setRuns] = useState(0);
  const [last, setLast] = useState(null);
  const n = ran.filter(Boolean).length;
  const complete = acts.length > 0 && n === acts.length;
  useDone(complete, onDone);
  const parts = markParts(b.text, acts.map((a) => a.text));

  const run = (i) => {
    setRuns((r) => r + 1);
    setLast(i);
    setRan((s) => (s[i] ? s : s.map((v, k) => v || k === i)));
  };

  return (
    <Frame icon={<Icon name="gear" />} hint={PIPE_HINT} progress={`${n} / ${acts.length}`} done={complete}>
      <p className="ix-text">
        {parts.map((p, k) => (p.i == null ? (
          <Fragment key={k}>{R(p.t)}</Fragment>
        ) : (
          <mark key={k} className={`ix-ice-mark is-top${ran[p.i] ? ' is-on' : ''}`}>{p.t}</mark>
        )))}
      </p>
      <div className="ix-pipe" aria-hidden>
        <span className="ix-pipe-in"><Icon name="user" size={22} /><i /><i /></span>
        <span className={`ix-pipe-belt${runs ? ' is-run' : ''}`} key={`a${runs}`}>
          {runs > 0 && <span className="ix-pipe-pack" />}
        </span>
        <span className="ix-pipe-gear" style={{ '--r': `${runs * 180}deg` }}><Icon name="gear" size={34} strokeWidth={1.6} /></span>
        <span className={`ix-pipe-belt${runs ? ' is-run is-late' : ''}`} key={`b${runs}`}>
          {runs > 0 && <span className="ix-pipe-pack" />}
        </span>
        <span className="ix-pipe-out">
          {last != null && <span key={runs} className="ix-pipe-res"><Icon name={acts[last].icon || 'check'} size={22} /></span>}
        </span>
      </div>
      <div className="ix-pipe-acts">
        {acts.map((a, i) => (
          <button key={i} type="button" className={`ix-pipe-act${ran[i] ? ' is-on' : ''}${last === i ? ' is-last' : ''}`} onClick={() => run(i)}>
            <span className="ix-pipe-act-ico" aria-hidden><Icon name={ran[i] ? 'check' : a.icon || 'gear'} size={16} strokeWidth={ran[i] ? 3 : 1.8} /></span>
            <span>{a.text}</span>
          </button>
        ))}
      </div>
    </Frame>
  );
}

/**
 * `drawers` — шкаф с ящиками (тот же файл, «Զգայուն անձնական տվյալների երեք
 * տեսակ»): строка таблицы — ящик с названием на передней стенке. Нажатие
 * выдвигает ящик, внутри — папки с остальными колонками (заголовок колонки
 * над текстом). Засчитывается, как таблица: открыты все ящики.
 *
 * Поля — как у таблицы: `title`, `head[]`, `rows[][]`.
 */
const DR_HINT = 'Բացեք դարակները։';

export function Drawers({ block: b, done, onDone, R }) {
  const head = b.head || [];
  const rows = b.rows || [];
  const [open, setOpen] = useState(() => rows.map(() => false));
  const [seen, setSeen] = useState(() => rows.map(() => !!done));
  const n = seen.filter(Boolean).length;
  const complete = rows.length > 0 && n === rows.length;
  useDone(complete, onDone);
  const toggle = (i) => {
    setOpen((o) => o.map((v, k) => (k === i ? !v : v)));
    setSeen((s) => (s[i] ? s : s.map((v, k) => v || k === i)));
  };

  return (
    <Frame icon={<Icon name="cabinet" />} title={b.title} hint={complete ? null : DR_HINT} progress={`${n} / ${rows.length}`} done={complete}>
      <div className="ix-cab">
        <span className="ix-cab-top" aria-hidden />
        {rows.map((r, i) => (
          <div key={i} className={`ix-cab-dr${open[i] ? ' is-open' : ''}`}>
            <button type="button" className="ix-cab-front" aria-expanded={open[i]} onClick={() => toggle(i)}>
              <span className="ix-cab-label">{R(r[0])}</span>
              <span className="ix-cab-handle" aria-hidden />
              {seen[i] && <span className="ix-cab-ok" aria-hidden><Icon name="check" size={11} strokeWidth={3.2} /></span>}
            </button>
            <div className="ix-cab-in">
              <div className="ix-cab-inner">
                {r.slice(1).map((cell, k) => (
                  <div key={k} className="ix-cab-file" style={{ '--k': k }}>
                    <span className="ix-kicker">{head[k + 1]}</span>
                    <p>{R(cell)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <span className="ix-cab-feet" aria-hidden><i /><i /></span>
      </div>
    </Frame>
  );
}

/**
 * `audience` — сколько людей видит (тот же файл, «Հանրամատչելի…»): ползунок
 * от нескольких человек до огромной площадки. Вокруг фото прибавляются
 * люди, полоска «վերահսկողություն» (слово абзаца) сжимается и краснеет;
 * слева — абзац про «несколько человек», справа — про платформы. Засчитывается,
 * когда прочитаны оба.
 *
 * Поля: `few`, `many` — абзацы дословно; `gauge` — подпись полоски.
 */
const AUD_HINT = 'Շարժեք սահիչը՝ լսարանը մեծացնելու համար։';
const RINGS = [[58, 8], [92, 14], [126, 18], [158, 22]];
const SPOTS = RINGS.flatMap(([r, c], ring) => Array.from({ length: c }, (_, k) => {
  const a = (k / c) * Math.PI * 2 + ring * 0.4;
  return [200 + Math.cos(a) * r * 1.2, 130 + Math.sin(a) * r * 0.72];
}));

export function Audience({ block: b, done, onDone, R }) {
  const [v, setV] = useState(10);
  const side = v < 50 ? 'few' : 'many';
  const [seen, setSeen] = useState(() => (done ? { few: true, many: true } : { few: true }));
  useEffect(() => { setSeen((s) => (s[side] ? s : { ...s, [side]: true })); }, [side]);
  const complete = !!(seen.few && seen.many);
  useDone(complete, onDone);
  const count = 3 + Math.round((v / 100) * (SPOTS.length - 3));
  const control = 100 - v * 0.9;
  const tone = control > 60 ? 'is-ok' : control > 32 ? 'is-mid' : 'is-low';

  return (
    <Frame icon={<Icon name="crowd" />} hint={AUD_HINT} progress={`${Object.keys(seen).length} / 2`} done={complete}>
      <div className="ix-aud">
        <svg viewBox="0 0 400 260" className="ix-aud-svg" aria-hidden>
          {SPOTS.map(([x, y], k) => (
            <g key={k} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
              <g className={`ix-aud-man${k < count ? ' is-on' : ''}`} style={{ '--k': k % 7 }}>
                <circle cx="0" cy="-6" r="4.6" />
                <path d="M-7.5 7a7.5 7.5 0 0115 0z" />
              </g>
            </g>
          ))}
          <g transform="translate(200 130)">
            <rect x="-30" y="-23" width="60" height="46" rx="6" className="ix-cp-card" />
            <circle cx="16" cy="-11" r="5" className="ix-cp-sun" />
            <path d="M-25 18l18-19 13 12 7-6 15 13" className="ix-cp-hill" />
          </g>
        </svg>
        <div className="ix-mat-range">
          <span className="ix-mat-end" aria-hidden><Icon name="parents" size={20} /></span>
          <input
            type="range"
            min="0"
            max="100"
            value={v}
            onChange={(e) => setV(+e.target.value)}
            className="ix-range"
            style={{ '--v': `${v}%` }}
            aria-label={AUD_HINT}
          />
          <span className="ix-mat-end" aria-hidden><Icon name="crowd" size={22} /></span>
        </div>
        <div className={`ix-aud-gauge ${tone}`}>
          <span className="ix-aud-gauge-l">{b.gauge}</span>
          <span className="ix-aud-bar"><i style={{ width: `${control}%` }} /></span>
        </div>
        <p className="ix-text ix-aud-text" key={side} aria-live="polite">{R(side === 'few' ? b.few : b.many)}</p>
      </div>
    </Frame>
  );
}
