import promptSync from "prompt-sync";
import { fetch } from "undici";

const prompt = promptSync({ sigint: true });

function readScenarioInputFromArgs(args: string[]): string {
  return args.join(" ").trim();
}

function readScenarioInputInteractive(): string {
  const line = prompt("Describe a what-if scenario: ");
  return line.trim();
}

function resolveScenarioPrompt(args: string[]): string {
  const fromArgs = readScenarioInputFromArgs(args);
  if (fromArgs.length > 0) {
    return fromArgs;
  }
  return readScenarioInputInteractive();
}

function getScenarioEndpoint(): string {
  const value = process.env.AEXUS_SCENARIO_ENGINE_URL || "";
  return value;
}

function getScenarioHeaderName(): string {
  return "Content-Type";
}

function getScenarioHeaderValue(): string {
  return "application/json";
}

function getScenarioLabelYou(): string {
  return "You";
}

function getScenarioLabelAexus(): string {
  return "AEXUS Answer";
}

function getScenarioErrorPrefix(): string {
  return "Scenario error";
}

function getScenarioFallbackMessage(): string {
  return "No structured scenario response returned.";
}

function getScenarioIntro(): string {
  return "Scenario simulation";
}

function getScenarioSeparator(): string {
  return "----------------------------------------";
}

export async function runScenarioCommand(args: string[]): Promise<void> {
  const endpoint = getScenarioEndpoint();
  if (!endpoint) {
    process.stderr.write(
      "Scenario endpoint is not configured. Set AEXUS_SCENARIO_ENGINE_URL in environment.\n"
    );
    return;
  }

  const promptText = resolveScenarioPrompt(args);
  if (!promptText) {
    process.stderr.write("Empty scenario prompt. Nothing to simulate.\n");
    return;
  }

  process.stdout.write(getScenarioIntro() + "\n");
  process.stdout.write(getScenarioSeparator() + "\n");
  process.stdout.write(`${getScenarioLabelYou()}: ${promptText}\n\n`);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        [getScenarioHeaderName()]: getScenarioHeaderValue(),
      },
      body: JSON.stringify({ input: promptText }),
    });

    const text = await res.text();
    if (!res.ok) {
      process.stderr.write(
        `${getScenarioErrorPrefix()}: HTTP ${res.status} ${res.statusText}\n`
      );
      if (text) {
        process.stderr.write(text + "\n");
      }
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      process.stdout.write(`${getScenarioLabelAexus()}:\n`);
      process.stdout.write(
        text.length > 0 ? text + "\n" : getScenarioFallbackMessage() + "\n"
      );
      return;
    }

    process.stdout.write(`${getScenarioLabelAexus()}:\n`);

    if (typeof payload === "string") {
      process.stdout.write(payload + "\n");
      return;
    }

    if (payload && typeof payload === "object") {
      const anyPayload = payload as Record<string, unknown>;
      const directText =
        typeof anyPayload.output === "string" ? anyPayload.output : null;
      if (directText) {
        process.stdout.write(directText + "\n");
        return;
      }
      process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
      return;
    }

    process.stdout.write(getScenarioFallbackMessage() + "\n");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${getScenarioErrorPrefix()}: ${msg}\n`);
  }
}
