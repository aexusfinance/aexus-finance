import { runScenarioCommand } from "./commands/scenario";
import { runAnalystCommand } from "./commands/analyst";
import { runAuthCommand } from "./commands/auth";
import { runPointsCommand } from "./commands/points";

function getCliName(): string {
  return "aexus";
}

function getCliVersion(): string {
  return "0.1.0";
}

function getUsage(): string {
  const name = getCliName();
  return [
    "",
    `Usage: ${name} <command> [options]`,
    "",
    "Commands:",
    `  scenario [text]     Run a what-if scenario simulation`,
    `  analyst [mint]      Scan a Solana token mint`,
    `  auth                Configure a local identity session`,
    `  points              Inspect and adjust local progression points`,
    "",
    "Global options:",
    "  -h, --help          Show this help message",
    "  -v, --version       Show CLI version",
    "",
  ].join("\n");
}

function isHelpFlag(token: string | undefined): boolean {
  if (!token) return false;
  return token === "-h" || token === "--help" || token === "help";
}

function isVersionFlag(token: string | undefined): boolean {
  if (!token) return false;
  return token === "-v" || token === "--version" || token === "version";
}

async function dispatchCommand(command: string, args: string[]): Promise<void> {
  if (command === "scenario") {
    await runScenarioCommand(args);
    return;
  }
  if (command === "analyst") {
    await runAnalystCommand(args);
    return;
  }
  if (command === "auth") {
    await runAuthCommand();
    return;
  }
  if (command === "points") {
    await runPointsCommand();
    return;
  }

  process.stderr.write(`Unknown command: ${command}\n`);
  process.stdout.write(getUsage());
}

export async function runCli(rawArgs: string[]): Promise<void> {
  const [first, ...rest] = rawArgs;

  if (!first || isHelpFlag(first)) {
    process.stdout.write(getUsage());
    return;
  }

  if (isVersionFlag(first)) {
    process.stdout.write(`${getCliName()} ${getCliVersion()}\n`);
    return;
  }

  await dispatchCommand(first, rest);
}
