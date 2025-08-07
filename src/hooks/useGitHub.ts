'use client'

import { useSession } from 'next-auth/react'
import { GitHubAPI } from '@/lib/github'
import { useState, useCallback, useMemo } from 'react'

export function useGitHub() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const githubApi = useMemo(() => {
    return session?.accessToken ? new GitHubAPI(session.accessToken) : null
  }, [session?.accessToken])

  const executeAction = useCallback(async <T>(action: () => Promise<T>): Promise<T | null> => {
    if (!githubApi) {
      setError('Not authenticated with GitHub')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const result = await action()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [githubApi])

  const getRepositories = useCallback(async () => {
    return executeAction(() => githubApi!.getRepositories())
  }, [executeAction, githubApi])

  const getRepositoryContents = useCallback(async (owner: string, repo: string, path?: string) => {
    return executeAction(() => githubApi!.getRepositoryContents(owner, repo, path))
  }, [executeAction, githubApi])

  const getFileContent = useCallback(async (owner: string, repo: string, path: string) => {
    return executeAction(() => githubApi!.getFileContent(owner, repo, path))
  }, [executeAction, githubApi])

  const updateFile = useCallback(async (
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha: string
  ) => {
    return executeAction(() => githubApi!.updateFile(owner, repo, path, content, message, sha))
  }, [executeAction, githubApi])

  return {
    isAuthenticated: !!session?.accessToken,
    loading,
    error,
    getRepositories,
    getRepositoryContents,
    getFileContent,
    updateFile,
  }
}