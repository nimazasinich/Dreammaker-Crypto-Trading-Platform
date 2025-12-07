import React, { useState, useEffect } from 'react';
import { SparklesIcon, TrendingUpIcon, ZapIcon, ActivityIcon } from '../icons/CryptoIcons';
import { useTheme } from '../Theme/ThemeProvider';

export const SpectacularLoader: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [progress, setProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState(0);
  const [typedText, setTypedText] = useState('');

  const stages = [
    { text: 'Initializing AI Engine', icon: SparklesIcon, color: '#a855f7', gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)' },
    { text: 'Connecting to Market Data', icon: TrendingUpIcon, color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    { text: 'Loading Trading Signals', icon: ZapIcon, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { text: 'Preparing Dashboard', icon: ActivityIcon, color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
  ];

  // Typing effect for loading text - faster typing
  useEffect(() => {
    const currentText = stages[loadingStage].text;
    let currentIndex = 0;
    setTypedText('');
    
    const typingInterval = setInterval(() => {
      if (currentIndex <= currentText.length) {
        setTypedText(currentText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 35); // Faster typing speed

    return () => clearInterval(typingInterval);
  }, [loadingStage]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        // Faster progress with more variation
        return prev + Math.random() * 15 + 5;
      });
    }, 150);

    const stageInterval = setInterval(() => {
      setLoadingStage(prev => (prev + 1) % stages.length);
    }, 1800); // Faster stage transitions

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
    };
  }, []);

  const CurrentIcon = stages[loadingStage].icon;
  const currentColor = stages[loadingStage].color;
  const currentGradient = stages[loadingStage].gradient;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0a0a14 0%, #0f0f1e 20%, #1a1a2e 40%, #16213e 60%, #0f0f1e 80%, #0a0a14 100%)'
          : 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 20%, #f8faff 40%, #eef2ff 60%, #e8f0fe 80%, #f0f4ff 100%)',
        animation: 'backgroundShift 10s ease-in-out infinite',
      }}
    >
      {/* Enhanced Animated grid background with perspective */}
      <div className="absolute inset-0 opacity-[0.15]" style={{ perspective: '1000px' }}>
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: isDark
              ? 'linear-gradient(rgba(139, 92, 246, 0.15) 2px, transparent 2px), linear-gradient(90deg, rgba(139, 92, 246, 0.15) 2px, transparent 2px)'
              : 'linear-gradient(rgba(139, 92, 246, 0.12) 2px, transparent 2px), linear-gradient(90deg, rgba(139, 92, 246, 0.12) 2px, transparent 2px)',
            backgroundSize: '60px 60px',
            animation: 'grid-move 25s linear infinite',
            transform: 'rotateX(60deg) scale(2)',
            transformOrigin: 'center center',
          }}
        />
      </div>

      {/* Large gradient orbs with enhanced blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { color: '139, 92, 246', size: 400, x: -20, y: -20, duration: 20 },
          { color: '59, 130, 246', size: 350, x: 80, y: 20, duration: 25 },
          { color: '236, 72, 153', size: 300, x: 50, y: 70, duration: 22 },
          { color: '16, 185, 129', size: 280, x: 10, y: 60, duration: 23 },
        ].map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              background: `radial-gradient(circle, rgba(${orb.color}, 0.25) 0%, rgba(${orb.color}, 0.1) 40%, transparent 70%)`,
              animation: `float-orb-complex ${orb.duration}s ease-in-out infinite`,
              animationDelay: `${i * 2}s`,
              filter: 'blur(60px)',
            }}
          />
        ))}
      </div>

      {/* Enhanced particle system with trails */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => {
          const colors = ['139, 92, 246', '59, 130, 246', '236, 72, 153', '16, 185, 129'];
          const color = colors[i % colors.length];
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${3 + Math.random() * 4}px`,
                height: `${3 + Math.random() * 4}px`,
                borderRadius: '50%',
                background: `rgba(${color}, ${0.6 + Math.random() * 0.4})`,
                animation: `particle-float-advanced ${4 + Math.random() * 6}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 4}s`,
                boxShadow: `0 0 ${12 + Math.random() * 16}px rgba(${color}, 0.9), 0 0 ${24 + Math.random() * 32}px rgba(${color}, 0.5)`,
              }}
            />
          );
        })}
      </div>

      {/* Shooting stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute h-0.5 rounded-full"
            style={{
              width: `${40 + Math.random() * 60}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 50%, transparent 100%)',
              animation: `shooting-star ${2.5 + Math.random() * 2}s ease-out infinite`,
              animationDelay: `${Math.random() * 6}s`,
              transform: 'rotate(-45deg)',
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.7), 0 0 60px rgba(255, 255, 255, 0.4)',
            }}
          />
        ))}
      </div>

      {/* Ripple waves from center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: '100px',
              height: '100px',
              border: `2px solid ${currentColor}40`,
              animation: `ripple-wave ${4 + i * 0.5}s ease-out infinite`,
              animationDelay: `${i * 1}s`,
            }}
          />
        ))}
      </div>

      {/* DNA Helix effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full"
            style={{
              left: '50%',
              top: `${i * 5}%`,
              background: i % 2 === 0 ? '#8b5cf6' : '#3b82f6',
              animation: `dna-helix ${6}s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
              boxShadow: `0 0 20px ${i % 2 === 0 ? '#8b5cf6' : '#3b82f6'}`,
            }}
          />
        ))}
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => {
          const shapes = ['square', 'triangle', 'circle', 'diamond'];
          const shape = shapes[i % shapes.length];
          const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#ec4899', '#f59e0b'];
          const color = colors[i % colors.length];
          
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${20 + Math.random() * 30}px`,
                height: `${20 + Math.random() * 30}px`,
                background: shape === 'circle' ? color + '30' : 'transparent',
                border: `2px solid ${color}60`,
                borderRadius: shape === 'circle' ? '50%' : shape === 'diamond' ? '0' : '4px',
                transform: shape === 'diamond' ? 'rotate(45deg)' : 'rotate(0deg)',
                animation: `float-shape ${8 + Math.random() * 8}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 4}s`,
                opacity: 0.6,
              }}
            />
          );
        })}
      </div>

      {/* Pulsing circles from corners */}
      {[
        { top: '0', left: '0', color: '#8b5cf6' },
        { top: '0', right: '0', color: '#3b82f6' },
        { bottom: '0', left: '0', color: '#10b981' },
        { bottom: '0', right: '0', color: '#ec4899' },
      ].map((corner, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            ...corner,
            width: '200px',
            height: '200px',
          }}
        >
          {[0, 1, 2].map((ring) => (
            <div
              key={ring}
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${corner.color}30`,
                animation: `corner-pulse ${3 + ring * 0.5}s ease-out infinite`,
                animationDelay: `${ring * 0.5}s`,
              }}
            />
          ))}
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-14 px-4">
        
        {/* Ultra-Modern Logo with 3D effects */}
        <div className="relative" style={{ perspective: '1000px' }}>
          {/* Multiple rotating rings with different speeds */}
          {[0, 1, 2, 3].map((ring) => (
            <div
              key={ring}
              className="absolute inset-0 rounded-full"
              style={{
                margin: `-${(ring + 1) * 24}px`,
                border: `${3 - ring * 0.5}px solid rgba(${ring % 2 === 0 ? '139, 92, 246' : '59, 130, 246'}, ${0.35 - ring * 0.07})`,
                animation: `spin-ring-3d ${2.5 + ring * 0.8}s linear infinite ${ring % 2 === 0 ? '' : 'reverse'}`,
                transformStyle: 'preserve-3d',
              }}
            />
          ))}

          {/* Multi-layer pulsing glow */}
          <div 
            className="absolute inset-0 -m-16 rounded-full"
            style={{
              background: `radial-gradient(circle, ${currentColor}80 0%, ${currentColor}40 30%, transparent 70%)`,
              animation: 'pulse-glow 2s ease-in-out infinite',
              filter: 'blur(30px)',
            }}
          />
          <div 
            className="absolute inset-0 -m-20 rounded-full"
            style={{
              background: `radial-gradient(circle, ${currentColor}40 0%, transparent 70%)`,
              animation: 'pulse-glow 3s ease-in-out infinite',
              animationDelay: '0.5s',
              filter: 'blur(40px)',
            }}
          />

          {/* Hexagon background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: currentGradient,
              animation: 'rotate-slow 20s linear infinite',
              filter: 'blur(20px)',
            }}
          />

          {/* Central 3D logo container */}
          <div
            className="relative flex h-40 w-40 items-center justify-center rounded-[2.5rem]"
            style={{
              background: currentGradient,
              boxShadow: `0 30px 100px ${currentColor}cc, 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 3px 8px rgba(255, 255, 255, 0.3)`,
              animation: 'logo-pulse-3d 1.8s ease-in-out infinite',
              transform: 'rotateX(10deg) rotateY(-10deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Multiple inner glow layers */}
            <div 
              className="absolute inset-3 rounded-[2rem]"
              style={{
                background: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)',
              }}
            />
            <div 
              className="absolute inset-6 rounded-[1.5rem]"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 60%)',
              }}
            />
            
            {/* Animated icon */}
            <CurrentIcon 
              size={72} 
              className="relative text-white drop-shadow-2xl" 
              style={{ 
                animation: 'icon-float 2.5s ease-in-out infinite',
                filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.4))',
              }} 
            />

            {/* Corner accents */}
            {[0, 90, 180, 270].map((rotation, i) => (
              <div
                key={i}
                className="absolute h-6 w-6"
                style={{
                  top: '8px',
                  left: '8px',
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                }}
              >
                <div 
                  className="h-1 w-6 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, transparent 100%)',
                    animation: `corner-glow 2s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Enhanced orbiting icons with trails */}
          {[TrendingUpIcon, ZapIcon, ActivityIcon].map((Icon, i) => {
            const orbitColors = ['#3b82f6', '#10b981', '#ec4899'];
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  animation: `orbit-3d ${5 + i * 0.5}s linear infinite`,
                  animationDelay: `${i * 1.5}s`,
                }}
              >
                {/* Trail effect */}
                <div
                  className="absolute h-12 w-12 rounded-2xl opacity-30 blur-md"
                  style={{
                    background: orbitColors[i],
                  }}
                />
                {/* Icon container */}
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${orbitColors[i]} 0%, ${orbitColors[i]}dd 100%)`,
                    boxShadow: `0 10px 30px ${orbitColors[i]}80, inset 0 1px 3px rgba(255, 255, 255, 0.3)`,
                    transform: `rotate(${-360 * (i / 3)}deg)`,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Icon size={22} className="text-white drop-shadow-lg" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Ultra-Modern Brand name with animated gradient */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {/* Glow layer behind text */}
            <div 
              className="absolute inset-0 blur-2xl opacity-60"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #ec4899 100%)',
                animation: 'text-glow 3s ease-in-out infinite',
              }}
            />
            
            {/* Main text */}
            <h1 
              className="relative text-6xl sm:text-7xl font-black tracking-tighter"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 30%, #06b6d4 60%, #ec4899 90%, #f97316 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-shift 4s ease-in-out infinite',
                filter: 'drop-shadow(0 4px 20px rgba(139, 92, 246, 0.5))',
              }}
            >
              BOLT AI
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div 
              className="h-px w-8 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #8b5cf6 100%)',
              }}
            />
            <p 
              className={`text-sm font-bold tracking-[0.3em] uppercase ${isDark ? 'text-purple-300' : 'text-purple-700'}`}
              style={{
                animation: 'fade-in 1s ease-out',
              }}
            >
              Trading Intelligence Platform
            </p>
            <div 
              className="h-px w-8 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #8b5cf6 0%, transparent 100%)',
              }}
            />
          </div>
          
          {/* Subtitle with typing effect */}
          <p 
            className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
            style={{
              animation: 'fade-in 1.5s ease-out',
            }}
          >
            Powered by advanced algorithms and real-time market analysis
          </p>
        </div>

        {/* Enhanced Loading stage with typing effect */}
        <div className="flex flex-col items-center gap-5">
          <div 
            className="flex items-center gap-4 rounded-2xl px-6 py-4 backdrop-blur-xl"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.6) 0%, rgba(31, 31, 56, 0.6) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(250, 251, 255, 0.6) 100%)',
              border: `2px solid ${currentColor}40`,
              boxShadow: `0 10px 40px ${currentColor}30, inset 0 1px 2px rgba(255, 255, 255, 0.2)`,
            }}
          >
            {/* Animated icon container */}
            <div className="relative">
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-2xl blur-xl opacity-60"
                style={{
                  background: currentColor,
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              {/* Icon */}
              <div
                className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${currentColor}dd 100%)`,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: `0 8px 24px ${currentColor}60, inset 0 2px 4px rgba(255, 255, 255, 0.3)`,
                  animation: 'icon-bounce 2s ease-in-out infinite',
                }}
              >
                <CurrentIcon 
                  size={28} 
                  className="text-white drop-shadow-lg" 
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.6))',
                  }}
                />
              </div>
            </div>
            
            {/* Typing text effect */}
            <div className="flex flex-col gap-1">
              <p 
                className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} min-w-[280px]`}
                style={{
                  fontFamily: 'monospace',
                }}
              >
                {typedText}
                <span 
                  className="inline-block w-0.5 h-5 ml-1 align-middle"
                  style={{
                    background: currentColor,
                    animation: 'cursor-blink 1s step-end infinite',
                  }}
                />
              </p>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Stage {loadingStage + 1} of {stages.length}
              </p>
            </div>
          </div>

          {/* Enhanced animated dots */}
          <div className="flex gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative"
              >
                {/* Glow */}
                <div
                  className="absolute inset-0 rounded-full blur-sm"
                  style={{
                    background: currentColor,
                    animation: `dot-bounce 1.6s infinite ease-in-out`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
                {/* Dot */}
                <div
                  className="relative h-2.5 w-2.5 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${currentColor} 0%, ${currentColor}dd 100%)`,
                    animation: 'dot-bounce 1.6s infinite ease-in-out',
                    animationDelay: `${i * 0.2}s`,
                    boxShadow: `0 0 16px ${currentColor}cc`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Ultra-Modern progress bar with 3D effect */}
        <div className="w-[500px] max-w-full">
          <div 
            className="relative h-4 overflow-hidden rounded-full backdrop-blur-sm"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(30, 30, 45, 0.9) 0%, rgba(40, 40, 60, 0.9) 100%)'
                : 'linear-gradient(135deg, rgba(241, 245, 249, 0.9) 0%, rgba(226, 232, 240, 0.9) 100%)',
              boxShadow: 'inset 0 3px 6px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(255, 255, 255, 0.1)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
            }}
          >
            {/* Animated background pattern */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(139, 92, 246, 0.1) 10px, rgba(139, 92, 246, 0.1) 20px)',
                animation: 'progress-pattern 1s linear infinite',
              }}
            />
            
            {/* Progress fill with gradient */}
            <div 
              className="relative h-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: `linear-gradient(90deg, #8b5cf6 0%, #3b82f6 30%, #10b981 60%, #ec4899 90%, #f97316 100%)`,
                backgroundSize: '300% 100%',
                animation: 'progress-shimmer-advanced 3s ease-in-out infinite',
                boxShadow: `0 0 30px ${currentColor}cc, 0 0 60px ${currentColor}66, inset 0 2px 4px rgba(255, 255, 255, 0.4)`,
                borderRadius: '9999px',
              }}
            >
              {/* Inner highlight */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%)',
                }}
              />
            </div>
            
            {/* Multiple glowing dots at progress end */}
            <div
              className="absolute top-1/2 -translate-y-1/2"
              style={{
                left: `${Math.min(progress, 100)}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Outer glow */}
              <div
                className="absolute inset-0 h-8 w-8 rounded-full blur-md"
                style={{
                  background: `radial-gradient(circle, ${currentColor} 0%, transparent 70%)`,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              {/* Middle ring */}
              <div
                className="absolute inset-0 h-6 w-6 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${currentColor}cc 0%, ${currentColor}66 100%)`,
                  animation: 'pulse 1s ease-in-out infinite',
                  animationDelay: '0.2s',
                }}
              />
              {/* Inner dot */}
              <div
                className="relative h-4 w-4 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #ffffff 0%, #ffffff 40%, ' + currentColor + ' 100%)',
                  boxShadow: `0 0 20px ${currentColor}, 0 0 40px ${currentColor}99, 0 0 60px ${currentColor}66`,
                  animation: 'pulse 0.8s ease-in-out infinite',
                  animationDelay: '0.4s',
                }}
              />
            </div>
          </div>
          
          {/* Progress info with enhanced styling */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div 
                className="h-2 w-2 rounded-full"
                style={{
                  background: currentColor,
                  boxShadow: `0 0 10px ${currentColor}`,
                  animation: 'pulse 1s ease-in-out infinite',
                }}
              />
              <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Loading Platform
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="text-2xl font-black tabular-nums"
                style={{
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${currentColor}dd 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: `drop-shadow(0 0 10px ${currentColor}66)`,
                }}
              >
                {Math.min(Math.round(progress), 100)}
              </span>
              <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                %
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced feature highlights with glassmorphism */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {[
            { icon: '🚀', text: 'AI-Powered', color: '#8b5cf6' },
            { icon: '⚡', text: 'Real-time', color: '#3b82f6' },
            { icon: '🎯', text: 'Accurate', color: '#10b981' },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 opacity-0 rounded-2xl px-6 py-4 backdrop-blur-sm"
              style={{
                animation: `fade-in-up 0.8s ease-out ${0.8 + i * 0.2}s forwards`,
                background: isDark
                  ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.5) 0%, rgba(31, 31, 56, 0.5) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(250, 251, 255, 0.5) 100%)',
                border: `1px solid ${feature.color}30`,
                boxShadow: `0 8px 32px ${feature.color}20, inset 0 1px 2px rgba(255, 255, 255, 0.1)`,
              }}
            >
              <div 
                className="text-3xl relative"
                style={{
                  animation: 'icon-float 3s ease-in-out infinite',
                  animationDelay: `${i * 0.5}s`,
                  filter: `drop-shadow(0 0 10px ${feature.color}66)`,
                }}
              >
                {feature.icon}
              </div>
              <span 
                className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                style={{
                  letterSpacing: '0.05em',
                }}
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div 
          className={`text-xs font-medium text-center max-w-md opacity-0 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
          style={{
            animation: 'fade-in 1s ease-out 1.5s forwards',
          }}
        >
          © 2024 BOLT AI • Transforming Trading with Intelligence
        </div>
      </div>

      {/* Enhanced Custom animations */}
      <style>{`
        @keyframes backgroundShift {
          0%, 100% { 
            filter: hue-rotate(0deg) brightness(1);
          }
          50% { 
            filter: hue-rotate(15deg) brightness(1.15);
          }
        }
        
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        
        @keyframes float-orb-complex {
          0%, 100% { 
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0.7;
          }
          25% { 
            transform: translate(40px, -40px) scale(1.15) rotate(90deg);
            opacity: 0.9;
          }
          50% { 
            transform: translate(80px, 0) scale(1.1) rotate(180deg);
            opacity: 0.8;
          }
          75% { 
            transform: translate(40px, 40px) scale(1.05) rotate(270deg);
            opacity: 0.85;
          }
        }
        
        @keyframes particle-float-advanced {
          0%, 100% { 
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.4;
          }
          25% { 
            transform: translateY(-30px) translateX(15px) scale(1.2);
            opacity: 0.8;
          }
          50% { 
            transform: translateY(-50px) translateX(-10px) scale(0.9);
            opacity: 1;
          }
          75% { 
            transform: translateY(-30px) translateX(-20px) scale(1.1);
            opacity: 0.7;
          }
        }
        
        @keyframes shooting-star {
          0% {
            transform: translateX(0) translateY(0) rotate(-45deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(300px) translateY(300px) rotate(-45deg);
            opacity: 0;
          }
        }
        
        @keyframes spin-ring-3d {
          0% { 
            transform: rotate(0deg) rotateY(0deg);
          }
          50% {
            transform: rotate(180deg) rotateY(180deg);
          }
          100% { 
            transform: rotate(360deg) rotateY(360deg);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.1);
          }
        }
        
        @keyframes logo-pulse-3d {
          0%, 100% { 
            transform: rotateX(10deg) rotateY(-10deg) scale(1);
          }
          50% { 
            transform: rotateX(20deg) rotateY(-20deg) scale(1.08);
          }
        }
        
        @keyframes icon-float {
          0%, 100% { 
            transform: translateY(0) rotate(0deg) scale(1);
          }
          50% { 
            transform: translateY(-15px) rotate(10deg) scale(1.1);
          }
        }
        
        @keyframes corner-glow {
          0%, 100% { 
            opacity: 0.3;
          }
          50% { 
            opacity: 0.8;
          }
        }
        
        @keyframes orbit-3d {
          0% {
            transform: rotate(0deg) translateX(120px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(120px) rotate(-360deg);
          }
        }
        
        @keyframes gradient-shift {
          0%, 100% { 
            background-position: 0% 50%;
          }
          50% { 
            background-position: 100% 50%;
          }
        }
        
        @keyframes text-glow {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        @keyframes cursor-blink {
          0%, 49% { 
            opacity: 1;
          }
          50%, 100% { 
            opacity: 0;
          }
        }
        
        @keyframes icon-bounce {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
          }
          50% { 
            transform: scale(1.1) rotate(5deg);
          }
        }
        
        @keyframes dot-bounce {
          0%, 80%, 100% { 
            transform: scale(0.7) translateY(0);
            opacity: 0.4;
          }
          40% { 
            transform: scale(1.3) translateY(-8px);
            opacity: 1;
          }
        }
        
        @keyframes progress-shimmer-advanced {
          0% { 
            background-position: 300% 0;
          }
          100% { 
            background-position: -300% 0;
          }
        }
        
        @keyframes progress-pattern {
          0% { 
            transform: translateX(0);
          }
          100% { 
            transform: translateX(20px);
          }
        }
        
        @keyframes fade-in {
          from { 
            opacity: 0;
            filter: blur(10px);
          }
          to { 
            opacity: 1;
            filter: blur(0);
          }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1.3);
          }
        }
        
        @keyframes ripple-wave {
          0% {
            width: 100px;
            height: 100px;
            opacity: 1;
          }
          100% {
            width: 600px;
            height: 600px;
            opacity: 0;
          }
        }
        
        @keyframes dna-helix {
          0%, 100% {
            transform: translateX(-50px) translateY(0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translateX(0) translateY(-20px) scale(1.2);
            opacity: 0.8;
          }
          50% {
            transform: translateX(50px) translateY(0) scale(1);
            opacity: 0.3;
          }
          75% {
            transform: translateX(0) translateY(20px) scale(1.2);
            opacity: 0.8;
          }
        }
        
        @keyframes float-shape {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0.4;
          }
          25% {
            transform: translateY(-30px) rotate(90deg) scale(1.1);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-50px) rotate(180deg) scale(0.9);
            opacity: 0.5;
          }
          75% {
            transform: translateY(-30px) rotate(270deg) scale(1.05);
            opacity: 0.6;
          }
        }
        
        @keyframes corner-pulse {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes rotate-slow {
          0% {
            transform: rotate(0deg) scale(1.5);
          }
          100% {
            transform: rotate(360deg) scale(1.5);
          }
        }
      `}</style>
    </div>
  );
};
