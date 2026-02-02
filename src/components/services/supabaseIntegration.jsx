import { supabase } from './supabase';

// Re-export from central supabase.js
export { supabase };

/**
 * Zentraler Supabase Query-Handler mit Fehlerbehandlung
 */
export async function safeQuery(queryFn, errorLabel = 'Query') {
  try {
    const { data, error } = await queryFn();
    if (error) {
      console.error(`${errorLabel} error:`, error);
      return null;
    }
    return data;
  } catch (error) {
    console.error(`${errorLabel} exception:`, error);
    return null;
  }
}

/**
 * Mieter-Dashboard laden (MieterApp Hauptansicht)
 */
export async function loadTenantDashboard(userId) {
  return safeQuery(
    () => supabase
      .from('v_tenant_dashboard')
      .select('*')
      .eq('user_id', userId)
      .single(),
    'TenantDashboard'
  );
}

/**
 * Gebäude laden (nach Org)
 */
export async function loadBuildings(orgId) {
  return safeQuery(
    () => supabase
      .from('v_buildings_summary')
      .select('*')
      .eq('org_id', orgId)
      .order('name'),
    'Buildings'
  );
}

/**
 * Einheiten mit Mieter laden (für ein Gebäude)
 */
export async function loadUnitsWithLease(buildingId) {
  return safeQuery(
    () => supabase
      .from('v_units_with_lease')
      .select('*')
      .eq('building_id', buildingId)
      .order('unit_number'),
    'UnitsWithLease'
  );
}

/**
 * Aktive Mietverträge laden
 */
export async function loadActiveLeases(buildingId) {
  return safeQuery(
    () => supabase
      .from('v_active_leases')
      .select('*')
      .eq('building_id', buildingId),
    'ActiveLeases'
  );
}

/**
 * Zähler mit letzter Ablesung laden
 */
export async function loadMetersWithReadings(buildingId) {
  return safeQuery(
    () => supabase
      .from('v_meters_with_readings')
      .select('*')
      .eq('building_id', buildingId)
      .eq('is_active', true),
    'MetersWithReadings'
  );
}

/**
 * Offene Aufgaben/Schadensmeldungen laden
 */
export async function loadOpenTasks(orgId) {
  return safeQuery(
    () => supabase
      .from('v_open_tasks')
      .select('*')
      .eq('org_id', orgId)
      .order('priority', { ascending: false })
      .order('due_date'),
    'OpenTasks'
  );
}

/**
 * App-Preise laden (dynamisches Pricing)
 */
export async function loadAppPricing(appId) {
  return safeQuery(
    () => supabase
      .from('v_app_pricing')
      .select('*')
      .eq('app_id', appId)
      .eq('livemode', true)
      .order('sort_order'),
    'AppPricing'
  );
}

/**
 * Cross-Sell Apps laden
 */
export async function loadCrossSellApps(appId) {
  return safeQuery(
    () => supabase
      .from('v_fintutto_ecosystem')
      .select('*')
      .neq('app_id', appId)
      .order('sort_order'),
    'CrossSellApps'
  );
}

/**
 * Neue Schadensmeldung erstellen
 */
export async function createMaintenanceTask(taskData) {
  return safeQuery(
    () => supabase
      .from('maintenance_tasks')
      .insert(taskData)
      .select(),
    'CreateMaintenanceTask'
  );
}

/**
 * Zählerablesung speichern
 */
export async function submitMeterReading(readingData) {
  return safeQuery(
    () => supabase
      .from('meter_readings')
      .insert(readingData)
      .select(),
    'SubmitMeterReading'
  );
}

/**
 * Übersichts-View für Vermieter
 */
export async function loadLandlordDashboard(orgId) {
  return safeQuery(
    () => supabase
      .from('v_landlord_dashboard')
      .select('*')
      .eq('org_id', orgId)
      .single(),
    'LandlordDashboard'
  );
}

/**
 * NK-Übersicht laden
 */
export async function loadOperatingCostSummary(buildingId) {
  return safeQuery(
    () => supabase
      .from('v_operating_cost_summary')
      .select('*')
      .eq('building_id', buildingId),
    'OperatingCostSummary'
  );
}