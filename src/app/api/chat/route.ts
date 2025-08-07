import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      )
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const systemMessage = {
      role: 'system',
      content: `You are an expert programming assistant integrated into a VS Code-like IDE. You help developers with:

- Code analysis and review
- Debugging and troubleshooting 
- Best practices and optimization
- Architecture suggestions
- Documentation and explanations
- Language-specific guidance

When users share code files, provide specific, actionable feedback. Be concise but thorough.
Format code snippets with proper markdown syntax highlighting.
If you see file paths in the context, refer to specific files and line numbers when relevant.`
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [systemMessage, ...messages],
      max_tokens: 2000,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    const responseContent = completion.choices[0]?.message?.content
    
    if (!responseContent) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      content: responseContent,
      usage: completion.usage
    })

  } catch (error) {
    console.error('OpenAI API error:', error)
    
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { 
          error: `OpenAI API error: ${error.message}`,
          code: error.code,
          type: error.type 
        },
        { status: error.status || 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}