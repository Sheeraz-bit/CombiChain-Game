import { describe, expect, it } from "vitest";
import { BASE_POINTS, getComboMultiplier } from "../server/src/game/constants.js";
import { simulateBoardReaction } from "../server/src/game/simulation.js";
import { board, particle } from "./helpers.js";

describe("scoring rules", () => {
  it("uses the specified base points for all particle types", () => {
    expect(BASE_POINTS).toEqual({ SPARK: 100, BURST: 150, SPLITTER: 125, AMPLIFIER: 175, PRISM: 125, ECHO: 150 });
  });

  it("uses the correct combo thresholds", () => {
    expect([1, 4, 5, 8, 9, 12, 13, 16, 17, 24].map(getComboMultiplier)).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });

  it("awards base points and the variety bonus on a one-particle snapshot", () => {
    const snapshot = board([particle("p01", "SPARK", 100, 100)], []);
    const result = simulateBoardReaction(snapshot, "p01", 0);
    expect(result.activations[0].points).toBe(100);
    expect(result.score).toBe(100);
    expect(result.varietyBonus).toBe(0);
    expect(result.perfectChainBonus).toBe(0);
  });

  it("adds the depth bonus and variety bonus to a two-particle chain", () => {
    const snapshot = board([
      particle("p01", "SPARK", 100, 100),
      particle("p02", "PRISM", 150, 100)
    ], [["p01", "p02"]]);
    const result = simulateBoardReaction(snapshot, "p01", 0);
    expect(result.activations.map(a => a.points)).toEqual([100, 150]);
    expect(result.varietyBonus).toBe(50);
    expect(result.score).toBe(300);
  });
});
