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
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

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

    // Connect to terminal WebSocket API
    const connectToTerminal = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const ws = new WebSocket(`${protocol}//${window.location.host}/api/terminal`)
        
        ws.onopen = () => {
          setIsConnected(true)
          wsRef.current = ws
          
          // Initialize terminal with working directory
          if (workingDirectory) {
            ws.send(JSON.stringify({ 
              type: 'input', 
              data: `cd "${workingDirectory}"\n` 
            }))
          }
        }

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data)
          if (message.type === 'output') {
            terminal.write(message.data)
          }
        }

        ws.onclose = () => {
          setIsConnected(false)
          terminal.write('\r\n\x1b[31mTerminal connection closed. Please refresh to reconnect.\x1b[0m\r\n')
        }

        ws.onerror = () => {
          setIsConnected(false)
          terminal.write('\r\n\x1b[31mFailed to connect to terminal. Starting local session...\x1b[0m\r\n')
          startLocalTerminal(terminal)
        }

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error)
        setIsConnected(false)
        startLocalTerminal(terminal)
      }
    }

    // Fallback to local terminal simulation
    const startLocalTerminal = (term: Terminal) => {
      const prompt = `\x1b[32m➜\x1b[0m \x1b[36m${workingDirectory?.split('/').pop() || '~'}\x1b[0m `
      term.write(`\r\nWelcome to MacTerminal\r\n`)
      term.write(`${prompt}`)
      
      let currentLine = ''
      
      term.onKey(({ key, domEvent }) => {
        if (domEvent.keyCode === 13) { // Enter
          term.write(`\r\n`)
          
          if (currentLine.trim()) {
            // Simple command simulation
            simulateCommand(term, currentLine.trim(), workingDirectory)
          }
          
          currentLine = ''
          term.write(`${prompt}`)
        } else if (domEvent.keyCode === 8) { // Backspace
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1)
            term.write('\b \b')
          }
        } else if (domEvent.keyCode === 9) { // Tab
          // Tab completion could be implemented here
          domEvent.preventDefault()
        } else if (key.length === 1) {
          currentLine += key
          term.write(key)
        }
      })
    }

    // Handle input from terminal
    terminal.onData((data) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'input', data }))
      }
    })

    // Try to connect to WebSocket, fallback to local
    connectToTerminal()

    // Handle resize
    const handleResize = () => {
      if (fitAddon) {
        fitAddon.fit()
        
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'resize',
            cols: terminal.cols,
            rows: terminal.rows
          }))
        }
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (wsRef.current) {
        wsRef.current.close()
      }
      terminal.dispose()
    }
  }, [workingDirectory])

  // Simple command simulation for fallback
  const simulateCommand = (term: Terminal, command: string, cwd?: string) => {
    const cmd = command.toLowerCase().trim()
    
    switch (cmd) {
      case 'ls':
      case 'll':
        term.write(`total 8\r\n`)
        term.write(`drwxr-xr-x  3 user  staff   96 Jan  1 12:00 \x1b[34mnode_modules\x1b[0m\r\n`)
        term.write(`-rw-r--r--  1 user  staff  123 Jan  1 12:00 package.json\r\n`)
        term.write(`-rw-r--r--  1 user  staff   45 Jan  1 12:00 README.md\r\n`)
        term.write(`drwxr-xr-x  3 user  staff   96 Jan  1 12:00 \x1b[34msrc\x1b[0m\r\n`)
        break
      case 'pwd':
        term.write(`${cwd || '/Users/user/project'}\r\n`)
        break
      case 'whoami':
        term.write(`${process.env.USER || 'user'}\r\n`)
        break
      case 'date':
        term.write(`${new Date().toString()}\r\n`)
        break
      case 'clear':
        term.clear()
        break
      case '':
        break
      default:
        if (cmd.startsWith('cd ')) {
          term.write(`\r\n`) // Just acknowledge cd for now
        } else if (cmd.startsWith('echo ')) {
          term.write(`${command.slice(5)}\r\n`)
        } else {
          term.write(`zsh: command not found: ${command}\r\n`)
        }
        break
    }
  }

  return (
    <div className={`h-full w-full ${className}`}>
      {!isConnected && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded">
            Local Mode
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