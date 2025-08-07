'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Sidebar } from '@/components/FileExplorer/Sidebar'
import { CodeEditor } from '@/components/Editor/CodeEditor'
import { ChatPanel } from '@/components/Chat/ChatPanel'
import { TerminalIcon, MessageSquare, X, Minimize2, Square } from 'lucide-react'

const MacTerminal = dynamic(
  () => import('@/components/Terminal/MacTerminal').then(mod => ({ default: mod.MacTerminal })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </div>
    )
  }
)

interface WindowManagerProps {
  currentFile?: {
    path: string
    content: string
  }
  onFileSelect: (path: string, content: string) => void
  workingDirectory?: string
}

export function WindowManager({ currentFile, onFileSelect, workingDirectory }: WindowManagerProps) {
  const [showTerminal, setShowTerminal] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [terminalMinimized, setTerminalMinimized] = useState(false)
  const [chatMinimized, setChatMinimized] = useState(false)

  return (
    <div className="h-full flex flex-col">
      {/* Main Content Area */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - File Explorer */}
        <Panel defaultSize={20} minSize={15} maxSize={35}>
          <div className="h-full border-r border-light-border-primary dark:border-dark-border-primary">
            <div className="flex items-center justify-between p-2 border-b border-light-border-primary dark:border-dark-border-primary bg-light-bg-secondary dark:bg-dark-bg-secondary">
              <h3 className="text-xs font-medium text-light-text-primary dark:text-dark-text-primary">
                EXPLORER
              </h3>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">
                  <Minimize2 size={12} className="text-light-text-muted dark:text-dark-text-muted" />
                </button>
              </div>
            </div>
            <Sidebar
              onFileSelect={onFileSelect}
              selectedFile={currentFile?.path}
            />
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-light-border-primary dark:bg-dark-border-primary hover:bg-blue-500 transition-colors" />

        {/* Center Panel - Code Editor */}
        <Panel defaultSize={showChat ? 55 : 75} minSize={30}>
          <div className="h-full">
            <div className="flex items-center justify-between p-2 border-b border-light-border-primary dark:border-dark-border-primary bg-light-bg-secondary dark:bg-dark-bg-secondary">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-light-text-primary dark:text-dark-text-primary">
                  {currentFile?.path || 'No file selected'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setShowTerminal(!showTerminal)}
                  className={`p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary ${
                    showTerminal ? 'bg-blue-100 dark:bg-blue-900' : ''
                  }`}
                  title="Toggle Terminal"
                >
                  <TerminalIcon size={14} className="text-light-text-muted dark:text-dark-text-muted" />
                </button>
                <button 
                  onClick={() => setShowChat(!showChat)}
                  className={`p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary ${
                    showChat ? 'bg-blue-100 dark:bg-blue-900' : ''
                  }`}
                  title="Toggle Chat"
                >
                  <MessageSquare size={14} className="text-light-text-muted dark:text-dark-text-muted" />
                </button>
              </div>
            </div>
            
            {showTerminal ? (
              <PanelGroup direction="vertical">
                <Panel defaultSize={terminalMinimized ? 90 : 65} minSize={30}>
                  <CodeEditor 
                    file={currentFile}
                    onFileChange={(content) => {
                      if (currentFile) {
                        onFileSelect(currentFile.path, content)
                      }
                    }}
                  />
                </Panel>
                
                <PanelResizeHandle className="h-1 bg-light-border-primary dark:bg-dark-border-primary hover:bg-blue-500 transition-colors" />
                
                <Panel defaultSize={terminalMinimized ? 10 : 35} minSize={10}>
                  <div className="h-full">
                    <div className="flex items-center justify-between p-2 border-b border-light-border-primary dark:border-dark-border-primary bg-light-bg-secondary dark:bg-dark-bg-secondary">
                      <h3 className="text-xs font-medium text-light-text-primary dark:text-dark-text-primary">
                        TERMINAL
                      </h3>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setTerminalMinimized(!terminalMinimized)}
                          className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
                        >
                          {terminalMinimized ? (
                            <Square size={12} className="text-light-text-muted dark:text-dark-text-muted" />
                          ) : (
                            <Minimize2 size={12} className="text-light-text-muted dark:text-dark-text-muted" />
                          )}
                        </button>
                        <button 
                          onClick={() => setShowTerminal(false)}
                          className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
                        >
                          <X size={12} className="text-light-text-muted dark:text-dark-text-muted" />
                        </button>
                      </div>
                    </div>
                    {!terminalMinimized && (
                      <MacTerminal workingDirectory={workingDirectory} />
                    )}
                  </div>
                </Panel>
              </PanelGroup>
            ) : (
              <CodeEditor 
                file={currentFile}
                onFileChange={(content) => {
                  if (currentFile) {
                    onFileSelect(currentFile.path, content)
                  }
                }}
              />
            )}
          </div>
        </Panel>

        {/* Right Panel - Chat */}
        {showChat && (
          <>
            <PanelResizeHandle className="w-1 bg-light-border-primary dark:bg-dark-border-primary hover:bg-blue-500 transition-colors" />
            <Panel defaultSize={25} minSize={20} maxSize={40}>
              <div className="h-full border-l border-light-border-primary dark:border-dark-border-primary">
                <div className="flex items-center justify-between p-2 border-b border-light-border-primary dark:border-dark-border-primary bg-light-bg-secondary dark:bg-dark-bg-secondary">
                  <h3 className="text-xs font-medium text-light-text-primary dark:text-dark-text-primary">
                    AI ASSISTANT
                  </h3>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setChatMinimized(!chatMinimized)}
                      className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
                    >
                      {chatMinimized ? (
                        <Square size={12} className="text-light-text-muted dark:text-dark-text-muted" />
                      ) : (
                        <Minimize2 size={12} className="text-light-text-muted dark:text-dark-text-muted" />
                      )}
                    </button>
                    <button 
                      onClick={() => setShowChat(false)}
                      className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
                    >
                      <X size={12} className="text-light-text-muted dark:text-dark-text-muted" />
                    </button>
                  </div>
                </div>
                {!chatMinimized && (
                  <ChatPanel 
                    currentFile={currentFile}
                    workingDirectory={workingDirectory}
                  />
                )}
              </div>
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  )
}