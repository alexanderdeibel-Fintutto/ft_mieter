import { useState, useEffect, useCallback } from 'react';
import {
  loadTenantDashboard,
  loadBuildings,
  loadUnitsWithLease,
  loadActiveLeases,
  loadMetersWithReadings,
  loadOpenTasks,
  loadAppPricing,
  loadCrossSellApps
} from '@/components/services/supabaseIntegration';

/**
 * Hook zum Laden aller Mieter-Daten
 */
export function useTenantDashboard(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboard = await loadTenantDashboard(userId);
      setData(dashboard);
      if (!dashboard) {
        setError('Keine Mieterdaten gefunden');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) refresh();
  }, [userId, refresh]);

  return { data, loading, error, refresh };
}

/**
 * Hook zum Laden von Gebäuden
 */
export function useBuildings(orgId) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!orgId) {
        setBuildings([]);
        setLoading(false);
        return;
      }
      const data = await loadBuildings(orgId);
      setBuildings(data || []);
      setLoading(false);
    }
    load();
  }, [orgId]);

  return { buildings, loading };
}

/**
 * Hook zum Laden von Einheiten mit Mieter
 */
export function useUnitsWithLease(buildingId) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!buildingId) {
        setUnits([]);
        setLoading(false);
        return;
      }
      const data = await loadUnitsWithLease(buildingId);
      setUnits(data || []);
      setLoading(false);
    }
    load();
  }, [buildingId]);

  return { units, loading };
}

/**
 * Hook zum Laden von Zählern
 */
export function useMeters(buildingId) {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!buildingId) {
        setMeters([]);
        setLoading(false);
        return;
      }
      const data = await loadMetersWithReadings(buildingId);
      setMeters(data || []);
      setLoading(false);
    }
    load();
  }, [buildingId]);

  return { meters, loading };
}

/**
 * Hook zum Laden von Schadensmeldungen
 */
export function useOpenTasks(orgId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!orgId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await loadOpenTasks(orgId);
    setTasks(data || []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    refresh();
  }, [orgId, refresh]);

  return { tasks, loading, refresh };
}

/**
 * Hook zum Laden von dynamischen Preisen
 */
export function useAppPricing(appId) {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!appId) {
        setPricing([]);
        setLoading(false);
        return;
      }
      const data = await loadAppPricing(appId);
      setPricing(data || []);
      setLoading(false);
    }
    load();
  }, [appId]);

  return { pricing, loading };
}

/**
 * Hook zum Laden von Cross-Sell Apps
 */
export function useCrossSellApps(appId) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!appId) {
        setApps([]);
        setLoading(false);
        return;
      }
      const data = await loadCrossSellApps(appId);
      setApps(data || []);
      setLoading(false);
    }
    load();
  }, [appId]);

  return { apps, loading };
}