
import {
  PARTICLE_TYPES,
  type Board,
  type Particle,
  type Vector,
} from "../types/game.types";

import { GAME_CONFIG } from "../utils/constants";
import {
  createRandom,
  randomBetween,
  shuffleArray,
} from "../utils/random";

export class BoardManager {
  /**
   * Generate a deterministic board from a seed.
   */
  generateBoard(seed: number): Board {
    const random = createRandom(seed);

    // Create exactly four particles of each type.
    const particleTypes = PARTICLE_TYPES.flatMap((type) =>
      Array.from(
        { length: GAME_CONFIG.PARTICLES_PER_TYPE },
        () => type
      )
    );

    // Shuffle particle types so their order is randomized.
    const shuffledTypes = shuffleArray(particleTypes, random);

    const particles: Particle[] = [];

    for (let i = 0; i < shuffledTypes.length; i++) {
      const position = this.generatePosition(particles, random);
      const speed = randomBetween(
        random,
        GAME_CONFIG.MOVEMENT_SPEED_MIN,
        GAME_CONFIG.MOVEMENT_SPEED_MAX
      );

      const angle = randomBetween(random, 0, Math.PI * 2);

      const velocity: Vector = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      };

      particles.push({
        id: `p${String(i + 1).padStart(2, "0")}`,
        type: shuffledTypes[i],
        x: position.x,
        y: position.y,
        velocity,
        activated: false,
        depth: null,
      });
    }

    return {
      seed,
      width: GAME_CONFIG.BOARD_WIDTH,
      height: GAME_CONFIG.BOARD_HEIGHT,
      connectionRadius: GAME_CONFIG.CONNECTION_RADIUS,
      particles,
      connections: [],
    };
  }

  /**
   * Find a valid spawn position that respects minimum separation.
   */
  private generatePosition(
    existingParticles: Particle[],
    random: () => number
  ): Vector {
    const margin = GAME_CONFIG.SPAWN_MARGIN;
    const minDistance = GAME_CONFIG.MIN_SPAWN_DISTANCE;
    const minDistanceSquared = minDistance * minDistance;

    const maxAttempts = 1000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate: Vector = {
        x: randomBetween(
          random,
          margin,
          GAME_CONFIG.BOARD_WIDTH - margin
        ),
        y: randomBetween(
          random,
          margin,
          GAME_CONFIG.BOARD_HEIGHT - margin
        ),
      };

      const isValid = existingParticles.every((particle) => {
        const dx = candidate.x - particle.x;
        const dy = candidate.y - particle.y;

        return dx * dx + dy * dy >= minDistanceSquared;
      });

      if (isValid) {
        return candidate;
      }
    }

    throw new Error(
      "Unable to generate a valid particle position. Try adjusting the spawn settings."
    );
  }

  /**
   * Move every particle and bounce it off the arena boundaries.
   * deltaTime is measured in seconds.
   */
  update(board: Board, deltaTime: number): void {
    if (!Number.isFinite(deltaTime) || deltaTime <= 0) {
      return;
    }

    const dt = Math.min(deltaTime, 0.05);

    const minX = GAME_CONFIG.SPAWN_MARGIN;
    const maxX = board.width - GAME_CONFIG.SPAWN_MARGIN;
    const minY = GAME_CONFIG.SPAWN_MARGIN;
    const maxY = board.height - GAME_CONFIG.SPAWN_MARGIN;

    for (const particle of board.particles) {
      particle.x += particle.velocity.x * dt;
      particle.y += particle.velocity.y * dt;

      // Horizontal wall collision.
      if (particle.x < minX) {
        particle.x = minX;
        particle.velocity.x = Math.abs(particle.velocity.x);
      } else if (particle.x > maxX) {
        particle.x = maxX;
        particle.velocity.x = -Math.abs(particle.velocity.x);
      }

      // Vertical wall collision.
      if (particle.y < minY) {
        particle.y = minY;
        particle.velocity.y = Math.abs(particle.velocity.y);
      } else if (particle.y > maxY) {
        particle.y = maxY;
        particle.velocity.y = -Math.abs(particle.velocity.y);
      }
    }
  }
}
