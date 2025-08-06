'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileTreeItem } from './FileTreeItem'
import { FileTreeNode, GitHubContent } from '@/types/github'
import { useGitHub } from '@/hooks/useGitHub'
import { Loader2 } from 'lucide-react'

interface FileTreeProps {
  owner: string
  repo: string
  onFileSelect: (path: string, content: string) => void
  selectedFile?: string
}

export function FileTree({ owner, repo, onFileSelect, selectedFile }: FileTreeProps) {
  const [treeData, setTreeData] = useState<FileTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const { getRepositoryContents, getFileContent } = useGitHub()

  const buildFileTree = (contents: GitHubContent[]): FileTreeNode[] => {
    return contents
      .sort((a, b) => {
        // Directories first, then files
        if (a.type !== b.type) {
          return a.type === 'dir' ? -1 : 1
        }
        return a.name.localeCompare(b.name)
      })
      .map(item => ({
        name: item.name,
        path: item.path,
        type: item.type === 'dir' ? 'dir' : 'file' as const,
        children: item.type === 'dir' ? [] : undefined,
        expanded: false
      }))
  }

  const loadRepositoryContents = useCallback(async (path: string = '') => {
    const contents = await getRepositoryContents(owner, repo, path)
    if (contents && Array.isArray(contents)) {
      return buildFileTree(contents)
    }
    return []
  }, [owner, repo, getRepositoryContents])

  const updateNodeChildren = (nodes: FileTreeNode[], targetPath: string, children: FileTreeNode[]): FileTreeNode[] => {
    return nodes.map(node => {
      if (node.path === targetPath) {
        return { ...node, children, expanded: true }
      }
      if (node.children) {
        return { ...node, children: updateNodeChildren(node.children, targetPath, children) }
      }
      return node
    })
  }

  const toggleNodeExpansion = (nodes: FileTreeNode[], targetPath: string): FileTreeNode[] => {
    return nodes.map(node => {
      if (node.path === targetPath) {
        return { ...node, expanded: !node.expanded }
      }
      if (node.children) {
        return { ...node, children: toggleNodeExpansion(node.children, targetPath) }
      }
      return node
    })
  }

  const handleToggleExpand = async (path: string) => {
    const node = findNode(treeData, path)
    
    if (node && node.type === 'dir') {
      if (!node.expanded && (!node.children || node.children.length === 0)) {
        // Load children for the first time
        const children = await loadRepositoryContents(path)
        setTreeData(prev => updateNodeChildren(prev, path, children))
      } else {
        // Just toggle expansion
        setTreeData(prev => toggleNodeExpansion(prev, path))
      }
    }
  }

  const findNode = (nodes: FileTreeNode[], targetPath: string): FileTreeNode | null => {
    for (const node of nodes) {
      if (node.path === targetPath) return node
      if (node.children) {
        const found = findNode(node.children, targetPath)
        if (found) return found
      }
    }
    return null
  }

  const handleFileSelect = async (path: string) => {
    const fileContent = await getFileContent(owner, repo, path)
    if (fileContent) {
      onFileSelect(path, fileContent.content)
    }
  }

  useEffect(() => {
    const initializeTree = async () => {
      setLoading(true)
      const rootContents = await loadRepositoryContents()
      setTreeData(rootContents)
      setLoading(false)
    }

    initializeTree()
  }, [owner, repo, loadRepositoryContents])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="animate-spin text-light-text-secondary dark:text-dark-text-secondary" size={20} />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {treeData.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          level={0}
          onFileSelect={handleFileSelect}
          onToggleExpand={handleToggleExpand}
          selectedFile={selectedFile}
        />
      ))}
    </div>
  )
}