import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowRight, Building2, Wrench, Users } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Onboarding() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [step, setStep] = useState(1);
    const [userType, setUserType] = useState('');
    const [organization, setOrganization] = useState({
        name: '',
        type: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
            } catch (error) {
                navigate('/register');
            }
        };
        loadUser();
    }, [navigate]);

    const handleCreateOrg = async () => {
        if (!organization.name || !organization.type) {
            toast.error('Bitte fülle alle Felder aus');
            return;
        }

        setLoading(true);
        try {
            // Create organization
            const org = await base44.entities.Organization.create({
                name: organization.name,
                type: organization.type,
                owner_user_id: user.id
            });

            // Create org membership
            await base44.entities.OrgMembership.create({
                organization_id: org.id,
                user_id: user.id,
                role: 'owner'
            });

            // Update user profile
            await base44.auth.updateMe({
                onboarding_completed: true
            });

            toast.success('Profil erstellt!');
            navigate('/');
        } catch (error) {
            toast.error('Fehler beim Erstellen des Profils');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const userTypeOptions = [
        {
            id: 'vermieter',
            label: 'Vermieter / Hausverwaltung',
            description: 'Verwalte deine Immobilien',
            icon: Building2,
            color: 'bg-blue-50 border-blue-200'
        },
        {
            id: 'hausmeister',
            label: 'Hausmeister',
            description: 'Verwalte deine Aufgaben',
            icon: Wrench,
            color: 'bg-green-50 border-green-200'
        },
        {
            id: 'privat',
            label: 'Mieter / Privat',
            description: 'Community und Service',
            icon: Users,
            color: 'bg-purple-50 border-purple-200'
        }
    ];

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                {/* Step 1: User Type */}
                {step === 1 && (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-3xl mb-2">Willkommen zu FinTuttO!</CardTitle>
                            <p className="text-gray-600">Wer bist du?</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                {userTypeOptions.map(option => {
                                    const Icon = option.icon;
                                    return (
                                        <label
                                            key={option.id}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                userType === option.id
                                                    ? option.color + ' border-opacity-100'
                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <RadioGroup value={userType} onValueChange={setUserType}>
                                                    <RadioGroupItem value={option.id} id={option.id} />
                                                </RadioGroup>
                                                <Icon className="w-6 h-6" />
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900">
                                                        {option.label}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {option.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>

                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => setStep(2)}
                                disabled={!userType}
                            >
                                Weiter <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Organization Details */}
                {step === 2 && (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl mb-2">Dein Unternehmen</CardTitle>
                            <p className="text-gray-600">
                                {userType === 'vermieter' && 'Wie heißt deine Hausverwaltung?'}
                                {userType === 'hausmeister' && 'Dein Name / Geschäftsname'}
                                {userType === 'privat' && 'Dein Gebäude'}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="org-name" className="mb-2 block">
                                    Name
                                </Label>
                                <Input
                                    id="org-name"
                                    value={organization.name}
                                    onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                                    placeholder={
                                        userType === 'vermieter'
                                            ? 'z.B. Müller Hausverwaltung'
                                            : 'z.B. Dein Name'
                                    }
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setStep(1)}
                                >
                                    Zurück
                                </Button>
                                <Button
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    onClick={handleCreateOrg}
                                    disabled={!organization.name || loading}
                                >
                                    {loading ? 'Wird erstellt...' : 'Fertig'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </motion.div>
        </div>
    );
}