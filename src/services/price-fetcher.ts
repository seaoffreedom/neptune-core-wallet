/**
 * Price Fetcher Service
 *
 * Service for fetching Neptune cryptocurrency prices from CoinGecko API.
 * Provides a simple interface for price data retrieval with error handling.
 */

// CoinGecko API configuration
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const NEPTUNE_COIN_ID = 'neptune-cash';

// Price data interface
export interface PriceData {
  usd: number;
  eur: number;
  gbp: number;
  timestamp: Date;
}

// CoinGecko API response interface
interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    eur: number;
    gbp: number;
  };
}

/**
 * Fetch Neptune prices from CoinGecko API
 * @returns Promise<PriceData | null> - Price data or null if fetch fails
 */
export async function fetchNeptunePrices(): Promise<PriceData | null> {
  try {
    const url = `${COINGECKO_API_BASE}/simple/price?ids=${NEPTUNE_COIN_ID}&vs_currencies=usd,eur,gbp`;

    console.log(`💰 Fetching Neptune prices from: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Neptune-Core-Wallet/1.0.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: CoinGeckoResponse = await response.json();
    const prices = data[NEPTUNE_COIN_ID];

    if (!prices || !prices.usd || !prices.eur || !prices.gbp) {
      throw new Error('Invalid price data received from CoinGecko');
    }

    const priceData: PriceData = {
      usd: prices.usd,
      eur: prices.eur,
      gbp: prices.gbp,
      timestamp: new Date(),
    };

    console.log(
      `✅ Successfully fetched Neptune prices: $${priceData.usd.toFixed(4)} USD, €${priceData.eur.toFixed(4)} EUR, £${priceData.gbp.toFixed(4)} GBP`
    );

    return priceData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to fetch Neptune prices: ${errorMessage}`);
    return null;
  }
}

/**
 * Check if price data is still valid based on cache TTL
 * @param lastFetched - Timestamp of last fetch
 * @param cacheTtlMinutes - Cache TTL in minutes
 * @returns boolean - True if cache is still valid
 */
export function isPriceCacheValid(
  lastFetched: Date,
  cacheTtlMinutes: number
): boolean {
  const now = new Date();
  const cacheExpiry = new Date(lastFetched.getTime() + cacheTtlMinutes * 60 * 1000);
  return now < cacheExpiry;
}

/**
 * Check if price data has changed significantly
 * @param oldPrices - Previous price data
 * @param newPrices - New price data
 * @param threshold - Minimum change threshold (default: 0.01 = 1%)
 * @returns boolean - True if prices have changed significantly
 */
export function hasPriceDataChanged(
  oldPrices: PriceData | null,
  newPrices: PriceData,
  threshold: number = 0.01
): boolean {
  if (!oldPrices) return true;

  const usdChange = Math.abs(newPrices.usd - oldPrices.usd) / oldPrices.usd;
  const eurChange = Math.abs(newPrices.eur - oldPrices.eur) / oldPrices.eur;
  const gbpChange = Math.abs(newPrices.gbp - oldPrices.gbp) / oldPrices.gbp;

  return usdChange > threshold || eurChange > threshold || gbpChange > threshold;
}
