/**
 * Signal Notification Component
 * Animated notification popup for new trading signals
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, X, Bell } from 'lucide-react';
import { ExtremePoint } from '../../services/ExtremePointsDetector';

interface SignalNotificationProps {
  signal: ExtremePoint | null;
  onClose: () => void;
  onSignalClick?: (signal: ExtremePoint) => void;
}

const SignalNotification: React.FC<SignalNotificationProps> = ({
  signal,
  onClose,
  onSignalClick
}) => {
  // Hooks must be called before any early returns
  useEffect(() => {
    if (signal) {
      // Auto-close after 8 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 8000);

      // Play sound notification (if permission granted)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`New ${signal.signalType} Signal`, {
          body: `${signal.symbol} - Confidence: ${signal.confidence}%`,
          icon: '/favicon.ico',
          tag: signal.id,
        });
      }

      return () => clearTimeout(timer);
    }
  }, [signal, onClose]);

  if (!signal) return null;

  const isBuy = signal.signalType === 'BUY';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]"
        onClick={() => onSignalClick?.(signal)}
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative overflow-hidden rounded-2xl shadow-2xl cursor-pointer
                     ${isBuy
                       ? 'bg-gradient-to-r from-green-500/95 to-emerald-500/95 border-2 border-green-400/50'
                       : 'bg-gradient-to-r from-red-500/95 to-pink-500/95 border-2 border-red-400/50'
                     }`}
        >
          {/* Animated background shimmer */}
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />

          {/* Content */}
          <div className="relative p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                {/* Icon */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center
                             ${isBuy ? 'bg-green-600/30' : 'bg-red-600/30'}`}
                >
                  {isBuy ? (
                    <ArrowUpRight className="w-6 h-6 text-white" />
                  ) : (
                    <ArrowDownRight className="w-6 h-6 text-white" />
                  )}
                </motion.div>

                {/* Signal Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-white">{signal.symbol}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                                   ${isBuy ? 'bg-green-600/50 text-white' : 'bg-red-600/50 text-white'}`}>
                      {signal.signalType}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/80">Confidence:</span>
                      <span className={`text-sm font-bold
                                     ${signal.confidence >= 80 ? 'text-white' : 'text-yellow-200'}`}>
                        {signal.confidence}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/80">Price:</span>
                      <span className="text-sm font-bold text-white">
                        ${signal.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {signal.timestamp && (
                      <div className="text-xs text-white/60">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            </div>

            {/* Signal Strength Indicator */}
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center justify-between text-xs">
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
          </div>

          {/* Pulse effect */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className={`absolute -inset-4 rounded-2xl -z-10
                       ${isBuy ? 'bg-green-500/20' : 'bg-red-500/20'}`}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignalNotification;

