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

    const rawSymbol = String(req.query.symbol || "").trim().toUpperCase();
    const symbol = rawSymbol.replace(/[^A-Z0-9.\-^]/g, "");

    if (!symbol) {
      return res.status(400).json({ error: "Missing symbol" });
    }

    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
      symbol
    )}&token=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Finnhub request failed",
        status: response.status,
      });
    }

    const data = await response.json();

    const price = Number(data.c || 0);
    const previousClose = Number(data.pc || 0);
    const change = Number(data.d || price - previousClose || 0);
    const changePercent = Number(data.dp || 0);
    const timestamp = data.t ? new Date(data.t * 1000).toISOString() : null;

    if (!price) {
      return res.status(404).json({
        error: "No quote returned for symbol",
        symbol,
        provider: "Finnhub",
      });
    }

    res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=45");

    return res.status(200).json({
      symbol,
      price,
      change,
      changePercent,
      high: Number(data.h || 0),
      low: Number(data.l || 0),
      open: Number(data.o || 0),
      previousClose,
      timestamp,
      provider: "Finnhub",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal quote API error",
      message: error.message,
    });
  }
}
