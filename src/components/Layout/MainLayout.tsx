'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Header } from './Header'
import { Sidebar } from '@/components/FileExplorer/Sidebar'
import { ChatInterface } from '@/components/Chat/ChatInterface'

export function MainLayout() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [currentFile, setCurrentFile] = useState<{ path: string; content: string } | undefined>()

  const handleFileSelect = (path: string, content: string) => {
    setCurrentFile({ path, content })
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-light-accent-primary dark:border-dark-accent-primary mx-auto mb-4"></div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            Welcome to Claude Code IDE
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
            Please sign in to get started
          </p>
          <a
            href="/auth/signin"
            className="inline-flex items-center px-4 py-2 
                     bg-light-accent-primary dark:bg-dark-accent-primary
                     hover:bg-light-accent-focus dark:hover:bg-dark-accent-focus
                     text-white rounded-md transition-colors duration-200"
          >
            Sign in
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-light-bg-primary dark:bg-dark-bg-primary">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - File Explorer */}
        <div className="w-80 flex flex-col border-r border-light-border-primary dark:border-dark-border-primary">
          <div className="p-4 border-b border-light-border-primary dark:border-dark-border-primary">
            <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
              File Explorer
            </h3>
            <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
              Browse and edit files
            </p>
          </div>

          <div className="flex-1 overflow-hidden">
            <Sidebar
              currentRepo={undefined}
              onFileSelect={handleFileSelect}
              selectedFile={currentFile?.path}
            />
          </div>
        </div>

        {/* Main Content - Chat Interface */}
        <div className="flex-1">
          <ChatInterface
            currentFile={currentFile}
            repositoryContext={undefined}
          />
        </div>
      </div>
    </div>
  )
}