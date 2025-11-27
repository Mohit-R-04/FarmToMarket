import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Truck, MapPin, Calendar, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import NotificationBell from '../common/NotificationBell';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import type { TransporterData } from '@/types/auth';
import { api } from '@/services/api';
import { useNotifications } from '@/context/NotificationContext';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CancellationDialog } from '../transporter/CancellationDialog';

import { BookingDetailsDialog } from '../transporter/BookingDetailsDialog';
import { TransporterRevenue } from '../dashboards/transporter/TransporterRevenue';
import { TransportCompletionDialog } from '../dashboards/transporter/TransportCompletionDialog';

interface Booking {
  id: string;
  batchId: string;
  farmerId: string;
  transporterId: string;
  farmerDemandedCharge: number;
  transporterCharge?: number;
  status: string;
  createdAt: string;
  selectedSellerId?: string;
  transportDate?: string;
  cancellationStatus?: string;
  cancellationReason?: string;
  product?: any; // Ideally typed
  kilometers?: number;
}

export function TransporterDashboard() {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const { fetchNotifications } = useNotifications();
  const roleData = user?.roleData as TransporterData;
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  // Dialog states
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchData = async () => {
    try {
      // Fetch Bookings (Accepted/In Progress/History)
      const allBookings = await api.get<Booking[]>('/bookings');
      const myBookings = allBookings.filter(b => b.transporterId === user?.id);
      setBookings(myBookings);

      // Fetch Requests (Pending)
      const allRequests = await api.get<any[]>('/transporter-requests');
      const myRequests = allRequests.filter((r: any) => r.transporterId === user?.id && r.status === 'PENDING');
      setRequests(myRequests);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const handleLogout = () => {
    signOut();
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.put(`/transporter-requests/${requestId}`, { status: 'ACCEPTED' });
      setSuccessMessage('Request accepted! Booking created.');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchData();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await api.put(`/transporter-requests/${requestId}`, { status: 'REJECTED' });
      setSuccessMessage('Request rejected.');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchData();
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('Failed to reject request');
    }
  };

  const handleRequestCancellation = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setCancellationDialogOpen(true);
  };

  const handleConfirmCancellation = async (reason: string) => {
    if (!selectedBookingId) return;

    try {
      await api.post(`/bookings/${selectedBookingId}/request-cancellation`, { reason });
      setSuccessMessage('Cancellation requested. Waiting for farmer approval.');
      fetchData();
      fetchNotifications();
    } catch (error) {
      alert('Failed to request cancellation');
    }
  };

  const handleMarkTransported = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmTransport = async (kilometers: number) => {
    if (!selectedBookingId) return;

    try {
      await api.post(`/bookings/${selectedBookingId}/transported`, { kilometers });
      setSuccessMessage('Transport completed successfully!');
      fetchData();
      fetchNotifications();
    } catch (error) {
      alert('Failed to mark as transported');
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    console.log('View details clicked for:', booking.id);
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
  };

  const inProgressBookings = bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'PICKED_UP');
  const historyBookings = bookings.filter(b => b.status === 'TRANSPORTED' || b.status === 'CANCELLED');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-950 dark:via-black dark:to-gray-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(5,150,105,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(5,150,105,0.12),transparent_50%)]"></div>

      <header className="glass-green dark:bg-gray-950/80 border-b border-emerald-200/50 dark:border-emerald-700/30 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">🚚 Transporter Dashboard</h1>
              <p className="text-sm text-emerald-700/70 dark:text-emerald-300/70">Welcome back, {user?.email || user?.phone}</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <ThemeToggle />
              <Button variant="outline" onClick={handleLogout} className="border-emerald-300/50 hover:bg-emerald-100/50 dark:border-emerald-700/50 dark:hover:bg-emerald-900/30">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowProfileEditor(true)}>
                Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {successMessage && (
              <div className="col-span-full p-3 bg-green-50 text-green-800 rounded-md text-sm mb-3">{successMessage}</div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Vehicle Type</p>
              <p className="font-medium">{roleData?.vehicleType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vehicle Number</p>
              <p className="font-medium">{roleData?.vehicleNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">License Number</p>
              <p className="font-medium">{roleData?.license || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Charge/Km</p>
              <p className="font-medium">
                {roleData?.expectedChargePerKm ? `₹${roleData.expectedChargePerKm}` : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Workflow */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
            <TabsTrigger value="inprogress">In Progress ({inProgressBookings.length})</TabsTrigger>
            <TabsTrigger value="history">History ({historyBookings.length})</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4 mt-4">
            {requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No pending requests.</div>
            ) : (
              requests.map(request => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">Request for Batch #{request.productId.substring(0, 8)}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>Date: {request.transportDate || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>From Farmer to Seller (ID: {request.sellerId?.substring(0, 8)})</span>
                        </div>
                        <div className="mt-2 font-medium text-emerald-700">
                          Offered Charge: ₹{request.farmerDemandedCharge}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          Reject
                        </Button>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="inprogress" className="space-y-4 mt-4">
            {inProgressBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No active transport jobs.</div>
            ) : (
              inProgressBookings.map(booking => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">Transporting Batch #{booking.batchId.substring(0, 8)}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>Date: {booking.transportDate || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>Destination: Seller (ID: {booking.selectedSellerId?.substring(0, 8)})</span>
                        </div>
                        {booking.cancellationStatus === 'PENDING' && (
                          <div className="mt-2 flex items-center gap-2 text-amber-600 bg-amber-50 px-2 py-1 rounded text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Cancellation Requested</span>
                          </div>
                        )}
                        {booking.cancellationStatus === 'REJECTED' && (
                          <div className="mt-2 flex items-center gap-2 text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                            <XCircle className="w-4 h-4" />
                            <span>Cancellation Rejected - Must Transport</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleMarkTransported(booking.id)}
                          disabled={booking.cancellationStatus === 'PENDING'}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Transported
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleRequestCancellation(booking.id)}
                          disabled={booking.cancellationStatus === 'PENDING' || booking.cancellationStatus === 'REJECTED'}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Request Cancellation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            {historyBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No history available.</div>
            ) : (
              historyBookings.map(booking => (
                <Card
                  key={booking.id}
                  className="cursor-pointer hover:border-emerald-500/50 transition-colors"
                  onClick={() => handleViewDetails(booking)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">Batch #{booking.batchId.substring(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">Date: {booking.transportDate}</p>
                        {booking.kilometers && (
                          <p className="text-xs text-muted-foreground mt-1">{booking.kilometers} km traveled</p>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${booking.status === 'TRANSPORTED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {booking.status}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="revenue" className="mt-4">
            <TransporterRevenue />
          </TabsContent>
        </Tabs>
      </main>

      {/* Profile Editor */}
      <ProfileEditor
        open={showProfileEditor}
        onClose={() => setShowProfileEditor(false)}
        onSuccess={() => {
          setSuccessMessage('Profile updated successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        }}
      />

      {/* Dialogs */}
      <CancellationDialog
        open={cancellationDialogOpen}
        onClose={() => setCancellationDialogOpen(false)}
        onConfirm={handleConfirmCancellation}
      />

      <TransportCompletionDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmTransport}
      />

      <BookingDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        booking={selectedBooking}
      />
    </div>
  );
}

