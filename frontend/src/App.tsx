import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ClerkLogin } from '@/components/auth/ClerkLogin';
import { ClerkSignup } from '@/components/auth/ClerkSignup';
import { RoleOnboarding } from '@/components/auth/RoleOnboarding';
import { DashboardRouter } from '@/components/dashboards/DashboardRouter';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { ErrorBoundary } from '@/components/auth/ErrorBoundary';
import { ProductPage } from '@/pages/ProductPage';
import { FarmerProfilePage } from '@/pages/FarmerProfilePage';
import { NotificationsPage } from '@/pages/NotificationsPage';

import { NotificationProvider } from '@/context/NotificationContext';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <ClerkLogin />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicRoute>
                      <ClerkSignup />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <RoleOnboarding />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  }
                />
                <Route path="/product/:productId" element={<ProductPage />} />
                <Route path="/farmer/:farmerId" element={<FarmerProfilePage />} />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary >
  );
}

export default App;
