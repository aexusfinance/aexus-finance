import { getEnv } from "../core/env";
import { requestJson } from "../core/http";

export type ScenarioSentiment =
  | "bullish"
  | "bearish"
  | "mixed"
  | "cautiously_optimistic"
  | "uncertain";

export interface ScenarioEnginePayload {
  prompt: string;
  userId?: string;
  channel?: string;
  context?: Record<string, unknown>;
}

export interface ScenarioEngineRawResponse {
  sentiment?: string;
  summary?: string;
  scenarioFraming?: string;
  mainImpacts?: string[];
  keyRisks?: string[];
  thingsToMonitor?: string[];
  progressionHint?: string;
  [key: string]: unknown;
}

export interface ScenarioEngineViewModel {
  sentiment: ScenarioSentiment;
  framing: string;
  summary: string;
  impacts: string[];
  risks: string[];
  watchpoints: string[];
  progressionHint?: string;
  raw: ScenarioEngineRawResponse;
}

function selectScenarioEngineUrl(): string {
  const env = getEnv();
  if (
    env.AEXUS_SCENARIO_ENGINE_URL &&
    env.AEXUS_SCENARIO_ENGINE_URL.trim().length > 0
  ) {
    return env.AEXUS_SCENARIO_ENGINE_URL.trim();
  }
  if (env.AEXUS_API_URL && env.AEXUS_API_URL.trim().length > 0) {
    return env.AEXUS_API_URL.trim();
  }
  throw new Error("Scenario engine URL is not configured");
}

function buildScenarioEngineHeaders(): Record<string, string> {
  const env = getEnv();
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (env.AEXUS_API_KEY && env.AEXUS_API_KEY.trim().length > 0) {
    headers["authorization"] = env.AEXUS_API_KEY.trim();
  }
  return headers;
}

function normalizeSentiment(value?: string): ScenarioSentiment {
  const raw = (value || "").toLowerCase().trim();
  if (raw.includes("bull") && raw.includes("bear")) {
    return "mixed";
  }
  if (raw.includes("bull")) {
    return "bullish";
  }
  if (raw.includes("bear")) {
    return "bearish";
  }
  if (raw.includes("cautious") || raw.includes("careful")) {
    return "cautiously_optimistic";
  }
  if (raw.length === 0) {
    return "uncertain";
  }
  return "mixed";
}

function safeText(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

function safeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v))
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }
  return [];
}

export async function runScenarioEngine(
  prompt: string,
  userId?: string
): Promise<ScenarioEngineViewModel> {
  if (!prompt || prompt.trim().length === 0) {
    throw new Error("Scenario prompt is required");
  }

  const url = selectScenarioEngineUrl();
  const headers = buildScenarioEngineHeaders();

  const body: ScenarioEnginePayload = {
    prompt: prompt.trim(),
    userId: userId,
    channel: "aexus-cli",
    context: {
      kind: "scenario",
      client: "cli",
    },
  };

  const raw = await requestJson<ScenarioEngineRawResponse>("POST", url, {
    headers,
    body: JSON.stringify(body),
  });

  const sentiment = normalizeSentiment(raw.sentiment);
  const framing = safeText(
    raw.scenarioFraming,
    "This scenario is interpreted as a synthetic what-if projection."
  );
  const summary = safeText(
    raw.summary,
    "The engine responds with a high-level narrative about how this scenario could unfold under typical market conditions."
  );
  const impacts = safeStringArray(raw.mainImpacts);
  const risks = safeStringArray(raw.keyRisks);
  const watchpoints = safeStringArray(raw.thingsToMonitor);
  const progressionHint =
    typeof raw.progressionHint === "string" &&
    raw.progressionHint.trim().length > 0
      ? raw.progressionHint.trim()
      : undefined;

  return {
    sentiment,
    framing,
    summary,
    impacts,
    risks,
    watchpoints,
    progressionHint,
    raw,
  };
}
