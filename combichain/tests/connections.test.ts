import { describe, expect, it } from "vitest";
import { angleBetween, angleDifference, degreesToRadians, distance, normalizeAngle } from "../server/src/game/geometry.js";

describe("geometry helpers", () => {
  it("calculates Euclidean distance", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it("returns the direction from one point to another", () => {
    expect(angleBetween({ x: 0, y: 0 }, { x: 0, y: 10 })).toBeCloseTo(Math.PI / 2);
  });

  it("normalizes negative and oversized angles", () => {
    expect(normalizeAngle(degreesToRadians(-90))).toBeCloseTo(degreesToRadians(270));
    expect(normalizeAngle(degreesToRadians(450))).toBeCloseTo(degreesToRadians(90));
  });

  it("calculates the shortest angular difference across zero", () => {
    expect(angleDifference(degreesToRadians(350), degreesToRadians(10))).toBeCloseTo(degreesToRadians(20));
  });
});
