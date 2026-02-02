import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, LayoutGrid, MessageSquare, User, Bell, Search, MapPin } from 'lucide-react';
import { createPageUrl } from '../utils';
import GlobalSearchTrigger from './search/GlobalSearchTrigger';

function NavItem({ icon: Icon, label, to, badge }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-colors
        ${isActive ? 'text-[#8B5CF6]' : 'text-gray-500'}`}
    >
      <div className="relative">
        <Icon className="w-6 h-6" />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
}

function NotificationNavItem() {
  const location = useLocation();
  const isActive = location.pathname.includes('Benachrichtigungen');
  
  // Get unread count from localStorage (synced with PushNotificationService)
  const [unreadCount, setUnreadCount] = React.useState(0);
  
  React.useEffect(() => {
    const updateCount = () => {
      const saved = localStorage.getItem('unreadNotifications');
      setUnreadCount(saved ? parseInt(saved, 10) : 0);
    };
    
    updateCount();
    
    // Listen for storage changes
    window.addEventListener('storage', updateCount);
    
    // Poll for changes (for same-tab updates)
    const interval = setInterval(updateCount, 2000);
    
    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(interval);
    };
  }, []);

  return (
    <Link
      to={createPageUrl('Benachrichtigungen')}
      className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-colors
        ${isActive ? 'text-[#8B5CF6]' : 'text-gray-500'}`}
    >
      <div className="relative">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
      <span className="text-xs mt-1">Alerts</span>
    </Link>
  );
}

function SearchNavItem() {
  return (
    <div className="flex flex-col items-center justify-center p-2">
      <GlobalSearchTrigger variant="icon" />
      <span className="text-xs mt-1 text-gray-500">Suche</span>
    </div>
  );
}

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around max-w-md mx-auto">
        <NavItem icon={Home} label="Home" to={createPageUrl('Home')} />
        <NavItem icon={MapPin} label="Karte" to={createPageUrl('Karte')} />
        <NotificationNavItem />
        <NavItem icon={MessageSquare} label="Chats" to={createPageUrl('Chat')} />
        <NavItem icon={User} label="Profil" to={createPageUrl('Profile')} />
      </div>
    </nav>
  );
}