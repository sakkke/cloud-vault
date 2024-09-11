'use client'

import { Button } from "@/components/ui/button"
import { Mail } from 'lucide-react'

export function LoginPage() {
  const handleGoogleLogin = () => {
    // TODO: Implement Google login logic
    console.log('Google login attempted')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-foreground">Welcome to Google Drive Clone</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in to your account
          </p>
        </div>

        <div className="mt-8">
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
            <Mail className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  )
}