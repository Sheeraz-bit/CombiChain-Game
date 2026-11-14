import type { ParticleType } from "./types.js";

export const BOARD_WIDTH = 1000;
export const BOARD_HEIGHT = 700;
export const PARTICLE_COUNT = 24;
export const CONNECTION_RADIUS = Math.min(BOARD_WIDTH, BOARD_HEIGHT) * 0.18;
export const MAX_CONNECTIONS = 3;
export const MIN_PARTICLE_DISTANCE = 30;
export const PULSE_SPEED = 420;
export const MAX_REACTION_SECONDS = 12;

export const BASE_POINTS: Record<ParticleType, number> = {
  SPARK: 100,
  BURST: 150,
  SPLITTER: 125,
  AMPLIFIER: 175,
  PRISM: 125,
  ECHO: 150
};

export function getComboMultiplier(activationCount: number): number {
  if (activationCount >= 17) return 5;
  if (activationCount >= 13) return 4;
  if (activationCount >= 9) return 3;
  if (activationCount >= 5) return 2;
  return 1;
}
