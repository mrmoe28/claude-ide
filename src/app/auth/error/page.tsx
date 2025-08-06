'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'You do not have permission to sign in.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      default:
        return 'An unexpected error occurred during authentication.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg-primary dark:bg-dark-bg-primary">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full 
                          bg-red-100 dark:bg-red-900/20 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Authentication Error
          </h2>
          
          <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
            {getErrorMessage(error)}
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="w-full flex items-center justify-center px-4 py-3 
                     bg-light-accent-primary dark:bg-dark-accent-primary 
                     hover:bg-light-accent-focus dark:hover:bg-dark-accent-focus
                     text-white rounded-md transition-colors duration-200
                     border border-light-border-primary dark:border-dark-border-primary"
          >
            Try Again
          </Link>
          
          <Link
            href="/"
            className="w-full flex items-center justify-center px-4 py-3 
                     bg-light-bg-secondary dark:bg-dark-bg-secondary 
                     hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary
                     text-light-text-primary dark:text-dark-text-primary rounded-md 
                     transition-colors duration-200
                     border border-light-border-primary dark:border-dark-border-primary"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="text-light-text-secondary dark:text-dark-text-secondary">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}