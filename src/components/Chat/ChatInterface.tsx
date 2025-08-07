'use client'

import { useState, useRef, useEffect } from 'react'
import { Message } from './Message'
import { ChatInput } from './ChatInput'
import dynamic from 'next/dynamic'

const Terminal = dynamic(
  () => import('@/components/Terminal/Terminal').then(mod => ({ default: mod.Terminal })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-900 flex items-center justify-center text-white">
        Loading terminal...
      </div>
    )
  }
)
import { useClaudeCode } from '@/hooks/useClaudeCode'
import { MessageSquare, Loader2, Terminal as TerminalIcon } from 'lucide-react'

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
  workingDirectory?: string
}

export function ChatInterface({ currentFile, repositoryContext, workingDirectory }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [showTerminal, setShowTerminal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<any>(null)
  const { session, startSession, sendMessage } = useClaudeCode()

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

    try {
      // Start Claude Code session if not already active
      if (!session.isActive && !session.isLoading) {
        setShowTerminal(true)
        await startSession(workingDirectory)
        
        // Initialize terminal with Claude Code
        if (terminalRef.current) {
          terminalRef.current.writeLine('Starting Claude Code CLI...')
          terminalRef.current.writeLine('✓ Connected to Claude Code')
          if (workingDirectory) {
            terminalRef.current.writeLine(`Working directory: ${workingDirectory}`)
          }
          terminalRef.current.writeLine('Ready for your questions!')
          terminalRef.current.writeToTerminal('claude> ')
        }
      }

      // Display user input in terminal
      if (terminalRef.current && session.isActive) {
        terminalRef.current.writeLine(content)
        terminalRef.current.writeLine('Processing...')
      }

      // Send message to Claude Code CLI
      const response = await sendMessage(content, {
        currentFile,
        workingDirectory
      })

      // Display response in terminal
      if (terminalRef.current && session.isActive) {
        terminalRef.current.writeLine('')
        terminalRef.current.writeLine(response.content)
        terminalRef.current.writeLine('')
        terminalRef.current.writeToTerminal('claude> ')
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
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
    }
  }

  const handleTerminalCommand = (command: string) => {
    // Handle terminal commands if needed
    console.log('Terminal command:', command)
  }

  const handleTerminalOutput = (data: string) => {
    // Handle terminal output if needed
    console.log('Terminal output:', data)
  }

  return (
    <div className="flex flex-col h-full bg-light-bg-primary dark:bg-dark-bg-primary">
      {/* Header */}
      <div className="p-4 border-b border-light-border-primary dark:border-dark-border-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-light-accent-primary dark:text-dark-accent-primary" />
            <h2 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
              Chat with Claude Code
            </h2>
            {session.isActive && (
              <span className="text-xs text-green-500 px-2 py-1 bg-green-100 dark:bg-green-900/20 rounded">
                CLI Active
              </span>
            )}
            {currentFile && (
              <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary px-2 py-1 
                             bg-light-bg-secondary dark:bg-dark-bg-secondary rounded">
                {currentFile.path}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className="flex items-center gap-1 px-2 py-1 text-xs
                     text-light-text-secondary dark:text-dark-text-secondary
                     hover:text-light-text-primary dark:hover:text-dark-text-primary
                     hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary
                     rounded transition-colors"
          >
            <TerminalIcon size={14} />
            {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className={`${showTerminal ? 'flex-1' : 'flex-1'} overflow-y-auto`}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center max-w-md">
                <MessageSquare className="mx-auto mb-4 text-light-text-muted dark:text-dark-text-muted" size={48} />
                <h3 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Welcome to Claude Code IDE
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                  Select a folder and file to start chatting with Claude Code CLI, or ask me any questions!
                </p>
                {workingDirectory && (
                  <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                    Working directory: {workingDirectory}
                  </p>
                )}
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
              {session.isLoading && (
                <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary flex items-center justify-center">
                    <Loader2 className="animate-spin" size={16} />
                  </div>
                  <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Claude Code is processing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Terminal */}
        {showTerminal && (
          <div className="h-64 border-t border-light-border-primary dark:border-dark-border-primary">
            <Terminal
              onOutput={handleTerminalOutput}
              onCommand={handleTerminalCommand}
              ref={terminalRef}
              className="h-full"
            />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} disabled={session.isLoading} />
    </div>
  )
}