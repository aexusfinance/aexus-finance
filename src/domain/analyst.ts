import {
  SolanaTokenAnalysis,
  SolanaTokenMetadata,
  SolanaTokenPoolSnapshot,
  SolanaTokenRiskSnapshot,
  SolanaTokenPriceEvents,
  PriceChangeWindowKey,
} from "../services/solanaTrackerClient";

export interface TokenProfile {
  name: string;
  symbol: string;
  mint: string;
  description: string;
  imageUrl?: string;
  creator?: string;
  createdAt?: Date;
  isJupiterVerified?: boolean;
  isRugged?: boolean;
}

export interface PoolView {
  market: string;
  quoteToken: string;
  liquidityUsd: number | null;
  priceUsd: number | null;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
  buys24h: number | null;
  sells24h: number | null;
}

export interface RiskSurface {
  top10Percentage: number | null;
  devHoldingsPercentage: number | null;
  snipersCount: number | null;
  snipersPercentage: number | null;
  insidersCount: number | null;
  insidersPercentage: number | null;
  hasRiskFlags: boolean;
  flags: string[];
}

export interface PriceChangeBucket {
  key: PriceChangeWindowKey;
  percentage: number | null;
}

export interface AnalystView {
  profile: TokenProfile;
  pools: PoolView[];
  risk: RiskSurface;
  priceChanges: PriceChangeBucket[];
  lastPriceUsd: number | null;
  marketCapUsd: number | null;
  totalLiquidityUsd: number | null;
  totalTxns: number;
  totalBuys: number;
  totalSells: number;
  holders: number;
  createdAt: Date;
  raw: SolanaTokenAnalysis;
}

function toDateFromUnix(timestamp?: number): Date | undefined {
  if (!timestamp || typeof timestamp !== "number") return undefined;
  const ms = timestamp * 1000;
  if (!Number.isFinite(ms)) return undefined;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

function buildProfile(
  token?: SolanaTokenMetadata,
  risk?: SolanaTokenRiskSnapshot
): TokenProfile {
  const name =
    token && typeof token.name === "string" && token.name.trim().length > 0
      ? token.name.trim()
      : "Unknown";
  const symbol =
    token && typeof token.symbol === "string" && token.symbol.trim().length > 0
      ? token.symbol.trim()
      : "-";
  const mint =
    token && typeof token.mint === "string" && token.mint.trim().length > 0
      ? token.mint.trim()
      : "Unknown mint";
  const description =
    token &&
    typeof token.description === "string" &&
    token.description.trim().length > 0
      ? token.description.trim()
      : "No description available.";
  const imageUrl =
    token && typeof token.image === "string" && token.image.trim().length > 0
      ? token.image.trim()
      : undefined;
  const creator =
    token &&
    token.creation &&
    typeof token.creation.creator === "string" &&
    token.creation.creator.trim().length > 0
      ? token.creation.creator.trim()
      : undefined;
  const createdAt =
    token && token.creation
      ? toDateFromUnix(token.creation.created_time)
      : undefined;
  const isVerified =
    risk && typeof risk.jupiterVerified === "boolean"
      ? risk.jupiterVerified
      : undefined;
  const isRugged =
    risk && typeof risk.rugged === "boolean" ? risk.rugged : undefined;

  return {
    name,
    symbol,
    mint,
    description,
    imageUrl,
    creator,
    createdAt,
    isJupiterVerified: isVerified,
    isRugged,
  };
}

function buildPoolView(pool: SolanaTokenPoolSnapshot): PoolView {
  const liquidityUsd =
    pool.liquidity && typeof pool.liquidity.usd === "number"
      ? pool.liquidity.usd
      : null;
  const priceUsd =
    pool.price && typeof pool.price.usd === "number" ? pool.price.usd : null;
  const marketCapUsd =
    pool.marketCap && typeof pool.marketCap.usd === "number"
      ? pool.marketCap.usd
      : null;
  const volume24hUsd =
    pool.txns && typeof pool.txns.volume24h === "number"
      ? pool.txns.volume24h
      : null;
  const buys24h =
    pool.txns && typeof pool.txns.buys === "number" ? pool.txns.buys : null;
  const sells24h =
    pool.txns && typeof pool.txns.sells === "number" ? pool.txns.sells : null;

  return {
    market: pool.market || "-",
    quoteToken: pool.quoteToken || "-",
    liquidityUsd,
    priceUsd,
    marketCapUsd,
    volume24hUsd,
    buys24h,
    sells24h,
  };
}

function aggregateMetrics(pools: PoolView[]) {
  if (pools.length === 0) {
    return {
      lastPriceUsd: null as number | null,
      marketCapUsd: null as number | null,
      totalLiquidityUsd: null as number | null,
    };
  }

  let maxLiq = -1;
  let mostLiquidPool: PoolView | null = null;
  let totalLiq = 0;
  let bestMcap = 0;

  for (const pool of pools) {
    const liq = typeof pool.liquidityUsd === "number" ? pool.liquidityUsd : 0;
    const mcap = typeof pool.marketCapUsd === "number" ? pool.marketCapUsd : 0;
    totalLiq += liq;
    if (liq > maxLiq) {
      maxLiq = liq;
      mostLiquidPool = pool;
    }
    if (mcap > bestMcap) {
      bestMcap = mcap;
    }
  }

  const lastPriceUsd =
    mostLiquidPool && typeof mostLiquidPool.priceUsd === "number"
      ? mostLiquidPool.priceUsd
      : null;
  const marketCapUsd = bestMcap > 0 ? bestMcap : null;
  const totalLiquidityUsd = totalLiq > 0 ? totalLiq : null;

  return {
    lastPriceUsd,
    marketCapUsd,
    totalLiquidityUsd,
  };
}

function buildRiskSurface(risk?: SolanaTokenRiskSnapshot): RiskSurface {
  const top10Percentage =
    risk && typeof risk.top10 === "number" ? risk.top10 : null;
  const devHoldingsPercentage =
    risk && risk.dev && typeof risk.dev.percentage === "number"
      ? risk.dev.percentage
      : null;

  const snipersCount =
    risk && risk.snipers && typeof risk.snipers.count === "number"
      ? risk.snipers.count
      : null;
  const snipersPercentage =
    risk && risk.snipers && typeof risk.snipers.totalPercentage === "number"
      ? risk.snipers.totalPercentage
      : null;

  const insidersCount =
    risk && risk.insiders && typeof risk.insiders.count === "number"
      ? risk.insiders.count
      : null;
  const insidersPercentage =
    risk && risk.insiders && typeof risk.insiders.totalPercentage === "number"
      ? risk.insiders.totalPercentage
      : null;

  const flags =
    risk && Array.isArray(risk.risks)
      ? risk.risks.map((v) => String(v).trim()).filter((v) => v.length > 0)
      : [];
  const ruggedFlag = risk && risk.rugged === true;
  const hasRiskFlags = ruggedFlag || flags.length > 0;

  return {
    top10Percentage,
    devHoldingsPercentage,
    snipersCount,
    snipersPercentage,
    insidersCount,
    insidersPercentage,
    hasRiskFlags,
    flags,
  };
}

function buildPriceChanges(
  events?: SolanaTokenPriceEvents
): PriceChangeBucket[] {
  const keys: PriceChangeWindowKey[] = [
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
  return keys.map((key) => {
    const bucket = events && events[key];
    const percentage =
      bucket && typeof bucket.priceChangePercentage === "number"
        ? bucket.priceChangePercentage
        : null;
    return { key, percentage };
  });
}

export function buildAnalystView(data: SolanaTokenAnalysis): AnalystView {
  const profile = buildProfile(data.token, data.risk);
  const pools = (data.pools || []).map(buildPoolView);
  const risk = buildRiskSurface(data.risk);
  const priceChanges = buildPriceChanges(data.events);

  const metrics = aggregateMetrics(pools);

  const totalTxns = typeof data.txns === "number" ? data.txns : 0;
  const totalBuys = typeof data.buys === "number" ? data.buys : 0;
  const totalSells = typeof data.sells === "number" ? data.sells : 0;
  const holders = typeof data.holders === "number" ? data.holders : 0;

  return {
    profile,
    pools,
    risk,
    priceChanges,
    lastPriceUsd: metrics.lastPriceUsd,
    marketCapUsd: metrics.marketCapUsd,
    totalLiquidityUsd: metrics.totalLiquidityUsd,
    totalTxns,
    totalBuys,
    totalSells,
    holders,
    createdAt: new Date(),
    raw: data,
  };
}
