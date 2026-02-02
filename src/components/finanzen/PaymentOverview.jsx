import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Clock, AlertTriangle, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentOverview({ 
    totalPaid = 0, 
    totalOpen = 0, 
    totalOverdue = 0,
    monthlyRent = 850,
    nextPaymentDate = null 
}) {
    const stats = [
        {
            label: 'Bezahlt (Jahr)',
            value: totalPaid,
            icon: TrendingUp,
            gradient: 'from-emerald-500 to-emerald-600',
            textColor: 'text-emerald-100',
            trend: '+12%',
            trendUp: true
        },
        {
            label: 'Offen',
            value: totalOpen,
            icon: Clock,
            gradient: 'from-amber-500 to-orange-500',
            textColor: 'text-amber-100',
            trend: null,
            trendUp: null
        },
        {
            label: 'Überfällig',
            value: totalOverdue,
            icon: AlertTriangle,
            gradient: totalOverdue > 0 ? 'from-red-500 to-red-600' : 'from-gray-400 to-gray-500',
            textColor: totalOverdue > 0 ? 'text-red-100' : 'text-gray-100',
            trend: null,
            trendUp: null
        }
    ];

    return (
        <div className="space-y-4">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className={`bg-gradient-to-br ${stat.gradient} text-white border-0 overflow-hidden relative`}>
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
                            <CardContent className="p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <stat.icon className="w-4 h-4" />
                                    <span className={`${stat.textColor} text-xs`}>{stat.label}</span>
                                </div>
                                <p className="text-lg font-bold">€{stat.value.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
                                {stat.trend && (
                                    <div className="flex items-center gap-1 mt-1">
                                        {stat.trendUp ? (
                                            <ArrowUpRight className="w-3 h-3" />
                                        ) : (
                                            <ArrowDownRight className="w-3 h-3" />
                                        )}
                                        <span className="text-xs opacity-80">{stat.trend}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Monthly Rent & Next Payment */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="bg-white border border-gray-100 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-violet-100 rounded-xl">
                                    <Wallet className="w-5 h-5 text-violet-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Monatliche Miete</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        €{monthlyRent.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                            {nextPaymentDate && (
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Nächste Zahlung</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {new Date(nextPaymentDate).toLocaleDateString('de-DE', { 
                                            day: 'numeric', 
                                            month: 'short' 
                                        })}
                                    </p>
                                    <p className="text-xs text-amber-600 font-medium">
                                        in {Math.ceil((new Date(nextPaymentDate) - new Date()) / (1000 * 60 * 60 * 24))} Tagen
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}