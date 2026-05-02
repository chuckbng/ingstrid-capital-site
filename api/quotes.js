export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing FINNHUB_API_KEY environment variable",
      });
    }

    const rawSymbols = String(req.query.symbols || "")
      .split(",")
      .map((s) => s.trim().toUpperCase().replace(/[^A-Z0-9.\-^]/g, ""))
      .filter(Boolean);

    const symbols = [...new Set(rawSymbols)].slice(0, 25);

    if (!symbols.length) {
      return res.status(400).json({ error: "Missing symbols" });
    }

    const quotePromises = symbols.map(async (symbol) => {
      try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
          symbol
        )}&token=${encodeURIComponent(apiKey)}`;

        const response = await fetch(url);

        if (!response.ok) {
          return {
            symbol,
            error: true,
            message: `Provider returned ${response.status}`,
          };
        }

        const data = await response.json();

        const price = Number(data.c || 0);
        const previousClose = Number(data.pc || 0);
        const change = Number(data.d || price - previousClose || 0);
        const changePercent = Number(data.dp || 0);
        const timestamp = data.t ? new Date(data.t * 1000).toISOString() : null;

        if (!price) {
          return {
            symbol,
            error: true,
            message: "No quote returned",
          };
        }

        return {
          symbol,
          price,
          change,
          changePercent,
          high: Number(data.h || 0),
          low: Number(data.l || 0),
          open: Number(data.o || 0),
          previousClose,
          timestamp,
        };
      } catch (error) {
        return {
          symbol,
          error: true,
          message: error.message,
        };
      }
    });

    const quotes = await Promise.all(quotePromises);

    res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=45");

    return res.status(200).json({
      provider: "Finnhub",
      asOf: new Date().toISOString(),
      count: quotes.length,
      quotes,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal quotes API error",
      message: error.message,
    });
  }
}
