import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { getProducts, updateProduct } from '@/services/api';
import type { Product } from '@/types/product';

export function SellerInventory() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Dialog State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [saleQuantity, setSaleQuantity] = useState<string>('');
    const [saleReason, setSaleReason] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [error, setError] = useState<string>('');

    const loadInventory = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const allProducts = await getProducts();
            // Filter products for this seller that are NOT fully sold
            const inventory = allProducts.filter((p: Product) =>
                p.sellerId === user.id && p.status !== 'SOLD'
            );
            setProducts(inventory);
        } catch (error) {
            console.error('Error loading inventory:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadInventory();
    }, [loadInventory]);

    const openSaleDialog = (product: Product) => {
        setSelectedProduct(product);
        setSaleQuantity(product.quantity.toString());
        setSaleReason('');
        setError('');
        setIsDialogOpen(true);
    };

    const handleSaleSubmit = async () => {
        if (!selectedProduct || !saleQuantity) return;

        const qty = parseFloat(saleQuantity);
        if (isNaN(qty) || qty <= 0) {
            setError('Please enter a valid quantity');
            return;
        }

        if (qty > selectedProduct.quantity) {
            setError(`Quantity cannot exceed available stock (${selectedProduct.quantity})`);
            return;
        }

        try {
            setProcessingId(selectedProduct.id);
            const isFullSale = qty === selectedProduct.quantity;
            const newStatus = isFullSale ? 'SOLD' : 'PARTIALLY_SOLD'; // Use PARTIALLY_SOLD for partial

            const newJourneyStep = {
                id: `journey-${Date.now()}`,
                type: 'SELLER' as const,
                status: isFullSale ? 'SOLD' as const : 'PARTIALLY_SOLD' as const,
                sellerId: user?.id,
                sellerName: (user?.roleData as any)?.shopName || 'Unknown Seller',
                timestamp: new Date().toISOString(),
                location: (user?.roleData as any)?.address || '',
                description: isFullSale
                    ? 'Product fully sold to consumer'
                    : `Partially sold: ${qty} ${selectedProduct.unit}. Reason: ${saleReason || 'Consumer purchase'}`,
                quantity: qty,
                price: (selectedProduct.sellerPrice || 0) // Using sellerPrice as revenue
            };

            const remainingQty = selectedProduct.quantity - qty;

            await updateProduct(selectedProduct.id, {
                status: newStatus,
                quantity: isFullSale ? selectedProduct.quantity : remainingQty,
                journey: [...(selectedProduct.journey || []), newJourneyStep]
            });

            setIsDialogOpen(false);
            await loadInventory();
        } catch (error) {
            console.error('Error processing sale:', error);
            setError('Failed to process sale. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading inventory...</div>;
    }

    const incomingProducts = products.filter(p =>
        ['ASSIGNED_TO_SELLER', 'BOOKED_TRANSPORT', 'IN_TRANSIT'].includes(p.status)
    );

    const inStockProducts = products.filter(p =>
        ['AT_SELLER', 'TRANSPORTED', 'PARTIALLY_SOLD'].includes(p.status)
    );

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                My Inventory
                            </CardTitle>
                            <CardDescription>Manage your stock and incoming shipments</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={loadInventory}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* In Stock Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            In Stock ({inStockProducts.length})
                        </h3>
                        {inStockProducts.length === 0 ? (
                            <p className="text-muted-foreground text-sm italic">No products currently in stock.</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {inStockProducts.map((product) => (
                                    <div key={product.id} className="border rounded-lg p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-lg capitalize">{product.productName}</h3>
                                                <p className="text-sm text-muted-foreground">Batch ID: {product.id.slice(0, 8)}...</p>
                                            </div>
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                In Stock
                                            </span>
                                        </div>

                                        <div className="space-y-2 my-4 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Quantity:</span>
                                                <span className="font-medium">{product.quantity} {product.unit}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Selling Price:</span>
                                                <span className="font-medium">₹{product.sellerPrice}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Farmer:</span>
                                                <span className="font-medium">{product.farmerName}</span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full"
                                            onClick={() => openSaleDialog(product)}
                                            disabled={!!processingId}
                                        >
                                            {processingId === product.id ? (
                                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <DollarSign className="h-4 w-4 mr-2" />
                                            )}
                                            Sell Product
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Incoming Section */}
                    {incomingProducts.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Incoming Shipments ({incomingProducts.length})
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {incomingProducts.map((product) => (
                                    <div key={product.id} className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50 opacity-90">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-lg capitalize">{product.productName}</h3>
                                                <p className="text-sm text-muted-foreground">Batch ID: {product.id.slice(0, 8)}...</p>
                                            </div>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                {product.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        <div className="space-y-2 my-4 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Quantity:</span>
                                                <span className="font-medium">{product.quantity} {product.unit}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Status:</span>
                                                <span className="font-medium capitalize">{product.status.toLowerCase().replace(/_/g, ' ')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Farmer:</span>
                                                <span className="font-medium">{product.farmerName}</span>
                                            </div>
                                        </div>

                                        <Button disabled variant="secondary" className="w-full">
                                            Awaiting Arrival
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sell Product: {selectedProduct?.productName}</DialogTitle>
                        <DialogDescription>
                            Enter the quantity to sell. You can sell partially or fully.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Quantity to Sell ({selectedProduct?.unit})</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={saleQuantity}
                                    onChange={(e) => setSaleQuantity(e.target.value)}
                                    max={selectedProduct?.quantity}
                                />
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    / {selectedProduct?.quantity} {selectedProduct?.unit}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Reason / Notes (Optional)</Label>
                            <Input
                                placeholder="e.g. Sold to local restaurant"
                                value={saleReason}
                                onChange={(e) => setSaleReason(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded">
                            {saleQuantity && parseFloat(saleQuantity) === selectedProduct?.quantity ? (
                                <span className="text-green-600 font-medium">This will mark the product as FULLY SOLD.</span>
                            ) : (
                                <span className="text-blue-600 font-medium">This will be a PARTIAL sale. Remaining stock: {selectedProduct ? (selectedProduct.quantity - (parseFloat(saleQuantity) || 0)) : 0} {selectedProduct?.unit}</span>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaleSubmit} disabled={!!processingId}>
                            {processingId ? 'Processing...' : 'Confirm Sale'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
