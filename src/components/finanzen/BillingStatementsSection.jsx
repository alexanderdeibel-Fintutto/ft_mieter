import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, Euro, ChevronRight, Search, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const TYPE_LABELS = {
    monatlich: 'Monatliche Abrechnung',
    jaehrlich: 'Jahresabrechnung',
    nebenkostenabrechnung: 'Nebenkostenabrechnung'
};

const STATUS_CONFIG = {
    offen: { label: 'Offen', color: 'bg-amber-100 text-amber-700' },
    bezahlt: { label: 'Bezahlt', color: 'bg-green-100 text-green-700' },
    teilbezahlt: { label: 'Teilbezahlt', color: 'bg-blue-100 text-blue-700' }
};

export default function BillingStatementsSection({ statements = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('alle');
    const [sortBy, setSortBy] = useState('datum_desc');

    // Filter und Sortierung
    const filteredAndSortedStatements = useMemo(() => {
        let filtered = [...statements];

        // Suche
        if (searchQuery) {
            filtered = filtered.filter(statement => 
                statement.period?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                TYPE_LABELS[statement.type]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                statement.total_amount?.toString().includes(searchQuery)
            );
        }

        // Status-Filter
        if (statusFilter !== 'alle') {
            filtered = filtered.filter(statement => statement.status === statusFilter);
        }

        // Sortierung
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'datum_desc':
                    return new Date(b.due_date || b.created_date) - new Date(a.due_date || a.created_date);
                case 'datum_asc':
                    return new Date(a.due_date || a.created_date) - new Date(b.due_date || b.created_date);
                case 'betrag_desc':
                    return (b.total_amount || 0) - (a.total_amount || 0);
                case 'betrag_asc':
                    return (a.total_amount || 0) - (b.total_amount || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [statements, searchQuery, statusFilter, sortBy]);

    if (statements.length === 0) {
        return (
            <Card className="p-6 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Noch keine Abrechnungen vorhanden</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-500" />
                    Abrechnungen
                </h3>
                <span className="text-sm text-gray-500">
                    {filteredAndSortedStatements.length} von {statements.length}
                </span>
            </div>

            {/* Filter und Suchleiste */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Rechnung suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Status filtern" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="alle">Alle Status</SelectItem>
                        <SelectItem value="offen">Offen</SelectItem>
                        <SelectItem value="bezahlt">Bezahlt</SelectItem>
                        <SelectItem value="teilbezahlt">Teilbezahlt</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sortieren nach" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="datum_desc">
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Datum (neueste zuerst)
                            </span>
                        </SelectItem>
                        <SelectItem value="datum_asc">
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Datum (älteste zuerst)
                            </span>
                        </SelectItem>
                        <SelectItem value="betrag_desc">
                            <span className="flex items-center gap-2">
                                <Euro className="w-4 h-4" />
                                Betrag (höchste zuerst)
                            </span>
                        </SelectItem>
                        <SelectItem value="betrag_asc">
                            <span className="flex items-center gap-2">
                                <Euro className="w-4 h-4" />
                                Betrag (niedrigste zuerst)
                            </span>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {filteredAndSortedStatements.length === 0 ? (
                <Card className="p-6 text-center">
                    <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Keine Rechnungen gefunden</p>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('alle');
                        }}
                        className="mt-3"
                    >
                        Filter zurücksetzen
                    </Button>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredAndSortedStatements.map((statement) => {
                    const status = STATUS_CONFIG[statement.status] || STATUS_CONFIG.offen;
                    const hasCredit = statement.outstanding_amount < 0;

                    return (
                        <Card 
                            key={statement.id}
                            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-violet-100 rounded-lg">
                                        <FileText className="w-5 h-5 text-violet-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            {TYPE_LABELS[statement.type] || statement.type}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            Zeitraum: {statement.period}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge className={status.color}>
                                                {status.label}
                                            </Badge>
                                            {statement.due_date && (
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Fällig: {format(new Date(statement.due_date), 'dd.MM.yyyy', { locale: de })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Gesamt</p>
                                    <p className="font-bold text-lg">
                                        €{statement.total_amount?.toFixed(2)}
                                    </p>
                                    {statement.outstanding_amount !== 0 && (
                                        <p className={`text-sm ${hasCredit ? 'text-green-600' : 'text-amber-600'}`}>
                                            {hasCredit ? 'Guthaben: ' : 'Offen: '}
                                            €{Math.abs(statement.outstanding_amount)?.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Details Row */}
                            <div className="flex items-center justify-between mt-4 pt-3 border-t">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Euro className="w-4 h-4" />
                                        Bezahlt: €{statement.paid_amount?.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {statement.document_url && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(statement.document_url, '_blank');
                                            }}
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            PDF
                                        </Button>
                                    )}
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
                </div>
            )}
        </div>
    );
}