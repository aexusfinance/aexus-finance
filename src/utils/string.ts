export function getCliTitle(): string {
  return "AEXUS Command Line Interface";
}

export function getCliTagline(): string {
  return "Synthetic command surface for scenarios, telemetry, and progression.";
}

export function getScenarioCommandLabel(): string {
  return "Scenario Engine";
}

export function getScenarioCommandDescription(): string {
  return "Run what-if simulations, explore outcomes, and track scenario progression.";
}

export function getAnalystCommandLabel(): string {
  return "Token Analyst";
}

export function getAnalystCommandDescription(): string {
  return "Inspect Solana token telemetry, pools, risk surface, and price events.";
}

export function getAuthCommandLabel(): string {
  return "Identity";
}

export function getAuthCommandDescription(): string {
  return "Attach a local operator identity to the AEXUS CLI session.";
}

export function getPointsCommandLabel(): string {
  return "Progression";
}

export function getPointsCommandDescription(): string {
  return "View local progression score, rank tier, and recent activity.";
}

export function getScenarioPromptHint(): string {
  return "Start with phrases like: what if SOL reaches a new high while liquidity stays thin.";
}

export function getScenarioIntroLine(): string {
  return "AEXUS Scenario Engine is ready to receive a what-if prompt.";
}

export function getAnalystIntroLine(): string {
  return "Paste a Solana mint address to pull token telemetry from the analyst node.";
}

export function getScanInProgressText(): string {
  return "Scan in progress. Pulling upstream data, shaping metrics, and assembling a view.";
}

export function getScanIdleText(): string {
  return "Idle. No active scan. Provide an input to begin.";
}

export function getScanErrorPrefix(): string {
  return "Scan failed:";
}

export function getScenarioRunInProgressText(): string {
  return "Scenario is processing. Synthesizing sentiment, impacts, and key watchpoints.";
}

export function getScenarioIdleText(): string {
  return "Idle. No scenario loaded. Submit a what-if prompt to begin.";
}

export function getScenarioErrorPrefix(): string {
  return "Scenario engine returned an error:";
}

export function getHistoryHeaderLabel(): string {
  return "Recent activity";
}

export function getScenarioHistoryLabel(): string {
  return "Scenario runs";
}

export function getAnalystHistoryLabel(): string {
  return "Token scans";
}

export function getNoScenarioHistoryText(): string {
  return "No scenario runs recorded in this environment.";
}

export function getNoAnalystHistoryText(): string {
  return "No token scans recorded in this environment.";
}

export function getRankTitlePrefix(): string {
  return "Rank tier";
}

export function getPointsLabel(): string {
  return "Progression points";
}

export function getPointsHint(): string {
  return "Points accumulate when scenarios are executed and tokens are scanned.";
}
