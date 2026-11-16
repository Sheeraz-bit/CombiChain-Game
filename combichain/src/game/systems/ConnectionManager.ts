import type { Board, Connection, Particle } from "../types/game.types";
import { GAME_CONFIG } from "../utils/constants";
import { distance } from "../utils/geometry";

export class ConnectionManager {
  recalculate(board: Board): Connection[] {
    const candidates: Connection[] = [];

    for (let i = 0; i < board.particles.length; i++) {
      for (let j = i + 1; j < board.particles.length; j++) {
        const a = board.particles[i];
        const b = board.particles[j];
        const d = distance(a, b);

        if (d <= board.connectionRadius) {
          candidates.push({
            from: a.id,
            to: b.id,
            distance: d,
          });
        }
      }
    }

    candidates.sort(
      (a, b) =>
        a.distance - b.distance ||
        a.from.localeCompare(b.from) ||
        a.to.localeCompare(b.to)
    );

    const degrees = new Map<string, number>();
    const accepted: Connection[] = [];

    for (const particle of board.particles) {
      degrees.set(particle.id, 0);
    }

    for (const candidate of candidates) {
      const fromDegree = degrees.get(candidate.from) ?? 0;
      const toDegree = degrees.get(candidate.to) ?? 0;

      if (
        fromDegree >= GAME_CONFIG.MAX_CONNECTIONS ||
        toDegree >= GAME_CONFIG.MAX_CONNECTIONS
      ) {
        continue;
      }

      accepted.push(candidate);
      degrees.set(candidate.from, fromDegree + 1);
      degrees.set(candidate.to, toDegree + 1);
    }

    board.connections = accepted;
    return accepted;
  }

  getNeighbours(board: Board, particleId: string): Particle[] {
    const neighbourIds = board.connections
      .filter(
        (connection) =>
          connection.from === particleId ||
          connection.to === particleId
      )
      .map((connection) =>
        connection.from === particleId
          ? connection.to
          : connection.from
      );

    return neighbourIds
      .map((id) => board.particles.find((particle) => particle.id === id))
      .filter((particle): particle is Particle => particle !== undefined);
  }
}