import { describe, expect, it } from "vitest";
import { simulateBoardReaction } from "../server/src/game/simulation.js";
import { board, particle } from "./helpers.js";

describe("particle reactions on a supplied board snapshot", () => {
  it("Spark activates the nearest connected target in its heading cone", () => {
    const snapshot = board([
      particle("p01", "SPARK", 100, 100),
      particle("p02", "BURST", 150, 100),
      particle("p03", "PRISM", 100, 155)
    ], [["p01", "p02"], ["p01", "p03"]]);
    const result = simulateBoardReaction(snapshot, "p01", 0);
    expect(result.activations.map(a => a.particleId)).toEqual(["p01", "p02"]);
  });

  it("Burst emits to up to three nearest connected neighbours", () => {
    const snapshot = board([
      particle("p01", "BURST", 300, 300),
      particle("p02", "SPARK", 340, 300),
      particle("p03", "PRISM", 300, 350),
      particle("p04", "ECHO", 250, 300),
      particle("p05", "AMPLIFIER", 500, 500)
    ], [["p01", "p02"], ["p01", "p03"], ["p01", "p04"]]);
    const result = simulateBoardReaction(snapshot, "p01", 0);
    expect(result.activatedCount).toBe(4);
    expect(new Set(result.activations.map(a => a.particleId))).toEqual(new Set(["p01", "p02", "p03", "p04"]));
  });


  it("Splitter emits along its forward and two 45-degree branches", () => {
    const snapshot = board([
      particle("p01", "SPLITTER", 200, 200),
      particle("p02", "SPARK", 250, 200),
      particle("p03", "BURST", 235, 165),
      particle("p04", "PRISM", 235, 235)
    ], [["p01", "p02"], ["p01", "p03"], ["p01", "p04"]]);
    const result = simulateBoardReaction(snapshot, "p01", 0);
    expect(new Set(result.activations.map(a => a.particleId))).toEqual(new Set(["p01", "p02", "p03", "p04"]));
  });

  it("Amplifier can reach an unconnected particle within 1.5 times the snapshot radius", () => {
    const snapshot = board([
      particle("p01", "AMPLIFIER", 100, 100),
      particle("p02", "SPARK", 250, 100)
    ], []);
    const result = simulateBoardReaction(snapshot, "p01", 0);
    expect(result.activations.map(a => a.particleId)).toEqual(["p01", "p02"]);
  });

  it("Prism redirects its outgoing pulse 60 degrees clockwise", () => {
    const snapshot = board([
      particle("p01", "PRISM", 100, 100),
      particle("p02", "SPARK", 125, 143.3),
      particle("p03", "BURST", 150, 100)
    ], [["p01", "p02"], ["p01", "p03"]]);
    const result = simulateBoardReaction(snapshot, "p01", 0);
    expect(result.activations.map(a => a.particleId)).toEqual(["p01", "p02"]);
  });

  it("uses the supplied snapshot positions instead of regenerating from its seed", () => {
    const snapshot = board([
      particle("p01", "SPARK", 100, 100),
      particle("p02", "BURST", 100, 160)
    ], [["p01", "p02"]]);
    const result = simulateBoardReaction(snapshot, "p01", 90);
    expect(result.activatedCount).toBe(2);
    expect(result.seed).toBe(77);
  });

  it("includes the arrival time of a delayed Echo pulse even if its target already activated", () => {
    const snapshot = board([
      particle("p01", "ECHO", 100, 100),
      particle("p02", "SPARK", 150, 100),
      particle("p03", "BURST", 200, 100)
    ], [["p01", "p02"], ["p01", "p03"], ["p02", "p03"]]);
    const result = simulateBoardReaction(snapshot, "p01", 0);
    expect(result.activations.map(a => a.particleId)).toEqual(["p01", "p02", "p03"]);
    expect(result.duration).toBeCloseTo(0.938, 3);
  });

  it("does not mutate the caller's board snapshot", () => {
    const snapshot = board([
      particle("p01", "SPARK", 100, 100),
      particle("p02", "BURST", 150, 100)
    ], [["p01", "p02"]]);
    const before = structuredClone(snapshot);
    simulateBoardReaction(snapshot, "p01", 0);
    expect(snapshot).toEqual(before);
  });

  it("rejects an unknown initial particle", () => {
    const snapshot = board([particle("p01", "SPARK", 100, 100)], []);
    expect(() => simulateBoardReaction(snapshot, "p99", 0)).toThrow(/does not exist/);
  });
});
