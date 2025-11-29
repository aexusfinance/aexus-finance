export type ScenarioIntensity = "light" | "standard" | "dense";

export interface ScenarioProgressionResult {
  points: number;
  band: "low" | "mid" | "high";
  label: string;
}

export interface AnalystProgressionResult {
  points: number;
  band: "scan" | "deep_scan" | "extended";
  label: string;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function randomInRange(min: number, max: number): number {
  const base = Math.random();
  const scaled = min + base * (max - min);
  return Math.floor(scaled);
}

function measureScenarioIntensity(prompt: string): ScenarioIntensity {
  const length = prompt.trim().length;
  if (length < 80) return "light";
  if (length < 220) return "standard";
  return "dense";
}

export function calculateScenarioProgression(
  prompt: string
): ScenarioProgressionResult {
  const intensity = measureScenarioIntensity(prompt);
  let minPoints = 6;
  let maxPoints = 10;
  if (intensity === "light") {
    minPoints = 6;
    maxPoints = 8;
  } else if (intensity === "standard") {
    minPoints = 7;
    maxPoints = 10;
  } else {
    minPoints = 8;
    maxPoints = 10;
  }
  const raw = randomInRange(minPoints, maxPoints + 1);
  const points = clamp(raw, 6, 10);
  let band: ScenarioProgressionResult["band"] = "mid";
  let label = "Scenario recorded";
  if (points <= 7) {
    band = "low";
    label = "Scenario logged";
  } else if (points >= 9) {
    band = "high";
    label = "Scenario deeply processed";
  } else {
    band = "mid";
    label = "Scenario processed";
  }
  return {
    points,
    band,
    label,
  };
}

export function calculateAnalystProgression(
  hasRiskFlags: boolean,
  poolCount: number
): AnalystProgressionResult {
  const baseMin = hasRiskFlags ? 5 : 3;
  const baseMax = hasRiskFlags ? 9 : 7;
  const richnessBoost = poolCount >= 5 ? 2 : poolCount >= 2 ? 1 : 0;
  const raw = randomInRange(baseMin, baseMax + 1) + richnessBoost;
  const points = clamp(raw, 3, 12);
  let band: AnalystProgressionResult["band"] = "scan";
  let label = "Scan completed";
  if (points >= 10) {
    band = "extended";
    label = "Extended analyst pass";
  } else if (points >= 7) {
    band = "deep_scan";
    label = "Deep analyst pass";
  } else {
    band = "scan";
    label = "Quick analyst pass";
  }
  return {
    points,
    band,
    label,
  };
}
