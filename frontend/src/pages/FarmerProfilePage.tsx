import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin, FileText, ExternalLink } from 'lucide-react';
import type { FarmerData } from '@/types/auth';
import { roleService } from '@/services/roleService';
import { getProducts } from '@/services/api';

export function FarmerProfilePage() {
  const { farmerId } = useParams<{ farmerId: string }>();
  const [farmerData, setFarmerData] = useState<FarmerData | null>(null);

  const [loading, setLoading] = useState(true);
  const [assignedBatches, setAssignedBatches] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!farmerId) return;

      try {
        setLoading(true);
        // Fetch farmer role data
        const { roleData } = await roleService.getRoleData(farmerId);
        if (roleData) {
          setFarmerData(roleData as FarmerData);
        }

        // Fetch assigned batches (products)
        try {
          const products = await getProducts();
          const farmerProducts = products.filter((p: any) => p.farmerId === farmerId);
          setAssignedBatches(farmerProducts);
        } catch (err) {
          console.error('Error loading products:', err);
        }

      } catch (error) {
        console.error('Error loading farmer profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [farmerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading farmer profile...</p>
        </div>
      </div>
    );
  }

  if (!farmerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Farmer Not Found</h1>
          <p className="text-muted-foreground">The farmer profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="dark:bg-gray-900/50 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Farmer Profile
            </CardTitle>
            <CardDescription>Public profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Farmer Name */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{farmerData.name || 'N/A'}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Farm Location</p>
                <p className="text-sm text-muted-foreground">{farmerData.location || 'N/A'}</p>
              </div>
            </div>

            {/* Authorized Document */}
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Authorized Document</p>
                {farmerData.authorizedDocument ? (
                  <a
                    href={farmerData.authorizedDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View Document
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">N/A</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="mt-6 dark:bg-gray-900/50 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Assigned Batches</CardTitle>
            <CardDescription>Products and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedBatches.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No batches found for this farmer.</p>
            ) : (
              <div className="space-y-3">
                {assignedBatches.map((b) => (
                  <div key={b.id} className="border rounded-lg p-3 flex justify-between items-start dark:border-gray-800">
                    <div>
                      <h4 className="font-medium">{b.productName}</h4>
                      <p className="text-sm text-muted-foreground">Qty: {b.quantity} {b.unit || ''}</p>
                      <p className="text-sm text-muted-foreground">From: {b.productionLocation}</p>
                      {b.sellerName && <p className="text-sm">Assigned Seller: {b.sellerName}</p>}
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${b.status === 'CREATED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        b.status === 'BOOKED_TRANSPORT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          b.status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                            b.status === 'AT_SELLER' || b.status === 'ASSIGNED_TO_SELLER' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                              b.status === 'SOLD' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>{b.status?.replace(/_/g, ' ') || 'UNKNOWN'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


