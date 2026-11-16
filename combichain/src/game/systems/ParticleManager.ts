import type { Board, Particle, Vector } from "../types/game.types";
import { GAME_CONFIG } from "../utils/constants";
import { distanceSquared } from "../utils/geometry";

export class ParticleManager {
  update(board: Board, deltaTime: number): void {
    if (!Number.isFinite(deltaTime) || deltaTime <= 0) return;

    const dt = Math.min(deltaTime, 0.05);
    const margin = GAME_CONFIG.SPAWN_MARGIN;

    const minX = margin;
    const maxX = board.width - margin;
    const minY = margin;
    const maxY = board.height - margin;

    for (const particle of board.particles) {
      particle.x += particle.velocity.x * dt;
      particle.y += particle.velocity.y * dt;

      if (particle.x <= minX) {
        particle.x = minX;
        particle.velocity.x = Math.abs(particle.velocity.x);
      } else if (particle.x >= maxX) {
        particle.x = maxX;
        particle.velocity.x = -Math.abs(particle.velocity.x);
      }

      if (particle.y <= minY) {
        particle.y = minY;
        particle.velocity.y = Math.abs(particle.velocity.y);
      } else if (particle.y >= maxY) {
        particle.y = maxY;
        particle.velocity.y = -Math.abs(particle.velocity.y);
      }
    }
  }

  findParticleAt(
    board: Board,
    position: Vector,
    hitRadius = 24
  ): Particle | null {
    const hitRadiusSquared = hitRadius * hitRadius;

    // Search from the visually topmost particle.
    for (let i = board.particles.length - 1; i >= 0; i--) {
      const particle = board.particles[i];

      if (distanceSquared(particle, position) <= hitRadiusSquared) {
        return particle;
      }
    }

    return null;
  }

  resetActivationState(board: Board): void {
    for (const particle of board.particles) {
      particle.activated = false;
      particle.depth = null;
      delete particle.activatedAt;
    }
  }
}