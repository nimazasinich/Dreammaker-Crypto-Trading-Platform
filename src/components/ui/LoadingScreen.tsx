import React, { useEffect, useState } from 'react';
import { TrendingUp, Zap, Activity, Sparkles, BarChart3, Brain } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading Dreammaker Crypto Trader',
  showProgress = false
}) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');
  const [loadingStage, setLoadingStage] = useState('Initializing');

  // Animate dots for loading text
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev?.length || 0) >= 3 ? '' : prev + '.');
    }, 400);

    return () => clearInterval(dotsInterval);
  }, []);

  // Smooth progress animation with stages
  useEffect(() => {
    if (!showProgress) return;

    const stages = [
      { threshold: 0, label: 'Initializing' },
      { threshold: 25, label: 'Loading modules' },
      { threshold: 50, label: 'Connecting to markets' },
      { threshold: 75, label: 'Preparing dashboard' },
      { threshold: 90, label: 'Almost ready' }
    ];

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + Math.random() * 15, 100);
        
        // Update stage based on progress
        const currentStage = stages.reverse().find(s => next >= s.threshold);
        if (currentStage) {
          setLoadingStage(currentStage.label);
        }
        
        return next;
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, [showProgress]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950">
      {/* Advanced animated background with particles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" 
             style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[80px] animate-pulse" 
             style={{ animationDuration: '6s', animationDelay: '2s' }} />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Main loading content */}
      <div className="relative z-10 flex flex-col items-center gap-8 p-8 animate-fadeIn">
        {/* Enhanced Logo/Icon section with multiple animations */}
        <div className="relative">
          {/* Outermost glow ring */}
          <div className="absolute inset-[-20px] rounded-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 blur-2xl animate-pulse" 
               style={{ animationDuration: '3s' }} />
          
          {/* Outer rotating ring with gradient */}
          <div className="absolute inset-0 w-40 h-40 rounded-full animate-spin"
               style={{ 
                 animationDuration: '3s',
                 background: 'conic-gradient(from 0deg, transparent, rgba(139, 92, 246, 0.5), transparent)'
               }} />

          {/* Middle rotating ring (reverse) */}
          <div className="absolute inset-3 w-34 h-34 rounded-full animate-spin"
               style={{ 
                 animationDuration: '2s', 
                 animationDirection: 'reverse',
                 background: 'conic-gradient(from 180deg, transparent, rgba(96, 165, 250, 0.5), transparent)'
               }} />
          
          {/* Inner rotating ring */}
          <div className="absolute inset-6 w-28 h-28 border-4 border-indigo-500/30 rounded-full animate-spin"
               style={{ animationDuration: '4s' }} />

          {/* Center icon container with glass effect */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute inset-8 bg-gradient-to-br from-purple-600/30 via-blue-600/30 to-indigo-600/30 rounded-full backdrop-blur-sm animate-pulse"
                 style={{ animationDuration: '2s' }} />

            {/* Multiple animated icons */}
            <div className="relative flex items-center justify-center">
              <TrendingUp className="absolute w-12 h-12 text-purple-400 animate-pulse"
                          style={{ animationDuration: '2s', animationDelay: '0s' }} />
              <Zap className="absolute w-10 h-10 text-blue-400 animate-ping"
                   style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
              <Activity className="absolute w-11 h-11 text-indigo-400 animate-pulse"
                        style={{ animationDuration: '2.5s', animationDelay: '0.6s' }} />
              <Sparkles className="absolute w-8 h-8 text-purple-300 animate-spin"
                        style={{ animationDuration: '3s' }} />
            </div>
          </div>
        </div>

        {/* App name with enhanced styling */}
        <div className="text-center space-y-3 animate-slideUp">
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-2xl">
            Dreammaker
          </h1>
          <div className="flex items-center justify-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <p className="text-xl text-gray-300 font-semibold tracking-wide">
              Crypto Trading Platform
            </p>
            <Brain className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        {/* Loading message with animated dots and stage */}
        <div className="flex flex-col items-center gap-4 min-h-[80px] animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-6 h-6 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
            <p className="text-base text-gray-300 font-medium">
              {showProgress ? loadingStage : message}
              <span className="inline-block w-8 text-left text-purple-400">{dots}</span>
            </p>
          </div>

          {/* Enhanced progress bar */}
          {showProgress && (
            <div className="relative w-80 h-2 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-purple-500/20">
              {/* Background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-shimmer" />
              
              {/* Progress fill with gradient */}
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
              
              {/* Percentage display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow-lg">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          )}

          {/* Animated dots spinner (when no progress bar) */}
          {!showProgress && (
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                   style={{ animationDelay: '0s', boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)' }} />
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                   style={{ animationDelay: '0.2s', boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)' }} />
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
                   style={{ animationDelay: '0.4s', boxShadow: '0 0 10px rgba(129, 140, 248, 0.5)' }} />
            </div>
          )}
        </div>

        {/* Enhanced tagline with icons */}
        <div className="flex flex-col items-center gap-2 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          <p className="text-sm text-gray-400 text-center max-w-md leading-relaxed">
            Powered by <span className="text-purple-400 font-semibold">AI algorithms</span> and 
            <span className="text-blue-400 font-semibold"> real-time market analysis</span>
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Advanced
            </span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Fast
            </span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Real-time
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
          10% { opacity: 0.3; }
          50% { transform: translateY(-100px) translateX(50px); opacity: 0.5; }
          90% { opacity: 0.3; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-float { animation: float linear infinite; }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.8s ease-out forwards; }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
