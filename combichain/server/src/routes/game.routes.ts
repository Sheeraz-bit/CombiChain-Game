import { Router } from "express";
import { generateBoard } from "../game/board.js";
import { normalizeSeed } from "../game/random.js";
import {
  simulateBoardReaction,
  simulateReaction
} from "../game/simulation.js";
import type { Board, SimulationResult } from "../game/types.js";

export const gameRouter = Router();

const isValidParticleId = (id: unknown): id is string =>
  typeof id === "string" &&
  /^p(0[1-9]|1[0-9]|2[0-4])$/.test(id);

const isValidDirection = (direction: unknown): direction is number =>
  typeof direction === "number" && Number.isFinite(direction);

gameRouter.post("/board", (req, res) => {
  const seed = normalizeSeed(req.body?.seed);
  const board = generateBoard(seed);

  return res.json({
    success: true,
    data: board
  });
});

gameRouter.post("/simulate", (req, res) => {
  const { seed, board, particleId, direction } = req.body ?? {};

  if (!isValidParticleId(particleId)) {
    return res.status(400).json({
      success: false,
      error: "particleId must be a valid ID from p01 to p24."
    });
  }

  if (!isValidDirection(direction)) {
    return res.status(400).json({
      success: false,
      error: "direction must be a finite number in degrees."
    });
  }

  try {
    let result: SimulationResult;

    if (board !== undefined) {
      // Option A: simulate the exact frozen board sent by the frontend.
      if (!board || typeof board !== "object" || Array.isArray(board)) {
        return res.status(400).json({
          success: false,
          error: "board must be a valid board snapshot."
        });
      }

      result = simulateBoardReaction(
        board as Board,
        particleId,
        direction
      );
    } else {
      // Backwards compatibility: regenerate the board from its seed.
      const normalizedSeed = normalizeSeed(seed);

      result = simulateReaction(
        normalizedSeed,
        particleId,
        direction
      );
    }

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error instanceof Error
        ? error.message
        : "Simulation failed."
    });
  }
});