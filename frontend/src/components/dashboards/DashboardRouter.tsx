import { useAuth } from '@/contexts/AuthContext';
import { FarmerDashboard } from './FarmerDashboard';
import { SellerDashboard } from './SellerDashboard';
import { TransporterDashboard } from './TransporterDashboard';
import { Navigate } from 'react-router-dom';

export function DashboardRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'FARMER':
      return <FarmerDashboard />;
    case 'SELLER':
      return <SellerDashboard />;
    case 'TRANSPORTER':
      return <TransporterDashboard />;
    default:
      return <Navigate to="/onboarding" replace />;
  }
}
