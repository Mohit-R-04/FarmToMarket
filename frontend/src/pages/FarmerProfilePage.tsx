import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin, FileText, ExternalLink, Package } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-950 dark:via-black dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 dark:border-emerald-900 dark:border-t-emerald-400 mx-auto"></div>
          <p className="mt-6 text-gray-700 dark:text-gray-300 font-medium">Loading farmer profile...</p>
        </div>
      </div>
    );
  }

  if (!farmerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-950 dark:via-black dark:to-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Farmer Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The farmer profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-950 dark:via-black dark:to-gray-900 relative overflow-hidden py-12 px-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(5,150,105,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(5,150,105,0.12),transparent_50%)] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Profile Header Card */}
        <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-emerald-200/50 dark:border-emerald-700/30 shadow-2xl shadow-emerald-500/10 dark:shadow-emerald-500/5 mb-8 hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/10 transition-all duration-300">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 dark:from-emerald-500 dark:to-green-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <User className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              Farmer Profile
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              Public profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Farmer Name */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200/30 dark:border-emerald-700/20 hover:border-emerald-300/50 dark:hover:border-emerald-600/30 transition-all duration-200">
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                <User className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{farmerData.name || 'N/A'}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200/30 dark:border-emerald-700/20 hover:border-emerald-300/50 dark:hover:border-emerald-600/30 transition-all duration-200">
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                <MapPin className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Farm Location</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{farmerData.location || 'N/A'}</p>
              </div>
            </div>

            {/* Authorized Document */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200/30 dark:border-emerald-700/20 hover:border-emerald-300/50 dark:hover:border-emerald-600/30 transition-all duration-200">
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                <FileText className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Authorized Document</p>
                {farmerData.authorizedDocument ? (
                  <a
                    href={farmerData.authorizedDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-2 group transition-colors"
                  >
                    View Document
                    <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                ) : (
                  <p className="text-lg font-semibold text-gray-400 dark:text-gray-500">N/A</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Batches Card */}
        <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-emerald-200/50 dark:border-emerald-700/30 shadow-2xl shadow-emerald-500/10 dark:shadow-emerald-500/5 hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/10 transition-all duration-300">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 dark:from-green-500 dark:to-emerald-700 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Package className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Assigned Batches
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              Products and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignedBatches.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No batches found for this farmer.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedBatches.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-xl bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200/30 dark:border-emerald-700/20 hover:border-emerald-300/50 dark:hover:border-emerald-600/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{b.productName}</h4>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <span className="font-medium">Qty:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{b.quantity} {b.unit || ''}</span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="font-medium">From:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{b.productionLocation}</span>
                          </p>
                          {b.sellerName && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <span className="font-medium">Assigned Seller:</span>
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400">{b.sellerName}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${b.status === 'CREATED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                            b.status === 'BOOKED_TRANSPORT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                              b.status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' :
                                b.status === 'AT_SELLER' || b.status === 'ASSIGNED_TO_SELLER' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' :
                                  b.status === 'SOLD' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                          {b.status?.replace(/_/g, ' ') || 'UNKNOWN'}
                        </span>
                      </div>
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
