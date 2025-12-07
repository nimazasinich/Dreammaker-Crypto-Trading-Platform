/**
 * Signal Marker Overlay
 * Displays signal markers on top of the TradingView chart
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, X, Info } from 'lucide-react';
import { ExtremePoint } from '../../services/ExtremePointsDetector';

interface SignalMarkerOverlayProps {
  signals: ExtremePoint[];
  onSignalClick?: (signal: ExtremePoint) => void;
  chartHeight?: number;
  chartWidth?: number;
}

const SignalMarkerOverlay: React.FC<SignalMarkerOverlayProps> = ({
  signals = [],
  onSignalClick,
  chartHeight = 600,
  chartWidth = 1200
}) => {
  if (!signals || signals.length === 0) return null;
  const [hoveredSignal, setHoveredSignal] = useState<string | null>(null);
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

  // Calculate marker positions (simplified - in real implementation, would map to actual chart coordinates)
  const getMarkerPosition = (signal: ExtremePoint, index: number) => {
    // This is a simplified positioning - in production, you'd map to actual chart coordinates
    const x = chartWidth * 0.7 + (index % 3) * 100; // Right side of chart
    const y = chartHeight * 0.3 + (Math.floor(index / 3)) * 80; // Top area
    return { x, y };
  };

  const isBuy = (signal: ExtremePoint) => signal.signalType === 'BUY';

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      <AnimatePresence>
        {signals.slice(0, 10).map((signal, index) => {
          const position = getMarkerPosition(signal, index);
          const isHovered = hoveredSignal === signal.id;
          const isExpanded = expandedSignal === signal.id;

          return (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute pointer-events-auto"
              style={{
                left: `${(position.x / chartWidth) * 100}%`,
                top: `${(position.y / chartHeight) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onMouseEnter={() => setHoveredSignal(signal.id)}
              onMouseLeave={() => setHoveredSignal(null)}
            >
              {/* Signal Arrow Marker */}
              <motion.div
                whileHover={{ scale: 1.2, y: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setExpandedSignal(isExpanded ? null : signal.id);
                  onSignalClick?.(signal);
                }}
                className={`relative cursor-pointer
                           ${isBuy(signal) ? 'text-green-400' : 'text-red-400'}`}
              >
                {/* Arrow Icon */}
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg
                           ${isBuy(signal)
                             ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                             : 'bg-gradient-to-r from-red-500 to-pink-500'
                           }`}
                  style={{
                    boxShadow: isBuy(signal)
                      ? '0 0 20px rgba(16, 185, 129, 0.6)'
                      : '0 0 20px rgba(239, 68, 68, 0.6)'
                  }}
                >
                  {isBuy(signal) ? (
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-white" />
                  )}
                </motion.div>

                {/* Pulse Effect */}
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className={`absolute inset-0 rounded-full -z-10
                             ${isBuy(signal) ? 'bg-green-500/30' : 'bg-red-500/30'}`}
                />

                {/* Tooltip on Hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl p-3
                                 backdrop-blur-xl border shadow-2xl pointer-events-none
                                 ${isBuy(signal)
                                   ? 'bg-green-500/90 border-green-400/50'
                                   : 'bg-red-500/90 border-red-400/50'
                                 }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{signal.symbol}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                                         ${isBuy(signal) ? 'bg-green-600/50' : 'bg-red-600/50'}`}>
                            {signal.signalType}
                          </span>
                        </div>
                        <div className="text-xs text-white/90">
                          Confidence: <span className="font-bold">{signal.confidence}%</span>
                        </div>
                        <div className="text-xs text-white/90">
                          Price: <span className="font-bold">
                            ${signal.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        {signal.timestamp && (
                          <div className="text-xs text-white/70">
                            {new Date(signal.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                      {/* Arrow */}
                      <div
                        className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
                        style={{
                          background: isBuy(signal) ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)'
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-80 rounded-2xl p-4
                                 backdrop-blur-xl border shadow-2xl z-50
                                 ${isBuy(signal)
                                   ? 'bg-green-500/95 border-green-400/50'
                                   : 'bg-red-500/95 border-red-400/50'
                                 }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-white">{signal.symbol}</h3>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setExpandedSignal(null)}
                          className="p-1 rounded-lg bg-white/10 hover:bg-white/20"
                        >
                          <X className="w-4 h-4 text-white" />
                        </motion.button>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-white/80">Signal Type:</span>
                          <span className="font-bold text-white">{signal.signalType}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/80">Confidence:</span>
                          <span className={`font-bold ${signal.confidence >= 80 ? 'text-white' : 'text-yellow-200'}`}>
                            {signal.confidence}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/80">Entry Price:</span>
                          <span className="font-bold text-white">
                            ${signal.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        {signal.timestamp && (
                          <div className="flex items-center justify-between">
                            <span className="text-white/80">Time:</span>
                            <span className="text-white/70 text-xs">
                              {new Date(signal.timestamp).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Signal Strength Indicator */}
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-white/80">Signal Strength</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`w-2 h-2 rounded-full
                                         ${level <= Math.floor(signal.confidence / 20)
                                           ? 'bg-white'
                                           : 'bg-white/30'
                                         }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default SignalMarkerOverlay;

