function line(char: string, count: number): string {
  return char.repeat(count);
}

export function frameTitle(text: string): string {
  const pad = 4;
  const w = text.length + pad * 2;
  return [
    "",
    "┌" + line("─", w) + "┐",
    "│" + " ".repeat(pad) + text + " ".repeat(pad) + "│",
    "└" + line("─", w) + "┘",
    "",
  ].join("\n");
}

export function section(text: string): string {
  return "› " + text + "\n";
}

export function separator(): string {
  return line("─", 42);
}

export function loading(text: string): string {
  return "… " + text + "\n";
}

export function block(lines: string[]): string {
  return lines.join("\n") + "\n";
}
