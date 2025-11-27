import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react'

// Import Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.error('Missing Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env file')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    ) : (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
          <p className="text-muted-foreground mb-4">
            Missing Clerk Publishable Key
          </p>
          <p className="text-sm text-muted-foreground">
            Please add VITE_CLERK_PUBLISHABLE_KEY to your .env file
          </p>
        </div>
      </div>
    )}
  </StrictMode>,
)
