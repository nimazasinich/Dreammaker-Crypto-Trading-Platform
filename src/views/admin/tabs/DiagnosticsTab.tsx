/**
 * Diagnostics Tab - Provider Diagnostics
 * 
 * Source: HealthView.tsx (Provider Diagnostics tab)
 * 
 * @version 1.0.0
 * @since Phase 3
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { dataManager } from '../../../services/dataManager';

interface ProviderStatus {
    name: string;
    status: 'healthy' | 'degraded' | 'offline';
    latency: number;
    lastChecked: number;
    errorCount: number;
}

export const DiagnosticsTab: React.FC = () => {
    const [providers, setProviders] = useState<ProviderStatus[]>([]);
    const [loading, setLoading] = useState(false);

    const loadProviderStatus = async () => {
        setLoading(true);
        try {
            // Mock provider status - replace with actual provider diagnostics
            const mockProviders: ProviderStatus[] = [
                {
                    name: 'Binance API',
                    status: 'healthy',
                    latency: 45,
                    lastChecked: Date.now(),
                    errorCount: 0
                },
                {
                    name: 'CoinGecko',
                    status: 'healthy',
                    latency: 120,
                    lastChecked: Date.now(),
                    errorCount: 0
                },
                {
                    name: 'News API',
                    status: 'healthy',
                    latency: 250,
                    lastChecked: Date.now(),
                    errorCount: 0
                },
                {
                    name: 'Sentiment Analysis',
                    status: 'degraded',
                    latency: 500,
                    lastChecked: Date.now(),
                    errorCount: 2
                }
            ];

            setProviders(mockProviders);
        } catch (error) {
            console.error('Failed to load provider status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProviderStatus();
        const interval = setInterval(loadProviderStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'degraded':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'offline':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Database className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'healthy':
                return <Badge className="bg-green-500">Healthy</Badge>;
            case 'degraded':
                return <Badge className="bg-yellow-500">Degraded</Badge>;
            case 'offline':
                return <Badge variant="destructive">Offline</Badge>;
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    const getLatencyColor = (latency: number) => {
        if (latency < 100) return 'text-green-500';
        if (latency < 300) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-6">
            {/* Header with Refresh */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Provider Diagnostics</h3>
                    <p className="text-sm text-muted-foreground">Data provider health and performance</p>
                </div>
                <Button
                    onClick={loadProviderStatus}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Provider Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((provider, idx) => (
                    <motion.div
                        key={provider.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(provider.status)}
                                        <CardTitle className="text-base">{provider.name}</CardTitle>
                                    </div>
                                    {getStatusBadge(provider.status)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Latency:</span>
                                        <span className={`font-medium ${getLatencyColor(provider.latency)}`}>
                                            {provider.latency}ms
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Error Count:</span>
                                        <span className={`font-medium ${provider.errorCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                            {provider.errorCount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Last Checked:</span>
                                        <span className="font-medium">
                                            {new Date(provider.lastChecked).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* System Information */}
            <Card>
                <CardHeader>
                    <CardTitle>System Information</CardTitle>
                    <CardDescription>Application configuration and environment</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-accent rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Environment</div>
                            <div className="font-medium">{import.meta.env.MODE || 'development'}</div>
                        </div>
                        <div className="p-4 bg-accent rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">API Version</div>
                            <div className="font-medium">v1.0.0</div>
                        </div>
                        <div className="p-4 bg-accent rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Node Version</div>
                            <div className="font-medium">{typeof process !== 'undefined' ? process.version : 'N/A'}</div>
                        </div>
                        <div className="p-4 bg-accent rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Build Date</div>
                            <div className="font-medium">{new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Debug Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Debug Information</CardTitle>
                    <CardDescription>Additional diagnostic details</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm font-mono bg-accent p-4 rounded-lg">
                        <div>User Agent: {navigator.userAgent}</div>
                        <div>Platform: {navigator.platform}</div>
                        <div>Language: {navigator.language}</div>
                        <div>Online: {navigator.onLine ? 'Yes' : 'No'}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DiagnosticsTab;
