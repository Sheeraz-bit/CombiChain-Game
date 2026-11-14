import type { Vector } from "./types.js";

export const distance = (a: Vector, b: Vector): number =>
  Math.hypot(b.x - a.x, b.y - a.y);

export const angleBetween = (a: Vector, b: Vector): number =>
  Math.atan2(b.y - a.y, b.x - a.x);

export const normalizeAngle = (angle: number): number => {
  let result = angle % (Math.PI * 2);
  if (result < 0) result += Math.PI * 2;
  return result;
};

export const angleDifference = (a: number, b: number): number => {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, Math.PI * 2 - diff);
};

export const degreesToRadians = (degrees: number): number => degrees * Math.PI / 180;
