import { LOGOS } from '../data/logos';
import { platformOf } from '../guideSim';

/**
 * Плитка с логотипом платформы для шапки гайда — как иконка приложения на
 * телефоне: фирменный цвет фона, белый глиф. Платформа выводится из названия
 * гайда тем же `platformOf`, что и у симулятора, поэтому отдельного поля в
 * данных нет и логотип не может разойтись с содержимым.
 *
 * `platformOf` по умолчанию отвечает «ios» на незнакомое название — для
 * симулятора это безобидно, а здесь дало бы чужой логотип. Поэтому Apple
 * показывается только когда название действительно про Apple.
 */
export default function PlatformLogo({ name = '', size = 26 }) {
  const platform = platformOf(name);
  if (platform === 'ios' && !/iphone|ipad|ios/i.test(name)) return null;
  const logo = LOGOS[platform];
  if (!logo) return null;
  return (
    <span
      role="img"
      aria-label={logo.title}
      title={logo.title}
      style={{
        flexShrink: 0, width: size, height: size, borderRadius: Math.round(size * 0.3),
        background: logo.color, display: 'grid', placeItems: 'center',
        boxShadow: 'inset 0 0 0 1px rgba(21,26,33,.08)',
      }}
    >
      <svg viewBox="0 0 24 24" width={Math.round(size * 0.62)} height={Math.round(size * 0.62)} fill={logo.fg} aria-hidden="true">
        <path d={logo.d} />
      </svg>
    </span>
  );
}
