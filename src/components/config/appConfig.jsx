
export const APP_CONFIG = {
  stripe: {
    appId: 'mieterapp',
    livemode: true
  },
  supabase: {
    url: 'https://aaefocdqgdgexkcrjhks.supabase.co'
  },
  crossSell: {
    enabled: true,
    recommendedApps: ['vermietify']
  },
  messaging: {
    appId: 'mieterapp',
    userType: 'tenant',
    features: {
      directMessages: true,
      taskComments: true,
      documentDiscussions: true,
      groupChats: false,
      broadcasts: false
    }
  }
};
