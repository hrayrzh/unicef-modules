import '../../styles/interactive.css';
import { Deck, Flips, Reveal } from './Cards';
import { Sort } from './Sort';
import { Match, TableGame } from './Grid';
import { Story } from './Story';
import { Devices, PhoneSteps, ScrollShot } from './Devices';
import { Lock, Network, Orb, Timeline } from './Map';
import { Scene } from './Scene';

// Интерактивные блоки (модуль 2, по предложениям из «Մոդուլ 2 _որոշ
// առաջարկություններ.html»). Тексты в них — те же абзацы документа, блок
// меняет только подачу. Каждый получает `block`, `done` (пройден ли уже,
// из стора), `onDone` (засчитать) и `R` (разметка внутри строк).
const KINDS = {
  reveal: Reveal,
  flips: Flips,
  deck: Deck,
  sort: Sort,
  match: Match,
  story: Story,
  orb: Orb,
  phoneSteps: PhoneSteps,
  devices: Devices,
  scrollshot: ScrollShot,
  network: Network,
  timeline: Timeline,
  lock: Lock,
  scene: Scene,
};

/** The component for an interactive block, or null for an ordinary one. */
export function interactiveFor(b) {
  if (b.k === 'table' && b.game) return TableGame;
  return KINDS[b.k] || null;
}
