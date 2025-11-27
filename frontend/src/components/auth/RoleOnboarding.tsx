import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { UserRole, FarmerData, SellerData, TransporterData } from '@/types/auth';

export function RoleOnboarding() {
  // All hooks must be at the top level
  const navigate = useNavigate();
  const { saveRole, loading: authLoading, hasRole } = useAuth();
  const { isLoaded: clerkLoaded } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [roleData, setRoleData] = useState<FarmerData | SellerData | TransporterData>({
    name: '',
    location: '',
    authorizedDocument: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Redirect if user already has a role
  useEffect(() => {
    if (clerkLoaded && !authLoading && hasRole) {
      console.log('User already has role - redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [clerkLoaded, authLoading, hasRole, navigate]);

  useEffect(() => {
    console.log('RoleOnboarding mounted, authLoading:', authLoading, 'clerkLoaded:', clerkLoaded);
  }, [authLoading, clerkLoaded]);

  // Timeout fallback - show form after 2 seconds even if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowForm(true);
      console.log('Timeout reached, showing form');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Show loading while Clerk is initializing
  if (!clerkLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 dark:from-green-900 dark:via-emerald-800 dark:to-teal-900"></div>
        <div className="relative text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading Clerk...</p>
        </div>
      </div>
    );
  }

  // If auth is still loading, show loading but allow timeout to show form
  if (authLoading && !showForm) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 dark:from-green-900 dark:via-emerald-800 dark:to-teal-900"></div>
        <div className="relative text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  const validateRoleData = () => {
    const newErrors: Record<string, string> = {};

    if (selectedRole === 'FARMER') {
      const data = roleData as FarmerData;
      if (!data.name?.trim()) newErrors.name = 'Name is required';
      if (!data.location?.trim()) newErrors.location = 'Location is required';
      if (!data.authorizedDocument?.trim()) {
        newErrors.authorizedDocument = 'Google Drive link is required';
      } else {
        // Validate URL format
        try {
          const url = new URL(data.authorizedDocument);
          if (!url.hostname.includes('drive.google.com') && !url.hostname.includes('docs.google.com')) {
            newErrors.authorizedDocument = 'Please provide a valid Google Drive link';
          }
        } catch {
          newErrors.authorizedDocument = 'Please provide a valid URL';
        }
      }
    } else if (selectedRole === 'SELLER') {
      const data = roleData as SellerData;
      if (!data.shopName?.trim()) newErrors.shopName = 'Shop name is required';
      if (!data.address?.trim()) newErrors.address = 'Address is required';
    } else if (selectedRole === 'TRANSPORTER') {
      const data = roleData as TransporterData;
      if (!data.vehicleType?.trim()) newErrors.vehicleType = 'Vehicle type is required';
      if (!data.vehicleNumber?.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
      if (!data.license?.trim()) newErrors.license = 'License is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrors({});

    // Initialize role-specific data
    if (role === 'FARMER') {
      setRoleData({ name: '', location: '', authorizedDocument: '' });
    } else if (role === 'SELLER') {
      setRoleData({ shopName: '', address: '' });
    } else if (role === 'TRANSPORTER') {
      setRoleData({ vehicleType: '', vehicleNumber: '', license: '', expectedChargePerKm: undefined });
    }

    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateRoleData() || !selectedRole) {
      return;
    }

    setLoading(true);
    try {
      await saveRole(selectedRole, roleData);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
        {/* Farm-themed green gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 dark:from-green-900 dark:via-emerald-800 dark:to-teal-900"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Glassmorphism container */}
        <div className="relative w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/20 dark:bg-black/20 rounded-2xl shadow-2xl border border-white/30 dark:border-white/10 p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Choose Your Role</h1>
              <p className="text-white/80">Select your role to complete your profile setup</p>
            </div>
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-auto p-6 flex flex-col items-start text-left whitespace-normal min-w-0 bg-white/90 hover:bg-white border-white/50"
                onClick={() => handleRoleSelect('FARMER')}
              >
                <span className="text-lg font-semibold mb-1 w-full">🌾 Farmer</span>
                <span className="text-sm text-muted-foreground break-words leading-relaxed w-full">
                  Sell your products (has complete control over the product which makes it farmer friendly)
                </span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-auto p-6 flex flex-col items-start text-left whitespace-normal min-w-0 bg-white/90 hover:bg-white border-white/50"
                onClick={() => handleRoleSelect('SELLER')}
              >
                <span className="text-lg font-semibold mb-1 w-full">🏪 Seller</span>
                <span className="text-sm text-muted-foreground break-words leading-relaxed w-full">
                  Gets charges for selling which the farmer gives
                </span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-auto p-6 flex flex-col items-start text-left whitespace-normal min-w-0 bg-white/90 hover:bg-white border-white/50"
                onClick={() => handleRoleSelect('TRANSPORTER')}
              >
                <span className="text-lg font-semibold mb-1 w-full">🚚 Transporter</span>
                <span className="text-sm text-muted-foreground break-words leading-relaxed w-full">
                  Transport goods between locations getting charges
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Farm-themed green gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 dark:from-green-900 dark:via-emerald-800 dark:to-teal-900"></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Glassmorphism container */}
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/20 dark:bg-black/20 rounded-2xl shadow-2xl border border-white/30 dark:border-white/10 p-8">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit -ml-2"
                onClick={() => setStep('role')}
                disabled={loading}
              >
                ← Back
              </Button>
              <CardTitle className="text-3xl font-bold text-center">
                {selectedRole === 'FARMER' && '🌾 Farmer Details'}
                {selectedRole === 'SELLER' && '🏪 Seller Details'}
                {selectedRole === 'TRANSPORTER' && '🚚 Transporter Details'}
              </CardTitle>
              <CardDescription className="text-center">
                Complete your profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="pt-4 space-y-4">
                  <h3 className="font-semibold text-sm">Role-Specific Information</h3>

                  {selectedRole === 'FARMER' && (
                    <>
                      <Input
                        label="Name"
                        type="text"
                        placeholder="Enter your name"
                        value={(roleData as FarmerData).name}
                        onChange={(e) => {
                          setRoleData({ ...roleData, name: e.target.value });
                          setErrors({ ...errors, name: '' });
                        }}
                        error={errors.name}
                        disabled={loading}
                      />
                      <Input
                        label="Location"
                        type="text"
                        placeholder="Enter farm location"
                        value={(roleData as FarmerData).location}
                        onChange={(e) => {
                          setRoleData({ ...roleData, location: e.target.value });
                          setErrors({ ...errors, location: '' });
                        }}
                        error={errors.location}
                        disabled={loading}
                      />
                      <Input
                        label="Authorized Document (Google Drive Link)"
                        type="url"
                        placeholder="https://drive.google.com/file/d/..."
                        value={(roleData as FarmerData).authorizedDocument}
                        onChange={(e) => {
                          setRoleData({ ...roleData, authorizedDocument: e.target.value });
                          setErrors({ ...errors, authorizedDocument: '' });
                        }}
                        error={errors.authorizedDocument}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Please provide a Google Drive link to the document that shows your rights to do cropping in the specified location
                      </p>
                    </>
                  )}

                  {selectedRole === 'SELLER' && (
                    <>
                      <Input
                        label="Shop Name"
                        type="text"
                        placeholder="Enter your shop name"
                        value={(roleData as SellerData).shopName}
                        onChange={(e) => {
                          setRoleData({ ...roleData, shopName: e.target.value });
                          setErrors({ ...errors, shopName: '' });
                        }}
                        error={errors.shopName}
                        disabled={loading}
                      />
                      <Input
                        label="Address"
                        type="text"
                        placeholder="Enter shop address"
                        value={(roleData as SellerData).address}
                        onChange={(e) => {
                          setRoleData({ ...roleData, address: e.target.value });
                          setErrors({ ...errors, address: '' });
                        }}
                        error={errors.address}
                        disabled={loading}
                      />
                    </>
                  )}

                  {selectedRole === 'TRANSPORTER' && (
                    <>
                      <Input
                        label="Vehicle Type"
                        type="text"
                        placeholder="e.g., Truck, Van, etc."
                        value={(roleData as TransporterData).vehicleType}
                        onChange={(e) => {
                          setRoleData({ ...roleData, vehicleType: e.target.value });
                          setErrors({ ...errors, vehicleType: '' });
                        }}
                        error={errors.vehicleType}
                        disabled={loading}
                      />
                      <Input
                        label="Vehicle Number"
                        type="text"
                        placeholder="Enter vehicle registration number"
                        value={(roleData as TransporterData).vehicleNumber}
                        onChange={(e) => {
                          setRoleData({ ...roleData, vehicleNumber: e.target.value });
                          setErrors({ ...errors, vehicleNumber: '' });
                        }}
                        error={errors.vehicleNumber}
                        disabled={loading}
                      />
                      <Input
                        label="License Number"
                        type="text"
                        placeholder="Enter driving license number"
                        value={(roleData as TransporterData).license}
                        onChange={(e) => {
                          setRoleData({ ...roleData, license: e.target.value });
                          setErrors({ ...errors, license: '' });
                        }}
                        error={errors.license}
                        disabled={loading}
                      />
                      <Input
                        label="Expected Charge per Kilometer (₹)"
                        type="number"
                        placeholder="Enter your expected charge per km (optional)"
                        value={(roleData as TransporterData).expectedChargePerKm?.toString() || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRoleData({
                            ...roleData,
                            expectedChargePerKm: value ? parseFloat(value) : undefined
                          });
                          setErrors({ ...errors, expectedChargePerKm: '' });
                        }}
                        error={errors.expectedChargePerKm}
                        disabled={loading}
                        min="0"
                      />
                      <p className="text-xs text-muted-foreground">
                        Optional: Specify your expected charge per kilometer for transportation
                      </p>
                    </>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

