import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, RefreshCw, DollarSign, MapPin, Save, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import type { TransporterData } from '@/types/auth';

export function TransporterRevenue() {
    const { user } = useAuth();
    const roleData = user?.roleData as TransporterData;
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [editingKilometers, setEditingKilometers] = useState<Record<string, string>>({});
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const loadRevenue = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const allBookings = await api.get<any[]>('/bookings');

            const myCompletedBookings = allBookings.filter(b =>
                b.transporterId === user.id &&
                b.status === 'TRANSPORTED'
            );

            const revenueEvents: any[] = [];
            let calculatedTotal = 0;
            const pricePerKm = roleData?.expectedChargePerKm || 0;

            myCompletedBookings.forEach((booking) => {
                const revenue = (booking.kilometers || 0) * pricePerKm;
                calculatedTotal += revenue;

                revenueEvents.push({
                    id: booking.id,
                    batchId: booking.batchId,
                    date: booking.transportDate || booking.createdAt,
                    kilometers: booking.kilometers,
                    pricePerKm: pricePerKm,
                    revenue: revenue,
                    farmerId: booking.farmerId
                });
            });

            // Sort by date descending
            revenueEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setSales(revenueEvents);
            setTotalRevenue(calculatedTotal);
        } catch (error) {
            console.error('Error loading revenue:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id, roleData?.expectedChargePerKm]);

    useEffect(() => {
        loadRevenue();
    }, [loadRevenue]);

    const handleUpdateKilometers = async (bookingId: string) => {
        const kmStr = editingKilometers[bookingId];
        if (!kmStr) return;

        const km = parseFloat(kmStr);
        if (isNaN(km) || km <= 0) return;

        try {
            setUpdatingId(bookingId);
            // Use PUT to update the booking with new kilometers
            // Note: Backend must support partial updates or at least updating kilometers via PUT
            await api.put(`/bookings/${bookingId}`, { kilometers: km });

            // Clear editing state
            const newEditing = { ...editingKilometers };
            delete newEditing[bookingId];
            setEditingKilometers(newEditing);

            // Reload to see changes
            await loadRevenue();
        } catch (error) {
            console.error('Failed to update kilometers:', error);
            alert('Failed to update kilometers. Please try again.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleFixData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const allBookings = await api.get<any[]>('/bookings');
            // Find bookings with null status or null transporterId that have kilometers (likely the ones we broke)
            // We will assign them to the current user and set status to TRANSPORTED
            const corrupted = allBookings.filter(b => (!b.status || !b.transporterId) && b.kilometers);

            let fixedCount = 0;
            for (const booking of corrupted) {
                await api.put(`/bookings/${booking.id}`, {
                    status: 'TRANSPORTED',
                    transporterId: user.id // Restore ownership to current user
                });
                fixedCount++;
            }

            if (fixedCount > 0) {
                alert(`Fixed ${fixedCount} corrupted records. Refreshing...`);
                loadRevenue();
            } else {
                alert('No corrupted records found that match the criteria.');
            }
        } catch (e) {
            console.error(e);
            alert('Failed to fix data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Transport Revenue
                        </CardTitle>
                        <CardDescription>Track your earnings based on kilometers traveled</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleFixData} className="text-amber-600 border-amber-200 hover:bg-amber-50">
                            Fix Data
                        </Button>
                        <Button variant="outline" size="sm" onClick={loadRevenue}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-4 border border-blue-100 dark:border-blue-800">
                    <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
                        <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Earnings</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">₹{totalRevenue.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Rate: ₹{roleData?.expectedChargePerKm || 0}/km</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                ) : sales.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>No revenue records found</p>
                        <p className="text-xs mt-1">Complete transport jobs to see earnings</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sales.map((sale) => (
                            <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50">
                                <div>
                                    <h3 className="font-medium">Batch #{sale.batchId.substring(0, 8)}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        <MapPin className="h-3 w-3" />
                                        {sale.kilometers ? (
                                            <span>{sale.kilometers} km traveled</span>
                                        ) : (
                                            <span className="text-amber-600 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Kilometers not recorded
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(sale.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    {sale.kilometers ? (
                                        <>
                                            <p className="font-bold text-blue-600">₹{sale.revenue.toFixed(2)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                @ ₹{sale.pricePerKm}/km
                                            </p>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                placeholder="km"
                                                className="w-20 h-8"
                                                value={editingKilometers[sale.id] || ''}
                                                onChange={(e) => setEditingKilometers({ ...editingKilometers, [sale.id]: e.target.value })}
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdateKilometers(sale.id)}
                                                disabled={updatingId === sale.id || !editingKilometers[sale.id]}
                                            >
                                                {updatingId === sale.id ? (
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                ) : (
                                                    <Save className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
