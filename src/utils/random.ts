export function randomInt(minInclusive: number, maxInclusive: number): number {
  const min = Math.ceil(minInclusive);
  const max = Math.floor(maxInclusive);
  const span = max - min + 1;
  if (span <= 0) return min;
  return min + Math.floor(Math.random() * span);
}

export function randomFloat(
  minInclusive: number,
  maxInclusive: number
): number {
  const min = Math.min(minInclusive, maxInclusive);
  const max = Math.max(minInclusive, maxInclusive);
  const span = max - min;
  if (span === 0) return min;
  return min + Math.random() * span;
}

export function randomChoice<T>(list: T[]): T | undefined {
  if (!Array.isArray(list) || list.length === 0) return undefined;
  const index = randomInt(0, list.length - 1);
  return list[index];
}

export function randomPointsInRange(): number {
  return randomInt(6, 10);
}

export function randomSentimentLabel(): string {
  const labels = [
    "Cautiously optimistic",
    "Neutral with a bullish tilt",
    "High volatility expected",
    "Structurally fragile",
    "Crowded and emotional",
    "Calm but asymmetric",
  ];
  const picked = randomChoice(labels);
  return picked ?? "Neutral";
}
