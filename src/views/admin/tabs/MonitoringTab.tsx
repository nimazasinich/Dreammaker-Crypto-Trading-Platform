/**
 * Monitoring Tab - Performance and Error Tracking
 * 
 * Source: MonitoringView.tsx
 * 
 * @version 1.0.0
 * @since Phase 3
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, RefreshCw } from 'lucide-react';
import { errorTracker } from '../../../lib/errorTracking';
import { performanceMonitor } from '../../../lib/performanceMonitor';
import { getDeduplicationStats } from '../../../lib/requestDeduplication';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import type { ErrorEvent, ErrorStats } from '../../../lib/errorTracking';
import type { PerformanceStats } from '../../../lib/performanceMonitor';

export const MonitoringTab: React.FC = () => {
    const [errorStats, setErrorStats] = useState<ErrorStats | null>(null);
    const [perfStats, setPerfStats] = useState<Record<string, PerformanceStats>>({});
    const [dedupStats, setDedupStats] = useState<ReturnType<typeof getDeduplicationStats> | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Refresh stats every 2 seconds
    useEffect(() => {
        const refreshStats = () => {
            setErrorStats(errorTracker.getStats());
            setPerfStats(performanceMonitor.getAllStats());
            setDedupStats(getDeduplicationStats());
        };

        refreshStats();

        if (autoRefresh) {
            const interval = setInterval(refreshStats, 2000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const handleClearErrors = () => {
        if (confirm('Clear all error tracking data?')) {
            errorTracker.clear();
            setErrorStats(errorTracker.getStats());
        }
    };

    const handleClearPerformance = () => {
        if (confirm('Clear all performance metrics?')) {
            performanceMonitor.clear();
            setPerfStats({});
        }
    };

    const handleExportErrors = () => {
        const data = errorTracker.exportErrors();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `errors-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPerformance = () => {
        const data = performanceMonitor.exportMetrics();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="rounded"
                    />
                    Auto-refresh (2s)
                </label>

                <div className="flex gap-2">
                    <Button onClick={handleExportErrors} variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export Errors
                    </Button>
                    <Button onClick={handleExportPerformance} variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export Performance
                    </Button>
                </div>
            </div>

            {/* Error Tracking */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Error Tracking</CardTitle>
                        <CardDescription>Real-time error monitoring</CardDescription>
                    </div>
                    <Button onClick={handleClearErrors} variant="destructive" size="sm" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Clear
                    </Button>
                </CardHeader>
                <CardContent>
                    {errorStats ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-accent rounded-lg">
                                    <div className="text-sm text-muted-foreground mb-1">Total Errors</div>
                                    <div className="text-2xl font-bold">{errorStats.totalErrors}</div>
                                </div>
                                <div className="p-4 bg-accent rounded-lg">
                                    <div className="text-sm text-muted-foreground mb-1">Unique Errors</div>
                                    <div className="text-2xl font-bold">{errorStats.uniqueErrors}</div>
                                </div>
                                <div className="p-4 bg-accent rounded-lg">
                                    <div className="text-sm text-muted-foreground mb-1">By Category</div>
                                    <div className="text-2xl font-bold">{Object.keys(errorStats.byCategory).length}</div>
                                </div>
                                <div className="p-4 bg-accent rounded-lg">
                                    <div className="text-sm text-muted-foreground mb-1">By Severity</div>
                                    <div className="text-2xl font-bold">{Object.keys(errorStats.bySeverity).length}</div>
                                </div>
                            </div>

                            {/* Recent Errors */}
                            {errorStats.recentErrors.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Recent Errors</h4>
                                    <div className="space-y-2">
                                        {errorStats.recentErrors.slice(0, 5).map((error: ErrorEvent, idx: number) => (
                                            <div key={idx} className="p-3 bg-accent rounded-lg text-sm">
                                                <div className="font-medium text-red-500">{error.message}</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {new Date(error.timestamp).toLocaleString()} • {error.category}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No error data available</p>
                    )}
                </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Performance Metrics</CardTitle>
                        <CardDescription>Operation performance tracking</CardDescription>
                    </div>
                    <Button onClick={handleClearPerformance} variant="destructive" size="sm" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Clear
                    </Button>
                </CardHeader>
                <CardContent>
                    {Object.keys(perfStats).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(perfStats).map(([operation, stats]) => (
                                <div key={operation} className="p-4 bg-accent rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">{operation}</h4>
                                        <span className="text-sm text-muted-foreground">{stats.count} calls</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <div className="text-muted-foreground">Avg</div>
                                            <div className="font-medium">{stats.avg.toFixed(2)}ms</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Min</div>
                                            <div className="font-medium">{stats.min.toFixed(2)}ms</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Max</div>
                                            <div className="font-medium">{stats.max.toFixed(2)}ms</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No performance data available</p>
                    )}
                </CardContent>
            </Card>

            {/* Deduplication Stats */}
            <Card>
                <CardHeader>
                    <CardTitle>Request Deduplication</CardTitle>
                    <CardDescription>Cache hit rate and request optimization</CardDescription>
                </CardHeader>
                <CardContent>
                    {dedupStats ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-accent rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Total Requests</div>
                                <div className="text-2xl font-bold">{dedupStats.totalRequests}</div>
                            </div>
                            <div className="p-4 bg-accent rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Deduplicated</div>
                                <div className="text-2xl font-bold text-green-500">{dedupStats.deduplicatedCount}</div>
                            </div>
                            <div className="p-4 bg-accent rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Cache Hits</div>
                                <div className="text-2xl font-bold text-blue-500">{dedupStats.cacheHits}</div>
                            </div>
                            <div className="p-4 bg-accent rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Hit Rate</div>
                                <div className="text-2xl font-bold">
                                    {((dedupStats.cacheHits / Math.max(dedupStats.totalRequests, 1)) * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No deduplication data available</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MonitoringTab;
