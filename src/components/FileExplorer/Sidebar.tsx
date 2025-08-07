'use client'

import { useState } from 'react'
import { FileTree } from './FileTree'
import { Search, FolderOpen } from 'lucide-react'

interface SidebarProps {
  currentRepo?: {
    owner: string
    name: string
  }
  onFileSelect: (path: string, content: string) => void
  selectedFile?: string
}

export function Sidebar({ currentRepo, onFileSelect, selectedFile }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  if (!currentRepo) {
    return (
      <div className="w-64 bg-light-sidebar dark:bg-dark-sidebar border-r border-light-border-primary dark:border-dark-border-primary h-full">
        <div className="p-4 text-center">
          <FolderOpen className="mx-auto mb-2 text-light-text-muted dark:text-dark-text-muted" size={32} />
          <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
            Select a repository to explore files
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-light-sidebar dark:bg-dark-sidebar border-r border-light-border-primary dark:border-dark-border-primary h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-light-border-primary dark:border-dark-border-primary">
        <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate">
          {currentRepo.name}
        </h3>
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
          {currentRepo.owner}
        </p>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-light-border-primary dark:border-dark-border-primary">
        <div className="relative">
          <Search 
            size={14} 
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-light-text-muted dark:text-dark-text-muted" 
          />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 text-xs 
                     bg-light-input dark:bg-dark-input
                     border border-light-border-primary dark:border-dark-border-primary
                     rounded text-light-text-primary dark:text-dark-text-primary
                     placeholder-light-text-muted dark:placeholder-dark-text-muted
                     focus:outline-none focus:border-light-accent-primary dark:focus:border-dark-accent-primary"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-hidden">
        <FileTree
          owner={currentRepo.owner}
          repo={currentRepo.name}
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
        />
      </div>
    </div>
  )
}