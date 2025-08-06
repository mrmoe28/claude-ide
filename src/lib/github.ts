import { Octokit } from "@octokit/rest"

export class GitHubAPI {
  private octokit: Octokit

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    })
  }

  async getRepositories() {
    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 50,
      })
      return data
    } catch (error) {
      console.error('Error fetching repositories:', error)
      throw error
    }
  }

  async getRepositoryContents(owner: string, repo: string, path: string = '') {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      })
      return data
    } catch (error) {
      console.error('Error fetching repository contents:', error)
      throw error
    }
  }

  async getFileContent(owner: string, repo: string, path: string) {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      })
      
      if ('content' in data) {
        return {
          content: Buffer.from(data.content, 'base64').toString('utf8'),
          sha: data.sha,
        }
      }
      throw new Error('File not found')
    } catch (error) {
      console.error('Error fetching file content:', error)
      throw error
    }
  }

  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha: string
  ) {
    try {
      const { data } = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        sha,
      })
      return data
    } catch (error) {
      console.error('Error updating file:', error)
      throw error
    }
  }
}