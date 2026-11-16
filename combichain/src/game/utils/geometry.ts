
import type { Vector } from "../types/game.types";

export function distance(a: Vector, b: Vector): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  return Math.sqrt(dx * dx + dy * dy);
}

export function distanceSquared(a: Vector, b: Vector): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  return dx * dx + dy * dy;
}

export function getAngle(from: Vector, to: Vector): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  return normalizeAngle(
    (Math.atan2(dy, dx) * 180) / Math.PI
  );
}

export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export function angleDifference(a: number, b: number): number {
  const difference = Math.abs(
    normalizeAngle(a) - normalizeAngle(b)
  );

  return Math.min(difference, 360 - difference);
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function getDirectionVector(angle: number): Vector {
  const radians = degreesToRadians(angle);

  return {
    x: Math.cos(radians),
    y: Math.sin(radians),
  };
}

export function addVectors(a: Vector, b: Vector): Vector {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

export function scaleVector(vector: Vector, scalar: number): Vector {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar,
  };
}

export function dotProduct(a: Vector, b: Vector): number {
  return a.x * b.x + a.y * b.y;
}
