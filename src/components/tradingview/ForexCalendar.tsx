/**
 * ForexCalendar Component
 * Compact Forex Factory Economic Calendar
 * Shows high-impact economic events
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, TrendingUp, TrendingDown, AlertTriangle, ChevronDown, ChevronUp, Globe, RefreshCw } from 'lucide-react';

interface EconomicEvent {
    id: string;
    time: string;
    currency: string;
    impact: 'high' | 'medium' | 'low';
    event: string;
    actual?: string;
    forecast?: string;
    previous?: string;
    isUpcoming: boolean;
}

interface ForexCalendarProps {
    isDark?: boolean;
    compact?: boolean;
    className?: string;
}

// Mock data - در production از API واقعی استفاده می‌شود
const generateMockEvents = (): EconomicEvent[] => {
    const now = new Date();
    const events: EconomicEvent[] = [
        {
            id: '1',
            time: new Date(now.getTime() + 30 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            currency: 'USD',
            impact: 'high',
            event: 'Non-Farm Payrolls',
            forecast: '180K',
            previous: '175K',
            isUpcoming: true,
        },
        {
            id: '2',
            time: new Date(now.getTime() + 60 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            currency: 'EUR',
            impact: 'high',
            event: 'ECB Interest Rate Decision',
            forecast: '4.50%',
            previous: '4.50%',
            isUpcoming: true,
        },
        {
            id: '3',
            time: new Date(now.getTime() + 120 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            currency: 'GBP',
            impact: 'medium',
            event: 'GDP m/m',
            forecast: '0.2%',
            previous: '0.1%',
            isUpcoming: true,
        },
        {
            id: '4',
            time: new Date(now.getTime() - 60 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            currency: 'JPY',
            impact: 'high',
            event: 'BOJ Policy Rate',
            actual: '-0.10%',
            forecast: '-0.10%',
            previous: '-0.10%',
            isUpcoming: false,
        },
        {
            id: '5',
            time: new Date(now.getTime() + 180 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            currency: 'USD',
            impact: 'medium',
            event: 'Unemployment Rate',
            forecast: '3.8%',
            previous: '3.7%',
            isUpcoming: true,
        },
        {
            id: '6',
            time: new Date(now.getTime() + 240 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            currency: 'CAD',
            impact: 'high',
            event: 'Employment Change',
            forecast: '25.0K',
            previous: '21.8K',
            isUpcoming: true,
        },
    ];
    return events;
};

const ForexCalendar: React.FC<ForexCalendarProps> = ({
    isDark = true,
    compact = true,
    className = ''
}) => {
    const [events, setEvents] = useState<EconomicEvent[]>([]);
    const [isExpanded, setIsExpanded] = useState(!compact);
    const [filter, setFilter] = useState<'all' | 'high'>('high');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);

    // Load events
    useEffect(() => {
        loadEvents();
        const interval = setInterval(loadEvents, 5 * 60 * 1000); // Refresh every 5 minutes
        return () => clearInterval(interval);
    }, []);

    const loadEvents = async () => {
        setIsLoading(true);
        try {
            // Try to fetch from Forex Factory API or use their widget
            // Forex Factory doesn't have a public API, so we'll use their embed widget
            // For now, use mock data but structure it for Forex Factory format
            await new Promise(r => setTimeout(r, 500)); // Simulate API delay
            setEvents(generateMockEvents());
        } catch (error) {
            console.error('Failed to load calendar events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredEvents = useMemo(() => {
        if (filter === 'high') {
            return events.filter(e => e.impact === 'high');
        }
        return events;
    }, [events, filter]);

    const upcomingEvents = filteredEvents.filter(e => e.isUpcoming);
    const pastEvents = filteredEvents.filter(e => !e.isUpcoming);

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-400 bg-red-500/20';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20';
            case 'low': return 'text-green-400 bg-green-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getCurrencyFlag = (currency: string) => {
        const flags: Record<string, string> = {
            USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
            AUD: '🇦🇺', CAD: '🇨🇦', CHF: '🇨🇭', NZD: '🇳🇿',
        };
        return flags[currency] || '🌐';
    };

    const cardBg = isDark ? 'bg-[#1a1a28]' : 'bg-white';
    const borderColor = isDark ? 'border-purple-500/20' : 'border-purple-200';
    const textColor = isDark ? 'text-white' : 'text-slate-900';
    const mutedColor = isDark ? 'text-slate-400' : 'text-slate-600';


    return (
        <div className={`rounded-xl border ${cardBg} ${borderColor} ${className}`}>
            {/* Header */}
            <div
                className="flex items-center justify-between px-3 py-2 border-b cursor-pointer"
                style={{ borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)' }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span className={`text-sm font-semibold ${textColor}`}>Economic Calendar</span>
                    {upcomingEvents.length > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500/20 text-red-400 rounded">
                            {upcomingEvents.length} upcoming
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); loadEvents(); }}
                        className={`p-1 rounded hover:bg-purple-500/20 ${isLoading ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw className={`h-3 w-3 ${mutedColor}`} />
                    </button>
                    {isExpanded ? <ChevronUp className={`h-4 w-4 ${mutedColor}`} /> : <ChevronDown className={`h-4 w-4 ${mutedColor}`} />}
                </div>
            </div>

            {isExpanded && (
                <>
                    {/* Filter */}
                    <div className="flex items-center gap-1 px-3 py-2 border-b" style={{ borderColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }}>
                        <button
                            onClick={() => setFilter('high')}
                            className={`px-2 py-1 text-xs rounded transition ${filter === 'high' ? 'bg-red-500/20 text-red-400' : `${mutedColor} hover:bg-purple-500/10`}`}
                        >
                            High Impact
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-2 py-1 text-xs rounded transition ${filter === 'all' ? 'bg-purple-500/20 text-purple-400' : `${mutedColor} hover:bg-purple-500/10`}`}
                        >
                            All Events
                        </button>
                    </div>

                    {/* Events List */}
                    <div className="max-h-64 overflow-y-auto">
                        {filteredEvents.length === 0 ? (
                            <div className={`p-4 text-center text-sm ${mutedColor}`}>
                                No events found
                            </div>
                        ) : (
                            <div className="divide-y" style={{ borderColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)' }}>
                                {filteredEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className={`px-3 py-2 cursor-pointer transition hover:bg-purple-500/10 ${!event.isUpcoming ? 'opacity-60' : ''}`}
                                        onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{getCurrencyFlag(event.currency)}</span>
                                                <div>
                                                    <div className={`text-xs font-medium ${textColor}`}>{event.event}</div>
                                                    <div className={`text-[10px] ${mutedColor}`}>
                                                        <Clock className="h-2.5 w-2.5 inline mr-1" />
                                                        {event.time}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${getImpactColor(event.impact)}`}>
                                                {event.impact.toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Expanded Details */}
                                        {selectedEvent?.id === event.id && (
                                            <div className="mt-2 pt-2 border-t grid grid-cols-3 gap-2 text-xs" style={{ borderColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }}>
                                                {event.actual && (
                                                    <div>
                                                        <div className={mutedColor}>Actual</div>
                                                        <div className={`font-medium ${textColor}`}>{event.actual}</div>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className={mutedColor}>Forecast</div>
                                                    <div className={`font-medium ${textColor}`}>{event.forecast || '-'}</div>
                                                </div>
                                                <div>
                                                    <div className={mutedColor}>Previous</div>
                                                    <div className={`font-medium ${textColor}`}>{event.previous || '-'}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ForexCalendar;
