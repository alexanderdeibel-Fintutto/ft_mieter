// Rollenbasierte Navigations-Hubs
export const NAVIGATION_HUBS = {
  mieter: [
    {
      id: 'wohnung',
      label: 'Meine Wohnung',
      icon: '🏠',
      color: 'bg-blue-100 dark:bg-blue-900',
      items: [
        { page: 'MeineWohnung', icon: '📋', label: 'Übersicht' },
        { page: 'Vertrag', icon: '📄', label: 'Mietvertrag' },
        { page: 'Zaehler', icon: '⚡', label: 'Zähler' },
        { page: 'Maengel', icon: '🔧', label: 'Mängel melden' },
      ]
    },
    {
      id: 'finanzen',
      label: 'Finanzen',
      icon: '💰',
      color: 'bg-green-100 dark:bg-green-900',
      items: [
        { page: 'MieterFinances', icon: '💳', label: 'Übersicht' },
        { page: 'Finanzen', icon: '📊', label: 'Abrechnungen' },
        { page: 'Billing', icon: '🧾', label: 'Rechnungen' },
      ]
    },
    {
      id: 'service',
      label: 'Service & Support',
      icon: '🔧',
      color: 'bg-purple-100 dark:bg-purple-900',
      items: [
        { page: 'MieterRepairs', icon: '🛠️', label: 'Reparaturen' },
        { page: 'MieterPackages', icon: '📦', label: 'Pakete' },
        { page: 'MieterMessages', icon: '💬', label: 'Nachrichten' },
        { page: 'MietrechtChat', icon: '⚖️', label: 'Mietrecht-Chat' },
      ]
    },
    {
      id: 'community',
      label: 'Community',
      icon: '👥',
      color: 'bg-orange-100 dark:bg-orange-900',
      items: [
        { page: 'MieterCommunity', icon: '👫', label: 'Nachbarn' },
        { page: 'Marktplatz', icon: '🛍️', label: 'Marktplatz' },
        { page: 'Schwarzesbrett', icon: '📌', label: 'Schwarzes Brett' },
        { page: 'Events', icon: '🎉', label: 'Veranstaltungen' },
      ]
    },
  ],
  landlord: [
    {
      id: 'immobilien',
      label: 'Immobilien',
      icon: '🏢',
      color: 'bg-blue-100 dark:bg-blue-900',
      items: [
        { page: 'LandlordDashboard', icon: '📊', label: 'Dashboard' },
        { page: 'MeinHaus', icon: '🏠', label: 'Meine Immobilien' },
        { page: 'VermietifyProperties', icon: '📋', label: 'Properties' },
      ]
    },
    {
      id: 'mieter',
      label: 'Mieter & Verträge',
      icon: '📋',
      color: 'bg-indigo-100 dark:bg-indigo-900',
      items: [
        { page: 'VermietifyTenants', icon: '👤', label: 'Mieterverwalltung' },
        { page: 'VermietifyLeases', icon: '📄', label: 'Verträge' },
        { page: 'MieterFinances', icon: '💳', label: 'Zahlungen' },
      ]
    },
    {
      id: 'wartung',
      label: 'Wartung & Instandhaltung',
      icon: '🔧',
      color: 'bg-amber-100 dark:bg-amber-900',
      items: [
        { page: 'MieterRepairs', icon: '🛠️', label: 'Reparaturen' },
        { page: 'HausmeisterTasks', icon: '✅', label: 'Aufgaben' },
      ]
    },
    {
      id: 'dokumente',
      label: 'Dokumente',
      icon: '📄',
      color: 'bg-cyan-100 dark:bg-cyan-900',
      items: [
        { page: 'Dokumente', icon: '📁', label: 'Dokumente' },
        { page: 'LetterXpress', icon: '✉️', label: 'Briefe versenden' },
      ]
    },
  ],
  admin: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      color: 'bg-slate-100 dark:bg-slate-900',
      items: [
        { page: 'AdminDashboard', icon: '🎯', label: 'Hauptdashboard' },
        { page: 'AdminMieterDashboard', icon: '👥', label: 'Mieter-Übersicht' },
      ]
    },
    {
      id: 'verwaltung',
      label: 'Verwaltung',
      icon: '⚙️',
      color: 'bg-gray-100 dark:bg-gray-900',
      items: [
        { page: 'AdminUsers', icon: '👤', label: 'Benutzer' },
        { page: 'AdminOrganizations', icon: '🏢', label: 'Organisationen' },
        { page: 'AdminBilling', icon: '💰', label: 'Abrechnung' },
      ]
    },
    {
      id: 'sicherheit',
      label: 'Sicherheit & Compliance',
      icon: '🔒',
      color: 'bg-red-100 dark:bg-red-900',
      items: [
        { page: 'AdminSecurityDashboard', icon: '🔐', label: 'Sicherheit' },
        { page: 'AdminAuditLogs', icon: '📋', label: 'Audit Logs' },
        { page: 'AdminCompliance', icon: '✅', label: 'Compliance' },
      ]
    },
    {
      id: 'monitoring',
      label: 'Monitoring & Performance',
      icon: '📈',
      color: 'bg-green-100 dark:bg-green-900',
      items: [
        { page: 'AdminMonitoring', icon: '📊', label: 'Monitoring' },
        { page: 'AdminPerformance', icon: '⚡', label: 'Performance' },
        { page: 'AdminErrors', icon: '❌', label: 'Fehler' },
      ]
    },
  ]
};

export const LESS_USED_FEATURES = {
  mieter: [
    { page: 'AdvancedSearch', icon: '🔍', label: 'Erweiterte Suche' },
    { page: 'Settings', icon: '⚙️', label: 'Einstellungen' },
    { page: 'Help', icon: '❓', label: 'Hilfe' },
  ],
  landlord: [
    { page: 'AdminWebhooks', icon: '🔗', label: 'Webhooks' },
    { page: 'APIManagement', icon: '🔌', label: 'API' },
    { page: 'Settings', icon: '⚙️', label: 'Einstellungen' },
  ],
  admin: [
    { page: 'AdminAPIManagement', icon: '🔌', label: 'API Management' },
    { page: 'AdminIntegrations', icon: '🔗', label: 'Integrationen' },
    { page: 'AdminSettings', icon: '⚙️', label: 'Systemeinstellungen' },
  ]
};