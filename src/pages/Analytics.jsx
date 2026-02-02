import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

export default function AnalyticsPage() {
    const [orgId, setOrgId] = useState(null);
    const [timeRange, setTimeRange] = useState('30d');

    useEffect(() => {
        loadOrganization();
    }, []);

    const loadOrganization = async () => {
        try {
            const user = await base44.auth.me();
            const memberships = await base44.entities.OrgMembership.filter({
                user_id: user.id,
                is_active: true
            });
            
            if (memberships.length > 0) {
                setOrgId(memberships[0].organization_id);
            }
        } catch (error) {
            console.error('Organization load error:', error);
        }
    };

    const handleExportPDF = async () => {
        console.log('Export analytics to PDF');
        // TODO: PDF Export
    };

    const handleExportCSV = async () => {
        console.log('Export analytics to CSV');
        // TODO: CSV Export
    };

    if (!orgId) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-gray-600">Lade Organisation...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                        <p className="text-gray-600 mt-1">
                            Übersicht über alle wichtigen Kennzahlen
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">7 Tage</SelectItem>
                                <SelectItem value="30d">30 Tage</SelectItem>
                                <SelectItem value="90d">90 Tage</SelectItem>
                                <SelectItem value="365d">12 Monate</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Button variant="outline" onClick={handleExportPDF}>
                            <FileText className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                        
                        <Button variant="outline" onClick={handleExportCSV}>
                            <Download className="w-4 h-4 mr-2" />
                            CSV
                        </Button>
                    </div>
                </div>

                {/* Dashboard */}
                <AnalyticsDashboard orgId={orgId} timeRange={timeRange} />
            </div>
        </div>
    );
}