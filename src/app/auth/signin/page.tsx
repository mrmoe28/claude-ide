'use client'

import { signIn, getProviders } from 'next-auth/react'
import type { ClientSafeProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Github } from 'lucide-react'

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null)

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    setAuthProviders()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg-primary dark:bg-dark-bg-primary">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Welcome to Claude Code IDE
          </h2>
          <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
            Sign in with GitHub to access your repositories
          </p>
        </div>
        
        <div className="space-y-4">
          {providers && Object.values(providers).map((provider) => (
            <button
              key={provider.name}
              onClick={() => signIn(provider.id, { callbackUrl: '/' })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 
                       bg-light-accent-primary dark:bg-dark-accent-primary 
                       hover:bg-light-accent-focus dark:hover:bg-dark-accent-focus
                       text-white rounded-md transition-colors duration-200
                       border border-light-border-primary dark:border-dark-border-primary"
            >
              <Github size={20} />
              Sign in with {provider.name}
            </button>
          ))}
        </div>
        
        <div className="text-center text-sm text-light-text-muted dark:text-dark-text-muted">
          <p>By signing in, you agree to access your GitHub repositories</p>
        </div>
      </div>
    </div>
  )
}