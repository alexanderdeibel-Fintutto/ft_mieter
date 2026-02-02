import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import AppSwitcher from './AppSwitcher';
import { LogOut, Settings, Home } from 'lucide-react';

export default function UnifiedNavigation({ currentPageName, userRole }) {
    const location = useLocation();

    const handleLogout = async () => {
        await base44.auth.logout('/');
    };

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo / Home */}
                    <a href={createPageUrl('Dashboard')} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg">FinTuttO</span>
                    </a>

                    {/* App Switcher & Settings */}
                    <div className="flex items-center gap-4">
                        <AppSwitcher />

                        {userRole === 'admin' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => (window.location.href = createPageUrl('Settings'))}
                                title="Settings"
                            >
                                <Settings className="w-5 h-5" />
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}