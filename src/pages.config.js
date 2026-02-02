/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AISettings from './pages/AISettings';
import AISystemPrompts from './pages/AISystemPrompts';
import AIUsageReports from './pages/AIUsageReports';
import AIWorkflowAutomation from './pages/AIWorkflowAutomation';
import APIDashboard from './pages/APIDashboard';
import APIDocumentation from './pages/APIDocumentation';
import APIManagement from './pages/APIManagement';
import AdminABTesting from './pages/AdminABTesting';
import AdminAPIAnalytics from './pages/AdminAPIAnalytics';
import AdminAPIGateway from './pages/AdminAPIGateway';
import AdminAPIManagement from './pages/AdminAPIManagement';
import AdminAccessControl from './pages/AdminAccessControl';
import AdminActivity from './pages/AdminActivity';
import AdminAdvancedAnalytics from './pages/AdminAdvancedAnalytics';
import AdminAdvancedReporting from './pages/AdminAdvancedReporting';
import AdminAdvancedSearch from './pages/AdminAdvancedSearch';
import AdminAuditCompliance from './pages/AdminAuditCompliance';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminAutoScaling from './pages/AdminAutoScaling';
import AdminBackupRecovery from './pages/AdminBackupRecovery';
import AdminBilling from './pages/AdminBilling';
import AdminBillingPlans from './pages/AdminBillingPlans';
import AdminCache from './pages/AdminCache';
import AdminCaching from './pages/AdminCaching';
import AdminCapacityManagement from './pages/AdminCapacityManagement';
import AdminCentralAnalytics from './pages/AdminCentralAnalytics';
import AdminChangeManagement from './pages/AdminChangeManagement';
import AdminCompliance from './pages/AdminCompliance';
import AdminComplianceAudit from './pages/AdminComplianceAudit';
import AdminConfigManagement from './pages/AdminConfigManagement';
import AdminContent from './pages/AdminContent';
import AdminContentModeration from './pages/AdminContentModeration';
import AdminCostAnalytics from './pages/AdminCostAnalytics';
import AdminCostAttribution from './pages/AdminCostAttribution';
import AdminCostManagement from './pages/AdminCostManagement';
import AdminCustomFields from './pages/AdminCustomFields';
import AdminDashboard from './pages/AdminDashboard';
import AdminDataExport from './pages/AdminDataExport';
import AdminDataManagement from './pages/AdminDataManagement';
import AdminDataPipeline from './pages/AdminDataPipeline';
import AdminDataSync from './pages/AdminDataSync';
import AdminDatabase from './pages/AdminDatabase';
import AdminDatabaseManagement from './pages/AdminDatabaseManagement';
import AdminDeployments from './pages/AdminDeployments';
import AdminDeveloperPortal from './pages/AdminDeveloperPortal';
import AdminDisasterRecovery from './pages/AdminDisasterRecovery';
import AdminDocumentSharing from './pages/AdminDocumentSharing';
import AdminDocumentSharingV2 from './pages/AdminDocumentSharingV2';
import AdminEmailCampaigns from './pages/AdminEmailCampaigns';
import AdminEmailService from './pages/AdminEmailService';
import AdminEncryption from './pages/AdminEncryption';
import AdminErrorTracking from './pages/AdminErrorTracking';
import AdminErrors from './pages/AdminErrors';
import AdminFeatureFlags from './pages/AdminFeatureFlags';
import AdminIncidentManagement from './pages/AdminIncidentManagement';
import AdminIncidents from './pages/AdminIncidents';
import AdminInfrastructure from './pages/AdminInfrastructure';
import AdminIntegrationMarketplace from './pages/AdminIntegrationMarketplace';
import AdminIntegrations from './pages/AdminIntegrations';
import AdminInternationalization from './pages/AdminInternationalization';
import AdminKnowledgeBase from './pages/AdminKnowledgeBase';
import AdminLiveMonitoring from './pages/AdminLiveMonitoring';
import AdminLoadBalancing from './pages/AdminLoadBalancing';
import AdminLoadTesting from './pages/AdminLoadTesting';
import AdminLogging from './pages/AdminLogging';
import AdminMetering from './pages/AdminMetering';
import AdminMieterDashboard from './pages/AdminMieterDashboard';
import AdminMobileNotifications from './pages/AdminMobileNotifications';
import AdminModeration from './pages/AdminModeration';
import AdminMonitoring from './pages/AdminMonitoring';
import AdminNotifications from './pages/AdminNotifications';
import AdminOrganizations from './pages/AdminOrganizations';
import AdminPartnerManagement from './pages/AdminPartnerManagement';
import AdminPayments from './pages/AdminPayments';
import AdminPerformance from './pages/AdminPerformance';
import AdminPerformanceOptimization from './pages/AdminPerformanceOptimization';
import AdminPermissions from './pages/AdminPermissions';
import AdminQualityAssurance from './pages/AdminQualityAssurance';
import AdminQueueJobs from './pages/AdminQueueJobs';
import AdminRateLimit from './pages/AdminRateLimit';
import AdminRateLimiting from './pages/AdminRateLimiting';
import AdminResourceQuotas from './pages/AdminResourceQuotas';
import AdminSSO from './pages/AdminSSO';
import AdminScheduling from './pages/AdminScheduling';
import AdminSearch from './pages/AdminSearch';
import AdminSecurity from './pages/AdminSecurity';
import AdminSecurityAudit from './pages/AdminSecurityAudit';
import AdminSecurityCompliance from './pages/AdminSecurityCompliance';
import AdminSecurityDashboard from './pages/AdminSecurityDashboard';
import AdminServiceLevelAgreement from './pages/AdminServiceLevelAgreement';
import AdminServiceMonitoring from './pages/AdminServiceMonitoring';
import AdminServiceRegistry from './pages/AdminServiceRegistry';
import AdminServices from './pages/AdminServices';
import AdminSystemHealth from './pages/AdminSystemHealth';
import AdminTenants from './pages/AdminTenants';
import AdminTrafficShaping from './pages/AdminTrafficShaping';
import AdminUsageAnalytics from './pages/AdminUsageAnalytics';
import AdminUserActivity from './pages/AdminUserActivity';
import AdminUserAnalytics from './pages/AdminUserAnalytics';
import AdminUsers from './pages/AdminUsers';
import AdminVendorManagement from './pages/AdminVendorManagement';
import AdminWebhooks from './pages/AdminWebhooks';
import AdminWorkflowAutomation from './pages/AdminWorkflowAutomation';
import AdvancedSearch from './pages/AdvancedSearch';
import Analytics from './pages/Analytics';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Ankuendigungen from './pages/Ankuendigungen';
import AuditLogs from './pages/AuditLogs';
import Billing from './pages/Billing';
import BackupRecovery from './pages/BackupRecovery';
import Benachrichtigungen from './pages/Benachrichtigungen';
import BillingSuccess from './pages/BillingSuccess';
import Chat from './pages/Chat';
import Community from './pages/Community';
import CustomerDashboard from './pages/CustomerDashboard';
import Dashboard from './pages/Dashboard';
import DeploymentGuide from './pages/DeploymentGuide';
import DesignShowcase from './pages/DesignShowcase';
import DocumentManagement from './pages/DocumentManagement';
import Dokumente from './pages/Dokumente';
import Events from './pages/Events';
import Finanzen from './pages/Finanzen';
import FormExamples from './pages/FormExamples';
import HausmeisterDashboard from './pages/HausmeisterDashboard';
import HausmeisterTasks from './pages/HausmeisterTasks';
import Help from './pages/Help';
import Home from './pages/Home';
import Invite from './pages/Invite';
import Kalender from './pages/Kalender';
import Karte from './pages/Karte';
import LandlordDashboard from './pages/LandlordDashboard';
import LetterXpress from './pages/LetterXpress';
import Maengel from './pages/Maengel';
import Marktplatz from './pages/Marktplatz';
import Mehr from './pages/Mehr';
import MeinHaus from './pages/MeinHaus';
import MeineWohnung from './pages/MeineWohnung';
import Messages from './pages/Messages';
import MieterCommunity from './pages/MieterCommunity';
import MieterDashboard from './pages/MieterDashboard';
import MieterFinances from './pages/MieterFinances';
import MieterHome from './pages/MieterHome';
import MieterInvite from './pages/MieterInvite';
import MieterMessages from './pages/MieterMessages';
import MieterMeters from './pages/MieterMeters';
import MieterPackages from './pages/MieterPackages';
import MieterRepairs from './pages/MieterRepairs';
import Mietrecht from './pages/Mietrecht';
import MietrechtChat from './pages/MietrechtChat';
import NachbarProfil from './pages/NachbarProfil';
import Nachrichten from './pages/Nachrichten';
import NavigationHub from './pages/NavigationHub';
import Notfall from './pages/Notfall';
import NotificationSettings from './pages/NotificationSettings';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import Pakete from './pages/Pakete';
import PerformanceDashboard from './pages/PerformanceDashboard';
import Pinnwand from './pages/Pinnwand';
import ProductionChecklist from './pages/ProductionChecklist';
import ProductionReadyChecklist from './pages/ProductionReadyChecklist';
import Profile from './pages/Profile';
import QualityAssurance from './pages/QualityAssurance';
import RealtimeDemo from './pages/RealtimeDemo';
import RechnerHome from './pages/RechnerHome';
import Register from './pages/Register';
import Reparaturen from './pages/Reparaturen';
import Reporting from './pages/Reporting';
import Schwarzesbrett from './pages/Schwarzesbrett';
import SecuritySettings from './pages/SecuritySettings';
import Settings from './pages/Settings';
import SharedDocuments from './pages/SharedDocuments';
import SupabaseLogin from './pages/SupabaseLogin';
import SupabaseRegister from './pages/SupabaseRegister';
import SystemSettings from './pages/SystemSettings';
import TaskChat from './pages/TaskChat';
import TenantPortal from './pages/TenantPortal';
import Termine from './pages/Termine';
import Tools from './pages/Tools';
import Umfragen from './pages/Umfragen';
import UpgradeSuccess from './pages/UpgradeSuccess';
import UserManagement from './pages/UserManagement';
import Verbrauch from './pages/Verbrauch';
import Verify from './pages/Verify';
import VermietifyDashboard from './pages/VermietifyDashboard';
import VermietifyLeases from './pages/VermietifyLeases';
import VermietifyPayments from './pages/VermietifyPayments';
import VermietifyProperties from './pages/VermietifyProperties';
import VermietifyTenants from './pages/VermietifyTenants';
import Vertrag from './pages/Vertrag';
import WhatsNew from './pages/WhatsNew';
import WorkflowAutomation from './pages/WorkflowAutomation';
import Zaehler from './pages/Zaehler';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AISettings": AISettings,
    "AISystemPrompts": AISystemPrompts,
    "AIUsageReports": AIUsageReports,
    "AIWorkflowAutomation": AIWorkflowAutomation,
    "APIDashboard": APIDashboard,
    "APIDocumentation": APIDocumentation,
    "APIManagement": APIManagement,
    "AdminABTesting": AdminABTesting,
    "AdminAPIAnalytics": AdminAPIAnalytics,
    "AdminAPIGateway": AdminAPIGateway,
    "AdminAPIManagement": AdminAPIManagement,
    "AdminAccessControl": AdminAccessControl,
    "AdminActivity": AdminActivity,
    "AdminAdvancedAnalytics": AdminAdvancedAnalytics,
    "AdminAdvancedReporting": AdminAdvancedReporting,
    "AdminAdvancedSearch": AdminAdvancedSearch,
    "AdminAuditCompliance": AdminAuditCompliance,
    "AdminAuditLogs": AdminAuditLogs,
    "AdminAutoScaling": AdminAutoScaling,
    "AdminBackupRecovery": AdminBackupRecovery,
    "AdminBilling": AdminBilling,
    "AdminBillingPlans": AdminBillingPlans,
    "AdminCache": AdminCache,
    "AdminCaching": AdminCaching,
    "AdminCapacityManagement": AdminCapacityManagement,
    "AdminCentralAnalytics": AdminCentralAnalytics,
    "AdminChangeManagement": AdminChangeManagement,
    "AdminCompliance": AdminCompliance,
    "AdminComplianceAudit": AdminComplianceAudit,
    "AdminConfigManagement": AdminConfigManagement,
    "AdminContent": AdminContent,
    "AdminContentModeration": AdminContentModeration,
    "AdminCostAnalytics": AdminCostAnalytics,
    "AdminCostAttribution": AdminCostAttribution,
    "AdminCostManagement": AdminCostManagement,
    "AdminCustomFields": AdminCustomFields,
    "AdminDashboard": AdminDashboard,
    "AdminDataExport": AdminDataExport,
    "AdminDataManagement": AdminDataManagement,
    "AdminDataPipeline": AdminDataPipeline,
    "AdminDataSync": AdminDataSync,
    "AdminDatabase": AdminDatabase,
    "AdminDatabaseManagement": AdminDatabaseManagement,
    "AdminDeployments": AdminDeployments,
    "AdminDeveloperPortal": AdminDeveloperPortal,
    "AdminDisasterRecovery": AdminDisasterRecovery,
    "AdminDocumentSharing": AdminDocumentSharing,
    "AdminDocumentSharingV2": AdminDocumentSharingV2,
    "AdminEmailCampaigns": AdminEmailCampaigns,
    "AdminEmailService": AdminEmailService,
    "AdminEncryption": AdminEncryption,
    "AdminErrorTracking": AdminErrorTracking,
    "AdminErrors": AdminErrors,
    "AdminFeatureFlags": AdminFeatureFlags,
    "AdminIncidentManagement": AdminIncidentManagement,
    "AdminIncidents": AdminIncidents,
    "AdminInfrastructure": AdminInfrastructure,
    "AdminIntegrationMarketplace": AdminIntegrationMarketplace,
    "AdminIntegrations": AdminIntegrations,
    "AdminInternationalization": AdminInternationalization,
    "AdminKnowledgeBase": AdminKnowledgeBase,
    "AdminLiveMonitoring": AdminLiveMonitoring,
    "AdminLoadBalancing": AdminLoadBalancing,
    "AdminLoadTesting": AdminLoadTesting,
    "AdminLogging": AdminLogging,
    "AdminMetering": AdminMetering,
    "AdminMieterDashboard": AdminMieterDashboard,
    "AdminMobileNotifications": AdminMobileNotifications,
    "AdminModeration": AdminModeration,
    "AdminMonitoring": AdminMonitoring,
    "AdminNotifications": AdminNotifications,
    "AdminOrganizations": AdminOrganizations,
    "AdminPartnerManagement": AdminPartnerManagement,
    "AdminPayments": AdminPayments,
    "AdminPerformance": AdminPerformance,
    "AdminPerformanceOptimization": AdminPerformanceOptimization,
    "AdminPermissions": AdminPermissions,
    "AdminQualityAssurance": AdminQualityAssurance,
    "AdminQueueJobs": AdminQueueJobs,
    "AdminRateLimit": AdminRateLimit,
    "AdminRateLimiting": AdminRateLimiting,
    "AdminResourceQuotas": AdminResourceQuotas,
    "AdminSSO": AdminSSO,
    "AdminScheduling": AdminScheduling,
    "AdminSearch": AdminSearch,
    "AdminSecurity": AdminSecurity,
    "AdminSecurityAudit": AdminSecurityAudit,
    "AdminSecurityCompliance": AdminSecurityCompliance,
    "AdminSecurityDashboard": AdminSecurityDashboard,
    "AdminServiceLevelAgreement": AdminServiceLevelAgreement,
    "AdminServiceMonitoring": AdminServiceMonitoring,
    "AdminServiceRegistry": AdminServiceRegistry,
    "AdminServices": AdminServices,
    "AdminSystemHealth": AdminSystemHealth,
    "AdminTenants": AdminTenants,
    "AdminTrafficShaping": AdminTrafficShaping,
    "AdminUsageAnalytics": AdminUsageAnalytics,
    "AdminUserActivity": AdminUserActivity,
    "AdminUserAnalytics": AdminUserAnalytics,
    "AdminUsers": AdminUsers,
    "AdminVendorManagement": AdminVendorManagement,
    "AdminWebhooks": AdminWebhooks,
    "AdminWorkflowAutomation": AdminWorkflowAutomation,
    "AdvancedSearch": AdvancedSearch,
    "Analytics": Analytics,
    "AnalyticsDashboard": AnalyticsDashboard,
    "Ankuendigungen": Ankuendigungen,
    "AuditLogs": AuditLogs,
    "Billing": Billing,
    "BackupRecovery": BackupRecovery,
    "Benachrichtigungen": Benachrichtigungen,
    "BillingSuccess": BillingSuccess,
    "Chat": Chat,
    "Community": Community,
    "CustomerDashboard": CustomerDashboard,
    "Dashboard": Dashboard,
    "DeploymentGuide": DeploymentGuide,
    "DesignShowcase": DesignShowcase,
    "DocumentManagement": DocumentManagement,
    "Dokumente": Dokumente,
    "Events": Events,
    "Finanzen": Finanzen,
    "FormExamples": FormExamples,
    "HausmeisterDashboard": HausmeisterDashboard,
    "HausmeisterTasks": HausmeisterTasks,
    "Help": Help,
    "Home": Home,
    "Invite": Invite,
    "Kalender": Kalender,
    "Karte": Karte,
    "LandlordDashboard": LandlordDashboard,
    "LetterXpress": LetterXpress,
    "Maengel": Maengel,
    "Marktplatz": Marktplatz,
    "Mehr": Mehr,
    "MeinHaus": MeinHaus,
    "MeineWohnung": MeineWohnung,
    "Messages": Messages,
    "MieterCommunity": MieterCommunity,
    "MieterDashboard": MieterDashboard,
    "MieterFinances": MieterFinances,
    "MieterHome": MieterHome,
    "MieterInvite": MieterInvite,
    "MieterMessages": MieterMessages,
    "MieterMeters": MieterMeters,
    "MieterPackages": MieterPackages,
    "MieterRepairs": MieterRepairs,
    "Mietrecht": Mietrecht,
    "MietrechtChat": MietrechtChat,
    "NachbarProfil": NachbarProfil,
    "Nachrichten": Nachrichten,
    "NavigationHub": NavigationHub,
    "Notfall": Notfall,
    "NotificationSettings": NotificationSettings,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "Pakete": Pakete,
    "PerformanceDashboard": PerformanceDashboard,
    "Pinnwand": Pinnwand,
    "ProductionChecklist": ProductionChecklist,
    "ProductionReadyChecklist": ProductionReadyChecklist,
    "Profile": Profile,
    "QualityAssurance": QualityAssurance,
    "RealtimeDemo": RealtimeDemo,
    "RechnerHome": RechnerHome,
    "Register": Register,
    "Reparaturen": Reparaturen,
    "Reporting": Reporting,
    "Schwarzesbrett": Schwarzesbrett,
    "SecuritySettings": SecuritySettings,
    "Settings": Settings,
    "SharedDocuments": SharedDocuments,
    "SupabaseLogin": SupabaseLogin,
    "SupabaseRegister": SupabaseRegister,
    "SystemSettings": SystemSettings,
    "TaskChat": TaskChat,
    "TenantPortal": TenantPortal,
    "Termine": Termine,
    "Tools": Tools,
    "Umfragen": Umfragen,
    "UpgradeSuccess": UpgradeSuccess,
    "UserManagement": UserManagement,
    "Verbrauch": Verbrauch,
    "Verify": Verify,
    "VermietifyDashboard": VermietifyDashboard,
    "VermietifyLeases": VermietifyLeases,
    "VermietifyPayments": VermietifyPayments,
    "VermietifyProperties": VermietifyProperties,
    "VermietifyTenants": VermietifyTenants,
    "Vertrag": Vertrag,
    "WhatsNew": WhatsNew,
    "WorkflowAutomation": WorkflowAutomation,
    "Zaehler": Zaehler,
}

export const pagesConfig = {
    mainPage: "NavigationHub",
    Pages: PAGES,
    Layout: __Layout,
};