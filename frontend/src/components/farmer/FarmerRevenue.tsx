import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, RefreshCw, DollarSign } from 'lucide-react';
import { getProducts, getSellerRequests } from '@/services/api';
import type { Product } from '@/types/product';

export function FarmerRevenue() {
    const { user } = useAuth();
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const loadRevenue = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const [allProducts, allSellerRequests] = await Promise.all([
                getProducts(),
                getSellerRequests()
            ]);

            // Map product ID to selling price from accepted seller requests
            // This is needed if the product itself doesn't have the sellerPrice stored (legacy data)
            const priceMap = new Map<string, number>();
            allSellerRequests.forEach((req: any) => {
                if (req.farmerId === user.id && req.status === 'ACCEPTED' && req.sellingPrice) {
                    priceMap.set(req.productId, req.sellingPrice);
                }
            });

            const salesEvents: any[] = [];
            let calculatedTotal = 0;

            allProducts.forEach((product: Product) => {
                // Filter for products owned by this farmer
                if (product.farmerId === user.id && product.journey) {
                    // Determine the selling price per unit
                    // 1. Product's stored sellerPrice
                    // 2. Price from the original SellerRequest
                    // 3. Fallback to 0
                    const sellingPricePerUnit = product.sellerPrice || priceMap.get(product.id) || 0;

                    product.journey.forEach((step) => {
                        if (step.type === 'SELLER' && (step.status === 'SOLD' || step.status === 'PARTIALLY_SOLD')) {
                            // Extract sold quantity
                            let soldQty = step.quantity;
                            if (!soldQty && step.description) {
                                const match = step.description.match(/Partially sold: (\d+(\.\d+)?)/);
                                if (match) {
                                    soldQty = parseFloat(match[1]);
                                } else if (step.status === 'SOLD') {
                                    soldQty = product.quantity;
                                }
                            }

                            soldQty = soldQty || 0;

                            // Calculate Farmer Revenue: Selling Price * Sold Quantity
                            const revenue = sellingPricePerUnit * soldQty;
                            calculatedTotal += revenue;

                            salesEvents.push({
                                id: step.id,
                                productId: product.id,
                                productName: product.productName,
                                date: step.timestamp,
                                quantity: soldQty,
                                unit: product.unit,
                                pricePerUnit: sellingPricePerUnit,
                                revenue: revenue,
                                sellerName: step.sellerName || product.sellerName || 'Unknown Seller'
                            });
                        }
                    });
                }
            });

            // Sort by date descending
            salesEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setSales(salesEvents);
            setTotalRevenue(calculatedTotal);
        } catch (error) {
            console.error('Error loading revenue:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadRevenue();
    }, [loadRevenue]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Revenue & Sales
                        </CardTitle>
                        <CardDescription>Track your earnings from sold products</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadRevenue}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-4 border border-green-100 dark:border-green-800">
                    <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full">
                        <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Earnings</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">₹{totalRevenue.toFixed(2)}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                ) : sales.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>No sales recorded yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sales.map((sale) => (
                            <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50">
                                <div>
                                    <h3 className="font-medium capitalize">{sale.productName}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Sold by {sale.sellerName} on {new Date(sale.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {sale.quantity} {sale.unit} × ₹{sale.pricePerUnit}/unit
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">₹{sale.revenue.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
