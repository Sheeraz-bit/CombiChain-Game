import type {
  Board,
  Particle,
  ParticleType,
} from "../types/game.types";

import { REACTION_CONFIG, PARTICLE_CONFIG } from "../utils/constants";
import {
  angleDifference,
  distance,
  getAngle,
  normalizeAngle,
} from "../utils/geometry";

export interface ReactionActivation {
  particleId: string;
  type: ParticleType;
  depth: number;
  activatedAt: number;
  points: number;
  multiplier: number;
}

export interface ReactionTimeline {
  activations: ReactionActivation[];
  score: number;
  duration: number;
  activatedCount: number;
  maxDepth: number;
  varietyBonus: number;
  perfectChainBonus: number;
}

interface PulseEvent {
  targetId: string;
  direction: number;
  arrivalTime: number;
  depth: number;
  order: number;
}

export class ReactionEngine {
  simulate(
    snapshot: Board,
    initialParticleId: string,
    initialDirection: number
  ): ReactionTimeline {
    const board: Board = {
      ...snapshot,
      particles: snapshot.particles.map((particle) => ({
        ...particle,
        velocity: { ...particle.velocity },
        activated: false,
        depth: null,
        activatedAt: undefined,
      })),
      connections: snapshot.connections.map((connection) => ({
        ...connection,
      })),
    };

    const particleMap = new Map(
      board.particles.map((particle) => [particle.id, particle])
    );

    if (!particleMap.has(initialParticleId)) {
      throw new Error(`Unknown initial particle: ${initialParticleId}`);
    }

    const events: PulseEvent[] = [];
    const activations: ReactionActivation[] = [];
    const activatedTypes = new Set<ParticleType>();

    let eventOrder = 0;
    let totalScore = 0;
    let maxDepth = 0;
    let lastEventTime = 0;

    

    const getNeighbours = (particle: Particle): Particle[] => {
      return board.connections
        .filter(
          (connection) =>
            connection.from === particle.id ||
            connection.to === particle.id
        )
        .map((connection) => {
          const id =
            connection.from === particle.id
              ? connection.to
              : connection.from;

          return particleMap.get(id);
        })
        .filter((item): item is Particle => item !== undefined)
        .filter((item) => !item.activated);
    };

    const selectDirectional = (
      source: Particle,
      direction: number,
      tolerance: number,
      candidates = getNeighbours(source),
      maxTargets = 1
    ): Particle[] => {
      return candidates
        .map((target) => ({
          target,
          angle: getAngle(source, target),
          distance: distance(source, target),
        }))
        .filter(
          (item) =>
            angleDifference(item.angle, direction) <= tolerance
        )
        .sort(
          (a, b) =>
            a.distance - b.distance ||
            a.target.id.localeCompare(b.target.id)
        )
        .slice(0, maxTargets)
        .map((item) => item.target);
    };

    const emit = (
      source: Particle,
      incomingDirection: number,
      depth: number,
      time: number
    ) => {
      const neighbours = getNeighbours(source);

      
const send = (targets: Particle[], direction?: number) => {
  for (const target of targets) {
    const pulseDistance = distance(source, target);

    events.push({
      targetId: target.id,
      direction: direction ?? getAngle(source, target),
      arrivalTime:
        time + pulseDistance / REACTION_CONFIG.PULSE_SPEED,
      depth: depth + 1,
      order: eventOrder++,
    });
  }
};


      switch (source.type) {
        case "SPARK": {
          send(
            selectDirectional(source, incomingDirection, 35, neighbours),
            incomingDirection
          );
          break;
        }

        case "BURST": {
          send(neighbours.slice(0, 3));
          break;
        }

        case "SPLITTER": {
          const directions = [
            incomingDirection,
            incomingDirection - REACTION_CONFIG.SPLITTER_ANGLE,
            incomingDirection + REACTION_CONFIG.SPLITTER_ANGLE,
          ];

          const used = new Set<string>();

          for (const direction of directions) {
            const target = selectDirectional(
              source,
              direction,
              25,
              neighbours.filter((item) => !used.has(item.id))
            )[0];

            if (target) {
              used.add(target.id);
              send([target], direction);
            }
          }
          break;
        }

        case "AMPLIFIER": {
          const extended = board.particles.filter((target) => {
            if (target.id === source.id || target.activated) return false;

            return (
              distance(source, target) <=
              board.connectionRadius *
                REACTION_CONFIG.AMPLIFIER_RANGE_MULTIPLIER
            );
          });

          send(
            selectDirectional(
              source,
              incomingDirection,
              45,
              extended,
              2
            ),
            incomingDirection
          );
          break;
        }

        case "PRISM": {
          const rotated =
            incomingDirection + REACTION_CONFIG.PRISM_ROTATION;

          send(
            selectDirectional(source, rotated, 30, neighbours),
            rotated
          );
          break;
        }

        case "ECHO": {
          const candidates = selectDirectional(
            source,
            incomingDirection,
            35,
            neighbours,
            2
          );

          if (candidates[0]) {
            send([candidates[0]], incomingDirection);
          }

          if (candidates[1]) {
            const second = candidates[1];
            const pulseDistance = distance(source, second);

            events.push({
              targetId: second.id,
              direction: incomingDirection,
              arrivalTime:
                time +
                REACTION_CONFIG.ECHO_DELAY +
                pulseDistance / REACTION_CONFIG.PULSE_SPEED,
              depth: depth + 1,
              order: eventOrder++,
            });
          }
          break;
        }
      }
    };

    events.push({
      targetId: initialParticleId,
      direction: normalizeAngle(initialDirection),
      arrivalTime: 0,
      depth: 0,
      order: eventOrder++,
    });

    while (events.length > 0) {
      events.sort(
        (a, b) =>
          a.arrivalTime - b.arrivalTime ||
          a.targetId.localeCompare(b.targetId) ||
          a.order - b.order
      );

      const event = events.shift()!;

      if (event.arrivalTime > REACTION_CONFIG.MAX_DURATION) break;

      const target = particleMap.get(event.targetId);

      lastEventTime = Math.max(lastEventTime, event.arrivalTime);

      if (!target || target.activated) continue;

      target.activated = true;
      target.depth = event.depth;
      target.activatedAt = event.arrivalTime;

      const activationNumber = activations.length + 1;

      const multiplier =
        activationNumber >= 17 ? 5 :
        activationNumber >= 13 ? 4 :
        activationNumber >= 9 ? 3 :
        activationNumber >= 5 ? 2 : 1;

      const basePoints = PARTICLE_CONFIG[target.type].basePoints;
      const points = (basePoints + 25 * event.depth) * multiplier;

      totalScore += points;
      maxDepth = Math.max(maxDepth, event.depth);
      activatedTypes.add(target.type);

      activations.push({
        particleId: target.id,
        type: target.type,
        depth: event.depth,
        activatedAt: event.arrivalTime,
        points,
        multiplier,
      });

      emit(
        target,
        event.direction,
        event.depth,
        event.arrivalTime
      );
    }

    const varietyBonus = Math.min(
  250,
  Math.max(0, activatedTypes.size - 1) * 50
);

const perfectChainBonus =
  activations.length === 24 && board.particles.length === 24
    ? 500
    : 0;

const duration = Number(lastEventTime.toFixed(3));

    return {
      activations,
      score: totalScore + varietyBonus + perfectChainBonus,
      duration,
      activatedCount: activations.length,
      maxDepth,
      varietyBonus,
      perfectChainBonus,
    };
  }
}