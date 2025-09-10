import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

function App() {
  return (
    <>      
      <header>
        <button></button>
        <SignedOut>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <div className="flex min-h-screen items-center justify-center">
      </div>
    </>

  )
}

export default App