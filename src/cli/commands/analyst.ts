import promptSync from "prompt-sync";
import { fetch } from "undici";

const prompt = promptSync({ sigint: true });

type AnalystToken = {
  name?: string;
  symbol?: string;
  mint?: string;
  description?: string;
  image?: string;
  creation?: {
    creator?: string;
    created_time?: number;
  };
};

type AnalystPool = {
  market?: string;
  quoteToken?: string;
  liquidity?: { usd?: number };
  price?: { usd?: number };
  marketCap?: { usd?: number };
  txns?: {
    volume24h?: number;
    buys?: number;
    sells?: number;
  };
};

type AnalystRisk = {
  top10?: number;
  dev?: { percentage?: number };
  snipers?: { count?: number; totalPercentage?: number };
  insiders?: { count?: number; totalPercentage?: number };
  rugged?: boolean;
  jupiterVerified?: boolean;
  risks?: string[];
};

type AnalystEventsBucket = {
  priceChangePercentage?: number;
};

type AnalystEvents = {
  [key: string]: AnalystEventsBucket | undefined;
};

type AnalystResponse = {
  token?: AnalystToken;
  pools?: AnalystPool[];
  risk?: AnalystRisk;
  events?: AnalystEvents;
  buys?: number;
  sells?: number;
  txns?: number;
  holders?: number;
  error?: string;
};

function readTokenAddressFromArgs(args: string[]): string {
  return (args[0] || "").trim();
}

function readTokenAddressInteractive(): string {
  const line = prompt("Solana mint address: ");
  return line.trim();
}

function resolveTokenAddress(args: string[]): string {
  const fromArgs = readTokenAddressFromArgs(args);
  if (fromArgs.length > 0) {
    return fromArgs;
  }
  return readTokenAddressInteractive();
}

function getAnalystEndpoint(): string {
  const base = process.env.AEXUS_TOKEN_ANALYST_URL || "";
  return base;
}

function buildAnalystUrl(base: string, tokenAddress: string): string {
  const url = new URL(base);
  url.searchParams.set("tokenAddress", tokenAddress);
  return url.toString();
}

function getAnalystHeaderName(): string {
  return "Accept";
}

function getAnalystHeaderValue(): string {
  return "application/json";
}

function formatUsd(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) {
    return "-";
  }
  const v = value;
  if (Math.abs(v) >= 1_000_000_000)
    return "$" + (v / 1_000_000_000).toFixed(2) + "B";
  if (Math.abs(v) >= 1_000_000) return "$" + (v / 1_000_000).toFixed(2) + "M";
  if (Math.abs(v) >= 1_000) return "$" + (v / 1_000).toFixed(2) + "K";
  return "$" + v.toFixed(4);
}

function formatInt(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) {
    return "-";
  }
  return value.toLocaleString("en-US");
}

function formatPct(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) {
    return "-";
  }
  return value.toFixed(2) + "%";
}

function formatUnixTimestamp(value: number | undefined | null): string {
  if (!value) return "-";
  const d = new Date(value * 1000);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toISOString().replace("T", " ").split(".")[0] + " UTC";
}

function printTitle(text: string) {
  process.stdout.write(text + "\n");
}

function printDivider() {
  process.stdout.write("----------------------------------------\n");
}

function printSectionLabel(label: string) {
  process.stdout.write("\n" + label + "\n");
  printDivider();
}

function printTokenProfile(
  token: AnalystToken | undefined,
  risk: AnalystRisk | undefined
) {
  const name = token?.name || "Unknown Token";
  const symbol = token?.symbol || "-";
  const mint = token?.mint || "-";
  const desc = token?.description || "No description available.";
  const creator = token?.creation?.creator || "-";
  const createdTime = formatUnixTimestamp(
    token?.creation?.created_time || null
  );
  const jupiter =
    risk?.jupiterVerified === true
      ? "Yes"
      : risk?.jupiterVerified === false
      ? "No"
      : "Unknown";
  const rugged =
    risk?.rugged === true ? "Yes" : risk?.rugged === false ? "No" : "Unknown";

  printSectionLabel("Token profile");
  process.stdout.write(`Name: ${name}\n`);
  process.stdout.write(`Symbol: ${symbol}\n`);
  process.stdout.write(`Mint: ${mint}\n`);
  process.stdout.write(`Creator: ${creator}\n`);
  process.stdout.write(`Created: ${createdTime}\n`);
  process.stdout.write(`Jupiter verified: ${jupiter}\n`);
  process.stdout.write(`Rugged: ${rugged}\n`);
  process.stdout.write("\nDescription:\n");
  process.stdout.write(desc + "\n");
}

function printHeadlineMetrics(
  pools: AnalystPool[] | undefined,
  buys: number,
  sells: number,
  txns: number,
  holders: number
) {
  let bestPool: AnalystPool | undefined;
  let maxLiquidity = -1;
  let totalLiquidity = 0;
  let bestMarketCap = 0;

  if (pools && pools.length > 0) {
    for (const pool of pools) {
      const liq = pool.liquidity?.usd ?? 0;
      const mc = pool.marketCap?.usd ?? 0;
      totalLiquidity += liq;
      if (liq > maxLiquidity) {
        maxLiquidity = liq;
        bestPool = pool;
      }
      if (mc > bestMarketCap) {
        bestMarketCap = mc;
      }
    }
  }

  const lastPrice = bestPool?.price?.usd ?? null;
  printSectionLabel("Headline metrics");
  process.stdout.write(`Last price (USD): ${formatUsd(lastPrice)}\n`);
  process.stdout.write(
    `Market cap (USD): ${formatUsd(bestMarketCap || null)}\n`
  );
  process.stdout.write(
    `Total liquidity (USD): ${formatUsd(totalLiquidity || null)}\n`
  );
  process.stdout.write(
    `Txns: ${formatInt(txns)} (buys ${formatInt(buys)}, sells ${formatInt(
      sells
    )})\n`
  );
  process.stdout.write(`Holders: ${formatInt(holders)}\n`);
}

function printPriceEvents(events: AnalystEvents | undefined) {
  const buckets = [
    "1m",
    "5m",
    "15m",
    "30m",
    "1h",
    "2h",
    "3h",
    "4h",
    "6h",
    "12h",
    "24h",
  ];
  printSectionLabel("Price change events");
  for (const key of buckets) {
    const bucket = events?.[key];
    const pct = bucket?.priceChangePercentage ?? null;
    const label =
      pct == null || Number.isNaN(pct)
        ? "-"
        : (pct > 0 ? "+" : "") + pct.toFixed(2) + "%";
    process.stdout.write(`${key.padEnd(4, " ")}: ${label}\n`);
  }
}

function printRiskSurface(risk: AnalystRisk | undefined) {
  const top10 = formatPct(risk?.top10 ?? null);
  const dev = formatPct(risk?.dev?.percentage ?? null);
  const snipersCount = formatInt(risk?.snipers?.count ?? null);
  const snipersPct = formatPct(risk?.snipers?.totalPercentage ?? null);
  const insidersCount = formatInt(risk?.insiders?.count ?? null);
  const insidersPct = formatPct(risk?.insiders?.totalPercentage ?? null);

  printSectionLabel("Risk surface");
  process.stdout.write(`Top 10 holders: ${top10}\n`);
  process.stdout.write(`Dev holdings: ${dev}\n`);
  process.stdout.write(`Snipers: ${snipersCount} | ${snipersPct}\n`);
  process.stdout.write(`Insiders: ${insidersCount} | ${insidersPct}\n`);

  const flags = risk?.risks || [];
  if (!flags.length) {
    process.stdout.write("Risk flags: none reported\n");
  } else {
    process.stdout.write("Risk flags:\n");
    for (const flag of flags) {
      process.stdout.write(`- ${flag}\n`);
    }
  }
}

function printPools(pools: AnalystPool[] | undefined) {
  printSectionLabel("Pools");
  if (!pools || pools.length === 0) {
    process.stdout.write("No pools returned for this token.\n");
    return;
  }

  const header = [
    "Market".padEnd(12, " "),
    "Quote".padEnd(8, " "),
    "Liquidity USD".padEnd(16, " "),
    "Price USD".padEnd(14, " "),
    "Vol 24h".padEnd(16, " "),
    "Buys".padEnd(8, " "),
    "Sells".padEnd(8, " "),
  ].join(" ");

  process.stdout.write(header + "\n");

  for (const p of pools) {
    const market = (p.market || "-").slice(0, 12).padEnd(12, " ");
    const quote = (p.quoteToken || "-").slice(0, 8).padEnd(8, " ");
    const liq = formatUsd(p.liquidity?.usd ?? null).padEnd(16, " ");
    const price = formatUsd(p.price?.usd ?? null).padEnd(14, " ");
    const v24 = formatUsd(p.txns?.volume24h ?? null).padEnd(16, " ");
    const buys = formatInt(p.txns?.buys ?? null).padEnd(8, " ");
    const sells = formatInt(p.txns?.sells ?? null).padEnd(8, " ");
    process.stdout.write(
      [market, quote, liq, price, v24, buys, sells].join(" ") + "\n"
    );
  }
}

export async function runAnalystCommand(args: string[]): Promise<void> {
  const endpoint = getAnalystEndpoint();
  if (!endpoint) {
    process.stderr.write(
      "Token analyst endpoint is not configured. Set AEXUS_TOKEN_ANALYST_URL in environment.\n"
    );
    return;
  }

  const tokenAddress = resolveTokenAddress(args);
  if (!tokenAddress) {
    process.stderr.write("Empty token address. Nothing to scan.\n");
    return;
  }

  printTitle("AEXUS Analyst");
  printDivider();
  process.stdout.write(`Target mint: ${tokenAddress}\n`);

  const url = buildAnalystUrl(endpoint, tokenAddress);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        [getAnalystHeaderName()]: getAnalystHeaderValue(),
      },
    });

    const text = await res.text();
    let data: AnalystResponse;

    try {
      data = JSON.parse(text) as AnalystResponse;
    } catch {
      process.stderr.write("Failed to parse analyst payload as JSON.\n");
      if (text) {
        process.stderr.write(text + "\n");
      }
      return;
    }

    if (!res.ok) {
      const message = data.error || `${res.status} ${res.statusText}`;
      process.stderr.write(`Analyst error: ${message}\n`);
      return;
    }

    const token = data.token;
    const pools = data.pools || [];
    const risk = data.risk;
    const events = data.events;
    const buys = data.buys ?? 0;
    const sells = data.sells ?? 0;
    const txns = data.txns ?? 0;
    const holders = data.holders ?? 0;

    printTokenProfile(token, risk);
    printHeadlineMetrics(pools, buys, sells, txns, holders);
    printPriceEvents(events);
    printRiskSurface(risk);
    printPools(pools);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Analyst request failed: ${msg}\n`);
  }
}
