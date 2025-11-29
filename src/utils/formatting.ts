export type Align = "left" | "right" | "center";

export function formatUsd(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000)
    return "$" + (value / 1_000_000_000).toFixed(2) + "B";
  if (abs >= 1_000_000) return "$" + (value / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return "$" + (value / 1_000).toFixed(2) + "K";
  if (abs >= 1) return "$" + value.toFixed(4);
  return "$" + value.toFixed(8);
}

export function formatPct(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(2) + "%";
}

export function formatInt(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return Math.trunc(value).toLocaleString("en-US");
}

export function pad(
  text: string,
  width: number,
  align: Align = "left"
): string {
  const normalized = text ?? "";
  const length = normalized.length;
  if (length === width) return normalized;
  if (length > width) return normalized.slice(0, width);
  const space = " ".repeat(width - length);
  if (align === "right") return space + normalized;
  if (align === "center") {
    const left = Math.floor((width - length) / 2);
    const right = width - length - left;
    return " ".repeat(left) + normalized + " ".repeat(right);
  }
  return normalized + space;
}

export interface TableColumn {
  header: string;
  width: number;
  align?: Align;
}

export function renderTableRow(
  values: string[],
  columns: TableColumn[]
): string {
  const cells = columns.map((col, index) => {
    const value = values[index] ?? "";
    return pad(value, col.width, col.align ?? "left");
  });
  return cells.join("  ");
}

export function renderTableHeader(columns: TableColumn[]): string {
  const header = renderTableRow(
    columns.map((col) => col.header.toUpperCase()),
    columns
  );
  const underline = columns
    .map((col) =>
      "-".repeat(Math.min(col.width, Math.max(3, col.header.length)))
    )
    .join("  ");
  return header + "\n" + underline;
}
