
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;

  return function random(): number {
    state = (state + 0x6D2B79F5) >>> 0;

    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomBetween(
  random: () => number,
  min: number,
  max: number
): number {
  return min + random() * (max - min);
}

export function randomInt(
  random: () => number,
  min: number,
  max: number
): number {
  return Math.floor(randomBetween(random, min, max + 1));
}

export function shuffleArray<T>(
  array: T[],
  random: () => number
): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
