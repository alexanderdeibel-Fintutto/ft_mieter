import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Search, Mail, Phone, Loader2 } from 'lucide-react';
import { useLandlordTenants } from '@/components/hooks/useLandlordData';

export default function TenantManagementPanel() {
  const { data: tenants = [], isLoading } = useLandlordTenants();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);

  const filteredTenants = tenants.filter(t =>
    (t.tenant_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (t.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getLeaseStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          Mieter-Verwaltung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-600" />
          <Input
            placeholder="Nach Name oder E-Mail suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filteredTenants.length === 0 ? (
          <p className="text-center text-gray-600 py-6">Keine Mieter gefunden</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedTenant(tenant)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{tenant.tenant_name}</p>
                    <p className="text-sm text-gray-600">{tenant.unit_number}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                      {tenant.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {tenant.email}
                        </span>
                      )}
                      {tenant.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {tenant.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className={getLeaseStatusColor(tenant.lease_status)}>
                    {tenant.lease_status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedTenant?.tenant_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Einheit</p>
                  <p className="font-medium">{selectedTenant?.unit_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mietstatus</p>
                  <Badge className={getLeaseStatusColor(selectedTenant?.lease_status)}>
                    {selectedTenant?.lease_status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Kontakt</p>
                <p className="font-medium">{selectedTenant?.email}</p>
                {selectedTenant?.phone && (
                  <p className="font-medium">{selectedTenant.phone}</p>
                )}
              </div>

              {selectedTenant?.lease_start_date && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mietbeginn</p>
                    <p className="font-medium">
                      {new Date(selectedTenant.lease_start_date).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  {selectedTenant?.lease_end_date && (
                    <div>
                      <p className="text-sm text-gray-600">Mietende</p>
                      <p className="font-medium">
                        {new Date(selectedTenant.lease_end_date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Monatliche Miete</p>
                <p className="text-xl font-bold">{selectedTenant?.monthly_rent}€</p>
              </div>

              {selectedTenant?.payment_status && (
                <div>
                  <p className="text-sm text-gray-600">Zahlungsstatus</p>
                  <Badge className={selectedTenant.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {selectedTenant.payment_status}
                  </Badge>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}