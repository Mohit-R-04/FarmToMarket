import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, CheckCircle, XCircle } from 'lucide-react';
import { getBookings, getProduct, updateProduct, updateBooking } from '@/services/api';
import type { BookingRequest } from '@/types/product';

export function TransporterRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadRequests = async () => {
    try {
      // Fetch all bookings from backend
      const allBookings = await getBookings();

      // Filter pending bookings for this transporter
      const transporterRequests = allBookings.filter((booking: BookingRequest) =>
        booking.transporterId === user?.id && booking.status === 'PENDING'
      );

      setRequests(transporterRequests);
    } catch (error) {
      console.error('Error loading transporter requests:', error);
      setRequests([]);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setRequests([]);
      return;
    }

    loadRequests();
  }, [user?.id]);

  const handleAccept = async (bookingId: string, productId: string) => {
    try {
      // Call backend API to update booking to ACCEPTED
      // Call backend API to update booking to ACCEPTED
      await updateBooking(bookingId, { status: 'ACCEPTED' });

      // Also update the product to mark transporter as assigned
      // Also update the product to mark transporter as assigned and update journey
      const product = await getProduct(productId);
      const newJourneyStep = {
        id: `journey-${Date.now()}`,
        type: 'TRANSPORT',
        status: 'ACCEPTED',
        transporterId: user?.id,
        transporterName: (user?.roleData as any)?.name || 'Unknown Transporter',
        timestamp: new Date().toISOString(),
        location: (user?.roleData as any)?.location || 'In Transit',
      };

      await updateProduct(productId, {
        transporterId: user?.id,
        transporterName: (user?.roleData as any)?.name || 'Unknown Transporter',
        status: 'IN_TRANSIT',
        journey: [...(product.journey || []), newJourneyStep]
      });

      // Remove from local state and reload
      setRequests(prev => prev.filter(r => r.id !== bookingId));
      // Reload to get fresh data
      await loadRequests();
      setSuccessMessage('Booking accepted successfully!');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (error) {
      console.error('Error accepting booking:', error);
      setErrorMessage('Error accepting booking');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      // Call backend API to update booking to REJECTED
      // Call backend API to update booking to REJECTED
      await updateBooking(bookingId, { status: 'REJECTED' });

      // Remove from local state and reload
      setRequests(prev => prev.filter(r => r.id !== bookingId));
      // Reload to get fresh data
      await loadRequests();
      setSuccessMessage('Booking rejected.');
      setTimeout(() => setSuccessMessage(''), 2500);
    } catch (error) {
      console.error('Error rejecting booking:', error);
      setErrorMessage('Error rejecting booking');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Transportation Requests
        </CardTitle>
        <CardDescription>Accept or reject transportation requests from farmers</CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm mb-3">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-green-50 text-green-800 rounded-md text-sm mb-3">
            {successMessage}
          </div>
        )}

        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No transportation requests at the moment</p>
          ) : (
            requests.map((request) => (
              <BookingRequestCard
                key={request.id}
                request={request}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BookingRequestCard({
  request,
  onAccept,
  onReject,
}: {
  request: BookingRequest;
  onAccept: (bookingId: string, productId: string) => void;
  onReject: (bookingId: string) => void;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div>
        <p className="font-medium">Booking ID: {request.id}</p>
        <p className="text-sm text-muted-foreground">Batch/Product: {request.batchId}</p>
        {request.farmerDemandedCharge && (
          <p className="text-sm text-muted-foreground">Farmer Demanded Charge: ₹{request.farmerDemandedCharge}</p>
        )}
        {request.product && (
          <p className="text-sm text-muted-foreground">Product: {request.product.productName}</p>
        )}
        {request.transportDate && (
          <p className="text-sm text-muted-foreground">Transport Date: {new Date(request.transportDate).toLocaleDateString()}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => onReject(request.id)}>
          <XCircle className="h-4 w-4 mr-2" />
          Reject
        </Button>
        <Button className="flex-1" onClick={() => onAccept(request.id, request.batchId)}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Accept
        </Button>
      </div>
    </div>
  );
}
