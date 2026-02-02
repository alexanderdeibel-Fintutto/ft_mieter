import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Stock market and crypto portfolio tracking
// For MeineVermögen/FinTuttO app

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { ticker, type = 'stock' } = payload; // 'stock', 'etf', 'crypto'

    // Mock market data
    const mockData = {
      ticker,
      type,
      current_price: Math.floor(Math.random() * 500 + 10),
      change_percent: (Math.random() * 10 - 5).toFixed(2),
      currency: type === 'crypto' ? 'USD' : 'EUR',
      timestamp: new Date().toISOString(),
    };

    // In production: call Alpha Vantage, Yahoo Finance, or CoinGecko
    if (type === 'crypto') {
      mockData.source = 'CoinGecko';
      mockData.market_cap = Math.floor(Math.random() * 1000000000);
    } else {
      mockData.source = 'Yahoo Finance';
      mockData.volume = Math.floor(Math.random() * 10000000);
    }

    return Response.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error(`Portfolio error: ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
});