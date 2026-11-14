export const PARTICLE_TYPES = [
  "SPARK", "BURST", "SPLITTER", "AMPLIFIER", "PRISM", "ECHO"
] as const;

export type ParticleType = typeof PARTICLE_TYPES[number];

export interface Vector {
  x: number;
  y: number;
}

export interface Particle extends Vector {
  id: string;
  type: ParticleType;
  activated: boolean;
  depth: number | null;
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

export interface SimulationRequest {
  seed: number;
  particleId: string;
  direction: number;
}

export interface Activation {
  particleId: string;
  type: ParticleType;
  depth: number;
  activatedAt: number;
  points: number;
  multiplier: number;
}

export interface SimulationResult {
  seed: number;
  initialParticleId: string;
  direction: number;
  activations: Activation[];
  score: number;
  varietyBonus: number;
  perfectChainBonus: number;
  activatedCount: number;
  maxDepth: number;
  longestChain: number;
  activatedTypes: ParticleType[];
  duration: number;
}
