import { useState, useCallback } from 'react'

interface Attachment {
  id: string
  filename: string
  mimetype: string
  size: number
  url: string
  extractedText?: string
}

interface GeneratedImage {
  type: 'image_url'
  image_url: {
    url: string
  }
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  attachments?: Attachment[]
  images?: GeneratedImage[]
}

interface StreamingChatState {
  messages: Message[]
  isLoading: boolean
  isStreaming: boolean
  currentStreamedContent: string
}

export function useStreamingChat(apiUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000') {
  const [state, setState] = useState<StreamingChatState>({
    messages: [],
    isLoading: false,
    isStreaming: false,
    currentStreamedContent: ''
  })

  const sendImageGenerationMessage = useCallback(async (
    content: string
  ) => {
    const response = await fetch(`${apiUrl}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: content
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate image')
    }

    setState(prev => {
      const newMessages = [...prev.messages]
      if (newMessages.length > 0) {
        const lastIndex = newMessages.length - 1
        newMessages[lastIndex] = {
          ...newMessages[lastIndex],
          content: data.message || (data.images?.length ? 'Here is your generated image.' : ''),
          images: data.images || []
        }
      }

      return {
        ...prev,
        messages: newMessages,
        isLoading: false,
        isStreaming: false,
        currentStreamedContent: data.message || ''
      }
    })
  }, [apiUrl])

  const sendMessage = useCallback(async (
    content: string,
    useStreaming: boolean = true,
    previousMessages?: Message[],
    attachments?: Attachment[],
    enableImageGeneration: boolean = false,
    model?: string,
    enableWebSearch: boolean = false
  ) => {
    if (!content.trim() || state.isLoading) return

    const baseMessages = previousMessages !== undefined ? previousMessages : state.messages

    const shouldStream = enableImageGeneration ? false : useStreaming

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      attachments: attachments
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }

    setState(prev => ({
      ...prev,
      messages: [...baseMessages, userMessage, assistantMessage],
      isLoading: true,
      isStreaming: shouldStream,
      currentStreamedContent: ''
    }))

    try {
      if (enableImageGeneration) {
        await sendImageGenerationMessage(content.trim())
      } else if (shouldStream) {
        await sendStreamingMessage(content.trim(), baseMessages, attachments, enableImageGeneration, model, enableWebSearch)
      } else {
        await sendRegularMessage(content.trim(), baseMessages, attachments, enableImageGeneration, model, enableWebSearch)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setState(prev => {
        const errorMessage: Message = {
          ...prev.messages[prev.messages.length - 1],
          content: `Error: ${error instanceof Error ? error.message : 'Something went wrong. Please check your backend is running and API key is configured.'}`
        }
        return {
          ...prev,
          messages: prev.messages.slice(0, -1).concat(errorMessage),
          isLoading: false,
          isStreaming: false,
          currentStreamedContent: ''
        }
      })
    }
  }, [state.isLoading, state.messages, apiUrl, sendImageGenerationMessage])

  const sendRegularMessage = async (
    content: string, 
    baseMessages: Message[], 
    attachments?: Attachment[],
    enableImageGeneration: boolean = false,
    model?: string,
    enableWebSearch: boolean = false
  ) => {
    const lastUserMessage: any = {
      role: 'user' as const,
      content
    }

    if (attachments && attachments.length > 0) {
      lastUserMessage.attachments = attachments
    }

    const messagesToSend = [...baseMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
      attachments: msg.attachments
    })), lastUserMessage]

    const requestBody: any = {
      messages: messagesToSend
    }

    if (enableImageGeneration) {
      requestBody.enableImageGeneration = true
      // Do NOT send a custom model when image generation is enabled; backend will select Gemini image model
    } else if (model) {
      requestBody.model = model
    }

    if (enableWebSearch) {
      requestBody.enableWebSearch = true
    }

    const response = await fetch(`${apiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get response')
    }

    setState(prev => {
      const newMessages = [...prev.messages]
      newMessages[newMessages.length - 1].content = data.message
      if (data.images) {
        newMessages[newMessages.length - 1].images = data.images
      }
      return {
        ...prev,
        messages: newMessages,
        isLoading: false,
        isStreaming: false,
        currentStreamedContent: data.message
      }
    })
  }

  const sendStreamingMessage = async (
    content: string, 
    baseMessages: Message[],
    attachments?: Attachment[],
    enableImageGeneration: boolean = false,
    model?: string,
    enableWebSearch: boolean = false
  ) => {
    const lastUserMessage: any = {
      role: 'user' as const,
      content
    }

    if (attachments && attachments.length > 0) {
      lastUserMessage.attachments = attachments
    }

    const messagesToSend = [...baseMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
      attachments: msg.attachments
    })), lastUserMessage]

    const requestBody: any = {
      messages: messagesToSend
    }

    if (enableImageGeneration) {
      requestBody.enableImageGeneration = true
      // Do NOT send a custom model when image generation is enabled; backend will select Gemini image model
    } else if (model) {
      requestBody.model = model
    }

    if (enableWebSearch) {
      requestBody.enableWebSearch = true
    }

    const response = await fetch(`${apiUrl}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to start streaming')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('No response body')
    }

    let accumulatedContent = ''
    let generatedImages: GeneratedImage[] = []
    let isDone = false

    const processStream = async () => {
      while (!isDone) {
        const { done, value } = await reader.read()

        if (done) {
          isDone = true
          break
        }

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '{"done":true}') {
              isDone = true
              break
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulatedContent += parsed.content
                setState(prev => {
                  const newMessages = [...prev.messages]
                  newMessages[newMessages.length - 1].content = accumulatedContent
                  if (generatedImages.length > 0) {
                    newMessages[newMessages.length - 1].images = generatedImages
                  }
                  return {
                    ...prev,
                    messages: newMessages,
                    currentStreamedContent: accumulatedContent,
                    isStreaming: !isDone
                  }
                })
              }
              if (parsed.images) {
                generatedImages = parsed.images
                setState(prev => {
                  const newMessages = [...prev.messages]
                  newMessages[newMessages.length - 1].images = generatedImages
                  return {
                    ...prev,
                    messages: newMessages
                  }
                })
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isStreaming: false
      }))
    }

    await processStream()
  }

  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      isStreaming: false,
      currentStreamedContent: ''
    })
  }, [])

  const loadMessages = useCallback((messages: Message[]) => {
    setState(prev => ({
      ...prev,
      messages: messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }))
  }, [])

  const updateMessage = useCallback((messageId: string, newContent: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.id === messageId ? { ...msg, content: newContent } : msg
      )
    }))
  }, [])

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    isStreaming: state.isStreaming,
    currentStreamedContent: state.currentStreamedContent,
    sendMessage,
    clearMessages,
    loadMessages,
    updateMessage
  }
}
