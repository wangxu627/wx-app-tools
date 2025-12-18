// Stock Price API Helper
export interface StockPrice {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  lastUpdate: string;
}

class StockPriceService {
  private baseUrl = "https://www.alphavantage.co/query";
  private lastRequestTime = 0;
  private readonly REQUEST_INTERVAL = 1500; // 1.5 seconds

  // 确保请求间隔
  private async ensureInterval(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.REQUEST_INTERVAL) {
      const waitTime = this.REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  async getStockPrice(symbol: string): Promise<StockPrice> {
    try {
      // 确保请求间隔
      await this.ensureInterval();

      const apiKey = "GAKOQTF0L2T4EQKA";
      const response = await fetch(
        `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );
      const data = await response.json();

      // 检查 API 限制
      if (
        data["Information"] &&
        data["Information"].includes("more sparingly")
      ) {
        console.warn("API rate limit reached, using fallback data");
        throw new Error("API rate limit");
      }

      if (response.ok && data["Global Quote"]) {
        const quote = data["Global Quote"];
        const price = parseFloat(quote["05. price"]);
        const change = parseFloat(quote["09. change"]);

        return {
          symbol,
          price: Number(price.toFixed(2)),
          change: change,
          changePercent: parseFloat(
            quote["10. change percent"].replace("%", "")
          ),
          lastUpdate: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);

      // Fallback: generate mock price with small random change
      return {
        symbol,
        price: Math.random() * 1000 + 50, // Random price between 50-1050
        change: (Math.random() - 0.5) * 20, // Random change ±10
        changePercent: (Math.random() - 0.5) * 5, // Random change ±2.5%
        lastUpdate: new Date().toISOString(),
      };
    }
  }

  async updateStockPrices(stockCodes: string[]): Promise<StockPrice[]> {
    const promises = stockCodes.map((code) => this.getStockPrice(code));
    const results = await Promise.allSettled(promises);

    return results
      .filter(
        (result): result is PromiseFulfilledResult<StockPrice> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value);
  }
}

export const stockPriceService = new StockPriceService();
