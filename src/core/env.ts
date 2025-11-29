import fs from "fs";
import path from "path";

let envCache: Record<string, string> | null = null;

function loadEnvFile(): Record<string, string> {
  if (envCache) return envCache;
  const file = path.resolve(process.cwd(), ".env");
  const store: Record<string, string> = {};
  if (!fs.existsSync(file)) {
    envCache = store;
    return store;
  }
  const lines = fs.readFileSync(file, "utf8").split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) continue;
    store[key] = value;
  }
  envCache = store;
  return store;
}

function getEnv(key: string): string {
  const fileEnv = loadEnvFile();
  if (Object.prototype.hasOwnProperty.call(fileEnv, key)) {
    return fileEnv[key];
  }
  const runtime = process.env[key];
  return runtime ? runtime : "";
}

export function getAnalystBaseUrl(): string {
  return getEnv(resolveAnalystBaseAlias());
}

export function getAnalystApiKey(): string {
  return getEnv(resolveAnalystKeyAlias());
}

export function getPortalBaseUrl(): string {
  return getEnv(resolvePortalBaseAlias());
}

function resolveAnalystBaseAlias(): string {
  return "AEXUS_ANALYST_BASE_URL";
}

function resolveAnalystKeyAlias(): string {
  return "AEXUS_ANALYST_API_KEY";
}

function resolvePortalBaseAlias(): string {
  return "AEXUS_PORTAL_BASE_URL";
}
