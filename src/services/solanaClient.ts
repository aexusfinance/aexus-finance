import { getEnv } from "../core/env";
import { requestJson } from "../core/http";

export type PriceChangeWindowKey =
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "2h"
  | "3h"
  | "4h"
  | "6h"
  | "12h"
  | "24h";

export interface SolanaTokenMetadata {
  name?: string;
  symbol?: string;
  mint?: string;
  description?: string;
  image?: string;
  creation?: {
    creator?: string;
    created_time?: number;
  };
}

export interface SolanaTokenPoolSnapshot {
  market?: string;
  quoteToken?: string;
  liquidity?: {
    usd?: number;
  };
  price?: {
    usd?: number;
  };
  marketCap?: {
    usd?: number;
  };
  txns?: {
    volume24h?: number;
    buys?: number;
    sells?: number;
  };
}

export interface SolanaTokenRiskSnapshot {
  top10?: number;
  dev?: {
    percentage?: number;
  };
  snipers?: {
    count?: number;
    totalPercentage?: number;
  };
  insiders?: {
    count?: number;
    totalPercentage?: number;
  };
  rugged?: boolean;
  jupiterVerified?: boolean;
  risks?: string[];
}

export type SolanaTokenPriceEvents = Partial<
  Record<
    PriceChangeWindowKey,
    {
      priceChangePercentage?: number;
    }
  >
>;

export interface SolanaTokenAnalysis {
  token?: SolanaTokenMetadata;
  pools?: SolanaTokenPoolSnapshot[];
  events?: SolanaTokenPriceEvents;
  risk?: SolanaTokenRiskSnapshot;
  buys?: number;
  sells?: number;
  txns?: number;
  holders?: number;
}

function selectAnalystBaseUrl(): string {
  const env = getEnv();
  if (
    env.AEXUS_TOKEN_ANALYST_URL &&
    env.AEXUS_TOKEN_ANALYST_URL.trim().length > 0
  ) {
    return env.AEXUS_TOKEN_ANALYST_URL;
  }
  if (
    env.AEXUS_ANALYST_BASE_URL &&
    env.AEXUS_ANALYST_BASE_URL.trim().length > 0
  ) {
    return env.AEXUS_ANALYST_BASE_URL;
  }
  throw new Error("AEXUS analyst base URL is not configured");
}

function buildTokenAnalysisUrl(mint: string): string {
  const base = selectAnalystBaseUrl();
  const trimmed = base.trim();
  const normalized = trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
  const encodedMint = encodeURIComponent(mint.trim());
  return normalized + "/" + encodedMint;
}

function buildAnalystHeaders(): Record<string, string> {
  const env = getEnv();
  const headers: Record<string, string> = {};
  if (
    env.AEXUS_ANALYST_API_KEY &&
    env.AEXUS_ANALYST_API_KEY.trim().length > 0
  ) {
    headers["api-key"] = env.AEXUS_ANALYST_API_KEY.trim();
  }
  return headers;
}

export async function fetchSolanaTokenAnalysis(
  mint: string
): Promise<SolanaTokenAnalysis> {
  if (!mint || mint.trim().length === 0) {
    throw new Error("Token mint is required");
  }
  const url = buildTokenAnalysisUrl(mint);
  const headers = buildAnalystHeaders();
  return requestJson<SolanaTokenAnalysis>("GET", url, { headers });
}
