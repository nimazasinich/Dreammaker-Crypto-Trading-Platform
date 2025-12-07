/**
 * useSignalAgent Hook
 * Connects SignalAgent to market data and manages signal detection
 */

import { useEffect, useState, useCallback } from 'react';
import { SignalAgent, AgentStatus, AgentConfig } from '../services/SignalAgent';
import { ExtremePoint } from '../services/ExtremePointsDetector';
import { MarketData } from '../types/index';

interface UseSignalAgentReturn {
  signals: ExtremePoint[];
  status: AgentStatus | null;
  config: AgentConfig;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  configure: (config: Partial<AgentConfig>) => void;
  checkSymbol: (symbol: string) => Promise<ExtremePoint | null>;
}

// Mock market data fetcher - replace with real API
const createMockMarketDataFetcher = () => {
  return async (symbol: string) => {
    // Generate mock OHLCV data
    const now = Date.now();
    const data: MarketData[] = [];
    let price = symbol.includes('BTC') ? 43000 : symbol.includes('ETH') ? 2300 : 100;
    
    for (let i = 100; i >= 0; i--) {
      const volatility = price * 0.02;
      const change = (Math.random() - 0.5) * volatility;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      const volume = 1000000 + Math.random() * 5000000;
      
      data.push({
        timestamp: now - i * 3600000,
        open,
        high,
        low,
        close,
        volume
      });
      
      price = close;
    }

    return {
      data,
      currentPrice: data[data.length - 1].close,
      volume24hUSD: 50000000 + Math.random() * 100000000 // $50M-$150M
    };
  };
};

export function useSignalAgent(): UseSignalAgentReturn {
  const [signals, setSignals] = useState<ExtremePoint[]>([]);
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [config, setConfig] = useState<AgentConfig>({
    enabled: false,
    symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'MATICUSDT'],
    checkIntervalMs: 60000,
    minConfidence: 60,
    minVolumeUSD: 2_000_000
  });

  const agent = SignalAgent.getInstance();

  useEffect(() => {
    // Set up market data fetcher
    agent.setMarketDataFetcher(createMockMarketDataFetcher());

    // Subscribe to signals
    const unsubscribe = agent.subscribe((signal) => {
      setSignals(prev => {
        const exists = prev.find(s => s.id === signal.id);
        if (exists) return prev;
        return [signal, ...prev].slice(0, 50);
      });
    });

    // Load initial signals
    setSignals(agent.getActiveSignals());
    setStatus(agent.getStatus());
    setConfig(agent.getConfig());

    // Update status periodically
    const statusInterval = setInterval(() => {
      setStatus(agent.getStatus());
      setSignals(agent.getActiveSignals());
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(statusInterval);
    };
  }, [agent]);

  const start = useCallback(() => {
    agent.start();
    setStatus(agent.getStatus());
  }, [agent]);

  const stop = useCallback(() => {
    agent.stop();
    setStatus(agent.getStatus());
  }, [agent]);

  const configure = useCallback((newConfig: Partial<AgentConfig>) => {
    agent.configure(newConfig);
    setConfig(agent.getConfig());
  }, [agent]);

  const checkSymbol = useCallback(async (symbol: string) => {
    return agent.checkSymbol(symbol);
  }, [agent]);

  return {
    signals,
    status,
    config,
    isRunning: status?.isRunning ?? false,
    start,
    stop,
    configure,
    checkSymbol
  };
}

export default useSignalAgent;
