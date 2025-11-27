import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import type { Transporter, Product } from '@/types/product';
import { getBookings, getUsersByRole } from '@/services/api';

export interface TransporterListRef {
  reload: () => Promise<void>;
}

interface TransporterListProps {
  batches: Product[];
  onBookTransporter: (
    transporterId: string,
    charge: number,
    selectedSellerId?: string,
    product?: Product,
    transportDate?: string
  ) => void;
}

export const TransporterList = forwardRef<TransporterListRef, TransporterListProps>(({ batches, onBookTransporter }, ref) => {
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);

  const loadTransporters = async () => {
    try {
      setLoading(true);
      console.log('Fetching transporters...');
      const users = await getUsersByRole('TRANSPORTER');
      console.log('Fetched transporters:', users);

      if (Array.isArray(users)) {
        const allTransporters: Transporter[] = users.map((u: any) => ({
          id: u.id,
          name: u.vehicleNumber || 'Unknown Transporter',
          vehicleType: u.vehicleType || 'Unknown',
          vehicleNumber: u.vehicleNumber || '',
          license: u.license || '',
          expectedCharge: u.expectedChargePerKm || 0,
          location: '',
          available: true,
        }));
        setTransporters(allTransporters);
      } else {
        console.error('Expected array of transporters but got:', users);
        setTransporters([]);
      }
    } catch (error) {
      console.error('Error loading transporters:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingBookings = async () => {
    try {
      const bookings = await getBookings();
      setExistingBookings(bookings.filter((b: any) => b.status === 'PENDING' || b.status === 'ACCEPTED'));
    } catch (error) {
      console.error('Error loading existing bookings:', error);
    }
  };

  useEffect(() => {
    loadTransporters();
    loadExistingBookings();
  }, []);

  // Expose reload method to parent
  useImperativeHandle(ref, () => ({
    reload: async () => {
      try {
        const bookings = await getBookings();
        setExistingBookings(bookings.filter((b: any) =>
          ['PENDING', 'ACCEPTED', 'PICKED_UP', 'TRANSPORTED'].includes(b.status)
        ));
      } catch (error) {
        console.error('Error reloading bookings:', error);
      }
    }
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Transporters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Available Transporters
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => { setLoading(true); loadTransporters(); }}>
            Refresh
          </Button>
        </div>
        <CardDescription>Select a transporter and set your demanded charge</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transporters.filter(t => t.available).length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No transporters available at the moment
            </p>
          ) : (
            <>
              {transporters
                .filter(t => t.available)
                .map((transporter) => (
                  <TransporterCard
                    key={transporter.id}
                    transporter={transporter}
                    onBook={onBookTransporter}
                    batches={batches}
                    existingBookings={existingBookings}
                  />
                ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

TransporterList.displayName = 'TransporterList';

function TransporterCard({
  transporter,
  onBook,
  batches,
  existingBookings,
}: {
  transporter: Transporter;
  onBook: (id: string, charge: number, selectedSellerId?: string, product?: Product, transportDate?: string) => void;
  batches: Product[];
  existingBookings: any[];
}) {
  const [charge, setCharge] = useState(
    transporter.expectedCharge > 0 ? transporter.expectedCharge.toString() : ''
  );
  const [showBooking, setShowBooking] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [transportDate, setTransportDate] = useState('');

  // Check if there's already a pending or accepted booking for this product
  // Only allow new bookings if all previous bookings are rejected
  // Check if there's already a pending, active, or completed booking for this product
  const hasActiveOrCompletedBooking = (prodId: string) => {
    return existingBookings.some(
      (booking: any) =>
        booking.batchId === prodId &&
        ['PENDING', 'ACCEPTED', 'PICKED_UP', 'TRANSPORTED'].includes(booking.status)
    );
  };

  const handleBook = () => {
    if (hasActiveOrCompletedBooking(selectedProductId)) return;

    const chargeValue = parseFloat(charge);
    const product = batches.find(b => b.id === selectedProductId);
    if (chargeValue > 0 && product && transportDate) {
      onBook(transporter.id, chargeValue, undefined, product, transportDate);
      setShowBooking(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{transporter.name}</h3>
          <p className="text-sm text-muted-foreground">
            {transporter.vehicleType} - {transporter.vehicleNumber}
          </p>
          <p className="text-sm text-muted-foreground">Location: {transporter.location}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-primary">
            {transporter.expectedCharge > 0
              ? `₹${transporter.expectedCharge} per km`
              : 'Not mentioned'}
          </p>
          <p className="text-xs text-muted-foreground">Expected Charge per km</p>
        </div>
      </div>

      {!showBooking ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowBooking(true)}
        >
          Book This Transporter
        </Button>
      ) : (
        <div className="space-y-2">
          {hasActiveOrCompletedBooking(selectedProductId) && (
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-800 dark:text-yellow-200">
              This batch already has an active or completed booking.
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block">Select Product/Batch to Transport</label>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">-- Select --</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>
                  {batch.productName} ({batch.quantity} {batch.unit || ''})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Select Transport Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-md"
              value={transportDate}
              onChange={e => setTransportDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              Your Demanded Charge (₹)
            </label>
            <input
              type="number"
              value={charge}
              onChange={(e) => setCharge(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter your charge"
              min="0"
            />
          </div>
          {selectedProductId && hasActiveOrCompletedBooking(selectedProductId) && (
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded text-sm">
              ⚠️ This batch already has an active or completed booking.
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowBooking(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleBook}
              disabled={!selectedProductId || !charge || !transportDate || hasActiveOrCompletedBooking(selectedProductId)}
            >
              Send Booking Request
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

