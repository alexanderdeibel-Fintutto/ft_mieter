import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User, CreditCard } from 'lucide-react';
import useAuth from './useAuth';
import useSubscription from './useSubscription';
import OrgSwitcher from './OrgSwitcher';
import DarkModeToggle from './DarkModeToggle';
import { Badge } from '@/components/ui/badge';

export default function NavBar() {
    const { user, logout } = useAuth();
    const { tier } = useSubscription();

    const tierColors = {
        free: 'bg-gray-100 text-gray-800',
        starter: 'bg-blue-100 text-blue-800',
        pro: 'bg-purple-100 text-purple-800',
        enterprise: 'bg-yellow-100 text-yellow-800'
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 transition-shadow duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">T</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900 hidden sm:inline">Template Core</span>
                    </Link>

                    {user && (
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="hidden md:block">
                                <OrgSwitcher />
                            </div>
                            
                            <Badge className={`${tierColors[tier] || tierColors.free} hidden sm:flex`}>
                                {tier.toUpperCase()}
                            </Badge>
                            
                            <Link to={createPageUrl('Profile')} title="Profile">
                                <Button variant="ghost" size="icon" className="hover:bg-gray-100 transition-colors">
                                    <User className="w-5 h-5" />
                                </Button>
                            </Link>

                            <Link to={createPageUrl('Billing')} title="Billing">
                                <Button variant="ghost" size="icon" className="hover:bg-gray-100 transition-colors">
                                    <CreditCard className="w-5 h-5" />
                                </Button>
                            </Link>

                            <Link to={createPageUrl('Settings')} title="Settings">
                                <Button variant="ghost" size="icon" className="hover:bg-gray-100 transition-colors">
                                    <Settings className="w-5 h-5" />
                                </Button>
                            </Link>

                            <DarkModeToggle />

                            <Button variant="ghost" size="icon" onClick={logout} title="Logout" className="hover:bg-gray-100 transition-colors">
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}