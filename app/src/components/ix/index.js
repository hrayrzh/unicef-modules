import '../../styles/interactive.css';
import { Deck, Flips, Reveal } from './Cards';
import { Sort } from './Sort';
import { Match, TableGame } from './Grid';
import { Story } from './Story';
import { Devices, PhoneSteps, ScrollShot } from './Devices';
import { Lock, Network, Orb, Timeline } from './Map';
import { Scene } from './Scene';
import { Scratch } from './Scratch';
import { Unfold } from './Unfold';
import { Myths } from './Myths';
import { Curtain } from './Curtain';
import { Spot } from './Spot';
import { Ripple, Trust } from './Talk';
import { Wall } from './Wall';
import { Matrix, Toggles } from './Platforms';
import { Rings } from './Rings';
import { Iceberg } from './Iceberg';
import { Vault } from './Vault';
import { Identity } from './Identity';

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
  scratch: Scratch,
  unfold: Unfold,
  // Модуль 4 — по файлу предложений 4.html.
  curtain: Curtain,
  spot: Spot,
  myths: Myths,
  trust: Trust,
  ripple: Ripple,
  wall: Wall,
  // Модуль 5 — по файлам предложений 5_1.html и 5_2.html.
  matrix: Matrix,
  rings: Rings,
  iceberg: Iceberg,
  toggles: Toggles,
  vault: Vault,
  identity: Identity,
};

/** The component for an interactive block, or null for an ordinary one. */
export function interactiveFor(b) {
  if (b.k === 'table' && b.game) return TableGame;
  return KINDS[b.k] || null;
}
