import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // For WebSocket upgrade, we need to handle this differently in Next.js
  // This is a placeholder - actual WebSocket implementation would need a custom server
  
  return new Response(JSON.stringify({ 
    error: 'WebSocket terminal not available in this environment',
    message: 'Terminal will run in local simulation mode'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { command, cwd } = await request.json()
    
    // In a real implementation, this would execute the command using node-pty
    // For now, return a simulated response
    
    const simulatedOutput = getSimulatedOutput(command, cwd)
    
    return new Response(JSON.stringify({
      output: simulatedOutput,
      exitCode: 0
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to execute command',
      exitCode: 1
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

function getSimulatedOutput(command: string, cwd?: string): string {
  const cmd = command.toLowerCase().trim()
  
  switch (cmd) {
    case 'ls':
    case 'll':
      return `total 8
drwxr-xr-x  3 user  staff   96 Jan  1 12:00 node_modules
-rw-r--r--  1 user  staff  123 Jan  1 12:00 package.json  
-rw-r--r--  1 user  staff   45 Jan  1 12:00 README.md
drwxr-xr-x  3 user  staff   96 Jan  1 12:00 src`
    
    case 'pwd':
      return cwd || '/Users/user/project'
    
    case 'whoami':
      return process.env.USER || 'user'
    
    case 'date':
      return new Date().toString()
    
    default:
      if (cmd.startsWith('echo ')) {
        return command.slice(5)
      }
      return `zsh: command not found: ${command}`
  }
}