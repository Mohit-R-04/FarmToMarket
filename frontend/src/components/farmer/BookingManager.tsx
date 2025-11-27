import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CheckCircle, XCircle, Clock, Truck, Store, RefreshCw } from 'lucide-react';
import { getBookings, getSellerRequests, getTransporterRequests } from '@/services/api';
import type { BookingRequest, Product } from '@/types/product';

export interface BookingManagerRef {
  reload: () => Promise<void>;
}

interface BookingManagerProps {
  products: Product[];
}

export const BookingManager = forwardRef<BookingManagerRef, BookingManagerProps>(({ products }, ref) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [sellerRequests, setSellerRequests] = useState<any[]>([]);
  const [transporterRequests, setTransporterRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (user?.id) {
      try {
        setLoading(true);
        const [allBookings, allSellerRequests, allTransporterRequests] = await Promise.all([
          getBookings(),
          getSellerRequests(),
          getTransporterRequests()
        ]);

        // Filter for this farmer
        const farmerBookings = allBookings.filter((b: BookingRequest) => b.farmerId === user.id);
        const farmerSellerRequests = allSellerRequests.filter((r: any) => r.farmerId === user.id);
        const farmerTransporterRequests = allTransporterRequests.filter((r: any) => r.farmerId === user.id);

        setBookings(farmerBookings);
        setSellerRequests(farmerSellerRequests);
        setTransporterRequests(farmerTransporterRequests);
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Expose reload method to parent
  useImperativeHandle(ref, () => ({
    reload: loadData
  }));

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Combine and sort requests
  const getAllRequests = () => {
    // Filter out transporter requests that are ACCEPTED, as they will be shown as bookings
    const visibleTransporterRequests = transporterRequests.filter(r => r.status !== 'ACCEPTED');

    const combined = [
      ...bookings.map(b => ({ ...b, type: 'TRANSPORT' as const })),
      ...visibleTransporterRequests.map(r => ({ ...r, type: 'TRANSPORT_REQUEST' as const })),
      ...sellerRequests.map(r => ({ ...r, type: 'SELLER' as const }))
    ];
    // Sort by newest first (assuming createdAt exists)
    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const allRequests = getAllRequests();

  // Helper to check if a request is effectively completed (e.g. accepted seller request for transported product)
  const isRequestCompleted = (req: any) => {
    if (req.type === 'SELLER' && req.status === 'ACCEPTED') {
      const product = products.find(p => p.id === req.productId);
      // If product is transported, sold, or at seller, the seller request is historically complete
      if (product && ['AT_SELLER', 'SOLD', 'TRANSPORTED'].includes(product.status)) {
        return true;
      }

      // OR if there is an active transport booking/request for this product
      // This means the farmer has moved to the next stage (transportation)
      const hasTransport = [...bookings, ...transporterRequests].some((tr: any) =>
        (tr.batchId === req.productId || tr.productId === req.productId) &&
        ['PENDING', 'ACCEPTED', 'PICKED_UP', 'TRANSPORTED'].includes(tr.status)
      );

      if (hasTransport) {
        return true;
      }
    }
    return false;
  };

  const activeRequests = allRequests.filter(r =>
    !isRequestCompleted(r) &&
    (r.status === 'PENDING' || r.status === 'ACCEPTED' || r.status === 'PICKED_UP')
  );

  const historyRequests = allRequests.filter(r =>
    isRequestCompleted(r) ||
    (r.status === 'REJECTED' || r.status === 'TRANSPORTED' || r.status === 'CANCELLED' || r.status === 'COMPLETED')
  );

  const RequestCard = ({ request }: { request: any }) => {
    let displayStatus = request.status;
    let statusColorClass =
      request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
        request.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
          request.status === 'TRANSPORTED' ? 'bg-green-100 text-green-800' :
            request.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
              request.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'; // REJECTED, CANCELLED, etc.

    let Icon =
      request.status === 'PENDING' ? Clock :
        (request.status === 'ACCEPTED' || request.status === 'TRANSPORTED' || request.status === 'COMPLETED') ? CheckCircle :
          XCircle;

    // Custom status logic for Accepted Seller Requests
    if (request.type === 'SELLER' && request.status === 'ACCEPTED') {
      const relatedTransport = [...bookings, ...transporterRequests]
        .filter((tr: any) => (tr.batchId === request.productId || tr.productId === request.productId))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      if (!relatedTransport) {
        displayStatus = 'Ready for Transport';
        statusColorClass = 'bg-blue-100 text-blue-800';
        Icon = Truck;
      } else if (relatedTransport.status === 'REJECTED') {
        displayStatus = 'Transport Rejected';
        statusColorClass = 'bg-red-100 text-red-800';
        Icon = XCircle;
      } else if (relatedTransport.status === 'CANCELLED') {
        displayStatus = 'Transport Cancelled';
        statusColorClass = 'bg-red-100 text-red-800';
        Icon = XCircle;
      }
    }

    return (
      <div className="border rounded-lg p-4 mb-3 bg-white/80 dark:bg-emerald-900/40 backdrop-blur-sm border-emerald-100/50 dark:border-emerald-700/50 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${request.type === 'TRANSPORT' || request.type === 'TRANSPORT_REQUEST' ? 'bg-blue-100' : 'bg-orange-100'}`}>
              {request.type === 'TRANSPORT' || request.type === 'TRANSPORT_REQUEST' ? (
                <Truck className={`h-4 w-4 ${request.type === 'TRANSPORT' ? 'text-blue-600' : 'text-blue-600'}`} />
              ) : (
                <Store className="h-4 w-4 text-orange-600" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {request.type === 'TRANSPORT' ? 'Transport Booking' :
                  request.type === 'TRANSPORT_REQUEST' ? 'Transport Request' : 'Seller Request'}
              </p>
              <p className="text-sm text-muted-foreground">
                {(request.type === 'TRANSPORT' || request.type === 'TRANSPORT_REQUEST')
                  ? `Batch ID: ${request.batchId || request.productId}`
                  : `Product ID: ${request.productId}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${statusColorClass}`}>
            <Icon className="h-3 w-3" />
            {displayStatus}
          </span>
        </div>

        <div className="mt-2 pl-11 text-sm">
          <div className="flex gap-4">
            <div>
              <span className="text-muted-foreground">Offered Charge:</span>
              <span className="font-medium ml-1">₹{request.farmerDemandedCharge || request.farmerPrice}</span>
            </div>
            {request.type === 'SELLER' && (
              <>
                <div>
                  <span className="text-muted-foreground">Selling Price:</span>
                  <span className="font-medium ml-1">₹{request.sellingPrice}</span>
                </div>
                {request.status === 'ACCEPTED' && (
                  <div>
                    <span className="text-muted-foreground text-emerald-600 font-medium">Revenue:</span>
                    <span className="font-bold text-emerald-700 ml-1">₹{request.farmerPrice}</span>
                  </div>
                )}
              </>
            )}
          </div>
          {request.type === 'SELLER' && request.status === 'ACCEPTED' && (
            <div className="mt-2">
              {(() => {
                const relatedTransport = [...bookings, ...transporterRequests]
                  .filter((tr: any) => (tr.batchId === request.productId || tr.productId === request.productId))
                  .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

                if (!relatedTransport) {
                  return <p className="text-xs text-orange-600 font-medium">Action Required: Book Transport</p>;
                }
                if (relatedTransport.status === 'REJECTED') {
                  return <p className="text-xs text-red-600 font-medium">Transport Rejected - Please book again</p>;
                }
                if (relatedTransport.status === 'CANCELLED') {
                  return <p className="text-xs text-red-600 font-medium">Transport Cancelled - Please book again</p>;
                }
                return null;
              })()}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Booking & Request Manager</CardTitle>
            <CardDescription>Manage your transportation bookings and seller requests</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active">Active Requests ({activeRequests.length})</TabsTrigger>
            <TabsTrigger value="history">History ({historyRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : activeRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No active requests</p>
                <p className="text-xs mt-1">New bookings and requests will appear here</p>
              </div>
            ) : (
              activeRequests.map((req: any) => (
                <RequestCard key={req.id} request={req} />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : historyRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No request history</p>
              </div>
            ) : (
              historyRequests.map((req: any) => (
                <RequestCard key={req.id} request={req} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

BookingManager.displayName = 'BookingManager';

