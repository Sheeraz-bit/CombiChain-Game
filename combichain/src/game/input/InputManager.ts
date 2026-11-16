
import type { Vector } from "../types/game.types";
import { ParticleManager } from "../systems/ParticleManager";
import { getAngle, distance } from "../utils/geometry";
import { getBoardCoordinates } from "../utils/coordinates";
import { GameEngine } from "../engine/GameEngine";


const AIM_THRESHOLD = 8;

export class InputManager {
  private particleManager = new ParticleManager();
  private canvas: HTMLCanvasElement | null = null;
  private engine: GameEngine | null = null;

  private pointerId: number | null = null;
  private pointerStart: Vector | null = null;
  private selectedOrigin: Vector | null = null;
  private hasAimed = false;

  attach(canvas: HTMLCanvasElement, engine: GameEngine): void {
    this.detach();

    this.canvas = canvas;
    this.engine = engine;
    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", this.handlePointerDown);
    canvas.addEventListener("pointermove", this.handlePointerMove);
    canvas.addEventListener("pointerup", this.handlePointerUp);
    canvas.addEventListener("pointercancel", this.handlePointerCancel);
    canvas.addEventListener("contextmenu", this.preventContextMenu);
  }

  detach(): void {
    if (this.canvas) {
      this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
      this.canvas.removeEventListener("pointermove", this.handlePointerMove);
      this.canvas.removeEventListener("pointerup", this.handlePointerUp);
      this.canvas.removeEventListener("pointercancel", this.handlePointerCancel);
      this.canvas.removeEventListener("contextmenu", this.preventContextMenu);
    }

    this.resetPointerState();
    this.canvas = null;
    this.engine = null;
  }

  private getBoardPosition(clientX: number, clientY: number): Vector | null {
    if (!this.canvas || !this.engine) return null;

    const board = this.engine.getBoard();
    if (!board) return null;

    return getBoardCoordinates(
      clientX,
      clientY,
      this.canvas,
      board.width,
      board.height
    );
  }

  private handlePointerDown = (event: PointerEvent): void => {
    if (!this.canvas || !this.engine) return;

    const phase = this.engine.getPhase();
    if (phase !== "READY" && phase !== "SELECTED") return;

    const position = this.getBoardPosition(event.clientX, event.clientY);
    const board = this.engine.getBoard();

    if (!position || !board) return;

    const hitParticle = this.particleManager.findParticleAt(
      board,
      position,
      24
    );

    const currentSelection = this.engine.getSelectedParticleId();

    // Tapping another particle changes the selection.
    if (hitParticle && hitParticle.id !== currentSelection) {
      this.engine.selectParticle(hitParticle.id);
    } else if (!currentSelection && hitParticle) {
      this.engine.selectParticle(hitParticle.id);
    }

    const selectedId = this.engine.getSelectedParticleId();
    if (!selectedId) return;

    const selectedParticle = board.particles.find(
      (particle) => particle.id === selectedId
    );

    if (!selectedParticle) return;

    this.pointerId = event.pointerId;
    this.pointerStart = position;
    this.selectedOrigin = {
      x: selectedParticle.x,
      y: selectedParticle.y,
    };
    this.hasAimed = false;

    this.canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  
private handlePointerMove = (event: PointerEvent): void => {
  if (
    !this.canvas ||
    !this.engine ||
    this.pointerId !== event.pointerId ||
    !this.pointerStart ||
    !this.selectedOrigin
  ) {
    return;
  }

  const position = this.getBoardPosition(event.clientX, event.clientY);
  const board = this.engine.getBoard();

  if (!position || !board) return;

  if (distance(this.pointerStart, position) < AIM_THRESHOLD) return;

  const selectedParticle = board.particles.find(
    (particle) => particle.id === this.engine?.getSelectedParticleId()
  );

  const origin = selectedParticle
    ? { x: selectedParticle.x, y: selectedParticle.y }
    : this.selectedOrigin;

  this.selectedOrigin = origin;

  this.engine.setAim(getAngle(origin, position));
  this.hasAimed = true;

  event.preventDefault();
};

private handlePointerUp = (event: PointerEvent): void => {
  if (
    !this.canvas ||
    !this.engine ||
    this.pointerId !== event.pointerId
  ) {
    return;
  }

  if (this.hasAimed) {
    const position = this.getBoardPosition(event.clientX, event.clientY);
    const board = this.engine.getBoard();

    const selectedParticle = board?.particles.find(
      (particle) => particle.id === this.engine?.getSelectedParticleId()
    );

    const origin = selectedParticle
      ? { x: selectedParticle.x, y: selectedParticle.y }
      : this.selectedOrigin;

    if (position && origin) {
      this.engine.trigger(getAngle(origin, position));
    }
  }

  this.releasePointer(event.pointerId);
  this.resetPointerState();
  event.preventDefault();
};


  private handlePointerCancel = (event: PointerEvent): void => {
    if (this.pointerId !== event.pointerId) return;

    this.engine?.setAim(null);
    this.releasePointer(event.pointerId);
    this.resetPointerState();
  };

  private preventContextMenu = (event: Event): void => {
    event.preventDefault();
  };

  private releasePointer(pointerId: number): void {
    if (this.canvas?.hasPointerCapture(pointerId)) {
      this.canvas.releasePointerCapture(pointerId);
    }
  }

  private resetPointerState(): void {
    this.pointerId = null;
    this.pointerStart = null;
    this.selectedOrigin = null;
    this.hasAimed = false;
  }
}
