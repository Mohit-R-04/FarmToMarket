import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, RefreshCw, TrendingUp } from 'lucide-react';
import { getProducts, getSellerRequests } from '@/services/api';
import type { Product } from '@/types/product';

export function SalesHistory() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const loadHistory = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const [allProducts, allSellerRequests] = await Promise.all([
                getProducts(),
                getSellerRequests()
            ]);

            // Map product ID to farmer price (seller revenue) from accepted seller requests
            const priceMap = new Map<string, number>();
            allSellerRequests.forEach((req: any) => {
                if (req.sellerId === user.id && req.status === 'ACCEPTED' && req.farmerPrice) {
                    priceMap.set(req.productId, req.farmerPrice);
                }
            });

            // Flatten journey steps to find all sales transactions
            const salesEvents: any[] = [];

            allProducts.forEach((product: Product) => {
                if (product.sellerId === user.id && product.journey) {
                    // Determine the best available price for this product (BATCH TOTAL REVENUE for Seller)
                    // 1. Product's stored farmerPrice (this is what farmer pays seller)
                    // 2. Price from the original SellerRequest (recovered from DB)
                    // 3. Fallback to 0
                    const batchTotalRevenue = product.farmerPrice || priceMap.get(product.id) || 0;

                    // Calculate revenue per unit (Batch Revenue / Total Batch Quantity)
                    const revenuePerUnit = product.quantity > 0 ? (batchTotalRevenue / product.quantity) : 0;

                    product.journey.forEach((step) => {
                        if (step.type === 'SELLER' && (step.status === 'SOLD' || step.status === 'PARTIALLY_SOLD')) {
                            // Try to extract quantity from step (new format) or description (legacy format)
                            let soldQty = step.quantity;
                            if (!soldQty && step.description) {
                                const match = step.description.match(/Partially sold: (\d+(\.\d+)?)/);
                                if (match) {
                                    soldQty = parseFloat(match[1]);
                                } else if (step.status === 'SOLD') {
                                    soldQty = product.quantity;
                                }
                            }

                            // If soldQty is still not found, default to 0 to avoid NaN
                            soldQty = soldQty || 0;

                            // Calculate revenue for this specific sale: Revenue Per Unit * Sold Quantity
                            const saleRevenue = revenuePerUnit * soldQty;

                            salesEvents.push({
                                id: step.id,
                                productId: product.id,
                                productName: product.productName,
                                date: step.timestamp,
                                quantity: soldQty,
                                unit: product.unit,
                                price: saleRevenue, // Store the calculated REVENUE for this transaction
                                status: step.status,
                                originalProduct: product
                            });
                        }
                    });
                }
            });

            // Sort by date descending
            salesEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setProducts(salesEvents as any); // We are using a derived type now, but for simplicity casting to any for state
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    if (loading) {
        return <div className="text-center py-8">Loading history...</div>;
    }

    // Calculate total revenue from the derived events
    const totalRevenue = (products as any[]).reduce((sum, event) => sum + (event.price || 0), 0);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Sales History
                        </CardTitle>
                        <CardDescription>Track your sold products and transactions</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadHistory}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center gap-4 border border-emerald-100 dark:border-emerald-800">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-800 rounded-full">
                        <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Revenue (Seller Charge)</p>
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">₹{totalRevenue.toFixed(2)}</p>
                    </div>
                </div>

                {(products as any[]).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>No sales history yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {(products as any[]).map((event) => (
                            <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50">
                                <div>
                                    <h3 className="font-medium capitalize flex items-center gap-2">
                                        {event.productName}
                                        {event.status === 'PARTIALLY_SOLD' && (
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Partial</span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Sold on {new Date(event.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-emerald-600">₹{event.price?.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Sold: {event.quantity} {event.unit}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
