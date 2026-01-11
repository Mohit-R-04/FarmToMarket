import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, MapPin, Trash2, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/product';
import { deleteProduct } from '@/services/api';

interface BatchListProps {
  batches?: Product[];
}

export function BatchList({ batches: propBatches }: BatchListProps = {}) {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Use props for batches
  useEffect(() => {
    if (propBatches !== undefined) {
      setBatches(propBatches);
      setLoading(false);
    }
  }, [propBatches]);

  // Separate active and sold batches
  const activeBatches = batches.filter(b => b.status !== 'SOLD' && b.status !== 'PARTIALLY_SOLD');
  const soldBatches = batches.filter(b => b.status === 'SOLD' || b.status === 'PARTIALLY_SOLD');

  const handleDeleteBatch = async (batchId: string) => {
    if (!user?.id) return;

    try {
      await deleteProduct(batchId);

      // Dispatch event to notify parent to refresh
      window.dispatchEvent(new CustomEvent('batchDeleted', { detail: { batchId } }));

      setSuccessMessage('Batch deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 2500);
    } catch (error) {
      console.error('Failed to delete batch:', error);
      setSuccessMessage('Failed to delete batch');
      setTimeout(() => setSuccessMessage(''), 2500);
    }
  };

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const openDeleteConfirm = (batchId: string) => {
    setConfirmTargetId(batchId);
    setConfirmOpen(true);
  };

  // Helper to get sold date from journey
  const getSoldDate = (batch: Product) => {
    const soldStep = batch.journey?.find(step => step.status === 'SOLD' || step.status === 'PARTIALLY_SOLD');
    if (soldStep?.timestamp) {
      return new Date(soldStep.timestamp).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    return 'N/A';
  };

  const renderBatch = (batch: Product, isSold: boolean = false) => (
    <div key={batch.id} className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold">{batch.productName}</h3>
          <p className="text-sm text-muted-foreground">
            Quantity: {batch.quantity} {batch.unit || 'units'}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {batch.productionLocation}
          </p>
          {isSold && (
            <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3" />
              Sold on: {getSoldDate(batch)}
            </p>
          )}
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 rounded text-xs font-medium ${batch.status === 'CREATED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
            batch.status === 'BOOKED_TRANSPORT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
              batch.status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                batch.status === 'AT_SELLER' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' :
                  batch.status === 'SOLD' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    batch.status === 'PARTIALLY_SOLD' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
            }`}>
            {batch.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link to={`/product/${batch.id}`} target="_blank">
          <Button
            variant="outline"
            size="sm"
          >
            View Product
          </Button>
        </Link>
        {!isSold && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDeleteConfirm(batch.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {batch.sellerPrice ? (
        <p className="text-sm">
          <span className="font-medium">Selling Price:</span> ₹{batch.sellerPrice}
          {batch.sellerName && ` (Sold by ${batch.sellerName})`}
        </p>
      ) : batch.farmerPrice ? (
        <p className="text-sm">
          <span className="font-medium">Farmer Charge:</span> ₹{batch.farmerPrice}
          {batch.sellerName && ` (Assigned to ${batch.sellerName})`}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Not out for sale</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Batches</CardTitle>
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
          <Package className="h-5 w-5" />
          My Batches
        </CardTitle>
        <CardDescription>Manage your active and sold batches</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Active ({activeBatches.length})
            </TabsTrigger>
            <TabsTrigger value="sold" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Sold ({soldBatches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeBatches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No active batches
              </p>
            ) : (
              activeBatches.map((batch) => renderBatch(batch, false))
            )}
          </TabsContent>

          <TabsContent value="sold" className="space-y-4">
            {soldBatches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No sold batches yet
              </p>
            ) : (
              soldBatches.map((batch) => renderBatch(batch, true))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      {successMessage && (
        <div className="p-3 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200 rounded-b-md text-sm">
          {successMessage}
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete batch"
        description="Are you sure you want to permanently delete this batch and related requests/bookings? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (confirmTargetId) handleDeleteBatch(confirmTargetId);
          setConfirmOpen(false);
          setConfirmTargetId(null);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmTargetId(null);
        }}
      />
    </Card>
  );
}
