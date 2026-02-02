import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { HardDrive, Download, RotateCcw, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function BackupRecovery() {
    const [backups, setBackups] = useState([
        { id: 1, date: '2026-01-24 14:30', size: '2.4 GB', status: 'success', type: 'Automatisch' },
        { id: 2, date: '2026-01-23 14:30', size: '2.3 GB', status: 'success', type: 'Automatisch' },
        { id: 3, date: '2026-01-22 10:15', size: '2.2 GB', status: 'success', type: 'Manuell' },
        { id: 4, date: '2026-01-21 14:30', size: '2.1 GB', status: 'success', type: 'Automatisch' },
    ]);

    const [recoveryPoints, setRecoveryPoints] = useState([
        { id: 1, date: '2026-01-24', description: 'Vor Datenbankupdate', status: 'available' },
        { id: 2, date: '2026-01-20', description: 'Vor System-Migration', status: 'available' },
        { id: 3, date: '2026-01-15', description: 'Wöchentlicher Checkpoint', status: 'available' },
    ]);

    const [backupProgress, setBackupProgress] = useState(0);
    const [isBackingUp, setIsBackingUp] = useState(false);

    const startBackup = () => {
        setIsBackingUp(true);
        setBackupProgress(0);
        const interval = setInterval(() => {
            setBackupProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsBackingUp(false);
                    alert('Backup abgeschlossen!');
                    return 100;
                }
                return prev + 10;
            });
        }, 500);
    };

    const downloadBackup = (id) => {
        const backup = backups.find(b => b.id === id);
        alert(`Backup von ${backup.date} wird heruntergeladen...`);
    };

    return (
        <div className="space-y-4 pb-20">
            {/* Header */}
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <HardDrive className="w-6 h-6" /> Backup & Disaster Recovery
            </h1>

            {/* Status Overview */}
            <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-green-900">System gesund</p>
                            <p className="text-sm text-green-700">Letztes Backup: 2026-01-24 14:30 (Erfolgreich)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="backups" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="backups">Backups</TabsTrigger>
                    <TabsTrigger value="recovery">Recovery</TabsTrigger>
                    <TabsTrigger value="schedule">Planung</TabsTrigger>
                </TabsList>

                {/* Backups Tab */}
                <TabsContent value="backups" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Backup jetzt erstellen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isBackingUp && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">Backup wird erstellt...</p>
                                        <span className="text-sm text-gray-500">{backupProgress}%</span>
                                    </div>
                                    <Progress value={backupProgress} className="h-2" />
                                </div>
                            )}
                            <Button
                                onClick={startBackup}
                                disabled={isBackingUp}
                                className="w-full bg-violet-600 hover:bg-violet-700"
                            >
                                {isBackingUp ? 'Backup läuft...' : '+ Backup jetzt erstellen'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Verfügbare Backups</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {backups.map(backup => (
                                <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <p className="font-medium text-gray-900">{backup.date}</p>
                                            <Badge className="text-xs">{backup.type}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{backup.size}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {backup.status === 'success' && (
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadBackup(backup.id)}
                                        >
                                            <Download className="w-4 h-4 mr-1" /> Download
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Recovery Tab */}
                <TabsContent value="recovery" className="space-y-4">
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-yellow-900">Warnung</p>
                                    <p className="text-sm text-yellow-700">Recovery wird alle aktuellen Daten mit dem ausgewählten Backup überschreiben</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        {recoveryPoints.map(point => (
                            <Card key={point.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{point.date}</p>
                                            <p className="text-sm text-gray-600">{point.description}</p>
                                        </div>
                                        <Button
                                            variant={point.status === 'available' ? 'outline' : 'ghost'}
                                            disabled={point.status !== 'available'}
                                        >
                                            <RotateCcw className="w-4 h-4 mr-1" /> Wiederherstellen
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Backup-Zeitplan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="font-medium text-green-900">Täglich um 14:30 Uhr</p>
                                <p className="text-sm text-green-700">Automatische Backups aktiviert</p>
                            </div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="font-medium text-blue-900">Aufbewahrung: 30 Tage</p>
                                <p className="text-sm text-blue-700">Alte Backups werden automatisch gelöscht</p>
                            </div>
                            <Button variant="outline" className="w-full">
                                Zeitplan bearbeiten
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}