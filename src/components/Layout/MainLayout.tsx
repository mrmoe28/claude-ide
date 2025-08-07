'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from './Header'
import { Sidebar } from '@/components/FileExplorer/Sidebar'
import { ChatInterface } from '@/components/Chat/ChatInterface'
import { RepositorySelector } from '@/components/Repository/RepositorySelector'

export function MainLayout() {
  const { data: session } = useSession()
  const [currentRepo, setCurrentRepo] = useState<{ owner: string; name: string } | undefined>()
  const [currentFile, setCurrentFile] = useState<{ path: string; content: string } | undefined>()

  const handleRepositorySelect = (repo: { owner: string; name: string }) => {
    setCurrentRepo(repo)
    setCurrentFile(undefined) // Clear current file when switching repos
  }

  const handleFileSelect = (path: string, content: string) => {
    setCurrentFile({ path, content })
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            Welcome to Claude Code IDE
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
            Please sign in with GitHub to get started
          </p>
          <a
            href="/auth/signin"
            className="inline-flex items-center px-4 py-2 
                     bg-light-accent-primary dark:bg-dark-accent-primary
                     hover:bg-light-accent-focus dark:hover:bg-dark-accent-focus
                     text-white rounded-md transition-colors duration-200"
          >
            Sign in with GitHub
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-light-bg-primary dark:bg-dark-bg-primary">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Repository Selection and File Explorer */}
        <div className="w-80 flex flex-col border-r border-light-border-primary dark:border-dark-border-primary">
          {/* Repository Selector */}
          <div className="p-4 border-b border-light-border-primary dark:border-dark-border-primary">
            <RepositorySelector
              onSelectRepository={handleRepositorySelect}
              currentRepo={currentRepo}
            />
          </div>

          {/* File Explorer */}
          <div className="flex-1 overflow-hidden">
            <Sidebar
              currentRepo={currentRepo}
              onFileSelect={handleFileSelect}
              selectedFile={currentFile?.path}
            />
          </div>
        </div>

        {/* Main Content - Chat Interface */}
        <div className="flex-1">
          <ChatInterface
            currentFile={currentFile}
            repositoryContext={currentRepo}
          />
        </div>
      </div>
    </div>
  )
}