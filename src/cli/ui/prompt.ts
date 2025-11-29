import readline from "readline";

export function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question + " ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function confirm(text: string): Promise<boolean> {
  const res = await ask(text + " (y/n)");
  if (res.toLowerCase() === "y" || res.toLowerCase() === "yes") return true;
  return false;
}
