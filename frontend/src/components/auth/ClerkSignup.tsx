import { SignUp } from '@clerk/clerk-react';

export function ClerkSignup() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Farm-themed green gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 dark:from-green-900 dark:via-emerald-800 dark:to-teal-900"></div>

      {/* Animated background elements for farm theme */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Glassmorphism container */}
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/20 dark:bg-black/20 rounded-2xl shadow-2xl border border-white/30 dark:border-white/10 p-8">
          <div className="flex justify-center">
            <SignUp
              routing="path"
              path="/signup"
              signInUrl="/login"
              fallbackRedirectUrl="/onboarding"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none",
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
