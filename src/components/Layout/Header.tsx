'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon, LogOut, User, Settings } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

export function Header() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="h-12 bg-light-bg-primary dark:bg-dark-bg-primary 
                     border-b border-light-border-primary dark:border-dark-border-primary
                     flex items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-light-accent-primary dark:bg-dark-accent-primary rounded-sm flex items-center justify-center">
          <span className="text-white text-sm font-bold">C</span>
        </div>
        <h1 className="font-semibold text-light-text-primary dark:text-dark-text-primary">
          Claude Code IDE
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary
                   text-light-text-secondary dark:text-dark-text-secondary
                   hover:text-light-text-primary dark:hover:text-dark-text-primary
                   transition-colors duration-150"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Menu */}
        {session?.user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-md 
                       hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary
                       text-light-text-primary dark:text-dark-text-primary
                       transition-colors duration-150"
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-light-accent-primary dark:bg-dark-accent-primary 
                              rounded-full flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
              )}
              <span className="text-sm font-medium hidden sm:block">
                {session.user.name || session.user.email}
              </span>
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <>
                <div className="absolute right-0 mt-1 w-48 z-50
                              bg-light-bg-primary dark:bg-dark-bg-primary
                              border border-light-border-primary dark:border-dark-border-primary
                              rounded-md shadow-lg py-1">
                  <div className="px-3 py-2 border-b border-light-border-primary dark:border-dark-border-primary">
                    <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      {session.user.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      // Add settings functionality here
                    }}
                    className="w-full px-3 py-2 text-left text-sm
                             text-light-text-primary dark:text-dark-text-primary
                             hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary
                             flex items-center gap-2"
                  >
                    <Settings size={16} />
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="w-full px-3 py-2 text-left text-sm
                             text-red-600 dark:text-red-400
                             hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary
                             flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>

                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
              </>
            )}
          </div>
        ) : (
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Not signed in
          </div>
        )}
      </div>
    </header>
  )
}