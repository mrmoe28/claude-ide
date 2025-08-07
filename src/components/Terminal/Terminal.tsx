'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'

interface TerminalProps {
  onOutput?: (data: string) => void
  onCommand?: (command: string) => void
  className?: string
}

interface TerminalRef {
  writeToTerminal: (text: string) => void
  writeLine: (text: string) => void
  clear: () => void
  executeCommand: (command: string) => Promise<void>
}

export const Terminal = forwardRef<TerminalRef, TerminalProps>(({ onOutput, onCommand, className = '' }, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !terminalRef.current) return

    // Create terminal instance
    const terminal = new XTerm({
      theme: {
        background: '#1a1a1a',
        foreground: '#ffffff',
        cursor: '#ffffff',
      },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      cursorBlink: true,
      allowTransparency: true,
    })

    // Create addons
    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    // Load addons
    terminal.loadAddon(fitAddon)
    terminal.loadAddon(webLinksAddon)

    // Open terminal
    terminal.open(terminalRef.current)
    fitAddon.fit()

    // Store references
    xtermRef.current = terminal
    fitAddonRef.current = fitAddon

    // Handle data output
    terminal.onData((data) => {
      onOutput?.(data)
    })

    // Welcome message
    terminal.write('\r\n\x1b[1;32mClaude Code IDE Terminal\x1b[0m\r\n')
    terminal.write('Initializing Claude Code CLI...\r\n\r\n')

    setIsReady(true)

    // Handle resize
    const handleResize = () => {
      fitAddon.fit()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      terminal.dispose()
    }
  }, [onOutput])

  const writeToTerminal = useCallback((text: string) => {
    if (xtermRef.current) {
      xtermRef.current.write(text)
    }
  }, [])

  const writeLine = useCallback((text: string) => {
    writeToTerminal(text + '\r\n')
  }, [writeToTerminal])

  const clear = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.clear()
    }
  }, [])

  const executeCommand = useCallback(async (command: string) => {
    if (!xtermRef.current) return

    // Write command to terminal
    writeLine(`$ ${command}`)
    
    // Simulate command execution for now
    // In real implementation, this would execute the actual command
    onCommand?.(command)
    
    if (command.includes('claude-code')) {
      writeLine('Starting Claude Code CLI...')
      // Simulate Claude Code startup
      setTimeout(() => {
        writeLine('✓ Claude Code CLI ready')
        writeLine('Type your questions or commands below:')
        writeToTerminal('claude> ')
      }, 1000)
    }
  }, [writeLine, writeToTerminal, onCommand])

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    writeToTerminal,
    writeLine,
    clear,
    executeCommand
  }), [writeToTerminal, writeLine, clear, executeCommand])

  return (
    <div className={`h-full w-full ${className}`}>
      <div 
        ref={terminalRef} 
        className="h-full w-full"
        style={{ 
          minHeight: '200px',
          background: '#1a1a1a'
        }}
      />
    </div>
  )
})

Terminal.displayName = 'Terminal'