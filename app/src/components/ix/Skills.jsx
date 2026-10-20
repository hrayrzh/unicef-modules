import { Fragment, useEffect, useState } from 'react';
import { Icon } from './icons';
import { F, S } from './art';
import { Frame, markParts, useDone } from './shared';

/**
 * `fork` — развилка (файл «Նոր ինտերակտիվ տարբերակներ», модуль 5, «Գնա
 * դեպի սկզբնաղբյուր…»): на телефоне письмо со ссылкой «смените пароль».
 * Две дороги: по ссылке — поддельная страница, за паролем следит глаз;
 * в настоящее приложение — щит с галочкой. Под сценой — предложения абзаца
 * про выбранную дорогу. Засчитывается, когда пройдены обе.
 *
 * Поля: `title`, `text` — абзац до развилки, `bad[]` / `good[]` —
 * предложения дальше, дословно; `badLabel` / `goodLabel` — слова из абзаца.
 */
const FORK_HINT = 'Փորձեք երկու ճանապարհն էլ։';

export function Fork({ block: b, done, onDone, R }) {
  const [tried, setTried] = useState(() => (done ? { bad: true, good: true } : {}));
  const [cur, setCur] = useState(null);
  const complete = !!(tried.bad && tried.good);
  useDone(complete, onDone);
  const pick = (k) => { setCur(k); setTried((t) => (t[k] ? t : { ...t, [k]: true })); };

  return (
    <Frame icon={<Icon name="fork" />} title={b.title} hint={complete ? null : FORK_HINT} progress={`${Object.keys(tried).length} / 2`} done={complete}>
      <p className="ix-text">{R(b.text)}</p>
      <div className="ix-fork">
        <svg viewBox="0 0 600 214" className="ix-fork-svg" aria-hidden>
          <g className="ix-fork-phone">
            <rect x="258" y="14" width="84" height="170" rx="14" className="ix-fork-body" />
            <path d="M288 26h24" className="ix-fork-ln" />
            <rect x="268" y="46" width="64" height="66" rx="9" className="ix-fork-msg" />
            <path d="M277 60h40M277 70h28" className="ix-fork-ln" />
            <rect x="276" y="84" width="48" height="16" rx="8" className="ix-fork-link" />
            <path d="M291 92h18" className="ix-fork-link-l" />
          </g>
          {tried.bad && (
            <g key="bad" className={`ix-fork-path is-bad${cur === 'bad' ? ' is-cur' : ''}`}>
              <S d="M258 112C226 112 212 132 180 132" className="is-alert is-thick" />
              <F t="rect" x="38" y="80" width="140" height="104" rx="9" at={0.5} className="tone-paper" />
              <S t="rect" x="38" y="80" width="140" height="104" rx="9" at={0.3} />
              <S d="M38 98h140" at={0.5} />
              <S t="rect" x="56" y="122" width="104" height="24" rx="6" at={0.6} />
              {[70, 84, 98, 112, 126].map((x, i) => <S key={x} t="circle" cx={x} cy="134" r="2.6" at={0.8 + i * 0.06} className="is-thick" />)}
              <g className="ix-fork-eye">
                <F d="M84 52c14-16 34-16 48 0-14 16-34 16-48 0z" at={1.1} className="tone-coral" />
                <S d="M84 52c14-16 34-16 48 0-14 16-34 16-48 0z" at={1} className="is-alert" />
                <circle cx="108" cy="52" r="5" className="ix-fork-pupil" />
                <S d="M108 66v12" at={1.3} className="is-alert" />
              </g>
            </g>
          )}
          {tried.good && (
            <g key="good" className={`ix-fork-path is-good${cur === 'good' ? ' is-cur' : ''}`}>
              <S d="M342 112C374 112 388 132 420 132" className="is-accent is-thick" />
              <F t="rect" x="424" y="78" width="110" height="110" rx="26" at={0.5} className="tone-cyan" />
              <S t="rect" x="424" y="78" width="110" height="110" rx="26" at={0.3} />
              <F d="M479 104l26 10v20c0 15-11 26-26 31-15-5-26-16-26-31v-20z" at={0.9} className="tone-paper" />
              <S d="M479 104l26 10v20c0 15-11 26-26 31-15-5-26-16-26-31v-20z" at={0.7} />
              <S d="M467 134l9 9 16-17" at={1.1} className="is-accent is-thick" />
            </g>
          )}
        </svg>
      </div>
      <div className="ix-fork-btns">
        <button type="button" className={`ix-fork-btn is-bad${cur === 'bad' ? ' is-on' : ''}${tried.bad ? ' is-tried' : ''}`} aria-pressed={cur === 'bad'} onClick={() => pick('bad')}>
          <Icon name="link" size={17} />
          <span>{b.badLabel}</span>
        </button>
        <button type="button" className={`ix-fork-btn is-good${cur === 'good' ? ' is-on' : ''}${tried.good ? ' is-tried' : ''}`} aria-pressed={cur === 'good'} onClick={() => pick('good')}>
          <Icon name="phone" size={17} />
          <span>{b.goodLabel}</span>
        </button>
      </div>
      {cur && (
        <div className={`ix-fork-say is-${cur}`} key={cur} aria-live="polite">
          {(cur === 'bad' ? b.bad : b.good || []).map((t, k) => <p key={k}>{R(t)}</p>)}
        </div>
      )}
    </Frame>
  );
}

/**
 * `composer` — пост «соразмерно» (тот же файл, «Գիտակցված հրապարակիր…»,
 * пример с шахматным турниром): слева превью поста — фото кубка, подпись из
 * данных ребёнка, значки «всем / друзьям» и «навсегда / на время»; справа
 * переключатели, всё включено. Выключили лишнее — данные уходят из подписи,
 * значки меняются, и в абзаце проступает ответ, который был размыт. Абзац
 * целиком, порядок предложений тот же.
 *
 * Поля: `text` — абзац; `fields[]` из `{text, kind: "chip" | "public" |
 * "time"}`; `answers[]` из `{text, off[]}` — предложение абзаца и номера
 * переключателей, которые надо выключить, чтобы оно открылось.
 */
const COMP_HINT = 'Անջատեք ավելորդը՝ հրապարակումը համաչափ դարձնելու համար։';

export function Composer({ block: b, done, onDone, R }) {
  const fields = b.fields || [];
  const answers = b.answers || [];
  const [on, setOn] = useState(() => fields.map(() => !done));
  const [rev, setRev] = useState(() => answers.map(() => !!done));
  useEffect(() => {
    setRev((r) => r.map((v, a) => v || (answers[a].off || []).every((i) => !on[i])));
  }, [on]); // eslint-disable-line react-hooks/exhaustive-deps
  const n = rev.filter(Boolean).length;
  const complete = answers.length > 0 && n === answers.length;
  useDone(complete, onDone);
  const flip = (i) => setOn((o) => o.map((v, k) => (k === i ? !v : v)));
  const parts = markParts(b.text, answers.map((a) => a.text));
  const pub = fields.findIndex((f) => f.kind === 'public');
  const time = fields.findIndex((f) => f.kind === 'time');
  const chips = fields.map((f, i) => ({ ...f, i })).filter((f) => f.kind === 'chip');
  const anyChip = chips.some((c) => on[c.i]);

  return (
    <Frame icon={<Icon name="post" />} hint={COMP_HINT} progress={`${n} / ${answers.length}`} done={complete}>
      <p className="ix-text ix-comp-text">
        {parts.map((p, k) => (p.i == null ? (
          <Fragment key={k}>{R(p.t)}</Fragment>
        ) : (
          <span key={k} className={`ix-comp-ans${rev[p.i] ? ' is-on' : ''}`} aria-hidden={!rev[p.i]}>{R(p.t)}</span>
        )))}
      </p>
      <div className="ix-comp">
        <div className="ix-post" aria-hidden>
          <div className="ix-post-head">
            <span className="ix-post-ava"><Icon name="user" size={18} /></span>
            <span className="ix-post-who"><i /><i /></span>
            {pub >= 0 && (
              <span className={`ix-post-badge${on[pub] ? ' is-warn' : ''}`} key={`p${on[pub]}`}>
                <Icon name={on[pub] ? 'globe' : 'parents'} size={16} />
              </span>
            )}
            {time >= 0 && (
              <span className={`ix-post-badge${on[time] ? ' is-warn' : ''}`} key={`t${on[time]}`}>
                <Icon name={on[time] ? 'infinity' : 'clock'} size={16} />
              </span>
            )}
          </div>
          <div className="ix-post-photo">
            <svg viewBox="0 0 200 120">
              <path d="M78 26h44v18a22 22 0 01-44 0z" className="ix-post-cup" />
              <path d="M78 32H66a10 10 0 0012 14M122 32h12a10 10 0 01-12 14" className="ix-post-cupl" />
              <path d="M100 66v14M86 86h28v8H86z" className="ix-post-cupl" />
              <path d="M146 96v-8c0-6 4-8 4-14 0-8-6-12-12-14l-4 6-4-2v8l4 4-6 6v14z" className="ix-post-knight" />
              <path d="M126 96h28" className="ix-post-cupl" />
            </svg>
          </div>
          <div className="ix-post-cap">
            {chips.map((c) => (
              <span key={c.i} className={`ix-post-chip${on[c.i] ? '' : ' is-off'}`}>{c.text}</span>
            ))}
            {!anyChip && <span className="ix-post-lines"><i /><i /></span>}
          </div>
        </div>
        <ul className="ix-tg-list ix-comp-list">
          {fields.map((f, i) => (
            <li key={i}>
              <button type="button" role="switch" aria-checked={on[i]} className={`ix-tg-row${on[i] ? ' is-on' : ''}`} style={{ '--i': i }} onClick={() => flip(i)}>
                <span className="ix-comp-ico" aria-hidden>
                  <Icon name={f.kind === 'public' ? 'globe' : f.kind === 'time' ? 'infinity' : 'idtag'} size={16} />
                </span>
                <span className="ix-tg-text">{f.text}</span>
                <span className="ix-sw" aria-hidden><i /></span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}
