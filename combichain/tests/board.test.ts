import { describe, expect, it } from "vitest";
import { generateBoard } from "../server/src/game/board.js";
import { CONNECTION_RADIUS, MAX_CONNECTIONS, MIN_PARTICLE_DISTANCE, PARTICLE_COUNT } from "../server/src/game/constants.js";
import { distance } from "../server/src/game/geometry.js";
import { PARTICLE_TYPES } from "../server/src/game/types.js";

describe("generateBoard", () => {
  it("generates the same board for the same seed", () => {
    expect(generateBoard(12345)).toEqual(generateBoard(12345));
  });

  it("generates 24 particles with exactly four of each type", () => {
    const result = generateBoard(2026);
    expect(result.particles).toHaveLength(PARTICLE_COUNT);
    for (const type of PARTICLE_TYPES) {
      expect(result.particles.filter(p => p.type === type)).toHaveLength(4);
    }
  });

  it("keeps particles inside the board and prevents spawn overlap", () => {
    const result = generateBoard(42);
    for (const p of result.particles) {
      expect(p.x).toBeGreaterThanOrEqual(45);
      expect(p.x).toBeLessThanOrEqual(955);
      expect(p.y).toBeGreaterThanOrEqual(45);
      expect(p.y).toBeLessThanOrEqual(655);
    }
    for (let i = 0; i < result.particles.length; i++) {
      for (let j = i + 1; j < result.particles.length; j++) {
        expect(distance(result.particles[i], result.particles[j])).toBeGreaterThanOrEqual(MIN_PARTICLE_DISTANCE);
      }
    }
  });

  it("creates only eligible connections and limits each particle to three", () => {
    const result = generateBoard(9001);
    const degrees = new Map(result.particles.map(p => [p.id, 0]));
    for (const edge of result.connections) {
      const from = result.particles.find(p => p.id === edge.from)!;
      const to = result.particles.find(p => p.id === edge.to)!;
      expect(distance(from, to)).toBeLessThanOrEqual(CONNECTION_RADIUS);
      degrees.set(edge.from, degrees.get(edge.from)! + 1);
      degrees.set(edge.to, degrees.get(edge.to)! + 1);
    }
    for (const degree of degrees.values()) expect(degree).toBeLessThanOrEqual(MAX_CONNECTIONS);
  });
});
