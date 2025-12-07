/**
 * SignalContext
 * Provides signal data and controls throughout the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { backgroundSignalService } from '../services/BackgroundSignalService';
import { ExtremePoint } from '../services/ExtremePointsDetector';

interface SignalContextType {
  signals: ExtremePoint[];
  isRunning: boolean;
  status: {
    checksPerformed: number;
    signalsGenerated: number;
    currentSymbol: string | null;
    lastCheck: number;
  } | null;
  start: () => void;
  stop: () => void;
  clearSignals: () => void;
}

const SignalContext = createContext<SignalContextType | undefined>(undefined);

interface SignalProviderProps {
  children: ReactNode;
  autoStart?: boolean;
}

export const SignalProvider: React.FC<SignalProviderProps> = ({ 
  children, 
  autoStart = false  // Default OFF - user controls when to start
}) => {
  const [signals, setSignals] = useState<ExtremePoint[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<SignalContextType['status']>(null);

  // Initialize background service
  useEffect(() => {
    const initService = async () => {
      await backgroundSignalService.initialize({
        autoStart,
        symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'MATICUSDT'],
        checkIntervalMs: 60000,
        minConfidence: 60,
        minVolumeUSD: 2_000_000,
        notifyOnSignal: true,
      });

      // Load existing signals
      setSignals(backgroundSignalService.getActiveSignals());
      updateStatus();
    };

    initService();

    // Subscribe to new signals
    const unsubscribe = backgroundSignalService.onSignal((signal) => {
      setSignals(prev => {
        const exists = prev.find(s => s.id === signal.id);
        if (exists) return prev;
        return [signal, ...prev].slice(0, 50);
      });
    });

    // Update status periodically
    const statusInterval = setInterval(updateStatus, 3000);

    return () => {
      unsubscribe();
      clearInterval(statusInterval);
    };
  }, [autoStart]);

  const updateStatus = useCallback(() => {
    const serviceStatus = backgroundSignalService.getStatus();
    setIsRunning(serviceStatus.agentStatus.isRunning);
    setStatus({
      checksPerformed: serviceStatus.agentStatus.checksPerformed,
      signalsGenerated: serviceStatus.agentStatus.signalsGenerated,
      currentSymbol: serviceStatus.agentStatus.currentSymbol,
      lastCheck: serviceStatus.agentStatus.lastCheck,
    });
    setSignals(backgroundSignalService.getActiveSignals());
  }, []);

  const start = useCallback(() => {
    backgroundSignalService.start();
    updateStatus();
  }, [updateStatus]);

  const stop = useCallback(() => {
    backgroundSignalService.stop();
    updateStatus();
  }, [updateStatus]);

  const clearSignals = useCallback(() => {
    setSignals([]);
  }, []);

  return (
    <SignalContext.Provider value={{
      signals,
      isRunning,
      status,
      start,
      stop,
      clearSignals,
    }}>
      {children}
    </SignalContext.Provider>
  );
};

export const useSignals = (): SignalContextType => {
  const context = useContext(SignalContext);
  if (!context) {
    throw new Error('useSignals must be used within a SignalProvider');
  }
  return context;
};

export default SignalContext;
