/**
 * Health Tab - System Health Metrics
 * 
 * Source: HealthView.tsx (System Health tab)
 * 
 * @version 1.0.0
 * @since Phase 3
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, HardDrive, MemoryStick, Wifi, Database, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { HealthCheckService } from '../../../monitoring/HealthCheckService';
import { MetricsCollector } from '../../../monitoring/MetricsCollector';
import { PerformanceMonitor } from '../../../monitoring/PerformanceMonitor';

interface HealthMetrics {
    system: {
        cpu: number;
        memory: number;
        disk: number;
    };
    connections: {
        binance: 'connected' | 'disconnected' | 'error';
        database: 'connected' | 'disconnected' | 'error';
        latency: number;
    };
    performance: {
        uptime: number;
        requests: number;
        errors: number;
    };
}

export const HealthTab: React.FC = () => {
    const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
    const [loading, setLoading] = useState(false);

    const loadMetrics = async () => {
        setLoading(true);
        try {
            // Use the monitoring services to get metrics
            const healthService = HealthCheckService.getInstance();
            const metricsCollector = MetricsCollector.getInstance();
            const performanceMonitor = PerformanceMonitor.getInstance();

            const health = await healthService.checkHealth();
            const systemMetrics = metricsCollector.getMetrics();
            const perfMetrics = performanceMonitor.getMetrics();

            const sysMetrics = systemMetrics as { cpu: number; memory: number; disk: number };
            const perfMetricsObj = perfMetrics as { cpu: number; memory: number; disk: number; uptime?: number; requests?: number; errors?: number };
            
            setMetrics({
                system: {
                    cpu: sysMetrics?.cpu || 0,
                    memory: sysMetrics?.memory || 0,
                    disk: sysMetrics?.disk || 0
                },
                connections: {
                    binance: health.services?.binance?.status === 'healthy' ? 'connected' : 'disconnected',
                    database: health.services?.database?.status === 'healthy' ? 'connected' : 'error',
                    latency: health.services?.binance?.latency || 0
                },
                performance: {
                    uptime: perfMetricsObj?.uptime || 0,
                    requests: perfMetricsObj?.requests || 0,
                    errors: perfMetricsObj?.errors || 0
                }
            });
        } catch (error) {
            console.error('Failed to load metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMetrics();
        const interval = setInterval(loadMetrics, 5000);
        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'disconnected':
                return <XCircle className="w-5 h-5 text-gray-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Activity className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (value: number, thresholds = { warning: 70, danger: 90 }) => {
        if (value >= thresholds.danger) return 'text-red-500';
        if (value >= thresholds.warning) return 'text-yellow-500';
        return 'text-green-500';
    };

    return (
        <div className="space-y-6">
            {/* Refresh Button */}
            <div className="flex justify-end">
                <Button
                    onClick={loadMetrics}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                        <Cpu className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getStatusColor(metrics?.system.cpu || 0)}`}>
                            {metrics?.system.cpu.toFixed(1) || '0.0'}%
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                        <MemoryStick className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getStatusColor(metrics?.system.memory || 0)}`}>
                            {metrics?.system.memory.toFixed(1) || '0.0'}%
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                        <HardDrive className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getStatusColor(metrics?.system.disk || 0)}`}>
                            {metrics?.system.disk.toFixed(1) || '0.0'}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Connection Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Connection Status</CardTitle>
                    <CardDescription>Real-time connection monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                            <div className="flex items-center gap-3">
                                <Wifi className="w-5 h-5" />
                                <div>
                                    <div className="font-medium">Binance Exchange</div>
                                    <div className="text-sm text-muted-foreground">WebSocket & REST API</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(metrics?.connections.binance || 'disconnected')}
                                <Badge variant={metrics?.connections.binance === 'connected' ? 'default' : 'destructive'}>
                                    {metrics?.connections.binance || 'Unknown'}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                            <div className="flex items-center gap-3">
                                <Database className="w-5 h-5" />
                                <div>
                                    <div className="font-medium">Database</div>
                                    <div className="text-sm text-muted-foreground">Local storage & cache</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(metrics?.connections.database || 'error')}
                                <Badge variant={metrics?.connections.database === 'connected' ? 'default' : 'destructive'}>
                                    {metrics?.connections.database || 'Unknown'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>System performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-accent rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Uptime</div>
                            <div className="text-2xl font-bold">
                                {Math.floor((metrics?.performance.uptime || 0) / 3600)}h
                            </div>
                        </div>

                        <div className="p-4 bg-accent rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Total Requests</div>
                            <div className="text-2xl font-bold">
                                {metrics?.performance.requests.toLocaleString() || '0'}
                            </div>
                        </div>

                        <div className="p-4 bg-accent rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Error Count</div>
                            <div className={`text-2xl font-bold ${(metrics?.performance.errors || 0) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {metrics?.performance.errors.toLocaleString() || '0'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default HealthTab;
