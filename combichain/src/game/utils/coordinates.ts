
import type { Vector } from "../types/game.types";

/**
 * Converts browser pointer coordinates into the board's logical coordinate
 * system. The result remains correct when the canvas is resized.
 */
export function getBoardCoordinates(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  boardWidth: number,
  boardHeight: number
): Vector {
  const rect = canvas.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: ((clientX - rect.left) / rect.width) * boardWidth,
    y: ((clientY - rect.top) / rect.height) * boardHeight,
  };
}
