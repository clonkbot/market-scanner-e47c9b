import { useState, useEffect, useMemo } from 'react';
import './styles.css';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: string;
  chartData: number[];
  bestBuy: number;
  bestSell: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

const generateChartData = (basePrice: number, volatility: number): number[] => {
  const data: number[] = [];
  let price = basePrice * (1 - volatility * 0.5 + Math.random() * volatility);
  for (let i = 0; i < 60; i++) {
    const change = (Math.random() - 0.5) * volatility * basePrice;
    price = Math.max(price + change, basePrice * 0.9);
    price = Math.min(price, basePrice * 1.1);
    data.push(price);
  }
  return data;
};

const calculateBestPrices = (chartData: number[], currentPrice: number): { bestBuy: number; bestSell: number } => {
  const min = Math.min(...chartData);
  const max = Math.max(...chartData);
  const avg = chartData.reduce((a, b) => a + b, 0) / chartData.length;
  const support = min + (avg - min) * 0.3;
  const resistance = max - (max - avg) * 0.3;

  return {
    bestBuy: Math.round(support * 100) / 100,
    bestSell: Math.round(resistance * 100) / 100
  };
};

const initialMarkets: MarketData[] = [
  { symbol: 'MES', name: 'Micro E-mini S&P 500', price: 6012.75, change: 18.50, changePercent: 0.31, high: 6025.00, low: 5998.25, volume: '1.2M', chartData: [], bestBuy: 0, bestSell: 0, trend: 'bullish' },
  { symbol: 'MNQ', name: 'Micro E-mini Nasdaq-100', price: 21458.25, change: -42.75, changePercent: -0.20, high: 21525.00, low: 21380.50, volume: '892K', chartData: [], bestBuy: 0, bestSell: 0, trend: 'bearish' },
  { symbol: 'MYM', name: 'Micro E-mini Dow', price: 44215.00, change: 156.00, changePercent: 0.35, high: 44350.00, low: 44050.00, volume: '456K', chartData: [], bestBuy: 0, bestSell: 0, trend: 'bullish' },
  { symbol: 'M2K', name: 'Micro E-mini Russell 2000', price: 2298.40, change: -8.20, changePercent: -0.36, high: 2315.00, low: 2285.60, volume: '234K', chartData: [], bestBuy: 0, bestSell: 0, trend: 'bearish' },
  { symbol: 'MGC', name: 'Micro Gold', price: 2948.30, change: 12.40, changePercent: 0.42, high: 2955.00, low: 2932.80, volume: '178K', chartData: [], bestBuy: 0, bestSell: 0, trend: 'bullish' },
  { symbol: 'MCL', name: 'Micro Crude Oil', price: 71.24, change: -0.86, changePercent: -1.19, high: 72.45, low: 70.88, volume: '567K', chartData: [], bestBuy: 0, bestSell: 0, trend: 'bearish' },
];

const MiniChart = ({ data, trend, width = 200, height = 60 }: { data: number[]; trend: string; width?: number; height?: number }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = `0,${height} ${points} ${width},${height}`;
  const color = trend === 'bullish' ? '#00ff88' : trend === 'bearish' ? '#ff4466' : '#ffd700';
  const fillColor = trend === 'bullish' ? 'rgba(0, 255, 136, 0.15)' : trend === 'bearish' ? 'rgba(255, 68, 102, 0.15)' : 'rgba(255, 215, 0, 0.15)';

  return (
    <svg width={width} height={height} className="chart-svg">
      <defs>
        <linearGradient id={`grad-${trend}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#grad-${trend})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 10) - 5}
        r="4"
        fill={color}
        className="pulse-dot"
      />
    </svg>
  );
};

const MarketCard = ({ market, index }: { market: MarketData; index: number }) => {
  const trendClass = market.trend === 'bullish' ? 'text-emerald-400' : market.trend === 'bearish' ? 'text-rose-400' : 'text-amber-400';
  const bgTrend = market.trend === 'bullish' ? 'border-emerald-500/20' : market.trend === 'bearish' ? 'border-rose-500/20' : 'border-amber-500/20';

  return (
    <div
      className={`market-card bg-zinc-900/80 backdrop-blur-sm border ${bgTrend} rounded-lg p-3 md:p-4 hover:bg-zinc-800/90 transition-all duration-300`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-2 md:mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base md:text-lg font-bold text-white font-mono">{market.symbol}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${market.trend === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' : market.trend === 'bearish' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {market.trend.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[120px] md:max-w-none">{market.name}</p>
          </div>
          <div className="text-right">
            <div className="text-lg md:text-xl font-bold text-white font-mono">
              ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-xs md:text-sm font-mono ${trendClass}`}>
              {market.change >= 0 ? '+' : ''}{market.change.toFixed(2)} ({market.changePercent >= 0 ? '+' : ''}{market.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-3 flex justify-center overflow-hidden">
          <div className="w-full max-w-full">
            <MiniChart data={market.chartData} trend={market.trend} width={180} height={50} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-xs mb-3 text-zinc-400">
          <div>
            <span className="block text-zinc-600 text-[10px]">HIGH</span>
            <span className="font-mono">${market.high.toLocaleString()}</span>
          </div>
          <div className="text-center">
            <span className="block text-zinc-600 text-[10px]">LOW</span>
            <span className="font-mono">${market.low.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="block text-zinc-600 text-[10px]">VOL</span>
            <span className="font-mono">{market.volume}</span>
          </div>
        </div>

        {/* Best Price Recommendations */}
        <div className="border-t border-zinc-800 pt-3 mt-auto">
          <div className="text-[10px] text-zinc-600 mb-2 tracking-wider">OPTIMAL ENTRY POINTS</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded px-2 py-2 text-center">
              <span className="block text-[10px] text-emerald-400/70 mb-0.5">BUY AT</span>
              <span className="text-sm md:text-base font-bold text-emerald-400 font-mono">
                ${market.bestBuy.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/30 rounded px-2 py-2 text-center">
              <span className="block text-[10px] text-rose-400/70 mb-0.5">SELL AT</span>
              <span className="text-sm md:text-base font-bold text-rose-400 font-mono">
                ${market.bestSell.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const initMarkets = initialMarkets.map(m => {
      const chartData = generateChartData(m.price, 0.02);
      const { bestBuy, bestSell } = calculateBestPrices(chartData, m.price);
      return { ...m, chartData, bestBuy, bestSell };
    });
    setMarkets(initMarkets);
  }, []);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setMarkets(prev => prev.map(m => {
        const priceChange = (Math.random() - 0.5) * m.price * 0.001;
        const newPrice = Math.round((m.price + priceChange) * 100) / 100;
        const newChartData = [...m.chartData.slice(1), newPrice];
        const { bestBuy, bestSell } = calculateBestPrices(newChartData, newPrice);
        const newChange = m.change + priceChange;
        const newChangePercent = (newChange / (m.price - m.change)) * 100;

        return {
          ...m,
          price: newPrice,
          change: Math.round(newChange * 100) / 100,
          changePercent: Math.round(newChangePercent * 100) / 100,
          chartData: newChartData,
          bestBuy,
          bestSell,
          trend: newChangePercent > 0.1 ? 'bullish' : newChangePercent < -0.1 ? 'bearish' : 'neutral'
        };
      }));
      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const sortedMarkets = useMemo(() => {
    return [...markets].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  }, [markets]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden flex flex-col">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Grid Pattern */}
      <div className="grid-pattern" />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800/50 backdrop-blur-xl bg-zinc-950/80 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold tracking-tight">
                  <span className="text-amber-400">MARKET</span>
                  <span className="text-white">SCANNER</span>
                </h1>
                <p className="text-xs text-zinc-500 tracking-wide">MICRO FUTURES · LIVE ANALYSIS</p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${isLive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}
              >
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                {isLive ? 'LIVE' : 'PAUSED'}
              </button>
              <div className="text-right hidden sm:block">
                <div className="text-xs text-zinc-600">LAST UPDATE</div>
                <div className="text-xs font-mono text-zinc-400">
                  {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 py-4 md:py-6 w-full">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="stat-card bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 md:p-4">
            <div className="text-[10px] md:text-xs text-zinc-600 tracking-wide mb-1">MARKETS TRACKED</div>
            <div className="text-xl md:text-2xl font-bold text-white font-mono">{markets.length}</div>
          </div>
          <div className="stat-card bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 md:p-4" style={{ animationDelay: '100ms' }}>
            <div className="text-[10px] md:text-xs text-zinc-600 tracking-wide mb-1">BULLISH</div>
            <div className="text-xl md:text-2xl font-bold text-emerald-400 font-mono">
              {markets.filter(m => m.trend === 'bullish').length}
            </div>
          </div>
          <div className="stat-card bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 md:p-4" style={{ animationDelay: '200ms' }}>
            <div className="text-[10px] md:text-xs text-zinc-600 tracking-wide mb-1">BEARISH</div>
            <div className="text-xl md:text-2xl font-bold text-rose-400 font-mono">
              {markets.filter(m => m.trend === 'bearish').length}
            </div>
          </div>
          <div className="stat-card bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 md:p-4" style={{ animationDelay: '300ms' }}>
            <div className="text-[10px] md:text-xs text-zinc-600 tracking-wide mb-1">TOP MOVER</div>
            <div className="text-base md:text-xl font-bold text-amber-400 font-mono truncate">
              {sortedMarkets[0]?.symbol || '---'}
            </div>
          </div>
        </div>

        {/* 1 Hour Window Label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-full">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-mono text-zinc-400">1H CHART WINDOW</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
        </div>

        {/* Market Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {markets.map((market, index) => (
            <MarketCard key={market.symbol} market={market} index={index} />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-4 md:gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span>Buy Zone - Support Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <span>Sell Zone - Resistance Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span>Neutral - Consolidation</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-zinc-600 font-mono">
            Requested by <span className="text-zinc-500">@Quincy</span> · Built by <span className="text-zinc-500">@clonkbot</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
