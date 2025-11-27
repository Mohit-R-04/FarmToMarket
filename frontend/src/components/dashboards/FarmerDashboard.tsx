import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Sprout, DollarSign } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { BatchCreator } from '@/components/farmer/BatchCreator';
import { BatchList } from '@/components/farmer/BatchList';
import { TransporterList, type TransporterListRef } from '@/components/farmer/TransporterList';
import { SellerList, type SellerListRef } from '@/components/farmer/SellerList';
import { BookingManager, type BookingManagerRef } from '@/components/farmer/BookingManager';
import { FarmerRevenue } from '@/components/farmer/FarmerRevenue';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import type { FarmerData } from '@/types/auth';
import type { Product } from '@/types/product';
import { getProducts, createProduct, createBooking, createSellerRequest, createTransporterRequest, updateProduct } from '@/services/api';
import { AlertDialog as SimpleAlertDialog } from '@/components/ui/SimpleAlertDialog';

import NotificationBell from '../common/NotificationBell';

export function FarmerDashboard() {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const roleData = user?.roleData as FarmerData;
  const [batches, setBatches] = useState<Product[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({
    open: false,
    message: ''
  });
  const bookingManagerRef = useRef<BookingManagerRef>(null);
  const transporterListRef = useRef<TransporterListRef>(null);
  const sellerListRef = useRef<SellerListRef>(null);

  // Load batches on mount
  useEffect(() => {
    async function fetchProducts() {
      const products = await getProducts();
      setBatches(products);
    }
    fetchProducts();

    // Listen for batch deletion events
    const handleBatchDeleted = () => {
      fetchProducts();
    };
    window.addEventListener('batchDeleted', handleBatchDeleted);

    return () => {
      window.removeEventListener('batchDeleted', handleBatchDeleted);
    };
  }, [user?.id]);

  const handleLogout = () => {
    signOut();
  };

  const handleBatchCreated = async (product: Product) => {
    // 1. Create product (backend assigns ID)
    const createdProduct = await createProduct(product);

    // 2. Generate QR code with the real ID
    const qrCode = `${window.location.origin}/product/${createdProduct.id}`;

    // 3. Update product with QR code
    await updateProduct(createdProduct.id, { qrCode });

    // 4. Refresh list
    const products = await getProducts();
    setBatches(products);
  };

  const handleBookTransporter = async (transporterId: string, charge: number, selectedSellerId?: string, product?: Product, transportDate?: string) => {
    if (!product) {
      setErrorMessage('Please select a product/batch to transport');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (!transportDate) {
      setErrorMessage('Please select a transport date');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const response = await createTransporterRequest({
        productId: product.id,
        farmerId: user?.id || '',
        transporterId,
        farmerDemandedCharge: charge,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        transportDate,
      });

      if (response.error) {
        setErrorDialog({ open: true, message: response.error });
        return;
      }

      setSuccessMessage('Request sent to transporter!');
      setTimeout(() => setSuccessMessage(''), 3000);
      // Reload booking manager to show new request
      bookingManagerRef.current?.reload();
      // Reload transporter list to update validation state
      transporterListRef.current?.reload();
    } catch (error: any) {
      console.error('Failed to create transporter request:', error);
      const errorMessage = error.message || 'Failed to create request. Please try again.';
      setErrorDialog({ open: true, message: errorMessage });
    }
  };

  const handleRequestSeller = async (sellerId: string, charge: number, sellingPrice: number, productId: string) => {
    const sellerRequest = {
      productId,
      farmerId: user?.id || '',
      sellerId,
      farmerPrice: charge,
      sellingPrice: sellingPrice,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await createSellerRequest(sellerRequest);

      // Check if the response contains an error (duplicate request)
      if (response.error) {
        setErrorDialog({ open: true, message: response.error });
        return;
      }

      setSuccessMessage('Seller request sent! Seller will see this in their requests.');
      setTimeout(() => setSuccessMessage(''), 3000);
      // Reload booking manager to show new request
      bookingManagerRef.current?.reload();
      // Reload seller list to update validation state
      sellerListRef.current?.reload();
    } catch (error) {
      console.error('Failed to create seller request:', error);
      setErrorDialog({ open: true, message: 'Failed to create seller request. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-950 dark:via-black dark:to-gray-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(5,150,105,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(5,150,105,0.12),transparent_50%)]"></div>

      <header className="glass-green dark:bg-gray-950/80 border-b border-emerald-200/50 dark:border-emerald-700/30 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">🌾 Farmer Dashboard</h1>
              <p className="text-sm text-emerald-700/70 dark:text-emerald-300/70">Welcome back, {roleData?.name || user?.email || user?.phone}</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <ThemeToggle />
              <Button variant="outline" onClick={handleLogout} className="border-emerald-300/50 hover:bg-emerald-100/50 dark:border-emerald-700/50 dark:hover:bg-emerald-900/30">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Farmer Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5" />
                Farmer Information
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowProfileEditor(true)}>
                Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {errorMessage && (
              <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm mb-3">{errorMessage}</div>
            )}
            {successMessage && (
              <div className="p-3 bg-green-50 text-green-800 rounded-md text-sm mb-3">{successMessage}</div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{roleData?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{roleData?.location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Authorized Document</p>
              {roleData?.authorizedDocument ? (
                <a
                  href={roleData.authorizedDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-xs text-primary hover:underline break-all"
                >
                  {roleData.authorizedDocument}
                </a>
              ) : (
                <p className="font-medium text-xs">N/A</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Batch Creator */}
        <BatchCreator onBatchCreated={handleBatchCreated} />

        {/* Batch List */}
        <BatchList batches={batches} />

        {/* Available Sellers */}
        <SellerList ref={sellerListRef} batches={batches} onRequestSeller={handleRequestSeller} />

        {/* Available Transporters */}
        <TransporterList ref={transporterListRef} batches={batches} onBookTransporter={handleBookTransporter} />

        {/* Booking Manager */}
        <BookingManager ref={bookingManagerRef} products={batches} />

        {/* Revenue Section */}
        <Tabs defaultValue="revenue" className="w-full mt-8">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="revenue">
            <FarmerRevenue />
          </TabsContent>
        </Tabs>
      </main>

      {/* Profile Editor */}
      <ProfileEditor
        open={showProfileEditor}
        onClose={() => setShowProfileEditor(false)}
        onSuccess={() => {
          setSuccessMessage('Profile updated successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        }}
      />

      {/* Error Dialog */}
      <SimpleAlertDialog
        open={errorDialog.open}
        title="Error"
        description={errorDialog.message}
        onClose={() => setErrorDialog({ open: false, message: '' })}
      />
    </div>
  );
}
