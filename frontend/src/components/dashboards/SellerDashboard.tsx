import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Store, Package, History, Inbox } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SellerRequests } from '@/components/seller/SellerRequests';
import { SellerInventory } from '@/components/seller/SellerInventory';
import { SalesHistory } from '@/components/seller/SalesHistory';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import NotificationBell from '@/components/common/NotificationBell';
import type { SellerData } from '@/types/auth';

export function SellerDashboard() {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const roleData = user?.roleData as SellerData;
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogout = () => {
    signOut();
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">🏪 Seller Dashboard</h1>
              <p className="text-sm text-emerald-700/70 dark:text-emerald-300/70">Welcome back, {roleData?.shopName || user?.email || user?.phone}</p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-1">
        {/* Shop Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Shop Information
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowProfileEditor(true)}>
                Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {successMessage && (
              <div className="p-3 bg-green-50 text-green-800 rounded-md text-sm mb-3">{successMessage}</div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Shop Name</p>
                <p className="font-medium">{roleData?.shopName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{roleData?.address || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Sales History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <SellerRequests />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <SellerInventory />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <SalesHistory />
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
    </div>
  );
}
