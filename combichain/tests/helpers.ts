import type { Board, Particle, ParticleType } from "../server/src/game/types.js";

export function particle(id: string, type: ParticleType, x: number, y: number): Particle {
  return { id, type, x, y, activated: false, depth: null };
}

export function board(particles: Particle[], pairs: Array<[string, string]>): Board {
  const byId = new Map(particles.map(p => [p.id, p]));
  return {
    seed: 77,
    width: 1000,
    height: 700,
    connectionRadius: 126,
    particles,
    connections: pairs.map(([from, to]) => ({
      from,
      to,
      distance: Math.hypot(byId.get(to)!.x - byId.get(from)!.x, byId.get(to)!.y - byId.get(from)!.y)
    }))
  };
}
