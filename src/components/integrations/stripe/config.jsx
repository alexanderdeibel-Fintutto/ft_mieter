export const STRIPE_CONFIG = {
  SUPABASE_URL: "https://aaefocdqgdgexkcrjhks.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA0NzAsImV4cCI6MjA4NDMzNjQ3MH0.qsLTEZo7shbafWY9w4Fo7is9GDW-1Af1wup_iCy2vVQ",
  
  ENDPOINTS: {
    GET_PRICES: "/functions/v1/get-stripe-prices",
    CREATE_CHECKOUT: "/functions/v1/create-checkout",
    GET_STATUS: "/functions/v1/get-subscription-status",
  },
  
  APP_IDS: {
    VERMIETIFY: "vermietify",
    MIETERAPP: "mieterapp",
    FORMULARE: "formulare",
    RECHNER: "rechner",
    BUNDLE: "all"
  },
  
  TIER_HIERARCHY: {
    free: 0, starter: 1, basic: 2, pro: 3, premium: 4, business: 5, bundle: 10
  },
  
  TIER_FEATURES: {
    free: { maxObjects: 1, kiAccess: false, bankSync: false, documentGen: false },
    starter: { maxObjects: 2, kiAccess: false, bankSync: false, documentGen: true },
    basic: { maxObjects: 3, kiAccess: false, bankSync: true, documentGen: true },
    pro: { maxObjects: -1, kiAccess: true, bankSync: true, documentGen: true },
    premium: { maxObjects: -1, kiAccess: true, bankSync: true, documentGen: true },
    business: { maxObjects: -1, kiAccess: true, bankSync: true, documentGen: true, multiUser: true, api: true },
    bundle: { maxObjects: -1, kiAccess: true, bankSync: true, documentGen: true, multiUser: true, api: true, allApps: true }
  },
  
  // MieterApp-spezifische Feature Limits
  mieterappFeatures: {
    free: {
      documentUpload: 5, documentStorage: 50, paymentTransactions: 12, nebenkostenAbrechnungen: 1,
      repairRequests: 3, repairPhotos: 3, marketplaceListings: 2, communityPosts: 5,
      chatMessages: 50, groupChats: 1, aiChatMessages: 0, mietrechtAnalysen: 0, letterXpressLetters: 0,
      pushNotifications: true, emailDigests: false, prioritySupport: false, responseTime: '48h'
    },
    basic: {
      documentUpload: -1, documentStorage: 500, paymentTransactions: -1, nebenkostenAbrechnungen: -1,
      repairRequests: -1, repairPhotos: 10, marketplaceListings: 10, communityPosts: -1,
      chatMessages: -1, groupChats: 5, aiChatMessages: 30, mietrechtAnalysen: 0, letterXpressLetters: 3,
      pushNotifications: true, emailDigests: true, customNotifications: true, prioritySupport: false, responseTime: '24h'
    },
    pro: {
      documentUpload: -1, documentStorage: 2000, paymentTransactions: -1, nebenkostenAbrechnungen: -1,
      repairRequests: -1, repairPhotos: -1, marketplaceListings: -1, communityPosts: -1,
      chatMessages: -1, groupChats: -1, aiChatMessages: -1, mietrechtAnalysen: -1, letterXpressLetters: 10,
      pushNotifications: true, emailDigests: true, customNotifications: true, smsNotifications: true,
      prioritySupport: true, responseTime: '4h', videoMessages: true, smartAnalytics: true, documentOCR: true, contractAnalysis: true
    },
    business: {
      documentUpload: -1, documentStorage: 10000, paymentTransactions: -1, nebenkostenAbrechnungen: -1,
      repairRequests: -1, repairPhotos: -1, marketplaceListings: -1, communityPosts: -1,
      chatMessages: -1, groupChats: -1, aiChatMessages: -1, mietrechtAnalysen: -1, letterXpressLetters: -1,
      pushNotifications: true, emailDigests: true, customNotifications: true, smsNotifications: true,
      prioritySupport: true, dedicatedSupport: true, responseTime: '1h', videoMessages: true, audioMessages: true,
      smartAnalytics: true, documentOCR: true, contractAnalysis: true, predictiveAnalytics: true, bulkOperations: true,
      multipleUnits: -1, webhooks: true, apiAccess: true, onboarding: true
    },
    bundle: {
      documentUpload: -1, documentStorage: 10000, paymentTransactions: -1, nebenkostenAbrechnungen: -1,
      repairRequests: -1, repairPhotos: -1, marketplaceListings: -1, communityPosts: -1,
      chatMessages: -1, groupChats: -1, aiChatMessages: -1, mietrechtAnalysen: -1, letterXpressLetters: -1,
      allAppsAccess: true, crossAppSync: true, bundleDiscount: true
    }
  }
};