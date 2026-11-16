import type {
  Board,
  Particle,
  Vector,
} from "../types/game.types";

import {
  PARTICLE_CONFIG,
  GAME_CONFIG,
} from "../utils/constants";

import { getDirectionVector } from "../utils/geometry";

export interface RenderOptions {
  selectedParticleId?: string | null;
  aimDirection?: number | null;
  aiming?: boolean;
  elapsedTime?: number;
}

export class CanvasRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    board: Board,
    options: RenderOptions = {}
  ): void {
    const canvas = ctx.canvas;

    const scale = Math.min(
      canvas.width / board.width,
      canvas.height / board.height
    );

    const offsetX = (canvas.width - board.width * scale) / 2;
    const offsetY = (canvas.height - board.height * scale) / 2;

    ctx.save();
    ctx.setTransform(
      scale,
      0,
      0,
      scale,
      offsetX,
      offsetY
    );

    this.drawBackground(ctx, board);
    this.drawConnections(ctx, board);
    this.drawAim(ctx, board, options);
    this.drawParticles(ctx, board, options);

    ctx.restore();
  }

  private drawBackground(
    ctx: CanvasRenderingContext2D,
    board: Board
  ): void {
    ctx.clearRect(0, 0, board.width, board.height);

    ctx.fillStyle = "#080e18";
    ctx.fillRect(0, 0, board.width, board.height);

    ctx.save();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.055)";
    ctx.lineWidth = 1;

    const gridSize = 35;

    for (let x = 0; x <= board.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, board.height);
      ctx.stroke();
    }

    for (let y = 0; y <= board.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(board.width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawConnections(
    ctx: CanvasRenderingContext2D,
    board: Board
  ): void {
    const particleMap = new Map(
      board.particles.map((particle) => [particle.id, particle])
    );

    ctx.save();
    ctx.lineWidth = 1.5;

    for (const connection of board.connections) {
      const from = particleMap.get(connection.from);
      const to = particleMap.get(connection.to);

      if (!from || !to) continue;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);

      ctx.strokeStyle = "rgba(125, 170, 205, 0.22)";
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawParticles(
    ctx: CanvasRenderingContext2D,
    board: Board,
    options: RenderOptions
  ): void {
    for (const particle of board.particles) {
      const selected = particle.id === options.selectedParticleId;

      this.drawParticle(ctx, particle, selected);
    }
  }

  private drawParticle(
    ctx: CanvasRenderingContext2D,
    particle: Particle,
    selected: boolean
  ): void {
    const config = PARTICLE_CONFIG[particle.type];
    const radius = GAME_CONFIG.PARTICLE_RADIUS;

    ctx.save();
    ctx.translate(particle.x, particle.y);

    if (selected) {
      ctx.beginPath();
      ctx.arc(0, 0, radius + 9, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.shadowColor = config.color;
    ctx.shadowBlur = particle.activated ? 24 : 12;

    ctx.fillStyle = config.color;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;

    switch (particle.type) {
      case "SPARK":
        this.drawCircle(ctx, radius);
        break;

      case "BURST":
        this.drawStar(ctx, radius, 8);
        break;

      case "SPLITTER":
        this.drawPolygon(ctx, radius + 2, 3, -Math.PI / 2);
        break;

      case "AMPLIFIER":
        this.drawPolygon(ctx, radius + 1, 6, -Math.PI / 6);
        break;

      case "PRISM":
        this.drawDiamond(ctx, radius + 2);
        break;

      case "ECHO":
        this.drawEcho(ctx, radius);
        break;
    }

    ctx.restore();
  }

  private drawCircle(
    ctx: CanvasRenderingContext2D,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private drawPolygon(
    ctx: CanvasRenderingContext2D,
    radius: number,
    sides: number,
    rotation = 0
  ): void {
    ctx.beginPath();

    for (let i = 0; i < sides; i++) {
      const angle = rotation + (i * Math.PI * 2) / sides;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    radius: number,
    points: number
  ): void {
    ctx.beginPath();

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const r = i % 2 === 0 ? radius : radius * 0.48;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawDiamond(
    ctx: CanvasRenderingContext2D,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(radius * 0.75, 0);
    ctx.lineTo(0, radius);
    ctx.lineTo(-radius * 0.75, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawEcho(
    ctx: CanvasRenderingContext2D,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.52, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private drawAim(
    ctx: CanvasRenderingContext2D,
    board: Board,
    options: RenderOptions
  ): void {
    if (!options.aiming || options.aimDirection == null) return;

    const particle = board.particles.find(
      (item) => item.id === options.selectedParticleId
    );

    if (!particle) return;

    const direction = getDirectionVector(options.aimDirection);
    const length = 90;

    const end: Vector = {
      x: particle.x + direction.x * length,
      y: particle.y + direction.y * length,
    };

    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 6]);

    ctx.beginPath();
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(end.x, end.y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}