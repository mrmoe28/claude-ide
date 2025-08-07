import { NextRequest } from 'next/server'
import * as pty from 'node-pty'

// Store terminal sessions
const terminals = new Map<string, pty.IPty>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId') || 'default'
  
  // Get or create terminal session
  let terminal = terminals.get(sessionId)
  if (!terminal) {
    // Determine shell based on platform
    const shell = process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/zsh'
    
    terminal = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: process.env.HOME || process.cwd(),
      env: process.env
    })

    terminals.set(sessionId, terminal)
    
    // Clean up on terminal exit
    terminal.onExit(() => {
      terminals.delete(sessionId)
    })
  }

  // Create a readable stream for terminal output
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      // Store controller reference for proper cleanup
      let isClosed = false
      
      const dataHandler = (data: string) => {
        if (!isClosed) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'output', data })}\n\n`))
          } catch (error) {
            console.error('Terminal stream error:', error)
            isClosed = true
          }
        }
      }
      
      terminal.onData(dataHandler)

      // Send initial connection message
      if (!isClosed) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', sessionId })}\n\n`))
      }

      // Keep connection alive
      const keepAlive = setInterval(() => {
        if (!isClosed) {
          try {
            controller.enqueue(encoder.encode(`: keepalive\n\n`))
          } catch (error) {
            clearInterval(keepAlive)
            isClosed = true
          }
        }
      }, 30000)

      // Clean up on close
      return () => {
        isClosed = true
        clearInterval(keepAlive)
        // Note: terminal.onData cleanup is handled by the terminal instance itself
      }
    },
    cancel() {
      // Stream was cancelled/closed
      console.log('Terminal stream cancelled')
    }
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId = 'default', input, cols, rows } = await request.json()
    
    const terminal = terminals.get(sessionId)
    if (!terminal) {
      return new Response(JSON.stringify({
        error: 'Terminal session not found',
        message: 'Please refresh to create a new session'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    if (input) {
      // Send input to terminal
      terminal.write(input)
    }

    if (cols && rows) {
      // Resize terminal
      terminal.resize(cols, rows)
    }
    
    return new Response(JSON.stringify({
      success: true,
      sessionId
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Terminal POST error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to process terminal request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}