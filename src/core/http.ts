import { request } from "undici";
import { getAnalystBaseUrl, getAnalystApiKey } from "./env.js";

export async function httpGetAnalyst(path: string): Promise<any> {
  const base = getAnalystBaseUrl();
  const key = getAnalystApiKey();
  if (!base) throw new Error("Missing analyst base url alias");
  if (!key) throw new Error("Missing analyst api key alias");
  const url = normalizeBase(base) + normalizePath(path);
  const res = await request(url, {
    method: "GET",
    headers: {
      "x-api-key": key,
    },
  });
  const text = await res.body.text();
  return safeParse(text);
}

function normalizeBase(v: string): string {
  if (!v.endsWith("/")) return v;
  return v.slice(0, -1);
}

function normalizePath(v: string): string {
  if (!v.startsWith("/")) return "/" + v;
  return v;
}

function safeParse(v: string): any {
  try {
    return JSON.parse(v);
  } catch {
    return { error: "invalid-response" };
  }
}
