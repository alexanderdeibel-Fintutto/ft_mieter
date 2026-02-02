import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    History, 
    Search, 
    Filter, 
    Download, 
    ChevronLeft, 
    ChevronRight,
    Calendar
} from 'lucide-react';
import PaymentCard from './PaymentCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaymentHistory({ 
    payments = [], 
    onPaymentSelect, 
    onPay,
    itemsPerPage = 5 
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterYear, setFilterYear] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter payments
    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
        const matchesYear = filterYear === 'all' || new Date(payment.due_date).getFullYear().toString() === filterYear;
        return matchesSearch && matchesStatus && matchesYear;
    });

    // Pagination
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

    // Get unique years for filter
    const years = [...new Set(payments.map(p => new Date(p.due_date).getFullYear()))].sort((a, b) => b - a);

    const exportPayments = () => {
        // In a real app, this would generate a CSV or PDF
        const csvContent = [
            ['Beschreibung', 'Betrag', 'Fälligkeitsdatum', 'Status'],
            ...filteredPayments.map(p => [
                p.description,
                `€${p.amount.toFixed(2)}`,
                new Date(p.due_date).toLocaleDateString('de-DE'),
                p.status
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'zahlungsverlauf.csv';
        a.click();
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <History className="w-5 h-5 text-violet-600" />
                        Zahlungsverlauf
                    </CardTitle>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={exportPayments}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Suchen..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-9"
                        />
                    </div>
                    <Select 
                        value={filterStatus} 
                        onValueChange={(value) => {
                            setFilterStatus(value);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-32">
                            <Filter className="w-4 h-4 mr-2 text-gray-400" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle</SelectItem>
                            <SelectItem value="paid">Bezahlt</SelectItem>
                            <SelectItem value="pending">Offen</SelectItem>
                            <SelectItem value="overdue">Überfällig</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select 
                        value={filterYear} 
                        onValueChange={(value) => {
                            setFilterYear(value);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-32">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <SelectValue placeholder="Jahr" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle Jahre</SelectItem>
                            {years.map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Results Count */}
                <p className="text-sm text-gray-500">
                    {filteredPayments.length} {filteredPayments.length === 1 ? 'Zahlung' : 'Zahlungen'} gefunden
                </p>

                {/* Payment List */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={`${currentPage}-${filterStatus}-${filterYear}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                    >
                        {paginatedPayments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Keine Zahlungen gefunden</p>
                            </div>
                        ) : (
                            paginatedPayments.map((payment, index) => (
                                <PaymentCard
                                    key={payment.id}
                                    payment={payment}
                                    index={index}
                                    onViewDetails={onPaymentSelect}
                                    onPay={onPay}
                                />
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Zurück
                        </Button>
                        <span className="text-sm text-gray-500">
                            Seite {currentPage} von {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Weiter
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}