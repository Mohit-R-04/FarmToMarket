import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, User, Package, Truck, Store, DollarSign, ExternalLink } from 'lucide-react';
import { QRCodeDisplay } from '@/components/product/QRCodeDisplay';
import { getProducts } from '@/services/api';
import type { Product } from '@/types/product';

export function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load product from backend API
    const loadProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        const products = await getProducts();
        const found = products.find((p: Product) => p.id === productId);
        if (found) {
          setProduct(found);
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="dark:bg-gray-900/50 dark:border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Package className="h-5 w-5" />
              {product.productName}
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Product ID: {product.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Production Location */}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium dark:text-gray-200">Production Location</p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">{product.productionLocation}</p>
              </div>
            </div>

            {/* Farmer Profile Link */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium dark:text-gray-200">Farmer</p>
                <Link
                  to={`/farmer/${product.farmerId}`}
                  className="text-sm text-primary hover:underline flex items-center gap-1 dark:text-primary/80"
                >
                  {product.farmerName}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Price Information */}
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium dark:text-gray-200">Pricing</p>
                {product.sellerPrice ? (
                  <div className="space-y-1">
                    <p className="text-sm dark:text-gray-300">
                      <span className="font-medium">Selling Price:</span> ₹{product.sellerPrice}
                      {product.unit && ` per ${product.unit}`}
                      {product.sellerName && ` (Sold by ${product.sellerName})`}
                    </p>
                    {product.farmerPrice && (
                      <p className="text-xs text-muted-foreground dark:text-gray-500">
                        Farmer charge to seller: ₹{product.farmerPrice}
                      </p>
                    )}
                  </div>
                ) : product.farmerPrice ? (
                  <p className="text-sm dark:text-gray-300">
                    <span className="font-medium">Farmer Charge:</span> ₹{product.farmerPrice}
                    {product.sellerName && ` (Assigned to ${product.sellerName})`}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground dark:text-gray-500">Not out for sale</p>
                )}
              </div>
            </div>

            {/* Journey History */}
            <div>
              <h3 className="font-semibold mb-3 dark:text-gray-200">Product Journey & Timeline</h3>
              <div className="space-y-4">
                {product.journey.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic dark:text-gray-500">No journey history yet.</p>
                ) : (
                  product.journey.map((step) => (
                    <div key={step.id} className="relative pl-6 border-l-2 border-primary/20 dark:border-primary/10 last:border-l-0 pb-6 last:pb-0">
                      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${step.status === 'COMPLETED' ? 'bg-primary' :
                        step.status === 'ACCEPTED' ? 'bg-blue-500' :
                          step.status === 'REJECTED' ? 'bg-red-500' :
                            'bg-yellow-500'
                        }`}></div>

                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            {step.type === 'TRANSPORT' && <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                            {step.type === 'SELLER' && <Store className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
                            {step.type === 'LOCATION' && <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />}
                            <span className="font-medium text-sm dark:text-gray-200">
                              {step.type === 'TRANSPORT' ? 'Transportation Request' :
                                step.type === 'SELLER' ? 'Seller Assignment' : 'Location Update'}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground dark:text-gray-400">
                            {new Date(step.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <div className="text-sm space-y-1">
                          {step.type === 'TRANSPORT' && (
                            <>
                              <p className="dark:text-gray-300">
                                <span className="text-muted-foreground dark:text-gray-500">Transporter:</span> {step.transporterName || 'Pending Assignment'}
                              </p>
                              {step.status === 'PENDING' && (
                                <p className="text-yellow-600 dark:text-yellow-400 text-xs">Waiting for transporter acceptance...</p>
                              )}
                            </>
                          )}

                          {step.type === 'SELLER' && (
                            <>
                              <p className="dark:text-gray-300">
                                <span className="text-muted-foreground dark:text-gray-500">Seller:</span> {step.sellerName || 'Pending Assignment'}
                              </p>
                              {step.status === 'PENDING' && (
                                <p className="text-yellow-600 dark:text-yellow-400 text-xs">Waiting for seller acceptance...</p>
                              )}
                            </>
                          )}

                          {step.location && (
                            <p className="text-muted-foreground text-xs dark:text-gray-500">{step.location}</p>
                          )}

                          <div className="mt-2 flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${step.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              step.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                step.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              }`}>
                              {step.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Display */}
        <QRCodeDisplay qrValue={product.qrCode} productName={product.productName} />
      </div>
    </div>
  );
}

