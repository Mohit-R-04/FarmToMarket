import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, DollarSign } from 'lucide-react';
import { getSellerRequests, getProduct, updateProduct, updateSellerRequest } from '@/services/api';

export function SellerRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Load seller requests from backend
  const loadRequests = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all seller requests from backend
      const allRequests = await getSellerRequests();

      // Filter requests for THIS seller that are PENDING
      const sellerRequests = allRequests.filter((req: any) =>
        req.sellerId === user.id && req.status === 'PENDING'
      );

      setRequests(sellerRequests);
    } catch (error) {
      console.error('Error loading seller requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Depend on user.id to re-create if user changes

  useEffect(() => {
    loadRequests();
  }, [loadRequests]); // Depend on loadRequests itself

  const handleAcceptRequest = async (requestId: string, productId: string) => {
    try {
      // Update request status on backend
      // Update request status on backend
      const response = await updateSellerRequest(requestId, { status: 'ACCEPTED' });

      if (response) {
        // Also update the product to mark seller as assigned and update journey
        const product = await getProduct(productId);
        const newJourneyStep = {
          id: `journey-${Date.now()}`,
          type: 'SELLER',
          status: 'ACCEPTED',
          sellerId: user?.id,
          sellerName: (user?.roleData as any)?.shopName || 'Unknown Seller',
          timestamp: new Date().toISOString(),
          location: (user?.roleData as any)?.address || '',
        };

        // Find the request object to get the sellingPrice
        const request = requests.find(r => r.id === requestId);

        await updateProduct(productId, {
          sellerId: user?.id,
          sellerName: (user?.roleData as any)?.shopName || 'Unknown Seller',
          sellerLocation: (user?.roleData as any)?.address || '',
          status: 'ASSIGNED_TO_SELLER',
          sellerPrice: request?.sellingPrice, // Save the selling price from the request
          journey: [...(product.journey || []), newJourneyStep]
        });

        // Remove from local state and reload
        setRequests(requests.filter(r => r.id !== requestId));
        // Reload to get fresh data
        await loadRequests();
        setSuccessMessage('Request accepted! Product assigned to you.');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Farmer Requests</CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Farmer Requests
        </CardTitle>
        <CardDescription>Products that need sellers - set your price</CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <div className="p-3 bg-green-50 text-green-800 rounded-md text-sm mb-3">
            {successMessage}
          </div>
        )}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No requests available at the moment
            </p>
          ) : (
            requests.map((request) => (
              <SellerRequestCard
                key={request.id}
                request={request}
                onAccept={handleAcceptRequest}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SellerRequestCard({
  request,
  onAccept,
}: {
  request: any;
  onAccept: (requestId: string, productId: string) => void;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div>
        <p className="font-semibold">Product ID: {request.productId}</p>
        <p className="text-sm text-muted-foreground">
          Farmer Charge: ₹{request.farmerPrice || 'N/A'}
        </p>
        <p className="text-sm text-muted-foreground">
          Requested Selling Price: ₹{request.sellingPrice || 'N/A'}
        </p>
        <p className="text-sm text-muted-foreground">
          Status: {request.status}
        </p>
      </div>
      <Button
        onClick={() => onAccept(request.id, request.productId)}
        className="w-full"
      >
        <DollarSign className="h-4 w-4 mr-2" />
        Accept Request
      </Button>
    </div>
  );
}

