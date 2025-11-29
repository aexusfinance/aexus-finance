import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });

type PointsSnapshot = {
  id: string;
  points: number;
  rankTitle: string;
  lastUpdated: string;
};

function getStorageFolderName(): string {
  return ".aexus";
}

function getStorageFileName(): string {
  return "points.json";
}

function getDefaultRankTitle(): string {
  return "Initiate";
}

function getRankForPoints(points: number): string {
  if (points >= 5000) return "Ascended Architect";
  if (points >= 2000) return "Protocol Vanguard";
  if (points >= 800) return "Core Operator";
  if (points >= 300) return "Chain Explorer";
  return getDefaultRankTitle();
}

function getHomeDir(): string {
  return os.homedir();
}

function getStoragePath(): string {
  const base = path.join(getHomeDir(), getStorageFolderName());
  if (!fs.existsSync(base)) {
    fs.mkdirSync(base, { recursive: true });
  }
  return path.join(base, getStorageFileName());
}

function loadSnapshot(id: string): PointsSnapshot {
  const file = getStoragePath();
  if (!fs.existsSync(file)) {
    const now = new Date().toISOString();
    return {
      id,
      points: 0,
      rankTitle: getDefaultRankTitle(),
      lastUpdated: now,
    };
  }

  try {
    const raw = fs.readFileSync(file, "utf8");
    const data = JSON.parse(raw) as PointsSnapshot;
    if (data.id !== id) {
      const now = new Date().toISOString();
      return {
        id,
        points: 0,
        rankTitle: getDefaultRankTitle(),
        lastUpdated: now,
      };
    }
    return data;
  } catch {
    const now = new Date().toISOString();
    return {
      id,
      points: 0,
      rankTitle: getDefaultRankTitle(),
      lastUpdated: now,
    };
  }
}

function saveSnapshot(snapshot: PointsSnapshot): void {
  const file = getStoragePath();
  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2), "utf8");
}

function getPointsIntroText(): string {
  return "AEXUS progression in this CLI is stored locally and can mirror your in-protocol rank model.";
}

function getPointsIdQuestion(): string {
  return "Enter your AEXUS ID: ";
}

function getPointsDeltaQuestion(): string {
  return "Add or subtract points (for example +10, -5, or 0 to keep): ";
}

function parseDelta(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) return 0;
  const value = Number(trimmed);
  if (Number.isNaN(value)) return 0;
  return Math.trunc(value);
}

export async function runPointsCommand(): Promise<void> {
  process.stdout.write("AEXUS Points\n");
  process.stdout.write("----------------------------------------\n");
  process.stdout.write(getPointsIntroText() + "\n\n");

  const idInput = prompt(getPointsIdQuestion()).trim();
  const id = idInput || "default";

  const snapshot = loadSnapshot(id);
  process.stdout.write(`Current ID: ${snapshot.id}\n`);
  process.stdout.write(`Current points: ${snapshot.points}\n`);
  process.stdout.write(`Current rank: ${snapshot.rankTitle}\n`);
  process.stdout.write(`Last updated: ${snapshot.lastUpdated}\n\n`);

  const deltaInput = prompt(getPointsDeltaQuestion());
  const delta = parseDelta(deltaInput);
  const nextPoints = Math.max(0, snapshot.points + delta);
  const nextRank = getRankForPoints(nextPoints);
  const now = new Date().toISOString();

  const updated: PointsSnapshot = {
    id: snapshot.id,
    points: nextPoints,
    rankTitle: nextRank,
    lastUpdated: now,
  };

  saveSnapshot(updated);

  process.stdout.write("\nUpdated progression\n");
  process.stdout.write("----------------------------------------\n");
  process.stdout.write(`Points: ${updated.points}\n`);
  process.stdout.write(`Rank: ${updated.rankTitle}\n`);
  process.stdout.write(`Updated at: ${updated.lastUpdated}\n`);
}
