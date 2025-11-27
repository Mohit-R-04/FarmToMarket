import { Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useAuth } from '@/contexts/AuthContext';

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded: clerkLoaded } = useClerkAuth();
  const { hasRole, loading } = useAuth();

  // Wait for Clerk to load before checking auth state
  if (!clerkLoaded) {
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
        {children}
      </SignedOut>
      <SignedIn>
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : hasRole ? (
          <Navigate to="/dashboard" replace />
        ) : (
          <Navigate to="/onboarding" replace />
        )}
      </SignedIn>
    </>
  );
}
