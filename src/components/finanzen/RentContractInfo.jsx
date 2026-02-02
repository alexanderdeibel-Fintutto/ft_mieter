import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, 
    Calendar, 
    Euro, 
    Home, 
    User, 
    ChevronRight,
    Download,
    Clock,
    TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RentContractInfo({ contract, onViewContract }) {
    // Demo data if not provided
    const displayContract = contract || {
        start_date: '2023-01-01',
        end_date: null, // unbefristet
        rent_amount: 850,
        deposit_amount: 2550,
        deposit_status: 'paid',
        utilities_prepayment: 150,
        apartment: 'Wohnung 12, 3. OG links',
        landlord: 'Hausverwaltung Mustermann GmbH',
        last_increase: '2024-01-01',
        next_increase_possible: '2026-01-01'
    };

    const contractDuration = () => {
        const start = new Date(displayContract.start_date);
        const now = new Date();
        const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        return years > 0 
            ? `${years} ${years === 1 ? 'Jahr' : 'Jahre'}${remainingMonths > 0 ? `, ${remainingMonths} Monate` : ''}`
            : `${remainingMonths} Monate`;
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-violet-600" />
                        Mietvertrag
                    </CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-700">
                        Aktiv
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Main Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <Home className="w-4 h-4" />
                            <span className="text-xs">Objekt</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{displayContract.apartment}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <User className="w-4 h-4" />
                            <span className="text-xs">Vermieter</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{displayContract.landlord}</p>
                    </div>
                </div>

                {/* Financial Details */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Euro className="w-4 h-4 text-violet-600" />
                            <span className="text-sm text-gray-600">Kaltmiete</span>
                        </div>
                        <span className="font-semibold text-gray-900">€{displayContract.rent_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-600">NK-Vorauszahlung</span>
                        </div>
                        <span className="font-semibold text-gray-900">€{displayContract.utilities_prepayment.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Gesamtmiete</span>
                        <span className="font-bold text-lg text-violet-600">
                            €{(displayContract.rent_amount + displayContract.utilities_prepayment).toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Deposit Status */}
                <div className={`p-3 rounded-xl ${
                    displayContract.deposit_status === 'paid' 
                        ? 'bg-emerald-50 border border-emerald-200' 
                        : 'bg-amber-50 border border-amber-200'
                }`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Kaution</p>
                            <p className="text-xs text-gray-500">
                                {displayContract.deposit_status === 'paid' ? 'Vollständig gezahlt' : 'Ausstehend'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-900">€{displayContract.deposit_amount.toFixed(2)}</p>
                            <Badge className={displayContract.deposit_status === 'paid' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-amber-100 text-amber-700'
                            }>
                                {displayContract.deposit_status === 'paid' ? '✓ Bezahlt' : 'Offen'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Contract Duration */}
                <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-violet-600" />
                        <div>
                            <p className="text-sm font-medium text-violet-900">Mietdauer</p>
                            <p className="text-xs text-violet-600">
                                seit {new Date(displayContract.start_date).toLocaleDateString('de-DE')}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-violet-900">{contractDuration()}</p>
                        <Badge variant="outline" className="text-xs border-violet-300 text-violet-700">
                            {displayContract.end_date ? 'Befristet' : 'Unbefristet'}
                        </Badge>
                    </div>
                </div>

                {/* Rent Increase Info */}
                {displayContract.next_increase_possible && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                            Nächste Mieterhöhung möglich ab: {new Date(displayContract.next_increase_possible).toLocaleDateString('de-DE')}
                        </span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={onViewContract}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Vertrag ansehen
                    </Button>
                    <Button variant="outline">
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}