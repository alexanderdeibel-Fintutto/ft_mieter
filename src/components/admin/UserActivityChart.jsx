import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function UserActivityChart() {
    const activityData = [
        { day: 'Mo', active: 320, new: 45 },
        { day: 'Di', active: 380, new: 52 },
        { day: 'Mi', active: 350, new: 38 },
        { day: 'Do', active: 420, new: 65 },
        { day: 'Fr', active: 480, new: 72 },
        { day: 'Sa', active: 290, new: 28 },
        { day: 'So', active: 260, new: 22 },
    ];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Aktive Nutzer (7 Tage)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="active" stroke="#8B5CF6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Neue Registrierungen vs. Aktive</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="active" fill="#8B5CF6" />
                            <Bar dataKey="new" fill="#06B6D4" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}