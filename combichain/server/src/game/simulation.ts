import {
  BASE_POINTS, MAX_REACTION_SECONDS, PARTICLE_COUNT, PULSE_SPEED
} from "./constants.js";
import { angleBetween, angleDifference, degreesToRadians, distance, normalizeAngle } from "./geometry.js";
import { generateBoard } from "./board.js";
import { getComboMultiplier } from "./constants.js";
import type { Activation, Board, Particle, ParticleType, SimulationResult } from "./types.js";

interface PulseEvent {
  targetId: string;
  angle: number;
  arrival: number;
  depth: number;
  order: number;
}

interface Emission {
  target: Particle;
  delay?: number;
}

function neighbours(board: Board, particle: Particle, amplifier = false): Particle[] {
  const connectedIds = new Set<string>();
  for (const edge of board.connections) {
    if (edge.from === particle.id) connectedIds.add(edge.to);
    if (edge.to === particle.id) connectedIds.add(edge.from);
  }

  return board.particles.filter(candidate => {
    if (candidate.id === particle.id) return false;
    const d = distance(particle, candidate);
    return amplifier
      ? d <= board.connectionRadius * 1.5
      : connectedIds.has(candidate.id);
  }).sort((a, b) =>
    distance(particle, a) - distance(particle, b) || a.id.localeCompare(b.id)
  );
}

function inDirection(origin: Particle, candidates: Particle[], heading: number, coneDegrees: number): Particle[] {
  const cone = degreesToRadians(coneDegrees);
  return candidates.filter(candidate =>
    angleDifference(angleBetween(origin, candidate), heading) <= cone
  );
}

function chooseEmissions(board: Board, particle: Particle, incomingAngle: number): Emission[] {
  const heading = normalizeAngle(incomingAngle);
  const normal = neighbours(board, particle);
  const amplifierCandidates = neighbours(board, particle, true);

  switch (particle.type) {
    case "SPARK": {
      const eligible = inDirection(particle, normal, heading, 35);
      return eligible.length ? [{ target: eligible[0] }] : [];
    }
    case "BURST":
      return normal.slice(0, 3).map(target => ({ target }));
    case "SPLITTER": {
      const directions = [heading, heading - degreesToRadians(45), heading + degreesToRadians(45)];
      const chosen = new Map<string, Particle>();
      for (const dir of directions) {
        const eligible = inDirection(particle, normal, normalizeAngle(dir), 24);
        if (eligible[0]) chosen.set(eligible[0].id, eligible[0]);
      }
      return [...chosen.values()].map(target => ({ target }));
    }
    case "AMPLIFIER": {
      const eligible = inDirection(particle, amplifierCandidates, heading, 45);
      return eligible.slice(0, 2).map(target => ({ target }));
    }
    case "PRISM": {
      const redirected = normalizeAngle(heading + degreesToRadians(60));
      const eligible = inDirection(particle, normal, redirected, 30);
      return eligible.length ? [{ target: eligible[0] }] : [];
    }
    case "ECHO": {
      const eligible = inDirection(particle, normal, heading, 35);
      if (!eligible.length) return [];
      const emissions: Emission[] = [{ target: eligible[0] }];
      if (eligible[1]) emissions.push({ target: eligible[1], delay: 0.7 });
      return emissions;
    }
  }
}

function validateBoard(board: Board): void {
  if (!board || !Array.isArray(board.particles) || !Array.isArray(board.connections)) {
    throw new Error("A valid board with particles and connections is required.");
  }
  if (!Number.isFinite(board.width) || !Number.isFinite(board.height) || board.width <= 0 || board.height <= 0) {
    throw new Error("Board width and height must be positive finite numbers.");
  }
  const ids = new Set<string>();
  for (const particle of board.particles) {
    if (!particle.id || ids.has(particle.id)) throw new Error("Board particle IDs must be unique and non-empty.");
    if (!Number.isFinite(particle.x) || !Number.isFinite(particle.y)) throw new Error(`Particle '${particle.id}' has invalid coordinates.`);
    ids.add(particle.id);
  }
  for (const edge of board.connections) {
    if (!ids.has(edge.from) || !ids.has(edge.to) || edge.from === edge.to) {
      throw new Error("Board connections must reference two different existing particles.");
    }
  }
}

/** Simulates the exact frozen board snapshot supplied by the caller. */
export function simulateBoardReaction(boardSnapshot: Board, particleId: string, directionDegrees: number): SimulationResult {
  validateBoard(boardSnapshot);
  if (!Number.isFinite(directionDegrees)) throw new Error("Direction must be a finite number of degrees.");

  // Clone all simulation state so the caller's frozen/rendered board is never mutated.
  const board: Board = {
    ...boardSnapshot,
    particles: boardSnapshot.particles.map(p => ({ ...p, activated: false, depth: null })),
    connections: boardSnapshot.connections.map(edge => ({ ...edge }))
  };
  const particles = new Map(board.particles.map(p => [p.id, p]));
  const initial = particles.get(particleId);
  if (!initial) throw new Error(`Particle '${particleId}' does not exist on this board.`);

  const queue: PulseEvent[] = [];
  let eventOrder = 0;
  const activations: Activation[] = [];
  const activatedTypes = new Set<ParticleType>();
  let score = 0;
  let currentTime = 0;

  const pushEmission = (source: Particle, emission: Emission, depth: number, baseTime: number) => {
    const d = distance(source, emission.target);
    queue.push({
      targetId: emission.target.id,
      angle: angleBetween(source, emission.target),
      arrival: baseTime + (emission.delay ?? 0) + d / PULSE_SPEED,
      depth,
      order: eventOrder++
    });
  };

  initial.activated = true;
  initial.depth = 0;
  const initialMultiplier = getComboMultiplier(1);
  const initialPoints = BASE_POINTS[initial.type];
  activations.push({
    particleId: initial.id, type: initial.type, depth: 0,
    activatedAt: 0, points: initialPoints, multiplier: initialMultiplier
  });
  score += initialPoints;
  activatedTypes.add(initial.type);

  const initialHeading = normalizeAngle(degreesToRadians(directionDegrees));
  for (const emission of chooseEmissions(board, initial, initialHeading)) {
    pushEmission(initial, emission, 1, 0);
  }

  while (queue.length > 0) {
    queue.sort((a, b) => a.arrival - b.arrival || a.targetId.localeCompare(b.targetId) || a.order - b.order);
    const event = queue.shift()!;
    if (event.arrival > MAX_REACTION_SECONDS) break;

    // Count the elapsed time even when this pulse is absorbed by an already
    // activated particle (for example, an Echo's delayed second pulse).
    currentTime = Math.max(currentTime, event.arrival);
    const target = particles.get(event.targetId)!;
    if (target.activated) continue;

    target.activated = true;
    target.depth = event.depth;

    const activationCount = activations.length + 1;
    const multiplier = getComboMultiplier(activationCount);
    const points = (BASE_POINTS[target.type] + 25 * event.depth) * multiplier;
    activations.push({
      particleId: target.id,
      type: target.type,
      depth: event.depth,
      activatedAt: Number(currentTime.toFixed(3)),
      points,
      multiplier
    });
    score += points;
    activatedTypes.add(target.type);

    const emissions = chooseEmissions(board, target, event.angle);
    for (const emission of emissions) {
      pushEmission(target, emission, event.depth + 1, currentTime);
    }
  }

  const varietyBonus = Math.min(250, Math.max(0, activatedTypes.size - 1) * 50);
  const perfectChainBonus = activations.length === board.particles.length && board.particles.length === PARTICLE_COUNT ? 500 : 0;
  const maxDepth = activations.reduce((max, item) => Math.max(max, item.depth), 0);

  return {
    seed: board.seed,
    initialParticleId: particleId,
    direction: directionDegrees,
    activations,
    score: score + varietyBonus + perfectChainBonus,
    varietyBonus,
    perfectChainBonus,
    activatedCount: activations.length,
    maxDepth,
    longestChain: maxDepth + 1,
    activatedTypes: [...activatedTypes],
    duration: Number(currentTime.toFixed(3))
  };
}

/** Backwards-compatible seeded simulation entry point for the existing API. */
export function simulateReaction(seed: number, particleId: string, directionDegrees: number): SimulationResult {
  return simulateBoardReaction(generateBoard(seed), particleId, directionDegrees);
}
