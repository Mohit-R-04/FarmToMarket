import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus } from 'lucide-react';
import type { Product } from '@/types/product';

interface BatchCreatorProps {
  onBatchCreated: (product: Product) => void;
}

export function BatchCreator({ onBatchCreated }: BatchCreatorProps) {
  const { user } = useAuth();
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!productName.trim()) {
      setError('Product name is required');
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      setError('Valid quantity is required');
      return;
    }

    setLoading(true);
    try {
      // Create product/batch
      const product: Product = {
        id: '', // Backend will assign ID
        farmerId: user?.id || '',
        farmerName: (user?.roleData as any)?.name || 'Unknown',
        productName: productName.trim(),
        quantity: parseInt(quantity),
        unit: unit,
        productionLocation: (user?.roleData as any)?.location || '',
        qrCode: '', // Will be generated after ID is assigned
        createdAt: new Date().toISOString(),
        status: 'CREATED',
        journey: [{
          id: `step-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'LOCATION',
          location: (user?.roleData as any)?.location || '',
          status: 'COMPLETED',
        }],
      };

      // Note: We don't save to localStorage anymore.
      // The parent component (FarmerDashboard) will handle the API call via onBatchCreated.

      onBatchCreated(product);
      setProductName('');
      setQuantity('');
      setUnit('kg');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Batch
        </CardTitle>
        <CardDescription>Create a new product batch with unique QR code</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <Input
            label="Product Name"
            type="text"
            placeholder="e.g., Organic Tomatoes, Wheat, etc."
            value={productName}
            onChange={(e) => {
              setProductName(e.target.value);
              setError('');
            }}
            error={error && !productName.trim() ? error : undefined}
            disabled={loading}
          />

          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Quantity</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setError('');
                  }}
                  error={error && (!quantity || parseInt(quantity) <= 0) ? error : undefined}
                  disabled={loading}
                  min="1"
                  className="flex-1"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                  disabled={loading}
                >
                  <option value="kg">kg</option>
                  <option value="litre">litre</option>
                  <option value="units">units</option>
                  <option value="pieces">pieces</option>
                  <option value="bags">bags</option>
                  <option value="boxes">boxes</option>
                </select>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Batch
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

