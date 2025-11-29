export type RankId =
  | "Initiate"
  | "Chain Explorer"
  | "Core Operator"
  | "Protocol Vanguard"
  | "Ascended Architect";

export interface UserSession {
  id: string;
  handle: string;
  displayName: string;
  createdAt: Date;
}

export interface RankSnapshot {
  rank: RankId;
  points: number;
  leaderboardPosition?: number;
}

export interface PointsDelta {
  previousPoints: number;
  newPoints: number;
  gained: number;
  source: "scenario" | "analyst" | "manual";
  label: string;
  createdAt: Date;
}

export function computeRank(points: number): RankId {
  if (points >= 5000) return "Ascended Architect";
  if (points >= 2000) return "Protocol Vanguard";
  if (points >= 800) return "Core Operator";
  if (points >= 300) return "Chain Explorer";
  return "Initiate";
}

export function describeRank(rank: RankId): string {
  if (rank === "Ascended Architect") {
    return "High signal actor with a fully imprinted presence inside the AEXUS field.";
  }
  if (rank === "Protocol Vanguard") {
    return "Consistent participant who shapes decision surfaces and runs frequent simulations.";
  }
  if (rank === "Core Operator") {
    return "Hands-on operator who engages across modules with a steady rhythm.";
  }
  if (rank === "Chain Explorer") {
    return "Active scout running early experiments and mapping new routes.";
  }
  return "New identity, ready to start building a trace across the system.";
}

export function buildRankSnapshot(
  points: number,
  leaderboardPosition?: number
): RankSnapshot {
  const safePoints = Number.isFinite(points)
    ? Math.max(0, Math.floor(points))
    : 0;
  const rank = computeRank(safePoints);
  return {
    rank,
    points: safePoints,
    leaderboardPosition,
  };
}

export function buildPointsDelta(
  previousPoints: number,
  gained: number,
  source: PointsDelta["source"],
  label: string
): PointsDelta {
  const safePrevious = Number.isFinite(previousPoints)
    ? Math.max(0, Math.floor(previousPoints))
    : 0;
  const safeGained = Number.isFinite(gained)
    ? Math.max(0, Math.floor(gained))
    : 0;
  const newPoints = safePrevious + safeGained;
  return {
    previousPoints: safePrevious,
    newPoints,
    gained: safeGained,
    source,
    label,
    createdAt: new Date(),
  };
}
