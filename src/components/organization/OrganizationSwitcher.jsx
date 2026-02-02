import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Building2, ChevronDown, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function OrganizationSwitcher() {
    const [currentOrg, setCurrentOrg] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrganizations();
    }, []);

    const loadOrganizations = async () => {
        try {
            setLoading(true);
            const user = await base44.auth.me();
            if (!user) return;

            // Hole alle Organisationen des Users
            const memberships = await base44.entities.OrgMembership.filter({
                user_id: user.id,
                is_active: true
            });

            if (memberships.length === 0) return;

            // Lade alle Organisations-Details
            const orgs = await Promise.all(
                memberships.map(async (m) => {
                    const orgsData = await base44.entities.Organization.filter({
                        id: m.organization_id
                    });
                    return {
                        ...orgsData[0],
                        membership_id: m.id,
                        user_role: m.role
                    };
                })
            );

            setOrganizations(orgs);
            // Setze erste Org als current
            if (orgs.length > 0) {
                setCurrentOrg(orgs[0]);
                // Speichere in localStorage für Persistenz
                localStorage.setItem('current_org_id', orgs[0].id);
            }
        } catch (error) {
            console.error('Load organizations error:', error);
        } finally {
            setLoading(false);
        }
    };

    const switchOrganization = (org) => {
        setCurrentOrg(org);
        localStorage.setItem('current_org_id', org.id);
        // Reload page, falls nötig
        window.location.reload();
    };

    if (loading || !currentOrg) {
        return (
            <Button variant="outline" disabled size="sm">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
            </Button>
        );
    }

    if (organizations.length <= 1) {
        return (
            <Button variant="outline" size="sm" disabled>
                <Building2 className="w-4 h-4 mr-2" />
                {currentOrg.name}
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Building2 className="w-4 h-4 mr-2" />
                    {currentOrg.name}
                    <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Organisationen</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {organizations.map((org) => (
                    <DropdownMenuItem
                        key={org.id}
                        onClick={() => switchOrganization(org)}
                        className={currentOrg.id === org.id ? 'bg-blue-50' : ''}
                    >
                        <div className="flex-1">
                            <p className="font-medium">{org.name}</p>
                            <p className="text-xs text-gray-500">{org.user_role}</p>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}