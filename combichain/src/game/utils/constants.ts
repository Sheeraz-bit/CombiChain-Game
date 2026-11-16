
import type { ParticleType } from "../types/game.types";

export const GAME_CONFIG = {
  BOARD_WIDTH: 1000,
  BOARD_HEIGHT: 700,

  PARTICLE_COUNT: 24,
  PARTICLES_PER_TYPE: 4,

  CONNECTION_RADIUS: 126,
  MAX_CONNECTIONS: 3,

  PARTICLE_RADIUS: 13,
  MIN_SPAWN_DISTANCE: 30,
  SPAWN_MARGIN: 45,

  MOVEMENT_SPEED_MIN: 35,
  MOVEMENT_SPEED_MAX: 75,

  WALL_BOUNCE_DAMPING: 1,
  CONNECTION_UPDATE_INTERVAL: 250,
} as const;

export const PARTICLE_CONFIG: Record<
  ParticleType,
  {
    color: string;
    basePoints: number;
    label: string;
  }
> = {
  SPARK: {
    color: "#38BDF8",
    basePoints: 100,
    label: "Spark",
  },
  BURST: {
    color: "#FB7185",
    basePoints: 150,
    label: "Burst",
  },
  SPLITTER: {
    color: "#A78BFA",
    basePoints: 125,
    label: "Splitter",
  },
  AMPLIFIER: {
    color: "#FBBF24",
    basePoints: 175,
    label: "Amplifier",
  },
  PRISM: {
    color: "#2DD4BF",
    basePoints: 125,
    label: "Prism",
  },
  ECHO: {
    color: "#F472B6",
    basePoints: 150,
    label: "Echo",
  },
};

export const REACTION_CONFIG = {
  PULSE_SPEED: 420,
  MAX_DURATION: 12,
  ECHO_DELAY: 0.7,

  SPLITTER_ANGLE: 45,
  PRISM_ROTATION: 60,
  AMPLIFIER_RANGE_MULTIPLIER: 1.5,
} as const;
