import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuth from '../components/useAuth';
import { createPageUrl } from '../utils';
import MietrechtChat from '../components/chat/MietrechtChat';

export default function Mietrecht() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    React.useEffect(() => {
        if (!authLoading && !user) {
            navigate(createPageUrl('Register'));
        }
    }, [user, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="p-4 border-b bg-white flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-bold text-gray-900">⚖️ Mietrecht-Assistent</h1>
            </header>

            <div className="h-[calc(100vh-140px)] p-4">
                <MietrechtChat
                    userType="mieter"
                    appSource="mieterapp"
                />
            </div>
        </div>
    );
}