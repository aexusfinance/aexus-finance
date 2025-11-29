import {
  ScenarioEngineViewModel,
  ScenarioSentiment,
} from "../services/scenarioEngine";

export interface ScenarioInput {
  prompt: string;
  userId?: string;
}

export type ScenarioSentimentLabel =
  | "Strongly Bullish"
  | "Bullish"
  | "Bearish"
  | "Mixed"
  | "Cautiously Optimistic"
  | "Unclear";

export interface ScenarioResult {
  input: ScenarioInput;
  sentiment: ScenarioSentiment;
  sentimentLabel: ScenarioSentimentLabel;
  framing: string;
  summary: string;
  impacts: string[];
  risks: string[];
  watchpoints: string[];
  progressionPoints: number;
  progressionLabel: string;
  createdAt: Date;
  raw: ScenarioEngineViewModel;
}

function sentimentToLabel(
  sentiment: ScenarioSentiment
): ScenarioSentimentLabel {
  if (sentiment === "bullish") return "Bullish";
  if (sentiment === "bearish") return "Bearish";
  if (sentiment === "mixed") return "Mixed";
  if (sentiment === "cautiously_optimistic") return "Cautiously Optimistic";
  return "Unclear";
}

export function buildScenarioResult(
  input: ScenarioInput,
  engine: ScenarioEngineViewModel,
  progressionPoints: number,
  progressionLabel: string
): ScenarioResult {
  const trimmedImpacts = engine.impacts
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
  const trimmedRisks = engine.risks
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
  const trimmedWatchpoints = engine.watchpoints
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

  return {
    input,
    sentiment: engine.sentiment,
    sentimentLabel: sentimentToLabel(engine.sentiment),
    framing: engine.framing,
    summary: engine.summary,
    impacts: trimmedImpacts,
    risks: trimmedRisks,
    watchpoints: trimmedWatchpoints,
    progressionPoints,
    progressionLabel,
    createdAt: new Date(),
    raw: engine,
  };
}
