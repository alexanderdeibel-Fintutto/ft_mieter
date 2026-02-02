import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const useLandlordDashboard = () => {
  return useQuery({
    queryKey: ['landlord-dashboard'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('getLandlordData', { dataType: 'dashboard' });
      return data;
    },
  });
};

export const useLandlordBuildings = () => {
  return useQuery({
    queryKey: ['landlord-buildings'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('getLandlordData', { dataType: 'buildings' });
      return data;
    },
  });
};

export const useLandlordTenants = () => {
  return useQuery({
    queryKey: ['landlord-tenants'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('getLandlordData', { dataType: 'tenants' });
      return data;
    },
  });
};

export const useLandlordFinancials = () => {
  return useQuery({
    queryKey: ['landlord-financials'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('getLandlordData', { dataType: 'financials' });
      return data;
    },
  });
};

export const usePendingMeterReadings = () => {
  return useQuery({
    queryKey: ['pending-meter-readings'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('getLandlordData', { dataType: 'meter_readings' });
      return data;
    },
  });
};

export const useMaintenanceTasks = () => {
  return useQuery({
    queryKey: ['maintenance-tasks'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('getLandlordData', { dataType: 'maintenance_tasks' });
      return data;
    },
  });
};

export const useApproveMeterReading = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => base44.functions.invoke('approveMeterReading', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-meter-readings'] });
    },
  });
};

export const useUpdateMaintenanceTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => base44.functions.invoke('updateMaintenanceTask', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
    },
  });
};