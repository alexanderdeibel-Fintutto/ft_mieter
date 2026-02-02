import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Wrench, MessageSquare, DollarSign } from 'lucide-react';
import LeaseDetailsSection from '../components/tenant/LeaseDetailsSection';
import RepairRequestPortal from '../components/tenant/RepairRequestPortal';
import TenantMessaging from '../components/tenant/TenantMessaging';
import PaymentHistoryView from '../components/tenant/PaymentHistoryView';

export default function TenantPortal() {
  const [activeTab, setActiveTab] = useState('lease');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mieterportal</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Verwalte deinen Mietvertrag, Zahlungen und Anfragen
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="lease" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Mietvertrag</span>
            </TabsTrigger>
            <TabsTrigger value="repairs" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">Reparaturen</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Nachrichten</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Zahlungen</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lease" className="space-y-6">
            <LeaseDetailsSection />
          </TabsContent>

          <TabsContent value="repairs" className="space-y-6">
            <RepairRequestPortal />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <TenantMessaging />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentHistoryView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}