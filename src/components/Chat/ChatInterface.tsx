'use client'

import { useState, useRef, useEffect } from 'react'
import { Message } from './Message'
import { ChatInput } from './ChatInput'
import { MessageSquare, Loader2 } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  currentFile?: {
    path: string
    content: string
  }
  repositoryContext?: {
    owner: string
    name: string
  }
}

export function ChatInterface({ currentFile, repositoryContext }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Here you would integrate with your Claude API
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000))

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(content, currentFile, repositoryContext),
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockResponse = (
    userMessage: string, 
    file?: { path: string; content: string },
    repo?: { owner: string; name: string }
  ): string => {
    if (file) {
      return `I can see you're working with \`${file.path}\`. ${
        file.path.endsWith('.tsx') || file.path.endsWith('.ts') 
          ? 'This appears to be a TypeScript React file. ' 
          : file.path.endsWith('.js') || file.path.endsWith('.jsx')
          ? 'This appears to be a JavaScript React file. '
          : 'This file contains: '
      }

Based on your question "${userMessage}", I can help you analyze the code, suggest improvements, or explain how it works. 

What specific aspect would you like me to focus on?`
    }

    if (repo) {
      return `I can see you're working in the **${repo.name}** repository by ${repo.owner}. 

Regarding "${userMessage}", I'd be happy to help! I can:
- Analyze code files and suggest improvements
- Help debug issues
- Explain code functionality  
- Suggest best practices
- Help with documentation

Please select a file from the sidebar or ask me a specific question about your project.`
    }

    return `Hello! I'm Claude, your AI coding assistant. I can help you with:

- Code analysis and review
- Debugging and troubleshooting  
- Best practices and optimization
- Documentation and explanations
- Architecture suggestions

Please select a repository and file from the sidebar, or ask me any coding questions!`
  }

  return (
    <div className="flex flex-col h-full bg-light-bg-primary dark:bg-dark-bg-primary">
      {/* Header */}
      <div className="p-4 border-b border-light-border-primary dark:border-dark-border-primary">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-light-accent-primary dark:text-dark-accent-primary" />
          <h2 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
            Chat with Claude
          </h2>
          {currentFile && (
            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary px-2 py-1 
                           bg-light-bg-secondary dark:bg-dark-bg-secondary rounded">
              {currentFile.path}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              <MessageSquare className="mx-auto mb-4 text-light-text-muted dark:text-dark-text-muted" size={48} />
              <h3 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                Welcome to Claude Code IDE
              </h3>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                Select a repository and file to start chatting about your code, or ask me any questions!
              </p>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <Message
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary flex items-center justify-center">
                  <Loader2 className="animate-spin" size={16} />
                </div>
                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Claude is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  )
}