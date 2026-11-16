
export const PARTICLE_TYPES = [
  "SPARK",
  "BURST",
  "SPLITTER",
  "AMPLIFIER",
  "PRISM",
  "ECHO",
] as const;

export type ParticleType = (typeof PARTICLE_TYPES)[number];

export interface Vector {
  x: number;
  y: number;
}

export interface Particle extends Vector {
  id: string;
  type: ParticleType;

  // Movement
  velocity: Vector;

  // Reaction state
  activated: boolean;
  depth: number | null;
  activatedAt?: number;
}

export interface Connection {
  from: string;
  to: string;
  distance: number;
}

export interface Board {
  seed: number;
  width: number;
  height: number;
  connectionRadius: number;
  particles: Particle[];
  connections: Connection[];
}

export type GamePhase =
  | "LOADING"
  | "READY"
  | "SELECTED"
  | "AIMING"
  | "REACTION"
  | "RESULTS";

export interface AimState {
  particleId: string | null;
  start: Vector | null;
  current: Vector | null;
  direction: number;
}

export interface GameState {
  phase: GamePhase;
  board: Board | null;
  selectedParticleId: string | null;
  aim: AimState;
  score: number;
  activatedCount: number;
}
