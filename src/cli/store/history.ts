import { promises as fs } from "fs";
import path from "path";
import os from "os";

export interface ScenarioHistoryRecord {
  id: string;
  prompt: string;
  sentimentLabel?: string;
  points?: number;
  createdAt: Date;
}

export interface AnalystHistoryRecord {
  id: string;
  mint: string;
  symbol?: string;
  createdAt: Date;
}

interface ScenarioHistoryFileRecord {
  id: string;
  prompt: string;
  sentimentLabel?: string;
  points?: number;
  createdAt: string;
}

interface AnalystHistoryFileRecord {
  id: string;
  mint: string;
  symbol?: string;
  createdAt: string;
}

interface HistoryFileShape {
  scenarios: ScenarioHistoryFileRecord[];
  analyst: AnalystHistoryFileRecord[];
}

function getBaseDirectory(): string {
  const home = os.homedir() || process.cwd();
  return path.join(home, ".aexus-cli");
}

function getHistoryFilePath(): string {
  return path.join(getBaseDirectory(), "history.json");
}

async function ensureBaseDirectory(): Promise<void> {
  const dir = getBaseDirectory();
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  const random = Math.random().toString(16).slice(2);
  const now = Date.now().toString(16);
  return now + random;
}

function emptyHistoryShape(): HistoryFileShape {
  return {
    scenarios: [],
    analyst: [],
  };
}

async function readHistoryFile(): Promise<HistoryFileShape> {
  const filePath = getHistoryFilePath();
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as HistoryFileShape;
    if (
      !parsed ||
      !Array.isArray(parsed.scenarios) ||
      !Array.isArray(parsed.analyst)
    ) {
      return emptyHistoryShape();
    }
    return parsed;
  } catch {
    return emptyHistoryShape();
  }
}

async function writeHistoryFile(shape: HistoryFileShape): Promise<void> {
  await ensureBaseDirectory();
  const filePath = getHistoryFilePath();
  const payload = JSON.stringify(shape, null, 2);
  await fs.writeFile(filePath, payload, "utf8");
}

function toScenarioRecord(
  fileRecord: ScenarioHistoryFileRecord
): ScenarioHistoryRecord {
  return {
    id: fileRecord.id,
    prompt: fileRecord.prompt,
    sentimentLabel: fileRecord.sentimentLabel,
    points: fileRecord.points,
    createdAt: new Date(fileRecord.createdAt),
  };
}

function fromScenarioRecord(
  record: ScenarioHistoryRecord
): ScenarioHistoryFileRecord {
  return {
    id: record.id,
    prompt: record.prompt,
    sentimentLabel: record.sentimentLabel,
    points: record.points,
    createdAt: record.createdAt.toISOString(),
  };
}

function toAnalystRecord(
  fileRecord: AnalystHistoryFileRecord
): AnalystHistoryRecord {
  return {
    id: fileRecord.id,
    mint: fileRecord.mint,
    symbol: fileRecord.symbol,
    createdAt: new Date(fileRecord.createdAt),
  };
}

function fromAnalystRecord(
  record: AnalystHistoryRecord
): AnalystHistoryFileRecord {
  return {
    id: record.id,
    mint: record.mint,
    symbol: record.symbol,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function appendScenarioHistory(input: {
  prompt: string;
  sentimentLabel?: string;
  points?: number;
}): Promise<ScenarioHistoryRecord> {
  const now = new Date();
  const record: ScenarioHistoryRecord = {
    id: createId(),
    prompt: input.prompt,
    sentimentLabel: input.sentimentLabel,
    points: input.points,
    createdAt: now,
  };
  const fileShape = await readHistoryFile();
  fileShape.scenarios.unshift(fromScenarioRecord(record));
  if (fileShape.scenarios.length > 200) {
    fileShape.scenarios = fileShape.scenarios.slice(0, 200);
  }
  await writeHistoryFile(fileShape);
  return record;
}

export async function appendAnalystHistory(input: {
  mint: string;
  symbol?: string;
}): Promise<AnalystHistoryRecord> {
  const now = new Date();
  const record: AnalystHistoryRecord = {
    id: createId(),
    mint: input.mint,
    symbol: input.symbol,
    createdAt: now,
  };
  const fileShape = await readHistoryFile();
  fileShape.analyst.unshift(fromAnalystRecord(record));
  if (fileShape.analyst.length > 200) {
    fileShape.analyst = fileShape.analyst.slice(0, 200);
  }
  await writeHistoryFile(fileShape);
  return record;
}

export async function listScenarioHistory(
  limit?: number
): Promise<ScenarioHistoryRecord[]> {
  const fileShape = await readHistoryFile();
  const records = fileShape.scenarios.map(toScenarioRecord);
  if (!limit || limit <= 0 || limit >= records.length) {
    return records;
  }
  return records.slice(0, limit);
}

export async function listAnalystHistory(
  limit?: number
): Promise<AnalystHistoryRecord[]> {
  const fileShape = await readHistoryFile();
  const records = fileShape.analyst.map(toAnalystRecord);
  if (!limit || limit <= 0 || limit >= records.length) {
    return records;
  }
  return records.slice(0, limit);
}

export async function clearHistory(): Promise<void> {
  await writeHistoryFile(emptyHistoryShape());
}
