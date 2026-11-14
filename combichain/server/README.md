# COMBICHAIN API

A small Express + TypeScript API wrapper around the COMBICHAIN deterministic game simulation.

## Install from the project root

```bash
npm install express cors
npm install -D tsx @types/express @types/cors
```

Add these scripts to the root `package.json`:

```json
"server": "tsx watch server/src/index.ts",
"server:build": "tsc -p server/tsconfig.json",
"server:start": "node server/dist/index.js"
```

Start the API from the project root:

```bash
npm run server
```

Default base URL: `http://localhost:4000`

## Endpoints

### GET /api/health

Checks whether the API is running.

### POST /api/game/board

Body:

```json
{ "seed": 12345 }
```

Returns a deterministic board containing 24 particles and its connection graph.

### POST /api/game/simulate

Body:

```json
{
  "seed": 12345,
  "particleId": "p01",
  "direction": 0
}
```

Returns the activation sequence, score, combo multipliers, variety bonus, perfect-chain bonus, chain depth and reaction duration.

Use the same seed, particle ID and direction to reproduce the same result.

## Postman

1. Start the server with `npm run server`.
2. Create a GET request to `http://localhost:4000/api/health`.
3. Create a POST request to `http://localhost:4000/api/game/board`, set Body > raw > JSON, and send `{ "seed": 12345 }`.
4. Copy a particle ID from the board response.
5. Create a POST request to `http://localhost:4000/api/game/simulate` and send the simulation JSON shown above.

## Current prototype rules

- 24 particles; four of each of six types.
- 1000 × 700 logical board.
- Connection radius: 18% of the shorter board dimension.
- Maximum three connections per particle.
- Spark: one nearest target within 35°.
- Burst: all connected neighbours, up to three.
- Splitter: one nearest target in each of three directions (0°, -45°, +45°).
- Amplifier: up to two targets within 45°, searched up to 1.5× normal connection radius.
- Prism: redirects 60° clockwise and emits to one target within 30°.
- Echo: nearest target immediately and next-nearest after 0.7 seconds.
- A particle activates once per round.
- Pulse speed: 420 logical units per second.
- Reaction time cap: 12 seconds.
- Combo multiplier is applied at each activation using the running activation count.

These are the first executable balancing rules. They can be tuned after playtesting.
