import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, AlertCircle, TrendingUp } from 'lucide-react';

export default function BuildingOverviewCard({ building }) {
  const vacancyColor = building.vacancy_rate > 20 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{building.building_name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{building.street}, {building.zip} {building.city}</p>
          </div>
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-2xl font-bold">{building.total_units}</p>
            <p className="text-xs text-gray-600">Einheiten</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{building.occupied_units}</p>
            <p className="text-xs text-gray-600">Vermietet</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{building.vacancy_rate}%</p>
            <p className="text-xs text-gray-600">Leerstand</p>
          </div>
        </div>
        <Badge className={vacancyColor}>
          {building.vacancy_rate > 20 ? '⚠️ Hoher Leerstand' : '✓ Gute Auslastung'}
        </Badge>
      </CardContent>
    </Card>
  );
}