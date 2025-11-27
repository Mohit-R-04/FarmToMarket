import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SignedIn, SignedOut, useAuth as useClerkAuth } from '@clerk/clerk-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isLoaded: clerkLoaded } = useClerkAuth();
  const { hasRole, loading, user } = useAuth();
  const isOnboardingPage = location.pathname === '/onboarding';

  console.log('[ProtectedRoute] Render:', {
    pathname: location.pathname,
    clerkLoaded,
    loading,
    hasRole,
    userRole: user?.role,
    isOnboardingPage
  });

  // Wait for Clerk to load
  if (!clerkLoaded) {
    console.log('[ProtectedRoute] Waiting for Clerk to load...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>
      <SignedIn>
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : !hasRole && !isOnboardingPage ? (
          <>
            {console.log('[ProtectedRoute] Redirecting to /onboarding - hasRole:', hasRole, 'user:', user)}
            <Navigate to="/onboarding" replace />
          </>
        ) : (
          <>
            {console.log('[ProtectedRoute] Rendering children')}
            {children}
          </>
        )}
      </SignedIn>
    </>
  );
}
