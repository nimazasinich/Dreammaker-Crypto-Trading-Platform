import React, { ReactNode } from 'react';
import { LoadingSkeleton } from './LoadingSkeleton';
import { GlowingButton } from './GlowingButton';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ResponseHandlerProps<T> {
    isLoading: boolean;
    error: Error | null;
    data: T | null;
    loadingComponent?: ReactNode;
    errorComponent?: ReactNode;
    emptyComponent?: ReactNode;
    children: (data: T) => ReactNode;
    isEmpty?: (data: T) => boolean;
    onRetry?: () => void;
}

function ResponseHandler<T>({
    isLoading,
    error,
    data,
    loadingComponent,
    errorComponent,
    emptyComponent,
    children,
    isEmpty = (data) => !data || (Array.isArray(data) && data.length === 0),
    onRetry
}: ResponseHandlerProps<T>) {
    if (isLoading) {
        return loadingComponent ? (
            <>{loadingComponent}</>
        ) : (
            <LoadingSkeleton variant="card" count={3} />
        );
    }

    if (error) {
        return errorComponent ? (
            <>{errorComponent}</>
        ) : (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative p-8 rounded-2xl overflow-hidden backdrop-blur-md"
                style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                    border: '2px solid rgba(239, 68, 68, 0.4)',
                    boxShadow: '0 12px 48px rgba(239, 68, 68, 0.3), inset 0 1px 4px rgba(255, 255, 255, 0.1)'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent animate-pulse" />
                <div className="relative z-10 flex flex-col items-center text-center gap-4">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: 2 }}
                    >
                        <AlertCircle className="w-16 h-16 text-red-400" style={{ filter: 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.6))' }} />
                    </motion.div>
                    <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent mb-2">
                            Oops! Something went wrong
                        </h3>
                        <p className="text-red-300/90 text-sm max-w-md">{error.message || 'An unexpected error occurred'}</p>
                    </div>
                    {onRetry && (
                        <GlowingButton
                            onClick={onRetry}
                            variant="danger"
                            size="md"
                            className="mt-2"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </GlowingButton>
                    )}
                </div>
            </motion.div>
        );
    }

    if (!data || (isEmpty && isEmpty(data))) {
        return emptyComponent ? (
            <>{emptyComponent}</>
        ) : (
            <div className="relative p-6 rounded-xl text-center overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.1) 0%, rgba(71, 85, 105, 0.1) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
            }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
                <div className="relative z-10">
                    <p className="text-slate-400 mb-2">No data available yet</p>
                    <p className="text-slate-500 text-sm">Data will appear when backend provides it</p>
                </div>
            </div>
        );
    }

    return <>{children(data)}</>;
}

export default ResponseHandler;