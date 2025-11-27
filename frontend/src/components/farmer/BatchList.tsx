import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, MapPin, Trash2 } from 'lucide-react';
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
        <CardDescription>Batches that need to be transported</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {batches.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No batches created yet
            </p>
          ) : (
            batches.map((batch) => (
              <div key={batch.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{batch.productName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {batch.quantity} {batch.unit || 'units'}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {batch.productionLocation}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px - 2 py - 1 rounded text - xs font - medium ${batch.status === 'CREATED' ? 'bg-blue-100 text-blue-800' :
                      batch.status === 'BOOKED_TRANSPORT' ? 'bg-yellow-100 text-yellow-800' :
                        batch.status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                      } `}>
                      {batch.status.replace('_', ' ')}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteConfirm(batch.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
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
            ))
          )}
        </div>
      </CardContent>
      {successMessage && (
        <div className="p-3 bg-green-50 text-green-800 rounded-b-md text-sm">
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


