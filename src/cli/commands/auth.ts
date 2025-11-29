import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });

function getAuthWelcomeText(): string {
  return "AEXUS identity session runs locally inside this CLI and can be integrated with remote services.";
}

function getAuthIdQuestion(): string {
  return "Choose an AEXUS ID: ";
}

function getAuthModeQuestion(): string {
  return "Select mode [observer/operator]: ";
}

function getAuthSummaryPrefix(): string {
  return "Session summary";
}

export async function runAuthCommand(): Promise<void> {
  process.stdout.write("AEXUS Auth\n");
  process.stdout.write("----------------------------------------\n");
  process.stdout.write(getAuthWelcomeText() + "\n\n");

  const id = prompt(getAuthIdQuestion()).trim() || "default";
  const modeInput = prompt(getAuthModeQuestion()).trim().toLowerCase();
  const mode = modeInput === "operator" ? "operator" : "observer";

  process.stdout.write("\n" + getAuthSummaryPrefix() + "\n");
  process.stdout.write("----------------------------------------\n");
  process.stdout.write(`ID: ${id}\n`);
  process.stdout.write(`Mode: ${mode}\n`);
  process.stdout.write(
    "This session profile can be used to scope analytics and progression data.\n"
  );
}
