import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { UserSession } from "../domain/user";

interface SessionFileShape {
  id: string;
  handle: string;
  displayName: string;
  createdAt: string;
}

function getBaseDirectory(): string {
  const home = os.homedir() || process.cwd();
  return path.join(home, ".aexus-cli");
}

function getSessionFilePath(): string {
  return path.join(getBaseDirectory(), "session.json");
}

async function ensureBaseDirectory(): Promise<void> {
  const dir = getBaseDirectory();
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

function toSession(session: SessionFileShape): UserSession {
  return {
    id: session.id,
    handle: session.handle,
    displayName: session.displayName,
    createdAt: new Date(session.createdAt),
  };
}

function fromSession(session: UserSession): SessionFileShape {
  return {
    id: session.id,
    handle: session.handle,
    displayName: session.displayName,
    createdAt: session.createdAt.toISOString(),
  };
}

export async function loadSession(): Promise<UserSession | null> {
  const filePath = getSessionFilePath();
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as SessionFileShape;
    if (
      !parsed ||
      typeof parsed.id !== "string" ||
      typeof parsed.handle !== "string"
    ) {
      return null;
    }
    return toSession(parsed);
  } catch {
    return null;
  }
}

export async function saveSession(session: UserSession): Promise<void> {
  await ensureBaseDirectory();
  const filePath = getSessionFilePath();
  const payload = JSON.stringify(fromSession(session), null, 2);
  await fs.writeFile(filePath, payload, "utf8");
}

export async function clearSession(): Promise<void> {
  const filePath = getSessionFilePath();
  try {
    await fs.unlink(filePath);
  } catch {}
}
