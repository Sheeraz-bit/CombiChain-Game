import type {
  Board,
  GamePhase,
} from "../types/game.types";

import { BoardManager } from "../systems/BoardManager";
import { ConnectionManager } from "../systems/ConnectionManager";
import { ParticleManager } from "../systems/ParticleManager";

import { CanvasRenderer } from "../renderer/CanvasRenderer";
import {
  ReactionEngine,
  type ReactionTimeline,
} from "./ReactionEngine";

import { GAME_CONFIG } from "../utils/constants";

export class GameEngine {
  private boardManager = new BoardManager();
  private connectionManager = new ConnectionManager();
  private particleManager = new ParticleManager();
  private renderer = new CanvasRenderer();
  private reactionEngine = new ReactionEngine();

  private canvas: HTMLCanvasElement | null = null;
  private board: Board | null = null;

  private phase: GamePhase = "LOADING";
  private selectedParticleId: string | null = null;
  private aimDirection: number | null = null;

  private connectionTimer = 0;
  private reactionElapsed = 0;
  private appliedActivationCount = 0;

  private timeline: ReactionTimeline | null = null;
  private score = 0;

  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  initialize(seed = Math.floor(Math.random() * 2 ** 32)): Board {
    this.board = this.boardManager.generateBoard(seed);

    this.particleManager.resetActivationState(this.board);
    this.connectionManager.recalculate(this.board);

    this.phase = "READY";
    this.selectedParticleId = null;
    this.aimDirection = null;

    this.connectionTimer = 0;
    this.reactionElapsed = 0;
    this.appliedActivationCount = 0;
    this.timeline = null;
    this.score = 0;

    return this.board;
  }

  update(deltaTime: number): void {
    if (!this.board || !Number.isFinite(deltaTime) || deltaTime <= 0) {
      return;
    }

    if (this.phase === "READY" || this.phase === "SELECTED" || this.phase === "AIMING") {
      this.boardManager.update(this.board, deltaTime);

      this.connectionTimer += deltaTime;

      if (
        this.connectionTimer >=
        GAME_CONFIG.CONNECTION_UPDATE_INTERVAL / 1000
      ) {
        this.connectionManager.recalculate(this.board);
        this.connectionTimer = 0;
      }

      return;
    }

    if (this.phase !== "REACTION" || !this.timeline) return;

    this.reactionElapsed += Math.min(deltaTime, 0.05);

    while (
      this.appliedActivationCount < this.timeline.activations.length
    ) {
      const activation =
        this.timeline.activations[this.appliedActivationCount];

      if (activation.activatedAt > this.reactionElapsed) break;

      const particle = this.board.particles.find(
        (item) => item.id === activation.particleId
      );

      if (particle) {
        particle.activated = true;
        particle.depth = activation.depth;
        particle.activatedAt = activation.activatedAt;
      }

      this.score += activation.points;
      this.appliedActivationCount++;
    }

    if (
      this.reactionElapsed >= this.timeline.duration &&
      this.appliedActivationCount >= this.timeline.activations.length
    ) {
      this.score =
        this.timeline.score;

      this.phase = "RESULTS";
    }
  }

  render(): void {
    if (!this.canvas || !this.board) return;

    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;

    const rect = this.canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;

    const width = Math.max(1, Math.round(rect.width * pixelRatio));
    const height = Math.max(1, Math.round(rect.height * pixelRatio));

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    this.renderer.render(ctx, this.board, {
      selectedParticleId: this.selectedParticleId,
      aimDirection: this.aimDirection,
      aiming: this.phase === "AIMING",
      elapsedTime: this.reactionElapsed,
    });
  }

  selectParticle(particleId: string | null): void {
    if (!this.board || this.phase !== "READY" && this.phase !== "SELECTED") {
      return;
    }

    if (
      particleId &&
      !this.board.particles.some((particle) => particle.id === particleId)
    ) {
      return;
    }

    this.selectedParticleId = particleId;
    this.phase = particleId ? "SELECTED" : "READY";
    this.aimDirection = null;
  }

  setAim(direction: number | null): void {
    if (this.phase !== "SELECTED" && this.phase !== "AIMING") return;

    this.aimDirection = direction;
    this.phase = direction === null ? "SELECTED" : "AIMING";
  }

  trigger(direction?: number): ReactionTimeline | null {
    if (!this.board || !this.selectedParticleId) return null;

    const finalDirection = direction ?? this.aimDirection;

    if (finalDirection === null) return null;

    // The board is frozen from this point onward.
    const snapshot: Board = {
      ...this.board,
      particles: this.board.particles.map((particle) => ({
        ...particle,
        velocity: { ...particle.velocity },
      })),
      connections: this.board.connections.map((connection) => ({
        ...connection,
      })),
    };

    this.timeline = this.reactionEngine.simulate(
      snapshot,
      this.selectedParticleId,
      finalDirection
    );

    this.phase = "REACTION";
    this.reactionElapsed = 0;
    this.appliedActivationCount = 0;
    this.score = 0;

    this.aimDirection = null;

    return this.timeline;
  }

  getBoard(): Board | null {
    return this.board;
  }

  getPhase(): GamePhase {
    return this.phase;
  }

  getScore(): number {
    return this.score;
  }

  getActivatedCount(): number {
    return this.appliedActivationCount;
  }

  getSelectedParticleId(): string | null {
    return this.selectedParticleId;
  }

  getTimeline(): ReactionTimeline | null {
    return this.timeline;
  }
}