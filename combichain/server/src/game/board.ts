import {
  BOARD_HEIGHT, BOARD_WIDTH, CONNECTION_RADIUS, MAX_CONNECTIONS,
  MIN_PARTICLE_DISTANCE, PARTICLE_COUNT
} from "./constants.js";
import { distance } from "./geometry.js";
import { createRandom } from "./random.js";
import { PARTICLE_TYPES, type Board, type Connection, type Particle, type ParticleType } from "./types.js";

const EDGE_MARGIN = 45;
const MAX_PLACEMENT_ATTEMPTS = 500;

export function generateBoard(seed: number): Board {
  const random = createRandom(seed);
  const types: ParticleType[] = PARTICLE_TYPES.flatMap(type => [type, type, type, type]);

  // Seeded Fisher-Yates shuffle: exactly four of each particle type.
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }

  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let position: { x: number; y: number } | undefined;

    // Rejection sampling prevents visually overlapping spawn positions while
    // keeping board generation deterministic for a given seed.
    for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
      const candidate = {
        x: EDGE_MARGIN + random() * (BOARD_WIDTH - EDGE_MARGIN * 2),
        y: EDGE_MARGIN + random() * (BOARD_HEIGHT - EDGE_MARGIN * 2)
      };
      if (particles.every(p => distance(p, candidate) >= MIN_PARTICLE_DISTANCE)) {
        position = candidate;
        break;
      }
    }

    if (!position) {
      throw new Error(`Unable to place particle ${i + 1} without overlap for seed ${seed}.`);
    }

    particles.push({
      id: `p${String(i + 1).padStart(2, "0")}`,
      type: types[i],
      ...position,
      activated: false,
      depth: null
    });
  }

  // Build a deterministic, undirected graph. Closest eligible pairs are
  // considered first; each particle can have at most three connections.
  const candidates: Connection[] = [];
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const d = distance(particles[i], particles[j]);
      if (d <= CONNECTION_RADIUS) {
        candidates.push({ from: particles[i].id, to: particles[j].id, distance: Number(d.toFixed(3)) });
      }
    }
  }
  candidates.sort((a, b) => a.distance - b.distance || a.from.localeCompare(b.from) || a.to.localeCompare(b.to));

  const degree = new Map(particles.map(p => [p.id, 0]));
  const connections: Connection[] = [];
  for (const edge of candidates) {
    if ((degree.get(edge.from) ?? 0) >= MAX_CONNECTIONS) continue;
    if ((degree.get(edge.to) ?? 0) >= MAX_CONNECTIONS) continue;
    connections.push(edge);
    degree.set(edge.from, (degree.get(edge.from) ?? 0) + 1);
    degree.set(edge.to, (degree.get(edge.to) ?? 0) + 1);
  }

  return {
    seed,
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    connectionRadius: CONNECTION_RADIUS,
    particles,
    connections
  };
}
