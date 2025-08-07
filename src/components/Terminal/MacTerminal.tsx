'use client'

import { useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'

interface MacTerminalProps {
  workingDirectory?: string
  className?: string
}

export function MacTerminal({ workingDirectory, className = '' }: MacTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !terminalRef.current) return

    // Create terminal instance with Mac-like theme
    const terminal = new Terminal({
      theme: {
        background: '#1d1f21',
        foreground: '#c5c8c6',
        cursor: '#c5c8c6',
        black: '#282a2e',
        red: '#a54242',
        green: '#8c9440',
        yellow: '#de935f',
        blue: '#5f819d',
        magenta: '#85678f',
        cyan: '#5e8d87',
        white: '#707880',
        brightBlack: '#373b41',
        brightRed: '#cc6666',
        brightGreen: '#b5bd68',
        brightYellow: '#f0c674',
        brightBlue: '#81a2be',
        brightMagenta: '#b294bb',
        brightCyan: '#8abeb7',
        brightWhite: '#c5c8c6'
      },
      fontFamily: 'SF Mono, Monaco, Menlo, "Ubuntu Mono", monospace',
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'bar',
      allowTransparency: false,
      rows: 24,
      cols: 120,
      scrollback: 1000
    })

    // Create and attach addons
    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()
    
    terminal.loadAddon(fitAddon)
    terminal.loadAddon(webLinksAddon)

    // Open terminal in the container
    terminal.open(terminalRef.current)
    
    // Store references
    xtermRef.current = terminal
    fitAddonRef.current = fitAddon

    // Fit terminal to container
    fitAddon.fit()

    // Connect to terminal streaming API
    const connectToTerminal = () => {
      try {
        const eventSource = new EventSource(`/api/terminal?sessionId=${sessionId}`)
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          setIsConnected(true)
          terminal.write('\r\n\x1b[32mConnected to real Mac terminal\x1b[0m\r\n')
          
          // Initialize terminal with working directory if provided
          if (workingDirectory) {
            sendInput(`cd "${workingDirectory}"\r`)
          }
        }

        eventSource.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            if (message.type === 'output') {
              terminal.write(message.data)
            } else if (message.type === 'connected') {
              console.log('Terminal session connected:', message.sessionId)
            }
          } catch (error) {
            console.error('Failed to parse terminal message:', error)
          }
        }

        eventSource.onerror = () => {
          setIsConnected(false)
          eventSource.close()
          terminal.write('\r\n\x1b[31mTerminal connection lost. Please refresh to reconnect.\x1b[0m\r\n')
        }

      } catch (error) {
        console.error('Failed to create EventSource connection:', error)
        setIsConnected(false)
        terminal.write('\r\n\x1b[31mFailed to connect to terminal backend.\x1b[0m\r\n')
      }
    }

    // Send input to terminal
    const sendInput = async (data: string) => {
      try {
        await fetch('/api/terminal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            input: data
          })
        })
      } catch (error) {
        console.error('Failed to send input to terminal:', error)
      }
    }

    // Send resize command to terminal
    const resizeTerminal = async (cols: number, rows: number) => {
      try {
        await fetch('/api/terminal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            cols,
            rows
          })
        })
      } catch (error) {
        console.error('Failed to resize terminal:', error)
      }
    }


    // Handle input from terminal
    terminal.onData((data) => {
      if (isConnected) {
        sendInput(data)
      }
    })

    // Connect to terminal
    connectToTerminal()

    // Handle resize
    const handleResize = () => {
      if (fitAddon) {
        fitAddon.fit()
        
        if (isConnected) {
          resizeTerminal(terminal.cols, terminal.rows)
        }
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      terminal.dispose()
    }
  }, [workingDirectory, sessionId, isConnected])

  return (
    <div className={`h-full w-full ${className}`}>
      {!isConnected && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Connecting...
          </div>
        </div>
      )}
      {isConnected && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            Real Terminal
          </div>
        </div>
      )}
      <div 
        ref={terminalRef} 
        className="h-full w-full"
        style={{ 
          minHeight: '200px',
          background: '#1d1f21'
        }}
      />
    </div>
  )
}