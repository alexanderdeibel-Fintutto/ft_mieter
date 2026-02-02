import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Zap, 
    Droplets, 
    Flame, 
    Trash2, 
    Building2, 
    ChevronDown, 
    ChevronUp,
    TrendingUp,
    TrendingDown,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const UTILITY_TYPES = {
    heating: { 
        icon: Flame, 
        label: 'Heizung', 
        color: 'text-orange-500',
        bgColor: 'bg-orange-100',
        barColor: 'bg-orange-500'
    },
    water: { 
        icon: Droplets, 
        label: 'Wasser/Abwasser', 
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
        barColor: 'bg-blue-500'
    },
    electricity: { 
        icon: Zap, 
        label: 'Allgemeinstrom', 
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
        barColor: 'bg-yellow-500'
    },
    waste: { 
        icon: Trash2, 
        label: 'Müllabfuhr', 
        color: 'text-green-500',
        bgColor: 'bg-green-100',
        barColor: 'bg-green-500'
    },
    maintenance: { 
        icon: Building2, 
        label: 'Hauswartung', 
        color: 'text-violet-500',
        bgColor: 'bg-violet-100',
        barColor: 'bg-violet-500'
    }
};

export default function UtilityCostBreakdown({ 
    breakdown = [],
    totalCost = 0,
    period = 'Q4 2025',
    prepayment = 0,
    balance = 0
}) {
    const [expanded, setExpanded] = useState(false);

    // Demo data if not provided
    const displayBreakdown = breakdown.length > 0 ? breakdown : [
        { type: 'heating', amount: 145.50, percentage: 45, trend: 12 },
        { type: 'water', amount: 68.20, percentage: 21, trend: -5 },
        { type: 'electricity', amount: 42.30, percentage: 13, trend: 3 },
        { type: 'waste', amount: 35.00, percentage: 11, trend: 0 },
        { type: 'maintenance', amount: 32.00, percentage: 10, trend: 2 }
    ];

    const displayTotal = totalCost || displayBreakdown.reduce((sum, item) => sum + item.amount, 0);
    const displayPrepayment = prepayment || 300;
    const displayBalance = balance || (displayPrepayment - displayTotal);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-violet-600" />
                        Nebenkostenabrechnung
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                        {period}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Vorauszahlung</p>
                        <p className="text-lg font-bold text-gray-900">€{displayPrepayment.toFixed(2)}</p>
                    </div>
                    <div className="text-center border-x border-gray-200">
                        <p className="text-xs text-gray-500">Tatsächlich</p>
                        <p className="text-lg font-bold text-gray-900">€{displayTotal.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Differenz</p>
                        <p className={`text-lg font-bold ${displayBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {displayBalance >= 0 ? '+' : ''}€{displayBalance.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Balance Status */}
                <div className={`p-3 rounded-xl ${displayBalance >= 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-sm font-medium ${displayBalance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {displayBalance >= 0 
                            ? `🎉 Du erhältst eine Rückzahlung von €${displayBalance.toFixed(2)}!`
                            : `⚠️ Nachzahlung erforderlich: €${Math.abs(displayBalance).toFixed(2)}`
                        }
                    </p>
                </div>

                {/* Breakdown Toggle */}
                <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => setExpanded(!expanded)}
                >
                    <span className="text-sm font-medium">Kostenaufschlüsselung</span>
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>

                {/* Detailed Breakdown */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                        >
                            {displayBreakdown.map((item, index) => {
                                const utilityType = UTILITY_TYPES[item.type] || UTILITY_TYPES.maintenance;
                                const Icon = utilityType.icon;
                                
                                return (
                                    <motion.div
                                        key={item.type}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${utilityType.bgColor}`}>
                                                    <Icon className={`w-4 h-4 ${utilityType.color}`} />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {utilityType.label}
                                                </span>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Info className="w-3.5 h-3.5 text-gray-400" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="text-xs">
                                                                {item.percentage}% der Gesamtkosten
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {item.trend !== 0 && (
                                                    <span className={`text-xs flex items-center gap-0.5 ${item.trend > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                        {item.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                        {Math.abs(item.trend)}%
                                                    </span>
                                                )}
                                                <span className="text-sm font-semibold text-gray-900">
                                                    €{item.amount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <Progress 
                                            value={item.percentage} 
                                            className="h-2"
                                        />
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}