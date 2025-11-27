import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, DollarSign } from 'lucide-react';
import type { Seller, Product } from '@/types/product';
import { getUsersByRole, getSellerRequests } from '@/services/api';

export interface SellerListRef {
  reload: () => Promise<void>;
}

interface SellerListProps {
  batches: Product[];
  onRequestSeller: (sellerId: string, charge: number, sellingPrice: number, productId: string) => void;
  productId?: string;
}

export const SellerList = forwardRef<SellerListRef, SellerListProps>(({ batches, onRequestSeller, productId }, ref) => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [existingRequests, setExistingRequests] = useState<any[]>([]);

  useEffect(() => {
    // Load real sellers from backend
    const loadSellers = async () => {
      try {
        const users = await getUsersByRole('SELLER');
        const allSellers: Seller[] = users.map((u: any) => ({
          id: u.id,
          shopName: u.shopName || 'Unknown Shop',
          address: u.address || '',
          location: u.address || '',
          available: true,
        }));
        setSellers(allSellers);
      } catch (error) {
        console.error('Error loading sellers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSellers();

    // Load existing seller requests
    const loadExistingRequests = async () => {
      try {
        const requests = await getSellerRequests();
        setExistingRequests(requests.filter((r: any) => r.status === 'PENDING'));
      } catch (error) {
        console.error('Error loading existing requests:', error);
      }
    };

    loadExistingRequests();
  }, []);

  // Expose reload method to parent
  useImperativeHandle(ref, () => ({
    reload: async () => {
      try {
        const requests = await getSellerRequests();
        setExistingRequests(requests.filter((r: any) => r.status === 'PENDING'));
      } catch (error) {
        console.error('Error reloading seller requests:', error);
      }
    }
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Sellers</CardTitle>
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
          Available Sellers
        </CardTitle>
        <CardDescription>Request sellers to sell your products - set your charge</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sellers.filter(s => s.available).length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No sellers available at the moment
            </p>
          ) : (
            sellers
              .filter(s => s.available)
              .map((seller) => (
                <SellerCard
                  key={seller.id}
                  seller={seller}
                  batches={batches}
                  onRequest={onRequestSeller}
                  productId={productId}
                  existingRequests={existingRequests}
                />
              ))
          )}
        </div>
      </CardContent>
    </Card>
  );
});

SellerList.displayName = 'SellerList';

function SellerCard({
  seller,
  batches,
  onRequest,
  productId,
  existingRequests,
}: {
  seller: Seller;
  batches: Product[];
  onRequest: (sellerId: string, charge: number, sellingPrice: number, productId: string) => void;
  productId?: string;
  existingRequests: any[];
}) {
  const [charge, setCharge] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [showRequest, setShowRequest] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(productId || '');

  // Check if there's already a pending request for this product-seller combination
  const hasPendingRequest = (prodId: string) => {
    return existingRequests.some(
      (req: any) => req.productId === prodId && req.sellerId === seller.id
    );
  };

  // Get available products from batches prop, filtered for ones without sellers and no pending requests
  const availableProducts = batches
    .filter((p: Product) => !p.sellerId && p.status === 'CREATED' && !hasPendingRequest(p.id))
    .map((p: Product) => ({ id: p.id, productName: p.productName, unit: p.unit || 'units' }));

  // Initialize selected product when products become available
  useEffect(() => {
    if (!productId && availableProducts.length > 0 && !selectedProductId) {
      setSelectedProductId(availableProducts[0].id);
    }
  }, [availableProducts, productId, selectedProductId]);

  const handleRequest = () => {
    const chargeValue = parseFloat(charge);
    const sellingPriceValue = parseFloat(sellingPrice);
    if (chargeValue > 0 && sellingPriceValue > 0 && selectedProductId) {
      onRequest(seller.id, chargeValue, sellingPriceValue, selectedProductId);
      setShowRequest(false);
      setCharge('');
      setSellingPrice('');
      setSelectedProductId(productId || '');
    }
  };

  const selectedProduct = availableProducts.find(p => p.id === selectedProductId);
  const unit = selectedProduct?.unit || 'unit';

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div>
        <h3 className="font-semibold">{seller.shopName}</h3>
        <p className="text-sm text-muted-foreground">
          Address: {seller.address}
        </p>
        <p className="text-sm text-muted-foreground">Location: {seller.location}</p>
      </div>

      {!showRequest ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowRequest(true)}
          disabled={availableProducts.length === 0 && !productId}
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Request Seller
        </Button>
      ) : (
        <div className="space-y-2">
          {!productId && availableProducts.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1 block">
                Select Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName}
                  </option>
                ))}
              </select>
            </div>
          )}
          {hasPendingRequest(selectedProductId) && (
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-800 dark:text-yellow-200">
              A pending request already exists for this product
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Your Charge for Seller (₹)
            </label>
            <input
              type="number"
              value={charge}
              onChange={(e) => setCharge(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter charge you'll pay seller"
              min="0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Amount you will pay to the seller
            </p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              Selling Price for Product (₹ per {unit})
            </label>
            <input
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder={`Enter price per ${unit} (e.g., ₹50 per ${unit})`}
              min="0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Price at which the product should be sold to customers (per {unit})
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowRequest(false);
                setCharge('');
                setSellingPrice('');
                setSelectedProductId(productId || '');
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleRequest}
              disabled={!selectedProductId || !charge || parseFloat(charge) <= 0 || !sellingPrice || parseFloat(sellingPrice) <= 0 || hasPendingRequest(selectedProductId)}
            >
              Send Request
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

